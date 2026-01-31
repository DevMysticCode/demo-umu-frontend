import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSession } from '~/composables/useSession'

export const useVerificationCode = () => {
  // Get email from query params or localStorage (mock implementation)
  const { verifyOtp, requestOtp } = useAuth()
  const { email } = useSession()

  // Form state
  const verificationCode = ref<string>('')
  const isLoading = ref<boolean>(false)
  const resendCooldown = ref<number>(0)
  const error = ref<string>('')

  // Computed
  const isCodeComplete = computed<boolean>(() => {
    return verificationCode.value.length === 6
  })

  const canResend = computed<boolean>(() => {
    return resendCooldown.value === 0
  })

  const resendText = computed<string>(() => {
    if (resendCooldown.value > 0) {
      const minutes = Math.floor(resendCooldown.value / 60)
      const seconds = resendCooldown.value % 60
      return `Resend code in ${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`
    }
    return 'Resend code'
  })

  // Methods
  const handleNumberInput = (number: string): void => {
    if (verificationCode.value.length < 6) {
      verificationCode.value += number
    }
  }

  const handleBackspace = (): void => {
    verificationCode.value = verificationCode.value.slice(0, -1)
  }

  const handleCodeComplete = (code: string): void => {
    console.log('Code completed:', code)
    verificationCode.value = code
    // Auto-verify when code is complete
    verifyCode()
  }

  //  Verify OTP with backend
  const verifyCode = async (): Promise<void> => {
    if (!isCodeComplete.value) return

    isLoading.value = true
    error.value = ''

    console.log(
      'Email:',
      email,
      'Email:',
      email.value,
      'Verification Code:',
      verificationCode.value,
    )
    try {
      const response = await verifyOtp(email.value, verificationCode.value)
      console.log('OTP verification response:', response)

      await navigateTo('/onboarding/create-account')

      // Navigate to create account page
      // setTimeout(() => {
      //   window.location.href = '/onboarding/create-account'
      // }, 500)
    } catch (err) {
      console.error(err)
      error.value =
        err?.data?.message ||
        err?.response?._data?.message ||
        'Verification Failed'
      // Clear the code on error
      verificationCode.value = ''
    } finally {
      isLoading.value = false
    }
  }

  // Resend OTP code
  const resendCode = async (): Promise<void> => {
    if (!canResend.value) return

    try {
      const response = await requestOtp(email.value)

      // Start cooldown timer (60 seconds)
      resendCooldown.value = 60
      const timer = setInterval(() => {
        resendCooldown.value--
        if (resendCooldown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)

      // Clear any existing code
      verificationCode.value = ''
      error.value = ''
    } catch (err) {
      console.error('Failed to resend code:', err)
    }
  }

  const goBack = (): void => {
    // Navigate back to previous page
    window.history.back()
  }

  return {
    // State
    email,
    verificationCode,
    isLoading,
    error,

    // Computed
    isCodeComplete,
    canResend,
    resendText,

    // Methods
    handleCodeComplete,
    verifyCode,
    resendCode,
    goBack,
  }
}
