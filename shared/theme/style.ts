import { COLOR_CLASS, COLOR_KEYS, FONT_KEYS } from './constants'
import type { ThemeGlobals } from './schema'

/** Warna tema dipetakan ke kelas: bg-primary, text-ink, border-accent/40, dst. */
export const UNO_THEME = {
  colors: Object.fromEntries(
    COLOR_KEYS.map(k => [COLOR_CLASS[k], `rgb(var(--c-${COLOR_CLASS[k]}) / %alpha)`]),
  ),
  fontFamily: {
    heading: 'var(--f-heading)',
    body: 'var(--f-body)',
    script: 'var(--f-script)',
    arabic: '"Amiri", "Traditional Arabic", serif',
  },
}

function hexToChannels(hex: string): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) return '0 0 0'
  return `${parseInt(m[1]!, 16)} ${parseInt(m[2]!, 16)} ${parseInt(m[3]!, 16)}`
}

/** Gabungkan globals tema dengan override user (hanya kunci yang dikenal & valid). */
export function mergeGlobals(base: ThemeGlobals, override: unknown): ThemeGlobals {
  const out = { ...base }
  if (override && typeof override === 'object') {
    const o = override as Record<string, unknown>
    for (const k of COLOR_KEYS)
      if (typeof o[k] === 'string' && /^#[0-9a-f]{6}$/i.test(o[k] as string)) out[k] = o[k] as string
    for (const k of FONT_KEYS)
      if (typeof o[k] === 'string' && (o[k] as string).length < 40) (out as any)[k] = o[k]
  }
  return out
}

/** CSS variable untuk dipasang di elemen pembungkus undangan. */
export function globalsToCssVars(g: ThemeGlobals): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const k of COLOR_KEYS) vars[`--c-${COLOR_CLASS[k]}`] = hexToChannels(g[k])
  vars['--f-heading'] = `"${g.font_heading}", Georgia, serif`
  vars['--f-body'] = `"${g.font_body}", system-ui, sans-serif`
  vars['--f-script'] = `"${g.font_script}", cursive`
  return vars
}

export function googleFontsHref(g: ThemeGlobals): string {
  const families = [...new Set([g.font_heading, g.font_body, g.font_script, 'Amiri'])]
  const q = families
    .map(f => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${q}&display=swap`
}
