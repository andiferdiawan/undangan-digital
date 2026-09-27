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

/** Data anak untuk undangan aqiqah (tidak dipakai tema pernikahan). */
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
  opening: { greeting: string, text: string }
  quote: { arabic: string, text: string, source: string }
  events: EventItem[]
  story: { date: string, title: string, text: string }[]
  gallery: { url: string, caption: string }[]
  /** Foto untuk slider sampul (tema dengan photo_slider). */
  cover_photos: { url: string }[]
  gifts: { bank: string, number: string, holder: string }[]
  rsvp: { enabled: boolean }
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
  cover_photos: [],
  gifts: [
    { bank: 'Bank Syariah Indonesia', number: '1234567890', holder: 'Ahmad Fauzan' },
  ],
  rsvp: { enabled: true },
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

export type ContentKind = 'wedding' | 'aqiqah'

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

/**
 * Gabungkan konten tersimpan dengan default agar field baru selalu ada. Array tidak digabung.
 * kind menentukan contoh isi (pernikahan atau aqiqah) untuk field yang belum diisi.
 */
export function withDefaults(saved: unknown, kind: ContentKind = 'wedding'): InvitationContent {
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
  return merge(kind === 'aqiqah' ? AQIQAH_CONTENT : DEFAULT_CONTENT, saved)
}

/** Nama yang ditampilkan untuk undangan (judul, pratinjau link, dashboard). */
export function inviteNames(c: InvitationContent, kind: ContentKind = 'wedding'): string {
  return kind === 'aqiqah' ? c.child.nickname || c.child.name : `${c.groom.nickname} & ${c.bride.nickname}`
}
export function inviteTitle(c: InvitationContent, kind: ContentKind = 'wedding'): string {
  return kind === 'aqiqah' ? `Undangan Aqiqah ${inviteNames(c, kind)}` : `Undangan Pernikahan ${inviteNames(c, kind)}`
}
