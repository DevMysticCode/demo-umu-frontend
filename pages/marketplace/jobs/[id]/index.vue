<template>
  <!-- Job Detail — ported from the prototype's `screen.jobDetail`.
       Reads job data from `GET /marketplace/jobs/:id`. The CTA at the
       bottom is the persona-specific action: customers see "View
       offers"; suppliers (Step 7) will see "Make an offer". For Step 1
       both are toast-stubbed since offers don't exist yet. -->
  <div class="jd-page mobile-container">
    <template v-if="pending">
      <div class="jd-loading">Loading job…</div>
    </template>

    <template v-else-if="error || !job">
      <AppHeader title="Job" :show-back="true" back-to="/marketplace" />
      <div class="jd-empty">
        <div class="jd-empty-emoji">🤷</div>
        <div class="jd-empty-title">Job not found</div>
        <div class="jd-empty-sub">
          This job may have been completed or removed.
        </div>
        <button class="jd-empty-btn" @click="goBack">Back to marketplace</button>
      </div>
    </template>

    <template v-else>
      <!-- Photo header. Background can be a gradient string from the
           backend; later steps replace this with real EvidencePhoto uploads. -->
      <div class="jd-photo" :style="{ background: headerBackground }">
        <div class="jd-photo-top">
          <button class="jd-back-btn" type="button" @click="goBack">‹</button>
          <div class="jd-photo-actions">
            <button class="jd-back-btn jd-icon" type="button" @click="onSave">♡</button>
            <button class="jd-back-btn jd-icon" type="button" @click="onShare">↗</button>
          </div>
        </div>
        <div class="jd-photo-bottom">
          <span class="jd-photo-counter">📷 {{ totalPhotos }} photo{{ totalPhotos === 1 ? '' : 's' }}</span>
          <span class="jd-photo-pill" :class="`urg-${job.urgency}`">
            {{ urgencyLabel(job.urgency) }}
          </span>
          <span class="jd-photo-pill protected">🛡 UProtect</span>
        </div>
      </div>

      <div class="jd-title-block jd-anim-1">
        <div class="jd-title">{{ job.title }}</div>
        <div class="jd-meta">
          📍 {{ job.locationLabel }} · Posted {{ job.postedAgo }} · {{ job.categoryLabel }}
        </div>
      </div>

      <div class="jd-budget-card jd-anim-1">
        <div>
          <div class="jd-budget-label">Budget range</div>
          <div class="jd-budget-amt">{{ budgetDisplay }}</div>
        </div>
        <div class="jd-budget-side">
          <b>{{ job.offerCount }} offer{{ job.offerCount === 1 ? '' : 's' }}</b><br />
          received
        </div>
      </div>

      <div v-if="job.availableDates.length" class="jd-section jd-anim-2">
        <div class="jd-section-h">📅 Available dates</div>
        <div class="jd-chip-row">
          <span
            v-for="d in job.availableDates"
            :key="d"
            class="jd-chip selected"
          >{{ d }}</span>
        </div>
      </div>

      <div class="jd-section jd-anim-2">
        <div class="jd-section-h">Description</div>
        <div class="jd-desc">{{ job.description }}</div>
      </div>

      <div v-if="thumbnails.length" class="jd-section jd-anim-3">
        <div class="jd-section-h">📷 Photos ({{ thumbnails.length }})</div>
        <div class="jd-thumbs">
          <div
            v-for="(t, idx) in thumbnails"
            :key="idx"
            class="jd-thumb"
            :style="t.isImage ? { backgroundImage: `url(${t.value})` } : { background: t.value }"
          />
        </div>
      </div>

      <!-- Posted-by card is a placeholder until Step 2 wires real
           customer profiles + verified badges. -->
      <div class="jd-section jd-anim-3">
        <div class="jd-section-h">Posted by</div>
        <div class="jd-cust-card">
          <div class="jd-cust-avatar">{{ posterInitials }}</div>
          <div class="jd-cust-info">
            <div class="jd-cust-name">{{ posterName }} <span class="jd-verified">✓</span></div>
            <div class="jd-cust-meta">
              <span v-if="customerStats?.averageRating != null">
                <span class="jd-star">★</span>
                {{ customerStats.averageRating.toFixed(1) }} ·
                {{ customerStats.reviewCount }} review{{ customerStats.reviewCount === 1 ? '' : 's' }}
              </span>
              <span v-else>New customer · no reviews yet</span>
              <span v-if="customerStats?.jobsPosted">
                · {{ customerStats.jobsPosted }} job{{ customerStats.jobsPosted === 1 ? '' : 's' }} posted
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mp-trust-strip jd-anim-4">
        <div class="mp-trust-strip-icon">🛡</div>
        <div class="mp-trust-strip-text">
          <b>Posting is free.</b> You're only charged when you accept an
          offer. Funds held in UProtect escrow until the job's verified
          complete.
        </div>
      </div>

      <div class="jd-cta-row jd-anim-4">
        <!-- Step 5 added UProtect: once a payment exists, the primary
             CTA switches to the receipt (owner sees Release control;
             both parties see the timeline). The pre-payment CTAs only
             fire when no payment row is present. -->
        <!-- Both parties → live contract is the main thing to do
             once a payment exists (timeline, evidence, release CTA). -->
        <button
          v-if="payment"
          class="jd-cta-primary"
          type="button"
          @click="goToContract"
        >
          🛡 Open contract
        </button>
        <button
          v-else-if="job.isMine"
          class="jd-cta-primary"
          type="button"
          @click="goToOffers"
        >
          View {{ job.offerCount }} offer{{ job.offerCount === 1 ? '' : 's' }}
        </button>
        <button
          v-else-if="job.status === 'open'"
          class="jd-cta-primary"
          type="button"
          @click="goToMakeOffer"
        >
          Make an offer
        </button>
        <button
          v-else
          class="jd-cta-primary"
          type="button"
          disabled
        >
          {{ statusCtaLabel }}
        </button>

        <!-- Secondary "Message customer" link for non-owners on any
             open or in-progress job. Lets suppliers ask clarifying
             questions before quoting (or after acceptance). -->
        <button
          v-if="!job.isMine && (job.status === 'open' || job.status === 'in_progress')"
          class="jd-cta-secondary"
          type="button"
          @click="goToMessageCustomer"
        >
          💬 Message customer
        </button>
      </div>

      <div style="height: 100px" />
    </template>

    <MarketplaceBottomNav active="browse" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppHeader from '~/components/core/AppHeader.vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type { MarketplaceJobDetail } from '~/composables/useMarketplace'

definePageMeta({ title: 'Job — Marketplace' })

const route = useRoute()
const router = useRouter()
const { profile } = useProfile()
const { showToast } = useAppToast()
const {
  fetchJob,
  resolvePhotoUrl,
  openThreadForJob,
  fetchPaymentForJob,
  fetchUserStats,
} = useMarketplace()

const jobId = computed(() => String(route.params.id))

// Hard-fail SSR if the job doesn't exist (so it shows a 404-ish state
// rather than a partial render); the template handles both branches.
const { data: job, pending, error } = await useAsyncData<MarketplaceJobDetail | null>(
  () => `mp-job-${jobId.value}`,
  async () => {
    try {
      return await fetchJob(jobId.value)
    } catch {
      return null
    }
  },
)

// Co-fetch the payment row for the job (auth-gated to either party).
// `null` is fine — most jobs won't have a payment yet.
const { data: payment } = await useAsyncData(
  () => `mp-job-payment-${jobId.value}`,
  async () => {
    try {
      return await fetchPaymentForJob(jobId.value)
    } catch {
      return null
    }
  },
)

// Reputation for the customer that posted this job, used by the
// "Posted by" card. Public endpoint — no auth needed.
const { data: customerStats } = await useAsyncData(
  () => `mp-job-customer-stats-${jobId.value}`,
  async () => {
    if (!job.value?.customerId) return null
    try {
      return await fetchUserStats(job.value.customerId)
    } catch {
      return null
    }
  },
  { watch: [() => job.value?.customerId] },
)

const defaultPhotoBg = 'linear-gradient(135deg, #352D5C, #008A84)'

// Prefer the first real uploaded photo as the page header. The legacy
// gradient (`photoBg`) is still used for seeded demo jobs.
const headerBackground = computed<string>(() => {
  const j = job.value
  if (!j) return defaultPhotoBg
  if (j.photos.length) {
    return `linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.05)), url(${resolvePhotoUrl(j.photos[0])}) center/cover no-repeat`
  }
  return j.photoBg ?? defaultPhotoBg
})

// Real uploaded photos take priority over the legacy gradient placeholders
// (kept on seeded demo jobs so the home page has visual variety).
const thumbnails = computed<{ value: string; isImage: boolean }[]>(() => {
  if (!job.value) return []
  if (job.value.photos.length) {
    return job.value.photos.map((u) => ({ value: resolvePhotoUrl(u), isImage: true }))
  }
  return job.value.photoBgs.map((bg) => ({ value: bg, isImage: false }))
})
const totalPhotos = computed(() => {
  if (!job.value) return 1
  return job.value.photos.length || job.value.photoBgs.length || 1
})

const budgetDisplay = computed(() => {
  if (!job.value) return ''
  const min = formatMoney(job.value.budgetMin)
  return job.value.budgetMax ? `${min} – ${formatMoney(job.value.budgetMax)}` : min
})

// For Step 1 the poster info is a placeholder — we surface the
// logged-in user's name as a friendly affordance so the "posted by"
// card isn't empty. Real Customer profiles arrive in Step 2.
const posterName = computed(() => {
  const f = profile.value?.firstName ?? ''
  const l = profile.value?.lastName ?? ''
  return `${f} ${l}`.trim() || 'A verified customer'
})
const posterInitials = computed(() => {
  const f = profile.value?.firstName?.[0] ?? ''
  const l = profile.value?.lastName?.[0] ?? ''
  return (f + l).toUpperCase() || 'U'
})

function urgencyLabel(u: MarketplaceJobDetail['urgency']): string {
  return u === 'urgent' ? 'Urgent' : u === 'flexible' ? 'Flexible' : 'Standard'
}

function formatMoney(n: number): string {
  return `£${new Intl.NumberFormat('en-GB').format(n)}`
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/marketplace')
}

function notImplemented(label: string) {
  showToast({ message: `${label} — coming next step`, iconEmoji: '🚧' })
}

function onSave() { notImplemented('Save job') }
function onShare() { notImplemented('Share job') }
function goToMakeOffer() {
  router.push(`/marketplace/jobs/${jobId.value}/make-offer`)
}
function goToOffers() {
  router.push(`/marketplace/jobs/${jobId.value}/offers`)
}
function goToReceipt() {
  if (payment.value) router.push(`/marketplace/payments/${payment.value.id}`)
}
function goToContract() {
  router.push(`/marketplace/jobs/${jobId.value}/contract`)
}
async function goToMessageCustomer() {
  try {
    const thread = await openThreadForJob(jobId.value)
    router.push(`/marketplace/threads/${thread.id}`)
  } catch (err: any) {
    showToast({
      message: err?.data?.message ?? 'Could not open conversation',
      iconEmoji: '⚠️',
    })
  }
}

const statusCtaLabel = computed(() => {
  if (!job.value) return 'Closed'
  switch (job.value.status) {
    case 'in_progress': return 'Job in progress'
    case 'completed':   return 'Job completed'
    case 'cancelled':   return 'Job cancelled'
    default:            return 'Not accepting offers'
  }
})
</script>

<style scoped>
.jd-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

.jd-loading,
.jd-empty {
  padding: 60px 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}
.jd-empty-emoji { font-size: 40px; margin-bottom: 8px; }
.jd-empty-title { font-size: 16px; font-weight: 800; color: #231d45; margin-bottom: 4px; }
.jd-empty-sub { margin-bottom: 16px; }
.jd-empty-btn {
  background: #00a19a; color: #fff; border: none; border-radius: 12px;
  padding: 12px 18px; font-family: inherit; font-size: 13px; font-weight: 800;
  cursor: pointer;
}

/* ── Photo header (full-bleed, no AppHeader on this screen) ─────── */
.jd-photo {
  position: relative;
  height: 280px;
  background-size: cover;
  background-position: center;
}
.jd-photo-top {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}
.jd-photo-actions { display: flex; gap: 6px; }
.jd-back-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #231d45;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.jd-back-btn.jd-icon { width: 36px; font-size: 16px; }
.jd-photo-bottom {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.jd-photo-counter {
  font-size: 11px; font-weight: 700;
  padding: 5px 10px; border-radius: 100px;
  color: #fff; background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
.jd-photo-pill {
  font-size: 10.5px; font-weight: 800;
  letter-spacing: 0.6px; text-transform: uppercase;
  padding: 5px 10px; border-radius: 100px;
  color: #fff;
  backdrop-filter: blur(4px);
}
.jd-photo-pill.urg-urgent   { background: rgba(231, 76, 94, 0.95); }
.jd-photo-pill.urg-standard { background: rgba(35, 29, 69, 0.85); }
.jd-photo-pill.urg-flexible { background: rgba(0, 161, 154, 0.92); }
.jd-photo-pill.protected {
  background: linear-gradient(135deg, #00a19a, #008a84);
}

/* ── Title block ─────────────────────────────────────────────── */
.jd-title-block {
  padding: 18px 20px 6px;
}
.jd-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.2;
  color: #231d45;
}
.jd-meta {
  font-size: 12px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 6px;
}

/* ── Budget card ─────────────────────────────────────────────── */
.jd-budget-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  padding: 14px 16px;
  margin: 14px 20px 0;
  box-shadow: 0 4px 14px rgba(35, 29, 69, 0.06);
}
.jd-budget-label {
  font-size: 10px; font-weight: 800;
  letter-spacing: 0.8px; text-transform: uppercase;
  color: #6b7089;
}
.jd-budget-amt {
  font-size: 22px; font-weight: 800;
  color: #00a19a; letter-spacing: -0.5px;
  margin-top: 4px;
}
.jd-budget-side {
  font-size: 11px; font-weight: 600;
  color: #6b7089; text-align: right;
  line-height: 1.4;
}
.jd-budget-side b {
  display: block; font-size: 16px;
  font-weight: 800; color: #231d45;
}

/* ── Sections ────────────────────────────────────────────────── */
.jd-section { margin: 18px 20px 0; }
.jd-section-h {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: #231d45;
  margin-bottom: 8px;
}
.jd-desc {
  font-size: 13px;
  font-weight: 500;
  color: #4a4566;
  line-height: 1.55;
}

.jd-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.jd-chip {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e4e5ed;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7089;
}
.jd-chip.selected {
  background: #e5f4f2;
  border-color: #00a19a;
  color: #00635E;
}

.jd-thumbs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.jd-thumb {
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* ── Posted-by ───────────────────────────────────────────────── */
.jd-cust-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.jd-cust-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A4566, #231D45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.2px;
}
.jd-cust-info { flex: 1; min-width: 0; }
.jd-cust-name {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
}
.jd-verified { color: #008A84; }
.jd-cust-meta {
  font-size: 11px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 2px;
}
.jd-star { color: #f5a623; }

/* Trust strip — reuse the styles from home */
.mp-trust-strip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 20px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f2faf8, #fff);
  border: 1px solid #d4ece2;
  border-radius: 14px;
}
.mp-trust-strip-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.28);
}
.mp-trust-strip-text {
  font-size: 11.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.5;
}
.mp-trust-strip-text b { font-weight: 800; color: #231d45; }

/* ── CTA row (sticky-ish at bottom of content) ───────────────── */
.jd-cta-row {
  padding: 18px 20px 0;
}
.jd-cta-primary {
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
.jd-cta-primary:not(:disabled):hover { filter: brightness(1.05); }
.jd-cta-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
  background: linear-gradient(135deg, #c8cad6, #aaadbe);
}
.jd-cta-secondary {
  width: 100%;
  margin-top: 8px;
  background: #fff;
  color: #00635E;
  border: 1.5px solid #b6e2dd;
  border-radius: 14px;
  padding: 13px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s;
}
.jd-cta-secondary:hover { background: #f2faf8; }

/* ── Animations ──────────────────────────────────────────────── */
@keyframes mpFadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
.jd-anim-1 { animation: mpFadeUp 0.4s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.jd-anim-2 { animation: mpFadeUp 0.4s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both; }
.jd-anim-3 { animation: mpFadeUp 0.4s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both; }
.jd-anim-4 { animation: mpFadeUp 0.4s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .jd-anim-1, .jd-anim-2, .jd-anim-3, .jd-anim-4 { animation: none; }
}
</style>
