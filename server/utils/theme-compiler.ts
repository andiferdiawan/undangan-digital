import { createGenerator, type UnoGenerator } from '@unocss/core'
import presetWind3 from '@unocss/preset-wind3'
import { UNO_THEME } from '../../shared/theme/style'
import { validateTheme, type ValidationResult } from '../../shared/theme/validate'

let generator: Promise<UnoGenerator<any>> | null = null
function getGenerator(): Promise<UnoGenerator<any>> {
  generator ??= createGenerator<any>({ presets: [presetWind3() as any], theme: UNO_THEME })
  return generator
}

export interface CompileResult extends ValidationResult {
  css: string
}

/**
 * Validasi + kompilasi tema menjadi CSS statis.
 * Kelas Tailwind dari tema (termasuk hasil AI) dirender sekali saat tema disimpan,
 * sehingga halaman undangan tidak butuh Tailwind runtime.
 */
export async function compileTheme(definition: unknown): Promise<CompileResult> {
  const result = validateTheme(definition)
  if (!result.ok) return { ...result, css: '' }

  const uno = await getGenerator()
  const tokens = new Set(result.classes.flatMap(c => c.split(/\s+/)).filter(Boolean))
  // Di-scope ke .invite-root: specificity lebih tinggi dari reset CSS dan tidak bocor ke UI aplikasi
  const { css, matched } = await uno.generate(tokens, { preflights: false, minify: true, scope: '.invite-root' })

  const unknown = [...tokens].filter(t => !matched.has(t))
  if (unknown.length)
    result.warnings.push(`Kelas tidak dikenali & diabaikan: ${unknown.slice(0, 20).join(', ')}${unknown.length > 20 ? ', …' : ''}`)

  return { ...result, css }
}
