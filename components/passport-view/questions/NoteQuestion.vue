<template>
  <div class="note-question">
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
      <div class="summary-line">Buyer note</div>
      <div class="summary-line">Seller note</div>
    </div>
    <!-- <BaseDrawer
      v-model="showRegisterInterest"
      title="Register Interest"
      :showBackButton="true"
      @close="showRegisterInterest = false"
    >
      <RegisterInterestContent
        address="12, Maple Road, Staines TW18 3BA"
        @submit="onInterestRegistered"
      />
    </BaseDrawer> -->
    <BaseDrawer v-model="open" title="Notes">
      <div class="tabs">
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
        <div v-if="activeTab === 'buyers'">
          <div v-if="prewritten?.buyers" class="template">
            <div class="template-body">{{ prewritten.buyers }}</div>
          </div>
          <VisitLinkCard
            :title="prewritten.buyers_link.title"
            :url="prewritten.buyers_link.url"
            @visitLink="handleVisitLink"
          />
        </div>

        <div v-else>
          <div v-if="prewritten?.sellers" class="template">
            <div class="template-body">{{ prewritten.sellers }}</div>
          </div>
          <VisitLinkCard
            v-if="prewritten?.sellers_link"
            :title="prewritten.sellers_link.title"
            :url="prewritten.sellers_link.url"
            @visitLink="handleVisitLink"
          />
        </div>
      </div>

      <!-- <template #footer>
        <div class="drawer-footer">
          <button class="btn-cancel" @click="closeDrawer">Cancel</button>
          <button class="btn-save" @click="save">Save</button>
        </div>
      </template> -->
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import VisitLinkCard from '~/components/passport-view/VisitLinkCard.vue'

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: null, required: false },
})

const emit = defineEmits(['update'])

const open = ref(false)
const activeTab = ref<'buyers' | 'sellers'>('buyers')

// Prefer prewritten values from the question if available
const prewritten = computed(() => (props.question as any).prewritten || {})

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

const openDrawer = () => {
  open.value = true
}

const closeDrawer = () => {
  open.value = false
}

const save = () => {
  emit('update', { ...localAnswer.value })
  closeDrawer()
}

const handleVisitLink = () => {
  // Handle visit link action - you can open the URL or emit an event
  console.log('Visit link clicked')
}

const applyTemplate = (which: 'buyers' | 'sellers') => {
  if (prewritten.value && prewritten.value[which]) {
    localAnswer.value[which] = prewritten.value[which]
  }
}

const short = (text: string) => {
  if (!text) return ''
  return text.length > 40 ? text.slice(0, 40) + '…' : text
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
.note-question .summary-line {
  font-size: 13px;
  color: #111827;
  margin-bottom: 6px;
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
}
.tab {
  padding: 8px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  border-radius: 100px;
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

.template {
  background: #f9fafb;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  min-height: 68vh;
}
.template-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  display: block;
}
.template-body {
  color: #3c3c4399;
  margin-bottom: 8px;
  font-weight: 400;
  font-size: 16px;
  line-height: 23px;
  letter-spacing: 0px;
}
.insert-btn {
  background: transparent;
  border: none;
  color: #00a19a;
  cursor: pointer;
  font-weight: 600;
}

textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 10px;
  font-size: 13px;
}
</style>
