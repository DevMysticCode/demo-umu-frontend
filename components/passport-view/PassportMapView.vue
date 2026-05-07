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

    <!-- Bottom drawer — prototype "sheet" design -->
    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="drawerStep"
          class="sheet-backdrop"
          @click.self="drawerStep = null"
        >
          <div class="sheet" @click.stop>
            <div class="grabber" />
            <div class="sheet-head">
              <div class="sheet-icon-wrap">
                <div class="sheet-icon">
                  <OPIcon
                    :name="drawerStep.icon || drawerStep.key"
                    class="w-[50px] h-[50px]"
                  />
                </div>
              </div>
              <div class="sheet-meta">
                <div class="sheet-title">{{ drawerStep.title }}</div>
                <div class="sheet-sub">
                  {{ drawerStep.subtitle || drawerStep.description || '' }}
                </div>
                <span v-if="drawerStepMaxPoints > 0" class="sheet-points">
                  ⭐ Up to {{ drawerStepMaxPoints }} points
                </span>
              </div>
            </div>

            <div class="sheet-progress">
              <div class="pgr-bar">
                <div
                  class="pgr-fill"
                  :style="{ width: getStepCompletion(drawerStep) + '%' }"
                />
              </div>
              <div class="pgr-text">
                {{ drawerStepCompletedTasks }} of
                {{ drawerStep.tasks?.length ?? 0 }} tasks done
              </div>
            </div>

            <div class="task-list-head">
              <div class="lbl">Your tasks</div>
              <div class="sort">Sort ⌄</div>
            </div>

            <button
              v-for="task in drawerStep.tasks ?? []"
              :key="task.id"
              class="task-row"
              :class="{ done: task.completed }"
              @click="goToTask(drawerStep, task)"
            >
              <div class="task-status">
                <template
                  v-if="!task.completed && Number(task.answeredQuestions) > 0"
                >
                  {{ task.answeredQuestions }}
                </template>
              </div>
              <div class="task-info">
                <div class="task-title">{{ task.title }}</div>
                <p
                  v-if="task.description"
                  class="task-description"
                >
                  {{ task.description }}
                </p>
                <div class="task-meta">
                  <span v-if="getTaskPoints(task)" class="points">
                    +{{ getTaskPoints(task) }} points
                  </span>
                  <span class="task-meta-mins">
                    ~{{ getTaskMinutes(task) }} min
                  </span>
                  <span class="task-meta-q">
                    {{ getTaskQuestionCount(task) }}
                    {{
                      getTaskQuestionCount(task) === 1
                        ? 'question'
                        : 'questions'
                    }}
                  </span>
                </div>
              </div>
              <span class="task-arrow">›</span>
            </button>

            <div v-if="!(drawerStep.tasks ?? []).length" class="sheet-empty">
              No tasks in this section yet.
            </div>
          </div>
        </div>
      </Transition>
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

// ── Bottom drawer ──────────────────────────────────────────────
const drawerStep = ref(null)
const drawerStepCompletedTasks = computed(
  () => drawerStep.value?.tasks?.filter((t) => t.completed).length ?? 0,
)
const drawerStepPoints = computed(() => {
  const tasks = drawerStep.value?.tasks ?? []
  return tasks
    .filter((t) => t.completed)
    .reduce(
      (sum, t) =>
        sum + Number(t.points || t.pointsReward || t.pointsAward || 0),
      0,
    )
})

// Maximum points available across the whole section — used in the head pill.
const drawerStepMaxPoints = computed(() => {
  const tasks = drawerStep.value?.tasks ?? []
  return tasks.reduce((sum, t) => sum + Number(getTaskPoints(t) || 0), 0)
})

function getTaskPoints(task) {
  return Number(task?.points || task?.pointsReward || task?.pointsAward || 0)
}

function getTaskQuestionCount(task) {
  if (Number.isFinite(Number(task?.totalQuestions))) {
    return Number(task.totalQuestions)
  }
  if (Array.isArray(task?.questions)) return task.questions.length
  if (Array.isArray(task?.passportQuestions)) {
    return task.passportQuestions.length
  }
  return 1
}

function getTaskMinutes(task) {
  // Allow a server-provided estimate; otherwise budget ~1 min per question.
  const estimated =
    Number(task?.estimatedMinutes) ||
    Number(task?.minimumMinutes) ||
    Number(task?.minutes)
  if (estimated > 0) return estimated
  return Math.max(1, getTaskQuestionCount(task))
}
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
/* Prototype-matching progress ring on each pin */
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
  stroke: #16a34a;
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
  color: #16a34a;
  font-size: 14px;
}

/* ── Sheet drawer (prototype-matching) ─────────────────────── */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 40, 64, 0.4);
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.sheet {
  width: 100%;
  max-width: 28rem;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 14px 18px 18px;
  max-height: 85%;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15);
  color: #0e2840;
}
.sheet::-webkit-scrollbar {
  display: none;
}
.grabber {
  width: 40px;
  height: 4px;
  background: #e5ede9;
  border-radius: 4px;
  margin: 0 auto 10px;
}
.sheet-head {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 10px;
}
.sheet-icon-wrap {
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}
.sheet-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(165deg, #f4fbf7, #e2f1ea);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00a19a;
}
.sheet-meta {
  flex: 1;
  min-width: 0;
}
.sheet-title {
  font-weight: 800;
  font-size: 17px;
  color: #0e2840;
  letter-spacing: -0.01em;
}
.sheet-sub {
  font-size: 11.5px;
  color: #6b7c8e;
  margin-top: 2px;
}
.sheet-points {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(61, 189, 163, 0.12);
  color: #00a19a;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 100px;
  letter-spacing: 0.4px;
}

.sheet-progress {
  background: linear-gradient(135deg, #f4fbf7, #f1f9f4);
  border-radius: 12px;
  padding: 10px 12px;
  margin: 4px 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.sheet-progress .pgr-bar {
  flex: 1;
  height: 6px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}
.sheet-progress .pgr-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #00a19a);
  border-radius: 4px;
  transition: width 0.6s ease;
}
.sheet-progress .pgr-text {
  font-size: 11px;
  font-weight: 800;
  color: #00a19a;
  white-space: nowrap;
}

.task-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.task-list-head .lbl {
  font-size: 10.5px;
  font-weight: 800;
  color: #6b7c8e;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
.task-list-head .sort {
  font-size: 11px;
  font-weight: 700;
  color: #6b7c8e;
}

.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8faf9;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  width: 100%;
  text-align: left;
}
.task-row:hover {
  background: #f0f7f3;
  border-color: #e2f1ea;
}
.task-row.done {
  cursor: default;
}
.task-row.done:hover {
  background: #f8faf9;
  border-color: transparent;
}
.task-status {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #d5e0da;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  font-size: 10px;
  font-weight: 800;
  color: #00a19a;
  transition: all 0.3s;
}
.task-row.done .task-status {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
}
.task-row.done .task-status::before {
  content: '✓';
  font-size: 12px;
}
.task-info {
  flex: 1;
  min-width: 0;
}
.task-title {
  font-size: 13px;
  font-weight: 700;
  color: #0e2840;
}
.task-description {
  font-size: 11.5px;
  color: #6b7c8e;
  line-height: 1.45;
  margin: 3px 0 0;
}
.task-row.done .task-description {
  color: #94a3b8;
}
.task-row.done .task-title {
  color: #6b7c8e;
  text-decoration: line-through;
}
.task-meta {
  font-size: 11.5px;
  color: #6b7c8e;
  margin-top: 3px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.task-meta > * + *::before {
  content: '·';
  margin-right: 6px;
  color: #c1cad3;
}
.task-meta .points {
  color: #00a19a;
  font-weight: 800;
}
.task-meta-mins,
.task-meta-q {
  color: #6b7c8e;
  font-weight: 500;
}
.task-row.done .task-meta {
  color: #94a3b8;
}
.task-row.done .task-meta .points {
  color: #94a3b8;
  font-weight: 700;
}
.task-arrow {
  color: #6b7c8e;
  font-size: 16px;
  flex-shrink: 0;
}

.sheet-empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}

/* Sheet enter/leave animation */
.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}
.sheet-enter-active.sheet-backdrop,
.sheet-leave-active.sheet-backdrop {
  transition: opacity 0.3s ease;
}
.sheet-enter-from.sheet-backdrop,
.sheet-leave-to.sheet-backdrop {
  opacity: 0;
}
</style>
