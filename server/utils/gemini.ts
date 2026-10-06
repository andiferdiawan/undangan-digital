/**
 * Klien Google Gemini API (Google AI Studio, tier gratis) untuk generator tema & artikel blog.
 * Daftar model diambil langsung dari API (butuh API key), jadi nama model terbaru otomatis tersedia.
 */
const API = 'https://generativelanguage.googleapis.com/v1beta'
/** Dipakai bila daftar model gagal dimuat. */
export const GEMINI_FALLBACK_MODEL = 'gemini-2.5-flash'

export interface GeminiModel {
  id: string
  name: string
  context: number
  maxOutput: number
}

const cache = new Map<string, { at: number, models: GeminiModel[] }>()

/** Urutan prioritas: flash (cepat & kuota gratis besar) → flash-lite → pro; versi terbaru dulu. */
function rank(id: string) {
  const ver = Number(/gemini-(\d+(?:\.\d+)?)/.exec(id)?.[1] ?? 0)
  const tier = /flash-lite/.test(id) ? 1 : /flash/.test(id) ? 0 : /pro/.test(id) ? 2 : 3
  const unstable = /(preview|exp|latest)/.test(id) ? 1 : 0
  return { ver, tier, unstable }
}

/** Model Gemini berkeluaran teks yang mendukung generateContent. Di-cache 10 menit per key. */
export async function listGeminiModels(apiKey: string): Promise<GeminiModel[]> {
  const hit = cache.get(apiKey)
  if (hit && Date.now() - hit.at < 10 * 60_000) return hit.models
  const res = await $fetch<{ models?: any[] }>(`${API}/models`, {
    query: { pageSize: 200 },
    headers: { 'x-goog-api-key': apiKey },
    timeout: 15_000,
  }).catch((e: any) => {
    const status = e?.response?.status
    if (status === 400 || status === 401 || status === 403) throw new Error('API key Gemini tidak valid. Periksa di Admin → Pengaturan.')
    throw new Error(`Gagal memuat daftar model Gemini: ${e?.message ?? 'tidak diketahui'}`)
  })
  const models = (res.models ?? [])
    .filter((m) => {
      const id = String(m.name ?? '').replace(/^models\//, '')
      const methods = (m.supportedGenerationMethods ?? []) as string[]
      return id.startsWith('gemini-') && methods.includes('generateContent')
        && !/(embedding|image|tts|audio|live|vision|thinking-exp|robotics|computer-use)/.test(id)
    })
    .map((m): GeminiModel => ({
      id: String(m.name).replace(/^models\//, ''),
      name: String(m.displayName ?? m.name),
      context: Number(m.inputTokenLimit) || 0,
      maxOutput: Number(m.outputTokenLimit) || 8192,
    }))
    .sort((a, b) => {
      const x = rank(a.id)
      const y = rank(b.id)
      return x.unstable - y.unstable || x.tier - y.tier || y.ver - x.ver || a.id.localeCompare(b.id)
    })
  cache.set(apiKey, { at: Date.now(), models })
  return models
}

export type GeminiTurn = { role: 'user' | 'assistant', content: string }

/**
 * Satu panggilan generateContent. `json` = minta keluaran JSON (responseMimeType). Error API diterjemahkan
 * ke pesan yang jelas untuk admin. Batas waktu mencakup pembacaan seluruh jawaban.
 */
export async function geminiChat(o: {
  apiKey: string
  model: string
  system: string
  turns: GeminiTurn[]
  json?: boolean
  maxOutput?: number
  temperature?: number
  timeoutMs: number
}): Promise<{ text: string, model: string, finish: string }> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), Math.max(5_000, o.timeoutMs))
  let status = 0
  let body = ''
  try {
    const res = await fetch(`${API}/models/${encodeURIComponent(o.model)}:generateContent`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': o.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: o.system }] },
        contents: o.turns.map(t => ({ role: t.role === 'assistant' ? 'model' : 'user', parts: [{ text: t.content }] })),
        generationConfig: {
          temperature: o.temperature ?? 0.7,
          maxOutputTokens: Math.min(o.maxOutput ?? 32_768, 65_536),
          ...(o.json ? { responseMimeType: 'application/json' } : {}),
        },
      }),
    })
    status = res.status
    body = await res.text()
  }
  catch (err: any) {
    if (ctrl.signal.aborted) throw new Error('Gemini terlalu lama merespons (melebihi batas waktu server). Coba lagi atau pilih model flash yang lebih cepat.')
    throw new Error(`Gemini gagal (jaringan): ${err?.message ?? 'tidak diketahui'}`)
  }
  finally {
    clearTimeout(timer)
  }

  let res: any = null
  try { res = JSON.parse(body) }
  catch { /* ditangani di bawah */ }
  const detail = res?.error?.message || body.trim().slice(0, 200) || 'tidak diketahui'
  if (status === 400 && /api key/i.test(detail)) throw new Error('API key Gemini tidak valid. Periksa di Admin → Pengaturan.')
  if (status === 401 || status === 403) throw new Error('API key Gemini ditolak (tidak valid atau tidak punya akses ke model ini).')
  if (status === 404) throw new Error(`Model Gemini "${o.model}" tidak ditemukan. Pilih model lain di Pengaturan.`)
  if (status === 429) throw new Error('Kuota gratis Gemini tercapai (batas per menit/hari). Tunggu sebentar lalu coba lagi, atau pilih model flash-lite.')
  if (status >= 400 || !res) throw new Error(`Gemini gagal (${status}): ${detail}`)

  const cand = res.candidates?.[0]
  if (!cand) {
    const block = res.promptFeedback?.blockReason
    throw new Error(block ? `Gemini menolak permintaan (${block}). Ubah brief lalu coba lagi.` : 'Gemini tidak mengembalikan jawaban.')
  }
  // Abaikan bagian "thought" (ringkasan penalaran) bila ada
  const text = ((cand.content?.parts ?? []) as { text?: string, thought?: boolean }[])
    .filter(p => !p.thought).map(p => p.text ?? '').join('')
  const finish = String(cand.finishReason ?? '')
  return { text, model: String(res.modelVersion ?? o.model), finish: finish === 'MAX_TOKENS' ? 'length' : finish.toLowerCase() }
}
