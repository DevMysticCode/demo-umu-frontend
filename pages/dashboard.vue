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
      <PropertySearchExperienceClassic
        ref="searchExperienceEl"
        placeholder="Search by postcode, address or area"
        use-typewriter-placeholder
        @update:search-mode="searchMode = $event"
      />

      <template v-if="!searchMode && roleResolved && role === 'buy'">
        <div v-if="loadingBuyerProfile" class="skeleton-card" style="height: 220px; margin-bottom: 20px" />

        <template v-else>
          <RecentlyViewedFeed :properties="recentlyViewed" :loading="loadingRecentlyViewed" />

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
              <div v-if="buyerStalenessCopy" class="nfy-stale-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {{ buyerStalenessCopy }}
              </div>
              <div
                v-if="buyerIncompleteCount > 0"
                class="nfy-row"
                @click="navigateTo('/buyer-profile/build')"
              >
                <div class="nfy-icon nfy-icon-teal">
                  <img src="/op-icons/investment/clipboardChecklist.png" alt="" class="nfy-icon-img" loading="lazy" />
                </div>
                <div class="nfy-body">
                  <div class="nfy-title">Complete {{ buyerIncompleteCount }} items in your Passport</div>
                  <div class="nfy-sub">Add documents and details to build your record.</div>
                </div>
                <span class="nfy-chevron">&rsaquo;</span>
              </div>
              <div class="nfy-row" @click="navigateTo('/buyer-profile/build')">
                <div class="nfy-icon nfy-icon-teal">
                  <img src="/op-icons/buyer-profile-build/bank.png" alt="" class="nfy-icon-img" loading="lazy" />
                </div>
                <div class="nfy-body">
                  <div class="nfy-title">Upload proof of funds or AIP</div>
                  <div class="nfy-sub">Strengthen your position and unlock more.</div>
                </div>
                <span class="nfy-chevron">&rsaquo;</span>
              </div>
              <div class="nfy-row" @click="navigateTo('/buyer-profile/build')">
                <div class="nfy-icon nfy-icon-amber">
                  <img src="/op-icons/investment/chainLink.png" alt="" class="nfy-icon-img" loading="lazy" />
                </div>
                <div class="nfy-body">
                  <div class="nfy-title">Confirm your buying position</div>
                  <div class="nfy-sub">Let agents and sellers know where you are in the chain.</div>
                </div>
                <span class="nfy-chevron">&rsaquo;</span>
              </div>
            </div>
          </div>

          <!-- ── HomeScore explore entry ── -->
          <div class="dash-section">
            <div class="homescore-explore-card" @click="navigateTo('/homescore')">
              <div class="hec-gauge">
                <svg viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="hecGaugeGrad" x1="1" y1="0" x2="0" y2="0">
                      <stop offset="0%" stop-color="#00BB93" />
                      <stop offset="100%" stop-color="#016F84" />
                    </linearGradient>
                  </defs>
                  <circle class="hec-gauge-bg" cx="50" cy="50" r="42" />
                  <circle class="hec-gauge-fill" cx="50" cy="50" r="42" stroke-dasharray="263.9" stroke-dashoffset="47.5" />
                </svg>
                <div class="hec-gauge-label">
                  <span class="hec-gauge-num">82</span>
                </div>
              </div>
              <div class="hec-body">
                <div class="hec-title">Check any home's HomeScore</div>
                <div class="hec-sub">
                  Instant insight on energy, running costs and value - for any UK property, not just your own.
                </div>
                <span class="hec-cta">Run a free HomeScore <span>&rarr;</span></span>
              </div>
            </div>
          </div>

          <!-- ── Watching ── -->
          <div class="dash-section">
            <div class="dash-eyebrow-row">
              <div class="dash-eyebrow">
                Watching
                <span v-if="watchedProperties.length" class="watching-badge">{{ watchedProperties.length }}</span>
              </div>
              <div class="dash-view-all" @click="navigateTo('/profile/watched-properties')">View all</div>
            </div>

            <div v-if="loadingWatched" class="skeleton-card" style="height: 100px" />

            <div v-else-if="watchedProperties.length" class="watching-card">
              <div class="watch-row" @click="navigateTo('/property/' + watchedProperties[0].id)">
                <div class="watch-img-wrap">
                  <PropertyImage
                    :src="watchedProperties[0].imageUrl"
                    :alt="watchedProperties[0].addressLine1"
                    :show-caption="false"
                    class="watch-img"
                  />
                </div>
                <div class="watch-body">
                  <div class="watch-address">{{ watchedProperties[0].addressLine1 }}</div>
                  <div class="watch-postcode">{{ watchedProperties[0].postcode }}</div>
                  <div v-if="watchedProperties[0].homeScore != null" class="watch-hs">
                    HomeScore <strong>{{ watchedProperties[0].homeScore }}/100</strong>
                  </div>
                </div>
                <button
                  type="button"
                  class="watch-updates-btn"
                  @click.stop="navigateTo('/property/' + watchedProperties[0].id)"
                >
                  <img src="/op-icons/misc/bell.png" alt="" class="watch-updates-ic" loading="lazy" />
                  Updates
                </button>
              </div>
              <div
                v-if="watchedProperties.length > 1"
                class="watch-more-link"
                @click="navigateTo('/profile/watched-properties')"
              >
                {{ watchedProperties.length - 1 }} more propert{{ watchedProperties.length - 1 === 1 ? 'y' : 'ies' }} watching
              </div>
            </div>

            <div v-else class="no-passport-card" @click="navigateTo('/discover')">
              <div class="npc-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div class="npc-body">
                <div class="npc-title">Nothing watched yet</div>
                <div class="npc-sub">Explore properties and watch the ones you like.</div>
              </div>
              <span class="npc-chevron">&rsaquo;</span>
            </div>
          </div>

          <ForYouFeed
            class="dash-section"
            style="margin-top: 20px"
            :properties="properties"
            :loading="loadingProperties"
            :needs-postcode="needsPostcode"
            :has-filters="hasAnyForYouFilters"
            @open-filters="openForYouFilters"
            @postcode-saved="refetchForYou"
          />
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

          <!-- ── Legislation & News (landlord only) ──────────────────
               Moved here from the landlord passport's own compliance
               screen — same curated dataset (utils/landlordNews.ts),
               so the two never drift apart. See that file's own
               comment for why this is a curated snapshot, not a live
               feed. -->
          <div v-if="role === 'landlord'" class="dash-section">
            <div class="dash-eyebrow">Legislation &amp; news</div>
            <div class="dash-news-rail">
              <a
                v-for="n in dashNewsItems"
                :key="n.url"
                class="dash-news-card"
                :href="n.url"
                target="_blank"
                rel="noopener"
              >
                <div class="dash-news-band" :class="`dash-news-band--${n.tag}`" />
                <div class="dash-news-bd">
                  <span class="dash-news-tag" :class="`dash-news-tag--${n.tag}`">{{ n.tagLabel }}</span>
                  <div class="dash-news-t">{{ n.title }}</div>
                  <div class="dash-news-s">{{ n.summary }}</div>
                  <div class="dash-news-src">{{ n.source }}</div>
                </div>
              </a>
            </div>
            <NuxtLink to="/profile/news" class="dash-news-all">See all updates ›</NuxtLink>
          </div>

          <!-- ── Next For You ── -->
          <div v-if="passports.length" class="dash-section">
            <div class="dash-eyebrow">Next for you</div>
            <div class="next-for-you-card">
              <div v-if="sellerStalenessCopy" class="nfy-stale-banner">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {{ sellerStalenessCopy }}
              </div>
              <div
                v-if="incompleteItemCount > 0"
                class="nfy-row"
                @click="navigateTo('/passportview/' + passports[0].id)"
              >
                <div class="nfy-icon nfy-icon-teal">
                  <img src="/op-icons/investment/clipboardChecklist.png" alt="" class="nfy-icon-img" loading="lazy" />
                </div>
                <div class="nfy-body">
                  <div class="nfy-title">Complete {{ incompleteItemCount }} items in your Passport</div>
                  <div class="nfy-sub">Add documents and details to build your record.</div>
                </div>
                <span class="nfy-chevron">&rsaquo;</span>
              </div>
              <div class="nfy-row" @click="navigateTo(homeScoreHref)">
                <div class="nfy-icon nfy-icon-amber">
                  <img src="/op-icons/buyer-passport/epcRating.png" alt="" class="nfy-icon-img" loading="lazy" />
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
                    <span class="hsc-ring-num">{{ passports[0].homeScore ?? '-' }}</span>
                    <span class="hsc-ring-den">/100</span>
                  </div>
                </div>
                <div class="hsc-info">
                  <div class="hsc-title">Your home today</div>
                  <div class="hsc-sub">
                    See how your home performs on energy, running costs, value and more.
                  </div>
                </div>
                <img src="/op-icons/landing/homeScoreCard.png" alt="" class="hsc-house-img" loading="lazy" />
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

          <!-- ── HomeScore explore entry ── -->
          <div class="dash-section">
            <div class="homescore-explore-card" @click="navigateTo('/homescore')">
              <div class="hec-gauge">
                <svg viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="hecGaugeGrad" x1="1" y1="0" x2="0" y2="0">
                      <stop offset="0%" stop-color="#00BB93" />
                      <stop offset="100%" stop-color="#016F84" />
                    </linearGradient>
                  </defs>
                  <circle class="hec-gauge-bg" cx="50" cy="50" r="42" />
                  <circle class="hec-gauge-fill" cx="50" cy="50" r="42" stroke-dasharray="263.9" stroke-dashoffset="47.5" />
                </svg>
                <div class="hec-gauge-label">
                  <span class="hec-gauge-num">82</span>
                </div>
              </div>
              <div class="hec-body">
                <div class="hec-title">Check any home's HomeScore</div>
                <div class="hec-sub">
                  Curious about a neighbour's home or somewhere you're eyeing up? Run a free HomeScore on any UK property.
                </div>
                <span class="hec-cta">Run a free HomeScore <span>&rarr;</span></span>
              </div>
            </div>
          </div>

          <!-- ── Also buying (role === 'both' only) ── -->
          <div v-if="role === 'both'" class="dash-section">
            <div class="dash-eyebrow">Also buying?</div>
            <div v-if="loadingBuyerSummary" class="skeleton-card" style="height: 100px" />
            <div v-else class="buyer-summary-strip">
              <div
                class="bss-row"
                @click="navigateTo(buyerProfile ? '/buyer-profile/view' : '/buyer-profile/build')"
              >
                <div class="bss-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div class="bss-body">
                  <div class="bss-title">
                    {{ buyerProfile ? 'Your Buyer Passport' : 'Start your Buyer Passport' }}
                  </div>
                  <div class="bss-sub">
                    {{ buyerProfile ? `Finance ${financePercent}% complete` : 'Verify your identity and buying position.' }}
                  </div>
                </div>
                <span class="bss-chevron">&rsaquo;</span>
              </div>
              <div class="bss-row" @click="navigateTo('/profile/watched-properties')">
                <div class="bss-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                </div>
                <div class="bss-body">
                  <div class="bss-title">Watching</div>
                  <div class="bss-sub">
                    {{ watchedProperties.length ? `${watchedProperties.length} propert${watchedProperties.length === 1 ? 'y' : 'ies'} watched` : 'Nothing watched yet' }}
                  </div>
                </div>
                <span class="bss-chevron">&rsaquo;</span>
              </div>
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
          @postcode-saved="refetchForYou"
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

import { ref, computed, onMounted, nextTick } from 'vue'
import NotificationBell from '~/components/ui/NotificationBell.vue'
import UserAvatar from '~/components/ui/UserAvatar.vue'
import BottomNav from '~/components/core/BottomNav.vue'
import PassportCard from '~/components/passport-view/PassportCard.vue'
import PropertyImage from '~/components/property/PropertyImage.vue'
import PropertySearchExperienceClassic from '~/components/property/PropertySearchExperienceClassic.vue'
import ForYouFeed from '~/components/property/ForYouFeed.vue'
import RecentlyViewedFeed from '~/components/property/RecentlyViewedFeed.vue'
import PropertySearchFiltersModal from '~/components/property/PropertySearchFiltersModal.vue'
import { usePropertyForYou } from '~/composables/usePropertyForYou'

const config = useRuntimeConfig()
const { profile, fetchProfile } = useProfile()
const route = useRoute()

const searchMode = ref(false)
const roleResolved = ref(false)
const role = ref<string>('buy')
const searchExperienceEl = ref<{ focus: () => void } | null>(null)

const passports = ref<any[]>([])
const loadingPassport = ref(true)
const passportSections = ref<any[]>([])

const buyerProfile = ref<any>(null)
const loadingBuyerProfile = ref(true)
const savedProperties = ref<any[]>([])
const loadingSaved = ref(true)
// Real watch list (PropertyWatch rows), distinct from savedProperties above
// — feeds the "Watching" section; savedProperties keeps feeding the
// separately-labelled "Saved" summary strip further down.
const watchedProperties = ref<any[]>([])
const loadingWatched = ref(true)
// Separate loading flag for the 'both'-role buyer summary strip on the
// seller dashboard — reuses buyerProfile/savedProperties (never populated
// by the seller branch otherwise) but needs its own loading state since
// loadingBuyerProfile/loadingSaved default to true and are only ever
// flipped false by the pure-buyer branch.
const loadingBuyerSummary = ref(true)

const recentlyViewed = ref<any[]>([])
const loadingRecentlyViewed = ref(true)

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

// Every daypart gets a bit of personality instead of a flat "Good X" —
// a small ChatGPT-style touch that makes the app read as paying attention
// to when you're actually opening it, not just stamping the clock. Late
// night and early morning get a warmer, question-style line (the two the
// user specifically asked for); the three standard dayparts get light
// rotation between two familiar phrasings so it doesn't feel robotic on
// every single visit either.
//
// Line choice is deterministic — derived from the date, NOT Math.random()
// — because this page renders on the server first and then hydrates on
// the client; a real random pick would very likely disagree between the
// two passes and throw a hydration-mismatch warning on every visit.
type Daypart = 'lateNight' | 'earlyMorning' | 'morning' | 'afternoon' | 'evening'

function daypartOf(hour: number): Daypart {
  if (hour >= 23 || hour < 5) return 'lateNight'
  if (hour < 8) return 'earlyMorning'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

const GREETING_LINES: Record<Daypart, string[]> = {
  lateNight: ['Having a late one', 'Burning the midnight oil', 'Still up'],
  earlyMorning: ['Up bright and early', 'Early start', 'Rise and shine'],
  morning: ['Good morning', 'Morning'],
  afternoon: ['Good afternoon', 'Afternoon'],
  evening: ['Good evening', 'Evening'],
}
// Late night / early morning read as a warm question ("Still up, Alex?");
// the three daytime dayparts stay a plain statement ("Good morning, Alex").
const GREETING_IS_QUESTION: Record<Daypart, boolean> = {
  lateNight: true,
  earlyMorning: true,
  morning: false,
  afternoon: false,
  evening: false,
}
const GREETING_EMOJI: Record<Daypart, string> = {
  lateNight: '🌙',
  earlyMorning: '☀️',
  morning: '👋',
  afternoon: '👋',
  evening: '👋',
}

const greeting = computed(() => {
  const now = new Date()
  const daypart = daypartOf(now.getHours())
  const lines = GREETING_LINES[daypart]
  const line = lines[now.getDate() % lines.length]
  const emoji = GREETING_EMOJI[daypart]
  const first = profile.value?.firstName?.trim()
  const emailLocal = profile.value?.email?.split('@')[0]?.trim()
  const name = first || emailLocal || ''

  if (GREETING_IS_QUESTION[daypart]) {
    return name ? `${line}, ${name}? ${emoji}` : `${line}? ${emoji}`
  }
  return name ? `${line}, ${name} ${emoji}` : `${line} ${emoji}`
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

// Legislation & News rail (landlord only) — same 5-item teaser slice
// as the landlord passport page used to show, now that it's moved
// here. NEWS_ITEMS is auto-imported from utils/landlordNews.ts.
const dashNewsItems = computed(() => NEWS_ITEMS.slice(0, 5))

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

// Real "started/last touched N days ago" nudge — not a fabricated
// deadline (there isn't one anywhere in the data; see
// plans/dashboard-ux-additions.md for why). Only shown once something's
// actually gone stale (3+ days), and only while the record is genuinely
// incomplete — a finished passport/profile has nothing to nudge toward.
function stalenessCopy(createdAt?: string | null, lastTouchedAt?: string | null): string | null {
  const source = lastTouchedAt || createdAt
  if (!source) return null
  const days = Math.floor((Date.now() - new Date(source).getTime()) / 86_400_000)
  if (days < 3) return null
  const verb = lastTouchedAt ? 'Last touched' : 'Started'
  const when = days === 1 ? 'yesterday' : `${days} days ago`
  return `${verb} ${when} - pick up where you left off.`
}

const sellerStalenessCopy = computed(() => {
  if (!passports.value.length || incompleteItemCount.value === 0) return null
  const p = passports.value[0]
  return stalenessCopy(p.createdAt, p.lastVisitedAt)
})

const buyerStalenessCopy = computed(() => {
  if (!buyerProfile.value || buyerIncompleteCount.value === 0) return null
  return stalenessCopy(buyerProfile.value.createdAt, buyerProfile.value.updatedAt)
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
// just without any buyer-specific content until that's built.
// 'landlord' shares that same branch too — /profile/passports already
// returns LANDLORD-type passports and the fallback below already
// anticipated this (see its own comment), so this was mostly wiring,
// not a new build. The one landlord-only addition is the Legislation
// & News rail, moved here from the passport page itself.
function isDashboardRole(r: string): boolean {
  return r === 'sell' || r === 'both' || r === 'buy' || r === 'landlord'
}

// Fired independently (not awaited alongside the rest of onMounted) —
// /property/for-you does live EPC/OS enrichment per candidate property
// and can take several seconds. Bundling it into the same
// Promise.allSettled as the fast profile/passport calls meant the WHOLE
// dashboard sat on its loading skeleton until the slowest of the two
// finished. ForYouFeed has its own :loading state, so it can show its
// own skeleton while everything above it is already interactive.
async function fetchForYou(token: string) {
  const result = await $fetch<{ items: any[]; needsPostcode?: boolean }>(
    `${config.public.apiBase}/property/for-you`,
    { headers: { Authorization: `Bearer ${token}` } },
  ).catch(() => null)
  properties.value = result?.items ?? []
  needsPostcode.value = result?.needsPostcode === true
  loadingProperties.value = false
}

// Fired by ForYouFeed's postcode sheet once a postcode is actually saved —
// re-reads the token fresh rather than closing over onMounted's local copy,
// since this can fire long after mount.
function refetchForYou() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (token) fetchForYou(token)
}

// 'both'-role users get a compact buyer summary strip on their (seller-
// branch) dashboard — same two calls the pure-buyer branch makes, fired
// independently so they never gate the seller passport/HomeScore content
// above them.
async function fetchBuyerSummary(token: string) {
  const [buyerResult, savedResult, watchedResult] = await Promise.allSettled([
    $fetch<any>(`${config.public.apiBase}/buyer-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    $fetch<any[]>(`${config.public.apiBase}/property/saved`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    $fetch<any[]>(`${config.public.apiBase}/property/watches`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])
  if (buyerResult.status === 'fulfilled') buyerProfile.value = buyerResult.value ?? null
  if (savedResult.status === 'fulfilled') savedProperties.value = savedResult.value ?? []
  if (watchedResult.status === 'fulfilled') watchedProperties.value = watchedResult.value ?? []
  loadingBuyerSummary.value = false
  loadingWatched.value = false
}

// Buyer-only "Recently viewed" strip — fired independently, same reason
// as fetchForYou above (own loading state, never gates the rest of the
// dashboard).
async function fetchRecentlyViewed(token: string) {
  const result = await $fetch<any[]>(`${config.public.apiBase}/property/recently-viewed`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null)
  recentlyViewed.value = result ?? []
  loadingRecentlyViewed.value = false
}

onMounted(async () => {
  // Arriving from property/[id].vue's "Back to Explore" (logged-in path)
  // via ?focusSearch=1 — focus the search bar immediately so its
  // typewriter placeholder starts right away, matching what a logged-out
  // user gets by landing on Discover's own search. Independent of the
  // role/profile fetch below since the search bar renders for every role.
  if (route.query.focusSearch) {
    await nextTick()
    searchExperienceEl.value?.focus()
  }

  if (!profile.value) await fetchProfile()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return

  // Every real role (sell/buy/both/landlord) now has dashboard content,
  // so isDashboardRole() is effectively always true post-normalization —
  // kept as a guard rather than deleted, in case a future role is added
  // here before its own dashboard branch exists.
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
    navigateTo('/explore', { replace: true })
    return
  }
  roleResolved.value = true

  if (role.value === 'buy') {
    fetchForYou(token) // not awaited - see fetchForYou's own comment
    fetchRecentlyViewed(token) // not awaited - see its own comment

    const [buyerResult, savedResult, watchedResult] = await Promise.allSettled([
      $fetch<any>(`${config.public.apiBase}/buyer-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      $fetch<any[]>(`${config.public.apiBase}/property/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      $fetch<any[]>(`${config.public.apiBase}/property/watches`, {
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

    if (watchedResult.status === 'fulfilled') {
      watchedProperties.value = watchedResult.value ?? []
    }
    loadingWatched.value = false
    return
  }

  fetchForYou(token) // not awaited - see fetchForYou's own comment
  if (role.value === 'both') fetchBuyerSummary(token) // not awaited - see its own comment

  const passportResult = await $fetch<any[]>(`${config.public.apiBase}/profile/passports`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null)

  if (passportResult) {
    const all = passportResult ?? []
    // /profile/passports returns every passport the user owns, any type,
    // most-recently-visited first. A 'both' user could have a BUYER
    // passport ahead of their SELLER one — this card is seller-specific,
    // so prefer a SELLER passport if they have one, falling back to
    // whatever's first (e.g. LANDLORD) rather than showing nothing.
    const seller = all.filter((p: any) => p.type === 'SELLER')
    passports.value = seller.length ? seller : all
  }
  loadingPassport.value = false

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

/* Legislation & News rail (landlord dashboard) - bleeds past
   .dash-scroll's 20px side padding to scroll edge-to-edge, same as the
   landlord passport page's version this was moved from. */
.dash-news-rail {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  margin: 0 -20px;
  padding: 2px 20px 10px;
  scroll-snap-type: x mandatory;
}
.dash-news-rail::-webkit-scrollbar { height: 0; }
.dash-news-card {
  flex: 0 0 240px;
  scroll-snap-align: start;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(35, 29, 65, 0.05);
  overflow: hidden;
  text-decoration: none;
  display: block;
}
.dash-news-band { height: 5px; }
.dash-news-band--law { background: linear-gradient(90deg, #c0492f, #992e1a); }
.dash-news-band--update { background: linear-gradient(90deg, #00a19a, #008a84); }
.dash-news-band--news { background: linear-gradient(90deg, #3d63c9, #2c4aa0); }
.dash-news-bd { padding: 12px 13px 14px; }
.dash-news-tag { font-size: 9.5px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase; display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 100px; }
.dash-news-tag--law { background: #fbeae5; color: #992e1a; }
.dash-news-tag--update { background: #f2faf8; color: #008a84; }
.dash-news-tag--news { background: #e8edfb; color: #3d63c9; }
.dash-news-t { font-size: 13.5px; font-weight: 700; color: #0e2840; line-height: 1.25; margin-top: 9px; letter-spacing: -0.2px; }
.dash-news-s { font-size: 11.5px; font-weight: 500; color: #6b7089; line-height: 1.4; margin-top: 5px; }
.dash-news-src { font-size: 10.5px; font-weight: 700; color: #a8a9ad; margin-top: 9px; }
.dash-news-all { display: block; margin: 2px 0 4px; text-align: center; font-size: 12.5px; font-weight: 700; color: #008a84; text-decoration: none; padding: 6px; }
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
.nfy-stale-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  background: #fdf3e4;
  color: #9a6a1a;
  font-size: 12px;
  font-weight: 700;
  border-bottom: 1px solid #eef0f6;
}
.nfy-stale-banner svg {
  flex-shrink: 0;
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
/* No colored circle backdrop - these are real 3D icons with their own
   built-in floating base (same convention as everywhere else in the
   app), so a flat color-pill behind them just doubled up the "icon
   container" look and made them read smaller than they are. Sized to
   match .hec-gauge just below in the HomeScore explore card. */
.nfy-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.nfy-icon-img {
  width: 46px;
  height: 46px;
  object-fit: contain;
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

/* ── HomeScore explore entry (any property, not the user's own) ── */
.homescore-explore-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #f1faf8 0%, #e4f5f0 100%);
  border: 1px solid #d5efe8;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
}
.hec-gauge {
  position: relative;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
}
.hec-gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.hec-gauge-bg {
  fill: none;
  stroke: #d5efe8;
  stroke-width: 10;
}
.hec-gauge-fill {
  fill: none;
  stroke: url(#hecGaugeGrad);
  stroke-width: 10;
  stroke-linecap: round;
}
.hec-gauge-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hec-gauge-num {
  font-size: 13px;
  font-weight: 800;
  color: #016f84;
}
.hec-body {
  flex: 1;
  min-width: 0;
}
.hec-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 3px;
}
.hec-sub {
  font-size: 12px;
  color: #6b7089;
  line-height: 1.45;
  margin-bottom: 8px;
}
.hec-cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 800;
  color: #00817c;
}

/* ── Also buying (role === 'both') ── */
.buyer-summary-strip {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  overflow: hidden;
}
.bss-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eef0f6;
}
.bss-row:last-child {
  border-bottom: none;
}
.bss-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eef0fb;
  color: #4b3fa0;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.bss-body {
  flex: 1;
  min-width: 0;
}
.bss-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 2px;
}
.bss-sub {
  font-size: 12.5px;
  color: #6b7089;
}
.bss-chevron {
  font-size: 18px;
  color: #c7c5d6;
  flex-shrink: 0;
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
.watch-updates-ic {
  width: 17px;
  height: 17px;
  object-fit: contain;
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
