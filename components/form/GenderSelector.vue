<template>
  <div class="gender-selector">
    <label v-if="label" class="gender-selector__label">{{ label }}</label>
    <div class="gender-selector__options">
      <label
        v-for="option in options"
        :key="option.value"
        class="gender-selector__option"
        :class="{
          'gender-selector__option--selected': selected === option.value,
          'gender-selector__option--unselected': selected !== option.value,
        }"
      >
        <input
          type="radio"
          :name="name"
          :value="option.value"
          v-model="selected"
          class="hidden"
        />
        {{ option.label }}
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
})

const selected = ref('')
const options = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]
</script>

<style scoped>
/* Gender Selector Component - BEM CSS */
.gender-selector {
  @apply flex flex-col mb-4;
}

.gender-selector__label {
  @apply text-sm font-medium text-gray-600 mb-2;
}

.gender-selector__options {
  @apply grid grid-cols-3 gap-2;
}

.gender-selector__option {
  @apply h-12 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-base font-medium cursor-pointer transition-all duration-200 select-none;
}

.gender-selector__option--selected {
  @apply bg-brand-aqua border-brand-aqua text-white;
}

.gender-selector__option--unselected {
  @apply text-gray-600 hover:border-brand-aqua hover:text-brand-aqua;
}

.gender-selector__option input {
  display: none;
}
</style>
