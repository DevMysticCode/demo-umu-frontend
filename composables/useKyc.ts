// Persona KYC client. Per-user, one-time:
//  1. POST /kyc/start → { status, inquiryId, hostedUrl, alreadyVerified? }
//  2. Open hostedUrl in a new tab/window — user completes the flow there
//  3. Poll GET /kyc/status until status is no longer "pending"

export type KycStatus =
  | 'not_started'
  | 'pending'
  | 'approved'
  | 'declined'
  | 'failed'
  | 'needs_review'

export interface StartKycResult {
  status: KycStatus
  inquiryId: string | null
  hostedUrl?: string
  alreadyVerified?: boolean
}

export const useKyc = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const token = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers = () => ({
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  })

  const startKyc = async (): Promise<StartKycResult> => {
    return $fetch<StartKycResult>(`${base}/kyc/start`, {
      method: 'POST',
      headers: headers(),
    })
  }

  const getKycStatus = async (): Promise<{
    status: KycStatus
    inquiryId: string | null
    completedAt?: string | null
  }> => {
    return $fetch(`${base}/kyc/status`, { headers: headers() })
  }

  /**
   * Poll /kyc/status until the status leaves "pending".
   *
   * Improvements over a naive while-loop:
   *  - bounded attempts (default 100 polls × 3s = 5 minutes) so a stuck
   *    inquiry never spins forever
   *  - listens for window focus so the moment the user comes back to our
   *    tab from the Persona tab, we re-poll immediately instead of
   *    waiting up to `intervalMs`
   *  - cancellable via AbortSignal
   */
  const pollUntilSettled = async (
    opts: {
      intervalMs?: number
      maxAttempts?: number
      signal?: AbortSignal
    } = {},
  ): Promise<KycStatus> => {
    const interval = opts.intervalMs ?? 3000
    const maxAttempts = opts.maxAttempts ?? 100

    let attempts = 0
    let resolveEarly: (() => void) | null = null

    // Wake the poll loop early when the user returns to this tab.
    const onFocus = () => resolveEarly?.()
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus)
      window.addEventListener('visibilitychange', onFocus)
    }

    try {
      while (attempts < maxAttempts) {
        if (opts.signal?.aborted) throw new Error('Polling aborted')
        attempts++

        const r = await getKycStatus()
        if (r.status !== 'pending' && r.status !== 'not_started') {
          return r.status
        }

        // Wait either the full interval OR until window-focus wakes us up.
        await new Promise<void>((res) => {
          resolveEarly = res
          const t = setTimeout(() => {
            resolveEarly = null
            res()
          }, interval)
          // If aborted, clear immediately.
          opts.signal?.addEventListener(
            'abort',
            () => {
              clearTimeout(t)
              res()
            },
            { once: true },
          )
        })
      }
      // Hit the cap without settling — caller should let the user retry.
      throw new Error('timeout')
    } finally {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus)
        window.removeEventListener('visibilitychange', onFocus)
      }
    }
  }

  return { startKyc, getKycStatus, pollUntilSettled }
}