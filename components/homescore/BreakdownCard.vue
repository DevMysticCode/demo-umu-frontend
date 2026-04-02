<template>
  <div class="hs-breakdown-card">
    <h3 class="hs-card-title">Score Breakdown</h3>
    <div class="hs-pillars">
      <div v-for="p in pillars" :key="p.id" class="hs-pillar-row">
        <div class="hs-pillar-header">
          <span class="hs-pillar-dot" :style="{ background: p.color }"></span>
          <span class="hs-pillar-name">{{ p.label }}</span>
          <span class="hs-pillar-score">{{ breakdown[p.id] }}<span class="hs-pillar-max"> / {{ p.max }}</span></span>
        </div>
        <div class="hs-pillar-track">
          <div
            class="hs-pillar-bar"
            :style="{ width: `${(breakdown[p.id] / p.max) * 100}%`, background: p.color, transition: 'width 1s ease' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PillarBreakdown } from '~/types/homescore'

defineProps<{ breakdown: PillarBreakdown }>()

const pillars = [
  { id: 'heating' as const, label: 'Heating', max: 20, color: '#ef4444' },
  { id: 'structure' as const, label: 'Structure', max: 25, color: '#f59e0b' },
  { id: 'efficiency' as const, label: 'Efficiency', max: 20, color: '#22c55e' },
  { id: 'electrics' as const, label: 'Electrics', max: 20, color: '#3b82f6' },
  { id: 'plumbing' as const, label: 'Plumbing', max: 15, color: '#8b5cf6' },
]
</script>

<style scoped>
.hs-breakdown-card {
  background: #fff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.hs-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}
.hs-pillars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hs-pillar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.hs-pillar-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.hs-pillar-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}
.hs-pillar-score {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
}
.hs-pillar-max {
  font-weight: 400;
  color: #aeaeb2;
}
.hs-pillar-track {
  height: 8px;
  background: #f2f2f7;
  border-radius: 100px;
  overflow: hidden;
}
.hs-pillar-bar {
  height: 100%;
  border-radius: 100px;
  min-width: 4px;
}
</style>
