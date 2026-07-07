// Demand-capture composable — POSTs to /capture/event.
//
// The installer flow (grant check, match request, early access) fires
// events from an anonymous session too, so we send the JWT only when
// one's in localStorage. Backend has an OptionalJwtAuthGuard on this
// route and links the event to the user if the token verifies.

export type CaptureEventType = 'grant_check' | 'match_request' | 'early_access'

export interface CaptureEventPayload {
  type: CaptureEventType
  source: string
  propertyId?: string | null
  postcode?: string | null
  contact?: {
    name?: string
    contact?: string
    consentToContact?: boolean
  } | null
  data: Record<string, unknown>
}

export const useCaptureEvent = () => {
  const config = useRuntimeConfig()
  const base = (config.public as any).apiBase || 'http://localhost:3002'

  const send = async (payload: CaptureEventPayload) => {
    const headers: Record<string, string> = {}
    if (import.meta.client) {
      const token = localStorage.getItem('token')
      if (token) headers.Authorization = `Bearer ${token}`
    }
    try {
      return await $fetch(`${base}/capture/event`, {
        method: 'POST',
        body: payload,
        headers,
      })
    } catch (err) {
      // Non-blocking: capture failing must never break the UX.
      // The user's still filling a form; we log and swallow.
      if (import.meta.dev) console.warn('[capture] failed', err)
      return null
    }
  }

  return { send }
}
