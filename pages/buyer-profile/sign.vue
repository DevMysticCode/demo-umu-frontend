<template>
  <div class="sd-page">
    <!-- Top nav: back / title / Clear -->
    <div class="sd-top-nav">
      <button class="sd-back" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div class="sd-nav-centre">Sign your Profile</div>
      <span
        class="sd-nav-right"
        :class="{ disabled: !canClear }"
        @click="onClear"
      >
        Clear
      </span>
    </div>

    <!-- Intro -->
    <div class="sd-intro">
      <p>
        Sign below to confirm this profile is accurate and you authorise its
        sharing. Your signature will be embedded in the PDF.
      </p>
    </div>

    <!-- Document summary -->
    <div class="sd-doc-summary">
      <div class="sd-doc-label">SIGNING</div>
      <div class="sd-doc-title">UMU Buyer Profile — {{ displayName }}</div>
      <div class="sd-doc-meta">
        Ref: {{ publicRef }} · {{ todayLabel }} · Profile + Financial Credentials
      </div>
    </div>

    <!-- Signature pad -->
    <span class="sec-label">DRAW YOUR SIGNATURE</span>
    <div class="sig-pad" :class="{ signed: hasDrawn }">
      <canvas
        ref="canvasEl"
        class="sig-canvas"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointerleave="onPointerUp"
        @pointercancel="onPointerUp"
      />
      <div v-if="!hasDrawn" class="sig-placeholder">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#9c98ad">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        <span class="sig-placeholder-text">Draw your signature here</span>
      </div>
    </div>

    <!-- Or type name -->
    <div class="sd-type-wrap">
      <div class="sd-type-divider">— or type your name instead —</div>
      <input
        v-model="typedName"
        type="text"
        class="sd-type-input"
        :placeholder="displayName"
        @input="onTypeNameInput"
      />
    </div>

    <!-- Legal note -->
    <div class="sd-legal">
      By signing you confirm this profile is accurate. Your digital signature
      is timestamp-verified by UMU and embedded in the PDF as a legally
      recognised electronic signature under eIDAS regulation.
    </div>

    <!-- Apply CTA -->
    <div class="sd-cta-wrap">
      <button
        class="cta-btn"
        :disabled="!canApply || applying"
        @click="onApply"
      >
        {{ applying ? 'Applying…' : 'Apply signature →' }}
      </button>
      <div v-if="errorMsg" class="sd-err">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  useBuyerProfile,
  type BuyerProfile,
} from '~/composables/useBuyerProfile'
import { useProfile } from '~/composables/useProfile'

definePageMeta({ title: 'Sign Profile — UmovingU', middleware: 'auth' })

const router = useRouter()
const { getBuyerProfile, signProfile } = useBuyerProfile()
const { fetchProfile, profile } = useProfile()

const passport = ref<BuyerProfile | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
const hasDrawn = ref(false)
const typedName = ref('')
const applying = ref(false)
const errorMsg = ref('')

let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let lastX = 0
let lastY = 0
let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  fetchProfile?.().catch(() => {})
  try {
    const p = await getBuyerProfile()
    passport.value = p
    if (!p) { router.replace('/buyer-profile'); return }
  } catch {
    router.replace('/buyer-profile')
    return
  }
  await nextTick()
  initCanvas()
  // React to size changes (e.g. orientation, font load) by resizing the canvas
  // while preserving the strokes drawn so far.
  if (canvasEl.value && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => initCanvas())
    resizeObserver.observe(canvasEl.value.parentElement!)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})

function initCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.parentElement!.getBoundingClientRect()
  // Backup current pixels before resizing (avoid wiping when re-init runs).
  const backup = canvas.toDataURL?.('image/png')
  canvas.width = Math.floor(rect.width * dpr)
  canvas.height = Math.floor(rect.height * dpr)
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)
  ctx.strokeStyle = '#231d45'
  ctx.lineWidth = 2.4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (backup && hasDrawn.value) {
    const img = new Image()
    img.onload = () => { ctx?.drawImage(img, 0, 0, rect.width, rect.height) }
    img.src = backup
  }
}

function getXY(ev: PointerEvent): [number, number] {
  const rect = canvasEl.value!.getBoundingClientRect()
  return [ev.clientX - rect.left, ev.clientY - rect.top]
}

function onPointerDown(ev: PointerEvent) {
  if (!ctx) return
  drawing = true
  ;[lastX, lastY] = getXY(ev)
  // dot start for taps
  ctx.beginPath()
  ctx.arc(lastX, lastY, 1.2, 0, Math.PI * 2)
  ctx.fillStyle = '#231d45'
  ctx.fill()
  hasDrawn.value = true
  // Typing and drawing are mutually exclusive — clearing typed input keeps
  // the "what gets persisted" decision unambiguous.
  if (typedName.value) typedName.value = ''
  ;(ev.target as Element).setPointerCapture?.(ev.pointerId)
}
function onPointerMove(ev: PointerEvent) {
  if (!drawing || !ctx) return
  const [x, y] = getXY(ev)
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  ;[lastX, lastY] = [x, y]
}
function onPointerUp() { drawing = false }

function onTypeNameInput() {
  // If user starts typing, wipe any drawn strokes (mutually exclusive paths)
  if (hasDrawn.value && typedName.value.trim()) {
    clearCanvas()
  }
}

function clearCanvas() {
  if (!ctx || !canvasEl.value) return
  const w = canvasEl.value.parentElement!.getBoundingClientRect().width
  const h = canvasEl.value.parentElement!.getBoundingClientRect().height
  ctx.clearRect(0, 0, w, h)
  hasDrawn.value = false
}

function onClear() {
  if (!canClear.value) return
  clearCanvas()
  typedName.value = ''
}

const canClear = computed(() => hasDrawn.value || !!typedName.value)
const canApply = computed(() => hasDrawn.value || !!typedName.value.trim())

// ── Display ───────────────────────────────────────────────
const displayName = computed(() => {
  const first = profile.value?.firstName?.trim()
  const last = profile.value?.lastName?.trim()
  if (first || last) return [first, last].filter(Boolean).join(' ')
  return profile.value?.email?.split('@')[0] || 'Buyer'
})
const publicRef = computed(
  () => (passport.value as any)?.publicRef || '—',
)
const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }),
)

// ── Apply signature ───────────────────────────────────────
async function onApply() {
  errorMsg.value = ''
  applying.value = true
  try {
    let payload: { signatureData?: string; signedName?: string } = {}
    if (hasDrawn.value && canvasEl.value) {
      payload.signatureData = canvasEl.value.toDataURL('image/png')
    } else if (typedName.value.trim()) {
      payload.signedName = typedName.value.trim()
    } else {
      errorMsg.value = 'Sign or type your name first'
      return
    }
    await signProfile(payload)
    router.push('/buyer-profile/signed')
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? 'Could not save signature'
  } finally {
    applying.value = false
  }
}

const goBack = useGoBack('/buyer-profile/pdf')
</script>

<style scoped>
.sd-page {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-bottom: 32px;
}

.sd-top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 6px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.sd-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 1px solid #ececef;
  display: flex; align-items: center; justify-content: center;
  color: #231d45; cursor: pointer; flex-shrink: 0;
}
.sd-nav-centre {
  flex: 1; text-align: center;
  font-size: 14px; font-weight: 800; color: #231d45;
}
.sd-nav-right {
  font-size: 13px; font-weight: 700; color: #c73e36;
  cursor: pointer; padding: 8px 4px; white-space: nowrap;
  transition: opacity 0.15s;
}
.sd-nav-right.disabled { opacity: 0.35; pointer-events: none; }

.sd-intro {
  padding: 10px 22px 0;
  text-align: center;
  animation: sd-fadeUp 0.4s 0.05s both;
}
@keyframes sd-fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.sd-intro p {
  font-size: 13px; color: #6b6783; line-height: 1.5;
}

.sd-doc-summary {
  margin: 12px 22px 0;
  background: #fafafa;
  border: 1px solid #ececef;
  border-radius: 12px;
  padding: 12px 14px;
  animation: sd-fadeUp 0.4s 0.08s both;
}
.sd-doc-label {
  font-size: 10px; font-weight: 800; letter-spacing: 0.8px;
  color: #9c98ad;
  margin-bottom: 8px;
}
.sd-doc-title {
  font-size: 13px; font-weight: 800; color: #231d45;
}
.sd-doc-meta {
  font-size: 11px; color: #6b6783; margin-top: 2px;
}

.sec-label {
  font-size: 11px; font-weight: 800;
  color: #6b6783; letter-spacing: 1px;
  text-transform: uppercase;
  padding: 16px 22px 8px;
  display: block;
  animation: sd-fadeDown 0.4s 0.1s both;
}
@keyframes sd-fadeDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Signature pad — dashed when empty, solid teal when signed (prototype). */
.sig-pad {
  position: relative;
  margin: 0 22px;
  background: white;
  border: 2px dashed #ececef;
  border-radius: 14px;
  height: 180px;
  overflow: hidden;
  animation: sd-fadeUp 0.4s 0.1s both;
  transition: all 0.2s;
}
.sig-pad.signed {
  border-style: solid;
  border-color: #00a19a;
  background: #f2faf8;
}
.sig-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  touch-action: none;
  cursor: crosshair;
}
.sig-placeholder {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
  pointer-events: none;
}
.sig-placeholder-text {
  font-size: 12px; font-weight: 700; color: #9c98ad;
}

.sd-type-wrap {
  margin: 12px 22px 0;
  animation: sd-fadeUp 0.4s 0.15s both;
}
.sd-type-divider {
  font-size: 11px; font-weight: 700; color: #9c98ad;
  text-align: center; margin-bottom: 8px;
}
.sd-type-input {
  width: 100%;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  padding: 13px 14px;
  font-family: 'Plus Jakarta Sans', inherit;
  font-size: 18px; font-style: italic;
  color: #231d45;
  outline: none;
  text-align: center;
  background: white;
  transition: all 0.15s;
}
.sd-type-input:focus { border-color: #00a19a; }

.sd-legal {
  margin: 10px 22px 0;
  padding: 10px 12px;
  background: #f6f5fb;
  border-radius: 10px;
  font-size: 10.5px; color: #6b6783; line-height: 1.4;
  animation: sd-fadeUp 0.4s 0.18s both;
}

.sd-cta-wrap {
  padding: 12px 22px;
  animation: sd-fadeUp 0.4s 0.22s both;
}
.cta-btn {
  width: 100%;
  background: #00a19a; color: white; border: none;
  border-radius: 14px; padding: 16px;
  font-family: inherit; font-size: 14px; font-weight: 800;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.35);
  cursor: pointer; transition: all 0.15s;
}
.cta-btn:hover:not(:disabled) { background: #00b6ae; }
.cta-btn:disabled {
  opacity: 0.5; cursor: not-allowed; pointer-events: none;
}
.sd-err {
  margin-top: 8px;
  font-size: 12px; font-weight: 600; color: #c73e36;
  text-align: center;
}
</style>
