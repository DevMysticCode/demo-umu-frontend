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
          <div v-if="hasSellers" class="summary-section">
            <div class="summary-title">For Sellers</div>
            <div class="summary-line">{{ shortSellersNote }}</div>
          </div>
          <div v-if="hasBuyers" class="summary-section">
            <div class="summary-title">For Buyers</div>
            <div class="summary-line">{{ shortBuyersNote }}</div>
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
        <!-- Conditional info card (only shown when infoCard data exists) -->
        <div v-if="infoCard" class="info-card">
          <div class="info-card__header">
            <div class="info-card__text">
              <h3 class="info-card__title">{{ infoCard.title }}</h3>
              <p class="info-card__description">{{ infoCard.description }}</p>
              <span v-if="infoCard.sections?.length" class="info-card__link">{{
                infoCard.sections[0].title
              }}</span>
            </div>
            <OPIcon
              v-if="infoCard.icon"
              :name="infoCard.icon"
              class="w-[48px] h-[48px]"
            />
          </div>
          <div
            v-for="section in infoCard.sections"
            :key="section.title"
            class="info-card__section"
          >
            <h4 class="info-card__section-title">{{ section.title }}</h4>
            <p class="info-card__section-content">{{ section.content }}</p>
          </div>
        </div>

        <!-- Visit link cards (only shown when links array exists) -->
        <div v-if="links.length > 0" class="link-cards">
          <div v-for="(link, i) in links" :key="i" class="link-card">
            <div class="link-card__header">
              <div class="link-card__text">
                <p class="link-card__title">{{ link.title }}</p>
                <a
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-card__url"
                >{{ link.url }}</a>
              </div>
              <OPIcon
                v-if="link.icon"
                :name="link.icon"
                class="w-[48px] h-[48px] link-card__icon"
              />
            </div>
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="link-card__btn"
              ><OPIcon name="visitLink" class="w-[15px] h-[15px]" /> Visit
              Link</a
            >
          </div>
        </div>

        <!-- Show tabs only if there are multiple sections (not generic template) -->
        <div v-if="hasMultipleSections && !isGenericTemplate" class="tabs">
          <button
            :class="['tab', { active: activeTab === 'sellers' }]"
            @click="activeTab = 'sellers'"
          >
            Notes for Sellers
          </button>
          <button
            :class="['tab', { active: activeTab === 'buyers' }]"
            @click="activeTab = 'buyers'"
          >
            Notes for Buyers
          </button>
        </div>

        <div class="tab-content">
          <!-- Generic template: just show the content -->
          <div v-if="isGenericTemplate">
            <div class="template">
              <div class="template-body">
                <template v-if="Array.isArray(genericContent)">
                  <ul class="note-list">
                    <li v-for="(item, i) in genericContent" :key="i">
                      {{ item }}
                    </li>
                  </ul>
                </template>
                <template v-else>{{ genericContent }}</template>
              </div>
            </div>
          </div>

          <!-- Buyers/Sellers template: show tabbed content -->
          <div v-if="activeTab === 'buyers' && hasBuyers">
            <div class="template">
              <div class="template-body">
                <template v-if="Array.isArray(prewritten.buyers)">
                  <ul class="note-list">
                    <li v-for="(item, i) in prewritten.buyers" :key="i">
                      {{ item }}
                    </li>
                  </ul>
                </template>
                <template v-else>{{ prewritten.buyers }}</template>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'sellers' && hasSellers">
            <div class="template">
              <div class="template-body">
                <template v-if="Array.isArray(prewritten.sellers)">
                  <ul class="note-list">
                    <li v-for="(item, i) in prewritten.sellers" :key="i">
                      {{ item }}
                    </li>
                  </ul>
                </template>
                <template v-else>{{ prewritten.sellers }}</template>
              </div>
            </div>
          </div>
        </div>
      </BaseDrawer>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

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
const activeTab = ref<'buyers' | 'sellers'>('sellers')
let hasAutoOpened = false

// Prefer prewritten values from the question if available
// Support both 'prewritten' and 'prewrittenTemplates' naming
const prewritten = computed(() => {
  const question = props.question as any
  return question.prewritten || question.prewrittenTemplates || {}
})

// Info card is optional — only shown when present in the data
const infoCard = computed(() => prewritten.value?.infoCard || null)

// Link cards — optional array of { title, url } objects
const links = computed(() => prewritten.value?.links || [])

const shortBuyersNote = computed(() => {
  const value = prewritten.value?.buyers
  const text = Array.isArray(value)
    ? value[0] || 'Click to view buyers notes'
    : value || 'Click to view buyers notes'
  return text.length > 50 ? text.slice(0, 50) + '...' : text
})

const shortSellersNote = computed(() => {
  const value = prewritten.value?.sellers
  const text = Array.isArray(value)
    ? value[0] || 'Click to view sellers notes'
    : value || 'Click to view sellers notes'
  return text.length > 50 ? text.slice(0, 50) + '...' : text
})

const shortGenericContent = computed(() => {
  const value = genericContent.value
  const text = Array.isArray(value)
    ? value[0] || 'Click to view details'
    : value || 'Click to view details'
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
const hasBuyers = computed(() => {
  const v = prewritten.value?.buyers
  return Array.isArray(v) ? v.length > 0 : !!v
})
const hasSellers = computed(() => {
  const v = prewritten.value?.sellers
  return Array.isArray(v) ? v.length > 0 : !!v
})
const hasContent = computed(() => {
  const v = genericContent.value
  return Array.isArray(v) ? v.length > 0 : !!v
})
const isGenericTemplate = computed(
  () => hasContent.value && !hasBuyers.value && !hasSellers.value,
)
const hasMultipleSections = computed(() => hasBuyers.value && hasSellers.value)

// Set active tab based on available sections
watch(
  () => [hasBuyers.value, hasSellers.value],
  () => {
    if (hasSellers.value) {
      activeTab.value = 'sellers'
    } else if (hasBuyers.value) {
      activeTab.value = 'buyers'
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

/* Bullet list for array content */
.note-list {
  margin: 0;
  padding-left: 18px;
  list-style: disc;
}

.note-list li {
  margin-bottom: 14px;
  color: #4b5563;
  font-weight: 400;
  font-size: 16px;
  line-height: 23px;
}

.note-list li:last-child {
  margin-bottom: 0;
}

/* Conditional info card */
.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.info-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.info-card__text {
  flex: 1;
}

.info-card__title {
  font-size: 15px;
  font-weight: 700;
  color: #000;
  margin: 0 0 6px;
}

.info-card__description {
  font-size: 13px;
  color: #00a19a;
  margin: 0 0 4px;
  line-height: 18px;
}

.info-card__link {
  font-size: 12px;
  color: #00a19a;
  text-decoration: underline;
}

.info-card__section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.info-card__section-title {
  font-size: 14px;
  font-weight: 700;
  color: #000;
  margin: 0 0 6px;
}

.info-card__section-content {
  font-size: 13px;
  color: #00a19a;
  margin: 0;
  line-height: 18px;
}

/* Visit link cards */
.link-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.link-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.link-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.link-card__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.link-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  margin: 0;
}

.link-card__url {
  font-size: 12px;
  color: #00a19a;
  text-decoration: none;
  word-break: break-all;
  line-height: 1.4;
}

.link-card__icon {
  flex-shrink: 0;
}

.link-card__btn {
  display: flex;
  padding: 10px 16px;
  background: #00a19a;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  width: -moz-fit-content;
  width: fit-content;
  margin-left: auto;
  align-items: center;
  gap: 4px;
  border-radius: 100px;
}
</style>
