import Anthropic from '@anthropic-ai/sdk'
import {
  ALLOWED_ATTRS, ALLOWED_FONTS, ALLOWED_TAGS, COLOR_CLASS, COMPONENTS, PLACEHOLDERS,
  REPEAT_FIELDS, REPEAT_SOURCES, REQUIRED_PLACEHOLDERS, REQUIRED_SECTIONS, SECTION_TYPES,
} from '../../shared/theme/constants'
import { ASSET_LIBRARY } from '../../shared/theme/asset-library'
import { compileTheme, type CompileResult } from './theme-compiler'

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
- Warna WAJIB lewat variabel global agar user bisa menggantinya:
${colors}
- Font: font-heading, font-body, font-script, dan font-arabic (Amiri, untuk teks Arab).
- Section "cover" & "hero": gunakan "relative" bila memuat elemen absolute. Cover harus mengisi layar (flex, items-center, justify-center; tinggi diurus sistem). Hero: min-h-[100svh].

# Struktur
- sections: urutan section. WAJIB ada: ${REQUIRED_SECTIONS.join(', ')}. Tersedia juga: ${SECTION_TYPES.filter(t => !(REQUIRED_SECTIONS as readonly string[]).includes(t)).join(', ')}.
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
