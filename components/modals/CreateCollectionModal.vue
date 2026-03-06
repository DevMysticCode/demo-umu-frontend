<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="ccm-backdrop" @click.self="$emit('close')">
        <div class="ccm-sheet">

          <!-- Step 1: Name -->
          <template v-if="step === 1">
            <h2 class="ccm-title">New Collection</h2>
            <p class="ccm-subtitle">Group your passports by location or purpose</p>

            <input
              v-model="name"
              class="ccm-input"
              placeholder="e.g. Coventry, London Properties…"
              maxlength="60"
              @keyup.enter="goToStep2"
            />

            <div class="ccm-actions">
              <button class="ccm-cancel" @click="$emit('close')">Cancel</button>
              <button class="ccm-create" :disabled="!name.trim()" @click="goToStep2">
                Next →
              </button>
            </div>
          </template>

          <!-- Step 2: Select passports -->
          <template v-else>
            <button class="ccm-back-btn" @click="step = 1">← Back</button>
            <h2 class="ccm-title">Add Passports</h2>
            <p class="ccm-subtitle">Select which passports to add to <strong>{{ name }}</strong></p>

            <div class="ccm-passport-list" v-if="availablePassports.length > 0">
              <label
                v-for="p in availablePassports"
                :key="p.id"
                class="ccm-passport-row"
                :class="{ selected: selectedIds.includes(p.id) }"
              >
                <!-- Mini passport thumbnail -->
                <div class="ccm-thumb">
                  <div class="ccm-thumb-inner">
                    <img src="/op-icons/passportview/umu-passport.png" class="ccm-thumb-img" alt="" />
                  </div>
                </div>
                <div class="ccm-addr">
                  <span class="ccm-addr-line1">{{ p.addressLine1 }}</span>
                  <span class="ccm-addr-line2">{{ p.postcode }}</span>
                </div>
                <div class="ccm-checkbox" :class="{ checked: selectedIds.includes(p.id) }">
                  <svg v-if="selectedIds.includes(p.id)" viewBox="0 0 12 10" width="12" height="10" fill="none">
                    <path d="M1 5l3.5 3.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <input type="checkbox" class="sr-only" :value="p.id" v-model="selectedIds" />
              </label>
            </div>

            <p v-else class="ccm-empty">No unassigned passports available.</p>

            <div class="ccm-actions">
              <button class="ccm-cancel" @click="$emit('close')">Cancel</button>
              <button class="ccm-create" :disabled="saving" @click="submit">
                {{ saving ? 'Creating…' : 'Create' }}
              </button>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  availablePassports: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'created'])

const config = useRuntimeConfig()
const step = ref(1)
const name = ref('')
const selectedIds = ref([])
const saving = ref(false)

watch(() => props.show, (v) => {
  if (v) { step.value = 1; name.value = ''; selectedIds.value = [] }
})

const goToStep2 = () => {
  if (!name.value.trim()) return
  step.value = 2
}

const submit = async () => {
  if (saving.value) return
  saving.value = true
  try {
    const token = localStorage.getItem('token')
    const auth = { Authorization: `Bearer ${token}` }

    // Create the collection
    const collection = await $fetch(`${config.public.apiBase}/collection`, {
      method: 'POST',
      headers: auth,
      body: { name: name.value.trim() },
    })

    // Add selected passports
    for (const passportId of selectedIds.value) {
      await $fetch(`${config.public.apiBase}/collection/${collection.id}/add`, {
        method: 'POST',
        headers: auth,
        body: { passportId },
      })
    }

    emit('created', collection.id)
    emit('close')
  } catch (e) {
    console.error('Failed to create collection', e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ccm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(8px);
  padding: 24px 20px;
}

.ccm-sheet {
  width: 100%;
  max-width: 380px;
  background: white;
  border-radius: 24px;
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 80vh;
}

.ccm-back-btn {
  background: none;
  border: none;
  color: #00a19a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  align-self: flex-start;
}

.ccm-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  text-align: center;
}

.ccm-subtitle {
  font-size: 13px;
  color: #8e8e93;
  text-align: center;
  margin: 0;
}

.ccm-input {
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  color: #1a1a1a;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.ccm-input:focus { border-color: #00a19a; }

/* Passport list */
.ccm-passport-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  max-height: 280px;
  scrollbar-width: none;
}
.ccm-passport-list::-webkit-scrollbar { display: none; }

.ccm-passport-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  cursor: pointer;
  transition: background 0.15s;
  border: 1.5px solid transparent;
}

.ccm-passport-row.selected {
  background: rgba(0, 161, 154, 0.06);
  border-color: rgba(0, 161, 154, 0.3);
}

/* Thumbnail */
.ccm-thumb {
  width: 40px;
  height: 52px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
}

.ccm-thumb-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 360px;
  transform: scale(0.111);
  transform-origin: top left;
}

.ccm-thumb-img {
  width: 100%;
  height: auto;
  display: block;
}

.ccm-addr {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ccm-addr-line1 {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ccm-addr-line2 {
  font-size: 11px;
  color: #8e8e93;
}

.ccm-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #d0d0d0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.ccm-checkbox.checked {
  background: #00a19a;
  border-color: #00a19a;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
}

.ccm-empty {
  font-size: 13px;
  color: #aaa;
  text-align: center;
  padding: 16px 0;
  margin: 0;
}

.ccm-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.ccm-cancel {
  flex: 1;
  padding: 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 14px;
  background: transparent;
  color: #666;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.ccm-create {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 14px;
  background: #00a19a;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.ccm-create:disabled { opacity: 0.5; cursor: not-allowed; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .ccm-sheet, .modal-leave-active .ccm-sheet { transition: transform 0.2s, opacity 0.2s; }
.modal-enter-from .ccm-sheet, .modal-leave-to .ccm-sheet { transform: scale(0.95); opacity: 0; }
</style>
