<template>
  <div class="password-input">
    <label v-if="label" class="password-input__label" :for="name">{{
      label
    }}</label>
    <div class="password-input__container">
      <input
        :id="name"
        :name="name"
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
        <OPIcon
          v-if="showPassword"
          name="passwordHide"
          class="w-[17px] h-[17px]"
        />
        <OPIcon v-else name="passwordShow" class="w-[17px] h-[17px]" />
      </button>
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
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const showPassword = ref(false)

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
/* Password Input Component - BEM CSS */
.password-input {
  @apply flex flex-col mb-6;
}

.password-input__label {
  @apply mb-2;
  color: rgba(60, 60, 67, 0.6);
  font-size: 16px;
}

.password-input__container {
  @apply relative;
}

.password-input__field {
  @apply w-full pr-12 bg-white border placeholder-gray-400 transition-all duration-200;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: -0.43px;
  color: #353b45;
  height: 56px;
  min-height: 56px;
  border-radius: 16px;
  border: 0.33px solid rgba(60, 60, 67, 0.18);
  padding: 0 12px 0 16px;
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
