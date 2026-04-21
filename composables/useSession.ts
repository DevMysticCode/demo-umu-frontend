export const useSession = () => {
  const email = useState<string>('umu-email', () => '')
  const pendingSignup = useState<{
    firstName: string
    lastName: string
    phone: string
    postcode: string
    password: string
  } | null>('umu-pending-signup', () => null)
  return { email, pendingSignup }
}
