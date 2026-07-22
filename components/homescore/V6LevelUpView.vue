<template>
  <div class="hs-v6-levelup">
    <!-- Minimal back-only mini-header (no title strip, no bell) -->
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
    </div>

    <!-- Level up hero -->
    <div class="levelup-hero anim-1 level-up">
      <div class="levelup-eyebrow">🎉 Level up · Quiz complete</div>
      <div class="levelup-title">You levelled up your home.</div>
      <div class="levelup-sub">
        Your refined HomeScore reflects what's been done since the EPC. More
        accurate. Higher confidence.
      </div>
      <div class="levelup-row">
        <div class="levelup-from">
          <div class="levelup-from-num">{{ fromScore }}</div>
          <div class="levelup-from-label">Was · Level {{ fromLevel }}</div>
        </div>
        <div class="levelup-arrow">→</div>
        <div class="levelup-to">
          <div class="levelup-to-num">{{ animatedToScore }}</div>
          <div class="levelup-to-label">Now · Level {{ toLevel }}</div>
        </div>
      </div>
      <div class="levelup-delta">{{ deltaLabel }}</div>
    </div>

    <!-- "What happens next" explainer — two paths side-by-side (v6-2) -->
    <div class="boost-explain anim-2">
      <div class="boost-explain-row">
        <div class="boost-explain-step">
          <div class="boost-explain-num">1</div>
          <div class="boost-explain-text">
            <b>Follow the pathway</b> — take recommended steps to keep climbing
            your HomeScore.
          </div>
        </div>
        <div class="boost-explain-step">
          <div class="boost-explain-num">2</div>
          <div class="boost-explain-text">
            <b>Boost your score</b> — add docs and book pros to grow your
            Passport.
          </div>
        </div>
      </div>
      <div class="boost-explain-foot">
        Pathway lifts your <b>HomeScore</b> · Boost lifts your
        <b>Move Ready</b> &amp; <b>Passport</b>.
      </div>
    </div>

    <!-- Refined stats -->
    <div class="section-h-row">
      <div class="section-h">Your refined stats</div>
      <div class="section-h-sub">{{ toScore }}/100 points</div>
    </div>
    <div class="refined-stats-card">
      <div v-for="s in refinedStats" :key="s.id" class="stat-row gained">
        <div class="stat-icon">
          <img v-if="s.icon && s.icon.startsWith('/')" :src="s.icon" alt="" loading="lazy" />
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
        <div class="stat-value">{{ s.value }}/{{ s.max }}</div>
      </div>
    </div>

    <!-- Bottom CTAs (v6-2: primary filled pathway + outlined boost) -->
    <div class="bottom-cta">
      <button
        class="bottom-cta-btn"
        type="button"
        @click="$emit('open-pathway')"
      >
        <img
          src="/op-icons/homescore/targetPathway.png"
          alt=""
          class="bottom-cta-ic"
          loading="lazy"
        />
        See the EPC's pathway
      </button>
      <button
        class="bottom-cta-secondary outlined"
        type="button"
        @click="$emit('open-boost')"
      >
        <img
          src="/op-icons/homescore/boostBolt.png"
          alt=""
          class="bottom-cta-ic"
          loading="lazy"
        />
        Boost your score
      </button>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useConfetti } from '~/composables/useConfetti'

interface Props {
  fromScore: number
  toScore: number
  delta: number
  estSavings?: number
}

const props = withDefaults(defineProps<Props>(), {
  estSavings: 309,
})

defineEmits<{
  (e: 'back'): void
  (e: 'open-pathway'): void
  (e: 'open-boost'): void
}>()

const { runConfetti } = useConfetti()

function gradeFor(score: number): string {
  if (score >= 92) return 'A'
  if (score >= 81) return 'B'
  if (score >= 69) return 'C'
  if (score >= 55) return 'D'
  if (score >= 39) return 'E'
  if (score >= 21) return 'F'
  return 'G'
}

const fromLevel = computed(() => gradeFor(props.fromScore))
const toLevel = computed(() => gradeFor(props.toScore))

const deltaLabel = computed(() => {
  const sign = props.delta >= 0 ? '+' : ''
  return `${sign}${props.delta} points gained · est. bills ↓ £${props.estSavings}/yr`
})

const animatedToScore = ref(props.fromScore)
const barsAnimated = ref(false)

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

const refinedStats = [
  {
    id: 'heating',
    icon: '/op-icons/homescore/flame.png',
    label: 'Heating',
    value: 16,
    max: 20,
    pct: 80,
    tone: 'high',
  },
  {
    id: 'structure',
    icon: '/op-icons/homescore/bricks.png',
    label: 'Structure',
    value: 17,
    max: 25,
    pct: 68,
    tone: 'high',
  },
  {
    id: 'efficiency',
    icon: '/op-icons/homescore/lightbulb.png',
    label: 'Efficiency',
    value: 6,
    max: 15,
    pct: 40,
    tone: 'mid',
  },
  {
    id: 'electrics',
    icon: '/op-icons/homescore/lightning.png',
    label: 'Electrics',
    value: 10,
    max: 20,
    pct: 50,
    tone: 'mid',
  },
  {
    id: 'plumbing',
    icon: '/op-icons/homescore/tap.png',
    label: 'Plumbing',
    value: 13,
    max: 20,
    pct: 65,
    tone: 'mid',
  },
] as const

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
.hs-v6-levelup
  :is(.levelup-title, .levelup-to-num, .levelup-from-num, .stat-value) {
  font-weight: 700;
}
.hs-v6-levelup :is(.levelup-sub, .levelup-from-label, .levelup-to-label) {
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
    box-shadow:
      0 12px 32px -8px rgba(0, 161, 154, 0.3),
      0 0 0 8px rgba(0, 161, 154, 0.15);
  }
}
.anim-1 {
  animation: hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Hero */
.levelup-hero {
  position: relative;
  z-index: 2;
  margin: 14px 20px 0;
  padding: 24px 22px 22px;
  background: var(--card);
  border: 2px solid var(--accent);
  border-radius: 14px;
  box-shadow: 0 12px 32px -8px rgba(0, 161, 154, 0.3);
  overflow: hidden;
}
.levelup-hero.level-up {
  animation:
    hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both,
    levelGlow 1.5s ease-out 3;
}
.levelup-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  color: var(--accent-dark);
  background: var(--accent-paler);
  padding: 6px 12px;
  border-radius: 100px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  border: 1px solid var(--accent-pale);
  margin-bottom: 12px;
}
.levelup-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.8px;
  line-height: 1.1;
  margin-bottom: 6px;
}
.levelup-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-bottom: 16px;
}
.levelup-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--border-soft);
}
.levelup-from,
.levelup-to {
  text-align: center;
  flex: 1;
}
.levelup-from-num {
  font-size: 34px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: -1.2px;
  line-height: 1;
}
.levelup-from-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-top: 4px;
}
.levelup-arrow {
  font-size: 24px;
  color: var(--accent);
  font-weight: 800;
}
.levelup-to-num {
  font-size: 42px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: -1.5px;
  line-height: 1;
}
.levelup-to-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-top: 4px;
}
.levelup-delta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  padding: 8px 14px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 800;
  color: var(--accent-dark);
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
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
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
  width: 46px;
  text-align: right;
  font-size: 11px;
  font-weight: 800;
  color: var(--text);
  flex-shrink: 0;
}
.stat-row.gained .stat-value {
  color: var(--accent-dark);
}

/* Bottom CTA */
.bottom-cta {
  position: relative;
  z-index: 2;
  padding: 16px 20px 24px;
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

/* Mini header (back-only, no title strip, no bell) */
.lu-mini-header {
  position: relative;
  z-index: 2;
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
}
.lu-back svg {
  width: 16px;
  height: 16px;
}

/* "What happens next" explainer — side-by-side two-path layout (v6-2) */
.boost-explain {
  position: relative;
  z-index: 2;
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: var(--card);
  border: 1.5px solid var(--border-soft);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.boost-explain-row {
  display: flex;
  gap: 10px;
}
.boost-explain-step {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 9px;
  min-width: 0;
}
.boost-explain-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 161, 154, 0.3);
}
.boost-explain-text {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.45;
}
.boost-explain-text :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.boost-explain-foot {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-soft);
  text-align: center;
}
.boost-explain-foot :deep(b) {
  color: var(--accent-dark);
  font-weight: 700;
}

@keyframes hs-v6-fadeUp-anim2 {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.anim-2 {
  animation: hs-v6-fadeUp-anim2 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
}
</style>
