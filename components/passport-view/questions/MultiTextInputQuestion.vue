<template>
  <div class="multi-text-input-wrapper">
    <!-- Question Display Section (skip if hideQuestionDisplay is true) -->
    <template v-if="!hideQuestionDisplay">
      <p v-if="displayedQuestion" class="question-text">
        {{ displayedQuestion }}
        <span v-if="showQuestionCursor" class="typing-cursor">|</span>
      </p>

      <!-- Description Display Section -->
      <p v-if="displayedDescription" class="question-description">
        {{ displayedDescription }}
        <span v-if="showDescriptionCursor" class="typing-cursor">|</span>
      </p>

      <!-- Help Display Section -->
      <div v-if="displayedHelp" class="help-section">
        <span class="help-icon">ℹ</span>
        <span class="help-text">
          {{ displayedHelp }}
          <span v-if="showHelpCursor" class="typing-cursor">|</span>
        </span>
      </div>
    </template>

    <!-- Existing Items List -->
    <div v-if="itemsList.length > 0" class="items-list">
      <div v-for="(item, index) in itemsList" :key="index" class="item-card">
        <div class="item-content">
          <span class="item-text">{{ item }}</span>
        </div>
        <button class="edit-btn" @click="startEdit(index)">Edit</button>
      </div>
    </div>

    <!-- Input Section -->
    <div class="input-section">
      <input
        v-model="newItem"
        type="text"
        class="text-input"
        :placeholder="question?.placeholder || 'Enter Name'"
        @keyup.enter="addItem"
      />
      <button class="add-btn" @click="addItem">
        <span class="add-icon">+</span>
        {{ question?.buttonText || 'Add More Sellers' }}
      </button>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="editingIndex !== null"
      class="modal-overlay"
      @click.self="cancelEdit"
    >
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Entry</h3>
          <button class="close-btn" @click="cancelEdit">×</button>
        </div>
        <input
          v-model="editingValue"
          type="text"
          class="modal-input"
          autofocus
          @keyup.enter="saveEdit"
        />
        <div class="modal-footer">
          <button class="cancel-btn" @click="cancelEdit">Cancel</button>
          <button class="save-btn" @click="saveEdit">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  answer: {
    type: Array,
    default: () => [],
  },
  displayedQuestion: {
    type: String,
    default: '',
  },
  showQuestionCursor: {
    type: Boolean,
    default: false,
  },
  displayedDescription: {
    type: String,
    default: '',
  },
  showDescriptionCursor: {
    type: Boolean,
    default: false,
  },
  displayedHelp: {
    type: String,
    default: '',
  },
  showHelpCursor: {
    type: Boolean,
    default: false,
  },
  hideQuestionDisplay: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update'])

const newItem = ref('')
const editingIndex = ref(null)
const editingValue = ref('')

const itemsList = computed(() => {
  return Array.isArray(props.answer) ? props.answer : []
})

const addItem = () => {
  if (newItem.value.trim()) {
    const updated = [...itemsList.value, newItem.value.trim()]
    emit('update', updated)
    newItem.value = ''
  }
}

const startEdit = (index) => {
  editingIndex.value = index
  editingValue.value = itemsList.value[index]
}

const saveEdit = () => {
  if (editingValue.value.trim()) {
    const updated = [...itemsList.value]
    updated[editingIndex.value] = editingValue.value.trim()
    emit('update', updated)
    cancelEdit()
  }
}

const cancelEdit = () => {
  editingIndex.value = null
  editingValue.value = ''
}
</script>

<style scoped>
.multi-text-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-text {
  font-size: 15px;
  font-weight: 500;
  color: #3c3c43;
  margin: 0 0 20px 0;
  letter-spacing: -0.23px;
  line-height: 1.5;
}

.question-description {
  font-size: 14px;
  color: #3c3c4399;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.help-section {
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: #00a19a1a;
  border-radius: 12px;
  margin: 0 0 20px 0;
  font-size: 13px;
  color: #3c3c43;
}

.help-icon {
  flex-shrink: 0;
  font-size: 16px;
  color: #00a19a;
}

.help-text {
  line-height: 1.4;
}

.typing-cursor {
  display: inline-block;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.item-card:hover {
  border-color: #00a19a;
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.item-text {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.edit-btn {
  padding: 6px 16px;
  background: #e3f2fd;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #00a19a;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
  margin-left: 12px;
}

.edit-btn:hover {
  background: #bce9e6;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.text-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.text-input:focus {
  outline: none;
  border-color: #00a19a;
}

.text-input::placeholder {
  color: #999;
}

.add-btn {
  padding: 12px 24px;
  background: #e8f5f3;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #00a19a;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  justify-content: center;
}

.add-btn:hover {
  background: #d0ede9;
}

.add-icon {
  font-size: 18px;
  font-weight: 700;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 12px;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #1a1a1a;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: none;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
}

.modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  justify-content: flex-end;
}

.cancel-btn,
.save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn {
  background: #f0f0f0;
  color: #1a1a1a;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.save-btn {
  background: #00a19a;
  color: white;
}

.save-btn:hover {
  background: #008b82;
}
</style>
