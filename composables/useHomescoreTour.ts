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

  function show() {
    const step = steps[idx.value]
    if (!step) return end()
    const el = findTarget(step.sel)
    if (!el) {
      // Skip missing target.
      idx.value += 1
      return idx.value < steps.length ? show() : end()
    }
    targetEl.value = el
    // Center the highlighted card on screen.
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
