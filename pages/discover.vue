<template>
  <div class="mobile-container discover-root">
    <!-- ── App header ─────────────────────────────────────────────── -->
    <div class="exp-app-header">
      <button
        class="exp-app-header-back"
        type="button"
        aria-label="Back"
        @click="router.back()"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
          width="18"
          height="18"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="exp-app-header-brand">
        <div class="exp-app-header-logo">
          <OPIcon name="logo" class="w-[26px] h-[26px]" />
        </div>
        <span>umovingu</span>
      </div>
      <div class="exp-app-header-spacer" />
    </div>

    <div class="discover-hero">
      <!-- ── Hero: eyebrow/title/sub/badge on the left, illustration
           on the right ─────────────────────────────────────────── -->
      <div v-if="!searchMode" class="exp-hero-row">
        <div class="exp-hero-text">
          <div class="exp-hero-eyebrow">Explore</div>
          <div class="exp-hero-title">Discover any UK property.</div>
          <div class="exp-hero-sub">
            Search any UK address and see what the property is telling you —
            before you buy, sell or even view it.
          </div>
          <div class="exp-hero-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00A19A"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            No account needed to explore
          </div>
        </div>
        <img
          src="/op-icons/misc/exploreProperty.png"
          alt=""
          class="exp-hero-illustration"
          loading="lazy"
        />
      </div>

      <!-- Explore's whole search experience — search bar, filters modal
           and paginated results list — reused verbatim (components/
           property/PropertySearchExperience.vue) so this is the literal
           same component, not a lookalike. It calls /property/search
           directly, which has no auth guard, so this works for guests;
           only "Properties you're watching" below needs an account,
           since that reads the user's own saved list. Discover now gets
           the same results-list view as Explore (previously it navigated
           straight to a property on selecting an address). -->
      <PropertySearchExperience
        placeholder="Enter postcode or address"
        @update:search-mode="searchMode = $event"
      />
      <div v-if="!searchMode" class="exp-search-hint">
        Try a postcode like <b>CV1 2WT</b> or an address like
        <b>10 Downing Street, London</b>
      </div>

      <!-- ── Three entry-point cards ─────────────────────────────── -->
      <div v-if="!searchMode" class="exp-cards-row">
        <button
          type="button"
          class="exp-card exp-card--teal"
          @click="goToBuyerPassport"
        >
          <img
            src="/op-icons/misc/buyerPassport.png"
            alt=""
            class="exp-card-ic exp-card-ic--book"
            loading="lazy"
          />
          <div class="exp-card-title">Buyer Passport</div>
          <div class="exp-card-sub">
            Create your verified buyer profile, KYC, proof of funds and buying
            readiness.
          </div>
          <span class="exp-card-arrow exp-card-arrow--purple">→</span>
        </button>
        <button
          type="button"
          class="exp-card exp-card--purple"
          @click="goToWatching"
        >
          <img
            src="/op-icons/misc/exploreWatching.png"
            alt=""
            class="exp-card-ic"
            loading="lazy"
          />
          <div class="exp-card-title">Watched Properties</div>
          <div class="exp-card-sub">
            Sign in to see your watched homes and get alerts.
          </div>
          <span class="exp-card-arrow exp-card-arrow--purple">→</span>
        </button>
        <div class="exp-card exp-card--gray exp-card--soon">
          <img
            src="/op-icons/misc/tenantPassport.png"
            alt=""
            class="exp-card-ic exp-card-ic--book"
            loading="lazy"
          />
          <div class="exp-card-title">Tenant Passport</div>
          <span class="exp-card-soon-pill">COMING SOON</span>
          <div class="exp-card-sub">Build your reusable rental profile.</div>
          <span class="exp-card-arrow exp-card-arrow--amber">→</span>
        </div>
      </div>

      <!-- ── HomeScore / Property Passport ─────────────────────────── -->
      <div v-if="!searchMode" class="exp-more">
        <div class="exp-more-grid">
          <button
            type="button"
            class="exp-more-card exp-more-card--teal"
            @click="navigateTo('/homescore')"
          >
            <div class="exp-more-top-row">
              <div class="exp-more-eyebrow-col">
                <div class="exp-more-eyebrow">HomeScore&trade;</div>
                <span class="exp-more-pill">FREE</span>
              </div>
              <div class="exp-more-ring">
                <svg viewBox="0 0 100 100">
                  <defs>
                    <linearGradient
                      id="dfHomescoreGrad"
                      x1="1"
                      y1="0"
                      x2="0"
                      y2="0"
                    >
                      <stop offset="0%" stop-color="#00BB93" />
                      <stop offset="100%" stop-color="#016F84" />
                    </linearGradient>
                  </defs>
                  <circle class="exp-more-ring-bg" cx="50" cy="50" r="42" />
                  <circle
                    class="exp-more-ring-fill"
                    cx="50"
                    cy="50"
                    r="42"
                    :stroke-dasharray="263.9"
                    :stroke-dashoffset="263.9 - (55 / 100) * 263.9"
                  />
                </svg>
                <div class="exp-more-ring-label">
                  <span class="exp-more-ring-num">55</span>
                  <span class="exp-more-ring-den">/100</span>
                </div>
              </div>
            </div>
            <div class="exp-more-body">
              <div class="exp-more-card-title">
                Know what your home could be costing you
              </div>
              <div class="exp-more-card-sub">
                Check energy performance, costs and where you could improve.
              </div>
              <span class="exp-more-arrow exp-more-arrow--teal">→</span>
            </div>
          </button>
          <button
            type="button"
            class="exp-more-card exp-more-card--amber"
            @click="navigateTo('/claim')"
          >
            <div class="exp-more-top-row">
              <div class="exp-more-eyebrow-col">
                <div class="exp-more-eyebrow">Property Passport</div>
                <span class="exp-more-pill">SOLICITOR-GRADE</span>
              </div>
              <img
                src="/op-icons/misc/passportFan.png"
                alt=""
                class="exp-more-ic exp-more-ic--fan"
                loading="lazy"
              />
            </div>
            <div class="exp-more-body">
              <div class="exp-more-card-title">
                Build your home's verified record
              </div>
              <div class="exp-more-card-sub">
                Store, verify and share documents, answers and history in one
                place.
              </div>
              <span class="exp-more-arrow exp-more-arrow--amber">→</span>
            </div>
          </button>
        </div>
      </div>

      <!-- ── Recently explored ───────────────────────────────────── -->
      <div v-if="!searchMode && recentlyExplored.length" class="exp-recent">
        <div class="exp-recent-header">
          <div class="exp-recent-title">Recently explored</div>
        </div>
        <div
          v-for="item in recentlyExplored"
          :key="item.id"
          class="exp-recent-item"
          @click="navigateTo(`/property/${item.id}`)"
        >
          <div class="exp-recent-photo">
            <PropertyImage
              :src="item.image"
              :alt="item.addressLine1"
              :show-caption="false"
            />
          </div>
          <div class="exp-recent-body">
            <div class="exp-recent-address">{{ item.addressLine1 }}</div>
            <div class="exp-recent-meta">
              <template v-if="item.city">{{ item.city }}, </template
              >{{ item.postcode }}
            </div>
            <div class="exp-recent-price">
              {{ formatPrice(item.estimatedPrice) }}
              <template v-if="item.lastSoldDate">
                · Last sold {{ lastSoldLabel(item.lastSoldDate) }}</template
              >
            </div>
          </div>
          <div class="exp-recent-right">
            <span class="exp-recent-badge">{{
              relativeTimeLabel(item.viewedAt)
            }}</span>
            <span class="exp-recent-chevron">›</span>
          </div>
        </div>
      </div>
    </div>

    <AuthGateModal
      v-model="authGateOpen"
      :title="authGateCopy.title"
      :body="authGateCopy.body"
      :redirect-target="authGateRedirect"
    />
  </div>
</template>

<script setup lang="ts">
// Guest-accessible "explore any UK property" page — reached from the
// "Explore property" card on the logged-out landing page (pages/index.vue).
// Deliberately no auth middleware and no BottomNav: this is a pre-login
// entry point, matching the same pattern as pages/homescore/index.vue.
definePageMeta({ title: 'Explore - UmovingU' })

import OPIcon from '~/components/ui/OPIcon.vue'
import AuthGateModal from '~/components/ui/AuthGateModal.vue'
import PropertySearchExperience from '~/components/property/PropertySearchExperience.vue'
import PropertyImage from '~/components/property/PropertyImage.vue'
import { usePropertySearch } from '~/composables/usePropertySearch'
import {
  useRecentlyExplored,
  type RecentlyExploredEntry,
} from '~/composables/useRecentlyExplored'

const router = useRouter()
const { formatPrice } = usePropertySearch()
const { getRecentlyExplored } = useRecentlyExplored()
const recentlyExplored = ref<RecentlyExploredEntry[]>([])

onMounted(() => {
  recentlyExplored.value = getRecentlyExplored()
})

// True while PropertySearchExperience is showing results — hides the
// marketing hero, entry-point cards and Recently explored below it.
const searchMode = ref(false)

// Watched Properties still uses the generic "Create account / Sign in"
// gate the HomeScore flow already uses, instead of being dropped
// straight onto the sign-in page — Buyer Passport gets its own
// dedicated screen instead (see goToBuyerPassport below).
const authGateOpen = ref(false)

const authGateCopy = {
  title: 'Sign in to see watched properties',
  body: 'Create a free account to save properties, watch homes and get alerted the moment something changes.',
}
const authGateRedirect = '/passport/collections'

function hasToken(): boolean {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem('token')
}

function goToBuyerPassport() {
  if (!hasToken()) {
    // Buyer Passport gets its own dedicated landing + sign-in screen
    // (pages/buyer-passport/get-started.vue) instead of the generic
    // AuthGateModal — Watched Properties below still uses the modal.
    navigateTo('/buyer-passport/get-started')
    return
  }
  navigateTo('/buyer-profile/build')
}

function goToWatching() {
  if (!hasToken()) {
    authGateOpen.value = true
    return
  }
  navigateTo('/passport/collections')
}

// "2h ago" / "Yesterday" / "3d ago" style label for a recently-explored
// entry's viewedAt timestamp.
function relativeTimeLabel(viewedAt: number): string {
  const diffMs = Date.now() - viewedAt
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(viewedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function lastSoldLabel(dateStr: string): string {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.discover-root {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #fff;
}

/* ── App header ── */
.exp-app-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: calc(12px + env(safe-area-inset-top)) 20px 8px;
  background: #fff;
}
.exp-app-header-back {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f5f5f7;
  border: none;
  color: #231d45;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
}
.exp-app-header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.exp-app-header-logo {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}
.exp-app-header-spacer {
  flex: 1;
}

/* ── Hero ── */
.discover-hero {
  background: #fff;
  padding: 4px 20px 24px;
  flex-shrink: 0;
}
.exp-hero-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.exp-hero-text {
  flex: 1;
  min-width: 0;
}
.exp-hero-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 4px;
}
.exp-hero-title {
  font-size: 26px;
  font-weight: 900;
  color: #231d45;
  letter-spacing: -0.5px;
  line-height: 1.15;
}
.exp-hero-sub {
  font-size: 13px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.55;
  margin-top: 8px;
}
.exp-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: #00817c;
}
.exp-hero-illustration {
  width: 172px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: -4px;
}

/* ── Search — PropertySearchExperience.vue owns its own styling
   (search bar, filters modal, results list); nothing to style here. ── */
.exp-search-hint {
  font-size: 11.5px;
  font-weight: 500;
  color: #9c98ad;
  text-align: center;
  margin-top: 8px;
}
.exp-search-hint b {
  color: #00817c;
  font-weight: 700;
}

/* ── Three entry-point cards ── */
.exp-cards-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 16px;
}
.exp-card {
  position: relative;
  text-align: left;
  border: none;
  border-radius: 16px;
  padding: 14px 12px 30px;
  font-family: inherit;
  cursor: pointer;
}
.exp-card--teal {
  background: #eaf7f6;
}
.exp-card--purple {
  background: #f1eefc;
}
.exp-card--amber {
  background: #fdf3e4;
}
.exp-card--gray {
  background: #f0f0f2;
}
.exp-card--soon {
  cursor: default;
}
.exp-card-ic {
  width: 62px;
  height: 62px;
  object-fit: contain;
  display: block;
  margin: 0 auto 12px;
}
/* Buyer/Tenant Passport book art is portrait (~255x395), not square like
   the other card icons — height-constrained instead of width-constrained
   so it reads as a small standing book, not a squashed square. */
.exp-card-ic--book {
  width: auto;
  height: 72px;
}
.exp-card-soon-pill {
  display: inline-block;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #6b7089;
  background: #e2e2e6;
  padding: 3px 7px;
  border-radius: 100px;
  margin-top: 4px;
}
.exp-card-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  line-height: 1.25;
  letter-spacing: -0.1px;
}
.exp-card-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.4;
  margin-top: 5px;
}
.exp-card-arrow {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 15px;
  font-weight: 800;
}
.exp-card-arrow--teal {
  color: #00a19a;
}
.exp-card-arrow--purple {
  color: #7c6fd6;
}
.exp-card-arrow--amber {
  color: #d4922a;
}

/* ── HomeScore / Property Passport ── */
.exp-more {
  margin-top: 12px;
}
.exp-more-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.exp-more-card {
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: left;
  border: 1px solid #eef0f6;
  border-radius: 16px;
  padding: 14px 12px 16px 14px;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
}
.exp-more-card--teal {
  background: linear-gradient(160deg, #eaf6f5 0%, #f8fcfb 100%);
}
.exp-more-card--amber {
  background: linear-gradient(160deg, #fdf3e4 0%, #fdf9f2 100%);
}
.exp-more-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
}
.exp-more-eyebrow-col {
  min-width: 0;
}
.exp-more-body {
  width: 100%;
  min-width: 0;
  margin-top: 10px;
}
.exp-more-ic {
  width: 64px;
  height: 64px;
  object-fit: contain;
  flex-shrink: 0;
}
.exp-more-ic--fan {
  width: 78px;
  height: 72px;
}
.exp-more-ring {
  position: relative;
  width: 76px;
  height: 82px;
  flex-shrink: 0;
}
.exp-more-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.exp-more-ring-bg {
  fill: none;
  stroke: #ededf3;
  stroke-width: 9;
}
.exp-more-ring-fill {
  fill: none;
  stroke: url(#dfHomescoreGrad);
  stroke-width: 9;
  stroke-linecap: round;
}
.exp-more-ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.exp-more-ring-num {
  font-size: 17px;
  font-weight: 900;
  color: #231d45;
  line-height: 1;
}
.exp-more-ring-den {
  font-size: 8.5px;
  font-weight: 700;
  color: #9c98ad;
}
.exp-more-eyebrow {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 6px;
}
.exp-more-pill {
  display: inline-block;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #00817c;
  background: rgba(255, 255, 255, 0.7);
  padding: 3px 8px;
  border-radius: 100px;
  margin-bottom: 10px;
}
.exp-more-card-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #231d45;
  line-height: 1.3;
  letter-spacing: -0.1px;
}
.exp-more-card-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.45;
  margin-top: 6px;
}
.exp-more-arrow {
  display: block;
  margin-top: 14px;
  font-size: 16px;
  font-weight: 800;
  text-align: end;
}
.exp-more-arrow--teal {
  color: #00a19a;
}
.exp-more-arrow--amber {
  color: #d4922a;
}

/* ── Recently explored ── */
.exp-recent {
  margin: 20px 0 4px;
}
.exp-recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.exp-recent-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.exp-recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px solid #ececef;
  cursor: pointer;
}
.exp-recent-item:last-child {
  border-bottom: none;
}
.exp-recent-photo {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  background: #f2f2f6;
  flex-shrink: 0;
}
.exp-recent-body {
  flex: 1;
  min-width: 0;
}
.exp-recent-address {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
}
.exp-recent-meta {
  font-size: 11.5px;
  color: #9c98ad;
  margin-top: 2px;
}
.exp-recent-price {
  font-size: 12.5px;
  font-weight: 700;
  color: #00817c;
  margin-top: 4px;
}
.exp-recent-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.exp-recent-badge {
  font-size: 10.5px;
  font-weight: 700;
  color: #00817c;
  background: #eaf7f6;
  padding: 4px 9px;
  border-radius: 100px;
  white-space: nowrap;
}
.exp-recent-chevron {
  font-size: 18px;
  color: #c7c5d6;
}
</style>
