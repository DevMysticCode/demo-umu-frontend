<template>
  <div class="mobile-container dash-root">
    <div class="dash-hero">
      <div class="hero-row1">
        <div>
          <div class="dash-greeting-sub">{{ greeting }}</div>
          <div class="dash-title">{{ role === 'buy' ? 'Your move at a glance' : 'Your home at a glance' }}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px">
          <button class="dash-tour-btn" type="button" aria-label="Help">
            ?
          </button>
          <NotificationBell />
          <div class="hero-avatar" @click="navigateTo('/profile')">
            <UserAvatar
              :src="profile?.avatarUrl"
              :firstName="profile?.firstName"
              :lastName="profile?.lastName"
              :size="36"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="dash-scroll">
      <div v-if="roleResolved && role === 'buy'" class="explore-intro-card">
        <div class="eic-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div class="eic-body">
          <div class="eic-title">Explore a property</div>
          <div class="eic-sub">Search any UK address and see the property report.</div>
        </div>
      </div>

      <PropertySearchExperienceClassic
        placeholder="Search by postcode, address or area"
        @update:search-mode="searchMode = $event"
      />

      <template v-if="!searchMode && roleResolved && role === 'buy'">
        <div v-if="loadingBuyerProfile" class="skeleton-card" style="height: 220px; margin-bottom: 20px" />

        <template v-else>
          <!-- ── Your Active (Buyer) Passport ── -->
          <div class="dash-section">
            <div class="dash-eyebrow">Your active passport</div>

            <div
              v-if="buyerProfile"
              class="active-passport-card"
              @click="navigateTo('/buyer-profile/view')"
            >
              <div class="apc-main">
                <div class="apc-passport-slot">
                  <PassportCard line1="" line2="" type="BUYER" />
                </div>
                <div class="apc-info">
                  <span class="apc-pill">BUYER PASSPORT</span>
                  <div class="apc-address">Buyer Passport</div>
                  <div v-if="buyerIdVerified" class="apc-verified-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Identity verified
                  </div>
                  <div class="apc-progress-row">
                    Finance <strong>{{ financePercent }}%</strong> complete
                  </div>
                  <div class="apc-progress-track">
                    <div class="apc-progress-fill" :style="{ width: financePercent + '%' }" />
                  </div>
                </div>
              </div>
              <button
                class="apc-continue-btn"
                type="button"
                @click.stop="navigateTo('/buyer-profile/build')"
              >
                Continue my Buyer Passport
                <span>&rarr;</span>
              </button>
              <div class="apc-viewall-link" @click.stop="navigateTo('/passport/collections')">
                View all Passports
                <span>&rsaquo;</span>
              </div>
            </div>

            <div v-else class="no-passport-card" @click="navigateTo('/buyer-profile/build')">
              <div class="npc-icon">+</div>
              <div class="npc-body">
                <div class="npc-title">Start your Buyer Passport</div>
                <div class="npc-sub">Verify your identity and buying position.</div>
              </div>
              <span class="npc-chevron">&rsaquo;</span>
            </div>
          </div>

          <!-- ── Next For You ── -->
          <div v-if="buyerProfile" class="dash-section">
            <div class="dash-eyebrow">Next for you</div>
            <div class="next-for-you-card">
              <div
                v-if="buyerIncompleteCount > 0"
                class="nfy-row"
                @click="navigateTo('/buyer-profile/build')"
              >
                <div class="nfy-icon nfy-icon-teal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 8h6M9 12h6M9 16h3" />
                  </svg>
                </div>
                <div class="nfy-body">
                  <div class="nfy-title">Complete {{ buyerIncompleteCount }} items in your Passport</div>
                  <div class="nfy-sub">Add documents and details to build your record.</div>
                </div>
                <span class="nfy-chevron">&rsaquo;</span>
              </div>
              <div class="nfy-row" @click="navigateTo('/buyer-profile/build')">
                <div class="nfy-icon nfy-icon-teal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-6M9 15l3-3 3 3" />
                  </svg>
                </div>
                <div class="nfy-body">
                  <div class="nfy-title">Upload proof of funds or AIP</div>
                  <div class="nfy-sub">Strengthen your position and unlock more.</div>
                </div>
                <span class="nfy-chevron">&rsaquo;</span>
              </div>
              <div class="nfy-row" @click="navigateTo('/buyer-profile/build')">
                <div class="nfy-icon nfy-icon-amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div class="nfy-body">
                  <div class="nfy-title">Confirm your buying position</div>
                  <div class="nfy-sub">Let agents and sellers know where you are in the chain.</div>
                </div>
                <span class="nfy-chevron">&rsaquo;</span>
              </div>
            </div>
          </div>

          <!-- ── Watching ── -->
          <div class="dash-section">
            <div class="dash-eyebrow-row">
              <div class="dash-eyebrow">
                Watching
                <span v-if="savedProperties.length" class="watching-badge">{{ savedProperties.length }}</span>
              </div>
              <div class="dash-view-all" @click="navigateTo('/profile/saved-properties')">View all</div>
            </div>

            <div v-if="loadingSaved" class="skeleton-card" style="height: 100px" />

            <div v-else-if="savedProperties.length" class="watching-card">
              <div class="watch-row" @click="navigateTo('/property/' + savedProperties[0].id)">
                <div class="watch-img-wrap">
                  <PropertyImage
                    :src="savedProperties[0].imageUrl"
                    :alt="savedProperties[0].addressLine1"
                    :show-caption="false"
                    class="watch-img"
                  />
                </div>
                <div class="watch-body">
                  <div class="watch-address">{{ savedProperties[0].addressLine1 }}</div>
                  <div class="watch-postcode">{{ savedProperties[0].postcode }}</div>
                  <div v-if="savedProperties[0].homeScore != null" class="watch-hs">
                    HomeScore <strong>{{ savedProperties[0].homeScore }}/100</strong>
                  </div>
                </div>
                <button
                  type="button"
                  class="watch-updates-btn"
                  @click.stop="navigateTo('/property/' + savedProperties[0].id)"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  Updates
                </button>
              </div>
              <div
                v-if="savedProperties.length > 1"
                class="watch-more-link"
                @click="navigateTo('/profile/saved-properties')"
              >
                {{ savedProperties.length - 1 }} more propert{{ savedProperties.length - 1 === 1 ? 'y' : 'ies' }} watching
              </div>
            </div>

            <div v-else class="no-passport-card" @click="navigateTo('/dashboard')">
              <div class="npc-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div class="npc-body">
                <div class="npc-title">Nothing saved yet</div>
                <div class="npc-sub">Explore properties and save the ones you like.</div>
              </div>
              <span class="npc-chevron">&rsaquo;</span>
            </div>
          </div>
        </template>
      </template>

      <template v-else-if="!searchMode && roleResolved">
        <div v-if="loadingPassport" class="skeleton-card" style="height: 220px; margin-bottom: 20px" />

        <template v-else>
          <!-- ── Your Active Passport ── -->
          <div class="dash-section">
            <div class="dash-eyebrow">Your active passport</div>

            <div
              v-if="passports.length"
              class="active-passport-card"
              @click="navigateTo('/passportview/' + passports[0].id)"
            >
              <div class="apc-main">
                <div class="apc-passport-slot">
                  <PassportCard
                    :line1="passports[0].addressLine1 || passports[0].address || ''"
                    :line2="passports[0].postcode || ''"
                    :type="passports[0].type || 'SELLER'"
                  />
                </div>
                <div class="apc-info">
                  <span class="apc-pill">{{ (passports[0].type || 'SELLER') }} PASSPORT</span>
                  <div class="apc-address">
                    {{ passports[0].address || passports[0].addressLine1 }}
                  </div>
                  <div class="apc-postcode">{{ passports[0].postcode }}</div>
                  <div class="apc-progress-row">
                    Passport <strong>{{ passports[0].completionPercentage ?? 0 }}%</strong> complete
                  </div>
                  <div class="apc-progress-track">
                    <div
                      class="apc-progress-fill"
                      :style="{ width: (passports[0].completionPercentage ?? 0) + '%' }"
                    />
                  </div>
                </div>
              </div>
              <button
                class="apc-continue-btn"
                type="button"
                @click.stop="navigateTo('/passportview/' + passports[0].id)"
              >
                Continue my Passport
                <span>&rarr;</span>
              </button>
              <div class="apc-viewall-link" @click.stop="navigateTo('/passport/collections')">
                View all Passports
                <span>&rsaquo;</span>
              </div>
            </div>

            <div v-else class="no-passport-card" @click="startClaimFlow">
              <div class="npc-icon">+</div>
              <div class="npc-body">
                <div class="npc-title">Start your Property Passport</div>
                <div class="npc-sub">Verify ownership and build your record.</div>
              </div>
              <span class="npc-chevron">&rsaquo;</span>
            </div>
          </div>

          <!-- ── Next For You ── -->
          <div v-if="passports.length" class="dash-section">
            <div class="dash-eyebrow">Next for you</div>
            <div class="next-for-you-card">
              <div
                v-if="incompleteItemCount > 0"
                class="nfy-row"
                @click="navigateTo('/passportview/' + passports[0].id)"
              >
                <div class="nfy-icon nfy-icon-teal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 8h6M9 12h6M9 16h3" />
                  </svg>
                </div>
                <div class="nfy-body">
                  <div class="nfy-title">Complete {{ incompleteItemCount }} items in your Passport</div>
                  <div class="nfy-sub">Add documents and details to build your record.</div>
                </div>
                <span class="nfy-chevron">&rsaquo;</span>
              </div>
              <div class="nfy-row" @click="navigateTo(homeScoreHref)">
                <div class="nfy-icon nfy-icon-amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 11 14 10 22 21 10 13 10 13 2" />
                  </svg>
                </div>
                <div class="nfy-body">
                  <div class="nfy-title">Improve your EPC</div>
                  <div class="nfy-sub">See how you could improve your score and save.</div>
                </div>
                <span class="nfy-chevron">&rsaquo;</span>
              </div>
            </div>
          </div>

          <!-- ── HomeScore ── -->
          <div v-if="passports.length" class="dash-section">
            <div class="dash-eyebrow">HomeScore</div>
            <div class="homescore-card">
              <div class="hsc-top">
                <img src="/op-icons/homescore/house.png" alt="" class="hsc-house-img" loading="lazy" />
                <div class="hsc-info">
                  <div class="hsc-title">Your home today</div>
                  <div class="hsc-sub">
                    See how your home performs on energy, running costs, value and more.
                  </div>
                </div>
                <div class="hsc-ring">
                  <svg viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="dashHomescoreGrad" x1="1" y1="0" x2="0" y2="0">
                        <stop offset="0%" stop-color="#00BB93" />
                        <stop offset="100%" stop-color="#016F84" />
                      </linearGradient>
                    </defs>
                    <circle class="hsc-ring-bg" cx="50" cy="50" r="42" />
                    <circle
                      class="hsc-ring-fill"
                      cx="50" cy="50" r="42"
                      :stroke-dasharray="263.9"
                      :stroke-dashoffset="homeScoreDashoffset"
                    />
                  </svg>
                  <div class="hsc-ring-label">
                    <span class="hsc-ring-num">{{ passports[0].homeScore ?? '—' }}</span>
                    <span class="hsc-ring-den">/100</span>
                  </div>
                </div>
              </div>
              <div v-if="passports[0].homeScorePotential != null" class="hsc-potential-row">
                <span>Potential score</span>
                <strong>{{ passports[0].homeScorePotential }}/100</strong>
              </div>
              <button class="hsc-cta" type="button" @click="navigateTo(homeScoreHref)">
                See my HomeScore
                <span>&rarr;</span>
              </button>
            </div>
          </div>

          <!-- ── Add another property ── -->
          <div class="add-property-row" @click="startClaimFlow">
            <div class="apr-icon">+</div>
            <div class="apr-body">
              <div class="apr-title">Add another property</div>
              <div class="apr-sub">Verify ownership, then choose Rental or Seller Passport.</div>
            </div>
            <span class="apr-chevron">&rsaquo;</span>
          </div>
        </template>

        <ForYouFeed
          class="dash-section"
          style="margin-top: 20px"
          :properties="properties"
          :loading="loadingProperties"
          :needs-postcode="needsPostcode"
          :has-filters="hasAnyForYouFilters"
          @open-filters="openForYouFilters"
        />
      </template>
    </div>

    <PropertySearchFiltersModal
      v-model="forYouFiltersModalOpen"
      :initial-filters="forYouPendingFilters"
      @search="onForYouFiltersSearch"
    />

    <BottomNav active="explore" />
  </div>
</template>

<script setup lang="ts">
// Role-specific dashboards that replace Explore as the post-login
// landing page. Seller/'both' and Buyer are built; Landlord still
// bounces to /explore, which keeps its current behavior unchanged and
// untouched by this page.
definePageMeta({ title: 'Dashboard - UmovingU', middleware: 'auth' })

import { ref, computed, onMounted } from 'vue'
import NotificationBell from '~/components/ui/NotificationBell.vue'
import UserAvatar from '~/components/ui/UserAvatar.vue'
import BottomNav from '~/components/core/BottomNav.vue'
import PassportCard from '~/components/passport-view/PassportCard.vue'
import PropertyImage from '~/components/property/PropertyImage.vue'
import PropertySearchExperienceClassic from '~/components/property/PropertySearchExperienceClassic.vue'
import ForYouFeed from '~/components/property/ForYouFeed.vue'
import PropertySearchFiltersModal from '~/components/property/PropertySearchFiltersModal.vue'
import { usePropertyForYou } from '~/composables/usePropertyForYou'

const config = useRuntimeConfig()
const { profile, fetchProfile } = useProfile()

const searchMode = ref(false)
const roleResolved = ref(false)
const role = ref<string>('buy')

const passports = ref<any[]>([])
const loadingPassport = ref(true)
const passportSections = ref<any[]>([])

const buyerProfile = ref<any>(null)
const loadingBuyerProfile = ref(true)
const savedProperties = ref<any[]>([])
const loadingSaved = ref(true)

const {
  properties,
  loadingProperties,
  needsPostcode,
  forYouFiltersModalOpen,
  forYouPendingFilters,
  hasAnyForYouFilters,
  openForYouFilters,
  onForYouFiltersSearch,
} = usePropertyForYou()

const greeting = computed(() => {
  const h = new Date().getHours()
  const timeOfDay = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const first = profile.value?.firstName?.trim()
  const emailLocal = profile.value?.email?.split('@')[0]?.trim()
  const name = first || emailLocal || ''
  return name ? `${timeOfDay}, ${name} 👋` : `${timeOfDay} 👋`
})

const homeScoreDashoffset = computed(() => {
  const s = passports.value[0]?.homeScore
  if (typeof s !== 'number') return '263.9'
  return (263.9 * (1 - Math.min(Math.max(s, 0), 100) / 100)).toFixed(1)
})

const homeScoreHref = computed(() => {
  const propertyId = passports.value[0]?.propertyId
  return propertyId ? `/homescore/${propertyId}` : '/homescore'
})

// Real KYC signal — see buyer-profile.service.ts's getMine(), which
// overrides the (always-false) stored idVerified column with the actual
// User.kycStatus check before this ever reaches the frontend.
const buyerIdVerified = computed(() => buyerProfile.value?.idVerified === true)

// No isolated "finance %" field exists on BuyerProfile — derived from
// the underlying funds fields instead of inventing a number: nothing
// set yet (0%), funds declared but not reviewed (55%), reviewed and
// verified (100%).
const financePercent = computed(() => {
  const p = buyerProfile.value
  if (!p) return 0
  if (p.fundsVerified) return 100
  if (p.fundsType && p.fundsAmount != null) return 55
  return 0
})

// BuyerProfile has 5 flat completion steps (identity/funds/chain/
// solicitor/statement), not a sections→tasks→questions tree like a
// real Passport — completedSteps is the closest real equivalent to
// incompleteItemCount above.
const buyerIncompleteCount = computed(() => {
  const steps = buyerProfile.value?.completedSteps ?? 0
  return Math.max(0, 5 - steps)
})

// Sum of unanswered questions across every task in every section — the
// "Complete N items in your Passport" count. Nothing to derive this
// server-side yet, so it's computed here from GET /passport/:id/sections,
// which already returns per-task totalQuestions/answeredQuestions.
const incompleteItemCount = computed(() => {
  let total = 0
  for (const section of passportSections.value) {
    for (const task of section?.tasks ?? []) {
      total += Math.max(0, (task.totalQuestions ?? 0) - (task.answeredQuestions ?? 0))
    }
  }
  return total
})

function startClaimFlow() {
  navigateTo('/claim')
}

function normalizeRole(r: unknown): string {
  const allowed = ['sell', 'buy', 'both', 'landlord']
  return typeof r === 'string' && allowed.includes(r) ? r : 'buy'
}

// 'both' users still have a seller passport to manage and there's no
// buy+sell dashboard yet, so they see the seller branch here too —
// just without any buyer-specific content until that's built. Pure
// 'landlord' is the only role still bounced to /explore.
function isDashboardRole(r: string): boolean {
  return r === 'sell' || r === 'both' || r === 'buy'
}

onMounted(async () => {
  if (!profile.value) await fetchProfile()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return

  // A cached role from a previous visit lets landlord users bounce back
  // to Explore immediately, without waiting on the network round trip.
  //
  // Deliberate exception to "Explore is retired everywhere": landlord
  // has no dashboard content built yet, so this is the one remaining
  // live target for /explore in the app — pointing it at /dashboard
  // instead would just redirect a landlord user back to this same
  // check, in a page with nothing for their role to render. Every
  // other /explore reference in the app has been replaced; this one
  // stays until a landlord dashboard exists.
  const cachedRole = typeof window !== 'undefined' ? localStorage.getItem('umu_role') : null
  if (cachedRole && !isDashboardRole(normalizeRole(cachedRole))) {
    navigateTo('/explore', { replace: true })
    return
  }

  const prefResult = await $fetch<any>(`${config.public.apiBase}/profile/preferences`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null)

  role.value = normalizeRole((prefResult?.purpose as string[])?.[0] ?? cachedRole)
  if (typeof window !== 'undefined') localStorage.setItem('umu_role', role.value)

  if (!isDashboardRole(role.value)) {
    // Same landlord exception as above.
    navigateTo('/explore', { replace: true })
    return
  }
  roleResolved.value = true

  if (role.value === 'buy') {
    const [buyerResult, savedResult] = await Promise.allSettled([
      $fetch<any>(`${config.public.apiBase}/buyer-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      $fetch<any[]>(`${config.public.apiBase}/property/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])

    if (buyerResult.status === 'fulfilled') {
      buyerProfile.value = buyerResult.value ?? null
    }
    loadingBuyerProfile.value = false

    if (savedResult.status === 'fulfilled') {
      savedProperties.value = savedResult.value ?? []
    }
    loadingSaved.value = false
    return
  }

  const [passportResult, propResult] = await Promise.allSettled([
    $fetch<any[]>(`${config.public.apiBase}/profile/passports`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    $fetch<{ items: any[]; needsPostcode?: boolean }>(`${config.public.apiBase}/property/for-you`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])

  if (passportResult.status === 'fulfilled') {
    const all = passportResult.value ?? []
    // /profile/passports returns every passport the user owns, any type,
    // most-recently-visited first. A 'both' user could have a BUYER
    // passport ahead of their SELLER one — this card is seller-specific,
    // so prefer a SELLER passport if they have one, falling back to
    // whatever's first (e.g. LANDLORD) rather than showing nothing.
    const seller = all.filter((p: any) => p.type === 'SELLER')
    passports.value = seller.length ? seller : all
  }
  loadingPassport.value = false

  if (propResult.status === 'fulfilled') {
    properties.value = propResult.value?.items ?? []
    needsPostcode.value = propResult.value?.needsPostcode === true
  }
  loadingProperties.value = false

  if (passports.value.length) {
    const sections = await $fetch<any[]>(
      `${config.public.apiBase}/passport/${passports.value[0].id}/sections`,
      { headers: { Authorization: `Bearer ${token}` } },
    ).catch(() => [])
    passportSections.value = sections ?? []
  }
})
</script>

<style scoped>
.dash-root {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #f8f7fc;
}

.dash-hero {
  background: #fff;
  padding: 16px 20px;
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}

.hero-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
}
.hero-row1 > :first-child {
  flex: 1 1 auto;
  min-width: 0;
}
.hero-row1 > :last-child {
  flex: 0 0 auto;
}

.dash-greeting-sub {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.dash-title {
  font-size: 22px;
  font-weight: 900;
  color: #231d45;
  letter-spacing: -0.4px;
  margin-top: 2px;
}

.hero-avatar {
  cursor: pointer;
  flex-shrink: 0;
}
.dash-tour-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  color: #00a19a;
  font-size: 14px;
  font-weight: 800;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-family: inherit;
}

.dash-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px calc(100px + env(safe-area-inset-bottom));
  background: #f8f7fc;
}

.dash-section {
  margin-bottom: 20px;
}
.dash-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 10px;
}
.dash-eyebrow-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}
.dash-eyebrow-row .dash-eyebrow {
  margin-bottom: 0;
}
.watching-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  margin-left: 5px;
  background: #e0f4f1;
  color: #00817c;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0;
}
.dash-view-all {
  font-size: 13px;
  font-weight: 700;
  color: #00a19a;
  cursor: pointer;
}

/* ── Explore a property (buyer intro card) ── */
.explore-intro-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 10px;
}
.eic-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e0f4f1;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.eic-body {
  flex: 1;
  min-width: 0;
}
.eic-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 2px;
}
.eic-sub {
  font-size: 12px;
  color: #6b7089;
  line-height: 1.4;
}

/* ── Your Active Passport ── */
.active-passport-card {
  background: #fff;
  border: 1.5px solid #e5f4f2;
  border-radius: 20px;
  padding: 16px;
  cursor: pointer;
}
.apc-main {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}
.apc-passport-slot {
  width: 92px;
  flex-shrink: 0;
}
.apc-passport-slot :deep(.passport-card) {
  margin: 0;
  perspective: none;
}
.apc-passport-slot :deep(.passport-container) {
  width: 100%;
  max-width: none;
}
.apc-info {
  flex: 1;
  min-width: 0;
}
.apc-pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #00817c;
  background: #e0f4f1;
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 8px;
}
.apc-address {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  line-height: 1.25;
  letter-spacing: -0.2px;
}
.apc-postcode {
  font-size: 13px;
  color: #6b7089;
  margin-bottom: 10px;
}
.apc-verified-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 700;
  color: #00817c;
  margin-bottom: 10px;
}
.apc-progress-row {
  font-size: 12.5px;
  color: #4a5568;
  margin-bottom: 6px;
}
.apc-progress-row strong {
  color: #00817c;
  font-weight: 800;
}
.apc-progress-track {
  height: 6px;
  background: #eef0f6;
  border-radius: 999px;
  overflow: hidden;
}
.apc-progress-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 999px;
  transition: width 0.3s;
}
.apc-continue-btn {
  width: 100%;
  background: #00a19a;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  padding: 13px;
  border-radius: 12px;
  margin-bottom: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.apc-viewall-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 13.5px;
  font-weight: 700;
  color: #00a19a;
  cursor: pointer;
  padding: 4px;
}

.no-passport-card {
  background: #fff;
  border: 2px dashed #e0e0e8;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.npc-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e0f4f1;
  color: #00a19a;
  font-size: 18px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.npc-body {
  flex: 1;
  min-width: 0;
}
.npc-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.npc-sub {
  font-size: 12.5px;
  color: #6b7089;
}
.npc-chevron {
  font-size: 18px;
  color: #c7c5d6;
  flex-shrink: 0;
}

/* ── Next For You ── */
.next-for-you-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  overflow: hidden;
}
.nfy-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eef0f6;
}
.nfy-row:last-child {
  border-bottom: none;
}
.nfy-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.nfy-icon-teal {
  background: #e0f4f1;
  color: #00a19a;
}
.nfy-icon-amber {
  background: #fdf3e4;
  color: #d4922a;
}
.nfy-body {
  flex: 1;
  min-width: 0;
}
.nfy-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 2px;
}
.nfy-sub {
  font-size: 12.5px;
  color: #6b7089;
  line-height: 1.4;
}
.nfy-chevron {
  font-size: 18px;
  color: #c7c5d6;
  flex-shrink: 0;
}

/* ── HomeScore ── */
.homescore-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  padding: 16px;
}
.hsc-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.hsc-house-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  flex-shrink: 0;
}
.hsc-info {
  flex: 1;
  min-width: 0;
}
.hsc-title {
  font-size: 14.5px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 4px;
}
.hsc-sub {
  font-size: 12px;
  color: #6b7089;
  line-height: 1.45;
}
.hsc-ring {
  position: relative;
  width: 76px;
  height: 76px;
  flex-shrink: 0;
}
.hsc-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.hsc-ring-bg {
  fill: none;
  stroke: #ededf3;
  stroke-width: 9;
}
.hsc-ring-fill {
  fill: none;
  stroke: url(#dashHomescoreGrad);
  stroke-width: 9;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s;
}
.hsc-ring-label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.hsc-ring-num {
  font-size: 17px;
  font-weight: 900;
  color: #231d45;
  line-height: 1;
}
.hsc-ring-den {
  font-size: 8.5px;
  font-weight: 700;
  color: #9c98ad;
}
.hsc-potential-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid #eef0f6;
  font-size: 13px;
  color: #6b7089;
}
.hsc-potential-row strong {
  color: #00817c;
  font-weight: 800;
  font-size: 14px;
}
.hsc-cta {
  width: 100%;
  background: #e0f4f1;
  color: #00514d;
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  padding: 11px;
  border-radius: 12px;
  margin-top: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* ── Add another property ── */
.add-property-row {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.apr-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e0f4f1;
  color: #00a19a;
  font-size: 18px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.apr-body {
  flex: 1;
  min-width: 0;
}
.apr-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.apr-sub {
  font-size: 12.5px;
  color: #6b7089;
}
.apr-chevron {
  font-size: 18px;
  color: #c7c5d6;
  flex-shrink: 0;
}

/* ── Watching (saved properties) ── */
.watching-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  padding: 12px;
}
.watch-row {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.watch-img-wrap {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f5f9;
}
.watch-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.watch-body {
  flex: 1;
  min-width: 0;
}
.watch-address {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.watch-postcode {
  font-size: 12.5px;
  color: #6b7089;
  margin-top: 1px;
}
.watch-hs {
  font-size: 12px;
  color: #6b7089;
  margin-top: 3px;
}
.watch-hs strong {
  color: #00817c;
  font-weight: 800;
}
.watch-updates-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: #f4f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 700;
  color: #6b7089;
  cursor: pointer;
  flex-shrink: 0;
}
.watch-more-link {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eef0f6;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #00a19a;
  cursor: pointer;
}
</style>
