<template>
  <div class="map-view">
    <div class="map-content">
      <div class="map-placeholder">
        <div class="isometric-map">
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

            <!-- Step platform with status-based border -->
            <div class="step-platform" :class="getStepStatusClass(step)">
              <div class="step-illustration">
                <OPIcon
                  :name="step.icon || step.key"
                  class="w-[150px] h-[200px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePassportRuntime } from '~/composables/usePassportRuntime'
import OPIcon from '~/components/ui/OPIcon.vue'

const { steps, currentStep } = usePassportRuntime()

const getStepPosition = (index) => {
  const row = index
  // Start from right: even indexes on right, odd on left
  const isRight = index % 2 === 0 // First index (0) is right
  const offsetX = isRight ? 185 : 0 // 185px for right side, 0 for left
  const offsetY = row * 126

  return {
    left: `${offsetX}px`,
    top: `${offsetY}px`,
  }
}

const getStepStatusClass = (step) => {
  // Active: current step
  if (currentStep.value && currentStep.value.id === step.id) {
    return 'status-active'
  }
  // Completed: progress is 100% or completed flag is true
  if (step.progress === 100 || step.completed) {
    return 'status-completed'
  }
  // Pending: not started (progress is 0)
  if (step.progress === 0 || !step.progress) {
    return 'status-pending'
  }
  // In progress but not current: also show as pending
  return 'status-pending'
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

.step-platform {
  width: 140px;
  height: 140px;
  perspective: 800px;
  cursor: pointer;
  position: relative;
  padding: 4px;
  border-radius: 24px;
  transform: rotateX(45deg) rotateZ(45deg);
  transition: transform 0.3s;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  z-index: 9;
  transform-style: preserve-3d;
}

.step-platform {
  background: linear-gradient(135deg, #e8e1da, #e7e1db);
}

/* Status-based border colors */
.step-platform.status-active {
  /* background: linear-gradient(135deg, #00d4c3, #00b8a9); */
  box-shadow: 0 0 20px rgba(0, 212, 195, 0.5);
}

.step-platform.status-completed {
  box-shadow: linear-gradient(135deg, #0088cc, #006bb3);
}

.step-platform.status-pending {
  box-shadow: linear-gradient(135deg, #d0d0d0, #d0d0d0);
}
.step-illustration img {
  width: 100%;
  height: 100%;
  /* background: white; */
  /* border-radius: 20px; */
  /* box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15); */
  display: flex;
  align-items: center;
  justify-content: center;
  /* transform: rotateX(-45deg) rotateZ(-45deg); */
  transform: rotate(-45deg);
  /* transform-style: preserve-3d; */
}
/* .step-illustration img {
  transform: rotate(-45deg);
} */

/* .step-platform:hover .step-illustration {
  transform: rotateX(45deg) rotateZ(45deg) scale(1.05);
} */

.step-icon {
  font-size: 48px;
  transform: rotateZ(-45deg) rotateX(-45deg);
}

/* Road connector styling */
.road-connector {
  position: absolute;
  top: -36px;
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
