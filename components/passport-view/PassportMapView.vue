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
          <OPIcon
            :name="currentStep.icon || currentStep.key"
            class="w-[24px] h-[24px]"
          />
        </div>
        <div class="map-now-body">
          <div class="map-now-title">{{ currentStep.title }}</div>
          <div class="map-now-meta">
            {{ currentStepCompletedTasks }}/{{
              currentStep.tasks?.length ?? 0
            }}
            tasks · {{ getStepCompletion(currentStep) }}% complete
          </div>
        </div>
        <button class="map-now-cta" @click="openStepDrawer(currentStep)">
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
                <OPIcon :name="step.icon || step.key" class="step-icon-art" />
              </div>

              <!-- Completion badge — % ring or ✓ when done -->
              <div class="map-step-badge" :class="getStepBadgeClass(step)">
                <template v-if="getStepCompletion(step) >= 100"> ✓ </template>
                <template v-else> {{ getStepCompletion(step) }}% </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom drawer — appears when a step is tapped, lists its tasks -->
    <Teleport to="body">
      <div
        v-if="drawerStep"
        class="map-drawer-overlay"
        @click.self="drawerStep = null"
      >
        <div class="map-drawer">
          <div class="map-drawer-handle" />
          <div class="map-drawer-head">
            <div class="map-drawer-icon">
              <OPIcon
                :name="drawerStep.icon || drawerStep.key"
                class="w-[28px] h-[28px]"
              />
            </div>
            <div class="map-drawer-titles">
              <div class="map-drawer-title">{{ drawerStep.title }}</div>
              <div class="map-drawer-sub">
                {{ getStepCompletion(drawerStep) }}% complete ·
                {{ drawerStep.tasks?.length ?? 0 }} tasks
              </div>
            </div>
            <button
              class="map-drawer-close"
              aria-label="Close"
              @click="drawerStep = null"
            >
              ×
            </button>
          </div>
          <div class="map-drawer-bar">
            <div
              class="map-drawer-bar-fill"
              :style="{ width: getStepCompletion(drawerStep) + '%' }"
            />
          </div>
          <div class="map-drawer-tasks">
            <button
              v-for="task in drawerStep.tasks ?? []"
              :key="task.id"
              class="map-drawer-task"
              :class="{
                'map-drawer-task--done': task.completed,
                'map-drawer-task--progress':
                  !task.completed && Number(task.answeredQuestions) > 0,
              }"
              @click="goToTask(drawerStep, task)"
            >
              <div class="map-drawer-task-status">
                <template v-if="task.completed">✓</template>
                <template v-else-if="Number(task.answeredQuestions) > 0">
                  {{ task.answeredQuestions }}/{{ task.totalQuestions || '?' }}
                </template>
                <template v-else>○</template>
              </div>
              <div class="map-drawer-task-body">
                <div class="map-drawer-task-title">{{ task.title }}</div>
                <div
                  v-if="task.completed"
                  class="map-drawer-task-meta map-drawer-task-meta--done"
                >
                  Done
                </div>
                <div
                  v-else-if="Number(task.answeredQuestions) > 0"
                  class="map-drawer-task-meta map-drawer-task-meta--progress"
                >
                  In progress
                </div>
                <div v-else class="map-drawer-task-meta">To do</div>
              </div>
              <span class="map-drawer-task-chev">›</span>
            </button>
            <div
              v-if="!(drawerStep.tasks ?? []).length"
              class="map-drawer-empty"
            >
              No tasks in this section yet.
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { usePassportRuntime } from '~/composables/usePassportRuntime'
import OPIcon from '~/components/ui/OPIcon.vue'
import { useRoute, useRouter } from 'vue-router'

const { steps } = usePassportRuntime()
const route = useRoute()
const router = useRouter()

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

// Pin badge tone — done = green, in-progress = brand, todo = grey
function getStepBadgeClass(step) {
  const c = getStepCompletion(step)
  if (c >= 100) return 'map-step-badge--done'
  if (c > 0) return 'map-step-badge--progress'
  return 'map-step-badge--todo'
}

// ── Bottom drawer ──────────────────────────────────────────────
const drawerStep = ref(null)
function onStepClick(step) {
  currentStepId.value = step.id
  drawerStep.value = step
}
function openStepDrawer(step) {
  drawerStep.value = step
}
function goToTask(step, task) {
  const propertyId = route.params.id
  if (!propertyId || !task?.id) return
  router.push(
    `/passportview/steps/tasks/${task.id}?stepId=${step.id}&propertyId=${propertyId}`,
  )
}

watch(steps, (next) => {
  // Keep currentStepId valid as data refreshes
  if (currentStepId.value && !next.find((s) => s.id === currentStepId.value)) {
    currentStepId.value = null
  }
})

const mapLayout = {
  rightOffsetX: 185,
  leftOffsetX: 0,
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
  // { icon: 'dog', x: 248, y: 844 },
  { icon: 'postInverted', x: 113, y: 1056, z: 7 },
  // { icon: 'tree', x: 20, y: 1130 },
  { icon: 'lampPost', x: 135, y: 1237 },
  { icon: 'tree', x: 189, y: 1367, z: 7 },
  // { icon: 'orangeDog', x: 22, y: 1460 },
  // { icon: 'tree', x: 250, y: 1565 },
  { icon: 'postInverted', x: 152, y: 1586, z: 7 },
  { icon: 'lampPost', x: 56, y: 1673 },
  // { icon: 'dog', x: 250, y: 1870 },
  { icon: 'tree', x: 174, y: 1777 },
  // { icon: 'post', x: 150, y: 2065, z: 7 },
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

  if (completion >= 100) {
    return 'status-completed'
  }

  if (completion > 0) {
    return 'status-active'
  }

  return 'status-pending'
}

const getSectionCompletion = (step) => {
  if (!step?.tasks?.length) {
    return Number(step?.progress) || 0
  }

  const stats = step.tasks.reduce(
    (acc, task) => {
      const totalQuestions = Number(task?.totalQuestions) || 0
      const answeredQuestions = Number(task?.answeredQuestions) || 0

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
  // Roads should connect from previous step to current step
  // If current step is on right (even index), road should go left-to-right
  // If current step is on left (odd index), road should go right-to-left
  const isCurrentRight = index % 2 === 0
  const isPrevRight = (index - 1) % 2 === 0

  // Determine direction based on positions
  if (isPrevRight && !isCurrentRight) {
    // From right to left
    return 'roadRightToLeft'
  } else if (!isPrevRight && isCurrentRight) {
    // From left to right
    return 'roadLeftToRight'
  }
  // Default fallback
  return 'roadLeftToRight'
}

const getRoadClass = (index) => {
  const isCurrentRight = index % 2 === 0
  const isPrevRight = (index - 1) % 2 === 0

  if (isPrevRight && !isCurrentRight) {
    return 'road-right-to-left'
  } else if (!isPrevRight && isCurrentRight) {
    return 'road-left-to-right'
  }
  return 'road-left-to-right'
}

const getDecorationStyle = (decoration) => {
  return {
    left: `${decoration.x}px`,
    top: `${decoration.y}px`,
    '--decoration-size': `${decoration.size || 48}px`,
    '--decoration-z': `${decoration.z || 12}`,
  }
}

const getStepCompletion = (step) => getSectionCompletion(step)

const ladyStepIndex = computed(() => {
  if (!steps.value.length) {
    return 0
  }

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

const navigateToStep = (stepId) => {
  const propertyId = route.params.id
  if (!propertyId) {
    return
  }

  const section = steps.value.find((item) => item.id === stepId)
  const targetTask = section?.tasks?.find((task) => !task.completed)
  const fallbackTask = section?.tasks?.[0]
  const targetTaskId = targetTask?.id || fallbackTask?.id

  if (targetTaskId) {
    router.push(
      `/passportview/steps/tasks/${targetTaskId}?stepId=${stepId}&propertyId=${propertyId}`,
    )
    return
  }

  router.push(`/passportview/steps/${stepId}?propertyId=${propertyId}`)
}
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
  /* overflow-x: auto; */
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

/* ── Filter tabs (All / In Progress / Done / To Do) ──────────── */
.map-filter-tabs {
  display: flex;
  gap: 6px;
  padding: 8px 0 12px;
  overflow-x: auto;
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
  border-color: #b2e8e6;
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
  color: #008c86;
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
  border: 1px solid #b2e8e6;
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
  color: #008c86;
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
  background: #eafaf9;
  border: 1px solid #b2e8e6;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #008c86;
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
.map-step-badge {
  position: absolute;
  top: 60px;
  right: 12px;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  display: grid;
  place-items: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(35, 29, 69, 0.18);
  z-index: 5;
  pointer-events: none;
}
.map-step-badge--done {
  background: #16a34a;
}
.map-step-badge--progress {
  background: #00a19a;
}
.map-step-badge--todo {
  background: #94a3b8;
}

/* ── Bottom drawer ───────────────────────────────────────────── */
.map-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.45);
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.map-drawer {
  width: 100%;
  max-width: 28rem;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 14px 20px 24px;
  max-height: 75vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  box-shadow: 0 -8px 32px rgba(35, 29, 69, 0.2);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif;
  color: #231d45;
}
.map-drawer::-webkit-scrollbar {
  display: none;
}
.map-drawer-handle {
  width: 36px;
  height: 4px;
  background: #eef0f6;
  border-radius: 999px;
  margin: 0 auto 14px;
}
.map-drawer-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.map-drawer-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #eafaf9;
  border: 1px solid #b2e8e6;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #008c86;
}
.map-drawer-titles {
  flex: 1;
  min-width: 0;
}
.map-drawer-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
}
.map-drawer-sub {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
}
.map-drawer-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f8f7fc;
  border: none;
  font-size: 18px;
  color: #4a5568;
  cursor: pointer;
  flex-shrink: 0;
}
.map-drawer-bar {
  height: 5px;
  background: #eef0f6;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 14px;
}
.map-drawer-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #008c86, #00b5ad);
  border-radius: 999px;
  transition: width 0.3s ease;
}
.map-drawer-tasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.map-drawer-task {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1.5px solid #eef0f6;
  border-radius: 12px;
  padding: 11px 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  width: 100%;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.map-drawer-task:hover {
  border-color: #b2e8e6;
  background: #f8fafc;
}
.map-drawer-task--done {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.map-drawer-task--progress {
  background: #fffbeb;
  border-color: #fde68a;
}
.map-drawer-task-status {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.map-drawer-task--done .map-drawer-task-status {
  background: #16a34a;
  color: #fff;
}
.map-drawer-task--progress .map-drawer-task-status {
  background: #fef3c7;
  color: #92400e;
}
.map-drawer-task-body {
  flex: 1;
  min-width: 0;
}
.map-drawer-task-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  letter-spacing: -0.01em;
}
.map-drawer-task-meta {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}
.map-drawer-task-meta--done {
  color: #16a34a;
  font-weight: 700;
}
.map-drawer-task-meta--progress {
  color: #92400e;
  font-weight: 700;
}
.map-drawer-task-chev {
  color: #94a3b8;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}
.map-drawer-empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}
</style>
