<template>
  <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">All Filters</h2>
      <button
        @click="$emit('close')"
        class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
      >
        <Icon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-600" />
      </button>
    </div>

    <div class="p-4">
      <!-- Explore Section -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center">
          <Icon name="i-heroicons-map-pin" class="w-5 h-5 text-gray-400 mr-2" />
          <span class="text-gray-600">Explore</span>
        </div>
        <button class="text-brand-aqua font-medium">RESET</button>
      </div>

      <!-- Ready to sell / Published Passports -->
      <div class="flex space-x-3 mb-8">
        <button
          :class="
            selectedExploreType === 'ready-to-sell'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700'
          "
          @click="selectedExploreType = 'ready-to-sell'"
          class="px-6 py-3 rounded-xl font-medium"
        >
          Ready to sell
        </button>
        <button
          :class="
            selectedExploreType === 'published-passports'
              ? 'bg-brand-aqua text-white'
              : 'bg-gray-100 text-gray-700'
          "
          @click="selectedExploreType = 'published-passports'"
          class="px-6 py-3 rounded-xl font-medium"
        >
          Published Passports
        </button>
      </div>

      <!-- Price Range -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <Icon
              name="i-heroicons-banknotes"
              class="w-5 h-5 text-gray-400 mr-2"
            />
            <span class="text-gray-600">Price Range</span>
          </div>
          <button class="text-brand-aqua font-medium">RESET</button>
        </div>

        <!-- Price Tags -->
        <div class="flex space-x-2 mb-4">
          <span
            class="bg-brand-aqua bg-opacity-20 text-brand-aqua px-3 py-1 rounded-full text-sm"
            >£100K</span
          >
          <span
            class="bg-brand-aqua bg-opacity-20 text-brand-aqua px-3 py-1 rounded-full text-sm"
            >£200K</span
          >
        </div>

        <!-- Price Slider -->
        <div class="relative mb-4">
          <div class="w-full h-2 bg-gray-200 rounded-full">
            <div
              class="h-2 bg-brand-aqua rounded-full"
              :style="{ width: priceRangeWidth + '%' }"
            ></div>
          </div>
          <div class="flex justify-between mt-2 text-sm text-gray-600">
            <span>50K</span>
            <span>100K</span>
            <span>150K</span>
            <span>200K</span>
            <span>250K</span>
            <span>300K</span>
            <span>350K+</span>
          </div>
        </div>

        <!-- Min/Max Inputs -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <span class="text-brand-aqua font-medium">Min</span>
          </div>
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <span class="text-brand-aqua font-medium">Max</span>
          </div>
        </div>
      </div>

      <!-- Property Type -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <Icon
              name="i-heroicons-building-office"
              class="w-5 h-5 text-gray-400 mr-2"
            />
            <span class="text-gray-600">Property Type</span>
          </div>
          <button class="text-brand-aqua font-medium">RESET</button>
        </div>

        <!-- Property Type Options -->
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="type in propertyTypes"
            :key="type"
            :class="
              selectedPropertyTypes.includes(type)
                ? 'bg-brand-aqua text-white'
                : 'bg-gray-100 text-gray-700'
            "
            @click="togglePropertyType(type)"
            class="px-4 py-3 rounded-xl font-medium text-sm"
          >
            {{ type }}
          </button>
        </div>
      </div>
    </div>

    <!-- Apply Button -->
    <div class="p-4 border-t border-gray-200">
      <button
        @click="applyFilters"
        class="w-full bg-brand-aqua text-white py-4 rounded-xl font-medium text-lg"
      >
        Apply Filters
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close', 'apply'])

// State
const selectedExploreType = ref('ready-to-sell')
const priceRangeWidth = ref(40)
const selectedPropertyTypes = ref(['Any'])

const propertyTypes = [
  'Any',
  'Detached',
  'Semi-Detached',
  'Terraced',
  'Flat',
  'Maisonette',
  'Bungalow',
  'Mobile Home',
  'Boat',
  'Parking',
  'Land',
]

// Methods
const togglePropertyType = (type) => {
  if (type === 'Any') {
    selectedPropertyTypes.value = ['Any']
  } else {
    const index = selectedPropertyTypes.value.indexOf(type)
    if (index > -1) {
      selectedPropertyTypes.value.splice(index, 1)
    } else {
      selectedPropertyTypes.value = selectedPropertyTypes.value.filter(
        (t) => t !== 'Any'
      )
      selectedPropertyTypes.value.push(type)
    }

    if (selectedPropertyTypes.value.length === 0) {
      selectedPropertyTypes.value = ['Any']
    }
  }
}

const applyFilters = () => {
  const filters = {
    exploreType: selectedExploreType.value,
    propertyTypes: selectedPropertyTypes.value,
    priceRange: priceRangeWidth.value,
  }
  emit('apply', filters)
}
</script>
