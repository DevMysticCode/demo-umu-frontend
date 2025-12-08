<template>
  <div class="p-4 bg-white rounded-xl shadow-sm">
    <p class="text-gray-700">{{ task.meta?.text }}</p>
  </div>
</template>

<script setup>
const props = defineProps({ task: Object })
</script>
