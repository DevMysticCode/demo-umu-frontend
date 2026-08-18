<template>
  <div class="mobile-container explore-root">
    <div class="explore-hero">
      <div class="hero-row1">
        <div>
          <div class="explore-greeting-sub">{{ greeting }}</div>
          <div class="explore-title">Explore property passports</div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px">
          <!-- The New / Returning toggle was removed. The "New" view is now
               shown automatically on the user's first ever visit to Explore
               (gated by the `umu_explore_visited_v1` flag set in onMounted);
               every visit after that lands them on the Returning view. -->
          <button
            class="explore-tour-btn"
            aria-label="Take a quick tour"
            data-tour="tour-btn"
            @click="exploreTourRef?.start?.()"
          >
            ?
          </button>
          <NotificationBell data-tour="notifications" />
          <div
            class="hero-avatar"
            data-tour="avatar"
            @click="navigateTo('/profile')"
          >
            <UserAvatar
              :src="profile?.avatarUrl"
              :firstName="profile?.firstName"
              :lastName="profile?.lastName"
              :size="36"
            />
          </div>
        </div>
      </div>

      <SearchFilterBar
        v-model="searchQuery"
        placeholder="Search by postcode, address or area"
        style="margin-bottom: 6px"
        @select="onSearchBarSelect"
        @enter="doSearch"
        @filters-change="onFiltersChange"
      />

      <div v-if="selectedAddress" class="selected-addr-pill">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#00A19A"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <div style="flex: 1; font-size: 13px; font-weight: 700; color: #231d45">
          {{ selectedAddressText }}
        </div>
        <div class="search-clear-btn" @click="clearSearch">x</div>
      </div>
    </div>

    <div class="explore-scroll">
      <!-- ── Search Results Mode ── -->
      <template v-if="searchMode">
        <div class="search-back-row">
          <button class="search-back-btn" @click="exitSearch">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div class="search-result-label">
            <span v-if="!searchLoading && searchTotal > 0">
              {{ searchTotal }}
              {{ searchTotal === 1 ? 'result' : 'results' }} for "{{
                searchQuery
              }}"
            </span>
            <span v-else>Results for "{{ searchQuery }}"</span>
          </div>
        </div>
        <div v-if="searchLoading" class="skeletons">
          <div v-for="n in 4" :key="n" class="skeleton-card" />
        </div>
        <template v-else-if="searchProperties.length > 0">
          <div
            v-for="prop in searchProperties"
            :key="prop.id"
            class="prop-card"
            @click="navigateTo('/property/' + prop.id)"
          >
            <div
              class="prop-img-wrap"
              :style="{
                background:
                  prop.imgGradient || 'linear-gradient(135deg,#dff4f0,#c8ebe6)',
              }"
            >
              <PropertyImage
                :src="prop.imageUrl || prop.image"
                :alt="prop.addressLine1 || prop.address"
                :show-caption="false"
                class="prop-img"
              />
              <div v-if="prop.hasPassport" class="prop-badge-pp">
                <img
                  src="/op-icons/passportview/umu-passport.png"
                  alt=""
                  class="pp-emoji-ic"
                />
                Passport
              </div>
              <div class="prop-price-tag">
                {{
                  prop.estimatedPrice
                    ? '£' + Math.round(prop.estimatedPrice).toLocaleString()
                    : prop.priceDisplay || 'POA'
                }}
              </div>
            </div>
            <div class="prop-body">
              <div class="prop-row-top">
                <div class="prop-title-col">
                  <div class="prop-address">
                    {{ prop.addressLine1 || prop.address }}
                  </div>
                  <div class="prop-area">
                    {{
                      prop.city
                        ? prop.city + ', ' + prop.postcode
                        : prop.area || prop.postcode || ''
                    }}
                  </div>
                </div>
                <div
                  v-if="prop.epcRating"
                  class="epc-badge"
                  :style="{ background: epcColor(prop.epcRating) }"
                >
                  <div class="epc-badge-label">EPC</div>
                  <div class="epc-badge-rating">{{ prop.epcRating }}</div>
                </div>
              </div>
              <div class="prop-pills">
                <span v-if="prop.propertyType || prop.type" class="pill-grey">{{
                  prop.propertyType || prop.type
                }}</span>
                <span v-if="prop.tenure" class="pill-grey">{{
                  prop.tenure
                }}</span>
              </div>
              <div class="prop-footer">
                <div class="prop-score-row" v-if="prop.HomeScore">
                  <span class="prop-score-lbl">HomeScore</span>
                  <div class="prop-score-bar">
                    <div
                      class="prop-score-fill"
                      :style="{ width: prop.HomeScore + '%' }"
                    ></div>
                  </div>
                  <span class="prop-score-num">{{ prop.HomeScore }}</span>
                </div>
                <span class="prop-passport-btn">View →</span>
              </div>
            </div>
          </div>
          <!-- Load-more sentinel + status -->
          <div
            v-if="hasMoreResults"
            ref="loadMoreSentinel"
            class="load-more-sentinel"
          >
            <div v-if="searchLoadingMore" class="load-more-spinner" />
            <button v-else class="load-more-btn" @click="loadMoreResults">
              Load
              {{
                Math.min(
                  SEARCH_PAGE_SIZE,
                  searchTotal - searchProperties.length,
                )
              }}
              more
            </button>
          </div>
          <div v-else class="load-more-end">
            {{
              searchProperties.length === 1
                ? '1 result shown'
                : searchProperties.length + ' results shown'
            }}
          </div>
        </template>
        <div v-else class="no-results-msg">
          <div class="no-results-icon"><img src="/op-icons/homescore/magnifier.png" alt="" loading="lazy" /></div>
          <div class="no-results-text">No properties found</div>
          <div class="no-results-sub">Try a different postcode or area</div>
        </div>
      </template>

      <template v-else-if="view === 'new'">
        <template
          v-if="role === 'sell' || role === 'landlord' || role === 'both'"
        >
          <div class="claim-banner" data-tour="claim-banner">
            <div class="claim-glow"></div>
            <div style="position: relative; z-index: 1">
              <div class="claim-eyebrow">Your first step</div>
              <div class="claim-title">Start your Property Passport</div>
              <div class="claim-sub">
                Verify your ownership. Build your record. Buyers trust verified
                sellers - sell up to 12x faster.
              </div>
              <div class="claim-stats-row">
                <div class="claim-stat-box">
                  <div class="claim-stat-val">12x</div>
                  <div class="claim-stat-lbl">faster to exchange</div>
                </div>
                <div class="claim-stat-box">
                  <div class="claim-stat-val">3x</div>
                  <div class="claim-stat-lbl">fewer fall-throughs</div>
                </div>
                <div class="claim-stat-box">
                  <div class="claim-stat-val">£0</div>
                  <div class="claim-stat-lbl">to get started</div>
                </div>
              </div>
              <button class="btn-claim" @click="startClaimFlow">
                Claim your Property Passport
              </button>
            </div>
          </div>

          <div style="margin-bottom: 16px">
            <div
              style="
                font-size: 15px;
                font-weight: 700;
                color: #1f2024;
                margin-bottom: 10px;
              "
            >
              What happens after you claim
            </div>
            <div class="step-row">
              <div class="step-num">1</div>
              <div
                style="
                  font-size: 14px;
                  color: #4a5568;
                  line-height: 1.5;
                  padding-top: 2px;
                "
              >
                Verify your identity and ownership - takes 5 mins
              </div>
            </div>
            <div class="step-row">
              <div class="step-num">2</div>
              <div
                style="
                  font-size: 14px;
                  color: #4a5568;
                  line-height: 1.5;
                  padding-top: 2px;
                "
              >
                Upload or auto-fetch your documents (title deed, EPC, certs)
              </div>
            </div>
            <div class="step-row">
              <div class="step-num">3</div>
              <div
                style="
                  font-size: 14px;
                  color: #4a5568;
                  line-height: 1.5;
                  padding-top: 2px;
                "
              >
                Once your Passport is complete, publish and share it with your
                agent, solicitor or buyers directly
              </div>
            </div>
          </div>

          <div
            class="pro-dark-card"
            data-tour="pro-card"
            style="margin-bottom: 16px"
            @click="openGasSafetySheet"
          >
            <div class="pro-dark-icon"><img src="/op-icons/misc/wrench.png" alt="" loading="lazy" /></div>
            <div class="pro-dark-body">
              <div class="pro-dark-title">Need certs? Find a Pro</div>
              <div class="pro-dark-sub">
                Gas, EICR, EPC - certs auto-land in your Passport
              </div>
            </div>
            <div class="pro-dark-badge">Book</div>
          </div>

          <HealthPassportCards />

          <div class="feed-header" data-tour="verified-feed">
            <div class="feed-title">Verified passport properties</div>
            <div
              v-if="verifiedPassportDisplay.length"
              class="feed-see-all"
              @click="navigateTo('/explore')"
            >
              See all
            </div>
          </div>
          <div class="feed-sub">
            See how other sellers have prepared their Property Passport.
          </div>

          <div v-if="loadingVerifiedPassports" class="skeletons">
            <div v-for="n in 3" :key="n" class="skeleton-card" />
          </div>
          <div v-else-if="verifiedPassportDisplay.length" class="horiz-feed">
            <div
              v-for="prop in verifiedPassportDisplay"
              :key="prop.id"
              class="prop-card prop-card-horiz"
              @click="navigateTo('/property/' + prop.id)"
            >
              <div
                class="prop-img-wrap"
                :style="{
                  background:
                    prop.imgGradient ||
                    'linear-gradient(135deg,#dff4f0,#c8ebe6)',
                }"
              >
                <PropertyImage
                  :src="prop.imageUrl"
                  :alt="prop.addressLine1"
                  :show-caption="false"
                  class="prop-img"
                />
                <div class="prop-badge-pp">
                  <img
                    src="/op-icons/passportview/umu-passport.png"
                    alt=""
                    class="pp-emoji-ic"
                  />
                  Passport · {{ prop.passportCompletion ?? 0 }}%
                </div>
                <div class="prop-price-tag">
                  {{
                    prop.estimatedPrice
                      ? '£' + Math.round(prop.estimatedPrice).toLocaleString()
                      : 'POA'
                  }}
                </div>
              </div>
              <div class="prop-body">
                <div class="prop-address">{{ prop.addressLine1 }}</div>
                <div class="prop-area">
                  {{
                    prop.city ? prop.city + ', ' + prop.postcode : prop.postcode
                  }}
                </div>
                <div class="prop-pills">
                  <span v-if="prop.propertyType" class="pill-grey">{{
                    prop.propertyType
                  }}</span>
                  <span v-if="prop.tenure" class="pill-grey">{{
                    prop.tenure
                  }}</span>
                </div>
                <div class="prop-footer">
                  <div v-if="prop.epcScore" class="prop-score-row">
                    <span class="prop-score-lbl">EPC</span>
                    <div class="prop-score-bar">
                      <div
                        class="prop-score-fill"
                        :style="{ width: prop.epcScore + '%' }"
                      ></div>
                    </div>
                    <span class="prop-score-num">{{ prop.epcScore }}</span>
                  </div>
                  <span class="prop-passport-btn">View Passport</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="verified-empty">
            <div class="verified-empty-ic">
              <img
                src="/op-icons/passportview/umu-passport.png"
                alt=""
                class="pp-emoji-big"
              />
            </div>
            <div class="verified-empty-title">Be among the first</div>
            <div class="verified-empty-sub">
              No verified passports nearby yet — claim yours and help shape a
              more transparent market.
            </div>
            <button class="verified-empty-btn" @click="navigateTo('/explore')">
              Start your Passport
            </button>
          </div>
        </template>

        <template v-else>
          <HealthPassportCards />

          <div class="feed-header" data-tour="verified-feed">
            <div class="feed-title">Verified passport properties</div>
            <div
              v-if="verifiedPassportDisplay.length"
              class="feed-see-all"
              @click="navigateTo('/explore')"
            >
              See all
            </div>
          </div>
          <div class="feed-sub">
            These sellers have already verified their home. Full records, fewer
            surprises.
          </div>

          <div v-if="loadingVerifiedPassports" class="skeletons">
            <div v-for="n in 3" :key="n" class="skeleton-card" />
          </div>
          <div v-else-if="verifiedPassportDisplay.length" class="horiz-feed">
            <div
              v-for="prop in verifiedPassportDisplay"
              :key="prop.id"
              class="prop-card prop-card-horiz"
              @click="navigateTo('/property/' + prop.id)"
            >
              <div
                class="prop-img-wrap"
                :style="{
                  background: 'linear-gradient(135deg,#dff4f0,#c8ebe6)',
                }"
              >
                <PropertyImage
                  :src="prop.imageUrl"
                  :alt="prop.addressLine1"
                  :show-caption="false"
                  class="prop-img"
                />
                <div class="prop-badge-pp">
                  <img
                    src="/op-icons/passportview/umu-passport.png"
                    alt=""
                    class="pp-emoji-ic"
                  />
                  Passport · {{ prop.passportCompletion ?? 0 }}%
                </div>
                <div class="prop-price-tag">
                  {{
                    prop.estimatedPrice
                      ? '£' + Math.round(prop.estimatedPrice).toLocaleString()
                      : 'POA'
                  }}
                </div>
              </div>
              <div class="prop-body">
                <div class="prop-address">{{ prop.addressLine1 }}</div>
                <div class="prop-area">
                  {{
                    prop.city ? prop.city + ', ' + prop.postcode : prop.postcode
                  }}
                </div>
                <div class="prop-pills">
                  <span v-if="prop.propertyType" class="pill-grey">{{
                    prop.propertyType
                  }}</span>
                  <span v-if="prop.tenure" class="pill-grey">{{
                    prop.tenure
                  }}</span>
                </div>
                <div class="prop-footer">
                  <div v-if="prop.epcScore" class="prop-score-row">
                    <span class="prop-score-lbl">EPC</span>
                    <div class="prop-score-bar">
                      <div
                        class="prop-score-fill"
                        :style="{ width: prop.epcScore + '%' }"
                      ></div>
                    </div>
                    <span class="prop-score-num">{{ prop.epcScore }}</span>
                  </div>
                  <span class="prop-passport-btn">View Passport</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="verified-empty">
            <div class="verified-empty-ic">
              <img
                src="/op-icons/passportview/umu-passport.png"
                alt=""
                class="pp-emoji-big"
              />
            </div>
            <div class="verified-empty-title">Be among the first</div>
            <div class="verified-empty-sub">
              No verified passports nearby yet — claim yours and help shape a
              more transparent market.
            </div>
            <button class="verified-empty-btn" @click="navigateTo('/explore')">
              Start your Passport
            </button>
          </div>
        </template>
      </template>

      <template v-else>
        <template v-if="role === 'sell'">
          <div
            v-if="loadingPassport"
            class="skeleton-card"
            style="height: 110px; margin-bottom: 14px"
          />
          <div
            v-else-if="passports.length"
            class="passport-status-card"
            data-tour="passport-status"
            @click="navigateTo('/passportview/' + passports[0].id)"
          >
            <div class="psc-glow"></div>
            <div class="psc-main" style="position: relative; z-index: 1">
              <div class="psc-left">
                <!-- Real Property Passport cover — same PassportCard
                     component the /passport/collections page uses, so
                     the two views look identical. Address + postcode
                     are overlaid on top of the umu-passport.png asset
                     via container-query typography, so it stays legible
                     at this small tile size. -->
                <div class="psc-passport-slot">
                  <PassportCard
                    :line1="
                      (
                        passports[0].address ||
                        passports[0].addressLine1 ||
                        ''
                      ).split(',')[0]
                    "
                    :line2="passports[0].postcode || ''"
                    :type="passports[0].type || 'SELLER'"
                  />
                </div>
                <div>
                  <div class="psc-label-small">Property Passport</div>
                  <div class="psc-address">
                    {{ passports[0].address || passports[0].addressLine1 }}
                  </div>
                  <div class="psc-postcode">{{ passports[0].postcode }}</div>
                </div>
              </div>
              <div class="psc-gauge">
                <!-- Full-circle progress ring — replaces the old
                     half-moon arc so the gauge matches the property
                     page's HomeScore ring and the boost-view rings.
                     Rotated -90deg so the fill starts from the top. -->
                <svg width="54" height="54" viewBox="0 0 58 58" style="transform: rotate(-90deg)">
                  <circle
                    cx="29" cy="29" r="24"
                    fill="none"
                    stroke="#e5f4f2"
                    stroke-width="4"
                  />
                  <circle
                    cx="29" cy="29" r="24"
                    fill="none"
                    stroke="#00a19a"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray="150.8"
                    :stroke-dashoffset="passportDashoffset"
                  />
                </svg>
                <div class="psc-gauge-num">{{ passportScore ?? '—' }}</div>
                <div class="psc-gauge-lbl">HomeScore</div>
              </div>
            </div>
            <div class="psc-footer" style="position: relative; z-index: 1">
              <div class="psc-footer-stats">
                <span class="psc-stat"
                  >Complete
                  <strong
                    >{{ passports[0].completionPercentage ?? 0 }}%</strong
                  ></span
                >
                <span v-if="passportDaysActive" class="psc-stat"
                  >Day <strong>{{ passportDaysActive }}</strong></span
                >
              </div>
              <div class="psc-view-cta">View Passport</div>
            </div>
          </div>
          <div
            v-else
            class="no-passport-card"
            data-tour="passport-status"
            @click="startClaimFlow"
          >
            <div class="no-pp-icon"><img src="/op-icons/homescore/clipboard.png" alt="" loading="lazy" /></div>
            <div class="no-pp-body">
              <div class="no-pp-title">No passport yet</div>
              <div class="no-pp-sub">
                Search for your property to claim your first Passport
              </div>
            </div>
            <div class="no-pp-cta">Claim</div>
          </div>

          <div
            class="next-action-card"
            data-tour="next-action"
            @click="
              navigateTo(
                passports.length
                  ? '/passportview/' + passports[0].id
                  : '/explore',
              )
            "
          >
            <div class="na-icon"><img src="/op-icons/homescore/lightning.png" alt="" loading="lazy" /></div>
            <div class="na-body">
              <div class="na-title">{{ nextActionLabel }}</div>
              <div class="na-sub">{{ nextActionSub }}</div>
            </div>
            <div class="na-cta">Add</div>
          </div>

          <HealthPassportCards />

          <div
            class="pro-dark-card"
            data-tour="pro-card"
            @click="openGasSafetySheet"
          >
            <div class="pro-dark-icon"><img src="/op-icons/misc/wrench.png" alt="" loading="lazy" /></div>
            <div class="pro-dark-body">
              <div class="pro-dark-title">Book a gas safety check</div>
              <div class="pro-dark-sub">
                Cert lands in your Passport automatically
              </div>
            </div>
            <div class="pro-dark-badge">Book</div>
          </div>

          <div class="add-property-card" @click="startClaimFlow">
            <div style="font-size: 22px; flex-shrink: 0">➕</div>
            <div style="flex: 1">
              <div
                style="
                  font-size: 14px;
                  font-weight: 700;
                  color: #231d45;
                  margin-bottom: 2px;
                "
              >
                Add another property
              </div>
              <div style="font-size: 13px; color: #4a5568">
                Verify ownership, then choose Rental or Seller Passport
              </div>
            </div>
            <div
              style="
                font-size: 13px;
                font-weight: 700;
                color: #00a19a;
                flex-shrink: 0;
              "
            >
              Add
            </div>
          </div>
        </template>

        <template v-else-if="role === 'buy'">
          <div
            v-if="hasSavedSearch"
            class="saved-search-card"
            data-tour="saved-search"
          >
            <div class="saved-search-top">
              <div style="font-size: 15px; font-weight: 700; color: #231d45">
                Your saved search
              </div>
              <div
                style="
                  font-size: 12px;
                  font-weight: 700;
                  color: #00a19a;
                  cursor: pointer;
                "
                @click="navigateTo('/profile')"
              >
                Edit
              </div>
            </div>
            <div class="saved-search-pills">
              <span
                v-for="pill in savedSearchPills"
                :key="pill"
                class="pill-brand"
                >{{ pill }}</span
              >
            </div>
            <div
              v-if="properties.length"
              style="margin-top: 10px; font-size: 13px; color: #4a5568"
            >
              <strong style="color: #231d45"
                >{{ properties.length }}
                {{ properties.length === 1 ? 'match' : 'matches' }}</strong
              >
              for your preferences
            </div>
          </div>
          <div
            v-else
            class="saved-search-card saved-search-card--empty"
            data-tour="saved-search"
            @click="navigateTo('/profile')"
          >
            <div class="saved-search-top">
              <div style="font-size: 15px; font-weight: 700; color: #231d45">
                Set up your search
              </div>
              <div
                style="
                  font-size: 12px;
                  font-weight: 700;
                  color: #00a19a;
                  cursor: pointer;
                "
              >
                Add →
              </div>
            </div>
            <div style="font-size: 13px; color: #4a5568; line-height: 1.5">
              Tell us your area, budget and must-haves. We'll match you to homes
              that fit.
            </div>
          </div>

          <HealthPassportCards />

          <!-- Published Buyer Profile quick-access card -->
          <div
            v-if="buyerProfilePublished"
            class="my-passport-card my-passport-card--published"
            data-tour="buyer-profile"
            @click="navigateTo('/buyer-profile/view')"
          >
            <div class="my-passport-ic">✓</div>
            <div class="my-passport-body">
              <div class="my-passport-title">Buyer Passport · Published</div>
              <div class="my-passport-sub">
                Tap to view or share with sellers
              </div>
            </div>
            <div class="my-passport-arrow">→</div>
          </div>

          <!-- My Buyer Profile entry card (build) -->
          <div
            v-else
            class="my-passport-card"
            data-tour="buyer-profile"
            @click="navigateTo('/buyer-profile')"
          >
            <div class="my-passport-ic"><img src="/op-icons/profile/buyerProfile.jpeg" alt="" loading="lazy" /></div>
            <div class="my-passport-body">
              <div class="my-passport-title">My Buyer Passport</div>
              <div class="my-passport-sub">
                Prove you're a verified buyer — share with any agent or seller
              </div>
            </div>
            <div class="my-passport-arrow">→</div>
          </div>

          <div
            v-if="pulseHasAny || marketPulseLoading"
            class="market-pulse-card"
            data-tour="market-pulse"
          >
            <div
              style="
                font-size: 15px;
                font-weight: 700;
                color: #1f2024;
                margin-bottom: 8px;
              "
            >
              Market pulse<template v-if="pulseArea">
                · {{ pulseArea }}</template
              >
            </div>
            <div v-if="marketPulseLoading && !pulseHasAny" class="pulse-grid">
              <div class="pulse-cell">
                <div class="pulse-val">—</div>
                <div class="pulse-lbl">loading</div>
              </div>
            </div>
            <div v-else class="pulse-grid">
              <div v-if="pulseDays !== null" class="pulse-cell">
                <div class="pulse-val">{{ pulseDays }}</div>
                <div class="pulse-lbl">avg days to sell</div>
              </div>
              <div v-if="pulseYoY !== null" class="pulse-cell">
                <div class="pulse-val" :style="{ color: pulseYoYColor }">
                  {{ pulseYoY }}
                </div>
                <div class="pulse-lbl">price change YoY</div>
              </div>
              <div v-if="pulseListings !== null" class="pulse-cell">
                <div class="pulse-val">{{ pulseListings }}</div>
                <div class="pulse-lbl">passport listings</div>
              </div>
            </div>
          </div>

          <div
            class="feed-header"
            data-tour="foryou-feed"
            style="margin-top: 4px"
          >
            <div class="feed-title">For You</div>
            <div class="feed-see-all" @click="navigateTo('/explore')">All</div>
          </div>
          <div v-if="loadingProperties" class="skeletons">
            <div v-for="n in 3" :key="n" class="skeleton-card" />
          </div>
          <div v-else-if="displayProperties.length" class="horiz-feed">
            <div
              v-for="prop in displayProperties"
              :key="prop.id"
              class="prop-card prop-card-horiz"
              @click="navigateTo('/property/' + prop.id)"
            >
              <div
                class="prop-img-wrap"
                :style="{
                  background: 'linear-gradient(135deg,#dff4f0,#c8ebe6)',
                }"
              >
                <PropertyImage
                  :src="prop.imageUrl || prop.image"
                  :alt="prop.addressLine1 || prop.address"
                  :show-caption="false"
                  class="prop-img"
                />
                <div v-if="prop.hasPassport" class="prop-badge-pp">
                  <img
                    src="/op-icons/passportview/umu-passport.png"
                    alt=""
                    class="pp-emoji-ic"
                  />
                  Passport
                </div>
                <div class="prop-price-tag">
                  {{
                    prop.estimatedPrice
                      ? '£' + Math.round(prop.estimatedPrice).toLocaleString()
                      : prop.priceDisplay || 'POA'
                  }}
                </div>
              </div>
              <div class="prop-body">
                <div class="prop-address">
                  {{ prop.addressLine1 || prop.address }}
                </div>
                <div class="prop-area">
                  {{
                    prop.city
                      ? prop.city + ', ' + prop.postcode
                      : prop.area || prop.postcode || ''
                  }}
                </div>
                <div class="prop-pills">
                  <span
                    v-if="prop.propertyType || prop.type"
                    class="pill-grey"
                    >{{ prop.propertyType || prop.type }}</span
                  >
                  <span v-if="prop.tenure" class="pill-grey">{{
                    prop.tenure
                  }}</span>
                </div>
                <div class="prop-footer">
                  <div v-if="prop.epcScore" class="prop-score-row">
                    <span class="prop-score-lbl">EPC</span>
                    <div class="prop-score-bar">
                      <div
                        class="prop-score-fill"
                        :style="{ width: prop.epcScore + '%' }"
                      ></div>
                    </div>
                    <span class="prop-score-num">{{ prop.epcScore }}</span>
                  </div>
                  <span class="prop-passport-btn">View</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="needsPostcode" class="foryou-empty">
            <div class="foryou-empty-ic foryou-empty-ic-img"><img src="/op-icons/misc/addressPin.png" alt="" loading="lazy" /></div>
            <div class="foryou-empty-title">Add a postcode to see matches</div>
            <div class="foryou-empty-sub">
              We'll tailor properties to your budget, preferred types and
              must-have features.
            </div>
            <button class="foryou-empty-btn" @click="navigateTo('/profile')">
              Set postcode
            </button>
          </div>
          <div v-else class="foryou-empty">
            <div class="foryou-empty-ic"><img src="/op-icons/homescore/magnifier.png" alt="" loading="lazy" /></div>
            <div class="foryou-empty-title">No matches yet</div>
            <div class="foryou-empty-sub">
              Nothing in your area matches your saved preferences. Try
              broadening your filters or refreshing your postcode.
            </div>
            <button class="foryou-empty-btn" @click="navigateTo('/profile')">
              Update preferences
            </button>
          </div>
        </template>

        <template v-else-if="role === 'both'">
          <div
            v-if="loadingPassport"
            class="skeleton-card"
            style="height: 110px; margin-bottom: 14px"
          />
          <div
            v-else-if="passports.length"
            class="passport-status-card"
            data-tour="passport-status"
            @click="navigateTo('/passportview/' + passports[0].id)"
          >
            <div class="psc-glow"></div>
            <div class="psc-main" style="position: relative; z-index: 1">
              <div class="psc-left">
                <!-- Real Property Passport cover — same PassportCard
                     component the /passport/collections page uses, so
                     the two views look identical. Address + postcode
                     are overlaid on top of the umu-passport.png asset
                     via container-query typography, so it stays legible
                     at this small tile size. -->
                <div class="psc-passport-slot">
                  <PassportCard
                    :line1="
                      (
                        passports[0].address ||
                        passports[0].addressLine1 ||
                        ''
                      ).split(',')[0]
                    "
                    :line2="passports[0].postcode || ''"
                    :type="passports[0].type || 'SELLER'"
                  />
                </div>
                <div>
                  <div class="psc-label-small">Property Passport</div>
                  <div class="psc-address">
                    {{ passports[0].address || passports[0].addressLine1 }}
                  </div>
                  <div class="psc-postcode">{{ passports[0].postcode }}</div>
                </div>
              </div>
              <div class="psc-gauge">
                <!-- Full-circle progress ring — replaces the old
                     half-moon arc so the gauge matches the property
                     page's HomeScore ring and the boost-view rings.
                     Rotated -90deg so the fill starts from the top. -->
                <svg width="54" height="54" viewBox="0 0 58 58" style="transform: rotate(-90deg)">
                  <circle
                    cx="29" cy="29" r="24"
                    fill="none"
                    stroke="#e5f4f2"
                    stroke-width="4"
                  />
                  <circle
                    cx="29" cy="29" r="24"
                    fill="none"
                    stroke="#00a19a"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray="150.8"
                    :stroke-dashoffset="passportDashoffset"
                  />
                </svg>
                <div class="psc-gauge-num">{{ passportScore ?? '—' }}</div>
                <div class="psc-gauge-lbl">HomeScore</div>
              </div>
            </div>
            <div class="psc-footer" style="position: relative; z-index: 1">
              <div class="psc-footer-stats">
                <span class="psc-stat"
                  >Complete
                  <strong
                    >{{ passports[0].completionPercentage ?? 0 }}%</strong
                  ></span
                >
                <span v-if="passportDaysActive" class="psc-stat"
                  >Day <strong>{{ passportDaysActive }}</strong></span
                >
              </div>
              <div class="psc-view-cta">View Passport</div>
            </div>
          </div>
          <div
            v-else
            class="no-passport-card"
            data-tour="passport-status"
            @click="startClaimFlow"
          >
            <div class="no-pp-icon"><img src="/op-icons/homescore/clipboard.png" alt="" loading="lazy" /></div>
            <div class="no-pp-body">
              <div class="no-pp-title">No passport yet</div>
              <div class="no-pp-sub">
                Search for your property to claim your first Passport
              </div>
            </div>
            <div class="no-pp-cta">Claim</div>
          </div>

          <div
            v-if="hasSavedSearch"
            class="saved-search-compact"
            @click="navigateTo('/profile')"
          >
            <div style="width: 24px; height: 24px; flex-shrink: 0">
              <img src="/op-icons/homescore/magnifier.png" alt="" loading="lazy" style="width: 100%; height: 100%; object-fit: contain; display: block" />
            </div>
            <div style="flex: 1; min-width: 0">
              <div
                style="
                  font-size: 14px;
                  font-weight: 700;
                  color: #231d45;
                  margin-bottom: 2px;
                "
              >
                {{
                  properties.length
                    ? properties.length + ' matches on your buy search'
                    : 'Your buy search'
                }}
              </div>
              <div
                style="
                  font-size: 13px;
                  color: #4a5568;
                  line-height: 1.4;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                "
              >
                {{ savedSearchSummary }}
              </div>
            </div>
            <div
              style="
                font-size: 13px;
                font-weight: 700;
                color: #00a19a;
                flex-shrink: 0;
              "
            >
              Edit
            </div>
          </div>
          <div
            v-else
            class="saved-search-compact"
            @click="navigateTo('/profile')"
          >
            <div style="width: 24px; height: 24px; flex-shrink: 0">
              <img src="/op-icons/misc/addressPin.png" alt="" loading="lazy" style="width: 100%; height: 100%; object-fit: contain; display: block" />
            </div>
            <div style="flex: 1; min-width: 0">
              <div
                style="
                  font-size: 14px;
                  font-weight: 700;
                  color: #231d45;
                  margin-bottom: 2px;
                "
              >
                Set your buy preferences
              </div>
              <div style="font-size: 13px; color: #4a5568; line-height: 1.4">
                Area, budget, property type — we'll find matches.
              </div>
            </div>
            <div
              style="
                font-size: 13px;
                font-weight: 700;
                color: #00a19a;
                flex-shrink: 0;
              "
            >
              Set up
            </div>
          </div>

          <HealthPassportCards />

          <div
            class="feed-header"
            data-tour="foryou-feed"
            style="margin-top: 4px"
          >
            <div class="feed-title">For You</div>
            <div class="feed-see-all" @click="navigateTo('/explore')">All</div>
          </div>
          <div v-if="loadingProperties" class="skeletons">
            <div v-for="n in 3" :key="n" class="skeleton-card" />
          </div>
          <div v-else-if="displayProperties.length" class="horiz-feed">
            <div
              v-for="prop in displayProperties"
              :key="prop.id"
              class="prop-card prop-card-horiz"
              @click="navigateTo('/property/' + prop.id)"
            >
              <div
                class="prop-img-wrap"
                :style="{
                  background: 'linear-gradient(135deg,#dff4f0,#c8ebe6)',
                }"
              >
                <PropertyImage
                  :src="prop.imageUrl || prop.image"
                  :alt="prop.addressLine1 || prop.address"
                  :show-caption="false"
                  class="prop-img"
                />
                <div v-if="prop.hasPassport" class="prop-badge-pp">
                  <img
                    src="/op-icons/passportview/umu-passport.png"
                    alt=""
                    class="pp-emoji-ic"
                  />
                  Passport
                </div>
                <div class="prop-price-tag">
                  {{
                    prop.estimatedPrice
                      ? '£' + Math.round(prop.estimatedPrice).toLocaleString()
                      : prop.priceDisplay || 'POA'
                  }}
                </div>
              </div>
              <div class="prop-body">
                <div class="prop-address">
                  {{ prop.addressLine1 || prop.address }}
                </div>
                <div class="prop-area">
                  {{
                    prop.city
                      ? prop.city + ', ' + prop.postcode
                      : prop.area || prop.postcode || ''
                  }}
                </div>
                <div class="prop-pills">
                  <span
                    v-if="prop.propertyType || prop.type"
                    class="pill-grey"
                    >{{ prop.propertyType || prop.type }}</span
                  >
                  <span v-if="prop.tenure" class="pill-grey">{{
                    prop.tenure
                  }}</span>
                </div>
                <div class="prop-footer">
                  <div v-if="prop.epcScore" class="prop-score-row">
                    <span class="prop-score-lbl">EPC</span>
                    <div class="prop-score-bar">
                      <div
                        class="prop-score-fill"
                        :style="{ width: prop.epcScore + '%' }"
                      ></div>
                    </div>
                    <span class="prop-score-num">{{ prop.epcScore }}</span>
                  </div>
                  <span class="prop-passport-btn">View</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="needsPostcode" class="foryou-empty">
            <div class="foryou-empty-ic foryou-empty-ic-img"><img src="/op-icons/misc/addressPin.png" alt="" loading="lazy" /></div>
            <div class="foryou-empty-title">Add a postcode to see matches</div>
            <div class="foryou-empty-sub">
              We'll tailor properties to your budget, preferred types and
              must-have features.
            </div>
            <button class="foryou-empty-btn" @click="navigateTo('/profile')">
              Set postcode
            </button>
          </div>
          <div v-else class="foryou-empty">
            <div class="foryou-empty-ic"><img src="/op-icons/homescore/magnifier.png" alt="" loading="lazy" /></div>
            <div class="foryou-empty-title">No matches yet</div>
            <div class="foryou-empty-sub">
              Nothing in your area matches your saved preferences. Try
              broadening your filters or refreshing your postcode.
            </div>
            <button class="foryou-empty-btn" @click="navigateTo('/profile')">
              Update preferences
            </button>
          </div>
        </template>

        <template v-else-if="role === 'landlord'">
          <div
            v-if="loadingPassport"
            class="skeleton-card"
            style="height: 110px; margin-bottom: 14px"
          />
          <div
            v-else-if="passports.length"
            class="passport-status-card"
            data-tour="passport-status"
            @click="navigateTo('/passportview/' + passports[0].id)"
          >
            <div class="psc-glow"></div>
            <div class="psc-main" style="position: relative; z-index: 1">
              <div class="psc-left">
                <!-- Real Property Passport cover — same PassportCard
                     component the /passport/collections page uses, so
                     the two views look identical. Address + postcode
                     are overlaid on top of the umu-passport.png asset
                     via container-query typography, so it stays legible
                     at this small tile size. -->
                <div class="psc-passport-slot">
                  <PassportCard
                    :line1="
                      (
                        passports[0].address ||
                        passports[0].addressLine1 ||
                        ''
                      ).split(',')[0]
                    "
                    :line2="passports[0].postcode || ''"
                    :type="passports[0].type || 'SELLER'"
                  />
                </div>
                <div>
                  <div class="psc-label-small">Property Passport</div>
                  <div class="psc-address">
                    {{ passports[0].address || passports[0].addressLine1 }}
                  </div>
                  <div class="psc-postcode">{{ passports[0].postcode }}</div>
                </div>
              </div>
              <div class="psc-gauge">
                <!-- Full-circle progress ring — replaces the old
                     half-moon arc so the gauge matches the property
                     page's HomeScore ring and the boost-view rings.
                     Rotated -90deg so the fill starts from the top. -->
                <svg width="54" height="54" viewBox="0 0 58 58" style="transform: rotate(-90deg)">
                  <circle
                    cx="29" cy="29" r="24"
                    fill="none"
                    stroke="#e5f4f2"
                    stroke-width="4"
                  />
                  <circle
                    cx="29" cy="29" r="24"
                    fill="none"
                    stroke="#00a19a"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray="150.8"
                    :stroke-dashoffset="passportDashoffset"
                  />
                </svg>
                <div class="psc-gauge-num">{{ passportScore ?? '—' }}</div>
                <div class="psc-gauge-lbl">HomeScore</div>
              </div>
            </div>
            <div class="psc-footer" style="position: relative; z-index: 1">
              <div class="psc-footer-stats">
                <span class="psc-stat"
                  >Complete
                  <strong
                    >{{ passports[0].completionPercentage ?? 0 }}%</strong
                  ></span
                >
                <span v-if="passportDaysActive" class="psc-stat"
                  >Day <strong>{{ passportDaysActive }}</strong></span
                >
              </div>
              <div class="psc-view-cta">View Passport</div>
            </div>
          </div>
          <div
            v-else
            class="no-passport-card"
            data-tour="passport-status"
            @click="startClaimFlow"
          >
            <div class="no-pp-icon"><img src="/op-icons/homescore/clipboard.png" alt="" loading="lazy" /></div>
            <div class="no-pp-body">
              <div class="no-pp-title">No passport yet</div>
              <div class="no-pp-sub">
                Search for your property to claim your first Passport
              </div>
            </div>
            <div class="no-pp-cta">Claim</div>
          </div>

          <!-- Next action card for landlord (matches seller position) -->
          <div
            v-if="passports.length"
            class="next-action-card"
            data-tour="next-action"
            @click="navigateTo('/passportview/' + passports[0].id)"
          >
            <div class="na-icon"><img src="/op-icons/homescore/lightning.png" alt="" loading="lazy" /></div>
            <div class="na-body">
              <div class="na-title">{{ nextActionLabel }}</div>
              <div class="na-sub">{{ nextActionSub }}</div>
            </div>
            <div class="na-cta">Add</div>
          </div>

          <HealthPassportCards />

          <div class="pro-dark-card" @click="openGasSafetySheet">
            <div class="pro-dark-icon"><img src="/op-icons/misc/wrench.png" alt="" loading="lazy" /></div>
            <div class="pro-dark-body">
              <div class="pro-dark-title">Book a gas safety engineer</div>
              <div class="pro-dark-sub">Cert auto-lands in your Passport</div>
            </div>
            <div class="pro-dark-badge">Book</div>
          </div>

          <div class="add-property-card" @click="startClaimFlow">
            <div style="font-size: 22px; flex-shrink: 0">➕</div>
            <div style="flex: 1">
              <div
                style="
                  font-size: 14px;
                  font-weight: 700;
                  color: #231d45;
                  margin-bottom: 2px;
                "
              >
                Add another property
              </div>
              <div style="font-size: 13px; color: #4a5568">
                Verify ownership, then choose Rental or Seller Passport
              </div>
            </div>
            <div
              style="
                font-size: 13px;
                font-weight: 700;
                color: #00a19a;
                flex-shrink: 0;
              "
            >
              Add
            </div>
          </div>
        </template>
      </template>
    </div>

    <BottomNav />

    <!-- First-visit guided tour — replays from the "?" button in the hero -->
    <OnboardingTour
      ref="exploreTourRef"
      :steps="exploreTourSteps"
      storage-key="umu_tour_explore_v1"
    />

    <InstallerFlowSheet
      v-model:open="installerSheetOpen"
      :kind="installerKind"
      :measure-title="installerMeasureTitle"
      :property-id="installerPropertyId"
      :postcode="installerPostcode"
      :address="installerAddress"
      :initial-state="installerInitialState"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import UserAvatar from '~/components/ui/UserAvatar.vue'
import NotificationBell from '~/components/ui/NotificationBell.vue'
import BottomNav from '~/components/core/BottomNav.vue'
import OnboardingTour from '~/components/ui/OnboardingTour.vue'
import SearchFilterBar, {
  type CommittedFilters,
} from '~/components/property/SearchFilterBar.vue'

// Guided tour wiring — replays via the "?" button in the hero, auto-runs
// once per browser via storageKey on the OnboardingTour component.
const exploreTourRef = ref<any>(null)
// Full Explore tour. Steps whose target isn't on screen (e.g. seller-only
// banner when the user signed up as a buyer) are auto-skipped by
// OnboardingTour — so one list covers every variant of this page.
const exploreTourSteps = [
  {
    selector: '.search-wrap',
    title: 'Search any UK property',
    body: 'Type a postcode, address or area. Properties with a verified Passport surface to the top.',
  },
  {
    selector: '[data-tour="filter-pill"]',
    title: 'Distance & filters',
    body: 'Tap the pill next to Search to set radius (Exact → 10 miles) and narrow by property type, bedrooms, EPC, HomeScore or Passport status — all in one place.',
  },
  {
    selector: '[data-tour="avatar"]',
    title: 'Your account',
    body: 'Tap your avatar to manage your profile, preferences, saved properties and account.',
  },
  {
    selector: '[data-tour="claim-banner"]',
    title: 'Claim your Property Passport',
    body: 'Verify your ownership, build your record, sell faster. £0 to get started — sellers see up to 12× faster exchanges.',
  },
  {
    selector: '[data-tour="passport-status"]',
    title: 'Your Property Passport',
    body: 'Track completion, jump back into the next missing section, and share with your agent or solicitor.',
  },
  {
    selector: '[data-tour="next-action"]',
    title: 'Your next step',
    body: 'The single most useful thing you can do right now to push your Passport forward.',
  },
  {
    selector: '[data-tour="saved-search"]',
    title: 'Saved search',
    body: 'Set your area, budget and must-haves once — we match new listings to you automatically.',
  },
  {
    selector: '[data-tour="buyer-profile"]',
    title: 'Your Buyer Passport',
    body: "Prove you're a verified buyer (ID, funds, chain position). Share it with any seller or agent to stand out.",
  },
  {
    selector: '[data-tour="market-pulse"]',
    title: 'Market pulse',
    body: 'Days-on-market, year-on-year price movement and live Passport listings for your area — pulled from Land Registry.',
  },
  {
    selector: '.feat-card.homescore',
    title: 'HomeScore — free, 60 seconds',
    body: 'Bills, value, energy efficiency and street comparisons for any address — scored 0–100 from public records.',
  },
  {
    selector: '.feat-card.passport',
    title: 'See a sample Passport',
    body: 'Tap to see exactly what buyers, agents and solicitors get on a verified Property Passport.',
  },
  {
    selector: '[data-tour="pro-card"]',
    title: 'Book a Pro',
    body: 'Gas, EICR, EPC and other certs — book a vetted tradesperson; the certificate lands in your Passport automatically.',
  },
  {
    selector: '[data-tour="verified-feed"]',
    title: 'Verified Passport properties',
    body: 'Real homes with a published Passport — full records, EPC, planning history, fewer surprises.',
  },
  {
    selector: '[data-tour="foryou-feed"]',
    title: 'For You',
    body: 'Properties matched to your saved search — tap any card to see EPC, HomeScore and the full Passport (if published).',
  },
  {
    selector: '.prop-card',
    title: 'Tap any property',
    body: "You'll see EPC, HomeScore and — for verified ones — the full Property Passport.",
  },
  {
    selector: '[data-tour="tour-btn"]',
    title: 'Replay this tour anytime',
    body: 'Tap the "?" button up here to walk through this again.',
  },
]
import HealthPassportCards from '~/components/explore/HealthPassportCards.vue'
import PropertyImage from '~/components/property/PropertyImage.vue'
import PassportCard from '~/components/passport-view/PassportCard.vue'
import InstallerFlowSheet from '~/components/homescore/InstallerFlowSheet.vue'

definePageMeta({ title: 'Explore - UmovingU', middleware: 'auth' })

const config = useRuntimeConfig()
const { profile, fetchProfile } = useProfile()

// First-visit detection: the "New" view is shown ONLY on the user's first
// ever arrival at /explore (right after sign-up). Subsequent visits — even
// from the same session, after a refresh — always land on "Returning".
// We pre-set the flag synchronously here so a refresh during the same
// browser session promotes the user to Returning without flicker.
const EXPLORE_VISITED_KEY = 'umu_explore_visited_v1'
const view = ref<'new' | 'returning'>(
  (() => {
    if (typeof window === 'undefined') return 'returning'
    try {
      if (localStorage.getItem(EXPLORE_VISITED_KEY)) return 'returning'
      localStorage.setItem(EXPLORE_VISITED_KEY, String(Date.now()))
      return 'new'
    } catch {
      // localStorage unavailable (private mode etc.) — degrade to Returning
      // so we never lock the user into the onboarding "new" view forever.
      return 'returning'
    }
  })(),
)
const searchQuery = ref('')
const selectedAddress = ref<any>(null)
// The search bar + filter sheet (dropdown, radius, property type, beds,
// EPC, HomeScore, passport-only) now live entirely inside SearchFilterBar
// — see onFiltersChange/onSearchBarSelect below. These committed refs stay
// here since downstream code (buildSearchUrl, etc.) reads them directly.
const activeRadius = ref<number | null>(null)

const loadingPrefs = ref(true)
const loadingPassport = ref(true)
const loadingProperties = ref(true)

// Search mode
const searchMode = ref(false)
const searchProperties = ref<any[]>([])
const searchLoading = ref(false)
const searchTotal = ref(0)
const searchLoadingMore = ref(false)
const SEARCH_PAGE_SIZE = 20
const loadMoreSentinel = ref<HTMLElement | null>(null)
let loadMoreObserver: IntersectionObserver | null = null

const committedPtype = ref<string[]>(['any'])
const committedBeds = ref<number | null>(null)
const committedEpc = ref<string | null>(null)
const committedHs = ref<number>(0)
const committedPassport = ref<boolean>(false)

// Fired by SearchFilterBar whenever its sheet is applied, or a chip is
// removed/cleared — mirrors the old applyDraft/removeCommittedFilter/
// clearAllFilters, which all did the same "commit + refresh" afterwards.
function onFiltersChange(filters: CommittedFilters) {
  activeRadius.value = filters.radius
  committedPtype.value = filters.propertyType
  committedBeds.value = filters.minBedrooms
  committedEpc.value = filters.minEpc
  committedHs.value = filters.minHomeScore
  committedPassport.value = filters.passportOnly
  if (searchMode.value && searchQuery.value.trim()) doSearch()
  else refreshForYou()
}

// SearchFilterBar's dropdown shows a LIST of nearby properties on this
// page — picking one sets the address and runs the list search. (The
// HomeScore page's own search dropdown navigates straight to
// /homescore/[id] — that's a separate surface with a different purpose.)
function onSearchBarSelect(addr: any) {
  selectedAddress.value = addr
  searchQuery.value = addr.addressLine1 || addr.address || addr.line1 || ''
  doSearch()
}

// Legacy refs kept as no-op shims so any remaining script references
// below still type-check. New code reads `committed*` directly.
const filterBeds = computed({
  get: () => committedBeds.value,
  set: (v: number | null) => (committedBeds.value = v),
})
const filterMaxPrice = ref<number | null>(null)
const filterType = computed({
  get: () =>
    committedPtype.value.length === 1 && committedPtype.value[0] === 'any'
      ? ''
      : committedPtype.value.join(','),
  set: () => {
    /* no-op — chip group is the source of truth now */
  },
})
const filterHasPassport = computed({
  get: () => committedPassport.value,
  set: (v: boolean) => (committedPassport.value = v),
})

const pricePills = [
  { label: '£200k', value: 200000 },
  { label: '£300k', value: 300000 },
  { label: '£400k', value: 400000 },
  { label: '£500k', value: 500000 },
  { label: '£750k+', value: 750000 },
]

const preferences = ref<any>(null)
const passports = ref<any[]>([])
const properties = ref<any[]>([])
const verifiedPassportProperties = ref<any[]>([])
const loadingVerifiedPassports = ref(true)
const needsPostcode = ref(false)

type InstallerKind = 'insulation' | 'solarpv' | 'gas' | 'other'
type InstallerSheetState =
  | 'routes'
  | 'elig'
  | 'result'
  | 'form'
  | 'confirm'
  | 'tracker'
  | 'market'
  | 'ea-form'
  | 'ea-confirm'
const installerSheetOpen = ref(false)
const installerKind = ref<InstallerKind>('gas')
const installerMeasureTitle = ref('Gas safety check (CP12)')
const installerInitialState = ref<InstallerSheetState>('routes')

// Whether the current user has a published Buyer Profile — drives the
// "✓ Buyer Profile · Published" quick-access card in the buy view.
const buyerProfilePublished = ref(false)

// Always initialize to 'buy' so SSR and client match — updated in onMounted
const role = ref<string>('buy')

// Coerce the role to one of the values the template branches on. The
// returning-user view dispatches on `role === 'sell' | 'buy' | 'both' |
// 'landlord'` — anything else and the whole scroll area renders empty
// (only the header + hero stay), which produced the "distorted explore
// page" bug when the cached/profile role was missing or unexpected.
function normalizeRole(r: unknown): string {
  const allowed = ['sell', 'buy', 'both', 'landlord']
  return typeof r === 'string' && allowed.includes(r) ? r : 'buy'
}

const greeting = computed(() => {
  const h = new Date().getHours()
  const timeOfDay =
    h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  // First name is the friendliest greeting — fall back to the local part of
  // the email if no first name is set, and drop the suffix entirely when we
  // have nothing user-facing (so we never render "Good afternoon , 👋").
  const first = profile.value?.firstName?.trim()
  const emailLocal = profile.value?.email?.split('@')[0]?.trim()
  const name = first || emailLocal || ''
  return name ? `${timeOfDay}, ${name} 👋` : `${timeOfDay} 👋`
})

// Gauge on the passport summary card shows the property's HomeScore
// (0-100 from EPC + energy data), not passport-fill progress. The
// backend attaches `homeScore` per passport row from HomeScoreResult;
// null means nobody has run one yet, so the dial reads "—".
const passportScore = computed(() => {
  const hs = passports.value[0]?.homeScore
  return typeof hs === 'number' ? hs : null
})

// Progress bar / "Complete X%" line below the gauge is a separate
// number — how much of the passport itself the owner has filled in.
const passportCompletion = computed(() => {
  const pct = passports.value[0]?.completionPercentage
  return typeof pct === 'number' ? pct : 0
})

// Full-circle progress ring — circumference for r=24 is 2π × 24 ≈
// 150.8. Empty state offsets by the full length so the ring reads
// as an empty track rather than a bogus full green loop at 0.
const passportDashoffset = computed(() => {
  const s = passportScore.value
  if (s == null) return '150.8'
  return (150.8 * (1 - s / 100)).toFixed(1)
})

const portfolioCompliant = computed(
  () =>
    passports.value.filter((p) => (p.completionPercentage ?? 0) >= 80).length,
)

const portfolioActionNeeded = computed(
  () =>
    passports.value.filter((p) => (p.completionPercentage ?? 0) < 80).length,
)

const portfolioAlertAddress = computed(() => {
  const p = passports.value.find((p) => (p.completionPercentage ?? 0) < 80)
  return p?.address ?? p?.addressLine1 ?? ''
})

const passportDaysActive = computed(() => {
  const createdAt = passports.value[0]?.createdAt
  if (!createdAt) return null
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  )
  return days > 0 ? days : 1
})

const nextActionLabel = computed(() => {
  const pct = passports.value[0]?.completionPercentage ?? 0
  if (pct >= 100) return 'Publish your passport'
  if (pct >= 80) return 'Almost there — finish your passport'
  if (pct >= 40) return 'Continue your passport'
  return 'Pick up where you left off'
})

const nextActionSub = computed(() => {
  const p = passports.value[0]
  if (!p) return ''
  const pct = p.completionPercentage ?? 0
  return `Passport ${pct}% complete`
})

// ── Saved search (buyer) pills ────────────────────────────────────────────
function formatBudget(n?: number | null): string {
  if (!n) return ''
  if (n >= 1_000_000)
    return '£' + (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm'
  if (n >= 1_000) return '£' + Math.round(n / 1000) + 'k'
  return '£' + n
}

const userPostcode = computed(() => profile.value?.postcode?.trim() || '')

// Market pulse — aggregate stats for the user's postcode sector. Backend
// returns null for any figure it can't derive; the template hides those cells.
interface MarketPulse {
  area: string | null
  priceChangeYoY: number | null
  avgDaysToSell: number | null
  passportListings: number
  sampleSize: { recent: number; prior: number }
}
const marketPulse = ref<MarketPulse | null>(null)
const marketPulseLoading = ref(false)

async function fetchMarketPulse() {
  const pc = userPostcode.value
  if (!pc) {
    marketPulse.value = null
    return
  }
  marketPulseLoading.value = true
  try {
    marketPulse.value = await $fetch<MarketPulse>(
      `${
        config.public.apiBase
      }/property/market-pulse?postcode=${encodeURIComponent(pc)}`,
    )
  } catch {
    marketPulse.value = null
  } finally {
    marketPulseLoading.value = false
  }
}

watch(
  userPostcode,
  (pc) => {
    if (pc) fetchMarketPulse()
  },
  { immediate: false },
)

// Derived display strings — null/no-data states collapse cleanly.
const pulseArea = computed(
  () => marketPulse.value?.area || userPostcode.value || '',
)
const pulseYoY = computed<string | null>(() => {
  const v = marketPulse.value?.priceChangeYoY
  if (typeof v !== 'number') return null
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(1)}%`
})
const pulseYoYColor = computed(() => {
  const v = marketPulse.value?.priceChangeYoY ?? 0
  return v >= 0 ? '#008a84' : '#c73e36'
})
const pulseListings = computed<number | null>(() => {
  const n = marketPulse.value?.passportListings
  return typeof n === 'number' ? n : null
})
const pulseDays = computed<number | null>(
  () => marketPulse.value?.avgDaysToSell ?? null,
)
const pulseHasAny = computed(
  () =>
    pulseYoY.value !== null ||
    pulseListings.value !== null ||
    pulseDays.value !== null,
)

const savedSearchPills = computed(() => {
  const p = preferences.value
  if (!p) return []
  const pills: string[] = []
  const pc = userPostcode.value
  if (pc) pills.push(`${pc} area`)
  const types: string[] = Array.isArray(p.propertyTypes) ? p.propertyTypes : []
  if (types.length) pills.push(types.slice(0, 2).join(' / '))
  if (p.budgetMin && p.budgetMax) {
    pills.push(`${formatBudget(p.budgetMin)} – ${formatBudget(p.budgetMax)}`)
  } else if (p.budgetMax) {
    pills.push(`Up to ${formatBudget(p.budgetMax)}`)
  } else if (p.budgetMin) {
    pills.push(`From ${formatBudget(p.budgetMin)}`)
  }
  const features: string[] = Array.isArray(p.importantFeatures)
    ? p.importantFeatures
    : []
  if (features.some((f) => /passport/i.test(f))) pills.push('📘 Has Passport')
  return pills
})

const hasSavedSearch = computed(() => savedSearchPills.value.length > 0)

const savedSearchSummary = computed(() => {
  const parts = savedSearchPills.value
  return parts.join(' · ')
})

const selectedAddressText = computed(() => {
  if (!selectedAddress.value) return ''
  const a = selectedAddress.value
  const line1 = a.addressLine1 || a.line1 || a.address || ''
  const line2 = a.addressLine2 || a.line2 || a.postcode || ''
  return line2 ? `${line1} · ${line2}` : line1
})

const installerPropertyId = computed<string | null>(() => {
  const selectedId = selectedAddress.value?.id
  if (selectedId != null && String(selectedId).trim()) return String(selectedId)

  const passportPropertyId = passports.value[0]?.propertyId
  if (passportPropertyId != null && String(passportPropertyId).trim()) {
    return String(passportPropertyId)
  }

  return null
})

const installerPostcode = computed<string>(() => {
  return (
    selectedAddress.value?.postcode ||
    passports.value[0]?.postcode ||
    userPostcode.value ||
    ''
  )
})

const installerAddress = computed<string>(() => {
  return (
    selectedAddress.value?.addressLine1 ||
    selectedAddress.value?.address ||
    selectedAddress.value?.line1 ||
    passports.value[0]?.addressLine1 ||
    passports.value[0]?.address ||
    ''
  )
})

function openGasSafetySheet() {
  installerKind.value = 'gas'
  installerMeasureTitle.value = 'Gas safety check (CP12)'
  installerInitialState.value = 'routes'
  installerSheetOpen.value = true
}

const displayProperties = computed(() => properties.value.slice(0, 6))

// Re-fetches the "For You" feed with the committed filters applied.
// applyDraft() previously only re-ran a search when the user had typed
// a free-text query (searchMode) — opening the filter sheet from the
// base Explore feed and tapping Apply did nothing visible, because
// nothing re-fetched the For You list with the new filter values.
function buildForYouUrl(): string {
  const params = new URLSearchParams()
  if (
    committedPtype.value.length &&
    !(committedPtype.value.length === 1 && committedPtype.value[0] === 'any')
  ) {
    params.set('propertyType', committedPtype.value.join(','))
  }
  if (committedBeds.value != null) {
    params.set('minBedrooms', String(committedBeds.value))
  }
  if (committedEpc.value != null) {
    params.set('minEpc', committedEpc.value)
  }
  if (committedHs.value > 0) {
    params.set('minHomeScore', String(committedHs.value))
  }
  if (committedPassport.value) {
    params.set('passportOnly', '1')
  }
  const qs = params.toString()
  return `${config.public.apiBase}/property/for-you${qs ? `?${qs}` : ''}`
}
async function refreshForYou() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return
  try {
    const res = await $fetch<{ items: any[]; needsPostcode?: boolean }>(buildForYouUrl(), {
      headers: { Authorization: `Bearer ${token}` },
    })
    properties.value = res?.items ?? []
    needsPostcode.value = res?.needsPostcode === true
  } catch {
    /* keep whatever was already showing rather than blank the feed */
  }
}

const verifiedPassportDisplay = computed(() =>
  verifiedPassportProperties.value.slice(0, 6),
)

function clearSearch() {
  selectedAddress.value = null
  searchQuery.value = ''
  searchMode.value = false
  searchProperties.value = []
}

function epcColor(rating: string): string {
  const map: Record<string, string> = {
    A: '#00b050',
    B: '#33b800',
    C: '#92d050',
    D: '#a39200',
    E: '#e08a00',
    F: '#ff6600',
    G: '#ff0000',
  }
  return map[(rating ?? '').toUpperCase()] ?? '#8e8e93'
}

function buildSearchUrl(offset: number): string {
  const params = new URLSearchParams({
    q: searchQuery.value.trim(),
    offset: String(offset),
    limit: String(SEARCH_PAGE_SIZE),
  })
  if (activeRadius.value != null) {
    params.set('radius', String(activeRadius.value))
  }
  // Filter params — only sent when the user has actually picked something
  // (so an unset filter is indistinguishable from a fresh first page).
  if (
    committedPtype.value.length &&
    !(committedPtype.value.length === 1 && committedPtype.value[0] === 'any')
  ) {
    params.set('propertyType', committedPtype.value.join(','))
  }
  if (committedBeds.value != null) {
    params.set('minBedrooms', String(committedBeds.value))
  }
  if (committedEpc.value != null) {
    params.set('minEpc', committedEpc.value)
  }
  if (committedHs.value > 0) {
    params.set('minHomeScore', String(committedHs.value))
  }
  if (committedPassport.value) {
    params.set('passportOnly', '1')
  }
  return `${config.public.apiBase}/property/search?${params.toString()}`
}

async function doSearch() {
  if (!searchQuery.value.trim()) {
    searchMode.value = false
    return
  }
  searchMode.value = true
  searchLoading.value = true
  searchProperties.value = []
  searchTotal.value = 0
  try {
    const token = localStorage.getItem('token')
    const results = await $fetch<any>(buildSearchUrl(0), {
      headers: { Authorization: `Bearer ${token}` },
    })
    searchProperties.value = results?.items ?? []
    searchTotal.value = results?.total ?? searchProperties.value.length
  } catch {
    searchProperties.value = []
    searchTotal.value = 0
  } finally {
    searchLoading.value = false
    nextTick(() => attachLoadMoreObserver())
  }
}

async function loadMoreResults() {
  if (searchLoadingMore.value) return
  if (searchProperties.value.length >= searchTotal.value) return
  searchLoadingMore.value = true
  try {
    const token = localStorage.getItem('token')
    const results = await $fetch<any>(
      buildSearchUrl(searchProperties.value.length),
      { headers: { Authorization: `Bearer ${token}` } },
    )
    const newItems = results?.items ?? []
    // De-dupe by id in case of overlap
    const existingIds = new Set(searchProperties.value.map((p) => p.id))
    for (const item of newItems) {
      if (!existingIds.has(item.id)) searchProperties.value.push(item)
    }
    searchTotal.value = results?.total ?? searchTotal.value
  } catch {
    /* non-critical */
  } finally {
    searchLoadingMore.value = false
  }
}

function attachLoadMoreObserver() {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect()
    loadMoreObserver = null
  }
  if (!loadMoreSentinel.value) return
  loadMoreObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMoreResults()
    },
    { rootMargin: '200px' },
  )
  loadMoreObserver.observe(loadMoreSentinel.value)
}

const hasMoreResults = computed(
  () => searchTotal.value > searchProperties.value.length,
)

function exitSearch() {
  searchMode.value = false
  searchProperties.value = []
  searchTotal.value = 0
  if (loadMoreObserver) {
    loadMoreObserver.disconnect()
    loadMoreObserver = null
  }
  clearSearch()
}

// Take the user into the Claim flow (search → confirm → KYC → issue passport).
function startClaimFlow() {
  navigateTo('/claim')
}

onBeforeUnmount(() => {
  if (loadMoreObserver) {
    loadMoreObserver.disconnect()
    loadMoreObserver = null
  }
})

onMounted(async () => {
  if (!profile.value) await fetchProfile()
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return

  // Apply cached role immediately after hydration (before API responds)
  const cachedRole = localStorage.getItem('umu_role')
  if (cachedRole) role.value = normalizeRole(cachedRole)

  const [
    prefResult,
    passportResult,
    propResult,
    verifiedResult,
    buyerProfileResult,
  ] = await Promise.allSettled([
    $fetch<any>(`${config.public.apiBase}/profile/preferences`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    $fetch<any[]>(`${config.public.apiBase}/profile/passports`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    $fetch<{ items: any[] }>(`${config.public.apiBase}/property/for-you`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    $fetch<{ items: any[] }>(
      `${config.public.apiBase}/property/verified-passports?limit=12`,
    ),
    $fetch<any>(`${config.public.apiBase}/buyer-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ])

  if (buyerProfileResult.status === 'fulfilled') {
    buyerProfilePublished.value = !!buyerProfileResult.value?.published
  }

  if (prefResult.status === 'fulfilled') {
    preferences.value = prefResult.value
    const r = normalizeRole((prefResult.value?.purpose as string[])?.[0])
    role.value = r
    if (typeof window !== 'undefined') localStorage.setItem('umu_role', r)
  }
  loadingPrefs.value = false

  if (passportResult.status === 'fulfilled') {
    passports.value = passportResult.value ?? []
    // No longer auto-switch to "returning" when passports exist — the view
    // is now driven entirely by EXPLORE_VISITED_KEY (first visit vs. not).
  }
  loadingPassport.value = false

  if (propResult.status === 'fulfilled') {
    properties.value = propResult.value?.items ?? []
    needsPostcode.value = (propResult.value as any)?.needsPostcode === true
  }
  loadingProperties.value = false

  if (verifiedResult.status === 'fulfilled') {
    verifiedPassportProperties.value = verifiedResult.value?.items ?? []
  }
  loadingVerifiedPassports.value = false

  // Profile is now hydrated — fetch market pulse for the user's postcode.
  // The watcher above also covers any later postcode changes from settings.
  if (userPostcode.value) fetchMarketPulse()
})
</script>

<style scoped>
/* ── CSS variables (matching prototype) ── */
:root {
  --navy: #231d45;
  --brand: #00a19a;
  --brand-dark: #00a19a;
  --brand-pale: #f1f9f4;
  --brand-soft: #e2f1ea;
  --ink: #1f2024;
  --ink-soft: #4a5568;
  --ink-faint: #94a3b8;
  --line: #e5e7eb;
  --good: #008a84;
}

.explore-root {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #f8f7fc;
}

/* ── Hero header ── */
.explore-hero {
  background: #fff;
  padding: 16px 20px 0;
  flex-shrink: 0;
  border-bottom: 1px solid #e5e7eb;
}

.hero-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 12px;
  min-width: 0;
}
/* The greeting/title column shrinks freely so the avatar + tour button on
   the right never get pushed past the viewport edge. `min-width:0` is the
   key — flex children default to `min-width:auto` which prevents them
   from shrinking below their intrinsic text width and causes the row to
   blow past its parent. */
.hero-row1 > :first-child {
  flex: 1 1 auto;
  min-width: 0;
}
.hero-row1 > :last-child {
  flex: 0 0 auto;
}

.greeting-text {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.02em;
}

.hero-avatar {
  cursor: pointer;
  flex-shrink: 0;
}

.explore-tour-btn {
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
  transition: background 0.15s;
  font-family: inherit;
}
.explore-tour-btn:hover,
.explore-tour-btn:active {
  background: #ccfbf1;
}


/* ── Scrollable area ── */
.explore-scroll {
  flex: 1;
  overflow-y: auto;
  /* Bottom padding clears the fixed BottomNav PLUS the iPhone home-
     indicator safe area, so the last card can't be hidden behind the
     nav. Nav height ~64 px + safe-area-inset-bottom (34 px on X-class). */
  padding: 16px 20px calc(100px + env(safe-area-inset-bottom));
  background: #f8f7fc;
}

/* ── HomeScore free card ── */
.hs-free-card {
  background: #f1f9f4;
  border: 1.5px solid #e2f1ea;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 12px;
}

.hs-free-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.eyebrow-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.eyebrow-label.teal {
  color: #00a19a;
}

.badge-free {
  font-size: 11px;
  font-weight: 700;
  background: #00a19a;
  color: #fff;
  border-radius: 999px;
  padding: 3px 10px;
}

.badge-pp-price {
  font-size: 11px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.12);
  color: #00a19a;
  border: 1px solid rgba(94, 234, 212, 0.3);
  border-radius: 999px;
  padding: 3px 10px;
}

.card-title {
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.card-title.navy {
  color: #231d45;
}

.card-body-text {
  font-size: 13px;
  color: #4a5568;
  line-height: 1.55;
  margin-bottom: 14px;
}

/* ── Property Passport navy card ── */
.pp-navy-card {
  background: linear-gradient(135deg, #231d45 0%, #2d2560 100%);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.pp-navy-glow {
  position: absolute;
  right: -24px;
  top: -24px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.25), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* ── Inner search ── */
.inner-search-wrap {
  position: relative;
}

.inner-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.inner-search-input {
  width: 100%;
  padding: 12px 12px 12px 36px;
  border-radius: 12px;
  border: 1.5px solid #e2f1ea;
  background: #fff;
  font-size: 15px;
  color: #1f2024;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

.inner-search-input.dark {
  border-color: rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.inner-search-input.dark::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* ── Buttons ── */
.btn-brand-full {
  width: 100%;
  border: none;
  padding: 13px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #00a19a;
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
  font-family: inherit;
}

.btn-brand-full:active {
  transform: scale(0.98);
}

.btn-teal-dark {
  width: 100%;
  border: none;
  padding: 13px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #00a19a;
  color: #231d45;
  letter-spacing: -0.01em;
  font-family: inherit;
}

.btn-teal-dark:active {
  transform: scale(0.98);
}

/* ── Property feed header ── */
.feed-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.feed-title {
  font-size: 14px;
  font-weight: 800;
  color: #1f2024;
}

.feed-see-all {
  font-size: 13px;
  font-weight: 700;
  color: #00a19a;
  cursor: pointer;
}

.feed-sub {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 14px;
  line-height: 1.5;
}

/* ── Property card ── */
/* `.skeletons`, `.skeleton-card`, and the keyframes were promoted to
   assets/css/main.css so every page in the app can render the same
   shimmer placeholder without redefining the styles locally. */

.prop-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 12px;
  cursor: pointer;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s;
}

.prop-card:active {
  transform: scale(0.99);
}

.prop-img-wrap {
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prop-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.prop-emoji {
  font-size: 46px;
}

.prop-badge-pp {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #231d45;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pp-emoji-ic {
  width: 11px;
  height: 11px;
  object-fit: contain;
  flex-shrink: 0;
  display: inline-block;
  vertical-align: -1px;
}
.pp-emoji-big {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.prop-badge-risk {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid #d1fae5;
}

.risk-low {
  color: #008a84;
}
.risk-med {
  color: #92400e;
  border-color: #fef3c7;
}

.prop-price-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
}

.prop-body {
  padding: 12px 14px;
}

.prop-address {
  font-size: 15px;
  font-weight: 700;
  color: #1f2024;
  margin-bottom: 1px;
}

.prop-area {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.prop-pills {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.pill-grey {
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
}

.prop-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.prop-score-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.prop-score-lbl {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.prop-score-bar {
  width: 54px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.prop-score-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 4px;
}

.prop-score-num {
  font-size: 15px;
  font-weight: 700;
  color: #1f2024;
}

.prop-passport-btn {
  background: #231d45;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
}

/* ── Returning user: Passport status card ── */
.passport-status-card {
  background: #fff;
  border: 1.5px solid #e5f4f2;
  border-radius: 18px;
  padding: 14px 16px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.passport-status-card:hover {
  border-color: #00a19a;
  box-shadow: 0 8px 22px -8px rgba(0, 161, 154, 0.25);
}

.passport-status-card:active {
  transform: scale(0.99);
}

.psc-glow {
  position: absolute;
  right: -30px;
  top: -30px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.1), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.psc-main {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.psc-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.psc-icon-box {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  background: #e6f7f6;
  border-radius: 12px;
  display: grid;
  place-items: center;
  border: 1px solid #b2e4e1;
}

/* Real Property Passport cover — hosts the shared <PassportCard>
   component (same one the /passport/collections page uses). Overrides
   the component's default 32px vertical margin and 360px max-width so
   it renders as a compact ~64px tile inside this tighter tile slot. */
.psc-passport-slot {
  width: 64px;
  flex-shrink: 0;
}
.psc-passport-slot :deep(.passport-card) {
  margin: 0;
  perspective: none;
}
.psc-passport-slot :deep(.passport-container) {
  width: 100%;
  max-width: none;
}
.psc-passport-slot :deep(.passport-image) {
  width: 100%;
  height: auto;
  display: block;
}
/* Address on the mini-passport reads too bold + too high at this size —
   nudge down 2px and drop weight to normal. Applied via :deep() so the
   shared PassportCard component styling stays untouched elsewhere. */
.psc-passport-slot :deep(.passport-address) {
  bottom: calc(14% - 2px);
}
/* Force the address type well below PassportCard's clamp minimum —
   at 64px width the shared component's clamp(8px, 7.5cqi, 14px)
   floors at 8px which visually overflowed the cover. Explicit tiny
   sizes match the client's 5-6px ask; !important is needed because
   the source rule uses clamp() which otherwise wins the cascade tie. */
.psc-passport-slot :deep(.address-line) {
  font-size: 6px !important;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: 0;
}
.psc-passport-slot :deep(.address-line-small) {
  font-size: 5px !important;
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: 0.02em;
}

.psc-label-small {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 2px;
}

.psc-address {
  font-size: 14px;
  font-weight: 700;
  color: #0e2840;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.psc-postcode {
  font-size: 12px;
  color: #6b7c8e;
}

.psc-gauge {
  flex-shrink: 0;
  text-align: center;
  position: relative;
  /* SVG is 54px, label sits below — total container height ~68px so
     the score number can be absolutely centred inside the ring. */
  width: 54px;
}
/* Score number sits dead-centre inside the ring rather than below the
   old half-moon. Absolute-positioning it works for any digit count. */
.psc-gauge-num {
  position: absolute;
  top: 0;
  left: 0;
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: #0e2840;
  line-height: 1;
  pointer-events: none;
}

.psc-gauge-lbl {
  margin-top: 4px;
  font-size: 9px;
  color: #8f9094;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}

.psc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #e5f4f2;
}

.psc-footer-stats {
  display: flex;
  gap: 12px;
}

.psc-stat {
  font-size: 12px;
  color: #6b7c8e;
  font-weight: 600;
}

.psc-stat strong {
  color: #0e2840;
  font-weight: 800;
}

.psc-view-cta {
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  background: #00a19a;
  padding: 6px 12px;
  border-radius: 100px;
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.25);
}

/* No passport state */
.no-passport-card {
  background: #fff;
  border: 2px dashed #e0e0e8;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 14px;
}

.no-pp-icon {
  font-size: 28px;
  flex-shrink: 0;
}
.no-pp-body {
  flex: 1;
}
.no-pp-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2024;
  margin-bottom: 2px;
}
.no-pp-sub {
  font-size: 13px;
  color: #94a3b8;
}
.no-pp-cta {
  font-size: 15px;
  font-weight: 700;
  color: #00a19a;
  flex-shrink: 0;
}

/* ── Next action nudge ── */
.next-action-card {
  background: #fffbeb;
  border: 1.5px solid #fef3c7;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.next-action-card:active {
  transform: scale(0.99);
}

.na-icon {
  font-size: 22px;
  flex-shrink: 0;
}
.na-body {
  flex: 1;
}
.na-title {
  font-size: 14px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 2px;
}
.na-sub {
  font-size: 13px;
  color: #92400e;
  line-height: 1.4;
}
.na-cta {
  font-size: 13px;
  font-weight: 700;
  color: #92400e;
  flex-shrink: 0;
}

/* ── HomeScore quick card ── */
.hs-quick-card {
  background: #f1f9f4;
  border: 1.5px solid #e2f1ea;
  border-radius: 14px;
  padding: 13px 16px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.hs-quick-card:active {
  transform: scale(0.99);
}

.hs-quick-icon {
  font-size: 22px;
  flex-shrink: 0;
}
.hs-quick-body {
  flex: 1;
}
.hs-quick-title {
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
  margin-bottom: 2px;
}
.hs-quick-sub {
  font-size: 13px;
  color: #4a5568;
  line-height: 1.4;
}
.hs-quick-cta {
  font-size: 13px;
  font-weight: 700;
  color: #00a19a;
  flex-shrink: 0;
}

/* ── Find a Pro dark card ── */
.pro-dark-card {
  background: #1e1842;
  border-radius: 16px;
  padding: 14px 18px;
  margin-bottom: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
}

.pro-dark-card:active {
  transform: scale(0.99);
}

.pro-dark-icon {
  font-size: 26px;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
}
.pro-dark-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.pro-dark-body {
  flex: 1;
}
.pro-dark-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 2px;
}
.pro-dark-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
}

.pro-dark-badge {
  background: rgba(94, 234, 212, 0.15);
  border: 1px solid rgba(94, 234, 212, 0.3);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
  flex-shrink: 0;
  white-space: nowrap;
}

.explore-greeting-sub {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
  /* Single line + ellipsis. Long names like "Good afternoon, Christopher"
     would otherwise wrap into three lines and squash the title. */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.explore-title {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.02em;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.selected-addr-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 10px;
}

.search-clear-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e5e7eb;
  display: grid;
  place-items: center;
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0;
}

.claim-banner {
  background: linear-gradient(135deg, #231d45, #2d2560);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.claim-glow {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 110px;
  height: 110px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.3), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.claim-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 6px;
}

.claim-title {
  font-size: 19px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.claim-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.55;
  margin-bottom: 16px;
}

.claim-stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.claim-stat-box {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 10px 12px;
  text-align: center;
}

.claim-stat-val {
  font-size: 15px;
  font-weight: 800;
  color: #00a19a;
}

.claim-stat-lbl {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  line-height: 1.3;
}

.btn-claim {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #00a19a;
  color: #231d45;
  font-family: inherit;
}

.btn-claim:active {
  transform: scale(0.98);
}

.step-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #00a19a;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.saved-search-card {
  background: #f1f9f4;
  border: 1.5px solid #e2f1ea;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.saved-search-card--empty {
  background: #fff;
  border-style: dashed;
  cursor: pointer;
}

.saved-search-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.saved-search-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pill-brand {
  background: #f1f9f4;
  color: #00a19a;
  border: 1px solid #e2f1ea;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
}

.saved-search-compact {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.saved-search-compact:active {
  transform: scale(0.99);
}

.market-pulse-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 14px;
}

/* My Buyer Profile entry card (buy role) */
.my-passport-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 14px;
  cursor: pointer;
  transition: background 0.12s;
}
.my-passport-card:active {
  background: #f0fdfa;
}
.my-passport-card--published {
  background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
  border-color: #00a19a;
}
.my-passport-card--published .my-passport-ic {
  background: #00a19a;
  color: #fff;
  border-color: #00a19a;
  font-weight: 800;
}
.my-passport-ic {
  width: 40px;
  height: 40px;
  background: #f0fdfa;
  border: 1.5px solid #99f6e4;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
  flex-shrink: 0;
  overflow: hidden;
}
.my-passport-ic img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.my-passport-body {
  flex: 1;
  min-width: 0;
}
.my-passport-title {
  font-size: 15px;
  font-weight: 700;
  color: #231d45;
}
.my-passport-sub {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
  line-height: 1.4;
}
.my-passport-arrow {
  font-size: 16px;
  color: #00a19a;
  font-weight: 700;
  flex-shrink: 0;
}

.pulse-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.pulse-cell {
  background: #fff;
  padding: 10px 8px;
  text-align: center;
}

.pulse-val {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}

.pulse-lbl {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
  line-height: 1.3;
}

.portfolio-card {
  background: linear-gradient(135deg, #1c1917, #292524);
  border-radius: 18px;
  padding: 16px 18px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
}

.portfolio-glow {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 140px;
  height: 140px;
  background: radial-gradient(
    circle,
    rgba(251, 191, 36, 0.15),
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
}

.portfolio-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(251, 191, 36, 0.5);
  margin-bottom: 12px;
}

.portfolio-stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 4px;
  margin-bottom: 14px;
}

.portfolio-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(248, 113, 113, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 4px;
}

.portfolio-prop-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.add-property-card {
  background: #f1f9f4;
  border: 1.5px solid #e2f1ea;
  border-radius: 14px;
  padding: 13px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  margin-bottom: 14px;
}

.add-property-card:active {
  transform: scale(0.99);
}

.horiz-feed {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  margin: 0 -20px;
  padding-left: 20px;
  padding-right: 20px;
}

.horiz-feed::-webkit-scrollbar {
  display: none;
}

.prop-card-horiz {
  min-width: 270px;
  flex-shrink: 0;
  margin-bottom: 0;
}

/* ── Search mode ── */
.search-back-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.search-back-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f0f0f8;
  border: none;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 15px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
  font-family: inherit;
}

.search-back-btn:active {
  transform: scale(0.97);
}

.search-result-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results-msg {
  text-align: center;
  padding: 48px 20px;
}

.no-results-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.no-results-text {
  font-size: 16px;
  font-weight: 700;
  color: #231d45;
  margin-bottom: 4px;
}

.no-results-sub {
  font-size: 15px;
  color: #94a3b8;
}

/* ── For You empty state ── */
.foryou-empty {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  margin-bottom: 12px;
}
.foryou-empty-ic {
  font-size: 32px;
  margin-bottom: 8px;
}
.foryou-empty-ic-img {
  width: 56px;
  height: 56px;
  margin: 0 auto 8px;
}
.foryou-empty-ic-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.foryou-empty-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 4px;
}
.foryou-empty-sub {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.5;
  margin-bottom: 12px;
}
.foryou-empty-btn {
  background: var(--brand);
  color: #fff;
  border: none;
  font-size: 15px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
}

/* ── Verified passports empty state ── */
.verified-empty {
  background: #fff;
  border: 1.5px dashed var(--brand-soft);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  margin-bottom: 12px;
}
.verified-empty-ic {
  font-size: 32px;
  margin-bottom: 8px;
}
.verified-empty-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 4px;
}
.verified-empty-sub {
  font-size: 13px;
  color: var(--ink-soft);
  line-height: 1.5;
  margin-bottom: 12px;
}
.verified-empty-btn {
  background: var(--brand);
  color: #fff;
  border: none;
  font-size: 15px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
}

/* ── EPC badge on search result card ── */
.prop-row-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}
.prop-title-col {
  flex: 1;
  min-width: 0;
}
.epc-badge {
  min-width: 44px;
  padding: 5px 8px;
  border-radius: 8px;
  color: #fff;
  text-align: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.epc-badge-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
  opacity: 0.85;
  line-height: 1;
}
.epc-badge-rating {
  font-size: 16px;
  font-weight: 900;
  line-height: 1.1;
  margin-top: 1px;
}

/* ── Load more (infinite scroll) ── */
.load-more-sentinel {
  display: flex;
  justify-content: center;
  padding: 16px 0 8px;
}
.load-more-btn {
  background: #fff;
  border: 1.5px solid var(--line);
  color: var(--brand);
  font-size: 15px;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
}
.load-more-btn:active {
  background: var(--brand-pale);
}
.load-more-spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid #e5e7eb;
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.load-more-end {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
  padding: 12px 0 8px;
  font-weight: 600;
}

/* 3D icon images that replaced flat emoji inside icon wrappers */
.no-results-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 12px;
}
.no-results-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.no-pp-icon {
  width: 34px;
  height: 34px;
}
.no-pp-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.na-icon {
  width: 26px;
  height: 26px;
}
.na-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.foryou-empty-ic {
  width: 42px;
  height: 42px;
  margin: 0 auto 8px;
}
.foryou-empty-ic img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>
