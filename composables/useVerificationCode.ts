import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useSession } from '~/composables/useSession'

export const useVerificationCode = () => {
  const { verifyOtp, requestOtp, register } = useAuth()
  const { email, pendingSignup } = useSession()

  const verificationCode = ref<string>('')
  const isLoading = ref<boolean>(false)
  const resendCooldown = ref<number>(60)
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

  const isCodeComplete = computed<boolean>(() => verificationCode.value.length === 6)
  const canResend = computed<boolean>(() => resendCooldown.value === 0)

  const resendText = computed<string>(() => {
    if (resendCooldown.value > 0) {
      const minutes = Math.floor(resendCooldown.value / 60)
      const seconds = resendCooldown.value % 60
      return `Resend code in ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return 'Resend code'
  })

  const handleNumberInput = (number: string): void => {
    if (verificationCode.value.length < 6) verificationCode.value += number
  }

  const handleBackspace = (): void => {
    verificationCode.value = verificationCode.value.slice(0, -1)
  }

  const handleCodeComplete = (code: string): void => {
    verificationCode.value = code
    verifyCode()
  }

  const verifyCode = async (): Promise<void> => {
    if (!isCodeComplete.value) return

    isLoading.value = true
    error.value = ''

    try {
      await verifyOtp(email.value, verificationCode.value)

      if (pendingSignup.value) {
        const { firstName, lastName, phone, dob, postcode, gender, password } = pendingSignup.value
        const regRes: any = await register({
          email: email.value,
          firstName,
          ...(lastName ? { lastName } : {}),
          ...(phone ? { phone } : {}),
          ...(dob ? { dob } : {}),
          ...(postcode ? { postcode } : {}),
          ...(gender ? { gender } : {}),
          password,
        })
        localStorage.setItem('token', regRes.token)
        pendingSignup.value = null
        await navigateTo('/onboarding/thank-you')
      } else {
        // No pending data — user landed on verify directly; fall back to create-account
        await navigateTo('/onboarding/create-account')
      }
    } catch (err: any) {
      error.value =
        err?.data?.message ||
        err?.response?._data?.message ||
        'Verification failed. Please check your code and try again.'
      verificationCode.value = ''
    } finally {
      isLoading.value = false
    }
  }

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
    window.history.back()
  }

  return {
    email,
    verificationCode,
    isLoading,
    error,
    isCodeComplete,
    canResend,
    resendText,
    handleNumberInput,
    handleBackspace,
    handleCodeComplete,
    verifyCode,
    resendCode,
    goBack,
  }
}
