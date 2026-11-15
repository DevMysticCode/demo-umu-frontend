// In-memory access-token store (security review finding #7, 2026-11-15).
// The JWT used to live in localStorage, readable by ANY script running on
// the page — an XSS bug anywhere in the app, or a compromised third-party
// script, could read it and impersonate the user for its full lifetime.
// This keeps it only in a plain module-level variable: gone the instant
// the tab/process ends, invisible to devtools' Application > Storage tab,
// and unreachable via the localStorage/sessionStorage APIs an injected
// <script> would use.
//
// The long-lived refresh token already lives in an httpOnly cookie (12
// Oct 2026 hardening, see backend src/auth/refresh-cookie.ts) and is what
// repopulates this on every fresh load/reload — see
// plugins/auth-refresh.client.ts. Losing this value on reload is the
// deliberate trade-off that makes the rest of it safe.
let accessToken: string | null = null

export function getToken(): string | null {
  return accessToken
}

export function setToken(token: string | null): void {
  accessToken = token
}

export function clearToken(): void {
  accessToken = null
}
