<template>
  <BaseDrawer
    :model-value="modelValue"
    :title="isBuyerMode ? 'Access Property Passport' : 'Claim Property Passport'"
    :show-back-button="true"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <div class="claim-drawer">
      <!-- Property Preview -->
      <div class="claim-drawer__property">
        <img
          v-if="property?.image"
          :src="property.image"
          :alt="property.addressLine1"
          class="claim-drawer__image"
        />
        <div class="claim-drawer__address">
          <h3 class="claim-drawer__address-line1">{{ property?.addressLine1 }}</h3>
          <p class="claim-drawer__address-area">
            {{ property?.area }}<span v-if="property?.postcode">, {{ property?.postcode }}</span>
          </p>
          <p class="claim-drawer__price">
            {{ property?.priceDisplay }}
            <span class="claim-drawer__price-label">Estimated Value</span>
          </p>
        </div>
      </div>

      <!-- Passport Info -->
      <div class="claim-drawer__info">
        <div class="claim-drawer__info-icon">🏠</div>
        <div>
          <h4 class="claim-drawer__info-title">
            {{ isBuyerMode ? 'What will you see?' : 'What is a Property Passport?' }}
          </h4>
          <p class="claim-drawer__info-body">
            {{ isBuyerMode
              ? 'Get full read-only access to the property passport — including fittings, official records, ownership history and more. Verified by the property owner.'
              : 'A Property Passport is your property\'s digital identity — storing ownership details, planning history, warranties, and more in one secure place.'
            }}
          </p>
        </div>
      </div>

      <!-- Features List -->
      <ul class="claim-drawer__features">
        <li v-for="feat in features" :key="feat" class="claim-drawer__feature">
          <span class="claim-drawer__feature-check">✓</span>
          {{ feat }}
        </li>
      </ul>

      <!-- Price Box -->
      <div class="claim-drawer__price-box">
        <div class="flex items-baseline gap-2">
          <span class="claim-drawer__price-amount">£99</span>
          <span class="claim-drawer__price-period">one-time unlock</span>
        </div>
        <div class="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
          <Icon name="i-heroicons-lock-closed" class="w-3 h-3" />
          Secured by Stripe
        </div>
      </div>

      <!-- ── Payment form ─────────────────────────────────────────────── -->
      <div v-if="showCardForm" class="stripe-section">
        <p class="stripe-section__label">Card details</p>
        <div id="stripe-card-element" class="stripe-card-box"></div>
        <p v-if="stripeError" class="stripe-error">{{ stripeError }}</p>
      </div>

      <!-- Error -->
      <p v-if="errorMsg" class="claim-drawer__error">{{ errorMsg }}</p>

      <!-- CTA -->
      <button
        class="claim-drawer__cta"
        :disabled="loading || (showCardForm && !cardReady)"
        @click="showCardForm ? handlePayment() : handleShowCardForm()"
      >
        <span v-if="loading" class="claim-drawer__spinner" />
        <template v-else>
          <Icon v-if="showCardForm" name="i-heroicons-lock-closed" class="w-4 h-4" />
          <span>{{ showCardForm ? 'Pay £99 securely' : 'Unlock Passport' }}</span>
        </template>
      </button>

      <p class="claim-drawer__disclaimer">
        <Icon name="i-heroicons-shield-check" class="w-3 h-3 inline mr-1" />
        Payments are processed securely by Stripe. We never store your card details.
      </p>
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

let stripeInstance: Stripe | null = null
let cardElement: StripeCardElement | null = null

const isBuyerMode = computed(() => !!props.existingPassportId)

const features = computed(() =>
  isBuyerMode.value
    ? [
        'Fittings & Contents (TA10) records',
        'Title Register & Title Plan access',
        'Planning & building history',
        'Boundaries & ownership details',
        'Certificates and warranties',
      ]
    : [
        'Secure digital ownership record',
        'Planning & building history',
        'Certificates, guarantees & warranties',
        'Boundary & title information',
        'Trusted by solicitors & estate agents',
      ],
)

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
    // 1. Create PaymentIntent on backend
    const token = localStorage.getItem('token')
    const { clientSecret } = await $fetch<{ clientSecret: string }>(
      `${config.public.apiBase}/payment/create-intent`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      },
    )

    // 2. Confirm the card payment via Stripe
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

    // 3. Payment succeeded — create / unlock passport
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

    emit('claimed', result.passportId)
    emit('update:modelValue', false)
  } catch (err: any) {
    errorMsg.value =
      err?.data?.message ?? err?.message ?? 'Payment failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  showCardForm.value = false
  errorMsg.value = ''
  stripeError.value = ''
  emit('update:modelValue', false)
}

onUnmounted(() => {
  cardElement?.destroy()
})
</script>

<style scoped>
.claim-drawer {
  padding: 8px 0 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.claim-drawer__property {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: #f8f8f8;
  border-radius: 14px;
  padding: 12px;
}

.claim-drawer__image {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.claim-drawer__address-line1 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 2px;
}

.claim-drawer__address-area {
  font-size: 13px;
  color: #666;
  margin: 0 0 6px;
}

.claim-drawer__price {
  font-size: 18px;
  font-weight: 700;
  color: #00b8a9;
  margin: 0;
}

.claim-drawer__price-label {
  font-size: 11px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}

.claim-drawer__info {
  display: flex;
  gap: 12px;
  background: #e6fbfa;
  border-radius: 14px;
  padding: 14px;
}

.claim-drawer__info-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.claim-drawer__info-title {
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
  margin: 0 0 6px;
}

.claim-drawer__info-body {
  font-size: 13px;
  color: #444;
  line-height: 1.5;
  margin: 0;
}

.claim-drawer__features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.claim-drawer__feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #333;
}

.claim-drawer__feature-check {
  width: 22px;
  height: 22px;
  background: #00b8a9;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.claim-drawer__price-box {
  background: #f8f8f8;
  border-radius: 14px;
  padding: 14px 18px;
}

.claim-drawer__price-amount {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
}

.claim-drawer__price-period {
  font-size: 14px;
  color: #888;
}

/* ── Stripe ────────────────────────────────────────────────────────────── */

.stripe-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stripe-section__label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin: 0;
}

.stripe-card-box {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.2s;
}

.stripe-card-box:focus-within {
  border-color: #00b8a9;
}

.stripe-error {
  font-size: 13px;
  color: #e53e3e;
  margin: 0;
}

/* ── Shared ────────────────────────────────────────────────────────────── */

.claim-drawer__error {
  font-size: 13px;
  color: #e53e3e;
  text-align: center;
  margin: 0;
}

.claim-drawer__cta {
  width: 100%;
  background: linear-gradient(135deg, #00b8a9, #00a19a);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.claim-drawer__cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.claim-drawer__spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.claim-drawer__disclaimer {
  font-size: 11px;
  color: #aaa;
  text-align: center;
  margin: 0;
  line-height: 1.5;
}
</style>
