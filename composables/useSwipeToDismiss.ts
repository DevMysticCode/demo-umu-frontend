import { computed, ref } from 'vue'

interface SwipeToDismissOptions {
  onDismiss: () => void
  // CSS selector(s) that are always drag-safe (handle/header) — a touch
  // starting here drags the sheet regardless of inner scroll position.
  handleSelector?: string
  // Scrollable content selector — a touch starting elsewhere only drags
  // the sheet if this element is already scrolled to the top, so long
  // lists remain scrollable normally.
  contentSelector?: string
  closeThresholdPx?: number
  closeVelocity?: number // px/ms
}

// iOS-style swipe-to-dismiss for bottom sheets: drag down past a distance
// or velocity threshold to close. Shared so every custom sheet in the app
// (each has its own markup/classes) gets the same gesture behaviour
// instead of re-implementing it — and re-missing the non-passive
// touchmove + preventDefault that stops the page behind it from also
// rubber-band scrolling and fighting the sheet's own transform.
export function useSwipeToDismiss(opts: SwipeToDismissOptions) {
  const {
    onDismiss,
    handleSelector = '',
    contentSelector = '',
    closeThresholdPx = 120,
    closeVelocity = 0.6,
  } = opts

  const dragY = ref(0)
  const dragging = ref(false)
  let dragStartY = 0
  let dragStartTime = 0
  let dragStartOnHandle = false
  let dragStartScrollTop = 0

  const dragStyle = computed(() => {
    if (dragY.value <= 0) return undefined
    return {
      transform: `translateY(${dragY.value}px)`,
      transition: dragging.value
        ? 'none'
        : 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
    }
  })

  const onTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement | null
    dragStartOnHandle = !!(
      handleSelector &&
      target?.closest &&
      target.closest(handleSelector)
    )
    // Falls back to the drag target itself when no separate scrollable
    // child is given (some sheets scroll on the outer element directly).
    const dragTarget = e.currentTarget as HTMLElement | null
    const contentEl = (contentSelector && dragTarget?.querySelector(contentSelector)) || dragTarget
    dragStartScrollTop = contentEl?.scrollTop ?? 0
    dragStartY = e.touches[0].clientY
    dragStartTime = Date.now()
    dragging.value = true
    dragY.value = 0
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!dragging.value) return
    const dy = e.touches[0].clientY - dragStartY
    if (dy > 0 && (dragStartOnHandle || dragStartScrollTop <= 0)) {
      // Stop the page/content behind the gesture from also rubber-band
      // scrolling — without this the browser's own overscroll bounce
      // fights our transform and the sheet barely seems to move.
      e.preventDefault()
      dragY.value = dy
    } else {
      dragY.value = 0
    }
  }

  const onTouchEnd = () => {
    if (!dragging.value) return
    dragging.value = false
    const elapsed = Date.now() - dragStartTime
    const velocity = dragY.value / Math.max(elapsed, 1)
    const shouldClose = dragY.value > closeThresholdPx || velocity > closeVelocity
    if (shouldClose) onDismiss()
    dragY.value = 0
  }

  return { dragY, dragging, dragStyle, onTouchStart, onTouchMove, onTouchEnd }
}
