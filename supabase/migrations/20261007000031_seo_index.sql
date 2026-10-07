-- Halaman Admin → Indeks SEO: kirim URL massal ke Bing (IndexNow & Bing Webmaster API), cek status indeks Google
-- (Search Console URL Inspection API) & Bing, kirim sitemap ke Google, dan tanda kirim manual ke Brave.
--
-- Kredensial (API key Bing Webmaster & JSON service account Google) disimpan terenkripsi di Supabase Vault seperti
-- key AI: admin hanya bisa menyimpan/menghapus & melihat petunjuk tersamar, server membaca lewat server_seo_config.

create table if not exists private.seo_settings (
  id boolean primary key default true check (id),
  bing_api_secret_id uuid,
  bing_api_hint text,
  google_sa_secret_id uuid,
  google_sa_email text,
  gsc_property text check (gsc_property is null or (length(gsc_property) <= 200 and (
    gsc_property ~ '^sc-domain:[a-z0-9.-]+$' or gsc_property ~ '^https?://[A-Za-z0-9.:-]+/([^[:space:]]*/)?$'))),
  updated_at timestamptz not null default now()
);
insert into private.seo_settings default values on conflict do nothing;
revoke all on private.seo_settings from public, anon, authenticated;

-- Status per URL publik (path relatif, mis. /tema/xyz). Hanya admin yang bisa membaca; ditulis server lewat server_seo_record.
create table if not exists public.seo_urls (
  path text primary key check (path ~ '^/' and length(path) <= 500),
  indexnow_at timestamptz,
  bing_submitted_at timestamptz,
  bing_crawled_at timestamptz,
  bing_http_status integer,
  bing_checked_at timestamptz,
  google_verdict text check (google_verdict is null or length(google_verdict) <= 40),
  google_coverage text check (google_coverage is null or length(google_coverage) <= 200),
  google_last_crawl timestamptz,
  google_link text check (google_link is null or (google_link ~ '^https://' and length(google_link) <= 1000)),
  google_checked_at timestamptz,
  brave_submitted_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.seo_urls enable row level security;
revoke all on public.seo_urls from anon;
drop policy if exists "seo: admin baca" on public.seo_urls;
create policy "seo: admin baca" on public.seo_urls for select to authenticated using (public.is_admin());

-- Status pengaturan untuk halaman admin (tanpa rahasia)
create or replace function public.admin_seo_settings()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare s private.seo_settings;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  select * into s from private.seo_settings where id;
  return jsonb_build_object(
    'bing_api_set', s.bing_api_secret_id is not null,
    'bing_api_hint', s.bing_api_hint,
    'google_set', s.google_sa_secret_id is not null,
    'google_email', s.google_sa_email,
    'gsc_property', s.gsc_property,
    'updated_at', s.updated_at
  );
end;
$$;

-- Simpan / ganti / hapus (kosong) API key Bing Webmaster (Settings → API Access)
create or replace function public.admin_set_bing_api_key(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  k text := nullif(btrim(coalesce(p_key, '')), '');
  v_id uuid;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  if k is not null and k !~ '^[A-Za-z0-9]{16,100}$' then
    raise exception 'Format API key Bing tidak valid (huruf & angka, tanpa spasi)';
  end if;

  select bing_api_secret_id into v_id from private.seo_settings where id;
  if v_id is null then
    select id into v_id from vault.secrets where name = 'bing_webmaster_api_key';
  end if;

  if k is null then
    if v_id is not null then delete from vault.secrets where id = v_id; end if;
    update private.seo_settings set bing_api_secret_id = null, bing_api_hint = null, updated_at = now() where id;
  else
    if v_id is null then
      v_id := vault.create_secret(k, 'bing_webmaster_api_key', 'API key Bing Webmaster Tools untuk kirim URL & cek status');
    else
      perform vault.update_secret(v_id, k);
    end if;
    update private.seo_settings
    set bing_api_secret_id = v_id, bing_api_hint = left(k, 4) || '…' || right(k, 4), updated_at = now()
    where id;
  end if;
  return public.admin_seo_settings();
end;
$$;

-- Simpan / ganti / hapus (kosong) service account Google. Hanya bidang yang dibutuhkan yang disimpan.
create or replace function public.admin_set_google_service_account(p_json text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  k text := nullif(btrim(coalesce(p_json, '')), '');
  j jsonb;
  v_email text;
  v_id uuid;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  if k is not null then
    if length(k) > 20000 then raise exception 'File JSON terlalu besar'; end if;
    begin
      j := k::jsonb;
    exception when others then
      raise exception 'Isi bukan JSON yang valid. Unggah file .json service account dari Google Cloud.';
    end;
    v_email := lower(coalesce(j->>'client_email', ''));
    if jsonb_typeof(j) <> 'object' or j->>'type' is distinct from 'service_account'
      or v_email !~ '^[a-z0-9._-]+@[a-z0-9.-]+\.gserviceaccount\.com$'
      or coalesce(j->>'private_key', '') not like '-----BEGIN PRIVATE KEY-----%' then
      raise exception 'Bukan file kunci service account Google (butuh type "service_account", client_email, dan private_key).';
    end if;
    k := jsonb_build_object('client_email', v_email, 'private_key', j->>'private_key', 'project_id', j->>'project_id')::text;
  end if;

  select google_sa_secret_id into v_id from private.seo_settings where id;
  if v_id is null then
    select id into v_id from vault.secrets where name = 'google_service_account';
  end if;

  if k is null then
    if v_id is not null then delete from vault.secrets where id = v_id; end if;
    update private.seo_settings set google_sa_secret_id = null, google_sa_email = null, updated_at = now() where id;
  else
    if v_id is null then
      v_id := vault.create_secret(k, 'google_service_account', 'Service account Google untuk Search Console API');
    else
      perform vault.update_secret(v_id, k);
    end if;
    update private.seo_settings set google_sa_secret_id = v_id, google_sa_email = v_email, updated_at = now() where id;
  end if;
  return public.admin_seo_settings();
end;
$$;

-- Properti Search Console: "sc-domain:contoh.com" (properti domain) atau "https://contoh.com/" (awalan URL); kosong = hapus
create or replace function public.admin_set_gsc_property(p_property text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare p text := nullif(btrim(coalesce(p_property, '')), '');
begin
  if not public.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  if p is not null and not (length(p) <= 200 and (p ~ '^sc-domain:[a-z0-9.-]+$' or p ~ '^https?://[A-Za-z0-9.:-]+/([^[:space:]]*/)?$')) then
    raise exception 'Properti tidak valid. Contoh: sc-domain:undanganvirtual.com atau https://undanganvirtual.com/';
  end if;
  update private.seo_settings set gsc_property = p, updated_at = now() where id;
  return public.admin_seo_settings();
end;
$$;

-- Dibaca server (Nitro): kredensial & properti
create or replace function public.server_seo_config(p_secret text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare s private.seo_settings; v_bing text; v_sa text;
begin
  perform private.assert_server(p_secret);
  select * into s from private.seo_settings where id;
  if s.bing_api_secret_id is not null then
    select decrypted_secret into v_bing from vault.decrypted_secrets where id = s.bing_api_secret_id;
  end if;
  if s.google_sa_secret_id is not null then
    select decrypted_secret into v_sa from vault.decrypted_secrets where id = s.google_sa_secret_id;
  end if;
  return jsonb_build_object('bing_api_key', v_bing, 'google_sa', v_sa::jsonb, 'gsc_property', s.gsc_property);
end;
$$;

-- Dicatat server: upsert status per path. Hanya kolom yang ada di tiap objek yang diubah (null eksplisit = kosongkan).
create or replace function public.server_seo_record(p_secret text, p_rows jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare r jsonb; n integer := 0;
begin
  perform private.assert_server(p_secret);
  if jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) > 10000 then
    raise exception 'p_rows harus array berisi maksimal 10.000 baris';
  end if;
  for r in select value from jsonb_array_elements(p_rows) loop
    continue when jsonb_typeof(r) <> 'object' or coalesce(r->>'path', '') !~ '^/' or length(r->>'path') > 500;
    insert into public.seo_urls (path) values (r->>'path') on conflict (path) do nothing;
    update public.seo_urls s set
      indexnow_at = case when r ? 'indexnow_at' then (r->>'indexnow_at')::timestamptz else s.indexnow_at end,
      bing_submitted_at = case when r ? 'bing_submitted_at' then (r->>'bing_submitted_at')::timestamptz else s.bing_submitted_at end,
      bing_crawled_at = case when r ? 'bing_crawled_at' then (r->>'bing_crawled_at')::timestamptz else s.bing_crawled_at end,
      bing_http_status = case when r ? 'bing_http_status' then (r->>'bing_http_status')::integer else s.bing_http_status end,
      bing_checked_at = case when r ? 'bing_checked_at' then (r->>'bing_checked_at')::timestamptz else s.bing_checked_at end,
      google_verdict = case when r ? 'google_verdict' then left(r->>'google_verdict', 40) else s.google_verdict end,
      google_coverage = case when r ? 'google_coverage' then left(r->>'google_coverage', 200) else s.google_coverage end,
      google_last_crawl = case when r ? 'google_last_crawl' then (r->>'google_last_crawl')::timestamptz else s.google_last_crawl end,
      google_link = case when r ? 'google_link' then
        (case when r->>'google_link' ~ '^https://' and length(r->>'google_link') <= 1000 then r->>'google_link' end) else s.google_link end,
      google_checked_at = case when r ? 'google_checked_at' then (r->>'google_checked_at')::timestamptz else s.google_checked_at end,
      brave_submitted_at = case when r ? 'brave_submitted_at' then (r->>'brave_submitted_at')::timestamptz else s.brave_submitted_at end,
      updated_at = now()
    where s.path = r->>'path';
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.admin_seo_settings() from public, anon;
revoke all on function public.admin_set_bing_api_key(text) from public, anon;
revoke all on function public.admin_set_google_service_account(text) from public, anon;
revoke all on function public.admin_set_gsc_property(text) from public, anon;
revoke all on function public.server_seo_config(text) from public;
revoke all on function public.server_seo_record(text, jsonb) from public;
grant execute on function public.admin_seo_settings() to authenticated;
grant execute on function public.admin_set_bing_api_key(text) to authenticated;
grant execute on function public.admin_set_google_service_account(text) to authenticated;
grant execute on function public.admin_set_gsc_property(text) to authenticated;
grant execute on function public.server_seo_config(text) to anon, authenticated;
grant execute on function public.server_seo_record(text, jsonb) to anon, authenticated;
