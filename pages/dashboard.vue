<template>
  <div class="mobile-container min-h-screen bg-umu-gradient">
    <AppHeader title="Explore" :showBack="false" right="profile" />

    <main class="pb-24">
      <!-- Hero -->
      <div class="px-4">
        <HeroSection
          iconName="propertySearch"
          iconClass="w-full h-full"
          heroClass="w-36 h-36"
          mainTitle="Property Search"
          subColored=""
          subTitle="Try searching for Property Passports that are detached"
        />
      </div>

      <!-- Search bar (tap to open drawer) -->
      <div class="px-4 mb-5" @click="showSearchDrawer = true">
        <div
          class="flex items-center bg-white rounded-full border border-gray-200 shadow-sm gap-3 cursor-pointer search-bar"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            class="flex-shrink-0"
          >
            <circle cx="11" cy="11" r="7" stroke="#aaa" stroke-width="2" />
            <path
              d="M16.5 16.5L21 21"
              stroke="#aaa"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span class="flex-1 text-sm text-gray-400"
            >City, area or postcode</span
          >
          <span class="text-brand-aqua text-sm umu_btn">Search</span>
        </div>
      </div>

      <!-- Action cards -->
      <div class="px-4 flex flex-col gap-4 mb-7">
        <!-- Card 1: Find your Homehealth Score -->
        <div
          class="action-card cursor-pointer"
          @click="router.push('/homescore')"
        >
          <!-- Circular gauge -->
          <div class="gauge-wrap">
            <svg viewBox="0 0 100 100" width="100" height="100">
              <!-- Track -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#d6f5f3"
                stroke-width="10"
                stroke-dasharray="251.3"
                stroke-dashoffset="0"
                stroke-linecap="round"
                transform="rotate(-90 50 50)"
              />
              <!-- Progress (85%) -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#00a19a"
                stroke-width="10"
                :stroke-dasharray="`${251.3 * 0.85} ${251.3 * 0.15}`"
                stroke-linecap="round"
                transform="rotate(-90 50 50)"
              />
              <text
                x="50"
                y="47"
                text-anchor="middle"
                font-size="22"
                font-weight="700"
                fill="#00a19a"
                font-family="sans-serif"
              >
                85
              </text>
              <text
                x="50"
                y="61"
                text-anchor="middle"
                font-size="10"
                fill="#999"
                font-family="sans-serif"
              >
                Good
              </text>
            </svg>
          </div>

          <div class="action-card-body">
            <h3 class="action-card-title">Find your Homehealth Score</h3>
            <p class="action-card-sub">
              Find out how much your home is costing you - and how to fix it.
            </p>
            <div class="flex justify-end mt-2">
              <button
                class="action-btn"
                @click.stop="router.push('/homescore')"
              >
                Start Here
              </button>
            </div>
          </div>
        </div>

        <!-- Card 2: Property Passport -->
        <div
          class="action-card cursor-pointer"
          @click="showSearchDrawer = true"
        >
          <!-- Passport thumbnail -->
          <div class="passport-thumb-wrap">
            <div class="passport-thumb-inner">
              <img
                src="/op-icons/passportview/umu-passport.png"
                class="passport-thumb-img"
                alt=""
              />
            </div>
          </div>

          <div class="action-card-body">
            <h3 class="action-card-title">Claim my Property Passport</h3>
            <p class="action-card-sub">
              Stop your sale falling through before it starts.
            </p>
            <div class="flex justify-end mt-2">
              <button class="action-btn">Start Here</button>
            </div>
          </div>
        </div>
      </div>

      <!-- For You Section -->
      <div class="mb-8">
        <div class="px-4 mb-3">
          <h2 class="section-title">For You</h2>
          <p class="section-subtitle">
            Here are some top picks exclusively selected for you based on your
            profile.
          </p>
        </div>

        <!-- Carousel — 88% width per slide, overflow-hidden for peeking -->
        <div
          ref="carouselRef"
          class="relative overflow-hidden"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <div
            class="flex transition-transform duration-300 ease-in-out"
            :style="{
              transform: `translateX(-${currentSlide * slideWidth}px)`,
            }"
          >
            <div
              v-for="(property, index) in recommendedProperties"
              :key="property.id"
              @click="viewProperty(property.id)"
              class="flex-none pl-4 pr-2 pb-2 cursor-pointer"
              :style="{ width: slideWidth + 'px' }"
            >
              <div
                class="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100"
              >
                <!-- Image -->
                <div class="relative h-48 overflow-hidden">
                  <img
                    v-if="property.image"
                    :src="property.image"
                    :alt="property.address"
                    class="w-full h-full object-cover"
                    @error="(e: any) => { e.target.style.display='none'; e.target.nextElementSibling?.style.removeProperty('display') }"
                  />
                  <div
                    :style="property.image ? 'display:none' : ''"
                    class="no-image-placeholder"
                  >
                    <svg width="72" height="56" viewBox="0 0 43 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M33.0496 22.7447V24.4998H29.6886L29.6698 22.8687C29.6698 20.1202 28.4599 18.9834 26.4158 18.9834C24.3716 18.9834 23.1617 20.1202 23.1617 22.8687V26.1985H19.8239V22.7447C19.8239 18.4875 22.2856 16.1318 26.4372 16.1318C30.5888 16.1318 33.0496 18.4875 33.0496 22.7447Z" fill="#00A19A"/>
                      <path d="M16.4704 16.1548C20.622 16.1548 23.0837 18.5104 23.0837 22.7677V26.2214H19.7458V22.8917C19.7458 20.1431 18.5564 19.0064 16.4918 19.0064C14.4476 19.0064 13.2377 20.1431 13.2377 22.8917L13.2249 24.5227H9.86732L9.85876 22.7677C9.85876 18.5104 12.3205 16.1548 16.4721 16.1548H16.4704Z" fill="#00A19A"/>
                      <path d="M24.4625 26.1176C24.4625 24.4712 23.1157 23.1372 21.454 23.1372C19.7923 23.1372 18.4456 24.472 18.4456 26.1176C18.4456 27.0764 18.9042 27.9266 19.6135 28.4716L18.9119 32.8005H23.997L23.2954 28.4716C24.0047 27.9266 24.4625 27.0756 24.4625 26.1176Z" fill="#00A19A"/>
                      <path d="M23.7981 25.997C23.7981 24.7145 22.7482 23.6743 21.4536 23.6743C20.159 23.6743 19.1091 24.7145 19.1091 25.997C19.1091 26.7441 19.4659 27.4066 20.0195 27.8309L19.4728 31.2034H23.4353L22.8885 27.8309C23.4413 27.4058 23.7981 26.7433 23.7981 25.997Z" fill="#00A19A"/>
                      <path d="M42.9371 18.066C42.9345 17.1434 42.179 16.3955 41.2463 16.3955C40.3137 16.3955 39.5556 17.1458 39.5556 18.0709H39.559V25.5082C39.559 28.2567 38.3491 29.3934 36.305 29.3934C34.2608 29.3934 33.0509 28.2567 33.0509 25.5082V24.4986H29.6865V25.6321C29.6865 29.8894 32.1739 32.245 36.3255 32.245C40.4771 32.245 42.938 29.8894 42.938 25.6321L42.9371 18.066Z" fill="#00A19A"/>
                      <path d="M0.00171036 18.066C0.0042773 17.1434 0.759816 16.3955 1.69247 16.3955C2.62599 16.3955 3.38323 17.1458 3.38323 18.0709H3.37981V25.5082C3.37981 28.2567 4.5897 29.3934 6.63384 29.3934C8.69938 29.3934 9.86734 28.2567 9.86734 25.5082V24.4986H13.2258V25.6321C13.2258 29.8894 10.7641 32.245 6.61245 32.245C2.46084 32.245 0 29.8894 0 25.6321V18.066H0.00171036Z" fill="#00A19A"/>
                      <path d="M41.9458 11.0794L22.5842 0.234276C22.3189 0.0885573 22.0118 0.00724567 21.6995 0H21.6507V0.119151L21.6173 0H21.5711C21.2562 0.00805074 20.9499 0.0893627 20.6829 0.235886L7.20648 7.78426V6.46394C7.20648 5.59929 6.41072 4.89566 5.43357 4.89566C4.45642 4.89566 3.66067 5.59929 3.66067 6.46394V9.77119L1.32218 11.081C0.4922 11.5375 0.237216 12.5068 0.754028 13.2411C1.26998 13.9753 2.36607 14.2007 3.19691 13.7434L21.6344 3.41593L40.0728 13.7442C40.3577 13.9012 40.6786 13.9817 41.0063 13.9817C41.1415 13.9817 41.2776 13.968 41.4119 13.9407C41.8731 13.8457 42.265 13.5977 42.5157 13.2419C43.0316 12.5076 42.7767 11.5391 41.9475 11.0827L41.9458 11.0794Z" fill="#00A19A"/>
                      <path d="M20.5113 7.6543H17.988C17.7616 7.6543 17.5781 7.82695 17.5781 8.03993V10.4141C17.5781 10.6271 17.7616 10.7997 17.988 10.7997H20.5113C20.7376 10.7997 20.9211 10.6271 20.9211 10.4141V8.03993C20.9211 7.82695 20.7376 7.6543 20.5113 7.6543Z" fill="#00A19A"/>
                      <path d="M24.8735 7.6543H22.3502C22.1238 7.6543 21.9403 7.82695 21.9403 8.03993V10.4141C21.9403 10.6271 22.1238 10.7997 22.3502 10.7997H24.8735C25.0998 10.7997 25.2833 10.6271 25.2833 10.4141V8.03993C25.2833 7.82695 25.0998 7.6543 24.8735 7.6543Z" fill="#00A19A"/>
                      <path d="M20.5113 11.5947H17.988C17.7616 11.5947 17.5781 11.7674 17.5781 11.9804V14.3545C17.5781 14.5675 17.7616 14.7402 17.988 14.7402H20.5113C20.7376 14.7402 20.9211 14.5675 20.9211 14.3545V11.9804C20.9211 11.7674 20.7376 11.5947 20.5113 11.5947Z" fill="#00A19A"/>
                      <path d="M24.8735 11.5947H22.3502C22.1238 11.5947 21.9403 11.7674 21.9403 11.9804V14.3545C21.9403 14.5675 22.1238 14.7402 22.3502 14.7402H24.8735C25.0998 14.7402 25.2833 14.5675 25.2833 14.3545V11.9804C25.2833 11.7674 25.0998 11.5947 24.8735 11.5947Z" fill="#00A19A"/>
                    </svg>
                    <p class="no-image-text">This property does not have any images uploaded yet</p>
                  </div>
                </div>

                <!-- Details -->
                <div class="px-3 pt-3 pb-3">
                  <!-- Address + thumbs -->
                  <div class="flex items-start justify-between gap-2 mb-0.5">
                    <span class="property_address">{{ property.address }}</span>
                    <div class="flex gap-1.5 flex-shrink-0 mt-0.5">
                      <button
                        @click.stop
                        class="flex items-center justify-center"
                      >
                        <OPIcon name="like" class="w-[15px] h-[15px]" />
                      </button>
                      <button
                        @click.stop
                        class="flex items-center justify-center"
                      >
                        <OPIcon name="dislike" class="w-[15px] h-[15px]" />
                      </button>
                    </div>
                  </div>

                  <p class="mb-1.5 property_area">
                    {{ property.area }}
                  </p>
                  <p class="mb-2 property_price">
                    {{ property.priceDisplay }}
                  </p>

                  <!-- Badges -->
                  <div class="flex items-center flex-wrap gap-1.5 mb-1.5">
                    <div
                      class="w-5 h-5 bg-brand-aqua rounded flex items-center justify-center"
                    >
                      <OPIcon name="verified" class="w-[11px] h-[11px]" />
                    </div>
                    <span
                      class="bg-[#00A19A] flex gap-1.5 items-center text-white px-2 py-0.5 rounded text-[11px]"
                    >
                      <OPIcon
                        name="matchPercentage"
                        class="w-[11px] h-[11px]"
                      />
                      {{ property.matchScore }}%
                    </span>
                    <div
                      class="flex items-center gap-1 text-gray-600 text-[11px] bg-brand-aqua/10 text-brand-aqua px-2 py-0.5 rounded-[4px]"
                    >
                      <OPIcon name="bedroom" class="w-[11px] h-[11px]" />
                      <span>{{ property.bedrooms }}</span>
                    </div>
                    <div
                      class="flex items-center gap-1 text-gray-600 text-[11px] bg-brand-aqua/10 text-brand-aqua px-2 py-0.5 rounded-[4px]"
                    >
                      <OPIcon name="bathroom" class="w-[11px] h-[11px]" />
                      <span>{{ property.bathrooms }}</span>
                    </div>
                    <span
                      class="bg-brand-aqua/10 text-brand-aqua px-2 py-0.5 rounded-[4px] text-[11px] font-medium"
                    >
                      {{ property.type }}
                    </span>
                  </div>

                  <!-- sqft -->
                  <div
                    class="flex items-center gap-1 text-gray-600 text-[11px] bg-brand-aqua/10 text-brand-aqua px-2 py-0.5 rounded-[4px] sqft-badge"
                  >
                    <OPIcon name="sqft" class="w-[11px] h-[11px]" />
                    <span>{{ property.sqftDisplay }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="recommendedProperties.length === 0" class="px-4">
            <div
              class="h-44 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 text-sm"
            >
              No properties found
            </div>
          </div>
        </div>

        <!-- Dots below carousel -->
        <div
          v-if="recommendedProperties.length > 1"
          class="flex justify-center gap-1.5 mt-3"
        >
          <span
            v-for="(_, i) in recommendedProperties"
            :key="i"
            class="rounded-full transition-all duration-200 cursor-pointer"
            :class="
              i === currentSlide
                ? 'w-4 h-1.5 bg-brand-aqua'
                : 'w-1.5 h-1.5 bg-gray-300'
            "
            @click="currentSlide = i"
          />
        </div>
      </div>

      <!-- Your Journey -->
      <div class="mb-8">
        <div class="px-4 mb-3">
          <h2 class="section-title">Your Journey</h2>
          <p class="section-subtitle">
            Here are some top picks exclusively selected for you based on your
            profile.
          </p>
        </div>

        <div class="flex gap-3 overflow-x-auto pb-4 px-4 scrollbar-hide">
          <div class="journey-card flex-shrink-0">
            <OPIcon name="findTrustedUsers" class="journey-illustration" />
            <h3 class="journey-title">Find Trusted Traders</h3>
            <p class="journey-desc">
              Connect with vetted professionals for all your property
              maintenance and improvement needs
            </p>
            <button class="journey-btn">Marketplace</button>
          </div>

          <div class="journey-card flex-shrink-0">
            <OPIcon name="buyersHub" class="journey-illustration" />
            <h3 class="journey-title">Property Bible</h3>
            <p class="journey-desc">
              Master the buying process with our expert guides and resources
            </p>
            <button class="journey-btn">Learn</button>
          </div>

          <div
            class="journey-card flex-shrink-0"
            @click="router.push('/passport/collections')"
          >
            <OPIcon name="sellersHub" class="journey-illustration" />
            <h3 class="journey-title">Sellers Hub</h3>
            <p class="journey-desc">
              Access and manage all your property passports in one place
            </p>
            <button class="journey-btn">Start</button>
          </div>
        </div>
      </div>
    </main>

    <BottomNav active="explore" />

    <SearchDrawer :show="showSearchDrawer" @close="showSearchDrawer = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import AppHeader from '~/components/core/AppHeader.vue'
import BottomNav from '@/components/core/BottomNav.vue'
import HeroSection from '~/components/HeroSection.vue'
import SearchDrawer from '~/components/search/SearchDrawer.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({
  title: 'Explore - UmovingU',
  middleware: 'auth',
})

const router = useRouter()
const config = useRuntimeConfig()

const showSearchDrawer = ref(false)
const recommendedProperties = ref<any[]>([])

const currentSlide = ref(0)
const carouselRef = ref<HTMLElement | null>(null)
const slideWidth = ref(0)

let touchStartX = 0
const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].screenX
}
const onTouchEnd = (e: TouchEvent) => {
  const diff = touchStartX - e.changedTouches[0].screenX
  if (Math.abs(diff) > 40) {
    if (
      diff > 0 &&
      currentSlide.value < recommendedProperties.value.length - 1
    ) {
      currentSlide.value++
    } else if (diff < 0 && currentSlide.value > 0) {
      currentSlide.value--
    }
  }
}

onMounted(async () => {
  await nextTick()
  // 88% width so next card peeks 12% on the right
  slideWidth.value = (carouselRef.value?.offsetWidth ?? 0) * 0.88

  try {
    const token = localStorage.getItem('token')
    if (!token) return
    const result = await $fetch<{ items: any[]; total: number }>(
      `${config.public.apiBase}/property/for-you`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    recommendedProperties.value = (result.items ?? []).map((p: any) => ({
      ...p,
      address: [p.addressLine1, p.city].filter(Boolean).join(', '),
      area: [p.city, p.postcode].filter(Boolean).join(', '),
      priceDisplay: p.estimatedPrice
        ? `£${Math.round(p.estimatedPrice).toLocaleString('en-GB')}`
        : p.lastSoldPrice
          ? `£${Math.round(p.lastSoldPrice).toLocaleString('en-GB')} (last sold)`
          : 'Price on request',
      sqftDisplay: p.sqft ? `${p.sqft.toLocaleString('en-GB')} sq ft` : 'N/A',
      type: p.propertyType ?? 'Property',
      bedrooms: p.bedrooms ?? '—',
      bathrooms: p.bathrooms ?? '—',
      image: p.imageUrl ?? null,
    }))
  } catch {
    // Backend unreachable or user not logged in
  }
})

const viewProperty = (id: string) => {
  router.push(`/property/${id}`)
}
</script>

<style scoped>
.property_address {
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  color: #000000;
  letter-spacing: -0.23px;
  vertical-align: middle;
}
.property_area {
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  vertical-align: middle;
  color: #3c3c4399;
}

.property_price {
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  vertical-align: middle;
  color: #00a19a;
}

.sqft-badge {
  width: fit-content;
}

/* Property image placeholder — matches ImageSlider.vue */
.no-image-placeholder {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: #e6e8e7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.no-image-text {
  text-align: center;
  color: #3a4a48;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.2px;
  padding: 0 16px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 2px;
}

.section-subtitle {
  font-size: 13px;
  color: #8e8e93;
  line-height: 1.4;
  margin: 0;
}

.search-bar {
  padding: 7px 6px 7px 16px;
}

/* Action cards */
.action-card {
  background: white;
  border-radius: 20px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  border: 1px solid #f0f0f0;
}

.action-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.action-card-title {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.action-card-sub {
  font-size: 12px;
  color: #00a19a;
  line-height: 1.4;
  margin: 0;
}

.action-btn {
  padding: 7px 20px;
  color: #00a19a;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  background: #00a19a1a;
  padding: 6px 12px;
  border-radius: 50px;
}

/* Gauge */
.gauge-wrap {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
}

/* Passport thumbnail in action card */
.passport-thumb-wrap {
  width: 100px;
  height: 90px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 6px;
  position: relative;
}

.passport-thumb-inner {
  position: absolute;
  top: 0;
  left: 50%;
  width: 360px;
  transform: scale(0.178) translateX(-50%);
  transform-origin: top left;
}

.passport-thumb-img {
  width: 100%;
  height: auto;
  display: block;
}

/* Journey cards */
.journey-card {
  width: 300px;
  background: white;
  border-radius: 20px;
  padding: 10px 16px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
}

.journey-illustration {
  width: 80px !important;
  height: 80px !important;
  object-fit: contain;
  margin-bottom: 4px;
}

.journey-title {
  color: #000000;
  line-height: 1.3;
  font-weight: 400;
  font-size: 16px;
  line-height: 21px;
  letter-spacing: -0.31px;
  vertical-align: middle;
}

.journey-desc {
  color: #00a19a;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.06px;
  vertical-align: middle;
}

.journey-btn {
  margin-top: 6px;
  padding: 6px 12px;
  border: 1.5px solid #00a19a1a;
  border-radius: 20px;
  background: #00a19a1a;
  color: #00a19a;
  cursor: pointer;
  align-self: flex-start;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  vertical-align: middle;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.umu_btn {
  background: #00a19a1a;
  padding: 6px 12px;
  border-radius: 50px;
}
</style>
