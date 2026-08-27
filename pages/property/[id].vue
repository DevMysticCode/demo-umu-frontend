<template>
  <div class="pps-page">
    <!-- Loading — shimmer skeleton that mirrors the real hero + cards
         layout so the page doesn't jump when data arrives. -->
    <div v-if="pageLoading" class="pps-loading-skel">
      <div class="skeleton-block pps-skel-hero" />
      <div class="pps-skel-body">
        <div class="skeleton-line" style="width: 65%; height: 18px" />
        <div class="skeleton-line" style="width: 40%; margin-top: 10px" />
        <div class="skeleton-card pps-skel-card" />
        <div class="skeleton-card pps-skel-card" />
        <div class="skeleton-card pps-skel-card" style="height: 220px" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="pps-loading-state">
      <p>{{ loadError }}</p>
      <button class="pps-back-txt" @click="goBack">Go Back</button>
    </div>

    <template v-else-if="property">
      <!-- ─── SECTION 0: App Header ────────────────────────────────── -->
      <div class="pps-app-header">
        <div class="pps-app-header-brand">
          <div class="pps-app-header-logo">
            <OPIcon name="logo" class="w-[26px] h-[26px]" />
          </div>
          <span>umovingu</span>
        </div>
        <div class="pps-app-header-actions">
          <button
            class="pps-app-header-help"
            type="button"
            aria-label="Help"
            @click="navigateTo('/profile/support')"
          >
            ?
          </button>
          <NotificationBell />
          <div class="pps-app-header-avatar" @click="navigateTo('/profile')">
            <UserAvatar
              :src="profile?.avatarUrl"
              :firstName="profile?.firstName"
              :lastName="profile?.lastName"
              :size="34"
            />
          </div>
        </div>
      </div>
      <button class="pps-back-link" type="button" @click="goBack">
        <svg
          width="9"
          height="14"
          viewBox="0 0 10 16"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M8 1L2 8l6 7" />
        </svg>
        Back to Explore
      </button>

      <!-- ─── SECTION 1+2: Hero Card (photo + identity, side-by-side,
           mirrors the prototype's single-card layout exactly) ────────── -->
      <div class="pps-hero-card">
        <div class="pps-hero-card-top">
          <div class="pps-hero-photo">
            <img
              :key="heroImageIndex"
              :src="heroImageRaw || DUMMY_PROPERTY_IMAGE"
              class="pps-hero-photo-img"
              alt=""
              @error="onHeroImageError"
            />
            <div v-if="propertyImages.length > 0" class="pps-hero-photo-count">
              <svg
                width="12"
                height="10"
                viewBox="0 0 24 20"
                fill="none"
                stroke="white"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M8 3l1.5-2h5L16 3h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3z"
                />
                <circle cx="12" cy="11" r="3.5" />
              </svg>
              {{ propertyImages.length }}
            </div>
          </div>

          <div class="pps-hero-card-identity">
            <div class="pps-identity-title-row">
              <div class="pps-identity-address">
                {{ property.addressLine1 }}
              </div>
              <div
                class="pps-badge-passport"
                :class="{
                  'pps-badge-passport--unclaimed': pageState === 'unclaimed',
                  'pps-badge-passport--progress': pageState === 'progress',
                }"
              >
                <template v-if="pageState === 'unclaimed'">UNCLAIMED</template>
                <template v-else-if="pageState === 'progress'"
                  >IN PROGRESS</template
                >
                <template v-else>✓ AVAILABLE</template>
              </div>
            </div>
            <div class="pps-identity-suburb">
              <template v-if="property.city">{{ property.city }}</template>
              <template v-if="property.city && property.postcode">, </template>
              <template v-if="property.postcode">{{
                property.postcode
              }}</template>
            </div>

            <div v-if="estimatedPrice" class="pps-price-row">
              <span class="pps-price-value">{{
                formatPrice(estimatedPrice)
              }}</span>
              <span class="pps-price-source">
                {{ priceSourceLabel }}
                <button
                  class="pps-price-info"
                  type="button"
                  aria-label="About this estimate"
                  @click.stop="openSheet('price-info')"
                >
                  i
                </button>
              </span>
            </div>

            <div class="pps-pill-row">
              <span v-if="property.propertyType" class="pps-pill">{{
                property.propertyType
              }}</span>
              <span v-if="property.sqft" class="pps-pill"
                >📐 {{ property.sqft.toLocaleString() }} sqft</span
              >
              <span v-if="property.yearBuilt" class="pps-pill"
                >📅 {{ property.yearBuilt }}</span
              >
            </div>
            <div
              v-if="floodBadgeLabel"
              class="pps-badge-flood pps-badge-flood--card"
            >
              <img
                src="/op-icons/misc/waterDroplet.png"
                alt=""
                loading="lazy"
              />
              {{ floodBadgeLabel }}
            </div>

            <!-- Watch / Ask — sits in the identity column below the price,
                 per the prototype (was previously a separate full-width
                 section below the whole hero card). -->
            <div class="pps-hero-quick-actions">
              <button
                type="button"
                class="pps-hero-quick-btn"
                @click="onWatchClick"
              >
                <img
                  src="/op-icons/property/watchThis.jpeg"
                  alt=""
                  class="pps-hero-quick-ic"
                  loading="lazy"
                />
                {{ pageState === 'progress' ? 'Get notified' : 'Watch this' }}
              </button>
              <button
                type="button"
                class="pps-hero-quick-btn"
                @click="onContactClick"
              >
                <img
                  src="/op-icons/property/askAQuestion.jpeg"
                  alt=""
                  class="pps-hero-quick-ic"
                  loading="lazy"
                />
                {{
                  pageState === 'published' ? 'Make contact' : 'Ask a question'
                }}
              </button>
            </div>

            <!-- Floating claim box — normal-flow block right after the
                 Watch/Ask buttons in the identity column, so it always
                 sits directly below them with no gap that depends on
                 guessing how tall the address/pills/badges above happen
                 to be for a given property (a fixed-height photo overlap
                 trick was tried here and broke for shorter addresses —
                 the gap size varied with content length). Widened past
                 the identity column via a negative left margin so it
                 still overlaps the photo on the left, matching the
                 prototype, while its vertical position is fully
                 content-driven. Shown for all three passport states now,
                 so unclaimed/in-progress/published all get the same
                 treatment here instead of only unclaimed getting this
                 card and the other two only getting the plainer in-flow
                 PassportClaimBox banner below. Hidden (not shown as a
                 confident "unclaimed") when the status fetch genuinely
                 failed — see passportStatusUnknown above. -->
            <div v-if="!passportStatusUnknown" class="pps-float-claim">
              <div v-if="streetClaimLabel" class="pps-float-claim-streetpill">
                <span class="pps-float-claim-streetpill-dot" />
                {{ streetClaimLabel }}
              </div>
              <div class="pps-float-claim-top">
                <div class="pps-float-claim-ic-wrap">
                  <img
                    src="/op-icons/passport-covers/seller_tilted_right_on_tile.png"
                    alt=""
                    class="pps-float-claim-ic"
                    loading="lazy"
                  />
                  <div
                    class="pps-float-claim-gauge"
                    :style="{ '--pct': progressPct }"
                  >
                    <span>{{ progressPct }}%</span>
                  </div>
                </div>
                <div class="pps-float-claim-body">
                  <div class="pps-float-claim-title">{{ floatClaimTitle }}</div>
                  <div class="pps-float-claim-sub">{{ floatClaimSub }}</div>
                  <div v-if="floatClaimEmphasis" class="pps-float-claim-emphasis">
                    {{ floatClaimEmphasis }}
                  </div>
                  <div v-if="floatClaimSub2" class="pps-float-claim-sub2">
                    {{ floatClaimSub2 }}
                  </div>
                  <span
                    v-if="floatClaimExplainerLabel"
                    class="pps-float-claim-explain"
                    @click.stop="onFloatClaimExplainerClick"
                  >
                    {{ floatClaimExplainerLabel }}
                    <span class="pps-float-claim-explain-q">?</span>
                  </span>
                  <div
                    v-if="watcherCountLabel"
                    class="pps-float-claim-watchers"
                  >
                    👀 {{ watcherCountLabel }}
                  </div>
                </div>
              </div>
              <div class="pps-float-claim-cta">
                <button
                  type="button"
                  class="pps-float-claim-btn"
                  @click="onFloatClaimCtaClick"
                >
                  {{ floatClaimCta }}
                </button>
                <div v-if="floatClaimMeta" class="pps-float-claim-price">
                  {{ floatClaimMeta }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── SECTION 3: Action Bar ────────────────────────────────── -->
      <!-- The actual PassportClaimBox visible box (teal in-progress ring /
           gold "champagne band" published card) — NOT headless here, so
           tapping it opens its own drawer directly via its own internal
           click handler, same as it always has. Was previously
           reconstructed by hand as static buttons (and before that,
           hard-disabled with v-if="false"); this is the real component.
           Unclaimed is skipped: .pps-float-claim above already covers it
           with its own box, and owners/collaborators get their own
           "Continue building" CTA in SECTION 7 instead of a buyer pitch. -->
      <PassportClaimBox
        v-if="pageState !== 'unclaimed' && !isPassportOwnerOrCollab"
        :state="pageState === 'progress' ? 'inProgress' : 'published'"
        :progress-pct="progressPct"
        :property-id="propertyId"
        @watch="onWatchClick"
        @buy="routeForPassportState"
      />

      <!-- ─── SECTION 5: HomeScore ─────────────────────────────────── -->
      <div
        class="pps-score-card pps-score-card--clickable"
        @click="onScoreCardTap"
      >
        <div class="pps-score-top">
          <div class="pps-score-blob-tr" />
          <div class="pps-score-blob-bl" />
          <span class="pps-score-tap-hint" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>

          <div class="pps-gauge-wrap">
            <svg class="pps-gauge-svg" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="ppsGrad" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0%" stop-color="#00BB93" />
                  <stop offset="100%" stop-color="#016F84" />
                </linearGradient>
              </defs>
              <circle class="pps-gauge-bg" cx="50" cy="50" r="40" />
              <circle
                class="pps-gauge-fill"
                cx="50"
                cy="50"
                r="40"
                stroke="url(#ppsGrad)"
                :stroke-dashoffset="251.33 - (homescore / 100) * 251.33"
              />
            </svg>
            <div class="pps-gauge-center">
              <span class="pps-gauge-num">{{ homescore }}</span>
              <span class="pps-gauge-denom">/100</span>
            </div>
          </div>

          <div class="pps-score-info">
            <div class="pps-score-eyebrow">HomeScore™</div>
            <div class="pps-score-verdict">{{ scoreVerdict }}</div>
            <div class="pps-score-desc">{{ scoreDesc }}</div>
            <div v-if="property.epcRating" class="pps-score-epc-pill">
              <span class="pps-epc-dot" :style="{ background: epcDotColor }" />
              EPC {{ property.epcRating
              }}<template v-if="property.epcScore">
                ({{ property.epcScore }})</template
              >
              <template v-if="property.yearBuilt">
                · Built {{ property.yearBuilt }}</template
              >
            </div>
          </div>
        </div>

        <div v-if="epcBars.length > 0" class="pps-score-bottom">
          <div class="pps-epc-header">From the public EPC certificate</div>
          <div class="pps-epc-rows">
            <div v-for="bar in epcBars" :key="bar.label" class="pps-epc-row">
              <span class="pps-epc-label">{{ bar.label }}</span>
              <div class="pps-epc-track">
                <div
                  class="pps-bar-fill"
                  :style="{ width: bar.pct + '%', background: bar.color }"
                />
              </div>
              <span class="pps-epc-rating">{{ bar.rating }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── SECTION 6: Explore Grid ──────────────────────────────── -->
      <div class="pps-explore-header">
        <span class="pps-explore-title">Explore this property</span>
        <span class="pps-explore-sources"
          >{{ exploreTiles.length }} data sources</span
        >
      </div>
      <div class="pps-explore-grid">
        <div
          v-for="tile in exploreTiles"
          :key="tile.key"
          class="pps-tile"
          @click="onExploreTileClick(tile.key)"
        >
          <div
            class="pps-tile-icon"
            :class="{ 'pps-tile-icon--img': !!tile.iconImage }"
            :style="tile.iconImage ? undefined : { background: tile.iconBg }"
          >
            <img
              v-if="tile.iconImage"
              :src="tile.iconImage"
              :alt="tile.title"
              class="pps-tile-icon-img"
              loading="lazy"
            />
            <template v-else>{{ tile.icon }}</template>
          </div>
          <div class="pps-tile-title">
            {{ tile.title }}
            <span
              v-if="tile.pip"
              class="pps-tile-new-pip"
              :style="tile.pip === '!' ? { background: '#C73E36' } : undefined"
              >{{ tile.pip }}</span
            >
          </div>
          <div class="pps-tile-value" :style="tile.valueStyle">
            {{ tile.value }}
          </div>
          <div class="pps-tile-sub">{{ tile.sub }}</div>
          <div v-if="tile.trend" class="pps-tile-trend">
            <span class="pps-tile-trend-arrow">↑</span> {{ tile.trend }}
          </div>
          <span class="pps-tile-arrow">→</span>
        </div>
      </div>

      <!-- ─── SECTION 7: Keep going with umovingu ──────────────────── -->
      <div v-if="pageState === 'unclaimed'" class="pps-keepgoing">
        <div class="pps-keepgoing-title">Keep going with umovingu</div>
        <div class="pps-keepgoing-sub">
          More tools. More insight. More ways to get move-ready.
        </div>
        <div class="pps-keepgoing-cards">
          <div class="pps-keepgoing-card">
            <img
              src="/op-icons/misc/passportFanReversed.png"
              alt=""
              class="pps-keepgoing-card-ic pps-keepgoing-card-ic--fan"
              loading="lazy"
            />
            <div class="pps-keepgoing-card-body">
              <div class="pps-keepgoing-card-title">Explore passports</div>
              <div class="pps-keepgoing-card-sub">
                Discover how Property, Buyer, and Tenant Passports keep key
                information organized, verified, and reusable.
              </div>
              <button
                type="button"
                class="pps-keepgoing-card-btn"
                @click="passportEcosystemOpen = true"
              >
                Explore passports
              </button>
            </div>
          </div>
          <div class="pps-keepgoing-card">
            <img
              src="/op-icons/misc/exploreLocation.png"
              alt=""
              class="pps-keepgoing-card-ic"
              loading="lazy"
            />
            <div class="pps-keepgoing-card-body">
              <div class="pps-keepgoing-card-title">Explore more homes</div>
              <div class="pps-keepgoing-card-sub">
                Compare property listings, review HomeScores, and analyze
                comprehensive neighborhood data near you.
              </div>
              <button
                type="button"
                class="pps-keepgoing-card-btn"
                @click="router.push('/explore')"
              >
                Back to Explore
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="pageState === 'progress'" class="pps-passport-card">
        <div class="pps-score-blob-tr" />
        <div class="pps-score-blob-bl" />
        <div class="pps-passport-eyebrow-row">
          <span class="pps-passport-eyebrow"
            ><span
              class="pps-passport-eyebrow-dot"
              style="background: #00a19a"
            />Property Passport</span
          >
          <span
            class="pps-passport-price-pill"
            style="background: #e6f7f6; color: #007e78; border-color: #b2e4e1"
            >In progress</span
          >
        </div>
        <div class="pps-passport-title" style="color: #00a19a">
          Passport being built
        </div>
        <div class="pps-passport-explain pps-passport-explain--progress">
          <div style="flex: 1">
            <div class="pps-passport-explain-eyebrow" style="color: #007e78">
              Stop buying blind
            </div>
            <div class="pps-passport-explain-body" style="color: #2a5c58">
              This Passport is being built right now — so when you make your
              move, the answers are already there.
            </div>
          </div>
          <button
            type="button"
            class="pps-explain-btn"
            style="background: #00a19a"
            @click.stop="openSheet('explain-progress')"
            aria-label="Why a Property Passport"
          >
            ?
          </button>
        </div>

        <div class="pps-progress-bar-wrap">
          <div
            class="pps-progress-bar-fill"
            :style="{
              width: progressPct + '%',
              background: 'linear-gradient(90deg, #00a19a, #4DD4CE)',
            }"
          />
        </div>
        <div class="pps-progress-label">{{ progressPct }}% complete</div>

        <div class="pps-passport-features">
          <div
            v-for="f in passportFeatures"
            :key="f.title"
            class="pps-passport-feature"
          >
            <div
              class="pps-feature-icon"
              :class="
                f.verified
                  ? 'pps-feature-icon--verified'
                  : 'pps-feature-icon--locked'
              "
            >
              <svg
                v-if="f.verified"
                width="14"
                height="11"
                viewBox="0 0 14 11"
                fill="none"
              >
                <path
                  d="M1.5 5.5L5.5 9.5L12.5 1.5"
                  stroke="#00b6ae"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg
                v-else
                width="12"
                height="14"
                viewBox="0 0 12 14"
                fill="none"
                stroke="#c0bdcc"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="1.5" y="6" width="9" height="7" rx="2" />
                <path d="M3.5 6V4a2.5 2.5 0 0 1 5 0v2" />
              </svg>
            </div>
            <div>
              <div
                :class="
                  f.verified
                    ? 'pps-feature-text-title--verified'
                    : 'pps-feature-text-title--locked'
                "
              >
                {{ f.title }}
              </div>
              <div class="pps-feature-text-sub">{{ f.sub }}</div>
            </div>
          </div>
        </div>

        <!-- CTA: owner/collaborator gets a "continue building" path; everyone
             else sees the original "notify me on publish" watch CTA. -->
        <button
          type="button"
          class="pps-passport-cta"
          style="
            background: #00a19a;
            box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
            color: white;
          "
          @click="onProgressCtaClick"
        >
          <template v-if="isPassportOwnerOrCollab">
            <img
              src="/op-icons/homescore/clipboard.png"
              alt=""
              class="inline-ic"
              loading="lazy"
            />
            Continue building your Passport →
          </template>
          <template v-else
            ><img
              src="/op-icons/misc/bell.png"
              alt=""
              class="inline-ic"
              loading="lazy"
            />
            Get notified when published →</template
          >
        </button>
        <div class="pps-passport-cta-sub">
          <template v-if="isPassportOwnerOrCollab">
            <template v-if="progressPct > 0">
              You're {{ progressPct }}% complete — tap to finish your remaining
              sections.
            </template>
            <template v-else>
              Open your Passport to start filling in sections.
            </template>
          </template>
          <template v-else>
            We'll alert you the moment this Passport goes live.
          </template>
        </div>
      </div>

      <div
        v-else
        class="pps-passport-card pps-passport-card--clickable"
        role="button"
        tabindex="0"
        @click="onAccessPassport"
      >
        <div class="pps-score-blob-tr" />
        <div class="pps-score-blob-bl" />
        <div class="pps-passport-eyebrow-row">
          <span class="pps-passport-eyebrow"
            ><span class="pps-passport-eyebrow-dot" />Property Passport</span
          >
          <span class="pps-passport-price-pill">£99 →</span>
        </div>

        <div class="pps-passport-title">This home's Passport</div>
        <div class="pps-passport-explain pps-passport-explain--published">
          <div style="flex: 1">
            <div class="pps-passport-explain-eyebrow" style="color: #b07a1c">
              The HPI check for your home
            </div>
            <div class="pps-passport-explain-body" style="color: #6b4c1a">
              The verified record that should have always existed — and now it
              does.
            </div>
          </div>
          <button
            type="button"
            class="pps-explain-btn"
            style="background: #d4822a"
            @click.stop="openSheet('explain-published')"
            aria-label="Why a Property Passport"
          >
            ?
          </button>
        </div>

        <div class="pps-progress-bar-wrap">
          <div class="pps-progress-bar-fill" style="width: 100%" />
        </div>
        <div class="pps-progress-label">100% complete — Passport live</div>

        <div class="pps-passport-features">
          <div
            v-for="f in publishedFeatures"
            :key="f.title"
            class="pps-passport-feature"
          >
            <div class="pps-feature-icon pps-feature-icon--verified">
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                <path
                  d="M1.5 5.5L5.5 9.5L12.5 1.5"
                  stroke="#00b6ae"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div>
              <div class="pps-feature-text-title--verified">{{ f.title }}</div>
              <div class="pps-feature-text-sub">{{ f.sub }}</div>
            </div>
          </div>
        </div>

        <div
          class="pps-passport-cta-sub"
          style="margin-top: 14px; text-align: left"
        >
          Secure payment · Instant access · No subscription
        </div>
      </div>

      <!-- ─── SECTION 8: Running Costs ─────────────────────────────── -->
      <!-- Hidden for now, may come back later — disabled via v-if="false"
           rather than an HTML comment because this block already contains
           its own inner HTML comments, and HTML comments can't nest. -->
      <div v-if="false && costsBoxes.length > 0" class="pps-costs-card">
        <div class="pps-costs-header">
          <span class="pps-costs-header-title">Estimated running costs</span>
          <span class="pps-costs-header-sub">EPC estimate</span>
        </div>
        <div class="pps-costs-body">
          <div class="pps-costs-grid">
            <div
              v-for="box in costsBoxes"
              :key="box.label"
              class="pps-costs-box"
              :class="{ 'pps-costs-box--highlight': box.highlight }"
            >
              <div class="pps-costs-box-inner">
                <div class="pps-costs-box-front">
                  <span class="pps-costs-box-value"
                    >£{{ box.value.toLocaleString() }}</span
                  >
                  <span class="pps-costs-box-label">{{ box.label }}</span>
                </div>
                <div class="pps-costs-box-back">
                  <div class="pps-costs-box-back-label">Per month</div>
                  <div class="pps-costs-box-back-val">
                    ~£{{ Math.round(box.value / 12).toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="pps-costs-attr">
            Based on EPC assumptions. Costs vary by usage and tariff.
          </div>
          <!-- EPC potential rating (restored — surfaces the upside the EPC
               surveyor noted, e.g. "could reach A 92"). -->
          <div
            v-if="
              epcPotentialRating && epcPotentialRating !== property?.epcRating
            "
            class="pps-costs-upside"
          >
            <span class="pps-costs-upside-ic">↑</span>
            <span>
              Could reach
              <strong
                >{{ epcPotentialRating
                }}<template v-if="epcPotentialScore">
                  {{ epcPotentialScore }}</template
                ></strong
              >
              with the EPC's recommended upgrades
            </span>
          </div>
        </div>
      </div>

      <!-- SECTION 9 removed — Type / EPC / UPRN now live inside the
           'Property details' explore-grid tile → bottom sheet. -->

      <!-- EPC fabric breakdown (restored from old version) — only when we
           have at least one component-level rating from the EPC API. -->
      <!-- Hidden for now, may come back later — see the v-if="false" note
           on the Running Costs section above for why this isn't a plain
           HTML comment. -->
      <div v-if="false && epcComponents.length > 0" class="pps-details-card">
        <div class="pps-details-header">EPC fabric breakdown</div>
        <div class="pps-details-sub">
          How each part of the building scores in the latest Energy Performance
          Certificate.
        </div>
        <div class="pps-epc-comp-list">
          <div
            v-for="c in epcComponents"
            :key="c.label"
            class="pps-epc-comp-row"
          >
            <div class="pps-epc-comp-label">{{ c.label }}</div>
            <div class="pps-epc-comp-track">
              <div
                class="pps-epc-comp-fill"
                :class="epcCompClass(c.eff)"
                :style="{ width: c.pct + '%' }"
              />
            </div>
            <div
              class="pps-epc-comp-rating"
              :style="{ color: epcCompColor(c.eff) }"
            >
              {{ c.eff }}
            </div>
          </div>
        </div>
      </div>

      <div style="height: 80px" />
    </template>

    <!-- Drawers — wired to the new state-driven CTAs. -->
    <!-- Reuses the same explainer drawer + auth gate the homescore page
         shows on its PassportClaimBox. We render in `headless` mode so
         only the drawer appears (the property page already has its own
         "Claim this property — it's free" CTA + the restored Action Bar
         above, which opens the progress/published explainer states).
         `state` has no effect in headless mode (it only gates the
         suppressed visible boxes) — left as 'unclaimed' from before.
         @watch/@buy reuse this page's own watch drawer / smart passport
         router rather than PassportClaimBox inventing its own. -->
    <PassportClaimBox
      v-model:open-sheet="claimExplainerSheet"
      headless
      state="unclaimed"
      :property-id="propertyId"
      :progress-pct="progressPct"
      :is-owner-or-collaborator="isPassportOwnerOrCollab"
      :published-at="passportStatus?.publishedAt ?? null"
      @claim-passport="goToClaim"
      @watch="onWatchClick"
      @buy="routeForPassportState"
      @continue-building="onProgressCtaClick"
    />

    <!-- Owner-claim (free) goes through the global /claim/[id] flow which
         enforces KYC + HM Land Registry verification before issuing a
         Passport. The buyer-unlock (£99) drawer below handles the Stripe
         payment for a published Passport. -->
    <ClaimPassportDrawer
      v-model="showUnlockDrawer"
      :property="property"
      :existing-passport-id="passportStatus?.passportId"
      @claimed="onPassportUnlocked"
    />

    <BaseDrawer
      v-model="showRegisterInterest"
      title="Register Interest"
      :show-back-button="true"
      @close="showRegisterInterest = false"
    >
      <RegisterInterestContent
        :property-id="propertyId"
        :property-address="property?.addressLine1 || ''"
        @submit="showRegisterInterest = false"
      />
    </BaseDrawer>
    <BaseDrawer
      v-model="showShare"
      title="Share Property"
      :show-back-button="true"
      @close="showShare = false"
    >
      <ShareContent
        :property-title="property?.addressLine1 ?? ''"
        :property-address="`${property?.city ?? ''}, ${
          property?.postcode ?? ''
        }`"
        :property-price="estimatedPrice ? formatPrice(estimatedPrice) : ''"
        :property-image="propertyImages[0]"
      />
    </BaseDrawer>

    <!-- ════════════════════════════════════════════════════════════════
         PROPERTY BOTTOM SHEETS — prototype's data-source drawers.
         One Teleport-to-body overlay; the body slot swaps per activeSheet.
         ════════════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="activeSheet"
        class="pps-sheet-overlay"
        @click.self="closeSheet"
      >
        <div
          class="pps-sheet"
          :class="{ 'pps-sheet--tall': isTallSheet }"
          :style="sheetDragStyle"
          @touchstart.passive="onSheetTouchStart"
          @touchmove.passive="onSheetTouchMove"
          @touchend="onSheetTouchEnd"
          @touchcancel="onSheetTouchEnd"
        >
          <div class="pps-sheet-handle" />

          <!-- ── Property details (Type / EPC / UPRN + Download EPC) ─ -->
          <template v-if="activeSheet === 'property-details'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img src="/op-icons/property/type.jpeg" alt="" loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Property details</div>
                <div class="pps-ds-header-meta">
                  Ordnance Survey · EPC Register · HM Land Registry
                </div>
              </div>
            </div>

            <section class="pps-tr-head">
              <div class="pps-tr-lab">This home</div>
              <div class="pps-tr-big">
                {{ property?.propertyType || 'Property' }}
              </div>
              <p
                class="pps-tr-sub"
                v-if="property?.addressLine1 || property?.postcode"
              >
                <template v-if="property?.addressLine1"
                  >{{ property.addressLine1
                  }}<template v-if="property?.postcode"> · </template></template
                >
                <template v-if="property?.postcode"
                  ><b>{{ property.postcode }}</b></template
                >
              </p>
              <div class="pps-tr-eff" v-if="propertyDetailStats.length">
                <div v-for="s in propertyDetailStats" :key="s.label">
                  <b>{{ s.value }}</b
                  ><span>{{ s.label }}</span>
                </div>
              </div>
            </section>

            <div v-if="property?.epcRating" class="pps-tr-list">
              <div class="pps-tr-row pps-tr-row--static">
                <div class="pps-tr-strow">
                  <span class="pps-tr-stname">Energy rating</span>
                  <span class="pps-tr-stwalk">
                    <span
                      class="pps-epc-badge"
                      :style="{ background: epcDotColor }"
                      >{{ property.epcRating }}</span
                    >
                    <template v-if="property.epcScore">
                      {{ property.epcScore }}/100</template
                    >
                  </span>
                </div>
                <div
                  class="pps-tr-tags"
                  v-if="property.epcLmkKey || property.uprn"
                >
                  <button
                    type="button"
                    class="pps-pd-download"
                    :disabled="epcDownloading"
                    @click="downloadEpc"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {{ epcDownloading ? 'Opening…' : 'View EPC certificate' }}
                  </button>
                </div>
              </div>
              <div v-if="property?.uprn" class="pps-tr-row pps-tr-row--static">
                <div class="pps-tr-strow">
                  <span class="pps-tr-stname">UPRN</span>
                  <span class="pps-tr-stwalk pps-pd-row-value--mono">{{
                    property.uprn
                  }}</span>
                </div>
              </div>
              <div
                v-if="property?.tenure"
                class="pps-tr-row pps-tr-row--static"
              >
                <div class="pps-tr-strow">
                  <span class="pps-tr-stname">Tenure</span>
                  <span class="pps-tr-stwalk">{{ property.tenure }}</span>
                </div>
              </div>
              <div
                v-if="property?.titleNumber"
                class="pps-tr-row pps-tr-row--static"
              >
                <div class="pps-tr-strow">
                  <span class="pps-tr-stname">Title number</span>
                  <span class="pps-tr-stwalk pps-pd-row-value--mono">{{
                    property.titleNumber
                  }}</span>
                </div>
              </div>
            </div>

            <div
              v-if="
                !property?.propertyType &&
                !property?.epcRating &&
                !property?.uprn
              "
              class="pps-ds-placeholder"
            >
              <div class="pps-ds-placeholder-icon">
                <img
                  src="/op-icons/investment/house.png"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="pps-ds-placeholder-title">
                No property details on file yet
              </div>
              <div class="pps-ds-placeholder-sub">
                We'll backfill on the next enrichment pass — this usually
                happens once the property has been through EPC lookup and OS
                Places verification.
              </div>
            </div>

            <p class="pps-ds-info-note">
              <b>Cross-referenced.</b> Type, size and EPC come from the Energy
              Performance Certificate register; tenure and title number are from
              HM Land Registry. UPRN identifies the property uniquely across all
              official sources.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── History (Land Registry) ─────────────────────────── -->
          <template v-else-if="activeSheet === 'history'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/propertyHistory.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Price history</div>
                <div class="pps-ds-header-meta">
                  HM Land Registry · updated monthly
                </div>
              </div>
            </div>

            <template v-if="estimatedPrice || lastSale">
              <section class="pps-tr-head">
                <div class="pps-tr-lab">Current estimated value</div>
                <div class="pps-tr-big" v-if="estimatedPrice">
                  {{ formatPrice(estimatedPrice) }}
                </div>
                <div class="pps-tr-big" v-else-if="lastSale">
                  £{{ Number(lastSale.price).toLocaleString() }}
                </div>
                <p class="pps-tr-sub" v-if="estimatedPrice">
                  {{ priceSourceLabel
                  }}<template v-if="deltaSinceSold">
                    ·
                    <b
                      :style="{
                        color: deltaSinceSold.positive ? '#00817c' : '#c73e36',
                      }"
                    >
                      {{ deltaSinceSold.positive ? '+' : '−' }}£{{
                        Math.abs(deltaSinceSold.abs).toLocaleString()
                      }}
                      ({{ deltaSinceSold.positive ? '+' : '−'
                      }}{{ Math.abs(deltaSinceSold.pct).toFixed(0) }}%)
                    </b>
                    since last sold</template
                  >.
                </p>
                <p class="pps-tr-sub" v-else-if="lastSale">
                  Last sold {{ formatSoldDate(lastSale.date) }}.
                </p>
                <div
                  class="pps-tr-eff"
                  v-if="
                    priceHistoryCagr || lastSale || priceHistoryTimeline.length
                  "
                >
                  <div v-if="priceHistoryCagr">
                    <b
                      :style="{
                        color:
                          priceHistoryCagr.cagr >= 0 ? '#00817c' : '#c73e36',
                      }"
                    >
                      {{ priceHistoryCagr.cagr >= 0 ? '+' : ''
                      }}{{ priceHistoryCagr.cagr.toFixed(1) }}%
                    </b>
                    <span>Per year since {{ priceHistoryCagr.fromYear }}</span>
                  </div>
                  <div v-if="lastSale">
                    <b>£{{ Number(lastSale.price).toLocaleString() }}</b>
                    <span>Last sold {{ formatSoldDate(lastSale.date) }}</span>
                  </div>
                  <div v-if="priceHistoryTimeline.length">
                    <b>{{
                      priceHistoryTimeline.filter((t) => !t.isEstimate).length
                    }}</b>
                    <span
                      >Land Registry sale{{
                        priceHistoryTimeline.filter((t) => !t.isEstimate)
                          .length === 1
                          ? ''
                          : 's'
                      }}</span
                    >
                  </div>
                </div>
              </section>
            </template>

            <template v-if="priceHistoryTimeline.length > 0">
              <h2 class="pps-tr-sec">Price timeline</h2>
              <p class="pps-tr-secsub">
                Each recorded sale on this address, with the delta from the
                previous transaction.
              </p>
              <div class="pps-ds-timeline">
                <div
                  v-for="(t, i) in priceHistoryTimeline"
                  :key="(t.dateStr || 'est') + i"
                  class="pps-ds-tl-row"
                  :class="{ 'pps-ds-tl-row--est': t.isEstimate }"
                >
                  <div
                    class="pps-ds-tl-bullet"
                    :class="{ 'pps-ds-tl-bullet--est': t.isEstimate }"
                  />
                  <div class="pps-ds-tl-body">
                    <div class="pps-ds-tl-price">
                      £{{ Number(t.price).toLocaleString() }}
                      <span v-if="t.isEstimate" class="pps-ds-tl-est-pill"
                        >Estimate</span
                      >
                    </div>
                    <div class="pps-ds-tl-date">
                      <template v-if="t.dateObj">{{
                        formatSoldDate(t.dateStr)
                      }}</template>
                      <template v-else>Today</template>
                    </div>
                  </div>
                  <div
                    v-if="t.delta"
                    class="pps-ds-tl-delta"
                    :class="{
                      'pps-ds-tl-delta--up': t.delta.positive,
                      'pps-ds-tl-delta--down': !t.delta.positive,
                    }"
                  >
                    <span class="pps-ds-tl-arrow">{{
                      t.delta.positive ? '↑' : '↓'
                    }}</span>
                    {{ t.delta.positive ? '+' : '−' }}£{{
                      Math.abs(Math.round(t.delta.amount)).toLocaleString()
                    }}
                    <span class="pps-ds-tl-pct">
                      ({{ t.delta.positive ? '+' : '−'
                      }}{{ Math.abs(t.delta.pct).toFixed(0) }}%)
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <div
              v-else-if="!estimatedPrice && !lastSale"
              class="pps-ds-placeholder"
            >
              <div class="pps-ds-placeholder-icon">
                <img
                  src="/op-icons/passportview/titleDeedsAndPlan.png"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="pps-ds-placeholder-title">
                No sale records on file
              </div>
              <div class="pps-ds-placeholder-sub">
                HM Land Registry has no transaction records for this address yet
                — this can happen with new builds, exchange of parts, or
                unregistered land.
              </div>
            </div>

            <template v-if="nearbySales.length > 0">
              <h2 class="pps-tr-sec">Nearby sold prices</h2>
              <p class="pps-tr-secsub">
                Recent transactions on the same road or postcode — useful for a
                sanity check against the estimate above.
              </p>
              <div class="pps-tr-list">
                <div
                  v-for="s in nearbySales.slice(0, 5)"
                  :key="(s.address || s.date) + s.price"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">
                      {{ s.address || s.postcode || 'Nearby property' }}
                    </span>
                    <span class="pps-tr-stwalk">
                      £{{ Number(s.price ?? s.amount ?? 0).toLocaleString() }}
                    </span>
                  </div>
                  <div class="pps-tr-tags">
                    <span class="pps-tr-tag pps-tr-tag--muted">
                      {{ formatSoldDate(s.date || s.transferDate || '') }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <template
              v-if="property?.tenure || property?.titleNumber || property?.uprn"
            >
              <h2 class="pps-tr-sec">Title details</h2>
              <div class="pps-tr-list">
                <div
                  v-if="property?.tenure"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">Tenure</span>
                    <span class="pps-tr-stwalk">{{ property.tenure }}</span>
                  </div>
                </div>
                <div
                  v-if="property?.titleNumber"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">Title number</span>
                    <span class="pps-tr-stwalk pps-pd-row-value--mono">{{
                      property.titleNumber
                    }}</span>
                  </div>
                </div>
                <div
                  v-if="property?.uprn"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">UPRN</span>
                    <span class="pps-tr-stwalk pps-pd-row-value--mono">{{
                      property.uprn
                    }}</span>
                  </div>
                </div>
              </div>
            </template>

            <p class="pps-ds-info-note">
              <b>Updated monthly.</b> HM Land Registry publishes the previous
              month's transactions on the third working day of each month.
              Prices are the price paid at completion; sellers' asking prices
              are not recorded.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Street (live energy rank) ─────────────────────────── -->
          <template v-else-if="activeSheet === 'street'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/streetData.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Street data</div>
                <div class="pps-ds-header-meta">
                  {{ property?.postcode || 'Outcode' }} · aggregated from EPC
                  register
                </div>
              </div>
            </div>

            <template v-if="streetEnergyRank?.rank">
              <section class="pps-tr-head">
                <div class="pps-tr-lab">Energy rank on this street</div>
                <div class="pps-tr-big">
                  {{ streetEnergyRank.rank
                  }}<span style="font-size: 22px">{{
                    ordinalSuffix(streetEnergyRank.rank)
                  }}</span>
                  <span
                    style="font-size: 16px; font-weight: 700; color: #75757c"
                  >
                    of {{ streetEnergyRank.total }}
                  </span>
                </div>
                <p class="pps-tr-sub">
                  Ranked by <b>predicted annual running cost</b> across
                  {{ streetEnergyRank.total }} homes in this postcode.
                </p>
                <div class="pps-tr-eff">
                  <div v-if="streetEnergyRank.yourCost">
                    <b>£{{ streetEnergyRank.yourCost.toLocaleString() }}</b>
                    <span>Your annual cost</span>
                  </div>
                  <div v-if="streetEnergyRank.averageCost">
                    <b>£{{ streetEnergyRank.averageCost.toLocaleString() }}</b>
                    <span>Street average</span>
                  </div>
                  <div v-if="streetEnergyRank.bestCost">
                    <b>£{{ streetEnergyRank.bestCost.toLocaleString() }}</b>
                    <span>Best on street</span>
                  </div>
                </div>
              </section>
            </template>

            <template
              v-if="(streetEnergyRank?.epcDistribution?.length || 0) > 0"
            >
              <h2 class="pps-tr-sec">EPC distribution</h2>
              <p class="pps-tr-secsub">
                How many properties in this postcode fall into each EPC band.
              </p>
              <div class="pps-ds-bar-list">
                <div
                  v-for="bucket in streetEnergyRank!.epcDistribution"
                  :key="bucket.letter"
                  class="pps-ds-bar-item"
                  :class="{
                    'pps-ds-bar-item--active':
                      streetEnergyRank?.yourEpcRating === bucket.letter,
                  }"
                >
                  <span class="pps-ds-bar-label">{{ bucket.letter }}</span>
                  <div class="pps-ds-bar-track">
                    <div
                      class="pps-ds-bar-fill"
                      :style="{
                        width: epcBarMaxCount
                          ? (bucket.count / epcBarMaxCount) * 100 + '%'
                          : '0%',
                        background: epcBarColor(bucket.letter),
                      }"
                    />
                  </div>
                  <span class="pps-ds-bar-count">
                    {{ bucket.count
                    }}<template
                      v-if="streetEnergyRank?.yourEpcRating === bucket.letter"
                    >
                      ← you</template
                    >
                  </span>
                </div>
              </div>
            </template>

            <template
              v-if="streetEnergyRank?.avgEpcScore || property?.epcScore"
            >
              <h2 class="pps-tr-sec">Score comparison</h2>
              <div class="pps-tr-list">
                <div
                  v-if="property?.epcScore"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">Your EPC score</span>
                    <span class="pps-tr-stwalk"
                      >{{ property.epcScore }} / 100</span
                    >
                  </div>
                </div>
                <div
                  v-if="streetEnergyRank?.avgEpcScore"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">Street average score</span>
                    <span class="pps-tr-stwalk"
                      >{{ streetEnergyRank.avgEpcScore }} / 100</span
                    >
                  </div>
                </div>
              </div>
            </template>

            <div v-if="!streetEnergyRank?.rank" class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon"></div>
              <div class="pps-ds-placeholder-title">
                Not enough street data yet
              </div>
              <div class="pps-ds-placeholder-sub">
                We couldn't find enough neighbouring properties with EPC cost
                data in this postcode. Fills in as more homes on the street get
                enriched.
              </div>
            </div>

            <p class="pps-ds-info-note">
              <b>Aggregated from the EPC register.</b> Compares against every
              property in the same outcode that we already have EPC running-cost
              figures for. The cohort grows as more properties are enriched.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Schools (Ordnance Survey NGD via /enrichment) ─────── -->
          <template v-else-if="activeSheet === 'schools'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/schools.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Schools nearby</div>
                <div class="pps-ds-header-meta">
                  Ordnance Survey NGD · straight-line distances
                </div>
              </div>
            </div>

            <template v-if="enrichmentSchools.length > 0">
              <section class="pps-sh-summary">
                <div class="pps-sh-big">
                  {{ schoolStats.total }} school{{
                    schoolStats.total === 1 ? '' : 's'
                  }}
                </div>
                <p class="pps-sh-cap">
                  Within ~2&nbsp;km of this address<template
                    v-if="schoolStats.primariesNearby"
                  >
                    —
                    <em
                      >{{ schoolStats.primariesNearby }} primar{{
                        schoolStats.primariesNearby === 1 ? 'y' : 'ies'
                      }}
                      within 1&nbsp;km</em
                    ></template
                  >.
                </p>
                <div class="pps-sh-mini">
                  <div>
                    <b>{{ schoolStats.primariesNearby }}</b
                    ><span>Primaries within 1&nbsp;km</span>
                  </div>
                  <div>
                    <b>{{ schoolStats.secondariesNearby }}</b
                    ><span>Secondaries within 2&nbsp;km</span>
                  </div>
                  <div>
                    <b v-if="schoolStats.nearestPrimaryKm != null">
                      {{ schoolStats.nearestPrimaryKm.toFixed(1)
                      }}<small>&nbsp;km</small>
                    </b>
                    <b v-else>—</b>
                    <span>To nearest primary</span>
                  </div>
                </div>
              </section>

              <div class="pps-sh-seg" role="group" aria-label="School phase">
                <button
                  v-for="p in schoolPhases"
                  :key="p.key"
                  :aria-pressed="schoolPhaseFilter === p.key"
                  @click="schoolPhaseFilter = p.key"
                >
                  {{ p.label }}
                </button>
              </div>

              <div class="pps-sh-sortbar">
                <span
                  >Showing {{ filteredSchools.length }} school{{
                    filteredSchools.length === 1 ? '' : 's'
                  }}</span
                >
                <span class="pps-sh-sortnote">Sorted by distance</span>
              </div>

              <div class="pps-sh-list">
                <button
                  v-for="(s, i) in filteredSchools"
                  :key="s.name + s.distanceKm"
                  class="pps-sh-row"
                  :aria-expanded="schoolOpen === i"
                  @click="schoolOpen = schoolOpen === i ? -1 : i"
                >
                  <div class="pps-sh-r1">
                    <span class="pps-sh-name">{{ s.name }}</span>
                    <span class="pps-sh-dist"
                      >{{ walkMinutes(s.distanceKm) }} min</span
                    >
                  </div>
                  <div class="pps-sh-bar">
                    <i
                      :style="{
                        width: proximityPct(s.distanceKm) + '%',
                        background: schoolPhaseColor(s.phase),
                      }"
                    />
                  </div>
                  <div class="pps-sh-r2">
                    <span
                      v-if="s.phase && s.phase !== 'School'"
                      class="pps-sh-tag"
                      :class="'pps-sh-tag--' + schoolPhaseKey(s.phase)"
                      >{{ s.phase }}</span
                    >
                    <span class="pps-sh-walk"
                      >· {{ s.distanceKm.toFixed(1) }} km walk</span
                    >
                  </div>
                  <div v-if="schoolOpen === i" class="pps-sh-detail">
                    <dl class="pps-sh-dl">
                      <dt>Phase</dt>
                      <dd>{{ s.phase || 'School' }}</dd>
                      <dt>Distance</dt>
                      <dd>
                        {{ s.distanceKm.toFixed(1) }} km straight-line · ~{{
                          walkMinutes(s.distanceKm)
                        }}
                        min walk
                      </dd>
                      <dt v-if="s.operator || s.authority">Operator</dt>
                      <dd v-if="s.operator || s.authority">
                        {{ s.operator || s.authority }}
                      </dd>
                    </dl>
                    <p class="pps-sh-catch">
                      <b>Getting a place:</b> straight-line distance is a rough
                      guide only. Local authorities decide admissions on each
                      year's applications and cut-off distances can shift
                      materially year to year. Check the school's GOV.UK page
                      for its current admissions criteria and Ofsted rating.
                    </p>
                  </div>
                </button>
              </div>
            </template>

            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">
                <img
                  src="/op-icons/investment/graduationCap.png"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="pps-ds-placeholder-title">
                No schools data on file
              </div>
              <div class="pps-ds-placeholder-sub">
                We couldn't retrieve nearby schools for this address yet — it
                will be backfilled on the next enrichment pass.
              </div>
            </div>

            <p class="pps-ds-info-note">
              <b>Sample proximity only.</b> Walking times are estimated from
              straight-line distance at 12 minutes per kilometre. Being close to
              a school doesn't guarantee a place — admissions are decided by the
              local authority on the year's actual applications.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Transport (OpenStreetMap via Overpass) ───────────── -->
          <template v-else-if="activeSheet === 'transport'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/trainstations.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Transport</div>
                <div class="pps-ds-header-meta">
                  National Rail · Ordnance Survey
                </div>
              </div>
            </div>

            <template v-if="enrichmentTrains.length > 0">
              <section class="pps-tr-head">
                <div class="pps-tr-lab">Nearest station</div>
                <div class="pps-tr-big">
                  {{ enrichmentTrains[0].name }} ·
                  {{ walkMinutes(enrichmentTrains[0].distanceKm) }} min walk
                </div>
                <p class="pps-tr-sub" v-if="enrichmentTrains[0].operator">
                  Served by <b>{{ enrichmentTrains[0].operator }}</b
                  ><template v-if="enrichmentTrains.length > 1">
                    · {{ enrichmentTrains.length - 1 }} other station{{
                      enrichmentTrains.length === 2 ? '' : 's'
                    }}
                    within reach</template
                  >.
                </p>
                <p class="pps-tr-sub" v-else>
                  Straight-line distance
                  {{ enrichmentTrains[0].distanceKm.toFixed(1) }} km.
                </p>
              </section>

              <h2 class="pps-tr-sec">Stations</h2>
              <p class="pps-tr-secsub">
                Walking time from this address at ~12 minutes per km. Heritage
                and miniature railways are excluded.
              </p>
              <div class="pps-tr-list">
                <button
                  v-for="(t, i) in enrichmentTrains.slice(0, 6)"
                  :key="t.name + t.distanceKm"
                  class="pps-tr-row"
                  :aria-expanded="trainOpen === i"
                  @click="trainOpen = trainOpen === i ? -1 : i"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">{{ t.name }}</span>
                    <span class="pps-tr-stwalk"
                      >{{ walkMinutes(t.distanceKm) }} min walk</span
                    >
                  </div>
                  <div class="pps-tr-tags">
                    <span v-if="i === 0" class="pps-tr-tag pps-tr-tag--hub"
                      >Nearest</span
                    >
                    <span v-if="t.operator" class="pps-tr-tag">{{
                      t.operator
                    }}</span>
                    <span class="pps-tr-tag pps-tr-tag--muted"
                      >{{ t.distanceKm.toFixed(1) }} km</span
                    >
                  </div>
                  <div v-if="trainOpen === i" class="pps-tr-det">
                    <template v-if="i === 0">
                      Closest station.
                      <b>{{ walkMinutes(t.distanceKm) }} minutes' walk</b>
                      from this address at a normal pace.
                    </template>
                    <template v-else>
                      Alternative station about {{ t.distanceKm.toFixed(1) }} km
                      away (~{{ walkMinutes(t.distanceKm) }} min walk). Useful
                      if the nearest station is closed or if the service pattern
                      here suits your commute better.
                    </template>
                  </div>
                </button>
              </div>
            </template>

            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon"></div>
              <div class="pps-ds-placeholder-title">
                {{
                  transportLookupFailed
                    ? 'Rail information unavailable right now'
                    : 'No stations within reach'
                }}
              </div>
              <div class="pps-ds-placeholder-sub">
                <template v-if="transportLookupFailed">
                  We couldn't load nearby stations — please try again in a
                  moment.
                </template>
                <template v-else>
                  We couldn't find a National Rail or light-rail station within
                  4 km of this address.
                </template>
              </div>
            </div>

            <template v-if="enrichmentAirports.length > 0">
              <h2 class="pps-tr-sec">Airports</h2>
              <p class="pps-tr-secsub">
                Straight-line distance. Drive times depend on route and traffic.
              </p>
              <div class="pps-tr-list">
                <div
                  v-for="a in enrichmentAirports"
                  :key="a.name"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">
                      {{ a.name
                      }}<template v-if="a.iata"> ({{ a.iata }})</template></span
                    >
                    <span class="pps-tr-stwalk"
                      >{{ a.distanceKm.toFixed(0) }} km</span
                    >
                  </div>
                  <div class="pps-tr-tags">
                    <span v-if="a.isMajor" class="pps-tr-tag pps-tr-tag--hub"
                      >Major</span
                    >
                  </div>
                </div>
              </div>
            </template>

            <p class="pps-ds-info-note">
              <b>Not a timetable.</b> Walking times are typical
              door-to-platform, not straight-line distance. Services vary by
              time of day and are subject to timetable changes — check National
              Rail before relying on a specific connection.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Train stations (dedicated sheet) ──────────────────── -->
          <template v-else-if="activeSheet === 'trains'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/trainstations.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Train stations</div>
                <div class="pps-ds-header-meta">
                  National Rail · light-rail within ~4 km
                </div>
              </div>
            </div>

            <template v-if="enrichmentTrains.length > 0">
              <section class="pps-tr-head">
                <div class="pps-tr-lab">Nearest station</div>
                <div class="pps-tr-big">
                  {{ enrichmentTrains[0].name }} ·
                  {{ walkMinutes(enrichmentTrains[0].distanceKm) }} min walk
                </div>
                <p class="pps-tr-sub" v-if="enrichmentTrains[0].operator">
                  Served by <b>{{ enrichmentTrains[0].operator }}</b
                  ><template v-if="enrichmentTrains.length > 1">
                    · {{ enrichmentTrains.length - 1 }} more within
                    reach</template
                  >.
                </p>
                <p class="pps-tr-sub" v-else>
                  {{ enrichmentTrains.length }} station{{
                    enrichmentTrains.length === 1 ? '' : 's'
                  }}
                  within ~4&nbsp;km.
                </p>
              </section>

              <h2 class="pps-tr-sec">All stations</h2>
              <p class="pps-tr-secsub">
                Walking time at ~12 min/km. Heritage and miniature railways are
                excluded.
              </p>
              <div class="pps-tr-list">
                <button
                  v-for="(t, i) in enrichmentTrains"
                  :key="t.name + t.distanceKm"
                  class="pps-tr-row"
                  :aria-expanded="trainOpen === i"
                  @click="trainOpen = trainOpen === i ? -1 : i"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">{{ t.name }}</span>
                    <span class="pps-tr-stwalk"
                      >{{ walkMinutes(t.distanceKm) }} min walk</span
                    >
                  </div>
                  <div class="pps-tr-tags">
                    <span v-if="i === 0" class="pps-tr-tag pps-tr-tag--hub"
                      >Nearest</span
                    >
                    <span v-if="t.operator" class="pps-tr-tag">{{
                      t.operator
                    }}</span>
                    <span class="pps-tr-tag pps-tr-tag--muted"
                      >{{ t.distanceKm.toFixed(1) }} km</span
                    >
                  </div>
                  <div v-if="trainOpen === i" class="pps-tr-det">
                    About
                    <b>{{ walkMinutes(t.distanceKm) }} minutes' walk</b> from
                    this address at a normal pace ({{ t.distanceKm.toFixed(1) }}
                    km straight-line). Journey times and connections vary —
                    check National Rail for live timetables.
                  </div>
                </button>
              </div>
            </template>

            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon"></div>
              <div class="pps-ds-placeholder-title">
                {{
                  transportLookupFailed
                    ? 'Train information unavailable right now'
                    : 'No train stations within 4 km'
                }}
              </div>
              <div class="pps-ds-placeholder-sub">
                <template v-if="transportLookupFailed">
                  We couldn't load nearby stations — please try again in a
                  moment.
                </template>
                <template v-else>
                  No National Rail or light-rail station within 4 km of this
                  address.
                </template>
              </div>
            </div>

            <p class="pps-ds-info-note">
              <b>Straight-line distances.</b> Walking routes and drive-times
              will be longer. Timetables come from National Rail; live
              disruption is not reflected in this view.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Bus stops (dedicated sheet) ──────────────────────── -->
          <template v-else-if="activeSheet === 'buses'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/busStops.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Buses</div>
                <div class="pps-ds-header-meta">
                  NaPTAN stops · OpenStreetMap
                </div>
              </div>
            </div>

            <template v-if="enrichmentBuses.length > 0">
              <section class="pps-tr-head">
                <div class="pps-tr-lab">Best stop</div>
                <div class="pps-tr-big">
                  {{ enrichmentBuses[0].name || 'Bus stop' }}
                </div>
                <p class="pps-tr-sub">
                  <b
                    >{{ walkMinutes(enrichmentBuses[0].distanceKm) }} minutes'
                    walk</b
                  >
                  from this address<template v-if="enrichmentBuses[0].ref">
                    ({{ enrichmentBuses[0].ref }})</template
                  >.
                </p>
                <div class="pps-tr-eff">
                  <div>
                    <b>{{ busStats.total }}</b
                    ><span>Stops within reach</span>
                  </div>
                  <div>
                    <b>{{ busStats.within10 }}</b
                    ><span>Within 10&nbsp;min walk</span>
                  </div>
                  <div>
                    <b
                      >{{
                        walkMinutes(enrichmentBuses[0].distanceKm)
                      }}&nbsp;min</b
                    ><span>To the best stop</span>
                  </div>
                </div>
              </section>

              <div class="pps-tr-sortbar">
                <span
                  >{{ sortedBuses.length }} stop{{
                    sortedBuses.length === 1 ? '' : 's'
                  }}</span
                >
                <button
                  class="pps-tr-sortbtn"
                  @click="
                    busSortMode = busSortMode === 'walk' ? 'name' : 'walk'
                  "
                >
                  Sort: {{ busSortMode === 'walk' ? 'Walk time' : 'Name' }} ▾
                </button>
              </div>
              <p class="pps-tr-secsub">
                Both directions are shown together. Route numbers and
                frequencies vary by stop — check Traveline for live timetables.
              </p>

              <div class="pps-tr-list">
                <button
                  v-for="(b, i) in sortedBuses"
                  :key="(b.name || 'stop') + b.distanceKm"
                  class="pps-tr-row"
                  :aria-expanded="busOpen === i"
                  @click="busOpen = busOpen === i ? -1 : i"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">
                      {{ b.name || 'Bus stop'
                      }}<template v-if="b.ref"> ({{ b.ref }})</template>
                    </span>
                    <span class="pps-tr-stwalk"
                      >{{ walkMinutes(b.distanceKm) }} min walk</span
                    >
                  </div>
                  <div class="pps-tr-tags">
                    <span v-if="i === 0" class="pps-tr-tag pps-tr-tag--hub"
                      >Best stop</span
                    >
                    <span class="pps-tr-tag pps-tr-tag--muted"
                      >{{ b.distanceKm.toFixed(2) }} km</span
                    >
                  </div>
                  <div v-if="busOpen === i" class="pps-tr-det">
                    <template v-if="i === 0">
                      The closest stop.
                      <b>{{ walkMinutes(b.distanceKm) }} minutes' walk</b>. For
                      live route numbers and frequencies check
                      <a
                        href="https://traveline.info"
                        target="_blank"
                        rel="noopener"
                        >Traveline</a
                      >.
                    </template>
                    <template v-else>
                      About {{ b.distanceKm.toFixed(2) }} km from this address
                      (~{{ walkMinutes(b.distanceKm) }} min). Useful for the
                      opposite direction or when the nearest stop is closed for
                      works.
                    </template>
                  </div>
                </button>
              </div>
            </template>

            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon"></div>
              <div class="pps-ds-placeholder-title">
                {{
                  transportLookupFailed
                    ? 'Bus stop information unavailable right now'
                    : 'No bus stops within reach'
                }}
              </div>
              <div class="pps-ds-placeholder-sub">
                <template v-if="transportLookupFailed">
                  We couldn't load nearby stops — please try again in a moment.
                </template>
                <template v-else>
                  We couldn't find a bus stop within walking distance of this
                  address. Check Traveline for the latest coverage.
                </template>
              </div>
            </div>

            <p class="pps-ds-info-note">
              <b>Frequencies drop off-peak.</b> Bus stop locations come from
              OpenStreetMap; timetables come from the Bus Open Data Service (not
              yet wired). Weekday daytime frequencies drop substantially in the
              evening and on Sundays — worth checking if anyone would rely on
              the bus for a commute.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Airports (dedicated sheet) ───────────────────────── -->
          <template v-else-if="activeSheet === 'airports'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/airports.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Airports</div>
                <div class="pps-ds-header-meta">
                  Commercial airports · majors first
                </div>
              </div>
            </div>

            <template v-if="enrichmentAirports.length > 0">
              <section class="pps-tr-head">
                <div class="pps-tr-lab">Nearest airport</div>
                <div class="pps-tr-big">
                  {{ enrichmentAirports[0].name
                  }}<template v-if="enrichmentAirports[0].iata">
                    ({{ enrichmentAirports[0].iata }})</template
                  >
                </div>
                <p class="pps-tr-sub">
                  <b>{{ enrichmentAirports[0].distanceKm.toFixed(0) }} km</b>
                  away
                  <template v-if="enrichmentAirports.length > 1">
                    · {{ enrichmentAirports.length - 1 }} other{{
                      enrichmentAirports.length === 2 ? '' : 's'
                    }}
                    within reach</template
                  >.
                </p>
              </section>

              <h2 class="pps-tr-sec">All airports</h2>
              <p class="pps-tr-secsub">
                Straight-line distances. Drive times depend on route and
                traffic.
              </p>
              <div class="pps-tr-list">
                <div
                  v-for="a in enrichmentAirports"
                  :key="a.name"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">
                      {{ a.name
                      }}<template v-if="a.iata"> ({{ a.iata }})</template>
                    </span>
                    <span class="pps-tr-stwalk"
                      >{{ a.distanceKm.toFixed(0) }} km</span
                    >
                  </div>
                  <div class="pps-tr-tags" v-if="a.isMajor">
                    <span class="pps-tr-tag pps-tr-tag--hub">Major hub</span>
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon"></div>
              <div class="pps-ds-placeholder-title">
                {{
                  airportsLookupFailed
                    ? 'Airport information unavailable right now'
                    : 'No airports within 150 km'
                }}
              </div>
              <div class="pps-ds-placeholder-sub">
                <template v-if="airportsLookupFailed">
                  We couldn't load nearby airports — please try again in a
                  moment.
                </template>
                <template v-else>
                  Only commercial airports (IATA code, international flag, or
                  "Airport" in the name) are shown.
                </template>
              </div>
            </div>

            <p class="pps-ds-info-note">
              <b>Straight-line only.</b> Actual drive to the terminal is longer,
              and airport noise varies with wind direction and time of day —
              worth checking flight-path maps if the address is close to a
              runway approach.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Map (light Leaflet via existing pps-map-iframe) ───── -->
          <template v-else-if="activeSheet === 'map'">
            <div class="pps-ds-header" style="background: #e8f5e9">
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/locationAndMap.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Location &amp; Map</div>
                <div class="pps-ds-header-meta">
                  {{ property?.city || '' }}
                  <template v-if="property?.postcode">
                    · {{ property.postcode }}</template
                  >
                </div>
              </div>
            </div>
            <iframe
              v-if="property?.latitude && property?.longitude"
              class="pps-map-frame"
              :src="`https://www.openstreetmap.org/export/embed.html?bbox=${
                property.longitude - 0.005
              },${property.latitude - 0.0025},${property.longitude + 0.005},${
                property.latitude + 0.0025
              }&layer=mapnik&marker=${property.latitude},${property.longitude}`"
              loading="lazy"
            />
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">
                <img
                  src="/op-icons/misc/addressPin.png"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="pps-ds-placeholder-title">Map unavailable</div>
              <div class="pps-ds-placeholder-sub">
                No coordinates on file for this property.
              </div>
            </div>

            <template v-if="enrichmentParks.length > 0">
              <div class="pps-ds-section-title">Parks &amp; green space</div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="p in enrichmentParks"
                  :key="p.name + p.distanceKm"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k">🌳 {{ p.name }}</span>
                  <span class="pps-ds-v">{{ p.distanceKm.toFixed(2) }} km</span>
                </div>
              </div>
            </template>

            <template v-if="enrichmentAmenities.length > 0">
              <div class="pps-ds-section-title" style="margin-top: 18px">
                Local amenities
              </div>
              <template v-for="(group, cat) in amenitiesByCategory" :key="cat">
                <div
                  v-if="group.length > 0"
                  class="pps-ds-kv-list"
                  style="margin-bottom: 8px"
                >
                  <div
                    v-for="a in group.slice(0, 2)"
                    :key="a.name + a.distanceKm"
                    class="pps-ds-kv"
                  >
                    <span class="pps-ds-k">{{ a.icon }} {{ a.name }}</span>
                    <span class="pps-ds-v"
                      >{{ Number(a.distanceKm).toFixed(2) }} km ·
                      {{ a.category }}</span
                    >
                  </div>
                </div>
              </template>
            </template>

            <div class="pps-ds-attribution">
              Map: OpenStreetMap contributors
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Flood (real EA RoFRS data) ───────────────────────── -->
          <template v-else-if="activeSheet === 'flood'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/floodAndRisj.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">
                  Flood &amp; environmental risk
                </div>
                <div class="pps-ds-header-meta">
                  Environment Agency · BGS · UKHSA · DEFRA
                </div>
              </div>
            </div>

            <section
              class="pps-fl-head"
              :class="{ 'pps-fl-head--pending': !property?.floodRisk }"
            >
              <div class="pps-fl-lab">Overall flood risk</div>
              <div class="pps-fl-big">{{ floodOverall.label }}</div>
              <p class="pps-fl-sub" v-html="floodOverall.sub" />
            </section>
            <p class="pps-fl-stamp">{{ floodOverall.stamp }}</p>

            <h2 class="pps-fl-sec">Long-term flood risk</h2>
            <p class="pps-fl-secsub">
              The likelihood of flooding over the lifetime of ownership. This is
              what lenders and insurers use.
            </p>
            <div class="pps-fl-risks">
              <button
                v-for="(r, i) in floodRows"
                :key="r.n"
                class="pps-fl-risk"
                :aria-expanded="floodOpen === i && !!r.d"
                @click="onFloodRowClick(i, r.d)"
              >
                <div class="pps-fl-rtop">
                  <span class="pps-fl-rname">{{ r.n }}</span>
                  <span class="pps-fl-pill" :class="'pps-fl-pill--' + r.c">{{
                    r.s
                  }}</span>
                </div>
                <p v-if="r.m" class="pps-fl-rmean">{{ r.m }}</p>
                <div
                  v-if="r.d && floodOpen === i"
                  class="pps-fl-rdet"
                  v-html="r.d"
                />
              </button>
            </div>

            <div
              v-if="floodLiveWarnings.length"
              class="pps-fl-live"
              :class="{ 'pps-fl-live--open': floodLiveOpen }"
            >
              <h2 class="pps-fl-sec">Live status today</h2>
              <p class="pps-fl-secsub">
                Real-time Environment Agency warnings for nearby watercourses.
                This is a live snapshot — not a long-term risk measure.
              </p>
              <button
                class="pps-fl-livehead"
                @click="floodLiveOpen = !floodLiveOpen"
              >
                <span>{{ floodLiveWarnings.length }} monitored nearby</span>
                <small>{{ floodLiveOpen ? 'hide' : 'show' }}</small>
              </button>
              <div v-if="floodLiveOpen" class="pps-fl-livebody">
                <div
                  v-for="w in floodLiveWarnings"
                  :key="w.name"
                  class="pps-fl-wrow"
                >
                  <span>{{ w.name }}</span>
                  <span>{{ w.status || 'No warning' }}</span>
                </div>
              </div>
            </div>

            <div class="pps-fl-impact">
              <h3>What this means when you buy</h3>
              <ul>
                <li>
                  <b>Insurance.</b> Properties built before 2009 in a flood-risk
                  area are usually eligible for Flood Re, which caps premiums.
                  Newer builds are not.
                </li>
                <li>
                  <b>Mortgage.</b> Some lenders decline or require a specialist
                  survey where river-and-sea risk is High.
                </li>
                <li>
                  <b>Ask your conveyancer</b> for a full flood report and the
                  seller's answers on past flooding in the property information
                  form.
                </li>
              </ul>
            </div>

            <h2 class="pps-fl-sec">Other environmental checks</h2>
            <p class="pps-fl-secsub">
              Not yet included in your report. These open the official postcode
              lookup.
            </p>
            <div class="pps-fl-lookups">
              <a
                href="https://www.ukradon.org/information/ukmaps?utm_source=umovingu"
                target="_blank"
                rel="noopener"
                class="pps-fl-lookup"
              >
                <div>
                  <div class="pps-fl-lname">Radon</div>
                  <div class="pps-fl-lsub">UKHSA — not checked</div>
                </div>
                <span class="pps-fl-go">Look up →</span>
              </a>
              <a
                href="https://www.bgs.ac.uk/geology-projects/shrink-swell/"
                target="_blank"
                rel="noopener"
                class="pps-fl-lookup"
              >
                <div>
                  <div class="pps-fl-lname">
                    Subsidence &amp; clay shrink-swell
                  </div>
                  <div class="pps-fl-lsub">
                    British Geological Survey — not checked
                  </div>
                </div>
                <span class="pps-fl-go">Look up →</span>
              </a>
              <a
                href="https://www.bgs.ac.uk/datasets/geosure/"
                target="_blank"
                rel="noopener"
                class="pps-fl-lookup"
              >
                <div>
                  <div class="pps-fl-lname">Ground stability</div>
                  <div class="pps-fl-lsub">BGS GeoSure — not checked</div>
                </div>
                <span class="pps-fl-go">Look up →</span>
              </a>
              <a
                :href="`https://uk-air.defra.gov.uk/data/local-authority-statistics${
                  property?.city
                    ? `?la=${encodeURIComponent(property.city)}`
                    : ''
                }`"
                target="_blank"
                rel="noopener"
                class="pps-fl-lookup"
              >
                <div>
                  <div class="pps-fl-lname">Air quality</div>
                  <div class="pps-fl-lsub">DEFRA UK-AIR — not checked</div>
                </div>
                <span class="pps-fl-go">Look up →</span>
              </a>
            </div>

            <p class="pps-ds-info-note">
              <b>Not a substitute for a full flood report.</b> Environment
              Agency mapping gives a statistical likelihood for an area, not a
              prediction for an individual building — ground levels, defences
              and property-level protection all vary within a postcode.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Planning (placeholder) ────────────────────────────── -->
          <template v-else-if="activeSheet === 'planning'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/planning.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Planning history</div>
                <div class="pps-ds-header-meta">
                  planning.data.gov.uk<template v-if="property?.city">
                    · {{ property.city }}</template
                  >
                </div>
              </div>
            </div>

            <template
              v-if="
                planningConstraints.length > 0 ||
                planningApplications.length > 0
              "
            >
              <section class="pps-tr-head">
                <div class="pps-tr-lab">Planning summary</div>
                <div class="pps-tr-big">
                  {{ planningConstraints.length }} constraint{{
                    planningConstraints.length === 1 ? '' : 's'
                  }}
                  · {{ planningApplications.length }} application{{
                    planningApplications.length === 1 ? '' : 's'
                  }}
                </div>
                <p class="pps-tr-sub" v-if="planningConstraints.length > 0">
                  This address sits within
                  <b
                    >{{ planningConstraints.length }} planning designation{{
                      planningConstraints.length === 1 ? '' : 's'
                    }}</b
                  >. Applications linked to this UPRN may exclude older paper
                  records held only by the local authority portal.
                </p>
                <p class="pps-tr-sub" v-else>
                  No planning designations at this address.
                  {{ planningApplications.length }} application{{
                    planningApplications.length === 1 ? '' : 's'
                  }}
                  linked to this property's UPRN.
                </p>
              </section>

              <template v-if="planningConstraints.length > 0">
                <h2 class="pps-tr-sec">Planning constraints</h2>
                <p class="pps-tr-secsub">
                  Designations that can affect what you're allowed to alter or
                  extend.
                </p>
                <div class="pps-tr-list">
                  <div
                    v-for="(c, i) in planningConstraints"
                    :key="i"
                    class="pps-tr-row pps-tr-row--static"
                  >
                    <div class="pps-tr-strow">
                      <span class="pps-tr-stname"
                        >{{ constraintIcon(c.category) }} {{ c.type }}</span
                      >
                    </div>
                    <div class="pps-tr-tags">
                      <span class="pps-tr-tag">{{ c.name }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <template v-if="planningApplications.length > 0">
                <h2 class="pps-tr-sec">Planning applications</h2>
                <p class="pps-tr-secsub">
                  Matched to this property's UPRN. Tap to see decision detail.
                </p>
                <div class="pps-tr-list">
                  <button
                    v-for="(a, i) in planningApplications.slice(0, 10)"
                    :key="i"
                    class="pps-tr-row"
                    :aria-expanded="planningOpen === i"
                    @click="planningOpen = planningOpen === i ? -1 : i"
                  >
                    <div class="pps-tr-strow">
                      <span class="pps-tr-stname">
                        {{
                          (
                            a.applicationType ||
                            a.description ||
                            'Application'
                          ).slice(0, 60)
                        }}
                      </span>
                      <span class="pps-tr-stwalk">
                        {{
                          a.decisionDate
                            ? new Date(a.decisionDate).getFullYear()
                            : '—'
                        }}
                      </span>
                    </div>
                    <div class="pps-tr-tags">
                      <span
                        class="pps-tr-tag"
                        :class="{
                          'pps-tr-tag--hub': /granted|approved|permit/i.test(
                            a.decision || a.status || '',
                          ),
                          'pps-tr-tag--muted': /refuse|withdrawn/i.test(
                            a.decision || a.status || '',
                          ),
                        }"
                        >{{ a.decision || a.status || 'Pending' }}</span
                      >
                    </div>
                    <div v-if="planningOpen === i" class="pps-tr-det">
                      <template v-if="a.description">{{
                        a.description
                      }}</template>
                      <template v-else
                        >No further description on file.</template
                      >
                    </div>
                  </button>
                </div>
              </template>
            </template>

            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">
                <img
                  src="/op-icons/homescore/clipboard.png"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="pps-ds-placeholder-title">
                No planning constraints or applications on file
              </div>
              <div class="pps-ds-placeholder-sub">
                No conservation area, listed building, Article 4 direction,
                Green Belt, AONB or other planning designation in
                <a
                  href="https://www.planning.data.gov.uk"
                  target="_blank"
                  rel="noopener"
                  style="color: #00817c; font-weight: 700"
                  >planning.data.gov.uk</a
                >, and no applications linked to this UPRN.
              </div>
            </div>

            <p class="pps-ds-info-note">
              <b>Not exhaustive.</b> Constraints come from the national Planning
              Data platform. Applications are matched by UPRN — older paper
              records held only by the local authority may be missing.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Local Land Charges (HM Land Registry) ─────────────── -->
          <template v-else-if="activeSheet === 'llc'">
            <!-- LlcChargesCard renders its own header; don't duplicate. -->
            <LlcChargesCard v-if="propertyId" :property-id="propertyId" />
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Council tax (real band) ───────────────────────────── -->
          <template v-else-if="activeSheet === 'council'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/councilTax.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Council tax</div>
                <div class="pps-ds-header-meta">
                  {{ councilTaxSource || 'Valuation Office Agency'
                  }}<template v-if="councilTaxCouncilName">
                    · {{ councilTaxCouncilName }}</template
                  >
                </div>
              </div>
            </div>

            <template v-if="councilTaxAnnual">
              <section class="pps-tr-head">
                <div class="pps-tr-lab">Estimated annual bill</div>
                <div class="pps-tr-big">
                  £{{ councilTaxAnnual.toLocaleString() }} / yr
                </div>
                <p class="pps-tr-sub">
                  Band <b>{{ property.councilTaxBand }}</b> · 2024/25 average
                  <template v-if="property.city">
                    · {{ property.city }}</template
                  >.
                </p>
                <div class="pps-tr-eff">
                  <div>
                    <b>£{{ Math.round(councilTaxAnnual / 12) }}</b>
                    <span>Per month</span>
                  </div>
                  <div>
                    <b>Band {{ property.councilTaxBand }}</b>
                    <span>Assessment band</span>
                  </div>
                  <div v-if="councilTaxNearby.length">
                    <b>{{ councilTaxNearby.length }}</b>
                    <span>Nearby comparables</span>
                  </div>
                </div>
              </section>
            </template>

            <h2 class="pps-tr-sec">All bands · 2024/25 average</h2>
            <p class="pps-tr-secsub">
              How your band compares to the rest of the council-tax scale for
              this area.
            </p>
            <div class="pps-ds-band-list">
              <div
                v-for="b in councilTaxBands"
                :key="b.letter"
                class="pps-ds-band-row"
                :class="{ 'pps-ds-band-row--active': b.active }"
              >
                <span class="pps-ds-band-letter"
                  >{{ b.letter }}{{ b.active ? ' ←' : '' }}</span
                >
                <div class="pps-ds-band-bar-track">
                  <div
                    class="pps-ds-band-bar"
                    :style="{
                      width: b.pct + '%',
                      background: b.active ? '#00a19a' : undefined,
                    }"
                  />
                </div>
                <span class="pps-ds-band-amt"
                  >£{{ b.amount.toLocaleString() }}</span
                >
              </div>
            </div>

            <template v-if="councilTaxNearby.length > 0">
              <h2 class="pps-tr-sec">Nearby addresses</h2>
              <p class="pps-tr-secsub">
                What comparable properties in the same postcode are banded at.
              </p>
              <div class="pps-tr-list">
                <div
                  v-for="(n, i) in councilTaxNearby.slice(0, 6)"
                  :key="(n.address || 'n') + i"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">{{
                      n.address || n.postcode || 'Nearby property'
                    }}</span>
                    <span class="pps-tr-stwalk">
                      Band {{ n.band
                      }}<template v-if="n.annualEstimate">
                        · £{{ n.annualEstimate.toLocaleString() }}</template
                      >
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <p class="pps-ds-info-note">
              <b>An estimate.</b> Council tax is set by the local authority and
              can change each April. The 2024/25 average shown here is
              representative; check with
              {{ councilTaxCouncilName || 'your council' }} for the current
              year's rate.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Broadband (Ofcom Connected Nations) ──────────────── -->
          <template v-else-if="activeSheet === 'broadband'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/broadband.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Broadband &amp; mobile</div>
                <div class="pps-ds-header-meta">
                  Ofcom Connected Nations · postcode level
                </div>
              </div>
            </div>

            <template v-if="enrichmentBroadband?.available">
              <section class="pps-bb-head">
                <div class="pps-bb-lab">Fastest available download</div>
                <div class="pps-bb-big">
                  {{ broadbandBig.value
                  }}<small>&nbsp;{{ broadbandBig.unit }}</small>
                </div>
                <p class="pps-bb-sub" v-html="broadbandBig.sub" />
                <div class="pps-bb-scale-wrap">
                  <div
                    class="pps-bb-scale"
                    role="img"
                    aria-label="Speed relative to UK availability"
                  >
                    <span
                      class="pps-bb-marker"
                      :style="{ left: broadbandBig.pos + '%' }"
                    />
                  </div>
                  <div class="pps-bb-scale-labels">
                    <span>UNDER 30</span><span>SUPERFAST</span
                    ><span>ULTRAFAST</span><span>GIGABIT</span>
                  </div>
                </div>
              </section>
              <p class="pps-bb-stamp">
                Ofcom Connected Nations · latest available
              </p>

              <h2 class="pps-tr-sec">Networks at this postcode</h2>
              <p class="pps-tr-secsub">
                Maximum advertised download speed available from each network.
                Actual speed depends on the package you buy.
              </p>
              <div class="pps-bb-nets">
                <div
                  v-for="n in broadbandNetworks"
                  :key="n.tech"
                  class="pps-bb-net"
                >
                  <div class="pps-bb-nrow">
                    <span class="pps-bb-nname">
                      {{ n.name }}<em>{{ n.tech }}</em>
                    </span>
                    <span class="pps-bb-nspeed">{{
                      formatMbps(n.speedMbps)
                    }}</span>
                  </div>
                  <div class="pps-bb-nbar">
                    <i
                      :style="{
                        width: n.pct + '%',
                        background: n.fibre ? '#00A19A' : '#231D45',
                      }"
                    />
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon"></div>
              <div class="pps-ds-placeholder-title">
                {{ broadbandPlaceholder.title }}
              </div>
              <div class="pps-ds-placeholder-sub">
                {{ broadbandPlaceholder.sub }}
              </div>
              <a
                v-if="property?.postcode"
                :href="`https://checker.ofcom.org.uk/en-gb/broadband-coverage?Postcode=${encodeURIComponent(
                  property.postcode,
                )}`"
                target="_blank"
                rel="noopener"
                class="pps-ds-placeholder-link"
                >Check on Ofcom's site →</a
              >
            </div>

            <template v-if="enrichmentMobile?.available">
              <h2 class="pps-tr-sec">Mobile signal</h2>
              <p class="pps-tr-secsub">
                Predicted outdoor coverage by operator. Worth checking if anyone
                works from home or the property has thick walls.
              </p>
              <div class="pps-bb-mob">
                <div class="pps-bb-mob-h">Operator</div>
                <div class="pps-bb-mob-h pps-bb-mob-c">Signal</div>
                <template v-for="op in mobileOperatorRows" :key="op.label">
                  <div class="pps-bb-mob-op">{{ op.label }}</div>
                  <div class="pps-bb-mob-c">
                    <span class="pps-bb-dots">
                      <s
                        v-for="i in 3"
                        :key="i"
                        :class="mobileDotClass(op, i)"
                      />
                    </span>
                  </div>
                </template>
              </div>
            </template>

            <div v-if="broadbandImpact.length" class="pps-bb-impact">
              <h3>What this supports</h3>
              <ul>
                <li
                  v-for="(line, i) in broadbandImpact"
                  :key="i"
                  v-html="line"
                />
              </ul>
            </div>

            <div class="pps-tr-links">
              <a
                v-if="property?.postcode"
                :href="`https://checker.ofcom.org.uk/en-gb/broadband-coverage?Postcode=${encodeURIComponent(
                  property.postcode,
                )}`"
                target="_blank"
                rel="noopener"
                >Check on Ofcom →</a
              >
              <a
                href="https://www.uswitch.com/broadband/"
                target="_blank"
                rel="noopener"
              >
                Compare packages →
              </a>
            </div>

            <p class="pps-ds-info-note">
              <b>Modelled at postcode level.</b> Ofcom figures may differ from
              what an individual property gets — particularly on older copper
              lines where distance from the cabinet matters. Full fibre
              availability does not mean it is already installed at the
              property; installation may still be needed.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Stamp Duty Calculator (live) ──────────────────────── -->
          <template v-else-if="activeSheet === 'stamp-duty'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/stampDuty.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Stamp duty</div>
                <div class="pps-ds-header-meta">
                  England &amp; NI · rates from 1 April 2025
                </div>
              </div>
            </div>

            <section class="pps-sx-head" aria-live="polite">
              <div class="pps-sx-lab">Estimated stamp duty</div>
              <div class="pps-sx-big">
                £{{ stampDuty.total.toLocaleString() }}
              </div>
              <p class="pps-sx-sub">
                On a price of <b>£{{ (sdInput || 0).toLocaleString() }}</b>
              </p>
              <div class="pps-sx-eff">
                <div>
                  <b>{{ sdEffective.rate.toFixed(1) }}%</b
                  ><span>Effective rate</span>
                </div>
                <div>
                  <b>£{{ sdEffective.per100.toFixed(2) }}</b
                  ><span>Per £100 of price</span>
                </div>
                <div>
                  <b>{{ sdEffective.topBand }}%</b><span>Top band reached</span>
                </div>
              </div>
            </section>

            <div class="pps-sx-field">
              <label>Purchase price</label>
              <div class="pps-sx-inrow">
                <span class="pps-sx-cur">£</span>
                <input
                  :value="sdInput ? sdInput.toLocaleString('en-GB') : ''"
                  type="text"
                  inputmode="numeric"
                  @input="onSdInputText"
                />
              </div>
            </div>
            <input
              type="range"
              class="pps-sx-slider"
              min="50000"
              max="2000000"
              step="5000"
              :value="Math.min(2000000, Math.max(50000, sdInput || 50000))"
              @input="onSdSlider"
              aria-label="Purchase price slider"
            />

            <div class="pps-sx-seg" role="group" aria-label="Buyer type">
              <button
                :aria-pressed="sdType === 'standard'"
                @click="sdType = 'standard'"
              >
                Moving home
              </button>
              <button
                :aria-pressed="sdType === 'first'"
                @click="sdType = 'first'"
              >
                First-time
              </button>
              <button
                :aria-pressed="sdType === 'additional'"
                @click="sdType = 'additional'"
              >
                Additional
              </button>
            </div>

            <div class="pps-sx-switch">
              <div>
                <span>Non-UK resident</span>
                <small>Adds 2% to every band</small>
              </div>
              <button
                class="pps-sx-tog"
                :aria-pressed="sdNonRes"
                aria-label="Non-UK resident surcharge"
                @click="sdNonRes = !sdNonRes"
              />
            </div>

            <div v-if="sdAlert" class="pps-sx-alert">
              <b>{{ sdAlert.title }}</b> {{ sdAlert.body }}
            </div>

            <div class="pps-sx-stack-wrap" v-if="sdStack.length">
              <div class="pps-sx-stack-lab">How the price is taxed</div>
              <div class="pps-sx-stack">
                <i
                  v-for="s in sdStack"
                  :key="s.i"
                  :style="{ width: s.pct + '%', background: s.color }"
                  :title="`${Math.round(
                    s.rate * 100,
                  )}% on £${s.slice.toLocaleString()}`"
                />
              </div>
              <div class="pps-sx-stack-key">
                <span v-for="s in sdStack" :key="s.i" class="pps-sx-k">
                  <s :style="{ background: s.color }" />
                  {{ Math.round(s.rate * 100) }}% on {{ sdShort(s.slice) }}
                </span>
              </div>
            </div>

            <div
              v-for="(b, i) in stampDuty.bands"
              :key="i"
              class="pps-sx-band"
              :class="{ 'pps-sx-band--off': !b.amount }"
            >
              <div class="pps-sx-brow">
                <span class="pps-sx-brate"
                  >{{ Math.round(b.rate * 100) }}%</span
                >
                <span class="pps-sx-bamt"
                  >£{{ b.amount.toLocaleString() }}</span
                >
              </div>
              <div class="pps-sx-bbar">
                <i
                  :style="{
                    width:
                      sdMaxBand > 0 ? (b.amount / sdMaxBand) * 100 + '%' : '0%',
                    background: SD_SHADES[i % SD_SHADES.length],
                  }"
                />
              </div>
              <div class="pps-sx-bmeta">
                <span
                  >{{ sdShort(b.from) }} –
                  {{ b.to === Infinity ? 'above' : sdShort(b.to) }}</span
                >
                <span>{{
                  b.amount
                    ? '£' + (b.slice || 0).toLocaleString() + ' of your price'
                    : '—'
                }}</span>
              </div>
            </div>

            <div class="pps-sx-total">
              <span>Total due within 14 days of completion</span>
              <span>£{{ stampDuty.total.toLocaleString() }}</span>
            </div>

            <div class="pps-sx-links">
              <a
                href="https://www.gov.uk/stamp-duty-land-tax"
                target="_blank"
                rel="noopener"
                >Full rates on GOV.UK →</a
              >
              <a
                href="https://www.gov.uk/guidance/land-and-buildings-transaction-tax"
                target="_blank"
                rel="noopener"
                >Buying in Scotland or Wales? →</a
              >
            </div>

            <p class="pps-ds-info-note">
              <b>An estimate, not advice.</b> Assumes a freehold residential
              purchase with no linked transactions, shared ownership or multiple
              dwellings. Scotland uses LBTT and Wales uses LTT, both with
              different bands. Your solicitor files the return and confirms the
              final figure.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Listed buildings / heritage sites ────────────────────── -->
          <template v-else-if="activeSheet === 'listed'">
            <div
              class="pps-ds-header"
              style="background: var(--teal-wash, #e9f6f5)"
            >
              <span class="pps-ds-header-icon"
                ><img
                  src="/op-icons/property/listedBuildings.jpeg"
                  alt=""
                  loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Heritage sites nearby</div>
                <div class="pps-ds-header-meta">
                  Historic England · OpenStreetMap
                </div>
              </div>
            </div>

            <template v-if="enrichmentListedBuildings.length > 0">
              <section class="pps-tr-head">
                <div class="pps-tr-lab">Within ~800 m of this address</div>
                <div class="pps-tr-big">
                  {{ enrichmentListedBuildings.length }} heritage site{{
                    enrichmentListedBuildings.length === 1 ? '' : 's'
                  }}
                </div>
                <p class="pps-tr-sub">
                  Nearby listed buildings and scheduled monuments.
                  <b>Designations affect what alterations you can make</b> —
                  check with the local conservation officer before any exterior
                  work.
                </p>
              </section>

              <h2 class="pps-tr-sec">Nearby sites</h2>
              <div class="pps-tr-list">
                <div
                  v-for="(b, i) in enrichmentListedBuildings"
                  :key="(b.name || 'site') + i"
                  class="pps-tr-row pps-tr-row--static"
                >
                  <div class="pps-tr-strow">
                    <span class="pps-tr-stname">
                      {{ b.name || 'Unnamed site' }}</span
                    >
                    <span class="pps-tr-stwalk">{{
                      b.grade || 'Heritage'
                    }}</span>
                  </div>
                  <div class="pps-tr-tags" v-if="b.location">
                    <span class="pps-tr-tag pps-tr-tag--muted">{{
                      b.location
                    }}</span>
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">
                <img
                  src="/op-icons/investment/landmarks.png"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="pps-ds-placeholder-title">
                No heritage sites nearby
              </div>
              <div class="pps-ds-placeholder-sub">
                No listed buildings or scheduled monuments within ~800 m of this
                address.
              </div>
            </div>

            <p class="pps-ds-info-note">
              <b>Heritage designations matter.</b> Being near a listed building
              doesn't affect this property directly, but if it or its neighbours
              ARE listed, conservation rules apply — always check with the local
              conservation officer before any exterior work.
            </p>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Crime / safety (data.police.uk) ────────────────────── -->
          <template v-else-if="activeSheet === 'crime'">
            <div class="pps-ds-header" style="background: #eeedf5">
              <span class="pps-ds-header-icon"
                ><img src="/op-icons/property/crime.jpeg" alt="" loading="lazy"
              /></span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Crime in this area</div>
                <div class="pps-ds-header-meta">
                  data.police.uk · {{ crimeWindowLabel }}
                </div>
              </div>
            </div>

            <template v-if="enrichmentCrime?.totalLast12m != null">
              <!-- Radius segmented control. Numbers scale client-side
                   from the 1-mile fetch since the API only gives us
                   one radius per call; ½ / 2 mile are estimates,
                   flagged in the copy below. -->
              <div class="crime-seg" role="group" aria-label="Search radius">
                <button
                  v-for="opt in crimeRadiusOptions"
                  :key="opt.value"
                  type="button"
                  :aria-pressed="crimeRadius === opt.value"
                  @click="crimeRadius = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>

              <!-- Headline card: rate + verdict + benchmark scale -->
              <section class="crime-headline" aria-live="polite">
                <div class="crime-rate-row">
                  <span class="crime-rate">{{ crimeRatePer1000 }}</span>
                  <span class="crime-rate-unit"
                    >crimes per 1,000<br />residents / year</span
                  >
                </div>
                <p class="crime-verdict" v-html="crimeVerdictHtml"></p>
                <p class="crime-raw">
                  {{ crimeScaledTotal.toLocaleString() }} recorded crimes · est.
                  {{ crimeEstimatedPop.toLocaleString() }} residents
                </p>

                <div class="crime-scale-wrap">
                  <div
                    class="crime-scale"
                    role="img"
                    :aria-label="crimeScaleAriaLabel"
                  >
                    <span class="crime-tick" style="left: 25%" />
                    <span class="crime-tick" style="left: 50%" />
                    <span class="crime-tick" style="left: 75%" />
                    <span
                      class="crime-marker"
                      :style="{ left: crimeMarkerPct + '%' }"
                    />
                  </div>
                  <div class="crime-scale-labels">
                    <span>QUIETEST 25%</span>
                    <span>AVERAGE</span>
                    <span>BUSIEST 25%</span>
                  </div>
                  <p class="crime-scale-key">{{ crimeScaleKey }}</p>
                </div>
              </section>

              <!-- Trend card -->
              <section v-if="crimeSparkPath" class="crime-trend">
                <div class="crime-trend-top">
                  <span>Direction of travel</span>
                  <span
                    v-if="crimeTrendChipLabel"
                    class="crime-chip"
                    :class="{ up: enrichmentCrime.trendDirection === 'up' }"
                    >{{ crimeTrendChipLabel }}</span
                  >
                </div>
                <svg
                  class="crime-spark"
                  viewBox="0 0 300 52"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="crimeSparkFade"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stop-color="#00A19A"
                        stop-opacity=".22"
                      />
                      <stop
                        offset="100%"
                        stop-color="#00A19A"
                        stop-opacity="0"
                      />
                    </linearGradient>
                  </defs>
                  <path :d="crimeSparkFillPath" fill="url(#crimeSparkFade)" />
                  <path
                    :d="crimeSparkPath"
                    fill="none"
                    stroke="#00A19A"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <div class="crime-spark-x">
                  <span>{{ crimeSparkLabels.first }}</span>
                  <span>{{ crimeSparkLabels.mid }}</span>
                  <span>{{ crimeSparkLabels.last }}</span>
                </div>
              </section>

              <!-- Category breakdown with filter chips + expandable
                   rows. Group chips are purely client-side — every
                   category is mapped to property/personal/public via
                   crimeGroupFor(). -->
              <p class="crime-section-label">What was reported</p>
              <p class="crime-section-sub">
                Tap a category for what it usually means locally.
              </p>

              <div
                class="crime-seg"
                role="group"
                aria-label="Filter categories"
              >
                <button
                  v-for="opt in crimeGroupOptions"
                  :key="opt.value"
                  type="button"
                  :aria-pressed="crimeGroup === opt.value"
                  @click="onCrimeGroupClick(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>

              <div class="crime-cats">
                <button
                  v-for="(c, i) in crimeVisibleCats"
                  :key="c.category"
                  type="button"
                  class="crime-cat"
                  :aria-expanded="crimeOpenIdx === i"
                  @click="crimeOpenIdx = crimeOpenIdx === i ? -1 : i"
                >
                  <div class="crime-cat-top">
                    <span class="crime-cat-name">{{ c.label }}</span>
                    <span class="crime-cat-num">{{
                      scaledCount(c.count).toLocaleString()
                    }}</span>
                  </div>
                  <div class="crime-bar">
                    <i
                      :style="{
                        width: crimeBarPct(c.count) + '%',
                        background: crimeGroupColour(c.category),
                      }"
                    />
                  </div>
                  <p v-if="crimeOpenIdx === i" class="crime-cat-note">
                    {{ crimeNoteFor(c.category) }}
                  </p>
                </button>
              </div>

              <button
                v-if="crimeGroup === 'all' && crimeAllCats.length > 5"
                type="button"
                class="crime-more"
                @click="crimeExpandedAll = !crimeExpandedAll"
              >
                {{
                  crimeExpandedAll
                    ? 'Show top 5 only'
                    : `Show all ${crimeAllCats.length} categories`
                }}
              </button>

              <p class="crime-note">
                <b>Read this as indicative, not exact.</b> Police data is mapped
                to anonymised snap-points on nearby streets, not to individual
                addresses. A wider radius will pick up retail and night-time
                economy crime that has little bearing on a residential street.
              </p>
            </template>

            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">
                <img
                  src="/op-icons/calendar/shield.png"
                  alt=""
                  loading="lazy"
                />
              </div>
              <div class="pps-ds-placeholder-title">Crime data unavailable</div>
              <div class="pps-ds-placeholder-sub">
                Couldn't load data.police.uk stats for this location.
              </div>
            </div>
            <div class="pps-ds-attribution">
              Source: data.police.uk · open government licence
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Watch this (Register interest) ────────────────────── -->
          <template v-else-if="activeSheet === 'watch'">
            <div class="pps-sheet-icon">
              <img src="/op-icons/misc/bell.png" alt="" loading="lazy" />
            </div>
            <div class="pps-sheet-title">Watch this property</div>
            <div class="pps-sheet-sub">
              Save it to your list. We'll alert you if it comes to market, when
              the Passport publishes, or if anything changes.
            </div>

            <div class="pps-field-group">
              <div class="pps-field">
                <label class="pps-field-label">Your name</label>
                <input
                  v-model="watchName"
                  type="text"
                  class="pps-text-input"
                  placeholder="Alex Quinn"
                />
              </div>
              <div class="pps-field">
                <label class="pps-field-label">Email address</label>
                <input
                  v-model="watchEmail"
                  type="email"
                  class="pps-text-input"
                  placeholder="alex@email.com"
                />
              </div>
              <div class="pps-field">
                <label class="pps-field-label">Why are you watching?</label>
                <div class="pps-choice-row">
                  <button
                    v-for="r in [
                      'Potential buyer',
                      'I love the road',
                      'Investor',
                    ]"
                    :key="r"
                    type="button"
                    class="pps-choice"
                    :class="{ 'pps-choice--active': watchReason === r }"
                    @click="watchReason = r"
                  >
                    {{ r }}
                  </button>
                </div>
              </div>
              <div class="pps-field">
                <label class="pps-field-label">Alert me when…</label>
                <div class="pps-choice-row">
                  <button
                    v-for="t in [
                      'Listed for sale',
                      'Passport live',
                      'Any update',
                    ]"
                    :key="t"
                    type="button"
                    class="pps-choice"
                    :class="{ 'pps-choice--active': watchTrigger === t }"
                    @click="watchTrigger = t"
                  >
                    {{ t }}
                  </button>
                </div>
              </div>
            </div>

            <p v-if="watchError" class="pps-form-error">{{ watchError }}</p>

            <button
              type="button"
              class="pps-sheet-cta"
              :disabled="watchSubmitting"
              @click="submitWatch"
            >
              {{ watchSubmitting ? 'Saving…' : 'Save & watch →' }}
            </button>
            <button class="pps-sheet-cancel" @click="closeSheet">
              Not now
            </button>
          </template>

          <!-- ── Make Contact (Owner / Neighbour) ──────────────────── -->
          <template v-else-if="activeSheet === 'owner'">
            <div class="mkc-head">
              <img
                src="/op-icons/matched-buyers/chat-multi.png"
                alt=""
                class="mkc-head-ic"
                loading="lazy"
              />
              <div class="mkc-head-text">
                <div class="mkc-head-title">Make contact</div>
                <div class="mkc-head-sub">
                  Drop a note to the owner — whether you're a neighbour with a
                  question or a buyer making a quiet approach.
                </div>
              </div>
            </div>

            <div class="mkc-section">
              <div class="mkc-label">I AM A…</div>
              <div class="mkc-chip-row">
                <button
                  v-for="r in contactRoles"
                  :key="r.value"
                  type="button"
                  class="mkc-chip"
                  :class="{ 'mkc-chip--active': contactRole === r.value }"
                  @click="contactRole = r.value"
                >
                  <span class="mkc-chip-ic" aria-hidden="true">
                    <img
                      :src="`/op-icons/makeContact/${r.icon}.png`"
                      alt=""
                      loading="lazy"
                    />
                  </span>
                  {{ r.label }}
                </button>
              </div>
            </div>

            <div class="mkc-section">
              <div class="mkc-label">YOUR NAME</div>
              <div class="mkc-input-wrap">
                <span class="mkc-input-ic" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                  </svg>
                </span>
                <input
                  v-model="contactName"
                  type="text"
                  class="mkc-input"
                  placeholder="Alex Quinn"
                />
              </div>
            </div>

            <div class="mkc-section">
              <div class="mkc-label">YOUR MESSAGE</div>
              <div class="mkc-input-wrap mkc-input-wrap--textarea">
                <span class="mkc-input-ic" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.1"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M4 20h4l10-10-4-4L4 16v4z" />
                    <path d="M14 6l4 4" />
                  </svg>
                </span>
                <textarea
                  v-model="contactMessage"
                  class="mkc-input mkc-textarea"
                  :placeholder="contactPlaceholder"
                />
              </div>
            </div>

            <div class="mkc-section">
              <div class="mkc-label">HOW SHOULD THEY REPLY?</div>
              <div class="mkc-chip-row">
                <button
                  v-for="r in contactReplyChoices"
                  :key="r.value"
                  type="button"
                  class="mkc-chip"
                  :class="{ 'mkc-chip--active': contactReplyPref === r.value }"
                  @click="contactReplyPref = r.value"
                >
                  <span class="mkc-chip-ic" aria-hidden="true">
                    <img
                      :src="`/op-icons/makeContact/${r.icon}.png`"
                      alt=""
                      loading="lazy"
                    />
                  </span>
                  {{ r.label }}
                </button>
              </div>
            </div>

            <div class="mkc-privacy">
              <img
                src="/op-icons/onboarding/trustPadlock.png"
                alt=""
                class="mkc-privacy-ic"
                loading="lazy"
              />
              <div class="mkc-privacy-body">
                <div class="mkc-privacy-title">
                  Your details go only to the verified owner.
                </div>
                <div class="mkc-privacy-sub">
                  We never share with third parties or agents without your
                  consent.
                </div>
              </div>
            </div>

            <p v-if="contactError" class="pps-form-error">{{ contactError }}</p>

            <button
              type="button"
              class="mkc-send"
              :disabled="contactSubmitting"
              @click="submitOwnerContact"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.1"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {{ contactSubmitting ? 'Sending…' : 'Send message' }}
            </button>
            <button class="mkc-cancel" @click="closeSheet">Cancel</button>
          </template>

          <!-- ── Passport unlock (Published — £99) ─────────────────── -->
          <template v-else-if="activeSheet === 'passport'">
            <!-- Header branches by state: the badge text + dot colour reflect
                 whether the Passport is verified, being built, or absent. -->
            <div
              class="pps-passport-sheet-header"
              :class="{
                'pps-passport-sheet-header--unclaimed':
                  pageState === 'unclaimed',
                'pps-passport-sheet-header--progress': pageState === 'progress',
              }"
            >
              <div class="pps-passport-sheet-badge">
                <span
                  class="pps-passport-sheet-dot"
                  :style="
                    pageState === 'unclaimed'
                      ? { background: '#9c98ad' }
                      : pageState === 'progress'
                      ? { background: '#e6a23c' }
                      : undefined
                  "
                />
                <template v-if="pageState === 'unclaimed'"
                  >Unclaimed Property</template
                >
                <template v-else-if="pageState === 'progress'"
                  >Passport in progress</template
                >
                <template v-else>Verified Passport</template>
              </div>
              <div class="pps-passport-sheet-address">
                {{ property?.addressLine1 }}
              </div>
              <div class="pps-passport-sheet-meta">
                {{ property?.city }} · {{ property?.postcode }}
                <template v-if="property?.propertyType">
                  · {{ property.propertyType }}</template
                >
              </div>
            </div>

            <!-- ── PUBLISHED: existing £99 unlock flow ── -->
            <template v-if="pageState === 'published'">
              <div class="pps-passport-sheet-section-title">What's inside</div>
              <div class="pps-passport-sheet-items">
                <div
                  v-for="f in publishedFeatures"
                  :key="f.title"
                  class="pps-psi-row"
                >
                  <div class="pps-psi-icon">
                    <img
                      src="/op-icons/passportview/titleDeedsAndPlan.png"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div class="pps-psi-text">
                    <div class="pps-psi-name">{{ f.title }}</div>
                    <div class="pps-psi-meta">{{ f.sub }}</div>
                  </div>
                  <div class="pps-psi-check">✓</div>
                </div>
              </div>
              <div
                class="pps-passport-sheet-section-title"
                style="margin-top: 18px"
              >
                One-off access
              </div>
              <div class="pps-passport-price-breakdown">
                <div class="pps-ppb-row">
                  <span>Passport access</span><span>£79</span>
                </div>
                <div class="pps-ppb-row">
                  <span>HomeScore™ full report</span><span>£20</span>
                </div>
                <div class="pps-ppb-divider" />
                <div class="pps-ppb-row pps-ppb-total">
                  <span>Total today</span><span>£99</span>
                </div>
                <div class="pps-ppb-note">
                  Instant access · No subscription · Secure payment
                </div>
              </div>
              <button class="pps-sheet-cta" @click="onPassportUnlock">
                Unlock for £99 →
              </button>
            </template>

            <!-- ── PROGRESS: not yet published, owner is building it ── -->
            <template v-else-if="pageState === 'progress'">
              <div class="pps-passport-sheet-section-title">
                {{ progressPct }}% complete
              </div>
              <div class="pps-progress-bar-wrap" style="margin: 6px 0 14px">
                <div
                  class="pps-progress-bar-fill"
                  :style="{
                    width: progressPct + '%',
                    background: 'linear-gradient(90deg, #00a19a, #4DD4CE)',
                  }"
                />
              </div>
              <div class="pps-passport-sheet-items">
                <div
                  v-for="f in passportFeatures"
                  :key="f.title"
                  class="pps-psi-row"
                >
                  <div class="pps-psi-icon">{{ f.verified ? '✅' : '⏳' }}</div>
                  <div class="pps-psi-text">
                    <div class="pps-psi-name">{{ f.title }}</div>
                    <div class="pps-psi-meta">{{ f.sub }}</div>
                  </div>
                </div>
              </div>
              <button
                v-if="isPassportOwnerOrCollab"
                class="pps-sheet-cta"
                style="background: #00a19a"
                @click="onProgressCtaClick"
              >
                <img
                  src="/op-icons/homescore/clipboard.png"
                  alt=""
                  class="inline-ic"
                  loading="lazy"
                />
                Continue building your Passport →
              </button>
              <button
                v-else
                class="pps-sheet-cta"
                style="background: #00a19a"
                @click="onWatchClick"
              >
                <img
                  src="/op-icons/misc/bell.png"
                  alt=""
                  class="inline-ic"
                  loading="lazy"
                />
                Get notified when published →
              </button>
            </template>

            <!-- ── UNCLAIMED: no passport yet — pitch a Claim, not an Unlock ── -->
            <template v-else>
              <div class="pps-passport-sheet-section-title">
                This home hasn't claimed its Passport yet
              </div>
              <p class="pps-passport-sheet-empty">
                A Passport is the verified record of this property — TA6 / TA7 /
                TA10 forms, certificates, planning, alterations, services and
                history. It stays with the address for life. Anyone who owns
                this property can claim it.
              </p>
              <div
                class="pps-passport-sheet-section-title"
                style="margin-top: 18px"
              >
                What you'd build
              </div>
              <div class="pps-passport-sheet-items">
                <div
                  v-for="f in passportFeatures.slice(0, 5)"
                  :key="f.title"
                  class="pps-psi-row"
                >
                  <div class="pps-psi-icon">
                    <img
                      src="/op-icons/passportview/titleDeedsAndPlan.png"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div class="pps-psi-text">
                    <div class="pps-psi-name">{{ f.title }}</div>
                    <div class="pps-psi-meta">{{ f.sub }}</div>
                  </div>
                </div>
              </div>
              <button
                class="pps-sheet-cta"
                style="background: #231d45"
                @click="onClaimSheetCtaClick"
              >
                Claim this property — it's free →
              </button>
              <div
                style="
                  text-align: center;
                  font-size: 12px;
                  color: #9c98ad;
                  margin-top: 8px;
                "
              >
                Takes 2 minutes · No listing required · Free forever
              </div>
            </template>

            <button class="pps-sheet-cancel" @click="closeSheet">
              Not now
            </button>
          </template>

          <!-- ── Explain: Unclaimed ────────────────────────────────── -->
          <template v-else-if="activeSheet === 'explain-unclaimed'">
            <div class="pps-explain-hero pps-explain-hero--unclaimed">
              <div
                class="pps-explain-eyebrow"
                style="color: rgba(255, 255, 255, 0.55)"
              >
                Property Passport™
              </div>
              <div class="pps-explain-title">
                Your home's permanent record — not just for selling, for owning.
              </div>
              <div class="pps-explain-body">
                A Passport stays with this property for life. Build it now, keep
                it updated, and when you do decide to sell — the hard work is
                already done.
              </div>
            </div>
            <div class="pps-explain-callout pps-explain-callout--unclaimed">
              <div class="pps-explain-callout-eyebrow">
                The car you'd never buy blind
              </div>
              <div class="pps-explain-callout-body">
                You wouldn't buy a £15,000 car without an HPI check, its MOT
                history, and a service record. Yet every day people spend
                £300,000, £400,000, £500,000 on a home with almost no verified
                information at all. A Property Passport changes that —
                permanently.
              </div>
              <div class="pps-explain-callout-foot">
                🏡 The biggest financial investment anyone makes — and it's done
                almost completely blind
              </div>
            </div>

            <!-- Lifetime concept -->
            <div class="pps-explain-callout pps-explain-callout--lifetime">
              <div class="pps-explain-callout-eyebrow" style="color: #5b52a0">
                Stays with the property forever
              </div>
              <div class="pps-explain-callout-body">
                A Passport isn't a transaction tool. It's property
                infrastructure. Claim it now, add your gas certificate when it's
                renewed, upload planning permission when you do the extension.
                By the time you sell — in 5, 10, 20 years — everything is
                already there.
              </div>
            </div>

            <div class="pps-explain-stats">
              <div>
                <div class="pps-explain-stat-num">Free</div>
                <div class="pps-explain-stat-sub">
                  To claim &amp; build forever
                </div>
              </div>
              <div>
                <div class="pps-explain-stat-num">2 min</div>
                <div class="pps-explain-stat-sub">To claim ownership today</div>
              </div>
              <div>
                <div class="pps-explain-stat-num">150</div>
                <div class="pps-explain-stat-sub">
                  Days avg. conveyancing anxiety
                </div>
              </div>
              <div>
                <div class="pps-explain-stat-num">18</div>
                <div class="pps-explain-stat-sub">
                  Searches on this address this month
                </div>
              </div>
            </div>

            <!-- 4 steps -->
            <div class="pps-explain-section-label">Your four steps</div>
            <div class="pps-explain-steps">
              <div class="pps-explain-step pps-explain-step--active">
                <div class="pps-explain-step-num">1</div>
                <div class="pps-explain-step-title">Claim</div>
                <div class="pps-explain-step-sub">
                  Confirm ownership. 2 min. Free.
                </div>
              </div>
              <div class="pps-explain-step-line" />
              <div class="pps-explain-step">
                <div class="pps-explain-step-num">2</div>
                <div class="pps-explain-step-title">Verify</div>
                <div class="pps-explain-step-sub">
                  Upload docs. We verify against official sources.
                </div>
              </div>
              <div class="pps-explain-step-line" />
              <div class="pps-explain-step">
                <div class="pps-explain-step-num">3</div>
                <div class="pps-explain-step-title">Score</div>
                <div class="pps-explain-step-sub">
                  Get your verified HomeScore.
                </div>
              </div>
              <div class="pps-explain-step-line" />
              <div class="pps-explain-step">
                <div class="pps-explain-step-num">4</div>
                <div class="pps-explain-step-title">Publish</div>
                <div class="pps-explain-step-sub">
                  Go live whenever you're ready.
                </div>
              </div>
            </div>

            <div class="pps-explain-footer">
              The way people buy homes is changing — and we're building that
              future with government.
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Got it</button>
          </template>

          <!-- ── Explain: In Progress ──────────────────────────────── -->
          <template v-else-if="activeSheet === 'explain-progress'">
            <div class="pps-explain-hero pps-explain-hero--progress">
              <div class="pps-explain-eyebrow">
                Property Passport™ · In Progress
              </div>
              <div class="pps-explain-title">
                This owner is building something that removes 150 days of
                uncertainty.
              </div>
              <div class="pps-explain-body">
                A permanent verified record for this property. When it
                publishes, you get instant access to everything — before you
                even make an offer.
              </div>
            </div>
            <div class="pps-explain-callout pps-explain-callout--progress">
              <div class="pps-explain-callout-eyebrow" style="color: #00a19a">
                Why this matters
              </div>
              <div class="pps-explain-callout-body">
                People fall in love with a house in 20 minutes, then spend an
                average of 150 days hanging off a cliff — chasing solicitors,
                waiting on documents that already exist somewhere. This Passport
                collects all of that upfront, so by the time you make an offer,
                the hard work is already done.
              </div>
              <div class="pps-explain-callout-foot">
                <img
                  src="/op-icons/misc/bell.png"
                  alt=""
                  class="inline-ic"
                  loading="lazy"
                />
                Get notified the moment it publishes — be first in the door
              </div>
            </div>

            <!-- Progress bar -->
            <div class="pps-explain-section-label">Build progress</div>
            <div class="pps-explain-progress-row">
              <span class="pps-explain-progress-pct"
                >{{ passportProgressPct }}% complete</span
              >
              <span class="pps-explain-progress-frac"
                >{{ passportProgressVerified }} of
                {{ passportProgressTotal }} verified</span
              >
            </div>
            <div class="pps-explain-progress-track">
              <div
                class="pps-explain-progress-fill"
                :style="{ width: passportProgressPct + '%' }"
              />
            </div>

            <!-- Already verified -->
            <div
              v-if="passportVerifiedItems.length > 0"
              class="pps-explain-section-label"
              style="margin-top: 16px"
            >
              Already verified
            </div>
            <div
              v-if="passportVerifiedItems.length > 0"
              class="pps-explain-checklist"
            >
              <div
                v-for="item in passportVerifiedItems"
                :key="item.title"
                class="pps-explain-checklist-item"
              >
                <div
                  class="pps-explain-checklist-icon"
                  :style="{ background: item.bg }"
                >
                  <img
                    v-if="item.icon && item.icon.startsWith('/')"
                    :src="item.icon"
                    alt=""
                    loading="lazy"
                  />
                  <template v-else>{{ item.icon }}</template>
                </div>
                <div class="pps-explain-checklist-text">
                  <div class="pps-explain-checklist-title">
                    {{ item.title }}
                  </div>
                  <div class="pps-explain-checklist-sub">{{ item.sub }}</div>
                </div>
                <div class="pps-explain-checklist-tick">✓</div>
              </div>
            </div>

            <div class="pps-explain-footer">
              The way people buy homes is changing — and we're building that
              future with government.
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Got it</button>
          </template>

          <!-- ── Explain: Published ────────────────────────────────── -->
          <template v-else-if="activeSheet === 'explain-published'">
            <div class="pps-explain-hero pps-explain-hero--published">
              <div class="pps-explain-eyebrow">Property Passport™</div>
              <div class="pps-explain-title">
                The biggest purchase of your life — and you're doing it blind.
              </div>
              <div class="pps-explain-body">
                You wouldn't buy a £15,000 car without its service history. This
                is the verified record that should have always existed for every
                home.
              </div>
            </div>
            <div class="pps-explain-callout pps-explain-callout--progress">
              <div class="pps-explain-callout-eyebrow" style="color: #00a19a">
                Why this exists
              </div>
              <div class="pps-explain-callout-body">
                Conveyancing takes 150 days on average. Nearly half that time is
                spent chasing documents that already exist somewhere — just not
                in one place. The Property Passport ends that. Everything
                verified by the owner, ready before solicitors are even
                instructed.
              </div>
              <div class="pps-explain-callout-foot">
                ⏱ Average sale time cut by 6–8 weeks with upfront disclosure
              </div>
            </div>

            <!-- Search reuse insight -->
            <div class="pps-explain-callout pps-explain-callout--reuse">
              <div class="pps-explain-callout-eyebrow" style="color: #b07a1c">
                Not just for buying this home
              </div>
              <div class="pps-explain-callout-body">
                The environmental data, flood risk, and planning history in this
                Passport applies to the whole street. Solicitors charge £300–500
                for searches that get thrown away after every transaction. This
                data stays — and you can use it even if you're interested in a
                neighbouring property.
              </div>
            </div>

            <div class="pps-explain-stats">
              <div>
                <div class="pps-explain-stat-num">150</div>
                <div class="pps-explain-stat-sub">
                  Avg. days in conveyancing
                </div>
              </div>
              <div>
                <div class="pps-explain-stat-num">£99</div>
                <div class="pps-explain-stat-sub">
                  One-off · no subscription
                </div>
              </div>
              <div>
                <div class="pps-explain-stat-num">23×</div>
                <div class="pps-explain-stat-sub">
                  Same search bought per street
                </div>
              </div>
              <div>
                <div class="pps-explain-stat-num">100%</div>
                <div class="pps-explain-stat-sub">
                  Owner-verified · HMLR backed
                </div>
              </div>
            </div>

            <!-- What's inside -->
            <div class="pps-explain-section-label">What's inside</div>
            <div class="pps-explain-checklist">
              <div class="pps-explain-checklist-item">
                <div
                  class="pps-explain-checklist-icon"
                  style="background: #fff3e0"
                >
                  <img
                    src="/op-icons/homescore/clipboard.png"
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div class="pps-explain-checklist-text">
                  <div class="pps-explain-checklist-title">
                    TA6, TA7 &amp; TA10 forms
                  </div>
                  <div class="pps-explain-checklist-sub">
                    All conveyancing questions answered upfront
                  </div>
                </div>
                <div class="pps-explain-checklist-tick">✓</div>
              </div>
              <div class="pps-explain-checklist-item">
                <div
                  class="pps-explain-checklist-icon"
                  style="background: #e6f7f6"
                >
                  <img
                    src="/op-icons/investment/landmarks.png"
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div class="pps-explain-checklist-text">
                  <div class="pps-explain-checklist-title">
                    Land Registry Title &amp; Plan
                  </div>
                  <div class="pps-explain-checklist-sub">
                    Verified ownership · boundary map
                  </div>
                </div>
                <div class="pps-explain-checklist-tick">✓</div>
              </div>
              <div class="pps-explain-checklist-item">
                <div
                  class="pps-explain-checklist-icon"
                  style="background: #e6f7f6"
                >
                  <img src="/op-icons/misc/wrench.png" alt="" loading="lazy" />
                </div>
                <div class="pps-explain-checklist-text">
                  <div class="pps-explain-checklist-title">
                    Gas, Electrical &amp; EPC
                  </div>
                  <div class="pps-explain-checklist-sub">
                    All certificates verified
                  </div>
                </div>
                <div class="pps-explain-checklist-tick">✓</div>
              </div>
              <div class="pps-explain-checklist-item">
                <div
                  class="pps-explain-checklist-icon"
                  style="background: #f3e5f5"
                >
                  <img
                    src="/op-icons/calendar/calendar.png"
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div class="pps-explain-checklist-text">
                  <div class="pps-explain-checklist-title">
                    Planning History
                  </div>
                  <div class="pps-explain-checklist-sub">
                    Extensions, permissions, works
                  </div>
                </div>
                <div class="pps-explain-checklist-tick">✓</div>
              </div>
            </div>

            <div class="pps-explain-footer">
              The way people buy homes is changing — and we're building that
              future with government.
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Got it</button>
          </template>
        </div>
      </div>
    </Teleport>

    <!-- ── Toast (restored — was orphaned import, never mounted) ────────── -->
    <Toast
      :is-visible="toastState.isVisible"
      :message="toastState.message"
      :icon="toastState.icon"
      :icon-emoji="toastState.iconEmoji"
      :duration="toastState.duration"
      @close="hideToast"
    />

    <!-- ── Unpublished-passport modal (restored) ─────────────────────────
         Fires when a buyer taps an in-progress passport — gives them a clear
         "we'll notify you" path instead of the silent no-op the rebuild had. -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showUnpublishedModal"
          class="unpub-overlay"
          @click.self="showUnpublishedModal = false"
        >
          <div class="unpub-modal">
            <button class="unpub-close" @click="showUnpublishedModal = false">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div class="unpub-icon">
              <img
                src="/op-icons/buyer-profile-build/idCard.png"
                alt=""
                loading="lazy"
              />
            </div>
            <div class="unpub-eyebrow">
              <span style="color: #00a19a">●</span> Property Passport — In
              Progress
            </div>
            <h3 class="unpub-title">This home's Passport is being built</h3>
            <p class="unpub-body">
              You're seeing public EPC data for now — we'll alert you when the
              full record is published.
            </p>
            <button class="unpub-cta" @click="openRegisterInterest">
              <img
                src="/op-icons/misc/bell.png"
                alt=""
                class="inline-ic"
                loading="lazy"
              />
              Notify me when it's published
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <WatchPropertyDrawer
      :open="watchDrawerOpen"
      :address-label="property?.addressLine1 || ''"
      :submitting="watchSubmitting"
      @close="watchDrawerOpen = false"
      @submit="onWatchDrawerSubmit"
    />

    <WatchConfirmedDrawer
      :open="watchConfirmedOpen"
      :address-label="property?.addressLine1 || ''"
      :prefs="watchConfirmedPrefs"
      @close="watchConfirmedOpen = false"
      @create-passport="onWatchConfirmedCreatePassport"
    />

    <PassportEcosystemDrawer
      :open="passportEcosystemOpen"
      @close="passportEcosystemOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import RegisterInterestContent from '~/components/property/RegisterInterestContent.vue'
// Owner-claim runs through /claim/[id] (KYC + Land Registry + passport
// issue). ClaimPassportDrawer below is ONLY for the buyer-unlock (£99
// Stripe) path on a published Passport.
import ClaimPassportDrawer from '~/components/property/ClaimPassportDrawer.vue'
import LlcChargesCard from '~/components/property/LlcChargesCard.vue'
import PassportClaimBox from '~/components/property/PassportClaimBox.vue'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import ImageSlider from '~/components/ui/ImageSlider.vue'
import Toast from '~/components/ui/Toast.vue'
import ShareContent from '~/components/property/ShareContent.vue'
import WatchPropertyDrawer from '~/components/property/WatchPropertyDrawer.vue'
import WatchConfirmedDrawer from '~/components/property/WatchConfirmedDrawer.vue'
import PassportEcosystemDrawer from '~/components/property/PassportEcosystemDrawer.vue'
import BottomNav from '~/components/core/BottomNav.vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import NotificationBell from '~/components/ui/NotificationBell.vue'
import UserAvatar from '~/components/ui/UserAvatar.vue'
import { useAppToast } from '~/composables/useCustomToast'
import { usePropertySearch } from '~/composables/usePropertySearch'
import { usePassportClaim } from '~/composables/usePassportClaim'
import { usePropertyActions } from '~/composables/usePropertyActions'
import { useProfile } from '~/composables/useProfile'
import { toTitleCase } from '~/utils/form-helpres'
import {
  normalizeUploadUrl,
  normalizeUploadUrls,
} from '~/utils/normalizeUploadUrl'

// Deliberately no page-level auth middleware — property details (including
// HomeScore) must be browsable by guests. Every write action reachable from
// here (Watch This Property, Ask a Question, Claim Passport) already gates
// itself on click and round-trips through /onboarding/signin via
// redirectAfterLogin + a resume query param (?watched=1, ?save=1,
// ?openSheet=owner, ?claim=1/?unlock=1 — see onMounted below), so gating
// the whole page would only block guests from viewing, not from acting.

const route = useRoute()
const router = useRouter()
const propertyId = route.params.id as string

const { getPropertyDetails, formatPrice } = usePropertySearch()
const { getPassportStatus } = usePassportClaim()
const { toastState, showToast, hideToast } = useAppToast()
const { saved, toggleSave, fetchActions } = usePropertyActions()
const { profile, fetchProfile } = useProfile()
const { recordExplored } = useRecentlyExplored()

const config = useRuntimeConfig()
const property = ref<any>(null)
const passportStatus = ref<any>(null)
// True only once the passport-status fetch has genuinely failed (after
// retrying) — distinct from passportStatus being null because it just
// hasn't loaded yet. Gates the floating claim card so a fetch failure
// renders as "we don't know yet" rather than a confident (and possibly
// wrong) "unclaimed" that could prompt an existing owner to pay again.
const passportStatusUnknown = ref(false)
const enrichment = ref<any>(null)
const pageLoading = ref(true)
const loadError = ref('')
const showRegisterInterest = ref(false)
const showShare = ref(false)

// EPC certificate — open the official gov.uk cert page in a new tab.
// The old opendatacommunities.org/files/{lmk} endpoint was retired
// with the EPC API migration, and the new API doesn't expose a PDF
// download. The find-energy-certificate.service.gov.uk consumer
// page serves the cert HTML with a "Print or download" flow —
// same URL every UK property portal uses.
//
// Fast path: property already has epcLmkKey persisted → link
// straight to it.
// Slow path: no lmk on file → hit the backend once to resolve it
// via UPRN, then open the resulting URL.
const epcDownloading = ref(false)
async function downloadEpc() {
  if (epcDownloading.value) return
  epcDownloading.value = true
  try {
    const openCert = (lmk: string) => {
      const url = `https://find-energy-certificate.service.gov.uk/energy-certificate/${lmk}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    const stored = property.value?.epcLmkKey
    if (stored) {
      openCert(stored)
      return
    }
    // Fall back to backend UPRN lookup for older cache rows that
    // don't have the lmk-key persisted.
    const apiBase = config.public.apiBase as string
    const res = await fetch(
      `${apiBase}/property/${propertyId}/epc-download-info`,
    ).catch(() => null)
    const info = res && res.ok ? await res.json().catch(() => null) : null
    if (info?.lmkKey) {
      openCert(info.lmkKey)
      return
    }
    showToast({
      message: 'No EPC certificate is on file for this property.',
      duration: 3000,
    })
  } catch {
    showToast({
      message: 'Could not open the EPC certificate. Please try again.',
      duration: 3000,
    })
  } finally {
    epcDownloading.value = false
  }
}

// Owner-claim is delegated to the global /claim/[id] page, which runs:
//   1. KYC verification (skipped if the user is already approved)
//   2. HM Land Registry ownership check (mandatory per property)
//   3. Passport issuance + redirect to /passportview/{id}
// Every "Claim" entry point on this page just pushes to that route — no
// in-page drawer, no direct POST /passport/create.
const goToClaim = () => router.push(`/claim/${propertyId}`)
// Headless PassportClaimBox drawer — opened by the "Claim this property"
// CTA so guests see the same four-step explainer + auth gate the homescore
// page uses. Authed users hit "Claim it" and goToClaim() routes them to
// the existing /claim/[id] KYC + HMLR flow.
const claimExplainerSheet = ref<
  'unclaimed' | 'noPublicPassport' | 'progress' | 'published' | null
>(null)
const showUnpublishedModal = ref(false)
type LocTab =
  | 'map'
  | 'street'
  | 'schools'
  | 'trains'
  | 'buses'
  | 'airports'
  | 'sales'
  | 'coverage'
  | 'flood'
  | 'council'
  | 'planning'
const activeLocTab = ref<LocTab>('map')
const salesTab = ref<'property' | 'nearby'>('property')
const coverageTab = ref<'broadband' | 'mobile' | 'tv'>('broadband')
const ctTab = ref<'property' | 'bands' | 'nearby'>('property')

const homeScore = ref<{
  total: number
  rating: string
  heating: number
  structure: number
  efficiency: number
  electrics: number
  plumbing: number
} | null>(null)
const homeScoreIsAuto = ref(false)

// ── Display helpers ────────────────────────────────────────────────────────────
const displayAddress = computed(
  () =>
    toTitleCase(property.value?.addressLine1) ||
    property.value?.addressLine1 ||
    '',
)
const displayArea = computed(
  () => toTitleCase(property.value?.addressLine2) || '',
)
const displayCity = computed(
  () =>
    toTitleCase(property.value?.city) ||
    toTitleCase(property.value?.county) ||
    '',
)

const displayEstimatedPrice = computed(
  () =>
    enrichment.value?.landRegistryEstimate ??
    property.value?.estimatedPrice ??
    null,
)
const estimatedPriceSource = computed(() =>
  enrichment.value?.landRegistryEstimate
    ? enrichment.value.landRegistrySource ?? 'Land Registry, HPI adjusted'
    : 'Estimated',
)

// Merge DB property with live EPC data
const prop = computed(() => {
  if (!property.value) return null
  const epc = enrichment.value?.epcCert
  if (!epc) return property.value
  return {
    ...property.value,
    epcRating: property.value.epcRating ?? epc.epcRating ?? null,
    epcScore: property.value.epcScore ?? epc.epcScore ?? null,
    floorAreaSqm: property.value.floorAreaSqm ?? epc.floorAreaSqm ?? null,
    sqft: property.value.sqft ?? epc.sqft ?? null,
    bedrooms: property.value.bedrooms ?? epc.bedrooms ?? null,
    tenure: property.value.tenure ?? epc.tenure ?? null,
    yearBuilt: property.value.yearBuilt ?? epc.yearBuilt ?? null,
    heatingType: property.value.heatingType ?? epc.heatingType ?? null,
    councilTaxBand: property.value.councilTaxBand ?? epc.councilTaxBand ?? null,
  }
})

// ── HomeScore gauge ──────────────────────────────────────────────────────────
const gaugeScore = computed(
  () => homeScore.value?.total ?? prop.value?.epcScore ?? null,
)

const gaugeColor = computed(() => {
  const s = gaugeScore.value ?? 0
  if (s >= 80) return '#008a84'
  if (s >= 60) return '#00a19a'
  if (s >= 40) return '#92400e'
  return '#dc2626'
})

const gaugeDashoffset = computed(() => {
  const s = gaugeScore.value ?? 0
  return (141.4 * (1 - s / 100)).toFixed(1)
})

const gaugeRatingText = computed(() => {
  const s = gaugeScore.value ?? 0
  if (s >= 80) return 'Excellent condition'
  if (s >= 60) return 'Good condition'
  if (s >= 40) return 'Room to improve'
  return 'Plenty of opportunities'
})

const gaugeDesc = computed(() => {
  const s = gaugeScore.value ?? 0
  if (s >= 80)
    return 'This property scores well across all key areas. A strong performer.'
  if (s >= 60)
    return 'Solid overall, with some areas where improvements could add value.'
  if (s >= 40)
    return "Many homes at this rating have been improved to a B or C — see what's possible."
  return "Significant improvements could transform this property's efficiency and value."
})

const epcBadgeText = computed(() => {
  const epc = prop.value?.epcRating ?? '?'
  const score = prop.value?.epcScore ? ` (${prop.value.epcScore})` : ''
  const year = prop.value?.yearBuilt ? ` · Built ${prop.value.yearBuilt}` : ''
  const heat = prop.value?.heatingType ? ` · ${prop.value.heatingType}` : ''
  return `EPC ${epc}${score}${year}${heat}`
})

const gaugeBadgeStyle = computed(() => {
  const s = gaugeScore.value ?? 0
  if (s >= 80) return 'background:#f0fdf4;border-color:#bbf7d0;'
  if (s >= 60) return 'background:#f0fdfb;border-color:#99f6e4;'
  if (s >= 40) return 'background:#fef9f0;border-color:#fef3c7;'
  return 'background:#fef2f2;border-color:#fecaca;'
})

// ── EPC component bars ─────────────────────────────────────────────────────────
function effToPercent(eff: string | null | undefined): number {
  if (!eff) return 0
  const map: Record<string, number> = {
    'Very Good': 90,
    Good: 72,
    Average: 50,
    Poor: 28,
    'Very Poor': 15,
  }
  return map[eff] ?? 50
}

function epcCompClass(eff: string | null | undefined): string {
  if (!eff) return 'pps-epc-comp-fill--na'
  if (eff === 'Very Good' || eff === 'Good') return 'pps-epc-comp-fill--good'
  if (eff === 'Average') return 'pps-epc-comp-fill--avg'
  if (eff === 'Poor') return 'pps-epc-comp-fill--poor'
  if (eff === 'Very Poor') return 'pps-epc-comp-fill--vpoor'
  return 'pps-epc-comp-fill--na'
}
function epcCompColor(eff: string | null | undefined): string {
  if (!eff) return '#9c98ad'
  if (eff === 'Very Good' || eff === 'Good') return '#2eab55'
  if (eff === 'Average') return '#e6a23c'
  if (eff === 'Poor') return '#c73e36'
  if (eff === 'Very Poor') return '#a82e26'
  return '#9c98ad'
}

function effToColor(pct: number): string {
  if (pct >= 72) return '#008a84'
  if (pct >= 50) return '#00a19a'
  if (pct >= 28) return '#92400e'
  return '#dc2626'
}

const epcComponents = computed(() => {
  const epc = enrichment.value?.epcCert ?? prop.value
  if (!epc) return []
  const fields = [
    { label: 'Walls', effKey: 'wallsEnergyEff', descKey: 'wallsDescription' },
    { label: 'Roof', effKey: 'roofEnergyEff', descKey: 'roofDescription' },
    {
      label: 'Heating',
      effKey: 'mainheatEnergyEff',
      descKey: 'mainheatDescription',
    },
    {
      label: 'Hot water',
      effKey: 'hotWaterEnergyEff',
      descKey: 'hotWaterDescription',
    },
    {
      label: 'Windows',
      effKey: 'windowsEnergyEff',
      descKey: 'windowsDescription',
    },
    {
      label: 'Lighting',
      effKey: 'lightingEnergyEff',
      descKey: 'lightingDescription',
    },
  ]
  return fields
    .filter((f) => epc[f.effKey])
    .map((f) => {
      const eff = epc[f.effKey] as string
      const pct = effToPercent(eff)
      return {
        label: f.label,
        eff,
        pct,
        color: effToColor(pct),
        desc: epc[f.descKey] ?? eff,
      }
    })
})

// ── Running costs ──────────────────────────────────────────────────────────────
const runningCosts = computed(() => {
  const src = enrichment.value?.epcCert ?? property.value ?? {}
  const heating = src.heatingCostCurrent ?? null
  const hotWater = src.hotWaterCostCurrent ?? null
  const lighting = src.lightingCostCurrent ?? null
  const validCosts = [heating, hotWater, lighting].filter(
    (v): v is number => v !== null,
  )
  const total = validCosts.length ? validCosts.reduce((a, b) => a + b, 0) : null
  return { heating, hotWater, lighting, total }
})
const hasRunningCosts = computed(() => runningCosts.value.total !== null)

function formatCost(val: number | null): string {
  if (val === null) return '—'
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(val)
}

// ── EPC rating color ───────────────────────────────────────────────────────────
const epcRatingColor = computed(() => {
  const r = prop.value?.epcRating ?? ''
  if (r === 'A' || r === 'B') return '#008a84'
  if (r === 'C') return '#00a19a'
  if (r === 'D') return '#92400e'
  if (r === 'E') return '#ea580c'
  return '#dc2626'
})

// ── Flood risk ─────────────────────────────────────────────────────────────────
// Single source of truth: the EA RoFRS rating (Very Low / Low / Medium /
// High / Severe). The flood sheet renders `property.floodRisk` directly; the
// tile uses `floodRiskData.label`. Previously these read different fields
// (zone severity vs. RoFRS rating) and diverged when a postcode was in a
// high-risk RoFRS band but had no active warnings — the tile would say
// "Low" while the sheet said "High". This computed now mirrors the same
// rating both views show.
const floodRiskData = computed(() => {
  // Prefer enrichment (fresh) over property.floodRisk (DB column, may be
  // stale). Both come from `fetchFloodDetail`'s `rating` so they should
  // match, but enrichment is always the most recent fetch.
  const raw = String(
    (enrichment.value as any)?.floodRisk ?? property.value?.floodRisk ?? '',
  ).trim()
  const lower = raw.toLowerCase()
  if (lower.includes('severe')) {
    return {
      label: 'Severe',
      color: '#991b1b',
      class: 'pp-badge-flood--high',
      zone: 'Zone 3',
      pill: 'background:#fee2e2;color:#991b1b;',
      badgeClass: 'pp-badge-flood--high',
    }
  }
  if (lower.includes('high')) {
    return {
      label: 'High',
      color: '#dc2626',
      class: 'pp-badge-flood--high',
      zone: 'Zone 3',
      pill: 'background:#fee2e2;color:#991b1b;',
      badgeClass: 'pp-badge-flood--high',
    }
  }
  if (lower.includes('medium')) {
    return {
      label: 'Medium',
      color: '#ea580c',
      class: 'pp-badge-flood--med',
      zone: 'Zone 2',
      pill: 'background:#fef3c7;color:#92400e;',
      badgeClass: 'pp-badge-flood--med',
    }
  }
  if (lower.includes('very low')) {
    return {
      label: 'Very Low',
      color: '#008a84',
      class: 'pp-badge-flood--low',
      zone: 'Zone 1',
      pill: 'background:#d1fae5;color:#008a84;',
      badgeClass: 'pp-badge-flood--low',
    }
  }
  if (lower.includes('low')) {
    return {
      label: 'Low',
      color: '#008a84',
      class: 'pp-badge-flood--low',
      zone: 'Zone 1',
      pill: 'background:#d1fae5;color:#008a84;',
      badgeClass: 'pp-badge-flood--low',
    }
  }
  // Truly unknown — render nothing (the tile is conditional on a label).
  return {
    label: '',
    color: '#9c98ad',
    class: 'pp-badge-flood--low',
    zone: '',
    pill: 'background:#f5f5f7;color:#6b6783;',
    badgeClass: 'pp-badge-flood--low',
  }
})
const floodRiskLabel = computed(() => floodRiskData.value.label)
const floodRiskColor = computed(() => floodRiskData.value.color)
const floodRiskClass = computed(() => floodRiskData.value.class)
const floodZoneLabel = computed(() => floodRiskData.value.zone)
const floodPillStyle = computed(() => floodRiskData.value.pill)

const floodBadgeClass = computed(() => {
  const r = enrichment.value?.floodRisk
  if (!r) return 'pp-flood-badge--very-low'
  return `pp-flood-badge--${r.toLowerCase().replace(/\s/g, '-')}`
})

const floodHeroClass = computed(() => {
  const r = (enrichment.value?.floodRisk ?? '').toLowerCase()
  if (r.includes('severe')) return 'pp-flood-hero--severe'
  if (r.includes('high')) return 'pp-flood-hero--high'
  if (r.includes('medium')) return 'pp-flood-hero--medium'
  if (r.includes('low')) return 'pp-flood-hero--low'
  return 'pp-flood-hero--low'
})

// Planning data (planning.data.gov.uk via /enrichment)
const planningConstraints = computed(() => {
  const list = (enrichment.value as any)?.planningHistory?.constraints ?? []
  return Array.isArray(list) ? list : []
})
const planningApplications = computed(() => {
  const list = (enrichment.value as any)?.planningHistory?.applications ?? []
  if (!Array.isArray(list)) return []
  return [...list].sort((a: any, b: any) => {
    const da = a?.decisionDate ? new Date(a.decisionDate).getTime() : 0
    const db = b?.decisionDate ? new Date(b.decisionDate).getTime() : 0
    return db - da
  })
})
function constraintIcon(category: string) {
  if (category === 'heritage') return '🏛️'
  if (category === 'environment') return '🌳'
  if (category === 'development') return '🏗️'
  return '📋'
}

// Risk breakdown helpers (real EA data)
const nearestWatercourse = computed(() => {
  const z = enrichment.value?.floodZones ?? []
  for (const row of z) {
    if (
      row?.riverSea &&
      typeof row.riverSea === 'string' &&
      row.riverSea.trim()
    )
      return row.riverSea
  }
  return null
})
const floodRiskDescription = computed(() => {
  const r = enrichment.value?.floodRisk
  if (r === 'Very Low')
    return 'Not in an Environment Agency flood warning area.'
  if (r === 'Low')
    return 'Within an EA flood warning area — no active warnings. River or surface water flooding possible in extreme events.'
  if (r === 'Medium')
    return 'Flood alert active nearby. Some risk of flooding from rivers or sea.'
  if (r === 'High')
    return 'Flood warning issued nearby. Flooding of homes and businesses is expected.'
  if (r === 'Severe')
    return 'Severe flood warning — danger to life. Immediate action required.'
  return 'Source: Environment Agency flood monitoring.'
})

// ── Passport button ────────────────────────────────────────────────────────────
const passportBtnLabel = computed(() => {
  const s = passportStatus.value
  if (!s?.hasPassport) return 'Claim Passport'
  if (s.isOwner || s.isCollaborator) return 'Open Passport'
  if (s.isBuyer) return 'View Passport'
  if (s.isPublished) return 'Access Passport'
  return 'Passport Info'
})

const showPassportCta = computed(() => {
  const s = passportStatus.value
  return (
    s?.hasPassport &&
    s?.isPublished &&
    !s?.isOwner &&
    !s?.isCollaborator &&
    !s?.isBuyer
  )
})

const buyerModePassportId = computed(() => {
  const s = passportStatus.value
  if (
    s?.hasPassport &&
    s?.passportId &&
    !s?.isOwner &&
    !s?.isCollaborator &&
    !s?.isBuyer
  )
    return s.passportId
  return undefined
})

// ── Sales history ──────────────────────────────────────────────────────────────
const thisSales = computed(
  () => enrichment.value?.salesHistory?.thisProperty ?? [],
)
const nearbySales = computed(
  () => enrichment.value?.salesHistory?.nearbySales ?? [],
)

// ── Price history timeline ─────────────────────────────────────────────────────
interface PriceHistoryEntry {
  price: number
  dateStr: string
  dateObj: Date | null
  isEstimate: boolean
  delta?: { amount: number; pct: number; positive: boolean } | null
}

const priceHistoryTimeline = computed<PriceHistoryEntry[]>(() => {
  const entries: PriceHistoryEntry[] = []
  // Sort oldest → newest for delta calculation
  const sorted = [...thisSales.value]
    .map((s: any) => ({
      price: Number(s.price ?? s.amount ?? 0),
      dateStr: s.date ?? s.transferDate ?? '',
    }))
    .filter((s) => s.price > 0)
    .sort(
      (a, b) => new Date(a.dateStr).getTime() - new Date(b.dateStr).getTime(),
    )

  let prev: number | null = null
  for (const s of sorted) {
    let delta: PriceHistoryEntry['delta'] = null
    if (prev !== null && prev > 0) {
      const amount = s.price - prev
      const pct = (amount / prev) * 100
      delta = { amount, pct, positive: amount >= 0 }
    }
    entries.push({
      price: s.price,
      dateStr: s.dateStr,
      dateObj: s.dateStr ? new Date(s.dateStr) : null,
      isEstimate: false,
      delta,
    })
    prev = s.price
  }

  // Reverse so newest is top
  entries.reverse()

  // Prepend current estimate if we have one
  if (displayEstimatedPrice.value) {
    const last = sorted[sorted.length - 1]
    let delta: PriceHistoryEntry['delta'] = null
    if (last && last.price > 0) {
      const amount = displayEstimatedPrice.value - last.price
      const pct = (amount / last.price) * 100
      delta = { amount, pct, positive: amount >= 0 }
    }
    entries.unshift({
      price: displayEstimatedPrice.value,
      dateStr: '',
      dateObj: null,
      isEstimate: true,
      delta,
    })
  }

  return entries
})

const priceHistoryCagr = computed(() => {
  const sorted = [...thisSales.value]
    .map((s: any) => ({
      price: Number(s.price ?? s.amount ?? 0),
      date: new Date(s.date ?? s.transferDate ?? ''),
    }))
    .filter((s) => s.price > 0 && !isNaN(s.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (sorted.length < 1) return null
  const earliest = sorted[0]
  const latestPrice =
    displayEstimatedPrice.value ?? sorted[sorted.length - 1].price
  const latestDate = displayEstimatedPrice.value
    ? new Date()
    : sorted[sorted.length - 1].date

  const years =
    (latestDate.getTime() - earliest.date.getTime()) /
    (1000 * 60 * 60 * 24 * 365.25)
  if (years < 1) return null

  const cagr = (Math.pow(latestPrice / earliest.price, 1 / years) - 1) * 100
  if (!isFinite(cagr)) return null
  return {
    cagr,
    years: Math.round(years),
    fromYear: earliest.date.getFullYear(),
  }
})

function formatDelta(amt: number): string {
  const abs = Math.abs(Math.round(amt))
  const sign = amt >= 0 ? '+' : '−'
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(abs)
  return `${sign}${formatted}`
}

// ── Nearby places of interest (distance pills) ─────────────────────────────────
const nearbyKeyPlaces = computed(() => {
  const n = enrichment.value?.nearby ?? {}
  const items: { icon: string; label: string; distance: string }[] = []
  const station = (n.trains ?? [])[0]
  if (station)
    items.push({
      icon: '🚆',
      label: 'Station',
      distance: station.distanceKm ? `${station.distanceKm} km` : '',
    })
  const school = (n.schools ?? [])[0]
  if (school)
    items.push({
      icon: '🏫',
      label: 'School',
      distance: school.distanceKm ? `${school.distanceKm} km` : '',
    })
  const park = (n.parks ?? [])[0]
  if (park)
    items.push({
      icon: '🌳',
      label: 'Park',
      distance: park.distanceKm ? `${park.distanceKm} km` : '',
    })
  const bus = (n.busStops ?? [])[0]
  if (bus)
    items.push({
      icon: '🚌',
      label: 'Bus',
      distance: bus.distanceKm ? `${bus.distanceKm} km` : '',
    })
  return items.filter((i) => i.distance)
})

// ── EPC/Flood tile colours ─────────────────────────────────────────────────────
const epcLetterChipStyle = computed(() => {
  const r = prop.value?.epcRating ?? ''
  if (r === 'A' || r === 'B') return 'background:#d1fae5;color:#008a84;'
  if (r === 'C') return 'background:#ccfbf1;color:#115e59;'
  if (r === 'D') return 'background:#fef3c7;color:#92400e;'
  if (r === 'E') return 'background:#fed7aa;color:#92400e;'
  if (r === 'F' || r === 'G') return 'background:#fee2e2;color:#991b1b;'
  return 'background:#f1f5f9;color:#64748b;'
})

// ── Planning expand state ──────────────────────────────────────────────────────
const planningExpanded = ref<Record<number, boolean>>({})
function togglePlanning(i: number) {
  planningExpanded.value = {
    ...planningExpanded.value,
    [i]: !planningExpanded.value[i],
  }
}

// ── Signal bar visualization ───────────────────────────────────────────────────
function signalBarCount(val: any): number {
  if (val === null || val === undefined) return 0
  const n = typeof val === 'boolean' ? (val ? 3 : 0) : Number(val)
  if (n >= 3) return 3
  if (n >= 1) return 2
  if (n > 0) return 1
  return 0
}
function signalStrengthClass(val: any): string {
  const c = signalBarCount(val)
  if (c === 3) return 'pp-signal--good'
  if (c === 2) return 'pp-signal--ok'
  if (c === 1) return 'pp-signal--weak'
  return 'pp-signal--none'
}

function sdltBarColor(idx: number): string {
  const palette = ['#00a19a', '#0891b2', '#4f46e5', '#9333ea', '#c026d3']
  return palette[idx % palette.length]
}

// ── Nearby places ──────────────────────────────────────────────────────────────
const nearbySchools = computed(() => enrichment.value?.nearby?.schools ?? [])
const nearbyTransport = computed(() => {
  const n = enrichment.value?.nearby ?? {}
  const items: any[] = []
  for (const t of n.trains ?? [])
    items.push({
      name: t.name,
      meta: t.distanceKm ? t.distanceKm + ' km' : '',
      emoji: '',
      type: 'Rail',
      iconClass: 'pp-nearby-icon--purple',
      badgeClass: 'pp-transport-badge--purple',
    })
  for (const b of n.busStops ?? [])
    items.push({
      name: b.name,
      meta: b.distanceKm ? b.distanceKm + ' km' : '',
      emoji: '',
      type: 'Bus',
      iconClass: 'pp-nearby-icon--amber',
      badgeClass: 'pp-transport-badge--amber',
    })
  for (const a of n.airports ?? [])
    items.push({
      name: a.name,
      meta: a.distanceKm ? a.distanceKm + ' km drive' : '',
      emoji: '',
      type: 'Airport',
      iconClass: 'pp-nearby-icon--sky',
      badgeClass: 'pp-transport-badge--sky',
    })
  return items
})

function ofstedClass(ofsted: string) {
  if (ofsted === 'Outstanding') return 'pp-ofsted--outstanding'
  if (ofsted === 'Good') return 'pp-ofsted--good'
  return 'pp-ofsted--other'
}

// ── Mobile coverage ────────────────────────────────────────────────────────────
const mobileOperators = [
  { key: 'EE', label: 'EE' },
  { key: 'O2', label: 'O2' },
  { key: 'Three', label: 'Three' },
  { key: 'Vodafone', label: 'Vodafone' },
]

function signalClass(val: any) {
  if (val === null || val === undefined) return 'pp-mobile-dot--none'
  const n = typeof val === 'boolean' ? (val ? 4 : 0) : Number(val)
  if (n >= 3) return 'pp-mobile-dot--good'
  if (n >= 1) return 'pp-mobile-dot--limited'
  return 'pp-mobile-dot--none'
}

// ── Council tax reference ──────────────────────────────────────────────────────
const ctBandReference = [
  { band: 'A', range: 'Up to £40,000', estimate: 1377 },
  { band: 'B', range: 'More than £40,000 up to £52,000', estimate: 1606 },
  { band: 'C', range: 'More than £52,000 up to £68,000', estimate: 1835 },
  { band: 'D', range: 'More than £68,000 up to £88,000', estimate: 2065 },
  { band: 'E', range: 'More than £88,000 up to £120,000', estimate: 2523 },
  { band: 'F', range: 'More than £120,000 up to £160,000', estimate: 2982 },
  { band: 'G', range: 'More than £160,000 up to £320,000', estimate: 3440 },
  { band: 'H', range: 'More than £320,000', estimate: 4130 },
]

function ctBandLadderOffset(band: string): string {
  const idx = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].indexOf(band)
  if (idx === -1) return '50%'
  return `calc(${(idx / 8) * 100}% + ${100 / 16}%)`
}
function bandEstimate(band: string): number {
  const found = ctBandReference.find((b) => b.band === band)
  return found?.estimate ?? 0
}

// ── Planning helpers ───────────────────────────────────────────────────────────
function planningDecisionClass(decision: string) {
  const d = (decision ?? '').toLowerCase()
  if (d.includes('grant') || d.includes('approv') || d.includes('permit'))
    return 'pp-planning-decision--approved'
  if (d.includes('refus') || d.includes('reject'))
    return 'pp-planning-decision--refused'
  return 'pp-planning-decision--pending'
}

// ── SDLT calculator ────────────────────────────────────────────────────────────
const sdltBuyerType = ref<'standard' | 'firsttime' | 'additional'>('standard')
const sdltPriceInput = ref(0)
const sdltPriceRaw = ref('')

watch(
  displayEstimatedPrice,
  (p) => {
    if (p && sdltPriceInput.value === 0) {
      sdltPriceInput.value = Math.round(p)
      sdltPriceRaw.value = Math.round(p).toLocaleString('en-GB')
    }
  },
  { immediate: true },
)

function onSdltInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
  sdltPriceInput.value = raw ? parseInt(raw, 10) : 0
  sdltPriceRaw.value = sdltPriceInput.value
    ? sdltPriceInput.value.toLocaleString('en-GB')
    : ''
}

interface SdltBand {
  label: string
  rate: number
  tax: number
}

function standardBands() {
  return [
    { from: 0, to: 250000, rate: 0 },
    { from: 250000, to: 925000, rate: 5 },
    { from: 925000, to: 1500000, rate: 10 },
    { from: 1500000, to: Infinity, rate: 12 },
  ]
}

const sdltBreakdown = computed((): { bands: SdltBand[]; total: number } => {
  const price = sdltPriceInput.value
  const type = sdltBuyerType.value
  let rawBands: { from: number; to: number; rate: number }[]

  if (type === 'firsttime') {
    if (price > 625000) rawBands = standardBands()
    else
      rawBands = [
        { from: 0, to: 425000, rate: 0 },
        { from: 425000, to: 625000, rate: 5 },
      ]
  } else if (type === 'additional') {
    rawBands = standardBands().map((b) => ({ ...b, rate: b.rate + 5 }))
  } else {
    rawBands = standardBands()
  }

  let total = 0
  const bands: SdltBand[] = []
  for (const b of rawBands) {
    if (price <= b.from) break
    const taxable = Math.min(price, b.to) - b.from
    const tax = Math.round((taxable * b.rate) / 100)
    total += tax
    if (taxable > 0) {
      bands.push({
        label: `£${(b.from / 1000).toFixed(0)}k – ${
          b.to === Infinity ? 'above' : '£' + (b.to / 1000).toFixed(0) + 'k'
        }`,
        rate: b.rate,
        tax,
      })
    }
  }
  return { bands, total }
})

// ── Images ─────────────────────────────────────────────────────────────────────
// Only show real photos the owner has uploaded (or a property.imageUrl set
// elsewhere in the system). When none are available, return [] so the
// ImageSlider falls through to its branded UMU "No image available"
// placeholder. We deliberately don't fall back to a Google Street View
// snapshot — that gave the impression of a stock image and confused users.
const propertyImages = computed(() => {
  const apiBase = String(config.public.apiBase ?? '')
  const images: string[] = []
  const uploaded = (property.value?.images as string[] | null) ?? []
  // normalizeUploadUrl heals old URLs saved with the localhost:3002
  // fallback from a misconfigured backend deploy — swaps that prefix
  // for the current apiBase so images load on any device.
  images.push(...normalizeUploadUrls(uploaded, apiBase))
  const imgUrl = normalizeUploadUrl(property.value?.imageUrl, apiBase)
  if (imgUrl && !images.includes(imgUrl)) {
    images.push(imgUrl)
  }
  return images
})

// ─── Prototype-states page model ─────────────────────────────────────────────
// All computeds below feed the new `pps-*` template. They prefer real backend
// data and fall back gracefully when fields are missing.

// Generic stock photo shown once every real candidate below has been
// tried and failed (or none exist) — matches PropertyImage.vue's fallback
// used on the search-results page, so a property reads as "a house" here
// too rather than a broken image or a branded icon that looks different
// from every other property card in the app.
const DUMMY_PROPERTY_IMAGE = '/op-icons/misc/propertyPlaceholder.png'

// Hero image preference order — tried in sequence, advancing past any URL
// that 404s (a DB record pointing at an upload that no longer exists on
// disk, e.g. wiped by an env reset, previously just gave up entirely and
// showed the SVG placeholder even when a perfectly good fallback was
// available further down the list):
//   1. uploaded property images (property.images), in order
//   2. the Google Street View static-API URL from /enrichment (generated
//      server-side for any property with lat/lng)
//   3. property.imageUrl (also usually a Street View URL, kept as a last
//      resort in case enrichment hasn't loaded yet)
//   4. null — falls through to DUMMY_PROPERTY_IMAGE
const heroImageCandidates = computed<string[]>(() => {
  const list = [...propertyImages.value]
  const sv = (enrichment.value as any)?.streetViewUrl
  if (typeof sv === 'string' && sv.trim() && !list.includes(sv)) list.push(sv)
  return list
})
const heroImageIndex = ref(0)
watch(heroImageCandidates, () => {
  heroImageIndex.value = 0
})
const heroImageRaw = computed<string | null>(
  () => heroImageCandidates.value[heroImageIndex.value] ?? null,
)
const onHeroImageError = () => {
  heroImageIndex.value += 1
}

const pageState = computed<'unclaimed' | 'progress' | 'published'>(() => {
  const s = passportStatus.value
  // GET /property/:id/passport-status returns `isPublished`, not
  // `passportPublished` (that name only exists on /property/search and
  // GET /property/:id). This mismatch meant a published passport's own
  // status endpoint was silently ignored here — a logged-in user would
  // fall through to 'progress' ("Preview what's being built") even
  // though search correctly showed it as published.
  if (s?.isPublished || property.value?.passportPublished) return 'published'
  if (s?.hasPassport || property.value?.hasPassport) return 'progress'
  return 'unclaimed'
})

const shareUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/property/${propertyId}`
})

const estimatedPrice = computed<number | null>(() => {
  const p = property.value
  if (!p) return null
  const v = Number(p.estimatedPrice ?? p.lastSoldPrice ?? 0)
  return Number.isFinite(v) && v > 0 ? v : null
})

const priceSourceLabel = computed<string>(() => {
  const p = property.value
  if (p?.estimatedPrice) return 'HPI-adjusted estimate'
  if (p?.lastSoldPrice && p?.lastSoldDate) {
    const year = new Date(p.lastSoldDate).getFullYear()
    return `Land Registry · ${year} · HPI adjusted`
  }
  if (p?.lastSoldPrice) return 'Land Registry · HPI adjusted'
  return 'Estimate not available'
})

const floodBadgeLabel = computed<string | null>(() => {
  const f = (property.value?.floodRisk || '').trim()
  if (!f || f.toLowerCase() === 'unknown') return null
  return `Flood · ${f}`
})

const homescore = computed<number>(() => {
  const v = Number(property.value?.epcScore ?? 0)
  return Number.isFinite(v) && v > 0 ? Math.min(100, Math.round(v)) : 0
})

const scoreVerdict = computed<string>(() => {
  const s = homescore.value
  if (s >= 80) return 'Highly efficient'
  if (s >= 65) return 'Above average'
  if (s >= 50) return 'Average'
  if (s >= 35) return 'Room to improve'
  if (s > 0) return 'Plenty of opportunities'
  return 'Score unavailable'
})

const scoreDesc = computed<string>(() => {
  if (pageState.value === 'published') {
    return 'Refined by the owner. Tap to explore the full Passport.'
  }
  if (pageState.value === 'progress') {
    return 'Owner is building a verified Passport — this score will sharpen as data lands.'
  }
  return 'Score from public EPC data. Owner can run a full HomeScore for a verified picture.'
})

const epcDotColor = computed<string>(() => {
  const rating = (property.value?.epcRating || '').toUpperCase()
  const map: Record<string, string> = {
    A: '#00B050',
    B: '#33B800',
    C: '#92D050',
    D: '#FFD700',
    E: '#FF9933',
    F: '#FF6600',
    G: '#E64A19',
  }
  return map[rating] || '#E6A23C'
})

// Map an EPC efficiency string ("Very Good"/"Good"/"Average"/"Poor"/"Very Poor")
// to a 0–100 bar width and a brand colour.
const EFF_TO_PCT: Record<string, number> = {
  'very good': 92,
  good: 70,
  average: 50,
  poor: 30,
  'very poor': 12,
}
function effPct(value: string | null | undefined): number {
  if (!value) return 0
  return EFF_TO_PCT[String(value).toLowerCase()] || 0
}
function effColor(value: string | null | undefined): string {
  const pct = effPct(value)
  if (pct >= 70) return '#00a19a'
  if (pct >= 50) return '#92D050'
  if (pct >= 30) return '#E6A23C'
  if (pct > 0) return '#C73E36'
  return '#ECECEF'
}
function effRating(value: string | null | undefined, fallback = 'N/A'): string {
  if (!value) return fallback
  // Capitalise and shorten "Very Good" → "Very good" style
  return String(value)
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const epcBars = computed(() => {
  const p = property.value
  if (!p)
    return [] as Array<{
      label: string
      pct: number
      color: string
      rating: string
    }>
  const rows = [
    { label: 'Walls', eff: p.wallsEnergyEff },
    { label: 'Roof', eff: p.roofEnergyEff },
    { label: 'Heating', eff: p.mainheatEnergyEff },
    { label: 'Windows', eff: p.windowsEnergyEff },
  ]
  return rows
    .filter((r) => !!r.eff)
    .map((r) => ({
      label: r.label,
      pct: effPct(r.eff),
      color: effColor(r.eff),
      rating: effRating(r.eff),
    }))
})

const progressPct = computed<number>(() => {
  // Prefer the real-time passport progress returned by /passport-status
  // (logged-in viewers), then the same field on the public property
  // response (guests — that endpoint needs no JWT). Falls back to the
  // EPC-signals proxy only when no passport exists yet (so the
  // "Unclaimed" state still shows a meaningful progress bar).
  const realPct =
    passportStatus.value?.passportProgress?.completionPct ??
    property.value?.passportProgress?.completionPct
  if (typeof realPct === 'number') return realPct
  const p = property.value
  if (!p) return 0
  let done = 0
  const total = 8
  if (p.epcRating) done++
  if (p.wallsEnergyEff) done++
  if (p.mainheatEnergyEff) done++
  if (p.windowsEnergyEff) done++
  if (p.tenure) done++
  if (p.yearBuilt) done++
  if (passportStatus.value?.hasPassport) done += 2
  return Math.min(100, Math.round((done / total) * 100))
})

// Real-time per-section status from the backend. Used by the "Passport
// being built" card to render which sections are actually verified instead
// of the hard-coded placeholder list.
const realPassportSections = computed<Array<any>>(
  () => passportStatus.value?.passportProgress?.sections ?? [],
)

const passportFeatures = computed(() => {
  const p = property.value
  const realSections = realPassportSections.value
  // Prefer real backend section data when present — buyer sees actual
  // verified state, not a hardcoded placeholder list.
  if (realSections.length > 0) {
    return realSections.map((s: any) => ({
      title: s.title || s.key,
      sub:
        s.totalTasks > 0
          ? `${s.completedTasks} of ${s.totalTasks} task${
              s.totalTasks === 1 ? '' : 's'
            } complete`
          : 'No tasks',
      // A section counts as "verified" once every task on it is complete.
      verified: s.totalTasks > 0 && s.completedTasks === s.totalTasks,
      partial: s.completedTasks > 0 && s.completedTasks < s.totalTasks,
    }))
  }
  // Fallback (no passport yet) — keep the marketing-style list so the
  // unclaimed state still has something to show.
  return [
    {
      title: 'EPC Certificate',
      sub: p?.lodgementDate
        ? `Lodged ${new Date(p.lodgementDate).getFullYear()} · Grade ${
            p.epcRating
          }`
        : 'Energy Performance Certificate',
      verified: !!p?.epcRating,
    },
    {
      title: 'Land Registry Title',
      sub: p?.tenure ? `${p.tenure} confirmed` : 'Tenure on file',
      verified: !!p?.tenure,
    },
    {
      title: 'Title Plan',
      sub: 'Boundary map · HMLR verified',
      verified: !!p?.titleNumber,
    },
    {
      title: 'TA6 — Property Information',
      sub: 'Boundaries, disputes, utilities',
      verified: false,
    },
    {
      title: 'TA10 — Fittings & Contents',
      sub: "What's included in the sale",
      verified: false,
    },
    { title: 'Gas Safety Record', sub: 'Not yet uploaded', verified: false },
    {
      title: 'Electrical Certificate (EICR)',
      sub: 'Not yet uploaded',
      verified: false,
    },
    {
      title: 'TA7 — Leasehold Information',
      sub: 'Service charges, lease terms',
      verified: false,
    },
  ]
})

const publishedFeatures = computed(() => {
  // For now we mirror the in-progress list but mark everything verified.
  return passportFeatures.value.map((f) => ({ ...f, verified: true }))
})

// ── Explain-Progress sheet data ───────────────────────────────────────────────
const passportProgressTotal = computed<number>(
  () => passportFeatures.value.length,
)
const passportProgressVerified = computed<number>(
  () => passportFeatures.value.filter((f) => f.verified).length,
)
const passportProgressPct = computed<number>(() => {
  const total = passportProgressTotal.value
  if (!total) return 0
  return Math.round((passportProgressVerified.value / total) * 100)
})
const passportVerifiedItems = computed(() => {
  const iconMap: Record<string, { icon: string; bg: string }> = {
    'EPC Certificate': {
      icon: '/op-icons/homescore/lightning.png',
      bg: '#e6f7f6',
    },
    'Land Registry Title': {
      icon: '/op-icons/investment/landmarks.png',
      bg: '#e6f7f6',
    },
    'Title Plan': { icon: '🗺️', bg: '#e6f7f6' },
    'TA6 — Property Information': {
      icon: '/op-icons/homescore/clipboard.png',
      bg: '#fff3e0',
    },
    'TA10 — Fittings & Contents': {
      icon: '/op-icons/misc/wrench.png',
      bg: '#fff3e0',
    },
    'Gas Safety Record': {
      icon: '/op-icons/homescore/flame.png',
      bg: '#ffe0e0',
    },
    'Electrical Certificate (EICR)': {
      icon: '/op-icons/homescore/lightning.png',
      bg: '#e6f7f6',
    },
    'TA7 — Leasehold Information': {
      icon: '/op-icons/passportview/titleDeedsAndPlan.png',
      bg: '#f3e5f5',
    },
  }
  return passportFeatures.value
    .filter((f) => f.verified)
    .map((f) => ({
      title: f.title,
      sub: f.sub,
      icon:
        iconMap[f.title]?.icon ??
        '/op-icons/passportview/titleDeedsAndPlan.png',
      bg: iconMap[f.title]?.bg ?? '#f9f9fb',
    }))
})

const exploreTiles = computed(() => {
  const p = property.value
  if (!p) return []
  const tiles: Array<any> = []
  // Property details — first tile in the grid. Opens a sheet with
  // Type / EPC / UPRN + Download EPC. Kept as a tile (not a
  // top-level card) so the layout stays consistent with every other
  // data-source drawer on this page.
  const epcValue = p.epcRating
    ? `EPC ${p.epcRating}${p.epcScore ? ` · ${p.epcScore}` : ''}`
    : p.propertyType
    ? p.propertyType
    : '—'
  const detailsSub = p.uprn
    ? `UPRN ${p.uprn}`
    : p.propertyType && p.epcRating
    ? p.propertyType
    : 'Type · EPC · UPRN'
  tiles.push({
    key: 'property-details',
    icon: '🏷️',
    iconBg: '#EEF3F7',
    iconImage: '/op-icons/property/type.jpeg',
    title: 'Property details',
    value: epcValue,
    sub: detailsSub,
  })
  // Property history (Land Registry sold history)
  //
  // Enrichment sale rows can arrive with EITHER `price`/`date` (our
  // internal shape) or `amount`/`transferDate` (raw Land Registry
  // shape) depending on the upstream. The timeline accordion below
  // already handles both variants; the tile has to as well or it
  // reads null and displays "No sales" while the accordion happily
  // lists the same transactions. That mismatch was the bug.
  const mostRecentSale = thisSales.value[0]
  const salePriceRaw = mostRecentSale?.price ?? (mostRecentSale as any)?.amount
  const saleDateRaw =
    mostRecentSale?.date ?? (mostRecentSale as any)?.transferDate
  const soldPrice =
    p.lastSoldPrice ?? (salePriceRaw ? Number(salePriceRaw) : null)
  const soldDate = p.lastSoldDate ?? saleDateRaw ?? null
  tiles.push({
    key: 'history',
    icon: '',
    iconBg: '#FFF3E0',
    iconImage: '/op-icons/property/propertyHistory.jpeg',
    title: 'Property history',
    value: soldPrice ? `£${Number(soldPrice).toLocaleString()}` : 'No sales',
    sub: soldDate
      ? `Last sold ${new Date(soldDate).toLocaleDateString('en-GB', {
          month: 'short',
          year: 'numeric',
        })}`
      : 'Land Registry record',
  })
  // Street data — median of nearby sales (last 5 yrs) plus a count.
  // Falls back to the outward postcode when we have no comps, which
  // at least tells the user which area the tile represents.
  const nearby = nearbySales.value ?? []
  const nearbyPrices = nearby
    .map((s: any) => Number(s.price ?? s.amount ?? 0))
    .filter((n: number) => n > 0)
    .sort((a: number, b: number) => a - b)
  const streetValue = nearbyPrices.length
    ? `£${Math.round(
        nearbyPrices[Math.floor(nearbyPrices.length / 2)] / 1000,
      )}k median`
    : p.postcode
    ? p.postcode.split(' ')[0]
    : '—'
  const streetSub = nearbyPrices.length
    ? `${nearbyPrices.length} nearby sale${
        nearbyPrices.length === 1 ? '' : 's'
      }`
    : 'Neighbourhood comparison'
  tiles.push({
    key: 'street',
    icon: '',
    iconBg: '#E8F5E9',
    iconImage: '/op-icons/property/streetData.jpeg',
    title: 'Street data',
    value: streetValue,
    sub: streetSub,
  })
  // Schools — live count from enrichment. When the enrichment source
  // returns nothing we fall back to a directional message that points
  // the user at the definitive government checker rather than a bare
  // em-dash which reads as "loading" forever.
  const schoolsCount = enrichmentSchools.value.length
  const nearestSchool = enrichmentSchools.value[0]
  tiles.push({
    key: 'schools',
    icon: '',
    iconBg: '#E3F2FD',
    iconImage: '/op-icons/property/schools.jpeg',
    title: 'Schools',
    value: schoolsCount > 0 ? `${schoolsCount} nearby` : 'Check Ofsted',
    sub: nearestSchool
      ? `Nearest ${nearestSchool.distanceKm.toFixed(1)} km`
      : 'See full list on gov.uk',
  })
  // Transport (trains / buses / airports) — each one falls back through
  // three states: real data → "looking up" while enrichment is pending →
  // "sources unreachable" when Overpass mirrors all failed. Trains and
  // buses share `transportLookupFailed`; airports use their own batch
  // (150 km radius is too heavy to fold into the station/bus query) and
  // therefore have a separate `airportsLookupFailed` flag — a failed
  // airports lookup must NOT mark trains/buses as unavailable.
  const enrichmentPending = !enrichment.value
  const tFailed = transportLookupFailed.value
  const aFailed = airportsLookupFailed.value
  // Trains
  const nearestTrain = enrichmentTrains.value[0]
  tiles.push({
    key: 'trains',
    icon: '',
    iconBg: '#F3E5F5',
    iconImage: '/op-icons/property/trainstations.jpeg',
    title: 'Train stations',
    value: nearestTrain
      ? `${nearestTrain.distanceKm.toFixed(1)} km`
      : enrichmentPending
      ? 'Looking up…'
      : tFailed
      ? 'Unavailable'
      : 'No data',
    sub: nearestTrain
      ? nearestTrain.name
      : enrichmentPending
      ? 'Loading nearest stations'
      : tFailed
      ? 'Couldn’t load right now — tap to retry'
      : 'No stations found nearby',
  })
  // Bus stops
  const nearestBus = enrichmentBuses.value[0]
  tiles.push({
    key: 'buses',
    icon: '',
    iconBg: '#FFF3E0',
    iconImage: '/op-icons/property/busStops.jpeg',
    title: 'Bus stops',
    value: nearestBus
      ? `${nearestBus.distanceKm.toFixed(2)} km`
      : enrichmentPending
      ? 'Looking up…'
      : tFailed
      ? 'Unavailable'
      : 'No data',
    sub: nearestBus
      ? nearestBus.name || 'Nearest bus stop'
      : enrichmentPending
      ? 'Loading nearest stops'
      : tFailed
      ? 'Couldn’t load right now — tap to retry'
      : 'No stops found within 700 m',
  })
  // Airports — independent failure flag
  const nearestAirport = enrichmentAirports.value[0]
  tiles.push({
    key: 'airports',
    icon: '',
    iconBg: '#E1F5FE',
    iconImage: '/op-icons/property/airports.jpeg',
    title: 'Airports',
    value: nearestAirport
      ? `${nearestAirport.distanceKm.toFixed(0)} km`
      : enrichmentPending
      ? 'Looking up…'
      : aFailed
      ? 'Unavailable'
      : 'No data',
    sub: nearestAirport
      ? nearestAirport.name
      : enrichmentPending
      ? 'Loading nearest airports'
      : aFailed
      ? 'Couldn’t load right now — tap to retry'
      : 'No airports within 150 km',
  })
  // Location & map
  tiles.push({
    key: 'map',
    icon: '',
    iconBg: '#E8F5E9',
    iconImage: '/op-icons/property/locationAndMap.jpeg',
    title: 'Location & map',
    value: p.postcode || '—',
    sub: p.city || 'View on map',
  })
  // Flood risk — always show, prefer live enrichment value
  {
    const flood = String(
      (enrichment.value as any)?.floodRisk || p.floodRisk || '',
    ).trim()
    const value = flood || 'Very Low'
    const isHigh = /high|severe/i.test(value)
    const isMed = /medium/i.test(value)
    tiles.push({
      key: 'flood',
      icon: '💧',
      iconBg: '#FFF8E1',
      iconImage: '/op-icons/property/floodAndRisj.jpeg',
      title: 'Flood & risk',
      pip: isHigh ? '!' : null,
      value,
      sub: 'Environment Agency',
      valueStyle: isHigh
        ? { color: '#C73E36' }
        : isMed
        ? { color: '#D9772A' }
        : undefined,
    })
  }
  // Planning — show real constraint count
  {
    const constraints =
      (enrichment.value as any)?.planningHistory?.constraints ?? []
    const apps = (enrichment.value as any)?.planningHistory?.applications ?? []
    const count = constraints.length + apps.length
    tiles.push({
      key: 'planning',
      icon: '',
      iconBg: '#FAFAFA',
      iconImage: '/op-icons/property/planning.jpeg',
      title: 'Planning',
      pip: count > 0 ? null : 'New',
      value: count > 0 ? `${count} on file` : '—',
      sub:
        constraints.length > 0
          ? `${constraints.length} constraint${
              constraints.length === 1 ? '' : 's'
            }`
          : 'Applications on file',
    })
  }
  // Local Land Charges — indicative HMLR check. The tile value + sub
  // are static because the actual outcome (charges vs not-migrated vs
  // clean) is only known after the sheet loads. We hint "HM Land
  // Registry" so buyers understand the provenance before they tap.
  tiles.push({
    key: 'llc',
    icon: '',
    iconBg: '#F3EFFB',
    iconImage: '/op-icons/property/landCharges.jpeg',
    title: 'Land charges',
    value: 'Check LLC',
    sub: 'HM Land Registry',
  })
  // Council tax — prefer EPC-sourced band when DB column empty
  {
    const band =
      p.councilTaxBand ||
      (enrichment.value as any)?.epcCert?.councilTaxBand ||
      (enrichment.value as any)?.councilTax?.band ||
      null
    if (band) {
      tiles.push({
        key: 'council',
        icon: '🏛️',
        iconBg: '#E8F5E9',
        iconImage: '/op-icons/property/councilTax.jpeg',
        title: 'Council tax',
        value: `Band ${band}`,
        sub: 'Local authority',
      })
    }
  }
  // Broadband
  tiles.push({
    key: 'broadband',
    icon: '',
    iconBg: '#E3F2FD',
    iconImage: '/op-icons/property/broadband.jpeg',
    title: 'Broadband',
    value: 'Check speeds',
    sub: 'Full fibre availability',
  })
  // Stamp duty
  if (estimatedPrice.value) {
    tiles.push({
      key: 'stamp-duty',
      icon: '',
      iconBg: '#FCE4EC',
      iconImage: '/op-icons/property/stampDuty.jpeg',
      title: 'Stamp duty',
      value: `${formatPrice(stampDutyEstimate.value)}`,
      sub: 'On estimated value',
    })
  }
  // Listed buildings + heritage (data was being fetched but never surfaced).
  if (enrichmentListedBuildings.value.length > 0) {
    tiles.push({
      key: 'listed',
      icon: '',
      iconBg: '#FBEFD9',
      iconImage: '/op-icons/property/listedBuildings.jpeg',
      title: 'Heritage sites',
      value: `${enrichmentListedBuildings.value.length} nearby`,
      sub: 'Listed buildings & monuments',
    })
  }
  // Safety / crime stats (data.police.uk — free, no key). Tile always
  // renders even if the backend hasn't responded yet so the slot doesn't
  // disappear-reappear as enrichment lands; the sheet renders the empty
  // state gracefully when there's no data.
  {
    const total = enrichmentCrime.value?.totalLast12m
    const hasData = typeof total === 'number'
    tiles.push({
      key: 'crime',
      icon: '',
      iconBg: '#EEEDF5',
      iconImage: '/op-icons/property/crime.jpeg',
      title: 'Safety',
      value: hasData
        ? total > 0
          ? `${total.toLocaleString()} crimes`
          : 'None reported'
        : 'Tap to check',
      sub: 'Last 12 months · 1 mile radius',
    })
  }
  return tiles
})

const stampDutyEstimate = computed<number>(() => {
  const price = estimatedPrice.value || 0
  if (price <= 250000) return 0
  if (price <= 925000) return Math.round((price - 250000) * 0.05)
  if (price <= 1500000) return Math.round(33750 + (price - 925000) * 0.1)
  return Math.round(91250 + (price - 1500000) * 0.12)
})

// `runningCosts` (and `hasRunningCosts`) are already declared earlier in this
// file from the previous template — reuse them here. `total` may be null when
// no EPC cost fields are on file, so guard before rendering the boxes.
const costsBoxes = computed(() => {
  const rc = runningCosts.value
  if (!rc || rc.total == null) return []
  const heat = Math.round(rc.heating ?? 0)
  const water = Math.round(rc.hotWater ?? 0)
  const light = Math.round(rc.lighting ?? 0)
  return [
    { label: 'Heating', value: heat, highlight: false },
    { label: 'Hot water', value: water, highlight: false },
    { label: 'Lighting', value: light, highlight: false },
    { label: 'Total / year', value: Math.round(rc.total), highlight: true },
  ]
})

// ── Handlers wired to existing drawers/refs ───────────────────────────────────
// Heart = save the property to the user's profile (UserSavedProperty), which
// is what the profile's "Saved Properties" page reads.
async function onWishlistToggle() {
  const result = await toggleSave(propertyId)
  if (result === 'unauthenticated') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'redirectAfterLogin',
        `/property/${propertyId}?save=1`,
      )
    }
    router.push('/onboarding/signin')
    return
  }
  if (result === 'error') {
    showToast({
      message: 'Something went wrong — please try again',
      duration: 2000,
    })
    return
  }
  showToast({
    message: result.saved
      ? '❤️ Saved to your properties'
      : 'Removed from saved',
    duration: 2000,
  })
}

function onClaimClick() {
  // Show the same four-step explainer drawer the homescore page uses.
  // The drawer's primary "Claim it →" button emits `claim-passport`,
  // which routes authed users into the existing /claim/[id] flow and
  // shows guests the sign-in / create-account modal first.
  claimExplainerSheet.value = 'unclaimed'
}

// Plain method reference (not an inline multi-statement expression) —
// a `@click="closeSheet(); onClaimClick()"` string kept getting
// reformatted (by an editor's format-on-save) into a multi-line
// expression that silently dropped the semicolon, breaking the Vue
// template compiler. A method reference has nothing for that to mangle.
function onClaimSheetCtaClick() {
  closeSheet()
  onClaimClick()
}

// Single source of truth for "tap to do the right thing with the Passport"
// — used by every Passport CTA on this page. Branches on the (ownership ×
// passport state) matrix:
//
//                      | unclaimed       | in-progress           | published
//   ------------------ + --------------- + --------------------- + ----------------
//   owner / collab     | /claim/[id]     | /passportview/[id]    | /passportview/[id]
//   buyer (unlocked)   | /claim/[id]     | /buyer-passport/[id]  | /buyer-passport/[id]
//   non-owner          | /claim/[id]     | preview sheet (read)  | £99 unlock drawer
//
// "preview sheet" = the in-page Passport bottom sheet whose progress
// variant already lists the completed sections — that's the "example of
// what's been built" surface.
function routeForPassportState() {
  const s = passportStatus.value
  // 1. No passport at all → claim flow (KYC + Land Registry, free)
  if (!s?.hasPassport) {
    goToClaim()
    return
  }
  // 2. Owner or collaborator — straight to their passport, any state
  if (s.isOwner || s.isCollaborator) {
    if (s.passportId) {
      router.push(`/passportview/${s.passportId}`)
    } else {
      goToClaim()
    }
    return
  }
  // 3. Buyer who has already unlocked — view in buyer mode
  if (s.isBuyer && s.passportId) {
    router.push(`/buyer-passport/${s.passportId}`)
    return
  }
  // 4. Non-owner + published — open the £99 unlock payment drawer
  if (s.isPublished) {
    if (!s.passportId) {
      showToast({
        message: 'No published Passport to unlock for this property yet.',
        iconEmoji: 'ℹ️',
      })
      return
    }
    showUnlockDrawer.value = true
    return
  }
  // 5. Non-owner + in-progress — show the preview sheet so they can see
  //    what's been built so far without unlocking anything.
  openSheet('passport')
}

function onAccessPassport() {
  routeForPassportState()
}

const watchDrawerOpen = ref(false)
function onWatchClick() {
  watchDrawerOpen.value = true
}

// Persist a "watch": ensure the property is saved to the user's profile
// (so it shows under Saved Properties) and register interest (email). Guests
// are sent to sign-in and resume here via ?watched=1.
async function persistWatch(
  opts: { silent?: boolean } = {},
): Promise<'unauthenticated' | 'ok'> {
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'redirectAfterLogin',
        `/property/${propertyId}?watched=1`,
      )
    }
    router.push('/onboarding/signin')
    return 'unauthenticated'
  }
  watchSubmitting.value = true
  try {
    await fetchActions(propertyId)
    if (!saved.value) await toggleSave(propertyId)
    // Register interest (notifies owner/agent) — best-effort, non-blocking.
    fetch(`${config.public.apiBase}/property/${propertyId}/register-interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ interestLevel: 'Potential buyer' }),
    }).catch(() => {})
    if (!opts.silent) {
      showToast({
        message: 'Added to your watch list',
        icon: '/op-icons/homescore/houseSearch.png',
        duration: 2400,
      })
    }
  } finally {
    watchSubmitting.value = false
  }
  return 'ok'
}

// Same defaults WatchPropertyDrawer.vue prefills its toggles with — used
// here when we persist a watch without the user ever seeing that drawer
// (the ?watched=1 resume-after-signin path below).
const DEFAULT_WATCH_PREFS: Record<string, boolean> = {
  claimed: true,
  progress: true,
  published: true,
  comparables: false,
  homescore: true,
}

const watchConfirmedOpen = ref(false)
const watchConfirmedPrefs = ref<Record<string, boolean> | null>(null)
const passportEcosystemOpen = ref(false)

async function postWatchPrefs(prefs: Record<string, boolean>) {
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) return
  try {
    await fetch(`${config.public.apiBase}/property/${propertyId}/watch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(prefs),
    })
  } catch {}
}

async function onWatchDrawerSubmit(prefs: Record<string, boolean>) {
  watchDrawerOpen.value = false
  // Guests get redirected to sign-in inside persistWatch and resume via
  // ?watched=1 — stash the prefs they actually picked so that resume can
  // still show a confirmation matching their real choices, not defaults.
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('pendingWatchPrefs', JSON.stringify(prefs))
  }
  // The confirmation drawer below replaces the old toast — no need for
  // both.
  const result = await persistWatch({ silent: true })
  if (result === 'unauthenticated') return
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('pendingWatchPrefs')
  }
  await postWatchPrefs(prefs)
  watchConfirmedPrefs.value = prefs
  watchConfirmedOpen.value = true
}

function onWatchConfirmedCreatePassport() {
  watchConfirmedOpen.value = false
  router.push('/buyer-profile/build')
}

// True when the logged-in user owns or collaborates on the passport for this
// property. Used to swap "Get notified when published" → "Continue building".
const isPassportOwnerOrCollab = computed<boolean>(() => {
  const s = passportStatus.value
  return !!(s?.isOwner || s?.isCollaborator)
})

// Content for the floating photo-overlap card — same card now covers all
// three passport states (previously unclaimed-only), so copy/CTA/meta
// swap here rather than the card itself only existing for one state.
// A finer-grained state than `pageState`, used ONLY by the floating
// claim card — everything else on the page (PassportClaimBox, the
// "Keep going" section, quick-action button copy, etc.) still reads
// `pageState` unchanged. `pageState === 'unclaimed'` conflates two
// genuinely different situations now that the backend distinguishes
// them: nobody has claimed this property at all, vs. it's been claimed
// (verified owner) but there's no seller passport with real progress
// to show yet. Same split applies to `pageState === 'progress'` — a
// passport that exists but is still at 0% reads as "nothing public"
// rather than "in progress".
const floatClaimState = computed<
  'unclaimed' | 'noPublicPassport' | 'progress' | 'published'
>(() => {
  if (pageState.value === 'published') return 'published'
  if (pageState.value === 'progress') {
    // 60% matches the milestone the passport-readiness system (see
    // src/common/passport-readiness.ts on the backend) treats as the
    // first "evidence ready" tier — below it there isn't yet a
    // meaningful record worth surfacing publicly, even though a
    // passport row technically exists. NOTE: this reads the flat
    // task-count completionPct, not that readiness system's own
    // canPublish/milestonePct (which additionally requires every
    // blocking question answered) — the readiness endpoint is
    // access-gated (owner/collaborator/unlocked buyer only) and can't
    // be called for a public/un-unlocked viewer today. Revisit if a
    // public-safe readiness summary gets added.
    return progressPct.value >= 60 ? 'progress' : 'noPublicPassport'
  }
  const claimed =
    passportStatus.value?.isClaimed ?? property.value?.isClaimed ?? false
  return claimed ? 'noPublicPassport' : 'unclaimed'
})
const floatClaimTitle = computed<string>(() => {
  if (floatClaimState.value === 'published')
    return 'Property Passport available'
  if (floatClaimState.value === 'progress') return 'Passport in progress'
  if (floatClaimState.value === 'noPublicPassport')
    return 'No public Passport available'
  return (property.value?.streetClaimedCount ?? 0) > 0
    ? 'Be one of the first on this street'
    : 'Be the first on this street'
})
// "1 of 8 homes on Oakleigh Avenue claimed" pill above the claim card —
// only meaningful once we've actually matched at least one other property
// on the same street (streetTotalCount includes this property itself).
const streetClaimLabel = computed<string | null>(() => {
  if (floatClaimState.value !== 'unclaimed') return null
  const total = property.value?.streetTotalCount ?? 0
  if (total <= 1) return null
  const claimed = property.value?.streetClaimedCount ?? 0
  const street = property.value?.streetName || 'your street'
  return `${claimed} of ${total} homes on ${street} claimed`
})
const watcherCountLabel = computed<string>(() => {
  const n = property.value?.watcherCount ?? 0
  if (n <= 0) return ''
  return `${n} ${n === 1 ? 'person' : 'people'} watching`
})
const floatClaimSub = computed<string>(() => {
  if (floatClaimState.value === 'published') {
    return 'Verified information about this home is ready to explore.'
  }
  if (floatClaimState.value === 'progress') {
    return 'The owner has chosen to build this Property Passport in public, bringing key information together and getting it verified.'
  }
  if (floatClaimState.value === 'noPublicPassport') {
    return "There isn't a published Property Passport available for this home right now."
  }
  return 'Create your Property Passport to store, verify and share everything about your home.'
})
// Second, highlighted line under floatClaimSub — matches the prototype's
// extra teal/bold line for each non-unclaimed state (unclaimed's card has
// no second line in the prototype, so it returns '' there).
const floatClaimSub2 = computed<string>(() => {
  if (floatClaimState.value === 'published') {
    return 'See more before you view, offer or commit.'
  }
  if (floatClaimState.value === 'progress') {
    return 'This home could be getting ready for its next chapter.'
  }
  if (floatClaimState.value === 'noPublicPassport') {
    return 'Want to know if that changes?'
  }
  return ''
})
// Published's prototype has a bold lead-in line before floatClaimSub2
// ("Buying blind stops here.") that the other states don't have.
const floatClaimEmphasis = computed<string>(() =>
  floatClaimState.value === 'published' ? 'Buying blind stops here.' : '',
)
// "What is a Passport in progress? / What's inside the Passport?" —
// same copy and same explainer drawer as the PassportClaimBox cards
// below, now surfaced on the floating claim card too. Only progress/
// published have a matching explainer sheet to open; unclaimed and
// noPublicPassport don't get this link (no reference design shows one
// for either).
const floatClaimExplainerLabel = computed<string>(() => {
  if (floatClaimState.value === 'progress') return 'What is a Passport in progress?'
  if (floatClaimState.value === 'published') return "What's inside the Passport?"
  return ''
})
function onFloatClaimExplainerClick() {
  if (floatClaimState.value === 'progress') claimExplainerSheet.value = 'progress'
  else if (floatClaimState.value === 'published') claimExplainerSheet.value = 'published'
}
const floatClaimCta = computed<string>(() => {
  if (floatClaimState.value === 'published') {
    return isPassportOwnerOrCollab.value
      ? 'View my Passport'
      : 'View Property Passport'
  }
  if (floatClaimState.value === 'progress') {
    return isPassportOwnerOrCollab.value
      ? 'Continue building'
      : 'See Passport progress'
  }
  if (floatClaimState.value === 'noPublicPassport') {
    return 'Watch this property'
  }
  return 'Claim this property'
})
const floatClaimMeta = computed<string>(() => {
  if (floatClaimState.value === 'published') {
    return isPassportOwnerOrCollab.value || passportStatus.value?.canAccess
      ? ''
      : '£99'
  }
  if (floatClaimState.value === 'progress') {
    return `${progressPct.value}% complete`
  }
  return ''
})
// Every floatClaimState's main button opens its matching explainer
// drawer — same pattern "Claim this property" already used for
// unclaimed. The drawer's own buttons (see PassportClaimBox.vue) do the
// real routing, including the owner-vs-buyer branch for progress/
// published, so this click handler doesn't need to know about ownership
// at all — it just picks which drawer to show.
function onFloatClaimCtaClick() {
  claimExplainerSheet.value = floatClaimState.value
}

// Owner/collaborator → open the passport so they can keep filling sections.
// Everyone else → open the Watch sheet (notify-me flow). Single click handler
// so the button copy can branch but the wiring stays simple.
function onProgressCtaClick() {
  const s = passportStatus.value
  if (isPassportOwnerOrCollab.value && s?.passportId) {
    router.push(`/passportview/${s.passportId}`)
    return
  }
  onWatchClick()
}

function onContactClick() {
  openSheet('owner')
}

function onScoreCardTap() {
  router.push(`/homescore/${propertyId}`)
}

// ─── Bottom-sheet system (prototype's openSheet/closeSheet) ────────────────
type SheetKey =
  | 'property-details'
  | 'history'
  | 'street'
  | 'schools'
  | 'transport'
  | 'trains'
  | 'buses'
  | 'airports'
  | 'map'
  | 'flood'
  | 'planning'
  | 'llc'
  | 'council'
  | 'broadband'
  | 'stamp-duty'
  | 'listed'
  | 'crime'
  | 'watch'
  | 'owner'
  | 'passport'
  | 'explain-unclaimed'
  | 'explain-progress'
  | 'explain-published'
const activeSheet = ref<SheetKey | null>(null)

function openSheet(k: SheetKey) {
  activeSheet.value = k
}
function closeSheet() {
  activeSheet.value = null
}

// ── Swipe-to-dismiss for pps-sheet ─────────────────────────────
// Standard iOS-style behavior: dragging down from the top of the sheet
// closes it. Only engages when the sheet is scrolled to the top AND the
// gesture is heading downward — so normal upward scroll inside a long
// sheet is never intercepted.
const sheetDragY = ref(0)
const sheetDragging = ref(false)
let sheetTouchStartY = 0
let sheetTouchStartTime = 0
let sheetTouchStartScroll = 0

const sheetDragStyle = computed(() => {
  if (sheetDragY.value <= 0) return undefined
  return {
    transform: `translateY(${sheetDragY.value}px)`,
    transition: sheetDragging.value
      ? 'none'
      : 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
  }
})

function onSheetTouchStart(e: TouchEvent) {
  const sheet = (e.currentTarget as HTMLElement) ?? null
  sheetTouchStartScroll = sheet?.scrollTop ?? 0
  sheetTouchStartY = e.touches[0].clientY
  sheetTouchStartTime = Date.now()
  sheetDragging.value = true
  sheetDragY.value = 0
}

function onSheetTouchMove(e: TouchEvent) {
  if (!sheetDragging.value) return
  const dy = e.touches[0].clientY - sheetTouchStartY
  // Only translate the sheet if the user is at the top of its scroll
  // and is dragging downward. Anything else — let normal scroll happen.
  if (sheetTouchStartScroll <= 0 && dy > 0) {
    sheetDragY.value = dy
  } else {
    sheetDragY.value = 0
  }
}

function onSheetTouchEnd() {
  if (!sheetDragging.value) return
  sheetDragging.value = false
  const elapsed = Date.now() - sheetTouchStartTime
  const velocity = sheetDragY.value / Math.max(elapsed, 1) // px/ms
  const shouldClose = sheetDragY.value > 120 || velocity > 0.6
  if (shouldClose) {
    closeSheet()
  }
  // Reset regardless — animate spring-back if we didn't close.
  sheetDragY.value = 0
}

function onExploreTileClick(key: string) {
  // Every explore tile now opens its matching bottom sheet (prototype parity).
  const map: Record<string, SheetKey | null> = {
    'property-details': 'property-details',
    history: 'history',
    street: 'street',
    schools: 'schools',
    transport: 'transport',
    trains: 'trains',
    buses: 'buses',
    airports: 'airports',
    map: 'map',
    flood: 'flood',
    planning: 'planning',
    llc: 'llc',
    council: 'council',
    broadband: 'broadband',
    'stamp-duty': 'stamp-duty',
    listed: 'listed',
    crime: 'crime',
  }
  const sheet = map[key]
  if (sheet) openSheet(sheet)
}

// ─── Stamp duty (live calculator inside the Stamp Duty sheet) ──────────────
const sdInput = ref<number>(estimatedPrice.value || 350000)
watch(estimatedPrice, (v) => {
  if (v && !sdTouched.value) sdInput.value = v
})
const sdTouched = ref(false)
type SdType = 'standard' | 'first' | 'additional'
const sdType = ref<SdType>('standard')
const sdNonRes = ref(false)

// 2026 SDLT bands (England & NI). Source: HMRC current rates.
const SD_BANDS_STANDARD: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250000, to: 925000, rate: 0.05 },
  { from: 925000, to: 1500000, rate: 0.1 },
  { from: 1500000, to: Infinity, rate: 0.12 },
]
const SD_BANDS_FIRST: Array<{ from: number; to: number; rate: number }> = [
  { from: 0, to: 425000, rate: 0 },
  { from: 425000, to: 625000, rate: 0.05 },
  // First-time relief is lost above £625k — falls back to standard.
]
// Stacked-bar palette (light → dark) for band visualisation.
const SD_SHADES = ['#F3F3F5', '#B7E4E1', '#00A19A', '#4A4468', '#231D45']

type SdBand = {
  from: number
  to: number
  rate: number
  amount: number
  slice: number
  range: string
}
function computeStampDuty(
  price: number,
  type: SdType,
  nonRes: boolean,
): { total: number; bands: SdBand[] } {
  if (price <= 0) return { total: 0, bands: [] }
  const ftbApplies = type === 'first' && price <= 625000
  const base = ftbApplies ? SD_BANDS_FIRST : SD_BANDS_STANDARD
  // Additional-property surcharge: +5% on every band; non-UK-resident: +2%.
  const bump =
    (type === 'additional' && price >= 40000 ? 0.05 : 0) + (nonRes ? 0.02 : 0)
  const rows: SdBand[] = base.map((b) => {
    const top = Math.min(price, b.to)
    const slice = Math.max(0, top - b.from)
    const rate = b.rate + bump
    const amount = Math.round(slice * rate)
    const fmt = (n: number) =>
      n === Infinity ? '∞' : `£${Math.round(n).toLocaleString()}`
    return {
      from: b.from,
      to: b.to,
      rate,
      slice,
      amount,
      range: `${fmt(b.from)} – ${fmt(b.to)}`,
    }
  })
  const total = rows.reduce((s, r) => s + r.amount, 0)
  return { total, bands: rows }
}
const stampDuty = computed(() =>
  computeStampDuty(sdInput.value || 0, sdType.value, sdNonRes.value),
)
const sdEffective = computed(() => {
  const price = sdInput.value || 0
  const rate = price > 0 ? (stampDuty.value.total / price) * 100 : 0
  const active = stampDuty.value.bands.filter((b) => b.slice > 0)
  const top = active.length ? active[active.length - 1] : null
  return {
    rate,
    per100: rate,
    topBand: top ? Math.round(top.rate * 100) : 0,
  }
})
const sdStack = computed(() =>
  stampDuty.value.bands
    .filter((b) => b.slice > 0)
    .map((b, i) => ({
      i,
      rate: b.rate,
      slice: b.slice,
      pct: sdInput.value ? (b.slice / sdInput.value) * 100 : 0,
      color: SD_SHADES[i % SD_SHADES.length],
    })),
)
const sdMaxBand = computed(() =>
  Math.max(1, ...stampDuty.value.bands.map((b) => b.amount)),
)
const sdAlert = computed<{ title: string; body: string } | null>(() => {
  const price = sdInput.value || 0
  if (sdType.value === 'first' && price > 625000) {
    return {
      title: 'No first-time buyer relief above £625,000.',
      body: 'At this price you pay full standard rates. Relief only applies to purchases of £625,000 or less.',
    }
  }
  if (sdType.value === 'first' && price > 600000 && price <= 625000) {
    return {
      title: "You're close to the £625,000 cliff edge.",
      body: 'One pound over and first-time relief disappears entirely — the bill jumps sharply for a small increase in price.',
    }
  }
  if (sdType.value === 'additional' && price >= 40000) {
    return {
      title: 'Includes the 5% additional-property surcharge on every band.',
      body: 'If you sell your previous main home within three years you may be able to reclaim it.',
    }
  }
  if (sdNonRes.value && price > 0) {
    return {
      title: '+2% non-UK resident surcharge on every band.',
      body: 'Reclaim is possible if you spend 183+ days in the UK in the year after completion.',
    }
  }
  return null
})
function sdShort(n: number): string {
  if (!n) return '£0'
  if (n === Infinity) return 'above'
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return '£' + (n % 1_000_000 ? m.toFixed(2) : m.toFixed(1)) + 'm'
  }
  return '£' + Math.round(n / 1000) + 'k'
}
function onSdInputText(e: Event) {
  const raw = ((e.target as HTMLInputElement).value || '').replace(/[^\d]/g, '')
  const v = parseInt(raw || '0', 10)
  sdInput.value = Math.min(10_000_000, Number.isFinite(v) ? v : 0)
  sdTouched.value = true
}
function onSdSlider(e: Event) {
  const v = parseInt((e.target as HTMLInputElement).value || '0', 10)
  sdInput.value = Number.isFinite(v) ? v : 0
  sdTouched.value = true
}

// ─── Schools sheet (filter + summary computeds) ────────────────────────────
type SchoolPhaseKey = 'all' | 'nursery' | 'primary' | 'secondary'
const schoolPhaseFilter = ref<SchoolPhaseKey>('all')
const schoolOpen = ref(-1)
const schoolPhases: Array<{ key: SchoolPhaseKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'nursery', label: 'Nursery' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
]
function schoolPhaseKey(phase: string | null | undefined): string {
  const p = (phase || '').toLowerCase()
  if (p.includes('nursery') || p.includes('early')) return 'nursery'
  if (p.includes('primary') || p.includes('infant') || p.includes('junior'))
    return 'primary'
  if (p.includes('secondary') || p.includes('senior') || p.includes('sixth'))
    return 'secondary'
  return 'other'
}
function schoolPhaseColor(phase: string | null | undefined): string {
  const k = schoolPhaseKey(phase)
  if (k === 'primary') return '#00A19A'
  if (k === 'secondary') return '#231D45'
  if (k === 'nursery') return '#9A9AA1'
  return '#75757C'
}
function walkMinutes(km: number): number {
  // 12 min/km rough walking pace, rounded up, min 1.
  return Math.max(1, Math.round((km || 0) * 12))
}
function proximityPct(km: number): number {
  // Bar full at 0km, empty at ~40 min walk (~3.3 km).
  const mins = walkMinutes(km)
  return Math.max(6, (1 - Math.min(mins, 40) / 40) * 100)
}
const filteredSchools = computed(() => {
  const list = enrichmentSchools.value.slice()
  const filtered =
    schoolPhaseFilter.value === 'all'
      ? list
      : list.filter((s) => schoolPhaseKey(s.phase) === schoolPhaseFilter.value)
  return filtered.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
})
watch(schoolPhaseFilter, () => {
  schoolOpen.value = -1
})
const schoolStats = computed(() => {
  const list = enrichmentSchools.value
  const primaries = list.filter((s) => schoolPhaseKey(s.phase) === 'primary')
  const secondaries = list.filter(
    (s) => schoolPhaseKey(s.phase) === 'secondary',
  )
  const primariesNearby = primaries.filter(
    (s) => (s.distanceKm || 0) <= 1,
  ).length
  const secondariesNearby = secondaries.filter(
    (s) => (s.distanceKm || 0) <= 2,
  ).length
  const nearestPrimaryKm = primaries.length
    ? Math.min(...primaries.map((s) => s.distanceKm || Infinity))
    : null
  return {
    total: list.length,
    primariesNearby,
    secondariesNearby,
    nearestPrimaryKm: Number.isFinite(nearestPrimaryKm as number)
      ? (nearestPrimaryKm as number)
      : null,
  }
})

// ─── Flood sheet (per-source rows + live-warnings) ─────────────────────────
const floodOpen = ref(-1)
const floodLiveOpen = ref(false)
function onFloodRowClick(i: number, hasDetail: string) {
  if (!hasDetail) return
  floodOpen.value = floodOpen.value === i ? -1 : i
}
const floodOverall = computed(() => {
  const raw = property.value?.floodRisk
  const stamp = raw
    ? 'Environment Agency RoFRS classification'
    : 'Not yet checked'
  if (!raw) {
    return {
      label: 'Not yet checked',
      sub: "We haven't been able to retrieve an Environment Agency classification for this address. Nothing here should be read as a low risk — it simply hasn't been checked.",
      stamp,
    }
  }
  const lower = raw.toLowerCase()
  if (lower.includes('high')) {
    return {
      label: 'High',
      sub: 'This address sits in an EA-classified high-risk zone. <b>This will affect insurance and may affect lending.</b>',
      stamp,
    }
  }
  if (lower.includes('medium')) {
    return {
      label: 'Medium',
      sub: 'Between 1% and 3.3% annual probability of river or sea flooding. Ask insurers about premium loading.',
      stamp,
    }
  }
  if (lower.includes('very low')) {
    return {
      label: 'Very low',
      sub: 'Less than 0.1% annual probability of river or sea flooding.',
      stamp,
    }
  }
  if (lower.includes('low')) {
    return {
      label: 'Low',
      sub: 'Between 0.1% and 1% annual probability of river or sea flooding. Lenders rarely raise questions at this level.',
      stamp,
    }
  }
  return {
    label: raw,
    sub: `EA risk classification: ${raw}.`,
    stamp,
  }
})
const floodRows = computed(() => {
  const raw = (property.value?.floodRisk || '').toLowerCase()
  const riversS = raw.includes('high')
    ? 'High'
    : raw.includes('medium')
    ? 'Medium'
    : raw.includes('very low')
    ? 'Very low'
    : raw.includes('low')
    ? 'Low'
    : 'Not assessed'
  const riversC =
    riversS === 'High'
      ? 'high'
      : riversS === 'Medium'
      ? 'med'
      : riversS === 'Not assessed'
      ? 'none'
      : 'low'
  const nearest = nearestWatercourse.value
  const rows: Array<{ n: string; s: string; c: string; m: string; d: string }> =
    [
      {
        n: 'Rivers &amp; the sea',
        s: riversS,
        c: riversC,
        m:
          riversS === 'High'
            ? 'Greater than 3.3% chance of flooding in any given year.'
            : riversS === 'Medium'
            ? 'Between 1% and 3.3% chance in any given year.'
            : riversS === 'Very low'
            ? 'Less than 0.1% chance in any given year.'
            : riversS === 'Low'
            ? 'Between 0.1% and 1% chance in any given year.'
            : 'No Environment Agency classification retrieved yet.',
        d:
          riversS === 'High'
            ? '<b>Get a flood report before you offer.</b> Expect insurers to ask for a Flood Re declaration and some lenders to require a specialist survey. Ask the seller whether the property has flooded and whether a claim was made.'
            : riversS === 'Medium'
            ? 'Check whether the property has property-level protection fitted — flood doors, airbrick covers, non-return valves. <b>These reduce premiums materially.</b>'
            : riversS === 'Low' || riversS === 'Very low'
            ? nearest
              ? `Nearest watercourse: <b>${nearest}</b>. Distance and elevation both matter more than the postcode-level rating.`
              : 'Lenders rarely raise questions at this rating. Distance to the nearest watercourse still matters for individual homes.'
            : '',
      },
      {
        n: 'Surface water',
        s: 'Not assessed',
        c: 'none',
        m: 'Not currently in our EA monitoring feed.',
        d: 'Surface water is the most common cause of flooding in urban areas and often overlooked. <b>Worth asking whether the road has flooded in heavy storms.</b>',
      },
      {
        n: 'Groundwater',
        s: 'Not assessed',
        c: 'none',
        m: 'Not currently in our EA monitoring feed.',
        d: 'Groundwater flooding affects basements and cellars first. If the property has one, <b>ask specifically about damp history.</b>',
      },
      {
        n: 'Reservoirs',
        s: 'Not assessed',
        c: 'none',
        m: 'Not currently in our EA monitoring feed.',
        d: "Reservoir flooding is extremely rare but would be rapid. The full EA inundation model isn't in our feed yet.",
      },
    ]
  return rows
})
// Placeholder — no live-warnings EA feed wired yet, so this stays empty and the
// panel doesn't render. When we add the feed, populate {name, status} rows here.
const floodLiveWarnings = computed<Array<{ name: string; status?: string }>>(
  () => [],
)

// ─── Sheet: history — fetch sold history when the sheet opens ──────────────
const soldHistory = ref<any[]>([])
const soldHistoryLoaded = ref(false)

// Last sale (most recent record on this property)
const lastSale = computed<{ price: number; date: string } | null>(() => {
  const arr = soldHistory.value
  if (!arr.length) return null
  const sorted = [...arr]
    .filter((s) => s?.price && s?.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return sorted[0] ?? null
})

// Delta between current HPI-adjusted estimate and most recent sale
const deltaSinceSold = computed<{
  abs: number
  pct: number
  positive: boolean
} | null>(() => {
  const ls = lastSale.value
  const cur = estimatedPrice.value
  if (!ls?.price || !cur) return null
  const abs = cur - ls.price
  const pct = (abs / ls.price) * 100
  return { abs, pct, positive: abs >= 0 }
})

async function loadSoldHistory() {
  if (soldHistoryLoaded.value) return
  soldHistoryLoaded.value = true
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId}/sold-history`,
    )
    if (!res.ok) return
    const data = await res.json()
    soldHistory.value = Array.isArray(data?.thisProperty)
      ? data.thisProperty
      : []
  } catch {
    /* keep empty */
  }
}

// Lazy-loaders triggered when a sheet opens.
watch(activeSheet, (s) => {
  if (s === 'history') void loadSoldHistory()
  if (s === 'street') void loadStreetEnergyRank()
})

// Live street-energy rank — reuses the helper added on the homescore page.
const streetEnergyRank = ref<{
  rank: number | null
  total: number
  bestCost: number | null
  averageCost: number | null
  yourCost: number | null
  yourEpcRating?: string | null
  epcDistribution?: { letter: string; count: number }[]
  avgEpcScore?: number | null
} | null>(null)

const epcBarMaxCount = computed(() => {
  const list = streetEnergyRank.value?.epcDistribution ?? []
  return list.reduce((m, b) => Math.max(m, b.count), 0)
})
function epcBarColor(letter: string) {
  const map: Record<string, string> = {
    A: '#1a9447',
    B: '#2eab55',
    C: '#7dc459',
    D: '#e6a23c',
    E: '#d9772a',
    F: '#c73e36',
    G: '#a72d27',
  }
  return map[letter] || '#9c98ad'
}
async function loadStreetEnergyRank() {
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId}/street-energy-rank`,
    )
    if (!res.ok) return
    streetEnergyRank.value = await res.json()
  } catch {
    /* leave null */
  }
}

// Council tax — band → 2024/25 England average annual £ table.
const COUNCIL_BAND_AVG: Record<string, number> = {
  A: 1340,
  B: 1563,
  C: 1787,
  D: 2010,
  E: 2457,
  F: 2904,
  G: 3350,
  H: 4020,
}
const councilTaxAnnual = computed<number | null>(() => {
  const b = (property.value?.councilTaxBand || '').toUpperCase()
  return COUNCIL_BAND_AVG[b] ?? null
})
const councilTaxBands = computed(() => {
  const max = Math.max(...Object.values(COUNCIL_BAND_AVG))
  const mine = (property.value?.councilTaxBand || '').toUpperCase()
  return Object.entries(COUNCIL_BAND_AVG).map(([letter, amount]) => ({
    letter,
    amount,
    pct: Math.round((amount / max) * 100),
    active: letter === mine,
  }))
})

// CO₂ proxy for tile / explain sheets — use real EPC potential when known.
const co2NowTonnes = computed<number | null>(() => {
  const v = Number(property.value?.co2Emissions ?? 0)
  return v > 0 ? Math.round(v * 10) / 10 : null
})

// Council-tax extras (restored — these fields were fetched but unused).
const councilTaxCouncilName = computed<string | null>(() => {
  const ct = (enrichment.value as any)?.councilTax
  return (
    ct?.councilName ||
    (property.value?.city ? `${property.value.city} Council` : null)
  )
})
const councilTaxSource = computed<string | null>(
  () => (enrichment.value as any)?.councilTax?.dataSource || 'VOA',
)
const councilTaxNearby = computed<any[]>(() => {
  const arr = (enrichment.value as any)?.councilTax?.nearby
  return Array.isArray(arr) ? arr : []
})

// EPC "potential" rating (restored). Drives the small efficiency-upside row
// on the running-costs card; pulled from EPC API by the backend enrichment.
const epcPotentialRating = computed<string | null>(
  () => (enrichment.value as any)?.epcPotentialRating ?? null,
)
const epcPotentialScore = computed<number | null>(
  () => (enrichment.value as any)?.epcPotentialScore ?? null,
)
const enrichmentListedBuildings = computed<any[]>(
  () => (enrichment.value as any)?.listedBuildings ?? [],
)

// data.police.uk — 12-month crime stats within 1 mile (no API key needed).
const enrichmentCrime = computed<any | null>(
  () => (enrichment.value as any)?.crime ?? null,
)

// ── Crime sheet: radius, group filter, expandable rows ─────────
// Radius switcher is client-side because the API only returns one
// radius per call; ½ and 2-mile scale the 1-mile counts by rough
// population multipliers. Flagged as an estimate in the footnote.
const crimeRadiusOptions = [
  { value: '0.5', label: '½ mile' },
  { value: '1', label: '1 mile' },
  { value: '2', label: '2 miles' },
] as const
type CrimeRadius = '0.5' | '1' | '2'
const crimeRadius = ref<CrimeRadius>('1')

const crimeGroupOptions = [
  { value: 'all', label: 'All' },
  { value: 'property', label: 'Property' },
  { value: 'personal', label: 'Personal' },
  { value: 'public', label: 'Public order' },
] as const
type CrimeGroup = 'all' | 'property' | 'personal' | 'public'
const crimeGroup = ref<CrimeGroup>('all')

const crimeOpenIdx = ref(-1)
const crimeExpandedAll = ref(false)
function onCrimeGroupClick(value: CrimeGroup) {
  crimeGroup.value = value
  crimeOpenIdx.value = -1
}

// Radius → scale multiplier + estimated resident population. The
// 1-mile pop is anchored at 18,600 (typical UK urban 1-mile radius);
// ½ and 2-mile derived from area ratio × density correction to match
// the reference mockup.
const CRIME_RADIUS_META: Record<CrimeRadius, { scale: number; pop: number }> = {
  '0.5': { scale: 0.28, pop: 6400 },
  '1': { scale: 1, pop: 18600 },
  '2': { scale: 4.02, pop: 60600 },
}

// National England & Wales average — used to compute the "% above /
// below" verdict + the benchmark-scale marker position.
const CRIME_NATIONAL_RATE = 89

const CRIME_GROUP_MAP: Record<string, CrimeGroup> = {
  'violent-crime': 'personal',
  'violence-and-sexual-offences': 'personal',
  robbery: 'personal',
  drugs: 'personal',
  burglary: 'property',
  'vehicle-crime': 'property',
  'bicycle-theft': 'property',
  'other-theft': 'property',
  'theft-from-the-person': 'property',
  'criminal-damage-arson': 'property',
  'possession-of-weapons': 'property',
  shoplifting: 'public',
  'public-order': 'public',
  'anti-social-behaviour': 'public',
  'other-crime': 'public',
}
function crimeGroupFor(category: string): CrimeGroup {
  return CRIME_GROUP_MAP[category] ?? 'public'
}

const CRIME_GROUP_COLOUR: Record<CrimeGroup, string> = {
  property: '#231D45',
  personal: '#C4586B',
  public: '#C18A38',
  all: '#00A19A', // unused (chip filter, never a bar colour)
}
function crimeGroupColour(category: string): string {
  return CRIME_GROUP_COLOUR[crimeGroupFor(category)]
}

// Category-specific editorial notes — copy borrowed from the design
// mockup. Falls back to a generic line for anything the mockup didn't
// name so an unknown category still shows something on expand.
const CRIME_NOTES: Record<string, string> = {
  'violence-and-sexual-offences':
    'Mostly night-time economy incidents concentrated around the high street, not residential streets.',
  'violent-crime':
    'Mostly night-time economy incidents concentrated around the high street, not residential streets.',
  shoplifting:
    'Retail crime from the shopping parade inside the radius. No bearing on the property itself.',
  'vehicle-crime':
    'Theft from vehicles, largely overnight on unlit roads. Off-street parking materially reduces risk.',
  'other-theft':
    'Includes theft from the person and unattended property in public places.',
  'criminal-damage-arson':
    'Predominantly minor damage to vehicles and fencing.',
  burglary:
    'The figure most relevant to a home purchase. Compare against the national norm before drawing conclusions.',
  'public-order':
    'Disturbances and harassment reports, weighted to weekend evenings.',
  'anti-social-behaviour':
    'Under-reported nationally — treat the count as a floor rather than a total.',
  'other-crime':
    'Offences that do not fit the standard Home Office categories.',
  robbery:
    'Theft involving force or threat. Low in absolute terms for most residential areas.',
  'bicycle-theft':
    'Clustered near stations. Secure storage is the main mitigation.',
  drugs:
    'Largely possession offences arising from stop and search, which reflects policing activity as much as prevalence.',
  'possession-of-weapons':
    'Includes carrying prohibited items in public. Rare in absolute terms.',
  'theft-from-the-person':
    'Pickpocketing and similar — concentrated in busy public spaces.',
}
function crimeNoteFor(category: string): string {
  return (
    CRIME_NOTES[category] ??
    'A relative indicator only — reporting rates vary and small absolute numbers can shift the ranking materially.'
  )
}

// ── Derived values used by the sheet template ─────────────────

const crimeScaledTotal = computed(() => {
  const total = enrichmentCrime.value?.totalLast12m ?? 0
  return Math.round(total * CRIME_RADIUS_META[crimeRadius.value].scale)
})
const crimeEstimatedPop = computed(
  () => CRIME_RADIUS_META[crimeRadius.value].pop,
)
const crimeRatePer1000 = computed(() => {
  const pop = crimeEstimatedPop.value
  if (pop <= 0) return 0
  return Math.round((crimeScaledTotal.value / pop) * 1000)
})

// Verdict + scale key derived from the rate vs national average.
// pctDiff > 0 means area is BUSIER than national norm.
const crimeVerdictHtml = computed(() => {
  const r = crimeRatePer1000.value
  if (!r) return 'Not enough data to compare with the national average.'
  const pct = Math.round(
    ((r - CRIME_NATIONAL_RATE) / CRIME_NATIONAL_RATE) * 100,
  )
  const direction =
    pct === 0
      ? 'in line with'
      : pct > 0
      ? '<em>' + pct + '% above</em>'
      : '<em>' + Math.abs(pct) + '% below</em>'
  return `About ${direction} the average for England &amp; Wales.`
})
const crimeScaleKey = computed(() => {
  const r = crimeRatePer1000.value
  if (!r) return 'No comparable rate available.'
  const pct = ((r - CRIME_NATIONAL_RATE) / CRIME_NATIONAL_RATE) * 100
  const bandCopy =
    pct <= -20
      ? 'Quietest third nationally'
      : pct <= 0
      ? 'Lower third of neighbourhoods nationally'
      : pct <= 20
      ? 'Around the national midpoint'
      : 'Above the national midpoint'
  return `${bandCopy}. National average: ${CRIME_NATIONAL_RATE} per 1,000.`
})
const crimeScaleAriaLabel = computed(
  () =>
    `This location sits at ${crimeMarkerPct.value.toFixed(
      0,
    )}% of the national spread`,
)
// Marker position on the 0-100% benchmark scale. National average is
// pinned at 50%. Rate = 0 sits at 0%; rate = 2× national sits at 100%.
const crimeMarkerPct = computed(() => {
  const r = crimeRatePer1000.value
  if (!r) return 0
  const raw = (r / (CRIME_NATIONAL_RATE * 2)) * 100
  return Math.max(2, Math.min(98, raw))
})

// Sparkline path — from the same monthlyTrend the backend already
// computes (chronological, oldest → newest). Returns null when there's
// no trend to draw so the whole trend card can be hidden.
const crimeSparkPath = computed<string | null>(() => {
  const rows: Array<{ month: string; count: number }> =
    enrichmentCrime.value?.monthlyTrend ?? []
  if (rows.length < 2) return null
  const w = 300
  const h = 44
  const counts = rows.map(
    (r) => r.count * CRIME_RADIUS_META[crimeRadius.value].scale,
  )
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  const span = max - min || 1
  const pts = counts.map((n, i) => {
    const x = (i * w) / (counts.length - 1)
    const y = h - ((n - min) / span) * h + 4
    return `${x.toFixed(1)} ${y.toFixed(1)}`
  })
  return pts.map((p, i) => (i ? 'L' : 'M') + p).join(' ')
})
const crimeSparkFillPath = computed<string>(() => {
  const p = crimeSparkPath.value
  if (!p) return ''
  return `${p} L300 52 L0 52 Z`
})
const crimeSparkLabels = computed(() => {
  const rows: Array<{ month: string; count: number }> =
    enrichmentCrime.value?.monthlyTrend ?? []
  if (rows.length === 0) return { first: '', mid: '', last: '' }
  const first = rows[0]?.month ?? ''
  const last = rows[rows.length - 1]?.month ?? ''
  const mid = rows[Math.floor(rows.length / 2)]?.month ?? ''
  const humanise = (ym: string) => {
    // month is "YYYY-MM" per data.police.uk convention.
    const [y, m] = ym.split('-').map((s) => parseInt(s, 10))
    if (!y || !m) return ym
    const short = new Date(y, m - 1, 1).toLocaleString('en-GB', {
      month: 'short',
    })
    return `${short} ${String(y).slice(2)}`
  }
  return { first: humanise(first), mid: humanise(mid), last: humanise(last) }
})
const crimeTrendChipLabel = computed(() => {
  const pct = enrichmentCrime.value?.yoyChangePct
  const dir = enrichmentCrime.value?.trendDirection
  if (typeof pct !== 'number' || dir === 'flat') return ''
  const arrow = pct >= 0 ? '↑' : '↓'
  return `${arrow} ${Math.abs(pct)}% year on year`
})
const crimeWindowLabel = computed(() => {
  const rows: Array<{ month: string; count: number }> =
    enrichmentCrime.value?.monthlyTrend ?? []
  if (rows.length === 0) return 'Last 12 months'
  const last = rows[rows.length - 1]?.month ?? ''
  const [y, m] = last.split('-').map((s) => parseInt(s, 10))
  if (!y || !m) return 'Last 12 months'
  const short = new Date(y, m - 1, 1).toLocaleString('en-GB', { month: 'long' })
  return `12 months to ${short} ${y}`
})

// Category bars — visible slice honours group filter + "show all" state.
const crimeAllCats = computed<
  Array<{ category: string; label: string; count: number }>
>(() => {
  return enrichmentCrime.value?.byCategory ?? []
})
const crimeFilteredCats = computed(() => {
  const list = crimeAllCats.value
  if (crimeGroup.value === 'all') return list
  return list.filter((c) => crimeGroupFor(c.category) === crimeGroup.value)
})
const crimeVisibleCats = computed(() => {
  const list = crimeFilteredCats.value
  if (crimeGroup.value !== 'all' || crimeExpandedAll.value) return list
  return list.slice(0, 5)
})
const crimeMaxCount = computed(() => {
  const list = crimeAllCats.value
  if (!list.length) return 1
  return Math.max(...list.map((c) => c.count))
})
function scaledCount(raw: number): number {
  return Math.round(raw * CRIME_RADIUS_META[crimeRadius.value].scale)
}
function crimeBarPct(raw: number): number {
  const max = crimeMaxCount.value
  if (max <= 0) return 0
  return Math.min(100, Math.round((raw / max) * 100))
}

// True when OpenStreetMap's Overpass servers couldn't be reached server-side
// (e.g. non-UK dev machine where all mirrors block). Used to distinguish
// "we couldn't fetch" from "there genuinely are no stations" in transport
// empty states. UK/EU production deployment usually resolves this.
const transportLookupFailed = computed<boolean>(
  () => (enrichment.value as any)?.nearby?.transportLookupFailed === true,
)
// Airports run as their own Overpass batch on the backend (150 km radius
// is too heavy to fold into the same query as 4 km station/bus searches).
// A failed airports lookup must NOT mark trains and buses as unavailable.
const airportsLookupFailed = computed<boolean>(
  () => (enrichment.value as any)?.nearby?.airportsLookupFailed === true,
)

// ─── New CTAs wired from the prototype passport card + secondary row ───────
// Override the earlier stubs so the buttons + tiles open the right sheet.
function onWatchClickSheet() {
  openSheet('watch')
}
function onContactClickSheet() {
  openSheet('owner')
}
function onAccessPassportSheet() {
  // Owner with claimed passport → route to the live passport view.
  const s = passportStatus.value
  if (s?.hasPassport && s?.passportId) {
    router.push(`/passportview/${s.passportId}`)
    return
  }
  // Otherwise show the £99 unlock sheet (matches prototype's sheetPassport).
  openSheet('passport')
}
function onClaimExplain() {
  // Tap the "?" button on a passport card → state-matching explainer.
  if (pageState.value === 'published') openSheet('explain-published')
  else if (pageState.value === 'progress') openSheet('explain-progress')
  else openSheet('explain-unclaimed')
}

// Sheet shell helpers
const TALL_SHEETS = new Set<SheetKey>([
  'history',
  'street',
  'schools',
  'transport',
  'map',
  'flood',
  'planning',
  'llc',
  'stamp-duty',
  'passport',
  'explain-unclaimed',
  'explain-progress',
  'explain-published',
])
const isTallSheet = computed(() =>
  activeSheet.value ? TALL_SHEETS.has(activeSheet.value) : false,
)

function formatSoldDate(d: string): string {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function ordinalSuffix(n: number): string {
  const lastTwo = n % 100
  if (lastTwo >= 11 && lastTwo <= 13) return 'th'
  switch (n % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

// Buyer-unlock (£99) — opens the Stripe payment drawer. The drawer handles
// the create-intent → confirm-card → unlock-passport sequence and emits
// `@claimed` with the passport id on success.
const showUnlockDrawer = ref(false)
function onPassportUnlock() {
  if (!passportStatus.value?.passportId) {
    showToast({
      message: 'No published Passport to unlock for this property yet.',
      iconEmoji: 'ℹ️',
    })
    return
  }
  closeSheet()
  showUnlockDrawer.value = true
}
function onPassportUnlocked(passportId: string) {
  showUnlockDrawer.value = false
  router.push(`/buyer-passport/${passportId}`)
}

// ─── Make Contact form state ───────────────────────────────────────────────
type ContactRole = 'Potential buyer' | 'Neighbour' | 'Agent'
type ContactReplyPref = 'Email' | 'Phone' | 'Either'
const contactRole = ref<ContactRole>('Potential buyer')
const contactName = ref('')
const contactMessage = ref('')
const contactReplyPref = ref<ContactReplyPref>('Email')
const contactSubmitting = ref(false)
const contactError = ref('')

// Contact chip option lists — icon name maps to a PNG in /op-icons/makeContact.
const contactRoles: Array<{ value: ContactRole; label: string; icon: string }> =
  [
    { value: 'Potential buyer', label: 'Potential buyer', icon: 'buyer' },
    { value: 'Neighbour', label: 'Neighbour', icon: 'neighbour' },
    { value: 'Agent', label: 'Agent', icon: 'agent' },
  ]
const contactReplyChoices: Array<{
  value: ContactReplyPref
  label: string
  icon: string
}> = [
  { value: 'Email', label: 'Email', icon: 'email' },
  { value: 'Phone', label: 'Phone', icon: 'phone' },
  { value: 'Either', label: 'Either', icon: 'either' },
]

// Message placeholder swaps based on the picked role so the textarea gives a
// natural starting point ("Hi — I've been following this road…" for buyers,
// "Hi — your hedge is hanging over my driveway…" for neighbours, etc.).
const contactPlaceholder = computed(() => {
  switch (contactRole.value) {
    case 'Neighbour':
      return "Hi — I'm at number 23. Just wanted to introduce myself / mention the front hedge / ask if you'd consider repainting the shared fence."
    case 'Agent':
      return "Hi — I represent buyers looking on this road. I'd be happy to have a no-pressure conversation about a future sale."
    case 'Potential buyer':
    default:
      return "Hi — I've been following this road for a while and would love to know if you'd ever consider selling. No pressure at all."
  }
})

// Reset the form whenever the sheet is closed so we don't re-show stale state.
watch(activeSheet, (s) => {
  if (s !== 'owner') {
    contactError.value = ''
    contactSubmitting.value = false
  }
})

// ─── Watch / Register Interest form ────────────────────────────────────────
const watchName = ref('')
const watchEmail = ref('')
const watchReason = ref<'Potential buyer' | 'I love the road' | 'Investor'>(
  'Potential buyer',
)
const watchTrigger = ref<'Listed for sale' | 'Passport live' | 'Any update'>(
  'Listed for sale',
)
const watchSubmitting = ref(false)
const watchError = ref('')

watch(activeSheet, (s) => {
  if (s !== 'watch') {
    watchError.value = ''
    watchSubmitting.value = false
  }
})

async function submitWatch() {
  watchError.value = ''
  if (!watchEmail.value.trim() || !/.+@.+\..+/.test(watchEmail.value)) {
    watchError.value = 'Add a valid email so we can alert you.'
    return
  }
  watchSubmitting.value = true
  try {
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    // POST to the existing /register-interest endpoint (used by the legacy
    // RegisterInterestContent). Guests can submit too — the endpoint accepts
    // an unauthenticated body with name + email.
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId}/register-interest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          interestLevel: watchReason.value,
          name: watchName.value.trim() || undefined,
          userEmail: watchEmail.value.trim(),
          // The trigger preference flows through as part of the notes field
          // until the schema explicitly captures it.
          notes: `Alert me when: ${watchTrigger.value}`,
        }),
      },
    )
    if (!res.ok) {
      watchError.value = "Couldn't save right now — please try again."
      return
    }
    closeSheet()
    showToast({
      message: "Saved — we'll keep you posted",
      icon: '/op-icons/misc/bell.png',
    })
    watchName.value = ''
    watchEmail.value = ''
  } catch {
    watchError.value = 'Network error — please try again.'
  } finally {
    watchSubmitting.value = false
  }
}

async function submitOwnerContact() {
  contactError.value = ''
  if (!contactMessage.value.trim()) {
    contactError.value = 'Add a short message before sending.'
    return
  }
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  // The /tap-owner endpoint requires JWT — auth-gate guests with a
  // redirect back to this page so they can resume the conversation.
  if (!token) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'redirectAfterLogin',
        `/property/${propertyId}?openSheet=owner`,
      )
    }
    closeSheet()
    router.push('/onboarding/signin')
    return
  }
  contactSubmitting.value = true
  try {
    const fullMessage = [
      `Role: ${contactRole.value}`,
      contactName.value.trim() ? `From: ${contactName.value.trim()}` : null,
      `Reply preference: ${contactReplyPref.value}`,
      '',
      contactMessage.value.trim(),
    ]
      .filter((l) => l !== null)
      .join('\n')
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId}/tap-owner`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: fullMessage,
          sharePhone: contactReplyPref.value !== 'Email',
        }),
      },
    )
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      contactError.value =
        data?.message ||
        "Couldn't send the message. Please try again in a moment."
      return
    }
    closeSheet()
    contactMessage.value = ''
    showToast({ message: 'Message sent to the owner', iconEmoji: '✉️' })
  } catch {
    contactError.value = 'Network error — please try again.'
  } finally {
    contactSubmitting.value = false
  }
}

// ─── Sheet content sourced from the enrichment endpoint ───────────────────
// `enrichment.value` is hydrated on mount from `/property/:id/enrichment`,
// which already aggregates OS NGD schools, Overpass trains/buses/parks/
// airports, Ofcom broadband + mobile signal, EA flood zones, etc.

const enrichmentSchools = computed<any[]>(
  () => enrichment.value?.nearby?.schools ?? [],
)
const enrichmentTrains = computed<any[]>(
  () => enrichment.value?.nearby?.trains ?? [],
)
const enrichmentBuses = computed<any[]>(
  () => enrichment.value?.nearby?.busStops ?? [],
)
const enrichmentAirports = computed<any[]>(
  () => enrichment.value?.nearby?.airports ?? [],
)
const enrichmentParks = computed<any[]>(
  () => enrichment.value?.nearby?.parks ?? [],
)
const enrichmentAmenities = computed<any[]>(
  () => enrichment.value?.nearby?.amenities ?? [],
)
// Group amenities by category, then pick the nearest 1-2 of each for the list
const amenitiesByCategory = computed<Record<string, any[]>>(() => {
  const groups: Record<string, any[]> = {}
  for (const a of enrichmentAmenities.value) {
    const key = a.category || 'Other'
    if (!groups[key]) groups[key] = []
    groups[key].push(a)
  }
  return groups
})
const enrichmentBroadband = computed<any | null>(
  () => enrichment.value?.broadband ?? null,
)
const enrichmentMobile = computed<any | null>(
  () => enrichment.value?.mobileSignal ?? null,
)

// User-facing placeholder copy. The backend distinguishes half a dozen
// failure modes (missing key, quota, timeout, no coverage on file, …)
// but consumers don't care WHY we couldn't fetch — they just want a
// working answer. Split into two buckets:
//   - "no_premises" / "not_found" → Ofcom really has nothing on file
//   - everything else → treat as an internal fetch problem and point
//     the user straight at Ofcom's own checker (link rendered in the
//     template) so they can look it up themselves.
const broadbandPlaceholder = computed<{ title: string; sub: string }>(() => {
  const bb = enrichmentBroadband.value
  const reason = bb && bb.available === false ? bb.reason : null
  if (reason === 'not_found' || reason === 'no_premises') {
    return {
      title: 'No coverage on file for this postcode',
      sub: 'Ofcom has no entries for this postcode yet — check their official checker below.',
    }
  }
  return {
    title: 'Broadband data unavailable',
    sub: 'We couldn’t load broadband coverage for this postcode. Check directly on Ofcom’s checker below.',
  }
})

function formatMbps(v: any): string {
  const n = Number(v) || 0
  if (n >= 1000) return `${(n / 1000).toFixed(1)} Gbps`
  return `${Math.round(n)} Mbps`
}

// Ofcom mobile-signal data is keyed per-network — flatten into a render-ready
// list with a Good/Limited/Poor verdict per operator. Renamed to avoid
// collision with the static `mobileOperators` list from the legacy script.
const mobileOperatorRows = computed(() => {
  const m = enrichmentMobile.value
  if (!m) return []
  const ops: Array<{ label: string; summary: string; colour: string }> = []
  const verdict = (op: any): { text: string; cls: string } => {
    if (!op) return { text: 'No data', cls: '' }
    const has5g = (op.data5g ?? '').toLowerCase().includes('high')
    const data4gStr = String(op.data4g ?? '').toLowerCase()
    const has4g = data4gStr.includes('high') || data4gStr.includes('strong')
    const noService =
      data4gStr.includes('none') || data4gStr.includes('no signal')
    if (has5g) return { text: 'Strong · 5G', cls: 'pps-ds-v--green' }
    if (has4g) return { text: 'Strong · 4G', cls: 'pps-ds-v--green' }
    if (noService) return { text: 'No service', cls: 'pps-ds-v--red' }
    return { text: 'Limited', cls: 'pps-ds-v--amber' }
  }
  for (const [label, op] of [
    ['EE', m.EE],
    ['O2', m.O2],
    ['Three', m.Three],
    ['Vodafone', m.Vodafone],
  ] as const) {
    const v = verdict(op)
    ops.push({ label, summary: v.text, colour: v.cls })
  }
  return ops
})

// ── Transport / Buses / Broadband sheet helpers ──────────────────────────────
// walkMinutes() lives higher up (added for the Schools sheet). Reused here.

// Transport (rail-only). Bus/road tabs skipped — Buses has its own sheet.
const trainOpen = ref(-1)

// Planning applications sheet — one row expanded at a time.
const planningOpen = ref(-1)

// Property-details headline mini-stats. Only rows with a value render.
const propertyDetailStats = computed(() => {
  const p: any = property.value
  const out: Array<{ label: string; value: string }> = []
  if (!p) return out
  if (p.bedrooms)
    out.push({
      label: p.bedrooms === 1 ? 'Bedroom' : 'Bedrooms',
      value: String(p.bedrooms),
    })
  if (p.bathrooms)
    out.push({
      label: p.bathrooms === 1 ? 'Bathroom' : 'Bathrooms',
      value: String(p.bathrooms),
    })
  const sqft =
    p.sqft ||
    (p.floorAreaSqm ? Math.round(Number(p.floorAreaSqm) * 10.7639) : 0)
  if (sqft) out.push({ label: 'sq ft', value: sqft.toLocaleString() })
  if (p.yearBuilt) out.push({ label: 'Built', value: String(p.yearBuilt) })
  return out.slice(0, 3)
})

// Buses. Live-timetable / route data isn't in our OSM feed yet, so the
// UI degrades gracefully: sort by walk-distance is the only meaningful axis.
const busOpen = ref(-1)
const busSortMode = ref<'walk' | 'name'>('walk')
const sortedBuses = computed(() => {
  const list = enrichmentBuses.value.slice()
  if (busSortMode.value === 'walk') {
    list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
  } else {
    list.sort((a, b) =>
      String(a.name || '').localeCompare(String(b.name || '')),
    )
  }
  return list
})
watch(busSortMode, () => {
  busOpen.value = -1
})
const busStats = computed(() => {
  const list = enrichmentBuses.value
  const within10 = list.filter(
    (b) => walkMinutes(b.distanceKm || 0) <= 10,
  ).length
  return { total: list.length, within10 }
})

// Broadband headline: pick the biggest advertised speed and derive a 0-100
// position on the UK-availability gradient scale (30 Mbps = Superfast marker,
// 300 Mbps = Ultrafast, 1000 Mbps = Gigabit).
const broadbandBig = computed(() => {
  const bb = enrichmentBroadband.value
  const speed = Number(bb?.maxDownload) || 0
  const value =
    speed >= 1000 ? (speed / 1000).toFixed(1) : String(Math.round(speed))
  const unit = speed >= 1000 ? 'Gbps' : 'Mbps'
  // Map speed → 0-100 on a piecewise scale so the marker lands sensibly on
  // the four labeled segments (Under 30 / Superfast / Ultrafast / Gigabit).
  let pos = 0
  if (speed <= 0) pos = 0
  else if (speed < 30) pos = (speed / 30) * 25
  else if (speed < 300) pos = 25 + ((speed - 30) / 270) * 35
  else if (speed < 1000) pos = 60 + ((speed - 300) / 700) * 30
  else pos = Math.min(100, 90 + ((speed - 1000) / 1000) * 10)

  let sub = ''
  if (bb?.fttp) {
    sub =
      '<b>Full fibre (FTTP)</b> is available here — a direct fibre connection to the property.'
  } else if (bb?.cable) {
    sub = '<b>Cable</b> is available here from Virgin Media (DOCSIS).'
  } else if (bb?.ultrafast) {
    sub = 'Ultrafast broadband is available at this postcode.'
  } else if (bb?.superfast) {
    sub = 'Superfast broadband is available at this postcode.'
  } else if (bb?.fttc) {
    sub = 'The fastest option is <b>a copper line from the street cabinet</b>.'
  } else {
    sub = 'Standard broadband is listed — an upgrade may be possible.'
  }
  return { value, unit, sub, pos }
})

// Networks list — one row per tech Ofcom reports at this postcode. Speeds are
// the Ofcom "max advertised" numbers where we have them; otherwise the
// canonical ceiling for the tech.
const broadbandNetworks = computed(() => {
  const bb = enrichmentBroadband.value
  if (!bb || !bb.available) return []
  const rows: Array<{
    name: string
    tech: string
    speedMbps: number
    pct: number
    fibre: boolean
  }> = []
  if (bb.fttp) {
    rows.push({
      name: 'Openreach / altnets',
      tech: 'Full fibre (FTTP)',
      speedMbps: Number(bb.maxDownload) || 1000,
      pct: 0,
      fibre: true,
    })
  }
  if (bb.cable) {
    rows.push({
      name: 'Virgin Media',
      tech: 'Cable (DOCSIS)',
      speedMbps: 1130,
      pct: 0,
      fibre: false,
    })
  }
  if (bb.ultrafast && !bb.fttp && !bb.cable) {
    rows.push({
      name: 'Ultrafast',
      tech: 'Ultrafast',
      speedMbps: Number(bb.maxUfDownload) || 300,
      pct: 0,
      fibre: false,
    })
  }
  if (bb.fttc) {
    rows.push({
      name: 'Openreach',
      tech: 'Copper (FTTC)',
      speedMbps: bb.fttp ? 76 : Math.min(80, Number(bb.maxDownload) || 40),
      pct: 0,
      fibre: false,
    })
  }
  if (!rows.length) {
    rows.push({
      name: 'Standard',
      tech: 'ADSL',
      speedMbps: Number(bb.maxDownload) || 11,
      pct: 0,
      fibre: false,
    })
  }
  const max = Math.max(1, ...rows.map((r) => r.speedMbps))
  return rows.map((r) => ({ ...r, pct: (r.speedMbps / max) * 100 }))
})

// Impact bullets — what the fastest available speed actually supports.
const broadbandImpact = computed<string[]>(() => {
  const bb = enrichmentBroadband.value
  if (!bb || !bb.available) return []
  const speed = Number(bb.maxDownload) || 0
  const out: string[] = []
  if (speed >= 500) {
    out.push(
      '<b>Comfortably supports</b> several 4K streams, video calls and large file transfers at once.',
    )
    if (bb.fttp) {
      out.push(
        'Full fibre is <b>symmetric on some packages</b> — relevant if anyone uploads large files or runs a home server.',
      )
    }
    out.push(
      'Multiple networks at this postcode means <b>real price competition</b>, which is unusual and worth something.',
    )
  } else if (speed >= 60) {
    out.push(
      '<b>Handles most households comfortably</b> — one 4K stream plus HD calls should be fine.',
    )
    out.push('Not gigabit but rarely a bottleneck for day-to-day use.')
  } else if (speed >= 30) {
    out.push(
      '<b>One 4K stream at a time.</b> Two people on simultaneous video calls may struggle.',
    )
    out.push(
      'Copper speeds fall with distance from the cabinet, so <b>this address may get less than the headline figure.</b>',
    )
  } else {
    out.push(
      '<b>Standard broadband only.</b> Streaming and video calls will be limited.',
    )
    out.push(
      'Ask the seller what they actually get, and <b>check whether a fibre build is planned</b> — altnets often publish rollout maps.',
    )
  }
  return out
})

// Map a Good/Limited/Poor/No-service verdict from mobileOperatorRows into
// a filled/half/empty three-dot visual for the broadband sheet.
function mobileDotClass(op: any, i: number): string {
  const s = String(op?.summary || '').toLowerCase()
  const filled = s.includes('strong')
    ? 3
    : s.includes('limited')
    ? 2
    : s.includes('no service')
    ? 0
    : 1
  if (i > filled) return ''
  if (filled === 3) return 'pps-bb-dot-full'
  return 'pps-bb-dot-on'
}

// ── Leaflet map ────────────────────────────────────────────────────────────────
const mapEl = ref<HTMLElement | null>(null)
let mapInstance: any = null
let mapInitialised = false

const loadLeaflet = (): Promise<any> =>
  new Promise((resolve) => {
    if ((window as any).L) return resolve((window as any).L)
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve((window as any).L)
    document.head.appendChild(script)
  })

async function initMap() {
  if (!mapEl.value || !property.value) return
  const lat = property.value.latitude
  const lng = property.value.longitude
  if (!lat || !lng) return

  const L = await loadLeaflet()
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }

  const map = L.map(mapEl.value, { zoomControl: false }).setView([lat, lng], 15)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)
  mapInstance = map

  const markerIcon = L.divIcon({
    className: '',
    html: `<div style="width:42px;height:42px;border-radius:50%;background:#00a19a;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,161,154,0.6);border:3px solid white;">
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" stroke-width="2" fill="rgba(255,255,255,0.25)"/>
        <path d="M9 22V12h6v10" stroke="white" stroke-width="2"/>
      </svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  })
  L.marker([lat, lng], { icon: markerIcon }).addTo(map)

  function makeDivIcon(color: string, emoji: string) {
    return L.divIcon({
      className: '',
      html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.3);font-size:15px;">${emoji}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })
  }

  const addTitleBoundary = () => {
    const boundary = enrichment.value?.titleBoundary
    if (!boundary?.geometry) return
    try {
      L.geoJSON(boundary.geoJson, {
        style: {
          color: '#00a19a',
          weight: 2,
          dashArray: '6 4',
          fillColor: '#00a19a',
          fillOpacity: 0.12,
        },
      }).addTo(map)
    } catch {
      /* non-critical */
    }
  }

  const addPois = () => {
    const n = enrichment.value?.nearby ?? {}
    for (const s of n.schools ?? []) {
      if (s.lat && s.lon)
        L.marker([s.lat, s.lon], { icon: makeDivIcon('#3b82f6', '') })
          .bindPopup(s.name)
          .addTo(map)
    }
    for (const t of n.trains ?? []) {
      if (t.lat && t.lon)
        L.marker([t.lat, t.lon], { icon: makeDivIcon('#8b5cf6', '') })
          .bindPopup(t.name)
          .addTo(map)
    }
    for (const b of n.busStops ?? []) {
      if (b.lat && b.lon)
        L.marker([b.lat, b.lon], { icon: makeDivIcon('#f59e0b', '') })
          .bindPopup(b.name)
          .addTo(map)
    }
    for (const p of n.parks ?? []) {
      if (p.lat && p.lon)
        L.marker([p.lat, p.lon], { icon: makeDivIcon('#00a19a', '') })
          .bindPopup(p.name)
          .addTo(map)
    }
    for (const a of n.airports ?? []) {
      if (a.lat && a.lon)
        L.marker([a.lat, a.lon], { icon: makeDivIcon('#ec4899', '') })
          .bindPopup(a.name)
          .addTo(map)
    }
  }

  const applyEnrichment = () => {
    addPois()
    addTitleBoundary()
  }

  if (enrichment.value?.nearby || enrichment.value?.titleBoundary) {
    applyEnrichment()
  } else {
    const stop = watch(enrichment, (v) => {
      if (v) {
        applyEnrichment()
        stop()
      }
    })
  }
}

function switchLocTab(tab: LocTab) {
  activeLocTab.value = tab
  if (tab === 'map') {
    nextTick(() => {
      if (!mapInitialised) {
        mapInitialised = true
        initMap()
      } else if (mapInstance) mapInstance.invalidateSize()
    })
  } else if (tab === 'flood') {
    nextTick(() => {
      if (!floodMapInitialised && enrichment.value) {
        floodMapInitialised = true
        initFloodMap()
      } else if (floodMapInstance) {
        try {
          floodMapInstance.resize()
        } catch {
          /* noop */
        }
      }
    })
  }
}

// Separate computeds for the new individual transit tabs
const nearbyTrains = computed(() => enrichment.value?.nearby?.trains ?? [])
const nearbyBuses = computed(() => enrichment.value?.nearby?.busStops ?? [])
const nearbyAirports = computed(() => enrichment.value?.nearby?.airports ?? [])

// ── Flood map ──────────────────────────────────────────────────────────────────
const floodMapEl = ref<HTMLElement | null>(null)
let floodMapInstance: any = null
let floodMapInitialised = false

async function initFloodMap() {
  if (!enrichment.value) {
    const stop = watch(enrichment, async (v) => {
      if (v) {
        stop()
        await nextTick()
        initFloodMap()
      }
    })
    return
  }

  if (!floodMapEl.value || !property.value) return
  const lat = property.value.latitude
  const lng = property.value.longitude
  if (!lat || !lng) return

  const token = config.public.mapboxToken as string
  const osKey = config.public.osApiKey as string

  let mapboxgl: any
  try {
    mapboxgl = (await import('mapbox-gl')).default
  } catch {
    return
  }

  if (!document.querySelector('link[href*="mapbox-gl"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css'
    document.head.appendChild(link)
  }

  mapboxgl.accessToken = token || ''

  const mapStyle: any = osKey
    ? {
        version: 8,
        sources: {
          'os-raster': {
            type: 'raster',
            tiles: [
              `https://api.os.uk/maps/raster/v1/zxy/Light_3857/{z}/{x}/{y}.png?key=${osKey}`,
            ],
            tileSize: 256,
            attribution:
              '© Crown copyright and database rights 2024 Ordnance Survey',
          },
        },
        layers: [
          {
            id: 'os-raster',
            type: 'raster',
            source: 'os-raster',
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      }
    : 'mapbox://styles/mapbox/streets-v12'

  const fmap = new mapboxgl.Map({
    container: floodMapEl.value,
    style: mapStyle,
    center: [lng, lat],
    zoom: 12,
    interactive: true,
    attributionControl: false,
  })
  floodMapInstance = fmap

  const pin = document.createElement('div')
  pin.style.cssText =
    'width:14px;height:14px;border-radius:50%;background:#00a19a;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);'
  new mapboxgl.Marker({ element: pin }).setLngLat([lng, lat]).addTo(fmap)

  const zoneColour = (zone: any) => {
    const sev = (zone.severity ?? '').toLowerCase()
    if (sev.includes('severe') || sev.includes('warning')) return '#dc2626'
    if (sev.includes('alert') || sev.includes('high')) return '#ea580c'
    if (sev.includes('medium')) return '#f59e0b'
    return '#3b82f6'
  }

  fmap.on('load', () => {
    const currentZones = enrichment.value?.floodZones ?? []
    currentZones.forEach((zone: any, idx: number) => {
      if (!zone.polygon) return
      const sourceId = `flood-zone-${idx}`
      const colour = zoneColour(zone)
      try {
        fmap.addSource(sourceId, { type: 'geojson', data: zone.polygon })
        fmap.addLayer({
          id: `${sourceId}-fill`,
          type: 'fill',
          source: sourceId,
          paint: { 'fill-color': colour, 'fill-opacity': 0.25 },
        })
        fmap.addLayer({
          id: `${sourceId}-line`,
          type: 'line',
          source: sourceId,
          paint: { 'line-color': colour, 'line-width': 1.5 },
        })
      } catch {
        /* non-critical */
      }
    })

    if (!currentZones.some((z: any) => z.polygon)) {
      fmap.addSource('flood-radius', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: {},
        },
      })
      fmap.addLayer({
        id: 'flood-radius-circle',
        type: 'circle',
        source: 'flood-radius',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10,
            40,
            14,
            200,
          ],
          'circle-color': '#3b82f6',
          'circle-opacity': 0.15,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#3b82f6',
          'circle-stroke-opacity': 0.4,
        },
      })
    }
  })
}

// Initialise flood map when enrichment arrives
watch(enrichment, (v) => {
  if (v && !floodMapInitialised) {
    floodMapInitialised = true
    nextTick(() => initFloodMap())
  }
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
  if (floodMapInstance) {
    floodMapInstance.remove()
    floodMapInstance = null
  }
})

// ── Data loading ───────────────────────────────────────────────────────────────
onMounted(async () => {
  fetchProfile?.().catch(() => {})
  const apiBase = config.public.apiBase as string
  // Honour ?openSheet=<key> so a user returning from sign-in/sign-up after
  // tapping "Make contact" / "Watch this" lands back on that same sheet.
  const requestedSheet = (route.query?.openSheet as string | undefined)?.trim()
  const allowedAutoOpen: SheetKey[] = ['owner', 'watch', 'passport']
  if (
    requestedSheet &&
    (allowedAutoOpen as string[]).includes(requestedSheet)
  ) {
    activeSheet.value = requestedSheet as SheetKey
    // Strip the query so back-nav / refresh doesn't keep reopening it.
    router.replace({ path: route.path }).catch(() => {})
  }
  try {
    const [propData, statusData] = await Promise.all([
      getPropertyDetails(propertyId),
      getPassportStatus(propertyId),
      fetchActions(propertyId),
    ])
    if (!propData) {
      loadError.value = 'Property not found.'
    } else {
      property.value = propData
      recordExplored({
        id: propertyId,
        addressLine1: propData.addressLine1 ?? '',
        postcode: propData.postcode ?? null,
        city: propData.city ?? null,
        estimatedPrice: propData.estimatedPrice ?? null,
        lastSoldPrice: propData.lastSoldPrice ?? null,
        lastSoldDate: propData.lastSoldDate ?? null,
        image: propData.images?.[0] ?? propData.imageUrl ?? null,
      })
    }
    passportStatus.value = statusData

    // getPassportStatus() returns null on a genuine fetch failure (not a
    // "no passport" result). For a logged-in user that's worth a retry —
    // showing a confidently-wrong "unclaimed" card to someone who already
    // owns/published this passport could prompt them to pay again. Guests
    // are excluded: this endpoint is JWT-gated, so it always returns null
    // for them regardless of the real status — that's an existing,
    // separate limitation, not a fetch failure worth retrying.
    const hasToken =
      typeof localStorage !== 'undefined' && !!localStorage.getItem('token')
    if (hasToken && statusData === null) {
      const retryData = await getPassportStatus(propertyId)
      if (retryData !== null) {
        passportStatus.value = retryData
      } else {
        passportStatusUnknown.value = true
      }
    }
  } catch (err) {
    loadError.value = 'Failed to load property details.'
    console.error(err)
  } finally {
    pageLoading.value = false
    await nextTick()
    if (!mapInitialised) {
      mapInitialised = true
      initMap()
    }
  }

  // Resume a watch/save/claim/unlock started elsewhere (e.g. the HomeScore
  // PassportClaimBox or the Buyer Report) after the sign-in round-trip.
  if (route.query?.watched === '1') {
    router.replace({ path: route.path }).catch(() => {})
    await persistWatch({ silent: true })
    // Recover the prefs picked before the sign-in round-trip, if any —
    // falls back to WatchPropertyDrawer's own defaults if the guest never
    // actually saw that drawer (e.g. redirected here from elsewhere).
    let resumedPrefs = DEFAULT_WATCH_PREFS
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('pendingWatchPrefs')
      if (raw) {
        localStorage.removeItem('pendingWatchPrefs')
        try {
          resumedPrefs = { ...DEFAULT_WATCH_PREFS, ...JSON.parse(raw) }
        } catch {}
      }
    }
    await postWatchPrefs(resumedPrefs)
    watchConfirmedPrefs.value = resumedPrefs
    watchConfirmedOpen.value = true
  } else if (route.query?.save === '1') {
    router.replace({ path: route.path }).catch(() => {})
    const r = await toggleSave(propertyId)
    if (r !== 'unauthenticated' && r !== 'error') {
      showToast({ message: '❤️ Saved to your properties', duration: 2200 })
    }
  } else if (route.query?.claim === '1') {
    // Unclaimed claim CTA (from a HomeScore "claim property" link) arrives
    // here — go straight into the claim flow, same as goToClaim() below.
    // Passport type is no longer asked upfront: /claim/[id] now asks for
    // it once HM Land Registry has verified ownership.
    //
    // Awaited (unlike the save/unlock branches below, which don't chain
    // into a second navigation): goToClaim() immediately pushes /claim/
    // [id] on top of this history entry, and firing that push before this
    // replace has actually committed lets Vue Router's navigation queue
    // drop or reorder the replace — leaving the stale ?claim=1 URL sitting
    // in history instead of the clean one. Back from /claim/[id] would
    // then land on /property/[id]?claim=1, which re-triggers this exact
    // branch and bounces straight back into the claim flow instead of
    // showing the property page.
    await router.replace({ path: route.path }).catch(() => {})
    goToClaim()
  } else if (route.query?.unlock === '1') {
    // In-progress / published "buy the Passport" CTA arrives here — open
    // the £99 unlock drawer.
    router.replace({ path: route.path }).catch(() => {})
    showUnlockDrawer.value = true
  }

  // Enrichment (non-blocking)
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${apiBase}/property/${propertyId}/enrichment`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) enrichment.value = await res.json()
  } catch {
    /* non-critical */
  }

  // HomeScore
  try {
    const pubRes = await fetch(
      `${apiBase}/property/${propertyId}/homescore/public`,
    )
    if (pubRes.ok) {
      const hs = await pubRes.json()
      if (hs?.total) {
        homeScore.value = hs
        homeScoreIsAuto.value = false
      }
    }

    const token = localStorage.getItem('token')
    if (token && !homeScore.value) {
      const hsRes = await fetch(`${apiBase}/property/${propertyId}/homescore`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (hsRes.ok) {
        const hs = await hsRes.json()
        if (hs?.total) {
          homeScore.value = hs
          homeScoreIsAuto.value = false
        }
      }
    }

    if (!homeScore.value) {
      const saved = localStorage.getItem(`homescore_answers_${propertyId}`)
      if (saved) {
        const { answers } = JSON.parse(saved)
        if (answers && Object.keys(answers).length > 0) {
          const { calculateScore } = await import('~/utils/homescoreScoring')
          const base = calculateScore(answers)
          homeScore.value = {
            ...base.breakdown,
            total: base.total,
            rating: base.rating,
          }
          homeScoreIsAuto.value = Object.keys(answers).length < 11
        }
      }
    }
  } catch {
    /* non-critical */
  }

  // EPC auto-score fallback
  if (!homeScore.value) {
    try {
      const { getPrefillFromProperty, calculateScore } = await import(
        '~/utils/homescoreScoring'
      )
      const epcPrefill = property.value
        ? getPrefillFromProperty(property.value)
        : {}
      const base = calculateScore(epcPrefill)
      homeScore.value = {
        ...base.breakdown,
        total: base.total,
        rating: base.rating,
      }
      homeScoreIsAuto.value = true
    } catch {
      /* non-critical */
    }
  }
})

// ── Actions ────────────────────────────────────────────────────────────────────
function handlePassportAction() {
  // Delegate to the single ownership-aware router so every Passport CTA on
  // this page behaves identically.
  routeForPassportState()
}

// Inline claim CTA on the property page routes into the global /claim/[id]
// flow (KYC → Land Registry → passport issued).
function onClaimCtaClick() {
  goToClaim()
}

function goBack() {
  router.back()
}

function openRegisterInterest() {
  showUnpublishedModal.value = false
  showRegisterInterest.value = true
}

function tapOwner() {
  showUnpublishedModal.value = false
  router.push(`/owner/${propertyId}`)
}

function onInterestRegistered() {
  showRegisterInterest.value = false
  showToast({ message: 'Interest registered!', duration: 2000 })
}

function handleShare() {
  /* share logic */
}

function handleClaimed(passportId: string) {
  if (buyerModePassportId.value) router.push(`/buyer-passport/${passportId}`)
  else router.push(`/passportview/${passportId}`)
}

function formatSaleDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.inline-ic {
  width: 14px;
  height: 14px;
  object-fit: contain;
  vertical-align: -2px;
  display: inline-block;
  margin-right: 2px;
}
.pps-page {
  min-height: 100dvh;
  background: #f5f5f7;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  color: #231d45;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  padding-bottom: 24px;
}

.pps-loading-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #6b6783;
  font-size: 15px;
}
.pps-loading-skel {
  min-height: 100dvh;
}
.pps-skel-hero {
  width: 100%;
  height: 280px;
  border-radius: 0;
}
.pps-skel-body {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pps-skel-card {
  height: 140px;
}
.pps-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #ececef;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: pps-spin 0.9s linear infinite;
}
@keyframes pps-spin {
  to {
    transform: rotate(360deg);
  }
}
.pps-back-txt {
  background: none;
  border: 1px solid #ececef;
  border-radius: 9px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
}

/* ─── App header ────────────────────────────────────────────── */
.pps-app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(12px + env(safe-area-inset-top)) 18px 8px;
  background: white;
}
.pps-app-header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.pps-app-header-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}
.pps-app-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pps-app-header-help {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid #00a19a;
  background: none;
  color: #00a19a;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pps-app-header-avatar {
  cursor: pointer;
  display: flex;
}
.pps-back-link {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 4px 0 0 18px;
  padding: 6px 0;
  background: none;
  border: none;
  color: #00a19a;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* ─── Hero card (photo + identity side-by-side, one card) ────── */
.pps-hero-card {
  position: relative;
  margin: 12px 14px 0;
  padding: 14px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 4px 18px rgba(35, 29, 69, 0.06);
}
.pps-hero-card-top {
  display: flex;
  align-items: stretch;
  gap: 14px;
}
.pps-hero-photo {
  position: relative;
  flex: 0 0 40%;
  /* No aspect-ratio — stretches (align-items:stretch above) to match
     the identity column's full height, including the floating claim
     card nested at the bottom of it, so the photo always covers the
     hero card's full height rather than being a fixed-ratio box that
     may fall short or run long depending on that column's content. */
  border-radius: 14px;
  overflow: hidden;
  background: radial-gradient(
      ellipse 70% 80% at 50% 30%,
      rgba(0, 161, 154, 0.18),
      transparent 70%
    ),
    linear-gradient(135deg, #f1f9f4 0%, #e2f1ea 100%);
}
.pps-hero-photo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pps-hero-photo-count {
  position: absolute;
  z-index: 2;
  bottom: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: white;
  font-size: 11px;
  font-weight: 700;
}
.pps-hero-card-identity {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}
.pps-badge-flood--card {
  margin-top: 10px;
  display: inline-flex;
}
/* Colour-inverted variant for the price pill/state badge — used inline
   with the address title, not as a photo overlay. */
.pps-badge-passport {
  flex-shrink: 0;
  background: #e6f7f6;
  color: #007e78;
  border-radius: 20px;
  padding: 5px 11px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
  white-space: nowrap;
  margin-top: 3px;
}
.pps-badge-passport--unclaimed {
  background: #eeedf5;
  color: #6b6783;
}
.pps-badge-passport--progress {
  background: #fbefd9;
  color: #b07a1c;
}
.pps-badge-flood img {
  width: 15px;
  height: 15px;
  object-fit: contain;
  vertical-align: -3px;
  display: inline-block;
}
.pps-badge-flood {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.92);
  color: #c73e36;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
}

/* ─── Identity (right column of the hero card) ─────────────────── */
.pps-identity-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.pps-identity-address {
  font-size: 17px;
  font-weight: 800;
  color: #1a1535;
  line-height: 1.15;
}
.pps-identity-suburb {
  font-size: 12.5px;
  color: #888;
  margin-top: 2px;
}
.pps-price-row {
  margin-top: 8px;
  display: flex;
  align-items: baseline;
  gap: 0;
  flex-wrap: wrap;
}
.pps-price-value {
  font-size: 21px;
  font-weight: 800;
  color: #00a19a;
  line-height: 1.15;
}
.pps-price-source {
  font-size: 10px;
  color: #aaa;
  margin-left: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.pps-price-info {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: 1.3px solid #c0bdcc;
  background: none;
  color: #9c98ad;
  font-size: 10px;
  font-weight: 800;
  font-style: italic;
  font-family: Georgia, serif;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}
.pps-price-edit {
  border: none;
  background: none;
  color: #00a19a;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  padding: 0 0 0 6px;
  text-decoration: underline;
}
.pps-pill-row {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pps-pill {
  background: #f0f0f2;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 13px;
  color: #444;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.pps-hero-quick-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
.pps-hero-quick-btn {
  flex: 1 1 0;
  min-width: 0;
  background: white;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  padding: 7px 8px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1.2;
  color: #1a1535;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}
.pps-hero-quick-btn:hover {
  border-color: #231d45;
  box-shadow: 0 4px 12px rgba(35, 29, 69, 0.1);
}
.pps-hero-quick-ic {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

/* ─── Floating claim box ────────────────────────────────────────
   Normal-flow block inside the identity column, right after the
   Watch/Ask buttons — its vertical position is purely content-driven
   (no gap-guessing tied to a fixed photo height, which broke for
   shorter addresses). Widened past the identity column via a negative
   left margin so it still overlaps the photo on the left, matching the
   prototype. Two rows internally (icon+text on top, button+price
   below, both full box width) rather than one row with 3 flex items —
   on real (~360-400px) phone widths a single row left too little space
   for the text column and collapsed into unreadable word-by-word
   wrapping. */
.pps-float-claim {
  position: relative;
  z-index: 2;
  margin: 12px 0 0 -60px;
  width: calc(100% + 60px);
  padding: 14px 16px;
  background: white;
  border-radius: 14px;
  border: 1px solid #ececef;
  box-shadow: 0 8px 24px rgba(35, 29, 69, 0.14);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pps-float-claim-streetpill {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 6px;
  background: #231d45;
  color: white;
  font-size: 9.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
}
.pps-float-claim-streetpill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f0b429;
  flex-shrink: 0;
}
.pps-float-claim-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.pps-float-claim-ic-wrap {
  position: relative;
  flex-shrink: 0;
}
.pps-float-claim-ic {
  width: 52px;
  height: 78px;
  object-fit: contain;
  filter: drop-shadow(0 6px 10px rgba(35, 29, 69, 0.2));
}
/* Small circular completion gauge pinned to the top-right corner of the
   passport cover, per the prototype — a conic-gradient ring (no SVG
   needed) driven by the same --pct custom property the template sets
   from progressPct. */
.pps-float-claim-gauge {
  position: absolute;
  top: -8px;
  right: -10px;
  width: 25px;
  height: 24px;
  border-radius: 50%;
  background: conic-gradient(#00958f calc(var(--pct) * 1%), #e4e5ed 0);
  box-shadow: 0 2px 6px rgba(35, 29, 69, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pps-float-claim-gauge::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: #fff;
}
.pps-float-claim-gauge span {
  position: relative;
  z-index: 1;
  font-size: 7.5px;
  font-weight: 800;
  color: #00858a;
}
.pps-float-claim-body {
  flex: 1;
  min-width: 0;
}
.pps-float-claim-title {
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  line-height: 1.25;
}
.pps-float-claim-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: #6b6783;
  line-height: 1.4;
  margin-top: 3px;
}
.pps-float-claim-emphasis {
  font-size: 11px;
  font-weight: 800;
  color: #231d45;
  line-height: 1.4;
  margin-top: 6px;
}
.pps-float-claim-sub2 {
  font-size: 10.5px;
  font-weight: 700;
  color: #00857f;
  line-height: 1.4;
  margin-top: 3px;
}
.pps-float-claim-explain {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 7px;
  font-size: 10.5px;
  font-weight: 700;
  color: #6b6783;
  cursor: pointer;
}
.pps-float-claim-explain-q {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.3px solid #c0bdcc;
  color: #9c98ad;
  font-size: 9px;
  font-weight: 800;
  flex-shrink: 0;
}
.pps-float-claim-watchers {
  font-size: 10px;
  font-weight: 700;
  color: #00857f;
  margin-top: 5px;
}
.pps-float-claim-cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px 10px;
}
.pps-float-claim-btn {
  flex-shrink: 0;
  padding: 5px 18px;
  border-radius: 100px;
  background: #231d45;
  color: white;
  border: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}
.pps-float-claim-price {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: #00a19a;
}

/* ─── Score card ────────────────────────────────────────────── */
.pps-score-card {
  margin: 14px 14px 0;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid #231d45;
  box-shadow: 0 4px 20px rgba(35, 29, 69, 0.1);
  background: white;
}
.pps-score-card--clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.pps-score-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(35, 29, 69, 0.14);
}
/* Gentle "tap for more" nudge — the card has no hover state on touch, so
   without this there was nothing telling a mobile visitor it links
   through to the full HomeScore. Small and slow on purpose: a persistent
   badge on a card people may sit and read for a while shouldn't nag. */
.pps-score-tap-hint {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.75);
  display: grid;
  place-items: center;
  color: #00857f;
  z-index: 1;
  animation: pps-tap-hint-nudge 2.2s ease-in-out infinite;
}
.pps-score-tap-hint svg {
  width: 13px;
  height: 13px;
}
@keyframes pps-tap-hint-nudge {
  0%,
  20%,
  100% {
    transform: translateX(0);
    opacity: 0.85;
  }
  10% {
    transform: translateX(3px);
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .pps-score-tap-hint {
    animation: none;
  }
}
.pps-score-top {
  background: linear-gradient(135deg, #f2faf8 0%, #e5f4f2 100%);
  padding: 24px 22px 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 20px;
}
.pps-score-blob-tr {
  position: absolute;
  width: 180px;
  height: 180px;
  background: radial-gradient(
    circle,
    rgba(0, 161, 154, 0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
  top: -60px;
  right: -40px;
  pointer-events: none;
}
.pps-score-blob-bl {
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(
    circle,
    rgba(35, 29, 69, 0.04) 0%,
    transparent 70%
  );
  border-radius: 50%;
  bottom: -30px;
  left: -20px;
  pointer-events: none;
}
.pps-gauge-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  z-index: 1;
}
.pps-gauge-svg {
  width: 100px;
  height: 100px;
  transform: rotate(-90deg);
}
.pps-gauge-bg {
  fill: none;
  stroke: rgba(35, 29, 69, 0.1);
  stroke-width: 8;
}
.pps-gauge-fill {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 251.33;
  transition: stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.pps-gauge-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.pps-gauge-num {
  font-size: 28px;
  font-weight: 900;
  color: #231d45;
  line-height: 1;
}
.pps-gauge-denom {
  font-size: 11px;
  color: #9c98ad;
  margin-top: 1px;
}
.pps-score-info {
  flex: 1;
  z-index: 1;
}
.pps-score-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.pps-score-verdict {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.pps-score-desc {
  font-size: 13px;
  color: #6b6783;
  margin-top: 5px;
  line-height: 1.5;
}
.pps-score-epc-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  background: white;
  border: 1px solid #ececef;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  color: #444;
}
.pps-epc-dot {
  width: 6px;
  height: 6px;
  background: #e6a23c;
  border-radius: 50%;
  flex-shrink: 0;
}
.pps-score-bottom {
  background: white;
  padding: 16px 18px;
}
.pps-epc-header {
  font-size: 9px;
  font-weight: 800;
  color: #aaa;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.pps-epc-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pps-epc-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pps-epc-label {
  font-size: 13px;
  font-weight: 700;
  color: #333;
  width: 60px;
  flex-shrink: 0;
}
.pps-epc-track {
  flex: 1;
  height: 8px;
  background: #f0f0f2;
  border-radius: 4px;
  overflow: hidden;
}
.pps-bar-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 4px;
  width: 0%;
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.pps-epc-rating {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  width: 60px;
  text-align: right;
  flex-shrink: 0;
}

/* ─── Explore grid ──────────────────────────────────────────── */
.pps-explore-header {
  padding: 20px 16px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pps-explore-title {
  font-size: 15px;
  font-weight: 800;
  color: #1a1535;
}
.pps-explore-sources {
  font-size: 13px;
  color: #00a19a;
  font-weight: 700;
}
.pps-explore-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 14px;
}
.pps-tile {
  background: white;
  border-radius: 16px;
  padding: 16px 14px;
  cursor: pointer;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  border: 1.5px solid transparent;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}
.pps-tile:hover {
  transform: scale(1.03);
  border-color: #231d45;
  box-shadow: 0 8px 24px rgba(35, 29, 69, 0.12);
}
.pps-tile:active {
  transform: scale(0.97);
}
.pps-tile-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.pps-tile-icon--img {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: transparent !important;
  overflow: hidden;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.pps-tile-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pps-tile-title {
  font-size: 15px;
  font-weight: 800;
  color: #1a1535;
  margin-top: 10px;
}
.pps-tile-value {
  font-size: 15px;
  font-weight: 800;
  color: #00a19a;
  margin-top: 3px;
}
.pps-tile-sub {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.pps-tile-trend {
  font-size: 11px;
  font-weight: 700;
  color: #2eab55;
  margin-top: 4px;
}
.pps-tile-new-pip {
  display: inline-block;
  background: #00a19a;
  color: white;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.3px;
  border-radius: 4px;
  padding: 1px 5px;
  vertical-align: middle;
  margin-left: 3px;
}
.pps-tile-arrow {
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 12px;
  color: #ccc;
  line-height: 1;
}

/* ─── Keep going with umovingu (unclaimed) ─────────────────────── */
.pps-keepgoing {
  margin: 16px 14px 0;
  padding: 16px;
  background: #f4f5f9;
  border: 1px solid #e7e8f0;
  border-radius: 18px;
}
.pps-keepgoing-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
  text-align: center;
}
.pps-keepgoing-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: #6b6a82;
  line-height: 1.4;
  margin-top: 3px;
  text-align: center;
}
.pps-keepgoing-cards {
  display: flex;
  gap: 12px;
  margin-top: 14px;
}
.pps-keepgoing-card {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
}
.pps-keepgoing-card-ic {
  width: 72px;
  height: 72px;
  object-fit: contain;
  flex-shrink: 0;
}
.pps-keepgoing-card-ic--fan {
  width: 84px;
  height: 84px;
}
.pps-keepgoing-card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.pps-keepgoing-card-title {
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
}
.pps-keepgoing-card-sub {
  font-size: 10px;
  font-weight: 500;
  color: #6b6a82;
  line-height: 1.35;
  margin-top: 4px;
}
.pps-keepgoing-card-btn {
  margin-top: 8px;
  align-self: flex-start;
  background: #231d45;
  color: #fff;
  border: none;
  border-radius: 100px;
  padding: 5px 10px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}

/* ─── Passport card ─────────────────────────────────────────── */
.pps-passport-card {
  margin: 16px 14px 0;
  background: white;
  border-radius: 20px;
  padding: 22px;
  position: relative;
  overflow: hidden;
  border: 2px solid #231d45;
  box-shadow: 0 4px 20px rgba(35, 29, 69, 0.1);
}
.pps-passport-card--clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.pps-passport-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(35, 29, 69, 0.16);
}
.pps-passport-eyebrow-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pps-passport-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 2px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pps-passport-eyebrow-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: #00a19a;
  flex-shrink: 0;
}
.pps-passport-price-pill {
  background: #f2faf8;
  color: #007e78;
  font-size: 12px;
  font-weight: 800;
  border-radius: 20px;
  padding: 3px 10px;
  border: 1px solid #e5f4f2;
}
.pps-passport-title {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  margin-top: 8px;
}
.pps-passport-explain {
  border-radius: 0 8px 8px 0;
  padding: 9px 12px;
  margin-top: 10px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.pps-explain-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  font-family: inherit;
}
.pps-explain-btn:hover {
  transform: scale(1.05);
}
.pps-passport-explain--unclaimed {
  background: #f5f3ff;
  border-left: 3px solid #231d45;
}
.pps-passport-explain--progress {
  background: #e6f7f6;
  border-left: 3px solid #00a19a;
  margin-bottom: 14px;
}
.pps-passport-explain--published {
  background: #fef9f0;
  border-left: 3px solid #d4822a;
  margin-bottom: 14px;
}
.pps-passport-explain-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.pps-passport-explain-body {
  font-size: 12px;
  color: #4a4560;
  line-height: 1.5;
}

/* Stepper for unclaimed */
.pps-pp-stepper {
  display: flex;
  align-items: center;
  margin: 18px 0 16px;
}
.pps-pp-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 auto;
  position: relative;
}
.pps-pp-step-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f0f0f2;
  color: #9c98ad;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 800;
  transition: all 0.15s ease;
}
.pps-pp-step--active .pps-pp-step-dot {
  background: #231d45;
  color: white;
}
.pps-pp-step-label {
  font-size: 11px;
  font-weight: 700;
  color: #9c98ad;
  margin-top: 6px;
}
.pps-pp-step--active .pps-pp-step-label {
  color: #231d45;
}
.pps-pp-step-line {
  flex: 1;
  height: 2px;
  background: #f0f0f2;
  margin: 0 4px;
  margin-bottom: 18px;
}

/* Progress bar (used by in-progress + published) */
.pps-progress-bar-wrap {
  margin: 14px 0 4px;
  background: #ececef;
  border-radius: 100px;
  height: 10px;
  overflow: hidden;
}
.pps-progress-bar-fill {
  background: linear-gradient(90deg, #00a19a, #00b6ae);
  border-radius: 100px;
  height: 100%;
  width: 0%;
  transition: width 1s 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.pps-progress-label {
  font-size: 12px;
  color: #9c98ad;
  text-align: right;
}

/* Feature list */
.pps-passport-features {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pps-passport-feature {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pps-feature-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pps-feature-icon--verified {
  background: #e5f4f2;
}
.pps-feature-icon--locked {
  background: #f5f5f7;
}
.pps-feature-text-title--verified {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.pps-feature-text-title--locked {
  font-size: 15px;
  font-weight: 800;
  color: #c0bdcc;
}
.pps-feature-text-sub {
  font-size: 12px;
  color: #9c98ad;
  margin-top: 1px;
}

.pps-passport-cta {
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
  transition: all 0.15s ease;
  position: relative;
  z-index: 1;
}
.pps-passport-cta:hover {
  transform: translateY(-1px);
}
.pps-passport-cta-sub {
  font-size: 11px;
  color: #9c98ad;
  text-align: center;
  margin-top: 8px;
}

/* ─── Costs card ────────────────────────────────────────────── */
.pps-costs-card {
  margin: 14px 14px 0;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #231d45;
  box-shadow: 0 4px 20px rgba(35, 29, 69, 0.08);
  background: white;
}
.pps-costs-header {
  background: linear-gradient(135deg, #fbefd9 0%, #f5e0b5 100%);
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0dc80;
}
.pps-costs-header-title {
  font-size: 15px;
  font-weight: 800;
  color: #7a3a05;
}
.pps-costs-header-sub {
  font-size: 12px;
  color: #c18a38;
}
.pps-costs-body {
  background: white;
  padding: 16px 18px;
}
.pps-costs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pps-costs-box {
  border: 1px solid #ececef;
  border-radius: 10px;
  perspective: 600px;
  height: 68px;
}
.pps-costs-box-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.42s cubic-bezier(0.4, 0.2, 0.2, 1);
  border-radius: 10px;
}
.pps-costs-box:hover .pps-costs-box-inner {
  transform: rotateY(180deg);
}
.pps-costs-box-front,
.pps-costs-box-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
}
.pps-costs-box-back {
  transform: rotateY(180deg);
  background: #231d45;
}
.pps-costs-box-back-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.pps-costs-box-back-val {
  font-size: 15px;
  font-weight: 800;
  color: white;
}
.pps-costs-box--highlight {
  border-color: #00a19a;
  border-width: 1.5px;
}
.pps-costs-box--highlight .pps-costs-box-front {
  background: #f2faf8;
  border-radius: 10px;
}
.pps-costs-box--highlight .pps-costs-box-back {
  background: #007e78;
}
.pps-costs-box-value {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
}
.pps-costs-box--highlight .pps-costs-box-value {
  color: #007e78;
}
.pps-costs-box-label {
  font-size: 11px;
  color: #999;
  margin-top: 3px;
}
.pps-costs-attr {
  font-size: 12px;
  color: #bbb;
  font-style: italic;
  margin-top: 12px;
}

/* ─── Details card ──────────────────────────────────────────── */
.pps-details-card {
  margin: 14px 14px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  background: white;
}

/* ── Property Details bottom-sheet content ──────────────────────
   Rendered inside the shared .pps-sheet container when the
   'property-details' explore tile is tapped. Rows follow the same
   pattern as ProfileRow — icon + label/value stack — so the sheet
   feels familiar. */
.pps-pd-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0 12px;
}
.pps-pd-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f9f9fb;
  border-radius: 12px;
}
.pps-pd-row-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.pps-pd-row-body {
  flex: 1;
  min-width: 0;
}
.pps-pd-row-label {
  font-size: 10px;
  font-weight: 800;
  color: #aaa;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.pps-pd-row-value {
  font-size: 15px;
  font-weight: 700;
  color: #0e2840;
  margin-top: 2px;
  overflow-wrap: anywhere;
}
.pps-pd-row-value--mono {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.pps-pd-download {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.pps-pd-download:hover {
  background: #008a84;
}
.pps-pd-download:disabled {
  background: #b4b5b8;
  cursor: not-allowed;
}
.pps-pd-empty {
  padding: 24px 12px;
  text-align: center;
  font-size: 13px;
  color: #8f9094;
}
.pps-details-header {
  padding: 14px 16px 0;
  font-size: 15px;
  font-weight: 800;
  color: #1a1535;
}
.pps-details-sub {
  padding: 4px 16px 0;
  font-size: 12px;
  font-weight: 600;
  color: #6b6783;
  line-height: 1.45;
}
button.pps-detail-tile {
  border: 1.5px solid transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  width: 100%;
}
button.pps-detail-tile.pps-detail-tile--clickable:hover {
  border-color: #00a19a;
  background: white;
}
.pps-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 10px 14px 14px;
}
.pps-detail-tile {
  padding: 12px;
  border-radius: 10px;
  background: #f9f9fb;
  border: 1.5px solid transparent;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pps-detail-tile:hover {
  transform: translateY(-3px) scale(1.02);
  border-color: #231d45;
  background: white;
  box-shadow: 0 6px 18px rgba(35, 29, 69, 0.1);
}
.pps-detail-tile-icon {
  font-size: 16px;
  margin-bottom: 6px;
  display: block;
}
.pps-detail-tile-icon-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 6px;
  display: block;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.pps-detail-label {
  font-size: 9px;
  font-weight: 800;
  color: #aaa;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.pps-detail-value {
  font-size: 15px;
  font-weight: 700;
  color: #1a1535;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.pps-epc-badge {
  color: white;
  font-size: 12px;
  font-weight: 800;
  border-radius: 5px;
  padding: 1px 6px;
}

/* ════════════════════════════════════════════════════════════════
   BOTTOM SHEETS — single overlay, swaps body by activeSheet
   ════════════════════════════════════════════════════════════════ */
.pps-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  background: rgba(15, 12, 38, 0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: pps-overlay-fade 0.22s ease both;
}
@keyframes pps-overlay-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.pps-sheet {
  width: 100%;
  max-width: 28rem;
  background: #fff;
  border-radius: 22px 22px 0 0;
  padding: 16px 20px 24px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  max-height: 86vh;
  overflow-y: auto;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.18);
  animation: pps-sheet-up 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.pps-sheet--tall {
  max-height: 92vh;
}
@keyframes pps-sheet-up {
  from {
    transform: translateY(28px);
    opacity: 0.6;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.pps-sheet-handle {
  width: 40px;
  height: 4px;
  background: #ececef;
  border-radius: 100px;
  margin: 0 auto 14px;
}
.pps-sheet-icon {
  width: 48px;
  height: 48px;
  margin: 4px auto 8px;
}
.pps-sheet-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.pps-sheet-title {
  font-size: 17px;
  font-weight: 900;
  color: #231d45;
  text-align: center;
  letter-spacing: -0.3px;
  margin-bottom: 6px;
}
.pps-sheet-sub {
  font-size: 13px;
  color: #6b6783;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 16px;
}
.pps-sheet-cta {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #f0b460 0%, #d4822a 45%, #7a3a05 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(122, 58, 5, 0.3);
  margin-top: 14px;
  margin-bottom: 6px;
}
.pps-sheet-cancel {
  width: 100%;
  padding: 12px;
  background: none;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  color: #6b6783;
  cursor: pointer;
  margin-top: 12px;
}

/* Header strip at top of a data-source sheet */
.pps-ds-header {
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 18px;
}
.pps-ds-header-icon {
  font-size: 26px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.pps-ds-header-icon img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  display: block;
}
.pps-ds-header-title {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
}
.pps-ds-header-meta {
  font-size: 12px;
  color: #9c98ad;
  margin-top: 2px;
}

.pps-ds-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

/* Table (price history) */
.pps-ds-table {
  background: #f5f5f7;
  border-radius: 12px;
  overflow: hidden;
}
.pps-ds-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 10px 14px;
  border-bottom: 1px solid #ececef;
  font-size: 15px;
  font-weight: 600;
  color: #231d45;
  align-items: center;
}
.pps-ds-row:last-child {
  border-bottom: none;
}
.pps-ds-row--header {
  font-size: 11px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background: #fff;
}
.pps-ds-val {
  font-weight: 800;
  color: #231d45;
}
.pps-ds-muted {
  color: #9c98ad;
  font-size: 13px;
}
.pps-ds-empty {
  background: #fafafa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: #6b6783;
}

/* ── Price-history timeline (restored) ───────────────────── */
.pps-ds-cagr-banner {
  margin: 4px 0 14px;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pps-ds-cagr-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #6b6783;
  text-transform: uppercase;
}
.pps-ds-cagr-val {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.4px;
}
.pps-ds-cagr-val--up {
  color: #00a19a;
}
.pps-ds-cagr-val--down {
  color: #c73e36;
}

.pps-ds-timeline {
  display: flex;
  flex-direction: column;
  border-left: 2px solid #ececef;
  padding-left: 0;
  margin-left: 6px;
}
.pps-ds-tl-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0 10px 16px;
  border-bottom: 1px solid #f5f5f7;
}
.pps-ds-tl-row:last-child {
  border-bottom: none;
}
.pps-ds-tl-row--est .pps-ds-tl-price {
  color: #00a19a;
}
.pps-ds-tl-bullet {
  position: absolute;
  left: -7px;
  top: 16px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #c0bdcc;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #c0bdcc;
}
.pps-ds-tl-bullet--est {
  background: #00a19a;
  box-shadow: 0 0 0 2px #00a19a;
}
.pps-ds-tl-body {
  flex: 1;
  min-width: 0;
}
.pps-ds-tl-price {
  font-size: 16px;
  font-weight: 900;
  color: #231d45;
  letter-spacing: -0.3px;
}
.pps-ds-tl-est-pill {
  display: inline-block;
  vertical-align: middle;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.4px;
  background: #e6f7f6;
  color: #007e78;
  border: 1px solid #b2e4e1;
  border-radius: 100px;
  padding: 2px 8px;
  margin-left: 6px;
}
.pps-ds-tl-date {
  font-size: 12px;
  color: #9c98ad;
  margin-top: 1px;
}
.pps-ds-tl-delta {
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: 100px;
}
.pps-ds-tl-delta--up {
  background: #e8f5ee;
  color: #2eab55;
}
.pps-ds-tl-delta--down {
  background: #fcebea;
  color: #c73e36;
}
.pps-ds-tl-arrow {
  font-size: 13px;
}
.pps-ds-tl-pct {
  font-weight: 700;
  opacity: 0.7;
  margin-left: 2px;
}

/* ── EPC components bars (restored) ──────────────────────── */
.pps-epc-comp-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
}
.pps-epc-comp-row {
  display: grid;
  grid-template-columns: 80px 1fr 50px;
  align-items: center;
  gap: 10px;
}
.pps-epc-comp-label {
  font-size: 13px;
  font-weight: 700;
  color: #4a4566;
}
.pps-epc-comp-track {
  height: 8px;
  background: #f5f5f7;
  border-radius: 100px;
  overflow: hidden;
}
.pps-epc-comp-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.5s ease;
}
.pps-epc-comp-fill--good {
  background: #2eab55;
}
.pps-epc-comp-fill--avg {
  background: #e6a23c;
}
.pps-epc-comp-fill--poor {
  background: #c73e36;
}
.pps-epc-comp-fill--vpoor {
  background: #a82e26;
}
.pps-epc-comp-fill--na {
  background: #c0bdcc;
}
.pps-epc-comp-rating {
  font-size: 12px;
  font-weight: 800;
  text-align: right;
  white-space: nowrap;
}

/* ── Running-costs EPC upside row ────────────────────────── */
.pps-costs-upside {
  margin: 8px 14px 0;
  background: linear-gradient(135deg, #f2faf8, #f6f5fb);
  border: 1px solid #e5f4f2;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #007e78;
  line-height: 1.4;
}
.pps-costs-upside-ic {
  font-size: 14px;
  font-weight: 800;
  width: 22px;
  height: 22px;
  background: #00a19a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pps-costs-upside strong {
  color: #231d45;
}

/* ── Unpublished-passport modal (restored) ─────────────────── */
.unpub-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(35, 29, 69, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
}
.unpub-modal {
  background: white;
  max-width: 380px;
  width: 100%;
  border-radius: 22px;
  padding: 28px 24px 22px;
  position: relative;
  box-shadow: 0 24px 48px -12px rgba(35, 29, 69, 0.5);
  text-align: center;
}
.unpub-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: #f5f5f7;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b6783;
  cursor: pointer;
}
.unpub-close svg {
  width: 16px;
  height: 16px;
}
.unpub-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.unpub-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.4px;
  color: #007e78;
  margin-bottom: 8px;
  text-transform: uppercase;
}
.unpub-title {
  font-size: 20px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.4px;
  margin-bottom: 8px;
  line-height: 1.25;
}
.unpub-body {
  font-size: 15px;
  color: #6b6783;
  line-height: 1.55;
  margin-bottom: 18px;
}
.unpub-cta {
  width: 100%;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
  cursor: pointer;
  transition: all 0.15s;
}
.unpub-cta:hover {
  background: #00b6ae;
  transform: translateY(-1px);
}

/* Fade transition for the modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Key-value list */
.pps-ds-kv-list {
  display: flex;
  flex-direction: column;
}
.pps-ds-kv {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid #f5f5f7;
  font-size: 15px;
}
.pps-ds-kv:last-child {
  border-bottom: none;
}
.pps-ds-k {
  color: #6b6783;
  font-weight: 500;
}
.pps-ds-major-pill {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #007e78;
  background: #e0f4f1;
  border: 1px solid #c2e6df;
  vertical-align: 2px;
}
.pps-ds-v {
  font-weight: 700;
  color: #231d45;
}
.pps-ds-v--red {
  color: #c73e36;
}
.pps-ds-v--amber {
  color: #c18a38;
}
.pps-ds-v--green {
  color: #2eab55;
}
.pps-ds-v--muted {
  color: #8a8595;
  font-weight: 600;
  font-size: 13px;
}
.pps-ds-kv--link {
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease;
}
.pps-ds-kv--link:hover {
  background: #f5f5f7;
}
.pps-ds-kv--link .pps-ds-v--muted {
  color: #00a19a;
  font-weight: 700;
}
.pps-ds-bar-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pps-ds-bar-item {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  align-items: center;
  gap: 10px;
}
.pps-ds-bar-item--active .pps-ds-bar-label {
  color: #00a19a;
  font-weight: 900;
}
.pps-ds-bar-item--active .pps-ds-bar-count {
  color: #00a19a;
  font-weight: 900;
}
.pps-ds-bar-label {
  font-weight: 800;
  color: #231d45;
  text-align: center;
  font-size: 15px;
}
.pps-ds-bar-track {
  background: #f5f5f7;
  border-radius: 6px;
  height: 14px;
  overflow: hidden;
}
.pps-ds-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s ease;
}
.pps-ds-bar-count {
  font-size: 12px;
  font-weight: 700;
  color: #6b6783;
  min-width: 56px;
  text-align: right;
}

/* Highlight box (used by Council, Broadband) */
.pps-ds-highlight-box {
  background: linear-gradient(135deg, #f2faf8 0%, #e5f4f2 100%);
  border: 1.5px solid #e5f4f2;
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  margin-bottom: 4px;
}
.pps-ds-highlight-num {
  font-size: 26px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.5px;
}
.pps-ds-highlight-sub {
  font-size: 13px;
  color: #6b6783;
  margin-top: 4px;
}

/* Rank card (street) */
.pps-ds-rank-card {
  background: #f9f9fb;
  border-radius: 14px;
  padding: 18px;
  text-align: center;
  margin-bottom: 4px;
}
.pps-ds-rank-big {
  font-size: 38px;
  font-weight: 900;
  color: #231d45;
  letter-spacing: -1px;
  line-height: 1;
}
.pps-ds-rank-sub {
  font-size: 13px;
  color: #6b6783;
  margin-top: 6px;
}

/* Risk card (flood) */
.pps-ds-risk-card {
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 4px;
}
.pps-ds-risk-card--high {
  background: #fef2f2;
  border: 1.5px solid rgba(199, 62, 54, 0.3);
}
.pps-ds-risk-card--medium {
  background: #fff7e6;
  border: 1.5px solid rgba(230, 162, 60, 0.4);
}
.pps-ds-risk-card--low {
  background: #fffbe6;
  border: 1.5px solid rgba(240, 220, 128, 0.6);
}
.pps-ds-risk-card--clear {
  background: #f0fbf4;
  border: 1.5px solid #b8e8c8;
}
.pps-ds-risk-label {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 6px;
}
.pps-ds-risk-card--high .pps-ds-risk-label {
  color: #c73e36;
}
.pps-ds-risk-card--medium .pps-ds-risk-label {
  color: #c18a38;
}
.pps-ds-risk-desc {
  font-size: 13px;
  color: #4a4560;
  line-height: 1.55;
}

/* Council band list */
.pps-ds-band-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pps-ds-band-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}
.pps-ds-band-row--active .pps-ds-band-letter {
  color: #00a19a;
  font-weight: 900;
}
.pps-ds-band-row--active .pps-ds-band-amt {
  color: #00a19a;
}
.pps-ds-band-letter {
  width: 32px;
  font-size: 13px;
  font-weight: 800;
  color: #6b6783;
}
.pps-ds-band-bar-track {
  flex: 1;
  height: 8px;
  background: #ececef;
  border-radius: 100px;
  overflow: hidden;
}
.pps-ds-band-bar {
  height: 100%;
  background: #c0bdcc;
  border-radius: 100px;
  transition: width 0.6s ease;
}
.pps-ds-band-amt {
  width: 64px;
  text-align: right;
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
}

/* Info note + attribution */
.pps-ds-info-note {
  background: #f9f9fb;
  border-left: 3px solid #c0bdcc;
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
  margin-top: 14px;
  font-size: 12px;
  color: #6b6783;
  line-height: 1.55;
}
/* ── Crime sheet styles ─────────────────────────────────────────
   Panel matches the umu-crime-panel design reference. Colours use
   the same navy/teal/rose/gold palette as the rest of the property
   view so it doesn't feel like a bolted-on module. */
.crime-seg {
  display: flex;
  background: #f4f3f8;
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
  margin: 12px 0 16px;
}
.crime-seg button {
  flex: 1;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: #6b6685;
  padding: 8px 4px;
  border-radius: 9px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
}
.crime-seg button[aria-pressed='true'] {
  background: #fff;
  color: #231d45;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.12);
}

.crime-headline {
  border: 1px solid #eae8f0;
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 14px;
}
.crime-rate-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.crime-rate {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: #231d45;
}
.crime-rate-unit {
  font-size: 12.5px;
  font-weight: 600;
  color: #6b6685;
  line-height: 1.3;
}
.crime-verdict {
  margin: 10px 0 0;
  font-size: 14px;
  font-weight: 600;
  color: #231d45;
  line-height: 1.45;
}
.crime-verdict :deep(em) {
  font-style: normal;
  font-weight: 800;
}
.crime-raw {
  margin: 6px 0 0;
  font-size: 12px;
  color: #9b97ad;
  font-weight: 500;
}

.crime-scale-wrap {
  margin-top: 18px;
}
.crime-scale {
  position: relative;
  height: 10px;
  border-radius: 99px;
  /* Cool → warm gradient — teal (quiet) through amber to rose (busy).
     Matches the reference exactly. */
  background: linear-gradient(
    90deg,
    #7fcfc9 0%,
    #cfe0c0 32%,
    #f0d9a8 62%,
    #e3a9a9 100%
  );
}
.crime-tick {
  position: absolute;
  top: -5px;
  width: 1px;
  height: 20px;
  background: rgba(35, 29, 69, 0.22);
}
.crime-marker {
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #231d45;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.35);
  transform: translate(-50%, -50%);
  transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.crime-scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 9px;
  font-size: 10px;
  font-weight: 700;
  color: #9b97ad;
  letter-spacing: 0.03em;
}
.crime-scale-key {
  margin-top: 8px;
  font-size: 11.5px;
  color: #6b6685;
  font-weight: 500;
  line-height: 1.4;
}

.crime-trend {
  border: 1px solid #eae8f0;
  border-radius: 20px;
  padding: 14px 16px;
  margin-bottom: 20px;
}
.crime-trend-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.crime-trend-top > span:first-child {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9b97ad;
}
.crime-chip {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 99px;
  background: rgba(0, 161, 154, 0.12);
  color: #00817c;
}
.crime-chip.up {
  background: rgba(196, 88, 107, 0.12);
  color: #c4586b;
}
.crime-spark {
  width: 100%;
  height: 52px;
  display: block;
  overflow: visible;
}
.crime-spark-x {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 10px;
  color: #9b97ad;
  font-weight: 600;
}

.crime-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9b97ad;
  margin: 8px 0 4px;
}
.crime-section-sub {
  font-size: 12.5px;
  color: #6b6685;
  margin: 0 0 12px;
  font-weight: 500;
}

.crime-cats {
  display: flex;
  flex-direction: column;
}
.crime-cat {
  padding: 11px 0;
  border: 0;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font: inherit;
  display: block;
  border-bottom: 1px solid #f4f3f8;
}
.crime-cat:last-child {
  border-bottom: none;
}
.crime-cat-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 7px;
}
.crime-cat-name {
  font-size: 14px;
  font-weight: 600;
  color: #231d45;
}
.crime-cat-num {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  flex: none;
  color: #231d45;
}
.crime-bar {
  height: 6px;
  border-radius: 99px;
  background: #f4f3f8;
  overflow: hidden;
}
.crime-bar i {
  display: block;
  height: 100%;
  border-radius: 99px;
  transition: width 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}
.crime-cat-note {
  font-size: 12.5px;
  color: #6b6685;
  line-height: 1.5;
  margin: 9px 0 2px;
  font-weight: 500;
}

.crime-more {
  width: 100%;
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #eae8f0;
  background: #fff;
  border-radius: 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
}
.crime-more:hover {
  background: #f4f3f8;
}

.crime-note {
  margin-top: 22px;
  padding: 14px;
  background: #f4f3f8;
  border-radius: 14px;
  font-size: 12px;
  line-height: 1.55;
  color: #6b6685;
  font-weight: 500;
}
.crime-note :deep(b) {
  color: #231d45;
  font-weight: 700;
}

.pps-ds-attribution {
  font-size: 12px;
  color: #c0bdcc;
  text-align: center;
  margin-top: 16px;
  font-style: italic;
}

/* ── Stamp Duty (pps-sx) ─────────────────────────────────────────────
   Rebuilt to match the umu-stamp-duty prototype: headline card with
   effective-rate mini stats, price input + slider, buyer-type seg,
   non-UK-resident toggle, contextual alert, stacked band bar. */
.pps-sx-head {
  border-radius: 20px;
  padding: 20px 18px;
  margin-bottom: 14px;
  text-align: center;
  background: linear-gradient(160deg, #e9f6f5, #f7fbfb);
}
.pps-sx-lab {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #75757c;
}
.pps-sx-big {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin-top: 6px;
  color: #231d45;
  font-variant-numeric: tabular-nums;
}
.pps-sx-sub {
  font-size: 13px;
  color: #75757c;
  font-weight: 600;
  margin: 8px 0 0;
  line-height: 1.45;
}
.pps-sx-sub b {
  color: #231d45;
  font-weight: 800;
}
.pps-sx-eff {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(35, 29, 69, 0.09);
}
.pps-sx-eff > div {
  flex: 1;
}
.pps-sx-eff b {
  display: block;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #231d45;
  font-variant-numeric: tabular-nums;
}
.pps-sx-eff span {
  font-size: 10.5px;
  color: #a2a2a9;
  font-weight: 600;
  display: block;
  margin-top: 3px;
  line-height: 1.3;
}
.pps-sx-field {
  border: 1.5px solid #e4e4e7;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 10px;
  transition: 0.18s;
}
.pps-sx-field:focus-within {
  border-color: #00a19a;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.12);
}
.pps-sx-field label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a2a2a9;
  margin-bottom: 2px;
}
.pps-sx-inrow {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.pps-sx-cur {
  font-size: 22px;
  font-weight: 700;
  color: #a2a2a9;
}
.pps-sx-inrow input {
  border: 0;
  outline: 0;
  font: inherit;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #231d45;
  width: 100%;
  padding: 0;
  background: none;
  font-variant-numeric: tabular-nums;
}
.pps-sx-slider {
  width: 100%;
  margin: 12px 0 18px;
  accent-color: #00a19a;
  height: 22px;
}
.pps-sx-seg {
  display: flex;
  background: #f3f3f5;
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
  margin-bottom: 10px;
}
.pps-sx-seg button {
  flex: 1;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: #75757c;
  padding: 9px 4px;
  border-radius: 9px;
  cursor: pointer;
  transition: 0.18s;
}
.pps-sx-seg button[aria-pressed='true'] {
  background: #fff;
  color: #231d45;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.14);
}
.pps-sx-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 4px;
  border-bottom: 1px solid #e4e4e7;
  margin-bottom: 18px;
}
.pps-sx-switch span {
  font-size: 13.5px;
  font-weight: 600;
  color: #231d45;
  display: block;
}
.pps-sx-switch small {
  display: block;
  font-size: 11.5px;
  color: #a2a2a9;
  font-weight: 500;
  margin-top: 2px;
}
.pps-sx-tog {
  width: 46px;
  height: 27px;
  border-radius: 99px;
  border: 0;
  background: #e4e4e7;
  position: relative;
  cursor: pointer;
  flex: none;
  transition: 0.2s;
  padding: 0;
}
.pps-sx-tog[aria-pressed='true'] {
  background: #00a19a;
}
.pps-sx-tog::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: #fff;
  transition: 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.pps-sx-tog[aria-pressed='true']::after {
  left: 22px;
}
.pps-sx-alert {
  background: #231d45;
  color: #fff;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;
  font-size: 12.5px;
  line-height: 1.55;
  font-weight: 600;
}
.pps-sx-alert b {
  font-weight: 800;
  display: inline;
}
.pps-sx-stack-wrap {
  margin-bottom: 18px;
}
.pps-sx-stack-lab {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a2a2a9;
  margin-bottom: 9px;
}
.pps-sx-stack {
  display: flex;
  height: 14px;
  border-radius: 99px;
  overflow: hidden;
  background: #f3f3f5;
}
.pps-sx-stack i {
  display: block;
  height: 100%;
  transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.pps-sx-stack-key {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.pps-sx-k {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #75757c;
}
.pps-sx-k s {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  display: block;
}
.pps-sx-band {
  padding: 12px 0;
  border-bottom: 1px solid #e4e4e7;
}
.pps-sx-band--off {
  opacity: 0.4;
}
.pps-sx-brow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.pps-sx-brate {
  font-size: 14.5px;
  font-weight: 800;
  color: #231d45;
  font-variant-numeric: tabular-nums;
}
.pps-sx-bamt {
  font-size: 14.5px;
  font-weight: 700;
  color: #231d45;
  font-variant-numeric: tabular-nums;
}
.pps-sx-bbar {
  height: 5px;
  border-radius: 99px;
  background: #f3f3f5;
  overflow: hidden;
  margin-top: 8px;
}
.pps-sx-bbar i {
  display: block;
  height: 100%;
  border-radius: 99px;
  transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.pps-sx-bmeta {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  font-size: 11.5px;
  color: #a2a2a9;
  font-weight: 600;
}
.pps-sx-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 16px 0 4px;
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.pps-sx-total span:last-child {
  font-size: 19px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.pps-sx-links {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.pps-sx-links a {
  font-size: 12.5px;
  font-weight: 700;
  color: #00817c;
  text-decoration: none;
}

/* ── Schools (pps-sh) ────────────────────────────────────────────────
   Headline stat card + phase seg + sortable list of expandable rows. */
.pps-sh-summary {
  background: linear-gradient(160deg, #e9f6f5, #f7fbfb);
  border-radius: 20px;
  padding: 20px 18px;
  margin-bottom: 14px;
  text-align: center;
}
.pps-sh-big {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1;
  color: #231d45;
}
.pps-sh-cap {
  font-size: 13px;
  color: #75757c;
  font-weight: 600;
  margin: 8px 0 0;
  line-height: 1.45;
}
.pps-sh-cap em {
  font-style: normal;
  font-weight: 800;
  color: #231d45;
}
.pps-sh-mini {
  display: flex;
  gap: 14px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(35, 29, 69, 0.09);
}
.pps-sh-mini > div {
  flex: 1;
}
.pps-sh-mini b {
  display: block;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: #231d45;
  font-variant-numeric: tabular-nums;
}
.pps-sh-mini b small {
  font-size: 12px;
  font-weight: 700;
  color: #75757c;
}
.pps-sh-mini span {
  font-size: 10.5px;
  color: #a2a2a9;
  font-weight: 600;
  line-height: 1.35;
  display: block;
  margin-top: 4px;
}
.pps-sh-seg {
  display: flex;
  background: #f3f3f5;
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
  margin-bottom: 12px;
}
.pps-sh-seg button {
  flex: 1;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: #75757c;
  padding: 8px 4px;
  border-radius: 9px;
  cursor: pointer;
  transition: 0.18s;
}
.pps-sh-seg button[aria-pressed='true'] {
  background: #fff;
  color: #231d45;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.14);
}
.pps-sh-sortbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0 2px;
}
.pps-sh-sortbar span:first-child {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a2a2a9;
}
.pps-sh-sortnote {
  font-size: 12.5px;
  font-weight: 700;
  color: #00817c;
}
.pps-sh-list {
  margin-top: 4px;
}
.pps-sh-row {
  border: 0;
  background: none;
  width: 100%;
  text-align: left;
  font: inherit;
  cursor: pointer;
  padding: 13px 0;
  border-bottom: 1px solid #e4e4e7;
  display: block;
  color: inherit;
}
.pps-sh-r1 {
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.pps-sh-name {
  font-size: 14.5px;
  font-weight: 600;
  flex: 1;
  line-height: 1.35;
  color: #231d45;
}
.pps-sh-dist {
  font-size: 14.5px;
  font-weight: 700;
  color: #231d45;
  flex: none;
  font-variant-numeric: tabular-nums;
}
.pps-sh-bar {
  height: 5px;
  border-radius: 99px;
  background: #f3f3f5;
  overflow: hidden;
  margin-top: 8px;
}
.pps-sh-bar i {
  display: block;
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.pps-sh-r2 {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
  align-items: center;
}
.pps-sh-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 3.5px 9px;
  border-radius: 99px;
  background: #f3f3f5;
  color: #75757c;
}
.pps-sh-tag--primary {
  background: #e9f6f5;
  color: #00817c;
}
.pps-sh-tag--secondary {
  background: #231d45;
  color: #fff;
}
.pps-sh-tag--nursery {
  background: #f3f3f5;
  color: #4a4468;
}
.pps-sh-walk {
  font-size: 11.5px;
  font-weight: 600;
  color: #a2a2a9;
}
.pps-sh-detail {
  margin-top: 12px;
  padding: 14px;
  background: #f3f3f5;
  border-radius: 14px;
  border-left: 3px solid #00a19a;
}
.pps-sh-dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 7px 14px;
  font-size: 12.5px;
  margin: 0;
}
.pps-sh-dl dt {
  color: #a2a2a9;
  font-weight: 600;
}
.pps-sh-dl dd {
  margin: 0;
  font-weight: 600;
  color: #231d45;
}
.pps-sh-catch {
  margin: 12px 0 0;
  font-size: 12.5px;
  line-height: 1.5;
  font-weight: 500;
  color: #75757c;
}
.pps-sh-catch b {
  color: #231d45;
  font-weight: 700;
}

/* ── Flood (pps-fl) ──────────────────────────────────────────────────
   Headline card + per-source risk rows + live-warnings toggle +
   environmental lookup links. */
.pps-fl-head {
  border-radius: 20px;
  padding: 20px 18px;
  margin-bottom: 8px;
  text-align: center;
  background: linear-gradient(160deg, #e9f6f5, #f7fbfb);
}
.pps-fl-head--pending {
  background: #f3f3f5;
}
.pps-fl-lab {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #75757c;
}
.pps-fl-big {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-top: 7px;
  color: #231d45;
}
.pps-fl-sub {
  font-size: 13px;
  color: #75757c;
  font-weight: 600;
  margin: 9px 0 0;
  line-height: 1.5;
}
.pps-fl-sub :deep(b) {
  color: #231d45;
  font-weight: 800;
}
.pps-fl-stamp {
  font-size: 11.5px;
  color: #a2a2a9;
  font-weight: 600;
  text-align: center;
  margin: 0 0 18px;
}
.pps-fl-sec {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a2a2a9;
  margin: 22px 0 3px;
}
.pps-fl-secsub {
  font-size: 12.5px;
  color: #75757c;
  margin: 0 0 10px;
  font-weight: 500;
  line-height: 1.5;
}
.pps-fl-risks {
  display: block;
}
.pps-fl-risk {
  border: 0;
  background: none;
  width: 100%;
  text-align: left;
  font: inherit;
  cursor: pointer;
  padding: 13px 0;
  border-bottom: 1px solid #e4e4e7;
  display: block;
  color: inherit;
}
.pps-fl-rtop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.pps-fl-rname {
  font-size: 14.5px;
  font-weight: 600;
  color: #231d45;
}
.pps-fl-pill {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 99px;
  flex: none;
}
.pps-fl-pill--low {
  background: #00a19a;
  color: #fff;
}
.pps-fl-pill--med {
  background: transparent;
  color: #231d45;
  box-shadow: inset 0 0 0 1.5px #231d45;
}
.pps-fl-pill--high {
  background: #231d45;
  color: #fff;
}
.pps-fl-pill--none {
  background: #f3f3f5;
  color: #a2a2a9;
  box-shadow: inset 0 0 0 1px #e4e4e7;
}
.pps-fl-rmean {
  font-size: 12.5px;
  color: #75757c;
  font-weight: 500;
  margin: 7px 0 0;
  line-height: 1.5;
}
.pps-fl-rdet {
  margin-top: 11px;
  padding: 13px;
  background: #f3f3f5;
  border-radius: 13px;
  border-left: 3px solid #00a19a;
  font-size: 12.5px;
  line-height: 1.55;
  font-weight: 500;
  color: #75757c;
}
.pps-fl-rdet :deep(b) {
  color: #231d45;
  font-weight: 700;
}
.pps-fl-live {
  background: #f3f3f5;
  border-radius: 16px;
  padding: 12px 14px;
  margin-top: 12px;
}
.pps-fl-live .pps-fl-sec {
  margin-top: 0;
}
.pps-fl-livehead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  border: 0;
  background: none;
  font: inherit;
  width: 100%;
  color: inherit;
}
.pps-fl-livehead span {
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
}
.pps-fl-livehead small {
  font-size: 11.5px;
  color: #a2a2a9;
  font-weight: 600;
}
.pps-fl-livebody {
  padding-bottom: 6px;
}
.pps-fl-wrow {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-top: 1px solid #e4e4e7;
  font-size: 12.5px;
}
.pps-fl-wrow span:first-child {
  font-weight: 600;
  color: #75757c;
}
.pps-fl-wrow span:last-child {
  font-weight: 700;
  flex: none;
  color: #231d45;
}
.pps-fl-impact {
  margin-top: 20px;
  background: #e9f6f5;
  border-radius: 16px;
  padding: 16px;
}
.pps-fl-impact h3 {
  font-size: 13.5px;
  font-weight: 800;
  margin: 0 0 9px;
  color: #231d45;
}
.pps-fl-impact ul {
  margin: 0;
  padding-left: 17px;
  font-size: 12.5px;
  line-height: 1.65;
  font-weight: 500;
  color: #75757c;
}
.pps-fl-impact li {
  margin-bottom: 5px;
}
.pps-fl-impact b {
  color: #231d45;
  font-weight: 700;
}
.pps-fl-lookups {
  display: block;
}
.pps-fl-lookup {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid #e4e4e7;
  text-decoration: none;
  color: inherit;
}
.pps-fl-lname {
  font-size: 14.5px;
  font-weight: 600;
  color: #231d45;
}
.pps-fl-lsub {
  font-size: 11.5px;
  color: #a2a2a9;
  font-weight: 600;
  margin-top: 3px;
}
.pps-fl-go {
  font-size: 12.5px;
  font-weight: 700;
  color: #00817c;
  flex: none;
}

/* ── Transport / Buses (pps-tr) ──────────────────────────────────────
   Shared headline + expandable-row + tag styles used by the Transport
   and Buses sheets. Matches the umu-transport / umu-bus prototypes. */
.pps-tr-head {
  border-radius: 20px;
  padding: 20px 18px;
  margin-bottom: 14px;
  text-align: center;
  background: linear-gradient(160deg, #e9f6f5, #f7fbfb);
}
.pps-tr-lab {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #75757c;
}
.pps-tr-big {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-top: 6px;
  color: #231d45;
}
.pps-tr-sub {
  font-size: 13px;
  color: #75757c;
  font-weight: 600;
  margin: 8px 0 0;
  line-height: 1.5;
}
.pps-tr-sub :deep(b) {
  color: #231d45;
  font-weight: 800;
}
.pps-tr-eff {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(35, 29, 69, 0.09);
}
.pps-tr-eff > div {
  flex: 1;
}
.pps-tr-eff b {
  display: block;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #231d45;
  font-variant-numeric: tabular-nums;
}
.pps-tr-eff span {
  font-size: 10.5px;
  color: #a2a2a9;
  font-weight: 600;
  display: block;
  margin-top: 3px;
  line-height: 1.3;
}
.pps-tr-sec {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a2a2a9;
  margin: 22px 0 3px;
}
.pps-tr-secsub {
  font-size: 12.5px;
  color: #75757c;
  margin: 0 0 10px;
  font-weight: 500;
  line-height: 1.5;
}
.pps-tr-sortbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0 2px;
}
.pps-tr-sortbar span {
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #a2a2a9;
}
.pps-tr-sortbtn {
  border: 0;
  background: none;
  font: inherit;
  font-size: 12.5px;
  font-weight: 800;
  color: #231d45;
  cursor: pointer;
  padding: 6px 0;
  text-decoration: underline;
  text-decoration-color: #00a19a;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}
.pps-tr-list {
  display: block;
}
.pps-tr-row {
  border: 0;
  background: none;
  width: 100%;
  text-align: left;
  font: inherit;
  cursor: pointer;
  padding: 13px 0;
  border-bottom: 1px solid #e4e4e7;
  display: block;
  color: inherit;
}
.pps-tr-row--static {
  cursor: default;
}
.pps-tr-strow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.pps-tr-stname {
  font-size: 14.5px;
  font-weight: 700;
  flex: 1;
  color: #231d45;
  line-height: 1.35;
}
.pps-tr-stwalk {
  font-size: 13.5px;
  font-weight: 700;
  flex: none;
  font-variant-numeric: tabular-nums;
  color: #231d45;
}
.pps-tr-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  align-items: center;
}
.pps-tr-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 3.5px 9px;
  border-radius: 99px;
  background: #f3f3f5;
  color: #75757c;
}
.pps-tr-tag--hub {
  background: #231d45;
  color: #fff;
}
.pps-tr-tag--muted {
  background: transparent;
  color: #a2a2a9;
}
.pps-tr-det {
  margin-top: 11px;
  padding: 13px;
  background: #f3f3f5;
  border-radius: 13px;
  border-left: 3px solid #00a19a;
  font-size: 12.5px;
  line-height: 1.55;
  font-weight: 500;
  color: #75757c;
}
.pps-tr-det :deep(b) {
  color: #231d45;
  font-weight: 700;
}
.pps-tr-det :deep(a) {
  color: #00817c;
  text-decoration: none;
  font-weight: 700;
}
.pps-tr-links {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.pps-tr-links a {
  font-size: 12.5px;
  font-weight: 700;
  color: #00817c;
  text-decoration: none;
}

/* ── Broadband (pps-bb) ──────────────────────────────────────────────
   Big speed headline with gradient scale marker, per-network rows,
   mobile-signal dot grid, impact card. Matches umu-broadband. */
.pps-bb-head {
  border-radius: 20px;
  padding: 20px 18px;
  margin-bottom: 8px;
  text-align: center;
  background: linear-gradient(160deg, #e9f6f5, #f7fbfb);
}
.pps-bb-lab {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #75757c;
}
.pps-bb-big {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  margin-top: 6px;
  color: #231d45;
  font-variant-numeric: tabular-nums;
}
.pps-bb-big small {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
  color: #75757c;
}
.pps-bb-sub {
  font-size: 13px;
  color: #75757c;
  font-weight: 600;
  margin: 9px 0 0;
  line-height: 1.5;
}
.pps-bb-sub :deep(b) {
  color: #231d45;
  font-weight: 800;
}
.pps-bb-scale-wrap {
  margin-top: 18px;
}
.pps-bb-scale {
  position: relative;
  height: 9px;
  border-radius: 99px;
  background: linear-gradient(
    90deg,
    #e4e4e7 0%,
    #b7e4e1 30%,
    #00a19a 62%,
    #231d45 100%
  );
}
.pps-bb-marker {
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3.5px #231d45, 0 2px 6px rgba(35, 29, 69, 0.3);
  transform: translate(-50%, -50%);
  transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.pps-bb-scale-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 9px;
  font-size: 10px;
  font-weight: 700;
  color: #a2a2a9;
  letter-spacing: 0.02em;
}
.pps-bb-stamp {
  font-size: 11.5px;
  color: #a2a2a9;
  font-weight: 600;
  text-align: center;
  margin: 14px 0 8px;
}
.pps-bb-nets {
  display: block;
}
.pps-bb-net {
  padding: 13px 0;
  border-bottom: 1px solid #e4e4e7;
}
.pps-bb-nrow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.pps-bb-nname {
  font-size: 14.5px;
  font-weight: 600;
  color: #231d45;
}
.pps-bb-nname em {
  font-style: normal;
  font-size: 11px;
  font-weight: 700;
  color: #a2a2a9;
  display: block;
  margin-top: 2px;
}
.pps-bb-nspeed {
  font-size: 14.5px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  flex: none;
  color: #231d45;
}
.pps-bb-nbar {
  height: 5px;
  border-radius: 99px;
  background: #f3f3f5;
  overflow: hidden;
  margin-top: 8px;
}
.pps-bb-nbar i {
  display: block;
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.pps-bb-mob {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0;
  font-size: 13px;
}
.pps-bb-mob > * {
  padding: 11px 0;
  border-bottom: 1px solid #e4e4e7;
}
.pps-bb-mob-h {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #a2a2a9;
  padding-bottom: 7px;
}
.pps-bb-mob-op {
  font-weight: 600;
  color: #231d45;
}
.pps-bb-mob-c {
  text-align: right;
  padding-left: 14px;
  font-weight: 700;
}
.pps-bb-dots {
  display: inline-flex;
  gap: 3px;
  vertical-align: middle;
}
.pps-bb-dots s {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e4e4e7;
  display: block;
}
.pps-bb-dots s.pps-bb-dot-on {
  background: #00a19a;
}
.pps-bb-dots s.pps-bb-dot-full {
  background: #231d45;
}
.pps-bb-impact {
  margin-top: 20px;
  background: #e9f6f5;
  border-radius: 16px;
  padding: 16px;
}
.pps-bb-impact h3 {
  font-size: 13.5px;
  font-weight: 800;
  margin: 0 0 9px;
  color: #231d45;
}
.pps-bb-impact ul {
  margin: 0;
  padding-left: 17px;
  font-size: 12.5px;
  line-height: 1.65;
  font-weight: 500;
  color: #75757c;
}
.pps-bb-impact li {
  margin-bottom: 5px;
}
.pps-bb-impact :deep(b) {
  color: #231d45;
  font-weight: 700;
}

/* Placeholder for sheets with no data yet */
.pps-ds-placeholder {
  text-align: center;
  padding: 28px 16px;
  background: #fafafa;
  border-radius: 14px;
  border: 1.5px dashed #ececef;
  margin-bottom: 16px;
}
.pps-ds-placeholder-icon {
  font-size: 36px;
  margin-bottom: 10px;
}
.pps-ds-placeholder-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 6px;
}
.pps-ds-placeholder-sub {
  font-size: 13px;
  color: #6b6783;
  line-height: 1.55;
}
.pps-ds-placeholder-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 800;
  color: #00a19a;
  text-decoration: none;
  padding: 8px 14px;
  border: 1.5px solid #e5f4f2;
  background: #f2faf8;
  border-radius: 100px;
  transition: all 0.15s;
}
.pps-ds-placeholder-link:hover {
  background: #e5f4f2;
  border-color: #00a19a;
}

/* Map iframe */
.pps-map-frame {
  width: 100%;
  height: 280px;
  border: none;
  border-radius: 12px;
  margin-bottom: 14px;
}

/* Passport sheet (£99 unlock) */
.pps-passport-sheet-header {
  background: linear-gradient(135deg, #fef9f0 0%, #f5e0b5 100%);
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 16px;
}
/* Unclaimed: neutral grey gradient — no need to imply value already there */
.pps-passport-sheet-header--unclaimed {
  background: linear-gradient(135deg, #f6f5fb 0%, #eeedf5 100%);
}
/* Progress: teal gradient — Passport is actively being built */
.pps-passport-sheet-header--progress {
  background: linear-gradient(135deg, #e6f7f6 0%, #b2e4e1 100%);
}
.pps-passport-sheet-empty {
  font-size: 14px;
  color: #6b6783;
  line-height: 1.55;
  padding: 0 2px;
  margin: 6px 0 4px;
}
.pps-passport-sheet-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #b07a1c;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.pps-passport-sheet-dot {
  width: 8px;
  height: 8px;
  background: #d4822a;
  border-radius: 2px;
}
.pps-passport-sheet-address {
  font-size: 18px;
  font-weight: 900;
  color: #231d45;
  letter-spacing: -0.3px;
  margin-top: 4px;
}
.pps-passport-sheet-meta {
  font-size: 13px;
  color: #6b4c1a;
  margin-top: 2px;
}
.pps-passport-sheet-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.pps-passport-sheet-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pps-psi-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pps-psi-icon {
  width: 32px;
  height: 32px;
  background: #e5f4f2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}
.pps-psi-text {
  flex: 1;
  min-width: 0;
}
.pps-psi-name {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.pps-psi-meta {
  font-size: 12px;
  color: #9c98ad;
  margin-top: 1px;
}
.pps-psi-check {
  color: #00a19a;
  font-weight: 800;
  font-size: 14px;
}

.pps-passport-price-breakdown {
  background: #fafafa;
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 4px;
}
.pps-ppb-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #6b6783;
  padding: 4px 0;
}
.pps-ppb-divider {
  height: 1px;
  background: #ececef;
  margin: 8px 0;
}
.pps-ppb-total {
  font-size: 16px;
  font-weight: 900;
  color: #231d45;
}
.pps-ppb-note {
  font-size: 11px;
  color: #9c98ad;
  margin-top: 8px;
  text-align: center;
}

/* Explain sheets */
.pps-explain-hero {
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}
.pps-explain-hero--unclaimed {
  background: #231d45;
  color: #fff;
}
.pps-explain-hero--progress {
  background: linear-gradient(135deg, #4dd4ce 0%, #00a19a 45%, #006e68 100%);
  color: #fff;
}
.pps-explain-hero--published {
  background: linear-gradient(135deg, #f0b460 0%, #d4822a 45%, #7a3a05 100%);
  color: #fff;
}
.pps-explain-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.pps-explain-title {
  font-size: 18px;
  font-weight: 900;
  color: #fff;
  line-height: 1.25;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}
.pps-explain-body {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.55;
}
.pps-explain-callout {
  background: #f9f9fb;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 16px;
  border-left: 3px solid #231d45;
}
.pps-explain-callout--unclaimed {
  border-left-color: #231d45;
}
.pps-explain-callout--progress {
  border-left-color: #00a19a;
}
.pps-explain-callout-eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.pps-explain-callout-body {
  font-size: 13px;
  color: #4a4560;
  line-height: 1.6;
}
.pps-explain-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}
.pps-explain-stats > div {
  background: #f9f9fb;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}
.pps-explain-stat-num {
  font-size: 20px;
  font-weight: 900;
  color: #231d45;
  letter-spacing: -0.5px;
}
.pps-explain-stat-sub {
  font-size: 11px;
  color: #9c98ad;
  margin-top: 2px;
  font-weight: 600;
}

/* New explain components — lifetime callout, search-reuse callout, steps, checklist, progress, footer */
.pps-explain-callout--lifetime {
  background: #f0f0ff;
  border-left-color: #5b52a0;
}
.pps-explain-callout--reuse {
  background: #fef9f0;
  border-left-color: #d4822a;
}
.pps-explain-callout-foot {
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
  margin-top: 8px;
}
.pps-explain-section-label {
  font-size: 11px;
  font-weight: 800;
  color: #9c98ad;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 16px 0 10px;
}
.pps-explain-steps {
  display: flex;
  align-items: flex-start;
  margin-bottom: 18px;
}
.pps-explain-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-width: 0;
}
.pps-explain-step-num {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #ececef;
  color: #9c98ad;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pps-explain-step--active .pps-explain-step-num {
  background: #231d45;
  color: #fff;
}
.pps-explain-step-title {
  font-size: 11px;
  font-weight: 700;
  color: #9c98ad;
}
.pps-explain-step--active .pps-explain-step-title {
  color: #231d45;
}
.pps-explain-step-sub {
  font-size: 9px;
  color: #9c98ad;
  text-align: center;
  line-height: 1.4;
  padding: 0 2px;
}
.pps-explain-step-line {
  flex: 1;
  height: 2px;
  background: #ececef;
  margin-top: 17px;
}
.pps-explain-checklist {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 14px;
}
.pps-explain-checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f9f9fb;
  border-radius: 11px;
  padding: 10px 12px;
}
.pps-explain-checklist-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.pps-explain-checklist-text {
  flex: 1;
  min-width: 0;
}
.pps-explain-checklist-title {
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
}
.pps-explain-checklist-sub {
  font-size: 11px;
  color: #9c98ad;
  margin-top: 1px;
}
.pps-explain-checklist-tick {
  color: #00a19a;
  font-weight: 800;
  font-size: 15px;
}
.pps-explain-progress-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}
.pps-explain-progress-pct {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.pps-explain-progress-frac {
  font-size: 12px;
  color: #9c98ad;
}
.pps-explain-progress-track {
  height: 8px;
  background: #ececef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}
.pps-explain-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #4dd4ce);
  border-radius: 4px;
  transition: width 0.4s ease;
}
.pps-explain-footer {
  text-align: center;
  font-size: 12px;
  color: #9c98ad;
  line-height: 1.6;
  padding: 0 8px 16px;
}

/* ─── Make Contact / Watch form fields ─────────────────────── */
.pps-field-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;
}
.pps-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pps-field-label {
  font-size: 12px;
  font-weight: 800;
  color: #6b6783;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}
.pps-text-input {
  width: 100%;
  border: 1.5px solid #ececef;
  border-radius: 10px;
  padding: 11px 13px;
  font-family: inherit;
  font-size: 15px;
  color: #231d45;
  outline: none;
  background: #fff;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.pps-text-input:focus {
  border-color: #00a19a;
}
.pps-text-input::placeholder {
  color: #c0bdcc;
}
.pps-text-textarea {
  min-height: 92px;
  resize: vertical;
  line-height: 1.5;
}
.pps-choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pps-choice {
  background: #f5f5f7;
  border: 1.5px solid transparent;
  border-radius: 999px;
  padding: 7px 13px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #6b6783;
  cursor: pointer;
  transition: all 0.15s;
}
.pps-choice:hover {
  background: #ececef;
  color: #231d45;
}
.pps-choice--active {
  background: #231d45;
  border-color: #231d45;
  color: #fff;
}
.pps-choice--active:hover {
  background: #2e2855;
}
.pps-privacy-note {
  background: #f9f9fb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: #6b6783;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}
.pps-form-error {
  font-size: 13px;
  color: #c73e36;
  background: #fef2f2;
  border-radius: 8px;
  padding: 9px 12px;
  margin: 6px 0 10px;
  font-weight: 600;
}

/* ── Make Contact (mkc-*) ────────────────────────────────────────────
   Matches the new "Make contact" mockup: 3D chat-multi header, role/
   reply chips with 2D SVG icons, icon-prefixed inputs, lock-illustrated
   privacy card, gradient-teal Send button. */
.mkc-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 4px 20px;
}
.mkc-head-ic {
  width: 92px;
  height: 92px;
  object-fit: contain;
  flex-shrink: 0;
}
.mkc-head-text {
  flex: 1;
  min-width: 0;
}
.mkc-head-title {
  font-size: 24px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.mkc-head-sub {
  font-size: 13.5px;
  color: #4a5876;
  font-weight: 500;
  line-height: 1.45;
  margin-top: 6px;
}

.mkc-section {
  margin-bottom: 18px;
}
.mkc-label {
  font-size: 12px;
  font-weight: 800;
  color: #008a84;
  letter-spacing: 1.4px;
  margin-bottom: 10px;
}

/* Chip rows (role + reply preference). This row is reused for two
   different label sets ("Potential buyer"/"Neighbour"/"Agent" and
   "Email"/"Phone"/"Either") — a 1.7fr-weighted first column tuned for
   one set's longest label just squeezed the OTHER set's longest label
   (e.g. "Neighbour" in a 1fr column) into overflow, and made same-length
   labels in the other row render at visibly different widths. Equal
   columns + wrapping text (no nowrap) sizes correctly for both, and
   for any label length without per-row tuning. */
.mkc-chip-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  align-items: stretch;
}
.mkc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 8px;
  background: #ffffff;
  border: 1.5px solid #e7eaee;
  border-radius: 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
  transition: all 0.18s;
  white-space: normal;
  line-height: 1.15;
  text-align: center;
  min-width: 0;
  justify-content: center;
}
.mkc-chip:active {
  transform: scale(0.98);
}
.mkc-chip-ic {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: #e9f6f5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.18s;
}
/* Full-colour 3D PNGs now — no currentColor recolour, just size them
   to fill the chip's icon slot. */
.mkc-chip-ic img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.mkc-chip--active {
  background: #231d45;
  border-color: #231d45;
  color: #ffffff;
}
.mkc-chip--active .mkc-chip-ic {
  background: rgba(255, 255, 255, 0.12);
}

/* Icon-prefixed inputs (name + message) */
.mkc-input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1.5px solid #e7eaee;
  border-radius: 16px;
  padding: 12px 14px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.mkc-input-wrap:focus-within {
  border-color: #00a19a;
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.12);
}
.mkc-input-wrap--textarea {
  align-items: flex-start;
  padding: 14px;
}
.mkc-input-ic {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e9f6f5;
  color: #008a84;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mkc-input-ic svg {
  width: 20px;
  height: 20px;
}
.mkc-input {
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 14.5px;
  font-weight: 500;
  color: #231d45;
  min-width: 0;
}
.mkc-input::placeholder {
  color: #a8b0c2;
  font-weight: 500;
}
.mkc-textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.55;
  padding: 4px 0 0;
}

/* Privacy card with 3D lock illustration */
.mkc-privacy {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 4px 0 20px;
  padding: 16px 18px;
  background: #e9f6f5;
  border-radius: 16px;
}
.mkc-privacy-ic {
  width: 62px;
  height: 62px;
  object-fit: contain;
  flex-shrink: 0;
}
.mkc-privacy-body {
  flex: 1;
  min-width: 0;
}
.mkc-privacy-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
  line-height: 1.25;
}
.mkc-privacy-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: #4a5876;
  margin-top: 4px;
  line-height: 1.45;
}

.mkc-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 17px;
  background: linear-gradient(135deg, #00b0a8, #00a19a);
  color: #ffffff;
  border: 0;
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.2px;
  box-shadow: 0 8px 22px rgba(0, 161, 154, 0.4);
  transition: transform 0.15s ease, opacity 0.15s;
}
.mkc-send svg {
  width: 20px;
  height: 20px;
}
.mkc-send:active:not(:disabled) {
  transform: scale(0.98);
}
.mkc-send:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
.mkc-cancel {
  width: 100%;
  margin-top: 10px;
  padding: 15px;
  background: #ffffff;
  border: 1.5px solid #e7eaee;
  border-radius: 16px;
  color: #231d45;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
}
.mkc-cancel:hover {
  background: #f5f7f9;
}

/* 3D icon images that replaced flat emoji inside icon wrappers */
.pps-ds-placeholder-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 10px;
}
.pps-ds-placeholder-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.pps-psi-icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}
.pps-explain-checklist-icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}
.unpub-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
}
.unpub-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>
