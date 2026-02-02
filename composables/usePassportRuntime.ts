import { ref, computed } from 'vue'
import { usePassportApi } from './usePassportApi'

export const usePassportRuntime = () => {
  const {
    getSections,
    getQuestions,
    answerQuestion,
    completeTask: apiCompleteTask,
  } = usePassportApi()

  const steps = ref<any[]>([])
  const loading = ref(false)
  const currentStep = ref<any>(null)
  const currentTask = ref<any>(null)
  const currentQuestions = ref<any[]>([])
  const currentQuestionIndex = ref(0)

  const loadPassport = async (passportId: string) => {
    loading.value = true
    try {
      steps.value = (await getSections(passportId)) as any[]
    } finally {
      loading.value = false
    }
  }

  const setCurrentStep = (stepId: string) => {
    currentStep.value = steps.value.find((s: any) => s.id === stepId) || null
  }

  const setCurrentTask = (taskId: string) => {
    if (currentStep.value && currentStep.value.tasks) {
      currentTask.value =
        currentStep.value.tasks.find((t: any) => t.id === taskId) || null
    }
  }

  const loadQuestions = async (taskId: string) => {
    try {
      const result = (await getQuestions(taskId)) as any[]
      currentQuestions.value = result
      currentQuestionIndex.value = 0
      if (currentTask.value) {
        currentTask.value.questions = result
      }
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }

  const saveAnswer = async (questionId: string, value: any) => {
    try {
      await answerQuestion(questionId, value)
      // Mark question as answered
      const question = currentQuestions.value.find(
        (q: any) => q.id === questionId,
      )
      if (question) {
        question.completed = true
        question.answer = value
      }
    } catch (error) {
      console.error('Error saving answer:', error)
      throw error
    }
  }

  const moveToNextQuestion = () => {
    if (currentQuestionIndex.value < currentQuestions.value.length - 1) {
      currentQuestionIndex.value++
      return true
    }
    return false
  }

  const completeTask = async (taskId: string) => {
    try {
      await apiCompleteTask(taskId)
      if (currentTask.value) {
        currentTask.value.completed = true
      }
    } catch (error) {
      console.error('Error completing task:', error)
      throw error
    }
  }

  const getCurrentQuestion = computed(() => {
    return currentQuestions.value[currentQuestionIndex.value]
  })

  return {
    steps,
    loading,
    currentStep,
    currentTask,
    currentQuestions,
    currentQuestionIndex,
    getCurrentQuestion,
    loadPassport,
    setCurrentStep,
    setCurrentTask,
    loadQuestions,
    saveAnswer,
    moveToNextQuestion,
    completeTask,
  }
}
