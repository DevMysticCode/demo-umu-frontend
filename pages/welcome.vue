<template>
  <WelcomePage />
</template>

<script setup lang="ts">
import WelcomePage from '../components/WelcomePage.vue'

// Set page meta if available
if (typeof definePageMeta === 'function') {
  definePageMeta({
    title: 'Welcome - UmovingU',
  })
}
</script>
