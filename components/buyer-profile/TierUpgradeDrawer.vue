<template>
  <Teleport to="body">
    <div v-if="open" class="tu-overlay" @click.self="close">
      <div class="tu-sheet">
        <div class="tu-handle" />

        <!-- ── Step 1: Pick a tier ── -->
        <template v-if="step === 'pick'">
          <div class="tu-eyebrow">Buyer Profile</div>
          <div class="tu-title">Choose your tier</div>
          <div class="tu-sub">
            Higher tiers add verified credentials sellers and agents look for.
            One-off payment — no subscription.
          </div>

          <div class="tu-cards">
            <button
              v-for="t in tiers"
              :key="t.id"
              class="tu-card"
              :class="[t.id.toLowerCase(), { active: selected === t.id }]"
              @click="selected = t.id"
            >
              <div class="tu-corner">{{ t.corner }}</div>
              <div class="tu-badge" :class="`tu-badge--${t.id.toLowerCase()}`">
                {{ t.badge }}
              </div>
              <div class="tu-card-title">{{ t.title }}</div>
              <div class="tu-card-sub">{{ t.sub }}</div>
              <div class="tu-price">
                <template v-if="t.priceGbp === 0">FREE</template>
                <template v-else>£{{ t.priceGbp }}</template>
              </div>
              <ul class="tu-features">
                <li v-for="f in t.features" :key="f.text">
                  <span :class="f.included ? 'tu-check' : 'tu-dash'">
                    {{ f.included ? '✓' : '○' }}
                  </span>
                  {{ f.text }}
                </li>
              </ul>
            </button>
          </div>

          <button
            v-if="selected === 'BASIC'"
            class="tu-cta"
            @click="confirmBasic"
          >
            Continue with Basic <span>→</span>
          </button>
          <button
            v-else
            class="tu-cta"
            :class="{ premium: selected === 'PREMIUM' }"
            @click="goPay"
          >
            Continue with {{ tierName(selected) }} · £{{ tierPrice(selected) }} <span>→</span>
          </button>

          <button class="tu-cancel" @click="close">Cancel</button>
        </template>

        <!-- ── Step 2: Stripe card ── -->
        <template v-else-if="step === 'pay'">
          <div class="tu-eyebrow">Payment · {{ tierName(selected) }} · £{{ tierPrice(selected) }}</div>
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
            :class="{ premium: selected === 'PREMIUM' }"
            :disabled="loading || !cardReady"
            @click="handlePay"
          >
            <template v-if="loading">Processing…</template>
            <template v-else>Pay £{{ tierPrice(selected) }} →</template>
          </button>

          <button class="tu-cancel" :disabled="loading" @click="step = 'pick'">
            ← Choose a different tier
          </button>
        </template>

        <!-- ── Step 3: Success ── -->
        <template v-else-if="step === 'done'">
          <div class="tu-success-emoji">✨</div>
          <div class="tu-title" style="text-align: center">
            {{ tierName(selected) }} unlocked
          </div>
          <div class="tu-sub" style="text-align: center">
            Your buyer profile is now {{ tierName(selected) }}. The new
            credentials will appear on the next step.
          </div>
          <button class="tu-cta" @click="finish">Continue →</button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import type { Stripe as StripeJs, StripeCardElement } from '@stripe/stripe-js'

type TierId = 'BASIC' | 'VERIFIED' | 'PREMIUM'

interface TierFeature { text: string; included: boolean }
interface TierDef {
  id: TierId
  badge: string
  corner: string
  title: string
  sub: string
  priceGbp: number
  features: TierFeature[]
}

const props = defineProps<{
  open: boolean
  /** Tier already on the profile — used to default the picker. */
  currentTier?: TierId | null
}>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'tier-changed', tier: TierId): void
}>()

const config = useRuntimeConfig()
const { createTierCheckout, confirmTierPayment, updateBuyerProfile } =
  useBuyerProfile()

const step = ref<'pick' | 'pay' | 'done'>('pick')
const selected = ref<TierId>('VERIFIED')
const loading = ref(false)
const cardReady = ref(false)
const stripeError = ref('')
const errorMsg = ref('')

let stripeInstance: StripeJs | null = null
let cardElement: StripeCardElement | null = null
let activeClientSecret = ''
let activePaymentIntentId = ''

const tiers: TierDef[] = [
  {
    id: 'BASIC',
    badge: 'BASIC · FREE',
    corner: '○',
    title: 'Identity Verified',
    sub: "Get started — show sellers you're a real, verified buyer.",
    priceGbp: 0,
    features: [
      { text: 'DVS-certified identity check', included: true },
      { text: 'Chain position & timeline', included: true },
      { text: 'Solicitor instructed status', included: true },
      { text: 'Funds & affordability not verified', included: false },
    ],
  },
  {
    id: 'VERIFIED',
    badge: 'VERIFIED · RECOMMENDED',
    corner: '✓',
    title: 'Identity + Funds',
    sub: 'The level most sellers and agents expect. Proves you can buy.',
    priceGbp: 29,
    features: [
      { text: 'Everything in Basic', included: true },
      { text: 'Proof of deposit (open banking)', included: true },
      { text: 'Source of funds + AML clear', included: true },
      { text: 'Affordability score', included: true },
      { text: 'Credit file not included', included: false },
    ],
  },
  {
    id: 'PREMIUM',
    badge: 'PREMIUM · PLATINUM',
    corner: '★',
    title: 'Full Financial Profile',
    sub: 'Maximum strength — lenders can pre-approve faster with this data.',
    priceGbp: 79,
    features: [
      { text: 'Everything in Verified', included: true },
      { text: 'Experian credit file + score', included: true },
      { text: 'Equifax cross-check (two-bureau)', included: true },
      { text: 'Direct lender API access', included: true },
    ],
  },
]

function tierName(t: TierId) {
  return t === 'PREMIUM' ? 'Premium' : t === 'VERIFIED' ? 'Verified' : 'Basic'
}
function tierPrice(t: TierId) {
  return tiers.find((x) => x.id === t)?.priceGbp ?? 0
}

// Default selection — bump up from current tier (Basic → Verified, Verified → Premium).
watch(
  () => props.open,
  (v) => {
    if (!v) return
    const current = props.currentTier ?? 'BASIC'
    selected.value =
      current === 'PREMIUM'
        ? 'PREMIUM'
        : current === 'VERIFIED'
          ? 'PREMIUM'
          : 'VERIFIED'
    step.value = 'pick'
    stripeError.value = ''
    errorMsg.value = ''
  },
)

function close() {
  if (loading.value) return
  emit('close')
}

async function confirmBasic() {
  loading.value = true
  try {
    await updateBuyerProfile({ tier: 'BASIC' as any })
    emit('tier-changed', 'BASIC')
    close()
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Could not save tier.'
  } finally {
    loading.value = false
  }
}

async function goPay() {
  if (selected.value === 'BASIC') {
    confirmBasic()
    return
  }
  errorMsg.value = ''
  stripeError.value = ''
  loading.value = true
  try {
    const { clientSecret } = await createTierCheckout(selected.value)
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
  emit('tier-changed', selected.value)
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
.tu-card.premium.active { border-color: #d4822a; box-shadow: 0 4px 16px rgba(212,130,42,0.18); }
.tu-corner {
  position: absolute; top: 12px; right: 14px; font-size: 18px; font-weight: 900;
}
.tu-card.active .tu-corner { color: #00a19a; }
.tu-card.premium.active .tu-corner { color: #d4822a; }
.tu-badge {
  display: inline-block; padding: 3px 9px; border-radius: 6px;
  font-size: 9px; font-weight: 900; letter-spacing: 1.5px; margin-bottom: 8px;
}
.tu-badge--basic { background: #f5f5f7; color: #6b6783; }
.tu-badge--verified { background: #e6f7f6; color: #00857f; }
.tu-badge--premium { background: #fef3c7; color: #d4822a; }
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
.tu-cta.premium { background: linear-gradient(135deg, #f0b460, #d4822a); }
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
