import { ref, computed } from 'vue'
import type { PropertySearchFilters } from '~/components/property/PropertySearchFiltersModal.vue'

// "For You" feed fetch + filter state, lifted out of explore.vue so pages
// beyond Explore (starting with the seller Dashboard) can show the same
// feed without re-deriving this logic. explore.vue keeps its own inline
// copy untouched — this is additive, not a refactor of that page.
export function usePropertyForYou() {
  const config = useRuntimeConfig()

  const properties = ref<any[]>([])
  const loadingProperties = ref(true)
  const needsPostcode = ref(false)
  const displayProperties = computed(() => properties.value.slice(0, 6))

  const activeRadius = ref<number | null>(null)
  const committedPtype = ref<string[]>(['any'])
  const committedBeds = ref<number | null>(null)
  const committedBedsMax = ref<number | null>(null)
  const committedEpc = ref<string | null>(null)
  const committedMinPrice = ref<number | null>(null)
  const committedMaxPrice = ref<number | null>(null)
  const committedPassportStatus = ref<string[]>([])
  // Kept for buildForYouUrl parity with explore.vue — no UI control sets
  // these anymore, so they stay at their defaults.
  const committedHs = ref<number>(0)
  const committedPassport = ref<boolean>(false)

  const forYouFiltersModalOpen = ref(false)
  const forYouPendingFilters = computed<PropertySearchFilters>(() => ({
    radius: activeRadius.value,
    propertyType: committedPtype.value,
    minBedrooms: committedBeds.value,
    maxBedrooms: committedBedsMax.value,
    minEpc: committedEpc.value,
    minPrice: committedMinPrice.value,
    maxPrice: committedMaxPrice.value,
    passportStatus: committedPassportStatus.value,
  }))

  const hasAnyForYouFilters = computed(
    () =>
      !(committedPtype.value.length === 1 && committedPtype.value[0] === 'any') ||
      committedBeds.value != null ||
      committedBedsMax.value != null ||
      committedEpc.value != null ||
      committedMinPrice.value != null ||
      committedMaxPrice.value != null ||
      committedPassportStatus.value.length > 0,
  )

  function openForYouFilters() {
    forYouFiltersModalOpen.value = true
  }

  function buildForYouUrl(): string {
    const params = new URLSearchParams()
    if (
      committedPtype.value.length &&
      !(committedPtype.value.length === 1 && committedPtype.value[0] === 'any')
    ) {
      params.set('propertyType', committedPtype.value.join(','))
    }
    if (committedBeds.value != null) {
      params.set('minBedrooms', String(committedBeds.value))
    }
    if (committedBedsMax.value != null) {
      params.set('maxBedrooms', String(committedBedsMax.value))
    }
    if (committedEpc.value != null) {
      params.set('minEpc', committedEpc.value)
    }
    if (committedHs.value > 0) {
      params.set('minHomeScore', String(committedHs.value))
    }
    if (committedMinPrice.value != null) {
      params.set('minPrice', String(committedMinPrice.value))
    }
    if (committedMaxPrice.value != null) {
      params.set('maxPrice', String(committedMaxPrice.value))
    }
    if (committedPassport.value) {
      params.set('passportOnly', '1')
    }
    if (committedPassportStatus.value.length) {
      params.set('passportStatus', committedPassportStatus.value.join(','))
    }
    const qs = params.toString()
    return `${config.public.apiBase}/property/for-you${qs ? `?${qs}` : ''}`
  }

  async function refreshForYou() {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return
    try {
      const res = await $fetch<{ items: any[]; needsPostcode?: boolean }>(
        buildForYouUrl(),
        { headers: { Authorization: `Bearer ${token}` } },
      )
      properties.value = res?.items ?? []
      needsPostcode.value = res?.needsPostcode === true
    } catch {
      /* keep whatever was already showing rather than blank the feed */
    }
  }

  function onForYouFiltersSearch(filters: PropertySearchFilters) {
    activeRadius.value = filters.radius
    committedPtype.value = filters.propertyType
    committedBeds.value = filters.minBedrooms
    committedBedsMax.value = filters.maxBedrooms
    committedEpc.value = filters.minEpc
    committedMinPrice.value = filters.minPrice
    committedMaxPrice.value = filters.maxPrice
    committedPassportStatus.value = filters.passportStatus
    refreshForYou()
  }

  return {
    properties,
    loadingProperties,
    needsPostcode,
    displayProperties,
    forYouFiltersModalOpen,
    forYouPendingFilters,
    hasAnyForYouFilters,
    openForYouFilters,
    onForYouFiltersSearch,
    refreshForYou,
  }
}
