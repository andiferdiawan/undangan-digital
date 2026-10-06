import type { H3Event } from 'h3'

/**
 * Klien OpenRouter (API kompatibel OpenAI) untuk generator tema AI memakai model gratis.
 * Daftar model diambil dari https://openrouter.ai/api/v1/models lalu disaring yang tarifnya 0.
 */
const API = 'https://openrouter.ai/api/v1'
/** Router OpenRouter yang otomatis memakai salah satu model gratis yang tersedia. */
const FREE_ROUTER = 'openrouter/free'

export interface FreeModel {
  id: string
  name: string
  context: number
  /** Batas token keluaran dari penyedia teratas (null = tidak diketahui). */
  maxOutput: number | null
  /** Mendukung response_format json_schema (structured outputs). */
  structured: boolean
  /** Mendukung response_format json_object. */
  jsonMode: boolean
}

let cache: { at: number, models: FreeModel[] } | null = null

/** Model gratis berkeluaran teks (router otomatis dulu). Di-cache 10 menit. */
export async function listFreeModels(): Promise<FreeModel[]> {
  if (cache && Date.now() - cache.at < 10 * 60_000) return cache.models
  const res = await $fetch<{ data?: any[] }>(`${API}/models`, { timeout: 15_000 })
  const models = (res.data ?? [])
    .filter((m) => {
      const id = String(m.id)
      // Hanya model yang pasti gratis: akhiran ":free", atau router gratis bawaan OpenRouter
      const free = id.endsWith(':free') || id === FREE_ROUTER
      const text = !m.architecture?.output_modalities || (m.architecture.output_modalities as string[]).includes('text')
      return free && text
    })
    .map((m): FreeModel => {
      const params = (m.supported_parameters ?? []) as string[]
      return {
        id: String(m.id),
        name: m.id === FREE_ROUTER ? 'Otomatis (router model gratis OpenRouter)' : String(m.name ?? m.id),
        context: Number(m.context_length) || 0,
        maxOutput: Number(m.top_provider?.max_completion_tokens) || null,
        structured: params.includes('structured_outputs'),
        jsonMode: params.includes('response_format'),
      }
    })
    // Router otomatis dulu, lalu yang mendukung JSON terstruktur, lalu konteks terbesar
    .sort((a, b) => Number(b.id === FREE_ROUTER) - Number(a.id === FREE_ROUTER)
      || Number(b.structured) - Number(a.structured)
      || b.context - a.context)
  cache = { at: Date.now(), models }
  return models
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant', content: string }

/** Satu panggilan chat completion. Error OpenRouter diterjemahkan ke pesan yang jelas untuk admin. */
export async function openRouterChat(o: {
  apiKey: string
  model: FreeModel
  messages: ChatMessage[]
  siteUrl: string
  jsonSchema?: Record<string, unknown>
}): Promise<{ text: string, model: string, finish: string }> {
  const maxTokens = Math.min(o.model.maxOutput ?? 32_000, 32_000)
  const responseFormat = o.model.structured && o.jsonSchema
    ? { type: 'json_schema', json_schema: { name: 'tema_undangan', strict: true, schema: o.jsonSchema } }
    : o.model.jsonMode ? { type: 'json_object' } : undefined

  let res: any
  try {
    res = await $fetch(`${API}/chat/completions`, {
      method: 'POST',
      timeout: 280_000,
      headers: {
        'Authorization': `Bearer ${o.apiKey}`,
        'HTTP-Referer': o.siteUrl,
        'X-Title': 'Undangan Virtual — Generator Tema',
      },
      body: {
        model: o.model.id,
        messages: o.messages,
        max_tokens: maxTokens,
        temperature: 0.6,
        ...(responseFormat ? { response_format: responseFormat } : {}),
      },
    })
  }
  catch (err: any) {
    const status = err?.response?.status ?? err?.statusCode
    const detail = err?.data?.error?.message || err?.message || 'tidak diketahui'
    if (status === 401) throw new Error('API key OpenRouter tidak valid. Periksa di Admin → Pengaturan.')
    if (status === 402) throw new Error('Kredit OpenRouter tidak cukup untuk model ini. Pilih model berlabel gratis.')
    if (status === 429) throw new Error('Batas pemakaian gratis OpenRouter tercapai atau model sedang ramai. Tunggu sebentar atau pilih model lain.')
    throw new Error(`OpenRouter gagal (${status ?? 'jaringan'}): ${detail}`)
  }
  if (res?.error) throw new Error(`OpenRouter: ${res.error.message ?? 'error tidak diketahui'}`)
  const choice = res?.choices?.[0]
  return { text: String(choice?.message?.content ?? ''), model: String(res?.model ?? o.model.id), finish: String(choice?.finish_reason ?? '') }
}

/** Ambil objek JSON dari jawaban model (buang blok <think>, pagar ```json, dan teks di luar kurung kurawal). */
export function extractJson(text: string): unknown {
  const t = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  const a = t.indexOf('{')
  const b = t.lastIndexOf('}')
  if (a < 0 || b <= a) throw new Error('Jawaban AI tidak berisi JSON.')
  return JSON.parse(t.slice(a, b + 1))
}

/**
 * API key + model OpenRouter: utamakan yang diisi admin di halaman Pengaturan (Supabase Vault),
 * jatuh ke env NUXT_OPENROUTER_API_KEY / NUXT_OPENROUTER_MODEL bila belum diisi.
 */
export async function getOpenRouterConfig(event: H3Event): Promise<{ apiKey: string, model: string, source: 'settings' | 'env' | null }> {
  const config = useRuntimeConfig(event)
  try {
    const db = await serverRpc<{ openrouter_key: string | null, openrouter_model: string }>(event, 'server_ai_config', {})
    if (db?.openrouter_key) return { apiKey: db.openrouter_key, model: db.openrouter_model || config.openrouter?.model || '', source: 'settings' }
    if (config.openrouter?.apiKey) return { apiKey: config.openrouter.apiKey, model: db?.openrouter_model || config.openrouter.model || '', source: 'env' }
  }
  catch (e) {
    console.error('[openrouter] gagal membaca pengaturan AI:', e instanceof Error ? e.message : e)
    if (config.openrouter?.apiKey) return { apiKey: config.openrouter.apiKey, model: config.openrouter.model || '', source: 'env' }
  }
  return { apiKey: '', model: '', source: null }
}
