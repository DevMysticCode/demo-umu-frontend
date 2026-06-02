<template>
  <div class="pcb">
    <!-- ── State box (replaces the old "Is this your property?" CTA) ── -->
    <!-- Tapping anywhere on the box now opens the explainer drawer first;
         the in-drawer "Claim it free" button is where the actual auth
         gate fires. Matches the in-progress / published boxes below.
         In `headless` mode the visible box is suppressed and the drawer
         is controlled entirely from the outside via `v-model:open-sheet`
         — used by callers (e.g. the property detail page) that already
         have their own "Claim this property" trigger button. -->
    <button
      v-if="state === 'unclaimed' && !headless"
      class="pcb-box"
      type="button"
      style="background: linear-gradient(135deg, #2d2456, #231d45)"
      @click="openSheet = 'unclaimed'"
    >
      <div class="pcb-left">
        <div class="pcb-main">This property is unclaimed</div>
        <div class="pcb-sub">
          Is it yours? Build your verified Passport in minutes.
        </div>
        <span class="pcb-explain" @click.stop="openSheet = 'unclaimed'">
          What does it mean to claim? <span class="pcb-q">?</span>
        </span>
      </div>
      <div class="pcb-arrow">→</div>
    </button>

    <button
      v-else-if="state === 'inProgress' && !headless"
      class="pcb-box"
      type="button"
      style="
        background: linear-gradient(
          135deg,
          #4dd4ce 0%,
          #00a19a 45%,
          #006e68 100%
        );
      "
      @click="openSheet = 'progress'"
    >
      <div class="pcb-left">
        <div class="pcb-main">A Passport is being built for this home</div>
        <div class="pcb-sub">
          The owner is preparing a verified record — be ready before it goes
          live.
        </div>
        <span class="pcb-explain" @click.stop="openSheet = 'progress'">
          What is a Passport in progress? <span class="pcb-q">?</span>
        </span>
      </div>
      <div class="pcb-ring">
        <svg viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="rgba(255,255,255,0.30)"
            stroke-width="4.5"
            fill="none"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="#fff"
            stroke-width="4.5"
            fill="none"
            stroke-dasharray="125.66"
            :stroke-dashoffset="125.66 - (pct / 100) * 125.66"
            stroke-linecap="round"
            transform="rotate(-90 25 25)"
          />
        </svg>
        <span>{{ pct }}<small>%</small></span>
      </div>
    </button>

    <button
      v-else-if="!headless"
      class="pcb-box"
      type="button"
      style="
        background: linear-gradient(
          135deg,
          #8b6fe0 0%,
          #5b3795 45%,
          #3a1f66 100%
        );
      "
      @click="openSheet = 'published'"
    >
      <div class="pcb-left">
        <div class="pcb-main">This property has a published Passport</div>
        <div class="pcb-sub">
          Gain access to the full verified record — certificates, history &amp;
          more.
        </div>
        <span class="pcb-explain" @click.stop="openSheet = 'published'">
          What's inside the Passport? <span class="pcb-q">?</span>
        </span>
      </div>
      <div class="pcb-right">£99 →</div>
    </button>

    <!-- ── Explainer drawers ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="cxd">
        <div
          v-if="openSheet"
          class="cxd-overlay"
          @click.self="openSheet = null"
        >
          <div class="cxd-sheet" @click.stop>
            <div class="cxd-grip" />

            <!-- UNCLAIMED -->
            <template v-if="openSheet === 'unclaimed'">
              <div class="cx-hero navy">
                <div class="cx-hero-eyebrow">Property Passport™</div>
                <div class="cx-hero-title">
                  Your home's permanent record — not just for selling, for
                  owning.
                </div>
                <div class="cx-hero-sub">
                  A Passport stays with this property for life. Build it now,
                  keep it updated, and when you do decide to sell — the hard
                  work is already done.
                </div>
              </div>
              <div class="cx-callout navy">
                <div class="cx-callout-h">The car you'd never buy blind</div>
                <div class="cx-callout-v">
                  You wouldn't buy a £15,000 car without an HPI check and
                  service history. Yet people spend £300k+ on a home with almost
                  no verified information. A Property Passport changes that —
                  <b>permanently</b>.
                </div>
              </div>
              <div class="cx-stats">
                <div class="cx-stat">
                  <div class="cx-stat-num">Free</div>
                  <div class="cx-stat-label">To claim &amp; build forever</div>
                </div>
                <div class="cx-stat">
                  <div class="cx-stat-num">2 min</div>
                  <div class="cx-stat-label">To claim ownership today</div>
                </div>
                <div class="cx-stat">
                  <div class="cx-stat-num cx-stat-anim">{{ animDaysAvg }}</div>
                  <div class="cx-stat-label">Days avg. conveyancing</div>
                </div>
                <div class="cx-stat">
                  <div class="cx-stat-num cx-stat-anim cx-stat-live">
                    {{ animSearches }}
                    <span class="cx-stat-pulse" />
                  </div>
                  <div class="cx-stat-label">Searches on this address / mo</div>
                </div>
              </div>
              <div class="cx-section-h">
                Your four steps · tap to learn more
              </div>
              <div class="cx-steps">
                <template v-for="(s, i) in unclaimedSteps" :key="s.n">
                  <div
                    class="cx-step cx-step-tap"
                    :class="{ active: activeStep === s.n }"
                    @click="activeStep = s.n"
                  >
                    <div class="cx-step-num" :class="s.n === 1 ? 'on' : 'off'">
                      {{ s.n }}
                    </div>
                    <div class="cx-step-name" :class="{ off: s.n !== 1 }">
                      {{ s.name }}
                    </div>
                  </div>
                  <div
                    v-if="i < unclaimedSteps.length - 1"
                    class="cx-step-line"
                  />
                </template>
              </div>
              <div class="cx-step-detail">
                <div class="cx-step-detail-h">{{ activeStepData.h }}</div>
                <div class="cx-step-detail-v">{{ activeStepData.v }}</div>
              </div>
              <div class="cxd-cta-row">
                <button
                  class="cxd-btn secondary"
                  type="button"
                  @click="openSheet = null"
                >
                  Got it
                </button>
                <button
                  class="cxd-btn primary"
                  type="button"
                  @click="onPrimary('claim-passport')"
                >
                  Claim it →
                </button>
              </div>
              <div class="cx-foot">
                The way people buy homes is changing — we're building that
                future with government.
              </div>
            </template>

            <!-- IN PROGRESS -->
            <template v-else-if="openSheet === 'progress'">
              <div class="cx-hero teal">
                <div class="cx-hero-eyebrow">
                  Property Passport™ · In Progress
                </div>
                <div class="cx-hero-title">
                  This owner is building something that removes 150 days of
                  uncertainty.
                </div>
                <div class="cx-hero-sub">
                  A permanent verified record for this property. When it
                  publishes, you get instant access to everything — before you
                  even make an offer.
                </div>
              </div>
              <div class="cx-callout">
                <div class="cx-callout-h">Why this matters</div>
                <div class="cx-callout-v">
                  People fall for a house in 20 minutes, then spend ~150 days
                  chasing solicitors and documents that already exist somewhere.
                  This Passport collects it all upfront.
                  <b
                    >👁 Watch this property to be first in the door the moment
                    it publishes.</b
                  >
                </div>
              </div>
              <div class="cx-section-h">Build progress</div>
              <div class="cx-progress-row">
                <span>{{ pct }}% complete</span
                ><span>{{ sectionsDone }} of {{ sectionsTotal }} verified</span>
              </div>
              <div class="cx-progress-track">
                <div class="cx-progress-fill" :style="{ width: pct + '%' }" />
              </div>
              <div class="cx-section-h">Already verified</div>
              <div class="cx-item">
                <div class="cx-item-ico">⚡</div>
                <div class="cx-item-body">
                  <div class="cx-item-title">EPC Certificate</div>
                  <div class="cx-item-sub">
                    Energy rating · lodged on the public register
                  </div>
                </div>
                <div class="cx-item-tick">✓</div>
              </div>
              <div class="cx-item">
                <div class="cx-item-ico">🏛️</div>
                <div class="cx-item-body">
                  <div class="cx-item-title">
                    Land Registry Title &amp; Plan
                  </div>
                  <div class="cx-item-sub">Ownership confirmed</div>
                </div>
                <div class="cx-item-tick">✓</div>
              </div>
              <div class="cx-item">
                <div class="cx-item-ico">📋</div>
                <div class="cx-item-body">
                  <div class="cx-item-title">TA6 — Property Information</div>
                  <div class="cx-item-sub">Boundaries, disputes, utilities</div>
                </div>
                <div class="cx-item-tick">✓</div>
              </div>
              <div class="cxd-cta-row">
                <button
                  class="cxd-btn secondary"
                  type="button"
                  @click="openSheet = null"
                >
                  Close
                </button>
                <button
                  class="cxd-btn primary"
                  type="button"
                  @click="onPrimary('watch')"
                >
                  👁 Watch this property
                </button>
              </div>
              <div class="cx-foot">
                The way people buy homes is changing — we're building that
                future with government.
              </div>
            </template>

            <!-- PUBLISHED -->
            <template v-else>
              <div class="cx-hero purple">
                <div class="cx-hero-eyebrow">Property Passport™</div>
                <div class="cx-hero-title">
                  The biggest purchase of your life — and you're doing it blind.
                </div>
                <div class="cx-hero-sub">
                  You wouldn't buy a £15,000 car without its service history.
                  This is the verified record that should always have existed
                  for every home.
                </div>
              </div>
              <div class="cx-callout">
                <div class="cx-callout-h">Why this exists</div>
                <div class="cx-callout-v">
                  Conveyancing takes 150 days on average — nearly half spent
                  chasing documents that already exist. The Passport ends that.
                  Everything verified by the owner, ready before solicitors are
                  even instructed. <b>⏱ Average sale cut by 6–8 weeks.</b>
                </div>
              </div>
              <div class="cx-callout purple">
                <div class="cx-callout-h">Not just for buying this home</div>
                <div class="cx-callout-v">
                  The environmental, flood and planning data applies to the
                  whole street. Solicitors charge £300–500 for searches thrown
                  away after every transaction. This data stays.
                </div>
              </div>
              <div class="cx-stats">
                <div class="cx-stat">
                  <div class="cx-stat-num">150</div>
                  <div class="cx-stat-label">Avg. days in conveyancing</div>
                </div>
                <div class="cx-stat">
                  <div class="cx-stat-num">£99</div>
                  <div class="cx-stat-label">One-off · no subscription</div>
                </div>
                <div class="cx-stat">
                  <div class="cx-stat-num">23×</div>
                  <div class="cx-stat-label">Same search bought / street</div>
                </div>
                <div class="cx-stat">
                  <div class="cx-stat-num">100%</div>
                  <div class="cx-stat-label">Owner-verified · HMLR backed</div>
                </div>
              </div>
              <div class="cx-section-h">What's inside</div>
              <div class="cx-item">
                <div class="cx-item-ico">📋</div>
                <div class="cx-item-body">
                  <div class="cx-item-title">TA6, TA7 &amp; TA10 forms</div>
                  <div class="cx-item-sub">
                    All conveyancing questions answered upfront
                  </div>
                </div>
                <div class="cx-item-tick">✓</div>
              </div>
              <div class="cx-item">
                <div class="cx-item-ico">🏛️</div>
                <div class="cx-item-body">
                  <div class="cx-item-title">
                    Land Registry Title &amp; Plan
                  </div>
                  <div class="cx-item-sub">
                    Verified ownership · boundary map
                  </div>
                </div>
                <div class="cx-item-tick">✓</div>
              </div>
              <div class="cx-item">
                <div class="cx-item-ico">🔧</div>
                <div class="cx-item-body">
                  <div class="cx-item-title">Gas, Electrical &amp; EPC</div>
                  <div class="cx-item-sub">All certificates verified</div>
                </div>
                <div class="cx-item-tick">✓</div>
              </div>
              <div class="cx-item">
                <div class="cx-item-ico">📅</div>
                <div class="cx-item-body">
                  <div class="cx-item-title">Planning History</div>
                  <div class="cx-item-sub">Extensions, permissions, works</div>
                </div>
                <div class="cx-item-tick">✓</div>
              </div>
              <div class="cxd-cta-row">
                <button
                  class="cxd-btn secondary"
                  type="button"
                  @click="openSheet = null"
                >
                  Not now
                </button>
                <button
                  class="cxd-btn primary"
                  type="button"
                  @click="onPrimary('buy')"
                >
                  Get the Passport · £99
                </button>
              </div>
              <div class="cx-foot">
                The way people buy homes is changing — we're building that
                future with government.
              </div>
            </template>
          </div>
        </div>
      </Transition>

      <!-- ── Auth-required popup ─────────────────────────────────────
           Shown when a guest taps a primary CTA inside the drawer. Sits
           above the drawer (z-index 1200) so the user can dismiss back to
           the explainer if they're not ready to sign in. -->
      <Transition name="authd">
        <div
          v-if="authPrompt"
          class="authd-overlay"
          @click.self="authPrompt = null"
        >
          <div class="authd-card" @click.stop>
            <div class="authd-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div class="authd-title">{{ authPromptCopy.title }}</div>
            <div class="authd-body">{{ authPromptCopy.body }}</div>
            <div class="authd-actions">
              <button
                class="authd-btn primary"
                type="button"
                @click="goAuth('signup')"
              >
                Create free account
              </button>
              <button
                class="authd-btn secondary"
                type="button"
                @click="goAuth('signin')"
              >
                I already have an account
              </button>
              <button
                class="authd-btn ghost"
                type="button"
                @click="authPrompt = null"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    state: 'unclaimed' | 'inProgress' | 'published'
    progressPct?: number
    sectionsDone?: number
    sectionsTotal?: number
    /** Property id used to build the post-login redirect target so the
     *  user returns to the property page with the right drawer auto-opened
     *  after they sign in. Falls back to silent emit if not provided. */
    propertyId?: string | null
    /** When true, suppress the visible state box and only render the
     *  explainer drawer. Used by callers that already have their own
     *  "Claim this property" trigger button. Pair with `v-model:open-sheet`
     *  to control the drawer programmatically. */
    headless?: boolean
    /** External control of which sheet is open. Used in headless mode so
     *  the parent can open `'unclaimed'` / `'progress'` / `'published'`
     *  from its own button. Two-way bound via `update:openSheet`. */
    openSheet?: 'unclaimed' | 'progress' | 'published' | null
  }>(),
  {
    progressPct: 60,
    sectionsDone: 4,
    sectionsTotal: 8,
    propertyId: null,
    headless: false,
    openSheet: null,
  },
)

const emit = defineEmits<{
  // Fired from the "This property is unclaimed" box and the cxUnclaimed
  // drawer's "Claim it free →" button — the new login → property-page flow.
  (e: 'claim-passport'): void
  (e: 'watch'): void
  (e: 'buy'): void
  (e: 'update:openSheet', v: 'unclaimed' | 'progress' | 'published' | null): void
}>()

const pct = computed(() =>
  Math.max(0, Math.min(100, Math.round(props.progressPct ?? 0))),
)

// In standard (non-headless) mode the component owns `openSheet` locally —
// tapping the colored box flips it. In headless mode the parent drives it
// via v-model so the colored box can be replaced by the parent's own CTA.
const localOpenSheet = ref<'unclaimed' | 'progress' | 'published' | null>(null)
const openSheet = computed<'unclaimed' | 'progress' | 'published' | null>({
  get: () => (props.headless ? props.openSheet : localOpenSheet.value),
  set: (v) => {
    if (props.headless) emit('update:openSheet', v)
    else localOpenSheet.value = v
  },
})

// Auth gate state — which primary action the guest tried to take from
// inside the drawer. Null = no prompt visible.
type PrimaryAction = 'claim-passport' | 'watch' | 'buy'
const authPrompt = ref<PrimaryAction | null>(null)

const authPromptCopy = computed(() => {
  if (authPrompt.value === 'claim-passport') {
    return {
      title: 'Sign in to claim this property',
      body: "You'll need a free account to verify ownership and build your Passport. Takes about a minute.",
    }
  }
  if (authPrompt.value === 'watch') {
    return {
      title: 'Sign in to watch this property',
      body: 'Create a free account or sign in so we can notify you the moment this Passport publishes.',
    }
  }
  return {
    title: 'Sign in to unlock this Passport',
    body: 'Create a free account or sign in to access the full verified record for this property.',
  }
})

function hasAuth(): boolean {
  if (typeof localStorage === 'undefined') return false
  return Boolean(localStorage.getItem('token'))
}

// Build the post-login redirect target. Claim → ?claim=1, watch/buy →
// ?unlock=1 (mirrors the parent's existing goToClaimPassport /
// goToBuyPassport routing).
function redirectTargetFor(action: PrimaryAction): string | null {
  if (!props.propertyId) return null
  const flag = action === 'claim-passport' ? 'claim=1' : 'unlock=1'
  return `/property/${props.propertyId}?${flag}`
}

// ── Animated stats in the unclaimed drawer ─────────────────────────
// Per-property "searches this month" — deterministic so the same
// property always shows the same number on repeat visits, but varies
// across properties so the stat feels live rather than canned.
function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}
const searchesTarget = computed(() => {
  const seed = props.propertyId ?? 'fallback'
  // 8–37 range — high enough to feel meaningful, varied enough to feel
  // alive across the property catalogue.
  return 8 + (hashStr(seed) % 30)
})
const daysAvgTarget = 150

const animSearches = ref(0)
const animDaysAvg = ref(0)

// Count-up animation. Eases out so the final value lingers.
function countUp(
  setter: (v: number) => void,
  target: number,
  durationMs = 900,
) {
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs)
    const eased = 1 - Math.pow(1 - t, 3)
    setter(Math.round(target * eased))
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// Re-run the count-up every time the unclaimed drawer opens.
watch(openSheet, (val) => {
  if (val !== 'unclaimed') return
  animSearches.value = 0
  animDaysAvg.value = 0
  countUp((v) => (animSearches.value = v), searchesTarget.value, 950)
  countUp((v) => (animDaysAvg.value = v), daysAvgTarget, 1200)
})

function goAuth(mode: 'signin' | 'signup') {
  const action = authPrompt.value
  if (!action) return
  const target = redirectTargetFor(action)
  if (target && typeof localStorage !== 'undefined') {
    localStorage.setItem('redirectAfterLogin', target)
  }
  // Close drawer + prompt before navigating so back-nav lands cleanly.
  authPrompt.value = null
  openSheet.value = null
  const path = mode === 'signup' ? '/onboarding/signup' : '/onboarding/signin'
  navigateTo(path)
}

const unclaimedSteps = [
  { n: 1, name: 'Claim' },
  { n: 2, name: 'Verify' },
  { n: 3, name: 'Score' },
  { n: 4, name: 'Publish' },
]
const stepDetails: Record<number, { h: string; v: string }> = {
  1: {
    h: '1 · Claim',
    v: "Confirm you own this property — takes about 2 minutes. We check it against HM Land Registry, so you don't need to upload anything to get started.",
  },
  2: {
    h: '2 · Verify',
    v: 'Upload your certificates (gas, electrical, EPC) and answer the standard conveyancing questions. We verify each against official sources and mark them ✓ on your Passport.',
  },
  3: {
    h: '3 · Score',
    v: 'As documents are verified, your HomeScore climbs from the public-records baseline to a fully verified score that buyers and lenders trust.',
  },
  4: {
    h: '4 · Publish',
    v: "When you're ready to sell, publish your Passport. Buyers get instant access to everything upfront — cutting weeks off conveyancing.",
  },
}
const activeStep = ref(1)
const activeStepData = computed(
  () => stepDetails[activeStep.value] ?? stepDetails[1],
)

function onPrimary(action: PrimaryAction) {
  // Authed users → straight through to the parent's existing routing.
  // Guests → show the in-drawer auth prompt (Sign in / Create account).
  if (hasAuth()) {
    openSheet.value = null
    emit(action)
    return
  }
  authPrompt.value = action
}
</script>

<style scoped>
.pcb {
  --primary: #231d45;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  margin: 14px 20px 0;
}

/* ── State box ── */
.pcb-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  width: 100%;
  text-align: left;
  padding: 18px;
  border: none;
  border-radius: 16px;
  min-height: 96px;
  color: white;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 6px 22px rgba(35, 29, 69, 0.2);
  transition: filter 0.15s;
}
.pcb-box:hover {
  filter: brightness(1.05);
}
.pcb-left {
  min-width: 0;
  flex: 1;
}
.pcb-main {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.3px;
}
.pcb-sub {
  font-size: 11.5px;
  font-weight: 600;
  opacity: 0.78;
  margin-top: 4px;
  line-height: 1.4;
}
.pcb-explain {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 9px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
  cursor: pointer;
}
.pcb-explain:hover {
  color: #fff;
}
.pcb-q {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  flex-shrink: 0;
}
.pcb-arrow {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 19px;
  font-weight: 800;
  flex-shrink: 0;
}
.pcb-right {
  font-size: 22px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: -0.5px;
}
.pcb-ring {
  position: relative;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
}
.pcb-ring svg {
  width: 46px;
  height: 46px;
  display: block;
}
.pcb-ring svg circle:last-of-type {
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
  transition: stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1);
}
.pcb-ring span {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}
.pcb-ring span small {
  font-size: 8px;
  font-weight: 700;
  opacity: 0.85;
  margin-left: 1px;
}

/* ── Drawer overlay + sheet ── */
.cxd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  --primary: #231d45;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  color: var(--text);
}
.cxd-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 92dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.cxd-grip {
  width: 42px;
  height: 4px;
  background: var(--border);
  border-radius: 100px;
  margin: 10px auto 0;
}

/* ── cx-* drawer content (ported from prototype) ── */
.cx-hero {
  border-radius: 16px;
  padding: 20px;
  margin: 14px 22px 0;
  position: relative;
  overflow: hidden;
  color: white;
}
.cx-hero::after {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.cx-hero.navy {
  background: var(--primary);
}
.cx-hero.teal {
  background: linear-gradient(135deg, #4dd4ce 0%, #00a19a 45%, #006e68 100%);
}
.cx-hero.amber {
  background: linear-gradient(135deg, #f0b460 0%, #d4822a 45%, #7a3a05 100%);
}
/* Matches the published state-box gradient (#8b6fe0 → #5b3795 → #3a1f66)
   so the drawer feels like a continuation of the card you tapped. */
.cx-hero.purple {
  background: linear-gradient(135deg, #8b6fe0 0%, #5b3795 45%, #3a1f66 100%);
}
.cx-hero-eyebrow {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}
.cx-hero-title {
  font-size: 18px;
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}
.cx-hero-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.55;
  position: relative;
  z-index: 1;
}
.cx-callout {
  background: var(--bg);
  border-radius: 14px;
  padding: 14px;
  margin: 14px 22px 0;
  border-left: 3px solid var(--accent);
}
.cx-callout.navy {
  border-left-color: var(--primary);
}
.cx-callout.purple {
  border-left-color: #5b3795;
  background: #f5f1fc;
}
.cx-callout.purple .cx-callout-h {
  color: #5b3795;
}
.cx-callout.amber {
  border-left-color: #d4822a;
  background: #fef9f0;
}
.cx-callout-h {
  font-size: 9px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.cx-callout.navy .cx-callout-h {
  color: var(--primary);
}
.cx-callout.amber .cx-callout-h {
  color: #b07a1c;
}
.cx-callout-v {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}
.cx-callout-v b {
  color: var(--text);
  font-weight: 800;
}
.cx-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 14px 22px 0;
}
.cx-stat {
  background: var(--bg);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}
.cx-stat-num {
  font-size: 20px;
  font-weight: 900;
  color: var(--text);
  letter-spacing: -0.5px;
}
.cx-stat-anim {
  font-variant-numeric: tabular-nums;
}
.cx-stat-live {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.cx-stat-pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00c4bc;
  box-shadow: 0 0 0 0 rgba(0, 196, 188, 0.7);
  animation: cxStatPulse 1.6s ease-out infinite;
}
@keyframes cxStatPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 196, 188, 0.65);
  }
  70% {
    box-shadow: 0 0 0 9px rgba(0, 196, 188, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 196, 188, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .cx-stat-pulse {
    animation: none;
  }
}
.cx-stat-label {
  font-size: 10px;
  color: var(--text-faint);
  margin-top: 2px;
  font-weight: 600;
  line-height: 1.3;
}
.cx-section-h {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 16px 22px 10px;
}
.cx-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg);
  border-radius: 11px;
  padding: 10px 12px;
  margin: 0 22px 7px;
}
.cx-item-ico {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--accent-paler);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.cx-item-body {
  flex: 1;
  min-width: 0;
}
.cx-item-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--text);
}
.cx-item-sub {
  font-size: 10px;
  color: var(--text-faint);
  margin-top: 1px;
}
.cx-item-tick {
  color: var(--accent-dark);
  font-weight: 800;
  font-size: 13px;
}
.cx-steps {
  display: flex;
  align-items: flex-start;
  margin: 0 22px 18px;
}
.cx-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex: 1;
}
.cx-step-num {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cx-step-num.on {
  background: var(--primary);
  color: white;
}
.cx-step-num.off {
  background: var(--border);
  color: var(--text-faint);
}
.cx-step-name {
  font-size: 10px;
  font-weight: 700;
  color: var(--text);
}
.cx-step-name.off {
  color: var(--text-faint);
}
.cx-step-line {
  flex: 0 0 auto;
  width: 14px;
  height: 2px;
  background: var(--border);
  margin-top: 17px;
}
.cx-step-tap {
  cursor: pointer;
  padding: 6px 2px 4px;
  border-radius: 10px;
  transition: background 0.15s;
}
.cx-step-tap:hover {
  background: var(--bg);
}
.cx-step-tap .cx-step-num {
  transition: transform 0.15s;
}
.cx-step-tap.active .cx-step-num {
  transform: scale(1.12);
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.15);
}
.cx-step-tap.active .cx-step-num.off {
  background: var(--accent);
  color: white;
}
.cx-step-tap.active .cx-step-num.on {
  background: var(--accent);
}
.cx-step-tap.active .cx-step-name {
  color: var(--accent-dark) !important;
  font-weight: 800;
}
.cx-step-detail {
  margin: 0 22px 4px;
  padding: 13px 15px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 12px;
}
.cx-step-detail-h {
  font-size: 12px;
  font-weight: 800;
  color: var(--accent-dark);
  margin-bottom: 4px;
  letter-spacing: -0.1px;
}
.cx-step-detail-v {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.55;
}
.cx-progress-track {
  height: 8px;
  background: var(--border-soft);
  border-radius: 4px;
  overflow: hidden;
  margin: 0 22px 16px;
}
.cx-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #4dd4ce);
  border-radius: 4px;
  transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.cx-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 0 22px 6px;
}
.cx-progress-row span:first-child {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
}
.cx-progress-row span:last-child {
  font-size: 11px;
  color: var(--text-faint);
}
.cx-foot {
  text-align: center;
  font-size: 11px;
  color: var(--text-faint);
  line-height: 1.6;
  padding: 4px 30px 16px;
}

/* CTA row */
.cxd-cta-row {
  padding: 18px 22px 8px;
  display: flex;
  gap: 8px;
}
.cxd-btn {
  flex: 1;
  padding: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.cxd-btn.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.cxd-btn.primary:hover {
  filter: brightness(1.06);
}
.cxd-btn.secondary {
  background: var(--card);
  border: 1.5px solid var(--border);
  color: var(--text-secondary);
}

.cxd-enter-active,
.cxd-leave-active {
  transition: opacity 0.25s ease;
}
.cxd-enter-active .cxd-sheet,
.cxd-leave-active .cxd-sheet {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.cxd-enter-from,
.cxd-leave-to {
  opacity: 0;
}
.cxd-enter-from .cxd-sheet,
.cxd-leave-to .cxd-sheet {
  transform: translateY(100%);
}

/* ── Auth-required popup (sits above the drawer) ── */
.authd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 17, 42, 0.62);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}
.authd-card {
  width: 100%;
  max-width: 22rem;
  background: #fff;
  border-radius: 18px;
  padding: 22px 22px 18px;
  box-shadow: 0 24px 60px rgba(35, 29, 69, 0.45);
  text-align: center;
  color: #231d45;
}
.authd-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(0, 161, 154, 0.12);
  color: #007e78;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}
.authd-icon svg {
  width: 24px;
  height: 24px;
}
.authd-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
  line-height: 1.25;
}
.authd-body {
  font-size: 13px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.55;
  margin-bottom: 18px;
}
.authd-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.authd-btn {
  width: 100%;
  padding: 13px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  letter-spacing: -0.1px;
}
.authd-btn.primary {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.authd-btn.primary:hover {
  filter: brightness(1.06);
}
.authd-btn.secondary {
  background: #fff;
  border: 1.5px solid #e4e5ed;
  color: #231d45;
}
.authd-btn.secondary:hover {
  background: #f5f6fa;
}
.authd-btn.ghost {
  background: transparent;
  color: #6b7089;
  font-weight: 700;
  padding: 8px;
}
.authd-btn.ghost:hover {
  color: #231d45;
}
.authd-enter-active,
.authd-leave-active {
  transition: opacity 0.22s ease;
}
.authd-enter-active .authd-card,
.authd-leave-active .authd-card {
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.authd-enter-from,
.authd-leave-to {
  opacity: 0;
}
.authd-enter-from .authd-card,
.authd-leave-to .authd-card {
  transform: scale(0.94);
}
</style>
