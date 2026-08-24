<template>
  <div class="pse-root">
    <SearchFilterBar
      v-model="searchQuery"
      :placeholder="placeholder"
      style="margin-bottom: 6px"
      :lightweight-mode="true"
      @enter="onLocationChosen"
    />

    <PropertySearchFiltersModal
      v-model="filtersModalOpen"
      :initial-filters="pendingFilters"
      @search="onFiltersModalSearch"
    />

    <template v-if="searchMode">
      <div class="search-back-row">
        <button class="search-back-btn" @click="exitSearch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div class="search-result-label">
          <span v-if="!searchLoading && searchTotal > 0">
            {{ searchTotal }} {{ searchTotal === 1 ? 'result' : 'results' }} for "{{ searchQuery }}"
          </span>
          <span v-else>Results for "{{ searchQuery }}"</span>
        </div>
      </div>

      <div v-if="searchLoading" class="skeletons">
        <div v-for="n in 4" :key="n" class="skeleton-card" />
      </div>

      <template v-else-if="searchProperties.length > 0">
        <div
          v-for="prop in searchProperties"
          :key="prop.id"
          class="prop-card"
          @click="navigateTo('/property/' + prop.id)"
        >
          <div
            class="prop-img-wrap"
            :style="{ background: prop.imgGradient || 'linear-gradient(135deg,#dff4f0,#c8ebe6)' }"
          >
            <PropertyImage
              :src="prop.imageUrl || prop.image"
              :alt="prop.addressLine1 || prop.address"
              :show-caption="false"
              class="prop-img"
            />
            <div
              v-if="prop.hasPassport"
              class="prop-badge-pp"
              :class="prop.passportPublished ? 'published' : 'in-progress'"
            >
              <img src="/op-icons/passportview/umu-passport.png" alt="" class="pp-emoji-ic" />
              {{ prop.passportPublished ? 'Published' : 'In Progress' }}
            </div>
            <div class="prop-price-tag">
              {{ prop.estimatedPrice ? '£' + Math.round(prop.estimatedPrice).toLocaleString() : prop.priceDisplay || 'POA' }}
            </div>
          </div>
          <div class="prop-body">
            <div class="prop-row-top">
              <div class="prop-title-col">
                <div class="prop-address">{{ prop.addressLine1 || prop.address }}</div>
                <div class="prop-area">
                  {{ prop.city ? prop.city + ', ' + prop.postcode : prop.area || prop.postcode || '' }}
                </div>
              </div>
              <div v-if="prop.epcRating" class="epc-badge" :style="{ background: epcColor(prop.epcRating) }">
                <div class="epc-badge-label">EPC</div>
                <div class="epc-badge-rating">{{ prop.epcRating }}</div>
              </div>
            </div>
            <div class="prop-pills">
              <span v-if="prop.propertyType || prop.type" class="pill-grey">{{ prop.propertyType || prop.type }}</span>
              <span v-if="prop.tenure" class="pill-grey">{{ prop.tenure }}</span>
            </div>
            <div class="prop-footer">
              <div class="prop-score-row" v-if="prop.HomeScore">
                <span class="prop-score-lbl">HomeScore</span>
                <div class="prop-score-bar">
                  <div class="prop-score-fill" :style="{ width: prop.HomeScore + '%' }"></div>
                </div>
                <span class="prop-score-num">{{ prop.HomeScore }}</span>
              </div>
              <span class="prop-passport-btn">View →</span>
            </div>
          </div>
        </div>

        <div v-if="hasMoreResults" ref="loadMoreSentinel" class="load-more-sentinel">
          <div v-if="searchLoadingMore" class="load-more-spinner" />
          <button v-else class="load-more-btn" @click="loadMoreResults">
            Load {{ Math.min(SEARCH_PAGE_SIZE, searchTotal - searchProperties.length) }} more
          </button>
        </div>
        <div v-else class="load-more-end">
          {{ searchProperties.length === 1 ? '1 result shown' : searchProperties.length + ' results shown' }}
        </div>
      </template>

      <div v-else class="no-results-msg">
        <div class="no-results-icon"><img src="/op-icons/homescore/magnifier.png" alt="" loading="lazy" /></div>
        <div class="no-results-text">No properties found</div>
        <div class="no-results-sub">Try a different postcode or area</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// Rightmove-style search flow: type/pick an area → filters modal → a
// paginated results list. Shared verbatim between Explore and Discover so
// both pages get identical search behavior instead of two similar-looking
// implementations that drift apart over time.
import { ref, computed, nextTick, onBeforeUnmount } from 'vue'
import SearchFilterBar from '~/components/property/SearchFilterBar.vue'
import PropertySearchFiltersModal, {
  type PropertySearchFilters,
} from '~/components/property/PropertySearchFiltersModal.vue'
import PropertyImage from '~/components/property/PropertyImage.vue'

withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  { placeholder: 'Search by postcode, address or area' },
)

const emit = defineEmits<{
  // Lets the host page hide its own dashboard content while search
  // results are showing, same as Explore's old `v-if="searchMode"` split.
  (e: 'update:searchMode', v: boolean): void
}>()

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

function setSearchMode(v: boolean) {
  searchMode.value = v
  emit('update:searchMode', v)
}

const filtersModalOpen = ref(false)
const activeRadius = ref<number | null>(null)
const committedPtype = ref<string[]>(['any'])
const committedBeds = ref<number | null>(null)
const committedBedsMax = ref<number | null>(null)
const committedEpc = ref<string | null>(null)
const committedMinPrice = ref<number | null>(null)
const committedMaxPrice = ref<number | null>(null)
const committedPassportStatus = ref<string[]>([])

const pendingFilters = computed<PropertySearchFilters>(() => ({
  radius: activeRadius.value,
  propertyType: committedPtype.value,
  minBedrooms: committedBeds.value,
  maxBedrooms: committedBedsMax.value,
  minEpc: committedEpc.value,
  minPrice: committedMinPrice.value,
  maxPrice: committedMaxPrice.value,
  passportStatus: committedPassportStatus.value,
}))

function onLocationChosen(text: string) {
  searchQuery.value = text
  filtersModalOpen.value = true
}

function onFiltersModalSearch(filters: PropertySearchFilters) {
  activeRadius.value = filters.radius
  committedPtype.value = filters.propertyType
  committedBeds.value = filters.minBedrooms
  committedBedsMax.value = filters.maxBedrooms
  committedEpc.value = filters.minEpc
  committedMinPrice.value = filters.minPrice
  committedMaxPrice.value = filters.maxPrice
  committedPassportStatus.value = filters.passportStatus
  doSearch()
}

function buildSearchUrl(offset: number): string {
  const params = new URLSearchParams({
    q: searchQuery.value.trim(),
    offset: String(offset),
    limit: String(SEARCH_PAGE_SIZE),
  })
  if (activeRadius.value != null) params.set('radius', String(activeRadius.value))
  if (
    committedPtype.value.length &&
    !(committedPtype.value.length === 1 && committedPtype.value[0] === 'any')
  ) {
    params.set('propertyType', committedPtype.value.join(','))
  }
  if (committedBeds.value != null) params.set('minBedrooms', String(committedBeds.value))
  if (committedBedsMax.value != null) params.set('maxBedrooms', String(committedBedsMax.value))
  if (committedEpc.value != null) params.set('minEpc', committedEpc.value)
  if (committedMinPrice.value != null) params.set('minPrice', String(committedMinPrice.value))
  if (committedMaxPrice.value != null) params.set('maxPrice', String(committedMaxPrice.value))
  if (committedPassportStatus.value.length) {
    params.set('passportStatus', committedPassportStatus.value.join(','))
  }
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
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
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
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    const results = await $fetch<any>(buildSearchUrl(searchProperties.value.length), {
      headers: { Authorization: `Bearer ${token}` },
    })
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

const hasMoreResults = computed(() => searchTotal.value > searchProperties.value.length)

function attachLoadMoreObserver() {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect()
    loadMoreObserver = null
  }
  if (!loadMoreSentinel.value || typeof IntersectionObserver === 'undefined') return
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
})

function exitSearch() {
  setSearchMode(false)
  searchQuery.value = ''
  searchProperties.value = []
}

function epcColor(rating: string): string {
  const map: Record<string, string> = {
    A: '#00b050', B: '#33b800', C: '#92d050', D: '#a39200',
    E: '#e08a00', F: '#ff6600', G: '#ff0000',
  }
  return map[(rating ?? '').toUpperCase()] ?? '#8e8e93'
}
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
  margin-bottom: 14px;
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
}
.search-back-btn:active {
  transform: scale(0.97);
}
.search-result-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.prop-img-wrap {
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.prop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.prop-badge-pp {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #231d45;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
/* In progress = teal (matches the property page's in-progress accent),
   Published = gold (matches the property page's published "champagne"
   band) — so this badge's color actually means something instead of
   every claimed property looking identical regardless of status. */
.prop-badge-pp.in-progress {
  background: #00a19a;
}
.prop-badge-pp.published {
  background: #b8791f;
}
.pp-emoji-ic {
  width: 11px;
  height: 11px;
  object-fit: contain;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: -1px;
}
.prop-price-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
}
.prop-body {
  padding: 12px 14px;
}
.prop-row-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}
.prop-title-col {
  flex: 1;
  min-width: 0;
}
.prop-address {
  font-size: 15px;
  font-weight: 700;
  color: #1f2024;
  margin-bottom: 1px;
}
.prop-area {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
}
.epc-badge {
  min-width: 44px;
  padding: 5px 8px;
  border-radius: 8px;
  color: #fff;
  text-align: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.epc-badge-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
  opacity: 0.85;
  line-height: 1;
}
.epc-badge-rating {
  font-size: 16px;
  font-weight: 900;
  line-height: 1.1;
  margin-top: 1px;
}
.prop-pills {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.pill-grey {
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
}
.prop-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}
.prop-score-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.prop-score-lbl {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}
.prop-score-bar {
  width: 54px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}
.prop-score-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 4px;
}
.prop-score-num {
  font-size: 15px;
  font-weight: 700;
  color: #1f2024;
}
.prop-passport-btn {
  background: #231d45;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
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
  animation: pse-spin 0.8s linear infinite;
}
@keyframes pse-spin {
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
</style>
