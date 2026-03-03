<template>
  <div class="mobile-container bg-white min-h-screen">
    <!-- Header -->
    <AppHeader
      title="Explore"
      :showBack="true"
      right="profile"
      isOverlay
      @back="$emit('close')"
    />

    <!-- Enhanced Search Input -->
    <div class="px-4 mb-4 mt-2">
      <div
        class="flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200"
      >
        <Icon
          name="i-heroicons-magnifying-glass"
          class="w-5 h-5 text-gray-400 mr-3"
        />
        <input
          :value="query"
          type="text"
          placeholder="City, area or postcode"
          class="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none"
          readonly
        />
        <button
          @click="$emit('show-filters')"
          class="w-10 h-10 bg-brand-aqua rounded-lg flex items-center justify-center hover:bg-brand-aqua/90 transition"
        >
          <Icon name="i-heroicons-bars-3" class="w-5 h-5 text-white" />
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="px-4 mb-6 overflow-x-auto pb-2">
      <div class="flex gap-2 whitespace-nowrap">
        <button
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium flex items-center transition',
            activeFilter === 'location'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
          @click="activeFilter = 'location'"
        >
          <Icon name="i-heroicons-map-pin" class="w-4 h-4 mr-1" />
          Current Location
        </button>
        <button
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium flex items-center transition',
            activeFilter === 'passport'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
          @click="activeFilter = 'passport'"
        >
          <Icon name="i-heroicons-check-circle" class="w-4 h-4 mr-1" />
          Passport Available
        </button>
        <button
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition',
            activeFilter === 'draw'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
          @click="activeFilter = 'draw'"
        >
          Draw
        </button>
      </div>
    </div>

    <!-- Results Header -->
    <div class="px-4 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <Icon
            name="i-heroicons-document-text"
            class="w-5 h-5 text-gray-400 mr-2"
          />
          <div>
            <h2 class="text-lg font-semibold text-gray-900">
              {{ results.length }} Results Found
            </h2>
            <p class="text-xs text-gray-500">for "{{ query }}"</p>
          </div>
        </div>
        <button
          @click="toggleView"
          class="p-2 hover:bg-gray-100 rounded-lg transition"
          :title="`Switch to ${viewMode === 'list' ? 'map' : 'list'} view`"
        >
          <Icon
            :name="
              viewMode === 'list'
                ? 'i-heroicons-map'
                : 'i-heroicons-bars-3-bottom-left'
            "
            class="w-5 h-5 text-gray-600"
          />
        </button>
      </div>
    </div>

    <!-- Results List -->
    <div v-if="viewMode === 'list'" class="px-4 pb-28">
      <div v-if="results.length > 0" class="space-y-4">
        <div
          v-for="(result, index) in results"
          :key="result.id || index"
          class="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-brand-aqua hover:shadow-lg cursor-pointer transition"
          @click="viewProperty(result.id)"
        >
          <!-- Property Image -->
          <div
            v-if="result.image"
            class="relative overflow-hidden bg-gray-200 h-40"
          >
            <img
              :src="result.image"
              :alt="result.address"
              class="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
            <!-- Save Button -->
            <button
              class="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
            >
              <Icon
                name="i-heroicons-heart"
                class="w-5 h-5 text-gray-400 hover:text-red-500"
              />
            </button>
          </div>

          <!-- Property Details -->
          <div class="p-4">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 text-lg">
                  {{ result.address }}
                </h3>
                <p class="text-sm text-gray-600 mt-1">{{ result.area }}</p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ result.postcode || '' }}
                </p>
              </div>
              <Icon
                name="i-heroicons-chevron-right"
                class="w-5 h-5 text-gray-300 flex-shrink-0"
              />
            </div>

            <!-- Price -->
            <p class="text-2xl font-bold text-gray-900 my-3">
              {{ result.priceDisplay }}
            </p>

            <!-- Features Row -->
            <div class="flex items-center flex-wrap gap-2 mb-3">
              <!-- Passport -->
              <div
                v-if="result.passport !== null && result.passport !== undefined"
                class="flex items-center gap-1"
              >
                <div
                  class="w-6 h-6 bg-brand-aqua rounded flex items-center justify-center"
                >
                  <Icon name="i-heroicons-check" class="w-4 h-4 text-white" />
                </div>
                <span
                  class="bg-brand-aqua text-white px-2 py-1 rounded text-xs font-semibold"
                >
                  {{ result.passport }}%
                </span>
              </div>

              <!-- Bedroom -->
              <div class="flex items-center gap-1 text-brand-aqua">
                <Icon name="i-heroicons-building-office" class="w-4 h-4" />
                <span class="text-sm font-medium">{{ result.bedrooms }}</span>
              </div>

              <!-- Bathroom -->
              <div class="flex items-center gap-1 text-brand-aqua">
                <Icon name="i-heroicons-home" class="w-4 h-4" />
                <span class="text-sm font-medium">{{ result.bathrooms }}</span>
              </div>

              <!-- Property Type -->
              <span
                class="bg-brand-aqua text-white px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ result.type }}
              </span>
            </div>

            <!-- Square Footage -->
            <div
              class="flex items-center text-brand-aqua text-sm pt-3 border-t border-gray-100"
            >
              <Icon name="i-heroicons-squares-2x2" class="w-4 h-4 mr-2" />
              <span class="font-medium">{{ result.sqftDisplay }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-12 text-center">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <Icon
            name="i-heroicons-magnifying-glass"
            class="w-8 h-8 text-gray-400"
          />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          No Results Found
        </h3>
        <p class="text-sm text-gray-600">
          Try searching with different keywords or adjust your filters
        </p>
      </div>
    </div>

    <!-- Map View Placeholder -->
    <div v-else class="px-4 pb-28">
      <div class="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
        <div class="text-center">
          <Icon
            name="i-heroicons-map"
            class="w-16 h-16 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-600">Map view coming soon</p>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mobile-container:max-w-sm"
    >
      <div class="max-w-sm mx-auto flex gap-3">
        <button
          @click="viewMode = 'list'"
          :class="[
            'flex-1 py-3 rounded-xl font-medium flex items-center justify-center transition',
            viewMode === 'list'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          <Icon name="i-heroicons-bars-3-bottom-left" class="w-5 h-5 mr-2" />
          List
        </button>
        <button
          @click="viewMode = 'map'"
          :class="[
            'flex-1 py-3 rounded-xl font-medium flex items-center justify-center transition',
            viewMode === 'map'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          <Icon name="i-heroicons-map" class="w-5 h-5 mr-2" />
          Map
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '~/components/core/AppHeader.vue'

interface PropertyResult {
  id: string
  address: string
  area: string
  postcode?: string
  price?: number
  priceDisplay: string
  passport?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  type: string
  sqft?: number | null
  sqftDisplay: string
  image?: string
}

interface Props {
  query: string
  results: PropertyResult[]
}

const props = defineProps<Props>()

defineEmits(['close', 'show-filters'])

const router = useRouter()
const viewMode = ref<'list' | 'map'>('list')
const activeFilter = ref('location')

const viewProperty = (id: string) => {
  router.push(`/property/${id}`)
}

const toggleView = () => {
  viewMode.value = viewMode.value === 'list' ? 'map' : 'list'
}
</script>

<style scoped>
.mobile-container\:max-w-sm {
  max-width: 28rem;
}
</style>
