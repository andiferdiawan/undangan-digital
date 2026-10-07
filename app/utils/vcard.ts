/**
 * Baca file kontak vCard (.vcf) dari Kontak iPhone/iCloud, Google Contacts, atau ekspor Kontak Android.
 * Hanya nama & nomor telepon yang diambil.
 */
export interface VcfContact { name: string, phones: string[] }

function decodeQuotedPrintable(s: string, charset = 'utf-8') {
  const bytes: number[] = []
  const src = s.replace(/=\r?\n/g, '')
  for (let i = 0; i < src.length; i++) {
    const hex = src.slice(i + 1, i + 3)
    if (src[i] === '=' && /^[0-9A-F]{2}$/i.test(hex)) { bytes.push(Number.parseInt(hex, 16)); i += 2 }
    else bytes.push(src.charCodeAt(i) & 0xFF)
  }
  try { return new TextDecoder(charset).decode(new Uint8Array(bytes)) }
  catch { return new TextDecoder().decode(new Uint8Array(bytes)) }
}

const unescapeValue = (s: string) => s.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1').trim()

export function parseVcf(text: string): VcfContact[] {
  // Gabungkan baris terlipat (diawali spasi/tab) dan baris lanjutan quoted-printable (diakhiri "=")
  const raw = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '')
  const lines: string[] = []
  for (const line of raw.split('\n')) {
    const prev = lines[lines.length - 1]
    if (prev !== undefined && /ENCODING=QUOTED-PRINTABLE/i.test(prev.split(':')[0]!) && prev.endsWith('=')) lines[lines.length - 1] = `${prev.slice(0, -1)}${line}`
    else lines.push(line)
  }

  const out: VcfContact[] = []
  let cur: { fn: string, n: string, org: string, phones: string[] } | null = null
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const head = line.slice(0, idx)
    const params = head.split(';')
    const prop = params[0]!.replace(/^item\d+\./i, '').toUpperCase()
    let value = line.slice(idx + 1)
    if (prop === 'BEGIN' && /^vcard$/i.test(value.trim())) { cur = { fn: '', n: '', org: '', phones: [] }; continue }
    if (!cur) continue
    if (prop === 'END') {
      const name = cur.fn || cur.n || cur.org
      const phones = [...new Set(cur.phones)]
      if (name || phones.length) out.push({ name: name.slice(0, 100), phones })
      cur = null
      continue
    }
    if (params.some(p => /^ENCODING=QUOTED-PRINTABLE$/i.test(p))) {
      const cs = params.find(p => /^CHARSET=/i.test(p))?.split('=')[1]
      value = decodeQuotedPrintable(value, cs || 'utf-8')
    }
    if (prop === 'FN') cur.fn = unescapeValue(value)
    else if (prop === 'N') {
      // N: Belakang;Depan;Tengah;Awalan;Akhiran
      const [last = '', first = '', middle = '', prefix = '', suffix = ''] = value.split(/(?<!\\);/).map(unescapeValue)
      cur.n = [prefix, first, middle, last, suffix].filter(Boolean).join(' ')
    }
    else if (prop === 'ORG') cur.org = unescapeValue(value.split(/(?<!\\);/)[0] ?? '')
    else if (prop === 'TEL') {
      const tel = value.replace(/^tel:/i, '').replace(/[^\d+]/g, '')
      if (tel.replace(/\D/g, '').length >= 6) cur.phones.push(tel)
    }
  }
  return out
}
