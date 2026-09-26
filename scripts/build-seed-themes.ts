/**
 * Validasi + kompilasi tema bawaan, lalu tulis SQL upsert ke supabase/seed/themes.sql.
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

const themes = [sakinah, minimalis, floral, arka, noir, rustic, bugis, makassar, toraja, senja, arunika, lontara, aurelia, doodle]
const q = (s: string) => `'${s.replace(/'/g, "''")}'`
const rows: string[] = []
let failed = false

for (const t of themes) {
  const r = await compileTheme(t.definition)
  console.log(`\n${t.meta.name}: ${r.ok ? 'VALID' : 'TIDAK VALID'} · ${r.css.length} byte CSS`)
  r.errors.forEach(e => console.log('  ✗', e))
  r.warnings.forEach(w => console.log('  !', w))
  if (!r.ok) { failed = true; continue }
  rows.push(`(${[
    q(t.meta.code), q(t.meta.slug), q(t.meta.name), q(t.meta.description),
    `(select id from public.categories where slug = ${q(t.meta.category)})`,
    `${q(JSON.stringify(r.definition))}::jsonb`, q(r.css), `'published'`, `'manual'`,
  ].join(', ')})`)
}

if (failed) process.exit(1)
mkdirSync('supabase/seed', { recursive: true })
writeFileSync('supabase/seed/themes.sql', `-- Dihasilkan oleh scripts/build-seed-themes.ts — jangan diedit manual
insert into public.themes (code, slug, name, description, category_id, definition, compiled_css, status, source)
values
${rows.join(',\n')}
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, category_id = excluded.category_id,
  definition = excluded.definition, compiled_css = excluded.compiled_css;
`)
console.log('\n→ supabase/seed/themes.sql ditulis')
