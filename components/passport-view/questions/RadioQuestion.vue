<template>
  <div class="radio-options">
    <div
      v-for="option in question.options"
      :key="option.value"
      class="radio-option"
      :class="{ selected: answer === option.value }"
      @click="selectOption(option.value)"
    >
      <div class="radio-btn" :class="{ checked: answer === option.value }">
        <span v-if="answer === option.value" class="check-icon">✓</span>
      </div>
      <span class="option-label">{{ option.label }}</span>
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

const selectOption = (value) => {
  emit('update', value)
}
</script>

<style scoped>
.radio-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 0.33px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 16px;
  gap: 8px;
  border-width: 0.33px;
}

.radio-option:active {
  transform: scale(0.98);
}

.radio-option.selected {
  border-color: #00b8a9;
  background: #f0fffe;
}

.radio-btn {
  width: 20px;
  height: 20px;
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
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.option-label {
  color: #000000;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
}
</style>
