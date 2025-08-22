<template>
  <div
    class="mobile-container bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 min-h-screen relative overflow-hidden"
  >
    <video
      autoplay
      muted
      loop
      playsinline
      class="absolute inset-0 w-full h-full object-cover z-0"
    >
      <source src="/public/thankyouBackgoundVideo.mp4" type="video/mp4" />
    </video>
    <div class="absolute inset-0 bg-black/40 z-1"></div>

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
          <img src="/public/logo_new.svg" alt="Logo" class="w-24 h-20" />
          <!-- Sparkle effects around logo -->
          <div
            class="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"
          ></div>
          <div
            class="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse"
          ></div>
        </div>

        <!-- Main Text -->
        <div class="space-y-4 mb-12">
          <h1 class="text-28-emphasized text-white leading-tight">
            Welcome to UmovingU.
          </h1>

          <div class="space-y-4">
            <p class="text-28-emphasized text-white">
              Finally! You're in control
            </p>
            <p class="text-28-emphasized text-white/90">
              Stress less. Move better.
            </p>
          </div>

          <p class="text-12-regular text-white/60 mt-4">
            Powered by Open Property
          </p>
        </div>

        <div class="fixed bottom-0 w-full max-w-md px-6 pb-6">
          <!-- Action Buttons -->
          <div class="w-full space-y-4">
            <button
              @click="continueToQuestionnaire"
              class="w-full h-12 font-17-medium rounded-xl bg-brand-aqua text-dark hover:bg-brand-aqua/90 transition-colors backdrop-blur-sm"
            >
              Continue building your profile
            </button>

            <button
              @click="skipToApp"
              class="w-full h-12 bg-white hover:bg-white/30 text-dark hover:text-white font-17-medium rounded-xl transition-colors backdrop-blur-sm"
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
  navigateTo('/questionnaire/1')
}

const skipToApp = () => {
  navigateTo('/dashboard')
}
</script>

<style>
.backgound-video {
  background-image: url('/public/');
  background-size: cover;
  background-position: center;
  position: relative;
}
</style>
