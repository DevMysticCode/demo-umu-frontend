<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <div class="modal-content">
            <div class="icon-wrapper">
              <div class="house-icon">
                <svg viewBox="0 0 100 80" width="100" height="80">
                  <path
                    d="M 10 40 L 50 10 L 90 40 L 90 70 L 10 70 Z"
                    fill="#00b8a9"
                    stroke="#00b8a9"
                    stroke-width="3"
                  />
                  <rect x="40" y="45" width="20" height="25" fill="#fff" />
                  <line
                    x1="50"
                    y1="10"
                    x2="50"
                    y2="30"
                    stroke="#00b8a9"
                    stroke-width="6"
                    stroke-linecap="round"
                  />
                  <circle cx="50" cy="5" r="5" fill="#00b8a9" />
                </svg>
              </div>
            </div>

            <h1 class="title">Message Sent</h1>
            <p class="message">
              Your message is on its way! If the owner accepts, you'll hear back
              shortly.
            </p>

            <div class="illustration">
              <img
                src="https://images.pexels.com/photos/5077047/pexels-photo-5077047.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Person with laptop"
                class="person-img"
              />
            </div>

            <button class="finish-btn" @click="closeModal">Finish</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: linear-gradient(to bottom, #f0f0f0 0%, #ffffff 200px);
  max-width: 400px;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-content {
  padding: 40px 30px;
  text-align: center;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.house-icon {
  width: 100px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px;
  color: #1a1a1a;
}

.message {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.5;
}

.illustration {
  margin: 32px 0;
  display: flex;
  justify-content: center;
}

.person-img {
  width: 280px;
  height: 320px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.finish-btn {
  width: 100%;
  padding: 18px;
  background: #00b8a9;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 184, 169, 0.3);
  transition: all 0.2s;
  margin-top: 24px;
}

.finish-btn:active {
  transform: scale(0.98);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
