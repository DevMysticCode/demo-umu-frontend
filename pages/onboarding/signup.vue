<template>
  <div class="mobile-container auth-screen">

    <!-- Topbar — back button + brand mini -->
    <div class="auth-topbar">
      <button class="auth-back-btn" @click="$router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="auth-spacer" />
      <div class="auth-brand-mini">
        <OPIcon name="logo" class="w-[26px] h-[26px]" />
      </div>
    </div>

    <!-- Hero -->
    <div class="auth-hero">
      <div class="auth-hero-eyebrow">Create your account</div>
      <div class="auth-hero-title">Start with your home.</div>
      <div class="auth-hero-sub">A few details and you're in. Your details stay with us — we never share them with third parties.</div>
    </div>

    <form class="auth-form" @submit.prevent="handleSubmit">

      <div v-if="formError" class="error-banner">{{ formError }}</div>

      <!-- Email -->
      <div class="form-field">
        <label class="form-label">Email address</label>
        <div class="form-input-wrap">
          <span class="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </span>
          <input v-model="form.email" type="email" placeholder="you@example.com" class="form-input with-icon" autocomplete="email" />
        </div>
      </div>

      <!-- Password -->
      <div class="form-field">
        <label class="form-label">Password</label>
        <div class="form-input-wrap">
          <span class="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="At least 8 characters" class="form-input with-icon with-action" autocomplete="new-password" />
          <button type="button" class="form-input-action" @click="showPassword = !showPassword">
            <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Full name -->
      <div class="form-field">
        <label class="form-label">Full name</label>
        <div class="form-input-wrap">
          <span class="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <input v-model="form.fullName" type="text" placeholder="Jane Smith" class="form-input with-icon" autocomplete="name" />
        </div>
      </div>

      <!-- Mobile (optional) -->
      <div class="form-field optional">
        <label class="form-label">Mobile number <span class="opt">optional</span></label>
        <PhoneInput v-model="form.mobile" />
        <div class="form-help">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>We only text you about <strong>your Passport</strong> — never marketing.</span>
        </div>
      </div>

      <!-- Postcode (optional) -->
      <div class="form-field optional">
        <label class="form-label">Postcode <span class="opt">optional</span></label>
        <div v-if="selectedAddress" class="address-selected-row">
          <div class="address-selected-body">
            <div class="address-selected-line1">{{ selectedAddress.line1 }}</div>
            <div class="address-selected-line2">{{ selectedAddress.line2 }}</div>
          </div>
          <button type="button" class="address-edit-btn" @click="editAddress">Edit</button>
        </div>
        <PropertySearchInput
          v-else
          placeholder="CV5 6AJ"
          variant="light"
          @select="onAddressSelect"
        />
        <div class="postcode-prompt">
          <div class="postcode-prompt-h">See your home's HealthScore the moment you sign in</div>
          <div class="postcode-prompt-text">Add your postcode and we'll show you what your home tells us — bills, value, comparisons. You can skip this and add it later.</div>
        </div>
      </div>

      <!-- Marketing opt-in -->
      <label class="checkbox-row">
        <span class="checkbox-box" :class="{ checked: form.marketingOptIn }">
          <input v-model="form.marketingOptIn" type="checkbox" hidden />
        </span>
        <span class="checkbox-text">Email me occasional product updates and tips. We won't spam you — and you can unsubscribe in one tap.</span>
      </label>

      <button type="submit" class="btn-primary" :disabled="isLoading">
        <span v-if="isLoading" class="spinner" />
        {{ isLoading ? 'Creating account…' : 'Create account' }}
      </button>

      <div class="terms-text">
        By continuing you agree to our
        <a @click="showTermsModal = true">Terms of Service</a>
        and
        <a @click="showTermsModal = true">Privacy Policy</a>.
      </div>
    </form>

    <div class="auth-footer">
      Already have an account? <NuxtLink to="/onboarding/signin">Sign in</NuxtLink>
    </div>

    <TermsModal
      :show="showTermsModal"
      @update:show="showTermsModal = $event"
      @accept="showTermsModal = false"
      @close="showTermsModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSession } from '~/composables/useSession'
import { toTitleCase } from '~/utils/form-helpres'
import PhoneInput from '~/components/form/PhoneInput.vue'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'
import TermsModal from '~/components/modals/TermsModal.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({
  title: 'Create Account - UmovingU',
  middleware: 'guest',
})

const config = useRuntimeConfig()
const { requestOtp } = useAuth()
const { email, pendingSignup } = useSession()

const form = reactive({
  fullName: '',
  email: '',
  mobile: '',
  postcode: '',
  password: '',
  marketingOptIn: false,
})

const showPassword = ref(false)
const formError = ref('')
const isLoading = ref(false)
const showTermsModal = ref(false)

const selectedAddress = ref<{ id: number; line1: string; line2: string; postcode?: string } | null>(null)

const onAddressSelect = (property: any) => {
  selectedAddress.value = {
    id: 1,
    line1: toTitleCase(property.addressLine1 ?? ''),
    line2: [property.city ? toTitleCase(property.city) : null, property.postcode?.toUpperCase()]
      .filter(Boolean)
      .join(', '),
    postcode: property.postcode?.toUpperCase(),
  }
  form.postcode = selectedAddress.value.postcode ?? selectedAddress.value.line1
}

const editAddress = () => {
  selectedAddress.value = null
  form.postcode = ''
}

const parseApiError = (err: any): string => {
  const msg = err?.data?.message
  if (Array.isArray(msg)) return msg.join('. ')
  return msg || 'Something went wrong. Please try again.'
}

const handleSubmit = async () => {
  formError.value = ''

  const cleanEmail = form.email.trim().toLowerCase()

  if (!form.fullName.trim()) {
    formError.value = 'Please enter your full name.'
    return
  }
  if (!cleanEmail) {
    formError.value = 'Please enter your email address.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    formError.value = 'Please enter a valid email address.'
    return
  }
  if (form.password.length < 8) {
    formError.value = 'Password must be at least 8 characters.'
    return
  }

  const parts = form.fullName.trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ')

  isLoading.value = true
  try {
    const { exists } = await $fetch<{ exists: boolean }>(
      `${config.public.apiBase}/auth/check-email`,
      { method: 'POST', body: { email: cleanEmail } },
    )

    if (exists) {
      formError.value = 'An account with this email already exists.'
      return
    }

    pendingSignup.value = {
      firstName,
      lastName,
      phone: form.mobile,
      postcode: form.postcode,
      password: form.password,
    }

    email.value = cleanEmail
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('umu-pending-email', cleanEmail)
    }

    await requestOtp(cleanEmail)
    await navigateTo('/onboarding/verification')
  } catch (err: any) {
    formError.value = parseApiError(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-screen {
  background: #fff;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Topbar */
.auth-topbar {
  display: flex;
  align-items: center;
  padding: 16px 22px 4px;
  gap: 10px;
}
.auth-back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fafafa;
  color: #231d45;
  border: 1px solid #ececef;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.auth-back-btn svg { width: 14px; height: 14px; }
.auth-spacer { flex: 1; }
.auth-brand-mini {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hero */
.auth-hero {
  padding: 18px 24px 4px;
}
.auth-hero-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.auth-hero-title {
  font-size: 30px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -1px;
  line-height: 1.05;
  margin-bottom: 10px;
}
.auth-hero-sub {
  font-size: 13.5px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.55;
  letter-spacing: -0.05px;
}

/* Form */
.auth-form { padding: 22px 24px 18px; }
.form-field { margin-bottom: 14px; }
.form-field.optional .form-label { color: #6b6783; }

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  margin-bottom: 6px;
}
.form-label .opt {
  font-size: 11px;
  font-weight: 600;
  color: #9c98ad;
  margin-left: 4px;
  letter-spacing: 0;
}

.form-input-wrap { position: relative; }
.form-input {
  width: 100%;
  background: #fff;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  padding: 13px 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #231d45;
  letter-spacing: -0.1px;
  transition: all 0.15s;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.10);
}
.form-input::placeholder { color: #9c98ad; font-weight: 500; }
.form-input.with-icon { padding-left: 40px; }
.form-input.with-action { padding-right: 44px; }

.form-input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: #9c98ad;
  pointer-events: none;
}
.form-input-icon svg { width: 16px; height: 16px; display: block; }

.form-input-action {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #9c98ad;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-input-action:hover { color: #007e78; }
.form-input-action svg { width: 16px; height: 16px; }

.form-help {
  font-size: 11px;
  font-weight: 600;
  color: #9c98ad;
  margin-top: 6px;
  line-height: 1.45;
  letter-spacing: -0.05px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.form-help svg {
  width: 12px;
  height: 12px;
  color: #00a19a;
  flex-shrink: 0;
  margin-top: 2px;
}
.form-help strong { color: #6b6783; font-weight: 800; }

/* PhoneInput visual alignment */
:deep(.phone-field) {
  background: #fff;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  height: 50px;
}
:deep(.phone-field--focused) {
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.10);
}
:deep(.number-input) { font-size: 14px; color: #231d45; font-weight: 600; }
:deep(.country-dial) { color: #231d45; }

/* Postcode prompt callout */
.postcode-prompt {
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  border-radius: 12px;
  padding: 12px 14px;
  margin-top: 8px;
}
.postcode-prompt-h {
  font-size: 11px;
  font-weight: 800;
  color: #007e78;
  margin-bottom: 4px;
  letter-spacing: -0.05px;
}
.postcode-prompt-text {
  font-size: 11.5px;
  font-weight: 500;
  color: #231d45;
  line-height: 1.45;
  letter-spacing: -0.05px;
}

/* Selected address pill */
.address-selected-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f1f9f4;
  border: 1.5px solid #e2f1ea;
  border-radius: 12px;
  padding: 12px 14px;
}
.address-selected-body { flex: 1; min-width: 0; }
.address-selected-line1 {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.address-selected-line2 {
  font-size: 11.5px;
  color: #4a5568;
  margin-top: 2px;
}
.address-edit-btn {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
}

/* Marketing checkbox */
.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 0 4px;
  cursor: pointer;
}
.checkbox-box {
  width: 18px;
  height: 18px;
  border: 1.5px solid #ececef;
  border-radius: 5px;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  position: relative;
  transition: all 0.15s;
}
.checkbox-box.checked {
  background: #00a19a;
  border-color: #00a19a;
}
.checkbox-box.checked::after {
  content: '';
  width: 9px;
  height: 5px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg) translate(1px, -1px);
}
.checkbox-text {
  font-size: 12px;
  font-weight: 600;
  color: #6b6783;
  line-height: 1.45;
  letter-spacing: -0.05px;
}

/* Primary button — teal pill */
.btn-primary {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  padding: 14px 18px;
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.2px;
  transition: all 0.18s;
  margin-top: 14px;
}
.btn-primary:hover { background: #00b6ae; }
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

.terms-text {
  font-size: 11px;
  font-weight: 500;
  color: #9c98ad;
  text-align: center;
  line-height: 1.5;
  margin-top: 14px;
  padding: 0 8px;
  letter-spacing: -0.05px;
}
.terms-text a {
  color: #007e78;
  font-weight: 700;
  cursor: pointer;
}

.auth-footer {
  font-size: 13px;
  font-weight: 600;
  color: #6b6783;
  text-align: center;
  padding: 16px 24px 24px;
  letter-spacing: -0.05px;
}
.auth-footer a {
  color: #8a5f1f;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
}
.auth-footer a:hover { color: #c18a38; }

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

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
