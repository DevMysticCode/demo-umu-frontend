<!-- components/ui/TaskFooter.vue -->
<template>
  <div class="fixed bottom-6 left-0 right-0 px-4 z-50 pointer-events-none">
    <div class="max-w-md mx-auto bg-transparent pointer-events-auto">
      <button
        @click="$emit('save')"
        class="w-full bg-brand-aqua text-white py-3 rounded-xl font-medium"
      >
        {{ primaryLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  primaryLabel: { type: String, default: 'Save and go to next question' },
})
const emit = defineEmits(['save'])
</script>
