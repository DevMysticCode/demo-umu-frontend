// Composable for the buyer-side OPDA access flow (Sprint 1).
// Each AccessRequest represents an external organisation asking to read the
// buyer's verified credentials via the OpenProperty API. The buyer approves
// with per-scope toggles, declines, or revokes a previously-issued grant.

export type AccessScope =
  | 'identity'
  | 'proof_of_deposit'
  | 'source_of_funds'
  | 'affordability'
  | 'credit_file'
  | 'purchase_profile'
  | 'story'

export interface AccessRequestOrg {
  id: string
  name: string
  legalName: string | null
  logoEmoji: string | null
  description: string | null
  fcaNumber: string | null
  websiteUrl: string | null
}

export interface AccessGrantSummary {
  id: string
  scopes: AccessScope[]
  expiresAt: string
  revokedAt: string | null
  lastUsedAt: string | null
  useCount: number
}

export interface AccessRequest {
  id: string
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED'
  requestedScopes: AccessScope[]
  approvedScopes: AccessScope[]
  reason: string | null
  expiresAt: string
  createdAt: string
  decidedAt: string | null
  org: AccessRequestOrg
  grant: AccessGrantSummary | null
}

export const useVerifierAccess = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const token = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const authHeaders = () => ({
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  })

  const listRequests = async (): Promise<AccessRequest[]> => {
    try {
      return await $fetch<AccessRequest[]>(
        `${base}/buyer-profile/access-requests`,
        { headers: authHeaders() },
      )
    } catch {
      return []
    }
  }

  const getRequest = async (id: string): Promise<AccessRequest> => {
    return $fetch<AccessRequest>(
      `${base}/buyer-profile/access-requests/${id}`,
      { headers: authHeaders() },
    )
  }

  const approveRequest = async (
    id: string,
    body: { scopes: AccessScope[]; expiresInDays?: number },
  ): Promise<AccessRequest> => {
    return $fetch<AccessRequest>(
      `${base}/buyer-profile/access-requests/${id}/approve`,
      { method: 'POST', headers: authHeaders(), body },
    )
  }

  const declineRequest = async (id: string): Promise<AccessRequest> => {
    return $fetch<AccessRequest>(
      `${base}/buyer-profile/access-requests/${id}/decline`,
      { method: 'POST', headers: authHeaders() },
    )
  }

  const revokeGrant = async (grantId: string): Promise<AccessGrantSummary> => {
    return $fetch<AccessGrantSummary>(
      `${base}/buyer-profile/access-grants/${grantId}/revoke`,
      { method: 'POST', headers: authHeaders() },
    )
  }

  return {
    listRequests,
    getRequest,
    approveRequest,
    declineRequest,
    revokeGrant,
  }
}

// ── Display helpers ────────────────────────────────────────────────────────

export const SCOPE_DEFINITIONS: Array<{
  id: AccessScope
  title: string
  sub: string
  defaultOn: boolean
}> = [
  {
    id: 'identity',
    title: 'Identity verification',
    sub: 'DVS-certified · Onfido / Persona',
    defaultOn: true,
  },
  {
    id: 'proof_of_deposit',
    title: 'Proof of deposit',
    sub: 'Bank-verified deposit · Armalytix',
    defaultOn: true,
  },
  {
    id: 'source_of_funds',
    title: 'Source of funds',
    sub: 'AML cleared · Armalytix',
    defaultOn: true,
  },
  {
    id: 'affordability',
    title: 'Affordability report',
    sub: 'Income, outgoings, stress test · Armalytix',
    defaultOn: true,
  },
  {
    id: 'credit_file',
    title: 'Credit file summary',
    sub: 'Experian score · soft search',
    defaultOn: true,
  },
  {
    id: 'purchase_profile',
    title: 'Purchase profile',
    sub: 'Chain position, timeline, property type, solicitor',
    defaultOn: true,
  },
  {
    id: 'story',
    title: 'Personal story',
    sub: 'Optional note you wrote',
    defaultOn: false,
  },
]
