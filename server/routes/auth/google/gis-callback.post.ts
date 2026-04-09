import { readBody, sendRedirect } from 'h3'

/**
 * Receives Google Identity Services POST when ux_mode='redirect'.
 * Google sends: credential (id_token JWT), g_csrf_token
 * We forward the credential to our backend, get a JWT, then redirect
 * the client to /auth/google/callback?token=... where it's stored.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const credential: string = body?.credential ?? ''

  if (!credential) {
    return sendRedirect(event, '/onboarding/signin?error=google_failed', 302)
  }

  const config = useRuntimeConfig(event)
  const apiBase = config.public.apiBase as string

  try {
    const res = await $fetch<{ token: string }>(`${apiBase}/auth/google`, {
      method: 'POST',
      body: { credential },
    })

    const token = encodeURIComponent(res.token)
    const redirectPath = getCookie(event, 'redirectAfterLogin') ?? ''
    const next = redirectPath ? encodeURIComponent(redirectPath) : ''

    return sendRedirect(
      event,
      `/auth/google/callback?token=${token}${next ? `&next=${next}` : ''}`,
      302,
    )
  } catch (err) {
    console.error('[Google GIS callback] backend error:', err)
    return sendRedirect(event, '/onboarding/signin?error=google_failed', 302)
  }
})
