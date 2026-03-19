<template>
  <div
    class="mobile-container min-h-screen bg-[#efeff4] flex flex-col bg-umu-gradient"
  >
    <AppHeader title="Help & Support" :showBack="true" backTo="/profile" />

    <!-- Segmented Switch -->
    <div class="px-4 pt-4 pb-2">
      <SegmentedSwitch :options="tabOptions" v-model="activeTab" />
    </div>

    <div class="flex-1 overflow-y-auto px-4 pt-4 pb-28">
      <!-- FAQs tab -->
      <div v-if="activeTab === 'faqs'">
        <section class="mb-8">
          <h2 class="mb-2 text-[22px] font-semibold text-[#1A1A1A]">
            Common Issues
          </h2>
          <div class="border-b border-[#cfd1d8]">
            <div
              v-for="(faq, index) in commonIssues"
              :key="index"
              class="border-t border-[#cfd1d8]"
            >
              <button
                @click="toggleFAQ(index)"
                class="flex w-full items-center justify-between py-3 text-left"
              >
                <span class="pr-4 text-[14px] leading-[1.25] text-[#191a1f]">{{
                  faq.question
                }}</span>
                <Icon
                  name="mdi:chevron-down"
                  :class="[
                    'shrink-0 text-[#9a9da8] transition-transform',
                    expandedFAQ === index ? 'rotate-180' : '',
                  ]"
                  size="22"
                />
              </button>
              <transition name="expand">
                <div
                  v-if="expandedFAQ === index"
                  class="pb-3 pr-7 text-[13px] leading-[1.35] text-[#5e6069]"
                >
                  {{ faq.answer }}
                </div>
              </transition>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="mb-2 text-[22px] font-semibold text-[#1A1A1A]">
            Category name two
          </h2>
          <div class="border-b border-[#cfd1d8]">
            <div
              v-for="(category, index) in categoryIssues"
              :key="index"
              class="border-t border-[#cfd1d8]"
            >
              <button
                @click="toggleCategory(index)"
                class="flex w-full items-center justify-between py-3 text-left"
              >
                <span class="pr-4 text-[14px] leading-[1.25] text-[#191a1f]">{{
                  category.question
                }}</span>
                <Icon
                  name="mdi:chevron-down"
                  :class="[
                    'shrink-0 text-[#9a9da8] transition-transform',
                    expandedCategory === index ? 'rotate-180' : '',
                  ]"
                  size="22"
                />
              </button>
              <transition name="expand">
                <div
                  v-if="expandedCategory === index"
                  class="pb-3 pr-7 text-[13px] leading-[1.35] text-[#5e6069]"
                >
                  {{ category.answer }}
                </div>
              </transition>
            </div>
          </div>
        </section>

        <button
          @click="showSupportDrawer = true"
          class="mb-4 w-full rounded-[16px] border border-[#d0d2d9] bg-[#f6f6f7] px-5 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.08)]"
        >
          <div class="mb-2 flex justify-center">
            <img
              src="/op-icons/temp/request.svg"
              alt="Request"
              class="h-[36px] w-[36px]"
            />
          </div>
          <div
            class="mx-auto mb-2 w-full max-w-[320px] rounded-full bg-[#00A19A] py-2.5 text-center text-[16px] font-medium text-white"
          >
            Send us a support request
          </div>
          <div class="text-center text-[13px] text-[#33353d]">
            We&rsquo;ll get back to you as soon as we can
          </div>
        </button>

        <!-- <button
          @click="showSupportDrawer = true"
          class="mb-6 w-full rounded-[16px] border border-[#d0d2d9] bg-[#f6f6f7] px-5 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.08)]"
        >
          <div class="mb-2 flex justify-center">
            <img
              src="/op-icons/temp/library.svg"
              alt="Library"
              class="h-[36px] w-[36px]"
            />
          </div>
          <div
            class="mx-auto mb-2 w-full max-w-[320px] rounded-full bg-[#403D91] py-2.5 text-center text-[16px] font-medium text-white"
          >
            Search our learn library
          </div>
          <div class="text-center text-[13px] text-[#33353d]">
            For tips on app features and more
          </div>
        </button> -->
      </div>

      <!-- Feedback tab -->
      <div v-if="activeTab === 'feedback'" class="space-y-4">
        <div class="rounded-2xl border border-[#d7d9e1] bg-white p-5 shadow-sm">
          <label class="mb-3 block text-sm font-semibold text-gray-900">
            What can we improve?
          </label>
          <textarea
            v-model="feedbackForm.message"
            placeholder="Share your feedback with us..."
            class="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#403D91] focus:ring-2 focus:ring-[#403D91]/20"
            rows="5"
          ></textarea>
        </div>

        <div class="rounded-2xl border border-[#d7d9e1] bg-white p-5 shadow-sm">
          <label class="mb-3 block text-sm font-semibold text-gray-900">
            Category
          </label>
          <select
            v-model="feedbackForm.category"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#403D91] focus:ring-2 focus:ring-[#403D91]/20"
          >
            <option value="">Select a category</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="performance">Performance Issue</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="rounded-2xl border border-[#d7d9e1] bg-white p-5 shadow-sm">
          <label class="mb-3 block text-sm font-semibold text-gray-900">
            Email Address
          </label>
          <input
            v-model="feedbackForm.email"
            type="email"
            placeholder="your@email.com"
            class="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#403D91] focus:ring-2 focus:ring-[#403D91]/20"
          />
        </div>

        <button
          @click="submitFeedback"
          class="w-full rounded-full bg-[#12a7aa] py-3 text-base font-semibold text-white shadow-md transition hover:bg-[#0f999c]"
        >
          Submit Feedback
        </button>
      </div>
    </div>

    <!-- Support Request Drawer -->
    <Teleport to="body">
      <div
        v-if="showSupportDrawer"
        class="fixed inset-0 z-50 flex flex-col justify-end"
      >
        <div
          class="absolute inset-0 bg-black/40"
          @click="showSupportDrawer = false"
        />
        <div class="relative bg-white rounded-t-3xl px-5 pt-4 pb-10 z-10">
          <div class="w-10 h-1 bg-[#d9dae0] rounded-full mx-auto mb-5" />
          <div class="flex items-center justify-between mb-5">
            <h2 class="font-sf-pro text-[17px] font-semibold text-[#1f2024]">
              Support Request
            </h2>
            <button type="button" @click="showSupportDrawer = false">
              <Icon name="i-heroicons-x-mark" class="w-5 h-5 text-[#8f9094]" />
            </button>
          </div>
          <div class="mb-4">
            <label
              class="font-sf-pro text-[13px] font-medium text-[#8f9094] mb-1 block"
              >Your name</label
            >
            <input
              v-model="supportForm.name"
              type="text"
              placeholder="John Smith"
              class="w-full border border-[#e5e5ea] rounded-xl px-4 py-3 font-sf-pro text-[15px] text-[#1f2024] outline-none focus:border-brand-aqua"
            />
          </div>
          <div class="mb-4">
            <label
              class="font-sf-pro text-[13px] font-medium text-[#8f9094] mb-1 block"
              >Email address</label
            >
            <input
              v-model="supportForm.email"
              type="email"
              placeholder="you@example.com"
              class="w-full border border-[#e5e5ea] rounded-xl px-4 py-3 font-sf-pro text-[15px] text-[#1f2024] outline-none focus:border-brand-aqua"
            />
          </div>
          <div class="mb-4">
            <label
              class="font-sf-pro text-[13px] font-medium text-[#8f9094] mb-1 block"
              >Subject</label
            >
            <input
              v-model="supportForm.subject"
              type="text"
              placeholder="Briefly describe your issue"
              class="w-full border border-[#e5e5ea] rounded-xl px-4 py-3 font-sf-pro text-[15px] text-[#1f2024] outline-none focus:border-brand-aqua"
            />
          </div>
          <div class="mb-6">
            <label
              class="font-sf-pro text-[13px] font-medium text-[#8f9094] mb-1 block"
              >Message</label
            >
            <textarea
              v-model="supportForm.message"
              rows="4"
              placeholder="Tell us what's happening and we'll get back to you as soon as possible."
              class="w-full border border-[#e5e5ea] rounded-xl px-4 py-3 font-sf-pro text-[15px] text-[#1f2024] outline-none focus:border-brand-aqua resize-none"
            />
          </div>
          <button
            type="button"
            class="w-full h-[50px] rounded-2xl bg-brand-aqua text-white font-sf-pro text-[17px] font-medium disabled:opacity-50"
            :disabled="
              !supportForm.name.trim() ||
              !supportForm.email.trim() ||
              !supportForm.subject.trim() ||
              !supportForm.message.trim() ||
              isSubmitting
            "
            @click="submitSupportRequest"
          >
            {{ isSubmitting ? 'Sending...' : 'Send request' }}
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Success popup -->
    <Teleport to="body">
      <div
        v-if="showSuccessPopup"
        class="fixed inset-0 z-[60] flex items-center justify-center px-6"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="showSuccessPopup = false"
        />
        <div
          class="relative bg-white rounded-3xl px-6 py-8 w-full max-w-[340px] text-center shadow-2xl"
        >
          <div
            class="w-16 h-16 rounded-full bg-brand-aqua/10 flex items-center justify-center mx-auto mb-4"
          >
            <Icon
              name="i-heroicons-check-circle"
              class="w-9 h-9 text-brand-aqua"
            />
          </div>
          <h3 class="font-sf-pro text-[19px] font-semibold text-[#1f2024] mb-2">
            Request Received
          </h3>
          <p class="font-sf-pro text-[14px] text-[#8f9094] mb-4">
            We'll get back to you as soon as we can.
          </p>
          <div class="bg-[#f6f6f7] rounded-2xl px-4 py-3 mb-6">
            <p class="font-sf-pro text-[12px] text-[#8f9094] mb-1">
              Your ticket number
            </p>
            <p
              class="font-sf-pro text-[20px] font-bold text-brand-aqua tracking-wide"
            >
              {{ ticketNumber }}
            </p>
          </div>
          <button
            type="button"
            class="w-full h-[48px] rounded-2xl bg-brand-aqua text-white font-sf-pro text-[16px] font-medium"
            @click="showSuccessPopup = false"
          >
            Done
          </button>
        </div>
      </div>
    </Teleport>

    <BottomNav active="explore" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '~/components/core/AppHeader.vue'
import SegmentedSwitch from '~/components/core/SegmentedSwitch.vue'
import BottomNav from '~/components/core/BottomNav.vue'
import { useSupportRequest } from '~/composables/useSupportRequest'

const { isSubmitting, submitRequest } = useSupportRequest()

const showSupportDrawer = ref(false)
const showSuccessPopup = ref(false)
const ticketNumber = ref('')

const supportForm = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const submitSupportRequest = async () => {
  try {
    const result = await submitRequest(supportForm.value)
    ticketNumber.value = result.ticketNumber
    showSupportDrawer.value = false
    showSuccessPopup.value = true
    supportForm.value = { name: '', email: '', subject: '', message: '' }
  } catch {
    alert('Failed to send request. Please try again.')
  }
}

const activeTab = ref('faqs')
const expandedFAQ = ref(null)
const expandedCategory = ref(null)

const tabOptions = [
  { label: 'FAQs & Support', value: 'faqs' },
  { label: 'Send feedback', value: 'feedback' },
]

const feedbackForm = ref({
  message: '',
  category: '',
  email: '',
})

const commonIssues = [
  {
    question: 'How can I reset my password?',
    answer:
      'Go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your email to reset your password.',
  },
  {
    question: 'Why am I not seeing any properties in my search results?',
    answer:
      'This could happen if your search filters are too restrictive. Try expanding your location, price range, or property type filters. You can also clear all filters and try again.',
  },
  {
    question: 'How can I tell if a property is still available?',
    answer:
      'Each property listing shows its availability status. Active listings show recent updates and available tags. Contact the property owner directly for the most current status.',
  },
  {
    question: 'How do I save a property?',
    answer:
      'You can save properties by tapping the heart icon on any property card. Your saved properties will be added to your collection for easy access later.',
  },
  {
    question: 'Where can I find my saved properties?',
    answer:
      'Navigate to "My Home" in the bottom menu and select "Saved Properties". Here you can view, organize, and manage all your saved properties.',
  },
  {
    question: 'Can I favourite properties without creating an account?',
    answer:
      'You need to create an account or log in to save properties. This helps us personalize your experience and send you relevant property updates.',
  },
]

const categoryIssues = [
  {
    question: 'How do I update my notification preferences?',
    answer:
      'Go to Settings in your profile and scroll to Notifications. You can toggle notifications on/off for property updates, messages, and other alerts.',
  },
  {
    question: 'Can I use the app offline?',
    answer:
      'Some features work offline, but you need an internet connection to browse properties, send messages, and make updates.',
  },
  {
    question: 'The app is crashing-what can I do?',
    answer:
      'Try clearing the app cache, updating to the latest version, or reinstalling the app. If the issue persists, contact our support team.',
  },
  {
    question: "I'm seeing an error message. What should I do?",
    answer:
      'Note the error message and contact our support team with details. Screenshot the error if possible to help us troubleshoot faster.',
  },
  {
    question: 'How can I report a bug or issue?',
    answer:
      'Use the "Send us a support request" button below or go to the Feedback tab to report any bugs or issues you encounter.',
  },
  {
    question: 'There is an issue with listed data.',
    answer:
      'If you notice incorrect information in a property listing, please use the report feature on that property card or contact our support team with details.',
  },
]

const toggleFAQ = (index) => {
  expandedFAQ.value = expandedFAQ.value === index ? null : index
}

const toggleCategory = (index) => {
  expandedCategory.value = expandedCategory.value === index ? null : index
}

const openSupportModal = () => {
  console.log('Open support modal')
}

const openLearnLibrary = () => {
  console.log('Open learn library')
}

const submitFeedback = () => {
  if (
    !feedbackForm.value.message ||
    !feedbackForm.value.category ||
    !feedbackForm.value.email
  ) {
    alert('Please fill in all fields')
    return
  }
  console.log('Feedback submitted:', feedbackForm.value)
  alert('Thank you for your feedback!')
  feedbackForm.value = { message: '', category: '', email: '' }
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>
