// Shared OTP-request flow for the public tenant e-sign pages
// (pages/sign/tenancy/[token].vue, pages/sign/inventory/[token].vue).
// Backend now requires a one-time code sent to the signing link's stored
// tenantEmail before a signature is accepted (security review finding #6) -
// this is the "request the code" half; the code itself travels in the same
// body as the signature submission (see each page's own onSubmit).

export function useTenantSignOtp(token: string) {
  const config = useRuntimeConfig()

  const otpRequested = ref(false)
  const otpCode = ref('')
  const otpSending = ref(false)
  const otpError = ref('')
  const cooldown = ref(0)

  let timer: ReturnType<typeof setInterval> | null = null

  function stopCooldown() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function startCooldown(seconds = 60) {
    cooldown.value = seconds
    stopCooldown()
    timer = setInterval(() => {
      cooldown.value -= 1
      if (cooldown.value <= 0) stopCooldown()
    }, 1000)
  }

  // Backend rate-limits this to one send per 60s (400 if called sooner) -
  // callers should only invoke it from a user action (first "sign" click,
  // explicit "resend"), never automatically on page load/mount.
  async function requestOtp() {
    if (otpSending.value || cooldown.value > 0) return
    otpSending.value = true
    otpError.value = ''
    try {
      await $fetch(`${config.public.apiBase}/questions/tenancy-sign/${token}/otp`, {
        method: 'POST',
      })
      otpRequested.value = true
      otpCode.value = ''
      startCooldown(60)
    } catch (err: any) {
      otpError.value = err?.data?.message ?? 'Could not send the code - please try again.'
    } finally {
      otpSending.value = false
    }
  }

  onBeforeUnmount(stopCooldown)

  return { otpRequested, otpCode, otpSending, otpError, cooldown, requestOtp }
}
