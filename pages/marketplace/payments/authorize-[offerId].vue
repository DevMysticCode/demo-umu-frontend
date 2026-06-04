<template>
  <!-- Authorise payment — ported from the prototype's `screen.authorise`.
       Step 5 of the rollout. Card form mounts immediately so the user
       can prep their details; the actual offer-accept + PaymentIntent
       creation only happens when they tap "Authorise £X", so abandoning
       the page doesn't accidentally flip the job to in_progress. -->
  <div class="au-page mobile-container">
    <div class="au-header">
      <button class="au-back-btn" type="button" aria-label="Back" @click="goBack">‹</button>
      <div class="au-header-title">Authorise payment</div>
      <span class="au-pill">🛡 UProtect</span>
    </div>

    <template v-if="loadingOffer">
      <div class="au-loading">Loading offer…</div>
    </template>

    <template v-else-if="!offer">
      <div class="au-empty">Couldn't load this offer. It may have been declined.</div>
    </template>

    <template v-else>
      <!-- Hero summary block — explains where the money is going. -->
      <div class="au-hero au-anim-1">
        <div class="au-hero-icon">🛡</div>
        <div class="au-hero-title">Authorise payment</div>
        <div class="au-hero-sub">
          You'll be charged now — but funds are held in escrow until
          the job is verified complete.
        </div>
      </div>

      <!-- Breakdown card. Numbers come from the backend so the page
           and the server can't disagree on the platform fee. -->
      <div class="au-breakdown au-anim-2">
        <div class="au-breakdown-row">
          <span>Job total</span>
          <span>{{ formatMoney(jobTotal) }}</span>
        </div>
        <div class="au-breakdown-row">
          <span>UProtect fee (10%)</span>
          <span>{{ formatMoney(platformFee) }}</span>
        </div>
        <div class="au-breakdown-row total">
          <span>Total charged</span>
          <span class="au-amt">{{ formatMoney(total) }}</span>
        </div>
      </div>

      <!-- "What happens to your money" rail — same copy + cadence as
           the prototype. -->
      <div class="au-steps au-anim-3">
        <div class="au-steps-h">What happens to your money</div>
        <div class="au-step">
          <div class="au-step-icon done">🔒</div>
          <div class="au-step-text">
            <div class="au-step-title">Charged now — held in UProtect escrow</div>
            <div class="au-step-sub">
              Funds are <b>not</b> sent to the supplier yet. Safe with us.
            </div>
          </div>
        </div>
        <div class="au-step">
          <div class="au-step-icon">🔨</div>
          <div class="au-step-text">
            <div class="au-step-title">Supplier completes the work</div>
            <div class="au-step-sub">Photos of finished job + any notes.</div>
          </div>
        </div>
        <div class="au-step">
          <div class="au-step-icon">✅</div>
          <div class="au-step-text">
            <div class="au-step-title">You release the funds</div>
            <div class="au-step-sub">
              Once you're happy, we transfer the held amount to the supplier.
            </div>
          </div>
        </div>
      </div>

      <!-- Card form — Stripe Card Element mounts here. -->
      <div class="au-card-form au-anim-4">
        <div class="au-card-label">Card details</div>
        <div id="mp-stripe-card-element" class="au-card-mount" />
        <div v-if="cardError" class="au-card-error">{{ cardError }}</div>
      </div>

      <div v-if="topError" class="au-error">{{ topError }}</div>

      <div class="au-cta-row au-anim-4">
        <button
          class="au-cta-primary"
          type="button"
          :disabled="!canSubmit || submitting"
          @click="submit"
        >
          {{ submitting ? processingLabel : `Authorise ${formatMoney(total)}` }}
        </button>
      </div>

      <div style="height: 100px" />
    </template>

    <MarketplaceBottomNav active="projects" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'

definePageMeta({ title: 'Authorise payment — Marketplace', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { showToast } = useAppToast()
const { fetchOffer, authorizeOffer, confirmPayment } = useMarketplace()

const offerId = computed(() => String(route.params.offerId))

const loadingOffer = ref(true)
const offer = ref<Awaited<ReturnType<typeof fetchOffer>> | null>(null)
const cardReady = ref(false)
const cardError = ref<string>('')
const topError = ref<string | null>(null)
const submitting = ref(false)
const processingLabel = ref('Processing…')

// Pulled into pence so the breakdown lines up byte-for-byte with the
// server's authoritative calc.
const PLATFORM_FEE_BPS = 1000
const jobTotal = computed(() => (offer.value?.price ?? 0) * 100)
const platformFee = computed(() => Math.round((jobTotal.value * PLATFORM_FEE_BPS) / 10_000))
const total = computed(() => jobTotal.value + platformFee.value)

function formatMoney(pence: number): string {
  const pounds = pence / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: pounds % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(pounds)
}

// Stripe state — kept outside `ref` because the SDK uses class instances
// that don't reactify cleanly.
let stripeInstance: any = null
let cardElement: any = null

async function mountStripe() {
  if (stripeInstance) return
  const { loadStripe } = await import('@stripe/stripe-js')
  stripeInstance = await loadStripe(config.public.stripeKey as string)
  if (!stripeInstance) {
    topError.value = 'Stripe failed to load. Refresh and try again.'
    return
  }
  const elements = stripeInstance.elements()
  cardElement = elements.create('card', {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: '#231d45',
        '::placeholder': { color: '#a8a9ad' },
      },
      invalid: { color: '#e7444c' },
    },
  })
  const mountEl = document.getElementById('mp-stripe-card-element')
  if (mountEl) {
    cardElement.mount(mountEl)
    cardElement.on('change', (e: any) => {
      cardError.value = e.error?.message ?? ''
      cardReady.value = e.complete
    })
  }
}

onMounted(async () => {
  try {
    offer.value = await fetchOffer(offerId.value)
  } catch (err: any) {
    topError.value = err?.data?.message ?? 'Could not load this offer.'
    offer.value = null
  } finally {
    loadingOffer.value = false
  }
  if (offer.value) await mountStripe()
})

onBeforeUnmount(() => {
  if (cardElement) {
    try { cardElement.unmount() } catch { /* ignore */ }
    cardElement = null
  }
})

const canSubmit = computed(() => !!offer.value && cardReady.value && !cardError.value)

async function submit() {
  if (!canSubmit.value || submitting.value || !offer.value) return
  submitting.value = true
  topError.value = null
  cardError.value = ''

  try {
    // 1. Server-side: accept offer + create PaymentIntent. After this
    //    point the job is in_progress and other offers are declined,
    //    so failure here must surface clearly.
    processingLabel.value = 'Reserving offer…'
    const { payment, clientSecret } = await authorizeOffer(offerId.value)

    // 2. Confirm the card via Stripe. If this fails the PaymentIntent
    //    stays unconfirmed and Stripe expires it — the Payment row on
    //    our side stays pending; the customer can retry from the
    //    receipt page.
    processingLabel.value = 'Confirming card…'
    const { error, paymentIntent } = await stripeInstance.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })
    if (error) {
      cardError.value = error.message ?? 'Card was declined.'
      submitting.value = false
      return
    }
    if (paymentIntent?.status !== 'succeeded') {
      cardError.value = 'Payment did not complete. Try again.'
      submitting.value = false
      return
    }

    // 3. Tell the server the card cleared — flips Payment to "held"
    //    and posts the system message into the thread.
    processingLabel.value = 'Securing escrow…'
    await confirmPayment(payment.id)

    showToast({ message: 'Funds held in UProtect escrow', iconEmoji: '🛡' })
    router.replace(`/marketplace/payments/${payment.id}`)
  } catch (err: any) {
    topError.value = err?.data?.message ?? 'Could not authorise payment. Try again.'
    submitting.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/marketplace')
}
</script>

<style scoped>
.au-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

.au-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
}
.au-back-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  color: #231d45;
  font-size: 22px; font-weight: 800; line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.au-header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  text-align: center;
}
.au-pill {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 5px 10px;
  border-radius: 100px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: 1px solid #00a19a;
}

.au-loading, .au-empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}

/* ── Hero block ─────────────────────────────────────────────── */
.au-hero {
  margin: 8px 20px 0;
  padding: 20px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 14px rgba(35, 29, 69, 0.06);
}
.au-hero-icon {
  font-size: 36px;
  margin-bottom: 6px;
}
.au-hero-title {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
  margin-bottom: 4px;
}
.au-hero-sub {
  font-size: 12px;
  font-weight: 600;
  color: #6b7089;
  line-height: 1.5;
}

/* ── Breakdown ──────────────────────────────────────────────── */
.au-breakdown {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.au-breakdown-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}
.au-breakdown-row.total {
  border-top: 1px solid #eef0f6;
  padding-top: 10px;
  margin-top: 4px;
  color: #231d45;
  font-weight: 800;
  font-size: 14px;
}
.au-breakdown-row.total .au-amt {
  font-size: 22px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: -0.5px;
}

/* ── Step list ──────────────────────────────────────────────── */
.au-steps {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.au-steps-h {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #6b7089;
  margin-bottom: 10px;
}
.au-step {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}
.au-step-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: #f5f6fa;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.au-step-icon.done {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
}
.au-step-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
}
.au-step-sub {
  font-size: 11px;
  font-weight: 500;
  color: #6b7089;
  margin-top: 2px;
  line-height: 1.45;
}
.au-step-sub b { color: #231d45; font-weight: 800; }

/* ── Card form ──────────────────────────────────────────────── */
.au-card-form {
  margin: 16px 20px 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.au-card-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #6b7089;
  margin-bottom: 8px;
}
.au-card-mount {
  background: #f5f6fa;
  border: 1px solid #e4e5ed;
  border-radius: 12px;
  padding: 14px;
}
.au-card-error {
  font-size: 11.5px;
  font-weight: 600;
  color: #c43c3c;
  margin-top: 6px;
}

.au-error {
  margin: 12px 20px 0;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #c43c3c;
}

/* ── CTA ────────────────────────────────────────────────────── */
.au-cta-row { padding: 16px 20px 0; }
.au-cta-primary {
  width: 100%;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 15px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
}
.au-cta-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  background: linear-gradient(135deg, #c8cad6, #aaadbe);
}
.au-cta-primary:not(:disabled):hover { filter: brightness(1.05); }

/* ── Animations ─────────────────────────────────────────────── */
@keyframes auFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.au-anim-1 { animation: auFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.au-anim-2 { animation: auFadeUp 0.32s 0.12s cubic-bezier(0.22, 1, 0.36, 1) both; }
.au-anim-3 { animation: auFadeUp 0.32s 0.20s cubic-bezier(0.22, 1, 0.36, 1) both; }
.au-anim-4 { animation: auFadeUp 0.32s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .au-anim-1, .au-anim-2, .au-anim-3, .au-anim-4 { animation: none; }
}
</style>
