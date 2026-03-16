<!-- ProgressBar.vue -->
<template>
  <div class="progress">
    <div 
      v-for="(segment, index) in segments" 
      :key="index"
      class="progress__segment"
      :class="{ 'progress__segment--filled': segment.filled }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  steps: number;
  currentStep: number;
}>();

const segments = computed(() => 
  Array.from({ length: props.steps }, (_, index) => ({
    filled: index <= props.currentStep,
  }))
);
</script>

<style scoped>
.progress {
  @apply flex items-center justify-center gap-1 px-4 pt-3;
}

.progress__segment {
  @apply h-1 bg-white/20 rounded-full overflow-hidden flex-1;
}

.progress__segment--filled {
  @apply bg-white;
}
</style>

