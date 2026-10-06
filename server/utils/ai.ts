import type { H3Event } from 'h3'
import { type ChatMessage, listFreeModels, openRouterChat } from './openrouter'
import { GEMINI_FALLBACK_MODEL, type GeminiTurn, geminiChat, listGeminiModels } from './gemini'

/** Penyedia AI gratis yang bisa dipilih admin (Anthropic tetap tersedia khusus generator tema via env). */
export type AiProvider = 'openrouter' | 'gemini'
type Source = 'settings' | 'env' | null

export interface AiConfig {
  defaultProvider: AiProvider | ''
  openrouter: { apiKey: string, model: string, source: Source }
  gemini: { apiKey: string, model: string, source: Source }
}

/**
 * API key & model tiap penyedia: utamakan yang diisi admin di Pengaturan (Supabase Vault), jatuh ke env
 * (NUXT_OPENROUTER_API_KEY / NUXT_GEMINI_API_KEY, dst.) bila belum diisi.
 */
export async function getAiConfig(event: H3Event): Promise<AiConfig> {
  const config = useRuntimeConfig(event)
  const env = {
    or: { key: String(config.openrouter?.apiKey ?? ''), model: String(config.openrouter?.model ?? '') },
    gm: { key: String(config.gemini?.apiKey ?? ''), model: String(config.gemini?.model ?? '') },
  }
  let db: { openrouter_key?: string | null, openrouter_model?: string, gemini_key?: string | null, gemini_model?: string, default_provider?: string } = {}
  try {
    db = await serverRpc<typeof db>(event, 'server_ai_config', {}) ?? {}
  }
  catch (e) {
    console.error('[ai] gagal membaca pengaturan AI:', e instanceof Error ? e.message : e)
  }
  const pick = (dbKey: string | null | undefined, dbModel: string | undefined, e: { key: string, model: string }) =>
    dbKey ? { apiKey: dbKey, model: dbModel || e.model, source: 'settings' as const }
      : e.key ? { apiKey: e.key, model: dbModel || e.model, source: 'env' as const }
        : { apiKey: '', model: dbModel || e.model, source: null }
  const dp = db.default_provider
  return {
    defaultProvider: dp === 'openrouter' || dp === 'gemini' ? dp : '',
    openrouter: pick(db.openrouter_key, db.openrouter_model, env.or),
    gemini: pick(db.gemini_key, db.gemini_model, env.gm),
  }
}

/** Penyedia yang dipakai: pilihan eksplisit → default admin (bila key ada) → Gemini → OpenRouter. */
export function pickProvider(cfg: AiConfig, wanted?: AiProvider | null): AiProvider | null {
  const has = (p: AiProvider) => !!cfg[p].apiKey
  if (wanted) return has(wanted) ? wanted : null
  if (cfg.defaultProvider && has(cfg.defaultProvider)) return cfg.defaultProvider
  if (has('gemini')) return 'gemini'
  if (has('openrouter')) return 'openrouter'
  return null
}

export const PROVIDER_LABEL: Record<AiProvider, string> = { openrouter: 'OpenRouter', gemini: 'Gemini (Google AI Studio)' }

/**
 * Satu panggilan teks ke penyedia terpilih. `json` meminta keluaran JSON bila penyedia mendukungnya.
 * Untuk OpenRouter hanya model gratis yang boleh dipakai (cegah tagihan tak terduga).
 */
export async function aiText(o: {
  cfg: AiConfig
  provider: AiProvider
  model?: string
  system: string
  turns: GeminiTurn[]
  json?: boolean
  temperature?: number
  siteUrl: string
  timeoutMs: number
}): Promise<{ text: string, model: string, finish: string }> {
  if (o.provider === 'gemini') {
    const key = o.cfg.gemini.apiKey
    if (!key) throw new Error('API key Gemini belum diisi. Isi di Admin → Pengaturan.')
    let model = o.model || o.cfg.gemini.model
    if (!model) model = (await listGeminiModels(key).catch(() => []))[0]?.id ?? GEMINI_FALLBACK_MODEL
    return geminiChat({ apiKey: key, model, system: o.system, turns: o.turns, json: o.json, temperature: o.temperature, timeoutMs: o.timeoutMs })
  }
  const key = o.cfg.openrouter.apiKey
  if (!key) throw new Error('API key OpenRouter belum diisi. Isi di Admin → Pengaturan.')
  const models = await listFreeModels()
  const wanted = o.model || o.cfg.openrouter.model
  const model = models.find(m => m.id === wanted) ?? models[0]
  if (!model) throw new Error('Tidak ada model gratis OpenRouter yang tersedia saat ini.')
  const messages: ChatMessage[] = [{ role: 'system', content: o.system }, ...o.turns]
  return openRouterChat({ apiKey: key, model, messages, siteUrl: o.siteUrl, timeoutMs: o.timeoutMs, json: o.json, temperature: o.temperature })
}
