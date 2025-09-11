<template>
  <div v-if="modelValue" class="drawer-overlay" @click.self="handleClose">
    <div class="drawer" :class="{ 'drawer--open': modelValue }">

      <!-- Header -->
      <div class="drawer__header">
        <button @click="handleClose" class="drawer__back">
          <span class="drawer__back-icon"
            ><OPIcon name="leftChevron" class="w-[15px] h-[15px]"
          /></span>
          <span class="drawer__back-text">Back</span>
        </button>

        <h3 class="drawer__title">{{ title }}</h3>

        <button @click="handleClose" class="drawer__close">
          <span class="drawer__close-icon">✕</span>
        </button>
      </div>

      <!-- Content -->
      <div class="drawer__content">
        <slot />
      </div>

    </div>
  </div>
</template>

<script setup>
import OPIcon from '../OPIcon.vue'

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
    default: '',
  },
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
/* Drawer Overlay */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  @apply backdrop-blur-sm;
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* Drawer Container */
.drawer {
  background-color: #f3f4f6;
  width: 100%;
  max-width: 428px;
  min-height: 95vh;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  overflow: hidden;
}

.drawer--open {
  transform: translateY(0);
}

/* Header */
.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem 0.5rem;
  /* background-color: #f3f4f6; */
  border-bottom: 1px solid #e5e7eb;
}

.drawer__back {
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  color: #00a19a;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.drawer__back:hover {
  color: rgba(0, 161, 154, 0.8);
}

.drawer__back-icon {
  font-size: 1.25rem;
  margin-right: 0.5rem;
}

.drawer__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  text-align: center;
  flex: 1;
  margin: 0;
}

.drawer__close {
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.drawer__close:hover {
  color: #374151;
  background-color: rgba(0, 0, 0, 0.05);
}

/* Content */
.drawer__content {
  flex: 1;
}

/* Scrollbar Styling */
.drawer__content::-webkit-scrollbar {
  width: 4px;
}

.drawer__content::-webkit-scrollbar-track {
  background: #f3f4f6;
}

.drawer__content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.drawer__content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

</style>
