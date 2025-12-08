<template>
  <div class="umu-search">
    <div
      class="umu-search__container relative"
      :class="{ 'umu-search__container--focused': focused }"
    >
      <!-- Icon -->
      <Icon
        name="i-heroicons-magnifying-glass"
        class="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
      />

      <!-- Input -->
      <input
        v-model="model"
        @focus="handleFocus"
        @blur="focused = false"
        class="umu-search__input pl-12 pr-28"
        :placeholder="placeholder"
      />

      <!-- Button -->
      <button
        class="umu-search__button absolute right-2 top-1/2 -translate-y-1/2"
        :disabled="isSearching"
        @click="emit('search', model)"
      >
        <span>{{ isSearching ? 'Searching…' : buttonText }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: '' },
  buttonText: { type: String, default: 'Search' },
  isSearching: Boolean,
})

const emit = defineEmits(['update:modelValue', 'focus', 'search'])

const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const focused = ref(false)

const handleFocus = () => {
  focused.value = true
  emit('focus')
}
</script>

<style scoped>
/* Reuse the visual style from AddressSearch */
.umu-search__container {
  @apply bg-white rounded-full border border-gray-200;
  height: 56px;
  display: flex;
  align-items: center;
}

.umu-search__container--focused {
  @apply border-brand-aqua ring-2 ring-brand-aqua/20;
}

.umu-search__input {
  @apply w-full bg-transparent outline-none text-gray-900;
  font-size: 17px;
}

.umu-search__button {
  @apply bg-brand-aqua/10 text-brand-aqua rounded-full px-4 py-1 transition-all;
  font-size: 15px;
}

.umu-search__button:hover:not(:disabled) {
  @apply bg-brand-aqua text-white;
}
</style>
