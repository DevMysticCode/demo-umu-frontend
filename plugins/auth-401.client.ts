// Global, best-effort 401 handler (security review 2026-10-19). Every
// composable builds its own Authorization header and calls the global
// $fetch directly — there was no single place that reacted to an expired/
// invalid token, just a handful of ad-hoc per-page checks. This doesn't
// change request behaviour or introduce a new auth model: it only adds a
// response interceptor to the one shared $fetch instance every composable
// already uses, so any 401 from the backend (not just the ones a specific
// page happened to check for) clears the stale token and sends the user
// back to sign-in instead of leaving a half-broken page on screen.
//
// Deliberately narrow: only acts on 401 (unauthenticated — the token
// itself is bad), never on 403 (authenticated but not permitted), which
// a page may legitimately want to handle differently (e.g. "you don't
// have access to this property" vs "please sign in again"). Skips the
// auth endpoints themselves so a failed login/OTP attempt doesn't bounce
// the user through a redirect loop.
const SKIP_PATHS = ['/auth/login', '/auth/request-otp', '/auth/verify-otp', '/auth/register', '/auth/refresh']

export default defineNuxtPlugin((nuxtApp) => {
  const original = globalThis.$fetch
  if (!original || typeof (original as any).create !== 'function') return

  globalThis.$fetch = original.create({
    onResponseError({ request, response }) {
      if (response?.status !== 401) return
      const url = typeof request === 'string' ? request : (request as Request)?.url ?? ''
      if (SKIP_PATHS.some((p) => url.includes(p))) return

      try {
        if (!localStorage.getItem('token')) return // already signed out
        localStorage.removeItem('token')
      } catch {
        return
      }

      // onResponseError fires after the fetch's promise resolves - i.e.
      // after an await - and Nuxt's composable context doesn't survive
      // an async tick on the client unless explicitly re-entered. Without
      // runWithContext, useRoute()/navigateTo() below throw "Nuxt
      // instance unavailable", that throw is swallowed by ofetch's
      // interceptor handling, and the redirect silently never happens -
      // leaving a blank, logged-out-but-still-on-the-page dashboard.
      nuxtApp.runWithContext(() => {
        const route = useRoute()
        if (route.path.startsWith('/onboarding/signin')) return
        navigateTo('/onboarding/signin?reason=session', { replace: true })
      })
    },
  })
})
