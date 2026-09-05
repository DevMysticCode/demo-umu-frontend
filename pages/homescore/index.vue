<template>
  <div class="hs-page">
    <!-- ── Top nav: back · eyebrow pill · tour ──────────────────────── -->
    <div class="hs-topnav">
      <button class="hs-back" @click="router.back()" aria-label="Back">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="hs-eyebrow-pill"><span class="hs-pulse" />HomeScore</div>
      <div class="hs-topnav-spacer" />
    </div>

    <!-- ── Hero ─────────────────────────────────────────────────────── -->
    <div class="hs-hero">
      <div class="hs-hero-text">
        <div class="hs-hero-title">
          Discover what <span class="lt-teal">any</span> UK home is really
          telling you.
        </div>
        <div class="hs-hero-sub">
          Search any UK address to compare running costs, energy performance and
          public property insights in seconds.
        </div>
      </div>
      <img
        src="/op-icons/landing/homeScoreCard.png"
        alt=""
        class="hs-hero-house"
      />
    </div>

    <!-- ── Search ───────────────────────────────────────────────────── -->
    <div class="hs-search-block">
      <div class="hs-search-wrap">
        <PropertySearchInput
          placeholder="Postcode or address"
          variant="light"
          :show-passport-status="true"
          @select="onResultSelect"
          @enter="onSearchEnter"
        />
      </div>

      <div class="hs-meta-row">
        <span class="hs-meta-item">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Free
        </span>
        <span class="hs-meta-item">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Instant
        </span>
        <span class="hs-meta-item">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          No account needed
        </span>
      </div>
    </div>

    <!-- ── Real story card ─────────────────────────────────────────── -->
    <div ref="realStoryEl" class="hs-real-story">
      <div class="hs-real-story-bar" />
      <svg class="hs-real-story-leaves" viewBox="0 0 40 28" aria-hidden="true">
        <path d="M9 2c5 0 9 5.5 9 12s-4 12-9 12S0 20.5 0 14 4 2 9 2z" />
        <path d="M31 2c5 0 9 5.5 9 12s-4 12-9 12-9-5.5-9-12S26 2 31 2z" />
      </svg>
      <div class="hs-real-story-body">
        <div class="hs-real-story-eyebrow">
          <span class="hs-real-story-eyebrow-dot" aria-hidden="true" />
          Real story
        </div>
        <div class="hs-real-story-quote" :aria-label="realStoryQuote">
          <span>{{ typedQuote }}</span>
          <span v-if="!typingDone" class="hs-typer-caret" aria-hidden="true" />
        </div>
        <div class="hs-real-story-text">
          Energy suppliers estimate usage using assumptions. Sometimes
          they're wrong. HomeScore compares public EPC data and highlights
          when something doesn't look right.
        </div>
      </div>
      <img
        src="/op-icons/homescore/wallet.png"
        alt=""
        class="hs-real-story-icon"
      />
    </div>

    <!-- ── Live activity ───────────────────────────────────────────── -->
    <div class="hs-live-row">
      <span class="hs-live-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </span>
      <span class="hs-live-text"
        ><strong>{{ lastHourCount }} HomeScores</strong> run in the last
        hour</span
      >
    </div>

    <!-- ── How it works ───────────────────────────────────────────── -->
    <div class="hs-section-h-row">
      <div class="hs-section-h">How it works</div>
    </div>

    <div class="hs-steps-list">
      <div v-for="(step, i) in howSteps" :key="i" class="hs-step-row">
        <img :src="step.icon" alt="" class="hs-step-icon" />
        <div class="hs-step-body">
          <div class="hs-step-title-row">
            <span class="hs-step-num">{{ i + 1 }}</span>
            <span class="hs-step-title">{{ step.title }}</span>
          </div>
          <div class="hs-step-sub">{{ step.sub }}</div>
        </div>
      </div>
    </div>

    <!-- ── Powered by OpenProperty ─────────────────────────────────── -->
    <div class="hs-powered-by">
      <div class="hs-powered-eyebrow">Powered by</div>
      <img
        src="/op-icons/opLogo.png"
        alt="OpenProperty"
        class="hs-powered-logo"
      />
      <div class="hs-powered-name">OpenProperty</div>
      <div class="hs-powered-tag">Property data infrastructure</div>
    </div>

    <div style="height: 24px" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'

const router = useRouter()

// ── Typewriter for the "Real story" quote ────────────────────────────
// Drives attention to the most important piece of social proof on the
// landing page. Holds at the full string once finished. Triggered on
// scroll-into-view so it actually animates in front of the user, not
// silently above the fold while the page is still loading.
const realStoryQuote =
  '"My neighbour was being charged £150 a month extra - her supplier thought she had a swimming pool."'
const typedQuote = ref('')
const typingDone = ref(false)
const realStoryEl = ref<HTMLElement | null>(null)
let typerTimer: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null

function runTyper() {
  if (typingDone.value || typedQuote.value.length > 0) return
  let i = 0
  const step = () => {
    typedQuote.value = realStoryQuote.slice(0, i + 1)
    i++
    if (i < realStoryQuote.length) {
      // Tiny per-char jitter so it reads as a person typing, not a tape.
      const ch = realStoryQuote[i - 1]
      const delay = ch === ' ' ? 18 : ch === ',' || ch === '.' ? 90 : 28
      typerTimer = setTimeout(step, delay)
    } else {
      typingDone.value = true
    }
  }
  step()
}

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') {
    runTyper()
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          runTyper()
          observer?.disconnect()
          observer = null
          break
        }
      }
    },
    { threshold: 0.4 },
  )
  if (realStoryEl.value) observer.observe(realStoryEl.value)
})

onBeforeUnmount(() => {
  if (typerTimer) clearTimeout(typerTimer)
  observer?.disconnect()
})

function onResultSelect(property: any) {
  // HomeScore detail is the page's main purpose — go there directly.
  // Street compare is reachable from the "See street comparison" button on
  // the detail page itself.
  router.push(`/homescore/${property.id}`)
}

function onSearchEnter(_q: string) {
  // PropertySearchInput already opens its dropdown on enter.
}

// function onCheckClick() {
//   const input = document.querySelector<HTMLInputElement>(
//     '.hs-search-wrap input',
//   )
//   input?.focus()
// }

// ── How it works — fixed 3 steps (no audience tabs) ──────────────────
const howSteps = [
  {
    title: 'Search any UK address',
    sub: 'Enter a postcode or street name to instantly view its HomeScore.',
    icon: '/op-icons/explore/propertySearch.png',
  },
  {
    title: 'See how the property compares',
    sub: 'Compare running costs, energy efficiency and public property information with similar homes.',
    icon: '/op-icons/investment/growthChart.png',
  },
  {
    title: 'Know more about the home',
    sub: 'Spot potential issues, understand where money could be saved and know what to investigate next.',
    icon: '/op-icons/homescore/clipboard.png',
  },
]

// ── Real "N HomeScores run in the last hour" count ────────────────────
const config = useRuntimeConfig()
const lastHourCount = ref(0)
onMounted(async () => {
  try {
    const res: any = await $fetch(
      `${config.public.apiBase}/property/activity/last-hour`,
    )
    lastHourCount.value = res?.count ?? 0
  } catch {
    /* stays at 0 on failure */
  }
})
</script>

<style scoped>
.hs-page {
  min-height: 100dvh;
  background: #fff;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Top nav ──────────────────────────────────────────────────────── */
.hs-topnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 8px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.hs-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  display: grid;
  place-items: center;
  color: #00a19a;
  cursor: pointer;
}
.hs-back svg {
  width: 14px;
  height: 14px;
}
.hs-topnav-spacer {
  width: 32px;
}

.hs-eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #00a19a;
  text-transform: uppercase;
}
.hs-pulse {
  width: 6px;
  height: 6px;
  background: #00a19a;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #e2f1ea;
}

/* ── Hero ─────────────────────────────────────────────────────────── */
.hs-hero {
  padding: 18px 24px 14px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.hs-hero-text {
  flex: 1;
  min-width: 0;
}
.hs-hero-house {
  width: 164px;
  height: 164px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 2px;
}
.hs-hero-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #231d45;
  margin-bottom: 12px;
}
.hs-hero-title .lt-teal {
  color: #00a19a;
}
.hs-hero-sub {
  font-size: 15px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.55;
  letter-spacing: -0.05px;
}

/* ── Search ───────────────────────────────────────────────────────── */
.hs-search-block {
  padding: 8px 24px 0;
}

.hs-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1.5px solid #00a19a;
  border-radius: 14px;
  padding: 4px 4px 4px 10px;
  transition: all 0.15s;
  /* Pulsing teal halo to draw the eye to the primary CTA. Pauses once the
     user focuses the field so the highlight doesn't fight the cursor. */
  animation: hsSearchPulse 2.2s ease-in-out infinite;
}
@keyframes hsSearchPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(0, 161, 154, 0.55), 0 0 0 0 rgba(0, 161, 154, 0.18);
    border-color: #00a19a;
  }
  50% {
    box-shadow: 0 0 0 6px rgba(0, 161, 154, 0),
      0 0 18px 4px rgba(0, 161, 154, 0.28);
    border-color: #00c4bc;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hs-search-wrap {
    animation: none;
  }
}
/* Make the dropdown span the full width of the outer search shell, not just
   the inner input's narrower column. We do this by making .psi-wrap
   non-positioned so the dropdown's `position: absolute` resolves against
   .hs-search-wrap instead. */
.hs-search-wrap :deep(.psi-wrap) {
  position: static !important;
}
.hs-search-wrap :deep(.psi-drop) {
  left: 0;
  right: 0;
  width: auto;
  top: calc(100% + 8px);
}
.hs-search-wrap:focus-within {
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.1);
  /* Stop pulsing once the user starts typing - the halo's job is done. */
  animation: none;
}
/* Make the embedded PropertySearchInput visually flat - the outer wrap is the shell */
.hs-search-wrap :deep(> div),
.hs-search-wrap :deep(.property-search) {
  flex: 1;
  min-width: 0;
}
.hs-search-wrap :deep(input) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  /* Keep ~38px left padding so the absolutely-positioned .psi-icon at left:14px
     doesn't overlap the typed text. */
  padding: 11px 4px 11px 38px !important;
  font-size: 14px;
  font-weight: 600;
  color: #231d45;
  outline: none !important;
}
.hs-search-wrap :deep(input::placeholder) {
  color: #9c98ad;
  font-weight: 500;
}
.hs-search-go {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  padding: 9px 14px;
  border-radius: 10px;
  cursor: pointer;
  letter-spacing: -0.1px;
  flex-shrink: 0;
  transition: background 0.15s;
}
.hs-search-go:hover {
  background: #00b6ae;
}

.hs-meta-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #231d45;
  font-weight: 700;
  margin: 12px 0 6px;
}
.hs-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.hs-meta-item svg {
  width: 12px;
  height: 12px;
  color: #00a19a;
}

/* ── Real story card ──────────────────────────────────────────── */
/* Made deliberately more prominent than the plain white card it used
   to be: gradient teal-wash background, larger scale, floating quote
   mark decoration, animated pulse-dot eyebrow, and a subtle glow so it
   stands out from the surrounding page. */
.hs-real-story {
  margin: 18px 22px 0;
  background: linear-gradient(160deg, #e9f6f5 0%, #f5fbfa 55%, #ffffff 100%);
  border: 1.5px solid #b7e4e1;
  border-radius: 20px;
  padding: 20px 20px 20px 26px;
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 10px;
  box-shadow: 0 8px 22px rgba(0, 161, 154, 0.14),
    0 2px 6px rgba(0, 161, 154, 0.08);
}
.hs-real-story::before {
  /* Soft teal halo in the top-right corner */
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(
    circle at center,
    rgba(0, 161, 154, 0.16),
    transparent 70%
  );
  pointer-events: none;
}
.hs-real-story-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: linear-gradient(180deg, #00c4bc 0%, #00a19a 60%, #007e78 100%);
  border-radius: 5px 0 0 5px;
}
.hs-real-story-leaves {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 22px;
  height: 16px;
  fill: rgba(35, 29, 69, 0.1);
  pointer-events: none;
  z-index: 0;
}
.hs-real-story-icon {
  width: 136px;
  height: 136px;
  object-fit: contain;
  flex-shrink: 0;
  align-self: center;
  position: relative;
  z-index: 1;
}
.hs-real-story-body {
  padding-left: 6px;
  flex: 1;
  position: relative;
  z-index: 1;
}
.hs-real-story-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.hs-real-story-eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00a19a;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.2);
  animation: hsPulse 2s ease-in-out infinite;
}
@keyframes hsPulse {
  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.2);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(0, 161, 154, 0.05);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hs-real-story-eyebrow-dot {
    animation: none;
  }
}
.hs-real-story-quote {
  font-size: 15px;
  font-weight: 800;
  color: #007e78;
  line-height: 1.4;
  margin-bottom: 6px;
  letter-spacing: -0.1px;
  /* Reserve roughly two lines of vertical space while typing so the rest of
     the page below doesn't reflow up as characters appear. */
  min-height: 2.8em;
}
.hs-typer-caret {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #00a19a;
  margin-left: 2px;
  vertical-align: -2px;
  animation: hsCaretBlink 0.9s steps(1) infinite;
}
@keyframes hsCaretBlink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hs-typer-caret {
    animation: none;
  }
}
.hs-real-story-text {
  font-size: 13px;
  color: #6b6783;
  line-height: 1.5;
  font-weight: 500;
}

/* ── Powered by OpenProperty (footer) ─────────────────────────── */
.hs-powered-by {
  text-align: center;
  padding: 36px 22px 20px;
}
.hs-powered-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.hs-powered-logo {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: block;
  margin: 0 auto 8px;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.2);
  object-fit: cover;
}
.hs-powered-name {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.hs-powered-tag {
  font-size: 13px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 2px;
}

/* ── Live row ─────────────────────────────────────────────────────── */
.hs-live-row {
  margin: 14px 24px 0;
  padding: 10px 14px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.05px;
}
.hs-live-text {
  color: #231d45;
}
.hs-live-row strong {
  color: #00a19a;
  font-weight: 800;
}
.hs-live-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.hs-live-icon svg {
  width: 13px;
  height: 13px;
}

/* ── How it works ─────────────────────────────────────────────────── */
.hs-section-h-row {
  padding: 26px 24px 8px;
}
.hs-section-h {
  font-size: 13px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

/* Steps - icon + numbered title, connecting dotted line between numbers */
.hs-steps-list {
  padding: 4px 22px 0;
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.hs-step-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.hs-step-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  flex-shrink: 0;
}
.hs-step-body {
  flex: 1;
  min-width: 0;
  padding-top: 6px;
}
.hs-step-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}
.hs-step-row:not(:last-child) .hs-step-num::after {
  content: '';
  position: absolute;
  top: 26px;
  left: 12px;
  width: 1.5px;
  height: 42px;
  border-left: 1.5px dashed #cfe9e6;
}
.hs-step-num {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #00a19a;
  color: #00a19a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}
.hs-step-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
  line-height: 1.25;
}
.hs-step-sub {
  font-size: 13.5px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.5;
  letter-spacing: -0.05px;
  margin-top: 6px;
  padding-left: 34px;
}
</style>
