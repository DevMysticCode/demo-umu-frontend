<template>
  <div class="mobile-container passport-page bg-umu-gradient">
    <div class="passport-header">
      <AppHeader
        title="Passport"
        :showBack="true"
        right="profile"
        :show-tour="true"
        @tour="passportTourRef?.start?.()"
      />

      <SegmentedSwitch
        v-model="selectedRole"
        :options="roleOptions"
        @update:modelValue="onRoleSwitch"
      />
    </div>

    <div class="passport-content">
      <!-- ── Premium Passport hero — book on left, dashboard on right ── -->
      <div class="pp-hero">
        <div class="pp-hero-glow" />
        <div class="pp-hero-book">
          <PassportCard
            :line1="passportAddress.line1"
            :line2="passportAddress.line2"
          />
        </div>
        <div class="pp-hero-info">
          <div class="pp-hero-eyebrow">Property Passport</div>
          <div class="pp-hero-addr-row">
            <div class="pp-hero-addr-text">
              <div class="pp-hero-addr-l1">{{ passportAddress.line1 }}</div>
              <div class="pp-hero-addr-l2">{{ passportAddress.line2 }}</div>
            </div>
            <button class="pp-hero-switch" @click="showPropertiesModal = true">
              <OPIcon name="caretDown" class="w-[16px] h-[16px]" />
            </button>
          </div>
          <div class="pp-hero-stats">
            <div class="pp-hero-stat">
              <div class="pp-hero-stat-val">{{ heroHsScore }}</div>
              <div class="pp-hero-stat-lbl">HS</div>
            </div>
            <div class="pp-hero-stat">
              <div class="pp-hero-stat-val">{{ heroDocsCount }}</div>
              <div class="pp-hero-stat-lbl">Docs</div>
            </div>
            <div class="pp-hero-stat">
              <div class="pp-hero-stat-val">{{ heroSectionsLabel }}</div>
              <div class="pp-hero-stat-lbl">Sections</div>
            </div>
            <!-- <div class="pp-hero-stat">
              <div class="pp-hero-stat-val pp-hero-stat-val--ready">
                {{ heroReadyPct }}
              </div>
              <div class="pp-hero-stat-lbl">Ready</div>
            </div> -->
          </div>
          <div class="pp-hero-dash">
            <div class="pp-hero-dash-row">
              <span class="pp-hero-dash-label">Passport progress</span>
              <span class="pp-hero-dash-pct">{{ overallProgress }}%</span>
            </div>
            <div class="pp-hero-dash-bar">
              <div
                class="pp-hero-dash-fill"
                :style="{ width: safeProgress + '%' }"
              >
                <OPIcon name="progressMan" class="pp-hero-dash-man" />
              </div>
            </div>
            <div class="pp-hero-dash-issued">
              <span class="pp-hero-dash-dot" />
              Passport issued
            </div>
          </div>
        </div>
      </div>

      <!-- ── Action row — Match to Buyers / Publish ── -->
      <div class="pp-action-row">
        <button
          class="pp-action-btn pp-action-outline"
          @click="setTab('buyers')"
        >
          <OPIcon name="matchToBuyers" class="w-[15px] h-[15px]" />
          Match to Buyers
          <span v-if="matchedBuyers.length" class="pp-action-badge">{{
            matchedBuyers.length
          }}</span>
        </button>
        <button
          class="pp-action-btn pp-action-primary"
          :class="{ 'pp-action-loading': publishLoading }"
          :disabled="publishLoading"
          @click="togglePublish"
        >
          <OPIcon name="share" class="w-[15px] h-[15px]" />
          {{ publishLoading ? '...' : isPublished ? 'Unpublish' : 'Publish' }}
        </button>
      </div>

      <!-- ── Collaborators row ── -->
      <div class="pp-collab-row" @click="openCollaboratorModal">
        <button class="pp-collab-add" type="button">+</button>
        <div class="pp-collab-stack">
          <div
            v-for="collaborator in displayCollaborators"
            :key="collaborator.id"
            class="pp-collab-avatar"
          >
            {{ getInitials(collaborator.firstName, collaborator.lastName) }}
          </div>
        </div>
        <div class="pp-collab-text">
          {{ collaborators.length }}
          {{ collaborators.length === 1 ? 'Collaborator' : 'Collaborators' }}
        </div>
        <span class="pp-collab-chev">›</span>
      </div>

      <!-- ── Sub-tabs ── -->
      <div class="pp-subtabs">
        <button
          :class="['pp-subtab', activeTab === 'sections' ? 'active' : '']"
          @click="setTab('sections')"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Sections
        </button>
        <button
          :class="['pp-subtab', activeTab === 'street' ? 'active' : '']"
          @click="setTab('street')"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polygon points="1 6 9 2 15 6 23 2 23 18 15 22 9 18 1 22 1 6" />
            <line x1="9" y1="2" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="22" />
          </svg>
          Street
        </button>
        <button
          :class="['pp-subtab', activeTab === 'buyers' ? 'active' : '']"
          @click="setTab('buyers')"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Buyers
          <span v-if="matchedBuyers.length" class="pp-subtab-badge">{{
            matchedBuyers.length
          }}</span>
        </button>
      </div>

      <!-- Sections tab -->
      <div v-if="activeTab === 'sections'">
        <!-- List / Map sub-toggle -->
        <div class="view-toggle">
          <SegmentedSwitch v-model="viewMode" :options="viewOptions" />
        </div>

        <!-- Pick up where you left off — works for both list and map view -->
        <button
          v-if="resumeTarget"
          class="pp-resume-cta"
          @click="goToResume"
        >
          <span class="pp-resume-ic">↪</span>
          <span class="pp-resume-text">
            <span class="pp-resume-title">Pick up where you left off</span>
            <span class="pp-resume-sub">{{ resumeSubtitle }}</span>
          </span>
          <span class="pp-resume-chev">›</span>
        </button>

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
              <div class="step-counts">
                <span class="step-count-pill step-count-docs">
                  📎
                  {{ getStepDocs(step).done }}/{{ getStepDocs(step).total }}
                  docs
                </span>
                <span class="step-count-pill step-count-q">
                  ❓
                  {{ getStepQuestions(step).done }}/{{
                    getStepQuestions(step).total
                  }}
                  questions
                </span>
              </div>
              <div
                v-if="getStepExpiringDoc(step)"
                class="step-expiry"
                @click.stop="navigateToStep(step.id)"
              >
                ⚠ {{ getStepExpiringDoc(step).label }}
              </div>
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

      <!-- Street tab -->
      <div v-if="activeTab === 'street'" class="pp-tab-content">
        <p class="pp-vm-header">
          See who else on your street has started a Property Passport.
        </p>

        <div v-if="streetProperties.length" class="pp-street-list">
          <div
            v-for="sp in streetProperties"
            :key="sp.id"
            class="pp-street-row"
            @click="navigateToProperty(sp.id)"
          >
            <div
              class="pp-street-icon"
              :style="{
                color: sp.isPublished
                  ? '#1f7a66'
                  : sp.hasPassport
                    ? '#f59e0b'
                    : '#94a3b8',
              }"
            >
              🏠
            </div>
            <div style="flex: 1; min-width: 0">
              <div class="pp-street-addr">{{ sp.addressLine1 }}</div>
              <div class="pp-street-meta">
                <span v-if="sp.propertyType">{{ sp.propertyType }}</span>
                <span v-if="sp.bedrooms"> · {{ sp.bedrooms }} bed</span>
                <span
                  v-if="sp.epcRating"
                  class="pp-street-epc"
                  :style="{ background: epcColor(sp.epcRating) }"
                  >EPC {{ sp.epcRating }}</span
                >
              </div>
            </div>
            <span v-if="sp.isPublished" class="pp-street-badge published"
              >✓ Published</span
            >
            <span v-else-if="sp.hasPassport" class="pp-street-badge started"
              >In progress</span
            >
            <span v-else class="pp-street-badge none">Not started</span>
          </div>
        </div>
        <div v-else class="pp-empty">
          <div style="font-size: 32px; margin-bottom: 8px">🏘</div>
          <p>No other properties found on this street yet.</p>
        </div>

        <div v-if="streetStats" class="pp-street-stats">
          <div class="pp-stats-title">
            {{ passportAddress.line2 }} — Street Overview
          </div>
          <div class="pp-stats-grid">
            <div class="pp-stat brand">
              <div class="pp-stat-val">{{ streetStats.published }}</div>
              <div class="pp-stat-lbl">Passports published</div>
            </div>
            <div class="pp-stat green">
              <div class="pp-stat-val">{{ streetStats.notStarted }}</div>
              <div class="pp-stat-lbl">Not yet started</div>
            </div>
            <div v-if="streetStats.avgEpc" class="pp-stat amber">
              <div class="pp-stat-val">{{ streetStats.avgEpc }}</div>
              <div class="pp-stat-lbl">Average EPC rating</div>
            </div>
            <div v-if="streetStats.avgPrice" class="pp-stat grey">
              <div class="pp-stat-val">
                £{{ Math.round(streetStats.avgPrice / 1000) }}k
              </div>
              <div class="pp-stat-lbl">Avg. estimated value</div>
            </div>
          </div>
          <div class="pp-street-tip">
            💡 <strong>You're ahead of your street.</strong> Sellers with a
            passport typically accept offers <strong>18 days faster</strong>.
          </div>
        </div>
        <div style="height: 80px" />
      </div>

      <!-- Buyers tab -->
      <div v-if="activeTab === 'buyers'" class="pp-tab-content">
        <div class="pp-buyers-intro">
          <div class="pp-buyers-count">
            {{ buyersTotal || matchedBuyers.length }} buyers searching in your
            area
          </div>
          <div class="pp-buyers-sub">
            Tap any buyer to see how well they match your property.
          </div>
        </div>

        <div v-if="matchedBuyers.length" class="pp-buyer-list">
          <div
            v-for="buyer in matchedBuyers"
            :key="buyer.name"
            class="pp-buyer-card"
          >
            <div
              class="pp-buyer-avatar"
              :style="{
                background:
                  buyer.matchScore >= 75
                    ? '#dcfce7'
                    : buyer.matchScore >= 55
                      ? '#fef3c7'
                      : '#f1f5f9',
                color:
                  buyer.matchScore >= 75
                    ? '#16a34a'
                    : buyer.matchScore >= 55
                      ? '#92400e'
                      : '#64748b',
              }"
            >
              {{ buyer.name[0] }}
            </div>
            <div class="pp-buyer-info">
              <div class="pp-buyer-name">{{ buyer.name }}</div>
              <div class="pp-buyer-criteria">
                {{ buyer.area }} · {{ buyer.budget }} · {{ buyer.timeline }}
              </div>
              <div class="pp-buyer-tags">
                <span
                  v-for="tag in buyer.tags"
                  :key="tag"
                  class="pp-buyer-tag"
                  :class="
                    tag === 'Strong match'
                      ? 'match'
                      : tag === 'Good match'
                        ? 'partial'
                        : ''
                  "
                  >{{ tag }}</span
                >
              </div>
            </div>
            <div
              class="pp-buyer-score"
              :style="{
                color:
                  buyer.matchScore >= 75
                    ? '#16a34a'
                    : buyer.matchScore >= 55
                      ? '#92400e'
                      : '#94a3b8',
              }"
            >
              {{ buyer.matchScore }}%
            </div>
          </div>
        </div>
        <div v-else class="pp-empty">
          <div style="font-size: 32px; margin-bottom: 8px">👥</div>
          <p>
            {{
              propertyId
                ? 'Loading matched buyers…'
                : 'Property not linked — no buyer data available.'
            }}
          </p>
        </div>
        <div style="height: 80px" />
      </div>
    </div>

    <!-- Add Collaborator Modal -->
    <AddCollaboratorModal
      v-model:show="showCollaboratorModal"
      :passport-id="route.params.id"
      @added="handleCollaboratorAdded"
      @removed="handleCollaboratorRemoved"
    />

    <!-- Your Properties Modal -->
    <YourPropertiesModal
      :show="showPropertiesModal"
      :current-id="route.params.id"
      @close="showPropertiesModal = false"
      @select="switchPassport"
    />

    <!-- Guided tour — auto-runs once, replays from the "?" in AppHeader -->
    <OnboardingTour
      ref="passportTourRef"
      :steps="passportTourSteps"
      storage-key="umu_tour_passportview_v1"
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
import YourPropertiesModal from '@/components/modals/YourPropertiesModal.vue'
import OnboardingTour from '~/components/ui/OnboardingTour.vue'

// Guided tour — auto-runs once per browser, replays from the "?" button.
const passportTourRef = ref(null)
const passportTourSteps = [
  {
    selector: '.pp-hero',
    title: 'Your Property Passport',
    body: 'This card shows your address, the live HomeScore, document count and overall progress at a glance.',
  },
  {
    selector: '.pp-resume-cta',
    title: 'Pick up where you left off',
    body: 'Tap here anytime to jump straight back to the next task waiting for you.',
  },
  {
    selector: '.pp-action-row',
    title: 'Match buyers or publish',
    body: 'When you\'re ready, match to verified buyers or publish so anyone can view your verified record.',
  },
  {
    selector: '.pp-subtabs',
    title: 'Sections, Street, Buyers',
    body: 'Three tabs: complete your sections, see how you compare to your street, and review matched buyers.',
  },
  {
    selector: '.view-toggle',
    title: 'List or Map view',
    body: 'Tap the map view for an isometric tour through every section of your Passport.',
  },
]
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
const config = useRuntimeConfig()

// Collaborator state
const collaborators = ref([])
const showCollaboratorModal = ref(false)
const showPropertiesModal = ref(false)

const passportAddress = ref({ line1: '', line2: '' })
const isPublished = ref(false)
const publishLoading = ref(false)
const propertyHomeScore = ref(null)

// Resume state — populated by GET /passport/:id/resume on mount and after
// every save / publish toggle so the "Pick up where you left off" CTA stays
// in sync with backend completion state.
const resumeTarget = ref(null)
const resumeTaskTitle = ref('')

// Tab state
const activeTab = ref('sections')
const viewMode = ref('list')
const viewOptions = [
  { label: 'List', value: 'list', icon: 'list' },
  { label: 'Map', value: 'map', icon: 'map' },
]
const propertyId = ref(null)

// Street data
const streetProperties = ref([])
const streetStats = ref(null)

// Buyer data
const matchedBuyers = ref([])
const buyersTotal = ref(0)

onMounted(async () => {
  // Quickly probe the passport type so we can hand landlord passports off
  // to the dedicated landlord view before we kick off the heavy seller-side
  // data loaders below.
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const probe = await $fetch(
      `${config.public.apiBase}/passport/${route.params.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (probe?.type === 'LANDLORD') {
      navigateTo(`/passportview/landlord/${route.params.id}`, { replace: true })
      return
    }
  } catch {
    /* fall through to normal seller load */
  }

  loadPassport(route.params.id)
  await loadCollaborators()
  try {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const passport = await $fetch(
      `${config.public.apiBase}/passport/${route.params.id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    passportAddress.value = {
      line1: passport.addressLine1 ?? '',
      line2: passport.postcode ?? '',
    }
    isPublished.value = passport.status === 'PUBLISHED'
    propertyId.value = passport.propertyId ?? null
    // Pre-fetch street + buyer data in background
    if (passport.propertyId) {
      fetchStreetData(passport.propertyId)
      fetchBuyerData(passport.propertyId)
      fetchPropertyHomeScore(passport.propertyId)
    }
    fetchResumeTarget()
  } catch (e) {
    console.error('Failed to load passport address', e)
  }
})

async function fetchResumeTarget() {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return
  try {
    const r = await $fetch(
      `${config.public.apiBase}/passport/${route.params.id}/resume`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    resumeTarget.value = r?.target ?? null
    if (resumeTarget.value) {
      // Look up the task title from local steps so the subtitle is friendly.
      for (const s of steps.value) {
        const t = s.tasks?.find((x) => x.id === resumeTarget.value.taskId)
        if (t) {
          resumeTaskTitle.value = `${s.title} · ${t.title || 'Continue'}`
          break
        }
      }
    } else {
      resumeTaskTitle.value = ''
    }
  } catch {
    resumeTarget.value = null
  }
}

const resumeSubtitle = computed(() => {
  if (!resumeTarget.value) return ''
  if (resumeTaskTitle.value) return resumeTaskTitle.value
  if (resumeTarget.value.reason === 'last-visited') return 'Continue your last task'
  if (resumeTarget.value.reason === 'next-in-section') return 'Next task in this section'
  if (resumeTarget.value.reason === 'next-section') return 'Move on to the next section'
  return 'Start your first task'
})

function goToResume() {
  if (!resumeTarget.value) return
  router.push(
    `/passportview/steps/tasks/${resumeTarget.value.taskId}?stepId=${resumeTarget.value.sectionId}&propertyId=${route.params.id}`,
  )
}

async function fetchPropertyHomeScore(pid) {
  try {
    const r = await $fetch(`${config.public.apiBase}/property/${pid}`)
    const score = r?.homeScore ?? r?.epcScore ?? null
    if (typeof score === 'number') propertyHomeScore.value = score
  } catch {}
}

async function fetchStreetData(pid) {
  try {
    const data = await $fetch(`${config.public.apiBase}/property/${pid}/street`)
    streetProperties.value = data.properties ?? []
    streetStats.value = data.stats ?? null
  } catch {}
}

async function fetchBuyerData(pid) {
  try {
    const data = await $fetch(
      `${config.public.apiBase}/property/${pid}/matched-buyers`,
    )
    matchedBuyers.value = data.buyers ?? []
    buyersTotal.value = data.total ?? 0
  } catch {}
}

function setTab(tab) {
  activeTab.value = tab
  if (
    tab === 'street' &&
    propertyId.value &&
    streetProperties.value.length === 0
  ) {
    fetchStreetData(propertyId.value)
  }
  if (
    tab === 'buyers' &&
    propertyId.value &&
    matchedBuyers.value.length === 0
  ) {
    fetchBuyerData(propertyId.value)
  }
}

function navigateToProperty(pid) {
  router.push(`/property/${pid}`)
}

function epcColor(rating) {
  const map = {
    A: '#00b050',
    B: '#33b800',
    C: '#92d050',
    D: '#d4e800',
    E: '#ffbf00',
    F: '#ff6600',
    G: '#ff0000',
  }
  return map[rating?.toUpperCase()] ?? '#8e8e93'
}

async function togglePublish() {
  if (publishLoading.value) return
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return
  publishLoading.value = true
  try {
    const endpoint = isPublished.value ? 'unpublish' : 'publish'
    await $fetch(
      `${config.public.apiBase}/passport/${route.params.id}/${endpoint}`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}` } },
    )
    isPublished.value = !isPublished.value
  } catch (e) {
    console.error('Failed to toggle publish state', e)
  } finally {
    publishLoading.value = false
  }
}

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

// ── Hero stat strip (HS / Docs / Sections / Ready) ───────────────
const heroHsScore = computed(() =>
  typeof propertyHomeScore.value === 'number' ? propertyHomeScore.value : '—',
)
const heroDocsCount = computed(() =>
  steps.value.reduce(
    (sum, step) => sum + step.tasks.filter((t) => t.completed).length,
    0,
  ),
)
const heroSectionsLabel = computed(() => {
  const total = steps.value.length
  const started = steps.value.filter((s) => (s.progress ?? 0) > 0).length
  return `${started}/${total}`
})
const heroReadyPct = computed(() => `${overallProgress.value}%`)

// Identify whether a task is an upload (doc) or a regular question.
// Falls back to the task `type` field; treats UPLOAD/MULTIPART as docs.
function isUploadTask(t) {
  const type = String(t?.type || '').toUpperCase()
  return type === 'UPLOAD' || type === 'MULTIPART'
}

const getStepDocs = (step) => {
  const tasks = (step?.tasks ?? []).filter(isUploadTask)
  return {
    done: tasks.filter((t) => t.completed).length,
    total: tasks.length,
  }
}

const getStepQuestions = (step) => {
  const tasks = (step?.tasks ?? []).filter((t) => !isUploadTask(t))
  return {
    done: tasks.filter((t) => t.completed).length,
    total: tasks.length,
  }
}

// Detect any uploaded doc that's expiring within 30 days. The runtime task
// model exposes the upload metadata under `answer` / `attachments`; we look
// for any `expiresAt` / `expiryDate` / `validUntil` field on completed
// upload tasks.
const getStepExpiringDoc = (step) => {
  const now = Date.now()
  const SOON_MS = 30 * 24 * 60 * 60 * 1000
  for (const t of step?.tasks ?? []) {
    if (!t?.completed || !isUploadTask(t)) continue
    const candidates = [
      t.expiresAt,
      t.expiryDate,
      t.validUntil,
      t.answer?.expiresAt,
      t.answer?.expiryDate,
      t.answer?.validUntil,
      ...(t.attachments ?? []).map(
        (a) => a?.expiresAt ?? a?.expiryDate ?? a?.validUntil,
      ),
    ].filter(Boolean)
    for (const raw of candidates) {
      const ts = new Date(raw).getTime()
      if (!Number.isFinite(ts)) continue
      const diff = ts - now
      if (diff < 0) {
        return {
          expired: true,
          label: `${t.title || 'A document'} has expired — please re-upload`,
        }
      }
      if (diff <= SOON_MS) {
        const days = Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)))
        return {
          expired: false,
          label: `${t.title || 'A document'} expires in ${days} day${days === 1 ? '' : 's'}`,
        }
      }
    }
  }
  return null
}

const getStepPoints = (step) => {
  if (!step?.tasks || !Array.isArray(step.tasks)) {
    return 0
  }
  return step.tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => {
      // Support multiple property names: pointsReward, points, pointsAward, reward
      const points =
        t.pointsReward || t.points || t.pointsAward || t.reward || 0
      return sum + (Number(points) || 0)
    }, 0)
}

const navigateToStep = (stepId) => {
  router.push(`/passportview/steps/${stepId}?propertyId=${route.params.id}`)
}

const switchPassport = (passportId) => {
  router.push(`/passportview/${passportId}`)
}

const onRoleSwitch = (role) => {
  if (role === 'buyer') {
    router.push(`/buyer-passport/${route.params.id}`)
  }
}
</script>

<style scoped>
.passport-page {
  min-height: 100vh;
  background: #fff;
  color: #231d45;
}

.passport-header {
  background: #fff;
  padding: 14px 20px 12px;
  border-bottom: 1px solid #eef0f6;
}

.passport-content {
  padding: 16px 20px 80px !important;
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
  background: #00a19a;
  color: white;
  border-color: #00a19a;
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
  /* background: linear-gradient(135deg, #00a19a 0%, #00d4c3 100%); */
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
  background: linear-gradient(90deg, #00a19a 0%, #00d4c3 100%);
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
  color: #00a19a;
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
  background: #00a19a;
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
  color: #00a19a;
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
  background: #00a19a;
  color: white;
  border-color: #00a19a;
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

.step-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.step-count-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  letter-spacing: 0.01em;
  white-space: nowrap;
  line-height: 1.4;
}
.step-count-docs {
  background: #f1f9f4;
  color: #00a19a;
  border: 1px solid #e2f1ea;
}
.step-count-q {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.step-expiry {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 700;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fef3c7;
  padding: 3px 8px;
  border-radius: 999px;
  cursor: pointer;
}
.step-expiry:hover {
  background: #fef3c7;
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

.pp-match-badge {
  background: #fff;
  color: #00a19a;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
  margin-left: 4px;
  vertical-align: middle;
}

/* ── Tab bar ─────────────────────────────────────────── */
.pp-tab-bar {
  display: flex;
  gap: 6px;
  background: #f1f5f9;
  border-radius: 14px;
  padding: 4px;
  margin: 4px 0 16px;
}
.pp-tab {
  flex: 1;
  background: none;
  border: none;
  border-radius: 10px;
  padding: 9px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition:
    background 0.18s,
    color 0.18s,
    box-shadow 0.18s;
  position: relative;
}
.pp-tab.active {
  background: white;
  color: #1f7a66;
  box-shadow:
    0 1px 4px rgba(15, 23, 42, 0.1),
    0 0 0 1px rgba(15, 23, 42, 0.04);
}
.pp-tab-icon {
  font-size: 14px;
  line-height: 1;
}
.pp-tab-label {
  font-size: 12px;
}
.pp-tab-badge {
  background: #1f7a66;
  color: white;
  font-size: 9px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 999px;
  line-height: 1.5;
  position: absolute;
  top: 4px;
  right: 4px;
}
.pp-tab-content {
  padding-top: 0;
}

/* ── Street tab ──────────────────────────────────────── */
.pp-vm-header {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 12px;
}
.pp-street-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
  border: 1px solid #e2e8e8;
}
.pp-street-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}
.pp-street-row:last-child {
  border-bottom: none;
}
.pp-street-row:active {
  background: #f0fdfa;
}
.pp-street-icon {
  font-size: 20px;
  flex-shrink: 0;
}
.pp-street-addr {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}
.pp-street-meta {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}
.pp-street-epc {
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 4px;
}
.pp-street-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}
.pp-street-badge.published {
  background: #dcfce7;
  color: #166534;
}
.pp-street-badge.started {
  background: #fef3c7;
  color: #92400e;
}
.pp-street-badge.none {
  background: #f1f5f9;
  color: #64748b;
}
.pp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}
.pp-street-stats {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 14px;
  border: 1px solid #e2e8e8;
}
.pp-stats-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
}
.pp-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.pp-stat {
  border-radius: 10px;
  padding: 10px 12px;
}
.pp-stat.brand {
  background: #f0fdfa;
}
.pp-stat.green {
  background: #f0fdf4;
}
.pp-stat.amber {
  background: #fef3c7;
}
.pp-stat.grey {
  background: #f8fafc;
}
.pp-stat-val {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}
.pp-stat.brand .pp-stat-val {
  color: #1f7a66;
}
.pp-stat.green .pp-stat-val {
  color: #16a34a;
}
.pp-stat.amber .pp-stat-val {
  color: #92400e;
}
.pp-stat-lbl {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}
.pp-street-tip {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
}

/* ── Buyers tab ──────────────────────────────────────── */
.pp-buyers-intro {
  background: #f0fdfa;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
}
.pp-buyers-count {
  font-size: 13px;
  color: #0f172a;
  font-weight: 600;
  margin-bottom: 2px;
}
.pp-buyers-sub {
  font-size: 12px;
  color: #64748b;
}
.pp-buyer-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8e8;
  margin-bottom: 14px;
}
.pp-buyer-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 14px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}
.pp-buyer-card:last-child {
  border-bottom: none;
}
.pp-buyer-card:active {
  background: #f0fdfa;
}
.pp-buyer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 700;
  flex-shrink: 0;
}
.pp-buyer-info {
  flex: 1;
  min-width: 0;
}
.pp-buyer-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #0f172a;
}
.pp-buyer-criteria {
  font-size: 11.5px;
  color: #475569;
  margin-top: 2px;
  line-height: 1.4;
}
.pp-buyer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}
.pp-buyer-tag {
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
}
.pp-buyer-tag.match {
  background: #dcfce7;
  color: #166534;
}
.pp-buyer-tag.partial {
  background: #fef3c7;
  color: #92400e;
}
.pp-buyer-score {
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 38px;
  text-align: right;
}

/* ── Pick up where you left off — resume CTA ──────────────────────── */
.pp-resume-cta {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: linear-gradient(135deg, #00a19a, #00a19a);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.28);
  transition: transform 0.12s ease, box-shadow 0.15s ease;
}
.pp-resume-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(0, 161, 154, 0.34);
}
.pp-resume-ic {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}
.pp-resume-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.pp-resume-title {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.pp-resume-sub {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-resume-chev {
  font-size: 20px;
  font-weight: 600;
  opacity: 0.7;
  flex-shrink: 0;
}

/* ── Premium Passport hero (prototype-matching) ───────────────────── */
.pp-hero {
  background:
    radial-gradient(
      circle at 18% 30%,
      rgba(0, 161, 154, 0.08),
      transparent 50%
    ),
    radial-gradient(circle at 90% 90%, rgba(35, 29, 69, 0.04), transparent 50%),
    linear-gradient(180deg, #f4fbfa 0%, #fff 100%);
  border: 1px solid #e2f1ea;
  border-radius: 18px;
  padding: 18px 16px 16px;
  margin-bottom: 14px;
  display: flex;
  align-items: stretch;
  gap: 14px;
  position: relative;
  overflow: hidden;
}
.pp-hero-glow {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.18), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.pp-hero-book {
  width: 104px;
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  filter: drop-shadow(0 8px 18px rgba(0, 140, 134, 0.28));
}
.pp-hero-book :deep(.passport-card) {
  padding: 0;
  margin: 0;
  width: 100%;
  min-width: 0;
}
.pp-hero-book :deep(.passport-container) {
  width: 100%;
  height: 140px;
}
.pp-hero-book :deep(.passport-image) {
  width: 100%;
  height: 100%;
}
.pp-hero-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}
.pp-hero-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 4px;
}
.pp-hero-addr-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.pp-hero-addr-text {
  flex: 1;
  min-width: 0;
}
.pp-hero-addr-l1 {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.pp-hero-addr-l2 {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
}
.pp-hero-switch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
}
.pp-hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  margin-top: 10px;
}
.pp-hero-stat {
  text-align: center;
  padding: 0 4px;
}
.pp-hero-stat + .pp-hero-stat {
  border-left: 1px solid rgba(35, 29, 69, 0.08);
}
.pp-hero-stat-val {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  line-height: 1;
  letter-spacing: -0.01em;
}
.pp-hero-stat-val--ready {
  color: #00a19a;
}
.pp-hero-stat-lbl {
  font-size: 7.5px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 3px;
  font-weight: 700;
}

.pp-hero-dash {
  margin-top: 10px;
}
.pp-hero-dash-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.pp-hero-dash-label {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #4a5568;
}
.pp-hero-dash-pct {
  color: #00a19a;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: -0.01em;
}
.pp-hero-dash-bar {
  height: 6px;
  background: #eef0f6;
  border-radius: 999px;
  position: relative;
  overflow: visible;
}
.pp-hero-dash-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #00b5ad);
  border-radius: 999px;
  transition: width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  position: relative;
}
.pp-hero-dash-man {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px !important;
  height: 22px !important;
  pointer-events: none;
}
.pp-hero-dash-issued {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9.5px;
  color: #94a3b8;
  font-weight: 600;
  margin-top: 7px;
  letter-spacing: 0.02em;
}
.pp-hero-dash-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #00a19a;
  box-shadow: 0 0 0 2.5px #f1f9f4;
}

/* ── Action row (Match to Buyers + Publish) ────────────────────── */
.pp-action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.pp-action-btn {
  border: none;
  border-radius: 12px;
  padding: 11px 12px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition:
    transform 0.1s,
    box-shadow 0.15s;
}
.pp-action-btn:active {
  transform: scale(0.98);
}
.pp-action-outline {
  background: #fff;
  color: #231d45;
  border: 1.5px solid #eef0f6;
}
.pp-action-outline:hover {
  border-color: #e2f1ea;
}
.pp-action-primary {
  background: #00a19a;
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.28);
}
.pp-action-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.pp-action-loading {
  opacity: 0.85;
}
.pp-action-badge {
  background: #00a19a;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  margin-left: 2px;
}

/* ── Collaborators row ─────────────────────────────────────────── */
.pp-collab-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 14px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.pp-collab-row:hover {
  border-color: #e2f1ea;
}
.pp-collab-add {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  display: grid;
  place-items: center;
  color: #00a19a;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  line-height: 1;
}
.pp-collab-stack {
  display: flex;
  margin-left: -4px;
}
.pp-collab-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00b5ad, #00a19a);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
  border: 2px solid #fff;
  margin-left: -8px;
}
.pp-collab-text {
  font-size: 12.5px;
  color: #4a5568;
  font-weight: 600;
  flex: 1;
}
.pp-collab-chev {
  color: #94a3b8;
  font-size: 18px;
  font-weight: 600;
}

/* ── Sub-tabs ──────────────────────────────────────────────────── */
.pp-subtabs {
  display: flex;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 12px;
}
.pp-subtab {
  flex: 1;
  border: none;
  background: transparent;
  padding: 9px 8px;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition:
    background 0.15s,
    color 0.15s;
}
.pp-subtab.active {
  background: #00a19a;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.28);
}
.pp-subtab-badge {
  background: #fff;
  color: #00a19a;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  margin-left: 2px;
}
.pp-subtab:not(.active) .pp-subtab-badge {
  background: #00a19a;
  color: #fff;
}

/* ── Section cards ─────────────────────────────────────────────── */
.pp-sections-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pp-section-card {
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  padding: 0 14px;
  box-shadow:
    0 1px 3px rgba(35, 29, 69, 0.06),
    0 2px 8px rgba(35, 29, 69, 0.04);
  transition:
    border-color 0.15s,
    transform 0.1s;
  cursor: pointer;
}
.pp-section-card:hover {
  border-color: #e2f1ea;
}
.pp-section-card:active {
  transform: scale(0.99);
}
.pp-section-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 0;
}
.pp-section-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #00a19a;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.pp-section-body {
  flex: 1;
  min-width: 0;
}
.pp-section-name {
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
}
.pp-section-meta {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
}
.pp-section-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}
.pp-section-pct {
  font-size: 11px;
  font-weight: 800;
  background: #f1f9f4;
  color: #00a19a;
  border: 1px solid #e2f1ea;
  padding: 3px 9px;
  border-radius: 999px;
}
.pp-section-pct.zero {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #eef0f6;
}
.pp-section-pct.full {
  background: #d1fae5;
  color: #1f7a66;
  border-color: #a7f3d0;
}
.pp-section-chev {
  color: #94a3b8;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
