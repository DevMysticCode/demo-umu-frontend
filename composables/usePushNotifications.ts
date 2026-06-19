import { Capacitor } from '@capacitor/core'
import {
  PushNotifications,
  type PushNotificationSchema,
  type ActionPerformed,
  type Token,
} from '@capacitor/push-notifications'

const PLATFORM_NAME = (): 'ios' | 'android' | 'web' => {
  const p = Capacitor.getPlatform()
  return p === 'ios' || p === 'android' ? p : 'web'
}

export const usePushNotifications = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase
  const router = useRouter()

  const sendTokenToBackend = async (token: string) => {
    const jwt = localStorage.getItem('token')
    if (!jwt) return
    try {
      await $fetch(`${base}/me/push-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
        body: { token, platform: PLATFORM_NAME() },
      })
    } catch (err) {
      console.warn('[push] failed to register token with backend', err)
    }
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
    await PushNotifications.removeAllListeners()
  }

  return { register, unregister }
}
