// Composable for the user's own Buyer Profile (the BUYER's verified profile
// they share with sellers, agents, solicitors). Not to be confused with
// /buyer-passport/[id] which is a buyer's PURCHASED access to a seller's passport.

export type BuyerProfileTier = 'BASIC' | 'VERIFIED' | 'PREMIUM'

export interface BuyerProfile {
  id: string
  userId: string
  publicRef: string | null
  tier: BuyerProfileTier
  tierPaidAt: string | null
  idDocumentType: string | null
  idDocumentUrl: string | null
  idVerified: boolean
  idVerifiedAt: string | null
  fundsType: string | null
  fundsAmount: number | null
  fundsDocumentUrl: string | null
  fundsVerified: boolean
  fundsAmountVerified: number | null
  amlStatus: string | null
  affordabilityScore: number | null
  sourceOfFundsJson: any
  chainPosition: string | null
  solicitorStatus: string | null
  timeline: string | null
  propertyType: string | null
  statement: string | null
  // Digital signature — either base64 canvas or typed name.
  signatureData: string | null
  signedName: string | null
  signedAt: string | null
  completedSteps: number
  strengthScore: number
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type BuyerProfileUpdate = Partial<
  Pick<
    BuyerProfile,
    | 'tier'
    | 'idDocumentType'
    | 'idDocumentUrl'
    | 'fundsType'
    | 'fundsAmount'
    | 'fundsDocumentUrl'
    | 'chainPosition'
    | 'solicitorStatus'
    | 'timeline'
    | 'propertyType'
    | 'statement'
    | 'completedSteps'
  >
>

export interface BuyerProfileShare {
  id: string
  profileId: string
  token: string
  recipientName: string | null
  recipientEmail: string | null
  scope: string[]
  sentAt: string
  expiresAt: string
  revokedAt: string | null
  lastViewedAt: string | null
  viewCount: number
}

export interface ActivityStats {
  publishedLast7d: number
  totalPublished: number
}

export const useBuyerProfile = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const token = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const authHeaders = () => ({
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  })

  const getBuyerProfile = async (): Promise<BuyerProfile | null> => {
    try {
      return await $fetch<BuyerProfile | null>(`${base}/buyer-profile`, {
        headers: authHeaders(),
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
      headers: authHeaders(),
      body: partial,
    })
  }

  const publishBuyerProfile = async (
    fullPayload?: BuyerProfileUpdate,
  ): Promise<BuyerProfile> => {
    return $fetch<BuyerProfile>(`${base}/buyer-profile/publish`, {
      method: 'POST',
      headers: authHeaders(),
      body: fullPayload ?? {},
    })
  }

  const deleteBuyerProfile = async (): Promise<{ message: string }> => {
    return $fetch<{ message: string }>(`${base}/buyer-profile`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  }

  // ── Digital signature ───────────────────────────────────────────────────
  const signProfile = async (input: {
    signatureData?: string | null
    signedName?: string | null
  }): Promise<BuyerProfile> => {
    return $fetch<BuyerProfile>(`${base}/buyer-profile/sign`, {
      method: 'POST',
      headers: authHeaders(),
      body: input,
    })
  }

  const clearSignature = async (): Promise<BuyerProfile> => {
    return $fetch<BuyerProfile>(`${base}/buyer-profile/sign/clear`, {
      method: 'POST',
      headers: authHeaders(),
    })
  }

  // ── Tier upgrade (Stripe) ───────────────────────────────────────────────
  const createTierCheckout = async (
    tier: BuyerProfileTier,
  ): Promise<{ clientSecret: string; amount: number; tier: string }> => {
    return $fetch(`${base}/buyer-profile/tier/checkout`, {
      method: 'POST',
      headers: authHeaders(),
      body: { tier },
    })
  }

  const confirmTierPayment = async (
    paymentIntentId: string,
  ): Promise<BuyerProfile> => {
    return $fetch<BuyerProfile>(`${base}/buyer-profile/tier/confirm`, {
      method: 'POST',
      headers: authHeaders(),
      body: { paymentIntentId },
    })
  }

  // ── Sharing ─────────────────────────────────────────────────────────────
  const listShares = async (): Promise<BuyerProfileShare[]> => {
    try {
      return await $fetch<BuyerProfileShare[]>(`${base}/buyer-profile/shares`, {
        headers: authHeaders(),
      })
    } catch {
      return []
    }
  }

  const createShare = async (input: {
    recipientName?: string
    recipientEmail?: string
    scope?: string[]
    expiresInDays?: number
  }): Promise<BuyerProfileShare> => {
    return $fetch<BuyerProfileShare>(`${base}/buyer-profile/shares`, {
      method: 'POST',
      headers: authHeaders(),
      body: input,
    })
  }

  const revokeShare = async (
    shareId: string,
  ): Promise<BuyerProfileShare> => {
    return $fetch<BuyerProfileShare>(
      `${base}/buyer-profile/shares/${shareId}/revoke`,
      { method: 'POST', headers: authHeaders() },
    )
  }

  // ── Activity ticker ─────────────────────────────────────────────────────
  const getActivityStats = async (): Promise<ActivityStats> => {
    try {
      return await $fetch<ActivityStats>(`${base}/buyer-profile/stats/activity`)
    } catch {
      return { publishedLast7d: 0, totalPublished: 0 }
    }
  }

  // ── Public read (used by /shared-buyer/[token]) ─────────────────────────
  const getPublicShare = async (token: string): Promise<any> => {
    return $fetch(`${base}/buyer-profile/public/${token}`)
  }

  return {
    getBuyerProfile,
    updateBuyerProfile,
    publishBuyerProfile,
    deleteBuyerProfile,
    signProfile,
    clearSignature,
    createTierCheckout,
    confirmTierPayment,
    listShares,
    createShare,
    revokeShare,
    getActivityStats,
    getPublicShare,
  }
}
