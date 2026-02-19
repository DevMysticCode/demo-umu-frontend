<template>
  <div
    v-if="modelValue"
    class="drawer-overlay"
    :class="{ 'drawer-overlay--fullscreen': fullscreen }"
    @click.self="handleClose"
  >
    <div
      class="drawer"
      :class="{ 'drawer--open': modelValue, 'drawer--fullscreen': fullscreen }"
    >
      <!-- Header -->
      <div class="drawer__header">
        <button v-if="showBackButton" @click="handleClose" class="drawer__back">
          <span class="drawer__back-icon"
            ><OPIcon name="leftChevron" class="w-[15px] h-[15px]"
          /></span>
          <span class="drawer__back-text">Back</span>
        </button>
        <div v-else class="drawer__back-placeholder"></div>

        <h3 class="drawer__title">{{ title }}</h3>

        <button @click="handleClose" class="drawer__close">
          <span class="drawer__close-icon">✕</span>
        </button>
      </div>

      <!-- Illustration Section (now optional via slot) -->
      <!-- <div v-if="$slots.illustration" class="drawer__illustration">
        <div class="drawer__illustration-icon">
          <slot name="illustration"></slot>
        </div>
        <h4 v-if="title" class="drawer__illustration-title">{{ title }}</h4>
        <p v-if="subtitle" class="drawer__subtitle">{{ subtitle }}</p>
      </div> -->

      <!-- Content -->
      <div class="drawer__content" :class="{ 'drawer__content--large': large }">
        <slot />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="drawer__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
import OPIcon from './OPIcon.vue'
import { watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  large: {
    type: Boolean,
    default: false,
  },
  showBackButton: {
    type: Boolean,
    default: true,
  },
  fullscreen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const lockScroll = (lock) => {
  const container = document.querySelector('.mobile-container')
  if (container) {
    container.style.overflow = lock ? 'hidden' : ''
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (typeof document !== 'undefined') {
      lockScroll(isOpen)
    }
  },
)

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    lockScroll(false)
  }
})
</script>

<style scoped>
/* Drawer Overlay */
.drawer-overlay {
  position: fixed;
  top: 20px;
  left: 50%;
  max-width: 28rem;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transform: translateX(-50%);
}

.drawer-overlay--fullscreen {
  align-items: stretch;
  justify-content: stretch;
  background-color: rgba(0, 0, 0, 0.9);
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 100%;
  width: 100%;
  transform: none;
}

/* Drawer Container */
.drawer {
  background-color: #f3f4f6;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  border-radius: 1rem 1rem 0 0;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  overflow: hidden;
}

.drawer--fullscreen {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  border-radius: 0;
  transform: translateY(0) !important;
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
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  min-height: 3.5rem; /* Ensure consistent height */
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

.drawer__back-placeholder {
  width: 80px; /* Same approximate width as the back button */
  visibility: hidden;
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
  padding: 0 1rem; /* Add padding for better spacing */
}

.drawer__close {
  background: rgba(127, 127, 127, 0.15);
  border: none;
  color: rgba(61, 61, 61, 0.5);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 16px;
  font-style: normal;
  font-weight: 590;
  line-height: 21px;
}

.drawer__close:hover {
  color: #374151;
  background-color: rgba(0, 0, 0, 0.05);
}

/* Illustration Section */
.drawer__illustration {
  padding: 1.5rem 1.5rem 1rem;
  text-align: center;
  background-color: #f3f4f6;
}

.drawer__illustration-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.drawer__illustration-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.drawer__subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  margin: 0;
}

/* Content */
.drawer__content {
  flex: 1;
  overflow-y: auto;
  background-color: white;
  border-radius: 0.75rem 0.75rem 0 0;
  padding: 16px;
  min-height: 200px;
}

.drawer__content--large {
  min-height: 300px;
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

/* Responsive adjustments */
@media (max-width: 480px) {
  .drawer {
    max-width: 100%;
    margin: 0;
    max-height: 85vh; /* Adjust for mobile */
  }

  .drawer__header {
    padding: 0.75rem 1rem 0.5rem;
  }

  .drawer__illustration {
    padding: 1rem 1rem 0.75rem;
  }

  .drawer__content {
    padding: 1rem;
  }

  .drawer__footer {
    padding: 0.75rem 1rem 1rem;
  }

  .drawer__back-placeholder {
    width: 60px; /* Smaller placeholder on mobile */
  }
}
</style>
