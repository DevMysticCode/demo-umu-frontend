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
          <button class="pa-skip" type="button" aria-label="Skip" @click="skip">Skip</button>

          <div class="pa-scene">
            <div class="pa-book">
              <!-- Real footage of the passport physically opening. Plays
                   once; on 'ended' the element naturally holds its last
                   frame (no need to freeze it manually) for the rest of the
                   celebration — that held frame is the backdrop the stamp
                   drops onto, and stays put through points and the fade-out. -->
              <video
                v-if="phase !== 'idle'"
                ref="openingVideoEl"
                src="/op-icons/rewards/passportOpening.mp4"
                class="pa-video"
                muted
                playsinline
                autoplay
              />

              <!-- Stamp tool drops onto the right side of the opened
                   passport (held on the opening video's last frame),
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
                    <StampFrame :title="achievementTitle" :size="120" />
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Points — plain glowing text, no card/background, so it
                 reads as part of the same scene as the video + stamp
                 rather than a separate boxed element. -->
            <Transition name="pa-fade-up">
              <div v-if="phase === 'points' || phase === 'hold'" class="pa-points-hero">
                <div class="pa-points-num">+{{ animatedPoints.toLocaleString('en-GB') }}</div>
                <div class="pa-points-label">Points Earned</div>
              </div>
            </Transition>
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

const openingVideoEl = ref<HTMLVideoElement | null>(null)

// Counts up 0 -> pointsAwarded (not a running balance total — the
// redesigned points display shows just "+N Points Earned", matching the
// reference: no card, no balance line).
const { value: animatedPoints, start: startPointsCountUp } = useCountUp()

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Waits for the video's 'ended' event. A fallback timer (well above either
// clip's real ~5s length) guarantees the celebration can never get stuck
// even if a WebView silently blocks autoplay or the file fails to decode.
function waitForVideo(el: HTMLVideoElement | null, fallbackMs = 8000): Promise<void> {
  return new Promise((resolve) => {
    if (!el) {
      resolve()
      return
    }
    let settled = false
    const finishOnce = () => {
      if (settled) return
      settled = true
      el.removeEventListener('ended', finishOnce)
      resolve()
    }
    el.addEventListener('ended', finishOnce, { once: true })
    setTimeout(finishOnce, fallbackMs)
    el.play?.().catch(() => {
      /* autoplay attribute already asked for this — the fallback timer
         covers a WebView that silently refuses both */
    })
  })
}

let cancelled = false

async function runSequence() {
  cancelled = false

  phase.value = 'opening'
  await nextTick()
  await waitForVideo(openingVideoEl.value)
  if (cancelled) return

  // The opening video's element naturally holds on its final frame once
  // 'ended' fires — that's the "stopped open" backdrop the stamp lands on.
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
  openingVideoEl.value?.pause?.()
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
  background: #ffffff;
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

.pa-skip {
  position: absolute;
  top: calc(16px + env(safe-area-inset-top));
  right: 16px;
  background: rgba(35, 29, 69, 0.06);
  color: #231d45;
  border: none;
  border-radius: 100px;
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  z-index: 2;
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
  font-size: 26px;
  font-weight: 800;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
}
.pa-static-title {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 8px;
}
.pa-static-points {
  font-size: 14px;
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
  font-size: 14px;
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
  max-width: min(94vw, 460px);
}
.pa-book {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* No fixed aspect-ratio, no card treatment — sized by the video's own
   intrinsic dimensions, no border-radius/shadow so it sits directly on
   the overlay's own background rather than reading as a boxed card. */
.pa-video {
  width: 100%;
  height: auto;
  display: block;
}

/* Stamp lands on the right-hand page of the opened passport (measured
   against the opening video's actual last frame: the right page spans
   roughly x 52-89%, y 16-82% of the frame — this box sits inset within
   that). Horizontally centered on the whole spread rather than the right
   page specifically, nudged slightly left of dead-center per feedback. */
.pa-stamp-area {
  position: absolute;
  z-index: 4;
  top: 20%;
  bottom: 22%;
  left: 26%;
  right: 40%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stamp tool + impression — centered explicitly via top/left/translate(-50%,-50%)
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

/* Points — plain glowing text, no card/background/shadow (per the
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
  /* Solid, dark app-aqua fill — the previous pale gradient (near-white at
     the top) washed out against the white overlay background and was
     hard to read. */
  color: #00817c;
  text-shadow: 0 3px 0 rgba(0, 129, 124, 0.18), 0 8px 18px rgba(0, 129, 124, 0.3);
}
.pa-points-label {
  margin-top: 4px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #00817c;
}
</style>
