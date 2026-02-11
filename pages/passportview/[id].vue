<template>
  <div class="mobile-container passport-page bg-umu-gradient">
    <div class="passport-header">
      <AppHeader title="Passport" :showBack="false" right="profile" />

      <SegmentedSwitch v-model="selectedRole" :options="roleOptions" />
    </div>

    <div class="passport-content">
      <div class="passport-cards-carousel">
        <PassportCard line1="21, Rochester Road" line2="Staines, TW18 3BA" />
      </div>

      <div class="property-info">
        <div class="info-header">
          <div class="address-row">
            <span class="pin-icon"
              ><OPIcon name="pin" class="w-[24px] h-[24px]"
            /></span>
            <div class="property-address-small">
              21, Rochester Road<br /><span class="property-address-small-sub"
                >Coventry, CV5 6AB</span
              >
            </div>
            <button class="dropdown-btn">
              <OPIcon name="caretDown" class="w-[24px] h-[24px]" />
            </button>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-container">
            <!-- <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: overallProgress + '%' }"
              ></div>
            </div> -->

            <div class="progress-bar">
              <!-- Completed progress -->
              <div class="progress-fill" :style="{ width: safeProgress + '%' }">
                <!-- Man icon at end of progress -->
                <OPIcon name="progressMan" class="progress-man" />
              </div>

              <!-- Dotted remaining track -->
              <div class="progress-dotted"></div>
            </div>
          </div>
          <div class="progress-info">
            <p class="progress-label">PASSPORT PROGRESS</p>
            <span class="progress-percentage">{{ overallProgress }}%</span>
          </div>
        </div>
      </div>

      <div class="match_publish_container">
        <button>
          <OPIcon name="matchToBuyers" class="w-[17px] h-[17px]" /> Match to
          Buyers
        </button>
        <button class="active">
          <OPIcon name="share" class="w-[17px] h-[17px]" /> Publish
        </button>
      </div>

      <div class="collaborators-info">
        <div class="collaborators">
          <div class="collaborator-avatars">
            <div
              class="avatar"
              v-for="collaborator in displayCollaborators"
              :key="collaborator.id"
            >
              <div class="avatar-circle">
                {{ getInitials(collaborator.firstName, collaborator.lastName) }}
              </div>
            </div>
            <button class="add-collaborator" @click="openCollaboratorModal">
              +
            </button>
          </div>
          <span class="collaborators-label"
            >{{ collaborators.length }}
            {{
              collaborators.length === 1 ? 'Collaborator' : 'Collaborators'
            }}</span
          >
          <button class="add-icon" @click="openCollaboratorModal">
            <OPIcon name="addCollaborator" class="w-[28px] h-[28px]" />
          </button>
        </div>
      </div>

      <div class="view-toggle">
        <SegmentedSwitch v-model="viewMode" :options="viewOptions" />
      </div>

      <div v-if="viewMode === 'list'" class="steps-list">
        <div
          v-for="step in steps"
          :key="step.id"
          class="step-card"
          @click="navigateToStep(step.id)"
        >
          <div class="step-icon-container">
            <div class="step-icon-bg">
              <OPIcon :name="step.key" class="w-[80px] h-[80px]" />
            </div>
          </div>
          <div class="step-info">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-points">
              {{ getStepPoints(step) }} points earned so far
            </p>
            <div class="step-progress">
              <div class="progress-bar small">
                <div
                  class="progress-fill"
                  :style="{ width: step.progress + '%' }"
                ></div>
              </div>
              <span class="progress-percentage">{{ step.progress }}%</span>
            </div>
          </div>
          <button class="step-arrow">
            <OPIcon name="caretRight" class="w-[13px] h-[13px]" />
          </button>
        </div>
      </div>

      <PassportMapView v-else />
    </div>

    <!-- Add Collaborator Modal -->
    <AddCollaboratorModal
      v-model:show="showCollaboratorModal"
      :passport-id="route.params.id"
      @added="handleCollaboratorAdded"
      @removed="handleCollaboratorRemoved"
    />
  </div>
</template>

<script setup>
// import { usePassportSteps } from '~/composables/usePassportSteps'
import PassportMapView from '@/components/passport-view/PassportMapView.vue'
import AppHeader from '@/components/core/AppHeader.vue'
import PassportCard from '@/components/passport-view/PassportCard.vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import SegmentedSwitch from '@/components/core/SegmentedSwitch.vue'
import AddCollaboratorModal from '@/components/modals/AddCollaboratorModal.vue'
import { usePassportRuntime } from '~/composables/usePassportRuntime'
import { usePassportCollaborators } from '~/composables/usePassportCollaborators'
import { onMounted, ref, computed } from 'vue'

definePageMeta({
  middleware: 'auth',
})

const { steps, loadPassport } = usePassportRuntime()
const { getCollaborators } = usePassportCollaborators()
const route = useRoute()
const router = useRouter()

// Collaborator state
const collaborators = ref([])
const showCollaboratorModal = ref(false)

onMounted(async () => {
  loadPassport(route.params.id)
  await loadCollaborators()
})

const loadCollaborators = async () => {
  try {
    collaborators.value = await getCollaborators(route.params.id)
  } catch (err) {
    console.error('Failed to load collaborators:', err)
  }
}

const openCollaboratorModal = () => {
  showCollaboratorModal.value = true
}

const handleCollaboratorAdded = (collaborator) => {
  console.log('Collaborator added:', collaborator)
  // Collaborators list will be reloaded by the modal
  loadCollaborators()
}

const handleCollaboratorRemoved = (collaboratorId) => {
  console.log('Collaborator removed:', collaboratorId)
  // Collaborators list will be reloaded by the modal
  loadCollaborators()
}

const displayCollaborators = computed(() => {
  // Show max 3 collaborators in the avatars
  return collaborators.value.slice(0, 3)
})

const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return `${first}${last}` || '?'
}

const safeProgress = computed(() =>
  Math.min(Math.max(overallProgress.value, 5), 95),
)

// const { steps } = usePassportSteps()
const selectedRole = ref('seller')

const roleOptions = [
  { label: 'Buyer', value: 'buyer', icon: 'buyer' },
  { label: 'Seller', value: 'seller', icon: 'seller' },
]

const viewMode = ref('list')
const viewOptions = [
  { label: 'List', value: 'list', icon: 'list' },
  { label: 'Map', value: 'map', icon: 'map' },
]

const overallProgress = computed(() => {
  const totalTasks = steps.value.reduce(
    (sum, step) => sum + step.tasks.length,
    0,
  )
  const completedTasks = steps.value.reduce(
    (sum, step) => sum + step.tasks.filter((t) => t.completed).length,
    0,
  )
  return Math.round((completedTasks / totalTasks) * 100) || 0
})

const getStepPoints = (step) => {
  return step.tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.pointsReward, 0)
}

const navigateToStep = (stepId) => {
  router.push(`/passportview/steps/${stepId}?propertyId=${route.params.id}`)
}
</script>

<style scoped>
.passport-page {
  min-height: 100vh;
}

.passport-header {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

.header-icons {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.role-buttons {
  display: flex;
  gap: 12px;
}

.role-btn {
  flex: 1;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.role-btn.seller-btn.active {
  background: #00b8a9;
  color: white;
  border-color: #00b8a9;
}

.btn-icon {
  font-size: 16px;
}

.passport-content {
  padding: 20px;
}

.passport-cards-carousel {
  margin-bottom: 20px;
  overflow-x: auto;
  padding: 10px 0;
}

.passport-card {
  /* background: linear-gradient(135deg, #00b8a9 0%, #00d4c3 100%); */
  /* border-radius: 20px; */
  padding: 24px 24px;
  color: white;
  min-width: 280px;
  /* box-shadow: 0 8px 24px rgba(0, 184, 169, 0.3); */
  position: relative;
}

.card-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.25);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.card-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
}

.house-logo {
  width: 100%;
  height: 100%;
}

.card-address {
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4px;
}

.card-location {
  font-size: 13px;
  text-align: center;
  opacity: 0.9;
}

.property-info {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 0px;
}

.info-header {
  margin-bottom: 20px;
}

.address-row {
  display: flex;
  align-items: start;
  justify-content: center;
  gap: 8px;
}

.pin-icon {
  font-size: 18px;
}

.property-address-small {
  flex: 1;
  font-size: 20px;
  line-height: 25px;
  letter-spacing: -0.45px;
  font-weight: 590;
  color: #000000;
  text-align: center;
}
.property-address-small-sub {
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
  color: #3c3c4399;
}
.dropdown-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 4px;
}

.progress-label {
  font-size: 11px;
  color: #999;
  margin: 0 0 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  position: relative;
  flex: 1;
  height: 16px;
  background: #00a19a33;
  border-radius: 8px;
  overflow: visible;
}

.progress-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #00b8a9 0%, #00d4c3 100%);
  transition: width 0.3s ease;
  border-radius: 8px;
  z-index: 2;
}

/* Dotted remaining part */
.progress-dotted {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
  border-radius: 2px;
  background-image: repeating-linear-gradient(
    to right,
    #3c3c432e 0,
    #3c3c432e 6px,
    transparent 6px,
    transparent 12px
  );
  z-index: 1;
}

.progress-man {
  position: absolute;
  right: -5px;
  top: -35%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
}

.progress-percentage {
  font-size: 11px;
  color: #00b8a9;
  font-weight: 700;
  min-width: 35px;
  text-align: right;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.collaborators {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 10px;
  border: 1px solid #3c3c432e;
  margin-bottom: 10px;
  background-color: white;
  border-radius: 32px;
}

.collaborator-avatars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.avatar {
  width: 32px;
  height: 32px;
  margin-left: -8px;
}

.avatar:first-child {
  margin-left: 0;
}

.avatar-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #00b8a9;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.add-collaborator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  margin-left: -8px;
}

.collaborators-label {
  flex: 1;
  font-size: 13px;
  color: #666;
}

.add-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: none;
  border: none;
  font-size: 24px;
  color: #00b8a9;
  cursor: pointer;
}

.view-toggle {
  display: flex;
  gap: 16px;
  margin: 20px auto;
}

.toggle-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  color: #666;
}

.toggle-btn.active {
  background: #00b8a9;
  color: white;
  border-color: #00b8a9;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.step-card:active {
  transform: scale(0.98);
}

.step-icon-container {
  flex-shrink: 0;
}

.step-icon-bg {
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-info {
  flex: 1;
}

.step-title {
  font-size: 15px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.23px;
  color: #000000;
}

.step-points {
  font-size: 12px;
  line-height: 16px;
  color: #00a19a;
  /* margin: 0 0 8px; */
  font-weight: 400;
}

.step-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.progress-bar.small {
  height: 4px;
  flex: 1;
}

.step-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f9f9fd;
  border: 0.5px solid #d2d1e4;
  font-size: 24px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.match_publish_container {
  display: flex;
}

.match_publish_container button {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 10px 5px;
  padding: 12px;
  background: #ffffff;
  border: none;
  border-radius: 12px;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  color: #00a19a;
  cursor: pointer;
}

.match_publish_container button.active {
  background: #00a19a;
  color: #ffffff;
}
</style>
