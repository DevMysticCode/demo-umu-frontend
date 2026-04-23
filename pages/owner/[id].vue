<template>
  <div class="to-page">
    <!-- Sticky header -->
    <div class="to-header">
      <button class="to-back" @click="router.back()" aria-label="Back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="to-header__text">
        <div class="to-header__title">Tap the Owner</div>
        <div class="to-header__subtitle">{{ propertyAddress || 'Property' }}</div>
      </div>
      <div class="to-header__chip">Anonymous</div>
    </div>

    <div class="to-content">
      <!-- Loading -->
      <div v-if="pageLoading" class="to-loading">
        <div class="to-spinner" />
        <p>Loading...</p>
      </div>

      <!-- Phone blocker -->
      <div v-else-if="!userHasPhone" class="to-blocker">
        <div class="to-blocker__icon">📱</div>
        <h2 class="to-blocker__title">Phone Number Required</h2>
        <p class="to-blocker__desc">
          To contact a property owner, you need a phone number on your profile.
          This lets the owner respond to you via WhatsApp or call.
        </p>
        <button class="to-cta" @click="router.push('/profile/personal-information')">
          Add Phone Number
        </button>
      </div>

      <!-- Sent state -->
      <div v-else-if="submitted" class="to-sent">
        <div class="to-sent__circle">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2 11 13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
        <div class="to-sent__title">Message sent!</div>
        <div class="to-sent__desc">
          Your message has been delivered privately to the owner. We'll notify you if they respond — usually within a few days.
        </div>

        <div class="to-sent__card">
          <div class="to-sent__label">Your message</div>
          <div class="to-sent__preview">{{ message }}</div>
        </div>

        <!-- WhatsApp option — only if owner has phone -->
        <div v-if="ownerPhone" class="to-whatsapp">
          <div class="to-whatsapp__label">Want to reach them instantly?</div>
          <a :href="whatsappUrl" target="_blank" rel="noopener" class="to-whatsapp__btn">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#25D366" />
            </svg>
            <span>Message on WhatsApp</span>
          </a>
        </div>

        <button class="to-done" @click="router.back()">Done</button>
      </div>

      <!-- Compose -->
      <div v-else class="to-compose">
        <!-- Hero -->
        <div class="to-hero">
          <div class="to-hero__blob" />
          <div class="to-hero__emoji">💡</div>
          <div class="to-hero__title">Reach the owner directly</div>
          <div class="to-hero__desc">
            Sometimes the best deals happen before a property is listed. Send a message — we'll deliver it privately. Your identity stays hidden unless they respond.
          </div>
        </div>

        <!-- Preset messages -->
        <div class="to-section-title">Choose a message</div>
        <div class="to-msg-list">
          <div
            v-for="(preset, i) in presetMessages"
            :key="i"
            class="to-msg-option"
            :class="{ 'to-msg-option--selected': selectedPreset === i }"
            @click="selectPreset(i)"
          >
            💬 "{{ preset.short }}"
          </div>
        </div>

        <!-- Custom -->
        <div class="to-custom">
          <div class="to-custom__label">Or write your own</div>
          <textarea
            v-model="message"
            class="to-custom__input"
            placeholder="Write a personal message to the owner…"
            rows="4"
            @input="onCustomInput"
          />
        </div>

        <!-- Privacy -->
        <div class="to-privacy">
          <span class="to-privacy__emoji">🔒</span>
          <div>
            <div class="to-privacy__title">Your identity is anonymous</div>
            <div class="to-privacy__desc">The owner sees your message but not your name or contact details. Only shared if they reply and you both agree.</div>
          </div>
        </div>

        <p v-if="errorMsg" class="to-error">{{ errorMsg }}</p>

        <button
          class="to-send"
          :disabled="!canSend || isSending"
          @click="sendMessage"
        >
          <span v-if="isSending" class="to-spinner to-spinner--small" />
          <template v-else>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2 11 13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>Send message</span>
          </template>
        </button>
        <div class="to-foot-note">Delivered via uMU · Anonymous until mutual agreement</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const propertyId = route.params.id as string

const presetMessages = [
  {
    short: "I'm genuinely interested in your property and would love to arrange a viewing.",
    full: "I'm genuinely interested in your property and would love to arrange a viewing at your convenience.",
  },
  {
    short: "Your home is exactly what I'm looking for. Would you consider a private sale?",
    full: "I've been searching this area for a while and your home is exactly what I'm looking for. Would you consider a private sale?",
  },
  {
    short: "Are you planning to sell in the next 6–12 months? I'm happy to wait.",
    full: "I'd love to know if you're planning to sell in the next 6-12 months. Happy to wait for the right property.",
  },
]

const message = ref('')
const selectedPreset = ref<number | null>(null)
const isSending = ref(false)
const submitted = ref(false)
const errorMsg = ref('')
const pageLoading = ref(true)
const userHasPhone = ref(true)
const propertyAddress = ref('')
const ownerPhone = ref<string | null>(null)
const ownerHasPassport = ref(false)

const canSend = computed(() => !!message.value.trim())

const whatsappUrl = computed(() => {
  if (!ownerPhone.value) return ''
  const phone = ownerPhone.value.replace(/[^0-9+]/g, '').replace(/^\+/, '')
  const text = encodeURIComponent(
    `Hi, I sent you a message through UMovingU about your property at ${propertyAddress.value}. Looking forward to hearing from you!`,
  )
  return `https://wa.me/${phone}?text=${text}`
})

const selectPreset = (i: number) => {
  selectedPreset.value = i
  message.value = presetMessages[i].full
}

const onCustomInput = () => {
  // Deselect preset if user edits freely
  if (selectedPreset.value !== null) {
    const preset = presetMessages[selectedPreset.value]
    if (message.value !== preset.full) {
      selectedPreset.value = null
    }
  }
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    const [profileRes, propertyRes] = await Promise.all([
      fetch(`${config.public.apiBase}/profile/me`, { headers }),
      fetch(`${config.public.apiBase}/property/${propertyId}`),
    ])

    if (profileRes.ok) {
      const profile = await profileRes.json()
      if (!profile.phone || !profile.phone.trim()) {
        userHasPhone.value = false
      }
    }

    if (propertyRes.ok) {
      const prop = await propertyRes.json()
      propertyAddress.value = [prop.addressLine1, prop.city || prop.county, prop.postcode]
        .filter(Boolean)
        .join(', ')
    }
  } catch {
    // non-critical
  } finally {
    pageLoading.value = false
  }
})

const sendMessage = async () => {
  if (!canSend.value || isSending.value) return
  isSending.value = true
  errorMsg.value = ''
  try {
    const token = localStorage.getItem('token')
    const res = await $fetch<{ success: boolean; ownerPhone: string | null }>(
      `${config.public.apiBase}/property/${propertyId}/tap-owner`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { message: message.value, sharePhone: true },
      },
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
.to-page {
  --navy: #0f0d3d;
  --brand: #00b8a9;
  --brand-pale: #e6fbfa;
  --brand-soft: #b6ece6;
  --ink: #1a1a1a;
  --ink-soft: #4b5563;
  --ink-faint: #9ca3af;
  --line: #e5e7eb;

  min-height: 100vh;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--ink);
  padding-bottom: 40px;
}

/* Header */
.to-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 12px;
  background: #fff;
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 20;
}

.to-back {
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
  color: var(--navy);
  display: grid;
  place-items: center;
}

.to-header__text {
  flex: 1;
  min-width: 0;
}

.to-header__title {
  font-size: 15px;
  font-weight: 800;
  color: var(--navy);
}

.to-header__subtitle {
  font-size: 11px;
  color: var(--ink-faint);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.to-header__chip {
  background: var(--brand-pale);
  border: 1px solid var(--brand-soft);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  color: var(--brand);
  flex-shrink: 0;
}

/* Content */
.to-content {
  padding: 20px;
  max-width: 430px;
  margin: 0 auto;
}

/* Loading */
.to-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 16px;
  color: var(--ink-soft);
}

.to-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--line);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: to-spin 0.8s linear infinite;
}

.to-spinner--small {
  width: 18px;
  height: 18px;
  border-width: 2.5px;
  border-top-color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
}

@keyframes to-spin {
  to { transform: rotate(360deg); }
}

/* Blocker */
.to-blocker {
  text-align: center;
  padding: 40px 0;
}

.to-blocker__icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.to-blocker__title {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  margin: 0 0 12px;
}

.to-blocker__desc {
  font-size: 14px;
  color: var(--ink-soft);
  line-height: 1.55;
  margin: 0 0 32px;
}

.to-cta {
  width: 100%;
  padding: 15px;
  background: var(--brand);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
}

/* Hero */
.to-hero {
  background: linear-gradient(135deg, var(--navy), #1e1b4b);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}

.to-hero__blob {
  position: absolute;
  right: -15px;
  top: -15px;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}

.to-hero__emoji {
  font-size: 18px;
  margin-bottom: 8px;
  position: relative;
}

.to-hero__title {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
  position: relative;
}

.to-hero__desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.6;
  position: relative;
}

/* Section */
.to-section-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--ink);
  margin-bottom: 10px;
}

.to-msg-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.to-msg-option {
  padding: 14px 16px;
  background: #fff;
  border: 2px solid var(--line);
  border-radius: 14px;
  cursor: pointer;
  font-size: 13px;
  color: var(--ink);
  line-height: 1.5;
  transition: all 0.15s;
}

.to-msg-option:active {
  transform: scale(0.99);
}

.to-msg-option--selected {
  border-color: var(--brand);
  background: var(--brand-pale);
}

/* Custom */
.to-custom {
  margin-bottom: 20px;
}

.to-custom__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-soft);
  margin-bottom: 6px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.to-custom__input {
  width: 100%;
  padding: 14px;
  border: 2px solid var(--line);
  border-radius: 14px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  color: var(--ink);
  background: #fff;
  line-height: 1.6;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.to-custom__input:focus {
  border-color: var(--brand);
}

/* Privacy */
.to-privacy {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.to-privacy__emoji {
  font-size: 16px;
  flex-shrink: 0;
}

.to-privacy__title {
  font-size: 12px;
  font-weight: 700;
  color: #15803d;
  margin-bottom: 2px;
}

.to-privacy__desc {
  font-size: 11.5px;
  color: #166534;
  line-height: 1.55;
}

.to-error {
  font-size: 13px;
  color: #ef4444;
  text-align: center;
  margin: 0 0 12px;
}

/* Send btn */
.to-send {
  width: 100%;
  border: none;
  padding: 15px;
  border-radius: 14px;
  background: var(--brand);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.to-send:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.to-foot-note {
  text-align: center;
  font-size: 11px;
  color: var(--ink-faint);
  margin-top: 8px;
}

/* Sent state */
.to-sent {
  text-align: center;
  padding: 20px 0;
}

.to-sent__circle {
  width: 80px;
  height: 80px;
  background: var(--brand-pale);
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin: 30px auto 16px;
  color: var(--brand);
}

.to-sent__title {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}

.to-sent__desc {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.65;
  margin-bottom: 24px;
}

.to-sent__card {
  background: var(--brand-pale);
  border: 1.5px solid var(--brand-soft);
  border-radius: 16px;
  padding: 16px;
  text-align: left;
  margin-bottom: 20px;
}

.to-sent__label {
  font-size: 11px;
  font-weight: 700;
  color: var(--brand);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.to-sent__preview {
  font-size: 13px;
  color: var(--ink);
  line-height: 1.6;
  font-style: italic;
}

/* WhatsApp */
.to-whatsapp {
  background: #f0fff4;
  border: 1.5px solid #bbf7d0;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 20px;
}

.to-whatsapp__label {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 10px;
  text-align: center;
}

.to-whatsapp__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: #25d366;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: opacity 0.15s;
}

.to-whatsapp__btn:active {
  opacity: 0.9;
}

.to-done {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: 14px;
  background: var(--navy);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
</style>
