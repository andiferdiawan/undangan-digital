import { createSign } from 'node:crypto'
import { type GoogleServiceAccount, SearchApiError } from './seo-config'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters'
const cache = new Map<string, { token: string, exp: number }>()
const b64url = (s: string) => Buffer.from(s).toString('base64url')

/**
 * Access token OAuth untuk service account Google (alur JWT bearer, RS256) tanpa library tambahan.
 * Token disimpan di memori sampai 1 menit sebelum kedaluwarsa.
 */
export async function googleAccessToken(sa: GoogleServiceAccount, scope = GSC_SCOPE): Promise<string> {
  const key = `${sa.client_email}|${scope}`
  const hit = cache.get(key)
  if (hit && hit.exp - 60_000 > Date.now()) return hit.token

  const iat = Math.floor(Date.now() / 1000)
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify({ iss: sa.client_email, scope, aud: TOKEN_URL, iat, exp: iat + 3600 }))}`
  let signature: string
  try {
    signature = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url')
  }
  catch {
    throw new SearchApiError(400, 'Private key service account tidak bisa dipakai. Unggah ulang file JSON dari Google Cloud.')
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
    signal: AbortSignal.timeout(10_000),
  })
  const data = await res.json().catch(() => ({})) as { access_token?: string, expires_in?: number, error?: string, error_description?: string }
  if (!res.ok || !data.access_token)
    throw new SearchApiError(res.status === 200 ? 502 : res.status, `Google menolak service account: ${data.error_description || data.error || `status ${res.status}`}`)
  cache.set(key, { token: data.access_token, exp: Date.now() + (data.expires_in ?? 3600) * 1000 })
  return data.access_token
}
