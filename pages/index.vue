<template>
  <div class="mobile-container backgound-image">
    <ProgressBar :steps="slides.length" :currentStep="currentSlideIndex" />
    <LogoAndSkip @onClick="onSkipClick" />
    <TitleAndText :title="currentSlide?.title" :description="currentSlide?.description" />
    <CreateAccountOrLogin @on-create-account="onCreateAccount" @on-login="onLogin" />
  </div>
</template>

<script setup>
import ProgressBar from '@/components/ProgressBar.vue'
import LogoAndSkip from '@/components/LogoAndSkip.vue'
import TitleAndText from '@/components/TitleAndText.vue'
import { useWelcomePageData } from '@/composables/useWelcomePageData'
import CreateAccountOrLogin from '@/components/CreateAccountOrLogIn.vue'

const { slides, currentSlideIndex, currentSlide } = useWelcomePageData()

const onCreateAccount = () => {
  alert('create account')
}

const onLogin = () => {
  alert('login')
}

const onSkipClick = () => {
  alert('skip')
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
  background-color: rgba(0, 0, 0, 0.6);
  pointer-events: none;
  z-index: 1;
}

.backgound-image>* {
  position: relative;
  z-index: 2;
}
</style>