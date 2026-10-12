// Silently keeps the access token alive while the app is open. Access
// tokens are short-lived (1h — see backend auth.module.ts), paired with a
// long-lived, revocable refresh token that lives in an httpOnly cookie
// (auth hardening, 12 Oct 2026, see backend src/auth/refresh-cookie.ts),
// invisible to this or any other JS — never read here, just carried
// automatically via credentials: 'include' inside useAuth's
// refreshAccessToken(). Without this plugin, a user mid-session would
// start getting 401s an hour in with no visible cause. It does two things:
//   1. On boot, if an access token exists locally (i.e. this browser has
//      logged in before), proactively swap it for a fresh one — covers the
//      case where the app was closed for a while and the stored access
//      token has already expired.
//   2. While the app stays open, refreshes again every 45 minutes
//      (comfortably inside the 1h access-token lifetime) so an active
//      session never hits the expiry cliff.
// Deliberately best-effort: if refresh fails (cookie missing/expired/
// revoked/reused), we clear the local access token and let the existing
// per-request 401 handling in each page/composable send the user back to
// sign-in as it already does — this plugin doesn't introduce new error-
// handling paths, just delays the need for them.
import { useAuth } from '~/composables/useAuth'

const REFRESH_INTERVAL_MS = 45 * 60 * 1000

export default defineNuxtPlugin(() => {
  let hasToken = false
  try {
    hasToken = !!localStorage.getItem('token')
  } catch {
    // Private mode / blocked site data — nothing to keep alive.
    return
  }
  if (!hasToken) return

  const { refreshAccessToken } = useAuth()

  const tryRefresh = async () => {
    try {
      await refreshAccessToken()
    } catch {
      // Refresh cookie is dead (missing/expired/revoked/reused) — clear
      // the local access token so the next authenticated request's
      // existing 401 handling takes over cleanly instead of retrying a
      // token we know is invalid.
      try {
        localStorage.removeItem('token')
      } catch {
        // ignore
      }
    }
  }

  tryRefresh()
  setInterval(tryRefresh, REFRESH_INTERVAL_MS)
})
