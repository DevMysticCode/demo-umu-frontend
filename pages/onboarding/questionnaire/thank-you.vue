<template>
  <div class="mobile-container thankyou-page">
    <video autoplay muted loop playsinline class="thankyou-page__video">
      <source src="/public/thankyou.mp4" type="video/mp4" />
    </video>

    <!-- Add this overlay div -->
    <div class="thankyou-page__overlay"></div>

    <div class="thankyou-page__content">
      <!-- Logo -->
      <div class="thankyou-page__logo">
        <OPIcon name="logo" class="w-24 h-20" />
      </div>

      <!-- Main Text -->
      <div class="thankyou-page__text">
        <h1 class="thankyou-page__title">
          Thank you for selecting your preferences!
        </h1>
        <p class="thankyou-page__subtitle">
          We’ll personalize your experience from here on out.
        </p>
      </div>
    </div>

    <div class="thankyou-page__actions">
      <button @click="continueToQuestionnaire" class="thankyou-page__button">
        Start Exploring
      </button>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Welcome - UmovingU',
})

const continueToQuestionnaire = () => {
  navigateTo('/onboarding/questionnaire/1')
}
</script>

<style scoped>
.thankyou-page {
  @apply min-h-screen bg-black text-white flex flex-col relative;

  &__video {
    @apply absolute w-full h-full object-cover z-0;
  }

  &__overlay {
    @apply absolute w-full h-full bg-black opacity-60;
  }

  &__content {
    @apply z-10 flex flex-col items-center justify-start pt-12 px-6 text-center;
    min-height: calc(100vh - 120px); /* Account for button area */
  }

  &__logo {
    @apply mb-8 flex items-center justify-center;
  }

  &__text {
    @apply space-y-4 mb-1;
  }

  &__title {
    @apply text-28-emphasized text-white leading-tight;
  }

  &__subtitle {
    @apply text-[20px] text-white;
  }

  &__actions {
    @apply fixed bottom-0 max-w-md w-full px-6 pb-6 z-10;
  }

  &__button {
    @apply w-full h-12 rounded-xl shadow-lg transition-colors;
    @apply bg-brand-aqua hover:bg-brand-aqua/90;
    @apply text-white backdrop-blur-sm;
  }
}
</style>
