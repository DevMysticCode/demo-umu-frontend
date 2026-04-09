/**
 * Native auth via Capacitor plugins.
 * Only called when Capacitor.isNativePlatform() is true.
 * Web fallback stays in signin.vue (Apple JS SDK + Google GIS redirect).
 */

export const useNativeAuth = () => {
  const isNative = async (): Promise<boolean> => {
    try {
      const { Capacitor } = await import('@capacitor/core')
      return Capacitor.isNativePlatform()
    } catch {
      return false
    }
  }

  /**
   * Native Apple Sign In (uses ASAuthorizationAppleIDProvider).
   * Returns { idToken, firstName, lastName } — send idToken to backend.
   * Backend audience must include the Bundle ID: io.umovingu.app
   */
  const nativeAppleSignIn = async () => {
    const { SignInWithApple } = await import('@capacitor-community/apple-sign-in')
    const result = await SignInWithApple.authorize({
      clientId: 'io.umovingu.app',
      redirectURI: 'https://demo-umu-frontend.vercel.app/auth/apple/callback',
      scopes: 'email name',
      state: '',
      nonce: '',
    })
    return {
      idToken: result.response.identityToken,
      firstName: result.response.givenName ?? undefined,
      lastName: result.response.familyName ?? undefined,
    }
  }

  /**
   * Native Google Sign In (uses SFSafariViewController — Google-approved).
   * Returns the id_token — send to backend /auth/google as 'credential'.
   */
  const nativeGoogleSignIn = async () => {
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')
    await GoogleAuth.initialize()
    const result = await GoogleAuth.signIn()
    return result.authentication.idToken
  }

  return { isNative, nativeAppleSignIn, nativeGoogleSignIn }
}
