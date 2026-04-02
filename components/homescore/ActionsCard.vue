<template>
  <div v-if="actions.length" class="hs-actions-card">
    <h3 class="hs-card-title">Top Actions to Improve Your Score</h3>
    <div class="hs-actions">
      <div v-for="(action, i) in actions" :key="i" class="hs-action-row">
        <div class="hs-action-num">{{ i + 1 }}</div>
        <p class="hs-action-text">{{ action.text }}</p>
        <div class="hs-action-points">+{{ action.points }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Action } from '~/types/homescore'
defineProps<{ actions: Action[] }>()
</script>

<style scoped>
.hs-actions-card {
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
.hs-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.hs-action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f7f7f9;
  border-radius: 14px;
}
.hs-action-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #00a19a;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hs-action-text {
  flex: 1;
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}
.hs-action-points {
  font-size: 13px;
  font-weight: 700;
  color: #00a19a;
  background: #e8f8f7;
  border-radius: 20px;
  padding: 3px 10px;
  white-space: nowrap;
}
</style>
