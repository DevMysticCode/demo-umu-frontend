export default defineNuxtRouteMiddleware((to) => {
  if (process.server) return

  const token = localStorage.getItem('token')

  if (!token) {
    if (to.fullPath !== '/onboarding/signin') {
      localStorage.setItem('redirectAfterLogin', to.fullPath)
    }
    return navigateTo('/onboarding/signin?reason=session')
  }
})
