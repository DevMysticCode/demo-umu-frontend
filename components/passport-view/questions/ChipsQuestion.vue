<template>
  <div class="chips-question">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>

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
const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: Array, default: () => [] },
})
const emit = defineEmits(['update'])

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
  border: 1px solid #e6e6e6;
  background: #f7f7f7;
  font-size: 13px;
  cursor: pointer;
}
.chip.selected {
  background: #00b8a9;
  color: white;
  border-color: #00a19a;
}
.section-title {
  font-size: 15px;
  margin-bottom: 8px;
  color: #111;
}
</style>
