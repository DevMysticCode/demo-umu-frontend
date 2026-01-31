export const useSession = () => {
  const email = useState<string>('umu-email', () => '')
  return { email }
}
