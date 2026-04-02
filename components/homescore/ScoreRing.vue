<template>
  <div class="hs-ring-wrap">
    <svg viewBox="0 0 200 200" width="200" height="200">
      <!-- Track -->
      <circle cx="100" cy="100" r="80" fill="none" stroke="#e8e8ee" stroke-width="18" stroke-dasharray="376.99" stroke-dashoffset="94.25" stroke-linecap="round" transform="rotate(135 100 100)" />
      <!-- Progress -->
      <circle
        cx="100" cy="100" r="80" fill="none"
        :stroke="ratingColor"
        stroke-width="18"
        :stroke-dasharray="`${progressArc} 376.99`"
        stroke-linecap="round"
        stroke-dashoffset="0"
        transform="rotate(135 100 100)"
        style="transition: stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
      />
      <!-- Score -->
      <text x="100" y="90" text-anchor="middle" :font-size="score >= 100 ? 38 : 46" font-weight="800" :fill="ratingColor" font-family="sans-serif">
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
const progressArc = computed(() => {
  const maxArc = 376.99 * 0.75 // 270 degrees
  return (displayScore.value / 100) * maxArc
})

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
