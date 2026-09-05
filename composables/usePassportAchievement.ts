// Singleton reactive state for the PassportAchievement celebration —
// same idiom as useCustomToast.ts (module-level reactive() + exported
// functions), so <PassportAchievement /> can be mounted once in app.vue
// and triggered from anywhere without prop-drilling.
//
// Every rewardsService.award() call site on the backend is fire-and-forget
// from its HTTP response's perspective (a deliberate choice so a reward
// failure/latency never blocks the core action it's attached to), so the
// frontend can't learn about a new stamp from a response body — it has to
// ask. checkForCelebrations() is that ask; call it on app mount and on
// foreground-return.

export interface StampDefinitionData {
  id: string
  key: string
  title: string
  subtitle: string | null
  description: string | null
  checklistItems: string[] | null
  iconAsset: string | null
}

export interface UncelebratedStamp {
  id: string
  userId: string
  stampDefinitionId: string
  passportId: string | null
  propertyId: string | null
  awardedAt: string
  pointsAwarded: number | null
  celebratedAt: string | null
  stampDefinition: StampDefinitionData
}

const queue = ref<UncelebratedStamp[]>([])
const current = ref<UncelebratedStamp | null>(null)
const visible = ref(false)
// Balance snapshot so the component can animate old -> new. getBalance()
// already reflects the award (points are credited synchronously inside
// the same transaction that mints the stamp), so "before" is derived by
// subtracting this stamp's own points back out.
const balanceAfter = ref(0)
const checking = ref(false)

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function checkForCelebrations() {
  if (typeof window === 'undefined') return
  const token = localStorage.getItem('token')
  if (!token) return
  if (checking.value || visible.value) return
  checking.value = true
  try {
    const config = useRuntimeConfig()
    const headers = authHeaders()
    const [stamps, balance] = await Promise.all([
      $fetch<UncelebratedStamp[]>(`${config.public.apiBase}/rewards/stamps/uncelebrated`, { headers }),
      $fetch<{ balance: number }>(`${config.public.apiBase}/rewards/balance`, { headers }),
    ])
    balanceAfter.value = balance?.balance ?? 0
    if (stamps?.length) {
      queue.value = stamps
      showNext()
    }
  } catch {
    /* non-critical - celebration is a nice-to-have, never block the app */
  } finally {
    checking.value = false
  }
}

function showNext() {
  if (visible.value) return
  const next = queue.value.shift()
  if (!next) return
  current.value = next
  visible.value = true
}

const SIMULATED_ID = '__simulated__'

// TEMPORARY — lets a "Preview stamp" test button show the full celebration
// on demand without touching the database. Remove alongside that button
// once the real triggers are wired up and no longer need manual testing.
function simulateCelebration() {
  current.value = {
    id: SIMULATED_ID,
    userId: '',
    stampDefinitionId: SIMULATED_ID,
    passportId: null,
    propertyId: null,
    awardedAt: new Date().toISOString(),
    pointsAwarded: 500,
    celebratedAt: null,
    stampDefinition: {
      id: SIMULATED_ID,
      key: 'IDENTITY_VERIFIED',
      title: 'Identity Verified',
      subtitle: "You've confirmed who you are.",
      description:
        'Your identity has been securely verified, helping make your Property Passport trusted and ready for the next step.',
      checklistItems: ['Identity check complete'],
      iconAsset: '/op-icons/verify-identity/idCardChecked.png',
    },
  }
  balanceAfter.value = 1600
  visible.value = true
}

async function acknowledge() {
  const stamp = current.value
  visible.value = false
  current.value = null
  if (!stamp || stamp.id === SIMULATED_ID) return
  try {
    const config = useRuntimeConfig()
    await $fetch(`${config.public.apiBase}/rewards/stamps/${stamp.id}/celebrate`, {
      method: 'POST',
      headers: authHeaders(),
    })
  } catch {
    /* non-critical - worst case it re-celebrates next check */
  }
  // Small gap before the next queued celebration (if any) so they never
  // feel like they're stacking on top of each other.
  if (queue.value.length) {
    setTimeout(showNext, 500)
  }
}

// Stamps take priority over the section-complete screen — a page that's
// about to show section-complete should call this FIRST and await it, so
// any newly-earned stamp's celebration plays (and gets acknowledged) before
// section-complete appears, rather than the two racing based on whatever
// checkForCelebrations()'s poll timing happens to land.
async function waitForCelebrations(initialDelayMs = 600) {
  if (typeof window === 'undefined') return
  await new Promise((resolve) => setTimeout(resolve, initialDelayMs))
  await checkForCelebrations()
  if (!visible.value && !queue.value.length) return
  await new Promise<void>((resolve) => {
    const stop = watch(
      [visible, () => queue.value.length],
      ([v, qLen]) => {
        if (!v && qLen === 0) {
          stop()
          resolve()
        }
      },
    )
  })
}

export function usePassportAchievement() {
  return {
    current: readonly(current),
    visible: readonly(visible),
    balanceAfter: readonly(balanceAfter),
    checkForCelebrations,
    waitForCelebrations,
    acknowledge,
    simulateCelebration,
  }
}
