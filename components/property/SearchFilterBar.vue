<template>
  <div class="sfb-root">
    <div class="search-wrap">
      <svg
        class="search-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#94a3b8"
        stroke-width="2.2"
        stroke-linecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        :value="modelValue"
        type="text"
        :placeholder="placeholder"
        class="search-input"
        :class="{ 'lightweight-input': lightweightMode }"
        @input="handleInput(($event.target as HTMLInputElement).value)"
        @keyup.enter="onEnter"
        @blur="showDropdown = false"
      />
      <!-- Unified distance + filters pill (Explore's .exp-dist-btn). Not in
           lightweightMode — that page opens its own filters modal after a
           location is picked, instead of this inline sheet. -->
      <button
        v-if="!lightweightMode"
        type="button"
        class="exp-dist-btn"
        :class="{ 'has-filters': hasAnyFilters }"
        data-tour="filter-pill"
        @click="openFilterSheet"
      >
        <span>{{ distLabelShort(activeRadius) }}</span>
        <span class="filter-dot" />
        <span class="arrow">▾</span>
      </button>
      <button type="button" class="search-btn" @click="onEnter">Search</button>
    </div>

    <!-- Lightweight mode: plain AREA suggestions only (distinct
         city/county groupings from /property/search-areas), no property
         badges/HomeScore/individual addresses — picking one is equivalent
         to hitting Search, not "here's a property to view." -->
    <div v-if="lightweightMode && showDropdown && results.length > 0" class="addr-drop">
      <div class="addr-drop-header">Areas</div>
      <div
        v-for="(addr, i) in results"
        :key="i"
        class="addr-item"
        @mousedown.prevent="selectAddress(addr)"
      >
        <div class="addr-ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="#00a19a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div class="addr-body">
          <div class="addr-line1">{{ addr.label }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="showDropdown && results.length > 0" class="addr-drop">
      <div class="addr-drop-header">Select an address</div>
      <div
        v-for="(addr, i) in results"
        :key="i"
        class="addr-item"
        @mousedown.prevent="selectAddress(addr)"
      >
        <div class="addr-ic">
          <img
            src="/op-icons/homescore/houseSearch.png"
            alt=""
            style="width: 100%; height: 100%; object-fit: contain"
            loading="lazy"
          />
        </div>
        <div class="addr-body">
          <div class="addr-line1">
            {{ addr.addressLine1 || addr.line1 || addr.address }}
          </div>
          <div class="addr-line2">
            <span v-if="addr.city">{{ addr.city }} · </span
            >{{ addr.postcode || addr.addressLine2 || addr.line2 || '' }}
          </div>
          <div class="addr-badges">
            <span
              v-if="addr.epcRating"
              class="addr-badge"
              :style="{ background: epcDropColor(addr.epcRating) }"
            >
              ⚡ EPC {{ addr.epcRating }}
            </span>
            <span
              v-if="addr.hasPassport && addr.passportPublished"
              class="addr-badge addr-badge--pub"
            >
              <img src="/op-icons/passportview/umu-passport.png" alt="" class="addr-badge-ic" />
              Passport Published
            </span>
            <span v-else-if="addr.hasPassport" class="addr-badge addr-badge--prog">
              <img src="/op-icons/passportview/umu-passport.png" alt="" class="addr-badge-ic" />
              Passport In Progress
            </span>
            <span v-else class="addr-badge addr-badge--unclaimed">
              <img src="/op-icons/passportview/umu-passport.png" alt="" class="addr-badge-ic" />
              Unclaimed · Claim yours? →
            </span>
          </div>
        </div>
        <div
          v-if="(addr.homeScore ?? addr.epcScore) != null"
          class="addr-hs"
          :style="{ color: hsDropColor(addr.homeScore ?? addr.epcScore) }"
        >
          <span class="addr-hs-num">{{ addr.homeScore ?? addr.epcScore }}</span>
          <span class="addr-hs-lbl">HS</span>
        </div>
      </div>
    </div>

    <!-- Active-filter summary chips. Not in lightweightMode — filters live
         in the host page's own modal there. -->
    <div v-if="!lightweightMode && committedChips.length" class="filter-summary visible">
      <span v-for="c in committedChips" :key="c.key" class="fs-chip">
        <span>{{ c.label }}</span>
        <span class="x" role="button" tabindex="0" @click="removeCommittedFilter(c.key)">×</span>
      </span>
      <button type="button" class="fs-clear" @click="clearAllFilters">Clear all</button>
    </div>

    <!-- Distance + Filters bottom sheet — same dimensions/values/markup as
         Explore's (this component IS Explore's search bar, extracted).
         Not rendered in lightweightMode. -->
    <Teleport v-if="!lightweightMode" to="body">
      <div class="sheet-backdrop" :class="{ open: showFilters }" @click="closeFilterSheet" />
      <div class="sheet" :class="{ open: showFilters }" role="dialog" aria-modal="true">
        <div class="sheet-grabber-wrap" @click="closeFilterSheet">
          <div class="sheet-grabber" />
        </div>
        <div class="sheet-head">
          <div class="sheet-title">Distance &amp; filters</div>
          <button type="button" class="sheet-reset" :disabled="isDraftDefault" @click="resetDraft">
            Reset
          </button>
        </div>
        <div class="sheet-body">
          <div class="sheet-section">
            <div class="sheet-section-h">
              <div class="sheet-section-title">Search radius</div>
              <div class="sheet-section-value">{{ distLabelLong(draft.distance) }}</div>
            </div>
            <div class="dist-list">
              <div
                v-for="opt in distanceOptions"
                :key="opt.value === null ? 'exact' : opt.value"
                class="dist-row"
                :class="{ active: draft.distance === opt.value }"
                @click="draft.distance = opt.value"
              >
                <span class="dist-radio" />
                <span class="dist-label-wrap">
                  <span class="dist-label">{{ opt.label }}</span>
                  <span class="dist-hint">{{ opt.hint }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="sheet-section">
            <div class="sheet-section-h">
              <div class="sheet-section-title">Property type</div>
            </div>
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

          <div class="sheet-section">
            <div class="sheet-section-h">
              <div class="sheet-section-title">Bedrooms (min)</div>
            </div>
            <div class="chip-group">
              <button
                v-for="opt in bedsOptions"
                :key="opt.value === null ? 'any' : opt.value"
                type="button"
                class="chip"
                :class="{ active: draft.beds === opt.value }"
                @click="draft.beds = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="sheet-section">
            <div class="sheet-section-h">
              <div class="sheet-section-title">EPC rating (min)</div>
            </div>
            <div class="chip-group">
              <button
                type="button"
                class="chip"
                :class="{ active: draft.epc === null }"
                @click="draft.epc = null"
              >
                Any
              </button>
              <button
                v-for="opt in epcOptions"
                :key="opt.value"
                type="button"
                class="chip epc-chip"
                :class="{ active: draft.epc === opt.value }"
                @click="draft.epc = opt.value"
              >
                <span class="epc-tile" :style="{ background: opt.color }">{{ opt.value }}</span>
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div class="sheet-section">
            <div class="sheet-section-h">
              <div class="sheet-section-title">HomeScore (min)</div>
              <div class="sheet-section-value">{{ draft.hs === 0 ? 'Any' : draft.hs + '+' }}</div>
            </div>
            <div class="slider-row">
              <input
                type="range"
                class="slider"
                min="0"
                max="90"
                step="5"
                :value="draft.hs"
                :style="{ '--fill': (draft.hs / 90) * 100 + '%' }"
                @input="onHsInput(($event.target as HTMLInputElement).value)"
              />
              <div class="slider-scale">
                <span>Any</span><span>30</span><span>50</span><span>70</span><span>90</span>
              </div>
            </div>
          </div>

          <div class="sheet-section">
            <div class="toggle-row" @click="draft.passport = !draft.passport">
              <div class="tr-text">
                <div class="tr-title">Verified Passport only</div>
                <div class="tr-sub">
                  Show only properties with a full solicitor-grade Passport.
                </div>
              </div>
              <div class="toggle" :class="{ on: draft.passport }" />
            </div>
          </div>

          <div style="height: 8px" />
        </div>
        <div class="sheet-foot">
          <button type="button" class="sheet-cancel" @click="closeFilterSheet">Cancel</button>
          <button type="button" class="sheet-apply" @click="applyDraft">
            <span>Apply</span>
            <span v-if="draftFilterCount > 0" class="count">{{ draftFilterCount }}</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
// Explore's search bar + "Distance & filters" sheet, extracted verbatim so
// any page can mount the exact same component instead of a lookalike copy.
// This owns the dropdown (calls /property/search directly — no auth guard
// on that endpoint, so this works on guest pages too) and all filter state;
// the host page only reacts to what it emits.
export interface CommittedFilters {
  radius: number | null
  propertyType: string[]
  minBedrooms: number | null
  minEpc: string | null
  minHomeScore: number
  passportOnly: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    // Rightmove-style mode (Explore's new search flow): dropdown shows
    // plain location suggestions only (no property badges/HomeScore, small
    // limit), and picking one is equivalent to hitting Search — it does
    // NOT emit `select` with a full property object, since no specific
    // property has been chosen yet, only a location. The inline distance
    // pill / filter sheet / chip summary are hidden too; that page owns
    // its own post-search filters modal instead. Discover doesn't pass
    // this, so it keeps today's behavior byte-for-byte.
    lightweightMode?: boolean
  }>(),
  { placeholder: 'Search by postcode, address or area', lightweightMode: false },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'enter', query: string): void
  (e: 'select', property: any): void
  (e: 'filtersChange', filters: CommittedFilters): void
}>()

const config = useRuntimeConfig()

const showDropdown = ref(false)
const results = ref<any[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

function handleInput(val: string) {
  emit('update:modelValue', val)
  if (searchTimer) clearTimeout(searchTimer)
  if (val.trim().length < 2) {
    results.value = []
    showDropdown.value = false
    return
  }
  searchTimer = setTimeout(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      // Lightweight mode hits a dedicated AREA-suggestion endpoint (distinct
      // city/county groupings), not /property/search — the dropdown should
      // read as "where do you want to search", never a preview of actual
      // property results.
      const url = props.lightweightMode
        ? `${config.public.apiBase}/property/search-areas?q=${encodeURIComponent(val)}&limit=8`
        : `${config.public.apiBase}/property/search?q=${encodeURIComponent(val)}`
      const res = await $fetch<any>(
        url,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {},
      )
      results.value = res?.items ?? []
      showDropdown.value = results.value.length > 0
    } catch {
      results.value = []
      showDropdown.value = false
    }
  }, 300)
}

function selectAddress(addr: any) {
  showDropdown.value = false
  results.value = []
  if (props.lightweightMode) {
    // No specific property chosen yet — just an area. `addr.label` (e.g.
    // "Coventry, West Midlands") is display-only — submitting that whole
    // string breaks /property/search's `city CONTAINS q` matching, since
    // the stored city value ("Coventry") doesn't contain the combined
    // label. Use just the city (falling back to the postcode district)
    // as the actual search text, matching Rightmove (pick a suggestion →
    // land on the filtered search step).
    const text = addr.city || addr.postcode || addr.label || ''
    emit('update:modelValue', text)
    emit('enter', text)
    return
  }
  emit('select', addr)
}

function onEnter() {
  showDropdown.value = false
  emit('enter', props.modelValue)
}

function epcDropColor(rating: string): string {
  const map: Record<string, string> = {
    A: '#00b050', B: '#33b800', C: '#92d050', D: '#a39200',
    E: '#e08a00', F: '#ff6600', G: '#ff0000',
  }
  return map[(rating ?? '').toUpperCase()] ?? '#8e8e93'
}
function hsDropColor(score: number | null | undefined): string {
  if (score == null) return '#8e8e93'
  if (score >= 75) return '#008a84'
  if (score >= 60) return '#65a30d'
  if (score >= 45) return '#ca8a04'
  if (score >= 30) return '#92400e'
  return '#dc2626'
}

// ── Distance & filters — identical option sets/values to Explore's own,
// since this IS that same sheet now. ──
const showFilters = ref(false)
const activeRadius = ref<number | null>(null)
const committedPtype = ref<string[]>(['any'])
const committedBeds = ref<number | null>(null)
const committedEpc = ref<string | null>(null)
const committedHs = ref<number>(0)
const committedPassport = ref<boolean>(false)

interface FilterDraft {
  distance: number | null
  ptype: string[]
  beds: number | null
  epc: string | null
  hs: number
  passport: boolean
}
const draft = ref<FilterDraft>({
  distance: null,
  ptype: ['any'],
  beds: null,
  epc: null,
  hs: 0,
  passport: false,
})

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
const bedsOptions: { value: number | null; label: string }[] = [
  { value: null, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
]
const epcOptions = [
  { value: 'A', label: 'A', color: '#008060' },
  { value: 'B', label: 'B+', color: '#2EAB55' },
  { value: 'C', label: 'C+', color: '#93C949' },
  { value: 'D', label: 'D+', color: '#F4D63A' },
]
const PTYPE_LABELS: Record<string, string> = Object.fromEntries(
  propertyTypeOptions.map((o) => [o.value, o.label]),
)

function distLabelShort(v: number | null): string {
  return v == null ? 'Exact' : `${v} mi`
}
function distLabelLong(v: number | null): string {
  return v == null ? 'Just this address' : `Within ${v} ${v === 1 ? 'mile' : 'miles'}`
}
function isPtypeActive(value: string): boolean {
  return draft.value.ptype.includes(value)
}
function togglePtype(value: string) {
  if (value === 'any') {
    draft.value.ptype = ['any']
    return
  }
  const cur = draft.value.ptype.filter((v) => v !== 'any')
  if (cur.includes(value)) {
    const next = cur.filter((v) => v !== value)
    draft.value.ptype = next.length === 0 ? ['any'] : next
  } else {
    draft.value.ptype = [...cur, value]
  }
}
function onHsInput(raw: string) {
  draft.value.hs = parseInt(raw, 10) || 0
}

function isDraftDefaultObj(d: FilterDraft): boolean {
  return (
    d.distance == null &&
    d.ptype.length === 1 &&
    d.ptype[0] === 'any' &&
    d.beds == null &&
    d.epc == null &&
    d.hs === 0 &&
    !d.passport
  )
}
function countDraftFilters(d: FilterDraft): number {
  let n = 0
  if (d.distance != null) n++
  if (!(d.ptype.length === 1 && d.ptype[0] === 'any')) n += d.ptype.length
  if (d.beds != null) n++
  if (d.epc != null) n++
  if (d.hs !== 0) n++
  if (d.passport) n++
  return n
}
const isDraftDefault = computed(() => isDraftDefaultObj(draft.value))
const draftFilterCount = computed(() => countDraftFilters(draft.value))

const committedDraft = computed<FilterDraft>(() => ({
  distance: activeRadius.value,
  ptype: committedPtype.value,
  beds: committedBeds.value,
  epc: committedEpc.value,
  hs: committedHs.value,
  passport: committedPassport.value,
}))
const hasAnyFilters = computed(() => !isDraftDefaultObj(committedDraft.value))

const committedChips = computed<{ key: string; label: string }[]>(() => {
  const chips: { key: string; label: string }[] = []
  if (activeRadius.value != null) chips.push({ key: 'distance', label: distLabelShort(activeRadius.value) })
  if (!(committedPtype.value.length === 1 && committedPtype.value[0] === 'any')) {
    committedPtype.value.forEach((v) => chips.push({ key: `ptype:${v}`, label: PTYPE_LABELS[v] ?? v }))
  }
  if (committedBeds.value != null) chips.push({ key: 'beds', label: `${committedBeds.value}+ beds` })
  if (committedEpc.value != null) chips.push({ key: 'epc', label: `EPC ${committedEpc.value}+` })
  if (committedHs.value !== 0) chips.push({ key: 'hs', label: `HS ${committedHs.value}+` })
  if (committedPassport.value) chips.push({ key: 'passport', label: 'Passport only' })
  return chips
})

function emitFiltersChange() {
  emit('filtersChange', {
    radius: activeRadius.value,
    propertyType: committedPtype.value,
    minBedrooms: committedBeds.value,
    minEpc: committedEpc.value,
    minHomeScore: committedHs.value,
    passportOnly: committedPassport.value,
  })
}

function openFilterSheet() {
  draft.value = {
    distance: activeRadius.value,
    ptype: [...committedPtype.value],
    beds: committedBeds.value,
    epc: committedEpc.value,
    hs: committedHs.value,
    passport: committedPassport.value,
  }
  showFilters.value = true
}
function closeFilterSheet() {
  showFilters.value = false
}
function resetDraft() {
  draft.value = { distance: null, ptype: ['any'], beds: null, epc: null, hs: 0, passport: false }
}
function applyDraft() {
  activeRadius.value = draft.value.distance
  committedPtype.value = [...draft.value.ptype]
  committedBeds.value = draft.value.beds
  committedEpc.value = draft.value.epc
  committedHs.value = draft.value.hs
  committedPassport.value = draft.value.passport
  showFilters.value = false
  emitFiltersChange()
}
function removeCommittedFilter(key: string) {
  if (key === 'distance') activeRadius.value = null
  else if (key.startsWith('ptype:')) {
    const v = key.slice(6)
    const next = committedPtype.value.filter((p) => p !== v)
    committedPtype.value = next.length === 0 ? ['any'] : next
  } else if (key === 'beds') committedBeds.value = null
  else if (key === 'epc') committedEpc.value = null
  else if (key === 'hs') committedHs.value = 0
  else if (key === 'passport') committedPassport.value = false
  emitFiltersChange()
}
function clearAllFilters() {
  activeRadius.value = null
  committedPtype.value = ['any']
  committedBeds.value = null
  committedEpc.value = null
  committedHs.value = 0
  committedPassport.value = false
  emitFiltersChange()
}
</script>

<style scoped>
.sfb-root {
  position: relative;
}
.search-wrap {
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
}
.search-input {
  width: 100%;
  padding: 13px 158px 13px 40px;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  background: #f8f7fc;
  font-size: 14px;
  color: #1f2024;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}
.search-input:focus {
  border-color: #00a19a;
}
/* No distance/filters pill in lightweight mode — the Search button sits
   right after the text instead of leaving the pill's ghost space. */
.search-input.lightweight-input {
  padding-right: 82px;
}
.search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: #00a19a;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.exp-dist-btn {
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  color: #231d45;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 6px 10px;
  cursor: pointer;
  letter-spacing: -0.05px;
  transition: all 0.15s;
  flex-shrink: 0;
}
.exp-dist-btn:hover {
  background: #f2faf8;
  border-color: #c8eae6;
  color: #00514d;
}
.exp-dist-btn .arrow {
  font-size: 8px;
  color: #9c98ad;
  transition: transform 0.2s;
}
.exp-dist-btn.has-filters {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
}
.exp-dist-btn.has-filters .arrow {
  color: rgba(255, 255, 255, 0.7);
}
.exp-dist-btn .filter-dot {
  width: 6px;
  height: 6px;
  background: #f59e0b;
  border-radius: 50%;
  margin-left: 2px;
  display: none;
}
.exp-dist-btn.has-filters .filter-dot {
  display: block;
}

.filter-summary {
  display: none;
  padding-top: 10px;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-summary.visible {
  display: flex;
}
.fs-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 800;
  color: #00514d;
  background: #e0f4f1;
  border: 1px solid #c2e6df;
  border-radius: 999px;
  padding: 5px 10px;
  letter-spacing: -0.05px;
}
.fs-chip .x {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #00a19a;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  cursor: pointer;
  margin-left: 2px;
  line-height: 1;
}
.fs-clear {
  font-size: 11px;
  font-weight: 800;
  color: #6b6783;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  letter-spacing: -0.05px;
  font-family: inherit;
  margin-left: 4px;
}

.addr-drop {
  background: #fff;
  border: 1.5px solid #e2f1ea;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(35, 29, 69, 0.12);
  overflow: hidden;
  margin-top: 8px;
}
.addr-drop-header {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 8px 14px 4px;
}
.addr-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.12s;
}
.addr-item:last-child {
  border-bottom: none;
}
.addr-item:hover,
.addr-item:active {
  background: #f0fdfa;
}
.addr-ic {
  width: 28px;
  height: 28px;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
}
.addr-body {
  flex: 1;
  min-width: 0;
}
.addr-line1 {
  font-size: 15px;
  font-weight: 700;
  color: #231d45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.addr-line2 {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 1px;
}
.addr-hs {
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
.addr-hs-num {
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  font-feature-settings: 'tnum';
}
.addr-hs-lbl {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 2px;
}
.addr-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 5px;
}
.addr-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  white-space: nowrap;
  line-height: 1.4;
  color: #fff;
  letter-spacing: 0.01em;
}
.addr-badge-ic {
  width: 10px;
  height: 10px;
  object-fit: contain;
  flex-shrink: 0;
}
.addr-badge--pub {
  background: #231d45;
  color: #fff;
}
.addr-badge--prog {
  background: #fef3c7;
  color: #92400e;
}
.addr-badge--unclaimed {
  background: #f0fdfa;
  color: #00a19a;
  border: 1px solid #e2f1ea;
}

/* ── Distance & filters sheet ── */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 13, 40, 0);
  z-index: 200;
  pointer-events: none;
  transition: background 0.25s ease;
}
.sheet-backdrop.open {
  background: rgba(17, 13, 40, 0.55);
  pointer-events: auto;
}
.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24px 24px 0 0;
  z-index: 201;
  transform: translateY(100%);
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  flex-direction: column;
  max-height: 92dvh;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.18);
}
.sheet.open {
  transform: translateY(0);
}
.sheet-grabber-wrap {
  display: flex;
  justify-content: center;
  padding: 10px 0 4px;
  cursor: pointer;
}
.sheet-grabber {
  width: 36px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 999px;
}
.sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 22px 12px;
  border-bottom: 1px solid #f3f4f6;
}
.sheet-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.sheet-reset {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  color: #6b6783;
  cursor: pointer;
  letter-spacing: -0.05px;
  padding: 4px 0;
}
.sheet-reset:hover {
  color: #231d45;
}
.sheet-reset:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.sheet-body {
  overflow-y: auto;
  flex: 1;
}
.sheet-section {
  padding: 16px 22px 4px;
}
.sheet-section-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.sheet-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #6b6783;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.sheet-section-value {
  font-size: 12px;
  font-weight: 800;
  color: #00514d;
  letter-spacing: -0.05px;
  font-feature-settings: 'tnum';
}

.dist-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 4px;
}
.dist-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.dist-row:hover {
  background: #fff;
}
.dist-row.active {
  background: #fff;
  box-shadow: 0 1px 4px rgba(35, 29, 69, 0.06);
}
.dist-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #9c98ad;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.dist-row.active .dist-radio {
  border-color: #00a19a;
  background: #00a19a;
}
.dist-radio::after {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
  transition: opacity 0.15s;
}
.dist-row.active .dist-radio::after {
  opacity: 1;
}
.dist-label-wrap {
  flex: 1;
  min-width: 0;
}
.dist-label {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  letter-spacing: -0.15px;
  line-height: 1.2;
}
.dist-hint {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #6b6783;
  margin-top: 1px;
  letter-spacing: -0.05px;
}
.dist-row.active .dist-label {
  color: #00514d;
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

.slider-row {
  padding: 4px 4px 0;
}
.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #e5e7eb;
  outline: none;
  margin: 12px 0 6px;
}
.slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    to right,
    #00a19a 0%,
    #00a19a var(--fill, 0%),
    #e5e7eb var(--fill, 0%),
    #e5e7eb 100%
  );
}
.slider::-moz-range-track {
  height: 6px;
  border-radius: 999px;
  background: #e5e7eb;
}
.slider::-moz-range-progress {
  height: 6px;
  border-radius: 999px;
  background: #00a19a;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #00a19a;
  cursor: pointer;
  margin-top: -8px;
  box-shadow: 0 2px 6px rgba(0, 161, 154, 0.25);
}
.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #00a19a;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 161, 154, 0.25);
}
.slider-scale {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
  color: #9c98ad;
  margin-top: 2px;
  letter-spacing: 0.4px;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  cursor: pointer;
}
.toggle-row .tr-text {
  flex: 1;
  min-width: 0;
}
.toggle-row .tr-title {
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.15px;
  margin-bottom: 2px;
}
.toggle-row .tr-sub {
  font-size: 11px;
  font-weight: 500;
  color: #6b6783;
  letter-spacing: -0.05px;
  line-height: 1.3;
}
.toggle {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: #e5e7eb;
  position: relative;
  transition: background 0.18s;
  flex-shrink: 0;
}
.toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
}
.toggle.on {
  background: #00a19a;
}
.toggle.on::after {
  transform: translateX(16px);
}

.sheet-foot {
  padding: 14px 22px calc(24px + env(safe-area-inset-bottom));
  border-top: 1px solid #f3f4f6;
  background: #fff;
  display: flex;
  gap: 10px;
  align-items: center;
}
.sheet-cancel {
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
  letter-spacing: -0.05px;
  transition: all 0.15s;
}
.sheet-cancel:hover {
  background: #fff;
  border-color: #9c98ad;
}
.sheet-apply {
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
  letter-spacing: -0.1px;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.sheet-apply:hover {
  background: #00b6ae;
}
.sheet-apply .count {
  background: rgba(255, 255, 255, 0.22);
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 999px;
  font-weight: 800;
  font-feature-settings: 'tnum';
}
</style>
