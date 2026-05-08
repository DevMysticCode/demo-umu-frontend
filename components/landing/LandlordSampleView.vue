<template>
  <!-- Visual-faithful copy of pages/passportview/landlord/[id].vue. Hard-coded
       sample data (14 Hazel Grove, Stockport SK7 4BL — 12 landlord sections),
       no API calls. Used inside the landing-page sample viewer. -->
  <div class="lp-body">
    <div class="atm-bg teal" />

    <!-- Premium hero — book on left, dashboard on right -->
    <div class="pp-hero">
      <div class="pp-hero-glow" />
      <div class="pp-hero-book">
        <PassportCard line1="14 Hazel Grove" line2="Stockport, SK7 4BL" />
      </div>
      <div class="pp-hero-info">
        <div class="pp-hero-eyebrow">Landlord Passport</div>
        <div class="pp-hero-addr-row">
          <div class="pp-hero-addr-text">
            <div class="pp-hero-addr-l1">14 Hazel Grove</div>
            <div class="pp-hero-addr-l2">Stockport, SK7 4BL</div>
          </div>
        </div>
        <div class="pp-hero-stats">
          <div class="pp-hero-stat">
            <div class="pp-hero-stat-val">83<small>%</small></div>
            <div class="pp-hero-stat-lbl">Compliant</div>
          </div>
          <div class="pp-hero-stat">
            <div class="pp-hero-stat-val">11</div>
            <div class="pp-hero-stat-lbl">Docs</div>
          </div>
          <div class="pp-hero-stat">
            <div class="pp-hero-stat-val">10<span class="pp-hero-stat-of">/12</span></div>
            <div class="pp-hero-stat-lbl">Sections</div>
          </div>
        </div>
        <div class="pp-hero-dash">
          <div class="pp-hero-dash-row">
            <span class="pp-hero-dash-label">Compliance progress</span>
            <span class="pp-hero-dash-pct">83%</span>
          </div>
          <div class="pp-hero-dash-bar">
            <div class="pp-hero-dash-fill" :style="{ width: '83%' }">
              <span class="pp-hero-dash-man">🚶</span>
            </div>
          </div>
          <div class="pp-hero-dash-warn">
            <span class="pp-hero-dash-warn-dot" />
            1 doc expiring in the next 30 days
          </div>
        </div>
      </div>
    </div>

    <!-- Convert to selling CTA -->
    <button class="lp-convert-card" type="button">
      <div class="lp-convert-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
        </svg>
      </div>
      <div class="lp-convert-body">
        <div class="lp-convert-title">Convert to selling passport</div>
        <div class="lp-convert-sub">Transfer 6 docs · keep tenant or serve notice</div>
      </div>
      <span class="lp-convert-chev">›</span>
    </button>

    <!-- Tabs -->
    <div class="lp-tabs">
      <button type="button" class="lp-tab active">
        Compliance
        <span class="lp-tab-count">12</span>
      </button>
      <button type="button" class="lp-tab">
        Vault
        <span class="lp-tab-count">11</span>
      </button>
      <button type="button" class="lp-tab">Tenancy</button>
    </div>

    <!-- Compliance — Statutory group -->
    <div class="section-heading">Statutory — annual / 5-yearly</div>
    <div v-for="section in safetyGroup" :key="section.name" class="lp-sec" :class="`lp-sec--${section.tone}`">
      <div class="lp-sec-icon" :class="`lp-sec-icon--${section.tone}`">{{ section.icon }}</div>
      <div class="lp-sec-content">
        <div class="lp-sec-row-top">
          <div class="lp-sec-text">
            <div class="lp-sec-name">{{ section.name }}</div>
            <div class="lp-sec-sub">{{ section.subtitle }}</div>
            <div class="lp-sec-pills">
              <span class="lp-sec-pill lp-sec-pill--doc">
                <span class="lp-sec-pill-ic">📄</span>
                {{ section.docs }} doc
              </span>
              <span class="lp-sec-pill" :class="`lp-sec-pill--${section.tone}`">{{ section.statusLabel }}</span>
            </div>
          </div>
          <span class="lp-sec-chev">›</span>
        </div>
        <div class="lp-sec-bar">
          <div class="lp-sec-bar-fill" :class="`lp-sec-bar-fill--${section.tone}`" :style="{ width: section.pct + '%' }" />
        </div>
        <div v-if="section.actionBy" class="lp-sec-actionby">{{ section.actionBy }}</div>
        <div v-else-if="section.tone === 'good'" class="lp-sec-pct lp-sec-pct--good">100%</div>
      </div>
    </div>

    <!-- Tenancy & deposit group -->
    <div class="section-heading">Tenancy &amp; deposit</div>
    <div v-for="section in tenancyGroup" :key="section.name" class="lp-sec" :class="`lp-sec--${section.tone}`">
      <div class="lp-sec-icon" :class="`lp-sec-icon--${section.tone}`">{{ section.icon }}</div>
      <div class="lp-sec-content">
        <div class="lp-sec-row-top">
          <div class="lp-sec-text">
            <div class="lp-sec-name">{{ section.name }}</div>
            <div class="lp-sec-sub">{{ section.subtitle }}</div>
            <div class="lp-sec-pills">
              <span class="lp-sec-pill lp-sec-pill--doc">
                <span class="lp-sec-pill-ic">📄</span>
                {{ section.docs }} doc
              </span>
              <span class="lp-sec-pill" :class="`lp-sec-pill--${section.tone}`">{{ section.statusLabel }}</span>
            </div>
          </div>
          <span class="lp-sec-chev">›</span>
        </div>
        <div class="lp-sec-bar">
          <div class="lp-sec-bar-fill" :class="`lp-sec-bar-fill--${section.tone}`" :style="{ width: section.pct + '%' }" />
        </div>
        <div v-if="section.tone === 'good'" class="lp-sec-pct lp-sec-pct--good">100%</div>
      </div>
    </div>

    <!-- Insurance & HMO group -->
    <div class="section-heading">Insurance &amp; HMO</div>
    <div v-for="section in insuranceGroup" :key="section.name" class="lp-sec" :class="`lp-sec--${section.tone}`">
      <div class="lp-sec-icon" :class="`lp-sec-icon--${section.tone}`">{{ section.icon }}</div>
      <div class="lp-sec-content">
        <div class="lp-sec-row-top">
          <div class="lp-sec-text">
            <div class="lp-sec-name">{{ section.name }}</div>
            <div class="lp-sec-sub">{{ section.subtitle }}</div>
            <div class="lp-sec-pills">
              <span class="lp-sec-pill lp-sec-pill--doc">
                <span class="lp-sec-pill-ic">📄</span>
                {{ section.docs }} doc
              </span>
              <span class="lp-sec-pill" :class="`lp-sec-pill--${section.tone}`">{{ section.statusLabel }}</span>
            </div>
          </div>
          <span class="lp-sec-chev">›</span>
        </div>
        <div class="lp-sec-bar">
          <div class="lp-sec-bar-fill" :class="`lp-sec-bar-fill--${section.tone}`" :style="{ width: section.pct + '%' }" />
        </div>
        <div v-if="section.tone === 'good'" class="lp-sec-pct lp-sec-pct--good">100%</div>
      </div>
    </div>

    <!-- "+ N more sections" footer hint — sample only -->
    <div class="sec-more">
      <div class="sec-more-text">+ 8 more sections</div>
      <div class="sec-more-meta">EPC · Smoke &amp; CO · Legionella · Deposit · Right to Rent · Inventory · …</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PassportCard from '~/components/passport-view/PassportCard.vue'

interface SampleSection {
  name: string
  subtitle: string
  icon: string
  tone: 'good' | 'warn' | 'pending'
  statusLabel: string
  docs: string
  pct: number
  actionBy?: string
}

// Sample shows 4 curated sections — surrounding chrome (hero, dashboard,
// tabs, group headings) stays faithful to the real landlord-passport view.
const safetyGroup: SampleSection[] = [
  { name: 'Gas Safety Certificate (CP12)', subtitle: 'Annual · renewing in 30 days', icon: '🔥', tone: 'warn', statusLabel: '⚠ Renew soon', docs: '1/1', pct: 80, actionBy: 'Action by 30 May' },
  { name: 'Electrical Safety (EICR)', subtitle: '5-yearly · valid to Apr 2028', icon: '⚡', tone: 'good', statusLabel: '✓ Satisfactory', docs: '1/1', pct: 100 },
]

const tenancyGroup: SampleSection[] = [
  { name: 'Tenancy Agreement (AST)', subtitle: 'Signed · J. Smith · 12-month term', icon: '📜', tone: 'good', statusLabel: '✓ Active', docs: '1/1', pct: 100 },
]

const insuranceGroup: SampleSection[] = [
  { name: 'Landlord Insurance', subtitle: 'Direct Line · cover £350k · valid 2026', icon: '🛡️', tone: 'good', statusLabel: '✓ Active', docs: '1/1', pct: 100 },
]
</script>

<style scoped>
.lp-body { position: relative; padding-bottom: 16px; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal {
  background:
    radial-gradient(ellipse 60% 80% at 50% 0%, rgba(0, 161, 154, 0.12), transparent 65%);
}

/* ── Premium hero ────────────────────────── */
.pp-hero {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 16px;
  padding: 10px 22px 22px;
  position: relative;
  z-index: 1;
  align-items: stretch;
  background: radial-gradient(ellipse 70% 100% at 50% 0%, rgba(0, 161, 154, 0.14), transparent 60%);
  border-radius: 22px;
  margin: 14px 14px 14px;
}
.pp-hero-glow {
  position: absolute; inset: 0;
  border-radius: 22px;
  background: radial-gradient(ellipse 60% 80% at 30% 0%, rgba(0, 161, 154, 0.15), transparent 70%);
  pointer-events: none;
}
.pp-hero-book {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
}
.pp-hero-book :deep(.passport-card) { margin: 0; padding: 0; }
.pp-hero-book :deep(.passport-container) { max-width: 110px; width: 110px; }
.pp-hero-book :deep(.passport-image) {
  width: 110px; height: auto;
  filter: drop-shadow(0 10px 24px rgba(14, 40, 64, 0.3));
}

.pp-hero-info {
  position: relative; z-index: 1;
  display: flex; flex-direction: column;
  min-width: 0;
}
.pp-hero-eyebrow {
  font-size: 10px; font-weight: 800;
  letter-spacing: 1.4px; text-transform: uppercase;
  color: #1f7a66; margin-bottom: 4px;
}
.pp-hero-addr-row { display: flex; align-items: center; gap: 6px; }
.pp-hero-addr-text { flex: 1; min-width: 0; }
.pp-hero-addr-l1 {
  font-size: 18px; font-weight: 800;
  color: #0e2840; letter-spacing: -0.5px; line-height: 1.1;
}
.pp-hero-addr-l2 {
  font-size: 11px; font-weight: 700;
  color: #4a5868; margin-top: 2px;
}
.pp-hero-stats { display: flex; gap: 8px; margin-top: 12px; }
.pp-hero-stat { flex: 1; min-width: 0; }
.pp-hero-stat-val {
  font-size: 19px; font-weight: 800;
  color: #0e2840; letter-spacing: -0.5px;
  font-feature-settings: 'tnum'; line-height: 1;
}
.pp-hero-stat-val small { font-size: 11px; color: #4a5868; font-weight: 700; }
.pp-hero-stat-of { font-size: 12px; color: #8a95a0; font-weight: 700; }
.pp-hero-stat-lbl {
  font-size: 9.5px; font-weight: 800;
  letter-spacing: 1px; text-transform: uppercase;
  color: #8a95a0; margin-top: 4px;
}

.pp-hero-dash { margin-top: 12px; }
.pp-hero-dash-row {
  display: flex; justify-content: space-between;
  font-size: 10px; font-weight: 800;
  letter-spacing: 1px; text-transform: uppercase;
  color: #4a5868; margin-bottom: 5px;
}
.pp-hero-dash-pct { color: #1f7a66; font-feature-settings: 'tnum'; }
.pp-hero-dash-bar {
  height: 8px; background: rgba(31, 122, 102, 0.12);
  border-radius: 100px; overflow: visible;
  position: relative;
}
.pp-hero-dash-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #1f7a66);
  border-radius: 100px;
  position: relative;
}
.pp-hero-dash-man {
  position: absolute; right: -10px; top: -12px;
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}
.pp-hero-dash-warn {
  display: flex; align-items: center; gap: 6px;
  margin-top: 8px;
  font-size: 10.5px; font-weight: 800;
  color: #b85b36;
}
.pp-hero-dash-warn-dot {
  width: 7px; height: 7px;
  background: #ff8b5a; border-radius: 50%;
}

/* Convert card */
.lp-convert-card {
  width: calc(100% - 44px);
  margin: 4px 22px 16px;
  background:
    radial-gradient(ellipse 70% 70% at 30% 30%, rgba(255, 255, 255, 0.18), transparent 60%),
    linear-gradient(135deg, #00a19a, #1f7a66);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
  cursor: pointer; font-family: inherit; text-align: left;
  position: relative; z-index: 1; color: #fff;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
}
.lp-convert-icon {
  width: 38px; height: 38px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.lp-convert-icon svg { width: 18px; height: 18px; }
.lp-convert-body { flex: 1; min-width: 0; }
.lp-convert-title { font-size: 14px; font-weight: 800; letter-spacing: -0.3px; }
.lp-convert-sub { font-size: 11px; font-weight: 700; opacity: 0.85; margin-top: 2px; }
.lp-convert-chev { font-size: 20px; flex-shrink: 0; }

/* Tabs */
.lp-tabs {
  display: flex; gap: 6px;
  padding: 0 22px 12px;
  position: relative; z-index: 1;
}
.lp-tab {
  flex: 1;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 100px;
  padding: 9px 12px;
  font-family: inherit; font-size: 12px; font-weight: 800;
  color: #4a5868; letter-spacing: -0.2px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.lp-tab.active { background: #0e2840; color: #fff; border-color: #0e2840; }
.lp-tab-count {
  font-size: 10px; font-weight: 800;
  background: rgba(255, 255, 255, 0.18);
  padding: 1px 6px; border-radius: 100px;
  font-feature-settings: 'tnum';
}
.lp-tab:not(.active) .lp-tab-count { background: #f0f2f1; color: #4a5868; }

/* Section heading */
.section-heading {
  font-size: 10.5px; font-weight: 800;
  letter-spacing: 1.6px; text-transform: uppercase;
  color: #8a95a0;
  padding: 8px 22px;
  position: relative; z-index: 1;
}

/* Section card */
.lp-sec {
  width: calc(100% - 44px);
  margin: 0 22px 10px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 16px;
  padding: 14px 14px 12px;
  display: flex; align-items: flex-start; gap: 12px;
  cursor: pointer; font-family: inherit; text-align: left;
  position: relative; z-index: 1;
  box-shadow: 0 1px 2px rgba(14, 40, 64, 0.04);
}
.lp-sec-icon {
  width: 56px; height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f1f9f4, #e2f1ea);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 26px;
  box-shadow: inset 0 0 0 1px rgba(31, 122, 102, 0.1);
}
.lp-sec-icon--good {
  background: linear-gradient(135deg, #f1f9f4, #d6efe2);
  box-shadow: inset 0 0 0 1px rgba(0, 161, 154, 0.25);
}
.lp-sec-icon--warn {
  background: linear-gradient(135deg, #fef3c7, #fde9a4);
  box-shadow: inset 0 0 0 1px rgba(245, 196, 76, 0.4);
}
.lp-sec-content { flex: 1; min-width: 0; }
.lp-sec-row-top { display: flex; align-items: flex-start; gap: 8px; }
.lp-sec-row-top > div:first-child { flex: 1; min-width: 0; }
.lp-sec-name {
  font-size: 14.5px; font-weight: 800;
  color: #0e2840; letter-spacing: -0.3px; line-height: 1.2;
}
.lp-sec-sub {
  font-size: 11.5px; font-weight: 600;
  color: #4a5868; margin-top: 2px; line-height: 1.35;
}
.lp-sec-pills { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
.lp-sec-pill {
  font-size: 10px; font-weight: 800;
  letter-spacing: -0.1px;
  padding: 4px 9px;
  border-radius: 100px;
  display: inline-flex; align-items: center; gap: 4px;
  white-space: nowrap;
}
.lp-sec-pill--doc { background: #f0f2f1; color: #4a5868; }
.lp-sec-pill-ic { font-size: 10px; }
.lp-sec-pill--good { background: #d6efe2; color: #1f7a66; }
.lp-sec-pill--warn { background: #fef3c7; color: #92400e; }
.lp-sec-pill--pending { background: #f5f4f0; color: #8a95a0; }
.lp-sec-bar {
  height: 4px; background: #f0f2f1;
  border-radius: 100px; margin-top: 12px; overflow: hidden;
}
.lp-sec-bar-fill {
  height: 100%; border-radius: 100px;
}
.lp-sec-bar-fill--good { background: linear-gradient(90deg, #00a19a, #1f7a66); }
.lp-sec-bar-fill--warn { background: linear-gradient(90deg, #f5c44c, #d4a659); }
.lp-sec-bar-fill--pending { background: #d9dee2; }
.lp-sec-pct {
  text-align: right;
  font-size: 10.5px; font-weight: 800;
  color: #4a5868; margin-top: 4px;
  letter-spacing: -0.1px;
  font-feature-settings: 'tnum';
}
.lp-sec-pct--good { color: #1f7a66; }
.lp-sec-actionby {
  text-align: right;
  font-size: 11px; font-weight: 800;
  color: #b85b36; margin-top: 4px;
  letter-spacing: -0.1px;
}
.lp-sec-chev { color: #8a95a0; font-size: 22px; flex-shrink: 0; line-height: 1; padding-top: 2px; }

/* "+ N more sections" footer hint — sample only */
.sec-more {
  margin: 14px 16px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f4fbfa, #fff);
  border: 1px dashed #b2e4e1;
  border-radius: 14px;
  text-align: center;
}
.sec-more-text {
  font-size: 13px; font-weight: 800;
  color: #00a19a;
  letter-spacing: -0.2px;
  margin-bottom: 4px;
}
.sec-more-meta {
  font-size: 11.5px; font-weight: 600;
  color: #94a3b8;
  letter-spacing: -0.05px;
  line-height: 1.45;
}
</style>
