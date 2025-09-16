<template>
  <div class="mobile-container create-account-container">
    <!-- Main Content -->
    <main class="create-account-main">
      <!-- Back Button -->
      <div class="create-account-header">
        <BackButton color="brand-aqua" />
      </div>

      <HeroSection
        iconName="create-account"
        iconClass="w-32 h-32"
        mainTitle="Create an account"
        subTitle="Enter your details to get started"
      />

      <div class="create-account-content" @submit.prevent="handleSubmit">
        <!-- Form -->
        <form
          class="
        "
          0
        >
          <!-- First Name -->
          <FormInput name="firstName" label="First Name" required />

          <!-- Last Name -->
          <FormInput name="lastName" label="Last Name" required />

          <!-- Mobile -->
          <FormInput
            name="mobile"
            type="tel"
            label="UK Mobile Number (+44)"
            placeholder="07123456789"
            required
          />

          <!-- DOB -->
          <FormInput
            name="dateOfBirth"
            type="date"
            label="Date of Birth"
            required
          />

          <!-- Address Search -->
          <AddressSearch
            name="postcode"
            label="Postcode"
            @search="searchAddress"
            :isSearching="searchingAddress"
            :selectedAddress="selectedAddress"
            @edit="editAddress"
            required
          />

          <!-- Gender Selection -->
          <GenderSelector name="gender" label="Gender" required />

          <!-- Password Fields -->
          <PasswordInput name="password" label="Password" required />
          <PasswordInput
            name="confirmPassword"
            label="Confirm Password"
            required
          />

          <!-- Terms Checkbox -->
          <div class="form-check">
            <label>
              <input
                type="checkbox"
                :checked="termsAccepted"
                @change="handleTermsCheckbox"
              />
              I agree to the
              <span class="link cursor-pointer" @click="openTermsModal"
                >terms and conditions</span
              >
            </label>
          </div>

          <!-- Submit Button -->
          <div class="create-account-submit">
            <button
              type="submit"
              class="create-account-submit__btn"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Creating...' : 'Continue' }}
            </button>
          </div>
        </form>
      </div>
    </main>

    <!-- Address Search Modal -->
    <AddressSearchModal
      :show="showAddressModal"
      :postcode="form.postcode"
      :addresses="addressResults"
      @update:show="showAddressModal = $event"
      @select="selectAddress"
      @close="closeAddressModal"
    />

    <!-- Terms Modal -->
    <TermsModal
      :show="showTermsModal"
      @update:show="showTermsModal = $event"
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
  termsAccepted,
  handleTermsCheckbox,
  searchAddress,
  selectAddress,
  editAddress,
  acceptTerms,
  handleSubmit,
  openTermsModal,
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
