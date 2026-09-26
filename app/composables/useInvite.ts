import type { InjectionKey, Ref } from 'vue'
import type { RenderContext } from '#shared/theme/context'

export interface InviteRuntime {
  ctx: Ref<RenderContext>
  slug: string | null
  /** Mode pratinjau (katalog/dashboard): RSVP tidak benar-benar terkirim. */
  preview: boolean
  /** page | frame | thumb — thumb = cuplikan katalog (tanpa animasi). */
  mode: 'page' | 'frame' | 'thumb'
  coverOpen: Ref<boolean>
  openCover: () => void
  wishesVersion: Ref<number>
}

export const INVITE_KEY: InjectionKey<InviteRuntime> = Symbol('invite')

export function useInvite(): InviteRuntime {
  const rt = inject(INVITE_KEY)
  if (!rt) throw new Error('useInvite() harus dipakai di dalam <InviteRenderer>')
  return rt
}
