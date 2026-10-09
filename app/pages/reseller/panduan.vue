<script setup lang="ts">
/**
 * Panduan Reseller: cara kerja program, link referral & link pelacakan, analitik, membuat link pembayaran,
 * memandu pelanggan sampai undangan terkirim, pencairan, strategi mendapatkan pelanggan, template WhatsApp, FAQ.
 * Angka (bagi hasil, harga paket, jadwal & minimal pencairan) dibaca langsung dari database agar selalu sesuai.
 * Screenshot: public/panduan/reseller (dibuat ulang dengan `npm run panduan:screenshots`).
 */
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const origin = useSiteOrigin()
const host = origin.replace(/^https?:\/\//, '')

const { data } = await useAsyncData('panduan-reseller', async () => {
  const [s, p, t] = await Promise.all([
    supabase.from('app_settings').select('default_reseller_rate, payout_days, min_payout, order_expiry_hours').single(),
    supabase.from('packages').select('id, name, guest_limit, price').eq('is_active', true).order('sort'),
    supabase.from('themes').select('id', { count: 'exact', head: true }).eq('status', 'published'),
  ])
  return {
    settings: s.data as { default_reseller_rate: number, payout_days: number[], min_payout: number, order_expiry_hours: number } | null,
    packages: (p.data ?? []) as { id: number, name: string, guest_limit: number, price: number }[],
    themeCount: t.count ?? 0,
  }
})
const rate = computed(() => Number(data.value?.settings?.default_reseller_rate ?? 30))
const payoutDays = computed(() => (data.value?.settings?.payout_days ?? [5, 25]).join(' & '))
const minPayout = computed(() => rupiah(data.value?.settings?.min_payout ?? 50000))
const expiryHours = computed(() => data.value?.settings?.order_expiry_hours ?? 24)
const minPrice = computed(() => Math.min(...(data.value?.packages ?? []).map(p => p.price)))
const commission = (price: number) => Math.floor(price * rate.value / 100)

// Reseller yang sedang membaca: link & template memakai kodenya sendiri
const { data: mine } = await useAsyncData('panduan-reseller-saya', async () => {
  const uid = (user.value as { sub?: string } | null)?.sub
  if (!uid) return null
  const { data } = await supabase.from('resellers').select('code, status, business_name').eq('id', uid).maybeSingle()
  return data as { code: string, status: string, business_name: string } | null
}, { watch: [user] })
const code = computed(() => (mine.value?.status === 'active' ? mine.value.code : 'KODEANDA'))
const myLink = computed(() => `${origin}/r/${code.value}`)
const adminWa = useRuntimeConfig().public.adminWhatsapp

useSeoMeta({
  title: 'Panduan Reseller Undangan Digital',
  description: () => `Panduan lengkap reseller Undangan Virtual: link referral & link pelacakan, membuat link pembayaran, memandu pelanggan, pencairan komisi ${rate.value}% tanggal ${payoutDays.value}, strategi mendapatkan pelanggan, dan template WhatsApp.`,
})

const SECTIONS = [
  { id: 'mulai', title: 'Mulai jadi reseller' },
  { id: 'dashboard', title: 'Mengenal dashboard' },
  { id: 'link-referral', title: 'Link referral' },
  { id: 'link-pelacakan', title: 'Link pelacakan' },
  { id: 'analitik', title: 'Membaca analitik' },
  { id: 'link-bayar', title: 'Link pembayaran pelanggan' },
  { id: 'pelanggan', title: 'Memandu pelanggan' },
  { id: 'pencairan', title: 'Pencairan komisi' },
  { id: 'strategi', title: 'Cara dapat pelanggan' },
  { id: 'template', title: 'Template WhatsApp' },
  { id: 'faq', title: 'Tanya jawab' },
] as const

// Bagian yang sedang dibaca (untuk menandai daftar isi); di HP, chip aktif digeser agar terlihat
const activeId = ref<string>('mulai')
const chips = ref<HTMLElement | null>(null)
watch(activeId, (id) => {
  const bar = chips.value
  const chip = bar?.querySelector<HTMLElement>(`a[href="#${id}"]`)
  if (bar && chip) bar.scrollTo({ left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' })
})
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    if (visible[0]) activeId.value = visible[0].target.id
  }, { rootMargin: '-20% 0px -70% 0px' })
  SECTIONS.forEach(s => document.getElementById(s.id) && io.observe(document.getElementById(s.id)!))
  onBeforeUnmount(() => io.disconnect())
})

// ── Template pesan WhatsApp ──
const TEMPLATES = computed(() => [
  {
    title: 'Perkenalan / promosi',
    when: 'Status WA, grup, atau chat pertama ke calon pelanggan.',
    text: `Assalamu'alaikum Kak 😊\nSekarang undangan pernikahan & acara bisa dikirim lewat WhatsApp: ada RSVP, peta lokasi, hitung mundur, amplop digital, dan musik. Tersedia ${data.value?.themeCount || 'puluhan'} tema syar'i & modern, mulai ${rupiah(minPrice.value || 79000)} saja.\n\nLihat contohnya di sini ya:\n${myLink.value}`,
  },
  {
    title: 'Tindak lanjut',
    when: '1–2 hari setelah calon pelanggan melihat katalog.',
    text: `Kak, kemarin sudah sempat lihat-lihat temanya? Kalau sudah ada yang cocok, kabari saya ya, nanti saya bantu buatkan link pembayarannya. Setelah bayar, undangan bisa langsung diisi sendiri dari HP dan dikirim ke tamu hari itu juga.`,
  },
  {
    title: 'Kirim link pembayaran',
    when: 'Setelah membuat link pembayaran di dashboard (tombol WhatsApp di dashboard sudah mengisi pesan ini otomatis).',
    text: `Assalamu'alaikum Kak, berikut link pembayaran undangan digital Kakak:\n[link pembayaran]\n\nBisa bayar lewat QRIS, e-wallet, atau virtual account. Link berlaku ${expiryHours.value} jam ya Kak.`,
  },
  {
    title: 'Kirim token & cara aktivasi',
    when: 'Setelah status pesanan Lunas (tombol "Kirim token" di dashboard).',
    text: `Alhamdulillah pembayaran sudah diterima, Kak. Token undangan Kakak: [TOKEN]\n\nCara aktifkan:\n1. Buka ${host}/daftar\n2. Masukkan token, pilih alamat undangan, buat akun\n3. Isi data acara, lalu kirim ke tamu dari menu Buku Tamu\n\nKalau ada yang bingung, langsung tanya saya ya 🙏`,
  },
  {
    title: 'Minta testimoni & rekomendasi',
    when: 'Setelah acara pelanggan selesai.',
    text: `Barakallah Kak, semoga acaranya lancar dan berkah 🤲 Boleh minta testimoni singkat tentang undangannya? Kalau ada saudara/teman yang butuh undangan digital, boleh bagikan link ini ya:\n${myLink.value}`,
  },
])
const copied = ref('')
async function copy(text: string, key: string) {
  try { await navigator.clipboard.writeText(text) }
  catch { /* clipboard tidak tersedia */ }
  copied.value = key
  setTimeout(() => { if (copied.value === key) copied.value = '' }, 1500)
}

// ── Tanya jawab (juga dipakai untuk data terstruktur FAQPage) ──
const FAQ = computed(() => [
  { q: 'Kapan komisi masuk ke saldo saya?', a: `Otomatis begitu pembayaran pelanggan berstatus Lunas. Komisi langsung terlihat di "Saldo tersedia" dan bisa dicairkan.` },
  { q: 'Pelanggan membeli sendiri lewat link saya, apakah tercatat?', a: 'Ya. Pembelian tercatat atas nama Anda bila pelanggan mengklik link Anda dalam 30 hari terakhir. Yang dihitung adalah link terakhir yang diklik, jadi bila sesudahnya ia mengklik link reseller lain, penjualan tercatat untuk reseller tersebut. Pesanan yang Anda buat sendiri lewat "Buat link pembayaran pelanggan" selalu tercatat atas nama Anda.' },
  { q: 'Bagaimana kalau pelanggan membeli tanpa link saya?', a: 'Penjualan tidak bisa dikaitkan ke Anda. Karena itu selalu bagikan link referral/pelacakan Anda, atau buatkan link pembayaran langsung dari dashboard.' },
  { q: 'Apakah persentase bagi hasil bisa berubah?', a: `Bagi hasil saat ini ${rate.value}% dari harga paket. Persentase dikunci per pesanan saat pesanan dibuat, jadi perubahan tarif hanya berlaku untuk pesanan baru.` },
  { q: 'Berapa lama link pembayaran dan token berlaku?', a: `Link pembayaran berlaku ${expiryHours.value} jam; bila kedaluwarsa, buat link baru. Token aktivasi berlaku 90 hari sejak lunas.` },
  { q: 'Bagaimana jika pesanan di-refund?', a: 'Komisi dari pesanan tersebut otomatis dikurangkan dari saldo Anda, dan token yang belum dipakai tidak bisa diaktifkan lagi.' },
  { q: 'Kapan uang pencairan ditransfer?', a: `Pada tanggal ${payoutDays.value} setiap bulan. Pengajuan masuk ke jadwal pencairan terdekat setelah hari pengajuan, dan konfirmasi dikirim ke email Anda. Minimal pencairan ${minPayout.value}.` },
  { q: 'Bisakah membatalkan pengajuan pencairan?', a: 'Bisa, selama statusnya masih "Diajukan": tekan Batal di riwayat pencairan dan saldo kembali tersedia.' },
  { q: 'Bagaimana mengganti rekening pencairan?', a: 'Buka dashboard reseller → "Profil & rekening", ubah datanya, lalu Simpan. Rekening baru dipakai untuk pengajuan berikutnya.' },
  { q: 'Tombol WhatsApp di website mengarah ke siapa?', a: 'Untuk pengunjung yang datang lewat link Anda, tombol kontak WhatsApp di website memakai nomor Anda dan halaman pesanannya mencantumkan nama usaha Anda. Pastikan nomor di "Profil & rekening" selalu aktif.' },
  { q: 'Bisakah kode reseller diganti?', a: 'Hubungi admin. Perlu diingat link lama yang sudah tersebar memakai kode lama, jadi sebaiknya kode tidak sering diganti.' },
])
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': FAQ.value.map(f => ({ '@type': 'Question', 'name': f.q, 'acceptedAnswer': { '@type': 'Answer', 'text': f.a } })),
    }),
  }],
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <!-- Pembuka -->
    <header class="max-w-3xl">
      <NuxtLink to="/reseller" class="text-sm text-brand-600 underline">← Program Reseller</NuxtLink>
      <h1 class="mt-3 font-display text-4xl leading-tight text-brand">Panduan Reseller</h1>
      <p class="mt-3 text-brand-700">
        Semua yang perlu Anda tahu untuk berjualan undangan digital {{ BRAND.name }}: dari membagikan link, membuat link pembayaran,
        memandu pelanggan sampai undangannya terkirim, hingga mencairkan komisi.
      </p>
      <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="card p-4"><p class="text-xs text-brand-500">Bagi hasil</p><p class="mt-1 text-2xl font-semibold text-clay-600">{{ rate }}%</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Pencairan</p><p class="mt-1 text-lg font-semibold text-brand-900">Tgl {{ payoutDays }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Minimal cair</p><p class="mt-1 text-lg font-semibold text-brand-900">{{ minPayout }}</p></div>
        <div class="card p-4"><p class="text-xs text-brand-500">Modal</p><p class="mt-1 text-lg font-semibold text-brand-900">Rp 0</p></div>
      </div>
      <div v-if="mine?.status === 'active'" class="mt-4 flex flex-wrap gap-2">
        <NuxtLink to="/reseller/dashboard" class="btn-primary btn-sm">Buka dashboard</NuxtLink>
        <NuxtLink to="/reseller/analitik" class="btn-ghost btn-sm">Analitik & buat link</NuxtLink>
      </div>
      <div v-else-if="!mine" class="mt-4"><NuxtLink to="/reseller" class="btn-accent btn-sm">Daftar jadi reseller</NuxtLink></div>
    </header>

    <!-- Daftar isi di HP: geser ke samping -->
    <nav class="sticky top-16 z-30 -mx-4 mt-6 border-b border-brand-100 bg-cream/95 px-4 py-2 backdrop-blur lg:hidden" aria-label="Daftar isi">
      <div ref="chips" class="relative flex gap-1.5 overflow-x-auto text-xs font-semibold [scrollbar-width:none]">
        <a v-for="s in SECTIONS" :key="s.id" :href="`#${s.id}`" class="shrink-0 rounded-full px-3 py-1.5" :class="activeId === s.id ? 'bg-brand text-white' : 'bg-white text-brand-700 ring-1 ring-brand-100'">{{ s.title }}</a>
      </div>
    </nav>

    <div class="mt-6 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <!-- Daftar isi desktop -->
      <nav class="hidden lg:block" aria-label="Daftar isi">
        <ol class="sticky top-24 grid gap-1 text-sm">
          <li v-for="(s, i) in SECTIONS" :key="s.id">
            <a :href="`#${s.id}`" class="flex gap-2 rounded-lg px-3 py-1.5" :class="activeId === s.id ? 'bg-brand-50 font-semibold text-brand' : 'text-brand-600 hover:text-brand'">
              <span class="w-5 text-right tabular-nums opacity-60">{{ i + 1 }}.</span>{{ s.title }}
            </a>
          </li>
        </ol>
      </nav>

      <div class="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-14 [&_section]:scroll-mt-32 lg:[&_section]:scroll-mt-24">
        <!-- 1. Mulai -->
        <section id="mulai" class="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-clay-600">Langkah 1</p>
            <h2 class="mt-1 font-display text-3xl text-brand">Mulai jadi reseller</h2>
            <ol class="mt-4 grid gap-3 text-brand-800">
              <li class="flex gap-3"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white">1</span><span>Buka <NuxtLink to="/reseller" class="font-semibold underline">{{ host }}/reseller</NuxtLink>, isi email & password (atau masuk bila sudah punya akun).</span></li>
              <li class="flex gap-3"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white">2</span><span>Isi nama usaha, nomor WhatsApp aktif, <b>kode reseller</b> (dipakai di link Anda, mis. <code class="text-brand-700">/r/BERKAH</code>), dan rekening pencairan.</span></li>
              <li class="flex gap-3"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-semibold text-white">3</span><span>Tunggu persetujuan admin. Setelah aktif, dashboard reseller terbuka dan Anda bisa langsung berjualan.</span></li>
            </ol>
            <div class="mt-5 rounded-2xl bg-clay-50 p-4 text-sm text-clay-700 ring-1 ring-clay-100">
              <p class="font-semibold">Komisi Anda per paket</p>
              <ul class="mt-2 grid gap-1">
                <li v-for="p in data?.packages" :key="p.id" class="flex justify-between gap-3"><span>{{ p.name }} · {{ rupiah(p.price) }}</span><b>{{ rupiah(commission(p.price)) }}</b></li>
              </ul>
              <p class="mt-2 text-xs opacity-80">Tanpa stok, tanpa desain, tanpa mengurus pembayaran: semua diproses platform.</p>
            </div>
          </div>
          <PanduanShot name="daftar-reseller" caption="Formulir pendaftaran reseller" />
        </section>

        <!-- 2. Dashboard -->
        <section id="dashboard" class="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h2 class="font-display text-3xl text-brand">Mengenal dashboard</h2>
            <p class="mt-3 text-brand-700">Buka dari menu <b>Dashboard</b> → kartu <b>Dashboard Reseller</b>, atau langsung <NuxtLink to="/reseller/dashboard" class="underline">{{ host }}/reseller/dashboard</NuxtLink>.</p>
            <dl class="mt-4 grid gap-3 text-sm">
              <div class="card p-4"><dt class="font-semibold text-brand-900">Saldo tersedia</dt><dd class="mt-1 text-brand-600">Komisi dari pesanan lunas yang belum dicairkan. Inilah yang bisa Anda ajukan pencairannya.</dd></div>
              <div class="card p-4"><dt class="font-semibold text-brand-900">Dalam proses cair</dt><dd class="mt-1 text-brand-600">Pengajuan yang menunggu tanggal pencairan, lengkap dengan jadwalnya.</dd></div>
              <div class="card p-4"><dt class="font-semibold text-brand-900">Total komisi & penjualan lunas</dt><dd class="mt-1 text-brand-600">Rekap seluruh penghasilan Anda dan jumlah pesanan yang sudah dibayar.</dd></div>
            </dl>
          </div>
          <PanduanShot name="dashboard-ringkasan" caption="Ringkasan saldo & link referral" />
        </section>

        <!-- 3. Link referral -->
        <section id="link-referral" class="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <h2 class="font-display text-3xl text-brand">Link referral (link affiliate)</h2>
            <p class="mt-3 text-brand-700">Setiap reseller punya link pribadi. Siapa pun yang membeli setelah mengklik link ini tercatat sebagai penjualan Anda.</p>
            <div class="mt-4 flex items-center gap-2 rounded-xl bg-brand-50 py-2 pl-3 pr-2 ring-1 ring-brand-100">
              <code class="min-w-0 flex-1 truncate text-sm text-brand-900">{{ myLink }}</code>
              <button type="button" class="btn-ghost btn-sm shrink-0" @click="copy(myLink, 'link')">{{ copied === 'link' ? '✓ Disalin' : 'Salin' }}</button>
            </div>
            <p v-if="code === 'KODEANDA'" class="mt-1 text-xs text-brand-500">Ganti <b>KODEANDA</b> dengan kode reseller Anda (masuk sebagai reseller untuk melihat link Anda di sini).</p>
            <ul class="mt-4 grid gap-2 text-sm text-brand-800">
              <li>✔︎ <b>Link utama</b> <code>/r/{{ code }}</code> membuka beranda.</li>
              <li>✔︎ <b>Halaman apa pun</b> bisa dijadikan link Anda dengan menambahkan <code>?ref={{ code }}</code>, misalnya <code class="break-all">{{ host }}/tema/sakinah-sage?ref={{ code }}</code>.</li>
              <li>✔︎ Pembeli tercatat selama <b>30 hari</b> sejak klik terakhir. Yang dihitung adalah link reseller terakhir yang diklik.</li>
              <li>✔︎ Pengunjung dari link Anda melihat <b>tombol WhatsApp ke nomor Anda</b>, dan halaman pesanannya mencantumkan nama usaha Anda.</li>
            </ul>
          </div>
          <PanduanShot name="link-referral" caption="Salin link referral dari dashboard" />
        </section>

        <!-- 4. Link pelacakan -->
        <section id="link-pelacakan" class="grid grid-cols-[minmax(0,1fr)] gap-6">
          <div class="max-w-3xl">
            <h2 class="font-display text-3xl text-brand">Link pelacakan per tempat berbagi</h2>
            <p class="mt-3 text-brand-700">
              Agar tahu mana yang paling menghasilkan, buat link berbeda untuk setiap tempat Anda berbagi: status WA, bio Instagram,
              video TikTok, grup Facebook, atau mitra vendor. Semua link tetap tercatat atas nama Anda.
            </p>
            <ol class="mt-4 grid gap-2 text-sm text-brand-800">
              <li><b>1.</b> Buka <NuxtLink to="/reseller/analitik" class="underline">Analitik & buat link</NuxtLink> → bagian <b>Buat link pelacakan baru</b>.</li>
              <li><b>2.</b> Beri <b>nama</b> yang mudah dikenali (mis. "Status WA tema Mocca"); alamat link terisi otomatis dan bisa diubah.</li>
              <li><b>3.</b> Pilih tujuan: beranda, katalog, katalog per jenis acara (pernikahan, aqiqah, khitan, ulang tahun, kantor…), <b>tema tertentu</b>, atau artikel blog.</li>
              <li><b>4.</b> Tekan <b>Buat link</b>, lalu salin atau bagikan langsung ke WhatsApp dari tabel <b>Performa per link</b>.</li>
            </ol>
            <p class="mt-3 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
              Tips: parameter UTM (mis. <code>?utm_campaign=syawal</code>) ikut diteruskan ke halaman tujuan. Link yang tidak dipakai lagi bisa
              <b>dinonaktifkan</b>: link itu tetap membuka beranda dan kliknya masuk ke link utama Anda.
            </p>
          </div>
          <div class="grid gap-6 sm:grid-cols-2">
            <PanduanShot name="analitik-buat-link" caption="Membuat link pelacakan ke satu tema" />
            <PanduanShot name="analitik-per-link" caption="Performa tiap link: klik, pesanan, komisi" />
          </div>
        </section>

        <!-- 5. Analitik -->
        <section id="analitik" class="grid grid-cols-[minmax(0,1fr)] gap-6">
          <div class="max-w-3xl">
            <h2 class="font-display text-3xl text-brand">Membaca analitik</h2>
            <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div class="card p-4"><dt class="font-semibold text-brand-900">Klik & pengunjung unik</dt><dd class="mt-1 text-brand-600">Berapa kali link dibuka, dan oleh berapa orang berbeda.</dd></div>
              <div class="card p-4"><dt class="font-semibold text-brand-900">Pesanan & lunas</dt><dd class="mt-1 text-brand-600">Pesanan yang dibuat pengunjung, dan yang sudah dibayar.</dd></div>
              <div class="card p-4"><dt class="font-semibold text-brand-900">Konversi</dt><dd class="mt-1 text-brand-600">Lunas ÷ pengunjung unik. Makin tinggi, makin efektif tempat berbagi tersebut.</dd></div>
              <div class="card p-4"><dt class="font-semibold text-brand-900">Asal klik</dt><dd class="mt-1 text-brand-600">Media sosial & WhatsApp, Google, iklan, atau situs lain, plus perangkat pengunjung.</dd></div>
            </dl>
            <p class="mt-4 text-sm text-brand-700">Cek seminggu sekali (rentang 7, 30, atau 90 hari): perbanyak konten di tempat dengan konversi tertinggi, dan perbaiki atau hentikan yang kliknya banyak tapi tidak menghasilkan.</p>
          </div>
          <div class="grid gap-6 sm:grid-cols-3">
            <PanduanShot name="analitik-ringkasan" caption="Ringkasan & klik per hari" />
            <PanduanShot name="analitik-sumber" caption="Asal klik & perangkat" />
            <PanduanShot name="analitik-penjualan" caption="Penjualan terbaru dari link" />
          </div>
        </section>

        <!-- 6. Link pembayaran -->
        <section id="link-bayar" class="grid grid-cols-[minmax(0,1fr)] gap-6">
          <div class="max-w-3xl">
            <h2 class="font-display text-3xl text-brand">Membuat link pembayaran untuk pelanggan</h2>
            <p class="mt-3 text-brand-700">Cocok untuk pelanggan yang memesan lewat chat. Pesanan ini <b>pasti</b> tercatat atas nama Anda, tanpa perlu pelanggan mengklik link.</p>
            <ol class="mt-4 grid gap-2 text-sm text-brand-800">
              <li><b>1.</b> Di dashboard, isi <b>Buat link pembayaran pelanggan</b>: tema, paket, nama, email, dan WhatsApp pelanggan. Komisi Anda langsung terlihat.</li>
              <li><b>2.</b> Pilih metode pembayaran (QRIS, e-wallet, virtual account, gerai ritel), lalu <b>Buat Link Pembayaran</b>.</li>
              <li><b>3.</b> Kirim lewat tombol <b>WhatsApp</b> (pesan sudah terisi) atau <b>Salin</b>. Link berlaku {{ expiryHours }} jam.</li>
              <li><b>4.</b> Setelah pelanggan membayar, status berubah menjadi <b>Lunas</b> dan <b>token aktivasi</b> muncul. Tekan <b>Kirim token</b> untuk mengirimkannya beserta cara aktivasi.</li>
            </ol>
            <p class="mt-3 text-sm text-brand-600">Status lain: <b>Menunggu bayar</b> (bisa salin/kirim ulang link), <b>Kedaluwarsa</b> (buat link baru bila pelanggan masih berminat).</p>
          </div>
          <div class="grid gap-6 sm:grid-cols-2">
            <PanduanShot name="buat-link-bayar" caption="Link pembayaran siap dikirim" />
            <PanduanShot name="pesanan-pelanggan" caption="Daftar pesanan, token, dan tombol kirim" />
          </div>
        </section>

        <!-- 7. Memandu pelanggan -->
        <section id="pelanggan" class="grid grid-cols-[minmax(0,1fr)] gap-6">
          <div class="max-w-3xl">
            <h2 class="font-display text-3xl text-brand">Memandu pelanggan sampai undangan terkirim</h2>
            <p class="mt-3 text-brand-700">Pelanggan yang dibantu sampai tuntas akan merekomendasikan Anda. Ini alur yang mereka lalui. Bagian ini juga bisa Anda bagikan ke pelanggan:</p>
            <div class="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 py-2 pl-3 pr-2 ring-1 ring-brand-100">
              <code class="min-w-0 flex-1 truncate text-sm text-brand-900">{{ origin }}/reseller/panduan#pelanggan</code>
              <button type="button" class="btn-ghost btn-sm shrink-0" @click="copy(`${origin}/reseller/panduan#pelanggan`, 'pelanggan')">{{ copied === 'pelanggan' ? '✓ Disalin' : 'Salin' }}</button>
            </div>
          </div>
          <ol class="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            <li class="grid content-start gap-3">
              <p class="text-sm text-brand-800"><b class="text-clay-600">1. Pilih tema.</b> Di katalog, pelanggan memfilter jenis acara dan mencari tema; {{ data?.themeCount || 'puluhan' }} tema tersedia.</p>
              <PanduanShot name="katalog" alt="Katalog tema" />
            </li>
            <li class="grid content-start gap-3">
              <p class="text-sm text-brand-800"><b class="text-clay-600">2. Coba tampilannya.</b> Halaman tema menampilkan undangan seperti yang dilihat tamu, termasuk mode layar penuh.</p>
              <PanduanShot name="tema-detail" alt="Halaman detail tema" />
            </li>
            <li class="grid content-start gap-3">
              <p class="text-sm text-brand-800"><b class="text-clay-600">3. Pesan & bayar.</b> Pilih paket (kuota tamu), isi data, pilih metode pembayaran. Atau bayar lewat link yang Anda buatkan.</p>
              <PanduanShot name="checkout" alt="Halaman checkout" />
            </li>
            <li class="grid content-start gap-3">
              <p class="text-sm text-brand-800"><b class="text-clay-600">4. Terima token.</b> Setelah lunas, token 6 karakter tampil di halaman pesanan (dan Anda bisa mengirimkannya lewat WhatsApp).</p>
              <PanduanShot name="pesanan-lunas" alt="Halaman pesanan lunas dengan token" />
            </li>
            <li class="grid content-start gap-3">
              <p class="text-sm text-brand-800"><b class="text-clay-600">5. Aktifkan token.</b> Di <b>{{ host }}/daftar</b>, masukkan token, pilih alamat undangan, lalu buat akun.</p>
              <PanduanShot name="aktivasi-token" alt="Aktivasi token" />
            </li>
            <li class="grid content-start gap-3">
              <p class="text-sm text-brand-800"><b class="text-clay-600">6. Isi undangan.</b> Data mempelai/acara, jadwal, galeri, amplop digital, musik, dan warna. Tersimpan otomatis dan bisa dipratinjau.</p>
              <PanduanShot name="editor-undangan" alt="Editor undangan" />
            </li>
            <li class="grid content-start gap-3">
              <p class="text-sm text-brand-800"><b class="text-clay-600">7. Kirim ke tamu.</b> Di <b>Buku Tamu</b>, tambah tamu (atau impor kontak), lalu tekan <b>Kirim berikutnya</b>: WhatsApp terbuka dengan link bernama tamu, dan tamu yang sudah dikirimi diberi tanda. RSVP & ucapan tercatat di tab <b>RSVP & Ucapan</b>.</p>
              <PanduanShot name="kirim-tamu" alt="Buku tamu dan kirim WhatsApp satu per satu" />
            </li>
          </ol>
        </section>

        <!-- 8. Pencairan -->
        <section id="pencairan" class="grid grid-cols-[minmax(0,1fr)] gap-6">
          <div class="max-w-3xl">
            <h2 class="font-display text-3xl text-brand">Pencairan komisi</h2>
            <ol class="mt-4 grid gap-2 text-sm text-brand-800">
              <li><b>1.</b> Pastikan data rekening di <b>Profil & rekening</b> sudah benar (bank/e-wallet, nomor, atas nama).</li>
              <li><b>2.</b> Di kartu <b>Cairkan saldo</b>, isi nominal (minimal {{ minPayout }}) atau tekan <b>Cairkan semua</b>, lalu <b>Ajukan Pencairan</b>.</li>
              <li><b>3.</b> Pengajuan dijadwalkan ke tanggal pencairan terdekat (tanggal {{ payoutDays }} setiap bulan) dan konfirmasinya dikirim ke email Anda.</li>
              <li><b>4.</b> Setelah ditransfer, status menjadi <b>Lunas</b> beserta nomor referensi transfer.</li>
            </ol>
            <div class="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <p class="rounded-xl bg-amber-50 p-3 text-amber-800"><b>Diajukan</b>: menunggu jadwal. Masih bisa dibatalkan.</p>
              <p class="rounded-xl bg-green-50 p-3 text-green-800"><b>Lunas</b>: sudah ditransfer ke rekening Anda.</p>
              <p class="rounded-xl bg-red-50 p-3 text-red-700"><b>Ditolak/Dibatalkan</b>: saldo kembali, catatan admin tampil di riwayat.</p>
            </div>
            <p class="mt-3 text-sm text-brand-600">Contoh: mengajukan tanggal 10 → ditransfer tanggal 25; mengajukan tanggal 26 → ditransfer tanggal 5 bulan berikutnya.</p>
          </div>
          <div class="grid gap-6 sm:grid-cols-2">
            <PanduanShot name="pencairan" caption="Mengajukan pencairan & riwayatnya" />
            <PanduanShot name="rekening" caption="Profil & rekening pencairan" />
          </div>
        </section>

        <!-- 9. Strategi -->
        <section id="strategi">
          <h2 class="font-display text-3xl text-brand">Cara mendapatkan pelanggan</h2>
          <p class="mt-3 max-w-3xl text-brand-700">Undangan digital paling laku lewat kepercayaan dan contoh nyata. Beberapa cara yang terbukti efektif:</p>
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div class="card p-5">
              <h3 class="font-semibold text-brand-900">📱 Status WhatsApp rutin</h3>
              <p class="mt-1 text-sm text-brand-600">Rekam layar saat membuka tema (tombol <b>Lihat Layar Penuh</b> di halaman tema), unggah 3–4 kali seminggu dengan link pelacakan "status-wa". Ganti tema yang ditampilkan tiap minggu.</p>
            </div>
            <div class="card p-5">
              <h3 class="font-semibold text-brand-900">🎬 Instagram & TikTok</h3>
              <p class="mt-1 text-sm text-brand-600">Video pendek animasi sampul undangan + musik sangat menarik perhatian. Pasang link pelacakan di bio dan sebut "link di bio" di setiap video.</p>
            </div>
            <div class="card p-5">
              <h3 class="font-semibold text-brand-900">🤝 Bermitra dengan vendor</h3>
              <p class="mt-1 text-sm text-brand-600">WO, MUA, fotografer, dekorasi, katering, percetakan, penjahit kebaya: pelanggan mereka pasti butuh undangan. Beri tiap mitra link pelacakan sendiri agar mudah berbagi hasil.</p>
            </div>
            <div class="card p-5">
              <h3 class="font-semibold text-brand-900">👨‍👩‍👧 Komunitas & grup</h3>
              <p class="mt-1 text-sm text-brand-600">Grup alumni, pengajian, arisan, dan kantor. Aqiqah & khitan lewat grup orang tua; acara kantor & grand opening untuk UMKM, toko, dan klinik baru.</p>
            </div>
            <div class="card p-5">
              <h3 class="font-semibold text-brand-900">📅 Manfaatkan musim ramai</h3>
              <p class="mt-1 text-sm text-brand-600">Syawal, Dzulhijjah, dan akhir tahun untuk pernikahan; libur sekolah untuk khitan. Siapkan konten dan link khusus (mis. <code>/r/{{ code }}/syawal</code>) beberapa minggu sebelumnya.</p>
            </div>
            <div class="card p-5">
              <h3 class="font-semibold text-brand-900">📝 Edukasi dulu, jual kemudian</h3>
              <p class="mt-1 text-sm text-brand-600">Bagikan artikel blog yang bermanfaat (contoh kata-kata undangan, adab menyebar undangan) dengan link pelacakan ke artikel tersebut. Pembaca yang tertarik akan menghubungi Anda.</p>
            </div>
            <div class="card p-5">
              <h3 class="font-semibold text-brand-900">⚡ Respons cepat & dampingi</h3>
              <p class="mt-1 text-sm text-brand-600">Balas chat secepatnya, bantu pilih tema, dan pastikan undangan terkirim ke tamu. Pelanggan yang puas adalah sumber pelanggan berikutnya.</p>
            </div>
            <div class="card p-5">
              <h3 class="font-semibold text-brand-900">📊 Evaluasi mingguan</h3>
              <p class="mt-1 text-sm text-brand-600">Lihat analitik tiap pekan: perbanyak konten di tempat dengan konversi tertinggi, ubah atau hentikan yang tidak menghasilkan.</p>
            </div>
          </div>
          <p class="mt-4 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
            <b>Etika berjualan:</b> jangan mengirim pesan massal ke orang yang tidak dikenal, jangan menjanjikan fitur atau diskon yang tidak ada,
            dan sampaikan harga sesuai yang tertera di website.
          </p>
        </section>

        <!-- 10. Template -->
        <section id="template">
          <h2 class="font-display text-3xl text-brand">Template pesan WhatsApp</h2>
          <p class="mt-3 max-w-3xl text-brand-700">Salin, sesuaikan sedikit agar terasa personal, lalu kirim.<template v-if="code !== 'KODEANDA'"> Link di template sudah memakai kode Anda.</template></p>
          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <article v-for="(t, i) in TEMPLATES" :key="t.title" class="card grid content-start gap-3 p-5">
              <div>
                <h3 class="font-semibold text-brand-900">{{ t.title }}</h3>
                <p class="text-xs text-brand-500">{{ t.when }}</p>
              </div>
              <p class="whitespace-pre-line rounded-xl bg-[#e7f6e7] p-3 text-sm leading-relaxed text-brand-900">{{ t.text }}</p>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="btn-ghost btn-sm" @click="copy(t.text, `t${i}`)">{{ copied === `t${i}` ? '✓ Disalin' : 'Salin teks' }}</button>
                <a :href="`https://wa.me/?text=${encodeURIComponent(t.text)}`" target="_blank" rel="noopener" class="btn btn-sm bg-[#25d366] text-white">Kirim lewat WhatsApp</a>
              </div>
            </article>
          </div>
        </section>

        <!-- 11. FAQ -->
        <section id="faq">
          <h2 class="font-display text-3xl text-brand">Tanya jawab</h2>
          <div class="mt-5 grid gap-2">
            <details v-for="f in FAQ" :key="f.q" class="card group p-4">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-brand-900">
                {{ f.q }}
                <span class="shrink-0 text-brand-400 transition group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p class="mt-2 text-sm text-brand-700">{{ f.a }}</p>
            </details>
          </div>
          <div class="card mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
            <p class="text-sm text-brand-700">Masih ada pertanyaan? Tim kami siap membantu.</p>
            <a :href="waLink(adminWa, 'Assalamu\'alaikum, saya reseller dan ingin bertanya tentang program reseller.')" target="_blank" rel="noopener" class="btn btn-sm bg-[#25d366] text-white">Hubungi admin via WhatsApp</a>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
