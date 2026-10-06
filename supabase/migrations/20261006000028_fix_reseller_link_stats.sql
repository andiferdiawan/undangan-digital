-- Perbaikan reseller_link_stats: FULL JOIN dengan kondisi IS NOT DISTINCT FROM ditolak Postgres
-- ("FULL JOIN is only supported with merge-joinable or hash-joinable join conditions"), sehingga
-- halaman /reseller/analitik selalu gagal memuat. Klik & pesanan kini digabung dengan UNION ALL + GROUP BY.
-- Sekaligus: pesanan dari link yang belum diklik dalam rentang waktu tidak lagi terhitung sebagai link utama.

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
    -- Klik & pesanan per link digabung lewat UNION ALL + GROUP BY (link_id null = link utama).
    -- FULL JOIN ... IS NOT DISTINCT FROM tidak didukung Postgres, jadi tidak dipakai.
    per_link as (
      select link_id, sum(clicks) as clicks, sum(visitors) as visitors, sum(orders) as orders,
             sum(paid) as paid, sum(revenue) as revenue, sum(commission) as commission
      from (
        select link_id, count(*) as clicks, count(distinct visitor || (at at time zone 'Asia/Jakarta')::date) as visitors,
               0 as orders, 0 as paid, 0 as revenue, 0 as commission
        from c group by link_id
        union all
        select ref_link_id, 0, 0, count(*), count(*) filter (where status = 'paid'),
               coalesce(sum(amount) filter (where status = 'paid'), 0),
               coalesce(sum(reseller_share) filter (where status = 'paid'), 0)
        from o group by ref_link_id
      ) as u
      group by link_id
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
