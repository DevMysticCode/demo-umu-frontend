<template>
  <div
    class="mobile-container min-h-screen relative overflow-hidden backgound-image"
  >
    <div class="relative z-10">
      <!-- Main Content -->
      <main
        class="pt-6 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center relative"
      >
        <!-- Back Button -->
        <div class="absolute top-6 left-6">
          <BackButton />
        </div>
        <!-- Logo -->
        <div class="w-24 h-20 mb-8 flex items-center justify-center relative">
          <!-- <Icon name="i-heroicons-home" class="w-14 h-14 text-white" /> -->
          <OPIcon name="logo" class="w-24 h-20" />
        </div>

        <!-- Main Text -->
        <div class="space-y-4 mb-1">
          <h1 class="text-28-emphasized text-white leading-tight">
            Welcome to UmovingU.
          </h1>

          <div class="space-y-1">
            <p class="text-20-emphasized text-white">
              Finally! You're in control. Stress less. Move better.
            </p>
          </div>
        </div>

        <div class="fixed bottom-0 w-full max-w-md px-6 pb-6">
          <!-- Action Buttons -->
          <div class="w-full space-y-4">
            <button
              @click="continueToQuestionnaire"
              class="w-full h-12 font-17-medium rounded-xl bg-brand-aqua text-white hover:bg-brand-aqua/90 transition-colors backdrop-blur-sm"
            >
              Tell us more about your search
            </button>

            <button
              @click="skipToApp"
              class="w-full h-12 bg-white hover:bg-white/30 text-brand-aqua hover:text-white font-17-medium rounded-xl transition-colors backdrop-blur-sm"
            >
              Skip
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Welcome - UmovingU',
})

const continueToQuestionnaire = () => {
  navigateTo('/onboarding/questionnaire/1')
}

const skipToApp = () => {
  navigateTo('/dashboard')
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

.backgound-image > * {
  position: relative;
  z-index: 2;
}
</style>
