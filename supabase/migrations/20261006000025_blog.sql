-- Blog SEO berbasis teks (tanpa gambar, hemat storage): artikel, kategori, penulis/editor (E-E-A-T),
-- antrean topik untuk artikel harian otomatis, dan pengaturan otomatisasi.
-- Artikel ditulis dalam Markdown sederhana; internal link ke artikel lain & halaman katalog disimpan di body,
-- sumber eksternal di kolom `sources`, FAQ di kolom `faq` (dipakai JSON-LD FAQPage).

create table if not exists public.blog_categories (
  slug text primary key check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null check (char_length(name) between 2 and 60),
  description text not null default '' check (char_length(description) <= 300),
  sort smallint not null default 0
);

create table if not exists public.blog_authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null check (char_length(name) between 2 and 80),
  job_title text not null default '' check (char_length(job_title) <= 80),
  bio text not null default '' check (char_length(bio) <= 1000),
  -- Profil publik (LinkedIn, Instagram, dsb.) untuk schema.org sameAs
  same_as text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 90),
  title text not null check (char_length(title) between 10 and 120),
  meta_title text not null default '' check (char_length(meta_title) <= 70),
  meta_description text not null default '' check (char_length(meta_description) <= 170),
  excerpt text not null default '' check (char_length(excerpt) <= 400),
  body text not null default '' check (char_length(body) <= 60000),
  category_slug text references public.blog_categories(slug) on update cascade on delete set null,
  tags text[] not null default '{}',
  focus_keyword text not null default '' check (char_length(focus_keyword) <= 80),
  search_intent text not null default 'informasional' check (search_intent in ('informasional', 'komersial', 'transaksional', 'navigasional')),
  faq jsonb not null default '[]' check (jsonb_typeof(faq) = 'array'),
  sources jsonb not null default '[]' check (jsonb_typeof(sources) = 'array'),
  author_id uuid references public.blog_authors(id) on delete set null,
  editor_id uuid references public.blog_authors(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  content_updated_at timestamptz not null default now(),
  word_count integer not null default 0,
  reading_minutes smallint not null default 1,
  origin text not null default 'manual' check (origin in ('manual', 'ai', 'auto')),
  ai_model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_pub_idx on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_cat_idx on public.blog_posts (category_slug, published_at desc);

create table if not exists public.blog_topics (
  id bigint generated always as identity primary key,
  topic text not null check (char_length(topic) between 5 and 200),
  focus_keyword text not null default '' check (char_length(focus_keyword) <= 80),
  category_slug text references public.blog_categories(slug) on update cascade on delete set null,
  intent text not null default 'informasional' check (intent in ('informasional', 'komersial', 'transaksional', 'navigasional')),
  status text not null default 'queued' check (status in ('queued', 'done', 'failed')),
  post_id uuid references public.blog_posts(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists blog_topics_queue_idx on public.blog_topics (status, id);

create table if not exists public.blog_settings (
  id boolean primary key default true check (id),
  auto_enabled boolean not null default false,
  auto_publish boolean not null default false,
  default_author_id uuid references public.blog_authors(id) on delete set null,
  default_editor_id uuid references public.blog_authors(id) on delete set null,
  last_auto_at timestamptz,
  last_auto_status text,
  updated_at timestamptz not null default now()
);

-- Hitung kata & waktu baca, isi published_at saat tayang, catat kapan konten berubah (dateModified)
create or replace function public.blog_posts_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.word_count := coalesce(array_length(regexp_split_to_array(btrim(new.body), '\s+'), 1), 0);
  new.reading_minutes := greatest(1, ceil(new.word_count / 200.0))::smallint;
  if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
  if tg_op = 'UPDATE' and (new.body is distinct from old.body or new.title is distinct from old.title or new.faq is distinct from old.faq) then
    new.content_updated_at := now();
  end if;
  return new;
end;
$$;
drop trigger if exists blog_posts_bw on public.blog_posts;
create trigger blog_posts_bw before insert or update on public.blog_posts
  for each row execute function public.blog_posts_before_write();

-- RLS: publik membaca artikel tayang, kategori & penulis; admin mengelola semuanya
alter table public.blog_categories enable row level security;
alter table public.blog_authors enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_topics enable row level security;
alter table public.blog_settings enable row level security;

drop policy if exists "blog_categories: publik baca" on public.blog_categories;
create policy "blog_categories: publik baca" on public.blog_categories for select to anon, authenticated using (true);
drop policy if exists "blog_categories: admin kelola" on public.blog_categories;
create policy "blog_categories: admin kelola" on public.blog_categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "blog_authors: publik baca" on public.blog_authors;
create policy "blog_authors: publik baca" on public.blog_authors for select to anon, authenticated using (true);
drop policy if exists "blog_authors: admin kelola" on public.blog_authors;
create policy "blog_authors: admin kelola" on public.blog_authors for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "blog_posts: publik baca yang tayang" on public.blog_posts;
create policy "blog_posts: publik baca yang tayang" on public.blog_posts for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or (select public.is_admin()));
drop policy if exists "blog_posts: admin kelola" on public.blog_posts;
create policy "blog_posts: admin kelola" on public.blog_posts for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "blog_topics: admin kelola" on public.blog_topics;
create policy "blog_topics: admin kelola" on public.blog_topics for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "blog_settings: admin kelola" on public.blog_settings;
create policy "blog_settings: admin kelola" on public.blog_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

revoke all on public.blog_topics, public.blog_settings from anon;

-- ── RPC server (dilindungi secret server) untuk artikel harian otomatis ──

-- Konteks generator: pengaturan, topik antrean berikutnya, kategori, artikel tayang (untuk internal link)
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
    'all_topics', coalesce((
      select jsonb_agg(x) from (
        select title as x from public.blog_posts
        union all select topic from public.blog_topics
      ) q
    ), '[]')
  );
end;
$$;

-- Tambah topik baru ke antrean (dari AI saat antrean hampir habis)
create or replace function public.server_blog_add_topics(p_secret text, p_topics jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare n int;
begin
  perform private.assert_server(p_secret);
  insert into public.blog_topics (topic, focus_keyword, category_slug, intent)
  select left(btrim(e->>'topic'), 200), left(coalesce(e->>'focus_keyword', ''), 80),
         (select slug from public.blog_categories where slug = e->>'category_slug'),
         case when e->>'intent' in ('informasional', 'komersial', 'transaksional', 'navigasional') then e->>'intent' else 'informasional' end
  from jsonb_array_elements(p_topics) e
  where char_length(btrim(coalesce(e->>'topic', ''))) between 5 and 200
  limit 30;
  get diagnostics n = row_count;
  return n;
end;
$$;

-- Simpan artikel otomatis (slug dibuat unik), tandai topik selesai, catat status terakhir
create or replace function public.server_blog_save(p_secret text, p_post jsonb, p_topic_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.blog_settings;
  v_slug text := left(coalesce(p_post->>'slug', ''), 84);
  v_try text;
  i int := 1;
  v_id uuid;
begin
  perform private.assert_server(p_secret);
  select * into s from public.blog_settings where id;
  v_try := v_slug;
  while exists (select 1 from public.blog_posts where slug = v_try) loop
    i := i + 1;
    v_try := v_slug || '-' || i;
  end loop;

  insert into public.blog_posts (
    slug, title, meta_title, meta_description, excerpt, body, category_slug, tags, focus_keyword,
    search_intent, faq, sources, author_id, editor_id, status, origin, ai_model
  ) values (
    v_try, p_post->>'title', coalesce(p_post->>'meta_title', ''), coalesce(p_post->>'meta_description', ''),
    coalesce(p_post->>'excerpt', ''), coalesce(p_post->>'body', ''),
    (select slug from public.blog_categories where slug = p_post->>'category_slug'),
    coalesce((select array_agg(left(x, 40)) from jsonb_array_elements_text(coalesce(p_post->'tags', '[]')) x), '{}'),
    coalesce(p_post->>'focus_keyword', ''),
    case when p_post->>'search_intent' in ('informasional', 'komersial', 'transaksional', 'navigasional') then p_post->>'search_intent' else 'informasional' end,
    coalesce(p_post->'faq', '[]'), coalesce(p_post->'sources', '[]'),
    s.default_author_id, s.default_editor_id,
    case when coalesce(s.auto_publish, false) then 'published' else 'draft' end,
    'auto', p_post->>'ai_model'
  ) returning id into v_id;

  if p_topic_id is not null then
    update public.blog_topics set status = 'done', post_id = v_id where id = p_topic_id;
  end if;
  update public.blog_settings set last_auto_at = now(), last_auto_status = 'ok: ' || v_try where id;
  return jsonb_build_object('id', v_id, 'slug', v_try, 'status', case when coalesce(s.auto_publish, false) then 'published' else 'draft' end);
end;
$$;

-- Catat kegagalan generate otomatis
create or replace function public.server_blog_fail(p_secret text, p_topic_id bigint, p_note text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_server(p_secret);
  if p_topic_id is not null then
    update public.blog_topics set status = 'failed', note = left(p_note, 500) where id = p_topic_id;
  end if;
  update public.blog_settings set last_auto_at = now(), last_auto_status = left('gagal: ' || coalesce(p_note, ''), 300) where id;
end;
$$;

revoke all on function public.server_blog_context(text) from public;
revoke all on function public.server_blog_add_topics(text, jsonb) from public;
revoke all on function public.server_blog_save(text, jsonb, bigint) from public;
revoke all on function public.server_blog_fail(text, bigint, text) from public;
grant execute on function public.server_blog_context(text) to anon, authenticated;
grant execute on function public.server_blog_add_topics(text, jsonb) to anon, authenticated;
grant execute on function public.server_blog_save(text, jsonb, bigint) to anon, authenticated;
grant execute on function public.server_blog_fail(text, bigint, text) to anon, authenticated;

-- Rute blog tidak boleh dipakai sebagai alamat undangan
create or replace function public.is_reserved_slug(p_slug text)
returns boolean
language sql
immutable
set search_path to ''
as $$
  select p_slug = any (array[
    'admin', 'dashboard', 'daftar', 'masuk', 'keluar', 'login', 'register',
    'api', 'tema', 'preview', 'katalog', 'harga', 'bantuan', 'auth', 'confirm',
    'reset-password', 'lupa-password', 'undangan', 'assets', 'static', 'public', 'nuxt',
    'checkout', 'pesanan', 'reseller', 'r', 'bayar', 'pembayaran',
    'tentang-kami', 'kebijakan-privasi', 'syarat-ketentuan', 'kebijakan-pengembalian', 'kontak',
    'halaman', 'og', 'media', 'sitemap', 'robots', 'faq', 'privacy', 'terms', 'about', 'contact',
    'blog', 'artikel', 'favorit', 'rss', 'feed'
  ]);
$$;

-- ── Data awal ──
insert into public.blog_categories (slug, name, description, sort) values
  ('undangan-pernikahan', 'Undangan Pernikahan', 'Contoh kalimat, isi wajib, etika, dan ide undangan pernikahan.', 1),
  ('undangan-digital', 'Undangan Digital', 'Panduan membuat, membagikan, dan mengelola undangan digital.', 2),
  ('persiapan-nikah', 'Persiapan Pernikahan', 'Daftar tamu, RSVP, jadwal, dan persiapan menjelang hari H.', 3),
  ('adat-budaya', 'Adat & Budaya', 'Rangkaian adat pernikahan Nusantara dan maknanya.', 4),
  ('acara-keluarga', 'Aqiqah, Khitanan & Ulang Tahun', 'Contoh undangan dan tips acara keluarga.', 5),
  ('acara-resmi', 'Acara Kantor & Umum', 'Undangan rapat, seminar, peresmian, dan acara komunitas.', 6)
on conflict (slug) do nothing;

insert into public.blog_authors (slug, name, job_title, bio) values
  ('tim-redaksi', 'Tim Redaksi Undangan Virtual', 'Redaksi',
   'Tim redaksi Undangan Virtual menulis panduan seputar undangan pernikahan, undangan digital, dan persiapan acara, berdasarkan pengalaman membantu pelanggan menyiapkan undangan mereka.')
on conflict (slug) do nothing;

insert into public.blog_settings (id, default_author_id, default_editor_id)
select true, a.id, a.id from public.blog_authors a where a.slug = 'tim-redaksi'
on conflict (id) do nothing;

insert into public.blog_topics (topic, category_slug, intent)
select t.topic, t.cat, t.intent
from (values
  ('Contoh kalimat undangan pernikahan islami lengkap dengan doa dan salam', 'undangan-pernikahan', 'informasional'),
  ('Cara membuat undangan pernikahan digital yang sopan dan lengkap', 'undangan-digital', 'transaksional'),
  ('Etika menyebar undangan pernikahan lewat WhatsApp', 'undangan-digital', 'informasional'),
  ('Isi wajib undangan pernikahan: data yang sering terlupa', 'undangan-pernikahan', 'informasional'),
  ('Kapan waktu ideal menyebar undangan pernikahan', 'persiapan-nikah', 'informasional'),
  ('Undangan cetak vs undangan digital: perbandingan biaya dan kepraktisan', 'undangan-digital', 'komersial'),
  ('Contoh teks undangan aqiqah anak laki-laki dan perempuan', 'acara-keluarga', 'informasional'),
  ('Contoh undangan walimatul khitan yang sopan', 'acara-keluarga', 'informasional'),
  ('Contoh undangan syukuran ulang tahun anak', 'acara-keluarga', 'informasional'),
  ('Format undangan rapat resmi kantor beserta contohnya', 'acara-resmi', 'informasional'),
  ('Cara membuat undangan seminar atau acara komunitas', 'acara-resmi', 'informasional'),
  ('Mengenal rangkaian adat pernikahan Bugis', 'adat-budaya', 'informasional'),
  ('Rangkaian adat pernikahan Makassar dan maknanya', 'adat-budaya', 'informasional'),
  ('Urutan prosesi pernikahan adat Jawa', 'adat-budaya', 'informasional'),
  ('Ide tema undangan pernikahan sesuai konsep acara', 'undangan-pernikahan', 'komersial'),
  ('Cara mengelola RSVP tamu agar katering tidak berlebih', 'persiapan-nikah', 'informasional'),
  ('Cara menyusun daftar tamu pernikahan', 'persiapan-nikah', 'informasional'),
  ('Cara menulis nama dan gelar di undangan pernikahan', 'undangan-pernikahan', 'informasional'),
  ('Contoh ucapan terima kasih untuk tamu setelah resepsi', 'undangan-pernikahan', 'informasional'),
  ('Etika mencantumkan amplop digital di undangan pernikahan', 'undangan-digital', 'informasional'),
  ('Undangan pernikahan syar''i: prinsip desain tanpa foto', 'undangan-pernikahan', 'komersial'),
  ('Cara mencantumkan lokasi Google Maps di undangan digital', 'undangan-digital', 'informasional')
) as t(topic, cat, intent)
where not exists (select 1 from public.blog_topics);
