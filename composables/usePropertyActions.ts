function getAuthHeaders() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export interface PropertyListItem {
  id: string
  addressLine1: string
  addressLine2?: string | null
  city?: string | null
  county?: string | null
  postcode: string
  estimatedPrice?: number | null
  propertyType?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  imageUrl?: string | null
  wishlistedAt?: string
  savedAt?: string
}

export function usePropertyActions(propertyId?: string) {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.apiBase
  const wishlisted = ref(false)
  const saved = ref(false)
  const actionLoading = ref(false)

  // Fetch current status for a single property (called on property detail page)
  async function fetchActions(id: string) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return
    try {
      const data = await $fetch<{ wishlisted: boolean; saved: boolean }>(
        `${BASE_URL}/property/${id}/actions`,
        { headers: getAuthHeaders() },
      )
      wishlisted.value = data.wishlisted
      saved.value = data.saved
    } catch {}
  }

  async function toggleWishlist(
    id: string,
  ): Promise<{ wishlisted: boolean } | 'unauthenticated' | 'error'> {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return 'unauthenticated'
    actionLoading.value = true
    try {
      const data = await $fetch<{ wishlisted: boolean }>(
        `${BASE_URL}/property/${id}/wishlist`,
        { method: 'POST', headers: getAuthHeaders() },
      )
      wishlisted.value = data.wishlisted
      return data
    } catch (e) {
      console.error('toggleWishlist error', e)
      return 'error'
    } finally {
      actionLoading.value = false
    }
  }

  async function toggleSave(
    id: string,
  ): Promise<{ saved: boolean } | 'unauthenticated' | 'error'> {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return 'unauthenticated'
    actionLoading.value = true
    try {
      const data = await $fetch<{ saved: boolean }>(
        `${BASE_URL}/property/${id}/save`,
        { method: 'POST', headers: getAuthHeaders() },
      )
      saved.value = data.saved
      return data
    } catch (e) {
      console.error('toggleSave error', e)
      return 'error'
    } finally {
      actionLoading.value = false
    }
  }

  // List fetchers (used by snapshot / saved-properties pages)
  async function fetchWishlist(): Promise<PropertyListItem[]> {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return []
    return $fetch<PropertyListItem[]>(`${BASE_URL}/property/wishlist`, {
      headers: getAuthHeaders(),
    })
  }

  async function fetchSavedProperties(): Promise<PropertyListItem[]> {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return []
    return $fetch<PropertyListItem[]>(`${BASE_URL}/property/saved`, {
      headers: getAuthHeaders(),
    })
  }

  // Auto-fetch on mount if a propertyId was provided
  if (propertyId) {
    onMounted(() => fetchActions(propertyId))
  }

  return {
    wishlisted,
    saved,
    actionLoading,
    fetchActions,
    toggleWishlist,
    toggleSave,
    fetchWishlist,
    fetchSavedProperties,
  }
}
