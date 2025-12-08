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
            <div class="step-platform">
              <div class="step-illustration">
                <OPIcon :name="step.icon" class="w-[80px] h-[80px]" />
              </div>
            </div>
            <div v-if="index < steps.length - 1" class="step-connector"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePassportSteps } from '~/composables/usePassportSteps'
import OPIcon from '~/components/ui/OPIcon.vue'

const { steps } = usePassportSteps()

const getStepPosition = (index) => {
  const row = Math.floor(index / 2)
  const col = index % 2
  const offsetX = col === 0 ? 0 : 150
  const offsetY = row * 180

  return {
    left: `${offsetX}px`,
    top: `${offsetY}px`,
  }
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
  overflow-x: auto;
  min-height: 500px;
}

.isometric-map {
  position: relative;
  width: 300px;
  min-height: 1000px;
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
}

.step-illustration {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateX(45deg) rotateZ(45deg);
  transition: transform 0.3s;
}

.step-platform:hover .step-illustration {
  transform: rotateX(45deg) rotateZ(45deg) scale(1.05);
}

.step-icon {
  font-size: 48px;
  transform: rotateZ(-45deg) rotateX(-45deg);
}

.step-connector {
  position: absolute;
  top: 70px;
  left: 70px;
  width: 3px;
  height: 60px;
  background: linear-gradient(180deg, #00b8a9 0%, transparent 100%);
}
</style>
