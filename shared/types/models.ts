import type { ThemeDefinition } from '../theme/schema'

export interface Category { id: number, slug: string, name: string, sort: number }
export interface Package { id: number, code: string, name: string, guest_limit: number, price: number, is_active: boolean, sort: number }

export interface ThemeRow {
  id: string
  code: string
  slug: string
  name: string
  description: string | null
  category_id: number | null
  thumbnail_url: string | null
  definition: ThemeDefinition
  compiled_css: string
  status: 'draft' | 'published' | 'archived'
  source: 'manual' | 'ai'
  created_at: string
  updated_at: string
}

export interface InvitationRow {
  id: string
  owner_id: string
  theme_id: string
  token_id: string | null
  slug: string
  guest_limit: number
  content: unknown
  style: Record<string, string>
  assets: Record<string, string>
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface GuestRow {
  id: string
  invitation_id: string
  name: string
  phone: string | null
  group_name: string | null
  opened_at: string | null
  created_at: string
}

export interface RsvpRow {
  id: string
  invitation_id: string
  guest_id: string | null
  name: string
  attendance: 'hadir' | 'tidak_hadir' | 'ragu'
  pax: number
  message: string | null
  is_visible: boolean
  created_at: string
}

export interface TokenRow {
  id: string
  code: string
  theme_id: string
  package_id: number
  guest_limit: number
  price: number
  customer_note: string | null
  created_at: string
  expires_at: string | null
  redeemed_by: string | null
  redeemed_at: string | null
}

export interface PublicInvitation {
  id: string
  slug: string
  content: unknown
  style: Record<string, string>
  assets: Record<string, string>
  theme: { code: string, slug: string, name: string, definition: ThemeDefinition, compiled_css: string }
}
