import { ref, computed } from 'vue'

export const useVoiceSearch = () => {
  const isListening = ref(false)
  const transcript = ref('')
  const error = ref('')
  const finalTranscript = ref('')

  // Initialize Web Speech API
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      : null

  const recognition = SpeechRecognition ? new SpeechRecognition() : null

  const setupRecognition = () => {
    if (!recognition) {
      error.value = 'Speech Recognition not supported in this browser'
      return
    }

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-GB' // UK English

    recognition.onstart = () => {
      isListening.value = true
      transcript.value = ''
      finalTranscript.value = ''
      error.value = ''
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript.value += transcriptSegment + ' '
        } else {
          interimTranscript += transcriptSegment
        }
      }

      transcript.value = finalTranscript.value + interimTranscript
    }

    recognition.onerror = (event: any) => {
      error.value = `Error: ${event.error}`
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
    }
  }

  const startListening = () => {
    if (!recognition) {
      error.value = 'Speech Recognition not supported'
      return
    }

    finalTranscript.value = ''
    transcript.value = ''
    error.value = ''

    try {
      recognition.start()
    } catch (e) {
      console.warn('Recognition already started')
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      isListening.value = false
    }
  }

  const resetTranscript = () => {
    transcript.value = ''
    finalTranscript.value = ''
    error.value = ''
  }

  const getTranscript = computed(() => finalTranscript.value.trim())

  // Initialize on mount
  if (SpeechRecognition) {
    setupRecognition()
  }

  return {
    isListening,
    transcript,
    error,
    finalTranscript: getTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!recognition,
  }
}
