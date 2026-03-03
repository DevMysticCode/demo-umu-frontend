<template>
  <div class="property-page mobile-container bg-umu-gradient">
    <!-- Loading State -->
    <div v-if="pageLoading" class="property-loading">
      <div class="property-loading__spinner" />
      <p>Loading property...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="property-error">
      <p>{{ loadError }}</p>
      <button class="btn-back" @click="goBack">Go Back</button>
    </div>

    <!-- Property Content -->
    <template v-else-if="property">
      <div class="property-header">
        <ImageSlider :images="propertyImages" />
        <div class="image_layover_icons">
          <button class="icon-btn" @click="goBack">
            <OPIcon name="leftChevronWhite" class="w-[18px] h-[18px]" />
          </button>
          <div>
            <button class="icon-btn" @click="handleWishlist">
              <OPIcon name="wishlist" class="w-[20px] h-[20px]" />
            </button>
            <button class="icon-btn" @click="showShare = true">
              <OPIcon name="share" class="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>
      </div>

      <div class="property-content">
        <div class="property-title">
          <h1>{{ property.addressLine1 }}</h1>
          <p class="address">
            {{ [property.city, property.county].filter(Boolean).join(', ') }},
            {{ property.postcode }}
          </p>
          <p class="price">
            {{ formatPrice(property.estimatedPrice) }}
            <span class="estimated">Estimated Value</span>
          </p>
        </div>

        <div class="property-badges">
          <span class="badge">{{ property.tenure ?? 'Freehold' }}</span>
          <span class="badge">{{ property.propertyType ?? 'Residential' }}</span>
          <span
            v-if="property.estimatedPrice && property.sqft"
            class="badge price-badge"
          >
            £{{ Math.round(property.estimatedPrice / property.sqft).toLocaleString() }} /sqft
          </span>
        </div>

        <div class="section">
          <h2>Property Details</h2>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-icon">🏠</div>
              <div class="detail-info">
                <div class="detail-label">Property type</div>
                <div class="detail-value">{{ property.propertyType ?? '—' }}</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">#</div>
              <div class="detail-info">
                <div class="detail-label">Title number</div>
                <div class="detail-value">{{ property.titleNumber ?? '—' }}</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">📏</div>
              <div class="detail-info">
                <div class="detail-label">Area sqft</div>
                <div class="detail-value">
                  {{
                    property.sqft
                      ? `${property.sqft.toLocaleString()} sqft`
                      : '—'
                  }}
                </div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">⚡</div>
              <div class="detail-info">
                <div class="detail-label">EPC Rating</div>
                <div class="detail-value">{{ property.epcRating ?? '—' }}</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">🏛️</div>
              <div class="detail-info">
                <div class="detail-label">Tenure</div>
                <div class="detail-value">{{ property.tenure ?? '—' }}</div>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">📅</div>
              <div class="detail-info">
                <div class="detail-label">Year Built</div>
                <div class="detail-value">{{ property.yearBuilt ?? '—' }}</div>
              </div>
            </div>
            <div v-if="property.bedrooms" class="detail-item">
              <div class="detail-icon">🛏</div>
              <div class="detail-info">
                <div class="detail-label">Bedrooms</div>
                <div class="detail-value">{{ property.bedrooms }}</div>
              </div>
            </div>
            <div v-if="property.bathrooms" class="detail-item">
              <div class="detail-icon">🚿</div>
              <div class="detail-info">
                <div class="detail-label">Bathrooms</div>
                <div class="detail-value">{{ property.bathrooms }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Floor Plan</h2>
          <div class="floor-plan">
            <img
              src="https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="Floor Plan"
              class="floor-plan-img"
            />
            <button class="view-360-btn">360°</button>
          </div>
        </div>

        <div class="section">
          <h2>Location and Nearby</h2>
          <div class="map-container">
            <div class="map-placeholder">
              <div class="map-pin">📍</div>
            </div>
            <button class="street-view-btn">Open Street View</button>
          </div>

          <div class="nearby-section">
            <button class="nearby-btn active">🚂 Train Stations</button>
            <button class="nearby-btn">🏪</button>
            <button class="nearby-btn">🏫</button>
            <button class="nearby-btn">🚌</button>
          </div>

          <div class="station-list">
            <div class="station-item">
              <div class="station-icon">🚂</div>
              <div class="station-info">
                <div class="station-name">Local Railway Station</div>
                <div class="station-distance">📍 0.5 Miles</div>
              </div>
            </div>
            <div class="station-item">
              <div class="station-icon">🚂</div>
              <div class="station-info">
                <div class="station-name">Town Centre Station</div>
                <div class="station-distance">📍 1.1 Miles</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="property.epcRating" class="section">
          <h2>EPC Rating</h2>
          <div class="epc-chart">
            <div class="epc-header">
              <span>Score</span>
              <span>Energy Rating</span>
              <span>Current</span>
              <span>Potential</span>
            </div>
            <div
              v-for="band in epcBands"
              :key="band.label"
              class="epc-bar"
              :class="[
                `epc-${band.label.toLowerCase()}`,
                { current: band.label === property.epcRating },
              ]"
            >
              <span>{{ band.range }}</span>
              <div class="bar">{{ band.label }}</div>
              <div
                v-if="band.label === property.epcRating"
                class="marker"
              >
                {{ band.score }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Drawers -->
    <BaseDrawer
      v-model="showRegisterInterest"
      title="Register Interest"
      :showBackButton="true"
      @close="showRegisterInterest = false"
    >
      <RegisterInterestContent
        :address="`${property?.addressLine1}, ${property?.postcode}`"
        @submit="onInterestRegistered"
      />
    </BaseDrawer>

    <BaseDrawer
      v-model="showShare"
      title="Share Property"
      :showBackButton="true"
      @close="showShare = false"
    >
      <ShareContent
        :property-title="property?.addressLine1 ?? ''"
        :property-address="`${property?.city ?? ''}, ${property?.postcode ?? ''}`"
        :property-price="formatPrice(property?.estimatedPrice)"
        :property-image="propertyImages[0]"
        @share="handleShare"
      />
    </BaseDrawer>

    <Toast
      :is-visible="toastState.isVisible"
      :message="toastState.message"
      :icon="toastState.icon"
      :icon-emoji="toastState.iconEmoji"
      :duration="toastState.duration"
      @close="hideToast"
    />

    <PropertyActionBar
      v-if="property && !pageLoading"
      :actions="actionBarItems"
      @action="handleAction"
    />
  </div>
</template>

<script setup lang="ts">
import PropertyActionBar from '@/components/property/PropertyActionBar.vue'
import RegisterInterestContent from '~/components/property/RegisterInterestContent.vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import ImageSlider from '~/components/ui/ImageSlider.vue'
import Toast from '~/components/ui/Toast.vue'
import ShareContent from '~/components/property/ShareContent.vue'
import { useToast } from '~/composables/useToast'
import { usePropertySearch } from '~/composables/usePropertySearch'
import { usePassportClaim } from '~/composables/usePassportClaim'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const propertyId = route.params.id as string

const { getPropertyDetails, formatPrice } = usePropertySearch()
const { getPassportStatus } = usePassportClaim()
const { toastState, showToast, hideToast } = useToast()

const property = ref<any>(null)
const passportStatus = ref<{
  hasPassport: boolean
  passportId: string | null
  isOwner: boolean
  isCollaborator: boolean
  canAccess?: boolean
} | null>(null)
const pageLoading = ref(true)
const loadError = ref('')
const showRegisterInterest = ref(false)
const showShare = ref(false)

const FALLBACK_IMAGES = [
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2249531/pexels-photo-2249531.jpeg?auto=compress&cs=tinysrgb&w=800',
]

const propertyImages = computed(() => {
  const main =
    property.value?.imageUrl ||
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
  return [main, ...FALLBACK_IMAGES]
})

const actionBarItems = computed(() => {
  const canAccess =
    passportStatus.value?.hasPassport && passportStatus.value?.canAccess
  return [
    {
      icon: 'accessPassport',
      label: canAccess ? 'Access Passport' : 'Claim Passport',
    },
    { icon: 'saveProperty', label: 'Save Property' },
    { icon: 'registerInterest', label: 'Register Interest' },
    { icon: 'tapOwner', label: 'Tap Owner' },
  ]
})

const epcBands = [
  { label: 'A', range: '92+', score: 95 },
  { label: 'B', range: '81-91', score: 86 },
  { label: 'C', range: '69-80', score: 74 },
  { label: 'D', range: '55-68', score: 62 },
  { label: 'E', range: '39-54', score: 46 },
  { label: 'F', range: '21-38', score: 30 },
  { label: 'G', range: '1-20', score: 10 },
]

onMounted(async () => {
  try {
    const [propData, statusData] = await Promise.all([
      getPropertyDetails(propertyId),
      getPassportStatus(propertyId),
    ])
    if (!propData) {
      loadError.value = 'Property not found.'
    } else {
      property.value = propData
    }
    passportStatus.value = statusData
  } catch (err) {
    loadError.value = 'Failed to load property details.'
    console.error(err)
  } finally {
    pageLoading.value = false
  }
})

function handleAction(label: string) {
  if (label === 'Claim Passport') {
    router.push(`/passport/${propertyId}`)
  } else if (label === 'Access Passport') {
    if (passportStatus.value?.passportId) {
      router.push(`/passportview/${passportStatus.value.passportId}`)
    }
  } else if (label === 'Save Property') {
    handleSaveProperty()
  } else if (label === 'Register Interest') {
    showRegisterInterest.value = true
  } else if (label === 'Tap Owner') {
    router.push(`/owner/${propertyId}`)
  }
}

function goBack() { router.back() }

function handleWishlist() {
  showToast({
    message: 'Property added to your wishlist',
    icon: propertyImages.value[0],
    duration: 2000,
  })
}

function handleSaveProperty() {
  showToast({
    message: 'Property saved to your collections',
    icon: propertyImages.value[0],
    duration: 2000,
  })
}

function onInterestRegistered() {
  showRegisterInterest.value = false
  showToast({ message: 'Interest registered!', duration: 2000 })
}

function handleShare() {
  console.log('Share triggered')
}
</script>

<style scoped>
.property-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.property-loading,
.property-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: #666;
  font-size: 15px;
}

.property-loading__spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #00b8a9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-back {
  background: #00b8a9;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
}

.property-header {
  position: relative;
  width: 100%;
  height: 300px;
}

.image_layover_icons {
  position: absolute;
  top: 16px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
}

.image_layover_icons div {
  display: flex;
  gap: 12px;
}

.image_layover_icons .icon-btn {
  background: #00000080;
  border: #00000080;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.property-content {
  padding: 20px;
  background: white;
  margin-top: -20px;
  border-radius: 24px 24px 0 0;
}

.property-title h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a1a1a;
}

.address {
  color: #666;
  font-size: 14px;
  margin: 0 0 8px;
}

.price {
  font-size: 22px;
  font-weight: 700;
  color: #00b8a9;
  margin: 8px 0;
}

.estimated {
  font-size: 12px;
  font-weight: 400;
  color: #999;
}

.property-badges {
  display: flex;
  gap: 8px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.badge {
  background: #00b8a9;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.price-badge { background: #00b8a9; }

.section { margin: 32px 0; }

.section h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.detail-icon { font-size: 24px; color: #00b8a9; }
.detail-label { font-size: 12px; color: #999; margin-bottom: 4px; }
.detail-value { font-size: 15px; font-weight: 600; color: #1a1a1a; }

.floor-plan {
  position: relative;
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  height: 200px;
}

.floor-plan-img { width: 100%; height: 100%; object-fit: cover; }

.view-360-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 20px;
  cursor: pointer;
}

.map-container {
  position: relative;
  margin-bottom: 16px;
}

.map-placeholder {
  height: 200px;
  background: linear-gradient(to bottom, #e8f5e9, #f1f8e9);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-pin {
  font-size: 48px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.street-view-btn {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: #00b8a9;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 184, 169, 0.3);
}

.nearby-section {
  display: flex;
  gap: 12px;
  margin: 16px 0;
}

.nearby-btn {
  padding: 10px 20px;
  border-radius: 24px;
  border: 1px solid #e0e0e0;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.nearby-btn.active {
  background: #00b8a9;
  color: white;
  border-color: #00b8a9;
}

.station-list { display: flex; flex-direction: column; gap: 12px; }

.station-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
}

.station-icon { font-size: 24px; }

.station-name {
  font-size: 15px;
  font-weight: 600;
  color: #00b8a9;
  margin-bottom: 4px;
}

.station-distance { font-size: 12px; color: #666; }

.epc-chart {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.epc-header {
  display: grid;
  grid-template-columns: 60px 1fr 60px 60px;
  gap: 8px;
  font-size: 11px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 600;
}

.epc-bar {
  display: grid;
  grid-template-columns: 60px 1fr 60px 60px;
  gap: 8px;
  margin-bottom: 4px;
  align-items: center;
  position: relative;
}

.epc-bar span:first-child { font-size: 12px; color: #666; }

.epc-bar .bar {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  border-radius: 4px;
  font-weight: 700;
  color: white;
  font-size: 14px;
}

.epc-a .bar { background: #00a758; width: 95%; }
.epc-b .bar { background: #4db848; width: 85%; }
.epc-c .bar { background: #b8c832; width: 75%; }
.epc-d .bar { background: #ffd732; width: 65%; }
.epc-e .bar { background: #ffa632; width: 55%; }
.epc-f .bar { background: #ff7832; width: 45%; }
.epc-g .bar { background: #ff3232; width: 35%; }

.epc-bar.current .marker {
  position: absolute;
  right: 80px;
  background: #00b8a9;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
