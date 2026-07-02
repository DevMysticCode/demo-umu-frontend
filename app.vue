<template>
  <div class="app">
    <NuxtPage />
  </div>
</template>

<script setup>
import { Capacitor } from '@capacitor/core'

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

  // Configure native status bar so the safe-area colour matches the
  // page (light theme with dark status-bar icons) instead of showing
  // the app-wrapper background — the "black strip on top" symptom
  // reporters saw. Only imports the plugin on native platforms; web
  // is a no-op.
  const configureStatusBar = async () => {
    if (!Capacitor.isNativePlatform()) return
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      // Style.Light = light background, dark icons (matches our
      // white-topped explore / home / passport surfaces). If we
      // introduce a dark-hero page later, we can flip per route.
      await StatusBar.setStyle({ style: Style.Light })
      // Overlay=false: the WebView starts BELOW the status bar so
      // safe-area-inset-top is 0 and the app's background colour
      // fills the notch/Dynamic Island cleanly.
      await StatusBar.setOverlaysWebView({ overlay: false })
      await StatusBar.setBackgroundColor({ color: '#ffffff' })
    } catch (err) {
      console.warn('[status-bar] configuration skipped:', err)
    }
  }

  onMounted(() => {
    void register()
    void configureStatusBar()
  })
}
</script>
<style scoped>
.app {
  /* White base so any safe-area padding blends with the pages under
     it. Individual pages that need a dark hero can layer their own
     background on top. The bg-black default was what produced the
     black strip above the notch. */
  @apply min-h-dvh bg-white flex items-center justify-center overflow-x-hidden;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
</style>
