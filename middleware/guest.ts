// Redirect logged-in users away from auth/landing pages to /explore —
// EXCEPT when a `?sample=…` query param is present. That param is set by
// the "See a sample Passport" CTA on the Explore HomeScore/Passport
// cards: signed-in users should still be able to view the seller /
// landlord / buyer sample deck on the landing page.
//
// Uses `external: true` (full page navigation) rather than a client-
// side SPA hop. Rationale: `/` is SSR-rendered with only `/`'s scoped
// CSS inlined. If we do an in-app `navigateTo`, Vue Router swaps in
// the Explore component before its scoped CSS chunk (data-v-4b8605f3
// covering `.explore-root { display:flex; flex-direction:column }`,
// `.hero-row1 { display:flex ... }`, etc.) finishes loading. The
// first paint has no layout — hero collapses, search bar buttons
// drift to the middle of the viewport. Users saw this on the login
// -> `/` -> `/explore` path. A refresh or later navigation was fine
// because the CSS was cached / applied by then. `external: true`
// forces the browser to make a fresh request to `/explore`, and
// Vercel SSRs it with the full inlined stylesheet — no race, no
// unstyled first paint. The full-reload cost is only paid once per
// session on the auth-continuation path (already-signed-in users
// landing on `/` or a signup route), which is rare.
export default defineNuxtRouteMiddleware((to) => {
  if (typeof window === 'undefined') return

  const token = localStorage.getItem('token')
  if (!token) return

  // Allow the sample-passport preview through for authenticated users.
  if (to.query.sample) return

  return navigateTo('/explore', { replace: true, external: true })
})
