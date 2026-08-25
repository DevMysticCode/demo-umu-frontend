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

  // Returns null on failure — NOT a fake "unclaimed" result. A network
  // blip or expired token here used to silently render as "no passport",
  // which could prompt someone who's already claimed/published to pay
  // again. Callers must treat null as "status unknown", not "unclaimed".
  const getPassportStatus = async (
    propertyId: string,
  ): Promise<PassportStatus | null> => {
    try {
      return await $fetch<PassportStatus>(
        `${base}/property/${propertyId}/passport-status`,
        { headers: headers() },
      )
    } catch {
      return null
    }
  }

  // Property claims (propertyId set) come back with status:'PENDING_PAYMENT'
  // and no type yet — type is chosen later via setPassportType(), once HM
  // Land Registry has verified ownership (see that function below). The
  // claim isn't active until createClaimPaymentIntent + setPassportType +
  // activatePassport all complete. Manual passports / landlord→seller
  // converts (opts.type provided, no propertyId flow involved) come back
  // already 'IN_PROGRESS' (no HMLR involved, free as before).
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
        ...(opts.type ? { type: opts.type } : {}),
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

  // Sets the seller/landlord choice on a paid property claim — call once HM
  // Land Registry has verified ownership, right before activatePassport().
  const setPassportType = async (
    passportId: string,
    type: 'seller' | 'landlord',
    isHmo = false,
  ): Promise<{ passportId: string; status: string }> => {
    return $fetch<{ passportId: string; status: string }>(
      `${base}/passport/${passportId}/set-type`,
      {
        method: 'POST',
        headers: headers(),
        body: { type, ...(isHmo ? { isHmo: true } : {}) },
      },
    )
  }

  // Seeds the passport's sections once createClaimPaymentIntent's Stripe
  // charge has succeeded and setPassportType() has set a type. Safe to call
  // again if it somehow gets retried — the backend no-ops once the
  // passport is already active.
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
    setPassportType,
    activatePassport,
    unlockPassport,
    convertLandlordToSeller,
  }
}


