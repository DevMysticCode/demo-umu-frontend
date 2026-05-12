<template>
  <div class="hs-page">
    <!-- ── Top nav: back · eyebrow pill · tour ──────────────────────── -->
    <div class="hs-topnav">
      <button class="hs-back" @click="router.back()" aria-label="Back">
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
      <div class="hs-eyebrow-pill"><span class="hs-pulse" />HomeScore</div>
      <div class="hs-topnav-spacer" />
    </div>

    <!-- ── Hero ─────────────────────────────────────────────────────── -->
    <div class="hs-hero">
      <div class="hs-hero-title">How energy efficient is any UK property?</div>
      <div class="hs-hero-sub">
        Instantly scored from public EPC data — for any address, anyone. See how
        a property compares to its street in seconds.
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
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 5 19 12 13 19" />
          </svg>
        </button>
      </div>

      <div class="hs-meta-row">
        <span class="hs-meta-item">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Free
        </span>
        <span class="hs-meta-item">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Instant
        </span>
        <span class="hs-meta-item">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          No account needed
        </span>
      </div>
    </div>

    <!-- ── Real story card ─────────────────────────────────────────── -->
    <div class="hs-real-story">
      <div class="hs-real-story-bar" />
      <div class="hs-real-story-body">
        <div class="hs-real-story-eyebrow">Real story</div>
        <div class="hs-real-story-quote">
          "My neighbour was being charged £150 a month extra — her supplier
          thought she had a swimming pool."
        </div>
        <div class="hs-real-story-text">
          Energy suppliers estimate usage based on assumptions. Those
          assumptions are sometimes very wrong. HomeScore shows you what your
          home should actually cost — and flags when something doesn't add up.
        </div>
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
      <div v-for="(step, i) in currentHowSteps" :key="i" class="hs-step-row">
        <div class="hs-step-num">{{ i + 1 }}</div>
        <div class="hs-step-body">
          <div class="hs-step-title">{{ step.title }}</div>
          <div class="hs-step-sub">{{ step.sub }}</div>
        </div>
      </div>
    </div>

    <!-- ── Powered by OpenProperty ─────────────────────────────────── -->
    <div class="hs-powered-by">
      <div class="hs-powered-eyebrow">Powered by</div>
      <img
        src="/op-icons/opLogo.png"
        alt="OpenProperty"
        class="hs-powered-logo"
      />
      <div class="hs-powered-name">OpenProperty</div>
      <div class="hs-powered-tag">Property data infrastructure</div>
    </div>

    <div style="height: 24px" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'

const router = useRouter()

function onResultSelect(property: any) {
  // After picking a property, go to the street comparison view first.
  // From there, the "Stop overpaying" CTA continues to the score detail page.
  router.push(`/homescore/street/${property.id}`)
}

function onSearchEnter(_q: string) {
  // PropertySearchInput already opens its dropdown on enter.
}

function onCheckClick() {
  const input = document.querySelector<HTMLInputElement>(
    '.hs-search-wrap input',
  )
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
    {
      title: 'Search any UK address',
      sub: 'Type a postcode or street and see how it scores against its neighbours.',
    },
    {
      title: 'See running costs & risks',
      sub: 'Energy costs, sold history, flood risk — everything public records can tell you before you make an offer.',
    },
    {
      title: 'Know what to ask before you view',
      sub: 'Get a list of questions based on what the EPC data flags — walk in already informed.',
    },
  ],
  owners: [
    {
      title: 'Search your address',
      sub: "See your property's estimated score from public EPC data — takes 5 seconds.",
    },
    {
      title: 'See how you compare to your street',
      sub: 'Find out if this property is costing more to run than similar homes nearby — and why.',
    },
    {
      title: 'Upload bills to get your real number',
      sub: 'Public EPC data can be years out of date. Your actual bills tell the real story — and start building your Property Passport.',
    },
  ],
  curious: [
    {
      title: "Search any address — yours or anyone's",
      sub: 'No account, no commitment. Just type a postcode and see what the data says.',
    },
    {
      title: 'See what your street is paying',
      sub: 'Compare running costs across nearby homes — renting or owning, the data is the same for everyone.',
    },
    {
      title: 'Find out if you could be paying less',
      sub: 'If this property is costing more than its neighbours, the HomeScore shows you exactly why — and what could change it.',
    },
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
.hs-back svg {
  width: 14px;
  height: 14px;
}
.hs-topnav-spacer {
  width: 32px;
}

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
.hs-search-block {
  padding: 8px 24px 0;
}

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
/* Make the dropdown span the full width of the outer search shell, not just
   the inner input's narrower column. We do this by making .psi-wrap
   non-positioned so the dropdown's `position: absolute` resolves against
   .hs-search-wrap instead. */
.hs-search-wrap :deep(.psi-wrap) {
  position: static !important;
}
.hs-search-wrap :deep(.psi-drop) {
  left: 0;
  right: 0;
  width: auto;
  top: calc(100% + 8px);
}
.hs-search-wrap:focus-within {
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.1);
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
  /* Keep ~38px left padding so the absolutely-positioned .psi-icon at left:14px
     doesn't overlap the typed text. */
  padding: 11px 4px 11px 38px !important;
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
.hs-search-go:hover {
  background: #00b6ae;
}

.hs-meta-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: #9c98ad;
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

/* ── Real story card ──────────────────────────────────────────── */
.hs-real-story {
  margin: 16px 22px 0;
  background: #fff;
  border: 1.5px solid #f5f5f7;
  border-radius: 16px;
  padding: 16px 18px;
  position: relative;
  overflow: hidden;
  display: flex;
  gap: 10px;
}
.hs-real-story-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: #00a19a;
  border-radius: 4px 0 0 4px;
}
.hs-real-story-body {
  padding-left: 10px;
  flex: 1;
}
.hs-real-story-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.hs-real-story-quote {
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  line-height: 1.4;
  margin-bottom: 6px;
  letter-spacing: -0.1px;
}
.hs-real-story-text {
  font-size: 11px;
  color: #6b6783;
  line-height: 1.5;
  font-weight: 500;
}

/* ── Powered by OpenProperty (footer) ─────────────────────────── */
.hs-powered-by {
  text-align: center;
  padding: 36px 22px 20px;
}
.hs-powered-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.hs-powered-logo {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: block;
  margin: 0 auto 8px;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.2);
  object-fit: cover;
}
.hs-powered-name {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.hs-powered-tag {
  font-size: 11px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 2px;
}

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
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
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

/* Tabs: inline-flex segmented pill (prototype-exact) */
.hs-how-tabs {
  display: inline-flex;
  background: #fafafa;
  border: 1px solid #ececef;
  border-radius: 100px;
  padding: 4px;
  gap: 2px;
  margin: 0 22px 14px;
  width: calc(100% - 28px);
  justify-content: space-evenly;
}
.hs-how-tab {
  white-space: nowrap;
  border: none;
  background: transparent;
  color: #6b6783;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  padding: 8px 16px;
  border-radius: 100px;
  cursor: pointer;
  letter-spacing: -0.05px;
  transition: all 0.15s;
}
.hs-how-tab:hover {
  color: #231d45;
}
.hs-how-tab.active {
  background: #fff;
  color: #231d45;
  box-shadow: 0 2px 6px rgba(35, 29, 69, 0.08);
}

/* Steps — generous spacing + connecting vertical line between numbers */
.hs-steps-list {
  padding: 0 22px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.hs-step-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}
.hs-step-row:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 13px;
  top: 28px;
  width: 1.5px;
  height: calc(100% + 22px - 6px);
  background: #e5f4f2;
  z-index: 0;
}
.hs-step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #e5f4f2;
  color: #007e78;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.hs-step-body {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}
.hs-step-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
  margin-bottom: 4px;
  line-height: 1.2;
}
.hs-step-sub {
  font-size: 13px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.5;
  letter-spacing: -0.05px;
}
</style>
