<template>
  <div class="mobile-container thankyou-page">
    <video autoplay muted loop playsinline class="thankyou-page__video">
      <source src="/public/thankyou.mp4" type="video/mp4" />
    </video>

    <!-- Overlay -->
    <div class="thankyou-page__overlay"></div>

    <div class="thankyou-page__content">
      <!-- Logo -->
      <div class="thankyou-page__logo">
        <OPIcon name="logo" class="w-24 h-24" />
      </div>

      <!-- Main Text -->
      <div class="thankyou-page__text">
        <h1 class="thankyou-page__title">Welcome to UmovingU.</h1>
        <div class="thankyou-page__description">
          <p>Congratulations — you’re officially part of the UMU community!</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="thankyou-page__actions">
        <button
          @click="continueToQuestionnaire"
          class="thankyou-page__button-primary"
        >
          Start Exploring
        </button>

        <button @click="skipToApp" class="thankyou-page__button-secondary">
          Tell us more about your search
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import OPIcon from '@/components/OPIcon.vue'
import BackButton from '@/components/BackButton.vue'
import { navigateTo } from '#app'

definePageMeta({
  title: 'Thank You - UmovingU',
})

const continueToQuestionnaire = () => {
  return navigateTo('/onboarding/questionnaire/1')
}

const skipToApp = () => {
  return navigateTo('/dashboard')
}
</script>

<style scoped>
.thankyou-page {
  @apply min-h-screen bg-black text-white flex flex-col relative;

  &__video {
    @apply absolute w-full h-full object-cover z-0;
  }

  &__overlay {
    @apply absolute w-full h-full bg-black opacity-50;
  }

  &__content {
    @apply z-10 flex flex-col items-center justify-start min-h-screen text-center relative;
    padding-top: 18px;
    padding-bottom: 32px;
  }

  &__header {
    @apply w-full px-6;
    position: absolute;
    top: 20px;
    left: 0;
  }

  &__logo {
    @apply w-24 h-20 mb-8 flex items-center justify-center relative mt-8;
  }

  &__text {
    @apply space-y-4 mb-12 px-6;
  }

  &__title {
    @apply text-28-emphasized text-white leading-tight;
  }

  &__description {
    @apply space-y-2;
  }

  &__description p {
    @apply text-[20px] text-white;
  }

  &__actions {
    @apply w-full space-y-4 px-6 absolute bottom-8;
  }

  &__button-primary {
    @apply w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white rounded-xl transition-colors;
  }

  &__button-secondary {
    @apply w-full h-12 bg-white hover:bg-white/30 text-brand-aqua rounded-xl transition-colors backdrop-blur-sm;
  }
}
</style>
