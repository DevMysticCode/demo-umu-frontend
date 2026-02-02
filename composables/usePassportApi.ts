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

  return {
    getSections,
    getQuestions,
    answerQuestion,
    completeTask,
  }
}
