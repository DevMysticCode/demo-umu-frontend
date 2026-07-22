<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="isVisible" class="toast-container">
        <div class="toast">
          <!-- Icon slot on the left. When a 3D image path is supplied we
               render it directly (no white circle around it — the icon
               brings its own pedestal); otherwise fall back to the
               emoji glyph in a lighter chip. -->
          <div class="toast-icon" :class="{ 'toast-icon--img': !!icon }">
            <img v-if="icon" :src="icon" alt="" class="icon-img" />
            <span v-else class="default-icon">{{ iconEmoji || '✓' }}</span>
          </div>
          <p class="toast-message">{{ message }}</p>
          <div class="toast-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  iconEmoji: {
    type: String,
    default: '',
  },
  duration: {
    type: Number,
    default: 2000,
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        emit('close')
      }, props.duration)
    }
  }
)
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.toast {
  background: #00A19A;
  border-radius: 100px;
  padding: 8px 8px 8px 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow:
    0 10px 26px rgba(0, 161, 154, 0.42),
    0 3px 8px rgba(0, 129, 124, 0.35);
  min-width: 280px;
  max-width: 420px;
  pointer-events: all;
}

/* Left icon slot. When holding an image, becomes a transparent 54px
   square so the 3D illustration reads with its own pedestal. When
   holding a fallback emoji, still shows a translucent white chip so
   the emoji glyph doesn't sit directly on the teal. */
.toast-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.22);
}
.toast-icon--img {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: transparent;
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.default-icon {
  font-size: 22px;
  line-height: 1;
  color: #fff;
}

.toast-message {
  flex: 1;
  color: white;
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  line-height: 1.35;
  letter-spacing: -0.1px;
}

.toast-check {
  width: 34px;
  height: 34px;
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #231D45;
  margin-right: 4px;
}
.toast-check svg {
  width: 18px;
  height: 18px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100px);
  opacity: 0;
}
</style>


