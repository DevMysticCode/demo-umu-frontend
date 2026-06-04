<template>
  <!-- Thread view — bubble UI ported from the prototype's messages
       screen. Marks everything read on first paint. Sends are
       optimistic: the bubble appears immediately, then reconciles
       with the server response. -->
  <div class="th-page mobile-container">
    <div class="th-header">
      <button class="th-back-btn" type="button" aria-label="Back" @click="goBack">‹</button>
      <div class="th-header-body">
        <div class="th-header-name">{{ thread?.otherPartyName || 'Loading…' }}</div>
        <div v-if="thread" class="th-header-sub">
          {{ thread.jobCategoryLabel }} · {{ thread.jobTitle }}
        </div>
      </div>
      <button
        v-if="thread"
        class="th-header-job-btn"
        type="button"
        aria-label="Open job"
        @click="openJob"
      >
        📋
      </button>
    </div>

    <template v-if="pending">
      <div class="th-loading">Loading thread…</div>
    </template>

    <template v-else-if="!thread">
      <div class="th-empty">Couldn't load this thread.</div>
    </template>

    <template v-else>
      <div class="th-messages" ref="messagesEl">
        <div v-if="!thread.messages.length" class="th-no-messages">
          Send the first message — say hi 👋
        </div>
        <div
          v-for="(m, idx) in thread.messages"
          :key="m.id"
          class="th-bubble-row"
          :class="{ mine: m.isMine }"
        >
          <div class="th-bubble" :class="{ mine: m.isMine }">{{ m.body }}</div>
          <div
            v-if="shouldShowTime(idx)"
            class="th-time"
            :class="{ mine: m.isMine }"
          >
            {{ formatTime(m.createdAt) }}
          </div>
        </div>
      </div>

      <div v-if="sendError" class="th-error">{{ sendError }}</div>

      <div class="th-composer">
        <textarea
          v-model="draft"
          class="th-composer-input"
          placeholder="Type a message…"
          rows="1"
          @keydown.enter.exact.prevent="onSend"
        />
        <button
          class="th-send-btn"
          type="button"
          :disabled="!canSend || sending"
          @click="onSend"
        >
          {{ sending ? '…' : '➤' }}
        </button>
      </div>
    </template>

    <MarketplaceBottomNav active="inbox" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type { MarketplaceMessage, MarketplaceThreadDetail } from '~/composables/useMarketplace'

definePageMeta({ title: 'Conversation — Marketplace', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { fetchThread, sendMessage, markThreadRead } = useMarketplace()

const threadId = computed(() => String(route.params.id))

const thread = ref<MarketplaceThreadDetail | null>(null)
const pending = ref(true)
const messagesEl = ref<HTMLElement | null>(null)

const draft = ref('')
const sending = ref(false)
const sendError = ref<string | null>(null)

async function load() {
  pending.value = true
  try {
    thread.value = await fetchThread(threadId.value)
    // Mark every inbound unread message read as soon as the user
    // opens the thread. Fire-and-forget — we don't block the render
    // on it, and a failure here just means the badge stays for a
    // moment longer on the inbox.
    markThreadRead(threadId.value).catch(() => {})
  } catch {
    thread.value = null
  } finally {
    pending.value = false
  }
  await nextTick()
  scrollToBottom()
}

onMounted(load)

const canSend = computed(() => draft.value.trim().length > 0)

async function onSend() {
  if (!canSend.value || sending.value || !thread.value) return
  const body = draft.value.trim()
  sendError.value = null
  sending.value = true

  // Optimistic: drop the bubble in immediately so the conversation
  // feels live, then reconcile with the server's authoritative copy.
  const tempId = `tmp-${Date.now()}`
  const optimistic: MarketplaceMessage = {
    id: tempId,
    senderId: 'me',
    body,
    createdAt: new Date().toISOString(),
    isMine: true,
  }
  thread.value.messages.push(optimistic)
  draft.value = ''
  await nextTick()
  scrollToBottom()

  try {
    const saved = await sendMessage(threadId.value, body)
    // Replace temp with server copy
    const idx = thread.value.messages.findIndex((m) => m.id === tempId)
    if (idx !== -1) thread.value.messages[idx] = saved
  } catch (err: any) {
    // Roll back the optimistic bubble
    thread.value.messages = thread.value.messages.filter((m) => m.id !== tempId)
    draft.value = body
    sendError.value = err?.data?.message ?? 'Could not send message. Try again.'
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  const el = messagesEl.value
  if (el) el.scrollTop = el.scrollHeight
}

// Show a timestamp under a bubble only when the next message arrives
// more than 5 minutes later (keeps the thread visually tight).
function shouldShowTime(idx: number): boolean {
  if (!thread.value) return false
  const msgs = thread.value.messages
  const cur = msgs[idx]
  const next = msgs[idx + 1]
  if (!next) return true
  return new Date(next.createdAt).getTime() - new Date(cur.createdAt).getTime() > 5 * 60 * 1000
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toDateString() === today.toDateString()
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return time
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${time}`
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/marketplace/inbox')
}
function openJob() {
  if (thread.value) router.push(`/marketplace/jobs/${thread.value.jobId}`)
}
</script>

<style scoped>
.th-page {
  min-height: 100vh;
  background: #f0f2f8;
  display: flex;
  flex-direction: column;
  color: #231d45;
}

/* ── Header ──────────────────────────────────────────────────── */
.th-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
  background: #fff;
  border-bottom: 1px solid #eef0f6;
}
.th-back-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  color: #231d45;
  font-size: 22px; font-weight: 800; line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.th-header-body {
  flex: 1;
  min-width: 0;
}
.th-header-name {
  font-size: 14.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.th-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.th-header-job-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Messages list ───────────────────────────────────────────── */
.th-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 120px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.th-loading, .th-empty, .th-no-messages {
  flex: 1;
  text-align: center;
  padding: 60px 24px;
  font-size: 13px; font-weight: 600;
  color: #6b7089;
}

.th-bubble-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 4px;
}
.th-bubble-row.mine {
  align-items: flex-end;
}
.th-bubble {
  max-width: 76%;
  padding: 10px 14px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #eef0f6;
  font-size: 13.5px;
  font-weight: 500;
  color: #231d45;
  line-height: 1.45;
  white-space: pre-wrap;
  word-wrap: break-word;
  box-shadow: 0 2px 6px rgba(35, 29, 69, 0.04);
}
.th-bubble.mine {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border-color: transparent;
}
.th-time {
  font-size: 10px;
  font-weight: 700;
  color: #a8a9ad;
  margin: 4px 4px 8px;
}
.th-time.mine {
  align-self: flex-end;
}

/* ── Composer ────────────────────────────────────────────────── */
.th-composer {
  position: fixed;
  bottom: calc(64px + env(safe-area-inset-bottom));
  left: 0; right: 0;
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid #eef0f6;
  max-width: 28rem;
  margin: 0 auto;
}
.th-composer-input {
  flex: 1;
  background: #f5f6fa;
  border: 1px solid transparent;
  border-radius: 18px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  color: #231d45;
  outline: none;
  resize: none;
  max-height: 100px;
  min-height: 38px;
}
.th-composer-input:focus { border-color: #00a19a; background: #fff; }
.th-send-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 161, 154, 0.3);
  flex-shrink: 0;
}
.th-send-btn:disabled {
  background: #c8cad6;
  cursor: not-allowed;
  box-shadow: none;
}

.th-error {
  margin: 8px 16px 0;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: #c43c3c;
  text-align: center;
}
</style>
