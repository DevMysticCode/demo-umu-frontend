<template>
  <nav
    class="fixed bottom-0 w-full max-w-app bg-white border-t border-gray-200"
  >
    <div class="flex justify-around py-2">
      <button
        class="flex flex-col items-center py-2"
        :class="isActive('explore')"
        @click="router.push('/dashboard')"
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

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('marketplace')"
      >
        <OPIcon name="marketplace" :class="iconSize" />
        <span class="text-xs mt-1">Marketplace</span>
      </button>

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('ai')"
        @click="router.push('/profile/chat')"
      >
        <OPIcon name="learnAskAI" :class="iconSize" />
        <span class="text-xs mt-1">AI</span>
      </button>

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('learn')"
        @click="router.push('/profile/learn')"
      >
        <OPIcon name="learn" :class="iconSize" />
        <span class="text-xs mt-1">Learn</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import OPIcon from '@/components/ui/OPIcon.vue'

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
</script>
