<template>
  <div class="mobile-container gradient-bg">
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
    <main class="pt-20 pb-8 px-6">
      <div class="space-y-8">
        <!-- Logo and Welcome -->
        <div class="text-center space-y-4">
          <div class="w-20 h-16 mx-auto bg-brand-aqua rounded-2xl flex items-center justify-center mb-6">
            <Icon name="i-heroicons-home" class="w-12 h-12 text-white" />
          </div>
          
          <div class="space-y-2">
            <h1 class="text-22-emphasized text-white">
              Welcome to UmovingU, it's great to have you back!
            </h1>
            <p class="text-12-regular text-white/50">
              Powered by Open Property
            </p>
          </div>
        </div>

        <!-- Social Login Buttons -->
        <div class="space-y-3">
          <button
            @click="handleSocialLogin('apple')"
            class="w-full h-12 bg-white text-gray-900 font-17-medium rounded-xl hover:bg-gray-50 flex items-center justify-center transition-colors"
            :disabled="socialLoading.apple"
          >
            <Icon name="i-heroicons-device-phone-mobile" class="w-5 h-5 mr-2" />
            {{ socialLoading.apple ? 'Connecting...' : 'Continue with Apple' }}
          </button>

          <button
            @click="handleSocialLogin('google')"
            class="w-full h-12 bg-white text-gray-900 font-17-medium rounded-xl hover:bg-gray-50 flex items-center justify-center transition-colors"
            :disabled="socialLoading.google"
          >
            <Icon name="i-heroicons-globe-alt" class="w-5 h-5 mr-2" />
            {{ socialLoading.google ? 'Connecting...' : 'Continue with Google' }}
          </button>

          <button
            @click="handleSocialLogin('facebook')"
            class="w-full h-12 bg-white text-gray-900 font-17-medium rounded-xl hover:bg-gray-50 flex items-center justify-center transition-colors"
            :disabled="socialLoading.facebook"
          >
            <Icon name="i-heroicons-users" class="w-5 h-5 mr-2" />
            {{ socialLoading.facebook ? 'Connecting...' : 'Continue with Facebook' }}
          </button>
        </div>

        <!-- Divider -->
        <div class="flex items-center space-x-4">
          <div class="flex-1 h-px bg-white/20"></div>
          <span class="text-white/70 text-sm">or login with email</span>
          <div class="flex-1 h-px bg-white/20"></div>
        </div>

        <!-- Email Form -->
        <div class="space-y-4">
          <div>
            <label class="block text-white text-sm font-medium mb-2">
              Account email
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="yourmail@email.com"
              class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
              :disabled="isLoading"
            />
          </div>

          <button
            @click="handleEmailContinue"
            class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-17-medium rounded-xl transition-colors flex items-center justify-center"
            :disabled="!email || !isValidEmail || isLoading"
          >
            {{ isLoading ? 'Checking...' : 'Continue' }}
            <Icon name="i-heroicons-arrow-right" class="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Sign Up - UmovingU'
})

// Form data
const email = ref('')
const isLoading = ref(false)
const socialLoading = ref({
  apple: false,
  google: false,
  facebook: false
})

// Computed
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

// Methods
const handleSocialLogin = async (provider) => {
  socialLoading.value[provider] = true
  
  try {
    // Simulate social login API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In a real app, you would handle OAuth flow here
    console.log(`Logging in with ${provider}`)
    
    // Navigate to thank you page
    await navigateTo('/thank-you')
  } catch (error) {
    console.error(`${provider} login failed:`, error)
  } finally {
    socialLoading.value[provider] = false
  }
}

const handleEmailContinue = async () => {
  if (!isValidEmail.value) return
  
  isLoading.value = true
  
  try {
    // Check if user exists or create new account
    const { data } = await $fetch('/api/auth/check-email', {
      method: 'POST',
      body: { email: email.value }
    })
    
    if (data.exists) {
      // Navigate to login with email pre-filled
      await navigateTo(`/login?email=${encodeURIComponent(email.value)}`)
    } else {
      // Navigate to create account flow
      await navigateTo(`/create-account?email=${encodeURIComponent(email.value)}`)
    }
  } catch (error) {
    console.error('Email check failed:', error)
    // For demo, just navigate to create account
    await navigateTo(`/create-account?email=${encodeURIComponent(email.value)}`)
  } finally {
    isLoading.value = false
  }
}
</script>