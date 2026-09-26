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
  groom: Person
  bride: Person
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

function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

/** Gabungkan konten tersimpan dengan default agar field baru selalu ada. Array tidak digabung. */
export function withDefaults(saved: unknown): InvitationContent {
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
  return merge(DEFAULT_CONTENT, saved)
}
