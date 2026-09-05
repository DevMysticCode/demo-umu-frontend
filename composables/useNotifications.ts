import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

/**
 * Global notifications state - one shared instance across the whole app
 * so the bell badge, the tray, and the (future) settings screen all
 * agree on unread count without duplicating fetches.
 *
 * Two concerns:
 *   1. Poll `/notifications/unread-count` every 30s while the tab is
 *      visible so the bell badge stays roughly live without a
 *      WebSocket. Cheap request; scale up to SSE later.
 *   2. Fetch the full list on demand (bell open + inbox page mount)
 *      via `refresh()`.
 */

export interface NotificationRow {
  id: string
  type: string
  title: string
  body: string
  actionUrl: string
  entityType: string | null
  entityId: string | null
  readAt: string | null
  createdAt: string
}

// Module-scope singletons — Nuxt's useX pattern reuses this across
// every component that calls the composable, so there's only ever one
// poll timer + one list in memory.
const notifications = ref<NotificationRow[]>([])
const unreadCount = ref(0)
const loading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null
let visibilityHandler: (() => void) | null = null
let subscribers = 0

function authHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useNotifications() {
  const config = useRuntimeConfig()
  const apiBase = () => config.public.apiBase as string

  const isAuthed = () =>
    typeof window !== 'undefined' && !!localStorage.getItem('token')

  async function refreshUnread() {
    if (!isAuthed()) return
    try {
      const res = await $fetch<{ count: number }>(
        `${apiBase()}/notifications/unread-count`,
        { headers: authHeaders() },
      )
      unreadCount.value = res.count ?? 0
    } catch {
      // Silent — the bell badge just stays at the last known value.
      // Auth issues surface elsewhere; a single failed poll shouldn't
      // fire a toast.
    }
  }

  async function refresh() {
    if (!isAuthed()) return
    loading.value = true
    try {
      const rows = await $fetch<NotificationRow[]>(
        `${apiBase()}/notifications?limit=30`,
        { headers: authHeaders() },
      )
      notifications.value = rows
      unreadCount.value = rows.filter((n) => !n.readAt).length
    } catch {
      /* handled by the caller if they care */
    } finally {
      loading.value = false
    }
  }

  async function markRead(id: string) {
    // Optimistic — flip the local row first so the UI feels snappy.
    const row = notifications.value.find((n) => n.id === id)
    if (row && !row.readAt) {
      row.readAt = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
    try {
      await $fetch(`${apiBase()}/notifications/${id}/read`, {
        method: 'POST',
        headers: authHeaders(),
      })
    } catch {
      // Roll back on failure — the server-side truth wins.
      if (row) {
        row.readAt = null
        unreadCount.value += 1
      }
    }
  }

  async function markAllRead() {
    const now = new Date().toISOString()
    const prev = notifications.value.map((n) => ({ id: n.id, readAt: n.readAt }))
    notifications.value = notifications.value.map((n) =>
      n.readAt ? n : { ...n, readAt: now },
    )
    unreadCount.value = 0
    try {
      await $fetch(`${apiBase()}/notifications/read-all`, {
        method: 'POST',
        headers: authHeaders(),
      })
    } catch {
      // Restore prior state on failure.
      notifications.value = notifications.value.map((n) => {
        const p = prev.find((x) => x.id === n.id)
        return p ? { ...n, readAt: p.readAt } : n
      })
      unreadCount.value = notifications.value.filter((n) => !n.readAt).length
    }
  }

  function startPolling() {
    if (pollTimer) return
    // Immediate refresh so the badge lights up as soon as any consumer
    // mounts, then a 30s heartbeat while the tab is visible.
    refreshUnread()
    pollTimer = setInterval(refreshUnread, 30_000)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  // Reference-counted polling — the first component to mount the
  // composable starts the timer, the last to unmount stops it. Prevents
  // a stray timer running forever after navigating away from the bell.
  onMounted(() => {
    subscribers++
    if (subscribers === 1) {
      startPolling()
      if (typeof document !== 'undefined') {
        visibilityHandler = () => {
          if (document.visibilityState === 'visible') refreshUnread()
        }
        document.addEventListener('visibilitychange', visibilityHandler)
      }
    }
  })
  onBeforeUnmount(() => {
    subscribers = Math.max(0, subscribers - 1)
    if (subscribers === 0) {
      stopPolling()
      if (visibilityHandler && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', visibilityHandler)
        visibilityHandler = null
      }
    }
  })

  return {
    notifications: computed(() => notifications.value),
    unreadCount: computed(() => unreadCount.value),
    loading: computed(() => loading.value),
    refresh,
    refreshUnread,
    markRead,
    markAllRead,
  }
}
