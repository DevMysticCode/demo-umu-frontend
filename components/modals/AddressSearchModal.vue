<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="handleClose"
    :title="`Search results for ${postcode}`"
  >
    <div class="modal__body">
      <div
        v-for="address in addresses"
        :key="address.id"
        @click="selectAddress(address)"
        class="address-result"
      >
        <p class="address-result__line1">{{ address.line1 }}</p>
        <p class="address-result__line2">{{ address.line2 }}</p>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '../ui/BaseModal.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  postcode: {
    type: String,
    default: '',
  },
  addresses: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'select', 'close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const selectAddress = (address) => {
  emit('select', address)
}
</script>
