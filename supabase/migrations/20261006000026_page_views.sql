-- Analitik trafik halaman publik (tanpa cookie, tanpa menyimpan IP).
-- Setiap kunjungan halaman publik dicatat server: jenis halaman, sumber trafik sesi (organik/iklan/sosial/
-- referral/langsung), mesin pencari/referrer, kampanye UTM, perangkat, negara, dan hash pengunjung harian
-- (sha256 IP+UA+tanggal+secret) untuk menghitung pengunjung unik.

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  path text not null check (char_length(path) between 1 and 300),
  page_type text not null check (page_type in ('beranda', 'katalog', 'tema', 'pratinjau', 'blog', 'artikel', 'undangan', 'reseller', 'halaman', 'lainnya')),
  -- Sumber trafik sesi (diatribusikan dari halaman masuk pertama)
  source text not null check (source in ('organik', 'iklan', 'sosial', 'referral', 'langsung')),
  -- true = halaman masuk (landing) sesi tsb.
  is_entry boolean not null default false,
  referrer_host text check (char_length(referrer_host) <= 120),
  engine text check (char_length(engine) <= 40),
  utm_source text check (char_length(utm_source) <= 80),
  utm_medium text check (char_length(utm_medium) <= 80),
  utm_campaign text check (char_length(utm_campaign) <= 120),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  country text check (char_length(country) <= 2),
  visitor text not null check (char_length(visitor) <= 64)
);
create index if not exists page_views_at_idx on public.page_views (at desc);
create index if not exists page_views_path_idx on public.page_views (path, at desc);

alter table public.page_views enable row level security;
drop policy if exists "page_views: admin baca" on public.page_views;
create policy "page_views: admin baca" on public.page_views for select to authenticated using ((select public.is_admin()));
revoke insert, update, delete on public.page_views from anon, authenticated;

-- Dicatat server (Nitro) setelah validasi; sesekali membersihkan data > 400 hari
create or replace function public.server_track_view(p_secret text, p_view jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_server(p_secret);
  insert into public.page_views (path, page_type, source, is_entry, referrer_host, engine, utm_source, utm_medium, utm_campaign, device, country, visitor)
  values (
    left(p_view->>'path', 300), p_view->>'page_type', p_view->>'source', coalesce((p_view->>'is_entry')::boolean, false),
    left(nullif(p_view->>'referrer_host', ''), 120), left(nullif(p_view->>'engine', ''), 40),
    left(nullif(p_view->>'utm_source', ''), 80), left(nullif(p_view->>'utm_medium', ''), 80), left(nullif(p_view->>'utm_campaign', ''), 120),
    nullif(p_view->>'device', ''), left(nullif(p_view->>'country', ''), 2), left(p_view->>'visitor', 64)
  );
  if random() < 0.001 then
    delete from public.page_views where at < now() - interval '400 days';
  end if;
end;
$$;
revoke all on function public.server_track_view(text, jsonb) from public;
grant execute on function public.server_track_view(text, jsonb) to anon, authenticated;

-- Ringkasan trafik untuk admin. p_days = rentang hari terakhir (WIB).
create or replace function public.admin_traffic(p_days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_from timestamptz := date_trunc('day', now() at time zone 'Asia/Jakarta') at time zone 'Asia/Jakarta' - make_interval(days => greatest(1, least(p_days, 400)) - 1);
  v_days int := greatest(1, least(p_days, 400));
begin
  if not public.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  return (
    with v as (select * from public.page_views where at >= v_from),
    src as (select source, count(*) views, count(distinct visitor || (at at time zone 'Asia/Jakarta')::date) visitors, count(*) filter (where is_entry) entries from v group by source),
    pages as (
      select path, min(page_type) page_type, count(*) views,
             count(distinct visitor || (at at time zone 'Asia/Jakarta')::date) visitors,
             count(*) filter (where is_entry) entries,
             count(*) filter (where source = 'organik') organik,
             count(*) filter (where source = 'iklan') iklan,
             count(*) filter (where source = 'sosial') sosial,
             count(*) filter (where source = 'referral') referral,
             count(*) filter (where source = 'langsung') langsung,
             count(*) filter (where is_entry and source = 'organik') organik_entries,
             max(at) last_at
      from v group by path order by count(*) desc limit 500
    )
    select jsonb_build_object(
      'from', v_from,
      'days', v_days,
      'totals', (select jsonb_build_object(
          'views', count(*),
          'visitors', count(distinct visitor || (at at time zone 'Asia/Jakarta')::date),
          'sessions', count(*) filter (where is_entry)) from v),
      'sources', coalesce((select jsonb_object_agg(source, jsonb_build_object('views', views, 'visitors', visitors, 'entries', entries)) from src), '{}'),
      'daily', coalesce((
        select jsonb_agg(jsonb_build_object('day', d::date, 'views', coalesce(x.views, 0), 'organik', coalesce(x.organik, 0), 'iklan', coalesce(x.iklan, 0), 'visitors', coalesce(x.visitors, 0)) order by d)
        from generate_series((v_from at time zone 'Asia/Jakarta')::date, (now() at time zone 'Asia/Jakarta')::date, interval '1 day') d
        left join (
          select (at at time zone 'Asia/Jakarta')::date day, count(*) views, count(*) filter (where source = 'organik') organik,
                 count(*) filter (where source = 'iklan') iklan, count(distinct visitor) visitors
          from v group by 1
        ) x on x.day = d::date
      ), '[]'),
      'types', coalesce((
        select jsonb_agg(jsonb_build_object('page_type', page_type, 'views', views, 'visitors', visitors, 'organik', organik, 'iklan', iklan) order by views desc)
        from (select page_type, count(*) views, count(distinct visitor || (at at time zone 'Asia/Jakarta')::date) visitors,
                     count(*) filter (where source = 'organik') organik, count(*) filter (where source = 'iklan') iklan
              from v group by page_type) t
      ), '[]'),
      'pages', coalesce((
        select jsonb_agg(to_jsonb(p) || jsonb_build_object('title', coalesce(
          (select th.name from public.themes th where p.page_type in ('tema', 'pratinjau') and th.slug = split_part(p.path, '/', 3)),
          (select bp.title from public.blog_posts bp where p.page_type = 'artikel' and bp.slug = split_part(p.path, '/', 3)),
          (select pg.title from public.pages pg where p.page_type = 'halaman' and pg.slug = split_part(p.path, '/', 2))
        )) order by p.views desc)
        from pages p
      ), '[]'),
      'engines', coalesce((select jsonb_agg(jsonb_build_object('name', engine, 'views', n) order by n desc)
        from (select engine, count(*) n from v where is_entry and engine is not null group by engine) e), '[]'),
      'referrers', coalesce((select jsonb_agg(jsonb_build_object('host', referrer_host, 'source', source, 'sessions', n) order by n desc)
        from (select referrer_host, min(source) source, count(*) n from v where is_entry and referrer_host is not null group by referrer_host order by n desc limit 30) r), '[]'),
      'campaigns', coalesce((select jsonb_agg(jsonb_build_object('source', utm_source, 'medium', utm_medium, 'campaign', utm_campaign, 'sessions', n, 'views', vw) order by n desc)
        from (select utm_source, utm_medium, utm_campaign, count(*) filter (where is_entry) n, count(*) vw from v
              where utm_source is not null or utm_campaign is not null group by 1, 2, 3 order by 4 desc limit 30) c), '[]'),
      'devices', coalesce((select jsonb_object_agg(coalesce(device, 'lainnya'), n) from (select device, count(*) n from v group by device) d), '{}'),
      'countries', coalesce((select jsonb_agg(jsonb_build_object('country', country, 'views', n) order by n desc)
        from (select country, count(*) n from v where country is not null group by country order by n desc limit 10) c), '[]')
    )
  );
end;
$$;
revoke all on function public.admin_traffic(integer) from public, anon;
grant execute on function public.admin_traffic(integer) to authenticated;
