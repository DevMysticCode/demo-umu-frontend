<template>
  <div class="mobile-container backgound-image content">

    <!-- Main Content -->

    <!-- Logo and Welcome -->
    <div class="logo-and-welcome">
      <OPIcon name="logo" class="w-16 h-16" />
      <h1 class="text-[34px] font-bold text-white">
        Welcome to UmovingU, it's great to have you back!
      </h1>
    </div>

    <div class="login-options">

      <div class="social-logins">
        <UButton class="social-logins__button" @click="handleSocialLogin('apple')">
          <OPIcon name="apple" class="w-5 h-5" />
          Continue with Apple
        </UButton>

        <UButton class="social-logins__button" @click="handleSocialLogin('google')">
          <OPIcon name="google" class="w-5 h-5" />
          Continue with Google
        </UButton>

        <UButton class="social-logins__button" @click="handleSocialLogin('facebook')">
          <OPIcon name="facebook" class="w-5 h-5" />
          Continue with Facebook
        </UButton>
      </div>

      <!-- Divider -->

      <!-- Email Form -->

      <form class="email-form">
        <div class="email-form__divider">
          <div class="flex-1 h-px bg-white/80"></div>
          <span class="text-white/80 text-sm">or login with email</span>
          <div class="flex-1 h-px bg-white/80"></div>
        </div>

        <input v-model="email" type="email" placeholder="yourmail@email.com"
          class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
          :disabled="isLoading" />

        <UButton class="email-form__button" @click="handleEmailContinue">
          Log In
        </UButton>
      </form>
    </div>

  </div>
</template>

<script setup>
definePageMeta({
  title: 'Sign Up - UmovingU',
})

// Form data
const email = ref('')
const isLoading = ref(false)
const socialLoading = ref({
  apple: false,
  google: false,
  facebook: false,
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
    await new Promise((resolve) => setTimeout(resolve, 1500))

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
      body: { email: email.value },
    })

    if (data.exists) {
      // Navigate to login with email pre-filled
      await navigateTo(`/login?email=${encodeURIComponent(email.value)}`)
    } else {
      await navigateTo(`/verification`)
      // Navigate to create account flow
      // await navigateTo(
      //   `/onboarding//create-account?email=${encodeURIComponent(email.value)}`
      // )
    }
  } catch (error) {
    console.error('Email check failed:', error)
    // For demo, just navigate to verification
    await navigateTo(`/verification`)
    // await navigateTo(`/onboarding//create-account?email=${encodeURIComponent(email.value)}`)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.content {
  @apply pt-6 px-4;
  @apply flex flex-col justify-between;
  @apply min-h-dvh;
}

.logo-and-welcome {}

.login-options {
  @apply flex flex-col h-full mb-6;
}

.social-logins {
  @apply space-y-2 mt-4;

  &__button {
    @apply flex items-center justify-center;
    @apply w-full h-[50px] rounded-xl shadow-lg transition-colors;
    @apply bg-white;
    @apply text-black text-[17px];
  }
}

.email-form {
  @apply space-y-4;

  &__button {
    @apply flex items-center justify-center;
    @apply w-full h-[50px] rounded-xl shadow-lg transition-colors;
    @apply bg-brand-aqua;
    @apply text-white text-[17px];
  }

  &__divider {
    @apply flex items-center space-x-4 mb-4 mt-6;
  }
}
</style>