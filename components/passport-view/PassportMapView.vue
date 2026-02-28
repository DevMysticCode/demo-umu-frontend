<template>
  <div class="map-view">
    <div class="map-content">
      <div class="map-placeholder">
        <div class="isometric-map">
          <div
            v-for="(decoration, index) in decorativeObjects"
            :key="`decoration-${index}`"
            class="map-decoration"
            :style="getDecorationPosition(index)"
          >
            <OPIcon :name="decoration.icon" class="decoration-icon" />
          </div>

          <div class="moving-lady" :style="ladyPosition">
            <OPIcon name="walkingLady" class="lady-icon" />
          </div>

          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="map-step"
            :style="getStepPosition(index)"
          >
            <!-- Road connector above the step -->
            <div
              v-if="index > 0"
              class="road-connector"
              :class="getRoadClass(index)"
            >
              <OPIcon :name="getRoadIcon(index)" class="road-icon" />
            </div>

            <!-- Step platform with status-based visuals -->
            <div
              class="step-platform"
              :class="getStepStatusClass(step)"
              @click="navigateToStep(step.id)"
            >
              <OPIcon name="mapBackgroundTile" class="map-shadow-tile" />
              <OPIcon name="mapBackgroundTile" class="map-background-tile" />
              <div class="step-illustration">
                <OPIcon :name="step.icon || step.key" class="step-icon-art" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePassportRuntime } from '~/composables/usePassportRuntime'
import OPIcon from '~/components/ui/OPIcon.vue'
import { useRoute, useRouter } from 'vue-router'

const { steps } = usePassportRuntime()
const route = useRoute()
const router = useRouter()

const mapLayout = {
  rightOffsetX: 185,
  leftOffsetX: 0,
  stepGapY: 105,
}

const decorativeObjects = [
  { icon: 'tree' },
  { icon: 'lampPost' },
  { icon: 'dog' },
  { icon: 'post' },
  { icon: 'tree' },
  { icon: 'orangeDog' },
  { icon: 'postInverted' },
  { icon: 'lampPost' },
  { icon: 'tree' },
  { icon: 'dog' },
]

const decorationAnchors = [
  { x: 18, y: 96 },
  { x: 252, y: 202 },
  { x: 26, y: 324 },
  { x: 252, y: 426 },
  { x: 16, y: 548 },
  { x: 252, y: 650 },
  { x: 24, y: 772 },
  { x: 252, y: 874 },
  { x: 18, y: 996 },
  { x: 252, y: 1098 },
]

const getStepPosition = (index) => {
  const row = index
  const isRight = index % 2 === 0
  const offsetX = isRight ? mapLayout.rightOffsetX : mapLayout.leftOffsetX
  const offsetY = row * mapLayout.stepGapY

  return {
    left: `${offsetX}px`,
    top: `${offsetY}px`,
  }
}

const getStepStatusClass = (step) => {
  const completion = getSectionCompletion(step)

  if (completion >= 100) {
    return 'status-completed'
  }

  if (completion > 0) {
    return 'status-active'
  }

  return 'status-pending'
}

const getSectionCompletion = (step) => {
  if (!step?.tasks?.length) {
    return Number(step?.progress) || 0
  }

  const stats = step.tasks.reduce(
    (acc, task) => {
      const totalQuestions = Number(task?.totalQuestions) || 0
      const answeredQuestions = Number(task?.answeredQuestions) || 0

      acc.totalQuestions += totalQuestions
      acc.answeredQuestions += Math.min(answeredQuestions, totalQuestions)

      if (task?.completed) {
        acc.completedTasks += 1
      }

      return acc
    },
    { totalQuestions: 0, answeredQuestions: 0, completedTasks: 0 },
  )

  if (stats.totalQuestions > 0) {
    return Math.round((stats.answeredQuestions / stats.totalQuestions) * 100)
  }

  return Math.round((stats.completedTasks / step.tasks.length) * 100)
}

const getRoadIcon = (index) => {
  // Roads should connect from previous step to current step
  // If current step is on right (even index), road should go left-to-right
  // If current step is on left (odd index), road should go right-to-left
  const isCurrentRight = index % 2 === 0
  const isPrevRight = (index - 1) % 2 === 0

  // Determine direction based on positions
  if (isPrevRight && !isCurrentRight) {
    // From right to left
    return 'roadRightToLeft'
  } else if (!isPrevRight && isCurrentRight) {
    // From left to right
    return 'roadLeftToRight'
  }
  // Default fallback
  return 'roadLeftToRight'
}

const getRoadClass = (index) => {
  const isCurrentRight = index % 2 === 0
  const isPrevRight = (index - 1) % 2 === 0

  if (isPrevRight && !isCurrentRight) {
    return 'road-right-to-left'
  } else if (!isPrevRight && isCurrentRight) {
    return 'road-left-to-right'
  }
  return 'road-left-to-right'
}

const getDecorationPosition = (index) => {
  const anchor = decorationAnchors[index % decorationAnchors.length]
  const cycle = Math.floor(index / decorationAnchors.length)
  const verticalShift = cycle * 1200

  return {
    left: `${anchor.x}px`,
    top: `${anchor.y + verticalShift}px`,
  }
}

const getStepCompletion = (step) => getSectionCompletion(step)

const ladyStepIndex = computed(() => {
  if (!steps.value.length) {
    return 0
  }

  const firstIncomplete = steps.value.findIndex(
    (step) => getStepCompletion(step) < 100,
  )

  return firstIncomplete === -1 ? steps.value.length - 1 : firstIncomplete
})

const ladyPosition = computed(() => {
  if (!steps.value.length) {
    return { left: '0px', top: '0px' }
  }

  const index = Math.min(ladyStepIndex.value, steps.value.length - 1)
  const isRight = index % 2 === 0
  const stepTop = index * mapLayout.stepGapY
  const stepLeft = isRight ? mapLayout.rightOffsetX : mapLayout.leftOffsetX

  return {
    left: `${isRight ? stepLeft - 12 : stepLeft + 104}px`,
    top: `${stepTop - 26}px`,
  }
})

const navigateToStep = (stepId) => {
  const propertyId = route.params.id
  if (!propertyId) {
    return
  }

  const section = steps.value.find((item) => item.id === stepId)
  const targetTask = section?.tasks?.find((task) => !task.completed)
  const fallbackTask = section?.tasks?.[0]
  const targetTaskId = targetTask?.id || fallbackTask?.id

  if (targetTaskId) {
    router.push(
      `/passportview/steps/tasks/${targetTaskId}?stepId=${stepId}&propertyId=${propertyId}`,
    )
    return
  }

  router.push(`/passportview/steps/${stepId}?propertyId=${propertyId}`)
}
</script>

<style scoped>
.map-view {
  width: 100%;
  min-height: 400px;
}

.map-content {
  width: 100%;
}

.map-placeholder {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  border-radius: 16px;
  padding: 40px 20px;
  /* overflow-x: auto; */
  min-height: 500px;
}

.isometric-map {
  position: relative;
  width: 300px;
  min-height: 2300px;
  margin: 0 auto;
}

.map-step {
  position: absolute;
  width: 140px;
  transition: all 0.3s ease;
}

.map-decoration {
  position: absolute;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 12;
  opacity: 0.92;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.12));
  pointer-events: none;
}

.decoration-icon {
  width: 48px;
  height: 48px;
}

.moving-lady {
  position: absolute;
  width: 48px;
  height: 48px;
  z-index: 13;
  pointer-events: none;
  transition:
    left 0.35s ease,
    top 0.35s ease;
}

.lady-icon {
  width: 48px;
  height: 48px;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.2));
}

.step-platform {
  width: 140px;
  height: 140px;
  cursor: pointer;
  position: relative;
  overflow: visible;
  transition:
    transform 0.25s ease,
    filter 0.25s ease;
  z-index: 9;
}

.step-platform::before {
  display: none;
}

.step-platform:hover {
  transform: translateY(-3px) scale(1.03);
}

.map-background-tile {
  width: 200px !important;
  height: 200px !important;
  max-width: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  transition: filter 0.25s ease;
}

.map-shadow-tile {
  width: 200px !important;
  height: 200px !important;
  max-width: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  opacity: 0.95;
  filter: drop-shadow(0 8px 14px rgba(107, 114, 128, 0.28));
  transition: filter 0.25s ease;
}

.step-illustration {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  pointer-events: none;
}

.step-icon-art {
  width: 80px;
  height: 80px;
  transform: none;
  filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.15));
}

.step-platform.status-completed .map-shadow-tile {
  filter: drop-shadow(0 8px 14px rgba(0, 212, 195, 0.5))
    drop-shadow(0 0 12px rgba(59, 245, 228, 0.5));
}

.step-platform.status-completed .map-background-tile {
  filter: saturate(1.2);
}

.step-platform.status-active .map-shadow-tile {
  filter: drop-shadow(0 8px 14px rgba(37, 99, 235, 0.5))
    drop-shadow(0 0 10px rgba(59, 130, 246, 0.45));
}

.step-platform.status-active .map-background-tile {
  filter: saturate(1.05);
}

.step-platform.status-pending .map-shadow-tile {
  filter: drop-shadow(0 8px 12px rgba(107, 114, 128, 0.3));
}

.step-platform.status-pending .map-background-tile {
  filter: grayscale(0.15) brightness(0.96);
}

/* Road connector styling */
.road-connector {
  position: absolute;
  top: -19px;
  width: 150px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

.road-connector.road-left-to-right {
  left: -95px;
}

.road-connector.road-right-to-left {
  right: -94px;
}

.road-icon {
  width: 150px;
  height: 80px;
  object-fit: contain;
}
</style>
