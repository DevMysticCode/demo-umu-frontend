<template>
  <div class="password-input">
    <label v-if="label" class="password-input__label">{{ label }}</label>
    <div class="password-input__container">
      <input
        :value="modelValue"
        @input="handleInput"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        class="password-input__field"
        :class="{ 'password-input__field--disabled': disabled }"
      />
      <button
        @click="togglePassword"
        type="button"
        class="password-input__toggle"
        :disabled="disabled"
      >
        <svg
          v-if="showPassword"
          class="password-input__icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L8.464 8.464"
          />
        </svg>
        <svg
          v-else
          class="password-input__icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
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

const showPassword = ref(false)

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
/* Password Input Component - BEM CSS */
.password-input {
  @apply flex flex-col mb-4;
}

.password-input__label {
  @apply text-sm font-medium text-gray-600 mb-2;
}

.password-input__container {
  @apply relative;
}

.password-input__field {
  @apply w-full h-12 px-4 pr-12 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200;
  font-size: 16px;
  line-height: 1.5;
}

.password-input__field:focus {
  @apply outline-none border-brand-aqua ring-2 ring-brand-aqua/20;
}

.password-input__field::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.password-input__field--disabled {
  @apply bg-gray-50 text-gray-500 cursor-not-allowed;
}

.password-input__toggle {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-0 text-brand-aqua cursor-pointer p-1 transition-colors duration-200;
}

.password-input__toggle:hover:not(:disabled) {
  @apply text-gray-600;
}

.password-input__toggle:disabled {
  @apply cursor-not-allowed opacity-50;
}

.password-input__icon {
  @apply w-5 h-5;
}
</style>
