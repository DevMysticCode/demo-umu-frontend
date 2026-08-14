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
              <!-- Closed cover — GSAP-driven (rotationY tweened directly via
                   JS/rAF each frame rather than a CSS @keyframes + class
                   toggle, which measured zero intermediate frames). -->
              <div class="pa-layer pa-cover-layer">
                <img
                  v-if="phase !== 'idle'"
                  ref="coverEl"
                  src="/op-icons/passportview/umu-passport.png"
                  alt=""
                  class="pa-cover-closed"
                  :class="{ 'pa-glow': phase === 'close' && closeSettled }"
                />
              </div>

              <div
                v-if="phase === 'open' || phase === 'stamp' || phase === 'points' || phase === 'hold' || (phase === 'close' && !closeSettled)"
                ref="openWrapEl"
                class="pa-layer pa-open-wrap"
              >
                <img src="/op-icons/rewards/passportOpenBase.png" alt="" class="pa-open-base" />
                <!-- Shadow the cover casts on the pages while still mostly
                     closed over them — fades out in sync with the cover's
                     rotation so the book reads as "revealed" by the cover
                     swinging away, not as a separate thing fading in on its
                     own beat. -->
                <div ref="shadeEl" class="pa-open-shade" />
              </div>

              <!-- Stamp tool drops onto the open book, impacts, holds, then
                   lifts away leaving the ink impression — no title/body/
                   checklist text on the page, just the physical action. -->
              <div
                v-if="phase === 'stamp' || phase === 'points' || phase === 'hold' || (phase === 'close' && !closeSettled)"
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
                    <StampFrame :icon-asset="stampAsset" :size="112" />
                  </div>
                </Transition>
              </div>
            </div>

            <Transition name="pa-fade-up">
              <div v-if="phase === 'points' || phase === 'hold'" class="pa-points-card">
                <div class="pa-points-check">✓</div>
                <div>
                  <div class="pa-points-amt">+{{ pointsAwarded }} points</div>
                  <div class="pa-points-sub">Added to your rewards balance</div>
                  <div class="pa-points-balance">{{ animatedBalance.toLocaleString('en-GB') }} points</div>
                </div>
              </div>
            </Transition>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import gsap from 'gsap'
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

type Phase = 'idle' | 'enter' | 'open' | 'stamp' | 'points' | 'hold' | 'close'
type StampStep = 'idle' | 'entering' | 'impact' | 'holding' | 'lifting' | 'done'

const phase = ref<Phase>('idle')
const stampStep = ref<StampStep>('idle')
const closeSettled = ref(false)
const reducedMotion = ref(false)

const coverEl = ref<HTMLImageElement | null>(null)
const openWrapEl = ref<HTMLDivElement | null>(null)
const shadeEl = ref<HTMLDivElement | null>(null)

function gsapTween(target: unknown, vars: gsap.TweenVars): Promise<void> {
  return new Promise((resolve) => {
    if (!target) {
      resolve()
      return
    }
    gsap.to(target, { ...vars, onComplete: resolve })
  })
}

const { value: animatedBalance, start: startBalanceCountUp } = useCountUp()

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let cancelled = false

async function runSequence() {
  cancelled = false

  phase.value = 'enter'
  await nextTick()

  // No per-element transformPerspective here — .pa-scene already establishes
  // a single perspective on the whole 3D scene (see CSS). Stacking a second,
  // element-local perspective on top of that compounded into the warped,
  // "off" vanishing point that read as unrealistic.
  gsap.set(coverEl.value, {
    scale: 0.6,
    y: 70,
    rotationY: 0,
    opacity: 0,
    transformOrigin: 'left center',
  })
  await gsapTween(coverEl.value, { scale: 1, y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
  if (cancelled) return

  phase.value = 'open'
  await nextTick()
  // The open book sits fully formed UNDER the cover from the first frame
  // of this phase (not faded/scaled in separately on its own delayed
  // beat) — the shade over it starts fully opaque, standing in for the
  // shadow the still-mostly-closed cover casts on the pages. Both the
  // cover's rotation and the shade's fade run the same duration/ease so
  // the "reveal" reads as one continuous motion (cover swings away,
  // shadow lifts with it) rather than two separately-timed animations
  // that happen to overlap.
  gsap.set(openWrapEl.value, { scale: 1, opacity: 1 })
  gsap.set(shadeEl.value, { opacity: 1 })
  const openVars: gsap.TweenVars = { duration: 0.95, ease: 'power2.out' }
  const coverOpenP = gsapTween(coverEl.value, { rotationY: -100, ...openVars })
  const shadeP = gsapTween(shadeEl.value, { opacity: 0, ...openVars })
  await Promise.all([coverOpenP, shadeP])
  if (cancelled) return

  // Brief hold on the settled-open page before the stamp starts — reads as
  // "the pages finished opening" rather than the stamp cutting in
  // immediately off the end of the opening motion.
  await sleep(300)
  if (cancelled) return

  phase.value = 'stamp'
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
  startBalanceCountUp(Math.max(0, props.balanceAfter - props.pointsAwarded), props.balanceAfter, 1100)
  await sleep(1400)
  if (cancelled) return

  phase.value = 'hold'
  await sleep(800)
  if (cancelled) return

  phase.value = 'close'
  await nextTick()
  const coverCloseP = gsapTween(coverEl.value, {
    rotationY: 0,
    duration: 0.8,
    ease: 'power2.out',
  })
  const bookOutP = gsapTween(openWrapEl.value, {
    scale: 0.92,
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: 'power1.in',
  })
  await Promise.all([coverCloseP, bookOutP])
  if (cancelled) return
  closeSettled.value = true
  await sleep(700)
  if (cancelled) return

  finish()
}

function finish() {
  emit('done')
}

function skip() {
  cancelled = true
  gsap.killTweensOf(coverEl.value)
  gsap.killTweensOf(openWrapEl.value)
  gsap.killTweensOf(shadeEl.value)
  finish()
}

function resetState() {
  phase.value = 'idle'
  stampStep.value = 'idle'
  closeSettled.value = false
  gsap.killTweensOf(coverEl.value)
  gsap.killTweensOf(openWrapEl.value)
  gsap.killTweensOf(shadeEl.value)
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
  aspect-ratio: 798 / 699;
}
/* Each phase's visual (closed cover / open book) is its own absolutely
   positioned, centered layer stacked on .pa-book rather than a flex
   sibling — during the enter/open/close transition both can be in the
   DOM at once (cross-fading), and flexbox would otherwise squeeze them
   into sharing width instead of overlapping in the same spot. */
.pa-layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pa-cover-layer {
  z-index: 2;
}

/* Closed cover. Transform/opacity are owned entirely by GSAP (see
   runSequence()) — it tweens rotationY directly via JS/rAF on every frame
   rather than a CSS animation-name + class toggle, which is what wasn't
   rendering its intermediate frames reliably. Only static, never-animated
   properties live here: backface-visibility is what makes the cover
   disappear once GSAP has rotated it edge-on to the camera (~90deg+), the
   same way a real swinging door vanishes via perspective foreshortening —
   opacity:0 is just the pre-JS default so there's no flash before the
   first gsap.set() runs on mount. */
.pa-cover-closed {
  width: 52%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.4));
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  opacity: 0;
}
@keyframes pa-glow-pulse {
  0% {
    filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 0 rgba(0, 161, 154, 0));
  }
  50% {
    filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 24px rgba(0, 161, 154, 0.7));
  }
  100% {
    filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 0 rgba(0, 161, 154, 0));
  }
}
.pa-cover-closed.pa-glow {
  animation: pa-glow-pulse 1.4s ease-out 0.1s;
}

/* Open book — position comes from .pa-layer (absolute + flex-centered);
   this element stays a valid containing block for .pa-stamp-area and
   .pa-open-shade regardless. Transform/opacity are GSAP-owned (tweens in
   runSequence()), same reasoning as the cover above — opacity:0 here is
   just the pre-JS default before the 'open' phase sets it visible. */
.pa-open-wrap {
  width: 100%;
  z-index: 1;
  opacity: 0;
  position: relative;
}
.pa-open-base {
  width: 100%;
  height: auto;
  display: block;
}
/* Shadow the still-mostly-closed cover casts over the pages — GSAP-owned
   opacity (fades 1 -> 0 in sync with the cover's rotation, see
   runSequence()). Darker toward the spine (left) since that's the part
   still nearest the closing cover for longest. */
.pa-open-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(10, 15, 44, 0.55) 0%, rgba(10, 15, 44, 0.15) 55%, rgba(10, 15, 44, 0) 85%);
  pointer-events: none;
  opacity: 0;
}

/* Stamp lands centered on the open book — no left/right page split since
   there's no text to balance against, just the physical stamp action. */
.pa-stamp-area {
  position: absolute;
  z-index: 4;
  top: 25%;
  bottom: 29%;
  left: 18%;
  right: 18%;
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

/* Points card */
.pa-points-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
  max-width: 280px;
  width: 100%;
}
.pa-points-check {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f2faf8;
  color: #00a19a;
  display: grid;
  place-items: center;
  font-weight: 800;
  flex-shrink: 0;
}
.pa-points-amt {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.pa-points-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}
.pa-points-balance {
  font-size: 11px;
  font-weight: 700;
  color: #00817c;
  margin-top: 4px;
}
</style>
