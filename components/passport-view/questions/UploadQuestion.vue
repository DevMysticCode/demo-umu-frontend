<template>
  <div class="upload-section">
    <h3 class="section-title">Upload/ Scan Any Supporting Document(s)</h3>

    <div class="upload-container">
      <div v-if="hasPending" class="pending-badge">
        <span class="pending-icon"
          ><OPIcon name="pending" class="w-[11px] h-[11px]"
        /></span>
        Pending
      </div>

      <p class="instruction-text">
        {{
          question.uploadInstruction ||
          'Please indicate ownership by written instruction or by reference to a plan:'
        }}
      </p>

      <div class="upload-options">
        <button class="upload-btn" @click="triggerFileUpload">
          <span class="upload-icon"
            ><OPIcon name="upload" class="w-[20px] h-[20px]"
          /></span>
          <span>Upload from Files</span>
        </button>
        <!-- <div class="separator">Or</div> -->
        <button class="upload-btn camera">
          <span class="upload-icon"
            ><OPIcon name="scan" class="w-[20px] h-[20px]"
          /></span>
          <span>Scan Using Camera</span>
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        multiple
        @change="handleFileSelect"
        style="display: none"
      />

      <div v-if="uploadedFiles.length > 0" class="uploaded-files">
        <h4 class="files-title">Uploaded Files ({{ uploadedFiles.length }})</h4>
        <div
          v-for="(file, index) in uploadedFiles"
          :key="index"
          class="file-item"
        >
          <span class="file-icon">📄</span>
          <span class="file-name">{{ file.name }}</span>
          <button class="remove-btn" @click="removeFile(index)">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'
const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  answer: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update'])

const fileInput = ref(null)
const uploadedFiles = computed(() => props.answer || [])

const hasPending = computed(() => {
  return uploadedFiles.value.length === 0
})

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  const newFiles = files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
  }))

  const updated = [...(uploadedFiles.value || []), ...newFiles]
  emit('update', updated)

  event.target.value = ''
}

const removeFile = (index) => {
  const updated = uploadedFiles.value.filter((_, i) => i !== index)
  emit('update', updated)
}
</script>

<style scoped>
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #00b8a9;
  margin: 0;
}

.upload-container {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  position: relative;
}

.pending-badge {
  border-radius: 100px;
  background-color: #ff3b301a;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff6b6b;
  font-weight: 600;
  padding: 4px 8px;
  width: fit-content;
  margin-bottom: 4px;
}

.pending-icon {
  font-size: 14px;
}

.instruction-text {
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  font-weight: 500;
  line-height: 1.5;
}

.upload-options {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.upload-btn {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.upload-btn:active {
  transform: scale(0.98);
  border-color: #00b8a9;
  background: #f0fffe;
}

.separator {
  font-size: 14px;
  color: #999;
  font-weight: 600;
}

.upload-icon {
  font-size: 32px;
}

.uploaded-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 12px;
}

.files-title {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #1a1a1a;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.file-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.file-name {
  font-size: 13px;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
}

.status-pending {
  font-size: 13px;
  color: #ff6b6b;
  margin: 0;
  font-weight: 600;
}
</style>
