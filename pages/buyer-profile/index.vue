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
        <div class="hero-card-content">
          <div class="hero-eyebrow">UMU Buyer Profile</div>
          <div class="hero-tagline">"Trusted, ready,<br />chain-free."</div>
          <div class="hero-name">{{ heroName }}</div>
          <div class="hero-pills">
            <div class="hero-pill">
              <img src="/op-icons/verify-identity/idCard.png" alt="" class="hero-pill-ic" loading="lazy" />
              ID Verified
            </div>
            <div v-if="heroFunds" class="hero-pill">{{ heroFunds }}</div>
            <div class="hero-pill">
              <img src="/op-icons/verify-identity/shield.png" alt="" class="hero-pill-ic" loading="lazy" />
              Chain free
            </div>
          </div>
          <div class="hero-footer">
            <span class="hero-footer-text">{{
              hasProgress ? 'Tap to continue' : 'Tap to start'
            }}</span>
          </div>
        </div>
        <img
          src="/op-icons/buyer-profile-hero/phone-shield.png"
          alt=""
          class="hero-illustration"
          loading="lazy"
        />
        <span class="hero-share-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </span>
      </div>
    </div>

    <!-- ── Why it matters ─────────────────────────────────── -->
    <div class="section-header section-header--illus">
      <img src="/op-icons/buyer-profile-build/target.png" alt="" class="sec-illus" loading="lazy" />
      <div>
        <div class="sec-title">WHY IT MATTERS</div>
        <div class="sec-sub">Your competitive edge</div>
      </div>
    </div>
    <div class="mp-benefits">
      <div v-for="b in benefits" :key="b.title" class="mp-benefit">
        <img :src="b.icon" alt="" class="mp-benefit-ic" loading="lazy" />
        <div class="mp-tick">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="m5 12 5 5L20 7" />
          </svg>
        </div>
        <span>{{ b.title }}</span>
      </div>
    </div>

    <!-- ── Live activity ──────────────────────────────────── -->
    <div v-if="activityStats.publishedLast7d > 0" class="live-bar">
      <img src="/op-icons/buyer-profile-build/buyers.png" alt="" class="live-bar-ic" loading="lazy" />
      <span>
        <strong>{{ activityStats.publishedLast7d.toLocaleString() }}</strong>
        {{ activityStats.publishedLast7d === 1 ? 'buyer' : 'buyers' }}
        verified this week · avg. 4 min to complete
      </span>
    </div>

    <!-- ── What's inside ──────────────────────────────────── -->
    <div class="section-header section-header--illus">
      <img src="/op-icons/buyer-profile-build/calendar.png" alt="" class="sec-illus" loading="lazy" />
      <div>
        <div class="sec-title">WHAT'S INSIDE</div>
        <div class="sec-sub">Your five sections</div>
      </div>
    </div>
    <div class="options-block">
      <div v-for="s in sections" :key="s.title" class="opt-card opt-card--compact">
        <img :src="s.icon" alt="" class="opt-illus" loading="lazy" />
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
          <img src="/op-icons/buyer-profile-build/clipboard.png" alt="" class="cta-btn-ic" loading="lazy" />
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
  { title: 'Sellers take your offer seriously',            icon: '/op-icons/buyer-profile-build/house.png' },
  { title: 'Agents prioritise your viewings',              icon: '/op-icons/buyer-profile-build/agent.png' },
  { title: 'Solicitors can start faster',                  icon: '/op-icons/buyer-profile-build/stopwatch.png' },
  { title: 'Verified credentials replace endless paperwork', icon: '/op-icons/buyer-profile-build/verifiedDoc.png' },
]

const sections = [
  { icon: '/op-icons/buyer-profile-build/idCard.png',  title: 'Verified identity',    sub: 'Onfido KYC + DVS-certified',       required: true },
  { icon: '/op-icons/buyer-profile-build/bank.png',    title: 'Proof of funds',       sub: 'Mortgage AIP or bank statement',   required: true },
  { icon: '/op-icons/buyer-profile-build/chain.png',   title: 'Chain position',       sub: 'First-time, chain-free, or selling', required: true },
  { icon: '/op-icons/buyer-profile-build/scales.png',  title: 'Solicitor & timeline', sub: 'Move-readiness signals',           required: false },
  { icon: '/op-icons/buyer-profile-build/notepad.png', title: 'Your story',           sub: 'Optional short intro to sellers',  required: false },
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
  /* Solid teal matched to the phone-shield illustration crop so its
     background blends seamlessly with the card. */
  background: #17A199;
  box-shadow: 0 12px 32px -10px rgba(0, 161, 154, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 22px 18px;
  color: white;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 300px;
}
.hero-card::after {
  content: ''; position: absolute; top: -40%; right: -20%;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%);
  pointer-events: none;
}
/* Left column with tagline / name / pills / tap-to-start. */
.hero-card-content {
  position: relative;
  z-index: 1;
  max-width: 55%;
}
/* The phone-with-shield illustration is anchored to the bottom-right
   of the card. Kept at ~48% width so it never crowds the copy on
   narrow devices; slight negative right/bottom so the flat teal edges
   fall behind the card's rounded corners. */
.hero-illustration {
  position: absolute;
  right: -8px;
  bottom: -8px;
  width: 52%;
  max-width: 240px;
  height: auto;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 8px 18px rgba(0, 65, 62, 0.28));
}
.hero-card::before {
  content: ''; position: absolute; top: 0; left: 0;
  width: 60px; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  transform: translateX(-100%) skewX(-15deg);
  animation: mp-shimmer 3s ease-in-out infinite;
  pointer-events: none;
}
.hero-card-content > * { position: relative; z-index: 1; }
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 700;
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 100px;
  padding: 5px 10px 5px 6px;
  color: white;
  white-space: nowrap;
}
.hero-pill-ic {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}
.hero-footer { display: flex; align-items: center; justify-content: space-between; }
.hero-footer-text { font-size: 11px; font-weight: 600; opacity: 0.9; }
.hero-share-btn {
  position: absolute;
  right: 14px;
  bottom: 14px;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
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
.section-header--illus { gap: 14px; }
/* Section eyebrows on the buyer-profile intro use a big 3D illustration
   (target, calendar, …) instead of the teal-square SVG badge. */
.sec-illus {
  width: 54px; height: 54px;
  object-fit: contain;
  flex-shrink: 0;
}
.sec-title { font-size: 13px; font-weight: 800; color: #231d45; letter-spacing: 0.8px; }
.sec-sub { font-size: 11.5px; color: #6b6783; }

/* ───────────── Benefits ───────────── */
.mp-benefits {
  padding: 4px 22px 0;
  display: flex; flex-direction: column;
}
.mp-benefit {
  display: flex; align-items: center; gap: 14px;
  padding: 10px 0;
  font-size: 14px; font-weight: 700; color: #231d45;
}
.mp-benefit + .mp-benefit { border-top: 1px solid #eef0f3; }
.mp-benefit-ic {
  width: 54px; height: 54px;
  object-fit: contain;
  flex-shrink: 0;
}
.mp-tick {
  width: 30px; height: 30px; border-radius: 50%;
  background: linear-gradient(135deg, #00b6ae, #00817C);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 8px rgba(0, 161, 154, 0.28);
}

/* ───────────── Live bar ───────────── */
.live-bar {
  background: #f2faf8;
  border-radius: 14px;
  border: 1px solid #DCF0EE;
  padding: 10px 14px;
  margin: 18px 22px 0;
  display: flex; align-items: center; gap: 12px;
  font-size: 12.5px; color: #007e78; font-weight: 600;
}
.live-bar-ic {
  width: 42px; height: 42px;
  object-fit: contain;
  flex-shrink: 0;
}
.live-bar strong { font-weight: 800; }

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
/* Section-card illustrations on the WHAT'S INSIDE list. */
.opt-illus {
  width: 52px; height: 52px;
  object-fit: contain;
  flex-shrink: 0;
}
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
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.cta-btn-ic {
  width: 36px; height: 36px;
  object-fit: contain;
  flex-shrink: 0;
}
.ghost-link {
  text-align: center; display: block;
  font-size: 12px; font-weight: 700; color: #6b6783;
  padding: 12px 10px 4px;
}
</style>
