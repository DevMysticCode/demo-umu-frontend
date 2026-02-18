import { ref, computed } from 'vue'
import { usePassportApi } from './usePassportApi'

// ---------- GLOBAL SINGLETON STATE ----------
const steps = ref([])
const loading = ref(false)

const currentStep = ref(null)
const currentTask = ref(null)

const currentQuestions = ref([])
const currentQuestionIndex = ref(0)

// For section-wide question flow (all tasks' questions in one sequence)
const allSectionQuestions = ref([]) // Flattened array with task context
const questionTaskMap = ref({}) // Maps question ID to task info for auto-advance

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
        completed:
          task.totalQuestions > 0 &&
          task.answeredQuestions === task.totalQuestions,
      }))
      const completedTasks = tasks.filter((t) => t.completed).length
      const progress =
        tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
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
  currentStep.value = steps.value.find((s) => s.id === stepId) || null
}

const setCurrentTask = (taskId) => {
  if (!currentStep.value) return
  currentTask.value =
    currentStep.value.tasks.find((t) => t.id === taskId) || null
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

const loadSectionQuestions = async (stepId, startAtTaskId = null) => {
  // Load all questions from all tasks in a section
  if (!currentStep.value) return

  const flattened = []
  const taskMap = {}
  let questionIndex = 0

  for (const task of currentStep.value.tasks) {
    const taskQuestions = await getApi().getQuestions(task.id)
    const normalizedQuestions = taskQuestions.map((q) => ({
      ...q,
      type: q.type?.toLowerCase(),
      _taskId: task.id,
      _taskTitle: task.title,
    }))

    normalizedQuestions.forEach((q) => {
      taskMap[q.id] = {
        taskId: task.id,
        taskTitle: task.title,
        questionIndex,
      }
      flattened.push(q)
      questionIndex++
    })
  }

  allSectionQuestions.value = flattened
  questionTaskMap.value = taskMap
  currentQuestions.value = flattened

  // If startAtTaskId is provided, start at the first question of that task
  if (startAtTaskId) {
    const taskQuestionIndex = flattened.findIndex(
      (q) => q._taskId === startAtTaskId,
    )
    if (taskQuestionIndex >= 0) {
      // Find first unanswered in this task, or start at task's first question
      const taskQuestions = flattened.filter((q) => q._taskId === startAtTaskId)
      const firstUnansweredInTask = taskQuestions.findIndex((q) => !q.completed)
      if (firstUnansweredInTask >= 0) {
        currentQuestionIndex.value = flattened.indexOf(
          taskQuestions[firstUnansweredInTask],
        )
      } else {
        currentQuestionIndex.value = taskQuestionIndex
      }
    } else {
      // Fallback: first unanswered in entire section
      const firstUnanswered = flattened.findIndex((q) => !q.completed)
      currentQuestionIndex.value = firstUnanswered >= 0 ? firstUnanswered : 0
    }
  } else {
    // Start at first unanswered question in entire section
    const firstUnanswered = flattened.findIndex((q) => !q.completed)
    currentQuestionIndex.value = firstUnanswered >= 0 ? firstUnanswered : 0
  }

  // Set currentTask to the task of the current question
  if (flattened.length > 0 && currentQuestionIndex.value < flattened.length) {
    const currentQ = flattened[currentQuestionIndex.value]
    currentTask.value =
      currentStep.value.tasks.find((t) => t.id === currentQ._taskId) || null
  }
}

const saveAnswer = async (questionId, value) => {
  await getApi().answerQuestion(questionId, value)

  const q = currentQuestions.value.find((q) => q.id === questionId)
  if (q) {
    q.completed = true
    q.answer = value
  }
}

const moveToNextQuestion = () => {
  if (currentQuestionIndex.value < currentQuestions.value.length - 1) {
    currentQuestionIndex.value++

    // Auto-update currentTask if we moved to a different task
    const nextQuestion = currentQuestions.value[currentQuestionIndex.value]
    if (nextQuestion && nextQuestion._taskId && currentStep.value) {
      const newTask = currentStep.value.tasks.find(
        (t) => t.id === nextQuestion._taskId,
      )
      if (newTask) {
        currentTask.value = newTask
      }
    }

    return true
  }
  return false
}

const moveToPreviousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--

    // Auto-update currentTask if we moved to a different task
    const prevQuestion = currentQuestions.value[currentQuestionIndex.value]
    if (prevQuestion && prevQuestion._taskId && currentStep.value) {
      const newTask = currentStep.value.tasks.find(
        (t) => t.id === prevQuestion._taskId,
      )
      if (newTask) {
        currentTask.value = newTask
      }
    }

    return true
  }
  return false
}

const completeTask = async (taskId) => {
  const result = await getApi().completeTask(taskId)
  if (currentTask.value) {
    currentTask.value.completed = true
  }
  return result
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
    allSectionQuestions,
    questionTaskMap,

    loadPassport,
    setCurrentStep,
    setCurrentTask,
    loadQuestions,
    loadSectionQuestions,
    saveAnswer,
    moveToNextQuestion,
    moveToPreviousQuestion,
    completeTask,
  }
}
