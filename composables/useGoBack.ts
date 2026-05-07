// Universal "back button" helper.
//
// The naive pattern `if (window.history.length > 1) window.history.back()`
// is unreliable: on a hard refresh / deep-link / push-notification entry the
// page itself counts as 1 entry, so history.length is ≥ 1 even though there
// is nowhere to actually go back to. Calling back() in that state either
// reloads the page or sends the user out of the app.
//
// Vue Router 4 keeps the previous SPA URL in
// `router.options.history.state.back`. If that's null we know the user
// landed directly and we should fall back to a meaningful default route.
//
// Usage:
//   const goBack = useGoBack('/profile')
//   <button @click="goBack()">Back</button>

export function useGoBack(fallbackPath: string = '/profile') {
  const router = useRouter()

  return () => {
    const hasInAppPrev =
      typeof window !== 'undefined' &&
      typeof (router.options.history as any)?.state?.back === 'string'

    if (hasInAppPrev) {
      router.back()
    } else {
      router.replace(fallbackPath)
    }
  }
}