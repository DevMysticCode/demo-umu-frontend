<template>
  <BaseDrawer v-model="isOpen" title="Add Collaborators">
    <div class="add-collab">
      <p class="ac-lede">
        Search UMovingU users by name or email and add one or more as
        collaborators on this passport.
      </p>

      <!-- Search input -->
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
          v-model="searchQuery"
          type="text"
          class="ac-search-input"
          placeholder="Search by name or email"
          :disabled="isLoading"
          @input="onSearchInput"
        />
        <span v-if="searching" class="ac-search-spin" />
      </div>

      <!-- Results dropdown — hidden when nothing to show -->
      <div v-if="visibleResults.length > 0" class="ac-results">
        <button
          v-for="result in visibleResults"
          :key="result.id"
          type="button"
          class="ac-result"
          @click="pickUser(result)"
        >
          <div class="ac-avatar">{{ initials(result.name) }}</div>
          <div class="ac-result-body">
            <div class="ac-result-name">{{ result.name || result.email }}</div>
            <div class="ac-result-email">{{ result.email }}</div>
          </div>
          <span class="ac-result-add">+ Add</span>
        </button>
      </div>

      <div
        v-if="
          !searching &&
          searchQuery.trim().length >= 2 &&
          searchResults.length === 0
        "
        class="ac-empty"
      >
        No UMovingU users found for "{{ searchQuery }}".
      </div>

      <!-- Selected chips row -->
      <div v-if="selected.length > 0" class="ac-selected-block">
        <div class="ac-selected-label">To add ({{ selected.length }})</div>
        <div class="ac-chips">
          <div v-for="u in selected" :key="u.id" class="ac-chip">
            <span class="ac-chip-name">{{ u.name || u.email }}</span>
            <button
              type="button"
              class="ac-chip-x"
              aria-label="Remove"
              :disabled="isLoading"
              @click="removeSelected(u.id)"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Error / success banners -->
      <div v-if="error" class="ac-error">{{ error }}</div>
      <div v-if="success" class="ac-success">{{ success }}</div>

      <!-- Existing collaborators — kept below so the owner sees the
           full list without needing to close and re-open. -->
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
            </div>
            <div class="ac-result-email">{{ c.email }}</div>
          </div>
          <button
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

    <template #footer>
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
import { computed, ref, watch } from 'vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import { useProfile } from '~/composables/useProfile'
import { usePassportCollaborators } from '~/composables/usePassportCollaborators'

const props = defineProps({
  show: { type: Boolean, default: false },
  passportId: { type: String, required: true },
})
const emit = defineEmits(['update:show', 'added', 'removed'])

const { searchUsers } = useProfile()
const { addCollaborator, getCollaborators, removeCollaborator } =
  usePassportCollaborators()

const isOpen = ref(props.show)
watch(() => props.show, (val) => {
  isOpen.value = val
  if (val) {
    reset()
    loadCollaborators()
  }
})
watch(isOpen, (val) => emit('update:show', val))

const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
let searchTimer = null

const selected = ref([]) // UserSearchResult[]
const collaborators = ref([]) // existing collaborators on this passport

const isLoading = ref(false)
const error = ref('')
const success = ref('')

// Drop already-selected + already-collaborators + the owner (self) so
// the picker only surfaces genuinely-addable users.
const excludedIds = computed(() => {
  const ids = new Set()
  for (const s of selected.value) ids.add(s.id)
  for (const c of collaborators.value) ids.add(c.userId)
  return ids
})
const visibleResults = computed(() =>
  searchResults.value.filter((r) => !excludedIds.value.has(r.id)),
)

function reset() {
  searchQuery.value = ''
  searchResults.value = []
  selected.value = []
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

function onSearchInput() {
  clearTimeout(searchTimer)
  error.value = ''
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = []
    searching.value = false
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

function pickUser(user) {
  if (excludedIds.value.has(user.id)) return
  selected.value = [...selected.value, user]
  // Keep the search open so the owner can add several people in a row.
  // Clearing the query gives visual feedback that the pick worked and
  // primes the field for the next search.
  searchQuery.value = ''
  searchResults.value = []
}

function removeSelected(id) {
  selected.value = selected.value.filter((u) => u.id !== id)
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
    for (const user of selected.value) {
      try {
        const response = await addCollaborator(props.passportId, user.email)
        added.push(response.collaborator ?? user)
        emit('added', response.collaborator ?? user)
      } catch (err) {
        const message =
          err?.data?.message || err?.message || 'Failed to add'
        failures.push({ user, message })
      }
    }
    if (failures.length === 0) {
      success.value =
        added.length === 1
          ? 'Collaborator added — they\'ll receive an email invitation.'
          : `${added.length} collaborators added — they\'ll receive email invitations.`
      selected.value = []
    } else {
      error.value =
        failures.length === selected.value.length
          ? `Couldn't add ${failures[0].user.email}: ${failures[0].message}`
          : `Added ${added.length}. ${failures.length} failed — first error: ${failures[0].message}`
      // Keep the failed ones in the chip row so the owner can retry.
      selected.value = failures.map((f) => f.user)
    }
    await loadCollaborators()
    setTimeout(() => (success.value = ''), 4000)
  } finally {
    isLoading.value = false
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
  font-size: 13.5px;
  line-height: 1.55;
  margin: 0 0 16px;
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
  font-size: 15px;
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

/* results dropdown */
.ac-results {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  margin-bottom: 12px;
  max-height: 260px;
  overflow-y: auto;
}
.ac-result {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: #fff;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}
.ac-result:last-child { border-bottom: none }
.ac-result:hover { background: #f2faf8 }
.ac-result:active { background: #e5f4f2 }
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
  font-size: 13px;
  flex-shrink: 0;
}
.ac-result-body {
  flex: 1;
  min-width: 0;
}
.ac-result-name {
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ac-result-email {
  font-size: 12px;
  color: #6b7089;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ac-result-add {
  color: #008a84;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 8px;
  background: #e5f4f2;
  white-space: nowrap;
  flex-shrink: 0;
}

.ac-empty {
  padding: 12px;
  color: #6b7089;
  font-size: 13px;
  background: #f8f7fc;
  border-radius: 12px;
  margin-bottom: 12px;
}

/* selected chip row */
.ac-selected-block {
  margin-bottom: 12px;
}
.ac-selected-label {
  font-size: 12px;
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
  font-size: 13px;
  font-weight: 600;
  color: #008a84;
}
.ac-chip-x {
  border: none;
  background: transparent;
  color: #008a84;
  font-size: 18px;
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
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
}
.ac-success {
  padding: 12px 14px;
  background: #e5f4f2;
  border: 1px solid #b8e0dc;
  border-radius: 10px;
  color: #008a84;
  font-size: 13px;
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
  font-size: 12px;
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
  font-size: 12px;
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

/* footer submit — pinned by BaseDrawer's #footer slot */
.ac-submit {
  width: 100%;
  padding: 14px;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
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
