<template>
  <div class="modal-container" @click.stop>
    <div class="modal-content">
      <h1 class="title">Register Your Interest</h1>
      <p class="subtitle">{{ address }}</p>

      <div class="greenhouse-illustration">
        <OPIcon name="registerInterestDrawer" class="w-[144px] h-[144px]" />
      </div>

      <!-- Success state -->
      <div v-if="submitted" class="success-state">
        <div class="success-icon">✓</div>
        <h2 class="success-title">Interest Registered!</h2>
        <p class="success-desc">The property owner has been notified of your interest. They may reach out to you directly.</p>
        <button class="register-btn" @click="emit('submit')">Done</button>
      </div>

      <template v-else>
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
              <div class="radio-btn" :class="{ checked: selectedInterest === 'dream' }">
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
                <p class="interest-desc">Very interested and ready to move quickly</p>
              </div>
              <div class="radio-btn" :class="{ checked: selectedInterest === 'super' }">
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
                <p class="interest-desc">Interested but still exploring options</p>
              </div>
              <div class="radio-btn" :class="{ checked: selectedInterest === 'browsing' }">
                <div v-if="selectedInterest === 'browsing'" class="radio-dot"></div>
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

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button
          class="register-btn"
          :disabled="!selectedInterest || isSubmitting"
          @click="registerInterest"
        >
          {{ isSubmitting ? 'Sending...' : 'Register Interest' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import OPIcon from '~/components/ui/OPIcon.vue'

const props = defineProps<{
  address: string
  propertyId: string
}>()

const emit = defineEmits(['submit'])

const config = useRuntimeConfig()
const selectedInterest = ref('')
const isSubmitting = ref(false)
const submitted = ref(false)
const errorMsg = ref('')

const registerInterest = async () => {
  if (!selectedInterest.value || isSubmitting.value) return
  isSubmitting.value = true
  errorMsg.value = ''
  try {
    const token = localStorage.getItem('token')
    await $fetch(`${config.public.apiBase}/property/${props.propertyId}/register-interest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { interestLevel: selectedInterest.value },
    })
    submitted.value = true
  } catch {
    errorMsg.value = 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-container {
  max-width: 430px;
  width: 100%;
  max-height: 90vh;
  border-radius: 24px 24px 0 0;
  overflow-y: auto;
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

.error-msg {
  font-size: 14px;
  color: #ef4444;
  text-align: center;
  margin-bottom: 12px;
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

/* Success state */
.success-state {
  text-align: center;
  padding: 20px 0 8px;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #00b8a9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  margin: 0 auto 20px;
}

.success-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.success-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 32px;
}
</style>
