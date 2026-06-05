// Marketplace API client — Step 1 (categories + read-only job feed).
// All three endpoints are public for now; auth comes in Step 2 when
// posting + offers go live. Don't add Authorization headers here yet —
// the backend isn't expecting them and it slows down anonymous loads.

export type MarketplaceUrgency = 'urgent' | 'standard' | 'flexible'

export interface MarketplaceCategory {
  slug: string
  name: string
  emoji: string
  background: string
}

export interface MarketplaceJobListItem {
  id: string
  title: string
  categorySlug: string
  categoryLabel: string
  locationLabel: string
  distanceMi: number | null
  urgency: MarketplaceUrgency
  postedAgo: string
  availability: string | null
  budgetMin: number
  budgetMax: number | null
  offerCount: number
  photoBg: string | null    // legacy gradient placeholder (seeded demo jobs)
  photoUrl: string | null   // relative URL of the first uploaded photo
  status: string            // open | in_progress | completed | cancelled
}

export interface MarketplaceJobDetail extends MarketplaceJobListItem {
  description: string
  availableDates: string[]
  photoBgs: string[]
  photos: string[]
  postcode: string | null
  status: string
  customerId: string | null
  isMine: boolean
}

export interface MarketplaceOffer {
  id: string
  jobId: string
  supplierId: string
  supplierName: string
  supplierInitials: string
  price: number
  message: string
  availableDate: string | null
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  createdAt: string
  // Optional reputation fields — present on `listOffersForJob`,
  // absent on most other endpoints.
  supplierRating?: number | null
  supplierReviewCount?: number
  supplierJobsCompleted?: number
}

export interface CreateOfferPayload {
  price: number
  message: string
  availableDate?: string
}

// ── Threads / messages ─────────────────────────────────────────────
export interface MarketplaceThreadListItem {
  id: string
  jobId: string
  jobTitle: string
  jobCategoryLabel: string
  role: 'customer' | 'supplier'
  otherPartyName: string
  otherPartyInitials: string
  lastMessageBody: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export interface MarketplaceMessage {
  id: string
  senderId: string
  body: string
  createdAt: string
  isMine: boolean
}

export interface MarketplaceThreadDetail {
  id: string
  jobId: string
  jobTitle: string
  jobCategoryLabel: string
  role: 'customer' | 'supplier'
  otherPartyName: string
  otherPartyInitials: string
  messages: MarketplaceMessage[]
}

// ── Escrow / payments ─────────────────────────────────────────────
export interface MarketplacePayment {
  id: string
  jobId: string
  offerId: string
  customerId: string
  supplierId: string
  amount: number       // pence
  platformFee: number  // pence
  total: number        // pence
  status: 'pending' | 'held' | 'released' | 'refunded'
  createdAt: string
  heldAt: string | null
  releasedAt: string | null
  refundedAt: string | null
}

export interface AuthorizeOfferResult {
  payment: MarketplacePayment
  clientSecret: string
}

// ── Reviews + earnings (Step 6) ─────────────────────────────────────
export interface MarketplaceReview {
  id: string
  jobId: string
  fromUserId: string
  toUserId: string
  direction: 'customer_to_supplier' | 'supplier_to_customer'
  rating: number
  body: string | null
  createdAt: string
  fromUserName: string
  fromUserInitials: string
}

export interface MarketplaceUserStats {
  userId: string
  reviewCount: number
  averageRating: number | null
  jobsCompleted: number
  jobsPosted: number
}

export interface MarketplaceEarnings {
  totalEarned: number
  payoutCount: number
  averagePayout: number
  pendingHeld: number
  pendingCount: number
}

export interface MarketplacePayout {
  id: string
  jobId: string
  jobTitle: string
  jobCategoryLabel: string
  customerName: string
  customerInitials: string
  amount: number
  status: 'held' | 'released'
  releasedAt: string | null
  heldAt: string | null
}

export interface MarketplaceStats {
  posted: number
  inProgress: number
  completed: number
}

export interface CreateJobPayload {
  categorySlug: string
  title: string
  description: string
  locationLabel: string
  postcode?: string
  urgency: MarketplaceUrgency
  availability?: string
  availableDates?: string[]
  budgetMin: number
  budgetMax?: number
  photos: string[] // URLs returned from uploadPhoto
}

export function useMarketplace() {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.apiBase

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const authHeaders = () => {
    const t = getToken()
    return t ? { Authorization: `Bearer ${t}` } : {}
  }

  // Some endpoints return relative photo URLs (`/uploads/job-photos/...`).
  // The frontend renders them in <img>/CSS, so we re-anchor to the API
  // origin here rather than threading BASE_URL through every component.
  const resolvePhotoUrl = (url: string | null | undefined) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return `${BASE_URL}${url}`
    return url
  }

  // Slug → photographic background for category tiles. The prototype
  // uses loremflickr; we mirror the exact tag list + lock numbers so
  // the tiles render the same images. Falls back to a generic
  // "trade,tools" query if the slug is unknown.
  const CATEGORY_IMAGE: Record<string, string> = {
    plumbing:   'https://loremflickr.com/400/400/plumber,pipework?lock=1001',
    electrical: 'https://loremflickr.com/400/400/electrician,wiring?lock=1002',
    carpentry:  'https://loremflickr.com/400/400/carpenter,woodwork?lock=1003',
    painting:   'https://loremflickr.com/400/400/decorating,wall?lock=1004',
    bathrooms:  'https://loremflickr.com/400/400/bathroom,interior?lock=1005',
    kitchens:   'https://loremflickr.com/400/400/kitchen,cabinets?lock=1006',
    garden:     'https://loremflickr.com/400/400/gardener,landscaping?lock=1007',
    surveys:    'https://loremflickr.com/400/400/architecture,blueprint?lock=1008',
    building:   'https://loremflickr.com/400/400/building,site?lock=1016',
    heating:    'https://loremflickr.com/400/400/boiler,radiator?lock=1017',
    windows:    'https://loremflickr.com/400/400/window,glazing?lock=1019',
    cleaning:   'https://loremflickr.com/400/400/cleaning,housework?lock=1020',
  }
  const getCategoryImage = (slug: string): string =>
    CATEGORY_IMAGE[slug] ?? `https://loremflickr.com/400/400/trade,tools?lock=${slug.length}`

  // Composed CSS background — photo overlaid on the seeded gradient so
  // the tile still has colour while the image streams in. Caller drops
  // this straight into `:style="{ background: ... }"`.
  const categoryTileBg = (cat: { slug: string; background: string }): string =>
    `url(${getCategoryImage(cat.slug)}) center/cover no-repeat, ${cat.background}`

  const fetchCategories = () =>
    $fetch<MarketplaceCategory[]>(`${BASE_URL}/marketplace/categories`)

  const fetchJobs = (opts: { category?: string; limit?: number } = {}) =>
    $fetch<MarketplaceJobListItem[]>(`${BASE_URL}/marketplace/jobs`, {
      params: {
        ...(opts.category ? { category: opts.category } : {}),
        ...(opts.limit ? { limit: opts.limit } : {}),
      },
    })

  // Job detail accepts an optional Bearer token — when present the
  // response includes `isMine` so the client can switch the CTA between
  // "View offers" (poster) and "Make an offer" (everyone else).
  const fetchJob = (id: string) =>
    $fetch<MarketplaceJobDetail>(`${BASE_URL}/marketplace/jobs/${id}`, {
      headers: authHeaders(),
    })

  const fetchMyStats = () =>
    $fetch<MarketplaceStats>(`${BASE_URL}/marketplace/me/stats`, {
      headers: authHeaders(),
    })

  const fetchMyJobs = () =>
    $fetch<MarketplaceJobListItem[]>(`${BASE_URL}/marketplace/me/jobs`, {
      headers: authHeaders(),
    })

  const uploadPhoto = async (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('file', file)
    return $fetch<{ url: string }>(`${BASE_URL}/marketplace/upload-photo`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    })
  }

  const createJob = (payload: CreateJobPayload) =>
    $fetch<MarketplaceJobDetail>(`${BASE_URL}/marketplace/jobs`, {
      method: 'POST',
      headers: authHeaders(),
      body: payload,
    })

  // ── Offers ────────────────────────────────────────────────────────
  const createOffer = (jobId: string, payload: CreateOfferPayload) =>
    $fetch<MarketplaceOffer>(`${BASE_URL}/marketplace/jobs/${jobId}/offers`, {
      method: 'POST',
      headers: authHeaders(),
      body: payload,
    })

  const fetchOffers = (jobId: string) =>
    $fetch<MarketplaceOffer[]>(`${BASE_URL}/marketplace/jobs/${jobId}/offers`, {
      headers: authHeaders(),
    })

  // Single-offer read for the authorize-payment screen. Visible to
  // both the job customer and the offering supplier — backend enforces.
  const fetchOffer = (offerId: string) =>
    $fetch<MarketplaceOffer & { jobId: string; jobTitle: string; jobCategoryLabel: string }>(
      `${BASE_URL}/marketplace/offers/${offerId}`,
      { headers: authHeaders() },
    )

  const acceptOffer = (offerId: string) =>
    $fetch<MarketplaceOffer>(`${BASE_URL}/marketplace/offers/${offerId}/accept`, {
      method: 'POST',
      headers: authHeaders(),
    })

  const declineOffer = (offerId: string) =>
    $fetch<MarketplaceOffer>(`${BASE_URL}/marketplace/offers/${offerId}/decline`, {
      method: 'POST',
      headers: authHeaders(),
    })

  // ── Threads / messages ────────────────────────────────────────────
  const fetchThreads = () =>
    $fetch<MarketplaceThreadListItem[]>(`${BASE_URL}/marketplace/threads`, {
      headers: authHeaders(),
    })

  const fetchThread = (threadId: string) =>
    $fetch<MarketplaceThreadDetail>(`${BASE_URL}/marketplace/threads/${threadId}`, {
      headers: authHeaders(),
    })

  const sendMessage = (threadId: string, body: string) =>
    $fetch<MarketplaceMessage>(`${BASE_URL}/marketplace/threads/${threadId}/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: { body },
    })

  const markThreadRead = (threadId: string) =>
    $fetch<{ marked: number }>(`${BASE_URL}/marketplace/threads/${threadId}/read`, {
      method: 'POST',
      headers: authHeaders(),
    })

  // Get-or-create a thread for an offer (customer perspective: the
  // current user is the job poster, the supplier is derived from the
  // offer). Returns the thread detail.
  const openThreadForOffer = (offerId: string) =>
    $fetch<MarketplaceThreadDetail>(`${BASE_URL}/marketplace/offers/${offerId}/thread`, {
      method: 'POST',
      headers: authHeaders(),
    })

  // Get-or-create a thread for a job (supplier perspective: the
  // current user is the supplier, the customer is derived from the job).
  const openThreadForJob = (jobId: string) =>
    $fetch<MarketplaceThreadDetail>(`${BASE_URL}/marketplace/jobs/${jobId}/thread`, {
      method: 'POST',
      headers: authHeaders(),
    })

  // ── Escrow ────────────────────────────────────────────────────────
  const authorizeOffer = (offerId: string) =>
    $fetch<AuthorizeOfferResult>(`${BASE_URL}/marketplace/offers/${offerId}/authorize`, {
      method: 'POST',
      headers: authHeaders(),
    })

  const confirmPayment = (paymentId: string) =>
    $fetch<MarketplacePayment>(`${BASE_URL}/marketplace/payments/${paymentId}/confirm`, {
      method: 'POST',
      headers: authHeaders(),
    })

  const releasePayment = (paymentId: string) =>
    $fetch<MarketplacePayment>(`${BASE_URL}/marketplace/payments/${paymentId}/release`, {
      method: 'POST',
      headers: authHeaders(),
    })

  const fetchPayment = (paymentId: string) =>
    $fetch<MarketplacePayment>(`${BASE_URL}/marketplace/payments/${paymentId}`, {
      headers: authHeaders(),
    })

  const fetchPaymentForJob = (jobId: string) =>
    $fetch<MarketplacePayment | null>(`${BASE_URL}/marketplace/jobs/${jobId}/payment`, {
      headers: authHeaders(),
    })

  // ── Reviews + earnings ────────────────────────────────────────────
  const createReview = (jobId: string, payload: { rating: number; body?: string }) =>
    $fetch<MarketplaceReview>(`${BASE_URL}/marketplace/jobs/${jobId}/review`, {
      method: 'POST',
      headers: authHeaders(),
      body: payload,
    })

  const fetchUserReviews = (userId: string) =>
    $fetch<MarketplaceReview[]>(`${BASE_URL}/marketplace/users/${userId}/reviews`)

  const fetchUserStats = (userId: string) =>
    $fetch<MarketplaceUserStats>(`${BASE_URL}/marketplace/users/${userId}/stats`)

  const fetchEarnings = () =>
    $fetch<MarketplaceEarnings>(`${BASE_URL}/marketplace/me/earnings`, {
      headers: authHeaders(),
    })

  const fetchPayouts = () =>
    $fetch<MarketplacePayout[]>(`${BASE_URL}/marketplace/me/payouts`, {
      headers: authHeaders(),
    })

  return {
    fetchCategories,
    fetchJobs,
    fetchJob,
    fetchMyStats,
    fetchMyJobs,
    uploadPhoto,
    createJob,
    createOffer,
    fetchOffers,
    fetchOffer,
    acceptOffer,
    declineOffer,
    fetchThreads,
    fetchThread,
    sendMessage,
    markThreadRead,
    openThreadForOffer,
    openThreadForJob,
    authorizeOffer,
    confirmPayment,
    releasePayment,
    fetchPayment,
    fetchPaymentForJob,
    createReview,
    fetchUserReviews,
    fetchUserStats,
    fetchEarnings,
    fetchPayouts,
    resolvePhotoUrl,
    getCategoryImage,
    categoryTileBg,
  }
}
