export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export function useChat() {
  const config = useRuntimeConfig()
  const BASE_URL = config.public.apiBase

  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const sendMessage = async (text: string) => {
    const token = getToken()
    if (!token) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    messages.value.push(userMsg)
    isLoading.value = true
    error.value = null

    try {
      // Only send last 8 messages as history (exclude the one we just added)
      const history = messages.value
        .slice(-9, -1)
        .map(({ role, content }) => ({ role, content }))

      const res = await $fetch<{ reply: string }>(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { message: text, chatHistory: history },
      })

      messages.value.push({
        role: 'assistant',
        content: res.reply,
        timestamp: new Date(),
      })
    } catch {
      error.value = 'Something went wrong. Please try again.'
      // Remove the user message on error so they can retry
      messages.value.pop()
    } finally {
      isLoading.value = false
    }
  }

  const clearChat = () => {
    messages.value = []
    error.value = null
  }

  return { messages, isLoading, error, sendMessage, clearChat }
}
