<template>
  <div class="mobile-container bg-white min-h-screen">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 bg-white">
      <button @click="$emit('close')" class="text-brand-aqua font-medium">
        Back
      </button>
      <h1 class="text-xl font-semibold text-gray-900">Explore</h1>
      <div class="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
          alt="Profile"
          class="w-full h-full object-cover"
        />
      </div>
    </header>

    <!-- Search Input -->
    <div class="px-4 mb-4">
      <div class="flex items-center bg-gray-50 rounded-xl px-4 py-3">
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
          class="w-10 h-10 bg-brand-aqua rounded-xl flex items-center justify-center"
        >
          <Icon name="i-heroicons-bars-3" class="w-5 h-5 text-white" />
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="px-4 mb-6">
      <div class="flex space-x-3">
        <button
          class="px-4 py-2 bg-brand-aqua text-white rounded-full text-sm font-medium flex items-center"
        >
          <Icon name="i-heroicons-map-pin" class="w-4 h-4 mr-1" />
          Current Location
        </button>
        <button
          class="px-4 py-2 bg-brand-aqua text-white rounded-full text-sm font-medium flex items-center"
        >
          <Icon name="i-heroicons-check-circle" class="w-4 h-4 mr-1" />
          Passport Available
        </button>
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
        >
          Draw
        </button>
      </div>
    </div>

    <!-- Results Header -->
    <div class="px-4 mb-4">
      <div class="flex items-center">
        <Icon
          name="i-heroicons-document-text"
          class="w-5 h-5 text-gray-400 mr-2"
        />
        <h2 class="text-lg font-medium text-gray-600">45 Search Results</h2>
      </div>
    </div>

    <!-- Results List -->
    <div class="px-4 pb-24">
      <div class="space-y-4">
        <div
          v-for="result in results"
          :key="result.id"
          class="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:bg-gray-50"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-gray-900">{{ result.address }}</h3>
            <Icon
              name="i-heroicons-chevron-right"
              class="w-5 h-5 text-gray-400"
            />
          </div>

          <p class="text-sm text-gray-600 mb-2">{{ result.area }}</p>
          <p class="text-xl font-bold text-gray-900 mb-3">{{ result.price }}</p>

          <div class="flex items-center space-x-3 mb-2">
            <div
              v-if="result.passport !== null"
              class="flex items-center space-x-1"
            >
              <div
                class="w-6 h-6 bg-brand-aqua rounded flex items-center justify-center"
              >
                <Icon name="i-heroicons-check" class="w-4 h-4 text-white" />
              </div>
              <span
                v-if="result.passport > 0"
                class="bg-brand-aqua text-white px-2 py-1 rounded text-xs font-medium"
                >{{ result.passport }}%</span
              >
              <span
                v-else
                class="bg-brand-aqua text-white px-2 py-1 rounded text-xs font-medium"
                >0%</span
              >
            </div>

            <div class="flex items-center space-x-1 text-brand-aqua">
              <Icon name="i-heroicons-building-office" class="w-4 h-4" />
              <span class="text-sm">{{ result.bedrooms }}</span>
            </div>

            <div class="flex items-center space-x-1 text-brand-aqua">
              <Icon name="i-heroicons-home" class="w-4 h-4" />
              <span class="text-sm">{{ result.bathrooms }}</span>
            </div>

            <span class="bg-brand-aqua text-white px-2 py-1 rounded text-xs">{{
              result.type
            }}</span>
          </div>

          <div class="flex items-center text-brand-aqua text-sm">
            <Icon name="i-heroicons-squares-2x2" class="w-4 h-4 mr-1" />
            <span>{{ result.sqft }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div
      class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 p-4"
    >
      <div class="flex space-x-3">
        <button
          class="flex-1 bg-brand-aqua text-white py-3 rounded-xl font-medium flex items-center justify-center"
        >
          <Icon name="i-heroicons-bars-3-bottom-left" class="w-5 h-5 mr-2" />
          List
        </button>
        <button
          class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center"
        >
          <Icon name="i-heroicons-map" class="w-5 h-5 mr-2" />
          Map
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  query: String,
  results: Array,
})

defineEmits(['close', 'show-filters'])
</script>
