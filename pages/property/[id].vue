<template>
  <div class="property-page mobile-container bg-umu-gradient">
    <div class="property-header">
      <img
        src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
        alt="Property"
        class="property-image"
      />
      <div class="image-counter">1/5</div>
      <div class="image_layover_icons">
        <button class="icon-btn">
          <OPIcon name="leftChevronWhite" class="w-[18px] h-[18px]" />
        </button>
        <div>
          <button class="icon-btn">
            <OPIcon name="wishlist" class="w-[20px] h-[20px]" />
          </button>
          <button class="icon-btn">
            <OPIcon name="share" class="w-[20px] h-[20px]" />
          </button>
        </div>
      </div>
    </div>

    <div class="property-content">
      <div class="property-title">
        <h1>12, Maple Road</h1>
        <p class="address">Staines-upon-Thames, TW18 3BA</p>
        <p class="price">
          £250,000 <span class="estimated">Estimated Value</span>
        </p>
      </div>

      <div class="property-badges">
        <span class="badge">Sale</span>
        <span class="badge">Detached</span>
        <span class="badge price-badge">£2,300 sqft</span>
      </div>

      <div class="section">
        <h2>Property Details</h2>
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-icon">🏠</div>
            <div class="detail-info">
              <div class="detail-label">Property type</div>
              <div class="detail-value">Detached</div>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">#</div>
            <div class="detail-info">
              <div class="detail-label">Title number</div>
              <div class="detail-value">WK146253</div>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">📏</div>
            <div class="detail-info">
              <div class="detail-label">Area sqft</div>
              <div class="detail-value">2,100 sqft</div>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">⚡</div>
            <div class="detail-info">
              <div class="detail-label">EPC Rating</div>
              <div class="detail-value">B+</div>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">🏛️</div>
            <div class="detail-info">
              <div class="detail-label">Tenure</div>
              <div class="detail-value">Leasehold</div>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">📅</div>
            <div class="detail-info">
              <div class="detail-label">Year Built</div>
              <div class="detail-value">2004</div>
            </div>
          </div>
        </div>

        <div class="action-icons">
          <button class="icon-btn">🔗</button>
          <button class="icon-btn">📍</button>
          <button class="icon-btn">⚡</button>
          <button class="icon-btn">👥</button>
          <button class="icon-btn">🏠</button>
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
              <div class="station-name">Denham Railway Station</div>
              <div class="station-distance">📍 0.3 Miles</div>
            </div>
          </div>
          <div class="station-item">
            <div class="station-icon">🚂</div>
            <div class="station-info">
              <div class="station-name">Denham Downs Railway Station</div>
              <div class="station-distance">📍 0.3 Miles</div>
            </div>
          </div>
          <div class="station-item">
            <div class="station-icon">Ⓜ️</div>
            <div class="station-info">
              <div class="station-name">Gerald Station</div>
              <div class="station-distance">📍 1.2 Miles</div>
            </div>
          </div>
          <div class="station-item">
            <div class="station-icon">🚂</div>
            <div class="station-info">
              <div class="station-name">Uxbridge Cross South</div>
              <div class="station-distance">📍 1.3 Miles</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>EPC Rating</h2>
        <div class="epc-chart">
          <div class="epc-header">
            <span>Score</span>
            <span>Energy Rating</span>
            <span>Current</span>
            <span>Potential</span>
          </div>
          <div class="epc-bar epc-a">
            <span>92+</span>
            <div class="bar">A</div>
          </div>
          <div class="epc-bar epc-b">
            <span>81-91</span>
            <div class="bar">B</div>
          </div>
          <div class="epc-bar epc-c current">
            <span>69-80</span>
            <div class="bar">C</div>
            <div class="marker">72</div>
          </div>
          <div class="epc-bar epc-d">
            <span>55-68</span>
            <div class="bar">D</div>
          </div>
          <div class="epc-bar epc-e">
            <span>39-54</span>
            <div class="bar">E</div>
          </div>
          <div class="epc-bar epc-f">
            <span>21-38</span>
            <div class="bar">F</div>
          </div>
          <div class="epc-bar epc-g">
            <span>1-20</span>
            <div class="bar">G</div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="bottom-nav">
      <button class="nav-item">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Explore</span>
      </button>
      <button class="nav-item" @click="navigateToPassport">
        <span class="nav-icon">📋</span>
        <span class="nav-label">Passport</span>
      </button>
      <button class="nav-item">
        <span class="nav-icon">📝</span>
        <span class="nav-label">Register Interest</span>
      </button>
      <button class="nav-item">
        <span class="nav-icon">💬</span>
        <span class="nav-label">Chat</span>
      </button>
    </div> -->

    <!-- <RegisterInterestModal
      v-model="showRegisterInterest"
      address="12, Maple Road, Staines TW18 3BA"
      @registered="onInterestRegistered"
    /> -->

    <BaseDrawer
      v-model="showRegisterInterest"
      title="Register Interest"
      :showBackButton="true"
      @close="showRegisterInterest = false"
    >
      <RegisterInterestContent
        address="12, Maple Road, Staines TW18 3BA"
        @submit="onInterestRegistered"
      />
    </BaseDrawer>

    <PropertyActionBar
      :actions="[
        { icon: 'accessPassport', label: 'Access Passport' },
        { icon: 'saveProperty', label: 'Save Property' },
        { icon: 'registerInterest', label: 'Register Interest' },
        { icon: 'tapOwner', label: 'Tap Owner' },
      ]"
      @action="handleAction"
    />
  </div>
</template>

<script setup>
import PropertyActionBar from '@/components/property/PropertyActionBar.vue'
import RegisterInterestContent from '~/components/property/RegisterInterestContent.vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'

const route = useRoute()
const router = useRouter()

const showRegisterInterest = ref(false)
const onInterestRegistered = (level) => {
  console.log('Interest registered:', level)
}
const handleAction = (label) => {
  if (label === 'Access Passport') {
    router.push(`/passport/${route.params.id}`)
  }

  if (label === 'Save Property') {
    console.log('Saving property...')
  }

  if (label === 'Register Interest') {
    showRegisterInterest.value = true
  }

  if (label === 'Tap Owner') {
    router.push(`/owner/${route.params.id}`)
  }
}
// const navigateToPassport = () => {
//   router.push(`/passport/${route.params.id}`)
// }
</script>

<style scoped>
.property-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.property-header {
  position: relative;
  width: 100%;
  height: 300px;
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-counter {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
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

.image_layover_icons .icon-btn:hover {
  background: #00000054;
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
  margin: 0 0 4px 0;
  color: #1a1a1a;
}

.address {
  color: #666;
  font-size: 14px;
  margin: 0 0 8px 0;
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
}

.badge {
  background: #00b8a9;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.price-badge {
  background: #00b8a9;
}

.section {
  margin: 32px 0;
}

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

.detail-icon {
  font-size: 24px;
  color: #00b8a9;
}

.detail-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.action-icons {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
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

.icon-btn:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.floor-plan {
  position: relative;
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  height: 200px;
}

.floor-plan-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

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
  position: relative;
}

.map-pin {
  font-size: 48px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
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

.station-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.station-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
}

.station-icon {
  font-size: 24px;
}

.station-name {
  font-size: 15px;
  font-weight: 600;
  color: #00b8a9;
  margin-bottom: 4px;
}

.station-distance {
  font-size: 12px;
  color: #666;
}

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

.epc-bar span:first-child {
  font-size: 12px;
  color: #666;
}

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

.epc-a .bar {
  background: #00a758;
  width: 95%;
}
.epc-b .bar {
  background: #4db848;
  width: 85%;
}
.epc-c .bar {
  background: #b8c832;
  width: 75%;
}
.epc-d .bar {
  background: #ffd732;
  width: 65%;
}
.epc-e .bar {
  background: #ffa632;
  width: 55%;
}
.epc-f .bar {
  background: #ff7832;
  width: 45%;
}
.epc-g .bar {
  background: #ff3232;
  width: 35%;
}

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

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 20px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-width: inherit;
  margin: auto;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.nav-item:hover {
  transform: scale(1.1);
}

.nav-icon {
  font-size: 24px;
}

.nav-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}
</style>
