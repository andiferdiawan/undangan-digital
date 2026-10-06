import type { H3Event } from 'h3'
import type { AiProvider } from './ai'
import type { BlogContext, Intent } from './blog-ai'

interface Topic { id: number, topic: string, focus_keyword: string, category_slug: string | null, intent: Intent }
interface Ctx extends BlogContext {
  settings: { auto_enabled: boolean, auto_publish: boolean, last_auto_at: string | null } | null
  topic: Topic | null
  queued: number
  all_topics: string[]
}

/** Tanggal (WIB) untuk memastikan artikel otomatis hanya satu per hari. */
const wibDay = (d: Date) => new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10)

/**
 * Artikel harian otomatis: ambil topik antrean berikutnya (isi ulang antrean lewat AI bila hampir habis),
 * tulis artikel, simpan (tayang langsung atau draf sesuai pengaturan). Dipakai cron Vercel & tombol admin.
 */
export async function runDailyArticle(event: H3Event, o: { force?: boolean, provider?: AiProvider | null, deadline: number }) {
  let ctx = await serverRpc<Ctx>(event, 'server_blog_context', {})
  const s = ctx.settings
  if (!o.force) {
    if (!s?.auto_enabled) return { skipped: 'Artikel otomatis nonaktif' }
    if (s.last_auto_at && wibDay(new Date(s.last_auto_at)) === wibDay(new Date()) && !String((s as any).last_auto_status ?? '').startsWith('gagal'))
      return { skipped: 'Artikel hari ini sudah dibuat' }
  }
  const cfg = await getAiConfig(event)
  const provider = pickProvider(cfg, o.provider ?? null)
  if (!provider) throw new Error('Belum ada API key AI (Gemini / OpenRouter). Isi di Admin → Pengaturan.')

  // Antrean hampir habis → minta AI mengusulkan topik baru (tidak fatal bila gagal selama masih ada topik)
  if (ctx.queued < 3) {
    try {
      const topics = await suggestTopics({ event, cfg, provider, ctx, existing: ctx.all_topics, count: 10, timeoutMs: 60_000 })
      if (topics.length) {
        await serverRpc(event, 'server_blog_add_topics', { p_topics: topics })
        ctx = await serverRpc<Ctx>(event, 'server_blog_context', {})
      }
    }
    catch (e) {
      console.error('[blog] gagal mengisi antrean topik:', e instanceof Error ? e.message : e)
    }
  }
  const t = ctx.topic
  if (!t) throw new Error('Antrean topik kosong.')
  try {
    const a = await generateArticle({
      event, cfg, provider, ctx,
      brief: { topic: t.topic, focus_keyword: t.focus_keyword, category_slug: t.category_slug, intent: t.intent },
      timeoutMs: Math.max(30_000, o.deadline - Date.now() - 10_000),
    })
    const { stats, ...post } = a
    const saved = await serverRpc<{ id: string, slug: string, status: string }>(event, 'server_blog_save', { p_post: post, p_topic_id: t.id })
    return { ...saved, title: a.title, stats, provider }
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await serverRpc(event, 'server_blog_fail', { p_topic_id: t.id, p_note: msg }).catch(() => {})
    throw e
  }
}
