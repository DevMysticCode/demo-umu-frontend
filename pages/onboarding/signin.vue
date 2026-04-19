<template>
  <div class="mobile-container backgound-image content">
    <BackButton v-if="resetStep === 'idle'" />
    <button
      v-else
      class="back-btn"
      @click="handleResetBack"
    >
      <Icon name="i-heroicons-arrow-left" class="w-5 h-5 text-white" />
    </button>

    <!-- Session / logout banner -->
    <div
      v-if="bannerMessage && resetStep === 'idle'"
      class="mx-4 mt-4 mb-2 rounded-2xl px-4 py-3 flex items-center gap-3"
      :class="bannerReason === 'logout' ? 'bg-brand-aqua/15 border border-brand-aqua/30' : 'bg-yellow-400/20 border border-yellow-400/40'"
    >
      <Icon
        :name="bannerReason === 'logout' ? 'i-heroicons-check-circle' : 'i-heroicons-lock-closed'"
        class="w-5 h-5 flex-shrink-0"
        :class="bannerReason === 'logout' ? 'text-brand-aqua' : 'text-yellow-500'"
      />
      <p class="font-sf-pro text-[13px] font-medium" :class="bannerReason === 'logout' ? 'text-brand-aqua' : 'text-yellow-700'">
        {{ bannerMessage }}
      </p>
    </div>

    <!-- ── Sign In ─────────────────────────────────────────────────────── -->
    <template v-if="resetStep === 'idle'">
      <div class="logo-and-welcome">
        <OPIcon name="logo" class="w-16 h-16" />
        <h1>Welcome to UmovingU, it's great to have you back!</h1>
        <h5 class="text-white mt-2">Log in using Social</h5>
      </div>

      <div class="login-options">
        <div class="social-logins">
          <button class="social-logins__button" @click="handleAppleLogin">
            <OPIcon name="appleNew" class="w-[20px] h-[20px]" />
            <span v-if="isDev" class="absolute -top-1.5 -right-1.5 text-[9px] bg-yellow-400 text-black rounded px-1 font-bold leading-tight">DEV</span>
          </button>

          <!-- Google button: our icon is visible; the GIS button sits on top (opacity near 0)
               and handles the redirect when tapped. ux_mode=redirect means no popup. -->
          <button class="social-logins__button social-logins__button--google">
            <OPIcon name="googleNew" class="w-[20px] h-[20px]" />
            <div id="google-gis-btn"></div>
          </button>

          <button class="social-logins__button" @click="handleSocialLogin('facebook')">
            <OPIcon name="facebookNew" class="w-[20px] h-[20px]" />
          </button>
        </div>

        <!-- Email Form -->
        <form class="email-form" @submit.prevent="handleLogin">
          <div class="email-form__divider">
            <div class="flex-1 h-px bg-white/80"></div>
            <span class="text-white/80 text-sm">or login with email and password</span>
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

          <!-- Forgot password link -->
          <div class="text-right -mt-2">
            <button
              type="button"
              class="text-white/70 text-sm underline underline-offset-2 hover:text-white transition-colors"
              @click="startForgotPassword"
            >
              Forgot password?
            </button>
          </div>

          <div v-if="loginError" class="rounded-xl bg-red-500/20 border border-red-400/40 px-4 py-3 text-red-200 text-sm">
            {{ loginError }}
          </div>

          <button class="email-form__button" type="submit" :disabled="loginLoading">
            <span v-if="loginLoading" class="flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Signing in…
            </span>
            <span v-else>Continue</span>
          </button>
        </form>
      </div>
    </template>

    <!-- ── Forgot Password: enter email ───────────────────────────────── -->
    <template v-else-if="resetStep === 'email'">
      <div class="reset-section">
        <div class="reset-icon">
          <Icon name="i-heroicons-lock-closed" class="w-8 h-8 text-brand-aqua" />
        </div>
        <h1 class="reset-title">Forgot password?</h1>
        <p class="reset-subtitle">Enter your email and we'll send you a reset code.</p>

        <form class="reset-form" @submit.prevent="handleForgotPassword">
          <input
            v-model="resetEmail"
            type="email"
            required
            placeholder="your@email.com"
            class="reset-input"
          />

          <div v-if="resetError" class="error-banner">{{ resetError }}</div>

          <button class="reset-btn" type="submit" :disabled="resetLoading">
            <span v-if="resetLoading" class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Sending…
            </span>
            <span v-else>Send reset code</span>
          </button>
        </form>
      </div>
    </template>

    <!-- ── Forgot Password: enter OTP ─────────────────────────────────── -->
    <template v-else-if="resetStep === 'otp'">
      <div class="reset-section">
        <div class="reset-icon">
          <Icon name="i-heroicons-envelope" class="w-8 h-8 text-brand-aqua" />
        </div>
        <h1 class="reset-title">Check your email</h1>
        <p class="reset-subtitle">
          We sent a 6-digit code to<br />
          <strong class="text-white">{{ resetEmail }}</strong>
        </p>

        <form class="reset-form" @submit.prevent="handleVerifyResetOtp">
          <!-- OTP boxes -->
          <div class="otp-boxes">
            <input
              v-for="(_, i) in otpDigits"
              :key="i"
              :ref="el => { if (el) otpRefs[i] = el as HTMLInputElement }"
              v-model="otpDigits[i]"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="otp-box"
              @input="onOtpInput(i)"
              @keydown.backspace="onOtpBackspace(i)"
              @paste.prevent="onOtpPaste($event)"
            />
          </div>

          <div v-if="resetError" class="error-banner">{{ resetError }}</div>

          <button class="reset-btn" type="submit" :disabled="resetLoading || otpValue.length < 6">
            <span v-if="resetLoading" class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Verifying…
            </span>
            <span v-else>Verify code</span>
          </button>

          <!-- Resend -->
          <div class="text-center mt-3">
            <button
              v-if="resendCountdown > 0"
              type="button"
              disabled
              class="text-white/40 text-sm"
            >
              Resend code in {{ resendCountdown }}s
            </button>
            <button
              v-else
              type="button"
              class="text-white/70 text-sm underline underline-offset-2 hover:text-white transition-colors"
              @click="handleForgotPassword"
            >
              Resend code
            </button>
          </div>
        </form>
      </div>
    </template>

    <!-- ── Forgot Password: set new password ──────────────────────────── -->
    <template v-else-if="resetStep === 'newPassword'">
      <div class="reset-section">
        <div class="reset-icon">
          <Icon name="i-heroicons-key" class="w-8 h-8 text-brand-aqua" />
        </div>
        <h1 class="reset-title">Set new password</h1>
        <p class="reset-subtitle">Choose a strong password for your account.</p>

        <form class="reset-form" @submit.prevent="handleResetPassword">
          <div class="relative">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              required
              placeholder="New password"
              class="reset-input pr-12"
            />
            <button
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showNewPassword = !showNewPassword"
            >
              <Icon :name="showNewPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-5 h-5" />
            </button>
          </div>

          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="Confirm new password"
              class="reset-input pr-12"
            />
            <button
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <Icon :name="showConfirmPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" class="w-5 h-5" />
            </button>
          </div>

          <!-- Password strength -->
          <div v-if="newPassword" class="space-y-1">
            <div class="flex gap-1">
              <div
                v-for="n in 4"
                :key="n"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="n <= passwordStrength ? strengthColor : 'bg-white/20'"
              ></div>
            </div>
            <p class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
          </div>

          <div v-if="resetError" class="error-banner">{{ resetError }}</div>

          <button
            class="reset-btn"
            type="submit"
            :disabled="resetLoading || !passwordsMatch"
          >
            <span v-if="resetLoading" class="flex items-center justify-center gap-2">
              <span class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Updating…
            </span>
            <span v-else>Update password</span>
          </button>
        </form>
      </div>
    </template>

    <!-- ── Forgot Password: success ───────────────────────────────────── -->
    <template v-else-if="resetStep === 'success'">
      <div class="reset-section items-center text-center">
        <div class="w-20 h-20 rounded-full bg-brand-aqua/20 border-2 border-brand-aqua flex items-center justify-center mb-6">
          <Icon name="i-heroicons-check" class="w-10 h-10 text-brand-aqua" />
        </div>
        <h1 class="reset-title">Password updated!</h1>
        <p class="reset-subtitle">Your password has been changed successfully. You can now sign in with your new password.</p>
        <button class="reset-btn mt-6" @click="resetStep = 'idle'">
          Back to sign in
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import OPIcon from '~/components/ui/OPIcon.vue'
import BackButton from '~/components/core/BackButton.vue'

definePageMeta({
  title: 'Sign In - UmovingU',
  middleware: 'guest',
})

const config = useRuntimeConfig()
const { login, appleLogin, googleLogin, appleLoginMock } = useAuth()
const { isNative, nativeAppleSignIn, nativeGoogleSignIn } = useNativeAuth()
const isDev = process.dev
const route = useRoute()

// Banner shown when redirected after logout or session expiry
const bannerReason = computed(() => route.query.reason as string | undefined)
const bannerMessage = computed(() => {
  if (bannerReason.value === 'logout') return 'You have been logged out successfully.'
  if (bannerReason.value === 'session') return 'Your session has expired. Please sign in again.'
  return ''
})

// ── Sign In ────────────────────────────────────────────────────────────────

const emailInput = ref('')
const passwordInput = ref('')
const loginError = ref('')
const loginLoading = ref(false)

const redirectAfterAuth = async () => {
  const redirectPath = localStorage.getItem('redirectAfterLogin')
  if (redirectPath) {
    localStorage.removeItem('redirectAfterLogin')
    await navigateTo(redirectPath)
  } else {
    await navigateTo('/dashboard')
  }
}

// ── Apple ──────────────────────────────────────────────────────────────────

const loadAppleSdk = () =>
  new Promise<void>((resolve) => {
    if ((window as any).AppleID) { resolve(); return }
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
      await redirectAfterAuth()
    } catch (err) {
      console.error('Apple mock error', err)
      alert('Apple mock sign-in failed.')
    }
    return
  }

  // Native Capacitor — use the iOS Sign In with Apple plugin
  if (await isNative()) {
    try {
      const { idToken, firstName, lastName } = await nativeAppleSignIn()
      const result: any = await appleLogin(idToken, firstName, lastName)
      localStorage.setItem('token', result.token)
      await redirectAfterAuth()
    } catch (err: any) {
      if (err?.code === 'AS_AUTHORIZATION_ERROR_CODE_CANCELED') return
      console.error('Native Apple sign-in error', err)
      alert('Apple sign-in failed. Please try again.')
    }
    return
  }

  try {
    await loadAppleSdk()

    // Popups are blocked in: standalone PWA, WKWebView (native app wrapper).
    // Detect all restricted environments and use redirect flow instead.
    const isWKWebView = !!(window as any).webkit?.messageHandlers
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      !!(navigator as any).standalone ||
      isWKWebView

    const appleAuth = (window as any).AppleID.auth
    appleAuth.init({
      clientId: config.public.appleClientId,
      scope: 'name email',
      redirectURI: config.public.appleRedirectUri,
      usePopup: !isStandalone,
    })

    if (!isStandalone) {
      // Popup flow — SDK resolves the promise directly
      const data = await appleAuth.signIn()
      const idToken: string = data.authorization.id_token
      const firstName: string | undefined = data.user?.name?.firstName
      const lastName: string | undefined = data.user?.name?.lastName
      const result: any = await appleLogin(idToken, firstName, lastName)
      localStorage.setItem('token', result.token)
      await redirectAfterAuth()
    }
    // Redirect flow: Apple will POST to redirectURI — handled by
    // /server/routes/auth/apple/callback.post.ts — no further action here.
  } catch (err: any) {
    if (err?.error === 'popup_closed_by_user') return
    console.error('Apple sign-in error', err)
    alert('Apple sign-in failed. Please try again.')
  }
}

// ── Google ─────────────────────────────────────────────────────────────────
// Uses ux_mode='redirect' so Google does a full-page redirect instead of
// opening a popup — works in iOS Safari, standalone PWA, and WKWebView.
// The GIS library POSTs the credential to /auth/google/gis-callback (Nuxt
// server route) which forwards it to the backend and redirects to /auth/google/callback.

let googleInitialised = false

const initGoogleGis = () => {
  const w = window as any
  if (googleInitialised || !w.google) return
  googleInitialised = true

  const loginUri = `${window.location.origin}/auth/google/gis-callback`

  // ux_mode: 'redirect' — button click does a full-page redirect instead of
  // opening a popup. Works in iOS Safari, standalone PWA mode, and WKWebViews.
  w.google.accounts.id.initialize({
    client_id: config.public.googleClientId as string,
    ux_mode: 'redirect',
    login_uri: loginUri,
    use_fedcm_for_prompt: false,
  })

  // Render GIS button into the overlay div. With ux_mode=redirect the GIS
  // button triggers a full redirect — no popup needed.
  const container = document.getElementById('google-gis-btn')
  if (container) {
    w.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: '100%',
    })
  }
}

const handleGoogleLogin = async () => {
  // Native Capacitor — uses Google Sign In SDK via SFSafariViewController (Google-approved)
  if (await isNative()) {
    try {
      const idToken = await nativeGoogleSignIn()
      const result: any = await googleLogin(idToken)
      localStorage.setItem('token', result.token)
      await redirectAfterAuth()
    } catch (err) {
      console.error('Native Google sign-in error', err)
      alert('Google sign-in failed. Please try again.')
    }
    return
  }

  // Web fallback — GIS redirect flow (works in Safari and PWA)
  const w = window as any
  if (!w.google) {
    alert('Google sign-in is not available yet. Please try again.')
    return
  }
  initGoogleGis()
  w.google.accounts.id.prompt()
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => initGoogleGis()
  document.head.appendChild(script)
})

// ── Email/password login ───────────────────────────────────────────────────

const handleLogin = async () => {
  loginError.value = ''
  loginLoading.value = true
  try {
    const response: any = await login(emailInput.value, passwordInput.value)
    localStorage.setItem('token', response.token)
    await redirectAfterAuth()
  } catch {
    loginError.value = 'Incorrect email or password. Please try again.'
  } finally {
    loginLoading.value = false
  }
}

// ── Password Reset ─────────────────────────────────────────────────────────

type ResetStep = 'idle' | 'email' | 'otp' | 'newPassword' | 'success'
const resetStep = ref<ResetStep>('idle')
const resetEmail = ref('')
const resetToken = ref('')
const resetError = ref('')
const resetLoading = ref(false)

// OTP boxes
const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const otpRefs = ref<HTMLInputElement[]>([])
const otpValue = computed(() => otpDigits.value.join(''))

const onOtpInput = (index: number) => {
  const val = otpDigits.value[index]
  if (val && index < 5) {
    otpRefs.value[index + 1]?.focus()
  }
}

const onOtpBackspace = (index: number) => {
  if (!otpDigits.value[index] && index > 0) {
    otpDigits.value[index - 1] = ''
    otpRefs.value[index - 1]?.focus()
  }
}

const onOtpPaste = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? ''
  text.split('').forEach((ch, i) => { otpDigits.value[i] = ch })
  otpRefs.value[Math.min(text.length, 5)]?.focus()
}

// Resend countdown
const resendCountdown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

const startResendCountdown = () => {
  resendCountdown.value = 60
  resendTimer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0 && resendTimer) {
      clearInterval(resendTimer)
      resendTimer = null
    }
  }, 1000)
}

// New password fields
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordsMatch = computed(
  () => newPassword.value.length >= 8 && newPassword.value === confirmPassword.value,
)

const passwordStrength = computed(() => {
  const p = newPassword.value
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  if (passwordStrength.value <= 1) return 'bg-red-400'
  if (passwordStrength.value === 2) return 'bg-yellow-400'
  if (passwordStrength.value === 3) return 'bg-blue-400'
  return 'bg-green-400'
})

const strengthTextColor = computed(() => {
  if (passwordStrength.value <= 1) return 'text-red-300'
  if (passwordStrength.value === 2) return 'text-yellow-300'
  if (passwordStrength.value === 3) return 'text-blue-300'
  return 'text-green-300'
})

const strengthLabel = computed(() => {
  if (passwordStrength.value <= 1) return 'Weak'
  if (passwordStrength.value === 2) return 'Fair'
  if (passwordStrength.value === 3) return 'Good'
  return 'Strong'
})

const startForgotPassword = () => {
  resetEmail.value = emailInput.value
  resetError.value = ''
  resetStep.value = 'email'
}

const handleResetBack = () => {
  resetError.value = ''
  if (resetStep.value === 'email') resetStep.value = 'idle'
  else if (resetStep.value === 'otp') resetStep.value = 'email'
  else if (resetStep.value === 'newPassword') resetStep.value = 'otp'
  else resetStep.value = 'idle'
}

const apiBase = computed(() => useRuntimeConfig().public.apiBase as string)

const handleForgotPassword = async () => {
  if (!resetEmail.value) return
  resetError.value = ''
  resetLoading.value = true
  try {
    await $fetch(`${apiBase.value}/auth/forgot-password`, {
      method: 'POST',
      body: { email: resetEmail.value },
    })
    // Reset OTP boxes
    otpDigits.value = ['', '', '', '', '', '']
    resetStep.value = 'otp'
    startResendCountdown()
    // Focus first box after transition
    setTimeout(() => otpRefs.value[0]?.focus(), 100)
  } catch {
    resetError.value = 'Something went wrong. Please try again.'
  } finally {
    resetLoading.value = false
  }
}

const handleVerifyResetOtp = async () => {
  if (otpValue.value.length < 6) return
  resetError.value = ''
  resetLoading.value = true
  try {
    const res: any = await $fetch(`${apiBase.value}/auth/verify-reset-otp`, {
      method: 'POST',
      body: { email: resetEmail.value, code: otpValue.value },
    })
    resetToken.value = res.resetToken
    newPassword.value = ''
    confirmPassword.value = ''
    resetStep.value = 'newPassword'
  } catch {
    resetError.value = 'Invalid or expired code. Please try again.'
  } finally {
    resetLoading.value = false
  }
}

const handleResetPassword = async () => {
  if (!passwordsMatch.value) {
    resetError.value = 'Passwords do not match.'
    return
  }
  resetError.value = ''
  resetLoading.value = true
  try {
    await $fetch(`${apiBase.value}/auth/reset-password`, {
      method: 'POST',
      body: { resetToken: resetToken.value, newPassword: newPassword.value },
    })
    resetStep.value = 'success'
  } catch {
    resetError.value = 'Failed to update password. The reset link may have expired.'
  } finally {
    resetLoading.value = false
  }
}

// Placeholder — social login not fully wired here
const handleSocialLogin = (_provider: string) => {}
</script>

<style scoped>
.content {
  @apply pt-6 px-4;
  @apply flex flex-col;
  @apply min-h-dvh;
}

.back-btn {
  @apply flex items-center justify-center w-10 h-10 rounded-full bg-white/10;
  @apply mb-2;
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

#google-gis-btn {
  position: absolute;
  inset: 0;
  opacity: 0.001;
  overflow: hidden;

  :deep(iframe),
  :deep(div) {
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
    &:disabled {
      @apply opacity-60;
    }
  }

  &__divider {
    @apply flex items-center space-x-4 mb-4 mt-6;
  }
}

/* ── Password Reset ──────────────────────────────────────────────────────── */

.reset-section {
  @apply flex flex-col flex-1 pt-10 pb-8;
}

.reset-icon {
  @apply w-16 h-16 rounded-full bg-brand-aqua/20 border-2 border-brand-aqua/50;
  @apply flex items-center justify-center mb-6;
}

.reset-title {
  @apply text-[28px] font-bold text-white mb-2;
}

.reset-subtitle {
  @apply text-white/70 text-[15px] mb-8 leading-relaxed;
}

.reset-form {
  @apply space-y-4;
}

.reset-input {
  @apply w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0;
  @apply focus:ring-2 focus:ring-brand-aqua outline-none;
}

.reset-btn {
  @apply w-full h-[50px] rounded-xl bg-brand-aqua text-white text-[17px] font-semibold;
  @apply flex items-center justify-center transition-opacity;
  &:disabled {
    @apply opacity-50;
  }
}

.error-banner {
  @apply rounded-xl bg-red-500/20 border border-red-400/40 px-4 py-3 text-red-200 text-sm;
}

/* OTP boxes */
.otp-boxes {
  @apply flex gap-3 justify-center;
}

.otp-box {
  @apply w-12 h-14 rounded-xl bg-white text-gray-900 text-xl font-bold text-center;
  @apply border-2 border-transparent focus:border-brand-aqua outline-none;
  @apply transition-colors;
}
</style>
