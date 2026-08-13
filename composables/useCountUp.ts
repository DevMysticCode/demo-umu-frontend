// Shared count-up number animation — the same cubic-ease-out rAF pattern
// was independently copy-pasted in V6LevelUpView.vue, ScoreRing.vue,
// V6ScoreView.vue, V6BoostView.vue, ResultDetail.vue, shared-buyer/[token].vue
// and buyer-profile/view.vue. This extraction is used by the new
// PassportAchievement points-card animation; the existing copies are left
// as-is (out of scope for this task).
export function useCountUp(initial = 0) {
  const value = ref(initial)
  let rafId: number | null = null

  function stop() {
    if (rafId != null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function start(from: number, to: number, duration = 1200) {
    stop()
    if (typeof window === 'undefined') {
      value.value = to
      return
    }
    if (prefersReducedMotion()) {
      value.value = to
      return
    }
    value.value = from
    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      value.value = Math.round(from + (to - from) * ease)
      if (t < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        value.value = to
        rafId = null
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  onBeforeUnmount(stop)

  return { value: readonly(value), start, stop }
}
