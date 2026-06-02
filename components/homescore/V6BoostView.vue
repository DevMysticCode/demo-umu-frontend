<template>
  <div class="hs-v6-boost">
    <!-- Mini header (back + title + help) -->
    <div class="boost-header">
      <button
        class="boost-back"
        type="button"
        @click="$emit('back')"
        aria-label="Back"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="boost-header-info">
        <div class="boost-header-title">Boost your score</div>
        <div class="boost-header-sub">Every document adds real value</div>
      </div>
      <button class="boost-help" type="button" aria-label="How scoring works">
        ?
      </button>
    </div>

    <!-- Your property journey · gauge rings -->
    <div class="boost-journey-card anim-1">
      <div class="boost-journey-head">
        <div class="boost-journey-eyebrow">✨ Your property journey</div>
        <div class="boost-journey-update">Updates as you add docs</div>
      </div>
      <div class="boost-gauges-row">
        <div
          v-for="g in gauges"
          :key="g.id"
          class="boost-gauge-col"
          :class="g.id"
        >
          <!-- <div class="gauge-emoji">{{ g.emoji }}</div> -->
          <div class="boost-gauge-ring">
            <svg viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="36" stroke-width="7" fill="none" />
              <circle
                cx="45"
                cy="45"
                r="36"
                :stroke="`url(#bjGrad-${g.id})`"
                stroke-width="7"
                fill="none"
                stroke-dasharray="226.19"
                :stroke-dashoffset="226.19 - (g.animatedValue / g.max) * 226.19"
                stroke-linecap="round"
                transform="rotate(-90 45 45)"
              />
              <defs>
                <linearGradient
                  :id="`bjGrad-${g.id}`"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" :stop-color="g.gradFrom" />
                  <stop offset="100%" :stop-color="g.gradTo" />
                </linearGradient>
              </defs>
            </svg>
            <div class="boost-gauge-num" :class="{ pct: g.suffix === '%' }">
              {{ Math.round(g.animatedValue)
              }}<span v-if="g.suffix">{{ g.suffix }}</span>
            </div>
          </div>
          <div class="boost-gauge-cat">{{ g.label }}</div>
          <div class="boost-gauge-sub">{{ g.sub }}</div>
        </div>
      </div>
      <div class="boost-journey-foot">
        <div class="boost-journey-foot-icon">📊</div>
        <div class="boost-journey-foot-text">
          Each document you add unlocks
          <b>more of your Passport</b>.
        </div>
      </div>
    </div>

    <!-- Upload a document. One question at a time — only the next
         unuploaded doc renders. After upload, the congratulations
         overlay celebrates the impact, then the next card slides in. -->
    <div class="boost-section-h">
      <span class="ico">📎</span> Upload a document
      <span class="pill-progress"
        >{{ uploadedDocs.length }} of {{ docs.length }}</span
      >
    </div>
    <!-- Completed docs stay in the list as "done" rows so the user can
         see their progress. Only the next-unuploaded card is rendered
         after them; later docs stay hidden until their turn. -->
    <div v-for="d in completedDocs" :key="d.id" class="boost-row added">
      <div class="boost-row-icon" :class="d.tone">{{ d.icon }}</div>
      <div class="boost-row-info">
        <div class="boost-row-title">{{ d.title }}</div>
        <div class="boost-row-sub">Verified · +{{ d.mrDelta }}% Move Ready</div>
      </div>
      <div class="boost-row-check">✓</div>
    </div>
    <div
      v-if="currentDoc"
      :key="currentDoc.id"
      class="boost-row boost-row--active"
      @click="onAddDoc(currentDoc.id)"
    >
      <div class="boost-row-icon" :class="currentDoc.tone">
        {{ currentDoc.icon }}
      </div>
      <div class="boost-row-info">
        <div class="boost-row-title">{{ currentDoc.title }}</div>
        <div class="boost-row-sub">{{ currentDoc.sub }}</div>
      </div>
      <div class="boost-row-plus">＋</div>
    </div>

    <!-- All documents uploaded celebration -->
    <div v-else class="boost-row alldone">
      <div class="boost-row-icon gold">🏆</div>
      <div class="boost-row-info">
        <div class="boost-row-title">All documents uploaded</div>
        <div class="boost-row-sub">
          Passport ready to publish · share with buyers, lenders, agents
        </div>
      </div>
      <div class="boost-row-chev">›</div>
    </div>

    <!-- Per-upload congratulations overlay. Fireworks burst behind a
         centered impact card with the points won + what this document
         actually verifies, then the next question is revealed when the
         user taps "Next document". -->
    <Teleport to="body">
      <div
        v-if="celebrateDoc"
        class="bcv-overlay"
        @click.self="dismissCelebrate"
      >
        <div class="bcv-fw-host">
          <div
            v-for="(fw, i) in celebrateFireworks"
            :key="i"
            class="bcv-fw"
            :style="{ left: fw.left + '%', top: fw.top + '%' }"
          >
            <span
              v-for="(p, j) in fw.particles"
              :key="j"
              class="bcv-fw-particle"
              :style="{
                background: fw.color,
                boxShadow: `0 0 12px 2px ${fw.color}`,
                '--tx': p.tx + 'px',
                '--ty': p.ty + 'px',
                animationDelay: fw.delay + 'ms',
              }"
            />
          </div>
        </div>
        <div class="bcv-card">
          <div class="bcv-ico" :class="celebrateDoc.tone">
            {{ celebrateDoc.icon }}
          </div>
          <div class="bcv-eyebrow">DOCUMENT VERIFIED</div>
          <div class="bcv-headline">
            +{{ celebrateDoc.mrDelta }}% Move Ready
          </div>
          <div class="bcv-subhead">+{{ celebrateDoc.ppDelta }}% Passport</div>
          <div class="bcv-doc-label">{{ celebrateDoc.title }}</div>
          <div class="bcv-impact">{{ celebrateImpact }}</div>
          <button class="bcv-continue" type="button" @click="dismissCelebrate">
            {{ isLastDoc ? 'See my Passport →' : 'Next document →' }}
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Book a professional -->
    <div class="boost-section-h">
      <span class="ico">🔧</span> Book a professional
    </div>
    <div
      v-for="b in bookings"
      :key="b.id"
      class="boost-row"
      @click="$emit('open-marketplace', b.id)"
    >
      <div class="boost-row-icon" :class="b.tone">{{ b.icon }}</div>
      <div class="boost-row-info">
        <div class="boost-row-title">{{ b.title }}</div>
        <div class="boost-row-sub">{{ b.sub }}</div>
      </div>
      <div class="boost-row-chev">›</div>
    </div>

    <!-- Next step · Move Ready + Passport. SVG ring gauges show actual
         progress (white arc on translucent track) — same dial language
         as the journey card at the top, spaced wide so each reads as
         its own milestone. -->
    <div class="boost-next anim-2">
      <div class="boost-next-eyebrow">✦ Next step on your journey</div>
      <div class="boost-next-route">
        <div class="boost-next-ring">
          <svg viewBox="0 0 90 90" aria-hidden="true">
            <circle cx="45" cy="45" r="38" class="boost-next-ring-track" />
            <circle
              cx="45"
              cy="45"
              r="38"
              class="boost-next-ring-fill"
              :stroke-dashoffset="nextRingOffset(moveReadyPct)"
            />
          </svg>
          <div class="boost-next-ring-num">
            {{ moveReadyPct }}<span class="pct">%</span>
          </div>
          <div class="boost-next-ring-label">Move Ready</div>
        </div>
        <div class="boost-next-ring">
          <svg viewBox="0 0 90 90" aria-hidden="true">
            <circle cx="45" cy="45" r="38" class="boost-next-ring-track" />
            <circle
              cx="45"
              cy="45"
              r="38"
              class="boost-next-ring-fill"
              :stroke-dashoffset="nextRingOffset(passportPct)"
            />
          </svg>
          <div class="boost-next-ring-num">
            {{ passportPct }}<span class="pct">%</span>
          </div>
          <div class="boost-next-ring-label">Passport</div>
        </div>
      </div>
      <div class="boost-next-title">Your Passport is taking shape.</div>
      <div class="boost-next-sub">
        Each document you add lifts both scores. Reach Move Ready status and
        publish your Passport — lock in everything you've built.
      </div>
      <button
        type="button"
        class="boost-next-cta"
        @click="$emit('start-passport')"
      >
        🚀 Start my Passport →
      </button>
    </div>

    <div style="height: 32px" />

    <!-- Upload-a-document drawer (reuses BaseDrawer) -->
    <BaseDrawer
      v-model="uploadDrawerOpen"
      :title="activeDoc ? `Upload ${activeDoc.title}` : 'Upload document'"
      @close="onUploadClose"
    >
      <div v-if="activeDoc" class="bd-upload">
        <div class="bd-upload-head">
          <div class="bd-upload-ico" :class="activeDoc.tone">
            {{ activeDoc.icon }}
          </div>
          <div class="bd-upload-sub">{{ activeDoc.sub }}</div>
        </div>

        <label class="bd-dropzone" :class="{ 'has-file': !!selectedFile }">
          <input
            ref="fileInputRef"
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            class="bd-dropzone-input"
            @change="onFileChange"
          />
          <div class="bd-dropzone-icon">{{ selectedFile ? '✓' : '📄' }}</div>
          <div class="bd-dropzone-title">
            {{ selectedFile ? selectedFile.name : 'Drop your document here' }}
          </div>
          <div class="bd-dropzone-meta">
            <template v-if="selectedFile"
              >{{ formatFileSize(selectedFile.size) }} · tap to change</template
            >
            <template v-else
              >or <span class="bd-dropzone-tap">tap to browse</span> · PDF · JPG
              · PNG</template
            >
          </div>
        </label>

        <div class="bd-upload-note">
          🔒 We read the key details only — the file is stored against your
          property and never shared without your say-so.
        </div>
      </div>

      <template #footer>
        <button
          class="bd-upload-cta"
          type="button"
          :disabled="!selectedFile"
          @click="confirmUpload"
        >
          {{ selectedFile ? 'Add to my property →' : 'Choose a file' }}
        </button>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'

interface Props {
  homeScore: number
  moveReadyStart?: number
  passportStart?: number
}

const props = withDefaults(defineProps<Props>(), {
  moveReadyStart: 12,
  passportStart: 30,
})

defineEmits<{
  (e: 'back'): void
  (e: 'open-marketplace', kind: string): void
  (e: 'start-passport'): void
}>()

// Each uploaded doc bumps Move Ready + Passport by a fixed amount.
const docs = [
  {
    id: 'bills',
    icon: '💡',
    tone: 'yellow',
    title: 'Utility bills',
    sub: 'See your actual spend vs your EPC estimate — most impactful first step',
    mrDelta: 22,
    ppDelta: 12,
  },
  {
    id: 'gas',
    icon: '🔥',
    tone: 'amber',
    title: 'Gas Safety Certificate',
    sub: 'Annual safety check from a Gas Safe engineer · +25% MoveReady',
    mrDelta: 25,
    ppDelta: 15,
  },
  {
    id: 'eicr',
    icon: '⚡',
    tone: 'violet',
    title: 'EICR · Electrical safety report',
    sub: '5-yearly · required for letting · +20% MoveReady',
    mrDelta: 20,
    ppDelta: 14,
  },
  {
    id: 'boiler',
    icon: '🛠',
    tone: 'teal',
    title: 'Boiler service record',
    sub: 'Annual service invoice or certificate · +12% MoveReady',
    mrDelta: 12,
    ppDelta: 10,
  },
]

const bookings = [
  {
    id: 'gas-safe',
    icon: '🔥',
    tone: 'amber',
    title: 'Book a Gas Safe engineer',
    sub: 'Service your boiler · cert auto-lands in your score',
  },
  {
    id: 'eicr',
    icon: '⚡',
    tone: 'violet',
    title: 'Book an electrician (EICR)',
    sub: 'Electrical check · from £150',
  },
  {
    id: 'new-epc',
    icon: '🏠',
    tone: 'green',
    title: 'New EPC assessment',
    sub: 'From £60 · required if yours is 10+ years old',
  },
]

const uploadedDocs = ref<string[]>([])

// Circumference of the bottom-card ring (r=38 → 2πr ≈ 238.76). Used to
// drive `stroke-dashoffset` from 0%→100% so the white arc grows as the
// user uploads more docs.
const NEXT_RING_CIRC = 2 * Math.PI * 38
function nextRingOffset(pct: number): number {
  const safe = Math.max(0, Math.min(100, pct))
  return NEXT_RING_CIRC * (1 - safe / 100)
}

const moveReadyPct = computed(() => {
  const delta = uploadedDocs.value.reduce((acc, id) => {
    const d = docs.find((x) => x.id === id)
    return acc + (d?.mrDelta ?? 0)
  }, 0)
  return Math.min(100, props.moveReadyStart + delta)
})

const passportPct = computed(() => {
  const delta = uploadedDocs.value.reduce((acc, id) => {
    const d = docs.find((x) => x.id === id)
    return acc + (d?.ppDelta ?? 0)
  }, 0)
  return Math.min(100, props.passportStart + delta)
})

interface Gauge {
  id: 'hs' | 'mr' | 'pp'
  emoji: string
  label: string
  sub: string
  target: number
  max: number
  suffix: string
  gradFrom: string
  gradTo: string
  animatedValue: number
}

const gauges = ref<Gauge[]>([
  {
    id: 'hs',
    emoji: '⚡',
    label: 'HomeScore',
    sub: 'Energy',
    target: props.homeScore,
    max: 100,
    suffix: '',
    gradFrom: '#5EEAD4',
    gradTo: '#00B8B0',
    animatedValue: 0,
  },
  {
    id: 'mr',
    emoji: '📋',
    label: 'Move Ready',
    sub: 'Docs & certs',
    target: moveReadyPct.value,
    max: 100,
    suffix: '%',
    gradFrom: '#FFD58A',
    gradTo: '#FF9F43',
    animatedValue: 0,
  },
  {
    id: 'pp',
    emoji: '🪪',
    label: 'Passport',
    sub: 'Ownership',
    target: passportPct.value,
    max: 100,
    suffix: '%',
    // Passport ring uses white so it reads as a neutral "completion"
    // metric — distinct from Move Ready (amber) without competing with
    // HomeScore (teal) for tone weight on the dark navy card.
    gradFrom: '#ffffff',
    gradTo: '#e5e7eb',
    animatedValue: 0,
  },
])

function animateGauge(idx: number, to: number) {
  const start = gauges.value[idx].animatedValue
  const duration = 900
  const t0 = performance.now()
  const tick = (now: number) => {
    const t = Math.min((now - t0) / duration, 1)
    const ease = 1 - Math.pow(1 - t, 3)
    gauges.value[idx].animatedValue = start + (to - start) * ease
    if (t < 1) requestAnimationFrame(tick)
    else gauges.value[idx].animatedValue = to
  }
  requestAnimationFrame(tick)
}

onMounted(() => {
  animateGauge(0, props.homeScore)
  animateGauge(1, moveReadyPct.value)
  animateGauge(2, passportPct.value)
})

watch(moveReadyPct, (v) => {
  gauges.value[1].target = v
  animateGauge(1, v)
})
watch(passportPct, (v) => {
  gauges.value[2].target = v
  animateGauge(2, v)
})

// ── Upload drawer ───────────────────────────────────────────────
const uploadDrawerOpen = ref(false)
const activeDocId = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const activeDoc = computed(
  () => docs.find((d) => d.id === activeDocId.value) || null,
)

function onAddDoc(id: string) {
  if (uploadedDocs.value.includes(id)) return
  activeDocId.value = id
  selectedFile.value = null
  uploadDrawerOpen.value = true
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

function onUploadClose() {
  uploadDrawerOpen.value = false
  selectedFile.value = null
  activeDocId.value = null
}

function confirmUpload() {
  if (!selectedFile.value) {
    fileInputRef.value?.click()
    return
  }
  const id = activeDocId.value
  if (id && !uploadedDocs.value.includes(id)) {
    // Mark the doc uploaded — this lifts the Move Ready / Passport gauges.
    // (Server-side file upload endpoint to be wired when available.)
    uploadedDocs.value = [...uploadedDocs.value, id]
    const doc = docs.find((d) => d.id === id)
    if (doc) celebrateDoc.value = doc
  }
  onUploadClose()
}

// ── One-question-at-a-time flow + celebration overlay ───────────
// `currentDoc` is the next unuploaded doc; renders alone in the upload
// section so the user can only act on one thing at a time. Completed
// docs render above it as muted "✓ Verified" rows so the user can see
// their progress. Future docs stay hidden until their turn.
const currentDoc = computed(
  () => docs.find((d) => !uploadedDocs.value.includes(d.id)) ?? null,
)
const completedDocs = computed(() =>
  docs.filter((d) => uploadedDocs.value.includes(d.id)),
)
// Tracks the doc to celebrate right after upload. Null = overlay closed.
const celebrateDoc = ref<(typeof docs)[number] | null>(null)
const isLastDoc = computed(
  () => uploadedDocs.value.length === docs.length && !!celebrateDoc.value,
)

// Per-doc impact copy — describes what THIS upload verifies beyond the
// numeric uplift, so the user reads concrete value, not just a percentage.
const docImpacts: Record<string, string> = {
  bills:
    "We'll cross-check your real spend against your EPC estimate — buyers see the verified figure, not the public one.",
  gas: 'Annual gas safety is on file. Required for any rental and reassures buyers the appliances are checked.',
  eicr: 'Electrical Installation Condition Report verified — covers a survey question solicitors flag every time.',
  boiler:
    'Boiler service history locked in. Tells buyers the heating system is maintained and recent.',
}
const celebrateImpact = computed(() => {
  const id = celebrateDoc.value?.id
  return (
    (id && docImpacts[id]) ||
    'Document verified and locked into your Property Passport.'
  )
})

// Fireworks for the celebration. Lifetime is bounded by the overlay
// (cleared when the user dismisses or after 6s for the visual ones).
interface BcvFwParticle {
  tx: number
  ty: number
}
interface BcvFw {
  left: number
  top: number
  color: string
  delay: number
  particles: BcvFwParticle[]
}
const bcvFwColors = [
  '#00b8b0',
  '#f0a030',
  '#7c6fb0',
  '#ffd54a',
  '#ff5e7e',
  '#5eead4',
]
const celebrateFireworks = ref<BcvFw[]>([])
let celebrateTimer: ReturnType<typeof setTimeout> | null = null

watch(celebrateDoc, (val) => {
  if (celebrateTimer) {
    clearTimeout(celebrateTimer)
    celebrateTimer = null
  }
  if (val) {
    celebrateFireworks.value = Array.from({ length: 9 }, () => {
      const count = 18
      const baseR = 90 + Math.random() * 50
      const particles = Array.from({ length: count }, (_, j) => {
        const ang = (Math.PI * 2 * j) / count + Math.random() * 0.2
        const r = baseR + Math.random() * 20
        return { tx: Math.cos(ang) * r, ty: Math.sin(ang) * r + 20 }
      })
      return {
        left: 10 + Math.random() * 80,
        top: 8 + Math.random() * 50,
        color: bcvFwColors[Math.floor(Math.random() * bcvFwColors.length)],
        delay: Math.random() * 1800,
        particles,
      }
    })
    celebrateTimer = setTimeout(() => {
      celebrateFireworks.value = []
    }, 6000)
  } else {
    celebrateFireworks.value = []
  }
})

onBeforeUnmount(() => {
  if (celebrateTimer) clearTimeout(celebrateTimer)
})

function dismissCelebrate() {
  celebrateDoc.value = null
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<style scoped>
.hs-v6-boost {
  --primary: #231d45;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-light: #00b8b0;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --page: #f0f2f8;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}

/* Header */
.boost-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.boost-back,
.boost-help {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--card);
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  flex-shrink: 0;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
}
.boost-back svg {
  width: 16px;
  height: 16px;
}
.boost-header-info {
  flex: 1;
  text-align: center;
}
.boost-header-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
}
.boost-header-sub {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 1px;
}

/* Animations */
@keyframes boostFadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes bjGlow {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.06);
    opacity: 0.7;
  }
}
.anim-1 {
  animation: boostFadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.anim-2 {
  animation: boostFadeUp 0.35s 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Journey card */
.boost-journey-card {
  margin: 4px 20px 0;
  padding: 20px 18px 16px;
  background: linear-gradient(140deg, #2d2466 0%, #231d45 55%, #15102e 100%);
  border-radius: 18px;
  color: white;
  box-shadow: 0 16px 36px -10px rgba(35, 29, 69, 0.45);
  position: relative;
  overflow: hidden;
}
.boost-journey-card::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -25%;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 193, 89, 0.18) 0%,
    transparent 65%
  );
  pointer-events: none;
  animation: bjGlow 6s ease-in-out infinite;
}
.boost-journey-card > * {
  position: relative;
  z-index: 1;
}
.boost-journey-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.boost-journey-eyebrow {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.boost-journey-update {
  font-size: 10.5px;
  font-weight: 700;
  color: white;
  padding: 3px 9px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 100px;
}

/* Gauges */
.boost-gauges-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
}
.boost-gauge-col {
  text-align: center;
  padding: 6px 0 2px;
  transition: transform 0.15s;
}
.boost-gauge-col:hover {
  transform: translateY(-2px);
}
/* .gauge-emoji {
  font-size: 16px;
  line-height: 1;
  margin-bottom: 8px;
  opacity: 0.9;
} */
.boost-gauge-ring {
  position: relative;
  width: 88px;
  height: 88px;
  margin: 0 auto;
}
.boost-gauge-ring svg {
  width: 100%;
  height: 100%;
}
.boost-gauge-ring svg circle:last-of-type {
  transition: stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.boost-gauge-ring svg circle:first-of-type {
  stroke: rgba(255, 255, 255, 0.12);
}
.boost-gauge-col.hs .boost-gauge-ring svg circle:last-of-type {
  filter: drop-shadow(0 0 8px rgba(0, 184, 176, 0.65));
}
.boost-gauge-col.mr .boost-gauge-ring svg circle:last-of-type {
  filter: drop-shadow(0 0 9px rgba(255, 179, 71, 0.7));
}
.boost-gauge-col.pp .boost-gauge-ring svg circle:last-of-type {
  filter: drop-shadow(0 0 9px rgba(255, 255, 255, 0.7));
}
.boost-gauge-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.6px;
  color: white;
}
.boost-gauge-num.pct {
  font-size: 20px;
}
.boost-gauge-num span {
  font-size: 0.7em;
  margin-left: 1px;
  opacity: 0.85;
}
.boost-gauge-cat {
  font-size: 9.5px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  margin-top: 10px;
}
.boost-gauge-sub {
  font-size: 9.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}
.boost-journey-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
}
.boost-journey-foot-icon {
  font-size: 16px;
}
.boost-journey-foot-text {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}
.boost-journey-foot-text :deep(b) {
  color: #ffd58a;
  font-weight: 700;
}

/* Section heading */
.boost-section-h {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 20px 20px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.boost-section-h .ico {
  font-size: 12px;
}
.pill-progress {
  margin-left: auto;
  padding: 3px 9px;
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
  border-radius: 100px;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Rows */
.boost-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 20px;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
}
.boost-row:hover {
  border-color: var(--accent-pale);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 161, 154, 0.1);
}
.boost-row.added {
  background: var(--accent-paler);
  border-color: var(--accent-pale);
}
/* The single "current" upload card pulses subtly to draw the user's eye
   to the one thing they need to do next. */
.boost-row--active {
  border-color: var(--accent-pale);
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.18);
  animation: boostActiveGlow 2.4s ease-in-out infinite;
}
@keyframes boostActiveGlow {
  0%,
  100% {
    box-shadow: 0 6px 18px rgba(0, 161, 154, 0.18);
    border-color: var(--accent-pale);
  }
  50% {
    box-shadow:
      0 6px 22px rgba(0, 161, 154, 0.32),
      0 0 0 4px rgba(0, 161, 154, 0.08);
    border-color: rgba(0, 161, 154, 0.5);
  }
}
@media (prefers-reduced-motion: reduce) {
  .boost-row--active {
    animation: none;
  }
}
.boost-row.alldone {
  background: linear-gradient(135deg, #fff6d5, var(--card));
  border: 1.5px solid #ffc107;
}
.boost-row-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.boost-row-icon.yellow {
  background: #fff6d5;
}
.boost-row-icon.amber {
  background: #fce7b5;
}
.boost-row-icon.teal {
  background: var(--accent-paler);
}
.boost-row-icon.green {
  background: #d4f2e0;
}
.boost-row-icon.violet {
  background: #f2ebfd;
}
.boost-row-icon.gold {
  background: linear-gradient(135deg, #ffd700, #ff9500);
  color: white;
}
.boost-row-info {
  flex: 1;
  min-width: 0;
}
.boost-row-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.2;
}
.boost-row-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 3px;
  line-height: 1.45;
}
.boost-row-plus {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 300;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.35);
}
.boost-row-check {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}
.boost-row-chev {
  font-size: 18px;
  color: var(--text-faint);
  flex-shrink: 0;
}

/* Next step card */
.boost-next {
  margin: 18px 20px 0;
  padding: 22px 18px 18px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark) 70%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 12px 30px -8px rgba(0, 161, 154, 0.32);
  position: relative;
  overflow: hidden;
}
.boost-next::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.18) 0%,
    transparent 65%
  );
  pointer-events: none;
}
.boost-next > * {
  position: relative;
  z-index: 1;
}
.boost-next-eyebrow {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 14px;
}
.boost-next-route {
  display: flex;
  align-items: flex-start;
  /* Wide gap so the two rings sit as separate milestones, not jammed
     side-by-side. Matches the visual rhythm of the top journey card. */
  gap: 56px;
  margin-bottom: 18px;
  justify-content: center;
}
.boost-next-ring {
  position: relative;
  width: 90px;
  text-align: center;
}
.boost-next-ring svg {
  width: 90px;
  height: 90px;
  display: block;
  transform: rotate(-90deg);
}
.boost-next-ring-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.22);
  stroke-width: 6;
}
.boost-next-ring-fill {
  fill: none;
  stroke: #ffffff;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 238.76;
  transition: stroke-dashoffset 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.55));
}
.boost-next-ring-num {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
  font-feature-settings: 'tnum';
}
.boost-next-ring-num .pct {
  font-size: 14px;
  font-weight: 700;
  opacity: 0.85;
  margin-left: 1px;
}
.boost-next-ring-label {
  margin-top: 6px;
  font-size: 9.5px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 1.1px;
  text-transform: uppercase;
}
.boost-next-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.4px;
  line-height: 1.2;
}
.boost-next-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 8px;
  line-height: 1.55;
}
.boost-next-cta {
  display: flex;
  width: 100%;
  padding: 14px 16px;
  margin-top: 14px;
  border: none;
  background: white;
  color: var(--accent-dark);
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
}

/* Upload drawer body (rendered inside BaseDrawer) */
.bd-upload {
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-paler: #f2faf8;
  --accent-pale: #e5f4f2;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
}
.bd-upload-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.bd-upload-ico {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.bd-upload-ico.yellow {
  background: #fff6d5;
}
.bd-upload-ico.amber {
  background: #fce7b5;
}
.bd-upload-ico.teal {
  background: var(--accent-paler);
}
.bd-upload-ico.violet {
  background: #f2ebfd;
}
.bd-upload-sub {
  flex: 1;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.45;
}
.bd-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
  padding: 28px 18px;
  border: 2px dashed var(--border);
  border-radius: 14px;
  background: #fafbfd;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.bd-dropzone:hover {
  border-color: var(--accent);
}
.bd-dropzone.has-file {
  border-style: solid;
  border-color: var(--accent);
  background: var(--accent-paler);
}
.bd-dropzone-input {
  display: none;
}
.bd-dropzone-icon {
  font-size: 30px;
  line-height: 1;
}
.bd-dropzone-title {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
  word-break: break-word;
}
.bd-dropzone-meta {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-faint);
}
.bd-dropzone-tap {
  color: var(--accent-dark);
  font-weight: 700;
}
.bd-upload-note {
  margin-top: 14px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.bd-upload-cta {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
  transition: filter 0.15s;
}
.bd-upload-cta:hover:not(:disabled) {
  filter: brightness(1.06);
}
.bd-upload-cta:disabled {
  opacity: 0.55;
  cursor: default;
}

/* ── Per-upload celebration overlay ──────────────────────────────
   Fires after every successful upload. Fireworks burst behind a card
   that shows the points won + what this document actually verifies.
   The user dismisses to reveal the next question. */
.bcv-overlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 20px;
  overflow: hidden;
  font-family: inherit;
}
.bcv-fw-host {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.bcv-fw {
  position: absolute;
  width: 0;
  height: 0;
}
.bcv-fw-particle {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  opacity: 0;
  animation: bcvFwBurst 1800ms cubic-bezier(0.12, 0.65, 0.35, 1) infinite;
  will-change: transform, opacity;
}
@keyframes bcvFwBurst {
  0% {
    transform: translate(0, 0) scale(0.5);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0.2);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .bcv-fw-particle {
    animation: none;
  }
}
/* The overlay teleports to <body>, so it sits outside .hs-v6-boost and
   the component-level CSS variables (--accent, --text, etc.) don't
   cascade. Use literal hex values inside .bcv-* so the styles render
   correctly regardless of mount point. */
.bcv-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 22rem;
  background: #fff;
  border-radius: 22px;
  padding: 24px 22px 18px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.45);
  color: #231d45;
}
.bcv-ico {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  font-size: 28px;
}
.bcv-ico.yellow {
  background: #fff6d5;
}
.bcv-ico.amber {
  background: #fce7b5;
}
.bcv-ico.teal {
  background: #f2faf8;
}
.bcv-ico.violet {
  background: #f2ebfd;
}
.bcv-ico.green {
  background: #d4f2e0;
}
.bcv-eyebrow {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #00a19a;
  margin-bottom: 6px;
}
.bcv-headline {
  font-size: 24px;
  font-weight: 900;
  color: #231d45;
  letter-spacing: -0.4px;
  line-height: 1.15;
}
.bcv-subhead {
  font-size: 14px;
  font-weight: 800;
  color: #b07afe;
  margin-top: 2px;
}
.bcv-doc-label {
  font-size: 13px;
  font-weight: 700;
  color: #6b7089;
  margin: 10px 0 8px;
}
.bcv-impact {
  font-size: 12.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.55;
  margin-bottom: 18px;
}
.bcv-continue {
  width: 100%;
  border: none;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #ffffff !important;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  letter-spacing: -0.1px;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.bcv-continue:hover {
  filter: brightness(1.06);
}
</style>
