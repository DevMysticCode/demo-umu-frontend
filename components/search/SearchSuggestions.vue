<template>
  <div class="mobile-container bg-white min-h-screen">
    <AppHeader
      title="Explore"
      :showBack="true"
      right="profile"
      isOverlay
      @back="$emit('close')"
    />
    <!-- Search Input -->
    <div class="px-4 mb-4">
      <div class="flex items-center bg-gray-50 rounded-xl px-4 py-3">
        <Icon
          name="i-heroicons-magnifying-glass"
          class="w-5 h-5 text-gray-400 mr-3"
        />
        <input
          v-model="localQuery"
          type="text"
          placeholder="City, area or postcode"
          class="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none"
        />
        <div
          class="w-10 h-10 bg-brand-aqua rounded-xl flex items-center justify-center"
        >
          <Icon name="i-heroicons-bars-3" class="w-5 h-5 text-white" />
        </div>
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
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center"
        >
          <Icon name="i-heroicons-pencil" class="w-4 h-4 mr-1" />
          Draw on Maps
        </button>
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
        >
          Property
        </button>
      </div>
    </div>

    <!-- Search Suggestions -->
    <div class="px-4">
      <div class="flex items-center mb-4">
        <Icon name="i-heroicons-sparkles" class="w-5 h-5 text-gray-400 mr-2" />
        <h2 class="text-lg font-medium text-gray-600">Search Suggestions</h2>
      </div>

      <div class="space-y-3">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          @click="handleSelect(suggestion.address)"
          class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50"
        >
          <div>
            <h3 class="font-medium text-gray-900">{{ suggestion.address }}</h3>
            <p class="text-sm text-gray-600">{{ suggestion.area }}</p>
          </div>
          <Icon
            name="i-heroicons-chevron-right"
            class="w-5 h-5 text-gray-400"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '~/components/core/AppHeader.vue'
const props = defineProps({
  query: String,
})

const emit = defineEmits(['search', 'close'])
const handleSelect = (value) => {
  emit('search', value) // Then open SearchResults
}
const localQuery = ref(props.query)

const suggestions = ref([
  {
    id: 1,
    address: '22, Elm Road',
    area: 'Teddington, Middlesex TW11 8EA',
  },
  {
    id: 2,
    address: '14, Maple Avenue',
    area: 'Twickenham, London TW1 4AL',
  },
  {
    id: 3,
    address: '78, Station Road',
    area: 'Staines-upon-Thames, Surrey TW18 4HW',
  },
])
</script>
