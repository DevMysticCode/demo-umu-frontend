<template>
  <div class="address-question">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>

    <div class="address-input">
      <input
        :placeholder="question.placeholder || 'Start typing address...'"
        v-model="text"
        @input="onInput"
        class="text-field"
      />
      <button class="btn" @click="$emit('update', text)">Find URN</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: String, default: '' },
})
const emit = defineEmits(['update'])
const text = ref(props.answer || '')
watch(
  () => props.answer,
  (v) => (text.value = v || ''),
)
const onInput = () => emit('update', text.value)
</script>

<style scoped>
.address-input {
  display: flex;
  gap: 8px;
  align-items: center;
}
.text-field {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.btn {
  padding: 8px 12px;
  border-radius: 8px;
  background: #00b8a9;
  color: white;
  border: none;
}
.section-title {
  font-size: 15px;
  margin-bottom: 8px;
  color: #111;
}
</style>
