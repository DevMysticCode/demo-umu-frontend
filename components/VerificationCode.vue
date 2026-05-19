<template>
  <div class="mobile-container" style="background: #fff">
    <div class="relative z-10 flex flex-col min-h-screen">
      <!-- Header -->
      <div class="verification-header">
        <BackButton />
      </div>

      <!-- Main Content -->
      <div class="verification-content">
        <div class="verification-content__header">
          <h1 class="verification-content__title">Check your email</h1>
          <p class="verification-content__subtitle">
            We sent a 6-digit verification code to your email<br />
            <span class="font-medium">{{ email }}</span>
          </p>
        </div>

        <!-- Code Input -->
        <div class="verification-content__code">
          <CodeInput
            v-model="verificationCode"
            @complete="handleCodeComplete"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="verification-content__error">
          {{ error }}
        </div>

        <!-- Continue Button -->
        <div class="verification-content__continue">
          <button
            @click="verifyCode"
            :disabled="!isCodeComplete || isLoading"
            class="verification-content__continue-button"
          >
            {{ isLoading ? 'Verifying...' : 'Continue' }}
            <span class="ml-2">→</span>
          </button>
        </div>

        <!-- Resend Code -->
        <div class="verification-content__resend">
          <button
            @click="resendCode"
            :disabled="!canResend"
            class="verification-content__resend-button"
            :class="{
              'verification-content__resend-button--disabled': !canResend,
            }"
          >
            {{ resendText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVerificationCode } from '../composables/useVerificationCode'
import CodeInput from './verification/CodeInput.vue'

// Use the composable for all data and methods
const {
  email,
  verificationCode,
  isLoading,
  error,
  isCodeComplete,
  canResend,
  resendText,
  handleCodeComplete,
  verifyCode,
  resendCode,
} = useVerificationCode()
</script>

<style scoped>
/* Verification Header */
.verification-header {
  @apply pt-6 px-6;
}

.verification-header__back {
  @apply text-white flex items-center hover:text-white/80 transition-colors;
}

/* Verification Content */
.verification-content {
  @apply flex-1 flex flex-col justify-center px-6 pb-8;
}

.verification-content__header {
  @apply text-center mb-12;
}

.verification-content__title {
  @apply text-28-emphasized mb-4;
  color: #231d45;
}

.verification-content__subtitle {
  @apply text-16-medium leading-relaxed;
  color: #4a5568;
}

.verification-content__code {
  @apply mb-8;
}

.verification-content__error {
  @apply text-red-500 text-center text-sm mb-4;
}

.verification-content__resend {
  @apply text-center mb-8;
}

.verification-content__resend-button {
  @apply text-brand-aqua font-medium text-base hover:text-brand-aqua/80 transition-colors;
}

.verification-content__resend-button--disabled {
  @apply text-gray-400 cursor-not-allowed hover:text-gray-400;
}

.verification-content__continue {
  @apply mb-8;
}

.verification-content__continue-button {
  @apply w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-medium text-base rounded-full flex items-center justify-center transition-colors;
  box-shadow: 0 4px 18px rgba(0, 161, 154, 0.3);
}

.verification-content__continue-button:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
