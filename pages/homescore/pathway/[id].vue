<template>
  <div class="hs-v6-pathway">
    <!-- App header -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Your pathway</div>
        <div class="app-header-sub">Level {{ fromLevel }} → Level {{ toLevel }} · {{ addressLine }}</div>
      </div>
      <div class="app-header-spacer" />
    </div>

    <!-- Pathway hero -->
    <div class="pathway-hero anim-1">
      <div class="pathway-eyebrow">✦ EPC-recommended route</div>
      <div class="pathway-route">
        <div class="pathway-level-from">
          <div class="pathway-level-letter from">{{ fromLevel }}</div>
          <div class="pathway-level-sub">Now · {{ fromScore }}</div>
        </div>
        <div class="pathway-arrow" />
        <div class="pathway-level-to">
          <div class="pathway-level-letter to">{{ toLevel }}</div>
          <div class="pathway-level-sub">Potential · {{ toScore }}</div>
        </div>
      </div>
      <div class="pathway-stats-row">
        <div class="pathway-stat">
          <div class="pathway-stat-num">+{{ toScore - fromScore }}</div>
          <div class="pathway-stat-label">Points to gain</div>
        </div>
        <div class="pathway-stat">
          <div class="pathway-stat-num">£{{ totalSavings }}</div>
          <div class="pathway-stat-label">/yr saved</div>
        </div>
        <div class="pathway-stat">
          <div class="pathway-stat-num">{{ co2Cut }}t</div>
          <div class="pathway-stat-label">CO₂ cut /yr</div>
        </div>
      </div>
    </div>

    <!-- Grant banner -->
    <div class="grant-banner anim-2">
      <div class="grant-banner-title">🎁 Grants listed on your EPC</div>
      <div class="grant-banner-sub">
        The EPC lists <b>Warm Homes Local Grant</b>, <b>Boiler Upgrade Scheme</b>, and
        <b>Energy Company Obligation (ECO)</b>. Eligibility depends on income and area — your
        installer will check.
      </div>
    </div>

    <!-- Section heading -->
    <div class="section-h-row">
      <div class="section-h">
        EPC's {{ missions.length }} step{{ missions.length === 1 ? '' : 's' }} · in published order
      </div>
      <div v-if="fromScore && toScore" class="section-h-sub">
        {{ fromScore }} → {{ toScore }} points
      </div>
    </div>

    <!-- Empty state when the EPC has no improvement steps -->
    <div v-if="missions.length === 0" class="pathway-empty">
      <div class="pathway-empty-icon">✓</div>
      <div class="pathway-empty-title">No improvements on this EPC</div>
      <div class="pathway-empty-sub">
        The certificate for this property doesn't list any energy-saving
        steps — usually means it's already in good shape.
      </div>
    </div>

    <!-- Mission list -->
    <div v-else class="mission-list anim-3">
      <div
        v-for="(m, i) in missions"
        :key="m.id"
        class="mission-card"
        :class="{ priority: i === 0 }"
      >
        <div class="mission-top">
          <div class="mission-icon">{{ m.icon }}</div>
          <div class="mission-info">
            <div class="mission-title">Step {{ i + 1 }} · {{ m.title }}</div>
            <div class="mission-meta">{{ m.meta }}</div>
          </div>
        </div>
        <div class="mission-rewards">
          <span class="quest-reward stat">{{ m.pts }}</span>
          <span class="quest-reward money">{{ m.save }}</span>
          <span class="quest-reward grant">{{ m.cost }}</span>
        </div>
        <div class="mission-actions">
          <button class="mission-btn-supplier" type="button" @click="goToMarketplace(m.id)">
            🔧 {{ m.supplierLabel }}
          </button>
          <button class="mission-btn-done" type="button" @click="markDone(m.id)">✓ Done</button>
        </div>
      </div>
    </div>

    <!-- Path summary -->
    <div class="path-summary anim-4">
      <div class="path-summary-icon">🛡️</div>
      <div class="path-summary-body">
        <div class="path-summary-title">All suppliers are UMU-verified</div>
        <div class="path-summary-sub">
          Payments held in escrow via UProtect. ECO4-registered installers only.
        </div>
      </div>
    </div>

    <!-- Beyond the pathway teaser — twin progress rings (v6-2) -->
    <div class="moveready-teaser anim-4" @click="goToBoost">
      <div class="moveready-teaser-head">
        <div class="moveready-teaser-eyebrow">✨ Beyond the pathway</div>
        <div class="moveready-teaser-title">See your MoveReady &amp; Passport scores</div>
      </div>
      <div class="moveready-teaser-row">
        <div class="moveready-mini">
          <div class="moveready-mini-ring">
            <svg viewBox="0 0 60 60" aria-hidden="true">
              <circle cx="30" cy="30" r="24" stroke="#E4E5ED" stroke-width="6" fill="none" />
              <circle
                cx="30" cy="30" r="24"
                stroke="url(#mrGrad)" stroke-width="6" fill="none"
                stroke-dasharray="150.8"
                :stroke-dashoffset="150.8 - (mrPct / 100) * 150.8"
                stroke-linecap="round"
                transform="rotate(-90 30 30)"
              />
              <defs>
                <linearGradient id="mrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#7C6FB0" />
                  <stop offset="100%" stop-color="#5B3795" />
                </linearGradient>
              </defs>
            </svg>
            <div class="moveready-mini-num">{{ mrPct }}</div>
          </div>
          <div class="moveready-mini-label">MoveReady</div>
        </div>
        <div class="moveready-mini">
          <div class="moveready-mini-ring">
            <svg viewBox="0 0 60 60" aria-hidden="true">
              <circle cx="30" cy="30" r="24" stroke="#E4E5ED" stroke-width="6" fill="none" />
              <circle
                cx="30" cy="30" r="24"
                stroke="url(#ppGrad)" stroke-width="6" fill="none"
                stroke-dasharray="150.8"
                :stroke-dashoffset="150.8 - (ppPct / 100) * 150.8"
                stroke-linecap="round"
                transform="rotate(-90 30 30)"
              />
              <defs>
                <linearGradient id="ppGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#00B8B0" />
                  <stop offset="100%" stop-color="#008A84" />
                </linearGradient>
              </defs>
            </svg>
            <div class="moveready-mini-num accent">{{ ppPct }}%</div>
          </div>
          <div class="moveready-mini-label">Passport</div>
        </div>
        <div class="moveready-teaser-body">
          <div class="moveready-teaser-line">
            <b>{{ passportDone }} of {{ passportTotal }}</b> Passport sections complete
          </div>
          <div class="moveready-teaser-line2">{{ passportSummary }}</div>
        </div>
        <div class="moveready-teaser-arrow">›</div>
      </div>
    </div>

    <!-- Bottom CTAs -->
    <div class="bottom-cta">
      <button class="bottom-cta-btn" type="button" @click="goToMarketplaceHub">
        🛒 Open the UmovingU Marketplace
      </button>
      <button class="bottom-cta-secondary" type="button" @click="goToMatched">
        See your matched suppliers
      </button>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const router = useRouter()
const route = useRoute()
const propertyId = computed(() => String(route.params.id))
const config = useRuntimeConfig()

// Real property data fetched on mount so the pathway page shows the
// actual EPC recommendations for THIS property (not the prototype's
// hard-coded 6 steps).
const property = ref<any>(null)

onMounted(async () => {
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId.value}`,
    )
    if (res.ok) property.value = await res.json()
  } catch {
    /* keep null — page falls back to a friendly empty state */
  }
})

const addressLine = computed(() => {
  const p = property.value
  return p?.addressLine1 || 'Your property'
})

const fromScore = computed(() => {
  const p: any = property.value
  return Number(p?.epcScore ?? p?.epcCert?.epcScore ?? 0) || 0
})
const toScore = computed(() => {
  const p: any = property.value
  return Number(p?.epcScorePotential ?? p?.epcCert?.potentialScore ?? 0) || 0
})

// Pick an icon for each EPC recommendation type based on title keywords.
function iconForRec(title: string): string {
  const t = (title ?? '').toLowerCase()
  if (/solar pv|photovoltaic/.test(t)) return '⚡'
  if (/solar (?:water|thermal)/.test(t)) return '☀️'
  if (/(loft|roof)/.test(t)) return '🏠'
  if (/(cavity|wall)/.test(t)) return '🧱'
  if (/floor/.test(t)) return '🪟'
  if (/(led|light)/.test(t)) return '💡'
  if (/(boiler|heat pump|heating)/.test(t)) return '🔥'
  if (/thermostat|controls/.test(t)) return '🌡'
  if (/hot water|cylinder/.test(t)) return '💧'
  return '✦'
}

function supplierLabelForRec(title: string): string {
  const t = (title ?? '').toLowerCase()
  if (/solar pv|photovoltaic/.test(t)) return 'Find solar PV installers'
  if (/solar (?:water|thermal)/.test(t)) return 'Find solar thermal installers'
  if (/(led|light)/.test(t)) return 'LED suppliers'
  if (/(boiler)/.test(t)) return 'Find Gas Safe engineers'
  if (/heat pump/.test(t)) return 'Find heat-pump installers'
  if (/(thermostat|controls)/.test(t)) return 'Find heating-controls fitters'
  if (/(cavity|wall|loft|roof|floor|insulat)/.test(t))
    return 'Find insulation installers'
  return 'Find a verified pro'
}

function gradeFor(score: number): string {
  if (score >= 92) return 'A'
  if (score >= 81) return 'B'
  if (score >= 69) return 'C'
  if (score >= 55) return 'D'
  if (score >= 39) return 'E'
  if (score >= 21) return 'F'
  return 'G'
}
const fromLevel = computed(() => gradeFor(fromScore.value))
const toLevel = computed(() => gradeFor(toScore.value))

interface Mission {
  id: string
  icon: string
  title: string
  meta: string
  pts: string
  save: string
  cost: string
  supplierLabel: string
}

// Build the mission list from the property's real epcRecommendations.
// Falls back to an empty list (page shows a friendly note) when the
// property has no EPC steps on file.
const missions = computed<Mission[]>(() => {
  const p: any = property.value
  const recs: any[] = p?.epcRecommendations || p?.epcCert?.epcRecommendations
  if (!Array.isArray(recs) || recs.length === 0) return []
  // Preserve the EPC's published order.
  const sorted = [...recs].sort((a, b) => {
    const an = Number(a?.id)
    const bn = Number(b?.id)
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn
    return 0
  })
  return sorted.map((r: any, idx: number) => {
    const title = r?.title || r?.improvementDescr || 'EPC recommendation'
    const sap = Number(r?.resultingSap ?? 0)
    const grade = sap > 0 ? gradeFor(sap) : ''
    return {
      id: String(r?.id ?? idx),
      icon: iconForRec(title),
      title,
      meta:
        r?.description ||
        `Step ${idx + 1} on this property's EPC pathway.`,
      pts: sap > 0 ? `→ ${sap} ${grade}` : `Step ${idx + 1}`,
      save: r?.typicalSaving ? `£${r.typicalSaving}/yr` : '',
      cost: r?.costRange || '',
      supplierLabel: supplierLabelForRec(title),
    }
  })
})

const totalSavings = computed(() => {
  const p: any = property.value
  const recs: any[] = p?.epcRecommendations || p?.epcCert?.epcRecommendations
  if (!Array.isArray(recs)) return 0
  return recs.reduce(
    (acc, r) => acc + (Number(r?.typicalSaving) || 0),
    0,
  )
})
const co2Cut = computed(() => {
  const p: any = property.value
  const now = Number(p?.co2Emissions ?? p?.epcCert?.co2Emissions ?? 0)
  const pot = Number(
    p?.co2EmissionsPotential ?? p?.epcCert?.co2EmissionsPotential ?? 0,
  )
  if (!now || !pot || pot >= now) return '0'
  return (now - pot).toFixed(1)
})

function goToMarketplace(missionId: string) {
  router.push(`/homescore/marketplace/${propertyId.value}?focus=${missionId}`)
}
function goToMarketplaceHub() {
  router.push(`/homescore/marketplace`)
}
function goToMatched() {
  router.push(`/homescore/marketplace/${propertyId.value}`)
}
function markDone(_id: string) {
  // Placeholder — backend wiring later
}
function goToBoost() {
  // Pathway is a standalone route; redirect back into the homescore flow
  // and let it switch to the boost screen.
  router.push(`/homescore/${propertyId.value}?screen=boost`)
}

// ── "Beyond the pathway" teaser values ─────────────────────────
// MoveReady % and Passport % aren't backed by a live endpoint yet, so we
// derive defensible placeholders from the property's passport state.
// Once the boost flow has counted uploaded docs server-side, swap these
// for real `/property/:id/move-ready` and `/property/:id/passport/summary`
// reads.
const mrPct = computed(() => {
  const p: any = property.value
  if (!p) return 0
  // Seed from whether a passport exists + has been published.
  if (p.passportPublished) return 65
  if (p.hasPassport) return 35
  return 12
})
const ppPct = computed(() => {
  const p: any = property.value
  if (!p) return 0
  if (p.passportPublished) return 70
  if (p.hasPassport) return 40
  return 30
})
const passportTotal = 19 // total passport section templates
const passportDone = computed(() => {
  // Rough estimate from Passport %: 19 sections × (ppPct / 100)
  return Math.round((passportTotal * ppPct.value) / 100)
})
const passportSummary = computed(() => {
  const remaining = passportTotal - passportDone.value
  if (remaining <= 0) return 'All sections complete'
  return `${remaining} section${remaining === 1 ? '' : 's'} to go · tap to boost`
})
</script>

<style scoped>
.hs-v6-pathway {
  --primary: #231d45;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-light: #00b8b0;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --page: #f0f2f8;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --warning-pale: #fff5e0;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  /* Match the rest of the app: mobile-container width, SF Pro inherited */
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}

/* Soften prototype's 800-weights to match the SF Pro app scale */
.hs-v6-pathway :is(.app-header-title, .pathway-eyebrow, .pathway-stat-num,
  .grant-banner-title, .mission-title, .path-summary-title,
  .bottom-cta-btn, .moveready-teaser-title, .quest-reward) {
  font-weight: 700;
}
.hs-v6-pathway :is(.app-header-sub, .pathway-stat-label, .grant-banner-sub,
  .mission-meta, .path-summary-sub, .moveready-teaser-sub) {
  font-weight: 500;
}
.hs-v6-pathway .ignored-placeholder {
  /* anchor to keep the soften block scoped */
}

@keyframes hs-v6-fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.anim-1 { animation: hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-2 { animation: hs-v6-fadeUp 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-3 { animation: hs-v6-fadeUp 0.35s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-4 { animation: hs-v6-fadeUp 0.35s 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* App header */
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px 10px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: transparent;
}
.back-btn,
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: all 0.15s;
  flex-shrink: 0;
}
.back-btn:hover,
.app-icon-btn:hover {
  background: var(--accent-paler);
  border-color: var(--accent-pale);
  color: var(--accent-dark);
}
.back-btn svg,
.app-icon-btn svg {
  width: 16px;
  height: 16px;
}
.app-header-info {
  flex: 1;
  min-width: 0;
  text-align: center;
}
.app-header-spacer {
  width: 36px;
  flex-shrink: 0;
}
.app-header-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.15;
}
.app-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}

/* Pathway hero */
.pathway-hero {
  margin: 14px 20px 0;
  padding: 20px 18px 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border-radius: 14px;
  color: white;
  box-shadow: 0 8px 24px rgba(0, 161, 154, 0.25);
  position: relative;
  overflow: hidden;
}
.pathway-hero::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, transparent 65%);
  pointer-events: none;
}
.pathway-hero > * {
  position: relative;
  z-index: 1;
}
.pathway-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.pathway-route {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}
.pathway-level-from,
.pathway-level-to {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.pathway-level-letter {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
}
.pathway-level-letter.from {
  background: rgba(255, 255, 255, 0.18);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}
.pathway-level-letter.to {
  background: white;
  color: var(--accent-dark);
  border: 2px solid white;
  box-shadow: 0 4px 14px rgba(255, 255, 255, 0.25);
}
.pathway-level-sub {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
}
.pathway-arrow {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.3), white);
  position: relative;
  border-radius: 100px;
}
.pathway-arrow::after {
  content: '→';
  position: absolute;
  top: 50%;
  right: -2px;
  transform: translateY(-50%);
  color: white;
  font-size: 18px;
  font-weight: 800;
}
.pathway-stats-row {
  display: flex;
  gap: 8px;
}
.pathway-stat {
  flex: 1;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  text-align: center;
}
.pathway-stat-num {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.4px;
}
.pathway-stat-label {
  font-size: 9px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Grant banner */
.grant-banner {
  margin: 12px 20px 0;
  padding: 14px 16px;
  background: #f2ebfd;
  border: 1px solid #c9b0f0;
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.grant-banner-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
  letter-spacing: -0.1px;
}
.grant-banner-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
}
.grant-banner-sub :deep(b) {
  color: #5b3795;
  font-weight: 800;
}

/* Section heading */
.section-h-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 18px 20px 10px;
}
.section-h {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.section-h-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-dark);
}

/* Mission list */
.pathway-empty {
  margin: 14px 20px 0;
  padding: 22px 18px;
  background: var(--card);
  border: 1.5px dashed var(--border);
  border-radius: 14px;
  text-align: center;
  box-shadow: var(--shadow-card);
}
.pathway-empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin: 0 auto 10px;
  background: var(--accent-paler);
  color: var(--accent-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
}
.pathway-empty-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}
.pathway-empty-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}

.mission-list {
  padding: 10px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mission-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: var(--shadow-card);
  transition: all 0.18s;
}
.mission-card:hover {
  border-color: var(--accent-pale);
  transform: translateY(-1px);
}
.mission-card.priority {
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  position: relative;
}
.mission-card.priority::before {
  content: 'PRIORITY';
  position: absolute;
  top: -9px;
  left: 14px;
  padding: 2px 8px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  background: var(--accent);
  color: white;
  border-radius: 100px;
}
.mission-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}
.mission-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.mission-card.priority .mission-icon {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
}
.mission-info {
  flex: 1;
  min-width: 0;
}
.mission-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-bottom: 3px;
  line-height: 1.25;
}
.mission-meta {
  font-size: 11.5px;
  color: var(--text-secondary);
  font-weight: 500;
  line-height: 1.4;
}
.mission-rewards {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.quest-reward {
  padding: 4px 9px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.quest-reward.stat {
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
}
.quest-reward.money {
  background: var(--warning-pale);
  color: #7a5500;
  border: 1px solid rgba(245, 166, 35, 0.3);
}
.quest-reward.grant {
  background: #f2ebfd;
  color: #5b3795;
  border: 1px solid #c9b0f0;
}
.mission-actions {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-soft);
}
.mission-btn-supplier {
  flex: 1;
  padding: 11px 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: filter 0.15s;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.25);
}
.mission-btn-supplier:hover {
  filter: brightness(1.06);
}
.mission-btn-done {
  padding: 11px 16px;
  background: var(--card);
  color: var(--text-secondary);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.mission-btn-done:hover {
  border-color: var(--accent-pale);
  background: var(--accent-paler);
  color: var(--accent-dark);
}

/* Path summary */
.path-summary {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 12px;
}
.path-summary-icon {
  font-size: 22px;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--accent-paler);
  display: flex;
  align-items: center;
  justify-content: center;
}
.path-summary-body {
  flex: 1;
}
.path-summary-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
}
.path-summary-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Bottom CTA */
.bottom-cta {
  padding: 16px 20px 24px;
}
.bottom-cta-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.15s;
}
.bottom-cta-btn:hover {
  filter: brightness(1.06);
}
.bottom-cta-secondary {
  width: 100%;
  padding: 14px;
  background: var(--card);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.15s;
}
.bottom-cta-secondary:hover {
  border-color: var(--accent-pale);
  background: var(--accent-paler);
}

/* Beyond the pathway teaser — two-section layout (v6-2) */
.moveready-teaser {
  margin: 12px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f2ebfd 0%, var(--card) 100%);
  border: 1.5px solid #c9b0f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.18s;
}
.moveready-teaser:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(91, 55, 149, 0.15);
}
.moveready-teaser-head {
  margin-bottom: 10px;
}
.moveready-teaser-eyebrow {
  font-size: 9.5px;
  font-weight: 700;
  color: #5b3795;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.moveready-teaser-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-top: 3px;
}
.moveready-teaser-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.moveready-mini {
  text-align: center;
  flex-shrink: 0;
}
.moveready-mini-ring {
  position: relative;
  width: 54px;
  height: 54px;
}
.moveready-mini-ring svg {
  width: 100%;
  height: 100%;
}
.moveready-mini-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #5b3795;
  letter-spacing: -0.3px;
}
.moveready-mini-num.accent {
  color: var(--accent-dark);
}
.moveready-mini-label {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 4px;
}
.moveready-teaser-body {
  flex: 1;
  min-width: 0;
}
.moveready-teaser-line {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}
.moveready-teaser-line :deep(b) {
  color: #5b3795;
  font-weight: 700;
}
.moveready-teaser-line2 {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 3px;
}
.moveready-teaser-arrow {
  font-size: 20px;
  color: #5b3795;
  flex-shrink: 0;
}
</style>
