import { ref, computed } from 'vue'
import { usePassportApi } from './usePassportApi'

/* =====================================================
   SHARED SINGLETON STATE
===================================================== */

const steps = ref<any[]>([])
const loading = ref(false)
const currentStep = ref<any>(null)
const currentTask = ref<any>(null)
const currentQuestions = ref<any[]>([])
const currentQuestionIndex = ref(0)

/* =====================================================
   COMPOSABLE
===================================================== */

export const usePassportRuntime = () => {
  const {
    getSections,
    getQuestions,
    answerQuestion,
    completeTask: apiCompleteTask,
  } = usePassportApi()

  /* --------------------------------
     LOAD PASSPORT SECTIONS
  -------------------------------- */
  const loadPassport = async (passportId: string) => {
    loading.value = true
    try {
      steps.value = (await getSections(passportId)) as any[]
    } finally {
      loading.value = false
    }
  }

  /* --------------------------------
     SET CURRENT STEP
  -------------------------------- */
  const setCurrentStep = (stepId: string) => {
    currentStep.value = steps.value.find((s: any) => s.id === stepId) || null
  }

  /* --------------------------------
     SET CURRENT TASK
  -------------------------------- */
  const setCurrentTask = (taskId: string) => {
    if (!currentStep.value) return
    currentTask.value =
      currentStep.value.tasks.find((t: any) => t.id === taskId) || null
  }

  /* --------------------------------
     LOAD QUESTIONS FOR TASK
  -------------------------------- */
  const loadQuestions = async (taskId: string) => {
    try {
      const result = (await getQuestions(taskId)) as any[]
      currentQuestions.value = result
      currentQuestionIndex.value = 0
    } catch (error) {
      console.error('Error loading questions:', error)
      throw error
    }
  }

  /* --------------------------------
     SAVE ANSWER
  -------------------------------- */
  const saveAnswer = async (questionId: string, value: any) => {
    try {
      await answerQuestion(questionId, value)
      const q = currentQuestions.value.find((q: any) => q.id === questionId)
      if (q) {
        q.completed = true
        q.answer = value
      }
    } catch (error) {
      console.error('Error saving answer:', error)
      throw error
    }
  }

  /* --------------------------------
     MOVE TO NEXT QUESTION
  -------------------------------- */
  const moveToNextQuestion = () => {
    if (currentQuestionIndex.value < currentQuestions.value.length - 1) {
      currentQuestionIndex.value++
      return true
    }
    return false
  }

  /* --------------------------------
     COMPLETE TASK
  -------------------------------- */
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

  /* --------------------------------
     CURRENT QUESTION COMPUTED
  -------------------------------- */
  const currentQuestion = computed(() => {
    return currentQuestions.value[currentQuestionIndex.value] || null
  })

  return {
    // state refs
    steps,
    loading,
    currentStep,
    currentTask,
    currentQuestions,
    currentQuestionIndex,

    // computed
    currentQuestion,

    // methods
    loadPassport,
    setCurrentStep,
    setCurrentTask,
    loadQuestions,
    saveAnswer,
    moveToNextQuestion,
    completeTask,
  }
}
