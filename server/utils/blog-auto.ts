import type { H3Event } from 'h3'
import type { AiConfig, AiProvider } from './ai'
import type { BlogContext, Intent } from './blog-ai'

interface Topic { id: number, topic: string, focus_keyword: string, category_slug: string | null, intent: Intent }
interface Ctx extends BlogContext {
  settings: { auto_enabled: boolean, auto_publish: boolean, auto_models: string[] | null } | null
  topic: Topic | null
  queued: number
  all_topics: string[]
}
interface Claim { run: boolean, reason?: string, stale?: boolean, models?: string[] | null }
export interface ModelAttempt { model: string, error: string }

/** Semua model di urutan cadangan gagal (bukan masalah topik). */
export class AllModelsFailedError extends Error {
  constructor(public stage: 'artikel' | 'topik', public attempts: ModelAttempt[], public topic?: string) {
    super(`Semua model AI gagal ${stage === 'topik' ? 'mengisi antrean topik' : 'menulis artikel'}: ${attempts.map(a => `${a.model} (${a.error})`).join('; ')}`)
  }
}

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e)).replace(/\s+/g, ' ').slice(0, 300)

/**
 * Coba model satu per satu sesuai urutan (mis. Gemini 3.5 Flash → 3 Flash Preview → 3.1 Flash Lite Preview).
 * Model yang gagal (error API, kuota, waktu habis, JSON rusak, terpotong) diganti model berikutnya; tiap model
 * selain yang terakhir dibatasi 150 detik agar model cadangan masih kebagian waktu. Topik yang tumpang tindih
 * dengan artikel lain (BlogOverlapError) bukan kesalahan model, jadi langsung diteruskan.
 */
async function withModels<T>(models: (string | undefined)[], deadline: number, attempts: ModelAttempt[], fn: (model: string | undefined, timeoutMs: number) => Promise<T>): Promise<T | undefined> {
  for (const [i, model] of models.entries()) {
    const left = deadline - Date.now()
    if (left < 45_000) {
      attempts.push({ model: model ?? 'bawaan', error: 'tidak sempat dicoba (batas waktu proses habis)' })
      continue
    }
    const budget = i < models.length - 1 ? Math.min(150_000, left - 10_000) : left - 10_000
    try {
      return await fn(model, budget)
    }
    catch (e) {
      if (e instanceof BlogOverlapError) throw e
      attempts.push({ model: model ?? 'bawaan', error: errText(e) })
      console.warn(`[blog] model ${model ?? 'bawaan'} gagal, coba model berikutnya:`, errText(e))
    }
  }
  return undefined
}

/** Urutan model untuk artikel otomatis: daftar dari pengaturan bila memakai Gemini, selain itu model bawaan penyedia. */
function modelChain(cfg: AiConfig, provider: AiProvider, saved: string[] | null | undefined): (string | undefined)[] {
  const list = (saved ?? []).map(m => m.trim()).filter(Boolean)
  if (provider === 'gemini' && list.length) return [...new Set(list)]
  return [provider === 'gemini' ? cfg.gemini.model || undefined : cfg.openrouter.model || undefined]
}

/** Email ke admin saat artikel otomatis gagal & dihentikan. Gagal mengirim email tidak memengaruhi proses. */
async function notifyFailure(event: H3Event, o: { reason: string, attempts: ModelAttempt[], topic?: string }) {
  const to = adminRecipients(event)
  if (!to.length) return
  const when = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' })
  await sendBrandEmail(event, to, 'Gagal membuat artikel blog otomatis', {
    preheader: 'Artikel otomatis dihentikan sementara sampai dijalankan ulang dari admin.',
    title: 'Artikel otomatis gagal dibuat',
    body: [
      `Pembuatan artikel otomatis pada <b>${escapeHtml(when)} WIB</b> gagal${o.topic ? ` untuk topik <b>${escapeHtml(o.topic)}</b>` : ''}.`,
      ...(o.attempts.length
        ? o.attempts.map(a => `• <b>${escapeHtml(a.model)}</b>: ${escapeHtml(a.error)}`)
        : [escapeHtml(o.reason)]),
      'Agar tidak terjadi percobaan berulang, artikel otomatis <b>dihentikan sementara</b>. Topik tetap di antrean.',
      'Periksa kuota/API key Gemini atau urutan model, lalu buka Admin → Blog dan tekan <b>Jalankan sekarang</b> atau <b>Lanjutkan otomatis</b>.',
    ],
    button: { label: 'Buka Admin Blog', url: `${siteOrigin(event)}/admin/blog` },
  }).catch(e => console.error('[blog] gagal mengirim email kegagalan:', errText(e)))
}

/**
 * Artikel otomatis terjadwal. Pemicu: pg_cron (tiap 5 menit, hanya saat jadwal tiba), cron Vercel harian, atau
 * tombol admin (force). Langkah:
 *  1. Klaim giliran di database (jadwal per hari/interval/jam mulai; tidak berjalan ganda; berhenti bila pernah gagal).
 *  2. Antrean hampir habis → AI mengusulkan topik baru (pakai urutan model yang sama).
 *  3. Tulis artikel dengan urutan model cadangan, simpan (langsung tayang sesuai pengaturan), kirim ke IndexNow.
 *  4. Semua model gagal → catat, hentikan otomatis, dan email admin (pemicu manual: tanpa email, tetap tampil di admin).
 */
export async function runAutoArticle(event: H3Event, o: { force?: boolean, provider?: AiProvider | null, deadline: number }) {
  const claim = await serverRpc<Claim>(event, 'server_blog_auto_claim', { p_force: !!o.force })
  if (claim.stale) await notifyFailure(event, { reason: claim.reason ?? 'Proses sebelumnya terhenti.', attempts: [] })
  if (!claim.run) return { skipped: claim.reason ?? 'Belum waktunya' }

  const attempts: ModelAttempt[] = []
  let topicName: string | undefined
  try {
    const cfg = await getAiConfig(event)
    const provider = pickProvider(cfg, o.provider ?? null)
    if (!provider) throw new Error('Belum ada API key AI (Gemini / OpenRouter). Isi di Admin → Pengaturan.')
    const models = modelChain(cfg, provider, claim.models)
    let ctx = await serverRpc<Ctx>(event, 'server_blog_context', {})

    // Antrean hampir habis → isi ulang lewat AI. Wajib berhasil hanya bila antrean benar-benar kosong.
    if (ctx.queued < 3) {
      const topicAttempts: ModelAttempt[] = []
      // Antrean masih ada isinya: cukup satu-dua percobaan singkat; kosong: boleh memakai waktu lebih banyak
      const topicDeadline = ctx.queued ? Math.min(o.deadline - 120_000, Date.now() + 100_000) : o.deadline - 100_000
      const topics = await withModels(models, topicDeadline, topicAttempts, (model, timeoutMs) =>
        suggestTopics({ event, cfg, provider, model, ctx, existing: ctx.all_topics, count: 10, timeoutMs: Math.min(timeoutMs, 75_000) }))
      if (topics?.length) {
        await serverRpc(event, 'server_blog_add_topics', { p_topics: topics })
        ctx = await serverRpc<Ctx>(event, 'server_blog_context', {})
      }
      else if (!ctx.queued) {
        throw new AllModelsFailedError('topik', topicAttempts)
      }
      else {
        console.warn('[blog] gagal mengisi antrean topik, lanjut dengan topik yang ada')
      }
    }

    // Topik yang bersaing dengan artikel lain ditandai gagal (tanpa memanggil AI), lalu lanjut ke topik berikutnya
    for (let tries = 0; tries < 5; tries++) {
      const t = ctx.topic
      if (!t) throw new Error('Antrean topik kosong.')
      topicName = t.topic
      attempts.length = 0
      try {
        const a = await withModels(models, o.deadline, attempts, (model, timeoutMs) => generateArticle({
          event, cfg, provider, model, ctx,
          brief: { topic: t.topic, focus_keyword: t.focus_keyword, category_slug: t.category_slug, intent: t.intent },
          timeoutMs,
        }))
        if (!a) throw new AllModelsFailedError('artikel', attempts, t.topic)
        const { stats, ...post } = a
        const saved = await serverRpc<{ id: string, slug: string, status: string }>(event, 'server_blog_save', { p_post: post, p_topic_id: t.id })
        await serverRpc(event, 'server_blog_auto_finish', { p_ok: true, p_note: null, p_halt: false })
        if (saved.status === 'published') await submitIndexNow(event, [`/blog/${saved.slug}`, '/blog'])
        return { ...saved, title: a.title, stats, provider, model: post.ai_model, attempts }
      }
      catch (e) {
        if (!(e instanceof BlogOverlapError)) throw e
        await serverRpc(event, 'server_blog_fail', { p_topic_id: t.id, p_note: e.message }).catch(() => {})
        ctx = await serverRpc<Ctx>(event, 'server_blog_context', {})
      }
    }
    throw new Error('Beberapa topik teratas tumpang tindih dengan artikel yang sudah ada. Periksa antrean topik.')
  }
  catch (e) {
    const note = errText(e)
    const failed = e instanceof AllModelsFailedError ? e.attempts : attempts
    // Otomatis: hentikan & email admin agar tidak mengulang kesalahan. Manual: admin melihat galatnya langsung.
    await serverRpc(event, 'server_blog_auto_finish', { p_ok: false, p_note: note, p_halt: !o.force }).catch(() => {})
    if (!o.force) await notifyFailure(event, { reason: note, attempts: failed, topic: topicName })
    throw e
  }
}
