<template>
  <div class="hs-idx-page">
    <!-- ── Teal hero with gauge ──────────────────────────── -->
    <div class="hs-idx-hero">
      <div class="hs-idx-hero-glow"></div>
      <div class="hs-idx-topbar">
        <button class="hs-idx-back" @click="router.back()" aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="hs-idx-topbar-title">HealthScore™</div>
        <div class="hs-idx-topbar-spacer"></div>
      </div>
      <div class="hs-idx-gauge-wrap">
        <div class="hs-idx-gauge">
          <svg viewBox="0 0 160 100" width="160" height="100">
            <path d="M 16 90 A 64 64 0 0 1 144 90" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="10" stroke-linecap="round"/>
            <path d="M 16 90 A 64 64 0 0 1 144 90" fill="none" stroke="#5eead4" stroke-width="10" stroke-linecap="round" stroke-dasharray="201.1" stroke-dashoffset="70.4"/>
          </svg>
          <div class="hs-idx-gauge-overlay">
            <div class="hs-idx-gauge-num">65</div>
            <div class="hs-idx-gauge-sub">Average UK score</div>
          </div>
        </div>
      </div>
      <div class="hs-idx-hero-headline">
        <div class="hs-idx-hero-title">How energy efficient<br />is any UK property?</div>
        <div class="hs-idx-hero-sub">Instantly scored from public EPC data. If it's your home, a 2-minute quiz refines it into your real number.</div>
      </div>
    </div>

    <!-- ── Body ──────────────────────────────────────────── -->
    <div class="hs-idx-body">
      <!-- Search input — uses live dropdown that already shows passport pills + EPC -->
      <div class="hs-idx-search-block">
        <PropertySearchInput
          placeholder="Postcode or address…"
          variant="light"
          :show-passport-status="true"
          @select="goToScore($event.id)"
          @enter="onSearchEnter"
        />
      </div>
      <button class="hs-idx-cta" @click="onCheckClick">Check HealthScore™ →</button>
      <div class="hs-idx-cta-note">Free · Instant · No account needed</div>

      <!-- Feature rows -->
      <div class="hs-idx-feat-list">
        <div class="hs-idx-feat-row">
          <div class="hs-idx-feat-ic hs-idx-feat-ic--brand">⚡</div>
          <div>
            <div class="hs-idx-feat-title">Auto-scored instantly</div>
            <div class="hs-idx-feat-sub">From public EPC &amp; Land Registry data</div>
          </div>
        </div>
        <div class="hs-idx-feat-row">
          <div class="hs-idx-feat-ic hs-idx-feat-ic--amber">📋</div>
          <div>
            <div class="hs-idx-feat-title">Own it? Get your real score</div>
            <div class="hs-idx-feat-sub">2-minute quiz refines EPC data into your actual number</div>
          </div>
        </div>
        <div class="hs-idx-feat-row">
          <div class="hs-idx-feat-ic hs-idx-feat-ic--green">💰</div>
          <div>
            <div class="hs-idx-feat-title">See your savings potential</div>
            <div class="hs-idx-feat-sub">Real £/yr energy cost breakdown</div>
          </div>
        </div>
      </div>

      <div style="height: 40px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'

const router = useRouter()

const lastQuery = ref('')

function goToScore(id: string) {
  router.push(`/homescore/${id}`)
}

function onSearchEnter(q: string) {
  lastQuery.value = q
  // Pressing enter with no dropdown selection — keep the user on this page;
  // the live dropdown already shows results as they type.
}

function onCheckClick() {
  // The PropertySearchInput is the source of truth for the entered text.
  // If the user typed nothing, focus it; otherwise nothing to do — they pick
  // a property from the dropdown.
  const input = document.querySelector<HTMLInputElement>(
    '.hs-idx-search-block input',
  )
  if (input) input.focus()
}
</script>

<style scoped>
/* ── Page ─────────────────────────────────────────────── */
.hs-idx-page {
  min-height: 100dvh;
  background: #fff;
  color: #1a1a2e;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Teal hero ───────────────────────────────────────── */
.hs-idx-hero {
  background: linear-gradient(160deg, #00a19a 0%, #008c86 55%, #006b66 100%);
  padding: 20px 20px 28px;
  padding-top: calc(20px + env(safe-area-inset-top));
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.hs-idx-hero-glow {
  position: absolute;
  right: -40px;
  top: -40px;
  width: 180px;
  height: 180px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.12),
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
}
.hs-idx-topbar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}
.hs-idx-back {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
}
.hs-idx-back:active {
  background: rgba(255, 255, 255, 0.25);
}
.hs-idx-topbar-title {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}
.hs-idx-topbar-spacer {
  width: 32px;
}

.hs-idx-gauge-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}
.hs-idx-gauge {
  position: relative;
  width: 160px;
  height: 100px;
}
.hs-idx-gauge-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 4px;
}
.hs-idx-gauge-num {
  font-size: 42px;
  font-weight: 900;
  color: #fff;
  line-height: 1;
  letter-spacing: -2px;
}
.hs-idx-gauge-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 600;
  margin-top: 2px;
}
.hs-idx-hero-headline {
  text-align: center;
  position: relative;
  z-index: 1;
}
.hs-idx-hero-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}
.hs-idx-hero-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.55;
}

/* ── Body ─────────────────────────────────────────────── */
.hs-idx-body {
  flex: 1;
  padding: 20px 20px 0;
}
.hs-idx-search-block {
  margin-bottom: 14px;
}
.hs-idx-cta {
  width: 100%;
  border: none;
  background: #00a19a;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  padding: 15px;
  border-radius: 14px;
  cursor: pointer;
  font-family: inherit;
  letter-spacing: -0.01em;
  margin-bottom: 6px;
  transition: background 0.15s ease;
}
.hs-idx-cta:active {
  background: #008c86;
}
.hs-idx-cta-note {
  text-align: center;
  font-size: 11.5px;
  color: #94a3b8;
  margin-bottom: 24px;
}

/* ── Feature rows ─────────────────────────────────────── */
.hs-idx-feat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hs-idx-feat-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1.5px solid #e8e8f0;
  border-radius: 14px;
}
.hs-idx-feat-ic {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 20px;
}
.hs-idx-feat-ic--brand {
  background: #f0fdfa;
}
.hs-idx-feat-ic--amber {
  background: #fef3c7;
}
.hs-idx-feat-ic--green {
  background: #f0fdf4;
}
.hs-idx-feat-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1a1a2e;
}
.hs-idx-feat-sub {
  font-size: 12px;
  color: #4a4a6a;
  margin-top: 2px;
  line-height: 1.45;
}
</style>
