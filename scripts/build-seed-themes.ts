/**
 * Validasi + kompilasi tema bawaan, lalu tulis SQL upsert ke supabase/seed/themes.sql, plus satu file per
 * tema di supabase/seed/themes/<slug>.sql (kecil, mudah diambil database saat menambah satu tema baru).
 * Jalankan: npx tsx scripts/build-seed-themes.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { compileTheme } from '../server/utils/theme-compiler'
import * as sakinah from './themes/sakinah-sage'
import * as minimalis from './themes/minimalis-monokrom'
import * as floral from './themes/floral-blush'
import * as bugis from './themes/walasuji-bugis'
import * as noir from './themes/royal-noir'
import * as arka from './themes/arka-modern'
import * as rustic from './themes/rustic-ilalang'
import * as makassar from './themes/pinisi-losari'
import * as toraja from './themes/tongkonan-toraja'
import * as senja from './themes/rustic-senja'
import * as arunika from './themes/rustic-arunika'
import * as lontara from './themes/lontara-bugis'
import * as aurelia from './themes/aurelia-luxe'
import * as doodle from './themes/doodle-cinta'
import * as alur from './themes/alur-cinta'
import * as aqBintang from './themes/aqiqah-bintang'
import * as aqBunga from './themes/aqiqah-bunga'
import * as khCeria from './themes/khitan-ceria'
import * as khMihrab from './themes/khitan-mihrab'
import * as utBalon from './themes/ultah-balon'
import * as utEmas from './themes/ultah-emas'
import * as ofPrima from './themes/kantor-prima'
import * as ofAgenda from './themes/kantor-agenda'
import * as acSilaturahmi from './themes/acara-silaturahmi'
import * as acKumpul from './themes/acara-kumpul'
import * as exPramuka from './themes/ekskul-pramuka'
import * as exPmr from './themes/ekskul-pmr'
import * as exSeni from './themes/ekskul-seni'
import * as kabarCinta from './themes/kabar-cinta'
import * as harianBahagia from './themes/harian-bahagia'
import * as zoomCinta from './themes/zoom-cinta'
import * as pintuHati from './themes/pintu-hati'
import * as suratCinta from './themes/surat-cinta'
import * as piringanRindu from './themes/piringan-rindu'
import * as bolaUgi from './themes/bola-ugi'
import * as layarPhinisi from './themes/layar-phinisi'
import * as tongkonanRindu from './themes/tongkonan-rindu'
import * as bukuNikah from './themes/buku-nikah'
import * as cetakKenangan from './themes/cetak-kenangan'
import * as kisahPopUp from './themes/kisah-pop-up'
import * as terminalCinta from './themes/terminal-cinta'
import * as kotakRahasia from './themes/kotak-rahasia'
import * as moccaGypsophila from './themes/mocca-gypsophila'
import * as amplopZaitun from './themes/amplop-zaitun'
import * as pitaMarun from './themes/pita-marun'
import * as catatanCinta from './themes/catatan-cinta'
import * as lengkungMawar from './themes/lengkung-mawar'
import * as perangkoCinta from './themes/perangko-cinta'
import * as tintaMerah from './themes/tinta-merah'
import * as hatiTerakota from './themes/hati-terakota'
import * as polaroidManis from './themes/polaroid-manis'
import * as anggrekEmas from './themes/anggrek-emas'

const themes = [sakinah, minimalis, floral, moccaGypsophila, lengkungMawar, arka, noir, rustic, bugis, makassar, toraja, senja, arunika, lontara, aurelia, doodle, alur, aqBintang, aqBunga, anggrekEmas, khCeria, khMihrab, utBalon, utEmas, polaroidManis, ofPrima, ofAgenda, acSilaturahmi, acKumpul, exPramuka, exPmr, exSeni, kabarCinta, harianBahagia, zoomCinta, pintuHati, suratCinta, piringanRindu, bolaUgi, layarPhinisi, tongkonanRindu, kisahPopUp, terminalCinta, kotakRahasia, amplopZaitun, pitaMarun, catatanCinta, perangkoCinta, tintaMerah, hatiTerakota, bukuNikah, cetakKenangan]
const q = (s: string) => `'${s.replace(/'/g, "''")}'`
const rows: string[] = []
const perTheme: { slug: string, row: string }[] = []
let failed = false

for (const t of themes) {
  const r = await compileTheme(t.definition)
  console.log(`\n${t.meta.name}: ${r.ok ? 'VALID' : 'TIDAK VALID'} · ${r.css.length} byte CSS`)
  r.errors.forEach(e => console.log('  ✗', e))
  r.warnings.forEach(w => console.log('  !', w))
  if (!r.ok) { failed = true; continue }
  const row = `(${[
    q(t.meta.code), q(t.meta.slug), q(t.meta.name), q(t.meta.description),
    `(select id from public.categories where slug = ${q(t.meta.category)})`,
    `${q(JSON.stringify(r.definition))}::jsonb`, q(r.css), `'published'`, `'manual'`,
  ].join(', ')})`
  rows.push(row)
  perTheme.push({ slug: t.meta.slug, row })
}

if (failed) process.exit(1)
const upsert = (values: string) => `-- Dihasilkan oleh scripts/build-seed-themes.ts — jangan diedit manual
insert into public.themes (code, slug, name, description, category_id, definition, compiled_css, status, source)
values
${values}
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, category_id = excluded.category_id,
  definition = excluded.definition, compiled_css = excluded.compiled_css;
`
mkdirSync('supabase/seed/themes', { recursive: true })
writeFileSync('supabase/seed/themes.sql', upsert(rows.join(',\n')))
for (const t of perTheme) writeFileSync(`supabase/seed/themes/${t.slug}.sql`, upsert(t.row))
console.log(`\n→ supabase/seed/themes.sql + ${perTheme.length} file per tema ditulis`)
