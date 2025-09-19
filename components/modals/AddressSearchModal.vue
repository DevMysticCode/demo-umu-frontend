<script setup>
import { ref, watch } from 'vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import ContinueButton from '@/components/ContinueButton.vue'
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  postcode: { type: String, default: '' },
  addresses: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:show', 'select', 'close', 'search'])

const selectedAddressId = ref(null)
const searchQuery = ref(props.postcode)

const getSelectedAddress = computed(() => {
  return props.addresses.find((a) => a.id === selectedAddressId.value) || null
})

// sync searchQuery with prop
watch(
  () => props.postcode,
  (newVal) => {
    searchQuery.value = newVal
  }
)

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const selectAddress = (address) => {
  selectedAddressId.value = address.id
}

const handleSearchInput = (event) => {
  searchQuery.value = event.target.value
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

// ✅ new function for continue
const handleContinue = (address) => {
  if (selectedAddressId.value) {
    emit('select', address) // keep selection emitted immediately
    handleClose()
  }
}
</script>

<template>
  <BaseDrawer
    :model-value="show"
    @update:model-value="emit('update:show', $event)"
    @close="handleClose"
    title="Search Address"
    subtitle="Select your address from the list or search again"
    :large="true"
  >
    <HeroSection
      iconName="addressSearch"
      iconClass="w-32 h-32"
      :mainTitle="`Showing results for ${postcode}`"
      subTitle="Please select your address from the list or modify your search below. "
    />

    <!-- Search Input -->
    <div class="address-modal__search">
      <div class="address-modal__search-container">
        <!-- Left Icon -->
        <svg
          class="address-modal__search-icon"
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

        <!-- Input -->
        <input
          :value="searchQuery"
          @input="handleSearchInput"
          type="text"
          class="address-modal__search-input"
          placeholder="Enter postcode"
        />

        <!-- Button -->
        <button @click="handleSearch" class="address-modal__search-button">
          <svg
            class="w-4 h-4"
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
          <span>Search</span>
        </button>
      </div>
    </div>

    <!-- Address Results -->
    <div class="address-modal__results">
      <div
        v-for="address in addresses"
        :key="address.id"
        @click="selectAddress(address)"
        class="address-modal__result"
        :class="{
          'address-modal__result--selected': selectedAddressId === address.id,
        }"
      >
        <div class="address-modal__radio">
          <div
            class="address-modal__radio-button"
            :class="{
              'address-modal__radio-button--selected':
                selectedAddressId === address.id,
            }"
          >
            <!-- No selection icon -->
            <OPIcon
              v-if="selectedAddressId !== address.id"
              name="radioUnchecked"
              class="w-[18px] h-[18px] text-white"
            />

            <!-- Selected icon -->
            <OPIcon
              v-else
              name="radioChecked"
              class="w-[18px] h-[18px] text-white"
            />
          </div>
        </div>

        <div class="address-modal__address">
          <p class="address-modal__address-text">{{ address.line1 }}</p>
        </div>
      </div>
    </div>

    <div class="continue_button_container">
      <ContinueButton
        :disabled="!selectedAddressId"
        @continue="handleContinue(getSelectedAddress)"
      />
    </div>
  </BaseDrawer>
</template>

<style scoped>
/* Address Search Modal - BEM CSS */
.address-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}
.address-modal__content {
  background-color: #f3f4f6;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
} /* Header */
.address-modal__header {
  padding: 2rem 1.5rem 1rem;
  text-align: center;
  background-color: #f3f4f6;
}
.address-modal__illustration {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}
.address-modal__books {
  font-size: 3rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}
.address-modal__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}
.address-modal__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
} /* Search Section */

.address-modal__search {
  padding-bottom: 24px;
}
.address-modal__search-container {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 9999px; /* pill shape */
  border: 1px solid #e5e7eb;
  padding-left: 2.5rem; /* space for left icon */
}
.address-modal__search-icon {
  position: absolute;
  left: 1rem;
  width: 1.2rem;
  height: 1.2rem;
  color: #00a19a; /* aqua */
}
.address-modal__search-input {
  flex: 1;
  height: 3rem;
  padding-right: 6rem; /* space for button */
  border: none;
  background: transparent;
  border-radius: 9999px;
  font-size: 1rem;
  color: #111827;
  outline: none;
}
.address-modal__search-input::placeholder {
  color: #9ca3af;
}
.address-modal__search-button {
  position: absolute;
  right: 0.25rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  height: 2.5rem;
  padding: 0 1rem;
  background-color: #e6f9f8; /* light aqua background */
  color: #00a19a; /* aqua text/icon */
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}
.address-modal__search-button:hover {
  background-color: rgba(6, 182, 212, 0.9);
} /* Results Section */
.address-modal__results {
  flex: 1;
  overflow-y: auto;
  background-color: white;
  /* margin: 0 1.5rem 1.5rem; */
  border-radius: 0.75rem;
  border: 0;
  margin-top: 24px;
  padding-bottom: 100px;
}
.address-modal__result {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  border-radius: 16px;
  border: 0.33px solid var(--Labels-Quaternary, rgba(60, 60, 67, 0.18));
  transition: background-color 0.2s;
  margin-top: 8px;
  background: #fff;
}
.address-modal__result:last-child {
  /* border-bottom: none; */
}
.address-modal__result:hover {
  background-color: #f9fafb;
}
.address-modal__result--selected {
  background-color: #f0f9ff;
} /* Radio Button */
.address-modal__radio {
  margin-right: 0.75rem;
  flex-shrink: 0;
}
.address-modal__radio-button {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}
.address-modal__radio-button--selected {
  border-color: #06b6d4;
}
.address-modal__radio-dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #06b6d4;
  border-radius: 50%;
} /* Address Text */
.address-modal__address {
  flex: 1;
}
.address-modal__address-text {
  font-size: 13px;
  color: #000;
  margin: 0;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: -0.08px;
} /* Scrollbar Styling */
.address-modal__results::-webkit-scrollbar {
  width: 4px;
}
.address-modal__results::-webkit-scrollbar-track {
  background: #f3f4f6;
}
.address-modal__results::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
.address-modal__results::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
.address-modal__illustration {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.continue_button_container {
  bottom: 0px;
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 0 0 0.75rem 0.75rem;
  position: fixed;
  background: transparent;
  left: 0;
}
</style>
