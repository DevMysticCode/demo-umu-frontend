<template>
  <div class="app">
    <NuxtPage />
  </div>
</template>

<script setup>
// SplashScreen disabled across the app per request.
// Component file kept at ~/components/core/SplashScreen.vue if it needs to
// be re-enabled later — just re-add the import and <SplashScreen /> tag.

// Global app configuration
useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

// Native push notifications — only fires on Capacitor (iOS/Android);
// no-ops on the web build. The composable defers backend registration
// until a JWT exists in localStorage, so calling it pre-login is safe.
if (process.client) {
  const { register } = usePushNotifications()
  onMounted(() => { void register() })
}
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