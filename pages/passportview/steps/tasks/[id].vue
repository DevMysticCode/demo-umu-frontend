<template>
  <div v-if="!showThankYou" class="mobile-container task-page bg-umu-gradient">
    <AppHeader :showBack="true" right="dots" />

    <div class="task-content">
      <HeroSection
        :iconName="currentStep?.icon"
        iconClass="w-[176px] h-[176px]"
        heroClass="w-[176px] h-[176x]"
        :mainTitle="currentStep?.title"
        :subTitle="currentStep?.subtitle"
      />

      <div class="progress-section">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: taskProgress + '%' }"
          ></div>
        </div>
        <div class="progress-info">
          <span class="progress-label">TASK PROGRESS</span>
          <span class="progress-remaining"
            >{{ remainingQuestions }} Remaining</span
          >
        </div>
      </div>

      <div class="action-buttons">
        <button class="help-btn">
          <span class="btn-icon"
            ><OPIcon name="info" class="w-[15px] h-[15px]"
          /></span>
          Help
        </button>
        <button class="video-btn">
          <span class="play-icon"
            ><OPIcon name="playIcon" class="w-[15px] h-[15px]"
          /></span>
          Play Video
        </button>
      </div>

      <PointsSection
        :points="currentQuestion?.points || 0"
        label="Available for completing this question."
        @nextTask="handleNextQuestion"
      />

      <div class="question-header">
        <h2 class="question-number">
          Question {{ currentQuestionIndex + 1 }}
          <div class="total">
            {{ currentQuestionIndex + 1 }} of {{ totalQuestions }} in this
            section
          </div>
        </h2>
        <button class="skip-btn" @click="skipQuestion">Skip</button>
      </div>
      <div class="question-section">
        <div v-if="currentQuestion" class="question-content">
          <!-- <p class="question-text">{{ currentQuestion.question }}</p> -->
          <p class="question-text">
            {{ displayedQuestion }}
            <span v-if="showQuestionCursor" class="typing-cursor">|</span>
          </p>

          <!-- <div v-if="currentQuestion.description" class="question-description">
            {{ currentQuestion.description }}
          </div> -->

          <div v-if="displayedDescription" class="question-description">
            {{ displayedDescription }}
            <span
              v-if="showDescriptionCursor"
              class="typing-cursor typing-cursor--small"
              >|</span
            >
          </div>

          <!-- <div v-if="currentQuestion.help" class="help-section">
            <div class="help-content">
              <h4 class="help-title">
                <span class="help-icon">💡</span>What is this?
              </h4>
              <p class="help-text">{{ currentQuestion.help }}</p>
            </div>
          </div> -->

          <div v-if="displayedHelp" class="help-section">
            <div class="help-content">
              <h4 class="help-title">
                <span class="help-icon">💡</span>What is this?
              </h4>
              <p class="help-text">
                {{ displayedHelp }}
                <span
                  v-if="showHelpCursor"
                  class="typing-cursor typing-cursor--small"
                  >|</span
                >
              </p>
            </div>
          </div>

          <div
            v-if="showOptions"
            class="answer-section answer-section--visible"
          >
            <component
              :is="getQuestionComponent"
              :question="currentQuestion"
              :answer="currentQuestion.answer"
              :display="
                currentQuestion.display || currentQuestion.type?.toLowerCase()
              "
              @update="updateAnswer"
            />

            <div v-if="!hasAdditionalInfo" class="upload-after-radio">
              <TextUploadQuestion
                :question="{
                  description:
                    'Please provide additional supporting information',
                  uploadInstruction: currentQuestion.uploadInstruction,
                  instructionText: currentQuestion.instructionText,
                  placeholder: currentQuestion.placeholder,
                }"
                :answer="additionalInfoAnswer"
                :display="additionalInfoDisplay"
                @update="updateAdditionalInfo"
              />
            </div>
          </div>
        </div>
      </div>
      <button class="submit-btn" @click="saveAnswer" :disabled="!isAnswerValid">
        Save and go to next question
      </button>
    </div>
  </div>

  <div v-if="showThankYou">
    <ThankYouModal
      v-model="showThankYou"
      :points="earnedPoints"
      :step-name="currentStep?.title || 'this'"
      @continue="handleContinue"
    />
  </div>
</template>

<script setup>
import { usePassportRuntime } from '~/composables/usePassportRuntime'
import PointsSection from '~/components/passport-view/PointsSection.vue'
import ThankYouModal from '~/components/passport-view/ThankYouModal.vue'
import RadioQuestion from '~/components/passport-view/questions/RadioQuestion.vue'
import TextUploadQuestion from '~/components/passport-view/questions/TextUploadQuestion.vue'
import CheckboxQuestion from '~/components/passport-view/questions/CheckboxQuestion.vue'
import NoteQuestion from '~/components/passport-view/questions/NoteQuestion.vue'
import DateQuestion from '~/components/passport-view/questions/DateQuestion.vue'
import AppHeader from '@/components/core/AppHeader.vue'
import HeroSection from '@/components/HeroSection.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

const route = useRoute()
const router = useRouter()

const {
  currentStep,
  currentTask,
  currentQuestions,
  currentQuestionIndex,
  currentQuestion,
  setCurrentStep,
  setCurrentTask,
  loadPassport,
  loadQuestions,
  saveAnswer: apiSaveAnswer,
  completeTask,
  moveToNextQuestion,
} = usePassportRuntime()

const showThankYou = ref(false)
const earnedPoints = ref(0)
const isSaving = ref(false)
const additionalInfoAnswer = ref(null)

const stepId = route.query.stepId
const taskId = route.params.id

const displayedQuestion = ref('')
const displayedDescription = ref('')
const displayedHelp = ref('')

const showQuestionCursor = ref(false)
const showDescriptionCursor = ref(false)
const showHelpCursor = ref(false)

const showOptions = ref(false)

let typingInterval = null

onBeforeUnmount(() => {
  if (typingInterval) {
    clearInterval(typingInterval)
    typingInterval = null
  }
})

onMounted(async () => {
  if (!currentStep.value) {
    await loadPassport(route.query.propertyId)
  }

  setCurrentStep(stepId)
  setCurrentTask(taskId)
  await loadQuestions(taskId)
})

const typeText = (targetRef, cursorRef, text, speed = 30) => {
  return new Promise((resolve) => {
    // clear any previous typing
    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }

    targetRef.value = ''
    cursorRef.value = true

    let index = 0

    typingInterval = setInterval(() => {
      if (index < text.length) {
        targetRef.value += text.charAt(index)
        index++
      } else {
        clearInterval(typingInterval)
        typingInterval = null
        cursorRef.value = false
        resolve()
      }
    }, speed)
  })
}

// const runQuestionAnimation = async (q) => {
//   if (!q) return

//   // Set all text immediately
//   displayedQuestion.value = q.question
//   displayedDescription.value = q.description || ''
//   displayedHelp.value = q.help || ''

//   // Show options immediately
//   showOptions.value = true
// }

const runQuestionAnimation = async (q) => {
  if (!q) return

  console.log('Starting animation for question:', q.question)

  // reset everything
  displayedQuestion.value = ''
  displayedDescription.value = ''
  displayedHelp.value = ''
  showOptions.value = false

  showQuestionCursor.value = false
  showDescriptionCursor.value = false
  showHelpCursor.value = false

  // 1️⃣ Question (always)
  await typeText(displayedQuestion, showQuestionCursor, q.question, 35)
  console.log('Question typed')

  // 2️⃣ Description (optional)
  if (q.description) {
    await typeText(
      displayedDescription,
      showDescriptionCursor,
      q.description,
      25,
    )
    console.log('Description typed')
  }

  // 3️⃣ Help text (optional)
  if (q.help) {
    await typeText(displayedHelp, showHelpCursor, q.help, 20)
    console.log('Help typed')
  }

  // 4️⃣ Finally show options
  showOptions.value = true
  console.log('Options should now be visible, showOptions:', showOptions.value)
  console.log(' hasAdditionalInfo:', hasAdditionalInfo.value)
}

watch(
  () => currentQuestion.value,
  (q) => {
    if (!q) {
      additionalInfoAnswer.value = null
      return
    }

    console.log('Question changed:', q)
    console.log('Question type:', q.type)
    console.log('Additional info type:', q.additionalInfoType)

    // Hydrate additional info from saved combined answers before animation
    if (q.answer && typeof q.answer === 'object' && !Array.isArray(q.answer)) {
      if (q.answer.additionalInfo !== undefined) {
        additionalInfoAnswer.value = q.answer.additionalInfo
        q.answer = q.answer.mainAnswer
      } else if (q.answer.radioAnswer !== undefined) {
        additionalInfoAnswer.value = q.answer.uploadedFiles || null
        q.answer = q.answer.radioAnswer
      } else {
        additionalInfoAnswer.value = null
      }
    } else {
      additionalInfoAnswer.value = null
    }

    runQuestionAnimation(q)
  },
  { immediate: true },
)

const calculateEarnedPoints = () => {
  if (!currentStep.value) return 0
  return currentStep.value.tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + (t.pointsReward || 0), 0)
}

const totalQuestions = computed(() => currentQuestions.value.length || 0)

const taskProgress = computed(() => {
  if (!currentTask.value || totalQuestions.value === 0) return 0
  const completed = currentQuestions.value.filter((q) => q.completed).length
  return Math.round((completed / totalQuestions.value) * 100)
})

const remainingQuestions = computed(() => {
  return currentQuestions.value.filter((q) => !q.completed).length
})

const isAnswerValid = computed(() => {
  if (!currentQuestion.value) return false

  const answer = currentQuestion.value.answer
  const type = currentQuestion.value.type?.toLowerCase()

  if (type === 'text') {
    return answer && answer.trim().length > 0
  }

  if (type === 'radio') {
    return answer !== '' && answer !== undefined && answer !== null
  }

  if (type === 'checkbox') {
    return Array.isArray(answer) && answer.length > 0
  }

  if (type === 'upload') {
    return Array.isArray(answer) && answer.length > 0
  }

  if (type === 'note') {
    const note = answer || {}
    const buyers = note.buyers || ''
    const sellers = note.sellers || ''
    return (
      (buyers && buyers.trim().length > 0) ||
      (sellers && sellers.trim().length > 0)
    )
  }

  if (type === 'date') {
    if (!answer) return false
    if (typeof answer === 'string') {
      return answer.trim().length > 0
    }
    if (typeof answer === 'object') {
      if (answer.date) return ('' + answer.date).trim().length > 0
      return ('' + (answer.value || '')).trim().length > 0
    }
    return false
  }

  return true
})

const getQuestionComponent = computed(() => {
  const type = currentQuestion.value?.type?.toLowerCase() // This will convert "RADIO" to "radio"
  const components = {
    radio: RadioQuestion,
    text: TextUploadQuestion,
    checkbox: CheckboxQuestion,
    upload: TextUploadQuestion,
    note: NoteQuestion,
    date: DateQuestion,
  }
  return components[type] || TextUploadQuestion
})

const hasAdditionalInfo = computed(() => {
  if (!currentQuestion.value?.additionalInfoType) return false

  // Only show additional info section after the user has answered the main question
  const answer = currentQuestion.value.answer
  console.log('Checking additional info visibility. Answer:', answer)
  return answer !== null && answer !== undefined && answer !== ''
})

// const additionalInfoDisplay = computed(() => {
//   const type = currentQuestion.value?.additionalInfoType
//   if (type === 'upload') return 'upload'
//   if (type === 'writeInstruction') return 'text'
//   if (type === 'uploadAndWriteInstruction') return 'both'
//   return null
// })

const additionalInfoDisplay = computed(() => {
  const type = currentQuestion.value?.additionalInfoType
  if (type) {
    const lowerType = type.toLowerCase()
    if (lowerType.includes('upload') && lowerType.includes('write'))
      return 'both'
    if (lowerType.includes('upload')) return 'upload'
    if (lowerType.includes('write')) return 'text'
  }
  return null
})

const updateAnswer = (answer) => {
  if (!currentQuestion.value) return
  currentQuestion.value.answer = answer
}

const updateAdditionalInfo = (data) => {
  additionalInfoAnswer.value = data
}

const saveAnswer = async () => {
  if (!isAnswerValid.value || !currentQuestion.value) return

  isSaving.value = true
  try {
    let answerValue = currentQuestion.value.answer

    // If this question has additional info, combine both into a single object
    if (
      currentQuestion.value.additionalInfoType &&
      additionalInfoAnswer.value
    ) {
      answerValue = {
        mainAnswer: currentQuestion.value.answer,
        additionalInfo: additionalInfoAnswer.value,
      }
    }

    // Save answer to backend
    await apiSaveAnswer(currentQuestion.value.id, answerValue)

    // Try to move to next question
    const hasMoreQuestions = moveToNextQuestion()

    if (!hasMoreQuestions) {
      // Last question answered, complete the task
      const result = await completeTask(taskId)

      if (result?.sectionCompleted) {
        // All tasks in section done — show thank-you
        earnedPoints.value = calculateEarnedPoints()
        showThankYou.value = true
      } else {
        // More tasks remain in section — go back to task list
        router.push(
          `/passportview/steps/${stepId}?propertyId=${route.query.propertyId}`,
        )
      }
    }
  } catch (error) {
    console.error('Error saving answer:', error)
  } finally {
    isSaving.value = false
  }
}

const skipQuestion = () => {
  moveToNextQuestion()
}

const handleNextQuestion = () => {
  if (isAnswerValid.value) {
    saveAnswer()
  }
}

const handleContinue = () => {
  router.push(
    `/passportview/steps/${stepId}?propertyId=${route.query.propertyId}`,
  )
}
</script>

<style scoped>
.task-page {
  min-height: 100vh;
  padding-bottom: 40px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: transparent;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #00b8a9;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 8px;
  cursor: pointer;
}

.back-arrow {
  font-size: 20px;
}

.menu-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #5a54d6;
  border: none;
  font-size: 20px;
  color: white;
  cursor: pointer;
}

.task-content {
  padding: 0 20px;
}

.task-illustration {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.task-icon-large {
  font-size: 100px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.task-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.task-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
}

.progress-section {
  margin-bottom: 24px;
}

.progress-bar {
  height: 16px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00b8a9 0%, #00d4c3 100%);
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 11px;
  color: #3c3c4399;
  font-weight: 400;
  letter-spacing: 0.06px;
  line-height: 13px;
}

.progress-remaining {
  font-size: 11px;
  color: #00a19a;
  font-weight: 590;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  justify-content: end;
}

.help-btn,
.video-btn {
  flex: 1;
  padding: 8px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  color: #00b8a9;
  max-width: fit-content;
}

.video-btn {
  background: #00b8a9;
  color: white;
  border-color: #00b8a9;
}

.play-icon {
  font-size: 12px;
}

.question-section {
  background: white;
  border-radius: 16px;
  padding: 12px 16px;
  margin-top: 4px;
  border: 0.33px solid #3c3c432e;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-number {
  font-size: 18px;
  font-weight: 590;
  margin: 0;
  color: #000000;
}

.total {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.skip-btn {
  background: white;
  border: 0.33px solid #3c3c432e;
  border-radius: 40px;
  color: #00a19a;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  padding: 4px 8px;
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-text {
  color: #000000;
  margin: 0;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
}

.question-description {
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  color: #3c3c4399;
}

.help-section {
  display: flex;
  gap: 2px;
  padding: 12px;
  background: #00a19a1a;
  border-radius: 12px;
  border: 2px solid #e6f9f7;
}

.help-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.help-content {
  flex: 1;
}

.help-title {
  margin: 0 0 8px;
  color: #00a19a;
  font-weight: 590;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.help-text {
  color: #3c3c4399;
  margin: 0;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.answer-section {
  margin: 8px 0;
}

.upload-after-radio {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.submit-btn {
  width: 100%;
  padding: 14px 20px;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 24px;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.typing-cursor {
  margin-left: 2px;
  color: #00a19a;
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

.answer-section {
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.4s ease;
}

.answer-section--visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
