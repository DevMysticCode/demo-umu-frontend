<template>
  <div class="sp-page mobile-container">
    <!-- Nav bar -->
    <div class="sp-nav-bar">
      <button class="sp-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="sp-nav-title">Saved Properties</div>
      <button
        class="sp-nav-icon-btn"
        aria-label="Search"
        @click="onToggleSearch"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </div>

    <!-- Inline expanding search (navbar-style) -->
    <div v-if="searchOpen" class="sp-nav-search">
      <input
        ref="searchInputRef"
        v-model="search"
        type="text"
        class="sp-nav-search-input"
        placeholder="Search saved properties…"
        @keyup.escape="searchOpen = false"
      />
      <button
        v-if="search"
        class="sp-nav-search-clear"
        aria-label="Clear"
        @click="search = ''"
      >
        ×
      </button>
    </div>

    <main class="sp-body">
      <div class="atm-bg coral" />

      <!-- Hero -->
      <div class="sp-hero">
        <div class="hero-greeting">Properties you've hearted</div>
        <div class="sp-h1">
          Saved<span class="sp-h1-count">{{ properties.length }}</span>
        </div>
        <div class="hero-stats">
          <span><span class="stat-num teal">{{ countPassportReady }}</span>passport ready</span>
          <span class="stat-sep" />
          <span><span class="stat-num coral">{{ countPriceChanged }}</span>price changes</span>
          <span class="stat-sep" />
          <span><span class="stat-num">{{ countActiveOwners }}</span>owner active</span>
        </div>
      </div>

      <!-- Filter chips -->
      <div class="sp-filter-row">
        <button
          v-for="chip in filterChips"
          :key="chip.value"
          class="sp-chip"
          :class="{ active: activeFilter === chip.value }"
          @click="activeFilter = chip.value"
        >
          {{ chip.label }}
          <span class="sp-chip-num">{{ chip.count }}</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="sp-empty">Loading…</div>

      <!-- Empty state -->
      <div v-else-if="filteredProperties.length === 0" class="sp-empty">
        No saved properties yet
      </div>

      <!-- 2-up grid -->
      <div v-else class="sp-grid">
        <article
          v-for="item in filteredProperties"
          :key="item.id"
          class="sp-tile"
          @click="navigateTo(`/property/${item.id}`)"
        >
          <div class="sp-photo">
            <PropertyImage
              :src="item.imageUrl"
              :alt="item.addressLine1"
              :show-caption="false"
              class="sp-photo-img-wrap"
            />

            <div class="sp-heart" @click.stop="onUnsave(item)">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>

            <div
              class="sp-status"
              :class="item.hasPassport ? 'passport-ready' : 'no-passport'"
            >
              <svg
                v-if="item.hasPassport"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ item.hasPassport ? 'Passport' : 'No passport' }}
            </div>

            <!-- Life signal flag (price-drop wins, then days-on-market, then owner-active) -->
            <div
              v-if="lifeSignal(item)"
              class="sp-priceflag"
              :class="lifeSignal(item).tone"
            >
              <span v-if="lifeSignal(item).icon" class="sp-flag-ic">{{ lifeSignal(item).icon }}</span>
              {{ lifeSignal(item).label }}
            </div>
          </div>
          <div class="sp-info">
            <div class="sp-addr">{{ item.addressLine1 }}</div>
            <div class="sp-locality">
              {{ [item.city || item.county, item.postcode].filter(Boolean).join(', ') }}
            </div>
            <div v-if="item.estimatedPrice" class="sp-price">
              £{{ Number(item.estimatedPrice).toLocaleString() }}
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { usePropertyActions } from '~/composables/usePropertyActions'
import PropertyImage from '~/components/property/PropertyImage.vue'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const search = ref('')
const loading = ref(true)
const properties = ref<any[]>([])
const activeFilter = ref<'all' | 'passport' | 'price' | 'recent'>('all')
const searchOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

const { fetchSavedProperties } = usePropertyActions()

onMounted(async () => {
  try {
    properties.value = await fetchSavedProperties()
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.back()
}

async function onToggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    await nextTick()
    searchInputRef.value?.focus?.()
  }
}

function onUnsave(item: any) {
  // Optimistic remove from local list — wire to backend later
  properties.value = properties.value.filter((p) => p.id !== item.id)
}

// ── Life-signal helpers ─────────────────────────────────────────
const ACTIVE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000 // owner-active = visited within 3 days
const STALE_DAYS_THRESHOLD = 30

function priceChangePct(item: any): number | null {
  const price = Number(item.estimatedPrice)
  const prev = Number(item.previousPrice ?? item.priorEstimatedPrice)
  if (!Number.isFinite(price) || !Number.isFinite(prev) || prev === 0) return null
  return Math.round(((price - prev) / prev) * 100)
}
function daysOnMarket(item: any): number | null {
  const created = item.listedAt ?? item.createdAt
  if (!created) return null
  const ms = Date.now() - new Date(created).getTime()
  if (!Number.isFinite(ms) || ms < 0) return null
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}
function ownerActive(item: any): boolean {
  const last = item.lastVisitedAt
  if (!last) return false
  const ms = Date.now() - new Date(last).getTime()
  return Number.isFinite(ms) && ms >= 0 && ms <= ACTIVE_THRESHOLD_MS
}

function lifeSignal(item: any) {
  const pct = priceChangePct(item)
  if (pct !== null && pct !== 0) {
    if (pct < 0) {
      return { label: `${pct}%`, tone: 'priceflag--down', icon: '↓' }
    }
    return { label: `+${pct}%`, tone: 'priceflag--up', icon: '↑' }
  }
  if (ownerActive(item)) {
    return { label: 'Owner active', tone: 'priceflag--active', icon: '●' }
  }
  const dom = daysOnMarket(item)
  if (dom !== null && dom >= STALE_DAYS_THRESHOLD) {
    return { label: `${dom}d listed`, tone: 'priceflag--neutral', icon: '' }
  }
  return null
}

// ── Filter chips ────────────────────────────────────────────────
const countPassportReady = computed(
  () => properties.value.filter((p) => p.hasPassport).length,
)
const countPriceChanged = computed(
  () => properties.value.filter((p) => priceChangePct(p) !== null).length,
)
const countActiveOwners = computed(
  () => properties.value.filter(ownerActive).length,
)

const filterChips = computed(() => [
  { value: 'all', label: 'All', count: properties.value.length },
  { value: 'passport', label: 'Passport ready', count: countPassportReady.value },
  { value: 'price', label: 'Price changed', count: countPriceChanged.value },
  { value: 'recent', label: 'Owner active', count: countActiveOwners.value },
])

const filteredProperties = computed(() => {
  let list = properties.value
  if (activeFilter.value === 'passport') list = list.filter((p) => p.hasPassport)
  else if (activeFilter.value === 'price') list = list.filter((p) => priceChangePct(p) !== null)
  else if (activeFilter.value === 'recent') list = list.filter(ownerActive)
  const q = search.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((item) =>
    [item.addressLine1, item.city, item.county, item.postcode]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
})
</script>

<style scoped>
/* Page surface */
.sp-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}

/* Nav bar */
.sp-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.sp-nav-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
  transition: background 0.2s;
}
.sp-nav-icon-btn:hover { background: #f0f2f1; }
.sp-nav-icon-btn svg { width: 18px; height: 18px; }
.sp-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}
.sp-nav-search {
  margin: 0 22px 8px;
  position: relative;
  z-index: 2;
}
.sp-nav-search-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 100px;
  padding: 9px 36px 9px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #0e2840;
  outline: none;
}
.sp-nav-search-input:focus {
  border-color: #3dbda3;
  box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.18);
}
.sp-nav-search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #4a5868;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.sp-body { position: relative; }

.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.coral {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(255, 139, 90, 0.1), transparent 65%);
}

/* Hero */
.sp-hero {
  padding: 8px 22px 14px;
  position: relative;
  z-index: 1;
}
.hero-greeting {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.2px;
  text-transform: none;
  color: #1f7a66;
  margin-bottom: 4px;
}
.sp-h1 {
  font-size: 32px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1.2px;
  line-height: 1;
  margin-bottom: 10px;
}
.sp-h1-count {
  display: inline-block;
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 22px;
  font-weight: 400;
  color: #3dbda3;
  vertical-align: 8px;
  margin-left: 6px;
  letter-spacing: -0.5px;
}
.hero-stats {
  display: inline-flex;
  align-items: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #4a5868;
  letter-spacing: -0.2px;
  flex-wrap: wrap;
}
.hero-stats .stat-num { color: #0e2840; font-weight: 800; font-feature-settings: 'tnum'; margin-right: 4px; }
.hero-stats .stat-num.teal { color: #1f7a66; }
.hero-stats .stat-num.coral { color: #b85b36; }
.hero-stats .stat-sep { width: 3px; height: 3px; border-radius: 50%; background: #b5bdc4; margin: 0 8px; display: inline-block; }

/* Filter chips */
.sp-filter-row {
  display: flex;
  gap: 6px;
  padding: 0 22px 14px;
  overflow-x: auto;
  scrollbar-width: none;
  position: relative;
  z-index: 1;
}
.sp-filter-row::-webkit-scrollbar { display: none; }
.sp-chip {
  background: #fff;
  color: #4a5868;
  border: 1px solid #e8eceb;
  border-radius: 100px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  transition: all 0.15s;
  letter-spacing: -0.1px;
}
.sp-chip.active {
  background: #0e2840;
  color: #fff;
  border-color: #0e2840;
}
.sp-chip-num {
  font-size: 10px;
  font-weight: 800;
  color: #8a95a0;
  font-feature-settings: 'tnum';
}
.sp-chip.active .sp-chip-num { color: rgba(255, 255, 255, 0.7); }

.sp-empty {
  text-align: center;
  padding: 40px 22px;
  color: #8a95a0;
  font-size: 13px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

/* Grid */
.sp-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  padding: 0 22px;
  position: relative;
  z-index: 1;
}
.sp-tile {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
}
.sp-photo {
  position: relative;
  aspect-ratio: 152 / 130;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(180deg, #c5e4dd, #a8c8b5);
  box-shadow: 0 4px 12px rgba(14, 40, 64, 0.1);
}
.sp-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.sp-photo-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(15, 46, 41, 0.4);
}
.sp-photo-fallback svg { width: 38%; height: 38%; }

.sp-heart {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ff8b5a;
  transition: transform 0.15s;
}
.sp-heart:hover { transform: scale(1.1); }
.sp-heart svg { width: 14px; height: 14px; fill: #ff8b5a; }

.sp-status {
  position: absolute;
  bottom: 8px;
  left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(15, 46, 41, 0.85);
  backdrop-filter: blur(6px);
  color: #f5c44c;
  font-size: 9px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 100px;
  letter-spacing: 0.3px;
  border: 0.5px solid rgba(245, 196, 76, 0.3);
}
.sp-status.passport-ready { background: linear-gradient(135deg, #1f4b43, #0f2e29); }
.sp-status.no-passport {
  background: rgba(255, 255, 255, 0.9);
  color: #4a5868;
  border-color: #e8eceb;
}
.sp-status svg { width: 8px; height: 8px; }

.sp-priceflag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #ff8b5a;
  color: #fff;
  font-size: 9.5px;
  font-weight: 800;
  padding: 3px 7px;
  border-radius: 100px;
  letter-spacing: 0.1px;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 6px rgba(255, 139, 90, 0.35);
}
.sp-priceflag.priceflag--down { background: #ff8b5a; }
.sp-priceflag.priceflag--up {
  background: #f5c44c;
  color: #6f4d14;
  box-shadow: 0 2px 6px rgba(245, 196, 76, 0.35);
}
.sp-priceflag.priceflag--active {
  background: #3dbda3;
  box-shadow: 0 2px 6px rgba(61, 189, 163, 0.35);
}
.sp-priceflag.priceflag--neutral {
  background: rgba(255, 255, 255, 0.95);
  color: #4a5868;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.sp-flag-ic { font-size: 10px; }

.sp-info { padding: 0 2px; }
.sp-addr {
  font-size: 13.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.3px;
  line-height: 1.15;
  margin-bottom: 2px;
}
.sp-locality {
  font-size: 10.5px;
  font-weight: 600;
  color: #8a95a0;
  margin-bottom: 4px;
}
.sp-price {
  font-size: 13px;
  font-weight: 800;
  color: #1f7a66;
  font-feature-settings: 'tnum';
  letter-spacing: -0.3px;
}
</style>
