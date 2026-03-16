<template>
  <div class="mobile-container min-h-screen bg-umu-gradient pb-8">
    <!-- Header -->
    <header class="flex items-center justify-between px-4 pt-5 pb-4">
      <button
        type="button"
        class="w-[24px] h-[24px] flex items-center justify-center"
        @click="goBack"
      >
        <Icon name="i-heroicons-chevron-left" class="w-[25px] h-[18px] text-black" />
      </button>

      <h1 class="text-[17px] leading-[22px] font-semibold text-black">
        Your Documents
      </h1>

      <button
        type="button"
        class="w-[30px] h-[30px] rounded-full bg-[#403d91] flex items-center justify-center"
        aria-label="More"
      >
        <Icon name="i-heroicons-ellipsis-horizontal" class="w-[25px] h-[25px] text-white" />
      </button>
    </header>

    <main class="px-5 pb-8">
      <!-- Hero -->
      <section class="pt-8 text-center">
        <img
          src="/op-icons/temp/property.svg"
          alt="Documents"
          class="w-[144px] h-[128px] mx-auto"
        />
        <h2 class="mt-6 text-[20px] leading-[25px] font-semibold text-[#101319]">
          Your Documents Store
        </h2>
        <p class="mt-2 text-[15px] leading-[20px] text-[#3c3c43]/60">
          Upload, organize, and share property documents securely
        </p>
      </section>

      <!-- Search -->
      <div class="mt-6 flex gap-4 items-center">
        <div class="flex-1 bg-white rounded-2xl h-[36px] px-4 flex items-center">
          <Icon name="i-heroicons-magnifying-glass" class="w-5 h-5 text-[#8f9094]" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search documents"
            class="ml-2 bg-transparent outline-none text-[17px] leading-[22px] placeholder:text-[#3c3c43]/60 w-full"
          />
        </div>
        <button
          type="button"
          class="w-[36px] h-[36px] rounded-2xl bg-[#00A191] text-white flex items-center justify-center"
          aria-label="Filter"
        >
          <Icon name="i-heroicons-adjustments-horizontal" class="w-[18px] h-[18px]" />
        </button>
      </div>

      <!-- Add Documents Button -->
      <button
        type="button"
        class="mt-6 w-full h-[52px] rounded-full border-2 border-dashed border-[#00A8AB] text-[#00A8AB] inline-flex items-center justify-center text-[15px] font-semibold"
        @click="showUploadPickerDrawer = true"
      >
        <Icon name="i-heroicons-plus" class="w-5 h-5 mr-2" />
        Add Documents to Document Store
      </button>

      <!-- Loading -->
      <div v-if="loading" class="mt-12 flex justify-center">
        <Icon name="i-heroicons-arrow-path" class="w-8 h-8 text-brand-aqua animate-spin" />
      </div>

      <template v-else>
        <!-- Recent Uploads -->
        <section v-if="recentUploads.length > 0" class="mt-8">
          <h3 class="text-[15px] leading-[20px] font-semibold text-[#000000]">
            Recent Uploads
          </h3>
          <div class="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div
              v-for="doc in recentUploads"
              :key="doc.id"
              class="min-w-[90px] h-[137px] bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center shrink-0"
            >
              <Icon name="i-heroicons-document-text" class="w-[28px] h-[34px] text-[#00A8AB]" />
              <p class="mt-3 text-[11px] leading-[13px] font-semibold text-[#3c3c43] text-center line-clamp-2">
                {{ doc.title }}
              </p>
            </div>
          </div>
        </section>

        <!-- Passport Documents -->
        <section class="mt-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-[15px] leading-[20px] font-semibold text-[#000000]">
              Passport Documents
            </h3>
          </div>

          <div v-if="filteredPassportDocs.length === 0" class="bg-white rounded-2xl p-5 text-center">
            <p class="text-[14px] text-[#9C9CA6]">No passport documents yet.</p>
            <p class="mt-1 text-[13px] text-[#9C9CA6]">Documents uploaded in your property passports will appear here.</p>
          </div>

          <ul v-else class="space-y-3">
            <li
              v-for="doc in filteredPassportDocs.slice(0, showAllPassport ? undefined : 3)"
              :key="doc.id"
              class="bg-white rounded-2xl p-4 flex items-center justify-between"
            >
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <Icon name="i-heroicons-document-text" class="w-5 h-5 text-[#9C9CA6] shrink-0 mt-1" />
                <div class="flex-1 min-w-0">
                  <p class="text-[15px] leading-[20px] text-[#000000] font-medium truncate">
                    {{ doc.title }}
                  </p>
                  <p class="mt-0.5 text-[13px] leading-[18px] text-[#9C9CA6]">
                    {{ [doc.size, doc.mimeType ? mimeLabel(doc.mimeType) : '', doc.uploadedAt].filter(Boolean).join(' · ') }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-1.5">
                    <span
                      v-for="tag in doc.tags"
                      :key="tag"
                      class="text-[11px] leading-[13px] font-semibold text-[#00A191] bg-[#00a19a1a] px-2 py-1 rounded-full"
                    >
                      # {{ tag }}
                    </span>
                  </div>
                  <div v-if="doc.passportAddress" class="mt-2 flex items-center gap-1.5">
                    <Icon name="i-heroicons-home" class="w-3.5 h-3.5 text-[#9C9CA6]" />
                    <p class="text-[12px] text-[#9C9CA6] truncate">{{ doc.passportAddress }}</p>
                  </div>
                </div>
              </div>
              <Icon name="i-heroicons-chevron-right" class="w-4 h-4 text-[#3C3C43]/30 shrink-0 ml-2" />
            </li>
          </ul>

          <button
            v-if="filteredPassportDocs.length > 3"
            type="button"
            class="mt-4 w-full text-center text-[15px] font-semibold text-[#00A8AB] py-3 flex items-center justify-center gap-2"
            @click="showAllPassport = !showAllPassport"
          >
            {{ showAllPassport ? 'Show less' : `Show all ${filteredPassportDocs.length} passport documents` }}
            <Icon :name="showAllPassport ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-right'" class="w-4 h-4" />
          </button>
        </section>

        <!-- Other Stored Documents (user uploads) -->
        <section class="mt-8">
          <h3 class="text-[17px] font-semibold text-[#101319] mb-4">
            Other Stored Documents
          </h3>

          <div v-if="filteredUserDocs.length === 0" class="bg-white rounded-2xl p-5 text-center">
            <p class="text-[14px] text-[#9C9CA6]">No documents uploaded yet.</p>
            <p class="mt-1 text-[13px] text-[#9C9CA6]">Use the button above to add your first document.</p>
          </div>

          <ul v-else class="space-y-3">
            <li
              v-for="doc in filteredUserDocs.slice(0, showAllUser ? undefined : 3)"
              :key="doc.id"
              class="bg-white rounded-2xl p-4"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <Icon name="i-heroicons-document-text" class="w-5 h-5 text-[#00A8AB] shrink-0" />
                    <p class="font-semibold text-[15px] text-[#101319] truncate">
                      {{ doc.title }}
                    </p>
                  </div>
                  <p class="mt-1 text-[12px] text-[#7f8084]">
                    {{ [doc.size, doc.mimeType ? mimeLabel(doc.mimeType) : '', doc.uploadedAt].filter(Boolean).join(' · ') }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-1.5">
                    <span
                      v-for="tag in doc.tags"
                      :key="tag"
                      class="text-[11px] font-semibold text-[#00A8AB] bg-[#E8FFFB] px-2 py-1 rounded-full"
                    >
                      # {{ tag }}
                    </span>
                  </div>
                  <p v-if="doc.expiresAt" class="mt-2 text-[12px] text-[#7f8084] flex items-center gap-1">
                    <Icon name="i-heroicons-calendar" class="w-3.5 h-3.5" />
                    Expires {{ formatDate(doc.expiresAt) }}
                  </p>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    class="w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center"
                    aria-label="Delete"
                    @click="handleDelete(doc.id)"
                  >
                    <Icon name="i-heroicons-trash" class="w-4 h-4" />
                  </button>
                  <Icon name="i-heroicons-chevron-right" class="w-5 h-5 text-[#b4b5b8]" />
                </div>
              </div>
            </li>
          </ul>

          <button
            v-if="filteredUserDocs.length > 3"
            type="button"
            class="mt-4 w-full text-center text-[15px] font-semibold text-[#00A8AB] py-3 flex items-center justify-center gap-2"
            @click="showAllUser = !showAllUser"
          >
            {{ showAllUser ? 'Show less' : `Show all ${filteredUserDocs.length} documents` }}
            <Icon :name="showAllUser ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-right'" class="w-4 h-4" />
          </button>
        </section>
      </template>
    </main>

    <!-- ── Drawer 1: Upload Picker ── -->
    <BaseDrawer
      v-model="showUploadPickerDrawer"
      title="Upload your document..."
      :show-back-button="false"
    >
      <div class="pt-2 space-y-3">
        <!-- Upload from Files -->
        <label class="w-full rounded-2xl bg-white border border-[#e5e5ea] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[110px]">
          <Icon name="i-heroicons-arrow-up-tray" class="w-8 h-8 text-[#1f2024]" />
          <span class="text-[15px] leading-[20px] text-[#1f2024] font-medium">Upload from Files</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            class="sr-only"
            @change="onFilePickedStep1"
          />
        </label>

        <!-- Scan Using Camera -->
        <label class="w-full rounded-2xl bg-white border border-[#e5e5ea] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[110px]">
          <Icon name="i-heroicons-camera" class="w-8 h-8 text-[#1f2024]" />
          <span class="text-[15px] leading-[20px] text-[#1f2024] font-medium">Scan Using Camera</span>
          <input
            type="file"
            accept="image/*"
            capture="camera"
            class="sr-only"
            @change="onFilePickedStep1"
          />
        </label>

        <!-- Order Document -->
        <button
          type="button"
          class="w-full rounded-2xl bg-white border border-[#e5e5ea] p-5 flex items-center justify-center gap-3 min-h-[72px]"
        >
          <Icon name="i-heroicons-shopping-cart" class="w-6 h-6 text-brand-aqua" />
          <span class="text-[15px] leading-[20px] text-brand-aqua font-semibold">Order Document</span>
        </button>
      </div>

      <template #footer>
        <button
          type="button"
          class="w-full h-14 rounded-2xl bg-brand-aqua text-white text-[17px] font-medium"
          @click="showUploadPickerDrawer = false"
        >
          Continue
        </button>
      </template>
    </BaseDrawer>

    <!-- ── Drawer 2: Document Info ── -->
    <BaseDrawer
      v-model="showDocInfoDrawer"
      title="Add Document"
      :show-back-button="false"
    >
      <div class="pt-2 space-y-6">
        <!-- File preview card -->
        <div v-if="selectedFile" class="flex flex-col items-center gap-2 py-4">
          <div class="w-[120px] h-[140px] rounded-2xl bg-white border border-[#e5e5ea] flex flex-col items-center justify-center shadow-sm">
            <img
              v-if="selectedFilePreview && isImageFile"
              :src="selectedFilePreview"
              class="w-full h-full object-cover rounded-2xl"
              alt="Preview"
            />
            <template v-else>
              <Icon name="i-heroicons-document-text" class="w-12 h-12 text-[#00A8AB]" />
              <p class="mt-2 text-[10px] text-[#9C9CA6] font-semibold uppercase">
                {{ fileExtension }}
              </p>
            </template>
          </div>
          <p class="text-[20px] font-semibold text-[#101319] text-center">
            {{ docName || selectedFile.name }}
          </p>
          <p class="text-[14px] text-[#9C9CA6]">
            {{ fileSizeLabel }} · {{ fileExtension.toUpperCase() }}
          </p>
        </div>

        <!-- Document name -->
        <div>
          <p class="text-[15px] font-semibold text-[#101319] mb-3">Document Information</p>
          <div class="h-[56px] rounded-2xl bg-white border border-[#e5e5ea] px-4 flex items-center gap-3">
            <Icon name="i-heroicons-document" class="w-5 h-5 text-[#9C9CA6]" />
            <input
              v-model="docName"
              type="text"
              placeholder="Enter File Name"
              class="w-full bg-transparent outline-none text-[16px] leading-[22px] text-[#1f2024] placeholder:text-[#9C9CA6]"
            />
          </div>
        </div>

        <!-- Expiry date -->
        <div>
          <p class="text-[15px] font-semibold text-[#101319] mb-3">
            Does this document have an expiry date?
          </p>
          <div class="space-y-3">
            <button
              type="button"
              class="w-full h-[64px] rounded-2xl bg-white border border-[#e5e5ea] px-4 flex items-center gap-4"
              @click="docHasExpiry = false"
            >
              <span
                class="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0"
                :class="!docHasExpiry ? 'border-brand-aqua bg-brand-aqua' : 'border-[#9C9CA6]'"
              >
                <Icon v-if="!docHasExpiry" name="i-heroicons-check" class="w-4 h-4 text-white" />
              </span>
              <span class="text-[16px] text-[#1f2024]">No Expiry Date</span>
            </button>

            <button
              type="button"
              class="w-full h-[64px] rounded-2xl bg-white border border-[#e5e5ea] px-4 flex items-center gap-4"
              @click="docHasExpiry = true"
            >
              <span
                class="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0"
                :class="docHasExpiry ? 'border-brand-aqua bg-brand-aqua' : 'border-[#9C9CA6]'"
              >
                <Icon v-if="docHasExpiry" name="i-heroicons-check" class="w-4 h-4 text-white" />
              </span>
              <span class="text-[16px] text-[#1f2024] flex-1">Set Expiration Date</span>
              <label class="relative ml-auto" @click.stop>
                <span class="h-9 px-4 rounded-[14px] bg-[#f2f2f7] text-brand-aqua text-[14px] inline-flex items-center cursor-pointer">
                  {{ docExpiryLabel }}
                </span>
                <input
                  type="date"
                  :min="minDate"
                  :value="docExpiresAt"
                  class="absolute inset-0 opacity-0 cursor-pointer"
                  @change="onExpiryChange"
                />
              </label>
            </button>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <p class="text-[15px] font-semibold text-[#101319] mb-3">Add Tags</p>
          <textarea
            v-model="docTagsInput"
            placeholder="Start typing tags here, you can separate tags using commas"
            rows="3"
            class="w-full rounded-2xl bg-white border border-[#e5e5ea] px-4 py-3 text-[15px] leading-[22px] text-[#1f2024] placeholder:text-[#9C9CA6] outline-none resize-none"
          />
          <!-- Tag preview pills -->
          <div v-if="parsedTags.length" class="mt-2 flex flex-wrap gap-1.5">
            <span
              v-for="tag in parsedTags"
              :key="tag"
              class="text-[12px] font-semibold text-[#00A191] bg-[#00a19a1a] px-2 py-1 rounded-full"
            >
              # {{ tag }}
            </span>
          </div>
        </div>

        <p v-if="uploadError" class="text-center text-red-500 text-[13px]">{{ uploadError }}</p>
      </div>

      <template #footer>
        <button
          type="button"
          class="w-full h-14 rounded-2xl bg-brand-aqua text-white text-[20px] font-medium inline-flex items-center justify-center gap-2"
          :disabled="uploading"
          @click="submitDocument"
        >
          <Icon name="i-heroicons-arrow-up-tray" class="w-5 h-5" />
          {{ uploading ? 'Uploading…' : 'Continue' }}
        </button>
      </template>
    </BaseDrawer>
  </div>
</template>

<script setup>
import BaseDrawer from '@/components/ui/BaseDrawer.vue'

definePageMeta({ title: 'Your Documents - UmovingU' })

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

const showUploadPickerDrawer = ref(false)
const showDocInfoDrawer = ref(false)

const selectedFile = ref(null)
const selectedFilePreview = ref('')
const docName = ref('')
const docHasExpiry = ref(false)
const docExpiresAt = ref('')
const docTagsInput = ref('')
const uploading = ref(false)
const uploadError = ref('')

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

const onFilePickedStep1 = (e) => {
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
  showUploadPickerDrawer.value = false
  showDocInfoDrawer.value = true
}

const onExpiryChange = (e) => {
  docExpiresAt.value = e.target.value
  docHasExpiry.value = true
}

const submitDocument = async () => {
  if (!selectedFile.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    await uploadDocument(
      selectedFile.value,
      docName.value,
      parsedTags.value,
      docHasExpiry.value && docExpiresAt.value ? docExpiresAt.value : undefined,
    )
    // Reset form
    selectedFile.value = null
    selectedFilePreview.value = ''
    docName.value = ''
    docHasExpiry.value = false
    docExpiresAt.value = ''
    docTagsInput.value = ''
    showDocInfoDrawer.value = false
  } catch (e) {
    uploadError.value = e?.data?.message || 'Upload failed. Please try again.'
  } finally {
    uploading.value = false
  }
}

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
    return
  }
  navigateTo('/profile')
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
