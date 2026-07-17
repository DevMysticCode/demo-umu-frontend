<template>
  <nav
    class="fixed bottom-0 w-full max-w-app border-t border-gray-200 bottom-nav-safe"
  >
    <div class="flex justify-around py-2 bottom-nav-row">
      <button
        class="flex flex-col items-center py-2"
        :class="isActive('explore')"
        @click="router.push('/explore')"
      >
        <OPIcon name="explore" :class="iconSize" />
        <span class="text-xs mt-1">Explore</span>
      </button>

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('passport')"
        @click="router.push('/passport/collections')"
      >
        <OPIcon name="passport" :class="iconSize" />
        <span class="text-xs mt-1">Passport</span>
      </button>

      <!-- Inbox — messages + notifications home. Red dot on the icon
           when there's anything unread; drives the same useNotifications
           badge state the top bell uses so both surfaces agree. Inline
           SVG (rather than OPIcon) because we need the dot overlay
           inside the same slot. -->
      <button
        class="flex flex-col items-center py-2 relative"
        :class="isActive('inbox')"
        @click="router.push('/inbox')"
      >
        <span class="relative inline-flex">
          <svg
            :class="iconSize"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span v-if="unreadCount > 0" class="inbox-tab-dot" aria-hidden="true" />
        </span>
        <span class="text-xs mt-1">Inbox</span>
      </button>

      <!-- Marketplace hidden for Phase 1 launch. The route + backend
           module still exist so we can flip it back on with one line
           by removing the v-if="false". Do NOT remove the whole
           button + assets — every icon slot is designed to keep the
           4-item spacing balanced. -->
      <button
        v-if="false"
        class="flex flex-col items-center py-2"
        :class="isActive('marketplace')"
        @click="router.push('/marketplace')"
      >
        <OPIcon name="marketplace" :class="iconSize" />
        <span class="text-xs mt-1">Marketplace</span>
      </button>

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('calendar')"
        @click="router.push('/profile/calendar')"
      >
        <OPIcon name="calendar" :class="iconSize" />
        <span class="text-xs mt-1">Calendar</span>
      </button>

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('ai')"
        @click="router.push('/profile/chat')"
      >
        <OPIcon name="learnAskAI" :class="iconSize" />
        <span class="text-xs mt-1">AI</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import OPIcon from '@/components/ui/OPIcon.vue'
import { useNotifications } from '~/composables/useNotifications'

const props = defineProps({
  active: {
    type: String,
    default: 'explore',
  },
})

const router = useRouter()
const iconSize = 'w-[18px] h-[18px]'
const isActive = (key) => {
  return props.active === key ? 'text-brand-aqua' : 'text-gray-400'
}

// Shared unread badge — mounting the composable here means the poll
// starts as soon as ANY page shows the bottom nav, so the dot lights
// up even on screens that don't render the notification bell.
const { unreadCount } = useNotifications()
</script>

<style scoped>
/* Pad the bottom of the nav so the iPhone home-indicator doesn't overlap
   the icons / labels on X-class+ devices. Centred via `left/right: 0` +
   the existing `max-w-app` so the bar stays the same width as the
   mobile-container (28rem) on tablets. Background + z-index forced here
   so cards with their own stacking contexts (the explore HomeScore /
   Passport feature cards use `position: relative` + animations, which
   spawn a stacking context that can otherwise win against the nav's
   default z-auto and bleed text through). */
.bottom-nav-safe {
  padding-bottom: env(safe-area-inset-bottom);
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  background: #ffffff !important;
  z-index: 50;
  isolation: isolate;
}
.bottom-nav-row {
  background: #ffffff;
}
/* Small red dot on the Inbox tab whenever the user has unread items —
   mirrors the top-bell badge without stealing space for a count. */
.inbox-tab-dot {
  position: absolute;
  top: -2px;
  right: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c73e36;
  box-shadow: 0 0 0 2px #ffffff;
}
</style>
