import { ref, computed } from 'vue'

// Types
interface QuestionOption {
  value: string
  label: string
  icon: string
}

interface QuestionData {
  title: string
  subtitle?: string
  type: 'options' | 'budget'
  options?: QuestionOption[]
}

interface BudgetRange {
  min: number
  max: number
  label: string
}

interface QuestionsMap {
  [key: number]: QuestionData
}

export const useQuestionnaireData = (currentQuestion: number) => {
  const totalQuestions = 8
  const selectedAnswer = ref<string | null>(null)
  const budgetRange = ref<BudgetRange>({
    min: 100,
    max: 200,
    label: 'Between £150k and £250k',
  })

  const minBudget: number = 50
  const maxBudget: number = 350
  const step: number = 50

  // Question data
  const questions: QuestionsMap = {
    1: {
      title: 'What brings you here today?',
      type: 'options',
      options: [
        {
          value: 'prospective-buyer',
          label: 'Prospective Buyer',
          icon: 'userRegistration',
        },
        { value: 'homeowner', label: 'Homeowner', icon: 'userRegistration' },
        {
          value: 'exploring',
          label: 'Exploring',
          icon: 'userRegistration',
        },
      ],
    },
    2: {
      title: 'How soon are you looking to buy?',
      type: 'options',
      options: [
        {
          value: 'less-than-6-months',
          label: 'Less than 6 months',
          icon: 'i-heroicons-clock',
        },
        {
          value: '6-months-1-year',
          label: '6 months - 1 year',
          icon: 'i-heroicons-calendar',
        },
        {
          value: '1-3-years',
          label: '1 - 3 years',
          icon: 'i-heroicons-calendar-days',
        },
        {
          value: '3-years-plus',
          label: '3+ years from now',
          icon: 'i-heroicons-calendar',
        },
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
        { value: 'house', label: 'House', icon: 'i-heroicons-home' },
        {
          value: 'apartment-flat',
          label: 'Apartment or Flat',
          icon: 'i-heroicons-building-office',
        },
        { value: 'land', label: 'Land', icon: 'i-heroicons-map' },
        {
          value: 'commercial',
          label: 'Commercial',
          icon: 'i-heroicons-building-office-2',
        },
      ],
    },
    5: {
      title: 'What style of property are you looking for?',
      type: 'options',
      options: [
        { value: 'detached', label: 'Detached', icon: 'i-heroicons-home' },
        {
          value: 'semi-detached',
          label: 'Semi-detached',
          icon: 'i-heroicons-home',
        },
        { value: 'terrace', label: 'Terrace', icon: 'i-heroicons-home' },
        {
          value: 'single-floor-bungalow',
          label: 'Single floor or bungalow',
          icon: 'i-heroicons-home',
        },
      ],
    },
    6: {
      title: 'What style of property are you looking for?',
      type: 'options',
      options: [
        { value: 'detached', label: 'Detached', icon: 'i-heroicons-home' },
        {
          value: 'semi-detached',
          label: 'Semi-detached',
          icon: 'i-heroicons-home',
        },
        { value: 'terrace', label: 'Terrace', icon: 'i-heroicons-home' },
        {
          value: 'single-floor-bungalow',
          label: 'Single floor or bungalow',
          icon: 'i-heroicons-home',
        },
      ],
    },
    7: {
      title: 'When are you planning to sell?',
      subtitle: 'Tell us your timeline so we can help you prepare effectively.',
      type: 'options',
      options: [
        {
          value: 'less-than-6-months',
          label: 'Less than 6 months',
          icon: 'i-heroicons-clock',
        },
        {
          value: '6-months-1-year',
          label: '6 months - 1 year',
          icon: 'i-heroicons-calendar',
        },
        {
          value: '1-3-years',
          label: '1 - 3 years',
          icon: 'i-heroicons-calendar-days',
        },
        {
          value: '3-years-plus',
          label: '3+ years from now',
          icon: 'i-heroicons-calendar',
        },
      ],
    },
    8: {
      title: "What's the approximate value of your property?",
      subtitle:
        'An estimate helps us provide you with better insights and tools.',
      type: 'budget',
    },
  }

  const questionData = computed<QuestionData>(() => {
    return questions[currentQuestion] || questions[1]
  })

  // Methods
  const selectOption = (option: QuestionOption): void => {
    selectedAnswer.value = option.value
  }

  const skipQuestion = (): string => {
    console.log(`Skipped question ${currentQuestion}`)
    return getNextRoute()
  }

  const continueToNext = (): string | null => {
    if (!selectedAnswer.value && questionData.value.type !== 'budget')
      return null

    // Save answer
    const answer =
      selectedAnswer.value ||
      `Budget: ${budgetRange.value.min}k-${budgetRange.value.max}k`
    console.log(`Question ${currentQuestion}: ${answer}`)

    return getNextRoute()
  }

  const getNextRoute = (): string => {
    if (currentQuestion < totalQuestions) {
      return `/onboarding/questionnaire/${currentQuestion + 1}`
    } else {
      return '/onboarding/questionnaire/thank-you'
    }
  }

  const goBack = (): string => {
    if (currentQuestion > 1) {
      return `/onboarding/questionnaire/${currentQuestion - 1}`
    } else {
      return '/thank-you'
    }
  }

  const updateBudgetRange = (newRange: Partial<BudgetRange>): void => {
    budgetRange.value = { ...budgetRange.value, ...newRange }

    // Update the label when range changes
    const min = budgetRange.value.min
    const max = budgetRange.value.max
    budgetRange.value.label = `Between £${min}k and £${
      max === maxBudget ? max + 'k+' : max + 'k'
    }`
  }

  return {
    // State
    selectedAnswer,
    budgetRange,
    totalQuestions,
    minBudget,
    maxBudget,
    step,

    // Computed
    questionData,

    // Methods
    selectOption,
    skipQuestion,
    continueToNext,
    goBack,
    updateBudgetRange,
  }
}
