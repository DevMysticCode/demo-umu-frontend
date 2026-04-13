/**
 * Composable for scheduling local device notifications via Capacitor.
 * Works on iOS and Android native builds. Silently no-ops on web/SSR.
 *
 * Usage:
 *   const { requestPermission, scheduleReminder, cancelReminder } = useLocalNotifications()
 *   await requestPermission()               // call once on first calendar open
 *   await scheduleReminder(reminder)        // after saving a reminder
 *   await cancelReminder(reminderId)        // after deleting a reminder
 */

export interface NotifReminder {
  id: string       // DB UUID
  title: string
  date: string     // "YYYY-MM-DD"
  time?: string | null  // "HH:MM" — if absent, defaults to 09:00
  notes?: string | null
}

/**
 * Convert a UUID string to a stable positive 32-bit integer for the Capacitor
 * notification ID (which must be a number).
 */
function uuidToNotifId(uuid: string): number {
  let hash = 5381
  for (let i = 0; i < uuid.length; i++) {
    hash = ((hash << 5) + hash) ^ uuid.charCodeAt(i)
    hash |= 0 // keep as 32-bit int
  }
  return Math.abs(hash)
}

export function useLocalNotifications() {
  const permissionGranted = ref(false)

  /**
   * Returns true when running in a Capacitor native shell (iOS/Android).
   * Always false on web — avoids importing Capacitor on SSR.
   */
  const isNative = (): boolean => {
    if (typeof window === 'undefined') return false
    try {
      // @ts-ignore
      return !!(window.Capacitor?.isNativePlatform?.())
    } catch {
      return false
    }
  }

  /**
   * Request notification permission from the OS.
   * Call this once when the calendar page mounts.
   * Returns true if granted, false otherwise.
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isNative()) return false
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const result = await LocalNotifications.requestPermissions()
      permissionGranted.value = result.display === 'granted'
      return permissionGranted.value
    } catch (err) {
      console.warn('[Notifications] requestPermissions failed:', err)
      return false
    }
  }

  /**
   * Check current permission status without prompting.
   */
  const checkPermission = async (): Promise<boolean> => {
    if (!isNative()) return false
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const result = await LocalNotifications.checkPermissions()
      permissionGranted.value = result.display === 'granted'
      return permissionGranted.value
    } catch {
      return false
    }
  }

  /**
   * Schedule a local notification for a reminder.
   * Silently skips if: not native, no permission, or date is in the past.
   */
  const scheduleReminder = async (reminder: NotifReminder): Promise<void> => {
    if (!isNative()) return
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')

      // Check permission — request if not yet asked
      const status = await LocalNotifications.checkPermissions()
      if (status.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions()
        if (req.display !== 'granted') return
      }

      // Build the scheduled date — use reminder time or default to 09:00
      const [year, month, day] = reminder.date.split('-').map(Number)
      let hours = 9, minutes = 0
      if (reminder.time) {
        const parts = reminder.time.split(':').map(Number)
        hours = parts[0]
        minutes = parts[1] ?? 0
      }
      const scheduledAt = new Date(year, month - 1, day, hours, minutes, 0)

      // Skip past reminders
      if (scheduledAt <= new Date()) return

      const notifId = uuidToNotifId(reminder.id)

      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title: reminder.title,
            body: reminder.notes?.trim() || 'You have a reminder today',
            schedule: { at: scheduledAt },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: { reminderId: reminder.id },
            smallIcon: 'ic_stat_notify',
            iconColor: '#00A19A',
          },
        ],
      })

      console.info(`[Notifications] Scheduled "${reminder.title}" for ${scheduledAt.toLocaleString()} (id=${notifId})`)
    } catch (err) {
      console.warn('[Notifications] scheduleReminder failed:', err)
    }
  }

  /**
   * Cancel a previously scheduled notification by reminder DB ID.
   * Call this when a reminder is deleted.
   */
  const cancelReminder = async (reminderId: string): Promise<void> => {
    if (!isNative()) return
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.cancel({
        notifications: [{ id: uuidToNotifId(reminderId) }],
      })
      console.info(`[Notifications] Cancelled notification for reminder ${reminderId}`)
    } catch (err) {
      console.warn('[Notifications] cancelReminder failed:', err)
    }
  }

  /**
   * Cancel all pending notifications for a list of reminder IDs.
   * Useful on sign-out or account deletion.
   */
  const cancelAll = async (reminderIds: string[]): Promise<void> => {
    if (!isNative() || reminderIds.length === 0) return
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.cancel({
        notifications: reminderIds.map((id) => ({ id: uuidToNotifId(id) })),
      })
    } catch (err) {
      console.warn('[Notifications] cancelAll failed:', err)
    }
  }

  return {
    permissionGranted: readonly(permissionGranted),
    requestPermission,
    checkPermission,
    scheduleReminder,
    cancelReminder,
    cancelAll,
  }
}
