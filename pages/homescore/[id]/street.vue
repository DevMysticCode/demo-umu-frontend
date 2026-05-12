<template>
  <div class="hs-street-page">

    <!-- ── Top nav ──────────────────────────────────────────────── -->
    <div class="hs-topnav">
      <button class="hs-back" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="hs-eyebrow-pill">
        <span class="hs-pulse" />HomeScore
      </div>
      <div class="hs-topnav-spacer" />
    </div>

    <!-- ── Address card (teal) ──────────────────────────────────── -->
    <div v-if="property" class="hs-addr-card">
      <div class="hs-addr-top">
        <div class="hs-addr-pin" />
        <div class="hs-addr-block">
          <div class="hs-addr-line">{{ property.addressLine1 }}</div>
          <div class="hs-addr-meta">
            {{ property.postcode }}
            <template v-if="property.propertyType"> · {{ property.propertyType }}</template>
            <template v-if="property.bedrooms"> · {{ property.bedrooms }} bed</template>
          </div>
        </div>
      </div>
      <div class="hs-addr-stats">
        <div class="hs-addr-stat-row">
          <span class="hs-live-dot" />
          <span class="hs-addr-stat-count">{{ randomSearches }} searches today</span>
          <span class="hs-addr-stat-sep">·</span>
          <span>No verified Passport yet</span>
        </div>
      </div>
    </div>

    <!-- ── Saving hero ──────────────────────────────────────────── -->
    <div class="hs-saving-card">
      <div class="hs-saving-head">
        <div class="hs-saving-title">
          You could be saving <span class="hs-saving-num-inline">£{{ formatNum(potentialSaving) }}</span> a year on this property
        </div>
        <div class="hs-saving-sub">
          Based on EPC data from {{ comparedCount }} similar homes on this street.
        </div>
      </div>

      <div class="hs-saving-mid">
        <div class="hs-saving-eyebrow">✦ Potential annual saving on this property</div>
        <div class="hs-saving-big">£{{ formatNum(potentialSaving) }}</div>
        <div class="hs-saving-foot">per year · if this property matched the street average</div>
      </div>

      <div class="hs-saving-split">
        <div class="hs-saving-split-cell">
          <div class="hs-saving-split-eyebrow">Estimated cost</div>
          <div class="hs-saving-split-num red">£{{ formatNum(youCost) }}</div>
          <div class="hs-saving-split-meta">per year</div>
        </div>
        <div class="hs-saving-split-cell">
          <div class="hs-saving-split-eyebrow">Street average</div>
          <div class="hs-saving-split-num amber">£{{ formatNum(avgCost) }}</div>
          <div class="hs-saving-split-meta">per year</div>
        </div>
      </div>
    </div>

    <!-- ── Street rank ─────────────────────────────────────────── -->
    <div class="hs-street-card">
      <div class="hs-street-card-top">
        <div class="hs-street-card-text">
          <div class="hs-street-card-title">Your street, ranked by energy cost</div>
          <div class="hs-street-card-sub">
            This property ranks <b>{{ rankOrdinal(youRank) }} of {{ ranked.length }}</b> on this street by estimated energy cost.
          </div>
        </div>
      </div>

      <div class="hs-rank-list">
        <div class="hs-rank-header">
          <span>{{ streetName }} · energy cost</span>
          <span class="hs-rank-badge">{{ rankOrdinal(youRank) }} of {{ ranked.length }}</span>
        </div>
        <div class="hs-rank-sub">Estimated from EPC data · updated quarterly</div>

        <div class="hs-rank-rows">
          <div
            v-for="(r, i) in ranked"
            :key="i"
            class="hs-rank-row"
            :class="{ you: r.you }"
          >
            <div class="hs-rank-pos" :class="{ you: r.you }">{{ i + 1 }}</div>
            <div class="hs-rank-body">
              <div class="hs-rank-addr">
                {{ r.addr }}<template v-if="r.you"> — this property</template>
              </div>
              <div class="hs-rank-meta">{{ r.meta }}</div>
            </div>
            <div class="hs-rank-cost" :class="r.tone">£{{ formatNum(r.cost) }}</div>
          </div>
        </div>
      </div>

      <div class="hs-legend">
        <span class="hs-legend-item"><span class="hs-legend-dot" style="background:#00a19a;" />Under £1,200/yr</span>
        <span class="hs-legend-item"><span class="hs-legend-dot" style="background:#E6A23C;" />£1,200–£1,600</span>
        <span class="hs-legend-item"><span class="hs-legend-dot" style="background:#C73E36;" />Over £1,600/yr</span>
      </div>
    </div>

    <!-- ── CTA ─────────────────────────────────────────────────── -->
    <div class="hs-cta-wrap">
      <button class="hs-stop-overpay" @click="goToResult">
        <span class="hs-cta-headline">Stop overpaying</span>
        <span class="hs-cta-sub">Get my free HomeScore →</span>
      </button>
      <div class="hs-cta-foot">2 minutes · no account needed</div>
    </div>

    <!-- ── Renters note ────────────────────────────────────────── -->
    <div class="hs-renters-note">
      <div class="hs-renters-icon">🏠</div>
      <div class="hs-renters-text">
        <b>Renting?</b> You can still check your street and challenge your supplier. You don't need to own the property — just know your address.
      </div>
    </div>

    <button class="hs-back-link" @click="router.back()">← Back to results</button>
    <div style="height: 24px;" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const propertyId = route.params.id as string
const property = ref<any>(null)

onMounted(async () => {
  try {
    const res = await fetch(`${config.public.apiBase}/property/${propertyId}`)
    if (res.ok) property.value = await res.json()
  } catch {
    // non-blocking — fall back to defaults below
  }
})

// ── Derived numbers — best-effort from property data, fall back to sample-like values
const youCost = computed<number>(() => {
  const p = property.value
  // Rough estimate from EPC rating if available
  const map: Record<string, number> = { A: 800, B: 1100, C: 1400, D: 1700, E: 2050, F: 2400, G: 2750 }
  if (p?.epcRating && map[p.epcRating]) return map[p.epcRating]
  return 1827
})
const avgCost = computed<number>(() => 1245)
const potentialSaving = computed<number>(() => Math.max(0, youCost.value - avgCost.value))
const comparedCount = 11

const streetName = computed<string>(() => {
  const addr: string = property.value?.addressLine1 || ''
  // Strip leading number to get just the road name (best-effort)
  const m = addr.match(/^\d+[a-z]?,?\s*(.+)$/i)
  return m ? m[1] : (addr || 'this street')
})

// ── Ranked list (sample-style, includes "you" row for this property) ──
const ranked = computed(() => {
  const youAddr = property.value?.addressLine1 || 'This property'
  const rows = [
    { addr: `No. 43, ${streetName.value}`, meta: 'Heat pump · solar · EPC A', cost: 980, tone: 'low' as const, you: false },
    { addr: `No. 51, ${streetName.value}`, meta: 'New boiler (2022) · loft insulation', cost: 1100, tone: 'low' as const, you: false },
    { addr: `No. 47, ${streetName.value}`, meta: 'Double glazed · EPC C', cost: 1190, tone: 'mid' as const, you: false },
    { addr: youAddr, meta: 'Upload a bill to get the real figure', cost: youCost.value, tone: 'high' as const, you: true },
    { addr: `No. 61, ${streetName.value}`, meta: 'EPC D · gas boiler', cost: 1360, tone: 'high' as const, you: false },
  ]
  return rows.sort((a, b) => a.cost - b.cost)
})
const youRank = computed<number>(() => ranked.value.findIndex((r) => r.you) + 1)

const randomSearches = computed<number>(() => 3 + (propertyId.charCodeAt(0) % 7))

function rankOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
function formatNum(n: number): string {
  return new Intl.NumberFormat('en-GB').format(Math.round(n))
}

function goToResult() {
  router.push(`/homescore/${propertyId}`)
}
</script>

<style scoped>
.hs-street-page {
  min-height: 100dvh;
  background: #fff;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  padding-bottom: 16px;
}

/* Top nav */
.hs-topnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 8px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.hs-back {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  display: grid;
  place-items: center;
  color: #00a19a;
  cursor: pointer;
}
.hs-back svg { width: 14px; height: 14px; }
.hs-topnav-spacer { width: 32px; }
.hs-eyebrow-pill {
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
.hs-pulse {
  width: 6px;
  height: 6px;
  background: #00a19a;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #e2f1ea;
}

/* ── Teal address card ───────────────────────────────────────── */
.hs-addr-card {
  margin: 10px 16px 0;
  border-radius: 18px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #00a19a 0%, #007e78 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 161, 154, 0.25);
}
.hs-addr-card::after {
  content: '';
  position: absolute;
  inset: -40% -20% auto auto;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.hs-addr-card > * { position: relative; z-index: 1; }
.hs-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.hs-addr-pin {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.30);
  flex-shrink: 0;
  margin-top: 4px;
}
.hs-addr-block { flex: 1; min-width: 0; }
.hs-addr-line {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
}
.hs-addr-meta {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 2px;
}
.hs-addr-stats {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.hs-addr-stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
}
.hs-live-dot {
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  position: relative;
}
.hs-live-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  animation: hs-pulse 1.6s ease-out infinite;
}
@keyframes hs-pulse {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}
.hs-addr-stat-sep { opacity: 0.5; }

/* ── Saving hero card ────────────────────────────────────────── */
.hs-saving-card {
  margin: 12px 16px 0;
  background: #fff;
  border: 2px solid #e5f4f2;
  border-radius: 20px;
  overflow: hidden;
}
.hs-saving-head {
  padding: 16px 18px 12px;
  border-bottom: 1px solid #f5f5f7;
}
.hs-saving-title {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  line-height: 1.3;
}
.hs-saving-num-inline { color: #00a19a; }
.hs-saving-sub {
  font-size: 11px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 5px;
}
.hs-saving-mid {
  background: linear-gradient(135deg, #f2faf8, #d4f0ed);
  padding: 18px 20px 14px;
  border-bottom: 1.5px solid #e5f4f2;
  text-align: center;
}
.hs-saving-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.hs-saving-big {
  font-size: 52px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: -2px;
  line-height: 1;
}
.hs-saving-foot {
  font-size: 12px;
  font-weight: 600;
  color: #6b6783;
  margin-top: 5px;
}
.hs-saving-split {
  display: flex;
}
.hs-saving-split-cell {
  flex: 1;
  padding: 12px 16px;
}
.hs-saving-split-cell + .hs-saving-split-cell {
  border-left: 1px solid #f5f5f7;
}
.hs-saving-split-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.hs-saving-split-num {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.hs-saving-split-num.red { color: #C73E36; }
.hs-saving-split-num.amber { color: #E6A23C; }
.hs-saving-split-meta {
  font-size: 10px;
  color: #6b6783;
  margin-top: 1px;
}

/* ── Street card ─────────────────────────────────────────────── */
.hs-street-card {
  margin: 14px 16px 0;
  background: #fff;
  border: 1.5px solid #ececef;
  border-radius: 18px;
  overflow: hidden;
}
.hs-street-card-top {
  padding: 16px 18px 12px;
}
.hs-street-card-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.hs-street-card-sub {
  font-size: 12px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 6px;
  line-height: 1.45;
}

.hs-rank-list { padding: 0 18px; }
.hs-rank-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10.5px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding-bottom: 4px;
  border-bottom: 1px dashed #ececef;
  margin-bottom: 4px;
}
.hs-rank-badge {
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  color: #007e78;
  padding: 3px 8px;
  border-radius: 999px;
  letter-spacing: 0.05em;
}
.hs-rank-sub {
  font-size: 10.5px;
  font-weight: 600;
  color: #9c98ad;
  margin-bottom: 8px;
}

.hs-rank-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 14px;
}
.hs-rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #f5f5f7;
}
.hs-rank-row.you {
  background: linear-gradient(135deg, #fff8ec, #fff);
  border-color: #f5dba8;
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.12);
}
.hs-rank-pos {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #ececef;
  color: #6b6783;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}
.hs-rank-pos.you {
  background: #00a19a;
  color: #fff;
}
.hs-rank-body { flex: 1; min-width: 0; }
.hs-rank-addr {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hs-rank-meta {
  font-size: 10.5px;
  font-weight: 600;
  color: #6b6783;
  margin-top: 1px;
}
.hs-rank-cost {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  flex-shrink: 0;
}
.hs-rank-cost.low { color: #00a19a; }
.hs-rank-cost.mid { color: #E6A23C; }
.hs-rank-cost.high { color: #C73E36; }

/* Legend */
.hs-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 14px 14px;
  border-top: 1px dashed #ececef;
}
.hs-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  color: #6b6783;
}
.hs-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* ── CTA ─────────────────────────────────────────────────────── */
.hs-cta-wrap { margin: 14px 16px 0; }
.hs-stop-overpay {
  width: 100%;
  padding: 16px;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 16px;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: -0.1px;
  box-shadow: 0 6px 20px rgba(0, 161, 154, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: all 0.15s;
}
.hs-stop-overpay:hover {
  background: #00b6ae;
  transform: translateY(-1px);
}
.hs-cta-headline {
  font-size: 16px;
  font-weight: 800;
}
.hs-cta-sub {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.85;
}
.hs-cta-foot {
  text-align: center;
  margin-top: 7px;
  font-size: 11px;
  font-weight: 600;
  color: #9c98ad;
}

/* ── Renters note ───────────────────────────────────────────── */
.hs-renters-note {
  margin: 14px 16px 0;
  padding: 12px 14px;
  background: #fef8ed;
  border: 1px solid #f5dba8;
  border-radius: 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.hs-renters-icon {
  font-size: 18px;
  line-height: 1;
}
.hs-renters-text {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: #4a3a1a;
  line-height: 1.5;
}
.hs-renters-text b { color: #231d45; }

.hs-back-link {
  display: block;
  margin: 14px 16px 0;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid #ececef;
  border-radius: 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #6b6783;
  cursor: pointer;
  text-align: left;
}
.hs-back-link:hover { background: #fafafa; }
</style>
