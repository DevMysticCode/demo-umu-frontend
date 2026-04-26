<template>
  <div class="mp-page">
    <!-- Sticky header -->
    <div class="mp-header">
      <button class="mp-back" @click="goBack" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <polyline
            points="15 18 9 12 15 6"
            stroke="#231d45"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <div class="mp-header-title">Buyer Profile</div>
      <div class="mp-free-pill">Free</div>
    </div>

    <div class="mp-scroll">
      <!-- Hero -->
      <div class="mp-hero">
        <div class="mp-hero-circle" />
        <div class="mp-hero-ic">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5eead4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="mp-hero-eyebrow">Buyer Profile</div>
        <div class="mp-hero-title">Prove you're the<br />buyer they want</div>
        <div class="mp-hero-body">
          One verified document. Share with any agent, seller or solicitor. Skip
          the endless back-and-forth and stand out in every offer.
        </div>
      </div>

      <!-- What's inside -->
      <div class="mp-section-title">What goes in your Passport</div>
      <div class="mp-list-card">
        <div class="mp-list-row">
          <div class="mp-list-ic mp-ic-teal">🪪</div>
          <div class="mp-list-body">
            <div class="mp-list-title">Verified identity</div>
            <div class="mp-list-sub">Photo ID + liveness check — done once</div>
          </div>
          <div class="mp-pill mp-pill-teal">Required</div>
        </div>
        <div class="mp-list-row">
          <div class="mp-list-ic mp-ic-green">🏦</div>
          <div class="mp-list-body">
            <div class="mp-list-title">Proof of funds</div>
            <div class="mp-list-sub">Mortgage in principle or bank statement</div>
          </div>
          <div class="mp-pill mp-pill-green">Required</div>
        </div>
        <div class="mp-list-row">
          <div class="mp-list-ic mp-ic-amber">🔗</div>
          <div class="mp-list-body">
            <div class="mp-list-title">Chain position</div>
            <div class="mp-list-sub">First time buyer, chain-free, or selling</div>
          </div>
          <div class="mp-pill mp-pill-amber">Required</div>
        </div>
        <div class="mp-list-row">
          <div class="mp-list-ic mp-ic-purple">⚖️</div>
          <div class="mp-list-body">
            <div class="mp-list-title">Solicitor instructed</div>
            <div class="mp-list-sub">Have you appointed a conveyancer?</div>
          </div>
          <div class="mp-pill mp-pill-purple">Optional</div>
        </div>
        <div class="mp-list-row mp-list-row-last">
          <div class="mp-list-ic mp-ic-amber">✍️</div>
          <div class="mp-list-body">
            <div class="mp-list-title">Buyer statement</div>
            <div class="mp-list-sub">Who you are and why this type of home</div>
          </div>
          <div class="mp-pill mp-pill-amber">Optional</div>
        </div>
      </div>

      <!-- Why it works -->
      <div class="mp-why-card">
        <div class="mp-why-title">Why agents and sellers prefer verified buyers</div>
        <div class="mp-why-bullets">
          <div class="mp-why-row">
            <div class="mp-why-dot" />
            <span>Agents spend less time chasing documents — your offer moves faster</span>
          </div>
          <div class="mp-why-row">
            <div class="mp-why-dot" />
            <span>Sellers choose buyers they trust — a Passport builds that trust before you meet</span>
          </div>
          <div class="mp-why-row">
            <div class="mp-why-dot" />
            <span>In sealed bids, a verified buyer with proof of funds stands out immediately</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <button class="mp-cta" @click="goToBuild">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{{ hasProgress ? 'Continue my Profile' : 'Build my Buyer Profile' }}</span>
      </button>
      <div class="mp-cta-sub">Free · Takes about 5 minutes · Share instantly</div>

      <div style="height: 32px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuyerProfile } from '~/composables/useBuyerProfile'

const router = useRouter()
const { getBuyerProfile } = useBuyerProfile()

const existing = ref<any>(null)
const loading = ref(true)

const hasProgress = computed(() => {
  const p = existing.value
  if (!p) return false
  return !!(
    p.idDocumentType ||
    p.fundsType ||
    p.chainPosition ||
    p.solicitorStatus ||
    p.timeline ||
    p.statement
  )
})

function goBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/explore')
  }
}

function goToBuild() {
  router.push('/buyer-profile/build')
}

onMounted(async () => {
  try {
    const data = await getBuyerProfile()
    existing.value = data
    // If already published, jump straight to the view
    if (data?.published) {
      router.replace('/buyer-profile/view')
      return
    }
  } catch {
    /* token may be missing — stay on intro */
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.mp-page {
  min-height: 100dvh;
  background: #fff;
  color: #1f2024;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Header ────────────────────────────────────────────── */
.mp-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 12px;
  padding-top: calc(16px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.mp-back {
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mp-header-title {
  flex: 1;
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.mp-free-pill {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  color: #00a19a;
}

/* ── Scroll ────────────────────────────────────────────── */
.mp-scroll {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* ── Hero ──────────────────────────────────────────────── */
.mp-hero {
  background: linear-gradient(135deg, #231d45 0%, #1e1b4b 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.mp-hero-circle {
  position: absolute;
  right: -20px;
  bottom: -20px;
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}
.mp-hero-ic {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 56px;
  height: 56px;
  background: rgba(94, 234, 212, 0.12);
  border: 1.5px solid rgba(94, 234, 212, 0.2);
  border-radius: 16px;
  display: grid;
  place-items: center;
}
.mp-hero-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 8px;
}
.mp-hero-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 10px;
  letter-spacing: -0.03em;
}
.mp-hero-body {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.65;
}

/* ── Section title ─────────────────────────────────────── */
.mp-section-title {
  font-size: 14px;
  font-weight: 800;
  color: #1f2024;
  margin-bottom: 12px;
}

/* ── List card ─────────────────────────────────────────── */
.mp-list-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
}
.mp-list-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  border-bottom: 1px solid #e5e7eb;
}
.mp-list-row-last {
  border-bottom: none;
}
.mp-list-ic {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 18px;
}
.mp-ic-teal {
  background: #f0fdfa;
}
.mp-ic-green {
  background: #f0fdf4;
}
.mp-ic-amber {
  background: #fef9f0;
}
.mp-ic-purple {
  background: #f5f3ff;
}
.mp-list-body {
  flex: 1;
  min-width: 0;
}
.mp-list-title {
  font-size: 13px;
  font-weight: 700;
  color: #1f2024;
}
.mp-list-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}
.mp-pill {
  font-size: 10px;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
  flex-shrink: 0;
}
.mp-pill-teal {
  color: #00a19a;
  background: #f0fdfa;
}
.mp-pill-green {
  color: #16a34a;
  background: #f0fdf4;
}
.mp-pill-amber {
  color: #d97706;
  background: #fef9f0;
}
.mp-pill-purple {
  color: #7c3aed;
  background: #f5f3ff;
}

/* ── Why it works ──────────────────────────────────────── */
.mp-why-card {
  background: #f0fdfa;
  border: 1.5px solid #99f6e4;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 20px;
}
.mp-why-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 8px;
}
.mp-why-bullets {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mp-why-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: #334155;
  line-height: 1.5;
}
.mp-why-dot {
  width: 5px;
  height: 5px;
  background: #00a19a;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}

/* ── CTA ───────────────────────────────────────────────── */
.mp-cta {
  width: 100%;
  border: none;
  padding: 15px;
  border-radius: 14px;
  background: #00a19a;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.01em;
}
.mp-cta:active {
  background: #008c86;
}
.mp-cta-sub {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 8px;
}
</style>
