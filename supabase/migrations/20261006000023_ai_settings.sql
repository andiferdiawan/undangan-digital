-- Pengaturan generator tema AI yang diisi admin dari halaman Pengaturan.
-- API key OpenRouter disimpan terenkripsi di Supabase Vault; tabel private.ai_settings hanya menyimpan
-- id rahasia, petunjuk tersamar (mis. "sk-or-…a1b2"), dan model pilihan. Client tidak bisa membaca key:
-- admin hanya bisa menyimpan/menghapus, server membaca lewat server_ai_config (dilindungi secret server).

create table if not exists private.ai_settings (
  id boolean primary key default true check (id),
  openrouter_secret_id uuid,
  openrouter_hint text,
  openrouter_model text not null default '' check (openrouter_model ~ '^[a-z0-9._/:-]{0,120}$'),
  updated_at timestamptz not null default now()
);
insert into private.ai_settings default values on conflict do nothing;
revoke all on private.ai_settings from public, anon, authenticated;

-- Status untuk halaman admin (tanpa key asli)
create or replace function public.admin_ai_settings()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare s private.ai_settings;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  select * into s from private.ai_settings where id;
  return jsonb_build_object(
    'openrouter_set', s.openrouter_secret_id is not null,
    'openrouter_hint', s.openrouter_hint,
    'openrouter_model', coalesce(s.openrouter_model, ''),
    'updated_at', s.updated_at
  );
end;
$$;

-- Simpan / ganti / hapus (kosong) API key OpenRouter
create or replace function public.admin_set_openrouter_key(p_key text)
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
  if k is not null and (length(k) < 20 or length(k) > 300 or k !~ '^[A-Za-z0-9_.-]+$') then
    raise exception 'Format API key tidak valid';
  end if;

  select openrouter_secret_id into v_id from private.ai_settings where id;
  if v_id is null then
    select id into v_id from vault.secrets where name = 'openrouter_api_key';
  end if;

  if k is null then
    if v_id is not null then delete from vault.secrets where id = v_id; end if;
    update private.ai_settings set openrouter_secret_id = null, openrouter_hint = null, updated_at = now() where id;
  else
    if v_id is null then
      v_id := vault.create_secret(k, 'openrouter_api_key', 'API key OpenRouter untuk generator tema AI');
    else
      perform vault.update_secret(v_id, k);
    end if;
    update private.ai_settings
    set openrouter_secret_id = v_id, openrouter_hint = left(k, 6) || '…' || right(k, 4), updated_at = now()
    where id;
  end if;
  return public.admin_ai_settings();
end;
$$;

-- Model OpenRouter pilihan (kosong = router otomatis openrouter/free)
create or replace function public.admin_set_openrouter_model(p_model text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare m text := btrim(coalesce(p_model, ''));
begin
  if not public.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  if m !~ '^[a-z0-9._/:-]{0,120}$' then raise exception 'Nama model tidak valid'; end if;
  update private.ai_settings set openrouter_model = m, updated_at = now() where id;
  return public.admin_ai_settings();
end;
$$;

-- Dibaca server (Nitro) saat generate tema
create or replace function public.server_ai_config(p_secret text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare s private.ai_settings; v_key text;
begin
  perform private.assert_server(p_secret);
  select * into s from private.ai_settings where id;
  if s.openrouter_secret_id is not null then
    select decrypted_secret into v_key from vault.decrypted_secrets where id = s.openrouter_secret_id;
  end if;
  return jsonb_build_object('openrouter_key', v_key, 'openrouter_model', coalesce(s.openrouter_model, ''));
end;
$$;

revoke all on function public.admin_ai_settings() from public, anon;
revoke all on function public.admin_set_openrouter_key(text) from public, anon;
revoke all on function public.admin_set_openrouter_model(text) from public, anon;
revoke all on function public.server_ai_config(text) from public;
grant execute on function public.admin_ai_settings() to authenticated;
grant execute on function public.admin_set_openrouter_key(text) to authenticated;
grant execute on function public.admin_set_openrouter_model(text) to authenticated;
grant execute on function public.server_ai_config(text) to anon, authenticated;
