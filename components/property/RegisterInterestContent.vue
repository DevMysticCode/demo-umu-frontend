<template>
  <div class="modal-container" @click.stop>
    <div class="modal-content">
      <h1 class="title">Register Your Interest</h1>
      <p class="subtitle">12, Maple Road, Staines TW18 3BA</p>

      <div class="greenhouse-illustration">
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 180'%3E%3C!-- Base platform --%3E%3Cellipse cx='100' cy='160' rx='80' ry='15' fill='%2390c850' opacity='0.3'/%3E%3Crect x='40' y='140' width='120' height='20' fill='%238b7355' rx='2'/%3E%3C!-- Greenhouse structure --%3E%3Cpath d='M 60 140 L 60 100 Q 60 90 70 90 L 130 90 Q 140 90 140 100 L 140 140 Z' fill='%23d0f0f0' opacity='0.6' stroke='%2386c8c8' stroke-width='2'/%3E%3Cline x1='100' y1='90' x2='100' y2='140' stroke='%2386c8c8' stroke-width='2'/%3E%3Cpath d='M 60 100 Q 100 80 140 100' stroke='%2386c8c8' stroke-width='2' fill='none'/%3E%3C!-- Door --%3E%3Crect x='90' y='115' width='20' height='25' fill='%238b7355'/%3E%3Ccircle cx='107' cy='127' r='1.5' fill='%23ffd700'/%3E%3C!-- Plants inside --%3E%3Cellipse cx='75' cy='130' rx='8' ry='12' fill='%2354a854'/%3E%3Cellipse cx='85' cy='125' rx='6' ry='10' fill='%2354a854'/%3E%3Cellipse cx='115' cy='128' rx='7' ry='11' fill='%2354a854'/%3E%3Cellipse cx='125' cy='132' rx='8' ry='13' fill='%2354a854'/%3E%3C!-- Person watering --%3E%3Ccircle cx='135' cy='110' r='6' fill='%23ffdbac'/%3E%3Crect x='132' y='116' width='6' height='14' fill='%23ff6b6b'/%3E%3Cline x1='132' y1='120' x2='125' y2='118' stroke='%23ffdbac' stroke-width='2'/%3E%3Cline x1='138' y1='120' x2='145' y2='125' stroke='%23ffdbac' stroke-width='2'/%3E%3Ccircle cx='148' cy='127' r='2' fill='%234169e1'/%3E%3Cpath d='M 148 129 Q 150 132 148 135' stroke='%234169e1' stroke-width='1' fill='none'/%3E%3C!-- Plants outside --%3E%3Ccircle cx='50' cy='145' r='6' fill='%2354a854'/%3E%3Crect x='49' y='145' width='2' height='8' fill='%238b4513'/%3E%3Ccircle cx='155' cy='147' r='7' fill='%2354a854'/%3E%3Crect x='154' y='147' width='2' height='10' fill='%238b4513'/%3E%3C!-- Heart/Love indicator --%3E%3Cpath d='M 138 95 Q 138 90 142 90 Q 145 90 145 93 Q 145 90 148 90 Q 152 90 152 95 Q 152 100 145 105 Q 138 100 138 95 Z' fill='%23ff69b4'/%3E%3C/svg%3E"
          alt="Greenhouse with person"
          class="greenhouse-img"
        />
      </div>

      <p class="description">
        Help the owner understand your level of interest in this property
      </p>

      <div class="interest-section">
        <h2 class="section-title">How Keen are you?</h2>

        <div class="interest-options">
          <div
            class="interest-card"
            :class="{ selected: selectedInterest === 'dream' }"
            @click="selectedInterest = 'dream'"
          >
            <div class="interest-icon">🏡</div>
            <div class="interest-content">
              <h3 class="interest-name">Dream Home</h3>
              <p class="interest-desc">This is exactly what I'm looking for</p>
            </div>
            <div
              class="radio-btn"
              :class="{ checked: selectedInterest === 'dream' }"
            >
              <div v-if="selectedInterest === 'dream'" class="radio-dot"></div>
            </div>
          </div>

          <div
            class="interest-card"
            :class="{ selected: selectedInterest === 'super' }"
            @click="selectedInterest = 'super'"
          >
            <div class="interest-icon">🛋️</div>
            <div class="interest-content">
              <h3 class="interest-name">Super Keen</h3>
              <p class="interest-desc">
                Very interested and ready to move quickly
              </p>
            </div>
            <div
              class="radio-btn"
              :class="{ checked: selectedInterest === 'super' }"
            >
              <div v-if="selectedInterest === 'super'" class="radio-dot"></div>
            </div>
          </div>

          <div
            class="interest-card"
            :class="{ selected: selectedInterest === 'browsing' }"
            @click="selectedInterest = 'browsing'"
          >
            <div class="interest-icon">🌳</div>
            <div class="interest-content">
              <h3 class="interest-name">Just Browsing</h3>
              <p class="interest-desc">
                Interested but still exploring options
              </p>
            </div>
            <div
              class="radio-btn"
              :class="{ checked: selectedInterest === 'browsing' }"
            >
              <div
                v-if="selectedInterest === 'browsing'"
                class="radio-dot"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h2 class="section-title">Why does this help?</h2>
        <div class="info-card">
          <ul class="info-list">
            <li>Owners prioritize serious buyers</li>
            <li>Helps schedule appropriate viewing times</li>
            <li>Sets realistic expectations for both parties</li>
            <li>Increases your chances of getting a response</li>
          </ul>
        </div>
      </div>

      <button
        class="register-btn"
        @click="registerInterest"
        :disabled="!selectedInterest"
      >
        Register Interest
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'registered', 'close'])

const selectedInterest = ref('')

const closeModal = () => {
  emit('update:modelValue', false)
}

const registerInterest = () => {
  if (selectedInterest.value) {
    emit('registered', selectedInterest.value)
    selectedInterest.value = ''
    closeModal()
  }
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(0, 0, 0, 0.5); */
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  /* background: linear-gradient(to bottom, #f5f5f5 0%, #ffffff 200px); */
  max-width: 430px;
  width: 100%;
  max-height: 90vh;
  border-radius: 24px 24px 0 0;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: transparent;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #00b8a9;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  padding: 8px;
}

.back-arrow {
  font-size: 20px;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e0e0;
  border: none;
  font-size: 18px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  padding: 0 20px 40px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 32px;
}

.greenhouse-illustration {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.greenhouse-img {
  width: 200px;
  height: 180px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.description {
  font-size: 16px;
  color: #00b8a9;
  text-align: center;
  margin-bottom: 32px;
  font-weight: 500;
  line-height: 1.5;
}

.interest-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #1a1a1a;
}

.interest-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.interest-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.interest-card:active {
  transform: scale(0.98);
}

.interest-card.selected {
  border-color: #00b8a9;
  background: #f0fffe;
}

.interest-icon {
  width: 48px;
  height: 48px;
  font-size: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.interest-content {
  flex: 1;
}

.interest-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a1a1a;
}

.interest-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.radio-btn {
  width: 24px;
  height: 24px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.radio-btn.checked {
  border-color: #00b8a9;
}

.radio-dot {
  width: 12px;
  height: 12px;
  background: #00b8a9;
  border-radius: 50%;
}

.info-section {
  margin-bottom: 32px;
}

.info-card {
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid #e6f9f7;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  font-size: 14px;
  color: #00b8a9;
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
  line-height: 1.5;
}

.info-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #00b8a9;
  font-weight: 700;
  font-size: 16px;
}

.register-btn {
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
}

.register-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.register-btn:disabled {
  background: #ccc;
  box-shadow: none;
  cursor: not-allowed;
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
