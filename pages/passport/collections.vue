<template>
  <div class="collections-page mobile-container bg-umu-gradient">
    <!-- Header -->
    <div class="coll-header">
      <button class="back-btn" @click="router.back()">
        <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
          <path
            d="M8.5 1.5L1.5 8.5L8.5 15.5"
            stroke="#00a19a"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>Back</span>
      </button>
      <div class="coll-header-right">
        <button
          class="coll-tour-btn"
          aria-label="Take a quick tour"
          data-tour="tour-btn"
          @click="collectionsTourRef?.start?.()"
        >
          ?
        </button>
        <div
          class="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer"
          @click="navigateTo('/profile')"
        >
          <UserAvatar
            :src="profile?.avatarUrl"
            :firstName="profile?.firstName"
            :lastName="profile?.lastName"
            :size="36"
          />
        </div>
      </div>
    </div>

    <!-- Hero — greeting + big title + inline stats (prototype-matching) -->
    <div class="coll-hero" data-tour="hero">
      <div class="coll-hero-eyebrow">
        Welcome back<template v-if="profile?.firstName"
          >, {{ profile.firstName }}</template
        >
      </div>
      <h1 class="coll-hero-title">Passports</h1>
      <div class="coll-hero-stats" data-tour="stats">
        <span>
          <span class="stat-num">{{ totalPassports }}</span>
          {{ totalPassports === 1 ? 'property' : 'properties' }}
        </span>
        <span class="stat-sep" />
        <span>
          <span class="stat-num">{{ documentsSecured }}</span>
          documents secured
        </span>
        <span class="stat-sep" />
        <span>
          <span class="stat-num gold">{{ pointsEarned }}</span>
          points earned
        </span>
      </div>
    </div>

    <!-- Pick up where you left off — most recently edited passport -->
    <button
      v-if="resumeCard"
      class="coll-resume"
      data-tour="resume"
      @click="goToResume"
    >
      <div class="coll-resume-book">
        <PassportCard
          :line1="resumeCard.addressLine1"
          :line2="resumeCard.postcode"
        />
      </div>
      <div class="coll-resume-content">
        <div class="coll-resume-eyebrow">Pick up where you left off</div>
        <div class="coll-resume-name">{{ resumeCard.addressLine1 }}</div>
        <div class="coll-resume-meta">
          <b
            >{{ resumeCard.sectionsToGo }} section{{
              resumeCard.sectionsToGo === 1 ? '' : 's'
            }}
            to go</b
          >
          <template v-if="resumeCard.lastEdit">
            · last edit {{ resumeCard.lastEdit }}</template
          >
        </div>
        <div class="coll-resume-progress">
          <div class="coll-resume-track">
            <div
              class="coll-resume-fill"
              :style="{ width: resumeCard.pct + '%' }"
            />
          </div>
          <span class="coll-resume-pct">{{ resumeCard.pct }}%</span>
        </div>
      </div>
      <div class="coll-resume-cta">→</div>
    </button>

    <!-- Search -->
    <div class="px-4 mb-4">
      <div class="coll-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#aaa" stroke-width="2" />
          <path
            d="M16.5 16.5L21 21"
            stroke="#aaa"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <input
          v-model="query"
          class="coll-search-input"
          placeholder="Search Passport..."
        />
        <button class="coll-search-btn">Search</button>
      </div>
    </div>

    <!-- Location chips — derived from each passport's city/town -->
    <div
      v-if="cityChips.length > 1"
      class="coll-cities"
    >
      <button
        v-for="chip in cityChips"
        :key="chip.value"
        class="coll-city-chip"
        :class="{ active: cityFilter === chip.value }"
        @click="cityFilter = chip.value"
      >
        <svg
          v-if="chip.value !== 'all'"
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {{ chip.label }}
        <span class="coll-city-num">{{ chip.count }}</span>
      </button>
    </div>

    <!-- Controls row -->
    <div class="controls-row px-4 mb-4">
      <button class="create-collection-btn" @click="showCreateModal = true">
        <span>+</span> Create Collection
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-10">
      <div
        class="w-8 h-8 border-2 border-brand-aqua border-t-transparent rounded-full animate-spin"
      />
    </div>

    <!-- Grid -->
    <div v-else class="passport-grid px-4 pb-24">
      <!-- Collections first -->
      <div
        v-for="collection in filteredCollections"
        :key="collection.id"
        class="grid-cell"
        @click="openCollection(collection)"
      >
        <div class="book-stack">
          <div
            v-for="(item, bi) in collection.items.slice(0, 3)"
            :key="item.id"
            class="stacked-book"
            :style="stackStyle(bi, collection.items.length)"
          >
            <div
              class="passport-book-card"
              :style="
                item.passport.property?.imageUrl
                  ? `background-image: url(${item.passport.property.imageUrl})`
                  : ''
              "
            >
              <div class="book-overlay" />
              <div class="book-brand">Property Passport</div>
              <img src="/op-icons/logo.svg" class="book-logo" alt="" />
              <div class="book-addr">{{ item.passport.addressLine1 }}</div>
            </div>
          </div>
          <div v-if="collection.items.length === 0" class="stacked-book">
            <div class="passport-book-card empty-book">
              <div class="book-overlay" />
              <div class="book-brand">Property Passport</div>
              <img src="/op-icons/logo.svg" class="book-logo" alt="" />
            </div>
          </div>
        </div>
        <p class="cell-name">{{ collection.name }}</p>
        <p class="cell-sub">
          {{ collection.items.length }}
          {{ collection.items.length === 1 ? 'Passport' : 'Passports' }}
        </p>
      </div>

      <!-- Individual uncollected passports -->
      <div
        v-for="passport in filteredPassports"
        :key="passport.id"
        class="grid-cell"
        @click="openPassport(passport.id)"
      >
        <div class="book-stack">
          <div class="stacked-book">
            <div
              class="passport-book-card"
              :style="
                passport.property?.imageUrl
                  ? `background-image: url(${passport.property.imageUrl})`
                  : ''
              "
            >
              <div class="book-overlay" />
              <div class="book-brand">Property Passport</div>
              <img src="/op-icons/logo.svg" class="book-logo" alt="" />
              <div class="book-addr">{{ passport.addressLine1 }}</div>
              <!-- Trash icon — shown on hover -->
              <button
                class="book-trash-btn"
                @click.stop="confirmDelete(passport)"
                title="Delete passport"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline
                    points="3,6 5,6 21,6"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M10 11v6M14 11v6"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <p class="cell-name">{{ shortAddress(passport.addressLine1) }}</p>
        <p class="cell-sub">{{ passport.postcode }}</p>
      </div>

      <!-- Add New -->
      <div class="grid-cell" @click="router.push('/explore')">
        <div class="add-new-box">
          <span class="add-new-plus">+</span>
        </div>
        <p class="cell-name add-name">Add New</p>
        <p class="cell-sub">Add Passport</p>
      </div>
    </div>

    <!-- Watching list — published passports the user has purchased access to -->
    <div v-if="watchingList.length > 0" class="watching-section">
      <div class="watching-header">
        <span class="watching-title">Watching</span>
        <span class="watching-count">{{ watchingList.length }}</span>
      </div>
      <div class="watching-list">
        <div
          v-for="w in watchingList"
          :key="w.id"
          class="watching-card"
          @click="router.push(`/buyer-passport/${w.passportId}`)"
        >
          <div class="watching-card-ic">📘</div>
          <div class="watching-card-body">
            <div class="watching-card-addr">{{ w.addressLine1 }}</div>
            <div class="watching-card-sub">
              {{ w.postcode
              }}<template v-if="w.property?.epcRating">
                · EPC {{ w.property.epcRating }}</template
              >
            </div>
            <div class="watching-card-meta">
              <span class="watching-pill watching-pill-published"
                >📘 Published</span
              >
              <span class="watching-purchased">
                Unlocked {{ formatPurchasedAt(w.purchasedAt) }}
              </span>
            </div>
          </div>
          <div class="watching-card-arrow">→</div>
        </div>
      </div>
    </div>

    <!-- Create collection modal -->
    <CreateCollectionModal
      :show="showCreateModal"
      :available-passports="uncollectedPassports"
      @close="showCreateModal = false"
      @created="onCollectionCreated"
    />

    <!-- Collection detail / manage passports -->
    <CollectionDetailModal
      :show="showDetailModal"
      :collection="activeCollection"
      :uncollected-passports="uncollectedPassports"
      @close="showDetailModal = false"
      @navigate="openPassport"
      @updated="load"
    />

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="delete-overlay"
        @click.self="showDeleteModal = false"
      >
        <div class="delete-modal">
          <div class="delete-modal-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <polyline
                points="3,6 5,6 21,6"
                stroke="#e53e3e"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                stroke="#e53e3e"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M10 11v6M14 11v6"
                stroke="#e53e3e"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"
                stroke="#e53e3e"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h3 class="delete-modal-title">Delete Passport?</h3>
          <p class="delete-modal-body">
            Are you sure you want to delete
            <strong>{{ passportToDelete?.addressLine1 }}</strong
            >? This action cannot be undone and all passport data will be
            permanently removed.
          </p>
          <div class="delete-modal-actions">
            <button
              class="delete-btn-cancel"
              @click="showDeleteModal = false"
              :disabled="deleting"
            >
              Cancel
            </button>
            <button
              class="delete-btn-confirm"
              @click="executeDelete"
              :disabled="deleting"
            >
              <span v-if="deleting" class="delete-spinner" />
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Guided tour — auto-runs once per browser, replays from "?" button -->
    <OnboardingTour
      ref="collectionsTourRef"
      :steps="collectionsTourSteps"
      storage-key="umu_tour_collections_v1"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CreateCollectionModal from '@/components/modals/CreateCollectionModal.vue'
import CollectionDetailModal from '@/components/modals/CollectionDetailModal.vue'
import UserAvatar from '~/components/ui/UserAvatar.vue'
import PassportCard from '~/components/passport-view/PassportCard.vue'
import OnboardingTour from '~/components/ui/OnboardingTour.vue'

const { profile } = useProfile()

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const config = useRuntimeConfig()

const loading = ref(true)
const collections = ref([])
const uncollectedPassports = ref([])
const watchingList = ref([])
const query = ref('')
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const activeCollection = ref(null)
const sortAsc = ref(true)
const cityFilter = ref('all')

// Pull a sensible "place" label from any passport — prefers city, falls
// back to the postcode area (the letters before the first digit, e.g. "CV5"
// → "CV", "SK7" → "SK"). Lets us auto-derive Coventry/Stockport-style
// chips even when a city field isn't set on the model.
function passportCity(p) {
  if (!p) return null
  const city = (p.city || p.property?.city || '').trim()
  if (city) return city
  const pc = (p.postcode || '').trim().toUpperCase()
  if (!pc) return null
  const area = pc.match(/^[A-Z]+/)?.[0]
  return area || null
}

// Delete state
const showDeleteModal = ref(false)
const passportToDelete = ref(null)
const deleting = ref(false)

const toggleSort = () => {
  sortAsc.value = !sortAsc.value
}

function passportMatchesCity(p) {
  if (cityFilter.value === 'all') return true
  return passportCity(p) === cityFilter.value
}

const filteredCollections = computed(() => {
  let list = [...collections.value]
  const q = query.value.trim().toLowerCase()
  if (q) list = list.filter((c) => c.name.toLowerCase().includes(q))
  // A collection is visible if any of its passports match the city filter.
  if (cityFilter.value !== 'all') {
    list = list.filter((c) =>
      (c.items ?? []).some((it) => passportMatchesCity(it.passport)),
    )
  }
  return sortAsc.value ? list : [...list].reverse()
})

const filteredPassports = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = uncollectedPassports.value ?? []
  if (q) {
    list = list.filter(
      (p) =>
        p.addressLine1.toLowerCase().includes(q) ||
        p.postcode.toLowerCase().includes(q),
    )
  }
  if (cityFilter.value !== 'all') {
    list = list.filter(passportMatchesCity)
  }
  return list
})

// Build the list of city chips from the data already loaded — labelled
// with whichever city/postcode-area each passport actually has, with the
// number of passports per chip. The "All" chip is always first.
const cityChips = computed(() => {
  const counts = new Map()
  for (const p of allPassports.value) {
    const c = passportCity(p)
    if (!c) continue
    counts.set(c, (counts.get(c) || 0) + 1)
  }
  const places = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, label: value, count }))
  return [
    { value: 'all', label: 'All locations', count: allPassports.value.length },
    ...places,
  ]
})

// ── Hero stats (prototype: properties · documents · points) ─────────
// Pulled entirely from the data the page already loads — no extra fetches.
const allPassports = computed(() => {
  const inCols =
    collections.value?.flatMap((c) => c.items?.map((i) => i.passport) ?? []) ??
    []
  return [...inCols, ...(uncollectedPassports.value ?? [])]
})
const totalPassports = computed(() => allPassports.value.length)
const publishedCount = computed(
  () => allPassports.value.filter((p) => p?.status === 'PUBLISHED').length,
)
const inProgressCount = computed(
  () => totalPassports.value - publishedCount.value,
)
const buyerAccessCount = computed(() => watchingList.value?.length ?? 0)

// Documents secured = sum of any per-passport `documentsCount` the API
// returns. Falls back to the count of completed tasks if those are present.
const documentsSecured = computed(() => {
  return allPassports.value.reduce((sum, p) => {
    const direct = Number(p?.documentsCount ?? p?.docsCount ?? 0)
    if (direct > 0) return sum + direct
    const completed = Number(p?.completedTasks ?? p?.completedTaskCount ?? 0)
    return sum + completed
  }, 0)
})

// Points earned — uses `pointsEarned` if returned per passport.
const pointsEarned = computed(() => {
  return allPassports.value.reduce(
    (sum, p) => sum + Number(p?.pointsEarned ?? p?.points ?? 0),
    0,
  )
})

// "Pick up where you left off" card — the most recently visited (or
// updated) passport, with progress bar and a circular CTA.
const resumeCard = computed(() => {
  const list = allPassports.value
  if (!list.length) return null
  // Pick the passport with the most recent activity. Prefer
  // lastVisitedAt (set by the resume tracking we added on the backend),
  // then updatedAt, then createdAt.
  const sorted = [...list].sort((a, b) => {
    const ax = +new Date(a?.lastVisitedAt || a?.updatedAt || a?.createdAt || 0)
    const bx = +new Date(b?.lastVisitedAt || b?.updatedAt || b?.createdAt || 0)
    return bx - ax
  })
  const p = sorted[0]
  if (!p) return null
  // Best-effort completion estimate from whatever fields are present.
  const total = Number(p?.totalSections ?? p?.sectionsCount ?? 18)
  const done = Number(p?.completedSections ?? p?.sectionsComplete ?? 0)
  const pct = Number(
    p?.completionPct ??
      p?.progress ??
      (total ? Math.round((done / total) * 100) : 0),
  )
  return {
    id: p.id,
    addressLine1: p.addressLine1,
    postcode: p.postcode,
    sectionsToGo: Math.max(0, total - done),
    pct: Math.max(0, Math.min(100, pct || 0)),
    lastEdit: relativeTime(p?.lastVisitedAt || p?.updatedAt),
  }
})

function relativeTime(iso) {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return ''
  const mins = Math.round(ms / 60000)
  if (mins < 60) return `${Math.max(1, mins)} min${mins === 1 ? '' : 's'} ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function goToResume() {
  if (resumeCard.value?.id) {
    router.push(`/passportview/${resumeCard.value.id}`)
  }
}

// ── Guided tour ───────────────────────────────────────────────────
const collectionsTourRef = ref(null)
const collectionsTourSteps = [
  {
    selector: '[data-tour="hero"]',
    title: 'Your portfolio',
    body: 'Every Property Passport you own lives here. The greeting changes when you come back tomorrow.',
  },
  {
    selector: '[data-tour="stats"]',
    title: 'Snapshot',
    body: 'Number of properties, total documents secured across all passports, and points earned for completing tasks.',
  },
  {
    selector: '[data-tour="resume"]',
    title: 'Pick up where you left off',
    body: 'Tap this card to jump straight back to your most recently edited passport — exactly where you stopped.',
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'Replay this tour',
    body: 'Tap "?" any time to walk through this again. Welcome to umovingu!',
  },
]

const load = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
    const [data, watching] = await Promise.all([
      $fetch(`${config.public.apiBase}/collection/my`, { headers }),
      $fetch(`${config.public.apiBase}/passport/buyer-access`, {
        headers,
      }).catch(() => []),
    ])
    collections.value = data.collections
    uncollectedPassports.value = data.uncollectedPassports
    watchingList.value = Array.isArray(watching) ? watching : []
  } catch (e) {
    console.error('Failed to load collections', e)
  } finally {
    loading.value = false
  }
}

const formatPurchasedAt = (iso) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
}

onMounted(load)

const onCollectionCreated = () => {
  load()
}

const openPassport = (id) => {
  showDetailModal.value = false
  router.push(`/passportview/${id}`)
}

const openCollection = (collection) => {
  activeCollection.value = collection
  showDetailModal.value = true
}

const shortAddress = (addr) => {
  const parts = addr.split(',')
  return parts.length > 1 ? `${parts[0]},${parts[1]}` : addr
}

const stackStyle = (index) => {
  const clampedIndex = Math.min(index, 2)
  const rotations = [-8, -3, 0]
  const offsets = [-14, -7, 0]
  const zIndex = clampedIndex + 1
  return {
    transform: `rotate(${rotations[clampedIndex]}deg) translateX(${offsets[clampedIndex]}px)`,
    zIndex,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: '-55px',
  }
}

const confirmDelete = (passport) => {
  passportToDelete.value = passport
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!passportToDelete.value) return
  deleting.value = true
  try {
    const token = localStorage.getItem('token')
    await $fetch(
      `${config.public.apiBase}/passport/${passportToDelete.value.id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    showDeleteModal.value = false
    passportToDelete.value = null
    await load()
  } catch (e) {
    console.error('Failed to delete passport', e)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.collections-page {
  /* `mobile-container` already provides max-w-md / mx-auto / w-full /
     min-h-dvh; we just need to make sure the page can grow naturally and
     scrolls with the document, not inside a clipped container. */
  width: 100%;
  background: #eef3f3;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

/* Header */
.coll-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #00a19a;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

/* Title block */
.coll-title-block {
  text-align: center;
  padding: 16px 24px 20px;
}

.coll-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px;
}

.coll-subtitle-colored {
  color: #00a19a;
  font-size: 15px;
  margin: 0 0 4px;
}

.coll-subtitle {
  color: #8e8e93;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
}

/* ── Header — tour-button alignment ─────────────────────── */
.coll-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.coll-tour-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #eef0f6;
  color: #4a5568;
  font-size: 15px;
  font-weight: 800;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.coll-tour-btn:hover,
.coll-tour-btn:active {
  background: #f1f5f9;
}

/* ── Hero block (greeting + Passports + inline stats) ───── */
.coll-hero {
  padding: 4px 16px 12px;
}
.coll-hero-eyebrow {
  font-size: 17px;
  font-style: italic;
  color: #0d9488;
  letter-spacing: 0.01em;
  margin-bottom: 6px;
  font-family: Georgia, 'Times New Roman', serif;
}
.coll-hero-title {
  font-size: 44px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: #0e2840;
  margin: 0 0 10px;
}
.coll-hero-stats {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  letter-spacing: -0.01em;
}
.coll-hero-stats .stat-num {
  color: #0e2840;
  font-weight: 800;
  font-feature-settings: 'tnum';
  margin-right: 4px;
}
.coll-hero-stats .stat-num.gold {
  color: #b07a1f;
}
.coll-hero-stats .stat-sep {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #cbd5e1;
  margin: 0 8px;
}

/* ── Resume card ─────────────────────────────────────────── */
.coll-resume {
  display: flex;
  align-items: center;
  gap: 14px;
  width: calc(100% - 32px);
  margin: 8px 16px 16px;
  padding: 14px;
  background: linear-gradient(135deg, #f4fbfa, #eafaf9);
  border: 1px solid #b2e8e6;
  border-radius: 18px;
  cursor: pointer;
  text-align: left;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.18s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 2px 10px rgba(31, 122, 102, 0.08);
}
.coll-resume:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(31, 122, 102, 0.18);
}
.coll-resume-book {
  width: 76px;
  flex-shrink: 0;
  filter: drop-shadow(0 6px 12px rgba(0, 140, 134, 0.22));
}
.coll-resume-book :deep(.passport-card) {
  margin: 0;
  padding: 0;
}
.coll-resume-book :deep(.passport-container) {
  width: 100%;
  height: 96px;
}
.coll-resume-content {
  flex: 1;
  min-width: 0;
}
.coll-resume-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #008c86;
  margin-bottom: 4px;
}
.coll-resume-name {
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.01em;
  text-decoration: underline;
  text-decoration-color: rgba(13, 148, 136, 0.4);
  text-underline-offset: 3px;
  margin-bottom: 4px;
}
.coll-resume-meta {
  font-size: 12px;
  color: #4a5568;
  margin-bottom: 8px;
  line-height: 1.4;
}
.coll-resume-meta b {
  color: #008c86;
  font-weight: 700;
}
.coll-resume-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
.coll-resume-track {
  flex: 1;
  height: 5px;
  background: #d5ece8;
  border-radius: 999px;
  overflow: hidden;
}
.coll-resume-fill {
  height: 100%;
  background: linear-gradient(90deg, #008c86, #00b5ad);
  border-radius: 999px;
  transition: width 0.5s ease;
}
.coll-resume-pct {
  font-size: 12.5px;
  font-weight: 800;
  color: #008c86;
  flex-shrink: 0;
}
.coll-resume-cta {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00a19a, #008c86);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.36);
  transition: transform 0.15s ease;
}
.coll-resume:hover .coll-resume-cta {
  transform: translateX(2px);
}

/* Search */
.coll-search {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 40px;
  padding: 12px 16px;
  gap: 10px;
  border: 1.5px solid #e5e5ea;
}

.coll-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;
}

.coll-search-input::placeholder {
  color: #aaa;
}

.coll-search-btn {
  color: #00a19a;
  font-size: 15px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
}

/* Controls */
.controls-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* Location chips */
.coll-cities {
  display: flex;
  gap: 6px;
  padding: 0 16px 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.coll-cities::-webkit-scrollbar {
  display: none;
}
.coll-city-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff;
  border: 1.5px solid #eef0f6;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #4a5568;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
  font-family: inherit;
}
.coll-city-chip:hover {
  border-color: #b2e8e6;
  color: #008c86;
}
.coll-city-chip.active {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.28);
}
.coll-city-num {
  font-size: 10.5px;
  font-weight: 800;
  background: rgba(0, 161, 154, 0.12);
  color: #008c86;
  padding: 1px 7px;
  border-radius: 999px;
}
.coll-city-chip.active .coll-city-num {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.sort-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid #e0e0e0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.create-collection-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 24px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  cursor: pointer;
}

/* Grid */
.passport-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.grid-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

/* Book stack container */
.book-stack {
  position: relative;
  width: 110px;
  height: 145px;
}

/* Individual book */
.stacked-book {
  width: 110px;
  height: 145px;
  border-radius: 8px;
}

/* The actual passport book card */
.passport-book-card {
  width: 110px;
  height: 145px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(160deg, #1a4a5a 0%, #0d2d3a 100%);
  background-size: cover;
  background-position: center;
  box-shadow: 3px 4px 14px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.passport-book-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 8px;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2;
  border-radius: 8px 0 0 8px;
}

.empty-book {
  background: linear-gradient(160deg, #2a5a6a 0%, #1a3d4a 100%);
}

.book-overlay {
  position: absolute;
  inset: 0;
  background: rgb(0 161 154 / 20%);
  z-index: 1;
}

.book-brand {
  position: absolute;
  top: 10px;
  left: 12px;
  right: 4px;
  z-index: 3;
  color: white;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
}

.book-logo {
  width: 44px;
  height: 44px;
  object-fit: contain;
  position: relative;
  z-index: 3;
  filter: brightness(0) invert(1);
}

.book-addr {
  position: absolute;
  bottom: 10px;
  left: 12px;
  right: 6px;
  z-index: 3;
  color: white;
  font-size: 7.5px;
  font-weight: 600;
  line-height: 1.3;
}

/* Trash button — hidden by default, shown on hover */
.book-trash-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 10;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(229, 62, 62, 0.85);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transform: scale(0.8);
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
  backdrop-filter: blur(4px);
}

.passport-book-card:hover .book-trash-btn {
  opacity: 1;
  transform: scale(1);
}

/* Cell labels */
.cell-name {
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
  text-align: center;
  margin: 0;
}

.cell-sub {
  font-size: 12px;
  color: #8e8e93;
  text-align: center;
  margin: 0;
  margin-top: -6px;
}

/* Add New card */
.add-new-box {
  width: 110px;
  height: 145px;
  border-radius: 8px;
  border: 2px dashed #00a19a;
  background: rgba(0, 161, 154, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-new-plus {
  font-size: 36px;
  color: #00a19a;
  font-weight: 300;
  line-height: 1;
}

.add-name {
  color: #00a19a;
}

/* Delete confirmation overlay */
.delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.delete-modal {
  background: white;
  border-radius: 20px;
  padding: 28px 24px 24px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  animation: pop-in 0.2s ease;
}

@keyframes pop-in {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.delete-modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fff5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.delete-modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 10px;
}

.delete-modal-body {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px;
}

.delete-modal-body strong {
  color: #333;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
}

.delete-btn-cancel {
  flex: 1;
  padding: 13px;
  border-radius: 12px;
  border: 1.5px solid #e0e0e0;
  background: white;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: background 0.15s;
}

.delete-btn-cancel:hover:not(:disabled) {
  background: #f5f5f5;
}

.delete-btn-confirm {
  flex: 1;
  padding: 13px;
  border-radius: 12px;
  border: none;
  background: #e53e3e;
  font-size: 15px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s;
}

.delete-btn-confirm:disabled,
.delete-btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Watching section — buyer's purchased Passport access cards */
.watching-section {
  padding: 0 16px 80px;
  margin-top: -8px;
}
.watching-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
}
.watching-title {
  font-size: 14px;
  font-weight: 800;
  color: #1f2024;
  letter-spacing: -0.01em;
}
.watching-count {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: #231d45;
  padding: 2px 8px;
  border-radius: 999px;
}
.watching-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.watching-card {
  background: #fff;
  border: 1.5px solid #99f6e4;
  border-radius: 14px;
  padding: 13px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.watching-card:active {
  transform: scale(0.985);
}
.watching-card-ic {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: #f0fdfa;
  display: grid;
  place-items: center;
  font-size: 20px;
  flex-shrink: 0;
}
.watching-card-body {
  flex: 1;
  min-width: 0;
}
.watching-card-addr {
  font-size: 13px;
  font-weight: 800;
  color: #1f2024;
  line-height: 1.25;
}
.watching-card-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}
.watching-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}
.watching-pill {
  font-size: 9.5px;
  font-weight: 700;
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
}
.watching-pill-published {
  background: #231d45;
  color: #fff;
}
.watching-purchased {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
}
.watching-card-arrow {
  font-size: 18px;
  color: #00a19a;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
