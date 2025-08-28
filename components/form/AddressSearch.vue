<template>
  <div class="address-search">
    <label v-if="label" class="address-search__label">{{ label }}</label>
    <div class="address-search__container relative w-full">
      <input
        :value="modelValue"
        @input="handleInput"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        class="address-search__input pr-28"
        :class="{ 'address-search__input--disabled': disabled }"
      />
      <button
        @click="handleSearch"
        type="button"
        class="address-search__button absolute top-1/2 right-2 -translate-y-1/2"
        :disabled="isSearching || disabled"
      >
        <svg
          class="address-search__icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span>{{ isSearching ? 'Searching...' : 'Search' }}</span>
      </button>
    </div>

    <!-- Selected Address Display -->
    <div v-if="selectedAddress" class="address-search__display">
      <div class="address-search__display-content">
        <div class="address-search__display-details">
          <p class="address-search__display-line1">
            {{ selectedAddress.line1 }}
          </p>
          <p class="address-search__display-line2">
            {{ selectedAddress.line2 }}
          </p>
        </div>
        <button
          @click="handleEdit"
          type="button"
          class="address-search__display-edit"
        >
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

<style scoped>
/* Address Search Component - BEM CSS */
.address-search {
  @apply flex flex-col mb-4;
}

.address-search__label {
  @apply text-sm font-medium text-gray-600 mb-2;
}

.address-search__container {
  @apply flex items-center gap-2 px-0;
  margin-left: 0 !important;
}

.address-search__input {
  @apply w-full h-12 pl-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200;
  font-size: 16px;
  line-height: 1.5;
}

.address-search__input:focus {
  @apply outline-none border-brand-aqua ring-2 ring-brand-aqua/20;
}

.address-search__input::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.address-search__input--disabled {
  @apply bg-gray-50 text-gray-500 cursor-not-allowed;
}

.address-search__button {
  @apply flex items-center gap-1 h-9 px-3 bg-teal-100 text-teal-600 rounded-full font-medium text-sm cursor-pointer transition-all duration-200;
}

.address-search__button:hover:not(:disabled) {
  @apply bg-brand-aqua/90 text-white;
}

.address-search__button:disabled {
  @apply opacity-60 cursor-not-allowed;
}

.address-search__icon {
  @apply w-4 h-4;
}

.address-search__display {
  @apply mt-3 p-4 bg-blue-50 border border-blue-100 rounded-xl;
  margin-left: 0 !important;
}

.address-search__display-content {
  @apply flex justify-between items-start;
}

.address-search__display-details {
  @apply flex-1;
}

.address-search__display-line1 {
  @apply text-sm font-medium text-gray-900 mb-1;
}

.address-search__display-line2 {
  @apply text-sm text-gray-600;
}

.address-search__display-edit {
  @apply bg-transparent border-0 text-brand-aqua font-medium text-sm cursor-pointer p-1 transition-colors duration-200;
}

.address-search__display-edit:hover {
  @apply text-brand-aqua/80;
}
</style>
