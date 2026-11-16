import { describe, it, expect, vi } from 'vitest'
import { useMarketplace } from './useMarketplace'

const fetchMock = () => globalThis.$fetch as unknown as ReturnType<typeof vi.fn>

describe('useMarketplace - payment/escrow journey', () => {
  it('authorizeOffer starts escrow authorisation for the accepted offer', async () => {
    fetchMock().mockResolvedValueOnce({ paymentId: 'pay-1', clientSecret: 'secret_abc', amount: 15000 })
    const { authorizeOffer } = useMarketplace()

    const result = await authorizeOffer('offer-1')

    expect(result).toEqual({ paymentId: 'pay-1', clientSecret: 'secret_abc', amount: 15000 })
    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/marketplace/offers/offer-1/authorize',
      expect.objectContaining({ method: 'POST', headers: expect.objectContaining({ Authorization: 'Bearer test-access-token' }) }),
    )
  })

  it('authorizeOffer propagates a Stripe/backend failure rather than pretending payment started', async () => {
    fetchMock().mockRejectedValueOnce(Object.assign(new Error('card_declined'), { statusCode: 402 }))
    const { authorizeOffer } = useMarketplace()

    await expect(authorizeOffer('offer-1')).rejects.toThrow('card_declined')
  })

  it('confirmPayment marks the escrowed payment confirmed after the Stripe client-side step', async () => {
    fetchMock().mockResolvedValueOnce({ id: 'pay-1', status: 'confirmed' })
    const { confirmPayment } = useMarketplace()

    await confirmPayment('pay-1')

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/marketplace/payments/pay-1/confirm',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('releasePayment (customer releasing escrow to the supplier) hits the release endpoint', async () => {
    fetchMock().mockResolvedValueOnce({ id: 'pay-1', status: 'released' })
    const { releasePayment } = useMarketplace()

    await releasePayment('pay-1')

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/marketplace/payments/pay-1/release',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('fetchPaymentForJob returns null for a job with no payment yet rather than throwing', async () => {
    fetchMock().mockResolvedValueOnce(null)
    const { fetchPaymentForJob } = useMarketplace()

    const payment = await fetchPaymentForJob('job-1')

    expect(payment).toBeNull()
  })

  it('addEvidence appends evidence photo URLs to the payment/contract record', async () => {
    fetchMock().mockResolvedValueOnce({ id: 'pay-1', status: 'released' })
    const { addEvidence } = useMarketplace()

    await addEvidence('pay-1', ['/uploads/before.jpg', '/uploads/after.jpg'])

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/marketplace/payments/pay-1/evidence',
      expect.objectContaining({ method: 'POST', body: { photos: ['/uploads/before.jpg', '/uploads/after.jpg'] } }),
    )
  })

  it('acceptOffer / declineOffer hit distinct endpoints so one can never be mistaken for the other', async () => {
    fetchMock().mockResolvedValueOnce({ id: 'offer-1', status: 'accepted' })
    const { acceptOffer } = useMarketplace()
    await acceptOffer('offer-1')
    expect(fetchMock()).toHaveBeenCalledWith('https://api.test.local/marketplace/offers/offer-1/accept', expect.objectContaining({ method: 'POST' }))

    fetchMock().mockResolvedValueOnce({ id: 'offer-2', status: 'declined' })
    const { declineOffer } = useMarketplace()
    await declineOffer('offer-2')
    expect(fetchMock()).toHaveBeenCalledWith('https://api.test.local/marketplace/offers/offer-2/decline', expect.objectContaining({ method: 'POST' }))
  })
})
