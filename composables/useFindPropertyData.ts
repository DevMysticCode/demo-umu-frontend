import { ref, computed } from 'vue'

// Types
interface Property {
  id: number
  address: string
}

interface InfoStep {
  id: number
  content: string
}

export const useFindPropertyData = () => {
  // Search state
  const searchQuery = ref<string>('')
  const isSearching = ref<boolean>(false)
  const showSearchModal = ref<boolean>(false)
  const searchResults = ref<Property[]>([])
  const selectedPropertyId = ref<number | null>(null)

  // Info cards state
  const currentStep = ref<number>(1)
  const totalSteps = 5

  // Info steps data
  const infoSteps: InfoStep[] = [
    {
      id: 1,
      content:
        'Speed up your buying search by checking important property info, certificates, deeds, and other docs confirmed by the home owner.',
    },
    {
      id: 2,
      content:
        'Speed up your sale close by adding important info to your Property Passport ahead of time. Share access with a partner or agent to see docs in one space.',
    },
    {
      id: 3,
      content:
        'See your Passport progress. Multi home owners can switch between multiple Property Passports.',
    },
    {
      id: 4,
      content:
        'Need help with a job? Search and schedule Providers & Providers near you to help certify & complete work around the house.',
    },
    {
      id: 5,
      content:
        'In the More tab, view important regular reminders in your calendar, saved posts and help center.',
    },
  ]

  // Computed
  const currentStepData = computed<InfoStep>(() => {
    return (
      infoSteps.find((step) => step.id === currentStep.value) || infoSteps[0]
    )
  })

  const selectedProperty = computed<Property | null>(() => {
    return (
      searchResults.value.find((p) => p.id === selectedPropertyId.value) || null
    )
  })

  const canGoPrev = computed<boolean>(() => {
    return currentStep.value > 1
  })

  const canGoNext = computed<boolean>(() => {
    return currentStep.value < totalSteps
  })

  // Methods
  const searchProperties = async (): Promise<void> => {
    if (!searchQuery.value.trim()) return

    isSearching.value = true

    try {
      // Mock API call - replace with real API
      await new Promise<void>((resolve) => setTimeout(resolve, 1000))

      // Mock search results based on query
      const mockResults: Property[] = [
        { id: 15, address: '15, Rochester Road, Coventry, CV5 6AB' },
        { id: 16, address: '16, Rochester Road, Coventry, CV5 6AB' },
        { id: 17, address: '17, Rochester Road, Coventry, CV5 6AB' },
        { id: 18, address: '18, Rochester Road, Coventry, CV5 6AB' },
        { id: 19, address: '19, Rochester Road, Coventry, CV5 6AB' },
        { id: 20, address: '20, Rochester Road, Coventry, CV5 6AB' },
        { id: 21, address: '21, Rochester Road, Coventry, CV5 6AB' },
        { id: 22, address: '22, Rochester Road, Coventry, CV5 6AB' },
      ]

      searchResults.value = mockResults
      showSearchModal.value = true
    } catch (error) {
      console.error('Property search failed:', error)
      // Handle error - maybe show a toast notification
    } finally {
      isSearching.value = false
    }
  }

  const selectProperty = (property: Property): void => {
    selectedPropertyId.value = property.id
  }

  const continueWithProperty = (property: Property): void => {
    console.log('Selected property:', property)
    showSearchModal.value = false
    // Navigate to next page or handle the selection
    // await navigateTo('/property-details')
  }

  const closeSearchModal = (): void => {
    showSearchModal.value = false
    selectedPropertyId.value = null
  }

  const goToPrevStep = (): void => {
    if (canGoPrev.value) {
      currentStep.value--
    }
  }

  const goToNextStep = (): void => {
    if (canGoNext.value) {
      currentStep.value++
    }
  }

  return {
    // Search state
    searchQuery,
    isSearching,
    showSearchModal,
    searchResults,
    selectedPropertyId,

    // Info cards state
    currentStep,
    totalSteps,

    // Computed
    currentStepData,
    selectedProperty,
    canGoPrev,
    canGoNext,

    // Methods
    searchProperties,
    selectProperty,
    continueWithProperty,
    closeSearchModal,
    goToPrevStep,
    goToNextStep,
  }
}
