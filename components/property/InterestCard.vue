<template>
  <div
    class="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition"
    :class="selected ? 'border-brand-aqua bg-brand-aqua/5' : 'border-gray-200'"
    @click="$emit('select')"
  >
    <div class="text-3xl">{{ option.icon }}</div>

    <div class="flex-1">
      <h3 class="font-semibold">{{ option.title }}</h3>
      <p class="text-sm text-gray-600">{{ option.desc }}</p>
    </div>

    <div
      class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
      :class="selected ? 'border-brand-aqua' : 'border-gray-300'"
    >
      <div v-if="selected" class="w-3 h-3 bg-brand-aqua rounded-full" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  option: Object,
  selected: Boolean,
})

defineEmits(['select'])
</script>
