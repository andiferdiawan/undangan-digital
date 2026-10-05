/**
 * Kontrak Standardized Template Framework.
 * Semua tema (buatan manual maupun AI) wajib mematuhi batasan di file ini.
 */

export const THEME_SCHEMA_VERSION = 1

/** Jenis section. Empat yang pertama wajib ada di setiap tema. */
export const REQUIRED_SECTIONS = ['hero', 'profile', 'event', 'gallery'] as const
export const SECTION_TYPES = [
  ...REQUIRED_SECTIONS,
  'cover', 'quote', 'story', 'countdown', 'rsvp', 'wishes', 'gift', 'closing',
] as const
export type SectionType = (typeof SECTION_TYPES)[number]

/** Tag HTML yang boleh dipakai di node tree. Tanpa script/style/iframe/form bebas. */
export const ALLOWED_TAGS = [
  'div', 'section', 'header', 'footer', 'article', 'aside', 'nav',
  'h1', 'h2', 'h3', 'h4', 'h5', 'p', 'span', 'small', 'strong', 'em', 'b', 'i',
  'ul', 'ol', 'li', 'figure', 'figcaption', 'blockquote', 'time',
  'img', 'a', 'hr', 'br',
] as const
export type AllowedTag = (typeof ALLOWED_TAGS)[number]

/** Atribut yang boleh diisi. `href` hanya boleh berupa placeholder yang menghasilkan URL https. */
export const ALLOWED_ATTRS = ['src', 'alt', 'href', 'aria-label', 'loading', 'role', 'title'] as const

/** Komponen interaktif bawaan sistem yang bisa diletakkan AI di dalam tema. */
export const COMPONENTS = {
  open_button: { props: ['label'] },
  countdown: { props: ['item_class', 'number_class', 'label_class'] },
  rsvp_form: { props: ['input_class', 'button_class', 'label_class'] },
  wishes: { props: ['item_class', 'name_class', 'text_class'] },
  copy_button: { props: ['value', 'label', 'button_class'] },
  map_button: { props: ['href', 'label', 'button_class'] },
  calendar_button: { props: ['label', 'button_class'] },
  guest_name: { props: ['fallback'] },
  /** Slider foto (Foto Sampul user, lalu galeri). Kosong = tidak tampil, latar section yang terlihat. */
  photo_slider: { props: ['interval', 'image_class', 'dots', 'dot_class'] },
  /** Galeri digeser satu per satu (swipe, tombol ‹ ›, titik, penanda 1/n) dari daftar galeri. */
  gallery_carousel: { props: ['item_class', 'image_class', 'text_class', 'button_class', 'dot_class'] },
} as const
export type ComponentName = keyof typeof COMPONENTS

/** Daftar yang bisa diulang dengan `repeat`. */
export const REPEAT_SOURCES = ['events', 'gallery', 'story', 'gifts'] as const
export type RepeatSource = (typeof REPEAT_SOURCES)[number]

/** Variabel global warna. Nilai disimpan sebagai hex, dipakai sebagai kelas `bg-primary`, `text-heading`, dst. */
export const COLOR_KEYS = [
  'primary_color', 'secondary_color', 'accent_color',
  'background_color', 'surface_color', 'text_color', 'muted_color',
] as const
export type ColorKey = (typeof COLOR_KEYS)[number]

/** Nama kelas warna di Tailwind/UnoCSS untuk tiap variabel global. */
export const COLOR_CLASS: Record<ColorKey, string> = {
  primary_color: 'primary',
  secondary_color: 'secondary',
  accent_color: 'accent',
  background_color: 'base',
  surface_color: 'surface',
  text_color: 'ink',
  muted_color: 'muted',
}

export const FONT_KEYS = ['font_heading', 'font_body', 'font_script'] as const
export type FontKey = (typeof FONT_KEYS)[number]

/** Font yang diizinkan (semua tersedia di Google Fonts). */
export const ALLOWED_FONTS = [
  'Amiri', 'Cormorant Garamond', 'Playfair Display', 'Marcellus', 'Cinzel', 'Lora',
  'Libre Baskerville', 'EB Garamond', 'DM Serif Display', 'Prata', 'Italiana',
  'Poppins', 'Plus Jakarta Sans', 'Inter', 'Montserrat', 'Lato', 'Nunito', 'Josefin Sans',
  'Raleway', 'Quicksand', 'DM Sans', 'Outfit',
  'Great Vibes', 'Alex Brush', 'Parisienne', 'Pinyon Script', 'Allura', 'Dancing Script',
  'Sacramento', 'Tangerine', 'Mea Culpa', 'Ephesis',
  'Caveat', 'Caveat Brush', 'Gochi Hand', 'Permanent Marker', 'Fredoka',
] as const

/**
 * Placeholder yang boleh dipakai dalam teks/atribut: {{nama}}.
 * Di dalam `repeat`, gunakan {{item.<field>}} dan {{index}}.
 */
export const PLACEHOLDERS = {
  groom_name: 'Nama lengkap mempelai pria',
  groom_nickname: 'Nama panggilan mempelai pria',
  groom_parents: 'Orang tua mempelai pria',
  groom_photo: 'Foto mempelai pria (URL, boleh kosong)',
  groom_instagram: 'URL Instagram mempelai pria',
  bride_name: 'Nama lengkap mempelai wanita',
  bride_nickname: 'Nama panggilan mempelai wanita',
  bride_parents: 'Orang tua mempelai wanita',
  bride_photo: 'Foto mempelai wanita (URL, boleh kosong)',
  bride_instagram: 'URL Instagram mempelai wanita',
  couple_names: 'Nama panggilan berdua, mis. "Ahmad & Aisyah"',
  event_date: 'Tanggal acara utama, mis. "Sabtu, 12 Desember 2026"',
  event_day: 'Hari acara utama',
  event_date_num: 'Tanggal (angka) acara utama',
  event_day_minus_two: 'Tanggal (angka) 2 hari sebelum acara (strip kalender)',
  event_day_minus_one: 'Tanggal (angka) 1 hari sebelum acara',
  event_day_plus_one: 'Tanggal (angka) 1 hari setelah acara',
  event_day_plus_two: 'Tanggal (angka) 2 hari setelah acara',
  event_month: 'Bulan acara utama',
  event_year: 'Tahun acara utama',
  event_hijri: 'Tanggal Hijriah acara utama',
  event_time: 'Jam acara utama',
  event_venue: 'Nama tempat acara utama',
  event_address: 'Alamat acara utama',
  location_map: 'URL Google Maps acara utama',
  greeting: 'Salam pembuka',
  opening_text: 'Kalimat pembuka undangan',
  quote_arabic: 'Teks ayat/hadits (Arab)',
  quote_text: 'Terjemahan ayat/kutipan',
  quote_source: 'Sumber kutipan',
  closing_text: 'Kalimat penutup',
  closing_greeting: 'Salam penutup',
  child_name: 'Aqiqah: nama lengkap anak',
  child_nickname: 'Aqiqah: nama panggilan anak',
  child_photo: 'Aqiqah: foto anak (URL, boleh kosong)',
  child_gender: 'Aqiqah: "Putra" atau "Putri"',
  child_birth: 'Aqiqah: tanggal lahir, mis. "Jumat, 20 November 2026"',
  child_birth_time: 'Aqiqah: jam lahir, mis. "08.15 WITA"',
  child_weight: 'Aqiqah: berat lahir, mis. "3,2 kg"',
  child_length: 'Aqiqah: panjang lahir, mis. "49 cm"',
  child_order: 'Aqiqah/khitan: urutan anak, mis. "Putra pertama"',
  child_age: 'Khitan/ulang tahun: usia saat acara, mis. "7 tahun"',
  age_number: 'Ulang tahun: angka usia saja, mis. "7" (untuk angka besar)',
  father_name: 'Nama ayah (aqiqah/khitanan)',
  mother_name: 'Nama ibu (aqiqah/khitanan)',
  parents_names: 'Nama ayah & ibu, mis. "Ahmad Fauzan & Aisyah Humaira"',
  host_name: 'Kantor/acara umum: nama penyelenggara, mis. "PT Sinar Nusantara Abadi"',
  event_title: 'Kantor/acara umum: judul acara, mis. "Grand Opening Kantor Cabang"',
  event_tagline: 'Kantor/acara umum: tema/subjudul acara',
  host_logo: 'Kantor/acara umum: logo penyelenggara (URL, boleh kosong)',
  contact_name: 'Kantor/acara umum: nama narahubung',
  contact_phone: 'Kantor/acara umum: nomor narahubung',
  contact_link: 'Kantor/acara umum: link WhatsApp narahubung',
  donation_title: 'Kantor/acara umum: judul section donasi, mis. "Donasi Kegiatan"',
  donation_text: 'Kantor/acara umum: ajakan donasi',
  donation_target: 'Kantor/acara umum: target dana (teks bebas, boleh kosong)',
  donation_qris: 'Kantor/acara umum: gambar QRIS donasi (URL, boleh kosong)',
  guest_name: 'Nama tamu dari link (?to=)',
  hero_image: 'Gambar utama cover (asset atau foto user)',
} as const
export type PlaceholderKey = keyof typeof PLACEHOLDERS

export const REPEAT_FIELDS: Record<RepeatSource, readonly string[]> = {
  events: ['name', 'date', 'day', 'time', 'venue', 'address', 'map_url'],
  gallery: ['url', 'caption'],
  story: ['date', 'title', 'text'],
  gifts: ['bank', 'number', 'holder'],
}

/** Jenis acara yang didukung model konten. Menentukan data isian & placeholder wajib. */
export const EVENT_KINDS = ['wedding', 'aqiqah', 'khitan', 'birthday', 'office', 'general'] as const
export type EventKind = (typeof EVENT_KINDS)[number]

/** Placeholder yang wajib muncul di setiap tema agar data user pasti tampil (per jenis acara). */
export const REQUIRED_PLACEHOLDERS_BY_KIND: Record<EventKind, PlaceholderKey[]> = {
  wedding: ['bride_name', 'groom_name', 'event_date', 'location_map'],
  aqiqah: ['child_name', 'father_name', 'mother_name', 'event_date', 'location_map'],
  khitan: ['child_name', 'father_name', 'mother_name', 'event_date', 'location_map'],
  birthday: ['child_name', 'event_date', 'location_map'],
  office: ['host_name', 'event_title', 'event_date', 'location_map'],
  general: ['host_name', 'event_title', 'event_date', 'location_map'],
}
export const REQUIRED_PLACEHOLDERS: PlaceholderKey[] = REQUIRED_PLACEHOLDERS_BY_KIND.wedding

/**
 * Kelas utilitas yang aman: karakter terbatas, tanpa url()/image-set()/@import/expression
 * (mencegah tema memuat sumber eksternal lewat nilai arbitrer), tanpa breakpoint (khusus mobile).
 */
export function classProblem(v: string): string | null {
  if (!/^[a-zA-Z0-9\-:/[\]\.%#_!\s(),'&>*+~=@]*$/.test(v)) return 'Kelas mengandung karakter terlarang'
  if (/url\(|image-set\(|expression|@import|javascript:/i.test(v)) return 'Kelas tidak boleh memuat url()/import'
  if (/(^|\s)(sm|md|lg|xl|2xl):/.test(v)) return 'Breakpoint (sm:/md:/lg:) tidak diizinkan, desain khusus mobile'
  // Warna latar bernama `base` membuat text-base ambigu (ukuran vs warna)
  if (/(^|[\s:])text-base($|\s)/.test(v)) return 'text-base ambigu (bisa berarti warna latar); pakai text-[16px] untuk ukuran atau text-ink untuk warna'
  return null
}

export const LIMITS = {
  maxNodes: 800,
  maxDepth: 14,
  maxClassLength: 500,
  maxTextLength: 2000,
  maxSections: 16,
}
