<template>
  <div class="boundary-responsibility-question">
    <!-- Question Display (skip if hideQuestionDisplay is true) -->
    <template v-if="!hideQuestionDisplay">
      <p v-if="displayedQuestion" class="question-text">
        {{ displayedQuestion }}
        <span v-if="showQuestionCursor" class="typing-cursor">|</span>
      </p>

      <!-- Description Display -->
      <div v-if="displayedDescription" class="question-description">
        {{ displayedDescription }}
        <span
          v-if="showDescriptionCursor"
          class="typing-cursor typing-cursor--small"
          >|</span
        >
      </div>

      <!-- Help Display -->
      <div v-if="displayedHelp" class="help-section">
        <div class="help-content">
          <h4 class="help-title">
            <span class="help-icon">💡</span>What is this?
          </h4>
          <p class="help-text">
            {{ displayedHelp }}
            <span
              v-if="showHelpCursor"
              class="typing-cursor typing-cursor--small"
              >|</span
            >
          </p>
        </div>
      </div>
    </template>

    <!-- Property Layout with Clickable Areas -->
    <div class="property-layout">
      <div class="layout-container">
        <!-- Left Side -->
        <div
          class="side left-side"
          @click="openSelector('left')"
          :class="{ selected: selections.left }"
        >
          <span class="side-label">
            {{ selections.left ? formatLabel(selections.left) : 'LEFT' }}
          </span>
        </div>

        <!-- Right Side -->
        <div
          class="side right-side"
          @click="openSelector('right')"
          :class="{ selected: selections.right }"
        >
          <span class="side-label">
            {{ selections.right ? formatLabel(selections.right) : 'RIGHT' }}
          </span>
        </div>

        <!-- Center Property Image -->
        <div class="property-center">
          <OPIcon name="boundariesMap" class="w-[175px] h-[175px]" />
        </div>

        <!-- Rear Side (Bottom) -->
        <div
          class="side rear-side"
          @click="openSelector('rear')"
          :class="{ selected: selections.rear }"
        >
          <span class="side-label">
            {{ selections.rear ? formatLabel(selections.rear) : 'REAR' }}
          </span>
        </div>

        <!-- Front Side (Top) -->
        <div
          class="side front-side"
          @click="openSelector('front')"
          :class="{ selected: selections.front }"
        >
          <span class="side-label">
            {{ selections.front ? formatLabel(selections.front) : 'FRONT' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Your Selections Section -->
    <div class="selections-summary">
      <h3 class="summary-title">Your Selections</h3>
      <div class="summary-items">
        <div class="summary-item">
          <span class="summary-label">To the Left:</span>
          <span
            class="summary-value"
            :class="{ 'not-selected': !selections.left }"
          >
            {{
              selections.left ? formatLabel(selections.left) : 'Not Selected'
            }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">On the Right:</span>
          <span
            class="summary-value"
            :class="{ 'not-selected': !selections.right }"
          >
            {{
              selections.right ? formatLabel(selections.right) : 'Not Selected'
            }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">On the Rear:</span>
          <span
            class="summary-value"
            :class="{ 'not-selected': !selections.rear }"
          >
            {{
              selections.rear ? formatLabel(selections.rear) : 'Not Selected'
            }}
          </span>
        </div>
        <div class="summary-item">
          <span class="summary-label">On the Front:</span>
          <span
            class="summary-value"
            :class="{ 'not-selected': !selections.front }"
          >
            {{
              selections.front ? formatLabel(selections.front) : 'Not Selected'
            }}
          </span>
        </div>
      </div>

      <button class="reset-btn" @click="resetSelections">
        <span class="reset-icon">↻</span>
        Reset All Selections
      </button>
    </div>

    <!-- Selection Modal/Dropdown -->
    <div
      v-if="activeSelector"
      class="selector-overlay"
      @click="activeSelector = null"
    >
      <div class="selector-modal" @click.stop>
        <div class="selector-header">
          <h4>
            Select responsibility for {{ formatSideLabel(activeSelector) }}
          </h4>
          <button class="close-btn" @click="activeSelector = null">✕</button>
        </div>
        <div class="selector-options">
          <button
            v-for="option in questionOptions"
            :key="option.value"
            class="option-btn"
            :class="{ active: activeSelectionValue === option.value }"
            @click="selectOption(option.value)"
          >
            <span class="option-label">{{ option.label }}</span>
            <span v-if="activeSelectionValue === option.value" class="checkmark"
              >✓</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import OPIcon from '~/components/ui/OPIcon.vue'

type SideKey = 'left' | 'right' | 'rear' | 'front'

interface QuestionOption {
  label: string
  value: string
}

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: [Object, String], required: false },
  displayedQuestion: { type: String, default: '' },
  showQuestionCursor: { type: Boolean, default: false },
  displayedDescription: { type: String, default: '' },
  showDescriptionCursor: { type: Boolean, default: false },
  displayedHelp: { type: String, default: '' },
  showHelpCursor: { type: Boolean, default: false },
  hideQuestionDisplay: { type: Boolean, default: false },
})

const emit = defineEmits(['update'])

const activeSelector = ref<SideKey | null>(null)

// Selections for each side
const selections = ref({
  left: '',
  right: '',
  rear: '',
  front: '',
})

// Get options from question
const questionOptions = computed<QuestionOption[]>(
  () => props.question?.options || [],
)

const activeSelectionValue = computed(() => {
  if (!activeSelector.value) return ''
  return selections.value[activeSelector.value]
})

// Initialize selections from answer prop
watch(
  () => props.answer,
  (newAnswer) => {
    if (newAnswer && typeof newAnswer === 'object') {
      selections.value = {
        left: newAnswer.left || '',
        right: newAnswer.right || '',
        rear: newAnswer.rear || '',
        front: newAnswer.front || '',
      }
    }
  },
  { immediate: true },
)

const formatLabel = (value: string): string => {
  const option = questionOptions.value.find(
    (opt: QuestionOption) => opt.value === value,
  )
  return option ? option.label : value
}

const formatSideLabel = (side: SideKey): string => {
  return side.charAt(0).toUpperCase() + side.slice(1)
}

const openSelector = (side: SideKey) => {
  activeSelector.value = side
}

const selectOption = (value: string) => {
  if (activeSelector.value) {
    selections.value[activeSelector.value as keyof typeof selections.value] =
      value
    activeSelector.value = null
    emitUpdate()
  }
}

const resetSelections = () => {
  selections.value = {
    left: '',
    right: '',
    rear: '',
    front: '',
  }
  emitUpdate()
}

const emitUpdate = () => {
  emit('update', {
    left: selections.value.left,
    right: selections.value.right,
    rear: selections.value.rear,
    front: selections.value.front,
  })
}
</script>

<style scoped>
.boundary-responsibility-question {
  width: 100%;
}

.question-text {
  color: #000000;
  margin: 0 0 20px 0;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
}

.question-description {
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
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

.help-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.help-content {
  flex: 1;
}

.help-title {
  margin: 0px 0 8px -5px;
  color: #00a19a;
  font-weight: 590;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.help-text {
  color: #3c3c4399;
  margin: 0;
  font-weight: 400;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
}

.typing-cursor {
  margin-left: 2px;
  color: #00a19a;
  animation: blink 1s infinite;
}

.typing-cursor--small {
  margin-left: 2px;
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

/* Property Layout */
.property-layout {
  margin: 24px 0;
}

.layout-container {
  display: grid;
  grid-template-columns: 30px 1fr 30px;
  grid-template-rows: 30px 1fr 30px;
  gap: 12px;
  padding: 12px;
  background-color: #f3f0f0;
  border-radius: 12px;
}

.side {
  background: #00a19a;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: white;
  transition: all 0.2s;
  padding: 8px;
  min-height: 30px;
  position: relative;
}

.side:hover {
  background: #00b8a9;
  transform: scale(1.05);
}

.side.selected {
  background: #00d4c3;
  box-shadow: 0 0 0 3px #00a19a33;
}

.side-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.selected-value {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.9;
}

.left-side {
  grid-column: 1;
  grid-row: 2;
  writing-mode: vertical-lr;
  transform: rotate(180deg);
}

.right-side {
  grid-column: 3;
  grid-row: 2;
  writing-mode: vertical-lr;
}

.front-side {
  grid-column: 2;
  grid-row: 1;
}

.rear-side {
  grid-column: 2;
  grid-row: 3;
}

.property-center {
  grid-column: 2;
  grid-row: 2;
  background: transparent;
  border-radius: 8px;
  /* border: 2px solid #e0e0e0; */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.property-image {
  width: 100%;
  height: 100%;
  max-width: 150px;
  max-height: 150px;
}

/* Selections Summary */
.selections-summary {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
  border: 1px solid #e5e7eb;
}

.summary-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.summary-label {
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
}

.summary-value {
  font-size: 13px;
  font-weight: 600;
  color: #00a19a;
}

.summary-value.not-selected {
  color: #9ca3af;
  font-weight: 400;
}

.reset-btn {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #00a19a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #f9fafb;
  border-color: #00a19a;
}

.reset-icon {
  font-size: 16px;
}

/* Selector Modal */
.selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.selector-modal {
  background: white;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-height: 75vh;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  animation: modalSlideUp 0.3s ease;
}

.selector-modal::-webkit-scrollbar {
  display: none;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(100px);
  }
  to {
    transform: translateY(0);
  }
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 16px 16px 0 0;
  position: sticky;
  top: 0;
}

.selector-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selector-options {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
}

.option-btn {
  padding: 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #000;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  text-align: left;
}

.option-btn:hover {
  border-color: #00a19a;
  background: #f0fffe;
}

.option-btn.active {
  background: #00a19a;
  border-color: #00a19a;
  color: white;
}

.option-label {
  flex: 1;
}

.checkmark {
  font-size: 18px;
  font-weight: 700;
}
</style>
