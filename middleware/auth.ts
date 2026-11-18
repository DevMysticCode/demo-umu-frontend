// Security review finding #7 (2026-11-15): the access token now lives only
// in memory (composables/useAuthToken.ts), so a fresh load/reload always
// starts with none — that no longer means signed-out. Before redirecting,
// try the httpOnly refresh cookie once; only a failed refresh (missing/
// expired/revoked cookie) is a real "no session".
export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  if (!getToken()) {
    try {
      const { refreshAccessToken } = useAuth()
      await refreshAccessToken()
    } catch {
      // No valid refresh cookie — genuinely signed out. Clear the
      // umu_has_session_mobile flag cookie too: it's what sent us to a
      // protected page in the first place (middleware/guest.ts redirects
      // to /dashboard whenever it's set, including from a stale pre-
      // migration localStorage token that session-flag-sync.client.ts
      // backfills it from). Leaving it set after a confirmed-failed
      // refresh means guest.ts keeps believing there's a session and
      // bounces the user straight back here from /onboarding/signin,
      // which bounces back here again on the next failed refresh — an
      // infinite dashboard<->signin redirect loop that hammers
      // /auth/refresh/mobile until the backend rate-limits it (429).
      clearSessionFlag()
    }
  }

  if (!getToken()) {
    if (to.fullPath !== '/onboarding/signin') {
      localStorage.setItem('redirectAfterLogin', to.fullPath)
    }
    return navigateTo('/onboarding/signin?reason=session', { replace: true })
  }
})
