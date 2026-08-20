<template>
  <!-- Ported from prisma/homescore-card.html — navy hero with EPC and
       HomeScore tiles + the social-proof rows ("checked today" + watching
       / live interest). Used on V6ScoreView and V6QuizView so the same
       card surfaces on the HomeScore detail and the owner quiz.

       The prototype's "See the pathway →" / "Take the quiz →" pills are
       intentionally omitted per design feedback. -->
  <div class="hsc-card">
    <div class="hsc-head">
      <svg
        v-if="compact || reportMode"
        class="hsc-pin-ic"
        viewBox="0 0 24 24"
        fill="rgba(255,255,255,0.9)"
        aria-hidden="true"
      >
        <path
          d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.4 7.3 11.7.2.2.5.3.7.3s.5-.1.7-.3C13 21.4 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"
        />
      </svg>
      <span v-else class="hsc-ring" />
      <div class="hsc-head-text">
        <div class="hsc-addr">{{ address || 'Your property' }}</div>
        <div class="hsc-meta">{{ metaLine }}</div>
      </div>
    </div>
    <img
      src="/op-icons/landing/homeScoreCard.png"
      alt=""
      class="hsc-house-ic"
    />

    <!-- Report variant: stacked EPC row (badge + title + hook) and a
         passport-status pill — no HomeScore tile, no social-proof rows.
         Used by the Property Report page (homescore/costs/[id].vue). -->
    <template v-if="reportMode">
      <div class="hsc-report-epc">
        <span
          class="hsc-epc-badge hsc-epc-badge--report"
          :class="{ 'hsc-epc-badge--none': isNoEpc }"
          :style="!isNoEpc ? { background: epcColor(epcRating) } : {}"
          >{{ isNoEpc ? 'None' : epcRating || '—' }}</span
        >
        <div class="hsc-report-epc-text">
          <div class="hsc-report-epc-title">
            EPC rating {{ isNoEpc ? 'unavailable' : epcRating }}
          </div>
          <div class="hsc-report-epc-hook">{{ epcHook }}</div>
        </div>
      </div>
      <button
        type="button"
        class="hsc-report-pill"
        @click="emit('passport-pill-click')"
      >
        <img
          src="/op-icons/homescore/clipboard.png"
          alt=""
          class="hsc-report-pill-ic"
          loading="lazy"
        />
        <span class="hsc-report-pill-txt">{{ passportPillLabel }}</span>
        <svg
          class="hsc-report-pill-info"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,.75)"
          stroke-width="1.8"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 11v5.5" stroke-linecap="round" />
          <circle
            cx="12"
            cy="8"
            r="0.25"
            fill="rgba(255,255,255,.75)"
            stroke-width="1.5"
          />
        </svg>
      </button>
    </template>

    <!-- Compact variant: single EPC line, no HomeScore tile, no social
         proof rows — used by the score-result screen, which shows its
         own big HomeScore gauge right below this card. -->
    <template v-else-if="compact">
      <div class="hsc-compact-divider" />
      <div class="hsc-compact-row">
        <span
          class="hsc-epc-badge hsc-epc-badge--compact"
          :class="{ 'hsc-epc-badge--none': isNoEpc }"
          :style="!isNoEpc ? { background: epcColor(epcRating) } : {}"
          >{{ isNoEpc ? 'None' : epcRating || '—' }}</span
        >
        <span class="hsc-compact-label"
          >EPC rating {{ isNoEpc ? 'unavailable' : epcRating }}</span
        >
        <span class="hsc-compact-sep">|</span>
        <span class="hsc-compact-hook">{{ epcHook }}</span>
      </div>
    </template>

    <template v-else>
      <div class="hsc-divider" />

      <div class="hsc-tiles">
        <!-- EPC tile -->
        <div class="hsc-tile">
          <span class="hsc-tlabel">EPC rating</span>
          <div class="hsc-tile-val">
            <span
              class="hsc-epc-badge"
              :class="{ 'hsc-epc-badge--none': isNoEpc }"
              :style="!isNoEpc ? { background: epcColor(epcRating) } : {}"
              >{{ isNoEpc ? 'None' : epcRating || '—' }}</span
            >
          </div>
          <div v-if="!isNoEpc" class="hsc-bar">
            <i :style="{ width: epcBarPct + '%' }" />
          </div>
          <div v-else class="hsc-bar hsc-bar--empty" />
          <div class="hsc-hook">{{ epcHook }}</div>
        </div>

        <!-- HomeScore tile -->
        <div class="hsc-tile">
          <span class="hsc-tlabel">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="rgba(255,255,255,.92)"
              aria-hidden="true"
            >
              <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
            </svg>
            HomeScore
          </span>
          <div class="hsc-tile-val">
            <span v-if="isNoEpc" class="hsc-hs-num hsc-hs-num--unknown">
              <b>?</b><span>/100</span>
            </span>
            <span v-else class="hsc-hs-num">
              <b>{{ Math.round(homeScore || 0) }}</b
              ><span>/100</span>
            </span>
          </div>
          <div v-if="!isNoEpc" class="hsc-bar">
            <i :style="{ width: homeScoreBarPct + '%' }" />
          </div>
          <div v-else class="hsc-bar hsc-bar--empty" />
          <div class="hsc-hook">{{ homeScoreHook }}</div>
        </div>
      </div>
    </template>

    <!-- Social proof rows — shown in every mode (including report-mode)
         so "N checked today" / "N watching" stay consistent across the
         whole HomeScore journey, not just the score/quiz screens. -->
    <template v-if="showSocialProof">
      <!-- Social proof: searches today -->
      <div class="hsc-viewers">
        <span class="hsc-idstack" aria-hidden="true">
          <span class="hsc-idc" style="background: #9fe1cb">
            <span
              style="
                width: 8px;
                height: 8px;
                background: #0f6e56;
                border-radius: 2px;
                transform: rotate(45deg);
              "
            />
          </span>
          <span class="hsc-idc" style="background: #fac775">
            <span
              style="
                width: 9px;
                height: 9px;
                border: 2.5px solid #633806;
                border-radius: 50%;
              "
            />
          </span>
        </span>
        <div class="hsc-vtxt">
          <b>{{ searchesTodayDisplay }}</b>
          <span>&nbsp;checked this HomeScore today</span>
        </div>
      </div>

      <!-- Social proof: live interest (published) or watchers (others) -->
      <div
        v-if="passportState === 'published'"
        class="hsc-viewers hsc-viewers--live"
      >
        <span class="hsc-live-bars" aria-hidden="true">
          <span class="hsc-live-bar" />
          <span class="hsc-live-bar" />
          <span class="hsc-live-bar" />
        </span>
        <div class="hsc-vtxt">
          <b>Live interest.</b>
          <span>&nbsp;People are tracking this passport.</span>
        </div>
      </div>
      <div v-else class="hsc-viewers">
        <!-- Binoculars-style watching glyph. The earlier eye-with-pupil
             icon was too close to the "show password" eye used in form
             fields; this one reads as "spotting / monitoring" — much
             closer to the actual meaning of "watching this property". -->
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,.92)"
          stroke-width="1.9"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          style="flex: none"
        >
          <circle cx="6" cy="15" r="4" />
          <circle cx="18" cy="15" r="4" />
          <path d="M10 15h4" />
          <path d="M4.5 11l1.5 -5h2l1 5" />
          <path d="M19.5 11l-1.5 -5h-2l-1 5" />
        </svg>
        <div class="hsc-vtxt">
          <b>{{ watchersDisplay }}</b>
          <span
            >&nbsp;{{ watchersCount === 1 ? 'is' : 'are' }} watching this
            property</span
          >
        </div>
      </div>
    </template>

    <!-- Passport status — same state vocab as the report-mode pill.
         Skipped in report-mode: that variant already has its own
         (bigger, styled) passport pill above, so this would duplicate
         it. -->
    <button
      v-if="!reportMode && showSocialProof"
      type="button"
      class="hsc-viewers hsc-passport-box"
      @click="emit('passport-pill-click')"
    >
      <img
        src="/op-icons/homescore/clipboard.png"
        alt=""
        class="hsc-passport-box-ic"
        loading="lazy"
      />
      <div class="hsc-vtxt hsc-passport-box-txt">
        <b>{{ passportPillLabel }}</b>
      </div>
      <!-- <svg
        class="hsc-passport-box-chev"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,.75)"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="9 6 15 12 9 18" />
      </svg> -->
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    address?: string | null
    postcode?: string | null
    propertyType?: string | null
    sqm?: number | null
    epcRating?: string | null
    homeScore?: number | null
    searchesToday?: number
    watchersCount?: number
    passportState?: 'unclaimed' | 'inProgress' | 'published'
    /** Single-line EPC row, no HomeScore tile, no social-proof rows —
     *  used by the score-result screen (V6ScoreView). */
    compact?: boolean
    /** Hides both "checked today" and "watching" rows while keeping full
     *  EPC + HomeScore tiles — used by the Property Report page, whose
     *  prototype doesn't show these rows in the header card (the costs
     *  page has its own separate claim/watch UI below instead). Defaults
     *  to true so V6ScoreView/V6QuizView keep their existing rows. */
    showSocialProof?: boolean
    /** Stacked EPC row (bigger badge + title + hook, no HomeScore tile)
     *  plus a passport-status pill instead of the tiles/social-proof rows
     *  — matches the Property Report prototype's header exactly. Takes
     *  priority over `compact` when both are set. */
    reportMode?: boolean
  }>(),
  {
    address: null,
    postcode: null,
    propertyType: null,
    sqm: null,
    epcRating: null,
    homeScore: 0,
    searchesToday: 0,
    watchersCount: 0,
    passportState: 'unclaimed',
    compact: false,
    showSocialProof: true,
    reportMode: false,
  },
)

const emit = defineEmits<{
  (e: 'passport-pill-click'): void
}>()

const metaLine = computed(() => {
  const parts: string[] = []
  if (props.postcode) parts.push(props.postcode)
  if (props.propertyType) parts.push(props.propertyType)
  if (props.sqm) parts.push(`${props.sqm}m²`)
  return parts.join(' · ')
})

// EPC bar fill — A=92%, B=82%, C=72%, D=62%, E=47%, F=32%, G=15%. Mirrors
// the visual weight from the prototype (C at ~62% width) so the bar feels
// proportional to the certificate band rather than a literal SAP score.
function epcBarFill(rating?: string | null): number {
  switch ((rating || '').toUpperCase()) {
    case 'A':
      return 95
    case 'B':
      return 82
    case 'C':
      return 72
    case 'D':
      return 62
    case 'E':
      return 47
    case 'F':
      return 32
    case 'G':
      return 18
    default:
      return 50
  }
}
function epcColor(rating?: string | null): string {
  switch ((rating || '').toUpperCase()) {
    case 'A':
      return '#1F7A34'
    case 'B':
      return '#4D7C1F'
    case 'C':
      return '#7DA82C'
    case 'D':
      return '#E0B61D'
    case 'E':
      return '#E2902A'
    case 'F':
      return '#D85A28'
    case 'G':
      return '#B6271E'
    default:
      return '#7DA82C'
  }
}
const epcBarPct = computed(() => epcBarFill(props.epcRating))
const homeScoreBarPct = computed(() =>
  Math.max(0, Math.min(100, Math.round(props.homeScore || 0))),
)

// No-EPC state — when the property has no certificate on file, we
// swap the two tiles' inner content out (grey None badge + ?/100)
// and hide the animated bars. Visual container stays identical so
// this card sits in the same navy card language as the EPC-present
// version. Both flags must be null/zero because a real value in
// either would mean we DO have a HomeScore to display.
const isNoEpc = computed(
  () => !props.epcRating && (props.homeScore == null || props.homeScore === 0),
)

// Hook copy — small line under each bar, mirrors the prototype's
// "Lower running costs" / "Above average". Adapts to the actual data.
const epcHook = computed(() => {
  if (isNoEpc.value) return 'No EPC on record'
  const r = (props.epcRating || '').toUpperCase()
  if (r === 'A' || r === 'B') return 'Top-band efficiency'
  if (r === 'C') return 'Lower running costs'
  if (r === 'D') return 'Room to improve'
  if (r) return 'High running costs'
  return 'Energy rating'
})
// Report-mode passport pill — mirrors the state vocab passed in via
// passportState (already used by the social-proof "live interest" row).
const passportPillLabel = computed(() => {
  if (props.passportState === 'published') return 'Passport ready to view'
  if (props.passportState === 'inProgress') return 'Passport in progress'
  return 'No Passport yet'
})

const homeScoreHook = computed(() => {
  if (isNoEpc.value) return 'Answer 20 questions'
  const s = props.homeScore || 0
  if (s >= 80) return 'Top of the street'
  if (s >= 60) return 'Above average'
  if (s >= 40) return 'Around average'
  return 'Below average'
})

const searchesTodayDisplay = computed(() => {
  const n = props.searchesToday ?? 0
  return `${n} ${n === 1 ? 'person' : 'people'}`
})
const watchersDisplay = computed(() => {
  const n = props.watchersCount ?? 0
  return `${n} ${n === 1 ? 'person' : 'people'}`
})
</script>

<style scoped>
/* Sized to match the rest of the page's card rhythm (the app frame is
   ~28rem max), so the amber hero doesn't tower over neighbouring cards.
   Visual structure stays 1:1 with prisma/homescore-card.html. */
.hsc-card {
  position: relative;
  width: auto;
  max-width: 100%;
  background: #231d45;
  border-radius: 16px;
  padding: 16px 18px;
  color: #fff;
  box-shadow: 0 10px 26px rgba(35, 29, 69, 0.24);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif;
}

.hsc-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-right: 108px;
}
.hsc-head-text {
  flex: 1;
  min-width: 0;
}
.hsc-house-ic {
  position: absolute;
  top: 2%;
  right: 6px;
  width: 128px;
  height: 123px;
  object-fit: contain;
  filter: drop-shadow(0 10px 14px rgba(0, 0, 0, 0.35));
  pointer-events: none;
  /* transform: translateY(-50%); */
}
.hsc-ring {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2.5px solid rgba(255, 255, 255, 0.85);
  margin-top: 7px;
  flex: none;
}
.hsc-pin-ic {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  flex: none;
}
.hsc-addr {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.15;
  color: #fff;
  letter-spacing: -0.2px;
}
.hsc-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
  margin-top: 3px;
}

.hsc-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.25);
  margin: 14px 0;
}
.hsc-compact-divider {
  height: 1px;
  /* background: rgba(255, 255, 255, 0.25); */
  margin: 14px 0 12px;
}
.hsc-compact-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  padding-right: 108px;
}
.hsc-epc-badge--compact {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  font-size: 13px;
  flex-shrink: 0;
}
.hsc-compact-label {
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  flex-shrink: 0;
}
.hsc-compact-sep {
  color: rgba(255, 255, 255, 0.35);
  font-size: 14px;
}
.hsc-compact-hook {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
}

/* Report mode */
.hsc-report-epc {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
.hsc-epc-badge--report {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 16px;
  flex-shrink: 0;
}
.hsc-report-epc-text {
  min-width: 0;
}
.hsc-report-epc-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.1px;
}
.hsc-report-epc-hook {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 2px;
}
.hsc-report-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  width: auto;
  margin-top: 14px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 0.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
}
.hsc-report-pill-ic {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}
.hsc-report-pill-txt {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}
.hsc-report-pill-info {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Tiles */
.hsc-tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.hsc-tile {
  background: rgba(255, 255, 255, 0.1);
  border: 0.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  color: #fff;
}
.hsc-tlabel {
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  letter-spacing: 0.2px;
}
.hsc-epc-badge {
  background: #4d7c1f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* No-EPC variant — reads as "empty state" rather than a low band. */
.hsc-epc-badge--none {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
  width: auto;
  padding: 2px 10px;
  font-size: 11.5px;
  font-weight: 700;
  border-radius: 8px;
}
.hsc-hs-num--unknown b {
  opacity: 0.85;
}
.hsc-bar--empty {
  background: rgba(255, 255, 255, 0.14);
}
.hsc-hs-num {
  font-size: 12px;
  font-weight: 600;
}
.hsc-hs-num b {
  font-size: 18px;
  font-weight: 700;
}
.hsc-hs-num span {
  color: rgba(255, 255, 255, 0.7);
}
.hsc-tile-val {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
  min-height: 24px;
}
.hsc-bar {
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 99px;
  overflow: hidden;
  margin: 9px 0 7px;
}
.hsc-bar i {
  display: block;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 99px;
  transform-origin: left;
  animation: hscBarGrow 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  position: relative;
  overflow: hidden;
}
.hsc-bar i::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 45%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(35, 29, 69, 0.55),
    transparent
  );
  animation: hscShimmer 2.6s ease-in-out 1.1s infinite;
}
@keyframes hscBarGrow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
@keyframes hscShimmer {
  0% {
    transform: translateX(-130%);
  }
  55%,
  100% {
    transform: translateX(330%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .hsc-bar i {
    animation: none;
  }
  .hsc-bar i::after {
    animation: none;
    opacity: 0;
  }
}
.hsc-hook {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.35;
}

/* Viewer rows (checked / watching / live interest) */
.hsc-viewers {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 0.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px 12px;
  margin-top: 10px;
}
.hsc-idstack {
  display: inline-flex;
  flex: none;
}
.hsc-idc {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #231d45;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex: none;
}
.hsc-idc:nth-child(n + 2) {
  margin-left: -8px;
}
.hsc-vtxt {
  font-size: 12.5px;
  line-height: 1.35;
}
.hsc-vtxt b {
  font-weight: 700;
}
.hsc-vtxt span {
  color: rgba(255, 255, 255, 0.85);
}

/* Passport-status box — same "hsc-viewers" box language, but a real
   button (width:100%, no UA button chrome) since it's tappable. */
.hsc-passport-box {
  width: 100%;
  border: 0.5px solid rgba(255, 255, 255, 0.2);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
}
.hsc-passport-box-ic {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}
.hsc-passport-box-txt {
  flex: 1;
  min-width: 0;
}
.hsc-passport-box-chev {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Animated signal-bars variant — shown for published passports. */
.hsc-viewers--live {
  gap: 10px;
}
.hsc-live-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
  flex: none;
}
.hsc-live-bar {
  width: 3px;
  background: #fff;
  border-radius: 1.5px;
  animation: hscLiveBars 1.2s ease-in-out infinite;
  transform-origin: bottom;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.6);
}
.hsc-live-bar:nth-child(1) {
  height: 5px;
  animation-delay: 0s;
}
.hsc-live-bar:nth-child(2) {
  height: 9px;
  animation-delay: 0.15s;
}
.hsc-live-bar:nth-child(3) {
  height: 13px;
  animation-delay: 0.3s;
}
@keyframes hscLiveBars {
  0%,
  100% {
    transform: scaleY(0.55);
    opacity: 0.6;
  }
  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hsc-live-bar {
    animation: none;
    transform: scaleY(1);
    opacity: 0.95;
  }
}
</style>
