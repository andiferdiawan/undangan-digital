import type { ThemeDefinition, ThemeNode } from '../../shared/theme/schema'
import { comp, div, el, img, p } from './_h'

/**
 * Terminal Cinta — ruang kerja isometrik 3D yang minimalis (meja, monitor, keyboard, kopi, tanaman), dibuat
 * murni dari CSS tanpa aset gambar. Konsep gerak:
 * - sampul (otomatis saat dimuat, uv-play): objek-objek isometrik melayang turun dan menyusun diri, layar monitor
 *   menyala dan mengetik baris perintah (CLI), lalu layar membesar dan bertransisi menjadi jendela undangan
 * - pembuka (scroll): kamera mengorbit meja, kartu hologram nama mempelai naik dari monitor
 * - tengah: setiap bagian adalah jendela aplikasi yang datang dari kejauhan (uv-z)
 * - galeri: cincin layar foto 3D yang berputar mengikuti scroll (uv-ring)
 * - penutup: objek-objek melayang pergi satu per satu, layar mengetik `logout`
 */
const BG = '#eef1f6'
const INK = '#1e2433'
const CORAL = '#ff7a59'
const MINT = '#46d19a'
const SCREEN = '#0f1420'

const T = 'var(--uv-t,1)'
const S = 'var(--uv-s,1)'
const ramp = (v: string, from: number, speed: number) => `clamp(0,(${v}_-_${from})*${speed},1)`
const sm = (r: string) => `calc(${r}*${r}*(3_-_2*${r}))`

const stage = 'uv-scene-stage sticky top-0 flex h-[var(--uv-vh,100svh)] flex-col items-center justify-center overflow-hidden px-5 text-center'
const dots = `[background-image:radial-gradient(#cdd4e0_1px,transparent_1px)] [background-size:18px_18px]`
const btn = `inline-flex items-center justify-center gap-2 rounded-full bg-[${INK}] px-7 py-3 font-body text-[13px] font-medium tracking-[0.06em] text-white shadow-[0_12px_24px_-12px_rgba(30,36,51,0.7)]`
const mono = (cls: string, t: string) => p(`font-mono ${cls}`, t)
const kicker = (t: string) => mono(`text-[12px] tracking-[0.08em] text-[${CORAL}]`, t)
const heading = (t: string) => el('h2', 'mt-2 font-heading text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary', t)

/** Jendela aplikasi: bilah judul dengan tiga titik + nama berkas bergaya terminal. */
function win(title: string, body: ThemeNode[], cls = '', bodyCls = 'px-6 pb-8 pt-6', opt: Parameters<typeof div>[2] = {}): ThemeNode {
  return div(`overflow-hidden rounded-[16px] border border-[#d6dce6] bg-white shadow-[0_24px_48px_-30px_rgba(30,36,51,0.45)] ${cls}`, [
    div('flex items-center gap-1.5 border-b border-[#e6eaf0] bg-[#f7f8fb] px-4 py-2.5', [
      div(`h-2.5 w-2.5 rounded-full bg-[${CORAL}]`), div('h-2.5 w-2.5 rounded-full bg-[#ffc857]'), div(`h-2.5 w-2.5 rounded-full bg-[${MINT}]`),
      mono('ml-2 truncate text-[11px] text-muted', title),
    ]),
    div(bodyCls, body),
  ], opt)
}

type Faces = [top: string, front: string, side: string]
/**
 * Balok isometrik (alas w×d, tinggi h) di posisi (x, y, z) dunia. `p` 0..1 = balok melayang turun ke tempatnya
 * (0 = masih tinggi di atas & transparan). `front` isi sisi depan (mis. layar monitor).
 */
function box(x: number, y: number, z: number, w: number, d: number, h: number, c: Faces, p: string, front: ThemeNode[] = [], extra: ThemeNode[] = []): ThemeNode {
  const face = '[opacity:var(--p)]'
  return div(`absolute left-[${x}px] top-[${y}px] h-[${d}px] w-[${w}px] [transform-style:preserve-3d] [--p:${p}] [transform:translateZ(calc(${z}px_+_(1_-_var(--p))*260px))]`, [
    div(`absolute inset-0 rounded-[2px] bg-[${c[0]}] ${face} [transform:translateZ(${h}px)]`),
    div(`absolute bottom-0 left-0 h-[${h}px] w-full overflow-hidden bg-[${c[1]}] ${face} [transform-origin:50%_100%] [transform:rotateX(-90deg)]`, front),
    div(`absolute right-0 top-0 h-full w-[${h}px] bg-[${c[2]}] ${face} [transform-origin:100%_50%] [transform:rotateY(90deg)]`),
    ...extra,
  ])
}

/** Bidang tegak (menghadap depan) di atas sebuah titik, untuk daun, uap kopi, hologram. */
function stand(cls: string, content: ThemeNode[] = [], turn = ''): ThemeNode {
  return div(`absolute ${cls} [opacity:var(--p,1)] [transform-origin:50%_100%] [transform:${turn}rotateX(-90deg)]`, content)
}

const DESK: Faces = ['#fbfcfd', '#d5dae3', '#bcc3cf']
const LEG: Faces = ['#9aa3b3', '#8a93a3', '#747d8e']
const DARK: Faces = ['#3a4256', INK, '#161b27']
const MUG: Faces = ['#ffa088', CORAL, '#e0613f']
const POT: Faces = ['#e5e9f0', '#c9cfdb', '#b0b8c6']

/**
 * Ruang kerja isometrik. `drop(i)` = ekspresi 0..1 tiap objek (urutan menyusun diri), `on` = layar menyala,
 * `cli` = baris-baris terminal [teks, ekspresi ketik 0..1], `rot` = sudut orbit kamera, `holo` = isi kartu hologram.
 */
function workspace(drop: (i: number) => string, on: string, cli: [string, string][], rot: string, holo?: { up: string, content: ThemeNode[] }): ThemeNode {
  const top = 78 // permukaan meja
  const screen = div(`absolute inset-[4px] overflow-hidden rounded-[2px] bg-[${SCREEN}] [--on:${on}]`, [
    div(`absolute inset-0 origin-center bg-[#16203a] [opacity:var(--on)] [transform:scaleY(calc(0.02_+_var(--on)*0.98))]`),
    div('relative px-1.5 pt-1.5 text-left', cli.map(([t, r], i) =>
      mono(`truncate whitespace-nowrap text-[6px] leading-[1.55] ${i === cli.length - 1 ? `text-[${MINT}]` : t.startsWith('$') ? 'text-white' : 'text-[#9fb1d1]'} [clip-path:inset(0_calc((1_-_${r})*100%)_0_0)]`, t))),
  ])
  return div(`relative h-[240px] w-[240px] shrink-0 [transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(${rot})]`, [
    // lantai / alas
    box(0, 0, 0, 240, 240, 3, ['#e4e8ef', '#cfd5df', '#bec5d1'], drop(0)),
    // meja: kaki + papan
    box(34, 64, 3, 8, 8, 72, LEG, drop(1)), box(198, 64, 3, 8, 8, 72, LEG, drop(1)),
    box(34, 158, 3, 8, 8, 72, LEG, drop(1)), box(198, 158, 3, 8, 8, 72, LEG, drop(1)),
    box(28, 58, 70, 184, 116, 8, DESK, drop(1)),
    // monitor: kaki + layar (sisi depan = layar)
    box(112, 96, top, 16, 12, 20, DARK, drop(2)),
    box(64, 88, top + 20, 112, 8, 72, DARK, drop(2), [screen]),
    // keyboard & mouse
    box(78, 130, top, 84, 24, 4, ['#ffffff', '#d7dce5', '#c0c7d3'], drop(3)),
    box(172, 136, top, 10, 14, 4, ['#ffffff', '#d7dce5', '#c0c7d3'], drop(3)),
    // cangkir kopi + uap
    box(186, 106, top, 16, 16, 18, MUG, drop(4), [], [
      stand('left-[3px] top-0 h-[26px] w-[10px]', [div('uv-float h-full w-full rounded-full border-l-2 border-[#9aa3b3]/60')], 'translateZ(18px)_'),
    ]),
    // tanaman: pot + dua daun bersilang
    box(40, 72, top, 20, 20, 20, POT, drop(5), [], [
      stand('left-[-4px] top-[10px] h-[34px] w-[28px]', [div(`h-full w-full rounded-[50%_50%_45%_45%/60%_60%_40%_40%] bg-[${MINT}]`)], 'translateZ(20px)_'),
      stand('left-[-4px] top-[10px] h-[30px] w-[28px]', [div('h-full w-full rounded-[50%_50%_45%_45%/60%_60%_40%_40%] bg-[#2fb07d]')], 'translateZ(20px)_rotateZ(90deg)_'),
    ]),
    ...(holo
      ? [div(`absolute left-[60px] top-[92px] h-[4px] w-[120px] [transform-style:preserve-3d] [transform:translateZ(calc(${top + 96}px_+_${holo.up}*34px))]`, [
          stand('bottom-0 left-0 h-[74px] w-[120px]', [
            div(`flex h-full w-full flex-col items-center justify-center rounded-[6px] border border-[${MINT}]/70 bg-white/85 px-2 shadow-[0_0_24px_rgba(70,209,154,0.45)] [opacity:${holo.up}]`, holo.content),
          ]),
        ])]
      : []),
  ])
}

// ---------- Sampul (uv-play, --uv-t) ----------
const C_DROP = (i: number) => sm(ramp(T, [0, 0.05, 0.13, 0.2, 0.25, 0.29][i]!, 5))
const C_ON = ramp(T, 0.36, 8)
const C_CLI: [string, string][] = [
  ['$ nikah --init', ramp(T, 0.42, 9)],
  ['> memuat data mempelai… ok', ramp(T, 0.48, 9)],
  ['> {{groom_nickname}} + {{bride_nickname}}', ramp(T, 0.54, 9)],
  ['> tanggal: {{event_date}}', ramp(T, 0.6, 9)],
  ['$ buka undangan ▍', ramp(T, 0.66, 9)],
]
const C_X = sm(ramp(T, 0.76, 4.4))
// kamera mendekat ke monitor selama layar mengetik
const C_ZOOM = sm(ramp(T, 0.34, 3))

// ---------- Pembuka (scroll): orbit & hologram ----------
const H_CLI: [string, string][] = [
  ['$ git add hati.txt', ramp(S, 0.05, 6)],
  ['$ git commit -m "menikah"', ramp(S, 0.18, 6)],
  ['> [main] 2 hati bersatu', ramp(S, 0.32, 6)],
  ['$ git push --selamanya', ramp(S, 0.46, 6)],
  ['> berhasil ✓', ramp(S, 0.6, 6)],
]

// ---------- Penutup (scroll): objek melayang pergi ----------
const E_DROP = (i: number) => `calc(1_-_${sm(ramp(S, [0.62, 0.5, 0.42, 0.34, 0.26, 0.2][i]!, 5))})`
const E_CLI: [string, string][] = [
  ['$ simpan kenangan', ramp(S, 0, 20)],
  ['> terima kasih atas doa', ramp(S, 0.04, 12)],
  ['$ logout ▍', ramp(S, 0.1, 10)],
]
const E_END = ramp(S, 0.72, 4)

// Cincin galeri: sudut tiap layar (6 posisi)
const RING = [0, 1, 2, 3, 4, 5].map(i => `[&:nth-child(6n+${i + 1})]:[--a:${i * 60}deg]`).join(' ')

function person(who: 'groom' | 'bride'): ThemeNode {
  return win(who === 'groom' ? 'mempelai_pria.json' : 'mempelai_wanita.json', [
    div(`relative mx-auto h-40 w-40 overflow-hidden rounded-[20px] bg-[${BG}]`, [
      img('absolute inset-0 h-full w-full object-cover object-top', `{{${who}_photo}}`, who === 'groom' ? 'Foto mempelai pria' : 'Foto mempelai wanita', { if: `${who}_photo` }),
      div('absolute inset-0 grid place-items-center', [el('span', 'font-heading text-[36px] font-semibold text-primary', `{{${who}_nickname}}`)], { if: `!${who}_photo` }),
    ]),
    el('h3', 'mt-5 font-heading text-[22px] font-semibold leading-tight text-primary', `{{${who}_name}}`),
    p('mt-1 font-body text-[14px] text-muted', `{{${who}_parents}}`),
    el('a', `mt-3 inline-block font-mono text-[12px] text-[${CORAL}] underline`, '@instagram', { attrs: { href: `{{${who}_instagram}}` }, if: `${who}_instagram` }),
  ], 'uv-z text-center')
}

export const meta = {
  code: 'MOD-008',
  slug: 'terminal-cinta',
  name: 'Terminal Cinta',
  category: 'modern',
  description: 'Ruang kerja isometrik 3D yang minimalis: meja, monitor, keyboard, secangkir kopi dan tanaman melayang masuk lalu menyusun diri, layar monitor menyala dan mengetik baris perintah seperti terminal, kemudian bertransisi halus menjadi jendela undangan. Setiap bagian tampil sebagai jendela aplikasi yang rapi.',
}

export const definition: ThemeDefinition = {
  version: 1,
  globals: {
    primary_color: INK,
    secondary_color: CORAL,
    accent_color: MINT,
    background_color: BG,
    surface_color: '#ffffff',
    text_color: INK,
    muted_color: '#6b7488',
    font_heading: 'Outfit',
    font_body: 'DM Sans',
    font_script: 'Caveat',
  },
  root_class: `text-[15px] leading-relaxed bg-[${BG}] ${dots}`,
  assets: {},
  demo: {
    gallery: ['/theme-assets/lontara-bugis/pelaminan.jpg', '/theme-assets/lontara-bugis/slide-2.jpg', '/theme-assets/lontara-bugis/keluarga.jpg', '/theme-assets/lontara-bugis/slide-3.jpg', '/theme-assets/lontara-bugis/bride.jpg', '/theme-assets/lontara-bugis/groom.jpg'],
    groom_photo: '/theme-assets/lontara-bugis/groom.jpg',
    bride_photo: '/theme-assets/lontara-bugis/bride.jpg',
  },
  sections: [
    // ---------- Sampul: menyusun diri, layar menyala (CLI), lalu menjadi jendela undangan ----------
    {
      type: 'cover',
      class: `relative flex flex-col items-center justify-center overflow-hidden bg-[${BG}] ${dots} px-5 text-center`,
      children: [
        div(`uv-play relative flex h-[560px] w-full items-center justify-center [--uv-dur:9s] [--x:${C_X}]`, [
          mono(`absolute inset-x-0 bottom-2 text-[12px] text-muted [opacity:calc(${ramp(T, 0, 6)}_-_var(--x)*2)]`, '~/undangan $ memuat ruang kerja…'),
          div(`absolute inset-0 flex items-center justify-center [--z:${C_ZOOM}] [transform:translateY(calc(var(--z)*96px_-_var(--x)*40px))_scale(calc(1_+_var(--z)*0.85_+_var(--x)*0.6))] [opacity:calc(1_-_var(--x)*0.8)]`, [
            workspace(C_DROP, C_ON, C_CLI, '45deg'),
          ]),
          // jendela undangan: tumbuh dari layar monitor
          div('absolute inset-x-0 top-1/2 flex justify-center [transform:translateY(-50%)]', [
            win('undangan.app', [
              mono(`text-[11px] text-[${CORAL}]`, '// the wedding of'),
              el('h1', 'mt-2 font-heading text-[38px] font-semibold leading-[1.05] tracking-[-0.02em] text-primary', [
                el('span', 'block', '{{groom_nickname}}'),
                el('span', `block text-[22px] text-[${CORAL}]`, '&'),
                el('span', 'block', '{{bride_nickname}}'),
              ]),
              mono('mt-3 text-[12px] text-muted', '{{event_date}}'),
              div('mx-auto my-5 h-px w-16 bg-[#e0e5ee]'),
              p('font-body text-[13px] text-muted', 'Kepada Yth. Bapak/Ibu/Saudara/i'),
              comp('guest_name', 'mt-1 block font-heading text-[19px] font-medium text-primary', { fallback: 'Tamu Undangan' }),
              div('mt-6', [comp('open_button', btn, { label: 'Buka Undangan →' })]),
            ], `w-[300px] text-center [opacity:var(--x)] [transform:translateY(calc((1_-_var(--x))*-60px))_scale(calc(0.3_+_var(--x)*0.7))]`, 'px-6 pb-7 pt-6'),
          ]),
        ]),
      ],
    },
    // ---------- Pembuka: kamera mengorbit meja, hologram nama naik dari monitor ----------
    {
      type: 'hero',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_3)] bg-[${BG}] ${dots}`,
      children: [
        div(stage, [
          div(`pointer-events-none absolute inset-x-0 top-[8%] [opacity:calc(1_-_${ramp(S, 0.7, 5)})]`, [
            kicker('// compile cinta'), p('mt-1 font-heading text-[24px] font-semibold text-primary', 'Sedang memproses…'),
          ]),
          div(`flex items-center justify-center [transform:translateY(calc(${sm(ramp(S, 0.55, 2.4))}*50px))_scale(calc(1.1_+_${sm(ramp(S, 0.55, 2.4))}*0.4))]`, [
            workspace(() => '1', '1', H_CLI, `calc(45deg_-_${S}*35deg)`, {
              up: ramp(S, 0.62, 4),
              content: [
                mono(`text-[5.5px] text-[${CORAL}]`, '// the wedding of'),
                p('mt-0.5 font-heading text-[13px] font-semibold leading-tight text-primary', '{{groom_nickname}} & {{bride_nickname}}'),
                mono('mt-0.5 text-[5.5px] text-muted', '{{event_date}}'),
              ],
            }),
          ]),
          mono(`pointer-events-none absolute inset-x-0 bottom-7 text-[11px] text-muted [opacity:calc(1_-_${S}*6)]`, '↓ scroll untuk menjalankan'),
        ]),
      ],
    },
    {
      type: 'quote',
      class: 'relative px-5 py-20',
      children: [
        win('ayat.txt', [
          p('font-arabic text-[22px] leading-loose text-primary', '{{quote_arabic}}'),
          p('mt-5 font-body text-[16px] italic leading-relaxed text-ink/80', '“{{quote_text}}”'),
          mono(`mt-4 text-[12px] text-[${CORAL}]`, '— {{quote_source}}'),
        ], 'uv-z text-center'),
      ],
    },
    {
      type: 'profile',
      class: 'relative px-5 py-16 text-center',
      children: [
        div('uv-z', [kicker('// 01 · mempelai'), heading('Dua Pengguna, Satu Akun')]),
        p('uv-z mx-auto mt-4 max-w-[310px] font-body text-[15px] text-muted', '{{opening_text}}'),
        div('mt-10 grid gap-8', [person('groom'), person('bride')]),
      ],
    },
    {
      type: 'event',
      class: 'relative px-5 py-16 text-center',
      children: [
        div('uv-z', [kicker('// 02 · jadwal'), heading('Rilis Hari Bahagia')]),
        win('countdown.sh', [comp('countdown', '', {
          item_class: `rounded-[12px] bg-[${SCREEN}] pb-3 pt-4 text-center`,
          number_class: `block font-mono text-[24px] leading-none text-[${MINT}]`,
          label_class: 'font-mono text-[10px] uppercase tracking-[0.1em] text-[#9fb1d1]',
        })], 'uv-z mt-8', 'p-4'),
        div('mt-8 grid gap-8', [
          win('acara.md', [
            mono(`text-[12px] text-[${CORAL}]`, '{{item.day}}'),
            el('h3', 'mt-1 font-heading text-[22px] font-semibold leading-tight text-primary', '{{item.name}}'),
            p('mt-2 font-body text-[16px] text-ink', '{{item.date}}'),
            mono('text-[13px] text-muted', '{{item.time}}'),
            div('mx-auto my-5 h-px w-16 bg-[#e0e5ee]'),
            p('font-heading text-[16px] font-medium text-primary', '{{item.venue}}'),
            p('font-body text-[14px] text-muted', '{{item.address}}'),
            comp('map_button', `mt-6 ${btn}`, { href: '{{item.map_url}}', label: 'Buka Peta' }, { if: 'item.map_url' }),
          ], 'uv-z text-center', 'px-6 pb-7 pt-6', { repeat: 'events' }),
        ]),
        div('uv-z mt-8', [comp('calendar_button', '', { label: '+ Simpan ke Kalender', button_class: 'inline-flex rounded-full border border-[#cdd4e0] bg-white px-6 py-2.5 font-mono text-[12px] text-primary' })]),
      ],
    },
    {
      type: 'story',
      class: 'relative px-5',
      children: [
        div('py-16 text-center', [
          div('uv-z', [kicker('// 03 · git log'), heading('Riwayat Commit Kami')]),
          win('git log --oneline', [
            div(`relative border-l-2 border-dashed border-[#d6dce6] pb-7 pl-5 text-left last:pb-0`, [
              div(`absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[${CORAL}] shadow-[0_0_0_2px_${CORAL}]`),
              mono(`text-[11px] text-[${CORAL}]`, '{{item.date}}'),
              el('h3', 'mt-0.5 font-heading text-[18px] font-semibold leading-tight text-primary', '{{item.title}}'),
              p('mt-1 font-body text-[14px] text-muted', '{{item.text}}'),
            ], { repeat: 'story' }),
          ], 'uv-z mt-8', 'px-6 pb-6 pt-6'),
        ], { if: 'story' }),
      ],
    },
    // ---------- Galeri: cincin layar foto 3D ----------
    {
      type: 'gallery',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.6)] bg-[${INK}]`,
      children: [
        div(stage, [
          div('', [mono(`text-[12px] text-[${MINT}]`, '// 04 · galeri'), p('mt-2 font-heading text-[28px] font-semibold text-white', 'Tangkapan Layar Kenangan')]),
          div('mt-14 [perspective:900px]', [
            div(`uv-ring relative h-[210px] w-[150px] [transform-style:preserve-3d] [transform:rotateX(-8deg)_rotateY(calc(${S}_*_-330deg))]`, [
              div(`uv-ring-item absolute inset-0 [backface-visibility:hidden] ${RING} [transform:rotateY(var(--a,0deg))_translateZ(185px)]`, [
                div(`flex h-full w-full flex-col overflow-hidden rounded-[12px] border-[5px] border-[#2a3142] bg-[${SCREEN}] shadow-[0_20px_40px_-18px_rgba(0,0,0,0.8)]`, [
                  img('min-h-0 w-full flex-1 object-cover', '{{item.url}}', '{{item.caption}}'),
                  div(`h-2 w-full bg-[#2a3142]`),
                ]),
              ], { repeat: 'gallery' }),
            ]),
          ]),
          mono('mt-[84px] text-[11px] text-white/50', '↓ scroll untuk memutar'),
        ], { if: 'gallery' }),
      ],
    },
    {
      type: 'rsvp',
      class: 'relative px-5 py-16 text-center',
      children: [
        div('uv-z', [kicker('// 05 · rsvp'), heading('Konfirmasi Kehadiran')]),
        win('rsvp.form', [
          comp('rsvp_form', '', {
            input_class: `w-full rounded-[10px] border border-[#d6dce6] bg-[#f7f8fb] px-4 py-3 font-body text-[16px] text-ink outline-none focus:border-[${CORAL}]`,
            button_class: `w-full ${btn} disabled:opacity-60`,
            label_class: 'font-mono text-[11px] text-muted',
          }),
        ], 'uv-z mt-8 text-left'),
        win('ucapan.log', [
          comp('wishes', 'text-left', { item_class: 'border-b border-[#e6eaf0] py-4', name_class: 'font-heading text-[15px] font-semibold text-primary' }),
        ], 'uv-z mt-8', 'px-5 pb-4 pt-2'),
      ],
    },
    {
      type: 'gift',
      class: 'px-5',
      children: [
        div('py-16 text-center', [
          div('uv-z', [kicker('// 06 · transfer'), heading('Amplop Digital')]),
          p('uv-z mx-auto mt-4 max-w-[300px] font-body text-[15px] text-muted', 'Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:'),
          div('mt-8 grid gap-6', [
            win('transfer.sh', [
              mono(`text-[12px] text-[${CORAL}]`, '{{item.bank}}'),
              p('mt-2 font-mono text-[22px] tracking-wider text-primary', '{{item.number}}'),
              p('font-body text-[14px] text-muted', 'a.n. {{item.holder}}'),
              div('mt-5', [comp('copy_button', '', { value: '{{item.number}}', label: 'Salin Nomor', button_class: `rounded-full bg-[${INK}] px-5 py-2 font-mono text-[12px] text-white` })]),
            ], 'uv-z text-center', 'px-6 pb-7 pt-6', { repeat: 'gifts' }),
          ]),
        ], { if: 'gifts' }),
      ],
    },
    // ---------- Penutup: objek melayang pergi, layar mengetik logout ----------
    {
      type: 'closing',
      class: `uv-scene relative h-[calc(var(--uv-vh,100svh)_*_2.6)] bg-[${BG}] ${dots}`,
      children: [
        div(stage, [
          p(`max-w-[300px] font-body text-[15px] text-muted [opacity:calc(1_-_${ramp(S, 0.2, 5)})]`, '{{closing_text}}'),
          div('my-2 flex h-[330px] shrink-0 items-center justify-center', [workspace(E_DROP, `calc(1_-_${ramp(S, 0.45, 8)})`, E_CLI, '45deg')]),
          div(`[opacity:${E_END}] [transform:translateY(calc((1_-_${E_END})*16px))]`, [
            mono(`text-[12px] text-[${CORAL}]`, '// sesi berakhir'),
            p('mt-2 font-body text-[15px] text-muted', '{{closing_greeting}}'),
            p('mt-1 font-heading text-[30px] font-semibold text-primary', '{{couple_names}}'),
          ]),
        ]),
      ],
    },
  ],
}
