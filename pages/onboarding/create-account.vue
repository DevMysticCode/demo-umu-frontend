<template>
  <div class="mobile-container create-account-container">
    <!-- Main Content -->
    <main class="create-account-main">
      <!-- Back Button -->
      <div class="create-account-header">
        <BackButton />
      </div>

      <HeroSection
        iconName="create-account"
        iconClass="w-32 h-32"
        mainTitle="Create an account"
        subTitle="Enter your details to get started"
      />

      <div class="create-account-content" @submit.prevent="handleSubmit">
        <!-- Form -->
        <form class="create-account-form">
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
          <FormInput
            v-model="form.mobile"
            label="UK Mobile Number (+44)"
            type="tel"
            placeholder="07123456789"
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
              type="submit"
              class="create-account-submit__btn"
              :disabled="!isFormValid || isLoading"
            >
              {{ isLoading ? 'Creating...' : 'Continue' }}
            </button>
          </div>
        </form>
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
import { useCreateAccountData } from '@/composables/useCreateAccountData'
import FormInput from '@/components/form/FormInput.vue'
import PasswordInput from '@/components/form/PasswordInput.vue'
import GenderSelector from '@/components/form/GenderSelector.vue'
import AddressSearch from '@/components/form/AddressSearch.vue'
import AddressSearchModal from '@/components/modals/AddressSearchModal.vue'
import TermsModal from '@/components/modals/TermsModal.vue'
import BackButton from '@/components/BackButton.vue'
import HeroSection from '@/components/HeroSection.vue'

definePageMeta({
  title: 'Create Account - UmovingU',
})

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
</script>

<style scoped>
/* Create Account Container */
.create-account-container {
  @apply min-h-screen bg-gray-50;
  max-width: 428px;
  margin: 0 auto;
  background: linear-gradient(
    180deg,
    #f1f1f1 0%,
    #eff3f3 74.35%,
    #e6fbfa 99.53%
  );
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

/* Content */
.create-account-content {
  @apply flex-1 px-4 pb-8;
}

/* Form */
.create-account-form {
  @apply space-y-6 mt-6;
}

/* Submit */
.create-account-submit {
  @apply py-5 mb-8;
}

.create-account-submit__btn {
  @apply w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed;
}

.back_button {
  @apply text-black;
}
</style>
