<template>
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
</template>

<script setup>
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  answer: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update'])

const isSelected = (value) => {
  return props.answer.includes(value)
}

const toggleOption = (value) => {
  const newAnswer = Array.isArray(props.answer) ? [...props.answer] : []
  const index = newAnswer.indexOf(value)

  if (index > -1) {
    newAnswer.splice(index, 1)
  } else {
    newAnswer.push(value)
  }

  emit('update', newAnswer)
}
</script>

<style scoped>
.checkbox-options {
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
</style>
