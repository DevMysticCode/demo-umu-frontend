<template>
  <div class="dc-page mobile-container">
    <!-- Nav bar -->
    <div class="dc-nav-bar">
      <button class="dc-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="dc-nav-title">Your Documents</div>
      <!-- Spacer matches the back button's footprint so the title stays
           visually centered. Old folder icon was a dead button (no handler);
           filtering already happens via the category tiles below. -->
      <div class="dc-nav-icon-btn" aria-hidden="true" />
    </div>

    <main class="dc-body">
      <div class="atm-bg warm" />

      <!-- Hero -->
      <div class="dc-hero">
        <div class="hero-greeting">Everything you've stored</div>
        <div class="dc-h1">
          Documents<span class="dc-h1-count">{{ totalDocs }}</span>
        </div>
        <div class="hero-stats">
          <span><span class="stat-num">{{ totalDocs }}</span>total</span>
          <span class="stat-sep" />
          <span><span class="stat-num teal">{{ verifiedDocs }}</span>verified</span>
          <span class="stat-sep" />
          <span><span class="stat-num coral">{{ expiringDocs }}</span>expiring soon</span>
        </div>
      </div>

      <!-- Search -->
      <div class="dc-search">
        <span class="dc-search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          class="dc-search-input"
          placeholder="Search documents…"
        />
      </div>

      <!-- Categories grid -->
      <div class="dc-cats">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="dc-cat"
          :class="cat.tone"
          @click="activeCategory = activeCategory === cat.key ? '' : cat.key"
        >
          <div class="dc-cat-icon">
            <img
              v-if="cat.iconImage"
              :src="cat.iconImage"
              :alt="cat.name"
              class="dc-cat-icon-img"
              loading="lazy"
            />
            <span v-else v-html="cat.icon" />
          </div>
          <div class="dc-cat-name">{{ cat.name }}</div>
          <div class="dc-cat-count">
            {{ cat.count }} {{ cat.count === 1 ? 'document' : 'documents' }}
          </div>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="dc-loading">Loading…</div>

      <template v-else>
        <!-- Section heading: Recently uploaded -->
        <div class="dc-section-heading">
          Recently uploaded
          <span
            v-if="filteredAllDocs.length > 5"
            class="dc-sh-action"
            @click="showAllDocs = !showAllDocs"
          >
            {{ showAllDocs ? 'Show less' : 'See all' }}
          </span>
        </div>

        <div v-if="filteredAllDocs.length === 0" class="dc-empty">
          No documents yet
        </div>

        <div
          v-for="doc in (showAllDocs ? filteredAllDocs : filteredAllDocs.slice(0, 5))"
          :key="doc.id"
          class="dc-doc"
        >
          <div class="dc-doc-icon" :class="docIconClass(doc)">
            {{ docIconLabel(doc) }}
          </div>
          <div class="dc-doc-info">
            <div class="dc-doc-row-top">
              <div class="dc-doc-name">{{ doc.title }}</div>
              <span
                class="dc-vis-pill"
                :class="doc.visibility === 'PUBLIC' ? 'is-public' : 'is-private'"
                :title="doc.visibility === 'PUBLIC'
                  ? 'Visible to buyers who have unlocked this passport'
                  : 'Only you can see this document'"
              >
                <template v-if="doc.visibility === 'PUBLIC'">🌍 Public</template>
                <template v-else>🔒 Only you</template>
              </span>
            </div>
            <div class="dc-doc-meta">
              {{ docMeta(doc) }}
            </div>
          </div>
          <div class="dc-doc-action">›</div>
        </div>
      </template>
    </main>

    <!-- Floating upload button -->
    <button class="fab" aria-label="Upload document" @click="openUploadModal">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    </button>

    <!-- Upload Document Modal -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
        <div class="modal">
          <div class="modal-handle" />
          <div class="modal-header">
            <div class="modal-title">Upload document</div>
            <button class="modal-close" type="button" aria-label="Close" @click="closeUploadModal">×</button>
          </div>

          <div class="modal-body">
            <!-- Drop zone -->
            <label v-if="!selectedFile" class="up-drop">
              <div class="up-drop-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div class="up-drop-title">Drop your file here</div>
              <div class="up-drop-sub">or tap to browse · PDF, JPG, DOCX up to 25MB</div>
              <div class="up-drop-actions">
                <span class="btn-secondary">📷 Camera</span>
                <span class="btn-secondary"><img src="/op-icons/misc/folder.png" alt="" class="inline-ic" loading="lazy" /> Files</span>
              </div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                class="sr-only"
                @change="onFilePicked"
              />
            </label>

            <!-- File preview -->
            <div v-else class="up-file">
              <div class="up-file-thumb">
                <img v-if="selectedFilePreview && isImageFile" :src="selectedFilePreview" alt="Preview" />
                <template v-else>
                  <div class="up-file-thumb-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div class="up-file-ext">{{ fileExtension.toUpperCase() }}</div>
                </template>
              </div>
              <div class="up-file-info">
                <div class="up-file-name">{{ docName || selectedFile.name }}</div>
                <div class="up-file-meta">{{ fileSizeLabel }} · {{ fileExtension.toUpperCase() }}</div>
              </div>
              <button class="up-file-clear" type="button" aria-label="Choose different file" @click="clearSelectedFile">×</button>
            </div>

            <!-- Category -->
            <div class="mform-section">
              <div class="mform-label">Category</div>
              <div class="mform-radio-group">
                <button
                  v-for="cat in catOptions"
                  :key="cat.key"
                  type="button"
                  class="mform-radio"
                  :class="[cat.tone, { active: chosenCategory === cat.key }]"
                  @click="chosenCategory = cat.key"
                >
                  <div class="mfr-icon"><img :src="cat.icon" alt="" loading="lazy" /></div>
                  {{ cat.name }}
                </button>
              </div>
            </div>

            <!-- Document name -->
            <div class="mform-section">
              <div class="mform-label">Document name</div>
              <input
                v-model="docName"
                class="mform-input"
                type="text"
                placeholder="e.g. EPC Certificate"
              />
            </div>

            <!-- Tags -->
            <div class="mform-section">
              <div class="mform-label">Tags (optional)</div>
              <input
                v-model="docTagsInput"
                class="mform-input"
                type="text"
                placeholder="Comma separated, e.g. epc, energy"
              />
              <div v-if="parsedTags.length" class="up-tag-row">
                <span v-for="tag in parsedTags" :key="tag" class="up-tag">#{{ tag }}</span>
              </div>
            </div>

            <!-- Expiry -->
            <div class="mform-section">
              <div class="mform-label">Expires (optional)</div>
              <input
                type="date"
                class="mform-input"
                :min="minDate"
                :value="docExpiresAt"
                @change="onExpiryChange"
              />
            </div>

            <p v-if="uploadError" class="up-error">{{ uploadError }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" type="button" @click="closeUploadModal">Cancel</button>
            <button
              class="btn-primary"
              type="button"
              :disabled="!selectedFile || uploading"
              @click="submitDocument"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {{ uploading ? 'Uploading…' : 'Upload' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import BaseDrawer from '@/components/ui/BaseDrawer.vue'

definePageMeta({ title: 'Your Documents - UmovingU', middleware: 'auth' })

const { documents, loading, fetchDocuments, uploadDocument, deleteDocument } = useDocuments()

onMounted(fetchDocuments)

// ── Computed lists ──────────────────────────────────────────────────────────

const searchQuery = ref('')

const recentUploads = computed(() => documents.value?.recentUploads ?? [])

const filteredPassportDocs = computed(() => {
  const docs = documents.value?.passportDocuments ?? []
  if (!searchQuery.value.trim()) return docs
  const q = searchQuery.value.toLowerCase()
  return docs.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q)) ||
      d.passportAddress?.toLowerCase().includes(q),
  )
})

const filteredUserDocs = computed(() => {
  const docs = documents.value?.userDocuments ?? []
  if (!searchQuery.value.trim()) return docs
  const q = searchQuery.value.toLowerCase()
  return docs.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q)),
  )
})

const showAllPassport = ref(false)
const showAllUser = ref(false)
const showAllDocs = ref(false)
const activeCategory = ref('')

// ── Combined doc list ──────────────────────────────────────────
const allDocs = computed(() => {
  const passport = (documents.value?.passportDocuments ?? []).map((d) => ({
    ...d,
    source: 'passport',
  }))
  const user = (documents.value?.userDocuments ?? []).map((d) => ({
    ...d,
    source: 'user',
  }))
  return [...passport, ...user].sort((a, b) => {
    const ax = +new Date(a.createdAt ?? a.uploadedAt ?? 0)
    const bx = +new Date(b.createdAt ?? b.uploadedAt ?? 0)
    return bx - ax
  })
})
const totalDocs = computed(() => allDocs.value.length)
const verifiedDocs = computed(
  () => allDocs.value.filter((d) => d.source === 'passport').length,
)
const expiringDocs = computed(() => {
  const now = Date.now()
  const SOON = 30 * 24 * 60 * 60 * 1000
  return allDocs.value.filter((d) => {
    if (!d.expiresAt) return false
    const ts = new Date(d.expiresAt).getTime()
    return ts > now && ts - now < SOON
  }).length
})

// ── Categorisation (flat: Title / Energy / Legal / Surveys / Financial / Other) ──
function docCategory(doc) {
  const haystack = `${doc.title || ''} ${(doc.tags || []).join(' ')} ${doc.passportSectionKey || ''}`.toLowerCase()
  if (/title|deed|land registry|conveyance/.test(haystack)) return 'title'
  if (/epc|energy|gas|boiler|electric|heating/.test(haystack)) return 'energy'
  if (/solicitor|legal|contract|covenant|search|aml|kyc/.test(haystack)) return 'legal'
  if (/survey|valuation|inspection|home report/.test(haystack)) return 'surveys'
  if (/aip|mortgage|bank|statement|payslip|invoice|funds|payment/.test(haystack)) return 'financial'
  return 'other'
}

const categories = computed(() => {
  const counts = { title: 0, energy: 0, legal: 0, surveys: 0, financial: 0, other: 0 }
  for (const d of allDocs.value) counts[docCategory(d)]++
  return [
    { key: 'title', name: 'Title', tone: 'identity', count: counts.title, icon: '🪪', iconImage: '/op-icons/yourDocuments/title.jpeg' },
    { key: 'energy', name: 'Energy', tone: 'property', count: counts.energy, icon: '⚡', iconImage: '/op-icons/yourDocuments/energy.jpeg' },
    { key: 'legal', name: 'Legal', tone: 'identity', count: counts.legal, icon: '⚖️', iconImage: '/op-icons/yourDocuments/legal.jpeg' },
    { key: 'surveys', name: 'Surveys', tone: 'property', count: counts.surveys, icon: '🏠', iconImage: '/op-icons/yourDocuments/surveys.jpeg' },
    { key: 'financial', name: 'Financial', tone: 'financial', count: counts.financial, icon: '£', iconImage: '/op-icons/yourDocuments/financial.jpeg' },
    { key: 'other', name: 'Other', tone: 'other', count: counts.other, icon: '📁', iconImage: '/op-icons/yourDocuments/other.jpeg' },
  ]
})

const filteredAllDocs = computed(() => {
  let list = allDocs.value
  if (activeCategory.value) list = list.filter((d) => docCategory(d) === activeCategory.value)
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(
    (d) =>
      d.title?.toLowerCase().includes(q) ||
      (d.tags || []).some((t) => t.toLowerCase().includes(q)),
  )
})

function docIconClass(doc) {
  const m = (doc.mimeType || '').toLowerCase()
  if (m.includes('pdf')) return 'pdf'
  if (m.includes('image')) return 'img'
  return ''
}
function docIconLabel(doc) {
  return mimeLabel(doc.mimeType) || 'DOC'
}
function docMeta(doc) {
  const parts = []
  const cat = categories.value.find((c) => c.key === docCategory(doc))
  if (cat) parts.push(cat.name)
  if (doc.uploadedAt) parts.push(doc.uploadedAt)
  else if (doc.createdAt) parts.push(formatDate(doc.createdAt))
  if (doc.expiresAt) parts.push(`expires ${formatDate(doc.expiresAt)}`)
  return parts.join(' · ')
}

// ── Helpers ────────────────────────────────────────────────────────────────

function mimeLabel(mime) {
  if (!mime) return ''
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('word') || mime.includes('docx')) return 'DOC'
  if (mime.includes('image')) return 'IMG'
  return mime.split('/')[1]?.toUpperCase() ?? ''
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Delete ─────────────────────────────────────────────────────────────────

const handleDelete = async (id) => {
  try {
    await deleteDocument(id)
  } catch {}
}

// ── Upload flow ─────────────────────────────────────────────────────────────

const showUploadModal = ref(false)
const selectedFile = ref(null)
const selectedFilePreview = ref('')
const docName = ref('')
const docExpiresAt = ref('')
const docTagsInput = ref('')
const uploading = ref(false)
const uploadError = ref('')
const chosenCategory = ref('property')

const catOptions = [
  { key: 'identity', name: 'Identity', tone: 'identity', icon: '/op-icons/buyer-profile-build/idCard.png' },
  { key: 'property', name: 'Property', tone: 'property', icon: '/op-icons/homescore/house.png' },
  { key: 'financial', name: 'Financial', tone: 'financial', icon: '/op-icons/investment/moneyBagPound.png' },
  { key: 'other', name: 'Other', tone: 'other', icon: '/op-icons/misc/folder.png' },
]

const openUploadModal = () => {
  selectedFile.value = null
  selectedFilePreview.value = ''
  docName.value = ''
  docExpiresAt.value = ''
  docTagsInput.value = ''
  uploadError.value = ''
  chosenCategory.value = 'property'
  showUploadModal.value = true
}

const closeUploadModal = () => {
  if (uploading.value) return
  showUploadModal.value = false
}

const clearSelectedFile = () => {
  selectedFile.value = null
  selectedFilePreview.value = ''
}

const minDate = computed(() => new Date().toISOString().split('T')[0])

const isImageFile = computed(() =>
  selectedFile.value?.type?.startsWith('image/'),
)

const fileExtension = computed(() => {
  if (!selectedFile.value) return ''
  const name = selectedFile.value.name
  return name.split('.').pop()?.toLowerCase() ?? ''
})

const fileSizeLabel = computed(() => {
  const size = selectedFile.value?.size
  if (!size) return ''
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)}MB`
  if (size >= 1024) return `${(size / 1024).toFixed(0)}KB`
  return `${size}B`
})

const docExpiryLabel = computed(() => {
  if (!docExpiresAt.value) return 'Pick date'
  const d = new Date(docExpiresAt.value)
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
})

const parsedTags = computed(() =>
  docTagsInput.value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),
)

const onFilePicked = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  selectedFile.value = file
  docName.value = file.name.replace(/\.[^.]+$/, '')
  uploadError.value = ''
  if (file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (ev) => { selectedFilePreview.value = ev.target.result }
    reader.readAsDataURL(file)
  } else {
    selectedFilePreview.value = ''
  }
  e.target.value = ''
}

const onExpiryChange = (e) => {
  docExpiresAt.value = e.target.value
}

const submitDocument = async () => {
  if (!selectedFile.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    const tags = [...parsedTags.value, `cat:${chosenCategory.value}`]
    await uploadDocument(
      selectedFile.value,
      docName.value,
      tags,
      docExpiresAt.value || undefined,
    )
    showUploadModal.value = false
  } catch (e) {
    uploadError.value = e?.data?.message || 'Upload failed. Please try again.'
  } finally {
    uploading.value = false
  }
}

const goBack = useGoBack('/profile')
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

/* Page surface */
.dc-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 96px;
}

/* Nav bar */
.dc-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.dc-nav-icon-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
  transition: background 0.2s;
}
.dc-nav-icon-btn:hover { background: #f0f2f1; }
.dc-nav-icon-btn svg { width: 18px; height: 18px; }
.dc-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.4px;
}

.dc-body { position: relative; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 280px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.warm {
  background:
    radial-gradient(ellipse 70% 100% at 30% 30%, rgba(245, 196, 76, 0.1), transparent 70%),
    radial-gradient(ellipse 70% 80% at 90% 0%, rgba(61, 189, 163, 0.1), transparent 60%);
}

/* Hero */
.dc-hero { padding: 8px 22px 12px; position: relative; z-index: 1; }
.hero-greeting {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 6px;
}
.dc-h1 {
  font-size: 32px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -1.2px;
  line-height: 1;
  margin-bottom: 10px;
}
.dc-h1-count {
  display: inline-block;
  font-size: 22px;
  font-weight: 700;
  color: #00a19a;
  vertical-align: 8px;
  margin-left: 6px;
  letter-spacing: -0.5px;
}
.hero-stats {
  display: inline-flex;
  align-items: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #4a5868;
  letter-spacing: -0.2px;
  flex-wrap: wrap;
}
.hero-stats .stat-num { color: #0e2840; font-weight: 800; font-feature-settings: 'tnum'; margin-right: 4px; }
.hero-stats .stat-num.teal { color: #008a84; }
.hero-stats .stat-num.coral { color: #b85b36; }
.hero-stats .stat-sep { width: 3px; height: 3px; border-radius: 50%; background: #b5bdc4; margin: 0 8px; display: inline-block; }

/* Search */
.dc-search { margin: 0 22px 16px; position: relative; z-index: 1; }
.dc-search-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  padding: 11px 14px 11px 38px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #0e2840;
  outline: none;
  transition: all 0.18s;
}
.dc-search-input::placeholder { color: #8a95a0; font-weight: 500; }
.dc-search-input:focus {
  border-color: #00a19a;
  box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.18);
}
.dc-search-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a95a0;
}
.dc-search-icon svg { width: 14px; height: 14px; }

/* Categories grid */
.dc-cats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 22px;
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
}
.dc-cat {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.18s;
  position: relative;
  overflow: hidden;
  font-family: inherit;
  text-align: left;
}
.dc-cat:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14, 40, 64, 0.06); }
/* Category tone overrides removed - every tile now uses the base
   white background from .dc-cat above so the whole page reads as
   one consistent surface, matching the property-details tile look.
   Border stays neutral; the illustration inside carries the visual
   identity that the pastel wash used to. */
.dc-cat.identity,
.dc-cat.property,
.dc-cat.financial,
.dc-cat.other {
  background: #fff;
  border-color: #e8eceb;
}
.dc-cat-icon {
  width: 30px; height: 30px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 16px;
}
.dc-cat-icon:has(.dc-cat-icon-img) {
  width: 52px;
  height: 52px;
  background: transparent;
  overflow: visible;
  padding: 0;
}
.dc-cat-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  mix-blend-mode: multiply;
}
.dc-cat-name {
  font-size: 12.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  margin-bottom: 1px;
}
.dc-cat-count {
  font-size: 10px;
  font-weight: 700;
  color: #4a5868;
  font-feature-settings: 'tnum';
}

/* Section heading */
.dc-section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 4px 22px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}
.dc-sh-action {
  margin-left: auto;
  font-size: 11px;
  font-weight: 800;
  color: #008a84;
  cursor: pointer;
  letter-spacing: -0.1px;
  text-transform: none;
}

/* Doc rows */
.dc-doc {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  margin: 0 22px 6px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  z-index: 1;
}
.dc-doc:hover { border-color: #e2f1ea; transform: translateY(-1px); }
.dc-doc-icon {
  width: 34px;
  height: 38px;
  border-radius: 6px;
  background: linear-gradient(135deg, #fdf4dc, #f8e6c2);
  color: #6f4d14;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.3px;
  position: relative;
}
.dc-doc-icon.pdf { background: linear-gradient(135deg, #ffe0dc, #ffc4bd); color: #b85b36; }
.dc-doc-icon.img { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #008a84; }
.dc-doc-icon::after {
  content: '';
  position: absolute;
  top: 4px; right: 4px;
  width: 6px; height: 6px;
  border-style: solid;
  border-width: 0 0 4px 4px;
  border-color: transparent transparent rgba(0, 0, 0, 0.15) transparent;
}
.dc-doc-info { flex: 1; min-width: 0; }
.dc-doc-row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
/* Visibility pill - inline with the doc title. Aqua for public,
   slate for private. Small enough that it doesn't crowd the row
   but readable at a glance. */
.dc-vis-pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2px;
  white-space: nowrap;
  border: 1px solid transparent;
  line-height: 1;
}
.dc-vis-pill.is-public {
  background: #e6f7f6;
  color: #007e78;
  border-color: #b2e4e1;
}
.dc-vis-pill.is-private {
  background: #f5f6fa;
  color: #4a5868;
  border-color: #e4e5ed;
}
.dc-doc-name {
  font-size: 12.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dc-doc-meta {
  font-size: 10px;
  font-weight: 600;
  color: #8a95a0;
  margin-top: 1px;
}
.dc-doc-action {
  color: #8a95a0;
  font-size: 16px;
  flex-shrink: 0;
}

.dc-loading,
.dc-empty {
  text-align: center;
  padding: 28px 22px;
  color: #8a95a0;
  font-size: 13px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

/* FAB */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 20;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #00a19a;
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(61, 189, 163, 0.4);
  transition: all 0.18s;
}
.fab:hover { background: #008a84; transform: translateY(-2px) scale(1.05); }
.fab svg { width: 22px; height: 22px; }

/* ── Modal pattern ─────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 40, 64, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 60;
}
.modal {
  width: 100%;
  max-width: 28rem;
  background: #fafaf8;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  overflow: hidden;
  animation: modal-up 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes modal-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.modal-handle { width: 36px; height: 4px; background: #d9dae0; border-radius: 100px; margin: 8px auto 0; }
.modal-header { display: flex; align-items: center; padding: 12px 18px 10px; }
.modal-title { flex: 1; font-size: 16px; font-weight: 800; color: #0e2840; letter-spacing: -0.4px; }
.modal-close {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: none;
  background: #f0f2f1;
  color: #4a5868;
  font-size: 20px;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close:hover { background: #e8eceb; }
.modal-body { flex: 1; overflow-y: auto; padding: 6px 18px 14px; }
.modal-footer {
  padding: 12px 18px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid #e8eceb;
  background: #fafaf8;
  display: flex;
  gap: 8px;
}

/* Drop zone */
.up-drop {
  display: block;
  background: linear-gradient(135deg, #f1f9f4, #e2f1ea);
  border: 1.5px dashed #00a19a;
  border-radius: 14px;
  padding: 22px 16px;
  text-align: center;
  margin-bottom: 14px;
  cursor: pointer;
}
.up-drop-icon {
  width: 48px; height: 48px;
  background: #00a19a;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(31, 122, 102, 0.32);
}
.up-drop-icon svg { width: 22px; height: 22px; }
.up-drop-title {
  font-size: 14px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  margin-bottom: 2px;
}
.up-drop-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: #4a5868;
  margin-bottom: 10px;
}
.up-drop-actions { display: flex; gap: 6px; justify-content: center; }
.up-drop-actions .btn-secondary {
  padding: 7px 12px;
  font-size: 11.5px;
}

/* File preview */
.up-file {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  position: relative;
}
.up-file-thumb {
  width: 56px; height: 64px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fdf4dc, #f8e6c2);
  color: #6f4d14;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.up-file-thumb img { width: 100%; height: 100%; object-fit: cover; }
.up-file-thumb-icon { color: #6f4d14; }
.up-file-thumb-icon svg { width: 22px; height: 22px; }
.up-file-ext {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #6f4d14;
  margin-top: 2px;
}
.up-file-info { flex: 1; min-width: 0; }
.up-file-name {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.up-file-meta { font-size: 11px; font-weight: 600; color: #8a95a0; margin-top: 2px; }
.up-file-clear {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: none;
  background: #f0f2f1;
  color: #4a5868;
  font-size: 16px;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Form */
.mform-section { margin-bottom: 14px; }
.mform-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 8px;
}
.mform-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #0e2840;
  outline: none;
  transition: all 0.18s;
}
.mform-input:focus { border-color: #00a19a; box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.18); }
.mform-input::placeholder { color: #8a95a0; font-weight: 500; }
.mform-radio-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.mform-radio {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #0e2840;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.18s;
  text-align: left;
}
.mform-radio.identity.active { border-color: #00a19a; background: #f1f9f4; color: #008a84; }
.mform-radio.identity.active .mfr-icon { background: rgba(61, 189, 163, 0.4); }
.mform-radio.property.active { border-color: #d4a659; background: #fdf4dc; color: #6f4d14; }
.mform-radio.property.active .mfr-icon { background: #f5c44c; color: #6f4d14; }
.mform-radio.financial.active { border-color: #ff8b5a; background: #ffe9dd; color: #b85b36; }
.mform-radio.financial.active .mfr-icon { background: rgba(255, 139, 90, 0.4); }
.mform-radio.other.active { border-color: #9d7bff; background: #ede5ff; color: #6b4e9f; }
.mform-radio.other.active .mfr-icon { background: rgba(157, 123, 255, 0.4); }
.mfr-icon {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: #f1f9f4;
  color: #008a84;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 13px;
  overflow: hidden;
}
.mfr-icon img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
}
.inline-ic {
  width: 14px;
  height: 14px;
  object-fit: contain;
  vertical-align: -2px;
  display: inline-block;
  margin-right: 2px;
}

.up-tag-row {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.up-tag {
  background: rgba(61, 189, 163, 0.12);
  color: #008a84;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.1px;
  padding: 3px 9px;
  border-radius: 100px;
}

.up-error {
  text-align: center;
  color: #b85b36;
  font-size: 12px;
  font-weight: 700;
}

.btn-secondary {
  flex: 1;
  background: #f0f2f1;
  color: #0e2840;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-secondary:hover { background: #e8eceb; }
.btn-primary {
  flex: 2;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(61, 189, 163, 0.32);
}
.btn-primary:hover { background: #008a84; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.btn-primary svg { width: 14px; height: 14px; }
</style>
