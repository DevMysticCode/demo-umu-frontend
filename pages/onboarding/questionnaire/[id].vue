<template>
  <div class="mobile-container questionnaire-container backgound-image">
    <div class="relative z-10">
      <main class="questionnaire-main">
        <!-- Header with Back Button and Skip -->
        <QuestionHeader @skip="handleSkip" />

        <!-- Question Content -->
        <QuestionContent
          :current-question="currentQuestion"
          :question-data="questionData"
          :selected-answer="selectedAnswer"
        >
          <!-- Budget Range Slider (Questions 3 & 8) -->
          <BudgetSlider
            v-if="questionData.type === 'budget'"
            :budget-range="budgetRange"
            :min-budget="minBudget"
            :max-budget="maxBudget"
            :step="step"
            @update:budget-range="updateBudgetRange"
          />

          <!-- Regular Options -->
          <QuestionOptions
            v-else
            :options="questionData.options"
            :selected-answer="selectedAnswer"
            @select="selectOption"
          />
        </QuestionContent>

        <!-- Continue Button -->
        <ContinueButton
          :disabled="!selectedAnswer && questionData.type !== 'budget'"
          @continue="handleContinue"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useQuestionnaireData } from '@/composables/useQuestionnaireData'
import QuestionHeader from '@/components/questionnaire/QuestionHeader.vue'
import QuestionContent from '@/components/questionnaire/QuestionContent.vue'
import QuestionOptions from '@/components/questionnaire/QuestionOptions.vue'
import BudgetSlider from '@/components/questionnaire/BudgetSlider.vue'
import ContinueButton from '@/components/questionnaire/ContinueButton.vue'

// For non-Nuxt environments, we'll use a simple approach
const route = useRoute ? useRoute() : { params: { id: '1' } }
const router = useRouter ? useRouter() : null

const currentQuestion = parseInt(route.params.id) || 1

// Use the composable
const {
  selectedAnswer,
  budgetRange,
  totalQuestions,
  minBudget,
  maxBudget,
  step,
  questionData,
  selectOption,
  skipQuestion,
  continueToNext,
  goBack,
  updateBudgetRange,
} = useQuestionnaireData(currentQuestion)

// Navigation helpers
const navigateToRoute = (route) => {
  if (router) {
    router.push(route)
  } else {
    // Fallback for non-router environments
    window.location.href = route
  }
}

// Event handlers
const handleSkip = () => {
  const nextRoute = skipQuestion()
  if (nextRoute) {
    navigateToRoute(nextRoute)
  }
}

const handleContinue = () => {
  const nextRoute = continueToNext()
  if (nextRoute) {
    navigateToRoute(nextRoute)
  }
}

// Set page meta if available
if (typeof definePageMeta === 'function') {
  definePageMeta({
    title: 'Questionnaire - UmovingU',
  })
}
</script>

<style>
@import '@/assets/css/questionnaire.css';
</style>
