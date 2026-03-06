<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="your-properties-backdrop" @click.self="$emit('close')">
        <div class="your-properties-sheet">
          <h2 class="sheet-title">Your Properties</h2>

          <!-- Search -->
          <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#aaa" stroke-width="2" />
              <path d="M16.5 16.5L21 21" stroke="#aaa" stroke-width="2" stroke-linecap="round" />
            </svg>
            <input
              v-model="query"
              class="search-input"
              placeholder="Search Properties"
              type="text"
            />
          </div>

          <!-- List -->
          <div class="passport-list">
            <div
              v-for="passport in filtered"
              :key="passport.id"
              class="passport-row"
              :class="{ active: passport.id === currentId }"
              @click="select(passport.id)"
            >
              <!-- Thumbnail: scaled-down version of the real passport card -->
              <div class="thumb-wrap">
                <div class="thumb-inner">
                  <img src="/op-icons/passportview/umu-passport.png" class="thumb-img" alt="" />
                  <div class="thumb-address">
                    <div class="thumb-line1">{{ passport.addressLine1 }}</div>
                    <div class="thumb-line2">{{ passport.postcode }}</div>
                  </div>
                </div>
              </div>

              <!-- Address -->
              <div class="row-address">
                <span class="row-line1">{{ formatLine1(passport.addressLine1) }}</span>
                <span class="row-line2">{{ passport.postcode }}</span>
              </div>

              <!-- Arrow -->
              <div class="row-arrow">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path d="M9 6l6 6-6 6" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>

            <p v-if="filtered.length === 0 && !loading" class="empty-msg">No properties found</p>
            <p v-if="loading" class="empty-msg">Loading…</p>
          </div>

          <!-- Close button -->
          <div class="close-wrap">
            <button class="close-btn" @click="$emit('close')">
              <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round" />
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
  show: { type: Boolean, default: false },
  currentId: { type: String, default: '' },
})

const emit = defineEmits(['close', 'select'])

const config = useRuntimeConfig()
const query = ref('')
const passports = ref([])
const loading = ref(false)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return passports.value
  return passports.value.filter(
    (p) =>
      p.addressLine1.toLowerCase().includes(q) ||
      p.postcode.toLowerCase().includes(q),
  )
})

const formatLine1 = (addr) => {
  // "21 Rochester Road, Earlsdon" — keep as-is but split city if present
  return addr
}

const select = (id) => {
  emit('select', id)
  emit('close')
}

const load = async () => {
  loading.value = true
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    passports.value = await $fetch(`${config.public.apiBase}/passport/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (e) {
    console.error('Failed to load passports', e)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.show,
  (val) => { if (val) load() },
)
</script>

<style scoped>
.your-properties-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 24px 20px;
}

.your-properties-sheet {
  width: 100%;
  max-width: 420px;
  background: #f4f4f6;
  border-radius: 28px;
  padding: 28px 20px 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.sheet-title {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  color: #1a1a1a;
  margin: 0 0 18px;
}

.search-wrap {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 14px;
  padding: 10px 14px;
  gap: 10px;
  margin-bottom: 16px;
}

.search-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;
}

.search-input::placeholder {
  color: #aaa;
}

.passport-list {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.passport-list::-webkit-scrollbar {
  display: none;
}

.passport-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 4px;
  border-bottom: 1px solid #e5e5ea;
  cursor: pointer;
  transition: background 0.15s;
  border-radius: 12px;
}

.passport-row:last-child {
  border-bottom: none;
}

.passport-row.active {
  background: rgba(0, 161, 154, 0.06);
}

/* Thumbnail */
.thumb-wrap {
  width: 52px;
  height: 68px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 6px;
  position: relative;
}

.thumb-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 360px;
  transform: scale(0.144);
  transform-origin: top left;
}

.thumb-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
}

.thumb-address {
  position: absolute;
  bottom: 22%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: white;
  white-space: nowrap;
}

.thumb-line1 {
  font-size: 13px;
  font-weight: 600;
}

.thumb-line2 {
  font-size: 11px;
  opacity: 0.9;
}

/* Address text */
.row-address {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.row-line1 {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.row-line2 {
  font-size: 13px;
  color: #888;
}

/* Arrow */
.row-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.empty-msg {
  text-align: center;
  color: #aaa;
  font-size: 14px;
  padding: 24px 0;
}

/* Close button */
.close-wrap {
  display: flex;
  justify-content: center;
  padding: 20px 0 32px;
}

.close-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #00a19a;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.4);
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .your-properties-sheet,
.modal-leave-active .your-properties-sheet {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .your-properties-sheet,
.modal-leave-to .your-properties-sheet {
  transform: scale(0.95);
  opacity: 0;
}
</style>
