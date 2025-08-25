<template>
  <div class="question-header">
    <BackButton />
    <button class="question-header__skip" @click="$emit('skip')">Skip</button>
  </div>
</template>

<script setup>
import BackButton from '../BackButton.vue'

defineEmits(['skip'])
</script>
