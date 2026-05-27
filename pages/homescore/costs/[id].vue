<template>
  <div class="hs-buyer">
    <!-- App header -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Property Report</div>
        <div class="app-header-sub">
          {{ shortAddress }} · Based on public EPC
        </div>
      </div>
      <div class="app-header-right">
        <button class="app-icon-btn" type="button" aria-label="Save">🔖</button>
      </div>
    </div>

    <!-- Amber address card -->
    <div v-if="property" class="hs-addr-card anim-1">
      <div class="hs-addr-top">
        <div class="hs-addr-pin" />
        <div class="hs-addr-block">
          <div class="hs-addr-line">{{ property.addressLine1 || 'This property' }}</div>
          <div class="hs-addr-meta">{{ addressMeta }}</div>
        </div>
      </div>
      <div class="hs-addr-pills">
        <span v-if="property.epcRating" class="hs-addr-pill">
          <span class="epc-letter" :style="{ background: epcColor }">{{ property.epcRating }}</span>
          EPC rating
        </span>
        <span class="hs-addr-pill">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 4 14 11 14 11 22 20 10 13 10" /></svg>
          HomeScore <b style="color: white">{{ displayScore }}</b
          ><span style="opacity: 0.75; font-weight: 600">/100</span>
        </span>
      </div>
      <button class="claim-cta-btn" type="button" @click="onClaim">
        Is this your property? Claim it free
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>

    <!-- Buyer confidence -->
    <div class="buyer-conf anim-2">
      <div class="buyer-conf-row">
        <div class="buyer-conf-icon">🛡️</div>
        <div class="buyer-conf-info">
          <div class="buyer-conf-eyebrow">Buyer confidence</div>
          <div class="buyer-conf-title">{{ confidenceTitle }}</div>
        </div>
        <div class="buyer-conf-num">{{ displayScore }}/100</div>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === t.id }"
        @click="activeTab = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Tab panels -->
    <div class="tab-panels">
      <!-- STATS -->
      <div v-if="activeTab === 'stats'" class="tab-panel active">
        <div class="stats-card">
          <div class="stats-card-intro">
            The owner could improve this with a full HomeScore. These bars show
            what the public EPC says today.
          </div>
          <div v-for="s in epcStats" :key="s.id" class="stat-row">
            <div class="stat-icon">{{ s.icon }}</div>
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-bar-wrap">
              <div class="stat-bar-fill" :class="s.tone" :style="{ width: s.pct + '%' }" />
            </div>
            <div class="stat-value" :class="`v-${s.tone}`">{{ s.value }}/{{ s.max }}</div>
          </div>
          <div class="stats-note">
            Ask the owner to run a full HomeScore — they may have made improvements
            since {{ epcYear || 'the survey' }} that aren't on the public EPC.
          </div>
        </div>

        <div class="section-h">Questions to ask the owner</div>
        <div class="questions-card">
          <div v-for="q in askQuestions" :key="q.id" class="ask-row">
            <div class="ask-icon">{{ q.icon }}</div>
            <div>
              <div class="ask-title">{{ q.title }}</div>
              <div class="ask-sub">{{ q.sub }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- COSTS -->
      <div v-if="activeTab === 'costs'" class="tab-panel active">
        <div class="cost-total-card">
          <div class="cost-total-eyebrow">
            <span class="pulse-dot white" /> Estimated total per year
          </div>
          <div class="cost-total-num">
            £{{ formatNum(totalAnnual) }}<span> / year</span>
          </div>
          <div class="cost-total-sub">
            ~£{{ formatNum(Math.round(totalAnnual / 12)) }}/month across energy
            (per EPC), water and council tax.
          </div>
        </div>
        <div v-for="c in costLines" :key="c.id" class="cost-line">
          <div class="cost-line-icon">{{ c.icon }}</div>
          <div class="cost-line-info">
            <div class="cost-line-title">{{ c.title }}</div>
            <div class="cost-line-sub">{{ c.sub }}</div>
          </div>
          <div>
            <div class="cost-line-amt">£{{ formatNum(c.amount) }}</div>
            <div class="cost-line-amt-sub">/year</div>
          </div>
        </div>
      </div>

      <!-- RISKS -->
      <div v-if="activeTab === 'risks'" class="tab-panel active">
        <div v-for="r in risks" :key="r.id" class="risk-item">
          <div class="risk-icon" :class="r.status">{{ r.icon }}</div>
          <div class="risk-body">
            <div class="risk-title">{{ r.title }}</div>
            <div class="risk-sub">{{ r.sub }}</div>
          </div>
          <div class="risk-status" :class="r.status">
            {{ r.statusLabel }}
          </div>
        </div>
      </div>

      <!-- STREET -->
      <div v-if="activeTab === 'street'" class="tab-panel active">
        <div class="street-rank-hero">
          <div class="street-rank-big">
            {{ streetRank ?? '—' }}<span>{{ streetRank ? ordinalSuffix(streetRank) : '' }} of {{ streetTotal ?? '—' }}</span>
          </div>
          <div class="street-rank-small">{{ streetRankLabel }}</div>
          <div v-if="streetCallout" class="street-rank-callout" v-html="streetCallout" />
        </div>
        <div v-if="streetBars.length" class="street-bars">
          <div
            v-for="(b, i) in streetBars"
            :key="i"
            class="street-bar-row"
            :class="{ 'you-row': b.isYou }"
          >
            <div class="street-bar-label" :class="{ you: b.isYou }">{{ b.label }}</div>
            <div class="street-bar-wrap">
              <div class="street-bar-fill" :class="b.tone" :style="{ width: b.pct + '%' }" />
            </div>
            <div class="street-bar-amt" :class="{ you: b.isYou }">£{{ formatNum(b.cost) }}</div>
          </div>
        </div>
        <div v-else class="street-empty">
          Not enough neighbouring properties have been enriched to draw a
          comparison yet. Try again once more {{ property?.postcode }}
          neighbours have been checked.
        </div>
      </div>
    </div>

    <!-- Buyer action card -->
    <div class="buyer-action-card anim-3">
      <div class="buyer-action-eyebrow">✦ Interested in this home?</div>
      <div class="buyer-action-title">Save it to your buyer profile</div>
      <div class="buyer-action-sub">
        Or get verified upfront — sellers accept offers from verified buyers
        <b>3× more often</b>.
      </div>

      <div class="buyer-action-stats">
        <div class="buyer-action-stat">
          <div class="buyer-action-stat-num">3×</div>
          <div class="buyer-action-stat-label">Offers accepted</div>
        </div>
        <div class="buyer-action-stat">
          <div class="buyer-action-stat-num">12×</div>
          <div class="buyer-action-stat-label">Faster sale</div>
        </div>
        <div class="buyer-action-stat">
          <div class="buyer-action-stat-num">21d</div>
          <div class="buyer-action-stat-label">Saved on exchange</div>
        </div>
      </div>

      <div class="buyer-action-btns">
        <button class="buyer-action-btn primary" type="button" @click="onVerify">
          <div class="buyer-action-btn-ico">✓</div>
          <div class="buyer-action-btn-text">
            <div class="buyer-action-btn-title">Get verified as a buyer</div>
            <div class="buyer-action-btn-sub">
              Onfido ID · proof of funds · chain check · 4 min
            </div>
          </div>
          <span class="buyer-action-btn-arrow">›</span>
        </button>
        <button class="buyer-action-btn secondary" type="button" @click="onSave">
          <div class="buyer-action-btn-ico">🔖</div>
          <div class="buyer-action-btn-text">
            <div class="buyer-action-btn-title">Save to my buyer profile</div>
            <div class="buyer-action-btn-sub">
              Track price &amp; status · compare with other homes
            </div>
          </div>
          <span class="buyer-action-btn-arrow">›</span>
        </button>
      </div>

      <div class="buyer-action-foot">
        <span class="buyer-action-foot-ico">🔒</span>
        <span>
          Verification powered by <b>Onfido</b>. We never share your details with
          sellers without your permission.
        </span>
      </div>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const propertyId = computed(() => String(route.params.id))
const property = ref<any>(null)
const streetData = ref<any>(null)

type TabId = 'stats' | 'costs' | 'risks' | 'street'
const tabs: { id: TabId; label: string }[] = [
  { id: 'stats', label: 'Stats' },
  { id: 'costs', label: 'Costs' },
  { id: 'risks', label: 'Risks' },
  { id: 'street', label: 'Street' },
]
const activeTab = ref<TabId>('stats')

onMounted(async () => {
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId.value}`,
    )
    if (res.ok) property.value = await res.json()
  } catch {}
  // Fetch street energy rank for the Street tab.
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId.value}/street-energy-rank`,
    )
    if (res.ok) streetData.value = await res.json()
  } catch {}
})

// ── Helpers / Computeds ──────────────────────────────────────

function epcField(name: string): any {
  const p: any = property.value
  if (!p) return null
  if (p[name] != null && p[name] !== '') return p[name]
  const cert = p.epcCert
  if (cert && cert[name] != null && cert[name] !== '') return cert[name]
  return null
}

const epcColor = computed(() => {
  const map: Record<string, string> = {
    A: '#008a84',
    B: '#00a19a',
    C: '#7ab040',
    D: '#e6a23c',
    E: '#d86f4a',
    F: '#c04a1a',
    G: '#a52a2a',
  }
  return map[(property.value?.epcRating || '').toUpperCase()] || '#9c98ad'
})

const addressMeta = computed(() => {
  const p = property.value
  if (!p) return ''
  const parts: string[] = []
  if (p.postcode) parts.push(p.postcode)
  if (p.propertyType) parts.push(p.propertyType)
  const area = p.floorAreaSqm ?? p.epcCert?.floorAreaSqm
  if (area && Number.isFinite(Number(area))) {
    parts.push(`${Math.round(Number(area))}m²`)
  }
  return parts.join(' · ')
})

const shortAddress = computed(() => {
  const p = property.value
  if (!p) return 'Property'
  return `${p.addressLine1 || 'Property'}`
})

const displayScore = computed(() => {
  const v = epcField('epcScore')
  return v ? Math.round(Number(v)) : 0
})

const epcYear = computed(() => {
  const v = epcField('lodgementDate') || epcField('epcLodgementDate')
  if (!v) return null
  const y = new Date(v).getFullYear()
  return Number.isFinite(y) ? y : null
})

// ── EPC efficiency → 0-1 score helpers (shared with score view) ──
function effToScore(eff: string | null | undefined): number {
  const e = (eff || '').toLowerCase().trim()
  if (!e || e === 'n/a' || e === 'na') return 0.5
  if (e === 'very good') return 1.0
  if (e === 'good') return 0.8
  if (e === 'average') return 0.6
  if (e === 'poor') return 0.4
  if (e === 'very poor') return 0.2
  return 0.5
}

interface StatRow {
  id: string
  icon: string
  label: string
  value: number
  max: number
  pct: number
  tone: 'high' | 'mid' | 'low'
}

const epcStats = computed<StatRow[]>(() => {
  // Heating (mainheat + controls)
  const heat =
    (effToScore(epcField('mainheatEnergyEff')) +
      effToScore(epcField('mainheatcEnergyEff'))) /
    2
  // Structure (walls + roof + floor + windows)
  const structure =
    (effToScore(epcField('wallsEnergyEff')) +
      effToScore(epcField('roofEnergyEff')) +
      effToScore(epcField('floorEnergyEff')) +
      effToScore(epcField('windowsEnergyEff'))) /
    4
  // Efficiency (lighting + low-energy %)
  const ledPct = Number(epcField('lowEnergyLighting') ?? 0)
  const efficiency =
    effToScore(epcField('lightingEnergyEff')) * 0.6 + (ledPct / 100) * 0.4
  // Electrics — solar PV missing penalises
  const recs: any[] = property.value?.epcRecommendations || []
  const hasSolarPv = recs.some((r) =>
    /(solar pv|photovoltaic)/i.test(r?.title || ''),
  )
  const electrics = hasSolarPv ? 0.5 : 0.8
  // Plumbing (hot water)
  const plumbing = effToScore(epcField('hotWaterEnergyEff'))

  const mk = (
    id: string,
    icon: string,
    label: string,
    score: number,
    max: number,
  ): StatRow => {
    const value = Math.round(score * max)
    const pct = Math.round(score * 100)
    let tone: 'high' | 'mid' | 'low' = 'mid'
    if (score >= 0.7) tone = 'high'
    else if (score < 0.5) tone = 'low'
    return { id, icon, label, value, max, pct, tone }
  }
  return [
    mk('heating', '🔥', 'Heating', heat, 20),
    mk('structure', '🧱', 'Structure', structure, 25),
    mk('efficiency', '💡', 'Efficiency', efficiency, 15),
    mk('electrics', '⚡', 'Electrics', electrics, 20),
    mk('plumbing', '💧', 'Plumbing', plumbing, 20),
  ]
})

// "Questions to ask the owner" — driven by EPC recommendations where
// possible; falls back to a generic set when recs are empty.
interface AskRow {
  id: string
  icon: string
  title: string
  sub: string
}

const askQuestions = computed<AskRow[]>(() => {
  const recs: any[] = property.value?.epcRecommendations || []
  const out: AskRow[] = []
  if (Array.isArray(recs) && recs.length > 0) {
    recs.slice(0, 3).forEach((r, i) => {
      const title = r?.title || `EPC recommendation ${i + 1}`
      out.push({
        id: r?.id || String(i),
        icon: iconForTitle(title),
        title: `Has the owner done: ${title}?`,
        sub:
          r?.description ||
          `Listed on the EPC as an energy-saving step. Ask if it's been done since the certificate was issued${
            epcYear.value ? ` in ${epcYear.value}` : ''
          }.`,
      })
    })
  }
  // Always include "share full EPC" + "EICR" prompts.
  out.push({
    id: 'full-epc',
    icon: '📄',
    title: 'Can you share the full EPC report?',
    sub: "The public register only shows the grade — the full document lists every item.",
  })
  out.push({
    id: 'eicr',
    icon: '⚡',
    title: 'Do you have an EICR certificate?',
    sub: 'Electrical Installation Condition Report — not legally required, but worth asking.',
  })
  return out
})

function iconForTitle(title: string): string {
  const t = (title ?? '').toLowerCase()
  if (/solar pv|photovoltaic/.test(t)) return '⚡'
  if (/solar (?:water|thermal)/.test(t)) return '☀️'
  if (/(loft|roof)/.test(t)) return '🏠'
  if (/(cavity|wall)/.test(t)) return '🧱'
  if (/floor/.test(t)) return '🪟'
  if (/(led|light)/.test(t)) return '💡'
  if (/(boiler|heat pump|heating)/.test(t)) return '🔥'
  return '✦'
}

// ── Costs tab ─────────────────────────────────────────────
const heatingCost = computed(
  () => Number(epcField('heatingCostCurrent') ?? 0) || 0,
)
const hotWaterCost = computed(
  () => Number(epcField('hotWaterCostCurrent') ?? 0) || 0,
)
const lightingCost = computed(
  () => Number(epcField('lightingCostCurrent') ?? 0) || 0,
)
const waterCost = computed(() => {
  // Estimate water + sewerage at ~£430/yr (Ofwat 2024/25 England avg).
  // Real per-property water cost requires supplier integration.
  return 430
})
const councilTaxCost = computed(() => {
  // Use real fetched council tax if available, else estimate from band.
  const real = Number(
    (property.value as any)?.councilTaxAnnual ?? 0,
  )
  if (real > 0) return Math.round(real)
  const band = (epcField('councilTaxBand') || '').toUpperCase()
  const map: Record<string, number> = {
    A: 1340, B: 1564, C: 1787, D: 2010, E: 2457, F: 2904, G: 3350, H: 4020,
  }
  return map[band] ?? 2010
})

const totalAnnual = computed(
  () =>
    Math.round(heatingCost.value) +
    Math.round(hotWaterCost.value) +
    Math.round(lightingCost.value) +
    waterCost.value +
    councilTaxCost.value,
)

interface CostLine {
  id: string
  icon: string
  title: string
  sub: string
  amount: number
}

const costLines = computed<CostLine[]>(() => {
  const lines: CostLine[] = []
  if (heatingCost.value > 0) {
    lines.push({
      id: 'heating',
      icon: '🔥',
      title: 'Heating',
      sub: `${epcField('mainheatDescription') || 'EPC figure'}`,
      amount: Math.round(heatingCost.value),
    })
  }
  if (hotWaterCost.value > 0) {
    lines.push({
      id: 'hot-water',
      icon: '💧',
      title: 'Hot water',
      sub: epcField('hotwaterDescription') || 'From main system',
      amount: Math.round(hotWaterCost.value),
    })
  }
  if (lightingCost.value > 0) {
    const ledPct = Number(epcField('lowEnergyLighting') ?? 0)
    lines.push({
      id: 'lighting',
      icon: '💡',
      title: 'Lighting',
      sub: ledPct ? `${Math.round(ledPct)}% LED · rest inefficient` : 'EPC figure',
      amount: Math.round(lightingCost.value),
    })
  }
  lines.push({
    id: 'water',
    icon: '🚰',
    title: 'Water & sewerage',
    sub: 'Regional avg · unmetered',
    amount: waterCost.value,
  })
  const band = (epcField('councilTaxBand') || '').toUpperCase()
  lines.push({
    id: 'council-tax',
    icon: '🏠',
    title: 'Council tax',
    sub: band
      ? `Band ${band} · ${(property.value as any)?.councilTaxCouncilName || 'local council'}`
      : 'Estimated · check with local council',
    amount: councilTaxCost.value,
  })
  return lines
})

// ── Risks tab ─────────────────────────────────────────────
interface RiskRow {
  id: string
  icon: string
  title: string
  sub: string
  status: 'clear' | 'note' | 'flag'
  statusLabel: 'Clear' | 'Note' | 'Flag'
}

const risks = computed<RiskRow[]>(() => {
  const list: RiskRow[] = []
  // Generic clears — we don't yet pull real flood / mining APIs into the
  // homescore flow, so default these to "no data" notes.
  const flood = (property.value as any)?.floodRisk
  list.push({
    id: 'flood',
    icon: '💧',
    title: 'Flood risk',
    sub: flood?.summary || 'No flood-risk data on file for this address',
    status: flood?.level === 'high' ? 'flag' : 'clear',
    statusLabel: flood?.level === 'high' ? 'Flag' : 'Clear',
  })
  list.push({
    id: 'mining',
    icon: '✓',
    title: 'Mining subsidence',
    sub: 'No recorded mining activity in this area',
    status: 'clear',
    statusLabel: 'Clear',
  })
  list.push({
    id: 'planning',
    icon: '📋',
    title: 'Planning applications',
    sub: 'Public planning data not yet available for this address',
    status: 'note',
    statusLabel: 'Note',
  })

  // Convert EPC recommendations into risk flags (each one a "flag" or
  // "note" depending on its annual saving — bigger savings ⇒ flag).
  const recs: any[] = property.value?.epcRecommendations || []
  recs.forEach((r, i) => {
    const saving = Number(r?.typicalSaving ?? 0)
    const title = r?.title || `EPC recommendation ${i + 1}`
    const status: 'flag' | 'note' = saving >= 100 ? 'flag' : 'note'
    list.push({
      id: r?.id || `rec-${i}`,
      icon: iconForTitle(title),
      title,
      sub: `${r?.description || `Listed on the EPC.`}${saving > 0 ? ` Adds ~£${saving}/yr to bills.` : ''}`,
      status,
      statusLabel: status === 'flag' ? 'Flag' : 'Note',
    })
  })

  return list
})

// ── Street tab ─────────────────────────────────────────────
const streetRank = computed<number | null>(
  () => streetData.value?.rank ?? null,
)
const streetTotal = computed<number | null>(
  () => streetData.value?.total ?? null,
)

function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

const streetRankLabel = computed(() => {
  const r = streetRank.value
  const t = streetTotal.value
  if (!r || !t) return ''
  if (r / t <= 0.33) return `Top third on this street · ${property.value?.postcode}`
  if (r / t <= 0.5) return `Better half of the street · ${property.value?.postcode}`
  if (r / t <= 0.66) return `Around average · ${property.value?.postcode}`
  return `Below average · ${property.value?.postcode}`
})

const streetCallout = computed(() => {
  const best = streetData.value?.bestCost
  const yours = streetData.value?.yourCost
  if (!best || !yours) return ''
  const diff = Math.max(0, Math.round(yours - best))
  if (diff <= 0) return ''
  return `The top homes on this street pay roughly <b>£${diff}/yr less</b>. EPC pathway could close most of that gap.`
})

interface StreetBar {
  label: string
  cost: number
  pct: number
  tone: 'good' | 'avg' | 'mid' | 'you'
  isYou: boolean
}

const streetBars = computed<StreetBar[]>(() => {
  const neighbours: any[] = streetData.value?.neighbours || []
  const yours = Number(streetData.value?.yourCost ?? 0)
  if (!neighbours.length && !yours) return []
  // Normalise — find the biggest cost so the bar widths fill 0-100%.
  const allCosts = [
    ...neighbours.map((n: any) => Number(n.cost) || 0),
    yours,
    Number(streetData.value?.averageCost ?? 0),
  ].filter((x) => x > 0)
  const max = allCosts.length ? Math.max(...allCosts) : 1
  const rows: StreetBar[] = neighbours.map((n: any) => {
    const cost = Number(n.cost) || 0
    let tone: StreetBar['tone'] = 'mid'
    if (cost <= max * 0.55) tone = 'good'
    else if (cost <= max * 0.7) tone = 'avg'
    return {
      label: n.label || 'Neighbour',
      cost,
      pct: Math.round((cost / max) * 100),
      tone,
      isYou: false,
    }
  })
  if (yours > 0) {
    rows.push({
      label: 'You',
      cost: yours,
      pct: Math.round((yours / max) * 100),
      tone: 'you',
      isYou: true,
    })
  }
  if (streetData.value?.averageCost) {
    const avg = Number(streetData.value.averageCost)
    rows.push({
      label: 'PC avg',
      cost: avg,
      pct: Math.round((avg / max) * 100),
      tone: 'avg',
      isYou: false,
    })
  }
  // Sort by cost ascending so the user reads cheapest-first.
  rows.sort((a, b) => a.cost - b.cost)
  return rows
})

// ── Buyer confidence ──────────────────────────────────────
const confidenceTitle = computed(() => {
  const recs: any[] = property.value?.epcRecommendations || []
  const flagCount = recs.filter((r) =>
    /insulation|cavity|loft|floor|wall/i.test(r?.title || ''),
  ).length
  const score = displayScore.value
  if (score >= 80)
    return 'Strong public record — minimal flags'
  if (score >= 60)
    return flagCount
      ? `Above average — ${flagCount} insulation flag${flagCount > 1 ? 's' : ''}`
      : 'Above average public record'
  if (score >= 40)
    return flagCount
      ? `Worth investigating — ${flagCount} insulation flag${flagCount > 1 ? 's' : ''}`
      : 'Worth investigating'
  return 'Investigate before offering'
})

// ── Actions ───────────────────────────────────────────────
function formatNum(n: number): string {
  return new Intl.NumberFormat('en-GB').format(Math.round(n))
}

function onClaim() {
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    try {
      localStorage.setItem(
        'redirectAfterLogin',
        `/homescore/${propertyId.value}?claim=1`,
      )
    } catch {}
    router.push('/onboarding/signin')
    return
  }
  router.push(`/homescore/${propertyId.value}?claim=1`)
}

function onVerify() {
  // Real KYC flow lives in the property route — defer to it for now.
  router.push(`/property/${propertyId.value}`)
}

function onSave() {
  // Hooks up to the existing wishlist endpoint when available.
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    try {
      localStorage.setItem(
        'redirectAfterLogin',
        `/homescore/costs/${propertyId.value}`,
      )
    } catch {}
    router.push('/onboarding/signin')
    return
  }
  fetch(`${config.public.apiBase}/property/${propertyId.value}/wishlist`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {})
}
</script>

<style scoped>
.hs-buyer {
  /* Mobile container + design tokens (mirrors the rest of homescore) */
  --primary: #231d45;
  --primary-2: #352d5c;
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
  --warning: #f5a623;
  --warning-pale: #fff5e0;
  --warning-deep: #7a5500;
  --error: #e74c5e;
  --error-light: #f08594;
  --error-pale: #fcebea;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Soften prototype's 800-weights to match SF Pro app scale */
.hs-buyer :is(.app-header-title, .hs-addr-line, .buyer-conf-title,
  .buyer-conf-num, .stat-value, .cost-total-num, .cost-line-title,
  .cost-line-amt, .risk-title, .street-rank-big, .street-bar-amt,
  .buyer-action-title, .buyer-action-stat-num, .buyer-action-btn-title,
  .section-h) {
  font-weight: 700;
}
.hs-buyer :is(.app-header-sub, .hs-addr-meta, .buyer-conf-eyebrow,
  .cost-total-sub, .cost-line-sub, .risk-sub, .street-rank-small,
  .buyer-action-sub) {
  font-weight: 500;
}

@keyframes hs-buyer-fade {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.anim-1 { animation: hs-buyer-fade 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-2 { animation: hs-buyer-fade 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-3 { animation: hs-buyer-fade 0.35s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* Header */
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
  flex-shrink: 0;
  font-family: inherit;
}
.back-btn svg { width: 16px; height: 16px; }
.app-header-info { flex: 1; min-width: 0; }
.app-header-title { font-size: 15px; color: var(--text); letter-spacing: -0.2px; }
.app-header-sub {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Amber address card */
.hs-addr-card {
  margin: 14px 20px 0;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #f0a030 0%, #c67c18 50%, #8b4e0a 100%);
  border-radius: 14px;
  color: white;
  box-shadow: 0 12px 32px -8px rgba(180, 100, 20, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  position: relative;
  overflow: hidden;
}
.hs-addr-card::after {
  content: '';
  position: absolute;
  top: -45%;
  right: -15%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 65%);
  pointer-events: none;
}
.hs-addr-card > * { position: relative; z-index: 1; }
.hs-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}
.hs-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  margin-top: 8px;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}
.hs-addr-block { flex: 1; min-width: 0; }
.hs-addr-line {
  font-size: 20px;
  color: white;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 2px;
}
.hs-addr-meta { font-size: 12.5px; color: rgba(255, 255, 255, 0.85); }
.hs-addr-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
.hs-addr-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  padding: 5px 10px 5px 7px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
}
.hs-addr-pill svg { width: 10px; height: 10px; }
.epc-letter {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
}
.claim-cta-btn {
  display: flex;
  width: 100%;
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border: none;
  color: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.35);
}
.claim-cta-btn svg { width: 14px; height: 14px; color: white; }

/* Buyer confidence card */
.buyer-conf {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.buyer-conf-row { display: flex; align-items: center; gap: 12px; }
.buyer-conf-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--warning-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.buyer-conf-info { flex: 1; }
.buyer-conf-eyebrow {
  font-size: 10px;
  color: var(--text-secondary);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.buyer-conf-title { font-size: 14px; color: var(--text); letter-spacing: -0.2px; }
.buyer-conf-num {
  font-size: 18px;
  color: var(--warning-deep);
  letter-spacing: -0.3px;
}

/* Tab bar */
.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 4px;
  margin: 14px 20px 0;
  box-shadow: var(--shadow-card);
}
.tab-btn {
  flex: 1;
  padding: 9px 8px;
  font-size: 11.5px;
  font-weight: 700;
  border: none;
  background: transparent;
  border-radius: 100px;
  cursor: pointer;
  color: var(--text-secondary);
  font-family: inherit;
}
.tab-btn.active {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.25);
}
.tab-panels { padding: 14px 20px 0; }
.tab-panel {
  animation: hs-buyer-fade 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Stats tab */
.stats-card {
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.stats-card-intro {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 12px;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
}
.stat-icon {
  font-size: 14px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}
.stat-label {
  width: 70px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}
.stat-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--bg);
  border-radius: 100px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
}
.stat-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.stat-bar-fill.high {
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}
.stat-bar-fill.mid {
  background: linear-gradient(90deg, var(--warning), #f0b933);
}
.stat-bar-fill.low {
  background: linear-gradient(90deg, var(--error), var(--error-light));
}
.stat-value {
  width: 46px;
  text-align: right;
  font-size: 11px;
  color: var(--text);
  flex-shrink: 0;
}
.stat-value.v-high { color: var(--accent-dark); }
.stat-value.v-low { color: var(--error); }
.stat-value.v-mid { color: var(--warning-deep); }
.stats-note {
  padding: 10px 12px;
  background: var(--warning-pale);
  border: 1px solid rgba(245, 166, 35, 0.3);
  border-radius: 10px;
  margin-top: 12px;
  font-size: 11px;
  color: var(--warning-deep);
  font-weight: 500;
  line-height: 1.4;
}

.section-h {
  margin-top: 14px;
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  padding: 6px 0 10px;
}
.questions-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: var(--shadow-card);
}
.ask-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-soft);
}
.ask-row:last-child { border-bottom: none; }
.ask-icon { font-size: 18px; flex-shrink: 0; }
.ask-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}
.ask-sub {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Costs tab */
.cost-total-card {
  padding: 18px 18px 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border-radius: 14px;
  color: white;
  margin-bottom: 10px;
  box-shadow: 0 8px 24px rgba(0, 161, 154, 0.25);
  position: relative;
  overflow: hidden;
}
.cost-total-card::after {
  content: '';
  position: absolute;
  top: -30%;
  right: -15%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, transparent 65%);
  pointer-events: none;
}
.cost-total-card > * { position: relative; z-index: 1; }
.cost-total-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  display: inline-block;
}
.pulse-dot.white { background: white; }
.cost-total-num {
  font-size: 32px;
  letter-spacing: -1px;
  line-height: 1;
}
.cost-total-num span {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
}
.cost-total-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 6px;
}
.cost-line {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 6px;
  box-shadow: var(--shadow-card);
}
.cost-line-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--accent-paler);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.cost-line-info { flex: 1; min-width: 0; }
.cost-line-title { font-size: 12.5px; color: var(--text); }
.cost-line-sub {
  font-size: 10.5px;
  color: var(--text-secondary);
  margin-top: 1px;
}
.cost-line-amt {
  font-size: 13px;
  color: var(--text);
  letter-spacing: -0.2px;
  text-align: right;
}
.cost-line-amt-sub {
  font-size: 9.5px;
  color: var(--text-faint);
  margin-top: 1px;
  text-align: right;
}

/* Risks tab */
.risk-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 8px;
  box-shadow: var(--shadow-card);
}
.risk-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.risk-icon.clear { background: var(--accent-paler); }
.risk-icon.note { background: var(--warning-pale); }
.risk-icon.flag { background: var(--error-pale); }
.risk-body { flex: 1; min-width: 0; }
.risk-title { font-size: 13px; color: var(--text); }
.risk-sub {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
  line-height: 1.4;
}
.risk-status {
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.risk-status.clear { color: var(--accent-dark); }
.risk-status.note { color: var(--warning); }
.risk-status.flag { color: var(--error); }

/* Street tab */
.street-rank-hero {
  padding: 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-card);
  text-align: center;
}
.street-rank-big {
  font-size: 42px;
  color: var(--error);
  letter-spacing: -1.5px;
  line-height: 1;
}
.street-rank-big span {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-left: 4px;
}
.street-rank-small {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 6px;
}
.street-rank-callout {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-soft);
}
.street-rank-callout :deep(b) { color: var(--text); font-weight: 700; }
.street-bars {
  padding: 12px 14px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.street-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
}
.street-bar-row.you-row {
  background: var(--error-pale);
  border-radius: 8px;
  padding: 6px 8px;
  margin: 2px -2px;
}
.street-bar-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
  width: 50px;
  flex-shrink: 0;
  text-align: right;
}
.street-bar-label.you { color: var(--error); }
.street-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--bg);
  border-radius: 100px;
  overflow: hidden;
}
.street-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.street-bar-fill.you { background: var(--error); }
.street-bar-fill.good {
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}
.street-bar-fill.avg { background: var(--accent); }
.street-bar-fill.mid { background: var(--warning); }
.street-bar-amt {
  font-size: 10.5px;
  width: 52px;
  flex-shrink: 0;
  text-align: right;
  color: var(--text);
}
.street-bar-amt.you { color: var(--error); }
.street-empty {
  margin-top: 6px;
  padding: 20px 16px;
  background: var(--card);
  border: 1.5px dashed var(--border);
  border-radius: 14px;
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.55;
}

/* Buyer action card */
.buyer-action-card {
  margin: 18px 20px 0;
  padding: 18px 18px 16px;
  background: linear-gradient(135deg, #231d45 0%, #352d5c 60%, #00a19a 130%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 12px 30px -8px rgba(35, 29, 69, 0.35);
  position: relative;
  overflow: hidden;
}
.buyer-action-card::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 184, 176, 0.3) 0%, transparent 60%);
  pointer-events: none;
}
.buyer-action-card > * { position: relative; z-index: 1; }
.buyer-action-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  padding: 5px 11px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}
.buyer-action-title {
  font-size: 18px;
  letter-spacing: -0.4px;
  line-height: 1.15;
}
.buyer-action-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 6px;
  line-height: 1.55;
}
.buyer-action-sub :deep(b) { color: white; font-weight: 700; }
.buyer-action-stats {
  display: flex;
  gap: 8px;
  margin: 14px 0 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}
.buyer-action-stat {
  flex: 1;
  padding: 8px 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  text-align: center;
}
.buyer-action-stat-num {
  font-size: 18px;
  letter-spacing: -0.4px;
  color: white;
  line-height: 1;
}
.buyer-action-stat-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 4px;
  line-height: 1.1;
}
.buyer-action-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.buyer-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 14px;
  border: none;
  border-radius: 11px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
}
.buyer-action-btn.primary {
  background: white;
  color: var(--text);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
}
.buyer-action-btn.secondary {
  background: rgba(255, 255, 255, 0.14);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.28);
}
.buyer-action-btn-ico {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.buyer-action-btn.primary .buyer-action-btn-ico {
  background: var(--accent-paler);
  color: var(--accent-dark);
}
.buyer-action-btn.secondary .buyer-action-btn-ico {
  background: rgba(255, 255, 255, 0.18);
}
.buyer-action-btn-text { flex: 1; min-width: 0; }
.buyer-action-btn-title { font-size: 13.5px; line-height: 1.1; }
.buyer-action-btn-sub {
  font-size: 10.5px;
  font-weight: 500;
  opacity: 0.78;
  margin-top: 2px;
}
.buyer-action-btn.primary .buyer-action-btn-sub {
  color: var(--text-secondary);
  opacity: 1;
}
.buyer-action-btn-arrow {
  font-size: 16px;
  opacity: 0.6;
  flex-shrink: 0;
}
.buyer-action-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 12px;
  margin-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 10.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
}
.buyer-action-foot :deep(b) { color: white; font-weight: 700; }
.buyer-action-foot-ico { font-size: 12px; }
</style>
