import { ref, computed } from 'vue'

// Types
interface QuestionOption {
  value: string
  label: string
  icon?: string // Make icon optional
}

interface QuestionData {
  title: string
  subtitle?: string
  type: 'options' | 'budget' | 'multiple-options' // Add multiple-options type
  options?: QuestionOption[]
  allowMultiple?: boolean // Add flag for multiple selection
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
  const selectedAnswers = ref<string[]>([]) // For multiple selection
  const budgetRange = ref<BudgetRange>({
    min: 50,
    max: 1200,
    label: 'Between £150k and £250k',
  })

  const minBudget: number = 50
  const maxBudget: number = 2000
  const step: number = 25

  // Question data
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
          // No icon property for this question
        },
        {
          value: '6-months-1-year',
          label: '6 months - 1 year',
          // No icon property for this question
        },
        {
          value: '1-3-years',
          label: '1 - 3 years',
          // No icon property for this question
        },
        {
          value: '3-years-plus',
          label: '3+ years from now',
          // No icon property for this question
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
        { value: 'house', label: 'House', icon: 'house' },
        {
          value: 'apartment-flat',
          label: 'Apartment or Flat',
          icon: 'apartment',
        },
        { value: 'land', label: 'Land', icon: 'land' },
        {
          value: 'commercial',
          label: 'Commercial',
          icon: 'commercial',
        },
      ],
    },
    5: {
      title: 'What style of property are you looking for?',
      type: 'multiple-options',
      options: [
        { value: 'detached', label: 'Detached', icon: 'house' },
        {
          value: 'semi-detached',
          label: 'Semi-detached',
          icon: 'semiDetached',
        },
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
      type: 'multiple-options', // Changed to multiple-options
      allowMultiple: true, // Enable multiple selection
      options: [
        { value: 'garden', label: 'Garden', icon: 'garden' },
        {
          value: 'public-transport',
          label: 'Public transport',
          icon: 'publicTransport',
        },
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
        {
          value: 'close-to-schools',
          label: 'Close to schools',
          icon: 'closeToSchool',
        },
        {
          value: 'home-office',
          label: 'Home office space',
          icon: 'homeOfficeSpace',
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
        },
        {
          value: '6-months-1-year',
          label: '6 months - 1 year',
        },
        {
          value: '1-3-years',
          label: '1 - 3 years',
        },
        {
          value: '3-years-plus',
          label: '3+ years from now',
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

  // Check if current question allows multiple selection
  const isMultipleSelection = computed(() => {
    return questionData.value.type === 'multiple-options'
  })

  // Methods
  const selectOption = (option: QuestionOption): void => {
    if (isMultipleSelection.value) {
      // For multiple selection, toggle the option
      const index = selectedAnswers.value.indexOf(option.value)
      if (index > -1) {
        // Remove if already selected
        selectedAnswers.value.splice(index, 1)
      } else {
        // Add if not selected
        selectedAnswers.value.push(option.value)
      }
    } else {
      // For single selection, replace the value
      selectedAnswer.value = option.value
    }
  }

  const isOptionSelected = (optionValue: string): boolean => {
    if (isMultipleSelection.value) {
      return selectedAnswers.value.includes(optionValue)
    } else {
      return selectedAnswer.value === optionValue
    }
  }

  const skipQuestion = (): string => {
    console.log(`Skipped question ${currentQuestion}`)
    return getNextRoute()
  }

  const continueToNext = (): string | null => {
    if (questionData.value.type === 'budget') {
      // Budget questions are always valid
    } else if (isMultipleSelection.value) {
      // For multiple selection, check if at least one option is selected
      if (selectedAnswers.value.length === 0) return null
    } else {
      // For single selection, check if an option is selected
      if (!selectedAnswer.value) return null
    }

    // Save answer
    let answer: string
    if (questionData.value.type === 'budget') {
      answer = `Budget: ${budgetRange.value.min}k-${budgetRange.value.max}k`
    } else if (isMultipleSelection.value) {
      answer = `Multiple: ${selectedAnswers.value.join(', ')}`
    } else {
      answer = selectedAnswer.value || ''
    }

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
    selectedAnswers,
    budgetRange,
    totalQuestions,
    minBudget,
    maxBudget,
    step,

    // Computed
    questionData,
    isMultipleSelection,

    // Methods
    selectOption,
    isOptionSelected,
    skipQuestion,
    continueToNext,
    goBack,
    updateBudgetRange,
  }
}
