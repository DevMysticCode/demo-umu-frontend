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

    <!-- Dropdown -->
    <Transition name="psi-drop">
      <div
        v-if="showDropdown && results.length > 0"
        ref="dropdownEl"
        class="psi-drop"
        @scroll="onDropdownScroll"
      >
        <div
          v-for="r in results"
          :key="r.id"
          class="psi-drop-item"
          @mousedown.prevent="select(r)"
        >
          <!-- Leading icon -->
          <div
            class="psi-drop-ic"
            style="
              width: 44px;
              height: 44px;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              background: transparent;
              overflow: hidden;
            "
          >
            <img
              src="/op-icons/homescore/houseSearch.png"
              alt=""
              style="width: 100%; height: 100%; object-fit: contain;"
              loading="lazy"
            />
          </div>
          <!-- Body column: title + sub + badges -->
          <div class="psi-drop-body">
            <div class="psi-drop-title">
              {{ r.addressLine1 || r.address || '—' }}
            </div>
            <div class="psi-drop-sub">
              <span v-if="r.city">{{ r.city }} · </span>{{ r.postcode || '' }}
            </div>
            <div class="psi-drop-badges">
              <span
                v-if="r.epcRating"
                class="psi-drop-badge"
                :style="{ background: epcColor(r.epcRating) }"
              >
                ⚡ EPC {{ r.epcRating }}
              </span>
              <span
                v-if="r.hasPassport && r.passportPublished && (r.milestonePct ?? 0) >= 100"
                class="psi-drop-badge psi-drop-badge--pub"
              >
                <img
                  src="/op-icons/passportview/umu-passport.png"
                  alt=""
                  class="psi-drop-badge-ic"
                />
                Claimed · Public
              </span>
              <span
                v-else-if="r.hasPassport && r.passportPublished"
                class="psi-drop-badge psi-drop-badge--pub"
              >
                <img
                  src="/op-icons/passportview/umu-passport.png"
                  alt=""
                  class="psi-drop-badge-ic"
                />
                Claimed · Partially Public
              </span>
              <span
                v-else-if="r.hasPassport"
                class="psi-drop-badge psi-drop-badge--prog"
              >
                <img
                  src="/op-icons/passportview/umu-passport.png"
                  alt=""
                  class="psi-drop-badge-ic"
                />
                Claimed · Private
              </span>
              <span v-else class="psi-drop-badge psi-drop-badge--unclaimed">
                <img
                  src="/op-icons/passportview/umu-passport.png"
                  alt=""
                  class="psi-drop-badge-ic"
                />
                Unclaimed · Claim yours? →
              </span>
            </div>
          </div>
          <!-- HS score — vertically centered with the entire row -->
          <div
            v-if="(r.homeScore ?? r.epcScore) != null"
            class="psi-drop-hs"
            :style="{ color: hsColor(r.homeScore ?? r.epcScore) }"
          >
            <span class="psi-drop-hs-num">{{ r.homeScore ?? r.epcScore }}</span>
            <span class="psi-drop-hs-lbl">HS</span>
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
          ? 'Location access denied — allow location access in your device settings.'
          : 'Could not determine your location. Try typing a postcode instead.'
      locating.value = false
    },
    { timeout: 10000, maximumAge: 60000 },
  )
}

function epcColor(rating: string): string {
  const map: Record<string, string> = {
    A: '#00b050',
    B: '#33b800',
    C: '#92d050',
    D: '#a39200',
    E: '#e08a00',
    F: '#ff6600',
    G: '#ff0000',
  }
  return map[(rating ?? '').toUpperCase()] ?? '#8e8e93'
}

function hsColor(score: number | null | undefined): string {
  if (score == null) return '#8e8e93'
  if (score >= 75) return '#00a19a'
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
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  z-index: 40;
  max-height: 320px;
  overflow-y: auto;
}

.psi-drop-item {
  display: block;
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

/* The dropdown item itself is now the horizontal flex row, so the HS score
   sits next to the entire body column (title + sub + badges) and is
   therefore vertically centered with all of it. */
.psi-drop-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.psi-drop-ic {
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.psi-drop-body {
  flex: 1;
  min-width: 0;
}
.psi-drop-title {
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.psi-drop-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}

.psi-drop-hs {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  letter-spacing: -0.4px;
  text-align: center;
  min-width: 40px;
}
.psi-drop-hs-num {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  font-feature-settings: 'tnum';
}
.psi-drop-hs-lbl {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Badge strip — now inside .psi-drop-body so no left-padding needed. */
.psi-drop-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 5px;
}
.psi-drop-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
  line-height: 1.4;
  color: #fff;
  letter-spacing: 0.01em;
}
.psi-drop-badge-ic {
  width: 10px;
  height: 10px;
  object-fit: contain;
  flex-shrink: 0;
}
.psi-drop-badge--pub {
  background: #231d45;
  color: #fff;
}
.psi-drop-badge--prog {
  background: #fef3c7;
  color: #92400e;
}
.psi-drop-badge--unclaimed {
  background: #f0fdfa;
  color: #00a19a;
  border: 1px solid #e2f1ea;
}
.psi-drop-badge--hs {
  background: #f0fdfa;
  color: #008a84;
  border: 1px solid #ccfbf1;
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
