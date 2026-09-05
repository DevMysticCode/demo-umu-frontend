<template>
  <div class="thread-page mobile-container">
    <header class="thread-nav">
      <button class="thread-nav-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <div class="thread-title">
        <div class="thread-title-name">{{ headerName }}</div>
        <div class="thread-title-sub">{{ headerSub }}</div>
      </div>
      <div class="thread-nav-btn" aria-hidden="true" />
    </header>

    <main ref="scrollHost" class="thread-body">
      <div v-if="loading && messages.length === 0" class="thread-empty">
        Loading…
      </div>
      <div v-else-if="error" class="thread-error">{{ error }}</div>
      <div v-else-if="messages.length === 0" class="thread-empty">
        No messages yet - say hello.
      </div>
      <div v-else class="thread-msgs">
        <template v-for="m in messages" :key="m.id">
          <!-- Structured cards live in their own container regardless of
               sender so they read as first-class events, not bubbles.  -->
          <div
            v-if="m.kind === 'viewing_request'"
            class="thread-card thread-card--viewing"
          >
            <div class="thread-card-eyebrow"><img src="/op-icons/calendar/calendar.png" alt="" class="inline-ic" loading="lazy" /> Viewing invite</div>
            <div class="thread-card-title">
              {{ m.payload?.propertyAddress || 'Property viewing' }}
            </div>
            <div class="thread-card-body" v-if="m.body">{{ m.body }}</div>
            <div class="thread-card-slots">
              <div
                v-for="s in (m.payload?.slots ?? [])"
                :key="s.startISO"
                class="thread-card-slot"
                :class="{ chosen: slotIsChosen(m, s) }"
              >
                {{ s.label || formatSlot(s) }}
              </div>
            </div>
            <div v-if="viewingStatus(m) !== 'pending'" class="thread-card-status">
              {{ viewingStatusLabel(m) }}
            </div>
            <div
              v-else-if="canRespondToViewing(m)"
              class="thread-card-actions"
            >
              <button
                v-for="s in (m.payload?.slots ?? [])"
                :key="s.startISO"
                class="thread-card-btn primary"
                :disabled="responding"
                @click="acceptViewing(m, s)"
              >
                Accept · {{ s.label || formatSlot(s) }}
              </button>
              <button
                class="thread-card-btn ghost"
                :disabled="responding"
                @click="declineViewing(m)"
              >
                Decline
              </button>
            </div>
          </div>

          <div
            v-else-if="m.kind === 'viewing_response'"
            class="thread-card thread-card--response"
            :class="{
              accepted: m.payload?.action === 'accept',
              declined: m.payload?.action === 'decline',
            }"
          >
            <div class="thread-card-eyebrow">
              {{
                m.payload?.action === 'accept'
                  ? '✅ Viewing accepted'
                  : m.payload?.action === 'decline'
                    ? '❌ Viewing declined'
                    : '🔁 New time proposed'
              }}
            </div>
            <div v-if="m.payload?.chosenSlot" class="thread-card-title">
              {{ m.payload.chosenSlot.label || formatSlot(m.payload.chosenSlot) }}
            </div>
            <div v-if="m.body" class="thread-card-body">{{ m.body }}</div>
          </div>

          <div
            v-else-if="m.kind === 'share_passport'"
            class="thread-card thread-card--passport"
          >
            <div class="thread-card-eyebrow"><img src="/op-icons/matched-buyers/link.png" alt="" class="inline-ic" loading="lazy" /> Passport shared</div>
            <div class="thread-card-title">
              {{ m.payload?.propertyAddress || 'Property Passport' }}
            </div>
            <div v-if="m.body" class="thread-card-body">{{ m.body }}</div>
            <div class="thread-card-actions">
              <button
                class="thread-card-btn primary"
                @click="openPassport(m.payload)"
              >
                {{ m.payload?.hasAccess ? 'View passport' : 'Preview + unlock' }}
              </button>
            </div>
          </div>

          <!-- Plain text bubble -->
          <div
            v-else
            class="thread-bubble"
            :class="isMine(m) ? 'thread-bubble--mine' : 'thread-bubble--theirs'"
          >
            <div class="thread-bubble-body">{{ m.body }}</div>
            <div class="thread-bubble-meta">
              <span class="thread-bubble-time">{{ formatTime(m.createdAt) }}</span>
              <!-- Read receipts on my outgoing messages only. One grey
                   check = delivered to the server; two blue checks =
                   read by the other participant. WhatsApp-style. -->
              <span
                v-if="isMine(m)"
                class="thread-tick"
                :class="{ 'thread-tick--read': isReadByOthers(m) }"
                :title="isReadByOthers(m) ? 'Read' : 'Sent'"
                aria-hidden="true"
              >
                <template v-if="isReadByOthers(m)">
                  <!-- Double tick -->
                  <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 6.5 4 9.5 10 3" />
                    <polyline points="7 6.5 10 9.5 19 1" />
                  </svg>
                </template>
                <template v-else>
                  <!-- Single tick -->
                  <svg viewBox="0 0 12 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 5 4.5 8.5 11 1.5" />
                  </svg>
                </template>
              </span>
            </div>
          </div>
        </template>
      </div>
    </main>

    <footer class="thread-input">
      <textarea
        v-model="draft"
        rows="1"
        class="thread-input-field"
        placeholder="Type a message"
        @keydown.enter.exact.prevent="onSend"
        @input="autosize"
        ref="inputEl"
      />
      <button
        type="button"
        class="thread-input-send"
        :disabled="!canSend"
        @click="onSend"
      >
        Send
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  useConversations,
  type MessageRow,
} from '~/composables/useConversations'
import { useMe } from '~/composables/useMe'

definePageMeta({
  title: 'Conversation - UmovingU',
  middleware: 'auth',
})

const router = useRouter()
const route = useRoute()
const conversationId = route.params.id as string

const {
  messages,
  participants,
  loading,
  error,
  loadMessages,
  sendMessage,
  markRead,
  respondToViewing,
} = useConversations()

const { myId } = useMe()

const draft = ref('')
const responding = ref(false)
const scrollHost = ref<HTMLElement | null>(null)
const inputEl = ref<HTMLTextAreaElement | null>(null)

// Light poll while the tab is visible so read-receipt ticks flip to
// blue when the other side opens the thread. Cheap: it's the same
// endpoint the initial load hits, and only fires when the tab is
// foregrounded. When we ship SSE later this timer goes away.
let pollTimer: ReturnType<typeof setInterval> | null = null
function startPolling() {
  stopPolling()
  pollTimer = setInterval(() => {
    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      loadMessages(conversationId)
    }
  }, 15_000)
}
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(async () => {
  await loadMessages(conversationId)
  await markRead(conversationId)
  await nextTick()
  scrollToBottom()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})

// True when every OTHER participant has a lastReadAt at or after this
// message's createdAt. WhatsApp's contract: sender sees blue ticks as
// soon as the recipient has "seen" (i.e. opened) the conversation
// after the message was posted. For a 1:1 thread this is exactly one
// recipient; for a future group thread the same predicate still holds
// (all others must have seen it).
function isReadByOthers(m: MessageRow): boolean {
  if (!m.senderId || !myId.value) return false
  const others = participants.value.filter((p) => p.userId !== myId.value)
  if (others.length === 0) return false
  const msgTime = new Date(m.createdAt).getTime()
  return others.every((p) => {
    if (!p.lastReadAt) return false
    return new Date(p.lastReadAt).getTime() >= msgTime
  })
}

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  },
)

function scrollToBottom() {
  const el = scrollHost.value
  if (el) el.scrollTop = el.scrollHeight
}

function autosize() {
  const el = inputEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(160, el.scrollHeight) + 'px'
}

const canSend = computed(() => draft.value.trim().length > 0 && !loading.value)

async function onSend() {
  if (!canSend.value) return
  const body = draft.value.trim()
  draft.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'
  try {
    await sendMessage(conversationId, body)
  } catch {
    draft.value = body // restore so the user doesn't lose their text
  }
}

function goBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/inbox')
  }
}

function isMine(m: MessageRow): boolean {
  return !!myId.value && m.senderId === myId.value
}

// ── Thread header — pick the peer we're talking to ───────────────
// We derive header from the message list rather than fetching the
// conversation row separately; every message includes sender info.
const otherSender = computed(() => {
  if (!myId.value) return null
  return messages.value.find((m) => m.senderId !== myId.value)?.sender ?? null
})

const headerName = computed(() => {
  const s = otherSender.value
  const n = [s?.firstName, s?.lastName].filter(Boolean).join(' ').trim()
  return n || 'Conversation'
})
const headerSub = computed(() => {
  // Try to infer a context label from the first viewing/share card so
  // the header conveys what the thread is about without a separate fetch.
  const firstCard = messages.value.find(
    (m) => m.kind === 'viewing_request' || m.kind === 'share_passport',
  )
  if (firstCard?.payload?.propertyAddress) {
    return firstCard.payload.propertyAddress
  }
  return 'Direct message'
})

// ── Viewing-request helpers ──────────────────────────────────────

function slotIsChosen(cardMsg: MessageRow, slot: any): boolean {
  const status = viewingStatus(cardMsg)
  if (status !== 'accepted') return false
  const responseMsg = viewingResponseFor(cardMsg)
  return responseMsg?.payload?.chosenSlot?.startISO === slot.startISO
}

function viewingStatus(cardMsg: MessageRow): string {
  const responseMsg = viewingResponseFor(cardMsg)
  if (!responseMsg) return 'pending'
  const action = responseMsg.payload?.action
  return action === 'accept'
    ? 'accepted'
    : action === 'decline'
      ? 'declined'
      : action === 'reschedule'
        ? 'rescheduled'
        : 'pending'
}

function viewingStatusLabel(cardMsg: MessageRow): string {
  const s = viewingStatus(cardMsg)
  if (s === 'accepted') return '✅ Viewing accepted'
  if (s === 'declined') return '❌ Viewing declined'
  if (s === 'rescheduled') return '🔁 New time proposed'
  return ''
}

function viewingResponseFor(cardMsg: MessageRow): MessageRow | undefined {
  const vrId = cardMsg.payload?.viewingRequestId
  if (!vrId) return undefined
  return messages.value.find(
    (m) =>
      m.kind === 'viewing_response' &&
      m.payload?.viewingRequestId === vrId,
  )
}

/** Only the invited user can accept/decline - and only while the
 *  request is still pending. Same guard as the backend so the buttons
 *  don't render when they'd fail. */
function canRespondToViewing(cardMsg: MessageRow): boolean {
  if (!myId.value) return false
  if (cardMsg.senderId === myId.value) return false // seller sent it
  return viewingStatus(cardMsg) === 'pending'
}

async function acceptViewing(cardMsg: MessageRow, slot: any) {
  const vrId = cardMsg.payload?.viewingRequestId
  if (!vrId || responding.value) return
  responding.value = true
  try {
    await respondToViewing(vrId, {
      action: 'accept',
      chosenSlot: { startISO: slot.startISO, endISO: slot.endISO, label: slot.label },
    })
    await loadMessages(conversationId)
  } finally {
    responding.value = false
  }
}

async function declineViewing(cardMsg: MessageRow) {
  const vrId = cardMsg.payload?.viewingRequestId
  if (!vrId || responding.value) return
  responding.value = true
  try {
    await respondToViewing(vrId, { action: 'decline' })
    await loadMessages(conversationId)
  } finally {
    responding.value = false
  }
}

function formatSlot(slot: { startISO: string; label?: string }): string {
  if (slot.label) return slot.label
  try {
    return new Date(slot.startISO).toLocaleString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return slot.startISO
  }
}
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ── Share-passport CTA ──────────────────────────────────────────
// If the recipient already has BuyerPassportAccess, land them straight
// on the passport view. Otherwise, route through /claim which handles
// the paid buyer-unlock flow. Passport-view already knows what to
// render when a buyer arrives with access.
function openPassport(payload: any) {
  if (!payload) return
  const passportId = payload.passportId
  const propertyId = payload.propertyId
  if (payload.hasAccess && passportId) {
    router.push(`/passportview/${passportId}`)
  } else if (propertyId) {
    router.push(`/property/${propertyId}`)
  }
}
</script>

<style scoped>
.inline-ic {
  width: 14px;
  height: 14px;
  object-fit: contain;
  vertical-align: -2px;
  display: inline-block;
  margin-right: 2px;
}
.thread-page {
  min-height: 100dvh;
  display: flex; flex-direction: column;
  background: #f5f6fa;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}
.thread-nav {
  display: flex; align-items: center;
  padding: 10px 12px;
  background: #fff;
  border-bottom: 1px solid #eef0f6;
  position: sticky; top: 0; z-index: 10;
}
.thread-nav-btn {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #231d45;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.thread-nav-btn svg { width: 18px; height: 18px; }
.thread-title { flex: 1; text-align: center; }
.thread-title-name { font-size: 15px; font-weight: 800; color: #231d45; }
.thread-title-sub { font-size: 11px; color: #6b7089; margin-top: 2px; }
.thread-body {
  flex: 1; overflow-y: auto;
  padding: 12px 16px 20px;
}
.thread-empty, .thread-error {
  padding: 40px 20px;
  text-align: center;
  color: #6b7089;
  font-size: 13px;
}
.thread-msgs {
  display: flex; flex-direction: column; gap: 8px;
}
.thread-bubble {
  max-width: 78%;
  padding: 9px 12px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.4;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.thread-bubble--mine {
  align-self: flex-end;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border-bottom-right-radius: 6px;
}
.thread-bubble--theirs {
  align-self: flex-start;
  background: #fff;
  color: #231d45;
  border-bottom-left-radius: 6px;
  border: 1px solid #eef0f6;
}
.thread-bubble-body { white-space: pre-wrap; }
.thread-bubble-meta {
  margin-top: 4px;
  display: flex; align-items: center; gap: 4px;
  justify-content: flex-end;
  font-size: 10px; font-weight: 600;
  opacity: 0.75;
}
.thread-bubble-time {
  line-height: 1;
}
.thread-bubble--theirs .thread-bubble-meta { color: #a8a9ad; opacity: 1; }
/* Ticks - grey (delivered) → sky-blue (read). Sits inside the aqua
   "mine" bubble, so we override the mine-bubble text colour just for
   the tick when it's flipped to read. */
.thread-tick {
  display: inline-flex; align-items: center;
  color: currentColor;
  opacity: 0.85;
}
.thread-tick svg { width: 14px; height: 10px; display: block; }
.thread-tick--read {
  color: #5EEAD4; /* light teal reads clearly on the aqua "mine" bubble */
  opacity: 1;
}

.thread-card {
  align-self: stretch;
  padding: 14px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  margin: 6px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.thread-card--viewing { border-left: 3px solid #00a19a; }
.thread-card--response.accepted { border-left: 3px solid #00a19a; }
.thread-card--response.declined { border-left: 3px solid #c73e36; }
.thread-card--passport { border-left: 3px solid #231d45; }
.thread-card-eyebrow {
  font-size: 10px; font-weight: 800;
  color: #008a84;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.thread-card--passport .thread-card-eyebrow { color: #231d45; }
.thread-card--response.declined .thread-card-eyebrow { color: #c73e36; }
.thread-card-title {
  font-size: 14px; font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
}
.thread-card-body {
  margin-top: 4px;
  font-size: 12.5px; font-weight: 500;
  color: #4b5169;
  line-height: 1.45;
}
.thread-card-slots {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-top: 10px;
}
.thread-card-slot {
  padding: 6px 10px;
  background: #f5f6fa;
  border: 1px solid #e4e5ed;
  border-radius: 100px;
  font-size: 11.5px; font-weight: 700;
  color: #231d45;
}
.thread-card-slot.chosen {
  background: #f2faf8;
  border-color: #00a19a;
  color: #008a84;
}
.thread-card-status {
  margin-top: 10px;
  font-size: 12px; font-weight: 800;
  color: #008a84;
}
.thread-card-actions {
  display: flex; flex-direction: column; gap: 6px;
  margin-top: 12px;
}
.thread-card-btn {
  padding: 10px 12px;
  border-radius: 10px;
  font: inherit; font-size: 12.5px; font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
}
.thread-card-btn.primary {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.25);
}
.thread-card-btn.ghost {
  background: #fff;
  border: 1.5px solid #e4e5ed;
  color: #231d45;
}
.thread-card-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.thread-input {
  display: flex; align-items: flex-end; gap: 8px;
  padding: 10px 12px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0));
  background: #fff;
  border-top: 1px solid #eef0f6;
  position: sticky; bottom: 0;
}
.thread-input-field {
  flex: 1; min-width: 0;
  padding: 10px 14px;
  border: 1.5px solid #e4e5ed;
  border-radius: 20px;
  font: inherit; font-size: 14px;
  color: #231d45;
  background: #f5f6fa;
  resize: none;
  outline: none;
  max-height: 160px;
  transition: border-color 0.15s, background 0.15s;
}
.thread-input-field:focus { border-color: #00a19a; background: #fff; }
.thread-input-send {
  padding: 10px 16px;
  border: none;
  border-radius: 100px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  font: inherit; font-size: 13px; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.25);
  transition: all 0.15s;
}
.thread-input-send:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
</style>
