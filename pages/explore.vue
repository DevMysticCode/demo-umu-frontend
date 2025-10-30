<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
// This is just a wrapper - the actual content is in dashboard.vue
// But we'll redirect to dashboard for now
await navigateTo('/dashboard')
</script>
