<template>
  <!-- Payment receipt + release control. Shown after a successful
       authorise; also reachable from the offers page once funds are
       held. The customer's primary action here is "Release funds"
       once they're satisfied the job is done. -->
  <div class="rc-page mobile-container">
    <div class="rc-header">
      <button class="rc-back-btn" type="button" aria-label="Back" @click="goBack">‹</button>
      <div class="rc-header-title">UProtect receipt</div>
      <span class="rc-pill" :class="`rc-pill-${payment?.status ?? 'pending'}`">
        {{ statusLabel }}
      </span>
    </div>

    <template v-if="loading">
      <div class="rc-loading">Loading payment…</div>
    </template>

    <template v-else-if="!payment">
      <div class="rc-empty">Couldn't load this payment.</div>
    </template>

    <template v-else>
      <!-- Status hero — explains where the money is right now. -->
      <div class="rc-hero rc-anim-1">
        <div class="rc-hero-icon" :class="`rc-hero-icon-${payment.status}`">
          {{ statusIcon }}
        </div>
        <div class="rc-hero-amt">{{ formatMoney(payment.amount) }}</div>
        <div class="rc-hero-label">{{ heroLabel }}</div>
      </div>

      <!-- Breakdown -->
      <div class="rc-card rc-anim-2">
        <div class="rc-card-h">Breakdown</div>
        <div class="rc-row">
          <span>Job total</span>
          <span>{{ formatMoney(payment.amount) }}</span>
        </div>
        <div class="rc-row">
          <span>UProtect fee (10%)</span>
          <span>{{ formatMoney(payment.platformFee) }}</span>
        </div>
        <div class="rc-row total">
          <span>You paid</span>
          <span>{{ formatMoney(payment.total) }}</span>
        </div>
      </div>

      <!-- Timeline -->
      <div class="rc-card rc-anim-3">
        <div class="rc-card-h">Timeline</div>
        <div class="rc-tl-row">
          <div class="rc-tl-dot done" />
          <div class="rc-tl-body">
            <div class="rc-tl-title">Funds held in escrow</div>
            <div class="rc-tl-sub">{{ formatDate(payment.heldAt ?? payment.createdAt) }}</div>
          </div>
        </div>
        <div class="rc-tl-row">
          <div class="rc-tl-dot" :class="{ done: payment.status === 'released' }" />
          <div class="rc-tl-body">
            <div class="rc-tl-title">
              {{ payment.status === 'released' ? 'Released to supplier' : 'Awaiting your release' }}
            </div>
            <div v-if="payment.releasedAt" class="rc-tl-sub">{{ formatDate(payment.releasedAt) }}</div>
          </div>
        </div>
      </div>

      <!-- Release control — only the customer sees this, and only
           while funds are held. -->
      <template v-if="canRelease">
        <div class="rc-release-card rc-anim-4">
          <div class="rc-release-h">Release funds?</div>
          <div class="rc-release-sub">
            Only release once you've checked the job's been done well.
            This transfers <b>{{ formatMoney(payment.amount) }}</b> to the supplier.
          </div>
          <div v-if="releaseError" class="rc-error">{{ releaseError }}</div>
          <button
            class="rc-release-btn"
            type="button"
            :disabled="releasing"
            @click="onRelease"
          >
            {{ releasing ? 'Releasing…' : `Release ${formatMoney(payment.amount)}` }}
          </button>
        </div>
      </template>

      <!-- Review prompt — appears once funds are released, fades out
           once the user has actually posted their review (best-effort
           check via the user's own /reviews list). -->
      <div
        v-if="payment.status === 'released' && !hasReviewed"
        class="rc-release-card rc-anim-4"
      >
        <div class="rc-release-h">⭐ Leave a review</div>
        <div class="rc-release-sub">
          Help others choose with confidence. Your review is public.
        </div>
        <button class="rc-release-btn" type="button" @click="goToReview">
          Write review
        </button>
      </div>

      <!-- Open the live contract for the day-to-day job view. -->
      <button class="rc-contract-link rc-anim-4" type="button" @click="goToContract">
        <span class="rc-contract-link-ic">🛡</span>
        <div class="rc-contract-link-body">
          <div class="rc-contract-link-title">View live contract</div>
          <div class="rc-contract-link-sub">Timeline, evidence and latest updates</div>
        </div>
        <span class="rc-contract-link-arrow">›</span>
      </button>

      <!-- Pending-card note for stranded payments -->
      <div v-if="payment.status === 'pending'" class="rc-trust">
        <div class="rc-trust-icon">⚠️</div>
        <div class="rc-trust-text">
          <b>Card not confirmed.</b>
          Your card didn't complete the charge. Reopen the offer and
          tap Authorise to retry.
        </div>
      </div>

      <div class="rc-trust rc-anim-5">
        <div class="rc-trust-icon">🛡</div>
        <div class="rc-trust-text">
          <b>UProtect escrow.</b>
          The platform holds the funds while the work happens. The
          supplier is only paid once you say the job's done — full
          refund path coming alongside disputes.
        </div>
      </div>

      <div style="height: 100px" />
    </template>

    <MarketplaceBottomNav active="projects" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type { MarketplacePayment } from '~/composables/useMarketplace'

definePageMeta({ title: 'UProtect receipt — Marketplace', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { showToast } = useAppToast()
const { fetchPayment, releasePayment, fetchUserReviews } = useMarketplace()
// Pull fetchProfile from the composable too — the canRelease /
// hasReviewed computeds depend on profile.value.id, and useProfile
// doesn't auto-load on mount. On a fresh page (deep-link / refresh)
// profile stays null and the Release button + review prompt never
// render. Calling fetchProfile() below in the same await chain as
// load() makes the page work without an intermediate visit elsewhere.
const { profile, fetchProfile } = useProfile()

const paymentId = computed(() => String(route.params.id))

const loading = ref(true)
const payment = ref<MarketplacePayment | null>(null)
const releasing = ref(false)
const releaseError = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    // Load both in parallel so the deep-link/refresh case opens
    // with profile.value populated for the canRelease computed.
    const [p] = await Promise.all([
      fetchPayment(paymentId.value),
      profile.value ? Promise.resolve() : fetchProfile(),
    ])
    payment.value = p
  } catch {
    payment.value = null
  } finally {
    loading.value = false
  }
}
await load()

const statusLabel = computed(() => {
  switch (payment.value?.status) {
    case 'held':     return 'In escrow'
    case 'released': return 'Released'
    case 'refunded': return 'Refunded'
    case 'pending':  return 'Pending'
    default:         return '—'
  }
})
const statusIcon = computed(() => {
  switch (payment.value?.status) {
    case 'released': return '✅'
    case 'refunded': return '↩'
    case 'pending':  return '⚠️'
    default:         return '🛡'
  }
})
const heroLabel = computed(() => {
  switch (payment.value?.status) {
    case 'released': return 'Released to supplier'
    case 'refunded': return 'Refunded to you'
    case 'pending':  return 'Card not yet confirmed'
    default:         return 'Held in UProtect escrow'
  }
})

// Customers see Release; suppliers see receipt-only.
const canRelease = computed(() =>
  payment.value?.status === 'held' &&
  payment.value.customerId === profile.value?.id,
)

// Track whether the current user has already left a review on this
// job — drives the prompt visibility. Best-effort; failure leaves
// the prompt visible (worst case the user tries to post twice and
// the backend returns a friendly error).
const hasReviewed = ref(false)
async function checkReviewed() {
  if (!payment.value || !profile.value) return
  const otherUserId = profile.value.id === payment.value.customerId
    ? payment.value.supplierId
    : payment.value.customerId
  try {
    const reviews = await fetchUserReviews(otherUserId)
    hasReviewed.value = reviews.some(
      (r) => r.jobId === payment.value!.jobId && r.fromUserId === profile.value!.id,
    )
  } catch { /* leave hasReviewed false */ }
}
if (payment.value?.status === 'released') await checkReviewed()

function goToReview() {
  if (payment.value) router.push(`/marketplace/jobs/${payment.value.jobId}/review`)
}
function goToContract() {
  if (payment.value) router.push(`/marketplace/jobs/${payment.value.jobId}/contract`)
}

function formatMoney(pence: number): string {
  const pounds = pence / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: pounds % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(pounds)
}
function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

async function onRelease() {
  if (!payment.value || releasing.value) return
  releaseError.value = null
  releasing.value = true
  try {
    payment.value = await releasePayment(payment.value.id)
    showToast({ message: 'Funds released — job complete', iconEmoji: '✅' })
  } catch (err: any) {
    releaseError.value = err?.data?.message ?? 'Could not release funds.'
  } finally {
    releasing.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else if (payment.value) router.push(`/marketplace/jobs/${payment.value.jobId}`)
  else router.push('/marketplace')
}
</script>

<style scoped>
.rc-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

.rc-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
}
.rc-back-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  color: #231d45;
  font-size: 22px; font-weight: 800; line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.rc-header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  text-align: center;
}
.rc-pill {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 100px;
}
.rc-pill-held     { background: #e5f4f2; color: #00635E; border: 1px solid #b6e2dd; }
.rc-pill-released { background: linear-gradient(135deg, #00a19a, #008a84); color: #fff; }
.rc-pill-refunded { background: #f5f6fa; color: #6b7089; border: 1px solid #e4e5ed; }
.rc-pill-pending  { background: #fff7e3; color: #b07a13; border: 1px solid #f5e0a2; }

.rc-loading, .rc-empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}

/* ── Hero ──────────────────────────────────────────────────── */
.rc-hero {
  margin: 8px 20px 0;
  padding: 22px 16px 18px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 18px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(35, 29, 69, 0.08);
}
.rc-hero-icon {
  width: 56px; height: 56px;
  margin: 0 auto 8px;
  border-radius: 18px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
  box-shadow: 0 8px 18px rgba(0, 161, 154, 0.28);
}
.rc-hero-icon-released { background: linear-gradient(135deg, #00a19a, #008a84); }
.rc-hero-icon-pending  { background: linear-gradient(135deg, #f5a623, #b07a13); }
.rc-hero-icon-refunded { background: linear-gradient(135deg, #4A4566, #231D45); }
.rc-hero-amt {
  font-size: 28px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.6px;
}
.rc-hero-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #6b7089;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-top: 4px;
}

/* ── Card sections ─────────────────────────────────────────── */
.rc-card {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.rc-card-h {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #6b7089;
  margin-bottom: 8px;
}
.rc-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
  padding: 5px 0;
}
.rc-row.total {
  border-top: 1px solid #eef0f6;
  padding-top: 9px;
  margin-top: 4px;
  color: #231d45;
  font-weight: 800;
  font-size: 14px;
}

/* ── Timeline ──────────────────────────────────────────────── */
.rc-tl-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 6px 0;
}
.rc-tl-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #d8dae6;
  flex-shrink: 0;
  margin-top: 2px;
}
.rc-tl-dot.done {
  background: linear-gradient(135deg, #00a19a, #008a84);
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.12);
}
.rc-tl-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
}
.rc-tl-sub {
  font-size: 11px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 2px;
}

/* ── Release card ──────────────────────────────────────────── */
.rc-release-card {
  margin: 14px 20px 0;
  padding: 16px;
  background: linear-gradient(135deg, #f2faf8, #fff);
  border: 1px solid #d4ece2;
  border-radius: 16px;
}
.rc-release-h {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.rc-release-sub {
  font-size: 12px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 4px;
  line-height: 1.5;
}
.rc-release-sub b { color: #231d45; font-weight: 800; }
.rc-release-btn {
  width: 100%;
  margin-top: 12px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 13px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
}
.rc-release-btn:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
.rc-release-btn:not(:disabled):hover { filter: brightness(1.05); }

/* ── View-contract link ────────────────────────────────────── */
.rc-contract-link {
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 40px);
  margin: 14px 20px 0;
  padding: 14px;
  background: linear-gradient(135deg, #231d45, #352D5C);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 12px 28px -8px rgba(35, 29, 69, 0.4);
  transition: filter 0.15s, transform 0.15s;
}
.rc-contract-link:hover { filter: brightness(1.05); transform: translateY(-1px); }
.rc-contract-link-ic {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.rc-contract-link-body { flex: 1; min-width: 0; }
.rc-contract-link-title {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.2px;
}
.rc-contract-link-sub {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.72);
  margin-top: 2px;
}
.rc-contract-link-arrow {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  opacity: 0.7;
  flex-shrink: 0;
}

/* ── Trust + error blocks ──────────────────────────────────── */
.rc-trust {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f2faf8, #fff);
  border: 1px solid #d4ece2;
  border-radius: 14px;
}
.rc-trust-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.rc-trust-text {
  font-size: 11.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.5;
}
.rc-trust-text b { font-weight: 800; color: #231d45; }

.rc-error {
  margin-top: 10px;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: #c43c3c;
}

/* ── Animations ──────────────────────────────────────────────── */
@keyframes rcFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.rc-anim-1 { animation: rcFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.rc-anim-2 { animation: rcFadeUp 0.32s 0.12s cubic-bezier(0.22, 1, 0.36, 1) both; }
.rc-anim-3 { animation: rcFadeUp 0.32s 0.20s cubic-bezier(0.22, 1, 0.36, 1) both; }
.rc-anim-4 { animation: rcFadeUp 0.32s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
.rc-anim-5 { animation: rcFadeUp 0.32s 0.36s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .rc-anim-1, .rc-anim-2, .rc-anim-3, .rc-anim-4, .rc-anim-5 { animation: none; }
}
</style>
