<template>
  <div class="cl-page mobile-container">
    <!-- Nav bar — matches prototype -->
    <div class="cl-nav-bar">
      <button class="cl-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="cl-nav-title">Collaborators</div>
      <button class="cl-nav-icon-btn" aria-label="Search" @click="openSearch">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </div>

    <main class="cl-body">
      <div class="atm-bg teal" />

      <!-- Hero -->
      <div class="cl-hero">
        <div class="hero-greeting">Your team</div>
        <div class="cl-h1">
          People you work with<span class="cl-h1-count">{{
            collaborators.length
          }}</span>
        </div>
        <div class="hero-stats">
          <span
            ><span class="stat-num">{{ collaborators.length }}</span
            >collaborators</span
          >
          <span class="stat-sep" />
          <span
            ><span class="stat-num">{{ propertyCount }}</span
            >properties</span
          >
          <span class="stat-sep" />
          <span
            ><span class="stat-num teal">{{ partnerCount }}</span
            >partners</span
          >
        </div>
      </div>

      <!-- Filter chips -->
      <div class="cl-filter-row">
        <button
          v-for="chip in filterChips"
          :key="chip.value"
          class="cl-chip"
          :class="{ active: activeFilter === chip.value }"
          @click="activeFilter = chip.value"
        >
          {{ chip.label }}
          <span class="cl-chip-num">{{ chip.count }}</span>
        </button>
      </div>

      <!-- Collaborator cards -->
      <div
        v-for="person in filteredCollaborators"
        :key="person.id"
        class="collaborator-card"
        @click="navigateTo(`/profile/collaborator-detail?id=${person.id}`)"
      >
        <div
          class="collab-avatar"
          :class="`collab-avatar--${avatarTone(person)}`"
        >
          {{ collabInitials(person) }}
        </div>
        <div class="collab-content">
          <div class="collab-name">{{ person.name }}</div>
          <div class="collab-role">{{ person.roleLabel }}</div>
          <div v-if="person.organization || person.email" class="collab-org">
            {{ person.organization || person.email }}
          </div>
          <div class="collab-properties">
            <span
              class="collab-prop-tag global"
              v-if="person.accessLevel === 'Owner' || person.propertyCount > 1"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {{
                person.propertyCount > 1
                  ? `${person.propertyCount} properties`
                  : 'All properties'
              }}
            </span>
            <span v-else class="collab-prop-tag">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              {{ person.propertyCount }}
              {{ person.propertyCount === 1 ? 'property' : 'properties' }}
            </span>
          </div>
        </div>
        <div class="collab-actions">
          <button class="collab-action-btn" @click.stop>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Empty-state suggestion -->
      <div v-if="!filteredCollaborators.length" class="empty-state">
        <div class="empty-state-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="empty-state-title">No collaborators yet</div>
        <div class="empty-state-sub">
          Invite an agent, broker or partner to share your property journey.
        </div>
        <button class="btn-secondary" @click="openCollaboratorTypeModal">
          + Add collaborator
        </button>
      </div>
    </main>

    <!-- Floating add button -->
    <button
      class="fab"
      aria-label="Add collaborator"
      @click="openCollaboratorTypeModal"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <BaseDrawer
      v-model="showCollaboratorTypeModal"
      title="Collaborator Type"
      :show-back-button="false"
      @close="closeCollaboratorTypeModal"
    >
      <p class="mb-5 text-[15px]-regular leading-[20px] text-[#3c3c43]/60">
        Assign type of partnership to this account...
      </p>

      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="option in collaboratorTypeOptions"
          :key="option.key"
          type="button"
          class="rounded-3xl bg-white px-4 py-6 min-h-[170px] border text-center"
          :class="
            selectedCollaboratorType === option.key
              ? 'border-brand-aqua border-[3px]'
              : 'border-[#d1d1d6]'
          "
          @click="selectedCollaboratorType = option.key"
        >
          <Icon
            name="i-heroicons-user-group"
            class="w-[15px] h-[20px] mx-auto text-[#3C3C43]/60"
          />
          <p
            class="mt-3 text-[17px]-regular leading-[22px] font-semibold text-[#3C3C43]/60 tracking-[-0.43px]"
          >
            {{ option.title }}
          </p>
          <p
            class="mt-2 text-[13px]-regular leading-[18px] text-[#3C3C43]/60 tracking-[-0.08px]"
          >
            {{ option.description }}
          </p>
        </button>
      </div>

      <template #footer>
        <button
          type="button"
          class="w-full h-14 rounded-2xl bg-brand-aqua text-white text-[20px] leading-[24px] font-medium"
          @click="continueCollaboratorType"
        >
          Continue
        </button>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup>
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import ProfilePageTitle from '~/components/profile/ProfilePageTitle.vue'

definePageMeta({
  title: 'Collaborators - UmovingU',
  middleware: 'auth',
})

const { fetchCollaborators, removeCollaborator } = useProfile()

const searchText = ref('')
const collaborators = ref([])

const roleLabels = {
  partner: 'Partner',
  solicitor: 'Solicitor',
  'estate-agent': 'Estate Agent',
  'mortgage-broker': 'Mortgage Broker',
}

const clientAccessLabels = {
  shared: 'Shared Clients',
  all: 'All Clients',
  none: 'No Clients',
}

const loadCollaborators = async () => {
  try {
    const data = await fetchCollaborators()
    collaborators.value = data.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      role: c.role || 'partner',
      roleLabel: roleLabels[c.role] || c.role || 'Collaborator',
      type: c.role || 'partner',
      propertyCount: c.propertyCount ?? 0,
      clientAccessLabel: clientAccessLabels[c.clientAccess] || 'Shared Clients',
      accessLevel:
        c.permission === 'all'
          ? 'All Properties'
          : c.permission === 'specific'
            ? 'Specific Properties'
            : 'Assign Later',
      status: 'active',
      avatar: c.avatarUrl || null,
    }))
  } catch {
    // list stays empty
  }
}

onMounted(loadCollaborators)

const ownerName = computed(() => 'You')

const partnerCount = computed(
  () => collaborators.value.filter((p) => p.type === 'partner').length,
)

const clientCount = computed(
  () => collaborators.value.filter((p) => p.type === 'client').length,
)

const pendingCount = computed(
  () => collaborators.value.filter((p) => p.status === 'pending').length,
)

const activeFilter = ref('all')

const filterChips = computed(() => [
  { value: 'all', label: 'Everyone', count: collaborators.value.length },
  {
    value: 'solicitor',
    label: 'Solicitors',
    count: collaborators.value.filter((p) =>
      /solicitor/i.test(p.role || p.roleLabel || ''),
    ).length,
  },
  {
    value: 'agent',
    label: 'Agents',
    count: collaborators.value.filter((p) =>
      /agent|estate agent/i.test(p.role || p.roleLabel || ''),
    ).length,
  },
  {
    value: 'partner',
    label: 'Partners',
    count: collaborators.value.filter((p) =>
      /partner|owner|co-owner/i.test(p.role || p.roleLabel || ''),
    ).length,
  },
])

const propertyCount = computed(() => {
  const ids = new Set()
  for (const p of collaborators.value) {
    for (const pid of p.propertyIds || []) ids.add(pid)
  }
  return ids.size || collaborators.value.length
})

const filteredCollaborators = computed(() => {
  let list = collaborators.value
  if (activeFilter.value === 'solicitor') {
    list = list.filter((p) => /solicitor/i.test(p.role || p.roleLabel || ''))
  } else if (activeFilter.value === 'agent') {
    list = list.filter((p) =>
      /agent|estate agent/i.test(p.role || p.roleLabel || ''),
    )
  } else if (activeFilter.value === 'partner') {
    list = list.filter((p) =>
      /partner|owner|co-owner/i.test(p.role || p.roleLabel || ''),
    )
  }
  if (!searchText.value.trim()) return list
  const query = searchText.value.toLowerCase()
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      (p.role || '').toLowerCase().includes(query),
  )
})

function avatarTone(person) {
  const r = (person.role || person.roleLabel || '').toLowerCase()
  if (r.includes('solicitor')) return 'solicitor'
  if (r.includes('agent')) return 'agent'
  if (r.includes('partner') || r.includes('owner')) return 'partner'
  if (r.includes('broker')) return 'broker'
  return 'solicitor'
}
function collabInitials(person) {
  const parts = (person.name || '').trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
}
function openSearch() {
  // Lightweight inline search prompt. The chips above already filter the
  // list; this just exposes the text filter.
  const q = window.prompt('Search collaborators', searchText.value || '')
  if (q !== null) searchText.value = q.trim()
}

const summaryCollaborators = computed(() => collaborators.value.slice(0, 4))

const showCollaboratorTypeModal = ref(false)
const selectedCollaboratorType = ref('referrals')

const collaboratorTypeOptions = [
  {
    key: 'solicitor',
    title: 'Solicitor',
    description:
      'Share with your solicitor so they can access the property information needed for the legal process.',
  },
  {
    key: 'partner',
    title: 'Partner',
    description:
      'Share with your partner so they can view and manage your property details with you.',
  },
  {
    key: 'estate-agent',
    title: 'Estate Agent',
    description:
      'Give your estate agent access to the property details they need to help move the sale forward.',
  },
  {
    key: 'mortgage-broker',
    title: 'Mortgage Broker',
    description:
      'Share with your mortgage broker so they can view your property details and support your mortgage application.',
  },
]

const openCollaboratorTypeModal = () => {
  showCollaboratorTypeModal.value = true
}

const closeCollaboratorTypeModal = () => {
  showCollaboratorTypeModal.value = false
}

const continueCollaboratorType = () => {
  showCollaboratorTypeModal.value = false
  navigateTo(`/profile/add-collaborator?type=${selectedCollaboratorType.value}`)
}

const goBack = useGoBack('/profile')
</script>

<style scoped>
/* Page surface */
.cl-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 96px;
}

/* Nav bar */
.cl-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.cl-nav-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
  transition: background 0.2s;
}
.cl-nav-icon-btn:hover {
  background: #f0f2f1;
}
.cl-nav-icon-btn svg {
  width: 18px;
  height: 18px;
}
.cl-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}

.cl-body {
  position: relative;
}

.atm-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal {
  background: radial-gradient(
    ellipse 60% 80% at 50% 0%,
    rgba(61, 189, 163, 0.14),
    transparent 65%
  );
}

/* Hero */
.cl-hero {
  padding: 8px 22px 14px;
  position: relative;
  z-index: 1;
}
.hero-greeting {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: 16px;
  letter-spacing: 0.2px;
  color: #1f7a66;
  margin-bottom: 4px;
  text-transform: none;
}
.cl-h1 {
  font-size: 32px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1.2px;
  line-height: 1;
  margin-bottom: 10px;
}
.cl-h1-count {
  display: inline-block;
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 22px;
  font-weight: 400;
  color: #3dbda3;
  vertical-align: 8px;
  margin-left: 6px;
  letter-spacing: -0.5px;
}
.hero-stats {
  display: inline-flex;
  align-items: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #4a5868;
  letter-spacing: -0.2px;
  flex-wrap: wrap;
}
.hero-stats .stat-num {
  color: #0e2840;
  font-weight: 800;
  font-feature-settings: 'tnum';
  margin-right: 4px;
}
.hero-stats .stat-num.teal {
  color: #1f7a66;
}
.hero-stats .stat-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #b5bdc4;
  margin: 0 8px;
  display: inline-block;
}

/* Filter chips */
.cl-filter-row {
  display: flex;
  gap: 6px;
  padding: 4px 22px 16px;
  overflow-x: auto;
  scrollbar-width: none;
  position: relative;
  z-index: 1;
}
.cl-filter-row::-webkit-scrollbar {
  display: none;
}
.cl-chip {
  background: #fff;
  color: #4a5868;
  border: 1px solid #e8eceb;
  border-radius: 100px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  transition: all 0.15s;
  letter-spacing: -0.1px;
}
.cl-chip.active {
  background: #0e2840;
  color: #fff;
  border-color: #0e2840;
}
.cl-chip-num {
  font-size: 10px;
  font-weight: 800;
  color: #8a95a0;
  font-feature-settings: 'tnum';
}
.cl-chip.active .cl-chip-num {
  color: rgba(255, 255, 255, 0.7);
}

/* Collaborator card */
.collaborator-card {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 16px;
  padding: 14px;
  margin: 0 22px 10px;
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.collaborator-card:hover {
  border-color: #e2f1ea;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 40, 64, 0.06);
}
.collab-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.08);
}
.collab-avatar--solicitor {
  background: linear-gradient(155deg, #2c5f56, #143f38);
}
.collab-avatar--agent {
  background: linear-gradient(155deg, #c18a38, #8a5f1f);
}
.collab-avatar--partner {
  background: linear-gradient(155deg, #c5664a, #8a3f26);
}
.collab-avatar--broker {
  background: linear-gradient(155deg, #6b4e9f, #3f2870);
}

.collab-content {
  flex: 1;
  min-width: 0;
}
.collab-name {
  font-size: 14.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.collab-role {
  font-size: 11px;
  font-weight: 700;
  color: #1f7a66;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  margin-top: 1px;
}
.collab-org {
  font-size: 11.5px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 4px;
  line-height: 1.3;
}
.collab-properties {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.collab-prop-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f1f9f4;
  color: #1f7a66;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px 3px 6px;
  border-radius: 100px;
}
.collab-prop-tag svg {
  width: 9px;
  height: 9px;
  opacity: 0.7;
}
.collab-prop-tag.global {
  background: #f5f4f0;
  color: #4a5868;
}
.collab-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.collab-action-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f0f2f1;
  color: #4a5868;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.collab-action-btn:hover {
  background: #f1f9f4;
  color: #1f7a66;
}
.collab-action-btn svg {
  width: 13px;
  height: 13px;
}

/* Empty state */
.empty-state {
  margin: 16px 22px;
  padding: 24px 18px;
  background: #f5f4f0;
  border: 1px dashed #b5bdc4;
  border-radius: 16px;
  text-align: center;
}
.empty-state-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1f7a66;
  margin-bottom: 10px;
  box-shadow: 0 2px 6px rgba(14, 40, 64, 0.06);
}
.empty-state-icon svg {
  width: 22px;
  height: 22px;
}
.empty-state-title {
  font-size: 14px;
  font-weight: 800;
  color: #0e2840;
  margin-bottom: 4px;
  letter-spacing: -0.2px;
}
.empty-state-sub {
  font-size: 12px;
  font-weight: 600;
  color: #4a5868;
  margin-bottom: 14px;
  line-height: 1.4;
  max-width: 240px;
  margin-left: auto;
  margin-right: auto;
}
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #e8eceb;
  color: #0e2840;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary:hover {
  border-color: #3dbda3;
  color: #1f7a66;
}

/* Floating add button */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 20;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #3dbda3;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(61, 189, 163, 0.4);
  transition: all 0.18s;
}
.fab:hover {
  background: #2a9484;
  transform: translateY(-2px) scale(1.05);
}
.fab svg {
  width: 22px;
  height: 22px;
}

.avatar-stack {
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-avatar {
  width: 118px;
  height: 118px;
  flex: 0 0 auto;
  border-radius: 9999px;
  border: 8px solid #ffffff;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
}

.summary-avatar + .summary-avatar {
  margin-left: -18px;
}
</style>
