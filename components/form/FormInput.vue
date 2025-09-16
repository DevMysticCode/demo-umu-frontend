<template>
  <div class="form-input">
    <label v-if="label" class="form-input__label" :for="name">{{
      label
    }}</label>
    <input
      :id="name"
      :name="name"
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
  name: {
    type: String,
    required: true,
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
</script>

<style scoped>
/* Form Input Component - BEM CSS */
.form-input {
  @apply flex flex-col mb-6 p-0 border-0 bg-transparent;
}

.form-input__label {
  @apply text-[16px] mb-2;
  color: rgba(60, 60, 67, 0.6);
}

.form-input__field {
  @apply w-full bg-white border placeholder-gray-400 transition-all duration-200 text-[17px];
  border-radius: 16px;
  padding: 16px;
  height: 56px;
  min-height: 56px;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: -0.43px;
  color: #000;
  border: 0.33px solid rgba(60, 60, 67, 0.18);
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
