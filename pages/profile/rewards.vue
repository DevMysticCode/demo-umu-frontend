<template>
  <div class="rw-page mobile-container">
    <!-- Nav bar -->
    <div class="rw-nav-bar">
      <button class="rw-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="rw-nav-title">Rewards</div>
      <div style="width: 38px" />
    </div>

    <main class="rw-body">
      <div class="atm-bg teal" />

      <!-- Hero -->
      <div class="rw-hero">
        <UserAvatar
          :src="profile?.avatarUrl"
          :firstName="profile?.firstName"
          :lastName="profile?.lastName"
          :size="80"
        />
        <div class="rw-hero-name">{{ fullName || 'Your account' }}</div>
        <div class="rw-hero-role">
          {{ hasPassport ? 'Property Passport Member' : 'UMU Member' }}
        </div>
      </div>
      <div class="rw-stat-card">
        <div class="rw-stat">
          <img src="/op-icons/profile/passportPoints.png" alt="" class="rw-stat-ic" loading="lazy" />
          <div>
            <div v-if="loadingBalance" class="rw-stat-skel" />
            <div v-else class="rw-stat-num">{{ balance.toLocaleString('en-GB') }}</div>
            <div class="rw-stat-lab">Passport Points</div>
          </div>
        </div>
        <div class="rw-stat-divider" />
        <div class="rw-stat">
          <img src="/op-icons/profile/rewardsReady.png" alt="" class="rw-stat-ic" loading="lazy" />
          <div>
            <div v-if="loadingCatalogue" class="rw-stat-skel" />
            <div v-else class="rw-stat-num">{{ rewardsReadyCount }}</div>
            <div class="rw-stat-lab">rewards ready</div>
          </div>
        </div>
      </div>

      <div v-if="!loadingCatalogue && nextReward" class="rw-progress-card">
        <div class="rw-progress-lab">{{ pointsToNext.toLocaleString('en-GB') }} points</div>
        <div class="rw-progress-sub">to your next reward</div>
        <div class="rw-progress-track">
          <div class="rw-progress-fill" :style="{ width: `${nextRewardProgressPct}%` }" />
        </div>
      </div>

      <div class="rw-launch-card">
        <img src="/op-icons/misc/rocket.png" alt="" class="rw-launch-ic" loading="lazy" />
        <div>
          <div class="rw-launch-title">Marketplace launching soon</div>
          <p class="rw-launch-sub">
            Your rewards are being unlocked now and will be ready to claim
            when the marketplace goes live.
          </p>
        </div>
      </div>

      <div v-if="loadingCatalogue" class="rw-loading">
        <div class="rw-spinner" />
      </div>

      <template v-else>
        <div v-if="readyRewards.length" class="rw-sec-row">
          <div class="rw-sec-title">Rewards waiting for you</div>
        </div>
        <div v-if="readyRewards.length" class="rw-cards-grid">
          <div v-for="item in readyRewards" :key="item.id" class="rw-reward-card">
            <div class="rw-reward-tile" :style="{ background: tileBackground(item) }">
              <img v-if="tileIcon(item)" :src="tileIcon(item)" alt="" class="rw-reward-tile-img" loading="lazy" />
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
                <rect x="3" y="9" width="14" height="10" rx="1.5" />
                <path d="M17 12h3.2a1 1 0 0 1 .9.55L23 16v3a1 1 0 0 1-1 1h-1" />
                <circle cx="7.5" cy="19" r="1.6" />
                <circle cx="17.5" cy="19" r="1.6" />
              </svg>
            </div>
            <div class="rw-reward-title">{{ item.title }}</div>
            <span class="rw-reward-pill rw-reward-pill--unlocked">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="11" height="11"><polyline points="20 6 9 17 4 12" /></svg>
              Unlocked
            </span>
            <div class="rw-reward-note">{{ item.description || 'Available at launch.' }}</div>
          </div>
        </div>

        <div v-if="lockedRewards.length" class="rw-sec-row">
          <div class="rw-sec-title">More rewards to unlock</div>
        </div>
        <div v-if="lockedRewards.length" class="rw-cards-grid">
          <div v-for="item in lockedRewards" :key="item.id" class="rw-reward-card rw-reward-card--locked">
            <div class="rw-reward-tile rw-reward-tile--locked">
              <img v-if="tileIcon(item)" :src="tileIcon(item)" alt="" class="rw-reward-tile-img rw-reward-tile-img--locked" loading="lazy" />
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="26" height="26">
                <rect x="3" y="9" width="14" height="10" rx="1.5" />
                <path d="M17 12h3.2a1 1 0 0 1 .9.55L23 16v3a1 1 0 0 1-1 1h-1" />
                <circle cx="7.5" cy="19" r="1.6" />
                <circle cx="17.5" cy="19" r="1.6" />
              </svg>
              <div class="rw-reward-tile-lock">
                <img src="/op-icons/passportview/pointsLock.svg" alt="" width="12" height="15" />
              </div>
            </div>
            <div class="rw-reward-title">{{ item.title }}</div>
            <div class="rw-reward-note">Unlock at {{ item.pointsRequired.toLocaleString('en-GB') }} points</div>
          </div>
        </div>

        <div v-if="!readyRewards.length && !lockedRewards.length" class="rw-empty">
          <div class="rw-empty-ic">🎁</div>
          <div class="rw-empty-title">Rewards catalogue coming soon</div>
          <p class="rw-empty-sub">Keep earning points — offers will appear here.</p>
        </div>
      </template>

      <div class="rw-sec-row">
        <div class="rw-sec-title">History</div>
      </div>

      <div v-if="loadingPreview && previewEntries.length === 0" class="rw-loading">
        <div class="rw-spinner" />
      </div>

      <div v-else-if="previewEntries.length === 0" class="rw-empty">
        <div class="rw-empty-ic">🎁</div>
        <div class="rw-empty-title">No points yet</div>
        <p class="rw-empty-sub">Complete useful steps — like verifying your identity or claiming a property — to start earning.</p>
      </div>

      <div v-else class="rw-list">
        <RewardHistoryRow v-for="entry in previewEntries" :key="entry.id" :entry="entry" />

        <button v-if="previewNextCursor" class="rw-loadmore" @click="openHistoryDrawer">
          See full history
        </button>
      </div>
    </main>

    <!-- Full history drawer -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="historyDrawerOpen" class="rw-drawer-overlay" @click.self="historyDrawerOpen = false">
          <div class="rw-drawer">
            <div class="rw-drawer-handle" />
            <div class="rw-drawer-header">
              <h2 class="rw-drawer-title">Full history</h2>
              <button class="rw-drawer-close" aria-label="Close" @click="historyDrawerOpen = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#666" stroke-width="2" stroke-linecap="round" /></svg>
              </button>
            </div>
            <div class="rw-drawer-body">
              <div v-if="loadingHistory && entries.length === 0" class="rw-loading">
                <div class="rw-spinner" />
              </div>
              <div v-else class="rw-list">
                <RewardHistoryRow v-for="entry in entries" :key="entry.id" :entry="entry" />
                <button v-if="nextCursor" class="rw-loadmore" :disabled="loadingHistory" @click="loadMore">
                  {{ loadingHistory ? 'Loading…' : 'Load more' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <BottomNav active="rewards" />
  </div>
</template>

<script setup lang="ts">
import RewardHistoryRow from '~/components/profile/RewardHistoryRow.vue'
import UserAvatar from '~/components/ui/UserAvatar.vue'
import BottomNav from '~/components/core/BottomNav.vue'

const config = useRuntimeConfig()
const goBack = useGoBack('/profile')
const { profile, fullName, fetchProfile } = useProfile()

const balance = ref(0)
const loadingBalance = ref(true)
const hasPassport = ref(false)

// Short inline preview (most-recent few) shown directly on the page.
const previewEntries = ref<any[]>([])
const previewNextCursor = ref<string | null>(null)
const loadingPreview = ref(true)
const PREVIEW_LIMIT = 5

// Full paginated list, lazily loaded the first time the drawer opens.
const entries = ref<any[]>([])
const nextCursor = ref<string | null>(null)
const loadingHistory = ref(true)
const historyDrawerOpen = ref(false)
const fullHistoryLoaded = ref(false)

interface CatalogueItem {
  id: string
  partner: string
  title: string
  description: string | null
  pointsRequired: number
}
const catalogue = ref<CatalogueItem[]>([])
const loadingCatalogue = ref(true)

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}
function authHeaders() {
  return { Authorization: `Bearer ${token()}` }
}

// Nothing is actually redeemable yet (no redemption backend) — "ready"
// here just means the balance already covers the points required, purely
// for the "N rewards ready" / "Unlocked" display the mockup shows.
const readyRewards = computed(() => catalogue.value.filter((c) => balance.value >= c.pointsRequired))
const lockedRewards = computed(() => catalogue.value.filter((c) => balance.value < c.pointsRequired))
const rewardsReadyCount = computed(() => readyRewards.value.length)
const nextReward = computed(() =>
  lockedRewards.value.length
    ? [...lockedRewards.value].sort((a, b) => a.pointsRequired - b.pointsRequired)[0]
    : null,
)
const pointsToNext = computed(() => (nextReward.value ? nextReward.value.pointsRequired - balance.value : 0))
const nextRewardProgressPct = computed(() => {
  if (!nextReward.value) return 100
  const prevThreshold = [...readyRewards.value].reduce((max, r) => Math.max(max, r.pointsRequired), 0)
  const span = nextReward.value.pointsRequired - prevThreshold
  if (span <= 0) return 0
  return Math.min(100, Math.max(0, Math.round(((balance.value - prevThreshold) / span) * 100)))
})

// Small deterministic palette so each partner tile gets a stable colour
// without needing real partner logo assets (mockup used stylised colour
// tiles, not photographic logos).
const PALETTE = [
  'linear-gradient(135deg, #231d45, #352d5c)',
  'linear-gradient(135deg, #00a19a, #00635e)',
  'linear-gradient(135deg, #c9974a, #9a6e2c)',
  'linear-gradient(135deg, #4a4566, #231d45)',
]
function tileBackground(item: CatalogueItem) {
  const idx = catalogue.value.findIndex((c) => c.id === item.id)
  return PALETTE[idx % PALETTE.length]
}

// Real icon assets matched by partner name (small, known seed set).
const TILE_ICON_BY_PARTNER: Record<string, string> = {
  'Todd & Co Solicitors': '/op-icons/buyer-profile-build/scales.png',
  'Broadband Partner': '/op-icons/property/broadband.jpeg',
  'Storage Partner': '/op-icons/misc/storageUnit.png',
  AnyVan: '/op-icons/misc/removalsVan.png',
}
function tileIcon(item: CatalogueItem) {
  return TILE_ICON_BY_PARTNER[item.partner] ?? null
}

async function loadBalance() {
  try {
    const res: any = await $fetch(`${config.public.apiBase}/rewards/balance`, { headers: authHeaders() })
    balance.value = res?.balance ?? 0
  } catch {
    /* stays at 0 */
  } finally {
    loadingBalance.value = false
  }
}

async function loadCatalogue() {
  try {
    const res: any = await $fetch(`${config.public.apiBase}/rewards/catalogue`, { headers: authHeaders() })
    catalogue.value = Array.isArray(res) ? res : []
  } catch {
    /* catalogue just stays empty on failure */
  } finally {
    loadingCatalogue.value = false
  }
}

async function loadPreview() {
  loadingPreview.value = true
  try {
    const res: any = await $fetch(`${config.public.apiBase}/rewards/history`, {
      headers: authHeaders(),
      query: { limit: PREVIEW_LIMIT },
    })
    previewEntries.value = res?.entries ?? []
    previewNextCursor.value = res?.nextCursor ?? null
  } catch {
    /* preview just stays empty on failure */
  } finally {
    loadingPreview.value = false
  }
}

async function loadHistory(cursor?: string) {
  loadingHistory.value = true
  try {
    const res: any = await $fetch(`${config.public.apiBase}/rewards/history`, {
      headers: authHeaders(),
      query: { limit: 20, ...(cursor ? { cursor } : {}) },
    })
    entries.value = cursor ? [...entries.value, ...(res?.entries ?? [])] : (res?.entries ?? [])
    nextCursor.value = res?.nextCursor ?? null
  } catch {
    /* history just stays empty/stale on failure */
  } finally {
    loadingHistory.value = false
  }
}

// Full list is fetched lazily — no point paying for it until the user
// actually asks to see more than the inline preview.
function openHistoryDrawer() {
  historyDrawerOpen.value = true
  if (!fullHistoryLoaded.value) {
    fullHistoryLoaded.value = true
    loadHistory()
  }
}

async function loadPassportFlag() {
  try {
    const res: any = await $fetch(`${config.public.apiBase}/passport/my`, { headers: authHeaders() })
    hasPassport.value = Array.isArray(res) ? res.length > 0 : Array.isArray(res?.passports) && res.passports.length > 0
  } catch {
    /* stays false — falls back to generic "UMU Member" label */
  }
}

function loadMore() {
  if (nextCursor.value) loadHistory(nextCursor.value)
}

onMounted(() => {
  fetchProfile()
  loadBalance()
  loadCatalogue()
  loadPreview()
  loadPassportFlag()
})
</script>

<style scoped>
.rw-page { --navy: #231d45; --teal: #00a19a; --muted: #6e6879; --line: #e7e4ec; }

/* Nav bar — matches the rest of the profile section (transparent bar,
   plain navy back button, centered title) rather than a colour block. */
.rw-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.rw-nav-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--navy);
  flex-shrink: 0;
  transition: background 0.2s;
}
.rw-nav-icon-btn:hover { background: #f0f2f1; }
.rw-nav-icon-btn svg { width: 18px; height: 18px; }
.rw-nav-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.4px;
}

/* Bottom padding clears the fixed BottomNav + iPhone home-indicator safe
   area (same ~100px allowance explore.vue uses) so the history list can't
   be hidden behind the nav. */
.rw-body { padding: 0 16px calc(100px + env(safe-area-inset-bottom)); position: relative; }

.atm-bg { position: absolute; top: 0; left: 0; right: 0; height: 280px; pointer-events: none; z-index: 0; }
.atm-bg.teal { background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(0, 161, 154, 0.12), transparent 65%); }

.rw-hero { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px 0 22px; }
.rw-hero-name { font-size: 19px; font-weight: 800; color: var(--navy); letter-spacing: -0.3px; margin-top: 12px; }
.rw-hero-role { font-size: 13px; font-weight: 600; color: var(--teal); margin-top: 2px; }

.rw-stat-card { display: flex; align-items: center; background: #fff; border-radius: 20px; padding: 20px 18px; box-shadow: 0 14px 30px rgba(35, 29, 69, 0.16); }
.rw-stat { flex: 1; display: flex; align-items: center; gap: 12px; min-width: 0; }
.rw-stat-divider { width: 1px; align-self: stretch; background: var(--line); margin: 0 14px; }
.rw-stat-ic { width: 48px; height: 48px; object-fit: contain; flex-shrink: 0; }
.rw-stat-num { font-size: 24px; font-weight: 800; color: var(--navy); letter-spacing: -0.5px; line-height: 1.15; }
.rw-stat-skel { height: 24px; width: 60px; border-radius: 6px; background: var(--line); }
.rw-stat-lab { font-size: 12px; color: var(--muted); font-weight: 600; margin-top: 1px; }

.rw-progress-card { background: #fff; border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; margin-top: 12px; }
.rw-progress-lab { font-size: 15px; font-weight: 800; color: var(--navy); }
.rw-progress-sub { font-size: 12.5px; color: var(--muted); margin-top: 1px; }
.rw-progress-track { height: 8px; border-radius: 5px; background: var(--line); margin-top: 12px; overflow: hidden; }
.rw-progress-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, #00a19a, #00c2b8); transition: width 0.3s ease; }

.rw-launch-card { display: flex; align-items: center; gap: 14px; background: #eafaf7; border: 1px solid #cdeee8; border-radius: 20px; padding: 18px; margin-top: 14px; }
.rw-launch-ic { width: 64px; height: 64px; object-fit: contain; flex-shrink: 0; }
.rw-launch-title { font-size: 15px; font-weight: 800; color: var(--navy); }
.rw-launch-sub { font-size: 12.5px; color: var(--muted); line-height: 1.5; margin: 4px 0 0; }

.rw-sec-row { display: flex; align-items: center; justify-content: space-between; margin: 22px 4px 10px; }
.rw-sec-title { font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); }

.rw-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.rw-reward-card { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 12px; }
.rw-reward-tile { height: 92px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 12px; text-align: center; letter-spacing: 0.2px; overflow: hidden; }
/* The source icons are isometric renders with a lot of transparent margin
   baked in around the object (platform + breathing room) — at 1:1 scale
   they read as a small floating icon rather than a tile-filling image.
   Scaling up and letting overflow:hidden crop the excess margin makes the
   object itself fill most of the tile, closer to the mockup's wordmark
   tiles. */
.rw-reward-tile-img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.55); }
.rw-reward-tile-img--locked { filter: grayscale(1) opacity(0.55); }
.rw-reward-tile--locked { background: #f1eff5; color: var(--muted); position: relative; }
.rw-reward-tile-lock { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%; background: var(--navy); display: grid; place-items: center; }
.rw-reward-title { font-size: 13.5px; font-weight: 700; color: var(--navy); margin-top: 10px; line-height: 1.3; }
.rw-reward-pill { display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; padding: 3px 9px; border-radius: 999px; font-size: 10.5px; font-weight: 700; }
.rw-reward-pill--unlocked { background: #dff2e9; color: #186b48; }
.rw-reward-note { font-size: 11px; color: var(--muted); margin-top: 6px; line-height: 1.4; }
.rw-reward-card--locked .rw-reward-title { color: #8a8594; }

.rw-loading { display: flex; justify-content: center; padding: 40px 0; }
.rw-spinner { width: 28px; height: 28px; border: 3px solid var(--line); border-top-color: var(--teal); border-radius: 50%; animation: rw-spin 0.8s linear infinite; }
@keyframes rw-spin { to { transform: rotate(360deg); } }

.rw-empty { text-align: center; padding: 50px 20px; }
.rw-empty-ic { font-size: 34px; margin-bottom: 10px; }
.rw-empty-title { font-weight: 700; font-size: 16px; color: var(--navy); }
.rw-empty-sub { font-size: 13.5px; color: var(--muted); margin-top: 6px; line-height: 1.45; }

.rw-list { display: flex; flex-direction: column; gap: 10px; }

.rw-loadmore { width: 100%; padding: 13px; border-radius: 14px; border: 1.5px solid var(--line); background: #fff; color: var(--navy); font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 4px; }
.rw-loadmore:disabled { opacity: 0.5; cursor: not-allowed; }

/* Full history drawer — same slide-up pattern as HelpDrawer.vue */
.rw-drawer-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); z-index: 1000; display: flex; align-items: flex-end; }
.rw-drawer { width: 100%; max-height: 85vh; background: #fff; border-radius: 20px 20px 0 0; display: flex; flex-direction: column; overflow: hidden; }
.rw-drawer-handle { width: 36px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 12px auto 4px; flex-shrink: 0; }
.rw-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
.rw-drawer-title { font-size: 16px; font-weight: 700; color: var(--navy); margin: 0; }
.rw-drawer-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: #f5f5f5; border: none; cursor: pointer; flex-shrink: 0; }
.rw-drawer-body { flex: 1; overflow-y: auto; padding: 16px 20px 24px; -webkit-overflow-scrolling: touch; }

.drawer-enter-active,
.drawer-leave-active { transition: opacity 0.25s ease; }
.drawer-enter-active .rw-drawer,
.drawer-leave-active .rw-drawer { transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; }
.drawer-enter-from .rw-drawer,
.drawer-leave-to .rw-drawer { transform: translateY(100%); }
</style>
