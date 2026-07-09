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
    // 2s cadence + 300 attempts = 10 minutes of coverage before we
    // give up. Cheap enough (one authenticated GET per tick) that a
    // shorter interval doesn't matter, and it means the auto-detect
    // fires within 2s of the user returning to our tab — the previous
    // 3s felt like the loop had died even when it hadn't.
    const interval = opts.intervalMs ?? 2000
    const maxAttempts = opts.maxAttempts ?? 300

    let attempts = 0
    let resolveEarly: (() => void) | null = null

    // Wake the poll loop early when the user returns to our tab.
    // Focus + visibilitychange cover browsers; pageshow catches iOS
    // Safari's bfcache restore (returning to a backgrounded PWA tab
    // often only fires pageshow, not focus). Capacitor's inappbrowser
    // close event isn't observable here, but visibilitychange fires
    // when the WebView regains foreground so it's covered too.
    const wake = () => resolveEarly?.()
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', wake)
      window.addEventListener('visibilitychange', wake)
      window.addEventListener('pageshow', wake)
    }

    try {
      while (attempts < maxAttempts) {
        if (opts.signal?.aborted) throw new Error('Polling aborted')
        attempts++

        // Swallow transient errors inside the loop. A single network
        // blip / brief 5xx used to throw all the way out of
        // pollUntilSettled, which flipped the UI to the "Check now"
        // state even though the user hadn't finished — the visible
        // symptom users reported. Log in dev, keep going in prod.
        try {
          const r = await getKycStatus()
          if (r.status !== 'pending' && r.status !== 'not_started') {
            return r.status
          }
        } catch (err) {
          if (import.meta.dev) console.warn('[kyc] poll tick failed', err)
        }

        // Wait either the full interval OR until a wake-up event fires.
        await new Promise<void>((res) => {
          resolveEarly = res
          const t = setTimeout(() => {
            resolveEarly = null
            res()
          }, interval)
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
        window.removeEventListener('focus', wake)
        window.removeEventListener('visibilitychange', wake)
        window.removeEventListener('pageshow', wake)
      }
    }
  }

  return { startKyc, getKycStatus, pollUntilSettled }
}