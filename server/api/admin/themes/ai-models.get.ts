import type { FreeModel } from '../../../utils/openrouter'

/** Penyedia AI yang aktif untuk generator tema + daftar model gratis OpenRouter (bila API key diisi di Pengaturan atau env). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const config = useRuntimeConfig(event)
  const hasAnthropic = !!config.anthropicApiKey
  const or = await getOpenRouterConfig(event)
  const hasOpenRouter = !!or.apiKey

  let models: FreeModel[] = []
  let modelsError = ''
  // Daftar model publik (tanpa key), supaya model bisa dipilih di Pengaturan sebelum key diisi
  try { models = await listFreeModels() }
  catch (e) { modelsError = e instanceof Error ? e.message : String(e) }
  const preferred = or.model
  const defaultModel = (preferred && models.some(m => m.id === preferred) ? preferred : models[0]?.id) ?? ''

  return {
    providers: { anthropic: hasAnthropic, openrouter: hasOpenRouter },
    defaultProvider: hasOpenRouter ? 'openrouter' : hasAnthropic ? 'anthropic' : null,
    openrouter: { defaultModel, models, error: modelsError, source: or.source },
  }
})
