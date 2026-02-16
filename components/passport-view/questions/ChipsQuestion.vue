<template>
  <div class="chips-question">
    <template v-if="!hideQuestionDisplay">
      <p v-if="titleText" class="question-title">
        {{ titleText }}
        <span v-if="showQuestionCursor" class="typing-cursor">|</span>
      </p>
      <p v-if="descriptionText" class="question-description">
        {{ descriptionText }}
        <span v-if="showDescriptionCursor" class="typing-cursor">|</span>
      </p>
    </template>

    <div class="chips-wrap">
      <button
        v-for="opt in question.options"
        :key="opt.value"
        :class="['chip', { selected: isSelected(opt.value) }]"
        @click="toggle(opt.value)"
        type="button"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: Array, default: () => [] },
  displayedQuestion: { type: String, default: '' },
  showQuestionCursor: { type: Boolean, default: false },
  displayedDescription: { type: String, default: '' },
  showDescriptionCursor: { type: Boolean, default: false },
  hideQuestionDisplay: { type: Boolean, default: false },
})
const emit = defineEmits(['update'])

const titleText = computed(
  () =>
    props.displayedQuestion ||
    props.question.title ||
    props.question.question ||
    '',
)

const descriptionText = computed(
  () => props.displayedDescription || props.question.description || '',
)

const isSelected = (value) =>
  Array.isArray(props.answer) ? props.answer.includes(value) : false

const toggle = (value) => {
  const arr = Array.isArray(props.answer) ? [...props.answer] : []
  const idx = arr.indexOf(value)
  if (idx > -1) arr.splice(idx, 1)
  else arr.push(value)
  emit('update', arr)
}
</script>

<style scoped>
.chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #00a19a1a;
  background: #00a19a1a;
  font-size: 13px;
  cursor: pointer;
  color: #00a19a;
}

.chip.selected {
  background: #00a19a;
  color: white;
  border-color: #00a19a;
}
.question-title {
  font-size: 15px;
  font-weight: 500;
  color: #3c3c43;
  margin: 0 0 8px 0;
  letter-spacing: -0.23px;
  line-height: 1.5;
}

.question-description {
  font-size: 14px;
  color: #3c3c4399;
  margin: 0 0 12px 0;
  line-height: 1.4;
}
</style>
