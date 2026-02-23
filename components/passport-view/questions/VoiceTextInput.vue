<template>
  <div class="voice-input-container">
    <div class="voice-input-row">
      <input
        v-model="inputText"
        class="voice-input-field"
        type="text"
        :placeholder="placeholder"
        @keydown.enter.prevent="submit"
        @input="onInput"
      />
      <button
        class="voice-btn"
        :class="{ recording: isRecording }"
        @click="toggleRecording"
        type="button"
        :title="isRecording ? 'Stop recording' : 'Record voice'"
      >
        <!-- Sound wave icon when recording, mic icon when idle -->
        <svg
          v-if="isRecording"
          class="voice-btn__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="2" y="8" width="2" height="8" rx="1" />
          <rect x="6" y="5" width="2" height="14" rx="1" />
          <rect x="10" y="3" width="2" height="18" rx="1" />
          <rect x="14" y="5" width="2" height="14" rx="1" />
          <rect x="18" y="8" width="2" height="8" rx="1" />
        </svg>
        <svg
          v-else
          class="voice-btn__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
          />
          <path
            d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
          />
        </svg>
      </button>
      <button class="submit-btn" @click="submit" type="button">
        <svg
          class="submit-btn__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  value: { type: String, default: '' },
  placeholder: { type: String, default: 'Start typing or use voice...' },
})

const emit = defineEmits(['update'])

const inputText = ref(props.value || '')
const isRecording = ref(false)

// Keep in sync if parent changes value
watch(
  () => props.value,
  (v) => {
    if (v !== inputText.value) inputText.value = v || ''
  },
)

// Real-time emit on typing
const onInput = () => {
  emit('update', inputText.value)
}

const submit = () => {
  emit('update', inputText.value)
}

// ── Speech Recognition ──────────────────────────────────────────────────────
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

let recognition = null

if (SpeechRecognitionAPI) {
  recognition = new SpeechRecognitionAPI()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-GB'

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    inputText.value = inputText.value
      ? inputText.value + ' ' + transcript
      : transcript
    isRecording.value = false
    emit('update', inputText.value)
  }

  recognition.onerror = () => {
    isRecording.value = false
  }

  recognition.onend = () => {
    isRecording.value = false
  }
}

const toggleRecording = () => {
  if (!recognition) return
  if (isRecording.value) {
    recognition.stop()
    isRecording.value = false
  } else {
    try {
      recognition.start()
      isRecording.value = true
    } catch {
      isRecording.value = false
    }
  }
}

onUnmounted(() => {
  if (recognition && isRecording.value) recognition.stop()
})
</script>

<style scoped>
.voice-input-container {
  margin-bottom: 12px;
}

.voice-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 0.33px solid #e0e0e0;
  border-radius: 16px;
  padding: 12px;
}

.voice-input-field {
  flex: 1;
  border: 0.33px solid #e0e0e0;
  padding: 9px 12px;
  outline: none;
  font-size: 14px;
  color: #1a1a1a;
  background: transparent;
  font-family: inherit;
  border-radius: 100px;
}

.voice-input-field::placeholder {
  color: #aaa;
}

.voice-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #aaa;
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.voice-btn:hover {
  color: #00a19a;
}

.voice-btn.recording {
  color: #e53e3e;
  animation: pulse 1s infinite;
}

.voice-btn__icon {
  width: 20px;
  height: 20px;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #00a19a;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.submit-btn:hover {
  background: #008f89;
}

.submit-btn__icon {
  width: 18px;
  height: 18px;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
