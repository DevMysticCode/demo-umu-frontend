<template>
  <div class="mobile-container gradient-bg">
    <!-- Header -->
    <!-- Main Content -->
    <main class="pt-6">
      <div class="px-6 py-6">
        <!-- Progress Bar -->
        <div class="flex space-x-1 mb-6">
          <div 
            v-for="(segment, index) in progressSegments" 
            :key="index"
            class="flex-1 progress-segment"
            :class="{ 'filled': segment.filled }"
          >
            <div v-if="segment.filled" class="w-full h-full bg-white rounded-full"></div>
          </div>
        </div>

        <!-- Logo and Title -->
        <div class="mb-6">
          <div class="w-14 h-12 mb-4 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="Logo" class="w-14 h-8" />
          </div>
          
          <div class="space-y-1">
            <h1 class="text-22-emphasized text-white">
              Welcome to UmovingU
            </h1>
            <p class="text-12-regular text-white/50">
              Powered by Open Property
            </p>
          </div>
        </div>

        <!-- Main Heading -->
        <h2 class="text-28-emphasized text-white leading-tight mb-8 transition-all duration-500">
          {{ currentSlideData.title.split('\n').join('\n') }}
        </h2>
      </div>

      <!-- Feature Card -->
      <div class="px-6">
        <UCard class="bg-brand-aqua border-none ring-0 shadow-xl">
          <div class="p-6 text-center space-y-6">
            <div class="w-48 h-32 mx-auto  flex items-center justify-center">
              <!-- <Icon name="i-heroicons-building-office-2" class="w-24 h-24 text-white" /> -->
              <img src="/onboarding.png" alt="Logo" />
            </div>
            
            <p class="text-16-medium text-white transition-all duration-500">
              {{ currentSlideData.description }}
            </p>

            <!-- Pagination Dots -->
            <div class="flex justify-center space-x-2">
              <div 
                v-for="(dot, index) in paginationDots" 
                :key="index"
                @click="goToSlide(index * 2)"
                class="pagination-dot"
                :class="{ 'active': dot.active }"
              ></div>
            </div>
          </div>
        </UCard>
      </div>
    </main>

    <!-- Footer -->
    <footer class=" w-full max-w-sm mt-6">
      <div class="backdrop-blur-sm p-6 space-y-4">
        <div class="space-y-3">
          <UButton 
            @click="handleCreateAccount"
            class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-purple-main font-17-medium rounded-xl flex items-center justify-center"
            :loading="isCreatingAccount"
          >
            Create Account
          </UButton>
          
          <UButton 
            @click="handleLogin"
            variant="outline"
            class="w-full h-12 bg-white border border-brand-aqua text-gray-dark font-17-medium rounded-xl flex items-center justify-center
         hover:bg-brand-aqua/10"
            :loading="isLoggingIn"
          >
            Log in
          </UButton>
        </div>
        
        <!-- <div class="flex justify-center pt-2">
          <div class="w-32 h-1 bg-gray-300 rounded-full"></div>
        </div> -->
      </div>
    </footer>
  </div>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'Welcome to UmovingU',
  description: 'Your complete property toolkit'
})

// Current slide index
const currentSlide = ref(0)

// Reactive data
const progressSegments = ref([
  { filled: true },
  { filled: false },
  { filled: false },
  { filled: false },
  { filled: false },
  { filled: false },
])

const paginationDots = ref([
  { active: true },
  { active: false },
  { active: false },
])

const slides = ref([
  {
    id: 1,
    title: "Your data.\nYour money.\nYour move.\nYour way.",
    description: "Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.",
  },
  {
    id: 2,
    title: "Moving's never been so simple.",
    description: "Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.",
  },
  {
    id: 3,
    title: "Tired of time consuming transactions. Join the club.",
    description: "Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.",
  },
  {
    id: 4,
    title: "Your next move, in the palm of your hands.",
    description: "Know what's next at every stage—get clear guidance and stay in control of your home journey.",
  },
  {
    id: 5,
    title: "Start building your property passport today, for an easier move tomorrow.",
    description: "Your complete property toolkit—track progress, store documents, and connect with trusted trades in one place.",
  },
  {
    id: 6,
    title: "Knowledge is power. Learn what slows your move down today.",
    description: "Know what's next at every stage—get clear guidance and stay in control of your home journey.",
  }
])

const isCreatingAccount = ref(false)
const isLoggingIn = ref(false)

// Computed properties
const currentSlideData = computed(() => slides.value[currentSlide.value])

// Auto-advance slides
let slideInterval = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
  updatePaginationDots()
  updateProgressSegments()
}

const goToSlide = (index) => {
  currentSlide.value = index
  updatePaginationDots()
  updateProgressSegments()
  // Reset interval when user manually navigates
  if (slideInterval) {
    clearInterval(slideInterval)
  }
  startSlideInterval()
}

const updatePaginationDots = () => {
  paginationDots.value = paginationDots.value.map((dot, index) => ({
    ...dot,
    active: index === Math.floor(currentSlide.value / 2) // Group slides into 3 dots
  }))
}

const updateProgressSegments = () => {
  progressSegments.value = progressSegments.value.map((segment, index) => ({
    ...segment,
    filled: index <= currentSlide.value
  }))
}

const startSlideInterval = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
  slideInterval = setInterval(() => {
    nextSlide()
  }, 3000) // 3 seconds
}

// Lifecycle
onMounted(() => {
  nextTick(() => {
    startSlideInterval()
  })
})

onBeforeUnmount(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})

// Also cleanup on route change
onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})

// Watch for slide changes to ensure proper updates
watch(currentSlide, () => {
  updatePaginationDots()
  updateProgressSegments()
})

// Restart interval when component becomes visible
onActivated(() => {
  startSlideInterval()
})

onDeactivated(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})

// Methods
const handleCreateAccount = async () => {
  isCreatingAccount.value = true
  
  try {
    // Navigate to signup page
    await navigateTo('/signup')
  } catch (error) {
    console.error('Navigation failed:', error)
  } finally {
    isCreatingAccount.value = false
  }
}

const handleLogin = async () => {
  isLoggingIn.value = true
  
  try {
    // Navigate to login page
    await navigateTo('/login')
  } catch (error) {
    console.error('Navigation failed:', error)
  } finally {
    isLoggingIn.value = false
  }
}
</script>