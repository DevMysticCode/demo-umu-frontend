export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) return

  const token = localStorage.getItem('token')

  if (!token) {
    // Store the intended destination for redirect after login
    if (to.fullPath !== '/onboarding/signin') {
      localStorage.setItem('redirectAfterLogin', to.fullPath)
    }
    return navigateTo('/onboarding/signin')
  }
})
