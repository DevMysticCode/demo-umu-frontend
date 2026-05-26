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
      <div class="app-header-right">
        <button class="app-icon-btn" type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </svg>
        </button>
      </div>
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
      <div class="section-h">EPC's 6 steps · in published order</div>
      <div class="section-h-sub">{{ fromScore }} → {{ toScore }} points</div>
    </div>

    <!-- Mission list -->
    <div class="mission-list anim-3">
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
            🔧 {{ m.supplierLabel }} →
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

    <!-- Bottom CTAs -->
    <div class="bottom-cta">
      <button class="bottom-cta-btn" type="button" @click="goToMarketplaceHub">
        🛒 Open the UmovingU Marketplace →
      </button>
      <button class="bottom-cta-secondary" type="button" @click="goToMatched">
        See your matched suppliers
      </button>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()
const propertyId = computed(() => String(route.params.id))

// Mocked from prototype — Phase 3 wiring will swap to real backend data
const addressLine = '15 Woodfield Road'
const fromScore = 52
const toScore = 75
const totalSavings = 445
const co2Cut = '3.0'

function gradeFor(score: number): string {
  if (score >= 92) return 'A'
  if (score >= 81) return 'B'
  if (score >= 69) return 'C'
  if (score >= 55) return 'D'
  if (score >= 39) return 'E'
  if (score >= 21) return 'F'
  return 'G'
}
const fromLevel = computed(() => gradeFor(fromScore))
const toLevel = computed(() => gradeFor(toScore))

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

const missions: Mission[] = [
  {
    id: 'loft',
    icon: '🏠',
    title: 'Loft insulation to 270mm',
    meta: "EPC's first recommended step. Currently 75mm + 100mm — top up to 270mm.",
    pts: '+1 pt → 53 E',
    save: '£40/yr',
    cost: '£100–£350',
    supplierLabel: 'Find insulation installers',
  },
  {
    id: 'cavity',
    icon: '🧱',
    title: 'Cavity wall insulation',
    meta: 'EPC says "cavity fill is recommended". Biggest single annual saving. Crosses you from E into D.',
    pts: '+8 pts → 61 D',
    save: '£224/yr',
    cost: '£500–£1,500',
    supplierLabel: 'Find insulation installers',
  },
  {
    id: 'floor',
    icon: '🪟',
    title: 'Floor insulation',
    meta: 'Floor assumed uninsulated. Insulating the void cuts draughts and heat loss.',
    pts: '+3 pts → 64 D',
    save: '£97/yr',
    cost: '£800–£1,200',
    supplierLabel: 'Find insulation installers',
  },
  {
    id: 'lights',
    icon: '💡',
    title: 'Low energy lighting',
    meta: "Cheapest step on the EPC. 15% of fittings are LED — swap the rest. One evening's work.",
    pts: '+1 pt → 65 D',
    save: '£45/yr',
    cost: '£110 · DIY',
    supplierLabel: 'LED suppliers',
  },
  {
    id: 'solarh',
    icon: '☀️',
    title: 'Solar water heating',
    meta: 'Solar thermal collector pre-heats hot water. Smallest annual saving — weigh against capital cost.',
    pts: '+1 pt → 66 D',
    save: '£40/yr',
    cost: '£4,000–£6,000',
    supplierLabel: 'Find solar thermal installers',
  },
  {
    id: 'solarp',
    icon: '⚡',
    title: 'Solar photovoltaic panels',
    meta: "EPC's final step. Biggest annual saving. Lifts you from D into Band C.",
    pts: '+9 pts → 75 C',
    save: '£248/yr + SEG',
    cost: '£9,000–£14,000',
    supplierLabel: 'Find solar PV installers',
  },
]

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

  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
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
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: var(--card);
  border-bottom: 1px solid var(--border);
}
.back-btn,
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg);
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
</style>
