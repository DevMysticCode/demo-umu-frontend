// HMLR Local Land Charges composable.
//
// Reads/refreshes the cached LLC search for a property. Backend
// handles the 30-day TTL and the "not migrated / multi-geometry"
// error taxonomy — this composable is just a thin fetch wrapper
// that surfaces the loading + error state the card needs.

export type LlcStatus =
  | 'OK_WITH_CHARGES'
  | 'OK_EMPTY'
  | 'NOT_MIGRATED'
  | 'MULTI_GEOMETRY'
  | 'ERROR'

export interface LlcCharge {
  id: string
  boundary: boolean
  category: string
  subCategory: string | null
  law: string | null
  legalDocument: string | null
  description: string | null
  location: string | null
  reference: string
  authorityReference: string | null
  creationDate: string | null
  registrationDate: string | null
}

export interface LlcSearch {
  id: string
  propertyId: string
  status: LlcStatus
  errorCode: string | null
  errorMessage: string | null
  searchAddress: string | null
  extentAreaSqm: number | null
  warnings: string[]
  searchedAt: string
  charges: LlcCharge[]
}

export const useLlc = () => {
  const config = useRuntimeConfig()
  const base = (config.public as any).apiBase || 'http://localhost:3002'

  const headers = () => {
    const h: Record<string, string> = {}
    if (import.meta.client) {
      const token = localStorage.getItem('token')
      if (token) h.Authorization = `Bearer ${token}`
    }
    return h
  }

  const fetchLlc = async (propertyId: string): Promise<LlcSearch | null> => {
    try {
      return await $fetch<LlcSearch>(
        `${base}/property/${propertyId}/llc`,
        { headers: headers() },
      )
    } catch (err: any) {
      if (import.meta.dev) console.warn('[llc] fetch failed', err)
      // 401 (not signed in) is the only expected failure at the
      // composable layer — surface null and let the card render a
      // "sign in to see LLC data" state.
      return null
    }
  }

  const refreshLlc = async (propertyId: string): Promise<LlcSearch | null> => {
    try {
      return await $fetch<LlcSearch>(
        `${base}/property/${propertyId}/llc/refresh`,
        { method: 'POST', headers: headers() },
      )
    } catch (err: any) {
      if (import.meta.dev) console.warn('[llc] refresh failed', err)
      return null
    }
  }

  return { fetchLlc, refreshLlc }
}
