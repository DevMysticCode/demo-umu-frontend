<template>
  <div class="mobile-container section-page bg-umu-gradient">
    <div v-if="loading" class="section-loading">
      <div class="section-spinner" />
    </div>

    <template v-else-if="section">
      <AppHeader :showBack="true" :backTo="`/buyer-passport/${passportId}`" right="dots" />

      <div class="section-content">
        <!-- Hero -->
        <div class="section-hero">
          <div class="section-hero-icon">
            <OPIcon :name="section.imageKey || 'fittingsContents'" class="w-[120px] h-[120px]" />
          </div>
          <h1 class="section-hero-title">{{ section.title }}</h1>
          <p class="section-hero-sub">{{ section.subtitle || section.description || 'Official property record' }}</p>

          <!-- Help + Video buttons (section level) -->
          <div v-if="section.helpContent || section.helpVideoUrl" class="section-action-btns">
            <button v-if="section.helpContent" class="action-btn action-btn--help" @click="showHelp = true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 17v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="8" r="1" fill="currentColor"/>
              </svg>
              Help
            </button>
            <button v-if="section.helpVideoUrl" class="action-btn action-btn--video" @click="showVideo = true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
              </svg>
              Play Video
            </button>
          </div>
        </div>

        <!-- Fixtures & Fittings: Included / Excluded / Offered stats + file buttons -->
        <template v-if="section.key === 'fixturesAndFittings'">
          <div class="section-actions">
            <button
              class="section-btn section-btn--outline"
              :class="{ 'section-btn--disabled': sectionFiles.length === 0 }"
              :disabled="sectionFiles.length === 0"
              @click="showFilesSheet = true"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Preview
            </button>
            <button
              class="section-btn section-btn--filled"
              :class="{ 'section-btn--disabled': sectionFiles.length === 0 }"
              :disabled="sectionFiles.length === 0"
              @click="downloadAllFiles"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <polyline points="7,10 12,15 17,10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Download
            </button>
          </div>

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
        </template>

        <!-- All other sections: progress card + file buttons only if files exist -->
        <template v-else>
          <div v-if="sectionFiles.length > 0" class="section-actions">
            <button class="section-btn section-btn--outline" @click="showFilesSheet = true">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Preview Files
            </button>
            <button class="section-btn section-btn--filled" @click="downloadAllFiles">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <polyline points="7,10 12,15 17,10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Download All
            </button>
          </div>

          <div class="section-progress-card">
            <div class="section-progress-row">
              <span class="section-progress-label">Questions answered by seller</span>
              <span class="section-progress-count">{{ progress.answered }} / {{ progress.total }}</span>
            </div>
            <div class="section-progress-bar-bg">
              <div class="section-progress-bar-fill" :style="{ width: progress.pct + '%' }" />
            </div>
            <p v-if="progress.lastUpdated !== '—'" class="section-progress-date">
              Last updated {{ progress.lastUpdated }}
            </p>
          </div>
        </template>

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
              <h3 class="section-task-title">{{ task.title || firstVisibleQuestion(task) || 'Questions' }}</h3>
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

    <!-- File preview bottom sheet -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="showFilesSheet" class="files-sheet-overlay" @click.self="showFilesSheet = false">
          <div class="files-sheet">
            <div class="files-sheet-handle" />
            <div class="files-sheet-header">
              <h2 class="files-sheet-title">Uploaded Documents</h2>
              <button class="files-sheet-close" @click="showFilesSheet = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#666" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div class="files-sheet-body">
              <p v-if="sectionFiles.length === 0" class="files-empty">No files uploaded for this section.</p>
              <div v-for="(file, i) in sectionFiles" :key="i" class="file-row">
                <div class="file-icon">
                  <svg v-if="isImage(file.url)" width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00a19a" stroke-width="1.5"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="#00a19a"/>
                    <path d="M21 15l-5-5L5 21" stroke="#00a19a" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#6366f1" stroke-width="1.5"/>
                    <polyline points="14,2 14,8 20,8" stroke="#6366f1" stroke-width="1.5"/>
                  </svg>
                </div>
                <div class="file-info">
                  <p class="file-name">{{ file.name }}</p>
                  <p class="file-from">{{ file.question }}</p>
                </div>
                <div class="file-actions">
                  <template v-if="file.url">
                    <button class="file-btn file-btn--preview" @click="openFile(file.url)">Preview</button>
                    <button class="file-btn file-btn--download" @click="downloadFile(file.url, file.name)">↓</button>
                  </template>
                  <span v-else class="file-pending-badge">Pending upload</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Help drawer (section level) -->
    <HelpDrawer
      :show="showHelp"
      :content="section?.helpContent as any"
      mode="buyer"
      @close="showHelp = false"
    />

    <!-- Video modal (section level) -->
    <VideoModal
      :show="showVideo"
      :videoUrl="section?.helpVideoUrl"
      @close="showVideo = false"
    />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/core/AppHeader.vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import HelpDrawer from '@/components/passport-view/HelpDrawer.vue'
import VideoModal from '@/components/passport-view/VideoModal.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const sectionId = route.params.id as string
const passportId = route.query.passportId as string

const allData = ref<any>(null)
const loading = ref(true)
const showFormDetails = ref(false)
const showFilesSheet = ref(false)
const showHelp = ref(false)
const showVideo = ref(false)

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

// NOTE questions are seller-internal — exclude from all buyer-facing counts and cards
function visibleQuestions(task: any): any[] {
  return (task.questions ?? []).filter((q: any) => q.type !== 'NOTE')
}

function firstVisibleQuestion(task: any): string {
  const q = visibleQuestions(task)[0]
  if (!q) return ''
  if (q.question) return q.question
  if (Array.isArray(q.parts) && q.parts[0]?.title) return q.parts[0].title
  return ''
}

// Normalise any file entry to { url, name } — handles URL strings, { name, url } objects, { name, size, type } metadata
function normaliseFileEntry(f: any, fallbackName = 'document'): { url: string; name: string } | null {
  if (!f) return null
  if (typeof f === 'string' && f.trim()) return { url: f, name: extractFilename(f) }
  if (typeof f === 'object') {
    const url = f.url || f.fileUrl || ''
    const name = f.name || f.filename || (url ? extractFilename(url) : fallbackName)
    if (name) return { url, name }
  }
  return null
}

// Collect all files from answered questions across all tasks in this section
const sectionFiles = computed((): Array<{ url: string; name: string; question: string }> => {
  if (!section.value) return []
  const files: Array<{ url: string; name: string; question: string }> = []

  const pushFile = (entry: any, label: string) => {
    const n = normaliseFileEntry(entry)
    if (n) files.push({ ...n, question: label })
  }

  for (const task of section.value.tasks) {
    for (const q of visibleQuestions(task)) {
      if (!q.answer) continue
      const label = q.question || (Array.isArray(q.parts) && q.parts[0]?.title) || 'Document'

      // 1. Dedicated fileUrl column
      if (q.answer.fileUrl) pushFile(q.answer.fileUrl, label)

      const json = q.answer.answerJson
      if (json && typeof json === 'object') {
        // 2. answerJson is a direct file array: [{name, size, type, url?}] or ["url"]
        if (Array.isArray(json)) {
          for (const f of json) pushFile(f, label)
        } else {
          // 3. { uploadedFiles: [...] }
          const uploaded = (json as any).uploadedFiles
          if (Array.isArray(uploaded)) {
            for (const f of uploaded) pushFile(f, label)
          }
          // 4. MULTIPART part values: scan each key that could be { text, files }
          for (const val of Object.values(json as object)) {
            if (val && typeof val === 'object' && !Array.isArray(val)) {
              const partFiles = (val as any).files
              if (Array.isArray(partFiles)) {
                for (const f of partFiles) pushFile(f, label)
              }
            }
          }
        }
      }
    }
  }
  return files
})

// Fixtures & Fittings stats
const stats = computed(() => {
  if (!section.value) return { included: 0, excluded: 0, offered: 0, lastUpdated: '—' }
  let included = 0, excluded = 0, offered = 0
  let latestDate: Date | null = null
  for (const task of section.value.tasks) {
    for (const q of visibleQuestions(task)) {
      if (!q.answer) continue
      const s = extractPrimaryStatus(q.answer.answerJson, q.answer.answerText)
      if (s) {
        const l = s.toLowerCase()
        if (l.includes('includ')) included++
        else if (l.includes('exclud') || l.includes('taken') || l.includes('remov')) excluded++
        else if (l.includes('offer') || l.includes('extra')) offered++
        else included++
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

// Progress for non-fixtures sections
const progress = computed(() => {
  if (!section.value) return { answered: 0, total: 0, pct: 0, lastUpdated: '—' }
  let total = 0, answered = 0
  let latestDate: Date | null = null
  for (const task of section.value.tasks) {
    const qs = visibleQuestions(task)
    total += qs.length
    for (const q of qs) {
      if (q.answer && (q.answer.answerText || q.answer.answerJson || q.answer.fileUrl)) {
        answered++
        if (q.answer.createdAt) {
          const d = new Date(q.answer.createdAt)
          if (!latestDate || d > latestDate) latestDate = d
        }
      }
    }
  }
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0
  const lastUpdated = latestDate
    ? latestDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
  return { answered, total, pct, lastUpdated }
})

function extractPrimaryStatus(answerJson: any, answerText: string | null): string | null {
  if (answerText) return answerText
  if (!answerJson) return null
  if (typeof answerJson === 'string') return answerJson
  if (typeof answerJson === 'object') {
    const main = (answerJson as any).mainAnswer
    if (typeof main === 'string') return main
    if (main && typeof main === 'object') {
      for (const v of Object.values(main)) {
        if (typeof v === 'string') return v
      }
    }
    const radio = (answerJson as any).radioAnswer
    if (typeof radio === 'string') return radio
    for (const v of Object.values(answerJson as object)) {
      if (typeof v === 'string' && v.trim()) return v
    }
  }
  return null
}

function getTaskTags(task: any): Array<{ label: string; class: string }> {
  const tags: Array<{ label: string; class: string }> = []
  const qs = visibleQuestions(task)
  const answered = qs.filter((q: any) => q.answer && (q.answer.answerText || q.answer.answerJson || q.answer.fileUrl))

  if (answered.length === 0) {
    tags.push({ label: 'No answers yet', class: 'tag--gray' })
    return tags
  }

  const total = qs.length
  const countLabel = answered.length === total ? `All ${total} answered` : `${answered.length} of ${total} answered`
  tags.push({ label: countLabel, class: 'tag--answered' })

  // Fixtures only: show Included / Excluded summary badges
  if (section.value?.key === 'fixturesAndFittings') {
    let hasIncluded = false, hasExcluded = false
    for (const q of answered) {
      const s = extractPrimaryStatus(q.answer.answerJson, q.answer.answerText)
      if (s) {
        const l = s.toLowerCase()
        if (l.includes('includ')) hasIncluded = true
        if (l.includes('exclud') || l.includes('taken') || l.includes('remov')) hasExcluded = true
      } else {
        hasIncluded = true
      }
    }
    if (hasIncluded) tags.push({ label: 'Included', class: 'tag--included' })
    if (hasExcluded) tags.push({ label: 'Excluded', class: 'tag--excluded' })
  }

  return tags.slice(0, 3)
}

function goToTask(taskId: string) {
  router.push(`/buyer-passport/section/task/${taskId}?passportId=${passportId}&sectionId=${sectionId}`)
}

// File helpers
function extractFilename(url: string): string {
  try {
    const parts = url.split('/')
    const last = parts[parts.length - 1]
    return decodeURIComponent(last.split('?')[0]) || 'document'
  } catch {
    return 'document'
  }
}

function isImage(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(url)
}

function openFile(url: string) {
  window.open(url, '_blank', 'noopener')
}

function downloadFile(url: string, name: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.target = '_blank'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function downloadAllFiles() {
  for (const f of sectionFiles.value) {
    downloadFile(f.url, f.name)
  }
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
  line-height: 1.5;
  max-width: 280px;
  margin: 0 auto;
}

/* Help / Video buttons */
.section-action-btns {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 14px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.action-btn--help {
  background: #f0faf9;
  color: #00a19a;
  border: 1px solid #b2e4e1;
}

.action-btn--video {
  background: #f5f0ff;
  color: #7c3aed;
  border: 1px solid #d4b8f8;
}

/* Preview / Download row */
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

.section-btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

/* Fixtures stats grid */
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

/* Progress card (non-fixtures) */
.section-progress-card {
  background: white;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
  border: 0.5px solid #f0f0f0;
}

.section-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-progress-label {
  font-size: 13px;
  color: #444;
}

.section-progress-count {
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
}

.section-progress-bar-bg {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.section-progress-bar-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.section-progress-date {
  font-size: 11px;
  color: #9ca3af;
  margin: 8px 0 0;
  text-align: right;
}

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

/* Tasks */
.section-tasks {
  display: flex;
  flex-direction: column;
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

.section-task-row:last-child { border-bottom: none; }
.section-task-row:active { background: #f8f8f8; }

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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.tag--answered { color: #666; }
.tag--included { color: #00a19a; }
.tag--excluded { color: #e53e3e; }
.tag--gray { color: #999; }

.section-task-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f9f9fd;
  border: 0.5px solid #d2d1e4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* File preview sheet */
.files-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.files-sheet {
  width: 100%;
  max-height: 78vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.files-sheet-handle {
  width: 36px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  margin: 12px auto 4px;
  flex-shrink: 0;
}

.files-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.files-sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.files-sheet-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
}

.files-sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  -webkit-overflow-scrolling: touch;
}

.files-empty {
  color: #888;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.file-row:last-child { border-bottom: none; }

.file-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-from {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.file-btn {
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.file-btn--preview {
  background: #f0faf9;
  color: #00a19a;
  border: 1px solid #b2e4e1;
}

.file-btn--download {
  background: #00a19a;
  color: white;
  min-width: 32px;
  text-align: center;
}

.file-pending-badge {
  font-size: 11px;
  color: #999;
  background: #f3f3f3;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px 10px;
  font-weight: 500;
  white-space: nowrap;
}

/* Sheet transition */
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.25s ease; }
.sheet-enter-active .files-sheet, .sheet-leave-active .files-sheet {
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .files-sheet, .sheet-leave-to .files-sheet { transform: translateY(100%); }
</style>
