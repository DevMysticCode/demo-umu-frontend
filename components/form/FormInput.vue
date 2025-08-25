<template>
  <div>
    <label v-if="label" class="form-label">{{ label }}</label>
    <input
      :value="modelValue"
      @input="handleInput"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="form-input-field"
      :class="{ 'form-input--disabled': disabled }"
    />
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
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>
