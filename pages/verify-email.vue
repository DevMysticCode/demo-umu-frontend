<template>
  <div class="mobile-container gradient-bg">
    <!-- Header -->
    <header class="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm z-50">
      <div class="flex items-center justify-between px-4 py-3 bg-black/10 backdrop-blur-sm">
        <UButton 
          @click="$router.back()"
          variant="ghost" 
          icon="i-heroicons-arrow-left"
          class="text-white"
        />
        <div class="text-white font-semibold text-17-medium">
          9:41
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
          <div class="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-20 pb-32 px-6">
      <div class="space-y-8">
        <!-- Title -->
        <div class="text-center">
          <h1 class="text-22-emphasized text-white mb-2">
            Enter code
          </h1>
          <p class="text-16-medium text-white/70">
            We sent a verification code to your email
          </p>
          <p class="text-16-medium text-brand-aqua">
            {{ email }}
          </p>
        </div>

        <!-- Code Input -->
        <div class="flex justify-center space-x-3">
          <input
            v-for="(digit, index) in verificationCode"
            :key="index"
            v-model="verificationCode[index]"
            @input="handleInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
            :ref="el => codeInputs[index] = el"
            type="text"
            maxlength="1"
            class="w-12 h-12 bg-white rounded-xl text-center text-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-aqua"
          />
        </div>

        <!-- Resend Code -->
        <div class="text-center">
          <p class="text-white/70 text-sm mb-2">
            Resend code in {{ countdown }}s
          </p>
          <UButton
            @click="resendCode"
            variant="link"
            class="text-brand-aqua p-0"
            :disabled="countdown > 0"
          >
            Continue
          </UButton>
        </div>
      </div>
    </main>

    <!-- Custom Numeric Keypad -->
    <div class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-gray-100">
      <div class="grid grid-cols-3 gap-1 p-4">
        <!-- Numbers 1-9 -->
        <button
          v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
          :key="num"
          @click="inputNumber(num)"
          class="h-14 bg-white rounded-lg text-xl font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-200 transition-colors"
        >
          {{ num }}
        </button>
        
        <!-- Bottom row: empty, 0, backspace -->
        <div></div>
        <button
          @click="inputNumber(0)"
          class="h-14 bg-white rounded-lg text-xl font-semibold text-gray-900 hover:bg-gray-50 active:bg-gray-200 transition-colors"
        >
          0
        </button>
        <button
          @click="backspace"
          class="h-14 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-200 transition-colors"
        >
          <Icon name="i-heroicons-backspace" class="w-6 h-6 text-gray-900" />
        </button>
      </div>
      
      <!-- Home Indicator -->
      <div class="flex justify-center pb-4">
        <div class="w-32 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Verify Email - UmovingU'
})

// Get email from query params
const route = useRoute()
const email = route.query.email || 'john.smith@gmail.com'

// Form data
const verificationCode = ref(['', '', '', '', '', ''])
const codeInputs = ref([])
const countdown = ref(60)
const isVerifying = ref(false)

// Current input index
const currentIndex = ref(0)

// Countdown timer
let countdownInterval = null

// Methods
const handleInput = (index, event) => {
  const value = event.target.value
  if (value && /^\d$/.test(value)) {
    verificationCode.value[index] = value
    if (index < 5) {
      currentIndex.value = index + 1
      codeInputs.value[index + 1]?.focus()
    }
    checkComplete()
  }
}

const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !verificationCode.value[index] && index > 0) {
    currentIndex.value = index - 1
    codeInputs.value[index - 1]?.focus()
  }
}

const inputNumber = (num) => {
  if (currentIndex.value < 6) {
    verificationCode.value[currentIndex.value] = num.toString()
    if (currentIndex.value < 5) {
      currentIndex.value++
    }
    checkComplete()
  }
}

const backspace = () => {
  if (verificationCode.value[currentIndex.value]) {
    verificationCode.value[currentIndex.value] = ''
  } else if (currentIndex.value > 0) {
    currentIndex.value--
    verificationCode.value[currentIndex.value] = ''
  }
}

const checkComplete = () => {
  const code = verificationCode.value.join('')
  if (code.length === 6) {
    verifyCode(code)
  }
}

const verifyCode = async (code) => {
  isVerifying.value = true
  
  try {
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Navigate to onboarding or dashboard
    await navigateTo('/onboarding')
  } catch (error) {
    console.error('Verification failed:', error)
    // Reset code on error
    verificationCode.value = ['', '', '', '', '', '']
    currentIndex.value = 0
  } finally {
    isVerifying.value = false
  }
}

const resendCode = async () => {
  try {
    // Simulate resend
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Reset countdown
    countdown.value = 60
    startCountdown()
  } catch (error) {
    console.error('Resend failed:', error)
  }
}

const startCountdown = () => {
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
    }
  }, 1000)
}

// Lifecycle
onMounted(() => {
  startCountdown()
  // Focus first input
  codeInputs.value[0]?.focus()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>