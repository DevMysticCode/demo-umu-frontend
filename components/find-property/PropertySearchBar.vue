<template>
  <div class="property-search">
    <div class="property-search__container">
      <span class="property-search__icon"
        ><Icon
          name="i-heroicons-magnifying-glass"
          class="w-5 h-5 text-gray-400"
      /></span>
      <input
        :value="modelValue"
        @input="handleInput"
        type="text"
        :placeholder="placeholder"
        class="property-search__input"
      />
      <!-- Voice Search Button -->
      <button
        v-if="isVoiceSupported"
        @click="toggleVoiceSearch"
        type="button"
        :class="[
          'property-search__voice-btn',
          { 'property-search__voice-btn--active': isVoiceListening },
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
      <button
        @click="handleSearch"
        type="button"
        class="property-search__button"
        :disabled="isSearching"
      >
        {{ isSearching ? 'Searching...' : 'SEARCH' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVoiceSearch } from '~/composables/useVoiceSearch'

interface Props {
  modelValue: string
  placeholder?: string
  isSearching?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
}>()

const {
  isListening: isVoiceListening,
  finalTranscript,
  startListening,
  stopListening,
  resetTranscript,
  isSupported: isVoiceSupported,
} = useVoiceSearch()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const toggleVoiceSearch = () => {
  if (isVoiceListening.value) {
    stopListening()
  } else {
    resetTranscript()
    startListening()
  }
}

// Watch voice transcript and update model value
watch(finalTranscript, (newTranscript) => {
  if (newTranscript) {
    emit('update:modelValue', newTranscript)
  }
})

const handleSearch = () => {
  emit('search')
}
</script>

<style scoped>
/* Search Bar */
.property-search {
  @apply mb-8;
}

.property-search__container {
  @apply relative flex items-center bg-white rounded-xl shadow-sm;
}

.property-search__icon {
  @apply absolute left-4 w-5 h-5 text-gray-400;
}

.property-search__input {
  @apply w-full h-12 pl-12 pr-32 bg-transparent border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-aqua;
}

.property-search__voice-btn {
  @apply absolute right-28 h-8 w-8 flex items-center justify-center text-gray-400 hover:text-brand-aqua transition-colors;
}

.property-search__voice-btn--active {
  @apply text-brand-aqua animate-pulse;
}

.property-search__button {
  @apply absolute right-2 h-8 px-4 bg-purple-main text-white rounded-lg font-medium text-sm hover:bg-purple-main/90 transition-colors;
}
</style>
