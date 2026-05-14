<template>
  <div class="pps-page">
    <!-- Loading -->
    <div v-if="pageLoading" class="pps-loading-state">
      <div class="pps-spinner" />
      <p>Loading property…</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="pps-loading-state">
      <p>{{ loadError }}</p>
      <button class="pps-back-txt" @click="goBack">Go Back</button>
    </div>

    <template v-else-if="property">
      <!-- ─── SECTION 1: Hero ──────────────────────────────────────── -->
      <div
        class="pps-hero"
        :style="
          heroImage
            ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : undefined
        "
      >
        <button class="pps-hero-btn pps-hero-btn-back" type="button" @click="goBack" aria-label="Back">
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 1L2 8l6 7" />
          </svg>
        </button>
        <button class="pps-hero-btn pps-hero-btn-fav" type="button" @click="onWishlistToggle" aria-label="Favourite">
          <svg width="16" height="15" viewBox="0 0 16 15" fill="none" stroke="white" stroke-width="1.8">
            <path
              d="M8 13.5S1 9.5 1 4.5A3.5 3.5 0 0 1 8 2.9 3.5 3.5 0 0 1 15 4.5C15 9.5 8 13.5 8 13.5z"
              :fill="wishlisted ? 'white' : 'none'"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button class="pps-hero-btn pps-hero-btn-share" type="button" @click="showShare = true" aria-label="Share">
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11.5" cy="2.5" r="1.8" />
            <circle cx="2.5" cy="8" r="1.8" />
            <circle cx="11.5" cy="13.5" r="1.8" />
            <line x1="4.2" y1="7" x2="9.8" y2="3.5" />
            <line x1="4.2" y1="9" x2="9.8" y2="12.5" />
          </svg>
        </button>

        <!-- House silhouette fallback when no real image -->
        <svg
          v-if="!heroImage"
          class="pps-hero-house"
          viewBox="0 0 80 70"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M40 5L5 32h8v33h54V32h8L40 5z" />
          <rect x="28" y="44" width="10" height="21" fill="#0a0d12" opacity="0.3" />
          <rect x="42" y="44" width="10" height="21" fill="#0a0d12" opacity="0.3" />
        </svg>

        <div class="pps-hero-gradient-overlay" />

        <!-- State-aware hero badges -->
        <div class="pps-hero-badges">
          <div v-if="pageState === 'unclaimed'" class="pps-badge-passport pps-badge-passport--unclaimed">
            <span class="pps-badge-passport-dot" style="background: #9c98ad" />
            Unclaimed
          </div>
          <div v-else-if="pageState === 'progress'" class="pps-badge-passport pps-badge-passport--progress">
            <span class="pps-badge-passport-dot" style="background: #e6a23c" />
            Passport in progress
          </div>
          <div v-else class="pps-badge-passport">
            <span class="pps-badge-passport-dot" />
            ✓ Passport available
          </div>
          <div v-if="floodBadgeLabel" class="pps-badge-flood">💧 {{ floodBadgeLabel }}</div>
        </div>
      </div>

      <!-- ─── SECTION 2: Property Identity ────────────────────────── -->
      <div class="pps-identity">
        <div class="pps-identity-address">{{ property.addressLine1 }}</div>
        <div class="pps-identity-suburb">
          <template v-if="property.city">{{ property.city }}</template>
          <template v-if="property.city && property.postcode">, </template>
          <template v-if="property.postcode">{{ property.postcode }}</template>
        </div>

        <div v-if="estimatedPrice" class="pps-price-row">
          <span class="pps-price-value">{{ formatPrice(estimatedPrice) }}</span>
          <span class="pps-price-source">{{ priceSourceLabel }}</span>
        </div>

        <div class="pps-pill-row">
          <span v-if="property.bedrooms" class="pps-pill">🛏 {{ property.bedrooms }} bed</span>
          <span v-if="property.propertyType" class="pps-pill">{{ property.propertyType }}</span>
          <span v-if="property.sqft" class="pps-pill">📐 {{ property.sqft.toLocaleString() }} sqft</span>
          <span v-if="property.yearBuilt" class="pps-pill">📅 {{ property.yearBuilt }}</span>
        </div>
      </div>

      <!-- ─── SECTION 3: Action Bar ────────────────────────────────── -->
      <div class="pps-action-bar">
        <button
          v-if="pageState === 'unclaimed'"
          class="pps-passport-cta-unlock"
          style="background: #231d45; box-shadow: 0 6px 22px rgba(35, 29, 69, 0.4); margin-bottom: 10px"
          type="button"
          @click="onClaimClick"
        >
          <div class="pps-passport-cta-unlock-left">
            <div class="pps-passport-cta-unlock-title">Claim this property — it's free</div>
            <div class="pps-passport-cta-unlock-sub">
              Build a verified Passport · TA6, TA7, TA10 · certificates · history
            </div>
          </div>
          <div class="pps-passport-cta-unlock-price">
            <span class="pps-passport-cta-unlock-amount" style="font-size: 18px; letter-spacing: -0.3px">Free</span>
            <span class="pps-passport-cta-unlock-arrow">→</span>
          </div>
        </button>

        <button
          v-else-if="pageState === 'progress'"
          class="pps-passport-cta-unlock"
          style="background: linear-gradient(135deg, #4dd4ce 0%, #00a19a 45%, #006e68 100%); box-shadow: 0 6px 22px rgba(0, 161, 154, 0.35); margin-bottom: 10px"
          type="button"
          @click="onAccessPassport"
        >
          <div class="pps-passport-cta-unlock-left">
            <div class="pps-passport-cta-unlock-title">Preview what's being built</div>
            <div class="pps-passport-cta-unlock-sub">
              TA6, TA7, TA10 · certificates · history — live soon
            </div>
          </div>
          <div class="pps-passport-cta-unlock-price">
            <span class="pps-passport-cta-unlock-amount" style="font-size: 14px; letter-spacing: -0.2px; line-height: 1.3"
              >{{ progressPct }}%<br /><span style="font-size: 10px; font-weight: 600; opacity: 0.8">done</span></span
            >
            <span class="pps-passport-cta-unlock-arrow">→</span>
          </div>
        </button>

        <button v-else class="pps-passport-cta-unlock" type="button" @click="onAccessPassport">
          <div class="pps-passport-cta-unlock-left">
            <div class="pps-passport-cta-unlock-title">Get the full Passport</div>
            <div class="pps-passport-cta-unlock-sub">
              Conveyancing questions answered · TA6, TA7, TA10 · certificates · history
            </div>
          </div>
          <div class="pps-passport-cta-unlock-price">
            <span class="pps-passport-cta-unlock-amount">£99</span>
            <span class="pps-passport-cta-unlock-arrow">→</span>
          </div>
        </button>

        <div class="pps-secondary-row">
          <button type="button" class="pps-secondary-btn" @click="onWatchClick">
            <span class="pps-secondary-btn-label">{{
              pageState === 'progress' ? '🔔 Get notified' : '🔔 Watch this'
            }}</span>
            <span class="pps-secondary-btn-sub">{{
              pageState === 'progress' ? 'Alert when Passport is live' : 'Save & get alerts'
            }}</span>
          </button>
          <button type="button" class="pps-secondary-btn" @click="onContactClick">
            <span class="pps-secondary-btn-label">{{
              pageState === 'published' ? '💬 Make contact' : '💬 Ask a question'
            }}</span>
            <span class="pps-secondary-btn-sub">{{
              pageState === 'published' ? 'Owner or neighbour' : 'Neighbour or curious buyer'
            }}</span>
          </button>
        </div>
      </div>

      <!-- ─── SECTION 4: Live Signal Bar ──────────────────────────── -->
      <div class="pps-signal-bar">
        <div class="pps-signal-left">
          <span
            v-if="pageState === 'unclaimed'"
            class="pps-pulse-dot"
            style="background: #9c98ad; animation: none"
          />
          <span
            v-else-if="pageState === 'progress'"
            class="pps-pulse-dot"
            style="background: #e6a23c"
          />
          <span v-else class="pps-pulse-dot" />
          <span
            class="pps-signal-viewing"
            :style="
              pageState === 'unclaimed'
                ? { color: '#9c98ad' }
                : pageState === 'progress'
                  ? { color: '#b07a1c' }
                  : undefined
            "
          >
            {{ signalLeftLabel }}
          </span>
        </div>
        <span class="pps-signal-count">{{ signalCountLabel }}</span>
      </div>

      <!-- ─── SECTION 5: HomeScore ─────────────────────────────────── -->
      <div class="pps-score-card pps-score-card--clickable" @click="onScoreCardTap">
        <div class="pps-score-top">
          <div class="pps-score-blob-tr" />
          <div class="pps-score-blob-bl" />

          <div class="pps-gauge-wrap">
            <svg class="pps-gauge-svg" viewBox="0 0 100 100">
              <circle class="pps-gauge-bg" cx="50" cy="50" r="40" />
              <circle
                class="pps-gauge-fill"
                cx="50"
                cy="50"
                r="40"
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
              EPC {{ property.epcRating }}<template v-if="property.epcScore"> ({{ property.epcScore }})</template>
              <template v-if="property.yearBuilt"> · Built {{ property.yearBuilt }}</template>
            </div>
          </div>
        </div>

        <div v-if="epcBars.length > 0" class="pps-score-bottom">
          <div class="pps-epc-header">From the public EPC certificate</div>
          <div class="pps-epc-rows">
            <div v-for="bar in epcBars" :key="bar.label" class="pps-epc-row">
              <span class="pps-epc-label">{{ bar.label }}</span>
              <div class="pps-epc-track">
                <div class="pps-bar-fill" :style="{ width: bar.pct + '%', background: bar.color }" />
              </div>
              <span class="pps-epc-rating">{{ bar.rating }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── SECTION 6: Explore Grid ──────────────────────────────── -->
      <div class="pps-explore-header">
        <span class="pps-explore-title">Explore this property</span>
        <span class="pps-explore-sources">{{ exploreTiles.length }} data sources</span>
      </div>
      <div class="pps-explore-grid">
        <div
          v-for="tile in exploreTiles"
          :key="tile.key"
          class="pps-tile"
          @click="onExploreTileClick(tile.key)"
        >
          <div class="pps-tile-icon" :style="{ background: tile.iconBg }">{{ tile.icon }}</div>
          <div class="pps-tile-title">
            {{ tile.title }}
            <span
              v-if="tile.pip"
              class="pps-tile-new-pip"
              :style="tile.pip === '!' ? { background: '#C73E36' } : undefined"
              >{{ tile.pip }}</span
            >
          </div>
          <div class="pps-tile-value" :style="tile.valueStyle">{{ tile.value }}</div>
          <div class="pps-tile-sub">{{ tile.sub }}</div>
          <div v-if="tile.trend" class="pps-tile-trend">
            <span class="pps-tile-trend-arrow">↑</span> {{ tile.trend }}
          </div>
          <span class="pps-tile-arrow">→</span>
        </div>
      </div>

      <!-- ─── SECTION 7: Passport Card ─────────────────────────────── -->
      <div v-if="pageState === 'unclaimed'" class="pps-passport-card">
        <div class="pps-score-blob-tr" />
        <div class="pps-score-blob-bl" />
        <div class="pps-passport-eyebrow-row">
          <span class="pps-passport-eyebrow"
            ><span class="pps-passport-eyebrow-dot" style="background: #9c98ad" />Property Passport</span
          >
          <span class="pps-passport-price-pill" style="background: #f5f5f7; color: #9c98ad; border-color: #ececef">Unclaimed</span>
        </div>
        <div class="pps-passport-title">No Passport yet — be the first</div>
        <div class="pps-passport-explain pps-passport-explain--unclaimed">
          <div>
            <div class="pps-passport-explain-eyebrow">Your home's permanent record</div>
            <div class="pps-passport-explain-body">
              Why would anyone buy a home without seeing its full history? A Passport stays with this
              property for life — documents, certificates, everything verified.
            </div>
          </div>
        </div>

        <div class="pps-pp-stepper">
          <div class="pps-pp-step pps-pp-step--active">
            <div class="pps-pp-step-dot">1</div>
            <div class="pps-pp-step-label">Claim</div>
          </div>
          <div class="pps-pp-step-line" />
          <div class="pps-pp-step">
            <div class="pps-pp-step-dot">2</div>
            <div class="pps-pp-step-label">Verify</div>
          </div>
          <div class="pps-pp-step-line" />
          <div class="pps-pp-step">
            <div class="pps-pp-step-dot">3</div>
            <div class="pps-pp-step-label">Score</div>
          </div>
          <div class="pps-pp-step-line" />
          <div class="pps-pp-step">
            <div class="pps-pp-step-dot">4</div>
            <div class="pps-pp-step-label">Publish</div>
          </div>
        </div>

        <button
          type="button"
          class="pps-passport-cta"
          style="background: #231d45; box-shadow: 0 4px 16px rgba(35, 29, 69, 0.35); color: white"
          @click="onClaimClick"
        >
          Claim this property — it's free →
        </button>
        <div class="pps-passport-cta-sub">Takes 2 minutes · No listing required · Free forever</div>
      </div>

      <div v-else-if="pageState === 'progress'" class="pps-passport-card">
        <div class="pps-score-blob-tr" />
        <div class="pps-score-blob-bl" />
        <div class="pps-passport-eyebrow-row">
          <span class="pps-passport-eyebrow"
            ><span class="pps-passport-eyebrow-dot" style="background: #00a19a" />Property Passport</span
          >
          <span class="pps-passport-price-pill" style="background: #e6f7f6; color: #007e78; border-color: #b2e4e1"
            >In progress</span
          >
        </div>
        <div class="pps-passport-title" style="color: #00a19a">Passport being built</div>
        <div class="pps-passport-explain pps-passport-explain--progress">
          <div>
            <div class="pps-passport-explain-eyebrow" style="color: #007e78">Stop buying blind</div>
            <div class="pps-passport-explain-body" style="color: #2a5c58">
              This Passport is being built right now — so when you make your move, the answers are
              already there.
            </div>
          </div>
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
          <div v-for="f in passportFeatures" :key="f.title" class="pps-passport-feature">
            <div
              class="pps-feature-icon"
              :class="f.verified ? 'pps-feature-icon--verified' : 'pps-feature-icon--locked'"
            >
              <svg v-if="f.verified" width="14" height="11" viewBox="0 0 14 11" fill="none">
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
                  f.verified ? 'pps-feature-text-title--verified' : 'pps-feature-text-title--locked'
                "
              >
                {{ f.title }}
              </div>
              <div class="pps-feature-text-sub">{{ f.sub }}</div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="pps-passport-cta"
          style="background: #00a19a; box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3); color: white"
          @click="onWatchClick"
        >
          🔔 Get notified when published →
        </button>
        <div class="pps-passport-cta-sub">We'll alert you the moment this Passport goes live</div>
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
          <div>
            <div class="pps-passport-explain-eyebrow" style="color: #b07a1c">
              The HPI check for your home
            </div>
            <div class="pps-passport-explain-body" style="color: #6b4c1a">
              The verified record that should have always existed — and now it does.
            </div>
          </div>
        </div>

        <div class="pps-progress-bar-wrap">
          <div class="pps-progress-bar-fill" style="width: 100%" />
        </div>
        <div class="pps-progress-label">100% complete — Passport live</div>

        <div class="pps-passport-features">
          <div v-for="f in publishedFeatures" :key="f.title" class="pps-passport-feature">
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

        <div class="pps-passport-cta-sub" style="margin-top: 14px; text-align: left">
          Secure payment · Instant access · No subscription
        </div>
      </div>

      <!-- ─── SECTION 8: Running Costs ─────────────────────────────── -->
      <div v-if="costsBoxes.length > 0" class="pps-costs-card">
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
                  <span class="pps-costs-box-value">£{{ box.value.toLocaleString() }}</span>
                  <span class="pps-costs-box-label">{{ box.label }}</span>
                </div>
                <div class="pps-costs-box-back">
                  <div class="pps-costs-box-back-label">Per month</div>
                  <div class="pps-costs-box-back-val">~£{{ Math.round(box.value / 12).toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="pps-costs-attr">Based on EPC assumptions. Costs vary by usage and tariff.</div>
        </div>
      </div>

      <!-- ─── SECTION 9: Property Details ──────────────────────────── -->
      <div class="pps-details-card">
        <div class="pps-details-header">Property details</div>
        <div class="pps-details-grid">
          <div v-if="property.propertyType" class="pps-detail-tile">
            <span class="pps-detail-tile-icon">🏠</span>
            <div class="pps-detail-label">Type</div>
            <div class="pps-detail-value">{{ property.propertyType }}</div>
          </div>
          <div v-if="property.tenure" class="pps-detail-tile">
            <span class="pps-detail-tile-icon">🔑</span>
            <div class="pps-detail-label">Tenure</div>
            <div class="pps-detail-value">{{ property.tenure }}</div>
          </div>
          <div v-if="property.yearBuilt" class="pps-detail-tile">
            <span class="pps-detail-tile-icon">📅</span>
            <div class="pps-detail-label">Year built</div>
            <div class="pps-detail-value">{{ property.yearBuilt }}</div>
          </div>
          <div v-if="property.sqft || property.floorAreaSqm" class="pps-detail-tile">
            <span class="pps-detail-tile-icon">📐</span>
            <div class="pps-detail-label">Floor area</div>
            <div class="pps-detail-value">
              <template v-if="property.sqft">{{ property.sqft.toLocaleString() }} sqft</template>
              <template v-else>{{ property.floorAreaSqm }} m²</template>
            </div>
          </div>
          <div v-if="property.epcRating" class="pps-detail-tile">
            <span class="pps-detail-tile-icon">⚡</span>
            <div class="pps-detail-label">EPC</div>
            <div class="pps-detail-value">
              <span class="pps-epc-badge" :style="{ background: epcDotColor }">{{ property.epcRating }}</span>
              <template v-if="property.epcScore"> {{ property.epcScore }}/100</template>
            </div>
          </div>
          <div v-if="property.uprn" class="pps-detail-tile">
            <span class="pps-detail-tile-icon">🔢</span>
            <div class="pps-detail-label">UPRN</div>
            <div class="pps-detail-value" style="font-size: 11px">{{ property.uprn }}</div>
          </div>
        </div>
      </div>

      <div style="height: 80px" />
    </template>

    <!-- Drawers — wired to the new state-driven CTAs. -->
    <ClaimPassportTypeDrawer
      v-model="showClaimTypeDrawer"
      @close="showClaimTypeDrawer = false"
      @selected="onPassportTypeChosen"
    />
    <ClaimPassportDrawer
      v-model="showClaimDrawer"
      :property-id="propertyId"
      :address="property?.addressLine1 || ''"
      :passport-type="claimPassportType"
      :is-hmo="claimIsHmo"
      @close="showClaimDrawer = false"
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
        :property-address="`${property?.city ?? ''}, ${property?.postcode ?? ''}`"
        :property-price="estimatedPrice ? formatPrice(estimatedPrice) : ''"
        :property-image="propertyImages[0]"
      />
    </BaseDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import RegisterInterestContent from '~/components/property/RegisterInterestContent.vue'
import ClaimPassportDrawer from '~/components/property/ClaimPassportDrawer.vue'
import ClaimPassportTypeDrawer from '~/components/property/ClaimPassportTypeDrawer.vue'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import ImageSlider from '~/components/ui/ImageSlider.vue'
import Toast from '~/components/ui/Toast.vue'
import ShareContent from '~/components/property/ShareContent.vue'
import BottomNav from '~/components/core/BottomNav.vue'
import { useAppToast } from '~/composables/useCustomToast'
import { usePropertySearch } from '~/composables/usePropertySearch'
import { usePassportClaim } from '~/composables/usePassportClaim'
import { usePropertyActions } from '~/composables/usePropertyActions'
import { toTitleCase } from '~/utils/form-helpres'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const propertyId = route.params.id as string

const { getPropertyDetails, formatPrice } = usePropertySearch()
const { getPassportStatus } = usePassportClaim()
const { toastState, showToast, hideToast } = useAppToast()
const { wishlisted, toggleWishlist, fetchActions } = usePropertyActions()

const config = useRuntimeConfig()
const property = ref<any>(null)
const passportStatus = ref<any>(null)
const enrichment = ref<any>(null)
const pageLoading = ref(true)
const loadError = ref('')
const showRegisterInterest = ref(false)
const showShare = ref(false)
const showClaimDrawer = ref(false)
const showClaimTypeDrawer = ref(false)
const claimPassportType = ref<'seller' | 'landlord'>('seller')
const claimIsHmo = ref(false)

const onPassportTypeChosen = (payload: { type: 'seller' | 'landlord'; isHmo: boolean }) => {
  claimPassportType.value = payload.type
  claimIsHmo.value = payload.isHmo
  showClaimTypeDrawer.value = false
  showClaimDrawer.value = true
}
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
    ? (enrichment.value.landRegistrySource ?? 'Land Registry, HPI adjusted')
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
  if (s >= 80) return '#1f7a66'
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

function effToColor(pct: number): string {
  if (pct >= 72) return '#1f7a66'
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
  if (r === 'A' || r === 'B') return '#1f7a66'
  if (r === 'C') return '#00a19a'
  if (r === 'D') return '#92400e'
  if (r === 'E') return '#ea580c'
  return '#dc2626'
})

// ── Flood risk ─────────────────────────────────────────────────────────────────
const floodRiskData = computed(() => {
  const zones = enrichment.value?.floodZones ?? []
  if (!zones.length)
    return {
      label: 'Low',
      color: '#1f7a66',
      class: 'pp-badge-flood--low',
      zone: 'Zone 1',
      pill: 'background:#d1fae5;color:#1f7a66;',
      badgeClass: 'pp-badge-flood--low',
    }
  const sevs = zones.map((z: any) => (z.severity ?? '').toLowerCase())
  if (sevs.some((s: string) => s.includes('severe') || s.includes('warning')))
    return {
      label: 'High',
      color: '#dc2626',
      class: 'pp-badge-flood--high',
      zone: 'Zone 3',
      pill: 'background:#fee2e2;color:#991b1b;',
      badgeClass: 'pp-badge-flood--high',
    }
  if (sevs.some((s: string) => s.includes('alert') || s.includes('high')))
    return {
      label: 'Medium',
      color: '#ea580c',
      class: 'pp-badge-flood--med',
      zone: 'Zone 2',
      pill: 'background:#fef3c7;color:#92400e;',
      badgeClass: 'pp-badge-flood--med',
    }
  return {
    label: 'Low',
    color: '#1f7a66',
    class: 'pp-badge-flood--low',
    zone: 'Zone 1',
    pill: 'background:#d1fae5;color:#1f7a66;',
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
  if (r === 'A' || r === 'B') return 'background:#d1fae5;color:#1f7a66;'
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
      emoji: '🚂',
      type: 'Rail',
      iconClass: 'pp-nearby-icon--purple',
      badgeClass: 'pp-transport-badge--purple',
    })
  for (const b of n.busStops ?? [])
    items.push({
      name: b.name,
      meta: b.distanceKm ? b.distanceKm + ' km' : '',
      emoji: '🚌',
      type: 'Bus',
      iconClass: 'pp-nearby-icon--amber',
      badgeClass: 'pp-transport-badge--amber',
    })
  for (const a of n.airports ?? [])
    items.push({
      name: a.name,
      meta: a.distanceKm ? a.distanceKm + ' km drive' : '',
      emoji: '✈️',
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
        label: `£${(b.from / 1000).toFixed(0)}k – ${b.to === Infinity ? 'above' : '£' + (b.to / 1000).toFixed(0) + 'k'}`,
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
  const images: string[] = []
  const uploaded = (property.value?.images as string[] | null) ?? []
  images.push(...uploaded.filter((u) => typeof u === 'string' && u.trim()))
  const imgUrl = property.value?.imageUrl
  if (imgUrl && imgUrl.trim() && !images.includes(imgUrl)) {
    images.push(imgUrl)
  }
  return images
})

// ─── Prototype-states page model ─────────────────────────────────────────────
// All computeds below feed the new `pps-*` template. They prefer real backend
// data and fall back gracefully when fields are missing.

const heroImage = computed<string | null>(() => propertyImages.value[0] ?? null)

const pageState = computed<'unclaimed' | 'progress' | 'published'>(() => {
  const s = passportStatus.value
  if (s?.passportPublished || property.value?.passportPublished) return 'published'
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
    return "Owner is building a verified Passport — this score will sharpen as data lands."
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
  if (!p) return [] as Array<{ label: string; pct: number; color: string; rating: string }>
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
  // Crude completion proxy: how many key EPC + passport-claim signals are on file.
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

const passportFeatures = computed(() => {
  const p = property.value
  return [
    {
      title: 'EPC Certificate',
      sub: p?.lodgementDate
        ? `Lodged ${new Date(p.lodgementDate).getFullYear()} · Grade ${p.epcRating}`
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
    { title: 'TA6 — Property Information', sub: 'Boundaries, disputes, utilities', verified: false },
    { title: 'TA10 — Fittings & Contents', sub: "What's included in the sale", verified: false },
    { title: 'Gas Safety Record', sub: 'Not yet uploaded', verified: false },
    { title: 'Electrical Certificate (EICR)', sub: 'Not yet uploaded', verified: false },
    { title: 'TA7 — Leasehold Information', sub: 'Service charges, lease terms', verified: false },
  ]
})

const publishedFeatures = computed(() => {
  // For now we mirror the in-progress list but mark everything verified.
  return passportFeatures.value.map((f) => ({ ...f, verified: true }))
})

const exploreTiles = computed(() => {
  const p = property.value
  if (!p) return []
  const tiles: Array<any> = []
  // Property history (Land Registry sold history)
  tiles.push({
    key: 'history',
    icon: '🏠',
    iconBg: '#FFF3E0',
    title: 'Property history',
    value: p.lastSoldPrice ? `£${Number(p.lastSoldPrice).toLocaleString()}` : 'No sales',
    sub: p.lastSoldDate
      ? `Last sold ${new Date(p.lastSoldDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
      : 'Land Registry record',
  })
  // Street data
  tiles.push({
    key: 'street',
    icon: '🏘️',
    iconBg: '#E8F5E9',
    title: 'Street data',
    value: p.postcode ? p.postcode.split(' ')[0] : '—',
    sub: 'Neighbourhood comparison',
  })
  // Schools
  tiles.push({
    key: 'schools',
    icon: '🎓',
    iconBg: '#E3F2FD',
    title: 'Schools',
    value: 'Nearby',
    sub: 'Tap for distance & ratings',
  })
  // Transport
  tiles.push({
    key: 'transport',
    icon: '🚂',
    iconBg: '#F3E5F5',
    title: 'Transport',
    value: 'Stations',
    sub: 'Closest stops & lines',
  })
  // Location & map
  tiles.push({
    key: 'map',
    icon: '📍',
    iconBg: '#E8F5E9',
    title: 'Location & map',
    value: p.postcode || '—',
    sub: p.city || 'View on map',
  })
  // Flood risk
  const flood = (p.floodRisk || '').trim()
  if (flood && flood.toLowerCase() !== 'unknown') {
    const isHigh = /high|medium/i.test(flood)
    tiles.push({
      key: 'flood',
      icon: '💧',
      iconBg: '#FFF8E1',
      title: 'Flood & risk',
      pip: isHigh ? '!' : null,
      value: flood,
      sub: 'Environment Agency',
      valueStyle: isHigh ? { color: '#C73E36' } : undefined,
    })
  }
  // Planning
  tiles.push({
    key: 'planning',
    icon: '📋',
    iconBg: '#FAFAFA',
    title: 'Planning',
    pip: 'New',
    value: '—',
    sub: 'Applications on file',
  })
  // Council tax
  if (p.councilTaxBand) {
    tiles.push({
      key: 'council',
      icon: '🏛️',
      iconBg: '#E8F5E9',
      title: 'Council tax',
      value: `Band ${p.councilTaxBand}`,
      sub: 'Local authority',
    })
  }
  // Broadband
  tiles.push({
    key: 'broadband',
    icon: '📶',
    iconBg: '#E3F2FD',
    title: 'Broadband',
    value: 'Check speeds',
    sub: 'Full fibre availability',
  })
  // Stamp duty
  if (estimatedPrice.value) {
    tiles.push({
      key: 'stamp-duty',
      icon: '🏛️',
      iconBg: '#FCE4EC',
      title: 'Stamp duty',
      value: `${formatPrice(stampDutyEstimate.value)}`,
      sub: 'On estimated value',
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

// FOMO signal-bar copy
const signalLeftLabel = computed<string>(() => {
  if (pageState.value === 'unclaimed') return 'No Passport on this address yet'
  if (pageState.value === 'progress') return 'Owner building a Passport'
  return 'Passport live · verified data'
})
const signalCountLabel = computed<string>(() => {
  // We don't have live stats wired here yet — show a generic searches line.
  return 'View live activity in Passport'
})

// ── Handlers wired to existing drawers/refs ───────────────────────────────────
async function onWishlistToggle() {
  try {
    await toggleWishlist(propertyId)
  } catch {}
}

function onClaimClick() {
  // Open the existing passport-type chooser → claim drawer chain.
  showClaimTypeDrawer.value = true
}

function onAccessPassport() {
  // If the property already has a passport, route to the appropriate view;
  // otherwise fall through to the claim flow.
  const s = passportStatus.value
  if (s?.hasPassport && s?.passportId) {
    router.push(`/passportview/${s.passportId}`)
    return
  }
  showClaimTypeDrawer.value = true
}

function onWatchClick() {
  showRegisterInterest.value = true
}

function onContactClick() {
  router.push(`/owner/${propertyId}`)
}

function onScoreCardTap() {
  router.push(`/homescore/${propertyId}`)
}

function onExploreTileClick(_key: string) {
  // The new explore-grid tiles map onto existing sub-pages where possible.
  // For now, route to the dedicated property pages by tile key. Keys without
  // a dedicated page no-op (they can open inline sheets in a follow-up).
  switch (_key) {
    case 'history':
    case 'street':
    case 'planning':
    case 'flood':
    case 'council':
    case 'broadband':
    case 'stamp-duty':
      // No-op for now; existing sub-pages can be wired by key later.
      return
    case 'schools':
    case 'transport':
    case 'map':
      router.push(`/homescore/street/${propertyId}`)
      return
    default:
      return
  }
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
      html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.3);font-size:13px;">${emoji}</div>`,
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
        L.marker([s.lat, s.lon], { icon: makeDivIcon('#3b82f6', '🎓') })
          .bindPopup(s.name)
          .addTo(map)
    }
    for (const t of n.trains ?? []) {
      if (t.lat && t.lon)
        L.marker([t.lat, t.lon], { icon: makeDivIcon('#8b5cf6', '🚆') })
          .bindPopup(t.name)
          .addTo(map)
    }
    for (const b of n.busStops ?? []) {
      if (b.lat && b.lon)
        L.marker([b.lat, b.lon], { icon: makeDivIcon('#f59e0b', '🚌') })
          .bindPopup(b.name)
          .addTo(map)
    }
    for (const p of n.parks ?? []) {
      if (p.lat && p.lon)
        L.marker([p.lat, p.lon], { icon: makeDivIcon('#00a19a', '🌳') })
          .bindPopup(p.name)
          .addTo(map)
    }
    for (const a of n.airports ?? []) {
      if (a.lat && a.lon)
        L.marker([a.lat, a.lon], { icon: makeDivIcon('#ec4899', '✈️') })
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
  const apiBase = config.public.apiBase as string
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
    }
    passportStatus.value = statusData
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
      const { getPrefillFromProperty, calculateScore } =
        await import('~/utils/homescoreScoring')
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
  const s = passportStatus.value
  if (!s?.hasPassport) {
    router.push(`/claim/${propertyId}`)
  } else if (s.isOwner || s.isCollaborator) {
    router.push(`/passportview/${s.passportId}`)
  } else if (s.isBuyer && s.passportId) {
    router.push(`/buyer-passport/${s.passportId}`)
  } else if (!s.isPublished) {
    showUnpublishedModal.value = true
  } else {
    showClaimTypeDrawer.value = true
  }
}

// Inline claim CTA on the property page now opens the type picker first.
// The chosen type / HMO flag flows through onPassportTypeChosen and is
// passed to ClaimPassportDrawer, which forwards them to claimPassport().
function onClaimCtaClick() {
  showClaimTypeDrawer.value = true
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

async function handleWishlist() {
  const result = await toggleWishlist(propertyId)
  let message = ''
  if (result === 'unauthenticated')
    message = 'Please log in to wishlist properties'
  else if (result === 'error')
    message = 'Something went wrong, please try again'
  else
    message = result.wishlisted
      ? 'Added to your wishlist'
      : 'Removed from wishlist'
  showToast({ message, icon: propertyImages.value[0], duration: 2000 })
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
  font-size: 13px;
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
  to { transform: rotate(360deg); }
}
.pps-back-txt {
  background: none;
  border: 1px solid #ececef;
  border-radius: 9px;
  padding: 8px 14px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
}

/* ─── Hero ──────────────────────────────────────────────────── */
.pps-hero {
  height: 260px;
  background: linear-gradient(180deg, #b8cfc4 0%, #8aab96 40%, #6d9080 70%, #f5f5f7 100%);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.pps-hero-btn {
  position: absolute;
  z-index: 10;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
}
.pps-hero-btn-back { top: 16px; left: 16px; padding-top: env(safe-area-inset-top); }
.pps-hero-btn-fav { top: 16px; right: 60px; padding-top: env(safe-area-inset-top); }
.pps-hero-btn-share { top: 16px; right: 16px; padding-top: env(safe-area-inset-top); }
.pps-hero-house {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  opacity: 0.15;
  pointer-events: none;
}
.pps-hero-gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 100%);
  pointer-events: none;
}
.pps-hero-badges {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  animation: pps-badge-slide-up 0.4s 0.4s both;
}
@keyframes pps-badge-slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.pps-badge-passport {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: rgba(26, 21, 53, 0.88);
  color: white;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 5px;
}
.pps-badge-passport-dot {
  width: 7px;
  height: 7px;
  background: #00b6ae;
  border-radius: 2px;
  flex-shrink: 0;
}
.pps-badge-flood {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.92);
  color: #c73e36;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
}

/* ─── Identity ──────────────────────────────────────────────── */
.pps-identity {
  background: white;
  padding: 18px 18px 14px;
}
.pps-identity-address {
  font-size: 22px;
  font-weight: 800;
  color: #1a1535;
  line-height: 1.1;
}
.pps-identity-suburb {
  font-size: 13px;
  color: #888;
  margin-top: 3px;
}
.pps-price-row {
  margin-top: 12px;
  display: flex;
  align-items: baseline;
  gap: 0;
  flex-wrap: wrap;
}
.pps-price-value {
  font-size: 30px;
  font-weight: 800;
  color: #00a19a;
  line-height: 1;
}
.pps-price-source {
  font-size: 11px;
  color: #aaa;
  margin-left: 10px;
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
  font-size: 12px;
  color: #444;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* ─── Action bar ────────────────────────────────────────────── */
.pps-action-bar {
  margin: 0;
  padding: 14px 16px;
  background: white;
  border-top: 1px solid #f0f0f2;
  border-bottom: 1px solid #f0f0f2;
}
.pps-passport-cta-unlock {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: linear-gradient(135deg, #f0b460 0%, #d4822a 45%, #7a3a05 100%);
  border: none;
  border-radius: 16px;
  padding: 20px 20px;
  margin-bottom: 10px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.15s ease;
  box-shadow: 0 6px 22px rgba(122, 58, 5, 0.35);
  position: relative;
  overflow: hidden;
}
.pps-passport-cta-unlock::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 60%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.12) 50%, transparent 100%);
  animation: pps-shimmer 3s ease-in-out infinite;
}
@keyframes pps-shimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(400%) skewX(-15deg); }
}
.pps-passport-cta-unlock:hover {
  transform: translateY(-1px);
}
.pps-passport-cta-unlock-left {
  flex: 1;
  position: relative;
  z-index: 1;
}
.pps-passport-cta-unlock-title {
  font-size: 15px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.3px;
}
.pps-passport-cta-unlock-sub {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.72);
  margin-top: 4px;
}
.pps-passport-cta-unlock-price {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
.pps-passport-cta-unlock-amount {
  font-size: 26px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.8px;
  line-height: 1;
}
.pps-passport-cta-unlock-arrow {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 700;
}
.pps-secondary-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pps-secondary-btn {
  background: white;
  border: 1.5px solid #ececef;
  border-radius: 12px;
  padding: 12px 10px;
  text-align: center;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.pps-secondary-btn:hover {
  border-color: #231d45;
  box-shadow: 0 4px 12px rgba(35, 29, 69, 0.1);
}
.pps-secondary-btn-label {
  font-size: 13px;
  font-weight: 700;
  color: #1a1535;
  display: block;
}
.pps-secondary-btn-sub {
  font-size: 10px;
  color: #999;
  display: block;
  margin-top: 2px;
}

/* ─── Signal bar ────────────────────────────────────────────── */
.pps-signal-bar {
  background: #f2faf8;
  border-top: 1px solid #e5f4f2;
  border-bottom: 1px solid #e5f4f2;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pps-signal-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pps-pulse-dot {
  width: 6px;
  height: 6px;
  background: #00a19a;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pps-pulse 1.8s infinite;
  display: inline-block;
}
@keyframes pps-pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 161, 154, 0.6); }
  70% { box-shadow: 0 0 0 6px rgba(0, 161, 154, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 161, 154, 0); }
}
.pps-signal-viewing {
  font-size: 12px;
  font-weight: 600;
  color: #00897b;
}
.pps-signal-count {
  font-size: 11px;
  color: #aaa;
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
  background: radial-gradient(circle, rgba(0, 161, 154, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  top: -60px;
  right: -40px;
  pointer-events: none;
}
.pps-score-blob-bl {
  position: absolute;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(35, 29, 69, 0.04) 0%, transparent 70%);
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
  stroke: #00a19a;
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
  font-size: 10px;
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
  font-size: 11.5px;
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
  font-size: 11px;
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
  font-size: 12px;
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
  font-size: 12px;
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
  font-size: 12px;
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
.pps-tile-title {
  font-size: 13px;
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
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}
.pps-tile-trend {
  font-size: 10px;
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
  font-size: 11px;
  color: #ccc;
  line-height: 1;
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
  font-size: 11px;
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
  font-size: 11px;
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
  font-size: 13px;
  font-weight: 800;
  transition: all 0.15s ease;
}
.pps-pp-step--active .pps-pp-step-dot {
  background: #231d45;
  color: white;
}
.pps-pp-step-label {
  font-size: 10px;
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
  font-size: 11px;
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
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
}
.pps-feature-text-title--locked {
  font-size: 13px;
  font-weight: 800;
  color: #c0bdcc;
}
.pps-feature-text-sub {
  font-size: 11px;
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
  font-size: 10px;
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
  font-size: 13px;
  font-weight: 800;
  color: #7a3a05;
}
.pps-costs-header-sub {
  font-size: 11px;
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
  font-size: 13px;
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
  font-size: 10px;
  color: #999;
  margin-top: 3px;
}
.pps-costs-attr {
  font-size: 11px;
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
.pps-details-header {
  padding: 14px 16px 0;
  font-size: 13px;
  font-weight: 800;
  color: #1a1535;
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
.pps-detail-label {
  font-size: 9px;
  font-weight: 800;
  color: #aaa;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.pps-detail-value {
  font-size: 13px;
  font-weight: 700;
  color: #1a1535;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.pps-epc-badge {
  color: white;
  font-size: 11px;
  font-weight: 800;
  border-radius: 5px;
  padding: 1px 6px;
}
</style>
