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
    GoogleAuth: {
      // iOS Client ID from Google Cloud Console (Credentials → iOS OAuth client)
      iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
      // Web Client ID (same one you use on the web)
      clientId: '869780740735-rlucf6t174rb3dljniqfj3ri2r0kg9cj.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      serverClientId: '869780740735-rlucf6t174rb3dljniqfj3ri2r0kg9cj.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
}

export default config
