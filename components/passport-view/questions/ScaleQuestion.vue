<template>
  <div class="scale-question">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>

    <div class="scale-wrap">
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        v-model.number="localValue"
        @input="emitValue"
      />
      <div class="scale-info">
        <span class="min">{{ min }}</span>
        <span class="value">{{ localValue }}</span>
        <span class="max">{{ max }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: [Number, String], default: 0 },
})
const emit = defineEmits(['update'])

const min = props.question.min ?? 0
const max = props.question.max ?? 10
const step = props.question.step ?? 1
const localValue = ref(Number(props.answer ?? min))

watch(
  () => props.answer,
  (v) => {
    localValue.value = Number(v ?? min)
  },
)

const emitValue = () => emit('update', localValue.value)
</script>

<style scoped>
.scale-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
input[type='range'] {
  width: 100%;
}
.scale-info {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 13px;
}
.section-title {
  font-size: 15px;
  margin-bottom: 8px;
  color: #111;
}
.value {
  font-weight: 700;
  color: #00a19a;
}
</style>
