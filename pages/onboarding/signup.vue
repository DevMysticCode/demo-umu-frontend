<template>
  <div class="mobile-container backgound-image content">
    <BackButton />
    <!-- Logo and Welcome -->
    <div class="logo-and-welcome">
      <OPIcon name="logo" class="w-16 h-16" />
      <h1>Welcome to UmovingU. Your journey starts here.</h1>
      <h5 class="text-white mt-2">Sign up using Social</h5>
    </div>

    <div class="login-options">
      <div class="social-logins">
        <button
          class="social-logins__button"
          @click="handleSocialLogin('apple')"
        >
          <OPIcon name="appleNew" class="w-[20px] h-[20px]" />
        </button>

        <button
          class="social-logins__button"
          @click="handleSocialLogin('google')"
        >
          <OPIcon name="googleNew" class="w-[20px] h-[20px]" />
        </button>

        <button
          class="social-logins__button"
          @click="handleSocialLogin('facebook')"
        >
          <OPIcon name="facebookNew" class="w-[20px] h-[20px]" />
        </button>
      </div>

      <!-- Email Form -->
      <form class="email-form" @submit.prevent="handleEmailContinue">
        <!-- Divider -->
        <div class="email-form__divider">
          <div class="flex-1 h-px bg-white/80"></div>
          <span class="text-white/80 text-sm">or login with email</span>
          <div class="flex-1 h-px bg-white/80"></div>
        </div>

        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
        />

        <button class="email-form__button" type="submit">Log In</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { getDtaFromSubmitEvent } from '~/utils/form-helpres'
import OPIcon from '~/components/ui/OPIcon.vue'
import BackButton from '~/components/core/BackButton.vue'

definePageMeta({
  title: 'Sign Up - UmovingU',
})

const handleSocialLogin = async (provider) => {
  console.log('handleSocialLogin', provider)

  // Navigate to thank you page
  await navigateTo('/onboarding/create-account')
}

const handleEmailContinue = async (event) => {
  event.preventDefault()
  event.stopPropagation()

  const formData = getDtaFromSubmitEvent(event)
  // API call to log this person in. Login or Signup, its the same route

  await navigateTo(`/onboarding/verification`)
}
</script>

<style scoped>
.content {
  @apply pt-6 px-4;
  @apply flex flex-col;
  @apply min-h-dvh;
}

.logo-and-welcome {
  @apply mt-3;
  h1 {
    @apply text-[34px] font-bold text-white;
  }
}

.login-options {
  @apply flex flex-col h-full mb-6 flex-1 relative;
}

.social-logins {
  @apply flex items-center justify-center gap-2 mt-4;

  &__button {
    @apply flex items-center justify-center gap-2;
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
    @apply text-white text-[17px] absolute bottom-0;
  }

  &__divider {
    @apply flex items-center space-x-4 mb-4 mt-6;
  }
}
</style>
