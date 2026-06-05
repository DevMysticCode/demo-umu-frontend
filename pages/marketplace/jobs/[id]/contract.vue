<template>
  <!-- Live contract — ported 1:1 from the prototype's `screen.contract`
       block. Drives every state from job.status + payment.status:
       offer accepted → payment authorised → work in progress → evidence
       submitted → review & release. Either party can land here; the
       view adapts (release CTA for customers when funds are held,
       review CTA for both once released). -->
  <div class="cn-page mobile-container">
    <div class="cn-header">
      <button class="cn-back-btn" type="button" aria-label="Back" @click="goBack">‹</button>
      <div class="cn-header-title">Job contract</div>
      <span class="cn-header-spacer" />
    </div>

    <template v-if="loading">
      <div class="cn-loading">Loading contract…</div>
    </template>

    <template v-else-if="!contract">
      <div class="cn-empty">Couldn't load this contract.</div>
    </template>

    <template v-else>
      <!-- Contract card (navy gradient, UProtect lockup, job + amounts) -->
      <div class="cn-contract-card cn-anim-1">
        <div class="cn-contract-h">
          <span class="cn-contract-shield">🛡</span>
          UProtect Contract
        </div>
        <div class="cn-contract-title">{{ contract.job.title }}</div>
        <div class="cn-contract-meta">
          📍 {{ contract.job.locationLabel }} · Started {{ formatDate(contract.job.startedAt) }}
        </div>
        <div class="cn-contract-amt-row">
          <div class="cn-contract-amt-tile">
            <div class="cn-contract-amt-label">Job total</div>
            <div class="cn-contract-amt-val">{{ formatMoney(contract.payment.amount) }}</div>
          </div>
          <div class="cn-contract-amt-tile">
            <div class="cn-contract-amt-label">+ UProtect fee</div>
            <div class="cn-contract-amt-val">{{ formatMoney(contract.payment.platformFee) }}</div>
          </div>
        </div>
      </div>

      <!-- Customer + Supplier cards -->
      <div class="cn-duo-cards cn-anim-2">
        <div class="cn-duo-card">
          <div class="cn-duo-card-label">Customer</div>
          <div class="cn-duo-card-avatar">{{ contract.parties.customer.initials }}</div>
          <div class="cn-duo-card-name">{{ contract.parties.customer.name }}</div>
          <div class="cn-duo-card-meta">{{ partyMeta(contract.parties.customer, 'customer') }}</div>
        </div>
        <div class="cn-duo-card">
          <div class="cn-duo-card-label">Supplier</div>
          <div class="cn-duo-card-avatar supplier">{{ contract.parties.supplier.initials }}</div>
          <div class="cn-duo-card-name">{{ contract.parties.supplier.name }}</div>
          <div class="cn-duo-card-meta">{{ partyMeta(contract.parties.supplier, 'supplier') }}</div>
        </div>
      </div>

      <!-- Payment timeline (5 steps) -->
      <div class="cn-step-list cn-anim-3">
        <div class="cn-step-list-h">⏱ Payment timeline</div>
        <div
          v-for="step in timelineSteps"
          :key="step.key"
          class="cn-step-row"
        >
          <div class="cn-step-row-icon" :class="step.state">{{ step.icon }}</div>
          <div class="cn-step-row-text">
            <div class="cn-step-row-title">{{ step.title }}</div>
            <div class="cn-step-row-sub">{{ step.sub }}</div>
          </div>
        </div>
      </div>

      <!-- Evidence trust strip (amber on prototype) -->
      <div class="cn-trust-strip cn-anim-4">
        <div class="cn-trust-strip-icon">📸</div>
        <div class="cn-trust-strip-text">
          <b>Photos are your protection.</b>
          Take clear shots of every area and angle so the whole room is fully
          covered. If the finished work is ever disputed, these are the
          evidence used to resolve it — so take as many as you can.
        </div>
      </div>

      <!-- Existing evidence grid -->
      <div v-if="contract.payment.evidencePhotos.length" class="cn-evidence-grid cn-anim-4">
        <a
          v-for="(url, idx) in contract.payment.evidencePhotos"
          :key="idx"
          :href="resolvePhotoUrl(url)"
          target="_blank"
          rel="noopener noreferrer"
          class="cn-evidence-tile"
          :style="{ backgroundImage: `url(${resolvePhotoUrl(url)})` }"
        />
      </div>

      <!-- CTA row: Message + Upload evidence -->
      <div class="cn-btn-row cn-anim-4">
        <button class="cn-btn-secondary" type="button" @click="openThread">
          💬 Message
        </button>
        <label class="cn-btn-primary" :class="{ uploading }">
          <input
            type="file"
            accept="image/*"
            multiple
            class="cn-file-input"
            @change="onEvidencePicked"
          />
          <span v-if="uploading">Uploading…</span>
          <span v-else>📸 Upload evidence</span>
        </label>
      </div>
      <div v-if="evidenceError" class="cn-error">{{ evidenceError }}</div>

      <!-- Release control — customer only, while held -->
      <div v-if="canRelease" class="cn-release-card cn-anim-4">
        <div class="cn-release-h">Job done?</div>
        <div class="cn-release-sub">
          Releasing transfers <b>{{ formatMoney(contract.payment.amount) }}</b>
          to {{ contract.parties.supplier.name }} and closes the contract.
        </div>
        <div v-if="releaseError" class="cn-error">{{ releaseError }}</div>
        <button
          class="cn-release-btn"
          type="button"
          :disabled="releasing"
          @click="onRelease"
        >
          {{ releasing ? 'Releasing…' : `Release ${formatMoney(contract.payment.amount)}` }}
        </button>
      </div>

      <!-- Released → review prompt (both parties, once each) -->
      <div
        v-if="contract.payment.status === 'released' && !contract.viewerHasReviewed"
        class="cn-release-card cn-anim-4"
      >
        <div class="cn-release-h">⭐ Leave a review</div>
        <div class="cn-release-sub">
          Funds released. Share your experience so the next customer can choose
          with confidence.
        </div>
        <button class="cn-release-btn" type="button" @click="goToReview">
          Write review →
        </button>
      </div>

      <!-- Latest update from the other party -->
      <div v-if="contract.thread?.lastMessage" class="cn-kv-card cn-anim-4">
        <div class="cn-kv-h">
          💬 Latest update from
          {{
            contract.thread.lastMessage.isMine
              ? 'you'
              : contract.thread.lastMessage.senderName.split(' ')[0]
          }}
        </div>
        <div class="cn-kv-body">"{{ contract.thread.lastMessage.body }}"</div>
        <div class="cn-kv-row">
          <span class="cn-kv-label">{{ formatDateTime(contract.thread.lastMessage.createdAt) }}</span>
          <span class="cn-kv-val" @click="openThread">Reply →</span>
        </div>
      </div>

      <!-- Receipt link — always useful as a secondary escape -->
      <button class="cn-receipt-link cn-anim-5" type="button" @click="goToReceipt">
        View payment receipt →
      </button>

      <div style="height: 100px" />
    </template>

    <MarketplaceBottomNav active="projects" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type { MarketplaceContract } from '~/composables/useMarketplace'

definePageMeta({ title: 'Job contract — Marketplace', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { showToast } = useAppToast()
const {
  fetchContract,
  uploadPhoto,
  addEvidence,
  releasePayment,
  openThreadForJob,
  resolvePhotoUrl,
} = useMarketplace()

const jobId = computed(() => String(route.params.id))

const loading = ref(true)
const contract = ref<MarketplaceContract | null>(null)
const uploading = ref(false)
const evidenceError = ref<string | null>(null)
const releasing = ref(false)
const releaseError = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    contract.value = await fetchContract(jobId.value)
  } catch {
    contract.value = null
  } finally {
    loading.value = false
  }
}
await load()

// ── Timeline state derivation ─────────────────────────────────────
// Five fixed steps; each one's `state` is computed from the payment
// status + (for the last step) viewerHasReviewed. Matches the
// prototype's done/active/upcoming idle states.
const timelineSteps = computed(() => {
  const c = contract.value
  if (!c) return []
  const p = c.payment
  const supplierFirst = c.parties.supplier.name.split(' ')[0]
  const hasEvidence = p.evidencePhotos.length > 0

  type State = 'done' | 'active' | 'idle'
  const step = (
    key: string,
    icon: string,
    title: string,
    sub: string,
    state: State,
  ) => ({ key, icon, title, sub, state })

  return [
    step(
      'accepted',
      '✓',
      'Offer accepted',
      `You chose ${supplierFirst} · ${formatDate(c.offer.acceptedAt)}`,
      'done',
    ),
    step(
      'authorised',
      '✓',
      'Payment authorised',
      p.heldAt
        ? `${formatMoney(p.total)} charged & held in UProtect escrow · ${formatDate(p.heldAt)}`
        : `${formatMoney(p.total)} pending — awaiting confirmation`,
      p.status === 'pending' ? 'active' : 'done',
    ),
    step(
      'inprogress',
      '🔨',
      'Work in progress',
      p.status === 'released'
        ? 'Completed'
        : p.status === 'held'
          ? `Supplier started ${formatDate(c.job.startedAt)}`
          : 'Pending payment authorisation',
      p.status === 'held' ? 'active' : p.status === 'released' ? 'done' : 'idle',
    ),
    step(
      'evidence',
      '📸',
      'Evidence submitted',
      hasEvidence
        ? `${p.evidencePhotos.length} photo${p.evidencePhotos.length > 1 ? 's' : ''} uploaded`
        : 'Both parties upload completion photos',
      hasEvidence ? (p.status === 'released' ? 'done' : 'active') : 'idle',
    ),
    step(
      'review',
      '✅',
      'Review & release',
      p.status === 'released'
        ? c.viewerHasReviewed
          ? 'Funds released · review posted'
          : 'Funds released · leave a review'
        : 'Customer releases funds when satisfied',
      p.status === 'released' ? (c.viewerHasReviewed ? 'done' : 'active') : 'idle',
    ),
  ]
})

const canRelease = computed(() => {
  const c = contract.value
  return !!c && c.viewerRole === 'customer' && c.payment.status === 'held'
})

function partyMeta(
  p: { rating: number | null; reviewCount: number; jobsPosted?: number; jobsCompleted?: number },
  side: 'customer' | 'supplier',
): string {
  const star = p.rating != null ? `★ ${p.rating.toFixed(1)}` : 'No rating yet'
  const jobs = side === 'customer' ? p.jobsPosted ?? 0 : p.jobsCompleted ?? 0
  const noun = side === 'customer' ? 'posted' : 'jobs'
  return jobs > 0 ? `${star} · ${jobs} ${noun}` : star
}

// ── Actions ───────────────────────────────────────────────────────
async function onEvidencePicked(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length || !contract.value) return

  evidenceError.value = null
  uploading.value = true
  const uploaded: string[] = []
  try {
    for (const f of files) {
      try {
        const { url } = await uploadPhoto(f)
        uploaded.push(url)
      } catch (err: any) {
        evidenceError.value = err?.data?.message ?? `Couldn't upload ${f.name}`
      }
    }
    if (uploaded.length) {
      const updated = await addEvidence(contract.value.payment.id, uploaded)
      contract.value = { ...contract.value, payment: updated }
      showToast({
        message: `${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} added to evidence`,
        iconEmoji: '📸',
      })
    }
  } finally {
    uploading.value = false
  }
}

async function onRelease() {
  if (!contract.value || releasing.value) return
  releaseError.value = null
  releasing.value = true
  try {
    const updated = await releasePayment(contract.value.payment.id)
    contract.value = {
      ...contract.value,
      payment: { ...contract.value.payment, ...updated },
      job: { ...contract.value.job, status: 'completed' },
    }
    showToast({ message: 'Funds released — job complete', iconEmoji: '✅' })
  } catch (err: any) {
    releaseError.value = err?.data?.message ?? 'Could not release funds.'
  } finally {
    releasing.value = false
  }
}

async function openThread() {
  // openThreadForJob auto-resolves customer vs supplier server-side.
  try {
    const t = await openThreadForJob(jobId.value)
    router.push(`/marketplace/threads/${t.id}`)
  } catch {
    if (contract.value?.thread) router.push(`/marketplace/threads/${contract.value.thread.id}`)
  }
}

function goToReview() {
  router.push(`/marketplace/jobs/${jobId.value}/review`)
}
function goToReceipt() {
  if (contract.value) router.push(`/marketplace/payments/${contract.value.payment.id}`)
}
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/marketplace/projects')
}

// ── Formatters ────────────────────────────────────────────────────
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
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  )
}
</script>

<style scoped>
.cn-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

.cn-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
}
.cn-back-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  color: #231d45;
  font-size: 22px; font-weight: 800; line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.cn-header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  text-align: center;
}
.cn-header-spacer { width: 36px; flex-shrink: 0; }

.cn-loading,
.cn-empty {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}

/* ── Contract card (navy gradient hero) ─────────────────────── */
.cn-contract-card {
  position: relative;
  overflow: hidden;
  margin: 6px 20px 0;
  padding: 18px;
  border-radius: 18px;
  color: #fff;
  background: linear-gradient(140deg, #231D45 0%, #352D5C 60%, #231D45 100%);
  box-shadow: 0 16px 36px -10px rgba(35, 29, 69, 0.4);
}
.cn-contract-card::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.20), transparent 65%);
}
.cn-contract-card > * { position: relative; z-index: 1; }
.cn-contract-h {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.cn-contract-shield {
  width: 20px; height: 20px;
  border-radius: 6px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
}
.cn-contract-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin-bottom: 6px;
}
.cn-contract-meta {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.45;
  margin-bottom: 14px;
}
.cn-contract-amt-row { display: flex; gap: 10px; }
.cn-contract-amt-tile {
  flex: 1;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
}
.cn-contract-amt-label {
  font-size: 9.5px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.70);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.cn-contract-amt-val {
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.3px;
}

/* ── Duo cards (customer + supplier) ──────────────────────── */
.cn-duo-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 20px;
  margin-top: 14px;
}
.cn-duo-card {
  padding: 12px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
  text-align: center;
}
.cn-duo-card-label {
  font-size: 9.5px;
  font-weight: 800;
  color: #6b7089;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 7px;
}
.cn-duo-card-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  margin: 0 auto 6px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cn-duo-card-avatar.supplier {
  background: linear-gradient(135deg, #352D5C, #008A84);
}
.cn-duo-card-name {
  font-size: 12px;
  font-weight: 800;
  color: #231d45;
}
.cn-duo-card-meta {
  font-size: 10.5px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 2px;
}

/* ── Step list (timeline) ─────────────────────────────────── */
.cn-step-list {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.cn-step-list-h {
  font-size: 11px;
  font-weight: 800;
  color: #6b7089;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.cn-step-row {
  display: flex;
  gap: 11px;
  padding: 9px 0;
}
.cn-step-row + .cn-step-row { border-top: 1px dashed #eef0f6; }
.cn-step-row-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f2faf8, #e5f4f2);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  color: #00635E;
}
.cn-step-row-icon.done {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
}
.cn-step-row-icon.active {
  background: linear-gradient(135deg, #FFD58A, #F5A623);
  color: #fff;
  animation: cnPulse 1.6s infinite;
}
@keyframes cnPulse {
  0%   { box-shadow: 0 0 0 0 rgba(245, 166, 35, 0.45); }
  70%  { box-shadow: 0 0 0 8px rgba(245, 166, 35, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 166, 35, 0); }
}
.cn-step-row-text { flex: 1; min-width: 0; padding-top: 2px; }
.cn-step-row-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  line-height: 1.25;
}
.cn-step-row-sub {
  font-size: 11px;
  font-weight: 500;
  color: #6b7089;
  margin-top: 2px;
  line-height: 1.4;
}

/* ── Trust strip (amber, evidence reminder) ──────────────── */
.cn-trust-strip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 14px 20px 0;
  padding: 12px 14px;
  background: #FFF7E3;
  border: 1.5px solid #F5C24A;
  border-radius: 14px;
}
.cn-trust-strip-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #F5A623, #B07A13);
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(245, 166, 35, 0.25);
}
.cn-trust-strip-text {
  flex: 1;
  font-size: 11.5px;
  font-weight: 600;
  color: #6b7089;
  line-height: 1.45;
}
.cn-trust-strip-text b { color: #231d45; font-weight: 800; }

/* ── Evidence grid ─────────────────────────────────────────── */
.cn-evidence-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin: 12px 20px 0;
}
.cn-evidence-tile {
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background-color: #352D5C;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.cn-evidence-tile:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(35, 29, 69, 0.18);
}

/* ── CTA row + buttons ───────────────────────────────────── */
.cn-btn-row {
  display: flex;
  gap: 10px;
  margin: 14px 20px 0;
}
.cn-btn-secondary,
.cn-btn-primary {
  flex: 1;
  padding: 14px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.15s, transform 0.15s, background 0.15s, color 0.15s;
}
.cn-btn-secondary {
  background: #fff;
  color: #231d45;
  border: 1.5px solid #e4e5ed;
}
.cn-btn-secondary:hover {
  border-color: #b6e2dd;
  background: #f2faf8;
  color: #008a84;
}
.cn-btn-primary {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
  position: relative;
  overflow: hidden;
}
.cn-btn-primary:hover { filter: brightness(1.05); }
.cn-btn-primary.uploading { opacity: 0.7; cursor: progress; }
.cn-file-input { display: none; }

/* ── Release card ──────────────────────────────────────────── */
.cn-release-card {
  margin: 14px 20px 0;
  padding: 16px;
  background: linear-gradient(135deg, #f2faf8, #fff);
  border: 1px solid #d4ece2;
  border-radius: 16px;
}
.cn-release-h {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.cn-release-sub {
  font-size: 12px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 4px;
  line-height: 1.5;
}
.cn-release-sub b { color: #231d45; font-weight: 800; }
.cn-release-btn {
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
.cn-release-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
.cn-release-btn:not(:disabled):hover { filter: brightness(1.05); }

/* ── kv card (latest update) ───────────────────────────────── */
.cn-kv-card {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.cn-kv-h {
  font-size: 11px;
  font-weight: 800;
  color: #6b7089;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.cn-kv-body {
  font-size: 13px;
  font-weight: 500;
  color: #231d45;
  line-height: 1.5;
  padding: 6px 0;
}
.cn-kv-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0 0;
  font-size: 12.5px;
  font-weight: 700;
  border-top: 1px solid #f0f1f5;
  margin-top: 4px;
}
.cn-kv-label { color: #6b7089; font-weight: 600; }
.cn-kv-val { color: #008a84; font-weight: 800; cursor: pointer; }

.cn-receipt-link {
  display: block;
  margin: 16px auto 0;
  padding: 8px 16px;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #6b7089;
  cursor: pointer;
}
.cn-receipt-link:hover { color: #008a84; }

.cn-error {
  margin: 10px 20px 0;
  padding: 9px 13px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #c43c3c;
}

/* ── Animations ──────────────────────────────────────────── */
@keyframes cnFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.cn-anim-1 { animation: cnFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.cn-anim-2 { animation: cnFadeUp 0.32s 0.12s cubic-bezier(0.22, 1, 0.36, 1) both; }
.cn-anim-3 { animation: cnFadeUp 0.32s 0.20s cubic-bezier(0.22, 1, 0.36, 1) both; }
.cn-anim-4 { animation: cnFadeUp 0.32s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
.cn-anim-5 { animation: cnFadeUp 0.32s 0.36s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .cn-anim-1, .cn-anim-2, .cn-anim-3, .cn-anim-4, .cn-anim-5 { animation: none; }
  .cn-step-row-icon.active { animation: none; }
}
</style>
