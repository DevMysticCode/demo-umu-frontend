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

    <span class="sec-label">SELECT AGENT</span>
    <div class="recipient-card">
      <div
        v-for="a in agents"
        :key="a.id"
        class="recipient-row"
      >
        <div class="avatar" :style="{ background: sentId === a.id ? '#00a19a' : '#231d45' }">
          {{ a.initials }}
        </div>
        <div class="recipient-meta">
          <div class="recipient-firm">{{ a.firm }}</div>
          <div class="recipient-name">{{ a.name }}</div>
        </div>
        <button
          v-if="sentId !== a.id"
          class="send-btn"
          :disabled="sending"
          @click="onSend(a)"
        >
          ⤴ Send
        </button>
        <span v-else class="sent-badge">✓ Sent</span>
      </div>
    </div>

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
    </div>

    <!-- Add another -->
    <button class="sa-add-another" @click="sentId = null">+ Add another agent</button>
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
const sentAgent = ref<{ firm: string; name: string } | null>(null)
const published = ref(false)

const agents = [
  { id: 'jc', initials: 'JC', firm: 'Savills – Notting Hill', name: 'James Cooper' },
  { id: 'sm', initials: 'SM', firm: 'Knight Frank', name: 'Sarah Mitchell' },
  { id: 'dc', initials: 'DC', firm: 'Foxtons', name: 'David Chen' },
]

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
  return `${sentAgent.value.name} at ${sentAgent.value.firm.split(' – ')[0]} has been notified.`
})

async function onSend(a: typeof agents[number]) {
  if (!published.value) {
    showToast({
      message: 'Publish your profile first',
      iconEmoji: '⚠️',
    })
    return
  }
  sending.value = true
  try {
    await createShare({
      recipientName: `${a.name} · ${a.firm}`,
      expiresInDays: 30,
      scope: ['identity', 'deposit', 'sof', 'afford', 'story'],
    })
    sentId.value = a.id
    sentAgent.value = { firm: a.firm, name: a.name }
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

/* Recipient card */
.recipient-card {
  background: white;
  border: 2px solid #00a19a;
  border-radius: 14px;
  overflow: hidden;
  margin: 0 22px;
}
.recipient-row {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 14px;
  border-bottom: 1px solid #f5f5f7;
}
.recipient-row:last-child { border-bottom: none; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #231d45; color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; flex-shrink: 0;
}
.recipient-meta { flex: 1; min-width: 0; }
.recipient-firm {
  font-size: 12px; font-weight: 800; color: #231d45;
}
.recipient-name {
  font-size: 11px; color: #6b6783;
}
.send-btn {
  background: #00a19a; color: white; border: none;
  border-radius: 100px;
  padding: 7px 13px;
  font-family: inherit; font-size: 11px; font-weight: 800;
  cursor: pointer; white-space: nowrap;
}
.send-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.sent-badge {
  background: #e8f5ee; color: #2eab55;
  border: 1px solid #b8e8c8; border-radius: 100px;
  padding: 6px 12px;
  font-size: 11px; font-weight: 800; white-space: nowrap;
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
