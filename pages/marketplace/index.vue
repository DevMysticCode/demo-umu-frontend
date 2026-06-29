<template>
  <!-- Marketplace Home — Step 1 of the rollout.
       Layout/visuals are ported 1:1 from prisma/umovingu-marketplace-latest.html.
       Data is now live: categories + recent jobs come from the backend
       (see `useMarketplace`). Tapping any card opens Browse or the Job
       Detail page.

       Stats hero card is still placeholder (driven by /me/aggregates in
       Step 2). Persona is hard-coded to "customer"; supplier surfaces
       come later (Step 7), gated by a separate account type at signup. -->
  <div class="mp-page mobile-container">
    <!-- Sub-app affordances: the "‹ UmovingU" pill exits to the host
         app's Explore, then the marketplace home owns its own greeting
         + title (matches the new prototype). -->
    <MarketplaceAppBack />

    <div class="mp-page-header">
      <div class="mp-page-header-text">
        <div class="mp-page-greeting">
          {{ greeting }}, {{ firstName || 'there' }}
          <span class="mp-wave">👋</span>
        </div>
        <div class="mp-page-title">Marketplace</div>
      </div>
      <div class="mp-sc-avatar" @click="onAvatar">
        {{ avatarInitials }}
      </div>
    </div>

    <!-- Personal hero — stats card. Numbers are placeholders; will be
         driven by /me/jobs aggregates once Step 2 ships. -->
    <div class="mp-hero-card mp-anim-1" @click="goToProjects">
      <div class="mp-hero-top">
        <div class="mp-hero-eyebrow">📋 Your projects</div>
        <div class="mp-hero-update">{{ stats.inProgress }} active</div>
      </div>
      <div class="mp-hero-headline">
        Completed
        <span class="mp-counter">{{ stats.completed }}</span> jobs with
        UmovingU
      </div>
      <div class="mp-hero-sub">
        Every payment held safely in UProtect escrow until your job's done.
      </div>
      <div class="mp-hero-stats">
        <div class="mp-hero-stat">
          <div class="mp-hero-stat-num breathe">{{ stats.posted }}</div>
          <div class="mp-hero-stat-label">Posted</div>
        </div>
        <div class="mp-hero-stat">
          <div class="mp-hero-stat-num mint">{{ stats.completed }}</div>
          <div class="mp-hero-stat-label">Completed</div>
        </div>
        <div class="mp-hero-stat">
          <div class="mp-hero-stat-num amber">{{ stats.inProgress }}</div>
          <div class="mp-hero-stat-label">In progress</div>
        </div>
      </div>
    </div>

    <!-- Action row — Post a job + Inbox shortcut. The prototype kept
         Post in the bottom-nav and Inbox as a tab; our global nav can't
         host either, so we surface them as paired buttons here. -->
    <div class="mp-actions-row mp-anim-2">
      <button class="mp-post-cta" type="button" @click="onPostJob">
        <span class="mp-post-cta-plus">＋</span>
        <span class="mp-post-cta-label">Post a job</span>
        <span class="mp-post-cta-meta">Free · 5 min</span>
      </button>
      <button class="mp-inbox-cta" type="button" @click="onOpenInbox">
        <span class="mp-inbox-cta-icon">📬</span>
        <span class="mp-inbox-cta-label">Inbox</span>
        <span v-if="unreadCount > 0" class="mp-inbox-cta-badge">{{ unreadCount }}</span>
      </button>
    </div>

    <!-- Search — non-functional in Step 0; wire to Browse in Step 1. -->
    <div class="mp-search-row mp-anim-2">
      <div class="mp-search-input">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle
            cx="11"
            cy="11"
            r="7"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
          />
          <path
            d="M20 20l-3.5-3.5"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="What do you need done?"
          @keyup.enter="onSearch"
        />
      </div>
      <button class="mp-search-btn" type="button" @click="onSearch">Go</button>
    </div>

    <!-- Categories grid — 8 tiles, prototype-faithful. Tap opens Browse
         filtered to that category (Step 1). -->
    <div class="mp-section-h">
      <div class="mp-section-title">Categories</div>
      <span class="mp-section-link" @click="onSeeAllCategories">See all →</span>
    </div>
    <div class="mp-cat-grid mp-anim-3">
      <button
        v-for="cat in homeCategories"
        :key="cat.slug"
        class="mp-cat-tile"
        :style="{ background: categoryTileBg(cat) }"
        @click="onPickCategory(cat.slug)"
      >
        <span class="mp-cat-name">{{ cat.name }}</span>
      </button>
    </div>

    <!-- Recently posted jobs near user. Mock data in Step 0; Step 1
         replaces with `GET /marketplace/jobs?near=...&limit=...`. -->
    <div class="mp-section-h">
      <div class="mp-section-title">Recently posted near you</div>
      <span class="mp-section-link" @click="onSeeAllJobs">
        All ({{ homeJobs.length }}) →
      </span>
    </div>
    <div class="mp-job-list mp-anim-4">
      <button
        v-for="job in homeJobs"
        :key="job.id"
        class="mp-job-list-card"
        type="button"
        @click="onOpenJob(job.id)"
      >
        <div
          class="mp-job-list-photo"
          :style="{ background: jobBackground(job) }"
        >
          <span class="mp-job-list-urgency" :class="`urg-${job.urgency}`">
            {{ urgencyLabel(job.urgency) }}
          </span>
          <span class="mp-job-list-cat">{{ job.categoryLabel }}</span>
          <span v-if="job.distanceMi !== null" class="mp-job-list-distance">
            📍 {{ job.distanceMi }} mi · {{ job.locationLabel }}
          </span>
          <span v-else class="mp-job-list-distance">
            📍 {{ job.locationLabel }}
          </span>
        </div>
        <div class="mp-job-list-body">
          <div class="mp-job-list-title">{{ job.title }}</div>
          <div class="mp-job-list-meta">
            Posted {{ job.postedAgo }}<span v-if="job.availability">
              · {{ job.availability }}</span>
          </div>
          <div class="mp-job-list-foot">
            <div class="mp-job-list-budget">
              {{ formatBudget(job.budgetMin) }}<small v-if="job.budgetMax">
                – {{ formatBudget(job.budgetMax, true) }}</small
              >
            </div>
            <span class="mp-job-list-offers">{{ job.offerCount }} offers</span>
          </div>
        </div>
      </button>
    </div>

    <div v-if="!homeJobs.length" class="mp-empty">
      No jobs nearby yet. Be the first to post one.
    </div>

    <!-- Earnings chip — supplier-side affordance, only surfaces when
         the user has at least one payout (held or released). Keeps the
         home page minimal for customers but discoverable for suppliers. -->
    <button
      v-if="earnings && (earnings.payoutCount > 0 || earnings.pendingCount > 0)"
      class="mp-earnings-chip mp-anim-5"
      type="button"
      @click="onOpenEarnings"
    >
      <span class="mp-earnings-chip-icon">💸</span>
      <span class="mp-earnings-chip-body">
        <span class="mp-earnings-chip-label">Your earnings</span>
        <span class="mp-earnings-chip-amt">{{ formatEarnings(earnings.totalEarned) }}</span>
      </span>
      <span class="mp-earnings-chip-arrow">›</span>
    </button>

    <!-- UProtect trust strip — the signature feature, mentioned on every
         screen in the prototype. Tappable to open the explainer (Step 2). -->
    <div class="mp-trust-strip mp-anim-5">
      <div class="mp-trust-strip-icon">🛡</div>
      <div class="mp-trust-strip-text">
        <b>UProtect — Secure escrow payments.</b> You're never charged when
        posting a job. Funds are only taken when you accept an offer.
        <span class="mp-trust-strip-link" @click="onLearnUprotect">
          How it works →
        </span>
      </div>
    </div>

    <div style="height: 100px" />
    <MarketplaceBottomNav active="home" :unread-count="unreadCount" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarketplaceAppBack from '~/components/marketplace/MarketplaceAppBack.vue'
import MarketplaceBottomNav from '~/components/marketplace/MarketplaceBottomNav.vue'

definePageMeta({ title: 'Marketplace — UmovingU' })

const router = useRouter()
const { profile } = useProfile()
const { showToast } = useAppToast()
const { fetchCategories, fetchJobs, fetchMyStats, fetchThreads, fetchEarnings, resolvePhotoUrl, categoryTileBg } = useMarketplace()

// Backend returns `photoUrl` (real upload, relative path) and `photoBg`
// (legacy gradient for seeded demo jobs) separately. We compose the
// final CSS here so the demo gradients still work after Step 2.
function jobBackground(job: MarketplaceJobListItem): string | undefined {
  if (job.photoUrl) {
    return `linear-gradient(180deg, rgba(0,0,0,0.10), rgba(0,0,0,0.05)), url(${resolvePhotoUrl(job.photoUrl)}) center/cover no-repeat`
  }
  return job.photoBg ?? undefined
}

// ── Profile / greeting ────────────────────────────────────────────
const firstName = computed(() => profile.value?.firstName ?? '')
const avatarInitials = computed(() => {
  const f = profile.value?.firstName?.[0] ?? ''
  const l = profile.value?.lastName?.[0] ?? ''
  return (f + l).toUpperCase() || 'U'
})
function onAvatar() {
  // Tapping the avatar takes you back to your host-app profile;
  // dedicated marketplace profile screens come in Step 7.
  router.push('/profile')
}
const greeting = computed(() => {
  if (typeof window === 'undefined') return 'Good morning'
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

// ── User stats (Step 2 — live) ────────────────────────────────────
// Stats are auth-only. For logged-out browsers we show zeros so the
// hero card still renders without a flash of mock numbers.
const isAuthed = computed(() =>
  typeof window !== 'undefined' && !!localStorage.getItem('token'),
)
const { data: statsData } = await useAsyncData(
  'mp-me-stats',
  async () => {
    if (!isAuthed.value) return { posted: 0, completed: 0, inProgress: 0 }
    try {
      return await fetchMyStats()
    } catch {
      return { posted: 0, completed: 0, inProgress: 0 }
    }
  },
)
const stats = computed(() => statsData.value ?? { posted: 0, completed: 0, inProgress: 0 })

// Unread count drives the inbox badge. Sum across every thread.
const { data: threads } = await useAsyncData(
  'mp-home-threads',
  async () => {
    if (!isAuthed.value) return []
    try {
      return await fetchThreads()
    } catch {
      return []
    }
  },
)
const unreadCount = computed(() =>
  (threads.value ?? []).reduce((sum, t) => sum + (t.unreadCount ?? 0), 0),
)

// Supplier earnings — only fetched when authed; the chip below the
// job list hides cleanly when the user has zero payouts so customers
// don't see a "£0 earned" tease.
const { data: earnings } = await useAsyncData(
  'mp-home-earnings',
  async () => {
    if (!isAuthed.value) return null
    try {
      return await fetchEarnings()
    } catch {
      return null
    }
  },
)
function formatEarnings(pence: number): string {
  const pounds = pence / 100
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(pounds)
}

// ── Categories + Jobs (Step 1 — live backend) ─────────────────────
// `GET /marketplace/categories` is cached by `useAsyncData` so the
// 4×2 grid renders instantly on subsequent visits. Jobs are limited
// to 4 here (home preview); Browse loads the full feed.
const { data: categories } = await useAsyncData('mp-categories', () =>
  fetchCategories(),
)
const { data: jobs } = await useAsyncData('mp-home-jobs', () =>
  fetchJobs({ limit: 4 }),
)

// Show only the first 8 categories on home; Browse shows the rest.
const homeCategories = computed<MarketplaceCategory[]>(() =>
  (categories.value ?? []).slice(0, 8),
)
const homeJobs = computed<MarketplaceJobListItem[]>(() => jobs.value ?? [])

type Urgency = 'urgent' | 'standard' | 'flexible'

function urgencyLabel(u: Urgency): string {
  return u === 'urgent' ? 'Urgent' : u === 'flexible' ? 'Flexible' : 'Standard'
}
function formatBudget(amount: number, omitPrefix = false): string {
  const formatted = new Intl.NumberFormat('en-GB').format(amount)
  return omitPrefix ? `£${formatted}` : `£${formatted}`
}

// ── Search ────────────────────────────────────────────────────────
const searchQuery = ref('')

function onSearch() {
  // Browse owns the search box too — passing q through the URL keeps
  // the input pre-filled when the user lands on Browse.
  router.push({
    path: '/marketplace/browse',
    query: searchQuery.value ? { q: searchQuery.value } : {},
  })
}
function onSeeAllCategories() {
  router.push('/marketplace/browse')
}
function onSeeAllJobs() {
  router.push('/marketplace/browse')
}
function onPickCategory(slug: string) {
  router.push({ path: '/marketplace/browse', query: { category: slug } })
}
function onOpenJob(id: string) {
  router.push(`/marketplace/jobs/${id}`)
}
function notImplemented(msg: string) {
  showToast({ message: `${msg} — coming next step`, iconEmoji: '🚧' })
}
function onPostJob() {
  if (!isAuthed.value) {
    showToast({ message: 'Sign in to post a job', iconEmoji: '🔒' })
    router.push('/onboarding/signin')
    return
  }
  router.push('/marketplace/post')
}
function onOpenInbox() {
  if (!isAuthed.value) {
    showToast({ message: 'Sign in to see messages', iconEmoji: '🔒' })
    router.push('/onboarding/signin')
    return
  }
  router.push('/marketplace/inbox')
}
function onOpenEarnings() {
  router.push('/marketplace/earnings')
}
function goToProjects() {
  notImplemented('Your projects')
}
function onLearnUprotect() {
  notImplemented('UProtect explainer')
}
</script>

<style scoped>
/* Marketplace home — sized for the mobile-container (28rem max) frame.
   Spacing / layout / animations are ported 1:1 from the prototype
   (prisma/umovingu-marketplace-latest.html). Typography intentionally
   inherits from the app (no page-level font-family) so the marketplace
   reads as part of the same product, not a separate microsite. */
.mp-page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-bottom: 80px;
  color: #231d45;
}

/* ── Sub-app page header (matches the new prototype) ──────────── */
.mp-page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 14px;
  background: transparent;
}
.mp-page-header-text { flex: 1; min-width: 0; }
.mp-page-greeting {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7089;
  letter-spacing: -0.1px;
  margin-bottom: 2px;
}
.mp-page-title {
  font-size: 28px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.8px;
  line-height: 1.05;
}
.mp-sc-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00a19a, #008a84);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  box-shadow:
    0 4px 12px rgba(0, 161, 154, 0.3),
    inset 0 0 0 2px white,
    inset 0 0 0 3px #00a19a;
  cursor: pointer;
  flex-shrink: 0;
}
.mp-wave {
  display: inline-block;
  animation: mpWave 2.4s ease-in-out infinite;
  transform-origin: 70% 70%;
  font-size: 14px;
}
@keyframes mpWave {
  0%, 90%, 100% { transform: rotate(0); }
  10%, 30%      { transform: rotate(14deg); }
  20%, 40%      { transform: rotate(-8deg); }
}

/* ── Hero card ──────────────────────────────────────────────────── */
.mp-hero-card {
  margin: 6px 20px 0;
  padding: 18px 20px;
  background: linear-gradient(135deg, #231d45 0%, #352d5c 60%, #231d45 100%);
  border-radius: 18px;
  color: #fff;
  box-shadow: 0 12px 28px rgba(35, 29, 69, 0.24);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.mp-hero-card::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(0, 161, 154, 0.22) 0%,
    transparent 65%
  );
  pointer-events: none;
}
.mp-hero-card > * {
  position: relative;
  z-index: 1;
}
.mp-hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.mp-hero-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}
.mp-hero-update {
  font-size: 10.5px;
  font-weight: 700;
  color: #fff;
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 100px;
}
.mp-hero-headline {
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.3px;
  line-height: 1.25;
  margin-bottom: 4px;
}
.mp-counter {
  display: inline-block;
  color: #5eead4;
  font-weight: 900;
}
.mp-hero-sub {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.5;
  margin-bottom: 14px;
}
.mp-hero-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}
.mp-hero-stat {
  text-align: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 10px 6px;
}
.mp-hero-stat-num {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1;
}
.mp-hero-stat-num.mint { color: #5eead4; }
.mp-hero-stat-num.amber { color: #ffd58a; }
.mp-hero-stat-num.breathe {
  animation: mpStatBreathe 3s ease-in-out infinite;
}
@keyframes mpStatBreathe {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.06); }
}
.mp-hero-stat-label {
  font-size: 9.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 4px;
}

/* ── Action row (Post + Inbox) ─────────────────────────────────── */
.mp-actions-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 8px;
  margin: 16px 20px 0;
}

.mp-post-cta {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 161, 154, 0.32);
  transition: filter 0.15s, transform 0.15s;
}
.mp-post-cta:hover { filter: brightness(1.05); transform: translateY(-1px); }
.mp-post-cta-plus {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 800; line-height: 1;
  flex-shrink: 0;
}
.mp-post-cta-label {
  flex: 1;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: -0.2px;
  text-align: left;
}
.mp-post-cta-meta {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  opacity: 0.85;
  white-space: nowrap;
}

.mp-inbox-cta {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 14px;
  background: #fff;
  color: #231d45;
  border: 1px solid #e4e5ed;
  border-radius: 14px;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
  transition: transform 0.15s, box-shadow 0.15s;
}
.mp-inbox-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(35, 29, 69, 0.1); }
.mp-inbox-cta-icon { font-size: 20px; }
.mp-inbox-cta-label { font-size: 13.5px; font-weight: 800; letter-spacing: -0.2px; }
.mp-inbox-cta-badge {
  position: absolute;
  top: 6px;
  right: 8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 100px;
  background: #e7444c;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ── Search row ─────────────────────────────────────────────────── */
.mp-search-row {
  display: flex;
  gap: 8px;
  margin: 16px 20px 0;
}
.mp-search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e4e5ed;
  border-radius: 14px;
  padding: 11px 14px;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.mp-search-input svg {
  width: 16px;
  height: 16px;
  color: #6b7089;
  flex-shrink: 0;
}
.mp-search-input input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #231d45;
  min-width: 0;
}
.mp-search-input input::placeholder {
  color: #a8a9ad;
  font-weight: 500;
}
.mp-search-btn {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 0 18px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 161, 154, 0.3);
}

/* ── Section headers ────────────────────────────────────────────── */
.mp-section-h {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 22px 20px 10px;
}
.mp-section-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.mp-section-link {
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
  cursor: pointer;
}

/* ── Categories grid ────────────────────────────────────────────── */
.mp-cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 20px;
}
.mp-cat-tile {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 14px;
  border: 1px solid #e4e5ed;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  overflow: hidden;
  padding: 0;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 10px rgba(35, 29, 69, 0.1);
  background-size: cover;
  background-position: center;
}
.mp-cat-tile::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.78) 100%);
  pointer-events: none;
}
.mp-cat-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(35, 29, 69, 0.18);
}
.mp-cat-name {
  position: absolute;
  bottom: 7px;
  left: 8px;
  right: 8px;
  z-index: 2;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: -0.1px;
  text-align: left;
  line-height: 1.15;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* ── Job list cards ─────────────────────────────────────────────── */
.mp-job-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mp-job-list-card {
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  font-family: inherit;
  text-align: left;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
}
.mp-job-list-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(35, 29, 69, 0.1);
}
.mp-job-list-photo {
  position: relative;
  height: 110px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.mp-job-list-urgency {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 4px 9px;
  border-radius: 100px;
  color: #fff;
  backdrop-filter: blur(4px);
}
.urg-urgent   { background: rgba(231, 76, 94, 0.92); }
.urg-standard { background: rgba(35, 29, 69, 0.78); }
.urg-flexible { background: rgba(0, 161, 154, 0.86); }
.mp-job-list-cat {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 100px;
  color: #fff;
  background: rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(4px);
}
.mp-job-list-distance {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 10.5px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 100px;
  color: #fff;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(4px);
}
.mp-job-list-body {
  padding: 12px 14px 14px;
}
.mp-job-list-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
  line-height: 1.3;
}
.mp-job-list-meta {
  font-size: 11px;
  font-weight: 600;
  color: #6b7089;
  margin-top: 4px;
}
.mp-job-list-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 10px;
}
.mp-job-list-budget {
  font-size: 16px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: -0.4px;
}
.mp-job-list-budget small {
  font-size: 13px;
  font-weight: 700;
  color: #6b7089;
}
.mp-job-list-offers {
  font-size: 11px;
  font-weight: 800;
  color: #6b7089;
  background: #f5f6fa;
  padding: 4px 9px;
  border-radius: 100px;
}

/* Empty state when /marketplace/jobs returns nothing */
.mp-empty {
  margin: 14px 20px 0;
  padding: 18px;
  background: #fff;
  border: 1px dashed #d8dae6;
  border-radius: 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #6b7089;
  text-align: center;
}

/* ── Earnings chip (supplier only) ───────────────────────────── */
.mp-earnings-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  width: calc(100% - 40px);
  margin: 16px 20px 0;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.05);
  transition: transform 0.15s, box-shadow 0.15s;
}
.mp-earnings-chip:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(35, 29, 69, 0.1); }
.mp-earnings-chip-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px;
  flex-shrink: 0;
}
.mp-earnings-chip-body { flex: 1; display: flex; flex-direction: column; text-align: left; }
.mp-earnings-chip-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #6b7089;
}
.mp-earnings-chip-amt {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  margin-top: 2px;
}
.mp-earnings-chip-arrow {
  font-size: 22px;
  font-weight: 800;
  color: #00a19a;
  flex-shrink: 0;
}

/* ── UProtect trust strip ───────────────────────────────────────── */
.mp-trust-strip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 20px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f2faf8, #fff);
  border: 1px solid #d4ece2;
  border-radius: 14px;
}
.mp-trust-strip-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.28);
}
.mp-trust-strip-text {
  font-size: 11.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.5;
}
.mp-trust-strip-text b {
  font-weight: 800;
  color: #231d45;
}
.mp-trust-strip-link {
  color: #008a84;
  font-weight: 800;
  cursor: pointer;
}

/* ── Entry animations ───────────────────────────────────────────── */
@keyframes mpFadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
.mp-anim-1 { animation: mpFadeUp 0.4s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.mp-anim-2 { animation: mpFadeUp 0.4s 0.13s cubic-bezier(0.22, 1, 0.36, 1) both; }
.mp-anim-3 { animation: mpFadeUp 0.4s 0.22s cubic-bezier(0.22, 1, 0.36, 1) both; }
.mp-anim-4 { animation: mpFadeUp 0.4s 0.30s cubic-bezier(0.22, 1, 0.36, 1) both; }
.mp-anim-5 { animation: mpFadeUp 0.4s 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .mp-anim-1,
  .mp-anim-2,
  .mp-anim-3,
  .mp-anim-4,
  .mp-anim-5 { animation: none; }
  .mp-hero-stat-num.breathe { animation: none; }
  .mp-wave { animation: none; }
}
</style>
