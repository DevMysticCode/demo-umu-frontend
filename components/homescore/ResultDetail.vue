<template>
  <div class="rd-page">

    <!-- ── Teal address card ───────────────────────────────────── -->
    <div class="rd-addr-card" data-tour="addr">
      <div class="rd-addr-top">
        <div class="rd-addr-pin" />
        <div class="rd-addr-block">
          <div class="rd-addr-line">{{ property?.addressLine1 || 'This property' }}</div>
          <div class="rd-addr-meta">
            {{ property?.postcode || '' }}
            <template v-if="property?.propertyType"> · {{ property.propertyType }}</template>
            <template v-if="property?.bedrooms"> · {{ property.bedrooms }} bed</template>
          </div>
        </div>
      </div>

      <!-- EPC + State pills -->
      <div class="rd-addr-pills">
        <span v-if="epcRating" class="rd-addr-pill epc">
          <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11">
            <path d="M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" />
          </svg>
          <span class="rd-epc-letter" :style="{ background: epcColor }">{{ epcRating }}</span>
          EPC
        </span>
        <button
          v-if="state === 'unclaimed'"
          class="rd-addr-pill rd-state-unclaimed"
          type="button"
          @click="$emit('claim')"
        >
          Unclaimed · Claim yours
          <span class="rd-arrow">→</span>
        </button>
        <span v-else-if="state === 'inProgress'" class="rd-addr-pill rd-state-progress">In progress</span>
        <span v-else-if="state === 'published'" class="rd-addr-pill rd-state-published">✓ Published</span>
      </div>

      <!-- FOMO stats row — 3 segments per state, matches prototype copy -->
      <div class="rd-addr-stats">
        <div v-if="state === 'unclaimed'" class="rd-stat-row">
          <span class="rd-pulse-dot" />
          <span class="rd-stat-count">{{ randomSearches }} searches today</span>
          <span class="rd-sep">·</span>
          <span>No verified Passport on this address yet</span>
          <span class="rd-sep">·</span>
          <span>Public EPC data only</span>
        </div>
        <div v-else-if="state === 'inProgress'" class="rd-stat-row">
          <span class="rd-pulse-dot" />
          <span class="rd-stat-count">{{ randomSearches + 1 }} searches today</span>
          <span class="rd-sep">·</span>
          <span>Owner is building a Passport</span>
          <span class="rd-sep">·</span>
          <span>Public EPC data only for now</span>
        </div>
        <div v-else class="rd-stat-row">
          <span class="rd-pulse-dot rd-pulse-green" />
          <span class="rd-stat-count">{{ randomSearches * 6 }} searches this month</span>
          <span class="rd-sep">·</span>
          <span>Verified Passport live</span>
          <span class="rd-sep">·</span>
          <span>Owner's real data</span>
        </div>
      </div>
    </div>

    <!-- ── HomeScore card (moved ABOVE running cost — it's the page's focus) ── -->
    <div class="rd-score-card" :class="scoreTone" data-tour="score">
      <div class="rd-score-eyebrow">
        <div class="left">HomeScore</div>
        <div class="right" :class="{ 'right--verified': state === 'published' }">
          <template v-if="state === 'published'">✓ Verified data</template>
          <template v-else-if="state === 'inProgress'">Public EPC</template>
          <template v-else>EPC data · {{ displayEpcYear }}</template>
        </div>
      </div>
      <div class="rd-score-gauge-wrap">
        <div class="rd-gauge">
          <svg viewBox="0 0 120 120">
            <circle class="g-bg" cx="60" cy="60" r="50" fill="none" stroke-width="9" />
            <circle
              class="g-fill"
              cx="60"
              cy="60"
              r="50"
              fill="none"
              :stroke="gaugeColor"
              stroke-width="9"
              stroke-linecap="round"
              stroke-dasharray="314.16"
              :stroke-dashoffset="314.16 - (score / 100) * 314.16"
            />
          </svg>
          <div class="rd-g-num">
            <div class="gn-big">{{ score }}</div>
            <div class="gn-small">/ 100</div>
          </div>
        </div>
        <div class="rd-score-summary">
          <div class="rd-score-band">{{ scoreBand }}</div>
          <div class="rd-score-explainer" v-html="scoreExplainer" />
        </div>
      </div>
      <div v-if="dataNote" class="rd-data-note">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <circle cx="12" cy="7.5" r="0.9" fill="currentColor" />
        </svg>
        <div v-html="dataNote" />
      </div>
    </div>

    <!-- ── Overpay / running cost hero ───────────────────────── -->
    <div class="rd-overpay" data-tour="overpay">
      <div class="rd-overpay-eyebrow">
        <span class="rd-dot" />Estimated annual running cost · EPC data
      </div>
      <div class="rd-overpay-num">£{{ formatNum(estimatedAnnualCost) }}<span class="rd-unit"> / year</span></div>
      <div class="rd-overpay-sub">
        <template v-if="overpayDiff > 0">£{{ formatNum(overpayDiff) }} above the street average. Tap below to see the full breakdown.</template>
        <template v-else>About the same as the street average. Open the breakdown to see where the money goes.</template>
      </div>
      <!-- Primary: See full running costs (white pill, teal-dark text) — navigates to the dedicated page -->
      <button class="rd-cta-btn rd-cta-btn--primary" type="button" @click="$emit('see-running-costs')">
        <span class="rd-cta-emoji">📊</span>
        <span class="rd-cta-label">See full running costs</span>
        <svg class="rd-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
      <!-- Secondary: See your street comparison (translucent-on-teal) -->
      <button class="rd-cta-btn rd-cta-btn--ghost" type="button" @click="$emit('see-street')">
        <span class="rd-cta-emoji">🏘️</span>
        <span class="rd-cta-label">See your street comparison</span>
        <svg class="rd-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>

    <!-- ── EPC & breakdown card ───────────────────────────────── -->
    <div class="rd-breakdown" data-tour="breakdown">
      <!-- EPC rating row -->
      <div class="rd-epc-row">
        <div class="rd-epc-col">
          <div class="rd-epc-label">EPC Rating</div>
          <div class="rd-epc-lines">
            <div class="rd-epc-line">
              <span class="rd-epc-letter-big" :style="{ background: epcColor }">{{ epcRating || '—' }}</span>
              <span class="rd-epc-text">Current · {{ epcCurrentSap }} SAP</span>
            </div>
            <div class="rd-epc-line">
              <span class="rd-epc-letter-big" :style="{ background: '#7AB040' }">{{ epcPotentialLetter }}</span>
              <span class="rd-epc-text rd-epc-text--potential">Potential · {{ epcPotentialSap }} SAP</span>
            </div>
          </div>
        </div>
        <div class="rd-epc-saving">
          <div class="rd-epc-label">Potential saving</div>
          <div class="rd-epc-saving-num">£{{ formatNum(potentialSaving) }}</div>
          <div class="rd-epc-saving-meta">per year</div>
        </div>
      </div>

      <!-- Energy cells -->
      <div class="rd-energy-row">
        <div class="rd-energy-cell">
          <div class="rd-energy-eyebrow">Est. bills/yr</div>
          <div class="rd-energy-num red">£{{ formatNum(Math.round(estimatedAnnualCost * 1.35)) }}</div>
          <div class="rd-energy-meta">heating · hot water · lighting</div>
        </div>
        <div class="rd-energy-cell">
          <div class="rd-energy-eyebrow">Heating</div>
          <div class="rd-energy-num navy">{{ formatNum(heatingKwh) }}</div>
          <div class="rd-energy-meta">kWh/yr</div>
        </div>
        <div class="rd-energy-cell">
          <div class="rd-energy-eyebrow">Hot water</div>
          <div class="rd-energy-num navy">{{ formatNum(hotWaterKwh) }}</div>
          <div class="rd-energy-meta">kWh/yr</div>
        </div>
      </div>

      <!-- Environmental impact -->
      <div class="rd-env">
        <div class="rd-env-eyebrow">🌍 Environmental impact</div>
        <div class="rd-env-row">
          <div>
            <div class="rd-env-num">{{ co2Now.toFixed(1) }}t</div>
            <div class="rd-env-meta">CO₂ per year · currently</div>
          </div>
          <div class="rd-env-arrow">▸</div>
          <div style="text-align: right;">
            <div class="rd-env-num rd-env-num--teal">{{ co2Potential.toFixed(1) }}t</div>
            <div class="rd-env-meta rd-env-meta--teal">potential with improvements</div>
          </div>
        </div>
        <div class="rd-env-bar">
          <div class="rd-env-fill" :style="{ width: `${co2ReductionPct}%` }" />
        </div>
        <div class="rd-env-foot">{{ co2ReductionPct.toFixed(1) }}% reduction possible</div>
      </div>
    </div>

    <!-- ── Intent picker ─────────────────────────────────────── -->
    <div class="rd-intent" data-tour="intent">
      <div class="rd-intent-eyebrow">
        <template v-if="state === 'unclaimed'">What's your connection to this property?</template>
        <template v-else>What brings you here?</template>
      </div>
      <div class="rd-intent-opts">
        <button v-if="state === 'unclaimed'" class="rd-intent-opt primary" type="button" @click="$emit('claim')">
          <span class="rd-intent-icon">🏠</span>
          <span class="rd-intent-body">
            <span class="rd-intent-title">I own this property</span>
            <span class="rd-intent-sub">Tell us what's been done since the EPC — we'll update the score and cut your estimated bills.</span>
          </span>
          <span class="rd-intent-chev">›</span>
        </button>
        <button v-else class="rd-intent-opt primary" type="button" @click="$emit('owner-dashboard')">
          <span class="rd-intent-icon">📄</span>
          <span class="rd-intent-body">
            <span class="rd-intent-title">Go to my dashboard</span>
            <span class="rd-intent-sub">
              <template v-if="state === 'published'">Your Passport is published — manage your record.</template>
              <template v-else>Your Passport is in progress — pick up where you left off.</template>
            </span>
          </span>
          <span class="rd-intent-chev">›</span>
        </button>

        <button class="rd-intent-opt outline" type="button" @click="$emit('interested')">
          <span class="rd-intent-icon">🔍</span>
          <span class="rd-intent-body">
            <span class="rd-intent-title">I'm interested in this property</span>
            <span class="rd-intent-sub">
              <template v-if="state === 'published'">The verified Passport is live — purchase access to see everything.</template>
              <template v-else-if="state === 'inProgress'">Save it — we'll notify you when the Passport is published.</template>
              <template v-else>See full running costs, risks and what to ask before buying or renting.</template>
            </span>
          </span>
          <span class="rd-intent-chev">›</span>
        </button>
      </div>

      <div v-if="state !== 'unclaimed'" class="rd-watchers">
        <span class="rd-pulse-dot" :class="state === 'published' ? 'rd-pulse-green' : 'rd-pulse-amber'" />
        <template v-if="state === 'published'">26 people viewed this Passport this month</template>
        <template v-else>3 buyers are watching this property</template>
      </div>
    </div>

    <div style="height: 28px;" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type PassportState = 'unclaimed' | 'inProgress' | 'published'

const props = defineProps<{
  property: any | null
  score: number
  epcRating: string | null
  state: PassportState
  /** EPC-derived annual running cost estimate (£/year). */
  estimatedAnnualCost: number
  /** Street average annual cost (£/year). Used for overpay sub-line. */
  streetAvgCost?: number
  /** Year the EPC was lodged (shown in score eyebrow). */
  epcYear?: number | null
}>()

defineEmits<{
  (e: 'claim'): void
  (e: 'owner-dashboard'): void
  (e: 'interested'): void
  (e: 'see-street'): void
  (e: 'see-running-costs'): void
}>()

// ── Derived numbers ──
const overpayDiff = computed(() =>
  props.streetAvgCost ? Math.max(0, props.estimatedAnnualCost - props.streetAvgCost) : 0,
)

// EPC year shown in the score-card eyebrow. Prototype hard-codes "2014" when
// data is missing — we mirror that fallback so the chip never shows just
// "EPC data" with nothing after.
const displayEpcYear = computed<number>(() => props.epcYear ?? 2014)

const epcCurrentSap = computed(() => props.score)
const epcPotentialSap = computed(() => Math.min(100, Math.max(props.score + 18, 75)))
const epcPotentialLetter = computed(() => {
  const s = epcPotentialSap.value
  if (s >= 92) return 'A'
  if (s >= 81) return 'B'
  if (s >= 69) return 'C'
  if (s >= 55) return 'D'
  if (s >= 39) return 'E'
  if (s >= 21) return 'F'
  return 'G'
})

const potentialSaving = computed(() => {
  const factor = (epcPotentialSap.value - epcCurrentSap.value) * 0.014
  return Math.max(100, Math.round(props.estimatedAnnualCost * factor))
})

const heatingKwh = computed(() => Math.round(props.estimatedAnnualCost * 12))
const hotWaterKwh = computed(() => Math.round(props.estimatedAnnualCost * 2.5))

const co2Now = computed(() => {
  if (props.epcRating === 'A') return 1.8
  if (props.epcRating === 'B') return 2.6
  if (props.epcRating === 'C') return 3.4
  if (props.epcRating === 'D') return 4.6
  if (props.epcRating === 'E') return 6.4
  if (props.epcRating === 'F') return 8.2
  return 10.5
})
const co2Potential = computed(() => Math.max(1.4, +(co2Now.value * 0.53).toFixed(1)))
const co2ReductionPct = computed(() => +(((co2Now.value - co2Potential.value) / co2Now.value) * 100).toFixed(1))

const epcColor = computed(() => {
  const map: Record<string, string> = {
    A: '#00B050', B: '#33B800', C: '#92D050', D: '#FFD700', E: '#FF9933', F: '#FF6600', G: '#E64A19',
  }
  return map[(props.epcRating || '').toUpperCase()] || '#9c98ad'
})

const gaugeColor = computed(() => {
  if (props.score >= 75) return '#00514d'
  if (props.score >= 60) return '#2EAB55'
  if (props.score >= 40) return '#E6A23C'
  return '#C73E36'
})
const scoreTone = computed(() => {
  if (props.score >= 75) return 'high'
  if (props.score >= 50) return 'mid'
  return 'low'
})
const scoreBand = computed(() => {
  if (props.state === 'published') return 'Room to improve'
  if (props.score >= 80) return 'Highly efficient'
  if (props.score >= 65) return 'Above average'
  if (props.score >= 50) return 'Average'
  if (props.score >= 35) return 'Below average'
  return 'Plenty of opportunities'
})
const scoreExplainer = computed(() => {
  if (props.state === 'published') return 'Verified by the owner. Scores above 70 unlock the full Property Passport.'
  if (props.score >= 80) return 'In the <b>top 20% of UK homes</b>. Strong insulation and modern systems keep running costs well below average.'
  if (props.score >= 60) return 'Better than most UK homes. A few targeted upgrades could push this into the top tier.'
  if (props.score >= 40) return 'Plenty of room to improve. Targeted upgrades could meaningfully cut your bills.'
  return 'This puts the property in the <b>bottom 15%</b> for energy efficiency. Significant room to improve — and to save.'
})
const dataNote = computed(() => {
  if (props.state === 'published') return null
  if (props.state === 'inProgress') return 'Verified Passport not yet published — refining as the owner adds data.'
  if (props.epcYear) return `Based on a <b>${props.epcYear} EPC</b>. The real score may be higher if improvements have been made since.`
  return 'Based on public EPC data. The real score may be higher if improvements have been made since the EPC was lodged.'
})

const randomSearches = computed<number>(() => {
  const id = props.property?.id || ''
  return 3 + ((id.charCodeAt(0) || 1) % 7)
})

function formatNum(n: number): string {
  return new Intl.NumberFormat('en-GB').format(Math.round(n))
}
</script>

<style scoped>
.rd-page {
  background: #fafafa;
  /* No horizontal padding here — each card sets its own 22px side margin
     to match the prototype's per-card spacing rhythm. */
  padding: 4px 0 0;
}

/* ── Amber address card (prototype-exact: margins, pin size, spacing) ── */
.rd-addr-card {
  margin: 16px 22px 12px;
  border-radius: 22px;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #F0A030 0%, #C67C18 50%, #8B4E0A 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 12px 32px -8px rgba(180, 100, 20, 0.40),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  animation: rd-fadeSlideDown 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.rd-addr-card::after {
  content: '';
  position: absolute;
  top: -45%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 65%);
  pointer-events: none;
  z-index: 0;
}
.rd-addr-card > * { position: relative; z-index: 1; }
.rd-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}
.rd-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.30);
  flex-shrink: 0;
  margin-top: 6px;
}
.rd-addr-block { flex: 1; min-width: 0; }
.rd-addr-line { font-size: 19px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2; }
.rd-addr-meta { font-size: 12.5px; font-weight: 600; color: rgba(255, 255, 255, 0.78); margin-top: 2px; }
.rd-addr-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.rd-addr-pill {
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
.rd-addr-pill.epc { padding-left: 6px; }
.rd-epc-letter {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}
.rd-state-unclaimed {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.94);
  color: #7A3A05;
  cursor: pointer;
  font-family: inherit;
}
.rd-state-unclaimed:hover { filter: brightness(0.97); }
.rd-state-progress {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.94);
  color: #7A3A05;
}
.rd-state-published {
  background: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.94);
  color: #00514d;
}
.rd-arrow { font-size: 12px; }

.rd-addr-stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.rd-stat-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}
.rd-stat-count { font-weight: 800; }
.rd-sep { opacity: 0.5; }
.rd-pulse-dot {
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}
.rd-pulse-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  animation: rd-pulse 1.6s ease-out infinite;
}
.rd-pulse-green { background: #6BD4CD; }
.rd-pulse-green::after { border-color: rgba(94, 234, 212, 0.5); }
.rd-pulse-amber { background: #E6A23C; }
.rd-pulse-amber::after { border-color: rgba(251, 191, 36, 0.5); }
@keyframes rd-pulse {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* ── Overpay hero ──────────────────────────────────────────── */
/* Overpay hero — prototype-exact vibrant 3-stop teal gradient. */
.rd-overpay {
  background: linear-gradient(140deg, #00b6ae 0%, #00a19a 50%, #00514d 100%);
  color: #fff;
  border-radius: 20px;
  padding: 22px 22px 20px;
  margin: 0 22px 12px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 12px 32px -10px rgba(0, 161, 154, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transition: transform 0.18s, box-shadow 0.18s;
  animation:
    rd-fadeSlideUp 0.45s 0.20s cubic-bezier(0.22, 1, 0.36, 1) both,
    rd-overpayPulse 2.2s 1.2s ease-in-out 2;
}
.rd-overpay:hover {
  transform: translateY(-2px);
  box-shadow:
    0 16px 40px -10px rgba(0, 161, 154, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
/* Decorative blob in top-right (prototype-exact) */
.rd-overpay::after {
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
.rd-overpay > * { position: relative; z-index: 1; }
.rd-overpay-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.rd-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6BD4CD;
  box-shadow: 0 0 0 3px rgba(107, 212, 205, 0.25);
}
.rd-overpay-num {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -1.6px;
  line-height: 1;
  margin-bottom: 4px;
  font-feature-settings: 'tnum';
}
.rd-overpay-num .rd-unit {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: -0.5px;
  margin-left: 2px;
}
.rd-overpay-sub {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  margin-top: 8px;
}
/* CTA buttons (prototype-exact): white "running costs" + translucent
   "street comparison". Both: emoji left, label center-grows, arrow right. */
.rd-cta-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  padding: 14px 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.1px;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.15s, background 0.15s;
}
.rd-cta-btn--primary {
  background: #fff;
  border: none;
  color: #007e78;
  margin-top: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
.rd-cta-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18); }
.rd-cta-btn--ghost {
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid rgba(255, 255, 255, 0.30);
  color: #fff;
  padding: 13px 18px;
  margin-top: 10px;
}
.rd-cta-btn--ghost:hover { background: rgba(255, 255, 255, 0.22); }
.rd-cta-btn:active { transform: scale(0.99); }
.rd-cta-emoji { font-size: 16px; line-height: 1; flex-shrink: 0; }
.rd-cta-label { flex: 1; text-align: left; }
.rd-cta-arrow {
  width: 16px;
  height: 16px;
  opacity: 0.6;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.rd-cta-btn--ghost .rd-cta-arrow { opacity: 0.75; }
.rd-cta-btn:hover .rd-cta-arrow { transform: translateX(2px); }

/* ── HomeScore card (prototype-exact: 2px teal border, soft teal gradient) ── */
.rd-score-card {
  background: #fff;
  border: 2px solid #00a19a;
  border-radius: 18px;
  padding: 22px 18px 18px;
  margin: 0 22px 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.10);
  transition: all 0.18s;
  animation:
    rd-fadeSlideUp 0.45s 0.10s cubic-bezier(0.22, 1, 0.36, 1) both,
    rd-borderGlow 1.8s 1.0s ease-in-out 1;
}
.rd-score-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(0, 161, 154, 0.16);
}
/* All score tones share the teal border + soft teal-paler gradient. */
.rd-score-card.high,
.rd-score-card.mid,
.rd-score-card.low {
  background: linear-gradient(180deg, #f2faf8 0%, #fff 60%);
  border-color: #00a19a;
}
.rd-score-card .gn-big { color: #007e78; }

.rd-score-eyebrow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
/* "HOMESCORE" eyebrow — uppercase, teal-dark, with a green rounded
   gradient square to the left of the text (prototype-exact). */
.rd-score-eyebrow .left {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #007e78;
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.rd-score-eyebrow .left::before {
  content: '';
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: linear-gradient(135deg, #00b6ae, #007e78);
  display: inline-block;
  flex-shrink: 0;
}
.rd-score-eyebrow .right {
  font-size: 10px;
  font-weight: 700;
  color: #6b6783;
  background: #fafafa;
  border: 1px solid #ececef;
  padding: 3px 8px;
  border-radius: 999px;
}
.rd-score-eyebrow .right--verified {
  color: #007e78;
  background: #f2faf8;
  border-color: #e5f4f2;
}
.rd-score-gauge-wrap {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 14px;
}
.rd-gauge {
  width: 140px;
  height: 140px;
  position: relative;
  flex-shrink: 0;
}
.rd-gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.rd-gauge .g-bg { stroke: #ECECEF; }
.rd-g-num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.rd-g-num .gn-big {
  font-size: 50px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -1.6px;
  line-height: 1;
  font-feature-settings: 'tnum';
}
.rd-g-num .gn-small {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-top: 4px;
}
.rd-score-summary { flex: 1; min-width: 0; }
.rd-score-band {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  margin-bottom: 4px;
}
/* Score-band tone — mirrors prototype's `.score-card.low/.mid/.high .score-band`. */
.rd-score-card.low  .rd-score-band { color: #C73E36; }
.rd-score-card.mid  .rd-score-band { color: #E6A23C; }
.rd-score-card.high .rd-score-band { color: #007e78; }
.rd-score-explainer {
  font-size: 12px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 5px;
  line-height: 1.45;
}
.rd-score-explainer :deep(b) { color: #231d45; font-weight: 800; }
.rd-data-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.45;
}
.rd-data-note svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #9c98ad;
  margin-top: 1px;
}
.rd-data-note :deep(b) { color: #231d45; font-weight: 800; }

/* ── EPC / breakdown card (prototype-exact: 2px amber border + gradient) ── */
.rd-breakdown {
  background: linear-gradient(180deg, rgba(251, 239, 217, 0.6) 0%, #fff 50%);
  border: 2px solid #E6A23C;
  border-radius: 16px;
  padding: 18px;
  margin: 0 22px 12px;
  box-shadow: 0 4px 16px rgba(230, 162, 60, 0.10);
  transition: all 0.18s;
  animation: rd-fadeSlideUp 0.45s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.rd-breakdown:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(230, 162, 60, 0.16);
}
.rd-epc-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f5f5f7;
  margin-bottom: 14px;
}
.rd-epc-col { flex: 1; }
.rd-epc-label {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.rd-epc-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rd-epc-line {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rd-epc-letter-big {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  padding: 3px 10px;
  line-height: 1;
}
.rd-epc-text {
  font-size: 11.5px;
  font-weight: 600;
  color: #6b6783;
}
.rd-epc-text--potential { color: #007e78; font-weight: 700; }
.rd-epc-saving {
  text-align: right;
  flex-shrink: 0;
}
.rd-epc-saving-num {
  font-size: 22px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: -0.5px;
}
.rd-epc-saving-meta {
  font-size: 10px;
  color: #6b6783;
}

.rd-energy-row {
  display: flex;
  border: 1.5px solid #f5f5f7;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 14px;
}
.rd-energy-cell {
  flex: 1;
  padding: 11px 12px;
}
.rd-energy-cell + .rd-energy-cell { border-left: 1px solid #f5f5f7; }
.rd-energy-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.rd-energy-num {
  font-size: 17px;
  font-weight: 800;
}
.rd-energy-num.red { color: #C73E36; }
.rd-energy-num.navy { color: #231d45; }
.rd-energy-meta {
  font-size: 9px;
  color: #6b6783;
  margin-top: 1px;
}

.rd-env {
  background: #f2faf8;
  border: 1.5px solid #e5f4f2;
  border-radius: 12px;
  padding: 13px 14px;
}
.rd-env-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.rd-env-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}
.rd-env-num {
  font-size: 24px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.5px;
  line-height: 1;
}
.rd-env-num--teal { color: #007e78; }
.rd-env-meta {
  font-size: 10px;
  color: #6b6783;
  margin-top: 2px;
}
.rd-env-meta--teal { color: #007e78; font-weight: 700; }
.rd-env-arrow {
  font-size: 14px;
  color: #9c98ad;
  align-self: center;
}
.rd-env-bar {
  margin-top: 10px;
  height: 6px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 100px;
  overflow: hidden;
}
.rd-env-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 100px;
  transition: width 0.5s ease;
}
.rd-env-foot {
  font-size: 10px;
  color: #007e78;
  margin-top: 5px;
  font-weight: 700;
}

/* ── Intent picker ─────────────────────────────────────────── */
/* Intent card — 2px navy border, soft navy-tinted gradient (prototype-exact). */
.rd-intent {
  background:
    radial-gradient(circle at bottom right, rgba(35, 29, 69, 0.06) 0%, transparent 50%),
    linear-gradient(135deg, rgba(35, 29, 69, 0.05) 0%, #fff 70%);
  border: 2px solid #231d45;
  border-radius: 16px;
  padding: 18px;
  margin: 0 22px 12px;
  box-shadow: 0 4px 16px rgba(35, 29, 69, 0.10);
  transition: all 0.18s;
  animation: rd-fadeSlideUp 0.45s 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.rd-intent:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(35, 29, 69, 0.16);
}

/* ── Prototype-exact cascade animations ──────────────────────── */
@keyframes rd-fadeSlideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rd-fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rd-overpayPulse {
  0%   { box-shadow: 0 12px 32px -10px rgba(0, 161, 154, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18); }
  50%  { box-shadow: 0 16px 48px -8px rgba(0, 161, 154, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.18); }
  100% { box-shadow: 0 12px 32px -10px rgba(0, 161, 154, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.18); }
}
@keyframes rd-borderGlow {
  0%   { box-shadow: 0 4px 12px rgba(35, 29, 69, 0.04); }
  50%  { box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.25), 0 8px 24px rgba(0, 161, 154, 0.15); }
  100% { box-shadow: 0 4px 12px rgba(35, 29, 69, 0.04); }
}
/* Eyebrow: centered, uppercase, letter-spaced (prototype-exact). */
.rd-intent-eyebrow {
  font-size: 11px;
  font-weight: 800;
  color: #6b6783;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 14px;
}
.rd-intent-opts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rd-intent-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
}
.rd-intent-opt:hover { transform: translateY(-1px); }
.rd-intent-opt.primary {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.30);
}
.rd-intent-opt.primary:hover {
  background: #00b6ae;
  border-color: #00b6ae;
}
.rd-intent-opt.outline {
  border-color: #ECECEF;
  color: #231d45;
}
.rd-intent-opt.outline:hover {
  border-color: #6e6985;
}
/* Icon now sits in a rounded 36x36 tile, prototype-exact. */
.rd-intent-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.20);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;
}
.rd-intent-opt.outline .rd-intent-icon {
  background: #F2FAF8;
  color: #007e78;
}
.rd-intent-body {
  flex: 1;
  min-width: 0;
}
.rd-intent-title {
  display: block;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.2px;
  margin-bottom: 1px;
}
.rd-intent-sub {
  display: block;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: -0.05px;
  line-height: 1.35;
  opacity: 0.85;
}
.rd-intent-opt.primary .rd-intent-title { color: #fff; }
.rd-intent-opt.primary .rd-intent-sub { color: rgba(255, 255, 255, 0.82); }
.rd-intent-opt.outline .rd-intent-title { color: #231d45; }
.rd-intent-opt.outline .rd-intent-sub { color: #6b6783; }
.rd-intent-chev {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.6;
  flex-shrink: 0;
}
.rd-watchers {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: #6b6783;
}
.rd-watchers .rd-pulse-dot { width: 6px; height: 6px; }
</style>
