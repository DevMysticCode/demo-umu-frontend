<template>
  <div class="address-search">
    <label v-if="label" class="address-search__label" :for="name">{{
      label
    }}</label>
    <div class="address-search__container relative w-full">
      <input
        :id="name"
        :name="name"
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
        <OPIcon name="search" class="w-[15px] h-[15px]" />
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
import OPIcon from '@/components/OPIcon.vue'
defineProps({
  name: {
    type: String,
    required: true,
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

const emit = defineEmits(['search', 'edit'])

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
  @apply flex flex-col mb-6;
}

.address-search__label {
  @apply mb-2;
  color: rgba(60, 60, 67, 0.6);
  font-size: 16px;
}

.address-search__container {
  @apply flex items-center gap-2 px-0;
  margin-left: 0 !important;
}

.address-search__input {
  @apply w-full h-12 bg-white border placeholder-gray-400 transition-all duration-200;
  border-radius: 16px;
  border: 0.33px solid rgba(60, 60, 67, 0.18);
  padding: 0 12px 0 16px;
  height: 56px;
  min-height: 56px;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: -0.43px;
  color: #000;
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
  @apply flex items-center gap-1 h-9 text-brand-aqua rounded-full cursor-pointer transition-all duration-200;
  background-color: rgba(0, 161, 154, 0.1);
  font-size: 15px;
  padding-left: 12px;
  padding-right: 12px;
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
  /* @apply bg-transparent border-0 text-brand-aqua font-medium text-sm cursor-pointer p-1 transition-colors duration-200; */
  @apply flex items-center gap-1 h-9 text-brand-aqua rounded-full cursor-pointer transition-all duration-200;
  background-color: rgba(0, 161, 154, 0.1);
  font-size: 15px;
  padding-left: 12px;
  padding-right: 12px;
}

.address-search__display-edit:hover {
  @apply bg-brand-aqua/90 text-white;
}
</style>
