<template>
  <div class="mobile-container gradient-bg backgound-image">
    <!-- Header -->
    <div class="relative z-10">
      <!-- Main Content -->
      <main class="pt-6 pb-8 px-6">
        <!-- Back Button -->
        <div class="mb-6">
          <BackButton />
        </div>
        <div class="space-y-6">
          <!-- Title -->
          <div>
            <h1 class="text-28-emphasized text-white mb-2">Create account</h1>
            <p class="text-16-medium text-white/70">
              Enter your details to get started
            </p>
          </div>

          <!-- Form -->
          <div class="space-y-5">
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
              <VueTelInput
                v-model="form.mobile"
                :disabled="isLoading"
                :inputoptions="{
                  inputClasses:
                    'w-full h-12 bg-white text-gray-900 rounded-xl px-4 border-0 focus:ring-2 focus:ring-brand-aqua',
                  showDialCode: true,
                }"
                class="w-full"
                :wrapper-options="{ wrapperClasses: 'rounded-xl' }"
              />
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-white text-sm font-medium mb-2">
                Date of Birth
              </label>
              <input
                v-model="form.dateOfBirth"
                type="date"
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
              <div class="relative">
                <input
                  v-model="form.postcode"
                  type="text"
                  placeholder="LE2 7"
                  class="w-full h-12 bg-white text-gray-900 rounded-xl px-4 pr-28 border-0 focus:ring-2 focus:ring-brand-aqua"
                  :disabled="isLoading"
                />
                <button
                  @click="searchAddress"
                  class="absolute top-1/2 right-2 -translate-y-1/2 h-9 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-medium flex items-center space-x-2 transition-colors disabled:opacity-60"
                  :disabled="searchingAddress"
                >
                  <!-- <Icon
                    name="i-heroicons-magnifying-glass"
                    class="w-5 h-5 mr-1"
                  /> -->
                  <img
                    src="/public/icons/searchButton.svg"
                    alt="Search Icon"
                    class="w-5 h-5 mr-1"
                  />
                  <span>Search</span>
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
        class="bg-white rounded-xl w-full max-w-sm flex flex-col relative"
        style="max-height: 24rem"
      >
        <!-- Close Button -->
        <button
          @click="showTermsModal = false"
          class="absolute top-4 right-4 text-gray-500 z-10"
          aria-label="Close"
        >
          <Icon name="i-heroicons-x-mark" class="w-6 h-6" />
        </button>

        <!-- Title -->
        <h3 class="text-lg font-semibold text-center mt-6 mb-2">
          Terms and Conditions
        </h3>

        <!-- Scrollable Terms Content -->
        <div class="flex-1 overflow-y-auto px-4">
          <div
            class="bg-white border border-gray-200 rounded-lg p-4 text-sm space-y-4"
          >
            <div>
              <h4 class="font-semibold mb-2">Terms of Business</h4>
              <p class="text-gray-600 mb-2">
                Last updated: <i>4th July 2025</i>
              </p>
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
        </div>

        <!-- Divider and Button (sticky/fixed at bottom of modal) -->
        <div class="mx-5 bg-white rounded-xl my-4">
          <div class="border-t border-gray-200"></div>
          <button
            @click="acceptTerms"
            class="w-full flex items-center justify-center gap-2 bg-brand-aqua text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-aqua/90 transition-colors"
          >
            <Icon name="i-heroicons-check" class="w-5 h-5" />
            I Agree
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VueTelInput } from 'vue3-tel-input'
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
    form.value.email = route.query.email
  }
})

// Methods
const searchAddress = async () => {
  if (!form.value.postcode) return

  console.log('Searching address for:', form.value.postcode)
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
  // showTermsModal.value = true
  // if (!isFormValid.value) return

  isLoading.value = true

  await navigateTo('/thank-you')

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

<style>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.vue-tel-input {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  background: transparent !important;
  width: 100% !important;
  display: flex !important;
  align-items: stretch !important;
}

.vue-tel-input .vti__dropdown {
  border-radius: 0.75rem 0 0 0.75rem !important; /* Only left corners */
  height: 3rem !important;
  background: #fff !important;
  border: 0 !important;
  box-shadow: none !important;
  align-items: center !important;
  display: flex !important;
  margin-right: 0 !important;
  padding-right: 0 !important;
}

.vue-tel-input .vti__input {
  height: 3rem !important;
  background: #fff !important;
  color: #1a202c !important;
  border-radius: 0 0.75rem 0.75rem 0 !important; /* Only right corners */
  padding-left: 1rem !important;
  padding-right: 1rem !important;
  border: 0 !important;
  box-shadow: none !important;
  font-size: 1rem !important;
  margin-left: 0 !important;
}

.vue-tel-input .vti__selected-flag {
  height: 3rem !important;
  display: flex !important;
  align-items: center !important;
}

.vue-tel-input .vti__dropdown.open,
.vue-tel-input .vti__dropdown:focus,
.vue-tel-input .vti__input:focus {
  outline: none !important;
  box-shadow: 0 0 0 2px #22d3ee !important;
  border: 0 !important;
}

.vue-tel-input .vti__dropdown,
.vue-tel-input .vti__input {
  border-right: 1px solid #e5e7eb !important; /* subtle divider */
}

.vue-tel-input .vti__input {
  border-right: none !important;
}

.vue-tel-input .vti__dropdown-list {
  border-radius: 0.75rem !important;
}

.vue-tel-input .vti__flag {
  margin-right: 0.5rem !important;
}

/* Remove any unwanted gap between dropdown and input */
.vue-tel-input .vti__dropdown {
  margin-right: 0 !important;
}
.vue-tel-input .vti__input {
  margin-left: 0 !important;
}
</style>
