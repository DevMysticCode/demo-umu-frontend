<template>
  <div class="rc-screen">

    <!-- Top nav -->
    <div class="rc-topnav">
      <button class="rc-back" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="rc-eyebrow-pill"><span class="dot" />HomeScore</div>
      <div style="width: 32px;" />
    </div>

    <!-- Amber address card (matches the rest of the homescore flow) -->
    <div v-if="property" class="rc-addr-card">
      <div class="rc-addr-top">
        <div class="rc-addr-pin" />
        <div class="rc-addr-block">
          <div class="rc-addr-line">{{ property.addressLine1 || 'This property' }}</div>
          <div class="rc-addr-meta">
            {{ property.postcode || '' }}
            <template v-if="property.propertyType"> · {{ property.propertyType }}</template>
            <template v-if="property.bedrooms"> · {{ property.bedrooms }} bed</template>
          </div>
        </div>
      </div>
    </div>

    <!-- Page title -->
    <div v-if="data" class="rc-title-block">
      <div class="rc-title">Full running costs</div>
      <div class="rc-sub">
        Everything it costs to run {{ property?.addressLine1 || 'this property' }} — energy from the
        <template v-if="data.epcYear">{{ data.epcYear }} EPC</template>
        <template v-else>EPC data</template>, other costs estimated for {{ property?.postcode?.split(' ')[0] || 'this area' }}.
      </div>
    </div>

    <!-- Loading / error states -->
    <div v-if="loading" class="rc-loading">Loading running costs…</div>
    <div v-else-if="error" class="rc-error">{{ error }}</div>

    <template v-else-if="data">
      <!-- HERO — annual + monthly + comparison bar -->
      <div class="rc-hero">
        <div class="rc-hero-eyebrow"><span class="dot" />Estimated total per year</div>
        <div class="rc-hero-num">£{{ fmt(data.totalAnnual) }}<span class="unit"> / year</span></div>
        <div class="rc-hero-monthly">
          That's about <b>£{{ fmt(data.totalMonthly) }} / month</b> across energy, water and council tax.
        </div>
        <div class="rc-compare">
          <div class="rc-compare-bar">
            <div class="rc-bar-you" :style="{ width: youBarWidth + '%' }" />
            <div class="rc-bar-avg" :style="{ width: avgBarWidth + '%' }" />
          </div>
          <div class="rc-compare-text">
            <b>£{{ fmt(diff) }} {{ diffDirection }}</b> than street avg in energy costs
          </div>
        </div>
      </div>

      <!-- ENERGY -->
      <div class="rc-section-h">
        <div class="rc-section-h-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />
          </svg>
        </div>
        <div class="rc-section-h-text">
          <div class="rc-section-h-title">Energy</div>
          <div class="rc-section-h-sub">
            <template v-if="data.epcYear">From {{ data.epcYear }} EPC · </template>
            {{ data.tariffs.source }} tariffs · total £{{ fmt(data.energy.total) }}/yr
          </div>
        </div>
      </div>
      <div class="rc-card rc-card--teal-tint">
        <div class="rc-row">
          <div class="rc-row-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
              <path d="M12 22s-7-4-7-11c0-4 3-7 5-9 0 3 2 5 4 6 2 1 5 3 5 8 0 4-3 6-7 6z" />
            </svg>
          </div>
          <div class="rc-row-body">
            <div class="rc-row-title">Heating</div>
            <div class="rc-row-meta">
              <template v-if="data.energy.heating.kwh">{{ fmt(data.energy.heating.kwh) }} kWh/yr · </template>
              {{ data.energy.heating.label }} · {{ (data.energy.heating.tariff * 100).toFixed(2) }}p/kWh
            </div>
          </div>
          <div class="rc-row-num">
            <div class="rc-row-num-big">£{{ fmt(data.energy.heating.cost) }}</div>
            <div class="rc-row-num-unit">/ year</div>
          </div>
        </div>
        <div class="rc-row">
          <div class="rc-row-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
              <path d="M12 3 Q5 12 5 16 a7 7 0 0 0 14 0 Q19 12 12 3z" />
            </svg>
          </div>
          <div class="rc-row-body">
            <div class="rc-row-title">Hot water</div>
            <div class="rc-row-meta">
              <template v-if="data.energy.hotWater.kwh">{{ fmt(data.energy.hotWater.kwh) }} kWh/yr · </template>
              {{ data.energy.hotWater.label }}
            </div>
          </div>
          <div class="rc-row-num">
            <div class="rc-row-num-big">£{{ fmt(data.energy.hotWater.cost) }}</div>
            <div class="rc-row-num-unit">/ year</div>
          </div>
        </div>
        <div class="rc-row">
          <div class="rc-row-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="9" y1="3" x2="9" y2="8" />
              <line x1="15" y1="3" x2="15" y2="8" />
              <path d="M6 8h12v3a6 6 0 0 1-12 0z" />
              <line x1="12" y1="17" x2="12" y2="22" />
            </svg>
          </div>
          <div class="rc-row-body">
            <div class="rc-row-title">Electricity &amp; lighting</div>
            <div class="rc-row-meta">
              <template v-if="data.energy.electricity.kwh">~{{ fmt(data.energy.electricity.kwh) }} kWh/yr · </template>
              {{ (data.energy.electricity.tariff * 100).toFixed(1) }}p/kWh · {{ data.energy.electricity.label }}
            </div>
          </div>
          <div class="rc-row-num">
            <div class="rc-row-num-big">£{{ fmt(data.energy.electricity.cost) }}</div>
            <div class="rc-row-num-unit">/ year</div>
          </div>
        </div>
        <div class="rc-card-foot">
          <div>EPC energy total</div>
          <div>£{{ fmt(data.energy.total) }} / yr</div>
        </div>
        <div class="rc-card-foot-note">
          With all improvements: could fall to £{{ fmt(data.energy.potentialTotal) }}/yr — saving £{{ fmt(data.energy.potentialSaving) }}
        </div>
      </div>

      <!-- WATER -->
      <div class="rc-section-h">
        <div class="rc-section-h-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
            <path d="M12 3 Q5 12 5 16 a7 7 0 0 0 14 0 Q19 12 12 3z" />
          </svg>
        </div>
        <div class="rc-section-h-text">
          <div class="rc-section-h-title">Water &amp; sewerage</div>
          <div class="rc-section-h-sub">{{ data.water.label }}</div>
        </div>
      </div>
      <div class="rc-card">
        <div class="rc-row">
          <div class="rc-row-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
              <path d="M12 3 Q5 12 5 16 a7 7 0 0 0 14 0 Q19 12 12 3z" />
            </svg>
          </div>
          <div class="rc-row-body">
            <div class="rc-row-title">Water &amp; sewerage</div>
            <div class="rc-row-meta">Estimated · installing a meter could reduce this</div>
          </div>
          <div class="rc-row-num">
            <div class="rc-row-num-big">£{{ fmt(data.water.cost) }}</div>
            <div class="rc-row-num-unit">/ year</div>
          </div>
        </div>
      </div>

      <!-- COUNCIL TAX -->
      <div class="rc-section-h">
        <div class="rc-section-h-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="rc-section-h-text">
          <div class="rc-section-h-title">Council tax</div>
          <div class="rc-section-h-sub">{{ data.councilTax.council }} · band {{ data.councilTax.band }}</div>
        </div>
      </div>
      <div class="rc-card">
        <div class="rc-row">
          <div class="rc-row-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="rc-row-body">
            <div class="rc-row-title">Council tax</div>
            <div class="rc-row-meta">Band {{ data.councilTax.band }} · {{ data.councilTax.council }} · fixed regardless of energy improvements</div>
          </div>
          <div class="rc-row-num">
            <div class="rc-row-num-big">£{{ fmt(data.councilTax.cost) }}</div>
            <div class="rc-row-num-unit">/ year</div>
          </div>
        </div>
      </div>

      <!-- Confidence banner -->
      <div class="rc-confidence">
        <template v-if="data.confidence === 'epc'">
          Based on
          <template v-if="data.epcYear">{{ data.epcYear }} </template>
          EPC data · {{ data.tariffs.source }} tariffs · estimates only
        </template>
        <template v-else>
          Based on EPC rating averages · {{ data.tariffs.source }} tariffs · estimates only
        </template>
      </div>

      <!-- Upload bill CTA -->
      <div class="rc-upload">
        <div class="rc-upload-emoji">📄</div>
        <div class="rc-upload-body">
          <div class="rc-upload-title">Are these numbers accurate?</div>
          <div class="rc-upload-sub">Upload an actual bill and we'll replace these estimates with your real figures.</div>
        </div>
        <button type="button" class="rc-upload-btn" @click="onUpload">Upload →</button>
      </div>

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

const youCost = computed(() => data.value?.energy.total ?? 0)
const avgCost = computed(() => data.value?.streetAverageEnergy ?? 0)
const diff = computed(() => Math.abs(youCost.value - avgCost.value))
const diffDirection = computed(() => (youCost.value >= avgCost.value ? 'more' : 'less'))

// Comparison-bar widths — normalise so the bigger of the two = 100%.
const youBarWidth = computed(() => {
  const max = Math.max(youCost.value, avgCost.value, 1)
  return Math.round((youCost.value / max) * 100)
})
const avgBarWidth = computed(() => {
  const max = Math.max(youCost.value, avgCost.value, 1)
  return Math.round((avgCost.value / max) * 100)
})

function fmt(n: number | null | undefined): string {
  if (n == null) return '0'
  return new Intl.NumberFormat('en-GB').format(Math.round(n))
}
function onUpload() {
  router.push(`/onboarding/signin?reason=upload-bill&redirect=/homescore/${propertyId}`)
}
</script>

<style scoped>
.rc-screen {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 24px;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Top nav ───────────────────────────────────────────────── */
.rc-topnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px 8px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.rc-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.rc-back svg { width: 14px; height: 14px; }
.rc-eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #00a19a;
  text-transform: uppercase;
}
.rc-eyebrow-pill .dot {
  width: 6px;
  height: 6px;
  background: #00a19a;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #e2f1ea;
}

/* ── Amber address card ───────────────────────────────────── */
.rc-addr-card {
  margin: 16px 22px 0;
  border-radius: 22px;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #F0A030 0%, #C67C18 50%, #8B4E0A 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 32px -8px rgba(180, 100, 20, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.rc-addr-card::after {
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
.rc-addr-card > * { position: relative; z-index: 1; }
.rc-addr-top { display: flex; align-items: flex-start; gap: 10px; }
.rc-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.30);
  flex-shrink: 0;
  margin-top: 6px;
}
.rc-addr-block { flex: 1; min-width: 0; }
.rc-addr-line { font-size: 19px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2; }
.rc-addr-meta { font-size: 12.5px; font-weight: 600; color: rgba(255, 255, 255, 0.78); margin-top: 2px; }

/* ── Page title ───────────────────────────────────────────── */
.rc-title-block { padding: 18px 22px 4px; }
.rc-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.6px;
  color: #231d45;
}
.rc-sub {
  font-size: 12.5px;
  color: #6b6783;
  margin-top: 6px;
  line-height: 1.5;
}

/* ── Loading / error ──────────────────────────────────────── */
.rc-loading, .rc-error {
  padding: 24px 22px;
  font-size: 13px;
  color: #6b6783;
  text-align: center;
}
.rc-error { color: #C73E36; }

/* ── HERO ─────────────────────────────────────────────────── */
.rc-hero {
  margin: 12px 22px 0;
  background: #fff;
  border: 2px solid #00a19a;
  border-radius: 18px;
  padding: 20px 18px 18px;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.10);
}
.rc-hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #007e78;
  margin-bottom: 8px;
}
.rc-hero-eyebrow .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00a19a;
}
.rc-hero-num {
  font-size: 36px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -1.2px;
  line-height: 1;
  font-feature-settings: 'tnum';
}
.rc-hero-num .unit {
  font-size: 18px;
  font-weight: 700;
  color: #9c98ad;
  letter-spacing: -0.3px;
  margin-left: 2px;
}
.rc-hero-monthly {
  font-size: 12.5px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 6px;
}
.rc-hero-monthly b { color: #231d45; font-weight: 800; }
.rc-compare { margin-top: 14px; }
.rc-compare-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rc-bar-you {
  height: 8px;
  background: linear-gradient(90deg, #00a19a, #007e78);
  border-radius: 100px;
  min-width: 8%;
  transition: width 0.6s ease;
}
.rc-bar-avg {
  height: 8px;
  background: #ECECEF;
  border-radius: 100px;
  min-width: 8%;
  transition: width 0.6s ease;
}
.rc-compare-text {
  font-size: 11px;
  font-weight: 600;
  color: #6b6783;
  margin-top: 8px;
}
.rc-compare-text b { color: #231d45; font-weight: 800; }

/* ── Section headers ──────────────────────────────────────── */
.rc-section-h {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 22px 8px;
}
.rc-section-h-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f1f9f4;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.rc-section-h-icon svg { width: 14px; height: 14px; }
.rc-section-h-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.rc-section-h-sub {
  font-size: 11px;
  font-weight: 600;
  color: #6b6783;
  margin-top: 2px;
}

/* ── Cards + rows ─────────────────────────────────────────── */
.rc-card {
  margin: 0 22px;
  background: #fff;
  border: 1.5px solid #ECECEF;
  border-radius: 14px;
  overflow: hidden;
}
.rc-card--teal-tint {
  background: linear-gradient(180deg, #F2FAF8 0%, #fff 40%);
}
.rc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #F5F5F7;
}
.rc-row:last-child { border-bottom: none; }
.rc-row-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #f1f9f4;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.rc-row-icon svg { width: 16px; height: 16px; }
.rc-row-body { flex: 1; min-width: 0; }
.rc-row-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
}
.rc-row-meta {
  font-size: 11px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 2px;
  line-height: 1.4;
}
.rc-row-num {
  text-align: right;
  flex-shrink: 0;
}
.rc-row-num-big {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  line-height: 1;
}
.rc-row-num-unit {
  font-size: 10px;
  color: #9c98ad;
  font-weight: 600;
  margin-top: 2px;
}

/* Card footer total (inside the energy card) */
.rc-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 14px 4px;
  padding: 10px 12px;
  background: #F2FAF8;
  border: 1.5px solid #E5F4F2;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 800;
  color: #007e78;
}
.rc-card-foot-note {
  margin: 6px 14px 10px;
  font-size: 10px;
  color: #9c98ad;
}

/* Confidence banner */
.rc-confidence {
  margin: 12px 22px 0;
  padding: 10px 14px;
  background: #F2FAF8;
  border: 1px solid #E5F4F2;
  border-radius: 10px;
  font-size: 10.5px;
  font-weight: 700;
  color: #007e78;
}

/* Upload bill CTA */
.rc-upload {
  margin: 12px 22px 0;
  padding: 16px 18px;
  background: #F2FAF8;
  border: 2px solid #E5F4F2;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.rc-upload-emoji { font-size: 28px; flex-shrink: 0; }
.rc-upload-body { flex: 1; min-width: 0; }
.rc-upload-title { font-size: 13px; font-weight: 800; color: #231d45; }
.rc-upload-sub {
  font-size: 11px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 3px;
  line-height: 1.5;
}
.rc-upload-btn {
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
}
.rc-upload-btn:hover { background: #00b6ae; }
</style>
