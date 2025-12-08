<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600">{{ task.question }}</p>
    <div class="bg-white rounded-xl p-3 space-y-3">
      <label
        v-for="opt in task.options"
        :key="opt"
        class="flex items-center gap-3 p-2 border rounded-lg cursor-pointer"
      >
        <input type="radio" :value="opt" v-model="selected" />
        <span>{{ opt }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ task: Object, modelValue: null })
const emit = defineEmits(['update:modelValue'])
const selected = ref(props.modelValue || null)

watch(selected, (v) => emit('update:modelValue', v))
</script>
