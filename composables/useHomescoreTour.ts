import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

export interface TourStep {
  /** CSS selector for the card to highlight. */
  sel: string
  /** Step title (shown in the inject card). */
  title: string
  /** Body copy. */
  body: string
}

export interface UseHomescoreTourOptions {
  /** Localstorage key used to remember "user has seen this tour". */
  storageKey: string
  /** Steps in order. */
  steps: TourStep[]
  /** Auto-start once on the first visit (defaults to true). */
  autoStart?: boolean
}

export type HomescoreTour = ReturnType<typeof useHomescoreTour>

/**
 * Mirrors the landing prototype's coach-mark flow: a sequence of steps,
 * each one highlights a card by `data-tour` (or any selector) and renders
 * an inject card directly after that target. The component side
 * (TourCoach.vue) renders the inject + handles the dim overlay.
 */
export function useHomescoreTour(opts: UseHomescoreTourOptions) {
  const active = ref(false)
  const idx = ref(0)
  const targetEl = ref<HTMLElement | null>(null)

  const steps = opts.steps
  const currentStep = computed<TourStep | null>(() =>
    active.value ? steps[idx.value] ?? null : null,
  )
  const isLast = computed(() => idx.value === steps.length - 1)
  const total = steps.length

  function findTarget(sel: string): HTMLElement | null {
    if (typeof document === 'undefined') return null
    // Prefer an element that's currently in the layout (offsetParent !== null).
    const all = Array.from(document.querySelectorAll<HTMLElement>(sel))
    return all.find((el) => el.offsetParent !== null) ?? null
  }

  function show(): void {
    const step = steps[idx.value]
    if (!step) return end()
    const el = findTarget(step.sel)
    if (!el) {
      // Skip missing target.
      idx.value += 1
      return idx.value < steps.length ? show() : end()
    }
    targetEl.value = el
    // Rough first pass — get the target roughly into view. TourCoach.vue
    // then measures its own inject card's REAL rendered height (which
    // varies step to step with body-text length) and does a second,
    // precise corrective scroll to open up exactly enough room above (or
    // below) the target — see ensureRoomForCard() there. A fixed guess
    // here previously caused either a big empty gap (guess too generous
    // for a short card) or overlap (guess too small for a tall one).
    //
    // Instant, not smooth: TourCoach's own corrective scroll runs on a
    // fixed delay after this (long enough to expect this one to have
    // settled) and is itself instant. A smooth scroll here can still be
    // mid-animation when that fires — the corrective scroll computes the
    // right answer for the position at that moment, but the still-moving
    // smooth scroll then keeps going afterward, re-triggering measure()
    // via the scroll listener and silently overwriting the correction
    // with wherever the animation happens to land. The inject card is
    // hidden until everything settles either way, so there's no visible
    // scroll animation to lose by making this instant too.
    //
    // Still deferred to the next animation frame (not called inline
    // here): a caller like the landing page reorders a stack of cards in
    // response to the same step change (bringing the right card to the
    // front) via its own watcher, which flushes as a microtask before
    // rAF but after this synchronous call - scrolling immediately here
    // could target the card's pre-reorder position.
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'auto', block: 'center' })
    })
  }

  function start() {
    if (!steps.length) return
    idx.value = 0
    active.value = true
    show()
  }

  function next() {
    if (idx.value >= steps.length - 1) return end()
    idx.value += 1
    show()
  }

  function prev() {
    if (idx.value === 0) return
    idx.value -= 1
    show()
  }

  function end() {
    active.value = false
    targetEl.value = null
    // Steps scroll their target card into view as the tour progresses
    // (see `show()`), so by the time it ends the page can be scrolled
    // anywhere — reset to the top rather than leaving the user mid-page.
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(opts.storageKey, '1')
      }
    } catch {
      /* ignore */
    }
  }

  function restart() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(opts.storageKey)
      }
    } catch {
      /* ignore */
    }
    start()
  }

  // Auto-start on first visit.
  onMounted(() => {
    if (opts.autoStart === false) return
    try {
      const seen = localStorage.getItem(opts.storageKey)
      if (seen) return
    } catch {
      /* ignore */
    }
    // Defer so the page paint + initial fetches settle first.
    setTimeout(() => start(), 800)
  })

  onBeforeUnmount(() => {
    targetEl.value = null
  })

  return {
    active,
    idx,
    total,
    currentStep,
    targetEl,
    isLast,
    steps,
    start,
    next,
    prev,
    end,
    restart,
  }
}
