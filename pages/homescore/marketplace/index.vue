<template>
  <div class="mp-hub">
    <!-- App header -->
    <div class="app-header">
      <div class="app-header-logo">🏠</div>
      <div class="app-header-info">
        <div class="app-header-title">Marketplace</div>
        <div class="app-header-sub">Vetted home services · CV5</div>
      </div>
      <div class="app-header-right">
        <button class="app-icon-btn" type="button" aria-label="Messages" @click="goMessages">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16v14H4z" />
            <path d="M4 4l8 8 8-8" />
          </svg>
        </button>
        <button class="app-icon-btn profile" type="button" aria-label="Profile">M</button>
      </div>
    </div>

    <!-- Greeting -->
    <div class="mp-greet anim-1">
      <div class="mp-greet-hi">Good morning, Maxine</div>
      <div class="mp-greet-sub">6 EPC-matched jobs ready to brief · 2 supplier offers in</div>
    </div>

    <!-- Gamified hero -->
    <div class="mp-hero anim-1">
      <div class="mp-hero-top">
        <span class="mp-hero-eyebrow"><span class="live-dot" /> Your home journey</span>
        <span class="mp-hero-streak"><span class="flame">🔥</span> 12-day streak</span>
      </div>
      <div class="mp-hero-title">Level up 15 Woodfield Road</div>
      <div class="mp-hero-sub">Complete EPC quests · earn UPoints · climb the street</div>
      <div class="mp-hero-stats">
        <div class="mp-hero-stat">
          <div class="mp-hero-stat-ico">🎯</div>
          <div class="mp-hero-stat-num">{{ heroJobsDone }}/6</div>
          <div class="mp-hero-stat-label">Jobs done</div>
        </div>
        <div class="mp-hero-stat">
          <div class="mp-hero-stat-ico">💷</div>
          <div class="mp-hero-stat-num">£{{ heroSaved }}</div>
          <div class="mp-hero-stat-label">Saved /yr</div>
        </div>
        <div class="mp-hero-stat">
          <div class="mp-hero-stat-ico">🏆</div>
          <div class="mp-hero-stat-num">#{{ heroRank }}</div>
          <div class="mp-hero-stat-label">On street</div>
        </div>
      </div>
    </div>

    <!-- Daily quest -->
    <div class="mp-quest anim-2" @click="goPostJob">
      <div class="mp-quest-icon">📨</div>
      <div class="mp-quest-body">
        <div class="mp-quest-eyebrow">Today's quest</div>
        <div class="mp-quest-title">Post your cavity wall job</div>
        <div class="mp-quest-sub">4 verified suppliers will quote in 24h</div>
      </div>
      <div class="mp-quest-reward">
        <div class="mp-quest-reward-num">+50</div>
        <div class="mp-quest-reward-label">UPoints</div>
      </div>
    </div>

    <!-- Search -->
    <div class="hs-search-block anim-2">
      <div class="hs-search-wrap">
        <svg class="hs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" class="hs-search-input" type="text" placeholder="Search trades, services, suppliers" />
      </div>
    </div>

    <!-- EPC pathway match banner -->
    <div class="mp-match-banner anim-2" @click="goPathway">
      <div class="mp-match-icon">🎯</div>
      <div class="mp-match-body">
        <div class="mp-match-eyebrow">From your EPC pathway</div>
        <div class="mp-match-title">6 matched jobs · save £445/yr</div>
      </div>
      <div class="mp-match-arrow">›</div>
    </div>

    <!-- Post a job CTA -->
    <button class="mp-cta-big anim-2" type="button" @click="goPostJob">
      <div class="mp-cta-big-icon">+</div>
      <div class="mp-cta-big-text">
        <div class="mp-cta-big-title">Post a job</div>
        <div class="mp-cta-big-sub">Free · suppliers send quotes · paid via UProtect escrow</div>
      </div>
      <div class="mp-cta-big-arrow">›</div>
    </button>

    <!-- Categories -->
    <div class="section-h-row">
      <div class="section-h">Browse by category</div>
      <div class="section-h-sub">See all</div>
    </div>
    <div class="mp-cat-grid anim-3">
      <button
        v-for="c in categories"
        :key="c.id"
        class="mp-cat"
        type="button"
        @click="goMatched(c.id)"
      >
        <div class="mp-cat-icon">{{ c.icon }}</div>
        <div class="mp-cat-name">{{ c.name }}</div>
      </button>
    </div>

    <!-- Badges -->
    <div class="section-h-row">
      <div class="section-h">Your badges</div>
      <div class="section-h-sub">View all →</div>
    </div>
    <div class="mp-badges-wrap">
      <div class="mp-badges-scroll">
        <div
          v-for="b in badges"
          :key="b.id"
          class="mp-badge"
          :class="{ earned: b.earned, locked: !b.earned, new: b.isNew }"
        >
          <span class="mp-badge-ico">{{ b.icon }}</span>
          <div class="mp-badge-name">{{ b.name }}</div>
        </div>
      </div>
    </div>

    <!-- Matched suppliers -->
    <div class="section-h-row">
      <div class="section-h">Matched to your pathway</div>
      <div class="section-h-sub">{{ suppliers.length }} verified</div>
    </div>
    <div class="mp-card-list anim-3">
      <div
        v-for="s in suppliers.slice(0, 4)"
        :key="s.id"
        class="supplier-card"
        @click="goSupplier(s.id)"
      >
        <div class="sc-top">
          <div class="sc-avatar" :style="{ background: `linear-gradient(135deg, ${s.gradient[0]}, ${s.gradient[1]})` }">{{ s.initial }}</div>
          <div class="sc-info">
            <div class="sc-name-row">
              <span class="sc-name">{{ s.name }}</span>
              <span class="verified-badge">✓ Verified</span>
            </div>
            <div class="sc-rating">
              ★ <b>{{ s.rating }}</b> · {{ s.reviews }} reviews · {{ s.cert }}
              <template v-if="s.tier"> · {{ tierLabel(s.tier) }}</template>
            </div>
            <div class="sc-spec">{{ s.spec }}</div>
          </div>
        </div>
        <div class="sc-match">
          <div class="sc-match-label">Matches your pathway</div>
          <div class="sc-match-items">
            <span v-for="chip in s.matchChips" :key="chip" class="match-chip">{{ chip }}</span>
          </div>
        </div>
        <div class="sc-bottom">
          <div class="sc-price">{{ s.priceFrom }} <span>{{ s.priceSub }}</span></div>
          <button class="sc-cta" type="button">{{ s.ctaLabel }}</button>
        </div>
      </div>
    </div>

    <!-- Your activity -->
    <div class="section-h-row">
      <div class="section-h">Your activity</div>
      <div class="section-h-sub" @click="goJobs">See all</div>
    </div>
    <div class="mp-activity-wrap">
      <div
        v-for="j in jobs"
        :key="j.id"
        class="mp-activity-card"
        @click="goJobs"
      >
        <div class="mp-activity-icon" :class="j.status">{{ j.icon }}</div>
        <div class="mp-activity-body">
          <div class="mp-activity-title">{{ j.title }}</div>
          <div class="mp-activity-sub">{{ j.meta }}</div>
        </div>
        <span class="mp-activity-status" :class="j.status">{{ j.statusLabel }}</span>
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="mp-leaderboard anim-4">
      <div class="mp-leaderboard-h">
        <div class="mp-leaderboard-title">🏆 Woodfield Road leaderboard</div>
        <div class="mp-leaderboard-link">See all</div>
      </div>
      <div
        v-for="row in leaderboard"
        :key="row.rank"
        class="mp-lb-row"
        :class="{ you: row.isYou }"
      >
        <div class="mp-lb-medal">{{ row.medal }}</div>
        <div class="mp-lb-rank">{{ row.rank }}</div>
        <div class="mp-lb-name">{{ row.name }}</div>
        <div class="mp-lb-pts">{{ row.pts }} pts</div>
      </div>
    </div>

    <!-- UProtect explainer -->
    <div class="mp-uprotect-card anim-4">
      <div class="mp-uprotect-icon">🛡️</div>
      <div class="mp-uprotect-body">
        <div class="mp-uprotect-title">Every job covered by UProtect</div>
        <div class="mp-uprotect-sub">
          Payments held in escrow · released only when work is verified · all suppliers carry Public Liability cover.
        </div>
        <div class="mp-uprotect-bullets">
          <span class="mp-uprotect-chip">Escrow</span>
          <span class="mp-uprotect-chip">Refund if work fails</span>
          <span class="mp-uprotect-chip">Insured</span>
        </div>
      </div>
    </div>

    <!-- Tier teaser -->
    <div class="mp-tier-card anim-4">
      <div class="mp-tier-medal silver">🥈</div>
      <div class="mp-tier-body">
        <div class="mp-tier-eyebrow">Your tier · UPoints</div>
        <div class="mp-tier-title">Silver · 240 UPoints</div>
        <div class="mp-tier-progress">
          <div class="mp-tier-bar"><div class="mp-tier-bar-fill" /></div>
          <div class="mp-tier-progress-text"><b>260</b> to Gold</div>
        </div>
      </div>
      <div class="mp-tier-chev">›</div>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMarketplaceMock } from '~/composables/useMarketplaceMock'

const router = useRouter()
const route = useRoute()
const { suppliers, categories, jobs, messages: _messages, badges, leaderboard } = useMarketplaceMock()

const searchQuery = ref('')
const heroJobsDone = 2
const heroSaved = 309
const heroRank = 5

const propertyId = (route.query.property as string) || 'demo'

function tierLabel(tier: string) {
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} tier`
}
function goSupplier(id: string) {
  router.push(`/homescore/supplier/${id}`)
}
function goPostJob() {
  router.push(`/homescore/jobs/new`)
}
function goJobs() {
  router.push(`/homescore/jobs`)
}
function goMessages() {
  router.push(`/homescore/messages`)
}
function goPathway() {
  router.push(`/homescore/pathway/${propertyId}`)
}
function goMatched(category: string) {
  router.push(`/homescore/marketplace/${propertyId}?cat=${category}`)
}
</script>

<style scoped>
.mp-hub {
  --primary: #231d45;
  --primary-2: #352d5c;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-light: #00b8b0;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --page: #f0f2f8;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --warning: #f5a623;
  --warning-deep: #7a5500;
  --warning-pale: #fff5e0;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@keyframes mpFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes mpHeroPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.7; }
}
@keyframes mpLiveDot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
@keyframes mpFlame {
  0%, 100% { transform: rotate(-3deg) scale(1); }
  50% { transform: rotate(3deg) scale(1.1); }
}
@keyframes mpSparkle {
  0%, 100% { opacity: 0.25; transform: scale(0.85); }
  50% { opacity: 0.9; transform: scale(1.1); }
}
.anim-1 { animation: mpFadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-2 { animation: mpFadeUp 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-3 { animation: mpFadeUp 0.35s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-4 { animation: mpFadeUp 0.35s 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* App header */
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: var(--card);
  border-bottom: 1px solid var(--border);
}
.app-header-logo {
  font-size: 22px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.app-header-info {
  flex: 1;
  min-width: 0;
}
.app-header-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.15;
}
.app-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}
.app-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s;
  font-family: inherit;
}
.app-icon-btn:hover {
  background: var(--accent-paler);
  color: var(--accent-dark);
  border-color: var(--accent-pale);
}
.app-icon-btn svg { width: 16px; height: 16px; }
.app-icon-btn.profile {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border: none;
  color: white;
  font-weight: 800;
  font-size: 12px;
}

/* Greeting */
.mp-greet { padding: 14px 20px 4px; }
.mp-greet-hi {
  font-size: 21px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.4px;
  line-height: 1.1;
}
.mp-greet-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 3px;
}

/* Hero */
.mp-hero {
  position: relative;
  margin: 14px 20px 0;
  padding: 18px 18px 16px;
  background: linear-gradient(135deg, #231d45 0%, #352d5c 50%, #00a19a 130%);
  border-radius: 16px;
  color: white;
  overflow: hidden;
  box-shadow: 0 12px 32px -8px rgba(35, 29, 69, 0.35);
}
.mp-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 184, 176, 0.25) 0%, transparent 65%);
  pointer-events: none;
  animation: mpHeroPulse 4s ease-in-out infinite;
}
.mp-hero > * { position: relative; z-index: 1; }
.mp-hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.mp-hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  padding: 5px 11px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
}
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00b8b0;
  box-shadow: 0 0 8px #00b8b0;
  animation: mpLiveDot 1.4s infinite;
}
.mp-hero-streak {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 11px;
  border-radius: 100px;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #231d45;
  box-shadow: 0 4px 12px rgba(255, 140, 0, 0.35);
}
.flame {
  animation: mpFlame 0.9s ease-in-out infinite;
  display: inline-block;
}
.mp-hero-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
  line-height: 1.15;
}
.mp-hero-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 3px;
  line-height: 1.4;
}
.mp-hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;
}
.mp-hero-stat {
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 10px;
  text-align: center;
  backdrop-filter: blur(6px);
}
.mp-hero-stat-ico { font-size: 16px; margin-bottom: 3px; }
.mp-hero-stat-num {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.4px;
  line-height: 1;
  color: white;
}
.mp-hero-stat-label {
  font-size: 8.5px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 4px;
  line-height: 1.1;
}

/* Daily quest */
.mp-quest {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f2ebfd 0%, #ffffff 100%);
  border: 1.5px solid #c9b0f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  overflow: hidden;
}
.mp-quest:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(91, 55, 149, 0.15); }
.mp-quest::before {
  content: '✦';
  position: absolute;
  top: 8px;
  right: 14px;
  color: #5b3795;
  font-size: 14px;
  opacity: 0.4;
  animation: mpSparkle 2.2s ease-in-out infinite;
}
.mp-quest-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c6fb0, #5b3795);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(91, 55, 149, 0.3);
}
.mp-quest-body { flex: 1; min-width: 0; }
.mp-quest-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  color: #5b3795;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  line-height: 1.1;
}
.mp-quest-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-top: 3px;
  line-height: 1.2;
}
.mp-quest-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 2px;
}
.mp-quest-reward {
  text-align: right;
  flex-shrink: 0;
  padding-left: 6px;
}
.mp-quest-reward-num {
  font-size: 18px;
  font-weight: 800;
  color: #5b3795;
  letter-spacing: -0.3px;
  line-height: 1;
}
.mp-quest-reward-label {
  font-size: 8.5px;
  font-weight: 800;
  color: #5b3795;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Search */
.hs-search-block {
  margin: 14px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hs-search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 0 16px;
  box-shadow: var(--shadow-card);
}
.hs-search-icon {
  width: 18px;
  height: 18px;
  color: var(--accent);
  flex-shrink: 0;
}
.hs-search-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px 0;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  outline: none;
}
.hs-search-input::placeholder {
  color: var(--text-secondary);
  font-weight: 500;
}

/* Match banner */
.mp-match-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 20px 0;
  padding: 12px 14px;
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  border: 1.5px solid var(--accent);
  border-radius: 12px;
  cursor: pointer;
}
.mp-match-icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 161, 154, 0.18);
}
.mp-match-body { flex: 1; min-width: 0; }
.mp-match-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: 1px;
  text-transform: uppercase;
}
.mp-match-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-top: 3px;
}
.mp-match-arrow {
  font-size: 18px;
  color: var(--accent-dark);
  font-weight: 800;
  flex-shrink: 0;
}

/* Post-a-job CTA */
.mp-cta-big {
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 40px);
  margin: 14px 20px 0;
  padding: 16px;
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  box-shadow: 0 4px 16px rgba(35, 29, 69, 0.2);
}
.mp-cta-big-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 300;
  flex-shrink: 0;
}
.mp-cta-big-text { flex: 1; min-width: 0; }
.mp-cta-big-title { font-size: 15px; font-weight: 800; letter-spacing: -0.2px; }
.mp-cta-big-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 2px;
}
.mp-cta-big-arrow { font-size: 18px; opacity: 0.7; }

/* Section heading */
.section-h-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 18px 20px 10px;
}
.section-h {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.section-h-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-dark);
  cursor: pointer;
}

/* Categories */
.mp-cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 10px 20px 0;
}
.mp-cat {
  padding: 12px 6px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
  font-family: inherit;
}
.mp-cat:hover {
  border-color: var(--accent-pale);
  transform: translateY(-1px);
}
.mp-cat-icon { font-size: 22px; margin-bottom: 4px; line-height: 1.1; }
.mp-cat-name {
  font-size: 10px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: 0.1px;
  line-height: 1.2;
}

/* Badges */
.mp-badges-wrap { padding: 10px 0 0; }
.mp-badges-scroll {
  display: flex;
  gap: 10px;
  padding: 6px 20px 12px;
  overflow-x: auto;
}
.mp-badges-scroll::-webkit-scrollbar { display: none; }
.mp-badge {
  flex: 0 0 auto;
  width: 88px;
  padding: 12px 8px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  text-align: center;
  box-shadow: var(--shadow-card);
  position: relative;
  cursor: pointer;
}
.mp-badge.locked { opacity: 0.45; }
.mp-badge.new {
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
}
.mp-badge.new::after {
  content: 'NEW';
  position: absolute;
  top: -5px;
  right: -5px;
  padding: 2px 6px;
  background: var(--accent);
  color: white;
  font-size: 8px;
  font-weight: 800;
  border-radius: 100px;
  letter-spacing: 0.4px;
}
.mp-badge-ico { font-size: 26px; line-height: 1; margin-bottom: 5px; display: block; }
.mp-badge-name {
  font-size: 9.5px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
}
.mp-badge.locked .mp-badge-name { color: var(--text-faint); }

/* Supplier card */
.mp-card-list { padding: 0 20px; display: flex; flex-direction: column; gap: 10px; }
.supplier-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
}
.supplier-card:hover {
  border-color: var(--accent-pale);
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.08);
  transform: translateY(-1px);
}
.sc-top { display: flex; align-items: flex-start; gap: 12px; padding: 16px 16px 12px; }
.sc-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}
.sc-info { flex: 1; min-width: 0; }
.sc-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
  flex-wrap: wrap;
}
.sc-name { font-size: 14px; font-weight: 800; color: var(--text); letter-spacing: -0.2px; }
.verified-badge {
  font-size: 10px;
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
  padding: 2px 7px;
  border-radius: 100px;
  font-weight: 800;
}
.sc-rating {
  font-size: 11.5px;
  color: var(--text-secondary);
  font-weight: 600;
}
.sc-rating b { color: var(--text); font-weight: 800; }
.sc-spec { font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-top: 3px; }
.sc-match { padding: 0 16px 12px; }
.sc-match-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.sc-match-items { display: flex; gap: 6px; flex-wrap: wrap; }
.match-chip {
  font-size: 10.5px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 100px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  color: var(--accent-dark);
}
.sc-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--border-soft);
  background: var(--bg);
}
.sc-price { font-size: 13px; font-weight: 800; color: var(--text); }
.sc-price span { font-weight: 500; color: var(--text-secondary); }
.sc-cta {
  padding: 9px 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.25);
}

/* Activity */
.mp-activity-wrap { padding: 0 20px; display: flex; flex-direction: column; gap: 8px; }
.mp-activity-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  cursor: pointer;
}
.mp-activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.mp-activity-icon.live { background: var(--accent-paler); }
.mp-activity-icon.awaiting { background: var(--warning-pale); }
.mp-activity-body { flex: 1; min-width: 0; }
.mp-activity-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.1px;
  line-height: 1.2;
}
.mp-activity-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 2px;
}
.mp-activity-status {
  font-size: 9.5px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 100px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  flex-shrink: 0;
}
.mp-activity-status.live {
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
}
.mp-activity-status.awaiting {
  background: var(--warning-pale);
  color: var(--warning-deep);
  border: 1px solid rgba(245, 166, 35, 0.3);
}

/* Leaderboard */
.mp-leaderboard {
  padding: 12px 14px;
  margin: 14px 20px 0;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.mp-leaderboard-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.mp-leaderboard-title {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.mp-leaderboard-link {
  font-size: 11px;
  font-weight: 800;
  color: var(--accent-dark);
  cursor: pointer;
}
.mp-lb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  font-size: 11.5px;
}
.mp-lb-row + .mp-lb-row { border-top: 1px solid var(--border-soft); }
.mp-lb-row.you {
  background: var(--accent-paler);
  margin: 0 -8px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--accent-pale);
}
.mp-lb-row.you + .mp-lb-row { border-top: none; }
.mp-lb-medal { font-size: 13px; flex-shrink: 0; }
.mp-lb-rank {
  width: 24px;
  font-weight: 800;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.mp-lb-row.you .mp-lb-rank { color: var(--accent-dark); }
.mp-lb-name { flex: 1; font-weight: 700; color: var(--text); }
.mp-lb-pts { font-weight: 800; color: var(--text); flex-shrink: 0; }
.mp-lb-row.you .mp-lb-pts { color: var(--accent-dark); }

/* UProtect */
.mp-uprotect-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  border-radius: 14px;
  color: white;
  box-shadow: 0 8px 22px rgba(35, 29, 69, 0.18);
}
.mp-uprotect-icon {
  font-size: 24px;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mp-uprotect-body { flex: 1; min-width: 0; }
.mp-uprotect-title {
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: -0.1px;
  margin-bottom: 3px;
}
.mp-uprotect-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.5;
  margin-bottom: 8px;
}
.mp-uprotect-bullets { display: flex; flex-wrap: wrap; gap: 5px; }
.mp-uprotect-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
}

/* Tier teaser */
.mp-tier-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  box-shadow: var(--shadow-card);
}
.mp-tier-medal {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.mp-tier-medal.silver {
  background: linear-gradient(135deg, #e5e4e2, #a8a9ad);
  color: #3a3a3a;
}
.mp-tier-body { flex: 1; min-width: 0; }
.mp-tier-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.mp-tier-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-top: 2px;
}
.mp-tier-progress { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.mp-tier-bar {
  flex: 1;
  height: 6px;
  background: var(--bg);
  border-radius: 100px;
  border: 1px solid var(--border-soft);
  overflow: hidden;
}
.mp-tier-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 100px;
  width: 48%;
}
.mp-tier-progress-text {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;
}
.mp-tier-progress-text :deep(b) {
  color: var(--accent-dark);
  font-weight: 800;
}
.mp-tier-chev { font-size: 18px; color: var(--text-faint); }
</style>
