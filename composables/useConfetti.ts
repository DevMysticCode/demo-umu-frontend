// Canvas confetti burst — one shot per call, tears down its own canvas
// when the animation is done. Extracted from the onboarding preferences
// page so the same celebration reads consistently across the app.
//
// SSR-safe: no-ops when `window` is undefined. Also short-circuits when
// the user has prefers-reduced-motion set — a shower of moving shapes
// is exactly what that user setting is trying to spare them from.

interface RunConfettiOptions {
  /** Colour palette. Defaults to the UMU teal/navy set. */
  colors?: string[]
  /** How many pieces to spawn. Default 120. */
  count?: number
  /** How many frames of animation. Default 160. */
  frames?: number
}

const DEFAULT_COLORS = [
  '#00A19A',
  '#231d45',
  '#00b5ad',
  '#ffffff',
  '#e2f1ea',
  '#00a19a',
]

export const useConfetti = () => {
  const runConfetti = (opts: RunConfettiOptions = {}) => {
    if (typeof window === 'undefined') return
    // Respect the user's motion preference — big burst of moving shapes
    // is exactly what this setting is meant to suppress.
    if (prefersReducedMotion()) return

    const canvas = document.createElement('canvas')
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      document.body.removeChild(canvas)
      return
    }
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = opts.colors ?? DEFAULT_COLORS
    const count = opts.count ?? 120
    const FRAMES = opts.frames ?? 160

    const pieces = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 120,
      w: 6 + Math.random() * 9,
      h: 5 + Math.random() * 7,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.18,
      vx: (Math.random() - 0.5) * 3,
      vy: 2.5 + Math.random() * 3,
      isCircle: Math.random() > 0.45,
      opacity: 1,
    }))

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of pieces) {
        p.x += p.vx
        p.y += p.vy
        p.angle += p.spin
        if (frame > 90) p.opacity = Math.max(0, p.opacity - 0.015)
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        if (p.isCircle) {
          ctx.beginPath()
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        }
        ctx.restore()
      }
      frame++
      if (frame < FRAMES) {
        requestAnimationFrame(draw)
      } else if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
    }
    requestAnimationFrame(draw)
  }

  return { runConfetti }
}
