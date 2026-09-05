<template>
  <!-- Earnings — supplier-side dashboard ported from the prototype's
       earnings screen. Sums every released payment + lists the recent
       payouts. Held payments are surfaced separately as "pending". -->
  <div class="er-page mobile-container">
    <div class="er-header">
      <button class="er-back-btn" type="button" aria-label="Back" @click="goBack">‹</button>
      <div class="er-header-title">Earnings</div>
      <span class="er-header-spacer" />
    </div>

    <template v-if="pending">
      <div class="er-loading">Loading earnings…</div>
    </template>

    <template v-else-if="!earnings || !earnings.payoutCount && !earnings.pendingCount">
      <div class="er-empty">
        <div class="er-empty-emoji">💸</div>
        <div class="er-empty-title">No earnings yet</div>
        <div class="er-empty-sub">
          Submit offers on open jobs. Customers see your reviews + completed
          job count - both grow as you finish work here.
        </div>
        <button class="er-empty-btn" type="button" @click="goBrowse">Browse jobs</button>
      </div>
    </template>

    <template v-else>
      <!-- Big "total earned" hero. -->
      <div class="er-hero er-anim-1">
        <div class="er-hero-label">Total earned</div>
        <div class="er-hero-amt">{{ formatMoney(earnings.totalEarned) }}</div>
        <div class="er-hero-sub">
          {{ earnings.payoutCount }} payout{{ earnings.payoutCount === 1 ? '' : 's' }} ·
          avg {{ formatMoney(earnings.averagePayout) }}
        </div>
      </div>

      <!-- Pending row -->
      <div v-if="earnings.pendingCount > 0" class="er-pending er-anim-2">
        <div class="er-pending-icon">🛡</div>
        <div class="er-pending-body">
          <div class="er-pending-title">
            {{ formatMoney(earnings.pendingHeld) }} in escrow
          </div>
          <div class="er-pending-sub">
            {{ earnings.pendingCount }} job{{ earnings.pendingCount === 1 ? '' : 's' }} awaiting release
          </div>
        </div>
      </div>

      <div class="er-section-h">
        <div class="er-section-title">Payouts</div>
        <span class="er-section-link" @click="onRefresh">Refresh</span>
      </div>

      <div class="er-list er-anim-3">
        <button
          v-for="p in payouts"
          :key="p.id"
          class="er-row"
          type="button"
          @click="openJob(p.jobId)"
        >
          <div class="er-row-avatar">{{ p.customerInitials }}</div>
          <div class="er-row-body">
            <div class="er-row-title">{{ p.jobTitle }}</div>
            <div class="er-row-meta">
              <span class="er-row-cat">{{ p.jobCategoryLabel }}</span>
              <span class="er-row-customer">· {{ p.customerName }}</span>
            </div>
          </div>
          <div class="er-row-amt">
            <div class="er-row-amount">{{ formatMoney(p.amount) }}</div>
            <div class="er-row-status" :class="`er-status-${p.status}`">
              {{ p.status === 'released' ? 'Paid' : 'Held' }}
            </div>
          </div>
        </button>
      </div>

      <div style="height: 100px" />
    </template>

    <MarketplaceBottomNav active="projects" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type { MarketplaceEarnings, MarketplacePayout } from '~/composables/useMarketplace'

definePageMeta({ title: 'Earnings - Marketplace', middleware: 'auth' })

const router = useRouter()
const { fetchEarnings, fetchPayouts } = useMarketplace()

const pending = ref(true)
const earnings = ref<MarketplaceEarnings | null>(null)
const payouts = ref<MarketplacePayout[]>([])

async function load() {
  pending.value = true
  try {
    const [e, p] = await Promise.all([
      fetchEarnings(),
      fetchPayouts(),
    ])
    earnings.value = e
    payouts.value = p
  } finally {
    pending.value = false
  }
}
await load()

function formatMoney(pence: number): string {
  const pounds = pence / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: pounds % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(pounds)
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/marketplace')
}
function goBrowse() {
  router.push('/marketplace/browse')
}
function openJob(jobId: string) {
  router.push(`/marketplace/jobs/${jobId}`)
}
function onRefresh() {
  load()
}
</script>

<style scoped>
.er-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

.er-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
}
.er-back-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  color: #231d45;
  font-size: 22px; font-weight: 800; line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.er-header-title {
  flex: 1;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  text-align: center;
}
.er-header-spacer { width: 36px; flex-shrink: 0; }

.er-loading, .er-empty {
  padding: 60px 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7089;
}
.er-empty-emoji { font-size: 40px; margin-bottom: 8px; }
.er-empty-title { font-size: 16px; font-weight: 800; color: #231d45; margin-bottom: 4px; }
.er-empty-sub { margin-bottom: 16px; }
.er-empty-btn {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff; border: none; border-radius: 12px;
  padding: 12px 18px; font-family: inherit; font-size: 13px; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
}

/* ── Hero ────────────────────────────────────────────────────── */
.er-hero {
  margin: 6px 20px 0;
  padding: 22px 18px 18px;
  background: linear-gradient(135deg, #231d45 0%, #352d5c 60%, #231d45 100%);
  color: #fff;
  border-radius: 18px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(35, 29, 69, 0.24);
}
.er-hero::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.22) 0%, transparent 65%);
  pointer-events: none;
}
.er-hero > * { position: relative; z-index: 1; }
.er-hero-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}
.er-hero-amt {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
  color: #fff;
  margin-top: 6px;
}
.er-hero-sub {
  font-size: 12px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}

/* ── Pending strip ──────────────────────────────────────────── */
.er-pending {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 20px 0;
  padding: 12px 14px;
  background: linear-gradient(135deg, #f2faf8, #fff);
  border: 1px solid #d4ece2;
  border-radius: 14px;
}
.er-pending-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.er-pending-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.er-pending-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 2px;
}

/* ── Section header ─────────────────────────────────────────── */
.er-section-h {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 20px 20px 10px;
}
.er-section-title { font-size: 14px; font-weight: 800; color: #231d45; letter-spacing: -0.2px; }
.er-section-link { font-size: 12px; font-weight: 700; color: #00a19a; cursor: pointer; }

/* ── Payout rows ────────────────────────────────────────────── */
.er-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.er-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  padding: 12px 14px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.er-row:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(35, 29, 69, 0.1); }
.er-row-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A4566, #231D45);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; letter-spacing: -0.2px;
  flex-shrink: 0;
}
.er-row-body { flex: 1; min-width: 0; }
.er-row-title {
  font-size: 13.5px; font-weight: 800;
  color: #231d45; letter-spacing: -0.2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.er-row-meta {
  font-size: 11px; font-weight: 600;
  color: #6b7089; margin-top: 2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.er-row-amt { flex-shrink: 0; text-align: right; }
.er-row-amount {
  font-size: 15px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: -0.3px;
}
.er-row-status {
  margin-top: 2px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 100px;
  display: inline-block;
}
.er-status-released { background: linear-gradient(135deg, #00a19a, #008a84); color: #fff; }
.er-status-held     { background: #fff7e3; color: #b07a13; }

@keyframes erFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.er-anim-1 { animation: erFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.er-anim-2 { animation: erFadeUp 0.32s 0.13s cubic-bezier(0.22, 1, 0.36, 1) both; }
.er-anim-3 { animation: erFadeUp 0.32s 0.22s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .er-anim-1, .er-anim-2, .er-anim-3 { animation: none; }
}
</style>
