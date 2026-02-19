<template>
  <div class="note-question">
    <!-- Only show summary and question display when drawer is NOT open -->
    <template v-if="!open">
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

      <div class="summary" @click="openDrawer">
        <template v-if="isGenericTemplate">
          <div class="summary-full">
            <div class="summary-line">{{ shortGenericContent }}</div>
          </div>
        </template>
        <template v-else>
          <div v-if="hasBuyers" class="summary-section">
            <div class="summary-title">For Buyers</div>
            <div class="summary-line">{{ shortBuyersNote }}</div>
          </div>
          <div v-if="hasSellers" class="summary-section">
            <div class="summary-title">For Sellers</div>
            <div class="summary-line">{{ shortSellersNote }}</div>
          </div>
        </template>
      </div>
    </template>

    <!-- Teleport drawer to body for proper fullscreen overlay -->
    <Teleport to="body">
      <!-- Full screen drawer for notes -->
      <BaseDrawer
        v-model="open"
        title="Notes"
        :showBackButton="true"
        :fullscreen="true"
        @close="handleDrawerClose"
      >
        <!-- Show tabs only if there are multiple sections (not generic template) -->
        <div v-if="hasMultipleSections && !isGenericTemplate" class="tabs">
          <button
            :class="['tab', { active: activeTab === 'buyers' }]"
            @click="activeTab = 'buyers'"
          >
            Notes for Buyers
          </button>
          <button
            :class="['tab', { active: activeTab === 'sellers' }]"
            @click="activeTab = 'sellers'"
          >
            Notes for Sellers
          </button>
        </div>

        <div class="tab-content">
          <!-- Generic template: just show the content -->
          <div v-if="isGenericTemplate">
            <div class="template">
              <div class="template-body">{{ genericContent }}</div>
            </div>
          </div>

          <!-- Buyers/Sellers template: show tabbed content -->
          <div v-if="activeTab === 'buyers' && hasBuyers">
            <div class="template">
              <div class="template-body">{{ prewritten.buyers }}</div>
            </div>
          </div>

          <div v-if="activeTab === 'sellers' && hasSellers">
            <div class="template">
              <div class="template-body">{{ prewritten.sellers }}</div>
            </div>
          </div>
        </div>
      </BaseDrawer>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import VisitLinkCard from '~/components/passport-view/VisitLinkCard.vue'

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: null, required: false },
  displayedQuestion: { type: String, default: '' },
  showQuestionCursor: { type: Boolean, default: false },
  displayedDescription: { type: String, default: '' },
  showDescriptionCursor: { type: Boolean, default: false },
  displayedHelp: { type: String, default: '' },
  showHelpCursor: { type: Boolean, default: false },
  hideQuestionDisplay: { type: Boolean, default: false },
})

const emit = defineEmits(['update'])

const open = ref(false)
const activeTab = ref<'buyers' | 'sellers'>('buyers')
let hasAutoOpened = false

// Prefer prewritten values from the question if available
// Support both 'prewritten' and 'prewrittenTemplates' naming
const prewritten = computed(() => {
  const question = props.question as any
  return question.prewritten || question.prewrittenTemplates || {}
})

const shortBuyersNote = computed(() => {
  const text = prewritten.value?.buyers || 'Click to view buyers notes'
  return text.length > 50 ? text.slice(0, 50) + '...' : text
})

const shortSellersNote = computed(() => {
  const text = prewritten.value?.sellers || 'Click to view sellers notes'
  return text.length > 50 ? text.slice(0, 50) + '...' : text
})

const shortGenericContent = computed(() => {
  const text = genericContent.value || 'Click to view details'
  return text.length > 50 ? text.slice(0, 50) + '...' : text
})

const genericContent = computed(() => {
  return (
    prewritten.value?.content ||
    prewritten.value?.text ||
    prewritten.value?.body ||
    ''
  )
})

// Check which sections are available
const hasBuyers = computed(() => !!prewritten.value?.buyers)
const hasSellers = computed(() => !!prewritten.value?.sellers)
const hasContent = computed(() => !!genericContent.value)
const isGenericTemplate = computed(
  () => hasContent.value && !hasBuyers.value && !hasSellers.value,
)
const hasMultipleSections = computed(() => hasBuyers.value && hasSellers.value)

// Set active tab based on available sections
watch(
  () => [hasBuyers.value, hasSellers.value],
  () => {
    if (hasBuyers.value) {
      activeTab.value = 'buyers'
    } else if (hasSellers.value) {
      activeTab.value = 'sellers'
    }
  },
  { immediate: true },
)

const localAnswer = ref<{ buyers: string; sellers: string }>(
  props.answer || { buyers: '', sellers: '' },
)

watch(
  () => props.answer,
  (val) => {
    if (val)
      localAnswer.value = {
        buyers: val.buyers || '',
        sellers: val.sellers || '',
      }
  },
)

// Auto-open drawer when question becomes active
watch(
  () => props.question,
  () => {
    if (!hasAutoOpened && props.question?.type?.toLowerCase() === 'note') {
      hasAutoOpened = true
      open.value = true
    }
  },
  { immediate: true },
)

const openDrawer = () => {
  open.value = true
}

const handleDrawerClose = () => {
  open.value = false
  // When drawer closes, emit update to mark question as completed
  emit('update', true)
}

const handleVisitLink = () => {
  console.log('Visit link clicked')
}
</script>

<style scoped>
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

.note-question .summary {
  border: 1px dashed #e5e7eb;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.note-question .summary-section {
  flex: 1;
}

.note-question .summary-full {
  flex: 1;
  display: flex;
  align-items: center;
}

.note-question .summary-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
}

.note-question .summary-line {
  font-size: 13px;
  color: #111827;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-question .muted {
  color: #6b7280;
  font-weight: 500;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  background-color: #7878801f;
  border-radius: 100px;
  padding: 2px;
  color: #000;
}

.tab {
  padding: 8px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  font-weight: 590;
  font-size: 13px;
  line-height: 18px;
  letter-spacing: -0.08px;
  text-align: center;
  font-weight: 500;
  width: 50%;
}

.tab.active {
  background: white;
  border: 0.5px solid #0000000a;
  box-shadow: 0px 3px 1px 0px #0000000a;
  box-shadow: 0px 3px 8px 0px #0000001f;
}

.tab-content {
  margin-top: 12px;
}

.template {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 0;
  min-height: 400px;
  max-height: 60vh;
  overflow-y: auto;
}

.template-body {
  color: #4b5563;
  font-weight: 400;
  font-size: 16px;
  line-height: 23px;
  letter-spacing: 0px;
}
</style>
