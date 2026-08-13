// Shared prefers-reduced-motion check — extracted from useConfetti.ts,
// which was the only place in the app checking this. SSR-safe (no-ops
// server-side).
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}
