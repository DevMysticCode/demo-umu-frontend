<template>
  <header
    class="flex items-center justify-between px-4 py-3 bg-transparent border-b border-gray-100"
  >
    <!-- Left Section: Back Button or Empty Space -->
    <div class="w-10 flex items-center justify-start">
      <ModalBackButton v-if="showBack && isOverlay" @close="emit('back')" />
      <BackButton v-else-if="showBack" :to="backTo" />
    </div>

    <!-- Center Section: Heading -->
    <div class="flex-1 text-center">
      <h1 v-if="title" class="text-lg font-semibold text-black truncate">
        {{ title }}
      </h1>

      <!-- Title slot overrides title prop -->
      <slot name="title" v-else></slot>
    </div>

    <!-- Right Section: Avatar, Dots, Tour button, or Slot -->
    <div class="flex items-center justify-end gap-2">
      <!-- Optional tour-restart button — pages that pass `showTour` get a
           small "?" affordance that emits `tour` so the page can replay the
           OnboardingTour. -->
      <button
        v-if="showTour"
        type="button"
        class="tour-help-btn"
        aria-label="Take a quick tour"
        @click="emit('tour')"
      >
        ?
      </button>

      <!-- Use slot override if provided -->
      <slot name="right">
        <template v-if="right === 'profile'">
          <button type="button" @click="navigateTo('/profile')" aria-label="My Profile">
            <UserAvatar
              :src="profile?.avatarUrl"
              :firstName="profile?.firstName"
              :lastName="profile?.lastName"
              :size="32"
            />
          </button>
        </template>

        <template v-else-if="right === 'dots'">
          <div class="dots-container">
            <Icon
              name="i-heroicons-ellipsis-horizontal"
              class="w-6 h-6 text-white"
            />
          </div>
        </template>
      </slot>
    </div>
  </header>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import BackButton from '~/components/core/BackButton.vue'
import ModalBackButton from '~/components/core/ModalBackButton.vue'
import UserAvatar from '~/components/ui/UserAvatar.vue'

const { profile } = useProfile()

const emit = defineEmits(['back', 'tour'])

const props = defineProps({
  title: String, // Heading text
  showBack: { type: Boolean, default: false },
  backTo: {
    // optional navigation target for back button
    type: String,
    default: null,
  },
  right: {
    // 'profile', 'dots', or null
    type: String,
    default: null,
  },
  profileSrc: {
    // Used if right="profile"
    type: String,
    default: '/op-icons/temp/profilepic.png',
  },
  isOverlay: { type: Boolean, default: false },
  // When true, render a small "?" button that emits `tour` so the host
  // page can replay its OnboardingTour.
  showTour: { type: Boolean, default: false },
})
</script>

<style scoped>
.dots-container {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #403d91;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tour-help-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #eafaf9;
  border: 1px solid #b2e8e6;
  color: #008c86;
  font-size: 13px;
  font-weight: 800;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.15s;
}
.tour-help-btn:hover,
.tour-help-btn:active {
  background: #ccfbf1;
}
</style>


