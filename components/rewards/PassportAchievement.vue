<template>
  <Teleport to="body">
    <Transition name="pa-overlay-fade">
      <div v-if="visible" class="pa-overlay" role="dialog" aria-modal="true" :aria-label="achievementTitle">
        <!-- Reduced motion: spec §17 — skip the ceremony entirely, show a
             plain accessible confirmation instead of the book/stamp visual. -->
        <div v-if="reducedMotion" class="pa-static">
          <div class="pa-static-check">✓</div>
          <div class="pa-static-title">{{ achievementTitle }}</div>
          <div class="pa-static-points">+{{ pointsAwarded }} points added</div>
          <button class="pa-static-btn" type="button" @click="finish">Continue</button>
        </div>

        <template v-else>
          <!-- Everything below is pinned to the app's own mobile-container
               width (28rem), same convention as BaseDrawer - the overlay
               backdrop still covers the full viewport, but Teleport-to-body
               otherwise escapes .mobile-container entirely, so on a wider
               browser window Skip and the whole scene used to drift out to
               the real window edges instead of staying within the simulated
               phone frame (client report, 9 Oct 2026). -->
          <div class="pa-frame">
            <button class="pa-skip" type="button" aria-label="Skip" @click="skip">Skip</button>

            <!-- Confetti burst, timed with the points reveal - kept to CSS
                 shapes/positions (no image/animation library) so the extra
                 flourish stays light. -->
            <div v-if="phase === 'points' || phase === 'hold'" class="pa-confetti" aria-hidden="true">
              <span v-for="(c, i) in confetti" :key="i" class="pa-confetti-piece" :class="c.shape" :style="c.style" />
            </div>

            <div class="pa-scene">
              <div class="pa-book">
                <!-- Static artwork of the open passport, with a quick CSS
                     scale/fade entrance instead of decoding a multi-MB video
                     on every stamp (client report, 9 Oct 2026: the video
                     celebration "comes late" and fades to a black backdrop
                     that didn't look good). This is the same held-open frame
                     the old clip settled on, just not run through a video
                     decoder to get there — the stamp lands on it exactly as
                     before. -->
                <img
                  v-if="phase !== 'idle'"
                  src="/op-icons/rewards/passportOpenBase.png"
                  class="pa-book-img"
                  alt=""
                />

                <!-- Stamp tool drops onto the opened passport artwork,
                     impacts, holds, then lifts away leaving the ink
                     impression. -->
                <div
                  v-if="phase === 'stamp' || phase === 'points' || phase === 'hold'"
                  class="pa-stamp-area"
                >
                  <img
                    v-if="stampStep !== 'idle' && stampStep !== 'done'"
                    src="/op-icons/rewards/stampTool.png"
                    alt=""
                    class="pa-stamp-tool"
                    :class="stampStep"
                  />
                  <Transition name="pa-fade">
                    <div v-if="stampStep === 'lifting' || stampStep === 'done'" class="pa-impression">
                      <StampFrame :title="achievementTitle" :size="96" />
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Points — plain glowing text, no card/background, so it
                   reads as part of the same scene as the book + stamp
                   rather than a separate boxed element. -->
              <Transition name="pa-fade-up">
                <div v-if="phase === 'points' || phase === 'hold'" class="pa-points-hero">
                  <div class="pa-points-num">+{{ animatedPoints.toLocaleString('en-GB') }}</div>
                  <div class="pa-points-label">Points Earned</div>
                  <p v-if="achievementSubtitle" class="pa-points-message">{{ achievementSubtitle }}</p>
                </div>
              </Transition>
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import StampFrame from './StampFrame.vue'

interface Props {
  visible: boolean
  achievementId: string
  stampAsset?: string | null
  achievementTitle: string
  achievementSubtitle?: string | null
  achievementDescription?: string | null
  achievementChecks?: string[] | null
  pointsAwarded: number
  completedAt: string
  balanceAfter: number
}

const props = withDefaults(defineProps<Props>(), {
  stampAsset: null,
  achievementSubtitle: null,
  achievementDescription: null,
  achievementChecks: () => [],
})

const emit = defineEmits<{ (e: 'done'): void }>()

type Phase = 'idle' | 'opening' | 'stamp' | 'points' | 'hold'
type StampStep = 'idle' | 'entering' | 'impact' | 'holding' | 'lifting' | 'done'

const phase = ref<Phase>('idle')
const stampStep = ref<StampStep>('idle')
const reducedMotion = ref(false)

// Fixed (not random-per-render) so the layout is stable/testable — a mix
// of small rotated rounded-rect pieces and sparkle characters scattered
// around the book, same idiom as SectionCompleteCelebration's confetti.
const confetti = [
  { shape: 'rect', style: 'left:4%; top:8%; background:#14b8a6; transform:rotate(-18deg);' },
  { shape: 'rect', style: 'left:14%; top:2%; background:#a78bfa; transform:rotate(24deg);' },
  { shape: 'spark', style: 'left:8%; top:20%; color:#00817c;' },
  { shape: 'rect', style: 'left:2%; top:36%; background:#38bdf8; transform:rotate(10deg);' },
  { shape: 'spark', style: 'left:20%; top:42%; color:#fbbf24;' },
  { shape: 'rect', style: 'right:4%; top:8%; background:#38bdf8; transform:rotate(16deg);' },
  { shape: 'rect', style: 'right:16%; top:2%; background:#fbbf24; transform:rotate(-20deg);' },
  { shape: 'spark', style: 'right:8%; top:22%; color:#00817c;' },
  { shape: 'rect', style: 'right:2%; top:38%; background:#a78bfa; transform:rotate(-12deg);' },
  { shape: 'spark', style: 'right:22%; top:44%; color:#fbbf24;' },
  { shape: 'rect', style: 'left:34%; top:0%; background:#14b8a6; transform:rotate(8deg);' },
  { shape: 'rect', style: 'right:34%; top:0%; background:#a78bfa; transform:rotate(-8deg);' },
]

// Counts up 0 -> pointsAwarded (not a running balance total — the
// redesigned points display shows just "+N Points Earned", matching the
// reference: no card, no balance line).
const { value: animatedPoints, start: startPointsCountUp } = useCountUp()

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let cancelled = false

async function runSequence() {
  cancelled = false

  // Static artwork + a quick CSS scale/fade (see .pa-book-img-enter below) —
  // replaces what used to be a multi-second video decode+playback wait.
  phase.value = 'opening'
  await sleep(450)
  if (cancelled) return

  // This whole stamp sub-sequence totals ~2s, matching the requested
  // "hold for 2 seconds and put the stamp" pause before closing.
  phase.value = 'stamp'
  await sleep(300)
  if (cancelled) return
  stampStep.value = 'entering'
  await sleep(400)
  if (cancelled) return
  stampStep.value = 'impact'
  await sleep(150)
  if (cancelled) return
  stampStep.value = 'holding'
  await sleep(400)
  if (cancelled) return
  stampStep.value = 'lifting'
  await sleep(450)
  if (cancelled) return
  stampStep.value = 'done'
  await sleep(300)
  if (cancelled) return

  phase.value = 'points'
  startPointsCountUp(0, props.pointsAwarded, 900)
  await sleep(1400)
  if (cancelled) return

  phase.value = 'hold'
  await sleep(1400)
  if (cancelled) return

  // No closing video — the whole overlay fades out via the Transition
  // already wrapping it (pa-overlay-fade), which is triggered by visible
  // going false once the parent reacts to 'done'.
  finish()
}

function finish() {
  emit('done')
}

function skip() {
  cancelled = true
  finish()
}

function resetState() {
  phase.value = 'idle'
  stampStep.value = 'idle'
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      reducedMotion.value = prefersReducedMotion()
      resetState()
      if (!reducedMotion.value) runSequence()
    } else {
      cancelled = true
      resetState()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.pa-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  /* Flat light backdrop, consistent with the rest of the app — no video
     frame to track a fade-to-black against anymore, so this never needs
     to change at runtime. */
  background: #faf9f6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
}
.pa-overlay-fade-enter-active,
.pa-overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.pa-overlay-fade-enter-from,
.pa-overlay-fade-leave-to {
  opacity: 0;
}

/* Constrains the whole celebration to the app's mobile-container width
   (28rem), same convention BaseDrawer uses — .pa-overlay stays a
   full-viewport backdrop, but everything a viewer actually looks at lives
   inside this frame instead of spreading across a wide desktop window. */
.pa-frame {
  position: relative;
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
}

.pa-skip {
  position: absolute;
  top: calc(16px + env(safe-area-inset-top));
  right: 16px;
  background: rgba(35, 29, 69, 0.06);
  color: #231d45;
  border: none;
  border-radius: 100px;
  padding: 8px 16px;
  font-size: 0.7813rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  z-index: 2;
  transition: background 0.3s ease, color 0.3s ease;
}

/* Confetti burst - fixed shapes/positions (no animation library), each
   piece pops in with a staggered scale/fade so the points reveal feels
   more like a moment than a plain number appearing. */
.pa-confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
.pa-confetti-piece {
  position: absolute;
  animation: pa-confetti-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
.pa-confetti-piece:nth-child(odd) { animation-delay: 0.05s; }
.pa-confetti-piece:nth-child(3n) { animation-delay: 0.12s; }
.pa-confetti-piece:nth-child(4n) { animation-delay: 0.18s; }
.pa-confetti-piece.rect {
  width: 9px;
  height: 15px;
  border-radius: 3px;
  opacity: 0.9;
}
.pa-confetti-piece.spark {
  font-size: 1rem;
  color: inherit;
}
.pa-confetti-piece.spark::before {
  content: '✦';
}
@keyframes pa-confetti-pop {
  from {
    opacity: 0;
    transform: scale(0.4) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ── Reduced-motion static confirmation ── */
.pa-static {
  background: #fff;
  border: 1px solid #eef0f6;
  box-shadow: 0 12px 32px rgba(35, 29, 69, 0.12);
  border-radius: 20px;
  padding: 32px 28px;
  max-width: 320px;
  width: 100%;
  text-align: center;
}
.pa-static-check {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #00a19a;
  color: #fff;
  font-size: 1.625rem;
  font-weight: 800;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
}
.pa-static-title {
  font-size: 1.125rem;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 8px;
}
.pa-static-points {
  font-size: 0.875rem;
  font-weight: 700;
  color: #00817c;
  margin-bottom: 20px;
}
.pa-static-btn {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 14px;
  font-size: 0.875rem;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}

/* ── Scene ── */
.pa-scene {
  perspective: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  position: relative;
  z-index: 2;
}
.pa-book {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* No fixed aspect-ratio, no card treatment - sized by the image's own
   intrinsic dimensions, no border-radius/shadow so it sits directly on
   the overlay's own background rather than reading as a boxed card. */
.pa-book-img {
  width: 100%;
  height: auto;
  display: block;
  animation: pa-book-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes pa-book-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Stamp lands on the LEFT-hand page of the opened passport. Bounds
   measured directly against passportOpenBase.png's actual pixels (not
   eyeballed): the left page spans roughly x 12-41%, y 15.5-72% of the
   image - this box sits centered within that, so the stamp reads as
   properly centered on the left page rather than drifting toward the
   spine (client report, 9 Oct 2026). */
.pa-stamp-area {
  position: absolute;
  z-index: 4;
  top: 18%;
  bottom: 34%;
  left: 15%;
  right: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stamp tool + impression - centered explicitly via top/left/translate(-50%,-50%)
   baked into every transform value, rather than relying on the (spec-correct
   but inconsistently-supported on older WebViews) static-position-of-an-
   absolute-flex-child behavior. Every keyframe below starts from that same
   translate(-50%,-50%) base and appends its own motion on top of it. */
.pa-stamp-tool {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 46%;
  object-fit: contain;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.3));
  transform: translate(-50%, -50%) translateY(-140%) scale(0.85);
  opacity: 0;
}
.pa-stamp-tool.entering {
  animation: pa-stamp-enter 0.4s cubic-bezier(0.5, 0, 0.75, 0.35) forwards;
}
.pa-stamp-tool.impact {
  animation: pa-stamp-impact 0.15s ease-out forwards;
}
.pa-stamp-tool.holding {
  transform: translate(-50%, -50%) translateY(0) scale(1);
  opacity: 1;
}
.pa-stamp-tool.lifting {
  animation: pa-stamp-lift 0.45s cubic-bezier(0.4, 0, 0.6, 1) forwards;
}
@keyframes pa-stamp-enter {
  from {
    transform: translate(-50%, -50%) translateY(-140%) scale(0.85);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) translateY(0) scale(1);
    opacity: 1;
  }
}
@keyframes pa-stamp-impact {
  0% {
    transform: translate(-50%, -50%) translateY(0) scale(1, 1);
  }
  50% {
    transform: translate(-50%, -50%) translateY(2%) scale(1.04, 0.93);
  }
  100% {
    transform: translate(-50%, -50%) translateY(0) scale(1, 1);
  }
}
@keyframes pa-stamp-lift {
  from {
    transform: translate(-50%, -50%) translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -50%) translateY(-130%) scale(0.85);
    opacity: 0;
  }
}
.pa-impression {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pa-fade-up-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.pa-fade-up-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.pa-fade-enter-active {
  transition: opacity 0.4s ease;
}
.pa-fade-enter-from {
  opacity: 0;
}

/* Points - plain glowing text, no card/background/shadow (per the
   reference: a big chunky "+N" with a soft glow behind it, floating
   directly on the scene, "POINTS EARNED" underneath). The 3D-bevel look
   is approximated with a gradient fill + stacked text-shadows, since a
   true rendered-PNG bevel can't be replicated in flat CSS text. */
.pa-points-hero {
  position: relative;
  text-align: center;
  padding: 8px 0 4px;
}
.pa-points-hero::before {
  content: '';
  position: absolute;
  inset: -30px -20px;
  background: radial-gradient(closest-side, rgba(20, 184, 166, 0.28), transparent 70%);
  z-index: -1;
}
.pa-points-num {
  font-size: clamp(40px, 12vw, 56px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.01em;
  /* Solid, dark app-aqua fill - the previous pale gradient (near-white at
     the top) washed out against the white overlay background and was
     hard to read. */
  color: #00817c;
  text-shadow: 0 3px 0 rgba(0, 129, 124, 0.18), 0 8px 18px rgba(0, 129, 124, 0.3);
}
.pa-points-label {
  margin-top: 4px;
  font-size: 0.875rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #00817c;
}
.pa-points-message {
  margin: 10px 0 0;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: #6b7089;
  max-width: 280px;
}
</style>
