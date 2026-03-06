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
          subColored="UMU search is powered by AI."
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
        <!-- Card 1: Find your Home Score -->
        <div class="action-card">
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
            <h3 class="action-card-title">Find your Home Score</h3>
            <p class="action-card-sub">
              Click here to find out how energy efficient your home is.
            </p>
            <div class="flex justify-end mt-2">
              <button class="action-btn">Start</button>
            </div>
          </div>
        </div>

        <!-- Card 2: Property Passport -->
        <div
          class="action-card cursor-pointer"
          @click="router.push('/passport/collections')"
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
            <h3 class="action-card-title">Property Passport</h3>
            <p class="action-card-sub">
              Click here to start your property passport journey.
            </p>
            <div class="flex justify-end mt-2">
              <button class="action-btn">Start</button>
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
                <div class="relative h-48 bg-gray-200 overflow-hidden">
                  <img
                    :src="property.image"
                    :alt="property.address"
                    class="w-full h-full object-cover"
                  />
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
                      class="bg-[#00A19A] text-white px-2 py-0.5 rounded text-[11px]"
                    >
                      {{ mockMatch(index) }}%
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

        <div class="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
          <div class="journey-card flex-shrink-0">
            <img
              src="/op-icons/passportview/seller.svg"
              class="journey-illustration"
              alt=""
            />
            <h3 class="journey-title">Find Trusted Traders</h3>
            <p class="journey-desc">
              Connect with vetted professionals for all your property
              maintenance and improvement needs
            </p>
            <button class="journey-btn">Marketplace</button>
          </div>

          <div class="journey-card flex-shrink-0">
            <img
              src="/op-icons/passportview/buyer.svg"
              class="journey-illustration"
              alt=""
            />
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
            <img
              src="/op-icons/passportview/umu-passport.png"
              class="journey-illustration"
              alt=""
            />
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
import { usePropertySearch } from '~/composables/usePropertySearch'
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({
  title: 'Explore - UmovingU',
  middleware: 'auth',
})

const { searchProperties } = usePropertySearch()
const router = useRouter()

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

const MATCH_SCORES = [64, 82, 91]
const mockMatch = (index: number) => MATCH_SCORES[index % MATCH_SCORES.length]

onMounted(async () => {
  await nextTick()
  // 88% width so next card peeks 12% on the right
  slideWidth.value = (carouselRef.value?.offsetWidth ?? 0) * 0.88

  try {
    const results = await searchProperties('TW18')
    recommendedProperties.value = results.slice(0, 3)
  } catch {
    // Backend unreachable
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
  width: 68px;
  height: 100px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 6px;
  position: relative;
}

.passport-thumb-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 360px;
  transform: scale(0.178);
  transform-origin: top left;
}

.passport-thumb-img {
  width: 100%;
  height: auto;
  display: block;
}

/* Journey cards */
.journey-card {
  width: 180px;
  background: white;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
}

.journey-illustration {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 4px;
}

.journey-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
}

.journey-desc {
  font-size: 11px;
  color: #00a19a;
  line-height: 1.4;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.journey-btn {
  margin-top: 8px;
  padding: 7px 18px;
  border: 1.5px solid #00a19a;
  border-radius: 20px;
  background: transparent;
  color: #00a19a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
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
