import { ref, computed, watch, Ref } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from 'nuxt/app'

interface Address {
  id: number
  line1: string
  line2: string
}

interface FormData {
  firstName: string
  lastName: string
  mobile: string
  dateOfBirth: string
  postcode: string
  gender: string
  password: string
  confirmPassword: string
  email: string
}

export const useCreateAccountData = () => {
  const route = useRoute()
  const prefilledEmail = (route.query.email as string) || ''

  // Form data
  const form = ref<FormData>({
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
  const selectedAddress = ref<Address | null>(null)
  const addressResults = ref<Address[]>([])

  // Computed
  const isFormValid = computed<boolean>(() => {
    return (
      !!form.value.firstName &&
      !!form.value.lastName &&
      !!form.value.mobile &&
      !!form.value.dateOfBirth &&
      !!form.value.postcode &&
      !!form.value.gender &&
      !!form.value.password &&
      !!form.value.confirmPassword &&
      form.value.password === form.value.confirmPassword &&
      !!selectedAddress.value
    )
  })

  watch(
    () => form.value.mobile,
    (val) => {
      console.log('Mobile changed:', val)
    }
  )

  // Methods
  const searchAddress = async (): Promise<void> => {
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
    } finally {
      searchingAddress.value = false
    }
  }

  const selectAddress = (address: Address): void => {
    selectedAddress.value = address
    showAddressModal.value = false
  }

  const editAddress = (): void => {
    selectedAddress.value = null
  }

  const acceptTerms = (): void => {
    showTermsModal.value = false
  }

  const handleSubmit = async (): Promise<void> => {
    if (!isFormValid.value) return

    isLoading.value = true

    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: {
          ...form.value,
          address: selectedAddress.value,
          action: 'create_account',
        },
      })

      await navigateTo('/thank-you')
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      isLoading.value = false
    }
  }

  const closeAddressModal = (): void => {
    showAddressModal.value = false
  }

  const closeTermsModal = (): void => {
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
