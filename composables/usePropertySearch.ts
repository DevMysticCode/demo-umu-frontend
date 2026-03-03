// Composable for UK Property Search — backed by our own API
import { ref, readonly } from 'vue'

export interface Property {
  id: string
  udprn?: string | null
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
  epcRating?: string | null
  tenure?: string | null
  yearBuilt?: number | null
  estimatedPrice?: number | null
  imageUrl?: string | null
  titleNumber?: string | null
  createdAt: string
}

export const usePropertySearch = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const loading = ref(false)
  const error = ref('')
  const properties = ref<Property[]>([])

  const formatPrice = (price?: number | null): string => {
    if (!price) return 'Price on request'
    return `£${price.toLocaleString('en-GB')}`
  }

  // Map raw API property to a display-friendly shape (same fields + helpers)
  const enrichProperty = (p: Property) => ({
    ...p,
    priceDisplay: formatPrice(p.estimatedPrice),
    sqftDisplay: p.sqft ? `${p.sqft.toLocaleString()} sqft` : 'N/A',
    type: p.propertyType ?? 'Residential',
    area: [p.city, p.county].filter(Boolean).join(', '),
    address: p.addressLine1,
    image:
      p.imageUrl ||
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400',
    passport: null as number | null,
  })

  const searchProperties = async (query: string) => {
    if (!query || query.trim().length < 2) return []

    loading.value = true
    error.value = ''

    try {
      const results = await $fetch<Property[]>(
        `${base}/property/search?q=${encodeURIComponent(query.trim())}`,
      )
      properties.value = results
      return results.map(enrichProperty)
    } catch (err) {
      error.value = 'Failed to search properties'
      console.error('Search error:', err)
      return []
    } finally {
      loading.value = false
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

  // Validate postcode via postcodes.io (free, for UI hints)
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
    error: readonly(error),
    properties: readonly(properties),
    searchProperties,
    getPropertyDetails,
    validatePostcode,
    formatPrice,
    enrichProperty,
  }
}
