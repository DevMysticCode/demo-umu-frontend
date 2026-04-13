import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from 'nuxt/app'
import { useAuth } from '~/composables/useAuth'
import { useSession } from '~/composables/useSession'
import { toTitleCase } from '~/utils/form-helpres'

interface Address {
  id: number
  line1: string
  line2: string
  postcode?: string
}

export const useCreateAccountData = () => {
  const config = useRuntimeConfig()
  const { register } = useAuth()
  const { email } = useSession()

  // ✅ Form state
  const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
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

  const searchAddress = async (postcode?: string): Promise<void> => {
    const query = (postcode ?? form.postcode ?? '').trim()
    if (!query || query.length < 2) return

    const base = config.public.apiBase
    searchingAddress.value = true
    try {
      const res = await $fetch<{ items: any[]; total: number }>(
        `${base}/property/search?q=${encodeURIComponent(query)}&offset=0&limit=25`,
      )
      if (!res.items?.length) {
        addressResults.value = []
        showAddressModal.value = true
        return
      }
      addressResults.value = res.items.map((p, i) => ({
        id: i + 1,
        line1: toTitleCase(p.addressLine1),
        line2: [p.city, p.postcode].filter(Boolean).map(toTitleCase).join(', '),
        postcode: p.postcode,
      }))
      // Store last searched postcode on the form so the modal title is correct
      form.postcode = query
      showAddressModal.value = true
    } catch (err) {
      console.error('Address search error:', err)
    } finally {
      searchingAddress.value = false
    }
  }

  const selectAddress = (address: Address): void => {
    selectedAddress.value = address
    // Store the actual postcode (from real API data) so it's submitted to the register endpoint
    form.postcode = address.postcode ?? address.line1
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
    console.log('form submitted: ', form)

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
      const response = await register({
        email: email.value,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.mobile,
        dob: form.dateOfBirth,
        postcode: form.postcode,
        gender: form.gender,
        password: form.password,
      })
      console.log('Registration successful:', response)

      // Store token in localStorage for automatic login
      if (response.token) {
        localStorage.setItem('token', response.token)
      }

      await navigateTo('/onboarding/thank-you')
    } catch (err) {
      console.error('Registration failed:', err)

      alert(err?.data?.message || 'Registration failed')
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


