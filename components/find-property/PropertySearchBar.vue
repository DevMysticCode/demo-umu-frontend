<template>
  <div class="property-search">
    <div class="property-search__container">
      <span class="property-search__icon"
        ><img src="/public/icons/House-Plus.png"
      /></span>
      <input
        :value="modelValue"
        @input="handleInput"
        type="text"
        :placeholder="placeholder"
        class="property-search__input"
      />
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

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

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
  @apply w-full h-12 pl-12 pr-20 bg-transparent border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-aqua;
}

.property-search__button {
  @apply absolute right-2 h-8 px-4 bg-purple-main text-white rounded-lg font-medium text-sm hover:bg-purple-main/90 transition-colors;
}
</style>
