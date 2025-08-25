export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: [
    '~/assets/css/main.css',
    'vue3-tel-input/dist/vue3-tel-input.css',
    '~/assets/css/components.css',
    '~/assets/css/questionnaire.css',
  ],
  app: {
    head: {
      title: 'UmovingU - Your Property Toolkit',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
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
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700&display=swap',
        },
      ],
    },
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    apiSecret: '123',
    // Public keys (exposed to client-side)
    public: {
      apiBase: '/api',
    },
  },
  components: true,
})
