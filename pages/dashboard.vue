<template>
  <div class="mobile-container min-h-screen bg-white">
    <!-- App Header -->
    <AppHeader title="Explore" :showBack="false" right="profile" />

    <!-- Main Content -->
    <main class="pb-20">
      <!-- Hero Section -->
      <div class="px-4">
        <HeroSection
          iconName="propertySearch"
          iconClass="w-full h-full"
          heroClass="w-40 h-40"
          mainTitle="Stop searching like it's 1999. Search for a life, not just a house."
          subColored="UMU search is powered by AI"
          subTitle="Tell us how you live. We'll find the homes that fit."
        />
      </div>

      <!-- Enhanced Search Input -->
      <div class="px-4 mb-6">
        <EnhancedSearchInput
          v-model="searchQuery"
          placeholder="Describe your ideal home."
          :isSearching="searching"
          @search="performSearch"
          @focus="openSearchSuggestions"
        />
      </div>

      <!-- For You Section -->
      <div class="mb-8">
        <div class="px-4 mb-3">
          <h2 class="text-lg font-semibold text-gray-900">For You</h2>
          <p class="text-sm text-gray-500 mt-0.5">
            Here are some top picks exclusively matched from your Home Profile
          </p>
        </div>

        <!-- Horizontal property carousel — JS translateX, one card at a time -->
        <div
          ref="carouselRef"
          class="relative overflow-hidden"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <div
            class="flex transition-transform duration-300 ease-in-out"
            :style="{ transform: `translateX(-${currentSlide * slideWidth}px)` }"
          >
          <div
            v-for="(property, index) in recommendedProperties"
            :key="property.id"
            @click="viewProperty(property.id)"
            class="flex-none px-4 pb-4"
            :style="{ width: slideWidth + 'px' }"
          >
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer">
            <!-- Property Image with overlays -->
            <div class="relative h-48 overflow-hidden bg-gray-200">
              <img
                :src="property.image"
                :alt="property.address"
                class="w-full h-full object-cover"
              />
              <!-- Match badge -->
              <div class="absolute top-3 left-3 flex items-center gap-1 bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                <span>⚙️</span>
                <span>{{ mockMatch(index) }}% Match</span>
              </div>
              <!-- Thumbs -->
              <div class="absolute top-3 right-3 flex gap-2">
                <button
                  @click.stop
                  class="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center"
                >
                  <Icon name="i-heroicons-hand-thumb-up" class="w-4 h-4 text-gray-500" />
                </button>
                <button
                  @click.stop
                  class="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center"
                >
                  <Icon name="i-heroicons-hand-thumb-down" class="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <!-- Card Body -->
            <div class="p-4">
              <h4 class="font-semibold text-gray-900 text-base leading-snug mb-0.5">
                {{ property.address }}
              </h4>
              <p class="text-sm text-gray-500 mb-1">{{ property.area }}</p>
              <p class="text-xl font-bold text-gray-900 mb-3">
                {{ property.priceDisplay }}
              </p>

              <!-- Feature badges -->
              <div class="flex items-center flex-wrap gap-2 mb-2">
                <div
                  v-if="property.passport !== null && property.passport !== undefined"
                  class="flex items-center gap-1"
                >
                  <div class="w-5 h-5 bg-brand-aqua rounded flex items-center justify-center">
                    <Icon name="i-heroicons-check" class="w-3 h-3 text-white" />
                  </div>
                  <span class="bg-brand-aqua text-white px-2 py-0.5 rounded text-xs font-semibold">
                    {{ property.passport }}%
                  </span>
                </div>
                <div class="flex items-center gap-1 text-brand-aqua">
                  <Icon name="i-heroicons-building-office" class="w-4 h-4" />
                  <span class="text-xs font-medium">{{ property.bedrooms }}</span>
                </div>
                <div class="flex items-center gap-1 text-brand-aqua">
                  <Icon name="i-heroicons-home" class="w-4 h-4" />
                  <span class="text-xs font-medium">{{ property.bathrooms }}</span>
                </div>
                <span class="bg-brand-aqua text-white px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ property.type }}
                </span>
              </div>

              <!-- sqft + status -->
              <div class="flex items-center gap-2 mb-3">
                <div class="flex items-center gap-1 text-brand-aqua">
                  <Icon name="i-heroicons-squares-2x2" class="w-4 h-4" />
                  <span class="text-xs font-medium">{{ property.sqftDisplay }}</span>
                </div>
                <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Move-in Ready</span>
              </div>

              <!-- Lifestyle tags -->
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in mockTags(index)"
                  :key="tag"
                  class="bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div><!-- inner card -->
          </div><!-- slide wrapper -->
          </div><!-- flex -->

          <!-- Dot indicators -->
          <div v-if="recommendedProperties.length > 1" class="flex justify-center gap-2 mt-2 pb-1">
            <button
              v-for="(_, i) in recommendedProperties"
              :key="i"
              @click.stop="currentSlide = i"
              class="w-2 h-2 rounded-full transition-colors duration-200"
              :class="i === currentSlide ? 'bg-brand-aqua' : 'bg-gray-300'"
            />
          </div>

          <!-- Empty state -->
          <div
            v-if="recommendedProperties.length === 0"
            class="px-4 pb-4"
          >
            <div class="h-48 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
              No properties found
            </div>
          </div>
        </div><!-- carousel container -->
      </div>

      <!-- Your Journey Section -->
      <div class="mb-8">
        <div class="px-4 mb-3">
          <h2 class="text-lg font-semibold text-gray-900">Your Journey</h2>
          <p class="text-sm text-gray-500 mt-0.5">
            Here are some top picks exclusively selected for you based on your profile.
          </p>
        </div>

        <!-- Horizontal journey carousel -->
        <div class="flex gap-4 overflow-x-auto pb-4 px-4 scrollbar-hide">
          <div class="flex-shrink-0 w-44 bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition">
            <div class="w-14 h-14 mb-3 bg-blue-100 rounded-xl flex items-center justify-center">
              <Icon name="i-heroicons-wrench-screwdriver" class="w-7 h-7 text-blue-600" />
            </div>
            <h3 class="font-semibold text-gray-900 mb-1 text-sm leading-snug">Find Trusted Traders</h3>
            <p class="text-xs text-gray-500 mb-3 leading-snug line-clamp-3">
              Connect with vetted professionals for all your property maintenance and improvement needs
            </p>
            <button class="text-brand-aqua font-semibold text-xs border border-brand-aqua rounded-full px-3 py-1">
              Marketplace
            </button>
          </div>

          <div class="flex-shrink-0 w-44 bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition">
            <div class="w-14 h-14 mb-3 bg-purple-100 rounded-xl flex items-center justify-center">
              <Icon name="i-heroicons-academic-cap" class="w-7 h-7 text-purple-600" />
            </div>
            <h3 class="font-semibold text-gray-900 mb-1 text-sm leading-snug">Property Experts</h3>
            <p class="text-xs text-gray-500 mb-3 leading-snug line-clamp-3">
              Master the buying process with our expert guides
            </p>
            <button class="text-brand-aqua font-semibold text-xs border border-brand-aqua rounded-full px-3 py-1">
              Learn
            </button>
          </div>

          <div
            @click="navigateToSellersHub"
            class="flex-shrink-0 w-44 bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition"
          >
            <div class="w-14 h-14 mb-3 bg-green-100 rounded-xl flex items-center justify-center">
              <Icon name="i-heroicons-home" class="w-7 h-7 text-green-600" />
            </div>
            <h3 class="font-semibold text-gray-900 mb-1 text-sm leading-snug">Sellers Hub</h3>
            <p class="text-xs text-gray-500 mb-3 leading-snug line-clamp-3">
              Click start to begin your sellers journey
            </p>
            <button class="text-brand-aqua font-semibold text-xs border border-brand-aqua rounded-full px-3 py-1">
              Start
            </button>
          </div>

          <div class="flex-shrink-0 w-44 bg-gray-50 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 transition">
            <div class="w-14 h-14 mb-3 bg-orange-100 rounded-xl flex items-center justify-center">
              <Icon name="i-heroicons-building-office" class="w-7 h-7 text-orange-600" />
            </div>
            <h3 class="font-semibold text-gray-900 mb-1 text-sm leading-snug">Buyers Hub</h3>
            <p class="text-xs text-gray-500 mb-3 leading-snug line-clamp-3">
              Click start to begin your buyers journey
            </p>
            <button class="text-brand-aqua font-semibold text-xs border border-brand-aqua rounded-full px-3 py-1">
              Start
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNav active="explore" />

    <!-- Search Suggestions -->
    <div
      v-if="showSearchSuggestions"
      class="fixed inset-0 bg-white z-[40] overflow-auto"
    >
      <SearchSuggestions
        :query="searchQuery"
        @close="showSearchSuggestions = false"
        @search="handleSuggestionSearch"
      />
    </div>

    <!-- Search Results -->
    <div
      v-if="showSearchResults"
      class="fixed inset-0 bg-white z-[40] overflow-auto"
    >
      <SearchResults
        :query="searchQuery"
        :results="searchResults"
        @close="showSearchResults = false"
        @show-filters="showFilterPanel"
      />
    </div>

    <!-- Filters Drawer -->
    <BaseDrawer v-model="showFilters" title="All Filters">
      <FiltersModal @close="showFilters = false" @apply="applyFilters" />
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import AppHeader from '~/components/core/AppHeader.vue'
import BottomNav from '@/components/core/BottomNav.vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import HeroSection from '~/components/HeroSection.vue'
import SearchSuggestions from '~/components/search/SearchSuggestions.vue'
import SearchResults from '~/components/search/SearchResults.vue'
import FiltersModal from '~/components/search/FiltersModal.vue'
import EnhancedSearchInput from '~/components/find-property/EnhancedSearchInput.vue'
import { usePropertySearch } from '~/composables/usePropertySearch'

definePageMeta({
  title: 'Explore - UmovingU',
  middleware: 'auth',
})

const { searchProperties } = usePropertySearch()
const router = useRouter()

const searchQuery = ref('')
const showSearchSuggestions = ref(false)
const showSearchResults = ref(false)
const showFilters = ref(false)
const searching = ref(false)
const searchResults = ref<any[]>([])
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
    if (diff > 0 && currentSlide.value < recommendedProperties.value.length - 1) {
      currentSlide.value++
    } else if (diff < 0 && currentSlide.value > 0) {
      currentSlide.value--
    }
  }
}

const MATCH_SCORES = [98.2, 82.4, 91.7]
const TAG_SETS = [
  ['Breakfast kitchen', 'Good Primary within 800m', 'Low Crime', 'Family Street', 'Pool Potential'],
  ['Garden', 'Fast Broadband', 'Parking', 'Near Stations', 'EPC Rated B'],
  ['Home Office', 'Close to Parks', 'Low Traffic', 'Energy Efficient', 'Period Features'],
]

const mockMatch = (index: number) => MATCH_SCORES[index % MATCH_SCORES.length]
const mockTags = (index: number) => TAG_SETS[index % TAG_SETS.length]

onMounted(async () => {
  await nextTick()
  slideWidth.value = carouselRef.value?.offsetWidth ?? 0

  try {
    const results = await searchProperties('TW18')
    recommendedProperties.value = results.slice(0, 3)
  } catch {
    // Backend unreachable — stays empty
  }
})

const openSearchSuggestions = () => {
  showSearchResults.value = false
  showSearchSuggestions.value = true
}

const handleSuggestionSearch = (query: string) => {
  searchQuery.value = query
  showSearchSuggestions.value = false
  performSearch()
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  searching.value = true
  showSearchSuggestions.value = false
  try {
    const results = await searchProperties(searchQuery.value)
    searchResults.value = results
    showSearchResults.value = true
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    searching.value = false
  }
}

const applyFilters = (filters: any) => {
  showFilters.value = false
  console.log('Applying filters:', filters)
}

const navigateToSellersHub = () => {
  router.push('/passportview/77f535a9-527d-4c30-a502-0f72dcd97289')
}

const viewProperty = (id: string) => {
  router.push(`/property/${id}`)
}

const showFilterPanel = () => {
  showFilters.value = true
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
