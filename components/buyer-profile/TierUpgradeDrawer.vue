<template>
  <Teleport to="body">
    <Transition name="tu" appear>
    <div v-if="open" class="tu-overlay" @click.self="close">
      <div
        class="tu-sheet"
        :style="dragStyle"
        @touchstart.passive="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
      >
        <div class="tu-handle" />

        <!-- ── Step 1: Confirm — single tier, no picking ── -->
        <template v-if="step === 'pick'">
          <div class="tu-eyebrow">Buyer Passport</div>
          <div class="tu-title">Identity Verified</div>
          <div class="tu-sub">
            One-off payment — proves your identity, funds and buying position
            to sellers and agents. No subscription.
          </div>

          <div class="tu-cards">
            <div class="tu-card verified active">
              <div class="tu-corner">✓</div>
              <div class="tu-badge tu-badge--verified">IDENTITY VERIFIED</div>
              <div class="tu-card-title">{{ tier.title }}</div>
              <div class="tu-card-sub">{{ tier.sub }}</div>
              <div class="tu-price">£{{ tier.priceGbp }}</div>
              <ul class="tu-features">
                <li v-for="f in tier.features" :key="f.text">
                  <span class="tu-check">✓</span>
                  {{ f.text }}
                </li>
              </ul>
            </div>
          </div>

          <button class="tu-cta" @click="goPay">
            Pay £{{ tier.priceGbp }} & continue <span>→</span>
          </button>

          <button class="tu-cancel" @click="close">Cancel</button>
        </template>

        <!-- ── Step 2: Stripe card ── -->
        <template v-else-if="step === 'pay'">
          <div class="tu-eyebrow">Payment · {{ tier.title }} · £{{ tier.priceGbp }}</div>
          <div class="tu-title">Card details</div>
          <div class="tu-sub">
            Powered by Stripe. We never see or store your card. UMU is a
            registered UK company.
          </div>

          <div id="tier-stripe-card-element" class="tu-card-element" />
          <div v-if="stripeError" class="tu-err">{{ stripeError }}</div>
          <div v-if="errorMsg" class="tu-err">{{ errorMsg }}</div>

          <button
            class="tu-cta"
            :disabled="loading || !cardReady"
            @click="handlePay"
          >
            <template v-if="loading">Processing…</template>
            <template v-else>Pay £{{ tier.priceGbp }} →</template>
          </button>

          <button class="tu-cancel" :disabled="loading" @click="step = 'pick'">
            ← Back
          </button>
        </template>

        <!-- ── Step 3: Success ── -->
        <template v-else-if="step === 'done'">
          <div class="tu-success-emoji">✨</div>
          <div class="tu-title" style="text-align: center">
            {{ tier.title }} unlocked
          </div>
          <div class="tu-sub" style="text-align: center">
            Your buyer profile is now {{ tier.title }}. The new credentials
            will appear on the next step.
          </div>
          <button class="tu-cta" @click="finish">Continue →</button>
        </template>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import type { Stripe as StripeJs, StripeCardElement } from '@stripe/stripe-js'

// No free tier — VERIFIED ("Identity Verified", £19.99) is the only
// purchasable tier, so there's nothing left to pick between.
type TierId = 'VERIFIED'

interface TierFeature { text: string }
interface TierDef {
  id: TierId
  title: string
  sub: string
  priceGbp: number
  features: TierFeature[]
}

const props = defineProps<{
  open: boolean
  /** Tier already on the profile. Kept for API compatibility with callers;
   *  no longer used to pick between tiers since there's only one. */
  currentTier?: TierId | null
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'tier-changed', tier: TierId): void
}>()

const config = useRuntimeConfig()
const { createTierCheckout, confirmTierPayment } = useBuyerProfile()

const step = ref<'pick' | 'pay' | 'done'>('pick')
const selected: TierId = 'VERIFIED'
const loading = ref(false)
const cardReady = ref(false)
const stripeError = ref('')
const errorMsg = ref('')

let stripeInstance: StripeJs | null = null
let cardElement: StripeCardElement | null = null
let activeClientSecret = ''
let activePaymentIntentId = ''

const tier: TierDef = {
  id: 'VERIFIED',
  title: 'Identity Verified',
  sub: 'The level most sellers and agents expect. Proves who you are and that you can buy.',
  priceGbp: 19.99,
  features: [
    { text: 'DVS-certified identity check' },
    { text: 'Chain position & timeline' },
    { text: 'Solicitor instructed status' },
    { text: 'Proof of deposit (open banking)' },
    { text: 'Source of funds + AML clear' },
    { text: 'Affordability score' },
  ],
}

// Reset to a clean state each time the drawer opens.
watch(
  () => props.open,
  (v) => {
    if (!v) return
    step.value = 'pick'
    stripeError.value = ''
    errorMsg.value = ''
  },
)

function close() {
  if (loading.value) return
  emit('close')
}

const { dragStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeToDismiss({
  onDismiss: close,
  handleSelector: '.tu-handle',
})

async function goPay() {
  errorMsg.value = ''
  stripeError.value = ''
  loading.value = true
  try {
    const { clientSecret } = await createTierCheckout(selected)
    activeClientSecret = clientSecret
    activePaymentIntentId = clientSecret.split('_secret_')[0] || ''
    step.value = 'pay'
    await nextTick()
    await mountStripe()
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Could not start checkout.'
  } finally {
    loading.value = false
  }
}

async function mountStripe() {
  const { loadStripe } = await import('@stripe/stripe-js')
  if (!stripeInstance) {
    stripeInstance = await loadStripe(config.public.stripeKey as string)
  }
  if (!stripeInstance) {
    errorMsg.value = 'Stripe failed to load.'
    return
  }
  const elements = stripeInstance.elements()
  cardElement = elements.create('card', {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        fontFamily: 'inherit',
        color: '#231d45',
        '::placeholder': { color: '#9c98ad' },
      },
      invalid: { color: '#c73e36' },
    },
  })
  const mount = document.getElementById('tier-stripe-card-element')
  if (mount) {
    mount.innerHTML = ''
    cardElement.mount(mount)
    cardElement.on('change', (e) => {
      stripeError.value = e.error?.message ?? ''
      cardReady.value = e.complete
    })
  }
}

async function handlePay() {
  if (!stripeInstance || !cardElement || !activeClientSecret) return
  loading.value = true
  errorMsg.value = ''
  stripeError.value = ''
  try {
    const { error, paymentIntent } = await stripeInstance.confirmCardPayment(
      activeClientSecret,
      { payment_method: { card: cardElement } },
    )
    if (error) {
      stripeError.value = error.message ?? 'Payment failed.'
      return
    }
    if (paymentIntent?.status !== 'succeeded') {
      stripeError.value = `Payment not completed (${paymentIntent?.status ?? 'unknown'}).`
      return
    }
    await confirmTierPayment(paymentIntent.id || activePaymentIntentId)
    step.value = 'done'
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? e?.message ?? 'Payment failed.'
  } finally {
    loading.value = false
  }
}

function finish() {
  emit('tier-changed', selected)
  emit('close')
}

onBeforeUnmount(() => {
  try { cardElement?.unmount() } catch { /* ignore */ }
  cardElement = null
})
</script>

<style scoped>
.tu-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(35, 29, 69, 0.45);
  display: flex; align-items: flex-end; justify-content: center;
  font-family: inherit;
}
.tu-enter-active,
.tu-leave-active {
  transition: background-color 0.28s ease;
}
.tu-enter-active .tu-sheet,
.tu-leave-active .tu-sheet {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0.24, 1);
}
.tu-enter-from,
.tu-leave-to {
  background-color: transparent !important;
}
.tu-enter-from .tu-sheet,
.tu-leave-to .tu-sheet {
  transform: translateY(100%) !important;
}
.tu-sheet {
  background: #fff;
  width: 100%; max-width: 480px;
  border-radius: 22px 22px 0 0;
  padding: 12px 22px 28px;
  max-height: 92vh; overflow-y: auto;
  position: relative;
}
.tu-handle {
  width: 44px; height: 5px;
  background: #ececef; border-radius: 100px;
  margin: 0 auto 14px;
  touch-action: none;
}
.tu-eyebrow {
  font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
  color: #00a19a; text-transform: uppercase;
}
.tu-title {
  font-size: 22px; font-weight: 900; color: #231d45;
  letter-spacing: -0.5px; margin: 4px 0 6px;
}
.tu-sub {
  font-size: 13px; font-weight: 500; color: #6b6783;
  line-height: 1.5; margin-bottom: 16px;
}

.tu-cards { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.tu-card {
  background: #fff; border: 1.5px solid #ececef; border-radius: 14px;
  padding: 14px 16px; text-align: left; cursor: pointer; position: relative;
  font-family: inherit; width: 100%; transition: all 0.15s;
}
.tu-card.active { border-color: #00a19a; box-shadow: 0 4px 16px rgba(0,161,154,0.18); }
.tu-corner {
  position: absolute; top: 12px; right: 14px; font-size: 18px; font-weight: 900;
}
.tu-card.active .tu-corner { color: #00a19a; }
.tu-badge {
  display: inline-block; padding: 3px 9px; border-radius: 6px;
  font-size: 9px; font-weight: 900; letter-spacing: 1.5px; margin-bottom: 8px;
}
.tu-badge--verified { background: #e6f7f6; color: #00857f; }
.tu-card-title { font-size: 14px; font-weight: 800; color: #231d45; }
.tu-card-sub { font-size: 11.5px; font-weight: 500; color: #6b6783; line-height: 1.45; margin-top: 2px; }
.tu-price { font-size: 22px; font-weight: 900; color: #231d45; letter-spacing: -0.5px; margin-top: 8px; }
.tu-features { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 3px; }
.tu-features li { font-size: 11.5px; color: #4a4560; display: flex; gap: 6px; align-items: flex-start; }
.tu-check { color: #00a19a; font-weight: 900; }
.tu-dash { color: #c0bdcc; font-weight: 900; }

.tu-cta {
  width: 100%; padding: 14px 18px; border-radius: 100px;
  background: #00a19a; color: #fff; border: none;
  font-family: inherit; font-size: 14px; font-weight: 800;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 8px; letter-spacing: -0.2px; margin-top: 4px;
}
.tu-cta:disabled { opacity: 0.55; cursor: not-allowed; }
.tu-cancel {
  width: 100%; background: transparent; border: none;
  color: #6b6783; font-size: 12.5px; font-weight: 700;
  padding: 12px; cursor: pointer; margin-top: 8px;
  font-family: inherit;
}

.tu-card-element {
  border: 1.5px solid #ececef; border-radius: 14px;
  padding: 14px 16px; margin: 8px 0 12px;
  background: #fafafa;
}
.tu-err {
  color: #c73e36; font-size: 12px; font-weight: 600;
  margin: 6px 0 12px;
}
.tu-success-emoji { font-size: 56px; text-align: center; margin: 16px 0 8px; }
</style>
