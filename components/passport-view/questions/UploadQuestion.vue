<template>
  <div class="upload-section">
    <h3 class="section-title">Upload/ Scan Any Supporting Document(s)</h3>

    <div class="upload-container">
      <p v-if="question.uploadInstruction" class="instruction-text">
        {{ question.uploadInstruction }}
      </p>

      <div class="upload-options">
        <button class="upload-btn" :disabled="uploading" @click="triggerFileUpload">
          <span class="upload-icon"><OPIcon name="upload" class="w-[20px] h-[20px]" /></span>
          <span>{{ uploading ? 'Uploading...' : 'Upload from Files' }}</span>
        </button>
        <button class="upload-btn camera" disabled>
          <span class="upload-icon"><OPIcon name="scan" class="w-[20px] h-[20px]" /></span>
          <span>Scan Using Camera</span>
        </button>
      </div>

      <input ref="fileInput" type="file" multiple @change="handleFileSelect" style="display: none" />

      <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>

      <div v-if="uploadedFiles.length > 0" class="uploaded-files">
        <h4 class="files-title">Uploaded Files ({{ uploadedFiles.length }})</h4>
        <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
          <span class="file-icon">📄</span>
          <div class="file-meta">
            <span class="file-name">{{ file.name }}</span>
            <span v-if="file.url" class="file-ready">✓ Ready</span>
          </div>
          <button class="remove-btn" @click="removeFile(index)">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'

const props = defineProps({
  question: { type: Object, required: true },
  answer: { type: Array, default: () => [] },
})

const emit = defineEmits(['update'])

const config = useRuntimeConfig()
const fileInput = ref(null)
const uploading = ref(false)
const uploadError = ref('')

const uploadedFiles = computed(() => props.answer || [])

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return

  uploading.value = true
  uploadError.value = ''

  const questionId = props.question?.id
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const results = []

  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await $fetch(`${config.public.apiBase}/questions/${questionId}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      results.push({ name: res.name || file.name, url: res.url, size: file.size, type: file.type })
    } catch {
      // Fall back to metadata-only if upload fails
      results.push({ name: file.name, size: file.size, type: file.type, url: '' })
    }
  }

  uploading.value = false
  emit('update', [...uploadedFiles.value, ...results])
}

const removeFile = (index) => {
  const updated = uploadedFiles.value.filter((_, i) => i !== index)
  emit('update', updated)
}
</script>

<style scoped>
.upload-section { display: flex; flex-direction: column; gap: 16px; }
.section-title { font-size: 16px; font-weight: 700; color: #00a19a; margin: 0; }
.upload-container { background: white; border: 2px solid #e0e0e0; border-radius: 12px; padding: 16px; }
.instruction-text { font-size: 14px; color: #1a1a1a; margin: 0 0 16px; font-weight: 500; line-height: 1.5; }
.upload-options { display: flex; flex-direction: row; align-items: center; gap: 16px; }
.upload-btn {
  width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 24px 16px; border: 2px solid #e0e0e0; border-radius: 12px; background: white;
  cursor: pointer; transition: all 0.2s; font-size: 13px; font-weight: 600; color: #1a1a1a;
}
.upload-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.upload-btn:active:not(:disabled) { transform: scale(0.98); border-color: #00a19a; background: #f0fffe; }
.upload-icon { font-size: 32px; }
.upload-error { font-size: 13px; color: #e53e3e; margin: 8px 0 0; }
.uploaded-files { display: flex; flex-direction: column; gap: 8px; padding: 16px; background: #f9f9f9; border-radius: 12px; margin-top: 16px; }
.files-title { font-size: 14px; font-weight: 700; margin: 0 0 12px; color: #1a1a1a; }
.file-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 8px; }
.file-icon { font-size: 16px; flex-shrink: 0; }
.file-meta { flex: 1; min-width: 0; }
.file-name { font-size: 13px; color: #666; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-ready { font-size: 11px; color: #00a19a; font-weight: 600; }
.remove-btn { background: none; border: none; color: #999; font-size: 16px; cursor: pointer; padding: 4px 8px; flex-shrink: 0; }
</style>
