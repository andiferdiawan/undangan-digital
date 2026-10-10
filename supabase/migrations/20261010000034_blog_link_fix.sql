-- Perbaikan tautan artikel blog (alat "Periksa tautan" di Admin → Blog): tautan internal berdomain salah
-- (mis. undanganvirtual.id) diubah ke path relatif, tautan eksternal rusak dilepas. Isi lama selalu dicadangkan
-- agar bisa dikembalikan, dan tanggal "diperbarui" artikel (dateModified) tidak ikut berubah.

create table if not exists private.blog_link_backup (
  id bigint generated always as identity primary key,
  post_id uuid not null,
  slug text not null,
  body text not null,
  sources jsonb not null,
  note text,
  created_at timestamptz not null default now()
);
revoke all on private.blog_link_backup from public, anon, authenticated;

-- p_old_md5: md5 isi saat diperiksa. Bila artikel diubah admin di sela pemeriksaan, perbaikan dilewati (tidak menimpa).
create or replace function public.server_blog_link_fix(p_secret text, p_id uuid, p_old_md5 text, p_body text, p_sources jsonb, p_note text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v public.blog_posts;
begin
  perform private.assert_server(p_secret);
  if jsonb_typeof(p_sources) is distinct from 'array' then raise exception 'sources harus berupa array'; end if;
  select * into v from public.blog_posts where id = p_id for update;
  if v.id is null or md5(v.body) <> p_old_md5 then return false; end if;
  if v.body = p_body and v.sources = p_sources then return false; end if;

  insert into private.blog_link_backup (post_id, slug, body, sources, note)
  values (v.id, v.slug, v.body, v.sources, left(p_note, 4000));
  update public.blog_posts set body = p_body, sources = p_sources where id = p_id;
  -- Perbaikan tautan bukan pembaruan isi: kembalikan content_updated_at (body sama → pemicu tidak mengubahnya lagi)
  update public.blog_posts set content_updated_at = v.content_updated_at where id = p_id;
  return true;
end;
$$;

revoke all on function public.server_blog_link_fix(text, uuid, text, text, jsonb, text) from public;
grant execute on function public.server_blog_link_fix(text, uuid, text, text, jsonb, text) to anon, authenticated;
