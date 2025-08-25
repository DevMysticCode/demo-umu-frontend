export const useCreateAccountData = () => {
  const route = useRoute()
  const prefilledEmail = route.query.email || ''

  // Form data
  const form = ref({
    firstName: '',
    lastName: '',
    mobile: '+44 1233456789',
    dateOfBirth: '',
    postcode: '',
    gender: '',
    password: '',
    confirmPassword: '',
    email: prefilledEmail,
  })

  // UI state
  const isLoading = ref(false)
  const searchingAddress = ref(false)
  const showAddressModal = ref(false)
  const showTermsModal = ref(false)
  const selectedAddress = ref(null)
  const addressResults = ref([])

  // Computed
  const isFormValid = computed(() => {
    console.log(
      'Validating form:',
      form.value,
      'Selected mobile:',
      form.value.mobile
    )
    return (
      form.value.firstName &&
      form.value.lastName &&
      form.value.mobile &&
      form.value.dateOfBirth &&
      form.value.postcode &&
      form.value.gender &&
      form.value.password &&
      form.value.confirmPassword &&
      form.value.password === form.value.confirmPassword &&
      selectedAddress.value // Address must be selected
    )
  })

  watch(
    () => form.value.mobile,
    (val) => {
      console.log('Mobile changed:', val)
    }
  )

  // Methods
  const searchAddress = async () => {
    console.log('Searching address for postcode:', form.value.postcode)
    if (!form.value.postcode) return

    searchingAddress.value = true

    try {
      // Mock address search - replace with real API call
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
      // Handle error - maybe show a toast notification
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
    // You might want to set a flag here to track that terms were accepted
  }

  const handleSubmit = async () => {
    if (!isFormValid.value) return

    isLoading.value = true

    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          ...form.value,
          address: selectedAddress.value,
          action: 'create_account',
        },
      })

      // Navigate to thank you page
      await navigateTo('/thank-you')
    } catch (error) {
      console.error('Registration failed:', error)
      // Handle error - show error message to user
    } finally {
      isLoading.value = false
    }
  }

  const closeAddressModal = () => {
    showAddressModal.value = false
  }

  const closeTermsModal = () => {
    showTermsModal.value = false
  }

  return {
    // Form data
    form,

    // UI state
    isLoading,
    searchingAddress,
    showAddressModal,
    showTermsModal,
    selectedAddress,
    addressResults,

    // Computed
    isFormValid,

    // Methods
    searchAddress,
    selectAddress,
    editAddress,
    acceptTerms,
    handleSubmit,
    closeAddressModal,
    closeTermsModal,
  }
}
