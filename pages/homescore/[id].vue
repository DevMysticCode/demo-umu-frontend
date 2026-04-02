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
        <p class="hs-header-title">Home Score</p>
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
            Auto-generated · {{ autoAnswersCount }} public data points
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
            <p class="hs-auto-info-body">This score was automatically generated using EPC data, year built, and heating type from public databases. Answer {{ QUESTIONS.length }} quick questions to get a precise, personalised score.</p>
          </div>
        </div>

        <!-- Breakdown -->
        <HomescoreBreakdownCard :breakdown="autoResult.breakdown" />

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
import AppHeader from '~/components/core/AppHeader.vue'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const propertyId = route.params.id as string

const property = ref<any>(null)
const saving = ref(false)

// mode: 'loading' | 'auto' | 'questions' | 'result'
type Mode = 'loading' | 'auto' | 'questions' | 'result'
const mode = ref<Mode>('loading')

const {
  step, answers, showResult,
  currentQuestion, currentAnswer,
  canNext, isLastStep, progress, result,
  answer, next, prev, retake: doRetake, prefill,
} = useHomeScore(propertyId)

// Auto-generated score: merge EPC prefill with any already-saved answers
const autoResult = computed(() => {
  if (!property.value) return { ...calculateScore({}), flags: [], actions: [] }
  const auto = getPrefillFromProperty(property.value)
  // User saved answers take priority over auto-inferred
  const merged = { ...auto, ...answers.value }
  return { ...calculateScore(merged), flags: [], actions: [] }
})
const autoAnswersCount = computed(() => {
  if (!property.value) return 0
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
    await fetch(`${config.public.apiBase}/property/${propertyId}/homescore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        total: result.value.total,
        rating: result.value.rating,
        heating: result.value.breakdown.heating,
        structure: result.value.breakdown.structure,
        efficiency: result.value.breakdown.efficiency,
        electrics: result.value.breakdown.electrics,
        plumbing: result.value.breakdown.plumbing,
        answers: answers.value,
      }),
    })
  } catch {} finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetch(`${config.public.apiBase}/property/${propertyId}`)
    if (res.ok) {
      property.value = await res.json()
      prefill(property.value)
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
