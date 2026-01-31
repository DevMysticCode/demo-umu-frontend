<template>
  <VerificationCode />
</template>

<script setup lang="ts">
import VerificationCode from '@/components/VerificationCode.vue'

// Set page meta if available
if (typeof definePageMeta === 'function') {
  definePageMeta({
    title: 'Email Verification - UmovingU',
  })
}
</script>
