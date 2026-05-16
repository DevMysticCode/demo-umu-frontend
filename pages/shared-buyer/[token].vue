<template>
  <div class="sb-page">
    <!-- ── Header (no auth context — purely visual) ── -->
    <div class="sb-header">
      <div class="sb-eyebrow">
        <span class="sb-dot" />UMU · Verified Buyer Profile
      </div>
      <div v-if="data?.publicRef" class="sb-ref">Ref · {{ data.publicRef }}</div>
    </div>

    <!-- ── Loading / error states ── -->
    <div v-if="loading" class="sb-loading">Loading buyer profile…</div>

    <div v-else-if="error" class="sb-error-card">
      <div class="sb-error-emoji">
        <template v-if="error === 'expired'">⏳</template>
        <template v-else-if="error === 'revoked'">🚫</template>
        <template v-else>🔒</template>
      </div>
      <div class="sb-error-title">
        <template v-if="error === 'expired'">This link has expired</template>
        <template v-else-if="error === 'revoked'">Access has been revoked</template>
        <template v-else>Profile not available</template>
      </div>
      <div class="sb-error-sub">
        <template v-if="error === 'expired'">
          The buyer's share window has closed. Ask them for a new link.
        </template>
        <template v-else-if="error === 'revoked'">
          The buyer has withdrawn access. Ask them for a new link if you still
          need to view their profile.
        </template>
        <template v-else>
          The share link couldn't be found. Double-check the URL.
        </template>
      </div>
    </div>

    <!-- ── Profile badge ── -->
    <div v-else-if="data" class="sb-content">
      <!-- Hero with tier + strength gauge -->
      <div class="sb-hero" :class="`sb-hero--${(data.tier || 'BASIC').toLowerCase()}`">
        <div class="sb-tier-row">
          <div class="sb-tier-badge" :class="`sb-tier-badge--${(data.tier || 'BASIC').toLowerCase()}`">
            <span v-if="data.tier === 'PREMIUM'">★ PREMIUM</span>
            <span v-else-if="data.tier === 'VERIFIED'">✓ VERIFIED</span>
            <span v-else>○ BASIC</span>
          </div>
          <div v-if="data.sharedTo" class="sb-shared-to">Shared with {{ data.sharedTo }}</div>
        </div>
        <div class="sb-hero-headline">Verified buyer · ready to move</div>
        <div class="sb-hero-sub">
          This profile was prepared by the buyer through UMU and verified
          against UK identity, banking and credit data sources.
        </div>

        <!-- Strength gauge -->
        <div class="sb-gauge-wrap">
          <svg viewBox="0 0 120 120" class="sb-gauge">
            <circle cx="60" cy="60" r="50" class="sb-gauge-track" />
            <circle
              cx="60"
              cy="60"
              r="50"
              class="sb-gauge-fill"
              :style="{
                strokeDashoffset: 314.16 - (animatedStrength / 100) * 314.16,
              }"
            />
          </svg>
          <div class="sb-gauge-label">
            <div class="sb-gauge-num">{{ Math.round(animatedStrength) }}</div>
            <div class="sb-gauge-denom">/ 100 strength</div>
          </div>
        </div>
      </div>

      <!-- Identity -->
      <div v-if="data.identity" class="sb-card">
        <div class="sb-card-head">
          <div class="sb-card-emoji">🪪</div>
          <div class="sb-card-title">Identity</div>
          <div
            v-if="data.identity.idVerified"
            class="sb-pill sb-pill--ok"
          >
            ✓ DVS verified
          </div>
          <div v-else class="sb-pill sb-pill--pending">Pending</div>
        </div>
        <div class="sb-kv">
          <span>ID type</span>
          <strong>{{ idTypeLabel(data.identity.idDocumentType) }}</strong>
        </div>
        <div v-if="data.identity.idVerifiedAt" class="sb-kv">
          <span>Verified on</span>
          <strong>{{ formatDate(data.identity.idVerifiedAt) }}</strong>
        </div>
      </div>

      <!-- Deposit / funds -->
      <div v-if="data.deposit" class="sb-card">
        <div class="sb-card-head">
          <div class="sb-card-emoji">💷</div>
          <div class="sb-card-title">Deposit &amp; funds</div>
          <div
            v-if="data.deposit.fundsVerified"
            class="sb-pill sb-pill--ok"
          >
            ✓ Bank verified
          </div>
          <div v-else class="sb-pill sb-pill--pending">Self-declared</div>
        </div>
        <div class="sb-kv">
          <span>Funds source</span>
          <strong>{{ fundsTypeLabel(data.deposit.fundsType) }}</strong>
        </div>
        <div class="sb-kv">
          <span>Maximum budget</span>
          <strong>£{{ (data.deposit.fundsAmount || 0).toLocaleString() }}</strong>
        </div>
        <div v-if="data.deposit.fundsAmountVerified" class="sb-kv">
          <span>Confirmed by open banking</span>
          <strong>£{{ data.deposit.fundsAmountVerified.toLocaleString() }}</strong>
        </div>
      </div>

      <!-- Source of funds -->
      <div v-if="data.sourceOfFunds" class="sb-card">
        <div class="sb-card-head">
          <div class="sb-card-emoji">📊</div>
          <div class="sb-card-title">Source of funds</div>
          <div
            v-if="data.amlStatus === 'CLEAR'"
            class="sb-pill sb-pill--ok"
          >
            ✓ AML clear
          </div>
        </div>
        <div
          v-for="row in normaliseSof(data.sourceOfFunds)"
          :key="row.label"
          class="sb-kv"
        >
          <span>{{ row.label }}</span>
          <strong>£{{ row.amount.toLocaleString() }}</strong>
        </div>
      </div>

      <!-- Affordability -->
      <div v-if="data.affordabilityScore" class="sb-card">
        <div class="sb-card-head">
          <div class="sb-card-emoji">📈</div>
          <div class="sb-card-title">Affordability score</div>
        </div>
        <div class="sb-aff-num">{{ data.affordabilityScore }} / 100</div>
      </div>

      <!-- Chain + timeline + solicitor — always available regardless of scope -->
      <div class="sb-card">
        <div class="sb-card-head">
          <div class="sb-card-emoji">🔗</div>
          <div class="sb-card-title">Move-ready signals</div>
        </div>
        <div class="sb-kv">
          <span>Chain position</span>
          <strong>{{ chainLabel(data.chainPosition) }}</strong>
        </div>
        <div class="sb-kv">
          <span>Timeline</span>
          <strong>{{ timelineLabel(data.timeline) }}</strong>
        </div>
        <div class="sb-kv">
          <span>Solicitor</span>
          <strong>{{ solicitorLabel(data.solicitorStatus) }}</strong>
        </div>
      </div>

      <!-- Story -->
      <div v-if="data.statement" class="sb-card">
        <div class="sb-card-head">
          <div class="sb-card-emoji">✍️</div>
          <div class="sb-card-title">Their story</div>
        </div>
        <p class="sb-story">{{ data.statement }}</p>
      </div>

      <!-- Footer -->
      <div class="sb-foot">
        Buyer profile shared via UMU · expires {{ formatDate(data.expiresAt) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

definePageMeta({ layout: false })

const route = useRoute()
const token = route.params.token as string
const { getPublicShare } = useBuyerProfile()

const loading = ref(true)
const data = ref<any>(null)
const error = ref<'expired' | 'revoked' | 'notfound' | null>(null)

onMounted(async () => {
  try {
    data.value = await getPublicShare(token)
  } catch (e: any) {
    // Backend uses 410 Gone for expired/revoked, 404 for not-found.
    const status = e?.status || e?.statusCode || e?.response?.status
    const msg = String(e?.data?.message || e?.message || '').toLowerCase()
    if (status === 410 && msg.includes('expired')) error.value = 'expired'
    else if (status === 410) error.value = 'revoked'
    else error.value = 'notfound'
  } finally {
    loading.value = false
  }
})

// ── Animated strength gauge ──
const animatedStrength = ref(0)
let raf = 0
watch(
  () => data.value?.strengthScore,
  (v) => {
    const target = Number(v) || 0
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { animatedStrength.value = target; return }
    cancelAnimationFrame(raf)
    const from = animatedStrength.value
    if (from === target) return
    const start = performance.now()
    const dur = 900
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      animatedStrength.value = from + (target - from) * eased
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  },
)
onBeforeUnmount(() => cancelAnimationFrame(raf))

// ── Label helpers ──
function idTypeLabel(t: string | null | undefined) {
  if (!t) return '—'
  return ({ passport: 'Passport', drivingLicence: 'Driving licence', nationalId: 'National ID' } as any)[t] || t
}
function fundsTypeLabel(t: string | null | undefined) {
  return ({ mortgage: 'Mortgage', cash: 'Cash buyer', help: 'Help to Buy' } as any)[t || ''] || '—'
}
function chainLabel(t: string | null | undefined) {
  return ({ ftb: 'First-time buyer', selling: 'Property to sell', sold: 'Already sold', renting: 'Renting' } as any)[t || ''] || '—'
}
function timelineLabel(t: string | null | undefined) {
  return ({ asap: 'Ready now', '3m': '1–3 months', '6m': '3–6 months', flex: 'Flexible' } as any)[t || ''] || '—'
}
function solicitorLabel(t: string | null | undefined) {
  return ({ yes: 'Instructed', looking: 'Looking', notsure: 'Not yet sure' } as any)[t || ''] || '—'
}
function formatDate(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function normaliseSof(raw: any): { label: string; amount: number }[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object') {
    return Object.entries(raw).map(([k, v]) => ({ label: k, amount: Number(v) || 0 }))
  }
  return []
}
</script>

<style scoped>
.sb-page {
  min-height: 100vh;
  background: #fafafa;
  padding: 16px;
  max-width: 480px;
  margin: 0 auto;
  font-family: inherit;
}
.sb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.sb-eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 1.5px; color: #00a19a; text-transform: uppercase; display: flex; align-items: center; gap: 6px; }
.sb-dot { width: 6px; height: 6px; border-radius: 50%; background: #00a19a; }
.sb-ref { font-size: 11px; font-weight: 700; color: #6b6783; font-family: 'SF Mono', Menlo, monospace; }

.sb-loading { padding: 80px 24px; text-align: center; color: #6b6783; font-size: 13px; font-weight: 600; }
.sb-error-card { background: #fff; border: 1px solid #ececef; border-radius: 16px; padding: 36px 22px; text-align: center; }
.sb-error-emoji { font-size: 40px; margin-bottom: 12px; }
.sb-error-title { font-size: 18px; font-weight: 800; color: #231d45; margin-bottom: 8px; }
.sb-error-sub { font-size: 13px; font-weight: 500; color: #6b6783; line-height: 1.55; }

.sb-content { display: flex; flex-direction: column; gap: 12px; }

.sb-hero { border-radius: 22px; padding: 22px 22px 24px; color: #fff; position: relative; overflow: hidden; }
.sb-hero--basic { background: linear-gradient(135deg, #4dd4ce 0%, #00a19a 60%, #006e68 100%); }
.sb-hero--verified { background: linear-gradient(135deg, #00a19a 0%, #00857f 60%, #00514d 100%); }
.sb-hero--premium { background: linear-gradient(135deg, #f0b460 0%, #d4822a 50%, #7a3a05 100%); }
.sb-tier-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.sb-tier-badge { background: rgba(255,255,255,0.18); padding: 6px 12px; border-radius: 16px; font-size: 10px; font-weight: 900; letter-spacing: 1.5px; }
.sb-shared-to { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.85); }
.sb-hero-headline { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.2; }
.sb-hero-sub { font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.86); line-height: 1.5; margin-top: 6px; margin-bottom: 18px; }

.sb-gauge-wrap { position: relative; width: 120px; height: 120px; margin: 0 auto; }
.sb-gauge { transform: rotate(-90deg); width: 120px; height: 120px; }
.sb-gauge-track { fill: none; stroke: rgba(255,255,255,0.22); stroke-width: 9; }
.sb-gauge-fill { fill: none; stroke: #fff; stroke-width: 9; stroke-linecap: round; stroke-dasharray: 314.16; transition: stroke-dashoffset 0.6s cubic-bezier(.22,1,.36,1); }
.sb-gauge-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.sb-gauge-num { font-size: 30px; font-weight: 900; letter-spacing: -1px; }
.sb-gauge-denom { font-size: 9px; font-weight: 700; opacity: 0.85; letter-spacing: 1px; text-transform: uppercase; }

.sb-card { background: #fff; border: 1px solid #ececef; border-radius: 16px; padding: 16px 18px; }
.sb-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.sb-card-emoji { font-size: 18px; }
.sb-card-title { font-size: 14px; font-weight: 800; color: #231d45; flex: 1; }
.sb-pill { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 100px; letter-spacing: 0.5px; }
.sb-pill--ok { background: #e6f7f6; color: #00857f; }
.sb-pill--pending { background: #f5f5f7; color: #6b6783; }
.sb-kv { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f7; font-size: 13px; }
.sb-kv:last-child { border-bottom: none; }
.sb-kv span { color: #6b6783; }
.sb-kv strong { color: #231d45; font-weight: 700; }
.sb-aff-num { font-size: 28px; font-weight: 900; color: #231d45; letter-spacing: -0.5px; }
.sb-story { font-size: 13px; line-height: 1.6; color: #4a4560; white-space: pre-wrap; }

.sb-foot { text-align: center; font-size: 11px; color: #9c98ad; padding: 16px 12px 4px; }
</style>
