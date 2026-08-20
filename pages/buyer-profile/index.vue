<template>
  <div class="bph-page">
    <!-- Header: title + info, settings on the right -->
    <div class="bph-header">
      <button class="bph-settings-btn" type="button" aria-label="Back" @click="router.push('/profile')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="bph-header-centre">
        <span class="bph-header-title">Buyer Passport</span>
        <button
          class="bph-info-btn"
          type="button"
          aria-label="What is a Buyer Passport?"
          @click="showInfo = true"
        >
          <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" />
            <path d="M12 11v5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            <circle cx="12" cy="7.6" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div style="width: 36px" aria-hidden="true" />
    </div>

    <!-- Hero card -->
    <div class="bph-hero-wrap">
      <div class="bph-hero-card" @click="goToBuild">
        <img
          src="/op-icons/misc/buyerPassport.png"
          alt=""
          class="bph-hero-icon"
          loading="lazy"
        />
        <div class="bph-hero-body">
          <div class="bph-hero-title">Your Buyer Passport</div>
          <div class="bph-hero-sub">
            Build trust. Show you're a serious, ready buyer.
          </div>
          <span class="bph-status-pill" :class="'bph-status-pill--' + statusKey">
            <span class="bph-status-dot" />
            {{ statusLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Progress -->
    <div class="bph-progress-block">
      <div class="bph-progress-row">
        <span class="bph-progress-label">Passport progress</span>
        <span class="bph-progress-pct">{{ progressPct }}%</span>
      </div>
      <div class="bph-progress-track">
        <div class="bph-progress-fill" :style="{ width: progressPct + '%' }" />
      </div>
      <p class="bph-progress-hint">
        Complete your passport to verify who you are and your buying position.
      </p>
    </div>

    <!-- Checklist -->
    <div class="bph-checklist">
      <div
        v-for="(item, i) in checklistItems"
        :key="item.key"
        class="bph-check-row"
        @click="goToBuild"
      >
        <div class="bph-check-icon" :class="{ 'is-done': item.done }">
          <img :src="item.icon" alt="" loading="lazy" />
        </div>
        <div class="bph-check-body">
          <div class="bph-check-title">{{ i + 1 }}. {{ item.title }}</div>
          <div class="bph-check-sub">{{ item.sub }}</div>
        </div>
        <span class="bph-check-chev">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
            <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </div>
    </div>

    <!-- Secure / private banner -->
    <div class="bph-secure-banner">
      <img src="/op-icons/investment/padlock.png" alt="" class="bph-secure-ic" loading="lazy" />
      <div>
        <div class="bph-secure-h">Your information is secure and private.</div>
        <div class="bph-secure-v">You choose what to share and with whom.</div>
      </div>
    </div>

    <!-- Info sheet -->
    <Teleport to="body">
      <div v-if="showInfo" class="bph-sheet-overlay" @click="showInfo = false" />
      <div v-if="showInfo" class="bph-sheet">
        <div class="bph-sheet-handle" />
        <h3 class="bph-sheet-title">What is a Buyer Passport?</h3>
        <p class="bph-sheet-body">
          A verified profile that shows sellers and agents you're a serious,
          ready buyer — your identity, buying position, finances and chain
          position, all confirmed up front. Verified buyers get 3× more
          offers accepted.
        </p>
        <button class="bph-sheet-close" @click="showInfo = false">Got it</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuyerProfile } from '~/composables/useBuyerProfile'

const router = useRouter()
const { getBuyerProfile } = useBuyerProfile()

const existing = ref<any>(null)
const showInfo = ref(false)

// Completion per core step — mirrors the 4-step wizard in build.vue
// (Identity / Buying position / Finance / Chain position).
const stepDone = computed(() => {
  const p = existing.value
  return {
    identity: !!p?.idVerified,
    buying: !!(p?.timeline && p?.propertyType),
    finance: !!p?.fundsType,
    chain: !!p?.chainPosition,
  }
})

const checklistItems = computed(() => [
  {
    key: 'identity',
    icon: '/op-icons/buyer-profile-build/idCard.png',
    title: 'Your identity',
    sub: 'Verify your identity to get started.',
    done: stepDone.value.identity,
  },
  {
    key: 'buying',
    icon: '/op-icons/buyer-profile-build/target.png',
    title: 'Buying position',
    sub: 'Tell us about your buying plans.',
    done: stepDone.value.buying,
  },
  {
    key: 'finance',
    icon: '/op-icons/buyer-profile-build/bank.png',
    title: 'Finance',
    sub: 'Add proof of funds or mortgage position.',
    done: stepDone.value.finance,
  },
  {
    key: 'chain',
    icon: '/op-icons/investment/chainLink.png',
    title: 'Chain position',
    sub: "Help sellers understand your position in the chain.",
    done: stepDone.value.chain,
  },
])

const completedCount = computed(
  () => Object.values(stepDone.value).filter(Boolean).length,
)
const progressPct = computed(() =>
  Math.round((completedCount.value / 4) * 100),
)
const statusKey = computed(() => {
  if (progressPct.value === 100) return 'complete'
  if (progressPct.value > 0) return 'progress'
  return 'not-started'
})
const statusLabel = computed(() => {
  if (statusKey.value === 'complete') return 'Complete'
  if (statusKey.value === 'progress') return 'In progress'
  return 'Not started'
})

function goToBuild() {
  router.push('/buyer-profile/build')
}

onMounted(async () => {
  try {
    const data = await getBuyerProfile()
    existing.value = data
    if (data?.published) {
      router.replace('/buyer-profile/view')
    }
  } catch {
    /* token may be missing — stay on the checklist */
  }
})
</script>

<style scoped>
.bph-page {
  min-height: 100dvh;
  background: #f6f7f9;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-bottom: 40px;
}

/* ── Header ───────────────────────────────────────── */
.bph-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 6px;
  padding-top: calc(16px + env(safe-area-inset-top));
}
.bph-header-centre {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.bph-header-title {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.bph-info-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
}
.bph-settings-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #ececef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #231d45;
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Hero card ────────────────────────────────────── */
.bph-hero-wrap {
  padding: 12px 18px 0;
}
.bph-hero-card {
  background: linear-gradient(135deg, #2d2456, #231d45);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  box-shadow: 0 12px 28px -12px rgba(35, 29, 69, 0.5);
}
.bph-hero-icon {
  width: 76px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}
.bph-hero-body {
  flex: 1;
  min-width: 0;
}
.bph-hero-title {
  color: #fff;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.2px;
  margin-bottom: 4px;
}
.bph-hero-sub {
  color: rgba(255, 255, 255, 0.68);
  font-size: 12.5px;
  line-height: 1.4;
  margin-bottom: 12px;
}
.bph-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 11px;
  border-radius: 100px;
}
.bph-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9d97b8;
}
.bph-status-pill--progress .bph-status-dot,
.bph-status-pill--complete .bph-status-dot {
  background: #4ade80;
}

/* ── Progress block ───────────────────────────────── */
.bph-progress-block {
  padding: 20px 18px 0;
}
.bph-progress-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.bph-progress-label {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.bph-progress-pct {
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
}
.bph-progress-track {
  height: 8px;
  border-radius: 100px;
  background: #e7e8ec;
  overflow: hidden;
}
.bph-progress-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 100px;
  transition: width 0.3s ease;
}
.bph-progress-hint {
  font-size: 12.5px;
  color: #6b6783;
  line-height: 1.5;
  margin: 10px 0 0;
}

/* ── Checklist ────────────────────────────────────── */
.bph-checklist {
  padding: 18px 18px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bph-check-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.05);
}
.bph-check-row:active {
  transform: scale(0.99);
}
.bph-check-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bph-check-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.bph-check-icon.is-done {
  background: #e8f9ee;
  border-color: #cdeedb;
}
.bph-check-body {
  flex: 1;
  min-width: 0;
}
.bph-check-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  margin-bottom: 2px;
}
.bph-check-sub {
  font-size: 12px;
  color: #6b6783;
  line-height: 1.4;
}
.bph-check-chev {
  color: #c3c5cf;
  flex-shrink: 0;
  display: flex;
}

/* ── Secure banner ────────────────────────────────── */
.bph-secure-banner {
  margin: 20px 18px 0;
  background: #f2faf8;
  border: 1px solid #dcf0ee;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.bph-secure-ic {
  width: 30px;
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 1px;
}
.bph-secure-h {
  font-size: 12.5px;
  font-weight: 800;
  color: #007e78;
  line-height: 1.4;
}
.bph-secure-v {
  font-size: 12px;
  color: #4b8c87;
  line-height: 1.4;
  margin-top: 2px;
}

/* ── Info sheet ───────────────────────────────────── */
.bph-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 12, 30, 0.45);
  z-index: 60;
}
.bph-sheet {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100%;
  max-width: 28rem;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 10px 22px calc(24px + env(safe-area-inset-bottom));
  z-index: 61;
}
.bph-sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 100px;
  background: #e2e4ea;
  margin: 0 auto 16px;
}
.bph-sheet-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  margin: 0 0 8px;
}
.bph-sheet-body {
  font-size: 13.5px;
  color: #6b6783;
  line-height: 1.55;
  margin: 0 0 18px;
}
.bph-sheet-close {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 14px;
  font-size: 14px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}
</style>
