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

    <!-- Enhanced Search Input with Voice -->
    <div class="px-4 mb-6 mt-2">
      <div
        class="flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200"
      >
        <Icon
          name="i-heroicons-magnifying-glass"
          class="w-5 h-5 text-gray-400 mr-3"
        />
        <input
          v-model="localQuery"
          @input="updateQuery"
          type="text"
          placeholder="City, area or postcode"
          class="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none"
        />
        <!-- Voice Search Button -->
        <button
          v-if="isVoiceSupported"
          @click="toggleVoiceSearch"
          type="button"
          :class="[
            'flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-200 transition',
            { 'bg-brand-aqua text-white animate-pulse': isVoiceListening },
          ]"
          :title="isVoiceListening ? 'Listening...' : 'Click to speak'"
        >
          <Icon
            :name="
              isVoiceListening
                ? 'i-heroicons-microphone-solid'
                : 'i-heroicons-microphone'
            "
            class="w-5 h-5"
          />
        </button>
      </div>
    </div>

    <!-- Voice Feedback -->
    <transition name="fade">
      <p v-if="isVoiceListening" class="px-4 mb-4 text-sm text-brand-aqua">
        <span class="inline-block animate-pulse">🎤 Listening...</span>
      </p>
    </transition>

    <!-- Filter Tabs -->
    <div class="px-4 mb-6 overflow-x-auto pb-2">
      <div class="flex gap-2 whitespace-nowrap">
        <button
          @click="filterType = 'all'"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium flex items-center transition',
            filterType === 'all'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          <Icon name="i-heroicons-map-pin" class="w-4 h-4 mr-1" />
          Current Location
        </button>
        <button
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium flex items-center transition',
            filterType === 'map'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          <Icon name="i-heroicons-pencil" class="w-4 h-4 mr-1" />
          Draw on Maps
        </button>
        <button
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition',
            filterType === 'property'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          Property
        </button>
      </div>
    </div>

    <!-- Recent Searches Section -->
    <div v-if="!localQuery && recentSearches.length > 0" class="px-4 mb-8">
      <div class="flex items-center mb-4">
        <Icon name="i-heroicons-clock" class="w-5 h-5 text-gray-400 mr-2" />
        <h2 class="text-lg font-semibold text-gray-900">Recent Searches</h2>
        <button
          @click="clearRecent"
          class="ml-auto text-sm text-brand-aqua hover:underline"
        >
          Clear
        </button>
      </div>

      <div class="space-y-2">
        <button
          v-for="search in recentSearches"
          :key="search"
          @click="handleSelect(search)"
          class="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition"
        >
          <Icon
            name="i-heroicons-arrow-up-left"
            class="w-4 h-4 text-gray-400 flex-shrink-0"
          />
          <span class="text-gray-700">{{ search }}</span>
        </button>
      </div>
    </div>

    <!-- Search Suggestions -->
    <div v-if="suggestions.length > 0" class="px-4 mb-8">
      <div class="flex items-center mb-4">
        <Icon name="i-heroicons-sparkles" class="w-5 h-5 text-gray-400 mr-2" />
        <h2 class="text-lg font-semibold text-gray-900">
          {{ localQuery ? 'Search Results' : 'Popular Postcodes' }}
        </h2>
      </div>

      <div class="space-y-3">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          @click="handleSelect(suggestion.postcode)"
          class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-brand-aqua hover:shadow-md cursor-pointer transition"
        >
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900">
              {{ suggestion.address }}
            </h3>
            <p class="text-sm text-gray-500">{{ suggestion.area }}</p>
            <p class="text-xs text-gray-400 mt-1">
              📍 {{ suggestion.postcode }}
            </p>
          </div>
          <Icon
            name="i-heroicons-chevron-right"
            class="w-5 h-5 text-gray-300 ml-2 flex-shrink-0"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!localQuery && suggestions.length === 0"
      class="px-4 py-12 text-center"
    >
      <div
        class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
      >
        <Icon
          name="i-heroicons-magnifying-glass"
          class="w-8 h-8 text-gray-400"
        />
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        Search for a postcode
      </h3>
      <p class="text-sm text-gray-600">
        Enter a UK postcode or area name to start exploring properties
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import AppHeader from '~/components/core/AppHeader.vue'
import { useVoiceSearch } from '~/composables/useVoiceSearch'

const props = defineProps({
  query: String,
})

const emit = defineEmits(['search', 'close'])

const {
  isListening: isVoiceListening,
  finalTranscript,
  startListening,
  stopListening,
  resetTranscript,
  isSupported: isVoiceSupported,
} = useVoiceSearch()

const localQuery = ref(props.query || '')
const filterType = ref('all')
const recentSearches = ref([
  'Kingston upon Thames',
  'Twickenham',
  'Walton on Thames',
])

// Mock UK postcode suggestions
const mockSuggestions = ref([
  {
    id: 1,
    address: '22, Elm Road',
    area: 'Teddington, Middlesex',
    postcode: 'TW11 8EA',
  },
  {
    id: 2,
    address: '14, Maple Avenue',
    area: 'Twickenham, London',
    postcode: 'TW1 4AL',
  },
  {
    id: 3,
    address: '78, Station Road',
    area: 'Staines-upon-Thames, Surrey',
    postcode: 'TW18 4HW',
  },
  {
    id: 4,
    address: '45, High Street',
    area: 'Kingston-upon-Thames, Surrey',
    postcode: 'KT1 1AT',
  },
  {
    id: 5,
    address: '102, Church Lane',
    area: 'Walton-on-Thames, Surrey',
    postcode: 'KT12 1QN',
  },
  {
    id: 6,
    address: '56, Park Avenue',
    area: 'Richmond, London',
    postcode: 'TW10 6RD',
  },
])

// Filter suggestions based on query
const suggestions = computed(() => {
  if (!localQuery.value) {
    return mockSuggestions.value
  }

  const query = localQuery.value.toLowerCase()
  return mockSuggestions.value.filter(
    (s) =>
      s.address.toLowerCase().includes(query) ||
      s.area.toLowerCase().includes(query) ||
      s.postcode.toLowerCase().includes(query),
  )
})

const updateQuery = (e: Event) => {
  const target = e.target as HTMLInputElement
  localQuery.value = target.value
}

const handleSelect = (value: string) => {
  // Add to recent searches
  if (!recentSearches.value.includes(value)) {
    recentSearches.value.unshift(value)
    if (recentSearches.value.length > 5) {
      recentSearches.value.pop()
    }
  }
  emit('search', value)
}

const clearRecent = () => {
  recentSearches.value = []
}

const toggleVoiceSearch = () => {
  if (isVoiceListening.value) {
    stopListening()
  } else {
    resetTranscript()
    startListening()
  }
}

// Watch voice transcript and update query
watch(finalTranscript, (newTranscript) => {
  if (newTranscript) {
    localQuery.value = newTranscript
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
