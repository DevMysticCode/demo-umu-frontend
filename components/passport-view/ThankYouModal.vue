<template>
  <div v-if="modelValue" class="mobile-container thankyou-page">
    <video autoplay muted loop playsinline class="thankyou-page__video">
      <source src="/public/thankyou.mp4" type="video/mp4" />
    </video>

    <div class="thankyou-page__overlay"></div>

    <div class="thankyou-inner">
      <div class="modal-content">
        <div class="modal-heading-content">
          <h1 class="title">Congratulations!</h1>
          <p class="message">
            You've earned {{ points || 475 }} points by completing the
            {{ stepName || 'Boundaries' }} section
          </p>
        </div>

        <div class="modal-body-content">
          <div class="rewards-section">
            <div class="reward-card">
              <div class="reward-container">
                <div class="reward-content">
                  <h3 class="reward-title">Your Rewards Await</h3>
                  <div class="reward-points">1500</div>
                  <p class="reward-subtitle">Points balance</p>
                  <p class="reward-description">
                    Redeem points for property services, premium features, or
                    cash back on your next marketplace booking
                  </p>
                </div>
                <div class="reward-image">
                  <OPIcon name="rewardBox" class="w-[80px] h-[80px]" />
                </div>
              </div>

              <button class="rewards-btn">Go to Rewards</button>
            </div>

            <div class="reward-card">
              <div class="reward-container">
                <div class="reward-content">
                  <h3 class="reward-title">Property Services Hib</h3>
                  <p class="reward-description">
                    Redeem points for property services, premium features, or
                    cash back on your next marketplace booking
                  </p>
                </div>
                <div class="reward-image">
                  <OPIcon name="rewardBox" class="w-[80px] h-[80px]" />
                </div>
              </div>
            </div>
          </div>

          <button class="finish-btn" @click="handleContinue">Finish</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'
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
  // keep existing behavior to let parent hide this page
  emit('update:modelValue', false)
}
</script>

<style scoped>
.thankyou-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}

/* Video and overlay */
.thankyou-page__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.thankyou-page__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1;
}

.thankyou-inner {
  width: 100%;
  max-width: 720px;
  z-index: 2; /* above video and overlay */
}

.modal-content {
  padding: 0;
  text-align: center;
  background: transparent;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100vh - 40px);
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

.reward-container {
  display: flex;
  gap: 10px;
  text-align: left;
}

.rewards-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */
}

.rewards-section::-webkit-scrollbar {
  display: none; /* For Chrome, Safari, and Opera */
}

.reward-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  min-width: 240px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 70%;
  text-align: right;
}

.reward-title {
  margin: 0 0 12px;
  color: #000000;
  font-weight: 400;
  font-size: 16px;
  line-height: 21px;
  letter-spacing: -0.31px;
  vertical-align: middle;
}

.reward-points {
  color: #000000;
  font-weight: 700;
  font-style: Bold;
  font-size: 34px;
  line-height: 41px;
  letter-spacing: 0.4px;
  vertical-align: middle;
}

.reward-image {
  min-width: fit-content;
}

.reward-subtitle {
  color: #3c3c4399;
  font-weight: 400;
  font-size: 16px;
  line-height: 21px;
  letter-spacing: -0.31px;
  vertical-align: middle;
}

.reward-description {
  color: #00a19a;
  margin: 0 0 16px;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.06px;
  vertical-align: middle;
}

.rewards-btn {
  padding: 6px 10px;
  background: #00a19a1a;
  color: #00a19a;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  vertical-align: middle;
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
