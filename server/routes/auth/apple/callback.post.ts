import { readBody, sendRedirect } from 'h3'

/**
 * Receives Apple's POST redirect, extracts the id_token and optional user,
 * then redirects to the client-side callback page with the data as query params.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const idToken: string = body?.id_token ?? ''
  const user: string = body?.user ? encodeURIComponent(body.user) : ''

  if (!idToken) {
    return sendRedirect(event, '/onboarding/signin?error=apple_failed', 302)
  }

  const params = new URLSearchParams({ id_token: idToken })
  if (user) params.set('user', user)

  return sendRedirect(event, `/auth/apple/callback?${params.toString()}`, 302)
})
