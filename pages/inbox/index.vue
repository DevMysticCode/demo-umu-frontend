<template>
  <div class="inbox-page mobile-container">
    <header class="inbox-nav">
      <button class="inbox-nav-back" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <h1 class="inbox-title">Inbox</h1>
      <div class="inbox-nav-spacer" />
    </header>

    <main class="inbox-body">
      <div v-if="loading && conversations.length === 0" class="inbox-empty">
        Loading…
      </div>
      <div v-else-if="error" class="inbox-error">{{ error }}</div>
      <div v-else-if="conversations.length === 0" class="inbox-empty">
        <div class="inbox-empty-icon"><img src="/op-icons/matched-buyers/chat.png" alt="" loading="lazy" /></div>
        <div class="inbox-empty-title">No conversations yet</div>
        <div class="inbox-empty-sub">
          When someone invites you to view, shares a passport, or messages
          you, it'll show up here.
        </div>
      </div>
      <div v-else class="inbox-list">
        <button
          v-for="c in conversations"
          :key="c.id"
          type="button"
          class="inbox-row"
          @click="openThread(c.id)"
        >
          <div class="inbox-row-avatar">
            {{ initialFor(c) }}
          </div>
          <div class="inbox-row-body">
            <div class="inbox-row-top">
              <div class="inbox-row-name">{{ peerName(c) }}</div>
              <div class="inbox-row-time">{{ relativeTime(c.lastMessageAt ?? c.createdAt) }}</div>
            </div>
            <div class="inbox-row-context">{{ contextLabel(c.context) }}</div>
            <div class="inbox-row-preview">
              <span v-if="lastMessageKind(c) !== 'text'" class="inbox-row-kind">
                <img
                  v-if="kindIcon(lastMessageKind(c)).startsWith('/')"
                  :src="kindIcon(lastMessageKind(c))"
                  alt=""
                  class="inline-ic"
                  loading="lazy"
                />
                <template v-else>{{ kindIcon(lastMessageKind(c)) }}</template>
              </span>
              {{ lastMessagePreview(c) }}
            </div>
          </div>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useConversations, type ConversationRow } from '~/composables/useConversations'
import { useMe } from '~/composables/useMe'

definePageMeta({
  title: 'Inbox - UmovingU',
  middleware: 'auth',
})

const router = useRouter()
const { conversations, loading, error, list } = useConversations()
const { myId } = useMe()

onMounted(() => {
  list()
})

function goBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}

function openThread(id: string) {
  router.push(`/inbox/${id}`)
}

/** Pick out the "other" participant so the row shows who I'm talking
 *  to, not myself. Fallback to the first participant if we can't tell
 *  (e.g. auth composable didn't hydrate a user id in time). */
function peer(c: ConversationRow) {
  const me = myId.value
  const others = me
    ? c.participants.filter((p) => p.userId !== me)
    : c.participants
  return others[0] ?? c.participants[0]
}

function peerName(c: ConversationRow): string {
  const p = peer(c)
  const first = p?.user?.firstName ?? ''
  const last = p?.user?.lastName ?? ''
  const name = [first, last].filter(Boolean).join(' ').trim()
  return name || 'UmovingU user'
}

function initialFor(c: ConversationRow): string {
  const n = peerName(c)
  return n.charAt(0).toUpperCase() || '?'
}

function contextLabel(context: string): string {
  switch (context) {
    case 'passport_match': return 'Passport match'
    case 'property_enquiry': return 'Property enquiry'
    case 'marketplace_job': return 'Marketplace'
    default: return context
  }
}

function lastMessageKind(c: ConversationRow): string {
  return c.messages?.[0]?.kind ?? 'text'
}

function kindIcon(kind: string): string {
  switch (kind) {
    case 'viewing_request': return '/op-icons/calendar/calendar.png'
    case 'viewing_response': return '✅'
    case 'share_passport': return '/op-icons/matched-buyers/link.png'
    case 'payment_prompt': return '/op-icons/investment/moneyBagPound.png'
    case 'system': return 'ℹ️'
    default: return ''
  }
}

function lastMessagePreview(c: ConversationRow): string {
  const m = c.messages?.[0]
  if (!m) return 'No messages yet'
  const body = (m.body || '').trim()
  if (body) return body.length > 90 ? body.slice(0, 87) + '…' : body
  // Structured cards may have empty body — describe them briefly.
  switch (m.kind) {
    case 'viewing_request': return 'Sent a viewing invite'
    case 'viewing_response': return 'Responded to a viewing invite'
    case 'share_passport': return 'Shared a passport'
    default: return '—'
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return ''
  const now = Date.now()
  const then = new Date(iso).getTime()
  const s = Math.max(0, Math.round((now - then) / 1000))
  if (s < 60) return 'now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
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
.inbox-page {
  min-height: 100dvh;
  background: #f5f6fa;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}
.inbox-nav {
  display: flex; align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eef0f6;
  position: sticky; top: 0; z-index: 10;
}
.inbox-nav-back, .inbox-nav-spacer {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #231d45;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.inbox-nav-back svg { width: 18px; height: 18px; }
.inbox-title {
  flex: 1; text-align: center;
  font-size: 17px; font-weight: 800;
  color: #231d45;
  margin: 0;
}
.inbox-body { padding: 0; }
.inbox-empty {
  padding: 60px 24px;
  text-align: center;
  color: #6b7089;
}
.inbox-empty-icon { font-size: 42px; margin-bottom: 12px; width: 56px; height: 56px; margin-left: auto; margin-right: auto; }
.inbox-empty-icon img { width: 100%; height: 100%; object-fit: contain; display: block; }
.inbox-empty-title { font-size: 16px; font-weight: 800; color: #231d45; margin-bottom: 6px; }
.inbox-empty-sub { font-size: 13px; color: #6b7089; max-width: 300px; margin: 0 auto; line-height: 1.5; }
.inbox-error {
  margin: 24px;
  padding: 12px 14px;
  background: #fdecea;
  color: #c73e36;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}
.inbox-list { display: flex; flex-direction: column; }
.inbox-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: none;
  border-bottom: 1px solid #eef0f6;
  font: inherit; text-align: left;
  cursor: pointer;
  transition: background 0.12s;
}
.inbox-row:hover { background: #fafbfd; }
.inbox-row-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00b8b0, #008a84);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800;
  flex-shrink: 0;
}
.inbox-row-body { flex: 1; min-width: 0; }
.inbox-row-top {
  display: flex; align-items: baseline; justify-content: space-between;
  gap: 8px;
}
.inbox-row-name {
  font-size: 14px; font-weight: 800;
  color: #231d45;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.inbox-row-time {
  font-size: 11px; font-weight: 600;
  color: #a8a9ad;
  flex-shrink: 0;
}
.inbox-row-context {
  margin-top: 2px;
  font-size: 10.5px; font-weight: 800;
  color: #008a84;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.inbox-row-preview {
  margin-top: 3px;
  font-size: 12.5px; font-weight: 500;
  color: #6b7089;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.inbox-row-kind {
  margin-right: 4px;
}
</style>
