<template>
  <div class="mobile-container welcome-page">
    <video autoplay muted loop playsinline class="absolute w-full h-full object-cover z-0">
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
    <div class="welcome-page__bottom">
      <!-- Begin Journey Button -->
      <button @click="beginJourney" class="w-100 welcome-page__button">
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
}

/* Main Content */
.welcome-page__content {
  @apply z-10 flex flex-col items-center justify-center pt-28 text-white;
}

/* Logo */
.welcome-page__logo {
  @apply mb-2;
}

/* Text */
.welcome-page__title {
  @apply text-[28px] font-bold mb-1;
}

.welcome-page__subtitle {
  @apply text-[13px] opacity-50;
}

/* Bottom Section */
.welcome-page__bottom {
@apply fixed bottom-0 max-w-md w-full px-7 pb-6;
}

/* Begin Journey Button */
.welcome-page__button {
  @apply w-full h-14 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-semibold text-lg rounded-xl transition-colors shadow-lg;
}

</style>
