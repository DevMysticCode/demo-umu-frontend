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
        <img src="/op-icons/explore/explore.png" alt="" class="nav-icon" />
        <span class="text-xs mt-1">Explore</span>
      </button>

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('passport')"
        @click="router.push('/passport/collections')"
      >
        <img src="/op-icons/explore/passport.png" alt="" class="nav-icon" />
        <span class="text-xs mt-1">Passport</span>
      </button>

      <!-- Inbox — messages + notifications home. The unread red dot is
           overlaid on the illustration rather than baked into it so we
           can drop it when useNotifications.unreadCount is 0. -->
      <button
        class="flex flex-col items-center py-2 relative"
        :class="isActive('inbox')"
        @click="router.push('/inbox')"
      >
        <span class="relative inline-flex">
          <img src="/op-icons/explore/inbox.png" alt="" class="nav-icon" />
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
        <img src="/op-icons/explore/calendar.png" alt="" class="nav-icon" />
        <span class="text-xs mt-1">Calendar</span>
      </button>

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('ai')"
        @click="router.push('/profile/chat')"
      >
        <img src="/op-icons/explore/ai.png" alt="" class="nav-icon" />
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
/* 3D illustration nav icons — sized just slightly larger than the
   old SVG glyphs because the artwork carries more detail per pixel
   and reads better at 26px than 20px. Aspect kept natural so passport
   book / calendar / chat bubble all stay proportional. */
.nav-icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
  display: block;
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
