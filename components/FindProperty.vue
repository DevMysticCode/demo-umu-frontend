<template>
  <!-- Background Pattern -->
  <div class="find-property-container__background"></div>

  <div class="find-property-container mobile-container background-image">
    <div class="find-property-container__content">
      <!-- Header -->
      <div class="find-property-header">
        <h1 class="find-property-header__title">
          Find
          <span class="find-property-header__title-highlight">a property</span
          ><br />
          View
          <span class="find-property-header__title-highlight">a passport</span
          ><br />
          Tap
          <span class="find-property-header__title-highlight">an owner</span>
        </h1>
      </div>

      <!-- Search Bar -->
      <PropertySearchBar
        v-model="searchQuery"
        placeholder="Search Properties"
        :is-searching="isSearching"
        @search="searchProperties"
      />

      <!-- Info Cards -->
      <div class="info-cards">
        <InfoCard
          :current-step="currentStep"
          :total-steps="totalSteps"
          :can-go-prev="canGoPrev"
          :can-go-next="canGoNext"
          :is-highlighted="true"
          @prev="goToPrevStep"
          @next="goToNextStep"
        >
          {{ currentStepData.content }}
        </InfoCard>
      </div>
    </div>

    <!-- Universal Bottom Navigation -->
    <BottomNavigation active-tab="explore" @navigate="handleNavigation" />

    <!-- Search Results Modal -->
    <SearchResultsModal
      v-model="showSearchModal"
      :properties="searchResults"
      :selected-property-id="selectedPropertyId"
      @select="selectProperty"
      @continue="continueWithProperty"
      @close="closeSearchModal"
    />
  </div>
</template>

<script setup lang="ts">
import { useFindPropertyData } from '../composables/useFindPropertyData'
import PropertySearchBar from './find-property/PropertySearchBar.vue'
import InfoCard from './find-property/InfoCard.vue'
import SearchResultsModal from './find-property/SearchResultsModal.vue'
import BottomNavigation from './ui/BottomNavigation.vue'

const handleNavigation = (item: any) => {
  console.log('Navigate to:', item)
  // Handle navigation logic here
  // You can use router.push(item.route) if using Vue Router
}
// Use the composable for all data and methods
const {
  searchQuery,
  isSearching,
  showSearchModal,
  searchResults,
  selectedPropertyId,
  currentStep,
  totalSteps,
  currentStepData,
  canGoPrev,
  canGoNext,
  searchProperties,
  selectProperty,
  continueWithProperty,
  closeSearchModal,
  goToPrevStep,
  goToNextStep,
} = useFindPropertyData()
</script>
<style scoped>
/* Find Property Page Components CSS with BEM naming */

/* Main Container */
.find-property-container {
  @apply min-h-screen bg-gray-100 relative;
}

.find-property-container__background {
  /* @apply absolute inset-0 opacity-20; */
}

.background-image {
  background-image: url('/public/images/findPropertyBackground.png');
  background-size: cover;
  background-position: center;
  position: relative;
}
.find-property-container__content {
  @apply relative z-10 p-6 min-h-screen flex flex-col pb-20 justify-center;
}

/* Header */
.find-property-header {
  @apply mb-8;
}

.find-property-header__title {
  @apply text-3xl font-bold text-purple-500 leading-tight mb-6;
}

.find-property-header__title-highlight {
  @apply text-brand-aqua;
}

/* Info Cards */
.info-cards {
  @apply flex flex-col justify-center space-y-6;
}
</style>
