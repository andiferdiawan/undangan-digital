import type { ThemeNode } from '../../shared/theme/schema'

type Opt = Omit<ThemeNode, 'tag' | 'class' | 'text' | 'children'>

/** Helper kecil untuk menulis node tema dengan ringkas. */
export function el(tag: ThemeNode['tag'], cls: string, content?: string | ThemeNode[], opt: Opt = {}): ThemeNode {
  const node: ThemeNode = { tag, class: cls, ...opt }
  if (typeof content === 'string') node.text = content
  else if (content) node.children = content
  return node
}

export const div = (cls: string, content?: string | ThemeNode[], opt?: Opt) => el('div', cls, content, opt)
export const p = (cls: string, content?: string | ThemeNode[], opt?: Opt) => el('p', cls, content, opt)
export const img = (cls: string, src: string, alt = '', opt: Opt = {}) =>
  el('img', cls, undefined, { attrs: { src, alt }, ...opt })
export const comp = (component: NonNullable<ThemeNode['component']>, cls: string, props: Record<string, string> = {}, opt: Opt = {}): ThemeNode =>
  ({ component, class: cls, props, ...opt })
