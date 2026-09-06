<template>
  <div class="pse-root">
    <SearchFilterBar
      ref="searchFilterBarEl"
      v-model="searchQuery"
      :placeholder="placeholder"
      style="margin-bottom: 6px"
      :lightweight-mode="false"
      :use-typewriter-placeholder="useTypewriterPlaceholder"
      @enter="onEnterQuery"
      @select="onAddressSelect"
      @filtersChange="onFiltersChange"
    />

    <template v-if="searchMode">
      <div class="search-back-row">
        <button class="search-back-btn" @click="exitSearch">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div class="search-result-label">
          <template v-if="!searchLoading">
            <div class="srl-count">
              {{ searchTotal }} {{ searchTotal === 1 ? 'home' : 'homes' }} found
            </div>
            <div class="srl-query">"{{ searchQuery }}"</div>
          </template>
          <span v-else>Searching "{{ searchQuery }}"…</span>
        </div>
        <div class="view-toggle">
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            List
          </button>
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ active: viewMode === 'map' }"
            @click="viewMode = 'map'"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Map
          </button>
        </div>
      </div>

      <!-- Quick-filter chip row — Sort/Passport/HomeScore/Property type each
           open a small local popover; More opens the remaining filters
           (bedrooms + EPC) not already covered by a dedicated chip. All of
           this filters/sorts the already-fetched result set client-side —
           the backend has no sort concept and only a coarse 3-bucket
           passport status, not the 60%-threshold 4-state split used here. -->
      <div class="chip-row">
        <button
          type="button"
          class="quick-chip"
          :class="{ active: sortBy !== 'newest' }"
          @click="openPopover('sort')"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          {{ sortLabel }}
        </button>
        <button
          type="button"
          class="quick-chip"
          :class="{ active: passportStates.size < 4 }"
          @click="openPopover('passport')"
        >
          Passport
          <span v-if="passportStates.size < 4" class="chip-count">{{
            passportStates.size
          }}</span>
        </button>
        <button
          type="button"
          class="quick-chip"
          :class="{ active: minHomeScore > 0 }"
          @click="openPopover('homescore')"
        >
          HomeScore{{ minHomeScore > 0 ? ` ${minHomeScore}+` : '' }}
        </button>
        <button
          type="button"
          class="quick-chip"
          :class="{ active: propertyTypes[0] !== 'any' }"
          @click="openPopover('ptype')"
        >
          Property type
        </button>
        <button
          type="button"
          class="quick-chip"
          :class="{ active: minBeds != null || minEpc != null }"
          @click="openPopover('more')"
        >
          More
        </button>
      </div>

      <div v-if="searchLoading" class="skeletons">
        <div v-for="n in 4" :key="n" class="skeleton-card" />
      </div>

      <template v-else-if="displayedProperties.length > 0">
        <!-- ── List view ── -->
        <template v-if="viewMode === 'list'">
          <div
            v-for="prop in displayedProperties"
            :key="prop.id"
            class="prop-card"
            @click="navigateTo(props.resultBasePath + prop.id)"
          >
            <div class="prop-card-top">
              <div
                class="prop-thumb-wrap"
                :style="{
                  background:
                    prop.imgGradient ||
                    'linear-gradient(135deg,#dff4f0,#c8ebe6)',
                }"
              >
                <PropertyImage
                  :src="prop.imageUrl || prop.image"
                  :alt="prop.addressLine1 || prop.address"
                  :show-caption="false"
                  class="prop-thumb"
                />
                <div v-if="prop.images?.length" class="prop-photo-count">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="12" cy="12" r="3.5" />
                  </svg>
                  {{ prop.images.length }}
                </div>
              </div>
              <div class="prop-top-info">
                <div class="prop-top-price-row">
                  <div class="prop-price">
                    {{
                      prop.estimatedPrice
                        ? '£' + Math.round(prop.estimatedPrice).toLocaleString()
                        : prop.priceDisplay || 'POA'
                    }}
                  </div>
                  <div class="prop-badge-pp" :class="stateOf(prop)">
                    <!-- Single line (client feedback) - lock icon +
                         "Passport" caption + state value all in one row,
                         was stacked cap/value across two lines before. -->
                    <img
                      :src="stateOf(prop) !== 'private'
                        ? '/op-icons/claim/padlockUnlocked.png'
                        : '/op-icons/claim/padlock.png'"
                      alt=""
                      class="prop-badge-pp-lock"
                      loading="lazy"
                    />
                    <span class="prop-badge-pp-cap">Passport</span>
                    <span class="prop-badge-pp-val">{{ badgeLabel(prop) }}</span>
                  </div>
                </div>
                <div class="prop-address">
                  {{ prop.addressLine1 || prop.address }}
                </div>
                <div class="prop-area">
                  {{
                    prop.city
                      ? prop.city + ', ' + prop.postcode
                      : prop.area || prop.postcode || ''
                  }}
                </div>
                <div class="prop-pills">
                  <span
                    v-if="prop.propertyType || prop.type"
                    class="pill-grey"
                    >{{ prop.propertyType || prop.type }}</span
                  >
                  <span v-if="prop.tenure" class="pill-grey">{{
                    prop.tenure
                  }}</span>
                  <span
                    v-if="prop.epcRating"
                    class="epc-pill"
                    :style="{ background: epcColor(prop.epcRating) }"
                    >EPC {{ prop.epcRating }}</span
                  >
                  <!-- Moved up from the footer actions row, right-aligned
                       under the Passport badge (client feedback). -->
                  <button
                    type="button"
                    class="watch-btn watch-btn--top"
                    :class="{ active: watchedIds.has(prop.id) }"
                    @click.stop="onWatchClick(prop)"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
                      />
                    </svg>
                    {{ watchedIds.has(prop.id) ? 'Watching' : 'Watch' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="prop-body">
              <div class="prop-footer-row">
                <div v-if="homeScoreOf(prop) != null" class="footer-hs">
                  <div class="mini-ring">
                    <svg viewBox="0 0 40 40">
                      <circle class="mini-ring-bg" cx="20" cy="20" r="16" />
                      <circle
                        class="mini-ring-fill"
                        cx="20"
                        cy="20"
                        r="16"
                        :stroke="hsColor(homeScoreOf(prop))"
                        :stroke-dasharray="100.5"
                        :stroke-dashoffset="
                          100.5 -
                          (Math.min(homeScoreOf(prop), 100) / 100) * 100.5
                        "
                      />
                    </svg>
                    <span class="mini-ring-num">{{ homeScoreOf(prop) }}</span>
                  </div>
                  <div class="mini-hs-label">
                    HomeScore<br /><b
                      :style="{ color: hsColor(homeScoreOf(prop)) }"
                      >{{ hsLabel(homeScoreOf(prop)) }}</b
                    >
                  </div>
                </div>
                <div class="footer-divider" />
                <div class="footer-passport">
                  <div class="fp-text">
                    <div class="fp-title">{{ stateTitle(prop) }}</div>
                    <div class="fp-sub">{{ stateSub(prop) }}</div>
                  </div>
                  <!-- No completion % anywhere on this card, in any state
                       — matches property/[id].vue's floatClaimState (see
                       plans/watch-visibility-strategy-audit.md). -->
                  <svg
                    v-if="stateOf(prop) === 'public'"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#231d45"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3z"
                    />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <svg
                    v-else-if="stateOf(prop) === 'partiallyPublic'"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9185d6"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path
                      d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3z"
                    />
                  </svg>
                  <img
                    v-else-if="stateOf(prop) === 'unclaimed'"
                    src="/op-icons/claim/padlockUnlocked.png"
                    alt=""
                    class="footer-passport-lock"
                    loading="lazy"
                  />
                  <img
                    v-else
                    src="/op-icons/claim/padlock.png"
                    alt=""
                    class="footer-passport-lock"
                    loading="lazy"
                  />
                </div>
              </div>

              <div v-if="insightFor(prop)" class="prop-actions-row">
                <div
                  class="prop-insight"
                  :class="insightFor(prop)!.tone"
                >
                  <svg
                    v-if="insightFor(prop)!.tone === 'good'"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <svg
                    v-else-if="insightFor(prop)!.tone === 'warn'"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M12 9v4M12 17h.01" />
                    <path
                      d="M10.3 3.9 2 18a1.5 1.5 0 0 0 1.3 2.2h17.4A1.5 1.5 0 0 0 22 18L13.7 3.9a1.5 1.5 0 0 0-2.6 0z"
                    />
                  </svg>
                  <svg
                    v-else
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  {{ insightFor(prop)!.text }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="hasMoreResults"
            ref="loadMoreSentinel"
            class="load-more-sentinel"
          >
            <div v-if="searchLoadingMore" class="load-more-spinner" />
            <button v-else class="load-more-btn" @click="loadMoreResults">
              Load
              {{
                Math.min(
                  SEARCH_PAGE_SIZE,
                  searchTotal - searchProperties.length,
                )
              }}
              more
            </button>
          </div>
          <div v-else class="load-more-end">
            {{
              displayedProperties.length === 1
                ? '1 result shown'
                : displayedProperties.length + ' results shown'
            }}
          </div>
        </template>

        <!-- ── Map view ── -->
        <div v-else class="map-wrap">
          <div ref="mapEl" class="map-canvas" />
          <div v-if="!mapReady" class="map-loading">Loading map…</div>
        </div>
      </template>

      <div v-else class="no-results-msg">
        <div class="no-results-icon">
          <img src="/op-icons/homescore/magnifier.png" alt="" loading="lazy" />
        </div>
        <div class="no-results-text">No properties found</div>
        <div class="no-results-sub">Try a different postcode or area</div>
      </div>
    </template>

    <!-- ── Quick-filter popovers ── -->
    <Teleport to="body">
      <div
        class="psr-sheet-backdrop"
        :class="{ open: activePopover !== null }"
        @click="activePopover = null"
      />
      <div
        class="psr-sheet"
        :class="{ open: activePopover !== null }"
        role="dialog"
        aria-modal="true"
      >
        <div class="psr-sheet-grabber-wrap" @click="activePopover = null">
          <div class="psr-sheet-grabber" />
        </div>

        <template v-if="activePopover === 'sort'">
          <div class="psr-sheet-title">Sort by</div>
          <div class="psr-option-list">
            <div
              v-for="opt in sortOptions"
              :key="opt.value"
              class="psr-option-row"
              :class="{ active: sortBy === opt.value }"
              @click="sortBy = opt.value; activePopover = null"
            >
              <span class="psr-radio" />
              {{ opt.label }}
            </div>
          </div>
        </template>

        <template v-else-if="activePopover === 'passport'">
          <div class="psr-sheet-title">Passport status</div>
          <div class="psr-option-list">
            <div
              v-for="opt in passportStateOptions"
              :key="opt.value"
              class="psr-option-row psr-checkbox-row"
              @click="togglePassportState(opt.value)"
            >
              <span
                class="psr-checkbox"
                :class="{ checked: passportStates.has(opt.value) }"
              />
              {{ opt.label }}
            </div>
          </div>
          <div class="psr-sheet-foot">
            <button
              type="button"
              class="psr-btn-secondary"
              @click="passportStates = new Set(ALL_STATES)"
            >
              Select all
            </button>
            <button
              type="button"
              class="psr-btn-primary"
              @click="activePopover = null"
            >
              Done
            </button>
          </div>
        </template>

        <template v-else-if="activePopover === 'homescore'">
          <div class="psr-sheet-title">Minimum HomeScore</div>
          <div class="psr-slider-row">
            <input
              type="range"
              class="psr-slider"
              min="0"
              max="90"
              step="5"
              :value="minHomeScore"
              :style="{ '--fill': (minHomeScore / 90) * 100 + '%' }"
              @input="
                minHomeScore =
                  parseInt(($event.target as HTMLInputElement).value, 10) || 0
              "
            />
            <div class="psr-slider-scale">
              <span>Any</span><span>30</span><span>50</span><span>70</span
              ><span>90</span>
            </div>
          </div>
          <div class="psr-sheet-foot">
            <button
              type="button"
              class="psr-btn-secondary"
              @click="minHomeScore = 0"
            >
              Reset
            </button>
            <button
              type="button"
              class="psr-btn-primary"
              @click="activePopover = null"
            >
              Done
            </button>
          </div>
        </template>

        <template v-else-if="activePopover === 'ptype'">
          <div class="psr-sheet-title">Property type</div>
          <div class="psr-chip-group">
            <button
              v-for="opt in propertyTypeOptions"
              :key="opt.value"
              type="button"
              class="psr-chip"
              :class="{ active: propertyTypes.includes(opt.value) }"
              @click="togglePropertyType(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
          <div class="psr-sheet-foot">
            <button
              type="button"
              class="psr-btn-primary"
              style="flex: 1"
              @click="applyServerFilters(); activePopover = null"
            >
              Apply
            </button>
          </div>
        </template>

        <template v-else-if="activePopover === 'more'">
          <div class="psr-sheet-title">More filters</div>
          <div class="psr-sheet-section-title">Bedrooms (min)</div>
          <div class="psr-chip-group">
            <button
              v-for="opt in bedsOptions"
              :key="opt.value === null ? 'any' : opt.value"
              type="button"
              class="psr-chip"
              :class="{ active: minBeds === opt.value }"
              @click="minBeds = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <div class="psr-sheet-section-title" style="margin-top: 14px">
            EPC rating (min)
          </div>
          <div class="psr-chip-group">
            <button
              type="button"
              class="psr-chip"
              :class="{ active: minEpc === null }"
              @click="minEpc = null"
            >
              Any
            </button>
            <button
              v-for="opt in epcOptions"
              :key="opt.value"
              type="button"
              class="psr-chip"
              :class="{ active: minEpc === opt.value }"
              @click="minEpc = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <div class="psr-sheet-foot">
            <button
              type="button"
              class="psr-btn-primary"
              style="flex: 1"
              @click="applyServerFilters(); activePopover = null"
            >
              Apply
            </button>
          </div>
        </template>
      </div>
    </Teleport>

    <AuthGateModal
      v-model="authGateOpen"
      title="Sign in to watch properties"
      body="Create a free account to save properties, watch homes and get alerted the moment something changes."
    />
  </div>
</template>

<script setup lang="ts">
// The pre-"Rightmove-style" search experience: SearchFilterBar in its full
// (non-lightweight) mode — inline filter pill + "Distance & filters" sheet
// right in the bar, real address suggestions in the dropdown, Search/Enter
// showing a results list on the page itself. This is a DELIBERATE fork of
// PropertySearchExperience.vue (which now drives Explore's lightweight
// mode + a separate filters modal) rather than a shared component — Explore
// must stay on its current behavior untouched; only Discover/Dashboard get
// this restored version.
//
// Results header/cards/List-Map toggle match the "search list" redesign —
// 4 real passport states per card (unclaimed / no public passport / in
// progress / published), quick-filter chips, and a real Mapbox pin map.
// Sort + the 4-way passport split are client-side only: the backend has no
// sort concept, and its passportStatus filter only knows 3 coarse buckets
// (not the 60%-complete threshold this app already uses elsewhere to
// decide "in progress" vs "no public passport" — see
// property/[id].vue's floatClaimState). Property type / bedrooms / EPC /
// HomeScore stay server-side filters (already-supported query params).
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import SearchFilterBar, {
  type CommittedFilters,
} from '~/components/property/SearchFilterBar.vue'
import PropertyImage from '~/components/property/PropertyImage.vue'
import AuthGateModal from '~/components/ui/AuthGateModal.vue'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    useTypewriterPlaceholder?: boolean
    // Where a result click navigates - defaults to the normal property
    // page. HomeScore's own search reuses this whole component for its
    // dropdown UI but needs results to land on /homescore/[id] instead
    // (its own detail view), not /property/[id].
    resultBasePath?: string
  }>(),
  {
    placeholder: 'Search by postcode, address or area',
    useTypewriterPlaceholder: false,
    resultBasePath: '/property/',
  },
)

const emit = defineEmits<{
  // Lets the host page hide its own dashboard content while search
  // results are showing, same contract PropertySearchExperience uses.
  (e: 'update:searchMode', v: boolean): void
}>()

const searchFilterBarEl = ref<{ focus: () => void } | null>(null)
defineExpose({
  focus: () => searchFilterBarEl.value?.focus(),
})

const config = useRuntimeConfig()

const searchQuery = ref('')
const searchMode = ref(false)
const searchProperties = ref<any[]>([])
const searchLoading = ref(false)
const searchTotal = ref(0)
const searchLoadingMore = ref(false)
const SEARCH_PAGE_SIZE = 20
const loadMoreSentinel = ref<HTMLElement | null>(null)
let loadMoreObserver: IntersectionObserver | null = null
const viewMode = ref<'list' | 'map'>('list')

function setSearchMode(v: boolean) {
  searchMode.value = v
  emit('update:searchMode', v)
}

// Committed filter state, in SearchFilterBar's own CommittedFilters shape
// (radius / propertyType / minBedrooms / minEpc / minHomeScore /
// passportOnly) — the legacy query params the backend still honors
// verbatim for this exact search bar (see property.controller.ts's
// `searchProperties`, "kept working exactly as before ... e.g. the
// non-lightweight SearchFilterBar sheet used by Discover").
const activeFilters = ref<CommittedFilters>({
  radius: null,
  propertyType: ['any'],
  minBedrooms: null,
  minEpc: null,
  minHomeScore: 0,
  passportOnly: false,
})

function onFiltersChange(filters: CommittedFilters) {
  activeFilters.value = filters
  if (searchQuery.value.trim()) doSearch()
}

// Selecting a real address from the dropdown goes straight to that
// property — matches Discover/Dashboard's existing "type ahead, pick,
// navigate" behavior; it does not enter search-results mode.
function onAddressSelect(prop: any) {
  if (!prop?.id) return
  navigateTo(props.resultBasePath + prop.id)
}

function onEnterQuery(q: string) {
  searchQuery.value = q
  doSearch()
}

function buildSearchUrl(offset: number): string {
  const params = new URLSearchParams({
    q: searchQuery.value.trim(),
    offset: String(offset),
    limit: String(SEARCH_PAGE_SIZE),
  })
  const f = activeFilters.value
  if (f.radius != null) params.set('radius', String(f.radius))
  if (
    f.propertyType.length &&
    !(f.propertyType.length === 1 && f.propertyType[0] === 'any')
  ) {
    params.set('propertyType', f.propertyType.join(','))
  }
  if (f.minBedrooms != null) params.set('minBedrooms', String(f.minBedrooms))
  if (f.minEpc != null) params.set('minEpc', f.minEpc)
  if (f.minHomeScore) params.set('minHomeScore', String(f.minHomeScore))
  if (f.passportOnly) params.set('passportOnly', 'true')
  return `${config.public.apiBase}/property/search?${params.toString()}`
}

async function doSearch() {
  if (!searchQuery.value.trim()) {
    setSearchMode(false)
    return
  }
  setSearchMode(true)
  searchLoading.value = true
  searchProperties.value = []
  searchTotal.value = 0
  try {
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    const results = await $fetch<any>(buildSearchUrl(0), {
      headers: { Authorization: `Bearer ${token}` },
    })
    searchProperties.value = results?.items ?? []
    searchTotal.value = results?.total ?? searchProperties.value.length
  } catch {
    searchProperties.value = []
    searchTotal.value = 0
  } finally {
    searchLoading.value = false
    nextTick(() => attachLoadMoreObserver())
  }
}

async function loadMoreResults() {
  if (searchLoadingMore.value) return
  if (searchProperties.value.length >= searchTotal.value) return
  searchLoadingMore.value = true
  try {
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    const results = await $fetch<any>(
      buildSearchUrl(searchProperties.value.length),
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    const newItems = results?.items ?? []
    const existingIds = new Set(searchProperties.value.map((p) => p.id))
    for (const item of newItems) {
      if (!existingIds.has(item.id)) searchProperties.value.push(item)
    }
    searchTotal.value = results?.total ?? searchTotal.value
  } catch {
    /* non-critical */
  } finally {
    searchLoadingMore.value = false
  }
}

const hasMoreResults = computed(
  () => searchTotal.value > searchProperties.value.length,
)

function attachLoadMoreObserver() {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect()
    loadMoreObserver = null
  }
  if (!loadMoreSentinel.value || typeof IntersectionObserver === 'undefined')
    return
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMoreResults()
    },
    { rootMargin: '200px' },
  )
  loadMoreObserver.observe(loadMoreSentinel.value)
}

onBeforeUnmount(() => {
  loadMoreObserver?.disconnect()
  mapInstance?.remove?.()
})

function exitSearch() {
  setSearchMode(false)
  searchQuery.value = ''
  searchProperties.value = []
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

// ── 4-state passport derivation (client-side) ───────────────────────────
// Private / Partially Public / Public — same model as the property detail
// page (property/[id].vue's floatClaimState) and driven by the same
// signal: milestonePct from the real publish-readiness system (see
// PropertyService.searchProperties), not a flat completion ratio. Private
// covers ANY claimed-but-unpublished passport regardless of how built-out
// it is — no completion % is shown anywhere on this card, matching that
// page. See plans/watch-visibility-strategy-audit.md.
type ResultState = 'unclaimed' | 'private' | 'partiallyPublic' | 'public'
function stateOf(p: any): ResultState {
  if (!p.hasPassport) return 'unclaimed'
  if (!p.passportPublished) return 'private'
  return (p.milestonePct ?? 0) >= 100 ? 'public' : 'partiallyPublic'
}
function badgeLabel(p: any): string {
  const s = stateOf(p)
  if (s === 'unclaimed') return 'Unclaimed'
  if (s === 'partiallyPublic') return 'Partially Public'
  if (s === 'public') return 'Public'
  return 'Private'
}
// Full "Property Passport claimed · X" phrasing — the compact corner
// badge above only has room for the bare state word, so this line is
// where a first-time viewer actually learns what it means (see
// plans/passport-status-wording-clarity.md).
function stateTitle(p: any): string {
  const s = stateOf(p)
  if (s === 'public') return 'Property Passport claimed · Public'
  if (s === 'partiallyPublic') return 'Property Passport claimed · Partially Public'
  if (s === 'unclaimed') return 'Property Passport unclaimed'
  return 'Property Passport claimed · Private'
}
function stateSub(p: any): string {
  const s = stateOf(p)
  if (s === 'public') return 'Verified information'
  if (s === 'partiallyPublic') return 'Some verified information available'
  if (s === 'unclaimed') return 'No owner has claimed it yet'
  return 'Watch for updates'
}
function homeScoreOf(p: any): number | null {
  return p.homeScore ?? p.HomeScore ?? p.epcScore ?? null
}
function hsLabel(score: number): string {
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Average'
  return 'Needs work'
}
function hsColor(score: number): string {
  if (score >= 70) return '#00a19a'
  if (score >= 50) return '#d4922a'
  return '#dc4f3f'
}

// ── Insight row — every line here is derived from data actually on the
// page (this batch of results, or the property's own EPC/HomeScore), not
// invented. No "N schools within 1 mile" style line: there's no schools
// data anywhere in this app to back that claim honestly. ──
interface Insight {
  text: string
  tone: 'good' | 'warn' | 'info'
}
function insightFor(p: any): Insight | null {
  const s = stateOf(p)
  if (s === 'unclaimed') {
    const pool = displayedProperties.value
    const claimedCount = pool.filter((x) => x.hasPassport).length
    if (claimedCount === 0)
      return { text: 'Be the first on this street', tone: 'info' }
    return {
      text: `${claimedCount} of ${pool.length} homes here claimed`,
      tone: 'info',
    }
  }
  const hs = homeScoreOf(p)
  if (hs == null) return null
  const pool = displayedProperties.value
    .map((x) => homeScoreOf(x))
    .filter((n): n is number => n != null)
  if (!pool.length) return null
  const avg = pool.reduce((a, b) => a + b, 0) / pool.length
  if (hs < 50) return { text: 'Consider energy improvements', tone: 'warn' }
  if (hs >= avg + 5) return { text: 'Above local average', tone: 'good' }
  return null
}

// ── Quick-filter chip state ──────────────────────────────────────────────
type PopoverKey = 'sort' | 'passport' | 'homescore' | 'ptype' | 'more' | null
const activePopover = ref<PopoverKey>(null)
function openPopover(k: PopoverKey) {
  activePopover.value = k
}

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'homescore_desc'
const sortBy = ref<SortKey>('newest')
const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'homescore_desc', label: 'HomeScore: high to low' },
]
const sortLabel = computed(
  () =>
    sortOptions
      .find((o) => o.value === sortBy.value)
      ?.label.replace(/:.*/, '') ?? 'Sort',
)

const ALL_STATES: ResultState[] = [
  'unclaimed',
  'private',
  'partiallyPublic',
  'public',
]
const passportStates = ref<Set<ResultState>>(new Set(ALL_STATES))
const passportStateOptions: { value: ResultState; label: string }[] = [
  { value: 'unclaimed', label: 'Unclaimed' },
  { value: 'private', label: 'Private' },
  { value: 'partiallyPublic', label: 'Partially public' },
  { value: 'public', label: 'Public' },
]
function togglePassportState(v: ResultState) {
  const next = new Set(passportStates.value)
  if (next.has(v)) next.delete(v)
  else next.add(v)
  // Never allow an empty selection — that would just hide every result
  // with no way back short of reopening this sheet and re-checking one.
  passportStates.value = next.size ? next : new Set(ALL_STATES)
}

// HomeScore/property type/beds/EPC feed the SAME server-side query params
// SearchFilterBar's own sheet already uses (see buildSearchUrl above) —
// applying them re-runs doSearch() against the backend rather than
// filtering client-side, so pagination/totals stay correct.
const minHomeScore = ref(0)
const propertyTypeOptions = [
  { value: 'any', label: 'Any' },
  { value: 'detached', label: 'Detached' },
  { value: 'semi', label: 'Semi' },
  { value: 'terraced', label: 'Terraced' },
  { value: 'flat', label: 'Flat' },
  { value: 'bungalow', label: 'Bungalow' },
]
const propertyTypes = ref<string[]>(['any'])
function togglePropertyType(v: string) {
  if (v === 'any') {
    propertyTypes.value = ['any']
    return
  }
  const cur = propertyTypes.value.filter((x) => x !== 'any')
  propertyTypes.value = cur.includes(v)
    ? cur.filter((x) => x !== v).length
      ? cur.filter((x) => x !== v)
      : ['any']
    : [...cur, v]
}
const bedsOptions: { value: number | null; label: string }[] = [
  { value: null, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
]
const minBeds = ref<number | null>(null)
const epcOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B+' },
  { value: 'C', label: 'C+' },
  { value: 'D', label: 'D+' },
]
const minEpc = ref<string | null>(null)

// Re-runs the search with the current server-side filter selections —
// same underlying query params SearchFilterBar's sheet drives, just
// entered from these chips instead. Kept in sync with activeFilters so a
// later change from the OTHER sheet (the pill above the search bar)
// doesn't silently get clobbered on the next chip apply.
function applyServerFilters() {
  activeFilters.value = {
    ...activeFilters.value,
    propertyType: [...propertyTypes.value],
    minBedrooms: minBeds.value,
    minEpc: minEpc.value,
  }
  if (searchQuery.value.trim()) doSearch()
}
watch(minHomeScore, () => {
  activeFilters.value = {
    ...activeFilters.value,
    minHomeScore: minHomeScore.value,
  }
  if (searchQuery.value.trim()) doSearch()
})

// Sort + passport-state filter apply to whatever's currently loaded —
// re-derived whenever the underlying list, sort, or filter changes.
const displayedProperties = computed(() => {
  let list = searchProperties.value.filter((p) =>
    passportStates.value.has(stateOf(p)),
  )
  const sorted = [...list]
  if (sortBy.value === 'price_asc') {
    sorted.sort(
      (a, b) => (a.estimatedPrice ?? Infinity) - (b.estimatedPrice ?? Infinity),
    )
  } else if (sortBy.value === 'price_desc') {
    sorted.sort(
      (a, b) =>
        (b.estimatedPrice ?? -Infinity) - (a.estimatedPrice ?? -Infinity),
    )
  } else if (sortBy.value === 'homescore_desc') {
    sorted.sort((a, b) => (homeScoreOf(b) ?? -1) - (homeScoreOf(a) ?? -1))
  }
  return sorted
})

// ── Watch (save) — per-card quick toggle, no navigation. Guests get the
// same sign-in gate the rest of the app uses instead of silently no-op'ing. ──
const watchedIds = ref<Set<string>>(new Set())
const authGateOpen = ref(false)
async function onWatchClick(prop: any) {
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    authGateOpen.value = true
    return
  }
  try {
    const res = await $fetch<{ saved: boolean }>(
      `${config.public.apiBase}/property/${prop.id}/save`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
    )
    const next = new Set(watchedIds.value)
    if (res.saved) next.add(prop.id)
    else next.delete(prop.id)
    watchedIds.value = next
  } catch {
    /* non-critical - card just doesn't reflect the toggle */
  }
}

// ── Map view — real Mapbox pins, one per currently-displayed result.
// Reuses the same dynamic-import + OS raster style pattern already used
// on the property detail page's flood map. ──
const mapEl = ref<HTMLElement | null>(null)
const mapReady = ref(false)
let mapInstance: any = null
let mapMarkers: any[] = []

async function initResultsMap() {
  if (!mapEl.value) return
  let mapboxgl: any
  try {
    mapboxgl = (await import('mapbox-gl')).default
  } catch {
    return
  }
  if (!document.querySelector('link[href*="mapbox-gl"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css'
    document.head.appendChild(link)
  }
  mapboxgl.accessToken = (config.public.mapboxToken as string) || ''

  const withCoords = displayedProperties.value.filter(
    (p) => p.latitude != null && p.longitude != null,
  )
  const centre = withCoords[0]
    ? [withCoords[0].longitude, withCoords[0].latitude]
    : [-1.5491, 52.4068] // Coventry-ish fallback so an empty/no-coords batch still renders a map

  mapInstance = new mapboxgl.Map({
    container: mapEl.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: centre,
    zoom: withCoords.length ? 14 : 6,
    attributionControl: false,
  })
  mapInstance.on('load', () => {
    mapReady.value = true
  })
  renderMapMarkers(mapboxgl)
}

function renderMapMarkers(mapboxgl: any) {
  mapMarkers.forEach((m) => m.remove())
  mapMarkers = []
  if (!mapInstance) return
  for (const prop of displayedProperties.value) {
    if (prop.latitude == null || prop.longitude == null) continue
    const stateColor: Record<ResultState, string> = {
      unclaimed: '#00a19a',
      private: '#f5510b',
      partiallyPublic: '#9185d6',
      public: '#231d45',
    }
    const el = document.createElement('div')
    el.style.cssText = `width:16px;height:16px;border-radius:50%;background:${
      stateColor[stateOf(prop)]
    };border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.35);cursor:pointer;`
    el.addEventListener('click', () => navigateTo(props.resultBasePath + prop.id))
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([prop.longitude, prop.latitude])
      .addTo(mapInstance)
    mapMarkers.push(marker)
  }
}

watch(viewMode, async (v) => {
  if (v !== 'map') return
  await nextTick()
  if (!mapInstance) {
    initResultsMap()
  } else {
    mapInstance.resize()
    import('mapbox-gl').then((m) => renderMapMarkers(m.default))
  }
})
// Results changed (new search / load more / filter) while map is open —
// re-plant markers on the existing map instance rather than rebuilding it.
watch(displayedProperties, () => {
  if (viewMode.value !== 'map' || !mapInstance) return
  import('mapbox-gl').then((m) => renderMapMarkers(m.default))
})
</script>

<style scoped>
.pse-root {
  width: 100%;
}

/* ── Search mode header ── */
.search-back-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.search-back-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f0f0f8;
  border: none;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 15px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
}
.search-back-btn:active {
  transform: scale(0.97);
}
.search-result-label {
  flex: 1;
  min-width: 0;
}
.srl-count {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.srl-query {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-toggle {
  display: flex;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
}
.view-toggle-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #6b7089;
  background: #fff;
  border: none;
  padding: 7px 10px;
  cursor: pointer;
}
.view-toggle-btn.active {
  color: #00a19a;
  background: #f0fdfa;
}
.view-toggle-btn:first-child {
  border-right: 1px solid #e5e7eb;
}

/* ── Quick-filter chip row ── */
.chip-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 -20px 14px;
  padding: 0 20px 2px;
}
.chip-row::-webkit-scrollbar {
  display: none;
}
.quick-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #231d45;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 7px 13px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.quick-chip.active {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
}
.chip-count {
  background: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
}

/* ── Property card ── */
.prop-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 12px;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s;
}
.prop-card:active {
  transform: scale(0.99);
}
/* ── Top: thumbnail + info, side by side (matches prototype exactly -
   NOT a full-width photo banner) ── */
.prop-card-top {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
}
.prop-thumb-wrap {
  position: relative;
  width: 108px;
  height: 108px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
}
.prop-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Two-row badge - "Passport" caption on top, state word below - so the
   compact badge reads as "the PASSPORT is private", never "the property
   is private". Each row is its own non-wrapping line; the capsule's
   width auto-fits whichever row is longer per state (Partially Public
   is the widest), so nothing wraps internally regardless of state. */
.prop-badge-pp {
  flex-shrink: 0;
  color: #fff;
  border-radius: 12px;
  padding: 6px 10px;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  margin-top: 1px;
}
.prop-badge-pp-cap {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.04em;
  opacity: 0.75;
}
.prop-badge-pp-lock {
  width: 13px;
  height: 13px;
  object-fit: contain;
  flex-shrink: 0;
}
.prop-badge-pp-val {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.1;
}
/* Unified dark-navy/white treatment for every state, per client feedback
   - replaces the earlier per-state teal/amber/purple palette. */
.prop-badge-pp.unclaimed,
.prop-badge-pp.private,
.prop-badge-pp.partiallyPublic,
.prop-badge-pp.public {
  background: #231d45;
}
.prop-photo-count {
  position: absolute;
  bottom: 6px;
  left: 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
}
.prop-top-info {
  flex: 1;
  min-width: 0;
}
.prop-top-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.prop-price {
  font-size: 18px;
  font-weight: 800;
  color: #1f2024;
  letter-spacing: -0.3px;
}
.prop-body {
  padding: 0 14px 12px;
}
.prop-address {
  font-size: 14.5px;
  font-weight: 700;
  color: #1f2024;
  margin-top: 4px;
}
.prop-area {
  font-size: 12.5px;
  color: #94a3b8;
  margin-top: 1px;
}
.prop-pills {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 6px;
}
.watch-btn--top {
  margin-left: auto;
}
.pill-grey {
  background: #f1f5f9;
  color: #64748b;
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}
.epc-pill {
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

/* ── Footer: HomeScore ring + passport status ── */
.prop-footer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
}
.footer-hs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.mini-ring {
  position: relative;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
}
.mini-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.mini-ring-bg {
  fill: none;
  stroke: #ededf3;
  stroke-width: 4;
}
.mini-ring-fill {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
}
.mini-ring-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #231d45;
}
.mini-hs-label {
  font-size: 10.5px;
  color: #94a3b8;
  line-height: 1.3;
  font-weight: 600;
}
.mini-hs-label b {
  font-weight: 800;
}
.footer-divider {
  width: 1px;
  align-self: stretch;
  background: #e5e7eb;
  flex-shrink: 0;
}
.footer-passport {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.footer-passport-lock {
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex-shrink: 0;
}
.fp-text {
  min-width: 0;
}
.fp-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #231d45;
  line-height: 1.3;
}
.fp-sub {
  font-size: 11.5px;
  color: #6b7089;
  margin-top: 1px;
}
.fp-mini-ring {
  position: relative;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
}
.fp-mini-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.fp-mini-ring-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  color: #00817c;
}

/* ── Insight row (lives inline in .prop-actions-row, left of Watch) ── */
.prop-insight {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  min-width: 0;
}
.prop-insight.good {
  color: #00817c;
}
.prop-insight.warn {
  color: #b45309;
}
.prop-insight.info {
  color: #6b7089;
}

/* ── Actions row ── */
.prop-actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}
.watch-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #231d45;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
}
.watch-btn.active {
  color: #00a19a;
  border-color: #00a19a;
  background: #f0fdfa;
}
/* ── Map view ── */
.map-wrap {
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 360px;
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid #e5e7eb;
}
.map-canvas {
  width: 100%;
  height: 100%;
}
.map-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f6;
  color: #6b7089;
  font-size: 13px;
  font-weight: 600;
}

/* ── Load more (infinite scroll) ── */
.load-more-sentinel {
  display: flex;
  justify-content: center;
  padding: 16px 0 8px;
}
.load-more-btn {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  color: #00a19a;
  font-size: 15px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
}
.load-more-btn:active {
  background: #f1f9f4;
}
.load-more-spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid #e5e7eb;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: psec-spin 0.8s linear infinite;
}
@keyframes psec-spin {
  to {
    transform: rotate(360deg);
  }
}
.load-more-end {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  padding: 12px 0 8px;
  font-weight: 600;
}

/* ── No results ── */
.no-results-msg {
  text-align: center;
  padding: 48px 20px;
}
.no-results-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 12px;
}
.no-results-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.no-results-text {
  font-size: 16px;
  font-weight: 700;
  color: #231d45;
  margin-bottom: 4px;
}
.no-results-sub {
  font-size: 15px;
  color: #94a3b8;
}

/* ── Quick-filter popover sheet (own namespace - psr- - so it can't
     collide with SearchFilterBar's own .sheet/.chip classes even though
     both are Teleported to <body> at the same time). ── */
.psr-sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 13, 40, 0);
  z-index: 210;
  pointer-events: none;
  transition: background 0.25s ease;
}
.psr-sheet-backdrop.open {
  background: rgba(17, 13, 40, 0.55);
  pointer-events: auto;
}
.psr-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24px 24px 0 0;
  z-index: 211;
  transform: translateY(100%);
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
  padding: 0 22px calc(20px + env(safe-area-inset-bottom));
  max-height: 80dvh;
  overflow-y: auto;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.18);
}
.psr-sheet.open {
  transform: translateY(0);
}
.psr-sheet-grabber-wrap {
  display: flex;
  justify-content: center;
  padding: 10px 0 8px;
  cursor: pointer;
}
.psr-sheet-grabber {
  width: 36px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 999px;
}
.psr-sheet-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  margin-bottom: 12px;
}
.psr-sheet-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #6b6783;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.psr-option-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.psr-option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 6px;
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}
.psr-option-row:last-child {
  border-bottom: none;
}
.psr-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #9c98ad;
  flex-shrink: 0;
}
.psr-option-row.active .psr-radio {
  border-color: #00a19a;
  background: radial-gradient(circle, #00a19a 40%, transparent 44%);
}
.psr-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid #9c98ad;
  flex-shrink: 0;
}
.psr-checkbox.checked {
  border-color: #00a19a;
  background: #00a19a;
}
.psr-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.psr-chip {
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #231d45;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 8px 13px;
  cursor: pointer;
}
.psr-chip.active {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
}
.psr-slider-row {
  padding: 4px 4px 0;
}
.psr-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #e5e7eb;
  outline: none;
  margin: 12px 0 6px;
}
.psr-slider::-webkit-slider-runnable-track {
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
.psr-slider::-webkit-slider-thumb {
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
.psr-slider-scale {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 700;
  color: #9c98ad;
  margin-top: 2px;
  letter-spacing: 0.4px;
}
.psr-sheet-foot {
  display: flex;
  gap: 10px;
  padding: 14px 0 4px;
}
.psr-btn-secondary {
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
.psr-btn-primary {
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  background: #00a19a;
  border: none;
  border-radius: 999px;
  padding: 13px 18px;
  cursor: pointer;
}
</style>
