<template>
  <div class="multipart-question">
    <!-- Question Display (only for first part) -->
    <!-- <template v-if="sortedParts[0]">
      <p v-if="displayedQuestion" class="question-text">
        {{ displayedQuestion }}
        <span v-if="showQuestionCursor" class="typing-cursor">|</span>
      </p>

      <div v-if="displayedDescription" class="question-description">
        {{ displayedDescription }}
        <span
          v-if="showDescriptionCursor"
          class="typing-cursor typing-cursor--small"
          >|</span
        >
      </div>

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
    </template> -->

    <div v-for="part in sortedParts" :key="part.partKey" class="part-section">
      <!-- Part-specific text display -->
      <p v-if="part.title && part.type !== 'multifieldform'" class="part-text">
        {{ part.title }}
        <span v-if="false" class="typing-cursor">|</span>
      </p>

      <p v-if="part.description" class="part-description">
        {{ part.description }}
      </p>

      <div v-if="part.helpText" class="help-section part-help-section">
        <div class="help-content">
          <h4 class="help-title">
            <span class="help-icon">💡</span>What is this?
          </h4>
          <p class="help-text">{{ part.helpText }}</p>
        </div>
      </div>

      <component
        :is="getPartComponent(part)"
        :question="buildPartQuestion(part)"
        :answer="getPartAnswer(part)"
        :display="getPartDisplay(part)"
        :passport-id="part.passportId || ''"
        :hide-question-display="true"
        @update="(val) => updatePartAnswer(part.partKey, val)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import RadioQuestion from './RadioQuestion.vue'
import DateQuestion from './DateQuestion.vue'
import TextUploadQuestion from './TextUploadQuestion.vue'
import TextQuestion from './TextQuestion.vue'
import CheckboxQuestion from './CheckboxQuestion.vue'
import ChipsQuestion from './ChipsQuestion.vue'
import ScaleQuestion from './ScaleQuestion.vue'
import AddressQuestion from './AddressQuestion.vue'
import CollaboratorsQuestion from './CollaboratorsQuestion.vue'
import MultiTextInputQuestion from './MultiTextInputQuestion.vue'
import MultiFieldFormQuestion from './MultiFieldFormQuestion.vue'

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: [Object, String], default: () => ({}) },
  passportId: { type: String, default: '' },
  displayedQuestion: { type: String, default: '' },
  showQuestionCursor: { type: Boolean, default: false },
  displayedDescription: { type: String, default: '' },
  showDescriptionCursor: { type: Boolean, default: false },
  displayedHelp: { type: String, default: '' },
  showHelpCursor: { type: Boolean, default: false },
})

const emit = defineEmits(['update'])

const localAnswers = ref({})

// Initialize from saved answers
watch(
  () => props.answer,
  (val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      localAnswers.value = { ...val }
    }
  },
  { immediate: true },
)

const sortedParts = computed(() => {
  if (!props.question?.parts) return []
  return [...props.question.parts].sort((a, b) => a.order - b.order)
})

const getPartComponent = (part) => {
  const type = part?.type?.toLowerCase?.()
  const display = part?.display?.toLowerCase?.()
  if (type === 'text' && (display === 'upload' || display === 'both')) {
    return TextUploadQuestion
  }
  const map = {
    radio: RadioQuestion,
    date: DateQuestion,
    text: TextQuestion,
    upload: TextUploadQuestion,
    checkbox: CheckboxQuestion,
    chips: ChipsQuestion,
    scale: ScaleQuestion,
    number: ScaleQuestion,
    address: AddressQuestion,
    collaborators: CollaboratorsQuestion,
    multitextinput: MultiTextInputQuestion,
    multifieldform: MultiFieldFormQuestion,
  }
  return map[type] || TextUploadQuestion
}

const buildPartQuestion = (part) => {
  const normalizedType = part.type?.toLowerCase?.()
  return {
    title: part.title,
    description: part.description || '',
    options: part.options || [],
    placeholder: part.placeholder || '',
    type: normalizedType,
    display: normalizedType === 'upload' ? 'upload' : part.display || 'text',
    instructionText: part.instructionText || part.title,
    dateFields: part.dateFields,
    uploadInstruction: part.uploadInstruction || '',
    // scale / number metadata
    min: part.min,
    max: part.max,
    step: part.step,
    // pass passportId through when rendering (used by collaborators part)
    passportId: part.passportId || '',
    // multifieldform metadata
    fields: part.fields || [],
    repeatable: part.repeatable !== undefined ? part.repeatable : false,
    buttonText: part.buttonText || 'Add More',
  }
}

const getPartDisplay = (part) => {
  const display = part.display?.toLowerCase?.()
  if (display === 'text' || display === 'upload' || display === 'both') {
    return display
  }
  const type = part.type?.toLowerCase?.()
  if (type === 'upload') return 'upload'
  if (type === 'text') return 'text'
  return type
}

const getPartAnswer = (part) => {
  const val = localAnswers.value[part.partKey]
  if (val !== undefined && val !== null) return val
  // Return appropriate default based on type
  const type = part.type?.toLowerCase?.()
  if (type === 'checkbox') return []
  if (type === 'upload') return []
  if (type === 'multifieldform') {
    return part.repeatable ? [] : {}
  }
  return ''
}

const isPartAnswered = (partKey) => {
  const val = localAnswers.value[partKey]
  if (val === undefined || val === null || val === '') return false
  if (Array.isArray(val)) {
    if (val.length === 0) return false
    // For multifieldform repeatable: check if any form has at least one field
    if (typeof val[0] === 'object' && val[0] !== null) {
      return val.some((form) =>
        Object.values(form).some(
          (field) => field !== undefined && field !== null && field !== '',
        ),
      )
    }
    return true
  }
  if (typeof val === 'object' && !Array.isArray(val)) {
    // For multifieldform non-repeatable: check if any field is filled
    if (Object.keys(val).length === 0) return false
    // Check if any field has a value
    return Object.values(val).some(
      (field) => field !== undefined && field !== null && field !== '',
    )
  }
  return true
}

const updatePartAnswer = (partKey, value) => {
  localAnswers.value[partKey] = value
  emit('update', { ...localAnswers.value })
}
</script>

<style scoped>
.question-text {
  color: #000000;
  margin: 0 0 20px 0;
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
  margin-bottom: 20px;
}

.help-section {
  display: flex;
  gap: 2px;
  padding: 12px;
  background: #00a19a1a;
  border-radius: 12px;
  border: 2px solid #e6f9f7;
  margin-bottom: 20px;
}

.help-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.help-content {
  flex: 1;
}

.help-title {
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

.typing-cursor {
  margin-left: 2px;
  color: #00a19a;
  animation: blink 1s infinite;
}

.typing-cursor--small {
  margin-left: 2px;
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

.multipart-question {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.part-section {
  background: #ffffff;
  border: 0.33px solid #3c3c432e;
  border-radius: 16px;
  padding: 12px 16px;
}

.part-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.part-title {
  font-size: 15px;
  font-weight: 400;
  color: #000;
  margin: 0;
  line-height: 20px;
  letter-spacing: -0.23px;
  flex: 1;
  padding-right: 8px;
}

.part-text {
  font-size: 15px;
  font-weight: 500;
  color: #3c3c43;
  margin: 0 0 12px 0;
  letter-spacing: -0.23px;
  line-height: 1.5;
}

.part-description {
  font-size: 13px;
  color: #3c3c4399;
  margin: 0 0 12px 0;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.part-help-section {
  margin: 0 0 16px 0;
}

.pending-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff6b6b;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.pending-icon {
  font-size: 11px;
}
</style>
