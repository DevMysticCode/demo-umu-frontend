<template>
  <div class="feature-stack">
    <!-- ── HealthScore card — soft teal ── -->
    <div class="feat-card healthscore" @click="$router.push('/homescore')">
      <div class="feat-top">
        <div class="feat-id">
          <div class="feat-id-tile">HS</div>
          <div class="feat-eyebrow">HealthScore</div>
        </div>
        <span class="feat-pill">Free</span>
      </div>
      <div class="feat-headline">Every property has a story.</div>
      <div class="feat-sub">
        Bills, value, comparisons, energy rating — scored 0–100 from public records. <b>Done in 60 seconds.</b>
      </div>

      <div class="feat-mid">
        <div class="feat-gauge">
          <svg viewBox="0 0 64 64">
            <circle class="g-bg" cx="32" cy="32" r="26" fill="none" stroke-width="6" />
            <circle class="g-fill" cx="32" cy="32" r="26" fill="none" stroke-width="6" stroke-dasharray="163.4" stroke-dashoffset="42.5" />
          </svg>
          <div class="g-num">
            <div class="gn-big">74</div>
            <div class="gn-small">HS</div>
          </div>
        </div>
        <div class="feat-stats">
          <div class="feat-stat-row">
            <span class="check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            Energy &amp; running costs
          </div>
          <div class="feat-stat-row">
            <span class="check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            Sold history &amp; estimate
          </div>
          <div class="feat-stat-row">
            <span class="check">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            Area comparison
          </div>
        </div>
      </div>

      <button class="feat-cta" @click.stop="$router.push('/homescore')">
        Run a HealthScore
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>

    <!-- ── Property Passport card — soft navy ── -->
    <div class="feat-card passport" @click="goToPassportSample">
      <div class="feat-top">
        <div class="feat-id">
          <div class="feat-id-tile mini-passport" aria-label="Property Passport">
            <div class="mp-head">Property<b>Passport</b></div>
            <div class="mp-house">
              <svg viewBox="0 0 32 32">
                <path d="M4 14 L16 5 L28 14 L28 26 Q28 27 27 27 L5 27 Q4 27 4 26 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                <text x="16" y="22" font-family="inherit" font-size="9" font-weight="800" fill="currentColor" text-anchor="middle" letter-spacing="-0.5">umu</text>
              </svg>
            </div>
            <div class="mp-addr">21, Rochester Rd<b>Coventry, CV5 6AB</b></div>
          </div>
          <div class="feat-eyebrow">Property Passport</div>
        </div>
        <span class="feat-pill">Solicitor-grade</span>
      </div>
      <div class="feat-headline">Every property has a history.</div>
      <div class="feat-sub">
        Title, planning, surveys, fittings — verified, organised, ready before any offer.
      </div>

      <div class="feat-mid">
        <div class="feat-book">
          <div class="feat-book-page">
            <div class="pg-head">Property<b>Passport</b></div>
            <div class="pg-line long" />
            <div class="pg-line med" />
            <div class="pg-line short" />
            <div class="pg-stamp">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div class="pg-num">p.3</div>
          </div>
        </div>
        <div class="feat-proof">
          <div class="feat-proof-stat">Sells <span class="num">12 weeks</span> faster on average</div>
          <div class="feat-proof-ticks">
            <div class="feat-proof-tick">
              <span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
              No <b>survey shocks</b>
            </div>
            <div class="feat-proof-tick">
              <span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
              No <b>title surprises</b>
            </div>
            <div class="feat-proof-tick">
              <span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg></span>
              No <b>12-week wait</b>
            </div>
          </div>
        </div>
      </div>

      <button class="feat-cta" @click.stop="goToPassportSample">
        See a sample Passport
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

function goToPassportSample() {
  // Landing page deck has the full sample passport viewer (seller / landlord / buyer)
  router.push('/?sample=seller')
}
</script>

<style scoped>
.feature-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.feat-card {
  border: 2px solid;
  border-radius: 20px;
  padding: 16px 16px 14px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.18s;
}
.feat-card:hover { transform: translateY(-2px); }

.feat-card.healthscore {
  background: linear-gradient(180deg, #f2faf8 0%, #fff 70%);
  border-color: #6bd4cd;
}
.feat-card.healthscore:hover {
  border-color: #00a19a;
  box-shadow: 0 10px 26px -8px rgba(0, 161, 154, 0.28);
}
.feat-card.passport {
  background: linear-gradient(180deg, rgba(35, 29, 69, 0.04) 0%, #fff 70%);
  border-color: rgba(35, 29, 69, 0.20);
}
.feat-card.passport:hover {
  border-color: #231d45;
  box-shadow: 0 10px 26px -8px rgba(35, 29, 69, 0.22);
}

.feat-card::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -25%;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  pointer-events: none;
}
.feat-card.healthscore::after {
  background: radial-gradient(circle, rgba(107, 212, 205, 0.30) 0%, transparent 65%);
}
.feat-card.passport::after {
  background: radial-gradient(circle, rgba(0, 161, 154, 0.14) 0%, transparent 65%);
}

.feat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
}
.feat-id {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}
.feat-id-tile {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.3px;
  position: relative;
  overflow: hidden;
}
.feat-card.healthscore .feat-id-tile {
  background: linear-gradient(135deg, #00b6ae 0%, #007e78 100%);
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.20);
}
.feat-card.passport .feat-id-tile {
  background: linear-gradient(135deg, #4a4566 0%, #231d45 100%);
  box-shadow: 0 3px 10px rgba(35, 29, 69, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Mini Property Passport tile */
.feat-id-tile.mini-passport {
  width: 28px;
  height: 36px;
  border-radius: 4px;
  background: linear-gradient(170deg, #00b6ae 0%, #00a19a 55%, #007e78 100%);
  padding: 3px 3px 2px 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  box-shadow: 0 3px 8px rgba(0, 161, 154, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.20);
}
.feat-id-tile.mini-passport::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.18), transparent);
}
.feat-id-tile.mini-passport .mp-head {
  font-size: 4px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  line-height: 1.1;
  text-align: left;
  position: relative;
  z-index: 1;
}
.feat-id-tile.mini-passport .mp-head b {
  display: block;
  font-size: 4.5px;
  letter-spacing: 0.2px;
  margin-top: 0.5px;
}
.feat-id-tile.mini-passport .mp-house {
  align-self: center;
  margin-top: -2px;
  width: 11px;
  height: 11px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.feat-id-tile.mini-passport .mp-house svg {
  width: 100%;
  height: 100%;
  color: #fff;
}
.feat-id-tile.mini-passport .mp-addr {
  font-size: 2.6px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.90);
  line-height: 1.25;
  letter-spacing: 0.05px;
  text-align: left;
  align-self: center;
  position: relative;
  z-index: 1;
}
.feat-id-tile.mini-passport .mp-addr b {
  display: block;
  font-weight: 800;
  font-size: 2.8px;
}

.feat-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.feat-card.healthscore .feat-eyebrow { color: #007e78; }
.feat-card.passport .feat-eyebrow { color: #231d45; }

.feat-pill {
  font-size: 9.5px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border: 1px solid;
}
.feat-card.healthscore .feat-pill {
  background: #00a19a;
  color: #fff;
  border-color: #00a19a;
}
.feat-card.passport .feat-pill {
  background: #231d45;
  color: #fff;
  border-color: #231d45;
}

.feat-headline {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
  line-height: 1.2;
  margin-bottom: 4px;
  position: relative;
  z-index: 2;
}
.feat-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.45;
  letter-spacing: -0.05px;
  margin-bottom: 14px;
  position: relative;
  z-index: 2;
}
.feat-sub b { color: #231d45; font-weight: 800; }

.feat-mid {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
  padding: 12px;
  background: #fff;
  border: 1px solid;
  border-radius: 14px;
  position: relative;
  z-index: 2;
}
.feat-card.healthscore .feat-mid { border-color: #e5f4f2; }
.feat-card.passport .feat-mid { border-color: rgba(35, 29, 69, 0.10); }

/* Mini gauge */
.feat-gauge {
  width: 56px;
  height: 56px;
  position: relative;
  flex-shrink: 0;
}
.feat-gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.feat-gauge .g-bg { stroke: #e5f4f2; }
.feat-gauge .g-fill { stroke: #00a19a; stroke-linecap: round; }
.feat-gauge .g-num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.feat-gauge .gn-big {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.5px;
  line-height: 1;
}
.feat-gauge .gn-small {
  font-size: 6.5px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-top: 2px;
}

.feat-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.feat-stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: #231d45;
  letter-spacing: -0.05px;
}
.feat-stat-row .check {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #00a19a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.feat-stat-row .check svg { width: 8px; height: 8px; }

/* Passport book preview */
.feat-book {
  width: 56px;
  height: 70px;
  flex-shrink: 0;
  position: relative;
}
.feat-book::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  width: 50px;
  height: 66px;
  background: linear-gradient(170deg, #00b6ae 0%, #00a19a 55%, #007e78 100%);
  border-radius: 3px 6px 6px 3px;
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.30), inset 0 1px 0 rgba(255, 255, 255, 0.20);
  transform: rotate(-4deg);
  transform-origin: bottom left;
}
.feat-book-page {
  position: absolute;
  right: 0;
  top: 0;
  width: 50px;
  height: 66px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ececef;
  box-shadow: 0 6px 14px rgba(35, 29, 69, 0.15), 0 1px 3px rgba(35, 29, 69, 0.06);
  padding: 5px 5px 5px 6px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transform: rotate(3deg);
  z-index: 2;
}
.feat-book-page .pg-head {
  font-size: 4.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  line-height: 1.1;
  padding-bottom: 3px;
  border-bottom: 0.5px solid #ececef;
}
.feat-book-page .pg-head b {
  display: block;
  font-size: 5.5px;
  margin-top: 1px;
  letter-spacing: 0.2px;
}
.feat-book-page .pg-line {
  height: 2px;
  background: #ececef;
  border-radius: 1px;
}
.feat-book-page .pg-line.short { width: 60%; }
.feat-book-page .pg-line.long { width: 100%; }
.feat-book-page .pg-line.med { width: 80%; }
.feat-book-page .pg-stamp {
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 24px;
  height: 24px;
  border: 1.2px solid #00a19a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00a19a;
  transform: rotate(-12deg);
  background: rgba(255, 255, 255, 0.92);
}
.feat-book-page .pg-stamp svg { width: 12px; height: 12px; }
.feat-book-page .pg-num {
  position: absolute;
  bottom: 3px;
  left: 5px;
  font-size: 4px;
  font-weight: 700;
  color: #9c98ad;
  letter-spacing: 0.2px;
}

.feat-proof {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.feat-proof-stat {
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.25px;
  line-height: 1.15;
}
.feat-proof-stat .num { color: #007e78; }
.feat-proof-ticks {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.feat-proof-tick {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 600;
  color: #6b6783;
  letter-spacing: -0.05px;
}
.feat-proof-tick .tick {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #00a19a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
}
.feat-proof-tick .tick svg { width: 7px; height: 7px; }
.feat-proof-tick b {
  color: #231d45;
  font-weight: 800;
}

.feat-cta {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  padding: 11px 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  letter-spacing: -0.1px;
  transition: all 0.15s;
  position: relative;
  z-index: 2;
  color: #fff;
}
.feat-card.healthscore .feat-cta {
  background: #00a19a;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.28);
}
.feat-card.healthscore .feat-cta:hover { background: #00b6ae; }
.feat-card.passport .feat-cta {
  background: #231d45;
  box-shadow: 0 3px 10px rgba(35, 29, 69, 0.28);
}
.feat-card.passport .feat-cta:hover { background: #1a1535; }
.feat-cta svg { width: 11px; height: 11px; }
</style>
