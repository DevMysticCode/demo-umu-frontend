<template>
  <div class="create-account-container">
    <!-- Main Content -->
    <main class="create-account-main">
      <!-- Back Button -->
      <div class="create-account-header">
        <BackButton />
      </div>

      <!-- Hero Image -->
      <div class="create-account-hero">
        <div class="create-account-hero__image">
          <img
            src="/public/images/createaccount.png"
            alt="Create account illustration"
            class="create-account-hero__img"
          />
        </div>
      </div>

      <div class="create-account-content">
        <!-- Title -->
        <div class="create-account-title">
          <h1 class="create-account-title__main">Create an account</h1>
          <p class="create-account-title__sub">
            Enter your details to get started
          </p>
        </div>

        <!-- Form -->
        <div class="create-account-form">
          <!-- First Name -->
          <FormInput
            v-model="form.firstName"
            label="First Name"
            placeholder=""
            :disabled="isLoading"
          />

          <!-- Last Name -->
          <FormInput
            v-model="form.lastName"
            label="Last Name"
            placeholder=""
            :disabled="isLoading"
          />

          <!-- Mobile Number -->
          <PhoneInput
            v-model="form.mobile"
            label="Mobile Number"
            placeholder="(000) 000-0000"
            :disabled="isLoading"
          />

          <!-- Date of Birth -->
          <FormInput
            v-model="form.dateOfBirth"
            label="Date of Birth"
            type="date"
            placeholder=""
            :disabled="isLoading"
          />

          <!-- Address Search -->
          <AddressSearch
            v-model="form.postcode"
            label="Postcode"
            placeholder=""
            :disabled="isLoading"
            :is-searching="searchingAddress"
            :selected-address="selectedAddress"
            @search="searchAddress"
            @edit="editAddress"
          />

          <!-- Gender Selection -->
          <GenderSelector v-model="form.gender" label="Gender" />

          <!-- Password Fields -->
          <PasswordInput
            v-model="form.password"
            label="Password"
            placeholder=""
            :disabled="isLoading"
          />

          <PasswordInput
            v-model="form.confirmPassword"
            label="Confirm Password"
            placeholder=""
            :disabled="isLoading"
          />

          <!-- Submit Button -->
          <div class="create-account-submit">
            <button
              @click="handleSubmit"
              class="create-account-submit__btn"
              :disabled="!isFormValid || isLoading"
            >
              {{ isLoading ? 'Creating...' : 'Continue' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Address Search Modal -->
    <AddressSearchModal
      v-model="showAddressModal"
      :postcode="form.postcode"
      :addresses="addressResults"
      @select="selectAddress"
      @close="closeAddressModal"
    />

    <!-- Terms Modal -->
    <TermsModal
      v-model="showTermsModal"
      @accept="acceptTerms"
      @close="closeTermsModal"
    />
  </div>
</template>

<script setup>
import { useCreateAccountData } from '../composables/useCreateAccountData'
import FormInput from './form/FormInput.vue'
import PasswordInput from './form/PasswordInput.vue'
import PhoneInput from './form/PhoneInput.vue'
import GenderSelector from './form/GenderSelector.vue'
import AddressSearch from './form/AddressSearch.vue'
import AddressSearchModal from './modals/AddressSearchModal.vue'
import TermsModal from './modals/TermsModal.vue'
import BackButton from './BackButton.vue'

// Use the composable for all data and methods
const {
  form,
  isLoading,
  searchingAddress,
  showAddressModal,
  showTermsModal,
  selectedAddress,
  addressResults,
  isFormValid,
  searchAddress,
  selectAddress,
  editAddress,
  acceptTerms,
  handleSubmit,
  closeAddressModal,
  closeTermsModal,
} = useCreateAccountData()

const goBack = () => {
  window.history.back()
}
</script>

<style scoped>
/* Create Account Container */
.create-account-container {
  @apply min-h-screen bg-gray-50;
  max-width: 428px;
  margin: 0 auto;
}

/* Main Content */
.create-account-main {
  @apply min-h-screen flex flex-col;
}

/* Header */
.create-account-header {
  @apply pt-4 px-6 pb-2;
}

.create-account-back {
  @apply text-brand-aqua flex items-center hover:text-brand-aqua/80 transition-colors;
}

/* Hero Section */
.create-account-hero {
  @apply flex justify-center py-6;
}

.create-account-hero__image {
  @apply w-24 h-24 relative;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: #f3f4f6;
}

.create-account-hero__img {
  @apply w-full h-full object-cover;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

/* Content */
.create-account-content {
  @apply flex-1 px-6 pb-8;
}

/* Title */
.create-account-title {
  @apply text-center mb-8;
}

.create-account-title__main {
  @apply text-[20px] font-bold text-gray-900 mb-0;
}

.create-account-title__sub {
  @apply text-[15px] text-gray-600;
}

/* Form */
.create-account-form {
  @apply space-y-6;
}

/* Submit */
.create-account-submit {
  @apply pt-4;
}

.create-account-submit__btn {
  @apply w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed;
}

.back_button {
  @apply text-black;
}
</style>
