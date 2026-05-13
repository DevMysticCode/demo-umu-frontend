<template>
  <div class="pq-screen">

    <!-- Top nav -->
    <div class="pq-topnav">
      <button class="pq-back-btn" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="pq-eyebrow-pill"><span class="dot" />HomeScore</div>
      <div style="width: 32px;" />
    </div>

    <!-- ── Amber address card — same as ResultDetail (pills + state + stats) ── -->
    <div v-if="property" class="pq-addr-card">
      <div class="pq-addr-top">
        <div class="pq-addr-pin" />
        <div class="pq-addr-block">
          <div class="pq-addr-line">{{ property.addressLine1 || 'This property' }}</div>
          <div class="pq-addr-meta">
            {{ property.postcode || '' }}
            <template v-if="property.propertyType"> · {{ property.propertyType }}</template>
            <template v-if="property.bedrooms"> · {{ property.bedrooms }} bed</template>
          </div>
        </div>
      </div>

      <div class="pq-addr-pills">
        <span v-if="property.epcRating" class="pq-addr-pill epc">
          <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
            <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />
          </svg>
          <span class="pq-epc-letter" :style="{ background: epcColor }">{{ property.epcRating }}</span>
          EPC
        </span>
        <span v-if="passportState === 'unclaimed'" class="pq-addr-pill pq-state-unclaimed">Unclaimed</span>
        <span v-else-if="passportState === 'inProgress'" class="pq-addr-pill pq-state-progress">In progress</span>
        <span v-else class="pq-addr-pill pq-state-published">✓ Published</span>
      </div>

      <div class="pq-addr-stats">
        <div v-if="passportState === 'unclaimed'" class="pq-stat-row">
          <span class="pq-pulse-dot" />
          <span class="pq-stat-count">{{ randomSearches }} searches today</span>
          <span class="pq-sep">·</span>
          <span>No verified Passport yet</span>
        </div>
        <div v-else-if="passportState === 'inProgress'" class="pq-stat-row">
          <span class="pq-pulse-dot" />
          <span class="pq-stat-count">{{ randomSearches + 1 }} searches today</span>
          <span class="pq-sep">·</span>
          <span>Passport in progress</span>
        </div>
        <div v-else class="pq-stat-row">
          <span class="pq-pulse-dot pq-pulse-green" />
          <span class="pq-stat-count">{{ randomSearches * 6 }} searches this month</span>
          <span class="pq-sep">·</span>
          <span>Verified Passport live</span>
        </div>
      </div>
    </div>

    <!-- Page title -->
    <div v-if="data" class="pq-costs-title-block">
      <div class="pq-costs-title">Your running costs</div>
      <div class="pq-costs-sub">Refined with your quiz answers — more accurate than public EPC data alone.</div>
    </div>

    <!-- Loading / error states -->
    <div v-if="loading" class="pq-loading">Loading running costs…</div>
    <div v-else-if="error" class="pq-error">{{ error }}</div>

    <template v-else-if="data">
      <!-- ── Total cost hero ──────────────────────────────────── -->
      <div class="pq-cost-hero">
        <div class="pq-cost-hero-eyebrow"><span class="dot" />Refined total per year</div>
        <div class="pq-cost-hero-num">£{{ fmt(data.totalAnnual) }}<span class="unit"> / year</span></div>
        <div class="pq-cost-hero-monthly">
          That's about <b>£{{ fmt(data.totalMonthly) }} / month</b> — based on your quiz answers.
        </div>
        <div class="pq-cost-compare">
          <span class="pq-cost-compare-num">£{{ fmt(diffAmount) }}</span>
          <span class="pq-cost-compare-label">
            {{ diffDirection }} the {{ streetName }} street average
          </span>
        </div>
      </div>

      <!-- ── Energy & utilities ───────────────────────────────── -->
      <div class="pq-section-h">
        <div class="pq-section-h-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />
          </svg>
        </div>
        <div class="pq-section-h-text">
          <div class="pq-section-h-title">Energy &amp; utilities</div>
          <div class="pq-section-h-sub">Based on your quiz answers and EPC data</div>
        </div>
      </div>
      <div class="pq-cost-card pq-card-teal-tint">
        <div class="pq-cost-row">
          <div class="pq-cost-row-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
              <path d="M12 22s-7-4-7-11c0-4 3-7 5-9 0 3 2 5 4 6 2 1 5 3 5 8 0 4-3 6-7 6z" />
            </svg>
          </div>
          <div class="pq-cost-row-body">
            <div class="pq-cost-row-title">Gas &amp; heating</div>
            <div class="pq-cost-row-meta">
              <template v-if="gasKwh">{{ fmt(gasKwh) }} kWh/yr · </template>
              gas {{ (data.tariffs.gas * 100).toFixed(2) }}p
            </div>
          </div>
          <div class="pq-cost-row-val">£{{ fmt(gasCost) }}<span class="unit">/yr</span></div>
        </div>
        <div class="pq-cost-row">
          <div class="pq-cost-row-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />
            </svg>
          </div>
          <div class="pq-cost-row-body">
            <div class="pq-cost-row-title">Electricity</div>
            <div class="pq-cost-row-meta">
              <template v-if="data.energy.electricity.kwh">~{{ fmt(data.energy.electricity.kwh) }} kWh/yr · </template>
              elec {{ (data.tariffs.electricity * 100).toFixed(1) }}p
            </div>
          </div>
          <div class="pq-cost-row-val">£{{ fmt(data.energy.electricity.cost) }}<span class="unit">/yr</span></div>
        </div>
        <div class="pq-cost-row">
          <div class="pq-cost-row-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
              <path d="M12 3 Q5 12 5 16 a7 7 0 0 0 14 0 Q19 12 12 3z" />
            </svg>
          </div>
          <div class="pq-cost-row-body">
            <div class="pq-cost-row-title">Water</div>
            <div class="pq-cost-row-meta">{{ shortWaterLabel }}</div>
          </div>
          <div class="pq-cost-row-val">£{{ fmt(data.water.cost) }}<span class="unit">/yr</span></div>
        </div>
      </div>

      <!-- ── Confidence note ──────────────────────────────────── -->
      <div class="pq-confidence">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <circle cx="12" cy="7.5" r="0.9" fill="currentColor" />
        </svg>
        <div>
          These figures are
          <b>refined using your quiz answers</b>
          — more accurate than public EPC estimates alone.
        </div>
      </div>

      <!-- ── Environmental impact ─────────────────────────────── -->
      <div class="pq-section-h">
        <div class="pq-section-h-icon pq-icon-env">🌍</div>
        <div class="pq-section-h-text">
          <div class="pq-section-h-title">Environmental impact</div>
          <div class="pq-section-h-sub">Based on your quiz answers and UK grid emissions</div>
        </div>
      </div>
      <div class="pq-cost-card pq-env-card">
        <div class="pq-env-top">
          <div class="pq-env-co2">
            <div class="pq-env-co2-num">{{ fmt(data.environmentalImpact.co2NowKg) }}</div>
            <div class="pq-env-co2-unit">kg CO₂ per year</div>
          </div>
          <div class="pq-env-rating">
            <div class="pq-env-rating-letter">{{ data.environmentalImpact.ratingCurrent }}</div>
            <div class="pq-env-rating-label">{{ data.environmentalImpact.ratingLabel }}</div>
          </div>
        </div>
        <div class="pq-env-context">
          <template v-if="co2DiffKg > 0">
            <b>{{ fmt(co2DiffKg) }} kg above</b> the UK average of {{ fmt(data.environmentalImpact.ukAverageKg) }} kg per year
          </template>
          <template v-else-if="co2DiffKg < 0">
            <b>{{ fmt(Math.abs(co2DiffKg)) }} kg below</b> the UK average of {{ fmt(data.environmentalImpact.ukAverageKg) }} kg per year
          </template>
          <template v-else>
            <b>About average</b> · UK household: {{ fmt(data.environmentalImpact.ukAverageKg) }} kg per year
          </template>
        </div>
        <div class="pq-env-scale">
          <div class="pq-env-scale-bars">
            <div
              v-for="(b, i) in envBars"
              :key="i"
              class="pq-env-bar"
              :class="{ active: b.active }"
              :style="{ background: b.color }"
            />
          </div>
          <div class="pq-env-scale-labels">
            <span>A — very low</span>
            <span>D — avg</span>
            <span>G — very high</span>
          </div>
        </div>
        <div class="pq-env-divider" />
        <div class="pq-env-improvement">
          <div>
            <div class="pq-env-improvement-label">If you made the top improvements</div>
            <div class="pq-env-improvement-sub">You could cut emissions by ~{{ Math.round(data.environmentalImpact.reductionPct) }}%</div>
          </div>
          <div class="pq-env-improvement-saving">Save ~{{ fmt(data.environmentalImpact.savingKg) }} kg/yr</div>
        </div>
      </div>

      <!-- ── Top 3 ways to save money ─────────────────────────── -->
      <div class="pq-section-h">
        <div class="pq-section-h-icon pq-icon-save">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M12 2l2 6 6 1-4.5 4 1.5 7-5-3-5 3 1.5-7L4 9l6-1z" />
          </svg>
        </div>
        <div class="pq-section-h-text">
          <div class="pq-section-h-title">Top 3 ways to save money</div>
          <div class="pq-section-h-sub">Ranked by annual saving — based on your quiz answers</div>
        </div>
      </div>
      <div class="pq-cost-card pq-savings-card">
        <div
          v-for="(s, idx) in data.savings"
          :key="idx"
          class="pq-savings-row"
          :class="{ 'pq-savings-row--last': idx === data.savings.length - 1 }"
        >
          <div class="pq-savings-num">{{ idx + 1 }}</div>
          <div class="pq-savings-body">
            <div class="pq-savings-title">{{ s.title }}</div>
            <div class="pq-savings-sub">{{ s.sub }}</div>
          </div>
          <div class="pq-savings-val">
            <div class="pq-savings-amount">~£{{ fmt(s.amount) }}/yr</div>
            <div class="pq-savings-pts">+{{ s.points }} pts</div>
          </div>
        </div>
      </div>

      <button class="pq-back-link" @click="router.back()">← Back to your score</button>
      <div style="height: 24px;" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface RunningCosts {
  energy: {
    heating: { cost: number; kwh: number | null; tariff: number; label: string }
    hotWater: { cost: number; kwh: number | null; tariff: number; label: string }
    electricity: { cost: number; kwh: number | null; tariff: number; label: string }
    total: number
    potentialTotal: number
    potentialSaving: number
  }
  environmentalImpact: {
    co2Now: number
    co2Potential: number
    reductionPct: number
    ukAverage: number
    co2NowKg: number
    co2PotentialKg: number
    ukAverageKg: number
    savingKg: number
    ratingCurrent: string
    ratingPotential: string
    ratingLabel: string
  }
  savings: Array<{ title: string; sub: string; amount: number; points: number }>
  water: { cost: number; label: string }
  councilTax: { band: string; cost: number; council: string }
  totalAnnual: number
  totalMonthly: number
  streetAverageEnergy: number
  tariffs: { gas: number; electricity: number; source: string }
  epcYear: number | null
  confidence: 'epc' | 'estimated'
}

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const propertyId = route.params.id as string

const property = ref<any>(null)
const data = ref<RunningCosts | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const [propRes, costsRes] = await Promise.all([
      fetch(`${config.public.apiBase}/property/${propertyId}`),
      fetch(`${config.public.apiBase}/property/${propertyId}/running-costs`),
    ])
    if (propRes.ok) property.value = await propRes.json()
    if (!costsRes.ok) {
      error.value =
        costsRes.status === 404
          ? "We can't find this property."
          : 'Could not load running costs right now.'
    } else {
      data.value = await costsRes.json()
    }
  } catch {
    error.value = 'Network error — please try again.'
  } finally {
    loading.value = false
  }
})

// Combine heating + hot water into a single "Gas & heating" row to match the
// prototype's simpler 3-row breakdown.
const gasCost = computed(
  () => (data.value?.energy.heating.cost ?? 0) + (data.value?.energy.hotWater.cost ?? 0),
)
const gasKwh = computed(() => {
  const h = data.value?.energy.heating.kwh ?? 0
  const w = data.value?.energy.hotWater.kwh ?? 0
  const total = h + w
  return total > 0 ? total : null
})

const youCost = computed(() => data.value?.energy.total ?? 0)
const avgCost = computed(() => data.value?.streetAverageEnergy ?? 0)
const diffAmount = computed(() => Math.abs(youCost.value - avgCost.value))
const diffDirection = computed(() => {
  if (diffAmount.value === 0) return 'at'
  return youCost.value > avgCost.value ? 'above' : 'below'
})

const streetName = computed(() => {
  const line = (property.value?.addressLine1 || '').trim()
  if (!line) return 'street'
  // Strip the leading house number, leave the road name.
  const match = line.match(/^\d+\s*[a-zA-Z]?\s*[,.]?\s*(.+)$/)
  return match?.[1] || line
})

const shortWaterLabel = computed(() => {
  const label = data.value?.water?.label || ''
  // "Severn Trent · unmetered household" → "Severn Trent · CV5 estimate"
  const supplier = label.split('·')[0]?.trim() || 'Regional supplier'
  const outcode = (property.value?.postcode || '').split(' ')[0]
  return outcode ? `${supplier} · ${outcode} estimate` : `${supplier} · area estimate`
})

const co2DiffKg = computed(() => {
  if (!data.value) return 0
  return data.value.environmentalImpact.co2NowKg - data.value.environmentalImpact.ukAverageKg
})

// EPC-style 6-bar A–G scale with the current band highlighted.
const envBars = computed(() => {
  const order = ['A', 'B', 'C', 'D', 'E', 'F']
  // Use 6 bars (the prototype shows A-F + G stripe pattern; we map A→F to the
  // 6 colored bars and treat G as "very high" via the highest red).
  const colors = ['#4A8C3F', '#7AB040', '#C8A020', '#D86F4A', '#C73E36', '#8B1A1A']
  const current = (data.value?.environmentalImpact.ratingCurrent || 'D').toUpperCase()
  const idx = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].indexOf(current)
  const activeIdx = Math.min(5, Math.max(0, idx))
  return order.map((_, i) => ({
    color: colors[i],
    active: i === activeIdx,
  }))
})

const passportState = computed<'unclaimed' | 'inProgress' | 'published'>(() => {
  const p: any = property.value
  if (!p) return 'unclaimed'
  if (p.passportPublished) return 'published'
  if (p.hasPassport) return 'inProgress'
  return 'unclaimed'
})

const epcColor = computed(() => {
  const map: Record<string, string> = {
    A: '#00B050',
    B: '#33B800',
    C: '#92D050',
    D: '#FFD700',
    E: '#FF9933',
    F: '#FF6600',
    G: '#E64A19',
  }
  return map[(property.value?.epcRating || '').toUpperCase()] || '#9c98ad'
})

const randomSearches = computed<number>(() => {
  const id = property.value?.id || ''
  return 3 + ((id.charCodeAt(0) || 1) % 7)
})

function fmt(n: number | null | undefined): string {
  if (n == null) return '0'
  return new Intl.NumberFormat('en-GB').format(Math.round(n))
}
</script>

<style scoped>
/* ── Design tokens (mirrors prototype palette) ─────────────── */
.pq-screen {
  --navy: #231d45;
  --navy-soft: #4a4566;
  --teal: #00a19a;
  --teal-bright: #00b6ae;
  --teal-dark: #007e78;
  --teal-deep: #00514d;
  --teal-pale: #E5F4F2;
  --teal-paler: #F2FAF8;
  --amber: #E6A23C;
  --amber-pale: #FBEFD9;
  --red: #C73E36;
  --red-pale: #FCEBEA;
  --bg: #fafafa;
  --text-soft: #6b6783;
  --text-faint: #9c98ad;
  --line: #ECECEF;
  --line-soft: #F5F5F7;
  --success: #2EAB55;

  min-height: 100dvh;
  background: var(--bg);
  color: var(--navy);
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 24px;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Top nav ───────────────────────────────────────────────── */
.pq-topnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px 8px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.pq-back-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--teal-paler);
  border: 1px solid var(--teal-pale);
  color: var(--teal);
  display: grid;
  place-items: center;
  cursor: pointer;
  font-family: inherit;
}
.pq-back-btn svg { width: 14px; height: 14px; }
.pq-eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--teal-paler);
  border: 1px solid var(--teal-pale);
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--teal);
  text-transform: uppercase;
}
.pq-eyebrow-pill .dot {
  width: 6px;
  height: 6px;
  background: var(--teal);
  border-radius: 50%;
  box-shadow: 0 0 0 3px var(--teal-pale);
}

/* ── Amber address card (consistent with ResultDetail) ────── */
.pq-addr-card {
  margin: 16px 22px 0;
  border-radius: 22px;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #F0A030 0%, #C67C18 50%, #8B4E0A 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 32px -8px rgba(180, 100, 20, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.pq-addr-card::after {
  content: '';
  position: absolute;
  top: -45%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 65%);
  pointer-events: none;
}
.pq-addr-card > * { position: relative; z-index: 1; }
.pq-addr-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
.pq-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.30);
  flex-shrink: 0;
  margin-top: 6px;
}
.pq-addr-block { flex: 1; min-width: 0; }
.pq-addr-line { font-size: 19px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2; }
.pq-addr-meta { font-size: 12.5px; font-weight: 600; color: rgba(255, 255, 255, 0.78); margin-top: 2px; }

.pq-addr-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.pq-addr-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.05px;
}
.pq-addr-pill.epc { padding-left: 6px; }
.pq-epc-letter {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}
.pq-state-unclaimed,
.pq-state-progress {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.94);
  color: #7a3a05;
}
.pq-state-published {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.94);
  color: var(--teal-deep);
}
.pq-addr-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.pq-stat-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}
.pq-stat-count { font-weight: 800; }
.pq-sep { opacity: 0.5; }
.pq-pulse-dot {
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}
.pq-pulse-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  animation: pq-pulse 1.6s ease-out infinite;
}
.pq-pulse-green { background: #6bd4cd; }
.pq-pulse-green::after { border-color: rgba(94, 234, 212, 0.5); }
@keyframes pq-pulse {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* ── Page title ───────────────────────────────────────────── */
.pq-costs-title-block { padding: 18px 22px 0; }
.pq-costs-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.4px;
  line-height: 1.15;
  margin-bottom: 4px;
}
.pq-costs-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  line-height: 1.45;
}

/* ── Loading / error ──────────────────────────────────────── */
.pq-loading, .pq-error {
  padding: 24px 22px;
  font-size: 13px;
  color: var(--text-soft);
  text-align: center;
}
.pq-error { color: var(--red); }

/* ── Cost hero (teal gradient) ────────────────────────────── */
.pq-cost-hero {
  margin: 14px 22px 0;
  padding: 22px 22px 20px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(140deg, var(--teal-bright) 0%, var(--teal) 50%, var(--teal-deep) 100%);
  box-shadow:
    0 12px 32px -10px rgba(0, 161, 154, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.pq-cost-hero::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, transparent 65%);
  pointer-events: none;
}
.pq-cost-hero-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.pq-cost-hero-eyebrow .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
}
.pq-cost-hero-num {
  font-size: 34px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
  line-height: 1;
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
}
.pq-cost-hero-num .unit {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.78);
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-left: 2px;
}
.pq-cost-hero-monthly {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: -0.05px;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}
.pq-cost-hero-monthly b { color: #fff; font-weight: 800; }
.pq-cost-compare {
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}
.pq-cost-compare-num {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
}
.pq-cost-compare-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.3;
}

/* ── Section headers ──────────────────────────────────────── */
.pq-section-h {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 22px 10px;
}
.pq-section-h-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--teal-bright), var(--teal-dark));
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.30);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}
.pq-section-h-icon svg { width: 16px; height: 16px; }
.pq-icon-env {
  background: linear-gradient(135deg, #C45C2A, #8B2E0A);
  box-shadow: 0 3px 10px rgba(196, 92, 42, 0.30);
}
.pq-icon-save {
  background: linear-gradient(135deg, var(--navy-soft), var(--navy));
  box-shadow: 0 3px 10px rgba(35, 29, 69, 0.30);
}
.pq-section-h-text { flex: 1; min-width: 0; }
.pq-section-h-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.2px;
  line-height: 1.1;
}
.pq-section-h-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  margin-top: 2px;
}

/* ── Cost card (teal border) + rows ───────────────────────── */
.pq-cost-card {
  margin: 0 22px;
  background: #fff;
  border: 2px solid var(--teal);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.08);
}
.pq-card-teal-tint {
  background: linear-gradient(180deg, var(--teal-paler) 0%, white 40%);
}
.pq-cost-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line-soft);
  transition: background 0.15s;
}
.pq-cost-row:last-child { border-bottom: none; }
.pq-cost-row:hover { background: var(--bg); }
.pq-cost-row-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--teal-paler);
  color: var(--teal-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pq-cost-row-icon svg { width: 15px; height: 15px; }
.pq-cost-row-body { flex: 1; min-width: 0; }
.pq-cost-row-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.2px;
  margin-bottom: 1px;
}
.pq-cost-row-meta {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-soft);
  letter-spacing: -0.05px;
}
.pq-cost-row-val {
  font-size: 13px;
  font-weight: 800;
  color: var(--navy);
  white-space: nowrap;
  flex-shrink: 0;
}
.pq-cost-row-val .unit {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-soft);
  margin-left: 1px;
}

/* ── Confidence note ──────────────────────────────────────── */
.pq-confidence {
  margin: 14px 22px 0;
  padding: 12px 14px;
  background: linear-gradient(180deg, rgba(35, 29, 69, 0.04) 0%, white 100%);
  border: 1.5px solid rgba(35, 29, 69, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  line-height: 1.5;
}
.pq-confidence svg {
  width: 13px;
  height: 13px;
  color: var(--text-faint);
  flex-shrink: 0;
  margin-top: 1px;
}
.pq-confidence b { color: var(--navy); font-weight: 800; }

/* ── Environmental impact card ────────────────────────────── */
.pq-env-card {
  padding: 18px;
  border-color: #C45C2A !important;
  box-shadow: 0 4px 16px rgba(196, 92, 42, 0.12) !important;
  background: linear-gradient(180deg, rgba(252, 235, 225, 0.5) 0%, white 55%) !important;
}
.pq-env-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.pq-env-co2-num {
  font-size: 38px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -1.2px;
  line-height: 1;
}
.pq-env-co2-unit {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-soft);
  margin-top: 4px;
}
.pq-env-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FEF0E8;
  border: 1.5px solid #F4C4A0;
  padding: 7px 12px;
  border-radius: 100px;
  flex-shrink: 0;
}
.pq-env-rating-letter {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #D86F4A;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pq-env-rating-label {
  font-size: 13px;
  font-weight: 800;
  color: #A84020;
}
.pq-env-context {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-soft);
  line-height: 1.5;
  margin-bottom: 14px;
}
.pq-env-context b { color: var(--navy); }
.pq-env-scale-bars {
  display: flex;
  height: 8px;
  border-radius: 6px;
  overflow: hidden;
  gap: 2px;
  margin-bottom: 5px;
}
.pq-env-bar {
  flex: 1;
  border-radius: 2px;
}
.pq-env-bar.active {
  flex: 1.3;
  outline: 2px solid var(--navy);
  outline-offset: 1px;
  border-radius: 2px;
}
.pq-env-scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-faint);
}
.pq-env-divider {
  height: 1px;
  background: var(--line-soft);
  margin: 14px 0;
}
.pq-env-improvement {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.pq-env-improvement-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.pq-env-improvement-sub {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--navy);
}
.pq-env-improvement-saving {
  background: var(--teal);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 7px 11px;
  border-radius: 100px;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.30);
}

/* ── Top 3 savings card (navy border) ─────────────────────── */
.pq-savings-card {
  padding: 0;
  border-color: var(--navy);
  box-shadow: 0 4px 16px rgba(35, 29, 69, 0.10);
}
.pq-savings-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line-soft);
  transition: background 0.15s;
}
.pq-savings-row--last { border-bottom: none; }
.pq-savings-row:hover { background: var(--bg); }
.pq-savings-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--teal-paler);
  color: var(--teal-dark);
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pq-savings-body { flex: 1; min-width: 0; }
.pq-savings-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.15px;
  margin-bottom: 2px;
}
.pq-savings-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-soft);
  line-height: 1.4;
}
.pq-savings-val {
  text-align: right;
  flex-shrink: 0;
}
.pq-savings-amount {
  font-size: 13px;
  font-weight: 800;
  color: var(--teal-dark);
  letter-spacing: -0.2px;
}
.pq-savings-pts {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--teal);
  margin-top: 1px;
}

/* Back link */
.pq-back-link {
  display: block;
  width: calc(100% - 44px);
  margin: 18px 22px 0;
  padding: 12px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-soft);
  cursor: pointer;
  text-align: center;
}
.pq-back-link:hover { color: var(--teal-dark); }
</style>
