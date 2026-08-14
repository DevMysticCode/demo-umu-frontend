<template>
  <div class="hs-v6-levelup">
    <!-- Header: back button + centered "Quiz complete" label -->
    <div class="lu-mini-header">
      <button
        class="lu-back"
        type="button"
        @click="$emit('back')"
        aria-label="Back"
      >
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
      <div class="lu-header-title">
        <svg class="levelup-eyebrow-ic" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M2 22l3-9 6 6-9 3zm7-8l4-4 5 5-4 4-5-5zm5-5l4-4a3.5 3.5 0 015 5l-4 4-5-5zM17 3l1 1-1 1V4h-1l1-1zm4 4l1 1-1 1V8h-1l1-1zm-2 4l1 1-1 1v-1h-1l1-1z"
          />
        </svg>
        Quiz complete
      </div>
      <div class="lu-header-spacer" />
    </div>

    <!-- Intro: title + house illustration, no card wrapper -->
    <div class="levelup-intro anim-1">
      <div class="levelup-intro-text">
        <div class="levelup-title">You've updated your HomeScore!</div>
        <div class="levelup-sub">
          Your answers show your home is performing better than its public EPC
          record.
        </div>
      </div>
      <div class="levelup-house-wrap">
        <svg
          class="lu-sparkle lu-sparkle--1"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
        </svg>
        <svg
          class="lu-sparkle lu-sparkle--2"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z" />
        </svg>
        <img
          src="/op-icons/landing/homeScoreCard.png"
          alt=""
          class="levelup-house-ic"
        />
      </div>
    </div>

    <!-- Before / Now score card -->
    <div class="levelup-score-card anim-1 level-up">
      <div class="levelup-row">
        <div class="levelup-col">
          <div class="levelup-col-label">BEFORE</div>
          <div class="levelup-circle-wrap">
            <svg
              class="levelup-circle-svg"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <circle class="lc-bg" cx="60" cy="60" r="50" stroke-width="9" />
              <circle
                class="lc-fill lc-fill--from"
                cx="60"
                cy="60"
                r="50"
                stroke-width="9"
                stroke-dasharray="314.16"
                :stroke-dashoffset="fromRingOffset"
                stroke-linecap="round"
                fill="none"
              />
            </svg>
            <div class="levelup-circle-num">
              <div class="lc-big">{{ fromScore }}</div>
              <div class="lc-small">/100</div>
            </div>
          </div>
          <div class="levelup-col-title">Public HomeScore</div>
          <div class="levelup-col-sub">Based on EPC data</div>
          <div v-if="epcRating" class="levelup-epc-pill">
            EPC {{ epcRating }}
          </div>
        </div>
        <div class="levelup-arrow">→</div>
        <div class="levelup-col">
          <div class="levelup-col-label levelup-col-label--now">NOW</div>
          <div class="levelup-circle-wrap">
            <svg
              class="levelup-circle-svg"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="luGrad" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%" stop-color="#00BB93" />
                  <stop offset="100%" stop-color="#016F84" />
                </linearGradient>
              </defs>
              <circle class="lc-bg" cx="60" cy="60" r="50" stroke-width="9" />
              <circle
                class="lc-fill lc-fill--to"
                cx="60"
                cy="60"
                r="50"
                stroke-width="9"
                stroke="url(#luGrad)"
                stroke-dasharray="314.16"
                :stroke-dashoffset="toRingOffset"
                stroke-linecap="round"
                fill="none"
              />
            </svg>
            <div class="levelup-circle-num">
              <div class="lc-big lc-big--to">{{ animatedToScore }}</div>
              <div class="lc-small lc-small--to">/100</div>
            </div>
          </div>
          <div class="levelup-col-title levelup-col-title--now">
            Your refined HomeScore
          </div>
          <div class="levelup-col-sub">Based on what you told us</div>
          <div v-if="epcRating" class="levelup-epc-pill">
            EPC {{ epcRating }}
          </div>
        </div>
      </div>

      <div class="levelup-stats-row">
        <div class="lu-stat-box">
          <span class="lu-stat-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="3 17 9 11 13 15 21 6" />
              <polyline points="15 6 21 6 21 12" />
            </svg>
          </span>
          <div class="lu-stat-text">
            <div class="lu-stat-eyebrow">HomeScore increase</div>
            <div class="lu-stat-val">+{{ delta }}</div>
          </div>
        </div>
        <div class="lu-stat-box">
          <span class="lu-stat-icon lu-stat-icon--img"
            ><img
              src="/op-icons/investment/cashAndCoins.png"
              alt=""
              loading="lazy"
          /></span>
          <div class="lu-stat-text">
            <div class="lu-stat-eyebrow">Estimated bill saving</div>
            <div class="lu-stat-val">£{{ estSavings }}/year</div>
          </div>
        </div>
        <div class="lu-stat-box">
          <span class="lu-stat-icon lu-stat-icon--img"
            ><img
              src="/op-icons/investment/plantSprout.png"
              alt=""
              loading="lazy"
          /></span>
          <div class="lu-stat-text">
            <div class="lu-stat-eyebrow">Lower carbon impact</div>
            <div class="lu-stat-val">{{ carbonSavedDisplay }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- What changed -->
    <div class="section-h-row">
      <div class="section-h">
        What changed
        <span class="section-h-info" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
      </div>
      <div class="section-h-sub">{{ toScore }}/100 points</div>
    </div>
    <div class="refined-stats-card">
      <div
        v-for="s in refinedStats"
        :key="s.id"
        class="stat-row"
        :class="{ gained: s.gain > 0 }"
      >
        <div class="stat-icon">
          <img
            v-if="s.icon && s.icon.startsWith('/')"
            :src="s.icon"
            alt=""
            loading="lazy"
          />
          <template v-else>{{ s.icon }}</template>
        </div>
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-bar-wrap">
          <div
            class="stat-bar-fill"
            :class="s.tone"
            :style="{ width: barsAnimated ? s.pct + '%' : '0%' }"
          />
        </div>
        <div class="stat-value">{{ s.before }} → {{ s.value }}/{{ s.max }}</div>
        <div class="stat-gain-pill" :class="{ zero: s.gain === 0 }">
          {{ s.gain > 0 ? '+' + s.gain : '–' }}
        </div>
      </div>
    </div>

    <!-- Keep going tip -->
    <div class="keep-going-banner">
      <span class="kg-ic" aria-hidden="true">✨</span>
      <div class="kg-body">
        <div class="kg-title">Keep going!</div>
        <div class="kg-sub">
          See what improvements could boost your score further, or build your
          Property Passport to save and verify your home.
        </div>
      </div>
    </div>

    <!-- Bottom tiles: pathway + build passport — exact same layout as the
         "I own this property" / "I'm interested" tiles on the score-result
         screen (fork-tile-icon-top / fork-tile-icon--buyer pattern). -->
    <div class="bottom-cta bottom-cta--tiles">
      <button class="lu-tile lu-tile--pathway" type="button" @click="$emit('open-pathway')">
        <img
          src="/op-icons/homescore/pathwaySignpost.png"
          alt=""
          class="lu-tile-icon-top"
          loading="lazy"
        />
        <div class="lu-tile-title">See my improvement pathway</div>
        <div class="lu-tile-sub">
          See the EPC-recommended improvements, costs and potential savings.
        </div>
        <span class="lu-tile-arrow lu-tile-arrow--pathway">→</span>
      </button>
      <button
        class="lu-tile lu-tile--passport"
        type="button"
        @click="$emit('build-passport')"
      >
        <div class="lu-tile-buyer-body">
          <div class="lu-tile-title">Build my Property Passport</div>
          <div class="lu-tile-sub">
            Create a free account, add documents and build your home's
            verified record.
          </div>
        </div>
        <img
          src="/op-icons/landing/propertyPassportCard.png"
          alt=""
          class="lu-tile-icon--buyer"
          loading="lazy"
        />
        <span class="lu-tile-arrow lu-tile-arrow--passport">→</span>
      </button>
    </div>

    <div class="lu-trust-note">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        width="13"
        height="13"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Your data is secure and private. You're in control.
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useConfetti } from '~/composables/useConfetti'
import { computeHomeScorePillars } from '~/utils/homescorePillars'

interface Props {
  fromScore: number
  toScore: number
  delta: number
  estSavings?: number
  property?: any | null
  /** Per-pillar points earned this quiz session, keyed by pillar id. */
  statGains?: Record<string, number>
  co2Now?: number | null
  co2Potential?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  estSavings: 309,
  property: null,
  statGains: () => ({}),
  co2Now: null,
  co2Potential: null,
})

defineEmits<{
  (e: 'back'): void
  (e: 'open-pathway'): void
  (e: 'open-boost'): void
  (e: 'build-passport'): void
}>()

const { runConfetti } = useConfetti()

// Real EPC certificate letter — fixed regardless of the quiz refinement,
// shown under both circles same as the reference (the EPC itself doesn't
// change, only the live/refined HomeScore does).
const epcRating = computed(() => props.property?.epcRating ?? null)

const animatedToScore = ref(props.fromScore)
const barsAnimated = ref(false)

const CIRCUMFERENCE = 2 * Math.PI * 50 // 314.16, matches the SVG r=50 rings
const fromRingOffset = computed(
  () =>
    CIRCUMFERENCE -
    (Math.max(0, Math.min(100, props.fromScore)) / 100) * CIRCUMFERENCE,
)
const toRingOffset = computed(
  () =>
    CIRCUMFERENCE -
    (Math.max(0, Math.min(100, animatedToScore.value)) / 100) * CIRCUMFERENCE,
)

// Carbon figure scales the full now→potential EPC gap by how much of the
// score gap this quiz session actually closed — a rough but honest
// approximation, since we don't have a per-question CO2 figure to sum.
const carbonSavedDisplay = computed(() => {
  // No score change → no carbon change, regardless of whether we have
  // real co2Now/co2Potential figures for this property. Only reach for
  // the CO2 data when there's an actual delta to translate into a share.
  if (props.delta <= 0) return '0 tonnes/year'
  if (props.co2Now == null || props.co2Potential == null) return '—'
  const totalGap = props.co2Now - props.co2Potential
  const scoreGap = Math.max(1, 100 - props.fromScore)
  const share = Math.max(0, Math.min(1, props.delta / scoreGap))
  const saved = totalGap * share
  if (saved <= 0) return '0 tonnes/year'
  return `~${saved.toFixed(1)} tonnes/year`
})

onMounted(() => {
  // Fire the same confetti burst the onboarding "preferences saved"
  // screen uses — one-shot, tears down its own canvas, respects
  // prefers-reduced-motion. Fires slightly after mount so the level-
  // up hero has finished its own fade-in first.
  setTimeout(() => runConfetti(), 200)

  // Count-up animation for the score
  const start = props.fromScore
  const end = props.toScore
  const duration = 1200
  const startTime = performance.now()
  const tick = (now: number) => {
    const t = Math.min((now - startTime) / duration, 1)
    const ease = 1 - Math.pow(1 - t, 3)
    animatedToScore.value = Math.round(start + (end - start) * ease)
    if (t < 1) requestAnimationFrame(tick)
    else animatedToScore.value = end
  }
  requestAnimationFrame(tick)

  // Stagger bar fill
  setTimeout(() => {
    barsAnimated.value = true
  }, 250)
})

// Real before→after per pillar: "before" comes from the same EPC-based
// formulas the score screen uses (via the shared util so the two screens
// never disagree), "after" adds back whatever this quiz session actually
// earned per pillar (see V6QuizView's statGains emit on finish).
const refinedStats = computed(() => {
  const before = computeHomeScorePillars(props.property)
  return before.map((s) => {
    const gain = Math.max(0, props.statGains?.[s.id] ?? 0)
    const value = Math.min(s.max, s.value + gain)
    return {
      ...s,
      before: s.value,
      value,
      gain: value - s.value,
      pct: Math.round((value / s.max) * 100),
    }
  })
})
</script>

<style scoped>
.hs-v6-levelup {
  --primary: #231d45;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-light: #00b8b0;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --page: #f0f2f8;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --error: #e74c5e;
  --error-light: #f08594;
  --warning: #f5a623;
  --gold: #f0b933;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  position: relative;
  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* Soften prototype's 800-weights to match SF Pro app scale */
.hs-v6-levelup :is(.levelup-title, .lc-big, .stat-value) {
  font-weight: 700;
}
.hs-v6-levelup :is(.levelup-sub, .lu-tile-sub) {
  font-weight: 500;
}

/* App header */
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: relative;
  z-index: 2;
}
.back-btn,
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: all 0.15s;
  flex-shrink: 0;
}
.back-btn:hover,
.app-icon-btn:hover {
  background: var(--accent-paler);
  border-color: var(--accent-pale);
  color: var(--accent-dark);
}
.back-btn svg,
.app-icon-btn svg {
  width: 16px;
  height: 16px;
}
.app-header-info {
  flex: 1;
  min-width: 0;
}
.app-header-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.15;
}
.app-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}

/* Animations */
@keyframes hs-v6-fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes levelGlow {
  0%,
  100% {
    box-shadow: 0 12px 32px -8px rgba(0, 161, 154, 0.3);
  }
  50% {
    box-shadow: 0 12px 32px -8px rgba(0, 161, 154, 0.3),
      0 0 0 8px rgba(0, 161, 154, 0.15);
  }
}
.anim-1 {
  animation: hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Intro — title/sub + house illustration, sits directly on page bg */
.levelup-intro {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 10px 20px 0;
}
.levelup-intro-text {
  flex: 1;
  min-width: 0;
}
.levelup-house-wrap {
  position: relative;
  flex-shrink: 0;
  width: 160px;
  height: 120px;
  margin-top: -6px;
}
.levelup-house-ic {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.lu-sparkle {
  position: absolute;
  width: 12px;
  height: 12px;
  color: var(--accent-light);
  opacity: 0.8;
}
.lu-sparkle--1 {
  top: -4px;
  left: 4px;
}
.lu-sparkle--2 {
  top: 18px;
  right: -6px;
  width: 8px;
  height: 8px;
}
.levelup-eyebrow-ic {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: var(--accent-dark);
}
.levelup-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.6px;
  line-height: 1.15;
  margin-bottom: 6px;
}
.levelup-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Before / Now score card */
.levelup-score-card {
  position: relative;
  z-index: 2;
  margin: 16px 20px 0;
  padding: 22px 18px 18px;
  background: var(--card);
  border: 1.5px solid var(--accent);
  border-radius: 16px;
  box-shadow: 0 12px 32px -8px rgba(0, 161, 154, 0.3);
}
.levelup-score-card.level-up {
  animation: hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both,
    levelGlow 1.5s ease-out 3;
}
.levelup-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
}
.levelup-col {
  flex: 1;
  max-width: 140px;
  text-align: center;
}
.levelup-col-label {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 1.4px;
  margin-bottom: 10px;
}
.levelup-col-label--now {
  color: var(--accent-dark);
}
.levelup-circle-wrap {
  position: relative;
  width: 92px;
  height: 92px;
  flex-shrink: 0;
  margin: 0 auto;
}
.levelup-circle-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.lc-bg {
  fill: none;
  stroke: var(--bg);
}
.lc-fill {
  fill: none;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.lc-fill--from {
  stroke: var(--text-faint);
  opacity: 0.5;
}
.levelup-circle-num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.lc-big {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: -0.8px;
  line-height: 1;
}
.lc-big--to {
  color: var(--accent-dark);
  font-size: 28px;
}
.lc-small {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-faint);
  margin-top: 2px;
}
.lc-small--to {
  color: var(--accent-dark);
}
.levelup-arrow {
  font-size: 22px;
  color: var(--accent);
  font-weight: 800;
  flex-shrink: 0;
  margin-top: 34px;
}
.levelup-col-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-top: 10px;
}
.levelup-col-title--now {
  color: var(--accent-dark);
}
.levelup-col-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
}
.levelup-epc-pill {
  display: inline-block;
  margin-top: 8px;
  padding: 3px 10px;
  background: #fdf1e7;
  color: #b5762f;
  font-size: 10px;
  font-weight: 800;
  border-radius: 100px;
}

.levelup-stats-row {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-soft);
}
.lu-stat-box {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.lu-stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--accent-pale);
  color: var(--accent-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lu-stat-icon svg {
  width: 15px;
  height: 15px;
}
.lu-stat-icon--img {
  border-color: var(--border-soft);
  padding: 4px;
}
.lu-stat-icon--img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.lu-stat-text {
  min-width: 0;
}
.lu-stat-eyebrow {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-secondary);
  line-height: 1.3;
  margin-bottom: 4px;
}
.lu-stat-val {
  font-size: 14px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: -0.2px;
}

/* Section heading */
.section-h-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 18px 20px 10px;
}
.section-h {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.section-h-info {
  display: inline-flex;
  color: var(--text-faint);
}
.section-h-info svg {
  width: 12px;
  height: 12px;
}
.section-h-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-dark);
}

/* Refined stat bars */
.refined-stats-card {
  position: relative;
  z-index: 2;
  margin: 0 20px;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
}
.stat-icon {
  font-size: 14px;
  width: 34px;
  height: 34px;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.stat-label {
  width: 70px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}
.stat-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--bg);
  border-radius: 100px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
}
.stat-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.stat-bar-fill.high {
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}
.stat-bar-fill.mid {
  background: linear-gradient(90deg, var(--warning), var(--gold));
}
.stat-bar-fill.low {
  background: linear-gradient(90deg, var(--error), var(--error-light));
}
.stat-value {
  width: 62px;
  text-align: right;
  font-size: 10px;
  font-weight: 800;
  color: var(--text);
  flex-shrink: 0;
}
.stat-row.gained .stat-value {
  color: var(--accent-dark);
}
.stat-gain-pill {
  width: 30px;
  text-align: center;
  flex-shrink: 0;
  font-size: 10.5px;
  font-weight: 800;
  color: var(--accent-dark);
  background: var(--accent-paler);
  border-radius: 100px;
  padding: 3px 0;
}
.stat-gain-pill.zero {
  color: var(--text-faint);
  background: var(--bg);
}

/* Keep going tip banner */
.keep-going-banner {
  position: relative;
  z-index: 2;
  margin: 16px 20px 0;
  padding: 14px 16px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 14px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.kg-ic {
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1.2;
}
.kg-body {
  flex: 1;
  min-width: 0;
}
.kg-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--accent-dark);
  margin-bottom: 3px;
}
.kg-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.45;
}

/* Bottom CTA */
.bottom-cta {
  position: relative;
  z-index: 2;
  padding: 16px 20px 24px;
}
.bottom-cta--tiles {
  display: flex;
  gap: 10px;
  align-items: stretch;
}
.lu-tile {
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: visible;
  text-align: left;
  border-radius: 16px;
  border: none;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.15s;
}
.lu-tile:hover {
  transform: translateY(-1px);
}
.lu-tile--pathway {
  background: var(--accent-paler);
  padding: 16px 14px 50px;
}
.lu-tile-icon-top {
  width: 60px;
  height: 60px;
  object-fit: contain;
  display: block;
  margin: auto;
  margin-bottom: 10px;
}
.lu-tile-buyer-body {
  padding-right: 8px;
}
.lu-tile-icon--buyer {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin: auto;
}
.lu-tile-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.25;
  margin-bottom: 6px;
}
.lu-tile-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.45;
  padding-right: 4px;
}
.lu-tile-arrow {
  position: absolute;
  right: 14px;
  bottom: 14px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  flex-shrink: 0;
}
.lu-tile-arrow--pathway {
  background: var(--accent-dark);
}
.lu-tile--passport {
  background: #fff;
  border: 1.5px solid var(--accent);
  padding: 16px 14px 50px;
}
.lu-tile-arrow--passport {
  background: var(--accent-dark);
}
.bottom-cta-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.15s;
}
.bottom-cta-btn:hover {
  filter: brightness(1.06);
}
.bottom-cta-secondary {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  background: var(--card);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.bottom-cta-secondary:hover {
  border-color: var(--accent-pale);
  background: var(--accent-paler);
  color: var(--accent-dark);
}
/* Outlined variant — transparent background, accent border (v6-2) */
.bottom-cta-secondary.outlined {
  background: transparent;
  border: 1.5px solid var(--accent);
  color: var(--accent-dark);
}
.bottom-cta-secondary.outlined:hover {
  background: var(--accent-paler);
}
/* 3D illustration inside the two bottom CTAs — replaces the 🎯 and ⚡
   emoji at the front of each button. Sized to sit neatly next to the
   label without overwhelming the button height. */
.bottom-cta-ic {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
  margin-right: 2px;
}

/* Header (back button + centered "Quiz complete" label) */
.lu-mini-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  padding-top: calc(12px + env(safe-area-inset-top));
}
.lu-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  flex-shrink: 0;
}
.lu-back svg {
  width: 16px;
  height: 16px;
}
.lu-header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 800;
  color: var(--accent-dark);
}
.lu-header-spacer {
  width: 36px;
  flex-shrink: 0;
}

.lu-trust-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 16px 24px 0;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-faint);
  text-align: center;
}
.lu-trust-note svg {
  flex-shrink: 0;
}
</style>
