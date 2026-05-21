<template>
  <div class="sa-page">
    <!-- Top nav -->
    <div class="sa-top-nav">
      <button class="sa-back" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div class="sa-nav-centre">Share with Agent</div>
      <span class="sa-nav-right" @click="goView">Done</span>
    </div>

    <!-- Scope reminder (prototype-exact) -->
    <div class="scope-panel">
      <div class="scope-title">📋 THEY WILL SEE</div>
      <div class="scope-row">
        <div class="scope-check"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></div>
        ID Verified (Onfido / DVS)
      </div>
      <div class="scope-row">
        <div class="scope-check"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></div>
        Budget · Proof of deposit · AML clear
      </div>
      <div class="scope-row">
        <div class="scope-check"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></div>
        Chain free · Solicitor instructed
      </div>
      <div class="scope-hidden">
        🔒 Not shared: account numbers, full DOB, credit score, personal address
      </div>
    </div>

    <span class="sec-label">AGENT DETAILS</span>
    <form class="recipient-card recipient-form" @submit.prevent="onSend">
      <label class="sa-field">
        <span class="sa-field-label">Agent name</span>
        <input
          v-model="form.name"
          type="text"
          class="sa-input"
          placeholder="e.g. James Cooper"
          required
          :disabled="sending || !!sentId"
        />
      </label>
      <label class="sa-field">
        <span class="sa-field-label">
          Email
          <span class="sa-field-hint">— the secure link is sent here</span>
        </span>
        <input
          v-model="form.email"
          type="email"
          class="sa-input"
          placeholder="agent@savills.co.uk"
          required
          :disabled="sending || !!sentId"
        />
      </label>
      <label class="sa-field">
        <span class="sa-field-label">
          Firm
          <span class="sa-field-hint">— optional</span>
        </span>
        <input
          v-model="form.firm"
          type="text"
          class="sa-input"
          placeholder="e.g. Savills, Knight Frank"
          :disabled="sending || !!sentId"
        />
      </label>

      <button
        v-if="!sentId"
        type="submit"
        class="send-btn-wide"
        :disabled="sending || !canSubmit"
      >
        <span v-if="sending" class="sa-spinner" />
        {{ sending ? 'Sending…' : '⤴ Send secure link' }}
      </button>
    </form>

    <!-- Confirmation card -->
    <div v-if="sentId" class="sa-confirm-wrap">
      <div class="sent-confirm">
        <div class="sent-emoji">✅</div>
        <div class="sent-title">Profile sent!</div>
        <div class="sent-sub">{{ sentSubLine }}</div>
        <div class="sent-foot">
          They'll receive a secure link to view your verified credentials.
        </div>
      </div>
      <div class="sa-back-cta-wrap">
        <button class="cta-btn outline" @click="goView">Back to my profile</button>
      </div>
      <!-- Add another -->
      <button class="sa-add-another" @click="resetForm">+ Send to another agent</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBuyerProfile } from '~/composables/useBuyerProfile'
import { useAppToast } from '~/composables/useCustomToast'

definePageMeta({ title: 'Share with Agent — UmovingU', middleware: 'auth' })

const router = useRouter()
const { getBuyerProfile, createShare } = useBuyerProfile()
const { showToast } = useAppToast()

const sending = ref(false)
const sentId = ref<string | null>(null)
const sentAgent = ref<{ firm: string; name: string; email: string } | null>(null)
const published = ref(false)

const form = ref<{ name: string; email: string; firm: string }>({
  name: '',
  email: '',
  firm: '',
})

const canSubmit = computed(
  () => form.value.name.trim().length > 1 && /.+@.+\..+/.test(form.value.email),
)

onMounted(async () => {
  try {
    const p = await getBuyerProfile()
    if (!p) router.replace('/buyer-profile')
    else published.value = !!p.published
  } catch {
    router.replace('/buyer-profile')
  }
})

const sentSubLine = computed(() => {
  if (!sentAgent.value) return ''
  const firmBit = sentAgent.value.firm ? ` at ${sentAgent.value.firm}` : ''
  return `${sentAgent.value.name}${firmBit} has been notified.`
})

function resetForm() {
  form.value = { name: '', email: '', firm: '' }
  sentId.value = null
  sentAgent.value = null
}

async function onSend() {
  if (!published.value) {
    showToast({ message: 'Publish your profile first', iconEmoji: '⚠️' })
    return
  }
  if (!canSubmit.value) return
  sending.value = true
  try {
    const name = form.value.name.trim()
    const email = form.value.email.trim()
    const firm = form.value.firm.trim()
    const recipientName = firm ? `${name} · ${firm}` : name
    await createShare({
      recipientName,
      recipientEmail: email,
      expiresInDays: 30,
      scope: ['identity', 'deposit', 'sof', 'afford', 'story'],
    })
    // Stamp a synthetic id so the confirmation panel switches in.
    sentId.value = `${Date.now()}`
    sentAgent.value = { firm, name, email }
  } catch (e: any) {
    showToast({
      message: e?.data?.message || 'Could not send',
      iconEmoji: '⚠️',
    })
  } finally {
    sending.value = false
  }
}

const goBack = useGoBack('/buyer-profile/view')
function goView() { router.push('/buyer-profile/view') }
</script>

<style scoped>
.sa-page {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-bottom: 32px;
}

.sa-top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 6px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.sa-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 1px solid #ececef;
  display: flex; align-items: center; justify-content: center;
  color: #231d45; cursor: pointer; flex-shrink: 0;
}
.sa-nav-centre {
  flex: 1; text-align: center;
  font-size: 14px; font-weight: 800; color: #231d45;
}
.sa-nav-right {
  font-size: 13px; font-weight: 700; color: #00a19a;
  cursor: pointer; padding: 8px 4px; white-space: nowrap;
}

/* Scope panel — same as share */
.scope-panel {
  background: #f2faf8;
  border: 1.5px solid #e5f4f2;
  border-radius: 14px;
  padding: 12px 14px;
  margin: 10px 22px 0;
}
.scope-title {
  font-size: 11px; font-weight: 800;
  color: #007e78; letter-spacing: 0.5px;
  margin-bottom: 7px;
}
.scope-row {
  display: flex; align-items: center; gap: 7px;
  font-size: 11.5px; font-weight: 700; color: #231d45;
  margin-bottom: 4px;
}
.scope-row:last-of-type { margin-bottom: 0; }
.scope-check {
  width: 14px; height: 14px; border-radius: 50%;
  background: #00a19a;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.scope-hidden {
  font-size: 10px; font-weight: 700; color: #9c98ad;
  margin-top: 7px;
  padding-top: 7px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.sec-label {
  font-size: 11px; font-weight: 800;
  color: #6b6783; letter-spacing: 1px;
  text-transform: uppercase;
  padding: 16px 22px 8px;
  display: block;
}

/* Recipient form (free-text) */
.recipient-card {
  background: white;
  border: 2px solid #00a19a;
  border-radius: 14px;
  overflow: hidden;
  margin: 0 22px;
}
.recipient-form {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sa-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.sa-field-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #6b6783;
}
.sa-field-hint {
  font-weight: 600;
  color: #9c98ad;
  letter-spacing: 0;
}
.sa-input {
  width: 100%;
  padding: 11px 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #231d45;
  background: #fafafa;
  border: 1.5px solid #ececef;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}
.sa-input:focus {
  border-color: #00a19a;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.1);
}
.sa-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.sa-input::placeholder {
  color: #9c98ad;
  font-weight: 500;
}
.send-btn-wide {
  margin-top: 4px;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 100px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.send-btn-wide:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.sa-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: sa-spin 0.7s linear infinite;
}
@keyframes sa-spin {
  to { transform: rotate(360deg); }
}

.sa-confirm-wrap {
  margin-top: 14px;
  animation: sa-fadeUp 0.35s ease both;
}
@keyframes sa-fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.sent-confirm {
  background: linear-gradient(135deg, #dcfce7, #f0fdf4);
  border: 1.5px solid #b8e8c8;
  border-radius: 16px;
  padding: 18px 22px;
  margin: 0 22px;
  text-align: center;
}
.sent-emoji { font-size: 36px; margin-bottom: 8px; }
.sent-title {
  font-size: 15px; font-weight: 800; color: #166534;
  margin-bottom: 4px;
}
.sent-sub {
  font-size: 12px; color: #166534; opacity: 0.8;
}
.sent-foot {
  font-size: 11px; color: #166534; opacity: 0.6;
  margin-top: 4px;
}
.sa-back-cta-wrap {
  padding: 12px 22px 0;
}
.sa-add-another {
  display: block; text-align: center;
  margin: 12px auto 0;
  background: none; border: none;
  font-family: inherit;
  font-size: 12px; font-weight: 700; color: #007e78;
  cursor: pointer; padding: 8px 22px; width: 100%;
}

.cta-btn {
  width: 100%;
  background: #00a19a; color: white; border: none;
  border-radius: 14px; padding: 13px;
  font-family: inherit; font-size: 13px; font-weight: 800;
  cursor: pointer;
}
.cta-btn.outline {
  background: white; color: #231d45;
  border: 1.5px solid #231d45;
}
</style>
