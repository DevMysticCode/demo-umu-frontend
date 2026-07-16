<template>
  <Teleport to="body">
    <div v-if="open" class="cs-overlay" @click.self="onCancel">
      <div class="cs-modal">
        <!-- Header -->
        <div class="cs-header">
          <div class="cs-title">Scan document</div>
          <button class="cs-close" type="button" aria-label="Close" @click="onCancel">✕</button>
        </div>

        <!-- Live preview / fallback / error states -->
        <div class="cs-stage">
          <video
            v-show="mode === 'live' && streamActive"
            ref="videoEl"
            class="cs-video"
            autoplay
            playsinline
            muted
          />

          <!-- Idle → starting spinner -->
          <div v-if="mode === 'live' && !streamActive && !error" class="cs-loading">
            <div class="cs-spinner" />
            <div>Starting camera…</div>
          </div>

          <!-- Error / fallback: system camera via capture attribute -->
          <div v-if="mode === 'fallback' || error" class="cs-fallback">
            <div class="cs-fallback-icon">📷</div>
            <div class="cs-fallback-title">
              {{ error ? 'Camera unavailable' : 'Use system camera' }}
            </div>
            <p v-if="error" class="cs-fallback-msg">{{ error }}</p>
            <p v-else class="cs-fallback-msg">
              Take a photo with your device camera — we'll pick it up here.
            </p>
            <button class="cs-fallback-btn" type="button" @click="triggerFallbackInput">
              Open camera
            </button>
          </div>

          <!-- Hidden canvas — used to snapshot the live video frame -->
          <canvas ref="canvasEl" class="cs-canvas" />
          <!-- Hidden fallback input — uses capture="environment" so mobile
               browsers open the back camera. Desktop browsers open the file
               picker (which usually offers webcam as a "camera" option). -->
          <input
            ref="fallbackInputEl"
            type="file"
            accept="image/*"
            capture="environment"
            class="cs-hidden-input"
            @change="onFallbackFile"
          />
        </div>

        <!-- Controls -->
        <div v-if="mode === 'live' && streamActive" class="cs-controls">
          <button
            v-if="canSwitchCamera"
            class="cs-btn-secondary"
            type="button"
            :disabled="switching"
            @click="switchCamera"
            aria-label="Switch camera"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          <button
            class="cs-capture"
            type="button"
            :disabled="capturing"
            aria-label="Take photo"
            @click="capture"
          >
            <span class="cs-capture-inner" />
          </button>
          <button class="cs-btn-secondary" type="button" @click="onCancel" aria-label="Cancel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'capture'])

// ── Native document scanner (Capacitor plugin) ──────────────────
// On iOS/Android inside the Capacitor shell we invoke Apple's
// VNDocumentCameraViewController (iOS 13+) or Google's ML Kit
// Document Scanner (Android 12+). Both do real edge detection,
// perspective correction, multi-page capture, and hand back a
// clean image or PDF — the same UX users know from Notes / Drive.
//
// Web build has no equivalent, so we fall through to the getUserMedia
// live-preview flow implemented below.
//
// The plugin is dynamically imported so a web build without the
// dependency installed still compiles and runs — feature detection
// at runtime decides which path to take.
let nativeScannerModule = null
let capacitorCore = null
async function loadNativeScanner() {
  if (typeof window === 'undefined') return null
  if (nativeScannerModule) return nativeScannerModule
  try {
    // Optional dependency — missing on web builds; that's fine.
    const core = await import('@capacitor/core')
    capacitorCore = core.Capacitor
    if (!capacitorCore?.isNativePlatform?.()) return null
    // Optional plugin — installed only for native builds.
    const mod = await import('@capgo/capacitor-document-scanner')
    nativeScannerModule = mod
    return mod
  } catch {
    return null
  }
}

// Convert a native file path returned by the plugin (e.g.
// "file:///data/user/0/io.umovingu/cache/scan_1.jpg") into a real
// File object we can pipe through the existing upload code path.
async function pathToFile(path, index) {
  try {
    // The Capacitor WebView can fetch its own file:// paths directly.
    const resp = await fetch(path)
    const blob = await resp.blob()
    const mime = blob.type || 'image/jpeg'
    const ext = mime.includes('pdf') ? 'pdf' : 'jpg'
    return new File(
      [blob],
      `scan-${Date.now()}-${index + 1}.${ext}`,
      { type: mime, lastModified: Date.now() },
    )
  } catch {
    return null
  }
}

async function tryNativeScanner() {
  const mod = await loadNativeScanner()
  if (!mod) return false
  try {
    // API is stable across Capgo v6/v7: DocumentScanner.scanDocument()
    // returns { scannedImages: string[] } — an array of file:// paths,
    // one per page the user captured.
    const scanner = mod.DocumentScanner ?? mod.default ?? mod
    const result = await scanner.scanDocument({
      // Sensible caps so a user doesn't accidentally scan 40 pages.
      responseType: 'imageFilePath',
      maxNumDocuments: 10,
    })
    const paths = result?.scannedImages ?? []
    if (!paths.length) {
      // User cancelled inside the native UI — treat as a normal close,
      // not an error.
      emit('close')
      return true
    }
    // Emit each captured page as its own File. The parent's onCameraCapture
    // wrapper already knows how to feed a File through the upload pipeline.
    for (let i = 0; i < paths.length; i++) {
      const file = await pathToFile(paths[i], i)
      if (file) emit('capture', file)
    }
    emit('close')
    return true
  } catch (err) {
    // Common non-fatal errors: user pressed back, permission denied.
    const msg = String(err?.message ?? err ?? '').toLowerCase()
    if (msg.includes('cancel') || msg.includes('user')) {
      emit('close')
      return true
    }
    // Real error → fall through to the web modal so the user still has a
    // way to capture something. Surface the reason in the modal.
    error.value = 'Native scanner failed. Using camera preview instead.'
    return false
  }
}

const videoEl = ref(null)
const canvasEl = ref(null)
const fallbackInputEl = ref(null)

// 'live' = using getUserMedia + <video>; 'fallback' = <input capture>.
const mode = ref('live')
const streamActive = ref(false)
const error = ref('')
const capturing = ref(false)
const switching = ref(false)
const canSwitchCamera = ref(false)
let currentStream = null
let currentFacing = 'environment'

async function startStream(facing = 'environment') {
  error.value = ''
  streamActive.value = false
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    mode.value = 'fallback'
    return
  }
  try {
    // Stop any previous stream first (facingMode switch).
    stopStream()
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facing },
        // Reasonable resolution for document scanning without OOM'ing older phones.
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    })
    currentStream = stream
    currentFacing = facing
    if (videoEl.value) {
      videoEl.value.srcObject = stream
      await videoEl.value.play().catch(() => {})
    }
    streamActive.value = true
    // Only show flip button when device has multiple cameras.
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cams = devices.filter((d) => d.kind === 'videoinput')
      canSwitchCamera.value = cams.length > 1
    } catch {
      canSwitchCamera.value = false
    }
  } catch (e) {
    // Permission denied / no camera / secure-context missing → fallback.
    const name = e?.name || ''
    if (name === 'NotAllowedError' || name === 'SecurityError') {
      error.value =
        'Camera permission was blocked. You can still take a photo using the system camera below.'
    } else if (name === 'NotFoundError') {
      error.value = 'No camera found on this device.'
    } else if (name === 'NotReadableError') {
      error.value = 'The camera is being used by another app. Close it and try again.'
    } else {
      error.value = 'Could not start the camera. Use the system camera option below.'
    }
    mode.value = 'fallback'
  }
}

function stopStream() {
  if (currentStream) {
    for (const t of currentStream.getTracks()) {
      try { t.stop() } catch { /* ignore */ }
    }
    currentStream = null
  }
  if (videoEl.value) {
    try { videoEl.value.srcObject = null } catch { /* ignore */ }
  }
  streamActive.value = false
}

async function switchCamera() {
  if (switching.value) return
  switching.value = true
  const next = currentFacing === 'environment' ? 'user' : 'environment'
  await startStream(next)
  switching.value = false
}

async function capture() {
  if (capturing.value || !videoEl.value || !canvasEl.value) return
  capturing.value = true
  try {
    const v = videoEl.value
    const c = canvasEl.value
    // Match canvas to the real video frame size for a full-resolution scan.
    const w = v.videoWidth || 1280
    const h = v.videoHeight || 720
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D not available')
    ctx.drawImage(v, 0, 0, w, h)
    // JPEG at 0.92 quality: good doc legibility, ~1/6 the size of PNG.
    const blob = await new Promise((resolve) =>
      c.toBlob((b) => resolve(b), 'image/jpeg', 0.92),
    )
    if (!blob) throw new Error('Snapshot failed')
    const file = new File(
      [blob],
      `scan-${Date.now()}.jpg`,
      { type: 'image/jpeg', lastModified: Date.now() },
    )
    emit('capture', file)
    stopStream()
    emit('close')
  } catch (e) {
    error.value = 'Could not capture the image. Please try again.'
  } finally {
    capturing.value = false
  }
}

function triggerFallbackInput() {
  fallbackInputEl.value?.click()
}

function onFallbackFile(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (file) {
    emit('capture', file)
    emit('close')
  }
}

function onCancel() {
  stopStream()
  emit('close')
}

// Open → start stream; close → tear down.
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      mode.value = 'live'
      error.value = ''
      // Native path first — bypasses the web modal entirely and hands
      // control to Apple / Google's document scanner. Returns true when
      // it handled the interaction (success OR cancel OR
      // recoverable-fallback), false only when we should show the web UI.
      const handledByNative = await tryNativeScanner()
      if (handledByNative) return
      // Web path: getUserMedia + live preview + shutter.
      // Wait a tick so the <video> element exists before attaching srcObject.
      await new Promise((r) => setTimeout(r, 0))
      await startStream('environment')
    } else {
      stopStream()
    }
  },
)

onBeforeUnmount(() => stopStream())
</script>

<style scoped>
.cs-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: stretch;
  justify-content: center;
}
.cs-modal {
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  background: #000;
}
.cs-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0));
  color: #fff;
}
.cs-title { font-size: 15px; font-weight: 700; }
.cs-close {
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
}
.cs-close:hover { background: rgba(255, 255, 255, 0.2); }

.cs-stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cs-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cs-canvas { display: none; }
.cs-hidden-input { display: none; }

.cs-loading {
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.cs-spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #00a19a;
  animation: cs-spin 0.8s linear infinite;
}
@keyframes cs-spin {
  to { transform: rotate(360deg); }
}

.cs-fallback {
  color: #fff;
  text-align: center;
  padding: 32px 24px;
  max-width: 320px;
}
.cs-fallback-icon { font-size: 48px; margin-bottom: 12px; }
.cs-fallback-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.cs-fallback-msg {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.5;
  margin: 0 0 20px;
}
.cs-fallback-btn {
  background: #00a19a;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 100px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.cs-fallback-btn:hover { background: #008a84; }

.cs-controls {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px 24px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0));
  background: rgba(0, 0, 0, 0.6);
}
.cs-btn-secondary {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cs-btn-secondary:hover { background: rgba(255, 255, 255, 0.25); }
.cs-btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

.cs-capture {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fff;
  border: 4px solid rgba(255, 255, 255, 0.4);
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}
.cs-capture:active { transform: scale(0.94); }
.cs-capture:disabled { opacity: 0.6; cursor: not-allowed; }
.cs-capture-inner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #000;
}
</style>
