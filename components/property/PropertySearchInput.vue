<template>
  <div
    class="psi-wrap"
    :class="[
      `psi-wrap--${variant}`,
      { 'psi-wrap--open': showDropdown && results.length > 0 },
    ]"
  >
    <div class="psi-input-wrap" :class="{ 'psi-input-wrap--actions': showActions }">
      <div class="psi-input-core">
        <svg
          class="psi-icon"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          :value="query"
          type="text"
          :placeholder="placeholder"
          class="psi-input"
          @input="handleInput(($event.target as HTMLInputElement).value)"
          @focus="onFocus"
          @keyup.enter="onEnter"
        />
        <div v-if="loading" class="psi-spinner" />
        <button
          v-else-if="query"
          class="psi-clear"
          @click="clearQuery"
          aria-label="Clear"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <template v-if="showActions">
        <button
          type="button"
          class="psi-locate-btn"
          :disabled="locating"
          aria-label="Use my current location"
          @click="onLocateClick"
        >
          <span v-if="locating" class="psi-locate-spinner" />
          <svg
            v-else
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          </svg>
        </button>
        <button type="button" class="psi-search-btn" @click="onEnter">
          Search
        </button>
      </template>
    </div>
    <p v-if="showActions && locateError" class="psi-locate-error">
      {{ locateError }}
    </p>

    <!-- Dropdown — same markup/classes as SearchFilterBar.vue's address
         dropdown (dashboard/discover), so every address picker in the app
         renders one consistent design instead of two hand-synced ones. -->
    <Transition name="psi-drop">
      <div
        v-if="showDropdown && results.length > 0"
        ref="dropdownEl"
        class="psi-drop"
        @scroll="onDropdownScroll"
      >
        <div class="psi-drop-header">Select an address</div>
        <div
          v-for="r in results"
          :key="r.id"
          class="psi-drop-item"
          @mousedown.prevent="select(r)"
        >
          <div class="psi-drop-ic">
            <img
              src="/op-icons/homescore/houseSearch.png"
              alt=""
              style="width: 100%; height: 100%; object-fit: contain"
              loading="lazy"
            />
          </div>
          <div class="psi-drop-body">
            <div class="psi-drop-title">
              {{ r.addressLine1 || r.address || '-' }}
            </div>
            <div class="psi-drop-sub">
              <span v-if="r.city">{{ r.city }} · </span>{{ r.postcode || '' }}
            </div>
            <div class="psi-drop-passport-line">
              <img
                :src="passportStateOf(r) !== 'private'
                  ? '/op-icons/claim/padlockUnlocked.png'
                  : '/op-icons/claim/padlock.png'"
                alt=""
                class="psi-drop-badge-ic"
                loading="lazy"
              />
              {{ passportStateFullLabel(r) }}
            </div>
          </div>
          <!-- HS score — same circular gauge as the dashboard/discover
               search dropdown (SearchFilterBar.vue), not a bare number. -->
          <div v-if="(r.homeScore ?? r.epcScore) != null" class="psi-drop-hs">
            <span class="psi-drop-hs-caption">HomeScore</span>
            <div class="psi-drop-hs-gauge">
              <svg viewBox="0 0 40 40">
                <circle class="psi-drop-hs-gauge-bg" cx="20" cy="20" r="16" />
                <circle
                  class="psi-drop-hs-gauge-fill"
                  cx="20"
                  cy="20"
                  r="16"
                  :stroke="hsColor(r.homeScore ?? r.epcScore)"
                  stroke-dasharray="100.5"
                  :stroke-dashoffset="100.5 - (Math.min(r.homeScore ?? r.epcScore, 100) / 100) * 100.5"
                />
              </svg>
              <span class="psi-drop-hs-gauge-num" :style="{ color: hsColor(r.homeScore ?? r.epcScore) }">{{
                r.homeScore ?? r.epcScore
              }}</span>
            </div>
          </div>
        </div>
        <!-- Loading more indicator -->
        <div v-if="loadingMore" class="psi-drop-loading">
          <div class="psi-drop-spinner" />
        </div>
        <!-- End-of-results footer -->
        <div v-else-if="!hasMore && results.length > 0" class="psi-drop-end">
          {{ results.length }} of {{ total }} · all results shown
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  placeholder?: string
  variant?: 'light' | 'dark'
  /** Sort properties with published passports to the top of the dropdown */
  preferPassport?: boolean
  /** Show a labelled "Published" / "In progress" pill instead of the tiny circular icon */
  showPassportStatus?: boolean
  /** Render the "use my location" + "Search" buttons inside the pill */
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter postcode or address',
  variant: 'light',
  preferPassport: false,
  showPassportStatus: false,
  showActions: false,
})

const emit = defineEmits<{
  (e: 'select', property: any): void
  (e: 'enter', query: string): void
}>()

const config = useRuntimeConfig()

const PAGE_SIZE = 10

const query = ref('')
const results = ref<any[]>([])
const showDropdown = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const total = ref(0)
const dropdownEl = ref<HTMLElement | null>(null)
const hasMore = computed(() => results.value.length < total.value)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchPage(q: string, offset: number) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const res = await $fetch<any>(
    `${config.public.apiBase}/property/search?q=${encodeURIComponent(q)}&offset=${offset}&limit=${PAGE_SIZE}`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  )
  let items = res?.items ?? []
  if (props.preferPassport) {
    items = [...items].sort((a: any, b: any) => {
      const ap = a.hasPassport && a.passportPublished ? 1 : 0
      const bp = b.hasPassport && b.passportPublished ? 1 : 0
      return bp - ap
    })
  }
  return { items, total: res?.total ?? items.length }
}

function handleInput(val: string) {
  query.value = val
  if (debounceTimer) clearTimeout(debounceTimer)
  if (val.trim().length < 2) {
    results.value = []
    total.value = 0
    showDropdown.value = false
    loading.value = false
    return
  }
  loading.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const { items, total: t } = await fetchPage(val, 0)
      results.value = items
      total.value = t
      showDropdown.value = items.length > 0
    } catch {
      results.value = []
      total.value = 0
      showDropdown.value = false
    } finally {
      loading.value = false
    }
  }, 300)
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value || !query.value.trim()) return
  loadingMore.value = true
  try {
    const { items, total: t } = await fetchPage(
      query.value,
      results.value.length,
    )
    const existing = new Set(results.value.map((r) => r.id))
    for (const item of items) {
      if (!existing.has(item.id)) results.value.push(item)
    }
    total.value = t
  } catch {
    /* non-critical */
  } finally {
    loadingMore.value = false
  }
}

function onDropdownScroll() {
  const el = dropdownEl.value
  if (!el) return
  const threshold = 80
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
    loadMore()
  }
}

function onFocus() {
  if (results.value.length > 0) showDropdown.value = true
}

function onEnter() {
  if (results.value.length > 0) {
    select(results.value[0])
  } else {
    emit('enter', query.value.trim())
  }
}

function select(property: any) {
  query.value = property.addressLine1 || property.address || ''
  showDropdown.value = false
  emit('select', property)
}

function clearQuery() {
  query.value = ''
  results.value = []
  total.value = 0
  showDropdown.value = false
}

// "Use my location" → reverse-geocode via postcodes.io (free, keyless UK
// lookup — same approach as components/search/SearchDrawer.vue's
// useCurrentLocation) to the nearest postcode, then feed it into the
// normal debounced search flow. Errors are surfaced inline instead of
// swallowed — a silent failure here just looks like a dead button.
const locating = ref(false)
const locateError = ref('')
function onLocateClick() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    locateError.value = 'Geolocation is not supported on this device.'
    return
  }
  locating.value = true
  locateError.value = ''
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const res = await $fetch<any>(
          `https://api.postcodes.io/postcodes?lat=${latitude}&lon=${longitude}&limit=1`,
        )
        const postcode = res?.result?.[0]?.postcode
        if (!postcode) {
          locateError.value = 'Could not find a postcode for your location.'
          return
        }
        handleInput(postcode)
      } catch {
        locateError.value =
          'Could not determine your location. Try typing a postcode instead.'
      } finally {
        locating.value = false
      }
    },
    (err) => {
      locateError.value =
        err?.code === 1
          ? 'Location access denied - allow location access in your device settings.'
          : 'Could not determine your location. Try typing a postcode instead.'
      locating.value = false
    },
    { timeout: 10000, maximumAge: 60000 },
  )
}

// Same 4-state model + phrasing as SearchFilterBar.vue's dropdown, so
// both address pickers read identically rather than drifting apart again.
function passportStateOf(addr: any): 'unclaimed' | 'private' | 'partiallyPublic' | 'public' {
  if (!addr.hasPassport) return 'unclaimed'
  if (!addr.passportPublished) return 'private'
  return (addr.milestonePct ?? 0) >= 100 ? 'public' : 'partiallyPublic'
}
function passportStateFullLabel(addr: any): string {
  const s = passportStateOf(addr)
  if (s === 'unclaimed') return 'Property Passport unclaimed'
  if (s === 'partiallyPublic') return 'Property Passport claimed · Partially Public'
  if (s === 'public') return 'Property Passport claimed · Public'
  return 'Property Passport claimed · Private'
}

function hsColor(score: number | null | undefined): string {
  if (score == null) return '#8e8e93'
  if (score >= 75) return '#008a84'
  if (score >= 60) return '#65a30d'
  if (score >= 45) return '#ca8a04'
  if (score >= 30) return '#92400e'
  return '#dc2626'
}

defineExpose({ clearQuery })
</script>

<style scoped>
.psi-wrap {
  position: relative;
  width: 100%;
}

.psi-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.psi-input-core {
  position: relative;
  width: 100%;
}

.psi-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.psi-input {
  width: 100%;
  padding: 12px 40px 12px 38px;
  border-radius: 12px;
  border: 1.5px solid transparent;
  font-size: 13.5px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.psi-wrap--light .psi-input {
  background: #f8f7fc;
  border-color: #e5e7eb;
  color: #1f2024;
}
.psi-wrap--light .psi-icon {
  stroke: #94a3b8;
}
.psi-wrap--light .psi-input:focus {
  border-color: #00a19a;
  background: #fff;
}
.psi-wrap--light .psi-input::placeholder {
  color: #94a3b8;
}

.psi-wrap--dark .psi-input {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.psi-wrap--dark .psi-icon {
  stroke: rgba(255, 255, 255, 0.5);
}
.psi-wrap--dark .psi-input:focus {
  border-color: #00a19a;
  background: rgba(255, 255, 255, 0.12);
}
.psi-wrap--dark .psi-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}
.psi-wrap--dark .psi-clear {
  color: rgba(255, 255, 255, 0.6);
}

.psi-spinner {
  position: absolute;
  right: 14px;
  top: 50%;
  margin-top: -7px;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(148, 163, 184, 0.3);
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: psi-spin 0.7s linear infinite;
}
@keyframes psi-spin {
  to {
    transform: rotate(360deg);
  }
}

.psi-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
  display: grid;
  place-items: center;
  cursor: pointer;
}

/* ── Actions variant (location + Search button inside the pill) ── */
.psi-input-wrap--actions {
  background: #fff;
  border: 1.5px solid #e6e7eb;
  border-radius: 999px;
  padding: 6px;
  gap: 6px;
  overflow: hidden;
}
.psi-input-wrap--actions .psi-input-core {
  flex: 1;
  min-width: 0;
}
.psi-input-wrap--actions .psi-input {
  background: transparent;
  border: none;
  padding: 8px 4px 8px 34px;
}
.psi-input-wrap--actions .psi-input:focus {
  background: transparent;
  border: none;
}
.psi-locate-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #f1f2f6;
  color: #6b7280;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.psi-locate-btn:hover {
  background: #e7e8ee;
}
.psi-locate-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.psi-locate-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(107, 114, 128, 0.25);
  border-top-color: #6b7280;
  border-radius: 50%;
  animation: psi-spin 0.7s linear infinite;
}
.psi-locate-error {
  margin: 6px 4px 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #dc2626;
  line-height: 1.4;
}
.psi-search-btn {
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 13px 26px;
  font-size: 14px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}
.psi-search-btn:hover {
  background: #00918b;
}

/* ── Dropdown ── */
.psi-drop {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1.5px solid #e2f1ea;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  z-index: 40;
  max-height: 320px;
  overflow-y: auto;
}

.psi-drop-header {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 8px 14px 4px;
}

.psi-drop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s;
}
.psi-drop-item:last-child {
  border-bottom: none;
}
.psi-drop-item:hover,
.psi-drop-item:active {
  background: #f0fdfa;
}

.psi-drop-ic {
  width: 28px;
  height: 28px;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
}

.psi-drop-body {
  flex: 1;
  min-width: 0;
}
.psi-drop-title {
  font-size: 15px;
  font-weight: 700;
  color: #231d45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.psi-drop-sub {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 1px;
}
.psi-drop-passport-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.01em;
  margin-top: 4px;
  color: #00817c;
}

.psi-drop-hs {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.psi-drop-hs-caption {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #9c98ad;
}
.psi-drop-hs-gauge {
  position: relative;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}
.psi-drop-hs-gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.psi-drop-hs-gauge-bg {
  fill: none;
  stroke: #ededf3;
  stroke-width: 4;
}
.psi-drop-hs-gauge-fill {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s;
}
.psi-drop-hs-gauge-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  font-feature-settings: 'tnum';
}

.psi-drop-badge-ic {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.psi-drop-loading {
  display: flex;
  justify-content: center;
  padding: 14px;
}
.psi-drop-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: psi-spin 0.7s linear infinite;
}
.psi-drop-end {
  text-align: center;
  font-size: 10.5px;
  font-weight: 600;
  color: #94a3b8;
  padding: 10px 12px;
  background: #f8f7fc;
  border-top: 1px solid #f1f5f9;
}

/* Transitions */
.psi-drop-enter-active,
.psi-drop-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.psi-drop-enter-from,
.psi-drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
