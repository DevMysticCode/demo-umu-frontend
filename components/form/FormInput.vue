<template>
  <div class="form-input">
    <label v-if="label" class="form-input__label">{{ label }}</label>
    <input
      :value="modelValue"
      @input="handleInput"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="form-input__field"
      :class="{ 'form-input__field--disabled': disabled }"
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

<style scoped>
/* Form Input Component - BEM CSS */
.form-input {
  @apply flex flex-col mb-4 p-0 border-0 bg-transparent;
}

.form-input__label {
  @apply text-[16px] text-gray-600 mb-2;
}

.form-input__field {
  @apply w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200;
}

.form-input__field:focus {
  @apply outline-none border-brand-aqua ring-2 ring-brand-aqua/20;
}

.form-input__field--disabled {
  @apply bg-gray-50 text-gray-500 cursor-not-allowed;
}

/* Override any conflicting styles */
.form-input__field {
  font-size: 16px;
  line-height: 1.5;
}

.form-input__field::placeholder {
  color: #9ca3af;
  opacity: 1;
}
</style>
