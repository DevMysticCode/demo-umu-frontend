<template>
  <UButton
    @click="handleBack"
    variant="ghost"
    :class="[
      'flex items-center space-x-1 px-0 hover:bg-transparent back_button',
      customClass,
    ]"
  >
    <Icon name="i-heroicons-chevron-left" class="w-6 h-6" />
    <span class="text-base font-medium">Back</span>
  </UButton>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const emit = defineEmits(['back'])

const props = defineProps({
  customClass: {
    type: String,
    default: 'text-white', // default stays text-white
  },
})

function handleBack() {
  // Emit event if parent wants to handle, otherwise use router
  emit('back')
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
  }
}
</script>
