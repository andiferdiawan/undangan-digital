-- Akses customer tanpa login: reseller/pemilik membagikan link /kelola/<slug>; customer memasukkan kode token
-- pesanan undangan itu. Browser customer memakai sesi anonim Supabase, lalu claim_invitation_access()
-- mendaftarkannya sebagai editor undangan (bisa mengedit isi, buku tamu, RSVP). Pemilik tetap pemilik.

create table if not exists public.invitation_editors (
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (invitation_id, user_id)
);
create index if not exists invitation_editors_user_idx on public.invitation_editors (user_id);
alter table public.invitation_editors enable row level security;

-- Pemilik undangan atau editor yang terdaftar (dipakai RLS; security definer agar tidak rekursif)
create or replace function public.can_manage_invitation(p_invitation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.invitations i where i.id = p_invitation and i.owner_id = (select auth.uid()))
      or exists (select 1 from public.invitation_editors e where e.invitation_id = p_invitation and e.user_id = (select auth.uid()));
$$;
revoke all on function public.can_manage_invitation(uuid) from public, anon;
grant execute on function public.can_manage_invitation(uuid) to authenticated;

-- Editor melihat baris aksesnya sendiri; pemilik & admin melihat semua editor undangannya.
-- Tidak ada insert/update dari client: hanya lewat claim_invitation_access(); pemilik bisa mencabut (delete).
drop policy if exists "editor undangan: baca" on public.invitation_editors;
create policy "editor undangan: baca" on public.invitation_editors for select to authenticated
  using (user_id = (select auth.uid())
         or exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = (select auth.uid()))
         or (select public.is_admin()));
drop policy if exists "editor undangan: pemilik cabut" on public.invitation_editors;
create policy "editor undangan: pemilik cabut" on public.invitation_editors for delete to authenticated
  using (exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = (select auth.uid()))
         or (select public.is_admin()));
revoke all on public.invitation_editors from anon;
grant select, delete on public.invitation_editors to authenticated;

-- ---------- RLS: pemilik ATAU editor ----------
drop policy if exists "undangan: pemilik atau admin baca" on public.invitations;
create policy "undangan: pemilik atau admin baca" on public.invitations for select to authenticated
  using (owner_id = (select auth.uid()) or public.can_manage_invitation(id) or (select public.is_admin()));
drop policy if exists "undangan: pemilik ubah" on public.invitations;
create policy "undangan: pemilik ubah" on public.invitations for update to authenticated
  using (public.can_manage_invitation(id))
  with check (public.can_manage_invitation(id));

drop policy if exists "tamu: pemilik kelola" on public.guests;
create policy "tamu: pemilik kelola" on public.guests for all to authenticated
  using (public.can_manage_invitation(invitation_id))
  with check (public.can_manage_invitation(invitation_id));

drop policy if exists "rsvp: pemilik baca" on public.rsvps;
create policy "rsvp: pemilik baca" on public.rsvps for select to authenticated
  using (public.can_manage_invitation(invitation_id));
drop policy if exists "rsvp: pemilik ubah" on public.rsvps;
create policy "rsvp: pemilik ubah" on public.rsvps for update to authenticated
  using (public.can_manage_invitation(invitation_id));
drop policy if exists "rsvp: pemilik hapus" on public.rsvps;
create policy "rsvp: pemilik hapus" on public.rsvps for delete to authenticated
  using (public.can_manage_invitation(invitation_id));

drop policy if exists "tema: pemilik undangan baca" on public.themes;
create policy "tema: pemilik undangan baca" on public.themes for select to authenticated
  using (exists (select 1 from public.invitations i where i.theme_id = themes.id and public.can_manage_invitation(i.id)));

-- Kuota tamu: editor juga boleh menambah tamu
create or replace function public.enforce_guest_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit int;
  v_count int;
begin
  select guest_limit into v_limit from public.invitations where id = new.invitation_id;

  if (select auth.uid()) is not null
     and not public.can_manage_invitation(new.invitation_id)
     and not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  -- Kunci baris undangan agar insert paralel tidak bisa melewati batas
  perform 1 from public.invitations where id = new.invitation_id for update;

  select count(*) into v_count
  from public.guests where invitation_id = new.invitation_id;

  if v_count >= v_limit then
    raise exception 'GUEST_LIMIT_REACHED'
      using hint = format('Kuota paket Anda %s tamu sudah penuh.', v_limit);
  end if;

  new.name := btrim(new.name);
  return new;
end;
$$;

-- ---------- Klaim akses dengan kode token ----------
create table if not exists private.invitation_access_attempts (
  id bigint generated always as identity primary key,
  slug text not null,
  user_id uuid,
  ok boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists invitation_access_attempts_slug_idx on private.invitation_access_attempts (slug, created_at desc);
revoke all on private.invitation_access_attempts from public, anon, authenticated;

create or replace function public.claim_invitation_access(p_slug text, p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_slug text := lower(btrim(coalesce(p_slug, '')));
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_inv public.invitations;
begin
  if v_uid is null then raise exception 'AUTH_REQUIRED'; end if;
  -- Batasi tebakan: maks. 10 percobaan gagal per undangan per jam
  if (select count(*) from private.invitation_access_attempts
      where slug = v_slug and not ok and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'TOO_MANY_ATTEMPTS' using hint = 'Terlalu banyak percobaan. Coba lagi 1 jam lagi.';
  end if;

  select i.* into v_inv
  from public.invitations i
  join public.access_tokens t on t.id = i.token_id
  where i.slug = v_slug and t.code = v_code;

  if v_inv.id is null then
    insert into private.invitation_access_attempts (slug, user_id, ok) values (v_slug, v_uid, false);
    raise exception 'INVALID_CODE' using hint = 'Alamat undangan atau kode token tidak cocok.';
  end if;

  insert into private.invitation_access_attempts (slug, user_id, ok) values (v_slug, v_uid, true);
  if v_inv.owner_id <> v_uid then
    insert into public.invitation_editors (invitation_id, user_id) values (v_inv.id, v_uid)
    on conflict do nothing;
  end if;
  return v_inv.id;
end;
$$;
revoke all on function public.claim_invitation_access(text, text) from public, anon;
grant execute on function public.claim_invitation_access(text, text) to authenticated;

-- Info berbagi untuk pemilik/admin: kode token & jumlah editor (kode tidak bisa dibaca editor)
create or replace function public.invitation_share_info(p_invitation uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare v_inv public.invitations; v_code text;
begin
  select * into v_inv from public.invitations where id = p_invitation;
  if v_inv.id is null or (v_inv.owner_id <> (select auth.uid()) and not public.is_admin()) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  select code into v_code from public.access_tokens where id = v_inv.token_id;
  return jsonb_build_object(
    'slug', v_inv.slug,
    'code', v_code,
    'editors', (select count(*) from public.invitation_editors where invitation_id = p_invitation)
  );
end;
$$;
revoke all on function public.invitation_share_info(uuid) from public, anon;
grant execute on function public.invitation_share_info(uuid) to authenticated;

-- Sesi anonim (customer lewat kode token) tidak boleh membuat undangan baru: akan hilang saat browser dibersihkan
create or replace function public.redeem_token(p_code text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if (select auth.uid()) is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;
  if coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'ACCOUNT_REQUIRED' using hint = 'Buat akun dengan email untuk mengaktifkan token baru.';
  end if;
  return public.redeem_token_for((select auth.uid()), p_code, p_slug);
end;
$function$;
