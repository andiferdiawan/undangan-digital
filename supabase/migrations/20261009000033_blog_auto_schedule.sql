-- Artikel otomatis terjadwal: beberapa artikel per hari dengan jarak tertentu, urutan model AI cadangan, dan
-- berhenti otomatis (plus email ke admin) bila semua model gagal, sampai admin menjalankan ulang.
--
-- Penjadwal: pg_cron di database memeriksa setiap 5 menit. Hanya bila sudah waktunya, pg_net memanggil
-- /api/cron/blog-daily di situs dengan token rahasia (private.blog_tick). Tidak bergantung pada paket Vercel
-- (cron Vercel Hobby hanya sekali sehari). Cron Vercel harian tetap ada sebagai cadangan; keduanya aman
-- berjalan bersamaan karena server mengklaim giliran secara atomik (server_blog_auto_claim).

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

alter table public.blog_settings
  add column if not exists auto_per_day smallint not null default 1 check (auto_per_day between 1 and 48),
  add column if not exists auto_interval_minutes integer not null default 240 check (auto_interval_minutes between 15 and 1440),
  add column if not exists auto_start_time time not null default '08:00',
  add column if not exists auto_models text[] not null default array['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview']
    check (cardinality(auto_models) <= 5 and array_to_string(auto_models, ',') ~ '^([a-z0-9._/:-]{1,120}(,[a-z0-9._/:-]{1,120})*)?$'),
  add column if not exists auto_day date,
  add column if not exists auto_day_count smallint not null default 0,
  add column if not exists last_success_at timestamptz,
  add column if not exists auto_running_since timestamptz,
  add column if not exists auto_halted_at timestamptz,
  add column if not exists auto_halt_reason text;

-- Artikel otomatis yang sudah ada hari ini (sebelum fitur ini) tetap terhitung
update public.blog_settings
set last_success_at = last_auto_at,
    auto_day = (last_auto_at at time zone 'Asia/Jakarta')::date,
    auto_day_count = 1
where last_success_at is null and last_auto_at is not null and last_auto_status like 'ok:%';

-- Alasan menunggu (null = boleh membuat artikel sekarang). Dipakai pemicu cron & klaim server.
create or replace function private.blog_auto_wait(s public.blog_settings, p_now timestamptz default now())
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_today date := (p_now at time zone 'Asia/Jakarta')::date;
  v_count int := case when s.auto_day = v_today then coalesce(s.auto_day_count, 0) else 0 end;
  v_next timestamptz;
begin
  if not coalesce(s.auto_enabled, false) then return 'Artikel otomatis nonaktif'; end if;
  if s.auto_halted_at is not null then return 'Dihentikan setelah gagal, menunggu admin menjalankan ulang'; end if;
  if s.auto_running_since is not null and s.auto_running_since > p_now - interval '10 minutes' then return 'Sedang membuat artikel'; end if;
  if v_count >= s.auto_per_day then return format('Kuota hari ini terpenuhi (%s artikel)', v_count); end if;
  -- Artikel pertama hari ini pada jam mulai; berikutnya minimal sejarak interval dari artikel terakhir
  v_next := (v_today + s.auto_start_time) at time zone 'Asia/Jakarta';
  if v_count > 0 and s.last_success_at is not null then
    v_next := greatest(v_next, s.last_success_at + make_interval(mins => s.auto_interval_minutes));
  end if;
  if p_now < v_next then
    return 'Berikutnya ' || to_char(v_next at time zone 'Asia/Jakarta', 'DD/MM HH24:MI') || ' WIB';
  end if;
  return null;
end;
$$;

-- Server mengklaim giliran secara atomik. Proses sebelumnya yang terhenti >10 menit (mis. batas waktu server)
-- dianggap gagal → otomatis dihentikan (stale=true agar server mengirim email), supaya tidak mengulang terus.
create or replace function public.server_blog_auto_claim(p_secret text, p_force boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare s public.blog_settings; v_wait text;
begin
  perform private.assert_server(p_secret);
  select * into s from public.blog_settings where id for update;
  if s.auto_running_since is not null and s.auto_running_since <= now() - interval '10 minutes' and not p_force then
    update public.blog_settings
    set auto_running_since = null, auto_halted_at = now(),
        auto_halt_reason = 'Proses sebelumnya terhenti sebelum selesai (melebihi batas waktu server).',
        last_auto_at = now(), last_auto_status = 'gagal: proses terhenti sebelum selesai'
    where id;
    return jsonb_build_object('run', false, 'stale', true, 'reason', 'Proses sebelumnya terhenti sebelum selesai (melebihi batas waktu server).');
  end if;
  if p_force then
    if s.auto_running_since is not null and s.auto_running_since > now() - interval '10 minutes' then
      return jsonb_build_object('run', false, 'reason', 'Artikel otomatis sedang dibuat. Tunggu beberapa menit.');
    end if;
  else
    v_wait := private.blog_auto_wait(s);
    if v_wait is not null then return jsonb_build_object('run', false, 'reason', v_wait); end if;
  end if;
  update public.blog_settings set auto_running_since = now() where id;
  return jsonb_build_object('run', true, 'models', to_jsonb(s.auto_models));
end;
$$;

-- Selesai: berhasil → hitung kuota harian & lepaskan status berhenti; gagal → catat, dan hentikan bila p_halt.
create or replace function public.server_blog_auto_finish(p_secret text, p_ok boolean, p_note text, p_halt boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_today date := (now() at time zone 'Asia/Jakarta')::date;
begin
  perform private.assert_server(p_secret);
  if p_ok then
    update public.blog_settings
    set auto_day_count = case when auto_day = v_today then auto_day_count + 1 else 1 end,
        auto_day = v_today, last_success_at = now(), auto_running_since = null,
        auto_halted_at = null, auto_halt_reason = null
    where id;
  else
    update public.blog_settings
    set auto_running_since = null, last_auto_at = now(), last_auto_status = left('gagal: ' || coalesce(p_note, ''), 300),
        auto_halted_at = case when p_halt then now() else auto_halted_at end,
        auto_halt_reason = case when p_halt then left(coalesce(p_note, ''), 2000) else auto_halt_reason end
    where id;
  end if;
end;
$$;

-- Token pemicu (dikirim pg_net, dicek server) & alamat endpoint
create table if not exists private.blog_tick (
  id boolean primary key default true check (id),
  url text not null check (url ~ '^https://'),
  token text not null
);
insert into private.blog_tick (url, token)
values ('https://undanganvirtual.com/api/cron/blog-daily', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict do nothing;
revoke all on private.blog_tick from public, anon, authenticated;

create or replace function public.server_blog_tick_ok(p_secret text, p_token text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform private.assert_server(p_secret);
  return coalesce(length(p_token), 0) >= 32 and exists (select 1 from private.blog_tick where token = p_token);
end;
$$;

-- Dipanggil pg_cron: panggil endpoint hanya bila sudah waktunya (hemat pemanggilan fungsi server)
create or replace function private.blog_tick_fire()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare s public.blog_settings; t private.blog_tick;
begin
  select * into s from public.blog_settings where id;
  if s.id is null or private.blog_auto_wait(s) is not null then return; end if;
  select * into t from private.blog_tick where id;
  perform net.http_get(url := t.url, headers := jsonb_build_object('x-blog-tick', t.token), timeout_milliseconds := 295000);
end;
$$;

select cron.unschedule(jobid) from cron.job where jobname = 'blog-auto-tick';
select cron.schedule('blog-auto-tick', '*/5 * * * *', 'select private.blog_tick_fire()');

revoke all on function public.server_blog_auto_claim(text, boolean) from public;
revoke all on function public.server_blog_auto_finish(text, boolean, text, boolean) from public;
revoke all on function public.server_blog_tick_ok(text, text) from public;
revoke all on function private.blog_tick_fire() from public;
revoke all on function private.blog_auto_wait(public.blog_settings, timestamptz) from public;
grant execute on function public.server_blog_auto_claim(text, boolean) to anon, authenticated;
grant execute on function public.server_blog_auto_finish(text, boolean, text, boolean) to anon, authenticated;
grant execute on function public.server_blog_tick_ok(text, text) to anon, authenticated;
