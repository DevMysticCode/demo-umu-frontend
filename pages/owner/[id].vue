<template>
  <div class="contact-page">
    <AppHeader title="Owner" :showBack="true" right="profile" />

    <div class="content">
      <h1 class="title">Tap the Owner</h1>
      <p class="subtitle">12, Maple Road, Staines TW18 3BA</p>

      <div class="house-illustration">
        <img
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 180'%3E%3C!-- Base --%3E%3Cellipse cx='100' cy='160' rx='80' ry='15' fill='%2390c850' opacity='0.3'/%3E%3C!-- House base --%3E%3Crect x='60' y='90' width='80' height='70' fill='%23f5deb3'/%3E%3C!-- Roof --%3E%3Cpath d='M 50 90 L 100 50 L 150 90 Z' fill='%23c85050'/%3E%3Crect x='95' y='50' width='10' height='15' fill='%238b4513'/%3E%3Crect x='98' y='48' width='20' height='3' fill='%23654321'/%3E%3C!-- Door --%3E%3Crect x='85' y='120' width='30' height='40' rx='15' ry='15' fill='%238b4513'/%3E%3Ccircle cx='108' cy='140' r='2' fill='%23ffd700'/%3E%3C!-- Windows --%3E%3Crect x='68' y='100' width='15' height='15' fill='%2387ceeb' opacity='0.7'/%3E%3Crect x='117' y='100' width='15' height='15' fill='%2387ceeb' opacity='0.7'/%3E%3Cline x1='75.5' y1='100' x2='75.5' y2='115' stroke='%23654321' stroke-width='1'/%3E%3Cline x1='68' y1='107.5' x2='83' y2='107.5' stroke='%23654321' stroke-width='1'/%3E%3Cline x1='124.5' y1='100' x2='124.5' y2='115' stroke='%23654321' stroke-width='1'/%3E%3Cline x1='117' y1='107.5' x2='132' y2='107.5' stroke='%23654321' stroke-width='1'/%3E%3C!-- Trees --%3E%3Crect x='25' y='130' width='8' height='30' fill='%238b4513'/%3E%3Ccircle cx='29' cy='125' r='15' fill='%2354a854'/%3E%3Ccircle cx='25' cy='120' r='12' fill='%2354a854'/%3E%3Ccircle cx='33' cy='120' r='12' fill='%2354a854'/%3E%3Crect x='167' y='130' width='8' height='30' fill='%238b4513'/%3E%3Ccircle cx='171' cy='125' r='15' fill='%2354a854'/%3E%3Ccircle cx='167' cy='120' r='12' fill='%2354a854'/%3E%3Ccircle cx='175' cy='120' r='12' fill='%2354a854'/%3E%3C!-- Person 1 (left of door) --%3E%3Ccircle cx='75' cy='135' r='5' fill='%23ffdbac'/%3E%3Crect x='72' y='140' width='6' height='12' fill='%234169e1'/%3E%3Crect x='70' y='142' width='3' height='8' fill='%234169e1'/%3E%3Crect x='77' y='142' width='3' height='8' fill='%234169e1'/%3E%3C!-- Person 2 (right of door) --%3E%3Ccircle cx='125' cy='135' r='5' fill='%23ffdbac'/%3E%3Crect x='122' y='140' width='6' height='12' fill='%23ff69b4'/%3E%3Crect x='120' y='142' width='3' height='8' fill='%23ff69b4'/%3E%3Crect x='127' y='142' width='3' height='8' fill='%23ff69b4'/%3E%3C/svg%3E"
          alt="House with owners"
          class="house-img"
        />
      </div>

      <p class="description">
        Send a message or request to speak with the property owner directly
      </p>

      <div class="message-section">
        <h2 class="section-title">Enter your message</h2>
        <textarea
          v-model="message"
          class="message-input"
          placeholder="e.g. who did your rendering...."
          rows="6"
        ></textarea>
      </div>

      <div class="options-section">
        <div class="option-item" @click="togglePhone">
          <span class="option-text">Share my phone number with owner</span>
          <div class="checkbox" :class="{ checked: sharePhone }">
            <span v-if="sharePhone" class="check-icon">✓</span>
          </div>
        </div>
        <div class="option-item" @click="toggleEmail">
          <span class="option-text">Send me an email copy of the message</span>
          <div class="checkbox" :class="{ checked: sendEmailCopy }">
            <span v-if="sendEmailCopy" class="check-icon">✓</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h2 class="section-title">Safety information</h2>
        <div class="info-card">
          <div class="info-icon">🔒</div>
          <div class="info-content">
            <h3 class="info-title">Safe Messaging</h3>
            <ul class="info-list">
              <li>All messages are monitored for safety</li>
              <li>Personal details kept private until you choose to share</li>
              <li>Report inappropriate behavior anytime</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h2 class="section-title">Response Expectation</h2>
        <div class="info-card">
          <div class="info-icon">💬</div>
          <div class="info-content">
            <h3 class="info-title">What happens next?</h3>
            <ul class="info-list">
              <li>Your message goes directly to the owner</li>
              <li>Most owners respond within 4 hours</li>
              <li>You'll get notified when they reply</li>
              <li>No estate agent fees or commissions</li>
            </ul>
          </div>
        </div>
      </div>

      <button class="send-btn" @click="sendMessage" :disabled="!message.trim()">
        Send Message
      </button>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/core/AppHeader.vue'
const route = useRoute()
const router = useRouter()

const message = ref('')
const sharePhone = ref(true)
const sendEmailCopy = ref(false)

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/dashboard')
}

const togglePhone = () => {
  sharePhone.value = !sharePhone.value
}

const toggleEmail = () => {
  sendEmailCopy.value = !sendEmailCopy.value
}

const sendMessage = () => {
  if (message.value.trim()) {
    alert('Message sent successfully! The owner will respond within 4 hours.')
    window.history.back()
  }
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f5f5 0%, #ffffff 200px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-bottom: 40px;
}

.header {
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

.content {
  padding: 0 20px;
  max-width: 430px;
  margin: 0 auto;
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

.house-illustration {
  display: flex;
  justify-content: center;
  margin: 32px 0;
}

.house-img {
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

.message-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1a1a1a;
}

.message-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  font-size: 15px;
  font-family: inherit;
  resize: none;
  background: white;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.message-input:focus {
  outline: none;
  border-color: #00b8a9;
}

.message-input::placeholder {
  color: #999;
}

.options-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:active {
  transform: scale(0.98);
  border-color: #00b8a9;
}

.option-text {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 500;
  flex: 1;
}

.checkbox {
  width: 28px;
  height: 28px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox.checked {
  background: #00b8a9;
  border-color: #00b8a9;
}

.check-icon {
  color: white;
  font-size: 16px;
  font-weight: 700;
}

.info-section {
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid #e6f9f7;
}

.info-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  font-size: 14px;
  color: #00b8a9;
  padding: 4px 0;
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
}

.send-btn {
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
  margin-top: 32px;
}

.send-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.send-btn:disabled {
  background: #ccc;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
