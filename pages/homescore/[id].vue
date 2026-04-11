<template>
  <div class="hs-page">
    <!-- App-style header -->
    <div class="hs-header">
      <button class="hs-back-btn" @click="goBack" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M15 18l-6-6 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="hs-header-center">
        <p class="hs-header-title">Homehealth Score</p>
        <p v-if="mode === 'questions'" class="hs-header-sub">Question {{ step + 1 }} of {{ QUESTIONS.length }}</p>
        <p v-else-if="mode === 'auto'" class="hs-header-sub">From public data</p>
        <p v-else class="hs-header-sub">Your result</p>
      </div>
      <div class="hs-header-spacer" />
    </div>

    <!-- Property strip -->
    <div v-if="property" class="hs-prop-strip">
      <div class="hs-prop-dot" />
      <p class="hs-prop-address">{{ property.addressLine1 }}, {{ property.postcode }}</p>
      <span v-if="property.epcRating" class="hs-epc-chip" :style="{ background: epcColor(property.epcRating) }">
        EPC {{ property.epcRating }}
      </span>
    </div>

    <!-- ── AUTO SCORE STATE ─────────────────────────────────────────── -->
    <template v-if="mode === 'auto'">
      <div class="hs-auto-scroll">
        <!-- Score ring -->
        <div class="hs-result-ring-wrap">
          <HomescoreScoreRing
            :score="autoResult.total"
            :rating="autoResult.rating"
            :rating-color="autoResult.ratingColor"
          />
          <div class="hs-source-pill">
            <svg viewBox="0 0 24 24" fill="none" width="12" height="12" style="display:inline;margin-right:4px;vertical-align:-1px">
              <circle cx="12" cy="12" r="10" stroke="#8e8e93" stroke-width="2"/><path d="M12 8v4l3 3" stroke="#8e8e93" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ v2Result ? 'EPC data · V2 formula' : `Auto-generated · ${autoAnswersCount} public data points` }}
          </div>

          <!-- Bill estimate pill (V2 only) -->
          <div v-if="v2Result?.baseBill" class="hs-bill-pill">
            Estimated annual energy bill: <strong>£{{ Math.round(v2Result.baseBill).toLocaleString() }}</strong>
          </div>
        </div>

        <!-- Neighbourhood comparison card (V2 only) -->
        <div v-if="billComparison !== null" class="hs-neighbour-card" :class="billComparison <= 0 ? 'hs-neighbour-good' : 'hs-neighbour-warn'">
          <div class="hs-neighbour-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" :stroke="billComparison <= 0 ? '#00a19a' : '#f59e0b'" stroke-width="2" stroke-linecap="round"/>
              <path d="M9 22V12h6v10" :stroke="billComparison <= 0 ? '#00a19a' : '#f59e0b'" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="hs-neighbour-body">
            <p class="hs-neighbour-title">vs. Similar Homes Nearby</p>
            <p class="hs-neighbour-val" :class="billComparison <= 0 ? 'hs-neighbour-val--good' : 'hs-neighbour-val--warn'">
              {{ billComparison <= 0 ? `£${Math.abs(billComparison).toLocaleString()} cheaper` : `£${billComparison.toLocaleString()} more expensive` }}
              <span class="hs-neighbour-per-year"> per year</span>
            </p>
            <p class="hs-neighbour-sub">Based on {{ neighbourStats?.sampleSize }} nearby EPC records in {{ neighbourStats?.postcode }}</p>
          </div>
        </div>

        <!-- What this means -->
        <div class="hs-auto-info-card">
          <div class="hs-auto-info-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <circle cx="12" cy="12" r="10" stroke="#00a19a" stroke-width="2"/>
              <path d="M12 8v4m0 4h.01" stroke="#00a19a" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <p class="hs-auto-info-title">Based on public records</p>
            <p class="hs-auto-info-body">
              {{ v2Result?.hasV2Data
                ? 'Score based on EPC energy cost data — the most accurate public estimate available. Answer questions below to add your own knowledge.'
                : `Score generated from EPC rating, year built, and heating type from public databases. Answer ${QUESTIONS.length} quick questions to get a precise, personalised score.` }}
            </p>
          </div>
        </div>

        <!-- V2 component breakdown -->
        <div v-if="v2Result" class="hs-v2-breakdown">
          <p class="hs-v2-breakdown-title">Energy Score Breakdown</p>
          <div class="hs-v2-bar-list">
            <div v-for="comp in v2Components" :key="comp.label" class="hs-v2-bar-row">
              <div class="hs-v2-bar-label">
                <span>{{ comp.label }}</span>
                <span class="hs-v2-bar-weight">{{ comp.weight }}</span>
              </div>
              <div class="hs-v2-bar-track">
                <div class="hs-v2-bar-fill" :style="{ width: `${comp.score}%`, background: comp.color }" />
              </div>
              <span class="hs-v2-bar-score">{{ comp.score }}</span>
            </div>
          </div>
        </div>

        <!-- V1 Breakdown (fallback when no V2 data) -->
        <HomescoreBreakdownCard v-else :breakdown="autoResult.breakdown" />

        <!-- Improve CTA -->
        <div class="hs-improve-card">
          <p class="hs-improve-title">Make it more accurate</p>
          <p class="hs-improve-sub">Only {{ unansweredCount }} question{{ unansweredCount !== 1 ? 's' : '' }} left. Answer them to improve your score confidence and get personalised recommendations.</p>
          <button class="hs-improve-btn" @click="startQuestions">
            Answer Questions
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style="display:inline;margin-left:6px;vertical-align:-2px">
              <path d="M9 18l6-6-6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- ── QUESTION FLOW STATE ─────────────────────────────────────── -->
    <template v-else-if="mode === 'questions'">
      <!-- Progress bar -->
      <div class="hs-progress-wrap">
        <div class="hs-progress-track">
          <div class="hs-progress-fill" :style="{ width: `${progress}%` }" />
        </div>
        <p class="hs-progress-label">{{ progress }}% complete</p>
      </div>

      <div class="hs-content">
        <Transition name="hs-slide" mode="out-in">
          <div :key="step" class="hs-question-wrap">
            <HomescoreQuestionCard
              v-if="currentQuestion"
              :question="currentQuestion"
              :model-value="currentAnswer"
              @update:model-value="answer(currentQuestion.id, $event)"
            />
          </div>
        </Transition>

        <div class="hs-nav">
          <button v-if="step > 0" class="hs-btn-prev" @click="prev">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M15 18l-6-6 6-6" stroke="#636366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <div v-else class="hs-btn-spacer" />
          <button class="hs-btn-next" :disabled="!canNext" @click="next">
            {{ isLastStep ? 'See My Score' : 'Next' }}
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M9 18l6-6-6-6" :stroke="canNext ? 'white' : '#aeaeb2'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- ── FULL RESULT STATE ───────────────────────────────────────── -->
    <template v-else-if="mode === 'result'">
      <div class="hs-result-scroll">
        <!-- Score ring -->
        <div class="hs-result-ring-wrap">
          <HomescoreScoreRing
            :score="result.total"
            :rating="result.rating"
            :rating-color="result.ratingColor"
          />
          <div class="hs-confidence-pill">
            <svg viewBox="0 0 24 24" fill="none" width="12" height="12" style="display:inline;margin-right:4px;vertical-align:-1px">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#00a19a" stroke-width="2"/>
            </svg>
            {{ result.confidenceScore }}% confidence
          </div>
          <!-- Bill estimate (V2 only) -->
          <div v-if="v2Result?.baseBill" class="hs-bill-pill">
            Estimated annual energy bill: <strong>£{{ Math.round(v2Result.baseBill).toLocaleString() }}</strong>
          </div>
        </div>

        <!-- Neighbourhood comparison (V2 only) -->
        <div v-if="billComparison !== null" class="hs-neighbour-card" :class="billComparison <= 0 ? 'hs-neighbour-good' : 'hs-neighbour-warn'">
          <div class="hs-neighbour-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" :stroke="billComparison <= 0 ? '#00a19a' : '#f59e0b'" stroke-width="2" stroke-linecap="round"/>
              <path d="M9 22V12h6v10" :stroke="billComparison <= 0 ? '#00a19a' : '#f59e0b'" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="hs-neighbour-body">
            <p class="hs-neighbour-title">vs. Similar Homes Nearby</p>
            <p class="hs-neighbour-val" :class="billComparison <= 0 ? 'hs-neighbour-val--good' : 'hs-neighbour-val--warn'">
              {{ billComparison <= 0 ? `£${Math.abs(billComparison).toLocaleString()} cheaper` : `£${billComparison.toLocaleString()} more expensive` }}
              <span class="hs-neighbour-per-year"> per year</span>
            </p>
            <p class="hs-neighbour-sub">Based on {{ neighbourStats?.sampleSize }} nearby EPC records in {{ neighbourStats?.postcode }}</p>
          </div>
        </div>

        <!-- Breakdown -->
        <HomescoreBreakdownCard :breakdown="result.breakdown" />

        <!-- Risk flags -->
        <HomescoreRiskFlagsCard v-if="result.flags.length" :flags="result.flags" />

        <!-- Actions -->
        <HomescoreActionsCard v-if="result.actions.length" :actions="result.actions" />

        <!-- Passport CTA -->
        <div class="hs-cta-card">
          <div class="hs-cta-icon">🏠</div>
          <div class="hs-cta-body">
            <p class="hs-cta-title">Get the full picture</p>
            <p class="hs-cta-sub">Claim the Property Passport for {{ property?.addressLine1 }} to unlock verified data, documents, and history.</p>
          </div>
          <button class="hs-cta-btn" @click="goBack">View Passport</button>
        </div>

        <!-- Retake -->
        <button class="hs-retake-btn" @click="retake">
          <svg viewBox="0 0 24 24" fill="none" width="15" height="15" style="display:inline;margin-right:6px;vertical-align:-2px">
            <path d="M1 4v6h6M23 20v-6h-6" stroke="#636366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="#636366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retake Assessment
        </button>

        <div style="height: 40px" />
      </div>
    </template>

    <!-- Loading state -->
    <template v-else>
      <div class="hs-loading-wrap">
        <div class="hs-loading-ring" />
        <p class="hs-loading-label">Analysing property data...</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import { useHomeScore } from '~/composables/useHomeScore'
import { QUESTIONS, getPrefillFromProperty, calculateScore } from '~/utils/homescoreScoring'
import { calculateV2Score, hasV2EpcData, computeBillDifference, type EpcV2Property } from '~/utils/homescoreV2'
import AppHeader from '~/components/core/AppHeader.vue'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const propertyId = route.params.id as string

const property = ref<any>(null)
const saving = ref(false)
const neighbourStats = ref<{ median: number | null; stdDev: number | null; sampleSize: number; postcode: string | null } | null>(null)

// mode: 'loading' | 'auto' | 'questions' | 'result'
type Mode = 'loading' | 'auto' | 'questions' | 'result'
const mode = ref<Mode>('loading')

const {
  step, answers, showResult,
  currentQuestion, currentAnswer,
  canNext, isLastStep, progress, result,
  answer, next, prev, retake: doRetake, prefill,
} = useHomeScore(propertyId)

// V2 score from EPC data (null if not enough EPC fields)
const v2Result = computed(() => {
  if (!property.value) return null
  if (!hasV2EpcData(property.value as EpcV2Property)) return null
  return calculateV2Score(property.value as EpcV2Property)
})

// Auto-generated score: V2 when we have EPC data, V1 prefill otherwise
const autoResult = computed(() => {
  if (v2Result.value) {
    // Wrap V2 result into the shape the ring + breakdown components expect
    return {
      total: v2Result.value.total,
      rating: v2Result.value.rating,
      ratingColor: v2Result.value.ratingColor,
      breakdown: {
        heating: v2Result.value.components.heatingHW,
        structure: v2Result.value.components.insulation,
        efficiency: v2Result.value.components.costEfficiency,
        electrics: v2Result.value.components.controls,
        plumbing: v2Result.value.components.ventilation,
      },
      flags: [],
      actions: [],
    }
  }
  if (!property.value) return { ...calculateScore({}), flags: [], actions: [] }
  const auto = getPrefillFromProperty(property.value)
  const merged = { ...auto, ...answers.value }
  return { ...calculateScore(merged), flags: [], actions: [] }
})

// V2 component bar data for display
const v2Components = computed(() => {
  if (!v2Result.value) return []
  const c = v2Result.value.components
  return [
    { label: 'Cost Efficiency', weight: '40%', score: c.costEfficiency, color: '#00a19a' },
    { label: 'Insulation',      weight: '25%', score: c.insulation,     color: '#231d45' },
    { label: 'Heating & HW',    weight: '20%', score: c.heatingHW,      color: '#7c3aed' },
    { label: 'Controls',        weight: '9%',  score: c.controls,       color: '#f59e0b' },
    { label: 'Ventilation',     weight: '4%',  score: c.ventilation,    color: '#3b82f6' },
    { label: 'Lighting',        weight: '2%',  score: c.lighting,       color: '#10b981' },
  ]
})

// Bill comparison: property bill vs neighbourhood median bill
const billComparison = computed(() => {
  if (!v2Result.value) return null
  return computeBillDifference(
    v2Result.value.baseBill,
    neighbourStats.value?.median ?? null,
    property.value?.floorAreaSqm,
  )
})

const autoAnswersCount = computed(() => {
  if (!property.value) return 0
  // V2: at minimum 1 (we have enough EPC data to show a score)
  if (v2Result.value) return Math.max(1, v2Result.value.dataPoints)
  return Object.keys(getPrefillFromProperty(property.value)).length
})
const unansweredCount = computed(() => {
  return QUESTIONS.filter(q => !answers.value[q.id] || answers.value[q.id] === 'unsure').length
})

function determineMode() {
  const hasFullResult = Object.keys(answers.value).length === QUESTIONS.length
  if (hasFullResult) {
    mode.value = 'result'
  } else if (autoAnswersCount.value > 0) {
    mode.value = 'auto'
  } else {
    mode.value = 'questions'
    step.value = 0
  }
}

function startQuestions() {
  // Jump to first unanswered question
  const firstUnanswered = QUESTIONS.findIndex(q => !answers.value[q.id])
  step.value = firstUnanswered >= 0 ? firstUnanswered : 0
  mode.value = 'questions'
}

function retake() {
  doRetake()
  step.value = 0
  mode.value = 'questions'
}

function nextQuestion() {
  if (isLastStep.value) {
    mode.value = 'result'
    saveToBackend()
  } else {
    next()
  }
}

async function saveToBackend() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return
  try {
    saving.value = true
    const v2 = v2Result.value
    const payload: Record<string, any> = {
      total: result.value.total,
      rating: result.value.rating,
      // V1 pillar scores from question flow
      heating: result.value.breakdown.heating,
      structure: result.value.breakdown.structure,
      efficiency: result.value.breakdown.efficiency,
      electrics: result.value.breakdown.electrics,
      plumbing: result.value.breakdown.plumbing,
      answers: answers.value,
    }
    // Attach V2 EPC fields if available
    if (v2) {
      payload.tier = v2.tier
      payload.baseBill = v2.baseBill
      payload.costPerSqm = v2.costPerSqm
      payload.costEfficiency = v2.components.costEfficiency
      payload.insulation = v2.components.insulation
      payload.heatingV2 = v2.components.heatingHW
      payload.controls = v2.components.controls
      payload.ventilation = v2.components.ventilation
      payload.lighting = v2.components.lighting
      payload.renewableBonus = v2.renewableBonus
      if (billComparison.value !== null) {
        payload.billDifference = billComparison.value
        payload.neighbourMedian = (neighbourStats.value?.median ?? 0) * (property.value?.floorAreaSqm ?? 1)
      }
    }
    await fetch(`${config.public.apiBase}/property/${propertyId}/homescore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
  } catch {} finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const [propRes, neighRes] = await Promise.allSettled([
      fetch(`${config.public.apiBase}/property/${propertyId}`),
      fetch(`${config.public.apiBase}/property/${propertyId}/neighbourhood`),
    ])
    if (propRes.status === 'fulfilled' && propRes.value.ok) {
      property.value = await propRes.value.json()
      prefill(property.value)
    }
    if (neighRes.status === 'fulfilled' && neighRes.value.ok) {
      const nd = await neighRes.value.json()
      if (nd.sampleSize >= 3) neighbourStats.value = nd
    }
  } catch {}
  determineMode()
})

// When composable marks showResult=true (last question answered), transition to full result
watch(showResult, (shown) => {
  if (!shown) return
  if (mode.value === 'questions') {
    mode.value = 'result'
    saveToBackend()
  } else if (mode.value === 'loading') {
    // Loaded from localStorage with all questions answered
    mode.value = 'result'
  }
})

function goBack() {
  router.push(`/property/${propertyId}`)
}

function epcColor(rating: string): string {
  const map: Record<string, string> = {
    A: '#00b050', B: '#33b800', C: '#92d050',
    D: '#d4e800', E: '#ffbf00', F: '#ff6600', G: '#ff0000',
  }
  return map[rating?.toUpperCase()] ?? '#8e8e93'
}
</script>

<style scoped>
.hs-page {
  min-height: 100vh;
  background: #f5f5f8;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

/* ─── Header ─────────────────────────────────────────── */
.hs-header {
  background: #231d45;
  display: flex;
  align-items: center;
  padding: 16px 20px;
  padding-top: calc(16px + env(safe-area-inset-top));
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.hs-back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.hs-back-btn:active { background: rgba(255,255,255,0.22); }
.hs-header-center { flex: 1; text-align: center; }
.hs-header-title { font-size: 16px; font-weight: 700; color: white; margin: 0; }
.hs-header-sub { font-size: 12px; color: rgba(255,255,255,0.6); margin: 2px 0 0; }
.hs-header-spacer { width: 36px; }

/* ─── Property strip ─────────────────────────────────── */
.hs-prop-strip {
  background: #fff;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.hs-prop-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #00a19a;
  flex-shrink: 0;
}
.hs-prop-address {
  flex: 1;
  font-size: 13px;
  color: #636366;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}
.hs-epc-chip {
  font-size: 10px;
  font-weight: 800;
  color: white;
  padding: 2px 7px;
  border-radius: 6px;
  flex-shrink: 0;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

/* ─── Shared result ring wrap ────────────────────────── */
.hs-result-ring-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 20px 20px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.hs-confidence-pill {
  margin-top: 10px;
  font-size: 12px;
  color: #00a19a;
  background: #e8f8f7;
  border-radius: 20px;
  padding: 5px 14px;
  font-weight: 600;
}
.hs-source-pill {
  margin-top: 10px;
  font-size: 12px;
  color: #8e8e93;
  background: #f2f2f7;
  border-radius: 20px;
  padding: 5px 14px;
  font-weight: 600;
}

/* ─── Auto score state ───────────────────────────────── */
.hs-auto-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hs-auto-info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #e8f8f7;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #b3ecea;
}
.hs-auto-info-icon { flex-shrink: 0; margin-top: 1px; }
.hs-auto-info-title {
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
  margin: 0 0 4px;
}
.hs-auto-info-body {
  font-size: 13px;
  color: #2d6a67;
  line-height: 1.45;
  margin: 0;
}
.hs-improve-card {
  background: #231d45;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hs-improve-title {
  font-size: 16px;
  font-weight: 700;
  color: white;
  margin: 0;
}
.hs-improve-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  line-height: 1.45;
  margin: 0;
}
.hs-improve-btn {
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

/* ─── Question flow ──────────────────────────────────── */
.hs-progress-wrap {
  background: #fff;
  padding: 14px 20px 10px;
  border-bottom: 1px solid #f0f0f0;
}
.hs-progress-track {
  height: 5px;
  background: #f2f2f7;
  border-radius: 100px;
  overflow: hidden;
}
.hs-progress-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 100px;
  transition: width 0.4s ease;
}
.hs-progress-label {
  font-size: 11px;
  color: #aeaeb2;
  margin: 6px 0 0;
  text-align: right;
}
.hs-content {
  flex: 1;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
}
.hs-question-wrap {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin-bottom: 20px;
  flex: 1;
}
.hs-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.hs-btn-spacer { flex: 1; }
.hs-btn-prev {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 20px;
  border-radius: 14px;
  background: #f2f2f7;
  border: none;
  font-size: 15px;
  color: #636366;
  font-weight: 600;
  cursor: pointer;
}
.hs-btn-next {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 28px;
  border-radius: 14px;
  background: #231d45;
  border: none;
  font-size: 15px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  flex: 1;
  justify-content: center;
  transition: opacity 0.15s;
}
.hs-btn-next:disabled {
  background: #e8e8ee;
  color: #aeaeb2;
  cursor: not-allowed;
}
.hs-btn-next:not(:disabled) { background: #00a19a; }

/* Slide transition */
.hs-slide-enter-active, .hs-slide-leave-active { transition: all 0.25s ease; }
.hs-slide-enter-from { opacity: 0; transform: translateX(24px); }
.hs-slide-leave-to { opacity: 0; transform: translateX(-24px); }

/* ─── Full result state ──────────────────────────────── */
.hs-result-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hs-cta-card {
  background: linear-gradient(135deg, #231d45 0%, #00a19a 100%);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hs-cta-icon { font-size: 28px; }
.hs-cta-title { font-size: 16px; font-weight: 700; color: white; margin: 0 0 4px; }
.hs-cta-sub { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.4; margin: 0; }
.hs-cta-btn {
  background: white;
  color: #231d45;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
}
.hs-retake-btn {
  background: #f2f2f7;
  border: none;
  border-radius: 14px;
  padding: 14px 20px;
  font-size: 14px;
  color: #636366;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

/* ─── Bill pill ──────────────────────────────────────── */
.hs-bill-pill {
  margin-top: 8px;
  font-size: 13px;
  color: #636366;
  background: #f2f2f7;
  border-radius: 20px;
  padding: 6px 14px;
  font-weight: 500;
}
.hs-bill-pill strong { color: #231d45; }

/* ─── Neighbourhood comparison card ─────────────────── */
.hs-neighbour-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid;
}
.hs-neighbour-good {
  background: #e8f8f7;
  border-color: #b3ecea;
}
.hs-neighbour-warn {
  background: #fffbeb;
  border-color: #fcd34d;
}
.hs-neighbour-icon { flex-shrink: 0; margin-top: 1px; }
.hs-neighbour-body { flex: 1; }
.hs-neighbour-title {
  font-size: 12px;
  font-weight: 600;
  color: #636366;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 4px;
}
.hs-neighbour-val {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 4px;
  line-height: 1.2;
}
.hs-neighbour-val--good { color: #00a19a; }
.hs-neighbour-val--warn { color: #d97706; }
.hs-neighbour-per-year {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
}
.hs-neighbour-sub {
  font-size: 11px;
  color: #8e8e93;
  margin: 0;
}

/* ─── V2 component breakdown ─────────────────────────── */
.hs-v2-breakdown {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.hs-v2-breakdown-title {
  font-size: 14px;
  font-weight: 700;
  color: #1c1c1e;
  margin: 0 0 16px;
}
.hs-v2-bar-list { display: flex; flex-direction: column; gap: 12px; }
.hs-v2-bar-row { display: flex; align-items: center; gap: 10px; }
.hs-v2-bar-label {
  display: flex;
  justify-content: space-between;
  width: 110px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #3a3a3c;
  gap: 4px;
}
.hs-v2-bar-weight { color: #aeaeb2; font-weight: 500; }
.hs-v2-bar-track {
  flex: 1;
  height: 8px;
  background: #f2f2f7;
  border-radius: 100px;
  overflow: hidden;
}
.hs-v2-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.6s ease;
}
.hs-v2-bar-score {
  width: 28px;
  text-align: right;
  font-size: 12px;
  font-weight: 700;
  color: #636366;
}

/* ─── Loading ────────────────────────────────────────── */
.hs-loading-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.hs-loading-ring {
  width: 48px; height: 48px;
  border: 4px solid #f2f2f7;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.hs-loading-label { font-size: 14px; color: #8e8e93; font-weight: 500; }
</style>
