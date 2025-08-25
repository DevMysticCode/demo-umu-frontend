<template>
  <div class="question-content">
    <!-- Question Number -->
    <div class="question-content__number">
      Question {{ currentQuestion }}{{ selectedAnswer ? ' - Filled' : '' }}
    </div>

    <!-- Question Title -->
    <h1 class="question-content__title">
      {{ questionData.title }}
    </h1>

    <!-- Question Subtitle -->
    <p v-if="questionData.subtitle" class="question-content__subtitle">
      {{ questionData.subtitle }}
    </p>

    <slot />
  </div>
</template>

<script setup>
defineProps({
  currentQuestion: {
    type: Number,
    required: true,
  },
  questionData: {
    type: Object,
    required: true,
  },
  selectedAnswer: {
    type: String,
    default: null,
  },
})
</script>
