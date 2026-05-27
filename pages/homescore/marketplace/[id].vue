<template>
  <div class="mp-matched">
    <!-- App header -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Vetted suppliers</div>
        <div class="app-header-sub">Matched to your pathway · CV5 area</div>
      </div>
    </div>

    <!-- Filter chips -->
    <div class="mkt-filters">
      <button
        v-for="f in filters"
        :key="f.id"
        class="mkt-filter"
        :class="{ active: activeFilter === f.id }"
        type="button"
        @click="activeFilter = f.id"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Grant banner -->
    <div class="grant-banner">
      <div class="grant-banner-title">🎁 Grants listed on your EPC</div>
      <div class="grant-banner-sub">
        <b>Warm Homes Local Grant</b>, <b>Energy Company Obligation (ECO)</b>, and
        <b>Boiler Upgrade Scheme</b> all named on your certificate. Suppliers below will check
        eligibility for you.
      </div>
    </div>

    <!-- Supplier cards -->
    <div class="supplier-cards">
      <div
        v-for="s in filteredSuppliers"
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
            <div class="sc-rating">★ <b>{{ s.rating }}</b> · {{ s.reviews }} reviews · {{ s.cert }}</div>
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

    <!-- UProtect note -->
    <div class="uprotect-note">
      🔒 All suppliers are verified by UMU. Payments held in escrow until work is confirmed
      complete. <b>Powered by UProtect.</b>
    </div>

    <!-- Bottom CTAs -->
    <div class="bottom-cta">
      <button class="bottom-cta-btn" type="button" @click="goHub">
        🛒 Open the full UmovingU Marketplace →
      </button>
      <button class="bottom-cta-secondary" type="button" @click="router.back()">
        ↩ Back to my HomeScore
      </button>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMarketplaceMock } from '~/composables/useMarketplaceMock'

const router = useRouter()
const route = useRoute()
const { suppliers } = useMarketplaceMock()

const filters = [
  { id: 'all', label: 'All' },
  { id: 'boiler', label: '🔥 Boiler' },
  { id: 'insulation', label: '🧱 Insulation' },
  { id: 'smart', label: '🌡 Smart heat' },
  { id: 'solar', label: '☀️ Solar' },
]

const activeFilter = ref<string>((route.query.cat as string) || 'all')

const filteredSuppliers = computed(() => {
  if (activeFilter.value === 'all') return suppliers
  return suppliers.filter((s) => s.category.includes(activeFilter.value))
})

function goSupplier(id: string) {
  router.push(`/homescore/supplier/${id}`)
}
function goHub() {
  router.push('/homescore/marketplace')
}
</script>

<style scoped>
.mp-matched {
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
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}

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
.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  flex-shrink: 0;
}
.back-btn svg { width: 16px; height: 16px; }
.app-header-info { flex: 1; min-width: 0; }
.app-header-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
}
.app-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}

/* Filters */
.mkt-filters {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 14px 20px 4px;
}
.mkt-filters::-webkit-scrollbar { display: none; }
.mkt-filter {
  padding: 8px 14px;
  border-radius: 100px;
  border: 1.5px solid var(--border);
  background: var(--card);
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.mkt-filter.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  border-color: var(--primary);
  color: white;
  box-shadow: var(--shadow-card);
}

/* Grant banner */
.grant-banner {
  margin: 10px 20px 0;
  padding: 14px 16px;
  background: #f2ebfd;
  border: 1px solid #c9b0f0;
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.grant-banner-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
  letter-spacing: -0.1px;
}
.grant-banner-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
}
.grant-banner-sub :deep(b) {
  color: #5b3795;
  font-weight: 800;
}

/* Supplier cards */
.supplier-cards {
  padding: 10px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.supplier-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: var(--shadow-card);
}
.sc-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 16px 12px;
}
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
.sc-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
}
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
.sc-spec {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 3px;
}
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

/* UProtect note */
.uprotect-note {
  margin: 0 20px 24px;
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  border: 1px solid var(--accent-pale);
  border-radius: 14px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1.6;
  box-shadow: var(--shadow-card);
}
.uprotect-note :deep(b) {
  color: var(--accent-dark);
  font-weight: 800;
}

/* Bottom CTA */
.bottom-cta { padding: 0 20px 24px; }
.bottom-cta-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.3);
}
.bottom-cta-secondary {
  width: 100%;
  padding: 14px;
  background: var(--card);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}
</style>
