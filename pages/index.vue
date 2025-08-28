<template>
  <div class="mobile-container welcome-page">
    <video autoplay muted loop playsinline class="welcome-page__video">
      <source src="/public/welcome.mp4" type="video/mp4" />
    </video>

    <!-- Main Content -->
    <div class="welcome-page__content">
      <!-- Logo -->
      <div class="welcome-page__logo">
        <OPIcon name="logo" class="w-16 h-16" />
      </div>

      <!-- Welcome Text -->
      <h1 class="welcome-page__title">Welcome to UmovingU</h1>
      <p class="welcome-page__subtitle">Powered by Open Property</p>
    </div>

    <!-- Bottom Section -->
    <div class="welcome-page__actions">
      <!-- Begin Journey Button -->
      <button @click="beginJourney" class="welcome-page__button">
        Begin your journey
      </button>
    </div>
  </div>

</template>

<script setup>
import OPIcon from '@/components/OPIcon.vue'
import { navigateTo } from 'nuxt/app';

const beginJourney = () => {
  navigateTo('/onboarding')
}

</script>

<style scoped>
.welcome-page {
  @apply bg-black text-white flex flex-col relative z-10;
  background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);

  &__video {
    @apply absolute w-full h-full object-cover z-0;
  }

  &__content {
    @apply z-10 flex flex-col items-center justify-center pt-28 text-white;
  }

  &__logo {
    @apply mb-2;
  }

  &__title {
    @apply text-[28px] font-bold mb-1;
  }

  &__subtitle {
    @apply text-[13px] opacity-50;
  }

  &__actions {
    @apply fixed bottom-0 max-w-md w-full px-7 pb-6;
  }

  &__button {
    @apply w-full h-14 bg-brand-aqua hover:bg-brand-aqua/90 rounded-xl transition-colors shadow-lg;
    @apply text-white text-[17px];
  }
}
</style>
