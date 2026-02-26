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

    <div
      v-for="section in groupedSections"
      :key="section.groupKey || section.parts[0].partKey"
      class="part-section"
    >
      <div v-for="part in section.parts" :key="part.partKey" class="group-part">
        <!-- Part-specific text display -->
        <template
          v-if="
            part.type?.toLowerCase?.() === 'text' &&
            (part.display?.toLowerCase?.() === 'upload' ||
              part.display?.toLowerCase?.() === 'both')
          "
        >
          <!-- Teal section header for upload/both parts (disabled for now) -->
          <!-- <h3 class="section-title">Upload/ Scan Any Supporting Document(s)</h3> -->
        </template>
        <template v-else>
          <p
            v-if="part.title && part.type !== 'multifieldform'"
            class="part-text"
          >
            {{ part.title }}
            <span v-if="false" class="typing-cursor">|</span>
          </p>

          <p v-if="part.description" class="part-description">
            {{ part.description }}
          </p>

          <!-- Part-level external link -->
          <a
            v-if="part.externalLink"
            :href="part.externalLink.url"
            target="_blank"
            rel="noopener noreferrer"
            class="part-external-link"
          >
            <svg
              class="part-external-link__icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
              />
              <path
                d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
              />
            </svg>
            {{ part.externalLink.label }}
          </a>
        </template>

        <div v-if="part.helpText" class="help-section part-help-section">
          <div class="help-content">
            <h4 class="help-title">
              <span class="help-icon">💡</span>What is this?
            </h4>
            <p class="help-text">{{ part.helpText }}</p>
          </div>
        </div>

        <!-- Voice + text input for chips parts that have showVoiceInput -->
        <VoiceTextInput
          v-if="part.showVoiceInput"
          :value="localAnswers[part.partKey + '_text'] || ''"
          @update="(val) => updateVoiceText(part.partKey, val)"
        />

        <!-- Date input badge row (shown above the component when showDateInput is true) -->
        <div
          v-if="part.showDateInput"
          class="number-input-row date-input-above"
        >
          <span class="number-input-label">{{
            part.dateInputLabel || 'Date'
          }}</span>
          <div class="date-badge-wrap">
            <span
              v-if="localAnswers[part.partKey + '_date']"
              class="date-badge-value"
            >
              {{ formatDateForDisplay(localAnswers[part.partKey + '_date']) }}
            </span>
            <span v-else class="date-badge-placeholder">Select date</span>
            <input
              type="date"
              class="date-badge-input"
              :value="localAnswers[part.partKey + '_date'] || ''"
              @input="(e) => updateDatePartInput(part.partKey, e.target.value)"
            />
          </div>
        </div>

        <!-- Counter part (type: counter) — rendered inline, no sub-component -->
        <div
          v-if="part.type?.toLowerCase?.() === 'counter'"
          class="number-input-row counter-row"
        >
          <span class="number-input-label">{{ part.label || part.title }}</span>
          <div class="counter-controls">
            <span class="counter-value">{{ localAnswers[part.partKey] ?? 0 }}</span>
            <div class="counter-buttons">
              <button
                class="counter-btn"
                @click.prevent="decrementCounter(part.partKey)"
              >—</button>
              <span class="counter-divider">|</span>
              <button
                class="counter-btn"
                @click.prevent="incrementCounter(part.partKey)"
              >+</button>
            </div>
          </div>
        </div>

        <component
          v-else
          :is="getPartComponent(part)"
          :question="buildPartQuestion(part)"
          :answer="getPartAnswer(part)"
          :display="getPartDisplay(part)"
          :passport-id="part.passportId || ''"
          :hide-question-display="true"
          @update="(val) => updatePartAnswer(part.partKey, val)"
        />

        <!-- Synced number input for chips parts that request it -->
        <div
          v-if="part.type?.toLowerCase?.() === 'chips' && part.showNumberInput"
          class="number-input-row"
        >
          <span class="number-input-label">{{ part.numberInputLabel }}</span>
          <input
            class="number-input"
            type="number"
            min="0"
            :value="getChipsNumberValue(part.partKey)"
            @change="(e) => setChipsFromNumber(part.partKey, e.target.value)"
          />
        </div>

        <!-- Currency input row (always visible, for parts with showCurrencyInput) -->
        <div v-if="part.showCurrencyInput" class="number-input-row">
          <span class="number-input-label">{{
            part.currencyInputLabel || 'Enter Amount'
          }}</span>
          <input
            class="number-input currency-input"
            type="text"
            inputmode="decimal"
            placeholder="£ 0000"
            :value="localAnswers[part.partKey + '_amount'] || ''"
            @input="
              (e) => updateCurrencyPartInput(part.partKey, e.target.value)
            "
          />
        </div>
      </div>
    </div>

    <!-- Question-level link cards (from prewritten.links) -->
    <div v-if="questionLinks.length > 0" class="question-link-cards">
      <div
        v-for="(link, i) in questionLinks"
        :key="i"
        class="question-link-card"
      >
        <div class="question-link-card__card">
          <div class="question-link-card__body">
            <!-- description is the card's main heading -->
            <p v-if="link.description" class="question-link-card__description">
              {{ link.description }}
            </p>
            <div class="infoCard">
              <div class="d-flex">
                <div>
                  <p class="question-link-card__title">{{ link.title }}</p>
                  <a
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="question-link-card__url"
                    >{{ link.url }}</a
                  >
                </div>
                <div>
                  <OPIcon
                    v-if="link.icon"
                    :name="link.icon"
                    class="w-[80px] h-[80px]"
                  />
                </div>
              </div>

              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="question-link-card__btn"
                ><OPIcon name="visitLink" class="w-[15px] h-[15px]" /> Visit
                Link</a
              >
            </div>
          </div>
        </div>
      </div>
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
import VoiceTextInput from './VoiceTextInput.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

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

// Link cards from prewritten.links (rendered after all parts)
const questionLinks = computed(() => props.question?.prewritten?.links || [])

const isPartVisible = (part) => {
  // If no conditional, always show
  if (!part.conditionalOn) return true

  // Find the answer for the part we're dependent on
  const rawAnswer = localAnswers.value[part.conditionalOn]

  // If answer doesn't exist, don't show
  if (rawAnswer === undefined || rawAnswer === null) return false

  // DATE questions emit { value, date } — extract the scalar value for comparison
  const dependentPartAnswer =
    rawAnswer !== null && typeof rawAnswer === 'object' && 'value' in rawAnswer
      ? rawAnswer.value
      : rawAnswer

  // Check if the answer is in showOnValues
  if (!part.showOnValues || !Array.isArray(part.showOnValues)) return false
  return part.showOnValues.includes(dependentPartAnswer)
}

const visibleParts = computed(() => {
  return sortedParts.value.filter((part) => isPartVisible(part))
})

const groupedSections = computed(() => {
  const sections = []
  const groupMap = new Map()
  for (const part of visibleParts.value) {
    const gk = part.groupKey
    if (gk) {
      if (!groupMap.has(gk)) {
        const group = { groupKey: gk, parts: [] }
        groupMap.set(gk, group)
        sections.push(group)
      }
      groupMap.get(gk).parts.push(part)
    } else {
      sections.push({ groupKey: null, parts: [part] })
    }
  }
  return sections
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
  const display = part.display?.toLowerCase?.()

  // Only use explicitly set uploadInstruction (MultipartQuestion already renders part.title)
  const uploadInstruction = part.uploadInstruction || ''

  return {
    title: part.title,
    description: part.description || '',
    options: part.options || [],
    placeholder: part.placeholder || '',
    type: normalizedType,
    display: normalizedType === 'upload' ? 'upload' : part.display || 'text',
    instructionText: part.instructionText || part.title,
    dateFields: part.dateFields,
    uploadInstruction: uploadInstruction,
    // scale / number metadata
    min: part.min ?? part.scaleMin,
    max: part.max ?? part.scaleMax,
    step: part.step ?? part.scaleStep,
    scaleMin: part.scaleMin,
    scaleMax: part.scaleMax,
    scaleStep: part.scaleStep,
    scaleMinLabel: part.scaleMinLabel,
    scaleMaxLabel: part.scaleMaxLabel,
    scaleFormat: part.scaleFormat,
    // chips single-select
    singleSelect: part.singleSelect || false,
    // checkbox "other" text field
    otherPlaceholder: part.otherPlaceholder || '',
    // text rows
    rows: part.rows,
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
  if (type === 'counter') return 0
  return ''
}

const decrementCounter = (partKey) => {
  const current = Number(localAnswers.value[partKey] ?? 0)
  updatePartAnswer(partKey, Math.max(0, current - 1))
}

const incrementCounter = (partKey) => {
  const current = Number(localAnswers.value[partKey] ?? 0)
  updatePartAnswer(partKey, current + 1)
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

const getChipsNumberValue = (partKey) => {
  const val = localAnswers.value[partKey]
  if (!Array.isArray(val) || val.length === 0) return ''
  const num = val.find(
    (v) => typeof v === 'string' && v !== '' && !isNaN(Number(v)),
  )
  return num ?? ''
}

const setChipsFromNumber = (partKey, numStr) => {
  const trimmed = String(numStr).trim()
  if (trimmed === '') {
    updatePartAnswer(partKey, [])
    return
  }
  updatePartAnswer(partKey, [trimmed])
}

const updateCurrencyPartInput = (partKey, value) => {
  localAnswers.value[partKey + '_amount'] = value
  emit('update', { ...localAnswers.value })
}

const updateVoiceText = (partKey, value) => {
  localAnswers.value[partKey + '_text'] = value
  emit('update', { ...localAnswers.value })
}

const updateDatePartInput = (partKey, value) => {
  localAnswers.value[partKey + '_date'] = value
  emit('update', { ...localAnswers.value })
}

const formatDateForDisplay = (isoDate) => {
  if (!isoDate) return ''
  try {
    const [y, m, d] = isoDate.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return isoDate
  }
}

const updatePartAnswer = (partKey, value) => {
  localAnswers.value[partKey] = value
  emit('update', { ...localAnswers.value })
}

// Expose method for parent to check if a part is visible
const getVisibleParts = () => {
  return visibleParts.value
}
</script>

<style scoped>

.infoCard .d-flex{
  display: flex; 
}

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

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #00b8a9;
  margin: 0;
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
  white-space: pre-line;
}

.part-external-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #00a19a;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  margin: auto;
  margin-bottom: 12px;
  padding: 7px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 50px;
  background: #fff;
  width: fit-content;
}

.part-external-link:active {
  opacity: 0.7;
}

.part-external-link__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
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

.group-part + .group-part {
  margin-top: 16px;
  padding-top: 16px;
  /* border-top: 0.33px solid #3c3c432e; */
}

.number-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
}

.number-input-label {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  flex: 1;
}

.number-input {
  padding: 8px 16px;
  background: #e6f9f7;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #00b8a9;
  text-align: center;
  width: 60px;
  outline: none;
  -moz-appearance: textfield;
}

.number-input::-webkit-outer-spin-button,
.number-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input:focus {
  background: #d1f5f1;
}

.currency-input {
  width: 110px;
}

.counter-row {
  padding: 12px 16px;
}

.counter-controls {
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}

.counter-value {
  padding: 8px 16px;
  background: #e6f9f7;
  border-radius: 8px 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #00b8a9;
  min-width: 52px;
  text-align: center;
}

.counter-buttons {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border-radius: 0 8px 8px 0;
  overflow: hidden;
}

.counter-btn {
  padding: 8px 14px;
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: 500;
  color: #3c3c43;
  cursor: pointer;
  line-height: 1;
  -webkit-tap-highlight-color: transparent;
}

.counter-btn:active {
  background: #e0e0e0;
}

.counter-divider {
  color: #c0c0c0;
  font-size: 18px;
  line-height: 1;
  pointer-events: none;
}

.date-badge-wrap {
  position: relative;
  padding: 8px 16px;
  background: #e6f9f7;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  min-width: 110px;
  text-align: center;
}

.date-badge-value {
  font-size: 15px;
  font-weight: 600;
  color: #00b8a9;
  position: relative;
  z-index: 1;
  pointer-events: none;
  white-space: nowrap;
}

.date-badge-placeholder {
  font-size: 14px;
  color: #999;
  position: relative;
  z-index: 1;
  pointer-events: none;
  white-space: nowrap;
}

.date-badge-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.date-badge-input::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
}

.date-input-above {
  margin-top: 0;
  margin-bottom: 10px;
}

/* Question-level link cards */
.question-link-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.question-link-card__card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.question-link-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.question-link-card__description {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.5;
  margin: 0 0 8px 0;
}

.question-link-card__title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
  margin-top: 16px;
}

.question-link-card__url {
  font-size: 13px;
  color: #00a19a;
  text-decoration: none;
  word-break: break-all;
  line-height: 1.4;
}

.question-link-card__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #00a19a;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 100px;
  text-decoration: none;
  width: 100%;
  justify-content: center;
  margin-left: auto;
  margin-top: 8px;
  float: right;
  width: fit-content;
}
</style>
