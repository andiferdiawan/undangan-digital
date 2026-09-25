-- =====================================================================
--  RPC & trigger: token, registrasi, undangan publik, RSVP, statistik
-- =====================================================================

-- Slug yang tidak boleh dipakai undangan karena bentrok dengan rute aplikasi
create or replace function public.is_reserved_slug(p_slug text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_slug = any (array[
    'admin', 'dashboard', 'daftar', 'masuk', 'keluar', 'login', 'register',
    'api', 'tema', 'preview', 'katalog', 'harga', 'bantuan', 'auth', 'confirm',
    'reset-password', 'lupa-password', 'undangan', 'assets', 'static', 'public', 'nuxt'
  ]);
$$;

create or replace function public.is_slug_available(p_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     and char_length(p_slug) between 3 and 50
     and not public.is_reserved_slug(p_slug)
     and not exists (select 1 from public.invitations where slug = p_slug);
$$;

-- ---------- Token ----------
create or replace function public.check_token(p_code text)
returns table (theme_name text, theme_code text, theme_slug text, package_name text, guest_limit int)
language sql
stable
security definer
set search_path = ''
as $$
  select t.name, t.code, t.slug, p.name, a.guest_limit
  from public.access_tokens a
  join public.themes t on t.id = a.theme_id
  join public.packages p on p.id = a.package_id
  where a.code = upper(btrim(p_code))
    and a.redeemed_at is null
    and (a.expires_at is null or a.expires_at > now());
$$;

create or replace function public.redeem_token_for(p_user uuid, p_code text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token public.access_tokens;
  v_slug text := lower(btrim(p_slug));
  v_id uuid;
begin
  select * into v_token
  from public.access_tokens
  where code = upper(btrim(p_code))
  for update;

  if v_token.id is null or v_token.redeemed_at is not null
     or (v_token.expires_at is not null and v_token.expires_at <= now()) then
    raise exception 'TOKEN_INVALID' using hint = 'Token tidak ditemukan, sudah dipakai, atau kedaluwarsa.';
  end if;

  if not public.is_slug_available(v_slug) then
    raise exception 'SLUG_UNAVAILABLE' using hint = 'Alamat undangan sudah dipakai atau tidak valid.';
  end if;

  insert into public.invitations (owner_id, theme_id, token_id, slug, guest_limit)
  values (p_user, v_token.theme_id, v_token.id, v_slug, v_token.guest_limit)
  returning id into v_id;

  update public.access_tokens
  set redeemed_by = p_user, redeemed_at = now()
  where id = v_token.id;

  return v_id;
end;
$$;
revoke execute on function public.redeem_token_for(uuid, text, text) from public, anon, authenticated;

-- Dipakai user yang sudah login untuk menukar token tambahan
create or replace function public.redeem_token(p_code text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  return public.redeem_token_for((select auth.uid()), p_code, p_slug);
end;
$$;
revoke execute on function public.redeem_token(text, text) from public, anon;
grant execute on function public.redeem_token(text, text) to authenticated;

-- Admin membuat token 6 karakter (tanpa karakter ambigu 0/O/1/I/L)
create or replace function public.admin_generate_token(
  p_theme_id uuid,
  p_package_id smallint,
  p_customer_note text default null,
  p_valid_days int default 30
)
returns public.access_tokens
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  v_pkg public.packages;
  v_code text;
  v_bytes bytea;
  v_row public.access_tokens;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  select * into v_pkg from public.packages where id = p_package_id and is_active;
  if v_pkg.id is null then
    raise exception 'PACKAGE_NOT_FOUND';
  end if;
  if not exists (select 1 from public.themes where id = p_theme_id and status = 'published') then
    raise exception 'THEME_NOT_PUBLISHED';
  end if;

  loop
    v_bytes := extensions.gen_random_bytes(6);
    v_code := '';
    for i in 0..5 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % length(v_alphabet)) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.access_tokens where code = v_code);
  end loop;

  insert into public.access_tokens (code, theme_id, package_id, guest_limit, price, customer_note, created_by, expires_at)
  values (
    v_code, p_theme_id, v_pkg.id, v_pkg.guest_limit, v_pkg.price,
    nullif(btrim(p_customer_note), ''), (select auth.uid()),
    case when p_valid_days is null or p_valid_days <= 0 then null
         else now() + make_interval(days => p_valid_days) end
  )
  returning * into v_row;

  return v_row;
end;
$$;
revoke execute on function public.admin_generate_token(uuid, smallint, text, int) from public, anon;
grant execute on function public.admin_generate_token(uuid, smallint, text, int) to authenticated;

-- ---------- Registrasi: profil + redeem token otomatis ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := new.raw_user_meta_data ->> 'token';
  v_slug text := new.raw_user_meta_data ->> 'slug';
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'full_name', ''));

  if v_token is not null and v_slug is not null then
    perform public.redeem_token_for(new.id, v_token, v_slug);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Undangan publik ----------
create or replace function public.get_public_invitation(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', i.id,
    'slug', i.slug,
    'content', i.content,
    'style', i.style,
    'assets', i.assets,
    'theme', jsonb_build_object(
      'code', t.code, 'slug', t.slug, 'name', t.name,
      'definition', t.definition, 'compiled_css', t.compiled_css
    )
  )
  from public.invitations i
  join public.themes t on t.id = i.theme_id
  where i.slug = lower(p_slug) and i.is_published;
$$;

create or replace function public.mark_guest_opened(p_slug text, p_guest text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.guests g
  set opened_at = now()
  from public.invitations i
  where i.slug = lower(p_slug)
    and g.invitation_id = i.id
    and g.name = btrim(p_guest)
    and g.opened_at is null;
$$;

create or replace function public.submit_rsvp(
  p_slug text,
  p_name text,
  p_attendance text,
  p_pax int default 1,
  p_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv uuid;
  v_guest uuid;
  v_id uuid;
begin
  select id into v_inv from public.invitations where slug = lower(p_slug) and is_published;
  if v_inv is null then
    raise exception 'INVITATION_NOT_FOUND';
  end if;

  -- Batasi spam: maks. 3 kiriman per nama per undangan
  if (select count(*) from public.rsvps
      where invitation_id = v_inv and lower(name) = lower(btrim(p_name))) >= 3 then
    raise exception 'RSVP_LIMIT' using hint = 'Anda sudah mengirim konfirmasi.';
  end if;

  select id into v_guest from public.guests
  where invitation_id = v_inv and name = btrim(p_name);

  insert into public.rsvps (invitation_id, guest_id, name, attendance, pax, message)
  values (v_inv, v_guest, btrim(p_name), p_attendance, greatest(1, least(coalesce(p_pax, 1), 10)),
          nullif(btrim(p_message), ''))
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.get_wishes(p_slug text)
returns table (name text, attendance text, message text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select r.name, r.attendance, r.message, r.created_at
  from public.rsvps r
  join public.invitations i on i.id = r.invitation_id
  where i.slug = lower(p_slug) and i.is_published
    and r.is_visible and r.message is not null
  order by r.created_at desc
  limit 100;
$$;

-- ---------- Statistik admin ----------
create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v jsonb;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  select jsonb_build_object(
    'revenue_total', (select coalesce(sum(price), 0) from public.access_tokens),
    'tokens_generated', (select count(*) from public.access_tokens),
    'tokens_redeemed', (select count(*) from public.access_tokens where redeemed_at is not null),
    'users_total', (select count(*) from public.profiles where role = 'user'),
    'users_active', (select count(distinct owner_id) from public.invitations
                     where updated_at > now() - interval '30 days'),
    'invitations_total', (select count(*) from public.invitations),
    'guests_total', (select count(*) from public.guests),
    'rsvps_total', (select count(*) from public.rsvps),
    'monthly', (
      select coalesce(jsonb_agg(m order by m ->> 'month'), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'month', to_char(g.month, 'YYYY-MM'),
          'revenue', coalesce(sum(a.price), 0),
          'tokens', count(a.id),
          'redeemed', count(a.redeemed_at),
          'new_users', (select count(*) from public.profiles p
                        where p.role = 'user'
                          and date_trunc('month', p.created_at) = g.month)
        ) as m
        from generate_series(
          date_trunc('month', now()) - interval '11 months',
          date_trunc('month', now()),
          interval '1 month'
        ) as g(month)
        left join public.access_tokens a on date_trunc('month', a.created_at) = g.month
        group by g.month
      ) s
    ),
    'leaderboard', (
      select coalesce(jsonb_agg(l order by (l ->> 'sold')::int desc, (l ->> 'revenue')::int desc), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'theme_id', t.id, 'code', t.code, 'name', t.name,
          'category', c.name,
          'sold', count(a.id),
          'redeemed', count(a.redeemed_at),
          'revenue', coalesce(sum(a.price), 0)
        ) as l
        from public.themes t
        left join public.categories c on c.id = t.category_id
        left join public.access_tokens a on a.theme_id = t.id
        group by t.id, c.name
      ) s
    )
  ) into v;

  return v;
end;
$$;

-- Hak eksekusi
revoke execute on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.check_token(text) to anon, authenticated;
grant execute on function public.is_slug_available(text) to anon, authenticated;
grant execute on function public.get_public_invitation(text) to anon, authenticated;
grant execute on function public.mark_guest_opened(text, text) to anon, authenticated;
grant execute on function public.submit_rsvp(text, text, text, int, text) to anon, authenticated;
grant execute on function public.get_wishes(text) to anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_guest_limit() from public, anon, authenticated;

-- =====================================================================
--  Storage
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('invitation-media', 'invitation-media', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('theme-assets', 'theme-assets', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;

-- invitation-media: user hanya menulis di folder {user_id}/...
create policy "media: user unggah ke folder sendiri" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'invitation-media'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "media: user ubah milik sendiri" on storage.objects
  for update to authenticated
  using (bucket_id = 'invitation-media' and owner_id = (select auth.uid())::text);
create policy "media: user hapus milik sendiri" on storage.objects
  for delete to authenticated
  using (bucket_id = 'invitation-media' and owner_id = (select auth.uid())::text);

-- theme-assets: hanya admin menulis, dengan folder per tema: {theme_slug}/...
create policy "aset tema: admin unggah" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'theme-assets' and (select public.is_admin()));
create policy "aset tema: admin ubah" on storage.objects
  for update to authenticated
  using (bucket_id = 'theme-assets' and (select public.is_admin()));
create policy "aset tema: admin hapus" on storage.objects
  for delete to authenticated
  using (bucket_id = 'theme-assets' and (select public.is_admin()));
