<!-- components/ui/ProgressBar.vue -->
<template>
  <div class="w-full">
    <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
      <div :style="{ width: value + '%' }" class="h-2 bg-brand-aqua"></div>
    </div>
    <div v-if="label" class="text-xs text-gray-500 mt-1">{{ label }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  value: { type: Number, default: 0 },
  label: { type: String, default: '' },
})
</script>
