<template>
  <UButton
    @click="handleBack"
    variant="ghost"
    class="text-white flex items-center space-x-1 px-0 hover:bg-transparent back_button"
  >
    <Icon name="i-heroicons-chevron-left" class="w-6 h-6" />
    <span class="text-base font-medium">Back</span>
  </UButton>
</template>

<script setup>
const emit = defineEmits(['back'])

function handleBack() {
  // Emit event if parent wants to handle, otherwise use router
  emit('back')
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
  }
}
</script>
