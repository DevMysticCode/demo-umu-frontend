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
          Get Started
        </div>
        <UButton
          variant="link"
          class="text-white/70 p-0"
          @click="skipOnboarding"
        >
          Skip
        </UButton>
      </div>
    </header>

    <!-- Main Content -->
    <main class="pt-20 pb-32 px-6">
      <div class="space-y-8">
        <!-- Progress -->
        <div class="flex space-x-1">
          <div 
            v-for="(step, index) in onboardingSteps" 
            :key="index"
            class="flex-1 progress-segment"
            :class="{ 'filled': index <= currentStep }"
          >
            <div v-if="index <= currentStep" class="w-full h-full bg-white rounded-full"></div>
          </div>
        </div>

        <!-- Current Step Content -->
        <div class="text-center space-y-6">
          <div class="w-32 h-32 mx-auto bg-white/20 rounded-2xl flex items-center justify-center">
            <Icon :name="currentStepData.icon" class="w-16 h-16 text-white" />
          </div>
          
          <div class="space-y-3">
            <h1 class="text-28-emphasized text-white">
              {{ currentStepData.title }}
            </h1>
            <p class="text-16-medium text-white/70">
              {{ currentStepData.description }}
            </p>
          </div>
        </div>

        <!-- Form based on current step -->
        <UCard class="glass-card">
          <div class="p-6">
            <!-- Step 1: Personal Info -->
            <div v-if="currentStep === 0" class="space-y-4">
              <UFormGroup label="Full Name">
                <UInput
                  v-model="userProfile.fullName"
                  placeholder="Enter your full name"
                  required
                />
              </UFormGroup>
              <UFormGroup label="Phone Number">
                <UInput
                  v-model="userProfile.phone"
                  placeholder="Enter your phone number"
                  required
                />
              </UFormGroup>
            </div>

            <!-- Step 2: Property Type -->
            <div v-if="currentStep === 1" class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <UButton
                  v-for="type in propertyTypes"
                  :key="type.value"
                  :variant="userProfile.propertyType === type.value ? 'solid' : 'outline'"
                  class="h-20 flex-col space-y-2"
                  @click="userProfile.propertyType = type.value"
                >
                  <Icon :name="type.icon" class="w-6 h-6" />
                  <span class="text-sm">{{ type.label }}</span>
                </UButton>
              </div>
            </div>

            <!-- Step 3: Goals -->
            <div v-if="currentStep === 2" class="space-y-4">
              <div class="space-y-3">
                <UCheckbox
                  v-for="goal in availableGoals"
                  :key="goal.value"
                  v-model="userProfile.goals"
                  :value="goal.value"
                  :label="goal.label"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </main>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm">
      <div class="bg-white/95 backdrop-blur-sm p-6 space-y-4">
        <div class="flex space-x-3">
          <UButton
            v-if="currentStep > 0"
            @click="previousStep"
            variant="outline"
            class="flex-1 h-12 border-brand-aqua text-brand-aqua font-17-medium rounded-xl"
          >
            Back
          </UButton>
          <UButton
            @click="nextStep"
            class="flex-1 h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-17-medium rounded-xl"
            :loading="isLoading"
          >
            {{ currentStep === onboardingSteps.length - 1 ? 'Complete' : 'Next' }}
          </UButton>
        </div>
        
        <!-- Home Indicator -->
        <div class="flex justify-center pt-2">
          <div class="w-32 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Onboarding - UmovingU'
})

// Onboarding data
const onboardingSteps = ref([
  {
    title: 'Tell us about yourself',
    description: 'Help us personalize your experience',
    icon: 'i-heroicons-user'
  },
  {
    title: 'What type of property?',
    description: 'Select your property type',
    icon: 'i-heroicons-home'
  },
  {
    title: 'What are your goals?',
    description: 'Choose what you want to achieve',
    icon: 'i-heroicons-target'
  }
])

const propertyTypes = ref([
  { value: 'house', label: 'House', icon: 'i-heroicons-home' },
  { value: 'apartment', label: 'Apartment', icon: 'i-heroicons-building-office' },
  { value: 'condo', label: 'Condo', icon: 'i-heroicons-building-office-2' },
  { value: 'other', label: 'Other', icon: 'i-heroicons-question-mark-circle' }
])

const availableGoals = ref([
  { value: 'buy', label: 'Buy a property' },
  { value: 'sell', label: 'Sell a property' },
  { value: 'rent', label: 'Rent a property' },
  { value: 'invest', label: 'Property investment' },
  { value: 'manage', label: 'Property management' }
])

// State
const currentStep = ref(0)
const isLoading = ref(false)

const userProfile = ref({
  fullName: '',
  phone: '',
  propertyType: '',
  goals: []
})

// Computed
const currentStepData = computed(() => onboardingSteps.value[currentStep.value])

// Methods
const nextStep = async () => {
  if (currentStep.value === onboardingSteps.value.length - 1) {
    await completeOnboarding()
  } else {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const completeOnboarding = async () => {
  isLoading.value = true
  
  try {
    await $fetch('/api/user/profile', {
      method: 'POST',
      body: userProfile.value
    })
    
    await navigateTo('/dashboard')
  } catch (error) {
    console.error('Onboarding completion failed:', error)
  } finally {
    isLoading.value = false
  }
}

const skipOnboarding = async () => {
  await navigateTo('/dashboard')
}
</script>