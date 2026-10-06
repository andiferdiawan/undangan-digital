-- Analitik link reseller (gaya affiliate): link pelacakan per reseller, klik per link, dan atribusi penjualan.
--   /r/KODE          → link utama (link_id null)
--   /r/KODE/slug     → link pelacakan dengan label & halaman tujuan sendiri
--   ?ref=KODE        → klik lewat parameter di URL mana pun (kind = 'param')
-- Pesanan menyimpan link terakhir yang diklik pembeli (last click, cookie 30 hari).

create table if not exists public.reseller_links (
  id uuid primary key default gen_random_uuid(),
  reseller_id uuid not null references public.resellers (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 40),
  label text not null check (char_length(btrim(label)) between 2 and 60),
  target_path text not null default '/' check (target_path ~ '^/[A-Za-z0-9/_.~%-]*$' and char_length(target_path) <= 200),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (reseller_id, slug)
);

alter table public.reseller_links enable row level security;
drop policy if exists "reseller_links: pemilik kelola" on public.reseller_links;
create policy "reseller_links: pemilik kelola" on public.reseller_links for all to authenticated
  using (reseller_id = (select auth.uid()) or (select public.is_admin()))
  with check (reseller_id = (select auth.uid()) and exists (select 1 from public.resellers r where r.id = (select auth.uid()) and r.status = 'active'));
revoke all on public.reseller_links from anon;

create table if not exists public.referral_clicks (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  reseller_id uuid not null references public.resellers (id) on delete cascade,
  link_id uuid references public.reseller_links (id) on delete set null,
  kind text not null default 'link' check (kind in ('link', 'param')),
  landing text check (char_length(landing) <= 200),
  source text check (source in ('organik', 'iklan', 'sosial', 'referral', 'langsung')),
  referrer_host text check (char_length(referrer_host) <= 120),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  country text check (char_length(country) <= 2),
  visitor text not null check (char_length(visitor) <= 64)
);
create index if not exists referral_clicks_reseller_idx on public.referral_clicks (reseller_id, at desc);

alter table public.referral_clicks enable row level security;
drop policy if exists "referral_clicks: pemilik baca" on public.referral_clicks;
create policy "referral_clicks: pemilik baca" on public.referral_clicks for select to authenticated
  using (reseller_id = (select auth.uid()) or (select public.is_admin()));
revoke insert, update, delete on public.referral_clicks from anon, authenticated;

alter table public.orders add column if not exists ref_link_id uuid references public.reseller_links (id) on delete set null;

-- Catat klik (dipanggil server). Mengembalikan tujuan redirect + id link, atau null bila kode tidak aktif.
create or replace function public.server_ref_click(p_secret text, p_code text, p_slug text, p_click jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reseller uuid;
  l public.reseller_links;
begin
  perform private.assert_server(p_secret);
  select id into v_reseller from public.resellers where code = upper(p_code) and status = 'active';
  if v_reseller is null then return null; end if;
  if nullif(p_slug, '') is not null then
    select * into l from public.reseller_links where reseller_id = v_reseller and slug = lower(p_slug) and is_active;
  end if;
  if coalesce((p_click->>'record')::boolean, true) then
    insert into public.referral_clicks (reseller_id, link_id, kind, landing, source, referrer_host, device, country, visitor)
    values (
      v_reseller, l.id, case when p_click->>'kind' = 'param' then 'param' else 'link' end,
      left(coalesce(nullif(p_click->>'landing', ''), l.target_path, '/'), 200),
      case when p_click->>'source' in ('organik', 'iklan', 'sosial', 'referral', 'langsung') then p_click->>'source' end,
      left(nullif(p_click->>'referrer_host', ''), 120),
      case when p_click->>'device' in ('mobile', 'tablet', 'desktop') then p_click->>'device' end,
      left(nullif(p_click->>'country', ''), 2), left(coalesce(p_click->>'visitor', ''), 64)
    );
  end if;
  return jsonb_build_object('code', upper(p_code), 'link_id', l.id, 'target', coalesce(l.target_path, '/'));
end;
$$;
revoke all on function public.server_ref_click(text, text, text, jsonb) from public;
grant execute on function public.server_ref_click(text, text, text, jsonb) to anon, authenticated;

-- Tandai link asal pesanan (hanya bila link milik reseller pesanan itu & pesanan bukan dibuat manual oleh reseller)
create or replace function public.server_order_ref_link(p_secret text, p_order_id uuid, p_link_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_server(p_secret);
  update public.orders o set ref_link_id = p_link_id
  where o.id = p_order_id and o.created_by is null
    and o.reseller_id = (select reseller_id from public.reseller_links where id = p_link_id);
end;
$$;
revoke all on function public.server_order_ref_link(text, uuid, uuid) from public;
grant execute on function public.server_order_ref_link(text, uuid, uuid) to anon, authenticated;

-- Statistik link untuk reseller yang login (admin boleh melihat reseller lain lewat p_reseller)
create or replace function public.reseller_link_stats(p_days integer default 30, p_reseller uuid default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_res uuid;
  v_days int := greatest(1, least(coalesce(p_days, 30), 400));
  v_from timestamptz;
begin
  if p_reseller is not null and public.is_admin() then v_res := p_reseller;
  else v_res := v_uid;
  end if;
  if v_res is null or not exists (select 1 from public.resellers where id = v_res) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  v_from := date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta' - make_interval(days => v_days - 1);

  return (
    with c as (select * from public.referral_clicks where reseller_id = v_res and at >= v_from),
    o as (
      select * from public.orders
      where reseller_id = v_res and created_by is null and created_at >= v_from
    ),
    per_link as (
      select k.link_id,
             coalesce(k.clicks, 0) as clicks, coalesce(k.visitors, 0) as visitors,
             coalesce(x.orders, 0) as orders, coalesce(x.paid, 0) as paid,
             coalesce(x.revenue, 0) as revenue, coalesce(x.commission, 0) as commission
      from (
        select link_id, count(*) as clicks, count(distinct visitor || (at at time zone 'Asia/Jakarta')::date) as visitors
        from c group by link_id
      ) as k
      full join (
        select ref_link_id as link_id, count(*) as orders, count(*) filter (where status = 'paid') as paid,
               coalesce(sum(amount) filter (where status = 'paid'), 0) as revenue,
               coalesce(sum(reseller_share) filter (where status = 'paid'), 0) as commission
        from o group by ref_link_id
      ) as x on x.link_id is not distinct from k.link_id
    )
    select jsonb_build_object(
      'days', v_days,
      'code', (select code from public.resellers where id = v_res),
      'totals', jsonb_build_object(
        'clicks', (select count(*) from c),
        'visitors', (select count(distinct visitor || (at at time zone 'Asia/Jakarta')::date) from c),
        'orders', (select count(*) from o),
        'paid', (select count(*) from o where status = 'paid'),
        'revenue', (select coalesce(sum(amount), 0) from o where status = 'paid'),
        'commission', (select coalesce(sum(reseller_share), 0) from o where status = 'paid')
      ),
      'daily', coalesce((
        select jsonb_agg(jsonb_build_object('day', d::date, 'clicks', coalesce(k.n, 0), 'paid', coalesce(p.n, 0)) order by d)
        from generate_series((v_from at time zone 'Asia/Jakarta')::date, (now() at time zone 'Asia/Jakarta')::date, interval '1 day') as d
        left join (select (at at time zone 'Asia/Jakarta')::date as day, count(*) as n from c group by 1) as k on k.day = d::date
        left join (select (coalesce(paid_at, created_at) at time zone 'Asia/Jakarta')::date as day, count(*) as n from o where status = 'paid' group by 1) as p on p.day = d::date
      ), '[]'),
      -- Semua link milik reseller (termasuk yang belum diklik) + baris "link utama" (link_id null)
      'links', coalesce((
        select jsonb_agg(jsonb_build_object(
          'id', l.id, 'slug', l.slug, 'label', l.label, 'target_path', l.target_path, 'is_active', l.is_active, 'created_at', l.created_at,
          'clicks', coalesce(s.clicks, 0), 'visitors', coalesce(s.visitors, 0), 'orders', coalesce(s.orders, 0),
          'paid', coalesce(s.paid, 0), 'revenue', coalesce(s.revenue, 0), 'commission', coalesce(s.commission, 0)
        ) order by l.created_at)
        from public.reseller_links l left join per_link s on s.link_id = l.id
        where l.reseller_id = v_res
      ), '[]'),
      'main', (select jsonb_build_object('clicks', coalesce(sum(clicks), 0), 'visitors', coalesce(sum(visitors), 0), 'orders', coalesce(sum(orders), 0),
          'paid', coalesce(sum(paid), 0), 'revenue', coalesce(sum(revenue), 0), 'commission', coalesce(sum(commission), 0)) from per_link where link_id is null),
      'sources', coalesce((select jsonb_agg(jsonb_build_object('source', coalesce(source, 'langsung'), 'clicks', n) order by n desc)
        from (select source, count(*) as n from c group by source) as s), '[]'),
      'referrers', coalesce((select jsonb_agg(jsonb_build_object('host', referrer_host, 'clicks', n) order by n desc)
        from (select referrer_host, count(*) as n from c where referrer_host is not null group by referrer_host order by n desc limit 15) as r), '[]'),
      'landings', coalesce((select jsonb_agg(jsonb_build_object('path', landing, 'clicks', n) order by n desc)
        from (select landing, count(*) as n from c where landing is not null group by landing order by n desc limit 15) as g), '[]'),
      'devices', coalesce((select jsonb_object_agg(coalesce(device, 'lainnya'), n) from (select device, count(*) as n from c group by device) as d), '{}'),
      'recent_sales', coalesce((
        select jsonb_agg(jsonb_build_object('at', coalesce(o2.paid_at, o2.created_at), 'amount', o2.amount, 'commission', o2.reseller_share,
          'link', coalesce(l.label, 'Link utama'), 'theme', t.name) order by coalesce(o2.paid_at, o2.created_at) desc)
        from (select * from o where status = 'paid' order by coalesce(paid_at, created_at) desc limit 10) as o2
        left join public.reseller_links l on l.id = o2.ref_link_id
        left join public.themes t on t.id = o2.theme_id
      ), '[]')
    )
  );
end;
$$;
revoke all on function public.reseller_link_stats(integer, uuid) from public, anon;
grant execute on function public.reseller_link_stats(integer, uuid) to authenticated;

notify pgrst, 'reload schema';
