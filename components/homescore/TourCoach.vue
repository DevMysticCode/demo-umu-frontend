<template>
  <Teleport to="body">
    <div v-if="tour.active.value" class="cm-overlay" @click.self="tour.end()">
      <div
        v-if="tour.currentStep.value && targetRect"
        class="cm-spotlight"
        :style="spotlightStyle"
      />

      <div
        v-if="tour.currentStep.value && injectPos"
        class="cm-inject"
        :style="injectStyle"
      >
        <div class="cm-inject-step">{{ tour.idx.value + 1 }} of {{ tour.total }}</div>
        <div class="cm-inject-title">{{ tour.currentStep.value.title }}</div>
        <div class="cm-inject-body">{{ tour.currentStep.value.body }}</div>
        <div class="cm-inject-footer">
          <div class="cm-inject-dots">
            <span
              v-for="(_, i) in tour.steps"
              :key="i"
              class="cm-inject-dot"
              :class="{ active: i === tour.idx.value }"
            />
          </div>
          <div class="cm-inject-btns">
            <button class="cm-inject-skip" @click="tour.end()">Skip</button>
            <button class="cm-inject-next" @click="tour.next()">
              {{ tour.isLast.value ? 'Got it ✓' : 'Next →' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { HomescoreTour } from '~/composables/useHomescoreTour'

const props = defineProps<{ tour: HomescoreTour }>()

interface Rect { top: number; left: number; width: number; height: number }
const targetRect = ref<Rect | null>(null)

function measure() {
  const el = props.tour.targetEl.value
  if (!el) {
    targetRect.value = null
    return
  }
  const r = el.getBoundingClientRect()
  targetRect.value = { top: r.top, left: r.left, width: r.width, height: r.height }
}

// Re-measure when the active step or visibility changes.
watch(
  () => [props.tour.active.value, props.tour.idx.value, props.tour.targetEl.value],
  () => {
    // Allow the scrollIntoView animation to settle.
    setTimeout(measure, 380)
  },
  { immediate: true },
)

if (typeof window !== 'undefined') {
  window.addEventListener('resize', measure)
  window.addEventListener('scroll', measure, true)
  onUnmounted(() => {
    window.removeEventListener('resize', measure)
    window.removeEventListener('scroll', measure, true)
  })
}

const spotlightStyle = computed(() => {
  const r = targetRect.value
  if (!r) return {}
  const pad = 6
  return {
    top: `${r.top - pad}px`,
    left: `${r.left - pad}px`,
    width: `${r.width + pad * 2}px`,
    height: `${r.height + pad * 2}px`,
  }
})

const injectPos = computed(() => !!targetRect.value)
const injectStyle = computed(() => {
  const r = targetRect.value
  if (!r) return {}
  const vw = typeof window !== 'undefined' ? window.innerWidth : 360
  const cardWidth = Math.min(vw - 32, 360)
  // Anchor centered horizontally, just below the target (or above if near bottom).
  const vh = typeof window !== 'undefined' ? window.innerHeight : 640
  const wantBelow = r.top + r.height + 200 < vh
  const top = wantBelow ? r.top + r.height + 16 : Math.max(r.top - 200, 12)
  const left = Math.max(16, Math.min(vw - cardWidth - 16, r.left + r.width / 2 - cardWidth / 2))
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${cardWidth}px`,
  }
})
</script>

<style scoped>
.cm-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(35, 29, 69, 0.55);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  pointer-events: auto;
}

.cm-spotlight {
  position: fixed;
  border-radius: 18px;
  box-shadow: 0 0 0 9999px rgba(35, 29, 69, 0.55), 0 0 0 4px rgba(0, 161, 154, 0.7);
  pointer-events: none;
  transition: top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease;
}

.cm-inject {
  position: fixed;
  background: #fff;
  border: 1.5px solid #e2f1ea;
  border-radius: 16px;
  padding: 16px 18px 14px;
  box-shadow: 0 16px 40px rgba(35, 29, 69, 0.35);
  font-family: inherit;
  color: #231d45;
  z-index: 1001;
}
.cm-inject-step {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #007e78;
  margin-bottom: 6px;
}
.cm-inject-title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: #231d45;
  margin-bottom: 6px;
  line-height: 1.25;
}
.cm-inject-body {
  font-size: 12.5px;
  font-weight: 500;
  color: #4a4566;
  line-height: 1.55;
  letter-spacing: -0.05px;
  margin-bottom: 14px;
}
.cm-inject-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.cm-inject-dots { display: flex; gap: 5px; align-items: center; }
.cm-inject-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ececef;
  transition: all 0.2s;
}
.cm-inject-dot.active {
  background: #00a19a;
  width: 16px;
  border-radius: 3px;
}
.cm-inject-btns { display: flex; gap: 8px; align-items: center; }
.cm-inject-skip {
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #6b6783;
  cursor: pointer;
  padding: 6px 10px;
}
.cm-inject-skip:hover { color: #231d45; }
.cm-inject-next {
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  letter-spacing: -0.1px;
}
.cm-inject-next:hover { background: #00b6ae; }
</style>
