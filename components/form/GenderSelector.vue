<template>
  <div>
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="gender-selector">
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
