<template>
  <!-- Offers — owner view. Lists every offer received on the job
       (sorted accepted first, then pending newest-first), with
       per-card Accept/Decline. Accepting any pending offer flips
       the job to in_progress and auto-declines the rest. -->
  <div class="of-page mobile-container">
    <div class="of-header">
      <button class="of-back-btn" type="button" aria-label="Back" @click="goBack">‹</button>
      <div class="of-header-title">Review offers</div>
      <span class="of-header-spacer" />
    </div>

    <template v-if="pending">
      <div class="of-loading">Loading offers…</div>
    </template>

    <template v-else-if="forbidden">
      <div class="of-empty">
        <div class="of-empty-emoji">🔒</div>
        <div class="of-empty-title">Not yours to view</div>
        <div class="of-empty-sub">
          Only the customer who posted this job can see its offers.
        </div>
        <button class="of-empty-btn" type="button" @click="goBack">Back</button>
      </div>
    </template>

    <template v-else>
      <!-- Job recap so the user knows what they're reviewing -->
      <div v-if="job" class="of-recap of-anim-1">
        <div class="of-recap-title">{{ job.title }}</div>
        <div class="of-recap-meta">
          Your budget: <b>{{ formatBudget(job.budgetMin) }}<span v-if="job.budgetMax">
            – {{ formatBudget(job.budgetMax) }}</span></b>
        </div>
      </div>

      <div class="of-totals of-anim-1">
        <div class="of-totals-count">
          <b>{{ pendingCount }}</b> {{ pendingCount === 1 ? 'offer' : 'offers' }}
          to review
        </div>
        <span v-if="acceptedOffer" class="of-totals-status accepted">
          Job in progress
        </span>
      </div>

      <div v-if="!offers.length" class="of-no-offers">
        No offers yet. Suppliers will appear here once they quote.
      </div>

      <div class="of-list of-anim-2">
        <div
          v-for="o in offers"
          :key="o.id"
          class="of-card"
          :class="{
            'of-accepted': o.status === 'accepted',
            'of-declined': o.status === 'declined',
          }"
        >
          <div class="of-card-top">
            <div class="of-avatar">{{ o.supplierInitials }}</div>
            <div class="of-supplier">
              <div class="of-supplier-name">{{ o.supplierName }}</div>
              <div class="of-supplier-meta">
                <span class="of-status" :class="`of-status-${o.status}`">
                  {{ statusLabel(o.status) }}
                </span>
                <span class="of-when">· {{ relativeTime(o.createdAt) }}</span>
              </div>
              <!-- Reputation row — only shown once the supplier has
                   at least one review OR one completed job, so brand-
                   new suppliers don't display "0.0 stars" by default. -->
              <div
                v-if="o.supplierReviewCount || o.supplierJobsCompleted"
                class="of-rep"
              >
                <span v-if="o.supplierRating != null" class="of-rep-stars">
                  ⭐ {{ o.supplierRating.toFixed(1) }}
                  <span class="of-rep-count">({{ o.supplierReviewCount }})</span>
                </span>
                <span v-if="o.supplierJobsCompleted" class="of-rep-jobs">
                  · {{ o.supplierJobsCompleted }} job{{ o.supplierJobsCompleted === 1 ? '' : 's' }} done
                </span>
              </div>
            </div>
            <div class="of-price">{{ formatBudget(o.price) }}</div>
          </div>

          <div class="of-message">{{ o.message }}</div>

          <div v-if="o.availableDate" class="of-date">
            📅 Available {{ o.availableDate }}
          </div>

          <div v-if="o.status === 'pending' && !acceptedOffer" class="of-actions">
            <button
              class="of-msg-btn"
              type="button"
              :disabled="busyId !== null"
              aria-label="Message supplier"
              @click="onMessage(o.id)"
            >
              💬
            </button>
            <button
              class="of-decline-btn"
              type="button"
              :disabled="busyId !== null"
              @click="onDecline(o.id)"
            >
              {{ busyId === o.id && busyAction === 'decline' ? '…' : 'Decline' }}
            </button>
            <button
              class="of-accept-btn"
              type="button"
              :disabled="busyId !== null"
              @click="onAccept(o.id)"
            >
              Accept · {{ formatBudget(authorizeTotal(o.price)) }}
            </button>
          </div>
          <div v-else-if="o.status === 'accepted'" class="of-actions">
            <button
              class="of-msg-btn-wide"
              type="button"
              @click="onMessage(o.id)"
            >
              💬 Message
            </button>
            <button
              v-if="payment"
              class="of-receipt-btn"
              type="button"
              @click="openReceipt"
            >
              🛡 Receipt
            </button>
          </div>
        </div>
      </div>

      <div class="of-trust-strip of-anim-3">
        <div class="of-trust-strip-icon">🛡</div>
        <div class="of-trust-strip-text">
          <b>UProtect escrow.</b> Your payment is held safely on the
          platform until you release the funds — usually once you've
          verified the job's been done.
        </div>
      </div>

      <div v-if="opError" class="of-error">{{ opError }}</div>

      <div style="height: 100px" />
    </template>

    <MarketplaceBottomNav active="projects" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type { MarketplaceOffer } from '~/composables/useMarketplace'

definePageMeta({ title: 'Review offers — Marketplace', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { showToast } = useAppToast()
const {
  fetchJob,
  fetchOffers,
  declineOffer,
  openThreadForOffer,
  fetchPaymentForJob,
} = useMarketplace()

const jobId = computed(() => String(route.params.id))

const forbidden = ref(false)
const opError = ref<string | null>(null)
const busyId = ref<string | null>(null)
const busyAction = ref<'accept' | 'decline' | null>(null)

const { data: job } = await useAsyncData(
  () => `mp-offers-job-${jobId.value}`,
  async () => {
    try {
      return await fetchJob(jobId.value)
    } catch {
      return null
    }
  },
)

// Offers themselves — separated so we can re-fetch on accept/decline.
const offers = ref<MarketplaceOffer[]>([])
const payment = ref<Awaited<ReturnType<typeof fetchPaymentForJob>>>(null)
const pending = ref(true)

async function load() {
  pending.value = true
  forbidden.value = false
  try {
    offers.value = await fetchOffers(jobId.value)
    // Best-effort: a payment may or may not exist yet. We render the
    // receipt link only when one is present.
    payment.value = await fetchPaymentForJob(jobId.value).catch(() => null)
  } catch (err: any) {
    if (err?.statusCode === 403 || err?.response?.status === 403) {
      forbidden.value = true
    }
    offers.value = []
  } finally {
    pending.value = false
  }
}
await load()

function openReceipt() {
  if (payment.value) router.push(`/marketplace/payments/${payment.value.id}`)
}

const acceptedOffer = computed(() => offers.value.find((o) => o.status === 'accepted') ?? null)
const pendingCount = computed(() => offers.value.filter((o) => o.status === 'pending').length)

function formatBudget(amount: number): string {
  // Show pence when present (£5.50 includes a fee), drop them when
  // the value is a clean pound (£5). Intl currency formatter does
  // the right thing for both shapes.
  const hasPence = Math.abs(amount * 100 - Math.round(amount * 100)) < 0.0001
    && amount !== Math.floor(amount)
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: hasPence ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

function statusLabel(s: MarketplaceOffer['status']): string {
  switch (s) {
    case 'accepted': return 'Accepted'
    case 'declined': return 'Declined'
    case 'withdrawn': return 'Withdrawn'
    default: return 'Pending'
  }
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.round(ms / 60_000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push(`/marketplace/jobs/${jobId.value}`)
}

// Accept routes to the UProtect authorise flow — the actual server-side
// accept happens once the user enters card details on the next page, so
// a stalled flow here doesn't flip the job to in_progress prematurely.
function onAccept(offerId: string) {
  if (busyId.value) return
  router.push(`/marketplace/payments/authorize-${offerId}`)
}

function authorizeTotal(jobPrice: number): number {
  // Mirrors backend's PLATFORM_FEE_BPS = 1000 (10%). The previous
  // version did the round in pounds (Math.round(5 * 0.1) = 1) which
  // showed "£6" on this accept screen but the authorize page charged
  // £5.50 (computed in pence) — a real mismatch flagged by DF4 audit.
  // Doing the arithmetic in pence and converting back to pounds at
  // the end keeps both sides aligned to the penny.
  const pence = Math.round(jobPrice * 100)
  const totalPence = pence + Math.round((pence * 1000) / 10_000)
  return totalPence / 100
}

async function onMessage(offerId: string) {
  // Opens (or fetches) the thread, then navigates to it. The route's
  // own onMounted fires markThreadRead so the badge clears.
  try {
    const thread = await openThreadForOffer(offerId)
    router.push(`/marketplace/threads/${thread.id}`)
  } catch (err: any) {
    opError.value = err?.data?.message ?? 'Could not open conversation.'
  }
}

async function onDecline(offerId: string) {
  if (busyId.value) return
  busyId.value = offerId
  busyAction.value = 'decline'
  opError.value = null
  try {
    await declineOffer(offerId)
    await load()
  } catch (err: any) {
    opError.value = err?.data?.message ?? 'Could not decline offer.'
  } finally {
    busyId.value = null
    busyAction.value = null
  }
}
</script>

<style scoped>
.of-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

/* ── Header ──────────────────────────────────────────────────── */
.of-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
}
.of-back-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  color: #231d45;
  font-size: 22px; font-weight: 800; line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.of-header-title {
  flex: 1;
  font-size: 16px; font-weight: 800;
  color: #231d45; letter-spacing: -0.3px;
  text-align: center;
}
.of-header-spacer { width: 36px; flex-shrink: 0; }

.of-loading, .of-no-offers {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px; font-weight: 600;
  color: #6b7089;
}
.of-empty {
  padding: 60px 24px;
  text-align: center;
  font-size: 13px; font-weight: 600;
  color: #6b7089;
}
.of-empty-emoji { font-size: 40px; margin-bottom: 8px; }
.of-empty-title { font-size: 16px; font-weight: 800; color: #231d45; margin-bottom: 4px; }
.of-empty-sub { margin-bottom: 16px; }
.of-empty-btn {
  background: #00a19a; color: #fff; border: none; border-radius: 12px;
  padding: 12px 18px; font-family: inherit; font-size: 13px; font-weight: 800;
  cursor: pointer;
}

/* ── Recap card ──────────────────────────────────────────────── */
.of-recap {
  margin: 6px 20px 0;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.of-recap-title {
  font-size: 14px; font-weight: 800;
  color: #231d45; letter-spacing: -0.2px;
}
.of-recap-meta {
  font-size: 11.5px; font-weight: 600;
  color: #6b7089; margin-top: 4px;
}
.of-recap-meta b { color: #231d45; font-weight: 800; }

/* ── Totals row ──────────────────────────────────────────────── */
.of-totals {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 16px 20px 8px;
}
.of-totals-count {
  font-size: 13px; font-weight: 600;
  color: #6b7089;
}
.of-totals-count b { color: #231d45; font-weight: 800; font-size: 18px; margin-right: 4px; }
.of-totals-status {
  font-size: 10.5px; font-weight: 800;
  letter-spacing: 0.4px; text-transform: uppercase;
  padding: 5px 10px;
  border-radius: 100px;
}
.of-totals-status.accepted {
  background: #e5f4f2;
  color: #00635E;
  border: 1px solid #b6e2dd;
}

/* ── Offer cards ─────────────────────────────────────────────── */
.of-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.of-card {
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
  transition: opacity 0.2s, border-color 0.2s;
}
.of-card.of-accepted { border-color: #00a19a; box-shadow: 0 8px 22px rgba(0, 161, 154, 0.18); }
.of-card.of-declined { opacity: 0.55; }

.of-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.of-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A4566, #231D45);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; letter-spacing: -0.2px;
  flex-shrink: 0;
}
.of-supplier { flex: 1; min-width: 0; }
.of-supplier-name {
  font-size: 13.5px; font-weight: 800;
  color: #231d45; letter-spacing: -0.2px;
}
.of-supplier-meta {
  font-size: 11px; font-weight: 600;
  color: #6b7089; margin-top: 2px;
}
.of-status {
  font-size: 9.5px; font-weight: 800;
  letter-spacing: 0.6px; text-transform: uppercase;
  padding: 3px 7px; border-radius: 100px;
}
.of-status-pending  { background: #fff7e3; color: #b07a13; }
.of-status-accepted { background: #e5f4f2; color: #00635E; }
.of-status-declined { background: #f5f6fa; color: #6b7089; }
.of-status-withdrawn { background: #f5f6fa; color: #6b7089; }
.of-when { margin-left: 4px; }
.of-rep {
  font-size: 11px;
  font-weight: 700;
  color: #6b7089;
  margin-top: 3px;
}
.of-rep-stars { color: #b07a13; font-weight: 800; }
.of-rep-count { color: #6b7089; font-weight: 600; margin-left: 2px; }
.of-rep-jobs { color: #6b7089; }
.of-price {
  font-size: 18px; font-weight: 800;
  color: #00a19a; letter-spacing: -0.4px;
}

.of-message {
  font-size: 12.5px; font-weight: 500;
  color: #4a4566; line-height: 1.55;
  margin-top: 10px;
  white-space: pre-wrap;
}
.of-date {
  font-size: 11.5px; font-weight: 700;
  color: #6b7089;
  margin-top: 10px;
}

.of-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
.of-msg-btn {
  flex-shrink: 0;
  width: 44px;
  padding: 11px 0;
  font-family: inherit;
  font-size: 16px;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  color: #00635E;
  border: 1.5px solid #b6e2dd;
}
.of-msg-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.of-msg-btn-wide {
  flex: 1;
  padding: 11px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  color: #00635E;
  border: 1.5px solid #b6e2dd;
}
.of-receipt-btn {
  flex: 1;
  padding: 11px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.of-receipt-btn:hover { filter: brightness(1.05); }
.of-decline-btn, .of-accept-btn {
  flex: 1;
  padding: 11px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  border: none;
  transition: filter 0.15s;
}
.of-decline-btn {
  background: #fff;
  color: #6b7089;
  border: 1.5px solid #e4e5ed;
}
.of-accept-btn {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.of-accept-btn:disabled, .of-decline-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.of-accept-btn:not(:disabled):hover { filter: brightness(1.05); }

/* ── Trust strip ─────────────────────────────────────────────── */
.of-trust-strip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 18px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f2faf8, #fff);
  border: 1px solid #d4ece2;
  border-radius: 14px;
}
.of-trust-strip-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.of-trust-strip-text {
  font-size: 11.5px; font-weight: 500;
  color: #6b7089; line-height: 1.5;
}
.of-trust-strip-text b { font-weight: 800; color: #231d45; }

.of-error {
  margin: 12px 20px 0;
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #c43c3c;
}

/* ── Animations ──────────────────────────────────────────────── */
@keyframes ofFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.of-anim-1 { animation: ofFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.of-anim-2 { animation: ofFadeUp 0.32s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both; }
.of-anim-3 { animation: ofFadeUp 0.32s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .of-anim-1, .of-anim-2, .of-anim-3 { animation: none; }
}
</style>
