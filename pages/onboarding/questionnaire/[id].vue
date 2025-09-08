<template>
  <div class="mobile-container questionnaire-page">
    <!-- Header with Back Button -->
    <div class="questionnaire-page__header">
      <BackButton customClass="text-brand-aqua" />
    </div>

    <!-- Main Content -->
    <div class="questionnaire-page__content">
      <!-- Question Title -->
      <h1 class="questionnaire-page__title">
        {{ displayedTitle
        }}<span
          class="questionnaire-page__cursor"
          :class="{ 'questionnaire-page__cursor--blink': showCursor }"
          >|</span
        >
      </h1>

      <!-- Question Options -->
      <div class="questionnaire-page__options">
        <!-- Budget Range Slider (Questions 3 & 8) -->
        <div
          v-if="questionData.type === 'budget'"
          class="questionnaire-page__option-list"
          :class="{ 'budget-slider--visible': showOptions }"
        >
          <BudgetSlider
            :budget-range="budgetRange"
            :min-budget="minBudget"
            :max-budget="maxBudget"
            :step="step"
            @update:budget-range="updateBudgetRange"
          />
        </div>

        <!-- Regular Options -->
        <div
          v-else
          class="questionnaire-page__option-list"
          :class="{ 'questionnaire-page__option-list--visible': showOptions }"
        >
          <div
            v-for="option in questionData.options"
            :key="option.value"
            @click="selectOption(option)"
            class="questionnaire-page__option"
            :class="{
              'questionnaire-page__option--selected': isOptionSelected(
                option.value
              ),
            }"
          >
            <div class="questionnaire-page__option-content">
              <!-- Only show icon if it exists -->
              <span v-if="option.icon" class="questionnaire-page__option-icon">
                <OPIcon :name="option.icon" class="w-[15px] h-[15px]" />
              </span>
              <span class="questionnaire-page__option-label">{{
                option.label
              }}</span>
            </div>
            <div class="questionnaire-page__option-radio">
              <!-- <div
                class="questionnaire-page__check-button"
                :class="{
                  'questionnaire-page__check-button--selected':
                    isOptionSelected(option.value),
                  'questionnaire-page__check-button--multiple':
                    isMultipleSelection,
                }"
              >
                <span
                  v-if="isOptionSelected(option.value)"
                  class="questionnaire-page__check-mark"
                >
                  ✓
                </span>
              </div> -->

              <div
                class="questionnaire-page__check-button"
                :class="{
                  'questionnaire-page__check-button--selected':
                    isOptionSelected(option.value),
                  'questionnaire-page__check-button--multiple':
                    isMultipleSelection,
                }"
              >
                <!-- No selection icon -->
                <OPIcon
                  v-if="!isOptionSelected(option.value)"
                  name="radioUnchecked"
                  class="w-[18px] h-[18px] text-white"
                />
                <!-- Single selection icon -->
                <OPIcon
                  v-if="isOptionSelected(option.value) && !isMultipleSelection"
                  name="radioChecked"
                  class="w-[18px] h-[18px] text-white"
                />

                <!-- Multiple selection icon -->
                <OPIcon
                  v-if="isOptionSelected(option.value) && isMultipleSelection"
                  name="radioChecked"
                  class="w-[18px] h-[18px] text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Continue Button -->
    <div
      class="questionnaire-page__footer"
      :class="{ 'questionnaire-page__footer--visible': showOptions }"
    >
      <ContinueButton
        :disabled="!isQuestionAnswered"
        @continue="handleContinue"
      />
    </div>
  </div>
</template>

<script setup>
import { useQuestionnaireData } from '@/composables/useQuestionnaireData'
import BudgetSlider from '@/components/questionnaire/BudgetSlider.vue'
import BackButton from '@/components/BackButton.vue'
import OPIcon from '@/components/OPIcon.vue'
import ContinueButton from '@/components/ContinueButton.vue'

// For non-Nuxt environments, we'll use a simple approach
const route = useRoute()
const router = useRouter()

const currentQuestion = parseInt(route.params.id) || 1

// Typewriter effect state
const displayedTitle = ref('')
const showCursor = ref(true)
const showOptions = ref(false)

// Use the composable
const {
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
  updateBudgetRange,
} = useQuestionnaireData(currentQuestion)

// Computed property to check if question is answered
const isQuestionAnswered = computed(() => {
  if (questionData.value.type === 'budget') {
    return true // Budget questions are always considered answered
  } else if (isMultipleSelection.value) {
    return selectedAnswers.value.length > 0
  } else {
    return !!selectedAnswer.value
  }
})

// Start typewriter effect on mount
onMounted(() => {
  if (questionData.value.title) {
    typewriterEffect(questionData.value.title)
  }
})
// Typewriter effect function
const typewriterEffect = (text, callback) => {
  displayedTitle.value = ''
  showCursor.value = true
  showOptions.value = false

  let index = 0
  const typeInterval = setInterval(() => {
    if (index < text.length) {
      displayedTitle.value += text.charAt(index)
      index++
    } else {
      clearInterval(typeInterval)
      showCursor.value = false
      showOptions.value = true
      if (callback) callback()
    }
  }, 50) // Typing speed: 50ms per character
}

// Watch for question changes and trigger typewriter effect
watch(
  () => questionData.value.title,
  (newTitle) => {
    if (newTitle) {
      typewriterEffect(newTitle)
    }
  }
)
// Navigation helpers
const navigateToRoute = (route) => {
  if (router) {
    router.push(route)
  } else {
    // Fallback for non-router environments
    window.location.href = route
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

<style scoped>
/* Questionnaire Page */
.questionnaire-page {
  min-height: 100vh;
  background-color: #f3f4f6;
  max-width: 428px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    180deg,
    #f1f1f1 0%,
    #eff3f3 74.35%,
    #e6fbfa 99.53%
  );
}

/* Status Bar */
.questionnaire-page__status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.questionnaire-page__time {
  font-weight: 600;
}

.questionnaire-page__indicators {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.questionnaire-page__signal,
.questionnaire-page__wifi,
.questionnaire-page__battery {
  font-size: 0.75rem;
}

/* Header */
.questionnaire-page__header {
  padding: 11px 16px;
}

.questionnaire-page__back {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: #00a19a;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.questionnaire-page__back:hover {
  color: rgba(0, 161, 154, 0.8);
}

.questionnaire-page__back-icon {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

/* Content */
.questionnaire-page__content {
  @apply flex flex-col justify-start;
  flex: 1;
  padding: 0 1rem;
}

.questionnaire-page__title {
  font-size: 34px;
  font-weight: 700;
  color: #00a19a;
  margin-bottom: 24px;
  margin-top: 32px;
  min-height: 4.5rem; /* Reserve space for typewriter effect */
  font-style: normal;
  line-height: 41px;
  letter-spacing: 0.4px;
  padding: 16px 20px 20px 20px;
}

/* Typewriter Cursor */
.questionnaire-page__cursor {
  color: #00a19a;
  font-weight: 300;
  animation: none;
}

.questionnaire-page__cursor--blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* Options */
.questionnaire-page__options {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.questionnaire-page__option-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.questionnaire-page__option-list--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Budget Slider Container */
.budget-slider--visible {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.questionnaire-page__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background-color: white;
  border: 2px solid transparent;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.questionnaire-page__option:hover {
  border-color: #e5e7eb;
}

.questionnaire-page__option--selected {
  background-color: #e6f7f6;
  border-color: #00a19a;
}

.questionnaire-page__option-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.questionnaire-page__option-icon {
  font-size: 1.25rem;
  color: #00a19a;
}

.questionnaire-page__option-label {
  font-size: 13px;
  color: #00a19a;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px; /* 138.462% */
  letter-spacing: -0.08px;
}

/* Check Button */
.questionnaire-page__option-check {
  flex-shrink: 0;
}

.questionnaire-page__check-button {
  width: 1rem;
  height: 1rem;
  /* border: 2px solid #00a19a;
  border-radius: 50%; */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background-color: white;
}

.questionnaire-page__check-button--selected {
  background-color: white;
  /* border-color: #00a19a; */
}

.questionnaire-page__check-mark {
  color: white;
  font-size: 0.475rem;
  font-weight: bold;
}

/* Footer */
.questionnaire-page__footer {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.questionnaire-page__footer--visible {
  opacity: 1;
  transform: translateY(0);
}

/* Home Indicator */
.questionnaire-page__home-indicator {
  width: 8rem;
  height: 0.25rem;
  background-color: #111827;
  border-radius: 0.125rem;
}

/* Add styles for multiple selection */
.questionnaire-page__check-button--multiple {
  border-radius: 50%;
}

.questionnaire-page__check-button--multiple.questionnaire-page__check-button--selected {
  background-color: white;
  color: white;
}

/* Adjust option content when there's no icon */
.questionnaire-page__option-content:has(
    .questionnaire-page__option-icon:not(:defined)
  ) {
  margin-left: 0;
}
</style>
