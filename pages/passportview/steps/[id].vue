<template>
  <div class="mobile-container step-page bg-umu-gradient">
    <!-- <div class="step-header">
      <button class="back-btn" @click="goBack">
        <span class="back-arrow">←</span> Back
      </button>
      <button class="menu-btn">⋯</button>
    </div> -->

    <AppHeader :showBack="true" :backTo="backToPassportUrl" right="dots" />

    <div class="step-content">
      <HeroSection
        :iconName="currentStep?.icon"
        iconClass="w-[176px] h-[176px]"
        heroClass="w-[176px] h-[176x]"
        :mainTitle="currentStep?.title"
        :subTitle="currentStep?.subtitle"
      />

      <div class="progress-section">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: stepProgress + '%' }"
          ></div>
        </div>
        <div class="progress-info">
          <span class="progress-label">OVERALL PROGRESS</span>
          <span class="progress-value">{{ stepProgress }}%</span>
        </div>
      </div>

      <div class="action-buttons">
        <button class="help-btn">
          <!-- <span class="btn-icon">?</span> -->
          Help
        </button>
        <button class="video-btn">
          <span class="play-icon"
            ><OPIcon name="playIcon" class="w-[15px] h-[15px]"
          /></span>
          Play Video
        </button>
      </div>

      <PointsSection
        :points="totalStepPoints"
        :label="nextStepLabel"
        :description="`A total of ${totalStepPoints}points are available in this section.`"
        :show-rewards-link="true"
        :show-next-task="hasNextTask"
        @nextTask="goToNextTask"
      />

      <UnderReview
        title="Your Expert Guidance"
        :description="`You have 3 questions under review by an expert.`"
        :minimum-time="'3 Days'"
        @viewProfile="handleViewProfile"
      />

      <div class="tasks-section">
        <div class="section-header">
          <h2 class="section-title">Your Tasks</h2>
          <button class="sort-btn">Sort</button>
        </div>

        <div class="tasks-list">
          <div
            v-for="task in currentStep?.tasks"
            :key="task.id"
            class="task-card"
            :class="{ completed: task.completed }"
            @click="navigateToTask(task.id)"
          >
            <div class="task-status">
              <div
                class="status-circle"
                :class="getTaskStatus(task)"
                :style="getTaskProgressStyle(task)"
              >
                <span v-if="task.completed" class="check-icon">✓</span>
                <span
                  v-else-if="getTaskStatus(task) === 'in-progress'"
                  class="progress-percentage"
                >
                  {{ getTaskProgress(task) }}%
                </span>
              </div>
            </div>

            <!-- <div class="task-icon">
              <span>{{ getTaskIcon(task) }}</span>
            </div> -->

            <div class="task-info">
              <div class="task-points">
                <span class="points-icon"
                  ><OPIcon name="giftIcon" class="w-[11px] h-[11px]"
                /></span>
                +0pts
              </div>
              <h3 class="task-title">{{ task.title }}</h3>
              <p class="task-description">{{ task.description }}</p>
              <div v-if="task.completed" class="task-completed-info">
                Completed • {{ getCompletedDate() }}
              </div>
            </div>

            <button class="task-arrow">
              <OPIcon name="caretRight" class="w-[13px] h-[13px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePassportRuntime } from '~/composables/usePassportRuntime'
import PointsSection from '@/components/passport-view/PointsSection.vue'
import UnderReview from '~/components/passport-view/UnderReview.vue'
import AppHeader from '@/components/core/AppHeader.vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import HeroSection from '@/components/HeroSection.vue'

const route = useRoute()
const router = useRouter()

const { currentStep, steps, setCurrentStep, loadPassport } =
  usePassportRuntime()

const stepId = route.params.id

const backToPassportUrl = computed(() => {
  return `/passportview/${route.query.propertyId}`
})

// onMounted(() => {
//   setCurrentStep(stepId)
// })

onMounted(async () => {
  if (steps.value.length === 0 && route.query.propertyId) {
    await loadPassport(route.query.propertyId)
  }
})

watchEffect(() => {
  if (route.params.id && steps.value.length > 0) {
    setCurrentStep(route.params.id)
  }
})

const stepProgress = computed(() => {
  if (!currentStep.value) return 0
  const completedTasks = currentStep.value.tasks.filter(
    (t) => t.completed,
  ).length
  const totalTasks = currentStep.value.tasks.length
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
})

// const totalStepPoints = computed(() => {
//   return currentStep.value
//     ? currentStep.value.tasks.reduce((sum, task) => sum + task.pointsReward, 0)
//     : 0
// })

const totalStepPoints = computed(() => 0)

const orderedSteps = computed(() => {
  const list = [...steps.value]
  const hasOrder = list.some((step) => typeof step.order === 'number')
  if (hasOrder) {
    return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }
  return list
})

const nextStepLabel = computed(() => {
  if (!currentStep.value) return 'Next: '
  const currentIndex = orderedSteps.value.findIndex(
    (step) => step.id === currentStep.value.id,
  )
  const nextStep =
    currentIndex >= 0 ? orderedSteps.value[currentIndex + 1] : null
  return nextStep?.title ? `Next: ${nextStep.title}` : 'Next: '
})

const hasNextTask = computed(() => {
  if (!currentStep.value) return false
  const incompleteTasks = currentStep.value.tasks.filter((t) => !t.completed)
  return incompleteTasks.length > 0
})

const getTaskIcon = (task) => {
  return task.icon || '📋'
}

const getTaskStatus = (task) => {
  if (task.completed) return 'completed'
  if (task.answeredQuestions > 0) return 'in-progress'
  return 'pending'
}

const getTaskProgressStyle = (task) => {
  if (
    !task.completed &&
    task.answeredQuestions > 0 &&
    task.totalQuestions > 0
  ) {
    const progress = Math.round(
      (task.answeredQuestions / task.totalQuestions) * 100,
    )
    return { '--progress': `${progress}` }
  }
  return {}
}

const getTaskProgress = (task) => {
  if (task.totalQuestions > 0) {
    return Math.round((task.answeredQuestions / task.totalQuestions) * 100)
  }
  return 0
}

const getCompletedDate = () => {
  return '10 February 2025'
}

const navigateToTask = (taskId) => {
  router.push(
    `/passportview/steps/tasks/${taskId}?stepId=${stepId}&propertyId=${route.query.propertyId}`,
  )
}

const goToNextTask = () => {
  if (currentStep.value) {
    const nextTask = currentStep.value.tasks.find((t) => !t.completed)
    if (nextTask) {
      navigateToTask(nextTask.id)
    }
  }
}

const handleViewProfile = () => {
  // Handle view profile action
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.step-page {
  min-height: 100vh;
  padding-bottom: 40px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: transparent;
}

.back-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #00b8a9;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 8px;
  cursor: pointer;
}

.back-arrow {
  font-size: 20px;
}

.menu-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #5a54d6;
  border: none;
  font-size: 20px;
  color: white;
  cursor: pointer;
}

.step-content {
  padding: 0 20px;
}

.step-illustration {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.step-icon-large {
  font-size: 100px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.step-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px;
  color: #1a1a1a;
}

.step-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 24px;
}

.progress-section {
  margin-bottom: 24px;
}

.progress-bar {
  height: 16px;
  background: #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00b8a9 0%, #00d4c3 100%);
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 11px;
  color: #3c3c4399;
  font-weight: 400;
  letter-spacing: 0.06px;
  line-height: 13px;
}

.progress-value {
  font-size: 11px;
  color: #00a19a;
  font-weight: 590;
}

.action-buttons {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  justify-content: end;
}

.help-btn,
.video-btn {
  flex: 1;
  padding: 8px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  color: #00b8a9;
  max-width: fit-content;
}

.video-btn {
  background: #00b8a9;
  color: white;
  border-color: #00b8a9;
}

.help-btn {
  padding-left: 20px;
  padding-right: 20px;
}

.play-icon {
  font-size: 12px;
}

.tasks-section {
  margin-top: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 590;
  margin: 0;
  color: #000000;
}

.sort-btn {
  background: white;
  border: 0.33px solid #3c3c432e;
  border-radius: 40px;
  color: #00a19a;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  padding: 4px 8px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 0.33px solid #3c3c432e;
}

.task-card:active {
  transform: scale(0.98);
}

.task-card.completed {
  opacity: 0.7;
}

.task-status {
  flex-shrink: 0;
}

.status-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 6px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  position: relative;
}

.status-circle.completed {
  background: #00b8a9;
  border-color: #00b8a9;
}

.status-circle.in-progress {
  border: none;
  background: conic-gradient(
    #00b8a9 0% calc(var(--progress, 50) * 1%),
    #e0e0e0 calc(var(--progress, 50) * 1%) 100%
  );
}

.status-circle.in-progress::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: white;
}

.status-circle.pending {
  border-color: #e0e0e0;
}

.check-icon {
  color: white;
  font-size: 16px;
  font-weight: 700;
}

.progress-percentage {
  color: #00a19a;
  font-size: 9px;
  font-weight: 400;
  position: relative;
  z-index: 1;
}

.task-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0fffe 0%, #e6f9f7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 15px;
  font-weight: 400;
  margin: 0 0 4px;
  color: #000000;
  line-height: 20px;
  letter-spacing: -0.23px;
}

.task-description {
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  color: #3c3c4399;
  margin: 0 0 6px;
}

.task-completed-info {
  font-size: 12px;
  color: #00b8a9;
  font-weight: 600;
}

.task-points {
  background: #00a19a1a;
  font-size: 11px;
  line-height: 13px;
  color: #00a19a;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  width: fit-content;
  border-radius: 4px;
}

.points-icon {
  font-size: 14px;
}

.task-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f9f9fd;
  border: 0.5px solid #d2d1e4;
  font-size: 24px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
