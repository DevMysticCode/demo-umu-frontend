<template>
  <div class="combined-input-wrapper">
    <!-- For 'both' mode: show instruction text at top, then textarea, then upload options below with Or divider -->
    <template v-if="displayMode === 'both'">
      <div v-if="!textValue || textValue.length === 0" class="pending-badge">
        <span class="pending-icon"
          ><OPIcon name="pendingCircle" class="w-[11px] h-[11px]"
        /></span>
        Pending
      </div>

      <p class="instruction-text">
        {{
          question.uploadInstruction ||
          'Please indicate ownership by written instruction or by reference to a plan:'
        }}
      </p>

      <textarea
        :value="textValue"
        @input="onTextInput"
        :placeholder="
          question.placeholder ||
          'E.g., The irregular boundary near the stream at the rear of the property is owned by...'
        "
        class="text-input"
        rows="6"
      ></textarea>

      <div class="or-divider"></div>

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
    </template>

    <!-- Text area only mode -->
    <template v-else-if="displayMode === 'text'">
      <div class="input-container">
        <div v-if="!textValue || textValue.length === 0" class="pending-badge">
          <span class="pending-icon"
            ><OPIcon name="pendingCircle" class="w-[11px] h-[11px]"
          /></span>
          Pending
        </div>

        <!-- Question Display (skip if hideQuestionDisplay is true) -->
        <template v-if="!hideQuestionDisplay">
          <p v-if="question.instructionText" class="question-text">
            {{ question.instructionText }}
            <span v-if="showQuestionCursor" class="typing-cursor">|</span>
          </p>

          <!-- Description Display -->
          <div v-if="question.description" class="question-description">
            {{ question.description }}
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
    </template>

    <!-- Upload only mode -->
    <template v-else-if="displayMode === 'upload'">
      <div class="upload-container">
        <div v-if="hasPending" class="pending-badge">
          <span class="pending-icon"
            ><OPIcon name="pendingCircle" class="w-[11px] h-[11px]"
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
          <h4 class="files-title">
            Uploaded Files ({{ uploadedFiles.length }})
          </h4>
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
    </template>
  </div>
</template>

<script setup>
import OPIcon from '~/components/ui/OPIcon.vue'
const props = defineProps({
  question: { type: Object, default: 'Test Question' },
  answer: { type: [String, Array, Object], default: '' },
  display: { type: String, default: '' },
  displayedQuestion: {
    type: String,
    default: '',
  },
  showQuestionCursor: {
    type: Boolean,
    default: false,
  },
  displayedDescription: {
    type: String,
    default: '',
  },
  showDescriptionCursor: {
    type: Boolean,
    default: false,
  },
  displayedHelp: {
    type: String,
    default: '',
  },
  showHelpCursor: {
    type: Boolean,
    default: false,
  },
  hideQuestionDisplay: {
    type: Boolean,
    default: false,
  },
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
  /* border: 2px solid #e0e0e0; */
  border-radius: 12px;
  padding: 16px;
  /* position: relative; */
  min-height: 120px; /* Make container visible even when empty */
}

.upload-container {
  min-height: 120px; /* Make upload container more obvious */
}

.or-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 400;
  color: #000000;
  margin: 12px 0;
  height: 20px;
  position: relative;
}

.or-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 0.33px;
  background-color: #3c3c432e;
  z-index: 0;
}

.or-divider::after {
  content: 'Or';
  position: relative;
  z-index: 1;
  background: white;
  padding: 0 12px;
}

.pending-badge {
  background-color: #ff3b301a;
  border-radius: 100px;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #ff3b30;
  font-weight: 600;
  padding: 4px 8px;
  width: fit-content;
}

.input-instruction {
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.instruction-text {
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  font-weight: 500;
  line-height: 1.5;
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
  border-radius: 12px;
  padding: 16px;
  position: relative;
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
