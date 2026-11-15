// Security/launch review finding #10 (2026-11-14): no cookie consent
// mechanism existed at all. This is the record of the visitor's choice —
// PECR/UK GDPR requires that choice exist and be asked for before any
// non-essential tracking runs, not just that non-essential trackers be
// disclosed somewhere on a /legal/cookies page nobody is prompted to read.
//
// App-scoped cookie name, same reasoning as useSessionFlag.ts: cookies are
// scoped by HOST only, not by port, so on localhost this app and the other
// two UMU frontends would otherwise share one jar.
const CONSENT_COOKIE = 'umu_cookie_consent_mobile'
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export type CookieConsent = 'accepted' | 'necessary' | null

export function useCookieConsent() {
  const consent = useCookie<CookieConsent>(CONSENT_COOKIE, {
    maxAge: CONSENT_MAX_AGE,
    sameSite: 'lax',
    default: () => null,
  })

  const accept = () => {
    consent.value = 'accepted'
  }

  const rejectNonEssential = () => {
    consent.value = 'necessary'
  }

  return { consent, accept, rejectNonEssential }
}
