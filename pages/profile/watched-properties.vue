<template>
  <div class="sp-page mobile-container">
    <!-- Nav bar -->
    <div class="sp-nav-bar">
      <button class="sp-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="sp-nav-title">Watched Properties</div>
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
        placeholder="Search watched properties…"
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
      <div class="atm-bg teal" />

      <!-- Hero -->
      <div class="sp-hero">
        <div class="hero-greeting">Homes you're getting alerts for</div>
        <div class="sp-h1">
          Watching<span class="sp-h1-count">{{ properties.length }}</span>
        </div>
        <div class="hero-stats">
          <span><span class="stat-num teal">{{ countPassportReady }}</span>passport ready</span>
          <span class="stat-sep" />
          <span><span class="stat-num">{{ countHomescoreAlerts }}</span>HomeScore alerts</span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="sp-empty">Loading…</div>

      <!-- Empty state -->
      <div v-else-if="filteredProperties.length === 0" class="sp-empty">
        <template v-if="properties.length === 0">
          <div class="sp-empty-title">Nothing watched yet</div>
          <div class="sp-empty-sub">
            Open a property and tap "Watch this property" to get alerted about
            claims, price changes and HomeScore updates.
          </div>
          <button class="sp-empty-cta" @click="navigateTo('/discover')">
            Explore properties
          </button>
        </template>
        <template v-else>No watched properties match your search</template>
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

            <button
              type="button"
              class="sp-unwatch"
              aria-label="Stop watching"
              @click.stop="onUnwatch(item)"
            >
              <img src="/op-icons/misc/bell.png" alt="" class="sp-unwatch-ic" loading="lazy" />
            </button>

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
          </div>
          <div class="sp-info">
            <div class="sp-addr">{{ item.addressLine1 }}</div>
            <div class="sp-locality">
              {{ [item.city || item.county, item.postcode].filter(Boolean).join(', ') }}
            </div>
            <div v-if="item.homeScore != null" class="sp-hs">
              HomeScore <strong>{{ item.homeScore }}/100</strong>
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
const searchOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

const { fetchWatchedProperties, unwatchProperty } = usePropertyActions()

onMounted(async () => {
  try {
    properties.value = await fetchWatchedProperties()
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

async function onUnwatch(item: any) {
  // Optimistic remove, then persist via the delete endpoint. If it fails,
  // restore the item.
  const snapshot = properties.value
  properties.value = properties.value.filter((p) => p.id !== item.id)
  const ok = await unwatchProperty(item.id)
  if (!ok) properties.value = snapshot
}

const countPassportReady = computed(
  () => properties.value.filter((p) => p.hasPassport).length,
)
const countHomescoreAlerts = computed(
  () => properties.value.filter((p) => p.watchPrefs?.homescore).length,
)

const filteredProperties = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return properties.value
  return properties.value.filter((item) =>
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
  border-color: #00a19a;
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
.atm-bg.teal {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(0, 161, 154, 0.1), transparent 65%);
}

/* Hero */
.sp-hero {
  padding: 8px 22px 14px;
  position: relative;
  z-index: 1;
}
.hero-greeting {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  color: #94a3b8;
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
  font-size: 22px;
  font-weight: 700;
  color: #00a19a;
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
.hero-stats .stat-num.teal { color: #008a84; }
.hero-stats .stat-sep { width: 3px; height: 3px; border-radius: 50%; background: #b5bdc4; margin: 0 8px; display: inline-block; }

.sp-empty {
  text-align: center;
  padding: 40px 22px;
  color: #8a95a0;
  font-size: 13px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}
.sp-empty-title {
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  margin-bottom: 6px;
}
.sp-empty-sub {
  font-size: 12.5px;
  color: #8a95a0;
  font-weight: 500;
  line-height: 1.5;
  max-width: 260px;
  margin: 0 auto 18px;
}
.sp-empty-cta {
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 100px;
  padding: 11px 22px;
  font-size: 13px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
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

.sp-unwatch {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s;
  padding: 0;
}
.sp-unwatch:hover { transform: scale(1.1); }
.sp-unwatch-ic { width: 15px; height: 15px; object-fit: contain; }

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
.sp-hs {
  font-size: 12px;
  font-weight: 700;
  color: #4a5868;
}
.sp-hs strong { color: #008a84; font-feature-settings: 'tnum'; }
</style>
