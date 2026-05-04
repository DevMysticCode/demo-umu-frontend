<template>
  <div class="ac-page mobile-container">
    <!-- Nav bar -->
    <div class="ac-nav-bar">
      <button class="ac-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="ac-nav-title">Add collaborator</div>
      <div style="width: 38px" />
    </div>

    <main class="ac-body">
      <div class="atm-bg teal" />

      <div class="ac-hero">
        <div class="ac-greeting">Bring in your team</div>
        <div class="ac-h1">Add a collaborator</div>
      </div>

      <!-- Role -->
      <div class="section-heading">Their role</div>
      <div class="ac-section">
        <div class="mform-radio-group">
          <button
            v-for="role in roles"
            :key="role.value"
            type="button"
            class="mform-radio"
            :class="[role.value, { active: collaboratorRole === role.value }]"
            @click="collaboratorRole = role.value"
          >
            <div class="mfr-icon" v-html="role.icon" />
            {{ role.label }}
          </button>
        </div>
      </div>

      <!-- Find user -->
      <div class="section-heading">Use existing</div>
      <div class="ac-section">
        <div class="ac-search">
          <span class="ac-search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="ac-search-input"
            placeholder="Search by name or email"
            @input="onSearchInput"
          />
          <span v-if="searching" class="ac-search-spin" />
        </div>

        <div v-if="searchResults.length > 0 && !selectedUser" class="ac-results">
          <button
            v-for="result in searchResults"
            :key="result.id"
            type="button"
            class="ac-result"
            @click="selectUser(result)"
          >
            <div class="ac-result-avatar" :style="avatarStyle(result.name)">
              <img v-if="result.avatarUrl" :src="result.avatarUrl" :alt="result.name" />
              <span v-else>{{ initials(result.name) }}</span>
            </div>
            <div class="ac-result-info">
              <div class="ac-result-name">{{ result.name }}</div>
              <div class="ac-result-email">{{ result.email }}</div>
            </div>
          </button>
        </div>

        <div v-if="selectedUser" class="ac-existing-row active">
          <div class="ac-result-avatar" :style="avatarStyle(selectedUser.name)">
            <img v-if="selectedUser.avatarUrl" :src="selectedUser.avatarUrl" :alt="selectedUser.name" />
            <span v-else>{{ initials(selectedUser.name) }}</span>
          </div>
          <div class="ac-result-info">
            <div class="ac-result-name">{{ selectedUser.name }}</div>
            <div class="ac-result-email">{{ selectedUser.email }}</div>
          </div>
          <button class="ac-result-clear" type="button" aria-label="Clear" @click="clearUser">×</button>
        </div>

        <p v-if="searchQuery.length >= 2 && !searching && searchResults.length === 0 && !selectedUser" class="ac-no-results">
          No registered users found for "{{ searchQuery }}"
        </p>
      </div>

      <!-- Or add new -->
      <div class="section-heading">Or invite by email</div>
      <div class="ac-section">
        <input
          v-model="inviteName"
          type="text"
          class="mform-input"
          placeholder="Full name"
        />
        <div class="ac-spacer" />
        <input
          v-model="inviteOrg"
          type="text"
          class="mform-input"
          placeholder="Firm or company"
        />
        <div class="ac-spacer" />
        <input
          v-model="inviteEmail"
          type="email"
          class="mform-input"
          placeholder="Email address"
        />
        <p class="ac-hint">If you can't find them in UMU, we'll send an invite to join.</p>
      </div>

      <!-- Attach to properties -->
      <div class="section-heading">
        Attach to properties
        <span class="sh-action" @click="setAllProperties(true)">Select all</span>
      </div>
      <div class="ac-section">
        <div v-if="passportsLoading" class="ac-loading">Loading your properties…</div>
        <div v-else-if="properties.length === 0" class="ac-empty">
          You don't have any property passports yet. They'll have access to your account.
        </div>
        <div v-else class="ac-property-list">
          <button
            v-for="p in properties"
            :key="p.id"
            type="button"
            class="ac-property"
            :class="{ selected: p.selected }"
            @click="toggleProperty(p.id)"
          >
            <div class="ac-property-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <div class="ac-property-text">
              <div class="ac-property-title">{{ p.title }}</div>
              <div v-if="p.postcode" class="ac-property-meta">{{ p.postcode }}</div>
            </div>
            <div class="ac-property-check">
              <svg v-if="p.selected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Communications -->
      <div class="section-heading">Communications</div>
      <div class="ac-section">
        <div class="ac-toggle-row">
          <div class="ac-toggle-label">Allow direct messages</div>
          <button
            type="button"
            class="pir-toggle"
            :class="{ on: allowCommunications }"
            @click="allowCommunications = !allowCommunications"
            aria-label="Allow communications"
          />
        </div>
      </div>

      <p v-if="saveError" class="ac-error">{{ saveError }}</p>

      <div class="ac-actions">
        <button class="btn-secondary" type="button" @click="goBack">Cancel</button>
        <button
          class="btn-primary"
          type="button"
          :disabled="!canSave || saving"
          @click="save"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {{ saving ? 'Adding…' : addLabel }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
definePageMeta({ title: 'Add Collaborator - UmovingU', middleware: 'auth' })

const route = useRoute()
const { fetchUserPassports, searchUsers, addCollaborator } = useProfile()

// Role
const roles = [
  {
    value: 'solicitor',
    label: 'Solicitor',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M5 8h14"/><path d="M3 13l4-9 4 9c0 2-1.8 3.5-4 3.5S3 15 3 13z"/><path d="M13 13l4-9 4 9c0 2-1.8 3.5-4 3.5S13 15 13 13z"/></svg>',
  },
  {
    value: 'agent',
    label: 'Estate agent',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="3"/><path d="M11 13l5-5 4 4-5 5"/><path d="M16 8l1-1"/></svg>',
  },
  {
    value: 'broker',
    label: 'Mortgage broker',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 7c0-2-1.6-3.5-4.5-3.5S9 5 9 7c0 4 9 4 9 8 0 2-1.6 3.5-4.5 3.5S9 17 9 15"/><line x1="13.5" y1="2" x2="13.5" y2="22"/></svg>',
  },
  {
    value: 'partner',
    label: 'Co-owner',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  },
]
const collaboratorRole = ref(typeof route.query.type === 'string' && roles.find((r) => r.value === route.query.type) ? route.query.type : 'solicitor')

// User search
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const selectedUser = ref(null)
let searchTimer = null

const onSearchInput = () => {
  if (selectedUser.value) return
  clearTimeout(searchTimer)
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = []
    return
  }
  searching.value = true
  searchTimer = setTimeout(async () => {
    try {
      searchResults.value = await searchUsers(searchQuery.value)
    } catch {
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 350)
}

const selectUser = (user) => {
  selectedUser.value = user
  searchQuery.value = user.name
  searchResults.value = []
  inviteName.value = ''
  inviteOrg.value = ''
  inviteEmail.value = ''
}

const clearUser = () => {
  selectedUser.value = null
  searchQuery.value = ''
  searchResults.value = []
}

// Invite by email
const inviteName = ref('')
const inviteOrg = ref('')
const inviteEmail = ref('')

watch([inviteName, inviteEmail], () => {
  if ((inviteName.value || inviteEmail.value) && selectedUser.value) clearUser()
})

// Properties
const properties = ref([])
const passportsLoading = ref(false)

const loadPassports = async () => {
  passportsLoading.value = true
  try {
    const passports = await fetchUserPassports()
    properties.value = passports.map((p) => ({
      id: p.id,
      title: p.addressLine1 || p.address || 'Property',
      postcode: p.postcode || '',
      selected: false,
    }))
  } catch {
    properties.value = []
  } finally {
    passportsLoading.value = false
  }
}

const toggleProperty = (id) => {
  properties.value = properties.value.map((p) =>
    p.id === id ? { ...p, selected: !p.selected } : p
  )
}
const setAllProperties = (val) => {
  properties.value = properties.value.map((p) => ({ ...p, selected: val }))
}
const selectedPropertyCount = computed(() => properties.value.filter((p) => p.selected).length)
const selectedPropertyIds = computed(() => properties.value.filter((p) => p.selected).map((p) => p.id))

// Comms
const allowCommunications = ref(true)

// Save
const saving = ref(false)
const saveError = ref('')

const inviteValid = computed(() =>
  inviteName.value.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.value.trim())
)
const canSave = computed(() => !!selectedUser.value || inviteValid.value)

const addLabel = computed(() => {
  if (selectedUser.value) return `Add ${selectedUser.value.name?.split(' ')[0] || 'collaborator'}`
  if (inviteValid.value) return `Invite ${inviteName.value.trim().split(/\s+/)[0]}`
  return 'Add collaborator'
})

const save = async () => {
  if (!canSave.value) return
  saving.value = true
  saveError.value = ''
  try {
    const ids = selectedPropertyIds.value
    const payload = {
      role: collaboratorRole.value,
      permission: ids.length > 0 ? 'specific' : 'all',
      accessDuration: 'permanent',
      clientAccess: 'shared',
      allowComms: allowCommunications.value,
    }
    if (ids.length > 0) payload.propertyIds = ids

    if (selectedUser.value) {
      payload.collaboratorId = selectedUser.value.id
    } else {
      payload.inviteName = inviteName.value.trim()
      payload.inviteOrg = inviteOrg.value.trim() || undefined
      payload.inviteEmail = inviteEmail.value.trim()
    }

    await addCollaborator(payload)
    navigateTo('/profile/collaborator-information')
  } catch (e) {
    saveError.value = e?.data?.message || 'Failed to add collaborator'
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
    return
  }
  navigateTo('/profile/collaborator-information')
}

// Avatar helpers
const initials = (name) => {
  if (!name) return '?'
  return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}
const avatarStyle = (name) => {
  const palettes = [
    'linear-gradient(155deg, #2C5F56, #143F38)',
    'linear-gradient(155deg, #D4A659, #6F4D14)',
    'linear-gradient(155deg, #FF8B5A, #B85B36)',
    'linear-gradient(155deg, #9D7BFF, #6B4E9F)',
  ]
  const i = (name?.charCodeAt(0) ?? 0) % palettes.length
  return { background: palettes[i] }
}

onMounted(loadPassports)
</script>

<style scoped>
.ac-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}

.ac-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.ac-nav-icon-btn {
  width: 38px; height: 38px;
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
.ac-nav-icon-btn:hover { background: #f0f2f1; }
.ac-nav-icon-btn svg { width: 18px; height: 18px; }
.ac-nav-title {
  flex: 1; text-align: center;
  font-size: 16px; font-weight: 800;
  color: #0e2840; letter-spacing: -0.4px;
}

.ac-body { position: relative; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(61, 189, 163, 0.14), transparent 65%);
}

/* Hero */
.ac-hero { padding: 8px 22px 14px; position: relative; z-index: 1; }
.ac-greeting {
  font-family: 'Instrument Serif', 'Times New Roman', Georgia, serif;
  font-style: italic;
  font-size: 16px;
  color: #1f7a66;
  margin-bottom: 4px;
}
.ac-h1 {
  font-size: 28px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1px;
  line-height: 1.05;
}

.section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 8px 22px 8px;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.sh-action {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  color: #1f7a66;
  cursor: pointer;
  text-transform: none;
  letter-spacing: -0.1px;
}

.ac-section { padding: 0 22px 4px; position: relative; z-index: 1; }
.ac-spacer { height: 6px; }

/* Search */
.ac-search { position: relative; }
.ac-search-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px 10px 38px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #0e2840;
  outline: none;
  transition: all 0.18s;
}
.ac-search-input::placeholder { color: #8a95a0; font-weight: 500; }
.ac-search-input:focus { border-color: #3dbda3; box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.18); }
.ac-search-icon {
  position: absolute;
  left: 13px; top: 50%;
  transform: translateY(-50%);
  color: #8a95a0;
}
.ac-search-icon svg { width: 14px; height: 14px; }
.ac-search-spin {
  position: absolute;
  right: 12px; top: 50%;
  width: 14px; height: 14px;
  margin-top: -7px;
  border: 2px solid #3dbda3;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ac-results {
  margin-top: 6px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  overflow: hidden;
}
.ac-result {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f0f2f1;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  color: inherit;
}
.ac-result:last-child { border-bottom: none; }
.ac-result:hover { background: #fafaf8; }

.ac-existing-row {
  margin-top: 6px;
  background: #fff;
  border: 1.5px solid #3dbda3;
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ac-existing-row.active { background: linear-gradient(135deg, #f1f9f4, #e2f1ea); }

.ac-result-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  overflow: hidden;
}
.ac-result-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ac-result-info { flex: 1; min-width: 0; }
.ac-result-name {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
}
.ac-result-email { font-size: 11px; font-weight: 600; color: #4a5868; margin-top: 1px; }
.ac-result-clear {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: none;
  background: #f0f2f1;
  color: #4a5868;
  font-size: 18px;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ac-no-results {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #8a95a0;
}

.ac-hint {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #4a5868;
}

/* Form */
.mform-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #0e2840;
  outline: none;
  transition: all 0.18s;
}
.mform-input:focus { border-color: #3dbda3; box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.18); }
.mform-input::placeholder { color: #8a95a0; font-weight: 500; }

.mform-radio-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.mform-radio {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #0e2840;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.18s;
  text-align: left;
}
.mform-radio:hover { border-color: #d9dee2; }
.mform-radio.solicitor.active { border-color: #2c5f56; background: #e2f1ea; color: #143f38; }
.mform-radio.solicitor.active .mfr-icon { background: #2c5f56; color: #fff; }
.mform-radio.agent.active { border-color: #d4a659; background: #fdf4dc; color: #6f4d14; }
.mform-radio.agent.active .mfr-icon { background: #f5c44c; color: #6f4d14; }
.mform-radio.broker.active { border-color: #9d7bff; background: #ede5ff; color: #6b4e9f; }
.mform-radio.broker.active .mfr-icon { background: #9d7bff; color: #fff; }
.mform-radio.partner.active { border-color: #ff8b5a; background: #ffe9dd; color: #b85b36; }
.mform-radio.partner.active .mfr-icon { background: #ff8b5a; color: #fff; }
.mfr-icon {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: #f1f9f4;
  color: #1f7a66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mfr-icon svg { width: 13px; height: 13px; }

/* Property list */
.ac-property-list { display: flex; flex-direction: column; gap: 6px; }
.ac-property {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.ac-property:hover { border-color: #d9dee2; }
.ac-property.selected {
  border-color: #3dbda3;
  background: #f1f9f4;
}
.ac-property-icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: #f1f9f4;
  color: #1f7a66;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ac-property.selected .ac-property-icon { background: #3dbda3; color: #fff; }
.ac-property-icon svg { width: 14px; height: 14px; }
.ac-property-text { flex: 1; min-width: 0; }
.ac-property-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ac-property-meta { font-size: 10.5px; font-weight: 600; color: #8a95a0; margin-top: 1px; }
.ac-property-check {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid #d9dee2;
  background: #fff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.ac-property.selected .ac-property-check {
  background: #3dbda3;
  border-color: #3dbda3;
}
.ac-property-check svg { width: 12px; height: 12px; }

.ac-loading,
.ac-empty {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #4a5868;
  text-align: center;
}

/* Toggle row */
.ac-toggle-row {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ac-toggle-label {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
}
.pir-toggle {
  width: 40px; height: 22px;
  border-radius: 100px;
  background: #e8eceb;
  border: none;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.pir-toggle::after {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s;
}
.pir-toggle.on { background: #3dbda3; }
.pir-toggle.on::after { transform: translateX(18px); }

.ac-error {
  text-align: center;
  color: #b85b36;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 22px 0;
}

/* Actions */
.ac-actions {
  padding: 14px 22px 0;
  display: flex;
  gap: 8px;
  position: relative;
  z-index: 1;
}
.btn-secondary {
  flex: 1;
  background: #f0f2f1;
  color: #0e2840;
  border: none;
  border-radius: 12px;
  padding: 13px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
}
.btn-secondary:hover { background: #e8eceb; }
.btn-primary {
  flex: 2;
  background: #3dbda3;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 13px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(61, 189, 163, 0.32);
}
.btn-primary:hover { background: #2a9484; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.btn-primary svg { width: 14px; height: 14px; }
</style>
