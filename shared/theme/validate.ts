import {
  classProblem, COMPONENTS, LIMITS, PLACEHOLDERS, REPEAT_FIELDS, REPEAT_SOURCES, REQUIRED_PLACEHOLDERS,
  REQUIRED_SECTIONS, type RepeatSource,
} from './constants'
import { placeholdersIn } from './context'
import { themeDefinitionSchema, type ThemeDefinition, type ThemeNode } from './schema'

export interface ValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
  definition?: ThemeDefinition
  /** Semua string kelas di tema, untuk dikompilasi menjadi CSS. */
  classes: string[]
}

const CLASS_PROPS = new Set(['item_class', 'number_class', 'label_class', 'input_class', 'button_class', 'name_class', 'text_class', 'image_class', 'dot_class'])
const LIST_KEYS = new Set<string>(REPEAT_SOURCES)

/**
 * Pipeline validasi tema (dipakai untuk tema AI maupun manual):
 * 1. Struktur & tipe (Zod)
 * 2. Placeholder dikenal, item.* hanya di dalam repeat, asset.* terdaftar
 * 3. Placeholder wajib & section wajib ada
 * 4. Atribut href/src hanya dari placeholder yang aman
 */
export function validateTheme(input: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const classes: string[] = []

  const parsed = themeDefinitionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.slice(0, 30).map(i => `${i.path.join('.') || '(root)'}: ${i.message}`),
      warnings,
      classes,
    }
  }
  const def = parsed.data
  const used = new Set<string>()
  /** Field item yang dipakai di dalam repeat events (mis. item.map_url setara location_map). */
  const usedEventItems = new Set<string>()
  let nodeCount = 0

  if (def.root_class) classes.push(def.root_class)

  const checkKey = (key: string, where: string, repeat: RepeatSource | null) => {
    if (key === 'index') {
      if (!repeat) errors.push(`${where}: {{index}} hanya boleh di dalam repeat`)
      return
    }
    if (key.startsWith('item.')) {
      if (!repeat) errors.push(`${where}: {{${key}}} hanya boleh di dalam repeat`)
      else if (!REPEAT_FIELDS[repeat].includes(key.slice(5)))
        errors.push(`${where}: field "${key.slice(5)}" tidak ada di ${repeat} (tersedia: ${REPEAT_FIELDS[repeat].join(', ')})`)
      else if (repeat === 'events') usedEventItems.add(key.slice(5))
      return
    }
    if (key.startsWith('asset.')) {
      if (!(key.slice(6) in def.assets)) errors.push(`${where}: aset "${key.slice(6)}" belum didaftarkan di assets`)
      return
    }
    if (!(key in PLACEHOLDERS)) errors.push(`${where}: placeholder {{${key}}} tidak dikenal`)
    used.add(key)
  }

  const checkString = (s: string, where: string, repeat: RepeatSource | null) => {
    const stray = s.replace(/\{\{\s*[a-z_]+(?:\.[a-z_]+)?\s*\}\}/g, '')
    if (/\{\{|\}\}/.test(stray)) errors.push(`${where}: format placeholder salah`)
    for (const key of placeholdersIn(s)) checkKey(key, where, repeat)
  }

  /** href/src/bg harus seluruhnya satu placeholder, supaya URL selalu lewat sanitasi. */
  const checkUrlField = (s: string, where: string, repeat: RepeatSource | null) => {
    if (!/^\{\{\s*[a-z_]+(?:\.[a-z_]+)?\s*\}\}$/.test(s.trim())) {
      errors.push(`${where}: harus berupa satu placeholder, mis. {{asset.pattern}} atau {{location_map}}`)
      return
    }
    checkString(s, where, repeat)
  }

  const walk = (node: ThemeNode, where: string, depth: number, parentRepeat: RepeatSource | null) => {
    nodeCount++
    if (node.repeat && parentRepeat) errors.push(`${where}: repeat bertingkat tidak diizinkan`)
    // Node yang memiliki repeat ikut berada di dalam scope item-nya sendiri
    const repeat = node.repeat ?? parentRepeat
    if (depth > LIMITS.maxDepth) {
      errors.push(`${where}: kedalaman node melebihi ${LIMITS.maxDepth}`)
      return
    }
    if (node.class) classes.push(node.class)
    if (node.text) checkString(node.text, `${where}.text`, repeat)
    if (node.bg) checkUrlField(node.bg, `${where}.bg`, repeat)

    for (const [attr, value] of Object.entries(node.attrs ?? {})) {
      if (attr === 'href' || attr === 'src') checkUrlField(value!, `${where}.attrs.${attr}`, repeat)
      else checkString(value!, `${where}.attrs.${attr}`, repeat)
    }
    if ((node.tag === 'img') && !node.attrs?.src) errors.push(`${where}: img wajib punya attrs.src`)

    if (node.if) {
      const key = node.if.replace(/^!/, '')
      if (!LIST_KEYS.has(key)) checkKey(key, `${where}.if`, repeat)
    }

    if (node.component) {
      const allowed = COMPONENTS[node.component].props as readonly string[]
      for (const [prop, value] of Object.entries(node.props ?? {})) {
        if (!allowed.includes(prop)) {
          errors.push(`${where}: prop "${prop}" tidak dikenal untuk ${node.component}`)
          continue
        }
        if (CLASS_PROPS.has(prop)) {
          const problem = value.length > LIMITS.maxClassLength ? 'Kelas terlalu panjang' : classProblem(value)
          if (problem) errors.push(`${where}.props.${prop}: ${problem}`)
          else classes.push(value)
        }
        else if (prop === 'href') checkUrlField(value, `${where}.props.href`, repeat)
        else checkString(value, `${where}.props.${prop}`, repeat)
      }
      if (node.component === 'map_button' && !node.props?.href)
        errors.push(`${where}: map_button wajib punya props.href`)
      if (node.component === 'photo_slider' && node.props?.interval && !/^\d{3,5}$/.test(node.props.interval))
        errors.push(`${where}: photo_slider.interval harus angka milidetik, mis. 5000`)
      if (node.component === 'copy_button' && !node.props?.value)
        errors.push(`${where}: copy_button wajib punya props.value`)
    }
    else if (node.props) {
      warnings.push(`${where}: props diabaikan karena node bukan komponen`)
    }

    node.children?.forEach((child, i) => walk(child, `${where}.children[${i}]`, depth + 1, repeat))
  }

  const sectionTypes = new Set<string>()
  def.sections.forEach((section, si) => {
    const where = `sections[${si}:${section.type}]`
    if (sectionTypes.has(section.type)) warnings.push(`${where}: tipe section duplikat`)
    sectionTypes.add(section.type)
    if (section.class) classes.push(section.class)
    if (section.bg) checkUrlField(section.bg, `${where}.bg`, null)
    section.children.forEach((n, i) => walk(n, `${where}.children[${i}]`, 1, null))
  })

  if (nodeCount > LIMITS.maxNodes) errors.push(`Jumlah node ${nodeCount} melebihi batas ${LIMITS.maxNodes}`)
  for (const s of REQUIRED_SECTIONS)
    if (!sectionTypes.has(s)) errors.push(`Section wajib "${s}" tidak ada`)
  const alias: Partial<Record<string, string>> = { event_date: 'date', location_map: 'map_url' }
  for (const p of REQUIRED_PLACEHOLDERS) {
    const viaRepeat = alias[p] && usedEventItems.has(alias[p]!)
    if (!used.has(p) && !viaRepeat)
      errors.push(`Placeholder wajib {{${p}}} tidak dipakai${alias[p] ? ` (atau {{item.${alias[p]}}} di dalam repeat events)` : ''}`)
  }
  if (sectionTypes.has('cover') && def.sections[0]?.type !== 'cover')
    errors.push('Section "cover" harus berada di urutan pertama')

  return { ok: errors.length === 0, errors, warnings, definition: def, classes }
}
