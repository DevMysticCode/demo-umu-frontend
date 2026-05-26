<template>
  <div class="hs-v6-levelup">
    <div class="confetti-host">
      <div
        v-for="(c, i) in confetti"
        :key="i"
        class="confetti-piece"
        :style="{
          left: c.left + '%',
          background: c.color,
          animationDelay: c.delay + 'ms',
          animationDuration: c.duration + 'ms',
        }"
      />
    </div>

    <!-- App header -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="$emit('back')" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Level up!</div>
        <div class="app-header-sub">Your HomeScore has been refined</div>
      </div>
      <div class="app-header-right">
        <button class="app-icon-btn" type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Level up hero -->
    <div class="levelup-hero anim-1 level-up">
      <div class="levelup-eyebrow">🎉 Level up · Quiz complete</div>
      <div class="levelup-title">You levelled up your home.</div>
      <div class="levelup-sub">
        Your refined HomeScore reflects what's been done since the EPC. More accurate. Higher confidence.
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

    <!-- Refined stats -->
    <div class="section-h-row">
      <div class="section-h">Your refined stats</div>
      <div class="section-h-sub">{{ toScore }}/100 points</div>
    </div>
    <div class="refined-stats-card">
      <div
        v-for="s in refinedStats"
        :key="s.id"
        class="stat-row gained"
      >
        <div class="stat-icon">{{ s.icon }}</div>
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

    <!-- Bottom CTA -->
    <div class="bottom-cta">
      <button class="bottom-cta-btn" type="button" @click="$emit('open-pathway')">
        🎯 See the EPC's 6-step pathway →
      </button>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

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
}>()

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
  { id: 'heating', icon: '🔥', label: 'Heating', value: 16, max: 20, pct: 80, tone: 'high' },
  { id: 'structure', icon: '🧱', label: 'Structure', value: 17, max: 25, pct: 68, tone: 'high' },
  { id: 'efficiency', icon: '💡', label: 'Efficiency', value: 6, max: 15, pct: 40, tone: 'mid' },
  { id: 'electrics', icon: '⚡', label: 'Electrics', value: 10, max: 20, pct: 50, tone: 'mid' },
  { id: 'plumbing', icon: '💧', label: 'Plumbing', value: 13, max: 20, pct: 65, tone: 'mid' },
] as const

// Confetti
interface ConfettiPiece {
  left: number
  color: string
  delay: number
  duration: number
}
const colors = ['#00a19a', '#00b8b0', '#f0a030', '#7c6fb0', '#7ab040', '#ffd54a']
const confetti = ref<ConfettiPiece[]>(
  Array.from({ length: 60 }, () => ({
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 600,
    duration: 2200 + Math.random() * 800,
  }))
)
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
  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* Confetti */
.confetti-host {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}
.confetti-piece {
  position: absolute;
  top: -20px;
  width: 8px;
  height: 14px;
  opacity: 0;
  animation-name: confettiFall;
  animation-timing-function: cubic-bezier(0.22, 0.7, 0.5, 1);
  animation-fill-mode: forwards;
}
@keyframes confettiFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
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
  animation: hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both,
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
  width: 22px;
  text-align: center;
  flex-shrink: 0;
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
</style>
