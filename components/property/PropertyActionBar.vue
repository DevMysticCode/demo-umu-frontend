<template>
  <div
    class="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-sm w-[85%] rounded-[36px] py-4 px-6 flex justify-between shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-gradient-to-b from-white to-[#e9faf7] z-[49]"
  >
    <button
      class="action-item"
      v-for="item in actions"
      :key="item.label"
      @click="$emit('action', item.label)"
    >
      <!-- <Icon :name="item.icon" class="w-7 h-7 text-brand-aqua" /> -->
      <OPIcon :name="item.icon" class="w-[17px] h-[17px]" />
      <span class="text-[10px] text-brand-aqua font-medium">{{
        item.label
      }}</span>
    </button>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'
const props = defineProps({
  actions: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['action'])
</script>

<style scoped>
.action-item {
  @apply flex flex-col items-center gap-1;
}
</style>
