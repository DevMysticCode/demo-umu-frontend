/**
 * Heal old upload URLs that were saved when the backend's BASE_URL was
 * still the localhost default. Rewrites any `http://localhost:3002`
 * (or `http://127.0.0.1:3002`) prefix to the currently-configured
 * apiBase, so images saved from a misconfigured deploy still load on
 * whatever host the frontend is talking to today.
 *
 * Absolute URLs on any other host (S3, valid domain) are returned as-is.
 * Relative URLs are prefixed with apiBase so the browser can resolve
 * them against the backend, not the frontend's own origin.
 */
export function normalizeUploadUrl(
  url: string | null | undefined,
  apiBase: string,
): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  const base = (apiBase || '').replace(/\/+$/, '')

  // Rewrite localhost fallbacks — old backend deploy used
  // `process.env.BASE_URL ?? 'http://localhost:3002'` and any device
  // that fetched those URLs got a network error.
  const localhostRe = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i
  if (localhostRe.test(trimmed) && base && !localhostRe.test(base)) {
    return trimmed.replace(localhostRe, base)
  }

  // Bare relative /uploads/... path — prefix with apiBase so <img>
  // hits the backend, not the frontend origin.
  if (trimmed.startsWith('/uploads/') && base) {
    return `${base}${trimmed}`
  }

  return trimmed
}

/** Apply to an array of upload URLs; drops empty results. */
export function normalizeUploadUrls(
  urls: (string | null | undefined)[] | null | undefined,
  apiBase: string,
): string[] {
  if (!Array.isArray(urls)) return []
  return urls.map((u) => normalizeUploadUrl(u, apiBase)).filter(Boolean)
}
