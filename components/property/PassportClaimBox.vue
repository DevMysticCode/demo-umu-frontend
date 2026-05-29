<template>
  <div class="pcb">
    <!-- ── State box (replaces the old "Is this your property?" CTA) ── -->
    <button
      v-if="state === 'unclaimed'"
      class="pcb-box"
      type="button"
      style="background: linear-gradient(135deg, #2d2456, #231d45)"
      @click="$emit('claim')"
    >
      <div class="pcb-left">
        <div class="pcb-main">This property is unclaimed</div>
        <div class="pcb-sub">Is it yours? Build your verified Passport in minutes.</div>
        <span class="pcb-explain" @click.stop="openSheet = 'unclaimed'">
          What does it mean to claim? <span class="pcb-q">?</span>
        </span>
      </div>
      <div class="pcb-arrow">→</div>
    </button>

    <button
      v-else-if="state === 'inProgress'"
      class="pcb-box"
      type="button"
      style="background: linear-gradient(135deg, #4dd4ce 0%, #00a19a 45%, #006e68 100%)"
      @click="openSheet = 'progress'"
    >
      <div class="pcb-left">
        <div class="pcb-main">A Passport is being built for this home</div>
        <div class="pcb-sub">The owner is preparing a verified record — be ready before it goes live.</div>
        <span class="pcb-explain" @click.stop="openSheet = 'progress'">
          What is a Passport in progress? <span class="pcb-q">?</span>
        </span>
      </div>
      <div class="pcb-ring">
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.30)" stroke-width="4.5" fill="none" />
          <circle
            cx="25" cy="25" r="20"
            stroke="#fff" stroke-width="4.5" fill="none"
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
      v-else
      class="pcb-box"
      type="button"
      style="background: linear-gradient(135deg, #8b6fe0 0%, #5b3795 45%, #3a1f66 100%)"
      @click="openSheet = 'published'"
    >
      <div class="pcb-left">
        <div class="pcb-main">This property has a published Passport</div>
        <div class="pcb-sub">Gain access to the full verified record — certificates, history &amp; more.</div>
        <span class="pcb-explain" @click.stop="openSheet = 'published'">
          What's inside the Passport? <span class="pcb-q">?</span>
        </span>
      </div>
      <div class="pcb-right">£99 →</div>
    </button>

    <!-- ── Explainer drawers ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="cxd">
        <div v-if="openSheet" class="cxd-overlay" @click.self="openSheet = null">
          <div class="cxd-sheet" @click.stop>
            <div class="cxd-grip" />

            <!-- UNCLAIMED -->
            <template v-if="openSheet === 'unclaimed'">
              <div class="cx-hero navy">
                <div class="cx-hero-eyebrow">Property Passport™</div>
                <div class="cx-hero-title">Your home's permanent record — not just for selling, for owning.</div>
                <div class="cx-hero-sub">A Passport stays with this property for life. Build it now, keep it updated, and when you do decide to sell — the hard work is already done.</div>
              </div>
              <div class="cx-callout navy">
                <div class="cx-callout-h">The car you'd never buy blind</div>
                <div class="cx-callout-v">You wouldn't buy a £15,000 car without an HPI check and service history. Yet people spend £300k+ on a home with almost no verified information. A Property Passport changes that — <b>permanently</b>.</div>
              </div>
              <div class="cx-stats">
                <div class="cx-stat"><div class="cx-stat-num">Free</div><div class="cx-stat-label">To claim &amp; build forever</div></div>
                <div class="cx-stat"><div class="cx-stat-num">2 min</div><div class="cx-stat-label">To claim ownership today</div></div>
                <div class="cx-stat"><div class="cx-stat-num">150</div><div class="cx-stat-label">Days avg. conveyancing</div></div>
                <div class="cx-stat"><div class="cx-stat-num">18</div><div class="cx-stat-label">Searches on this address / mo</div></div>
              </div>
              <div class="cx-section-h">Your four steps · tap to learn more</div>
              <div class="cx-steps">
                <template v-for="(s, i) in unclaimedSteps" :key="s.n">
                  <div
                    class="cx-step cx-step-tap"
                    :class="{ active: activeStep === s.n }"
                    @click="activeStep = s.n"
                  >
                    <div class="cx-step-num" :class="s.n === 1 ? 'on' : 'off'">{{ s.n }}</div>
                    <div class="cx-step-name" :class="{ off: s.n !== 1 }">{{ s.name }}</div>
                  </div>
                  <div v-if="i < unclaimedSteps.length - 1" class="cx-step-line" />
                </template>
              </div>
              <div class="cx-step-detail">
                <div class="cx-step-detail-h">{{ activeStepData.h }}</div>
                <div class="cx-step-detail-v">{{ activeStepData.v }}</div>
              </div>
              <div class="cxd-cta-row">
                <button class="cxd-btn secondary" type="button" @click="openSheet = null">Got it</button>
                <button class="cxd-btn primary" type="button" @click="onPrimary('claim')">Claim it free →</button>
              </div>
              <div class="cx-foot">The way people buy homes is changing — we're building that future with government.</div>
            </template>

            <!-- IN PROGRESS -->
            <template v-else-if="openSheet === 'progress'">
              <div class="cx-hero teal">
                <div class="cx-hero-eyebrow">Property Passport™ · In Progress</div>
                <div class="cx-hero-title">This owner is building something that removes 150 days of uncertainty.</div>
                <div class="cx-hero-sub">A permanent verified record for this property. When it publishes, you get instant access to everything — before you even make an offer.</div>
              </div>
              <div class="cx-callout">
                <div class="cx-callout-h">Why this matters</div>
                <div class="cx-callout-v">People fall for a house in 20 minutes, then spend ~150 days chasing solicitors and documents that already exist somewhere. This Passport collects it all upfront. <b>👁 Watch this property to be first in the door the moment it publishes.</b></div>
              </div>
              <div class="cx-section-h">Build progress</div>
              <div class="cx-progress-row"><span>{{ pct }}% complete</span><span>{{ sectionsDone }} of {{ sectionsTotal }} verified</span></div>
              <div class="cx-progress-track"><div class="cx-progress-fill" :style="{ width: pct + '%' }" /></div>
              <div class="cx-section-h">Already verified</div>
              <div class="cx-item"><div class="cx-item-ico">⚡</div><div class="cx-item-body"><div class="cx-item-title">EPC Certificate</div><div class="cx-item-sub">Energy rating · lodged on the public register</div></div><div class="cx-item-tick">✓</div></div>
              <div class="cx-item"><div class="cx-item-ico">🏛️</div><div class="cx-item-body"><div class="cx-item-title">Land Registry Title &amp; Plan</div><div class="cx-item-sub">Ownership confirmed</div></div><div class="cx-item-tick">✓</div></div>
              <div class="cx-item"><div class="cx-item-ico">📋</div><div class="cx-item-body"><div class="cx-item-title">TA6 — Property Information</div><div class="cx-item-sub">Boundaries, disputes, utilities</div></div><div class="cx-item-tick">✓</div></div>
              <div class="cxd-cta-row">
                <button class="cxd-btn secondary" type="button" @click="openSheet = null">Close</button>
                <button class="cxd-btn primary" type="button" @click="onPrimary('watch')">👁 Watch this property</button>
              </div>
              <div class="cx-foot">The way people buy homes is changing — we're building that future with government.</div>
            </template>

            <!-- PUBLISHED -->
            <template v-else>
              <div class="cx-hero amber">
                <div class="cx-hero-eyebrow">Property Passport™</div>
                <div class="cx-hero-title">The biggest purchase of your life — and you're doing it blind.</div>
                <div class="cx-hero-sub">You wouldn't buy a £15,000 car without its service history. This is the verified record that should always have existed for every home.</div>
              </div>
              <div class="cx-callout">
                <div class="cx-callout-h">Why this exists</div>
                <div class="cx-callout-v">Conveyancing takes 150 days on average — nearly half spent chasing documents that already exist. The Passport ends that. Everything verified by the owner, ready before solicitors are even instructed. <b>⏱ Average sale cut by 6–8 weeks.</b></div>
              </div>
              <div class="cx-callout amber">
                <div class="cx-callout-h">Not just for buying this home</div>
                <div class="cx-callout-v">The environmental, flood and planning data applies to the whole street. Solicitors charge £300–500 for searches thrown away after every transaction. This data stays.</div>
              </div>
              <div class="cx-stats">
                <div class="cx-stat"><div class="cx-stat-num">150</div><div class="cx-stat-label">Avg. days in conveyancing</div></div>
                <div class="cx-stat"><div class="cx-stat-num">£99</div><div class="cx-stat-label">One-off · no subscription</div></div>
                <div class="cx-stat"><div class="cx-stat-num">23×</div><div class="cx-stat-label">Same search bought / street</div></div>
                <div class="cx-stat"><div class="cx-stat-num">100%</div><div class="cx-stat-label">Owner-verified · HMLR backed</div></div>
              </div>
              <div class="cx-section-h">What's inside</div>
              <div class="cx-item"><div class="cx-item-ico">📋</div><div class="cx-item-body"><div class="cx-item-title">TA6, TA7 &amp; TA10 forms</div><div class="cx-item-sub">All conveyancing questions answered upfront</div></div><div class="cx-item-tick">✓</div></div>
              <div class="cx-item"><div class="cx-item-ico">🏛️</div><div class="cx-item-body"><div class="cx-item-title">Land Registry Title &amp; Plan</div><div class="cx-item-sub">Verified ownership · boundary map</div></div><div class="cx-item-tick">✓</div></div>
              <div class="cx-item"><div class="cx-item-ico">🔧</div><div class="cx-item-body"><div class="cx-item-title">Gas, Electrical &amp; EPC</div><div class="cx-item-sub">All certificates verified</div></div><div class="cx-item-tick">✓</div></div>
              <div class="cx-item"><div class="cx-item-ico">📅</div><div class="cx-item-body"><div class="cx-item-title">Planning History</div><div class="cx-item-sub">Extensions, permissions, works</div></div><div class="cx-item-tick">✓</div></div>
              <div class="cxd-cta-row">
                <button class="cxd-btn secondary" type="button" @click="openSheet = null">Not now</button>
                <button class="cxd-btn primary" type="button" @click="onPrimary('buy')">Get the Passport · £99</button>
              </div>
              <div class="cx-foot">The way people buy homes is changing — we're building that future with government.</div>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    state: 'unclaimed' | 'inProgress' | 'published'
    progressPct?: number
    sectionsDone?: number
    sectionsTotal?: number
  }>(),
  { progressPct: 60, sectionsDone: 4, sectionsTotal: 8 },
)

const emit = defineEmits<{
  (e: 'claim'): void
  (e: 'watch'): void
  (e: 'buy'): void
}>()

const pct = computed(() => Math.max(0, Math.min(100, Math.round(props.progressPct ?? 0))))

const openSheet = ref<'unclaimed' | 'progress' | 'published' | null>(null)

const unclaimedSteps = [
  { n: 1, name: 'Claim' },
  { n: 2, name: 'Verify' },
  { n: 3, name: 'Score' },
  { n: 4, name: 'Publish' },
]
const stepDetails: Record<number, { h: string; v: string }> = {
  1: { h: '1 · Claim', v: "Confirm you own this property — takes about 2 minutes and is free. We check it against HM Land Registry, so you don't need to upload anything to get started." },
  2: { h: '2 · Verify', v: 'Upload your certificates (gas, electrical, EPC) and answer the standard conveyancing questions. We verify each against official sources and mark them ✓ on your Passport.' },
  3: { h: '3 · Score', v: 'As documents are verified, your HomeScore climbs from the public-records baseline to a fully verified score that buyers and lenders trust.' },
  4: { h: '4 · Publish', v: "When you're ready to sell, publish your Passport. Buyers get instant access to everything upfront — cutting weeks off conveyancing." },
}
const activeStep = ref(1)
const activeStepData = computed(() => stepDetails[activeStep.value] ?? stepDetails[1])

function onPrimary(action: 'claim' | 'watch' | 'buy') {
  openSheet.value = null
  emit(action)
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
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
.cx-hero { border-radius: 16px; padding: 20px; margin: 14px 22px 0; position: relative; overflow: hidden; color: white; }
.cx-hero::after { content: ''; position: absolute; top: -20px; right: -20px; width: 90px; height: 90px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); }
.cx-hero.navy { background: var(--primary); }
.cx-hero.teal { background: linear-gradient(135deg, #4dd4ce 0%, #00a19a 45%, #006e68 100%); }
.cx-hero.amber { background: linear-gradient(135deg, #f0b460 0%, #d4822a 45%, #7a3a05 100%); }
.cx-hero-eyebrow { font-size: 9px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: rgba(255, 255, 255, 0.7); margin-bottom: 6px; position: relative; z-index: 1; }
.cx-hero-title { font-size: 18px; font-weight: 900; line-height: 1.25; letter-spacing: -0.3px; margin-bottom: 8px; position: relative; z-index: 1; }
.cx-hero-sub { font-size: 12px; color: rgba(255, 255, 255, 0.85); line-height: 1.55; position: relative; z-index: 1; }
.cx-callout { background: var(--bg); border-radius: 14px; padding: 14px; margin: 14px 22px 0; border-left: 3px solid var(--accent); }
.cx-callout.navy { border-left-color: var(--primary); }
.cx-callout.amber { border-left-color: #d4822a; background: #fef9f0; }
.cx-callout-h { font-size: 9px; font-weight: 800; color: var(--accent-dark); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; }
.cx-callout.navy .cx-callout-h { color: var(--primary); }
.cx-callout.amber .cx-callout-h { color: #b07a1c; }
.cx-callout-v { font-size: 12px; color: var(--text-secondary); line-height: 1.6; }
.cx-callout-v b { color: var(--text); font-weight: 800; }
.cx-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 14px 22px 0; }
.cx-stat { background: var(--bg); border-radius: 12px; padding: 12px; text-align: center; }
.cx-stat-num { font-size: 20px; font-weight: 900; color: var(--text); letter-spacing: -0.5px; }
.cx-stat-label { font-size: 10px; color: var(--text-faint); margin-top: 2px; font-weight: 600; line-height: 1.3; }
.cx-section-h { font-size: 10px; font-weight: 800; color: var(--text-faint); letter-spacing: 1.5px; text-transform: uppercase; margin: 16px 22px 10px; }
.cx-item { display: flex; align-items: center; gap: 10px; background: var(--bg); border-radius: 11px; padding: 10px 12px; margin: 0 22px 7px; }
.cx-item-ico { width: 30px; height: 30px; border-radius: 8px; background: var(--accent-paler); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.cx-item-body { flex: 1; min-width: 0; }
.cx-item-title { font-size: 12px; font-weight: 800; color: var(--text); }
.cx-item-sub { font-size: 10px; color: var(--text-faint); margin-top: 1px; }
.cx-item-tick { color: var(--accent-dark); font-weight: 800; font-size: 13px; }
.cx-steps { display: flex; align-items: flex-start; margin: 0 22px 18px; }
.cx-step { display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1; }
.cx-step-num { width: 34px; height: 34px; border-radius: 50%; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
.cx-step-num.on { background: var(--primary); color: white; }
.cx-step-num.off { background: var(--border); color: var(--text-faint); }
.cx-step-name { font-size: 10px; font-weight: 700; color: var(--text); }
.cx-step-name.off { color: var(--text-faint); }
.cx-step-line { flex: 0 0 auto; width: 14px; height: 2px; background: var(--border); margin-top: 17px; }
.cx-step-tap { cursor: pointer; padding: 6px 2px 4px; border-radius: 10px; transition: background 0.15s; }
.cx-step-tap:hover { background: var(--bg); }
.cx-step-tap .cx-step-num { transition: transform 0.15s; }
.cx-step-tap.active .cx-step-num { transform: scale(1.12); box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.15); }
.cx-step-tap.active .cx-step-num.off { background: var(--accent); color: white; }
.cx-step-tap.active .cx-step-num.on { background: var(--accent); }
.cx-step-tap.active .cx-step-name { color: var(--accent-dark) !important; font-weight: 800; }
.cx-step-detail { margin: 0 22px 4px; padding: 13px 15px; background: var(--accent-paler); border: 1px solid var(--accent-pale); border-radius: 12px; }
.cx-step-detail-h { font-size: 12px; font-weight: 800; color: var(--accent-dark); margin-bottom: 4px; letter-spacing: -0.1px; }
.cx-step-detail-v { font-size: 12px; font-weight: 500; color: var(--text); line-height: 1.55; }
.cx-progress-track { height: 8px; background: var(--border-soft); border-radius: 4px; overflow: hidden; margin: 0 22px 16px; }
.cx-progress-fill { height: 100%; background: linear-gradient(90deg, #00a19a, #4dd4ce); border-radius: 4px; transition: width 0.9s cubic-bezier(0.22, 1, 0.36, 1); }
.cx-progress-row { display: flex; justify-content: space-between; align-items: baseline; margin: 0 22px 6px; }
.cx-progress-row span:first-child { font-size: 13px; font-weight: 800; color: var(--text); }
.cx-progress-row span:last-child { font-size: 11px; color: var(--text-faint); }
.cx-foot { text-align: center; font-size: 11px; color: var(--text-faint); line-height: 1.6; padding: 4px 30px 16px; }

/* CTA row */
.cxd-cta-row { padding: 18px 22px 8px; display: flex; gap: 8px; }
.cxd-btn { flex: 1; padding: 14px; font-family: inherit; font-size: 14px; font-weight: 800; border-radius: 12px; cursor: pointer; transition: all 0.15s; border: none; }
.cxd-btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent-dark)); color: white; box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3); }
.cxd-btn.primary:hover { filter: brightness(1.06); }
.cxd-btn.secondary { background: var(--card); border: 1.5px solid var(--border); color: var(--text-secondary); }

.cxd-enter-active,
.cxd-leave-active { transition: opacity 0.25s ease; }
.cxd-enter-active .cxd-sheet,
.cxd-leave-active .cxd-sheet { transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1); }
.cxd-enter-from,
.cxd-leave-to { opacity: 0; }
.cxd-enter-from .cxd-sheet,
.cxd-leave-to .cxd-sheet { transform: translateY(100%); }
</style>
