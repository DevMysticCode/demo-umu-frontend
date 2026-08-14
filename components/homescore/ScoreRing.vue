<template>
  <div class="hs-ring-wrap">
    <svg viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="hsRingGrad" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stop-color="#00BB93" />
          <stop offset="100%" stop-color="#016F84" />
        </linearGradient>
      </defs>
      <!-- Track — full circle, top-start (12 o'clock), clockwise, matching
           every other HomeScore ring in the app (this one previously used
           a 270°-arc "speedometer" style, the one outlier). -->
      <circle cx="100" cy="100" r="80" fill="none" stroke="#EDEDF3" stroke-width="18" transform="rotate(-90 100 100)" />
      <!-- Progress -->
      <circle
        cx="100" cy="100" r="80" fill="none"
        stroke="url(#hsRingGrad)"
        stroke-width="18"
        stroke-dasharray="502.65"
        :stroke-dashoffset="502.65 - (displayScore / 100) * 502.65"
        stroke-linecap="round"
        transform="rotate(-90 100 100)"
        style="transition: stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
      />
      <!-- Score -->
      <text x="100" y="90" text-anchor="middle" :font-size="score >= 100 ? 38 : 46" font-weight="800" fill="#0a0f2c" font-family="sans-serif">
        {{ displayScore }}
      </text>
      <text x="100" y="115" text-anchor="middle" font-size="15" fill="#8e8e93" font-family="sans-serif" font-weight="500">
        {{ rating }}
      </text>
    </svg>
    <p class="hs-ring-label">out of 100</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  score: number
  rating: string
  ratingColor: string
}>()

const displayScore = ref(0)

onMounted(() => {
  setTimeout(() => {
    const target = props.score
    const duration = 1200
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      displayScore.value = Math.round(eased * target)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, 100)
})
</script>

<style scoped>
.hs-ring-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hs-ring-label {
  font-size: 12px;
  color: #aeaeb2;
  margin-top: -8px;
}
</style>
