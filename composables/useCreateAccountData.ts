import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from 'nuxt/app'

interface Address {
  id: number
  line1: string
  line2: string
}

export const useCreateAccountData = () => {
  const route = useRoute()
  const prefilledEmail = (route.query.email as string) || ''

  // ✅ Form state
  const form = reactive({
    firstName: '',
    lastName: '',
    email: prefilledEmail,
    mobile: '',
    dateOfBirth: '',
    postcode: '', // <-- important
    gender: '',
    password: '',
    confirmPassword: '',
  })

  // UI state only
  const isLoading = ref(false)
  const searchingAddress = ref(false)
  const showAddressModal = ref(false)
  const showTermsModal = ref(false)
  const selectedAddress = ref<Address | null>(null)
  const addressResults = ref<Address[]>([])
  const termsAccepted = ref(false)

  const searchAddress = async (): Promise<void> => {
    searchingAddress.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // fake delay
      addressResults.value = [
        {
          id: 1,
          line1: '21 Rochester Road, Coventry, CV5 6AB',
          line2: 'Leicester, England',
        },
        {
          id: 2,
          line1: '23 Rochester Road, Coventry, CV5 6AB ',
          line2: 'Leicester, England',
        },
        {
          id: 3,
          line1: '25 Rochester Road, Coventry, CV5 6AB ',
          line2: 'Leicester, England',
        },
        {
          id: 4,
          line1: '27 Rochester Road, Coventry, CV5 6AB ',
          line2: 'Leicester, England',
        },
        {
          id: 5,
          line1: '29 Rochester Road, Coventry, CV5 6AB',
          line2: 'Leicester, England',
        },
        {
          id: 6,
          line1: '31 Rochester Road, Coventry, CV5 6AB ',
          line2: 'Leicester, England',
        },
        {
          id: 7,
          line1: '33 Rochester Road, Coventry, CV5 6AB ',
          line2: 'Leicester, England',
        },
        {
          id: 8,
          line1: '35 Rochester Road, Coventry, CV5 6AB ',
          line2: 'Leicester, England',
        },
      ]
      showAddressModal.value = true
    } finally {
      searchingAddress.value = false
    }
  }

  const selectAddress = (address: Address): void => {
    selectedAddress.value = address
    form.postcode = address.line1
    showAddressModal.value = false
  }

  const editAddress = (): void => {
    selectedAddress.value = null
    form.postcode = ''
  }

  const handleTermsCheckbox = (event: Event): void => {
    const checkbox = event.target as HTMLInputElement
    if (!checkbox.checked) {
      termsAccepted.value = false
    } else {
      // Only open modal if not already accepted
      if (!termsAccepted.value) {
        openTermsModal()
      }
    }
  }

  const acceptTerms = (): void => {
    termsAccepted.value = true
    showTermsModal.value = false
  }

  const openTermsModal = (): void => {
    console.log('openTermsModal')
    showTermsModal.value = true
    console.log('showTermsModal.value', showTermsModal.value)
  }

  const handleSubmit = async (event: Event): Promise<void> => {
    event.preventDefault()
    event.stopPropagation()

    // Field-level validation
    if (
      !form.firstName ||
      !form.lastName ||
      !form.mobile ||
      !form.dateOfBirth ||
      !form.gender
    ) {
      console.error('Please fill in all required fields')
      return
    }

    if (form.password !== form.confirmPassword) {
      console.error('Passwords do not match')
      return
    }

    if (!selectedAddress.value) {
      console.error('Address not selected')
      return
    }

    if (!termsAccepted.value) {
      console.error('You must agree to terms')
      return
    }

    isLoading.value = true
    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          ...form,
          address: selectedAddress.value,
          action: 'create_account',
        },
      })
      await navigateTo('/onboarding/thank-you')
    } catch (err) {
      console.error('Registration failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Form
    form,

    // UI state
    isLoading,
    searchingAddress,
    showAddressModal,
    showTermsModal,
    selectedAddress,
    addressResults,
    termsAccepted,

    // Methods
    searchAddress,
    selectAddress,
    editAddress,
    acceptTerms,
    handleSubmit,
    openTermsModal,
    handleTermsCheckbox,
    closeAddressModal: () => (showAddressModal.value = false),
    closeTermsModal: () => (showTermsModal.value = false),
  }
}
