// Redirect logged-in users away from auth/landing pages to explore
export default defineNuxtRouteMiddleware(() => {
  if (process.server) return

  const token = localStorage.getItem('token')
  if (token) {
    return navigateTo('/explore', { replace: true })
  }
})
