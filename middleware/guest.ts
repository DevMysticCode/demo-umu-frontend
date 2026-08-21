// Redirect logged-in users away from auth/landing pages to /dashboard —
// EXCEPT when a `?sample=…` query param is present. That param is set by
// the "See a sample Passport" CTA on the HomeScore/Passport cards:
// signed-in users should still be able to view the seller / landlord /
// buyer sample deck on the landing page.
//
// Explore was the original target here and is now retired from the live
// app (kept as dead code for reference) — /dashboard replaces it.
//
// Uses `external: true` (full page navigation) rather than a client-
// side SPA hop. Rationale: `/` is SSR-rendered with only `/`'s scoped
// CSS inlined. If we do an in-app `navigateTo`, Vue Router swaps in the
// destination component before its own scoped CSS chunk finishes
// loading. The first paint has no layout — hero collapses, buttons
// drift to the middle of the viewport. Users saw this on the login ->
// `/` -> `/explore` path (same class of page: heavily scoped-CSS,
// flex-layout hero). A refresh or later navigation was fine because the
// CSS was cached / applied by then. `external: true` forces the browser
// to make a fresh request, and Vercel SSRs it with the full inlined
// stylesheet — no race, no unstyled first paint. The full-reload cost is
// only paid once per session on the auth-continuation path (already-
// signed-in users landing on `/` or a signup route), which is rare.
export default defineNuxtRouteMiddleware((to) => {
  if (typeof window === 'undefined') return

  const token = localStorage.getItem('token')
  if (!token) return

  // Allow the sample-passport preview through for authenticated users.
  if (to.query.sample) return

  return navigateTo('/dashboard', { replace: true, external: true })
})
