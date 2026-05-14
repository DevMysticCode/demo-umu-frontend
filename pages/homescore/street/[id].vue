<template>
  <div class="hs-street-screen">
    <!-- ── Top nav ──────────────────────────────────────────────── -->
    <div class="hs-topnav">
      <button class="back-btn" @click="router.back()" aria-label="Back">
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
      <div class="eyebrow-pill"><span class="dot" />HomeScore</div>
      <button
        class="tour-btn"
        type="button"
        @click="tour.restart()"
        title="How does this work?"
      >
        ?
      </button>
    </div>

    <!-- ── Address card — amber gradient ─────────────────────────── -->
    <div class="hs-addr-card" data-tour="addr">
      <div class="hs-addr-top">
        <div class="hs-addr-pin" />
        <div class="hs-addr-block">
          <div ref="addrLineEl" class="hs-addr-line">
            <span class="cursor" />
          </div>
          <div class="hs-addr-meta">
            {{ property?.postcode || '—' }}
            <template v-if="property?.propertyType">
              · {{ property.propertyType }}</template
            >
            <template v-if="property?.bedrooms">
              · {{ property.bedrooms }} bed</template
            >
          </div>
        </div>
      </div>
      <div class="hs-addr-stats">
        <div class="hs-addr-stat-row">
          <span class="pulse-dot" />
          <span class="hs-addr-stat-count"
            >{{ searchesToday }} searches today</span
          >
          <span class="hs-addr-stat-sep">·</span>
          <span>{{ passportStatusLine }}</span>
        </div>
      </div>
    </div>

    <!-- ── Saving hero — the big number ─────────────────────────── -->
    <div class="hs-saving-wrap" data-tour="hero">
      <div class="hs-saving-head">
        <div ref="heroTitleEl" class="hs-hero-title">
          <span class="cursor" />
        </div>
        <div class="hs-hero-sub">
          Based on EPC data from {{ comparedCount }} similar homes on this
          street.
        </div>
      </div>

      <div ref="saveWrapEl" class="hs-save-wrap">
        <div class="hs-save-eyebrow">
          {{
            savingDirection === 'more'
              ? '✦ Potential annual saving on this property'
              : '✓ Below the street average by'
          }}
        </div>
        <div ref="saveNumEl" class="hs-save-num">£0</div>
        <div class="hs-save-foot">
          {{
            savingDirection === 'more'
              ? 'per year · if this property matched the street average'
              : 'per year · cheaper than the typical home on this street'
          }}
        </div>
      </div>

      <div class="hs-save-split">
        <div class="hs-save-cell hs-save-cell--you">
          <div class="hs-save-cell-eyebrow">Estimated cost</div>
          <div ref="youNumEl" class="hs-save-cell-num">£0</div>
          <div class="hs-save-cell-meta">per year</div>
        </div>
        <div class="hs-save-cell hs-save-cell--avg">
          <div class="hs-save-cell-eyebrow">Street average</div>
          <div ref="avgNumEl" class="hs-save-cell-num">£0</div>
          <div class="hs-save-cell-meta">per year</div>
        </div>
      </div>
    </div>

    <!-- ── Street card — ranked list ────────────────────────────── -->
    <div class="street-card fomo expanded" data-tour="street">
      <div class="street-card-top">
        <div class="street-card-text">
          <div class="street-card-title">
            Your street, ranked by energy cost
          </div>
          <div class="street-card-sub">
            This property ranks
            <b>{{ rankOrdinal(youRank) }} of {{ ranked.length }}</b> on this
            street by estimated energy cost.
          </div>
        </div>
      </div>

      <div class="street-rank-list">
        <div class="street-rank-header">
          <span>{{ streetName }} · energy cost</span>
          <span class="street-rank-badge"
            >{{ rankOrdinal(youRank) }} of {{ ranked.length }}</span
          >
        </div>
        <div class="street-rank-sub">
          Estimated from EPC data · updated quarterly
        </div>
        <div class="street-rank-rows">
          <div
            v-for="(r, i) in ranked"
            :key="i"
            class="street-rank-row"
            :class="{ you: r.you }"
          >
            <div class="street-rank-pos" :class="{ you: r.you }">
              {{ i + 1 }}
            </div>
            <div class="street-rank-body">
              <div class="street-rank-addr">
                {{ r.addr }}<template v-if="r.you"> — this property</template>
              </div>
              <div class="street-rank-meta">{{ r.meta }}</div>
            </div>
            <div class="street-rank-cost" :class="r.tone">
              £{{ formatNum(r.cost) }}
            </div>
          </div>
        </div>
      </div>

      <div class="street-illust">
        <div class="street-legend">
          <span class="street-legend-item"
            ><span class="street-legend-dot" style="background: #00a19a" />Under
            £1,500/yr</span
          >
          <span class="street-legend-item"
            ><span
              class="street-legend-dot"
              style="background: #e6a23c"
            />£1,500–£2,000</span
          >
          <span class="street-legend-item"
            ><span class="street-legend-dot" style="background: #c73e36" />Over
            £2,000/yr</span
          >
        </div>
      </div>
    </div>

    <!-- ── Renters note ────────────────────────────────────────── -->
    <div class="renters-note">
      <div class="renters-icon">🏠</div>
      <div class="renters-text">
        <b>Renting?</b> You can still check your street and challenge your
        supplier. You don't need to own the property — just know your address.
      </div>
    </div>

    <button class="back-link" type="button" @click="router.back()">
      ← Back to results
    </button>
    <div style="height: 24px" />

    <!-- ── Tour overlay ────────────────────────────────────────── -->
    <TourCoach :tour="tour" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TourCoach from '~/components/homescore/TourCoach.vue'
import { useHomescoreTour } from '~/composables/useHomescoreTour'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const propertyId = route.params.id as string
const property = ref<any>(null)

// ── Cost figures (best-effort from property, sample fallback) ──
const youCost = computed<number>(() => {
  const p = property.value
  const map: Record<string, number> = {
    A: 980,
    B: 1100,
    C: 1300,
    D: 1592,
    E: 1823,
    F: 2200,
    G: 2600,
  }
  if (p?.epcRating && map[p.epcRating]) return map[p.epcRating]
  return 1823
})
const avgCost = 1673
const comparedCount = 11
// Always show the meaningful difference (above OR below the street average).
// The direction ("more" / "less") is handled by the hero title copy.
const saving = computed<number>(() => Math.abs(youCost.value - avgCost))
const savingDirection = computed<'more' | 'less'>(() =>
  youCost.value >= avgCost ? 'more' : 'less',
)

const streetName = computed<string>(() => {
  const addr: string = property.value?.addressLine1 || ''
  const m = addr.match(/^\d+[a-z]?,?\s*(.+)$/i)
  return m ? m[1] : addr || 'this street'
})

// ── Ranked list ──
const ranked = computed(() => {
  const youAddr = property.value?.addressLine1 || 'This property'
  const youCostVal = youCost.value
  const youTone: 'low' | 'mid' | 'high' =
    youCostVal < 1500 ? 'low' : youCostVal < 2000 ? 'mid' : 'high'
  const base = [
    {
      addr: `7 ${streetName.value}`,
      meta: 'Filled cavity · TRVs · EPC D (61) · 103m²',
      cost: 1301,
      tone: 'low' as const,
      you: false,
    },
    {
      addr: `1 ${streetName.value}`,
      meta: 'Solar PV · filled cavity · EPC B (84) · 175m²',
      cost: 1330,
      tone: 'low' as const,
      you: false,
    },
    {
      addr: `5 ${streetName.value}`,
      meta: 'Smart meter · high-perf glazing · EPC C (72) · 142m²',
      cost: 1592,
      tone: 'mid' as const,
      you: false,
    },
    {
      addr: `9 ${streetName.value}`,
      meta: 'No insulation · no thermostat · EPC F (29) · 118m²',
      cost: 2467,
      tone: 'high' as const,
      you: false,
    },
  ]
  const youRow = {
    addr: youAddr,
    meta: 'Uninsulated cavity · 75mm loft · EPC E (52) · 116m²',
    cost: youCostVal,
    tone: youTone,
    you: true,
  }
  return [...base, youRow].sort((a, b) => a.cost - b.cost)
})
const youRank = computed<number>(() => ranked.value.findIndex((r) => r.you) + 1)
const searchesToday = computed<number>(
  () => 3 + ((propertyId.charCodeAt(0) || 1) % 7),
)

// Reflect the property's real Passport state in the stats line so we don't
// say "No verified Passport yet" for a property that already has one.
const passportStatusLine = computed<string>(() => {
  const p = property.value
  if (p?.hasPassport && p?.passportPublished) return '✓ Verified Passport live'
  if (p?.hasPassport) return 'Owner is building a Passport'
  return 'No verified Passport yet'
})

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

// ── DOM refs for animations ──
const addrLineEl = ref<HTMLElement | null>(null)
const heroTitleEl = ref<HTMLElement | null>(null)
const saveWrapEl = ref<HTMLElement | null>(null)
const saveNumEl = ref<HTMLElement | null>(null)
const youNumEl = ref<HTMLElement | null>(null)
const avgNumEl = ref<HTMLElement | null>(null)

// ── Typewriter animation (mirrors prototype's typeStr) ──
function typewriter(
  el: HTMLElement,
  text: string,
  speed = 38,
  done?: () => void,
): void {
  const cursor = el.querySelector('.cursor') as HTMLElement | null
  if (!cursor) return
  let i = 0
  const tick = (): void => {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i]!), cursor)
      i += 1
      setTimeout(tick, speed)
    } else if (done) {
      done()
    }
  }
  setTimeout(tick, 80)
}

// Typewriter that supports inline £number span mid-string (for hero title).
function typewriterWithNumberSpan(
  el: HTMLElement,
  prefix: string,
  numTarget: number,
  numClass: string,
  suffix: string,
  speed = 38,
  countUpDur = 900,
  doneFadeCursorMs = 1500,
): void {
  const cursor = el.querySelector('.cursor') as HTMLElement | null
  if (!cursor) return
  let i = 0
  const typePrefix = (): void => {
    if (i < prefix.length) {
      el.insertBefore(document.createTextNode(prefix[i]!), cursor)
      i += 1
      setTimeout(typePrefix, speed)
    } else {
      const numSpan = document.createElement('span')
      numSpan.className = numClass
      numSpan.textContent = '£0'
      el.insertBefore(numSpan, cursor)
      const t0 = performance.now()
      const step = (now: number): void => {
        const p = Math.min((now - t0) / countUpDur, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        numSpan.textContent =
          '£' + Math.round(ease * numTarget).toLocaleString('en-GB')
        if (p < 1) requestAnimationFrame(step)
        else {
          let j = 0
          const typeSuffix = (): void => {
            if (j < suffix.length) {
              el.insertBefore(document.createTextNode(suffix[j]!), cursor)
              j += 1
              setTimeout(typeSuffix, speed)
            } else {
              setTimeout(() => cursor?.remove(), doneFadeCursorMs)
            }
          }
          typeSuffix()
        }
      }
      requestAnimationFrame(step)
    }
  }
  typePrefix()
}

// ── Count-up animation ──
function countUp(
  el: HTMLElement,
  target: number,
  dur = 1000,
  delay = 0,
  onDone?: () => void,
): void {
  setTimeout(() => {
    const t0 = performance.now()
    const step = (now: number): void => {
      const p = Math.min((now - t0) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      el.textContent = '£' + Math.round(ease * target).toLocaleString('en-GB')
      if (p < 1) requestAnimationFrame(step)
      else if (onDone) onDone()
    }
    requestAnimationFrame(step)
  }, delay)
}

let animTimeout: ReturnType<typeof setTimeout> | null = null
function runAnimations(): void {
  if (!property.value) return
  const addr: string = property.value.addressLine1 || 'This property'

  if (addrLineEl.value) {
    const el = addrLineEl.value
    Array.from(el.childNodes).forEach((n) => {
      if (!(n instanceof HTMLElement) || !n.classList.contains('cursor'))
        el.removeChild(n)
    })
    if (!el.querySelector('.cursor')) {
      const c = document.createElement('span')
      c.className = 'cursor'
      el.appendChild(c)
    }
    typewriter(el, addr, 50, () => {
      setTimeout(() => el.querySelector('.cursor')?.remove(), 1500)
    })
  }

  if (heroTitleEl.value) {
    const el = heroTitleEl.value
    Array.from(el.childNodes).forEach((n) => {
      if (!(n instanceof HTMLElement) || !n.classList.contains('cursor'))
        el.removeChild(n)
    })
    if (!el.querySelector('.cursor')) {
      const c = document.createElement('span')
      c.className = 'cursor'
      el.appendChild(c)
    }
    const diff = Math.abs(youCost.value - avgCost)
    const dir = youCost.value >= avgCost ? 'more' : 'less'
    setTimeout(() => {
      typewriterWithNumberSpan(
        el,
        `This property could cost `,
        diff,
        'hs-hero-num-inline',
        ` ${dir} to run than the street average.`,
        38,
        900,
        1800,
      )
    }, 600)
  }

  if (youNumEl.value) countUp(youNumEl.value, youCost.value, 1000, 900)
  if (avgNumEl.value) countUp(avgNumEl.value, avgCost, 1000, 1100)
  if (saveNumEl.value && saveWrapEl.value) {
    countUp(saveNumEl.value, saving.value, 1000, 1300, () => {
      saveNumEl.value?.classList.add('save-pulse')
      saveWrapEl.value?.classList.add('save-glow')
    })
  }
}

onMounted(async () => {
  try {
    const res = await fetch(`${config.public.apiBase}/property/${propertyId}`)
    if (res.ok) property.value = await res.json()
  } catch {
    /* ignore */
  }
  animTimeout = setTimeout(runAnimations, 200)
})
onUnmounted(() => {
  if (animTimeout) clearTimeout(animTimeout)
})

// ── Guided tour ──
const tour = useHomescoreTour({
  storageKey: `umu-tour-street-${propertyId}`,
  autoStart: true,
  steps: [
    {
      sel: '[data-tour="addr"]',
      title: 'Your property',
      body: 'This shows the address, postcode and current Passport status. The live signal shows how many people have searched this property recently.',
    },
    {
      sel: '[data-tour="hero"]',
      title: 'Street comparison',
      body: 'We compare your estimated running costs against similar homes on your street, based on public EPC data.',
    },
    {
      sel: '[data-tour="street"]',
      title: 'Your street, ranked',
      body: 'Every neighbour ranked by their estimated energy cost. Tap any row for context.',
    },
    {
      sel: '[data-tour="cta"]',
      title: 'See your full HomeScore',
      body: 'Continue to the full score detail, including category breakdown and what could improve it.',
    },
  ],
})
</script>

<style scoped>
.hs-street-screen {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  padding-bottom: 24px;
}

/* Top nav */
.hs-topnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px 8px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.back-btn,
.tour-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
}
.back-btn:hover,
.tour-btn:hover {
  background: #f2faf8;
  border-color: #b2e4e1;
  color: #007e78;
}
.back-btn svg {
  width: 14px;
  height: 14px;
}
.eyebrow-pill {
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
.eyebrow-pill .dot {
  width: 6px;
  height: 6px;
  background: #00a19a;
  border-radius: 50%;
  box-shadow: 0 0 0 3px #e2f1ea;
}

/* Amber/orange address card — prototype-exact */
.hs-addr-card {
  margin: 16px 22px 0;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #f0a030 0%, #c67c18 50%, #8b4e0a 100%);
  border-radius: 22px;
  box-shadow:
    0 12px 32px -8px rgba(180, 100, 20, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  color: #fff;
  position: relative;
  overflow: hidden;
  animation: fadeSlideDown 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hs-addr-card::after {
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
.hs-addr-card > * {
  position: relative;
  z-index: 1;
}
.hs-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}
.hs-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  margin-top: 8px;
}
.hs-addr-block {
  flex: 1;
  min-width: 0;
}
.hs-addr-line {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: #fff;
  margin-bottom: 2px;
  min-height: 24px;
}
.hs-addr-line .cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: rgba(255, 255, 255, 0.85);
  margin-left: 2px;
  vertical-align: middle;
  border-radius: 1px;
  animation: cursorBlink 0.7s ease-in-out infinite;
}
.hs-addr-meta {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: -0.05px;
}
.hs-addr-stats {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.22);
}
.hs-addr-stat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.8);
}
.hs-addr-stat-count {
  color: #fff;
  font-weight: 800;
}
.hs-addr-stat-sep {
  color: rgba(255, 255, 255, 0.4);
}
.pulse-dot {
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}
.pulse-dot::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: #fff;
  opacity: 0.35;
  animation: pulse 1.8s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}
@keyframes cursorBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Saving hero — white card with mint border, gradient save section */
.hs-saving-wrap {
  margin: 12px 16px 0;
  background: #fff;
  border: 2px solid #e5f4f2;
  border-radius: 20px;
  overflow: hidden;
  animation: fadeSlideUp 0.45s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.hs-saving-head {
  padding: 16px 18px 12px;
  border-bottom: 1px solid #f5f5f7;
}
.hs-hero-title {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  line-height: 1.3;
  min-height: 26px;
}
.hs-hero-title .cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: rgba(35, 29, 69, 0.85);
  margin-left: 2px;
  vertical-align: middle;
  border-radius: 1px;
  animation: cursorBlink 0.7s ease-in-out infinite;
}
.hs-hero-title :deep(.hs-hero-num-inline) {
  color: #00a19a;
  font-weight: 800;
}
.hs-hero-sub {
  font-size: 11px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 5px;
}

.hs-save-wrap {
  background: linear-gradient(135deg, #f2faf8, #d4f0ed);
  padding: 18px 20px 14px;
  border-bottom: 1.5px solid #e5f4f2;
  text-align: center;
  transition: box-shadow 0.3s;
}
.hs-save-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.hs-save-num {
  font-size: 52px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: -2px;
  line-height: 1;
  display: inline-block;
}
.hs-save-foot {
  font-size: 12px;
  font-weight: 600;
  color: #6b6783;
  margin-top: 5px;
}

@keyframes savePulse {
  0% {
    transform: scale(1);
    text-shadow: 0 0 0 rgba(0, 161, 154, 0);
  }
  40% {
    transform: scale(1.06);
    text-shadow: 0 0 24px rgba(0, 161, 154, 0.55);
  }
  70% {
    transform: scale(0.98);
    text-shadow: 0 0 8px rgba(0, 161, 154, 0.25);
  }
  100% {
    transform: scale(1);
    text-shadow: 0 0 0 rgba(0, 161, 154, 0);
  }
}
@keyframes saveGlow {
  0%,
  100% {
    box-shadow: 0 0 0 rgba(0, 161, 154, 0);
  }
  50% {
    box-shadow: 0 0 32px rgba(0, 161, 154, 0.3);
  }
}
.save-pulse {
  animation: savePulse 1.6s ease-in-out infinite;
  display: inline-block;
}
.save-glow {
  animation: saveGlow 1.6s ease-in-out infinite;
}

.hs-save-split {
  display: flex;
}
.hs-save-cell {
  flex: 1;
  padding: 12px 16px;
}
.hs-save-cell + .hs-save-cell {
  border-left: 1px solid #f5f5f7;
}
.hs-save-cell-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.hs-save-cell-num {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.hs-save-cell--you .hs-save-cell-num {
  color: #c73e36;
}
.hs-save-cell--avg .hs-save-cell-num {
  color: #e6a23c;
}
.hs-save-cell-meta {
  font-size: 10px;
  color: #6b6783;
  margin-top: 1px;
}

/* Street card */
.street-card {
  margin: 14px 16px 0;
  background: #fff;
  border: 1.5px solid #ececef;
  border-radius: 18px;
  overflow: hidden;
  animation: fadeSlideUp 0.45s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.street-card-top {
  padding: 16px 18px 12px;
}
.street-card-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.street-card-sub {
  font-size: 12px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 6px;
  line-height: 1.45;
}
.street-rank-list {
  padding: 0 18px;
}
.street-rank-header {
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
.street-rank-badge {
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  color: #007e78;
  padding: 3px 8px;
  border-radius: 999px;
}
.street-rank-sub {
  font-size: 10.5px;
  font-weight: 600;
  color: #9c98ad;
  margin-bottom: 8px;
}
.street-rank-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 14px;
}
.street-rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid #f5f5f7;
}
.street-rank-row.you {
  background: linear-gradient(135deg, #fff8ec, #fff);
  border-color: #f5dba8;
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.12);
}
.street-rank-pos {
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
.street-rank-pos.you {
  background: #00a19a;
  color: #fff;
}
.street-rank-body {
  flex: 1;
  min-width: 0;
}
.street-rank-addr {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.street-rank-meta {
  font-size: 10.5px;
  font-weight: 600;
  color: #6b6783;
  margin-top: 1px;
}
.street-rank-cost {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  flex-shrink: 0;
}
.street-rank-cost.low {
  color: #00a19a;
}
.street-rank-cost.mid {
  color: #e6a23c;
}
.street-rank-cost.high {
  color: #c73e36;
}

.street-illust {
  border-top: 1px dashed #ececef;
}
.street-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 14px 14px;
}
.street-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  color: #6b6783;
}
.street-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* CTA */
.cta-wrap {
  margin: 14px 16px 0;
  animation: fadeSlideUp 0.45s 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.cta-stop {
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
.cta-stop:hover {
  transform: translateY(-1px);
  background: #00b6ae;
}
.cta-head {
  font-size: 16px;
  font-weight: 800;
}
.cta-sub {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.85;
}
.cta-foot {
  text-align: center;
  margin-top: 7px;
  font-size: 11px;
  font-weight: 600;
  color: #9c98ad;
}

/* Renters note */
.renters-note {
  margin: 14px 16px 0;
  padding: 12px 14px;
  background: #fef8ed;
  border: 1px solid #f5dba8;
  border-radius: 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  animation: fadeSlideUp 0.45s 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.renters-icon {
  font-size: 18px;
  line-height: 1;
}
.renters-text {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: #4a3a1a;
  line-height: 1.5;
}
.renters-text b {
  color: #231d45;
}

.back-link {
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
  width: calc(100% - 32px);
}
.back-link:hover {
  background: #fafafa;
}
</style>
