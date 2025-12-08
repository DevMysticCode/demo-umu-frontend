<template>
  <nav
    class="fixed bottom-0 w-full max-w-app bg-white border-t border-gray-200"
  >
    <div class="flex justify-around py-2">
      <button
        class="flex flex-col items-center py-2"
        :class="isActive('explore')"
      >
        <OPIcon name="explore" :class="iconSize" />
        <span class="text-xs mt-1">Explore</span>
      </button>

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('passport')"
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
        :class="isActive('rewards')"
      >
        <OPIcon name="rewards" :class="iconSize" />
        <span class="text-xs mt-1">Rewards</span>
      </button>

      <button
        class="flex flex-col items-center py-2"
        :class="isActive('learn')"
      >
        <OPIcon name="learn" :class="iconSize" />
        <span class="text-xs mt-1">Learn</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
const props = defineProps({
  active: {
    type: String,
    default: 'explore',
  },
})
import OPIcon from '@/components/ui/OPIcon.vue'

const iconSize = 'w-[18px] h-[18px]'
const isActive = (key) => {
  return props.active === key ? 'text-brand-aqua' : 'text-gray-400'
}
</script>
