import { describe, it, expect, vi } from 'vitest'
import { usePassportApi } from './usePassportApi'

const fetchMock = () => globalThis.$fetch as unknown as ReturnType<typeof vi.fn>

describe('usePassportApi - Passport viewing journey', () => {
  it('getSections fetches a passport\'s sections with auth', async () => {
    fetchMock().mockResolvedValueOnce([{ key: 'ownership', title: 'Ownership Profile' }])
    const { getSections } = usePassportApi()

    const sections = await getSections('pp-1')

    expect(sections).toEqual([{ key: 'ownership', title: 'Ownership Profile' }])
    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/passport/pp-1/sections',
      expect.objectContaining({ headers: { Authorization: 'Bearer test-access-token' } }),
    )
  })

  it('getAccess tells the page whether the viewer is the owner, a collaborator, or neither', async () => {
    fetchMock().mockResolvedValueOnce({ isOwner: false, isCollaborator: true, permission: 'write' })
    const { getAccess } = usePassportApi()

    const access = await getAccess('pp-1')

    expect(access).toEqual({ isOwner: false, isCollaborator: true, permission: 'write' })
  })

  it('getSections propagates a 403 instead of returning an empty list for a passport the viewer cannot access', async () => {
    fetchMock().mockRejectedValueOnce(Object.assign(new Error('Forbidden'), { statusCode: 403 }))
    const { getSections } = usePassportApi()

    await expect(getSections('someone-elses-pp')).rejects.toThrow('Forbidden')
  })

  it('answerQuestion posts the value to the question-specific endpoint', async () => {
    fetchMock().mockResolvedValueOnce({ questionId: 'q-1', value: 'Freehold' })
    const { answerQuestion } = usePassportApi()

    await answerQuestion('q-1', 'Freehold')

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/questions/q-1/answer',
      expect.objectContaining({ method: 'POST', body: { value: 'Freehold' } }),
    )
  })

  it('completeTask marks the task done so the section-unlock cascade can proceed', async () => {
    fetchMock().mockResolvedValueOnce({ taskId: 't-1', completed: true })
    const { completeTask } = usePassportApi()

    await completeTask('t-1')

    expect(fetchMock()).toHaveBeenCalledWith(
      'https://api.test.local/tasks/t-1/complete',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('uploadPropertyImage sends the file as multipart form data', async () => {
    fetchMock().mockResolvedValueOnce({ url: '/uploads/x.jpg', name: 'x.jpg', mimeType: 'image/jpeg', size: 10 })
    const { uploadPropertyImage } = usePassportApi()
    const file = new File(['x'], 'x.jpg', { type: 'image/jpeg' })

    await uploadPropertyImage('pp-1', file)

    const [, opts] = fetchMock().mock.calls[0]
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)
  })
})
