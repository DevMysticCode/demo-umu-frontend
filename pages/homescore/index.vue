<template>
  <div class="hs-idx-page">
    <!-- Header -->
    <div class="hs-idx-header">
      <button class="hs-idx-back" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M15 18l-6-6 6-6" stroke="#475569" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="hs-idx-header-center">
        <p class="hs-idx-header-title">HomeScore</p>
        <p class="hs-idx-header-sub">Search any UK property</p>
      </div>
      <div style="width:32px;flex-shrink:0;"/>
    </div>

    <div class="hs-idx-scroll">
      <!-- Hero card -->
      <div class="hs-idx-hero">
        <div class="hs-idx-hero-gauge">
          <svg viewBox="0 0 200 112" width="180">
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="14"
              stroke-dasharray="251 503" transform="rotate(180,100,100)" stroke-linecap="round"/>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#5eead4" stroke-width="14"
              stroke-dasharray="163 503" transform="rotate(180,100,100)" stroke-linecap="round"/>
            <text x="100" y="94" text-anchor="middle" font-size="42" font-weight="800" fill="#fff" font-family="sans-serif">65</text>
            <text x="100" y="110" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.7)" font-family="sans-serif">Average UK score</text>
          </svg>
        </div>
        <h1 class="hs-idx-hero-title">How green is your home?</h1>
        <p class="hs-idx-hero-sub">Instantly score any UK property using EPC &amp; public data. Refine it with 2-minute quiz to get your real number.</p>
      </div>

      <!-- Search bar -->
      <div class="hs-idx-search-wrap">
        <div class="hs-idx-search-box" :class="{ focused: inputFocused }">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" style="flex-shrink:0;">
            <circle cx="11" cy="11" r="7" stroke="#94a3b8" stroke-width="2"/>
            <path d="M16.5 16.5L21 21" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input
            ref="inputEl"
            v-model="query"
            class="hs-idx-search-input"
            placeholder="Postcode or address…"
            @focus="inputFocused = true"
            @blur="inputFocused = false"
            @keydown.enter="doSearch"
          />
          <button v-if="query" class="hs-idx-search-clear" @click="query = ''; results = []; searched = false">
            <svg viewBox="0 0 24 24" fill="none" width="15" height="15">
              <path d="M18 6L6 18M6 6l12 12" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <button class="hs-idx-search-btn" @click="doSearch" :disabled="loading || query.length < 2">
          {{ loading ? '…' : 'Search' }}
        </button>
      </div>

      <!-- Feature pills -->
      <div v-if="!results.length && !loading && !searched" class="hs-idx-pills">
        <div class="hs-idx-pill">
          <span class="hs-idx-pill-icon">⚡</span>
          <div>
            <div class="hs-idx-pill-title">Auto-scored instantly</div>
            <div class="hs-idx-pill-sub">From public EPC &amp; register data</div>
          </div>
        </div>
        <div class="hs-idx-pill">
          <span class="hs-idx-pill-icon">🎯</span>
          <div>
            <div class="hs-idx-pill-title">Refine with your answers</div>
            <div class="hs-idx-pill-sub">11 questions · under 2 minutes</div>
          </div>
        </div>
        <div class="hs-idx-pill">
          <span class="hs-idx-pill-icon">💷</span>
          <div>
            <div class="hs-idx-pill-title">See your savings potential</div>
            <div class="hs-idx-pill-sub">Real £/yr energy cost breakdown</div>
          </div>
        </div>
      </div>

      <!-- Loading skeletons -->
      <div v-if="loading" class="hs-idx-results-list">
        <div v-for="i in 4" :key="i" class="hs-idx-skeleton">
          <div class="hs-idx-skel-icon"/>
          <div style="flex:1;display:flex;flex-direction:column;gap:7px;">
            <div class="hs-idx-skel-line" style="width:65%;"/>
            <div class="hs-idx-skel-line" style="width:40%;"/>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-else-if="results.length" class="hs-idx-results-section">
        <p class="hs-idx-results-label">{{ results.length }} propert{{ results.length === 1 ? 'y' : 'ies' }} found</p>
        <div class="hs-idx-results-list">
          <button
            v-for="prop in results"
            :key="prop.id"
            class="hs-idx-result-item"
            @click="goToScore(prop.id)"
          >
            <div class="hs-idx-result-icon">🏠</div>
            <div class="hs-idx-result-info">
              <p class="hs-idx-result-addr">{{ prop.addressLine1 }}</p>
              <p class="hs-idx-result-sub">{{ prop.postcode }}{{ prop.city ? ' · ' + prop.city : '' }}{{ prop.propertyType ? ' · ' + prop.propertyType : '' }}</p>
            </div>
            <div class="hs-idx-result-right">
              <span v-if="prop.epcRating" class="hs-idx-epc-badge" :style="{ background: epcColor(prop.epcRating) }">EPC {{ prop.epcRating }}</span>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16" style="flex-shrink:0;">
                <path d="M9 18l6-6-6-6" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- No results -->
      <div v-else-if="searched && !loading" class="hs-idx-empty">
        <div style="font-size:40px;margin-bottom:10px;">🔍</div>
        <p class="hs-idx-empty-title">No properties found</p>
        <p class="hs-idx-empty-sub">Try a different postcode or full address</p>
      </div>

      <div style="height:40px"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'

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
    D: '#d4e800', E: '#ffbf00', F: '#ff6600', G: '#ff0000',
  }
  return map[rating?.toUpperCase()] ?? '#8e8e93'
}
</script>

<style scoped>
/* ── Page ─────────────────────────────────────────────── */
.hs-idx-page {
  min-height: 100dvh;
  background: #f0f4f4;
  color: #0f172a;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── Header ───────────────────────────────────────────── */
.hs-idx-header {
  background: #f0f4f4;
  display: flex;
  align-items: center;
  padding: 14px 18px 10px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.hs-idx-back {
  width: 32px; height: 32px; border-radius: 50%;
  background: #fff; border: 1px solid #e2e8e8;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0;
}
.hs-idx-back:active { background: #e8f0f0; }
.hs-idx-header-center { flex: 1; text-align: center; }
.hs-idx-header-title { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0; }
.hs-idx-header-sub { font-size: 11px; color: #94a3b8; margin: 1px 0 0; }

/* ── Scroll ───────────────────────────────────────────── */
.hs-idx-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 6px 18px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Hero card ────────────────────────────────────────── */
.hs-idx-hero {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  border-radius: 24px;
  padding: 28px 24px 24px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hs-idx-hero::before {
  content: '';
  position: absolute;
  right: -50px; top: -50px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%);
}
.hs-idx-hero-gauge { margin-bottom: 16px; }
.hs-idx-hero-title {
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 8px;
  line-height: 1.2;
}
.hs-idx-hero-sub {
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.5;
  margin: 0;
  max-width: 280px;
}

/* ── Search ───────────────────────────────────────────── */
.hs-idx-search-wrap {
  display: flex;
  gap: 10px;
  align-items: center;
}
.hs-idx-search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 14px;
  border: 1.5px solid #e2e8e8;
  padding: 0 12px;
  height: 50px;
  gap: 8px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.hs-idx-search-box.focused {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
}
.hs-idx-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  background: transparent;
  color: #0f172a;
  min-width: 0;
}
.hs-idx-search-input::placeholder { color: #94a3b8; }
.hs-idx-search-clear {
  background: none; border: none; padding: 2px;
  cursor: pointer; display: flex; align-items: center;
}
.hs-idx-search-btn {
  height: 50px;
  padding: 0 22px;
  background: #0d9488;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.hs-idx-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.hs-idx-search-btn:active { opacity: 0.85; }

/* ── Feature pills ────────────────────────────────────── */
.hs-idx-pills { display: flex; flex-direction: column; gap: 8px; }
.hs-idx-pill {
  background: white;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(15,23,42,0.05);
  border: 1px solid rgba(15,23,42,0.04);
}
.hs-idx-pill-icon { font-size: 22px; flex-shrink: 0; }
.hs-idx-pill-title { font-size: 13.5px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.hs-idx-pill-sub { font-size: 11.5px; color: #64748b; }

/* ── Results ──────────────────────────────────────────── */
.hs-idx-results-section { display: flex; flex-direction: column; gap: 8px; }
.hs-idx-results-label {
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 2px;
  margin: 0;
}
.hs-idx-results-list { display: flex; flex-direction: column; gap: 2px; }
.hs-idx-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 16px;
  padding: 14px 16px;
  border: none;
  text-align: left;
  cursor: pointer;
  width: 100%;
  transition: background 0.12s;
}
.hs-idx-result-item:active { background: #f0fdfa; }
.hs-idx-result-icon {
  width: 40px; height: 40px;
  background: #f0fdfa;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.hs-idx-result-info { flex: 1; min-width: 0; }
.hs-idx-result-addr {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 2px;
}
.hs-idx-result-sub { font-size: 12px; color: #64748b; margin: 0; }
.hs-idx-result-right {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.hs-idx-epc-badge {
  font-size: 10px;
  font-weight: 800;
  color: white;
  padding: 2px 7px;
  border-radius: 6px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

/* ── Skeleton ─────────────────────────────────────────── */
.hs-idx-skeleton {
  background: white;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.hs-idx-skel-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: #f1f5f9;
  flex-shrink: 0;
}
.hs-idx-skel-line {
  height: 11px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: hs-shimmer 1.2s infinite;
}
@keyframes hs-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty ────────────────────────────────────────────── */
.hs-idx-empty {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  padding: 40px 0;
}
.hs-idx-empty-title {
  font-size: 16px; font-weight: 700;
  color: #0f172a; margin: 0 0 4px;
}
.hs-idx-empty-sub { font-size: 13px; color: #64748b; margin: 0; }
</style>
