<template>
  <!-- Inbox — every thread the user is a party to, ordered by most
       recent activity. Each row shows the job it's about, the other
       party's avatar, the last message preview, and an unread badge. -->
  <div class="ib-page mobile-container">
    <div class="ib-header">
      <button class="ib-back-btn" type="button" aria-label="Back" @click="goBack">‹</button>
      <div class="ib-header-title">Inbox</div>
      <span class="ib-header-spacer" />
    </div>

    <template v-if="pending">
      <div class="ib-loading">Loading messages…</div>
    </template>

    <template v-else-if="!threads.length">
      <div class="ib-empty">
        <div class="ib-empty-emoji">💬</div>
        <div class="ib-empty-title">No messages yet</div>
        <div class="ib-empty-sub">
          Once you offer on a job or receive an offer, your chats land here.
        </div>
        <button class="ib-empty-btn" type="button" @click="goBrowse">
          Browse jobs
        </button>
      </div>
    </template>

    <template v-else>
      <div class="ib-list ib-anim-1">
        <button
          v-for="t in threads"
          :key="t.id"
          class="ib-thread-row"
          :class="{ 'ib-unread': t.unreadCount > 0 }"
          type="button"
          @click="openThread(t.id)"
        >
          <div class="ib-avatar">{{ t.otherPartyInitials }}</div>
          <div class="ib-body">
            <div class="ib-row-top">
              <div class="ib-name">{{ t.otherPartyName }}</div>
              <div class="ib-when">{{ relativeTime(t.lastMessageAt) }}</div>
            </div>
            <div class="ib-job">
              <span class="ib-role-pill" :class="`ib-role-${t.role}`">
                {{ t.role === 'customer' ? 'Customer' : 'Supplier' }}
              </span>
              · {{ t.jobTitle }}
            </div>
            <div class="ib-preview">
              {{ t.lastMessageBody || 'No messages yet — say hi.' }}
            </div>
          </div>
          <div v-if="t.unreadCount > 0" class="ib-badge">{{ t.unreadCount }}</div>
        </button>
      </div>
    </template>

    <div style="height: 100px" />
    <MarketplaceBottomNav active="inbox" :unread-count="totalUnread" />
  </div>
</template>

<script setup lang="ts">
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'
import type { MarketplaceThreadListItem } from '~/composables/useMarketplace'

definePageMeta({ title: 'Inbox — Marketplace', middleware: 'auth' })

const router = useRouter()
const { fetchThreads } = useMarketplace()

const { data: threadsData, pending } = await useAsyncData('mp-inbox', () => fetchThreads())
const threads = computed<MarketplaceThreadListItem[]>(() => threadsData.value ?? [])
const totalUnread = computed(() => threads.value.reduce((sum, t) => sum + (t.unreadCount ?? 0), 0))

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/marketplace')
}
function goBrowse() {
  router.push('/marketplace/browse')
}
function openThread(id: string) {
  router.push(`/marketplace/threads/${id}`)
}

function relativeTime(iso: string | null): string {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.round(ms / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.round(days / 7)}w`
}
</script>

<style scoped>
.ib-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

.ib-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 8px;
}
.ib-back-btn {
  width: 36px; height: 36px;
  border-radius: 12px;
  border: 1px solid #e4e5ed;
  background: #fff;
  color: #231d45;
  font-size: 22px; font-weight: 800; line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.ib-header-title {
  flex: 1;
  font-size: 16px; font-weight: 800;
  color: #231d45; letter-spacing: -0.3px;
  text-align: center;
}
.ib-header-spacer { width: 36px; flex-shrink: 0; }

.ib-loading {
  padding: 40px 20px;
  text-align: center;
  font-size: 13px; font-weight: 600;
  color: #6b7089;
}

/* ── Empty state ─────────────────────────────────────────────── */
.ib-empty {
  padding: 60px 24px;
  text-align: center;
  font-size: 13px; font-weight: 600;
  color: #6b7089;
}
.ib-empty-emoji { font-size: 40px; margin-bottom: 8px; }
.ib-empty-title { font-size: 16px; font-weight: 800; color: #231d45; margin-bottom: 4px; }
.ib-empty-sub { margin-bottom: 16px; }
.ib-empty-btn {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff; border: none; border-radius: 12px;
  padding: 12px 18px; font-family: inherit; font-size: 13px; font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
}

/* ── Thread rows ─────────────────────────────────────────────── */
.ib-list {
  padding: 6px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ib-thread-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  padding: 12px 14px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.2s;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.ib-thread-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(35, 29, 69, 0.1);
}
.ib-thread-row.ib-unread { border-color: #00a19a; }

.ib-avatar {
  width: 42px; height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4A4566, #231D45);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; letter-spacing: -0.2px;
  flex-shrink: 0;
  margin-top: 2px;
}
.ib-body { flex: 1; min-width: 0; }
.ib-row-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.ib-name {
  font-size: 13.5px; font-weight: 800;
  color: #231d45; letter-spacing: -0.2px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ib-when {
  font-size: 11px; font-weight: 700;
  color: #6b7089; flex-shrink: 0;
}
.ib-job {
  font-size: 11px; font-weight: 600;
  color: #6b7089; margin-top: 3px;
  display: flex; align-items: center; gap: 4px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ib-role-pill {
  font-size: 9px; font-weight: 800;
  letter-spacing: 0.5px; text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 100px;
}
.ib-role-customer { background: #fff7e3; color: #b07a13; }
.ib-role-supplier { background: #e5f4f2; color: #00635E; }

.ib-preview {
  font-size: 12px; font-weight: 600;
  color: #6b7089;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.ib-unread .ib-preview {
  color: #231d45;
  font-weight: 700;
}

.ib-badge {
  flex-shrink: 0;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 100px;
  background: #00a19a;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

@keyframes ibFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.ib-anim-1 { animation: ibFadeUp 0.32s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .ib-anim-1 { animation: none; }
}
</style>
