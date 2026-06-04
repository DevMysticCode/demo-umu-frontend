<template>
  <!-- Marketplace-only bottom nav. The host app's BottomNav is replaced
       here because the marketplace is a sub-app with its own root
       affordances (Home / Browse / Post / Inbox / Projects). The host
       app's nav is reached again via the "‹ UmovingU" pill on the
       marketplace home. -->
  <nav class="mp-tab-bar">
    <button
      class="mp-tab-btn"
      :class="{ active: active === 'home' }"
      type="button"
      @click="go('/marketplace')"
    >
      <span class="mp-tab-btn-icon">🏠</span>
      <span>Home</span>
    </button>
    <button
      class="mp-tab-btn"
      :class="{ active: active === 'browse' }"
      type="button"
      @click="go('/marketplace/browse')"
    >
      <span class="mp-tab-btn-icon">🔍</span>
      <span>Browse</span>
    </button>

    <!-- Center raised "Post" CTA — matches the prototype. Anonymous
         users get bounced to /login via the page's own guard. -->
    <button
      class="mp-tab-btn center"
      :class="{ active: active === 'post' }"
      type="button"
      @click="go('/marketplace/post')"
    >
      <span class="mp-tab-btn-icon">+</span>
      <span>Post</span>
    </button>

    <button
      class="mp-tab-btn"
      :class="{ active: active === 'inbox' }"
      type="button"
      @click="go('/marketplace/inbox')"
    >
      <span class="mp-tab-btn-icon">💬</span>
      <span>Inbox</span>
      <span v-if="unreadCount && unreadCount > 0" class="mp-tab-badge">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <button
      class="mp-tab-btn"
      :class="{ active: active === 'projects' }"
      type="button"
      @click="go('/marketplace/projects')"
    >
      <span class="mp-tab-btn-icon">📋</span>
      <span>Projects</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
// Sub-pages (job detail, payments, etc.) can pass any string here;
// only the five canonical tabs visually match. Anything else just
// renders with nothing highlighted, which is fine.
defineProps<{
  active?: 'home' | 'browse' | 'post' | 'inbox' | 'projects' | string
  unreadCount?: number
}>()

const router = useRouter()

function go(path: string) {
  router.push(path)
}
</script>

<style scoped>
.mp-tab-bar {
  position: fixed;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  right: 0;
  max-width: 28rem;
  margin: 0 auto;
  height: 62px;
  background: #fff;
  border-top: 1px solid #e4e5ed;
  display: flex;
  align-items: stretch;
  padding: 0 4px;
  z-index: 50;
  box-shadow: 0 -4px 16px rgba(35, 29, 69, 0.04);
}

.mp-tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 4px;
  color: #6b7089;
  font-family: inherit;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.2px;
  transition: color 0.15s;
  position: relative;
}
.mp-tab-btn-icon {
  font-size: 18px;
  line-height: 1;
}
.mp-tab-btn.active {
  color: #008A84;
}
.mp-tab-btn.active .mp-tab-btn-icon {
  transform: scale(1.1);
}

/* Center "Post" — circular raised button that pokes above the bar */
.mp-tab-btn.center .mp-tab-btn-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 6px 16px rgba(0, 161, 154, 0.35);
  margin-top: -22px;
  margin-bottom: -2px;
}
.mp-tab-btn.center.active .mp-tab-btn-icon {
  transform: none;
}

/* Unread badge on Inbox tab */
.mp-tab-badge {
  position: absolute;
  top: 4px;
  right: calc(50% - 22px);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 100px;
  background: #e7444c;
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
