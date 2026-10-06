-- Penyedia AI kedua: Google Gemini (AI Studio, tier gratis) di samping OpenRouter.
-- API key Gemini disimpan terenkripsi di Supabase Vault (sama seperti OpenRouter). Admin memilih penyedia utama
-- yang dipakai generator tema & generator artikel blog.

alter table private.ai_settings
  add column if not exists gemini_secret_id uuid,
  add column if not exists gemini_hint text,
  add column if not exists gemini_model text not null default '' check (gemini_model ~ '^[a-z0-9._/:-]{0,120}$'),
  add column if not exists default_provider text not null default '' check (default_provider in ('', 'openrouter', 'gemini'));

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
    'gemini_set', s.gemini_secret_id is not null,
    'gemini_hint', s.gemini_hint,
    'gemini_model', coalesce(s.gemini_model, ''),
    'default_provider', coalesce(s.default_provider, ''),
    'updated_at', s.updated_at
  );
end;
$$;

-- Simpan / ganti / hapus (kosong) API key Gemini
create or replace function public.admin_set_gemini_key(p_key text)
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

  select gemini_secret_id into v_id from private.ai_settings where id;
  if v_id is null then
    select id into v_id from vault.secrets where name = 'gemini_api_key';
  end if;

  if k is null then
    if v_id is not null then delete from vault.secrets where id = v_id; end if;
    update private.ai_settings set gemini_secret_id = null, gemini_hint = null, updated_at = now() where id;
  else
    if v_id is null then
      v_id := vault.create_secret(k, 'gemini_api_key', 'API key Google Gemini (AI Studio) untuk generator tema & artikel');
    else
      perform vault.update_secret(v_id, k);
    end if;
    update private.ai_settings
    set gemini_secret_id = v_id, gemini_hint = left(k, 6) || '…' || right(k, 4), updated_at = now()
    where id;
  end if;
  return public.admin_ai_settings();
end;
$$;

-- Penyedia utama ('' = otomatis) + model Gemini ('' = flash terbaru)
create or replace function public.admin_set_ai_options(p_default_provider text, p_gemini_model text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  p text := btrim(coalesce(p_default_provider, ''));
  m text := btrim(coalesce(p_gemini_model, ''));
begin
  if not public.is_admin() then raise exception 'FORBIDDEN' using errcode = '42501'; end if;
  if p not in ('', 'openrouter', 'gemini') then raise exception 'Provider tidak dikenal'; end if;
  if m !~ '^[a-z0-9._/:-]{0,120}$' then raise exception 'Nama model tidak valid'; end if;
  update private.ai_settings set default_provider = p, gemini_model = m, updated_at = now() where id;
  return public.admin_ai_settings();
end;
$$;

-- Dibaca server (Nitro): key & model kedua penyedia
create or replace function public.server_ai_config(p_secret text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare s private.ai_settings; v_or text; v_gm text;
begin
  perform private.assert_server(p_secret);
  select * into s from private.ai_settings where id;
  if s.openrouter_secret_id is not null then
    select decrypted_secret into v_or from vault.decrypted_secrets where id = s.openrouter_secret_id;
  end if;
  if s.gemini_secret_id is not null then
    select decrypted_secret into v_gm from vault.decrypted_secrets where id = s.gemini_secret_id;
  end if;
  return jsonb_build_object(
    'openrouter_key', v_or, 'openrouter_model', coalesce(s.openrouter_model, ''),
    'gemini_key', v_gm, 'gemini_model', coalesce(s.gemini_model, ''),
    'default_provider', coalesce(s.default_provider, '')
  );
end;
$$;

revoke all on function public.admin_set_gemini_key(text) from public, anon;
revoke all on function public.admin_set_ai_options(text, text) from public, anon;
grant execute on function public.admin_set_gemini_key(text) to authenticated;
grant execute on function public.admin_set_ai_options(text, text) to authenticated;
