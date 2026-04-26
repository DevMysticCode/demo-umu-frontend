// Composable for the user's own Buyer Profile (the BUYER's verified profile
// they share with sellers, agents, solicitors). Not to be confused with
// /buyer-passport/[id] which is a buyer's PURCHASED access to a seller's passport.

export interface BuyerProfile {
  id: string
  userId: string
  idDocumentType: string | null
  idDocumentUrl: string | null
  idVerified: boolean
  fundsType: string | null
  fundsAmount: number | null
  fundsDocumentUrl: string | null
  fundsVerified: boolean
  chainPosition: string | null
  solicitorStatus: string | null
  timeline: string | null
  statement: string | null
  completedSteps: number
  published: boolean
  createdAt: string
  updatedAt: string
}

export type BuyerProfileUpdate = Partial<
  Pick<
    BuyerProfile,
    | 'idDocumentType'
    | 'idDocumentUrl'
    | 'fundsType'
    | 'fundsAmount'
    | 'fundsDocumentUrl'
    | 'chainPosition'
    | 'solicitorStatus'
    | 'timeline'
    | 'statement'
    | 'completedSteps'
  >
>

export const useBuyerProfile = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const token = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers = () => ({
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  })

  const getBuyerProfile = async (): Promise<BuyerProfile | null> => {
    try {
      return await $fetch<BuyerProfile | null>(`${base}/buyer-profile`, {
        headers: headers(),
      })
    } catch {
      return null
    }
  }

  const updateBuyerProfile = async (
    partial: BuyerProfileUpdate,
  ): Promise<BuyerProfile> => {
    return $fetch<BuyerProfile>(`${base}/buyer-profile`, {
      method: 'PATCH',
      headers: headers(),
      body: partial,
    })
  }

  const publishBuyerProfile = async (
    fullPayload?: BuyerProfileUpdate,
  ): Promise<BuyerProfile> => {
    return $fetch<BuyerProfile>(`${base}/buyer-profile/publish`, {
      method: 'POST',
      headers: headers(),
      body: fullPayload ?? {},
    })
  }

  const deleteBuyerProfile = async (): Promise<{ message: string }> => {
    return $fetch<{ message: string }>(`${base}/buyer-profile`, {
      method: 'DELETE',
      headers: headers(),
    })
  }

  return {
    getBuyerProfile,
    updateBuyerProfile,
    publishBuyerProfile,
    deleteBuyerProfile,
  }
}
