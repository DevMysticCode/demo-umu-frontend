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

    <!-- Right Section: Avatar, Dots, or Slot -->
    <div class="w-10 flex items-center justify-end">
      <!-- Use slot override if provided -->
      <slot name="right">
        <template v-if="right === 'profile'">
          <img
            :src="profileSrc"
            alt="Profile"
            class="w-8 h-8 rounded-full object-cover border"
          />
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

const emit = defineEmits(['back'])

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
</style>
