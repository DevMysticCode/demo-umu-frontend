<template>
  <div class="mobile-container backgound-image">
    <!-- Header -->
    <header
      class="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm z-50"
    >
      <div
        class="flex items-center justify-between px-4 py-3 bg-black/10 backdrop-blur-sm"
      >
        <UButton
          @click="$router.back()"
          variant="ghost"
          icon="i-heroicons-arrow-left"
          class="text-white"
        />
        <div class="text-white font-semibold text-17-medium">Log In</div>
        <div class="w-8"></div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-20 pb-32 px-6">
      <div class="space-y-8">
        <!-- Welcome Back -->
        <div class="text-center space-y-2">
          <h1 class="text-28-emphasized text-white">Welcome Back</h1>
          <p class="text-16-medium text-white/70">Sign in to your account</p>
        </div>

        <!-- Login Form -->
        <UCard class="glass-card">
          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <UFormGroup label="Email" class="space-y-2">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="Enter your email"
                required
                class="w-full"
                :disabled="isLoading"
              />
            </UFormGroup>

            <UFormGroup label="Password" class="space-y-2">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="Enter your password"
                required
                class="w-full"
                :disabled="isLoading"
              />
            </UFormGroup>

            <div class="flex items-center justify-between">
              <UCheckbox
                v-model="form.rememberMe"
                label="Remember me"
                :disabled="isLoading"
              />
              <UButton
                variant="link"
                class="text-brand-aqua p-0"
                @click="handleForgotPassword"
              >
                Forgot Password?
              </UButton>
            </div>

            <UButton
              type="submit"
              class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-17-medium rounded-xl"
              :loading="isLoading"
            >
              Sign In
            </UButton>
          </form>
        </UCard>

        <!-- Sign Up Link -->
        <div class="text-center">
          <span class="text-white/70">Don't have an account? </span>
          <UButton
            variant="link"
            class="text-white font-semibold p-0"
            @click="navigateTo('/')"
          >
            Sign Up
          </UButton>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Login - UmovingU',
})

// Form data
const form = ref({
  email: '',
  password: '',
  rememberMe: false,
})

const isLoading = ref(false)

// Methods
const handleSubmit = async () => {
  isLoading.value = true

  try {
    // Simulate login for demo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Handle successful login
    await navigateTo('/thank-you')
  } catch (error) {
    console.error('Login failed:', error)
    // Handle error - show toast notification
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
  // Navigate to forgot password page
  navigateTo('/forgot-password')
}
</script>
