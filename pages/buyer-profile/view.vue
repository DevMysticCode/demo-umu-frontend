<template>
  <div class="bp-page">
    <!-- Top nav: back + "Buyer Passport" + Share -->
    <div class="bp-top-nav">
      <button class="bp-back" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div class="bp-nav-centre">Buyer Profile</div>
      <span class="bp-nav-right" @click="goShare">Share</span>
    </div>

    <!-- Loading / empty -->
    <div v-if="loading" class="bp-loading">Loading your Profile…</div>
    <div v-else-if="!passport" class="bp-empty">
      <div class="bp-empty-ic">📘</div>
      <div class="bp-empty-title">No Profile yet</div>
      <div class="bp-empty-sub">
        Build your Buyer Profile to share with sellers and agents.
      </div>
      <button class="cta-btn" @click="router.push('/buyer-profile')">
        Build my Profile
      </button>
    </div>

    <template v-else>
      <!-- Pending access request banner (OPDA verifier flow) -->
      <button
        v-for="r in pendingRequests"
        :key="r.id"
        class="bp-access-banner"
        @click="goAccessRequest(r.id)"
      >
        <div class="bp-access-banner-ic">{{ r.org.logoEmoji || '🏦' }}</div>
        <div class="bp-access-banner-text">
          <div class="bp-access-banner-title">
            New access request · {{ r.org.name }}
          </div>
          <div class="bp-access-banner-sub">
            {{ r.requestedScopes.length }} scope{{ r.requestedScopes.length === 1 ? '' : 's' }} requested · tap to review
          </div>
        </div>
        <span class="bp-access-banner-chev">→</span>
      </button>

      <!-- Eyebrow pill with pulse -->
      <div class="bp-eyebrow-wrap">
        <div class="eyebrow-pill">
          <div class="pulse-dot" />BUYER PROFILE
        </div>
      </div>

      <!-- Hero card with gauge -->
      <div class="bp-hero-wrap">
        <div class="hero-card">
          <div class="bp-hero-top">
            <span class="bp-hero-eyebrow">{{ tierLabel.toUpperCase() }}</span>
            <span class="bp-hero-strength">{{ Math.round(animatedStrength) }}% STRENGTH</span>
          </div>
          <div class="bp-hero-body">
            <!-- Circular gauge -->
            <div class="bp-gauge-wrap">
              <svg width="80" height="80" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="white" stroke-width="8"
                  :stroke-dasharray="passportGaugeDash"
                  :stroke-dashoffset="passportGaugeOffset"
                  stroke-linecap="round"
                  transform="rotate(-90 50 50)"
                  style="transition: stroke-dashoffset 0.9s cubic-bezier(.22,1,.36,1)"
                />
                <text x="50" y="48" text-anchor="middle" font-size="22" font-weight="800" fill="white">
                  {{ Math.round(animatedStrength) }}
                </text>
                <text x="50" y="62" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.7)">
                  strength
                </text>
              </svg>
            </div>
            <div class="bp-hero-info">
              <div class="bp-hero-name">{{ displayName }}</div>
              <div class="bp-hero-ref">
                <template v-if="(passport as any).publicRef">
                  Verified · {{ (passport as any).publicRef }}
                </template>
                <template v-else>Verified buyer</template>
              </div>
              <div class="bp-hero-pills">
                <span class="hero-pill">🪪 Verified</span>
                <span v-if="fundsLabelShort" class="hero-pill">{{ fundsLabelShort }}</span>
                <span class="hero-pill">{{ chainShortLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile completion -->
      <div class="bp-pb-wrap">
        <div class="bp-pb-row">
          <span class="bp-pb-label">Profile completion</span>
          <span class="bp-pb-pct">{{ Math.round(animatedStrength) }}%</span>
        </div>
        <div class="pb-track">
          <div class="pb-fill" :style="{ width: Math.round(animatedStrength) + '%' }" />
        </div>
        <div v-if="completionTip" class="bp-pb-tip">{{ completionTip }}</div>
      </div>

      <!-- DVS strip -->
      <div class="dvs-strip">
        <div class="dvs-badge">UK DVS</div>
        <div class="dvs-text">
          Identity verified under the UK Digital Verification Services Trust Framework
        </div>
      </div>

      <!-- Permanence banner -->
      <div class="persist-banner-wrap">
        <div class="persist-banner">
          <div class="persist-icon">♾️</div>
          <div>
            <div class="persist-title">Your profile carries forward</div>
            <div class="persist-sub">
              When you buy your next home, your verified identity and documents
              come with you — no need to reverify.
            </div>
          </div>
        </div>
      </div>

      <!-- Tier upgrade nudge -->
      <div v-if="tier !== 'PREMIUM'" class="upgrade-nudge-wrap">
        <button
          class="upgrade-nudge amber-n"
          @click="tierDrawerOpen = true"
        >
          <div class="upgrade-star">★</div>
          <div class="upgrade-body">
            <div class="upgrade-title">
              {{ tier === 'BASIC' ? 'Upgrade to Verified' : 'Upgrade to Platinum' }}
            </div>
            <div class="upgrade-sub">
              {{ tier === 'BASIC'
                ? 'Add proof of funds + affordability — £29'
                : 'Add Equifax + lender API access — takes 2 minutes' }}
            </div>
          </div>
          <span class="upgrade-arrow">→</span>
        </button>
      </div>

      <!-- ── Verified Credentials section ── -->
      <div class="section-header">
        <div class="sec-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <div class="sec-title">VERIFIED CREDENTIALS</div>
          <div class="sec-sub">Your verified information</div>
        </div>
      </div>
      <div class="tile-grid">
        <div class="tile">
          <div class="tile-icon">🪪</div>
          <div class="tile-title">Identity</div>
          <div class="tile-value">Verified</div>
          <div class="tile-prov">via Onfido / DVS</div>
        </div>
        <div class="tile" :class="{ amber: !passport.fundsType }">
          <div class="tile-icon" :class="{ 'amber-bg': !passport.fundsType }">💰</div>
          <div class="tile-title">Funds</div>
          <div class="tile-value" :class="{ amber: !passport.fundsType }">
            {{ fundsLabelLong || 'Add proof' }}
          </div>
          <div class="tile-prov" :class="{ amber: !passport.fundsType }">
            {{ fundsTypeLong }}
          </div>
        </div>
        <div class="tile">
          <div class="tile-icon">🔗</div>
          <div class="tile-title">Chain</div>
          <div class="tile-value">{{ chainShortLabel }}</div>
          <div class="tile-prov">Self-declared</div>
        </div>
        <div class="tile" :class="{ amber: !hasMortgageAip }">
          <div class="tile-icon" :class="{ 'amber-bg': !hasMortgageAip }">
            {{ hasMortgageAip ? '🏦' : '⚠️' }}
          </div>
          <div class="tile-title">Mortgage</div>
          <div class="tile-value" :class="{ amber: !hasMortgageAip }">
            {{ hasMortgageAip ? 'AIP held' : 'Add AIP' }}
          </div>
          <div class="tile-prov" :class="{ amber: !hasMortgageAip }">
            {{ hasMortgageAip ? 'Lender verified' : 'Not yet verified' }}
          </div>
        </div>
      </div>

      <!-- ── Documents section ── -->
      <div class="section-header">
        <div class="sec-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <div class="sec-title">DOCUMENTS</div>
          <div class="sec-sub">Your verified records</div>
        </div>
      </div>
      <div class="teal-card bp-docs-card">
        <div class="doc-row">
          <div class="doc-icon">🪪</div>
          <div class="doc-body">
            <div class="doc-title">Identity Verification</div>
            <div class="doc-meta">{{ idTypeLabel }} · verified by Onfido (DVS)</div>
          </div>
          <div class="doc-right">
            <span class="risk-pill clear">✓ VERIFIED</span>
            <span class="doc-chev">›</span>
          </div>
        </div>
        <div class="doc-row">
          <div class="doc-icon">💰</div>
          <div class="doc-body">
            <div class="doc-title">Proof of Funds</div>
            <div class="doc-meta">{{ fundsMetaText }}</div>
          </div>
          <div class="doc-right doc-right--col">
            <span v-if="passport.fundsType" class="risk-pill clear">✓ VERIFIED</span>
            <span v-else class="risk-pill add">+ ADD DOC</span>
          </div>
          <span class="doc-chev">›</span>
        </div>
        <div class="doc-row" @click="goShare('pdf-add-aip' as any)">
          <div class="doc-icon">🏦</div>
          <div class="doc-body">
            <div class="doc-title">Mortgage in Principle</div>
            <div class="doc-meta">
              {{ hasMortgageAip
                ? 'AIP on file · lender verified'
                : 'Upload your AIP — lender will be verified' }}
            </div>
          </div>
          <div class="doc-right">
            <span :class="hasMortgageAip ? 'risk-pill clear' : 'risk-pill add'">
              {{ hasMortgageAip ? '✓ VERIFIED' : '+ ADD DOC' }}
            </span>
            <span class="doc-chev">›</span>
          </div>
        </div>
        <div class="doc-row">
          <div class="doc-icon">🔗</div>
          <div class="doc-body">
            <div class="doc-title">Chain Position</div>
            <div class="doc-meta">
              {{ chainShortLabel }} · self-declared · ready to move
            </div>
          </div>
          <div class="doc-right">
            <span class="risk-pill flag">Self-declared</span>
            <span class="doc-chev">›</span>
          </div>
        </div>
        <div v-if="passport.solicitorStatus === 'yes'" class="doc-row">
          <div class="doc-icon">🏛️</div>
          <div class="doc-body">
            <div class="doc-title">Solicitor</div>
            <div class="doc-meta">Solicitor instructed</div>
            <div class="sol-verified">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#007e78" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
              Confirmed on Law Society register
            </div>
          </div>
          <div class="doc-right">
            <span class="risk-pill ok">✓ INSTRUCTED</span>
            <span class="doc-chev">›</span>
          </div>
        </div>
      </div>

      <!-- ── Share section ── -->
      <div class="section-header">
        <div class="sec-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </div>
        <div>
          <div class="sec-title">SHARE YOUR PROFILE</div>
        </div>
      </div>
      <div class="bp-share-card">
        <button class="action-row" @click="goShare">
          <div class="action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007e78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </div>
          <div class="action-text">
            <div class="action-title">Share</div>
            <div class="action-sub">Send to agents or generate link</div>
          </div>
          <span class="doc-chev">›</span>
        </button>
        <button class="action-row action-row--bordered" @click="goPdf">
          <div class="action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007e78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div class="action-text">
            <div class="action-title">Download PDF</div>
            <div class="action-sub">Certified profile document</div>
          </div>
          <span class="doc-chev">›</span>
        </button>
        <button class="action-row action-row--bordered" @click="goSign">
          <div class="action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007e78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div class="action-text">
            <div class="action-title">
              {{ passport.signedAt ? 'Re-sign profile' : 'Add digital signature' }}
            </div>
            <div class="action-sub">
              {{ passport.signedAt
                ? `Signed ${formatSignedAt(passport.signedAt)}`
                : 'Embed your signature in the PDF' }}
            </div>
          </div>
          <span class="doc-chev">›</span>
        </button>
        <button class="action-row action-row--bordered" @click="goEdit">
          <div class="action-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007e78" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div class="action-text">
            <div class="action-title">Edit Profile</div>
            <div class="action-sub">Update your information</div>
          </div>
          <span class="doc-chev">›</span>
        </button>
      </div>

      <div style="height: 24px" />
    </template>

    <!-- Tier upgrade drawer (Stripe checkout) -->
    <TierUpgradeDrawer
      :open="tierDrawerOpen"
      :current-tier="tier"
      @close="tierDrawerOpen = false"
      @tier-changed="onTierChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  useBuyerProfile,
  type BuyerProfile,
} from '~/composables/useBuyerProfile'
import {
  useVerifierAccess,
  type AccessRequest,
} from '~/composables/useVerifierAccess'
import { useProfile } from '~/composables/useProfile'
import { useAppToast } from '~/composables/useCustomToast'
import TierUpgradeDrawer from '~/components/buyer-profile/TierUpgradeDrawer.vue'

definePageMeta({ title: 'Buyer Profile — UmovingU', middleware: 'auth' })

const router = useRouter()
const { getBuyerProfile } = useBuyerProfile()
const { listRequests } = useVerifierAccess()
const { fetchProfile, profile } = useProfile()
const { showToast } = useAppToast()

const passport = ref<BuyerProfile | null>(null)
const loading = ref(true)
const tierDrawerOpen = ref(false)
const accessRequests = ref<AccessRequest[]>([])
const pendingRequests = computed(() =>
  accessRequests.value.filter((r) => r.status === 'PENDING'),
)
function goAccessRequest(id: string) {
  router.push(`/buyer-profile/access-request/${id}`)
}

const goBack = useGoBack('/buyer-profile')

onMounted(async () => {
  fetchProfile?.().catch(() => {})
  // Verifier requests load in parallel — never blocks the badge.
  listRequests()
    .then((rs) => { accessRequests.value = rs })
    .catch(() => { /* silent */ })
  try {
    const data = await getBuyerProfile()
    passport.value = data
    if (!data) {
      router.replace('/buyer-profile')
      return
    }
  } catch {
    router.replace('/buyer-profile')
  } finally {
    loading.value = false
  }
})

// ── Tier ─────────────────────────────────────────────────────
const tier = computed<'BASIC' | 'VERIFIED' | 'PREMIUM'>(
  () => ((passport.value as any)?.tier as any) || 'BASIC',
)
const tierLabel = computed(() => {
  if (tier.value === 'PREMIUM') return 'Platinum Buyer'
  if (tier.value === 'VERIFIED') return 'Verified Buyer'
  return 'Trusted Buyer'
})

async function onTierChanged(_t: string) {
  const p = await getBuyerProfile()
  if (p) passport.value = p
  showToast({ message: 'Tier updated', iconEmoji: '✓' })
}

// ── Strength gauge (animated) ────────────────────────────────
const strength = computed(() => {
  const p: any = passport.value
  if (!p) return 0
  if (typeof p.strengthScore === 'number') return p.strengthScore
  return 0
})

const animatedStrength = ref(0)
let strengthRaf = 0
function tweenStrength(to: number) {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) { animatedStrength.value = to; return }
  cancelAnimationFrame(strengthRaf)
  const from = animatedStrength.value
  if (from === to) return
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / 900)
    const eased = 1 - Math.pow(1 - t, 3)
    animatedStrength.value = from + (to - from) * eased
    if (t < 1) strengthRaf = requestAnimationFrame(tick)
  }
  strengthRaf = requestAnimationFrame(tick)
}
watch(strength, (v) => tweenStrength(Number(v) || 0), { immediate: true })
onBeforeUnmount(() => cancelAnimationFrame(strengthRaf))

// SVG gauge — r=40 → circumference ≈ 251
const passportGaugeDash = 251
const passportGaugeOffset = computed(
  () => passportGaugeDash - (passportGaugeDash * animatedStrength.value) / 100,
)

// ── Display labels ───────────────────────────────────────────
const displayName = computed(() => {
  const first = profile.value?.firstName?.trim()
  const last = profile.value?.lastName?.trim()
  if (first || last) return [first, last].filter(Boolean).join(' ')
  return profile.value?.email?.split('@')[0] || 'Buyer'
})

const fundsLabelShort = computed(() => {
  const amt = passport.value?.fundsAmount
  if (!amt) return ''
  if (amt >= 1_000_000) return `£${(amt / 1_000_000).toFixed(1)}M`
  if (amt >= 1000) return `£${Math.round(amt / 1000)}K`
  return `£${amt}`
})

const fundsLabelLong = computed(() => fundsLabelShort.value)

const fundsTypeLong = computed(() => {
  const t = passport.value?.fundsType
  if (t === 'mortgage') return 'Mortgage in principle'
  if (t === 'cash') return 'Cash buyer'
  if (t === 'help') return 'Help to Buy scheme'
  return 'Not yet verified'
})

const fundsMetaText = computed(() => {
  const t = passport.value?.fundsType
  const amt = fundsLabelShort.value
  if (t === 'mortgage') return `Mortgage in principle · ${amt} verified`
  if (t === 'cash') return `Cash buyer · ${amt} on deposit`
  if (t === 'help') return `Help to Buy scheme · ${amt} max`
  return 'Add your funds proof to unlock'
})

const chainShortLabel = computed(() => {
  const c = passport.value?.chainPosition
  if (c === 'sold') return 'Chain free'
  if (c === 'selling') return 'Selling'
  if (c === 'ftb') return 'First-time'
  if (c === 'renting') return 'Renting'
  return 'Add chain'
})

const idTypeLabel = computed(() => {
  const t = passport.value?.idDocumentType
  if (t === 'passport') return 'UK / EU Passport'
  if (t === 'drivingLicence') return 'UK Driving Licence'
  if (t === 'nationalId') return 'National ID Card'
  return 'Photo ID'
})

const hasMortgageAip = computed(
  () => passport.value?.fundsType === 'mortgage' && !!passport.value?.fundsDocumentUrl,
)

const completionTip = computed(() => {
  if (animatedStrength.value >= 95) return ''
  if (!hasMortgageAip.value) return '+ Add Mortgage AIP to reach 100% Platinum'
  if (!passport.value?.statement) return '+ Add your story to reach 100% Platinum'
  return '+ Upgrade your tier to reach 100% Platinum'
})

function formatSignedAt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── Navigation ───────────────────────────────────────────────
function goShare() { router.push('/buyer-profile/share') }
function goPdf() { router.push('/buyer-profile/pdf') }
function goSign() { router.push('/buyer-profile/sign') }
function goEdit() { router.push('/buyer-profile/build') }
</script>

<style scoped>
/* Plus Jakarta Sans across this page to match the prototype. */
.bp-page {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-bottom: 16px;
}

/* ── Top nav ── */
.bp-top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 6px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.bp-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 1px solid #ececef;
  display: flex; align-items: center; justify-content: center;
  color: #231d45; cursor: pointer; flex-shrink: 0;
}
.bp-nav-centre {
  flex: 1; text-align: center;
  font-size: 15px; font-weight: 800; color: #231d45;
}
.bp-nav-right {
  font-size: 13px; font-weight: 700; color: #00a19a;
  cursor: pointer; white-space: nowrap; padding: 8px 4px;
}

/* ── Loading / empty ── */
.bp-loading {
  padding: 80px 22px; text-align: center;
  color: #6b6783; font-size: 13px; font-weight: 600;
}
.bp-empty {
  padding: 60px 22px; text-align: center;
}
.bp-empty-ic { font-size: 48px; margin-bottom: 12px; }
.bp-empty-title {
  font-size: 18px; font-weight: 800; color: #231d45; margin-bottom: 8px;
}
.bp-empty-sub {
  font-size: 13px; color: #6b6783; line-height: 1.55;
  max-width: 22rem; margin: 0 auto 18px;
}

/* ── Pending access request banner ── */
.bp-access-banner {
  margin: 8px 22px 0;
  width: calc(100% - 44px);
  background: linear-gradient(135deg, #fef3c7, #fffaf0);
  border: 1.5px solid #f0b460;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; text-align: left;
  font-family: inherit;
  animation: bp-pulse-glow 2s ease-in-out infinite;
}
.bp-access-banner-ic {
  width: 38px; height: 38px; border-radius: 10px;
  background: #fff; display: flex; align-items: center;
  justify-content: center; font-size: 18px; flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(212, 130, 42, 0.18);
}
.bp-access-banner-text { flex: 1; min-width: 0; }
.bp-access-banner-title {
  font-size: 12.5px; font-weight: 800; color: #231d45;
}
.bp-access-banner-sub {
  font-size: 11px; color: #6b6783; margin-top: 1px;
}
.bp-access-banner-chev {
  font-size: 16px; font-weight: 800; color: #c4821a;
}
@keyframes bp-pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(240, 180, 96, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(240, 180, 96, 0); }
}

/* ── Eyebrow pill with pulse ── */
.bp-eyebrow-wrap {
  text-align: center; padding: 6px 22px 0;
}
.eyebrow-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 11px; font-weight: 800; color: #007e78;
  background: #f2faf8; border: 1px solid #e5f4f2;
  padding: 6px 12px; border-radius: 100px;
  letter-spacing: 1.4px; text-transform: uppercase;
}
.pulse-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #00a19a;
  position: relative; flex-shrink: 0;
}
.pulse-dot::after {
  content: ''; position: absolute; inset: -3px; border-radius: 50%;
  background: #00a19a; opacity: 0.35;
  animation: bp-pulse 1.8s ease-out infinite;
}
@keyframes bp-pulse {
  0% { transform: scale(1); opacity: 0.35; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* ── Hero card ── */
.bp-hero-wrap {
  margin: 14px 22px 0;
  animation: bp-fadeUp 0.4s 0.1s both;
}
@keyframes bp-fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-card {
  background: linear-gradient(140deg, #00b6ae 0%, #00a19a 50%, #00514d 100%);
  box-shadow: 0 12px 32px -10px rgba(0, 161, 154, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 18px 20px 20px;
  color: white;
  position: relative; overflow: hidden;
}
.hero-card::after {
  content: ''; position: absolute; top: -40%; right: -20%;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%);
  pointer-events: none;
}
.hero-card > * { position: relative; z-index: 1; }
.bp-hero-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px;
}
.bp-hero-eyebrow {
  font-size: 9px; font-weight: 800; letter-spacing: 1.2px;
  color: rgba(255, 255, 255, 0.5);
}
.bp-hero-strength {
  font-size: 9px; font-weight: 800;
  background: rgba(255, 255, 255, 0.95); color: #00a19a;
  border-radius: 100px; padding: 4px 10px;
  letter-spacing: 0.4px;
}
.bp-hero-body {
  display: flex; align-items: center; gap: 16px;
}
.bp-gauge-wrap { flex-shrink: 0; }
.bp-hero-info { flex: 1; min-width: 0; }
.bp-hero-name {
  font-size: 17px; font-weight: 800; color: white;
  margin-bottom: 2px; letter-spacing: -0.2px;
}
.bp-hero-ref {
  font-size: 11px; color: rgba(255, 255, 255, 0.65);
  margin-bottom: 10px;
}
.bp-hero-pills { display: flex; flex-wrap: wrap; gap: 5px; }
.hero-pill {
  font-size: 9px; font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 100px;
  padding: 4px 9px; color: white;
  white-space: nowrap;
}

/* ── Profile completion bar ── */
.bp-pb-wrap {
  margin: 14px 22px 0;
  animation: bp-fadeUp 0.4s 0.15s both;
}
.bp-pb-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
}
.bp-pb-label { font-size: 12px; font-weight: 700; color: #231d45; }
.bp-pb-pct { font-size: 12px; font-weight: 800; color: #00a19a; }
.pb-track {
  height: 10px; background: #ececef; border-radius: 100px; overflow: hidden;
}
.pb-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #00b6ae);
  border-radius: 100px;
  transition: width 1s 0.4s cubic-bezier(.22, 1, .36, 1);
}
.bp-pb-tip {
  font-size: 11px; font-weight: 700; color: #007e78;
  margin-top: 7px;
}

/* ── DVS strip ── */
.dvs-strip {
  margin: 12px 0 0;
  background: linear-gradient(90deg, #f6f5fb, #f2faf8);
  border-top: 1px solid #e5f4f2;
  border-bottom: 1px solid #e5f4f2;
  padding: 10px 22px;
  display: flex; align-items: center; gap: 10px;
  animation: bp-fadeUp 0.4s 0.18s both;
}
.dvs-badge {
  background: #231d45; color: white;
  font-size: 8px; font-weight: 800; letter-spacing: 0.5px;
  padding: 3px 7px; border-radius: 4px;
  flex-shrink: 0;
}
.dvs-text {
  font-size: 10.5px; font-weight: 700;
  color: #4a4566; line-height: 1.35;
}

/* ── Permanence banner ── */
.persist-banner-wrap {
  margin: 10px 22px 0;
  animation: bp-fadeUp 0.4s 0.19s both;
}
.persist-banner {
  background: linear-gradient(135deg, #f6f5fb, #f2faf8);
  border: 1px solid #e5f4f2; border-radius: 14px;
  padding: 12px 14px;
  display: flex; align-items: flex-start; gap: 12px;
}
.persist-icon { font-size: 20px; line-height: 1; flex-shrink: 0; }
.persist-title {
  font-size: 12px; font-weight: 800; color: #231d45; margin-bottom: 2px;
}
.persist-sub {
  font-size: 11px; color: #6b6783; line-height: 1.4;
}

/* ── Tier upgrade nudge ── */
.upgrade-nudge-wrap {
  margin: 10px 22px 0;
  animation: bp-fadeUp 0.4s 0.195s both;
}
.upgrade-nudge {
  background: linear-gradient(135deg, #f2faf8, #f6f5fb);
  border: 1px solid #e5f4f2;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  font-family: inherit; cursor: pointer; text-align: left; width: 100%;
}
.upgrade-nudge.amber-n {
  background: linear-gradient(135deg, #fffaf0, #fff8ec);
  border-color: #fbefd9;
}
.upgrade-star { font-size: 20px; flex-shrink: 0; }
.upgrade-body { flex: 1; min-width: 0; }
.upgrade-title {
  font-size: 12px; font-weight: 800; color: #231d45;
}
.upgrade-sub {
  font-size: 11px; color: #6b6783; margin-top: 1px;
}
.upgrade-arrow {
  font-size: 12px; font-weight: 800; color: #c4821a;
}

/* ── Section header ── */
.section-header {
  display: flex; align-items: center; gap: 12px;
  padding: 22px 22px 10px;
}
.sec-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, #00b6ae, #007e78);
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.30);
  display: flex; align-items: center; justify-content: center;
  color: white; flex-shrink: 0;
}
.sec-title { font-size: 14px; font-weight: 800; color: #231d45; letter-spacing: 0.5px; }
.sec-sub { font-size: 11.5px; color: #6b6783; }

/* ── Tile grid ── */
.tile-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 22px;
}
.tile {
  background: white; border-radius: 16px;
  padding: 16px 14px;
  border: 1.5px solid transparent;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s cubic-bezier(.34, 1.56, .64, 1);
}
.tile:hover {
  transform: scale(1.03);
  border-color: #231d45;
  box-shadow: 0 8px 24px rgba(35, 29, 69, 0.12);
}
.tile.amber { border-color: #e6a23c; }
.tile-icon {
  width: 32px; height: 32px; border-radius: 10px;
  background: #f2faf8;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; margin-bottom: 10px;
}
.tile-icon.amber-bg { background: #fbefd9; }
.tile-title {
  font-size: 13px; font-weight: 800; color: #231d45; margin-bottom: 2px;
}
.tile-value { font-size: 15px; font-weight: 800; color: #00a19a; }
.tile-value.amber { color: #c4821a; }
.tile-prov {
  font-size: 9px; font-weight: 700; color: #007e78;
  background: #f2faf8; border: 1px solid #e5f4f2;
  border-radius: 100px; padding: 3px 8px;
  display: inline-block;
  margin-top: 6px;
}
.tile-prov.amber {
  color: #c4821a; background: #fbefd9; border-color: #e6a23c;
}

/* ── Documents card ── */
.teal-card {
  background: white;
  border: 2px solid #00a19a;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.08);
}
.bp-docs-card {
  margin: 0 22px;
  overflow: hidden;
  animation: bp-fadeUp 0.4s 0.3s both;
}
.doc-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f7;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}
.doc-row:last-child { border-bottom: none; }
.doc-row:hover { background: #fafafa; }
.doc-icon {
  width: 32px; height: 32px; border-radius: 10px;
  background: #f2faf8;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.doc-body { flex: 1; min-width: 0; }
.doc-title {
  font-size: 13.5px; font-weight: 800; color: #231d45;
}
.doc-meta {
  font-size: 11px; color: #6b6783; margin-top: 1px;
}
.doc-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.doc-right--col { flex-direction: column; align-items: flex-end; gap: 4px; }
.doc-chev { color: #9c98ad; font-weight: 800; font-size: 15px; }

.risk-pill {
  font-size: 10px; font-weight: 800;
  padding: 4px 8px; border-radius: 100px;
  white-space: nowrap; letter-spacing: 0.3px;
}
.risk-pill.clear {
  background: #f2faf8; color: #007e78; border: 1px solid #e5f4f2;
}
.risk-pill.flag {
  background: #fbefd9; color: #e6a23c;
}
.risk-pill.ok {
  background: #e8f5ee; color: #2eab55; border: 1px solid #b8e8c8;
}
.risk-pill.add {
  background: #fbefd9; color: #c4821a; border: 1px solid #e6a23c;
}

.sol-verified {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; color: #007e78;
  margin-top: 3px;
}

/* ── Share section card with action rows ── */
.bp-share-card {
  margin: 0 22px;
  background: white;
  border: 1.5px solid #ececef;
  border-radius: 16px;
  overflow: hidden;
  animation: bp-fadeUp 0.4s 0.4s both;
}
.action-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 22px;
  cursor: pointer; transition: background 0.15s;
  background: white; border: none;
  font-family: inherit; width: 100%; text-align: left;
}
.action-row:hover { background: #fafafa; }
.action-row--bordered { border-top: 1px solid #f5f5f7; }
.action-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: #f2faf8;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.action-text { flex: 1; min-width: 0; }
.action-title { font-size: 13.5px; font-weight: 800; color: #231d45; }
.action-sub { font-size: 11px; color: #6b6783; }

/* ── CTA button (shared) ── */
.cta-btn {
  width: 100%;
  background: #00a19a; color: white; border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 14px; font-weight: 800; font-family: inherit;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.35);
  cursor: pointer;
  margin-top: 12px;
}
.cta-btn:hover { background: #00b6ae; }
</style>
