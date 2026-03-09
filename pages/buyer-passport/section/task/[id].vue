<template>
  <div class="mobile-container task-page bg-umu-gradient">
    <!-- Loading -->
    <div v-if="loading" class="task-loading">
      <div class="task-spinner" />
    </div>

    <template v-else-if="task">
      <AppHeader :showBack="true" :backTo="backUrl" right="dots" />

      <div class="task-content">
        <!-- Hero -->
        <div class="task-hero">
          <div class="task-hero-icon">
            <OPIcon :name="section?.imageKey || 'fittingsContents'" class="w-[120px] h-[120px]" />
          </div>
          <h1 class="task-hero-title">{{ task.title }}</h1>
          <p class="task-hero-sub">{{ task.description || section?.description || 'Official property record' }}</p>
        </div>

        <!-- Search -->
        <div class="task-search-row">
          <div class="task-search-input">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" class="task-search-icon">
              <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="#999" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search Items..." />
          </div>
          <button class="task-search-btn">Search</button>
        </div>

        <!-- Items list -->
        <div class="task-items">
          <div
            v-for="q in filteredQuestions"
            :key="q.id"
            class="task-item"
          >
            <div class="task-item-header">
              <div class="task-item-left">
                <span
                  class="task-item-status"
                  :class="getStatusClass(q)"
                >{{ getStatusLabel(q) }}</span>
                <h3 class="task-item-title">{{ q.question }}</h3>
                <p v-if="q.description" class="task-item-desc">{{ q.description }}</p>
              </div>
              <div class="task-item-right">
                <span class="task-item-price">{{ getPrice(q) }}</span>
              </div>
            </div>

            <!-- Note / additional info -->
            <div v-if="getNote(q)" class="task-item-note">
              <div class="task-item-note-bar" />
              <p class="task-item-note-text">{{ getNote(q) }}</p>
            </div>

            <!-- No answer indicator -->
            <div v-if="!q.answer" class="task-item-unanswered">
              Not yet answered by owner
            </div>
          </div>

          <div v-if="filteredQuestions.length === 0" class="task-empty">
            <p>No items found.</p>
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
const config = useRuntimeConfig()

const taskId = route.params.id as string
const passportId = route.query.passportId as string
const sectionId = route.query.sectionId as string

const allData = ref<any>(null)
const loading = ref(true)
const searchQuery = ref('')

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

const task = computed(() => {
  if (!allData.value?.sections) return null
  for (const s of allData.value.sections) {
    const t = s.tasks?.find((t: any) => t.id === taskId)
    if (t) return t
  }
  return null
})

const backUrl = computed(() =>
  `/buyer-passport/section/${sectionId}?passportId=${passportId}`
)

const filteredQuestions = computed(() => {
  if (!task.value?.questions) return []
  const q = searchQuery.value.toLowerCase()
  if (!q) return task.value.questions
  return task.value.questions.filter((item: any) =>
    item.question.toLowerCase().includes(q) ||
    (item.description || '').toLowerCase().includes(q)
  )
})

function extractAnswerData(q: any): {
  status: string | null
  note: string | null
  price: number | null
  raw: any
} {
  if (!q.answer) return { status: null, note: null, price: null, raw: null }

  const json = q.answer.answerJson
  const text = q.answer.answerText

  // Plain text or string JSON
  if (text) return { status: text, note: null, price: null, raw: text }
  if (typeof json === 'string') return { status: json, note: null, price: null, raw: json }

  if (json && typeof json === 'object') {
    let status: string | null = null
    let note: string | null = null
    let price: number | null = null

    // Handle combined answer format { mainAnswer, additionalInfo }
    if (json.mainAnswer !== undefined) {
      const main = json.mainAnswer
      if (typeof main === 'string') status = main
      else if (typeof main === 'object') {
        for (const val of Object.values(main)) {
          if (typeof val === 'string') {
            const lower = val.toLowerCase()
            if (lower.includes('includ') || lower.includes('exclud') || lower.includes('offer') || lower.includes('taken')) {
              if (!status) status = val
            } else if (!note && val.trim()) {
              note = val
            }
          }
        }
      }
      // Additional info as note
      if (json.additionalInfo) {
        if (typeof json.additionalInfo === 'string') note = json.additionalInfo
        else if (typeof json.additionalInfo === 'object') {
          const vals = Object.values(json.additionalInfo).filter((v): v is string => typeof v === 'string' && !!v)
          if (vals.length) note = vals[0]
        }
      }
      return { status, note, price, raw: json }
    }

    // Handle radioAnswer format { radioAnswer, uploadedFiles }
    if (json.radioAnswer !== undefined) {
      status = typeof json.radioAnswer === 'string' ? json.radioAnswer : null
      return { status, note: null, price: null, raw: json }
    }

    // Generic multipart: scan all values
    for (const [key, val] of Object.entries(json)) {
      if (typeof val === 'string') {
        const lower = val.toLowerCase()
        if (!status && (lower.includes('includ') || lower.includes('exclud') || lower.includes('offer') || lower.includes('taken') || lower.includes('yes') || lower.includes('no'))) {
          status = val
        } else if (!note && val.trim().length > 2) {
          note = val
        }
      }
      if (typeof val === 'number' && (key.includes('price') || key.includes('cost') || key.includes('amount'))) {
        price = val
      }
    }

    return { status, note, price, raw: json }
  }

  return { status: null, note: null, price: null, raw: null }
}

function getStatusLabel(q: any): string {
  if (!q.answer) return 'Not answered'
  const { status } = extractAnswerData(q)
  if (!status) return 'Answered'
  return status
}

function getStatusClass(q: any): string {
  if (!q.answer) return 'status--unanswered'
  const { status } = extractAnswerData(q)
  if (!status) return 'status--answered'
  const lower = status.toLowerCase()
  if (lower.includes('includ') || lower.includes('yes')) return 'status--included'
  if (lower.includes('exclud') || lower.includes('taken') || lower.includes('remov') || lower.includes('no')) return 'status--excluded'
  if (lower.includes('offer') || lower.includes('extra')) return 'status--offered'
  return 'status--answered'
}

function getNote(q: any): string | null {
  if (!q.answer) return null
  const { note } = extractAnswerData(q)
  return note
}

function getPrice(q: any): string {
  if (!q.answer) return '£. —'
  const { price } = extractAnswerData(q)
  if (price !== null) return `£. ${price}`
  return '£. 0'
}
</script>

<style scoped>
.task-page {
  min-height: 100vh;
  padding-bottom: 40px;
}

.task-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.task-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.task-content {
  padding: 0 20px 40px;
}

/* Hero */
.task-hero {
  text-align: center;
  padding: 20px 0 20px;
}

.task-hero-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.task-hero-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 6px;
  line-height: 1.2;
}

.task-hero-sub {
  font-size: 13px;
  color: #3c3c4399;
  margin: 0 auto;
  line-height: 1.5;
  max-width: 280px;
}

/* Search */
.task-search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
  background: white;
  border-radius: 24px;
  border: 1px solid #e0e0e0;
  padding: 2px 2px 2px 14px;
}

.task-search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-search-input input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
  padding: 8px 0;
}

.task-search-input input::placeholder {
  color: #999;
}

.task-search-icon {
  flex-shrink: 0;
}

.task-search-btn {
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* Items */
.task-items {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.task-item {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.task-item-left {
  flex: 1;
  min-width: 0;
}

.task-item-right {
  flex-shrink: 0;
}

.task-item-status {
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 3px;
}

.status--included { color: #00a19a; }
.status--excluded { color: #e53e3e; }
.status--offered { color: #e8941a; }
.status--answered { color: #666; }
.status--unanswered { color: #ccc; }

.task-item-title {
  font-size: 15px;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 2px;
  line-height: 20px;
}

.task-item-desc {
  font-size: 12px;
  color: #3c3c4399;
  margin: 0;
}

.task-item-price {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}

/* Note */
.task-item-note {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  background: #e8faf9;
  border-radius: 8px;
  padding: 8px 10px;
  align-items: flex-start;
}

.task-item-note-bar {
  width: 3px;
  min-height: 16px;
  background: #00a19a;
  border-radius: 2px;
  flex-shrink: 0;
  align-self: stretch;
}

.task-item-note-text {
  font-size: 12px;
  color: #00a19a;
  margin: 0;
  line-height: 1.4;
  font-style: italic;
}

/* Unanswered */
.task-item-unanswered {
  margin-top: 6px;
  font-size: 11px;
  color: #ccc;
  font-style: italic;
}

/* Empty */
.task-empty {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
