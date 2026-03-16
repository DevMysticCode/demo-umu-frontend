<template>
  <div class="mobile-container backgound-image content">
    <BackButton />
    <!-- Logo and Welcome -->
    <div class="logo-and-welcome">
      <OPIcon name="logo" class="w-16 h-16" />
      <h1>Welcome to UmovingU, it’s great to have you back!</h1>
      <h5 class="text-white mt-2">Log in using Social</h5>
    </div>

    <div class="login-options">
      <div class="social-logins">
        <button
          class="social-logins__button"
          @click="handleAppleLogin"
        >
          <OPIcon name="appleNew" class="w-[20px] h-[20px]" />
          <span v-if="isDev" class="absolute -top-1.5 -right-1.5 text-[9px] bg-yellow-400 text-black rounded px-1 font-bold leading-tight">DEV</span>
        </button>

        <button class="social-logins__button social-logins__button--google">
          <OPIcon name="googleNew" class="w-[20px] h-[20px]" />
          <div id="google-btn-overlay"></div>
        </button>

        <button
          class="social-logins__button"
          @click="handleSocialLogin('facebook')"
        >
          <OPIcon name="facebookNew" class="w-[20px] h-[20px]" />
        </button>
      </div>

      <!-- Email Form -->
      <form class="email-form" @submit.prevent="handleLogin">
        <!-- Divider -->
        <div class="email-form__divider">
          <div class="flex-1 h-px bg-white/80"></div>
          <span class="text-white/80 text-sm"
            >or login with email and password</span
          >
          <div class="flex-1 h-px bg-white/80"></div>
        </div>

        <input
          v-model="emailInput"
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
        />

        <input
          v-model="passwordInput"
          type="password"
          name="password"
          required
          placeholder="your password"
          class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
        />

        <button class="email-form__button" type="submit">Continue</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import OPIcon from '~/components/ui/OPIcon.vue'
import BackButton from '~/components/core/BackButton.vue'

definePageMeta({
  title: 'Sign In - UmovingU',
})

const config = useRuntimeConfig()
const { login, googleLogin, appleLogin, appleLoginMock } = useAuth()
const isDev = process.dev

const emailInput = ref('')
const passwordInput = ref('')

const redirectAfterAuth = async () => {
  const redirectPath = localStorage.getItem('redirectAfterLogin')
  if (redirectPath) {
    localStorage.removeItem('redirectAfterLogin')
    await navigateTo(redirectPath)
  } else {
    await navigateTo('/dashboard')
  }
}

// ── Apple ─────────────────────────────────────────────────────────────────

const loadAppleSdk = () =>
  new Promise<void>((resolve) => {
    if (window.AppleID) { resolve(); return }
    const s = document.createElement('script')
    s.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    s.async = true
    s.onload = () => resolve()
    document.head.appendChild(s)
  })

const handleAppleLogin = async () => {
  // On localhost use the dev mock — no Apple SDK needed
  if (isDev) {
    try {
      const result: any = await appleLoginMock()
      localStorage.setItem('token', result.token)
      await redirectAfterAuth()
    } catch (err) {
      console.error('Apple mock error', err)
      alert('Apple mock sign-in failed.')
    }
    return
  }

  try {
    await loadAppleSdk()
    window.AppleID.auth.init({
      clientId: config.public.appleClientId,
      scope: 'name email',
      redirectURI: config.public.appleRedirectUri,
      usePopup: true,
    })
    const data = await window.AppleID.auth.signIn()
    const idToken: string = data.authorization.id_token
    const firstName: string | undefined = data.user?.name?.firstName
    const lastName: string | undefined = data.user?.name?.lastName
    const result: any = await appleLogin(idToken, firstName, lastName)
    localStorage.setItem('token', result.token)
    await redirectAfterAuth()
  } catch (err: any) {
    if (err?.error === 'popup_closed_by_user') return
    console.error('Apple sign-in error', err)
    alert('Apple sign-in failed. Please try again.')
  }
}

// ── Google ────────────────────────────────────────────────────────────────

const handleGoogleCredential = async (response) => {
  try {
    const result: any = await googleLogin(response.credential)
    localStorage.setItem('token', result.token)
    await redirectAfterAuth()
  } catch (err) {
    console.error(err)
    alert('Google sign-in failed. Please try again.')
  }
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
    window.google.accounts.id.initialize({
      client_id: config.public.googleClientId,
      callback: handleGoogleCredential,
      use_fedcm_for_prompt: false,
    })
    window.google.accounts.id.renderButton(
      document.getElementById('google-btn-overlay'),
      { theme: 'outline', size: 'large', width: '100%' },
    )
  }
  document.head.appendChild(script)
})

// ── Email/password ────────────────────────────────────────────────────────

const handleLogin = async () => {
  try {
    const response: any = await login(emailInput.value, passwordInput.value)
    localStorage.setItem('token', response.token)
    await redirectAfterAuth()
  } catch (err) {
    console.error(err)
    alert('Invalid email or password')
  }
}
</script>

<style scoped>
.content {
  @apply pt-6 px-4;
  @apply flex flex-col;
  @apply min-h-dvh;
}

.logo-and-welcome {
  @apply mt-3;
  h1 {
    @apply text-[34px] font-bold text-white;
  }
}

.login-options {
  @apply flex flex-col h-full mb-6 flex-1 relative;
}

.social-logins {
  @apply flex items-center justify-center gap-2 mt-4;

  &__button {
    @apply flex items-center justify-center gap-2;
    @apply w-full h-[50px] rounded-xl shadow-lg transition-colors;
    @apply bg-white;
    @apply text-black text-[17px];

    &--google {
      @apply relative overflow-hidden;
    }
  }
}

#google-btn-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.001;
  overflow: hidden;

  :deep(iframe) {
    width: 100% !important;
    height: 100% !important;
  }
}

.email-form {
  @apply space-y-4;

  &__button {
    @apply flex items-center justify-center;
    @apply w-full h-[50px] rounded-xl shadow-lg transition-colors;
    @apply bg-brand-aqua;
    @apply text-white text-[17px] absolute bottom-0;
  }

  &__divider {
    @apply flex items-center space-x-4 mb-4 mt-6;
  }
}
</style>
