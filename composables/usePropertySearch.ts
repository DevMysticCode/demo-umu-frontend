// Composable for UK Property Search — backed by our own API
import { ref, readonly } from 'vue'
import { toTitleCase } from '~/utils/form-helpres'

export interface Property {
  id: string
  udprn?: string | null
  uprn?: string | null
  hasPassport?: boolean
  passportPublished?: boolean
  passportCompletion?: number | null
  addressLine1: string
  addressLine2?: string | null
  city?: string | null
  county?: string | null
  postcode: string
  latitude?: number | null
  longitude?: number | null
  propertyType?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  sqft?: number | null
  floorAreaSqm?: number | null
  epcRating?: string | null
  epcScore?: number | null
  heatingType?: string | null
  co2Emissions?: number | null
  tenure?: string | null
  yearBuilt?: number | null
  estimatedPrice?: number | null
  lastSoldPrice?: number | null
  lastSoldDate?: string | null
  councilTaxBand?: string | null
  floodRisk?: string | null
  imageUrl?: string | null
  titleNumber?: string | null
  epcEnrichedAt?: string | null
  createdAt: string
}

export const usePropertySearch = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref('')
  const properties = ref<Property[]>([])
  const totalCount = ref(0)
  const hasMore = computed(() => properties.value.length < totalCount.value)

  const PAGE_SIZE = 10

  const formatPrice = (price?: number | null): string => {
    if (!price) return 'Price on request'
    return `£${price.toLocaleString('en-GB')}`
  }

  const enrichProperty = (p: Property) => ({
    ...p,
    priceDisplay: formatPrice(p.estimatedPrice),
    sqftDisplay: p.sqft ? `${p.sqft.toLocaleString()} sqft` : p.floorAreaSqm ? `${Math.round(p.floorAreaSqm * 10.764).toLocaleString()} sqft` : 'N/A',
    type: p.propertyType ?? 'Residential',
    area: p.city ? toTitleCase(p.city) : (p.county ? toTitleCase(p.county) : ''),
    address: toTitleCase(p.addressLine1),
    image: p.imageUrl || null,
    hasPassport: p.hasPassport ?? false,
    passportPublished: p.passportPublished ?? false,
    passportCompletion: p.passportCompletion ?? null,
  })

  const searchProperties = async (query: string) => {
    if (!query || query.trim().length < 2) {
      properties.value = []
      totalCount.value = 0
      return []
    }

    loading.value = true
    error.value = ''

    try {
      const res = await $fetch<{ items: Property[]; total: number }>(
        `${base}/property/search?q=${encodeURIComponent(query.trim())}&offset=0&limit=${PAGE_SIZE}`,
      )
      properties.value = res.items
      totalCount.value = res.total
      return res.items.map(enrichProperty)
    } catch (err) {
      error.value = 'Failed to search properties'
      console.error('Search error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const loadMore = async (query: string) => {
    if (!hasMore.value || loadingMore.value) return []

    loadingMore.value = true
    try {
      const offset = properties.value.length
      const res = await $fetch<{ items: Property[]; total: number }>(
        `${base}/property/search?q=${encodeURIComponent(query.trim())}&offset=${offset}&limit=${PAGE_SIZE}`,
      )
      properties.value = [...properties.value, ...res.items]
      totalCount.value = res.total
      return res.items.map(enrichProperty)
    } catch {
      return []
    } finally {
      loadingMore.value = false
    }
  }

  const getPropertyDetails = async (id: string) => {
    try {
      const result = await $fetch<Property>(`${base}/property/${id}`)
      return enrichProperty(result)
    } catch (err) {
      console.error('Property fetch error:', err)
      return null
    }
  }

  const validatePostcode = async (postcode: string) => {
    try {
      const res = await fetch(
        `https://api.postcodes.io/postcodes/${postcode.replace(/\s/g, '')}`,
      )
      if (!res.ok) throw new Error('Invalid postcode')
      const data = await res.json()
      return data.result
    } catch {
      return null
    }
  }

  return {
    loading: readonly(loading),
    loadingMore: readonly(loadingMore),
    error: readonly(error),
    properties: readonly(properties),
    totalCount: readonly(totalCount),
    hasMore,
    searchProperties,
    loadMore,
    getPropertyDetails,
    validatePostcode,
    formatPrice,
    enrichProperty,
  }
}


