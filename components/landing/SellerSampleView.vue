<template>
  <!-- Visual-faithful copy of pages/passportview/[id].vue (sections tab, list view).
       Hard-coded data, no API calls, no router logic. Used inside the landing
       deck's "See a sample" sub-screen so visitors get the real visual. -->
  <div class="passport-content">
    <!-- ── Premium Passport hero — book on left, dashboard on right ── -->
    <div class="pp-hero">
      <div class="pp-hero-glow" />
      <div class="pp-hero-book">
        <PassportCard line1="55, Woodfield Road" line2="Coventry, CV5 6AJ" />
      </div>
      <div class="pp-hero-info">
        <div class="pp-hero-eyebrow">Property Passport</div>
        <div class="pp-hero-addr-row">
          <div class="pp-hero-addr-text">
            <div class="pp-hero-addr-l1">55, Woodfield Road</div>
            <div class="pp-hero-addr-l2">Coventry, CV5 6AJ</div>
          </div>
          <button class="pp-hero-switch" type="button">
            <OPIcon name="caretDown" class="w-[16px] h-[16px]" />
          </button>
        </div>
        <div class="pp-hero-stats">
          <div class="pp-hero-stat">
            <div class="pp-hero-stat-val">74</div>
            <div class="pp-hero-stat-lbl">HS™</div>
          </div>
          <div class="pp-hero-stat">
            <div class="pp-hero-stat-val">38</div>
            <div class="pp-hero-stat-lbl">Docs</div>
          </div>
          <div class="pp-hero-stat">
            <div class="pp-hero-stat-val">17/17</div>
            <div class="pp-hero-stat-lbl">Sections</div>
          </div>
        </div>
        <div class="pp-hero-dash">
          <div class="pp-hero-dash-row">
            <span class="pp-hero-dash-label">Passport progress</span>
            <span class="pp-hero-dash-pct">100%</span>
          </div>
          <div class="pp-hero-dash-bar">
            <div class="pp-hero-dash-fill" :style="{ width: '100%' }">
              <OPIcon name="progressMan" class="pp-hero-dash-man" />
            </div>
          </div>
          <div class="pp-hero-dash-issued">
            <span class="pp-hero-dash-dot" />
            Passport issued
          </div>
        </div>
      </div>
    </div>

    <!-- ── Action row — Match to Buyers / Publish ── -->
    <div class="pp-action-row">
      <button class="pp-action-btn pp-action-outline" type="button">
        <OPIcon name="matchToBuyers" class="w-[15px] h-[15px]" />
        Match to Buyers
        <span class="pp-action-badge">3</span>
      </button>
      <button class="pp-action-btn pp-action-primary" type="button">
        <OPIcon name="share" class="w-[15px] h-[15px]" />
        Published
      </button>
    </div>

    <!-- ── Collaborators row ── -->
    <div class="pp-collab-row">
      <button class="pp-collab-add" type="button">+</button>
      <div class="pp-collab-stack">
        <div class="pp-collab-avatar">SH</div>
        <div class="pp-collab-avatar">MR</div>
      </div>
      <div class="pp-collab-text">2 Collaborators</div>
      <span class="pp-collab-chev">›</span>
    </div>

    <!-- ── Sub-tabs ── -->
    <div class="pp-subtabs">
      <button class="pp-subtab active" type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        Sections
      </button>
      <button class="pp-subtab" type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="1 6 9 2 15 6 23 2 23 18 15 22 9 18 1 22 1 6" />
          <line x1="9" y1="2" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="22" />
        </svg>
        Street
      </button>
      <button class="pp-subtab" type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Buyers
        <span class="pp-subtab-badge">3</span>
      </button>
    </div>

    <!-- ── List / Map sub-toggle ── -->
    <div class="view-toggle">
      <button class="toggle-btn active" type="button">
        <OPIcon name="list" class="w-[14px] h-[14px]" />
        List
      </button>
      <button class="toggle-btn" type="button">
        <OPIcon name="map" class="w-[14px] h-[14px]" />
        Map
      </button>
    </div>

    <!-- ── Steps list — sample shows 4 curated sections + "more" hint ── -->
    <div class="steps-list">
      <div v-for="step in steps" :key="step.id" class="step-card">
        <div class="step-icon-container">
          <div class="step-icon-bg">
            <OPIcon :name="step.key" class="w-[80px] h-[80px]" />
          </div>
        </div>
        <div class="step-info">
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-points">{{ step.points }} points earned so far</p>
          <div class="step-counts">
            <span class="step-count-pill step-count-docs">📎 {{ step.docs }} docs</span>
            <span class="step-count-pill step-count-q">❓ {{ step.questions }} questions</span>
          </div>
          <div class="step-progress">
            <div class="progress-bar small">
              <div class="progress-fill" :style="{ width: step.progress + '%' }" />
            </div>
            <span class="progress-percentage">{{ step.progress }}%</span>
          </div>
        </div>
        <button class="step-arrow" type="button">
          <OPIcon name="caretRight" class="w-[13px] h-[13px]" />
        </button>
      </div>

      <div class="sec-more">
        <div class="sec-more-text">+ 13 more sections</div>
        <div class="sec-more-meta">Occupiers · Services · Disputes · Insurance · Environmental · Parking · …</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OPIcon from '~/components/ui/OPIcon.vue'
import PassportCard from '~/components/passport-view/PassportCard.vue'

// Sample shows 4 curated sections — keeps the demo scannable while the
// surrounding chrome (hero, dashboard, action row, collaborators, subtabs)
// stays faithful to the real /passportview/[id] page.
const steps = [
  { id: 1, key: 'titleDeedsAndPlan', title: 'Title Deeds and Plan', points: 100, docs: '2/2', questions: '3/3', progress: 100 },
  { id: 2, key: 'searches', title: 'Searches', points: 90, docs: '3/3', questions: '4/4', progress: 100 },
  { id: 3, key: 'fixturesAndFittings', title: 'Fixtures and Fittings', points: 100, docs: '24/24', questions: '6/6', progress: 100 },
  { id: 4, key: 'boundaries', title: 'Boundaries', points: 80, docs: '1/1', questions: '3/3', progress: 100 },
]
</script>

<style scoped>
.passport-content {
  padding: 16px;
  background: #fff;
}

/* ── Premium Passport hero ──────────────────────── */
.pp-hero {
  background:
    radial-gradient(circle at 18% 30%, rgba(0, 161, 154, 0.08), transparent 50%),
    radial-gradient(circle at 90% 90%, rgba(35, 29, 69, 0.04), transparent 50%),
    linear-gradient(180deg, #f4fbfa 0%, #fff 100%);
  border: 1px solid #e2f1ea;
  border-radius: 18px;
  padding: 18px 16px 16px;
  margin-bottom: 14px;
  display: flex;
  align-items: stretch;
  gap: 14px;
  position: relative;
  overflow: hidden;
}
.pp-hero-glow {
  position: absolute;
  top: 12px; right: 12px;
  width: 40px; height: 40px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.18), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.pp-hero-book {
  width: 104px;
  flex-shrink: 0;
  display: flex; align-items: stretch; justify-content: center;
  filter: drop-shadow(0 8px 18px rgba(0, 140, 134, 0.28));
}
.pp-hero-book :deep(.passport-card) { padding: 0; margin: 0; width: 100%; min-width: 0; }
.pp-hero-book :deep(.passport-container) { width: 100%; height: 140px; }
.pp-hero-book :deep(.passport-image) { width: 100%; height: 100%; }

.pp-hero-info {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative; z-index: 1;
}
.pp-hero-eyebrow {
  font-size: 9.5px; font-weight: 800;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #00a19a; margin-bottom: 4px;
}
.pp-hero-addr-row { display: flex; align-items: flex-start; gap: 6px; }
.pp-hero-addr-text { flex: 1; min-width: 0; }
.pp-hero-addr-l1 { font-size: 16px; font-weight: 800; color: #231d45; line-height: 1.2; }
.pp-hero-addr-l2 { font-size: 11.5px; color: #94a3b8; margin-top: 2px; }
.pp-hero-switch {
  width: 26px; height: 26px;
  border-radius: 50%; background: #f1f9f4;
  border: 1px solid #e2f1ea; color: #00a19a;
  display: grid; place-items: center;
  flex-shrink: 0; cursor: pointer;
  font-family: inherit;
}
.pp-hero-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  margin-top: 10px;
}
.pp-hero-stat { text-align: center; padding: 0 4px; }
.pp-hero-stat + .pp-hero-stat { border-left: 1px solid rgba(35, 29, 69, 0.08); }
.pp-hero-stat-val { font-size: 16px; font-weight: 800; color: #231d45; line-height: 1; }
.pp-hero-stat-lbl {
  font-size: 7.5px; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-top: 3px; font-weight: 700;
}

.pp-hero-dash { margin-top: 10px; }
.pp-hero-dash-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.pp-hero-dash-label {
  font-size: 9.5px; font-weight: 800;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #4a5568;
}
.pp-hero-dash-pct { color: #00a19a; font-weight: 800; font-size: 13px; }
.pp-hero-dash-bar {
  height: 6px; background: #eef0f6;
  border-radius: 999px; position: relative; overflow: visible;
}
.pp-hero-dash-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #00b5ad);
  border-radius: 999px; position: relative;
}
.pp-hero-dash-man {
  position: absolute; right: -10px; top: 50%;
  transform: translateY(-50%);
  width: 22px !important; height: 22px !important;
  pointer-events: none;
}
.pp-hero-dash-issued {
  display: flex; align-items: center; gap: 5px;
  font-size: 9.5px; color: #94a3b8;
  font-weight: 600; margin-top: 7px;
}
.pp-hero-dash-dot {
  width: 5px; height: 5px;
  border-radius: 50%; background: #00a19a;
  box-shadow: 0 0 0 2.5px #f1f9f4;
}

/* ── Action row ──────────────────────── */
.pp-action-row {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 8px; margin-bottom: 12px;
}
.pp-action-btn {
  border: none; border-radius: 12px;
  padding: 11px 12px; cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.pp-action-outline { background: #fff; color: #231d45; border: 1.5px solid #eef0f6; }
.pp-action-primary { background: #00a19a; color: #fff; box-shadow: 0 4px 14px rgba(0, 161, 154, 0.28); }
.pp-action-badge {
  background: #00a19a; color: #fff;
  font-size: 10px; font-weight: 800;
  padding: 1px 6px; border-radius: 999px;
}
.pp-action-primary .pp-action-badge { background: #fff; color: #00a19a; }

/* ── Collaborators ──────────────────────── */
.pp-collab-row {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border: 1px solid #eef0f6;
  border-radius: 12px; padding: 10px 12px;
  margin-bottom: 14px; cursor: pointer;
}
.pp-collab-add {
  width: 28px; height: 28px;
  border-radius: 50%; background: #f1f9f4;
  border: 1px solid #e2f1ea; color: #00a19a;
  font-size: 16px; font-weight: 600;
  display: grid; place-items: center;
  flex-shrink: 0; cursor: pointer;
  font-family: inherit; padding: 0; line-height: 1;
}
.pp-collab-stack { display: flex; margin-left: -4px; }
.pp-collab-avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00b5ad, #00a19a);
  color: #fff; font-size: 10px; font-weight: 800;
  display: grid; place-items: center;
  border: 2px solid #fff; margin-left: -8px;
}
.pp-collab-text { font-size: 12.5px; color: #4a5568; font-weight: 600; flex: 1; }
.pp-collab-chev { color: #94a3b8; font-size: 18px; font-weight: 600; }

/* ── Sub-tabs ──────────────────────── */
.pp-subtabs {
  display: flex; background: #fff;
  border: 1px solid #eef0f6; border-radius: 12px;
  padding: 4px; margin-bottom: 12px;
}
.pp-subtab {
  flex: 1; border: none; background: transparent;
  padding: 9px 8px; border-radius: 9px;
  cursor: pointer; font-family: inherit;
  font-size: 12px; font-weight: 700;
  color: #94a3b8;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.pp-subtab.active {
  background: #00a19a; color: #fff;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.28);
}
.pp-subtab-badge {
  background: #00a19a; color: #fff;
  font-size: 10px; font-weight: 800;
  padding: 1px 6px; border-radius: 999px; margin-left: 2px;
}
.pp-subtab.active .pp-subtab-badge { background: #fff; color: #00a19a; }

/* ── View toggle ──────────────────────── */
.view-toggle { display: flex; gap: 16px; margin: 16px 0 16px; }
.toggle-btn {
  flex: 1; padding: 12px;
  border: 1px solid #e0e0e0; background: #fff;
  border-radius: 12px;
  font-size: 14px; font-weight: 600; color: #666;
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.toggle-btn.active {
  background: #00a19a; color: #fff; border-color: #00a19a;
}

/* ── Steps list ──────────────────────── */
.steps-list { display: flex; flex-direction: column; gap: 12px; }
.step-card {
  display: flex; align-items: center; gap: 16px;
  padding: 16px; background: #fff;
  border-radius: 16px; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.step-icon-container { flex-shrink: 0; }
.step-icon-bg {
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
}
.step-info { flex: 1; }
.step-title {
  font-size: 15px; font-weight: 400;
  line-height: 20px; letter-spacing: -0.23px;
  color: #000;
}
.step-points {
  font-size: 12px; line-height: 16px;
  color: #00a19a; font-weight: 400;
}
.step-counts {
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;
}
.step-count-pill {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-weight: 700;
  padding: 2px 8px; border-radius: 999px;
  white-space: nowrap; line-height: 1.4;
}
.step-count-docs { background: #f1f9f4; color: #00a19a; border: 1px solid #e2f1ea; }
.step-count-q { background: #f1f5f9; color: #4a5568; border: 1px solid #eef0f6; }

.step-progress {
  display: flex; align-items: center; gap: 8px; margin-top: 8px;
}
.progress-bar {
  flex: 1; height: 4px;
  background: #eef0f6; border-radius: 999px; overflow: hidden;
}
.progress-bar.small { height: 4px; }
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #00b5ad);
  border-radius: 999px;
}
.progress-percentage {
  font-size: 11px; font-weight: 800; color: #00a19a;
  flex-shrink: 0; min-width: 28px; text-align: right;
}
.step-arrow {
  background: transparent; border: none;
  cursor: pointer; padding: 4px;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8;
}

/* "+ N more sections" footer hint — sample only */
.sec-more {
  margin-top: 4px;
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
