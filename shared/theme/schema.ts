import { z } from 'zod'
import {
  ALLOWED_ATTRS, ALLOWED_FONTS, classProblem, ALLOWED_TAGS, COLOR_KEYS, COMPONENTS, LIMITS,
  REPEAT_SOURCES, SECTION_TYPES, THEME_SCHEMA_VERSION,
} from './constants'

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Warna harus hex 6 digit, mis. #7fa07f')

/**
 * Kelas utilitas Tailwind (dikompilasi UnoCSS preset-wind3).
 * Aturan keamanan kelas ada di classProblem().
 */
const classString = z
  .string()
  .max(LIMITS.maxClassLength)
  .superRefine((v, c) => {
    const problem = classProblem(v)
    if (problem) c.addIssue({ code: 'custom', message: problem })
  })

export const globalsSchema = z.object({
  primary_color: hex,
  secondary_color: hex,
  accent_color: hex,
  background_color: hex,
  surface_color: hex,
  text_color: hex,
  muted_color: hex,
  font_heading: z.enum(ALLOWED_FONTS),
  font_body: z.enum(ALLOWED_FONTS),
  font_script: z.enum(ALLOWED_FONTS),
})
export type ThemeGlobals = z.infer<typeof globalsSchema>

/** Path aset: relatif (disimpan di bucket theme-assets/{slug}/), absolut aplikasi (/theme-assets/..), atau https. */
export const assetPath = z
  .string()
  .max(500)
  .regex(/^(https:\/\/[^\s"'()<>]+|\/[a-zA-Z0-9._\-/]+|[a-zA-Z0-9._\-/]+)$/, 'Path aset tidak valid')

const componentName = z.enum(Object.keys(COMPONENTS) as [keyof typeof COMPONENTS, ...(keyof typeof COMPONENTS)[]])

export interface ThemeNode {
  tag?: (typeof ALLOWED_TAGS)[number]
  class?: string
  text?: string
  attrs?: Partial<Record<(typeof ALLOWED_ATTRS)[number], string>>
  bg?: string
  if?: string
  repeat?: (typeof REPEAT_SOURCES)[number]
  component?: keyof typeof COMPONENTS
  props?: Record<string, string>
  children?: ThemeNode[]
}

export const nodeSchema: z.ZodType<ThemeNode> = z.lazy(() =>
  z.object({
    tag: z.enum(ALLOWED_TAGS).optional(),
    class: classString.optional(),
    text: z.string().max(LIMITS.maxTextLength).optional(),
    attrs: z.partialRecord(z.enum(ALLOWED_ATTRS), z.string().max(500)).optional(),
    bg: z.string().max(200).optional(),
    if: z.string().max(60).optional(),
    repeat: z.enum(REPEAT_SOURCES).optional(),
    component: componentName.optional(),
    props: z.record(z.string().max(40), z.string().max(500)).optional(),
    children: z.array(nodeSchema).max(60).optional(),
  }).strict(),
)

export const sectionSchema = z.object({
  type: z.enum(SECTION_TYPES),
  class: classString.optional(),
  bg: z.string().max(200).optional(),
  children: z.array(nodeSchema).max(60),
}).strict()
export type ThemeSection = z.infer<typeof sectionSchema>

export const themeDefinitionSchema = z.object({
  version: z.literal(THEME_SCHEMA_VERSION),
  globals: globalsSchema,
  /** Kelas untuk pembungkus undangan (latar, font dasar). */
  root_class: classString.optional(),
  /** Aset terisolasi per tema: kunci -> path. Dipakai via {{asset.kunci}} atau `bg`. */
  assets: z.record(z.string().regex(/^[a-z][a-z0-9_]{0,40}$/), assetPath).default({}),
  sections: z.array(sectionSchema).min(4).max(LIMITS.maxSections),
  /**
   * Data contoh KHUSUS pratinjau katalog (tidak pernah tampil di undangan pelanggan):
   * foto model untuk slider, galeri, dan profil mempelai.
   */
  demo: z.object({
    cover_photos: z.array(assetPath).max(8).optional(),
    gallery: z.array(assetPath).max(12).optional(),
    groom_photo: assetPath.optional(),
    bride_photo: assetPath.optional(),
  }).strict().optional(),
}).strict()
export type ThemeDefinition = z.infer<typeof themeDefinitionSchema>

export { COLOR_KEYS }
