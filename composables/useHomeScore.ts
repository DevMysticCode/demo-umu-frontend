import { ref, computed } from 'vue'
import type { Answers, ScoreResult } from '~/types/homescore'
import { QUESTIONS, BASE_SCORE, CARBON_BASELINE, calculateScore, getPrefillFromProperty, getTopWins, getOpportunities } from '~/utils/homescoreScoring'

const STORAGE_KEY = 'homescore_answers'

export function useHomeScore(propertyId: string, property?: { epcRating?: string | null; yearBuilt?: number | null; heatingType?: string | null }) {
  const step = ref(0)
  const answers = ref<Partial<Answers>>({})
  const showResult = ref(false)
  const autoAdvanceTimer = ref<ReturnType<typeof setTimeout> | null>(null)

  function load() {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${propertyId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        answers.value = parsed.answers ?? {}
        if (Object.keys(parsed.answers ?? {}).length >= QUESTIONS.length) {
          showResult.value = true
        }
      }
    } catch {}
  }

  function save() {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${propertyId}`, JSON.stringify({
        answers: answers.value,
        savedAt: Date.now(),
      }))
    } catch {}
  }

  function prefill(prop: { epcRating?: string | null; yearBuilt?: number | null; heatingType?: string | null }) {
    const inferred = getPrefillFromProperty(prop)
    for (const [key, val] of Object.entries(inferred)) {
      if (!answers.value[key]) {
        answers.value[key as keyof Answers] = val
      }
    }
  }

  function answer(questionId: string, value: string, autoAdvance = false) {
    answers.value = { ...answers.value, [questionId]: value }
    save()
    if (autoAdvance) {
      if (autoAdvanceTimer.value) clearTimeout(autoAdvanceTimer.value)
      autoAdvanceTimer.value = setTimeout(() => next(), 850)
    }
  }

  function next() {
    if (autoAdvanceTimer.value) { clearTimeout(autoAdvanceTimer.value); autoAdvanceTimer.value = null }
    if (step.value < QUESTIONS.length - 1) {
      step.value++
    } else {
      showResult.value = true
    }
  }

  function prev() {
    if (autoAdvanceTimer.value) { clearTimeout(autoAdvanceTimer.value); autoAdvanceTimer.value = null }
    if (step.value > 0) step.value--
  }

  function retake() {
    if (autoAdvanceTimer.value) { clearTimeout(autoAdvanceTimer.value); autoAdvanceTimer.value = null }
    answers.value = {}
    step.value = 0
    showResult.value = false
    try { localStorage.removeItem(`${STORAGE_KEY}_${propertyId}`) } catch {}
  }

  const currentQuestion = computed(() => QUESTIONS[step.value])
  const currentAnswer = computed(() => answers.value[QUESTIONS[step.value]?.id ?? ''])
  const canNext = computed(() => !!currentAnswer.value)
  const isLastStep = computed(() => step.value === QUESTIONS.length - 1)
  const progress = computed(() => Math.round((step.value / QUESTIONS.length) * 100))

  const result = computed((): ScoreResult => calculateScore(answers.value))

  const topWins = computed(() => getTopWins(answers.value))
  const opportunities = computed(() => getOpportunities(answers.value))

  // Live score during question flow — partial calculation from answered questions only
  const liveScore = computed(() => {
    let delta = 0
    for (const q of QUESTIONS) {
      const val = answers.value[q.id]
      if (!val) continue
      const opt = q.options.find(o => o.value === val)
      if (opt) delta += opt.delta
    }
    return Math.max(0, Math.min(100, Math.round(BASE_SCORE + delta)))
  })

  // Confidence: 20% base + up to 35% from answers (scales with answered / total)
  const confidence = computed(() => {
    const answered = Object.keys(answers.value).length
    return Math.round(20 + (answered / QUESTIONS.length) * 35)
  })

  const carbonKg = computed(() => {
    let delta = 0
    for (const q of QUESTIONS) {
      const val = answers.value[q.id]
      if (!val) continue
      const opt = q.options.find(o => o.value === val)
      if (opt) delta += opt.carbonDelta
    }
    return Math.max(400, Math.min(6000, CARBON_BASELINE + delta))
  })

  // Auto-score from prefill only (no user answers layered in)
  const autoScore = computed(() => {
    if (!property) return null
    const prefilled = getPrefillFromProperty(property)
    const prefillCount = Object.keys(prefilled).length
    if (prefillCount === 0) return null
    return calculateScore(prefilled)
  })

  if (property) prefill(property)
  load()

  return {
    step, answers, showResult,
    currentQuestion, currentAnswer, canNext, isLastStep, progress,
    result, topWins, opportunities,
    liveScore, confidence, carbonKg, autoScore,
    QUESTIONS,
    answer, next, prev, retake, prefill,
  }
}
