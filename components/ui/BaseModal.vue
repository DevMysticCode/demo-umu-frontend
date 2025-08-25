<template>
  <div v-if="modelValue" class="modal" @click.self="handleClose">
    <div class="modal__content" :class="{ 'modal__content--large': large }">
      <div class="modal__header">
        <h3 class="modal__title">{{ title }}</h3>
        <button @click="handleClose" class="modal__close">✕</button>
      </div>
      <div class="modal__body">
        <slot />
      </div>
      <div v-if="$slots.footer" class="flex justify-end mt-6">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  large: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>
