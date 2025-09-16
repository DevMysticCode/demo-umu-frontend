<template>
  <UButton
    @click="handleBack"
    variant="ghost"
    :class="[
      'flex items-center space-x-1 px-0 hover:bg-transparent back_button',
      colorClass,
      customClass,
    ]"
  >
    <OPIcon name="leftChevron" class="w-[15px] h-[15px]" />
    <span :class="['text-base font-medium text-brand-aqua', colorClass]"
      >Back</span
    >
  </UButton>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import OPIcon from '@/components/OPIcon.vue'

const emit = defineEmits(['back'])

const props = defineProps({
  color: {
    type: String,
    default: 'black', // default color
  },
  customClass: {
    type: String,
    default: '', // optional extra classes
  },
})

// ✅ build Tailwind text class dynamically
const colorClass = computed(() => `text-${props.color}`)

function handleBack() {
  emit('back')
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
  }
}
</script>
