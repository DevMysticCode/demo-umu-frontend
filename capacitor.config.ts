import type { CapacitorConfig } from '@capacitor/cli'

// ──────────────────────────────────────────────────────────────────────
// REMOTE vs BUNDLED mode — important for App Store submission.
//
// Current TestFlight build runs in REMOTE mode (`server.url` set
// below). The iOS shell opens a WKWebView pointed at the Vercel
// deployment. This works for internal testing but Apple may flag it
// on full review as "minimum functionality" (Guideline 4.2 / thin
// webview wrapper).
//
// BUNDLED mode (the App Store path) drops `server.url` so the shell
// loads its assets from disk (`webDir`). Switch by:
//   1. Set CAPACITOR_BUILD=true → nuxt builds SPA (no SSR/Nitro).
//   2. Either delete `server.url` here, OR set CAPACITOR_USE_REMOTE=false
//      in the env to toggle below.
//   3. Run `npm run mobile:build:bundled` then open Xcode and submit.
//
// Auth + API calls already use absolute `config.public.apiBase`
// URLs, so they keep working from the bundled shell without code
// changes — only relative-URL link `<a href="/foo">` clicks would
// behave differently (they navigate the bundled SPA, which is fine).
// ──────────────────────────────────────────────────────────────────────
const USE_REMOTE = process.env.CAPACITOR_USE_REMOTE !== 'false'

const config: CapacitorConfig = {
  appId: 'io.umovingu.app',
  appName: 'UMovingU',
  webDir: '.output/public',
  ...(USE_REMOTE
    ? {
        server: {
          url: 'https://demo-umu-frontend.vercel.app',
          cleartext: false,
        },
      }
    : {}),
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
    // GoogleAuth + Apple Sign In native plugins were removed when we
    // dropped social auth. Email/password + OTP is the only login.
  },
}

export default config
