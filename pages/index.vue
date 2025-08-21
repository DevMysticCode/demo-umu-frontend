<template>
  <div class="mobile-container backgound-image">
    <ProgressBar :steps="7" :currentStep="2" />
    <LogoAndSkip @onClick="onSkipClick" />
  </div>
</template>

<script setup>
import LogoAndSkip from '@/components/LogoAndSkip.vue';

const onSkipClick = () => {
  alert('skip');
}

</script>

<style>
.backgound-image {
  background-image: url('/public/images/onboarding_background.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
}

.backgound-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  pointer-events: none;
  z-index: 1;
}

.backgound-image>* {
  position: relative;
  z-index: 2;
}
</style>