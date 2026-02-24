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

    <!-- Options -->
    <div class="checkbox-options">
      <div
        v-for="option in question.options"
        :key="option.value"
        class="checkbox-option"
        :class="{ selected: isSelected(option.value) }"
        @click="toggleOption(option.value)"
      >
        <div class="checkbox" :class="{ checked: isSelected(option.value) }">
          <span v-if="isSelected(option.value)" class="check-mark">✓</span>
        </div>
        <span class="option-label">{{ option.label }}</span>
      </div>
    </div>

    <!-- Other text input (only shown when otherPlaceholder is set and 'other' is selected) -->
    <textarea
      v-if="showOtherTextarea"
      :value="otherText"
      @input="onOtherTextInput"
      :placeholder="question.otherPlaceholder"
      class="other-text-input"
      rows="3"
    ></textarea>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  answer: {
    type: [Array, Object],
    default: () => [],
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

const otherText = ref('')

// Support both plain array answers and {values, otherText} object answers
const selectedValues = computed(() => {
  if (Array.isArray(props.answer)) return props.answer
  if (props.answer && typeof props.answer === 'object' && Array.isArray(props.answer.values)) {
    return props.answer.values
  }
  return []
})

watch(
  () => props.answer,
  (val) => {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      otherText.value = val.otherText || ''
    }
  },
  { immediate: true },
)

const isSelected = (value) => selectedValues.value.includes(value)

const emitAnswer = (values) => {
  if (props.question?.otherPlaceholder) {
    emit('update', { values, otherText: otherText.value })
  } else {
    emit('update', values)
  }
}

const toggleOption = (value) => {
  const newValues = [...selectedValues.value]
  const index = newValues.indexOf(value)

  if (index > -1) {
    newValues.splice(index, 1)
  } else {
    newValues.push(value)
  }

  emitAnswer(newValues)
}

const showOtherTextarea = computed(() => !!props.question?.otherPlaceholder)

const onOtherTextInput = (event) => {
  otherText.value = event.target.value
  emitAnswer(selectedValues.value)
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

.checkbox-options {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-option:active {
  transform: scale(0.98);
}

.checkbox-option.selected {
  border-color: #00b8a9;
  background: #f0fffe;
}

.checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid #ccc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.checkbox-option.selected .checkbox {
  border-color: #00b8a9;
  background: #00b8a9;
}

.check-mark {
  color: white;
  font-size: 16px;
  font-weight: 700;
}

.option-label {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.other-text-input {
  width: 100%;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  background: #f9f9f9;
  box-sizing: border-box;
  color: #666;
  transition: border-color 0.2s;
}

.other-text-input:focus {
  outline: none;
  border-color: #00b8a9;
  background: white;
}
</style>
