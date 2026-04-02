<template>
  <div class="hs-question-card">
    <div class="hs-category">
      <span class="hs-category-dot" :style="{ background: categoryColor }"></span>
      {{ question.category }}
    </div>
    <h2 class="hs-question-text">{{ question.question }}</h2>
    <div class="hs-options">
      <button
        v-for="opt in question.options"
        :key="opt.value"
        class="hs-option"
        :class="{ 'hs-option--selected': modelValue === opt.value }"
        @click="$emit('update:modelValue', opt.value)"
      >
        <span class="hs-option-radio">
          <span v-if="modelValue === opt.value" class="hs-option-radio-dot"></span>
        </span>
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '~/types/homescore'

const props = defineProps<{
  question: Question
  modelValue: string | undefined
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()

const PILLAR_COLORS: Record<string, string> = {
  heating: '#ef4444',
  structure: '#f59e0b',
  efficiency: '#22c55e',
  electrics: '#3b82f6',
  plumbing: '#8b5cf6',
}
const categoryColor = computed(() => PILLAR_COLORS[props.question.pillar] ?? '#00a19a')
</script>

<style scoped>
.hs-question-card {
  padding: 0 0 16px;
}
.hs-category {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 12px;
}
.hs-category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.hs-question-text {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.35;
  margin-bottom: 20px;
}
.hs-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hs-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid #e8e8ee;
  background: #fff;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}
.hs-option--selected {
  border-color: #00a19a;
  background: #f0fafa;
  color: #00a19a;
  font-weight: 600;
}
.hs-option-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s;
}
.hs-option--selected .hs-option-radio {
  border-color: #00a19a;
}
.hs-option-radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #00a19a;
}
</style>
