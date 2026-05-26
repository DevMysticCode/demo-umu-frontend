<template>
  <div class="mp-messages">
    <div class="app-header">
      <button class="back-btn" type="button" @click="router.back()" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Messages</div>
        <div class="app-header-sub">{{ messages.length }} conversations · {{ unreadCount }} unread</div>
      </div>
    </div>

    <div class="msg-list">
      <div
        v-for="m in messages"
        :key="m.id"
        class="mp-msg-row"
        :class="{ unread: m.unread }"
      >
        <div class="mp-msg-avatar" :style="{ background: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})` }">
          {{ m.initial }}
        </div>
        <div class="mp-msg-body">
          <div class="mp-msg-name">{{ m.name }}</div>
          <div class="mp-msg-preview">{{ m.preview }}</div>
        </div>
        <div class="mp-msg-time">{{ m.time }}</div>
      </div>
    </div>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMarketplaceMock } from '~/composables/useMarketplaceMock'

const router = useRouter()
const { messages } = useMarketplaceMock()
const unreadCount = computed(() => messages.filter((m) => m.unread).length)
</script>

<style scoped>
.mp-messages {
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --page: #f0f2f8;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: var(--card);
  border-bottom: 1px solid var(--border);
}
.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  flex-shrink: 0;
}
.back-btn svg { width: 16px; height: 16px; }
.app-header-info { flex: 1; min-width: 0; }
.app-header-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
}
.app-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}

.msg-list {
  padding: 14px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mp-msg-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--card);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.mp-msg-row:hover {
  border-color: var(--accent-pale);
}
.mp-msg-row.unread {
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  border-color: var(--accent-pale);
}
.mp-msg-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 14px;
  flex-shrink: 0;
}
.mp-msg-body { flex: 1; min-width: 0; }
.mp-msg-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-bottom: 2px;
}
.mp-msg-preview {
  font-size: 11.5px;
  color: var(--text-secondary);
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.mp-msg-time {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-faint);
  flex-shrink: 0;
  align-self: flex-start;
  padding-top: 2px;
}
</style>
