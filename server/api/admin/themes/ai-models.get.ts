import type { FreeModel } from '../../../utils/openrouter'
import type { GeminiModel } from '../../../utils/gemini'

/**
 * Penyedia AI yang aktif + daftar model: model gratis OpenRouter (publik, tanpa key) dan model Gemini
 * (butuh key, diambil dari API Google). Dipakai generator tema, generator artikel, dan halaman Pengaturan.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const config = useRuntimeConfig(event)
  const hasAnthropic = !!config.anthropicApiKey
  const ai = await getAiConfig(event)

  let models: FreeModel[] = []
  let modelsError = ''
  // Daftar model publik (tanpa key), supaya model bisa dipilih di Pengaturan sebelum key diisi
  try { models = await listFreeModels() }
  catch (e) { modelsError = e instanceof Error ? e.message : String(e) }
  const orDefault = (ai.openrouter.model && models.some(m => m.id === ai.openrouter.model) ? ai.openrouter.model : models[0]?.id) ?? ''

  let gModels: GeminiModel[] = []
  let gError = ''
  if (ai.gemini.apiKey) {
    try { gModels = await listGeminiModels(ai.gemini.apiKey) }
    catch (e) { gError = e instanceof Error ? e.message : String(e) }
  }
  const gDefault = ai.gemini.model || gModels[0]?.id || ''
  const free = pickProvider(ai)

  return {
    providers: { anthropic: hasAnthropic, openrouter: !!ai.openrouter.apiKey, gemini: !!ai.gemini.apiKey },
    defaultProvider: free ?? (hasAnthropic ? 'anthropic' : null),
    openrouter: { defaultModel: orDefault, models, error: modelsError, source: ai.openrouter.source },
    gemini: { defaultModel: gDefault, models: gModels, error: gError, source: ai.gemini.source },
  }
})
