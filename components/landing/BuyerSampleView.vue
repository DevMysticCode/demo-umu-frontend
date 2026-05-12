<template>
  <!-- Visual-faithful copy of pages/buyer-passport/[id].vue. Hard-coded data,
       no API calls. Used inside the landing deck's "See a sample" sub-screen. -->
  <div class="buyer-page">
    <div class="buyer-card">
      <!-- Premium hero — passport book + identity + 3-cell stat strip -->
      <div class="buyer-hero-card">
        <div class="buyer-hero-glow" />
        <div class="buyer-hero-book">
          <PassportCard line1="55, Woodfield Road" line2="Coventry, CV5 6AJ" />
        </div>
        <div class="buyer-hero-info">
          <div class="buyer-hero-eyebrow">Verified Property Passport</div>
          <div class="buyer-hero-addr">55, Woodfield Road</div>
          <div class="buyer-hero-sub">Coventry, CV5 6AJ</div>
          <div class="buyer-hero-stats">
            <div class="buyer-hero-stat">
              <div class="buyer-hero-stat-val buyer-hero-stat-val--brand">74</div>
              <div class="buyer-hero-stat-lbl">HS</div>
            </div>
            <div class="buyer-hero-stat">
              <div class="buyer-hero-stat-val">38</div>
              <div class="buyer-hero-stat-lbl">Docs</div>
            </div>
            <div class="buyer-hero-stat">
              <div class="buyer-hero-stat-val buyer-hero-stat-val--ready">100%</div>
              <div class="buyer-hero-stat-lbl">Answered</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Address / Price -->
      <div class="buyer-title-block">
        <h1 class="buyer-address">55, Woodfield Road</h1>
        <p class="buyer-city">Coventry, CV5 6AJ</p>
        <p class="buyer-price">
          £420,000
          <span class="buyer-estimated">Estimated Value</span>
        </p>
        <button class="buyer-risk-pill risk-pill--ok" type="button">
          ✓ 100% complete · 0 red flags
        </button>
      </div>

      <!-- Badges -->
      <div class="buyer-badges">
        <span class="buyer-badge">
          <OPIcon name="bedroomWhite" class="w-[13px] h-[13px]" />
          4
        </span>
        <span class="buyer-badge">
          <OPIcon name="bathroomWhite" class="w-[13px] h-[13px]" />
          2
        </span>
        <span class="buyer-badge">House</span>
        <span class="buyer-badge">
          <OPIcon name="sqftWhite" class="w-[13px] h-[13px]" />
          1,406 sqft
        </span>
      </div>

      <!-- Property Details -->
      <div class="buyer-section">
        <h2 class="buyer-section-title">Property Details</h2>
        <p class="buyer-section-sub">
          Key characteristics that define this property.
        </p>
        <div class="buyer-details-card">
          <div class="buyer-details-grid">
            <div class="buyer-detail-item">
              <div class="buyer-detail-icon-wrap">
                <OPIcon name="buyerPropertyType" class="w-[20px] h-[20px]" />
              </div>
              <div>
                <p class="buyer-detail-label">Property type</p>
                <p class="buyer-detail-value">House</p>
              </div>
            </div>
            <div class="buyer-detail-item">
              <div class="buyer-detail-icon-wrap">
                <OPIcon name="buyerTitleNumber" class="w-[20px] h-[20px]" />
              </div>
              <div>
                <p class="buyer-detail-label">Title number</p>
                <p class="buyer-detail-value">WM854712</p>
              </div>
            </div>
            <div class="buyer-detail-item">
              <div class="buyer-detail-icon-wrap">
                <OPIcon name="buyerAreaSqft" class="w-[20px] h-[20px]" />
              </div>
              <div>
                <p class="buyer-detail-label">Area sqft</p>
                <p class="buyer-detail-value">1,406 sqft</p>
              </div>
            </div>
            <div class="buyer-detail-item">
              <div class="buyer-detail-icon-wrap">
                <OPIcon name="buyerEpcRating" class="w-[20px] h-[20px]" />
              </div>
              <div>
                <p class="buyer-detail-label">EPC Rating</p>
                <p class="buyer-detail-value">C</p>
              </div>
            </div>
            <div class="buyer-detail-item">
              <div class="buyer-detail-icon-wrap">
                <OPIcon name="buyerTenure" class="w-[20px] h-[20px]" />
              </div>
              <div>
                <p class="buyer-detail-label">Tenure</p>
                <p class="buyer-detail-value">Freehold</p>
              </div>
            </div>
            <div class="buyer-detail-item">
              <div class="buyer-detail-icon-wrap">
                <OPIcon name="buyerYearBuilt" class="w-[20px] h-[20px]" />
              </div>
              <div>
                <p class="buyer-detail-label">Year Built</p>
                <p class="buyer-detail-value">1968</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PDF Download -->
      <div class="buyer-pdf-row">
        <div class="buyer-pdf-info">
          <p class="buyer-pdf-title">Full Property Report</p>
          <p class="buyer-pdf-sub">
            All questions &amp; answers — share with solicitors
          </p>
        </div>
        <button class="buyer-pdf-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          Download PDF
        </button>
      </div>

      <!-- TA6 Form Download -->
      <div class="buyer-pdf-row buyer-ta6-row">
        <div class="buyer-pdf-info">
          <p class="buyer-pdf-title">TA6 Property Information Form</p>
          <p class="buyer-pdf-sub">
            Law Society 6th edition — pre-filled with passport data
          </p>
        </div>
        <button class="buyer-pdf-btn buyer-ta6-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Download TA6
        </button>
      </div>

      <!-- TA10 Fixtures & Fittings Form -->
      <div class="buyer-pdf-row buyer-ta10-row">
        <div class="buyer-pdf-info">
          <p class="buyer-pdf-title">TA10 Fixtures &amp; Fittings Form</p>
          <p class="buyer-pdf-sub">
            What stays, what goes — pre-filled from seller's passport
          </p>
        </div>
        <button class="buyer-pdf-btn buyer-ta10-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Download TA10
        </button>
      </div>

      <!-- Seller Completion Progress -->
      <div class="buyer-progress-card">
        <div class="buyer-progress-header">
          <span class="buyer-progress-label">Seller Completion</span>
          <span class="buyer-progress-pct">100%</span>
        </div>
        <div class="buyer-progress-track">
          <div class="buyer-progress-fill" :style="{ width: '100%' }" />
        </div>
        <p class="buyer-progress-hint">
          All sections completed by the seller.
        </p>
      </div>

      <!-- Official Records -->
      <div class="buyer-section">
        <h2 class="buyer-section-title">Official Records</h2>
        <p class="buyer-section-sub">
          Verified documents that define the legal and structural status of
          the property.
        </p>

        <!-- Search -->
        <div class="buyer-search-row">
          <div class="buyer-search-input">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" class="buyer-search-icon">
              <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2" />
              <path d="M21 21l-4.35-4.35" stroke="#999" stroke-width="2" stroke-linecap="round" />
            </svg>
            <input type="text" placeholder="Search Records..." />
          </div>
          <button class="buyer-sort-btn" type="button">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M3 6h18M6 12h12M9 18h6" stroke="#00a19a" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- Section completion summary -->
        <div class="buyer-summary-card">
          <div class="buyer-summary-row">
            <div class="buyer-summary-stat">
              <div class="buyer-summary-num buyer-summary-num--done">17</div>
              <div class="buyer-summary-lbl">Fully answered</div>
            </div>
            <div class="buyer-summary-stat">
              <div class="buyer-summary-num buyer-summary-num--partial">0</div>
              <div class="buyer-summary-lbl">Partially</div>
            </div>
            <div class="buyer-summary-stat">
              <div class="buyer-summary-num buyer-summary-num--empty">0</div>
              <div class="buyer-summary-lbl">Not yet shared</div>
            </div>
          </div>
          <p class="buyer-summary-hint">
            Sellers earn the most from completing every section. Tap any
            below to see what's been shared so far.
          </p>
        </div>

        <!-- Records List — sample shows 4 curated sections + "more" hint -->
        <div class="buyer-records-list">
          <div
            v-for="section in sections"
            :key="section.id"
            class="buyer-record-row state-complete"
          >
            <div class="buyer-record-icon">
              <OPIcon :name="section.key" class="w-[60px] h-[60px]" />
            </div>
            <div class="buyer-record-info">
              <h3 class="buyer-record-title">{{ section.title }}</h3>
              <p class="buyer-record-sub">{{ section.sub }}</p>
              <div class="buyer-record-meta">
                <span class="buyer-record-pill pill--complete">
                  ✓ Fully answered
                </span>
              </div>
              <div class="buyer-record-progress">
                <div class="buyer-record-track">
                  <div
                    class="buyer-record-fill fill--complete"
                    :style="{ width: '100%' }"
                  />
                </div>
                <span class="buyer-record-pct">100%</span>
              </div>
            </div>
            <button class="buyer-record-arrow" type="button">
              <OPIcon name="caretRight" class="w-[13px] h-[13px]" />
            </button>
          </div>

          <div class="sec-more">
            <div class="sec-more-text">+ 13 more sections</div>
            <div class="sec-more-meta">Occupiers · Services · Disputes · Insurance · Environmental · Parking · …</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OPIcon from '~/components/ui/OPIcon.vue'
import PassportCard from '~/components/passport-view/PassportCard.vue'

// Sample shows 4 curated sections — surrounding chrome (verified hero,
// property details, summary card, PDF rows) stays faithful to the real
// /buyer-passport/[id] page.
const sections = [
  { id: 1, key: 'titleDeedsAndPlan', title: 'Title Deeds and Plan', sub: 'Official copies and title plan.' },
  { id: 2, key: 'searches', title: 'Searches', sub: 'Local authority, water and environmental searches.' },
  { id: 3, key: 'fixturesAndFittings', title: 'Fixtures and Fittings', sub: 'What stays and what goes (TA10).' },
  { id: 4, key: 'boundaries', title: 'Boundaries', sub: 'Fences, walls and boundary responsibilities.' },
]
</script>

<style scoped>
.buyer-page {
  background: #f2f6f6;
  padding-bottom: 24px;
}

.buyer-card {
  position: relative;
  padding: 22px 20px 20px;
  background: #fff;
  color: #231d45;
}

/* ── Premium hero card — passport book + identity + stats strip ── */
.buyer-hero-card {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 14px;
  padding: 14px;
  margin: 4px 0 18px;
  background: linear-gradient(135deg, #f4fbfa, #f1f9f4);
  border: 1px solid #e2f1ea;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 140, 134, 0.1);
}
.buyer-hero-glow {
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.18), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.buyer-hero-book {
  width: 84px;
  flex-shrink: 0;
  filter: drop-shadow(0 6px 14px rgba(0, 140, 134, 0.28));
  position: relative;
  z-index: 1;
}
.buyer-hero-book :deep(.passport-card) { margin: 0; padding: 0; }
.buyer-hero-book :deep(.passport-container) { width: 100%; height: 110px; }
.buyer-hero-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}
.buyer-hero-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 4px;
}
.buyer-hero-addr {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.buyer-hero-sub {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 2px 0 10px;
}
.buyer-hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 140, 134, 0.1);
}
.buyer-hero-stat {
  text-align: center;
  padding: 0 4px;
}
.buyer-hero-stat + .buyer-hero-stat {
  border-left: 1px solid rgba(0, 140, 134, 0.08);
}
.buyer-hero-stat-val {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  line-height: 1;
  letter-spacing: -0.01em;
}
.buyer-hero-stat-val--brand { color: #00a19a; }
.buyer-hero-stat-val--ready { color: #00a19a; }
.buyer-hero-stat-lbl {
  font-size: 8.5px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 3px;
  font-weight: 700;
}

/* ── Title block ─────────────────────────────────────────────── */
.buyer-title-block { margin-bottom: 14px; }
.buyer-address {
  color: #231d45;
  font-weight: 800;
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}
.buyer-city {
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.01em;
  margin: 0 0 8px;
}
.buyer-price {
  color: #00a19a;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.01em;
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.buyer-estimated {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Risk pill ──────────────────────────────────────────────── */
.buyer-risk-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  padding: 5px 11px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid transparent;
  letter-spacing: -0.01em;
  font-family: inherit;
}
.risk-pill--ok {
  background: #d1fae5;
  color: #1f7a66;
  border-color: #a7f3d0;
}

/* ── Badges ──────────────────────────────────────────────────── */
.buyer-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.buyer-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f9f4;
  color: #00a19a;
  border: 1px solid #e2f1ea;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* ── Section heading ─────────────────────────────────────────── */
.buyer-section { margin-bottom: 24px; }
.buyer-section-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  margin: 0 0 4px;
  line-height: 1.3;
}
.buyer-section-sub {
  font-size: 12.5px;
  color: #94a3b8;
  margin: 0 0 12px;
  line-height: 1.45;
}

/* ── Details card ────────────────────────────────────────────── */
.buyer-details-card {
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.06), 0 2px 8px rgba(35, 29, 69, 0.04);
}
.buyer-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 14px;
  padding: 4px 0;
}
.buyer-detail-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.buyer-detail-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: #fff;
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.buyer-detail-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0 0 2px;
  line-height: 1.3;
}
.buyer-detail-value {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  margin: 0;
  letter-spacing: -0.01em;
}

/* ── Search ──────────────────────────────────────────────────── */
.buyer-search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.buyer-search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 10px 14px;
}
.buyer-search-input input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
}
.buyer-search-input input::placeholder { color: #999; }
.buyer-search-icon { flex-shrink: 0; }
.buyer-sort-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* ── Summary card ───────────────────────────────────────────── */
.buyer-summary-card {
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  border-radius: 14px;
  padding: 14px 14px 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.06), 0 2px 8px rgba(35, 29, 69, 0.04);
}
.buyer-summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}
.buyer-summary-stat {
  text-align: center;
  padding: 0 4px;
}
.buyer-summary-stat + .buyer-summary-stat {
  border-left: 1px solid rgba(0, 140, 134, 0.12);
}
.buyer-summary-num {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}
.buyer-summary-num--done { color: #16a34a; }
.buyer-summary-num--partial { color: #92400e; }
.buyer-summary-num--empty { color: #94a3b8; }
.buyer-summary-lbl {
  font-size: 9.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
}
.buyer-summary-hint {
  font-size: 11.5px;
  color: #4a5568;
  line-height: 1.5;
  margin: 0;
}

/* ── Records list ───────────────────────────────────────────── */
.buyer-records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.buyer-record-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 14px 12px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, transform 0.1s;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.06), 0 2px 8px rgba(35, 29, 69, 0.04);
}
.buyer-record-row.state-complete {
  border-color: #e2f1ea;
}
.buyer-record-icon {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.buyer-record-info {
  flex: 1;
  min-width: 0;
}
.buyer-record-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  line-height: 1.25;
  margin: 0 0 3px;
}
.buyer-record-sub {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 8px;
  line-height: 1.45;
}
.buyer-record-meta { margin-bottom: 6px; }
.buyer-record-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: 0.01em;
  white-space: nowrap;
  line-height: 1.4;
}
.pill--complete {
  background: #d1fae5;
  color: #1f7a66;
  border: 1px solid #a7f3d0;
}
.buyer-record-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
.buyer-record-track {
  flex: 1;
  height: 5px;
  background: #eef0f6;
  border-radius: 999px;
  overflow: hidden;
}
.buyer-record-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
.fill--complete { background: linear-gradient(90deg, #16a34a, #34d399); }
.buyer-record-pct {
  font-size: 11px;
  font-weight: 800;
  color: #4a5568;
  min-width: 32px;
  text-align: right;
  letter-spacing: -0.01em;
}
.buyer-record-arrow {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f8f7fc;
  border: 1px solid #eef0f6;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  color: #94a3b8;
  margin-top: 18px;
}

/* ── PDF rows ───────────────────────────────────────────────── */
.buyer-pdf-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #f0fffe;
  border: 1.5px solid #b2e4e1;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.buyer-pdf-info { flex: 1; min-width: 0; }
.buyer-pdf-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 2px;
}
.buyer-pdf-sub {
  font-size: 12px;
  color: #666;
  margin: 0;
}
.buyer-pdf-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.buyer-ta6-row {
  background: #f4f0ff;
  border-color: #c4b5e8;
}
.buyer-ta6-btn { background: #5a54d6; }
.buyer-ta10-row {
  background: #eef4ff;
  border-color: #b8cfee;
}
.buyer-ta10-btn { background: #2563eb; }

/* ── Progress card ──────────────────────────────────────────── */
.buyer-progress-card {
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  border-radius: 14px;
  padding: 14px 16px;
  margin: 4px 0 22px;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.06), 0 2px 8px rgba(35, 29, 69, 0.04);
}
.buyer-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.buyer-progress-label {
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
}
.buyer-progress-pct {
  font-size: 14px;
  font-weight: 800;
  color: #00a19a;
}
.buyer-progress-track {
  height: 6px;
  background: #eef0f6;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 8px;
}
.buyer-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #00b5ad);
  border-radius: 999px;
  transition: width 0.5s ease;
}
.buyer-progress-hint {
  font-size: 11.5px;
  color: #4a5568;
  margin: 0;
  line-height: 1.5;
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
  font-size: 13px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: -0.2px;
  margin-bottom: 4px;
}
.sec-more-meta {
  font-size: 11.5px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: -0.05px;
  line-height: 1.45;
}
</style>
