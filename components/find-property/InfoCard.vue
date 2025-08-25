<template>
  <div class="info-card" :class="{ 'info-card--highlighted': isHighlighted }">
    <div class="info-card__content">
      <slot />
    </div>

    <div class="info-card__navigation">
      <div class="info-card__step">{{ currentStep }} of {{ totalSteps }}</div>

      <div class="info-card__buttons">
        <button
          v-if="showPrev"
          @click="$emit('prev')"
          :disabled="!canGoPrev"
          class="info-card__button info-card__button--prev"
        >
          <span>←</span>
          <span>Prev</span>
        </button>

        <button
          v-if="showNext"
          @click="$emit('next')"
          :disabled="!canGoNext"
          class="info-card__button info-card__button--next"
        >
          <span>Next</span>
          <span>→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentStep: number
  totalSteps: number
  showPrev?: boolean
  showNext?: boolean
  canGoPrev?: boolean
  canGoNext?: boolean
  isHighlighted?: boolean
}

withDefaults(defineProps<Props>(), {
  showPrev: true,
  showNext: true,
  canGoPrev: true,
  canGoNext: true,
  isHighlighted: false,
})

defineEmits<{
  prev: []
  next: []
}>()
</script>

<style scoped>
.info-card {
  @apply bg-white rounded-xl p-6 shadow-sm border-2 border-transparent;
}

.info-card--highlighted {
  @apply border-brand-aqua;
}

.info-card__content {
  @apply text-gray-700 text-base leading-relaxed mb-6;
}

.info-card__navigation {
  @apply flex items-center justify-between;
}

.info-card__step {
  @apply text-sm text-gray-500;
}

.info-card__buttons {
  @apply flex space-x-3;
}

.info-card__button {
  @apply h-10 px-4 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2;
}

.info-card__button--prev {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200;
}

.info-card__button--next {
  @apply bg-brand-aqua text-white hover:bg-brand-aqua/90;
}

.info-card__button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
