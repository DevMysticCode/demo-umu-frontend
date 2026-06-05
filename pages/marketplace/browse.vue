<template>
  <!-- Browse — every category tile + every open job, with simple
       client-side sort/filter chips. Layout ported from the
       prototype's `screen.browse` block. -->
  <div class="mp-browse mobile-container">
    <AppHeader title="Browse jobs" :show-back="true" back-to="/marketplace" />

    <!-- Search row -->
    <div class="mp-search-row mp-anim-1">
      <div class="mp-search-input">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2.2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Find jobs near you…"
        />
      </div>
      <button class="mp-search-btn" type="button" @click="onClearFilters">
        Reset
      </button>
    </div>

    <!-- Sort + filter chips. "All" clears the category filter. -->
    <div class="mp-chip-row mp-anim-1">
      <button
        class="mp-chip"
        :class="{ sel: !activeCategory && sortMode === 'newest' }"
        @click="onAllChip"
      >
        All
      </button>
      <button
        class="mp-chip"
        :class="{ sel: sortMode === 'nearest' }"
        @click="setSort('nearest')"
      >
        📍 Nearest
      </button>
      <button
        class="mp-chip"
        :class="{ sel: sortMode === 'newest' }"
        @click="setSort('newest')"
      >
        🆕 Newest
      </button>
      <button
        class="mp-chip"
        :class="{ sel: sortMode === 'urgent' }"
        @click="setSort('urgent')"
      >
        ⚡ Urgent
      </button>
    </div>

    <!-- Category grid. Tap a tile to filter; tap the already-selected
         tile to clear the filter. Mirrors the prototype's 3-col grid. -->
    <div class="mp-section-h">
      <div class="mp-section-title">Browse by category</div>
      <span v-if="activeCategory" class="mp-section-link" @click="clearCategory">
        Clear ×
      </span>
    </div>

    <div class="mp-cat-grid-3 mp-anim-2">
      <button
        v-for="cat in (categories ?? [])"
        :key="cat.slug"
        class="mp-cat-tile"
        :class="{ sel: activeCategory === cat.slug }"
        :style="{ background: categoryTileBg(cat) }"
        @click="toggleCategory(cat.slug)"
      >
        <span class="mp-cat-name">{{ cat.name }}</span>
      </button>
    </div>

    <div class="mp-section-h">
      <div class="mp-section-title">
        {{ activeCategoryLabel }}
      </div>
      <span class="mp-section-link">{{ filteredJobs.length }} nearby</span>
    </div>

    <div class="mp-job-list mp-anim-3">
      <button
        v-for="job in filteredJobs"
        :key="job.id"
        class="mp-job-list-card"
        type="button"
        @click="openJob(job.id)"
      >
        <div
          class="mp-job-list-photo"
          :style="{ background: jobBackground(job) }"
        >
          <span class="mp-job-list-urgency" :class="`urg-${job.urgency}`">
            {{ urgencyLabel(job.urgency) }}
          </span>
          <span class="mp-job-list-cat">{{ job.categoryLabel }}</span>
          <span v-if="job.distanceMi !== null" class="mp-job-list-distance">
            📍 {{ job.distanceMi }} mi · {{ job.locationLabel }}
          </span>
          <span v-else class="mp-job-list-distance">📍 {{ job.locationLabel }}</span>
        </div>
        <div class="mp-job-list-body">
          <div class="mp-job-list-title">{{ job.title }}</div>
          <div class="mp-job-list-meta">
            Posted {{ job.postedAgo }}<span v-if="job.availability">
              · {{ job.availability }}</span>
          </div>
          <div class="mp-job-list-foot">
            <div class="mp-job-list-budget">
              {{ formatBudget(job.budgetMin) }}<small v-if="job.budgetMax">
                – {{ formatBudget(job.budgetMax, true) }}</small>
            </div>
            <span class="mp-job-list-offers">{{ job.offerCount }} offers</span>
          </div>
        </div>
      </button>
    </div>

    <div v-if="!filteredJobs.length" class="mp-empty">
      No jobs match this filter yet.
    </div>

    <div style="height: 100px" />
    <MarketplaceBottomNav active="browse" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppHeader from '~/components/core/AppHeader.vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type {
  MarketplaceCategory,
  MarketplaceJobListItem,
} from '~/composables/useMarketplace'

definePageMeta({ title: 'Browse jobs — Marketplace' })

const route = useRoute()
const router = useRouter()
const { fetchCategories, fetchJobs, resolvePhotoUrl, categoryTileBg } = useMarketplace()

function jobBackground(job: MarketplaceJobListItem): string | undefined {
  if (job.photoUrl) {
    return `linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.05)), url(${resolvePhotoUrl(job.photoUrl)}) center/cover no-repeat`
  }
  return job.photoBg ?? undefined
}

// Category filter comes in via query (?category=plumbing) so Home's
// "Browse by Plumbing" link lands you on a pre-filtered Browse.
const activeCategory = ref<string | null>(
  typeof route.query.category === 'string' ? route.query.category : null,
)
const searchQuery = ref<string>(
  typeof route.query.q === 'string' ? route.query.q : '',
)

type SortMode = 'newest' | 'nearest' | 'urgent'
const sortMode = ref<SortMode>('newest')

const { data: categories } = await useAsyncData('mp-browse-categories', () =>
  fetchCategories(),
)

// We fetch the broader set once and re-filter client-side so chip taps
// feel instant. Backend filtering kicks in only on category changes.
const { data: jobs, refresh: refreshJobs } = await useAsyncData(
  'mp-browse-jobs',
  () => fetchJobs({ category: activeCategory.value || undefined, limit: 50 }),
  { watch: [activeCategory] },
)

watch(activeCategory, async () => {
  await refreshJobs()
})

const activeCategoryLabel = computed(() => {
  if (!activeCategory.value) return 'All jobs nearby'
  const cat = (categories.value ?? []).find((c) => c.slug === activeCategory.value)
  return cat ? `${cat.emoji} ${cat.name} jobs` : 'Filtered jobs'
})

const filteredJobs = computed<MarketplaceJobListItem[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  let list = (jobs.value ?? []).filter((j) =>
    q
      ? j.title.toLowerCase().includes(q) ||
        j.categoryLabel.toLowerCase().includes(q) ||
        j.locationLabel.toLowerCase().includes(q)
      : true,
  )

  switch (sortMode.value) {
    case 'nearest':
      list = [...list].sort((a, b) => (a.distanceMi ?? 99) - (b.distanceMi ?? 99))
      break
    case 'urgent':
      list = [...list].sort((a, b) => urgencyWeight(a.urgency) - urgencyWeight(b.urgency))
      break
    case 'newest':
    default:
      // Already returned by the backend in postedAt-desc order — keep as-is.
      break
  }
  return list
})

function urgencyWeight(u: MarketplaceJobListItem['urgency']): number {
  return u === 'urgent' ? 0 : u === 'standard' ? 1 : 2
}

function urgencyLabel(u: MarketplaceJobListItem['urgency']): string {
  return u === 'urgent' ? 'Urgent' : u === 'flexible' ? 'Flexible' : 'Standard'
}

function formatBudget(amount: number, _omitPrefix = false): string {
  return `£${new Intl.NumberFormat('en-GB').format(amount)}`
}

function toggleCategory(slug: string) {
  activeCategory.value = activeCategory.value === slug ? null : slug
  syncQuery()
}
function clearCategory() {
  activeCategory.value = null
  syncQuery()
}
function setSort(mode: SortMode) {
  sortMode.value = mode
}
function onAllChip() {
  clearCategory()
  setSort('newest')
}
function onClearFilters() {
  searchQuery.value = ''
  clearCategory()
  setSort('newest')
}

function syncQuery() {
  router.replace({
    query: {
      ...(activeCategory.value ? { category: activeCategory.value } : {}),
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
    },
  })
}

function openJob(id: string) {
  router.push(`/marketplace/jobs/${id}`)
}
</script>

<style scoped>
/* Browse inherits the home page's design language — same chrome,
   tile, and card styles — with a denser 3-column category grid and
   a chip row above the listings. Typography inherits from the app. */
.mp-browse {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

/* Search row reused from home */
.mp-search-row {
  display: flex;
  gap: 8px;
  margin: 12px 20px 0;
}
.mp-search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e4e5ed;
  border-radius: 14px;
  padding: 11px 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.mp-search-input svg { width: 16px; height: 16px; color: #6b7089; flex-shrink: 0; }
.mp-search-input input {
  flex: 1; border: none; outline: none; background: transparent;
  font-family: inherit; font-size: 13px; font-weight: 600;
  color: #231d45; min-width: 0;
}
.mp-search-input input::placeholder { color: #a8a9ad; font-weight: 500; }
.mp-search-btn {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff; border: none; border-radius: 14px;
  padding: 0 18px; font-family: inherit; font-size: 13px;
  font-weight: 800; cursor: pointer; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 161, 154, 0.3);
}

/* Chip row */
.mp-chip-row {
  display: flex;
  gap: 8px;
  padding: 12px 20px 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.mp-chip-row::-webkit-scrollbar { display: none; }
.mp-chip {
  flex-shrink: 0;
  padding: 7px 14px;
  background: #fff;
  border: 1px solid #e4e5ed;
  border-radius: 100px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #6b7089;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.mp-chip.sel {
  background: #231d45;
  border-color: #231d45;
  color: #fff;
}

/* Section headers — same as home */
.mp-section-h {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 18px 20px 10px;
}
.mp-section-title {
  font-size: 14px; font-weight: 800; color: #231d45; letter-spacing: -0.2px;
}
.mp-section-link {
  font-size: 12px; font-weight: 700; color: #00a19a; cursor: pointer;
}

/* 3-col category grid (Browse-specific — Home uses 4). */
.mp-cat-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 0 20px;
}
.mp-cat-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  border: 2px solid transparent;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  overflow: hidden;
  padding: 0;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
  box-shadow: 0 4px 10px rgba(35, 29, 69, 0.1);
  background-size: cover;
  background-position: center;
}
.mp-cat-tile::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.78) 100%);
  pointer-events: none;
}
.mp-cat-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(35, 29, 69, 0.18);
}
.mp-cat-tile.sel {
  border-color: #00a19a;
  box-shadow: 0 8px 18px rgba(0, 161, 154, 0.45);
}
.mp-cat-name {
  position: absolute;
  bottom: 7px;
  left: 8px;
  right: 8px;
  z-index: 2;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.1px;
  text-align: left;
  line-height: 1.15;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* Job list cards — identical to home page */
.mp-job-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mp-job-list-card {
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  font-family: inherit;
  text-align: left;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.mp-job-list-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(35, 29, 69, 0.1);
}
.mp-job-list-photo {
  position: relative;
  height: 110px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.mp-job-list-urgency {
  position: absolute; top: 10px; left: 10px;
  font-size: 9.5px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase;
  padding: 4px 9px; border-radius: 100px; color: #fff; backdrop-filter: blur(4px);
}
.urg-urgent   { background: rgba(231, 76, 94, 0.92); }
.urg-standard { background: rgba(35, 29, 69, 0.78); }
.urg-flexible { background: rgba(0, 161, 154, 0.86); }
.mp-job-list-cat {
  position: absolute; top: 10px; right: 10px;
  font-size: 10px; font-weight: 700; padding: 4px 9px;
  border-radius: 100px; color: #fff;
  background: rgba(0, 0, 0, 0.32); backdrop-filter: blur(4px);
}
.mp-job-list-distance {
  position: absolute; bottom: 10px; left: 10px;
  font-size: 10.5px; font-weight: 700; padding: 4px 9px;
  border-radius: 100px; color: #fff;
  background: rgba(0, 0, 0, 0.42); backdrop-filter: blur(4px);
}
.mp-job-list-body { padding: 12px 14px 14px; }
.mp-job-list-title {
  font-size: 14px; font-weight: 800; color: #231d45;
  letter-spacing: -0.2px; line-height: 1.3;
}
.mp-job-list-meta {
  font-size: 11px; font-weight: 600; color: #6b7089; margin-top: 4px;
}
.mp-job-list-foot {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-top: 10px;
}
.mp-job-list-budget {
  font-size: 16px; font-weight: 800; color: #00a19a; letter-spacing: -0.4px;
}
.mp-job-list-budget small { font-size: 13px; font-weight: 700; color: #6b7089; }
.mp-job-list-offers {
  font-size: 11px; font-weight: 800; color: #6b7089;
  background: #f5f6fa; padding: 4px 9px; border-radius: 100px;
}

.mp-empty {
  margin: 14px 20px 0;
  padding: 18px;
  background: #fff;
  border: 1px dashed #d8dae6;
  border-radius: 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #6b7089;
  text-align: center;
}

/* Animations */
@keyframes mpFadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
.mp-anim-1 { animation: mpFadeUp 0.4s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.mp-anim-2 { animation: mpFadeUp 0.4s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both; }
.mp-anim-3 { animation: mpFadeUp 0.4s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .mp-anim-1, .mp-anim-2, .mp-anim-3 { animation: none; }
}
</style>
