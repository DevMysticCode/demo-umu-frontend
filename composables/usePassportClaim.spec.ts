import { describe, it, expect, vi } from 'vitest'
import { usePassportClaim } from './usePassportClaim'

const fetchMock = () => globalThis.$fetch as unknown as ReturnType<typeof vi.fn>

describe('usePassportClaim - claim journey', () => {
  it('getPassportStatus returns the parsed status on success', async () => {
    fetchMock().mockResolvedValueOnce({ hasPassport: false, passportId: null, isOwner: false, isCollaborator: false })
    const { getPassportStatus } = usePassportClaim()

    const status = await getPassportStatus('prop-1')

    expect(status).toEqual({ hasPassport: false, passportId: null, isOwner: false, isCollaborator: false })
    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/property/prop-1/passport-status',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer test-access-token' }) }),
    )
  })

  it('getPassportStatus returns null (not a fake "unclaimed" result) on a network/auth failure', async () => {
    fetchMock().mockRejectedValueOnce(new Error('expired token'))
    const { getPassportStatus } = usePassportClaim()

    const status = await getPassportStatus('prop-1')

    expect(status).toBeNull()
  })

  it('claimPassport posts the address + optional type to /passport/create', async () => {
    fetchMock().mockResolvedValueOnce({ passportId: 'pp-1', status: 'PENDING_PAYMENT' })
    const { claimPassport } = usePassportClaim()

    const result = await claimPassport('prop-1', '1 Test Street', 'AB1 2CD', { type: 'seller' })

    expect(result).toEqual({ passportId: 'pp-1', status: 'PENDING_PAYMENT' })
    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/passport/create',
      expect.objectContaining({
        method: 'POST',
        body: { propertyId: 'prop-1', addressLine1: '1 Test Street', postcode: 'AB1 2CD', type: 'seller' },
      }),
    )
  })

  it('claimPassport omits type/isHmo from the body when not provided', async () => {
    fetchMock().mockResolvedValueOnce({ passportId: 'pp-2', status: 'IN_PROGRESS' })
    const { claimPassport } = usePassportClaim()

    await claimPassport('prop-2', '2 Test Street', 'AB1 2CD')

    expect(fetchMock()).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: { propertyId: 'prop-2', addressLine1: '2 Test Street', postcode: 'AB1 2CD' } }),
    )
  })

  it('createClaimPaymentIntent surfaces a payment error instead of returning a partial result', async () => {
    fetchMock().mockRejectedValueOnce(Object.assign(new Error('card_declined'), { statusCode: 402 }))
    const { createClaimPaymentIntent } = usePassportClaim()

    await expect(createClaimPaymentIntent('pp-1')).rejects.toThrow('card_declined')
  })

  it('setPassportType sends the HMO flag only when set', async () => {
    fetchMock().mockResolvedValueOnce({ passportId: 'pp-1', status: 'IN_PROGRESS' })
    const { setPassportType } = usePassportClaim()

    await setPassportType('pp-1', 'landlord', true)

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/passport/pp-1/set-type',
      expect.objectContaining({ body: { type: 'landlord', isHmo: true } }),
    )
  })

  it('unlockPassport (buyer-unlock) hits the buyer-unlock endpoint with auth', async () => {
    fetchMock().mockResolvedValueOnce({ passportId: 'pp-1' })
    const { unlockPassport } = usePassportClaim()

    await unlockPassport('pp-1')

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/passport/pp-1/buyer-unlock',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
