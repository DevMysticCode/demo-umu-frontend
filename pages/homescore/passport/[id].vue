<template>
  <div class="bpp-page">
    <!-- Header -->
    <div class="app-header">
      <button class="app-icon-btn" type="button" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Build your Property Passport</div>
        <div class="app-header-sub">
          Turn what you know about your home into a verified record.
        </div>
      </div>
      <button class="app-icon-btn" type="button" aria-label="How this works">?</button>
    </div>

    <!-- Passport progress card -->
    <div class="bpp-progress-card anim-1">
      <div class="bpp-progress-eyebrow-row">
        <div class="bpp-progress-eyebrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l8 3.5v5.3c0 4.9-3.4 9.4-8 10.7-4.6-1.3-8-5.8-8-10.7V5.5L12 2z" />
          </svg>
          Your Passport progress
        </div>
        <div class="bpp-progress-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Updates as you add docs
        </div>
      </div>

      <div class="bpp-progress-row">
        <div class="bpp-progress-col">
          <div class="bpp-circle-wrap">
            <svg class="bpp-circle-svg" viewBox="0 0 120 120" aria-hidden="true">
              <circle class="bppc-bg" cx="60" cy="60" r="50" stroke-width="9" />
              <circle
                class="bppc-fill bppc-fill--score"
                cx="60" cy="60" r="50" stroke-width="9"
                stroke-dasharray="314.16"
                :stroke-dashoffset="scoreRingOffset"
                stroke-linecap="round" fill="none"
              />
            </svg>
            <div class="bpp-circle-num">
              <div class="bppc-big">{{ toScore }}</div>
            </div>
          </div>
          <div class="bpp-col-label">HOMESCORE</div>
          <div class="bpp-col-hook bpp-col-hook--score">{{ scoreHook }}</div>
        </div>
        <div class="bpp-progress-divider" />
        <div class="bpp-progress-col">
          <div class="bpp-circle-wrap">
            <svg class="bpp-circle-svg" viewBox="0 0 120 120" aria-hidden="true">
              <circle class="bppc-bg" cx="60" cy="60" r="50" stroke-width="9" />
              <circle
                class="bppc-fill bppc-fill--passport"
                cx="60" cy="60" r="50" stroke-width="9"
                stroke-dasharray="314.16"
                :stroke-dashoffset="passportRingOffset"
                stroke-linecap="round" fill="none"
              />
            </svg>
            <div class="bpp-circle-num">
              <div class="bppc-big">{{ passportPct }}%</div>
            </div>
          </div>
          <div class="bpp-col-label">PASSPORT</div>
          <div class="bpp-col-hook bpp-col-hook--passport">Not started yet</div>
        </div>
        <div class="bpp-progress-copy">
          <p>
            Add key documents to reach <b>60%</b> and unlock
            <b>Move Ready</b>.
          </p>
          <a class="bpp-milestones-btn" href="#professional-evidence">
            See milestones
            <span>→</span>
          </a>
        </div>
      </div>

      <div class="bpp-progress-banner">
        <span class="bpp-progress-banner-ic" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
        </span>
        Add documents and evidence to build your Passport and unlock
        <b>Move Ready</b>.
      </div>
    </div>

    <!-- EPC age card -->
    <div v-if="epcYear" class="bpp-epc-card anim-1">
      <img src="/op-icons/calendar/document.png" alt="" class="bpp-epc-ic" loading="lazy" />
      <div class="bpp-epc-body">
        <div class="bpp-epc-title">Your EPC is from {{ epcYear }}</div>
        <div class="bpp-epc-sub">
          An updated EPC brings your public energy record up to date and
          strengthens your Passport.
        </div>
      </div>
      <a
        class="bpp-epc-btn"
        :href="`https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=${encodeURIComponent(propertyPostcode)}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        Arrange a new EPC
        <span>→</span>
      </a>
    </div>

    <!-- Add to your Passport -->
    <div class="section-h-row">
      <div class="section-h">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        Add to your Passport (after claiming your property)
      </div>
    </div>
    <div class="bpp-tile-grid anim-2">
      <div v-for="t in addTiles" :key="t.title" class="bpp-tile">
        <img :src="t.icon" alt="" class="bpp-tile-ic" loading="lazy" />
        <div class="bpp-tile-title">{{ t.title }}</div>
        <div class="bpp-tile-sub">{{ t.sub }}</div>
        <span class="bpp-tile-lock" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
      </div>
    </div>
    <div class="bpp-note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      You'll be able to add these once you've claimed your property.
    </div>

    <!-- Get professional evidence -->
    <div id="professional-evidence" class="section-h-row">
      <div class="section-h">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
        Get professional evidence
      </div>
    </div>
    <div class="bpp-list anim-2">
      <button v-for="b in evidenceBookings" :key="b.title" class="bpp-list-row" type="button" @click="onBookEvidence(b)">
        <img :src="b.icon" alt="" class="bpp-list-ic" loading="lazy" />
        <div class="bpp-list-body">
          <div class="bpp-list-title">{{ b.title }}</div>
          <div class="bpp-list-sub">{{ b.sub }}</div>
        </div>
        <span class="bpp-list-chev">›</span>
      </button>
    </div>
    <div class="bpp-note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Professional bookings link to your Passport once claimed.
    </div>

    <!-- Claim your Passport -->
    <div class="bpp-claim-card anim-2">
      <img src="/op-icons/passportview/umu-passport.png" alt="" class="bpp-claim-ic" loading="lazy" />
      <div class="bpp-claim-title">Claim your Passport to get started</div>
      <div class="bpp-claim-sub">
        Your Passport is free. To confirm you own this property, you'll need
        to verify ownership and complete ID checks. This one-off step keeps
        your Passport secure and trusted.
      </div>
      <div class="bpp-claim-checks">
        <div class="bpp-claim-check">
          <span class="bpp-claim-check-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <div>
            <div class="bpp-claim-check-title">Confirm ownership</div>
            <div class="bpp-claim-check-sub">Verify you own this property</div>
          </div>
        </div>
        <div class="bpp-claim-check">
          <span class="bpp-claim-check-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <div>
            <div class="bpp-claim-check-title">ID verification (KYC)</div>
            <div class="bpp-claim-check-sub">Quick &amp; secure identity checks</div>
          </div>
        </div>
        <div class="bpp-claim-check">
          <span class="bpp-claim-check-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <div>
            <div class="bpp-claim-check-title">Secure &amp; private</div>
            <div class="bpp-claim-check-sub">Your data is encrypted and only you control it</div>
          </div>
        </div>
      </div>
      <button class="bpp-claim-btn" type="button" @click="goToClaim">
        <span class="bpp-claim-btn-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Claim my Passport
        </span>
        <span class="bpp-claim-btn-right">
          One-off fee to verify ownership
          <span>→</span>
        </span>
      </button>
      <a class="bpp-claim-login" href="/onboarding/signin">
        I already have an account
        <span>→</span>
      </a>
    </div>

    <div class="bpp-trust-note">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
        <path d="M12 2l8 3.5v5.3c0 4.9-3.4 9.4-8 10.7-4.6-1.3-8-5.8-8-10.7V5.5L12 2z" />
      </svg>
      Your data is secure. Your Passport is private to you and only shared
      when you choose.
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
const propertyId = computed(() => String(route.params.id))

const { property, loadProperty, epcField } = useHomeScorePropertyData()

onMounted(() => {
  loadProperty(propertyId.value)
})

const propertyPostcode = computed<string>(() => property.value?.postcode || '')

const toScore = computed(() => {
  const p: any = property.value
  const raw = Number(p?.epcScorePotential ?? p?.epcCert?.potentialScore ?? p?.epcScore ?? 0) || 0
  return raw
})
const scoreHook = computed(() => {
  const s = toScore.value
  if (s >= 80) return 'Top of the street'
  if (s >= 60) return 'Great start!'
  if (s >= 40) return 'Room to grow'
  return 'Just getting started'
})

// No Passport exists yet on an unclaimed property — this page is only
// ever reached pre-claim, so 0% is always accurate here (not a
// placeholder). Once claimed, the user lands on the real Passport
// dashboard instead of this page.
const passportPct = 0

const CIRCUMFERENCE = 2 * Math.PI * 50
const scoreRingOffset = computed(
  () => CIRCUMFERENCE - (Math.max(0, Math.min(100, toScore.value)) / 100) * CIRCUMFERENCE,
)
const passportRingOffset = computed(
  () => CIRCUMFERENCE - (passportPct / 100) * CIRCUMFERENCE,
)

const epcYear = computed(() => {
  const raw = epcField('lodgementDate')
  if (!raw) return null
  const year = String(raw).slice(0, 4)
  return /^\d{4}$/.test(year) ? year : null
})

const addTiles = [
  {
    title: 'Utility bills',
    sub: 'Show your real energy use',
    icon: '/op-icons/boostYourScore/utilityBills.png',
  },
  {
    title: 'Certificates & reports',
    sub: 'EPC, warranties, inspections & more',
    icon: '/op-icons/investment/clipboardChecklist.png',
  },
  {
    title: 'Property documents',
    sub: 'Deeds, plans, guarantees & more',
    icon: '/op-icons/homescore/house.png',
  },
  {
    title: 'Photos & evidence',
    sub: 'Add photos to support your record',
    icon: '/op-icons/misc/camera.png',
  },
]

const evidenceBookings = [
  {
    title: 'Book a Gas Safe engineer',
    sub: "Service your boiler · cert auto-lands in your Passport",
    icon: '/op-icons/boostYourScore/gasSafety.png',
    kind: 'gas',
  },
  {
    title: 'Book an electrician (EICR)',
    sub: 'Electrical inspection · from £150',
    icon: '/op-icons/boostYourScore/electrician.png',
    kind: 'electrician',
  },
  {
    title: 'New EPC assessment',
    sub: 'From £60 · required if yours is 10+ years old',
    icon: '/op-icons/boostYourScore/epcAssessment.png',
    kind: 'epc',
  },
]

function onBookEvidence(b: { kind: string }) {
  // Professional bookings require a claimed Passport to link evidence to —
  // route through the claim flow rather than booking against nothing.
  router.push(`/claim/${propertyId.value}?intent=${b.kind}`)
}

function goToClaim() {
  router.push(`/claim/${propertyId.value}`)
}
</script>

<style scoped>
.bpp-page {
  --primary: #231d45;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-light: #00b8b0;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  background: var(--bg);
  color: var(--text);
  min-height: 100dvh;
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
  max-width: 28rem;
  margin: 0 auto;
}

@keyframes bpp-fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.anim-1 { animation: bpp-fadeUp 0.35s 0.06s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-2 { animation: bpp-fadeUp 0.35s 0.14s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 14px 18px 10px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid var(--border);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}
.app-icon-btn svg {
  width: 16px;
  height: 16px;
}
.app-header-info {
  flex: 1;
  min-width: 0;
  text-align: center;
}
.app-header-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.app-header-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 3px;
  line-height: 1.4;
}

/* Passport progress card */
.bpp-progress-card {
  margin: 6px 20px 0;
  padding: 18px;
  background: var(--primary);
  border-radius: 18px;
  color: #fff;
}
.bpp-progress-eyebrow-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}
.bpp-progress-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.9);
}
.bpp-progress-eyebrow svg {
  width: 14px;
  height: 14px;
  color: var(--accent-light);
}
.bpp-progress-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 100px;
  font-size: 9.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}
.bpp-progress-pill svg {
  width: 11px;
  height: 11px;
}
.bpp-progress-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.bpp-progress-col {
  text-align: center;
  flex-shrink: 0;
}
.bpp-circle-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto;
}
.bpp-circle-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.bppc-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.14);
}
.bppc-fill {
  fill: none;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.bppc-fill--score {
  stroke: var(--accent-light);
}
.bppc-fill--passport {
  stroke: #7c6fb0;
}
.bpp-circle-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bppc-big {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.6px;
}
.bpp-col-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
}
.bpp-col-hook {
  font-size: 10.5px;
  font-weight: 700;
  margin-top: 2px;
}
.bpp-col-hook--score {
  color: var(--accent-light);
}
.bpp-col-hook--passport {
  color: #b3a8de;
}
.bpp-progress-divider {
  width: 1px;
  align-self: stretch;
  background: rgba(255, 255, 255, 0.16);
  flex-shrink: 0;
}
.bpp-progress-copy {
  flex: 1;
  min-width: 0;
}
.bpp-progress-copy p {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.45;
}
.bpp-progress-copy p b {
  color: #fff;
  font-weight: 800;
}
.bpp-milestones-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 100px;
  color: #fff;
  font-size: 11.5px;
  font-weight: 700;
  text-decoration: none;
}
.bpp-progress-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}
.bpp-progress-banner b {
  color: var(--accent-light);
  font-weight: 800;
}
.bpp-progress-banner-ic {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.6);
}
.bpp-progress-banner-ic svg {
  width: 16px;
  height: 16px;
}

/* EPC age card */
.bpp-epc-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 20px 0;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.bpp-epc-ic {
  width: 44px;
  height: 44px;
  object-fit: contain;
  flex-shrink: 0;
}
.bpp-epc-body {
  flex: 1;
  min-width: 0;
}
.bpp-epc-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text);
}
.bpp-epc-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 3px;
  line-height: 1.4;
}
.bpp-epc-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 9px 12px;
  border: 1.5px solid var(--accent);
  border-radius: 100px;
  color: var(--accent-dark);
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

/* Section heading */
.section-h-row {
  padding: 20px 20px 10px;
}
.section-h {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.section-h svg {
  width: 14px;
  height: 14px;
  color: var(--accent-dark);
  flex-shrink: 0;
}

/* Add-to-passport tile grid */
.bpp-tile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 0 20px;
}
.bpp-tile {
  position: relative;
  padding: 16px 12px 14px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  text-align: center;
}
.bpp-tile-ic {
  width: 44px;
  height: 44px;
  object-fit: contain;
  margin: 0 auto 8px;
  display: block;
}
.bpp-tile-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.25;
  margin-bottom: 3px;
}
.bpp-tile-sub {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.35;
  margin-bottom: 10px;
}
.bpp-tile-lock {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #5b3795;
  color: #fff;
}
.bpp-tile-lock svg {
  width: 12px;
  height: 12px;
}

.bpp-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 20px 0;
  padding: 10px 14px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 100px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--accent-dark);
}
.bpp-note svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

/* Professional evidence list */
.bpp-list {
  margin: 0 20px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.bpp-list-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border-soft);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
}
.bpp-list-row:last-child {
  border-bottom: none;
}
.bpp-list-row:hover {
  background: var(--accent-paler);
}
.bpp-list-ic {
  width: 38px;
  height: 38px;
  object-fit: contain;
  flex-shrink: 0;
}
.bpp-list-body {
  flex: 1;
  min-width: 0;
}
.bpp-list-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text);
}
.bpp-list-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
}
.bpp-list-chev {
  font-size: 18px;
  color: var(--text-faint);
  flex-shrink: 0;
}

/* Claim card */
.bpp-claim-card {
  margin: 16px 20px 0;
  padding: 20px 18px;
  background: var(--card);
  border: 1.5px solid #c9b0f0;
  border-radius: 18px;
  text-align: center;
}
.bpp-claim-ic {
  width: 84px;
  object-fit: contain;
  margin: 0 auto 12px;
  display: block;
  filter: drop-shadow(0 8px 12px rgba(35, 29, 69, 0.18));
}
.bpp-claim-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
}
.bpp-claim-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-top: 8px;
}
.bpp-claim-checks {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
  text-align: left;
}
.bpp-claim-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.bpp-claim-check-ic {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-paler);
  color: var(--accent-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}
.bpp-claim-check-ic svg {
  width: 11px;
  height: 11px;
}
.bpp-claim-check-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text);
}
.bpp-claim-check-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 1px;
}
.bpp-claim-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 18px;
  padding: 15px 16px;
  background: #5b3795;
  border: none;
  border-radius: 14px;
  color: #fff;
  font-family: inherit;
  cursor: pointer;
}
.bpp-claim-btn-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.5px;
  font-weight: 800;
}
.bpp-claim-btn-left svg {
  width: 16px;
  height: 16px;
}
.bpp-claim-btn-right {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}
.bpp-claim-login {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  color: #5b3795;
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
}

.bpp-trust-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 18px 24px 0;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-faint);
  text-align: center;
}
.bpp-trust-note svg {
  flex-shrink: 0;
  color: var(--accent-dark);
}
</style>
