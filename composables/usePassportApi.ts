export const usePassportApi = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  const token = () => localStorage.getItem('token')

  const headers = () => ({
    Authorization: `Bearer ${token()}`,
  })

  const getSections = (passportId: string) =>
    $fetch(`${base}/passport/${passportId}/sections`, {
      headers: headers(),
    })

  const getQuestions = (taskId: string) =>
    $fetch(`${base}/tasks/${taskId}/questions`, {
      headers: headers(),
    })

  const answerQuestion = (questionId: string, value: any) =>
    $fetch(`${base}/questions/${questionId}/answer`, {
      method: 'POST',
      headers: headers(),
      body: { value },
    })

  const completeTask = (taskId: string) =>
    $fetch(`${base}/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: headers(),
    })

  const getPropertyImages = (passportId: string) =>
    $fetch<{ images: string[] }>(
      `${base}/passport/${passportId}/property-images`,
      {
        headers: headers(),
      },
    )

  const updatePropertyImages = (passportId: string, images: string[]) =>
    $fetch(`${base}/passport/${passportId}/property-images`, {
      method: 'PUT',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: { images },
    })

  const uploadPropertyImage = (passportId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return $fetch<{
      url: string
      name: string
      mimeType: string
      size: number
    }>(`${base}/passport/${passportId}/upload-image`, {
      method: 'POST',
      headers: headers(),
      body: formData,
    })
  }

  return {
    getSections,
    getQuestions,
    answerQuestion,
    completeTask,
    getPropertyImages,
    updatePropertyImages,
    uploadPropertyImage,
  }
}
