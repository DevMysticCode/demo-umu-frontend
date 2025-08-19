<template>
  <div class="mobile-container bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 min-h-screen relative overflow-hidden">
    <!-- Decorative Elements -->
    <div class="absolute inset-0">
      <!-- Floating shapes -->
      <div class="absolute top-20 left-8 w-4 h-4 bg-pink-400 rounded-full opacity-80 animate-pulse"></div>
      <div class="absolute top-32 right-12 w-6 h-6 bg-yellow-400 rounded-full opacity-60 animate-bounce"></div>
      <div class="absolute top-48 left-16 w-3 h-3 bg-green-400 rounded-full opacity-70"></div>
      <div class="absolute bottom-40 right-8 w-5 h-5 bg-blue-400 rounded-full opacity-80"></div>
      <div class="absolute bottom-60 left-12 w-4 h-4 bg-red-400 rounded-full opacity-60"></div>
      
      <!-- Confetti-like elements -->
      <div class="absolute top-24 right-20 w-2 h-8 bg-pink-300 transform rotate-45 opacity-70"></div>
      <div class="absolute top-40 left-24 w-2 h-6 bg-yellow-300 transform -rotate-12 opacity-80"></div>
      <div class="absolute bottom-48 right-16 w-2 h-7 bg-green-300 transform rotate-12 opacity-60"></div>
    </div>

    <!-- Header -->
    <header class="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm z-50">
      <div class="flex items-center justify-between px-4 py-3 bg-black/10 backdrop-blur-sm">
        <UButton 
          @click="$router.back()"
          variant="ghost" 
          icon="i-heroicons-arrow-left"
          class="text-white"
        />
        <div class="text-white font-semibold text-17-medium">
          9:41
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-20 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center">
      <!-- Logo -->
      <div class="w-24 h-20 mb-8 bg-brand-aqua rounded-2xl flex items-center justify-center relative">
        <Icon name="i-heroicons-home" class="w-14 h-14 text-white" />
        <!-- Sparkle effects around logo -->
        <div class="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
        <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
      </div>

      <!-- Main Text -->
      <div class="space-y-4 mb-12">
        <h1 class="text-28-emphasized text-white leading-tight">
          Welcome to UmovingU.
        </h1>
        
        <div class="space-y-2">
          <p class="text-22-emphasized text-white">
            🎉 Finally! You're in control
          </p>
          <p class="text-18-medium text-white/90">
            ✨ Stress less. Move better.
          </p>
        </div>
        
        <p class="text-12-regular text-white/60 mt-4">
          Powered by Open Property
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="w-full space-y-4">
        <button
          @click="continueToQuestionnaire"
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
        <div class="w-3/4 h-full bg-white rounded-full"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Welcome - UmovingU'
})

const continueToQuestionnaire = () => {
  navigateTo('/questionnaire/1')
}

const skipToApp = () => {
  navigateTo('/dashboard')
}
</script>