<template>
  <div class="continue-button">
    <button
      @click="$emit('continue')"
      :disabled="disabled"
      class="continue-button__btn font-17-medium"
    >
      Continue
      <span class="continue-button__icon"
        ><Icon name="i-heroicons-arrow-right" class="w-5 h-5 ml-2"
      /></span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['continue'])
</script>
