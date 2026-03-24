import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSession } from '~/composables/useSession'

export const useVerificationCode = () => {
  const { verifyOtp, requestOtp } = useAuth()
  const { email } = useSession()

  // Form state
  const verificationCode = ref<string>('')
  const isLoading = ref<boolean>(false)
  const resendCooldown = ref<number>(60) // start counting down immediately
  const error = ref<string>('')

  let cooldownTimer: ReturnType<typeof setInterval> | null = null

  const startCooldown = (seconds = 60) => {
    resendCooldown.value = seconds
    if (cooldownTimer) clearInterval(cooldownTimer)
    cooldownTimer = setInterval(() => {
      resendCooldown.value--
      if (resendCooldown.value <= 0) {
        clearInterval(cooldownTimer!)
        cooldownTimer = null
      }
    }, 1000)
  }

  onMounted(() => startCooldown(60))
  onUnmounted(() => { if (cooldownTimer) clearInterval(cooldownTimer) })

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
      await requestOtp(email.value)
      verificationCode.value = ''
      error.value = ''
      startCooldown(60)
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


