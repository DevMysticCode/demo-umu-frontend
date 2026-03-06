<template>
  <Teleport to="body">
    <Transition name="sd-page">
      <div v-if="show" class="sd-fullscreen">
        <!-- Header -->
        <AppHeader
          title="Explore"
          :showBack="true"
          :isOverlay="true"
          right="profile"
          @back="$emit('close')"
        />

        <!-- Search bar row -->
        <div class="sd-search-row">
          <div class="sd-search-bar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              class="flex-shrink-0"
            >
              <circle cx="11" cy="11" r="7" stroke="#aaa" stroke-width="2" />
              <path
                d="M16.5 16.5L21 21"
                stroke="#aaa"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              class="sd-input"
              placeholder="City, area or postcode"
              @keyup.enter="doSearch"
              @input="onInput"
            />
            <button v-if="query" class="sd-clear-x" @click="clearSearch">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#aaa"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>
          <button class="sd-filter-btn" @click="showFilters = true">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path
                d="M3 6h18M7 12h10M11 18h2"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <!-- Filter chips -->
        <div class="sd-chips-row">
          <button class="sd-chip">
            Current Location
            <OPIcon name="currentLocation" class="w-[15px] h-[15px]" />
          </button>
          <button
            v-if="view === 'results' || view === 'map'"
            class="sd-chip sd-chip-active"
          >
            Passport Available
            <OPIcon name="passportAvailable" class="w-[15px] h-[15px]" />
          </button>
          <button class="sd-chip">
            Draw on Maps
            <OPIcon name="drawOnMaps" class="w-[15px] h-[15px]" />
          </button>
          <button v-if="view === 'suggestions'" class="sd-chip">
            Property
            <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
              <path
                d="M9 6l6 6-6 6"
                stroke="#00a19a"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <!-- ── SUGGESTIONS ── -->
        <div v-if="view === 'suggestions'" class="sd-scroll">
          <p class="sd-section-label">
            <OPIcon name="searchSuggestions" class="w-[15px] h-[15px]" />
            Search Suggestions
          </p>

          <div
            v-for="s in filteredSuggestions"
            :key="s.postcode"
            class="sd-sug-row"
            @click="selectSuggestion(s.postcode)"
          >
            <div class="sd-sug-body">
              <span class="sd-sug-addr">{{ s.address }}</span>
              <span class="sd-sug-sub">{{ s.area }} {{ s.postcode }}</span>
            </div>
            <div class="forward_icon_container">
              <OPIcon name="chevronRight" class="w-[13px] h-[13px]" />
            </div>
          </div>

          <div
            v-if="filteredSuggestions.length === 0 && query"
            class="sd-empty-msg"
          >
            No suggestions for "{{ query }}"
          </div>
        </div>

        <!-- ── RESULTS LIST ── -->
        <div v-else-if="view === 'results'" class="sd-scroll">
          <div v-if="searching" class="sd-loading">
            <div class="sd-spinner" />
          </div>
          <template v-else>
            <p class="sd-results-label">
              <OPIcon name="searchResults" class="w-[15px] h-[15px]" />
              {{ results.length }} Search Results
            </p>

            <div
              v-for="r in results"
              :key="r.id"
              class="sd-result-row"
              @click="selectProperty(r.id)"
            >
              <div class="sd-result-body">
                <h3 class="sd-result-name">{{ r.address }}</h3>
                <p class="sd-result-loc">{{ r.area || r.postcode }}</p>
                <p class="sd-result-price">{{ r.priceDisplay }}</p>
                <div class="sd-result-badges">
                  <div class="badge-check">
                    <svg viewBox="0 0 12 12" fill="none" width="9" height="9">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="white"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </div>
                  <span class="badge-pct">{{ mockMatch(r.id) }}%</span>
                  <span class="badge-pill">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      width="11"
                      height="11"
                      style="vertical-align: -1px"
                    >
                      <path
                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                        stroke="#555"
                        stroke-width="1.5"
                      />
                      <path
                        d="M9 22V12h6v10"
                        stroke="#555"
                        stroke-width="1.5"
                      />
                    </svg>
                    {{ r.bedrooms ?? '–' }}
                  </span>
                  <span class="badge-pill">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      width="11"
                      height="11"
                      style="vertical-align: -1px"
                    >
                      <path
                        d="M5 12h14M5 12V7a3 3 0 016 0v5"
                        stroke="#555"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                      <rect
                        x="2"
                        y="12"
                        width="20"
                        height="4"
                        rx="2"
                        stroke="#555"
                        stroke-width="1.5"
                      />
                    </svg>
                    {{ r.bathrooms ?? '–' }}
                  </span>
                  <span class="badge-pill">{{ r.type }}</span>
                </div>
                <div class="sd-result-sqft badge-pill">
                  <svg viewBox="0 0 24 24" fill="none" width="12" height="12">
                    <rect
                      x="3"
                      y="3"
                      width="7"
                      height="7"
                      rx="1"
                      stroke="#00a19a"
                      stroke-width="1.5"
                    />
                    <rect
                      x="14"
                      y="3"
                      width="7"
                      height="7"
                      rx="1"
                      stroke="#00a19a"
                      stroke-width="1.5"
                    />
                    <rect
                      x="3"
                      y="14"
                      width="7"
                      height="7"
                      rx="1"
                      stroke="#00a19a"
                      stroke-width="1.5"
                    />
                    <rect
                      x="14"
                      y="14"
                      width="7"
                      height="7"
                      rx="1"
                      stroke="#00a19a"
                      stroke-width="1.5"
                    />
                  </svg>
                  {{ r.sqftDisplay }}
                </div>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                width="16"
                height="16"
                class="flex-shrink-0 mt-1"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="#d0d0d5"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <div v-if="results.length === 0" class="sd-empty-msg">
              No results found. Try a different postcode or area.
            </div>
          </template>
        </div>

        <!-- ── MAP VIEW ── -->
        <div v-else-if="view === 'map'" class="sd-map-container">
          <div ref="mapEl" class="sd-map" />
          <div class="sd-map-cards">
            <p class="sd-results-label" style="padding: 12px 16px 0">
              {{ results.length }} Search Results
            </p>
            <div class="sd-map-list">
              <div
                v-for="r in results"
                :key="r.id"
                class="sd-result-row"
                @click="selectProperty(r.id)"
              >
                <div class="sd-result-body">
                  <h3 class="sd-result-name">{{ r.address }}</h3>
                  <p class="sd-result-loc">{{ r.area || r.postcode }}</p>
                  <p class="sd-result-price">{{ r.priceDisplay }}</p>
                  <div class="sd-result-badges">
                    <span class="badge-pill">{{ r.bedrooms ?? '–' }} bed</span>
                    <span class="badge-pill"
                      >{{ r.bathrooms ?? '–' }} bath</span
                    >
                    <span class="badge-pill">{{ r.type }}</span>
                  </div>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  width="16"
                  height="16"
                  class="flex-shrink-0 mt-1 ml-2"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="#d0d0d5"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- List / Map toggle -->
        <div v-if="view === 'results' || view === 'map'" class="sd-toggle-bar">
          <SegmentedSwitch
            :options="viewOptions"
            :model-value="view"
            @update:modelValue="handleViewSwitch"
          />
        </div>

        <!-- Filters bottom sheet -->
        <Transition name="sd-filters">
          <div
            v-if="showFilters"
            class="sd-filters-backdrop"
            @click.self="showFilters = false"
          >
            <div class="sd-filters-sheet">
              <div class="sd-filters-handle" />
              <FiltersModal
                @close="showFilters = false"
                @apply="applyFilters"
              />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { usePropertySearch } from '~/composables/usePropertySearch'
import FiltersModal from '~/components/search/FiltersModal.vue'
import AppHeader from '~/components/core/AppHeader.vue'
import SegmentedSwitch from '~/components/core/SegmentedSwitch.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const { searchProperties } = usePropertySearch()
const router = useRouter()

const inputRef = ref<HTMLInputElement | null>(null)
const mapEl = ref<HTMLElement | null>(null)

const query = ref('')
const view = ref<'suggestions' | 'results' | 'map'>('suggestions')
const searching = ref(false)
const results = ref<any[]>([])
const showFilters = ref(false)

let leafletMap: any = null

const viewOptions = [
  { label: 'List', value: 'results' },
  { label: 'Map', value: 'map' },
]

const handleViewSwitch = (val: string) => {
  if (val === 'map') switchToMap()
  else view.value = 'results'
}

const MOCK_SUGGESTIONS = [
  {
    address: '22, Elm Road',
    area: 'Teddington, Middlesex',
    postcode: 'TW11 8EA',
  },
  {
    address: '14, Maple Avenue',
    area: 'Twickenham, London',
    postcode: 'TW1 4AL',
  },
  {
    address: '78, Station Road',
    area: 'Staines-upon-Thames, Surrey',
    postcode: 'TW18 4HW',
  },
  {
    address: '45, High Street',
    area: 'Kingston-upon-Thames, Surrey',
    postcode: 'KT1 1AT',
  },
  {
    address: '102, Church Lane',
    area: 'Walton-on-Thames, Surrey',
    postcode: 'KT12 1QN',
  },
  {
    address: '56, Park Avenue',
    area: 'Richmond, London',
    postcode: 'TW10 6RD',
  },
]

const filteredSuggestions = computed(() => {
  if (!query.value) return MOCK_SUGGESTIONS
  const q = query.value.toLowerCase()
  return MOCK_SUGGESTIONS.filter(
    (s) =>
      s.address.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      s.postcode.toLowerCase().includes(q),
  )
})

const MATCH_SCORES: Record<string, number> = {}
const mockMatch = (id: string) => {
  if (!MATCH_SCORES[id]) MATCH_SCORES[id] = 50 + Math.floor(Math.random() * 45)
  return MATCH_SCORES[id]
}

const onInput = () => {
  if (view.value !== 'suggestions') view.value = 'suggestions'
}

const clearSearch = () => {
  query.value = ''
  view.value = 'suggestions'
  results.value = []
}

const selectSuggestion = (val: string) => {
  query.value = val
  doSearch()
}

const doSearch = async () => {
  const q = query.value.trim()
  if (!q) return
  view.value = 'results'
  searching.value = true
  try {
    results.value = await searchProperties(q)
  } catch {
    results.value = []
  } finally {
    searching.value = false
  }
}

const selectProperty = (id: string) => {
  emit('close')
  router.push(`/property/${id}`)
}

const applyFilters = () => {
  showFilters.value = false
}

// ── Map ──────────────────────────────────────────────────────────────────────
const loadLeaflet = (): Promise<any> =>
  new Promise((resolve) => {
    if ((window as any).L) return resolve((window as any).L)
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve((window as any).L)
    document.head.appendChild(script)
  })

const switchToMap = async () => {
  view.value = 'map'
  await nextTick()
  if (!mapEl.value) return

  const L = await loadLeaflet()
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }

  const validResults = results.value.filter((r) => r.latitude && r.longitude)
  const center: [number, number] =
    validResults.length > 0
      ? [validResults[0].latitude, validResults[0].longitude]
      : [51.5, -0.1]

  leafletMap = L.map(mapEl.value, { zoomControl: false }).setView(center, 14)
  L.control.zoom({ position: 'bottomright' }).addTo(leafletMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(leafletMap)

  const markerIcon = L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;border-radius:50%;background:#00a19a;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,161,154,0.5);border:3px solid white;">
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" stroke-width="2" fill="rgba(255,255,255,0.2)"/>
        <path d="M9 22V12h6v10" stroke="white" stroke-width="2"/>
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })

  validResults.forEach((r: any) => {
    L.marker([r.latitude, r.longitude], { icon: markerIcon })
      .addTo(leafletMap)
      .on('click', () => selectProperty(r.id))
  })

  if (validResults.length > 1) {
    leafletMap.fitBounds(
      L.latLngBounds(validResults.map((r: any) => [r.latitude, r.longitude])),
      { padding: [40, 40] },
    )
  }
}

watch(
  () => props.show,
  async (v) => {
    if (v) {
      query.value = ''
      view.value = 'suggestions'
      results.value = []
      showFilters.value = false
      await nextTick()
      inputRef.value?.focus()
    } else {
      if (leafletMap) {
        leafletMap.remove()
        leafletMap = null
      }
    }
  },
)
</script>

<style scoped>
/* ── Full screen overlay ─────────────────────────────────────────────────── */
.sd-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background: #f2f6f6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: env(safe-area-inset-top, 0px);
}

/* ── Search bar ──────────────────────────────────────────────────────────── */
.sd-search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px 12px;
  flex-shrink: 0;
}

.sd-search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border-radius: 14px;
  padding: 12px 14px;
  border: 1.5px solid #e8e8ee;
}

.sd-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  color: #1a1a1a;
}
.sd-input::placeholder {
  color: #aaa;
}

.sd-clear-x {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
}

.sd-filter-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #00a19a;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Chips ───────────────────────────────────────────────────────────────── */
.sd-chips-row {
  display: flex;
  gap: 8px;
  padding: 0 16px 12px;
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}
.sd-chips-row::-webkit-scrollbar {
  display: none;
}

.sd-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  padding: 6px 8px 6px 12px;
  border-radius: 20px;
  border: 0.33px solid #3c3c432e;
  background: white;
  font-size: 15px;
  font-weight: 400;
  color: #00a19a;
  cursor: pointer;
  flex-shrink: 0;
  letter-spacing: -0.23px;
  line-height: 20px;
}
.sd-chip-active {
  background: rgba(0, 161, 154, 0.08);
  border-color: #00a19a;
  color: #00a19a;
}

/* ── Scroll area ─────────────────────────────────────────────────────────── */
.sd-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 16px 100px;
  scrollbar-width: none;
}
.sd-scroll::-webkit-scrollbar {
  display: none;
}

/* ── Section labels ──────────────────────────────────────────────────────── */
.sd-section-label {
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #3c3c4399;
  margin: 4px 0 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sd-results-label {
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  color: #3c3c4399;
  margin: 0 0 12px;
}

/* ── Suggestion rows ─────────────────────────────────────────────────────── */
.sd-sug-row {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.sd-sug-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.sd-sug-addr {
  font-size: 15px;
  font-weight: 400;
  color: #000000;
  line-height: 20px;
  letter-spacing: -0.23px;
}

.sd-sug-sub {
  font-size: 13px;
  color: #3c3c4399;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.forward_icon_container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  width: 30px;
  border: 0.5px solid #d2d1e4;
  background: #f9f9fd;
  border-radius: 50%;
}

/* ── Result rows ─────────────────────────────────────────────────────────── */
.sd-result-row {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.sd-result-body {
  flex: 1;
  min-width: 0;
}

.sd-result-name {
  color: #000000;
  margin: 0 0 2px;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  vertical-align: middle;
}

.sd-result-loc {
  color: #3c3c4399;
  margin: 0 0 4px;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  vertical-align: middle;
}

.sd-result-price {
  color: #00a19a;
  margin: 0 0 8px;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  vertical-align: middle;
}

.sd-result-badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 6px;
}

.badge-check {
  width: 18px;
  height: 18px;
  background: #00a19a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-pct {
  font-size: 11px;
  font-weight: 700;
  background: #ff6b35;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge-pill {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #00a19a;
  background: #00a19a1a;
  padding: 2px 8px;
  border-radius: 4px;
  line-height: 13px;
  letter-spacing: -0.06px;
}

.sd-result-sqft {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #00a19a;
  font-weight: 400;
  max-width: fit-content;
}

/* ── Loading ─────────────────────────────────────────────────────────────── */
.sd-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.sd-spinner {
  width: 30px;
  height: 30px;
  border: 2.5px solid #e0e0e0;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.sd-empty-msg {
  font-size: 13px;
  color: #aaa;
  padding: 40px 0;
  text-align: center;
}

/* ── Map ─────────────────────────────────────────────────────────────────── */
.sd-map-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sd-map {
  height: 45%;
  min-height: 200px;
  flex-shrink: 0;
  z-index: 1;
}

.sd-map-cards {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
}
.sd-map-cards::-webkit-scrollbar {
  display: none;
}

.sd-map-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 16px 100px;
}

/* ── List/Map toggle ─────────────────────────────────────────────────────── */
.sd-toggle-bar {
  padding: 10px 16px 16px;
  flex-shrink: 0;
}

/* ── Filters sheet ───────────────────────────────────────────────────────── */
.sd-filters-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sd-filters-sheet {
  width: 100%;
  max-width: 448px;
  border-radius: 28px 28px 0 0;
  overflow: hidden;
  background: white;
  padding-top: 12px;
  max-height: 90vh;
  overflow-y: auto;
}

.sd-filters-handle {
  width: 36px;
  height: 4px;
  background: #d0d0d5;
  border-radius: 2px;
  margin: 0 auto 16px;
}

/* ── Transitions ─────────────────────────────────────────────────────────── */
.sd-page-enter-active,
.sd-page-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.25s ease;
}
.sd-page-enter-from,
.sd-page-leave-to {
  opacity: 0;
  transform: translateY(24px);
}

.sd-filters-enter-active,
.sd-filters-leave-active {
  transition: opacity 0.2s ease;
}
.sd-filters-enter-active .sd-filters-sheet,
.sd-filters-leave-active .sd-filters-sheet {
  transition: transform 0.25s ease;
}
.sd-filters-enter-from,
.sd-filters-leave-to {
  opacity: 0;
}
.sd-filters-enter-from .sd-filters-sheet,
.sd-filters-leave-to .sd-filters-sheet {
  transform: translateY(100%);
}
</style>
