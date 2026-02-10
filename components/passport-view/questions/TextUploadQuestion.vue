<template>
  <div class="combined-input-wrapper">
    <h3 v-if="question.description" class="section-title">
      {{ question.description }}
    </h3>

    <!-- Visible debug banner (dev only) to ensure UI elements render -->
    <div v-if="isDev" class="debug-banner">
      DEBUG MODE — Mode: {{ displayMode }} · type: {{ question.type }} ·
      question.display: {{ question.display }}
    </div>

    <!-- Text area (top) -->
    <div
      v-if="displayMode === 'text' || displayMode === 'both'"
      class="input-container"
    >
      <div v-if="!textValue || textValue.length === 0" class="pending-badge">
        <span class="pending-icon">⚠</span> Pending
      </div>
      <p class="input-instruction">
        {{
          question.instructionText ||
          'Please provide written instruction for your answer above:'
        }}
      </p>
      <textarea
        :value="textValue"
        @input="onTextInput"
        :placeholder="
          question.placeholder ||
          'E.g., Back fence in the garden has been moved back 2 yards...'
        "
        class="text-input"
        rows="6"
      ></textarea>
    </div>

    <!-- Upload section (bottom) -->
    <div
      v-if="displayMode === 'upload' || displayMode === 'both'"
      class="upload-container"
    >
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
  question: { type: Object, default: 'Test Question' },
  answer: { type: [String, Array, Object], default: '' },
  display: { type: String, default: '' }, // 'text' | 'upload' | 'both' - optional override
})

const emit = defineEmits(['update'])

const fileInput = ref(null)

const displayMode = computed(() => {
  // Build a raw candidate for the display mode from props or question metadata
  const raw =
    props.display ||
    (props.question &&
      (props.question.display ||
        (props.question.showBoth ? 'both' : undefined) ||
        (props.question.uploadInstruction ? 'both' : undefined) ||
        props.question.type)) ||
    'text'

  const mode = String(raw || '')
    .toLowerCase()
    .trim()
  if (['text', 'upload', 'both'].includes(mode)) return mode

  // Fallback to question.type if possible
  const t =
    props.question && props.question.type
      ? String(props.question.type).toLowerCase()
      : 'text'
  return ['text', 'upload', 'both'].includes(t) ? t : 'text'
})

// Internal state derived from props.answer
const textValue = ref('')
const uploadedFiles = ref([])

const syncFromAnswer = (val) => {
  if (displayMode.value === 'text') {
    textValue.value = typeof val === 'string' ? val : ''
    uploadedFiles.value = []
  } else if (displayMode.value === 'upload') {
    uploadedFiles.value = Array.isArray(val) ? val : []
    textValue.value = ''
  } else {
    // both
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      textValue.value = val.text || ''
      uploadedFiles.value = val.files || []
    } else if (typeof val === 'string') {
      textValue.value = val
      uploadedFiles.value = []
    } else if (Array.isArray(val)) {
      uploadedFiles.value = val
      textValue.value = ''
    } else {
      textValue.value = ''
      uploadedFiles.value = []
    }
  }
}

watch(
  () => props.answer,
  (val) => {
    syncFromAnswer(val)
  },
  { immediate: true },
)

const onTextInput = (event) => {
  const value = event.target.value
  if (value.length <= 500) {
    textValue.value = value
    emitUpdate()
  }
}

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
  uploadedFiles.value = [...(uploadedFiles.value || []), ...newFiles]
  emitUpdate()
  event.target.value = ''
}

const removeFile = (index) => {
  uploadedFiles.value = uploadedFiles.value.filter((_, i) => i !== index)
  emitUpdate()
}

const hasPending = computed(() => uploadedFiles.value.length === 0)

const emitUpdate = () => {
  if (displayMode.value === 'text') {
    emit('update', textValue.value)
  } else if (displayMode.value === 'upload') {
    emit('update', uploadedFiles.value)
  } else {
    emit('update', { text: textValue.value, files: uploadedFiles.value })
  }
}

const isDev =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV

// Dev-only diagnostics
onMounted(() => {
  console.log('TextUploadQuestion debug:', {
    displayMode: displayMode.value,
    question: props.question,
    answerProp: props.answer,
    textValue: textValue.value,
    uploadedFiles: uploadedFiles.value,
  })
  try {
    if (isDev) {
      console.log('TextUploadQuestion debug:', {
        displayMode: displayMode.value,
        question: props.question,
        answerProp: props.answer,
        textValue: textValue.value,
        uploadedFiles: uploadedFiles.value,
      })
    }
  } catch (e) {
    // ignore in environments where import.meta is not defined
  }
})
</script>

<style scoped>
.combined-input-wrapper {
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

.input-container {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  position: relative;
  min-height: 120px; /* Make container visible even when empty */
}

.upload-container {
  min-height: 120px; /* Make upload container more obvious */
}

.pending-badge {
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff6b6b;
  font-weight: 600;
}

.input-instruction {
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  background: #f9f9f9;
  transition: border-color 0.2s;
  box-sizing: border-box;
  color: #666;
}

.text-input:focus {
  outline: none;
  border-color: #00b8a9;
  background: white;
}

.upload-container {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  position: relative;
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
</style>
