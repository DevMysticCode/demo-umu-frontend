<template>
  <div class="welcome-page">
    <video
      autoplay
      muted
      loop
      playsinline
      class="absolute inset-0 w-full h-full object-cover z-0"
    >
      <source src="/public/welcome.mp4" type="video/mp4" />
    </video>
    <div class="absolute inset-0 bg-black/40 z-1"></div>

    <div class="relative z-10">
      <div
        class="pt-6 pb-6 px-6 flex flex-col items-center justify-center min-h-screen text-center"
      >
        <!-- Main Content -->
        <div class="welcome-page__content">
          <!-- Logo -->
          <div class="welcome-page__logo">
            <div class="welcome-page__logo-icon">
              <img src="/public/logo_new.svg" alt="Logo" class="w-16 h-16" />
            </div>
          </div>

          <!-- Welcome Text -->
          <div class="welcome-page__text">
            <h1 class="welcome-page__title">Welcome to UmovingU</h1>
            <p class="welcome-page__subtitle">Powered by Open Property</p>
          </div>
        </div>

        <!-- Bottom Section -->
        <div class="welcome-page__bottom">
          <!-- Begin Journey Button -->
          <button @click="beginJourney" class="w-100 welcome-page__button">
            Begin your journey
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  'begin-journey': []
}>()

const beginJourney = () => {
  emit('begin-journey')
}
</script>

<style scoped>
/* Welcome Page */
.welcome-page {
  @apply min-h-screen bg-black text-white flex flex-col relative overflow-hidden;
  background: linear-gradient(180deg, #000000 0%, #1a1a1a 100%);
}

/* Status Bar */
.welcome-page__status-bar {
  @apply flex justify-between items-center px-6 pt-3 pb-2 text-white text-sm font-medium;
}

.welcome-page__time {
  @apply font-semibold;
}

.welcome-page__indicators {
  @apply flex items-center space-x-1;
}

.welcome-page__signal,
.welcome-page__wifi,
.welcome-page__battery {
  @apply text-xs;
}

/* Main Content */
.welcome-page__content {
  @apply flex-1 flex flex-col items-center justify-center px-6;
}

/* Logo */
.welcome-page__logo {
  @apply mb-12;
}

.welcome-page__logo-icon {
  @apply w-16 h-16 flex items-center justify-center;
}

/* Text */
.welcome-page__text {
  @apply text-center;
}

.welcome-page__title {
  @apply text-3xl font-bold text-white mb-3 leading-tight;
}

.welcome-page__subtitle {
  @apply text-base text-white/70 font-medium;
}

/* Bottom Section */
.welcome-page__bottom {
  @apply px-6 pb-8 w-full absolute bottom-0;
}

/* Begin Journey Button */
.welcome-page__button {
  @apply w-full h-14 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-semibold text-lg rounded-xl transition-colors shadow-lg;
}

/* Home Indicator */
.welcome-page__home-indicator {
  @apply w-32 h-1 bg-white/30 rounded-full mx-auto;
}

/* Mobile Container Override */
.welcome-page {
  max-width: 428px;
  margin: 0 auto;
  position: relative;
}

/* Add subtle texture overlay */
.welcome-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.5" fill="rgba(255,255,255,0.03)"/><circle cx="80" cy="40" r="0.5" fill="rgba(255,255,255,0.02)"/><circle cx="40" cy="80" r="0.5" fill="rgba(255,255,255,0.04)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
  z-index: 1;
}

.welcome-page__content,
.welcome-page__bottom {
  position: relative;
  z-index: 2;
}
</style>
