<template>
  <div class="phone-input">
    <label v-if="label" class="phone-input__label">{{ label }}</label>
    <div class="phone-input__container">
      <VueTelInput
        mode="international"
        :model-value="modelValue"
        @update:model-value="onInput"
        :disabled="disabled"
        :inputoptions="{
          inputClasses:
            'w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua',
          showDialCode: true,
          showDialCodeInSelection: true,
          returnType: 'string',
        }"
        class="w-full"
        :wrapper-options="{ wrapperClasses: 'rounded-xl' }"
        :placeholder="placeholder"
      />
    </div>
  </div>
</template>

<script setup>
import { VueTelInput } from 'vue3-tel-input'

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

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

function onInput(val) {
  console.log('PhoneInput.vue onInput val:', val)
  let value = ''
  if (typeof val === 'object' && val !== null) {
    value = val.number || ''
  } else if (typeof val === 'string') {
    value = val
  }
  emit('update:modelValue', value || '')
}
</script>

<style scoped>
/* Phone Input Component - BEM CSS */
.phone-input {
  @apply flex flex-col mb-4;
}

.phone-input__label {
  @apply text-sm font-medium text-gray-600 mb-2;
}

.phone-input__container {
  @apply flex items-center;
}

.phone-input__country {
  @apply flex items-center h-12 px-3 bg-white border border-gray-200 border-r-0 rounded-l-xl gap-2;
}

.phone-input__flag {
  @apply text-lg;
}

.phone-input__code {
  @apply text-base text-gray-900 font-medium;
}

.phone-input__field {
  @apply flex-1 h-12 px-4 bg-white border border-gray-200 rounded-r-xl text-gray-900 placeholder-gray-400 transition-all duration-200;
  font-size: 16px;
  line-height: 1.5;
}

.phone-input__field:focus {
  @apply outline-none border-brand-aqua ring-2 ring-brand-aqua/20;
}

.phone-input__field:focus + .phone-input__country {
  @apply border-brand-aqua;
}

.phone-input__field::placeholder {
  color: #9ca3af;
  opacity: 1;
}

.phone-input__field--disabled {
  @apply bg-gray-50 text-gray-500 cursor-not-allowed;
}

.phone-input__field--disabled + .phone-input__country {
  @apply bg-gray-50;
}

.vue-tel-input {
  @apply flex-1 h-12 px-4 bg-white border border-gray-200 rounded-r-xl text-gray-900 placeholder-gray-400 transition-all duration-200;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  background: transparent !important;
  width: 100% !important;
  display: flex !important;
  align-items: stretch !important;
  font-size: 16px;
  line-height: 1.5;
}

.vue-tel-input .vti__dropdown {
  border-radius: 0.75rem 0 0 0.75rem !important; /* Only left corners */
  height: 3rem !important;
  background: #fff !important;
  border: 0 !important;
  box-shadow: none !important;
  align-items: center !important;
  display: flex !important;
  margin-right: 0 !important;
  padding-right: 0 !important;
}

.vue-tel-input .vti__input {
  height: 3rem !important;
  background: #fff !important;
  color: #1a202c !important;
  border-radius: 0 0.75rem 0.75rem 0 !important; /* Only right corners */
  padding-left: 1rem !important;
  padding-right: 1rem !important;
  border: 0 !important;
  box-shadow: none !important;
  font-size: 1rem !important;
  margin-left: 0 !important;
}

.vue-tel-input,
.vue-tel-input .vti__input:focus {
  @apply outline-none border-brand-aqua ring-2 ring-brand-aqua/20;
}

.vue-tel-input .vti__selected-flag {
  height: 3rem !important;
  display: flex !important;
  align-items: center !important;
}

.vue-tel-input .vti__dropdown.open,
.vue-tel-input .vti__dropdown:focus,
.vue-tel-input .vti__input:focus {
  outline: none !important;
  box-shadow: 0 0 0 2px #22d3ee !important;
  border: 0 !important;
}

.vue-tel-input .vti__dropdown,
.vue-tel-input .vti__input {
  border-right: 1px solid #e5e7eb !important; /* subtle divider */
}

.vue-tel-input .vti__input {
  border-right: none !important;
}

.vue-tel-input .vti__dropdown-list {
  border-radius: 0.75rem !important;
}

.vue-tel-input .vti__flag {
  margin-right: 0.5rem !important;
}

/* Remove any unwanted gap between dropdown and input */
.vue-tel-input .vti__dropdown {
  margin-right: 0 !important;
}
.vue-tel-input .vti__input {
  margin-left: 0 !important;
}
</style>
