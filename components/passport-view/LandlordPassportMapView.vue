<template>
  <div class="map-view">
    <!-- Filter tabs — All / In Progress / Done / To Do -->
    <div class="map-filter-tabs">
      <button
        v-for="f in filters"
        :key="f.value"
        class="map-filter-tab"
        :class="{ active: activeFilter === f.value }"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
        <span class="map-filter-count">{{ f.count }}</span>
      </button>
    </div>

    <!-- Currently viewing card — reflects the last step the user tapped
         (or the next incomplete one by default) -->
    <div class="map-now-card" v-if="currentStep">
      <div class="map-now-eyebrow">Currently viewing</div>
      <div class="map-now-row">
        <div class="map-now-icon">
          <img
            :src="iconUrlForSection(currentStep.key)"
            :alt="currentStep.title"
            class="map-now-icon-img"
          />
        </div>
        <div class="map-now-body">
          <div class="map-now-title">{{ toSmartTitleCase(currentStep.title) }}</div>
          <div class="map-now-meta">
            {{ currentStepCompletedTasks }}/{{
              currentStep.tasks?.length ?? 0
            }}
            tasks · {{ getStepCompletion(currentStep) }}% complete
          </div>
        </div>
        <button class="map-now-cta" @click="openStep(currentStep)">
          View tasks
        </button>
      </div>
    </div>

    <div class="map-content">
      <div class="map-placeholder">
        <div class="isometric-map">
          <div
            v-for="(decoration, index) in decorativeObjects"
            :key="`decoration-${index}-${decoration.icon}`"
            class="map-decoration"
            :style="getDecorationStyle(decoration)"
          >
            <OPIcon :name="decoration.icon" class="decoration-icon" />
          </div>

          <div class="moving-lady" :style="ladyPosition">
            <OPIcon name="walkingLady" class="lady-icon" />
          </div>

          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="map-step"
            :class="{
              'map-step-dim': !matchesFilter(step),
              'map-step-active': currentStepId === step.id,
            }"
            :style="getStepPosition(index)"
          >
            <!-- Road connector above the step -->
            <div
              v-if="index > 0"
              class="road-connector"
              :class="getRoadClass(index)"
            >
              <OPIcon :name="getRoadIcon(index)" class="road-icon" />
            </div>

            <!-- Step platform with status-based visuals -->
            <div
              class="step-platform"
              :class="getStepStatusClass(step)"
              @click="onStepClick(step)"
            >
              <OPIcon name="mapBackgroundTile" class="map-shadow-tile" />
              <OPIcon name="mapBackgroundTile" class="map-background-tile" />
              <div class="step-illustration">
                <img
                  :src="iconUrlForSection(step.key)"
                  :alt="step.title"
                  class="step-icon-art"
                />
              </div>

              <!-- Completion ring (prototype-matching): white circle with
                   teal stroke arc + % text or ✓ in the centre -->
              <div class="map-step-ring">
                <svg viewBox="0 0 30 30">
                  <circle class="map-step-ring-bg" cx="15" cy="15" r="12" />
                  <circle
                    class="map-step-ring-fg"
                    :class="{
                      'map-step-ring-fg--done': getStepCompletion(step) >= 100,
                    }"
                    cx="15"
                    cy="15"
                    r="12"
                    stroke-dasharray="75.4"
                    :stroke-dashoffset="
                      75.4 -
                      (Math.min(100, getStepCompletion(step)) / 100) * 75.4
                    "
                  />
                </svg>
                <div
                  class="map-step-ring-text"
                  :class="{
                    'map-step-ring-text--done': getStepCompletion(step) >= 100,
                  }"
                >
                  <template v-if="getStepCompletion(step) >= 100">✓</template>
                  <template v-else>{{ getStepCompletion(step) }}%</template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import { toSmartTitleCase } from '~/utils/titleCase'

// Landlord-specific map view. Same isometric path, road connectors,
// decorations and walking lady as the seller's PassportMapView — the
// only differences are:
//   1. `sections` arrive as a prop (the landlord page already owns the
//      passport data; we don't go through usePassportRuntime).
//   2. The step icon is rendered as an <img> pointing at the
//      rental-passport SVG set instead of going via OPIcon's registry.
//   3. The bottom drawer is owned by the parent — we emit 'open-section'
//      with the section so the landlord page can pop its existing
//      section drawer (which handles upload / replace / expiry dates).
const props = defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['open-section'])

const steps = computed(() => props.sections ?? [])

// ── Icon mapping ─────────────────────────────────────────────────
// Same heuristic as the landlord page so list and map view show the
// same emblem for each section.
function iconSlugForSection(key) {
  const k = (key || '').toLowerCase()
  if (k.includes('gas')) return 'gas-safety'
  if (k.includes('eicr') || k.includes('electric') || k.includes('pat'))
    return 'electrical-safety'
  if (k.includes('epc') || k.includes('energy')) return 'energy-performance'
  if (k.includes('alarm') || k.includes('smoke') || k.includes('co_'))
    return 'smoke-co-alarms'
  if (k.includes('legionella')) return 'legionella'
  if (k.includes('insurance')) return 'landlord-insurance'
  if (k.includes('deposit')) return 'deposit-protection'
  if (k.includes('right_to_rent') || k.includes('rtr')) return 'right-to-rent'
  if (k.includes('how_to_rent')) return 'how-to-rent'
  if (k.includes('inventory')) return 'inventory'
  if (k.includes('ast') || k.includes('tenancy')) return 'tenancy-agreement'
  return 'tenancy-agreement'
}
// Reuse existing 3D isometric icons from elsewhere in the app (plus a
// purpose-generated one for smoke-co-alarms) so these match the look of
// the buyer/seller passport section icons. Any slug without an entry
// here falls back to the old flat SVG set.
const SECTION_ICON_URLS = {
  'gas-safety': '/op-icons/landlordPassport/gasSafetyCertificate.png',
  'electrical-safety': '/op-icons/landlordPassport/electricalSafety.png',
  'energy-performance': '/op-icons/landlordPassport/epc.png',
  'smoke-co-alarms': '/op-icons/landlordPassport/smokeCOAlarms.png',
  legionella: '/op-icons/landlordPassport/legionellaRiskAssessment.png',
  'landlord-insurance': '/op-icons/landlordPassport/landlordInsurance.png',
  'deposit-protection': '/op-icons/landlordPassport/depositProtection.png',
  'right-to-rent': '/op-icons/landlordPassport/rightToRent.png',
  'how-to-rent': '/op-icons/misc/book.png',
  inventory: '/op-icons/landlordPassport/inventory.png',
  'tenancy-agreement': '/op-icons/landlordPassport/tenancyAgreement.png',
}
function iconUrlForSection(key) {
  const slug = iconSlugForSection(key)
  return SECTION_ICON_URLS[slug] ?? `/op-icons/rental-passport/freestanding/${slug}.svg`
}

// ── Filter tabs ─────────────────────────────────────────────────
const activeFilter = ref('all')
const filters = computed(() => {
  const inProgress = steps.value.filter((s) => {
    const c = getStepCompletion(s)
    return c > 0 && c < 100
  }).length
  const done = steps.value.filter((s) => getStepCompletion(s) >= 100).length
  const todo = steps.value.filter((s) => getStepCompletion(s) === 0).length
  return [
    { value: 'all', label: 'All', count: steps.value.length },
    { value: 'in-progress', label: 'In Progress', count: inProgress },
    { value: 'done', label: 'Done', count: done },
    { value: 'todo', label: 'To Do', count: todo },
  ]
})
function matchesFilter(step) {
  const c = getStepCompletion(step)
  if (activeFilter.value === 'in-progress') return c > 0 && c < 100
  if (activeFilter.value === 'done') return c >= 100
  if (activeFilter.value === 'todo') return c === 0
  return true
}

// ── Currently viewing — defaults to first incomplete step ───────
const currentStepId = ref(null)
const currentStep = computed(() => {
  if (currentStepId.value) {
    return steps.value.find((s) => s.id === currentStepId.value) || null
  }
  return (
    steps.value.find((s) => getStepCompletion(s) < 100) ||
    steps.value[0] ||
    null
  )
})
const currentStepCompletedTasks = computed(
  () => currentStep.value?.tasks?.filter((t) => t.completed).length ?? 0,
)

function onStepClick(step) {
  currentStepId.value = step.id
  openStep(step)
}
function openStep(step) {
  if (step) emit('open-section', step)
}

watch(steps, (next) => {
  // Keep currentStepId valid as data refreshes
  if (currentStepId.value && !next.find((s) => s.id === currentStepId.value)) {
    currentStepId.value = null
  }
})

const mapLayout = {
  rightOffsetX: 165,
  leftOffsetX: '-20',
  stepGapY: '-31',
}

const decorativeObjects = [
  { icon: 'tree', x: 18, y: 90 },
  { icon: 'lampPost', x: 198, y: 294 },
  { icon: 'dog', x: 22, y: 300 },
  { icon: 'post', x: 124, y: 391, z: 7 },
  { icon: 'tree', x: 195, y: 506 },
  { icon: 'orangeDog', x: 169, y: 531 },
  { icon: 'tree', x: 111, y: 629, z: 7 },
  { icon: 'lampPost', x: 254, y: 626 },
  { icon: 'post', x: 150, y: 745, z: 7 },
  { icon: 'tree', x: 110, y: 850 },
  { icon: 'postInverted', x: 113, y: 1056, z: 7 },
]

const getStepPosition = (index) => {
  const row = index
  const isRight = index % 2 === 0
  const offsetX = isRight ? mapLayout.rightOffsetX : mapLayout.leftOffsetX
  const offsetY = row * mapLayout.stepGapY

  return {
    left: `${offsetX}px`,
    top: `${offsetY}px`,
  }
}

const getStepStatusClass = (step) => {
  const completion = getSectionCompletion(step)
  if (completion >= 100) return 'status-completed'
  if (completion > 0) return 'status-active'
  return 'status-pending'
}

const getSectionCompletion = (step) => {
  if (!step?.tasks?.length) {
    return Number(step?.progress) || 0
  }

  const stats = step.tasks.reduce(
    (acc, task) => {
      const totalQuestions =
        Number(task?.totalQuestions) ||
        (Array.isArray(task?.passportQuestions)
          ? task.passportQuestions.length
          : 0)
      const answeredQuestions =
        Number(task?.answeredQuestions) ||
        (Array.isArray(task?.passportQuestions)
          ? task.passportQuestions.filter((q) => q?.answer).length
          : 0)

      acc.totalQuestions += totalQuestions
      acc.answeredQuestions += Math.min(answeredQuestions, totalQuestions)

      if (task?.completed) {
        acc.completedTasks += 1
      }

      return acc
    },
    { totalQuestions: 0, answeredQuestions: 0, completedTasks: 0 },
  )

  if (stats.totalQuestions > 0) {
    return Math.round((stats.answeredQuestions / stats.totalQuestions) * 100)
  }

  return Math.round((stats.completedTasks / step.tasks.length) * 100)
}

const getRoadIcon = (index) => {
  const isCurrentRight = index % 2 === 0
  const isPrevRight = (index - 1) % 2 === 0

  if (isPrevRight && !isCurrentRight) return 'roadRightToLeft'
  if (!isPrevRight && isCurrentRight) return 'roadLeftToRight'
  return 'roadLeftToRight'
}

const getRoadClass = (index) => {
  const isCurrentRight = index % 2 === 0
  const isPrevRight = (index - 1) % 2 === 0

  if (isPrevRight && !isCurrentRight) return 'road-right-to-left'
  if (!isPrevRight && isCurrentRight) return 'road-left-to-right'
  return 'road-left-to-right'
}

const getDecorationStyle = (decoration) => ({
  left: `${decoration.x}px`,
  top: `${decoration.y}px`,
  '--decoration-size': `${decoration.size || 48}px`,
  '--decoration-z': `${decoration.z || 12}`,
})

const getStepCompletion = (step) => getSectionCompletion(step)

const ladyStepIndex = computed(() => {
  if (!steps.value.length) return 0
  const firstIncomplete = steps.value.findIndex(
    (step) => getStepCompletion(step) < 100,
  )
  return firstIncomplete === -1 ? steps.value.length - 1 : firstIncomplete
})

const ladyPosition = computed(() => {
  if (!steps.value.length) {
    return { left: '0px', top: '0px' }
  }

  const index = Math.min(ladyStepIndex.value, steps.value.length - 1)
  const isRight = index % 2 === 0
  const stepTop = index * mapLayout.stepGapY
  const stepLeft = isRight ? mapLayout.rightOffsetX : mapLayout.leftOffsetX

  if (index === 0) {
    return {
      left: `${stepLeft + 46}px`,
      top: `${stepTop + 58}px`,
    }
  }

  return {
    left: `${isRight ? stepLeft - 12 : stepLeft + 104}px`,
    top: `${stepTop - 26}px`,
  }
})
</script>

<style scoped>
.map-view {
  width: 100%;
  min-height: 400px;
}

.map-content {
  width: 100%;
}

.map-placeholder {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  border-radius: 16px;
  padding: 40px 20px;
  min-height: 500px;
}

.isometric-map {
  position: relative;
  width: 300px;
  min-height: 2300px;
  margin: 0 auto;
}

.map-step {
  position: absolute;
  width: 140px;
  transition: all 0.3s ease;
}

.map-decoration {
  position: absolute;
  width: var(--decoration-size, 48px);
  height: var(--decoration-size, 48px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--decoration-z, 12);
  opacity: 0.92;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.12));
  pointer-events: none;
}

.decoration-icon {
  width: 100%;
  height: 100%;
}

.moving-lady {
  position: absolute;
  width: 48px;
  height: 48px;
  z-index: 13;
  pointer-events: none;
  transition:
    left 0.35s ease,
    top 0.35s ease;
}

.lady-icon {
  width: 48px;
  height: 48px;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.2));
}

.step-platform {
  width: 140px;
  height: 140px;
  cursor: pointer;
  position: relative;
  overflow: visible;
  transition:
    transform 0.25s ease,
    filter 0.25s ease;
  z-index: 9;
}

.step-platform::before {
  display: none;
}

.step-platform:hover {
  transform: translateY(-3px) scale(1.03);
}

.map-background-tile {
  width: 200px !important;
  height: 200px !important;
  max-width: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  transition: filter 0.25s ease;
}

.map-shadow-tile {
  width: 200px !important;
  height: 200px !important;
  max-width: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  opacity: 0.95;
  filter: drop-shadow(0 8px 14px rgba(107, 114, 128, 0.28));
  transition: filter 0.25s ease;
}

.step-illustration {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  pointer-events: none;
}

.step-icon-art {
  width: 80px;
  height: 80px;
  transform: none;
  filter: drop-shadow(0 8px 10px rgba(0, 0, 0, 0.15));
  object-fit: contain;
}

.step-platform.status-completed .map-shadow-tile {
  filter: drop-shadow(0 8px 14px rgba(0, 212, 195, 0.5))
    drop-shadow(0 0 12px rgba(59, 245, 228, 0.5));
}

.step-platform.status-completed .map-background-tile {
  filter: saturate(1.2);
}

.step-platform.status-active .map-shadow-tile {
  filter: drop-shadow(0 8px 14px rgba(245, 158, 11, 0.55))
    drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
}

.step-platform.status-active .map-background-tile {
  filter: saturate(1.08);
}

.step-platform.status-pending .map-shadow-tile {
  filter: drop-shadow(0 8px 12px rgba(239, 68, 68, 0.55))
    drop-shadow(0 0 10px rgba(248, 113, 113, 0.5));
}

.step-platform.status-pending .map-background-tile {
  filter: saturate(1.02) brightness(0.98);
}

/* Road connector styling */
.road-connector {
  position: absolute;
  top: -19px;
  width: 150px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

.road-connector.road-left-to-right {
  left: -95px;
}

.road-connector.road-right-to-left {
  right: -94px;
}

.road-icon {
  width: 150px;
  height: 80px;
  object-fit: contain;
}

/* ── Filter tabs ──────────────────────────────────────────────── */
.map-filter-tabs {
  display: flex;
  gap: 6px;
  padding: 8px 0 12px;
  overflow-x: auto;
  justify-content: center;
  -webkit-overflow-scrolling: touch;
}
.map-filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid #eef0f6;
  background: #fff;
  color: #4a5568;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
}
.map-filter-tab:hover {
  border-color: #e2f1ea;
}
.map-filter-tab.active {
  background: #00a19a;
  color: #fff;
  border-color: #00a19a;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.28);
}
.map-filter-count {
  font-size: 10.5px;
  font-weight: 800;
  background: rgba(0, 161, 154, 0.12);
  color: #00a19a;
  padding: 1px 7px;
  border-radius: 999px;
}
.map-filter-tab.active .map-filter-count {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

/* ── Currently viewing card ──────────────────────────────────── */
.map-now-card {
  background: linear-gradient(135deg, #f4fbfa, #fff);
  border: 1px solid #e2f1ea;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.06);
}
.map-now-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 6px;
}
.map-now-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.map-now-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #00a19a;
  overflow: hidden;
}
.map-now-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.map-now-body {
  flex: 1;
  min-width: 0;
}
.map-now-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.map-now-meta {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
}
.map-now-cta {
  border: none;
  background: #00a19a;
  color: #fff;
  border-radius: 9px;
  padding: 7px 12px;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.28);
}

/* ── Step pin badge (% / ✓) ──────────────────────────────────── */
.map-step {
  position: relative;
  transition: opacity 0.2s ease;
}
.map-step-dim {
  opacity: 0.32;
  pointer-events: none;
}
.map-step-active .step-platform {
  filter: drop-shadow(0 6px 14px rgba(0, 161, 154, 0.35));
}
.map-step-ring {
  position: absolute;
  top: 50px;
  right: -25px;
  width: 41px;
  height: 41px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 5;
  pointer-events: none;
}
.map-step-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  display: block;
}
.map-step-ring-bg {
  fill: #fff;
  stroke: #eef0f6;
  stroke-width: 3;
}
.map-step-ring-fg {
  fill: none;
  stroke: #00a19a;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}
.map-step-ring-fg--done {
  stroke: #008a84;
}
.map-step-ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9.5px;
  font-weight: 800;
  color: #00a19a;
}
.map-step-ring-text--done {
  color: #008a84;
  font-size: 14px;
}
</style>
