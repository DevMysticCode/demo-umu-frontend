<template>
  <div class="collections-page">
    <!-- Header -->
    <div class="coll-header">
      <button class="back-btn" @click="router.back()">
        <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
          <path d="M8.5 1.5L1.5 8.5L8.5 15.5" stroke="#00a19a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Back</span>
      </button>
      <div class="w-9 h-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        <img src="/op-icons/temp/profilepic.png" class="w-full h-full object-cover" alt="" />
      </div>
    </div>

    <!-- Title block -->
    <div class="coll-title-block">
      <h1 class="coll-title">Property Passports</h1>
      <p class="coll-subtitle-colored">Legally-backed details, instantly accessible.</p>
      <p class="coll-subtitle">Access every document, detail, and verification for your property</p>
    </div>

    <!-- Search -->
    <div class="px-4 mb-4">
      <div class="coll-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#aaa" stroke-width="2"/>
          <path d="M16.5 16.5L21 21" stroke="#aaa" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="query" class="coll-search-input" placeholder="Search Passport..." />
        <button class="coll-search-btn">Search</button>
      </div>
    </div>

    <!-- Controls row -->
    <div class="controls-row px-4 mb-4">
      <button class="sort-btn" @click="toggleSort">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M7 12h10M11 18h2" stroke="#555" stroke-width="2" stroke-linecap="round"/>
          <path d="M17 4v16M7 4v16" stroke="#555" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
          <path d="M14 7l3-3 3 3M10 17l-3 3-3-3" stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button class="create-collection-btn" @click="showCreateModal = true">
        <span>+</span> Create Collection
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-10">
      <div class="w-8 h-8 border-2 border-brand-aqua border-t-transparent rounded-full animate-spin" />
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
        <!-- Stacked books -->
        <div class="book-stack">
          <div
            v-for="(item, bi) in collection.items.slice(0, 3)"
            :key="item.id"
            class="stacked-book"
            :style="stackStyle(bi, collection.items.length)"
          >
            <div
              class="passport-book-card"
              :style="item.passport.property?.imageUrl ? `background-image: url(${item.passport.property.imageUrl})` : ''"
            >
              <div class="book-overlay" />
              <div class="book-brand">Property Passport</div>
              <img src="/op-icons/logo.svg" class="book-logo" alt="" />
              <div class="book-addr">{{ item.passport.addressLine1 }}</div>
            </div>
          </div>
          <!-- Placeholder if no passports yet -->
          <div v-if="collection.items.length === 0" class="stacked-book">
            <div class="passport-book-card empty-book">
              <div class="book-overlay" />
              <div class="book-brand">Property Passport</div>
              <img src="/op-icons/logo.svg" class="book-logo" alt="" />
            </div>
          </div>
        </div>
        <p class="cell-name">{{ collection.name }}</p>
        <p class="cell-sub">{{ collection.items.length }} {{ collection.items.length === 1 ? 'Passport' : 'Passports' }}</p>
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
              :style="passport.property?.imageUrl ? `background-image: url(${passport.property.imageUrl})` : ''"
            >
              <div class="book-overlay" />
              <div class="book-brand">Property Passport</div>
              <img src="/op-icons/logo.svg" class="book-logo" alt="" />
              <div class="book-addr">{{ passport.addressLine1 }}</div>
            </div>
          </div>
        </div>
        <p class="cell-name">{{ shortAddress(passport.addressLine1) }}</p>
        <p class="cell-sub">{{ passport.postcode }}</p>
      </div>

      <!-- Add New -->
      <div class="grid-cell" @click="router.push('/dashboard')">
        <div class="add-new-box">
          <span class="add-new-plus">+</span>
        </div>
        <p class="cell-name add-name">Add New</p>
        <p class="cell-sub">Add Passport</p>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CreateCollectionModal from '@/components/modals/CreateCollectionModal.vue'
import CollectionDetailModal from '@/components/modals/CollectionDetailModal.vue'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const config = useRuntimeConfig()

const loading = ref(true)
const collections = ref([])
const uncollectedPassports = ref([])
const query = ref('')
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const activeCollection = ref(null)
const sortAsc = ref(true)

const toggleSort = () => { sortAsc.value = !sortAsc.value }

const filteredCollections = computed(() => {
  let list = [...collections.value]
  const q = query.value.trim().toLowerCase()
  if (q) list = list.filter(c => c.name.toLowerCase().includes(q))
  return sortAsc.value ? list : [...list].reverse()
})

const filteredPassports = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return uncollectedPassports.value
  return uncollectedPassports.value.filter(
    p => p.addressLine1.toLowerCase().includes(q) || p.postcode.toLowerCase().includes(q)
  )
})

const load = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const data = await $fetch(`${config.public.apiBase}/collection/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    collections.value = data.collections
    uncollectedPassports.value = data.uncollectedPassports
  } catch (e) {
    console.error('Failed to load collections', e)
  } finally {
    loading.value = false
  }
}

onMounted(load)

const onCollectionCreated = () => {
  load() // Reload so the new collection + any added passports appear correctly
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
  // "12 Maple Road, Staines-upon-Thames" → show without city for brevity
  const parts = addr.split(',')
  return parts.length > 1 ? `${parts[0]},${parts[1]}` : addr
}

// Stacking style for multi-book collections
const stackStyle = (index, total) => {
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
</script>

<style scoped>
.collections-page {
  min-height: 100vh;
  background: #eef3f3;
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

.coll-search-input::placeholder { color: #aaa; }

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
  justify-content: space-between;
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
  background: linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%);
  z-index: 1;
}

.book-brand {
  position: relative;
  z-index: 3;
  color: white;
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-align: center;
  position: absolute;
  top: 10px;
  left: 12px;
  right: 4px;
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
</style>
