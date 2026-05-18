<template>
  <div class="mp-page mobile-container">
    <div class="mp-topbar">
      <button class="mp-back" @click="router.back()" aria-label="Back">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="mp-top-title">Marketplace</div>
      <div class="mp-top-spacer" />
    </div>

    <div class="mp-hero">
      <div class="mp-emoji">🛠️</div>
      <h1 class="mp-h1">Trusted services, on the way</h1>
      <p class="mp-sub">
        We're putting together a hand-picked panel of conveyancers, surveyors,
        insurers and energy installers — vetted to work with Property Passports
        so the data they need is already verified.
      </p>

      <div class="mp-feat">
        <div class="mp-feat-row">
          <span class="mp-feat-check">✓</span>
          <div>
            <div class="mp-feat-title">Pre-quoted, no haggling</div>
            <div class="mp-feat-sub">
              Fixed-fee conveyancing and survey quotes — see the price before
              you instruct.
            </div>
          </div>
        </div>
        <div class="mp-feat-row">
          <span class="mp-feat-check">✓</span>
          <div>
            <div class="mp-feat-title">Faster completion</div>
            <div class="mp-feat-sub">
              Your Passport feeds straight into their forms — no re-typing,
              no waiting.
            </div>
          </div>
        </div>
        <div class="mp-feat-row">
          <span class="mp-feat-check">✓</span>
          <div>
            <div class="mp-feat-title">Independent reviews</div>
            <div class="mp-feat-sub">
              Real ratings from real UMU users — no astroturfing.
            </div>
          </div>
        </div>
      </div>

      <div class="mp-notify">
        <div class="mp-notify-eyebrow">Get early access</div>
        <p class="mp-notify-body">
          We'll email you when the Marketplace opens, with a £25 credit for
          first-time bookings.
        </p>
        <form class="mp-notify-form" @submit.prevent="submitNotify">
          <input
            v-model="email"
            type="email"
            class="mp-notify-input"
            placeholder="you@example.com"
            :disabled="submitting || submitted"
            required
          />
          <button
            class="mp-notify-btn"
            type="submit"
            :disabled="submitting || submitted"
          >
            <span v-if="submitting" class="mp-spinner" />
            {{ submitted ? 'You\'re on the list ✓' : 'Notify me' }}
          </button>
        </form>
        <div v-if="errorMsg" class="mp-notify-err">{{ errorMsg }}</div>
      </div>
    </div>

    <div style="height: 100px" />
    <BottomNav active="marketplace" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '~/components/core/BottomNav.vue'

const router = useRouter()
const config = useRuntimeConfig()

const email = ref('')
const submitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')

async function submitNotify() {
  errorMsg.value = ''
  if (!email.value.trim()) return
  submitting.value = true
  try {
    // Re-use the existing /support/request endpoint — message goes to the
    // support inbox with a tag so the team can pull a marketplace-interest list.
    await $fetch(`${config.public.apiBase}/support/request`, {
      method: 'POST',
      body: {
        email: email.value.trim(),
        subject: 'Marketplace early access',
        message: 'Add me to the marketplace waitlist.',
        kind: 'marketplace_waitlist',
      },
    })
    submitted.value = true
  } catch (e: any) {
    errorMsg.value = "Couldn't add you — try again in a moment."
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.mp-page {
  min-height: 100vh;
  background: #fafafa;
  padding-bottom: 24px;
}
.mp-topbar {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background: #fff;
}
.mp-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ececef;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.mp-back svg {
  width: 16px;
  height: 16px;
  color: #231d45;
}
.mp-top-title {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.mp-top-spacer {
  width: 36px;
}

.mp-hero {
  padding: 28px 22px 32px;
  text-align: center;
}
.mp-emoji {
  font-size: 48px;
  margin-bottom: 12px;
}
.mp-h1 {
  font-size: 24px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin: 0 0 10px;
}
.mp-sub {
  font-size: 15px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.5;
  max-width: 320px;
  margin: 0 auto 24px;
}

.mp-feat {
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: left;
  background: #fff;
  border: 1px solid #ececef;
  border-radius: 16px;
  padding: 18px 18px 16px;
  margin: 0 4px 24px;
}
.mp-feat-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.mp-feat-check {
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e6f4f1;
  color: #007e78;
  font-weight: 800;
  font-size: 13px;
  flex-shrink: 0;
}
.mp-feat-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 2px;
}
.mp-feat-sub {
  font-size: 13px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.45;
}

.mp-notify {
  text-align: left;
  background: linear-gradient(135deg, #f2faf8 0%, #fff 70%);
  border: 1.5px solid #e5f4f2;
  border-radius: 16px;
  padding: 18px;
  margin: 0 4px;
}
.mp-notify-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #007e78;
  margin-bottom: 6px;
}
.mp-notify-body {
  font-size: 13px;
  color: #4a4566;
  line-height: 1.5;
  margin: 0 0 14px;
}
.mp-notify-form {
  display: flex;
  gap: 8px;
}
.mp-notify-input {
  flex: 1;
  padding: 12px 14px;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
}
.mp-notify-input:focus {
  outline: none;
  border-color: #00a19a;
}
.mp-notify-btn {
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0 16px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.mp-notify-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.mp-notify-err {
  font-size: 12px;
  color: #c73e36;
  margin-top: 8px;
}
.mp-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #fff;
  border-radius: 50%;
  animation: mp-spin 0.6s linear infinite;
}
@keyframes mp-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
