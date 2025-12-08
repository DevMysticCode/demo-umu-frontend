<template>
  <div>
    <p class="text-sm text-gray-600">{{ task.question }}</p>
    <textarea
      v-model="text"
      class="w-full p-3 rounded-lg border mt-2"
      rows="6"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ task: Object, modelValue: '' })
const emit = defineEmits(['update:modelValue'])
const text = ref(props.modelValue || '')
watch(text, (v) => emit('update:modelValue', v))
</script>
