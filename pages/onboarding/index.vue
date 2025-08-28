<template>
  <div class="mobile-container backgound-image">
    <ProgressBar :steps="slides.length" :currentStep="currentSlideIndex" />
    <LogoAndSkip @onClick="onSkipClick" />
    <TitleAndText
      :title="currentSlide?.title"
      :description="currentSlide?.description"
    />
    <CreateAccountOrLogin
      @onCreateAccount="onCreateAccount"
      @onLogin="onLogin"
    />
  </div>
</template>

<script setup>
import ProgressBar from '@/components/ProgressBar.vue'
import LogoAndSkip from '@/components/LogoAndSkip.vue'
import TitleAndText from '@/components/TitleAndText.vue'
import { useWelcomePageData } from '@/composables/useWelcomePageData'
import CreateAccountOrLogin from '@/components/CreateAccountOrLogIn.vue'

const { slides, currentSlideIndex, currentSlide } = useWelcomePageData()

const onCreateAccount = async () => {
  await navigateTo('/onboarding/signup')
}

const onLogin = async () => {
  await navigateTo('/onboarding/signup')
}

const onSkipClick = () => {
  alert('skip')
}
</script>
