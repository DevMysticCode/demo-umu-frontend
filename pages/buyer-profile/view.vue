<template>
  <div class="bpv-page">
    <!-- Sticky header -->
    <div class="bpv-header">
      <div class="bpv-header-title">Your Buyer Profile</div>
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
        <div class="bpv-empty-sub">Build your Buyer Profile to share with sellers and agents.</div>
        <button class="bpv-empty-cta" @click="router.push('/buyer-profile')">
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
            <div class="bpv-card-eyebrow">uMovingU · Buyer Profile</div>
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
              <div class="bpv-share-title">Share secure link</div>
              <div class="bpv-share-sub">Open the share sheet or copy the link</div>
            </div>
            <div class="bpv-share-chev">›</div>
          </div>
          <div class="bpv-share-row" @click="downloadPdf">
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
          <div class="bpv-share-row" @click="emailToAgent">
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
        <button class="bpv-edit" @click="router.push('/buyer-profile/build')">
          Edit my Passport
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuyerProfile, type BuyerProfile } from '~/composables/useBuyerProfile'
import { useProfile } from '~/composables/useProfile'
import { useAppToast } from '~/composables/useCustomToast'

const router = useRouter()
const { getBuyerProfile } = useBuyerProfile()
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

// ── Share secure link ────────────────────────────────────────────────────
const shareLink = computed(() =>
  passport.value
    ? `${window.location.origin}/shared-buyer/${passport.value.id}`
    : '',
)

async function shareCopy() {
  if (!passport.value) return
  const link = shareLink.value
  const shareData = {
    title: `${displayName.value} — Buyer Profile`,
    text: `Verified buyer profile via uMovingU. ${financeDisplay.value} · ${chainDisplay.value} · ${budgetDisplay.value}`,
    url: link,
  }
  // Prefer native share sheet on mobile; fall back to clipboard on desktop
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      await (navigator as any).share(shareData)
      return
    }
  } catch (err: any) {
    // User cancelled the share sheet — silently no-op
    if (err?.name === 'AbortError') return
  }
  try {
    await navigator.clipboard.writeText(link)
    showToast({ message: 'Secure link copied to clipboard', iconEmoji: '🔗' })
  } catch {
    // Last-resort: a temporary input + execCommand for legacy browsers
    const ta = document.createElement('textarea')
    ta.value = link
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
      showToast({ message: 'Secure link copied', iconEmoji: '🔗' })
    } catch {
      showToast({ message: link, iconEmoji: '🔗' })
    }
    document.body.removeChild(ta)
  }
}

// ── Generate a print-ready PDF document in a new window ─────────────────
function buildPdfHtml(): string {
  const esc = (v: any) =>
    v == null
      ? ''
      : String(v)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')

  const pp = passport.value!
  const name = esc(displayName.value)
  const link = shareLink.value
  const issued = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const memberSince = memberYear.value

  // Verification badges
  const badges: string[] = []
  if (pp.idDocumentType) badges.push('🪪 ID verified')
  if (pp.fundsType) badges.push('🏦 Funds verified')
  if (pp.solicitorStatus === 'yes') badges.push('⚖️ Solicitor instructed')
  badges.push('✓ uMU verified profile')

  const statementBlock = pp.statement
    ? `<div class="card">
         <div class="card-label">Buyer statement</div>
         <p class="statement">${esc(pp.statement)}</p>
       </div>`
    : ''

  const optionalRows: string[] = []
  if (pp.solicitorStatus) {
    const map: Record<string, string> = {
      yes: 'Solicitor instructed',
      looking: 'Currently looking',
      notsure: 'Not yet',
    }
    optionalRows.push(
      `<tr><td>Solicitor</td><td>${esc(map[pp.solicitorStatus] ?? pp.solicitorStatus)}</td></tr>`,
    )
  }
  if (pp.idDocumentType) {
    const map: Record<string, string> = {
      passport: 'Passport',
      drivingLicence: 'UK driving licence',
      nationalId: 'EU/EEA national ID card',
    }
    optionalRows.push(
      `<tr><td>ID type</td><td>${esc(map[pp.idDocumentType] ?? pp.idDocumentType)}</td></tr>`,
    )
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${name} — Buyer Profile · uMovingU</title>
<style>
  *,*::before,*::after { box-sizing: border-box; }
  @page { size: A4; margin: 18mm 15mm; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif; color: #1a1a2e; margin: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .wrap { max-width: 800px; margin: 0 auto; padding: 28px 32px 40px; }
  .topbar { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid #e8e8f0; margin-bottom: 28px; }
  .brand { font-size: 13px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: #00a19a; }
  .issued { font-size: 11px; color: #6b7280; }
  .hero { background: linear-gradient(135deg, #231d45 0%, #1e1b4b 60%, #312e81 100%); color: #fff; border-radius: 18px; padding: 28px 28px 24px; position: relative; overflow: hidden; margin-bottom: 28px; }
  .hero-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
  .hero-title { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
  .hero-name { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; }
  .hero-sub { font-size: 13px; color: rgba(255,255,255,0.6); margin-top: 4px; }
  .hero-verified { background: rgba(94,234,212,0.15); border: 1px solid rgba(94,234,212,0.3); border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: #5eead4; white-space: nowrap; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .tile { background: rgba(255,255,255,0.07); border-radius: 12px; padding: 14px 16px; }
  .tile-l { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .tile-v { font-size: 17px; font-weight: 800; color: #fff; }
  .tile-v.mint { color: #5eead4; }
  .badges { margin-top: 18px; display: flex; gap: 6px; flex-wrap: wrap; }
  .badge { background: rgba(94,234,212,0.12); border: 1px solid rgba(94,234,212,0.25); border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: #5eead4; }
  .card { background: #f8f7fc; border: 1px solid #e8e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 18px; }
  .card-label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
  table.facts { width: 100%; border-collapse: collapse; }
  table.facts td { padding: 10px 0; font-size: 13px; vertical-align: top; }
  table.facts td:first-child { color: #6b7280; width: 38%; }
  table.facts td:last-child { color: #1a1a2e; font-weight: 600; }
  table.facts tr:not(:last-child) td { border-bottom: 1px solid #ebebf2; }
  .statement { font-size: 13px; line-height: 1.65; color: #1a1a2e; margin: 0; white-space: pre-wrap; font-style: italic; }
  .footer { margin-top: 32px; padding-top: 18px; border-top: 1px solid #e8e8f0; font-size: 10.5px; color: #6b7280; line-height: 1.55; }
  .footer .link { color: #00a19a; word-break: break-all; }
  .actions { position: fixed; top: 14px; right: 14px; display: flex; gap: 8px; z-index: 100; }
  .actions button { font: inherit; cursor: pointer; padding: 9px 14px; border-radius: 10px; border: 1px solid #e8e8f0; background: #fff; color: #1a1a2e; font-size: 13px; font-weight: 700; box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
  .actions button.primary { background: #00a19a; color: #fff; border-color: #00a19a; }
  @media print { .actions { display: none; } body { background: #fff; } }
</style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()" class="primary">Save as PDF</button>
    <button onclick="window.close()">Close</button>
  </div>
  <div class="wrap">
    <div class="topbar">
      <div class="brand">uMovingU · Buyer Profile</div>
      <div class="issued">Issued ${issued}</div>
    </div>
    <div class="hero">
      <div class="hero-eyebrow">Verified Buyer</div>
      <div class="hero-title">
        <div>
          <div class="hero-name">${name}</div>
          <div class="hero-sub">uMU member since ${memberSince}</div>
        </div>
        <div class="hero-verified">✓ Verified</div>
      </div>
      <div class="grid">
        <div class="tile">
          <div class="tile-l">Budget</div>
          <div class="tile-v">${esc(budgetDisplay.value)}</div>
        </div>
        <div class="tile">
          <div class="tile-l">Finance</div>
          <div class="tile-v mint">${esc(financeDisplay.value)}</div>
        </div>
        <div class="tile">
          <div class="tile-l">Chain</div>
          <div class="tile-v mint">${esc(chainDisplay.value)}</div>
        </div>
        <div class="tile">
          <div class="tile-l">Timeline</div>
          <div class="tile-v">${esc(timelineDisplay.value)}</div>
        </div>
      </div>
      <div class="badges">${badges.map((b) => `<span class="badge">${esc(b)}</span>`).join('')}</div>
    </div>

    ${
      optionalRows.length
        ? `<div class="card">
             <div class="card-label">Verification details</div>
             <table class="facts"><tbody>${optionalRows.join('')}</tbody></table>
           </div>`
        : ''
    }
    ${statementBlock}

    <div class="footer">
      <strong>About this Profile.</strong> This Buyer Profile was generated by uMovingU on ${issued}.
      It confirms the holder has provided verified identity documents, proof of funds and
      chain position via the uMovingU platform. To verify authenticity in real time visit:
      <span class="link">${esc(link)}</span>.<br /><br />
      © uMovingU · Verified buyer information for the UK property market.
    </div>
  </div>
  <script>setTimeout(function(){ try { window.print(); } catch(e){} }, 350);<\/script>
</body>
</html>`
}

function downloadPdf() {
  if (!passport.value) return
  const html = buildPdfHtml()
  const w = window.open('', '_blank', 'width=900,height=1100')
  if (!w) {
    showToast({
      message: 'Pop-ups blocked — allow pop-ups and try again',
      iconEmoji: '⚠️',
    })
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  showToast({ message: 'Opening printable Profile…', iconEmoji: '📄' })
}

function emailToAgent() {
  if (!passport.value) return
  const subject = encodeURIComponent(
    `${displayName.value} — verified Buyer Profile`,
  )
  const body = encodeURIComponent(
    `Hi,\n\nPlease find my verified Buyer Profile from uMovingU below.\n\n` +
      `Name: ${displayName.value}\n` +
      `Budget: ${budgetDisplay.value}\n` +
      `Finance: ${financeDisplay.value}\n` +
      `Chain: ${chainDisplay.value}\n` +
      `Timeline: ${timelineDisplay.value}\n\n` +
      `Verify in real time: ${shareLink.value}\n\n` +
      `Best,\n${displayName.value}`,
  )
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

onMounted(async () => {
  try {
    await Promise.all([
      getBuyerProfile().then((pp) => {
        passport.value = pp
      }),
      fetchProfile().catch(() => null),
    ])
    profileData.value = profile.value
    if (!passport.value) {
      // Nothing built yet — send them to the intro
      router.replace('/buyer-profile')
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
