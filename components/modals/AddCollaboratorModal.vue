<template>
  <BaseDrawer
    :model-value="isOpen"
    :title="stepTitle"
    :show-back-button="showBack"
    @update:model-value="onDrawerToggle"
    @back="goBack"
  >
    <div class="add-collab">
      <p v-if="!props.isOwner" class="ac-owner-note">
        Only the passport owner can add or remove collaborators. You can see
        who already has access below.
      </p>

      <template v-if="props.isOwner">
        <!-- STEP 1: role + permission -->
        <template v-if="step === 'role'">
          <p class="ac-lede">
            Choose the role and what this collaborator can do before picking
            who to add.
          </p>
          <div class="ac-batch-opts">
            <label class="ac-field">
              <span class="ac-field-label">Their role</span>
              <select v-model="batchRole" class="ac-select">
                <option value="">Not specified</option>
                <option value="Solicitor / Conveyancer">Solicitor / Conveyancer</option>
                <option value="Estate agent">Estate agent</option>
                <option value="Co-owner">Co-owner</option>
                <option value="Surveyor">Surveyor</option>
                <option value="Buyer">Buyer</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label class="ac-field">
              <span class="ac-field-label">What can they do?</span>
              <div class="ac-radio-group">
                <label
                  v-for="opt in PERMISSION_OPTIONS"
                  :key="opt.value"
                  class="ac-radio-card"
                  :class="{ selected: batchPermission === opt.value }"
                >
                  <input type="radio" :value="opt.value" v-model="batchPermission" />
                  <span class="ac-radio-card-body">
                    <span class="ac-radio-card-title">{{ opt.label }}</span>
                    <span class="ac-radio-card-desc">{{ opt.desc }}</span>
                  </span>
                </label>
              </div>
            </label>
          </div>

          <div v-if="collaborators.length > 0" class="ac-existing">
            <div class="ac-existing-label">Current collaborators</div>
            <div v-for="c in collaborators" :key="c.id" class="ac-existing-row">
              <div class="ac-avatar">
                {{ initials(`${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email) }}
              </div>
              <div class="ac-result-body">
                <div class="ac-result-name">
                  {{ [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email }}
                  <span v-if="c.role" class="ac-existing-role">· {{ c.role }}</span>
                </div>
                <div class="ac-result-email">{{ c.email }}</div>
                <div class="ac-existing-meta">
                  {{ PERMISSION_LABEL[c.permission] || PERMISSION_LABEL.view }}
                  <template v-if="c.accessDuration === 'specific_date' && c.expiresAt">
                    · Until {{ new Date(c.expiresAt).toLocaleDateString() }}
                  </template>
                  <template v-else-if="c.accessDuration === 'until_completion'"> · Until completion</template>
                </div>
                <label class="ac-checkbox-row ac-checkbox-row--small">
                  <input
                    type="checkbox"
                    :checked="c.historyAccess"
                    :disabled="!props.isOwner"
                    @change="toggleHistoryAccess(c)"
                  />
                  Passport history
                </label>
              </div>
              <button type="button" class="ac-remove-btn" @click="removeExisting(c.id)">
                Remove
              </button>
            </div>
          </div>
        </template>

        <!-- STEP 2: select sections -->
        <template v-else-if="step === 'sections'">
          <p class="ac-lede">Choose what information they can see.</p>
          <div class="ac-radio-group">
            <label class="ac-radio-card" :class="{ selected: sectionScope === 'entire' }">
              <input type="radio" value="entire" v-model="sectionScope" />
              <span class="ac-radio-card-body">
                <span class="ac-radio-card-title">Entire passport</span>
                <span class="ac-radio-card-desc">They can see all information you've shared.</span>
              </span>
            </label>
            <label class="ac-radio-card" :class="{ selected: sectionScope === 'selected' }">
              <input type="radio" value="selected" v-model="sectionScope" />
              <span class="ac-radio-card-body">
                <span class="ac-radio-card-title">Selected sections</span>
                <span class="ac-radio-card-desc">Choose specific sections.</span>
              </span>
            </label>
          </div>

          <div v-if="sectionScope === 'selected'" class="ac-section-list">
            <div v-if="sectionsLoading" class="ac-check-note">Loading sections…</div>
            <label
              v-for="s in availableSections"
              :key="s.key"
              class="ac-section-check-row"
            >
              <input
                type="checkbox"
                :value="s.key"
                v-model="selectedSectionKeys"
              />
              {{ s.title }}
            </label>
          </div>
        </template>

        <!-- STEP 3: passport history -->
        <template v-else-if="step === 'history'">
          <div class="ac-toggle-card">
            <div class="ac-toggle-card-body">
              <span class="ac-toggle-card-title">Allow them to view passport history</span>
              <span class="ac-toggle-card-desc">
                They'll be able to see previous updates and changes to the
                information you've shared with them.
              </span>
            </div>
            <label class="ac-switch">
              <input type="checkbox" v-model="batchHistoryAccess" />
              <span class="ac-switch-track"><span class="ac-switch-thumb" /></span>
            </label>
          </div>
          <p class="ac-step-note">
            They will only see the history for sections and documents you
            have shared with them.
          </p>
        </template>

        <!-- STEP 4: access duration -->
        <template v-else-if="step === 'duration'">
          <div class="ac-radio-group">
            <label class="ac-radio-card" :class="{ selected: batchAccessDuration === 'until_removed' }">
              <input type="radio" value="until_removed" v-model="batchAccessDuration" />
              <span class="ac-radio-card-body">
                <span class="ac-radio-card-title">Until I remove them</span>
                <span class="ac-radio-card-desc">They will have access until you remove them.</span>
              </span>
            </label>
            <label class="ac-radio-card" :class="{ selected: batchAccessDuration === 'until_completion' }">
              <input type="radio" value="until_completion" v-model="batchAccessDuration" />
              <span class="ac-radio-card-body">
                <span class="ac-radio-card-title">Until completion</span>
                <span class="ac-radio-card-desc">Access will automatically end on completion of the sale.</span>
              </span>
            </label>
            <label class="ac-radio-card" :class="{ selected: batchAccessDuration === 'specific_date' }">
              <input type="radio" value="specific_date" v-model="batchAccessDuration" />
              <span class="ac-radio-card-body">
                <span class="ac-radio-card-title">Choose a date</span>
                <span class="ac-radio-card-desc">Set a specific end date for their access.</span>
              </span>
            </label>
          </div>
          <label v-if="batchAccessDuration === 'specific_date'" class="ac-field">
            <span class="ac-field-label">Access ends on</span>
            <input v-model="batchExpiresAt" type="date" class="ac-select" />
          </label>
        </template>

        <!-- STEP 5: search / select collaborator -->
        <template v-else-if="step === 'search'">
          <p class="ac-lede">
            Enter the full email address of each person you want to add. For
            privacy, we'll only confirm whether that email has an account -
            not who it belongs to.
          </p>
          <div class="ac-search">
            <span class="ac-search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </span>
            <input
              v-model="emailInput"
              type="email"
              class="ac-search-input"
              placeholder="Enter their full email address"
              @input="onEmailInput"
              @keydown.enter.prevent="addCheckedEmail"
              aria-label="Enter their full email address"
            />
            <span v-if="checking" class="ac-search-spin" />
          </div>

          <div v-if="checkResult" class="ac-check-result">
            <template v-if="checkResult.status === 'found'">
              <p class="ac-check-ok">✓ An account was found for this email.</p>
              <button type="button" class="ac-invite-btn" @click="addCheckedEmail">
                Add {{ checkResult.email }}
              </button>
            </template>
            <template v-else-if="checkResult.status === 'already-collaborator'">
              <p class="ac-check-note">This person is already a collaborator on this passport.</p>
            </template>
            <template v-else-if="checkResult.status === 'already-invited'">
              <p class="ac-check-note">An invite is already pending for this email.</p>
            </template>
            <template v-else-if="checkResult.status === 'is-owner'">
              <p class="ac-check-note">That's your own email - you already own this passport.</p>
            </template>
            <template v-else-if="checkResult.status === 'not-found'">
              <div class="ac-invite-prompt">
                <p>
                  No UMovingU account exists for <strong>{{ checkResult.email }}</strong>.
                  You can invite them to join - they'll be added as a
                  collaborator automatically as soon as they sign up.
                </p>
                <button type="button" class="ac-invite-btn" @click="addCheckedInvite">
                  Invite {{ checkResult.email }}
                </button>
              </div>
            </template>
          </div>

          <div v-if="selected.length > 0" class="ac-selected-block">
            <div class="ac-selected-label">To add ({{ selected.length }})</div>
            <div class="ac-chips">
              <div v-for="s in selected" :key="s.email" class="ac-chip">
                <span class="ac-chip-name">{{ s.email }}</span>
                <span v-if="s.mode === 'invite'" class="ac-chip-tag">Invite</span>
                <button type="button" class="ac-chip-x" aria-label="Remove" @click="removeSelected(s.email)">×</button>
              </div>
            </div>
          </div>
        </template>

        <!-- STEP 6: review and send -->
        <template v-else-if="step === 'review'">
          <div class="ac-review-block">
            <div class="ac-review-label">Collaborators</div>
            <div v-for="s in selected" :key="s.email" class="ac-review-row">
              <span>{{ s.email }}</span>
              <b>{{ s.mode === 'invite' ? 'Invite' : 'Add' }}</b>
            </div>
          </div>
          <div class="ac-review-row"><span>Role</span><b>{{ batchRole || 'Not specified' }}</b></div>
          <div class="ac-review-row"><span>Permission</span><b>{{ PERMISSION_LABEL[batchPermission] }}</b></div>
          <div class="ac-review-row">
            <span>Sections</span>
            <b>{{ sectionScope === 'entire' ? 'Entire passport' : `${selectedSectionKeys.length} selected` }}</b>
          </div>
          <div class="ac-review-row"><span>Passport history</span><b>{{ batchHistoryAccess ? 'Allowed' : 'Not allowed' }}</b></div>
          <div class="ac-review-row">
            <span>Access duration</span>
            <b>
              <template v-if="batchAccessDuration === 'until_removed'">Until removed</template>
              <template v-else-if="batchAccessDuration === 'until_completion'">Until completion</template>
              <template v-else>{{ batchExpiresAt ? new Date(batchExpiresAt).toLocaleDateString() : 'Choose a date' }}</template>
            </b>
          </div>
        </template>

        <!-- STEP 7: done -->
        <template v-else-if="step === 'done'">
          <div class="ac-done">
            <div class="ac-done-icon">✓</div>
            <h3 class="ac-done-title">{{ doneTitle }}</h3>
            <p class="ac-done-text">{{ doneText }}</p>
          </div>
        </template>

        <div v-if="error" class="ac-error" role="alert">{{ error }}</div>
        <div v-if="success && step !== 'done'" class="ac-success">{{ success }}</div>
      </template>

      <!-- Non-owner, read-only collaborators list -->
      <div v-if="!props.isOwner && collaborators.length > 0" class="ac-existing">
        <div class="ac-existing-label">Current collaborators</div>
        <div v-for="c in collaborators" :key="c.id" class="ac-existing-row">
          <div class="ac-avatar">
            {{ initials(`${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || c.email) }}
          </div>
          <div class="ac-result-body">
            <div class="ac-result-name">
              {{ [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email }}
              <span v-if="c.role" class="ac-existing-role">· {{ c.role }}</span>
            </div>
            <div class="ac-result-email">{{ c.email }}</div>
          </div>
        </div>
      </div>
    </div>

    <template v-if="props.isOwner && step !== 'done'" #footer>
      <button class="ac-submit" type="button" :disabled="!canProceed || isLoading" @click="onPrimaryAction">
        <template v-if="isLoading">Adding…</template>
        <template v-else>{{ primaryLabel }}</template>
      </button>
    </template>
    <template v-else-if="step === 'done'" #footer>
      <div class="ac-done-actions">
        <button class="ac-submit" type="button" @click="finishDone">Done</button>
        <button class="ac-secondary" type="button" @click="addAnother">Add another collaborator</button>
      </div>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import { usePassportCollaborators } from '~/composables/usePassportCollaborators'
import { usePassportApi } from '~/composables/usePassportApi'

const props = defineProps({
  show: { type: Boolean, default: false },
  passportId: { type: String, required: true },
  // Defaults to true (today's prior behaviour) for any caller that hasn't
  // been updated to pass the real value yet.
  isOwner: { type: Boolean, default: true },
})
const emit = defineEmits(['update:show', 'added', 'removed'])

const {
  checkCollaboratorEmail,
  addCollaborator,
  inviteCollaborator,
  getCollaborators,
  removeCollaborator,
  updateCollaboratorScope,
} = usePassportCollaborators()
const { getSections } = usePassportApi()

const isOpen = ref(props.show)
watch(() => props.show, (val) => {
  isOpen.value = val
  if (val) {
    reset()
    loadCollaborators()
  }
})
watch(isOpen, (val) => emit('update:show', val))

// ── Wizard steps ─────────────────────────────────────────────────
// role -> sections -> history -> duration -> search -> review -> done
const STEP_ORDER = ['role', 'sections', 'history', 'duration', 'search', 'review']
const STEP_TITLE = {
  role: 'Add Collaborator',
  sections: 'Select Sections',
  history: 'Passport history',
  duration: 'Access duration',
  search: 'Add collaborator',
  review: 'Review and send',
  done: 'Done',
}
const step = ref('role')
const stepTitle = computed(() => STEP_TITLE[step.value] || 'Add Collaborator')
const showBack = computed(() => props.isOwner && step.value !== 'role' && step.value !== 'done')

function goBack() {
  const idx = STEP_ORDER.indexOf(step.value)
  if (idx > 0) step.value = STEP_ORDER[idx - 1]
}

const PERMISSION_OPTIONS = [
  { value: 'view', label: 'View only', desc: 'Can see the information you share with them.' },
  { value: 'view_add', label: 'View & add information', desc: 'Can add documents and information, but cannot change your information.' },
  { value: 'view_add_update_own', label: 'View, add & update their own information', desc: 'Can amend things they have added, but cannot change information added by others.' },
]
const PERMISSION_LABEL = {
  view: 'View only',
  view_add: 'View & add information',
  view_add_update_own: 'View, add & update own information',
}

const batchRole = ref('')
const batchPermission = ref('view')
const batchAccessDuration = ref('until_removed')
const batchExpiresAt = ref('')
const batchHistoryAccess = ref(true)

const sectionScope = ref('entire') // 'entire' | 'selected'
const availableSections = ref([]) // [{ key, title }]
const selectedSectionKeys = ref([])
const sectionsLoading = ref(false)
let sectionsLoaded = false

async function ensureSectionsLoaded() {
  if (sectionsLoaded) return
  sectionsLoading.value = true
  try {
    const data = await getSections(props.passportId)
    availableSections.value = (data?.sections || []).map((s) => ({ key: s.key, title: s.title }))
    sectionsLoaded = true
  } catch (err) {
    if (import.meta.dev) console.warn('load sections failed', err)
  } finally {
    sectionsLoading.value = false
  }
}

const emailInput = ref('')
const checking = ref(false)
const checkResult = ref(null) // { status, email } | null
let checkTimer = null

const selected = ref([]) // { email, mode: 'add' | 'invite' }[]
const collaborators = ref([])

const isLoading = ref(false)
const error = ref('')
const success = ref('')
const doneTitle = ref('')
const doneText = ref('')

function isLikelyEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value ?? '').trim())
}

function alreadyAdded(email) {
  const normalised = email.trim().toLowerCase()
  if (selected.value.some((s) => s.email.toLowerCase() === normalised)) return true
  return collaborators.value.some((c) => c.email?.toLowerCase() === normalised)
}

function reset() {
  step.value = 'role'
  emailInput.value = ''
  checkResult.value = null
  selected.value = []
  batchRole.value = ''
  batchPermission.value = 'view'
  batchAccessDuration.value = 'until_removed'
  batchExpiresAt.value = ''
  batchHistoryAccess.value = true
  sectionScope.value = 'entire'
  selectedSectionKeys.value = []
  error.value = ''
  success.value = ''
}

async function loadCollaborators() {
  try {
    collaborators.value = await getCollaborators(props.passportId)
  } catch (err) {
    if (import.meta.dev) console.warn('load collaborators failed', err)
  }
}

function onEmailInput() {
  clearTimeout(checkTimer)
  error.value = ''
  checkResult.value = null
  const value = emailInput.value.trim()
  if (!isLikelyEmail(value)) {
    checking.value = false
    return
  }
  checking.value = true
  checkTimer = setTimeout(async () => {
    try {
      const result = await checkCollaboratorEmail(props.passportId, value)
      if (emailInput.value.trim() === value) {
        checkResult.value = { ...result, email: value }
      }
    } catch (err) {
      if (emailInput.value.trim() === value) {
        error.value = err?.data?.message || 'Could not check this email. Please try again.'
      }
    } finally {
      checking.value = false
    }
  }, 400)
}

function addCheckedEmail() {
  if (!checkResult.value || checkResult.value.status !== 'found') return
  const email = checkResult.value.email
  if (alreadyAdded(email)) {
    error.value = 'That email is already in your list or already a collaborator.'
    return
  }
  selected.value = [...selected.value, { email, mode: 'add' }]
  emailInput.value = ''
  checkResult.value = null
}

function addCheckedInvite() {
  if (!checkResult.value || checkResult.value.status !== 'not-found') return
  const email = checkResult.value.email
  if (alreadyAdded(email)) {
    error.value = 'That email is already in your list.'
    return
  }
  selected.value = [...selected.value, { email, mode: 'invite' }]
  emailInput.value = ''
  checkResult.value = null
}

function removeSelected(email) {
  selected.value = selected.value.filter((s) => s.email !== email)
}

const canProceed = computed(() => {
  switch (step.value) {
    case 'sections':
      return sectionScope.value === 'entire' || selectedSectionKeys.value.length > 0
    case 'duration':
      return batchAccessDuration.value !== 'specific_date' || !!batchExpiresAt.value
    case 'search':
      return selected.value.length > 0
    default:
      return true
  }
})

const primaryLabel = computed(() => {
  if (step.value === 'review') {
    return selected.value.length === 1 ? 'Add Collaborator' : `Add ${selected.value.length} collaborators`
  }
  if (step.value === 'search') {
    return `Next (${selected.value.length} selected)`
  }
  return 'Next'
})

async function onPrimaryAction() {
  if (step.value === 'sections') {
    step.value = 'history'
    return
  }
  if (step.value === 'review') {
    await submitAdds()
    return
  }
  const idx = STEP_ORDER.indexOf(step.value)
  if (idx >= 0 && idx < STEP_ORDER.length - 1) {
    step.value = STEP_ORDER[idx + 1]
    if (step.value === 'sections') ensureSectionsLoaded()
  }
}

async function submitAdds() {
  if (selected.value.length === 0) return
  error.value = ''
  success.value = ''
  isLoading.value = true
  const opts = {
    role: batchRole.value || undefined,
    historyAccess: batchHistoryAccess.value,
    permission: batchPermission.value,
    accessDuration: batchAccessDuration.value,
    expiresAt: batchAccessDuration.value === 'specific_date' ? batchExpiresAt.value || undefined : undefined,
    sectionKeys: sectionScope.value === 'selected' ? selectedSectionKeys.value : null,
  }
  const failures = []
  let addedCount = 0
  let invitedCount = 0
  try {
    for (const s of selected.value) {
      try {
        if (s.mode === 'invite') {
          await inviteCollaborator(props.passportId, s.email, opts)
          invitedCount += 1
        } else {
          const response = await addCollaborator(props.passportId, s.email, opts)
          addedCount += 1
          emit('added', response.collaborator ?? { email: s.email })
        }
      } catch (err) {
        const message = err?.data?.message || err?.message || 'Failed to add'
        failures.push({ email: s.email, message })
      }
    }
    if (failures.length === 0) {
      const parts = []
      if (addedCount > 0) parts.push(`${addedCount} collaborator${addedCount === 1 ? '' : 's'} added`)
      if (invitedCount > 0) parts.push(`${invitedCount} invitation${invitedCount === 1 ? '' : 's'} sent`)
      doneTitle.value = addedCount > 0 && invitedCount === 0
        ? 'Collaborator added'
        : addedCount === 0 && invitedCount > 0
          ? 'Invitation sent'
          : 'Done'
      doneText.value = parts.join(' · ') + '.'
      selected.value = []
      await loadCollaborators()
      step.value = 'done'
    } else {
      error.value =
        failures.length === selected.value.length
          ? `Couldn't add ${failures[0].email}: ${failures[0].message}`
          : `${failures.length} failed - first error: ${failures[0].message}`
      selected.value = failures.map((f) => ({ email: f.email, mode: 'add' }))
      await loadCollaborators()
    }
  } finally {
    isLoading.value = false
  }
}

function finishDone() {
  isOpen.value = false
}

function addAnother() {
  reset()
}

async function toggleHistoryAccess(collaborator) {
  error.value = ''
  try {
    await updateCollaboratorScope(props.passportId, collaborator.id, {
      historyAccess: !collaborator.historyAccess,
    })
    await loadCollaborators()
  } catch (err) {
    error.value = err?.data?.message || 'Failed to update access'
  }
}

async function removeExisting(collaboratorId) {
  if (!confirm('Remove this collaborator? They\'ll be notified by email.')) return
  isLoading.value = true
  try {
    await removeCollaborator(props.passportId, collaboratorId)
    emit('removed', collaboratorId)
    await loadCollaborators()
  } catch (err) {
    error.value = err?.data?.message || 'Failed to remove collaborator'
  } finally {
    isLoading.value = false
  }
}

function onDrawerToggle(v) {
  isOpen.value = v
}

function initials(name) {
  const s = (name ?? '').trim()
  if (!s) return '?'
  const parts = s.split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || '?'
}
</script>

<style scoped>
.add-collab {
  padding: 4px;
}
.ac-lede {
  color: #4a5868;
  font-size: 0.8438rem;
  line-height: 1.55;
  margin: 0 0 16px;
}
.ac-owner-note {
  padding: 12px 14px;
  background: #f8f7fc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #4a5868;
  font-size: 0.8125rem;
  line-height: 1.5;
  margin: 0 0 16px;
}
.ac-step-note {
  color: #6b7089;
  font-size: 0.75rem;
  line-height: 1.5;
  margin: 10px 2px 0;
}

/* role + history-access batch options */
.ac-batch-opts {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ac-field {
  display: block;
}
.ac-field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7089;
  margin-bottom: 6px;
}
.ac-select {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: #f8f7fc;
  font-size: 0.875rem;
  color: #231d45;
  font-family: inherit;
}
.ac-checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: #4a5868;
}
.ac-checkbox-row input {
  accent-color: #00a19a;
}
.ac-checkbox-row--small {
  font-size: 0.7188rem;
  color: #6b7089;
  margin-top: 4px;
}
.ac-existing-role {
  font-weight: 400;
  color: #6b7089;
}
.ac-existing-meta {
  font-size: 0.7188rem;
  color: #6b7089;
  margin-top: 2px;
}

/* radio cards - role permission / sections scope / access duration */
.ac-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ac-radio-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.ac-radio-card.selected {
  border-color: #00a19a;
  background: #f2faf8;
}
.ac-radio-card input[type='radio'] {
  margin-top: 2px;
  accent-color: #00a19a;
}
.ac-radio-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ac-radio-card-title {
  font-size: 0.8438rem;
  font-weight: 700;
  color: #231d45;
}
.ac-radio-card-desc {
  font-size: 0.75rem;
  color: #6b7089;
  line-height: 1.4;
}

/* section checklist */
.ac-section-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ac-section-check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-top: 1px solid #f0f2f5;
  font-size: 0.8438rem;
  font-weight: 600;
  color: #231d45;
}
.ac-section-check-row input {
  accent-color: #00a19a;
}

/* passport history toggle */
.ac-toggle-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
}
.ac-toggle-card-body { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.ac-toggle-card-title { font-size: 0.8438rem; font-weight: 700; color: #231d45; }
.ac-toggle-card-desc { font-size: 0.75rem; color: #6b7089; line-height: 1.45; }
.ac-switch { position: relative; flex-shrink: 0; width: 42px; height: 24px; }
.ac-switch input { position: absolute; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }
.ac-switch-track {
  display: block;
  width: 42px;
  height: 24px;
  background: #d8d6e3;
  border-radius: 999px;
  transition: background 0.15s;
}
.ac-switch-thumb {
  display: block;
  width: 18px;
  height: 18px;
  margin: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.15s;
}
.ac-switch input:checked + .ac-switch-track { background: #00a19a; }
.ac-switch input:checked + .ac-switch-track .ac-switch-thumb { transform: translateX(18px); }

/* review */
.ac-review-block { margin-bottom: 6px; }
.ac-review-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7089;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}
.ac-review-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 2px;
  border-top: 1px solid #f0f2f5;
  font-size: 0.8125rem;
  color: #4a5868;
}
.ac-review-row b { color: #231d45; font-weight: 700; text-align: right; }

/* done */
.ac-done { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 24px 8px 8px; }
.ac-done-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: #e5f4f2; color: #00a19a;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; font-weight: 800; margin-bottom: 14px;
}
.ac-done-title { font-size: 1.0625rem; font-weight: 800; color: #231d45; margin: 0 0 6px; }
.ac-done-text { font-size: 0.8438rem; color: #6b7089; margin: 0; }
.ac-done-actions { display: flex; flex-direction: column; gap: 8px; }
.ac-secondary {
  width: 100%;
  padding: 14px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  color: #231d45;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

/* search box */
.ac-search {
  position: relative;
  margin-bottom: 12px;
}
.ac-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ac-search-icon svg {
  width: 18px;
  height: 18px;
}
.ac-search-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: #f8f7fc;
  font-size: 1rem;
  color: #231d45;
  font-family: inherit;
}
.ac-search-input:focus {
  outline: none;
  border-color: #00a19a;
  background: #fff;
}
.ac-search-spin {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: ac-spin 0.7s linear infinite;
}
@keyframes ac-spin {
  to { transform: translateY(-50%) rotate(360deg); }
}

/* email check result */
.ac-check-result {
  margin-bottom: 12px;
}
.ac-check-ok {
  margin: 0 0 8px;
  color: #008a84;
  font-size: 0.8125rem;
  font-weight: 600;
}
.ac-check-note {
  padding: 12px;
  color: #6b7089;
  font-size: 0.8125rem;
  background: #f8f7fc;
  border-radius: 12px;
  margin: 0;
}
.ac-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #00a19a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8125rem;
  flex-shrink: 0;
}
.ac-result-body {
  flex: 1;
  min-width: 0;
}
.ac-result-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: #231d45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ac-result-email {
  font-size: 0.75rem;
  color: #6b7089;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ac-invite-prompt {
  padding: 14px 16px;
  background: #f2fbfa;
  border: 1px solid rgba(0, 161, 154, 0.25);
  border-radius: 12px;
  margin-bottom: 12px;
}
.ac-invite-prompt p {
  margin: 0 0 10px;
  color: #3d4a52;
  font-size: 0.8125rem;
  line-height: 1.5;
}
.ac-invite-btn {
  width: 100%;
  padding: 10px 14px;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.8438rem;
  font-weight: 700;
  cursor: pointer;
}
.ac-invite-btn:hover:not(:disabled) {
  background: #008a84;
}
.ac-invite-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* selected chip row */
.ac-selected-block {
  margin-bottom: 12px;
}
.ac-selected-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7089;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ac-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.ac-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 4px 6px 12px;
  background: #e5f4f2;
  border: 1px solid #b8e0dc;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #008a84;
}
.ac-chip-tag {
  font-size: 0.625rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #008a84;
  background: #fff;
  padding: 2px 6px;
  border-radius: 999px;
}
.ac-chip-x {
  border: none;
  background: transparent;
  color: #008a84;
  font-size: 1.125rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 8px;
}
.ac-chip-x:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* banners */
.ac-error {
  padding: 12px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #b91c1c;
  font-size: 0.8125rem;
  font-weight: 500;
  margin-bottom: 12px;
}
.ac-success {
  padding: 12px 14px;
  background: #e5f4f2;
  border: 1px solid #b8e0dc;
  border-radius: 10px;
  color: #008a84;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 12px;
}

/* existing collaborators */
.ac-existing {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
}
.ac-existing-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7089;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ac-existing-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8f7fc;
  border-radius: 10px;
  margin-bottom: 8px;
}
.ac-remove-btn {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}
.ac-remove-btn:hover {
  background: #fef2f2;
}
.ac-remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* footer submit - pinned by BaseDrawer's #footer slot */
.ac-submit {
  width: 100%;
  padding: 14px;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.ac-submit:hover:not(:disabled) {
  background: #008a84;
}
.ac-submit:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
</style>
