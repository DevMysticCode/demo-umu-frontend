<template>
  <div class="bpv-page">
    <!-- Sticky header -->
    <div class="bpv-header">
      <div class="bpv-header-title">Your Buyer Passport</div>
      <button class="bpv-share-btn" @click="shareCopy">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        Share
      </button>
    </div>

    <div class="bpv-scroll">
      <!-- Empty / loading state -->
      <div v-if="loading" class="bpv-loading">Loading your Passport…</div>
      <div v-else-if="!passport" class="bpv-empty">
        <div class="bpv-empty-ic">📘</div>
        <div class="bpv-empty-title">No Passport yet</div>
        <div class="bpv-empty-sub">Build your Buyer Passport to share with sellers and agents.</div>
        <button class="bpv-empty-cta" @click="router.push('/my-passport')">
          Build my Passport
        </button>
      </div>

      <template v-else>
        <!-- ── The Passport Card ── -->
        <div class="bpv-card">
          <div class="bpv-card-bg1" />
          <div class="bpv-card-bg2" />

          <!-- Top row: uMU mark + verified chip -->
          <div class="bpv-card-top">
            <div class="bpv-card-eyebrow">uMovingU · Buyer Passport</div>
            <div class="bpv-verified-chip">✓ Verified</div>
          </div>

          <!-- Avatar + name -->
          <div class="bpv-card-id">
            <div class="bpv-avatar">{{ avatarInitial }}</div>
            <div>
              <div class="bpv-name">{{ displayName }}</div>
              <div class="bpv-meta">Verified buyer · uMU member since {{ memberYear }}</div>
            </div>
          </div>

          <!-- Facts grid -->
          <div class="bpv-facts">
            <div class="bpv-fact">
              <div class="bpv-fact-label">Budget</div>
              <div class="bpv-fact-val">{{ budgetDisplay }}</div>
            </div>
            <div class="bpv-fact">
              <div class="bpv-fact-label">Finance</div>
              <div class="bpv-fact-val bpv-fact-val-teal">{{ financeDisplay }}</div>
            </div>
            <div class="bpv-fact">
              <div class="bpv-fact-label">Chain</div>
              <div class="bpv-fact-val bpv-fact-val-teal">{{ chainDisplay }}</div>
            </div>
            <div class="bpv-fact">
              <div class="bpv-fact-label">Timeline</div>
              <div class="bpv-fact-val">{{ timelineDisplay }}</div>
            </div>
          </div>

          <!-- Verified badges -->
          <div class="bpv-badges">
            <div v-if="passport.idDocumentType" class="bpv-badge">🪪 ID verified</div>
            <div v-if="passport.fundsType" class="bpv-badge">🏦 Funds verified</div>
            <div v-if="passport.solicitorStatus === 'yes'" class="bpv-badge">
              ⚖️ Solicitor instructed
            </div>
          </div>
        </div>

        <!-- ── Share options ── -->
        <div class="bpv-section-title">Share your Passport</div>
        <div class="bpv-share-list">
          <div class="bpv-share-row" @click="shareCopy">
            <div class="bpv-share-ic bpv-share-ic-teal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00a19a" stroke-width="2.2" stroke-linecap="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <div class="bpv-share-body">
              <div class="bpv-share-title">Copy secure link</div>
              <div class="bpv-share-sub">Share with any agent or seller — view only</div>
            </div>
            <div class="bpv-share-chev">›</div>
          </div>
          <div class="bpv-share-row" @click="downloadPdfStub">
            <div class="bpv-share-ic bpv-share-ic-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div class="bpv-share-body">
              <div class="bpv-share-title">Download as PDF</div>
              <div class="bpv-share-sub">Attach to offer letters and emails</div>
            </div>
            <div class="bpv-share-chev">›</div>
          </div>
          <div class="bpv-share-row" @click="emailStub">
            <div class="bpv-share-ic bpv-share-ic-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.2" stroke-linecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22 6 12 13 2 6" />
              </svg>
            </div>
            <div class="bpv-share-body">
              <div class="bpv-share-title">Send direct to agent</div>
              <div class="bpv-share-sub">Email from your uMU account</div>
            </div>
            <div class="bpv-share-chev">›</div>
          </div>
        </div>

        <!-- ── What happens now ── -->
        <div class="bpv-whatnow">
          <div class="bpv-whatnow-title">What happens now</div>
          <div class="bpv-whatnow-row">
            <div class="bpv-whatnow-dot" />
            <span>Your Passport is automatically attached when you register interest in a property</span>
          </div>
          <div class="bpv-whatnow-row">
            <div class="bpv-whatnow-dot" />
            <span>When you tap an owner, they can request to see your Passport before replying</span>
          </div>
          <div class="bpv-whatnow-row">
            <div class="bpv-whatnow-dot" />
            <span>Solicitors and agents can verify your details directly — no repeat document requests</span>
          </div>
        </div>

        <!-- ── Edit / CTAs ── -->
        <button class="bpv-cta" @click="router.push('/explore')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Back to searching
        </button>
        <button class="bpv-edit" @click="router.push('/my-passport/build')">
          Edit my Passport
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuyerPassport, type BuyerPassport } from '~/composables/useBuyerPassport'
import { useProfile } from '~/composables/useProfile'
import { useAppToast } from '~/composables/useCustomToast'

const router = useRouter()
const { getBuyerPassport } = useBuyerPassport()
const { fetchProfile, profile } = useProfile()
const { showToast } = useAppToast()

const loading = ref(true)
const passport = ref<BuyerPassport | null>(null)
const profileData = ref<any>(null)

const displayName = computed(() => {
  if (profileData.value?.firstName || profileData.value?.lastName) {
    return [profileData.value.firstName, profileData.value.lastName].filter(Boolean).join(' ')
  }
  return profileData.value?.email ? profileData.value.email.split('@')[0] : 'Buyer'
})
const avatarInitial = computed(
  () => (displayName.value[0] || 'B').toUpperCase(),
)
const memberYear = computed(() => {
  const c = profileData.value?.createdAt
  if (!c) return new Date().getFullYear()
  return new Date(c).getFullYear()
})

const budgetDisplay = computed(() => {
  const amt = passport.value?.fundsAmount
  if (!amt) return '—'
  if (amt >= 1_000_000) return `Up to £${(amt / 1_000_000).toFixed(1)}m`
  if (amt >= 1000) return `Up to £${Math.round(amt / 1000)}k`
  return `Up to £${amt}`
})
const financeDisplay = computed(() => {
  switch (passport.value?.fundsType) {
    case 'mortgage':
      return 'DIP held'
    case 'cash':
      return 'Cash buyer'
    case 'help':
      return 'Help to Buy'
    default:
      return '—'
  }
})
const chainDisplay = computed(() => {
  switch (passport.value?.chainPosition) {
    case 'ftb':
      return 'First time buyer'
    case 'selling':
      return 'Has property'
    case 'sold':
      return 'Chain-free'
    case 'renting':
      return 'Renting'
    default:
      return '—'
  }
})
const timelineDisplay = computed(() => {
  switch (passport.value?.timeline) {
    case 'asap':
      return 'ASAP'
    case '3m':
      return '3 months'
    case '6m':
      return '6 months'
    case 'flex':
      return 'Flexible'
    default:
      return '—'
  }
})

async function shareCopy() {
  if (!passport.value) return
  const link = `${window.location.origin}/shared-buyer/${passport.value.id}`
  try {
    await navigator.clipboard.writeText(link)
    showToast({ message: 'Copied secure link', iconEmoji: '🔗' })
  } catch {
    showToast({ message: link, iconEmoji: '🔗' })
  }
}

function downloadPdfStub() {
  showToast({ message: 'PDF generation coming soon', iconEmoji: '📄' })
}

function emailStub() {
  showToast({ message: 'Email integration coming soon', iconEmoji: '✉️' })
}

onMounted(async () => {
  try {
    await Promise.all([
      getBuyerPassport().then((pp) => {
        passport.value = pp
      }),
      fetchProfile().catch(() => null),
    ])
    profileData.value = profile.value
    if (!passport.value) {
      // Nothing built yet — send them to the intro
      router.replace('/my-passport')
      return
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bpv-page {
  min-height: 100dvh;
  background: #fff;
  color: #1f2024;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Header ────────────────────────────────────────────── */
.bpv-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 12px;
  padding-top: calc(16px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.bpv-header-title {
  flex: 1;
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.bpv-share-btn {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
}

/* ── Scroll ────────────────────────────────────────────── */
.bpv-scroll {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* ── Loading / empty ───────────────────────────────────── */
.bpv-loading {
  text-align: center;
  padding: 48px 0;
  color: #94a3b8;
  font-size: 13px;
}
.bpv-empty {
  text-align: center;
  padding: 60px 0;
}
.bpv-empty-ic {
  font-size: 44px;
  margin-bottom: 10px;
}
.bpv-empty-title {
  font-size: 16px;
  font-weight: 800;
  color: #1f2024;
  margin-bottom: 4px;
}
.bpv-empty-sub {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 20px;
}
.bpv-empty-cta {
  border: none;
  background: #00a19a;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
}

/* ── Passport card ─────────────────────────────────────── */
.bpv-card {
  background: linear-gradient(135deg, #231d45 0%, #1e1b4b 60%, #312e81 100%);
  border-radius: 22px;
  padding: 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.bpv-card-bg1 {
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 160px;
  height: 160px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}
.bpv-card-bg2 {
  position: absolute;
  right: 30px;
  bottom: 20px;
  width: 80px;
  height: 80px;
  background: rgba(94, 234, 212, 0.06);
  border-radius: 50%;
}
.bpv-card-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.bpv-card-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}
.bpv-verified-chip {
  background: rgba(94, 234, 212, 0.15);
  border: 1px solid rgba(94, 234, 212, 0.3);
  border-radius: 999px;
  padding: 3px 10px;
  font-size: 9px;
  font-weight: 700;
  color: #5eead4;
}
.bpv-card-id {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.bpv-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #00a19a, #0d9488);
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
}
.bpv-name {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}
.bpv-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}
.bpv-facts {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}
.bpv-fact {
  background: rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 12px;
}
.bpv-fact-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}
.bpv-fact-val {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
}
.bpv-fact-val-teal {
  color: #5eead4;
}
.bpv-badges {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.bpv-badge {
  background: rgba(94, 234, 212, 0.12);
  border: 1px solid rgba(94, 234, 212, 0.25);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  color: #5eead4;
}

/* ── Section title ─────────────────────────────────────── */
.bpv-section-title {
  font-size: 13px;
  font-weight: 800;
  color: #1f2024;
  margin-bottom: 12px;
}

/* ── Share list ────────────────────────────────────────── */
.bpv-share-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.bpv-share-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  cursor: pointer;
}
.bpv-share-row:active {
  background: #f8fafc;
}
.bpv-share-ic {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.bpv-share-ic-teal {
  background: #f0fdfa;
}
.bpv-share-ic-amber {
  background: #fef9f0;
}
.bpv-share-ic-purple {
  background: #f5f3ff;
}
.bpv-share-body {
  flex: 1;
}
.bpv-share-title {
  font-size: 13px;
  font-weight: 700;
  color: #1f2024;
}
.bpv-share-sub {
  font-size: 11px;
  color: #94a3b8;
}
.bpv-share-chev {
  color: #94a3b8;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── What happens now ──────────────────────────────────── */
.bpv-whatnow {
  background: #f0fdfa;
  border: 1.5px solid #99f6e4;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 20px;
}
.bpv-whatnow-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 8px;
}
.bpv-whatnow-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #334155;
  line-height: 1.5;
  margin-bottom: 6px;
}
.bpv-whatnow-row:last-child {
  margin-bottom: 0;
}
.bpv-whatnow-dot {
  width: 5px;
  height: 5px;
  background: #00a19a;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

/* ── CTAs ──────────────────────────────────────────────── */
.bpv-cta {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: 14px;
  background: #231d45;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}
.bpv-edit {
  width: 100%;
  border: none;
  padding: 12px;
  border-radius: 14px;
  background: transparent;
  color: #00a19a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
</style>
