/**
 * Model konten undangan yang diisi user di dashboard (disimpan di invitations.content).
 * Tema tidak pernah membaca struktur ini langsung — hanya lewat placeholder (lihat context.ts).
 */

export interface Person {
  name: string
  nickname: string
  parents: string
  photo: string
  instagram: string
}

/** Data anak untuk undangan aqiqah & khitanan (tidak dipakai tema pernikahan). */
export interface Child {
  name: string
  nickname: string
  gender: 'l' | 'p'
  birth_date: string // YYYY-MM-DD
  birth_time: string // bebas, mis. "08.15 WITA"
  weight: string // mis. "3,2 kg"
  length: string // mis. "49 cm"
  order: string // mis. "Putra pertama"
  photo: string
}

/** Penyelenggara untuk acara kantor & acara umum (tidak dipakai tema pernikahan/anak). */
export interface Host {
  name: string // penyelenggara, mis. "PT Sinar Nusantara Abadi"
  title: string // judul acara, mis. "Grand Opening Kantor Cabang Makassar"
  tagline: string // tema/subjudul acara
  logo: string // URL logo (boleh kosong)
  contact_name: string
  contact_phone: string
}

export interface EventItem {
  name: string
  date: string // YYYY-MM-DD
  time_start: string // HH:mm
  time_end: string // HH:mm, boleh kosong = "selesai"
  timezone: 'WIB' | 'WITA' | 'WIT'
  venue: string
  address: string
  map_url: string
}

export interface InvitationContent {
  /** Pernikahan: mempelai pria/wanita. Aqiqah: ayah/ibu (hanya name, nickname, photo, instagram). */
  groom: Person
  bride: Person
  child: Child
  host: Host
  opening: { greeting: string, text: string }
  quote: { arabic: string, text: string, source: string }
  events: EventItem[]
  /** Pernikahan/anak: cerita. Kantor/acara umum: susunan acara (date = jam, mis. "09.00"). */
  story: { date: string, title: string, text: string }[]
  gallery: { url: string, caption: string }[]
  /**
   * Section galeri tampil secara bawaan; pelanggan bisa menyembunyikannya. Saat disembunyikan, foto galeri
   * tidak dipakai di mana pun (section galeri, slider sampul, gambar pratinjau link) tetapi tetap tersimpan.
   */
  gallery_section: { enabled: boolean }
  /** Foto untuk slider sampul (tema dengan photo_slider). */
  cover_photos: { url: string }[]
  gifts: { bank: string, number: string, holder: string }[]
  rsvp: { enabled: boolean }
  /** Acara kantor/umum: section donasi kegiatan (rekening memakai daftar gifts). Nonaktif secara bawaan. */
  donation: { enabled: boolean, title: string, text: string, target: string, qris: string }
  /** Musik latar: url kosong = pakai musik bawaan tema (bila ada). */
  music: { enabled: boolean, url: string, title: string }
  closing: { text: string, greeting: string }
}

export const DEFAULT_CONTENT: InvitationContent = {
  groom: {
    name: 'Ahmad Fauzan, S.Pd.',
    nickname: 'Ahmad',
    parents: 'Putra dari Bapak Abdullah & Ibu Khadijah',
    photo: '',
    instagram: '',
  },
  bride: {
    name: 'Aisyah Humaira, S.Kom.',
    nickname: 'Aisyah',
    parents: 'Putri dari Bapak Umar & Ibu Fatimah',
    photo: '',
    instagram: '',
  },
  child: {
    name: 'Muhammad Al Fatih',
    nickname: 'Fatih',
    gender: 'l',
    birth_date: '2026-11-20',
    birth_time: '08.15 WIB',
    weight: '3,2 kg',
    length: '49 cm',
    order: 'Putra pertama',
    photo: '',
  },
  host: {
    name: 'PT Sinar Nusantara Abadi',
    title: 'Grand Opening Kantor Cabang Makassar',
    tagline: 'Tumbuh Bersama, Melayani Lebih Dekat',
    logo: '',
    contact_name: 'Rina (Sekretariat)',
    contact_phone: '081234567890',
  },
  opening: {
    greeting: 'Assalamu\'alaikum Warahmatullahi Wabarakatuh',
    text: 'Dengan memohon rahmat dan ridha Allah Subhanahu wa Ta\'ala, kami bermaksud menyelenggarakan pernikahan putra-putri kami:',
  },
  quote: {
    arabic: 'وَمِنْ اٰيٰتِهٖٓ اَنْ خَلَقَ لَكُمْ مِّنْ اَنْفُسِكُمْ اَزْوَاجًا لِّتَسْكُنُوْٓا اِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَّوَدَّةً وَّرَحْمَةً',
    text: 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
    source: 'QS. Ar-Rum : 21',
  },
  events: [
    {
      name: 'Akad Nikah',
      date: '2026-12-12',
      time_start: '08:00',
      time_end: '10:00',
      timezone: 'WIB',
      venue: 'Masjid Al-Ikhlas',
      address: 'Jl. Contoh No. 1, Kota Anda',
      map_url: 'https://maps.google.com/?q=Masjid+Al-Ikhlas',
    },
    {
      name: 'Walimatul \'Urs',
      date: '2026-12-12',
      time_start: '11:00',
      time_end: '14:00',
      timezone: 'WIB',
      venue: 'Kediaman Mempelai Wanita',
      address: 'Jl. Contoh No. 2, Kota Anda',
      map_url: 'https://maps.google.com/?q=Monas+Jakarta',
    },
  ],
  story: [
    { date: 'Maret 2026', title: 'Ta\'aruf', text: 'Allah pertemukan kami melalui perantara guru dan keluarga.' },
    { date: 'Agustus 2026', title: 'Khitbah', text: 'Dengan restu kedua orang tua, lamaran disampaikan dan diterima.' },
    { date: 'Desember 2026', title: 'Akad Nikah', text: 'Insya Allah kami mengikat janji suci di hadapan Allah.' },
  ],
  gallery: [],
  gallery_section: { enabled: true },
  cover_photos: [],
  gifts: [
    { bank: 'Bank Syariah Indonesia', number: '1234567890', holder: 'Ahmad Fauzan' },
  ],
  rsvp: { enabled: true },
  donation: {
    enabled: false,
    title: 'Donasi Kegiatan',
    text: 'Dukung terselenggaranya kegiatan ini. Setiap kontribusi Anda sangat berarti bagi kami.',
    target: '',
    qris: '',
  },
  music: { enabled: true, url: '', title: '' },
  closing: {
    text: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.',
    greeting: 'Wassalamu\'alaikum Warahmatullahi Wabarakatuh',
  },
}

/** Contoh isi untuk undangan aqiqah: orang tua di groom/bride, anak di child. */
export const AQIQAH_CONTENT: InvitationContent = {
  ...DEFAULT_CONTENT,
  groom: { name: 'Ahmad Fauzan', nickname: 'Ahmad', parents: '', photo: '', instagram: '' },
  bride: { name: 'Aisyah Humaira', nickname: 'Aisyah', parents: '', photo: '', instagram: '' },
  opening: {
    greeting: 'Assalamu\'alaikum Warahmatullahi Wabarakatuh',
    text: 'Dengan memohon rahmat dan ridha Allah Subhanahu wa Ta\'ala, kami bermaksud menyelenggarakan tasyakuran aqiqah buah hati kami:',
  },
  quote: {
    arabic: 'كُلُّ غُلَامٍ رَهِينَةٌ بِعَقِيقَتِهِ، تُذْبَحُ عَنْهُ يَوْمَ سَابِعِهِ، وَيُحْلَقُ، وَيُسَمَّى',
    text: 'Setiap anak tergadai dengan aqiqahnya; disembelihkan (hewan) untuknya pada hari ketujuh, dicukur rambutnya, dan diberi nama.',
    source: 'HR. Abu Dawud, At-Tirmidzi, An-Nasa\'i',
  },
  events: [
    {
      name: 'Tasyakuran Aqiqah',
      date: '2026-11-27',
      time_start: '10:00',
      time_end: '13:00',
      timezone: 'WIB',
      venue: 'Kediaman Keluarga',
      address: 'Jl. Contoh No. 1, Kota Anda',
      map_url: 'https://maps.google.com/?q=Monas+Jakarta',
    },
  ],
  story: [],
  gifts: [{ bank: 'Bank Syariah Indonesia', number: '1234567890', holder: 'Ahmad Fauzan' }],
  closing: {
    text: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan mendoakan buah hati kami agar menjadi anak yang shalih/shalihah.',
    greeting: 'Wassalamu\'alaikum Warahmatullahi Wabarakatuh',
  },
}

/** Contoh isi untuk undangan khitanan (walimatul khitan). */
export const KHITAN_CONTENT: InvitationContent = {
  ...AQIQAH_CONTENT,
  child: {
    name: 'Muhammad Rizky Ramadhan',
    nickname: 'Rizky',
    gender: 'l',
    birth_date: '2019-05-12',
    birth_time: '',
    weight: '',
    length: '',
    order: 'Putra kedua',
    photo: '',
  },
  opening: {
    greeting: 'Assalamu\'alaikum Warahmatullahi Wabarakatuh',
    text: 'Dengan memohon rahmat dan ridha Allah Subhanahu wa Ta\'ala, kami bermaksud menyelenggarakan walimatul khitan putra kami:',
  },
  quote: {
    arabic: 'ثُمَّ أَوْحَيْنَآ إِلَيْكَ أَنِ اتَّبِعْ مِلَّةَ إِبْرٰهِيْمَ حَنِيْفًا ۗوَمَا كَانَ مِنَ الْمُشْرِكِيْنَ',
    text: 'Kemudian Kami wahyukan kepadamu (Muhammad), "Ikutilah agama Ibrahim yang lurus, dan dia bukanlah termasuk orang musyrik."',
    source: 'QS. An-Nahl : 123',
  },
  events: [
    {
      name: 'Walimatul Khitan',
      date: '2026-12-20',
      time_start: '09:00',
      time_end: '13:00',
      timezone: 'WIB',
      venue: 'Kediaman Keluarga',
      address: 'Jl. Contoh No. 1, Kota Anda',
      map_url: 'https://maps.google.com/?q=Monas+Jakarta',
    },
  ],
  closing: {
    text: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan mendoakan putra kami agar menjadi anak yang shalih, sehat, dan berbakti.',
    greeting: 'Wassalamu\'alaikum Warahmatullahi Wabarakatuh',
  },
}

/**
 * Contoh isi untuk undangan ulang tahun (syukuran): yang berulang tahun di child,
 * orang tua/tuan rumah di groom/bride (boleh kosong untuk milad dewasa).
 */
export const BIRTHDAY_CONTENT: InvitationContent = {
  ...AQIQAH_CONTENT,
  child: {
    name: 'Aisyah Nur Azzahra',
    nickname: 'Aisyah',
    gender: 'p',
    birth_date: '2019-12-19',
    birth_time: '',
    weight: '',
    length: '',
    order: 'Putri pertama',
    photo: '',
  },
  opening: {
    greeting: 'Assalamu\'alaikum Warahmatullahi Wabarakatuh',
    text: 'Alhamdulillah, dengan penuh rasa syukur atas nikmat usia yang Allah berikan, kami mengundang Bapak/Ibu/Saudara/i untuk hadir di syukuran ulang tahun:',
  },
  quote: {
    arabic: 'خَيْرُ النَّاسِ مَنْ طَالَ عُمُرُهُ وَحَسُنَ عَمَلُهُ',
    text: 'Sebaik-baik manusia adalah yang panjang umurnya dan baik amalnya.',
    source: 'HR. At-Tirmidzi',
  },
  events: [
    {
      name: 'Syukuran Ulang Tahun',
      date: '2026-12-19',
      time_start: '15:30',
      time_end: '17:30',
      timezone: 'WIB',
      venue: 'Kediaman Keluarga',
      address: 'Jl. Contoh No. 1, Kota Anda',
      map_url: 'https://maps.google.com/?q=Monas+Jakarta',
    },
  ],
  gifts: [],
  closing: {
    text: 'Kehadiran dan doa Bapak/Ibu/Saudara/i menjadi hadiah terindah. Semoga usia yang bertambah membawa keberkahan, kesehatan, dan amal yang semakin baik.',
    greeting: 'Wassalamu\'alaikum Warahmatullahi Wabarakatuh',
  },
}

/** Contoh isi untuk acara kantor & bisnis (peresmian, seminar, rapat kerja, anniversary). */
export const OFFICE_CONTENT: InvitationContent = {
  ...DEFAULT_CONTENT,
  opening: {
    greeting: 'Assalamu\'alaikum Warahmatullahi Wabarakatuh',
    text: 'Dengan hormat, dengan memohon ridha Allah Subhanahu wa Ta\'ala, kami mengundang Bapak/Ibu/Saudara/i untuk berkenan hadir pada acara:',
  },
  quote: {
    arabic: 'فَاِذَا قُضِيَتِ الصَّلٰوةُ فَانْتَشِرُوْا فِى الْاَرْضِ وَابْتَغُوْا مِنْ فَضْلِ اللّٰهِ وَاذْكُرُوا اللّٰهَ كَثِيْرًا لَّعَلَّكُمْ تُفْلِحُوْنَ',
    text: 'Apabila shalat telah dilaksanakan, maka bertebaranlah kamu di bumi; carilah karunia Allah dan ingatlah Allah banyak-banyak agar kamu beruntung.',
    source: 'QS. Al-Jumu\'ah : 10',
  },
  events: [
    {
      name: 'Pembukaan Resmi',
      date: '2026-11-16',
      time_start: '09:00',
      time_end: '12:00',
      timezone: 'WITA',
      venue: 'Kantor Cabang Makassar',
      address: 'Jl. Contoh No. 1, Kota Anda',
      map_url: 'https://maps.google.com/?q=Monas+Jakarta',
    },
  ],
  story: [
    { date: '08.30', title: 'Registrasi Tamu', text: 'Penyambutan dan coffee morning' },
    { date: '09.00', title: 'Pembukaan & Tilawah', text: 'Pembacaan ayat suci Al-Qur\'an dan doa' },
    { date: '09.30', title: 'Sambutan', text: 'Sambutan pimpinan dan tamu kehormatan' },
    { date: '10.00', title: 'Acara Inti', text: 'Sesi utama dan diskusi' },
    { date: '10.45', title: 'Ramah Tamah', text: 'Makan siang dan foto bersama' },
  ],
  gallery: [],
  // Rekening contoh untuk section donasi (hanya tampil bila donasi diaktifkan)
  gifts: [{ bank: 'Bank Syariah Indonesia', number: '1234567890', holder: 'Panitia Kegiatan' }],
  closing: {
    text: 'Merupakan suatu kehormatan bagi kami atas kehadiran Bapak/Ibu/Saudara/i. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.',
    greeting: 'Wassalamu\'alaikum Warahmatullahi Wabarakatuh',
  },
}

/** Contoh isi untuk acara umum (pengajian, halal bihalal, reuni, syukuran, gathering). */
export const GENERAL_CONTENT: InvitationContent = {
  ...OFFICE_CONTENT,
  host: {
    name: 'Keluarga Besar H. Abdullah',
    title: 'Halal Bihalal & Silaturahmi',
    tagline: 'Merajut Ukhuwah, Menyambung Silaturahmi',
    logo: '',
    contact_name: 'Ahmad',
    contact_phone: '081234567890',
  },
  opening: {
    greeting: 'Assalamu\'alaikum Warahmatullahi Wabarakatuh',
    text: 'Dengan memohon rahmat dan ridha Allah Subhanahu wa Ta\'ala, kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara:',
  },
  quote: {
    arabic: 'مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ، وَيُنْسَأَ لَهُ فِي أَثَرِهِ، فَلْيَصِلْ رَحِمَهُ',
    text: 'Barang siapa yang ingin dilapangkan rezekinya dan dipanjangkan umurnya, hendaklah ia menyambung tali silaturahmi.',
    source: 'HR. Al-Bukhari & Muslim',
  },
  events: [
    {
      name: 'Halal Bihalal',
      date: '2027-03-21',
      time_start: '09:00',
      time_end: '13:00',
      timezone: 'WIB',
      venue: 'Kediaman Keluarga',
      address: 'Jl. Contoh No. 1, Kota Anda',
      map_url: 'https://maps.google.com/?q=Monas+Jakarta',
    },
  ],
  story: [
    { date: '09.00', title: 'Pembukaan & Tilawah', text: 'Pembacaan ayat suci Al-Qur\'an' },
    { date: '09.30', title: 'Tausiyah', text: 'Siraman rohani tentang ukhuwah' },
    { date: '10.30', title: 'Saling Memaafkan', text: 'Bersalam-salaman dan ramah tamah' },
    { date: '11.30', title: 'Makan Bersama', text: 'Foto bersama dan hidangan' },
  ],
  closing: {
    text: 'Kehadiran Bapak/Ibu/Saudara/i adalah kebahagiaan bagi kami. Semoga silaturahmi ini membawa keberkahan bagi kita semua.',
    greeting: 'Wassalamu\'alaikum Warahmatullahi Wabarakatuh',
  },
}

export type ContentKind = 'wedding' | 'aqiqah' | 'khitan' | 'birthday' | 'office' | 'general'
/** Label jenis acara untuk judul undangan */
export const KIND_LABEL: Record<ContentKind, string> = {
  wedding: 'Pernikahan', aqiqah: 'Aqiqah', khitan: 'Khitanan', birthday: 'Ulang Tahun', office: 'Acara Kantor', general: 'Acara',
}
/** Jenis acara yang berpusat pada satu orang (data child + ayah/ibu) */
export const isChildKind = (kind?: string | null): kind is 'aqiqah' | 'khitan' | 'birthday' =>
  kind === 'aqiqah' || kind === 'khitan' || kind === 'birthday'
/** Jenis acara yang berpusat pada penyelenggara & judul acara (data host + susunan acara) */
export const isHostKind = (kind?: string | null): kind is 'office' | 'general' => kind === 'office' || kind === 'general'
const SAMPLE: Record<ContentKind, InvitationContent> = {
  wedding: DEFAULT_CONTENT, aqiqah: AQIQAH_CONTENT, khitan: KHITAN_CONTENT, birthday: BIRTHDAY_CONTENT, office: OFFICE_CONTENT, general: GENERAL_CONTENT,
}

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

/**
 * Gabungkan konten tersimpan dengan default agar field baru selalu ada. Array tidak digabung.
 * kind menentukan contoh isi (pernikahan, aqiqah, khitanan, ulang tahun, kantor, acara umum) untuk field yang belum diisi;
 * demo (teks contoh tema) menimpa contoh tersebut agar isi awal sesuai tema.
 */
/** Teks contoh dari tema (definition.demo) yang boleh jadi isi awal undangan pelanggan. Foto tidak termasuk. */
export interface DemoText {
  child?: Partial<Pick<Child, 'name' | 'nickname' | 'gender' | 'order' | 'birth_date'>>
  host?: Partial<Pick<Host, 'name' | 'title' | 'tagline'>>
  story?: InvitationContent['story']
  event?: Partial<Pick<EventItem, 'name' | 'venue' | 'address'>>
  quote?: Partial<InvitationContent['quote']>
}

export function withDefaults(saved: unknown, kind: ContentKind = 'wedding', demo?: DemoText | null): InvitationContent {
  const merge = (base: any, over: any): any => {
    if (!isObject(over)) return structuredClone(base)
    const out: any = {}
    for (const key of Object.keys(base)) {
      const b = base[key]
      const o = over[key]
      if (Array.isArray(b)) out[key] = Array.isArray(o) ? o : structuredClone(b)
      else if (isObject(b)) out[key] = merge(b, o)
      else out[key] = o === undefined || o === null ? b : o
    }
    return out
  }
  let base = SAMPLE[kind] ?? DEFAULT_CONTENT
  if (demo) {
    base = {
      ...base,
      child: { ...base.child, ...demo.child },
      host: { ...base.host, ...demo.host },
      story: demo.story ?? base.story,
      events: demo.event && base.events[0] ? [{ ...base.events[0], ...demo.event }, ...base.events.slice(1)] : base.events,
      quote: { ...base.quote, ...demo.quote },
    }
  }
  return merge(base, saved)
}

/** Nama yang ditampilkan untuk undangan (judul, pratinjau link, dashboard). */
export function inviteNames(c: InvitationContent, kind: ContentKind = 'wedding'): string {
  if (isHostKind(kind)) return c.host.title || c.host.name
  return isChildKind(kind) ? c.child.nickname || c.child.name : `${c.groom.nickname} & ${c.bride.nickname}`
}
/** Judul halaman & pratinjau link: nama (mempelai/anak/acara) di depan agar langsung terbaca di WhatsApp. */
export function inviteTitle(c: InvitationContent, kind: ContentKind = 'wedding'): string {
  if (isHostKind(kind)) return `${inviteNames(c, kind)} — Undangan`
  return `${inviteNames(c, kind)} — Undangan ${KIND_LABEL[kind] ?? 'Pernikahan'}`
}

/**
 * Foto untuk gambar pratinjau link: foto pertama galeri yang diunggah pelanggan (dari isi tersimpan, bukan
 * contoh tema). null bila galeri kosong atau disembunyikan pelanggan → pakai gambar default platform.
 */
export function sharePhoto(saved: unknown): string | null {
  const s = saved as { gallery?: unknown, gallery_section?: { enabled?: unknown } } | null
  if (s?.gallery_section?.enabled === false) return null
  const gallery = s?.gallery
  if (!Array.isArray(gallery)) return null
  for (const g of gallery) {
    const url = typeof (g as { url?: unknown })?.url === 'string' ? (g as { url: string }).url.trim() : ''
    if (/^https?:\/\//.test(url)) return url
  }
  return null
}
