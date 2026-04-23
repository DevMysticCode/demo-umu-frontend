<template>
  <BaseDrawer
    :model-value="modelValue"
    :title="isBuyerMode ? 'Access Passport' : 'Open Passport'"
    :show-back-button="true"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <div class="cp">
      <!-- Sub-header address + price chip -->
      <div class="cp__subheader">
        <div class="cp__sub-text">
          <div class="cp__sub-address">{{ displayAddress }}</div>
        </div>
        <div class="cp__price-chip">One-time £99</div>
      </div>

      <!-- Step 2: success -->
      <div v-if="step === 2" class="cp__body cp__body--center">
        <div class="cp__book-circle">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
        <div class="cp__success-title">Passport unlocked!</div>
        <div class="cp__success-desc">
          You now have full access to this property's verified history. Legal pack, planning records and certificates are all inside.
        </div>
        <div class="cp__success-card">
          <div class="cp__pills">
            <span class="cp__pill">📄 TA10</span>
            <span class="cp__pill">📋 Title</span>
            <span class="cp__pill">📅 Planning</span>
            <span class="cp__pill">🗺 Boundaries</span>
            <span class="cp__pill">🏷 Certificates</span>
          </div>
        </div>
        <button class="cp__success-cta" @click="viewPassport">View the Passport →</button>
        <button class="cp__secondary-btn" @click="handleClose">Back to property</button>
      </div>

      <!-- Step 1: info / pay -->
      <div v-else class="cp__body">
        <!-- Hero -->
        <div class="cp__hero">
          <div class="cp__hero-blob" />
          <div class="cp__hero-eyebrow">Property Passport</div>
          <div class="cp__hero-heading">Everything verified.<br />Nothing hidden.</div>
          <div class="cp__hero-caption">Trusted legal, planning and ownership records — all in one place.</div>
        </div>

        <!-- Features list -->
        <div class="cp__features-title">What's included</div>
        <div class="cp__features">
          <div v-for="feat in features" :key="feat.label" class="cp__feature">
            <div class="cp__feature-icon">
              <span v-html="feat.icon" />
            </div>
            <div class="cp__feature-label">{{ feat.label }}</div>
            <div class="cp__feature-chip">Included</div>
          </div>
        </div>

        <!-- Price summary -->
        <div class="cp__price-card">
          <div class="cp__price-row">
            <span class="cp__price-label">Property Passport access</span>
            <span class="cp__price-value">£99.00</span>
          </div>
          <div class="cp__price-row">
            <span class="cp__price-label">VAT (20%)</span>
            <span class="cp__price-value cp__price-value--muted">£0.00 <span class="cp__vat-note">(exempt)</span></span>
          </div>
          <div class="cp__price-row cp__price-row--total">
            <span class="cp__total-label">Total</span>
            <span class="cp__total-value">£99.00</span>
          </div>
        </div>

        <!-- Stripe card form (visible after Pay tapped) -->
        <div v-if="showCardForm" class="cp__stripe">
          <div class="cp__stripe-label">Card details</div>
          <div id="stripe-card-element" class="cp__stripe-box" />
          <p v-if="stripeError" class="cp__error">{{ stripeError }}</p>
        </div>

        <p v-if="errorMsg" class="cp__error cp__error--centered">{{ errorMsg }}</p>

        <button
          class="cp__cta"
          :disabled="loading || (showCardForm && !cardReady)"
          @click="showCardForm ? handlePayment() : handleShowCardForm()"
        >
          <span v-if="loading" class="cp__spinner" />
          <template v-else>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>{{ showCardForm ? 'Pay £99 securely' : 'Pay £99 — instant access' }}</span>
          </template>
        </button>
        <div class="cp__foot-note">Secure payment · Instant access · No subscription</div>
      </div>
    </div>
  </BaseDrawer>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, nextTick } from 'vue'
import type { Stripe, StripeCardElement } from '@stripe/stripe-js'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import { usePassportClaim } from '~/composables/usePassportClaim'

interface PropertyDisplay {
  id: string
  addressLine1: string
  area?: string
  postcode: string
  priceDisplay?: string
  image?: string
}

const props = defineProps<{
  modelValue: boolean
  property: PropertyDisplay | null
  existingPassportId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  claimed: [passportId: string]
}>()

const config = useRuntimeConfig()
const { claimPassport, unlockPassport } = usePassportClaim()

const loading = ref(false)
const errorMsg = ref('')
const showCardForm = ref(false)
const stripeError = ref('')
const cardReady = ref(false)
const step = ref<1 | 2>(1)
const acquiredPassportId = ref<string | null>(null)

let stripeInstance: Stripe | null = null
let cardElement: StripeCardElement | null = null

const isBuyerMode = computed(() => !!props.existingPassportId)

const displayAddress = computed(() => {
  const p = props.property
  if (!p) return ''
  return [p.addressLine1, p.area, p.postcode].filter(Boolean).join(' · ')
})

const features = computed(() => [
  {
    label: 'Fittings & Contents (TA10)',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00b8a9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>',
  },
  {
    label: 'Title Register & Plan',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00b8a9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  },
  {
    label: 'Planning & Building',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00b8a9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  },
  {
    label: 'Boundaries & Ownership',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00b8a9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  },
  {
    label: 'Certificates & Warranties',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00b8a9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  },
])

const handleShowCardForm = async () => {
  showCardForm.value = true
  await nextTick()
  await mountStripe()
}

const mountStripe = async () => {
  if (stripeInstance) return
  const { loadStripe } = await import('@stripe/stripe-js')
  stripeInstance = await loadStripe(config.public.stripeKey as string)
  if (!stripeInstance) return

  const elements = stripeInstance.elements()
  cardElement = elements.create('card', {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: '#1a1a1a',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#e53e3e' },
    },
  })

  const mountEl = document.getElementById('stripe-card-element')
  if (mountEl) {
    cardElement.mount(mountEl)
    cardElement.on('change', (e) => {
      stripeError.value = e.error?.message ?? ''
      cardReady.value = e.complete
    })
  }
}

const handlePayment = async () => {
  if (!props.property || !stripeInstance || !cardElement) return
  loading.value = true
  errorMsg.value = ''
  stripeError.value = ''

  try {
    const token = localStorage.getItem('token')
    const { clientSecret } = await $fetch<{ clientSecret: string }>(
      `${config.public.apiBase}/payment/create-intent`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
    )

    const { error, paymentIntent } = await stripeInstance.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (error) {
      stripeError.value = error.message ?? 'Payment failed. Please try again.'
      return
    }

    if (paymentIntent?.status !== 'succeeded') {
      stripeError.value = 'Payment not completed. Please try again.'
      return
    }

    let result: { passportId: string }
    if (isBuyerMode.value && props.existingPassportId) {
      result = await unlockPassport(props.existingPassportId)
    } else {
      result = await claimPassport(
        props.property.id,
        props.property.addressLine1,
        props.property.postcode,
      )
    }

    acquiredPassportId.value = result.passportId
    step.value = 2
  } catch (err: any) {
    errorMsg.value = err?.data?.message ?? err?.message ?? 'Payment failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const viewPassport = () => {
  if (acquiredPassportId.value) {
    emit('claimed', acquiredPassportId.value)
  }
  emit('update:modelValue', false)
}

const handleClose = () => {
  showCardForm.value = false
  errorMsg.value = ''
  stripeError.value = ''
  step.value = 1
  acquiredPassportId.value = null
  emit('update:modelValue', false)
}

onUnmounted(() => {
  cardElement?.destroy()
})
</script>

<style scoped>
.cp {
  --navy: #0f0d3d;
  --brand: #00b8a9;
  --brand-pale: #e6fbfa;
  --brand-soft: #b6ece6;
  --ink: #1a1a1a;
  --ink-soft: #4b5563;
  --ink-faint: #9ca3af;
  --line: #e5e7eb;

  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink);
}

.cp__subheader {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px 14px;
  border-bottom: 1px solid var(--line);
}

.cp__sub-text {
  flex: 1;
  min-width: 0;
}

.cp__sub-address {
  font-size: 12px;
  color: var(--ink-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cp__price-chip {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  color: #92400e;
  flex-shrink: 0;
}

.cp__body {
  padding: 20px;
}

.cp__body--center {
  text-align: center;
}

/* Hero */
.cp__hero {
  background: linear-gradient(135deg, var(--navy) 0%, #1e1b4b 100%);
  border-radius: 20px;
  padding: 22px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.cp__hero-blob {
  position: absolute;
  right: -10px;
  top: -10px;
  width: 90px;
  height: 90px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}

.cp__hero-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 6px;
}

.cp__hero-heading {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.cp__hero-caption {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.55;
  position: relative;
}

/* Features */
.cp__features-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 12px;
}

.cp__features {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
}

.cp__feature {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--line);
}

.cp__feature:last-child {
  border-bottom: none;
}

.cp__feature-icon {
  width: 40px;
  height: 40px;
  background: var(--brand-pale);
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.cp__feature-label {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.cp__feature-chip {
  background: var(--brand-pale);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  color: var(--brand);
  flex-shrink: 0;
}

/* Price card */
.cp__price-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
}

.cp__price-row {
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cp__price-row:last-child {
  border-bottom: none;
}

.cp__price-label {
  font-size: 13px;
  color: var(--ink);
}

.cp__price-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.cp__price-value--muted {
  color: var(--ink-soft);
  font-weight: 500;
}

.cp__vat-note {
  font-size: 11px;
}

.cp__total-label {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
}

.cp__total-value {
  font-size: 16px;
  font-weight: 800;
  color: var(--navy);
}

/* Stripe */
.cp__stripe {
  margin-bottom: 16px;
}

.cp__stripe-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-soft);
  margin-bottom: 6px;
}

.cp__stripe-box {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.2s;
}

.cp__stripe-box:focus-within {
  border-color: var(--brand);
}

.cp__error {
  font-size: 13px;
  color: #e53e3e;
  margin: 8px 0 0;
}

.cp__error--centered {
  text-align: center;
  margin: 0 0 12px;
}

/* CTA */
.cp__cta {
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
  gap: 10px;
  margin-bottom: 10px;
  transition: opacity 0.2s;
}

.cp__cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cp__spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cp-spin 0.7s linear infinite;
}

@keyframes cp-spin {
  to { transform: rotate(360deg); }
}

.cp__foot-note {
  text-align: center;
  font-size: 11px;
  color: var(--ink-faint);
}

/* Success */
.cp__book-circle {
  width: 80px;
  height: 80px;
  background: var(--brand-pale);
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 30px auto 20px;
  color: var(--brand);
}

.cp__success-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}

.cp__success-desc {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.65;
  margin-bottom: 24px;
}

.cp__success-card {
  background: var(--brand-pale);
  border: 1.5px solid var(--brand-soft);
  border-radius: 16px;
  padding: 16px;
  text-align: left;
  margin-bottom: 24px;
}

.cp__pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.cp__pill {
  background: #fff;
  border: 1px solid var(--brand-soft);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--brand);
}

.cp__success-cta {
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
  margin-bottom: 10px;
}

.cp__secondary-btn {
  width: 100%;
  border: none;
  padding: 12px;
  border-radius: 14px;
  background: transparent;
  color: var(--ink-soft);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
</style>
