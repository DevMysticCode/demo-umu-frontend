import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'io.umovingu.app',
  appName: 'UMovingU',
  webDir: '.output/public',
  server: {
    // Remove this line if you build locally instead of loading from Vercel
    url: 'https://demo-umu-frontend.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      // The native iOS launch storyboard always shows for the brief moment
      // between tap-to-launch and the WebView being ready. The Capacitor
      // splash plugin then keeps it on screen for `launchShowDuration` ms
      // (cushioning the gap between WebView ready and Vue first paint),
      // and our app.vue / nuxt root explicitly calls `SplashScreen.hide()`
      // once the bundle is hydrated. `launchAutoHide: false` is the safer
      // default — if the Vue side ever fails to hide, the timeout still
      // catches us.
      launchShowDuration: 2000,
      launchAutoHide: false,
      launchFadeOutDuration: 300,
      backgroundColor: '#231d45',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    // GoogleAuth block removed for the TestFlight build — the iosClientId
    // was still a placeholder. Add it back here once we have a real iOS
    // OAuth client ID from Google Cloud Console.
  },
}

export default config
