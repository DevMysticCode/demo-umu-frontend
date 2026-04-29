<template>
  <div class="psi-wrap" :class="[`psi-wrap--${variant}`, { 'psi-wrap--open': showDropdown && results.length > 0 }]">
    <div class="psi-input-wrap">
      <svg class="psi-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
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
      <button v-else-if="query" class="psi-clear" @click="clearQuery" aria-label="Clear">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

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
          <!-- Top row: house ic, address + postcode, optional HS score on the right -->
          <div class="psi-drop-top">
            <div class="psi-drop-ic">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div class="psi-drop-body">
              <div class="psi-drop-title">{{ r.addressLine1 || r.address || '—' }}</div>
              <div class="psi-drop-sub">
                <span v-if="r.city">{{ r.city }} · </span>{{ r.postcode || '' }}
              </div>
            </div>
            <div
              v-if="(r.homeScore ?? r.epcScore) != null"
              class="psi-drop-hs"
              :style="{ color: hsColor(r.homeScore ?? r.epcScore) }"
            >
              HS™ {{ r.homeScore ?? r.epcScore }}
            </div>
          </div>

          <!-- Bottom badge strip: EPC + Passport state -->
          <div class="psi-drop-badges">
            <span
              v-if="r.epcRating"
              class="psi-drop-badge"
              :style="{ background: epcColor(r.epcRating) }"
            >
              ⚡ EPC {{ r.epcRating }}
            </span>
            <span
              v-if="r.hasPassport && r.passportPublished"
              class="psi-drop-badge psi-drop-badge--pub"
            >
              <img src="/op-icons/passportview/umu-passport.png" alt="" class="psi-drop-badge-ic" />
              Passport Published
            </span>
            <span
              v-else-if="r.hasPassport"
              class="psi-drop-badge psi-drop-badge--prog"
            >
              <img src="/op-icons/passportview/umu-passport.png" alt="" class="psi-drop-badge-ic" />
              Passport In Progress
            </span>
            <span
              v-else
              class="psi-drop-badge psi-drop-badge--unclaimed"
            >
              <img src="/op-icons/passportview/umu-passport.png" alt="" class="psi-drop-badge-ic" />
              Unclaimed · Claim yours? →
            </span>
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
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter postcode or address',
  variant: 'light',
  preferPassport: false,
  showPassportStatus: false,
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
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
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
    const { items, total: t } = await fetchPage(query.value, results.value.length)
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

function epcColor(rating: string): string {
  const map: Record<string, string> = {
    A: '#00b050', B: '#33b800', C: '#92d050',
    D: '#a39200', E: '#e08a00', F: '#ff6600', G: '#ff0000',
  }
  return map[(rating ?? '').toUpperCase()] ?? '#8e8e93'
}

function hsColor(score: number | null | undefined): string {
  if (score == null) return '#8e8e93'
  if (score >= 75) return '#0d9488'
  if (score >= 60) return '#65a30d'
  if (score >= 45) return '#ca8a04'
  if (score >= 30) return '#d97706'
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

.psi-icon {
  position: absolute;
  left: 14px;
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
.psi-wrap--light .psi-icon { stroke: #94a3b8; }
.psi-wrap--light .psi-input:focus { border-color: #00a19a; background: #fff; }
.psi-wrap--light .psi-input::placeholder { color: #94a3b8; }

.psi-wrap--dark .psi-input {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.12);
  color: #fff;
}
.psi-wrap--dark .psi-icon { stroke: rgba(255,255,255,0.5); }
.psi-wrap--dark .psi-input:focus { border-color: #5eead4; background: rgba(255,255,255,0.12); }
.psi-wrap--dark .psi-input::placeholder { color: rgba(255,255,255,0.45); }
.psi-wrap--dark .psi-clear { color: rgba(255,255,255,0.6); }

.psi-spinner {
  position: absolute;
  right: 14px;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(148,163,184,0.3);
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: psi-spin 0.7s linear infinite;
}
@keyframes psi-spin { to { transform: rotate(360deg); } }

.psi-clear {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(148,163,184,0.15);
  color: #64748b;
  display: grid;
  place-items: center;
  cursor: pointer;
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
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
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
.psi-drop-item:last-child { border-bottom: none; }
.psi-drop-item:hover,
.psi-drop-item:active { background: #f0fdfa; }

.psi-drop-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.psi-drop-ic {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #f0fdfa;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.psi-drop-body { flex: 1; min-width: 0; }
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
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  white-space: nowrap;
}

/* Bottom badge strip: EPC + Passport state + HS */
.psi-drop-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 5px;
  padding-left: 42px;
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
  color: #008c86;
  border: 1px solid #b2e8e6;
}
.psi-drop-badge--hs {
  background: #f0fdfa;
  color: #0d9488;
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
.psi-drop-leave-active { transition: opacity 0.15s, transform 0.15s; }
.psi-drop-enter-from,
.psi-drop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
