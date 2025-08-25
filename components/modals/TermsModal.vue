<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="handleClose"
    title="Terms and Conditions"
    large
  >
    <div class="space-y-4 text-sm">
      <div>
        <h4 class="font-semibold mb-2">Terms of Business</h4>
        <p class="text-gray-600 mb-2">Last updated: 4th July 2025</p>
      </div>

      <div>
        <h4 class="font-semibold mb-2">1. Introduction</h4>
        <p class="text-gray-600">
          Welcome to OpenProperty and UmovingU. These Terms of Business
          ("Terms") govern your use of our websites, mobile applications, and
          related services (collectively, "Services"). By using our Services,
          you agree to be bound by these Terms.
        </p>
      </div>

      <div>
        <h4 class="font-semibold mb-2">2. Our Services</h4>
        <p class="text-gray-600">
          OpenProperty provides digital infrastructure and tools for managing,
          sharing, and accessing property-related information. UmovingU is a
          consumer-focused application that helps users prepare their property
          data for transactions.
        </p>
      </div>
    </div>

    <template #footer>
      <button @click="acceptTerms" class="form-button form-button--primary">
        I Agree
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '../ui/BaseModal.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'accept', 'close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const acceptTerms = () => {
  emit('accept')
}
</script>
