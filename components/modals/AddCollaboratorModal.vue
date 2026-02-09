<template>
  <BaseDrawer v-model="isOpen" title="Add Collaborator">
    <div class="add-collaborator-modal">
      <!-- Header Info -->
      <div class="modal-info">
        <p class="info-text">
          Enter the email address of a registered user to give them access to
          this passport.
        </p>
      </div>

      <!-- Email Input -->
      <div class="form-group">
        <label for="collaborator-email" class="form-label"
          >Email Address</label
        >
        <input
          id="collaborator-email"
          v-model="email"
          type="email"
          placeholder="colleague@example.com"
          class="form-input"
          :disabled="isLoading"
          @keyup.enter="handleAdd"
        />
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Success Message -->
      <div v-if="success" class="success-message">
        {{ success }}
      </div>

      <!-- Existing Collaborators -->
      <div v-if="collaborators.length > 0" class="collaborators-list">
        <h3 class="list-title">Current Collaborators</h3>
        <div
          v-for="collaborator in collaborators"
          :key="collaborator.id"
          class="collaborator-item"
        >
          <div class="collaborator-info">
            <div class="collaborator-avatar">
              {{ getInitials(collaborator.firstName, collaborator.lastName) }}
            </div>
            <div class="collaborator-details">
              <p class="collaborator-name">
                {{ collaborator.firstName }} {{ collaborator.lastName }}
              </p>
              <p class="collaborator-email">{{ collaborator.email }}</p>
            </div>
          </div>
          <button
            class="remove-btn"
            :disabled="isLoading"
            @click="handleRemove(collaborator.id)"
          >
            Remove
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-actions">
        <button
          class="btn btn-secondary"
          :disabled="isLoading"
          @click="handleClose"
        >
          Close
        </button>
        <button
          class="btn btn-primary"
          :disabled="!email || isLoading"
          @click="handleAdd"
        >
          {{ isLoading ? 'Adding...' : 'Add Collaborator' }}
        </button>
      </div>
    </div>
  </BaseDrawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseDrawer from '@/components/ui/BaseDrawer.vue'
import { usePassportCollaborators } from '~/composables/usePassportCollaborators'

const props = defineProps({
  show: { type: Boolean, default: false },
  passportId: { type: String, required: true },
})

const emit = defineEmits(['update:show', 'added', 'removed'])

const { addCollaborator, getCollaborators, removeCollaborator } =
  usePassportCollaborators()

const isOpen = ref(props.show)
const email = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')
const collaborators = ref([])

// Sync isOpen with show prop
watch(
  () => props.show,
  (newVal) => {
    isOpen.value = newVal
    if (newVal) {
      loadCollaborators()
      // Reset form
      email.value = ''
      error.value = ''
      success.value = ''
    }
  },
)

// Sync show prop with isOpen
watch(isOpen, (newVal) => {
  emit('update:show', newVal)
})

const loadCollaborators = async () => {
  try {
    collaborators.value = await getCollaborators(props.passportId)
  } catch (err) {
    console.error('Failed to load collaborators:', err)
  }
}

const handleAdd = async () => {
  if (!email.value) return

  error.value = ''
  success.value = ''
  isLoading.value = true

  try {
    const response = await addCollaborator(props.passportId, email.value)
    success.value = response.message || 'Collaborator added successfully!'
    email.value = ''

    // Reload collaborators list
    await loadCollaborators()

    // Emit event
    emit('added', response.collaborator)

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    console.error('Failed to add collaborator:', err)
    error.value = err?.data?.message || 'Failed to add collaborator'
  } finally {
    isLoading.value = false
  }
}

const handleRemove = async (collaboratorId) => {
  if (!confirm('Are you sure you want to remove this collaborator?')) return

  error.value = ''
  success.value = ''
  isLoading.value = true

  try {
    const response = await removeCollaborator(props.passportId, collaboratorId)
    success.value = response.message || 'Collaborator removed successfully!'

    // Reload collaborators list
    await loadCollaborators()

    // Emit event
    emit('removed', collaboratorId)

    // Clear success message after 3 seconds
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    console.error('Failed to remove collaborator:', err)
    error.value = err?.data?.message || 'Failed to remove collaborator'
  } finally {
    isLoading.value = false
  }
}

const handleClose = () => {
  isOpen.value = false
}

const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return `${first}${last}` || '?'
}
</script>

<style scoped>
.add-collaborator-modal {
  padding: 20px;
}

.modal-info {
  margin-bottom: 24px;
}

.info-text {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #00b8a9;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  padding: 12px 16px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c00;
  font-size: 14px;
  margin-bottom: 16px;
}

.success-message {
  padding: 12px 16px;
  background-color: #e6f7f6;
  border: 1px solid #00b8a9;
  border-radius: 8px;
  color: #00b8a9;
  font-size: 14px;
  margin-bottom: 16px;
}

.collaborators-list {
  margin: 24px 0;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.collaborator-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 8px;
}

.collaborator-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.collaborator-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #00b8a9;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.collaborator-details {
  flex: 1;
}

.collaborator-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.collaborator-email {
  font-size: 12px;
  color: #666;
}

.remove-btn {
  padding: 6px 12px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  color: #c00;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background-color: #fee;
  border-color: #fcc;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.btn-primary {
  background-color: #00b8a9;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #00a599;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
