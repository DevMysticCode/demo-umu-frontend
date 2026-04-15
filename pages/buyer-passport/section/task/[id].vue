<template>
  <div class="mobile-container task-page bg-umu-gradient">
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
          <h1 class="task-hero-title">{{ task.title || firstQuestionLabel }}</h1>
          <p class="task-hero-sub">{{ task.description || section?.description || 'Official property record' }}</p>
        </div>

        <!-- Search -->
        <div class="task-search-row">
          <div class="task-search-input">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" class="task-search-icon">
              <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="#999" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search questions..." />
          </div>
          <button class="task-search-btn">Search</button>
        </div>

        <!-- Section-level Help + Video — between search and question list -->
        <div v-if="section?.helpContent || section?.helpVideoUrl" class="task-help-strip">
          <button v-if="section.helpContent" class="task-help-btn task-help-btn--help" @click="openSectionHelp">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 17v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="8" r="1" fill="currentColor"/>
            </svg>
            Help
          </button>
          <button v-if="section.helpVideoUrl" class="task-help-btn task-help-btn--video" @click="openSectionVideo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M10 8l6 4-6 4V8z" fill="currentColor"/>
            </svg>
            Play Video
          </button>
        </div>

        <!-- Question cards — always expanded -->
        <div class="task-items">
          <div
            v-for="q in filteredQuestions"
            :key="q.id"
            class="task-item"
          >
            <!-- Question header: title + status badge -->
            <div class="task-item-header">
              <div class="task-item-left">
                <h3 class="task-item-title">{{ getCardTitle(q) }}</h3>
                <span class="task-item-status" :class="getStatusClass(q)">{{ getStatusLabel(q) }}</span>
              </div>
            </div>

            <!-- Answer area — always visible -->
            <div class="task-item-detail">

              <!-- ── MULTIPART ── -->
              <template v-if="q.type === 'MULTIPART' && Array.isArray(q.parts) && q.parts.length">
                <div v-for="part in answerParts(q)" :key="part.partKey">

                  <!-- Radio part → show only the selected answer label -->
                  <template v-if="isRadioPart(part)">
                    <div v-if="getPartValue(q, part.partKey)" class="detail-answer-pill">
                      {{ getSelectedOptionLabel(part.options, getPartValue(q, part.partKey)) }}
                    </div>
                    <!-- Currency sub-value (fixtures only) -->
                    <div v-if="getCurrencyValue(q, part)" class="detail-currency">
                      <span class="detail-currency-label">Asking price</span>
                      <span class="detail-currency-value">{{ getCurrencyValue(q, part) }}</span>
                    </div>
                  </template>

                  <!-- Text/address part whose value is a { text, files } object — seller's note -->
                  <template v-else-if="(part.type === 'text' || part.type === 'address' || isTextUploadPart(part)) && isObjectWithText(getPartValue(q, part.partKey))">
                    <div v-if="extractPartNote(getPartValue(q, part.partKey))" class="detail-note">
                      <div class="detail-note-bar" />
                      <div class="detail-note-body">
                        <span class="detail-note-label">Seller's note</span>
                        <p class="detail-note-text">{{ extractPartNote(getPartValue(q, part.partKey)) }}</p>
                      </div>
                    </div>
                    <div v-if="extractPartFiles(getPartValue(q, part.partKey)).length" class="detail-files">
                      <div
                        v-for="(file, fi) in extractPartFiles(getPartValue(q, part.partKey))"
                        :key="fi"
                        class="detail-file-row"
                      >
                        <div class="detail-file-icon">
                          <svg v-if="isImage(file.url)" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00a19a" stroke-width="1.5"/>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="#00a19a"/>
                            <path d="M21 15l-5-5L5 21" stroke="#00a19a" stroke-width="1.5" stroke-linecap="round"/>
                          </svg>
                          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#6366f1" stroke-width="1.5"/>
                            <polyline points="14,2 14,8 20,8" stroke="#6366f1" stroke-width="1.5"/>
                          </svg>
                        </div>
                        <span class="detail-file-name">{{ file.name }}</span>
                        <div class="detail-file-actions">
                          <button
                            v-if="file.url"
                            class="detail-file-btn detail-file-btn--download"
                            @click.stop="downloadFile(file.url, file.name)"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                              <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Download
                          </button>
                          <span v-else class="detail-file-pending">Pending upload</span>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Plain text/address part — plain string value -->
                  <template v-else-if="part.type === 'text' || part.type === 'address' || isTextUploadPart(part)">
                    <div v-if="getPartValue(q, part.partKey)" class="detail-text-answer">
                      {{ getPartValue(q, part.partKey) }}
                    </div>
                  </template>

                  <!-- Date part -->
                  <template v-else-if="part.type === 'date'">
                    <div v-if="getPartValue(q, part.partKey)" class="detail-answer-block">
                      <span class="detail-answer-label">{{ part.title || 'Date' }}</span>
                      <span class="detail-answer-value">{{ formatDate(getPartValue(q, part.partKey)) }}</span>
                    </div>
                  </template>

                  <!-- multitextinput part -->
                  <template v-else-if="part.type === 'multitextinput'">
                    <div v-if="part.title" class="detail-part-label">{{ part.title }}</div>
                    <div class="detail-list">
                      <template v-if="Array.isArray(getPartValue(q, part.partKey))">
                        <div v-for="(item, i) in getPartValue(q, part.partKey)" :key="i" class="detail-list-item">{{ item }}</div>
                      </template>
                      <div v-else-if="getPartValue(q, part.partKey)" class="detail-list-item">{{ getPartValue(q, part.partKey) }}</div>
                    </div>
                  </template>

                  <!-- multifieldform part -->
                  <template v-else-if="part.type === 'multifieldform'">
                    <div v-if="part.title" class="detail-part-label">{{ part.title }}</div>
                    <template v-if="getPartValue(q, part.partKey)">
                      <div class="detail-fields">
                        <template v-if="Array.isArray(getPartValue(q, part.partKey))">
                          <div v-for="(entry, ei) in getPartValue(q, part.partKey)" :key="ei" class="detail-field-entry">
                            <div v-for="(val, key) in entry" :key="key" class="detail-field-row">
                              <span class="detail-field-key">{{ fieldLabel(part, key) }}</span>
                              <span class="detail-field-val">{{ val }}</span>
                            </div>
                          </div>
                        </template>
                        <template v-else>
                          <div class="detail-field-entry">
                            <div v-for="(val, key) in getPartValue(q, part.partKey)" :key="key" class="detail-field-row">
                              <span class="detail-field-key">{{ fieldLabel(part, key) }}</span>
                              <span class="detail-field-val">{{ val }}</span>
                            </div>
                          </div>
                        </template>
                      </div>
                    </template>
                  </template>

                </div>

                <!-- No answer at all -->
                <p v-if="!q.answer" class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── RADIO — show only the selected option label ── -->
              <template v-else-if="q.type === 'RADIO'">
                <div v-if="getSimpleAnswer(q)" class="detail-answer-pill">
                  {{ getSelectedOptionLabel(q.options, getSimpleAnswer(q)) }}
                </div>
                <p v-else class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── CHECKBOX — show only the selected item labels as chips ── -->
              <template v-else-if="q.type === 'CHECKBOX'">
                <div v-if="getCheckedLabels(q).length" class="detail-chips">
                  <span v-for="label in getCheckedLabels(q)" :key="label" class="detail-chip">{{ label }}</span>
                </div>
                <p v-else class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── TEXT ── -->
              <template v-else-if="q.type === 'TEXT'">
                <div v-if="getSimpleAnswer(q)" class="detail-text-answer">{{ getSimpleAnswer(q) }}</div>
                <p v-else class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── DATE ── -->
              <template v-else-if="q.type === 'DATE'">
                <div v-if="getSimpleAnswer(q)" class="detail-text-answer">{{ formatDate(getSimpleAnswer(q)) }}</div>
                <p v-else class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── SCALE ── -->
              <template v-else-if="q.type === 'SCALE'">
                <div v-if="getSimpleAnswer(q)" class="detail-scale">
                  <span class="detail-scale-value">{{ getSimpleAnswer(q) }}</span>
                </div>
                <p v-else class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── CHIPS ── -->
              <template v-else-if="q.type === 'CHIPS'">
                <div v-if="getChipAnswers(q).length" class="detail-chips">
                  <span v-for="chip in getChipAnswers(q)" :key="chip" class="detail-chip">{{ chip }}</span>
                </div>
                <p v-else class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── MULTITEXTINPUT ── -->
              <template v-else-if="q.type === 'MULTITEXTINPUT'">
                <div v-if="getListAnswers(q).length" class="detail-list">
                  <div v-for="(item, i) in getListAnswers(q)" :key="i" class="detail-list-item">{{ item }}</div>
                </div>
                <p v-else class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── MULTIFIELDFORM ── -->
              <template v-else-if="q.type === 'MULTIFIELDFORM'">
                <div v-if="getFieldFormAnswers(q).length" class="detail-fields">
                  <div v-for="(entry, ei) in getFieldFormAnswers(q)" :key="ei" class="detail-field-entry">
                    <div v-for="(val, key) in entry" :key="key" class="detail-field-row">
                      <span class="detail-field-key">{{ fieldLabelFromQuestion(q, key) }}</span>
                      <span class="detail-field-val">{{ val }}</span>
                    </div>
                  </div>
                </div>
                <p v-else class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── BOUNDARY ── -->
              <template v-else-if="q.type === 'BOUNDARY'">
                <div v-if="q.answer" class="detail-boundary">
                  <div v-for="(val, side) in getBoundaryAnswers(q)" :key="side" class="detail-field-row">
                    <span class="detail-field-key">{{ side }}</span>
                    <span class="detail-field-val">{{ val }}</span>
                  </div>
                </div>
                <p v-else class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- ── UPLOAD ── -->
              <template v-else-if="q.type === 'UPLOAD'">
                <div v-if="getFiles(q).length" class="detail-files">
                  <div v-for="(file, fi) in getFiles(q)" :key="fi" class="detail-file-row">
                    <div class="detail-file-icon">
                      <svg v-if="isImage(file.url)" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00a19a" stroke-width="1.5"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="#00a19a"/>
                        <path d="M21 15l-5-5L5 21" stroke="#00a19a" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                      <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#6366f1" stroke-width="1.5"/>
                        <polyline points="14,2 14,8 20,8" stroke="#6366f1" stroke-width="1.5"/>
                      </svg>
                    </div>
                    <span class="detail-file-name">{{ file.name }}</span>
                    <div class="detail-file-actions">
                      <button
                        v-if="file.url"
                        class="detail-file-btn detail-file-btn--download"
                        @click.stop="downloadFile(file.url, file.name)"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                          <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        Download
                      </button>
                      <span v-else class="detail-file-pending">Pending upload</span>
                    </div>
                  </div>
                </div>
                <p v-else class="detail-no-answer">No document uploaded by seller</p>
              </template>

              <!-- ── Fallback ── -->
              <template v-else>
                <div v-if="getSimpleAnswer(q)" class="detail-text-answer">{{ getSimpleAnswer(q) }}</div>
                <p v-else-if="!q.answer" class="detail-no-answer">Not yet answered by seller</p>
              </template>

              <!-- Seller's note (non-MULTIPART) -->
              <div v-if="q.type !== 'MULTIPART' && getNote(q)" class="detail-note">
                <div class="detail-note-bar" />
                <div class="detail-note-body">
                  <span class="detail-note-label">Seller's note</span>
                  <p class="detail-note-text">{{ getNote(q) }}</p>
                </div>
              </div>

              <!-- File attachments (non-MULTIPART) -->
              <div v-if="q.type !== 'MULTIPART' && getFiles(q).length" class="detail-files">
                <div v-for="(file, fi) in getFiles(q)" :key="fi" class="detail-file-row">
                  <div class="detail-file-icon">
                    <svg v-if="isImage(file.url)" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00a19a" stroke-width="1.5"/>
                      <circle cx="8.5" cy="8.5" r="1.5" fill="#00a19a"/>
                      <path d="M21 15l-5-5L5 21" stroke="#00a19a" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#6366f1" stroke-width="1.5"/>
                      <polyline points="14,2 14,8 20,8" stroke="#6366f1" stroke-width="1.5"/>
                    </svg>
                  </div>
                  <span class="detail-file-name">{{ file.name }}</span>
                  <div class="detail-file-actions">
                    <button class="detail-file-btn detail-file-btn--download" @click.stop="downloadFile(file.url, file.name)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div v-if="filteredQuestions.length === 0" class="task-empty">
            <p>No questions found.</p>
          </div>
        </div>
      </div>
    </template>

    <HelpDrawer :show="showHelp" :content="activeHelpContent" mode="buyer" @close="showHelp = false" />
    <VideoModal :show="showVideo" :videoUrl="activeVideoUrl" @close="showVideo = false" />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/core/AppHeader.vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import HelpDrawer from '@/components/passport-view/HelpDrawer.vue'
import VideoModal from '@/components/passport-view/VideoModal.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const config = useRuntimeConfig()

const taskId = route.params.id as string
const passportId = route.query.passportId as string
const sectionId = route.query.sectionId as string

const allData = ref<any>(null)
const loading = ref(true)
const searchQuery = ref('')
const showHelp = ref(false)
const showVideo = ref(false)
const activeHelpContent = ref<any>(null)
const activeVideoUrl = ref<string | null>(null)

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

const isFixturesSection = computed(() => section.value?.key === 'fixturesAndFittings')

// NOTE questions are seller-internal — hide from buyer entirely
const visibleQuestions = computed(() =>
  (task.value?.questions ?? []).filter((q: any) => q.type !== 'NOTE')
)

const firstQuestionLabel = computed(() => {
  const q = visibleQuestions.value[0]
  if (!q) return ''
  if (q.question) return q.question
  if (Array.isArray(q.parts) && q.parts[0]?.title) return q.parts[0].title
  return ''
})

const backUrl = computed(() =>
  `/buyer-passport/section/${sectionId}?passportId=${passportId}`
)

const filteredQuestions = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return visibleQuestions.value
  return visibleQuestions.value.filter((item: any) =>
    getCardTitle(item).toLowerCase().includes(q) ||
    (item.description || '').toLowerCase().includes(q)
  )
})

// ─── Card helpers ─────────────────────────────────────────────────────────

function getCardTitle(q: any): string {
  if (q.question) return q.question
  if (Array.isArray(q.parts) && q.parts[0]?.title) return q.parts[0].title
  return 'Question'
}

// ─── MULTIPART helpers ────────────────────────────────────────────────────

// Returns only parts that have something to show — skips currency/date sibling parts
// (they are rendered as sub-values of their radio parent via getCurrencyValue)
function answerParts(q: any): any[] {
  if (!Array.isArray(q.parts)) return []
  return q.parts.filter((p: any) => {
    // Skip pure currency/date companion parts — shown inline with the radio part
    if (Array.isArray(p.options) && p.options.every((o: any) => o.inputType === 'currency')) return false
    if (p.type === 'date' && p.partKey?.includes('selling')) return false
    return true
  })
}

function isRadioPart(part: any): boolean {
  const t = (part.type || '').toLowerCase()
  return t === 'radio'
}

function isTextUploadPart(part: any): boolean {
  const t = (part.type || '').toLowerCase()
  return t === 'text-upload' || t === 'textupload' || t === 'upload'
}

// Parse a value that might be a JSON-encoded string into an object
function tryParseJson(val: any): any {
  if (typeof val !== 'string') return val
  const t = val.trim()
  if (t.startsWith('{') || t.startsWith('[')) {
    try { return JSON.parse(t) } catch {}
  }
  return val
}

// Detect if a part value is (or parses to) a { text, files } object
function isObjectWithText(val: any): boolean {
  const v = tryParseJson(val)
  if (v === null || v === undefined || Array.isArray(v)) return false
  if (typeof v === 'object') return 'text' in v || 'files' in v || 'uploadedFiles' in v
  return false
}

// Extract text from a part value: handles plain string, { text, files }, or JSON-encoded strings
function extractPartNote(val: any): string | null {
  const v = tryParseJson(val)
  if (!v) return null
  if (typeof v === 'string') return v.trim() || null
  if (typeof v === 'object') {
    if (typeof v.text === 'string' && v.text.trim()) return v.text.trim()
    for (const entry of Object.values(v)) {
      if (typeof entry === 'string' && entry.trim() && !entry.startsWith('http')) return entry.trim()
    }
  }
  return null
}

// Normalise a raw file entry to { url, name }.
// Handles: URL string | { name, size, type } metadata object | { url, name } object
function normaliseFileEntry(f: any): { url: string; name: string } | null {
  if (!f) return null
  if (typeof f === 'string' && f.trim()) return { url: f, name: extractFilename(f) }
  if (typeof f === 'object') {
    const url = f.url || f.fileUrl || ''
    const name = f.name || f.filename || (url ? extractFilename(url) : 'document')
    if (name) return { url, name }
  }
  return null
}

// Extract files from a part value: handles { files, uploadedFiles } or JSON-encoded string
function extractPartFiles(val: any): Array<{ url: string; name: string }> {
  const v = tryParseJson(val)
  if (!v) return []
  // val itself might be an array of files
  if (Array.isArray(v)) return v.map(normaliseFileEntry).filter(Boolean) as Array<{ url: string; name: string }>
  if (typeof v !== 'object') return []
  const candidates = v.files ?? v.uploadedFiles ?? []
  if (Array.isArray(candidates)) return candidates.map(normaliseFileEntry).filter(Boolean) as Array<{ url: string; name: string }>
  return []
}

// Return the option label for the stored value (buyer sees the label, not raw value like 'yes')
function getSelectedOptionLabel(options: any[], value: string): string {
  if (!value) return ''
  if (!Array.isArray(options) || !options.length) return value
  const opt = options.find((o: any) => o.value === value || o.label === value)
  return opt?.label ?? value
}

// Return only the checked option labels for CHECKBOX questions
function getCheckedLabels(q: any): string[] {
  if (!q.answer) return []
  const json = q.answer.answerJson
  let values: string[] = []
  if (Array.isArray(json)) values = json
  else if (json && typeof json === 'object') {
    const a = (json as any).answers || (json as any).mainAnswer || []
    if (Array.isArray(a)) values = a
  }
  if (!Array.isArray(q.options) || !q.options.length) return values
  return values.map((v: string) => {
    const opt = q.options.find((o: any) => o.value === v || o.label === v)
    return opt?.label ?? v
  })
}

// ─── Status badge ─────────────────────────────────────────────────────────

function getStatusLabel(q: any): string {
  if (!q.answer) return 'Not answered'
  const s = extractPrimaryStatus(q)
  if (!s) return 'Answered'
  const l = s.toLowerCase()
  // Fixtures-specific status labels — meaningful as a badge
  if (l === 'included' || l.includes('includ')) return 'Included'
  if (l === 'excluded' || l.includes('exclud') || l.includes('taken')) return 'Excluded'
  if (l === 'offered' || l.includes('offer') || l.includes('extra')) return 'Offered'
  // For all other answers (Yes/No/text) — don't show raw answer in badge
  // since the answer is already visible in the detail area below
  return 'Answered'
}

function getStatusClass(q: any): string {
  if (!q.answer) return 'status--unanswered'
  const label = getStatusLabel(q).toLowerCase()
  if (label === 'included') return 'status--included'
  if (label === 'excluded') return 'status--excluded'
  if (label === 'offered') return 'status--offered'
  return 'status--answered'
}

// ─── Answer extraction ────────────────────────────────────────────────────

function extractPrimaryStatus(q: any): string | null {
  if (!q.answer) return null
  const { answerText, answerJson } = q.answer
  if (answerText) return answerText
  if (!answerJson) return null
  if (typeof answerJson === 'string') return answerJson
  if (typeof answerJson === 'object') {
    const main = (answerJson as any).mainAnswer
    if (typeof main === 'string') return main
    if (main && typeof main === 'object') {
      for (const v of Object.values(main)) if (typeof v === 'string') return v as string
    }
    const radio = (answerJson as any).radioAnswer
    if (typeof radio === 'string') return radio
    for (const v of Object.values(answerJson as object)) {
      if (typeof v === 'string' && v.trim() &&
          !['yes','no','included','excluded','offered','none'].every(k => (v as string).toLowerCase() !== k)
      ) return v
      if (typeof v === 'string' && v.trim()) return v
    }
  }
  return null
}

function getSimpleAnswer(q: any): string | null {
  if (!q.answer) return null
  const { answerText, answerJson } = q.answer
  if (answerText) return answerText
  if (!answerJson) return null
  if (typeof answerJson === 'string') return answerJson
  if (typeof answerJson === 'object') {
    const main = (answerJson as any).mainAnswer
    if (typeof main === 'string') return main
    const radio = (answerJson as any).radioAnswer
    if (typeof radio === 'string') return radio
    for (const v of Object.values(answerJson as object)) {
      if (typeof v === 'string' && v.trim()) return v
    }
  }
  return null
}

function getPartValue(q: any, partKey: string): any {
  if (!q.answer?.answerJson || typeof q.answer.answerJson !== 'object') return null
  const json = q.answer.answerJson as Record<string, any>
  if (partKey in json) return json[partKey]
  const main = json.mainAnswer
  if (main && typeof main === 'object' && partKey in main) return main[partKey]
  return null
}

// Currency for fixtures: find sibling part with inputType currency
function getCurrencyValue(q: any, radioPart: any): string | null {
  if (!isFixturesSection.value) return null
  if (!q.answer?.answerJson || typeof q.answer.answerJson !== 'object') return null
  if (!Array.isArray(q.parts)) return null
  for (const p of q.parts) {
    if (p.partKey === radioPart.partKey) continue
    if (Array.isArray(p.options)) {
      for (const opt of p.options) {
        if (opt.inputType === 'currency') {
          const val = getPartValue(q, p.partKey)
          if (val != null && val !== '') return `£${Number(val).toLocaleString('en-GB')}`
        }
      }
    }
  }
  return null
}

function isChecked(q: any, value: string): boolean {
  if (!q.answer?.answerJson) return false
  const json = q.answer.answerJson
  if (Array.isArray(json)) return json.includes(value)
  if (typeof json === 'object') {
    const a = (json as any).answers || (json as any).mainAnswer || json
    if (Array.isArray(a)) return a.includes(value)
  }
  return false
}

function getChipAnswers(q: any): string[] {
  if (!q.answer?.answerJson) return []
  const json = q.answer.answerJson
  if (Array.isArray(json)) return json
  if (typeof json === 'object') {
    const a = (json as any).answers || (json as any).mainAnswer
    if (Array.isArray(a)) return a
  }
  return []
}

function getListAnswers(q: any): string[] {
  if (!q.answer) return []
  const { answerJson, answerText } = q.answer
  if (Array.isArray(answerJson)) return answerJson
  if (answerText) return [answerText]
  if (answerJson && typeof answerJson === 'object') {
    const items = (answerJson as any).items || (answerJson as any).mainAnswer
    if (Array.isArray(items)) return items
  }
  return []
}

function getFieldFormAnswers(q: any): Record<string, any>[] {
  if (!q.answer?.answerJson) return []
  const json = q.answer.answerJson
  if (Array.isArray(json)) return json
  if (typeof json === 'object') {
    const items = (json as any).items
    if (Array.isArray(items)) return items
    return [json as Record<string, any>]
  }
  return []
}

function getBoundaryAnswers(q: any): Record<string, string> {
  if (!q.answer?.answerJson || typeof q.answer.answerJson !== 'object') return {}
  return q.answer.answerJson as Record<string, string>
}

// Note from top-level additionalInfo (used for non-MULTIPART questions)
function getNote(q: any): string | null {
  if (!q.answer?.answerJson || typeof q.answer.answerJson !== 'object') return null
  const json = q.answer.answerJson as any
  const ai = json.additionalInfo
  if (!ai) return null
  if (typeof ai === 'string' && ai.trim()) return ai.trim()
  if (typeof ai === 'object') {
    if (typeof ai.text === 'string' && ai.text.trim()) return ai.text.trim()
    const vals = Object.values(ai).filter((v): v is string => typeof v === 'string' && !!v.trim())
    if (vals.length) return vals[0]
  }
  return null
}

// Files: direct fileUrl + all JSON formats (array, uploadedFiles, additionalInfo.files)
function getFiles(q: any): Array<{ url: string; name: string }> {
  if (!q.answer) return []
  const files: Array<{ url: string; name: string }> = []

  // 1. Dedicated fileUrl column
  if (q.answer.fileUrl) files.push({ url: q.answer.fileUrl, name: extractFilename(q.answer.fileUrl) })

  const json = q.answer.answerJson
  if (json && typeof json === 'object') {
    // 2. answerJson is itself a file array: [{name, size, type}] or ["url1", ...]
    if (Array.isArray(json)) {
      for (const f of json) {
        const n = normaliseFileEntry(f)
        if (n) files.push(n)
      }
    } else {
      // 3. { uploadedFiles: [...] }
      const uploaded = (json as any).uploadedFiles
      if (Array.isArray(uploaded)) {
        for (const f of uploaded) {
          const n = normaliseFileEntry(f)
          if (n) files.push(n)
        }
      }
      // 4. { additionalInfo: { files: [...] } }
      const ai = (json as any).additionalInfo
      if (ai && typeof ai === 'object' && Array.isArray(ai.files)) {
        for (const f of ai.files) {
          const n = normaliseFileEntry(f)
          if (n) files.push(n)
        }
      }
    }
  }
  return files
}

// ─── Field label helpers ──────────────────────────────────────────────────

function fieldLabel(part: any, key: string): string {
  if (!Array.isArray(part.fields)) return key
  const f = part.fields.find((f: any) => f.key === key)
  return f?.label || f?.placeholder || key
}

function fieldLabelFromQuestion(q: any, key: string): string {
  if (!Array.isArray(q.fields)) return key
  const f = q.fields.find((f: any) => f.key === key)
  return f?.label || f?.placeholder || key
}

function formatDate(val: any): string {
  if (!val) return ''
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return String(val) }
}

// ─── Help / Video ─────────────────────────────────────────────────────────

function openHelp(q: any) {
  activeHelpContent.value = q.helpContent ?? null
  showHelp.value = true
}
function openVideo(q: any) {
  activeVideoUrl.value = q.helpVideoUrl ?? null
  showVideo.value = true
}
function openSectionHelp() {
  activeHelpContent.value = section.value?.helpContent ?? null
  showHelp.value = true
}
function openSectionVideo() {
  activeVideoUrl.value = section.value?.helpVideoUrl ?? null
  showVideo.value = true
}

// ─── File helpers ─────────────────────────────────────────────────────────

function extractFilename(url: string): string {
  try {
    const parts = url.split('/')
    const last = parts[parts.length - 1]
    return decodeURIComponent(last.split('?')[0]) || 'document'
  } catch { return 'document' }
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
</script>

<style scoped>
.task-page { min-height: 100vh; padding-bottom: 40px; }

.task-loading { display: flex; justify-content: center; align-items: center; min-height: 60vh; }

.task-spinner {
  width: 36px; height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.task-content { padding: 0 20px 40px; }

/* Hero */
.task-hero { text-align: center; padding: 20px 0 20px; }
.task-hero-icon { display: flex; justify-content: center; margin-bottom: 16px; }
.task-hero-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; line-height: 1.2; }
.task-hero-sub { font-size: 13px; color: #3c3c4399; margin: 0 auto; line-height: 1.5; max-width: 280px; }

/* Search */
.task-search-row {
  display: flex; gap: 8px; margin-bottom: 16px; align-items: center;
  background: white; border-radius: 24px; border: 1px solid #e0e0e0;
  padding: 2px 2px 2px 14px;
}
.task-search-input { flex: 1; display: flex; align-items: center; gap: 8px; }
.task-search-input input {
  flex: 1; border: none; outline: none; font-size: 14px;
  color: #333; background: transparent; padding: 8px 0;
}
.task-search-input input::placeholder { color: #999; }
.task-search-icon { flex-shrink: 0; }
.task-search-btn {
  background: #00a19a; color: white; border: none;
  border-radius: 20px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer;
}

/* Card list */
.task-items {
  display: flex; flex-direction: column;
  background: white; border-radius: 16px;
  overflow: hidden; border: 1px solid #f0f0f0;
}

.task-item { border-bottom: 1px solid #f0f0f0; }
.task-item:last-child { border-bottom: none; }
.task-item--expanded { background: #fafffe; }

/* Question header */
.task-item-header {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px 16px 10px;
}

.task-item-left { flex: 1; min-width: 0; }

.task-item-title {
  font-size: 15px; font-weight: 500; color: #1a1a1a;
  margin: 0 0 5px; line-height: 1.4;
}

/* Status badge — now below title */
.task-item-status {
  display: inline-block;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.4px;
  padding: 2px 8px; border-radius: 20px;
}

.status--included { background: #e6f9f7; color: #00a19a; }
.status--excluded { background: #fef2f2; color: #e53e3e; }
.status--offered  { background: #fff7ed; color: #c2780a; }
.status--neutral  { background: #f3f4f6; color: #6b7280; }
.status--answered { background: #eef2ff; color: #4f46e5; }
.status--unanswered { background: #f9fafb; color: #d1d5db; }

/* Section help/video strip — between search and question list */
.task-help-strip {
  display: flex; gap: 8px; margin-bottom: 14px;
}
.task-help-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;
  border: none; cursor: pointer;
}
.task-help-btn--help { background: white; color: #00a19a; border: 1.5px solid #b2e4e1; }
.task-help-btn--video { background: white; color: #7c3aed; border: 1.5px solid #d4b8f8; }

/* Answer area — always visible, no expand */
.task-item-detail { padding: 0 16px 16px; }

/* Selected answer pill (radio / multipart radio) */
.detail-answer-pill {
  display: inline-block;
  font-size: 14px; font-weight: 600; color: #1a1a1a;
  background: #f0faf9; border: 1.5px solid #b2e4e1; border-radius: 20px;
  padding: 6px 16px; margin-top: 2px;
}

/* Currency (fixtures) */
.detail-currency {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 8px; padding: 8px 12px;
  background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a;
}
.detail-currency-label { font-size: 12px; color: #92400e; }
.detail-currency-value { font-size: 15px; font-weight: 700; color: #92400e; }

/* Answer block (label + value inline) */
.detail-answer-block {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; background: #f9fafb; border-radius: 8px; margin-top: 4px;
}
.detail-answer-label { font-size: 12px; color: #9ca3af; }
.detail-answer-value { font-size: 14px; font-weight: 500; color: #1a1a1a; }

/* Text answer */
.detail-text-answer {
  font-size: 14px; color: #1a1a1a;
  background: #f9fafb; border-radius: 8px;
  padding: 10px 12px; line-height: 1.5; white-space: pre-line; margin-top: 4px;
}

.detail-part-label {
  font-size: 12px; font-weight: 600; color: #6b7280;
  margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.4px;
}

/* No answer */
.detail-no-answer { font-size: 13px; color: #d1d5db; font-style: italic; margin: 6px 0; }

/* Scale */
.detail-scale { display: inline-flex; padding: 8px 16px; background: #f0faf9; border-radius: 20px; border: 1px solid #b2e4e1; }
.detail-scale-value { font-size: 18px; font-weight: 700; color: #00a19a; }

/* Chips */
.detail-chips { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 4px; }
.detail-chip { font-size: 13px; font-weight: 500; padding: 4px 12px; border-radius: 20px; background: #f0faf9; color: #00a19a; border: 1px solid #b2e4e1; }

/* List */
.detail-list { display: flex; flex-direction: column; gap: 4px; }
.detail-list-item { font-size: 14px; color: #1a1a1a; padding: 6px 10px; background: #f9fafb; border-radius: 6px; border-left: 3px solid #00a19a; }

/* Field form */
.detail-fields { display: flex; flex-direction: column; gap: 8px; }
.detail-field-entry { background: #f9fafb; border-radius: 8px; padding: 10px 12px; }
.detail-field-row { display: flex; gap: 8px; padding: 3px 0; font-size: 13px; }
.detail-field-key { color: #9ca3af; min-width: 90px; flex-shrink: 0; }
.detail-field-val { color: #1a1a1a; font-weight: 500; flex: 1; }

/* Boundary */
.detail-boundary { background: #f9fafb; border-radius: 8px; padding: 10px 12px; }

/* Seller's note callout */
.detail-note {
  display: flex; gap: 10px; margin-top: 12px;
  background: #e8faf9; border-radius: 10px;
  padding: 12px 14px; align-items: flex-start;
}
.detail-note-bar { width: 3px; min-height: 20px; background: #00a19a; border-radius: 2px; flex-shrink: 0; align-self: stretch; }
.detail-note-body { flex: 1; }
.detail-note-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #00a19a; display: block; margin-bottom: 3px; }
.detail-note-text { font-size: 13px; color: #1a6b66; margin: 0; line-height: 1.5; }

/* File attachments */
.detail-files { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.detail-file-row { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #f5f5f5; border-radius: 10px; }
.detail-file-icon { flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
.detail-file-name { flex: 1; font-size: 13px; color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.detail-file-actions { flex-shrink: 0; }
.detail-file-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
  border: none; cursor: pointer;
}
.detail-file-btn--download { background: #00a19a; color: white; }
.detail-file-pending { font-size: 11px; color: #9ca3af; font-style: italic; padding: 5px 8px; }

/* Empty */
.task-empty { padding: 40px; text-align: center; color: #999; font-size: 14px; }
</style>
