// Redirect logged-in users away from auth/landing pages to /dashboard —
// EXCEPT when a `?sample=…` query param is present. That param is set by
// the "See a sample Passport" CTA on the HomeScore/Passport cards:
// signed-in users should still be able to view the seller / landlord /
// buyer sample deck on the landing page.
//
// Explore was the original target here and is now retired from the live
// app (kept as dead code for reference) — /dashboard replaces it.
//
// TWO checks, in order:
//
// 1. `umu_has_session` — a small, non-secret flag cookie (see
//    composables/useSessionFlag.ts), set alongside the real JWT at every
//    login/signup and cleared at logout. Unlike localStorage, a cookie
//    rides along with the initial request, so useCookie() can read it
//    during SSR — meaning an already-logged-in visitor gets a real HTTP
//    redirect before any landing-page HTML is ever sent, no flash. This
//    is the fix for the "landing page flashes before jumping to
//    dashboard" complaint. The cookie grants no privilege on its own —
//    worst case if it's stale/forged is guessing the wrong page to render
//    first; every real page/API call still gates on the actual JWT
//    exactly as before.
//
// 2. The original client-only localStorage check, kept as a fallback for
//    the one real gap the cookie can't cover: a user who was already
//    logged in from BEFORE this cookie existed (their token predates it,
//    so nothing ever set the cookie for them) won't have it yet on their
//    first visit post-deploy. Client-side, `external: true` (full page
//    navigation) is deliberate here rather than an in-app SPA hop.
//    Rationale: `/` is SSR-rendered with only `/`'s scoped CSS inlined.
//    If we do an in-app `navigateTo`, Vue Router swaps in the
//    destination component before its own scoped CSS chunk finishes
//    loading — hero collapses, buttons drift to the middle of the
//    viewport. A refresh or later navigation is fine because the CSS is
//    cached by then. `external: true` forces a fresh request, so Vercel
//    SSRs it with the full inlined stylesheet — no race, no unstyled
//    first paint. This fallback path is now rare (only pre-cookie
//    sessions still hit it, and plugins/session-flag-sync.client.ts
//    backfills the cookie on their very next app load either way).
export default defineNuxtRouteMiddleware((to) => {
  if (to.query.sample) return

  const sessionFlag = useCookie('umu_has_session')
  if (sessionFlag.value) {
    return navigateTo('/dashboard', { replace: true })
  }

  if (typeof window === 'undefined') return

  const token = localStorage.getItem('token')
  if (!token) return

  return navigateTo('/dashboard', { replace: true, external: true })
})
