// Redirect logged-in users away from auth/landing pages to /explore —
// EXCEPT when a `?sample=…` query param is present. That param is set by
// the "See a sample Passport" CTA on the Explore HomeScore/Passport
// cards: signed-in users should still be able to view the seller /
// landlord / buyer sample deck on the landing page.
export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return

  const token = localStorage.getItem('token')
  if (!token) return

  // Allow the sample-passport preview through for authenticated users.
  if (to.query.sample) return

  return navigateTo('/explore', { replace: true })
})
