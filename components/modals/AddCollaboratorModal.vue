<template>
  <BaseDrawer v-model="isOpen" :title="props.isOwner ? 'Add Collaborators' : 'Collaborators'">
    <div class="add-collab">
      <!-- Only the owner can add collaborators (backend-enforced); a
           collaborator with view access to this passport sees the same
           page and used to get a confusing rejection if they tried. Client
           bug report, 2026-10-06. -->
      <p v-if="!props.isOwner" class="ac-owner-note">
        Only the passport owner can add or remove collaborators. You can see
        who already has access below.
      </p>

      <template v-if="props.isOwner">
      <p class="ac-lede">
        Enter the full email address of each person you want to add as a
        collaborator on this passport. For privacy, we'll only confirm
        whether that email has an account - not who it belongs to.
      </p>

      <!-- Role + permission + access duration + history access — applied
           to everyone added in this batch -->
      <div class="ac-batch-opts">
        <label class="ac-field">
          <span class="ac-field-label">Their role</span>
          <select v-model="batchRole" class="ac-select" :disabled="isLoading">
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
          <select v-model="batchPermission" class="ac-select" :disabled="isLoading">
            <option value="view">View only — can see the information you share with them</option>
            <option value="view_add">View &amp; add information — can add documents and information, but not change your information</option>
            <option value="view_add_update_own">View, add &amp; update their own information — can amend things they've added, but not information added by others</option>
          </select>
        </label>
        <label class="ac-field">
          <span class="ac-field-label">Access duration</span>
          <select v-model="batchAccessDuration" class="ac-select" :disabled="isLoading">
            <option value="until_removed">Until I remove them</option>
            <option value="until_completion">Until completion</option>
            <option value="specific_date">Choose a date</option>
          </select>
        </label>
        <label v-if="batchAccessDuration === 'specific_date'" class="ac-field">
          <span class="ac-field-label">Access ends on</span>
          <input v-model="batchExpiresAt" type="date" class="ac-select" :disabled="isLoading" />
        </label>
        <label class="ac-checkbox-row">
          <input type="checkbox" v-model="batchHistoryAccess" :disabled="isLoading" />
          Give them passport history access
        </label>
      </div>

      <!-- Email entry — full address only, no live name/partial-match
           search. Checked against the backend one exact email at a time
           (checkCollaboratorEmail), which only ever confirms whether an
           account exists for that address - it was already built for
           exactly this, just never wired up here. Privacy fix, 3 Oct
           2026: the previous version searched-as-you-type against
           /profile/users/search, which returns real names (and a masked
           email) for any 2+ character match - typing "its" would surface
           other users by name. It was also the cause of a real "can't
           add" bug: the masked email it returned was being submitted as
           the actual identifier, which obviously never matches a real
           account. -->
      <div class="ac-search">
        <span class="ac-search-icon">
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
        </span>
        <input
          v-model="emailInput"
          type="email"
          class="ac-search-input"
          placeholder="Enter their full email address"
          :disabled="isLoading"
          @input="onEmailInput"
          @keydown.enter.prevent="addCheckedEmail"
         aria-label="Enter their full email address" />
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
              You can invite them to join - they'll be added as a collaborator
              automatically as soon as they sign up.
            </p>
            <button
              type="button"
              class="ac-invite-btn"
              :disabled="inviteLoading"
              @click="handleInviteEmail"
            >
              {{ inviteLoading ? 'Sending invite…' : `Invite ${checkResult.email}` }}
            </button>
          </div>
        </template>
      </div>

      <!-- Selected chips row — real, full emails only (what the owner
           typed), never a name. -->
      <div v-if="selected.length > 0" class="ac-selected-block">
        <div class="ac-selected-label">To add ({{ selected.length }})</div>
        <div class="ac-chips">
          <div v-for="email in selected" :key="email" class="ac-chip">
            <span class="ac-chip-name">{{ email }}</span>
            <button
              type="button"
              class="ac-chip-x"
              aria-label="Remove"
              :disabled="isLoading"
              @click="removeSelected(email)"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Error / success banners -->
      <div v-if="error" class="ac-error" role="alert">{{ error }}</div>
      <div v-if="success" class="ac-success">{{ success }}</div>
      </template>

      <!-- Existing collaborators — kept below so the owner sees the
           full list without needing to close and re-open. Visible to a
           non-owner too, read-only (no Remove/history-access controls). -->
      <div v-if="collaborators.length > 0" class="ac-existing">
        <div class="ac-existing-label">Current collaborators</div>
        <div
          v-for="c in collaborators"
          :key="c.id"
          class="ac-existing-row"
        >
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
                :disabled="isLoading || !props.isOwner"
                @change="toggleHistoryAccess(c)"
              />
              Passport history
            </label>
          </div>
          <button
            v-if="props.isOwner"
            type="button"
            class="ac-remove-btn"
            :disabled="isLoading"
            @click="removeExisting(c.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

    <template v-if="props.isOwner" #footer>
      <button
        class="ac-submit"
        type="button"
        :disabled="selected.length === 0 || isLoading"
        @click="submitAdds"
      >
        <template v-if="isLoading">Adding…</template>
        <template v-else>
          Add
          {{ selected.length === 0 ? 'collaborators' : `${selected.length} collaborator${selected.length === 1 ? '' : 's'}` }}
        </template>
      </button>
    </template>
  </BaseDrawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import { usePassportCollaborators } from '~/composables/usePassportCollaborators'

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

const isOpen = ref(props.show)
watch(() => props.show, (val) => {
  isOpen.value = val
  if (val) {
    reset()
    loadCollaborators()
  }
})
watch(isOpen, (val) => emit('update:show', val))

const batchRole = ref('')
const batchPermission = ref('view')
const batchAccessDuration = ref('until_removed')
const batchExpiresAt = ref('')
const batchHistoryAccess = ref(true)

const PERMISSION_LABEL = {
  view: 'View only',
  view_add: 'View & add information',
  view_add_update_own: 'View, add & update own information',
}

const emailInput = ref('')
const checking = ref(false)
const checkResult = ref(null) // { status, email } | null — for emailInput's current value
let checkTimer = null

const selected = ref([]) // string[] — full email addresses, never a name
const collaborators = ref([]) // existing collaborators on this passport

const isLoading = ref(false)
const inviteLoading = ref(false)
const error = ref('')
const success = ref('')

function isLikelyEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value ?? '').trim())
}

// Already selected in this batch, or already a collaborator on this
// passport (compared by email, since that's all we ever hold now).
function alreadyAdded(email) {
  const normalised = email.trim().toLowerCase()
  if (selected.value.some((e) => e.toLowerCase() === normalised)) return true
  return collaborators.value.some((c) => c.email?.toLowerCase() === normalised)
}

function reset() {
  emailInput.value = ''
  checkResult.value = null
  selected.value = []
  batchRole.value = ''
  batchPermission.value = 'view'
  batchAccessDuration.value = 'until_removed'
  batchExpiresAt.value = ''
  batchHistoryAccess.value = true
  error.value = ''
  success.value = ''
}

async function loadCollaborators() {
  try {
    collaborators.value = await getCollaborators(props.passportId)
  } catch (err) {
    // Non-critical — just don't show the list.
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
      // Only apply it if the field still holds the email we checked - the
      // owner may have kept typing while this was in flight.
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
  selected.value = [...selected.value, email]
  emailInput.value = ''
  checkResult.value = null
}

function removeSelected(email) {
  selected.value = selected.value.filter((e) => e !== email)
}

async function submitAdds() {
  if (selected.value.length === 0) return
  error.value = ''
  success.value = ''
  isLoading.value = true
  const failures = []
  const added = []
  try {
    // Fire in sequence so the backend can enforce per-request checks
    // (already-collaborator, self-add) without race conditions. Small
    // N (usually 1-5); latency is fine.
    for (const email of selected.value) {
      try {
        const response = await addCollaborator(props.passportId, email, {
          role: batchRole.value || undefined,
          historyAccess: batchHistoryAccess.value,
          permission: batchPermission.value,
          accessDuration: batchAccessDuration.value,
          expiresAt: batchAccessDuration.value === 'specific_date' ? batchExpiresAt.value || undefined : undefined,
        })
        added.push(response.collaborator ?? { email })
        emit('added', response.collaborator ?? { email })
      } catch (err) {
        const message =
          err?.data?.message || err?.message || 'Failed to add'
        failures.push({ email, message })
      }
    }
    if (failures.length === 0) {
      success.value =
        added.length === 1
          ? 'Collaborator added - they\'ll receive an email invitation.'
          : `${added.length} collaborators added - they\'ll receive email invitations.`
      selected.value = []
    } else {
      error.value =
        failures.length === selected.value.length
          ? `Couldn't add ${failures[0].email}: ${failures[0].message}`
          : `Added ${added.length}. ${failures.length} failed - first error: ${failures[0].message}`
      // Keep the failed ones in the chip row so the owner can retry.
      selected.value = failures.map((f) => f.email)
    }
    await loadCollaborators()
    setTimeout(() => (success.value = ''), 4000)
  } finally {
    isLoading.value = false
  }
}

async function handleInviteEmail() {
  const targetEmail = checkResult.value?.email?.trim()
  if (!targetEmail || !isLikelyEmail(targetEmail)) return
  error.value = ''
  success.value = ''
  inviteLoading.value = true
  try {
    await inviteCollaborator(props.passportId, targetEmail, {
      role: batchRole.value || undefined,
      historyAccess: batchHistoryAccess.value,
      permission: batchPermission.value,
      accessDuration: batchAccessDuration.value,
      expiresAt: batchAccessDuration.value === 'specific_date' ? batchExpiresAt.value || undefined : undefined,
    })
    success.value = `Invitation sent to ${targetEmail}.`
    emailInput.value = ''
    checkResult.value = null
    setTimeout(() => (success.value = ''), 4000)
  } catch (err) {
    error.value = err?.data?.message || 'Failed to send invite'
  } finally {
    inviteLoading.value = false
  }
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

/* role + history-access batch options */
.ac-batch-opts {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
