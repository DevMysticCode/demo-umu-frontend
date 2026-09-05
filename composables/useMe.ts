import { computed } from 'vue'

/**
 * Cheap "who am I" - decodes the JWT stored in localStorage and returns
 * the user id. Never hits the network. Safe to call from any component
 * that needs to compare `senderId`, filter participants, etc.
 *
 * JWT payload shape (see backend auth.service): { sub, email, iat, exp }.
 * We only need `sub` = userId. If the token is missing, malformed, or
 * expired we return `null` - callers should treat that as "not logged
 * in" and route to sign-in as they normally would.
 */

// One-time cache — decoding is cheap but the token is stable across a
// session, so no reason to re-parse on every render.
let cachedToken: string | null = null
let cachedId: string | null = null

function readMyId(): string | null {
  if (typeof window === 'undefined') return null
  const token = localStorage.getItem('token')
  if (!token) {
    cachedToken = null
    cachedId = null
    return null
  }
  if (token === cachedToken) return cachedId
  cachedToken = token
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return (cachedId = null)
    // base64url → base64 for atob (it doesn't accept url-safe by default).
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '==='.slice((b64.length + 3) % 4)
    const payload = JSON.parse(atob(padded))
    cachedId = payload?.sub ?? null
    return cachedId
  } catch {
    return (cachedId = null)
  }
}

export function useMe() {
  return {
    /** Current user id, or null if unauthenticated. */
    myId: computed<string | null>(() => readMyId()),
  }
}
