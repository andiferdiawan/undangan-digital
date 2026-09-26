import { defineComponent, h, type PropType, type VNode } from 'vue'
import type { ThemeNode } from '#shared/theme/schema'
import { interpolate, lookup, safeUrl, type RenderContext } from '#shared/theme/context'
import { useInvite } from '~/composables/useInvite'
import InviteCountdown from './InviteCountdown.vue'
import InviteRsvpForm from './InviteRsvpForm.vue'
import InviteWishes from './InviteWishes.vue'
import InviteCopyButton from './InviteCopyButton.vue'
import InviteCalendarButton from './InviteCalendarButton.vue'
import InviteSlider from './InviteSlider.vue'

type Scope = { item?: Record<string, string>, index?: number }

const LISTS = new Set(['events', 'gallery', 'story', 'gifts'])

function passes(cond: string | undefined, ctx: RenderContext, scope: Scope): boolean {
  if (!cond) return true
  const negate = cond.startsWith('!')
  const key = negate ? cond.slice(1) : cond
  const truthy = LISTS.has(key)
    ? (ctx.lists as Record<string, unknown[]>)[key]!.length > 0
    : lookup(key, ctx, scope).trim() !== ''
  return negate ? !truthy : truthy
}

/**
 * Merender satu node tema secara aman:
 * - teks selalu sebagai text node (tidak pernah v-html)
 * - href/src/bg hanya dari placeholder yang lolos safeUrl()
 * - tag & atribut sudah dibatasi oleh validator sebelum tema disimpan
 */
export default defineComponent({
  name: 'InviteNode',
  props: {
    node: { type: Object as PropType<ThemeNode>, required: true },
    scope: { type: Object as PropType<Scope>, default: () => ({}) },
    /**
     * Level heading yang diizinkan agar halaman hanya punya satu <h1>:
     * h1 = boleh h1 (sampul/section pertama), h2 = h1 diturunkan jadi h2,
     * none = semua heading jadi div (pratinjau katalog/editor, bukan konten halaman).
     */
    headings: { type: String as PropType<'h1' | 'h2' | 'none'>, default: 'h1' },
  },
  setup(props) {
    const rt = useInvite()

    const renderOne = (node: ThemeNode, scope: Scope): VNode | null => {
      const ctx = rt.ctx.value
      if (!passes(node.if, ctx, scope)) return null

      const str = (s?: string) => (s ? interpolate(s, ctx, scope) : '')
      const cls = node.class || undefined

      if (node.component) {
        const p = Object.fromEntries(Object.entries(node.props ?? {}).map(([k, v]) => [k, str(v)]))
        switch (node.component) {
          case 'countdown':
            return h(InviteCountdown, { class: cls, ...p })
          case 'rsvp_form':
            return h(InviteRsvpForm, { class: cls, ...p })
          case 'wishes':
            return h(InviteWishes, { class: cls, ...p })
          case 'copy_button':
            return h(InviteCopyButton, { class: cls, ...p })
          case 'calendar_button':
            return h(InviteCalendarButton, { class: cls, ...p })
          case 'map_button': {
            const href = safeUrl(p.href)
            if (!href) return null
            return h('a', { class: [cls, p.button_class], href, target: '_blank', rel: 'noopener' }, p.label || 'Lihat Lokasi')
          }
          case 'open_button':
            return h('button', { type: 'button', class: cls, onClick: rt.openCover }, p.label || 'Buka Undangan')
          case 'photo_slider':
            return h(InviteSlider, { class: cls, ...p })
          case 'guest_name':
            return h('span', { class: cls }, ctx.values.guest_name || p.fallback || 'Tamu Undangan')
        }
      }

      const attrs: Record<string, unknown> = { class: cls }
      for (const [name, raw] of Object.entries(node.attrs ?? {})) {
        const v = str(raw)
        if (name === 'href' || name === 'src') {
          const url = safeUrl(v)
          if (!url) {
            if (name === 'src') return null // gambar tanpa sumber tidak dirender
            continue
          }
          attrs[name] = url
          if (name === 'href') {
            attrs.target = '_blank'
            attrs.rel = 'noopener'
          }
        }
        else {
          attrs[name] = v
        }
      }
      if (node.tag === 'img' && !attrs.loading) attrs.loading = 'lazy'
      if (node.bg) {
        const url = safeUrl(str(node.bg))
        if (url) attrs.style = { backgroundImage: `url("${encodeURI(url).replace(/"/g, '%22')}")` }
      }

      const children: (VNode | string)[] = []
      if (node.text) children.push(str(node.text))
      for (const child of node.children ?? []) children.push(...renderNode(child, scope))

      let tag: string = node.tag ?? 'div'
      if (/^h[1-6]$/.test(tag)) {
        if (props.headings === 'none') tag = 'div'
        else if (props.headings === 'h2' && tag === 'h1') tag = 'h2'
      }
      if (tag === 'img' || tag === 'hr' || tag === 'br') return h(tag, attrs)
      return h(tag, attrs, children)
    }

    const renderNode = (node: ThemeNode, scope: Scope): VNode[] => {
      if (node.repeat && !scope.item) {
        const list = rt.ctx.value.lists[node.repeat]
        return list
          .map((item, index) => renderOne(node, { item, index }))
          .filter((v): v is VNode => !!v)
      }
      const v = renderOne(node, scope)
      return v ? [v] : []
    }

    return () => {
      const out = renderNode(props.node, props.scope)
      if (out.length === 0) return null
      return out.length === 1 ? out[0] : h('div', { style: 'display:contents' }, out)
    }
  },
})
