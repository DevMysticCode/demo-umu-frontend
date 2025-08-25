<template>
  <div>
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="address-search relative">
      <input
        :value="modelValue"
        @input="handleInput"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="form-input-postcode flex-1"
        :class="{ 'form-input--disabled': disabled }"
      />
      <button
        @click="handleSearch"
        type="button"
        class="form-button-postcode-search text-white"
        :disabled="isSearching"
      >
        <img
          src="/public/icons/searchButton.svg"
          alt="Search Icon"
          class="w-5 h-5 mr-1"
        />
        <span>{{ isSearching ? 'Searching...' : 'Search' }}</span>
      </button>
    </div>

    <!-- Selected Address Display -->
    <div v-if="selectedAddress" class="address-display mt-4">
      <div class="address-display__content">
        <div class="address-display__details">
          <p class="address-display__line1">{{ selectedAddress.line1 }}</p>
          <p class="address-display__line2">{{ selectedAddress.line2 }}</p>
        </div>
        <button @click="handleEdit" type="button" class="address-display__edit">
          Edit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  isSearching: {
    type: Boolean,
    default: false,
  },
  selectedAddress: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'search', 'edit'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleSearch = () => {
  emit('search')
}

const handleEdit = () => {
  emit('edit')
}
</script>
