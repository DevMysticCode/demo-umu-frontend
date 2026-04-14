<template>
  <div class="mobile-container snapshot-page bg-umu-gradient">
    <section class="snapshot-hero">
      <div class="snapshot-header">
        <button class="snapshot-back-btn" aria-label="Go back" @click="goBack">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 5L8 12L15 19"
              stroke="#000"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button class="snapshot-dots-btn" aria-label="More options">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="5" cy="12" r="2.5" fill="white" />
            <circle cx="12" cy="12" r="2.5" fill="white" />
            <circle cx="19" cy="12" r="2.5" fill="white" />
          </svg>
        </button>
      </div>

      <img
        src="/op-icons/temp/home.svg"
        alt="Property snapshots"
        class="snapshot-hero-image"
      />

      <h1 class="snapshot-title">Property Snapshots</h1>
      <p class="snapshot-subtitle">
        Organize and browse your saved property snapshots
      </p>

      <div class="snapshot-search-row">
        <div class="snapshot-search-input">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="11" cy="11" r="8" stroke="#ccc" stroke-width="2" />
            <path
              d="M20 20.5L15.5 16"
              stroke="#ccc"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <input v-model="search" type="text" placeholder="Search Snapshots" />
        </div>

        <button class="snapshot-filter-btn" aria-label="Filter snapshots">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 7H20"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M7 12H17"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M10 17H14"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </section>

    <section class="snapshot-list-wrap">
      <h2 class="snapshot-list-title">All Snapshots</h2>

      <div v-if="loading" class="snapshot-empty">Loading…</div>

      <div v-else-if="filteredSnapshots.length === 0" class="snapshot-empty">
        No wishlisted properties yet. Tap the heart icon on any property to add
        it here.
      </div>

      <div v-else class="snapshot-list">
        <button
          v-for="item in filteredSnapshots"
          :key="item.id"
          class="snapshot-card"
          type="button"
          @click="router.push(`/property/${item.id}`)"
        >
          <div class="snapshot-card-content">
            <h3 class="snapshot-card-title">{{ item.addressLine1 }}</h3>
            <p class="snapshot-card-city">{{ item.city || item.county }}</p>
            <p class="snapshot-card-postcode">{{ item.postcode }}</p>
            <p class="snapshot-card-date">
              Added: {{ formatDate(item.wishlistedAt) }}
            </p>
          </div>

          <svg
            class="snapshot-card-arrow"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 5L16 12L9 19"
              stroke="#c6c7cc"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { usePropertyActions } from '~/composables/usePropertyActions'

definePageMeta({ middleware: 'auth' })

const router = useRouter()
const search = ref('')
const loading = ref(true)
const snapshots = ref<any[]>([])

const { fetchWishlist } = usePropertyActions()

onMounted(async () => {
  try {
    snapshots.value = await fetchWishlist()
  } finally {
    loading.value = false
  }
})

const filteredSnapshots = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return snapshots.value
  return snapshots.value.filter((item) =>
    [item.addressLine1, item.city, item.county, item.postcode]
      .join(' ')
      .toLowerCase()
      .includes(q),
  )
})

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.snapshot-page {
  background: linear-gradient(180deg, #f5f5f7 0%, #e8f2f3 100%);
}

.snapshot-hero {
  padding: 12px 14px 16px;
}

.snapshot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.snapshot-back-btn {
  width: 40px;
  height: 44px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.snapshot-dots-btn {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: none;
  background: #403d91;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.snapshot-hero-image {
  width: 144px;
  display: block;
  margin: 0 auto 16px;
  object-fit: contain;
}

.snapshot-title {
  margin: 0;
  text-align: center;
  font-size: 20px;
  line-height: 25px;
  letter-spacing: -0.45px;
  font-weight: 590;
  color: #000000;
  margin-bottom: 4px;
}

.snapshot-subtitle {
  margin: 0 auto 20px;
  text-align: center;
  font-size: 15px;
  letter-spacing: -0.23px;
  line-height: 20px;
  color: #3c3c4399;
  max-width: 300px;
}

.snapshot-search-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.snapshot-search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e5e5ea;
  border-radius: 20px;
  height: 48px;
  padding: 0 12px;
}

.snapshot-search-input input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 14px;
  color: #000;
}

.snapshot-search-input input::placeholder {
  color: #c7c7cc;
}

.snapshot-filter-btn {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: 0;
  background: #17aaa0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.snapshot-list-wrap {
  padding: 16px 14px 40px;
}

.snapshot-list-title {
  margin: 0 4px 12px;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  font-weight: 590;
  color: #000000;
}

.snapshot-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.snapshot-card {
  width: 100%;
  text-align: left;
  border: 0.33px solid var(--Labels-Quaternary, #3c3c432e);
  border-radius: 16px;
  gap: 8px;
  background: white;
  padding: 14px 12px 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.15s;
}

.snapshot-card:active {
  background: #f9f9f9;
}

.snapshot-card-content {
  min-width: 0;
  flex: 1;
}

.snapshot-card-title {
  margin: 0 0 2px;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  font-weight: 400;
  color: #000000;
}

.snapshot-card-city {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  color: #3c3c4399;
  font-weight: 400;
}

.snapshot-card-region {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  color: #3c3c4399;
  font-weight: 400;
}

.snapshot-card-postcode {
  margin: 0 0 6px;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  color: #3c3c4399;
  font-weight: 400;
}

.snapshot-card-date {
  margin: 0;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.06px;
  color: #00a19a;
  font-weight: 400;
}

.snapshot-card-arrow {
  flex-shrink: 0;
  margin-left: 8px;
}

.snapshot-empty {
  text-align: center;
  padding: 32px 16px;
  font-size: 14px;
  color: #9c9ca6;
  line-height: 1.6;
}
</style>
