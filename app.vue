<template>
  <div class="app">
    <SplashScreen />
    <NuxtPage />
  </div>
</template>

<script setup>
import SplashScreen from '~/components/core/SplashScreen.vue'

// Global app configuration
useHead({
  htmlAttrs: {
    lang: 'en'
  }
})
</script>
<style scoped>
.app {
  @apply min-h-dvh bg-black flex items-center justify-center overflow-x-hidden;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
</style>