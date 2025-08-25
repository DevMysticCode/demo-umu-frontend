<template>
  <div class="mobile-container backgound-image">
    <!-- Header with Back Button -->
    <main class="mobile-container__content">
      <div class="mobile-container__back">
        <BackButton />
      </div>

      <div class="mobile-container__form">
        <!-- Title Section -->
        <div class="mobile-container__header">
          <h1 class="mobile-container__title">Create account</h1>
          <p class="mobile-container__subtitle">
            Enter your details to get started
          </p>
        </div>

        <!-- Form Fields -->
        <div class="mobile-container__fields">
          <!-- Name Fields -->
          <FormInput
            v-model="form.firstName"
            label="First Name"
            placeholder="John"
            :disabled="isLoading"
          />

          <FormInput
            v-model="form.lastName"
            label="Last Name"
            placeholder="Smith"
            :disabled="isLoading"
          />

          <!-- Phone Input -->
          <PhoneInput
            v-model="form.mobile"
            label="Mobile Number"
            placeholder="(565) 516-7391"
            :disabled="isLoading"
          />

          <!-- Date of Birth -->
          <FormInput
            v-model="form.dateOfBirth"
            label="Date of Birth"
            placeholder="10 October 1990"
            type="date"
            :disabled="isLoading"
          />

          <!-- Address Search -->
          <AddressSearch
            v-model="form.postcode"
            label="Postcode"
            placeholder="LE2 7"
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
            placeholder="••••••••••••"
            :disabled="isLoading"
          />

          <PasswordInput
            v-model="form.confirmPassword"
            label="Confirm Password"
            placeholder="••••••••••••"
            :disabled="isLoading"
          />

          <!-- Submit Button -->
          <div class="mobile-container__submit">
            <button
              @click="handleSubmit"
              class="w-full h-12 bg-brand-aqua hover:bg-brand-aqua/90 text-white font-17-medium rounded-xl transition-colors"
              :class="{ 'form-button--disabled': !isFormValid || isLoading }"
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
@import '../assets/css/components.css';
</style>
