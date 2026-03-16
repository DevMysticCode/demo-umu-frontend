export const useAuth = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const getHeaders = () => {
    const token = localStorage.getItem('token')

    return token ? { Authorization: `Bearer ${token}` } : {}
  }

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

  const login = (email: string, password: string) => {
    return $fetch(`${base}/auth/login`, {
      method: 'POST',
      body: { email, password },
    })
  }

  const googleLogin = (credential: string) => {
    return $fetch(`${base}/auth/google`, {
      method: 'POST',
      body: { credential },
    })
  }

  const appleLogin = (idToken: string, firstName?: string, lastName?: string) => {
    return $fetch(`${base}/auth/apple`, {
      method: 'POST',
      body: { idToken, firstName, lastName },
    })
  }

  /** Dev-only: bypasses Apple SDK — use on localhost */
  const appleLoginMock = (email = 'apple-test@dev.local') => {
    return $fetch(`${base}/auth/apple/mock`, {
      method: 'POST',
      body: { email, firstName: 'Apple', lastName: 'Test' },
    })
  }

  return {
    requestOtp,
    verifyOtp,
    register,
    login,
    googleLogin,
    appleLogin,
    appleLoginMock,
  }
}


