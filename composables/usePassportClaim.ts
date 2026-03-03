// Composable for property passport claim & status check
export const usePassportClaim = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const token = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers = () => ({
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  })

  interface PassportStatus {
    hasPassport: boolean
    passportId: string | null
    passportStatus?: string
    isOwner: boolean
    isCollaborator: boolean
    canAccess?: boolean
  }

  const getPassportStatus = async (
    propertyId: string,
  ): Promise<PassportStatus> => {
    try {
      return await $fetch<PassportStatus>(
        `${base}/property/${propertyId}/passport-status`,
        { headers: headers() },
      )
    } catch {
      return {
        hasPassport: false,
        passportId: null,
        isOwner: false,
        isCollaborator: false,
      }
    }
  }

  const claimPassport = async (
    propertyId: string,
    addressLine1: string,
    postcode: string,
  ): Promise<{ passportId: string }> => {
    return $fetch<{ passportId: string }>(`${base}/passport/create`, {
      method: 'POST',
      headers: headers(),
      body: { propertyId, addressLine1, postcode },
    })
  }

  return { getPassportStatus, claimPassport }
}
