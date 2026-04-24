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
          <div class="psi-drop-meta">
            <div v-if="r.epcRating" class="psi-drop-epc" :style="{ background: epcColor(r.epcRating) }">
              <div class="psi-drop-epc-label">EPC</div>
              <div class="psi-drop-epc-rating">{{ r.epcRating }}</div>
            </div>
            <!-- Labelled passport status pill (when opted in via showPassportStatus) -->
            <template v-if="showPassportStatus && r.hasPassport">
              <div
                v-if="r.passportPublished"
                class="psi-drop-pp-pill psi-drop-pp-pill--published"
                aria-label="Passport published"
              >
                📘 Published
              </div>
              <div
                v-else
                class="psi-drop-pp-pill psi-drop-pp-pill--progress"
                aria-label="Passport in progress"
              >
                📘 In progress
              </div>
            </template>
            <!-- Fallback tiny icon for callers that don't opt into the pill -->
            <div
              v-else-if="r.hasPassport"
              class="psi-drop-pp-ic"
              aria-label="Passport available"
              :title="r.passportPublished ? 'Passport published' : 'Passport available'"
            >
              <svg width="14" height="14" viewBox="0 0 877.69 877.69" xmlns="http://www.w3.org/2000/svg">
                <circle fill="#231d45" cx="438.85" cy="438.85" r="438.85"/>
                <path fill="#fff" d="m573.6,497.11v21.8h-39.28l-.22-20.26c0-34.14-14.14-48.26-38.03-48.26s-38.03,14.12-38.03,48.26v41.36h-39.01v-42.9c0-52.88,28.77-82.14,77.29-82.14s77.29,29.26,77.29,82.14Z"/>
                <path fill="#fff" d="m379.84,415.26c48.52,0,77.29,29.26,77.29,82.14v42.9s-39.01,0-39.01,0v-41.36c0-34.14-13.9-48.26-38.03-48.26-23.89,0-38.03,14.12-38.03,48.26l-.15,20.26h-39.24s-.1-21.8-.1-21.8c0-52.88,28.77-82.14,77.29-82.14Z"/>
                <path fill="#5eead4" d="m689.16,439c-.03-11.46-8.86-20.75-19.76-20.75s-19.76,9.32-19.76,20.81h.04v92.38c0,34.14-14.14,48.26-38.03,48.26s-38.03-14.12-38.03-48.26v-12.54h-39.32v14.08c0,52.88,29.07,82.14,77.59,82.14s77.28-29.26,77.28-82.14v-93.98h-.02Z"/>
                <path fill="#5eead4" d="m187.37,439c.03-11.46,8.86-20.75,19.76-20.75,10.91,0,19.76,9.32,19.76,20.81h-.04v92.38c0,34.14,14.14,48.26,38.03,48.26,24.14,0,37.79-14.12,37.79-48.26v-12.54s39.25,0,39.25,0v14.08c0,52.88-28.77,82.14-77.29,82.14-48.52,0-77.28-29.26-77.28-82.14v-93.98s.02,0,.02,0Z"/>
                <path fill="#5eead4" d="m677.57,352.22l-226.28-134.71c-3.1-1.81-6.69-2.82-10.34-2.91h-.57l-.39-1.48h-.54c-3.68.1-7.26,1.11-10.38,2.93l-157.5,93.76v-16.4c0-10.74-9.3-19.48-20.72-19.48s-20.72,8.74-20.72,19.48v41.08l-27.33,16.27c-9.7,5.67-12.68,17.71-6.64,26.83,6.03,9.12,18.84,11.92,28.55,6.24l215.48-128.28,215.49,128.29c3.33,1.95,7.08,2.95,10.91,2.95,1.58,0,3.17-.17,4.74-.51,5.39-1.18,9.97-4.26,12.9-8.68,6.03-9.12,3.05-21.15-6.64-26.82Z"/>
              </svg>
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
    D: '#d4e800', E: '#ffbf00', F: '#ff6600', G: '#ff0000',
  }
  return map[(rating ?? '').toUpperCase()] ?? '#8e8e93'
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
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s;
}
.psi-drop-item:last-child { border-bottom: none; }
.psi-drop-item:hover,
.psi-drop-item:active { background: #f8f7fc; }

.psi-drop-ic {
  width: 32px;
  height: 32px;
  border-radius: 8px;
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
  color: #64748b;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
/* Right-side meta column: EPC badge stacked above the passport icon */
.psi-drop-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-right: 2px;
}

.psi-drop-epc {
  min-width: 28px;
  padding: 3px 5px;
  border-radius: 5px;
  color: #fff;
  text-align: center;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}
.psi-drop-epc-label {
  font-size: 6.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  opacity: 0.85;
  line-height: 1;
}
.psi-drop-epc-rating {
  font-size: 11px;
  font-weight: 900;
  line-height: 1.1;
  margin-top: 1px;
}

.psi-drop-pp-ic {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  overflow: hidden;
}
.psi-drop-pp-ic svg { display: block; }

/* Labelled passport status pills (opt-in via showPassportStatus prop) */
.psi-drop-pp-pill {
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 999px;
  white-space: nowrap;
  letter-spacing: 0.01em;
  line-height: 1.1;
}
.psi-drop-pp-pill--published {
  background: #231d45;
  color: #fff;
}
.psi-drop-pp-pill--progress {
  background: #fef3c7;
  color: #92400e;
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
