<template>
  <div v-if="modelValue" class="modal" @click.self="handleClose">
    <div class="modal__content" :class="{ 'modal__content--large': large }">
      <!-- Header with illustration -->
      <div class="modal__header">
        <div class="modal__illustration">
          <div class="modal__books">
            <img
              src="/public/images/addressSearch.png"
              alt="Create account illustration"
              class="create-account-hero__img w-32 h-32"
            />
          </div>
        </div>
        <h3 class="modal__title">{{ title }}</h3>
        <p class="modal__subtitle">
          {{ subtitle }}
        </p>
      </div>

      <!-- Body content -->
      <div class="modal__body">
        <slot />
      </div>

      <!-- Footer with actions -->
      <div v-if="$slots.footer" class="modal__footer">
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
  subtitle: {
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

<style scoped>
/* Modal Overlay */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

/* Modal Content */
.modal__content {
  background-color: #f3f4f6;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal__content--large {
  max-width: 500px;
}

/* Header */
.modal__header {
  padding: 2rem 1.5rem 1rem;
  text-align: center;
  /* background-color: #f3f4f6; */
}

.modal__illustration {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.modal__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.modal__close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.modal__close-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
}

/* Body */
.modal__body {
  flex: 1;
  padding: 1.5rem;
  background-color: white;
  overflow-y: auto;
  max-height: calc(90vh - 120px); /* Adjust based on header/footer height */
}

/* Scrollbar Styling for modal body */
.modal__body::-webkit-scrollbar {
  width: 4px;
}

.modal__body::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.modal__body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.modal__body::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Footer */
.modal__footer {
  padding: 1rem 1.5rem 1.5rem;
  background: transparent;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .modal__content {
    max-width: 100%;
    margin: 0.5rem;
  }

  .modal__header {
    padding: 1rem 1rem 0.75rem;
  }

  .modal__body {
    padding: 1rem;
  }

  .modal__footer {
    padding: 0.75rem 1rem 1rem;
  }
}
</style>
