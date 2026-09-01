<template>
  <Teleport to="body">
    <Transition name="pa-overlay-fade">
      <div v-if="visible" class="pa-overlay" :style="{ background: overlayBg }" role="dialog" aria-modal="true" :aria-label="achievementTitle">
        <!-- Reduced motion: spec §17 — skip the ceremony entirely, show a
             plain accessible confirmation instead of the book/stamp visual. -->
        <div v-if="reducedMotion" class="pa-static">
          <div class="pa-static-check">✓</div>
          <div class="pa-static-title">{{ achievementTitle }}</div>
          <div class="pa-static-points">+{{ pointsAwarded }} points added</div>
          <button class="pa-static-btn" type="button" @click="finish">Continue</button>
        </div>

        <template v-else>
          <button class="pa-skip" :class="{ 'pa-skip--dark': overlayIsDark }" type="button" aria-label="Skip" @click="skip">Skip</button>

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
                    <StampFrame :title="achievementTitle" :size="96" />
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

// The opening video isn't full-bleed (capped by .pa-scene's max-width and
// centered), so it sits as a boxed clip on the overlay. The video's own
// footage fades its backdrop from white to black a couple of seconds in —
// without this, the flat white .pa-overlay behind it never follows, so the
// clip visibly "pops" into a dark box floating on a white screen instead of
// reading as part of the same scene.
//
// Fixed by live-sampling a corner pixel of the actual decoded video frame
// every animation frame and mirroring it onto the overlay's background —
// rather than a fixed-timing CSS transition, which would drift out of sync
// whenever autoplay is delayed by buffering (slow connection, cold cache).
// Reading real pixels also means this keeps matching automatically if the
// source video is ever re-exported with different timing.
const overlayBg = ref('#ffffff')
// Tracks whether the sampled backdrop has gone dark, so the Skip button
// (a dark-on-light chip, legible on the white start frame) can switch to a
// light-on-dark treatment once the overlay follows the video to black —
// otherwise it'd fade to near-invisible for most of the ceremony.
const overlayIsDark = ref(false)
let sampleCanvas: HTMLCanvasElement | null = null
let sampleCtx: CanvasRenderingContext2D | null = null
let sampleRafId: number | null = null
// Guards the loop rather than relying solely on cancelAnimationFrame — a
// direct one-shot call (see the final sample in runSequence below) can
// still have an earlier loop iteration's frame in flight, and that stray
// callback would otherwise keep rescheduling itself forever once its id is
// no longer the one stopSampling() knows about.
let sampling = false

// Draws a 1x1 crop of the video's top-left corner (inset from the edge,
// clear of the book/stamp artwork at every point in the clip) into an
// offscreen canvas and reads that pixel back — the actual decoded backdrop
// color, not a guess. Returns false if the video has no frame data yet.
function sampleOnce(el: HTMLVideoElement): boolean {
  if (el.readyState < 2 || !el.videoWidth) return false
  if (!sampleCanvas) {
    sampleCanvas = document.createElement('canvas')
    sampleCanvas.width = 1
    sampleCanvas.height = 1
    sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })
  }
  if (!sampleCtx) return false
  try {
    const sx = el.videoWidth * 0.03
    const sy = el.videoHeight * 0.03
    sampleCtx.drawImage(el, sx, sy, 2, 2, 0, 0, 1, 1)
    const [r, g, b] = sampleCtx.getImageData(0, 0, 1, 1).data
    overlayBg.value = `rgb(${r}, ${g}, ${b})`
    overlayIsDark.value = 0.299 * r + 0.587 * g + 0.114 * b < 128
    return true
  } catch {
    /* frame not decoded yet this tick */
    return false
  }
}

function sampleLoop() {
  if (!sampling) return
  const el = openingVideoEl.value
  if (el) sampleOnce(el)
  sampleRafId = requestAnimationFrame(sampleLoop)
}

function startSampling() {
  sampling = true
  sampleRafId = requestAnimationFrame(sampleLoop)
}

// Stops the loop and takes one last direct sample so the overlay locks in
// the video's true final color (it holds its last frame from 'ended'
// onward) instead of whatever partial color the loop happened to leave.
function stopSampling() {
  sampling = false
  if (sampleRafId != null) {
    cancelAnimationFrame(sampleRafId)
    sampleRafId = null
  }
  if (openingVideoEl.value) sampleOnce(openingVideoEl.value)
}

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
  startSampling()
  await waitForVideo(openingVideoEl.value)
  // No need to keep sampling every frame through the rest of the
  // stamp/points/hold phases — the video holds its last frame from here on
  // (see comment below), so the color is already settled.
  stopSampling()
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
  sampling = false
  if (sampleRafId != null) {
    cancelAnimationFrame(sampleRafId)
    sampleRafId = null
  }
  openingVideoEl.value?.pause?.()
  finish()
}

function resetState() {
  phase.value = 'idle'
  stampStep.value = 'idle'
  overlayBg.value = '#ffffff'
  overlayIsDark.value = false
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
      sampling = false
      if (sampleRafId != null) {
        cancelAnimationFrame(sampleRafId)
        sampleRafId = null
      }
      resetState()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  sampling = false
  if (sampleRafId != null) cancelAnimationFrame(sampleRafId)
})
</script>

<style scoped>
.pa-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  /* Default/fallback — overridden by the inline :style binding (overlayBg),
     which live-tracks the opening video's own backdrop color so the screen
     darkens in step with the clip instead of staying flat white behind it. */
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
  transition: background 0.3s ease, color 0.3s ease;
}
.pa-skip--dark {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
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

/* Stamp lands on the LEFT-hand page of the opened passport (measured
   against the opening video's actual last frame: the left page spans
   roughly x 11-48%, y 16-82% of the frame — this box sits inset within
   that, so the stamp reads as fully on the left page rather than
   straddling the spine into the middle of the spread). */
.pa-stamp-area {
  position: absolute;
  z-index: 4;
  top: 20%;
  bottom: 30%;
  left: 14%;
  right: 54%;
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
