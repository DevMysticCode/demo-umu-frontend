<template>
  <div class="sigpad">
    <canvas
      ref="canvasEl"
      class="sigpad-canvas"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
      @pointercancel="onPointerUp"
    />
    <div v-if="isEmpty" class="sigpad-placeholder">Sign here</div>
    <button v-if="!isEmpty" type="button" class="sigpad-clear" @click="clear">Clear</button>
  </div>
</template>

<script setup lang="ts">
// Simple canvas signature pad — mouse + touch via Pointer Events (one
// listener set covers both, no separate touch handlers needed). Exports
// the drawn signature as a PNG data URL via getDataUrl(), used for the
// Tenancy Agreement e-signature flow (landlord + tenant, client
// feedback: drawn signature over typed-name-only).
const canvasEl = ref<HTMLCanvasElement | null>(null)
const isEmpty = ref(true)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let lastX = 0
let lastY = 0

function resizeCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#0e2840'
  }
}

function pointerPos(e: PointerEvent) {
  const canvas = canvasEl.value!
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onPointerDown(e: PointerEvent) {
  if (!ctx) return
  drawing = true
  isEmpty.value = false
  const { x, y } = pointerPos(e)
  lastX = x
  lastY = y
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (!drawing || !ctx) return
  const { x, y } = pointerPos(e)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
}
function onPointerUp() {
  drawing = false
}

function clear() {
  const canvas = canvasEl.value
  if (!canvas || !ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  isEmpty.value = true
}

function getDataUrl(): string | null {
  if (isEmpty.value || !canvasEl.value) return null
  return canvasEl.value.toDataURL('image/png')
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
})

defineExpose({ getDataUrl, clear, isEmpty })
</script>

<style scoped>
.sigpad {
  position: relative;
  width: 100%;
  height: 160px;
  background: #fff;
  border: 1.5px dashed #d3d3db;
  border-radius: 12px;
  overflow: hidden;
  touch-action: none;
}
.sigpad-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
}
.sigpad-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b9b9c4;
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
}
.sigpad-clear {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f4f4f8;
  border: none;
  border-radius: 100px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #6b7089;
  cursor: pointer;
}
</style>
