<template>
  <div class="repeatable-q">
    <!-- Question / Description / Help -->
    <template v-if="!hideQuestionDisplay">
      <p v-if="displayedQuestion" class="question-text">
        {{ displayedQuestion }}
        <span v-if="showQuestionCursor" class="typing-cursor">|</span>
      </p>
      <div v-if="displayedDescription" class="question-description">
        {{ displayedDescription }}
        <span v-if="showDescriptionCursor" class="typing-cursor typing-cursor--small">|</span>
      </div>
      <div v-if="displayedHelp" class="help-section">
        <div class="help-content">
          <h4 class="help-title"><span class="help-icon">💡</span>What is this?</h4>
          <p class="help-text">
            {{ displayedHelp }}
            <span v-if="showHelpCursor" class="typing-cursor typing-cursor--small">|</span>
          </p>
        </div>
      </div>
    </template>

    <!-- Add Item Button -->
    <button class="add-btn" @click="openAdd">
      <span class="add-btn__icon">+</span> {{ question.buttonText || 'Add Item' }}
    </button>

    <!-- Your Additional Items List -->
    <div v-if="localItems.length" class="items-list">
      <h3 class="items-list__heading">Your Additional Items</h3>
      <div v-for="(item, i) in localItems" :key="i" class="item-card">
        <div class="item-card__info">
          <span class="item-card__name">{{ item.item_name || `Custom Item ${i + 1}` }}</span>
          <span class="item-card__sub">{{ itemSubtext(item) }}</span>
        </div>
        <div class="item-card__actions">
          <button class="item-card__edit" @click="openEdit(i)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="item-card__delete" @click="deleteItem(i)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal (bottom sheet) -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-sheet">
          <!-- Close button -->
          <button class="modal-sheet__close" @click="closeModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <!-- Hero -->
          <div class="modal-sheet__hero">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#e6f9f7"/>
              <path d="M55 30H48V23a3 3 0 0 0-3-3H35a3 3 0 0 0-3 3v7H25a5 5 0 0 0-5 5v20a5 5 0 0 0 5 5h30a5 5 0 0 0 5-5V35a5 5 0 0 0-5-5zm-18-7h6v7h-6v-7zm-2 20h14a1 1 0 0 1 0 2H35a1 1 0 0 1 0-2zm0 6h10a1 1 0 0 1 0 2H35a1 1 0 0 1 0-2z" fill="#00b8a9"/>
            </svg>
          </div>
          <h2 class="modal-sheet__title">{{ editIndex >= 0 ? 'Edit Item' : 'Add Custom Item' }}</h2>
          <p class="modal-sheet__subtitle">Include additional items that buyers should know about</p>

          <!-- Form Sections -->
          <div class="modal-sheet__body">
            <div v-for="section in formSections" :key="section.name" class="form-section">
              <h3 class="form-section__title">{{ section.name }}</h3>
              <p v-if="section.description" class="form-section__desc">{{ section.description }}</p>

              <div v-for="part in section.parts" :key="part.partKey" class="form-field">

                <!-- Single-line text (item name) -->
                <template v-if="part.type === 'text' && part.title">
                  <label class="form-label">{{ part.title }}</label>
                  <input
                    type="text"
                    class="form-input"
                    :placeholder="part.placeholder"
                    :value="currentItem[part.partKey] || ''"
                    @input="(e) => setField(part.partKey, e.target.value)"
                  />
                </template>

                <!-- Textarea (description / comments — no title or empty title) -->
                <template v-else-if="part.type === 'text'">
                  <label v-if="part.title" class="form-label">{{ part.title }}</label>
                  <textarea
                    class="form-textarea"
                    :placeholder="part.placeholder"
                    :value="currentItem[part.partKey] || ''"
                    @input="(e) => setField(part.partKey, e.target.value)"
                  />
                </template>

                <!-- Radio -->
                <template v-else-if="part.type === 'radio'">
                  <div
                    v-for="opt in part.options"
                    :key="opt.value"
                    class="radio-opt"
                    :class="{ 'radio-opt--selected': currentItem[part.partKey] === opt.value }"
                    @click="setField(part.partKey, opt.value)"
                  >
                    <div
                      class="radio-circle"
                      :class="{ 'radio-circle--checked': currentItem[part.partKey] === opt.value }"
                    >
                      <span v-if="currentItem[part.partKey] === opt.value" class="radio-check">✓</span>
                    </div>
                    <span class="radio-label">{{ opt.label }}</span>
                  </div>
                </template>

                <!-- Currency / Date -->
                <template v-else-if="part.type === 'date'">
                  <div v-for="opt in part.options" :key="opt.value" class="currency-field">
                    <span class="currency-label">{{ opt.label }}</span>
                    <div class="currency-badge">
                      <span v-if="getCurrencyVal(part.partKey)" class="currency-value">
                        £ {{ getCurrencyVal(part.partKey) }}
                      </span>
                      <span v-else class="currency-placeholder">{{ opt.datePlaceholder }}</span>
                      <input
                        type="text"
                        inputmode="decimal"
                        class="currency-overlay"
                        :value="getCurrencyVal(part.partKey)"
                        @input="(e) => setCurrencyField(part.partKey, opt.value, e.target.value)"
                      />
                    </div>
                  </div>
                </template>

              </div>
            </div>
          </div>

          <!-- Save -->
          <div class="modal-sheet__footer">
            <button class="save-btn" @click="saveItem">Save Item</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: [Array, Object, null], default: null },
  displayedQuestion: { type: String, default: '' },
  showQuestionCursor: { type: Boolean, default: false },
  displayedDescription: { type: String, default: '' },
  showDescriptionCursor: { type: Boolean, default: false },
  displayedHelp: { type: String, default: '' },
  showHelpCursor: { type: Boolean, default: false },
  hideQuestionDisplay: { type: Boolean, default: false },
})

const emit = defineEmits(['update'])

const localItems = ref([])
const showModal = ref(false)
const editIndex = ref(-1)
const currentItem = ref({})

watch(
  () => props.answer,
  (val) => {
    localItems.value = Array.isArray(val) ? JSON.parse(JSON.stringify(val)) : []
  },
  { immediate: true },
)

const sortedParts = computed(() => {
  if (!props.question?.parts) return []
  return [...props.question.parts].sort((a, b) => (a.order || 0) - (b.order || 0))
})

const formSections = computed(() => {
  const sections = []
  const sectionMap = new Map()
  for (const part of sortedParts.value) {
    const name = part.section || 'Details'
    if (!sectionMap.has(name)) {
      const s = { name, description: part.sectionDescription || '', parts: [] }
      sectionMap.set(name, s)
      sections.push(s)
    }
    sectionMap.get(name).parts.push(part)
  }
  return sections
})

const openAdd = () => {
  editIndex.value = -1
  currentItem.value = {}
  showModal.value = true
}

const openEdit = (index) => {
  editIndex.value = index
  currentItem.value = JSON.parse(JSON.stringify(localItems.value[index]))
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editIndex.value = -1
  currentItem.value = {}
}

const deleteItem = (index) => {
  localItems.value.splice(index, 1)
  emit('update', [...localItems.value])
}

const setField = (partKey, value) => {
  currentItem.value = { ...currentItem.value, [partKey]: value }
}

const getCurrencyVal = (partKey) => {
  const val = currentItem.value[partKey]
  if (!val || typeof val !== 'object') return ''
  return val.date || ''
}

const setCurrencyField = (partKey, optionValue, rawValue) => {
  currentItem.value = {
    ...currentItem.value,
    [partKey]: { value: optionValue, date: rawValue },
  }
}

const saveItem = () => {
  const item = { ...currentItem.value }
  if (editIndex.value >= 0) {
    localItems.value[editIndex.value] = item
  } else {
    localItems.value.push(item)
  }
  emit('update', [...localItems.value])
  closeModal()
}

const INCLUSION_LABELS = { included: 'Included', excluded: 'Excluded', none: 'None' }

const itemSubtext = (item) => {
  const parts = []
  if (item.inclusion_status) {
    parts.push(INCLUSION_LABELS[item.inclusion_status] || item.inclusion_status)
  }
  const price = item.selling_price?.date
  if (price) parts.push(`£ ${price}`)
  return parts.join(' • ')
}
</script>

<style scoped>
.question-text {
  color: #000;
  margin: 0 0 20px;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
}
.question-description {
  font-size: 15px;
  line-height: 20px;
  color: #3c3c4399;
  margin-bottom: 20px;
}
.help-section {
  display: flex;
  gap: 2px;
  padding: 12px;
  background: #00a19a1a;
  border-radius: 12px;
  border: 2px solid #e6f9f7;
  margin-bottom: 20px;
}
.help-content { flex: 1; }
.help-title {
  margin: 0 0 8px -5px;
  color: #00a19a;
  font-weight: 590;
  font-size: 13px;
}
.help-text { color: #3c3c4399; margin: 0; font-size: 13px; }
.help-icon { font-size: 12px; }
.typing-cursor { margin-left: 2px; color: #00a19a; animation: blink 1s infinite; }
.typing-cursor--small { margin-left: 2px; }
@keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }

/* Add Button */
.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border: 2px dashed #00b8a9;
  border-radius: 12px;
  background: transparent;
  color: #00b8a9;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.add-btn:active { background: #e6f9f7; }
.add-btn__icon { font-size: 20px; font-weight: 700; line-height: 1; }

/* Items List */
.items-list { margin-top: 20px; }
.items-list__heading {
  font-size: 15px;
  font-weight: 600;
  color: #00b8a9;
  margin: 0 0 12px;
}
.item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  margin-bottom: 8px;
}
.item-card__info { display: flex; flex-direction: column; gap: 2px; }
.item-card__name { font-size: 15px; font-weight: 500; color: #1a1a1a; }
.item-card__sub { font-size: 13px; color: #00b8a9; font-weight: 500; }
.item-card__actions { display: flex; gap: 10px; }
.item-card__edit {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #555;
}
.item-card__delete {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #ffe0e0;
  background: #fff5f5;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #e53935;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

/* Modal Sheet */
.modal-sheet {
  position: relative;
  width: 100%;
  max-height: 90vh;
  background: white;
  border-radius: 20px 20px 0 0;
  overflow-y: auto;
  padding: 24px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.modal-sheet__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #555;
  z-index: 1;
}
.modal-sheet__hero {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}
.modal-sheet__title {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px;
}
.modal-sheet__subtitle {
  text-align: center;
  font-size: 14px;
  color: #3c3c4399;
  margin: 0 0 24px;
}

/* Form Sections */
.modal-sheet__body { display: flex; flex-direction: column; gap: 20px; }
.form-section {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-section__title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}
.form-section__desc {
  font-size: 13px;
  color: #3c3c4399;
  margin: -8px 0 0;
}
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 14px; font-weight: 500; color: #1a1a1a; }
.form-input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  font-size: 15px;
  color: #1a1a1a;
  box-sizing: border-box;
  outline: none;
}
.form-input:focus { border-color: #00b8a9; }
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  font-size: 15px;
  color: #1a1a1a;
  min-height: 80px;
  resize: none;
  box-sizing: border-box;
  outline: none;
  font-family: inherit;
}
.form-textarea:focus { border-color: #00b8a9; }

/* Radio Options */
.radio-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.radio-opt--selected { border-color: #00b8a9; background: #f0fffe; }
.radio-circle {
  width: 26px; height: 26px;
  border: 2px solid #ccc;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: white;
}
.radio-circle--checked { background: #00b8a9; border-color: #00b8a9; }
.radio-check { color: white; font-size: 16px; font-weight: 700; line-height: 1; }
.radio-label { font-size: 15px; font-weight: 500; color: #1a1a1a; }

/* Currency Field */
.currency-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
}
.currency-label { font-size: 15px; font-weight: 500; color: #1a1a1a; }
.currency-badge {
  padding: 6px 14px;
  background: #e6f9f7;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  min-width: 80px;
  text-align: center;
}
.currency-value { font-size: 15px; font-weight: 600; color: #00b8a9; position: relative; z-index: 1; pointer-events: none; }
.currency-placeholder { font-size: 13px; color: #999; position: relative; z-index: 1; pointer-events: none; }
.currency-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
  font-size: 15px;
}

/* Footer */
.modal-sheet__footer { margin-top: 24px; }
.save-btn {
  width: 100%;
  padding: 16px;
  background: #00b8a9;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.save-btn:active { background: #009d90; }
</style>
