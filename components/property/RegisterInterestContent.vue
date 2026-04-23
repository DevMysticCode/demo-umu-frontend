<template>
  <div class="ri-container" @click.stop>
    <!-- Sticky header -->
    <div class="ri-header">
      <div class="ri-header__text">
        <div class="ri-header__title">Register Interest</div>
        <div class="ri-header__address">{{ address }}</div>
      </div>
    </div>

    <!-- Step 1: form -->
    <div v-if="step === 1" class="ri-body">
      <!-- Hero -->
      <div class="ri-hero">
        <div class="ri-hero__blob" />
        <div class="ri-hero__eyebrow">Why register?</div>
        <div class="ri-hero__heading">Stand out before the<br />property goes live</div>
        <div class="ri-hero__bullets">
          <div class="ri-hero__bullet">
            <span class="ri-hero__dot" />
            <span>Agent notified you're a serious buyer</span>
          </div>
          <div class="ri-hero__bullet">
            <span class="ri-hero__dot" />
            <span>First to know about viewings and price changes</span>
          </div>
          <div class="ri-hero__bullet">
            <span class="ri-hero__dot" />
            <span>Verified ID means no delays when you offer</span>
          </div>
        </div>
      </div>

      <!-- Share block -->
      <div class="ri-section-title">We'll share with the agent</div>
      <div class="ri-card">
        <div class="ri-row">
          <div class="ri-row__icon ri-row__icon--teal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div class="ri-row__text">
            <div class="ri-row__title">Your buyer profile</div>
            <div class="ri-row__subtitle">Name, contact, chain position — from your account</div>
          </div>
          <div class="ri-chip ri-chip--teal">Auto</div>
        </div>

        <div class="ri-row">
          <div class="ri-row__icon ri-row__icon--green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div class="ri-row__text">
            <div class="ri-row__title">Budget &amp; mortgage status</div>
            <div class="ri-row__subtitle">Max budget and whether you have a DIP</div>
          </div>
          <div class="ri-chip ri-chip--green">Auto</div>
        </div>

        <div class="ri-row ri-row--last">
          <div class="ri-row__icon ri-row__icon--amber">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <div class="ri-row__text">
            <div class="ri-row__title">Your interest in this property</div>
            <div class="ri-row__subtitle">That you've viewed, saved and want to know more</div>
          </div>
          <div class="ri-chip ri-chip--amber">Auto</div>
        </div>
      </div>

      <!-- Privacy note -->
      <div class="ri-privacy">
        <span class="ri-privacy__emoji">🔒</span>
        <div class="ri-privacy__text">
          Your contact details are only shared with the agent — not the owner. We never share your data with third parties.
        </div>
      </div>

      <p v-if="errorMsg" class="ri-error">{{ errorMsg }}</p>

      <!-- CTA -->
      <button
        class="ri-cta"
        :disabled="isSubmitting"
        @click="registerInterest"
      >
        <span v-if="isSubmitting" class="ri-spinner" />
        <template v-else>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.56 6.56l.91-.85a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2z" />
          </svg>
          <span>Send my profile to the agent</span>
        </template>
      </button>
      <div class="ri-foot-note">Free · No commitment · 2 minutes</div>
    </div>

    <!-- Step 2: success -->
    <div v-else class="ri-body ri-body--center">
      <div class="ri-check-circle">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div class="ri-success-title">You're registered!</div>
      <div class="ri-success-desc">
        The agent has been notified. You're first in line for viewings, price updates and when the Passport is published.
      </div>

      <div class="ri-summary">
        <div class="ri-summary__row">
          <div class="ri-summary__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <div class="ri-summary__text">
            <div class="ri-summary__address">{{ address }}</div>
          </div>
        </div>
        <div class="ri-summary__pills">
          <span class="ri-pill">✓ Profile shared</span>
          <span class="ri-pill">✓ Agent notified</span>
          <span class="ri-pill">✓ Alerts active</span>
        </div>
      </div>

      <button class="ri-success-cta" @click="emit('submit')">See your activity →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  address: string
  propertyId: string
}>()

const emit = defineEmits(['submit'])

const config = useRuntimeConfig()
const isSubmitting = ref(false)
const step = ref<1 | 2>(1)
const errorMsg = ref('')

const registerInterest = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMsg.value = ''
  try {
    const token = localStorage.getItem('token')
    await $fetch(`${config.public.apiBase}/property/${props.propertyId}/register-interest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { interestLevel: 'super' },
    })
    step.value = 2
  } catch {
    errorMsg.value = 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.ri-container {
  --navy: #0f0d3d;
  --brand: #00b8a9;
  --brand-pale: #e6fbfa;
  --brand-soft: #b6ece6;
  --ink: #1a1a1a;
  --ink-soft: #4b5563;
  --ink-faint: #9ca3af;
  --line: #e5e7eb;

  max-width: 430px;
  width: 100%;
  background: #fff;
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.ri-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px 12px;
  background: #fff;
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 5;
}

.ri-header__text {
  flex: 1;
  min-width: 0;
}

.ri-header__title {
  font-size: 15px;
  font-weight: 800;
  color: var(--navy);
}

.ri-header__address {
  font-size: 11px;
  color: var(--ink-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ri-body {
  padding: 20px;
}

.ri-body--center {
  text-align: center;
}

/* Hero */
.ri-hero {
  background: linear-gradient(135deg, var(--navy) 0%, #1e1b4b 100%);
  border-radius: 20px;
  padding: 22px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.ri-hero__blob {
  position: absolute;
  right: -10px;
  top: -10px;
  width: 90px;
  height: 90px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}

.ri-hero__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}

.ri-hero__heading {
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  line-height: 1.25;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.ri-hero__bullets {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.ri-hero__bullet {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.ri-hero__dot {
  width: 6px;
  height: 6px;
  background: #5eead4;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Section */
.ri-section-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 12px;
}

.ri-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
}

.ri-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
}

.ri-row--last {
  border-bottom: none;
}

.ri-row__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.ri-row__icon--teal {
  background: var(--brand-pale);
  color: var(--brand);
}

.ri-row__icon--green {
  background: #f0fdf4;
  color: #16a34a;
}

.ri-row__icon--amber {
  background: #fef9f0;
  color: #d97706;
}

.ri-row__text {
  flex: 1;
  min-width: 0;
}

.ri-row__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.ri-row__subtitle {
  font-size: 11.5px;
  color: var(--ink-faint);
  margin-top: 2px;
}

.ri-chip {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.ri-chip--teal {
  background: var(--brand-pale);
  color: var(--brand);
}

.ri-chip--green {
  background: #f0fdf4;
  color: #16a34a;
}

.ri-chip--amber {
  background: #fef9f0;
  color: #d97706;
}

/* Privacy */
.ri-privacy {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.ri-privacy__emoji {
  font-size: 16px;
  flex-shrink: 0;
}

.ri-privacy__text {
  font-size: 11.5px;
  color: #166534;
  line-height: 1.55;
}

.ri-error {
  font-size: 13px;
  color: #ef4444;
  text-align: center;
  margin: 0 0 12px;
}

/* CTA */
.ri-cta {
  width: 100%;
  border: none;
  padding: 15px;
  border-radius: 14px;
  background: var(--brand);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: -0.01em;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.ri-cta:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.ri-spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ri-spin 0.7s linear infinite;
}

@keyframes ri-spin {
  to {
    transform: rotate(360deg);
  }
}

.ri-foot-note {
  text-align: center;
  font-size: 11px;
  color: var(--ink-faint);
  margin-top: 8px;
}

/* Success */
.ri-check-circle {
  width: 80px;
  height: 80px;
  background: #f0fdf4;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 20px auto 16px;
}

.ri-success-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}

.ri-success-desc {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.65;
  margin-bottom: 24px;
}

.ri-summary {
  background: var(--brand-pale);
  border: 1.5px solid var(--brand-soft);
  border-radius: 16px;
  padding: 16px;
  text-align: left;
  margin-bottom: 24px;
}

.ri-summary__row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.ri-summary__icon {
  width: 36px;
  height: 36px;
  background: var(--brand);
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.ri-summary__address {
  font-size: 13px;
  font-weight: 800;
  color: var(--navy);
  line-height: 1.35;
}

.ri-summary__pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.ri-pill {
  background: #fff;
  border: 1px solid var(--brand-soft);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--brand);
}

.ri-success-cta {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: 14px;
  background: var(--navy);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
</style>
