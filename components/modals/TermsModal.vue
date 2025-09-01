<template>
  <BaseModal
    :model-value="show"
    @update:model-value="handleClose"
    title="UMU Terms & Conditions"
    subtitle="Last updated: 4th July 2025"
  >
    <div class="terms-content">
      <div class="space-y-4 text-[17px]">
        <div
          v-for="section in termsSections"
          :key="section.id"
          class="term-section"
        >
          <h4 class="font-semibold mb-2">{{ section.title }}</h4>
          <p class="text-gray-600">{{ section.content }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="page__bottom">
        <button @click="acceptTerms" class="w-100 page__button">I Agree</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '../ui/BaseModal.vue'
import { useTermsData } from '@/composables/useTermsData'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:show', 'accept', 'close'])

const { termsSections } = useTermsData()

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const acceptTerms = () => {
  emit('accept')
  emit('update:show', false)
}
</script>

<style scoped>
.terms-content {
  max-height: 400px;
  overflow-y: auto;
}

/* Button styles to match your design system */
.modal-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.modal-button--primary {
  background-color: #00a19a;
  color: white;
}

.modal-button--primary:hover {
  background-color: #00857f;
}

/* Scrollbar styling for terms content */
.terms-content::-webkit-scrollbar {
  width: 4px;
}

.terms-content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.terms-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.terms-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.page__bottom {
  @apply w-full bottom-0;
}

.page__button {
  @apply w-full h-14 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-semibold text-lg rounded-xl transition-colors shadow-lg;
}
</style>
