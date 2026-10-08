<template>
  <div class="vp" :class="{ 'vp--compact': compact }">
    <button
      v-for="opt in OPTIONS"
      :key="opt.value"
      type="button"
      class="vp-opt"
      :class="[`vp-opt--${opt.value.toLowerCase()}`, { selected: modelValue === opt.value }]"
      :disabled="disabled"
      @click="$emit('update:modelValue', opt.value)"
    >
      <span class="vp-opt-ic" aria-hidden="true">{{ opt.icon }}</span>
      <span class="vp-opt-body">
        <span class="vp-opt-t">{{ opt.label }}</span>
        <span v-if="!compact" class="vp-opt-s">{{ opt.desc }}</span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { VisibilityLevel } from '~/composables/useManageVisibility'

defineProps<{
  modelValue: VisibilityLevel
  disabled?: boolean
  compact?: boolean
}>()
defineEmits<{ (e: 'update:modelValue', value: VisibilityLevel): void }>()

const OPTIONS: Array<{ value: VisibilityLevel; label: string; desc: string; icon: string }> = [
  {
    value: 'PRIVATE',
    label: 'Private',
    desc: 'Only you and your authorised collaborators can see this.',
    icon: '🔒',
  },
  {
    value: 'SHARED',
    label: 'Shared',
    desc: 'Visible only to people you have specifically shared with.',
    icon: '👥',
  },
  {
    value: 'PUBLIC',
    label: 'Public',
    desc: 'Visible to anyone with access to the public property passport.',
    icon: '🌐',
  },
]
</script>

<style scoped>
.vp { display: flex; flex-direction: column; gap: 0.5rem; }
.vp--compact { flex-direction: row; gap: 0.25rem; }

.vp-opt {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.875rem;
  background: #fff;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}
.vp-opt:disabled { opacity: 0.6; cursor: not-allowed; }
.vp-opt.selected { border-color: #00a19a; background: #f2faf8; }

.vp-opt-ic { font-size: 1rem; flex-shrink: 0; line-height: 1.3; }
.vp-opt-body { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
.vp-opt-t { font-size: 0.8438rem; font-weight: 700; color: #231d45; }
.vp-opt-s { font-size: 0.75rem; color: #6b7089; line-height: 1.4; }

.vp--compact .vp-opt {
  padding: 0.4375rem 0.5625rem;
  border-radius: 0.625rem;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}
.vp--compact .vp-opt-s { display: none; }
.vp--compact .vp-opt-t { font-size: 0.625rem; font-weight: 800; }
.vp--compact .vp-opt-ic { font-size: 0.8125rem; }
</style>
