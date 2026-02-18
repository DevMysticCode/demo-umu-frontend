<template>
  <div>
    <!-- Question Display (skip if hideQuestionDisplay is true) -->
    <template v-if="!hideQuestionDisplay">
      <p v-if="displayedQuestion" class="question-text">
        {{ displayedQuestion }}
        <span v-if="showQuestionCursor" class="typing-cursor">|</span>
      </p>

      <!-- Description Display -->
      <div v-if="displayedDescription" class="question-description">
        {{ displayedDescription }}
        <span
          v-if="showDescriptionCursor"
          class="typing-cursor typing-cursor--small"
          >|</span
        >
      </div>

      <!-- Help Display -->
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
    </template>

    <div class="date-options">
      <div
        v-for="(option, index) in question.options"
        :key="option.value"
        class="date-option"
        :class="{
          selected: !isMultiInputMode && getSelectedValue() === option.value,
          'single-option': question.options.length === 1,
          'multi-input-option': isMultiInputMode,
        }"
        @click="handleOptionClick(option.value)"
      >
        <div
          v-if="question.options.length > 1 && !isMultiInputMode"
          class="radio-btn"
          :class="{ checked: getSelectedValue() === option.value }"
        >
          <span v-if="getSelectedValue() === option.value" class="check-icon"
            >✓</span
          >
        </div>

        <span class="option-label">{{ option.label }}</span>

        <div
          v-if="
            option.hasDate &&
            (isMultiInputMode ||
              getSelectedValue() === option.value ||
              question.options.length === 1)
          "
          class="date-badge"
        >
          <span v-if="getDateValue(option)" class="date-text">
            {{ formatValue(getDateValue(option), option) }}
          </span>
          <span v-else class="date-placeholder">
            {{ option.datePlaceholder || 'Select date' }}
          </span>

          <input
            :ref="(el) => setDateInputRef(el, index)"
            :type="getInputType(option)"
            :inputmode="getInputMode(option)"
            :value="getInputValue(option)"
            @input="(e) => updateDate(e, option)"
            @click.stop
            class="date-input-overlay"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  answer: {
    type: [String, Object],
    default: '',
  },
  displayedQuestion: {
    type: String,
    default: '',
  },
  showQuestionCursor: {
    type: Boolean,
    default: false,
  },
  displayedDescription: {
    type: String,
    default: '',
  },
  showDescriptionCursor: {
    type: Boolean,
    default: false,
  },
  displayedHelp: {
    type: String,
    default: '',
  },
  showHelpCursor: {
    type: Boolean,
    default: false,
  },
  hideQuestionDisplay: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update'])

const dateInputRefs = ref({})

const setDateInputRef = (el, index) => {
  if (el) {
    dateInputRefs.value[index] = el
  }
}

const isMultiInputMode = computed(() => {
  if (!props.question?.options || props.question.options.length < 2)
    return false
  return (
    props.question.options.every((opt) => opt.hasDate) &&
    props.question.options.some((opt) => opt.inputType)
  )
})

onMounted(() => {
  if (
    !isMultiInputMode.value &&
    props.question.options.length === 1 &&
    !getSelectedValue()
  ) {
    selectOption(props.question.options[0].value)
  }
})

const getSelectedValue = () => {
  if (typeof props.answer === 'object' && props.answer !== null) {
    return props.answer.value
  }
  return props.answer
}

const getDateValue = (option) => {
  if (isMultiInputMode.value) {
    if (typeof props.answer === 'object' && props.answer !== null) {
      return props.answer[option.value] || ''
    }
    return ''
  }
  if (typeof props.answer === 'object' && props.answer !== null) {
    return props.answer.date || ''
  }
  return ''
}

const selectOption = (value) => {
  const selectedOption = props.question.options.find(
    (opt) => opt.value === value,
  )

  if (selectedOption?.hasDate) {
    emit('update', { value, date: getDateValue() })
  } else {
    emit('update', value)
  }
}

const handleOptionClick = (value) => {
  if (isMultiInputMode.value) return
  selectOption(value)
}

const getOptionFormat = (option) => {
  return option.inputType || option.dateFormat || 'monthYear'
}

const isNumericInput = (option) => {
  const format = getOptionFormat(option)
  return ['percentage', 'currency', 'number', 'years', 'units'].includes(format)
}

const getInputType = (option) => {
  const format = getOptionFormat(option)

  if (isNumericInput(option)) return 'text'
  if (format === 'year') return 'date'
  if (format === 'monthYear' || format === 'month') return 'month'
  if (format === 'fullDate') return 'date'

  return 'month'
}

const getInputValue = (option) => {
  const dateValue = getDateValue(option)
  if (!dateValue) return ''

  const format = getOptionFormat(option)
  if (isNumericInput(option)) return dateValue

  if (format === 'year') {
    return `${dateValue}-01-01`
  }

  return dateValue
}

const updateDate = (event, option) => {
  let newValue = event.target.value
  const format = getOptionFormat(option)

  if (format === 'year') {
    const year = newValue.split('-')[0]
    newValue = year
  }

  if (isMultiInputMode.value) {
    const current =
      typeof props.answer === 'object' && props.answer !== null
        ? { ...props.answer }
        : {}
    current[option.value] = newValue
    emit('update', current)
    return
  }

  if (isNumericInput(option)) {
    emit('update', {
      value: getSelectedValue(),
      date: newValue,
    })
    return
  }

  emit('update', {
    value: getSelectedValue(),
    date: newValue,
  })
}

const getInputMode = (option) => {
  const format = getOptionFormat(option)
  if (format === 'percentage' || format === 'currency') return 'decimal'
  if (format === 'number' || format === 'years' || format === 'units')
    return 'numeric'
  return undefined
}

const formatValue = (rawValue, option) => {
  if (!rawValue) return ''

  const format = getOptionFormat(option)

  if (format === 'percentage') {
    return `${rawValue}%`
  }

  if (format === 'currency') {
    return `£ ${rawValue}`
  }

  if (format === 'years') {
    return `${rawValue} years`
  }

  if (format === 'units') {
    return `${rawValue} units`
  }

  if (format === 'number') {
    return `${rawValue}`
  }

  if (format === 'year') {
    return rawValue
  }

  if (format === 'month' || format === 'monthYear') {
    const [year, month] = rawValue.split('-')
    const date = new Date(year, month - 1)
    if (format === 'month') {
      return date.toLocaleDateString('en-US', { month: 'long' })
    }
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
  }

  if (format === 'fullDate') {
    const date = new Date(rawValue)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return rawValue
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

.date-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.date-option:active {
  transform: scale(0.98);
}

.date-option.selected {
  border-color: #00b8a9;
  background: #f0fffe;
}

.date-option.single-option {
  padding: 16px 20px;
}

.radio-btn {
  width: 28px;
  height: 28px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  background: white;
}

.radio-btn.checked {
  background: #00b8a9;
  border-color: #00b8a9;
}

.check-icon {
  color: white;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.option-label {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  flex: 1;
}

.date-badge {
  padding: 8px 16px;
  background: #e6f9f7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.date-badge:hover {
  background: #d1f5f1;
}

.date-text {
  font-size: 16px;
  font-weight: 600;
  color: #00b8a9;
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.date-placeholder {
  font-size: 14px;
  color: #999;
  position: relative;
  z-index: 1;
  pointer-events: none;
}

.date-input-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.date-input-overlay::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
  opacity: 0;
}
</style>
