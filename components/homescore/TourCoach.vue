<template>
  <Teleport to="body">
    <div v-if="tour.active.value" class="cm-overlay" @click.self="tour.end()">
      <div
        v-if="tour.currentStep.value && targetRect"
        class="cm-spotlight"
        :style="spotlightStyle"
      />

      <div
        v-if="tour.currentStep.value && injectPos"
        ref="injectEl"
        class="cm-inject"
        :class="{ 'cm-inject--visible': injectVisible }"
        :style="injectStyle"
      >
        <div class="cm-inject-step">{{ tour.idx.value + 1 }} of {{ tour.total }}</div>
        <div class="cm-inject-title">{{ tour.currentStep.value.title }}</div>
        <div class="cm-inject-body">{{ tour.currentStep.value.body }}</div>
        <div class="cm-inject-footer">
          <div class="cm-inject-dots">
            <span
              v-for="(_, i) in tour.steps"
              :key="i"
              class="cm-inject-dot"
              :class="{ active: i === tour.idx.value }"
            />
          </div>
          <div class="cm-inject-btns">
            <button class="cm-inject-skip" @click="tour.end()">Skip</button>
            <button class="cm-inject-next" @click="tour.next()">
              {{ tour.isLast.value ? 'Got it ✓' : 'Next →' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import type { HomescoreTour } from '~/composables/useHomescoreTour'

const props = defineProps<{ tour: HomescoreTour }>()

interface Rect { top: number; left: number; width: number; height: number }
const targetRect = ref<Rect | null>(null)

// Real footprint of the inject card, measured off the actual DOM element —
// body-text length varies step to step, so a hardcoded height estimate was
// either too generous (a big empty gap above short cards) or too small
// (overlapping tall cards). Falls back to a reasonable guess before the
// card has rendered for the very first measurement.
const injectEl = ref<HTMLElement | null>(null)
const injectHeight = ref(190)
const GAP = 20
const EDGE_MARGIN = 16

// Hidden until a step's position has settled - the very first measure()
// for a new step positions the card using the PREVIOUS step's height
// (or the 190px guess, on the first step ever), then corrects itself a
// tick later once the real height is known. Without this, that
// correction is visible as the card popping in low and jumping to its
// final spot. Kept false while mid-measurement so the reposition happens
// off-screen from the user's perspective, then revealed already correct.
const injectVisible = ref(false)

async function measure() {
  const el = props.tour.targetEl.value
  if (!el) {
    targetRect.value = null
    return
  }
  const r = el.getBoundingClientRect()
  targetRect.value = { top: r.top, left: r.left, width: r.width, height: r.height }
  await nextTick()
  const h = injectEl.value?.getBoundingClientRect().height
  if (h) injectHeight.value = h
}

// Re-reads the target's real on-screen position after an instant scroll,
// rather than trusting the requested delta - scrollBy clamps at the
// document's edges, so a target near the top (or bottom) of the page may
// only move part of the way, or not at all. Trusting the requested delta
// in that case invents a targetRect that doesn't match reality, which
// then feeds a wrong "there's room here" decision into injectStyle below.
function refreshTargetRect() {
  const el = props.tour.targetEl.value
  if (!el) return
  const nr = el.getBoundingClientRect()
  targetRect.value = { top: nr.top, left: nr.left, width: nr.width, height: nr.height }
  return targetRect.value
}

// Secures clear space for the inject card without overlapping the
// target - tries ABOVE first (matches injectStyle's own preference,
// below), scrolling up by the exact shortfall. On a short viewport with
// a tall target close to the top of the whole page, that scroll can be
// clamped before it opens up enough room (there's simply nothing further
// up to reveal) - when that happens, fall back to BELOW and scroll DOWN
// to secure that instead, rather than letting injectStyle's viewport
// clamp overlap the card onto the target (which is what a purely passive
// clamp does: it keeps the card on-screen, but says nothing about
// clearing the target it's supposed to sit next to).
//
// Instant, not smooth: this runs right before the card is revealed (see
// the watcher below), while it's still hidden. A `behavior: 'smooth'`
// scroll here doesn't finish within this same tick — it keeps animating
// after injectVisible flips true, so the card pops in and then visibly
// slides as the page keeps scrolling underneath it. Instant means any
// nudge is done by the time anything is shown, so there's nothing left
// to animate.
function ensureRoomForCard() {
  let r = targetRect.value
  if (!r || typeof window === 'undefined') return
  const needed = injectHeight.value + GAP

  const shortfallAbove = needed + EDGE_MARGIN - r.top
  if (shortfallAbove > 0) {
    window.scrollBy({ top: -shortfallAbove, behavior: 'auto' })
    r = refreshTargetRect() ?? r
  }

  if (r.top - needed < EDGE_MARGIN) {
    const vh = window.innerHeight
    // Rect has no .bottom - it's top + height, not a separate field.
    const shortfallBelow = needed + EDGE_MARGIN - (vh - (r.top + r.height))
    if (shortfallBelow > 0) {
      window.scrollBy({ top: shortfallBelow, behavior: 'auto' })
      refreshTargetRect()
    }
  }
}

// True while a step's position is being settled - see the scroll
// listener below.
let correcting = false

// Guards against two settle sequences overlapping - if the step changes
// again before the previous 380ms timeout has fired (e.g. rapid Next
// clicks, or the callback merely running late under load), the stale
// one's measure()/ensureRoomForCard()/injectVisible.value=true would
// still fire after it, using a target/rect that's no longer current and
// flipping `correcting` back off in the middle of the NEW sequence's own
// corrective scrolling - reopening the exact race the scroll-listener
// guard above exists to close. Each run captures its own token and bails
// at every await point once a newer step has superseded it.
let settleToken = 0

// Re-measure when the active step or visibility changes.
watch(
  () => [props.tour.active.value, props.tour.idx.value, props.tour.targetEl.value],
  () => {
    injectVisible.value = false
    correcting = true
    const myToken = ++settleToken
    // Allow the scrollIntoView animation to settle.
    setTimeout(async () => {
      await measure()
      if (myToken !== settleToken) return
      ensureRoomForCard()
      if (myToken !== settleToken) return
      injectVisible.value = true
      correcting = false
    }, 380)
  },
  { immediate: true },
)

if (typeof window !== 'undefined') {
  window.addEventListener('resize', measure)
  // Ignored while `correcting`: ensureRoomForCard()'s own scrollBy calls
  // fire 'scroll' events too, each of which would otherwise kick off a
  // competing, uncoordinated measure() - since measure() is async
  // (awaits nextTick before reading the card's real height), one of
  // these can still be in flight when ensureRoomForCard() finishes and
  // reveals the card, resolving moments later and overwriting the
  // carefully-corrected targetRect with a mid-correction snapshot -
  // exactly the kind of post-reveal reposition this component exists to
  // prevent. Once revealed, the listener resumes for genuine user
  // scrolling (keeping the card tracking the target as the page moves).
  const onScroll = () => { if (!correcting) measure() }
  window.addEventListener('scroll', onScroll, true)
  onUnmounted(() => {
    window.removeEventListener('resize', measure)
    window.removeEventListener('scroll', onScroll, true)
  })
}

const spotlightStyle = computed(() => {
  const r = targetRect.value
  if (!r) return {}
  const pad = 6
  return {
    top: `${r.top - pad}px`,
    left: `${r.left - pad}px`,
    width: `${r.width + pad * 2}px`,
    height: `${r.height + pad * 2}px`,
  }
})

const injectPos = computed(() => !!targetRect.value)
const injectStyle = computed(() => {
  const r = targetRect.value
  if (!r) return {}
  const vw = typeof window !== 'undefined' ? window.innerWidth : 360
  const cardWidth = Math.min(vw - 32, 360)
  // Anchor centered horizontally, just below the target (or above if near bottom).
  const vh = typeof window !== 'undefined' ? window.innerHeight : 640
  // Prefer ABOVE the highlighted element — on phone screens the target is
  // often lower on the page, so anchoring below pushed the card's bottom
  // off the visible viewport. Only fall back to below when there's
  // genuinely not enough room above even after ensureRoomForCard()'s
  // corrective scroll - which itself falls back to securing room BELOW
  // instead when above turns out to be unreachable (target near the top
  // of the whole page), so this same wantAbove check stays accurate
  // either way. Uses the card's REAL measured height, not a guess.
  const cardHeight = injectHeight.value
  // >= , not > : ensureRoomForCard()'s own "is above already secured?"
  // check (below) is r.top - needed < EDGE_MARGIN, and its scroll target
  // lands EXACTLY on that boundary by construction. A strict > here
  // disagreed with that at the boundary - ensureRoomForCard considered
  // the correction successful while this recomputed "not quite" and fell
  // through to the un-secured below branch anyway, overlapping the
  // target on any step where the correction was needed at all. >= is the
  // exact logical complement of ensureRoomForCard's < check, so the two
  // can never disagree.
  const wantAbove = r.top - cardHeight - GAP >= EDGE_MARGIN
  const top = wantAbove
    ? Math.max(r.top - cardHeight - GAP, EDGE_MARGIN)
    : Math.min(r.top + r.height + GAP, vh - cardHeight - EDGE_MARGIN)
  const left = Math.max(16, Math.min(vw - cardWidth - 16, r.left + r.width / 2 - cardWidth / 2))
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${cardWidth}px`,
  }
})
</script>

<style scoped>
/* Click-capture only - fully transparent so the spotlight underneath dims
   only the area *outside* the target rect (via its inverted box-shadow).
   No backdrop-filter here: blurring the whole viewport hides what the
   tour is actually pointing at. */
.cm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: transparent;
  pointer-events: auto;
}

/* Spotlight = transparent rect with a massive outer box-shadow that paints
   the dim over everything except the target, plus a teal ring + soft glow
   so the active card pops. Pulsing the ring (not the dim) keeps the
   highlighted card perfectly stable. */
.cm-spotlight {
  position: fixed;
  border-radius: 18px;
  background: transparent;
  box-shadow:
    0 0 0 9999px rgba(35, 29, 69, 0.62),
    0 0 0 3px rgba(0, 161, 154, 0.95),
    0 0 24px 4px rgba(0, 161, 154, 0.45);
  pointer-events: none;
  transition:
    top 0.32s cubic-bezier(0.2, 0.8, 0.2, 1),
    left 0.32s cubic-bezier(0.2, 0.8, 0.2, 1),
    width 0.32s cubic-bezier(0.2, 0.8, 0.2, 1),
    height 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
  animation: cm-spotlightPulse 1.9s ease-in-out infinite;
}
@keyframes cm-spotlightPulse {
  0%,
  100% {
    box-shadow:
      0 0 0 9999px rgba(35, 29, 69, 0.62),
      0 0 0 3px rgba(0, 161, 154, 0.95),
      0 0 22px 3px rgba(0, 161, 154, 0.4);
  }
  50% {
    box-shadow:
      0 0 0 9999px rgba(35, 29, 69, 0.62),
      0 0 0 3px rgba(0, 161, 154, 1),
      0 0 38px 8px rgba(0, 161, 154, 0.6);
  }
}
@media (prefers-reduced-motion: reduce) {
  .cm-spotlight {
    animation: none;
  }
}

.cm-inject {
  position: fixed;
  background: #fff;
  border: 1.5px solid #e2f1ea;
  border-radius: 16px;
  padding: 16px 18px 14px;
  box-shadow: 0 16px 40px rgba(35, 29, 69, 0.35);
  font-family: inherit;
  color: #231d45;
  z-index: 1001;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.cm-inject--visible {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .cm-inject {
    transition: none;
  }
}
.cm-inject-step {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #007e78;
  margin-bottom: 6px;
}
.cm-inject-title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #231d45;
  margin-bottom: 6px;
  line-height: 1.25;
}
.cm-inject-body {
  font-size: 12.5px;
  font-weight: 500;
  color: #4a4566;
  line-height: 1.55;
  letter-spacing: -0.05px;
  margin-bottom: 14px;
}
.cm-inject-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.cm-inject-dots { display: flex; gap: 5px; align-items: center; }
.cm-inject-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ececef;
  transition: all 0.2s;
}
.cm-inject-dot.active {
  background: #00a19a;
  width: 16px;
  border-radius: 3px;
}
.cm-inject-btns { display: flex; gap: 8px; align-items: center; }
.cm-inject-skip {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #6b6783;
  cursor: pointer;
  padding: 6px 10px;
}
.cm-inject-skip:hover { color: #231d45; }
.cm-inject-next {
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  letter-spacing: -0.1px;
}
.cm-inject-next:hover { background: #00b6ae; }
</style>
