<template>
  <span class="vb" :class="`vb--${level.toLowerCase()}`">{{ LABEL[level] }}</span>
</template>

<script setup lang="ts">
import type { VisibilityLevel } from '~/composables/useManageVisibility'

defineProps<{ level: VisibilityLevel }>()

const LABEL: Record<VisibilityLevel, string> = {
  PRIVATE: 'Private',
  SHARED: 'Shared',
  PUBLIC: 'Public',
}
</script>

<style scoped>
.vb {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.7188rem;
  font-weight: 800;
}
.vb--private { background: #f1f1f4; color: #6b7089; }
.vb--shared { background: #e5f4f2; color: #008a84; }
.vb--public { background: #e8f1fd; color: #2563eb; }
</style>
