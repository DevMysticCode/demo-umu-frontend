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

  // useState persists across SPA navigations; sessionStorage covers page refreshes
  const resolveEmail = (): string => {
    if (email.value) return email.value
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem('umu-pending-email')
      if (stored) {
        email.value = stored
        return stored
      }
    }
    return ''
  }

  const parseApiError = (err: any): string => {
    const msg = err?.data?.message ?? err?.response?._data?.message
    if (Array.isArray(msg)) return msg.join('. ')
    return msg || 'Verification failed. Please check your code and try again.'
  }

  const verifyCode = async (): Promise<void> => {
    if (!isCodeComplete.value) return

    const resolvedEmail = resolveEmail()
    if (!resolvedEmail) {
      error.value = 'Session expired. Please go back and enter your email again.'
      return
    }

    isLoading.value = true
    error.value = ''

    try {
      await verifyOtp(resolvedEmail, verificationCode.value)

      if (pendingSignup.value) {
        const { firstName, lastName, phone, postcode, password } = pendingSignup.value
        const regRes: any = await register({
          email: resolvedEmail,
          firstName,
          ...(lastName ? { lastName } : {}),
          ...(phone ? { phone } : {}),
          ...(postcode ? { postcode } : {}),
          password,
        })
        localStorage.setItem('token', regRes.token)
        sessionStorage.removeItem('umu-pending-email')
        pendingSignup.value = null
        await navigateTo('/onboarding/thank-you')
      } else {
        await navigateTo('/onboarding/create-account')
      }
    } catch (err: any) {
      error.value = parseApiError(err)
      verificationCode.value = ''
    } finally {
      isLoading.value = false
    }
  }

  const resendCode = async (): Promise<void> => {
    if (!canResend.value) return
    const resolvedEmail = resolveEmail()
    try {
      await requestOtp(resolvedEmail)
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
