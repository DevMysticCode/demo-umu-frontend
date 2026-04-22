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

      <div class="create-account-content">
        <!-- Form -->
        <form @submit.prevent="handleSubmit">
          <!-- First Name -->
          <FormInput
            v-model="form.firstName"
            name="firstName"
            label="First Name"
            required
          />

          <!-- Last Name -->
          <FormInput
            v-model="form.lastName"
            name="lastName"
            label="Last Name"
            required
          />

          <!-- Mobile -->
          <FormInput
            v-model="form.mobile"
            name="mobile"
            type="tel"
            label="UK Mobile Number (+44)"
            placeholder="07123456789"
            required
          />

          <!-- DOB -->
          <FormInput
            v-model="form.dateOfBirth"
            name="dateOfBirth"
            type="date"
            label="Date of Birth"
            required
          />

          <!-- Address Search — inline PropertySearchInput dropdown -->
          <div class="address-search-block">
            <label class="address-search-label">Address <span class="req">*</span></label>
            <div v-if="selectedAddress" class="address-selected-row">
              <div class="address-selected-body">
                <div class="address-selected-line1">{{ selectedAddress.line1 }}</div>
                <div class="address-selected-line2">{{ selectedAddress.line2 }}</div>
              </div>
              <button type="button" class="address-edit-btn" @click="editAddress">Edit</button>
            </div>
            <PropertySearchInput
              v-else
              placeholder="Enter postcode or address"
              variant="light"
              @select="onAddressSelect"
            />
          </div>

          <!-- Gender Selection -->
          <GenderSelector
            v-model="form.gender"
            name="gender"
            label="Gender"
            required
          />

          <!-- Password Fields -->
          <PasswordInput
            v-model="form.password"
            name="password"
            label="Password"
            required
          />
          <PasswordInput
            v-model="form.confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            required
          />

          <!-- Terms Checkbox -->
          <div class="form-check mb-6">
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
            <ContinueButton
              type="submit"
              :disabled="isLoading"
              :text="isLoading ? 'Creating...' : 'Continue'"
            />
          </div>
        </form>
      </div>
    </main>

    <!-- Terms Modal -->
    <TermsModal
      :show="showTermsModal"
      @update:show="showTermsModal = $event"
      @accept="acceptTerms"
      @close="closeTermsModal"
    />
  </div>
</template>

<script setup lang="ts">
import { useCreateAccountData } from '@/composables/useCreateAccountData'
import FormInput from '@/components/form/FormInput.vue'
import PasswordInput from '@/components/form/PasswordInput.vue'
import GenderSelector from '@/components/form/GenderSelector.vue'
import TermsModal from '@/components/modals/TermsModal.vue'
import BackButton from '~/components/core/BackButton.vue'
import HeroSection from '@/components/HeroSection.vue'
import ContinueButton from '@/components/ContinueButton.vue'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'
import { toTitleCase } from '~/utils/form-helpres'

definePageMeta({
  title: 'Create Account - UmovingU',
  middleware: 'guest',
})

// Use the composable for all data and methods
const {
  form,
  isLoading,
  showTermsModal,
  selectedAddress,
  termsAccepted,
  handleTermsCheckbox,
  selectAddress,
  editAddress,
  acceptTerms,
  handleSubmit,
  openTermsModal,
  closeTermsModal,
} = useCreateAccountData()

function onAddressSelect(property: any) {
  selectAddress({
    id: 1,
    line1: toTitleCase(property.addressLine1 ?? ''),
    line2: [property.city ? toTitleCase(property.city) : null, property.postcode?.toUpperCase()]
      .filter(Boolean)
      .join(', '),
    postcode: property.postcode?.toUpperCase(),
  })
}
</script>

<style scoped>
/* Create Account Container */
.create-account-container {
  @apply min-h-screen bg-gray-50;
  max-width: 28rem;
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
  padding-top: 24px;
}

/* Form */
.create-account-form {
  @apply space-y-6 mt-6;
}

/* Address inline search */
.address-search-block {
  margin-bottom: 18px;
}
.address-search-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1f2024;
  margin-bottom: 6px;
}
.address-search-label .req {
  color: #ef4444;
}
.address-selected-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #eafaf9;
  border: 1.5px solid #b2e8e6;
  border-radius: 12px;
  padding: 12px 14px;
}
.address-selected-body {
  flex: 1;
  min-width: 0;
}
.address-selected-line1 {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.address-selected-line2 {
  font-size: 11.5px;
  color: #4a5568;
  margin-top: 2px;
}
.address-edit-btn {
  background: transparent;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
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

.form-check label {
  @apply text-gray-700;
}

.link {
  @apply text-brand-aqua font-medium hover:text-brand-aqua/80 transition-colors;
}
</style>
