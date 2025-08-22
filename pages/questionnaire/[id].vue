<template>
  <div class="mobile-container gradient-bg backgound-image">
    <div class="relative z-10">
      <!-- Main Content -->
      <main class="pt-6 pb-32 px-6 flex flex-col justify-between min-h-screen">
        <!-- Back Button and Skip -->
        <div class="flex items-center justify-between mb-6">
          <BackButton />
          <UButton
            class="logo-and-skip__button bg-black/50 text-white font-medium text-[17px] px-2 py-1 rounded-full transition-all duration-200 hover:bg-brand-aqua"
            @click="onClick"
          >
            Skip
          </UButton>
        </div>
        <!-- Question Content -->
        <div class="flex-1 flex flex-col justify-center">
          <!-- Question Number -->
          <div class="text-white/60 text-sm mb-4">
            Question {{ currentQuestion
            }}{{ selectedAnswer ? ' - Filled' : '' }}
          </div>

          <!-- Question Title -->
          <h1 class="text-28-emphasized text-white mb-12 leading-tight">
            {{ questionData.title }}
          </h1>

          <!-- Question Subtitle -->
          <p
            v-if="questionData.subtitle"
            class="text-16-medium text-white/70 mb-8 -mt-8"
          >
            {{ questionData.subtitle }}
          </p>

          <!-- Budget Range Slider (Questions 3 & 9) -->
          <div v-if="questionData.type === 'budget'" class="space-y-6">
            <div class="text-center text-white mb-8">
              <p class="text-lg">{{ budgetRange.label }}</p>
            </div>

            <div class="relative">
              <!-- Slider Track -->
              <div class="w-full h-2 bg-white/20 rounded-full relative">
                <div
                  class="h-2 bg-white rounded-full"
                  :style="{ width: budgetRange.percentage + '%' }"
                ></div>
                <!-- Slider Handle -->
                <div
                  class="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg cursor-pointer"
                  :style="{
                    left: budgetRange.percentage + '%',
                    marginLeft: '-12px',
                  }"
                  @mousedown="startDrag"
                  @touchstart="startDrag"
                ></div>
              </div>

              <!-- Range Labels -->
              <div class="flex justify-between text-white/60 text-sm mt-2">
                <span>£50k</span>
                <span>£100k</span>
                <span>£150k</span>
                <span>£200k</span>
                <span>£250k</span>
                <span>£300k</span>
                <span>£350k</span>
                <span>£400k+</span>
              </div>
            </div>
          </div>

          <!-- Regular Options -->
          <div v-else class="space-y-4">
            <div
              v-for="option in questionData.options"
              :key="option.value"
              @click="selectOption(option)"
              class="flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200"
              :class="
                selectedAnswer === option.value
                  ? 'bg-white border-2 border-white'
                  : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
              "
            >
              <Icon
                :name="option.icon"
                class="w-6 h-6 mr-4"
                :class="
                  selectedAnswer === option.value
                    ? 'text-brand-aqua'
                    : 'text-white'
                "
              />
              <span
                class="font-medium"
                :class="
                  selectedAnswer === option.value
                    ? 'text-gray-900'
                    : 'text-white'
                "
              >
                {{ option.label }}
              </span>
              <div v-if="selectedAnswer === option.value" class="ml-auto">
                <Icon
                  name="i-heroicons-check-circle"
                  class="w-6 h-6 text-brand-aqua"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Continue Button -->
        <div class="pt-8">
          <button
            @click="continueToNext"
            :disabled="!selectedAnswer && questionData.type !== 'budget'"
            class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 disabled:bg-white/20 disabled:text-white/50 text-white font-17-medium rounded-xl transition-colors flex items-center justify-center"
          >
            Continue
            <Icon name="i-heroicons-arrow-right" class="w-5 h-5 ml-2" />
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import BackButton from '../../components/BackButton.vue'

definePageMeta({
  title: 'Questionnaire - UmovingU',
})

const route = useRoute()
const currentQuestion = parseInt(route.params.id)
const totalQuestions = 8

const selectedAnswer = ref(null)
const budgetRange = ref({
  percentage: 40,
  label: 'Between £150k and £250k',
})

// Question data based on screenshots
const questions = {
  1: {
    title: 'What brings you here today?',
    type: 'options',
    options: [
      {
        value: 'prospective-buyer',
        label: 'Prospective Buyer',
        icon: 'i-heroicons-user',
      },
      { value: 'homeowner', label: 'Homeowner', icon: 'i-heroicons-home' },
      {
        value: 'exploring',
        label: 'Exploring',
        icon: 'i-heroicons-magnifying-glass',
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

const questionData = computed(() => {
  return questions[currentQuestion] || questions[1]
})

// Budget slider methods
const startDrag = (event) => {
  if (questionData.value.type !== 'budget') return

  const handleDrag = (e) => {
    const rect = event.target.parentElement.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))

    budgetRange.value.percentage = percentage
    updateBudgetLabel(percentage)
  }

  const stopDrag = () => {
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('touchmove', handleDrag)
    document.removeEventListener('touchend', stopDrag)
    selectedAnswer.value = 'budget-selected'
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('touchend', stopDrag)
}

const updateBudgetLabel = (percentage) => {
  const ranges = [
    { min: 0, max: 12.5, label: 'Between £50k and £100k' },
    { min: 12.5, max: 25, label: 'Between £100k and £150k' },
    { min: 25, max: 37.5, label: 'Between £150k and £200k' },
    { min: 37.5, max: 50, label: 'Between £200k and £250k' },
    { min: 50, max: 62.5, label: 'Between £250k and £300k' },
    { min: 62.5, max: 75, label: 'Between £300k and £350k' },
    { min: 75, max: 87.5, label: 'Between £350k and £400k' },
    { min: 87.5, max: 100, label: 'Above £400k' },
  ]

  const range =
    ranges.find((r) => percentage >= r.min && percentage < r.max) ||
    ranges[ranges.length - 1]
  budgetRange.value.label = range.label
}

// Methods
const selectOption = (option) => {
  selectedAnswer.value = option.value
}

const continueToNext = () => {
  if (!selectedAnswer.value && questionData.value.type !== 'budget') return

  // Save answer
  console.log(
    `Question ${currentQuestion}: ${
      selectedAnswer.value || budgetRange.value.label
    }`
  )

  if (currentQuestion < totalQuestions) {
    navigateTo(`/questionnaire/${currentQuestion + 1}`)
  } else {
    // Finished questionnaire - go to thank you page
    navigateTo('/thank-you-questionnaire')
  }
}

const skipQuestion = () => {
  if (currentQuestion < totalQuestions) {
    navigateTo(`/questionnaire/${currentQuestion + 1}`)
  } else {
    navigateTo('/thank-you-questionnaire')
  }
}

const goBack = () => {
  if (currentQuestion > 1) {
    navigateTo(`/questionnaire/${currentQuestion - 1}`)
  } else {
    navigateTo('/thank-you')
  }
}

// Initialize budget slider
onMounted(() => {
  if (questionData.value.type === 'budget') {
    updateBudgetLabel(budgetRange.value.percentage)
  }
})
</script>
