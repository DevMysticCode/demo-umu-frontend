<template>
  <div class="app">
    <NuxtPage />
  </div>
</template>

<script setup>
import { Capacitor } from '@capacitor/core'
import { useRouter } from 'vue-router'

// Global app configuration
useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

// Native push notifications — only fires on Capacitor (iOS/Android);
// no-ops on the web build. The composable defers backend registration
// until a JWT exists in localStorage, so calling it pre-login is safe.
if (import.meta.client) {
  const { register } = usePushNotifications()
  const router = useRouter()

  // Hardware/gesture back button on Android (and the equivalent swipe
  // gesture on Android 13+ predictive-back) defaults to Capacitor's
  // WebView.canGoBack() — which quits/minimises the app far too
  // eagerly in an SPA. `history.state.back` is Vue Router's own record
  // of whether there's a previous entry in ITS managed stack (set on
  // every push/replace), so it reflects in-app navigation depth
  // correctly regardless of WebView history quirks. Only exit the app
  // once we're genuinely at a root screen with nothing behind it.
  const configureBackButton = async () => {
    if (!Capacitor.isNativePlatform()) return
    try {
      const { App: CapacitorApp } = await import('@capacitor/app')
      CapacitorApp.addListener('backButton', () => {
        if (window.history.state?.back) {
          router.back()
        } else {
          void CapacitorApp.exitApp()
        }
      })
    } catch (err) {
      console.warn('[back-button] listener setup skipped:', err)
    }
  }

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
    void configureBackButton()
  })
}
</script>
<style scoped>
.app {
  /* Full-width block wrapper. The child pages carry .mobile-container
     with `max-w-md mx-auto` so they centre themselves — the previous
     `flex items-center justify-center` layered a second centring on
     top and on Capacitor's initial paint could shrink the child to
     its intrinsic width before Tailwind's `w-full` applied, giving
     the "Good afternoon,\nPradeep" word-wrap symptom testers saw on
     first open of Explore. Block layout + mx-auto is the standard
     pattern for a mobile-shell root and behaves consistently across
     iOS/Android/web. */
  @apply min-h-dvh bg-white overflow-x-hidden;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
</style>
