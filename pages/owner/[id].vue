<template>
  <div class="contact-page">
    <AppHeader title="Tap the Owner" :showBack="true" right="profile" />

    <div class="content">
      <!-- Loading -->
      <div v-if="pageLoading" class="loading-state">
        <div class="spinner" />
        <p>Loading...</p>
      </div>

      <!-- No phone blocker — user must add phone first -->
      <div v-else-if="!userHasPhone" class="blocker-state">
        <div class="blocker-icon">📱</div>
        <h2 class="blocker-title">Phone Number Required</h2>
        <p class="blocker-desc">
          To contact a property owner, you need a phone number on your profile.
          This lets the owner respond to you via WhatsApp or call.
        </p>
        <button class="send-btn" @click="router.push('/profile/personal-information')">
          Add Phone Number
        </button>
      </div>

      <!-- Success state -->
      <div v-else-if="submitted" class="success-state">
        <div class="house-illustration">
          <OPIcon name="tapTheOwner" class="w-[144px] h-[144px]" />
        </div>
        <h2 class="success-title">Message Sent!</h2>
        <p class="success-desc">
          Your message has been sent to the property owner{{ !ownerHasPassport ? ' and our team' : '' }}.
          You'll hear back soon.
        </p>

        <!-- WhatsApp option — only if owner has a phone -->
        <div v-if="ownerPhone" class="whatsapp-section">
          <p class="whatsapp-label">Want to reach them instantly?</p>
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener"
            class="whatsapp-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22" style="margin-right:8px">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366"/>
            </svg>
            Message on WhatsApp
          </a>
          <p class="whatsapp-note">Opens WhatsApp with a pre-written message</p>
        </div>

        <button class="done-btn" @click="router.back()">Done</button>
      </div>

      <!-- Main form -->
      <template v-else>
        <h1 class="title">Tap the Owner</h1>
        <p class="subtitle">{{ propertyAddress }}</p>

        <div class="house-illustration">
          <OPIcon name="tapTheOwner" class="w-[144px] h-[144px]" />
        </div>

        <p class="description">
          Send a message or request to speak with the property owner directly
        </p>

        <div class="message-section">
          <h2 class="section-title">Enter your message</h2>
          <textarea
            v-model="message"
            class="message-input"
            placeholder="e.g. Who did your rendering? I'm very interested in this property..."
            rows="6"
          ></textarea>
        </div>

        <div class="options-section">
          <div class="option-item" @click="sharePhone = !sharePhone">
            <span class="option-text">Share my phone number with owner</span>
            <div class="checkbox" :class="{ checked: sharePhone }">
              <span v-if="sharePhone" class="check-icon">✓</span>
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

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button
          class="send-btn"
          :disabled="!message.trim() || isSending"
          @click="sendMessage"
        >
          {{ isSending ? 'Sending...' : 'Send Message' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/core/AppHeader.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const propertyId = route.params.id as string

const message = ref('')
const sharePhone = ref(true)
const isSending = ref(false)
const submitted = ref(false)
const errorMsg = ref('')
const pageLoading = ref(true)
const userHasPhone = ref(true) // optimistic default — only block if fetch explicitly shows no phone
const propertyAddress = ref('')
const ownerPhone = ref<string | null>(null)
const ownerHasPassport = ref(false)

const whatsappUrl = computed(() => {
  if (!ownerPhone.value) return ''
  const phone = ownerPhone.value.replace(/[^0-9+]/g, '').replace(/^\+/, '')
  const text = encodeURIComponent(
    `Hi, I sent you a message through UMovingU about your property at ${propertyAddress.value}. Looking forward to hearing from you!`
  )
  return `https://wa.me/${phone}?text=${text}`
})

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }

    const headers = { Authorization: `Bearer ${token}` }

    // Load user profile and property details in parallel
    const [profileRes, propertyRes] = await Promise.all([
      fetch(`${config.public.apiBase}/profile/me`, { headers }),
      fetch(`${config.public.apiBase}/property/${propertyId}`),
    ])

    if (profileRes.ok) {
      const profile = await profileRes.json()
      // Only block if we KNOW the phone is absent
      if (!profile.phone || !profile.phone.trim()) {
        userHasPhone.value = false
      }
    }
    // If fetch fails, userHasPhone stays true — backend will validate on submit

    if (propertyRes.ok) {
      const prop = await propertyRes.json()
      propertyAddress.value = [prop.addressLine1, prop.city || prop.county, prop.postcode]
        .filter(Boolean).join(', ')
    }
  } catch {
    // non-critical
  } finally {
    pageLoading.value = false
  }
})

const sendMessage = async () => {
  if (!message.value.trim() || isSending.value) return
  isSending.value = true
  errorMsg.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await $fetch<{ success: boolean; ownerPhone: string | null }>(
      `${config.public.apiBase}/property/${propertyId}/tap-owner`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { message: message.value, sharePhone: sharePhone.value },
      }
    )
    ownerPhone.value = res.ownerPhone
    ownerHasPassport.value = !!res.ownerPhone
    submitted.value = true
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || ''
    if (msg.toLowerCase().includes('phone')) {
      userHasPhone.value = false
    } else {
      errorMsg.value = 'Something went wrong. Please try again.'
    }
  } finally {
    isSending.value = false
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

.content {
  padding: 0 20px;
  max-width: 430px;
  margin: 0 auto;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 16px;
  color: #666;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e5e5ea;
  border-top-color: #00b8a9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Blocker state */
.blocker-state {
  text-align: center;
  padding: 40px 0;
}

.blocker-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.blocker-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.blocker-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 32px;
}

/* Success state */
.success-state {
  text-align: center;
  padding: 32px 0;
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 16px 0 8px;
}

.success-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 32px;
}

.whatsapp-section {
  background: #f0fff4;
  border: 1.5px solid #bbf7d0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
}

.whatsapp-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.whatsapp-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 14px;
  background: #25D366;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  transition: all 0.2s;
}

.whatsapp-btn:active {
  transform: scale(0.98);
}

.whatsapp-note {
  font-size: 12px;
  color: #666;
  margin: 8px 0 0;
  text-align: center;
}

.done-btn {
  width: 100%;
  padding: 16px;
  background: white;
  color: #00b8a9;
  border: 2px solid #00b8a9;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.2s;
}

/* Form */
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

.error-msg {
  font-size: 14px;
  color: #ef4444;
  text-align: center;
  margin-bottom: 12px;
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
