import { ref, computed, onMounted } from 'vue'

const STORAGE_KEY = 'op_questionnaire_answers'

interface QuestionOption {
  value: string
  label: string
  icon?: string
}

interface QuestionData {
  title: string
  subtitle?: string
  type: 'options' | 'budget' | 'multiple-options'
  options?: QuestionOption[]
  allowMultiple?: boolean
}

interface BudgetRange {
  min: number
  max: number
  label: string
}

interface QuestionsMap {
  [key: number]: QuestionData
}

// Persist accumulated answers across all question pages via localStorage
function loadStoredAnswers(): Record<number, any> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAnswer(questionNum: number, value: any) {
  if (typeof window === 'undefined') return
  const stored = loadStoredAnswers()
  stored[questionNum] = value
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

function clearStoredAnswers() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

function makeBudgetLabel(min: number, max: number, maxBudget: number): string {
  return `Between £${min}k and £${max === maxBudget ? max + 'k+' : max + 'k'}`
}

function mapPreferenceToAnswers(pref: any, maxBudget: number): Record<number, any> {
  const answers: Record<number, any> = {}
  if (pref.purpose) answers[1] = pref.purpose
  if (pref.buyingTimeline) answers[2] = pref.buyingTimeline
  if (pref.budgetMin != null || pref.budgetMax != null) {
    const min = pref.budgetMin ? Math.round(pref.budgetMin / 1000) : 50
    const max = pref.budgetMax ? Math.round(pref.budgetMax / 1000) : maxBudget
    answers[3] = { min, max, label: makeBudgetLabel(min, max, maxBudget) }
  }
  if (pref.propertyTypes?.length) answers[4] = pref.propertyTypes[0]
  if (pref.propertyStyles) answers[5] = pref.propertyStyles
  if (pref.importantFeatures) answers[6] = pref.importantFeatures
  if (pref.sellingTimeline) answers[7] = pref.sellingTimeline
  if (pref.propertyValue != null) {
    const max = Math.round(pref.propertyValue / 1000)
    answers[8] = { min: 50, max, label: makeBudgetLabel(50, max, maxBudget) }
  }
  return answers
}

async function submitToBackend(
  apiBase: string,
  allAnswers: Record<number, any>,
) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // Map question answers to the DTO shape
  const budgetQ3 = allAnswers[3] as BudgetRange | undefined
  const budgetQ8 = allAnswers[8] as BudgetRange | undefined

  const payload = {
    purpose: allAnswers[1] as string[] | undefined,
    buyingTimeline: allAnswers[2] as string | undefined,
    budgetMin: budgetQ3?.min ? budgetQ3.min * 1000 : undefined,
    budgetMax: budgetQ3?.max ? budgetQ3.max * 1000 : undefined,
    propertyTypes: allAnswers[4]
      ? ([allAnswers[4]] as string[])
      : undefined,
    propertyStyles: allAnswers[5] as string[] | undefined,
    importantFeatures: allAnswers[6] as string[] | undefined,
    sellingTimeline: allAnswers[7] as string | undefined,
    propertyValue: budgetQ8?.max ? budgetQ8.max * 1000 : undefined,
  }

  try {
    await fetch(`${apiBase}/onboarding/questionnaire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('Failed to save questionnaire:', err)
    // Non-fatal — user still proceeds to thank-you
  }
}

export const useQuestionnaireData = (currentQuestion: number) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const totalQuestions = 8

  // Pre-fill from any previously stored answer for this question
  const _stored = loadStoredAnswers()[currentQuestion]

  const selectedAnswer = ref<string | null>(
    _stored && !Array.isArray(_stored) && typeof _stored !== 'object' ? (_stored as string) : null,
  )
  const selectedAnswers = ref<string[]>(
    Array.isArray(_stored) ? (_stored as string[]) : [],
  )
  const budgetRange = ref<BudgetRange>(
    _stored && typeof _stored === 'object' && !Array.isArray(_stored)
      ? (_stored as BudgetRange)
      : { min: 50, max: 1200, label: 'Between £150k and £250k' },
  )

  const minBudget: number = 50
  const maxBudget: number = 2000
  const step: number = 25

  const questions: QuestionsMap = {
    1: {
      title: 'What brings you here today?',
      type: 'multiple-options',
      options: [
        {
          value: 'prospective-buyer',
          label: 'Prospective Buyer',
          icon: 'userRegistration',
        },
        { value: 'homeowner', label: 'Homeowner', icon: 'userRegistration' },
        { value: 'exploring', label: 'Exploring', icon: 'userRegistration' },
      ],
    },
    2: {
      title: 'How soon are you looking to buy?',
      type: 'options',
      options: [
        { value: 'less-than-6-months', label: 'Less than 6 months' },
        { value: '6-months-1-year', label: '6 months - 1 year' },
        { value: '1-3-years', label: '1 - 3 years' },
        { value: '3-years-plus', label: '3+ years from now' },
      ],
    },
    3: {
      title: "What's your budget range?",
      type: 'budget',
    },
    4: {
      title: 'What kind of property are you interested in?',
      type: 'options',
      options: [
        { value: 'house', label: 'House', icon: 'house' },
        { value: 'apartment-flat', label: 'Apartment or Flat', icon: 'apartment' },
        { value: 'land', label: 'Land', icon: 'land' },
        { value: 'commercial', label: 'Commercial', icon: 'commercial' },
      ],
    },
    5: {
      title: 'What style of property are you looking for?',
      type: 'multiple-options',
      options: [
        { value: 'detached', label: 'Detached', icon: 'house' },
        { value: 'semi-detached', label: 'Semi-detached', icon: 'semiDetached' },
        { value: 'terrace', label: 'Terrace', icon: 'terrace' },
        {
          value: 'single-floor-bungalow',
          label: 'Single floor or bungalow',
          icon: 'singleFloorBungalow',
        },
      ],
    },
    6: {
      title: 'What features matter most in a property?',
      type: 'multiple-options',
      allowMultiple: true,
      options: [
        { value: 'garden', label: 'Garden', icon: 'garden' },
        { value: 'public-transport', label: 'Public transport', icon: 'publicTransport' },
        {
          value: 'driveway-parking',
          label: 'Driveway or parking garage',
          icon: 'driveway',
        },
        {
          value: 'broadband-signal',
          label: 'Fast broadband & mobile signal',
          icon: 'mobileSignal',
        },
        {
          value: 'energy-efficiency',
          label: 'Good energy-efficiency rating',
          icon: 'goodEnergy',
        },
        {
          value: 'close-to-parks',
          label: 'Close to public parks',
          icon: 'closeToPublicPark',
        },
        { value: 'close-to-schools', label: 'Close to schools', icon: 'closeToSchool' },
        { value: 'home-office', label: 'Home office space', icon: 'homeOfficeSpace' },
      ],
    },
    7: {
      title: 'When are you planning to sell?',
      subtitle: 'Tell us your timeline so we can help you prepare effectively.',
      type: 'options',
      options: [
        { value: 'less-than-6-months', label: 'Less than 6 months' },
        { value: '6-months-1-year', label: '6 months - 1 year' },
        { value: '1-3-years', label: '1 - 3 years' },
        { value: '3-years-plus', label: '3+ years from now' },
      ],
    },
    8: {
      title: "What's the approximate value of your property?",
      subtitle: 'An estimate helps us provide you with better insights and tools.',
      type: 'budget',
    },
  }

  const questionData = computed<QuestionData>(
    () => questions[currentQuestion] || questions[1],
  )

  const isMultipleSelection = computed(
    () => questionData.value.type === 'multiple-options',
  )

  const selectOption = (option: QuestionOption): void => {
    if (isMultipleSelection.value) {
      const index = selectedAnswers.value.indexOf(option.value)
      if (index > -1) {
        selectedAnswers.value.splice(index, 1)
      } else {
        selectedAnswers.value.push(option.value)
      }
    } else {
      selectedAnswer.value = option.value
    }
  }

  const isOptionSelected = (optionValue: string): boolean => {
    if (isMultipleSelection.value) {
      return selectedAnswers.value.includes(optionValue)
    }
    return selectedAnswer.value === optionValue
  }

  const skipQuestion = (): string => {
    return getNextRoute()
  }

  const continueToNext = async (): Promise<string | null> => {
    if (questionData.value.type === 'budget') {
      // always valid
    } else if (isMultipleSelection.value) {
      if (selectedAnswers.value.length === 0) return null
    } else {
      if (!selectedAnswer.value) return null
    }

    // Persist this question's answer
    if (questionData.value.type === 'budget') {
      saveAnswer(currentQuestion, { ...budgetRange.value })
    } else if (isMultipleSelection.value) {
      saveAnswer(currentQuestion, [...selectedAnswers.value])
    } else {
      saveAnswer(currentQuestion, selectedAnswer.value)
    }

    // On the final question, submit everything to the backend
    if (currentQuestion === totalQuestions) {
      const allAnswers = loadStoredAnswers()
      await submitToBackend(apiBase, allAnswers)
      clearStoredAnswers()
    }

    return getNextRoute()
  }

  const getNextRoute = (): string => {
    if (currentQuestion < totalQuestions) {
      return `/onboarding/questionnaire/${currentQuestion + 1}`
    }
    return '/onboarding/questionnaire/thank-you'
  }

  const goBack = (): string => {
    if (currentQuestion > 1) {
      return `/onboarding/questionnaire/${currentQuestion - 1}`
    }
    return '/thank-you'
  }

  const updateBudgetRange = (newRange: Partial<BudgetRange>): void => {
    budgetRange.value = { ...budgetRange.value, ...newRange }
    const min = budgetRange.value.min
    const max = budgetRange.value.max
    budgetRange.value.label = `Between £${min}k and £${
      max === maxBudget ? max + 'k+' : max + 'k'
    }`
  }

  // If localStorage is completely empty (e.g. after a completed submission),
  // restore answers from the backend so revisiting questions shows saved data.
  onMounted(async () => {
    const allStored = loadStoredAnswers()
    // If any answers are in localStorage, refs were already pre-filled above — skip
    if (Object.keys(allStored).length > 0) return

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    try {
      const pref = await $fetch<any>(`${apiBase}/onboarding/questionnaire`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!pref) return

      const restored = mapPreferenceToAnswers(pref, maxBudget)
      if (Object.keys(restored).length === 0) return

      // Save all restored answers back to localStorage for subsequent question pages
      Object.entries(restored).forEach(([q, val]) => saveAnswer(Number(q), val))

      // Apply the current question's restored answer to the reactive refs
      const answer = restored[currentQuestion]
      if (answer === undefined) return

      if (Array.isArray(answer)) {
        selectedAnswers.value = answer
      } else if (typeof answer === 'object' && 'min' in answer) {
        budgetRange.value = answer
      } else {
        selectedAnswer.value = answer
      }
    } catch {
      // No saved preferences on backend — first-time user, do nothing
    }
  })

  return {
    selectedAnswer,
    selectedAnswers,
    budgetRange,
    totalQuestions,
    minBudget,
    maxBudget,
    step,
    questionData,
    isMultipleSelection,
    selectOption,
    isOptionSelected,
    skipQuestion,
    continueToNext,
    goBack,
    updateBudgetRange,
  }
}
