<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="isVisible" class="toast-container">
        <div class="toast">
          <div class="toast-icon">
            <img v-if="icon" :src="icon" alt="icon" class="icon-img" />
            <span v-else class="default-icon">{{ iconEmoji || '✓' }}</span>
          </div>
          <p class="toast-message">{{ message }}</p>
          <div class="toast-check">
            <span class="check-icon">✓</span>
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
  background: linear-gradient(135deg, #00b8a9 0%, #00d4c3 100%);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0, 184, 169, 0.4);
  min-width: 280px;
  max-width: 400px;
  pointer-events: all;
}

.toast-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-icon {
  font-size: 24px;
}

.toast-message {
  flex: 1;
  color: white;
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.toast-check {
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-icon {
  color: #00b8a9;
  font-size: 20px;
  font-weight: 700;
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
