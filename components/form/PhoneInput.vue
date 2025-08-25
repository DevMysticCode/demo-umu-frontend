<template>
  <div>
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="phone-input">
      <VueTelInput
        mode="international"
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
        :disabled="disabled"
        :inputoptions="{
          inputClasses:
            'w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua',
          showDialCode: true,
          showDialCodeInSelection: true,
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
defineProps({
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
</script>

<style>
.vue-tel-input {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  background: transparent !important;
  width: 100% !important;
  display: flex !important;
  align-items: stretch !important;
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
