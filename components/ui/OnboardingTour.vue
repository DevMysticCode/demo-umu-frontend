<template>
  <Teleport to="body">
    <Transition name="tour-fade">
      <div
        v-if="visible && currentStep"
        class="tour-root"
        @click.self="skip"
      >
        <!-- Spotlight cutout via two layered overlays -->
        <div class="tour-overlay" :style="overlayStyle" />
        <div class="tour-spotlight" :style="spotlightStyle" />

        <!-- Tip card -->
        <div class="tour-tip" :style="tipStyle" :class="{ above: tipAbove }">
          <div class="tour-arrow" :class="{ above: tipAbove }" />
          <div class="tour-content">
            <div class="tour-step-num">
              <span class="step-text">{{ index + 1 }} of {{ steps.length }}</span>
              <span class="step-dots">
                <span
                  v-for="(_, i) in steps"
                  :key="i"
                  class="step-dot"
                  :class="{ active: i === index }"
                />
              </span>
            </div>
            <div class="tour-title">{{ currentStep.title }}</div>
            <div class="tour-body">{{ currentStep.body }}</div>
            <div class="tour-actions">
              <button class="tour-skip" @click="skip">Skip</button>
              <button v-if="index > 0" class="tour-back" @click="back">
                ← Back
              </button>
              <button class="tour-next" @click="next">
                {{ index === steps.length - 1 ? 'Got it ✓' : 'Next →' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  /** Array of `{ selector, title, body, padding? }`. */
  steps: { type: Array, required: true },
  /** localStorage key — when set, the tour auto-runs once per browser. */
  storageKey: { type: String, default: '' },
  /** Force the tour to start on mount, ignoring storageKey. */
  autoStart: { type: Boolean, default: true },
})

const emit = defineEmits(['done', 'skipped'])

const visible = ref(false)
const index = ref(0)
const targetRect = ref({ x: 0, y: 0, w: 0, h: 0 })

const currentStep = computed(() => props.steps[index.value] ?? null)

const overlayStyle = computed(() => ({
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.55)',
  zIndex: 9998,
}))

const spotlightStyle = computed(() => {
  const r = targetRect.value
  const pad = currentStep.value?.padding ?? 8
  return {
    position: 'fixed',
    top: `${r.y - pad}px`,
    left: `${r.x - pad}px`,
    width: `${r.w + pad * 2}px`,
    height: `${r.h + pad * 2}px`,
    border: '3px solid #f59e0b',
    borderRadius: '14px',
    boxShadow:
      '0 0 0 9999px rgba(15, 23, 42, 0.55), 0 0 22px rgba(245, 158, 11, 0.55)',
    zIndex: 9999,
    pointerEvents: 'none',
    transition:
      'top 0.45s cubic-bezier(.2,.8,.2,1), left 0.45s cubic-bezier(.2,.8,.2,1), width 0.45s cubic-bezier(.2,.8,.2,1), height 0.45s cubic-bezier(.2,.8,.2,1)',
  }
})

const tipAbove = ref(false)

const tipStyle = computed(() => {
  const r = targetRect.value
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const vw = typeof window !== 'undefined' ? window.innerWidth : 400
  const tipHeight = 200
  const tipWidth = Math.min(340, vw - 32)
  const spaceBelow = vh - (r.y + r.h)
  const showAbove = spaceBelow < tipHeight + 24 && r.y > tipHeight + 24
  tipAbove.value = showAbove
  const top = showAbove
    ? `${Math.max(20, r.y - tipHeight - 24)}px`
    : `${r.y + r.h + 24}px`
  // Centre horizontally over the target, clamped to the viewport.
  const idealLeft = r.x + r.w / 2 - tipWidth / 2
  const left = Math.max(16, Math.min(idealLeft, vw - tipWidth - 16))
  return {
    position: 'fixed',
    top,
    left: `${left}px`,
    width: `${tipWidth}px`,
    zIndex: 10000,
    transition:
      'top 0.45s cubic-bezier(.2,.8,.2,1), left 0.45s cubic-bezier(.2,.8,.2,1)',
  }
})

let resizeRaf = null
// Pure measurement — never side-effects scroll. Used by resize/scroll
// listeners so the spotlight tracks the target without snapping the page.
function measure() {
  const sel = currentStep.value?.selector
  if (!sel) return
  const el = document.querySelector(sel)
  if (!el) return
  const rect = el.getBoundingClientRect()
  targetRect.value = {
    x: rect.left,
    y: rect.top,
    w: rect.width,
    h: rect.height,
  }
}

// Step-change measurement — also pulls the target into view if needed.
// Only called from start/next/back so the user can scroll freely without
// the tour snapping them back.
function focusStep() {
  const sel = currentStep.value?.selector
  if (!sel) {
    measure()
    return
  }
  const el = document.querySelector(sel)
  if (!el) {
    measure()
    return
  }
  const rect = el.getBoundingClientRect()
  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Re-measure after the smooth scroll settles, then once more to catch
    // any layout the scroll triggered.
    setTimeout(measure, 320)
    setTimeout(measure, 600)
  } else {
    measure()
  }
}

function start() {
  index.value = 0
  visible.value = true
  nextTick(focusStep)
}

function next() {
  if (index.value >= props.steps.length - 1) {
    finish()
    return
  }
  index.value++
  nextTick(focusStep)
}

function back() {
  if (index.value === 0) return
  index.value--
  nextTick(focusStep)
}

function skip() {
  visible.value = false
  markSeen()
  emit('skipped')
}

function finish() {
  visible.value = false
  markSeen()
  emit('done')
}

function markSeen() {
  if (!props.storageKey) return
  try {
    localStorage.setItem(props.storageKey, String(Date.now()))
  } catch {
    /* ignore */
  }
}

function hasSeen() {
  if (!props.storageKey) return false
  try {
    return !!localStorage.getItem(props.storageKey)
  } catch {
    return false
  }
}

function onResize() {
  if (resizeRaf) cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(measure)
}
function onKey(e) {
  if (e.key === 'Escape' && visible.value) skip()
}

watch(
  () => index.value,
  () => nextTick(focusStep),
)

onMounted(() => {
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onResize, true)
  window.addEventListener('keydown', onKey)
  if (props.autoStart && !hasSeen()) {
    // Defer one tick so target nodes have rendered.
    setTimeout(start, 350)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onResize, true)
  window.removeEventListener('keydown', onKey)
})

defineExpose({ start, finish, skip })
</script>

<style scoped>
.tour-root {
  position: fixed;
  inset: 0;
  z-index: 9997;
}

.tour-tip {
  background: #fff;
  border-radius: 16px;
  padding: 16px 18px 14px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.35);
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.tour-arrow {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 3px;
}
.tour-arrow.above {
  top: auto;
  bottom: -8px;
}

.tour-content {
  flex: 1;
  min-width: 0;
}
.tour-step-num {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.step-text {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
}
.step-dots {
  display: inline-flex;
  gap: 4px;
}
.step-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #e2e8f0;
}
.step-dot.active {
  background: #00a19a;
  width: 14px;
  border-radius: 999px;
}
.tour-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.tour-body {
  font-size: 12.5px;
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 12px;
}
.tour-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tour-skip {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
}
.tour-skip:hover {
  background: #f1f5f9;
  color: #4a5568;
}
.tour-back {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #4a5568;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
}
.tour-back:hover {
  background: #f1f5f9;
}
.tour-next {
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  margin-left: auto;
  box-shadow: 0 4px 12px rgba(0, 161, 154, 0.28);
  transition: transform 0.12s, box-shadow 0.15s;
}
.tour-next:hover {
  transform: translateY(-1px);
}

.tour-fade-enter-active,
.tour-fade-leave-active {
  transition: opacity 0.2s ease;
}
.tour-fade-enter-from,
.tour-fade-leave-to {
  opacity: 0;
}
</style>