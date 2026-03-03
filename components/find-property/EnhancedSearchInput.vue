<template>
  <div class="enhanced-search">
    <div class="enhanced-search__container">
      <!-- Search Icon -->
      <Icon name="i-heroicons-magnifying-glass" class="enhanced-search__icon" />

      <!-- Input Field -->
      <input
        :value="modelValue"
        @input="handleInput"
        @focus="$emit('focus')"
        type="text"
        :placeholder="placeholder"
        class="enhanced-search__input"
      />

      <!-- Voice Search Button -->
      <button
        v-if="isVoiceSupported"
        @click="toggleVoiceSearch"
        type="button"
        :class="[
          'enhanced-search__voice-btn',
          { 'enhanced-search__voice-btn--active': isVoiceListening },
        ]"
        :title="isVoiceListening ? 'Listening...' : 'Click to speak'"
        :disabled="isSearching"
      >
        <Icon
          :name="
            isVoiceListening
              ? 'i-heroicons-microphone-solid'
              : 'i-heroicons-microphone'
          "
          class="enhanced-search__voice-icon"
        />
      </button>

      <!-- Search/Send Button -->
      <button
        @click="handleSearch"
        type="button"
        class="enhanced-search__button"
        :disabled="isSearching || !modelValue.trim()"
        :title="isSearching ? 'Searching...' : 'Search'"
      >
        <Icon name="i-heroicons-arrow-right" class="w-5 h-5" />
      </button>
    </div>

    <!-- Voice Feedback Text -->
    <transition name="fade">
      <div
        v-if="isVoiceListening || voiceError"
        class="enhanced-search__feedback-wrapper"
      >
        <p v-if="isVoiceListening" class="enhanced-search__feedback">
          <span class="inline-block animate-pulse">🎤 Listening...</span>
        </p>
        <p v-if="voiceError" class="enhanced-search__error">
          {{ voiceError }}
        </p>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVoiceSearch } from '~/composables/useVoiceSearch'

interface Props {
  modelValue: string
  placeholder?: string
  isSearching?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'City, area or postcode',
  isSearching: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
  focus: []
}>()

const {
  isListening: isVoiceListening,
  finalTranscript,
  error: voiceError,
  startListening,
  stopListening,
  resetTranscript,
  isSupported: isVoiceSupported,
} = useVoiceSearch()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleSearch = () => {
  if (props.modelValue.trim()) {
    emit('search')
  }
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
    // Auto-search after voice input completes
    if (!isVoiceListening.value && newTranscript.trim()) {
      setTimeout(() => {
        emit('search')
      }, 300)
    }
  }
})
</script>

<style scoped>
/* Enhanced Search Container */
.enhanced-search {
  margin-bottom: 1.5rem;
}

.enhanced-search__container {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: 3.5rem;
}

.enhanced-search__icon {
  position: absolute;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.enhanced-search__input {
  width: 100%;
  height: 100%;
  padding-left: 3rem;
  padding-right: 8rem;
  background: transparent;
  border: none;
  border-radius: 1rem;
  color: #111827;
  font-size: 1rem;
}

.enhanced-search__input::placeholder {
  color: #d1d5db;
}

.enhanced-search__input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #06b6d4;
}

.enhanced-search__voice-btn {
  position: absolute;
  right: 3.5rem;
  height: 2.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.enhanced-search__voice-btn:hover {
  color: #06b6d4;
  background-color: rgba(6, 182, 212, 0.1);
}

.enhanced-search__voice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.enhanced-search__voice-btn--active {
  color: #06b6d4;
  background-color: rgba(6, 182, 212, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.enhanced-search__voice-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.enhanced-search__button {
  position: absolute;
  right: 0.5rem;
  height: 2.5rem;
  width: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #a855f7;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.enhanced-search__button:hover {
  background-color: #9333ea;
}

.enhanced-search__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.enhanced-search__feedback {
  font-size: 0.875rem;
  color: #06b6d4;
  margin-top: 0.5rem;
  margin-left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.enhanced-search__error {
  font-size: 0.875rem;
  color: #ef4444;
  margin-top: 0.5rem;
  margin-left: 1rem;
}

.enhanced-search__feedback-wrapper {
  display: contents;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
