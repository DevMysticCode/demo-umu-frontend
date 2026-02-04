import { ref, computed } from 'vue'
import { usePassportApi } from './usePassportApi'

// ---------- GLOBAL SINGLETON STATE ----------
const steps = ref([])
const loading = ref(false)

const currentStep = ref(null)
const currentTask = ref(null)

const currentQuestions = ref([])
const currentQuestionIndex = ref(0)

// ---------- LAZY API ACCESSOR ----------
let _api: ReturnType<typeof usePassportApi> | null = null

const getApi = () => {
  if (!_api) {
    _api = usePassportApi()
  }
  return _api
}

// ---------- METHODS ----------

const loadPassport = async (passportId) => {
  loading.value = true
  try {
    const raw = await getApi().getSections(passportId)
    steps.value = raw.map((section) => {
      const tasks = section.tasks.map((task) => ({
        ...task,
        completed: task.totalQuestions > 0 && task.answeredQuestions === task.totalQuestions,
      }))
      const completedTasks = tasks.filter((t) => t.completed).length
      const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
      return {
        ...section,
        icon: section.imageKey || section.key,
        progress,
        tasks,
      }
    })
  } finally {
    loading.value = false
  }
}

const setCurrentStep = (stepId) => {
  currentStep.value = steps.value.find(s => s.id === stepId) || null
}

const setCurrentTask = (taskId) => {
  if (!currentStep.value) return
  currentTask.value =
    currentStep.value.tasks.find(t => t.id === taskId) || null
}

const loadQuestions = async (taskId) => {
  const result = await getApi().getQuestions(taskId)
  currentQuestions.value = result.map((q) => ({
    ...q,
    type: q.type?.toLowerCase(),
  }))
  const firstUnanswered = currentQuestions.value.findIndex((q) => !q.completed)
  currentQuestionIndex.value = firstUnanswered >= 0 ? firstUnanswered : 0
}

const saveAnswer = async (questionId, value) => {
  await getApi().answerQuestion(questionId, value)

  const q = currentQuestions.value.find(q => q.id === questionId)
  if (q) {
    q.completed = true
    q.answer = value
  }
}

const moveToNextQuestion = () => {
  if (currentQuestionIndex.value < currentQuestions.value.length - 1) {
    currentQuestionIndex.value++
    return true
  }
  return false
}

const completeTask = async (taskId) => {
  await getApi().completeTask(taskId)
  if (currentTask.value) {
    currentTask.value.completed = true
  }
}

const currentQuestion = computed(() => {
  return currentQuestions.value[currentQuestionIndex.value] || null
})

// ---------- SINGLE EXPORT ----------
export const usePassportRuntime = () => {
  return {
    steps,
    loading,

    currentStep,
    currentTask,
    currentQuestions,
    currentQuestionIndex,
    currentQuestion,

    loadPassport,
    setCurrentStep,
    setCurrentTask,
    loadQuestions,
    saveAnswer,
    moveToNextQuestion,
    completeTask,
  }
}
