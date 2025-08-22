<template>
  <div class="mobile-container gradient-bg backgound-image">
    <!-- Header -->
    <div class="relative z-10">
      <!-- Main Content -->
      <main class="pt-6 pb-8 px-6">
        <!-- Back Button -->
        <div class="mb-6">
          <UButton
            @click="$router.back()"
            variant="ghost"
            icon="i-heroicons-arrow-left"
            class="text-white"
          />
        </div>
        <div class="space-y-6">
          <!-- Title -->
          <div>
            <h1 class="text-22-emphasized text-white mb-2">Create account</h1>
            <p class="text-16-medium text-white/70">
              Enter your details to get started
            </p>
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <!-- First Name -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">
                First Name
              </label>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="John"
                class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
                :disabled="isLoading"
              />
            </div>

            <!-- Last Name -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                v-model="form.lastName"
                type="text"
                placeholder="Smith"
                class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
                :disabled="isLoading"
              />
            </div>

            <!-- Mobile Number -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">
                Mobile Number
              </label>
              <div class="flex space-x-2">
                <div class="flex items-center bg-white rounded-xl px-3 py-3">
                  <div class="w-6 h-4 bg-red-500 mr-2 rounded-sm"></div>
                  <span class="text-gray-900 text-sm">+44</span>
                </div>
                <input
                  v-model="form.mobile"
                  type="tel"
                  placeholder="(565) 516-7391"
                  class="flex-1 h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
                  :disabled="isLoading"
                />
              </div>
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">
                Date of Birth
              </label>
              <input
                v-model="form.dateOfBirth"
                type="text"
                placeholder="10 October 1990"
                class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
                :disabled="isLoading"
              />
            </div>

            <!-- Postcode -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">
                Postcode
              </label>
              <div class="flex space-x-2">
                <input
                  v-model="form.postcode"
                  type="text"
                  placeholder="LE2 7"
                  class="flex-1 h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua"
                  :disabled="isLoading"
                />
                <button
                  @click="searchAddress"
                  class="h-12 px-6 bg-gray-800 text-white rounded-xl hover:bg-gray-700 font-medium"
                  :disabled="searchingAddress"
                >
                  Search
                </button>
              </div>
            </div>

            <!-- Address (if found) -->
            <div v-if="selectedAddress" class="bg-white rounded-xl p-4">
              <div class="flex items-center justify-between">
                <div class="text-gray-900">
                  <p class="font-medium">{{ selectedAddress.line1 }}</p>
                  <p class="text-sm text-gray-600">
                    {{ selectedAddress.line2 }}
                  </p>
                </div>
                <button
                  @click="editAddress"
                  class="text-brand-aqua font-medium text-sm"
                >
                  Edit
                </button>
              </div>
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">
                Gender
              </label>
              <div class="flex space-x-2">
                <button
                  @click="form.gender = 'female'"
                  :class="
                    form.gender === 'female'
                      ? 'bg-brand-aqua text-white'
                      : 'bg-white text-gray-900'
                  "
                  class="flex-1 h-12 rounded-xl font-medium transition-colors"
                >
                  Female
                </button>
                <button
                  @click="form.gender = 'male'"
                  :class="
                    form.gender === 'male'
                      ? 'bg-brand-aqua text-white'
                      : 'bg-white text-gray-900'
                  "
                  class="flex-1 h-12 rounded-xl font-medium transition-colors"
                >
                  Male
                </button>
                <button
                  @click="form.gender = 'other'"
                  :class="
                    form.gender === 'other'
                      ? 'bg-brand-aqua text-white'
                      : 'bg-white text-gray-900'
                  "
                  class="flex-1 h-12 rounded-xl font-medium transition-colors"
                >
                  Other
                </button>
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••••••"
                  class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 pr-12 border-0 focus:ring-2 focus:ring-brand-aqua"
                  :disabled="isLoading"
                />
                <button
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <Icon
                    :name="
                      showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'
                    "
                    class="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div class="relative">
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="••••••••••••"
                  class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 pr-12 border-0 focus:ring-2 focus:ring-brand-aqua"
                  :disabled="isLoading"
                />
                <button
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <Icon
                    :name="
                      showConfirmPassword
                        ? 'i-heroicons-eye-slash'
                        : 'i-heroicons-eye'
                    "
                    class="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <!-- Continue Button -->
            <div class="pt-4">
              <button
                @click="handleSubmit"
                class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-17-medium rounded-xl transition-colors"
              >
                {{ isLoading ? 'Creating...' : 'Continue' }}
              </button>
            </div>

            <!-- :disabled="!isFormValid || isLoading" -->
          </div>
        </div>
      </main>
    </div>

    <!-- Address Search Modal -->
    <div
      v-if="showAddressModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">
            Search results for {{ form.postcode }}
          </h3>
          <button @click="showAddressModal = false" class="text-gray-500">
            <Icon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="address in addressResults"
            :key="address.id"
            @click="selectAddress(address)"
            class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <p class="font-medium">{{ address.line1 }}</p>
            <p class="text-sm text-gray-600">{{ address.line2 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms Modal -->
    <div
      v-if="showTermsModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-xl p-6 w-full max-w-sm max-h-96 overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Terms and Conditions</h3>
          <button @click="showTermsModal = false" class="text-gray-500">
            <Icon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4 text-sm">
          <div>
            <h4 class="font-semibold mb-2">Terms of Business</h4>
            <p class="text-gray-600 mb-2">Last updated: 4th July 2025</p>
          </div>

          <div>
            <h4 class="font-semibold mb-2">1. Introduction</h4>
            <p class="text-gray-600">
              Welcome to OpenProperty and UmovingU. These Terms of Business
              ("Terms") govern your use of our websites, mobile applications,
              and related services (collectively, "Services"). By using our
              Services, you agree to be bound by these Terms.
            </p>
          </div>

          <div>
            <h4 class="font-semibold mb-2">2. Our Services</h4>
            <p class="text-gray-600">
              OpenProperty provides digital infrastructure and tools for
              managing, sharing, and accessing property-related information.
              UmovingU is a consumer-focused application that helps users
              prepare their property data for transactions.
            </p>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="acceptTerms"
            class="bg-brand-aqua text-white px-6 py-2 rounded-lg font-medium"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Create Account - UmovingU',
})

// Get email from query params if available (SSR-safe)
const route = useRoute()
const prefilledEmail = computed(() => {
  if (process.client) {
    return route.query.email || ''
  }
  return ''
})

// Form data
const form = ref({
  firstName: '',
  lastName: '',
  mobile: '',
  dateOfBirth: '',
  postcode: '',
  gender: '',
  password: '',
  confirmPassword: '',
  email: '', // Initialize as empty, will be set in onMounted
})

const isLoading = ref(false)
const searchingAddress = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showAddressModal = ref(false)
const showTermsModal = ref(false)
const selectedAddress = ref(null)
const addressResults = ref([])

// Computed
const isFormValid = computed(() => {
  return (
    form.value.firstName &&
    form.value.lastName &&
    form.value.mobile &&
    form.value.dateOfBirth &&
    form.value.postcode &&
    form.value.gender &&
    form.value.password &&
    form.value.confirmPassword &&
    form.value.password === form.value.confirmPassword
  )
})

// Add this onMounted hook to set the email after hydration
onMounted(() => {
  if (route?.query?.email) {
    form.value.email = route.query.email;
  }
})

// Methods
const searchAddress = async () => {
  if (!form.value.postcode) return

  searchingAddress.value = true

  try {
    // Mock address search
    await new Promise((resolve) => setTimeout(resolve, 1000))

    addressResults.value = [
      {
        id: 1,
        line1: '244, St. Martins Street, Leicester LE2 7JD',
        line2: 'Leicester, England',
      },
      {
        id: 2,
        line1: '245, St. Martins Street, Leicester LE2 7JD',
        line2: 'Leicester, England',
      },
      {
        id: 3,
        line1: '246, St. Martins Street, Leicester LE2 7JD',
        line2: 'Leicester, England',
      },
    ]

    showAddressModal.value = true
  } catch (error) {
    console.error('Address search failed:', error)
  } finally {
    searchingAddress.value = false
  }
}

const selectAddress = (address) => {
  selectedAddress.value = address
  showAddressModal.value = false
}

const editAddress = () => {
  selectedAddress.value = null
}

const acceptTerms = () => {
  showTermsModal.value = false
}

const handleSubmit = async () => {
  console.log('Submitting form:', form.value)
  showTermsModal.value = true
  // if (!isFormValid.value) return

  // isLoading.value = true

  // try {
  //   const { data } = await $fetch('/api/auth/register', {
  //     method: 'POST',
  //     body: {
  //       ...form.value,
  //       address: selectedAddress.value,
  //     },
  //   })

  //   await navigateTo('/thank-you')
  // } catch (error) {
  //   console.error('Registration failed:', error)
  // } finally {
  //   isLoading.value = false
  // }
}
</script>
