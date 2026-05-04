<template>
  <div class="bp-page mobile-container">
    <!-- Nav bar -->
    <div class="bp-nav-bar">
      <button class="bp-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="bp-nav-title">Buyer Profile</div>
      <button class="bp-nav-action" @click="shareCopy">Share</button>
    </div>

    <main class="bp-body">
      <div class="atm-bg teal" />

      <div v-if="loading" class="bp-loading">Loading your Profile…</div>

      <div v-else-if="!passport" class="bp-empty">
        <div class="bp-empty-ic">📘</div>
        <div class="bp-empty-title">No Profile yet</div>
        <div class="bp-empty-sub">
          Build your Buyer Profile to share with sellers and agents.
        </div>
        <button class="bp-empty-cta" @click="router.push('/buyer-profile')">
          Build my Profile
        </button>
      </div>

      <template v-else>
        <!-- Hero -->
        <div class="bp-hero">
          <div class="bp-greeting">Welcome back{{ firstName ? ', ' + firstName : '' }}</div>
          <div class="bp-title">Your buyer's badge</div>
        </div>

        <!-- Strength gauge -->
        <div class="strength-block">
          <div class="strength-gauge">
            <svg viewBox="0 0 64 64">
              <circle class="gauge-bg" cx="32" cy="32" r="26" fill="none" stroke-width="6" />
              <circle
                class="gauge-fill"
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="dashArray"
                :stroke-dashoffset="dashOffset"
              />
            </svg>
            <div class="gauge-num">{{ strength }}<small>%</small></div>
          </div>
          <div class="strength-info">
            <div class="strength-label">Profile strength</div>
            <div class="strength-name">{{ strengthName }}</div>
            <div class="strength-tip">{{ strengthTip }}</div>
          </div>
        </div>

        <!-- Signals row -->
        <div class="signals-row">
          <div class="signal-card" :class="{ verified: signals.identity.verified }">
            <div class="sc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <circle cx="9" cy="13" r="2.5" />
                <line x1="14" y1="11" x2="18" y2="11" />
                <line x1="14" y1="14" x2="18" y2="14" />
              </svg>
            </div>
            <div class="sc-content">
              <div class="sc-label">Identity</div>
              <div class="sc-value">{{ signals.identity.label }}</div>
            </div>
          </div>
          <div class="signal-card" :class="{ verified: signals.funds.verified }">
            <div class="sc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 7c0-2-1.6-3.5-4.5-3.5S9 5 9 7c0 4 9 4 9 8 0 2-1.6 3.5-4.5 3.5S9 17 9 15" />
                <line x1="13.5" y1="2" x2="13.5" y2="22" />
              </svg>
            </div>
            <div class="sc-content">
              <div class="sc-label">Funds</div>
              <div class="sc-value">{{ signals.funds.label }}</div>
            </div>
          </div>
          <div class="signal-card" :class="{ verified: signals.chain.verified }">
            <div class="sc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
                <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
              </svg>
            </div>
            <div class="sc-content">
              <div class="sc-label">Chain</div>
              <div class="sc-value">{{ signals.chain.label }}</div>
            </div>
          </div>
          <div class="signal-card" :class="{ verified: signals.mortgage.verified }">
            <div class="sc-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <div class="sc-content">
              <div class="sc-label">Mortgage</div>
              <div class="sc-value">{{ signals.mortgage.label }}</div>
            </div>
          </div>
        </div>

        <!-- Details & documents -->
        <div class="section-heading">Details &amp; documents</div>

        <button class="detail-card" :class="{ verified: signals.identity.verified }" @click="goEdit">
          <div class="dc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="6" width="18" height="14" rx="2" />
              <circle cx="9" cy="13" r="2.5" />
              <line x1="14" y1="11" x2="18" y2="11" />
              <line x1="14" y1="14" x2="18" y2="14" />
            </svg>
          </div>
          <div class="dc-content">
            <div class="dc-title">
              Identity Verification
              <span v-if="signals.identity.verified" class="verified-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Verified
              </span>
              <span v-else class="warning-pill">Add doc</span>
            </div>
            <div class="dc-sub">{{ identitySub }}</div>
          </div>
          <div class="dc-arrow">›</div>
        </button>

        <button class="detail-card" :class="{ verified: signals.funds.verified, warm: !signals.funds.verified }" @click="goEdit">
          <div class="dc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 7c0-2-1.6-3.5-4.5-3.5S9 5 9 7c0 4 9 4 9 8 0 2-1.6 3.5-4.5 3.5S9 17 9 15" />
              <line x1="13.5" y1="2" x2="13.5" y2="22" />
            </svg>
          </div>
          <div class="dc-content">
            <div class="dc-title">
              Proof of Funds
              <span v-if="signals.funds.verified" class="verified-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Verified
              </span>
              <span v-else class="warning-pill">Add doc</span>
            </div>
            <div class="dc-sub">{{ fundsSub }}</div>
          </div>
          <div class="dc-arrow">›</div>
        </button>

        <button class="detail-card" :class="{ warm: !signals.mortgage.verified }" @click="goEdit">
          <div class="dc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <div class="dc-content">
            <div class="dc-title">
              Mortgage in principle
              <span v-if="!signals.mortgage.verified" class="warning-pill">Add doc</span>
            </div>
            <div class="dc-sub">{{ mortgageSub }}</div>
          </div>
          <div class="dc-arrow">›</div>
        </button>

        <button class="detail-card" @click="goEdit">
          <div class="dc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
            </svg>
          </div>
          <div class="dc-content">
            <div class="dc-title">Chain Position</div>
            <div class="dc-sub">{{ chainSub }}</div>
          </div>
          <div class="dc-arrow">›</div>
        </button>

        <button class="detail-card" @click="goEdit">
          <div class="dc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div class="dc-content">
            <div class="dc-title">Buying Stage</div>
            <div class="dc-sub">{{ stageSub }}</div>
          </div>
          <div class="dc-arrow">›</div>
        </button>

        <!-- Shareable card -->
        <div class="section-heading">Your shareable card</div>

        <button class="share-card" @click="shareCopy">
          <div class="share-card-label">UMU Buyer · {{ strength }}% strength</div>
          <div class="share-card-title">{{ shareTagline }}</div>
          <div class="share-card-name">{{ displayName }}</div>
          <div class="share-card-tags">
            <span v-for="tag in shareTags" :key="tag" class="sct">{{ tag }}</span>
          </div>
          <div class="share-card-cta">
            <span>Tap to share with sellers</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
        </button>

        <!-- Secondary actions -->
        <div class="bp-actions">
          <button class="bp-action-row" @click="downloadPdf">
            <div class="bp-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div class="bp-action-body">
              <div class="bp-action-title">Download as PDF</div>
              <div class="bp-action-sub">Attach to offer letters and emails</div>
            </div>
            <span class="bp-action-chev">›</span>
          </button>
          <button class="bp-action-row" @click="emailToAgent">
            <div class="bp-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22 6 12 13 2 6" />
              </svg>
            </div>
            <div class="bp-action-body">
              <div class="bp-action-title">Send direct to agent</div>
              <div class="bp-action-sub">Email from your UMU account</div>
            </div>
            <span class="bp-action-chev">›</span>
          </button>
          <button class="bp-action-row" @click="goEdit">
            <div class="bp-action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            </div>
            <div class="bp-action-body">
              <div class="bp-action-title">Edit my Profile</div>
              <div class="bp-action-sub">Update your details and documents</div>
            </div>
            <span class="bp-action-chev">›</span>
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useBuyerProfile, type BuyerProfile } from '~/composables/useBuyerProfile'
import { useProfile } from '~/composables/useProfile'
import { useAppToast } from '~/composables/useCustomToast'

definePageMeta({ title: 'Buyer Profile — UmovingU', middleware: 'auth' })

const router = useRouter()
const { getBuyerProfile } = useBuyerProfile()
const { fetchProfile, profile } = useProfile()
const { showToast } = useAppToast()

const loading = ref(true)
const passport = ref<BuyerProfile | null>(null)

onMounted(async () => {
  try {
    await Promise.all([
      getBuyerProfile().then((pp) => { passport.value = pp }),
      fetchProfile().catch(() => null),
    ])
    if (!passport.value) {
      router.replace('/buyer-profile')
    }
  } finally {
    loading.value = false
  }
})

const firstName = computed(() => profile.value?.firstName || '')
const displayName = computed(() => {
  const f = profile.value?.firstName
  const l = profile.value?.lastName
  if (f || l) return [f, l].filter(Boolean).join(' ')
  return profile.value?.email?.split('@')[0] || 'Buyer'
})

// Strength: ID verified (35) + Funds known (25) + Chain known (20) + Timeline (10) + Statement (10)
const strength = computed(() => {
  const p = passport.value
  if (!p) return 0
  let s = 0
  if (p.idDocumentType) s += 35
  if (p.fundsType) s += 25
  if (p.chainPosition) s += 20
  if (p.timeline) s += 10
  if (p.statement) s += 10
  return Math.min(100, s)
})

const dashArray = 163.4
const dashOffset = computed(() => dashArray - (dashArray * strength.value) / 100)

const strengthName = computed(() => {
  const s = strength.value
  if (s >= 90) return 'Trusted Buyer'
  if (s >= 70) return 'Strong Buyer'
  if (s >= 40) return 'Building Profile'
  return 'Just getting started'
})
const strengthTip = computed(() => {
  const s = strength.value
  if (s >= 90) return 'Sellers see you as ready and serious. Great work.'
  if (s >= 70) return 'Almost there — add the last piece to be trusted at a glance.'
  if (s >= 40) return 'Looking good — a few more details and sellers will trust you fast.'
  return 'Add ID, funds and chain to start being trusted by sellers.'
})

const formatBudget = (amt: number | null | undefined): string => {
  if (!amt) return '—'
  if (amt >= 1_000_000) return `£${(amt / 1_000_000).toFixed(1)}M`
  if (amt >= 1000) return `£${Math.round(amt / 1000)}K`
  return `£${amt}`
}

const signals = computed(() => {
  const p = passport.value
  return {
    identity: {
      verified: !!p?.idDocumentType,
      label: p?.idDocumentType ? 'Verified' : 'Add ID',
    },
    funds: {
      verified: !!p?.fundsType && p?.fundsType !== 'mortgage',
      label: p?.fundsAmount ? formatBudget(p.fundsAmount) : (p?.fundsType ? 'Confirmed' : 'Add proof'),
    },
    chain: {
      verified: p?.chainPosition === 'sold' || p?.chainPosition === 'ftb',
      label: chainShort(p?.chainPosition),
    },
    mortgage: {
      verified: p?.fundsType === 'mortgage' && !!p?.fundsDocumentUrl,
      label: p?.fundsType === 'mortgage'
        ? (p?.fundsAmount ? `AIP ${formatBudget(p.fundsAmount)}` : 'Add AIP')
        : (p?.fundsType === 'cash' ? 'Cash buyer' : 'Add AIP'),
    },
  }
})

function chainShort(pos: string | null | undefined): string {
  switch (pos) {
    case 'ftb': return 'First-time'
    case 'sold': return 'Chain free'
    case 'selling': return 'Selling'
    case 'renting': return 'Renting'
    default: return 'Add chain'
  }
}

const identitySub = computed(() => {
  const p = passport.value
  if (!p?.idDocumentType) return 'Upload a passport or driving licence to verify'
  const map: Record<string, string> = {
    passport: 'UK / EU passport',
    drivingLicence: 'UK driving licence',
    nationalId: 'EU national ID',
  }
  return map[p.idDocumentType] || 'Identity document on file'
})
const fundsSub = computed(() => {
  const p = passport.value
  if (!p?.fundsType) return 'Upload a recent bank statement or AIP'
  const amt = p.fundsAmount ? formatBudget(p.fundsAmount) : ''
  if (p.fundsType === 'cash') return `Cash buyer${amt ? ' · ' + amt : ''}`
  if (p.fundsType === 'mortgage') return `Mortgage in principle${amt ? ' · ' + amt : ''}`
  if (p.fundsType === 'help') return 'Help to Buy scheme'
  return amt
})
const mortgageSub = computed(() => {
  const p = passport.value
  if (p?.fundsType === 'cash') return 'Cash buyer · no mortgage needed'
  if (p?.fundsType === 'mortgage' && p?.fundsDocumentUrl) return `AIP letter on file${p.fundsAmount ? ' · ' + formatBudget(p.fundsAmount) : ''}`
  if (p?.fundsType === 'mortgage') return `Add AIP letter${p.fundsAmount ? ' · ' + formatBudget(p.fundsAmount) : ''}`
  return 'Upload your Agreement in Principle'
})
const chainSub = computed(() => {
  const p = passport.value
  switch (p?.chainPosition) {
    case 'ftb': return 'First-time buyer · no chain to break'
    case 'sold': return 'Chain free · ready to move on completion'
    case 'selling': return 'Selling current home in parallel'
    case 'renting': return 'Currently renting · flexible move date'
    default: return 'Tell sellers where you are in your chain'
  }
})
const stageSub = computed(() => {
  const p = passport.value
  switch (p?.timeline) {
    case 'asap': return 'Actively viewing · ready to offer now'
    case '3m': return 'Looking to move within 3 months'
    case '6m': return 'Looking to move within 6 months'
    case 'flex': return 'Flexible move date'
    default: return 'Add your timeline so sellers know your urgency'
  }
})

const shareTagline = computed(() => {
  if (strength.value >= 90) return 'Trusted, ready, chain-free.'
  if (strength.value >= 70) return 'Verified buyer, ready to move.'
  return 'Verified buyer profile.'
})
const shareTags = computed(() => {
  const tags: string[] = []
  if (signals.value.identity.verified) tags.push('ID Verified')
  if (passport.value?.fundsAmount) tags.push(`${formatBudget(passport.value.fundsAmount)} Funds`)
  if (passport.value?.fundsType === 'mortgage') tags.push('AIP held')
  if (signals.value.chain.verified) tags.push(chainShort(passport.value?.chainPosition))
  return tags.slice(0, 3)
})

// ── Share / actions ─────────────────────────────────────────────
const shareLink = computed(() =>
  passport.value && typeof window !== 'undefined'
    ? `${window.location.origin}/shared-buyer/${passport.value.id}`
    : ''
)

async function shareCopy() {
  if (!passport.value) return
  const link = shareLink.value
  const data = {
    title: `${displayName.value} — Buyer Profile`,
    text: `Verified buyer · ${signals.value.funds.label} · ${signals.value.chain.label}`,
    url: link,
  }
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      await (navigator as any).share(data)
      return
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return
  }
  try {
    await navigator.clipboard.writeText(link)
    showToast({ message: 'Secure link copied', iconEmoji: '🔗' })
  } catch {
    showToast({ message: link, iconEmoji: '🔗' })
  }
}

function downloadPdf() {
  if (!passport.value) return
  const link = shareLink.value
  const issued = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const tagsHtml = shareTags.value.map((t) => `<span class="b">${t}</span>`).join('')
  const html = `<!doctype html><html><head><meta charset="utf-8" /><title>${displayName.value} — Buyer Profile</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}@page{size:A4;margin:18mm 15mm}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0e2840;padding:32px 36px}
  .brand{font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#1f7a66;margin-bottom:24px}
  .name{font-size:28px;font-weight:800;letter-spacing:-0.6px;margin-bottom:6px}
  .meta{font-size:13px;color:#4a5868;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
  .tile{background:#f1f9f4;border-radius:14px;padding:14px 16px}
  .tile-l{font-size:10px;font-weight:800;color:#4a5868;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:4px}
  .tile-v{font-size:17px;font-weight:800;color:#0e2840}
  .badges{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}
  .b{background:#0e2840;color:#fff;border-radius:100px;padding:5px 12px;font-size:11px;font-weight:800}
  .footer{margin-top:32px;padding-top:18px;border-top:1px solid #e8eceb;font-size:10.5px;color:#4a5868;line-height:1.6}
  .actions{position:fixed;top:14px;right:14px;display:flex;gap:8px}
  .actions button{font:inherit;cursor:pointer;padding:9px 14px;border-radius:10px;border:1px solid #e8eceb;background:#fff;font-weight:700}
  .actions .p{background:#3dbda3;color:#fff;border-color:#3dbda3}
  @media print{.actions{display:none}}
</style></head><body>
<div class="actions"><button class="p" onclick="window.print()">Save as PDF</button><button onclick="window.close()">Close</button></div>
<div class="brand">UMovingU · Buyer Profile</div>
<div class="name">${displayName.value}</div>
<div class="meta">Verified buyer · Issued ${issued}</div>
<div class="grid">
  <div class="tile"><div class="tile-l">Strength</div><div class="tile-v">${strength.value}% · ${strengthName.value}</div></div>
  <div class="tile"><div class="tile-l">Funds</div><div class="tile-v">${signals.value.funds.label}</div></div>
  <div class="tile"><div class="tile-l">Chain</div><div class="tile-v">${signals.value.chain.label}</div></div>
  <div class="tile"><div class="tile-l">Mortgage</div><div class="tile-v">${signals.value.mortgage.label}</div></div>
</div>
<div class="badges">${tagsHtml}</div>
<div class="footer">Generated by UMovingU on ${issued}. Verify in real time at <a>${link}</a>.</div>
<script>setTimeout(function(){try{window.print()}catch(e){}},350);<\/script>
</body></html>`
  const w = window.open('', '_blank', 'width=900,height=1100')
  if (!w) {
    showToast({ message: 'Pop-ups blocked — allow them and retry', iconEmoji: '⚠️' })
    return
  }
  w.document.open(); w.document.write(html); w.document.close()
}

function emailToAgent() {
  if (!passport.value) return
  const subject = encodeURIComponent(`${displayName.value} — verified Buyer Profile`)
  const body = encodeURIComponent(
    `Hi,\n\nPlease find my verified Buyer Profile from UMovingU below.\n\n` +
    `Name: ${displayName.value}\nStrength: ${strength.value}% · ${strengthName.value}\n` +
    `Funds: ${signals.value.funds.label}\nChain: ${signals.value.chain.label}\nMortgage: ${signals.value.mortgage.label}\n\n` +
    `Verify in real time: ${shareLink.value}\n\nBest,\n${displayName.value}`
  )
  window.location.href = `mailto:?subject=${subject}&body=${body}`
}

function goEdit() { router.push('/buyer-profile/build') }
function goBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) window.history.back()
  else router.push('/profile')
}
</script>

<style scoped>
.bp-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}

.bp-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.bp-nav-icon-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
  transition: background 0.2s;
}
.bp-nav-icon-btn:hover { background: #f0f2f1; }
.bp-nav-icon-btn svg { width: 18px; height: 18px; }
.bp-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}
.bp-nav-action {
  font-size: 13px;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: 100px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.1px;
  color: #1f7a66;
  flex-shrink: 0;
}
.bp-nav-action:hover { background: #f1f9f4; }

.bp-body { position: relative; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(61, 189, 163, 0.14), transparent 65%);
}

/* Hero */
.bp-hero { padding: 8px 22px 18px; position: relative; z-index: 1; }
.bp-greeting {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 16px;
  color: #1f7a66;
  margin-bottom: 4px;
}
.bp-title {
  font-size: 32px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1.2px;
  line-height: 1;
}

/* Strength gauge */
.strength-block {
  margin: 0 22px 18px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 18px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}
.strength-gauge {
  width: 76px; height: 76px;
  position: relative;
  flex-shrink: 0;
}
.strength-gauge svg {
  width: 100%; height: 100%;
  transform: rotate(-90deg);
}
.gauge-bg { stroke: #e8eceb; }
.gauge-fill { stroke: #3dbda3; transition: stroke-dashoffset 0.4s ease; }
.gauge-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #0e2840;
  font-feature-settings: 'tnum';
  letter-spacing: -0.5px;
}
.gauge-num small {
  font-size: 9px;
  font-weight: 700;
  color: #4a5868;
  margin-left: 1px;
}
.strength-info { flex: 1; min-width: 0; }
.strength-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 4px;
}
.strength-name {
  font-size: 17px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
  margin-bottom: 4px;
}
.strength-tip {
  font-size: 11.5px;
  font-weight: 600;
  color: #4a5868;
  line-height: 1.4;
}

/* Signals row */
.signals-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 0 22px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}
.signal-card {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.signal-card.verified {
  background: linear-gradient(135deg, #f1f9f4, #e2f1ea);
  border-color: rgba(61, 189, 163, 0.3);
}
.sc-icon {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: rgba(61, 189, 163, 0.18);
  color: #1f7a66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.signal-card.verified .sc-icon {
  background: #1f7a66;
  color: #fff;
}
.sc-icon svg { width: 16px; height: 16px; }
.sc-content { min-width: 0; flex: 1; }
.sc-label {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 1px;
}
.sc-value {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Section heading */
.section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 8px 22px 8px;
  position: relative;
  z-index: 1;
}

/* Detail card */
.detail-card {
  width: calc(100% - 44px);
  margin: 0 22px 8px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  position: relative;
  z-index: 1;
  transition: all 0.15s;
}
.detail-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14, 40, 64, 0.06); }
.detail-card.verified { background: linear-gradient(135deg, #f1f9f4, #e2f1ea); border-color: rgba(61, 189, 163, 0.25); }
.detail-card.warm { background: linear-gradient(135deg, #fdf4dc, #f8e6c2); border-color: rgba(212, 166, 89, 0.32); }
.dc-icon {
  width: 38px; height: 38px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.7);
  color: #1f7a66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.detail-card.warm .dc-icon { color: #6f4d14; }
.dc-icon svg { width: 18px; height: 18px; }
.dc-content { flex: 1; min-width: 0; }
.dc-title {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.2;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.dc-sub {
  font-size: 11px;
  font-weight: 600;
  color: #4a5868;
}
.dc-arrow {
  color: #8a95a0;
  font-size: 18px;
  flex-shrink: 0;
}
.verified-pill {
  background: #1f7a66;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 2px 7px 2px 5px;
  border-radius: 100px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.verified-pill svg { width: 10px; height: 10px; }
.warning-pill {
  background: #6f4d14;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 100px;
}

/* Share card */
.share-card {
  width: calc(100% - 44px);
  margin: 0 22px 14px;
  background:
    radial-gradient(ellipse 60% 60% at 30% 30%, rgba(212, 166, 89, 0.18), transparent 60%),
    linear-gradient(135deg, #143f38, #0f4a3e);
  border: 1px solid rgba(212, 166, 89, 0.4);
  border-radius: 18px;
  padding: 18px 18px 14px;
  position: relative;
  z-index: 1;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  color: #fff;
  overflow: hidden;
}
.share-card-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #d4a659;
  margin-bottom: 12px;
}
.share-card-title {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 22px;
  color: #fff;
  letter-spacing: 0.2px;
  line-height: 1.15;
  margin-bottom: 8px;
}
.share-card-name {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.3px;
  margin-bottom: 14px;
}
.share-card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.sct {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(212, 166, 89, 0.5);
  color: #f5c44c;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.3px;
  padding: 4px 10px;
  border-radius: 100px;
}
.share-card-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid rgba(212, 166, 89, 0.25);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: #d4a659;
}

/* Action rows */
.bp-actions {
  margin: 4px 22px 0;
  position: relative;
  z-index: 1;
}
.bp-action-row {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}
.bp-action-icon {
  width: 36px; height: 36px;
  border-radius: 11px;
  background: #f1f9f4;
  color: #1f7a66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bp-action-icon svg { width: 16px; height: 16px; }
.bp-action-body { flex: 1; min-width: 0; }
.bp-action-title { font-size: 13px; font-weight: 800; color: #0e2840; letter-spacing: -0.2px; }
.bp-action-sub { font-size: 11px; font-weight: 600; color: #4a5868; margin-top: 1px; }
.bp-action-chev { color: #8a95a0; font-size: 18px; flex-shrink: 0; }

/* Loading / empty */
.bp-loading { padding: 60px 22px; text-align: center; color: #8a95a0; font-size: 13px; font-weight: 600; position: relative; z-index: 1; }
.bp-empty {
  text-align: center;
  padding: 60px 22px;
  position: relative;
  z-index: 1;
}
.bp-empty-ic { font-size: 44px; margin-bottom: 10px; }
.bp-empty-title { font-size: 18px; font-weight: 800; color: #0e2840; margin-bottom: 6px; letter-spacing: -0.4px; }
.bp-empty-sub { font-size: 13px; color: #4a5868; margin-bottom: 20px; font-weight: 600; }
.bp-empty-cta {
  border: none;
  background: #3dbda3;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  padding: 12px 22px;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 6px 20px rgba(61, 189, 163, 0.4);
}
</style>
