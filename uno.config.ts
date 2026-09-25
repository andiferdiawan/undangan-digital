import { defineConfig, presetWind3 } from 'unocss'
import { UNO_THEME } from './shared/theme/style'

export default defineConfig({
  presets: [presetWind3()],
  theme: {
    ...UNO_THEME,
    colors: {
      ...UNO_THEME.colors,
      // Warna UI aplikasi (marketplace & dashboard)
      brand: { DEFAULT: '#2f4a3a', 50: '#f3f7f2', 100: '#e4ede1', 200: '#c8dbc4', 300: '#a3c09d', 400: '#7fa07f', 500: '#5f8666', 600: '#4a6c52', 700: '#3b5744', 800: '#2f4a3a', 900: '#243a2d' },
      clay: { DEFAULT: '#d9825b', 50: '#fdf4ee', 100: '#fbe3d2', 200: '#f5c5a8', 300: '#eea888', 400: '#e3916c', 500: '#d9825b', 600: '#b8623f', 700: '#964c30' },
      cream: '#fbf7f0',
    },
    fontFamily: {
      ...UNO_THEME.fontFamily,
      sans: '"Plus Jakarta Sans", system-ui, sans-serif',
      display: 'Marcellus, Georgia, serif',
    },
  },
  shortcuts: {
    'btn': 'inline-flex items-center justify-center gap-2 rounded-full px-5 min-h-11 text-sm font-semibold transition active:scale-97 disabled:opacity-50 disabled:pointer-events-none',
    'btn-primary': 'btn bg-brand text-white hover:bg-brand-700',
    'btn-accent': 'btn bg-clay text-white hover:bg-clay-600',
    'btn-ghost': 'btn bg-white text-brand ring-1 ring-brand-200 hover:bg-brand-50',
    'btn-sm': 'min-h-9 px-4 text-xs',
    'input': 'w-full rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-base text-brand-900 outline-none transition focus:border-brand-400 focus:ring-3 focus:ring-brand-100',
    'label': 'grid gap-1.5 text-sm font-medium text-brand-800',
    'card': 'rounded-2xl bg-white ring-1 ring-brand-100 shadow-sm',
    'chip': 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  },
})
