-- Anti kanibalisasi konten: konteks penulisan artikel otomatis kini juga memuat SEMUA artikel yang belum diarsip
-- (draf & tayang: judul, kata kunci utama, slug) agar server bisa menolak judul/kata kunci yang tumpang tindih.

create or replace function public.server_blog_context(p_secret text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare s public.blog_settings; t public.blog_topics;
begin
  perform private.assert_server(p_secret);
  select * into s from public.blog_settings where id;
  select * into t from public.blog_topics where status = 'queued' order by id limit 1;
  return jsonb_build_object(
    'settings', to_jsonb(s),
    'topic', to_jsonb(t),
    'queued', (select count(*) from public.blog_topics where status = 'queued'),
    'categories', coalesce((select jsonb_agg(jsonb_build_object('slug', slug, 'name', name) order by sort) from public.blog_categories), '[]'),
    'posts', coalesce((
      select jsonb_agg(jsonb_build_object('slug', slug, 'title', title, 'category_slug', category_slug, 'focus_keyword', focus_keyword, 'tags', tags) order by published_at desc)
      from (select * from public.blog_posts where status = 'published' order by published_at desc limit 300) p
    ), '[]'),
    'taken', coalesce((
      select jsonb_agg(jsonb_build_object('slug', slug, 'title', title, 'focus_keyword', focus_keyword, 'status', status))
      from (select slug, title, focus_keyword, status from public.blog_posts where status <> 'archived' order by created_at desc limit 3000) p
    ), '[]'),
    'all_topics', coalesce((
      select jsonb_agg(x) from (
        select title as x from public.blog_posts
        union all select topic from public.blog_topics
      ) q
    ), '[]')
  );
end;
$$;
