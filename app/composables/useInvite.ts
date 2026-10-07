import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { RenderContext } from '#shared/theme/context'
import type { EventKind } from '#shared/theme/constants'

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
  /** Jenis acara tema (untuk contoh ucapan di pratinjau) */
  kind: EventKind
  /** Musik latar untuk kartu pemutar (music_player); enabled=false bila musik nonaktif/thumbnail */
  music: {
    enabled: ComputedRef<boolean>
    playing: ComputedRef<boolean>
    progress: ComputedRef<number>
    time: ComputedRef<number>
    duration: ComputedRef<number>
    title: ComputedRef<string>
    toggle: () => void
  }
}

export const INVITE_KEY: InjectionKey<InviteRuntime> = Symbol('invite')

export function useInvite(): InviteRuntime {
  const rt = inject(INVITE_KEY)
  if (!rt) throw new Error('useInvite() harus dipakai di dalam <InviteRenderer>')
  return rt
}
