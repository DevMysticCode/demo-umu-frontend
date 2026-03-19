<template>
  <div
    class="mobile-container min-h-screen flex flex-col bg-[#f2f2f7] bg-umu-gradient"
  >
    <!-- Header -->
    <header class="flex items-center gap-3 px-4 pt-5 pb-4 bg-[#f2f2f7]">
      <button
        type="button"
        class="w-10 h-10 flex items-center justify-center"
        @click="goBack"
      >
        <Icon
          name="i-heroicons-chevron-left"
          class="w-[15px] h-[15px] text-black"
        />
      </button>

      <div class="flex items-center gap-3 flex-1">
        <div
          class="w-10 h-10 rounded-full bg-brand-aqua flex items-center justify-center flex-shrink-0"
        >
          <Icon name="i-heroicons-sparkles" class="w-5 h-5 text-white" />
        </div>
        <div>
          <p
            class="font-sf-pro text-[17px] leading-[22px] font-semibold text-[#1f2024]"
          >
            MoveCompanion
          </p>
          <p class="font-sf-pro text-[12px] text-[#8f9094]">
            Powered by UMovingU AI
          </p>
        </div>
      </div>

      <button
        type="button"
        class="text-brand-aqua font-sf-pro text-[15px]"
        @click="clearChat"
      >
        Clear
      </button>
    </header>

    <!-- Messages -->
    <main
      ref="scrollContainer"
      class="flex-1 overflow-y-auto px-4 py-2 space-y-4"
    >
      <!-- Welcome card (shown when no messages) -->
      <div v-if="messages.length === 0" class="mt-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm">
          <p class="font-sf-pro text-[15px] leading-[22px] text-[#1f2024]">
            Hi! I can help you with anything about property.
          </p>
          <p class="mt-3 font-sf-pro text-[13px] font-semibold text-[#1f2024]">
            Common questions I get:
          </p>
          <ul class="mt-2 space-y-1">
            <li
              v-for="q in suggestedQuestions"
              :key="q"
              class="font-sf-pro text-[13px] text-[#3c3c43] leading-[18px]"
            >
              · {{ q }}
            </li>
          </ul>
          <p class="mt-4 font-sf-pro text-[15px] text-[#1f2024]">
            What would you like to know?
          </p>
          <div
            class="mt-3 inline-flex items-center gap-1 text-brand-aqua font-sf-pro text-[12px]"
          >
            <Icon name="i-heroicons-sparkles" class="w-3 h-3" />
            Powered by UMovingU AI
          </div>
        </div>

        <!-- Quick question chips -->
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="q in suggestedQuestions"
            :key="q"
            type="button"
            class="bg-white border border-[#e5e5ea] rounded-full px-4 py-2 font-sf-pro text-[13px] text-[#1f2024] text-left"
            @click="handleSuggestedQuestion(q)"
          >
            {{ q }}
          </button>
        </div>
      </div>

      <!-- Chat messages -->
      <template v-for="(msg, i) in messages" :key="i">
        <!-- User message (right) -->
        <div v-if="msg.role === 'user'" class="flex justify-end">
          <div
            class="max-w-[78%] bg-[#1f2024] rounded-2xl rounded-br-sm px-4 py-3"
          >
            <p class="font-sf-pro text-[15px] leading-[22px] text-white">
              {{ msg.content }}
            </p>
          </div>
        </div>

        <!-- Assistant message (left) -->
        <div v-else class="flex items-end gap-2">
          <div
            class="w-8 h-8 rounded-full bg-brand-aqua flex items-center justify-center flex-shrink-0"
          >
            <Icon name="i-heroicons-sparkles" class="w-4 h-4 text-white" />
          </div>
          <div
            class="max-w-[78%] bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm"
          >
            <p class="font-sf-pro text-[15px] leading-[22px] text-[#1f2024]">
              {{ msg.content }}
            </p>
          </div>
        </div>
      </template>

      <!-- Typing indicator -->
      <div v-if="isLoading" class="flex items-end gap-2">
        <div
          class="w-8 h-8 rounded-full bg-brand-aqua flex items-center justify-center flex-shrink-0"
        >
          <Icon name="i-heroicons-sparkles" class="w-4 h-4 text-white" />
        </div>
        <div class="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div class="flex gap-1 items-center h-5">
            <span
              class="w-2 h-2 rounded-full bg-[#b4b5b8] animate-bounce"
              style="animation-delay: 0ms"
            />
            <span
              class="w-2 h-2 rounded-full bg-[#b4b5b8] animate-bounce"
              style="animation-delay: 150ms"
            />
            <span
              class="w-2 h-2 rounded-full bg-[#b4b5b8] animate-bounce"
              style="animation-delay: 300ms"
            />
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="text-center">
        <p class="font-sf-pro text-[13px] text-red-500">{{ error }}</p>
      </div>

      <!-- Scroll anchor -->
      <div ref="scrollAnchor" />
    </main>

    <!-- Input bar -->
    <footer class="px-4 pt-3 pb-6 bg-[#f2f2f7]">
      <div
        class="flex items-center gap-3 bg-white rounded-2xl px-4 h-[54px] shadow-sm border border-[#e5e5ea]"
      >
        <input
          v-model="inputText"
          type="text"
          placeholder="Ask anything related to your property"
          class="flex-1 bg-transparent outline-none font-sf-pro text-[15px] text-[#1f2024] placeholder:text-[#8f9094]"
          @keydown.enter.prevent="handleSend"
        />

        <button
          v-if="inputText.trim()"
          type="button"
          class="w-9 h-9 rounded-full bg-brand-aqua flex items-center justify-center flex-shrink-0"
          :disabled="isLoading"
          @click="handleSend"
        >
          <Icon name="i-heroicons-arrow-up" class="w-5 h-5 text-white" />
        </button>

        <button
          v-else
          type="button"
          class="w-9 h-9 rounded-full border border-[#e5e5ea] flex items-center justify-center flex-shrink-0 text-[#8f9094]"
        >
          <Icon name="i-heroicons-microphone" class="w-5 h-5" />
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'MoveMate AI - UmovingU',
})

const { messages, isLoading, error, sendMessage, clearChat } = useChat()

const inputText = ref('')
const scrollContainer = ref<HTMLElement | null>(null)
const scrollAnchor = ref<HTMLElement | null>(null)

const suggestedQuestions = [
  'How do I find my exact boundary lines?',
  "What if my neighbour's fence is on my land?",
  'Do I need a survey before selling?',
  'What is a property passport?',
  'How long does conveyancing take?',
]

const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  inputText.value = ''
  await sendMessage(text)
}

const handleSuggestedQuestion = async (q: string) => {
  if (isLoading.value) return
  await sendMessage(q)
}

const goBack = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back()
    return
  }
  navigateTo('/profile')
}

// Auto-scroll to bottom on new messages
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
  },
)

watch(isLoading, async (val) => {
  if (val) {
    await nextTick()
    scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
  }
})
</script>
