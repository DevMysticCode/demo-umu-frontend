<template>
  <Teleport to="body">
    <Transition name="bad">
      <div v-if="kind" class="bad-overlay" @click.self="close">
        <div
          class="bad-sheet"
          :style="dragStyle"
          @click.stop
          @touchstart.passive="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <div class="bad-grip" />
          <div class="bad-head">
            <div class="bad-eyebrow">{{ eyebrow }}</div>
            <div class="bad-title">{{ title }}</div>
            <div class="bad-sub">for {{ buyer?.name }}</div>
          </div>

          <!-- Invite to view — slot picker -->
          <template v-if="kind === 'invite'">
            <div class="bad-body">
              <div class="bad-label">Choose one or more times</div>
              <div class="bad-slots">
                <button
                  v-for="slot in slotOptions"
                  :key="slot.startISO"
                  type="button"
                  class="bad-slot"
                  :class="{ selected: chosenStartISOs.has(slot.startISO) }"
                  @click="toggleSlot(slot.startISO)"
                >
                  <span class="bad-slot-day">{{ slot.day }}</span>
                  <span class="bad-slot-time">{{ slot.time }}</span>
                </button>
              </div>
              <div class="bad-label">Add a note (optional)</div>
              <textarea
                v-model="note"
                class="bad-textarea"
                rows="3"
                placeholder="e.g. Front door has a green wreath — can meet you outside"
              />
            </div>
            <div class="bad-actions">
              <button class="bad-btn ghost" type="button" :disabled="submitting" @click="close">
                Cancel
              </button>
              <button
                class="bad-btn primary"
                type="button"
                :disabled="submitting || chosenStartISOs.size === 0"
                @click="submitInvite"
              >
                {{ submitting ? 'Sending…' : `Send invite (${chosenStartISOs.size})` }}
              </button>
            </div>
          </template>

          <!-- Share passport — confirmation + optional note -->
          <template v-else-if="kind === 'share'">
            <div class="bad-body">
              <div class="bad-info">
                <p>
                  We'll share this passport with <b>{{ buyer?.name }}</b>. They'll
                  see the property and be prompted to
                  <b>unlock full access</b> — the paid buyer-unlock flow you already
                  have. If they've already unlocked, they'll get a direct link to
                  view.
                </p>
                <p class="muted">
                  You stay in control — this doesn't grant free access.
                </p>
              </div>
              <div class="bad-label">Add a note (optional)</div>
              <textarea
                v-model="note"
                class="bad-textarea"
                rows="3"
                placeholder="e.g. Thought you might want the full picture before we chat"
              />
            </div>
            <div class="bad-actions">
              <button class="bad-btn ghost" type="button" :disabled="submitting" @click="close">
                Cancel
              </button>
              <button
                class="bad-btn primary"
                type="button"
                :disabled="submitting"
                @click="submitShare"
              >
                {{ submitting ? 'Sharing…' : 'Share Passport' }}
              </button>
            </div>
          </template>

          <!-- Message — plain text -->
          <template v-else-if="kind === 'message'">
            <div class="bad-body">
              <div class="bad-label">Your message</div>
              <textarea
                v-model="messageText"
                class="bad-textarea"
                rows="5"
                autofocus
                placeholder="Hi — I saw you matched to my property. Wanted to say hello…"
              />
              <p class="bad-info-note">
                They'll be notified in-app and by push. You can carry on the
                conversation from the Inbox.
              </p>
            </div>
            <div class="bad-actions">
              <button class="bad-btn ghost" type="button" :disabled="submitting" @click="close">
                Cancel
              </button>
              <button
                class="bad-btn primary"
                type="button"
                :disabled="submitting || !messageText.trim()"
                @click="submitMessage"
              >
                {{ submitting ? 'Sending…' : 'Send message' }}
              </button>
            </div>
          </template>

          <div v-if="error" class="bad-error">{{ error }}</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  // Which action the user picked in the buyer detail drawer.
  kind: 'invite' | 'share' | 'message' | null
  // Buyer we're acting on — pulled straight from the matched-buyers list.
  // Must include userId (added to /property/:id/matched-buyers response).
  buyer: {
    userId?: string
    name: string
  } | null
  // Property + passport ids used by the endpoints.
  propertyId: string | null
  passportId: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'done', kind: 'invite' | 'share' | 'message', result: any): void
}>()

const config = useRuntimeConfig()

const submitting = ref(false)
const error = ref('')
const note = ref('')
const messageText = ref('')
const chosenStartISOs = ref<Set<string>>(new Set())

/** Default proposed slots — next 3 weekdays at 6pm local. Cheap for the
 *  seller to accept as-is or tweak; matches how estate agents typically
 *  suggest evening viewings mid-week. */
const slotOptions = computed(() => {
  const out: Array<{ startISO: string; endISO: string; day: string; time: string; label: string }> = []
  const now = new Date()
  let d = new Date(now)
  d.setHours(18, 0, 0, 0)
  if (d <= now) d.setDate(d.getDate() + 1)
  let picked = 0
  while (picked < 5 && out.length < 5) {
    const day = d.getDay()
    if (day !== 0 && day !== 6) {
      const start = new Date(d)
      const end = new Date(d)
      end.setMinutes(end.getMinutes() + 45)
      out.push({
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        day: start.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: start.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }),
        label: start.toLocaleString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      })
      picked++
    }
    d.setDate(d.getDate() + 1)
    d.setHours(18, 0, 0, 0)
  }
  return out
})

// Reset local state whenever the drawer opens for a new action.
watch(
  () => props.kind,
  (next) => {
    error.value = ''
    submitting.value = false
    note.value = ''
    messageText.value = ''
    chosenStartISOs.value = new Set()
    if (next) {
      // Pre-select the first slot for the invite flow so the primary
      // CTA is enabled without extra taps in the common case.
      if (next === 'invite' && slotOptions.value[0]) {
        chosenStartISOs.value = new Set([slotOptions.value[0].startISO])
      }
    }
  },
)

function toggleSlot(startISO: string) {
  const next = new Set(chosenStartISOs.value)
  if (next.has(startISO)) next.delete(startISO)
  else next.add(startISO)
  chosenStartISOs.value = next
}

const eyebrow = computed(() =>
  props.kind === 'invite' ? '📅 Invite to view'
  : props.kind === 'share' ? '🔗 Share Passport'
  : '💬 Message',
)
const title = computed(() =>
  props.kind === 'invite' ? 'Propose a viewing'
  : props.kind === 'share' ? 'Share your Passport'
  : 'Send a message',
)

function close() {
  if (submitting.value) return
  emit('close')
}

const { dragStyle, onTouchStart, onTouchMove, onTouchEnd } = useSwipeToDismiss({
  onDismiss: close,
  handleSelector: '.bad-grip',
})

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function submitInvite() {
  if (!props.buyer?.userId || !props.propertyId) {
    error.value = 'Missing buyer or property.'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const slots = slotOptions.value
      .filter((s) => chosenStartISOs.value.has(s.startISO))
      .map((s) => ({ startISO: s.startISO, endISO: s.endISO, label: s.label }))
    const res = await $fetch(
      `${config.public.apiBase}/property/${props.propertyId}/viewing-request`,
      {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: {
          invitedUserId: props.buyer.userId,
          slots,
          message: note.value.trim() || undefined,
        },
      },
    )
    emit('done', 'invite', res)
  } catch (err: any) {
    error.value = friendlyError(err, 'Could not send the invite. Please try again.')
  } finally {
    submitting.value = false
  }
}

async function submitShare() {
  if (!props.buyer?.userId || !props.passportId) {
    error.value = 'Missing buyer or passport.'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const res = await $fetch(
      `${config.public.apiBase}/passport/${props.passportId}/share-with-buyer`,
      {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: {
          buyerUserId: props.buyer.userId,
          note: note.value.trim() || undefined,
        },
      },
    )
    emit('done', 'share', res)
  } catch (err: any) {
    error.value = friendlyError(err, 'Could not share the passport. Please try again.')
  } finally {
    submitting.value = false
  }
}

async function submitMessage() {
  if (!props.buyer?.userId || !props.passportId) {
    error.value = 'Missing buyer or passport.'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const res = await $fetch(`${config.public.apiBase}/conversations/start`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: {
        context: 'passport_match',
        contextId: props.passportId,
        peerUserId: props.buyer.userId,
        selfRole: 'owner',
        peerRole: 'buyer',
        initialMessage: messageText.value.trim(),
      },
    })
    emit('done', 'message', res)
  } catch (err: any) {
    error.value = friendlyError(err, 'Could not send the message. Please try again.')
  } finally {
    submitting.value = false
  }
}

function friendlyError(err: any, fallback: string): string {
  const msg = err?.data?.message || err?.message
  if (typeof msg === 'string' && msg.length < 120) return msg
  return fallback
}
</script>

<style scoped>
.bad-overlay {
  position: fixed; inset: 0;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1300;
  display: flex; align-items: flex-end; justify-content: center;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}
.bad-sheet {
  width: 100%; max-width: 28rem;
  background: #fff;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 -8px 30px rgba(35, 29, 69, 0.25);
  max-height: 92dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.bad-grip {
  width: 42px; height: 4px;
  background: #e4e5ed;
  border-radius: 100px;
  margin: 10px auto 0;
  touch-action: none;
}
.bad-head { padding: 14px 22px 6px; }
.bad-eyebrow {
  font-size: 10px; font-weight: 800;
  color: #008a84;
  letter-spacing: 1.4px; text-transform: uppercase;
  margin-bottom: 6px;
}
.bad-title {
  font-size: 20px; font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px; line-height: 1.2;
  margin-bottom: 4px;
}
.bad-sub {
  font-size: 12.5px; font-weight: 500;
  color: #6b7089;
}
.bad-body { padding: 12px 22px 4px; }
.bad-label {
  font-size: 10px; font-weight: 800;
  color: #a8a9ad;
  letter-spacing: 1.2px; text-transform: uppercase;
  margin: 10px 0 6px;
}
.bad-slots {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.bad-slot {
  display: flex; flex-direction: column;
  align-items: flex-start; gap: 2px;
  padding: 10px 12px;
  background: #f5f6fa;
  border: 1.5px solid #e4e5ed;
  border-radius: 12px;
  font: inherit; text-align: left;
  cursor: pointer;
  transition: all 0.12s;
}
.bad-slot:hover { border-color: #b2e4e1; }
.bad-slot.selected {
  background: #f2faf8;
  border-color: #00a19a;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.15);
}
.bad-slot-day {
  font-size: 11px; font-weight: 800;
  color: #008a84;
  letter-spacing: 0.2px; text-transform: uppercase;
}
.bad-slot-time {
  font-size: 14px; font-weight: 800;
  color: #231d45;
}
.bad-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e4e5ed;
  border-radius: 10px;
  font: inherit; font-size: 13px;
  color: #231d45;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
}
.bad-textarea:focus { border-color: #00a19a; }
.bad-info {
  padding: 12px 14px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  border-radius: 12px;
  font-size: 12.5px;
  color: #231d45;
  line-height: 1.5;
}
.bad-info p { margin: 0 0 6px; }
.bad-info p:last-child { margin: 0; }
.bad-info .muted { color: #6b7089; font-size: 11.5px; }
.bad-info-note {
  margin: 8px 0 0;
  font-size: 11.5px;
  color: #6b7089;
  line-height: 1.5;
}
.bad-actions {
  display: grid; grid-template-columns: 1fr 1.6fr;
  gap: 8px;
  padding: 14px 22px 18px;
}
.bad-btn {
  padding: 13px;
  font: inherit; font-size: 13px; font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.bad-btn.ghost {
  background: #fff;
  border: 1.5px solid #e4e5ed;
  color: #231d45;
}
.bad-btn.primary {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.bad-btn:disabled {
  opacity: 0.5; cursor: not-allowed;
}
.bad-error {
  padding: 8px 22px 12px;
  color: #c73e36;
  font-size: 12.5px;
  font-weight: 600;
}

.bad-enter-active,
.bad-leave-active { transition: opacity 0.25s ease; }
.bad-enter-active .bad-sheet,
.bad-leave-active .bad-sheet {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.bad-enter-from,
.bad-leave-to { opacity: 0; }
.bad-enter-from .bad-sheet,
.bad-leave-to .bad-sheet { transform: translateY(100%); }
</style>
