<template>
  <div v-if="flags.length" class="hs-flags-card">
    <h3 class="hs-card-title">Risk Flags</h3>
    <div class="hs-flags">
      <div v-for="(flag, i) in flags" :key="i" class="hs-flag-row">
        <div class="hs-flag-icon" :class="`hs-flag-icon--${flag.severity}`">
          <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="hs-flag-body">
          <p class="hs-flag-title">{{ flag.title }}</p>
          <p class="hs-flag-detail">{{ flag.detail }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RiskFlag } from '~/types/homescore'
defineProps<{ flags: RiskFlag[] }>()
</script>

<style scoped>
.hs-flags-card {
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
.hs-flags {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hs-flag-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.hs-flag-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hs-flag-icon--high { background: #fef2f2; color: #ef4444; }
.hs-flag-icon--medium { background: #fffbeb; color: #f59e0b; }
.hs-flag-icon--low { background: #f0fdf4; color: #22c55e; }
.hs-flag-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 2px;
}
.hs-flag-detail {
  font-size: 12px;
  color: #636366;
  line-height: 1.45;
}
</style>
