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
    isBuyer?: boolean
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

  // Property claims (propertyId set) come back with status:'PENDING_PAYMENT'
  // — KYC and/or HM Land Registry cost real money, so the claim isn't
  // active until createClaimPaymentIntent + activatePassport complete.
  // Manual passports / landlord→seller converts come back already
  // 'IN_PROGRESS' (no HMLR involved, free as before).
  const claimPassport = async (
    propertyId: string,
    addressLine1: string,
    postcode: string,
    opts: { type?: 'seller' | 'landlord'; isHmo?: boolean } = {},
  ): Promise<{ passportId: string; status: string }> => {
    return $fetch<{ passportId: string; status: string }>(`${base}/passport/create`, {
      method: 'POST',
      headers: headers(),
      body: {
        propertyId,
        addressLine1,
        postcode,
        type: opts.type ?? 'seller',
        ...(opts.isHmo ? { isHmo: true } : {}),
      },
    })
  }

  // Owner-claim payment — KYC+HMLR (£35.99) or HMLR-only (£15.99) depending
  // on whether the user already had approved KYC before this claim. Amount
  // is decided server-side; returned here purely for display.
  const createClaimPaymentIntent = async (
    passportId: string,
  ): Promise<{ clientSecret: string; paymentId: string; amount: number }> => {
    return $fetch(`${base}/payment/create-claim-intent`, {
      method: 'POST',
      headers: headers(),
      body: { passportId },
    })
  }

  // Seeds the passport's sections once createClaimPaymentIntent's Stripe
  // charge has succeeded. Safe to call again if it somehow gets retried —
  // the backend no-ops once the passport is already active.
  const activatePassport = async (passportId: string): Promise<{ passportId: string }> => {
    return $fetch<{ passportId: string }>(`${base}/passport/${passportId}/activate`, {
      method: 'POST',
      headers: headers(),
    })
  }

  const unlockPassport = async (passportId: string): Promise<{ passportId: string }> => {
    return $fetch<{ passportId: string }>(`${base}/passport/${passportId}/buyer-unlock`, {
      method: 'POST',
      headers: headers(),
    })
  }

  const convertLandlordToSeller = async (
    landlordPassportId: string,
  ): Promise<{ passportId: string; transferredSectionKeys: string[] }> => {
    return $fetch(`${base}/passport/${landlordPassportId}/convert-to-seller`, {
      method: 'POST',
      headers: headers(),
      body: { acknowledged: true },
    })
  }

  return {
    getPassportStatus,
    claimPassport,
    createClaimPaymentIntent,
    activatePassport,
    unlockPassport,
    convertLandlordToSeller,
  }
}


