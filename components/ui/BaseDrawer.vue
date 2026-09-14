<template>
  <!-- Transition wrapper so the drawer slides down on close instead of
       unmounting instantly. `v-if` on the outer overlay used to yank
       the DOM before the CSS transform-transition could fire; wrapping
       in <Transition name="drawer"> defers the unmount until the
       leave animation completes. The overlay fade + the sheet
       slide-down are keyed off the same class prefix (see .drawer-*
       transition classes below). -->
  <Transition name="drawer" appear>
    <div
      v-if="modelValue"
      class="drawer-overlay"
      :class="{ 'drawer-overlay--fullscreen': fullscreen }"
      @click.self="handleClose"
    >
    <div
      ref="drawerEl"
      class="drawer"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? drawerTitleId : undefined"
      tabindex="-1"
      :class="{ 'drawer--open': modelValue, 'drawer--fullscreen': fullscreen }"
      :style="dragStyle"
      @touchstart.passive="onDragStart"
      @touchmove="onDragMove"
      @touchend="onDragEnd"
      @touchcancel="onDragEnd"
      @keydown="onDrawerKeydown"
    >
      <!-- Grab handle — signals swipe-to-dismiss affordance. Hidden on
           fullscreen drawers since they have their own back button. -->
      <div v-if="!fullscreen" class="drawer__handle" aria-hidden="true" />

      <!-- Header -->
      <div class="drawer__header">
        <button v-if="showBackButton" @click="handleClose" class="drawer__back">
          <span class="drawer__back-icon" aria-hidden="true"
            ><OPIcon name="leftChevron" class="w-[15px] h-[15px]"
          /></span>
          <span class="drawer__back-text">Back</span>
        </button>
        <div v-else class="drawer__back-placeholder"></div>

        <h3 :id="drawerTitleId" class="drawer__title">{{ title }}</h3>

        <button @click="handleClose" class="drawer__close" aria-label="Close">
          <span class="drawer__close-icon" aria-hidden="true">✕</span>
        </button>
      </div>

      <!-- Illustration Section (now optional via slot) -->
      <!-- <div v-if="$slots.illustration" class="drawer__illustration">
        <div class="drawer__illustration-icon">
          <slot name="illustration"></slot>
        </div>
        <h4 v-if="title" class="drawer__illustration-title">{{ title }}</h4>
        <p v-if="subtitle" class="drawer__subtitle">{{ subtitle }}</p>
      </div> -->

      <!-- Content -->
      <div class="drawer__content" :class="{ 'drawer__content--large': large }">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="drawer__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
  </Transition>
</template>

<script setup>
import OPIcon from './OPIcon.vue'
import { computed, ref, watch, onUnmounted, useId, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  large: {
    type: Boolean,
    default: false,
  },
  showBackButton: {
    type: Boolean,
    default: true,
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const lockScroll = (lock) => {
  const container = document.querySelector('.mobile-container')
  if (container) {
    container.style.overflow = lock ? 'hidden' : ''
  }
}

// ── Accessibility: focus management ─────────────────────────────────
// WCAG 2.4.3 (Focus Order) / 4.1.2 (Name, Role, Value) for dialogs: on
// open, focus must move into the drawer (not stay on whatever was behind
// it); Tab must stay trapped inside while it's open; on close, focus must
// return to whatever triggered it, not get lost at the top of the page.
const drawerEl = ref(null)
const drawerTitleId = `drawer-title-${useId()}`
let triggerEl = null

function focusables() {
  if (!drawerEl.value) return []
  return Array.from(
    drawerEl.value.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null)
}

function onDrawerKeydown(e) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    handleClose()
    return
  }
  if (e.key !== 'Tab') return
  const items = focusables()
  if (!items.length) {
    e.preventDefault()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (typeof document === 'undefined') return
    lockScroll(isOpen)
    if (isOpen) {
      // Remember what had focus so it can be restored on close - a modal
      // that never gives focus back strands keyboard/VoiceOver users at
      // the top of the page.
      triggerEl = document.activeElement
      nextTick(() => {
        const items = focusables()
        ;(items[0] || drawerEl.value)?.focus()
      })
    } else if (triggerEl && typeof triggerEl.focus === 'function') {
      triggerEl.focus()
      triggerEl = null
    }
  },
)

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    lockScroll(false)
  }
})

// ── Swipe-to-dismiss ─────────────────────────────────────────────
// Standard iOS-style: pulling the drawer downward past a threshold
// closes it. Only intercepts touches that either start on the header/
// handle area OR start with the inner content already scrolled to the
// top — so long lists remain scrollable normally.
const dragY = ref(0)
const dragging = ref(false)
let dragStartY = 0
let dragStartTime = 0
let dragStartOnHeader = false
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

const onDragStart = (e) => {
  if (props.fullscreen) return
  const target = e.target
  // Header, handle, and title area are always drag-safe. Content is
  // drag-safe only when scrolled to the top (prevents hijacking scroll).
  dragStartOnHeader = !!(
    target &&
    target.closest &&
    (target.closest('.drawer__handle') ||
      target.closest('.drawer__header'))
  )
  const contentEl = e.currentTarget.querySelector('.drawer__content')
  dragStartScrollTop = contentEl?.scrollTop ?? 0
  dragStartY = e.touches[0].clientY
  dragStartTime = Date.now()
  dragging.value = true
  dragY.value = 0
}

const onDragMove = (e) => {
  if (!dragging.value) return
  const dy = e.touches[0].clientY - dragStartY
  // Only start dragging the sheet when going downward AND either we
  // began on the header/handle OR the inner content is already at top.
  if (dy > 0 && (dragStartOnHeader || dragStartScrollTop <= 0)) {
    // Stop the page/content behind the gesture from also rubber-band
    // scrolling — without this the browser's own overscroll bounce
    // fights our transform and the sheet barely seems to move.
    e.preventDefault()
    dragY.value = dy
  } else {
    dragY.value = 0
  }
}

const onDragEnd = () => {
  if (!dragging.value) return
  dragging.value = false
  const elapsed = Date.now() - dragStartTime
  const velocity = dragY.value / Math.max(elapsed, 1) // px/ms
  const shouldClose = dragY.value > 120 || velocity > 0.6
  if (shouldClose) {
    handleClose()
  }
  dragY.value = 0
}
</script>

<style scoped>
/* Drawer Overlay */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  /* Above the bottom-nav's z-50 - otherwise the nav's fixed bar
     paints over the drawer's pinned #footer slot and the primary
     CTA (Add Collaborators, etc.) becomes invisible + untappable. */
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.drawer-overlay--fullscreen {
  align-items: stretch;
  justify-content: stretch;
  background-color: rgba(0, 0, 0, 0.9);
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 100%;
  width: 100%;
  transform: none;
}

/* Drawer Container - constrained to the app's `.mobile-container`
   max-width (28rem ≈ Tailwind's max-w-md) so the sheet doesn't spill
   past the chrome on desktop / wider viewports. Centered via the
   overlay's flex centering above. */
.drawer {
  background-color: #f3f4f6;
  position: absolute;
  bottom: 0;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  overflow: hidden;
}
/* The drawer itself is only ever a focus target when it has no focusable
   content to land on instead (see focusables() in the script) - a plain
   browser outline in that fallback case reads as a stray box around the
   whole sheet, so give it an inset ring instead. Real controls inside
   (buttons, inputs, links) keep their own default focus ring. */
.drawer:focus-visible {
  outline: 2px solid #00726c;
  outline-offset: -2px;
}

.drawer--fullscreen {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  border-radius: 0;
  transform: translateY(0) !important;
}

.drawer--open {
  transform: translateY(0);
}

/* ── Slide-down / fade animation on close ──────────────────────────
   Wrapped in a Vue <Transition name="drawer"> so the overlay + drawer
   stay mounted through the leave animation. Without this the outer
   `v-if` would tear the DOM out before the CSS transform-transition
   on `.drawer` could play, and the user would see a hard cut. */
.drawer-enter-active,
.drawer-leave-active {
  transition: background-color 0.28s ease;
}
.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0.24, 1);
}
/* Starting / ending states - overlay fades to transparent, sheet
   slides fully off-screen. The `.drawer--open` class rule above
   handles the resting position. */
.drawer-enter-from,
.drawer-leave-to {
  background-color: transparent !important;
}
.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateY(100%) !important;
}

/* Grab handle at the top of the sheet - iOS-native drag affordance. */
.drawer__handle {
  width: 40px;
  height: 4px;
  border-radius: 100px;
  background: #d1d5db;
  margin: 8px auto 4px;
  flex-shrink: 0;
  touch-action: none;
}

/* Header */
.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem 0.5rem;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  min-height: 3.5rem; /* Ensure consistent height */
  touch-action: none;
}

.drawer__back {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: #00726c;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.drawer__back:hover {
  color: rgba(0, 161, 154, 0.8);
}

.drawer__back-placeholder {
  width: 80px; /* Same approximate width as the back button */
  visibility: hidden;
}

.drawer__back-icon {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.drawer__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  text-align: center;
  flex: 1;
  margin: 0;
  padding: 0 1rem; /* Add padding for better spacing */
}

.drawer__close {
  background: rgba(127, 127, 127, 0.15);
  border: none;
  color: rgba(61, 61, 61, 0.5);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1rem;
  font-style: normal;
  font-weight: 590;
  line-height: 21px;
}

.drawer__close:hover {
  color: #374151;
  background-color: rgba(0, 0, 0, 0.05);
}

/* Illustration Section */
.drawer__illustration {
  padding: 1.5rem 1.5rem 1rem;
  text-align: center;
  background-color: #f3f4f6;
}

.drawer__illustration-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.drawer__illustration-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.drawer__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
}

/* Content */
.drawer__content {
  flex: 1;
  overflow-y: auto;
  background-color: white;
  border-radius: 0.75rem 0.75rem 0 0;
  padding: 16px;
  min-height: 200px;
}

.drawer__content--large {
  min-height: 300px;
}

/* Footer - must stay pinned to the drawer bottom regardless of
   content overflow. `flex-shrink: 0` stops the flex column from
   squeezing the buttons out when `.drawer__content` gets tall;
   before this rule existed the footer only had padding from a
   mobile media query and could collapse to zero height on some
   viewports, leaving testers with an invisible submit button. */
.drawer__footer {
  flex-shrink: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0));
  background: #fff;
  border-top: 1px solid #e5e7eb;
}

/* Scrollbar Styling */
.drawer__content::-webkit-scrollbar {
  width: 4px;
}

.drawer__content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.drawer__content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.drawer__content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .drawer {
    max-width: 100%;
    margin: 0;
    max-height: 85vh; /* Adjust for mobile */
  }

  .drawer__header {
    padding: 0.75rem 1rem 0.5rem;
  }

  .drawer__illustration {
    padding: 1rem 1rem 0.75rem;
  }

  .drawer__content {
    padding: 1rem;
  }

  .drawer__footer {
    padding: 0.75rem 1rem 1rem;
    margin: 16px;
  }

  .drawer__back-placeholder {
    width: 60px; /* Smaller placeholder on mobile */
  }
}
</style>
