<template>
  <div class="pp-page mobile-container min-h-screen">
    <!-- Loading -->
    <div v-if="pageLoading" class="pp-loading-state">
      <div class="pp-spinner" />
      <p>Loading property...</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="pp-loading-state">
      <p>{{ loadError }}</p>
      <button class="pp-back-txt" @click="goBack">Go Back</button>
    </div>

    <!-- Content -->
    <template v-else-if="property">
      <!-- ── Hero ── -->
      <div class="pp-hero">
        <!-- SVG house when no real images -->
        <div v-if="propertyImages.length === 0" class="pp-hero-inner">
          <svg
            viewBox="0 0 390 200"
            preserveAspectRatio="xMidYMid slice"
            style="position: absolute; inset: 0; width: 100%; height: 100%"
          >
            <defs>
              <linearGradient id="ppSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#c8ede9" />
                <stop offset="100%" stop-color="#e8f8f6" />
              </linearGradient>
            </defs>
            <rect width="390" height="200" fill="url(#ppSky)" />
            <rect
              x="0"
              y="166"
              width="390"
              height="34"
              fill="#00A19A"
              opacity="0.15"
            />
            <rect
              x="18"
              y="108"
              width="52"
              height="58"
              rx="3"
              fill="#eaf6f4"
              opacity="0.7"
            />
            <polygon
              points="12,108 44,82 76,108"
              fill="#2a5f5a"
              opacity="0.4"
            />
            <rect
              x="28"
              y="120"
              width="12"
              height="11"
              rx="1.5"
              fill="rgba(255,255,255,0.6)"
            />
            <line
              x1="34"
              y1="120"
              x2="34"
              y2="131"
              stroke="#2a5f5a"
              stroke-width="1"
              opacity="0.4"
            />
            <line
              x1="28"
              y1="125"
              x2="40"
              y2="125"
              stroke="#2a5f5a"
              stroke-width="1"
              opacity="0.4"
            />
            <rect
              x="316"
              y="100"
              width="60"
              height="66"
              rx="3"
              fill="#eaf6f4"
              opacity="0.65"
            />
            <polygon
              points="308,100 346,70 384,100"
              fill="#2a5f5a"
              opacity="0.35"
            />
            <rect
              x="326"
              y="114"
              width="13"
              height="12"
              rx="1.5"
              fill="rgba(255,255,255,0.6)"
            />
            <line
              x1="332"
              y1="114"
              x2="332"
              y2="126"
              stroke="#2a5f5a"
              stroke-width="1"
              opacity="0.4"
            />
            <line
              x1="326"
              y1="120"
              x2="339"
              y2="120"
              stroke="#2a5f5a"
              stroke-width="1"
              opacity="0.4"
            />
            <rect
              x="92"
              y="138"
              width="5"
              height="30"
              rx="2.5"
              fill="#00A19A"
              opacity="0.5"
            />
            <ellipse
              cx="94"
              cy="128"
              rx="16"
              ry="14"
              fill="#00A19A"
              opacity="0.28"
            />
            <rect
              x="292"
              y="148"
              width="4"
              height="20"
              rx="2"
              fill="#00A19A"
              opacity="0.4"
            />
            <ellipse
              cx="294"
              cy="140"
              rx="12"
              ry="10"
              fill="#00A19A"
              opacity="0.22"
            />
            <rect
              x="128"
              y="98"
              width="136"
              height="70"
              rx="4"
              fill="#f5fffe"
            />
            <polygon points="118,98 196,52 274,98" fill="#2a5f5a" />
            <polygon
              points="118,98 196,52 274,98"
              fill="none"
              stroke="#1a4040"
              stroke-width="1.5"
            />
            <rect x="236" y="48" width="11" height="22" rx="2" fill="#2a5f5a" />
            <rect
              x="233"
              y="45"
              width="17"
              height="5"
              rx="1.5"
              fill="#1e4a44"
            />
            <rect
              x="140"
              y="108"
              width="24"
              height="20"
              rx="2.5"
              fill="rgba(200,240,236,0.9)"
            />
            <line
              x1="152"
              y1="108"
              x2="152"
              y2="128"
              stroke="#2a5f5a"
              stroke-width="1.5"
              opacity="0.5"
            />
            <line
              x1="140"
              y1="118"
              x2="164"
              y2="118"
              stroke="#2a5f5a"
              stroke-width="1.5"
              opacity="0.5"
            />
            <rect
              x="174"
              y="108"
              width="24"
              height="20"
              rx="2.5"
              fill="rgba(200,240,236,0.9)"
            />
            <line
              x1="186"
              y1="108"
              x2="186"
              y2="128"
              stroke="#2a5f5a"
              stroke-width="1.5"
              opacity="0.5"
            />
            <line
              x1="174"
              y1="118"
              x2="198"
              y2="118"
              stroke="#2a5f5a"
              stroke-width="1.5"
              opacity="0.5"
            />
            <rect
              x="222"
              y="108"
              width="24"
              height="20"
              rx="2.5"
              fill="rgba(200,240,236,0.9)"
            />
            <line
              x1="234"
              y1="108"
              x2="234"
              y2="128"
              stroke="#2a5f5a"
              stroke-width="1.5"
              opacity="0.5"
            />
            <line
              x1="222"
              y1="118"
              x2="246"
              y2="118"
              stroke="#2a5f5a"
              stroke-width="1.5"
              opacity="0.5"
            />
            <rect
              x="180"
              y="138"
              width="24"
              height="30"
              rx="3"
              fill="#00A19A"
            />
            <rect
              x="184"
              y="142"
              width="7"
              height="9"
              rx="1"
              fill="rgba(255,255,255,0.3)"
            />
            <rect
              x="193"
              y="142"
              width="7"
              height="9"
              rx="1"
              fill="rgba(255,255,255,0.3)"
            />
            <circle cx="202" cy="154" r="2.5" fill="rgba(255,255,255,0.8)" />
            <rect x="176" y="167" width="32" height="4" rx="2" fill="#e0f7f4" />
            <polygon
              points="180,171 204,171 208,200 176,200"
              fill="#00A19A"
              opacity="0.12"
            />
            <rect
              x="158"
              y="155"
              width="4"
              height="16"
              rx="2"
              fill="#2a5f5a"
              opacity="0.5"
            />
            <rect
              x="222"
              y="155"
              width="4"
              height="16"
              rx="2"
              fill="#2a5f5a"
              opacity="0.5"
            />
            <line
              x1="162"
              y1="158"
              x2="222"
              y2="158"
              stroke="#2a5f5a"
              stroke-width="1.5"
              stroke-dasharray="4,3"
              opacity="0.3"
            />
          </svg>
        </div>
        <!-- Real images -->
        <div v-else class="pp-hero-inner">
          <ImageSlider :images="propertyImages" />
        </div>

        <!-- Top overlay: back / heart / share -->
        <div class="pp-hero-top">
          <button class="pp-icon-btn" @click="goBack">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style="display: flex; gap: 8px">
            <button
              class="pp-icon-btn"
              :class="{ 'pp-icon-btn--active': wishlisted }"
              @click="handleWishlist"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                :fill="wishlisted ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            </button>
            <button class="pp-icon-btn" @click="showShare = true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Bottom badges -->
        <div class="pp-hero-badges">
          <span
            v-if="passportStatus?.hasPassport"
            class="pp-badge-passport"
          >
            <img
              src="/op-icons/passportview/umu-passport.png"
              alt=""
              class="pp-emoji-ic"
            />
            Passport available
          </span>
          <span class="pp-badge-flood" :class="floodRiskClass"
            >{{ floodRiskLabel }} risk</span
          >
        </div>
      </div>

      <!-- ── Scrollable content ── -->
      <div class="pp-scroll">
        <!-- Address + price block -->
        <div class="pp-info-block">
          <h1 class="pp-address">{{ displayAddress }}</h1>
          <p class="pp-city">
            {{
              [displayArea, displayCity, property.postcode]
                .filter(Boolean)
                .join(', ')
            }}
          </p>
          <div class="pp-price-row">
            <span class="pp-price">{{
              formatPrice(displayEstimatedPrice)
            }}</span>
            <span class="pp-price-src">{{ estimatedPriceSource }}</span>
          </div>
          <div class="pp-pills">
            <span v-if="prop?.bedrooms" class="pp-pill"
              >🛏 {{ prop.bedrooms }} bed</span
            >
            <span v-if="property.propertyType" class="pp-pill">{{
              property.propertyType
            }}</span>
            <span v-if="prop?.sqft" class="pp-pill"
              >📐 {{ prop.sqft.toLocaleString() }} sqft</span
            >
            <span v-if="prop?.yearBuilt" class="pp-pill">{{
              prop.yearBuilt
            }}</span>
          </div>
        </div>

        <!-- Quick action strip -->
        <div class="pp-actions-wrap">
          <div class="pp-action-strip">
            <button class="pp-action-btn" @click="openRegisterInterest">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--brand)"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.56 6.56l.91-.85a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2z"
                />
              </svg>
              Register
            </button>
            <button class="pp-action-btn" @click="tapOwner">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--brand)"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <path
                  d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
                />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
              Tap Owner
            </button>
            <button class="pp-action-btn" @click="handlePassportAction">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--brand)"
                stroke-width="2.2"
                stroke-linecap="round"
              >
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <line x1="8" y1="7" x2="16" y2="7" />
                <line x1="8" y1="11" x2="16" y2="11" />
                <line x1="8" y1="15" x2="12" y2="15" />
              </svg>
              {{ passportBtnLabel }}
            </button>
          </div>
        </div>

        <div class="pp-content-pad">
          <!-- ── HealthScore ── -->
          <div class="pp-section-hdr">
            <span>HealthScore™</span>
            <span class="pp-section-sub">{{
              homeScoreIsAuto ? 'Public EPC · estimated' : 'Calculated score'
            }}</span>
          </div>

          <div class="pp-hs-card">
            <div class="pp-hs-top">
              <!-- Semi-circle gauge -->
              <div class="pp-gauge-wrap">
                <svg
                  viewBox="0 0 110 62"
                  width="110"
                  height="62"
                  style="overflow: visible"
                >
                  <path
                    d="M 10 55 A 45 45 0 0 1 100 55"
                    fill="none"
                    stroke="#eef0f6"
                    stroke-width="10"
                    stroke-linecap="round"
                  />
                  <path
                    d="M 10 55 A 45 45 0 0 1 100 55"
                    fill="none"
                    :stroke="gaugeColor"
                    stroke-width="10"
                    stroke-linecap="round"
                    stroke-dasharray="141.4"
                    :stroke-dashoffset="gaugeDashoffset"
                  />
                </svg>
                <div class="pp-gauge-num" :style="{ color: gaugeColor }">
                  {{ gaugeScore ?? '?' }}
                </div>
              </div>
              <div class="pp-hs-summary">
                <div class="pp-hs-title">{{ gaugeRatingText }}</div>
                <div class="pp-hs-desc">{{ gaugeDesc }}</div>
                <div class="pp-hs-badge-pill" :style="gaugeBadgeStyle">
                  <span
                    class="pp-hs-badge-dot"
                    :style="{ background: gaugeColor }"
                  ></span>
                  {{ epcBadgeText }}
                </div>
              </div>
            </div>

            <!-- EPC component bars -->
            <div v-if="epcComponents.length" class="pp-epc-section">
              <div class="pp-epc-label">From the public EPC certificate</div>
              <div class="pp-epc-bars">
                <div
                  v-for="c in epcComponents"
                  :key="c.label"
                  class="pp-epc-row"
                >
                  <span class="pp-epc-name">{{ c.label }}</span>
                  <div class="pp-epc-track">
                    <div
                      class="pp-epc-fill"
                      :style="{ width: c.pct + '%', background: c.color }"
                    ></div>
                  </div>
                  <span class="pp-epc-desc">{{ c.desc }}</span>
                </div>
              </div>

              <!-- Running costs -->
              <div v-if="hasRunningCosts" class="pp-costs">
                <div class="pp-costs-title">
                  Estimated running costs · current rating
                </div>
                <div class="pp-costs-grid">
                  <div class="pp-cost-box">
                    <div class="pp-cost-val">
                      {{ formatCost(runningCosts.heating) }}
                    </div>
                    <div class="pp-cost-lbl">Heating</div>
                  </div>
                  <div class="pp-cost-box">
                    <div class="pp-cost-val">
                      {{ formatCost(runningCosts.hotWater) }}
                    </div>
                    <div class="pp-cost-lbl">Hot water</div>
                  </div>
                  <div class="pp-cost-box">
                    <div class="pp-cost-val">
                      {{ formatCost(runningCosts.lighting) }}
                    </div>
                    <div class="pp-cost-lbl">Lighting</div>
                  </div>
                  <div class="pp-cost-box pp-cost-box--total">
                    <div class="pp-cost-val pp-cost-val--total">
                      {{ formatCost(runningCosts.total) }}
                    </div>
                    <div class="pp-cost-lbl pp-cost-lbl--total">Total / yr</div>
                  </div>
                </div>
                <p class="pp-costs-note">
                  Based on EPC assumptions. Actual costs vary by usage and
                  tariff. Improvements could reduce this significantly.
                </p>
              </div>
            </div>

            <!-- Homescore CTA -->
            <div
              class="pp-hs-cta-row"
              @click="navigateTo('/homescore/' + property.id)"
            >
              <div>
                <div class="pp-hs-cta-title">Want the full picture?</div>
                <div class="pp-hs-cta-sub">
                  Run a free HealthScore on this address
                </div>
              </div>
              <button class="pp-hs-cta-btn">Free →</button>
            </div>
          </div>

          <!-- ── Property Details ── -->
          <div class="pp-section-hdr" style="margin-top: 4px">
            Property Details
          </div>
          <div class="pp-tile-grid">
            <!-- Type -->
            <div class="pp-tile">
              <div class="pp-tile-badge pp-tile-badge--brand">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                >
                  <path
                    d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
                  />
                  <polyline points="9 21 9 12 15 12 15 21" />
                </svg>
              </div>
              <div class="pp-tile-lbl">Type</div>
              <div
                class="pp-tile-v"
                :class="{ 'pp-tile-v--muted': !property.propertyType }"
              >
                {{ property.propertyType || '—' }}
              </div>
            </div>
            <!-- Tenure -->
            <div class="pp-tile">
              <div class="pp-tile-badge pp-tile-badge--brand">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div class="pp-tile-lbl">Tenure</div>
              <div
                class="pp-tile-v"
                :class="{ 'pp-tile-v--muted': !prop?.tenure }"
              >
                {{ prop?.tenure || '—' }}
              </div>
            </div>
            <!-- Year -->
            <div class="pp-tile">
              <div class="pp-tile-badge pp-tile-badge--brand">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                >
                  <path d="M21 10H3M16 2v4M8 2v4M3 6h18v16H3z" />
                </svg>
              </div>
              <div class="pp-tile-lbl">Year built</div>
              <div
                class="pp-tile-v"
                :class="{ 'pp-tile-v--muted': !prop?.yearBuilt }"
              >
                {{ prop?.yearBuilt || '—' }}
              </div>
            </div>
            <!-- Floor area -->
            <div class="pp-tile">
              <div class="pp-tile-badge pp-tile-badge--brand">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                >
                  <path
                    d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                  />
                  <rect x="9" y="1" width="6" height="4" rx="1" />
                </svg>
              </div>
              <div class="pp-tile-lbl">Floor area</div>
              <div
                class="pp-tile-v"
                :class="{ 'pp-tile-v--muted': !prop?.sqft }"
              >
                {{ prop?.sqft ? prop.sqft.toLocaleString() + ' sqft' : '—' }}
                <span v-if="prop?.floorAreaSqm" class="pp-tile-sub"
                  >{{ Math.round(prop.floorAreaSqm) }} m²</span
                >
              </div>
            </div>
            <!-- EPC -->
            <div class="pp-tile">
              <div class="pp-tile-badge pp-tile-badge--amber">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div class="pp-tile-lbl">EPC rating</div>
              <div v-if="prop?.epcRating" class="pp-tile-v pp-tile-v--inline">
                <span class="pp-tile-letter-chip" :style="epcLetterChipStyle">{{
                  prop.epcRating
                }}</span>
                <span v-if="prop?.epcScore" class="pp-tile-sub"
                  >{{ prop.epcScore }}/100</span
                >
              </div>
              <div v-else class="pp-tile-v pp-tile-v--muted">—</div>
            </div>
            <!-- Flood -->
            <div class="pp-tile">
              <div class="pp-tile-badge pp-tile-badge--green">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div class="pp-tile-lbl">Flood risk</div>
              <div class="pp-tile-v pp-tile-v--inline">
                <span class="pp-tile-letter-chip" :style="floodPillStyle">{{
                  floodRiskLabel
                }}</span>
                <span class="pp-tile-sub">{{ floodZoneLabel }}</span>
              </div>
            </div>
            <!-- Title number -->
            <div v-if="property.titleNumber" class="pp-tile">
              <div class="pp-tile-badge pp-tile-badge--brand">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <div class="pp-tile-lbl">Title number</div>
              <div class="pp-tile-v pp-tile-mono pp-tile-mono--compact">
                {{ property.titleNumber }}
              </div>
            </div>
            <!-- UPRN -->
            <div v-if="property.uprn" class="pp-tile">
              <div class="pp-tile-badge pp-tile-badge--brand">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                >
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div class="pp-tile-lbl">UPRN</div>
              <div class="pp-tile-v pp-tile-mono pp-tile-mono--compact">
                {{ property.uprn }}
              </div>
            </div>
          </div>

          <!-- ── Price History ── -->
          <template v-if="priceHistoryTimeline.length">
            <div class="pp-section-hdr" style="margin-top: 4px">
              <span>Price History</span>
              <span class="pp-section-sub">HM Land Registry</span>
            </div>
            <div class="pp-ph-card">
              <!-- CAGR summary bar -->
              <div v-if="priceHistoryCagr" class="pp-ph-cagr">
                <div class="pp-ph-cagr-lbl">
                  Compound growth · since {{ priceHistoryCagr.fromYear }}
                </div>
                <div
                  class="pp-ph-cagr-val"
                  :class="
                    priceHistoryCagr.cagr >= 0
                      ? 'pp-ph-cagr-val--up'
                      : 'pp-ph-cagr-val--down'
                  "
                >
                  {{ priceHistoryCagr.cagr >= 0 ? '+' : ''
                  }}{{ priceHistoryCagr.cagr.toFixed(1) }}% / yr
                </div>
              </div>
              <div class="pp-ph-timeline">
                <div
                  v-for="(entry, i) in priceHistoryTimeline"
                  :key="i"
                  class="pp-ph-row"
                >
                  <div class="pp-ph-dot-col">
                    <div
                      class="pp-ph-dot"
                      :class="
                        entry.isEstimate
                          ? 'pp-ph-dot--current'
                          : 'pp-ph-dot--sold'
                      "
                    ></div>
                    <div
                      v-if="i < priceHistoryTimeline.length - 1"
                      class="pp-ph-line"
                    ></div>
                  </div>
                  <div class="pp-ph-body">
                    <div class="pp-ph-top">
                      <span class="pp-ph-price">{{
                        formatPrice(entry.price)
                      }}</span>
                      <span
                        class="pp-ph-badge"
                        :class="
                          entry.isEstimate
                            ? 'pp-ph-badge--current'
                            : 'pp-ph-badge--sold'
                        "
                      >
                        {{ entry.isEstimate ? 'Current' : 'Sold' }}
                      </span>
                    </div>
                    <div class="pp-ph-meta">
                      {{
                        entry.isEstimate
                          ? 'HPI adjusted estimate'
                          : formatSaleDate(entry.dateStr)
                      }}
                    </div>
                    <div
                      v-if="entry.delta"
                      class="pp-ph-delta"
                      :class="
                        entry.delta.positive
                          ? 'pp-ph-delta--up'
                          : 'pp-ph-delta--down'
                      "
                    >
                      <svg
                        v-if="entry.delta.positive"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                      >
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      <svg
                        v-else
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                        stroke-linecap="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      {{ formatDelta(entry.delta.amount) }} ({{
                        entry.delta.positive ? '+' : ''
                      }}{{ entry.delta.pct.toFixed(0) }}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ── Location & Map ── -->
          <div class="pp-section-hdr" style="margin-top: 4px">
            Location &amp; Map
          </div>

          <div class="pp-loc-card">
            <!-- Horizontally scrollable icon tab row (sticky) -->
            <div class="pp-loc-tabstrip">
              <div class="pp-loc-tabs" role="tablist">
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'map' }"
                  @click="switchLocTab('map')"
                >
                  <span class="pp-loc-tab-ic">📍</span
                  ><span class="pp-loc-tab-lbl">Map</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'street' }"
                  @click="switchLocTab('street')"
                >
                  <span class="pp-loc-tab-ic">📸</span
                  ><span class="pp-loc-tab-lbl">Street</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'schools' }"
                  @click="switchLocTab('schools')"
                >
                  <span class="pp-loc-tab-ic">🏫</span
                  ><span class="pp-loc-tab-lbl">Schools</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'trains' }"
                  @click="switchLocTab('trains')"
                >
                  <span class="pp-loc-tab-ic">🚆</span
                  ><span class="pp-loc-tab-lbl">Trains</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'buses' }"
                  @click="switchLocTab('buses')"
                >
                  <span class="pp-loc-tab-ic">🚌</span
                  ><span class="pp-loc-tab-lbl">Buses</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'airports' }"
                  @click="switchLocTab('airports')"
                >
                  <span class="pp-loc-tab-ic">✈️</span
                  ><span class="pp-loc-tab-lbl">Airports</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'sales' }"
                  @click="switchLocTab('sales')"
                >
                  <span class="pp-loc-tab-ic">💰</span
                  ><span class="pp-loc-tab-lbl">Sales</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'coverage' }"
                  @click="switchLocTab('coverage')"
                >
                  <span class="pp-loc-tab-ic">📶</span
                  ><span class="pp-loc-tab-lbl">Coverage</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'flood' }"
                  @click="switchLocTab('flood')"
                >
                  <span class="pp-loc-tab-ic">💧</span
                  ><span class="pp-loc-tab-lbl">Flood Risk</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'council' }"
                  @click="switchLocTab('council')"
                >
                  <span class="pp-loc-tab-ic">🏛</span
                  ><span class="pp-loc-tab-lbl">Council Tax</span>
                </button>
                <button
                  class="pp-loc-tab"
                  :class="{ 'pp-loc-tab--on': activeLocTab === 'planning' }"
                  @click="switchLocTab('planning')"
                >
                  <span class="pp-loc-tab-ic">📋</span
                  ><span class="pp-loc-tab-lbl">Planning</span>
                </button>
              </div>
              <div class="pp-loc-fade"></div>
            </div>

            <!-- Map tab (kept mounted via v-show so Leaflet instance survives) -->
            <div v-show="activeLocTab === 'map'" class="pp-loc-panel">
              <div ref="mapEl" class="pp-map-hero"></div>
              <div v-if="nearbyKeyPlaces.length" class="pp-dist-strip">
                <div
                  v-for="(place, i) in nearbyKeyPlaces"
                  :key="i"
                  class="pp-dist-pill"
                >
                  <span class="pp-dist-ic">{{ place.icon }}</span>
                  <span class="pp-dist-txt"
                    ><strong>{{ place.distance }}</strong>
                    {{ place.label }}</span
                  >
                </div>
              </div>
              <div class="pp-map-legend">
                <div class="pp-legend-item">
                  <span class="pp-legend-dot" style="background: #231d45"></span
                  >Property
                </div>
                <div class="pp-legend-item">
                  <span class="pp-legend-dot" style="background: #3b82f6"></span
                  >Schools
                </div>
                <div class="pp-legend-item">
                  <span class="pp-legend-dot" style="background: #8b5cf6"></span
                  >Trains
                </div>
                <div class="pp-legend-item">
                  <span class="pp-legend-dot" style="background: #f59e0b"></span
                  >Bus
                </div>
                <div class="pp-legend-item">
                  <span class="pp-legend-dot" style="background: #10b981"></span
                  >Parks
                </div>
              </div>
            </div>

            <!-- Street tab -->
            <div v-if="activeLocTab === 'street'" class="pp-loc-panel">
              <div class="pp-street-scene pp-street-scene--tall">
                <svg
                  viewBox="0 0 350 220"
                  width="100%"
                  height="100%"
                  style="position: absolute; inset: 0"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <linearGradient id="stSky2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#b8d4e8" />
                      <stop offset="100%" stop-color="#d4e8f0" />
                    </linearGradient>
                  </defs>
                  <rect width="350" height="220" fill="url(#stSky2)" />
                  <rect x="0" y="155" width="350" height="65" fill="#8a9ba8" />
                  <line
                    x1="0"
                    y1="185"
                    x2="350"
                    y2="185"
                    stroke="#fff"
                    stroke-width="2"
                    stroke-dasharray="20,15"
                    opacity="0.4"
                  />
                  <rect x="0" y="145" width="350" height="12" fill="#b0bec8" />
                  <rect
                    x="10"
                    y="80"
                    width="55"
                    height="65"
                    rx="2"
                    fill="#c8d8d0"
                  />
                  <polygon points="4,80 37,52 70,80" fill="#6a8070" />
                  <rect
                    x="72"
                    y="70"
                    width="65"
                    height="75"
                    rx="2"
                    fill="#dce8e0"
                  />
                  <polygon points="65,70 104,38 143,70" fill="#5a7268" />
                  <rect
                    x="144"
                    y="60"
                    width="72"
                    height="85"
                    rx="2"
                    fill="#e8f4f0"
                    stroke="#00A19A"
                    stroke-width="2"
                  />
                  <polygon points="136,60 180,22 224,60" fill="#2a5f5a" />
                  <rect
                    x="161"
                    y="108"
                    width="18"
                    height="37"
                    rx="2"
                    fill="#00A19A"
                  />
                  <circle
                    cx="180"
                    cy="52"
                    r="8"
                    fill="#00A19A"
                    stroke="#fff"
                    stroke-width="1.5"
                  />
                  <text
                    x="180"
                    y="56"
                    text-anchor="middle"
                    font-size="9"
                    fill="#fff"
                    font-family="sans-serif"
                  >
                    ★
                  </text>
                  <rect
                    x="224"
                    y="76"
                    width="60"
                    height="69"
                    rx="2"
                    fill="#d0e0d8"
                  />
                  <polygon points="218,76 254,46 290,76" fill="#607870" />
                  <rect
                    x="292"
                    y="84"
                    width="50"
                    height="61"
                    rx="2"
                    fill="#c8d4cc"
                  />
                  <polygon points="286,84 317,56 348,84" fill="#5a6e64" />
                </svg>
                <div class="pp-street-label">STREET VIEW · PLACEHOLDER</div>
                <div class="pp-street-pin">★ {{ displayAddress }}</div>
              </div>
              <div v-if="nearbySales.length" class="pp-nearby-sold-card">
                <div class="pp-nearby-sold-title">Nearby sold prices</div>
                <div
                  v-for="s in nearbySales.slice(0, 4)"
                  :key="(s.address ?? s.addressLine1) + s.date"
                  class="pp-sold-row"
                >
                  <div>
                    <div class="pp-sold-price">
                      {{ formatPrice(s.price ?? s.amount) }}
                    </div>
                    <div class="pp-sold-meta">
                      {{ s.address ?? s.addressLine1 }} ·
                      {{ formatSaleDate(s.date ?? s.transferDate) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schools tab -->
            <div v-if="activeLocTab === 'schools'" class="pp-loc-panel">
              <div v-if="!enrichment" class="pp-empty-card pp-empty-card--flat">
                <div class="pp-empty-emoji">🏫</div>
                <div class="pp-empty-title">Loading schools…</div>
              </div>
              <div
                v-else-if="!nearbySchools.length"
                class="pp-empty-card pp-empty-card--flat"
              >
                <div class="pp-empty-emoji">🏫</div>
                <div class="pp-empty-title">No schools found</div>
                <div class="pp-empty-sub">
                  We couldn't retrieve school data for this area.
                </div>
              </div>
              <div v-else class="pp-place-list">
                <div
                  v-for="s in nearbySchools"
                  :key="s.name"
                  class="pp-place-row"
                >
                  <div class="pp-place-ic pp-place-ic--blue">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      stroke-width="2.2"
                      stroke-linecap="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                    </svg>
                  </div>
                  <div class="pp-place-info">
                    <div class="pp-place-name">
                      {{ s.name }}
                      <span
                        v-if="s.ofsted === 'Outstanding'"
                        class="pp-place-star"
                        title="Ofsted Outstanding"
                        >★</span
                      >
                      <span
                        v-else-if="s.ofsted === 'Good'"
                        class="pp-place-gooddot"
                        title="Ofsted Good"
                      ></span>
                    </div>
                    <div class="pp-place-meta">
                      {{ s.type ?? 'School'
                      }}<span v-if="s.ofsted"> · Ofsted {{ s.ofsted }}</span>
                    </div>
                  </div>
                  <span v-if="s.distanceKm" class="pp-place-dist"
                    >{{ s.distanceKm }} km</span
                  >
                </div>
              </div>
            </div>

            <!-- Trains tab -->
            <div v-if="activeLocTab === 'trains'" class="pp-loc-panel">
              <div v-if="!enrichment" class="pp-empty-card pp-empty-card--flat">
                <div class="pp-empty-emoji">🚆</div>
                <div class="pp-empty-title">Loading train data…</div>
              </div>
              <div
                v-else-if="!nearbyTrains.length"
                class="pp-empty-card pp-empty-card--flat"
              >
                <div class="pp-empty-emoji">🚆</div>
                <div class="pp-empty-title">No train stations nearby</div>
                <div class="pp-empty-sub">
                  No train stations within 4km of this address.
                </div>
              </div>
              <div v-else class="pp-place-list">
                <div
                  v-for="t in nearbyTrains"
                  :key="t.name"
                  class="pp-place-row"
                >
                  <div class="pp-place-ic pp-nearby-icon--purple">
                    <span style="font-size: 18px">🚆</span>
                  </div>
                  <div class="pp-place-info">
                    <div class="pp-place-name">{{ t.name }}</div>
                    <div class="pp-place-meta">
                      <span v-if="t.distanceKm">{{ t.distanceKm }} km</span>
                      <span v-if="t.operator"> · {{ t.operator }}</span>
                    </div>
                  </div>
                  <span class="pp-transport-badge pp-transport-badge--purple"
                    >Rail</span
                  >
                </div>
              </div>
            </div>

            <!-- Buses tab -->
            <div v-if="activeLocTab === 'buses'" class="pp-loc-panel">
              <div v-if="!enrichment" class="pp-empty-card pp-empty-card--flat">
                <div class="pp-empty-emoji">🚌</div>
                <div class="pp-empty-title">Loading bus data…</div>
              </div>
              <div
                v-else-if="!nearbyBuses.length"
                class="pp-empty-card pp-empty-card--flat"
              >
                <div class="pp-empty-emoji">🚌</div>
                <div class="pp-empty-title">No bus stops nearby</div>
                <div class="pp-empty-sub">
                  No bus stops within 4km of this address.
                </div>
              </div>
              <div v-else class="pp-place-list">
                <div
                  v-for="b in nearbyBuses"
                  :key="b.name"
                  class="pp-place-row"
                >
                  <div class="pp-place-ic pp-nearby-icon--amber">
                    <span style="font-size: 18px">🚌</span>
                  </div>
                  <div class="pp-place-info">
                    <div class="pp-place-name">{{ b.name }}</div>
                    <div class="pp-place-meta">
                      <span v-if="b.distanceKm">{{ b.distanceKm }} km</span>
                      <span v-if="b.ref"> · Ref {{ b.ref }}</span>
                    </div>
                  </div>
                  <span class="pp-transport-badge pp-transport-badge--amber"
                    >Bus</span
                  >
                </div>
              </div>
            </div>

            <!-- Airports tab -->
            <div v-if="activeLocTab === 'airports'" class="pp-loc-panel">
              <div v-if="!enrichment" class="pp-empty-card pp-empty-card--flat">
                <div class="pp-empty-emoji">✈️</div>
                <div class="pp-empty-title">Loading airport data…</div>
              </div>
              <div
                v-else-if="!nearbyAirports.length"
                class="pp-empty-card pp-empty-card--flat"
              >
                <div class="pp-empty-emoji">✈️</div>
                <div class="pp-empty-title">No airports nearby</div>
                <div class="pp-empty-sub">
                  No airports within 50km of this address.
                </div>
              </div>
              <div v-else class="pp-place-list">
                <div
                  v-for="a in nearbyAirports"
                  :key="a.name"
                  class="pp-place-row"
                >
                  <div class="pp-place-ic pp-nearby-icon--sky">
                    <span style="font-size: 18px">✈️</span>
                  </div>
                  <div class="pp-place-info">
                    <div class="pp-place-name">{{ a.name }}</div>
                    <div class="pp-place-meta">
                      <span v-if="a.distanceKm"
                        >{{ a.distanceKm }} km drive</span
                      >
                    </div>
                  </div>
                  <span class="pp-transport-badge pp-transport-badge--sky"
                    >Airport</span
                  >
                </div>
              </div>
            </div>

            <!-- Sales tab (Sales History) -->
            <div v-if="activeLocTab === 'sales'" class="pp-loc-panel">
              <div class="pp-loc-subhead">
                <span>Sales History</span>
                <span class="pp-loc-subhead-src">HM Land Registry</span>
              </div>
              <div class="pp-seg-tabs pp-seg-tabs--two">
                <button
                  class="pp-seg-tab"
                  :class="{ 'pp-seg-tab--on': salesTab === 'property' }"
                  @click="salesTab = 'property'"
                >
                  This property
                  <span v-if="thisSales.length" class="pp-seg-count">{{
                    thisSales.length
                  }}</span>
                </button>
                <button
                  class="pp-seg-tab"
                  :class="{ 'pp-seg-tab--on': salesTab === 'nearby' }"
                  @click="salesTab = 'nearby'"
                >
                  Nearby
                  <span v-if="nearbySales.length" class="pp-seg-count">{{
                    nearbySales.length
                  }}</span>
                </button>
              </div>

              <div v-if="salesTab === 'property'">
                <template v-if="thisSales.length">
                  <div class="pp-sh-stack">
                    <div
                      v-for="(sale, i) in thisSales"
                      :key="i"
                      class="pp-sh-card pp-sh-card--primary"
                    >
                      <div class="pp-sh-top">
                        <span class="pp-sh-price">{{
                          formatPrice(sale.price ?? sale.amount)
                        }}</span>
                        <span class="pp-sh-date">{{
                          formatSaleDate(sale.date ?? sale.transferDate)
                        }}</span>
                      </div>
                      <div
                        v-if="sale.propertyType || sale.tenure || sale.newBuild"
                        class="pp-sh-tags"
                      >
                        <span v-if="sale.propertyType" class="pp-sh-tag">{{
                          sale.propertyType
                        }}</span>
                        <span v-if="sale.tenure" class="pp-sh-tag">{{
                          sale.tenure
                        }}</span>
                        <span
                          v-if="sale.newBuild"
                          class="pp-sh-tag pp-sh-tag--new"
                          >New build</span
                        >
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="pp-empty-card pp-empty-card--flat">
                  <div class="pp-empty-emoji">📊</div>
                  <div class="pp-empty-title">No sales recorded</div>
                  <div class="pp-empty-sub">
                    This property hasn't been sold since 1995, or the address
                    couldn't be matched to Land Registry data.
                  </div>
                </div>
              </div>

              <div v-if="salesTab === 'nearby'">
                <template v-if="nearbySales.length">
                  <div class="pp-sh-stack">
                    <div
                      v-for="(sale, i) in nearbySales"
                      :key="i"
                      class="pp-sh-card pp-sh-card--muted"
                    >
                      <div class="pp-sh-top">
                        <span class="pp-sh-price">{{
                          formatPrice(sale.price ?? sale.amount)
                        }}</span>
                        <span class="pp-sh-date">{{
                          formatSaleDate(sale.date ?? sale.transferDate)
                        }}</span>
                      </div>
                      <div
                        v-if="sale.address ?? sale.addressLine1"
                        class="pp-sh-addr"
                      >
                        {{ sale.address ?? sale.addressLine1
                        }}<span v-if="sale.town">, {{ sale.town }}</span>
                      </div>
                      <div
                        v-if="sale.propertyType || sale.tenure || sale.newBuild"
                        class="pp-sh-tags"
                      >
                        <span v-if="sale.propertyType" class="pp-sh-tag">{{
                          sale.propertyType
                        }}</span>
                        <span v-if="sale.tenure" class="pp-sh-tag">{{
                          sale.tenure
                        }}</span>
                        <span
                          v-if="sale.newBuild"
                          class="pp-sh-tag pp-sh-tag--new"
                          >New build</span
                        >
                      </div>
                    </div>
                  </div>
                  <p class="pp-src-note" style="padding: 0 4px">
                    Most recent sales within the same postcode.
                  </p>
                </template>
                <div v-else class="pp-empty-card pp-empty-card--flat">
                  <div class="pp-empty-emoji">📍</div>
                  <div class="pp-empty-title">No nearby sales</div>
                  <div class="pp-empty-sub">
                    There have been no recorded sales nearby in the last 3
                    years.
                  </div>
                </div>
              </div>
            </div>

            <!-- Coverage tab -->
            <div v-if="activeLocTab === 'coverage'" class="pp-loc-panel">
              <div class="pp-loc-subhead">
                <span>Coverage</span>
                <span class="pp-loc-subhead-src">Ofcom</span>
              </div>
              <div class="pp-seg-tabs pp-seg-tabs--three">
                <button
                  class="pp-seg-tab"
                  :class="{ 'pp-seg-tab--on': coverageTab === 'broadband' }"
                  @click="coverageTab = 'broadband'"
                >
                  Broadband
                </button>
                <button
                  class="pp-seg-tab"
                  :class="{ 'pp-seg-tab--on': coverageTab === 'mobile' }"
                  @click="coverageTab = 'mobile'"
                >
                  Mobile
                </button>
                <button
                  class="pp-seg-tab"
                  :class="{ 'pp-seg-tab--on': coverageTab === 'tv' }"
                  @click="coverageTab = 'tv'"
                >
                  TV
                </button>
              </div>

              <!-- Broadband -->
              <div
                v-if="coverageTab === 'broadband'"
                class="pp-bb-card-v2 pp-bb-card-v2--flat"
              >
                <template v-if="enrichment?.broadband">
                  <div class="pp-bb-stats">
                    <div class="pp-bb-stat">
                      <div class="pp-bb-stat-head">
                        <span class="pp-bb-stat-label">Download</span>
                        <span class="pp-bb-stat-val"
                          >{{ enrichment.broadband.maxDownload ?? '—' }}
                          <small>Mbps</small></span
                        >
                      </div>
                      <div class="pp-bb-bar pp-bb-bar--track">
                        <div
                          class="pp-bb-bar-fill pp-bb-bar-fill--down"
                          :style="{
                            width:
                              Math.min(
                                100,
                                ((enrichment.broadband.maxDownload ?? 0) /
                                  1000) *
                                  100,
                              ) + '%',
                          }"
                        ></div>
                      </div>
                    </div>
                    <div class="pp-bb-stat">
                      <div class="pp-bb-stat-head">
                        <span class="pp-bb-stat-label">Upload</span>
                        <span class="pp-bb-stat-val"
                          >{{ enrichment.broadband.maxUpload ?? '—' }}
                          <small>Mbps</small></span
                        >
                      </div>
                      <div class="pp-bb-bar pp-bb-bar--track">
                        <div
                          class="pp-bb-bar-fill pp-bb-bar-fill--up"
                          :style="{
                            width:
                              Math.min(
                                100,
                                ((enrichment.broadband.maxUpload ?? 0) / 200) *
                                  100,
                              ) + '%',
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div class="pp-bb-chips">
                    <span
                      class="pp-bb-chip"
                      :class="{
                        'pp-bb-chip--on': enrichment.broadband.ultrafast,
                      }"
                      >🚀 Ultrafast</span
                    >
                    <span
                      class="pp-bb-chip"
                      :class="{
                        'pp-bb-chip--on': enrichment.broadband.superfast,
                      }"
                      >⚡ Superfast</span
                    >
                    <span
                      class="pp-bb-chip"
                      :class="{ 'pp-bb-chip--on': enrichment.broadband.fttp }"
                      >🔆 FTTP</span
                    >
                    <span
                      class="pp-bb-chip"
                      :class="{ 'pp-bb-chip--on': enrichment.broadband.fttc }"
                      >📡 FTTC</span
                    >
                    <span
                      class="pp-bb-chip"
                      :class="{ 'pp-bb-chip--on': enrichment.broadband.cable }"
                      >🔌 Cable</span
                    >
                  </div>
                  <p class="pp-src-note">Source: Ofcom Connected Nations</p>
                </template>
                <div v-else class="pp-empty-card pp-empty-card--flat">
                  <div class="pp-empty-emoji">📶</div>
                  <div class="pp-empty-title">No broadband data</div>
                  <div class="pp-empty-sub">
                    Coverage information isn't available for this postcode yet.
                  </div>
                </div>
              </div>

              <!-- Mobile -->
              <div
                v-if="coverageTab === 'mobile'"
                class="pp-mobile-card-v2 pp-mobile-card-v2--flat"
              >
                <template v-if="enrichment?.mobileSignal">
                  <div
                    v-for="op in mobileOperators"
                    :key="op.key"
                    class="pp-mop-card"
                  >
                    <div class="pp-mop-name">{{ op.label }}</div>
                    <div class="pp-mop-signals">
                      <div class="pp-mop-sig">
                        <div class="pp-mop-sig-label">4G</div>
                        <div
                          class="pp-mop-bars"
                          :class="
                            signalStrengthClass(
                              enrichment.mobileSignal[op.key]?.data4g,
                            )
                          "
                        >
                          <span class="pp-mop-bar pp-mop-bar--1"></span>
                          <span class="pp-mop-bar pp-mop-bar--2"></span>
                          <span class="pp-mop-bar pp-mop-bar--3"></span>
                        </div>
                      </div>
                      <div class="pp-mop-sig">
                        <div class="pp-mop-sig-label">5G</div>
                        <div
                          class="pp-mop-bars"
                          :class="
                            signalStrengthClass(
                              enrichment.mobileSignal[op.key]?.data5g,
                            )
                          "
                        >
                          <span class="pp-mop-bar pp-mop-bar--1"></span>
                          <span class="pp-mop-bar pp-mop-bar--2"></span>
                          <span class="pp-mop-bar pp-mop-bar--3"></span>
                        </div>
                      </div>
                      <div class="pp-mop-sig">
                        <div class="pp-mop-sig-label">Indoor</div>
                        <div
                          class="pp-mop-bars"
                          :class="
                            signalStrengthClass(
                              enrichment.mobileSignal[op.key]?.indoor4g,
                            )
                          "
                        >
                          <span class="pp-mop-bar pp-mop-bar--1"></span>
                          <span class="pp-mop-bar pp-mop-bar--2"></span>
                          <span class="pp-mop-bar pp-mop-bar--3"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="pp-mop-legend">
                    <span class="pp-mop-dot pp-mop-dot--good"></span>Good
                    <span class="pp-mop-dot pp-mop-dot--ok"></span>Limited
                    <span class="pp-mop-dot pp-mop-dot--none"></span>None
                  </div>
                  <p class="pp-src-note">Source: Ofcom Connected Nations</p>
                </template>
                <div v-else class="pp-empty-card pp-empty-card--flat">
                  <div class="pp-empty-emoji">📱</div>
                  <div class="pp-empty-title">No mobile signal data</div>
                  <div class="pp-empty-sub">
                    We couldn't retrieve coverage info.
                    <a
                      href="https://checker.ofcom.org.uk/en-gb/mobile-coverage"
                      target="_blank"
                      rel="noopener"
                      class="pp-ext-link"
                      >Check on Ofcom →</a
                    >
                  </div>
                </div>
              </div>

              <!-- TV -->
              <div
                v-if="coverageTab === 'tv'"
                class="pp-tv-card-v2 pp-tv-card-v2--flat"
              >
                <div class="pp-tv-tile">
                  <div class="pp-tv-tile-ic pp-tv-tile-ic--sky">📡</div>
                  <div class="pp-tv-tile-info">
                    <div class="pp-tv-tile-title">Satellite TV</div>
                    <div class="pp-tv-tile-sub">Sky · Freesat</div>
                  </div>
                  <span class="pp-tv-status pp-tv-status--yes"
                    >✓ Available</span
                  >
                </div>
                <div class="pp-tv-tile">
                  <div class="pp-tv-tile-ic pp-tv-tile-ic--green">📺</div>
                  <div class="pp-tv-tile-info">
                    <div class="pp-tv-tile-title">Freeview</div>
                    <div class="pp-tv-tile-sub">Digital aerial</div>
                  </div>
                  <span class="pp-tv-status pp-tv-status--yes"
                    >✓ Available</span
                  >
                </div>
                <div class="pp-tv-tile">
                  <div class="pp-tv-tile-ic pp-tv-tile-ic--red">🔌</div>
                  <div class="pp-tv-tile-info">
                    <div class="pp-tv-tile-title">Cable TV</div>
                    <div class="pp-tv-tile-sub">Virgin Media</div>
                  </div>
                  <span
                    class="pp-tv-status"
                    :class="
                      enrichment?.broadband?.cable
                        ? 'pp-tv-status--yes'
                        : 'pp-tv-status--check'
                    "
                  >
                    {{ enrichment?.broadband?.cable ? '✓ Likely' : 'Check' }}
                  </span>
                </div>
                <a
                  v-if="!enrichment?.broadband?.cable"
                  href="https://store.virginmedia.com/check-postcode.html"
                  target="_blank"
                  rel="noopener"
                  class="pp-ext-link"
                  style="margin-top: 10px; display: inline-block"
                  >Check Virgin Media postcode →</a
                >
              </div>
            </div>

            <!-- Flood Risk tab -->
            <div v-if="activeLocTab === 'flood'" class="pp-loc-panel">
              <div class="pp-loc-subhead">
                <span>Flood Risk</span>
                <span class="pp-loc-subhead-src">Environment Agency</span>
              </div>
              <div v-if="!enrichment" class="pp-empty-card pp-empty-card--flat">
                <div class="pp-empty-emoji">🌊</div>
                <div class="pp-empty-title">Loading flood data…</div>
              </div>
              <div
                v-else-if="!enrichment.floodRisk"
                class="pp-empty-card pp-empty-card--flat"
              >
                <div class="pp-empty-emoji">🌊</div>
                <div class="pp-empty-title">No flood data available</div>
                <div class="pp-empty-sub">
                  We couldn't retrieve flood risk for this location.
                </div>
              </div>
              <div v-else class="pp-flood-hero" :class="floodHeroClass">
                <div class="pp-flood-hero-top">
                  <svg
                    class="pp-flood-waves"
                    viewBox="0 0 320 60"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 30 Q 40 10 80 30 T 160 30 T 240 30 T 320 30 V60 H0 Z"
                      fill="rgba(255,255,255,0.18)"
                    />
                    <path
                      d="M0 40 Q 40 25 80 40 T 160 40 T 240 40 T 320 40 V60 H0 Z"
                      fill="rgba(255,255,255,0.12)"
                    />
                  </svg>
                  <div class="pp-flood-hero-content">
                    <div class="pp-flood-eyebrow">Risk level</div>
                    <div class="pp-flood-big">{{ enrichment.floodRisk }}</div>
                    <p class="pp-flood-desc-v2">{{ floodRiskDescription }}</p>
                  </div>
                </div>
                <div class="pp-flood-body">
                  <div
                    v-if="enrichment.floodZones?.length"
                    class="pp-flood-zones-v2"
                  >
                    <div
                      v-for="(zone, i) in enrichment.floodZones"
                      :key="i"
                      class="pp-flood-zone-pill"
                    >
                      <span class="pp-flood-zone-dot"></span>
                      <div class="pp-flood-zone-meta">
                        <div class="pp-flood-zone-name">{{ zone.name }}</div>
                        <div class="pp-flood-zone-sev">
                          {{ zone.severity
                          }}<span v-if="zone.riverSea">
                            · {{ zone.riverSea }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="pp-flood-map-wrap-v2">
                    <div ref="floodMapEl" class="pp-flood-map"></div>
                    <div class="pp-flood-map-legend">
                      <span class="pp-flood-legend-item"
                        ><span
                          class="pp-flood-ldot"
                          style="background: #dc2626"
                        ></span
                        >Severe</span
                      >
                      <span class="pp-flood-legend-item"
                        ><span
                          class="pp-flood-ldot"
                          style="background: #f59e0b"
                        ></span
                        >Medium</span
                      >
                      <span class="pp-flood-legend-item"
                        ><span
                          class="pp-flood-ldot"
                          style="background: #3b82f6"
                        ></span
                        >Zone</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Council Tax tab -->
            <div v-if="activeLocTab === 'council'" class="pp-loc-panel">
              <div class="pp-loc-subhead">
                <span>Council Tax</span>
                <span class="pp-loc-subhead-src">England bands</span>
              </div>
              <div class="pp-seg-tabs pp-seg-tabs--three">
                <button
                  class="pp-seg-tab"
                  :class="{ 'pp-seg-tab--on': ctTab === 'property' }"
                  @click="ctTab = 'property'"
                >
                  This property
                </button>
                <button
                  class="pp-seg-tab"
                  :class="{ 'pp-seg-tab--on': ctTab === 'bands' }"
                  @click="ctTab = 'bands'"
                >
                  All bands
                </button>
                <button
                  class="pp-seg-tab"
                  :class="{ 'pp-seg-tab--on': ctTab === 'nearby' }"
                  @click="ctTab = 'nearby'"
                >
                  Nearby
                </button>
              </div>

              <div
                v-if="ctTab === 'property'"
                class="pp-ct-card-v2 pp-ct-card-v2--flat"
              >
                <p class="pp-ct-explainer">
                  Council tax bands A–H reflect estimated 1991 property values.
                  Your property's band is highlighted below.
                </p>
                <template v-if="enrichment?.councilTax?.band">
                  <div class="pp-ct-ladder-wrap">
                    <div
                      class="pp-ct-ladder-amount"
                      :style="{
                        left: ctBandLadderOffset(enrichment.councilTax.band),
                      }"
                    >
                      <div class="pp-ct-ladder-amount-val">
                        £{{
                          (
                            enrichment.councilTax.annualEstimate ??
                            bandEstimate(enrichment.councilTax.band)
                          ).toLocaleString()
                        }}
                      </div>
                      <div class="pp-ct-ladder-amount-sub">/ year</div>
                      <div class="pp-ct-ladder-arrow"></div>
                    </div>
                    <div class="pp-ct-ladder">
                      <div
                        v-for="b in ctBandReference"
                        :key="b.band"
                        class="pp-ct-ladder-cell"
                        :class="{
                          'pp-ct-ladder-cell--on':
                            enrichment?.councilTax?.band === b.band,
                        }"
                      >
                        {{ b.band }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="enrichment.councilTax.councilName"
                    class="pp-ct-council"
                  >
                    {{ enrichment.councilTax.councilName }}
                  </div>
                  <div class="pp-ct-council-src">
                    {{
                      enrichment.councilTax.dataSource ??
                      'England average 2024/25'
                    }}
                  </div>
                </template>
                <div
                  v-else
                  class="pp-empty-card pp-empty-card--flat"
                  style="margin: 6px 0 0"
                >
                  <div class="pp-empty-emoji">🏷️</div>
                  <div class="pp-empty-title">Band not available</div>
                  <div class="pp-empty-sub">
                    The band may appear once this property has an EPC
                    certificate.
                  </div>
                </div>
                <a
                  href="https://www.gov.uk/council-tax-bands"
                  target="_blank"
                  rel="noopener"
                  class="pp-ext-link"
                  style="margin-top: 14px; display: inline-block"
                  >Check exact amount on GOV.UK →</a
                >
              </div>

              <div
                v-if="ctTab === 'bands'"
                class="pp-ct-bands-card-v2 pp-ct-bands-card-v2--flat"
              >
                <div
                  v-for="b in ctBandReference"
                  :key="b.band"
                  class="pp-ct-bands-row-v2"
                  :class="{
                    'pp-ct-bands-row-v2--on':
                      enrichment?.councilTax?.band === b.band,
                  }"
                >
                  <div
                    class="pp-ct-bands-accent"
                    :class="{
                      'pp-ct-bands-accent--on':
                        enrichment?.councilTax?.band === b.band,
                    }"
                  ></div>
                  <div
                    class="pp-ct-bands-letter-v2"
                    :class="{
                      'pp-ct-bands-letter-v2--on':
                        enrichment?.councilTax?.band === b.band,
                    }"
                  >
                    {{ b.band }}
                  </div>
                  <div class="pp-ct-bands-mid">
                    <div class="pp-ct-bands-range-v2">{{ b.range }}</div>
                  </div>
                  <div class="pp-ct-bands-est-v2">
                    £{{ b.estimate.toLocaleString() }}<small>/yr</small>
                  </div>
                </div>
                <p class="pp-src-note">
                  Ranges are 1991 valuations. Estimates are England averages for
                  2024/25.
                </p>
              </div>

              <div v-if="ctTab === 'nearby'">
                <template v-if="enrichment?.councilTax?.nearby?.length">
                  <div class="pp-ct-nearby-stack">
                    <div
                      v-for="(p, i) in enrichment.councilTax.nearby"
                      :key="i"
                      class="pp-ct-nearby-card-v2"
                    >
                      <div class="pp-ct-nearby-addr-v2">{{ p.address }}</div>
                      <div class="pp-ct-nearby-meta-v2">
                        <span class="pp-ct-nearby-badge"
                          >Band {{ p.band }}</span
                        >
                        <span v-if="p.annualEstimate" class="pp-ct-nearby-amt"
                          >£{{ p.annualEstimate.toLocaleString() }}
                          <small>/yr</small></span
                        >
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="pp-empty-card pp-empty-card--flat">
                  <div class="pp-empty-emoji">📭</div>
                  <div class="pp-empty-title">No nearby data</div>
                  <div class="pp-empty-sub">
                    No nearby council tax data available from EPC records.
                  </div>
                </div>
              </div>
            </div>

            <!-- Planning tab -->
            <div v-if="activeLocTab === 'planning'" class="pp-loc-panel">
              <div class="pp-loc-subhead">
                <span>Planning History</span>
                <span class="pp-loc-subhead-src">planning.data.gov.uk</span>
              </div>
              <template
                v-if="enrichment?.planningHistory?.applications?.length"
              >
                <div class="pp-plan-stack">
                  <div
                    v-for="(app, i) in enrichment.planningHistory.applications"
                    :key="i"
                    class="pp-plan-card"
                    :class="
                      'pp-plan-card--' +
                      (app.decision
                        ? planningDecisionClass(app.decision).replace(
                            'pp-planning-decision--',
                            '',
                          )
                        : 'pending')
                    "
                  >
                    <div class="pp-plan-accent"></div>
                    <div class="pp-plan-body">
                      <div class="pp-plan-top">
                        <span class="pp-plan-ref">{{
                          app.reference ?? 'No ref'
                        }}</span>
                        <span
                          v-if="app.decision"
                          class="pp-plan-status"
                          :class="planningDecisionClass(app.decision)"
                          >{{ app.decision }}</span
                        >
                        <span
                          v-else-if="app.status"
                          class="pp-plan-status pp-planning-decision--pending"
                          >{{ app.status }}</span
                        >
                      </div>
                      <p
                        v-if="app.description"
                        class="pp-plan-desc"
                        :class="{
                          'pp-plan-desc--clamped': !planningExpanded[i],
                        }"
                      >
                        {{ app.description }}
                      </p>
                      <button
                        v-if="app.description && app.description.length > 90"
                        class="pp-plan-more"
                        @click="togglePlanning(i)"
                      >
                        {{ planningExpanded[i] ? 'Show less' : 'Read more' }}
                      </button>
                      <div class="pp-plan-meta">
                        <span v-if="app.applicationType" class="pp-plan-type">{{
                          app.applicationType
                        }}</span>
                        <span v-if="app.decisionDate" class="pp-plan-date">{{
                          formatSaleDate(app.decisionDate)
                        }}</span>
                        <a
                          v-if="app.docUrl"
                          :href="app.docUrl"
                          target="_blank"
                          rel="noopener"
                          class="pp-plan-link"
                          >View docs →</a
                        >
                      </div>
                    </div>
                  </div>
                </div>
                <a
                  href="https://www.planning.data.gov.uk/"
                  target="_blank"
                  rel="noopener"
                  class="pp-ext-link"
                  style="margin: 6px 4px 16px; display: inline-block"
                  >planning.data.gov.uk →</a
                >
              </template>
              <div
                v-else-if="enrichment"
                class="pp-empty-card pp-empty-card--flat"
              >
                <div class="pp-empty-emoji">📐</div>
                <div class="pp-empty-title">
                  No planning applications on record
                </div>
                <div class="pp-empty-sub">
                  No applications on record for this property.
                  <a
                    href="https://www.planning.data.gov.uk/"
                    target="_blank"
                    rel="noopener"
                    class="pp-ext-link"
                    >Browse on planning.data.gov.uk →</a
                  >
                </div>
              </div>
              <div v-else class="pp-empty-card pp-empty-card--flat">
                <div class="pp-empty-emoji">📐</div>
                <div class="pp-empty-title">Loading planning data…</div>
              </div>
            </div>
          </div>
          <!-- /.pp-loc-card -->

          <!-- ── Stamp Duty Calculator ── -->
          <div class="pp-section-hdr" style="margin-top: 4px">
            <span>Stamp Duty Calculator</span>
            <span class="pp-section-sub"
              >England &amp; NI · {{ new Date().getFullYear() }}</span
            >
          </div>
          <div class="pp-sdlt-card-v2">
            <!-- Sticky live total -->
            <div class="pp-sdlt-hero">
              <div class="pp-sdlt-hero-lbl">Your estimated Stamp Duty</div>
              <div class="pp-sdlt-hero-val">
                {{
                  sdltPriceInput > 0 ? formatPrice(sdltBreakdown.total) : '£0'
                }}
              </div>
              <div class="pp-sdlt-hero-sub" v-if="sdltPriceInput > 0">
                On a price of {{ formatPrice(sdltPriceInput) }}
              </div>
            </div>

            <!-- Big input -->
            <label class="pp-sdlt-input-v2">
              <span class="pp-sdlt-curr-v2">£</span>
              <input
                v-model="sdltPriceRaw"
                type="text"
                inputmode="numeric"
                placeholder="Property price"
                @input="onSdltInput"
              />
            </label>

            <!-- Buyer type segmented -->
            <div
              class="pp-seg-tabs pp-seg-tabs--three"
              style="margin-bottom: 14px"
            >
              <button
                class="pp-seg-tab"
                :class="{ 'pp-seg-tab--on': sdltBuyerType === 'standard' }"
                @click="sdltBuyerType = 'standard'"
              >
                🏡 Standard
              </button>
              <button
                class="pp-seg-tab"
                :class="{ 'pp-seg-tab--on': sdltBuyerType === 'firsttime' }"
                @click="sdltBuyerType = 'firsttime'"
              >
                🌱 First-time
              </button>
              <button
                class="pp-seg-tab"
                :class="{ 'pp-seg-tab--on': sdltBuyerType === 'additional' }"
                @click="sdltBuyerType = 'additional'"
              >
                🏘️ Additional
              </button>
            </div>

            <!-- Breakdown as stacked bars -->
            <template v-if="sdltBreakdown.bands.length">
              <div class="pp-sdlt-bars">
                <div
                  v-for="(band, idx) in sdltBreakdown.bands"
                  :key="band.label"
                  class="pp-sdlt-bar-item"
                >
                  <div class="pp-sdlt-bar-head">
                    <span class="pp-sdlt-bar-rate">{{ band.rate }}%</span>
                    <span class="pp-sdlt-bar-tax">{{
                      formatPrice(band.tax)
                    }}</span>
                  </div>
                  <div class="pp-sdlt-bar-track">
                    <div
                      class="pp-sdlt-bar-fill"
                      :style="{
                        width:
                          (sdltBreakdown.total > 0
                            ? (band.tax / sdltBreakdown.total) * 100
                            : 100 / sdltBreakdown.bands.length) + '%',
                        background: sdltBarColor(idx),
                      }"
                    ></div>
                  </div>
                  <div class="pp-sdlt-bar-range">{{ band.label }}</div>
                </div>
              </div>
            </template>
            <div v-else class="pp-sdlt-empty">
              <div class="pp-sdlt-empty-ic">£</div>
              <div class="pp-sdlt-empty-title">
                Enter a price to see your bill
              </div>
              <div class="pp-sdlt-empty-sub">
                We'll calculate each band and total in real-time.
              </div>
            </div>

            <p class="pp-src-note" style="margin-top: 14px">
              <a
                href="https://www.gov.uk/stamp-duty-land-tax/residential-property-rates"
                target="_blank"
                rel="noopener"
                class="pp-ext-link"
                >Full rates on GOV.UK →</a
              >
            </p>
          </div>

          <!-- ── Passport unlock CTA ── -->
          <div
            v-if="showPassportCta"
            class="pp-unlock-card pp-unlock-card--v2"
            @click="onClaimCtaClick"
          >
            <div class="pp-unlock-shine"></div>
            <div class="pp-unlock-eyebrow">
              <img
                src="/op-icons/passportview/umu-passport.png"
                alt=""
                class="pp-emoji-ic"
              />
              Property Passport
            </div>
            <div class="pp-unlock-price-row">
              <span class="pp-unlock-price">£99</span>
              <span class="pp-unlock-price-note">one-time access</span>
            </div>
            <p class="pp-unlock-desc">
              Get the complete verified seller Property Passport — every
              document, every risk, every certificate. The same data your
              solicitor needs, in one place.
            </p>
            <div class="pp-unlock-features">
              <div class="pp-unlock-feat">
                <div class="pp-unlock-feat-ic">📋</div>
                <div class="pp-unlock-feat-body">
                  <div class="pp-unlock-feat-title">
                    Verified seller documents
                  </div>
                  <div class="pp-unlock-feat-sub">
                    Title deeds, EPC, gas &amp; electrical certs
                  </div>
                </div>
                <span class="pp-unlock-check">✓</span>
              </div>
              <div class="pp-unlock-feat">
                <div class="pp-unlock-feat-ic">🔍</div>
                <div class="pp-unlock-feat-body">
                  <div class="pp-unlock-feat-title">
                    Full HealthScore™ breakdown
                  </div>
                  <div class="pp-unlock-feat-sub">
                    Risk categories, planning history, legal
                  </div>
                </div>
                <span class="pp-unlock-check">✓</span>
              </div>
              <div class="pp-unlock-feat">
                <div class="pp-unlock-feat-ic">⚡</div>
                <div class="pp-unlock-feat-body">
                  <div class="pp-unlock-feat-title">Instant download pack</div>
                  <div class="pp-unlock-feat-sub">
                    Share directly with your solicitor
                  </div>
                </div>
                <span class="pp-unlock-check">✓</span>
              </div>
              <div class="pp-unlock-feat pp-unlock-feat--last">
                <div class="pp-unlock-feat-ic">🔒</div>
                <div class="pp-unlock-feat-body">
                  <div class="pp-unlock-feat-title">
                    Transaction history &amp; LR data
                  </div>
                  <div class="pp-unlock-feat-sub">
                    Full ownership chain and previous sales
                  </div>
                </div>
                <span class="pp-unlock-check">✓</span>
              </div>
            </div>
            <button class="pp-unlock-btn">
              <img
                src="/op-icons/passportview/umu-passport.png"
                alt=""
                class="pp-emoji-ic"
              />
              Open the Passport — £99 →
            </button>
            <p class="pp-unlock-note">
              Secure payment · Instant access · No subscription
            </p>
          </div>
        </div>
        <!-- /pp-content-pad -->
      </div>
      <!-- /pp-scroll -->

      <!-- ── Drawers & Overlays ── -->
      <BaseDrawer
        v-model="showRegisterInterest"
        title="Register Interest"
        :showBackButton="true"
        @close="showRegisterInterest = false"
      >
        <RegisterInterestContent
          :property-id="propertyId"
          :property-address="displayAddress"
          @submit="onInterestRegistered"
        />
      </BaseDrawer>

      <BaseDrawer
        v-model="showShare"
        title="Share Property"
        :showBackButton="true"
        @close="showShare = false"
      >
        <ShareContent
          :property-title="property?.addressLine1 ?? ''"
          :property-address="`${property?.city ?? ''}, ${property?.postcode ?? ''}`"
          :property-price="formatPrice(displayEstimatedPrice)"
          :property-image="propertyImages[0]"
          @share="handleShare"
        />
      </BaseDrawer>

      <ClaimPassportTypeDrawer
        v-model="showClaimTypeDrawer"
        @confirm="onPassportTypeChosen"
      />

      <ClaimPassportDrawer
        v-model="showClaimDrawer"
        :property="
          property
            ? {
                id: property.id,
                addressLine1: property.addressLine1,
                area: property.area,
                postcode: property.postcode,
                priceDisplay: property.priceDisplay,
                image: property.image,
              }
            : null
        "
        :existing-passport-id="buyerModePassportId"
        :passport-type="claimPassportType"
        :is-hmo="claimIsHmo"
        @close="showClaimDrawer = false"
        @claimed="handleClaimed"
      />

      <Toast
        :is-visible="toastState.isVisible"
        :message="toastState.message"
        :icon="toastState.icon"
        :icon-emoji="toastState.iconEmoji"
        :duration="toastState.duration"
        @close="hideToast"
      />

      <!-- Unpublished passport modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="showUnpublishedModal"
            class="unpub-overlay"
            @click.self="showUnpublishedModal = false"
          >
            <div class="unpub-modal">
              <button class="unpub-close" @click="showUnpublishedModal = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <div class="unpub-icon">
                <img
                  src="/op-icons/passportview/umu-passport.png"
                  alt=""
                  class="unpub-icon-img"
                />
              </div>

              <div class="unpub-eyebrow">
                <img
                  src="/op-icons/passportview/umu-passport.png"
                  alt=""
                  class="unpub-eyebrow-ic"
                />
                Property Passport — In Progress
              </div>
              <h3 class="unpub-title">This home's Passport is being built</h3>
              <p class="unpub-body">
                You're seeing public EPC data for now — we'll alert you when
                the full record is published.
              </p>

              <button class="unpub-cta" @click="openRegisterInterest">
                🔔 Notify me when it's published
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>

    <BottomNav />
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

// ── HealthScore gauge ──────────────────────────────────────────────────────────
const gaugeScore = computed(
  () => homeScore.value?.total ?? prop.value?.epcScore ?? null,
)

const gaugeColor = computed(() => {
  const s = gaugeScore.value ?? 0
  if (s >= 80) return '#059669'
  if (s >= 60) return '#00a19a'
  if (s >= 40) return '#d97706'
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
  if (s >= 40) return 'background:#fef9f0;border-color:#fde68a;'
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
  if (pct >= 72) return '#059669'
  if (pct >= 50) return '#00a19a'
  if (pct >= 28) return '#d97706'
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
  if (r === 'A' || r === 'B') return '#059669'
  if (r === 'C') return '#00a19a'
  if (r === 'D') return '#d97706'
  if (r === 'E') return '#ea580c'
  return '#dc2626'
})

// ── Flood risk ─────────────────────────────────────────────────────────────────
const floodRiskData = computed(() => {
  const zones = enrichment.value?.floodZones ?? []
  if (!zones.length)
    return {
      label: 'Low',
      color: '#059669',
      class: 'pp-badge-flood--low',
      zone: 'Zone 1',
      pill: 'background:#d1fae5;color:#065f46;',
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
      pill: 'background:#ffedd5;color:#9a3412;',
      badgeClass: 'pp-badge-flood--med',
    }
  return {
    label: 'Low',
    color: '#059669',
    class: 'pp-badge-flood--low',
    zone: 'Zone 1',
    pill: 'background:#d1fae5;color:#065f46;',
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
  if (r === 'A' || r === 'B') return 'background:#d1fae5;color:#065f46;'
  if (r === 'C') return 'background:#ccfbf1;color:#115e59;'
  if (r === 'D') return 'background:#fef3c7;color:#92400e;'
  if (r === 'E') return 'background:#fed7aa;color:#9a3412;'
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
const propertyImages = computed(() => {
  const images: string[] = []
  const uploaded = (property.value?.images as string[] | null) ?? []
  images.push(...uploaded)
  if (uploaded.length === 0) {
    const lat = property.value?.latitude
    const lon = property.value?.longitude
    const googleKey = config.public.googleApiKey as string
    if (lat && lon && googleKey) {
      images.push(
        `https://maps.googleapis.com/maps/api/streetview?size=800x500&location=${lat},${lon}&key=${googleKey}&fov=90&pitch=10&radius=200&source=outdoor&return_error_codes=true`,
      )
    }
  }
  const imgUrl = property.value?.imageUrl
  if (imgUrl && !images.includes(imgUrl))
    images.push(imgUrl)
  return images
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
        L.marker([p.lat, p.lon], { icon: makeDivIcon('#10b981', '🌳') })
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
/* ── CSS variables (local fallbacks) ── */
.pp-page {
  --brand: #00a19a;
  --brand-pale: #f0fdfa;
  --brand-soft: #99f6e4;
  --navy: #231d45;
  --ink: #1a1a2e;
  --ink-soft: #4a4a6a;
  --ink-faint: #9090a8;
  --line: #e8e8f0;
  --good: #059669;
  --warn: #d97706;
  min-height: 100vh;
  background: #f4f6f9;
  padding-bottom: 80px;
}

/* ── Loading ── */
.pp-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 12px;
  color: var(--ink-soft);
  font-size: 14px;
}
.pp-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.pp-back-txt {
  background: var(--brand);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

/* ── Hero ── */
.pp-hero {
  position: relative;
  height: 200px;
  flex-shrink: 0;
  overflow: hidden;
  background: #c8ede9;
}
.pp-hero-inner {
  position: absolute;
  inset: 0;
}
.pp-hero-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  z-index: 10;
}
.pp-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(6px);
}
.pp-icon-btn--active {
  color: #ef4444;
}
.pp-hero-badges {
  position: absolute;
  bottom: 12px;
  left: 16px;
  display: flex;
  gap: 6px;
  z-index: 10;
}
.pp-badge-passport {
  background: #231d45;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
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
.pp-badge-flood {
  background: rgba(255, 255, 255, 0.95);
  font-size: 10px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.pp-badge-flood--low {
  color: #059669;
  border: 1px solid #d1fae5;
}
.pp-badge-flood--med {
  color: #ea580c;
  border: 1px solid #fed7aa;
}
.pp-badge-flood--high {
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* ── Scroll container ── */
.pp-scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ── Info block ── */
.pp-info-block {
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--line);
  background: #fff;
}
.pp-address {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 2px;
}
.pp-city {
  font-size: 14px;
  color: var(--ink-faint);
  margin: 0 0 10px;
}
.pp-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}
.pp-price {
  font-size: 28px;
  font-weight: 800;
  color: var(--brand);
  letter-spacing: -0.03em;
}
.pp-price-src {
  font-size: 11px;
  color: var(--ink-faint);
  line-height: 1.4;
}
.pp-pills {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}
.pp-pill {
  background: #f1f5f9;
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 999px;
}

/* ── Action strip ── */
.pp-actions-wrap {
  background: #fff;
  padding: 12px 20px 14px;
  border-bottom: 1px solid var(--line);
}
.pp-action-strip {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  background: #f8f7fc;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
}
.pp-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 12px 8px;
  background: transparent;
  border: none;
  border-right: 1px solid var(--line);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--navy);
  cursor: pointer;
  font-family: inherit;
}
.pp-action-btn:last-child {
  border-right: none;
}
.pp-action-btn:active {
  background: #f0fdf9;
}

/* ── Content padding ── */
.pp-content-pad {
  padding: 16px 20px 0;
}

/* ── Section headers ── */
.pp-section-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 10px;
  margin-top: 16px;
  letter-spacing: -0.01em;
}
.pp-section-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-faint);
}
.pp-section-link {
  font-size: 11px;
  font-weight: 600;
  color: var(--brand);
  cursor: pointer;
}

/* ── HealthScore card ── */
.pp-hs-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 12px;
}
.pp-hs-top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.pp-gauge-wrap {
  position: relative;
  width: 110px;
  height: 62px;
  flex-shrink: 0;
}
.pp-gauge-num {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
}
.pp-hs-summary {
  flex: 1;
}
.pp-hs-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 4px;
}
.pp-hs-desc {
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.55;
  margin-bottom: 8px;
}
.pp-hs-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 10.5px;
  font-weight: 700;
  color: #92400e;
}
.pp-hs-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

/* EPC bars */
.pp-epc-section {
  border-top: 1px solid var(--line);
  padding-top: 14px;
}
.pp-epc-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}
.pp-epc-bars {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 14px;
}
.pp-epc-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pp-epc-name {
  font-size: 11px;
  color: var(--ink-soft);
  font-weight: 600;
  width: 70px;
  flex-shrink: 0;
}
.pp-epc-track {
  flex: 1;
  height: 6px;
  background: #f0eef8;
  border-radius: 999px;
  overflow: hidden;
}
.pp-epc-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s ease;
}
.pp-epc-desc {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ink-soft);
  width: 100px;
  text-align: right;
  flex-shrink: 0;
}

/* Running costs */
.pp-costs {
  background: #f8f7fc;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 14px;
}
.pp-costs-title {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.pp-costs-grid {
  display: flex;
  gap: 6px;
}
.pp-cost-box {
  flex: 1;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  padding: 8px 4px;
  border: 1px solid var(--line);
}
.pp-cost-box--total {
  background: var(--navy);
  border-color: transparent;
}
.pp-cost-val {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
}
.pp-cost-val--total {
  color: #fff;
}
.pp-cost-lbl {
  font-size: 9.5px;
  color: var(--ink-faint);
  font-weight: 600;
  margin-top: 2px;
}
.pp-cost-lbl--total {
  color: rgba(255, 255, 255, 0.6);
}
.pp-costs-note {
  font-size: 10.5px;
  color: var(--ink-faint);
  margin-top: 8px;
  line-height: 1.5;
}

/* Homescore CTA */
.pp-hs-cta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--brand-pale);
  border: 1px solid var(--brand-soft);
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
}
.pp-hs-cta-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 2px;
}
.pp-hs-cta-sub {
  font-size: 11px;
  color: var(--ink-soft);
}
.pp-hs-cta-btn {
  border: none;
  padding: 9px 14px;
  border-radius: 10px;
  background: var(--brand);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  font-family: inherit;
}

/* ── Property details ── */
.pp-details-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}
.pp-detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--line);
}
.pp-detail-row--last {
  border-bottom: none;
}
.pp-detail-ic {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #f0fdf9;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.pp-detail-lbl {
  font-size: 12px;
  color: var(--ink-soft);
  font-weight: 600;
  width: 90px;
  flex-shrink: 0;
}
.pp-detail-v {
  flex: 1;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}
.pp-detail-mono {
  font-family: monospace;
  font-size: 12px;
}
.pp-detail-sub {
  color: var(--ink-faint);
  font-size: 11px;
  font-weight: 500;
}
.pp-epc-score-pill {
  background: #fef3c7;
  color: #92400e;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  margin-left: 4px;
}
.pp-flood-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  margin-left: 4px;
}

/* ── Price history ── */
.pp-price-history {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 4px 16px;
  margin-bottom: 16px;
}
.pp-sold-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid var(--line);
}
.pp-sold-row:last-child {
  border-bottom: none;
}
.pp-sold-price {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--ink);
}
.pp-sold-meta {
  font-size: 11.5px;
  color: var(--ink-faint);
  margin-top: 1px;
}
.pp-sold-badge {
  background: #f1f5f9;
  color: var(--ink-soft);
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}
.pp-sold-badge--current {
  background: var(--brand-pale);
  color: #065f46;
  border: 1px solid var(--brand-soft);
}

.pp-tab-count {
  background: var(--brand-pale);
  color: var(--brand);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
}

/* Map */
.pp-map {
  height: 220px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 10px;
  z-index: 1;
}
.pp-map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px 0 12px;
}
.pp-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--ink-soft);
  font-weight: 600;
}
.pp-legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Street view */
.pp-street-scene {
  position: relative;
  height: 180px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 10px;
  background: linear-gradient(160deg, #2a3f4a, #1a2d38);
}
.pp-street-label {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.04em;
}
.pp-street-pin {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 161, 154, 0.9);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.pp-nearby-sold-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 4px 16px;
  margin-bottom: 12px;
}
.pp-nearby-sold-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 10px 0 4px;
}

/* Nearby lists */
.pp-nearby-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 12px;
}
.pp-nearby-empty {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--ink-faint);
}
.pp-nearby-list {
  padding: 0 16px;
}
.pp-nearby-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 0;
  border-bottom: 1px solid var(--line);
}
.pp-nearby-item:last-child {
  border-bottom: none;
}
.pp-nearby-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 14px;
  flex-shrink: 0;
}
.pp-nearby-icon--blue {
  background: #dbeafe;
}
.pp-nearby-icon--purple {
  background: #ede9fe;
}
.pp-nearby-icon--amber {
  background: #fef3c7;
}
.pp-nearby-icon--sky {
  background: #e0f2fe;
}
.pp-nearby-info {
  flex: 1;
  min-width: 0;
}
.pp-nearby-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}
.pp-nearby-meta {
  font-size: 11px;
  color: var(--ink-faint);
  margin-top: 1px;
}
.pp-ofsted-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}
.pp-ofsted--outstanding {
  background: #d1fae5;
  color: #065f46;
}
.pp-ofsted--good {
  background: #fef3c7;
  color: #92400e;
}
.pp-ofsted--other {
  background: #f1f5f9;
  color: var(--ink-soft);
}
.pp-transport-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
}
.pp-transport-badge--purple {
  background: #ede9fe;
  color: #5b21b6;
}
.pp-transport-badge--amber {
  background: #fef3c7;
  color: #92400e;
}
.pp-transport-badge--sky {
  background: #e0f2fe;
  color: #0369a1;
}

/* ── Sales history ── */
.pp-sales-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.pp-sales-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.pp-sales-timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 6px;
  bottom: 6px;
  width: 1.5px;
  background: var(--line);
}
.pp-sale-item {
  display: flex;
  gap: 12px;
  position: relative;
}
.pp-sale-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #e8e8f0;
  border: 2px solid #fff;
  flex-shrink: 0;
  margin-top: 3px;
  z-index: 1;
  box-shadow: 0 0 0 1.5px var(--line);
}
.pp-sale-dot--primary {
  background: var(--brand);
  box-shadow: 0 0 0 1.5px var(--brand-soft);
}
.pp-sale-body {
  flex: 1;
  min-width: 0;
}
.pp-sale-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.pp-sale-price {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
}
.pp-sale-date {
  font-size: 11.5px;
  color: var(--ink-faint);
  font-weight: 600;
}
.pp-sale-addr {
  font-size: 11.5px;
  color: var(--ink-soft);
  margin: 3px 0;
  line-height: 1.4;
}
.pp-sale-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.pp-sale-tag {
  font-size: 10px;
  font-weight: 600;
  background: #f1f5f9;
  color: var(--ink-soft);
  padding: 2px 8px;
  border-radius: 999px;
}
.pp-sale-tag--new {
  background: var(--brand-pale);
  color: var(--brand);
}
.pp-src-note {
  font-size: 10.5px;
  color: var(--ink-faint);
  margin: 10px 0 0;
  line-height: 1.5;
}

/* ── Coverage / broadband ── */
.pp-bb-card,
.pp-mobile-card,
.pp-tv-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}
.pp-bb-speeds {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.pp-bb-speed-item {
  flex: 1;
  text-align: center;
}
.pp-bb-speed-val {
  font-size: 24px;
  font-weight: 800;
  color: var(--navy);
  line-height: 1;
  letter-spacing: -0.02em;
}
.pp-bb-speed-unit {
  font-size: 11px;
  color: var(--brand);
  font-weight: 700;
  margin-top: 2px;
}
.pp-bb-speed-label {
  font-size: 10.5px;
  color: var(--ink-faint);
  font-weight: 600;
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pp-bb-divider {
  width: 1px;
  align-self: stretch;
  background: var(--line);
}
.pp-bb-types {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.pp-bb-type {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: var(--ink-faint);
  opacity: 0.5;
}
.pp-bb-type--on {
  background: var(--brand-pale);
  color: var(--brand);
  opacity: 1;
  border: 1px solid var(--brand-soft);
}

/* Mobile */
.pp-mobile-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}
.pp-mobile-row:last-of-type {
  border-bottom: none;
}
.pp-mobile-op {
  font-size: 13px;
  font-weight: 800;
  color: var(--navy);
}
.pp-mobile-signals {
  display: flex;
  gap: 14px;
}
.pp-mobile-signal-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.pp-mobile-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.pp-mobile-dot--good {
  background: #059669;
}
.pp-mobile-dot--limited {
  background: #f59e0b;
}
.pp-mobile-dot--none {
  background: #d1d5db;
}
.pp-mobile-sig-label {
  font-size: 11px;
  color: var(--ink-soft);
  font-weight: 600;
}
.pp-mobile-legend {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--ink-faint);
  font-weight: 600;
  padding-top: 10px;
  border-top: 1px solid var(--line);
  margin-top: 10px;
}

/* TV */
.pp-tv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
}
.pp-tv-row:last-of-type {
  border-bottom: none;
}
.pp-tv-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink);
}
.pp-tv-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.pp-tv-badge--yes {
  background: #d1fae5;
  color: #065f46;
}
.pp-tv-badge--check {
  background: #fef3c7;
  color: #92400e;
}

.pp-ext-link {
  color: var(--brand);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.pp-ext-link:hover {
  text-decoration: underline;
}

/* ── Flood risk ── */
.pp-flood-section {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}
.pp-flood-header {
  margin-bottom: 12px;
}
.pp-flood-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 11px;
  border-radius: 999px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.pp-flood-badge--very-low,
.pp-flood-badge--low {
  background: #d1fae5;
  color: #065f46;
}
.pp-flood-badge--medium {
  background: #fef3c7;
  color: #92400e;
}
.pp-flood-badge--high {
  background: #fee2e2;
  color: #991b1b;
}
.pp-flood-badge--severe {
  background: #fee2e2;
  color: #7f1d1d;
  border: 1px solid #fca5a5;
}
.pp-flood-desc {
  font-size: 12px;
  color: var(--ink-soft);
  line-height: 1.6;
  margin: 0;
}
.pp-flood-zones {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.pp-flood-zone-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #f8f7fc;
  border-radius: 10px;
  padding: 10px 12px;
}
.pp-flood-zone-info {
  flex: 1;
  min-width: 0;
}
.pp-flood-zone-name {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink);
}
.pp-flood-zone-sev {
  font-size: 11px;
  color: var(--ink-faint);
  margin-top: 2px;
}
.pp-flood-map-wrap {
  position: relative;
}
.pp-flood-map {
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
  background: #eef2f7;
  z-index: 1;
}
.pp-flood-map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
}
.pp-flood-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  color: var(--ink-soft);
  font-weight: 600;
}
.pp-flood-ldot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Council tax ── */
.pp-ct-card,
.pp-ct-bands-card,
.pp-ct-nearby-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}
.pp-ct-explainer {
  font-size: 11.5px;
  color: var(--ink-faint);
  line-height: 1.55;
  margin: 0 0 12px;
}
.pp-ct-main {
  display: flex;
  gap: 14px;
  align-items: center;
}
.pp-ct-band-circle {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 800;
  flex-shrink: 0;
}
.pp-ct-main-info {
  flex: 1;
  min-width: 0;
}
.pp-ct-main-label {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--navy);
}
.pp-ct-main-amount {
  font-size: 15px;
  font-weight: 800;
  color: var(--brand);
  margin-top: 2px;
  letter-spacing: -0.02em;
}
.pp-ct-main-council {
  font-size: 12px;
  color: var(--ink-soft);
  font-weight: 600;
  margin-top: 3px;
}
.pp-ct-main-src {
  font-size: 10.5px;
  color: var(--ink-faint);
  margin-top: 3px;
}
.pp-ct-unknown {
  text-align: center;
  padding: 16px 0;
}

.pp-ct-bands-row {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid var(--line);
}
.pp-ct-bands-row:last-of-type {
  border-bottom: none;
}
.pp-ct-bands-row--on {
  background: var(--brand-pale);
  border-radius: 10px;
  padding-left: 10px;
  padding-right: 10px;
}
.pp-ct-bands-letter {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  color: var(--ink-soft);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
}
.pp-ct-bands-letter--on {
  background: var(--brand);
  color: #fff;
}
.pp-ct-bands-range {
  font-size: 11.5px;
  color: var(--ink);
  font-weight: 600;
}
.pp-ct-bands-est {
  font-size: 11.5px;
  color: var(--brand);
  font-weight: 700;
}

.pp-ct-nearby-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
}
.pp-ct-nearby-row:last-of-type {
  border-bottom: none;
}
.pp-ct-nearby-addr {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  flex: 1;
  min-width: 0;
}
.pp-ct-nearby-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.pp-ct-nearby-band {
  font-size: 11px;
  font-weight: 800;
  color: var(--navy);
}
.pp-ct-nearby-est {
  font-size: 10.5px;
  color: var(--ink-faint);
}

/* ── Planning ── */
.pp-planning-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}
.pp-planning-row {
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}
.pp-planning-row:last-of-type {
  border-bottom: none;
}
.pp-planning-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.pp-planning-ref {
  font-family: monospace;
  font-size: 11px;
  background: #f1f5f9;
  color: var(--ink-soft);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 600;
}
.pp-planning-decision {
  font-size: 10.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.pp-planning-decision--approved {
  background: #d1fae5;
  color: #065f46;
}
.pp-planning-decision--refused {
  background: #fee2e2;
  color: #991b1b;
}
.pp-planning-decision--pending {
  background: #fef3c7;
  color: #92400e;
}
.pp-planning-desc {
  font-size: 12px;
  color: var(--ink);
  line-height: 1.55;
  margin: 4px 0 6px;
}
.pp-planning-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 10.5px;
  color: var(--ink-faint);
  font-weight: 600;
  margin-bottom: 4px;
}
.pp-planning-type {
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 4px;
}
.pp-planning-date {
  color: var(--ink-soft);
}

/* ── SDLT ── */
.pp-sdlt-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}
.pp-sdlt-input-row {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  padding: 4px 14px;
  background: #f8f7fc;
  margin-bottom: 12px;
}
.pp-sdlt-currency {
  font-size: 18px;
  font-weight: 800;
  color: var(--navy);
  margin-right: 6px;
}
.pp-sdlt-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  font-family: inherit;
  letter-spacing: -0.01em;
}
.pp-sdlt-options {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
  background: var(--line);
  border-radius: 12px;
  padding: 3px;
  margin-bottom: 14px;
}
.pp-sdlt-opt {
  background: transparent;
  border: none;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 4px;
  border-radius: 9px;
  color: var(--ink-soft);
  cursor: pointer;
  font-family: inherit;
}
.pp-sdlt-opt--on {
  background: #fff;
  color: var(--navy);
}
.pp-sdlt-breakdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.pp-sdlt-band-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  background: #f8f7fc;
  border-radius: 8px;
  font-size: 12px;
}
.pp-sdlt-band-range {
  color: var(--ink-soft);
  font-weight: 600;
}
.pp-sdlt-band-rate {
  color: var(--ink-faint);
  font-weight: 700;
  font-size: 11px;
}
.pp-sdlt-band-tax {
  color: var(--ink);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.pp-sdlt-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--brand-pale);
  border: 1px solid var(--brand-soft);
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 8px;
}
.pp-sdlt-total-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--navy);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pp-sdlt-total-val {
  font-size: 20px;
  font-weight: 800;
  color: var(--brand);
  letter-spacing: -0.02em;
}

/* ── Passport unlock card ── */
.pp-unlock-card {
  background: linear-gradient(150deg, #231d45 0%, #1a3a4a 100%);
  border-radius: 20px;
  padding: 22px 20px;
  margin-bottom: 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.pp-unlock-eyebrow {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 8px;
}
.pp-unlock-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}
.pp-unlock-price {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
}
.pp-unlock-price-note {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}
.pp-unlock-desc {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 16px;
}
.pp-unlock-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
}
.pp-unlock-feat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.pp-unlock-feat--last {
  border-bottom: none;
  padding-bottom: 0;
}
.pp-unlock-feat-ic {
  width: 28px;
  height: 28px;
  background: rgba(0, 161, 154, 0.2);
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 14px;
}
.pp-unlock-feat-body {
  flex: 1;
}
.pp-unlock-feat-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
}
.pp-unlock-feat-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}
.pp-unlock-check {
  color: #5eead4;
  font-size: 11px;
  font-weight: 700;
}
.pp-unlock-btn {
  width: 100%;
  border: none;
  padding: 15px;
  border-radius: 13px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  background: #5eead4;
  color: #231d45;
  letter-spacing: -0.01em;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.pp-unlock-note {
  text-align: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 8px;
}

/* ── Unpublished modal ── */
.unpub-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}
.unpub-modal {
  background: #fff;
  border-radius: 18px;
  padding: 28px 32px 26px;
  width: 100%;
  max-width: 480px;
  position: relative;
  box-shadow:
    0 24px 60px rgba(35, 29, 69, 0.22),
    0 4px 14px rgba(35, 29, 69, 0.08);
}
.unpub-icon {
  width: 60px;
  height: 60px;
  background: #eafaf9;
  border: 1px solid #b2e8e6;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
}
.unpub-icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.unpub-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 8px;
}
.unpub-eyebrow-ic {
  width: 13px;
  height: 13px;
  object-fit: contain;
  flex-shrink: 0;
}
.unpub-title {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.25;
  color: #231d45;
  margin: 0 0 12px;
}
.unpub-body {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 22px;
  max-width: 480px;
}
.unpub-body strong {
  color: #231d45;
}
.unpub-cta {
  width: 100%;
  border: none;
  background: #00a19a;
  color: #fff;
  padding: 14px 18px;
  border-radius: 13px;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.28);
  transition:
    transform 0.12s,
    box-shadow 0.15s;
}
.unpub-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 161, 154, 0.34);
}
.unpub-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f8f7fc;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #4a5568;
  transition: background 0.15s, color 0.15s;
}
.unpub-close:hover {
  background: #eef0f6;
  color: #231d45;
}
.unpub-close svg {
  width: 16px;
  height: 16px;
}

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ════════════════════════════════════════════════════════════════
   REDESIGNED SECTIONS (v2) — Property details through Passport CTA
   ═══════════════════════════════════════════════════════════════ */

/* ── Property Details : 2-col tile grid ── */
.pp-tile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}
.pp-tile {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 14px 14px 12px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.pp-tile:active {
  transform: translateY(1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}
.pp-tile--wide {
  grid-column: 1 / -1;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  min-height: auto;
  padding: 12px 14px;
}
.pp-tile-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
  color: var(--brand);
  flex-shrink: 0;
}
.pp-tile-badge--brand {
  background: var(--brand-pale);
  color: var(--brand);
}
.pp-tile-badge--amber {
  background: #fef3c7;
  color: #d97706;
}
.pp-tile-badge--green {
  background: #d1fae5;
  color: #059669;
}
.pp-tile--wide .pp-tile-badge {
  margin-bottom: 0;
}
.pp-tile-lbl {
  font-size: 11px;
  color: var(--ink-faint);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pp-tile--wide .pp-tile-lbl {
  flex-shrink: 0;
  width: 90px;
}
.pp-tile-v {
  font-size: 15px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.01em;
  line-height: 1.25;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pp-tile--wide .pp-tile-v {
  flex: 1;
  min-width: 0;
  word-break: break-all;
}
.pp-tile-v--muted {
  color: var(--ink-faint);
  font-weight: 600;
}
.pp-tile-v--inline {
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}
.pp-tile-sub {
  font-size: 11px;
  color: var(--ink-faint);
  font-weight: 600;
}
.pp-tile-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  font-weight: 700;
}
.pp-tile-mono--compact {
  font-size: 12px;
  letter-spacing: -0.01em;
  word-break: break-all;
  overflow-wrap: anywhere;
  line-height: 1.2;
}
.pp-tile-letter-chip {
  display: inline-grid;
  place-items: center;
  min-width: 28px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
}

/* ── Price History v2 : timeline with deltas ── */
.pp-ph-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 18px;
  padding: 14px 16px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.pp-ph-cagr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, var(--brand-pale), #ecfeff);
  border: 1px solid var(--brand-soft);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 14px;
}
.pp-ph-cagr-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pp-ph-cagr-val {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.pp-ph-cagr-val--up {
  color: #059669;
}
.pp-ph-cagr-val--down {
  color: #dc2626;
}
.pp-ph-timeline {
  display: flex;
  flex-direction: column;
}
.pp-ph-row {
  display: flex;
  gap: 12px;
  padding: 2px 0 14px;
  position: relative;
}
.pp-ph-row:last-child {
  padding-bottom: 0;
}
.pp-ph-dot-col {
  position: relative;
  width: 12px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pp-ph-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  margin-top: 4px;
  z-index: 1;
}
.pp-ph-dot--current {
  background: var(--brand);
  box-shadow:
    0 0 0 2px var(--brand-soft),
    0 0 0 5px rgba(0, 161, 154, 0.18);
}
.pp-ph-dot--sold {
  background: #cbd5e1;
  box-shadow: 0 0 0 1.5px #e2e8f0;
}
.pp-ph-line {
  width: 1.5px;
  flex: 1;
  background: var(--line);
  margin-top: 2px;
}
.pp-ph-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 4px;
}
.pp-ph-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.pp-ph-price {
  font-size: 17px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.pp-ph-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pp-ph-badge--current {
  background: var(--brand-pale);
  color: var(--brand);
  border: 1px solid var(--brand-soft);
}
.pp-ph-badge--sold {
  background: #f1f5f9;
  color: var(--ink-soft);
}
.pp-ph-meta {
  font-size: 11.5px;
  color: var(--ink-faint);
  margin-top: 2px;
  font-weight: 600;
}
.pp-ph-delta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  margin-top: 6px;
}
.pp-ph-delta--up {
  background: #d1fae5;
  color: #065f46;
}
.pp-ph-delta--down {
  background: #fee2e2;
  color: #991b1b;
}

/* ── Segmented pill tabs (reusable) ── */
.pp-seg-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 4px;
  background: #eef0f5;
  border-radius: 14px;
  padding: 4px;
  margin-bottom: 12px;
}
.pp-seg-tabs--two {
  grid-template-columns: 1fr 1fr;
}
.pp-seg-tabs--three {
  grid-template-columns: 1fr 1fr 1fr;
}
.pp-seg-tab {
  border: none;
  background: transparent;
  border-radius: 10px;
  padding: 9px 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--ink-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.pp-seg-tab--on {
  background: #fff;
  color: var(--navy);
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.08),
    0 0 0 0.5px rgba(35, 29, 69, 0.04);
}
.pp-seg-count {
  background: var(--brand-pale);
  color: var(--brand);
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
}

/* Pane */
.pp-loc-pane {
  margin-bottom: 16px;
}

/* ── Unified Location card ── */
.pp-loc-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 18px;
  padding: 0 0 14px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

/* Horizontal icon tab strip — sticky at top of card */
.pp-loc-tabstrip {
  position: sticky;
  top: 0;
  z-index: 5;
  background: #fff;
  border-bottom: 1px solid var(--line);
  padding: 10px 0 10px;
  margin-bottom: 10px;
}
.pp-loc-tabs {
  display: flex;
  gap: 6px;
  padding: 0 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: x proximity;
}
.pp-loc-tabs::-webkit-scrollbar {
  display: none;
}
.pp-loc-fade {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 26px;
  pointer-events: none;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), #fff 80%);
}
.pp-loc-tab {
  flex-shrink: 0;
  border: none;
  background: #f4f4f8;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink-soft);
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
  scroll-snap-align: start;
  white-space: nowrap;
  line-height: 1;
}
.pp-loc-tab:active {
  transform: scale(0.97);
}
.pp-loc-tab--on {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.28);
}
.pp-loc-tab-ic {
  font-size: 14px;
  line-height: 1;
}
.pp-loc-tab-lbl {
  font-size: 12.5px;
  letter-spacing: -0.01em;
}

.pp-loc-panel {
  padding: 0 14px;
}

.pp-loc-subhead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 2px 10px;
}
.pp-loc-subhead > span:first-child {
  font-size: 15px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.01em;
}
.pp-loc-subhead-src {
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pp-place-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Flatter variants for inside the unified card (avoid double chrome) */
.pp-empty-card--flat {
  background: #fafbfc;
  border: 1px dashed var(--line);
  box-shadow: none;
}
.pp-bb-card-v2--flat,
.pp-mobile-card-v2--flat,
.pp-tv-card-v2--flat,
.pp-ct-card-v2--flat,
.pp-ct-bands-card-v2--flat {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

/* ── Map v2 ── */
.pp-map-hero {
  height: 260px;
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 12px;
  z-index: 1;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  background: #eef2f7;
}
.pp-dist-strip {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.pp-dist-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 6px 11px;
  font-size: 11.5px;
  color: var(--ink-soft);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.pp-dist-ic {
  font-size: 13px;
}
.pp-dist-txt strong {
  color: var(--navy);
  font-weight: 800;
}

/* Street scene taller */
.pp-street-scene--tall {
  height: 220px;
  border-radius: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* ── Place rows (schools / transit) ── */
.pp-place-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.pp-place-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border-bottom: 1px solid var(--line);
}
.pp-place-row:last-child {
  border-bottom: none;
}
.pp-place-ic {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.pp-place-ic--blue {
  background: #dbeafe;
}
.pp-place-ic.pp-nearby-icon--purple {
  background: #ede9fe;
}
.pp-place-ic.pp-nearby-icon--amber {
  background: #fef3c7;
}
.pp-place-ic.pp-nearby-icon--sky {
  background: #e0f2fe;
}
.pp-place-info {
  flex: 1;
  min-width: 0;
}
.pp-place-name {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--navy);
  display: flex;
  align-items: center;
  gap: 5px;
  letter-spacing: -0.01em;
}
.pp-place-star {
  color: #f59e0b;
  font-size: 13px;
}
.pp-place-gooddot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
}
.pp-place-meta {
  font-size: 11.5px;
  color: var(--ink-faint);
  font-weight: 600;
  margin-top: 2px;
}
.pp-place-dist {
  background: var(--brand-pale);
  color: var(--brand);
  font-size: 11px;
  font-weight: 800;
  padding: 5px 11px;
  border-radius: 999px;
  flex-shrink: 0;
}

/* ── Empty states ── */
.pp-empty-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 16px;
}
.pp-empty-emoji {
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.75;
}
.pp-empty-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.pp-empty-sub {
  font-size: 12px;
  color: var(--ink-faint);
  line-height: 1.55;
}

/* ── Sales History v2 : stacked cards ── */
.pp-sh-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}
.pp-sh-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 13px 14px 13px 16px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}
.pp-sh-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
}
.pp-sh-card--primary::before {
  background: var(--brand);
}
.pp-sh-card--muted::before {
  background: #cbd5e1;
}
.pp-sh-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.pp-sh-price {
  font-size: 18px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.02em;
}
.pp-sh-date {
  font-size: 11.5px;
  color: var(--ink-faint);
  font-weight: 700;
}
.pp-sh-addr {
  font-size: 11.5px;
  color: var(--ink-soft);
  line-height: 1.4;
  margin: 2px 0 6px;
}
.pp-sh-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.pp-sh-tag {
  font-size: 10.5px;
  font-weight: 700;
  background: #f1f5f9;
  color: var(--ink-soft);
  padding: 3px 9px;
  border-radius: 999px;
}
.pp-sh-tag--new {
  background: var(--brand-pale);
  color: var(--brand);
}

/* ── Broadband v2 ── */
.pp-bb-card-v2 {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.pp-bb-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 16px;
}
.pp-bb-stat-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}
.pp-bb-stat-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.pp-bb-stat-val {
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.02em;
}
.pp-bb-stat-val small {
  font-size: 11px;
  color: var(--brand);
  font-weight: 800;
  margin-left: 2px;
}
.pp-bb-bar--track {
  height: 10px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}
.pp-bb-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
  min-width: 2%;
}
.pp-bb-bar-fill--down {
  background: linear-gradient(90deg, var(--brand), #22d3ee);
}
.pp-bb-bar-fill--up {
  background: linear-gradient(90deg, #a1a1aa, #d4d4d8);
}
.pp-bb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.pp-bb-chip {
  font-size: 11.5px;
  font-weight: 700;
  padding: 6px 11px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #94a3b8;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}
.pp-bb-chip--on {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  border-color: #6ee7b7;
}

/* ── Mobile v2 : signal bars ── */
.pp-mobile-card-v2 {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
.pp-mop-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 14px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.pp-mop-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.01em;
  flex-shrink: 0;
}
.pp-mop-signals {
  display: flex;
  gap: 14px;
}
.pp-mop-sig {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.pp-mop-sig-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pp-mop-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.pp-mop-bar {
  width: 4px;
  border-radius: 1px;
  background: #e5e7eb;
  transition: background 0.3s ease;
}
.pp-mop-bar--1 {
  height: 6px;
}
.pp-mop-bar--2 {
  height: 10px;
}
.pp-mop-bar--3 {
  height: 14px;
}
.pp-mop-bars.pp-signal--good .pp-mop-bar {
  background: #059669;
}
.pp-mop-bars.pp-signal--ok .pp-mop-bar--1,
.pp-mop-bars.pp-signal--ok .pp-mop-bar--2 {
  background: #f59e0b;
}
.pp-mop-bars.pp-signal--weak .pp-mop-bar--1 {
  background: #dc2626;
}
.pp-mop-legend {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 11px;
  color: var(--ink-faint);
  font-weight: 600;
  padding-top: 6px;
}
.pp-mop-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}
.pp-mop-dot--good {
  background: #059669;
}
.pp-mop-dot--ok {
  background: #f59e0b;
}
.pp-mop-dot--none {
  background: #d1d5db;
}

/* ── TV v2 ── */
.pp-tv-card-v2 {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
.pp-tv-tile {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.pp-tv-tile-ic {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
  flex-shrink: 0;
}
.pp-tv-tile-ic--sky {
  background: #e0f2fe;
}
.pp-tv-tile-ic--green {
  background: #d1fae5;
}
.pp-tv-tile-ic--red {
  background: #fee2e2;
}
.pp-tv-tile-info {
  flex: 1;
  min-width: 0;
}
.pp-tv-tile-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.01em;
}
.pp-tv-tile-sub {
  font-size: 11.5px;
  color: var(--ink-faint);
  margin-top: 2px;
  font-weight: 600;
}
.pp-tv-status {
  font-size: 10.5px;
  font-weight: 800;
  padding: 5px 11px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.pp-tv-status--yes {
  background: #d1fae5;
  color: #065f46;
}
.pp-tv-status--check {
  background: #fef3c7;
  color: #92400e;
}

/* ── Flood Risk hero ── */
.pp-flood-hero {
  border-radius: 18px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
.pp-flood-hero-top {
  position: relative;
  padding: 22px 18px 18px;
  overflow: hidden;
}
.pp-flood-hero--low .pp-flood-hero-top {
  background: linear-gradient(135deg, #059669, #10b981);
}
.pp-flood-hero--medium .pp-flood-hero-top {
  background: linear-gradient(135deg, #d97706, #f59e0b);
}
.pp-flood-hero--high .pp-flood-hero-top {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}
.pp-flood-hero--severe .pp-flood-hero-top {
  background: linear-gradient(135deg, #7f1d1d, #b91c1c);
}
.pp-flood-waves {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 60px;
  z-index: 1;
}
.pp-flood-hero-content {
  position: relative;
  z-index: 2;
}
.pp-flood-eyebrow {
  color: rgba(255, 255, 255, 0.8);
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}
.pp-flood-big {
  color: #fff;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-bottom: 8px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
.pp-flood-desc-v2 {
  color: rgba(255, 255, 255, 0.92);
  font-size: 12.5px;
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
}
.pp-flood-body {
  background: #fff;
  padding: 14px 16px;
}
.pp-flood-zones-v2 {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}
.pp-flood-zone-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
}
.pp-flood-zone-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand);
  flex-shrink: 0;
}
.pp-flood-zone-meta {
  flex: 1;
  min-width: 0;
}
.pp-flood-map-wrap-v2 {
  position: relative;
  margin-top: 4px;
}

/* ── Council Tax v2 : band ladder ── */
.pp-ct-card-v2 {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.pp-ct-ladder-wrap {
  position: relative;
  padding-top: 56px;
  padding-bottom: 8px;
}
.pp-ct-ladder-amount {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  background: var(--brand);
  color: #fff;
  padding: 6px 12px;
  border-radius: 10px;
  min-width: 94px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 161, 154, 0.35);
}
.pp-ct-ladder-amount-val {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}
.pp-ct-ladder-amount-sub {
  font-size: 10px;
  font-weight: 600;
  opacity: 0.8;
  margin-top: 2px;
}
.pp-ct-ladder-arrow {
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: var(--brand);
}
.pp-ct-ladder {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
  background: #eef0f5;
  border-radius: 10px;
  padding: 3px;
  height: 44px;
  align-items: end;
  position: relative;
}
.pp-ct-ladder-cell {
  height: 38px;
  border-radius: 8px;
  background: #fff;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--ink-soft);
  transition: all 0.3s ease;
}
.pp-ct-ladder-cell--on {
  background: linear-gradient(180deg, var(--brand), #0d9488);
  color: #fff;
  height: 46px;
  margin-top: -6px;
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.4);
  font-size: 14px;
}
.pp-ct-council {
  margin-top: 16px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--navy);
}
.pp-ct-council-src {
  font-size: 11px;
  color: var(--ink-faint);
  margin-top: 2px;
}
.pp-ct-explainer {
  font-size: 11.5px;
  color: var(--ink-faint);
  line-height: 1.55;
  margin: 0 0 6px;
}

/* All bands */
.pp-ct-bands-card-v2 {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 8px 0 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.pp-ct-bands-row-v2 {
  display: grid;
  grid-template-columns: 4px 36px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 16px 10px 12px;
  border-bottom: 1px solid var(--line);
  position: relative;
}
.pp-ct-bands-row-v2:last-of-type {
  border-bottom: none;
}
.pp-ct-bands-row-v2--on {
  background: var(--brand-pale);
}
.pp-ct-bands-accent {
  height: 100%;
  width: 3px;
  border-radius: 2px;
  background: transparent;
}
.pp-ct-bands-accent--on {
  background: var(--brand);
}
.pp-ct-bands-letter-v2 {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f1f5f9;
  color: var(--ink-soft);
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
}
.pp-ct-bands-letter-v2--on {
  background: var(--brand);
  color: #fff;
}
.pp-ct-bands-range-v2 {
  font-size: 12px;
  color: var(--ink);
  font-weight: 600;
  line-height: 1.4;
}
.pp-ct-bands-est-v2 {
  font-size: 13px;
  color: var(--brand);
  font-weight: 800;
  letter-spacing: -0.01em;
}
.pp-ct-bands-est-v2 small {
  font-size: 10px;
  color: var(--ink-faint);
  font-weight: 700;
}

/* Nearby */
.pp-ct-nearby-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
.pp-ct-nearby-card-v2 {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
}
.pp-ct-nearby-addr-v2 {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.4;
  margin-bottom: 6px;
}
.pp-ct-nearby-meta-v2 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.pp-ct-nearby-badge {
  background: var(--brand-pale);
  color: var(--brand);
  font-size: 11px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 999px;
}
.pp-ct-nearby-amt {
  font-size: 13px;
  color: var(--navy);
  font-weight: 800;
  letter-spacing: -0.01em;
}
.pp-ct-nearby-amt small {
  font-size: 10px;
  color: var(--ink-faint);
  font-weight: 600;
}

/* ── Planning history v2 ── */
.pp-plan-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}
.pp-plan-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.pp-plan-accent {
  width: 4px;
  background: #f59e0b;
  flex-shrink: 0;
}
.pp-plan-card--approved .pp-plan-accent {
  background: #059669;
}
.pp-plan-card--refused .pp-plan-accent {
  background: #dc2626;
}
.pp-plan-card--pending .pp-plan-accent {
  background: #f59e0b;
}
.pp-plan-body {
  flex: 1;
  padding: 12px 14px;
  min-width: 0;
}
.pp-plan-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.pp-plan-ref {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  background: #f1f5f9;
  color: var(--ink-soft);
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
}
.pp-plan-status {
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.pp-plan-desc {
  font-size: 12.5px;
  color: var(--ink);
  line-height: 1.55;
  margin: 4px 0;
}
.pp-plan-desc--clamped {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pp-plan-more {
  background: none;
  border: none;
  color: var(--brand);
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
  margin-bottom: 4px;
  font-family: inherit;
}
.pp-plan-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--ink-faint);
  font-weight: 600;
  margin-top: 6px;
}
.pp-plan-type {
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 4px;
  color: var(--ink-soft);
}
.pp-plan-date {
  color: var(--ink-soft);
}
.pp-plan-link {
  color: var(--brand);
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 2px;
}

/* ── Stamp Duty v2 ── */
.pp-sdlt-card-v2 {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
.pp-sdlt-hero {
  background: linear-gradient(135deg, var(--brand-pale), #ecfeff);
  border: 1px solid var(--brand-soft);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
  position: sticky;
  top: 8px;
  z-index: 2;
}
.pp-sdlt-hero-lbl {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}
.pp-sdlt-hero-val {
  font-size: 28px;
  font-weight: 800;
  color: var(--brand);
  letter-spacing: -0.03em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.pp-sdlt-hero-sub {
  font-size: 11.5px;
  color: var(--ink-soft);
  margin-top: 4px;
  font-weight: 600;
}

.pp-sdlt-input-v2 {
  display: flex;
  align-items: center;
  border: 2px solid var(--line);
  border-radius: 14px;
  padding: 6px 16px;
  background: #fff;
  margin-bottom: 12px;
  transition: border-color 0.2s ease;
}
.pp-sdlt-input-v2:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.12);
}
.pp-sdlt-curr-v2 {
  font-size: 22px;
  font-weight: 800;
  color: #cbd5e1;
  margin-right: 8px;
}
.pp-sdlt-input-v2 input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 14px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
  font-family: inherit;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.pp-sdlt-input-v2 input::placeholder {
  color: #cbd5e1;
  font-weight: 600;
}

.pp-sdlt-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pp-sdlt-bar-item {
}
.pp-sdlt-bar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.pp-sdlt-bar-rate {
  font-size: 12px;
  font-weight: 800;
  color: var(--ink-soft);
}
.pp-sdlt-bar-tax {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--navy);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.pp-sdlt-bar-track {
  height: 9px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 4px;
}
.pp-sdlt-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  min-width: 4px;
}
.pp-sdlt-bar-range {
  font-size: 11px;
  color: var(--ink-faint);
  font-weight: 600;
}

.pp-sdlt-empty {
  text-align: center;
  padding: 24px 12px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  border: 1px dashed var(--line);
}
.pp-sdlt-empty-ic {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--brand-pale);
  color: var(--brand);
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 800;
  margin: 0 auto 10px;
  animation: pp-pulse 2s ease-in-out infinite;
}
.pp-sdlt-empty-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 3px;
}
.pp-sdlt-empty-sub {
  font-size: 11.5px;
  color: var(--ink-faint);
  line-height: 1.5;
}
@keyframes pp-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(0, 161, 154, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 161, 154, 0);
  }
}

/* ── Passport unlock polish ── */
.pp-unlock-card--v2 {
  position: relative;
  box-shadow: 0 8px 22px rgba(35, 29, 69, 0.25);
  animation: pp-unlock-shimmer 3s ease-in-out infinite;
}
@keyframes pp-unlock-shimmer {
  0%,
  100% {
    box-shadow: 0 8px 22px rgba(35, 29, 69, 0.25);
  }
  50% {
    box-shadow:
      0 10px 30px rgba(0, 161, 154, 0.35),
      0 8px 22px rgba(35, 29, 69, 0.25);
  }
}
.pp-unlock-shine {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(94, 234, 212, 0.18) 0%,
    transparent 70%
  );
  pointer-events: none;
}
.pp-unlock-card--v2 .pp-unlock-feat {
  gap: 12px;
  padding-bottom: 10px;
}
.pp-unlock-card--v2 .pp-unlock-feat-ic {
  width: 32px;
  height: 32px;
  font-size: 15px;
  box-shadow:
    0 0 0 0 rgba(94, 234, 212, 0.4),
    0 0 12px rgba(94, 234, 212, 0.25);
}
.pp-unlock-card--v2 .pp-unlock-btn {
  box-shadow: 0 4px 14px rgba(94, 234, 212, 0.35);
  animation: pp-btn-glow 3s ease-in-out infinite;
}
@keyframes pp-btn-glow {
  0%,
  100% {
    box-shadow: 0 4px 14px rgba(94, 234, 212, 0.35);
  }
  50% {
    box-shadow: 0 6px 22px rgba(94, 234, 212, 0.6);
  }
}
</style>
