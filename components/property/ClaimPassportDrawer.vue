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
          <div class="cp__sub-address">{{ displayAddressPiped }}</div>
        </div>
        <div class="cp__price-chip">One-time £99</div>
      </div>

      <!-- Step 2: success -->
      <div v-if="step === 2" class="cp__body cp__body--center">
        <div class="cp__book-circle">
          <img src="/op-icons/landing/propertyPassportCard.png" alt="" class="cp__book-circle-img" loading="lazy" />
        </div>
        <div class="cp__success-title">Passport unlocked!</div>
        <div class="cp__success-desc">
          You now have full access to this property's verified history. Legal pack, planning records and certificates are all inside.
        </div>
        <div class="cp__success-card">
          <div class="cp__pills">
            <span class="cp__pill"><img src="/op-icons/passportview/fixturesAndFittings.png" alt="" class="cp__pill-ic" loading="lazy" /> TA10</span>
            <span class="cp__pill"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="cp__pill-ic" loading="lazy" /> Title</span>
            <span class="cp__pill"><img src="/op-icons/passportview/alterationsAndPlanning.png" alt="" class="cp__pill-ic" loading="lazy" /> Planning</span>
            <span class="cp__pill"><img src="/op-icons/passportview/boundariesMap.png" alt="" class="cp__pill-ic" loading="lazy" /> Boundaries</span>
            <span class="cp__pill"><img src="/op-icons/passportview/gurantessAndWarranties.png" alt="" class="cp__pill-ic" loading="lazy" /> Certificates</span>
          </div>
        </div>
        <button class="cp__success-cta" @click="viewPassport">View the Passport →</button>
        <button class="cp__secondary-btn" @click="handleClose">Back to property</button>
      </div>

      <!-- Step 1: info / pay -->
      <div v-else class="cp__body">
        <!-- Hero -->
        <div class="cp__hero">
          <img src="/op-icons/landing/propertyPassportCard.png" alt="" class="cp__hero-img" loading="lazy" />
          <div class="cp__hero-heading">Everything verified.<br />Nothing hidden.</div>
          <div class="cp__hero-caption">Trusted legal, planning and ownership records - all in one place.</div>
        </div>

        <!-- 3-icon strip -->
        <div class="cp__value-row">
          <div v-for="v in valueProps" :key="v.label" class="cp__value">
            <img :src="v.icon" alt="" class="cp__value-icon-img" loading="lazy" />
            <div class="cp__value-label">{{ v.label }}</div>
          </div>
        </div>

        <!-- Features list -->
        <div class="cp__features-title">What's included</div>
        <div class="cp__features">
          <div v-for="feat in features" :key="feat.label" class="cp__feature">
            <span class="cp__feature-check">✓</span>
            <div class="cp__feature-label">{{ feat.label }}</div>
          </div>
        </div>

        <!-- Price summary -->
        <div class="cp__features-title">Payment summary</div>
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

        <div v-if="errorMsg" class="cp__error cp__error--centered">
          <p>{{ errorMsg }}</p>
          <NuxtLink
            v-if="errorMsg.toLowerCase().includes('phone')"
            to="/profile/personal-information"
            class="cp__error-link"
          >
            Add phone number →
          </NuxtLink>
          <!-- Backend's KYC gate (assertKycVerified) throws with the
               string "Identity verification (KYC) is required" — surface
               the deep-link to the Persona-driven verification flow so
               the user gets unstuck without a support email. -->
          <NuxtLink
            v-else-if="errorMsg.toLowerCase().includes('kyc') || errorMsg.toLowerCase().includes('identity verification')"
            to="/buyer-profile/build"
            class="cp__error-link"
          >
            Verify your identity →
          </NuxtLink>
        </div>

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
            <span>{{ showCardForm ? 'Pay £99 securely' : 'Pay £99 - instant access →' }}</span>
          </template>
        </button>
        <div class="cp__foot-badges">
          <span class="cp__foot-badge">🔒 Secure payment powered by Stripe</span>
          <span class="cp__foot-badge-sep" />
          <span class="cp__foot-badge">🛡️ Your data is safe with us</span>
        </div>
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

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    property: PropertyDisplay | null
    existingPassportId?: string
    passportType?: 'seller' | 'landlord'
    isHmo?: boolean
  }>(),
  {
    passportType: 'seller',
    isHmo: false,
  },
)

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

// "Address | Area | Postcode" - matches the prototype's separator.
const displayAddressPiped = computed(() => {
  const p = props.property
  if (!p) return ''
  return [p.addressLine1, p.area, p.postcode].filter(Boolean).join(' | ')
})

// 3-icon value strip above "What's included" (prototype: Verified data /
// All in one place / Make confident decisions) - real 3D icons from the
// app's existing library, matching every other icon in the app, not
// hand-drawn flat SVGs.
const valueProps = [
  { label: 'Verified data', icon: '/op-icons/verify-identity/shield.png' },
  { label: 'All in one place', icon: '/op-icons/misc/folder.png' },
  { label: 'Make confident decisions', icon: '/op-icons/homescore/house.png' },
]

// "What's included" checklist - order matches the prototype exactly.
const features = [
  { label: 'Fittings & Contents (TA10)' },
  { label: 'Title Register & Plan' },
  { label: 'Planning & Building' },
  { label: 'Boundaries & Ownership' },
  { label: 'Certificates & Warranties' },
]

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
  if (!props.property) return
  loading.value = true
  errorMsg.value = ''
  stripeError.value = ''

  try {
    let result: { passportId: string }

    if (isBuyerMode.value && props.existingPassportId) {
      // Buyer mode: £99 unlock with Stripe. The backend now gates
      // buyer-unlock on a successful PassportPayment row for this
      // (user, passport) pair — pass the passportId so the intent's
      // metadata carries the link.
      if (!stripeInstance || !cardElement) {
        stripeError.value = 'Card form not ready. Please try again.'
        return
      }
      const token = localStorage.getItem('token')
      const { clientSecret } = await $fetch<{ clientSecret: string }>(
        `${config.public.apiBase}/payment/create-intent`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: { passportId: props.existingPassportId },
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

      // The webhook may not have fired yet; the backend re-fetches the
      // intent from Stripe inside hasSuccessfulPayment so this is safe.
      result = await unlockPassport(props.existingPassportId)
    } else {
      // Claim mode: owner creates their own passport. Currently free —
      // see comment in pages/property/[id].vue:899 stating "buyer-unlock
      // (£99)" as the only paywall surface. If product later wants to
      // also charge for claim, build a separate flow that pre-allocates
      // a draft passport, takes payment, then activates.
      result = await claimPassport(
        props.property.id,
        props.property.addressLine1,
        props.property.postcode,
        { type: props.passportType, isHmo: props.isHmo },
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
  --brand: #00a19a;
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
  background: var(--brand-pale);
  border: 1px solid var(--brand-soft);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  color: var(--brand);
  flex-shrink: 0;
}

.cp__body {
  padding: 20px;
}

.cp__body--center {
  text-align: center;
}

/* Hero - plain white ground with the passport-cover illustration, per
   the prototype (previously a dark navy card - this section reads as
   the page's own hero there, not a highlighted callout). */
.cp__hero {
  padding: 4px 0 22px;
  text-align: center;
}

.cp__hero-img {
  width: 96px;
  height: 96px;
  object-fit: contain;
  margin: 0 auto 14px;
  display: block;
}

.cp__hero-heading {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  line-height: 1.2;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.cp__hero-caption {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.55;
}

/* 3-icon value strip */
.cp__value-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 6px;
  margin-bottom: 20px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.cp__value {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 0 4px;
}

.cp__value-icon-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
  flex-shrink: 0;
}

.cp__value-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.3;
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
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 14px;
  margin-bottom: 20px;
}

.cp__feature {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.cp__feature-check {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.cp__feature-label {
  flex: 1;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.35;
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

.cp__error-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #00a19a;
  text-decoration: none;
  border-bottom: 1.5px solid #e2f1ea;
  padding-bottom: 1px;
}
.cp__error-link:hover {
  color: #00a19a;
  border-bottom-color: #00a19a;
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

.cp__foot-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  text-align: center;
}

.cp__foot-badge {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-faint);
  white-space: nowrap;
}

.cp__foot-badge-sep {
  width: 1px;
  height: 12px;
  background: var(--line);
  flex-shrink: 0;
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
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff;
  border: 1px solid var(--brand-soft);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--brand);
}
.cp__pill-ic {
  width: 15px;
  height: 15px;
  object-fit: contain;
  flex-shrink: 0;
}
.cp__book-circle-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
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
