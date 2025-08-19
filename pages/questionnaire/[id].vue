<template>
  <div class="mobile-container gradient-bg">
    <!-- Header -->
    <header class="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm z-50">
      <div class="flex items-center justify-between px-4 py-3 bg-black/10 backdrop-blur-sm">
        <UButton 
          @click="goBack"
          variant="ghost" 
          icon="i-heroicons-arrow-left"
          class="text-white"
        />
        <div class="text-white font-semibold text-17-medium">
          9:41
        </div>
        <UButton
          v-if="currentQuestion < totalQuestions"
          @click="skipQuestion"
          variant="link"
          class="text-white/70 p-0"
        >
          Skip
        </UButton>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-20 pb-32 px-6 flex flex-col justify-between min-h-screen">
      <!-- Question Content -->
      <div class="flex-1 flex flex-col justify-center">
        <!-- Question Number -->
        <div class="text-white/60 text-sm mb-4">
          Question {{ currentQuestion }}{{ currentQuestion === 1 && selectedAnswer ? ' - Filled' : '' }}{{ currentQuestion === 2 && selectedAnswer ? ' - Filled' : '' }}
        </div>

        <!-- Question Title -->
        <h1 class="text-28-emphasized text-white mb-12 leading-tight">
          {{ questionData.title }}
        </h1>

        <!-- Answer Options -->
        <div class="space-y-4">
          <div
            v-for="option in questionData.options"
            :key="option.value"
            @click="selectOption(option)"
            class="flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200"
            :class="selectedAnswer === option.value 
              ? 'bg-brand-aqua/20 border-2 border-brand-aqua' 
              : 'bg-white/10 border-2 border-transparent hover:bg-white/20'"
          >
            <Icon :name="option.icon" class="w-6 h-6 text-white mr-4" />
            <span class="text-white font-medium">{{ option.label }}</span>
            <div v-if="selectedAnswer === option.value" class="ml-auto">
              <Icon name="i-heroicons-check-circle" class="w-6 h-6 text-brand-aqua" />
            </div>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="pt-8">
        <button
          @click="continueToNext"
          :disabled="!selectedAnswer"
          class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 disabled:bg-white/20 disabled:text-white/50 text-white font-17-medium rounded-xl transition-colors flex items-center justify-center"
        >
          Continue
          <Icon name="i-heroicons-arrow-right" class="w-5 h-5 ml-2" />
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Questionnaire - UmovingU'
})

const route = useRoute()
const currentQuestion = parseInt(route.params.id)
const totalQuestions = 8

const selectedAnswer = ref(null)

// Question data based on screenshots
const questions = {
  1: {
    title: "What brings you here today?",
    options: [
      { value: 'prospective-buyer', label: 'Prospective Buyer', icon: 'i-heroicons-user' },
      { value: 'homeowner', label: 'Homeowner', icon: 'i-heroicons-home' },
      { value: 'exploring', label: 'Exploring', icon: 'i-heroicons-magnifying-glass' }
    ]
  },
  2: {
    title: "How soon are you looking to buy?",
    options: [
      { value: 'less-than-6-months', label: 'Less than 6 months', icon: 'i-heroicons-clock' },
      { value: '6-months-1-year', label: '6 months - 1 year', icon: 'i-heroicons-calendar' },
      { value: '1-3-years', label: '1 - 3 years', icon: 'i-heroicons-calendar-days' },
      { value: '3-years-plus', label: '3+ years from now', icon: 'i-heroicons-calendar' }
    ]
  },
  7: {
    title: "What brings you here today?",
    options: [
      { value: 'prospective-buyer', label: 'Prospective Buyer', icon: 'i-heroicons-user' },
      { value: 'homeowner', label: 'Homeowner', icon: 'i-heroicons-home' },
      { value: 'exploring', label: 'Exploring', icon: 'i-heroicons-magnifying-glass' }
    ]
  },
  8: {
    title: "How soon are you looking to buy?",
    options: [
      { value: 'less-than-6-months', label: 'Less than 6 months', icon: 'i-heroicons-clock' },
      { value: '6-months-1-year', label: '6 months - 1 year', icon: 'i-heroicons-calendar' },
      { value: '1-3-years', label: '1 - 3 years', icon: 'i-heroicons-calendar-days' },
      { value: '3-years-plus', label: '3+ years from now', icon: 'i-heroicons-calendar' }
    ]
  }
}

const questionData = computed(() => {
  return questions[currentQuestion] || questions[1]
})

// Methods
const selectOption = (option) => {
  selectedAnswer.value = option.value
}

const continueToNext = () => {
  if (!selectedAnswer.value) return
  
  // Save answer (you can implement this)
  console.log(`Question ${currentQuestion}: ${selectedAnswer.value}`)
  
  if (currentQuestion < totalQuestions) {
    navigateTo(`/questionnaire/${currentQuestion + 1}`)
  } else {
    // Finished questionnaire
    navigateTo('/dashboard')
  }
}

const skipQuestion = () => {
  if (currentQuestion < totalQuestions) {
    navigateTo(`/questionnaire/${currentQuestion + 1}`)
  } else {
    navigateTo('/dashboard')
  }
}

const goBack = () => {
  if (currentQuestion > 1) {
    navigateTo(`/questionnaire/${currentQuestion - 1}`)
  } else {
    navigateTo('/thank-you')
  }
}

// Load saved answer if exists
onMounted(() => {
  // You can implement loading saved answers here
})
</script>