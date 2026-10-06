<template>
  <div class="tv-page">
    <div class="tv-topbar">
      <button class="tv-back" aria-label="Back" @click="goBack">‹</button>
      <div class="tv-top-title">TrueValue</div>
    </div>

    <div v-if="loading" class="tv-loading">
      <div class="tv-spinner" />
      <p>Loading…</p>
    </div>

    <template v-else>
      <!-- No snapshot yet -->
      <div v-if="!snapshot" class="tv-intro">
        <div class="tv-card tv-card--navy">
          <span class="tv-tag">NEW</span>
          <div class="tv-eyebrow"><span class="tv-dot" /> TrueValue</div>
          <h2 class="tv-h2">What's your home<br>really worth?</h2>
          <p class="tv-body">Not a postcode guess. We count the work you've actually done - then verify it.</p>
          <div class="tv-current">
            <span class="tv-current-val">{{ baseline ? formatPrice(baseline) : '-' }}</span>
            <span class="tv-current-lab">current estimate</span>
          </div>
          <button class="tv-btn tv-btn--onnavy" @click="startQuiz">Value your home &nbsp;→</button>
        </div>
        <p class="tv-fineprint">Free to use. We only ask you to sign in when you want to upload proof of a work you've done.</p>
      </div>

      <!-- Has a snapshot -->
      <div v-else class="tv-result">
        <div class="tv-hero">
          <div class="tv-hero-lab">Evidence-adjusted estimate</div>
          <div class="tv-hero-big">{{ formatRange(snapshot) }}</div>
          <div class="tv-hero-base">was {{ formatPrice(snapshot.baseline) }} on postcode alone</div>

          <div class="tv-confwrap">
            <div class="tv-ring" v-html="ringSvg" />
            <div class="tv-conftext">
              <div class="tv-conftext-big">{{ snapshot.provedCount }} of {{ snapshot.scoringCount }} proved</div>
              <div class="tv-conftext-sub">
                {{ snapshot.provedCount < snapshot.scoringCount ? 'Prove the rest and this range narrows.' : 'Fully evidenced - as tight as it gets.' }}
              </div>
            </div>
          </div>
        </div>

        <div class="tv-tierhead tv-tierhead--t1">
          <b>What moved the number</b>
          <span>Works that lift your home above par.</span>
        </div>
        <div class="tv-breakdown">
          <div v-for="row in breakdownRows" :key="row.key" class="tv-brow">
            <div class="tv-brow-l">
              <span :class="row.zero ? 'tv-dash' : 'tv-tick'">{{ row.zero ? '–' : '✓' }}</span>
              <span>{{ row.label }}<span v-if="row.key === 'epc' && snapshot.epcSuppressed" class="tv-epc-note"> · EPC out of date</span></span>
            </div>
            <div class="tv-brow-r" :class="row.zero ? 'tv-zero' : 'tv-pos'">{{ row.zero ? '-' : '+' + formatPrice(row.amount) }}</div>
          </div>
        </div>

        <template v-if="snapshot.derisked">
          <div class="tv-tierhead tv-tierhead--t2">
            <b>What protects the number</b>
            <span>No uplift - but you avoid a deduction, and the guarantees transfer to your buyer.</span>
          </div>
          <div class="tv-breakdown">
            <div class="tv-brow">
              <div class="tv-brow-l"><span class="tv-tick">✓</span><span>{{ snapshot.derisked }} item{{ snapshot.derisked === 1 ? '' : 's' }} de-risked</span></div>
              <div class="tv-brow-r tv-zero">no uplift</div>
            </div>
          </div>
        </template>

        <template v-if="snapshot.recorded || snapshot.flagged">
          <div class="tv-tierhead tv-tierhead--t3">
            <b>Recorded, not scored</b>
            <span>Stored in your Passport. Deliberately excluded from the estimate.</span>
          </div>
          <div class="tv-breakdown">
            <div v-if="snapshot.recorded" class="tv-brow">
              <div class="tv-brow-l"><span class="tv-dash">–</span><span>{{ snapshot.recorded }} recorded for the Passport</span></div>
              <div class="tv-brow-r tv-zero">-</div>
            </div>
            <div v-if="snapshot.flagged" class="tv-brow">
              <div class="tv-brow-l"><span class="tv-dash">!</span><span>{{ snapshot.flagged }} flagged for disclosure</span></div>
              <div class="tv-brow-r tv-zero">-</div>
            </div>
          </div>
        </template>

        <div v-if="snapshot.epcSuppressed" class="tv-caveat">
          <span class="tv-caveat-ic">⚠️</span>
          <div class="tv-caveat-ct"><b>Energy value is held back.</b> Your EPC predates your work, so solar, insulation and heating aren't scored on it. Re-assess to release it.</div>
        </div>

        <p class="tv-fineprint">Indicative estimate from public data and the evidence you've provided. Not a formal RICS (Red Book) valuation or a lending figure.</p>

        <button class="tv-btn tv-btn--primary" @click="startQuiz">Update improvements &nbsp;→</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const propertyId = route.params.id as string

const goBack = useGoBack(`/property/${propertyId}`)

const loading = ref(true)
const snapshot = ref<any>(null)
const baseline = ref<number | null>(null)

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}

function formatPrice(price: number) {
  return '£' + Math.round(price).toLocaleString('en-GB')
}
function formatRange(s: any) {
  return formatPrice(s.estimateLow) + '–' + formatPrice(s.estimateHigh).replace('£', '')
}

const breakdownRows = computed(() => {
  if (!snapshot.value) return []
  const c = snapshot.value.contributions || {}
  const rows = [
    { key: 'capital', label: 'Space & capital works' },
    { key: 'condition', label: 'Condition & modernisation' },
    { key: 'consent', label: 'Consents & permissions' },
    { key: 'epc', label: 'Energy (via EPC)' },
  ]
  return rows.map((r) => {
    const [lo, hi] = c[r.key] || [0, 0]
    const amount = Math.round(((lo + hi) / 2) * snapshot.value.baseline)
    return { ...r, amount, zero: amount < 500 }
  })
})

const ringSvg = computed(() => {
  const s = snapshot.value
  const pct = s && s.scoringCount ? (s.provedCount / s.scoringCount) * 100 : 0
  const size = 118
  const rad = 53
  const c = 2 * Math.PI * rad
  const off = c * (1 - pct / 100)
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle cx="59" cy="59" r="${rad}" fill="none" stroke="rgba(255,255,255,.26)" stroke-width="7"/>
    <circle cx="59" cy="59" r="${rad}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 59 59)"/>
    <text x="59" y="55" text-anchor="middle" fill="#fff" font-size="34" font-weight="700" font-family="inherit">${s?.provedCount ?? 0}</text>
    <text x="59" y="74" text-anchor="middle" fill="#fff" font-size="9.5" font-weight="700" opacity=".85" letter-spacing="1.3" font-family="inherit">/ ${s?.scoringCount ?? 0} PROVED</text>
  </svg>`
})

function startQuiz() {
  router.push(`/truevalue/${propertyId}/quiz`)
}

onMounted(async () => {
  try {
    const propRes: any = await $fetch(`${config.public.apiBase}/property/${propertyId}`)
    baseline.value = Number(propRes?.estimatedPrice ?? propRes?.lastSoldPrice ?? 0) || null
  } catch {
    /* baseline stays null - intro card just shows - */
  }

  if (token()) {
    try {
      const res: any = await $fetch(`${config.public.apiBase}/property/${propertyId}/truevalue`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
      snapshot.value = res?.snapshot ?? null
    } catch {
      snapshot.value = null
    }
  }
  loading.value = false
})
</script>

<style scoped>
.tv-page {
  --navy: #231d45;
  --teal: #00a19a;
  --teal-d: #00817b;
  --muted: #6e6879;
  --line: #e7e4ec;
  --ok: #1f8f62;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 20px 60px;
  color: var(--navy);
  font-family: inherit;
}
.tv-topbar { display: flex; align-items: center; gap: 13px; padding: 18px 0 14px; }
.tv-back {
  width: 42px; height: 42px; border-radius: 50%; border: 1.7px solid var(--line); background: #fff;
  display: grid; place-items: center; cursor: pointer; font-size: 1.25rem; color: var(--navy); flex: 0 0 auto; line-height: 1;
}
.tv-top-title { font-weight: 700; font-size: 1.125rem; }

.tv-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 0; color: var(--muted); }
.tv-spinner { width: 32px; height: 32px; border: 3px solid var(--line); border-top-color: var(--teal); border-radius: 50%; animation: tv-spin 0.8s linear infinite; }
@keyframes tv-spin { to { transform: rotate(360deg); } }

.tv-card { border-radius: 28px; padding: 26px 24px; color: #fff; position: relative; box-shadow: 0 12px 30px rgba(35, 29, 69, 0.16); }
.tv-card--navy { background: var(--navy); }
.tv-tag { position: absolute; top: 24px; right: 24px; font-size: 0.7813rem; font-weight: 700; background: rgba(255, 255, 255, 0.2); padding: 9px 16px; border-radius: 22px; text-transform: uppercase; }
.tv-eyebrow { display: flex; align-items: center; gap: 9px; font-size: 0.7813rem; font-weight: 700; letter-spacing: 1.7px; text-transform: uppercase; opacity: 0.95; }
.tv-dot { width: 9px; height: 9px; border-radius: 50%; background: #fff; opacity: 0.85; }
.tv-h2 { font-size: 1.75rem; line-height: 1.08; letter-spacing: -0.9px; margin: 16px 0 10px; font-weight: 700; }
.tv-body { font-size: 0.9688rem; line-height: 1.45; opacity: 0.92; margin: 0; }
.tv-current { margin: 20px 0 6px; }
.tv-current-val { font-size: 1.625rem; font-weight: 700; letter-spacing: -0.8px; }
.tv-current-lab { display: block; font-size: 0.7813rem; opacity: 0.75; margin-top: 2px; }

.tv-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; border: none; cursor: pointer; font-weight: 700; font-size: 1rem; padding: 17px; border-radius: 20px; }
.tv-btn--onnavy { background: rgba(255, 255, 255, 0.17); color: #fff; margin-top: 18px; }
.tv-btn--primary { background: var(--teal); color: #fff; margin-top: 18px; }

.tv-fineprint { font-size: 0.7813rem; color: var(--muted); line-height: 1.5; margin-top: 16px; text-align: center; }

.tv-hero { background: var(--navy); border-radius: 28px; padding: 26px 24px; color: #fff; text-align: center; box-shadow: 0 14px 34px rgba(35, 29, 69, 0.3); }
.tv-hero-lab { font-size: 0.7188rem; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; opacity: 0.85; }
.tv-hero-big { font-size: 1.875rem; font-weight: 700; letter-spacing: -1.2px; margin: 12px 0 4px; }
.tv-hero-base { font-size: 0.875rem; opacity: 0.85; }
.tv-confwrap { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 14px; }
.tv-conftext { text-align: left; }
.tv-conftext-big { font-weight: 700; font-size: 1rem; }
.tv-conftext-sub { font-size: 0.7813rem; opacity: 0.85; margin-top: 4px; line-height: 1.4; }

.tv-tierhead { border-radius: 16px; padding: 14px 16px; margin: 20px 0 12px; }
.tv-tierhead b { display: block; font-size: 0.9375rem; font-weight: 700; margin-bottom: 4px; }
.tv-tierhead span { font-size: 0.8125rem; line-height: 1.45; display: block; }
.tv-tierhead--t1 { background: #e3f5f3; color: #00615c; }
.tv-tierhead--t1 b { color: #00463f; }
.tv-tierhead--t2 { background: #e9f4ee; color: #1d6144; }
.tv-tierhead--t2 b { color: #134730; }
.tv-tierhead--t3 { background: #efedf2; color: var(--muted); }
.tv-tierhead--t3 b { color: var(--navy); }

.tv-breakdown { background: #fff; border: 1.5px solid var(--line); border-radius: 22px; padding: 4px 18px; }
.tv-brow { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1.5px solid var(--line); font-size: 0.9063rem; gap: 10px; }
.tv-brow:last-child { border-bottom: none; }
.tv-brow-l { display: flex; align-items: center; gap: 10px; font-weight: 600; color: var(--navy); }
.tv-brow-r { font-weight: 700; white-space: nowrap; }
.tv-brow-r.tv-pos { color: var(--ok); }
.tv-brow-r.tv-zero { color: var(--muted); font-weight: 600; }
.tv-epc-note { color: #7d6428; font-weight: 700; }
.tv-tick { width: 20px; height: 20px; border-radius: 50%; background: #dff2e9; color: var(--ok); display: grid; place-items: center; font-size: 0.6875rem; font-weight: 800; flex: 0 0 auto; }
.tv-dash { width: 20px; height: 20px; border-radius: 50%; background: #efedf2; color: #a29eae; display: grid; place-items: center; font-size: 0.6875rem; font-weight: 800; flex: 0 0 auto; }

.tv-caveat { background: #f6f0e4; border: 1.5px solid #e6d6b6; border-radius: 20px; padding: 17px; margin-top: 14px; display: flex; gap: 12px; }
.tv-caveat-ic { flex: 0 0 auto; font-size: 1.0625rem; }
.tv-caveat-ct { font-size: 0.875rem; line-height: 1.5; color: #6b5320; }
.tv-caveat-ct b { color: #54400f; }
</style>
