import type { Ref } from 'vue'

/**
 * Motion undangan yang dipakai tema lewat kelas penanda (tanpa JS dari tema):
 * - uv-reveal / uv-reveal-zoom / -left / -right / -flip / -mask : animasi saat elemen masuk layar
 *   (-mask = foto tersingkap dari bawah seperti tirai)
 * - uv-tilt (+ uv-depth-1..3 di dalamnya)                 : kartu 3D mengikuti giroskop/mouse,
 *                                                          bergoyang pelan bila tidak ada input
 * - uv-float3d / uv-spin3d / uv-wiggle / uv-float        : ornamen berulang (CSS murni)
 * - uv-scroll-line                                        : wadah yang diberi --uv-p (0..1) sesuai posisi
 *   scroll; di dalamnya uv-scroll-draw (garis tergambar sampai titik baca) dan
 *   uv-scroll-follow (penanda yang menempel di ujung garis gelombang)
 * Semua dimatikan bila pengguna memilih "kurangi gerakan".
 */
export function useInviteMotion(root: Ref<HTMLElement | null>, enabled: () => boolean) {
  const active = ref(false)
  if (!import.meta.client) return { active, enableGyro: () => {} }

  const MAX = 9 // derajat
  let io: IntersectionObserver | null = null
  let mo: MutationObserver | null = null
  let raf = 0
  let hasTilt = false
  let lines: HTMLElement[] = []
  let scroller: HTMLElement | null = null
  let scrollRaf = 0
  let lastInput = 0
  let base: { b: number, g: number } | null = null
  const target = { x: 0, y: 0 }
  const cur = { x: 0, y: 0 }
  const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v))

  function scan() {
    const el = root.value
    if (!el || !io) return
    el.querySelectorAll('[class*="uv-reveal"]:not(.uv-in)').forEach(n => io!.observe(n))
    const prevLines = lines.length
    lines = [...el.querySelectorAll<HTMLElement>('.uv-scroll-line')]
    if (lines.length !== prevLines) onScroll()
    const had = hasTilt
    hasTilt = !!el.querySelector('.uv-tilt')
    if (hasTilt && !had) loop()
  }

  function loop() {
    cancelAnimationFrame(raf)
    if (!hasTilt || !root.value) return
    raf = requestAnimationFrame((t) => {
      if (!document.hidden) {
        if (t - lastInput > 2500) {
          // Tidak ada input: goyangan 3D pelan agar tetap "hidup"
          target.x = Math.sin(t / 2300) * 4
          target.y = Math.cos(t / 1900) * 6
        }
        cur.x += (target.x - cur.x) * 0.08
        cur.y += (target.y - cur.y) * 0.08
        root.value?.style.setProperty('--uv-rx', `${cur.x.toFixed(2)}deg`)
        root.value?.style.setProperty('--uv-ry', `${cur.y.toFixed(2)}deg`)
      }
      loop()
    })
  }

  /** Garis cerita: ujungnya mengikuti titik baca (62% tinggi layar/bingkai). */
  function updateLines() {
    scrollRaf = 0
    if (!lines.length) return
    const v = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight }
    const anchor = v.top + v.height * 0.62
    for (const el of lines) {
      const r = el.getBoundingClientRect()
      const p = r.height > 0 ? Math.min(1, Math.max(0, (anchor - r.top) / r.height)) : 0
      el.style.setProperty('--uv-p', p.toFixed(4))
      el.classList.toggle('uv-live', p > 0.002 && p < 0.998)
    }
  }
  function onScroll() {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(updateLines)
  }

  function onPointer(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return
    lastInput = performance.now()
    target.y = clamp(((e.clientX / window.innerWidth) - 0.5) * 2 * MAX)
    target.x = clamp(-((e.clientY / window.innerHeight) - 0.5) * 2 * MAX)
  }
  function onOrient(e: DeviceOrientationEvent) {
    if (e.beta == null || e.gamma == null) return
    base ??= { b: e.beta, g: e.gamma }
    lastInput = performance.now()
    target.x = clamp(-(e.beta - base.b) * 0.35)
    target.y = clamp((e.gamma - base.g) * 0.45)
  }

  let gyroOn = false
  /** Panggil dari gestur pengguna (tombol Buka Undangan) agar izin giroskop iOS bisa diminta. */
  function enableGyro() {
    if (!active.value || gyroOn || typeof DeviceOrientationEvent === 'undefined') return
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    const add = () => { gyroOn = true; window.addEventListener('deviceorientation', onOrient) }
    if (typeof DOE.requestPermission === 'function')
      DOE.requestPermission().then(r => r === 'granted' && add()).catch(() => {})
    else add()
  }

  onMounted(() => {
    if (!enabled() || !root.value || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('uv-in')
        io!.unobserve(e.target)
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    active.value = true
    // Wadah scroll terdekat (bingkai HP di katalog/editor), atau jendela untuk halaman penuh
    for (let n = root.value.parentElement; n && n !== document.body; n = n.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(n).overflowY)) { scroller = n; break }
    }
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll, { passive: true })
    nextTick(scan)
    mo = new MutationObserver(() => scan())
    mo.observe(root.value, { childList: true, subtree: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    // Android/desktop tidak perlu izin; iOS menunggu enableGyro() dari klik
    const DOE = typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent as unknown as { requestPermission?: unknown } : null
    if (DOE && typeof DOE.requestPermission !== 'function') enableGyro()
  })

  onBeforeUnmount(() => {
    io?.disconnect()
    mo?.disconnect()
    cancelAnimationFrame(raf)
    cancelAnimationFrame(scrollRaf)
    hasTilt = false
    lines = []
    document.removeEventListener('scroll', onScroll, { capture: true })
    window.removeEventListener('resize', onScroll)
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('deviceorientation', onOrient)
  })

  return { active, enableGyro }
}
