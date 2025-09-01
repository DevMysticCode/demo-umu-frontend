<template>
  <div
    class="mobile-container from-purple-900 backgound-image min-h-screen relative overflow-hidden"
  >
    <!-- Main Content -->
    <main
      class="pt-6 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center"
    >
      <div class="header">
        <BackButton />
      </div>

      <!-- Logo -->
      <div class="w-24 h-20 mb-8 flex items-center justify-center relative">
        <OPIcon name="logo" class="w-24 h-24" />
      </div>

      <!-- Main Text -->
      <div class="space-y-4 mb-12">
        <h1 class="text-28-emphasized text-white leading-tight">
          Welcome to UmovingU.
        </h1>

        <div class="space-y-2">
          <p class="text-[20px] text-white">
            Finally! You're in control. Stress less. Move better..
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="w-full space-y-4 page-bottom">
        <button
          @click="continueToQuestionnaire"
          class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-17-medium rounded-xl transition-colors"
        >
          Tell us more about your search
        </button>

        <button
          @click="skipToApp"
          class="w-full h-12 bg-white hover:bg-white/30 text-brand-aqua font-17-medium rounded-xl transition-colors backdrop-blur-sm"
        >
          Skip
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import OPIcon from '@/components/OPIcon.vue'
import BackButton from '@/components/BackButton.vue'
import { navigateTo } from '#app'

definePageMeta({
  title: 'Thank You - UmovingU',
})

const continueToQuestionnaire = () => {
  return navigateTo('/onboarding/questionnaire/1')
}

const skipToApp = () => {
  return navigateTo('/dashboard')
}
</script>

<style scoped>
.header {
  @apply pt-4 px-6 pb-2;
  position: absolute;
  top: 20px;
  left: 0;
}

.page-bottom {
  @apply px-6 pb-8 w-full absolute bottom-0;
}
</style>
