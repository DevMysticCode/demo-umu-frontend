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

      <!-- Illustration Section -->
      <div v-if="showIllustration" class="drawer__illustration">
        <div class="drawer__illustration-icon">
          <slot name="illustration">
            <img
              src="/public/images/addressSearch.png"
              alt="Create account illustration"
              class="create-account-hero__img w-32 h-32"
            />
          </slot>
        </div>
        <h4 class="drawer__illustration-title">{{ title }}</h4>
        <p v-if="subtitle" class="drawer__subtitle">{{ subtitle }}</p>
      </div>

      <!-- Content -->
      <div class="drawer__content" :class="{ 'drawer__content--large': large }">
        <p>some text</p>
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="drawer__footer">
        <slot name="footer" />
      </div>

      <!-- Home Indicator -->
      <div class="drawer__home-indicator"></div>
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
  large: {
    type: Boolean,
    default: false,
  },
  showIllustration: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

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
  max-height: 95vh;
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
  background-color: #f3f4f6;
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

.drawer__illustration-img {
  width: 5rem;
  height: 5rem;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
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
  /* margin: 0 1.5rem; */
  border-radius: 0.75rem 0.75rem 0 0;
  padding: 1.5rem;
  min-height: 200px;
}

.drawer__content--large {
  min-height: 300px;
}

/* Footer */
.drawer__footer {
  padding: 1rem 1.5rem;
  background-color: white;
  margin: 0 1.5rem;
  border-radius: 0 0 0.75rem 0.75rem;
}

/* Home Indicator */
.drawer__home-indicator {
  width: 8rem;
  height: 0.25rem;
  background-color: #111827;
  border-radius: 0.125rem;
  margin: 1rem auto;
  flex-shrink: 0;
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
  }

  .drawer__header {
    padding: 0.75rem 1rem 0.5rem;
  }

  .drawer__illustration {
    padding: 1rem 1rem 0.75rem;
  }

  .drawer__content {
    margin: 0 1rem;
    padding: 1rem;
  }

  .drawer__footer {
    margin: 0 1rem;
    padding: 0.75rem 1rem 1rem;
  }
}

/* Terms Content Specific Styles */
.drawer__content .terms-content {
  padding: 0;
}

.drawer__content .term-section {
  margin-bottom: 1.5rem;
}

.drawer__content .term-section:last-child {
  margin-bottom: 0;
}

.drawer__content .term-section h4 {
  color: #111827;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
}

.drawer__content .term-section p {
  color: #6b7280;
  line-height: 1.6;
  font-size: 1rem;
}

/* Footer Button Styles */
.drawer__footer .page__button {
  width: 100%;
  height: 3rem;
  background-color: #00a19a;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.drawer__footer .page__button:hover {
  background-color: rgba(0, 161, 154, 0.9);
}

.drawer__footer .w-100 {
  width: 100%;
}
</style>
