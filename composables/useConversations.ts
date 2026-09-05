import { ref } from 'vue'

/**
 * Thin API wrapper for the shared conversations service.
 * Not a global store - every page gets its own instance and manages
 * its own reactive state. Notifications composable handles the badge.
 */

export interface ParticipantRow {
  id: string
  userId: string
  role: string | null
  lastReadAt: string | null
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    avatarUrl: string | null
  }
}

export interface ConversationRow {
  id: string
  context: string
  contextId: string
  lastMessageAt: string | null
  createdAt: string
  participants: ParticipantRow[]
  messages: Array<{
    id: string
    body: string
    kind: string
    payload: any
    senderId: string
    createdAt: string
  }>
}

export interface MessageRow {
  id: string
  conversationId: string
  senderId: string
  kind: string
  body: string
  payload: any
  createdAt: string
  sender: {
    id: string
    firstName: string | null
    lastName: string | null
    avatarUrl: string | null
  }
}

function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useConversations() {
  const config = useRuntimeConfig()
  const apiBase = () => config.public.apiBase as string

  const conversations = ref<ConversationRow[]>([])
  const messages = ref<MessageRow[]>([])
  // Participant list for the currently-loaded thread — carries each
  // user's lastReadAt so the thread view can compute WhatsApp-style
  // read receipts for outgoing messages without a second round-trip.
  const participants = ref<Array<{ userId: string; lastReadAt: string | null; role: string | null }>>([])
  const loading = ref(false)
  const error = ref('')

  async function list() {
    loading.value = true
    error.value = ''
    try {
      conversations.value = await $fetch<ConversationRow[]>(
        `${apiBase()}/conversations`,
        { headers: authHeaders() },
      )
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Failed to load inbox'
    } finally {
      loading.value = false
    }
  }

  async function loadMessages(conversationId: string) {
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<{
        messages: MessageRow[]
        participants: Array<{ userId: string; lastReadAt: string | null; role: string | null }>
      }>(
        `${apiBase()}/conversations/${conversationId}/messages`,
        { headers: authHeaders() },
      )
      messages.value = res.messages
      participants.value = res.participants
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Failed to load messages'
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(conversationId: string, body: string) {
    const trimmed = body.trim()
    if (!trimmed) return null
    const sent = await $fetch<MessageRow>(
      `${apiBase()}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: { body: trimmed },
      },
    )
    // Append locally so the thread updates instantly; the next
    // loadMessages call will reconcile if the server rewrote anything.
    messages.value = [...messages.value, sent as any]
    return sent
  }

  async function markRead(conversationId: string) {
    try {
      await $fetch(`${apiBase()}/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: authHeaders(),
      })
    } catch {
      /* non-critical - will re-mark on next open */
    }
  }

  async function respondToViewing(
    viewingRequestId: string,
    body: {
      action: 'accept' | 'decline' | 'reschedule'
      chosenSlot?: { startISO: string; endISO?: string; label?: string }
      proposedSlots?: Array<{ startISO: string; endISO?: string; label?: string }>
      message?: string
    },
  ) {
    return $fetch(
      `${apiBase()}/viewing-requests/${viewingRequestId}/respond`,
      {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body,
      },
    )
  }

  return {
    conversations,
    messages,
    participants,
    loading,
    error,
    list,
    loadMessages,
    sendMessage,
    markRead,
    respondToViewing,
  }
}
