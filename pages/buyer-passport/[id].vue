<template>
  <div class="mobile-container buyer-page min-h-screen">
    <!-- Loading -->
    <div v-if="loading" class="buyer-loading">
      <div class="buyer-spinner" />
      <p>Loading passport...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="buyer-loading">
      <p>{{ error }}</p>
    </div>

    <!-- Content -->
    <template v-else-if="data">
      <!-- Hero Image -->
      <div class="buyer-hero">
        <img
          :src="propertyImage"
          alt="Property"
          class="buyer-hero__image"
        />
        <!-- Passport badge overlay -->
        <div class="buyer-hero__badge">
          <OPIcon name="umuLogo" class="w-[32px] h-[32px]" />
          <span>Property Passport</span>
        </div>
        <!-- Image count -->
        <div class="buyer-hero__count">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" stroke-width="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="white"/>
            <path d="M21 15l-5-5L5 21" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
          12 Images
        </div>
        <!-- Nav buttons -->
        <div class="buyer-hero__nav">
          <button class="hero-btn" @click="goBack">
            <OPIcon name="leftChevronWhite" class="w-[16px] h-[16px]" />
          </button>
          <div class="flex gap-3">
            <button class="hero-btn">
              <OPIcon name="wishlist" class="w-[18px] h-[18px]" />
            </button>
            <button class="hero-btn">
              <OPIcon name="share" class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <!-- White content card -->
      <div class="buyer-card">
        <!-- Address / Price -->
        <div class="buyer-title-block">
          <h1 class="buyer-address">{{ data.passport.addressLine1 }}</h1>
          <p class="buyer-city">
            {{ cityLine }}
          </p>
          <p class="buyer-price" v-if="data.property?.estimatedPrice">
            {{ formatPrice(data.property.estimatedPrice) }}
            <span class="buyer-estimated">Estimated Value</span>
          </p>
        </div>

        <!-- Badges -->
        <div class="buyer-badges" v-if="data.property">
          <span v-if="data.property.bedrooms" class="buyer-badge">
            <OPIcon name="bedroomWhite" class="w-[13px] h-[13px]" />
            {{ data.property.bedrooms }}
          </span>
          <span v-if="data.property.bathrooms" class="buyer-badge">
            <OPIcon name="bathroomWhite" class="w-[13px] h-[13px]" />
            {{ data.property.bathrooms }}
          </span>
          <span v-if="data.property.propertyType" class="buyer-badge">
            {{ data.property.propertyType }}
          </span>
          <span v-if="data.property.sqft" class="buyer-badge">
            <OPIcon name="sqftWhite" class="w-[13px] h-[13px]" />
            {{ data.property.sqft.toLocaleString() }} sqft
          </span>
        </div>

        <!-- Property Details -->
        <div class="buyer-section">
          <h2 class="buyer-section-title">Property Details</h2>
          <p class="buyer-section-sub">Key characteristics that define this property.</p>
          <div class="buyer-details-card" v-if="data.property">
            <div class="buyer-details-grid">
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="propertyTypeIcon" class="w-[28px] h-[28px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Property type</p>
                  <p class="buyer-detail-value">{{ data.property.propertyType || '—' }}</p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="titleNumberIcon" class="w-[28px] h-[28px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Title number</p>
                  <p class="buyer-detail-value">{{ data.property.titleNumber || '—' }}</p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="sqftIcon" class="w-[28px] h-[28px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Area sqft</p>
                  <p class="buyer-detail-value">{{ data.property.sqft ? data.property.sqft.toLocaleString() + ' sqft' : '—' }}</p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="epcIcon" class="w-[28px] h-[28px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">EPC Rating</p>
                  <p class="buyer-detail-value">{{ data.property.epcRating || '—' }}</p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="tenureIcon" class="w-[28px] h-[28px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Tenure</p>
                  <p class="buyer-detail-value">{{ data.property.tenure || '—' }}</p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="yearBuiltIcon" class="w-[28px] h-[28px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Year Built</p>
                  <p class="buyer-detail-value">{{ data.property.yearBuilt || '—' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Official Records -->
        <div class="buyer-section">
          <h2 class="buyer-section-title">Official Records</h2>
          <p class="buyer-section-sub">Verified documents that define the legal and structural status of the property.</p>

          <!-- Search -->
          <div class="buyer-search-row">
            <div class="buyer-search-input">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" class="buyer-search-icon">
                <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/>
                <path d="M21 21l-4.35-4.35" stroke="#999" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <input v-model="searchQuery" type="text" placeholder="Search Records..." />
            </div>
            <button class="buyer-sort-btn">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M3 6h18M6 12h12M9 18h6" stroke="#00a19a" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Records List -->
          <div class="buyer-records-list">
            <div
              v-for="section in filteredSections"
              :key="section.id"
              class="buyer-record-row"
              @click="goToSection(section.id)"
            >
              <div class="buyer-record-icon">
                <OPIcon :name="section.imageKey || 'fittingsContents'" class="w-[52px] h-[52px]" />
              </div>
              <div class="buyer-record-info">
                <h3 class="buyer-record-title">{{ section.title }}</h3>
                <p class="buyer-record-sub">{{ section.subtitle || section.description || 'View details' }}</p>
              </div>
              <button class="buyer-record-arrow">
                <OPIcon name="caretRight" class="w-[13px] h-[13px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const passportId = route.params.id as string

const data = ref<any>(null)
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')

onMounted(async () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    data.value = await $fetch(`${config.public.apiBase}/passport/${passportId}/buyer-view`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load passport.'
  } finally {
    loading.value = false
  }
})

const propertyImage = computed(() => {
  return (
    data.value?.property?.imageUrl ||
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
  )
})

const cityLine = computed(() => {
  const p = data.value?.property
  if (!p) return data.value?.passport?.postcode || ''
  return [p.city, p.county, p.postcode].filter(Boolean).join(', ')
})

const filteredSections = computed(() => {
  if (!data.value?.sections) return []
  const q = searchQuery.value.toLowerCase()
  if (!q) return data.value.sections
  return data.value.sections.filter((s: any) =>
    s.title.toLowerCase().includes(q) || (s.subtitle || '').toLowerCase().includes(q)
  )
})

function formatPrice(price: number) {
  return '£' + price.toLocaleString('en-GB')
}

function goBack() {
  router.back()
}

function goToSection(sectionId: string) {
  router.push(`/buyer-passport/section/${sectionId}?passportId=${passportId}`)
}
</script>

<style scoped>
.buyer-page {
  background: #f2f6f6;
  padding-bottom: 40px;
}

.buyer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: #666;
  font-size: 15px;
}

.buyer-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Hero */
.buyer-hero {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.buyer-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.buyer-hero__badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 161, 154, 0.92);
  backdrop-filter: blur(4px);
  border-radius: 10px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 11px;
  font-weight: 600;
}

.buyer-hero__count {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-size: 11px;
}

.buyer-hero__nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  z-index: 2;
}

.hero-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

/* Card */
.buyer-card {
  position: relative;
  padding: 24px 16px 0;
  background: white;
}

/* Title */
.buyer-title-block {
  margin-bottom: 14px;
}

.buyer-address {
  color: #000;
  font-weight: 590;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  margin: 0 0 2px;
}

.buyer-city {
  color: #3c3c4399;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  margin: 0 0 2px;
}

.buyer-price {
  color: #00a19a;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  margin: 0;
}

.buyer-estimated {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin-left: 6px;
}

/* Badges */
.buyer-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.buyer-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #00a19a;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
}

/* Section */
.buyer-section {
  margin-bottom: 28px;
}

.buyer-section-title {
  font-size: 17px;
  font-weight: 590;
  color: #000;
  margin: 0 0 4px;
  line-height: 22px;
}

.buyer-section-sub {
  font-size: 13px;
  color: #3c3c4399;
  margin: 0 0 14px;
}

/* Details card */
.buyer-details-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 8px 16px;
}

.buyer-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 12px 0;
}

.buyer-detail-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.buyer-detail-icon-wrap {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.buyer-detail-label {
  font-size: 11px;
  color: #3c3c4399;
  margin: 0 0 2px;
  line-height: 1.3;
}

.buyer-detail-value {
  font-size: 14px;
  font-weight: 590;
  color: #00a19a;
  margin: 0;
}

/* Search */
.buyer-search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.buyer-search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 10px 14px;
}

.buyer-search-input input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
}

.buyer-search-input input::placeholder {
  color: #999;
}

.buyer-search-icon {
  flex-shrink: 0;
}

.buyer-sort-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Records list */
.buyer-records-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  background: white;
}

.buyer-record-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
}

.buyer-record-row:last-child {
  border-bottom: none;
}

.buyer-record-row:active {
  background: #f8f8f8;
}

.buyer-record-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.buyer-record-info {
  flex: 1;
  min-width: 0;
}

.buyer-record-title {
  font-size: 15px;
  font-weight: 590;
  color: #000;
  margin: 0 0 2px;
  line-height: 20px;
}

.buyer-record-sub {
  font-size: 12px;
  color: #3c3c4399;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.buyer-record-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f9f9fd;
  border: 0.5px solid #d2d1e4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
