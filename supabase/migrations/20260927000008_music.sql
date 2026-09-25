-- Musik latar undangan
-- * themes.music_url: musik bawaan tema (diatur admin)
-- * invitations.content.music: musik pilihan user (disimpan di JSON konten)
-- * bucket invitation-media & theme-assets menerima file audio

alter table public.themes
  add column if not exists music_url text
  check (music_url is null or music_url ~ '^https://');

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg'
    ]
where id = 'invitation-media';

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml',
      'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg'
    ]
where id = 'theme-assets';

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
      'definition', t.definition, 'compiled_css', t.compiled_css,
      'music_url', t.music_url
    )
  )
  from public.invitations i
  join public.themes t on t.id = i.theme_id
  where i.slug = lower(p_slug) and i.is_published;
$$;
