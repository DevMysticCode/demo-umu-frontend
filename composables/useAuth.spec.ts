import { describe, it, expect, vi } from 'vitest'
import { useAuth } from './useAuth'
import { getToken } from './useAuthToken'

const fetchMock = () => globalThis.$fetch as unknown as ReturnType<typeof vi.fn>

describe('useAuth - sign-up journey', () => {
  it('requestOtp posts the email to /auth/request-otp with no auth required', async () => {
    fetchMock().mockResolvedValueOnce({ sent: true })
    const { requestOtp } = useAuth()

    await requestOtp('new-user@example.com')

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/auth/request-otp',
      expect.objectContaining({ method: 'POST', body: { email: 'new-user@example.com' } }),
    )
  })

  it('verifyOtp sends credentials so the refresh-token cookie gets set', async () => {
    fetchMock().mockResolvedValueOnce({ token: 'abc', user: { id: '1' } })
    const { verifyOtp } = useAuth()

    await verifyOtp('new-user@example.com', '123456')

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/auth/verify-otp',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Umu-App': 'mobile' },
        body: { email: 'new-user@example.com', code: '123456' },
      }),
    )
  })

  it('register submits the sign-up form with the mobile app header', async () => {
    fetchMock().mockResolvedValueOnce({ token: 'abc' })
    const { register } = useAuth()

    await register({ email: 'a@b.com', password: 'hunter2', firstName: 'Ada' })

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/auth/register',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Umu-App': 'mobile' },
        body: { email: 'a@b.com', password: 'hunter2', firstName: 'Ada' },
      }),
    )
  })

  it('register propagates a backend validation error rather than swallowing it', async () => {
    fetchMock().mockRejectedValueOnce(Object.assign(new Error('Conflict'), { statusCode: 409 }))
    const { register } = useAuth()

    await expect(
      register({ email: 'dupe@b.com', password: 'hunter2', firstName: 'Ada' }),
    ).rejects.toThrow('Conflict')
  })

  it('refreshAccessToken stores the returned token in the in-memory store', async () => {
    fetchMock().mockResolvedValueOnce({ token: 'fresh-token' })
    const { refreshAccessToken } = useAuth()

    const token = await refreshAccessToken()

    expect(token).toBe('fresh-token')
    expect(getToken()).toBe('fresh-token')
  })

  it('refreshAccessToken throws (no silent "signed out" success) when the cookie is missing/expired', async () => {
    fetchMock().mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { statusCode: 401 }))
    const { refreshAccessToken } = useAuth()

    await expect(refreshAccessToken()).rejects.toThrow('Unauthorized')
  })

  it('logout clears the local token even when the server-side revoke call fails', async () => {
    fetchMock().mockRejectedValueOnce(new Error('network down'))
    const { logout } = useAuth()

    await logout()

    expect(getToken()).toBeNull()
  })
})
