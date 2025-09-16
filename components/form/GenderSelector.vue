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
  @apply flex flex-col mb-6;
}

.gender-selector__label {
  @apply font-medium mb-2;
  color: rgba(60, 60, 67, 0.6);
}

.gender-selector__options {
  @apply grid grid-cols-3 gap-2;
}

.gender-selector__option {
  @apply flex items-center justify-center bg-white border text-base cursor-pointer transition-all duration-200 select-none;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px; /* 129.412% */
  letter-spacing: -0.43px;
  color: #353b45;
  height: 56px;
  min-height: 56px;
  border-radius: 16px;
  border: 0.33px solid rgba(60, 60, 67, 0.18);
}

.gender-selector__option--selected {
  @apply bg-brand-aqua border-brand-aqua text-white;
}

.gender-selector__option--unselected {
  @apply hover:border-brand-aqua hover:text-brand-aqua;
  color: #353b45;
}

.gender-selector__option input {
  display: none;
}
</style>
