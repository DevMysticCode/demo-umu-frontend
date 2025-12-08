<template>
  <div class="text-input-wrapper">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>
    <div class="input-container">
      <div v-if="!answer || answer.length === 0" class="pending-badge">
        <span class="pending-icon">⚠</span> Pending
      </div>
      <p class="input-instruction">
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
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
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
</style>
