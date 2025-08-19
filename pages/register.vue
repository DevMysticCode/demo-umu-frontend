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
          Sign Up
        </div>
        <div class="w-8"></div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-20 pb-32 px-6">
      <div class="space-y-8">
        <!-- Welcome Back -->
        <div class="text-center space-y-2">
          <h1 class="text-28-emphasized text-white">
            Create Account
          </h1>
          <p class="text-16-medium text-white/70">
            Join UmovingU today
          </p>
        </div>

        <!-- Registration Form -->
        <UCard class="glass-card">
          <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <UFormGroup label="Full Name" class="space-y-2">
              <UInput
                v-model="form.fullName"
                type="text"
                placeholder="Enter your full name"
                required
                class="w-full"
                :disabled="isLoading"
              />
            </UFormGroup>

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
                placeholder="Create a password"
                required
                class="w-full"
                :disabled="isLoading"
              />
            </UFormGroup>

            <UFormGroup label="Confirm Password" class="space-y-2">
              <UInput
                v-model="form.confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                class="w-full"
                :disabled="isLoading"
              />
            </UFormGroup>

            <div class="flex items-start space-x-3">
              <UCheckbox
                v-model="form.agreeToTerms"
                :disabled="isLoading"
              />
              <div class="text-sm text-gray-600">
                I agree to the 
                <UButton variant="link" class="text-brand-aqua p-0 text-sm">
                  Terms of Service
                </UButton>
                and 
                <UButton variant="link" class="text-brand-aqua p-0 text-sm">
                  Privacy Policy
                </UButton>
              </div>
            </div>

            <UButton
              type="submit"
              class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-17-medium rounded-xl"
              :loading="isLoading"
              :disabled="!isFormValid"
            >
              Create Account
            </UButton>
          </form>
        </UCard>

        <!-- Login Link -->
        <div class="text-center">
          <span class="text-white/70">Already have an account? </span>
          <UButton
            variant="link"
            class="text-white font-semibold p-0"
            @click="navigateTo('/login')"
          >
            Sign In
          </UButton>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Register - UmovingU'
})

// Get email from query params if available
const route = useRoute()
const prefilledEmail = route.query.email || ''

// Form data
const form = ref({
  fullName: '',
  email: prefilledEmail,
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

const isLoading = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.value.fullName && 
         form.value.email && 
         form.value.password && 
         form.value.confirmPassword &&
         form.value.password === form.value.confirmPassword &&
         form.value.agreeToTerms
})

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  
  try {
    const { data } = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        fullName: form.value.fullName,
        email: form.value.email,
        password: form.value.password
      }
    })
    
    // Handle successful registration
    await navigateTo('/onboarding')
  } catch (error) {
    console.error('Registration failed:', error)
    // Handle error - show toast notification
  } finally {
    isLoading.value = false
  }
}
</script>