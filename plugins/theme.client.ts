// Initialise the saved theme as early as possible (client-only) so the
// `dark` class is on <html> before any page renders.
export default defineNuxtPlugin(() => {
  const { init } = useTheme()
  init()
})
