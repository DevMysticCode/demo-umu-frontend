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
  // and skip the probe on repeat visits. Status isn't cached - a
  // PENDING_PAYMENT passport can finish payment at any time, and caching
  // "pending" would keep bouncing someone who already paid.
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
      // A passport still in PENDING_PAYMENT has no type and no seeded
      // sections yet (payment happens before seller/landlord is chosen -
      // see Passport.type's schema comment) - send them to finish the
      // claim instead of a sectionless passportview page with nothing on
      // it and no explanation. Root cause of a real user report, 2 Oct
      // 2026: the dashboard's "go to my passport" button could land here
      // for exactly this reason when this was someone's only passport.
      if (probe?.status === 'PENDING_PAYMENT') {
        return navigateTo(probe?.propertyId ? `/claim/${probe.propertyId}` : '/dashboard', { replace: true })
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
