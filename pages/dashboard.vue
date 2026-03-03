<template>
  <div class="mobile-container min-h-screen bg-white">
    <!-- App Header -->
    <AppHeader title="Explore" :showBack="false" right="profile" />

    <!-- Main Content -->
    <main class="px-4 pb-20">
      <!-- Hero Section with New UI -->
      <div class="mb-8 mt-4">
        <!-- Hero Title -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Stop searching like it's 1999.
          </h1>
          <p class="text-xl text-gray-600 font-medium">
            Search for a life, not just a house.
          </p>
        </div>

        <!-- Tagline -->
        <p class="text-sm text-gray-500 mb-4">UMU search is powered by AI</p>
      </div>

      <!-- Enhanced Search Input with Voice -->
      <div class="mb-6">
        <EnhancedSearchInput
          v-model="searchQuery"
          placeholder="Describe your ideal home."
          :isSearching="searching"
          @search="performSearch"
          @focus="openSearchSuggestions"
        />
      </div>

      <!-- Search Options -->
      <div class="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          @click="useCurrentLocation"
          class="flex items-center gap-2 px-4 py-2 bg-brand-aqua text-white rounded-full text-sm font-medium whitespace-nowrap hover:bg-brand-aqua/90 transition"
        >
          <Icon name="i-heroicons-map-pin" class="w-4 h-4" />
          Current Location
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition"
        >
          <Icon name="i-heroicons-pencil" class="w-4 h-4" />
          Draw on Maps
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200 transition"
        >
          Property
        </button>
      </div>

      <!-- For You Section -->
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <Icon name="i-heroicons-sparkles" class="w-5 h-5 text-gray-400" />
          <h2 class="text-lg font-semibold text-gray-900">For You</h2>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Here are some top picks exclusively selected for you based on your
          profile.
        </p>

        <!-- Property Cards Carousel -->
        <div class="space-y-4">
          <div
            v-for="property in recommendedProperties"
            :key="property.id"
            @click="viewProperty(property.id)"
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition"
          >
            <img
              :src="property.image"
              :alt="property.address"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-900">
                  {{ property.address }}
                </h4>
                <div
                  class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-50 transition"
                >
                  <Icon
                    name="i-heroicons-heart"
                    class="w-5 h-5 text-gray-400 hover:text-red-500"
                  />
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ property.area }}</p>
              <p class="text-xl font-bold text-gray-900 mb-3">
                {{ property.priceDisplay }}
              </p>

              <div class="flex items-center flex-wrap gap-2 mb-2">
                <div
                  v-if="property.passport !== null"
                  class="flex items-center gap-1"
                >
                  <div
                    class="w-6 h-6 bg-brand-aqua rounded flex items-center justify-center"
                  >
                    <Icon name="i-heroicons-check" class="w-4 h-4 text-white" />
                  </div>
                  <span
                    class="bg-brand-aqua text-white px-2 py-1 rounded text-xs font-medium"
                  >
                    {{ property.passport }}%
                  </span>
                </div>

                <div class="flex items-center gap-1 text-brand-aqua">
                  <Icon name="i-heroicons-building-office" class="w-4 h-4" />
                  <span class="text-sm">{{ property.bedrooms }}</span>
                </div>

                <div class="flex items-center gap-1 text-brand-aqua">
                  <Icon name="i-heroicons-home" class="w-4 h-4" />
                  <span class="text-sm">{{ property.bathrooms }}</span>
                </div>

                <span
                  class="bg-brand-aqua text-white px-2 py-1 rounded text-xs"
                >
                  {{ property.type }}
                </span>
              </div>

              <div class="flex items-center text-brand-aqua text-sm">
                <Icon name="i-heroicons-squares-2x2" class="w-4 h-4 mr-1" />
                <span>{{ property.sqftDisplay }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Your Journey Section -->
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <Icon name="i-heroicons-map" class="w-5 h-5 text-gray-400" />
          <h2 class="text-lg font-semibold text-gray-900">Your Journey</h2>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Here are some top picks exclusively selected for you based on your
          profile.
        </p>

        <div class="grid grid-cols-2 gap-4">
          <!-- Find Trusted Traders -->
          <div
            class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer"
          >
            <div class="w-12 h-12 mb-3">
              <div
                class="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center"
              >
                <Icon
                  name="i-heroicons-wrench-screwdriver"
                  class="w-6 h-6 text-blue-600"
                />
              </div>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1 text-sm">
              Find Trusted Traders
            </h3>
            <p class="text-xs text-gray-600 mb-3 line-clamp-2">
              Connect with vetted professionals for all your property
              maintenance needs
            </p>
            <button class="text-brand-aqua font-medium text-xs hover:underline">
              Marketplace
            </button>
          </div>

          <!-- Property Experts -->
          <div
            class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer"
          >
            <div class="w-12 h-12 mb-3">
              <div
                class="w-full h-full bg-purple-100 rounded-lg flex items-center justify-center"
              >
                <Icon
                  name="i-heroicons-academic-cap"
                  class="w-6 h-6 text-purple-600"
                />
              </div>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1 text-sm">
              Property Experts
            </h3>
            <p class="text-xs text-gray-600 mb-3 line-clamp-2">
              Master the buying process with our expert guides
            </p>
            <button class="text-brand-aqua font-medium text-xs hover:underline">
              Learn
            </button>
          </div>

          <!-- Sellers Hub -->
          <div
            @click="navigateToSellersHub"
            class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer"
          >
            <div class="w-12 h-12 mb-3">
              <div
                class="w-full h-full bg-green-100 rounded-lg flex items-center justify-center"
              >
                <Icon name="i-heroicons-home" class="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1 text-sm">
              Sellers Hub
            </h3>
            <p class="text-xs text-gray-600 mb-3 line-clamp-2">
              Click start to begin your sellers journey
            </p>
            <button class="text-brand-aqua font-medium text-xs hover:underline">
              Start
            </button>
          </div>

          <!-- Buyers Hub -->
          <div
            class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer"
          >
            <div class="w-12 h-12 mb-3">
              <div
                class="w-full h-full bg-orange-100 rounded-lg flex items-center justify-center"
              >
                <Icon
                  name="i-heroicons-building-office"
                  class="w-6 h-6 text-orange-600"
                />
              </div>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1 text-sm">Buyers Hub</h3>
            <p class="text-xs text-gray-600 mb-3 line-clamp-2">
              Click start to begin your buyers journey
            </p>
            <button class="text-brand-aqua font-medium text-xs hover:underline">
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
import { ref, onMounted } from 'vue'
import AppHeader from '~/components/core/AppHeader.vue'
import BottomNav from '@/components/core/BottomNav.vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
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

// Load "For You" properties from the backend on mount (default seed area)
onMounted(async () => {
  try {
    const results = await searchProperties('TW18')
    recommendedProperties.value = results.slice(0, 3)
  } catch {
    // Backend unreachable — section stays empty; UI handles this gracefully
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

const useCurrentLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location:', position.coords)
      },
      (error) => {
        console.error('Error getting location:', error)
      },
    )
  }
}

const navigateToSellersHub = () => {
  router.push('/passportview/77f535a9-527d-4c30-a502-0f72dcd97289')
}

// IDs are now UUIDs (strings) from the backend
const viewProperty = (id: string) => {
  router.push(`/property/${id}`)
}

const showFilterPanel = () => {
  showFilters.value = true
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
