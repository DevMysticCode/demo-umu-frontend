export const useSession = () => {
  const email = useState<string>('umu-email', () => '')
  const pendingSignup = useState<{
    firstName: string
    lastName: string
    phone: string
    dob: string
    postcode: string
    gender: string
    password: string
  } | null>('umu-pending-signup', () => null)
  return { email, pendingSignup }
}
