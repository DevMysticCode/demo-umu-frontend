<template>
  <div class="mobile-container backgound-image content">
    <BackButton />
    <!-- Logo and Welcome -->
    <div class="logo-and-welcome">
      <OPIcon name="logo" class="w-16 h-16" />
      <h1>Welcome to UmovingU. Your journey starts here.</h1>
      <h5 class="text-white mt-2">Sign up using Social</h5>
    </div>

    <div class="login-options">
      <div class="social-logins">
        <button
          class="social-logins__button relative"
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
      <form class="email-form" @submit.prevent="handleEmailContinue">
        <!-- Divider -->
        <div class="email-form__divider">
          <div class="flex-1 h-px bg-white/80"></div>
          <span class="text-white/80 text-sm">or enter your email below</span>
          <div class="flex-1 h-px bg-white/80"></div>
        </div>

        <div class="relative">
          <input
            v-model="emailInput"
            type="email"
            name="email"
            required
            placeholder="your@email.com"
            :class="[
              'w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 transition-all',
              emailError ? 'ring-2 ring-red-400' : 'focus:ring-brand-aqua',
            ]"
            @input="emailError = ''"
          />
        </div>

        <!-- Inline error -->
        <div v-if="emailError" class="email-form__error">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ emailError }}</span>
          <NuxtLink to="/onboarding/signin" class="email-form__error-link">Sign in instead →</NuxtLink>
        </div>

        <button class="email-form__button" type="submit" :disabled="isChecking">
          {{ isChecking ? 'Checking...' : 'Continue' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSession } from '~/composables/useSession'
import { getDtaFromSubmitEvent } from '~/utils/form-helpres'
import OPIcon from '~/components/ui/OPIcon.vue'
import BackButton from '~/components/core/BackButton.vue'

definePageMeta({
  title: 'Sign Up - UmovingU',
})

const config = useRuntimeConfig()
const { requestOtp, googleLogin, appleLogin, appleLoginMock } = useAuth()
const isDev = process.dev
const { email } = useSession()

const emailInput = ref('')
const emailError = ref('')
const isChecking = ref(false)

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
  if (isDev) {
    try {
      const result: any = await appleLoginMock()
      localStorage.setItem('token', result.token)
      await navigateTo('/dashboard')
    } catch (err) {
      console.error('Apple mock error', err)
      alert('Apple mock sign-up failed.')
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
    await navigateTo('/dashboard')
  } catch (err: any) {
    if (err?.error === 'popup_closed_by_user') return
    console.error('Apple sign-up error', err)
    alert('Apple sign-up failed. Please try again.')
  }
}

// ── Google ────────────────────────────────────────────────────────────────

const handleGoogleCredential = async (response) => {
  try {
    const result: any = await googleLogin(response.credential)
    localStorage.setItem('token', result.token)
    await navigateTo('/dashboard')
  } catch (err) {
    console.error(err)
    alert('Google sign-up failed. Please try again.')
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

const handleEmailContinue = async (event) => {
  event.preventDefault()
  event.stopPropagation()
  emailError.value = ''
  isChecking.value = true

  try {
    // 1. Check if this email already has an account
    const { exists } = await $fetch<{ exists: boolean }>(
      `${config.public.apiBase}/auth/check-email`,
      { method: 'POST', body: { email: emailInput.value } },
    )

    if (exists) {
      emailError.value = 'An account with this email already exists.'
      return
    }

    // 2. Send OTP
    await requestOtp(emailInput.value)
    email.value = emailInput.value
    await navigateTo('/onboarding/verification')
  } catch (err: any) {
    emailError.value = err?.data?.message || 'Something went wrong. Please try again.'
  } finally {
    isChecking.value = false
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
    @apply bg-brand-aqua disabled:opacity-60;
    @apply text-white text-[17px] absolute bottom-0;
  }

  &__error {
    @apply flex items-start gap-2 text-red-200 text-[13px] leading-snug mt-1;
  }

  &__error-link {
    @apply text-white underline font-semibold whitespace-nowrap ml-1;
  }

  &__divider {
    @apply flex items-center space-x-4 mb-4 mt-6;
  }
}
</style>
