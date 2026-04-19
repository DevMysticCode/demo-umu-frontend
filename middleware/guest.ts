// Redirect logged-in users away from auth/landing pages to the dashboard
export default defineNuxtRouteMiddleware(() => {
  if (process.server) return

  const token = localStorage.getItem('token')
  if (token) {
    return navigateTo('/dashboard', { replace: true })
  }
})
