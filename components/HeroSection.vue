<template>
  <div>
    <!-- Hero Image -->
    <div class="hero">
      <div class="hero__image">
        <OPIcon :name="iconName" :class="iconClass" />
      </div>
    </div>

    <!-- Title -->
    <div class="hero-title">
      <h1 class="hero-title__main">{{ mainTitle }}</h1>
      <p class="hero-title__sub">{{ subTitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import OPIcon from './OPIcon.vue'
defineProps({
  iconName: { type: String, required: true },
  iconClass: { type: String, default: 'w-32 h-32' },
  mainTitle: { type: String, required: true },
  subTitle: { type: String, required: true },
})
</script>

<style scoped>
.hero {
  @apply flex justify-center py-6;
}

.hero__image {
  @apply w-24 h-24 relative;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: #f3f4f6;
}

.hero-title {
  @apply text-center mb-6 mt-4;
}

.hero-title__main {
  @apply text-[20px] font-bold text-gray-900 mb-0;
}

.hero-title__sub {
  @apply text-[15px] text-gray-600;
}
</style>
