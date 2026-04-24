// Composable for the user's own Buyer Passport (the BUYER's verified profile
// they share with sellers, agents, solicitors). Not to be confused with
// /buyer-passport/[id] which is a buyer's PURCHASED access to a seller's passport.

export interface BuyerPassport {
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

export type BuyerPassportUpdate = Partial<
  Pick<
    BuyerPassport,
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

export const useBuyerPassport = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const token = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const headers = () => ({
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  })

  const getBuyerPassport = async (): Promise<BuyerPassport | null> => {
    try {
      return await $fetch<BuyerPassport | null>(`${base}/buyer-passport`, {
        headers: headers(),
      })
    } catch {
      return null
    }
  }

  const updateBuyerPassport = async (
    partial: BuyerPassportUpdate,
  ): Promise<BuyerPassport> => {
    return $fetch<BuyerPassport>(`${base}/buyer-passport`, {
      method: 'PATCH',
      headers: headers(),
      body: partial,
    })
  }

  const publishBuyerPassport = async (): Promise<BuyerPassport> => {
    return $fetch<BuyerPassport>(`${base}/buyer-passport/publish`, {
      method: 'POST',
      headers: headers(),
    })
  }

  const deleteBuyerPassport = async (): Promise<{ message: string }> => {
    return $fetch<{ message: string }>(`${base}/buyer-passport`, {
      method: 'DELETE',
      headers: headers(),
    })
  }

  return {
    getBuyerPassport,
    updateBuyerPassport,
    publishBuyerPassport,
    deleteBuyerPassport,
  }
}
