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
            <div class="pa-book" :class="{ 'pa-book--video': videoAvailable }">
              <!-- Video-primary path: this ONE clip covers closed -> open
                   (and reverse for close) — the "cover" and "open pages"
                   are literally the same object throughout, so there's
                   no separate static image to accidentally leave visible
                   once the video hides (that was the earlier bug: a
                   static cover image stayed mounted at full opacity and
                   re-surfaced once the video layer's v-show turned off).
                   Always mounted (not gated by phase) so it starts
                   preloading the moment this component exists, well
                   before any celebration is actually triggered — by the
                   time runSequence() needs to know if it's usable, it
                   almost always already does. -->
              <div class="pa-layer pa-video-layer" v-show="videoAvailable && phase !== 'idle'">
                <video
                  ref="bookVideoEl"
                  class="pa-book-video"
                  muted
                  playsinline
                  preload="auto"
                  @loadeddata="onVideoLoaded"
                  @error="onVideoError"
                >
                  <source src="/op-icons/rewards/passportOpenClose.mp4" type="video/mp4" />
                </video>
              </div>

              <!-- Fallback path — GSAP-driven cover + static open-page
                   image — only rendered once we're SURE the video isn't
                   usable (not during the brief loading-uncertainty
                   window; see runSequence()'s startup gate), so the two
                   paths can never both be on screen at once. -->
              <template v-if="videoErrored">
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
                  v-if="phase === 'open' || phase === 'stamp' || phase === 'content' || phase === 'points' || phase === 'hold' || (phase === 'close' && !closeSettled)"
                  ref="openWrapEl"
                  class="pa-layer pa-open-wrap"
                >
                  <img src="/op-icons/rewards/passportOpenBase.png" alt="" class="pa-open-base" />
                </div>
              </template>

              <!-- Stamp + text overlay — shared by both paths, sitting on
                   top of whichever "open book" visual is active. Exact
                   position differs (see .pa-book--video overrides in
                   <style>) since the video's framing is a tighter crop
                   than the static fallback image. -->
              <template
                v-if="
                  phase === 'stamp' ||
                  phase === 'content' ||
                  phase === 'points' ||
                  phase === 'hold' ||
                  (phase === 'close' && !closeSettled)
                "
              >
                <div class="pa-page pa-page-left">
                  <img
                    v-if="stampStep !== 'idle' && stampStep !== 'done'"
                    src="/op-icons/rewards/stampTool.png"
                    alt=""
                    class="pa-stamp-tool"
                    :class="stampStep"
                  />
                  <Transition name="pa-fade">
                    <div v-if="stampStep === 'lifting' || stampStep === 'done'" class="pa-impression">
                      <StampFrame :title="achievementTitle" :icon-asset="stampAsset" :size="88" />
                    </div>
                  </Transition>
                </div>

                <div class="pa-page pa-page-right">
                  <h2 v-if="typedHeading" class="pa-heading">
                    {{ typedHeading }}<span v-if="typingField === 'heading'" class="pa-caret" />
                  </h2>
                  <p v-if="typedSubtitle" class="pa-subtitle">
                    {{ typedSubtitle }}<span v-if="typingField === 'subtitle'" class="pa-caret" />
                  </p>
                  <p v-if="typedBody" class="pa-body">
                    {{ typedBody }}<span v-if="typingField === 'body'" class="pa-caret" />
                  </p>
                  <Transition name="pa-fade-up">
                    <ul v-if="showChecklist" class="pa-checks">
                      <li v-for="c in fullChecklist" :key="c">
                        <span class="pa-check-tick">✓</span>{{ c }}
                      </li>
                    </ul>
                  </Transition>
                </div>
              </template>
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
import type { Ref } from 'vue'
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

type Phase = 'idle' | 'enter' | 'open' | 'stamp' | 'content' | 'points' | 'hold' | 'close'
type StampStep = 'idle' | 'entering' | 'impact' | 'holding' | 'lifting' | 'done'
type TypingField = 'heading' | 'subtitle' | 'body' | null

const phase = ref<Phase>('idle')
const stampStep = ref<StampStep>('idle')
const closeSettled = ref(false)
const reducedMotion = ref(false)

// Cover open/close — GSAP-driven (option 2). The CSS rotateY +
// backface-visibility version measured zero intermediate frames even in
// a desktop browser (see git history / conversation), which pointed at
// something breaking the CSS animation-name restart rather than a pure
// rendering-engine 3D limitation. GSAP tweens the transform via direct
// JS/rAF updates instead of a CSS @keyframes + class-toggle, sidestepping
// that mechanism entirely. Cover stays mounted for the whole sequence
// (not remounted per phase via v-if) so GSAP never loses track of its
// current rotation between phases.
const coverEl = ref<HTMLImageElement | null>(null)
const openWrapEl = ref<HTMLDivElement | null>(null)

function gsapTween(target: unknown, vars: gsap.TweenVars): Promise<void> {
  return new Promise((resolve) => {
    if (!target) {
      resolve()
      return
    }
    gsap.to(target, { ...vars, onComplete: resolve })
  })
}
function gsapTweenFrom(target: unknown, from: gsap.TweenVars, vars: gsap.TweenVars): Promise<void> {
  return new Promise((resolve) => {
    if (!target) {
      resolve()
      return
    }
    gsap.fromTo(target, from, { ...vars, onComplete: resolve })
  })
}

// Option 3 — pre-rendered video IS the book (closed -> open, and reverse
// for close) — see public/op-icons/rewards/passportOpenClose.mp4. Only
// the FORWARD "opening" clip is needed; "closing" is the same clip played
// backward via manual currentTime stepping (most browsers don't support
// video.playbackRate < 0 reliably).
//
// Three-state loading model (not just a boolean) because the template
// needs to distinguish "still loading, don't know yet" from "confirmed
// unusable" — showing the GSAP/static-image fallback during the merely-
// unknown window would risk the same double-image bug this replaced
// (both paths rendering because neither was confirmed yet).
//   videoAvailable = false, videoErrored = false  -> unknown (loading)
//   videoAvailable = true                          -> use the video
//   videoErrored = true                             -> use the fallback
const bookVideoEl = ref<HTMLVideoElement | null>(null)
const videoAvailable = ref(false)
const videoErrored = ref(false)

function onVideoLoaded() {
  videoAvailable.value = true
}
function onVideoError() {
  videoErrored.value = true
}

// The video element is mounted unconditionally (not gated by phase), so
// it's typically been preloading for as long as this component has
// existed — well before the specific celebration that calls this was
// triggered. This is just a small safety margin for the rare case a
// celebration fires immediately on mount, not the primary wait.
async function waitForVideoDecision(maxMs = 400) {
  const start = Date.now()
  while (!videoAvailable.value && !videoErrored.value && Date.now() - start < maxMs) {
    await sleep(30)
  }
}

function playVideoForward(el: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    try {
      el.pause()
      el.playbackRate = 1
      el.currentTime = 0
    } catch {
      /* not seekable yet — play from wherever it is */
    }
    const onEnded = () => {
      el.removeEventListener('ended', onEnded)
      resolve()
    }
    el.addEventListener('ended', onEnded)
    el.play().catch(() => resolve())
  })
}

function playVideoReverse(el: HTMLVideoElement, duration: number): Promise<void> {
  return new Promise((resolve) => {
    el.pause()
    const stepSeconds = 1 / 30
    let raf = 0
    const step = () => {
      if (cancelled) {
        cancelAnimationFrame(raf)
        resolve()
        return
      }
      const next = el.currentTime - stepSeconds
      if (next <= 0.02) {
        el.currentTime = 0
        resolve()
        return
      }
      el.currentTime = next
      raf = requestAnimationFrame(step)
    }
    el.currentTime = duration
    raf = requestAnimationFrame(step)
  })
}

// Typewriter reveal for the right-page copy — the passport-book cross-fade
// on its own read as an abrupt cut ("video-gamey"); typing the words in
// gives the content phase the same unhurried, handwritten feel as the
// stamp ceremony itself.
const typedHeading = ref('')
const typedSubtitle = ref('')
const typedBody = ref('')
const showChecklist = ref(false)
const typingField = ref<TypingField>(null)

const { value: animatedBalance, start: startBalanceCountUp } = useCountUp()

const verifiedOnLabel = computed(() => {
  const d = new Date(props.completedAt)
  if (Number.isNaN(d.getTime())) return null
  return `Verified on ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
})
const fullChecklist = computed(() => {
  const items = [...(props.achievementChecks ?? [])]
  if (verifiedOnLabel.value) items.push(verifiedOnLabel.value)
  return items
})

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let cancelled = false

function typewrite(target: Ref<string>, text: string, msPerChar: number) {
  return new Promise<void>((resolve) => {
    target.value = ''
    if (!text) {
      resolve()
      return
    }
    let i = 0
    const id = setInterval(() => {
      if (cancelled) {
        clearInterval(id)
        resolve()
        return
      }
      i++
      target.value = text.slice(0, i)
      if (i >= text.length) {
        clearInterval(id)
        resolve()
      }
    }, msPerChar)
  })
}

async function runSequence() {
  cancelled = false
  await waitForVideoDecision()
  if (cancelled) return

  phase.value = 'enter'
  await nextTick()

  if (videoAvailable.value && bookVideoEl.value) {
    // Video-primary path: the clip itself IS the closed book — just hold
    // on its first frame for a beat rather than separately animating our
    // own static cover image in. This is what fixes the earlier bug (a
    // static cover left mounted at full opacity resurfacing once the
    // video's own v-show turned off) — there's only ever one visual now.
    try {
      bookVideoEl.value.pause()
      bookVideoEl.value.currentTime = 0
    } catch {
      /* not seekable yet */
    }
    await sleep(500)
    if (cancelled) return

    phase.value = 'open'
    await playVideoForward(bookVideoEl.value)
    // Deliberately stays paused on its last (fully-open) frame — that
    // frame IS the backdrop for the stamp/content/points/hold phases
    // below, still the same <video> element, nothing else to show/hide.
    if (cancelled) return
    // Brief hold on the settled-open page before the stamp starts — reads
    // as "the pages finished opening" rather than the stamp cutting in
    // immediately off the end of the opening motion.
    await sleep(400)
  } else {
    // GSAP fallback (option 2) — only once the video is CONFIRMED
    // unusable (videoErrored), never during the merely-unknown loading
    // window (see waitForVideoDecision above).
    gsap.set(coverEl.value, {
      scale: 0.6,
      y: 70,
      rotationY: 0,
      opacity: 0,
      transformPerspective: 1000,
      transformOrigin: 'left center',
    })
    await gsapTween(coverEl.value, { scale: 1, y: 0, opacity: 1, duration: 1, ease: 'power3.out' })
    if (cancelled) return

    phase.value = 'open'
    await nextTick()
    // Cover swings open on a real 3D hinge (rotationY), GSAP-driven so the
    // transform is set directly via JS/rAF each frame rather than a CSS
    // @keyframes animation-name — backface-visibility (set in CSS) makes it
    // vanish naturally once it's rotated edge-on to the camera, same as a
    // real door. The open book underneath fades/grows in a beat later so
    // the two motions read as sequential rather than a straight swap.
    const coverOpenP = gsapTween(coverEl.value, {
      rotationY: -100,
      duration: 1.1,
      ease: 'power2.inOut',
    })
    const bookInP = (async () => {
      await sleep(450)
      if (cancelled) return
      await gsapTweenFrom(
        openWrapEl.value,
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.9, ease: 'power2.out' },
      )
    })()
    await Promise.all([coverOpenP, bookInP])
  }
  if (cancelled) return

  phase.value = 'stamp'
  stampStep.value = 'entering'
  await sleep(400)
  if (cancelled) return
  stampStep.value = 'impact'
  await sleep(150)
  if (cancelled) return
  stampStep.value = 'holding'
  await sleep(200)
  if (cancelled) return
  stampStep.value = 'lifting'
  await sleep(450)
  if (cancelled) return
  stampStep.value = 'done'

  phase.value = 'content'
  typingField.value = 'heading'
  await typewrite(typedHeading, props.achievementTitle, 30)
  if (cancelled) return
  await sleep(120)
  if (cancelled) return

  if (props.achievementSubtitle) {
    typingField.value = 'subtitle'
    await typewrite(typedSubtitle, props.achievementSubtitle, 22)
    if (cancelled) return
    await sleep(120)
    if (cancelled) return
  }

  if (props.achievementDescription) {
    typingField.value = 'body'
    await typewrite(typedBody, props.achievementDescription, 12)
    if (cancelled) return
    await sleep(150)
    if (cancelled) return
  }
  typingField.value = null

  showChecklist.value = true
  await sleep(500)
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
  if (videoAvailable.value && bookVideoEl.value) {
    // Reverse-play the same clip back down to its first frame — still the
    // same single <video> element throughout, nothing to swap or reveal.
    await playVideoReverse(bookVideoEl.value, bookVideoEl.value.duration || 1.3)
  } else {
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
  }
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
  bookVideoEl.value?.pause()
  finish()
}

function resetState() {
  phase.value = 'idle'
  stampStep.value = 'idle'
  closeSettled.value = false
  typedHeading.value = ''
  typedSubtitle.value = ''
  typedBody.value = ''
  showChecklist.value = false
  typingField.value = null
  gsap.killTweensOf(coverEl.value)
  gsap.killTweensOf(openWrapEl.value)
  bookVideoEl.value?.pause()
  // videoAvailable/videoErrored deliberately NOT reset here — they
  // reflect whether the asset itself loaded, which doesn't change
  // between celebration replays.
  if (bookVideoEl.value) {
    try {
      bookVideoEl.value.currentTime = 0
    } catch {
      /* not seekable yet */
    }
  }
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
/* The Kling-generated clip is a much tighter portrait crop than the old
   static open-book PNG (520:734 vs 798:699 landscape) — the book fills
   almost the whole frame rather than sitting with generous margin. Sized
   by HEIGHT (not width like the default above): at 100% width, this
   portrait ratio made the book taller than the viewport on typical phone
   screens, cropping it top/bottom and pushing the points card off the
   bottom edge. Constraining height and letting width follow keeps the
   whole book on screen with room for the points card below it. */
.pa-book--video {
  width: auto;
  height: min(46vh, 380px);
  max-width: 100%;
  aspect-ratio: 520 / 734;
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
.pa-video-layer {
  z-index: 3;
}
.pa-book-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* Closed cover. Transform/opacity are owned entirely by GSAP now (see
   runSequence() in the script) — it tweens rotationY directly via JS/rAF
   on every frame rather than a CSS animation-name + class toggle, which
   is what wasn't rendering its intermediate frames reliably. Only static,
   never-animated properties live here: backface-visibility is what makes
   the cover disappear once GSAP has rotated it edge-on to the camera
   (~90deg+), the same way a real swinging door vanishes via perspective
   foreshortening — opacity:0 is just the pre-JS default so there's no
   flash before the first gsap.set() runs on mount. */
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
   this element stays a valid containing block for its own absolutely-
   positioned .pa-page children regardless. Transform/opacity are GSAP-
   owned (fromTo/to tweens in runSequence()), same reasoning as the cover
   above — opacity:0 here is just the pre-JS default. */
.pa-open-wrap {
  width: 100%;
  z-index: 1;
  opacity: 0;
}
.pa-open-base {
  width: 100%;
  height: auto;
  display: block;
}
/* Bounds measured directly against the printed page area in
   passportOpenBase.png (pixel-sampled, not eyeballed) — the book is
   rendered at a slight 3D angle with curved page corners, so a naive
   symmetric inset crowded text against the real (photographed) top
   edge. left page's clean content area: x 18-48%, right page: x 55-89%;
   both: y 25-71%. */
.pa-page {
  position: absolute;
  /* Explicit z-index (not auto) so this always paints above
     .pa-video-layer (z-index: 3) — an element with an explicit z-index
     stacks above z-index:auto siblings regardless of DOM order, so
     without this the stamp/text overlay would render invisibly behind
     the video. */
  z-index: 4;
  top: 25%;
  bottom: 29%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2%;
}
.pa-page-left {
  left: 18%;
  width: 30%;
}
.pa-page-right {
  left: 55%;
  width: 34%;
  align-items: flex-start;
  text-align: left;
  justify-content: flex-start;
  overflow: hidden;
}
/* Video path — bounds pixel-sampled against the actual clip's last
   (settled-open) frame, not the static PNG above: the book fills nearly
   the whole tightly-cropped portrait frame, and the right page runs
   close enough to the frame's own right edge that text needs a bigger
   inset to avoid crowding it. */
.pa-book--video .pa-page {
  top: 22%;
  bottom: 36%;
}
.pa-book--video .pa-page-left {
  left: 12%;
  width: 32%;
}
.pa-book--video .pa-page-right {
  left: 56%;
  width: 28%;
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
  width: 44%;
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

/* Right page text */
.pa-heading {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  margin: 0 0 6px;
  text-transform: uppercase;
  line-height: 1.25;
}
.pa-caret {
  display: inline-block;
  width: 2px;
  height: 0.9em;
  margin-left: 2px;
  background: currentColor;
  vertical-align: -0.1em;
  animation: pa-caret-blink 0.9s step-end infinite;
}
@keyframes pa-caret-blink {
  0%, 50% {
    opacity: 1;
  }
  50.01%, 100% {
    opacity: 0;
  }
}
.pa-subtitle {
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
  margin: 0 0 8px;
}
.pa-body {
  font-size: 11.5px;
  color: #6b6151;
  line-height: 1.5;
  margin: 0 0 10px;
}
.pa-checks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.pa-checks li {
  font-size: 11px;
  font-weight: 600;
  color: #3a3327;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.pa-check-tick {
  color: #00817c;
  font-weight: 800;
  flex-shrink: 0;
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
