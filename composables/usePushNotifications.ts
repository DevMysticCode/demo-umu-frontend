import { Capacitor } from '@capacitor/core'
import {
  PushNotifications,
  type PushNotificationSchema,
  type ActionPerformed,
  type Token,
} from '@capacitor/push-notifications'

// localStorage key used to cache the FCM token across the
// registration-vs-login race. See sendTokenToBackend() below.
const PUSH_TOKEN_LS_KEY = 'umu.pushToken'

const PLATFORM_NAME = (): 'ios' | 'android' | 'web' => {
  const p = Capacitor.getPlatform()
  return p === 'ios' || p === 'android' ? p : 'web'
}

export const usePushNotifications = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const router = useRouter()

  // The registration -> backend round-trip has a race: on iOS the
  // 'registration' listener fires within ~1 second of app boot, well
  // before the user has signed in. We can't POST to /me/push-token
  // without a JWT, so we cache the token locally and try again on
  // every signin (via syncTokenAfterSignin) until backend accepts it.
  const sendTokenToBackend = async (token: string): Promise<boolean> => {
    if (token) localStorage.setItem(PUSH_TOKEN_LS_KEY, token)
    const jwt = localStorage.getItem('token')
    if (!jwt) return false
    try {
      await $fetch(`${base}/me/push-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
        body: { token, platform: PLATFORM_NAME() },
      })
      return true
    } catch (err) {
      console.warn('[push] failed to register token with backend', err)
      return false
    }
  }

  // Called from useAuth after a successful login. Picks up the
  // cached token (if registration already happened) and posts it now
  // that we have a JWT. No-op when there's no cached token (e.g.
  // running on web, or permission was denied).
  const syncTokenAfterSignin = async () => {
    const cached = localStorage.getItem(PUSH_TOKEN_LS_KEY)
    if (cached) await sendTokenToBackend(cached)
  }

  const handleNotificationTap = (action: ActionPerformed) => {
    const data = action.notification?.data ?? {}
    const kind = data.kind
    const passportId = data.passportId
    if (passportId && (kind === 'collaborator_invite' || kind === 'buyer_unlocked')) {
      router.push(`/passportview/${passportId}`)
    }
  }

  const register = async () => {
    if (!Capacitor.isNativePlatform()) return

    const perm = await PushNotifications.checkPermissions()
    let granted = perm.receive === 'granted'
    if (!granted) {
      const req = await PushNotifications.requestPermissions()
      granted = req.receive === 'granted'
    }
    if (!granted) {
      console.info('[push] permission denied')
      return
    }

    PushNotifications.addListener('registration', (t: Token) => {
      void sendTokenToBackend(t.value)
    })

    PushNotifications.addListener('registrationError', (err) => {
      console.warn('[push] registration error', err)
    })

    PushNotifications.addListener(
      'pushNotificationReceived',
      (_n: PushNotificationSchema) => {
        // Foreground delivery — iOS suppresses the banner by default
        // when the app is open. Nothing to do for v1; we could surface
        // a toast here if product asks.
      },
    )

    PushNotifications.addListener('pushNotificationActionPerformed', handleNotificationTap)

    await PushNotifications.register()
  }

  const unregister = async () => {
    if (!Capacitor.isNativePlatform()) return
    localStorage.removeItem(PUSH_TOKEN_LS_KEY)
    await PushNotifications.removeAllListeners()
  }

  return { register, unregister, syncTokenAfterSignin }
}
