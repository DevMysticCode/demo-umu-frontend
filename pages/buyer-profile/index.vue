<template>
  <div class="mp-page">
    <!-- Top nav: back + eyebrow pill + sign-in/save -->
    <div class="mp-top-nav">
      <button class="mp-back" @click="goBack" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div class="mp-nav-centre">
        <div class="eyebrow-pill">
          <span class="eyebrow-dot" />Buyer Profile
        </div>
      </div>
      <div style="width: 36px" />
    </div>

    <!-- ── Hero ─────────────────────────────────────────── -->
    <div class="mp-hero-head">
      <h1 class="mp-hero-title">Stand out as a serious buyer</h1>
      <p class="mp-hero-sub">
        Verified buyers get 3× more offers accepted. Build your profile in
        about 5 minutes.
      </p>
    </div>

    <!-- ── Hero card (prototype-exact gradient + shimmer) ── -->
    <div class="mp-hero-wrap">
      <div class="hero-card" @click="goToBuild">
        <div class="hero-eyebrow">UMU Buyer Profile</div>
        <div class="hero-tagline">"Trusted, ready,<br />chain-free."</div>
        <div class="hero-name">{{ heroName }}</div>
        <div class="hero-pills">
          <div class="hero-pill">🪪 ID Verified</div>
          <div v-if="heroFunds" class="hero-pill">{{ heroFunds }}</div>
          <div class="hero-pill">Chain free</div>
        </div>
        <div class="hero-footer">
          <span class="hero-footer-text">{{
            hasProgress ? 'Tap to continue' : 'Tap to start'
          }}</span>
          <span class="hero-share-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </span>
        </div>
      </div>
    </div>

    <!-- ── Why it matters ─────────────────────────────────── -->
    <div class="section-header">
      <div class="sec-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <div>
        <div class="sec-title">WHY IT MATTERS</div>
        <div class="sec-sub">Your competitive edge</div>
      </div>
    </div>
    <div class="mp-benefits">
      <div v-for="b in benefits" :key="b" class="mp-benefit">
        <div class="mp-tick">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="m5 12 5 5L20 7" />
          </svg>
        </div>
        <span>{{ b }}</span>
      </div>
    </div>

    <!-- ── Live activity ──────────────────────────────────── -->
    <div v-if="activityStats.publishedLast7d > 0" class="live-bar">
      <div class="pulse-dot" />
      <span>
        <strong>{{ activityStats.publishedLast7d.toLocaleString() }}</strong>
        {{ activityStats.publishedLast7d === 1 ? 'buyer' : 'buyers' }}
        verified this week · avg. 4 min to complete
      </span>
    </div>

    <!-- ── What's inside ──────────────────────────────────── -->
    <div class="section-header">
      <div class="sec-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 2v4M16 2v4M3 10h18" />
        </svg>
      </div>
      <div>
        <div class="sec-title">WHAT'S INSIDE</div>
        <div class="sec-sub">Your five sections</div>
      </div>
    </div>
    <div class="options-block">
      <div v-for="s in sections" :key="s.title" class="opt-card opt-card--compact">
        <div class="opt-icon">{{ s.emoji }}</div>
        <div class="opt-text">
          <div class="opt-title">{{ s.title }}</div>
          <div class="opt-sub">{{ s.sub }}</div>
        </div>
        <span
          class="rec-pill"
          :class="s.required ? 'rec-pill--req' : 'rec-pill--opt'"
        >
          {{ s.required ? 'REQUIRED' : 'OPTIONAL' }}
        </span>
      </div>
    </div>

    <!-- ── CTA ────────────────────────────────────────────── -->
    <div class="mp-cta-wrap">
      <button class="cta-btn" @click="goToBuild">
        <span class="cta-btn-inner">
          {{ hasProgress ? 'Continue my Profile' : 'Build my Buyer Profile' }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </button>
      <div class="ghost-link">Free · No subscription · 5-minute build</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuyerProfile } from '~/composables/useBuyerProfile'
import { useProfile } from '~/composables/useProfile'

const router = useRouter()
const { getBuyerProfile, getActivityStats } = useBuyerProfile()
const { fetchProfile, profile } = useProfile()

const existing = ref<any>(null)
const loading = ref(true)
const activityStats = ref({ publishedLast7d: 0, totalPublished: 0 })

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

const heroName = computed(() => {
  const first = profile.value?.firstName?.trim()
  const last = profile.value?.lastName?.trim()
  if (first || last) return [first, last].filter(Boolean).join(' ')
  return 'Your name here'
})

const heroFunds = computed(() => {
  const amt = existing.value?.fundsAmount
  if (!amt) return ''
  if (amt >= 1_000_000) return `£${(amt / 1_000_000).toFixed(1)}M Funds`
  if (amt >= 1000) return `£${Math.round(amt / 1000)}K Funds`
  return `£${amt} Funds`
})

const benefits = [
  'Sellers take your offer seriously',
  'Agents prioritise your viewings',
  'Solicitors can start faster',
  'Verified credentials replace endless paperwork',
]

const sections = [
  { emoji: '🪪', title: 'Verified identity', sub: 'Onfido KYC + DVS-certified', required: true },
  { emoji: '🏦', title: 'Proof of funds', sub: 'Mortgage AIP or bank statement', required: true },
  { emoji: '🔗', title: 'Chain position', sub: 'First-time, chain-free, or selling', required: true },
  { emoji: '⚖️', title: 'Solicitor & timeline', sub: 'Move-readiness signals', required: false },
  { emoji: '✍️', title: 'Your story', sub: 'Optional short intro to sellers', required: false },
]

const goBack = useGoBack('/explore')

function goToBuild() {
  router.push('/buyer-profile/build')
}

onMounted(async () => {
  // Activity ticker — public endpoint, fire-and-forget.
  getActivityStats()
    .then((s) => { activityStats.value = s })
    .catch(() => { /* no-op */ })
  fetchProfile?.().catch(() => {})
  try {
    const data = await getBuyerProfile()
    existing.value = data
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
/* ───────────── Page shell ───────────── */
.mp-page {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-bottom: 32px;
}

/* ───────────── Top nav ───────────── */
.mp-top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 6px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.mp-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 1px solid #ececef;
  display: flex; align-items: center; justify-content: center;
  color: #231d45; cursor: pointer; flex-shrink: 0;
}
.mp-nav-centre { flex: 1; display: flex; justify-content: center; }

/* ───────────── Eyebrow pill (prototype) ───────────── */
.eyebrow-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 11px; font-weight: 800; letter-spacing: 1.4px;
  color: #007e78; background: #f2faf8; border: 1px solid #e5f4f2;
  padding: 6px 12px; border-radius: 100px; text-transform: uppercase;
}
.eyebrow-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #00a19a;
}

/* ───────────── Hero head ───────────── */
.mp-hero-head { padding: 16px 22px 0; }
.mp-hero-title {
  font-size: 26px; font-weight: 800; color: #231d45;
  line-height: 1.2; margin-bottom: 8px; letter-spacing: -0.5px;
}
.mp-hero-sub {
  font-size: 13px; color: #6b6783; line-height: 1.5;
}

/* ───────────── Hero card (gradient + shimmer) ───────────── */
.mp-hero-wrap { padding: 16px 22px 0; }
.hero-card {
  background: linear-gradient(140deg, #00b6ae 0%, #00a19a 50%, #00514d 100%);
  box-shadow: 0 12px 32px -10px rgba(0, 161, 154, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  border-radius: 20px; padding: 22px;
  color: white; position: relative; overflow: hidden; cursor: pointer;
}
.hero-card::after {
  content: ''; position: absolute; top: -40%; right: -20%;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%);
  pointer-events: none;
}
.hero-card::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 60px; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  transform: translateX(-100%) skewX(-15deg);
  animation: mp-shimmer 3s ease-in-out infinite;
  pointer-events: none;
}
.hero-card > * { position: relative; z-index: 1; }
@keyframes mp-shimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(600%) skewX(-15deg); }
}
.hero-eyebrow {
  font-size: 9px; font-weight: 800; letter-spacing: 1.8px;
  text-transform: uppercase; opacity: 0.7; margin-bottom: 4px;
}
.hero-tagline {
  font-size: 20px; font-weight: 800; font-style: italic;
  line-height: 1.25; margin-bottom: 12px;
}
.hero-name { font-size: 13px; font-weight: 700; margin-bottom: 12px; }
.hero-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
.hero-pill {
  font-size: 10px; font-weight: 700;
  border: 1px solid rgba(255,255,255,0.4); border-radius: 100px;
  padding: 5px 10px; color: white; white-space: nowrap;
}
.hero-footer { display: flex; align-items: center; justify-content: space-between; }
.hero-footer-text { font-size: 11px; font-weight: 600; opacity: 0.75; }
.hero-share-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.2); color: white;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ───────────── Section header ───────────── */
.section-header {
  display: flex; align-items: center; gap: 12px;
  padding: 22px 22px 10px;
}
.sec-icon {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, #00b6ae, #007e78);
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.30);
  display: flex; align-items: center; justify-content: center;
  color: white; flex-shrink: 0;
}
.sec-title { font-size: 13px; font-weight: 800; color: #231d45; letter-spacing: 0.8px; }
.sec-sub { font-size: 11.5px; color: #6b6783; }

/* ───────────── Benefits ───────────── */
.mp-benefits {
  padding: 0 22px;
  display: flex; flex-direction: column; gap: 10px;
}
.mp-benefit {
  display: flex; align-items: center; gap: 12px;
  font-size: 13.5px; font-weight: 700; color: #231d45;
}
.mp-tick {
  width: 26px; height: 26px; border-radius: 50%; background: #00a19a;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* ───────────── Live bar ───────────── */
.live-bar {
  background: #f2faf8;
  border-top: 1px solid #e5f4f2;
  border-bottom: 1px solid #e5f4f2;
  padding: 10px 22px; margin-top: 18px;
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; color: #007e78; font-weight: 700;
}
.pulse-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #00a19a;
  position: relative; flex-shrink: 0;
}
.pulse-dot::after {
  content: ''; position: absolute; inset: -3px; border-radius: 50%;
  background: #00a19a; opacity: 0.35;
  animation: mp-pulse 1.8s ease-out infinite;
}
@keyframes mp-pulse {
  0% { transform: scale(1); opacity: 0.35; }
  100% { transform: scale(2.2); opacity: 0; }
}

/* ───────────── Sections options-block (prototype) ───────────── */
.options-block {
  padding: 0 22px;
  display: flex; flex-direction: column; gap: 8px;
}
.opt-card {
  background: #fafafa; border: 1.5px solid #ececef;
  border-radius: 14px; padding: 13px 14px;
  cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; gap: 12px;
}
.opt-card--compact { cursor: default; }
.opt-card.sel {
  background: #f2faf8; border-color: #00a19a;
  box-shadow: 0 0 0 3px rgba(0,161,154,0.10);
}
.opt-icon { font-size: 20px; width: 36px; text-align: center; flex-shrink: 0; }
.opt-text { flex: 1; min-width: 0; }
.opt-title { font-size: 13.5px; font-weight: 800; color: #231d45; }
.opt-sub { font-size: 11px; color: #6b6783; margin-top: 1px; }
.rec-pill {
  font-size: 9px; font-weight: 800; padding: 3px 8px;
  border-radius: 100px; letter-spacing: 1px; flex-shrink: 0;
}
.rec-pill--req {
  background: #f2faf8; color: #007e78; border: 1px solid #e5f4f2;
}
.rec-pill--opt {
  background: #f5f5f7; color: #6b6783;
}

/* ───────────── CTA ───────────── */
.mp-cta-wrap { padding: 20px 22px 0; }
.cta-btn {
  width: 100%; background: #00a19a; color: white; border: none;
  border-radius: 14px; padding: 16px;
  font-size: 14px; font-weight: 800; font-family: inherit;
  box-shadow: 0 4px 16px rgba(0,161,154,0.35);
  position: relative; overflow: hidden; cursor: pointer;
  transition: all 0.15s;
}
.cta-btn::after {
  content: ''; position: absolute; top: 0; left: 0;
  width: 50px; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%) skewX(-15deg);
  animation: mp-shimmer 2.5s ease-in-out 1s infinite;
}
.cta-btn:hover { background: #00b6ae; transform: translateY(-1px); }
.cta-btn-inner {
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.ghost-link {
  text-align: center; display: block;
  font-size: 12px; font-weight: 700; color: #6b6783;
  padding: 12px 10px 4px;
}
</style>
