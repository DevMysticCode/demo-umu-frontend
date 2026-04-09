<template>
  <div class="mobile-container min-h-screen bg-umu-gradient flex items-center justify-center">
    <div class="text-center px-6">
      <div v-if="error" class="space-y-4">
        <p class="text-red-500 font-medium">{{ error }}</p>
        <button
          class="w-full h-12 rounded-xl bg-brand-aqua text-white font-medium"
          @click="navigateTo('/onboarding/signin')"
        >
          Back to Sign In
        </button>
      </div>
      <div v-else class="space-y-3">
        <Icon name="i-heroicons-arrow-path" class="w-10 h-10 text-brand-aqua animate-spin mx-auto" />
        <p class="text-[15px] text-[#3c3c43]">Signing you in with Google…</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const error = ref<string | null>(null)

onMounted(async () => {
  const token = route.query.token as string | undefined
  const next = route.query.next as string | undefined

  if (!token) {
    error.value = 'Google sign-in failed: missing token.'
    return
  }

  try {
    localStorage.setItem('token', decodeURIComponent(token))
    const redirectPath = next
      ? decodeURIComponent(next)
      : localStorage.getItem('redirectAfterLogin')
    if (redirectPath) {
      localStorage.removeItem('redirectAfterLogin')
      await navigateTo(redirectPath)
    } else {
      await navigateTo('/dashboard')
    }
  } catch (e) {
    console.error('Google callback error', e)
    error.value = 'Sign-in failed. Please try again.'
  }
})
</script>
