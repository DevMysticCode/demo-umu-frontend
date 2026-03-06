<template>
  <Teleport to="body">
    <Transition name="cdm-slide">
      <div v-if="show" class="cdm-backdrop" @click.self="$emit('close')">
        <div class="cdm-sheet">

          <!-- Handle bar -->
          <div class="cdm-handle" />

          <h2 class="cdm-title">{{ collection?.name }}</h2>

          <div class="cdm-scroll">
            <!-- Passports in collection -->
            <p class="cdm-section-label">In this collection</p>

            <div v-if="localItems.length === 0" class="cdm-empty">
              No passports yet — add some below
            </div>

            <div
              v-for="item in localItems"
              :key="item.id"
              class="cdm-row"
            >
              <!-- Thumbnail -->
              <div class="cdm-thumb">
                <div class="cdm-thumb-inner">
                  <img src="/op-icons/passportview/umu-passport.png" class="cdm-thumb-img" alt="" />
                </div>
              </div>

              <div class="cdm-addr" @click="$emit('navigate', item.passport.id)">
                <span class="cdm-addr1">{{ item.passport.addressLine1 }}</span>
                <span class="cdm-addr2">{{ item.passport.postcode }}</span>
              </div>

              <!-- Open -->
              <button class="cdm-open-btn" @click="$emit('navigate', item.passport.id)">
                <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                  <path d="M9 6l6 6-6 6" stroke="#00a19a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <!-- Remove -->
              <button class="cdm-remove-btn" @click="removePassport(item.passport.id)" :disabled="removing === item.passport.id">
                <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#ff3b30" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <!-- Divider -->
            <div v-if="availablePassports.length > 0" class="cdm-divider" />

            <!-- Uncollected passports to add -->
            <p v-if="availablePassports.length > 0" class="cdm-section-label">Add passports</p>

            <div
              v-for="p in availablePassports"
              :key="p.id"
              class="cdm-row"
            >
              <div class="cdm-thumb">
                <div class="cdm-thumb-inner">
                  <img src="/op-icons/passportview/umu-passport.png" class="cdm-thumb-img" alt="" />
                </div>
              </div>

              <div class="cdm-addr">
                <span class="cdm-addr1">{{ p.addressLine1 }}</span>
                <span class="cdm-addr2">{{ p.postcode }}</span>
              </div>

              <button class="cdm-add-btn" @click="addPassport(p)" :disabled="adding === p.id">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M12 5v14M5 12h14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Close -->
          <div class="cdm-close-wrap">
            <button class="cdm-close-btn" @click="$emit('close')">
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  collection: { type: Object, default: null },
  uncollectedPassports: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'navigate', 'updated'])

const config = useRuntimeConfig()
const removing = ref(null)
const adding = ref(null)

// Local copy of items so we can mutate without refetching
const localItems = ref([])

watch(() => props.collection, (c) => {
  localItems.value = c ? [...(c.items ?? [])] : []
}, { immediate: true })

// Passports NOT already in this collection
const availablePassports = computed(() => {
  const inCollection = new Set(localItems.value.map(i => i.passport.id))
  return props.uncollectedPassports.filter(p => !inCollection.has(p.id))
})

const removePassport = async (passportId) => {
  if (!props.collection || removing.value) return
  removing.value = passportId
  try {
    const token = localStorage.getItem('token')
    await $fetch(`${config.public.apiBase}/collection/${props.collection.id}/remove`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { passportId },
    })
    localItems.value = localItems.value.filter(i => i.passport.id !== passportId)
    emit('updated')
  } catch (e) {
    console.error('Failed to remove passport', e)
  } finally {
    removing.value = null
  }
}

const addPassport = async (passport) => {
  if (!props.collection || adding.value) return
  adding.value = passport.id
  try {
    const token = localStorage.getItem('token')
    await $fetch(`${config.public.apiBase}/collection/${props.collection.id}/add`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { passportId: passport.id },
    })
    // Add to localItems so it disappears from "Add passports" list
    localItems.value.push({
      id: `temp-${passport.id}`,
      passport: { id: passport.id, addressLine1: passport.addressLine1, postcode: passport.postcode, property: passport.property },
    })
    emit('updated')
  } catch (e) {
    console.error('Failed to add passport', e)
  } finally {
    adding.value = null
  }
}
</script>

<style scoped>
.cdm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.cdm-sheet {
  width: 100%;
  max-width: 448px;
  background: #f4f4f6;
  border-radius: 28px 28px 0 0;
  padding: 12px 20px 0;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.cdm-handle {
  width: 36px;
  height: 4px;
  background: #d0d0d5;
  border-radius: 2px;
  margin: 0 auto 16px;
}

.cdm-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px;
  text-align: center;
}

.cdm-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  padding-bottom: 8px;
}
.cdm-scroll::-webkit-scrollbar { display: none; }

.cdm-section-label {
  font-size: 11px;
  font-weight: 700;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 0 0 8px 4px;
}

.cdm-empty {
  font-size: 13px;
  color: #aaa;
  padding: 12px 4px 16px;
}

.cdm-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 14px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

/* Thumbnail */
.cdm-thumb {
  width: 40px;
  height: 52px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
}

.cdm-thumb-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 360px;
  transform: scale(0.111);
  transform-origin: top left;
}

.cdm-thumb-img {
  width: 100%;
  height: auto;
  display: block;
}

.cdm-addr {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  cursor: pointer;
}

.cdm-addr1 {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cdm-addr2 {
  font-size: 11px;
  color: #8e8e93;
}

.cdm-open-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.cdm-remove-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ffe0de;
  background: #fff5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.cdm-remove-btn:disabled, .cdm-add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cdm-add-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #00a19a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.cdm-divider {
  height: 1px;
  background: #e0e0e5;
  margin: 12px 0;
}

.cdm-close-wrap {
  display: flex;
  justify-content: center;
  padding: 16px 0 32px;
}

.cdm-close-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #00a19a;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,161,154,0.4);
}

/* Slide-up transition */
.cdm-slide-enter-active, .cdm-slide-leave-active {
  transition: opacity 0.25s ease;
}
.cdm-slide-enter-active .cdm-sheet, .cdm-slide-leave-active .cdm-sheet {
  transition: transform 0.25s ease;
}
.cdm-slide-enter-from, .cdm-slide-leave-to { opacity: 0; }
.cdm-slide-enter-from .cdm-sheet, .cdm-slide-leave-to .cdm-sheet {
  transform: translateY(100%);
}
</style>
