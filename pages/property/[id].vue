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
            ? {
                backgroundImage: `url(${heroImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        "
      >
        <button
          class="pps-hero-btn pps-hero-btn-back"
          type="button"
          @click="goBack"
          aria-label="Back"
        >
          <svg
            width="10"
            height="16"
            viewBox="0 0 10 16"
            fill="none"
            stroke="white"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 1L2 8l6 7" />
          </svg>
        </button>
        <button
          class="pps-hero-btn pps-hero-btn-fav"
          type="button"
          @click="onWishlistToggle"
          aria-label="Favourite"
        >
          <svg
            width="16"
            height="15"
            viewBox="0 0 16 15"
            fill="none"
            stroke="white"
            stroke-width="1.8"
          >
            <path
              d="M8 13.5S1 9.5 1 4.5A3.5 3.5 0 0 1 8 2.9 3.5 3.5 0 0 1 15 4.5C15 9.5 8 13.5 8 13.5z"
              :fill="wishlisted ? 'white' : 'none'"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          class="pps-hero-btn pps-hero-btn-share"
          type="button"
          @click="showShare = true"
          aria-label="Share"
        >
          <svg
            width="14"
            height="16"
            viewBox="0 0 14 16"
            fill="none"
            stroke="white"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
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
          <rect
            x="28"
            y="44"
            width="10"
            height="21"
            fill="#0a0d12"
            opacity="0.3"
          />
          <rect
            x="42"
            y="44"
            width="10"
            height="21"
            fill="#0a0d12"
            opacity="0.3"
          />
        </svg>

        <div class="pps-hero-gradient-overlay" />

        <!-- State-aware hero badges -->
        <div class="pps-hero-badges">
          <div
            v-if="pageState === 'unclaimed'"
            class="pps-badge-passport pps-badge-passport--unclaimed"
          >
            <span class="pps-badge-passport-dot" style="background: #9c98ad" />
            Unclaimed
          </div>
          <div
            v-else-if="pageState === 'progress'"
            class="pps-badge-passport pps-badge-passport--progress"
          >
            <span class="pps-badge-passport-dot" style="background: #e6a23c" />
            Passport in progress
          </div>
          <div v-else class="pps-badge-passport">
            <span class="pps-badge-passport-dot" />
            ✓ Passport available
          </div>
          <div v-if="floodBadgeLabel" class="pps-badge-flood">
            💧 {{ floodBadgeLabel }}
          </div>
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
      </div>

      <!-- ─── SECTION 3: Action Bar ────────────────────────────────── -->
      <div class="pps-action-bar">
        <button
          v-if="pageState === 'unclaimed'"
          class="pps-passport-cta-unlock"
          style="
            background: #231d45;
            box-shadow: 0 6px 22px rgba(35, 29, 69, 0.4);
            margin-bottom: 10px;
          "
          type="button"
          @click="onClaimClick"
        >
          <div class="pps-passport-cta-unlock-left">
            <div class="pps-passport-cta-unlock-title">
              Claim this property — it's free
            </div>
            <div class="pps-passport-cta-unlock-sub">
              Build a verified Passport · TA6, TA7, TA10 · certificates ·
              history
            </div>
          </div>
          <div class="pps-passport-cta-unlock-price">
            <span
              class="pps-passport-cta-unlock-amount"
              style="font-size: 18px; letter-spacing: -0.3px"
              >Free</span
            >
            <span class="pps-passport-cta-unlock-arrow">→</span>
          </div>
        </button>

        <button
          v-else-if="pageState === 'progress'"
          class="pps-passport-cta-unlock"
          style="
            background: linear-gradient(
              135deg,
              #4dd4ce 0%,
              #00a19a 45%,
              #006e68 100%
            );
            box-shadow: 0 6px 22px rgba(0, 161, 154, 0.35);
            margin-bottom: 10px;
          "
          type="button"
          @click="onAccessPassport"
        >
          <div class="pps-passport-cta-unlock-left">
            <div class="pps-passport-cta-unlock-title">
              Preview what's being built
            </div>
            <div class="pps-passport-cta-unlock-sub">
              TA6, TA7, TA10 · certificates · history — live soon
            </div>
          </div>
          <div class="pps-passport-cta-unlock-price">
            <span
              class="pps-passport-cta-unlock-amount"
              style="font-size: 14px; letter-spacing: -0.2px; line-height: 1.3"
              >{{ progressPct }}%<br /><span
                style="font-size: 11px; font-weight: 600; opacity: 0.8"
                >done</span
              ></span
            >
            <span class="pps-passport-cta-unlock-arrow">→</span>
          </div>
        </button>

        <button
          v-else
          class="pps-passport-cta-unlock"
          type="button"
          @click="onAccessPassport"
        >
          <div class="pps-passport-cta-unlock-left">
            <div class="pps-passport-cta-unlock-title">
              Get the full Passport
            </div>
            <div class="pps-passport-cta-unlock-sub">
              Conveyancing questions answered · TA6, TA7, TA10 · certificates ·
              history
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
              pageState === 'progress'
                ? 'Alert when Passport is live'
                : 'Save & get alerts'
            }}</span>
          </button>
          <button
            type="button"
            class="pps-secondary-btn"
            @click="onContactClick"
          >
            <span class="pps-secondary-btn-label">{{
              pageState === 'published'
                ? '💬 Make contact'
                : '💬 Ask a question'
            }}</span>
            <span class="pps-secondary-btn-sub">{{
              pageState === 'published'
                ? 'Owner or neighbour'
                : 'Neighbour or curious buyer'
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
      <div
        class="pps-score-card pps-score-card--clickable"
        @click="onScoreCardTap"
      >
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
          <div class="pps-tile-icon" :style="{ background: tile.iconBg }">
            {{ tile.icon }}
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

      <!-- ─── SECTION 7: Passport Card ─────────────────────────────── -->
      <div v-if="pageState === 'unclaimed'" class="pps-passport-card">
        <div class="pps-score-blob-tr" />
        <div class="pps-score-blob-bl" />
        <div class="pps-passport-eyebrow-row">
          <span class="pps-passport-eyebrow"
            ><span
              class="pps-passport-eyebrow-dot"
              style="background: #9c98ad"
            />Property Passport</span
          >
          <span
            class="pps-passport-price-pill"
            style="background: #f5f5f7; color: #9c98ad; border-color: #ececef"
            >Unclaimed</span
          >
        </div>
        <div class="pps-passport-title">No Passport yet — be the first</div>
        <div class="pps-passport-explain pps-passport-explain--unclaimed">
          <div style="flex: 1">
            <div class="pps-passport-explain-eyebrow">
              Your home's permanent record
            </div>
            <div class="pps-passport-explain-body">
              Why would anyone buy a home without seeing its full history? A
              Passport stays with this property for life — documents,
              certificates, everything verified.
            </div>
          </div>
          <button
            type="button"
            class="pps-explain-btn"
            style="background: #231d45"
            @click.stop="openSheet('explain-unclaimed')"
            aria-label="Why a Property Passport"
          >
            ?
          </button>
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
          style="
            background: #231d45;
            box-shadow: 0 4px 16px rgba(35, 29, 69, 0.35);
            color: white;
          "
          @click="onClaimClick"
        >
          Claim this property — it's free →
        </button>
        <div class="pps-passport-cta-sub">
          Takes 2 minutes · No listing required · Free forever
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
            📋 Continue building your Passport →
          </template>
          <template v-else>🔔 Get notified when published →</template>
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
          <div
            v-if="property.sqft || property.floorAreaSqm"
            class="pps-detail-tile"
          >
            <span class="pps-detail-tile-icon">📐</span>
            <div class="pps-detail-label">Floor area</div>
            <div class="pps-detail-value">
              <template v-if="property.sqft"
                >{{ property.sqft.toLocaleString() }} sqft</template
              >
              <template v-else>{{ property.floorAreaSqm }} m²</template>
            </div>
          </div>
          <div v-if="property.epcRating" class="pps-detail-tile">
            <span class="pps-detail-tile-icon">⚡</span>
            <div class="pps-detail-label">EPC</div>
            <div class="pps-detail-value">
              <span
                class="pps-epc-badge"
                :style="{ background: epcDotColor }"
                >{{ property.epcRating }}</span
              >
              <template v-if="property.epcScore">
                {{ property.epcScore }}/100</template
              >
            </div>
          </div>
          <div v-if="property.uprn" class="pps-detail-tile">
            <span class="pps-detail-tile-icon">🔢</span>
            <div class="pps-detail-label">UPRN</div>
            <div class="pps-detail-value" style="font-size: 12px">
              {{ property.uprn }}
            </div>
          </div>
          <!-- Title number tile (restored) -->
          <div v-if="property.titleNumber" class="pps-detail-tile">
            <span class="pps-detail-tile-icon">📜</span>
            <div class="pps-detail-label">Title number</div>
            <div class="pps-detail-value" style="font-size: 12px">
              {{ property.titleNumber }}
            </div>
          </div>
          <!-- (Flood tile removed from Property Details — the same data is
               already in the explore-grid 'Flood & Risk' tile + its own
               bottom sheet, so a duplicate here only invited drift.) -->
        </div>
      </div>

      <!-- EPC fabric breakdown (restored from old version) — only when we
           have at least one component-level rating from the EPC API. -->
      <div v-if="epcComponents.length > 0" class="pps-details-card">
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
        :property-address="`${property?.city ?? ''}, ${property?.postcode ?? ''}`"
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
        <div class="pps-sheet" :class="{ 'pps-sheet--tall': isTallSheet }">
          <div class="pps-sheet-handle" />

          <!-- ── History (Land Registry) ─────────────────────────── -->
          <template v-if="activeSheet === 'history'">
            <div class="pps-ds-header" style="background: #fff3e0">
              <span class="pps-ds-header-icon">🏠</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Price History</div>
                <div class="pps-ds-header-meta">
                  HM Land Registry · Updated monthly
                </div>
              </div>
            </div>

            <!-- Compound growth banner -->
            <div
              v-if="compoundGrowth"
              style="
                background: #e6f7f6;
                border: 1.5px solid #b2e4e1;
                border-radius: 12px;
                padding: 12px 16px;
                margin: 14px 0 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <div
                style="
                  font-size: 11px;
                  font-weight: 800;
                  color: #6b6783;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                "
              >
                Compound growth · since {{ compoundGrowth.sinceYear }}
              </div>
              <div
                style="font-size: 16px; font-weight: 900"
                :style="{
                  color: compoundGrowth.pct >= 0 ? '#00a19a' : '#c73e36',
                }"
              >
                {{ compoundGrowth.pct >= 0 ? '+' : ''
                }}{{ compoundGrowth.pct.toFixed(1) }}% / yr
              </div>
            </div>

            <!-- Current estimated value -->
            <div
              v-if="estimatedPrice"
              style="
                border: 1.5px solid #ececef;
                border-radius: 14px;
                padding: 16px;
                margin-bottom: 10px;
              "
            >
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 8px;
                "
              >
                <div style="display: flex; align-items: center; gap: 10px">
                  <div
                    style="
                      width: 12px;
                      height: 12px;
                      border-radius: 50%;
                      background: #00a19a;
                      border: 2px solid white;
                      box-shadow: 0 0 0 2px #00a19a;
                      flex-shrink: 0;
                      margin-top: 4px;
                    "
                  />
                  <div>
                    <div
                      style="
                        font-size: 22px;
                        font-weight: 900;
                        color: #231d45;
                        letter-spacing: -0.5px;
                      "
                    >
                      {{ formatPrice(estimatedPrice) }}
                    </div>
                    <div
                      style="font-size: 12px; color: #9c98ad; margin-top: 2px"
                    >
                      {{ priceSourceLabel }}
                    </div>
                  </div>
                </div>
                <div
                  style="
                    background: #e6f7f6;
                    border: 1.5px solid #b2e4e1;
                    border-radius: 20px;
                    padding: 4px 12px;
                    font-size: 12px;
                    font-weight: 800;
                    color: #007e78;
                  "
                >
                  CURRENT
                </div>
              </div>
              <div
                v-if="deltaSinceSold"
                :style="{
                  background: deltaSinceSold.positive ? '#e8f5ee' : '#fdecea',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }"
              >
                <span
                  :style="{
                    color: deltaSinceSold.positive ? '#2eab55' : '#c73e36',
                    fontSize: '12px',
                  }"
                  >{{ deltaSinceSold.positive ? '↑' : '↓' }}</span
                >
                <span
                  :style="{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: deltaSinceSold.positive ? '#1a7a3a' : '#8a1d18',
                  }"
                >
                  {{ deltaSinceSold.positive ? '+' : '−' }}£{{
                    Math.abs(deltaSinceSold.abs).toLocaleString()
                  }}
                  ({{ deltaSinceSold.positive ? '+' : '−'
                  }}{{ Math.abs(deltaSinceSold.pct).toFixed(0) }}%)
                </span>
                <span
                  :style="{
                    fontSize: '10px',
                    color: deltaSinceSold.positive ? '#6b9c78' : '#a86660',
                  }"
                  >since last sold</span
                >
              </div>
            </div>

            <!-- Last sold (most recent record) -->
            <div
              v-if="lastSale"
              style="
                border: 1.5px solid #ececef;
                border-radius: 14px;
                padding: 16px;
                margin-bottom: 14px;
                opacity: 0.85;
              "
            >
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                "
              >
                <div style="display: flex; align-items: center; gap: 10px">
                  <div
                    style="
                      width: 12px;
                      height: 12px;
                      border-radius: 50%;
                      background: white;
                      border: 2px solid #c0bdcc;
                      flex-shrink: 0;
                      margin-top: 4px;
                    "
                  />
                  <div>
                    <div
                      style="
                        font-size: 20px;
                        font-weight: 900;
                        color: #231d45;
                        letter-spacing: -0.5px;
                      "
                    >
                      £{{ Number(lastSale.price).toLocaleString() }}
                    </div>
                    <div
                      style="font-size: 12px; color: #9c98ad; margin-top: 2px"
                    >
                      {{ formatSoldDate(lastSale.date) }}
                    </div>
                  </div>
                </div>
                <div
                  style="
                    background: #f5f5f7;
                    border: 1.5px solid #ececef;
                    border-radius: 20px;
                    padding: 4px 12px;
                    font-size: 12px;
                    font-weight: 800;
                    color: #9c98ad;
                  "
                >
                  SOLD
                </div>
              </div>
            </div>

            <!-- Compound annual growth rate banner (restored from old version) -->
            <div v-if="priceHistoryCagr" class="pps-ds-cagr-banner">
              <div class="pps-ds-cagr-label">
                Compound growth · since {{ priceHistoryCagr.fromYear }}
              </div>
              <div
                class="pps-ds-cagr-val"
                :class="{
                  'pps-ds-cagr-val--up': priceHistoryCagr.cagr >= 0,
                  'pps-ds-cagr-val--down': priceHistoryCagr.cagr < 0,
                }"
              >
                {{ priceHistoryCagr.cagr >= 0 ? '+' : ''
                }}{{ priceHistoryCagr.cagr.toFixed(1) }}% / yr
              </div>
            </div>

            <!-- Price-history timeline (restored from old version) — current
                 estimate at the top, then each historic sale with delta -->
            <div v-if="priceHistoryTimeline.length > 0">
              <div class="pps-ds-section-title">Price timeline</div>
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
                    <span class="pps-ds-tl-pct"
                      >({{ t.delta.positive ? '+' : '−'
                      }}{{ Math.abs(t.delta.pct).toFixed(0) }}%)</span
                    >
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="pps-ds-empty">
              No Land Registry sale records found for this address.
            </div>

            <!-- Nearby sales (restored — the data was already fetched) -->
            <div
              v-if="nearbySales.length > 0"
              class="pps-ds-section-title"
              style="margin-top: 18px"
            >
              Nearby sold prices
            </div>
            <div v-if="nearbySales.length > 0" class="pps-ds-kv-list">
              <div
                v-for="s in nearbySales.slice(0, 5)"
                :key="(s.address || s.date) + s.price"
                class="pps-ds-kv"
              >
                <span class="pps-ds-k">
                  {{ s.address || s.postcode || 'Nearby property' }}
                  <span class="pps-ds-tl-date" style="margin-left: 4px">
                    · {{ formatSoldDate(s.date || s.transferDate || '') }}
                  </span>
                </span>
                <span class="pps-ds-v"
                  >£{{
                    Number(s.price ?? s.amount ?? 0).toLocaleString()
                  }}</span
                >
              </div>
            </div>
            <div
              v-if="property?.tenure || property?.titleNumber || property?.uprn"
              class="pps-ds-section-title"
              style="margin-top: 18px"
            >
              Title details
            </div>
            <div class="pps-ds-kv-list">
              <div v-if="property?.tenure" class="pps-ds-kv">
                <span class="pps-ds-k">Tenure</span>
                <span class="pps-ds-v">{{ property.tenure }}</span>
              </div>
              <div v-if="property?.titleNumber" class="pps-ds-kv">
                <span class="pps-ds-k">Title number</span>
                <span class="pps-ds-v">{{ property.titleNumber }}</span>
              </div>
              <div v-if="property?.uprn" class="pps-ds-kv">
                <span class="pps-ds-k">UPRN</span>
                <span class="pps-ds-v">{{ property.uprn }}</span>
              </div>
            </div>
            <div class="pps-ds-attribution">
              Data from HM Land Registry · Updated monthly
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Street (live energy rank) ─────────────────────────── -->
          <template v-else-if="activeSheet === 'street'">
            <div class="pps-ds-header" style="background: #e8f5e9">
              <span class="pps-ds-header-icon">🏘️</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Street data</div>
                <div class="pps-ds-header-meta">
                  {{ property?.postcode || 'Outcode' }}
                  <template v-if="streetEnergyRank?.total">
                    · {{ streetEnergyRank.total }} properties on file
                  </template>
                </div>
              </div>
            </div>
            <div v-if="streetEnergyRank?.rank">
              <div class="pps-ds-section-title">
                This property vs the street
              </div>
              <div class="pps-ds-rank-card">
                <div class="pps-ds-rank-big">
                  {{ streetEnergyRank.rank
                  }}<span style="font-size: 18px">{{
                    ordinalSuffix(streetEnergyRank.rank)
                  }}</span>
                </div>
                <div class="pps-ds-rank-sub">
                  out of {{ streetEnergyRank.total }} homes for energy
                  efficiency
                </div>
              </div>
            </div>
            <!-- Street EPC distribution -->
            <template
              v-if="(streetEnergyRank?.epcDistribution?.length || 0) > 0"
            >
              <div class="pps-ds-section-title" style="margin-top: 18px">
                Street EPC distribution
              </div>
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
                  <span class="pps-ds-bar-count"
                    >{{ bucket.count
                    }}<template
                      v-if="streetEnergyRank?.yourEpcRating === bucket.letter"
                    >
                      ← you</template
                    ></span
                  >
                </div>
              </div>
            </template>

            <div class="pps-ds-section-title" style="margin-top: 18px">
              Street averages
            </div>
            <div class="pps-ds-kv-list">
              <div v-if="streetEnergyRank?.avgEpcScore" class="pps-ds-kv">
                <span class="pps-ds-k">Avg. EPC score</span>
                <span class="pps-ds-v"
                  >{{ streetEnergyRank.avgEpcScore }} / 100</span
                >
              </div>
              <div v-if="streetEnergyRank?.yourCost" class="pps-ds-kv">
                <span class="pps-ds-k">Your annual cost</span>
                <span class="pps-ds-v"
                  >£{{ streetEnergyRank.yourCost.toLocaleString() }}</span
                >
              </div>
              <div v-if="streetEnergyRank?.averageCost" class="pps-ds-kv">
                <span class="pps-ds-k">Street average</span>
                <span class="pps-ds-v"
                  >£{{ streetEnergyRank.averageCost.toLocaleString() }}</span
                >
              </div>
              <div v-if="streetEnergyRank?.bestCost" class="pps-ds-kv">
                <span class="pps-ds-k">Best on street</span>
                <span class="pps-ds-v"
                  >£{{ streetEnergyRank.bestCost.toLocaleString() }}</span
                >
              </div>
              <div v-if="property?.epcScore" class="pps-ds-kv">
                <span class="pps-ds-k">Your EPC score</span>
                <span class="pps-ds-v">{{ property.epcScore }} / 100</span>
              </div>
            </div>
            <div class="pps-ds-attribution">
              Source: Land Registry + EPC register · Aggregated
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Schools (Ordnance Survey NGD via /enrichment) ─────── -->
          <template v-else-if="activeSheet === 'schools'">
            <div class="pps-ds-header" style="background: #e3f2fd">
              <span class="pps-ds-header-icon">🎓</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Schools</div>
                <div class="pps-ds-header-meta">
                  Source: Ordnance Survey NGD · OS Open Names
                </div>
              </div>
            </div>
            <template v-if="enrichmentSchools.length > 0">
              <div class="pps-ds-section-title">Nearby schools</div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="s in enrichmentSchools"
                  :key="s.name + s.distanceKm"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k"
                    >🎓 {{ s.name
                    }}<span
                      v-if="s.phase && s.phase !== 'School'"
                      class="pps-ds-phase-pill"
                      :class="schoolPhaseClass(s.phase)"
                    >{{ s.phase }}</span></span
                  >
                  <span class="pps-ds-v">{{ s.distanceKm.toFixed(1) }} km</span>
                </div>
              </div>
              <div class="pps-ds-info-note">
                Distances are straight-line. School phases derived from OS
                NGD landuse data. For admissions and Ofsted ratings, check
                the school's official page on GOV.UK.
              </div>
            </template>
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">🎓</div>
              <div class="pps-ds-placeholder-title">
                No schools data on file
              </div>
              <div class="pps-ds-placeholder-sub">
                We couldn't retrieve nearby schools for this address yet — it
                will be backfilled on the next enrichment pass.
              </div>
            </div>
            <div class="pps-ds-attribution">Source: Ordnance Survey NGD</div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Transport (OpenStreetMap via Overpass) ───────────── -->
          <template v-else-if="activeSheet === 'transport'">
            <div class="pps-ds-header" style="background: #f3e5f5">
              <span class="pps-ds-header-icon">🚂</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Transport</div>
                <div class="pps-ds-header-meta">
                  Source: OpenStreetMap · Overpass API
                </div>
              </div>
            </div>

            <!-- Proximity pills -->
            <div
              style="display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px"
            >
              <div
                v-if="enrichmentTrains[0]"
                style="
                  background: #f5f5f7;
                  border-radius: 20px;
                  padding: 7px 13px;
                  font-size: 12px;
                  font-weight: 700;
                  color: #1a1535;
                "
              >
                🚂 {{ enrichmentTrains[0].distanceKm.toFixed(1) }} km station
              </div>
              <div
                v-if="enrichmentBuses[0]"
                style="
                  background: #f5f5f7;
                  border-radius: 20px;
                  padding: 7px 13px;
                  font-size: 12px;
                  font-weight: 700;
                  color: #1a1535;
                "
              >
                🚌 {{ enrichmentBuses[0].distanceKm.toFixed(2) }} km bus
              </div>
              <div
                v-if="enrichmentAirports[0]"
                style="
                  background: #f5f5f7;
                  border-radius: 20px;
                  padding: 7px 13px;
                  font-size: 12px;
                  font-weight: 700;
                  color: #1a1535;
                "
              >
                ✈️ {{ enrichmentAirports[0].distanceKm.toFixed(0) }} km airport
              </div>
            </div>

            <template v-if="enrichmentTrains.length > 0">
              <div class="pps-ds-section-title">Nearest stations</div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="t in enrichmentTrains.slice(0, 5)"
                  :key="t.name + t.distanceKm"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k">🚂 {{ t.name }}</span>
                  <span class="pps-ds-v"
                    >{{ t.distanceKm.toFixed(1) }} km<template
                      v-if="t.operator"
                    >
                      · {{ t.operator }}</template
                    ></span
                  >
                </div>
              </div>
            </template>

            <template v-if="enrichmentBuses.length > 0">
              <div class="pps-ds-section-title" style="margin-top: 18px">
                Bus stops
              </div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="b in enrichmentBuses.slice(0, 5)"
                  :key="(b.name || 'stop') + b.distanceKm"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k"
                    >🚌 {{ b.name || 'Bus Stop'
                    }}<template v-if="b.ref"> ({{ b.ref }})</template></span
                  >
                  <span class="pps-ds-v">{{ b.distanceKm.toFixed(2) }} km</span>
                </div>
              </div>
            </template>

            <template v-if="enrichmentAirports.length > 0">
              <div class="pps-ds-section-title" style="margin-top: 18px">
                Airports
              </div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="a in enrichmentAirports"
                  :key="a.name"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k"
                    >✈️ {{ a.name
                    }}<template v-if="a.iata"> ({{ a.iata }})</template
                    ><span
                      v-if="a.isMajor"
                      class="pps-ds-major-pill"
                      title="Major international hub"
                    >Major</span></span
                  >
                  <span class="pps-ds-v">{{ a.distanceKm.toFixed(1) }} km</span>
                </div>
              </div>
            </template>

            <div
              v-if="
                enrichmentTrains.length === 0 &&
                enrichmentBuses.length === 0 &&
                enrichmentAirports.length === 0
              "
              class="pps-ds-placeholder"
            >
              <div class="pps-ds-placeholder-icon">🚂</div>
              <div class="pps-ds-placeholder-title">
                No transport data on file
              </div>
              <div class="pps-ds-placeholder-sub">
                Will be backfilled on next enrichment pass.
              </div>
            </div>

            <div class="pps-ds-attribution">
              Source: OpenStreetMap contributors
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Train stations (dedicated sheet) ──────────────────── -->
          <template v-else-if="activeSheet === 'trains'">
            <div class="pps-ds-header" style="background: #f3e5f5">
              <span class="pps-ds-header-icon">🚂</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Train stations</div>
                <div class="pps-ds-header-meta">
                  {{ enrichmentTrains.length }} station{{
                    enrichmentTrains.length === 1 ? '' : 's'
                  }}
                  within ~4 km
                </div>
              </div>
            </div>
            <template v-if="enrichmentTrains.length > 0">
              <div class="pps-ds-section-title">Nearest stations</div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="t in enrichmentTrains"
                  :key="t.name + t.distanceKm"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k">🚂 {{ t.name }}</span>
                  <span class="pps-ds-v"
                    >{{ t.distanceKm.toFixed(1) }} km<template
                      v-if="t.operator"
                    >
                      · {{ t.operator }}</template
                    ></span
                  >
                </div>
              </div>
              <div class="pps-ds-info-note">
                Distances are straight-line. Walking distance and journey times
                depend on the route.
              </div>
            </template>
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">🚂</div>
              <div class="pps-ds-placeholder-title">
                {{ transportLookupFailed
                  ? 'Transport data unavailable from this network'
                  : 'No train stations within 4 km' }}
              </div>
              <div class="pps-ds-placeholder-sub">
                <template v-if="transportLookupFailed">
                  OpenStreetMap's Overpass servers couldn't be reached from
                  the backend's network. This usually resolves automatically
                  once deployed to UK/EU infra.
                </template>
                <template v-else>
                  This address has no National Rail or light-rail station
                  within 4 km in OpenStreetMap.
                </template>
              </div>
            </div>
            <div class="pps-ds-attribution">
              Source: OpenStreetMap · Overpass
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Bus stops (dedicated sheet) ──────────────────────── -->
          <template v-else-if="activeSheet === 'buses'">
            <div class="pps-ds-header" style="background: #fff3e0">
              <span class="pps-ds-header-icon">🚌</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Bus stops</div>
                <div class="pps-ds-header-meta">
                  {{ enrichmentBuses.length }} stop{{
                    enrichmentBuses.length === 1 ? '' : 's'
                  }}
                  within ~700 m
                </div>
              </div>
            </div>
            <template v-if="enrichmentBuses.length > 0">
              <div class="pps-ds-section-title">Nearest stops</div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="b in enrichmentBuses"
                  :key="(b.name || 'stop') + b.distanceKm"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k"
                    >🚌 {{ b.name || 'Bus Stop'
                    }}<template v-if="b.ref"> ({{ b.ref }})</template></span
                  >
                  <span class="pps-ds-v">{{ b.distanceKm.toFixed(2) }} km</span>
                </div>
              </div>
              <div class="pps-ds-info-note">
                Bus stop locations from OpenStreetMap. Route numbers and
                operators vary by stop — check Traveline for live timetables.
              </div>
            </template>
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">🚌</div>
              <div class="pps-ds-placeholder-title">
                {{ transportLookupFailed
                  ? 'Bus stop data unavailable from this network'
                  : 'No bus stops within 700 m' }}
              </div>
              <div class="pps-ds-placeholder-sub">
                <template v-if="transportLookupFailed">
                  OpenStreetMap's Overpass servers couldn't be reached from
                  the backend's network. This usually resolves once
                  deployed to UK/EU infra.
                </template>
                <template v-else>
                  No bus stops are mapped within walking distance in
                  OpenStreetMap.
                </template>
              </div>
            </div>
            <div class="pps-ds-attribution">
              Source: OpenStreetMap · Overpass
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Airports (dedicated sheet) ───────────────────────── -->
          <template v-else-if="activeSheet === 'airports'">
            <div class="pps-ds-header" style="background: #e1f5fe">
              <span class="pps-ds-header-icon">✈️</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Airports</div>
                <div class="pps-ds-header-meta">
                  {{ enrichmentAirports.length }} airport{{
                    enrichmentAirports.length === 1 ? '' : 's'
                  }}
                  — majors prioritised, then by distance
                </div>
              </div>
            </div>
            <template v-if="enrichmentAirports.length > 0">
              <div class="pps-ds-section-title">Nearest airports</div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="a in enrichmentAirports"
                  :key="a.name"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k"
                    >✈️ {{ a.name
                    }}<template v-if="a.iata"> ({{ a.iata }})</template
                    ><span
                      v-if="a.isMajor"
                      class="pps-ds-major-pill"
                      title="Major international hub"
                    >Major</span></span
                  >
                  <span class="pps-ds-v">{{ a.distanceKm.toFixed(1) }} km</span>
                </div>
              </div>
              <div class="pps-ds-info-note">
                Distances are straight-line. Drive times depend on route and
                traffic.
              </div>
            </template>
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">✈️</div>
              <div class="pps-ds-placeholder-title">
                {{ airportsLookupFailed
                  ? 'Airport data unavailable from this network'
                  : 'No airports found within 150 km' }}
              </div>
              <div class="pps-ds-placeholder-sub">
                <template v-if="airportsLookupFailed">
                  OpenStreetMap's Overpass servers couldn't be reached from
                  the backend's network. This usually resolves once
                  deployed to UK/EU infra.
                </template>
                <template v-else>
                  Only commercial airports (IATA code, international flag,
                  or "Airport" in their name) are shown.
                </template>
              </div>
            </div>
            <div class="pps-ds-attribution">
              Source: OpenStreetMap · Overpass
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Map (light Leaflet via existing pps-map-iframe) ───── -->
          <template v-else-if="activeSheet === 'map'">
            <div class="pps-ds-header" style="background: #e8f5e9">
              <span class="pps-ds-header-icon">📍</span>
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
              :src="`https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.005},${property.latitude - 0.0025},${property.longitude + 0.005},${property.latitude + 0.0025}&layer=mapnik&marker=${property.latitude},${property.longitude}`"
              loading="lazy"
            />
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">📍</div>
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
            <div class="pps-ds-header" style="background: #fff8e1">
              <span class="pps-ds-header-icon">💧</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">
                  Flood &amp; environmental risk
                </div>
                <div class="pps-ds-header-meta">
                  Source: Environment Agency · GOV.UK
                </div>
              </div>
            </div>
            <div
              v-if="property?.floodRisk"
              class="pps-ds-risk-card"
              :class="{
                'pps-ds-risk-card--high': /high/i.test(property.floodRisk),
                'pps-ds-risk-card--medium': /medium/i.test(property.floodRisk),
                'pps-ds-risk-card--low':
                  /low/i.test(property.floodRisk) &&
                  !/very/i.test(property.floodRisk),
                'pps-ds-risk-card--clear': /very low|unknown/i.test(
                  property.floodRisk,
                ),
              }"
            >
              <div class="pps-ds-risk-label">
                {{ property.floodRisk }} flood risk
              </div>
              <div class="pps-ds-risk-desc">
                <template v-if="/high/i.test(property.floodRisk)">
                  This address sits in an EA-classified high-risk zone (greater
                  than 3.3% chance of flooding in any given year from rivers or
                  sea).
                </template>
                <template v-else-if="/medium/i.test(property.floodRisk)">
                  Medium risk — between 1% and 3.3% annual probability of river
                  or sea flooding.
                </template>
                <template v-else-if="/very low/i.test(property.floodRisk)">
                  Very low risk — less than 0.1% annual probability of river or
                  sea flooding.
                </template>
                <template v-else-if="/low/i.test(property.floodRisk)">
                  Low risk — between 0.1% and 1% annual probability of river or
                  sea flooding.
                </template>
                <template v-else>
                  EA risk classification: {{ property.floodRisk }}.
                </template>
              </div>
            </div>
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">💧</div>
              <div class="pps-ds-placeholder-title">No flood risk on file</div>
              <div class="pps-ds-placeholder-sub">
                We couldn't retrieve an EA flood-risk classification for this
                address yet. It will be backfilled on the next enrichment pass.
              </div>
            </div>

            <!-- Risk breakdown -->
            <div class="pps-ds-section-title" style="margin-top: 18px">
              Risk breakdown
            </div>
            <div class="pps-ds-kv-list">
              <div class="pps-ds-kv">
                <span class="pps-ds-k">River &amp; sea</span>
                <span
                  class="pps-ds-v"
                  :class="floodBreakdownClass(property?.floodRisk)"
                  >{{ property?.floodRisk || 'Not assessed' }}</span
                >
              </div>
              <div v-if="nearestWatercourse" class="pps-ds-kv">
                <span class="pps-ds-k">Nearest watercourse</span>
                <span class="pps-ds-v">{{ nearestWatercourse }}</span>
              </div>
              <div v-for="z in floodZonesList" :key="z.name" class="pps-ds-kv">
                <span class="pps-ds-k">📍 {{ z.name }}</span>
                <span
                  class="pps-ds-v"
                  :class="floodBreakdownClass(z.severity)"
                  >{{ z.severity }}</span
                >
              </div>
              <div class="pps-ds-kv">
                <span class="pps-ds-k">Surface water</span>
                <span class="pps-ds-v pps-ds-v--muted"
                  >Not in EA monitoring feed</span
                >
              </div>
              <div class="pps-ds-kv">
                <span class="pps-ds-k">Groundwater</span>
                <span class="pps-ds-v pps-ds-v--muted"
                  >Not in EA monitoring feed</span
                >
              </div>
              <div class="pps-ds-kv">
                <span class="pps-ds-k">Reservoir</span>
                <span class="pps-ds-v pps-ds-v--muted"
                  >Not in EA monitoring feed</span
                >
              </div>
            </div>

            <!-- Other environmental — links to official postcode lookups -->
            <div class="pps-ds-section-title" style="margin-top: 18px">
              Other environmental
            </div>
            <div class="pps-ds-kv-list">
              <a
                :href="`https://www.ukradon.org/information/ukmaps?utm_source=umovingu`"
                target="_blank"
                rel="noopener"
                class="pps-ds-kv pps-ds-kv--link"
              >
                <span class="pps-ds-k">☢️ Radon risk</span>
                <span class="pps-ds-v pps-ds-v--muted">UKHSA lookup →</span>
              </a>
              <a
                :href="`https://www.bgs.ac.uk/geology-projects/shrink-swell/`"
                target="_blank"
                rel="noopener"
                class="pps-ds-kv pps-ds-kv--link"
              >
                <span class="pps-ds-k">🏚️ Subsidence / clay shrink-swell</span>
                <span class="pps-ds-v pps-ds-v--muted">BGS lookup →</span>
              </a>
              <a
                :href="`https://uk-air.defra.gov.uk/data/local-authority-statistics${property?.city ? `?la=${encodeURIComponent(property.city)}` : ''}`"
                target="_blank"
                rel="noopener"
                class="pps-ds-kv pps-ds-kv--link"
              >
                <span class="pps-ds-k">🌬️ Air quality (NO₂ / PM2.5)</span>
                <span class="pps-ds-v pps-ds-v--muted">DEFRA UK-AIR →</span>
              </a>
              <a
                :href="`https://www.bgs.ac.uk/datasets/geosure/`"
                target="_blank"
                rel="noopener"
                class="pps-ds-kv pps-ds-kv--link"
              >
                <span class="pps-ds-k">🪨 Ground stability</span>
                <span class="pps-ds-v pps-ds-v--muted">BGS GeoSure →</span>
              </a>
            </div>

            <div class="pps-ds-info-note">
              Flood risk data is from the Environment Agency's national mapping.
              It indicates statistical probability — not a guarantee of
              flooding. Surface water, groundwater and reservoir ratings need
              the EA RoFRS bulk dataset. Radon, subsidence, ground stability and
              air quality come from third-party government datasets — links
              above open the official postcode lookup.
            </div>
            <div class="pps-ds-attribution">
              Sources: Environment Agency · UKHSA · BGS · DEFRA
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Planning (placeholder) ────────────────────────────── -->
          <template v-else-if="activeSheet === 'planning'">
            <div class="pps-ds-header" style="background: #f5f5f7">
              <span class="pps-ds-header-icon">📋</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Planning history</div>
                <div class="pps-ds-header-meta">
                  Source: planning.data.gov.uk{{
                    property?.city ? ` · ${property.city}` : ''
                  }}
                </div>
              </div>
            </div>

            <!-- Constraints (heritage, environment, development) -->
            <template v-if="planningConstraints.length > 0">
              <div class="pps-ds-section-title">Planning constraints</div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="(c, i) in planningConstraints"
                  :key="i"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k"
                    >{{ constraintIcon(c.category) }} {{ c.type }}</span
                  >
                  <span class="pps-ds-v">{{ c.name }}</span>
                </div>
              </div>
            </template>

            <!-- Applications (property-specific via UPRN) -->
            <template v-if="planningApplications.length > 0">
              <div class="pps-ds-section-title" style="margin-top: 18px">
                Planning applications
              </div>
              <div class="pps-ds-table">
                <div class="pps-ds-row pps-ds-row--header">
                  <span>Date</span><span>Type</span><span>Status</span>
                </div>
                <div
                  v-for="(a, i) in planningApplications.slice(0, 10)"
                  :key="i"
                  class="pps-ds-row"
                >
                  <span>{{
                    a.decisionDate
                      ? new Date(a.decisionDate).getFullYear()
                      : '—'
                  }}</span>
                  <span class="pps-ds-val">{{
                    (a.applicationType || a.description || 'Application').slice(
                      0,
                      40,
                    )
                  }}</span>
                  <span class="pps-ds-muted">{{
                    a.decision || a.status || '—'
                  }}</span>
                </div>
              </div>
            </template>

            <div
              v-if="
                planningConstraints.length === 0 &&
                planningApplications.length === 0
              "
              class="pps-ds-placeholder"
            >
              <div class="pps-ds-placeholder-icon">📋</div>
              <div class="pps-ds-placeholder-title">
                No constraints or applications on file
              </div>
              <div class="pps-ds-placeholder-sub">
                This address has no conservation area, listed building, Article
                4 direction, Green Belt, AONB or other planning designation in
                <a
                  href="https://www.planning.data.gov.uk"
                  target="_blank"
                  rel="noopener"
                  style="color: #00a19a; font-weight: 700"
                  >planning.data.gov.uk</a
                >, and no planning applications linked to this UPRN.
              </div>
            </div>

            <div class="pps-ds-info-note">
              Constraints come from the national Planning Data platform.
              Applications are matched to this property's UPRN — they may
              exclude older paper records held only by the LA portal.
            </div>
            <div class="pps-ds-attribution">
              Source: planning.data.gov.uk · MHCLG
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Council tax (real band) ───────────────────────────── -->
          <template v-else-if="activeSheet === 'council'">
            <div class="pps-ds-header" style="background: #e8f5e9">
              <span class="pps-ds-header-icon">🏛️</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Council tax</div>
                <div class="pps-ds-header-meta">
                  Source: {{ councilTaxSource || 'VOA'
                  }}<template v-if="councilTaxCouncilName">
                    · {{ councilTaxCouncilName }}</template
                  >
                </div>
              </div>
            </div>
            <div v-if="councilTaxAnnual" class="pps-ds-highlight-box">
              <div class="pps-ds-highlight-num">
                £{{ councilTaxAnnual.toLocaleString() }} / yr
              </div>
              <div class="pps-ds-highlight-sub">
                Band {{ property.councilTaxBand }} · 2024/25 average
                <template v-if="property.city"> · {{ property.city }}</template>
              </div>
            </div>
            <div class="pps-ds-section-title" style="margin-top: 18px">
              All bands · 2024/25 average
            </div>
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
            <div
              v-if="councilTaxAnnual"
              class="pps-ds-kv-list"
              style="margin-top: 14px"
            >
              <div class="pps-ds-kv">
                <span class="pps-ds-k">Monthly equivalent</span>
                <span class="pps-ds-v"
                  >£{{ Math.round(councilTaxAnnual / 12) }} / month</span
                >
              </div>
            </div>

            <!-- Nearby council tax bands (restored — uses the enrichment.councilTax.nearby
                 array that was previously fetched but never rendered). -->
            <template v-if="councilTaxNearby.length > 0">
              <div class="pps-ds-section-title" style="margin-top: 18px">
                Nearby addresses
              </div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="(n, i) in councilTaxNearby.slice(0, 6)"
                  :key="(n.address || 'n') + i"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k">{{
                    n.address || n.postcode || 'Nearby property'
                  }}</span>
                  <span class="pps-ds-v">
                    Band {{ n.band
                    }}<template v-if="n.annualEstimate">
                      · £{{ n.annualEstimate.toLocaleString() }}/yr</template
                    >
                  </span>
                </div>
              </div>
            </template>

            <div class="pps-ds-attribution">
              Source: Valuation Office Agency · 2024/25
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Broadband (Ofcom Connected Nations) ──────────────── -->
          <template v-else-if="activeSheet === 'broadband'">
            <div class="pps-ds-header" style="background: #e3f2fd">
              <span class="pps-ds-header-icon">📶</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Broadband</div>
                <div class="pps-ds-header-meta">
                  Source: Ofcom Connected Nations
                </div>
              </div>
            </div>

            <template v-if="enrichmentBroadband?.available">
              <div
                v-if="enrichmentBroadband.maxDownload"
                class="pps-ds-highlight-box"
              >
                <div class="pps-ds-highlight-num">
                  Up to {{ formatMbps(enrichmentBroadband.maxDownload) }}
                </div>
                <div class="pps-ds-highlight-sub">
                  <template v-if="enrichmentBroadband.fttp"
                    >Full fibre (FTTP) available at this address</template
                  >
                  <template v-else-if="enrichmentBroadband.ultrafast"
                    >Ultrafast available at this address</template
                  >
                  <template v-else-if="enrichmentBroadband.superfast"
                    >Superfast available at this address</template
                  >
                  <template v-else
                    >Standard broadband · upgrade may be possible</template
                  >
                </div>
              </div>

              <div class="pps-ds-section-title" style="margin-top: 18px">
                Technology available
              </div>
              <div class="pps-ds-bb-list">
                <div class="pps-ds-bb-row">
                  <div
                    class="pps-ds-bb-check"
                    :class="
                      enrichmentBroadband.fttp
                        ? 'pps-ds-bb-check--yes'
                        : 'pps-ds-bb-check--no'
                    "
                  >
                    {{ enrichmentBroadband.fttp ? '✓' : '✗' }}
                  </div>
                  <div class="pps-ds-bb-info">
                    <div class="pps-ds-bb-name">Full Fibre (FTTP)</div>
                    <div class="pps-ds-bb-meta">
                      Up to 1,000+ Mbps · Openreach / altnets
                    </div>
                  </div>
                </div>
                <div class="pps-ds-bb-row">
                  <div
                    class="pps-ds-bb-check"
                    :class="
                      enrichmentBroadband.fttc
                        ? 'pps-ds-bb-check--yes'
                        : 'pps-ds-bb-check--no'
                    "
                  >
                    {{ enrichmentBroadband.fttc ? '✓' : '✗' }}
                  </div>
                  <div class="pps-ds-bb-info">
                    <div class="pps-ds-bb-name">Superfast (FTTC)</div>
                    <div class="pps-ds-bb-meta">
                      Up to 80 Mbps · BT Openreach
                    </div>
                  </div>
                </div>
                <div class="pps-ds-bb-row">
                  <div
                    class="pps-ds-bb-check"
                    :class="
                      enrichmentBroadband.cable
                        ? 'pps-ds-bb-check--yes'
                        : 'pps-ds-bb-check--no'
                    "
                  >
                    {{ enrichmentBroadband.cable ? '✓' : '✗' }}
                  </div>
                  <div class="pps-ds-bb-info">
                    <div class="pps-ds-bb-name">Cable (DOCSIS)</div>
                    <div class="pps-ds-bb-meta">
                      Up to 1,130 Mbps · Virgin Media
                    </div>
                  </div>
                </div>
                <div class="pps-ds-bb-row">
                  <div
                    class="pps-ds-bb-check"
                    :class="
                      enrichmentBroadband.ultrafast
                        ? 'pps-ds-bb-check--yes'
                        : 'pps-ds-bb-check--no'
                    "
                  >
                    {{ enrichmentBroadband.ultrafast ? '✓' : '✗' }}
                  </div>
                  <div class="pps-ds-bb-info">
                    <div class="pps-ds-bb-name">Ultrafast (>300 Mbps)</div>
                    <div class="pps-ds-bb-meta">
                      <template v-if="enrichmentBroadband.maxUfDownload">
                        Up to
                        {{ formatMbps(enrichmentBroadband.maxUfDownload) }}
                      </template>
                      <template v-else>Not currently listed</template>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">📶</div>
              <div class="pps-ds-placeholder-title">
                {{ broadbandPlaceholder.title }}
              </div>
              <div class="pps-ds-placeholder-sub">
                {{ broadbandPlaceholder.sub }}
              </div>
              <a
                v-if="property?.postcode"
                :href="`https://checker.ofcom.org.uk/en-gb/broadband-coverage?Postcode=${encodeURIComponent(property.postcode)}`"
                target="_blank"
                rel="noopener"
                class="pps-ds-placeholder-link"
              >
                Check on Ofcom's site →
              </a>
            </div>

            <template v-if="enrichmentMobile?.available">
              <div class="pps-ds-section-title" style="margin-top: 18px">
                Mobile signal (outdoor)
              </div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="op in mobileOperatorRows"
                  :key="op.label"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k">{{ op.label }}</span>
                  <span class="pps-ds-v" :class="op.colour">{{
                    op.summary
                  }}</span>
                </div>
              </div>
            </template>

            <div class="pps-ds-attribution">
              Source: Ofcom Connected Nations · 2024
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Stamp Duty Calculator (live) ──────────────────────── -->
          <template v-else-if="activeSheet === 'stamp-duty'">
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                padding: 4px 0 16px;
              "
            >
              <div
                style="
                  font-size: 17px;
                  font-weight: 900;
                  color: #231d45;
                  letter-spacing: -0.3px;
                "
              >
                Stamp Duty Calculator
              </div>
              <div style="font-size: 12px; color: #9c98ad; font-weight: 600">
                England &amp; NI · 2026
              </div>
            </div>
            <div
              style="
                background: #e6f7f6;
                border: 1.5px solid #b2e4e1;
                border-radius: 14px;
                padding: 16px 18px;
                margin-bottom: 16px;
              "
            >
              <div
                style="
                  font-size: 9px;
                  font-weight: 800;
                  color: #6b6783;
                  letter-spacing: 1.5px;
                  text-transform: uppercase;
                  margin-bottom: 4px;
                "
              >
                Your estimated stamp duty
              </div>
              <div
                style="
                  font-size: 32px;
                  font-weight: 900;
                  color: #00a19a;
                  letter-spacing: -1px;
                "
              >
                £{{ stampDuty.total.toLocaleString() }}
              </div>
              <div style="font-size: 13px; color: #6b6783; margin-top: 4px">
                On a price of £{{ (sdInput || 0).toLocaleString() }}
              </div>
            </div>
            <div
              style="
                border: 1.5px solid #ececef;
                border-radius: 14px;
                padding: 14px 18px;
                margin-bottom: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
              "
            >
              <span style="font-size: 20px; color: #c0bdcc; font-weight: 700"
                >£</span
              >
              <input
                :value="sdInput"
                type="number"
                min="0"
                max="10000000"
                step="1000"
                @input="onSdInput"
                style="
                  border: none;
                  outline: none;
                  font-size: 22px;
                  font-weight: 800;
                  color: #231d45;
                  font-family: inherit;
                  width: 100%;
                  background: transparent;
                  letter-spacing: -0.5px;
                "
              />
            </div>
            <div
              style="
                background: #f5f5f7;
                border-radius: 12px;
                padding: 4px;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 4px;
                margin-bottom: 18px;
              "
            >
              <button
                class="pps-sd-type-btn"
                :class="{ 'pps-sd-type-btn--active': sdType === 'standard' }"
                @click="sdType = 'standard'"
              >
                🏠 Standard
              </button>
              <button
                class="pps-sd-type-btn"
                :class="{ 'pps-sd-type-btn--active': sdType === 'first' }"
                @click="sdType = 'first'"
              >
                🌱 First-time
              </button>
              <button
                class="pps-sd-type-btn"
                :class="{ 'pps-sd-type-btn--active': sdType === 'additional' }"
                @click="sdType = 'additional'"
              >
                🏘️ Additional
              </button>
            </div>
            <div
              style="
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin-bottom: 16px;
              "
            >
              <div
                v-for="(b, i) in stampDuty.bands"
                :key="i"
                class="pps-sd-band"
              >
                <div class="pps-sd-band-top">
                  <span class="pps-sd-band-pct"
                    >{{ Math.round(b.rate * 100) }}%</span
                  >
                  <span class="pps-sd-band-amt"
                    >£{{ b.amount.toLocaleString() }}</span
                  >
                </div>
                <div class="pps-sd-band-track">
                  <div
                    class="pps-sd-band-fill"
                    :style="{
                      width:
                        stampDuty.total > 0
                          ? (b.amount / stampDuty.total) * 100 + '%'
                          : '0%',
                    }"
                  />
                </div>
                <div class="pps-sd-band-range">{{ b.range }}</div>
              </div>
            </div>
            <div style="margin-bottom: 14px">
              <a
                href="https://www.gov.uk/stamp-duty-land-tax"
                target="_blank"
                style="
                  font-size: 13px;
                  font-weight: 700;
                  color: #00a19a;
                  text-decoration: none;
                "
                >Full rates on GOV.UK →</a
              >
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Listed buildings / heritage sites ────────────────────── -->
          <template v-else-if="activeSheet === 'listed'">
            <div class="pps-ds-header" style="background: #fbefd9">
              <span class="pps-ds-header-icon">🏛️</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Heritage sites nearby</div>
                <div class="pps-ds-header-meta">
                  Source: OpenStreetMap · Historic England
                </div>
              </div>
            </div>
            <template v-if="enrichmentListedBuildings.length > 0">
              <div class="pps-ds-section-title">
                {{ enrichmentListedBuildings.length }} listed / historic site{{
                  enrichmentListedBuildings.length === 1 ? '' : 's'
                }}
                within ~800m
              </div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="(b, i) in enrichmentListedBuildings"
                  :key="(b.name || 'site') + i"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k"
                    >🏛️ {{ b.name || 'Unnamed site'
                    }}<template v-if="b.location">
                      · {{ b.location }}</template
                    ></span
                  >
                  <span class="pps-ds-v">{{ b.grade || 'Heritage' }}</span>
                </div>
              </div>
              <div class="pps-ds-info-note">
                Heritage designations may affect what alterations or extensions
                you can make. Always check with the local conservation officer.
              </div>
            </template>
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">🏛️</div>
              <div class="pps-ds-placeholder-title">
                No heritage sites nearby
              </div>
              <div class="pps-ds-placeholder-sub">
                No listed buildings or scheduled monuments within ~800m.
              </div>
            </div>
            <div class="pps-ds-attribution">
              Source: OpenStreetMap heritage tags
            </div>
            <button class="pps-sheet-cancel" @click="closeSheet">Close</button>
          </template>

          <!-- ── Crime / safety (data.police.uk) ────────────────────── -->
          <template v-else-if="activeSheet === 'crime'">
            <div class="pps-ds-header" style="background: #eeedf5">
              <span class="pps-ds-header-icon">🛡️</span>
              <div class="pps-ds-header-text">
                <div class="pps-ds-header-title">Crime in this area</div>
                <div class="pps-ds-header-meta">
                  Source: data.police.uk · last 12 months · 1 mile radius
                </div>
              </div>
            </div>
            <template v-if="enrichmentCrime?.totalLast12m != null">
              <div class="pps-ds-highlight-box">
                <div class="pps-ds-highlight-num">
                  {{ enrichmentCrime.totalLast12m.toLocaleString() }} crimes
                </div>
                <div class="pps-ds-highlight-sub">
                  Over the past 12 months within 1 mile of this address
                </div>
              </div>
              <div class="pps-ds-section-title" style="margin-top: 18px">
                Breakdown by category
              </div>
              <div class="pps-ds-kv-list">
                <div
                  v-for="cat in enrichmentCrime.byCategory"
                  :key="cat.category"
                  class="pps-ds-kv"
                >
                  <span class="pps-ds-k">{{ cat.label }}</span>
                  <span class="pps-ds-v">{{ cat.count.toLocaleString() }}</span>
                </div>
              </div>
              <div class="pps-ds-info-note">
                Counts reflect reported crimes only. Many incidents go
                unreported, and definitions vary by force. Use as a relative
                indicator, not an absolute measure.
              </div>
            </template>
            <div v-else class="pps-ds-placeholder">
              <div class="pps-ds-placeholder-icon">🛡️</div>
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
            <div class="pps-sheet-icon">🔔</div>
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
            <div class="pps-sheet-icon">💬</div>
            <div class="pps-sheet-title">Make contact</div>
            <div class="pps-sheet-sub">
              Drop a note to the owner — whether you're a neighbour with a
              question or a buyer making a quiet approach.
            </div>

            <!-- Role -->
            <div class="pps-field-group">
              <div class="pps-field">
                <label class="pps-field-label">I am a…</label>
                <div class="pps-choice-row">
                  <button
                    v-for="r in ['Potential buyer', 'Neighbour', 'Agent']"
                    :key="r"
                    type="button"
                    class="pps-choice"
                    :class="{ 'pps-choice--active': contactRole === r }"
                    @click="contactRole = r"
                  >
                    {{ r }}
                  </button>
                </div>
              </div>

              <!-- Name -->
              <div class="pps-field">
                <label class="pps-field-label">Your name</label>
                <input
                  v-model="contactName"
                  type="text"
                  class="pps-text-input"
                  placeholder="Alex Quinn"
                />
              </div>

              <!-- Message -->
              <div class="pps-field">
                <label class="pps-field-label">Your message</label>
                <textarea
                  v-model="contactMessage"
                  class="pps-text-input pps-text-textarea"
                  :placeholder="contactPlaceholder"
                />
              </div>

              <!-- Reply preference -->
              <div class="pps-field">
                <label class="pps-field-label">How should they reply?</label>
                <div class="pps-choice-row">
                  <button
                    v-for="r in ['Email', 'Phone', 'Either']"
                    :key="r"
                    type="button"
                    class="pps-choice"
                    :class="{ 'pps-choice--active': contactReplyPref === r }"
                    @click="contactReplyPref = r"
                  >
                    {{ r }}
                  </button>
                </div>
              </div>
            </div>

            <div class="pps-privacy-note">
              <span style="font-size: 15px">🔒</span>
              Your details go only to the verified owner. We never share with
              third parties or agents without your consent.
            </div>

            <p v-if="contactError" class="pps-form-error">{{ contactError }}</p>

            <button
              type="button"
              class="pps-sheet-cta"
              :disabled="contactSubmitting"
              @click="submitOwnerContact"
            >
              {{ contactSubmitting ? 'Sending…' : 'Send message →' }}
            </button>
            <button class="pps-sheet-cancel" @click="closeSheet">Cancel</button>
          </template>

          <!-- ── Passport unlock (Published — £99) ─────────────────── -->
          <template v-else-if="activeSheet === 'passport'">
            <!-- Header branches by state: the badge text + dot colour reflect
                 whether the Passport is verified, being built, or absent. -->
            <div
              class="pps-passport-sheet-header"
              :class="{
                'pps-passport-sheet-header--unclaimed': pageState === 'unclaimed',
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
                <template v-if="pageState === 'unclaimed'">Unclaimed Property</template>
                <template v-else-if="pageState === 'progress'">Passport in progress</template>
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
                  <div class="pps-psi-icon">📄</div>
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
                📋 Continue building your Passport →
              </button>
              <button
                v-else
                class="pps-sheet-cta"
                style="background: #00a19a"
                @click="onWatchClick"
              >
                🔔 Get notified when published →
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
              <div class="pps-passport-sheet-section-title" style="margin-top: 18px">
                What you'd build
              </div>
              <div class="pps-passport-sheet-items">
                <div
                  v-for="f in passportFeatures.slice(0, 5)"
                  :key="f.title"
                  class="pps-psi-row"
                >
                  <div class="pps-psi-icon">📄</div>
                  <div class="pps-psi-text">
                    <div class="pps-psi-name">{{ f.title }}</div>
                    <div class="pps-psi-meta">{{ f.sub }}</div>
                  </div>
                </div>
              </div>
              <button
                class="pps-sheet-cta"
                style="background: #231d45"
                @click="closeSheet(); onClaimClick()"
              >
                Claim this property — it's free →
              </button>
              <div
                style="text-align: center; font-size: 12px; color: #9c98ad; margin-top: 8px"
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
                🔔 Get notified the moment it publishes — be first in the door
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
                  {{ item.icon }}
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
                  📋
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
                  🏛️
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
                  🔧
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
                  📅
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
            <div class="unpub-icon">🪪</div>
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
              🔔 Notify me when it's published
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import RegisterInterestContent from '~/components/property/RegisterInterestContent.vue'
// Owner-claim runs through /claim/[id] (KYC + Land Registry + passport
// issue). ClaimPassportDrawer below is ONLY for the buyer-unlock (£99
// Stripe) path on a published Passport.
import ClaimPassportDrawer from '~/components/property/ClaimPassportDrawer.vue'
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

// Owner-claim is delegated to the global /claim/[id] page, which runs:
//   1. KYC verification (skipped if the user is already approved)
//   2. HM Land Registry ownership check (mandatory per property)
//   3. Passport issuance + redirect to /passportview/{id}
// Every "Claim" entry point on this page just pushes to that route — no
// in-page drawer, no direct POST /passport/create.
const goToClaim = () => router.push(`/claim/${propertyId}`)
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

// Maps OS NGD school phase strings to a CSS class so each chip gets a
// distinct colour. Unknown phases fall back to a neutral grey pill.
function schoolPhaseClass(phase: string | null | undefined): string {
  switch (phase) {
    case 'Pre-Primary':
      return 'pps-ds-phase-pill--prenursery'
    case 'Primary':
      return 'pps-ds-phase-pill--primary'
    case 'Secondary':
      return 'pps-ds-phase-pill--secondary'
    case 'Further Education':
      return 'pps-ds-phase-pill--further'
    case 'Higher Education':
      return 'pps-ds-phase-pill--higher'
    case 'Specialist':
      return 'pps-ds-phase-pill--specialist'
    default:
      return 'pps-ds-phase-pill--default'
  }
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
      color: '#1f7a66',
      class: 'pp-badge-flood--low',
      zone: 'Zone 1',
      pill: 'background:#d1fae5;color:#1f7a66;',
      badgeClass: 'pp-badge-flood--low',
    }
  }
  if (lower.includes('low')) {
    return {
      label: 'Low',
      color: '#1f7a66',
      class: 'pp-badge-flood--low',
      zone: 'Zone 1',
      pill: 'background:#d1fae5;color:#1f7a66;',
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
const floodZonesList = computed(() => {
  const z = enrichment.value?.floodZones ?? []
  return z
    .filter((x: any) => x && x.name && x.severity)
    .slice(0, 3)
    .map((x: any) => ({ name: String(x.name), severity: String(x.severity) }))
})
function floodBreakdownClass(value: any) {
  const v = String(value ?? '').toLowerCase()
  if (!v) return ''
  if (v.includes('severe') || v.includes('high')) return 'pps-ds-v--red'
  if (v.includes('medium') || v.includes('alert')) return 'pps-ds-v--amber'
  if (v.includes('very low') || v.includes('low') || v.includes('no current'))
    return 'pps-ds-v--green'
  return ''
}

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

// Hero image preference order:
//   1. an uploaded property image (property.images / property.imageUrl)
//   2. the Google Street View static-API URL from /enrichment (already
//      generated server-side for any property with lat/lng)
//   3. null — falls through to the SVG house silhouette
const heroImage = computed<string | null>(() => {
  const uploaded = propertyImages.value[0]
  if (uploaded) return uploaded
  const sv = (enrichment.value as any)?.streetViewUrl
  if (typeof sv === 'string' && sv.trim()) return sv
  return null
})

const pageState = computed<'unclaimed' | 'progress' | 'published'>(() => {
  const s = passportStatus.value
  if (s?.passportPublished || property.value?.passportPublished)
    return 'published'
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
  // Prefer the real-time passport progress returned by /passport-status.
  // Falls back to the EPC-signals proxy only when no passport exists yet
  // (so the "Unclaimed" state still shows a meaningful progress bar).
  const realPct = passportStatus.value?.passportProgress?.completionPct
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
          ? `${s.completedTasks} of ${s.totalTasks} task${s.totalTasks === 1 ? '' : 's'} complete`
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
    'EPC Certificate': { icon: '⚡', bg: '#e6f7f6' },
    'Land Registry Title': { icon: '🏛️', bg: '#e6f7f6' },
    'Title Plan': { icon: '🗺️', bg: '#e6f7f6' },
    'TA6 — Property Information': { icon: '📋', bg: '#fff3e0' },
    'TA10 — Fittings & Contents': { icon: '🔧', bg: '#fff3e0' },
    'Gas Safety Record': { icon: '🔥', bg: '#ffe0e0' },
    'Electrical Certificate (EICR)': { icon: '⚡', bg: '#e6f7f6' },
    'TA7 — Leasehold Information': { icon: '📜', bg: '#f3e5f5' },
  }
  return passportFeatures.value
    .filter((f) => f.verified)
    .map((f) => ({
      title: f.title,
      sub: f.sub,
      icon: iconMap[f.title]?.icon ?? '📄',
      bg: iconMap[f.title]?.bg ?? '#f9f9fb',
    }))
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
    value: p.lastSoldPrice
      ? `£${Number(p.lastSoldPrice).toLocaleString()}`
      : 'No sales',
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
  // Schools — live count from enrichment
  const schoolsCount = enrichmentSchools.value.length
  const nearestSchool = enrichmentSchools.value[0]
  tiles.push({
    key: 'schools',
    icon: '🎓',
    iconBg: '#E3F2FD',
    title: 'Schools',
    value: schoolsCount > 0 ? `${schoolsCount} nearby` : '—',
    sub: nearestSchool
      ? `Nearest ${nearestSchool.distanceKm.toFixed(1)} km`
      : 'Tap for distance',
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
    icon: '🚂',
    iconBg: '#F3E5F5',
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
        ? 'Searching OpenStreetMap'
        : tFailed
          ? 'Map sources unreachable — tap to retry'
          : 'No stations found nearby',
  })
  // Bus stops
  const nearestBus = enrichmentBuses.value[0]
  tiles.push({
    key: 'buses',
    icon: '🚌',
    iconBg: '#FFF3E0',
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
        ? 'Searching OpenStreetMap'
        : tFailed
          ? 'Map sources unreachable — tap to retry'
          : 'No stops found within 700 m',
  })
  // Airports — independent failure flag
  const nearestAirport = enrichmentAirports.value[0]
  tiles.push({
    key: 'airports',
    icon: '✈️',
    iconBg: '#E1F5FE',
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
        ? 'Searching OpenStreetMap'
        : aFailed
          ? 'Map sources unreachable — tap to retry'
          : 'No airports within 150 km',
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
      icon: '📋',
      iconBg: '#FAFAFA',
      title: 'Planning',
      pip: count > 0 ? null : 'New',
      value: count > 0 ? `${count} on file` : '—',
      sub:
        constraints.length > 0
          ? `${constraints.length} constraint${constraints.length === 1 ? '' : 's'}`
          : 'Applications on file',
    })
  }
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
        title: 'Council tax',
        value: `Band ${band}`,
        sub: 'Local authority',
      })
    }
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
  // Listed buildings + heritage (data was being fetched but never surfaced).
  if (enrichmentListedBuildings.value.length > 0) {
    tiles.push({
      key: 'listed',
      icon: '🏛️',
      iconBg: '#FBEFD9',
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
      icon: '🛡️',
      iconBg: '#EEEDF5',
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
  // Send the owner through the global KYC + Land Registry claim flow.
  goToClaim()
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

function onWatchClick() {
  openSheet('watch')
}

// True when the logged-in user owns or collaborates on the passport for this
// property. Used to swap "Get notified when published" → "Continue building".
const isPassportOwnerOrCollab = computed<boolean>(() => {
  const s = passportStatus.value
  return !!(s?.isOwner || s?.isCollaborator)
})

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

function onExploreTileClick(key: string) {
  // Every explore tile now opens its matching bottom sheet (prototype parity).
  const map: Record<string, SheetKey | null> = {
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
const SD_BANDS_ADDITIONAL: Array<{ from: number; to: number; rate: number }> = [
  // Additional dwelling surcharge: standard rates + 5%.
  { from: 0, to: 250000, rate: 0.05 },
  { from: 250000, to: 925000, rate: 0.1 },
  { from: 925000, to: 1500000, rate: 0.15 },
  { from: 1500000, to: Infinity, rate: 0.17 },
]
function computeStampDuty(
  price: number,
  type: SdType,
): {
  total: number
  bands: Array<{
    from: number
    to: number
    rate: number
    amount: number
    range: string
  }>
} {
  if (price <= 0) return { total: 0, bands: [] }
  let bands = SD_BANDS_STANDARD
  if (type === 'first' && price <= 625000) bands = SD_BANDS_FIRST
  else if (type === 'first') bands = SD_BANDS_STANDARD
  else if (type === 'additional') bands = SD_BANDS_ADDITIONAL
  const rows = bands.map((b) => {
    const top = Math.min(price, b.to)
    const slice = Math.max(0, top - b.from)
    const amount = Math.round(slice * b.rate)
    const fmt = (n: number) =>
      n === Infinity ? '∞' : `£${Math.round(n).toLocaleString()}`
    return {
      ...b,
      amount,
      range: `${fmt(b.from)} – ${fmt(b.to)}`,
    }
  })
  const total = rows.reduce((s, r) => s + r.amount, 0)
  return { total, bands: rows }
}
const stampDuty = computed(() =>
  computeStampDuty(sdInput.value || 0, sdType.value),
)
function onSdInput(e: Event) {
  const v = parseInt((e.target as HTMLInputElement).value || '0', 10)
  sdInput.value = Number.isFinite(v) ? v : 0
  sdTouched.value = true
}

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

// Compound annual growth rate from most recent sale → current estimate
const compoundGrowth = computed<{ pct: number; sinceYear: number } | null>(
  () => {
    const ls = lastSale.value
    const cur = estimatedPrice.value
    if (!ls?.price || !cur) return null
    const sinceYear = new Date(ls.date).getFullYear()
    if (!sinceYear || Number.isNaN(sinceYear)) return null
    const years = new Date().getFullYear() - sinceYear
    if (years <= 0) return null
    const cagr = (Math.pow(cur / ls.price, 1 / years) - 1) * 100
    return { pct: cagr, sinceYear }
  },
)
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
    showToast({ message: "Saved — we'll keep you posted", iconEmoji: '🔔' })
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

// Human-readable placeholder copy keyed off the failure reason the backend
// returns. Falls back to the generic "data unavailable" line when the shape
// is older / unknown.
const broadbandPlaceholder = computed<{ title: string; sub: string }>(() => {
  const bb = enrichmentBroadband.value
  const reason = bb && bb.available === false ? bb.reason : null
  switch (reason) {
    case 'no_key':
      return {
        title: 'Broadband lookup not configured',
        sub: 'The Ofcom API key is missing on this server. Register at developer.ofcom.org.uk and add OFCOM_API_KEY to .env.',
      }
    case 'unauthorized':
      return {
        title: 'Ofcom rejected the API key',
        sub: 'The configured OFCOM_API_KEY is invalid, expired, or its subscription tier doesn’t include broadband. Regenerate it from your Ofcom developer portal.',
      }
    case 'rate_limited':
      return {
        title: 'Ofcom rate limit reached',
        sub: 'Too many requests for this key today. Wait or upgrade your Ofcom subscription tier.',
      }
    case 'not_found':
    case 'no_premises':
      return {
        title: 'No coverage on file for this postcode',
        sub: 'Ofcom’s database has no entries for this postcode. Newer builds may not be mapped yet.',
      }
    case 'timeout':
      return {
        title: 'Ofcom request timed out',
        sub: 'The Ofcom API didn’t respond in time. Try again — if this persists, Ofcom may be having an outage.',
      }
    case 'network':
      return {
        title: 'Couldn’t reach Ofcom',
        sub: 'Network error talking to Ofcom’s API. Check the server’s outbound connectivity.',
      }
    default:
      return {
        title: 'Broadband data unavailable',
        sub: 'We couldn’t retrieve coverage for this postcode. Check directly on Ofcom’s site below.',
      }
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
  font-size: 15px;
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

/* ─── Hero ──────────────────────────────────────────────────── */
.pps-hero {
  height: 260px;
  background: linear-gradient(
    180deg,
    #b8cfc4 0%,
    #8aab96 40%,
    #6d9080 70%,
    #f5f5f7 100%
  );
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
.pps-hero-btn-back {
  top: 16px;
  left: 16px;
  padding-top: env(safe-area-inset-top);
}
.pps-hero-btn-fav {
  top: 16px;
  right: 60px;
  padding-top: env(safe-area-inset-top);
}
.pps-hero-btn-share {
  top: 16px;
  right: 16px;
  padding-top: env(safe-area-inset-top);
}
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
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.pps-badge-passport {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  background: rgba(26, 21, 53, 0.88);
  color: white;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
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
  font-size: 12px;
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
  font-size: 15px;
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
  font-size: 12px;
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
  font-size: 13px;
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
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.12) 50%,
    transparent 100%
  );
  animation: pps-shimmer 3s ease-in-out infinite;
}
@keyframes pps-shimmer {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  100% {
    transform: translateX(400%) skewX(-15deg);
  }
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
  font-size: 13px;
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
  font-size: 15px;
  font-weight: 700;
  color: #1a1535;
  display: block;
}
.pps-secondary-btn-sub {
  font-size: 11px;
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
  0% {
    box-shadow: 0 0 0 0 rgba(0, 161, 154, 0.6);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(0, 161, 154, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 161, 154, 0);
  }
}
.pps-signal-viewing {
  font-size: 13px;
  font-weight: 600;
  color: #00897b;
}
.pps-signal-count {
  font-size: 12px;
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
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
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
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
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
  font-size: 36px;
  text-align: center;
  margin: 4px 0 8px;
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
.pps-ds-phase-pill {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
  vertical-align: 2px;
  white-space: nowrap;
}
.pps-ds-phase-pill--prenursery {
  color: #6b21a8;
  background: #f3e8ff;
  border: 1px solid #e9d5ff;
}
.pps-ds-phase-pill--primary {
  color: #075985;
  background: #e0f2fe;
  border: 1px solid #bae6fd;
}
.pps-ds-phase-pill--secondary {
  color: #1e40af;
  background: #dbeafe;
  border: 1px solid #bfdbfe;
}
.pps-ds-phase-pill--further {
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fde68a;
}
.pps-ds-phase-pill--higher {
  color: #831843;
  background: #fce7f3;
  border: 1px solid #fbcfe8;
}
.pps-ds-phase-pill--specialist {
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
}
.pps-ds-phase-pill--default {
  color: #4b5563;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
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
.pps-ds-attribution {
  font-size: 12px;
  color: #c0bdcc;
  text-align: center;
  margin-top: 16px;
  font-style: italic;
}

/* Stamp Duty type buttons + bands */
.pps-sd-type-btn {
  background: transparent;
  border: none;
  border-radius: 9px;
  padding: 9px 6px;
  font-size: 12px;
  font-weight: 700;
  color: #6b6783;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.pps-sd-type-btn--active {
  background: #fff;
  color: #231d45;
  box-shadow: 0 2px 8px rgba(35, 29, 69, 0.1);
}
.pps-sd-band {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pps-sd-band-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.pps-sd-band-pct {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.pps-sd-band-amt {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.pps-sd-band-track {
  height: 7px;
  background: #ececef;
  border-radius: 4px;
  overflow: hidden;
}
.pps-sd-band-fill {
  height: 100%;
  background: #00a19a;
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.pps-sd-band-range {
  font-size: 11px;
  color: #9c98ad;
  margin-top: 2px;
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

/* Broadband — row layout */
.pps-ds-bb-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pps-ds-bb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 10px;
}
.pps-ds-bb-check {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 800;
  flex-shrink: 0;
}
.pps-ds-bb-check--yes {
  background: #e8f5ee;
  color: #2eab55;
}
.pps-ds-bb-check--no {
  background: #fef2f2;
  color: #c73e36;
}
.pps-ds-bb-info {
  flex: 1;
  min-width: 0;
}
.pps-ds-bb-name {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.pps-ds-bb-meta {
  font-size: 12px;
  color: #6b6783;
  margin-top: 1px;
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
</style>
