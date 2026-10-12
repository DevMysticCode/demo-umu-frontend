// Identifies this app to the backend so the refresh token it hands back
// gets set as an httpOnly cookie scoped to THIS app's own
// /auth/refresh/mobile path (auth hardening, 12 Oct 2026 - see backend
// src/auth/refresh-cookie.ts). Keeps this app's session independent of
// umu-website-new/umu-website-integration even though all three currently
// share one backend.
const APP_SLUG = 'mobile'

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
      credentials: 'include',
      headers: { 'X-Umu-App': APP_SLUG },
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
      credentials: 'include',
      headers: { 'X-Umu-App': APP_SLUG },
      body: data,
    })
  }

  const login = (email: string, password: string) => {
    return $fetch(`${base}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Umu-App': APP_SLUG },
      body: { email, password },
    })
  }

  // Exchanges the httpOnly refresh-token cookie (set at login/verify-otp/
  // register above) for a fresh access token - the cookie rides along
  // automatically via credentials: 'include', never touched by this JS.
  // Throws if there's no valid cookie; callers should treat that as
  // "signed out" rather than retry.
  const refreshAccessToken = async () => {
    const res: any = await $fetch(`${base}/auth/refresh/${APP_SLUG}`, {
      method: 'POST',
      credentials: 'include',
    })
    if (res?.token) localStorage.setItem('token', res.token)
    return res?.token as string
  }

  // Best-effort server-side revocation (reads the refresh-token cookie, no
  // body needed) then always clears local state - a user clicking "sign
  // out" should end up signed out locally even if they're offline or the
  // backend call fails.
  const logout = async () => {
    try {
      await $fetch(`${base}/auth/logout/${APP_SLUG}`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Ignore - local state is still cleared below.
    } finally {
      localStorage.removeItem('token')
      // Stale key from before refresh tokens moved to an httpOnly cookie -
      // harmless to leave, but nothing should still be writing it.
      localStorage.removeItem('refreshToken')
      clearSessionFlag()
    }
  }

  return {
    requestOtp,
    verifyOtp,
    register,
    login,
    logout,
    refreshAccessToken,
  }
}


