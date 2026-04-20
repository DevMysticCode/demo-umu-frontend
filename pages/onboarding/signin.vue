<template>
  <div class="mobile-container" style="background: #fff; display: flex; flex-direction: column; min-height: 100dvh;">

    <!-- ── Navy gradient header ── -->
    <div class="auth-header">
      <div style="position: absolute; right: -20px; bottom: -40px; width: 140px; height: 140px; background: radial-gradient(circle, rgba(0,161,154,0.25), transparent 70%); border-radius: 50%; pointer-events: none;"></div>

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; position: relative; z-index: 1;">
        <button @click="handleBack" class="header-back-btn">‹</button>
        <span style="font-size: 15px; font-weight: 700; color: #fff;">
          {{ resetStep === 'idle' ? 'Sign in' : resetStepTitle }}
        </span>
      </div>

      <div style="position: relative; z-index: 1;">
        <h1 style="font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 4px; letter-spacing: -0.02em;">
          {{ resetStep === 'idle' ? 'Welcome back' : resetStepHeading }}
        </h1>
        <p style="font-size: 13px; color: rgba(255,255,255,0.65);">
          {{ resetStep === 'idle' ? 'Good to see you again.' : resetStepSubtitle }}
        </p>
      </div>
    </div>

    <!-- ── Scrollable body ── -->
    <div style="flex: 1; overflow-y: auto; padding: 22px 20px 40px;">

      <!-- Session / logout banner (sign-in state only) -->
      <div
        v-if="bannerMessage && resetStep === 'idle'"
        class="info-banner"
        :class="bannerReason === 'logout' ? 'info-banner--teal' : 'info-banner--yellow'"
      >
        {{ bannerMessage }}
      </div>

      <!-- ── Sign In form ── -->
      <template v-if="resetStep === 'idle'">
        <div class="field-wrap">
          <label class="field-label">Email address</label>
          <input v-model="emailInput" type="email" placeholder="you@example.com" class="field-input" autocomplete="email" />
        </div>

        <div class="field-wrap">
          <label class="field-label">Password</label>
          <div style="position: relative;">
            <input
              v-model="passwordInput"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Your password"
              class="field-input"
              style="padding-right: 46px;"
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            />
            <button type="button" @click="showPassword = !showPassword" class="pw-toggle">
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="loginError" class="error-banner">{{ loginError }}</div>

        <button @click="handleLogin" :disabled="loginLoading" class="submit-btn" style="margin-bottom: 12px;">
          <span v-if="loginLoading" class="spinner"></span>
          {{ loginLoading ? 'Signing in…' : 'Sign in' }}
        </button>

        <div style="text-align: center; margin-bottom: 16px;">
          <button type="button" @click="startForgotPassword" style="font-size: 13px; font-weight: 600; color: #00A19A; background: none; border: none; cursor: pointer;">
            Forgot password?
          </button>
        </div>

        <div style="text-align: center;">
          <span style="font-size: 13px; color: #94a3b8;">Don't have an account? </span>
          <NuxtLink to="/onboarding/signup" style="font-size: 13px; font-weight: 700; color: #00A19A; text-decoration: none;">Create an account</NuxtLink>
        </div>
      </template>

      <!-- ── Forgot password: enter email ── -->
      <template v-else-if="resetStep === 'email'">
        <div class="field-wrap">
          <label class="field-label">Email address</label>
          <input v-model="resetEmail" type="email" placeholder="you@example.com" class="field-input" autocomplete="email" @keyup.enter="handleForgotPassword" />
        </div>

        <div v-if="resetError" class="error-banner">{{ resetError }}</div>

        <button @click="handleForgotPassword" :disabled="resetLoading" class="submit-btn">
          <span v-if="resetLoading" class="spinner"></span>
          {{ resetLoading ? 'Sending…' : 'Send reset code' }}
        </button>
      </template>

      <!-- ── Forgot password: enter OTP ── -->
      <template v-else-if="resetStep === 'otp'">
        <p style="font-size: 14px; color: #4a5568; margin-bottom: 24px; line-height: 1.6;">
          We sent a 6-digit code to<br>
          <strong style="color: #231d45;">{{ resetEmail }}</strong>
        </p>

        <!-- OTP boxes -->
        <div class="otp-boxes" style="margin-bottom: 24px;">
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

        <button @click="handleVerifyResetOtp" :disabled="resetLoading || otpValue.length < 6" class="submit-btn" style="margin-bottom: 14px;">
          <span v-if="resetLoading" class="spinner"></span>
          {{ resetLoading ? 'Verifying…' : 'Verify code' }}
        </button>

        <div style="text-align: center;">
          <button v-if="resendCountdown > 0" type="button" disabled style="font-size: 13px; color: #94a3b8; background: none; border: none;">
            Resend code in {{ resendCountdown }}s
          </button>
          <button v-else type="button" @click="handleForgotPassword" style="font-size: 13px; font-weight: 600; color: #00A19A; background: none; border: none; cursor: pointer; text-decoration: underline;">
            Resend code
          </button>
        </div>
      </template>

      <!-- ── Forgot password: new password ── -->
      <template v-else-if="resetStep === 'newPassword'">
        <div class="field-wrap">
          <label class="field-label">New password</label>
          <div style="position: relative;">
            <input v-model="newPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="New password" class="field-input" style="padding-right: 46px;" />
            <button type="button" @click="showNewPassword = !showNewPassword" class="pw-toggle">
              <svg v-if="showNewPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <div class="field-wrap">
          <label class="field-label">Confirm new password</label>
          <div style="position: relative;">
            <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirm new password" class="field-input" style="padding-right: 46px;" />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="pw-toggle">
              <svg v-if="showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <!-- Password strength -->
        <div v-if="newPassword" style="margin-bottom: 14px;">
          <div style="display: flex; gap: 4px; margin-bottom: 4px;">
            <div v-for="n in 4" :key="n" style="height: 4px; flex: 1; border-radius: 999px; transition: background 0.2s;" :style="{ background: n <= passwordStrength ? strengthBg : '#eef0f6' }"></div>
          </div>
          <p style="font-size: 12px;" :style="{ color: strengthColor }">{{ strengthLabel }}</p>
        </div>

        <div v-if="resetError" class="error-banner">{{ resetError }}</div>

        <button @click="handleResetPassword" :disabled="resetLoading || !passwordsMatch" class="submit-btn">
          <span v-if="resetLoading" class="spinner"></span>
          {{ resetLoading ? 'Updating…' : 'Update password' }}
        </button>
      </template>

      <!-- ── Forgot password: success ── -->
      <template v-else-if="resetStep === 'success'">
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; padding-top: 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(0,161,154,0.12); border: 2px solid rgba(0,161,154,0.4); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00A19A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style="font-size: 20px; font-weight: 800; color: #231d45; margin-bottom: 8px;">Password updated!</h2>
          <p style="font-size: 14px; color: #4a5568; line-height: 1.6; margin-bottom: 28px;">Your password has been changed successfully. You can now sign in with your new password.</p>
          <button @click="resetStep = 'idle'" class="submit-btn">Back to sign in</button>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  title: 'Sign In - UmovingU',
  middleware: 'guest',
})

const config = useRuntimeConfig()
const { login } = useAuth()
const route = useRoute()

// ── Banner ─────────────────────────────────────────────────────────────────
const bannerReason = computed(() => route.query.reason as string | undefined)
const bannerMessage = computed(() => {
  if (bannerReason.value === 'logout') return 'You have been logged out successfully.'
  if (bannerReason.value === 'session') return 'Your session has expired. Please sign in again.'
  return ''
})

// ── Sign In ────────────────────────────────────────────────────────────────
const emailInput = ref('')
const passwordInput = ref('')
const showPassword = ref(false)
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

const resetStepTitle = computed(() => {
  if (resetStep.value === 'email') return 'Forgot password'
  if (resetStep.value === 'otp') return 'Verify code'
  if (resetStep.value === 'newPassword') return 'New password'
  return ''
})
const resetStepHeading = computed(() => {
  if (resetStep.value === 'email') return 'Forgot your password?'
  if (resetStep.value === 'otp') return 'Check your email'
  if (resetStep.value === 'newPassword') return 'Set new password'
  return ''
})
const resetStepSubtitle = computed(() => {
  if (resetStep.value === 'email') return "Enter your email and we'll send a reset code."
  if (resetStep.value === 'otp') return 'Enter the 6-digit code we sent you.'
  if (resetStep.value === 'newPassword') return 'Choose a strong password.'
  return ''
})

const handleBack = () => {
  resetError.value = ''
  if (resetStep.value === 'idle') {
    navigateTo('/')
  } else if (resetStep.value === 'email') {
    resetStep.value = 'idle'
  } else if (resetStep.value === 'otp') {
    resetStep.value = 'email'
  } else if (resetStep.value === 'newPassword') {
    resetStep.value = 'otp'
  } else {
    resetStep.value = 'idle'
  }
}

const startForgotPassword = () => {
  resetEmail.value = emailInput.value
  resetError.value = ''
  resetStep.value = 'email'
}

// OTP boxes
const otpDigits = ref<string[]>(['', '', '', '', '', ''])
const otpRefs = ref<HTMLInputElement[]>([])
const otpValue = computed(() => otpDigits.value.join(''))

const onOtpInput = (index: number) => {
  const val = otpDigits.value[index]
  if (val && index < 5) otpRefs.value[index + 1]?.focus()
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

const handleForgotPassword = async () => {
  if (!resetEmail.value) return
  resetError.value = ''
  resetLoading.value = true
  try {
    await $fetch(`${config.public.apiBase}/auth/forgot-password`, {
      method: 'POST',
      body: { email: resetEmail.value },
    })
    otpDigits.value = ['', '', '', '', '', '']
    resetStep.value = 'otp'
    startResendCountdown()
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
    const res: any = await $fetch(`${config.public.apiBase}/auth/verify-reset-otp`, {
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

// New password
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordsMatch = computed(() => newPassword.value.length >= 8 && newPassword.value === confirmPassword.value)

const passwordStrength = computed(() => {
  const p = newPassword.value
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})
const strengthBg = computed(() => {
  if (passwordStrength.value <= 1) return '#ef4444'
  if (passwordStrength.value === 2) return '#f59e0b'
  if (passwordStrength.value === 3) return '#3b82f6'
  return '#10b981'
})
const strengthColor = computed(() => {
  if (passwordStrength.value <= 1) return '#ef4444'
  if (passwordStrength.value === 2) return '#f59e0b'
  if (passwordStrength.value === 3) return '#3b82f6'
  return '#10b981'
})
const strengthLabel = computed(() => {
  if (passwordStrength.value <= 1) return 'Weak'
  if (passwordStrength.value === 2) return 'Fair'
  if (passwordStrength.value === 3) return 'Good'
  return 'Strong'
})

const handleResetPassword = async () => {
  if (!passwordsMatch.value) {
    resetError.value = 'Passwords do not match.'
    return
  }
  resetError.value = ''
  resetLoading.value = true
  try {
    await $fetch(`${config.public.apiBase}/auth/reset-password`, {
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
</script>

<style scoped>
.auth-header {
  background: linear-gradient(135deg, #231d45, #2d2560);
  padding: 18px 20px 24px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.header-back-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  font-size: 20px;
  color: #fff;
  font-weight: 600;
  flex-shrink: 0;
  line-height: 1;
}

.field-wrap {
  margin-bottom: 14px;
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #4a5568;
  margin-bottom: 5px;
  letter-spacing: 0.02em;
}

.field-input {
  width: 100%;
  padding: 13px 14px;
  font-size: 15px;
  border: 1.5px solid #eef0f6;
  border-radius: 12px;
  background: #fff;
  color: #231d45;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
}

.field-input:focus {
  border-color: #00A19A;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.12);
}

.field-input::placeholder {
  color: #94a3b8;
}

.pw-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  padding: 0;
}

.submit-btn {
  width: 100%;
  border: none;
  padding: 15px 18px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: #00A19A;
  color: #fff;
  box-shadow: 0 4px 18px rgba(0, 161, 154, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  transition: transform 0.1s, opacity 0.15s;
}

.submit-btn:disabled {
  opacity: 0.5;
}

.submit-btn:active {
  transform: scale(0.98);
}

.error-banner {
  margin-bottom: 14px;
  padding: 12px 14px;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 12px;
  color: #dc2626;
  font-size: 13px;
  line-height: 1.5;
}

.info-banner {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}

.info-banner--teal {
  background: rgba(0, 161, 154, 0.1);
  border: 1px solid rgba(0, 161, 154, 0.25);
  color: #008c86;
}

.info-banner--yellow {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #92400e;
}

.otp-boxes {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.otp-box {
  width: 46px;
  height: 54px;
  border: 1.5px solid #eef0f6;
  border-radius: 12px;
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  color: #231d45;
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
}

.otp-box:focus {
  border-color: #00A19A;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.12);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
