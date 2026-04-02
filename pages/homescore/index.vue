<template>
  <div class="hs-search-page">
    <!-- Header -->
    <AppHeader title="Home Score" :showBack="true" />

    <main class="hs-search-main">
      <!-- Hero -->
      <div class="hs-hero">
        <div class="hs-hero-ring">
          <svg viewBox="0 0 120 120" width="96" height="96">
            <circle cx="60" cy="60" r="48" fill="#f0fafa" stroke="#00a19a" stroke-width="2" stroke-dasharray="4 6" />
            <circle cx="60" cy="60" r="36" fill="white" stroke="#e8f8f7" stroke-width="1" />
            <text x="60" y="55" text-anchor="middle" font-size="22" font-weight="800" fill="#00a19a" font-family="sans-serif">HS</text>
            <text x="60" y="71" text-anchor="middle" font-size="10" fill="#8e8e93" font-family="sans-serif">Score</text>
          </svg>
        </div>
        <h1 class="hs-hero-title">Home Score</h1>
        <p class="hs-hero-sub">Search any UK property to instantly generate its Home Score using EPC and public data — no questions required to start.</p>
      </div>

      <!-- Search bar -->
      <div class="hs-search-wrap">
        <div class="hs-search-box" :class="{ focused: inputFocused }">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" class="hs-search-icon">
            <circle cx="11" cy="11" r="7" stroke="#aaa" stroke-width="2" />
            <path d="M16.5 16.5L21 21" stroke="#aaa" stroke-width="2" stroke-linecap="round" />
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            class="hs-search-input"
            placeholder="Postcode or address..."
            @focus="inputFocused = true"
            @blur="inputFocused = false"
            @keydown.enter="doSearch"
          />
          <button v-if="query" class="hs-search-clear" @click="query = ''; results = []">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M18 6L6 18M6 6l12 12" stroke="#aaa" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
        <button class="hs-search-btn" :class="{ loading }" @click="doSearch" :disabled="loading || query.length < 2">
          {{ loading ? '...' : 'Search' }}
        </button>
      </div>

      <!-- Info chips -->
      <div v-if="!results.length && !loading" class="hs-chips">
        <div class="hs-chip">
          <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#00a19a" stroke-width="2"/></svg>
          Auto-scored from EPC data
        </div>
        <div class="hs-chip">
          <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#00a19a" stroke-width="2"/></svg>
          Improve with your answers
        </div>
        <div class="hs-chip">
          <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><circle cx="12" cy="12" r="10" stroke="#00a19a" stroke-width="2"/><path d="M12 6v6l4 2" stroke="#00a19a" stroke-width="2" stroke-linecap="round"/></svg>
          Takes under 2 minutes
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="hs-results-list">
        <div v-for="i in 4" :key="i" class="hs-result-skeleton">
          <div class="hs-skel-line wide"></div>
          <div class="hs-skel-line narrow"></div>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="results.length" class="hs-results-section">
        <p class="hs-results-label">{{ results.length }} propert{{ results.length === 1 ? 'y' : 'ies' }} found</p>
        <div class="hs-results-list">
          <button
            v-for="prop in results"
            :key="prop.id"
            class="hs-result-item"
            @click="goToScore(prop.id)"
          >
            <div class="hs-result-left">
              <div class="hs-result-icon">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="#00a19a" stroke-width="2" stroke-linejoin="round" />
                </svg>
              </div>
              <div class="hs-result-info">
                <p class="hs-result-address">{{ prop.addressLine1 }}</p>
                <p class="hs-result-sub">{{ prop.postcode }}{{ prop.city ? ' · ' + prop.city : '' }}</p>
              </div>
            </div>
            <div class="hs-result-right">
              <div v-if="prop.epcRating" class="hs-epc-badge" :style="{ background: epcColor(prop.epcRating) }">
                EPC {{ prop.epcRating }}
              </div>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M9 18l6-6-6-6" stroke="#c7c7cc" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- No results -->
      <div v-else-if="searched && !loading" class="hs-empty">
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
          <circle cx="32" cy="32" r="28" fill="#f5f5f8" />
          <circle cx="28" cy="28" r="14" stroke="#d1d5db" stroke-width="2.5" />
          <path d="M38 38l10 10" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <p class="hs-empty-title">No properties found</p>
        <p class="hs-empty-sub">Try a different postcode or address</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import AppHeader from '~/components/core/AppHeader.vue'

const router = useRouter()
const config = useRuntimeConfig()

const query = ref('')
const inputFocused = ref(false)
const loading = ref(false)
const searched = ref(false)
const results = ref<any[]>([])
const inputEl = ref<HTMLInputElement | null>(null)

async function doSearch() {
  const q = query.value.trim()
  if (q.length < 2) return
  loading.value = true
  searched.value = true
  try {
    const res = await fetch(`${config.public.apiBase}/property/search?q=${encodeURIComponent(q)}&limit=20`)
    if (res.ok) {
      const data = await res.json()
      results.value = data.items ?? []
    }
  } catch {
    results.value = []
  } finally {
    loading.value = false
  }
}

function goToScore(id: string) {
  router.push(`/homescore/${id}`)
}

function epcColor(rating: string): string {
  const map: Record<string, string> = {
    A: '#00b050', B: '#33b800', C: '#92d050',
    D: '#ffff00', E: '#ffbf00', F: '#ff6600', G: '#ff0000',
  }
  return map[rating?.toUpperCase()] ?? '#8e8e93'
}
</script>

<style scoped>
.hs-search-page {
  min-height: 100vh;
  background: #f5f5f8;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.hs-search-main {
  flex: 1;
  padding: 24px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Hero */
.hs-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0 4px;
}
.hs-hero-ring {
  margin-bottom: 14px;
}
.hs-hero-title {
  font-size: 22px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 8px;
}
.hs-hero-sub {
  font-size: 14px;
  color: #8e8e93;
  line-height: 1.5;
  max-width: 280px;
  margin: 0 auto;
}

/* Search */
.hs-search-wrap {
  display: flex;
  gap: 10px;
  align-items: center;
}
.hs-search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 14px;
  border: 1.5px solid #e8e8ee;
  padding: 0 12px;
  height: 50px;
  gap: 8px;
  transition: border-color 0.15s;
}
.hs-search-box.focused {
  border-color: #00a19a;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.12);
}
.hs-search-icon { flex-shrink: 0; }
.hs-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: #1a1a1a;
}
.hs-search-input::placeholder { color: #aeaeb2; }
.hs-search-clear {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.hs-search-btn {
  padding: 0 20px;
  height: 50px;
  background: #231d45;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.hs-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.hs-search-btn.loading { opacity: 0.7; }

/* Info chips */
.hs-chips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hs-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
  color: #3c3c43;
  font-weight: 500;
  box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}

/* Results */
.hs-results-section { display: flex; flex-direction: column; gap: 10px; }
.hs-results-label {
  font-size: 12px;
  color: #8e8e93;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 0 2px;
}
.hs-results-list { display: flex; flex-direction: column; gap: 2px; }
.hs-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 16px;
  padding: 14px 16px;
  border: none;
  text-align: left;
  cursor: pointer;
  gap: 12px;
  transition: background 0.12s;
  width: 100%;
}
.hs-result-item:active { background: #f2f2f7; }
.hs-result-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.hs-result-icon {
  width: 38px;
  height: 38px;
  background: #e8f8f7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hs-result-info { flex: 1; min-width: 0; }
.hs-result-address {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 2px;
}
.hs-result-sub {
  font-size: 12px;
  color: #8e8e93;
  margin: 0;
}
.hs-result-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.hs-epc-badge {
  font-size: 10px;
  font-weight: 800;
  color: white;
  padding: 2px 7px;
  border-radius: 6px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);
}

/* Skeleton */
.hs-result-skeleton {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hs-skel-line {
  height: 12px;
  background: linear-gradient(90deg, #f2f2f7 25%, #e8e8ee 50%, #f2f2f7 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.2s infinite;
}
.hs-skel-line.wide { width: 70%; }
.hs-skel-line.narrow { width: 45%; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty */
.hs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 32px 0;
}
.hs-empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #3c3c43;
  margin: 0;
}
.hs-empty-sub {
  font-size: 13px;
  color: #8e8e93;
  margin: 0;
}
</style>
