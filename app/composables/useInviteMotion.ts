import type { Ref } from 'vue'

/**
 * Motion undangan yang dipakai tema lewat kelas penanda (tanpa JS dari tema):
 * - uv-reveal / uv-reveal-zoom / -left / -right / -flip / -mask : animasi saat elemen masuk layar
 *   (-mask = foto tersingkap dari bawah seperti tirai)
 * - uv-tilt (+ uv-depth-1..3 di dalamnya)                 : kartu 3D mengikuti giroskop/mouse,
 *                                                          bergoyang pelan bila tidak ada input
 * - uv-float3d / uv-spin3d / uv-wiggle / uv-float        : ornamen berulang (CSS murni)
 * - uv-z / uv-z-left / uv-z-right                         : zoom sumbu Z mengikuti scroll (--uv-d, --uv-o)
 * - uv-scene                                              : wadah adegan (isi sticky) yang diberi --uv-s (0..1)
 * - uv-play                                               : adegan berbasis waktu: --uv-t 0..1 berjalan sekali
 *   (durasi --uv-dur) saat masuk layar, mis. buku terbuka otomatis ketika halaman dimuat
 * - uv-leaf                                               : halaman buku yang terbalik 3D (--uv-f 0..1) saat
 *   bagian bawahnya lewat ke atas layar
 * - uv-coverflow (+ uv-coverflow-item)                 : galeri geser satu per satu; foto samping miring 3D
 *   lewat scroll-driven animation di CSS (tanpa JS)
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
  let zooms: HTMLElement[] = []
  let scenes: HTMLElement[] = []
  let leaves: HTMLElement[] = []
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
    el.querySelectorAll('[class*="uv-reveal"]:not(.uv-in), .uv-play:not(.uv-in)').forEach(n => io!.observe(n))
    const prev = lines.length + zooms.length + scenes.length + leaves.length
    lines = [...el.querySelectorAll<HTMLElement>('.uv-scroll-line')]
    zooms = [...el.querySelectorAll<HTMLElement>('.uv-z, .uv-z-left, .uv-z-right')]
    scenes = [...el.querySelectorAll<HTMLElement>('.uv-scene')]
    leaves = [...el.querySelectorAll<HTMLElement>('.uv-leaf')]
    if (lines.length + zooms.length + scenes.length + leaves.length !== prev) onScroll()
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

  function layoutTop(el: HTMLElement) {
    let y = 0
    for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop
    return y
  }

  /** Garis cerita: ujungnya mengikuti titik baca (62% tinggi layar/bingkai). */
  function updateLines() {
    scrollRaf = 0
    if (!lines.length && !zooms.length && !scenes.length && !leaves.length) return
    const v = scroller ? scroller.getBoundingClientRect() : { top: 0, height: window.innerHeight }
    const mid = v.top + v.height / 2
    // Posisi diukur dari layout (offsetTop), bukan rect yang sudah ter-transform, agar tidak bergetar
    const rootEl = root.value
    const rootTop = rootEl ? rootEl.getBoundingClientRect().top : 0
    const baseOff = rootEl ? layoutTop(rootEl) : 0
    for (const el of zooms) {
      const top = rootTop + layoutTop(el) - baseOff
      const d = Math.max(-1.2, Math.min(1.2, (top + el.offsetHeight / 2 - mid) / v.height))
      // pudar saat jauh di bawah (datang) dan saat lewat ke atas (melewati penonton)
      const o = Math.max(0, Math.min(1, 1 - Math.max(0, d - 0.3) * 1.7 - Math.max(0, -d - 0.32) * 2))
      el.style.setProperty('--uv-d', d.toFixed(4))
      el.style.setProperty('--uv-o', o.toFixed(3))
    }
    // Halaman terbalik: mulai saat tepi bawah halaman naik melewati 60% layar, selesai di 8%
    for (const el of leaves) {
      const bottom = rootTop + layoutTop(el) - baseOff + el.offsetHeight
      const f = Math.max(0, Math.min(1, (0.6 - (bottom - v.top) / v.height) / 0.52))
      el.style.setProperty('--uv-f', f.toFixed(4))
      el.classList.toggle('uv-leaf-gone', f >= 0.999)
    }
    for (const el of scenes) {
      const r = el.getBoundingClientRect()
      const run = r.height - v.height
      const s = run > 0 ? Math.max(0, Math.min(1, (v.top - r.top) / run)) : 1
      el.style.setProperty('--uv-s', s.toFixed(4))
    }
    const anchor = v.top + v.height * 0.62
    for (const el of lines) {
      const r = el.getBoundingClientRect()
      const p = r.height > 0 ? Math.min(1, Math.max(0, (anchor - r.top) / r.height)) : 0
      el.style.setProperty('--uv-p', p.toFixed(4))
      el.classList.toggle('uv-live', p > 0.002 && p < 0.998)
    }
  }
  /** Tinggi layar yang sebenarnya (bingkai HP atau jendela) untuk adegan zoom: --uv-vh */
  function setVh() {
    root.value?.style.setProperty('--uv-vh', `${scroller ? scroller.clientHeight : window.innerHeight}px`)
  }
  function onResize() {
    setVh()
    onScroll()
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
    setVh()
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onResize, { passive: true })
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
    zooms = []
    scenes = []
    leaves = []
    document.removeEventListener('scroll', onScroll, { capture: true })
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('deviceorientation', onOrient)
  })

  return { active, enableGyro }
}
