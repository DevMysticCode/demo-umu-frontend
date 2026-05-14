<template>
  <div class="rc-screen">
    <!-- Top nav -->
    <div class="rc-topnav">
      <button class="rc-back" @click="router.back()" aria-label="Back">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="rc-eyebrow-pill"><span class="dot" />HomeScore</div>
      <div style="width: 32px" />
    </div>

    <!-- Amber address card — consistent with ResultDetail -->
    <div v-if="property" class="rc-addr-card">
      <div class="rc-addr-top">
        <div class="rc-addr-pin" />
        <div class="rc-addr-block">
          <div class="rc-addr-line">
            {{ property.addressLine1 || 'This property' }}
          </div>
          <div class="rc-addr-meta">
            {{ property.postcode || '' }}
            <template v-if="property.propertyType">
              · {{ property.propertyType }}</template
            >
            <template v-if="property.bedrooms">
              · {{ property.bedrooms }} bed</template
            >
          </div>
        </div>
      </div>
      <div class="rc-addr-pills">
        <span v-if="property.epcRating" class="rc-addr-pill epc">
          <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
            <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />
          </svg>
          <span class="rc-epc-letter" :style="{ background: epcColor }">{{
            property.epcRating
          }}</span>
          EPC
        </span>
        <span
          v-if="passportState === 'unclaimed'"
          class="rc-addr-pill rc-state-unclaimed"
          >Unclaimed</span
        >
        <span
          v-else-if="passportState === 'inProgress'"
          class="rc-addr-pill rc-state-progress"
          >In progress</span
        >
        <span v-else class="rc-addr-pill rc-state-published">✓ Published</span>
      </div>
      <div class="rc-addr-stats">
        <div v-if="passportState === 'unclaimed'" class="rc-stat-row">
          <span class="rc-pulse-dot" />
          <span class="rc-stat-count">{{ randomSearches }} searches today</span>
          <span class="rc-sep">·</span>
          <span>No verified Passport on this address yet</span>
          <span class="rc-sep">·</span>
          <span>Public EPC data only</span>
        </div>
        <div v-else-if="passportState === 'inProgress'" class="rc-stat-row">
          <span class="rc-pulse-dot" />
          <span class="rc-stat-count"
            >{{ randomSearches + 1 }} searches today</span
          >
          <span class="rc-sep">·</span>
          <span>Owner is building a Passport</span>
          <span class="rc-sep">·</span>
          <span>Public EPC data only for now</span>
        </div>
        <div v-else class="rc-stat-row">
          <span class="rc-pulse-dot rc-pulse-green" />
          <span class="rc-stat-count"
            >{{ randomSearches * 6 }} searches this month</span
          >
          <span class="rc-sep">·</span>
          <span>Verified Passport live</span>
          <span class="rc-sep">·</span>
          <span>Owner's real data</span>
        </div>
      </div>
    </div>

    <!-- Page title -->
    <div v-if="data" class="rc-title-block">
      <div class="rc-title">Full running costs</div>
      <div class="rc-sub">
        Everything it costs to run
        {{ property?.addressLine1 || 'this property' }} — energy from the
        <template v-if="data.epcYear">{{ data.epcYear }} EPC</template>
        <template v-else>EPC data</template>, other costs estimated for
        {{ property?.postcode?.split(' ')[0] || 'this area' }}.
      </div>
    </div>

    <!-- Loading / error states -->
    <div v-if="loading" class="rc-loading">Loading running costs…</div>
    <div v-else-if="error" class="rc-error">{{ error }}</div>

    <template v-else-if="data">
      <!-- ═══ HERO ═══ -->
      <div class="cost-hero">
        <div class="cost-hero-eyebrow">
          <span class="dot" />Estimated total per year
        </div>
        <div class="cost-hero-num">
          £{{ fmt(data.totalAnnual) }}<span class="unit"> / year</span>
        </div>
        <div class="cost-hero-monthly">
          That's about <b>£{{ fmt(data.totalMonthly) }} / month</b> across
          energy, water and council tax.
        </div>
        <div class="cost-compare">
          <div class="cost-compare-bar">
            <div class="you" />
            <div class="avg" :style="{ width: avgBarPct + '%' }" />
          </div>
          <div class="cost-compare-text">
            <b>£{{ fmt(diff) }} {{ diffDirection }}</b> than street avg in
            energy costs
          </div>
        </div>
      </div>

      <!-- ═══ ENERGY ═══ -->
      <div class="costs-section-h">
        <div class="costs-section-h-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />
          </svg>
        </div>
        <div class="costs-section-h-text">
          <div class="costs-section-h-title">Energy</div>
          <div class="costs-section-h-sub">
            <template v-if="data.epcYear"
              >From {{ data.epcYear }} EPC ·
            </template>
            {{ data.tariffs.source }} tariffs · total £{{
              fmt(data.energy.total)
            }}/yr
          </div>
        </div>
      </div>
      <div class="cost-card cost-card--energy">
        <div class="cost-row">
          <div class="cost-row-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            >
              <path
                d="M12 22s-7-4-7-11c0-4 3-7 5-9 0 3 2 5 4 6 2 1 5 3 5 8 0 4-3 6-7 6z"
              />
            </svg>
          </div>
          <div class="cost-row-body">
            <div class="cost-row-title">Heating</div>
            <div class="cost-row-meta">
              <template v-if="data.energy.heating.kwh"
                >{{ fmt(data.energy.heating.kwh) }} kWh/yr ·
              </template>
              {{ data.energy.heating.label }} ·
              {{ (data.energy.heating.tariff * 100).toFixed(2) }}p/kWh
            </div>
          </div>
          <div class="cost-row-num">
            <div class="cost-row-num-big">
              £{{ fmt(data.energy.heating.cost) }}
            </div>
            <div class="cost-row-num-unit">/ year</div>
          </div>
        </div>
        <div class="cost-row">
          <div class="cost-row-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            >
              <path d="M12 3 Q5 12 5 16 a7 7 0 0 0 14 0 Q19 12 12 3z" />
            </svg>
          </div>
          <div class="cost-row-body">
            <div class="cost-row-title">Hot water</div>
            <div class="cost-row-meta">
              <template v-if="data.energy.hotWater.kwh"
                >{{ fmt(data.energy.hotWater.kwh) }} kWh/yr ·
              </template>
              {{ data.energy.hotWater.label }}
            </div>
          </div>
          <div class="cost-row-num">
            <div class="cost-row-num-big">
              £{{ fmt(data.energy.hotWater.cost) }}
            </div>
            <div class="cost-row-num-unit">/ year</div>
          </div>
        </div>
        <div class="cost-row">
          <div class="cost-row-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="9" y1="3" x2="9" y2="8" />
              <line x1="15" y1="3" x2="15" y2="8" />
              <path d="M6 8h12v3a6 6 0 0 1-12 0z" />
              <line x1="12" y1="17" x2="12" y2="22" />
            </svg>
          </div>
          <div class="cost-row-body">
            <div class="cost-row-title">Electricity &amp; lighting</div>
            <div class="cost-row-meta">
              <template v-if="data.energy.electricity.kwh"
                >Est. ~{{ fmt(data.energy.electricity.kwh) }} kWh/yr ·
              </template>
              {{ (data.energy.electricity.tariff * 100).toFixed(1) }}p/kWh ·
              {{ data.energy.electricity.label }}
            </div>
          </div>
          <div class="cost-row-num">
            <div class="cost-row-num-big">
              £{{ fmt(data.energy.electricity.cost) }}
            </div>
            <div class="cost-row-num-unit">/ year</div>
          </div>
        </div>

        <div class="cost-card-foot">
          <div>EPC energy total</div>
          <div>£{{ fmt(data.energy.total) }} / yr</div>
        </div>
        <div class="cost-card-foot-note">
          With all improvements: could fall to £{{
            fmt(data.energy.potentialTotal)
          }}/yr — saving £{{ fmt(data.energy.potentialSaving) }}
        </div>
      </div>

      <!-- ═══ WATER ═══ -->
      <div class="costs-section-h">
        <div class="costs-section-h-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          >
            <path d="M12 3 Q5 12 5 16 a7 7 0 0 0 14 0 Q19 12 12 3z" />
          </svg>
        </div>
        <div class="costs-section-h-text">
          <div class="costs-section-h-title">Water &amp; sewerage</div>
          <div class="costs-section-h-sub">{{ data.water.label }}</div>
        </div>
      </div>
      <div class="cost-card">
        <div class="cost-row">
          <div class="cost-row-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            >
              <path d="M12 3 Q5 12 5 16 a7 7 0 0 0 14 0 Q19 12 12 3z" />
            </svg>
          </div>
          <div class="cost-row-body">
            <div class="cost-row-title">Water &amp; sewerage</div>
            <div class="cost-row-meta">
              Estimated · installing a meter could reduce this
            </div>
          </div>
          <div class="cost-row-num">
            <div class="cost-row-num-big">£{{ fmt(data.water.cost) }}</div>
            <div class="cost-row-num-unit">/ year</div>
          </div>
        </div>
      </div>

      <!-- ═══ COUNCIL TAX ═══ -->
      <div class="costs-section-h">
        <div class="costs-section-h-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="costs-section-h-text">
          <div class="costs-section-h-title">Council tax</div>
          <div class="costs-section-h-sub">
            {{ data.councilTax.council }} 2024/25 · not affected by energy
            improvements
          </div>
        </div>
      </div>
      <div class="cost-card">
        <div class="cost-row">
          <div class="cost-row-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="cost-row-body">
            <div class="cost-row-title">Council tax</div>
            <div class="cost-row-meta">
              Band {{ data.councilTax.band }} · {{ data.councilTax.council }} ·
              fixed regardless of energy improvements
            </div>
          </div>
          <div class="cost-row-num">
            <div class="cost-row-num-big">£{{ fmt(data.councilTax.cost) }}</div>
            <div class="cost-row-num-unit">/ year</div>
          </div>
        </div>
      </div>

      <!-- ═══ ENERGY DETAIL ═══ -->
      <div class="costs-section-h">
        <div class="costs-section-h-icon costs-section-h-icon--teal-tint">
          📋
        </div>
        <div class="costs-section-h-text">
          <div class="costs-section-h-title">Energy detail</div>
          <div class="costs-section-h-sub">
            <template v-if="data.epcYear">{{ data.epcYear }} EPC · </template>
            {{ property?.addressLine1 || 'this property' }}
            <template v-if="property?.propertyType">
              · {{ property.propertyType.toLowerCase() }}</template
            >
            <template v-if="data.energyDetail.floorAreaSqm">
              · {{ data.energyDetail.floorAreaSqm }} m²</template
            >
          </div>
        </div>
      </div>
      <div class="cost-card cost-card--pad">
        <div class="rc-detail-list">
          <div class="rc-detail-row">
            <div class="rc-detail-label">Gas consumption</div>
            <div class="rc-detail-val">
              <div class="rc-detail-big">
                <template v-if="data.energyDetail.gasKwh"
                  >{{ fmt(data.energyDetail.gasKwh) }} kWh/yr</template
                >
                <template v-else>—</template>
              </div>
              <div class="rc-detail-meta">heating + hot water</div>
            </div>
          </div>
          <div class="rc-detail-row">
            <div class="rc-detail-label">Electricity consumption</div>
            <div class="rc-detail-val">
              <div class="rc-detail-big">
                <template v-if="data.energyDetail.electricityKwh"
                  >~{{ fmt(data.energyDetail.electricityKwh) }} kWh/yr</template
                >
                <template v-else>—</template>
              </div>
              <div class="rc-detail-meta">estimated · no smart meter</div>
            </div>
          </div>
          <div class="rc-detail-row">
            <div class="rc-detail-label">Energy efficiency</div>
            <div class="rc-detail-val">
              <div class="rc-detail-big rc-detail-big--amber">
                EPC {{ data.energyDetail.epcRating }} ·
                {{ data.energyDetail.sapCurrent }} SAP
              </div>
              <div class="rc-detail-meta">UK average EPC D · 60 SAP</div>
            </div>
          </div>
          <div class="rc-detail-row">
            <div class="rc-detail-label">Primary energy use</div>
            <div class="rc-detail-val">
              <div class="rc-detail-big">
                <template v-if="data.energyDetail.primaryEnergyUse"
                  >{{
                    fmt(data.energyDetail.primaryEnergyUse)
                  }}
                  kWh/m²/yr</template
                >
                <template v-else>—</template>
              </div>
              <div class="rc-detail-meta">
                target under
                {{ data.energyDetail.primaryEnergyTarget }} kWh/m²/yr
              </div>
            </div>
          </div>
          <div class="rc-detail-row rc-detail-row--last">
            <div class="rc-detail-label">Tariffs used</div>
            <div class="rc-detail-val">
              <div class="rc-detail-big">{{ data.tariffs.source }}</div>
              <div class="rc-detail-meta">
                Gas {{ (data.tariffs.gas * 100).toFixed(2) }}p · Elec
                {{ (data.tariffs.electricity * 100).toFixed(1) }}p per kWh
              </div>
            </div>
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
          Based on EPC rating averages · {{ data.tariffs.source }} tariffs ·
          estimates only
        </template>
      </div>

      <!-- Upload bill CTA -->
      <!-- <div class="rc-upload">
        <div class="rc-upload-emoji">📄</div>
        <div class="rc-upload-body">
          <div class="rc-upload-title">Are these numbers accurate?</div>
          <div class="rc-upload-sub">Upload an actual bill and we'll replace these estimates with your real figures.</div>
        </div>
        <button type="button" class="rc-upload-btn" @click="onUpload">Upload →</button>
      </div> -->

      <!-- ═══ RISKS ═══ -->
      <div class="costs-section-h">
        <div class="costs-section-h-icon costs-section-h-icon--red">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div class="costs-section-h-text">
          <div class="costs-section-h-title">Risks</div>
          <div class="costs-section-h-sub">
            Property-level risk flags from public data
          </div>
        </div>
      </div>
      <div class="cost-card">
        <div class="cost-row">
          <div
            class="cost-row-icon"
            :class="riskIconClass(data.risks.flood.level)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            >
              <path d="M12 3 Q5 12 5 16 a7 7 0 0 0 14 0 Q19 12 12 3z" />
            </svg>
          </div>
          <div class="cost-row-body">
            <div class="cost-row-title">Flood risk</div>
            <div
              class="cost-row-meta"
              :class="riskMetaClass(data.risks.flood.level)"
            >
              {{ data.risks.flood.label }}
            </div>
          </div>
          <div
            class="cost-row-pill"
            :class="riskPillClass(data.risks.flood.level)"
          >
            {{ data.risks.flood.pill }}
          </div>
        </div>
        <div class="cost-row">
          <div
            class="cost-row-icon"
            :class="riskIconClass(data.risks.mining.level)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div class="cost-row-body">
            <div class="cost-row-title">Mining subsidence</div>
            <div class="cost-row-meta">{{ data.risks.mining.label }}</div>
          </div>
          <div
            class="cost-row-pill"
            :class="riskPillClass(data.risks.mining.level)"
          >
            {{ data.risks.mining.pill }}
          </div>
        </div>
        <div class="cost-row">
          <div class="cost-row-icon cost-row-icon--amber">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div class="cost-row-body">
            <div class="cost-row-title">Planning applications</div>
            <div class="cost-row-meta">{{ data.risks.planning.label }}</div>
          </div>
          <div class="cost-row-pill cost-row-pill--amber">
            {{ data.risks.planning.pill }}
          </div>
        </div>
      </div>

      <!-- ═══ ENVIRONMENTAL IMPACT ═══ -->
      <div class="costs-section-h">
        <div class="costs-section-h-icon costs-section-h-icon--teal-tint">
          🌍
        </div>
        <div class="costs-section-h-text">
          <div class="costs-section-h-title">Environmental impact</div>
          <div class="costs-section-h-sub">
            Based on
            <template v-if="data.epcYear">{{ data.epcYear }} </template>
            EPC · current vs potential
          </div>
        </div>
      </div>
      <div class="cost-card cost-card--pad">
        <div class="rc-env-top">
          <div class="rc-env-col">
            <div class="rc-env-eyebrow">CO₂ now</div>
            <div class="rc-env-big">{{ data.environmentalImpact.co2Now }}t</div>
            <div class="rc-env-meta">tonnes per year</div>
          </div>
          <div class="rc-env-arrow">→</div>
          <div class="rc-env-col rc-env-col--right">
            <div class="rc-env-eyebrow rc-env-eyebrow--teal">Potential</div>
            <div class="rc-env-big rc-env-big--teal">
              {{ data.environmentalImpact.co2Potential }}t
            </div>
            <div class="rc-env-meta rc-env-meta--teal">
              with all improvements
            </div>
          </div>
        </div>
        <div class="rc-env-bar">
          <div
            class="rc-env-bar-fill"
            :style="{ width: data.environmentalImpact.reductionPct + '%' }"
          />
        </div>
        <div class="rc-env-foot">
          <div>
            UK average household: {{ data.environmentalImpact.ukAverage }}t/yr
          </div>
          <div class="rc-env-foot--teal">
            {{ data.environmentalImpact.reductionPct }}% reduction possible
          </div>
        </div>
        <div class="rc-env-rating">
          <div class="rc-env-rating-line">
            Environmental impact rating:
            {{ data.environmentalImpact.ratingCurrent }}
          </div>
          <div class="rc-env-rating-sub">
            Potential rating with improvements:
            {{ data.environmentalImpact.ratingPotential }}
          </div>
        </div>
      </div>

      <div style="height: 24px" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface RunningCosts {
  energy: {
    heating: { cost: number; kwh: number | null; tariff: number; label: string }
    hotWater: {
      cost: number
      kwh: number | null
      tariff: number
      label: string
    }
    electricity: {
      cost: number
      kwh: number | null
      tariff: number
      label: string
    }
    total: number
    potentialTotal: number
    potentialSaving: number
  }
  energyDetail: {
    gasKwh: number | null
    electricityKwh: number | null
    sapCurrent: number
    sapTarget: number
    epcRating: string
    epcTarget: string
    primaryEnergyUse: number | null
    primaryEnergyTarget: number
    floorAreaSqm: number | null
  }
  risks: {
    flood: {
      level: 'low' | 'medium' | 'high' | 'clear'
      label: string
      pill: string
    }
    mining: {
      level: 'low' | 'medium' | 'high' | 'clear'
      label: string
      pill: string
    }
    planning: {
      level: 'low' | 'medium' | 'high' | 'clear'
      label: string
      pill: string
    }
  }
  environmentalImpact: {
    co2Now: number
    co2Potential: number
    reductionPct: number
    ukAverage: number
    ratingCurrent: string
    ratingPotential: string
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
const diffDirection = computed(() =>
  youCost.value >= avgCost.value ? 'more' : 'less',
)
// Avg vertical marker as a % of the "you" bar (clamped 5–95).
const avgBarPct = computed(() => {
  if (!youCost.value) return 50
  const pct = (avgCost.value / youCost.value) * 100
  return Math.max(5, Math.min(95, Math.round(pct)))
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

type RiskLevel = 'clear' | 'low' | 'medium' | 'high'
function riskIconClass(level: RiskLevel): string {
  if (level === 'high' || level === 'medium') return 'cost-row-icon--red'
  if (level === 'low') return 'cost-row-icon--amber'
  return 'cost-row-icon--success'
}
function riskMetaClass(level: RiskLevel): string {
  if (level === 'high' || level === 'medium') return 'cost-row-meta--red'
  return ''
}
function riskPillClass(level: RiskLevel): string {
  if (level === 'high' || level === 'medium') return 'cost-row-pill--red'
  if (level === 'low') return 'cost-row-pill--amber'
  return 'cost-row-pill--success'
}

function onUpload() {
  // Capture where to bounce back to so signin / signup → welcome reliably
  // returns the user here (and not /explore) after auth.
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(
      'redirectAfterLogin',
      `/homescore/costs/${propertyId}`,
    )
  }
  router.push('/onboarding/signin?reason=upload-bill')
}
</script>

<style scoped>
.rc-screen {
  --navy: #231d45;
  --teal: #00a19a;
  --teal-bright: #00b6ae;
  --teal-dark: #007e78;
  --teal-deep: #00514d;
  --teal-pale: #e5f4f2;
  --teal-paler: #f2faf8;
  --amber: #e6a23c;
  --amber-pale: #fbefd9;
  --red: #c73e36;
  --red-pale: #fef2f2;
  --success: #2eab55;
  --bg: #fafafa;
  --text-soft: #6b6783;
  --text-faint: #9c98ad;
  --line: #ececef;
  --line-soft: #f5f5f7;

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
  background: var(--teal-paler);
  border: 1px solid var(--teal-pale);
  color: var(--teal);
  display: grid;
  place-items: center;
  cursor: pointer;
  font-family: inherit;
}
.rc-back svg {
  width: 14px;
  height: 14px;
}
.rc-eyebrow-pill {
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
.rc-eyebrow-pill .dot {
  width: 6px;
  height: 6px;
  background: var(--teal);
  border-radius: 50%;
  box-shadow: 0 0 0 3px var(--teal-pale);
}

/* ── Amber address card (consistent with ResultDetail) ────── */
.rc-addr-card {
  margin: 16px 22px 0;
  border-radius: 22px;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #f0a030 0%, #c67c18 50%, #8b4e0a 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 12px 32px -8px rgba(180, 100, 20, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.rc-addr-card::after {
  content: '';
  position: absolute;
  top: -45%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 65%
  );
  pointer-events: none;
}
.rc-addr-card > * {
  position: relative;
  z-index: 1;
}
.rc-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}
.rc-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin-top: 6px;
}
.rc-addr-block {
  flex: 1;
  min-width: 0;
}
.rc-addr-line {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.rc-addr-meta {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 2px;
}

.rc-addr-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.rc-addr-pill {
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
.rc-addr-pill.epc {
  padding-left: 6px;
}
.rc-epc-letter {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}
.rc-state-unclaimed,
.rc-state-progress {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.94);
  color: #7a3a05;
}
.rc-state-published {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.94);
  color: var(--teal-deep);
}
.rc-addr-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.rc-stat-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}
.rc-stat-count {
  font-weight: 800;
}
.rc-sep {
  opacity: 0.5;
}
.rc-pulse-dot {
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}
.rc-pulse-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  animation: rc-pulse 1.6s ease-out infinite;
}
.rc-pulse-green {
  background: #6bd4cd;
}
.rc-pulse-green::after {
  border-color: rgba(94, 234, 212, 0.5);
}
@keyframes rc-pulse {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* ── Page title ───────────────────────────────────────────── */
.rc-title-block {
  padding: 18px 22px 0;
}
.rc-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.6px;
  line-height: 1.15;
  margin-bottom: 4px;
}
.rc-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  line-height: 1.45;
}

/* ── Loading / error ──────────────────────────────────────── */
.rc-loading,
.rc-error {
  padding: 24px 22px;
  font-size: 13px;
  color: var(--text-soft);
  text-align: center;
}
.rc-error {
  color: var(--red);
}

/* ── Hero (teal gradient, prototype-exact) ────────────────── */
.cost-hero {
  margin: 14px 22px 0;
  padding: 22px 22px 20px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(
    140deg,
    var(--teal-bright) 0%,
    var(--teal) 50%,
    var(--teal-deep) 100%
  );
  box-shadow:
    0 12px 32px -10px rgba(0, 161, 154, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.cost-hero::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.16) 0%,
    transparent 65%
  );
  pointer-events: none;
}
.cost-hero > * {
  position: relative;
  z-index: 1;
}
.cost-hero-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.cost-hero-eyebrow .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
}
.cost-hero-num {
  font-size: 44px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1.6px;
  line-height: 1;
  margin-bottom: 4px;
  font-feature-settings: 'tnum';
}
.cost-hero-num .unit {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.78);
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-left: 2px;
}
.cost-hero-monthly {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: -0.05px;
  margin-bottom: 14px;
}
.cost-hero-monthly b {
  color: #fff;
  font-weight: 800;
}
.cost-compare {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.cost-compare-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 100px;
  overflow: hidden;
  position: relative;
}
.cost-compare-bar .you {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  background: #fff;
  border-radius: 100px;
}
.cost-compare-bar .avg {
  position: absolute;
  left: 0;
  top: -3px;
  bottom: -3px;
  border-right: 2px solid rgba(255, 255, 255, 0.65);
}
.cost-compare-text {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: -0.05px;
  white-space: nowrap;
}
.cost-compare-text b {
  color: #fff;
  font-weight: 800;
}

/* ── Section headers ──────────────────────────────────────── */
.costs-section-h {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 22px 10px;
}
.costs-section-h-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--teal-bright), var(--teal-dark));
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.3);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}
.costs-section-h-icon svg {
  width: 16px;
  height: 16px;
}
.costs-section-h-icon--teal-tint {
  background: var(--teal-paler);
  color: var(--teal-dark);
  box-shadow: none;
}
.costs-section-h-icon--red {
  background: var(--red-pale);
  color: var(--red);
  box-shadow: none;
}
.costs-section-h-text {
  flex: 1;
  min-width: 0;
}
.costs-section-h-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.2px;
  line-height: 1.1;
}
.costs-section-h-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  margin-top: 2px;
}

/* ── Cost card + rows ─────────────────────────────────────── */
.cost-card {
  margin: 0 22px;
  background: #fff;
  border: 2px solid var(--teal);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.08);
}
.cost-card--energy {
  background: linear-gradient(180deg, var(--teal-paler) 0%, white 40%);
}
.cost-card--pad {
  padding: 14px 18px;
}
.cost-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line-soft);
  transition: background 0.15s;
}
.cost-row:last-child {
  border-bottom: none;
}
.cost-row:hover {
  background: var(--bg);
}
.cost-row-icon {
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
.cost-row-icon svg {
  width: 15px;
  height: 15px;
}
.cost-row-icon--red {
  background: var(--red-pale);
  color: var(--red);
}
.cost-row-icon--amber {
  background: var(--amber-pale);
  color: var(--amber);
}
.cost-row-icon--success {
  background: #e8f5ea;
  color: var(--success);
}
.cost-row-body {
  flex: 1;
  min-width: 0;
}
.cost-row-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.2px;
  margin-bottom: 1px;
}
.cost-row-meta {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  line-height: 1.4;
}
.cost-row-meta--red {
  color: var(--red);
  font-weight: 700;
}
.cost-row-num {
  text-align: right;
  flex-shrink: 0;
}
.cost-row-num-big {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.3px;
  line-height: 1.1;
  font-feature-settings: 'tnum';
}
.cost-row-num-unit {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-faint);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-top: 1px;
}
.cost-row-pill {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.1px;
  flex-shrink: 0;
}
.cost-row-pill--red {
  color: var(--red);
}
.cost-row-pill--amber {
  color: var(--amber);
}
.cost-row-pill--success {
  color: var(--success);
}

/* Energy card footer total */
.cost-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 14px 4px;
  padding: 10px 12px;
  background: var(--teal-paler);
  border: 1.5px solid var(--teal-pale);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  color: var(--teal-dark);
}
.cost-card-foot > :last-child {
  font-size: 15px;
}
.cost-card-foot-note {
  margin: 6px 14px 10px;
  font-size: 10px;
  color: var(--text-faint);
}

/* ── Energy detail table ──────────────────────────────────── */
.rc-detail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.rc-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line-soft);
  gap: 12px;
}
.rc-detail-row--last {
  padding-bottom: 0;
  border-bottom: none;
}
.rc-detail-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-soft);
}
.rc-detail-val {
  text-align: right;
}
.rc-detail-big {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.2px;
}
.rc-detail-big--amber {
  color: var(--amber);
}
.rc-detail-meta {
  font-size: 10px;
  color: var(--text-faint);
  margin-top: 2px;
}

/* ── Environmental impact ─────────────────────────────────── */
.rc-env-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 8px;
}
.rc-env-col {
  flex: 1;
  min-width: 0;
}
.rc-env-col--right {
  text-align: right;
}
.rc-env-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.rc-env-eyebrow--teal {
  color: var(--teal-dark);
}
.rc-env-big {
  font-size: 28px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.5px;
  line-height: 1;
}
.rc-env-big--teal {
  color: var(--teal-dark);
}
.rc-env-meta {
  font-size: 10px;
  color: var(--text-soft);
  margin-top: 4px;
}
.rc-env-meta--teal {
  color: var(--teal-dark);
  font-weight: 700;
}
.rc-env-arrow {
  font-size: 24px;
  color: var(--text-faint);
  flex-shrink: 0;
}
.rc-env-bar {
  height: 8px;
  background: var(--line-soft);
  border-radius: 100px;
  overflow: hidden;
  margin-bottom: 6px;
}
.rc-env-bar-fill {
  height: 100%;
  background: var(--teal);
  border-radius: 100px;
  transition: width 0.6s ease;
}
.rc-env-foot {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--text-soft);
}
.rc-env-foot--teal {
  color: var(--teal-dark);
  font-weight: 700;
}
.rc-env-rating {
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--red-pale);
  border-radius: 10px;
}
.rc-env-rating-line {
  font-size: 11px;
  font-weight: 700;
  color: var(--red);
}
.rc-env-rating-sub {
  font-size: 10px;
  color: var(--text-soft);
  margin-top: 2px;
}

/* Confidence banner */
.rc-confidence {
  margin: 8px 22px 0;
  padding: 10px 14px;
  background: var(--teal-paler);
  border: 1px solid var(--teal-pale);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: var(--teal-dark);
}

/* Upload bill CTA */
.rc-upload {
  margin: 12px 22px 0;
  padding: 16px 18px;
  background: var(--teal-paler);
  border: 2px solid var(--teal-pale);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.rc-upload-emoji {
  font-size: 28px;
  flex-shrink: 0;
}
.rc-upload-body {
  flex: 1;
  min-width: 0;
}
.rc-upload-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 3px;
}
.rc-upload-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-soft);
  line-height: 1.5;
}
.rc-upload-btn {
  background: var(--teal);
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
.rc-upload-btn:hover {
  background: var(--teal-bright);
}
</style>
