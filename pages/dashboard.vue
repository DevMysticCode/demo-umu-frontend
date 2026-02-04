<template>
  <div class="mobile-container min-h-screen bg-umu-gradient">
    <!-- App Header -->
    <AppHeader title="Explore" :showBack="false" right="profile" />

    <!-- Main Content -->
    <main class="px-4 pb-20">
      <!-- Search Section -->
      <div class="mb-8">
        <HeroSection
          iconName="propertySearch"
          iconClass="w-[120px] h-[120px]"
          mainTitle="Property Search"
          subColored="UMU search is powered by AI."
          subTitle="Try searching for Property Passports that are detached"
          heroClass="w-[120px] h-[120px]"
        />

        <!-- Search Input -->
        <UMUSearchInput
          v-model="searchQuery"
          placeholder="City, area or postcode"
          :isSearching="searching"
          @search="performSearch"
        />
      </div>

      <!-- Hubs Section -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <!-- Sellers Hub -->
        <div class="bg-gray-50 rounded-xl p-4">
          <div class="w-12 h-12 mb-3">
            <div
              class="w-full h-full bg-green-100 rounded-lg flex items-center justify-center"
            >
              <Icon name="i-heroicons-home" class="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">Sellers Hub</h3>
          <p class="text-sm text-gray-600 mb-3">
            Click start to begin your sellers journey
          </p>
          <button class="text-brand-aqua font-medium text-sm" @click="navigateToSellersHub">Start</button>
        </div>

        <!-- Buyers Hub -->
        <div class="bg-gray-50 rounded-xl p-4">
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
          <h3 class="font-semibold text-gray-900 mb-1">Buyers Hub</h3>
          <p class="text-sm text-gray-600 mb-3">
            Click start to begin your buyers journey
          </p>
          <button class="text-brand-aqua font-medium text-sm">Start</button>
        </div>
      </div>

      <!-- For You Section -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">For You</h3>
        <p class="text-sm text-gray-600 mb-4">
          Here are some top picks exclusively selected for you based on your
          profile.
        </p>

        <!-- Property Cards -->
        <div class="space-y-4" @click="viewProperty">
          <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <img
              src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop"
              alt="Property"
              class="w-full h-48 object-cover"
            />
            <div class="p-4">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-900">12, Maple Road</h4>
                <div class="flex items-center space-x-2">
                  <Icon
                    name="i-heroicons-heart"
                    class="w-5 h-5 text-gray-400"
                  />
                  <Icon
                    name="i-heroicons-heart"
                    class="w-5 h-5 text-gray-400"
                  />
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-2">
                Staines-upon-Thames, TW18 3BA
              </p>
              <p class="text-xl font-bold text-gray-900 mb-3">£650,000</p>

              <div class="flex items-center space-x-3 mb-2">
                <div class="flex items-center space-x-1">
                  <div
                    class="w-6 h-6 bg-brand-aqua rounded flex items-center justify-center"
                  >
                    <Icon name="i-heroicons-check" class="w-4 h-4 text-white" />
                  </div>
                  <span
                    class="bg-brand-aqua text-white px-2 py-1 rounded text-xs font-medium"
                    >64%</span
                  >
                </div>
                <div class="flex items-center space-x-1 text-brand-aqua">
                  <Icon name="i-heroicons-building-office" class="w-4 h-4" />
                  <span class="text-sm">4</span>
                </div>
                <div class="flex items-center space-x-1 text-brand-aqua">
                  <Icon name="i-heroicons-home" class="w-4 h-4" />
                  <span class="text-sm">3</span>
                </div>
                <span class="bg-brand-aqua text-white px-2 py-1 rounded text-xs"
                  >Detached</span
                >
              </div>

              <div class="flex items-center text-brand-aqua text-sm">
                <Icon name="i-heroicons-squares-2x2" class="w-4 h-4 mr-1" />
                <span>2,100 sqft</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Your Journey Section -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Your Journey</h3>
        <p class="text-sm text-gray-600 mb-4">
          Here are some top picks exclusively selected for you based on your
          profile.
        </p>

        <div class="grid grid-cols-2 gap-4">
          <!-- Find Trusted Traders -->
          <div class="bg-gray-50 rounded-xl p-4">
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
            <h4 class="font-semibold text-gray-900 mb-1">
              Find Trusted Traders
            </h4>
            <p class="text-xs text-gray-600 mb-3">
              Connect with vetted professionals for all your property
              maintenance and improvement needs
            </p>
            <button class="text-brand-aqua font-medium text-sm">
              Marketplace
            </button>
          </div>

          <!-- Property Experts -->
          <div class="bg-gray-50 rounded-xl p-4">
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
            <h4 class="font-semibold text-gray-900 mb-1">Property Experts</h4>
            <p class="text-xs text-gray-600 mb-3">
              Master the buying process with our expert guides
            </p>
            <button class="text-brand-aqua font-medium text-sm">Learn</button>
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

<script setup>
definePageMeta({
  title: 'Explore - UmovingU',
  middleware: 'auth',
})

import AppHeader from '~/components/core/AppHeader.vue'
import BottomNav from '@/components/core/BottomNav.vue'
import HeroSection from '@/components/HeroSection.vue'
import UMUSearchInput from '@/components/core/UMUSearchInput.vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import SearchSuggestions from '~/components/search/SearchSuggestions.vue'
import SearchResults from '~/components/search/SearchResults.vue'
import FiltersModal from '~/components/search/FiltersModal.vue'

// State
const searchQuery = ref('')
const showSearchSuggestions = ref(false)
const showSearchResults = ref(false)
const showFilters = ref(false)
const searchResults = ref([])

// Methods
const openSearchSuggestions = () => {
  console.log('Opening search suggestions')
  showSearchResults.value = false
  showSearchSuggestions.value = true
}

const handleSuggestionSearch = (query) => {
  searchQuery.value = query
  showSearchSuggestions.value = false
  performSearch(query)
}

const performSearch = (query) => {
  console.log('Performing search for:', query)
  showSearchSuggestions.value = false
  showSearchResults.value = true
  searchQuery.value = query

  // Mock search results
  searchResults.value = [
    {
      id: 1,
      address: '12, Maple Road',
      area: 'Staines-upon-Thames, TW18 3BA',
      price: '£650,000',
      passport: 64,
      bedrooms: 4,
      bathrooms: 3,
      type: 'Detached',
      sqft: '2,100 sqft',
    },
    {
      id: 2,
      address: '8, Greenfield Avenue',
      area: 'Walton-on-Thames, TW18 1AG',
      price: '£1,200,000',
      passport: 0,
      bedrooms: 5,
      bathrooms: 4,
      type: 'Detached',
      sqft: '1,800 sqft',
    },
    {
      id: 3,
      address: '57, Riverside Walk',
      area: 'Sunbury-on-Thames, TW18 3HN',
      price: '£475,000',
      passport: null,
      bedrooms: 2,
      bathrooms: 1,
      type: 'Terraced',
      sqft: '950 sqft',
    },
  ]
}

const applyFilters = (filters) => {
  showFilters.value = false
  // Apply filters to search results
  console.log('Applying filters:', filters)
}

const router = useRouter()

const navigateToSellersHub = () => {
  router.push('/passportview/67a743e2-39e1-4bfa-b2d7-fd762f9fffef')
}

const viewProperty = () => {
  router.push('/property/sample-property-123')
}

const showFilterPanel = () => {
  showFilters.value = true
}
</script>
