<template>
  <div class="nb-root">
    <button
      type="button"
      class="nb-btn"
      :aria-label="`Notifications${unreadCount ? ' (' + unreadCount + ' unread)' : ''}`"
      @click="onToggle"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      <span v-if="unreadCount > 0" class="nb-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <Teleport to="body">
      <Transition name="nb">
        <div v-if="open" class="nb-overlay" @click.self="close">
          <div class="nb-sheet" @click.stop>
            <div class="nb-head">
              <div class="nb-title">Notifications</div>
              <button
                v-if="unreadCount > 0"
                type="button"
                class="nb-mark-all"
                @click="onMarkAll"
              >
                Mark all read
              </button>
            </div>

            <div v-if="loading && notifications.length === 0" class="nb-empty">
              Loading…
            </div>
            <div v-else-if="notifications.length === 0" class="nb-empty">
              You're all caught up.
            </div>
            <div v-else class="nb-list">
              <button
                v-for="n in notifications"
                :key="n.id"
                type="button"
                class="nb-item"
                :class="{ 'nb-item--unread': !n.readAt }"
                @click="onOpen(n)"
              >
                <div class="nb-item-icon">{{ iconFor(n.type) }}</div>
                <div class="nb-item-body">
                  <div class="nb-item-title">{{ n.title }}</div>
                  <div class="nb-item-sub">{{ n.body }}</div>
                  <div class="nb-item-time">{{ relativeTime(n.createdAt) }}</div>
                </div>
                <span v-if="!n.readAt" class="nb-item-dot" aria-hidden="true" />
              </button>
            </div>

            <div class="nb-foot">
              <button type="button" class="nb-see-all" @click="onSeeAll">
                Open Inbox →
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotifications } from '~/composables/useNotifications'

const {
  notifications,
  unreadCount,
  loading,
  refresh,
  markRead,
  markAllRead,
} = useNotifications()

const router = useRouter()
const open = ref(false)

function onToggle() {
  open.value = !open.value
  // Fetch the latest list every time the tray opens — cheap, and
  // guarantees the user sees fresh content instead of stale poll data.
  if (open.value) refresh()
}

function close() {
  open.value = false
}

async function onOpen(n: (typeof notifications.value)[number]) {
  if (!n.readAt) await markRead(n.id)
  close()
  if (n.actionUrl) {
    // actionUrl is a relative path (see Notification.actionUrl comment
    // in schema) so both the web router and the Capacitor deep-link
    // handler resolve it the same way.
    router.push(n.actionUrl)
  }
}

async function onMarkAll() {
  await markAllRead()
}

function onSeeAll() {
  close()
  router.push('/inbox')
}

// Close on route change so tapping a notification doesn't leave the
// tray hovering on the next screen.
watch(
  () => router.currentRoute.value.fullPath,
  () => {
    open.value = false
  },
)

function iconFor(type: string): string {
  switch (type) {
    case 'new_message': return '💬'
    case 'viewing_request': return '📅'
    case 'viewing_response': return '✅'
    case 'passport_shared': return '🔗'
    case 'passport_unlocked': return '🔓'
    case 'invite_accepted': return '🎉'
    default: return '🔔'
  }
}

function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const s = Math.max(0, Math.round((now - then) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}
</script>

<style scoped>
.nb-root { position: relative; display: inline-flex; }
.nb-btn {
  position: relative;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #231d45;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.nb-btn:hover { background: rgba(0, 161, 154, 0.08); }
.nb-btn svg { width: 22px; height: 22px; }
.nb-badge {
  position: absolute;
  top: 4px; right: 4px;
  min-width: 16px; height: 16px;
  padding: 0 4px;
  border-radius: 100px;
  background: #c73e36;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
  line-height: 1;
  box-shadow: 0 0 0 2px #fff;
}

.nb-overlay {
  position: fixed; inset: 0;
  background: rgba(35, 29, 69, 0.35);
  z-index: 1400;
  display: flex; align-items: flex-start; justify-content: center;
  padding: 60px 12px 12px;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}
.nb-sheet {
  width: 100%; max-width: 24rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(35, 29, 69, 0.25);
  overflow: hidden;
  display: flex; flex-direction: column;
  max-height: calc(100dvh - 90px);
}
.nb-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f0f1f5;
}
.nb-title {
  font-size: 15px; font-weight: 800;
  color: #231d45;
}
.nb-mark-all {
  background: none; border: none;
  font: inherit; font-size: 12px; font-weight: 700;
  color: #00a19a;
  cursor: pointer;
  padding: 4px 6px;
}
.nb-empty {
  padding: 32px 20px;
  text-align: center;
  font-size: 13px;
  color: #8f9094;
}
.nb-list {
  flex: 1; min-height: 0; overflow-y: auto;
}
.nb-item {
  display: flex; align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f5f6fa;
  font: inherit; text-align: left;
  cursor: pointer;
  position: relative;
  transition: background 0.12s;
}
.nb-item:last-child { border-bottom: none; }
.nb-item:hover { background: #fafbfd; }
.nb-item--unread { background: #f2faf8; }
.nb-item--unread:hover { background: #eaf6f3; }
.nb-item-icon {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #f5f6fa;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.nb-item-body { flex: 1; min-width: 0; }
.nb-item-title {
  font-size: 13px; font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
}
.nb-item-sub {
  margin-top: 2px;
  font-size: 12px; font-weight: 500;
  color: #6b7089;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.nb-item-time {
  margin-top: 4px;
  font-size: 11px; font-weight: 600;
  color: #a8a9ad;
}
.nb-item-dot {
  position: absolute;
  top: 16px; right: 14px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #00a19a;
}
.nb-foot {
  padding: 10px 16px;
  border-top: 1px solid #f0f1f5;
  text-align: center;
}
.nb-see-all {
  background: none; border: none;
  font: inherit; font-size: 12px; font-weight: 800;
  color: #00a19a;
  cursor: pointer;
  padding: 6px 8px;
}

.nb-enter-active,
.nb-leave-active { transition: opacity 0.18s ease; }
.nb-enter-active .nb-sheet,
.nb-leave-active .nb-sheet { transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
.nb-enter-from,
.nb-leave-to { opacity: 0; }
.nb-enter-from .nb-sheet,
.nb-leave-to .nb-sheet { transform: translateY(-8px); }
</style>
