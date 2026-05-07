<template>
  <div class="mobile-container" style="background: #fff; display: flex; flex-direction: column; min-height: 100dvh;">

    <!-- Navy gradient header -->
    <div class="auth-header">
      <div class="header-glow"></div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; position: relative; z-index: 1;">
        <button @click="$router.back()" class="header-back-btn">‹</button>
        <span style="font-size: 15px; font-weight: 700; color: #fff;">Create account</span>
      </div>
      <div style="position: relative; z-index: 1;">
        <h1 style="font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 4px; letter-spacing: -0.02em;">Tell us who you are</h1>
        <p style="font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.5;">Your details stay with us — we never share them with third parties.</p>
      </div>
    </div>

    <!-- Scrollable form -->
    <div style="flex: 1; overflow-y: auto; padding: 22px 20px 40px;">

      <div v-if="formError" class="error-banner">{{ formError }}</div>

      <!-- Full Name -->
      <div class="field-wrap">
        <label class="field-label">Full Name</label>
        <input v-model="form.fullName" type="text" placeholder="Jane Smith" class="field-input" autocomplete="name" />
      </div>

      <!-- Email -->
      <div class="field-wrap">
        <label class="field-label">Email address</label>
        <input v-model="form.email" type="email" placeholder="you@example.com" class="field-input" autocomplete="email" />
      </div>

      <!-- Mobile with country code -->
      <div class="field-wrap">
        <label class="field-label">Mobile Number <span style="color:#94a3b8;font-weight:400;">(optional)</span></label>
        <PhoneInput v-model="form.mobile" />
      </div>

      <!-- Postcode / Address — inline live dropdown -->
      <div class="field-wrap">
        <label class="field-label">Postcode</label>
        <div v-if="selectedAddress" class="address-selected-row">
          <div class="address-selected-body">
            <div class="address-selected-line1">{{ selectedAddress.line1 }}</div>
            <div class="address-selected-line2">{{ selectedAddress.line2 }}</div>
          </div>
          <button type="button" class="address-edit-btn" @click="editAddress">Edit</button>
        </div>
        <PropertySearchInput
          v-else
          placeholder="Enter postcode or address"
          variant="light"
          @select="onAddressSelect"
        />
      </div>

      <!-- Password -->
      <div class="field-wrap">
        <label class="field-label">Password</label>
        <div style="position: relative;">
          <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="At least 8 characters" class="field-input" style="padding-right: 46px;" autocomplete="new-password" />
          <button type="button" @click="showPassword = !showPassword" class="pw-toggle">
            <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="field-wrap">
        <label class="field-label">Confirm Password</label>
        <div style="position: relative;">
          <input v-model="form.confirmPassword" :type="showConfirm ? 'text' : 'password'" placeholder="Repeat your password" class="field-input" style="padding-right: 46px;" autocomplete="new-password" />
          <button type="button" @click="showConfirm = !showConfirm" class="pw-toggle">
            <svg v-if="showConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      <!-- Submit -->
      <button @click="handleSubmit" :disabled="isLoading" class="submit-btn" style="margin-bottom: 12px;">
        <span v-if="isLoading" class="spinner"></span>
        {{ isLoading ? 'Creating account…' : 'Create account' }}
      </button>

      <!-- Terms disclaimer -->
      <p class="terms-disclaimer">
        By continuing you agree to our
        <span class="terms-link" @click="showTermsModal = true">Terms of Service</span>
        and
        <span class="terms-link" @click="showTermsModal = true">Privacy Policy</span>
      </p>

      <!-- Sign in link -->
      <div style="text-align: center; margin-top: 18px;">
        <span style="font-size: 13px; color: #94a3b8;">Already have an account? </span>
        <NuxtLink to="/onboarding/signin" style="font-size: 13px; font-weight: 700; color: #00A19A; text-decoration: none;">Sign in</NuxtLink>
      </div>
    </div>

    <!-- Terms Modal -->
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
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirm = ref(false)
const formError = ref('')
const isLoading = ref(false)
const showTermsModal = ref(false)

// ── Address search (live dropdown) ────────────────────────────────────────
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
  // Basic email format check before hitting the backend
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    formError.value = 'Please enter a valid email address.'
    return
  }
  if (form.password.length < 8) {
    formError.value = 'Password must be at least 8 characters.'
    return
  }
  if (form.password !== form.confirmPassword) {
    formError.value = 'Passwords do not match.'
    return
  }

  // Split full name into first / last
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

    // Store in both useState and sessionStorage so a page refresh on
    // the verification page doesn't lose the email (SSR resets useState).
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
.auth-header {
  background: linear-gradient(135deg, #231d45, #2d2560);
  padding: 18px 20px 24px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.header-glow {
  position: absolute;
  right: -20px;
  bottom: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.25), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
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

/* Make PhoneInput match the rest of the form */
:deep(.phone-field) {
  background: #fff;
  border: 1.5px solid #eef0f6;
  border-radius: 12px;
  height: 50px;
}

:deep(.phone-field--focused) {
  border-color: #00A19A;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.12);
}

:deep(.number-input) {
  font-size: 15px;
  color: #231d45;
}

:deep(.country-dial) {
  color: #231d45;
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
  opacity: 0.6;
}

.submit-btn:active {
  transform: scale(0.98);
}

.terms-disclaimer {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
}

.terms-link {
  color: #00A19A;
  font-weight: 600;
  cursor: pointer;
}

.address-selected-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f1f9f4;
  border: 1.5px solid #e2f1ea;
  border-radius: 12px;
  padding: 12px 14px;
}
.address-selected-body {
  flex: 1;
  min-width: 0;
}
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
