export const useAuth = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const requestOtp = (email: string) => {
    return $fetch(`${base}/auth/request-otp`, {
      method: 'POST',
      body: { email },
    })
  }

  const verifyOtp = (email: string, code: string) => {
    return $fetch(`${base}/auth/verify-otp`, {
      method: 'POST',
      body: { email, code },
    })
  }

  const register = (data: {
    email: string
    password: string
    firstName: string
    lastName?: string
    phone?: string
    dob?: string
    postcode?: string
    gender?: string
  }) => {
    return $fetch(`${base}/auth/register`, {
      method: 'POST',
      body: data,
    })
  }

  return {
    requestOtp,
    verifyOtp,
    register,
  }
}
