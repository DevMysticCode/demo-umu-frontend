<template>
  <div v-if="modelValue" class="search-results-modal" @click.self="handleClose">
    <div class="search-results-modal__content">
      <div class="search-results-modal__header">
        <button @click="handleClose" class="search-results-modal__back">
          <span class="text-lg">←</span>
          <span class="ml-2 font-medium">Back</span>
        </button>
        <h3 class="search-results-modal__title">Search Results</h3>
        <div></div>
        <!-- Spacer for centering -->
      </div>

      <div class="search-results-modal__body">
        <div
          v-for="property in properties"
          :key="property.id"
          @click="selectProperty(property)"
          class="property-result"
          :class="{
            'property-result--selected': selectedPropertyId === property.id,
          }"
        >
          <div class="property-result__ic">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span class="property-result__address">{{ property.address }}</span>
          <span
            v-if="selectedPropertyId === property.id"
            class="property-result__check"
          >
            ✓
          </span>
        </div>
      </div>

      <div class="search-results-modal__footer">
        <button
          @click="handleContinue"
          :disabled="!selectedPropertyId"
          class="continue-button"
        >
          <span>✓</span>
          <span>Continue</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Property {
  id: number
  address: string
}

interface Props {
  modelValue: boolean
  properties: Property[]
  selectedPropertyId?: number | null
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [property: Property]
  continue: [property: Property]
  close: []
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const selectProperty = (property: Property) => {
  emit('select', property)
}

const handleContinue = () => {
  const selectedProperty = props.properties.find(
    (p) => p.id === props.selectedPropertyId
  )
  if (selectedProperty) {
    emit('continue', selectedProperty)
  }
}
</script>

<style scoped>
/* Search Results Modal */
.search-results-modal {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4;
}

.search-results-modal__content {
  @apply bg-white rounded-xl w-full max-w-sm max-h-96 flex flex-col;
}

.search-results-modal__header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.search-results-modal__back {
  @apply flex items-center text-gray-700 hover:text-gray-900 transition-colors;
}

.search-results-modal__title {
  @apply text-lg font-semibold text-gray-900;
}

.search-results-modal__body {
  @apply flex-1 overflow-y-auto p-4;
}

.search-results-modal__footer {
  @apply p-4 border-t border-gray-200;
}

/* Property Result Item */
.property-result {
  @apply p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-3;
}

.property-result--selected {
  @apply bg-brand-aqua/10 border-brand-aqua/20;
}

.property-result__ic {
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.property-result__address {
  @apply text-gray-900 font-medium flex-1;
}

.property-result--selected .property-result__address {
  @apply text-brand-aqua;
}

.property-result__check {
  @apply w-5 h-5 text-brand-aqua;
}

/* Continue Button */
.continue-button {
  @apply w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center space-x-2;
}

.continue-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>


