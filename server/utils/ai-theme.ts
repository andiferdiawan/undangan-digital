import Anthropic from '@anthropic-ai/sdk'
import {
  ALLOWED_ATTRS, ALLOWED_FONTS, ALLOWED_TAGS, COLOR_CLASS, COMPONENTS, PLACEHOLDERS,
  REPEAT_FIELDS, REPEAT_SOURCES, REQUIRED_PLACEHOLDERS, REQUIRED_SECTIONS, SECTION_TYPES,
} from '../../shared/theme/constants'
import { ASSET_LIBRARY } from '../../shared/theme/asset-library'
import { compileTheme, type CompileResult } from './theme-compiler'
import { type ChatMessage, extractJson, type FreeModel, openRouterChat } from './openrouter'
import { geminiChat } from './gemini'

/**
 * Structured outputs tidak mendukung skema rekursif, jadi pohon node "dibuka"
 * sampai AI_MAX_DEPTH level dengan $defs berantai (node1 → node2 → …).
 */
const AI_MAX_DEPTH = 6
const s = { type: 'string' }

function buildSchema(categories: string[]) {
  const allProps = [...new Set(Object.values(COMPONENTS).flatMap(c => c.props as readonly string[]))]
  const defs: Record<string, unknown> = {
    attrs: {
      type: 'object',
      properties: Object.fromEntries(ALLOWED_ATTRS.map(a => [a, s])),
      additionalProperties: false,
    },
    props: {
      type: 'object',
      properties: Object.fromEntries(allProps.map(p => [p, s])),
      additionalProperties: false,
    },
  }
  for (let level = 1; level <= AI_MAX_DEPTH; level++) {
    const properties: Record<string, unknown> = {
      tag: { type: 'string', enum: [...ALLOWED_TAGS] },
      class: s,
      text: s,
      attrs: { $ref: '#/$defs/attrs' },
      bg: s,
      if: s,
      repeat: { type: 'string', enum: [...REPEAT_SOURCES] },
      component: { type: 'string', enum: Object.keys(COMPONENTS) },
      props: { $ref: '#/$defs/props' },
    }
    if (level < AI_MAX_DEPTH) properties.children = { type: 'array', items: { $ref: `#/$defs/node${level + 1}` } }
    defs[`node${level}`] = { type: 'object', properties, additionalProperties: false }
  }

  const font = { type: 'string', enum: [...ALLOWED_FONTS] }
  const color = { type: 'string', description: 'Hex 6 digit, mis. #7fa07f' }
  return {
    type: 'object',
    $defs: defs,
    properties: {
      name: { type: 'string', description: 'Nama produk tema, 2-3 kata, menarik' },
      description: { type: 'string', description: 'Deskripsi singkat 1 kalimat untuk katalog (bahasa Indonesia)' },
      category: { type: 'string', enum: categories },
      globals: {
        type: 'object',
        properties: {
          primary_color: color, secondary_color: color, accent_color: color, background_color: color,
          surface_color: color, text_color: color, muted_color: color,
          font_heading: font, font_body: font, font_script: font,
        },
        required: ['primary_color', 'secondary_color', 'accent_color', 'background_color', 'surface_color', 'text_color', 'muted_color', 'font_heading', 'font_body', 'font_script'],
        additionalProperties: false,
      },
      root_class: s,
      assets: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', description: 'snake_case, mis. pattern, corner, hero_image' },
            path: { type: 'string', enum: ASSET_LIBRARY.map(a => a.path) },
          },
          required: ['key', 'path'],
          additionalProperties: false,
        },
      },
      sections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: [...SECTION_TYPES] },
            class: s,
            bg: s,
            children: { type: 'array', items: { $ref: '#/$defs/node1' } },
          },
          required: ['type', 'children'],
          additionalProperties: false,
        },
      },
    },
    required: ['name', 'description', 'category', 'globals', 'root_class', 'assets', 'sections'],
    additionalProperties: false,
  }
}

function systemPrompt() {
  const placeholders = Object.entries(PLACEHOLDERS).map(([k, v]) => `- {{${k}}}: ${v}`).join('\n')
  const repeats = Object.entries(REPEAT_FIELDS).map(([k, f]) => `- repeat "${k}": ${f.map(x => `{{item.${x}}}`).join(', ')}`).join('\n')
  const components = Object.entries(COMPONENTS).map(([k, c]) => `- ${k}: props ${(c.props as readonly string[]).join(', ') || '-'}`).join('\n')
  const assets = ASSET_LIBRARY.map(a => `- ${a.path}: ${a.desc}`).join('\n')
  const colors = Object.entries(COLOR_CLASS).map(([k, c]) => `${k} → kelas "${c}" (bg-${c}, text-${c}, border-${c}/40, dst.)`).join('\n')

  return `Anda adalah desainer UI senior yang merancang tema undangan pernikahan digital untuk marketplace di Indonesia.
Tema dirender oleh sistem dari JSON terstruktur (Standardized Template Framework), BUKAN HTML bebas. Hasil Anda harus langsung lolos validator.

# Target
- Khusus layar ponsel (lebar ±390px). Jangan pakai breakpoint (sm:, md:, lg:).
- Kualitas setara desainer profesional: hierarki tipografi jelas, ruang napas lega, ornamen seperlunya, kontras teks cukup.
- Semua teks statis dalam bahasa Indonesia (boleh sapaan Inggris singkat seperti "The Wedding of").

# Styling
- Gunakan kelas utilitas Tailwind CSS v3 (dikompilasi UnoCSS preset-wind3). Nilai arbitrer boleh, mis. text-[28px], rounded-t-[120px], shadow-[0_8px_24px_rgba(0,0,0,0.08)].
- DILARANG: url(...) di kelas, breakpoint, kelas custom yang bukan utilitas Tailwind.
- Jangan pakai "text-base" (bentrok dengan warna latar "base"): untuk ukuran pakai "text-[16px]", untuk warna teks pakai "text-ink".
- Tema berbasis foto boleh memakai komponen "photo_slider" (foto dari Foto Sampul pelanggan, fallback galeri) sebagai latar section yang "relative overflow-hidden".
- Untuk galeri, komponen "gallery_carousel" menampilkan foto galeri yang bisa digeser satu per satu (swipe, tombol, titik); atur tampilannya lewat props item_class, image_class, text_class, button_class, dot_class.
- Kelas motion (opsional): "uv-reveal", "uv-reveal-zoom", "uv-reveal-left", "uv-reveal-right", "uv-reveal-flip", "uv-reveal-mask" (foto tersingkap seperti tirai), "uv-reveal-pop" (muncul memantul) = muncul beranimasi saat digulir, tunda dengan "uv-d1".."uv-d5"; "uv-tilt" = kartu 3D mengikuti kemiringan ponsel, anaknya boleh "uv-depth-1".."uv-depth-3" untuk lapisan (jangan beri overflow-hidden pada "uv-tilt"); "uv-float3d"/"uv-spin3d" = ornamen berputar 3D; "uv-wiggle" = goyang ala coretan; "uv-float" = melayang naik-turun; garis cerita: wadah "uv-scroll-line" (absolute, setinggi section) berisi img garis gelombang "uv-scroll-draw" dan penanda "uv-scroll-follow" (atur [--uv-amp:34] dan [--uv-waves:0.5] sesuai bentuk gelombang); "uv-shine" = kilau. Jangan gabungkan kelas motion dengan kelas translate/rotate/scale di elemen yang sama.
- Warna WAJIB lewat variabel global agar user bisa menggantinya:
${colors}
- Font: font-heading, font-body, font-script, dan font-arabic (Amiri, untuk teks Arab).
- Section "cover" & "hero": gunakan "relative" bila memuat elemen absolute. Cover harus mengisi layar (flex, items-center, justify-center; tinggi diurus sistem). Hero: min-h-[100svh].

# Struktur
- sections: ARRAY berisi urutan section (disarankan 8–11 section). WAJIB ada minimal: ${REQUIRED_SECTIONS.join(', ')}. Urutan yang dianjurkan: cover, hero, quote, profile, event, countdown, gallery, rsvp, wishes, gift, closing. Tersedia juga: ${SECTION_TYPES.filter(t => !(REQUIRED_SECTIONS as readonly string[]).includes(t)).join(', ')}.
- Jika ada "cover", ia harus section PERTAMA dan wajib memuat komponen open_button serta guest_name.
- Node: { tag, class, text, attrs, bg, if, repeat, component, props, children }. Kedalaman maksimal ${AI_MAX_DEPTH} level.
- tag yang boleh: ${ALLOWED_TAGS.join(', ')}.
- attrs.src / attrs.href / bg harus berupa SATU placeholder utuh, mis. "{{asset.pattern}}", "{{groom_photo}}", "{{item.url}}". img wajib punya attrs.src.
- "if": tampilkan node hanya jika nilai tidak kosong, mis. "gallery", "story", "gifts", "groom_photo", "item.map_url"; awali "!" untuk kebalikan ("!groom_photo").
- "repeat": node diulang untuk setiap item daftar; di dalamnya gunakan {{item.field}} dan {{index}}. Repeat tidak boleh bertingkat.
- Section gallery/story/gift: bungkus isinya dalam node dengan if (gallery/story/gifts) agar tersembunyi saat kosong.

# Placeholder (data user) — hanya yang ada di daftar ini
${placeholders}
Daftar berulang:
${repeats}
Aset: {{asset.<key>}} sesuai daftar "assets" yang Anda definisikan.
WAJIB dipakai: ${REQUIRED_PLACEHOLDERS.map(p => `{{${p}}}`).join(', ')} (event_date & location_map boleh diwakili {{item.date}} & {{item.map_url}} di dalam repeat events).

# Komponen interaktif bawaan (isi "component" dan "props")
${components}
- Kelas styling komponen diberikan via props *_class; class node membungkus komponen.
- map_button.props.href = "{{item.map_url}}" atau "{{location_map}}"; copy_button.props.value = "{{item.number}}".
- Section rsvp wajib memuat rsvp_form; section wishes memuat wishes; section countdown memuat countdown (dan idealnya calendar_button).

# Aset ornamen (pilih dari pustaka; jangan mengarang path)
${assets}
- Jika user ingin mengganti latar sampul dengan foto, pakai bg "{{hero_image}}" dan daftarkan aset dengan key "hero_image".

# Nilai syar'i (jika diminta tema islami/syar'i)
Tidak menampilkan wajah (gunakan ilustrasi faceless atau monogram nama bila foto kosong), tidak ada musik, sertakan Bismillah, ayat/kutipan, dan salam.`
}

export interface AiThemeMeta { name: string, description: string, category: string }
export interface AiThemeResult extends CompileResult {
  meta: AiThemeMeta | null
  attempts: number
  model: string
  raw: unknown
}

/** Rapikan bentuk jawaban model yang sedikit meleset (dibungkus {"theme": …}, sections berupa objek per tipe). */
function normalizeRaw(raw: any): any {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && !raw.sections) {
    const inner = Object.values(raw).find((v: any) => v && typeof v === 'object' && !Array.isArray(v) && v.sections)
    if (inner) raw = inner
  }
  if (raw?.sections && !Array.isArray(raw.sections) && typeof raw.sections === 'object') {
    raw.sections = Object.entries(raw.sections).map(([type, v]: [string, any]) =>
      Array.isArray(v) ? { type, children: v } : { type, ...(v ?? {}) })
  }
  return raw
}

/** Petunjuk tambahan pada putaran perbaikan bila struktur section kurang. */
function repairHint(raw: any, errors: string[]) {
  const have = new Set<string>((Array.isArray(raw?.sections) ? raw.sections : []).map((x: any) => String(x?.type)))
  const missing = REQUIRED_SECTIONS.filter(t => !have.has(t))
  if (!missing.length && !errors.some(e => e.startsWith('sections'))) return ''
  return `\n\nSection yang ada sekarang: ${[...have].join(', ') || '(kosong)'}.${missing.length ? ` Yang WAJIB ditambahkan: ${missing.join(', ')}.` : ''} Kirim ulang tema LENGKAP dengan semua section (cover, hero, quote, profile, event, countdown, gallery, rsvp, wishes, gift, closing), bukan hanya bagian yang diperbaiki.`
}

function toDefinition(raw: any) {
  const assets: Record<string, string> = {}
  for (const a of raw?.assets ?? []) if (a?.key && a?.path) assets[a.key] = a.path
  return {
    version: 1,
    globals: raw?.globals,
    root_class: raw?.root_class || undefined,
    assets,
    sections: raw?.sections,
  }
}

/**
 * Pipeline: prompt → Claude (JSON terstruktur) → konversi → validasi + kompilasi CSS.
 * Bila validasi gagal, error dikirim balik ke model untuk diperbaiki (maks. 1 kali).
 */
export async function generateTheme(opts: {
  apiKey: string
  model: string
  prompt: string
  categories: string[]
}): Promise<AiThemeResult> {
  const client = new Anthropic({ apiKey: opts.apiKey, timeout: 290_000, maxRetries: 1 })
  const schema = buildSchema(opts.categories)
  const system = systemPrompt()
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: 'user', content: `Buatkan satu tema undangan pernikahan lengkap berdasarkan brief berikut:\n\n${opts.prompt}` },
  ]

  let last: AiThemeResult | null = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    const stream = client.beta.messages.stream({
      model: opts.model,
      max_tokens: 64000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: { effort: 'medium', format: { type: 'json_schema', schema } },
      system,
      messages,
    })
    const msg = await stream.finalMessage()

    if (msg.stop_reason === 'refusal')
      throw new Error(`Model menolak permintaan (${msg.stop_details?.category ?? 'tanpa kategori'}). Ubah brief lalu coba lagi.`)
    if (msg.stop_reason === 'max_tokens')
      throw new Error('Output AI terpotong (melebihi batas token). Sederhanakan brief lalu coba lagi.')

    const text = msg.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text').map(b => b.text).join('')
    let raw: any
    try {
      raw = JSON.parse(text)
    }
    catch {
      throw new Error('Output AI bukan JSON yang valid.')
    }

    const compiled = await compileTheme(toDefinition(raw))
    last = {
      ...compiled,
      meta: raw ? { name: String(raw.name ?? ''), description: String(raw.description ?? ''), category: String(raw.category ?? '') } : null,
      attempts: attempt,
      model: msg.model,
      raw,
    }
    if (compiled.ok) return last

    // Putaran perbaikan: kembalikan error validator ke model (riwayat append-only)
    messages.push({ role: 'assistant', content: msg.content })
    messages.push({
      role: 'user',
      content: `Validator menolak tema tersebut dengan error berikut. Perbaiki SEMUA error dan kirim ulang tema lengkap:\n${compiled.errors.map(e => `- ${e}`).join('\n')}`,
    })
  }
  return last!
}

/** Panduan format JSON eksplisit untuk model tanpa structured outputs (mis. sebagian model gratis OpenRouter). */
function jsonFormatGuide(categories: string[]) {
  return `

# Format jawaban (WAJIB)
Balas HANYA dengan SATU objek JSON valid — tanpa penjelasan, tanpa markdown, tanpa \`\`\`. Strukturnya:
{
  "name": "Nama Tema 2-3 kata",
  "description": "Deskripsi 1 kalimat bahasa Indonesia",
  "category": "salah satu dari: ${categories.join(', ')}",
  "globals": { "primary_color": "#xxxxxx", "secondary_color": "#xxxxxx", "accent_color": "#xxxxxx", "background_color": "#xxxxxx", "surface_color": "#xxxxxx", "text_color": "#xxxxxx", "muted_color": "#xxxxxx", "font_heading": "…", "font_body": "…", "font_script": "…" },
  "root_class": "text-[15px] leading-relaxed",
  "assets": [ { "key": "pattern", "path": "path dari pustaka aset" } ],
  "sections": [
    { "type": "cover", "class": "…", "children": [ { "tag": "p", "class": "…", "text": "…" }, { "component": "guest_name", "class": "…", "props": { "fallback": "Tamu Undangan" } }, { "component": "open_button", "class": "…", "props": { "label": "Buka Undangan" } } ] },
    { "type": "hero", "class": "…", "children": [ … ] },
    { "type": "quote", … }, { "type": "profile", … }, { "type": "event", … }, { "type": "countdown", … },
    { "type": "gallery", … }, { "type": "rsvp", … }, { "type": "wishes", … }, { "type": "gift", … }, { "type": "closing", … }
  ]
}
"sections" WAJIB berisi SEMUA section di atas secara lengkap (minimal ${REQUIRED_SECTIONS.join(', ')}), masing-masing dengan children lengkap. Jangan memotong jawaban.
Font WAJIB salah satu dari: ${ALLOWED_FONTS.join(', ')}.
Setiap node hanya boleh berisi kunci: tag, class, text, attrs, bg, if, repeat, component, props, children.`
}

/**
 * Pipeline sama seperti generateTheme, tetapi lewat OpenRouter (model gratis). Model gratis lambat, jadi SATU request
 * = SATU panggilan model (batas fungsi Vercel 300 dtk). Bila hasilnya belum lolos validator, browser memanggil lagi
 * dengan `previous` (jawaban sebelumnya + error) sebagai putaran perbaikan di request terpisah.
 */
export async function generateThemeOpenRouter(opts: {
  apiKey: string
  model: FreeModel
  prompt: string
  categories: string[]
  siteUrl: string
  timeoutMs: number
  previous?: { text: string, errors: string[], attempt: number }
}): Promise<AiThemeResult & { rawText: string }> {
  const schema = buildSchema(opts.categories)
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt() + (opts.model.structured ? '' : jsonFormatGuide(opts.categories)) },
    { role: 'user', content: `Buatkan satu tema undangan pernikahan lengkap berdasarkan brief berikut:\n\n${opts.prompt}` },
  ]
  const attempt = (opts.previous?.attempt ?? 0) + 1
  if (opts.previous) {
    let prevRaw: any = null
    try { prevRaw = normalizeRaw(extractJson(opts.previous.text)) }
    catch { /* jawaban sebelumnya bukan JSON */ }
    messages.push({ role: 'assistant', content: opts.previous.text })
    messages.push({
      role: 'user',
      content: prevRaw
        ? `Validator menolak tema tersebut dengan error berikut. Perbaiki SEMUA error dan kirim ulang tema lengkap (hanya JSON):\n${opts.previous.errors.map(e => `- ${e}`).join('\n')}${repairHint(prevRaw, opts.previous.errors)}`
        : 'Jawaban tadi bukan JSON valid. Kirim ulang HANYA objek JSON tema lengkap, tanpa teks lain.',
    })
  }

  const res = await openRouterChat({ apiKey: opts.apiKey, model: opts.model, messages, siteUrl: opts.siteUrl, jsonSchema: schema, timeoutMs: opts.timeoutMs })
  if (res.finish === 'length')
    throw new Error('Output AI terpotong (batas token model gratis). Sederhanakan brief atau pilih model dengan keluaran lebih panjang.')

  let raw: any
  try {
    raw = normalizeRaw(extractJson(res.text))
  }
  catch {
    return { ok: false, errors: ['Jawaban AI bukan JSON yang valid.'], warnings: [], classes: [], css: '', meta: null, attempts: attempt, model: res.model, raw: null, rawText: res.text.slice(0, 60_000) }
  }
  const compiled = await compileTheme(toDefinition(raw))
  return {
    ...compiled,
    meta: { name: String(raw?.name ?? ''), description: String(raw?.description ?? ''), category: String(raw?.category ?? '') },
    attempts: attempt,
    model: res.model,
    raw,
    rawText: res.text,
  }
}

/**
 * Pipeline yang sama lewat Google Gemini (AI Studio, gratis). Satu request = satu panggilan model; putaran
 * perbaikan dijalankan browser sebagai request terpisah (sama seperti OpenRouter).
 */
export async function generateThemeGemini(opts: {
  apiKey: string
  model: string
  prompt: string
  categories: string[]
  timeoutMs: number
  previous?: { text: string, errors: string[], attempt: number }
}): Promise<AiThemeResult & { rawText: string }> {
  const turns: { role: 'user' | 'assistant', content: string }[] = [
    { role: 'user', content: `Buatkan satu tema undangan pernikahan lengkap berdasarkan brief berikut:\n\n${opts.prompt}` },
  ]
  const attempt = (opts.previous?.attempt ?? 0) + 1
  if (opts.previous) {
    let prevRaw: any = null
    try { prevRaw = normalizeRaw(extractJson(opts.previous.text)) }
    catch { /* jawaban sebelumnya bukan JSON */ }
    turns.push({ role: 'assistant', content: opts.previous.text })
    turns.push({
      role: 'user',
      content: prevRaw
        ? `Validator menolak tema tersebut dengan error berikut. Perbaiki SEMUA error dan kirim ulang tema lengkap (hanya JSON):\n${opts.previous.errors.map(e => `- ${e}`).join('\n')}${repairHint(prevRaw, opts.previous.errors)}`
        : 'Jawaban tadi bukan JSON valid. Kirim ulang HANYA objek JSON tema lengkap, tanpa teks lain.',
    })
  }

  const res = await geminiChat({
    apiKey: opts.apiKey, model: opts.model, system: systemPrompt() + jsonFormatGuide(opts.categories),
    turns, json: true, temperature: 0.6, maxOutput: 65_536, timeoutMs: opts.timeoutMs,
  })
  if (res.finish === 'length')
    throw new Error('Output AI terpotong (batas token). Sederhanakan brief lalu coba lagi.')

  let raw: any
  try {
    raw = normalizeRaw(extractJson(res.text))
  }
  catch {
    return { ok: false, errors: ['Jawaban AI bukan JSON yang valid.'], warnings: [], classes: [], css: '', meta: null, attempts: attempt, model: res.model, raw: null, rawText: res.text.slice(0, 60_000) }
  }
  const compiled = await compileTheme(toDefinition(raw))
  return {
    ...compiled,
    meta: { name: String(raw?.name ?? ''), description: String(raw?.description ?? ''), category: String(raw?.category ?? '') },
    attempts: attempt,
    model: res.model,
    raw,
    rawText: res.text,
  }
}
