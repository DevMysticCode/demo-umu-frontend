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
        <p class="text-[15px] text-[#3c3c43]">Signing you in with Apple…</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Apple posts the authorization result here when usePopup=false (redirect flow).
 * The POST body contains: code, id_token, state, and optionally user (JSON).
 * Since Nuxt pages only handle GET, we use a Nuxt server route to receive the POST
 * and redirect here with query params.  For the popup flow (usePopup=true, used in
 * development) this page is never reached — the SDK resolves the promise directly.
 */

const { appleLogin } = useAuth()
const route = useRoute()
const error = ref<string | null>(null)

onMounted(async () => {
  const idToken = route.query.id_token as string | undefined
  const userParam = route.query.user as string | undefined

  if (!idToken) {
    error.value = 'Apple sign-in failed: missing token.'
    return
  }

  let firstName: string | undefined
  let lastName: string | undefined
  if (userParam) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userParam))
      firstName = parsed?.name?.firstName
      lastName = parsed?.name?.lastName
    } catch {}
  }

  try {
    const result: any = await appleLogin(idToken, firstName, lastName)
    localStorage.setItem('token', result.token)
    const redirect = localStorage.getItem('redirectAfterLogin')
    if (redirect) {
      localStorage.removeItem('redirectAfterLogin')
      await navigateTo(redirect)
    } else {
      await navigateTo('/dashboard')
    }
  } catch (e) {
    console.error('Apple callback error', e)
    error.value = 'Sign-in failed. Please try again.'
  }
})
</script>
