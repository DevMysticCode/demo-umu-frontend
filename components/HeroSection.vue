<template>
  <div class="hero-section">
    <OPIcon name="backgroundImage" class="hero__bg" />
    <div class="hero-content">
      <!-- Hero Image -->
      <div class="hero">
        <div class="hero__image" :class="heroClass">
          <OPIcon :name="iconName" :class="iconClass" />
        </div>
      </div>

      <!-- Title -->
      <div class="hero-title">
        <h1 class="hero-title__main">{{ mainTitle }}</h1>
        <h1 v-if="subColored" class="hero-title__subColored">
          {{ subColored }}
        </h1>
        <p class="hero-title__sub">{{ subTitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import OPIcon from './ui/OPIcon.vue'
defineProps({
  iconName: { type: String, required: true },
  iconClass: { type: String, default: 'w-32 h-32' },
  mainTitle: { type: String, required: true },
  subColored: { type: String, default: undefined },
  subTitle: { type: String, required: true },
  heroClass: {
    type: String,
    default: 'w-24 h-24',
  },
})
</script>

<style scoped>
.hero-section {
  position: relative;
}

.hero__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero {
  @apply flex justify-center pt-6 pb-0;
}

.hero__image {
  @apply relative;
  /* clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); */
  /* background: #f3f4f6; */
}

.hero-title {
  @apply text-center mb-6 mt-4;
}

.hero-title__main {
  @apply text-[20px] font-bold text-gray-900 mb-0;
}

.hero-title__sub {
  @apply text-[15px];
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.23px;
  color: rgba(60, 60, 67, 0.6);
}

.hero-title__subColored {
  @apply text-brand-aqua text-[15px];
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.23px;
}
</style>
