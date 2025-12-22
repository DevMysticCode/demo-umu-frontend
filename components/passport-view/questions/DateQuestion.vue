<template>
  <div class="date-options">
    <div
      v-for="(option, index) in question.options"
      :key="option.value"
      class="date-option"
      :class="{
        selected: getSelectedValue() === option.value,
        'single-option': question.options.length === 1,
      }"
      @click="selectOption(option.value)"
    >
      <div
        v-if="question.options.length > 1"
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
          (getSelectedValue() === option.value || question.options.length === 1)
        "
        class="date-badge"
      >
        <span v-if="getDateValue()" class="date-text">
          {{ formatDate(getDateValue(), option.dateFormat) }}
        </span>
        <span v-else class="date-placeholder">
          {{ option.datePlaceholder || 'Select date' }}
        </span>

        <input
          :ref="(el) => setDateInputRef(el, index)"
          :type="getInputType(option)"
          :value="getInputValue(option)"
          @change="(e) => updateDate(e, option)"
          @click.stop
          class="date-input-overlay"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  answer: {
    type: [String, Object],
    default: '',
  },
})

const emit = defineEmits(['update'])

const dateInputRefs = ref({})

const setDateInputRef = (el, index) => {
  if (el) {
    dateInputRefs.value[index] = el
  }
}

onMounted(() => {
  if (props.question.options.length === 1 && !getSelectedValue()) {
    selectOption(props.question.options[0].value)
  }
})

const getSelectedValue = () => {
  if (typeof props.answer === 'object' && props.answer !== null) {
    return props.answer.value
  }
  return props.answer
}

const getDateValue = () => {
  if (typeof props.answer === 'object' && props.answer !== null) {
    return props.answer.date || ''
  }
  return ''
}

const selectOption = (value) => {
  const selectedOption = props.question.options.find(
    (opt) => opt.value === value
  )

  if (selectedOption?.hasDate) {
    emit('update', { value, date: getDateValue() })
  } else {
    emit('update', value)
  }
}

const getInputType = (option) => {
  if (!option.dateFormat) return 'month'

  if (option.dateFormat === 'year') return 'date'
  if (option.dateFormat === 'monthYear') return 'month'
  if (option.dateFormat === 'fullDate') return 'date'

  return 'month'
}

const getInputValue = (option) => {
  const dateValue = getDateValue()
  if (!dateValue) return ''

  if (option.dateFormat === 'year') {
    return `${dateValue}-01-01`
  }

  return dateValue
}

const updateDate = (event, option) => {
  let newDate = event.target.value

  if (option.dateFormat === 'year') {
    const year = newDate.split('-')[0]
    newDate = year
  }

  emit('update', {
    value: getSelectedValue(),
    date: newDate,
  })
}

const formatDate = (dateString, format) => {
  if (!dateString) return ''

  const currentFormat = format || 'monthYear'

  if (currentFormat === 'year') {
    return dateString
  }

  if (currentFormat === 'monthYear') {
    const [year, month] = dateString.split('-')
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  if (currentFormat === 'fullDate') {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return dateString
}
</script>

<style scoped>
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
