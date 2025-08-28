<template>
  <div class="gender-selector">
    <label v-if="label" class="gender-selector__label">{{ label }}</label>
    <div class="gender-selector__options">
      <button
        v-for="option in options"
        :key="option.value"
        @click="selectGender(option.value)"
        type="button"
        class="gender-selector__option"
        :class="{
          'gender-selector__option--selected': modelValue === option.value,
          'gender-selector__option--unselected': modelValue !== option.value,
        }"
      >
        {{ option.label }}
      </button>
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
})

const emit = defineEmits(['update:modelValue'])

const options = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
]

const selectGender = (value) => {
  emit('update:modelValue', value)
}
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
  @apply h-12 bg-white border border-gray-200 rounded-xl text-base font-medium cursor-pointer transition-all duration-200;
}

.gender-selector__option--selected {
  @apply bg-brand-aqua border-brand-aqua text-white;
}

.gender-selector__option--unselected {
  @apply text-gray-600 hover:border-brand-aqua hover:text-brand-aqua;
}

.gender-selector__option:focus {
  @apply outline-none ring-2 ring-brand-aqua/20;
}
</style>
