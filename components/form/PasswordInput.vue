<template>
  <div>
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="password-input">
      <input
        :value="modelValue"
        @input="handleInput"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :disabled="disabled"
        class="form-input pr-12"
        :class="{ 'form-input--disabled': disabled }"
      />
      <button
        @click="togglePassword"
        type="button"
        class="password-input__toggle"
      >
        <Icon
          :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
          class="w-5 h-5"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
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
