<template>
  <div class="shared-page mobile-container min-h-screen">
    <!-- Loading -->
    <div v-if="loading" class="shared-loading">
      <div class="shared-spinner" />
      <p>Loading shared passport…</p>
    </div>

    <!-- Expired / Error -->
    <div v-else-if="error" class="shared-error">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="1.5"/>
        <path d="M12 8v4M12 16h.01" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <h2>Link Unavailable</h2>
      <p>{{ error }}</p>
      <button class="shared-home-btn" @click="router.push('/')">Go to Home</button>
    </div>

    <!-- Content -->
    <template v-else-if="data">
      <!-- Hero -->
      <div class="shared-hero">
        <img
          v-if="heroImage"
          :src="heroImage"
          class="shared-hero-img"
          alt="Property"
        />
        <div v-else class="shared-hero-placeholder">
          <svg width="48" height="40" viewBox="0 0 24 20" fill="none">
            <path d="M1 7L12 1l11 6v13H1V7z" stroke="#00a19a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <!-- Top bar -->
        <div class="shared-topbar">
          <div class="shared-badge">
            <img src="/op-icons/passportview/umu-passport.png" alt="Passport" class="shared-badge-img" />
          </div>
          <span class="shared-label">Shared View</span>
        </div>
      </div>

      <!-- Card -->
      <div class="shared-card">
        <!-- Address -->
        <div class="shared-title-block">
          <h1 class="shared-address">{{ data.passport.addressLine1 }}</h1>
          <p class="shared-city">{{ cityLine }}</p>
          <p class="shared-price" v-if="data.property?.estimatedPrice">
            {{ formatPrice(data.property.estimatedPrice) }}
            <span class="shared-estimated">Estimated Value</span>
          </p>
        </div>

        <!-- Badges -->
        <div class="shared-badges" v-if="data.property">
          <span v-if="data.property.bedrooms" class="shared-badge-pill">{{ data.property.bedrooms }} bed</span>
          <span v-if="data.property.bathrooms" class="shared-badge-pill">{{ data.property.bathrooms }} bath</span>
          <span v-if="data.property.propertyType" class="shared-badge-pill">{{ data.property.propertyType }}</span>
          <span v-if="data.property.sqft" class="shared-badge-pill">{{ data.property.sqft.toLocaleString() }} sqft</span>
        </div>

        <!-- CTA -->
        <div class="shared-cta">
          <p class="shared-cta-text">Want full access to this passport, including all legal records and documents?</p>
          <button class="shared-cta-btn" @click="router.push('/auth/login')">
            Sign in to Access Full Passport
          </button>
        </div>

        <!-- Sections preview -->
        <div class="shared-section">
          <h2 class="shared-section-title">Passport Sections</h2>
          <p class="shared-section-sub">This passport contains the following information sections.</p>
          <div class="shared-sections-list">
            <div v-for="section in data.sections" :key="section.id" class="shared-section-row">
              <div class="shared-section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11l3 3L22 4" stroke="#00a19a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#00a19a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="shared-section-info">
                <p class="shared-section-name">{{ section.title }}</p>
                <p class="shared-section-desc">{{ section.subtitle || section.description || 'View details' }}</p>
              </div>
              <span class="shared-lock">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#bbb" stroke-width="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="#bbb" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </span>
            </div>
          </div>
        </div>

        <!-- Footer note -->
        <p class="shared-footer-note">
          This link expires {{ expiresLabel }}. Shared via OpenProperty.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({ auth: false })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const token = route.params.token as string

const data = ref<any>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    data.value = await $fetch(
      `${config.public.apiBase}/passport/shared/${token}`,
    )
  } catch (e: any) {
    error.value = e?.data?.message || 'This link has expired or is no longer valid.'
  } finally {
    loading.value = false
  }
})

const heroImage = computed(() => {
  const imgs = data.value?.property?.images as string[] | null
  if (imgs?.length) return imgs[0]
  return data.value?.property?.imageUrl || null
})

const cityLine = computed(() => {
  const p = data.value?.property
  if (!p) return data.value?.passport?.postcode || ''
  return [p.city || p.county, p.postcode].filter(Boolean).join(', ')
})

const expiresLabel = computed(() => {
  if (!data.value?.expiresAt) return 'soon'
  return new Date(data.value.expiresAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

function formatPrice(price: number) {
  return '£' + price.toLocaleString('en-GB')
}
</script>

<style scoped>
.shared-page {
  background: #f2f6f6;
  padding-bottom: 40px;
}

.shared-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: #666;
  font-size: 15px;
}

.shared-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.shared-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  padding: 24px;
  text-align: center;
}

.shared-error h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.shared-error p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.shared-home-btn {
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

/* Hero */
.shared-hero {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
}

.shared-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.shared-hero-placeholder {
  width: 100%;
  height: 100%;
  background: #e6e8e7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shared-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.shared-badge {
  width: 40px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.shared-badge-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.shared-label {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
}

/* Card */
.shared-card {
  background: white;
  padding: 24px 16px 0;
}

.shared-title-block {
  margin-bottom: 14px;
}

.shared-address {
  font-size: 17px;
  font-weight: 590;
  color: #000;
  margin: 0 0 2px;
}

.shared-city {
  font-size: 15px;
  color: #3c3c4399;
  margin: 0 0 4px;
}

.shared-price {
  font-size: 16px;
  color: #00a19a;
  font-weight: 400;
  margin: 0;
}

.shared-estimated {
  font-size: 11px;
  color: #999;
  margin-left: 5px;
}

.shared-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.shared-badge-pill {
  background: #00a19a;
  color: white;
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 4px;
}

/* CTA */
.shared-cta {
  background: #e6f9f7;
  border: 1.5px solid #b2e4e1;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 24px;
}

.shared-cta-text {
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 12px;
  line-height: 1.5;
}

.shared-cta-btn {
  width: 100%;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 13px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* Sections */
.shared-section {
  margin-bottom: 24px;
}

.shared-section-title {
  font-size: 17px;
  font-weight: 590;
  color: #000;
  margin: 0 0 4px;
}

.shared-section-sub {
  font-size: 13px;
  color: #3c3c4399;
  margin: 0 0 12px;
}

.shared-sections-list {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.shared-section-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.shared-section-row:last-child {
  border-bottom: none;
}

.shared-section-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e6f9f7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.shared-section-info {
  flex: 1;
  min-width: 0;
}

.shared-section-name {
  font-size: 14px;
  font-weight: 590;
  color: #1a1a1a;
  margin: 0 0 2px;
}

.shared-section-desc {
  font-size: 12px;
  color: #999;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shared-lock {
  flex-shrink: 0;
}

.shared-footer-note {
  font-size: 11px;
  color: #bbb;
  text-align: center;
  padding: 20px 0 40px;
  margin: 0;
}
</style>
