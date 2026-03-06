<template>
  <div class="prop-page mobile-container min-h-screen bg-umu-gradient">
    <!-- Loading -->
    <div v-if="pageLoading" class="prop-loading">
      <div class="prop-spinner" />
      <p>Loading property...</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="prop-loading">
      <p>{{ loadError }}</p>
      <button class="btn-back" @click="goBack">Go Back</button>
    </div>

    <!-- Content -->
    <template v-else-if="property">
      <!-- Hero image -->
      <div class="prop-hero">
        <ImageSlider :images="propertyImages" />
        <div class="hero-top">
          <button class="hero-btn" @click="goBack">
            <OPIcon name="leftChevronWhite" class="w-[16px] h-[16px]" />
          </button>
          <div class="flex gap-3">
            <button class="hero-btn" @click="handleWishlist">
              <OPIcon name="wishlist" class="w-[18px] h-[18px]" />
            </button>
            <button class="hero-btn" @click="showShare = true">
              <OPIcon name="share" class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <!-- White content card -->
      <div class="prop-card">
        <!-- Address / Price -->
        <div class="prop-title-block">
          <h1 class="prop-address">{{ property.addressLine1 }}</h1>
          <p class="prop-city">
            {{ [property.city, property.county].filter(Boolean).join(', ') }},
            {{ property.postcode }}
          </p>
          <p class="prop-price">
            {{ formatPrice(property.estimatedPrice) }}
            <span class="prop-estimated">Estimated Value</span>
          </p>
        </div>

        <!-- Badges -->
        <div class="prop-badges">
          <span v-if="property.bedrooms" class="prop-badge">
            <OPIcon name="bedroomWhite" class="w-[13px] h-[13px]" />
            {{ property.bedrooms }}
          </span>
          <span v-if="property.bathrooms" class="prop-badge">
            <OPIcon name="bathroomWhite" class="w-[13px] h-[13px]" />
            {{ property.bathrooms }}
          </span>
          <span v-if="property.propertyType" class="prop-badge">{{
            property.propertyType
          }}</span>
          <span v-if="property.sqft" class="prop-badge">
            <OPIcon name="sqftWhite" class="w-[13px] h-[13px]" />
            {{ property.sqft.toLocaleString() }} sqft
          </span>
        </div>

        <!-- Score toggle -->
        <div class="prop-section">
          <div class="score-tabs">
            <button
              :class="['score-tab', { active: scoreTab === 'home' }]"
              @click="scoreTab = 'home'"
            >
              Home Score
            </button>
            <button
              :class="['score-tab', { active: scoreTab === 'move' }]"
              @click="scoreTab = 'move'"
            >
              Move Ready Score
            </button>
          </div>
        </div>

        <!-- Score gauge -->
        <div class="prop-score-block">
          <svg
            viewBox="0 0 200 200"
            width="180"
            height="180"
            class="prop-gauge-svg"
          >
            <!-- Track -->
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#d6f5f3"
              stroke-width="16"
              stroke-dasharray="502.65"
              stroke-dashoffset="125.66"
              stroke-linecap="round"
              transform="rotate(135 100 100)"
            />
            <!-- Progress (74%) -->
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#00a19a"
              stroke-width="16"
              :stroke-dasharray="`${502.65 * 0.74 * 0.75} ${502.65}`"
              stroke-linecap="round"
              transform="rotate(135 100 100)"
            />
            <!-- Score text -->
            <text
              x="100"
              y="94"
              text-anchor="middle"
              font-size="42"
              font-weight="700"
              fill="#00a19a"
              font-family="sans-serif"
            >
              74
            </text>
            <text
              x="100"
              y="116"
              text-anchor="middle"
              font-size="14"
              fill="#999"
              font-family="sans-serif"
            >
              Good
            </text>
          </svg>
          <!-- <div class="prop-score-ticks">
            <span class="prop-tick-label" style="left: 0">0</span>
            <span class="prop-tick-label" style="right: 0">100</span>
          </div> -->
          <div class="prop-score-avg-pill">
            Street Average: 82 &nbsp;|&nbsp; Postcode Average: 72
          </div>
          <p class="prop-score-note">
            <OPIcon
              name="infoCircle"
              class="w-[13px] h-[13px]"
              style="display: inline; vertical-align: -2px; margin-right: 4px"
            />
            Based on verified property data and partial Passport completion.
          </p>
        </div>

        <!-- Property Details -->
        <div class="prop-section">
          <h2 class="prop-section-title">Property Details</h2>
          <div class="prop-details-card bg-white rounded-lg">
            <div class="prop-details-grid">
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="house" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Property type</p>
                  <p class="prop-detail-value">
                    {{ property.propertyType ?? '—' }}
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="titleNumber" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Title number</p>
                  <p class="prop-detail-value">
                    {{ property.titleNumber ?? '—' }}
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="sqft" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Area sqft</p>
                  <p class="prop-detail-value">
                    {{
                      property.sqft
                        ? `${property.sqft.toLocaleString()} sqft`
                        : '—'
                    }}
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="epcRating" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">EPC Rating</p>
                  <p class="prop-detail-value">
                    {{ property.epcRating ?? '—' }}
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="tenure" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Tenure</p>
                  <p class="prop-detail-value">{{ property.tenure ?? '—' }}</p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="yearBuilt" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Year Built</p>
                  <p class="prop-detail-value">
                    {{ property.yearBuilt ?? '—' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick action icons -->
          <div class="prop-quick-actions">
            <button class="prop-quick-btn">
              <OPIcon name="share" class="w-[18px] h-[18px]" />
            </button>
            <button class="prop-quick-btn">
              <OPIcon name="pin" class="w-[18px] h-[18px]" />
            </button>
            <button class="prop-quick-btn">
              <OPIcon name="goodEnergy" class="w-[18px] h-[18px]" />
            </button>
            <button class="prop-quick-btn">
              <OPIcon name="publicTransport" class="w-[18px] h-[18px]" />
            </button>
            <button class="prop-quick-btn">
              <OPIcon name="closeToSchool" class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        <!-- Floor Plan -->
        <div class="prop-section">
          <h2 class="prop-section-title">Floor Plan</h2>
          <div class="prop-floor-card">
            <img
              src="/op-icons/property/floorPlan.png"
              alt="Floor Plan"
              class="prop-floor-img"
            />
            <button class="prop-floor-expand">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path
                  d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                  stroke="#333"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Location and Nearby -->
        <div class="prop-section">
          <h2 class="prop-section-title">Location and Nearby</h2>
          <div class="prop-map-wrap">
            <div ref="mapEl" class="prop-map" />
            <button class="prop-street-btn">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                width="14"
                height="14"
                style="display: inline; margin-right: 6px; vertical-align: -2px"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
              Open Street View
            </button>
          </div>

          <!-- Nearby tabs (active tab = full button, others = icon circles) -->
          <div class="prop-nearby-tabs">
            <template v-for="tab in nearbyTabOptions" :key="tab.value">
              <button
                v-if="nearbyTab === tab.value"
                class="prop-nearby-full active"
                @click="nearbyTab = tab.value"
              >
                <OPIcon :name="tab.icon" class="w-[15px] h-[15px]" />
                {{ tab.label }}
              </button>
              <button
                v-else
                class="prop-nearby-icon"
                @click="nearbyTab = tab.value"
              >
                <OPIcon :name="tab.icon" class="w-[18px] h-[18px]" />
              </button>
            </template>
          </div>

          <!-- Content for active nearby tab -->
          <div class="prop-station-list">
            <div
              v-for="s in nearbyTabOptions.find((t) => t.value === nearbyTab)
                ?.items ?? []"
              :key="s.name"
              class="prop-station-row"
            >
              <div class="prop-station-icon">
                <OPIcon
                  :name="
                    nearbyTabOptions.find((t) => t.value === nearbyTab)?.icon ??
                    'publicTransport'
                  "
                  class="w-[18px] h-[18px]"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="prop-station-name">{{ s.name }}</p>
                <p class="prop-station-dist">
                  <OPIcon
                    name="pin"
                    class="w-[11px] h-[11px]"
                    style="
                      display: inline;
                      vertical-align: -1px;
                      margin-right: 3px;
                    "
                  />
                  {{ s.distance }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- EPC Rating -->
        <div v-if="property.epcRating" class="prop-section">
          <h2 class="prop-section-title">EPC Rating</h2>
          <div class="prop-epc-card">
            <div class="prop-epc-header">
              <span>Score</span>
              <span>Energy Rating</span>
              <span>Current</span>
              <span>Potential</span>
            </div>
            <div
              v-for="band in epcBands"
              :key="band.label"
              class="prop-epc-row"
              :class="{ 'epc-current': band.label === property.epcRating }"
            >
              <span class="prop-epc-range">{{ band.range }}</span>
              <div class="prop-epc-bar-wrap">
                <div
                  class="prop-epc-bar"
                  :style="{ width: band.width, background: band.color }"
                >
                  {{ band.label }}
                </div>
              </div>
              <div class="prop-epc-dot-wrap">
                <div
                  v-if="band.label === property.epcRating"
                  class="prop-epc-dot current"
                />
                <div v-else class="prop-epc-dot" />
              </div>
              <div class="prop-epc-dot-wrap">
                <div
                  v-if="band.label === potentialEpc"
                  class="prop-epc-dot potential"
                />
                <div v-else class="prop-epc-dot" />
              </div>
            </div>
          </div>
        </div>

        <div class="prop-bottom-pad" />
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
import { ref, computed, onMounted, nextTick } from 'vue'
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
const passportStatus = ref<any>(null)
const pageLoading = ref(true)
const loadError = ref('')
const showRegisterInterest = ref(false)
const showShare = ref(false)
const scoreTab = ref('home')
const nearbyTab = ref('train')
const mapEl = ref<HTMLElement | null>(null)

const nearbyTabOptions = [
  {
    value: 'train',
    label: 'Train Stations',
    icon: 'publicTransport',
    items: [
      { name: 'Denham Railway Station', distance: '0.3 Miles' },
      { name: 'Denham Downs Railway Station', distance: '0.3 Miles' },
      { name: 'Gerald Station', distance: '1.2 Miles' },
      { name: 'Uxbridge Cross South', distance: '1.3 Miles' },
    ],
  },
  {
    value: 'school',
    label: 'Schools',
    icon: 'closeToSchool',
    items: [
      { name: 'Denham Village Primary School', distance: '0.4 Miles' },
      { name: 'Tatling End Primary School', distance: '0.8 Miles' },
    ],
  },
  {
    value: 'energy',
    label: 'Energy',
    icon: 'goodEnergy',
    items: [
      { name: 'EDF Energy Substation', distance: '0.6 Miles' },
      { name: 'Solar Farm Colne Valley', distance: '1.1 Miles' },
    ],
  },
  {
    value: 'park',
    label: 'Parks',
    icon: 'closeToPublicPark',
    items: [
      { name: 'Denham Country Park', distance: '0.5 Miles' },
      { name: 'Colne Valley Regional Park', distance: '0.9 Miles' },
    ],
  },
]

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

const potentialEpc = computed(() => {
  const bands = ['G', 'F', 'E', 'D', 'C', 'B', 'A']
  const idx = bands.indexOf(property.value?.epcRating ?? 'D')
  return bands[Math.min(idx + 1, bands.length - 1)]
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
  { label: 'A', range: '92+', color: '#00a758', width: '95%' },
  { label: 'B', range: '81-91', color: '#4db848', width: '85%' },
  { label: 'C', range: '69-80', color: '#b8c832', width: '75%' },
  { label: 'D', range: '55-68', color: '#ffd732', width: '65%' },
  { label: 'E', range: '39-54', color: '#ffa632', width: '55%' },
  { label: 'F', range: '21-38', color: '#ff7832', width: '45%' },
  { label: 'G', range: '1-20', color: '#ff3232', width: '35%' },
]

// Leaflet map
const loadLeaflet = (): Promise<any> =>
  new Promise((resolve) => {
    if ((window as any).L) return resolve((window as any).L)
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve((window as any).L)
    document.head.appendChild(script)
  })

const initMap = async () => {
  if (!mapEl.value || !property.value) return
  const lat = property.value.latitude
  const lng = property.value.longitude
  if (!lat || !lng) return

  const L = await loadLeaflet()
  const map = L.map(mapEl.value, {
    zoomControl: false,
    scrollWheelZoom: false,
  }).setView([lat, lng], 15)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  const icon = L.divIcon({
    className: '',
    html: `<div style="width:40px;height:40px;border-radius:50%;background:#00a19a;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,161,154,0.5);border:3px solid white;">
      <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" stroke-width="2" fill="rgba(255,255,255,0.2)"/>
        <path d="M9 22V12h6v10" stroke="white" stroke-width="2"/>
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
  L.marker([lat, lng], { icon }).addTo(map)
}

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
    await nextTick()
    initMap()
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

function goBack() {
  router.back()
}

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
.prop-page {
  min-height: 100vh;
  /* background: #f2f6f6; */
  padding-bottom: 90px;
}

/* ── Loading ─────────────────────────────────────────────────────────────── */
.prop-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: #666;
  font-size: 15px;
}

.prop-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-back {
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
}

/* ── Hero ────────────────────────────────────────────────────────────────── */
.prop-hero {
  position: relative;
  width: 100%;
  height: 280px;
}

.hero-top {
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

/* ── Card ────────────────────────────────────────────────────────────────── */
.prop-card {
  /* background: white; */
  position: relative;
  padding: 30px 16px 0;
}

/* ── Title ───────────────────────────────────────────────────────────────── */
.prop-title-block {
  margin-bottom: 14px;
}

.prop-address {
  color: #000000;
  font-weight: 590;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  vertical-align: middle;
}

.prop-city {
  color: #3c3c4399;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  vertical-align: middle;
}

.prop-price {
  color: #00a19a;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  vertical-align: middle;
}

.prop-estimated {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin-left: 6px;
}

/* ── Badges ──────────────────────────────────────────────────────────────── */
.prop-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.prop-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #00a19a;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
}

/* ── Section ─────────────────────────────────────────────────────────────── */
.prop-section {
  margin-bottom: 28px;
}

.prop-section-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 14px;
}

/* ── Score tabs ──────────────────────────────────────────────────────────── */
.score-tabs {
  display: flex;
  gap: 8px;
  background-color: #7878801f;
  border-radius: 100px;
  padding: 2px;
}

.score-tab {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  color: #000;
  transition: all 0.2s;
}

.score-tab.active {
  background: white;
  border: 0.5px solid #0000000a;
  box-shadow: 0px 3px 8px 0px #0000001f;
}

/* ── Score gauge ─────────────────────────────────────────────────────────── */
.prop-score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
  position: relative;
}

.prop-gauge-svg {
  display: block;
}

.prop-score-ticks {
  position: relative;
  width: 180px;
  margin-top: -16px;
}

.prop-tick-label {
  position: absolute;
  font-size: 11px;
  color: #aaa;
}

.prop-score-avg-pill {
  background: white;
  border-radius: 100px;
  padding: 8px 18px;
  font-size: 12px;
  color: #00a19a;
  font-weight: 500;
  text-align: center;
  margin: 10px 0 8px;
  border: 1px solid #e8f7f6;
}

.prop-score-note {
  font-size: 11px;
  color: #aaa;
  text-align: center;
  line-height: 1.4;
  max-width: 280px;
}

/* ── Details card ────────────────────────────────────────────────────────── */
.prop-details-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 16px;
}

.prop-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.prop-detail-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.prop-detail-icon-wrap {
  width: 36px;
  height: 36px;
  /* border-radius: 10px; */
  /* background: rgba(0, 161, 154, 0.1); */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prop-detail-label {
  font-size: 11px;
  color: #8e8e93;
  margin: 0 0 3px;
}

.prop-detail-value {
  font-size: 13px;
  font-weight: 600;
  color: #00a19a;
  margin: 0;
}

/* Quick action icons */
.prop-quick-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid #eeeeee;
}

.prop-quick-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e8e8ee;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* ── Floor plan ──────────────────────────────────────────────────────────── */
.prop-floor-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #f0f0f0;
}

.prop-floor-img {
  width: 100%;
  /* height: 220px; */
  object-fit: cover;
  display: block;
}

.prop-floor-expand {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* ── Map ─────────────────────────────────────────────────────────────────── */
.prop-map-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
}

.prop-map {
  height: 200px;
  width: 100%;
}

.prop-street-btn {
  position: absolute;
  bottom: 14px;
  right: 14px;
  background: #00a19a;
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.35);
}

/* ── Nearby tabs ─────────────────────────────────────────────────────────── */
.prop-nearby-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.prop-nearby-full {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border-radius: 24px;
  border: none;
  background: #e8f7f6;
  color: #00a19a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.prop-nearby-full.active {
  background: #00a19a;
  color: white;
}

.prop-nearby-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid #e0e0e0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.prop-nearby-icon.active {
  background: #00a19a;
  border-color: #00a19a;
}

/* ── Station list ────────────────────────────────────────────────────────── */
.prop-station-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prop-station-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f5;
}

.prop-station-row:last-child {
  border-bottom: none;
}

.prop-station-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 161, 154, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prop-station-name {
  font-size: 14px;
  font-weight: 500;
  color: #00a19a;
  margin: 0 0 3px;
}

.prop-station-dist {
  font-size: 12px;
  color: #8e8e93;
  margin: 0;
}

/* ── EPC ─────────────────────────────────────────────────────────────────── */
.prop-epc-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 14px;
}

.prop-epc-header {
  display: grid;
  grid-template-columns: 52px 1fr 40px 40px;
  gap: 4px;
  font-size: 10px;
  color: #8e8e93;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
}

.prop-epc-row {
  display: grid;
  grid-template-columns: 52px 1fr 40px 40px;
  gap: 4px;
  margin-bottom: 4px;
  align-items: center;
}

.prop-epc-range {
  font-size: 11px;
  color: #8e8e93;
}

.prop-epc-bar-wrap {
  display: flex;
  align-items: center;
}

.prop-epc-bar {
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  min-width: 32px;
}

.prop-epc-dot-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.prop-epc-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e0e0e0;
}

.prop-epc-dot.current {
  background: #00a19a;
}
.prop-epc-dot.potential {
  background: #4db848;
}

.epc-current .prop-epc-range {
  font-weight: 700;
  color: #1a1a1a;
}

.prop-bottom-pad {
  height: 20px;
}
</style>
