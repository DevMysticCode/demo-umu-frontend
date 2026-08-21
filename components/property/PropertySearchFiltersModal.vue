<template>
  <Teleport to="body">
    <Transition name="psm-fade">
      <div v-if="modelValue" class="psm-overlay" @click.self="close">
        <div class="psm-card" role="dialog" aria-modal="true">
          <div class="psm-head">
            <div class="psm-title">Filters</div>
            <button type="button" class="psm-close" aria-label="Close" @click="close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="psm-body">
    <div class="psm-section">
      <div class="psm-section-title">Search radius</div>
      <select v-model="draft.radius" class="psm-select psm-select-full">
        <option
          v-for="opt in distanceOptions"
          :key="opt.value === null ? 'exact' : opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div class="psm-section">
      <div class="psm-section-title">Property type</div>
      <div class="chip-group">
        <button
          v-for="opt in propertyTypeOptions"
          :key="opt.value"
          type="button"
          class="chip"
          :class="{ active: isPtypeActive(opt.value) }"
          @click="togglePtype(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="psm-section">
      <div class="psm-section-title">Price range</div>
      <div class="psm-range-row">
        <div class="psm-range-field">
          <span class="psm-range-prefix">£</span>
          <input
            v-model.number="draft.minPrice"
            type="number"
            inputmode="numeric"
            min="0"
            placeholder="Min"
            class="psm-range-input"
          />
        </div>
        <div class="psm-range-field">
          <span class="psm-range-prefix">£</span>
          <input
            v-model.number="draft.maxPrice"
            type="number"
            inputmode="numeric"
            min="0"
            placeholder="Max"
            class="psm-range-input"
          />
        </div>
      </div>
      <div class="psm-hint">
        Estimated price — blends registry data with an automated
        valuation, so coverage varies by property.
      </div>
    </div>

    <div class="psm-section">
      <div class="psm-section-title">Bedrooms</div>
      <div class="psm-range-row">
        <select v-model="draft.minBedrooms" class="psm-select">
          <option :value="null">Min</option>
          <option v-for="n in 5" :key="n" :value="n">{{ n }}+</option>
        </select>
        <select v-model="draft.maxBedrooms" class="psm-select">
          <option :value="null">Max</option>
          <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
    </div>

    <div class="psm-section">
      <div class="psm-section-title">EPC rating (min)</div>
      <div class="chip-group">
        <button
          type="button"
          class="chip"
          :class="{ active: draft.minEpc === null }"
          @click="draft.minEpc = null"
        >
          Any
        </button>
        <button
          v-for="opt in epcOptions"
          :key="opt.value"
          type="button"
          class="chip epc-chip"
          :class="{ active: draft.minEpc === opt.value }"
          @click="draft.minEpc = opt.value"
        >
          <span class="epc-tile" :style="{ background: opt.color }">{{ opt.value }}</span>
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="psm-section">
      <div class="psm-section-title">Passport status</div>
      <div class="chip-group">
        <button
          v-for="opt in passportStatusOptions"
          :key="opt.value"
          type="button"
          class="chip"
          :class="{ active: draft.passportStatus.includes(opt.value) }"
          @click="togglePassportStatus(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

          </div>

          <div class="psm-footer-row">
            <button type="button" class="psm-reset-btn" :disabled="isDraftDefault" @click="resetDraft">
              Reset
            </button>
            <button type="button" class="psm-search-btn" @click="onSearch">
              Search
              <span v-if="draftFilterCount > 0" class="psm-count">{{ draftFilterCount }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface PropertySearchFilters {
  radius: number | null
  propertyType: string[]
  minBedrooms: number | null
  maxBedrooms: number | null
  minEpc: string | null
  minPrice: number | null
  maxPrice: number | null
  // 'unclaimed' | 'in_progress' | 'claimed'
  passportStatus: string[]
}

function defaultFilters(): PropertySearchFilters {
  return {
    radius: null,
    propertyType: ['any'],
    minBedrooms: null,
    maxBedrooms: null,
    minEpc: null,
    minPrice: null,
    maxPrice: null,
    passportStatus: [],
  }
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    initialFilters?: PropertySearchFilters
  }>(),
  { initialFilters: undefined },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'search', filters: PropertySearchFilters): void
}>()

function close() {
  emit('update:modelValue', false)
}

const draft = ref<PropertySearchFilters>({
  ...defaultFilters(),
  ...(props.initialFilters ?? {}),
})

// Re-seed the draft from whatever's currently committed each time the
// modal opens — same "draft seeded from committed" pattern
// SearchFilterBar's own sheet uses.
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      draft.value = { ...defaultFilters(), ...(props.initialFilters ?? {}) }
    }
  },
)

const distanceOptions: { value: number | null; label: string; hint: string }[] = [
  { value: null, label: 'Exact address only', hint: 'Score just this property' },
  { value: 0.5, label: 'Within 0.5 miles', hint: 'Same street & immediate neighbours' },
  { value: 1, label: 'Within 1 mile', hint: 'Roughly the same neighbourhood' },
  { value: 2, label: 'Within 2 miles', hint: 'Whole side of town' },
  { value: 5, label: 'Within 5 miles', hint: 'Across the city' },
  { value: 10, label: 'Within 10 miles', hint: 'Wider catchment' },
]
const propertyTypeOptions = [
  { value: 'any', label: 'Any' },
  { value: 'detached', label: 'Detached' },
  { value: 'semi', label: 'Semi' },
  { value: 'terraced', label: 'Terraced' },
  { value: 'flat', label: 'Flat' },
  { value: 'bungalow', label: 'Bungalow' },
]
const epcOptions = [
  { value: 'A', label: 'A', color: '#008060' },
  { value: 'B', label: 'B+', color: '#2EAB55' },
  { value: 'C', label: 'C+', color: '#93C949' },
  { value: 'D', label: 'D+', color: '#F4D63A' },
]
const passportStatusOptions: { value: string; label: string }[] = [
  { value: 'unclaimed', label: 'Unclaimed' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'claimed', label: 'Claimed' },
]

function isPtypeActive(value: string): boolean {
  return draft.value.propertyType.includes(value)
}
function togglePtype(value: string) {
  if (value === 'any') {
    draft.value.propertyType = ['any']
    return
  }
  const cur = draft.value.propertyType.filter((v) => v !== 'any')
  if (cur.includes(value)) {
    const next = cur.filter((v) => v !== value)
    draft.value.propertyType = next.length === 0 ? ['any'] : next
  } else {
    draft.value.propertyType = [...cur, value]
  }
}
function togglePassportStatus(value: string) {
  const cur = draft.value.passportStatus
  draft.value.passportStatus = cur.includes(value)
    ? cur.filter((v) => v !== value)
    : [...cur, value]
}

function countDraftFilters(d: PropertySearchFilters): number {
  let n = 0
  if (d.radius != null) n++
  if (!(d.propertyType.length === 1 && d.propertyType[0] === 'any')) n += d.propertyType.length
  if (d.minPrice != null) n++
  if (d.maxPrice != null) n++
  if (d.minBedrooms != null) n++
  if (d.maxBedrooms != null) n++
  if (d.minEpc != null) n++
  n += d.passportStatus.length
  return n
}
function isDraftDefaultObj(d: PropertySearchFilters): boolean {
  return countDraftFilters(d) === 0
}
const isDraftDefault = computed(() => isDraftDefaultObj(draft.value))
const draftFilterCount = computed(() => countDraftFilters(draft.value))

function resetDraft() {
  draft.value = defaultFilters()
}
function onSearch() {
  emit('search', { ...draft.value })
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* ── Centered popup (not a bottom sheet) ── */
.psm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 17, 42, 0.62);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.psm-card {
  width: 100%;
  max-width: 26rem;
  max-height: 88dvh;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 24px 60px rgba(35, 29, 69, 0.45);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-x: hidden;
}
.psm-head {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid #f3f4f6;
}
.psm-title {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.psm-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f4f4f6;
  border: none;
  color: #6b6783;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.psm-close:hover {
  background: #ece9f7;
  color: #231d45;
}
.psm-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 20px;
  /* Hide the scrollbar chrome while keeping the scroll behavior — this
     is a compact popup, not a page, and a visible track/thumb reads as
     clutter rather than a real navigation aid. */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.psm-body::-webkit-scrollbar {
  display: none;
}
.psm-footer-row {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 14px 20px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid #f3f4f6;
}

.psm-fade-enter-active,
.psm-fade-leave-active {
  transition: opacity 0.22s ease;
}
.psm-fade-enter-active .psm-card,
.psm-fade-leave-active .psm-card {
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.psm-fade-enter-from,
.psm-fade-leave-to {
  opacity: 0;
}
.psm-fade-enter-from .psm-card,
.psm-fade-leave-to .psm-card {
  transform: scale(0.94);
}

.psm-section {
  padding: 16px 4px 4px;
  border-bottom: 1px solid #f3f4f6;
}
.psm-section:first-child {
  padding-top: 4px;
}
.psm-section:last-child {
  border-bottom: none;
}
.psm-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #6b6783;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #231d45;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 8px 13px;
  cursor: pointer;
  letter-spacing: -0.05px;
  transition: all 0.15s;
}
.chip:hover {
  background: #f2faf8;
  border-color: #c8eae6;
}
.chip.active {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 161, 154, 0.25);
}
.chip.epc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-left: 8px;
}
.chip .epc-tile {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.chip.active .epc-tile {
  background: rgba(255, 255, 255, 0.25) !important;
}

.psm-range-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
/* .psm-range-field (price £ inputs) and .psm-select (bedrooms/radius
   dropdowns) sit side by side in the same rows and must read as the
   same control — same box height, padding, border, radius and type
   scale. A native <select> has its own intrinsic sizing that a plain
   flex row doesn't, so both get an explicit height/box-sizing here
   rather than relying on padding alone to end up equal. */
.psm-range-field,
.psm-select {
  box-sizing: border-box;
  height: 44px;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.psm-range-field {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
}
.psm-range-prefix {
  font-size: 13px;
  font-weight: 700;
  color: #9c98ad;
}
.psm-range-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
}
.psm-select {
  flex: 1;
  min-width: 0;
  padding: 0 30px 0 12px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
  /* Native select chrome (arrow, inset) varies by browser/OS enough to
     throw off the match with .psm-range-field above — replace it with
     one consistent chevron everywhere this class is used. */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%239c98ad' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}
.psm-select-full {
  width: 100%;
}
.psm-hint {
  font-size: 11px;
  color: #9c98ad;
  line-height: 1.4;
  margin-top: 8px;
}

.psm-reset-btn {
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
}
.psm-reset-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.psm-search-btn {
  flex: 1;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  background: #00a19a;
  border: none;
  border-radius: 999px;
  padding: 13px 18px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.psm-search-btn:hover {
  background: #00b6ae;
}
.psm-count {
  background: rgba(255, 255, 255, 0.22);
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 999px;
  font-weight: 800;
}
</style>
