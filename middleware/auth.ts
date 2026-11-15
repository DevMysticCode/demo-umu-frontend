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
      // No valid refresh cookie — genuinely signed out.
    }
  }

  if (!getToken()) {
    if (to.fullPath !== '/onboarding/signin') {
      localStorage.setItem('redirectAfterLogin', to.fullPath)
    }
    return navigateTo('/onboarding/signin?reason=session', { replace: true })
  }
})
