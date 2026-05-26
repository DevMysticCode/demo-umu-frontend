<template>
  <!-- Atomic shimmer placeholder. Use whenever you need a single block of
       loading state — composed cards live in <SkeletonCard /> instead.

         <Skeleton />                        ← default card (180×100%)
         <Skeleton variant="line" />         ← 12-px text-row stand-in
         <Skeleton variant="circle" :size="40" />  ← avatar placeholder
         <Skeleton variant="block" :height="220" /> ← arbitrary block
   -->
  <div
    class="umu-skel"
    :class="[`umu-skel--${variant}`]"
    :style="style"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** card = rounded 18px, line = 12px text-row, circle, block = 12px */
    variant?: 'card' | 'line' | 'circle' | 'block'
    /** Pixel size for circle (width === height) */
    size?: number | string
    width?: number | string
    height?: number | string
    /** Override border-radius (only useful for `block`) */
    radius?: number | string
  }>(),
  { variant: 'card' },
)

function px(v: number | string | undefined): string | undefined {
  if (v == null) return undefined
  return typeof v === 'number' ? `${v}px` : v
}

const style = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}
  if (props.variant === 'circle' && props.size != null) {
    const s = px(props.size)!
    out.width = s
    out.height = s
  } else {
    if (props.width != null) out.width = px(props.width)!
    if (props.height != null) out.height = px(props.height)!
  }
  if (props.radius != null) out.borderRadius = px(props.radius)!
  return out
})
</script>

<style scoped>
.umu-skel {
  background: linear-gradient(90deg, #f0f0f8 25%, #e8e8f0 50%, #f0f0f8 75%);
  background-size: 200% 100%;
  animation: umu-skel-shimmer 1.4s infinite;
  display: block;
}
.umu-skel--card {
  height: 180px;
  border-radius: 18px;
}
.umu-skel--line {
  height: 12px;
  border-radius: 6px;
  width: 100%;
}
.umu-skel--circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.umu-skel--block {
  border-radius: 12px;
}
@keyframes umu-skel-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .umu-skel {
    animation: none;
    background: #f0f0f8;
  }
}
</style>
