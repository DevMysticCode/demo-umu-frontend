// Hand landlord passports straight to the dedicated landlord view before
// the seller-side /passportview/[id] page renders. The page used to do
// this in onMounted, which meant the seller layout flashed on screen for
// a beat before redirecting. Running it as route middleware happens
// during navigation, so nothing renders until we're on the right route.
export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return
  const id = to.params.id
  if (!id || to.path.startsWith('/passportview/landlord/')) return

  const token = localStorage.getItem('token')
  if (!token) return

  // Cheap cache: the passport type never changes, so remember it per id
  // and skip the probe on repeat visits.
  const cacheKey = `umu_passport_type_${id}`
  let type = ''
  try {
    type = sessionStorage.getItem(cacheKey) || ''
  } catch {
    /* private mode */
  }

  if (!type) {
    try {
      const cfg = useRuntimeConfig()
      const probe: any = await $fetch(
        `${cfg.public.apiBase}/passport/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      type = probe?.type || ''
      try {
        if (type) sessionStorage.setItem(cacheKey, type)
      } catch {
        /* ignore */
      }
    } catch {
      // Can't tell - let the page load and fall back to its own check.
      return
    }
  }

  if (type === 'LANDLORD') {
    return navigateTo(`/passportview/landlord/${id}`, { replace: true })
  }
})
