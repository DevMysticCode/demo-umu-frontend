<template>
  <div class="hs-v6-quiz">
    <!-- ── Address card (amber, compact) ───────────────────────────── -->
    <div class="hs-addr-card anim-1">
      <div class="hs-addr-top">
        <div class="hs-addr-pin" />
        <div class="hs-addr-block">
          <div class="hs-addr-line">{{ addressLine }}</div>
          <div class="hs-addr-meta">{{ addressMeta }}</div>
        </div>
      </div>
      <div class="hs-addr-pills">
        <span class="hs-addr-pill">
          <span class="epc-letter" :style="{ background: epcColor }">{{ epcRating || '—' }}</span>
          EPC rating
        </span>
        <span class="hs-addr-pill">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 4 14 11 14 11 22 20 10 13 10" /></svg>
          HomeScore <b style="color: white">{{ initialScore }}</b
          ><span style="opacity: 0.75; font-weight: 600">/100</span>
        </span>
      </div>
    </div>

    <!-- ── Live HomeScore card (animates as user answers) ──────────── -->
    <div class="score-card anim-2" style="margin-top: 12px">
      <div class="score-eyebrow-row">
        <div class="score-eyebrow-mark">HomeScore<sup>™</sup> · Live</div>
        <span class="quiz-live-delta-pill" :class="{ flash: deltaFlash }">{{ deltaText }}</span>
      </div>
      <div class="score-top">
        <div class="score-gauge">
          <svg viewBox="0 0 120 120">
            <defs>
              <linearGradient id="quizGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#00a19a" />
                <stop offset="100%" stop-color="#00b8b0" />
              </linearGradient>
            </defs>
            <circle class="g-bg" cx="60" cy="60" r="50" stroke-width="9" />
            <circle
              class="g-fill"
              cx="60"
              cy="60"
              r="50"
              stroke-width="9"
              stroke-dasharray="314.16"
              :stroke-dashoffset="ringOffset"
              stroke="url(#quizGrad)"
              fill="none"
              stroke-linecap="round"
              style="transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)"
            />
          </svg>
          <div class="g-num">
            <div class="gn-big">{{ liveScore }}</div>
            <div class="gn-small">/ 100</div>
          </div>
        </div>
        <div class="score-summary">
          <div class="score-band">Climbing as you answer</div>
          <div class="score-explainer">
            Each question updates your live score in real time.
            <b>Aim for Level C (55+)</b> to unlock the upgrade marketplace.
          </div>
        </div>
      </div>
      <div class="score-footer" style="padding-top: 12px; margin-top: 12px">
        <div style="flex: 1">
          <div class="quiz-progress-bar-bg">
            <div class="quiz-progress-bar-fill" :style="{ width: progressPct + '%' }" />
          </div>
          <div class="quiz-progress-label">
            {{ answeredCount }} of {{ QUESTS.length }} answered · earn XP for every question
          </div>
        </div>
      </div>
    </div>

    <!-- ── Two ways to update your score ───────────────────────────── -->
    <div class="two-ways anim-1">
      <div class="two-ways-title">Two ways to update your score</div>
      <div class="two-ways-grid">
        <button
          class="two-ways-opt"
          :class="{ active: mode === 'quiz' }"
          type="button"
          @click="mode = 'quiz'"
        >
          <div class="two-ways-opt-icon">📋</div>
          <div class="two-ways-opt-title">Answer questions</div>
          <div class="two-ways-opt-sub">Work through the list below</div>
        </button>
        <div class="two-ways-or">or</div>
        <button
          class="two-ways-opt"
          :class="{ active: mode === 'bill' }"
          type="button"
          @click="onUploadBill"
        >
          <div class="two-ways-opt-icon">💡</div>
          <div class="two-ways-opt-title">Upload a bill</div>
          <div class="two-ways-opt-sub">Skip the questions</div>
        </button>
      </div>
    </div>

    <!-- ── Section header ─────────────────────────────────────────── -->
    <div class="section-h-row" style="padding-top: 18px; padding-bottom: 6px">
      <div class="section-h">Has your home had these improvements?</div>
      <div class="section-h-sub">{{ answeredCount }} of {{ QUESTS.length }} answered</div>
    </div>

    <!-- ── Quest list (collapsible · 4 options each) ──────────────── -->
    <div class="quest-list">
      <div
        v-for="q in QUESTS"
        :key="q.id"
        class="quest-card v2"
        :class="{ open: openQuest === q.id, answered: questState[q.id] === 'yes' }"
      >
        <div class="quest-summary" @click="toggleQuest(q.id)">
          <div class="quest-num-circle">{{ q.n }}</div>
          <div class="quest-summary-info">
            <div class="quest-summary-title">{{ q.title }}</div>
            <div class="quest-summary-sub">{{ q.summary }}</div>
          </div>
          <div class="quest-summary-chev">›</div>
        </div>
        <div v-if="openQuest === q.id" class="quest-detail">
          <div class="quest-desc">{{ q.desc }}</div>
          <div class="quest-impact">
            ✦ Score +{{ q.pts }} pts · saves ~£{{ q.save }}/yr · cost {{ q.cost
            }}<template v-if="q.grant"> · 🎁 {{ q.grant }}</template>
          </div>
          <div class="quest-question">Has this been done since the last EPC?</div>
          <div class="quest-options-4">
            <button
              v-for="(o, key) in OPT"
              :key="key"
              type="button"
              class="quest-opt-btn"
              :class="[o.cls, { selected: questState[q.id] === key }]"
              @click.stop="answerQuest(q.id, key)"
            >
              <span class="opt-icon-tile">{{ o.icon }}</span>
              <span>{{ o.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Finish CTA ─────────────────────────────────────────────── -->
    <div class="quiz-finish">
      <button
        class="quiz-finish-btn"
        type="button"
        :disabled="answeredCount < QUESTS.length"
        @click="onFinish"
      >
        🏆 Get my real HomeScore →
      </button>
    </div>
    <div class="quiz-reset" @click="resetQuests">↺ Start again</div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  property: any | null
  initialScore: number
  epcRating: string | null
  epcYear?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  epcYear: null,
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'finish', payload: { finalScore: number; delta: number; answers: Record<string, string> }): void
  (e: 'upload-bill'): void
}>()

// Prototype's exact 6 quests
const QUESTS = [
  {
    id: 'loft',
    n: 1,
    title: 'Increase loft insulation to 270mm',
    summary: 'Pitched, 75mm + 100mm · EPC: Average',
    desc: "Your EPC records 75mm in one roof section and 100mm in another — well below the 270mm recommended depth. Topping up is the EPC's first recommended step.",
    stat: 'structure',
    pts: 1,
    save: 40,
    cost: '£100–£350',
    grant: null as string | null,
  },
  {
    id: 'cavity',
    n: 2,
    title: 'Cavity wall insulation',
    summary: 'Part insulated, part not · EPC: Poor',
    desc: 'Your EPC says "cavity fill is recommended". Some walls are insulated, some aren\'t. Filling the rest is the biggest annual saving on the certificate.',
    stat: 'structure',
    pts: 8,
    save: 224,
    cost: '£500–£1,500',
    grant: null,
  },
  {
    id: 'floor',
    n: 3,
    title: 'Floor insulation',
    summary: 'No insulation (assumed) · EPC: Poor',
    desc: 'Your EPC lists both suspended and solid floor sections with no insulation. Insulating cuts draughts and stops heat escaping into the void.',
    stat: 'structure',
    pts: 3,
    save: 97,
    cost: '£800–£1,200',
    grant: null,
  },
  {
    id: 'lights',
    n: 4,
    title: 'Low energy lighting',
    summary: '15% low-energy lighting · EPC: Poor',
    desc: 'Your EPC records low-energy lighting in only 15% of fixed outlets. Swapping the rest to LED is the cheapest single step on your certificate.',
    stat: 'efficiency',
    pts: 1,
    save: 45,
    cost: '£110',
    grant: null,
  },
  {
    id: 'solarh',
    n: 5,
    title: 'Solar water heating',
    summary: 'Not installed · recommended on EPC',
    desc: 'A solar thermal collector pre-heats hot water from sunlight. Modest annual saving — weigh against capital cost.',
    stat: 'plumbing',
    pts: 1,
    save: 40,
    cost: '£4,000–£6,000',
    grant: null,
  },
  {
    id: 'solarp',
    n: 6,
    title: 'Solar photovoltaic panels',
    summary: 'Not installed · recommended on EPC',
    desc: "Solar PV generates electricity from sunlight, plus Smart Export Guarantee income for surplus. EPC's final step — crosses you from D into Band C.",
    stat: 'electrics',
    pts: 9,
    save: 248,
    cost: '£9,000–£14,000',
    grant: 'SEG',
  },
] as const

const OPT = {
  yes: { label: 'Yes — done', icon: '✓', cls: 'opt-yes', mult: 1.0 },
  different: { label: 'Done something different', icon: '↻', cls: 'opt-different', mult: 0.5 },
  notyet: { label: 'Not yet', icon: '•', cls: 'opt-not-yet', mult: 0 },
  na: { label: 'Not applicable', icon: '⊘', cls: 'opt-na', mult: 0 },
} as const

type OptKey = keyof typeof OPT

const questState = ref<Record<string, OptKey>>({})
const openQuest = ref<string | null>(null)
const mode = ref<'quiz' | 'bill'>('quiz')
const liveScore = ref(props.initialScore)
const deltaText = ref('+0 pts')
const deltaFlash = ref(false)

const answeredCount = computed(() => Object.keys(questState.value).length)
const progressPct = computed(() => (answeredCount.value / QUESTS.length) * 100)
const ringOffset = computed(() => {
  const circumference = 2 * Math.PI * 50 // 314.16
  return circumference - (liveScore.value / 100) * circumference
})

const epcColor = computed(() => {
  const map: Record<string, string> = {
    A: '#008a84',
    B: '#00a19a',
    C: '#7ab040',
    D: '#e6a23c',
    E: '#d86f4a',
    F: '#c04a1a',
    G: '#a52a2a',
  }
  return map[props.epcRating || ''] || '#a8a9ad'
})

const addressLine = computed(() => {
  const p = props.property
  if (!p) return 'Your property'
  return p.addressLine1 || p.fullAddress || 'Your property'
})

const addressMeta = computed(() => {
  const p = props.property
  if (!p) return ''
  const parts: string[] = []
  if (p.postcode) parts.push(p.postcode)
  if (p.propertyType) parts.push(p.propertyType)
  if (p.floorArea) parts.push(`${p.floorArea}m²`)
  return parts.join(' · ')
})

function toggleQuest(id: string) {
  openQuest.value = openQuest.value === id ? null : id
}

function answerQuest(id: string, ans: OptKey) {
  const prev = questState.value[id]
  questState.value = { ...questState.value, [id]: ans }
  const q = QUESTS.find((x) => x.id === id)
  if (!q) return
  const prevPts = prev ? Math.round(q.pts * OPT[prev].mult) : 0
  const newPts = Math.round(q.pts * OPT[ans].mult)
  const diff = newPts - prevPts
  const next = Math.max(0, Math.min(100, liveScore.value + diff))
  animateScore(liveScore.value, next, diff)
  // Auto-collapse after short delay
  setTimeout(() => {
    if (openQuest.value === id) openQuest.value = null
  }, 450)
}

function animateScore(from: number, to: number, diff: number) {
  liveScore.value = to
  if (diff !== 0) {
    const sign = diff > 0 ? '+' : ''
    deltaText.value = `${sign}${diff} pts`
    deltaFlash.value = true
    setTimeout(() => {
      deltaFlash.value = false
    }, 600)
  }
}

function resetQuests() {
  questState.value = {}
  openQuest.value = null
  liveScore.value = props.initialScore
  deltaText.value = '+0 pts'
}

function onFinish() {
  const delta = liveScore.value - props.initialScore
  emit('finish', {
    finalScore: liveScore.value,
    delta,
    answers: { ...questState.value },
  })
}

function onUploadBill() {
  mode.value = 'bill'
  emit('upload-bill')
}

watch(() => props.initialScore, (v) => {
  liveScore.value = v
})
</script>

<style scoped>
/* Inherit the same design tokens as V6ScoreView */
.hs-v6-quiz {
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
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}

/* Soften prototype's 800-weights to match SF Pro app scale */
.hs-v6-quiz :is(.hs-addr-line, .score-band, .gn-big, .quest-summary-title,
  .quest-question, .quest-impact, .two-ways-opt-title) {
  font-weight: 700;
}
.hs-v6-quiz :is(.hs-addr-meta, .score-explainer, .quiz-progress-label,
  .quest-summary-sub, .quest-desc, .two-ways-opt-sub) {
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

/* Animation utility */
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
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.anim-1 {
  animation: hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.anim-2 {
  animation: hs-v6-fadeUp 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Amber address card */
.hs-addr-card {
  margin: 14px 20px 0;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #f0a030 0%, #c67c18 50%, #8b4e0a 100%);
  border: none;
  border-radius: 14px;
  box-shadow: 0 12px 32px -8px rgba(180, 100, 20, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  color: white;
  position: relative;
  overflow: hidden;
}
.hs-addr-card::after {
  content: '';
  position: absolute;
  top: -45%;
  right: -15%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 65%);
  pointer-events: none;
}
.hs-addr-card > * {
  position: relative;
  z-index: 1;
}
.hs-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}
.hs-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  margin-top: 8px;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}
.hs-addr-block {
  flex: 1;
  min-width: 0;
}
.hs-addr-line {
  font-size: 20px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 2px;
}
.hs-addr-meta {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}
.hs-addr-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
.hs-addr-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 800;
  padding: 5px 10px 5px 7px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
}
.hs-addr-pill svg {
  width: 10px;
  height: 10px;
}
.hs-addr-pill .epc-letter {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
}

/* Score card */
.score-card {
  margin: 14px 20px 0;
  padding: 20px 20px 18px;
  background: linear-gradient(180deg, var(--accent-paler) 0%, var(--card) 60%);
  border: 2px solid var(--accent);
  border-radius: 14px;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.12);
}
.score-eyebrow-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.score-eyebrow-mark {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.score-eyebrow-mark sup {
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0;
}
.quiz-live-delta-pill {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 100px;
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
  transition: all 0.25s;
}
.quiz-live-delta-pill.flash {
  background: var(--accent);
  color: white;
  border-color: var(--accent-dark);
  transform: scale(1.08);
}
.score-top {
  display: flex;
  align-items: center;
  gap: 18px;
}
.score-gauge {
  position: relative;
  width: 104px;
  height: 104px;
  flex-shrink: 0;
}
.score-gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.g-bg {
  stroke: var(--border-soft);
  fill: none;
}
.g-num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.gn-big {
  font-size: 34px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -1.2px;
  line-height: 1;
}
.gn-small {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-faint);
  margin-top: 2px;
}
.score-summary {
  flex: 1;
  min-width: 0;
}
.score-band {
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.4px;
  margin-bottom: 6px;
  line-height: 1.1;
}
.score-explainer {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.score-explainer b {
  color: var(--accent-dark);
  font-weight: 800;
}
.score-footer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--border-soft);
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
}
.quiz-progress-bar-bg {
  height: 5px;
  background: var(--bg);
  border-radius: 100px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.quiz-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 100px;
  transition: width 0.4s ease;
}
.quiz-progress-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-top: 6px;
}

/* Two ways card */
.two-ways {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.two-ways-title {
  font-size: 10px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
  text-align: center;
}
.two-ways-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
}
.two-ways-or {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}
.two-ways-opt {
  padding: 14px 8px;
  background: var(--card);
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  font-family: inherit;
}
.two-ways-opt:hover {
  border-color: var(--accent-pale);
}
.two-ways-opt.active {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.15);
}
.two-ways-opt-icon {
  font-size: 22px;
  margin-bottom: 5px;
}
.two-ways-opt-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
  letter-spacing: -0.1px;
}
.two-ways-opt.active .two-ways-opt-title {
  color: var(--accent-dark);
}
.two-ways-opt-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.3;
}

/* Section heading row */
.section-h-row {
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

/* Quest list */
.quest-list {
  margin: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.quest-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: var(--shadow-card);
  transition: all 0.18s;
  position: relative;
}
.quest-card.answered {
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
}
.quest-card.answered::after {
  content: '✓';
  position: absolute;
  top: 14px;
  right: 14px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.quest-card.v2 .quest-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.quest-num-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
}
.quest-card.v2.answered .quest-num-circle {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border-color: transparent;
}
.quest-summary-info {
  flex: 1;
  min-width: 0;
}
.quest-summary-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.25;
  margin-bottom: 2px;
}
.quest-summary-sub {
  font-size: 11.5px;
  color: var(--text-secondary);
  font-weight: 500;
  line-height: 1.35;
}
.quest-summary-chev {
  font-size: 18px;
  color: var(--text-faint);
  transition: transform 0.2s;
  line-height: 1;
  flex-shrink: 0;
}
.quest-card.v2.open .quest-summary-chev {
  transform: rotate(90deg);
  color: var(--accent-dark);
}
.quest-detail {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid var(--border-soft);
  animation: fadeSlideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.quest-desc {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-bottom: 10px;
}
.quest-impact {
  padding: 9px 12px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  color: var(--accent-dark);
  margin-bottom: 14px;
}
.quest-question {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 8px;
  letter-spacing: -0.2px;
}
.quest-options-4 {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.quest-opt-btn {
  padding: 11px 14px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 10px;
}
.quest-opt-btn:hover {
  border-color: var(--accent-pale);
  background: var(--bg);
}
.quest-opt-btn .opt-icon-tile {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: white;
  flex-shrink: 0;
}
.quest-opt-btn.opt-yes .opt-icon-tile {
  background: var(--accent);
}
.quest-opt-btn.opt-yes.selected {
  border-color: var(--accent);
  background: var(--accent-paler);
  color: var(--accent-dark);
}
.quest-opt-btn.opt-different .opt-icon-tile {
  background: #7c6fb0;
}
.quest-opt-btn.opt-different.selected {
  border-color: #7c6fb0;
  background: #f2ebfd;
  color: #5b3795;
}
.quest-opt-btn.opt-not-yet .opt-icon-tile {
  background: #a8a9ad;
}
.quest-opt-btn.opt-not-yet.selected {
  border-color: #7c6fb0;
  background: #f7f2fb;
  color: #5b3795;
}
.quest-opt-btn.opt-na {
  color: var(--text-faint);
}
.quest-opt-btn.opt-na .opt-icon-tile {
  background: var(--text-faint);
}
.quest-opt-btn.opt-na.selected {
  border-color: var(--text-faint);
  background: var(--bg);
}

/* Finish */
.quiz-finish {
  margin: 14px 20px 0;
}
.quiz-finish-btn {
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
.quiz-finish-btn:hover:not(:disabled) {
  filter: brightness(1.06);
}
.quiz-finish-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.quiz-reset {
  padding: 10px 20px 0;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}
</style>
