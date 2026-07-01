// Production config requires real env values for keys/IDs that used to
// have hardcoded literals here (DF4 audit Finding §5 hygiene). In dev
// we keep the literals as a no-setup-required fallback; in production
// we never substitute, and we warn loudly at build time if a required
// var is missing so a deploy doesn't silently ship with empty config.

// CAPACITOR_BUILD=true forces SPA mode (no SSR, no Nitro server) so the
// build output can be bundled into the iOS/Android shells. Without this
// the default is SSR/universal — good for web, won't bundle for native.
// `npm run build:capacitor` sets this; manual builds need not touch it.
const IS_CAPACITOR_BUILD = process.env.CAPACITOR_BUILD === 'true'
const IS_PROD = process.env.NODE_ENV === 'production'

function devOnly(envValue: string | undefined, devFallback: string, name: string): string {
  if (envValue && envValue.trim()) return envValue
  // Capacitor bundled builds (TestFlight / Play Internal Testing) run
  // through `nuxt generate` which forces NODE_ENV=production — but
  // they're not user-facing prod, they're QA. Falling back to '' here
  // (the old behaviour) silently broke the Stripe card form in
  // TestFlight because every other code path treats stripeKey='' as
  // "Stripe not configured". Keep the dev fallback in Capacitor mode
  // so the test key keeps working; warn loudly only for real web
  // production builds where a leaked test key is the actual risk.
  if (IS_PROD && !IS_CAPACITOR_BUILD) {
    // eslint-disable-next-line no-console
    console.warn(`[nuxt.config] ${name} is unset in production — feature using it will be disabled.`)
    return ''
  }
  return devFallback
}

export default defineNuxtConfig({
  // SSR off for Capacitor: the native shells run the bundle from disk,
  // there's no Node server inside the WebView. Keep SSR on for the web
  // build so Vercel can pre-render.
  ssr: !IS_CAPACITOR_BUILD,
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'UmovingU - Your Property Toolkit',
      meta: [
        { charset: 'utf-8' },
        {
          // maximum-scale=1 + user-scalable=no fixes the iOS WebView
          // stuck-zoom bug: iOS auto-zooms on inputs whose font-size is
          // below 16px, and the "zoom back out" heuristic sometimes
          // fails, leaving the app horizontally-scrolling. Native apps
          // don't need pinch-zoom, so locking scale is standard for
          // Capacitor shells. Web builds get the same treatment for
          // consistency; VoiceOver + Dynamic Type still work.
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
        },
        {
          name: 'description',
          content:
            'Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.',
        },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
        { name: 'mobile-web-app-capable', content: 'yes' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    // No private keys live here — `apiSecret: '123'` was a dead
    // scaffold default never read by any code. Removed.
    public: {
      // apiBase: the only literal kept unconditionally — pointing at
      // localhost in prod is a clear "this build was misconfigured"
      // signal rather than a silent empty value.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3002',
      // Google + Apple OAuth removed — UMU uses email/password + OTP.
      // If social login is reintroduced, restore the devOnly() blocks
      // for googleClientId / appleClientId / appleRedirectUri and the
      // backend /auth/google + /auth/apple endpoints.
      stripeKey: devOnly(
        process.env.NUXT_PUBLIC_STRIPE_KEY,
        // Stripe TEST publishable key — safe to commit. Test mode
        // can only create test PaymentIntents, no real money moves.
        // Production sets NUXT_PUBLIC_STRIPE_KEY to a pk_live_* value.
        'pk_test_51RvzhKLR3oJsnvMf4gRG09EZsz4uX4VYt89aqLXTTAdFnphlHHVyfzHlkLyR6I5U0TSi8Su5H3gTaT0Yasza7t6K00h9dldDgB',
        'NUXT_PUBLIC_STRIPE_KEY',
      ),
      mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN || '',
      googleApiKey: process.env.NUXT_PUBLIC_GOOGLE_API_KEY || '',
      osApiKey: process.env.NUXT_PUBLIC_OS_API_KEY || '',
    },
  },
  components: true,
  // Strip console.* from production bundles. The dev server keeps them so
  // engineers can still see logs locally; only the prod build (and SSR
  // server build) is stripped. `debugger` is dropped too.
  vite: {
    esbuild: {
      drop:
        process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
  },
})
