<template>
  <div class="mobile-container bpg-screen">
    <div class="bpg-topbar">
      <button class="bpg-back-btn" type="button" aria-label="Back" @click="handleBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="bpg-brand">
        <OPIcon name="logo" class="w-[26px] h-[26px]" />
        <span>umovingu</span>
      </div>
      <div class="bpg-spacer" />
    </div>

    <div class="bpg-hero">
      <div class="bpg-hero-text">
        <span class="bpg-pill">Buyer Passport</span>
        <div class="bpg-title">Get started with your Buyer Passport</div>
        <div class="bpg-sub">
          Create an account or sign in to build your Buyer Passport, verify
          your identity and show sellers you're a serious buyer.
        </div>
      </div>
      <!-- Text is on the LEFT here, so this needs a buyer passport tilted
           LEFT (toward the text) — that asset doesn't exist yet (only
           front/no-tile and tilted-right have been provided). Using the
           renamed-aside legacy image as a placeholder until it's ready;
           swap to /op-icons/passport-covers/buyer_tilted_left_on_tile.png
           once available. -->
      <img src="/op-icons/misc/buyerPassport_legacy.png" alt="" class="bpg-hero-img" loading="lazy" />
    </div>

    <div class="bpg-benefits">
      <div class="bpg-benefit">
        <div class="bpg-benefit-ic">
          <img src="/op-icons/onboarding/trustShield.png" alt="" loading="lazy" />
        </div>
        <div class="bpg-benefit-title">Verified identity</div>
        <div class="bpg-benefit-sub">Show you're a serious buyer</div>
      </div>
      <div class="bpg-benefit">
        <div class="bpg-benefit-ic">
          <img src="/op-icons/buyer-profile-build/verifiedDoc.png" alt="" loading="lazy" />
        </div>
        <div class="bpg-benefit-title">Stronger offers</div>
        <div class="bpg-benefit-sub">Stand out to sellers with confidence</div>
      </div>
      <div class="bpg-benefit">
        <div class="bpg-benefit-ic">
          <img src="/op-icons/profile/savedProperties.jpeg" alt="" loading="lazy" />
        </div>
        <div class="bpg-benefit-title">Save &amp; track</div>
        <div class="bpg-benefit-sub">Keep your progress in one place</div>
      </div>
    </div>

    <form class="bpg-form" @submit.prevent="handleLogin">
      <div class="form-field">
        <label class="form-label">Email address</label>
        <div class="form-input-wrap">
          <span class="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </span>
          <input v-model="emailInput" type="email" placeholder="Enter your email address" class="form-input with-icon" autocomplete="email" />
        </div>
      </div>

      <div class="form-field">
        <div class="form-label-row">
          <label class="form-label">Password</label>
          <NuxtLink to="/onboarding/signin" class="bpg-forgot-link">Forgot password?</NuxtLink>
        </div>
        <div class="form-input-wrap">
          <span class="form-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            v-model="passwordInput"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Your password"
            class="form-input with-icon with-action"
            autocomplete="current-password"
          />
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
        <div class="bpg-pw-hint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3z" />
          </svg>
          Use 8+ characters with a mix of letters, numbers and symbols
        </div>
      </div>

      <div v-if="loginError" class="error-banner">{{ loginError }}</div>

      <button type="submit" class="btn-primary" :disabled="loginLoading">
        <span v-if="loginLoading" class="spinner" />
        {{ loginLoading ? 'Signing in…' : 'Sign in' }}
        <svg v-if="!loginLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </form>

    <div class="bpg-or-row">
      <span class="bpg-or-line" />
      <span>OR</span>
      <span class="bpg-or-line" />
    </div>

    <button type="button" class="btn-outline" @click="goCreateAccount">
      Create free account
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>

    <div class="bpg-legal">
      By continuing, you agree to our
      <NuxtLink to="/legal/terms" target="_blank">Terms of Service</NuxtLink>
      and
      <NuxtLink to="/legal/privacy" target="_blank">Privacy Policy</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dedicated "Buyer Passport" landing + sign-in screen — shown instead of
// the generic AuthGateModal when a guest taps the Buyer Passport card on
// Discover, per the attached prototype. Sign-in logic (form, error
// handling, password visibility) mirrors pages/onboarding/signin.vue's
// "idle" step; the full forgot-password/reset flow isn't duplicated
// here — "Forgot password?" hands off to that page instead.
definePageMeta({ title: 'Buyer Passport - UmovingU', middleware: 'guest' })

import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import OPIcon from '~/components/ui/OPIcon.vue'

const { login } = useAuth()

// Where both the inline sign-in and "Create free account" land once
// authenticated — matches the AuthGateModal's redirectTarget for this
// same card on discover.vue.
const REDIRECT_TARGET = '/buyer-profile/build'

const emailInput = ref('')
const passwordInput = ref('')
const showPassword = ref(false)
const loginError = ref('')
const loginLoading = ref(false)

// router.back() pops the real history entry instead of pushing a new
// "/discover" one — pushing meant Back-on-this-page → Back-on-discover
// ping-ponged between the two forever (each "back" tap grew the history
// stack instead of unwinding it) rather than reaching whatever the user
// was on before Discover.
const handleBack = useGoBack('/discover')

async function handleLogin() {
  loginError.value = ''
  loginLoading.value = true
  try {
    const response: any = await login(emailInput.value, passwordInput.value)
    localStorage.setItem('token', response.token)
    setSessionFlag()
    // Native push tokens are registered on app boot, before the user
    // has a JWT — drain the cached one now that we do.
    const { syncTokenAfterSignin } = usePushNotifications()
    await syncTokenAfterSignin()
    // replace, not push — this page has `middleware: 'guest'`, which
    // force-redirects any authenticated visit away (to /dashboard, via a
    // full external reload). Leaving get-started reachable by a later
    // back-tap means that reload can fire mid-back-navigation, which
    // browsers handle inconsistently and can strand the user with no way
    // forward (reported: build -> view -> back -> stuck). Replacing here
    // removes get-started from history the moment login succeeds, so
    // back from /buyer-profile/view falls through to its own
    // useGoBack('/profile') fallback instead.
    await navigateTo(REDIRECT_TARGET, { replace: true })
  } catch {
    loginError.value = 'Incorrect email or password. Please try again.'
  } finally {
    loginLoading.value = false
  }
}

function goCreateAccount() {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('redirectAfterLogin', REDIRECT_TARGET)
  }
  navigateTo('/onboarding/signup')
}
</script>

<style scoped>
.bpg-screen {
  background: #fff;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* ── Topbar ── */
.bpg-topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: calc(12px + env(safe-area-inset-top)) 20px 8px;
  background: #fff;
}
.bpg-back-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f5f5f7;
  border: none;
  color: #231d45;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
}
.bpg-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.bpg-spacer {
  flex: 1;
}

/* ── Hero ── */
.bpg-hero {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 20px 4px;
}
.bpg-hero-text {
  flex: 1;
  min-width: 0;
}
.bpg-pill {
  display: inline-block;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #6b6783;
  background: #f4f4f6;
  padding: 5px 12px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.bpg-title {
  font-size: 25px;
  font-weight: 900;
  color: #231d45;
  letter-spacing: -0.6px;
  line-height: 1.15;
  margin-bottom: 10px;
}
.bpg-sub {
  font-size: 13.5px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.55;
}
.bpg-hero-img {
  width: 108px;
  flex-shrink: 0;
  object-fit: contain;
}

/* ── Benefits row ── */
.bpg-benefits {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 20px 20px 4px;
}
.bpg-benefit {
  text-align: center;
}
.bpg-benefit-ic {
  width: 48px;
  height: 48px;
  margin: 0 auto 10px;
  display: grid;
  place-items: center;
}
.bpg-benefit-ic img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}
.bpg-benefit-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 3px;
  letter-spacing: -0.1px;
}
.bpg-benefit-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.35;
}

/* ── Form ── */
.bpg-form {
  padding: 22px 20px 4px;
}
.form-field {
  margin-bottom: 14px;
}
.form-label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  margin-bottom: 6px;
}
.form-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.form-label-row .form-label {
  margin-bottom: 0;
}
.bpg-forgot-link {
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
  text-decoration: none;
}
.bpg-forgot-link:hover {
  color: #0d928b;
}
.form-input-wrap {
  position: relative;
}
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
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.1);
}
.form-input::placeholder {
  color: #9c98ad;
  font-weight: 500;
}
.form-input.with-icon {
  padding-left: 40px;
}
.form-input.with-action {
  padding-right: 44px;
}
.form-input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: #9c98ad;
  pointer-events: none;
}
.form-input-icon svg {
  width: 16px;
  height: 16px;
  display: block;
}
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
.form-input-action svg {
  width: 16px;
  height: 16px;
}
.bpg-pw-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 8px;
}
.bpg-pw-hint svg {
  color: #00a19a;
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

/* ── Buttons ── */
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
  margin-top: 4px;
}
.btn-primary:hover {
  background: #00b6ae;
}
.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
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
  to {
    transform: rotate(360deg);
  }
}

.bpg-or-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 0;
  color: #9c98ad;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.bpg-or-line {
  flex: 1;
  height: 1px;
  background: #ececef;
}

.btn-outline {
  margin: 16px 20px 0;
  background: #fff;
  color: #231d45;
  border: 1.5px solid #00a19a;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  padding: 13px 18px;
  border-radius: 100px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.2px;
  transition: all 0.18s;
}
.btn-outline:hover {
  background: #f2faf8;
}

.bpg-legal {
  margin-top: auto;
  padding: 24px 24px calc(20px + env(safe-area-inset-bottom));
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #9c98ad;
  line-height: 1.6;
}
.bpg-legal a {
  color: #00a19a;
  font-weight: 700;
  text-decoration: none;
}
.bpg-legal a:hover {
  color: #0d928b;
}
</style>
