<template>
  <div class="text-input-wrapper">
    <!-- Question Display Section (skip if hideQuestionDisplay is true) -->
    <template v-if="!hideQuestionDisplay">
      <div v-if="!answer || answer.length === 0" class="pending-badge">
        <span class="pending-icon">⚠</span> Pending
      </div>
      <p v-if="displayedQuestion" class="question-text">
        {{ displayedQuestion }}
        <span v-if="showQuestionCursor" class="typing-cursor">|</span>
      </p>

      <!-- Description Display Section -->
      <p v-if="displayedDescription" class="question-description">
        {{ displayedDescription }}
        <span v-if="showDescriptionCursor" class="typing-cursor">|</span>
      </p>

      <!-- Help Display Section -->
      <div v-if="displayedHelp" class="help-section">
        <span class="help-icon">ⓘ</span>
        <span class="help-text">
          {{ displayedHelp }}
          <span v-if="showHelpCursor" class="typing-cursor">|</span>
        </span>
      </div>
    </template>

    <!-- <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3> -->
    <div class="input-container">
      <p v-if="!hideQuestionDisplay" class="input-instruction">
        {{
          question.instructionText ||
          'Please provide written instruction for your answer above:'
        }}
      </p>
      <textarea
        :value="answer"
        @input="updateAnswer"
        :placeholder="
          question.placeholder ||
          'E.g., Back fence in the garden has been moved back 2 yards...'
        "
        class="text-input"
        rows="6"
      ></textarea>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  answer: {
    type: String,
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

const updateAnswer = (event) => {
  const value = event.target.value
  if (value.length <= 500) {
    emit('update', value)
  }
}
</script>

<style scoped>
.text-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #00b8a9;
  margin: 0;
}

.input-container {
  background: white;
  /* border: 2px solid #e0e0e0; */
  border-radius: 12px;
  /* padding: 16px; */
  position: relative;
}

.pending-badge {
  /* position: absolute; */
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff6b6b;
  font-weight: 600;
}

.pending-icon {
  font-size: 14px;
}

.input-instruction {
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  background: #f9f9f9;
  transition: border-color 0.2s;
  box-sizing: border-box;
  color: #666;
}

.text-input:focus {
  outline: none;
  border-color: #00b8a9;
  background: white;
}

.text-input::placeholder {
  color: #999;
  font-style: italic;
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
  gap: 8px;
  padding: 12px;
  background-color: #00a19a1a;
  border-radius: 12px;
  margin: 0 0 20px 0;
  font-size: 13px;
  color: #3c3c43;
}

.help-icon {
  flex-shrink: 0;
  font-size: 16px;
  color: #00a19a;
}

.help-text {
  line-height: 1.4;
}

.typing-cursor {
  display: inline-block;
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
</style>
