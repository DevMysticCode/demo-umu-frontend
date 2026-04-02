import { ref, computed } from 'vue'
import type { Answers, ScoreResult } from '~/types/homescore'
import { QUESTIONS, calculateScore, getPrefillFromProperty } from '~/utils/homescoreScoring'
import { getActiveRules } from '~/utils/homescoreRules'

const STORAGE_KEY = 'homescore_answers'

export function useHomeScore(propertyId: string, property?: { epcRating?: string | null; yearBuilt?: number | null }) {
  const step = ref(0)
  const answers = ref<Partial<Answers>>({})
  const showResult = ref(false)

  // Load from localStorage on init
  function load() {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${propertyId}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        answers.value = parsed.answers ?? {}
        // If all questions answered, can show result immediately
        if (Object.keys(parsed.answers ?? {}).length === QUESTIONS.length) {
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

  function prefill(prop: { epcRating?: string | null; yearBuilt?: number | null }) {
    const inferred = getPrefillFromProperty(prop)
    for (const [key, val] of Object.entries(inferred)) {
      if (!answers.value[key]) {
        answers.value[key as keyof Answers] = val
      }
    }
  }

  function answer(questionId: string, value: string) {
    answers.value = { ...answers.value, [questionId]: value }
    save()
  }

  function next() {
    if (step.value < QUESTIONS.length - 1) {
      step.value++
    } else {
      showResult.value = true
    }
  }

  function prev() {
    if (step.value > 0) step.value--
  }

  function retake() {
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

  const result = computed((): ScoreResult => {
    const base = calculateScore(answers.value)
    const activeRules = getActiveRules(answers.value)
    return {
      ...base,
      flags: activeRules.slice(0, 3).map(r => r.flag),
      actions: activeRules.slice(0, 3).map(r => r.action),
    }
  })

  if (property) prefill(property)
  load()

  return {
    step, answers, showResult,
    currentQuestion, currentAnswer, canNext, isLastStep, progress,
    result, QUESTIONS,
    answer, next, prev, retake, prefill,
  }
}
