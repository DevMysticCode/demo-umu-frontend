<template>
  <div class="hs-page">

    <!-- ── Top nav: back · eyebrow pill · tour ──────────────────────── -->
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

    <!-- ── Hero ─────────────────────────────────────────────────────── -->
    <div class="hs-hero">
      <div class="hs-hero-title">How energy efficient is any UK property?</div>
      <div class="hs-hero-sub">
        Instantly scored from public EPC data — for any address, anyone. See how a property compares to its street in seconds.
      </div>
    </div>

    <!-- ── Search ───────────────────────────────────────────────────── -->
    <div class="hs-search-block">
      <div class="hs-search-wrap">
        <PropertySearchInput
          placeholder="Postcode or address"
          variant="light"
          :show-passport-status="true"
          @select="onResultSelect"
          @enter="onSearchEnter"
        />
        <button class="hs-search-go" type="button" @click="onCheckClick">
          Check
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 5 19 12 13 19" />
          </svg>
        </button>
      </div>

      <div class="hs-meta-row">
        <span class="hs-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Free
        </span>
        <span class="hs-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Instant
        </span>
        <span class="hs-meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          No account needed
        </span>
      </div>
    </div>

    <!-- ── Trust line ──────────────────────────────────────────────── -->
    <div class="hs-trust">
      <div class="hs-trust-eyebrow">Powered by</div>
      <div class="hs-trust-line">
        <span class="src">GOV.UK</span>
        <span class="sep">·</span>
        <span class="src">EPC Register</span>
        <span class="sep">·</span>
        <span class="src">HM Land Registry</span>
      </div>
    </div>

    <!-- ── Live activity ───────────────────────────────────────────── -->
    <div class="hs-live-row">
      <span class="hs-live-pulse" />
      <span><strong>147</strong> HomeScores run in the last hour</span>
    </div>

    <!-- ── How it works ───────────────────────────────────────────── -->
    <div class="hs-section-h-row">
      <div class="hs-section-h">How it works</div>
    </div>

    <div class="hs-how-tabs" role="tablist">
      <button
        v-for="t in howTabs"
        :key="t.id"
        class="hs-how-tab"
        :class="{ active: activeHow === t.id }"
        @click="activeHow = t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="hs-steps-list">
      <div
        v-for="(step, i) in currentHowSteps"
        :key="i"
        class="hs-step-row"
      >
        <div class="hs-step-num">{{ i + 1 }}</div>
        <div class="hs-step-body">
          <div class="hs-step-title">{{ step.title }}</div>
          <div class="hs-step-sub">{{ step.sub }}</div>
        </div>
      </div>
    </div>

    <div style="height: 24px;" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'

const router = useRouter()

function onResultSelect(property: any) {
  // After picking a property, go to the street comparison view first.
  // From there, the "Stop overpaying" CTA continues to the score detail page.
  router.push(`/homescore/${property.id}/street`)
}

function onSearchEnter(_q: string) {
  // PropertySearchInput already opens its dropdown on enter.
}

function onCheckClick() {
  const input = document.querySelector<HTMLInputElement>('.hs-search-wrap input')
  input?.focus()
}

// ── How it works tabs ────────────────────────────────────────────────
type HowId = 'buyers' | 'owners' | 'curious'
const activeHow = ref<HowId>('buyers')

const howTabs: { id: HowId; label: string }[] = [
  { id: 'buyers', label: 'Looking to buy' },
  { id: 'owners', label: "It's my property" },
  { id: 'curious', label: 'Just curious' },
]

const howCopy: Record<HowId, { title: string; sub: string }[]> = {
  buyers: [
    { title: 'Search any UK address', sub: 'Type a postcode or street and see how it scores against its neighbours.' },
    { title: 'See running costs & risks', sub: 'Energy costs, sold history, flood risk — everything public records can tell you before you make an offer.' },
    { title: 'Know what to ask before you view', sub: 'Get a list of questions based on what the EPC data flags — walk in already informed.' },
  ],
  owners: [
    { title: 'Search your address', sub: "See your property's estimated score from public EPC data — takes 5 seconds." },
    { title: 'See how you compare to your street', sub: 'Find out if this property is costing more to run than similar homes nearby — and why.' },
    { title: 'Upload bills to get your real number', sub: 'Public EPC data can be years out of date. Your actual bills tell the real story — and start building your Property Passport.' },
  ],
  curious: [
    { title: "Search any address — yours or anyone's", sub: 'No account, no commitment. Just type a postcode and see what the data says.' },
    { title: 'See what your street is paying', sub: 'Compare running costs across nearby homes — renting or owning, the data is the same for everyone.' },
    { title: 'Find out if you could be paying less', sub: 'If this property is costing more than its neighbours, the HomeScore shows you exactly why — and what could change it.' },
  ],
}
const currentHowSteps = computed(() => howCopy[activeHow.value])
</script>

<style scoped>
.hs-page {
  min-height: 100dvh;
  background: #fff;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Top nav ──────────────────────────────────────────────────────── */
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

/* ── Hero ─────────────────────────────────────────────────────────── */
.hs-hero {
  padding: 18px 24px 14px;
}
.hs-hero-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #231d45;
  margin-bottom: 12px;
}
.hs-hero-sub {
  font-size: 13.5px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.55;
  letter-spacing: -0.05px;
}

/* ── Search ───────────────────────────────────────────────────────── */
.hs-search-block { padding: 8px 24px 0; }

.hs-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1.5px solid #ececef;
  border-radius: 14px;
  padding: 4px 4px 4px 10px;
  transition: all 0.15s;
}
.hs-search-wrap:focus-within {
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.10);
}
/* Make the embedded PropertySearchInput visually flat — the outer wrap is the shell */
.hs-search-wrap :deep(> div),
.hs-search-wrap :deep(.property-search) {
  flex: 1;
  min-width: 0;
}
.hs-search-wrap :deep(input) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 11px 4px !important;
  font-size: 14px;
  font-weight: 600;
  color: #231d45;
  outline: none !important;
}
.hs-search-wrap :deep(input::placeholder) {
  color: #9c98ad;
  font-weight: 500;
}
.hs-search-go {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  padding: 9px 14px;
  border-radius: 10px;
  cursor: pointer;
  letter-spacing: -0.1px;
  flex-shrink: 0;
  transition: background 0.15s;
}
.hs-search-go:hover { background: #00b6ae; }

.hs-meta-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 600;
  margin: 12px 0 6px;
}
.hs-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.hs-meta-item svg {
  width: 10px;
  height: 10px;
  color: #00a19a;
}

/* ── Trust ────────────────────────────────────────────────────────── */
.hs-trust {
  padding: 16px 24px 0;
  text-align: center;
}
.hs-trust-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 6px;
}
.hs-trust-line {
  font-size: 12px;
  font-weight: 700;
  color: #4a4566;
  letter-spacing: -0.05px;
}
.hs-trust-line .sep { color: #c8c6d3; margin: 0 6px; }

/* ── Live row ─────────────────────────────────────────────────────── */
.hs-live-row {
  margin: 14px 24px 0;
  padding: 10px 14px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #007e78;
  letter-spacing: -0.05px;
}
.hs-live-row strong {
  color: #00a19a;
  font-weight: 800;
}
.hs-live-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00a19a;
  position: relative;
}
.hs-live-pulse::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 161, 154, 0.4);
  animation: hs-live-pulse 1.6s ease-out infinite;
}
@keyframes hs-live-pulse {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* ── How it works ─────────────────────────────────────────────────── */
.hs-section-h-row {
  padding: 26px 24px 8px;
}
.hs-section-h {
  font-size: 11px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hs-how-tabs {
  display: flex;
  gap: 6px;
  padding: 0 24px;
  margin-bottom: 14px;
  overflow-x: auto;
  scrollbar-width: none;
}
.hs-how-tabs::-webkit-scrollbar { display: none; }
.hs-how-tab {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  border: 1.5px solid #ececef;
  background: #fff;
  color: #6b6783;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  padding: 9px 10px;
  border-radius: 999px;
  cursor: pointer;
  letter-spacing: -0.05px;
  transition: all 0.15s;
}
.hs-how-tab.active {
  background: #231d45;
  color: #fff;
  border-color: #231d45;
}

.hs-steps-list {
  padding: 0 24px;
}
.hs-step-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 10px 0;
}
.hs-step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  font-size: 11.5px;
  font-weight: 800;
  flex-shrink: 0;
}
.hs-step-body { flex: 1; }
.hs-step-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
}
.hs-step-sub {
  font-size: 12px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 3px;
  line-height: 1.45;
  letter-spacing: -0.05px;
}
</style>
