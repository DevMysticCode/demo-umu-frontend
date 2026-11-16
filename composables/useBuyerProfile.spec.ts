import { describe, it, expect, vi } from 'vitest'
import { useBuyerProfile } from './useBuyerProfile'

const fetchMock = () => globalThis.$fetch as unknown as ReturnType<typeof vi.fn>

describe('useBuyerProfile - share journey', () => {
  it('createShare posts the recipient + scope and returns the created share', async () => {
    fetchMock().mockResolvedValueOnce({
      id: 'share-1', profileId: 'bp-1', token: 'tok', recipientName: 'Agent Smith',
      recipientEmail: 'agent@example.com', scope: ['id', 'funds'], sentAt: '2026-11-16T00:00:00Z',
      expiresAt: '2026-12-16T00:00:00Z', revokedAt: null, lastViewedAt: null, viewCount: 0,
    })
    const { createShare } = useBuyerProfile()

    const share = await createShare({ recipientEmail: 'agent@example.com', scope: ['id', 'funds'], expiresInDays: 30 })

    expect(share.token).toBe('tok')
    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/buyer-profile/shares',
      expect.objectContaining({
        method: 'POST',
        body: { recipientEmail: 'agent@example.com', scope: ['id', 'funds'], expiresInDays: 30 },
      }),
    )
  })

  it('listShares returns an empty list rather than throwing when the fetch fails', async () => {
    fetchMock().mockRejectedValueOnce(new Error('network error'))
    const { listShares } = useBuyerProfile()

    const shares = await listShares()

    expect(shares).toEqual([])
  })

  it('revokeShare calls the revoke endpoint for the specific share id, not a bulk revoke', async () => {
    fetchMock().mockResolvedValueOnce({ id: 'share-1', revokedAt: '2026-11-16T00:00:00Z' })
    const { revokeShare } = useBuyerProfile()

    await revokeShare('share-1')

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/buyer-profile/shares/share-1/revoke',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('getPublicShare reads a shared profile by token with no auth header required', async () => {
    fetchMock().mockResolvedValueOnce({ tier: 'VERIFIED' })
    const { getPublicShare } = useBuyerProfile()

    await getPublicShare('public-token-abc')

    expect(fetchMock()).toHaveBeenCalledWith('https://api.test.local/buyer-profile/public/public-token-abc')
  })
})

describe('useBuyerProfile - e-signing journey', () => {
  it('signProfile posts the signature payload (canvas data or typed name)', async () => {
    fetchMock().mockResolvedValueOnce({ signatureData: 'data:image/png;base64,xyz', signedName: null, signedAt: '2026-11-16T00:00:00Z' })
    const { signProfile } = useBuyerProfile()

    await signProfile({ signatureData: 'data:image/png;base64,xyz' })

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/buyer-profile/sign',
      expect.objectContaining({ method: 'POST', body: { signatureData: 'data:image/png;base64,xyz' } }),
    )
  })

  it('signProfile surfaces a server rejection rather than treating the profile as signed', async () => {
    fetchMock().mockRejectedValueOnce(Object.assign(new Error('Profile not complete'), { statusCode: 400 }))
    const { signProfile } = useBuyerProfile()

    await expect(signProfile({ signedName: 'Jane Buyer' })).rejects.toThrow('Profile not complete')
  })

  it('clearSignature resets the stored signature so the profile is unsigned again', async () => {
    fetchMock().mockResolvedValueOnce({ signatureData: null, signedName: null, signedAt: null })
    const { clearSignature } = useBuyerProfile()

    const profile = await clearSignature()

    expect(profile.signedAt).toBeNull()
    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/buyer-profile/sign/clear',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
