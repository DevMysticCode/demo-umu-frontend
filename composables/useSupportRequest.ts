export interface SupportRequestPayload {
  name: string
  email: string
  subject: string
  message: string
}

export interface SupportRequestResult {
  id: string
  ticketNumber: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  createdAt: string
}

export function useSupportRequest() {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.apiBase

  const isSubmitting = ref(false)

  const submitRequest = async (payload: SupportRequestPayload): Promise<SupportRequestResult> => {
    isSubmitting.value = true
    try {
      return await $fetch<SupportRequestResult>(`${BASE_URL}/support/request`, {
        method: 'POST',
        body: payload,
      })
    } finally {
      isSubmitting.value = false
    }
  }

  return { isSubmitting, submitRequest }
}
