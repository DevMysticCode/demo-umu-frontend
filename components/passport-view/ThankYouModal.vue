<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay">
        <div class="modal-container">
          <div class="modal-content">
            <div class="gift-illustration">
              <div class="gift-icon">🎁</div>
            </div>

            <h1 class="title">Congratulations!</h1>
            <p class="message">
              You've earned {{ points || 475 }} points by completing the
              {{ stepName || 'Boundaries' }} section
            </p>

            <div class="rewards-section">
              <div class="reward-card">
                <h3 class="reward-title">Your Rewards Await</h3>
                <div class="reward-points">
                  1500
                  <span class="gift-emoji">🎁</span>
                </div>
                <p class="reward-subtitle">Points balance</p>
                <p class="reward-description">
                  Redeem points for property services, premium features, or cash
                  back on your next marketplace booking
                </p>
                <button class="rewards-btn">Go to Rewards</button>
              </div>

              <div class="reward-card secondary">
                <h3 class="reward-title">Property Services</h3>
                <p class="reward-subtitle">
                  Find vetted conveyancers, electricians and more with verified
                  reviews and pricing
                </p>
              </div>
            </div>

            <button class="finish-btn" @click="handleContinue">Finish</button>
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
  points: {
    type: Number,
    default: 475,
  },
  stepName: {
    type: String,
    default: 'Boundaries',
  },
})

const emit = defineEmits(['update:modelValue', 'continue'])

const handleContinue = () => {
  emit('continue')
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
  background: rgba(100, 100, 100, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: transparent;
  max-width: 400px;
  width: 100%;
  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-content {
  padding: 0;
  text-align: center;
}

.gift-illustration {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.gift-icon {
  font-size: 120px;
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px;
  color: white;
}

.message {
  font-size: 16px;
  color: white;
  margin: 0 0 32px;
  line-height: 1.5;
}

.rewards-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
}

.reward-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  min-width: 240px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.reward-card.secondary {
  background: rgba(255, 255, 255, 0.95);
}

.reward-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #1a1a1a;
}

.reward-points {
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.gift-emoji {
  font-size: 40px;
}

.reward-subtitle {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px;
  font-weight: 600;
}

.reward-description {
  font-size: 12px;
  color: #00b8a9;
  margin: 0 0 16px;
  line-height: 1.5;
}

.rewards-btn {
  width: 100%;
  padding: 10px;
  background: none;
  color: #00b8a9;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.rewards-btn:active {
  transform: scale(0.98);
}

.finish-btn {
  width: 100%;
  padding: 18px;
  background: #00b8a9;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 184, 169, 0.4);
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
