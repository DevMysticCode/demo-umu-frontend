<template>
  <div v-if="!showThankYou" class="mobile-container task-page bg-umu-gradient">
    <AppHeader :showBack="true" :backTo="backToStepsUrl" right="dots" />

    <div class="task-content">
      <!-- ── Hero (matches prototype: teal-pale gradient + ring meta) ─── -->
      <section class="qhero">
        <span class="qhero-badge">
          <span class="qhero-dot"></span>
          {{ currentStep?.title || '' }}
        </span>
        <div class="qhero-illustration" aria-hidden="true">
          <OPIcon
            v-if="currentStep?.icon"
            :name="currentStep.icon"
            class="w-[120px] h-[120px]"
          />
        </div>
        <h1 class="qhero-title">{{ currentStep?.title || '' }}</h1>
        <p class="qhero-sub">{{ currentTask?.title || '' }}</p>
        <div class="qhero-meta">
          <div class="qring" :style="{ '--p': taskProgress }">
            <span>{{ taskAnsweredCount }}/{{ totalQuestions }}</span>
          </div>
          <div class="qmeta-text">
            <small>Task Progress</small>
            <strong>
              {{ remainingQuestions }}
              {{ remainingQuestions === 1 ? 'question' : 'questions' }} remaining
              <em>· ~{{ estimatedMinutesLeft }} min left</em>
            </strong>
          </div>
        </div>
      </section>

      <div class="action-buttons">
        <button class="qpill ghost" @click="openHelp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Help
        </button>
        <button class="qpill primary" @click="openVideo">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
          Play Video
        </button>
      </div>

      <PointsSection
        :points="currentQuestion?.points || 0"
        label="Available for completing this question."
        @nextTask="handleNextQuestion"
      />

      <!-- Property photos upload — only for "What we love about our home?" task -->
      <div
        v-if="currentTask?.key === 'give_your_home_a_story'"
        class="property-photos-section"
      >
        <h3 class="property-photos-title">Property Photos</h3>
        <p class="property-photos-sub">
          Upload photos of your property. These will appear in your listing and
          buyer passport.
        </p>

        <div v-if="propertyImages.length > 0" class="property-photos-grid">
          <div
            v-for="(img, index) in propertyImages"
            :key="index"
            class="property-photo-item"
          >
            <img
              :src="img"
              :alt="`Photo ${index + 1}`"
              class="property-photo-thumb"
            />
            <button
              class="property-photo-delete"
              @click="removePropertyImage(index)"
              title="Remove photo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line
                  x1="18"
                  y1="6"
                  x2="6"
                  y2="18"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
                <line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                  stroke="white"
                  stroke-width="2.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="property-photos-actions">
          <label class="add-photos-btn" :class="{ disabled: uploadingImages }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>
            {{ uploadingImages ? 'Uploading...' : 'Add Photos' }}
            <input
              type="file"
              accept="image/*"
              multiple
              class="hidden-file-input"
              :disabled="uploadingImages"
              @change="handlePropertyImageUpload"
            />
          </label>
        </div>
      </div>

      <div class="qheader">
        <div>
          <h2 class="qheader-h2">Question {{ currentQuestionIndex + 1 }}</h2>
          <div class="qheader-sub">
            {{ currentQuestionIndex + 1 }} of {{ totalQuestions }} in this section
          </div>
        </div>
        <div class="qnav">
          <button
            v-if="currentQuestionIndex !== 0"
            class="qnav-btn ghost-muted"
            :disabled="currentQuestionIndex === 0"
            @click="goToPreviousQuestion"
          >
            Previous
          </button>
          <button
            v-if="currentQuestionIndex < totalQuestions - 1"
            class="qnav-btn"
            @click="skipQuestion"
          >
            Skip
          </button>
        </div>
      </div>

      <!-- Segmented progress (one chip per question) -->
      <div v-if="totalQuestions > 0" class="qsegments" aria-hidden="true">
        <span
          v-for="i in totalQuestions"
          :key="i"
          class="qseg"
          :class="{
            done: i - 1 < currentQuestionIndex,
            current: i - 1 === currentQuestionIndex,
          }"
        />
      </div>

      <!-- "What is this?" tip — kept on aqua per request -->
      <div v-if="currentQuestion?.helpContent" class="qtip">
        <div class="qtip-ic">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v1.3h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"/></svg>
        </div>
        <div class="qtip-body">
          <strong>What is this?</strong>
          <p>{{ extractTipBody(currentQuestion.helpContent) }}</p>
        </div>
      </div>
      <div class="question-section">
        <div v-if="currentQuestion" class="question-content">
          <div
            v-if="showOptions"
            class="answer-section answer-section--visible"
          >
            <div
              v-if="
                currentQuestionType !== 'multipart' ||
                currentQuestion?.repeatable
              "
              class="question-card"
            >
              <component
                :key="currentQuestion?.id"
                :is="getQuestionComponent"
                :question="currentQuestion"
                :answer="currentQuestion.answer"
                :display="
                  currentQuestion.display || currentQuestion.type?.toLowerCase()
                "
                :passport-id="route.query.propertyId || ''"
                :displayed-question="displayedQuestion"
                :show-question-cursor="showQuestionCursor"
                :displayed-description="displayedDescription"
                :show-description-cursor="showDescriptionCursor"
                :displayed-help="displayedHelp"
                :show-help-cursor="showHelpCursor"
                @update="updateAnswer"
              />
            </div>
            <component
              v-else
              :key="currentQuestion?.id"
              :is="getQuestionComponent"
              :question="currentQuestion"
              :answer="currentQuestion.answer"
              :display="
                currentQuestion.display || currentQuestion.type?.toLowerCase()
              "
              :passport-id="route.query.propertyId || ''"
              :displayed-question="displayedQuestion"
              :show-question-cursor="showQuestionCursor"
              :displayed-description="displayedDescription"
              :show-description-cursor="showDescriptionCursor"
              :displayed-help="displayedHelp"
              :show-help-cursor="showHelpCursor"
              @update="updateAnswer"
            />

            <div v-if="hasAdditionalInfo" class="question-card">
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
      <button
        v-if="currentQuestion?.type?.toLowerCase() !== 'radio'"
        class="submit-btn"
        @click="saveAnswer"
        :disabled="!isAnswerValid"
      >
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

  <HelpDrawer
    :show="showHelp"
    :content="activeHelpContent"
    mode="seller"
    @close="showHelp = false"
  />

  <VideoModal
    :show="showVideo"
    :video-url="activeVideoUrl"
    @close="showVideo = false"
  />
</template>

<script setup>
import { usePassportRuntime } from '~/composables/usePassportRuntime'
import PointsSection from '~/components/passport-view/PointsSection.vue'
import ThankYouModal from '~/components/passport-view/ThankYouModal.vue'
import RadioQuestion from '~/components/passport-view/questions/RadioQuestion.vue'
import TextUploadQuestion from '~/components/passport-view/questions/TextUploadQuestion.vue'
import CheckboxQuestion from '~/components/passport-view/questions/CheckboxQuestion.vue'
import ChipsQuestion from '~/components/passport-view/questions/ChipsQuestion.vue'
import NoteQuestion from '~/components/passport-view/questions/NoteQuestion.vue'
import DateQuestion from '~/components/passport-view/questions/DateQuestion.vue'
import ScaleQuestion from '~/components/passport-view/questions/ScaleQuestion.vue'
import MultipartQuestion from '~/components/passport-view/questions/MultipartQuestion.vue'
import RepeatableItemQuestion from '~/components/passport-view/questions/RepeatableItemQuestion.vue'
import MultiTextInputQuestion from '@/components/passport-view/questions/MultiTextInputQuestion.vue'
import MultiFieldFormQuestion from '@/components/passport-view/questions/MultiFieldFormQuestion.vue'
import BoundaryResponsibilityQuestion from '~/components/passport-view/questions/BoundaryResponsibilityQuestion.vue'
import AppHeader from '@/components/core/AppHeader.vue'
import HeroSection from '@/components/HeroSection.vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import HelpDrawer from '~/components/passport-view/HelpDrawer.vue'
import VideoModal from '~/components/passport-view/VideoModal.vue'

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
  loadSectionQuestions,
  saveAnswer: apiSaveAnswer,
  completeTask,
  moveToNextQuestion,
  moveToPreviousQuestion,
} = usePassportRuntime()

const showThankYou = ref(false)
const earnedPoints = ref(0)
const isSaving = ref(false)
const additionalInfoAnswer = ref(null)

const showHelp = ref(false)
const showVideo = ref(false)

// Use question-level content if available, fall back to step (section) level
const activeHelpContent = computed(
  () =>
    currentQuestion.value?.helpContent ??
    currentStep.value?.helpContent ??
    null,
)
const activeVideoUrl = computed(
  () =>
    currentQuestion.value?.helpVideoUrl ??
    currentStep.value?.helpVideoUrl ??
    null,
)
const hasHelp = computed(() => !!activeHelpContent.value)
const hasVideo = computed(() => !!activeVideoUrl.value)

function openHelp() {
  showHelp.value = true
}
function openVideo() {
  showVideo.value = true
}

const stepId = route.query.stepId
const taskId = route.params.id

const backToStepsUrl = computed(() => {
  return `/passportview/steps/${stepId}?propertyId=${route.query.propertyId}`
})

const displayedQuestion = ref('')
const displayedDescription = ref('')
const displayedHelp = ref('')

const showQuestionCursor = ref(false)
const showDescriptionCursor = ref(false)
const showHelpCursor = ref(false)

const showOptions = ref(false)

// ── Property image upload (give_your_home_a_story task) ────────────────────
const { getPropertyImages, updatePropertyImages, uploadPropertyImage } =
  usePassportApi()
const propertyImages = ref([])
const uploadingImages = ref(false)

async function loadPropertyImages() {
  const passportId = route.query.propertyId
  if (!passportId) return
  try {
    const res = await getPropertyImages(passportId)
    propertyImages.value = res.images ?? []
  } catch {
    // ignore — not critical
  }
}

async function handlePropertyImageUpload(event) {
  const files = Array.from(event.target.files ?? [])
  if (!files.length) return
  const passportId = route.query.propertyId
  if (!passportId) return

  uploadingImages.value = true
  try {
    const uploaded = await Promise.all(
      files.map((file) => uploadPropertyImage(passportId, file)),
    )
    const newImages = [...propertyImages.value, ...uploaded.map((r) => r.url)]
    propertyImages.value = newImages
    await updatePropertyImages(passportId, newImages)
  } catch (err) {
    console.error('Failed to upload property images:', err)
  } finally {
    uploadingImages.value = false
    event.target.value = ''
  }
}

async function removePropertyImage(index) {
  const passportId = route.query.propertyId
  if (!passportId) return
  const updated = propertyImages.value.filter((_, i) => i !== index)
  propertyImages.value = updated
  try {
    await updatePropertyImages(passportId, updated)
  } catch (err) {
    console.error('Failed to update property images:', err)
  }
}
// ──────────────────────────────────────────────────────────────────────────

// Animation removed - no longer needed
// let typingInterval = null

// onBeforeUnmount(() => {
//   if (typingInterval) {
//     clearInterval(typingInterval)
//     typingInterval = null
//   }
// })

onMounted(async () => {
  if (!currentStep.value) {
    await loadPassport(route.query.propertyId)
  }

  setCurrentStep(stepId)
  setCurrentTask(taskId)
  // Load all questions from the entire section, starting at the clicked task
  await loadSectionQuestions(stepId, taskId)

  // Load property images for the home story task
  await loadPropertyImages()
})

// Typing animation removed - display questions immediately
// const typeText = (targetRef, cursorRef, text, speed = 30) => {
//   return new Promise((resolve) => {
//     // clear any previous typing
//     if (typingInterval) {
//       clearInterval(typingInterval)
//       typingInterval = null
//     }
//
//     targetRef.value = ''
//     cursorRef.value = true
//
//     let index = 0
//
//     typingInterval = setInterval(() => {
//       if (index < text.length) {
//         targetRef.value += text.charAt(index)
//         index++
//       } else {
//         clearInterval(typingInterval)
//         typingInterval = null
//         cursorRef.value = false
//         resolve()
//       }
//     }, speed)
//   })
// }

// const runQuestionAnimation = async (q) => {
//   if (!q) return

//   // Set all text immediately
//   displayedQuestion.value = q.question
//   displayedDescription.value = q.description || ''
//   displayedHelp.value = q.help || ''

//   // Show options immediately
//   showOptions.value = true
// }

const runQuestionAnimation = (q) => {
  if (!q) return

  // Display all text immediately without animation
  displayedQuestion.value = q.question
  displayedDescription.value = q.description || ''
  displayedHelp.value = q.help || ''

  // Show options immediately
  showOptions.value = true
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

    // Multipart questions store their answer as an object keyed by partKey — skip additionalInfo extraction
    if (q.type === 'multipart') {
      additionalInfoAnswer.value = null
      runQuestionAnimation(q)
      return
    }

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

const taskAnsweredCount = computed(() =>
  currentQuestions.value.filter((q) => q.answer != null && q.answer !== '').length,
)
const estimatedMinutesLeft = computed(() => {
  const r = remainingQuestions.value || 0
  return Math.max(1, Math.round(r * 1.2))
})

// Pick a short body string out of whatever shape `helpContent` arrives in.
function extractTipBody(content) {
  if (!content) return ''
  if (typeof content === 'string') return content
  return (
    content.body ||
    content.description ||
    content.text ||
    content.summary ||
    (Array.isArray(content.sections) ? content.sections[0]?.body : '') ||
    ''
  )
}

const remainingQuestions = computed(() => {
  return currentQuestions.value.filter((q) => !q.completed).length
})

const normalizeQuestionType = (question) => {
  return (question?.type || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
}

const currentQuestionType = computed(() =>
  normalizeQuestionType(currentQuestion.value),
)

const isAnswerValid = computed(() => {
  if (!currentQuestion.value) return false

  const answer = currentQuestion.value.answer
  const type = currentQuestionType.value
  const isRadioType = type === 'radio' || type === 'single_choice'
  const isCheckboxType = type === 'checkbox' || type === 'multiple_choice'

  if (type === 'text') {
    return answer && answer.trim().length > 0
  }

  if (isRadioType) {
    return answer !== '' && answer !== undefined && answer !== null
  }

  // Check if this is a boundary responsibility question
  if (type === 'boundary') {
    return answer && answer.left && answer.right && answer.rear && answer.front
  }

  if (isCheckboxType) {
    // When otherPlaceholder is set, CheckboxQuestion emits {values, otherText}
    if (
      answer &&
      typeof answer === 'object' &&
      !Array.isArray(answer) &&
      Array.isArray(answer.values)
    ) {
      return answer.values.length > 0
    }
    return Array.isArray(answer) && answer.length > 0
  }

  if (type === 'chips') {
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
      if (answer.value) return ('' + (answer.value || '')).trim().length > 0
      return Object.values(answer).some(
        (val) =>
          val !== undefined && val !== null && ('' + val).trim().length > 0,
      )
    }
    return false
  }

  if (type === 'scale') {
    return answer !== undefined && answer !== null && answer !== ''
  }

  if (type === 'multitextinput') {
    return Array.isArray(answer) && answer.length > 0
  }

  if (type === 'multifieldform') {
    // For repeatable: answer is array of objects
    if (currentQuestion.value.repeatable && Array.isArray(answer)) {
      return (
        answer.length > 0 &&
        answer.every((form) => {
          return Object.values(form).some((val) => val && val.trim().length > 0)
        })
      )
    }
    // For non-repeatable: answer is single object
    if (
      !currentQuestion.value.repeatable &&
      typeof answer === 'object' &&
      !Array.isArray(answer)
    ) {
      return Object.values(answer).some((val) => val && val.trim().length > 0)
    }
    return false
  }

  if (type === 'multipart') {
    // Repeatable multipart (custom item list): answer is an array — always valid (0 items is OK)
    if (currentQuestion.value?.repeatable) {
      return Array.isArray(answer) || answer === null || answer === undefined
    }
    if (!answer || typeof answer !== 'object' || Array.isArray(answer))
      return false
    const parts = currentQuestion.value.parts
    if (!parts || !Array.isArray(parts)) return false

    // Helper function to check if a part is visible (not hidden by conditional logic)
    const isPartVisible = (part) => {
      if (!part.conditionalOn) return true
      const dependentPartAnswer = answer[part.conditionalOn]
      if (dependentPartAnswer === undefined || dependentPartAnswer === null)
        return false
      if (!part.showOnValues || !Array.isArray(part.showOnValues)) return false
      return part.showOnValues.includes(dependentPartAnswer)
    }

    return parts.every((part) => {
      // Skip validation for hidden parts
      if (!isPartVisible(part)) return true

      // For visible parts, validate based on whether they are required
      const partAnswer = answer[part.partKey]

      // If part is not required and has no answer, that's OK
      if (
        !part.required &&
        (partAnswer === undefined || partAnswer === null || partAnswer === '')
      ) {
        return true
      }

      // If part is required or has an answer, validate it
      if (partAnswer === undefined || partAnswer === null || partAnswer === '')
        return false

      const partType = part.type?.toLowerCase?.()

      // Counter is always valid (0 is a valid numeric answer)
      if (partType === 'counter') return true

      if (partType === 'checkbox')
        return Array.isArray(partAnswer) && partAnswer.length > 0
      if (partType === 'upload')
        return Array.isArray(partAnswer) && partAnswer.length > 0
      if (partType === 'multitextinput')
        return Array.isArray(partAnswer) && partAnswer.length > 0
      if (partType === 'multifieldform') {
        // For repeatable: partAnswer is array of objects
        if (part.repeatable && Array.isArray(partAnswer)) {
          return (
            partAnswer.length > 0 &&
            partAnswer.every((form) => {
              return Object.values(form).some(
                (val) => val && ('' + val).trim().length > 0,
              )
            })
          )
        }
        // For non-repeatable: partAnswer is single object
        if (
          !part.repeatable &&
          typeof partAnswer === 'object' &&
          !Array.isArray(partAnswer)
        ) {
          return Object.values(partAnswer).some(
            (val) => val && ('' + val).trim().length > 0,
          )
        }
        return false
      }
      if (partType === 'date') {
        if (typeof partAnswer === 'object' && partAnswer !== null) {
          return (
            (partAnswer.date && ('' + partAnswer.date).trim().length > 0) ||
            ('' + (partAnswer.value || '')).trim().length > 0 ||
            Object.values(partAnswer).some(
              (val) =>
                val !== undefined &&
                val !== null &&
                ('' + val).trim().length > 0,
            )
          )
        }
        return ('' + partAnswer).trim().length > 0
      }
      if (partType === 'text') {
        return typeof partAnswer === 'string'
          ? partAnswer.trim().length > 0
          : !!partAnswer
      }
      if (partType === 'radio') {
        return (
          partAnswer !== '' && partAnswer !== undefined && partAnswer !== null
        )
      }

      return !!partAnswer
    })
  }

  return true
})

const getQuestionComponent = computed(() => {
  const type = currentQuestionType.value

  // Repeatable multipart → custom item list UI
  if (type === 'multipart' && currentQuestion.value?.repeatable) {
    return RepeatableItemQuestion
  }

  const components = {
    radio: RadioQuestion,
    single_choice: RadioQuestion,
    text: TextUploadQuestion,
    checkbox: CheckboxQuestion,
    multiple_choice: CheckboxQuestion,
    chips: ChipsQuestion,
    upload: TextUploadQuestion,
    note: NoteQuestion,
    date: DateQuestion,
    scale: ScaleQuestion,
    multipart: MultipartQuestion,
    boundary: BoundaryResponsibilityQuestion,
    multitextinput: MultiTextInputQuestion,
    multifieldform: MultiFieldFormQuestion,
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

const updateAnswer = async (answer) => {
  if (!currentQuestion.value) return
  currentQuestion.value.answer = answer

  // Check if this is a NOTE question being completed
  if (currentQuestion.value.type?.toLowerCase() === 'note' && answer === true) {
    console.log('✅ NOTE question completed! Auto-saving...')
    isSaving.value = true
    try {
      // Save the note as completed
      await apiSaveAnswer(currentQuestion.value.id, answer)

      // Check if this was the last incomplete question (before advancing)
      const currentId = currentQuestion.value.id
      const allCompleted = currentQuestions.value.every(
        (q) => q.completed || q.id === currentId,
      )

      if (allCompleted) {
        // All questions in section done — show thank-you
        earnedPoints.value = calculateEarnedPoints()
        showThankYou.value = true
      } else {
        // More questions remain — move to next
        const hasMoreQuestions = moveToNextQuestion()
        if (!hasMoreQuestions) {
          router.push(
            `/passportview/steps/${stepId}?propertyId=${route.query.propertyId}`,
          )
        }
      }
    } catch (error) {
      console.error('Error completing NOTE question:', error)
    } finally {
      isSaving.value = false
    }
    return
  }

  // Auto-save plain RADIO questions immediately on selection
  if (currentQuestion.value.type?.toLowerCase() === 'radio') {
    console.log('✅ RADIO question selected! Auto-saving...')
    isSaving.value = true
    try {
      await apiSaveAnswer(currentQuestion.value.id, answer)

      const currentId = currentQuestion.value.id
      const allCompleted = currentQuestions.value.every(
        (q) => q.completed || q.id === currentId,
      )

      if (allCompleted) {
        earnedPoints.value = calculateEarnedPoints()
        showThankYou.value = true
      } else {
        const hasMoreQuestions = moveToNextQuestion()
        if (!hasMoreQuestions) {
          router.push(
            `/passportview/steps/${stepId}?propertyId=${route.query.propertyId}`,
          )
        }
      }
    } catch (error) {
      console.error('Error auto-saving RADIO answer:', error)
    } finally {
      isSaving.value = false
    }
    return
  }

  // Check if this is a multipart question with auto-save
  if (
    currentQuestion.value.type?.toLowerCase() === 'multipart' &&
    currentQuestion.value.autoSaveOn
  ) {
    const { partKey, value } = currentQuestion.value.autoSaveOn
    const rawTrigger = answer[partKey]
    // DATE parts emit { value, date } — extract scalar for comparison
    let triggerPartAnswer =
      rawTrigger !== null &&
      typeof rawTrigger === 'object' &&
      'value' in rawTrigger
        ? rawTrigger.value
        : rawTrigger

    // Debug: log what we're checking
    console.log('AutoSave Check:', {
      partKey,
      expectedValue: value,
      actualValue: triggerPartAnswer,
      allAnswers: answer,
      questionParts: currentQuestion.value.parts?.map((p) => p.partKey),
    })

    // If the partKey doesn't exist, try to find the first radio part as fallback
    if (triggerPartAnswer === undefined) {
      const firstRadioPart = currentQuestion.value.parts?.find(
        (p) => p.type?.toLowerCase() === 'radio',
      )
      if (firstRadioPart) {
        triggerPartAnswer = answer[firstRadioPart.partKey]
        console.log(
          'PartKey not found, using first radio part:',
          firstRadioPart.partKey,
          triggerPartAnswer,
        )
      }
    }

    // If trigger part is answered with the auto-save value, save immediately
    if (triggerPartAnswer === value) {
      console.log('✅ Auto-save triggered! Saving question...')
      isSaving.value = true
      try {
        await apiSaveAnswer(currentQuestion.value.id, answer)

        const currentId = currentQuestion.value.id
        const allCompleted = currentQuestions.value.every(
          (q) => q.completed || q.id === currentId,
        )

        if (allCompleted) {
          // All questions in section done — show thank-you
          earnedPoints.value = calculateEarnedPoints()
          showThankYou.value = true
        } else {
          // More questions remain — move to next
          const hasMoreQuestions = moveToNextQuestion()
          if (!hasMoreQuestions) {
            router.push(
              `/passportview/steps/${stepId}?propertyId=${route.query.propertyId}`,
            )
          }
        }
      } catch (error) {
        console.error('Error auto-saving answer:', error)
      } finally {
        isSaving.value = false
      }
    }
  }
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

    // Check if this was the last incomplete question (before advancing)
    const currentId = currentQuestion.value.id
    const allCompleted = currentQuestions.value.every(
      (q) => q.completed || q.id === currentId,
    )

    if (allCompleted) {
      // All questions in section done — show thank-you
      earnedPoints.value = calculateEarnedPoints()
      showThankYou.value = true
    } else {
      // More questions remain — move to next
      const hasMoreQuestions = moveToNextQuestion()
      if (!hasMoreQuestions) {
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

const goToPreviousQuestion = () => {
  moveToPreviousQuestion()
}

const handleNextQuestion = () => {
  if (isAnswerValid.value) {
    saveAnswer()
  }
}

const handleContinue = () => {
  router.push(`/passportview/${route.query.propertyId}`)
}
</script>

<style scoped>
.task-page {
  min-height: 100vh;
  padding-bottom: 40px;
}

/* ── Hero (matches prototype/disputes.html teal-pale gradient) ─── */
.qhero {
  margin: 8px 0 16px;
  border-radius: 24px;
  background: linear-gradient(160deg, #e6fbf6 0%, #ccfbf1 60%, #b8f2e6 100%);
  padding: 22px 22px;
  position: relative;
  overflow: hidden;
}
.qhero::before {
  content: '';
  position: absolute;
  inset: -40% -20% auto auto;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.7), transparent 65%);
  pointer-events: none;
}
.qhero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(15, 118, 110, 0.15);
  color: #0f766e;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 6px 10px;
  border-radius: 999px;
  position: relative;
  z-index: 1;
}
.qhero-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #14b8a6;
}
.qhero-illustration {
  display: flex;
  justify-content: center;
  margin: 4px 0 8px;
  position: relative;
  z-index: 1;
}
.qhero-title {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #0a0f2c;
  margin: 4px 0 4px;
  position: relative;
  z-index: 1;
}
.qhero-sub {
  color: #115e59;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 16px;
  position: relative;
  z-index: 1;
}
.qhero-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  position: relative;
  z-index: 1;
}
.qring {
  --p: 0;
  --size: 56px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: conic-gradient(#0d9488 calc(var(--p) * 1%), rgba(15, 118, 110, 0.15) 0);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.qring::after {
  content: '';
  width: 44px;
  height: 44px;
  background: #fff;
  border-radius: 50%;
  grid-area: 1 / 1;
}
.qring span {
  grid-area: 1 / 1;
  z-index: 1;
  font-size: 12px;
  font-weight: 700;
  color: #0a0f2c;
  line-height: 1;
}
.qmeta-text small {
  display: block;
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #115e59;
  margin-bottom: 4px;
}
.qmeta-text strong {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  color: #0a0f2c;
}
.qmeta-text strong em {
  font-style: normal;
  color: #64748b;
  font-weight: 500;
}

/* ── Help / Play pills (even split) ───────────────────────────── */
.qpill {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  font-family: inherit;
  transition: transform 0.12s ease;
}
.qpill:active {
  transform: scale(0.98);
}
.qpill.ghost {
  background: #fff;
  border-color: #e5e7eb;
  color: #0f766e;
}
.qpill.primary {
  background: #0d9488;
  color: #fff;
  box-shadow: 0 8px 20px -8px rgba(13, 148, 136, 0.6);
}

/* ── Question header + segmented progress ─────────────────────── */
.qheader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin: 0 0 12px;
}
.qheader-h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: #0a0f2c;
  letter-spacing: -0.02em;
}
.qheader-sub {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}
.qnav {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  margin-top: 2px;
}
.qnav-btn {
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #0f766e;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  transition: transform 0.12s ease;
}
.qnav-btn:active {
  transform: scale(0.97);
}
.qnav-btn.ghost-muted {
  color: #64748b;
}

.qsegments {
  display: flex;
  gap: 4px;
  margin: 0 0 18px;
}
.qseg {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #e2e8f0;
  position: relative;
  overflow: hidden;
}
.qseg.done {
  background: #14b8a6;
}
.qseg.current {
  background: #99f6e4;
}
.qseg.current::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #14b8a6 0%, #14b8a6 50%, transparent 50%);
}

/* ── "What is this?" tip — kept on aqua per request ─────────── */
.qtip {
  background: #e6f9f7;
  border: 1px solid #b2e8e6;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.qtip-ic {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
  background: #b2e8e6;
  color: #00756f;
  display: grid;
  place-items: center;
}
.qtip-body {
  flex: 1;
  min-width: 0;
}
.qtip-body strong {
  display: block;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  color: #00756f;
  margin-bottom: 4px;
}
.qtip-body p {
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #115e59;
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
  gap: 4px;
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

.help-btn {
  padding-left: 20px;
  padding-right: 20px;
}

.play-icon {
  font-size: 12px;
}

.question-section {
  margin-top: 4px;
  background: transparent;
  border: none;
  padding: 0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.prev-btn {
  background: white;
  border: 0.33px solid #3c3c432e;
  border-radius: 40px;
  color: #00a19a;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  padding: 4px 8px;
}

.prev-btn:disabled {
  color: #999;
  cursor: not-allowed;
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
  display: flex;
  align-items: center;
  margin: 0px 0 8px -5px;
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
}

.question-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 12px 16px;
  border: 0.33px solid #3c3c432e;
}

.question-card + .question-card {
  margin-top: 16px;
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
  color: #00a19a;
  background: #00a19a1a;
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

/* ── Property Photos Upload ───────────────────────────────────────────────── */
.property-photos-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.property-photos-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a2e2b;
  margin: 0 0 6px;
}

.property-photos-sub {
  font-size: 13px;
  color: #6b7c78;
  margin: 0 0 16px;
  line-height: 1.5;
}

.property-photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.property-photo-item {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
}

.property-photo-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.property-photo-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.property-photos-actions {
  display: flex;
  justify-content: flex-start;
}

.add-photos-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #00a19a;
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.add-photos-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hidden-file-input {
  display: none;
}
/* ─────────────────────────────────────────────────────────────────────────── */
</style>
