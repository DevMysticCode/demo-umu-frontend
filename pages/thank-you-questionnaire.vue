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
        class="pt-6 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center"
      >
        <!-- Back Button -->
        <div class="absolute top-6 left-6">
          <BackButton />
        </div>

        <!-- Logo -->
        <div class="w-24 h-20 mb-8 flex items-center justify-center relative">
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

          <div class="space-y-2">
            <p class="text-22-emphasized text-white">
              🔶 Thank you for sharing your preferences they have been saved.
            </p>
          </div>

          <p class="text-12-regular text-white/60 mt-4">
            Powered by Open Property
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="w-full space-y-4">
          <button
            @click="continueToApp"
            class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-17-medium rounded-xl transition-colors"
          >
            Continue building your profile
          </button>

          <button
            @click="skipToApp"
            class="w-full h-12 bg-white/20 hover:bg-white/30 text-white font-17-medium rounded-xl transition-colors backdrop-blur-sm"
          >
            Skip
          </button>
        </div>

        <!-- Progress indicator -->
        <div class="mt-8 w-32 h-1 bg-white/20 rounded-full overflow-hidden">
          <div class="w-full h-full bg-white rounded-full"></div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Thank You - UmovingU',
})

const continueToApp = () => {
  navigateTo('/find-property')
}

const skipToApp = () => {
  navigateTo('/find-property')
}
</script>
