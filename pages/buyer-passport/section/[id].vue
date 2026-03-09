<template>
  <div class="mobile-container section-page bg-umu-gradient">
    <!-- Loading -->
    <div v-if="loading" class="section-loading">
      <div class="section-spinner" />
    </div>

    <template v-else-if="section">
      <AppHeader :showBack="true" :backTo="`/buyer-passport/${passportId}`" right="dots" />

      <div class="section-content">
        <!-- Hero icon + title -->
        <div class="section-hero">
          <div class="section-hero-icon">
            <OPIcon :name="section.imageKey || 'fittingsContents'" class="w-[120px] h-[120px]" />
          </div>
          <h1 class="section-hero-title">{{ section.title }}</h1>
          <p class="section-hero-sub">{{ section.subtitle || section.description || 'Official property record' }}</p>
        </div>

        <!-- Action buttons -->
        <div class="section-actions">
          <button class="section-btn section-btn--outline">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#00a19a" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="#00a19a" stroke-width="2"/>
            </svg>
            Preview
          </button>
          <button class="section-btn section-btn--filled">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <polyline points="7,10 12,15 17,10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Download
          </button>
        </div>

        <!-- Stats grid -->
        <div class="section-stats">
          <div class="section-stat section-stat--included">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <polyline points="20,6 9,17 4,12" stroke="#00a19a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
              <p class="section-stat-label">Included in sale</p>
              <p class="section-stat-value section-stat-value--green">{{ stats.included }} Items</p>
            </div>
          </div>
          <div class="section-stat section-stat--excluded">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" stroke="#e53e3e" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="#e53e3e" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <div>
              <p class="section-stat-label">Excluded / taken</p>
              <p class="section-stat-value section-stat-value--red">{{ stats.excluded }} items</p>
            </div>
          </div>
          <div class="section-stat section-stat--offered">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="#e8941a" stroke-width="2"/>
              <line x1="2" y1="10" x2="22" y2="10" stroke="#e8941a" stroke-width="2"/>
            </svg>
            <div>
              <p class="section-stat-label">Offered for extra price</p>
              <p class="section-stat-value section-stat-value--amber">{{ stats.offered }} Items</p>
            </div>
          </div>
          <div class="section-stat">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#666" stroke-width="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="#666" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="#666" stroke-width="2" stroke-linecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="#666" stroke-width="2"/>
            </svg>
            <div>
              <p class="section-stat-label">Form last updated</p>
              <p class="section-stat-value">{{ stats.lastUpdated }}</p>
            </div>
          </div>
        </div>

        <!-- Form Details header -->
        <div class="section-details-header" @click="showFormDetails = !showFormDetails">
          <span class="section-details-label">Form Details</span>
          <OPIcon :name="showFormDetails ? 'caretDown' : 'caretRight'" class="w-[16px] h-[16px]" />
        </div>

        <!-- Tasks list -->
        <div class="section-tasks">
          <div
            v-for="task in section.tasks"
            :key="task.id"
            class="section-task-row"
            @click="goToTask(task.id)"
          >
            <div class="section-task-icon">
              <OPIcon :name="section.imageKey || 'fittingsContents'" class="w-[40px] h-[40px]" />
            </div>
            <div class="section-task-info">
              <h3 class="section-task-title">{{ task.title }}</h3>
              <div class="section-task-tags">
                <span
                  v-for="tag in getTaskTags(task)"
                  :key="tag.label"
                  class="section-task-tag"
                  :class="tag.class"
                >{{ tag.label }}</span>
              </div>
            </div>
            <button class="section-task-arrow">
              <OPIcon name="caretRight" class="w-[13px] h-[13px]" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/core/AppHeader.vue'
import OPIcon from '~/components/ui/OPIcon.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const sectionId = route.params.id as string
const passportId = route.query.passportId as string

const allData = ref<any>(null)
const loading = ref(true)
const showFormDetails = ref(false)

onMounted(async () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    allData.value = await $fetch(`${config.public.apiBase}/passport/${passportId}/buyer-view`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (e) {
    console.error('Failed to load buyer view', e)
  } finally {
    loading.value = false
  }
})

const section = computed(() =>
  allData.value?.sections?.find((s: any) => s.id === sectionId) ?? null
)

// Compute stats by scanning all question answers across tasks
const stats = computed(() => {
  if (!section.value) return { included: 0, excluded: 0, offered: 0, lastUpdated: '—' }

  let included = 0
  let excluded = 0
  let offered = 0
  let latestDate: Date | null = null

  for (const task of section.value.tasks) {
    for (const q of task.questions) {
      if (!q.answer) continue
      const status = extractStatus(q.answer.answerJson, q.answer.answerText)
      if (status) {
        const lower = status.toLowerCase()
        if (lower.includes('includ')) included++
        else if (lower.includes('exclud') || lower.includes('taken') || lower.includes('remov')) excluded++
        else if (lower.includes('offer') || lower.includes('extra')) offered++
        else included++ // default to included for answered questions
      } else if (q.answer.answerText || q.answer.answerJson) {
        included++
      }
      if (q.answer.createdAt) {
        const d = new Date(q.answer.createdAt)
        if (!latestDate || d > latestDate) latestDate = d
      }
    }
  }

  const lastUpdated = latestDate
    ? latestDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return { included, excluded, offered, lastUpdated }
})

function extractStatus(answerJson: any, answerText: string | null): string | null {
  if (answerText) return answerText
  if (!answerJson) return null
  if (typeof answerJson === 'string') return answerJson
  if (typeof answerJson === 'object') {
    // Look for status-like string values
    for (const val of Object.values(answerJson)) {
      if (typeof val === 'string') {
        const lower = val.toLowerCase()
        if (lower.includes('includ') || lower.includes('exclud') || lower.includes('offer') || lower.includes('taken')) {
          return val
        }
      }
    }
    // Return first string value
    for (const val of Object.values(answerJson)) {
      if (typeof val === 'string' && val.trim()) return val
    }
  }
  return null
}

function getTaskTags(task: any): Array<{ label: string; class: string }> {
  const tags: Array<{ label: string; class: string }> = []
  const answered = task.questions.filter((q: any) => q.answer)

  if (answered.length === 0) {
    tags.push({ label: 'No answers yet', class: 'tag--gray' })
    return tags
  }

  let hasIncluded = false
  let hasExcluded = false

  for (const q of answered) {
    const status = extractStatus(q.answer.answerJson, q.answer.answerText)
    if (status) {
      const lower = status.toLowerCase()
      if (lower.includes('includ')) hasIncluded = true
      if (lower.includes('exclud') || lower.includes('taken') || lower.includes('remov')) hasExcluded = true
    } else {
      hasIncluded = true
    }
  }

  if (hasIncluded) {
    // Show proportion text
    const total = task.questions.length
    const label = answered.length === total ? 'All' : `${answered.length} of ${total}`
    tags.push({ label, class: 'tag--included' })
    if (hasIncluded) tags.push({ label: 'Included', class: 'tag--included' })
  }
  if (hasExcluded) tags.push({ label: 'Excluded', class: 'tag--excluded' })

  return tags.slice(0, 3)
}

function goToTask(taskId: string) {
  router.push(`/buyer-passport/section/task/${taskId}?passportId=${passportId}&sectionId=${sectionId}`)
}
</script>

<style scoped>
.section-page {
  min-height: 100vh;
  padding-bottom: 40px;
}

.section-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.section-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.section-content {
  padding: 0 20px 40px;
}

/* Hero */
.section-hero {
  text-align: center;
  padding: 24px 0 20px;
}

.section-hero-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.section-hero-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px;
  line-height: 1.2;
}

.section-hero-sub {
  font-size: 13px;
  color: #3c3c4399;
  margin: 0;
  line-height: 1.5;
  max-width: 280px;
  margin: 0 auto;
}

/* Action buttons */
.section-actions {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}

.section-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.section-btn--outline {
  background: white;
  border: 1.5px solid #00a19a;
  color: #00a19a;
}

.section-btn--filled {
  background: #00a19a;
  border: none;
  color: white;
}

/* Stats grid */
.section-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.section-stat {
  background: white;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border: 0.5px solid #f0f0f0;
}

.section-stat-label {
  font-size: 11px;
  color: #3c3c4399;
  margin: 0 0 2px;
  line-height: 1.3;
}

.section-stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.section-stat-value--green { color: #00a19a; }
.section-stat-value--red { color: #e53e3e; }
.section-stat-value--amber { color: #e8941a; }

/* Form details header */
.section-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  cursor: pointer;
  border: 0.5px solid #f0f0f0;
}

.section-details-label {
  font-size: 15px;
  font-weight: 590;
  color: #000;
}

/* Tasks list */
.section-tasks {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  background: white;
}

.section-task-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
}

.section-task-row:last-child {
  border-bottom: none;
}

.section-task-row:active {
  background: #f8f8f8;
}

.section-task-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-task-info {
  flex: 1;
  min-width: 0;
}

.section-task-title {
  font-size: 15px;
  font-weight: 590;
  color: #000;
  margin: 0 0 4px;
  line-height: 20px;
}

.section-task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.section-task-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.tag--included {
  color: #00a19a;
  background: transparent;
}

.tag--excluded {
  color: #e53e3e;
  background: transparent;
}

.tag--gray {
  color: #999;
  background: transparent;
}

.section-task-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f9f9fd;
  border: 0.5px solid #d2d1e4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
