<template>
  <div class="prop-page mobile-container min-h-screen bg-umu-gradient">
    <!-- Loading -->
    <div v-if="pageLoading" class="prop-loading">
      <div class="prop-spinner" />
      <p>Loading property...</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="prop-loading">
      <p>{{ loadError }}</p>
      <button class="btn-back" @click="goBack">Go Back</button>
    </div>

    <!-- Content -->
    <template v-else-if="property">
      <!-- Hero image -->
      <div class="prop-hero">
        <ImageSlider :images="propertyImages" />
        <div class="hero-top">
          <button class="hero-btn" @click="goBack">
            <OPIcon name="leftChevronWhite" class="w-[16px] h-[16px]" />
          </button>
          <div class="flex gap-3">
            <button
              class="hero-btn"
              :class="{ 'hero-btn--wishlisted': wishlisted }"
              @click="handleWishlist"
            >
              <OPIcon name="wishlist" class="w-[18px] h-[18px]" />
            </button>
            <button class="hero-btn" @click="showShare = true">
              <OPIcon name="share" class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <!-- White content card -->
      <div class="prop-card">
        <!-- Address / Price -->
        <div class="prop-title-block">
          <h1 class="prop-address">{{ property.addressLine1 }}</h1>
          <p class="prop-city">
            {{ [property.city, property.county].filter(Boolean).join(', ') }},
            {{ property.postcode }}
          </p>
          <p class="prop-price">
            {{ formatPrice(property.estimatedPrice) }}
            <span class="prop-estimated">Estimated Value</span>
          </p>
        </div>

        <!-- Badges -->
        <div class="prop-badges">
          <span v-if="prop?.bedrooms" class="prop-badge">
            <OPIcon name="bedroomWhite" class="w-[13px] h-[13px]" />
            {{ prop.bedrooms }}
          </span>
          <span v-if="property.bathrooms" class="prop-badge">
            <OPIcon name="bathroomWhite" class="w-[13px] h-[13px]" />
            {{ property.bathrooms }}
          </span>
          <span v-if="property.propertyType" class="prop-badge">{{
            property.propertyType
          }}</span>
          <span v-if="prop?.sqft" class="prop-badge">
            <OPIcon name="sqftWhite" class="w-[13px] h-[13px]" />
            {{ prop.sqft.toLocaleString() }} sqft
          </span>
        </div>

        <!-- Score section -->
        <div class="prop-score-block">
          <template v-if="homeScore">
            <!-- Score gauge -->
            <svg
              viewBox="0 0 200 200"
              width="170"
              height="170"
              class="prop-gauge-svg"
            >
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e8e8ee"
                stroke-width="16"
                stroke-dasharray="376.99"
                stroke-dashoffset="94.25"
                stroke-linecap="round"
                transform="rotate(135 100 100)"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                :stroke="homeScoreColor"
                stroke-width="16"
                :stroke-dasharray="`${(homeScore.total / 100) * 376.99 * 0.75} 376.99`"
                stroke-linecap="round"
                transform="rotate(135 100 100)"
              />
              <text
                x="100"
                y="93"
                text-anchor="middle"
                font-size="44"
                font-weight="800"
                :fill="homeScoreColor"
                font-family="sans-serif"
              >
                {{ homeScore.total }}
              </text>
              <text
                x="100"
                y="115"
                text-anchor="middle"
                font-size="13"
                fill="#8e8e93"
                font-family="sans-serif"
              >
                {{ homeScore.rating }}
              </text>
            </svg>
            <div v-if="homeScoreIsAuto" class="prop-score-auto-pill">
              Estimated · Based on public EPC data
            </div>
            <div v-else class="prop-score-avg-pill">
              Heating: {{ homeScore.heating }} &nbsp;|&nbsp; Structure:
              {{ homeScore.structure }} &nbsp;|&nbsp; Efficiency:
              {{ homeScore.efficiency }}
            </div>
            <button
              class="prop-score-cta"
              @click="navigateTo(`/homescore/${property?.id}`)"
            >
              {{ homeScoreIsAuto ? 'Improve Accuracy' : 'Update Score' }}
            </button>
          </template>
          <template v-else>
            <!-- No score, no EPC data either -->
            <svg
              viewBox="0 0 200 200"
              width="170"
              height="170"
              class="prop-gauge-svg"
            >
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e8e8ee"
                stroke-width="16"
                stroke-dasharray="376.99"
                stroke-dashoffset="94.25"
                stroke-linecap="round"
                transform="rotate(135 100 100)"
              />
              <text
                x="100"
                y="100"
                text-anchor="middle"
                font-size="38"
                font-weight="800"
                fill="#d1d5db"
                font-family="sans-serif"
              >
                ?
              </text>
              <text
                x="100"
                y="122"
                text-anchor="middle"
                font-size="13"
                fill="#aeaeb2"
                font-family="sans-serif"
              >
                Not calculated
              </text>
            </svg>
            <p class="prop-score-note">
              Answer 11 quick questions to get your property's Homehealth Score.
            </p>
            <button
              class="prop-score-cta"
              @click="navigateTo(`/homescore/${property?.id}`)"
            >
              Calculate Homehealth Score
            </button>
          </template>
        </div>

        <!-- Property Details -->
        <div class="prop-section">
          <h2 class="prop-section-title">Property Details</h2>
          <div class="prop-details-card bg-white rounded-lg">
            <div class="prop-details-grid">
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="house" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Property type</p>
                  <p class="prop-detail-value">
                    {{ property.propertyType ?? '—' }}
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="titleNumber" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Title number</p>
                  <p class="prop-detail-value">
                    {{ property.titleNumber ?? '—' }}
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="uprn" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">UPRN</p>
                  <p class="prop-detail-value prop-detail-mono">
                    {{ property.uprn ?? '—' }}
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="sqft" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Floor Area</p>
                  <p class="prop-detail-value">
                    {{
                      prop?.sqft ? `${prop.sqft.toLocaleString()} sqft` : '—'
                    }}
                  </p>
                  <p v-if="prop?.floorAreaSqm" class="prop-detail-sub">
                    {{ Math.round(prop.floorAreaSqm) }} m²
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="epcRating" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">EPC Rating</p>
                  <p class="prop-detail-value">
                    {{ prop?.epcRating ?? '—' }}
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="tenure" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Tenure</p>
                  <p class="prop-detail-value">{{ prop?.tenure ?? '—' }}</p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="yearBuilt" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Year Built</p>
                  <p class="prop-detail-value">
                    {{ prop?.yearBuilt ?? '—' }}
                  </p>
                </div>
              </div>
              <div v-if="enrichment?.floodRisk" class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="goodEnergy" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Flood Risk</p>
                  <p class="prop-detail-value">{{ enrichment?.floodRisk }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick action strip -->
          <div class="prop-quick-actions">
            <button
              v-for="s in quickSections"
              :key="s.id"
              class="prop-quick-btn"
              :class="{ active: activeSection === s.id }"
              @click="toggleSection(s.id)"
            >
              <OPIcon :name="s.icon" class="w-[18px] h-[18px]" />
              <span class="prop-quick-label">{{ s.label }}</span>
            </button>
          </div>
        </div>

        <!-- Floor Plan -->
        <div
          v-show="activeSection === 'floor-plan'"
          id="section-floor-plan"
          class="prop-section"
        >
          <h2 class="prop-section-title">Floor Plan</h2>
          <div class="prop-floor-card">
            <img
              src="/op-icons/property/floorPlan.png"
              alt="Floor Plan"
              class="prop-floor-img"
            />
            <button class="prop-floor-expand">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path
                  d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                  stroke="#333"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Location and Nearby -->
        <div
          v-show="activeSection === 'location'"
          id="section-location"
          class="prop-section"
        >
          <h2 class="prop-section-title">Location &amp; Map</h2>
          <p class="prop-nearby-source">
            Map: Ordnance Survey · Boundary: OS NGD Building Footprint
          </p>

          <!-- Map 1: OS Interactive Map -->
          <p class="prop-map-label">Map</p>
          <div class="prop-map-wrap">
            <div ref="mapEl" class="prop-map" />
          </div>

          <!-- Map 2: Street View -->
          <p class="prop-map-label">Street View</p>
          <div class="prop-map-wrap">
            <a
              v-if="streetViewUrl"
              :href="`https://www.google.com/maps?q=${property?.latitude},${property?.longitude}&layer=c&cbll=${property?.latitude},${property?.longitude}`"
              target="_blank"
              rel="noopener"
              class="prop-sv-wrap"
            >
              <img
                :src="streetViewUrl"
                class="prop-sv-img"
                alt="Street View"
                loading="lazy"
              />
              <span class="prop-sv-overlay">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    fill="white"
                  />
                </svg>
                Open in Google Maps
              </span>
            </a>
            <div v-else class="prop-sv-unavailable">
              Street View not available for this location
            </div>
          </div>

          <!-- Map 3: Satellite View -->
          <p class="prop-map-label">Satellite</p>
          <div class="prop-map-wrap">
            <a
              v-if="satelliteUrl"
              :href="`https://www.google.com/maps?q=${property?.latitude},${property?.longitude}&t=k`"
              target="_blank"
              rel="noopener"
              class="prop-sv-wrap"
            >
              <img
                :src="satelliteUrl"
                class="prop-sv-img"
                alt="Satellite View"
                loading="lazy"
              />
              <span class="prop-sv-overlay">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    stroke-width="2"
                  />
                  <path
                    d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
                    stroke="white"
                    stroke-width="1.5"
                  />
                </svg>
                Open in Google Maps
              </span>
            </a>
            <div v-else class="prop-sv-unavailable">
              Satellite view unavailable
            </div>
          </div>
          <!-- Map legend — only shown once enrichment loads -->
          <div v-if="enrichment?.nearby" class="prop-map-legend">
            <span class="prop-map-legend-item"
              ><span
                class="prop-map-dot"
                style="background: #00a19a"
              />Property</span
            >
            <span class="prop-map-legend-item"
              ><span
                class="prop-map-dot"
                style="background: #3b82f6"
              />Schools</span
            >
            <span class="prop-map-legend-item"
              ><span
                class="prop-map-dot"
                style="background: #8b5cf6"
              />Trains</span
            >
            <span class="prop-map-legend-item"
              ><span
                class="prop-map-dot"
                style="background: #f59e0b"
              />Bus</span
            >
            <span class="prop-map-legend-item"
              ><span
                class="prop-map-dot"
                style="background: #10b981"
              />Parks</span
            >
            <span class="prop-map-legend-item"
              ><span
                class="prop-map-dot"
                style="background: #ec4899"
              />Airport</span
            >
          </div>
          <!-- Building footprint from OS NGD -->
          <div
            v-if="enrichment?.titleBoundary?.areaM2"
            class="prop-footprint-row"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              width="14"
              height="14"
              style="display: inline; margin-right: 5px; vertical-align: -2px"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="#00a19a"
                stroke-width="1.8"
                fill="rgba(0,161,154,0.1)"
                stroke-dasharray="4 2"
              />
            </svg>
            Building footprint:
            <strong
              >{{ Math.round(enrichment.titleBoundary.areaM2) }} m²</strong
            >
            <span class="prop-footprint-src"> · OS NGD</span>
          </div>
        </div>

        <!-- Train Stations -->
        <div
          v-show="activeSection === 'trains'"
          id="section-trains"
          class="prop-section"
        >
          <h2 class="prop-section-title">Train Stations Nearby</h2>
          <p class="prop-nearby-source">Source: OpenStreetMap / Overpass</p>
          <div class="prop-station-list">
            <template v-if="enrichment?.nearby?.trains?.length">
              <div
                v-for="s in enrichment.nearby.trains"
                :key="s.name"
                class="prop-station-row"
              >
                <div class="prop-station-icon" style="background: #f5f3ff">
                  <OPIcon name="nationalRailLogo" class="w-[18px] h-[18px]" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="prop-station-name">{{ s.name }}</p>
                  <p class="prop-station-dist">
                    <OPIcon
                      name="currentLocation"
                      class="w-[11px] h-[11px]"
                      style="
                        display: inline;
                        vertical-align: -1px;
                        margin-right: 3px;
                      "
                    />
                    {{ s.distanceKm }} km
                    <span v-if="s.operator" class="prop-station-op">
                      · {{ s.operator }}</span
                    >
                  </p>
                </div>
                <span class="prop-dist-pill">{{ s.distanceKm }} km</span>
              </div>
            </template>
            <p v-else-if="!enrichment" class="prop-nearby-empty">
              Loading train data...
            </p>
            <p v-else class="prop-nearby-empty">
              No train stations found nearby.
            </p>
          </div>
        </div>

        <!-- Schools -->
        <div
          v-show="activeSection === 'schools'"
          id="section-schools"
          class="prop-section"
        >
          <h2 class="prop-section-title">Schools Nearby</h2>
          <p class="prop-nearby-source">Source: Ordnance Survey NGD</p>
          <div class="prop-station-list">
            <template v-if="enrichment?.nearby?.schools?.length">
              <div
                v-for="s in enrichment.nearby.schools"
                :key="s.name"
                class="prop-station-row"
              >
                <div class="prop-station-icon" style="background: #eff6ff">
                  <OPIcon name="closeToSchool" class="w-[18px] h-[18px]" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="prop-station-name">{{ s.name }}</p>
                  <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span class="prop-school-cat-badge">{{ s.category }}</span>
                    <p class="prop-station-dist" style="margin: 0">
                      <OPIcon
                        name="currentLocation"
                        class="w-[11px] h-[11px]"
                        style="
                          display: inline;
                          vertical-align: -1px;
                          margin-right: 3px;
                        "
                      />
                      {{ s.distanceKm }} km
                    </p>
                  </div>
                </div>
              </div>
            </template>
            <p v-else-if="!enrichment" class="prop-nearby-empty">
              Loading schools data...
            </p>
            <p v-else class="prop-nearby-empty">No schools found nearby.</p>
          </div>
        </div>

        <!-- Parks -->
        <div
          v-show="activeSection === 'parks'"
          id="section-parks"
          class="prop-section"
        >
          <h2 class="prop-section-title">Parks Nearby</h2>
          <p class="prop-nearby-source">Source: OpenStreetMap / Overpass</p>
          <div class="prop-station-list">
            <template v-if="enrichment?.nearby?.parks?.length">
              <div
                v-for="s in enrichment.nearby.parks"
                :key="s.name"
                class="prop-station-row"
              >
                <div class="prop-station-icon" style="background: #ecfdf5">
                  <OPIcon name="closeToPublicPark" class="w-[18px] h-[18px]" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="prop-station-name">{{ s.name }}</p>
                  <p class="prop-station-dist">
                    <OPIcon
                      name="currentLocation"
                      class="w-[11px] h-[11px]"
                      style="
                        display: inline;
                        vertical-align: -1px;
                        margin-right: 3px;
                      "
                    />
                    {{ s.distanceKm }} km
                  </p>
                </div>
                <span class="prop-dist-pill">{{ s.distanceKm }} km</span>
              </div>
            </template>
            <p v-else-if="!enrichment" class="prop-nearby-empty">
              Loading parks data...
            </p>
            <p v-else class="prop-nearby-empty">No parks found nearby.</p>
          </div>
        </div>

        <!-- Bus Stops -->
        <div
          v-show="activeSection === 'bus-stops'"
          id="section-bus-stops"
          class="prop-section"
        >
          <h2 class="prop-section-title">Bus Stops Nearby</h2>
          <p class="prop-nearby-source">Source: OpenStreetMap / Overpass</p>
          <div class="prop-station-list">
            <template v-if="enrichment?.nearby?.busStops?.length">
              <div
                v-for="b in enrichment.nearby.busStops"
                :key="b.name + b.distanceKm"
                class="prop-station-row"
              >
                <div class="prop-station-icon" style="background: #fffbeb">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="#f59e0b"
                      stroke-width="2"
                      fill="none"
                    />
                    <path d="M3 8h18" stroke="#f59e0b" stroke-width="1.5" />
                    <circle
                      cx="7"
                      cy="19"
                      r="2"
                      stroke="#f59e0b"
                      stroke-width="1.5"
                      fill="none"
                    />
                    <circle
                      cx="17"
                      cy="19"
                      r="2"
                      stroke="#f59e0b"
                      stroke-width="1.5"
                      fill="none"
                    />
                    <path
                      d="M7 17v-3M17 17v-3"
                      stroke="#f59e0b"
                      stroke-width="1.5"
                    />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="prop-station-name">{{ b.name }}</p>
                  <p class="prop-station-dist">
                    <OPIcon
                      name="currentLocation"
                      class="w-[11px] h-[11px]"
                      style="
                        display: inline;
                        vertical-align: -1px;
                        margin-right: 3px;
                      "
                    />
                    {{ b.distanceKm }} km<span
                      v-if="b.ref"
                      class="prop-station-op"
                    >
                      · Stop {{ b.ref }}</span
                    >
                  </p>
                </div>
                <span class="prop-dist-pill">{{ b.distanceKm }} km</span>
              </div>
            </template>
            <p v-else-if="!enrichment" class="prop-nearby-empty">
              Loading bus stop data...
            </p>
            <p v-else class="prop-nearby-empty">
              No bus stops found within 700m.
            </p>
          </div>
        </div>

        <!-- Airports -->
        <div
          v-show="activeSection === 'airports'"
          id="section-airports"
          class="prop-section"
        >
          <h2 class="prop-section-title">Airports Nearby</h2>
          <p class="prop-nearby-source">Source: OpenStreetMap / Overpass</p>
          <div class="prop-station-list">
            <template v-if="enrichment?.nearby?.airports?.length">
              <div
                v-for="a in enrichment.nearby.airports"
                :key="a.name"
                class="prop-station-row"
              >
                <div class="prop-station-icon" style="background: #fdf2f8">
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path
                      d="M21 15l-9-4-2.5-7L2 9l4 3-1 4 4-1 4 6 3-3-1-5 5-3z"
                      stroke="#ec4899"
                      stroke-width="1.8"
                      fill="none"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="prop-station-name">{{ a.name }}</p>
                  <p class="prop-station-dist">
                    <OPIcon
                      name="currentLocation"
                      class="w-[11px] h-[11px]"
                      style="
                        display: inline;
                        vertical-align: -1px;
                        margin-right: 3px;
                      "
                    />
                    {{ a.distanceKm }} km
                    <span v-if="a.iata" class="prop-station-op">
                      · {{ a.iata }}</span
                    >
                  </p>
                </div>
                <span class="prop-dist-pill prop-dist-pill--airport"
                  >{{ a.distanceKm }} km</span
                >
              </div>
            </template>
            <p v-else-if="!enrichment" class="prop-nearby-empty">
              Loading airport data...
            </p>
            <p v-else class="prop-nearby-empty">
              No airports found within 50km.
            </p>
          </div>
        </div>

        <!-- EPC Rating -->
        <div
          v-show="activeSection === 'epc'"
          id="section-epc"
          class="prop-section"
        >
          <div class="prop-section-title-row">
            <h2 class="prop-section-title">EPC Rating</h2>
            <a
              v-if="enrichment?.epcCert?.certUrl"
              :href="enrichment.epcCert.certUrl"
              target="_blank"
              rel="noopener"
              class="prop-epc-cert-link"
              >View Certificate</a
            >
          </div>
          <div class="prop-epc-card">
            <div class="prop-epc-header">
              <span>Score</span>
              <span>Energy Rating</span>
              <span>Current</span>
              <span>Potential</span>
            </div>
            <div
              v-for="band in epcBands"
              :key="band.label"
              class="prop-epc-row"
              :class="{ 'epc-current': band.label === prop?.epcRating }"
            >
              <span class="prop-epc-range">{{ band.range }}</span>
              <div class="prop-epc-bar-wrap">
                <div
                  class="prop-epc-bar"
                  :style="{ width: band.width, background: band.color }"
                >
                  {{ band.label }}
                </div>
              </div>
              <div class="prop-epc-dot-wrap">
                <div
                  v-if="band.label === prop?.epcRating"
                  class="prop-epc-dot current"
                />
                <div v-else class="prop-epc-dot" />
              </div>
              <div class="prop-epc-dot-wrap">
                <div
                  v-if="band.label === potentialEpc"
                  class="prop-epc-dot potential"
                />
                <div v-else class="prop-epc-dot" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sales History -->
        <div
          v-show="activeSection === 'sales'"
          id="section-sales"
          class="prop-section"
        >
          <h2 class="prop-section-title">Sales History</h2>

          <!-- Tabs -->
          <div class="prop-cov-tabs" style="margin-bottom: 12px">
            <button
              :class="['prop-cov-tab', { active: salesTab === 'property' }]"
              @click="salesTab = 'property'"
            >
              This Property
              <span
                v-if="enrichment?.salesHistory?.thisProperty?.length"
                class="prop-sales-tab-count"
              >
                {{ enrichment.salesHistory.thisProperty.length }}
              </span>
            </button>
            <button
              :class="['prop-cov-tab', { active: salesTab === 'nearby' }]"
              @click="salesTab = 'nearby'"
            >
              Nearby Sales
              <span
                v-if="enrichment?.salesHistory?.nearbySales?.length"
                class="prop-sales-tab-count"
              >
                {{ enrichment.salesHistory.nearbySales.length }}
              </span>
            </button>
          </div>

          <!-- This Property tab -->
          <div v-if="salesTab === 'property'">
            <template v-if="enrichment?.salesHistory?.thisProperty?.length">
              <div class="prop-sales-timeline">
                <div
                  v-for="(sale, i) in enrichment.salesHistory.thisProperty"
                  :key="i"
                  class="prop-sale-card"
                >
                  <div
                    class="prop-sale-card-dot prop-sale-card-dot--primary"
                  ></div>
                  <div class="prop-sale-card-body">
                    <div class="prop-sale-card-top">
                      <span class="prop-sale-card-price">{{
                        formatPrice(sale.price)
                      }}</span>
                      <span class="prop-sale-card-date">{{
                        formatSaleDate(sale.date)
                      }}</span>
                    </div>
                    <div class="prop-sale-card-tags">
                      <span v-if="sale.propertyType" class="prop-sale-tag">{{
                        sale.propertyType
                      }}</span>
                      <span v-if="sale.tenure" class="prop-sale-tag">{{
                        sale.tenure
                      }}</span>
                      <span
                        v-if="sale.newBuild"
                        class="prop-sale-tag prop-sale-tag--new"
                        >New Build</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="prop-sales-empty">
              <p>No sales recorded for this address.</p>
              <p class="prop-sales-empty-sub">
                Either this property hasn't been sold since 1995, or the address
                could not be matched.
              </p>
            </div>
          </div>

          <!-- Nearby Sales tab -->
          <div v-if="salesTab === 'nearby'">
            <template v-if="enrichment?.salesHistory?.nearbySales?.length">
              <div class="prop-sales-timeline">
                <div
                  v-for="(sale, i) in enrichment.salesHistory.nearbySales"
                  :key="i"
                  class="prop-sale-card"
                >
                  <div class="prop-sale-card-dot"></div>
                  <div class="prop-sale-card-body">
                    <div class="prop-sale-card-top">
                      <span class="prop-sale-card-price">{{
                        formatPrice(sale.price)
                      }}</span>
                      <span class="prop-sale-card-date">{{
                        formatSaleDate(sale.date)
                      }}</span>
                    </div>
                    <p v-if="sale.address" class="prop-sale-card-addr">
                      {{ sale.address
                      }}<span v-if="sale.town">, {{ sale.town }}</span>
                    </p>
                    <div class="prop-sale-card-tags">
                      <span v-if="sale.propertyType" class="prop-sale-tag">{{
                        sale.propertyType
                      }}</span>
                      <span v-if="sale.tenure" class="prop-sale-tag">{{
                        sale.tenure
                      }}</span>
                      <span
                        v-if="sale.newBuild"
                        class="prop-sale-tag prop-sale-tag--new"
                        >New Build</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <p class="prop-sales-nearby-note">
                Showing most recent sales within the same postcode.
              </p>
            </template>
            <div v-else class="prop-sales-empty">
              <p>No nearby sales in the last 3 years.</p>
            </div>
          </div>

          <p class="prop-sales-source">
            Source: HM Land Registry Price Paid Data
          </p>
        </div>

        <!-- Coverage: Broadband, Mobile, Cable/TV -->
        <div
          v-show="activeSection === 'coverage'"
          id="section-coverage"
          class="prop-section"
        >
          <h2 class="prop-section-title">Coverage</h2>

          <!-- Coverage sub-tabs -->
          <div class="prop-cov-tabs">
            <button
              :class="['prop-cov-tab', { active: coverageTab === 'broadband' }]"
              @click="coverageTab = 'broadband'"
            >
              Broadband
            </button>
            <button
              :class="['prop-cov-tab', { active: coverageTab === 'mobile' }]"
              @click="coverageTab = 'mobile'"
            >
              Mobile
            </button>
            <button
              :class="['prop-cov-tab', { active: coverageTab === 'tv' }]"
              @click="coverageTab = 'tv'"
            >
              TV / Cable
            </button>
          </div>

          <!-- Broadband tab -->
          <div
            v-if="coverageTab === 'broadband' && enrichment?.broadband"
            class="prop-broadband-card"
          >
            <div class="prop-bb-speeds">
              <div class="prop-bb-speed-item">
                <span class="prop-bb-speed-val">{{
                  enrichment.broadband.maxDownload ?? '—'
                }}</span>
                <span class="prop-bb-speed-unit">Mbps</span>
                <span class="prop-bb-speed-label">Max Download</span>
              </div>
              <div class="prop-bb-divider" />
              <div class="prop-bb-speed-item">
                <span class="prop-bb-speed-val">{{
                  enrichment.broadband.maxUpload ?? '—'
                }}</span>
                <span class="prop-bb-speed-unit">Mbps</span>
                <span class="prop-bb-speed-label">Max Upload</span>
              </div>
            </div>
            <div class="prop-bb-types">
              <span
                class="prop-bb-type"
                :class="{ 'prop-bb-type--on': enrichment.broadband.ultrafast }"
                >Ultrafast</span
              >
              <span
                class="prop-bb-type"
                :class="{ 'prop-bb-type--on': enrichment.broadband.superfast }"
                >Superfast</span
              >
              <span
                class="prop-bb-type"
                :class="{ 'prop-bb-type--on': enrichment.broadband.fttp }"
                >FTTP</span
              >
              <span
                class="prop-bb-type"
                :class="{ 'prop-bb-type--on': enrichment.broadband.fttc }"
                >FTTC</span
              >
              <span
                class="prop-bb-type"
                :class="{ 'prop-bb-type--on': enrichment.broadband.cable }"
                >Cable</span
              >
            </div>
            <p class="prop-cov-source">Source: Ofcom Connected Nations</p>
          </div>
          <div
            v-else-if="coverageTab === 'broadband'"
            class="prop-cov-unavailable"
          >
            Broadband data not available for this postcode.
          </div>

          <!-- Mobile tab -->
          <div v-if="coverageTab === 'mobile'" class="prop-mobile-card">
            <template v-if="enrichment?.mobileSignal">
              <div
                v-for="op in mobileOperators"
                :key="op.key"
                class="prop-mobile-row"
              >
                <div class="prop-mobile-op">{{ op.label }}</div>
                <div class="prop-mobile-signals">
                  <div class="prop-mobile-signal-item">
                    <span
                      class="prop-mobile-dot"
                      :class="
                        signalClass(enrichment.mobileSignal[op.key]?.data4g)
                      "
                    />
                    <span class="prop-mobile-sig-label">4G</span>
                  </div>
                  <div class="prop-mobile-signal-item">
                    <span
                      class="prop-mobile-dot"
                      :class="
                        signalClass(enrichment.mobileSignal[op.key]?.data5g)
                      "
                    />
                    <span class="prop-mobile-sig-label">5G</span>
                  </div>
                  <div class="prop-mobile-signal-item">
                    <span
                      class="prop-mobile-dot"
                      :class="
                        signalClass(enrichment.mobileSignal[op.key]?.indoor4g)
                      "
                    />
                    <span class="prop-mobile-sig-label">Indoor</span>
                  </div>
                </div>
              </div>
              <div class="prop-mobile-legend">
                <span class="prop-mobile-dot prop-mobile-dot--good" /> Good
                &nbsp;
                <span class="prop-mobile-dot prop-mobile-dot--limited" />
                Limited &nbsp;
                <span class="prop-mobile-dot prop-mobile-dot--none" /> None
              </div>
              <p class="prop-cov-source">Source: Ofcom Connected Nations</p>
            </template>
            <div v-else class="prop-cov-unavailable">
              Mobile signal data not available.
              <a
                href="https://checker.ofcom.org.uk/en-gb/mobile-coverage"
                target="_blank"
                rel="noopener"
                class="prop-cov-link"
                >Check on Ofcom</a
              >
            </div>
          </div>

          <!-- TV / Cable tab -->
          <div v-if="coverageTab === 'tv'" class="prop-tv-card">
            <div class="prop-tv-row">
              <span class="prop-tv-label">Satellite TV (Sky / Freesat)</span>
              <span class="prop-tv-badge prop-tv-badge--yes">Available</span>
            </div>
            <div class="prop-tv-row">
              <span class="prop-tv-label">Freeview (Digital Aerial)</span>
              <span class="prop-tv-badge prop-tv-badge--yes">Available</span>
            </div>
            <div class="prop-tv-row">
              <span class="prop-tv-label">Cable TV (Virgin Media)</span>
              <span
                class="prop-tv-badge"
                :class="
                  enrichment?.broadband?.cable
                    ? 'prop-tv-badge--yes'
                    : 'prop-tv-badge--check'
                "
                >{{
                  enrichment?.broadband?.cable
                    ? 'Likely Available'
                    : 'Check Availability'
                }}</span
              >
            </div>
            <a
              v-if="!enrichment?.broadband?.cable"
              href="https://store.virginmedia.com/check-postcode.html"
              target="_blank"
              rel="noopener"
              class="prop-cov-link"
              style="margin-top: 10px; display: block"
              >Check Virgin Media postcode</a
            >
          </div>
        </div>

        <!-- Flood Risk Detail -->
        <div
          v-show="activeSection === 'flood'"
          id="section-flood"
          class="prop-section"
        >
          <h2 class="prop-section-title">Flood Risk</h2>
          <p v-if="!enrichment" class="prop-nearby-empty">
            Loading flood risk data...
          </p>
          <p v-else-if="!enrichment.floodRisk" class="prop-nearby-empty">
            No flood risk data available for this location.
          </p>
          <div v-if="enrichment?.floodRisk" class="prop-flood-card">
            <div class="prop-flood-header">
              <div
                class="prop-flood-badge"
                :class="`prop-flood-badge--${(enrichment.floodRisk ?? 'very-low').toLowerCase().replace(/\s/g, '-')}`"
              >
                {{ enrichment.floodRisk }}
              </div>
              <p class="prop-flood-desc">
                <template v-if="enrichment.floodRisk === 'Very Low'"
                  >Not in an Environment Agency flood warning area.</template
                >
                <template v-else-if="enrichment.floodRisk === 'Low'"
                  >Within an EA flood warning area — no active warnings. River
                  or surface water flooding possible in extreme
                  events.</template
                >
                <template v-else-if="enrichment.floodRisk === 'Medium'"
                  >Flood alert active nearby. Some risk of flooding from rivers
                  or sea.</template
                >
                <template v-else-if="enrichment.floodRisk === 'High'"
                  >Flood warning issued nearby. Flooding of homes and businesses
                  is expected.</template
                >
                <template v-else-if="enrichment.floodRisk === 'Severe'"
                  >Severe flood warning — danger to life. Immediate action
                  required.</template
                >
                <template v-else
                  >Source: Environment Agency flood monitoring.</template
                >
              </p>
            </div>
            <div v-if="enrichment.floodZones?.length" class="prop-flood-zones">
              <div
                v-for="(zone, i) in enrichment.floodZones"
                :key="i"
                class="prop-flood-zone-row"
              >
                <OPIcon
                  name="goodEnergy"
                  class="w-[14px] h-[14px] shrink-0 mt-0.5 text-teal-600"
                />
                <div class="flex-1 min-w-0">
                  <p class="prop-flood-zone-name">{{ zone.name }}</p>
                  <p class="prop-flood-zone-sev">
                    {{ zone.severity }}
                    <span v-if="zone.riverSea"> · {{ zone.riverSea }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Flood risk map -->
            <div class="prop-flood-map-wrap">
              <div ref="floodMapEl" class="prop-flood-map" />
              <div class="prop-flood-map-legend">
                <span class="prop-flood-legend-item"
                  ><span class="prop-flood-dot" style="background: #dc2626" />
                  Severe / Warning</span
                >
                <span class="prop-flood-legend-item"
                  ><span class="prop-flood-dot" style="background: #f59e0b" />
                  Alert / Medium</span
                >
                <span class="prop-flood-legend-item"
                  ><span class="prop-flood-dot" style="background: #3b82f6" />
                  Flood Zone</span
                >
              </div>
              <p class="prop-flood-map-src">
                Source: Environment Agency Flood Monitoring API
              </p>
            </div>
          </div>
        </div>

        <!-- Listed Buildings Nearby -->
        <div
          v-show="activeSection === 'heritage'"
          id="section-heritage"
          class="prop-section"
        >
          <h2 class="prop-section-title">Heritage &amp; Historic Sites</h2>
          <p class="prop-nearby-source">
            Source: OpenStreetMap heritage data · 800m radius
          </p>
          <div class="prop-listed-list">
            <div
              v-for="(b, i) in enrichment?.listedBuildings ?? []"
              :key="i"
              class="prop-listed-row"
            >
              <div class="prop-listed-grade">{{ b.grade ?? 'LB' }}</div>
              <div class="flex-1 min-w-0">
                <p class="prop-listed-name">{{ b.name }}</p>
                <p v-if="b.location" class="prop-listed-loc">
                  {{ b.location }}
                </p>
              </div>
              <a
                v-if="b.link"
                :href="b.link"
                target="_blank"
                rel="noopener"
                class="prop-listed-link"
                >View</a
              >
            </div>
            <p
              v-if="enrichment && !enrichment.listedBuildings?.length"
              class="prop-nearby-empty"
            >
              No heritage sites recorded within 800m.
            </p>
            <p v-else-if="!enrichment" class="prop-nearby-empty">
              Loading heritage data...
            </p>
          </div>
        </div>

        <!-- Stamp Duty Calculator -->
        <div
          v-show="activeSection === 'stamp-duty'"
          id="section-stamp-duty"
          class="prop-section"
        >
          <h2 class="prop-section-title">Stamp Duty Calculator</h2>
          <div class="prop-sdlt-card">
            <div class="prop-sdlt-input-row">
              <span class="prop-sdlt-currency">£</span>
              <input
                v-model="sdltPriceRaw"
                type="text"
                inputmode="numeric"
                placeholder="Enter property price"
                class="prop-sdlt-input"
                @input="onSdltInput"
              />
            </div>
            <div class="prop-sdlt-options">
              <button
                :class="[
                  'prop-sdlt-opt',
                  { active: sdltBuyerType === 'standard' },
                ]"
                @click="sdltBuyerType = 'standard'"
              >
                Standard
              </button>
              <button
                :class="[
                  'prop-sdlt-opt',
                  { active: sdltBuyerType === 'firsttime' },
                ]"
                @click="sdltBuyerType = 'firsttime'"
              >
                First-Time Buyer
              </button>
              <button
                :class="[
                  'prop-sdlt-opt',
                  { active: sdltBuyerType === 'additional' },
                ]"
                @click="sdltBuyerType = 'additional'"
              >
                Additional Property
              </button>
            </div>
            <div class="prop-sdlt-breakdown">
              <div
                v-for="band in sdltBreakdown.bands"
                :key="band.label"
                class="prop-sdlt-band-row"
              >
                <span class="prop-sdlt-band-range">{{ band.label }}</span>
                <span class="prop-sdlt-band-rate">{{ band.rate }}%</span>
                <span class="prop-sdlt-band-tax">{{
                  formatPrice(band.tax)
                }}</span>
              </div>
            </div>
            <div class="prop-sdlt-total-row">
              <span class="prop-sdlt-total-label">Total Stamp Duty</span>
              <span class="prop-sdlt-total-val">{{
                formatPrice(sdltBreakdown.total)
              }}</span>
            </div>
            <p class="prop-sdlt-note">
              England &amp; Northern Ireland rates ({{
                new Date().getFullYear()
              }}).
              <a
                href="https://www.gov.uk/stamp-duty-land-tax/residential-property-rates"
                target="_blank"
                rel="noopener"
                class="prop-cov-link"
                >Full details on GOV.UK</a
              >
            </p>
          </div>
        </div>

        <!-- Council Tax -->
        <div
          v-show="activeSection === 'council-tax'"
          id="section-council-tax"
          class="prop-section"
        >
          <h2 class="prop-section-title">Council Tax</h2>

          <!-- Sub-tabs -->
          <div class="prop-cov-tabs" style="margin-bottom: 12px">
            <button
              :class="['prop-cov-tab', { active: ctTab === 'property' }]"
              @click="ctTab = 'property'"
            >
              This Property
            </button>
            <button
              :class="['prop-cov-tab', { active: ctTab === 'bands' }]"
              @click="ctTab = 'bands'"
            >
              All Bands
            </button>
            <button
              :class="['prop-cov-tab', { active: ctTab === 'nearby' }]"
              @click="ctTab = 'nearby'"
            >
              Nearby
            </button>
          </div>

          <!-- This Property tab -->
          <div v-if="ctTab === 'property'" class="prop-ct-card">
            <p class="prop-ct-explainer">
              Council tax is charged by local authorities and varies by property
              band. Bands are based on estimated property values from April
              1991.
            </p>
            <div v-if="enrichment?.councilTax?.band" class="prop-ct-main">
              <div class="prop-ct-band">{{ enrichment.councilTax.band }}</div>
              <div class="prop-ct-info">
                <p class="prop-ct-label">
                  Band {{ enrichment.councilTax.band }}
                </p>
                <p
                  v-if="enrichment.councilTax.annualEstimate"
                  class="prop-ct-amount"
                >
                  ~£{{ enrichment.councilTax.annualEstimate.toLocaleString() }}
                  / year
                </p>
                <p
                  v-if="enrichment.councilTax.councilName"
                  class="prop-ct-council"
                >
                  {{ enrichment.councilTax.councilName }}
                </p>
                <p class="prop-ct-approx-note">
                  {{
                    enrichment.councilTax.dataSource ??
                    'England average 2024/25'
                  }}
                </p>
              </div>
            </div>
            <div v-else class="prop-ct-unknown">
              <p class="prop-ct-unknown-label">
                Band not available for this property.
              </p>
              <p class="prop-ct-approx-note">
                The band may be available once the property has an EPC
                certificate.
              </p>
            </div>
            <a
              href="https://www.gov.uk/council-tax-bands"
              target="_blank"
              rel="noopener"
              class="prop-ct-link"
            >
              Check exact amount on GOV.UK
            </a>
          </div>

          <!-- All Bands reference tab -->
          <div v-if="ctTab === 'bands'" class="prop-ct-bands-table">
            <div
              v-for="b in ctBandReference"
              :key="b.band"
              class="prop-ct-bands-row"
              :class="{
                'prop-ct-bands-row--active':
                  enrichment?.councilTax?.band === b.band,
              }"
            >
              <div
                class="prop-ct-bands-letter"
                :class="{ active: enrichment?.councilTax?.band === b.band }"
              >
                {{ b.band }}
              </div>
              <div class="prop-ct-bands-range">{{ b.range }}</div>
              <div class="prop-ct-bands-est">
                ~£{{ b.estimate.toLocaleString() }}/yr
              </div>
            </div>
            <p
              class="prop-ct-approx-note"
              style="margin-top: 10px; padding: 0 4px"
            >
              Ranges are 1991 valuations used to assign bands. Annual estimates
              are England averages for 2024/25.
            </p>
          </div>

          <!-- Nearby tab -->
          <div v-if="ctTab === 'nearby'">
            <template v-if="enrichment?.councilTax?.nearby?.length">
              <div class="prop-ct-nearby-list">
                <div
                  v-for="(p, i) in enrichment.councilTax.nearby"
                  :key="i"
                  class="prop-ct-nearby-row"
                >
                  <div class="prop-ct-nearby-addr">{{ p.address }}</div>
                  <div class="prop-ct-nearby-right">
                    <span class="prop-ct-nearby-band">Band {{ p.band }}</span>
                    <span v-if="p.annualEstimate" class="prop-ct-nearby-est">
                      ~£{{ p.annualEstimate.toLocaleString() }} pa
                    </span>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="prop-cov-unavailable">
              No nearby council tax data available from EPC records.
            </div>
          </div>
        </div>

        <!-- Planning -->
        <div
          v-show="activeSection === 'planning'"
          id="section-planning"
          class="prop-section"
        >
          <h2 class="prop-section-title">Planning</h2>
          <div class="prop-planning-card">
            <!-- Constraints by category -->
            <template v-if="enrichment?.planningHistory?.constraints?.length">
              <div class="prop-planning-label">Constraints</div>
              <template v-for="cat in planningCategories" :key="cat.id">
                <div
                  v-if="planningByCategory(cat.id).length"
                  class="prop-planning-category"
                >
                  <div class="prop-planning-cat-header">
                    <span
                      class="prop-planning-cat-dot"
                      :style="{ background: cat.color }"
                    />
                    {{ cat.label }}
                  </div>
                  <div class="prop-planning-list">
                    <div
                      v-for="(c, i) in planningByCategory(cat.id)"
                      :key="i"
                      class="prop-planning-row"
                    >
                      <div
                        class="prop-planning-type-badge"
                        :style="{ background: cat.bg, color: cat.color }"
                      >
                        {{ c.type }}
                      </div>
                      <p class="prop-planning-name">{{ c.name }}</p>
                      <p v-if="c.reference" class="prop-planning-ref">
                        Ref: {{ c.reference }}
                      </p>
                    </div>
                  </div>
                </div>
              </template>
            </template>
            <p
              v-else-if="
                enrichment && !enrichment.planningHistory?.constraints?.length
              "
              class="prop-planning-none"
            >
              No planning constraints recorded for this location.
            </p>

            <!-- Planning Applications -->
            <template v-if="enrichment?.planningHistory?.applications?.length">
              <div
                class="prop-planning-label"
                :style="{
                  marginTop: enrichment?.planningHistory?.constraints?.length
                    ? '16px'
                    : '0',
                }"
              >
                Planning Applications
              </div>
              <div class="prop-planning-apps">
                <div
                  v-for="(app, i) in enrichment.planningHistory.applications"
                  :key="i"
                  class="prop-planning-app-row"
                >
                  <div class="prop-planning-app-top">
                    <span class="prop-planning-ref">{{
                      app.reference ?? 'No ref'
                    }}</span>
                    <span
                      v-if="app.decision"
                      class="prop-planning-decision"
                      :class="planningDecisionClass(app.decision)"
                      >{{ app.decision }}</span
                    >
                    <span
                      v-else-if="app.status"
                      class="prop-planning-decision prop-planning-decision--pending"
                    >
                      {{ app.status }}
                    </span>
                  </div>
                  <p v-if="app.description" class="prop-planning-app-desc">
                    {{ app.description }}
                  </p>
                  <div class="prop-planning-app-meta">
                    <span
                      v-if="app.applicationType"
                      class="prop-planning-app-type"
                      >{{ app.applicationType }}</span
                    >
                    <span
                      v-if="app.decisionDate"
                      class="prop-planning-app-date"
                      >{{ formatSaleDate(app.decisionDate) }}</span
                    >
                  </div>
                  <a
                    v-if="app.docUrl"
                    :href="app.docUrl"
                    target="_blank"
                    rel="noopener"
                    class="prop-planning-app-link"
                  >
                    View documents
                  </a>
                </div>
              </div>
            </template>

            <a
              href="https://www.planning.data.gov.uk/"
              target="_blank"
              rel="noopener"
              class="prop-ct-link"
              style="margin-top: 14px; display: inline-block"
              >planning.data.gov.uk</a
            >
          </div>
        </div>

        <div class="prop-bottom-pad" />
      </div>
    </template>

    <!-- Drawers -->
    <BaseDrawer
      v-model="showRegisterInterest"
      title="Register Interest"
      :showBackButton="true"
      @close="showRegisterInterest = false"
    >
      <RegisterInterestContent
        :address="`${property?.addressLine1}, ${property?.postcode}`"
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
        :property-price="formatPrice(property?.estimatedPrice)"
        :property-image="propertyImages[0]"
        @share="handleShare"
      />
    </BaseDrawer>

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

    <PropertyActionBar
      v-if="property && !pageLoading"
      :actions="actionBarItems"
      @action="handleAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import PropertyActionBar from '@/components/property/PropertyActionBar.vue'
import RegisterInterestContent from '~/components/property/RegisterInterestContent.vue'
import ClaimPassportDrawer from '~/components/property/ClaimPassportDrawer.vue'
import OPIcon from '~/components/ui/OPIcon.vue'
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import ImageSlider from '~/components/ui/ImageSlider.vue'
import Toast from '~/components/ui/Toast.vue'
import ShareContent from '~/components/property/ShareContent.vue'
import { useAppToast } from '~/composables/useCustomToast'
import { usePropertySearch } from '~/composables/usePropertySearch'
import { usePassportClaim } from '~/composables/usePassportClaim'
import { usePropertyActions } from '~/composables/usePropertyActions'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const propertyId = route.params.id as string

const { getPropertyDetails, formatPrice } = usePropertySearch()
const { getPassportStatus } = usePassportClaim()
const { toastState, showToast, hideToast } = useAppToast()
const { wishlisted, saved, toggleWishlist, toggleSave, fetchActions } =
  usePropertyActions()

const config = useRuntimeConfig()
const property = ref<any>(null)
const passportStatus = ref<any>(null)
const enrichment = ref<any>(null)

// Merge DB property with live EPC data from enrichment for OS properties missing EPC fields
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
const pageLoading = ref(true)
const loadError = ref('')
const showRegisterInterest = ref(false)
const showShare = ref(false)
const showClaimDrawer = ref(false)
const scoreTab = ref('home')

// HomeScore from localStorage / backend / auto-generated
const homeScore = ref<{
  total: number
  rating: string
  heating: number
  structure: number
  efficiency: number
  electrics: number
  plumbing: number
} | null>(null)
const homeScoreIsAuto = ref(false) // true when score is estimated from public data, not user-answered

const homeScoreColor = computed(() => {
  const t = homeScore.value?.total ?? 0
  if (t >= 85) return '#00c896'
  if (t >= 70) return '#00a19a'
  if (t >= 50) return '#f59e0b'
  return '#ef4444'
})

const nearbyTab = ref('train')
const coverageTab = ref('broadband')

// ── Section navigation ────────────────────────────────────────────────────────
const activeSection = ref<string>('location')

const quickSections = [
  { id: 'location', label: 'Map', icon: 'locationFilled' },
  { id: 'trains', label: 'Trains', icon: 'train' },
  { id: 'schools', label: 'Schools', icon: 'closeToSchool' },
  { id: 'bus-stops', label: 'Bus Stops', icon: 'publicTransport' },
  { id: 'airports', label: 'Airports', icon: 'airport' },
  { id: 'parks', label: 'Parks', icon: 'closeToPublicPark' },
  { id: 'floor-plan', label: 'Floor Plan', icon: 'floorPlan' },
  { id: 'epc', label: 'EPC', icon: 'epcRating' },
  { id: 'sales', label: 'Sales', icon: 'transactionInformation' },
  { id: 'coverage', label: 'Coverage', icon: 'mobileSignal' },
  { id: 'flood', label: 'Flood Risk', icon: 'environmental' },
  { id: 'council-tax', label: 'Council Tax', icon: 'insurance' },
  { id: 'planning', label: 'Planning', icon: 'alterationsAndPlanning' },
  { id: 'stamp-duty', label: 'Stamp Duty', icon: 'otherCharges' },
  { id: 'heritage', label: 'Heritage', icon: 'boundaries' },
]

let mapInitialised = false
function toggleSection(id: string) {
  if (activeSection.value === id) {
    return // don't collapse — always keep one open
  }
  activeSection.value = id
  nextTick(() => {
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (id === 'location' && !mapInitialised) {
      mapInitialised = true
      initMap()
    }
    if (id === 'flood' && !floodMapInitialised) {
      floodMapInitialised = true
      initFloodMap()
    }
  })
}
const salesTab = ref('property')
const ctTab = ref('property')

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
const sdltBuyerType = ref<'standard' | 'firsttime' | 'additional'>('standard')
const sdltPriceInput = ref(0)
const sdltPriceRaw = ref('')
const mapEl = ref<HTMLElement | null>(null)
const floodMapEl = ref<HTMLElement | null>(null)
let floodMapInstance: any = null
let floodMapInitialised = false
let mapInstance: any = null

const nearbyTabOptions = computed(() => {
  const nearby = enrichment.value?.nearby ?? {}

  const mapPlace = (p: any, icon: string) => ({
    name: p.name,
    distance: p.distanceKm ? `${p.distanceKm} km` : (p.vicinity ?? ''),
    icon,
    category: p.category ?? null,
  })

  return [
    {
      value: 'train',
      label: 'Train Stations',
      icon: 'trainWhite',
      items: (nearby.trains ?? []).map((p: any) =>
        mapPlace(p, 'nationalRailLogo'),
      ),
    },
    {
      value: 'school',
      label: 'Schools',
      icon: 'closeToSchool',
      items: (nearby.schools ?? []).map((p: any) =>
        mapPlace(p, 'closeToSchool'),
      ),
    },
    {
      value: 'park',
      label: 'Parks',
      icon: 'closeToPublicPark',
      items: (nearby.parks ?? []).map((p: any) =>
        mapPlace(p, 'closeToPublicPark'),
      ),
    },
    {
      value: 'bus',
      label: 'Bus Stops',
      icon: 'currentLocation',
      items: (nearby.busStops ?? []).map((p: any) =>
        mapPlace(p, 'currentLocation'),
      ),
    },
    {
      value: 'airport',
      label: 'Airports',
      icon: 'locationFilled',
      items: (nearby.airports ?? []).map((p: any) =>
        mapPlace(p, 'locationFilled'),
      ),
    },
  ]
})

const streetViewUrl = computed(() => enrichment.value?.streetViewUrl ?? null)

const satelliteUrl = computed(() => {
  const token = config.public.mapboxToken as string
  const lat = property.value?.latitude
  const lng = property.value?.longitude
  if (!lat || !lng || !token) return null
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${lng},${lat},16,0/800x300@2x?access_token=${token}`
})

// Pool of varied UK-style property photos
const PROPERTY_IMAGE_POOL = [
  'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1643387/pexels-photo-1643387.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2249531/pexels-photo-2249531.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1568605/pexels-photo-1568605.jpeg?auto=compress&cs=tinysrgb&w=800',
]

const propertyImages = computed(() => {
  const images: string[] = []
  const isStreetView = (url: string) =>
    url.includes('maps.googleapis.com/maps/api/streetview')

  // 1. Google Street View as first slide (real exterior photo)
  const lat = property.value?.latitude
  const lon = property.value?.longitude
  const googleKey = config.public.googleApiKey as string
  if (lat && lon && googleKey) {
    images.push(
      `https://maps.googleapis.com/maps/api/streetview?size=800x500&location=${lat},${lon}&key=${googleKey}&fov=90&pitch=10&radius=200&source=outdoor&return_error_codes=true`,
    )
  }

  // 2. property.imageUrl only if it's not a duplicate Street View URL
  const imgUrl = property.value?.imageUrl
  if (imgUrl && !isStreetView(imgUrl)) {
    images.push(imgUrl)
  }

  // 3. Pick 3 varied images from the pool, seeded by property id so they're stable per property
  const id = property.value?.id ?? ''
  const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const pool = [...PROPERTY_IMAGE_POOL]
  // Remove any already-added image from pool to avoid duplicates
  const used = new Set(images)
  const available = pool.filter((u) => !used.has(u))
  for (let i = 0; i < 3 && available.length > 0; i++) {
    const idx = (seed + i * 3) % available.length
    images.push(available.splice(idx, 1)[0])
  }

  return images
})

const potentialEpc = computed(() => {
  // Use real potential rating from EPC API if available
  if (enrichment.value?.epcPotentialRating)
    return enrichment.value.epcPotentialRating
  // Fallback: one band better than current (rough estimate before enrichment loads)
  const bands = ['G', 'F', 'E', 'D', 'C', 'B', 'A']
  const idx = bands.indexOf(
    prop.value?.epcRating ?? property.value?.epcRating ?? 'D',
  )
  return bands[Math.min(idx + 1, bands.length - 1)]
})

const actionBarItems = computed(() => {
  const hasPassport = passportStatus.value?.hasPassport
  return [
    {
      icon: 'accessPassport',
      label: hasPassport ? 'Access Passport' : 'Claim Passport',
    },
    {
      icon: 'saveProperty',
      label: saved.value ? 'Saved Property' : 'Save Property',
    },
    { icon: 'registerInterest', label: 'Register Interest' },
    { icon: 'tapOwner', label: 'Tap Owner' },
  ]
})

const epcBands = [
  { label: 'A', range: '92+', color: '#00a758', width: '95%' },
  { label: 'B', range: '81-91', color: '#4db848', width: '85%' },
  { label: 'C', range: '69-80', color: '#b8c832', width: '75%' },
  { label: 'D', range: '55-68', color: '#ffd732', width: '65%' },
  { label: 'E', range: '39-54', color: '#ffa632', width: '55%' },
  { label: 'F', range: '21-38', color: '#ff7832', width: '45%' },
  { label: 'G', range: '1-20', color: '#ff3232', width: '35%' },
]

// OS Raster Maps via Mapbox GL (falls back to OSM iframe)
const initMap = async () => {
  if (!mapEl.value || !property.value) return
  const lat = property.value.latitude
  const lng = property.value.longitude
  if (!lat || !lng) return

  const token = config.public.mapboxToken as string
  const osKey = config.public.osApiKey as string

  if (!token && !osKey) {
    // OSM iframe fallback
    const bbox = `${lng - 0.005},${lat - 0.003},${lng + 0.005},${lat + 0.003}`
    mapEl.value.innerHTML = `<iframe
      width="100%" height="100%" style="border:0;border-radius:16px;"
      loading="lazy"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}"
    ></iframe>`
    return
  }

  const mapboxgl = (await import('mapbox-gl')).default
  if (!document.querySelector('link[href*="mapbox-gl"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css'
    document.head.appendChild(link)
  }

  mapboxgl.accessToken = token || ''

  // Use OS Raster tiles (Light_3857 = clean minimal UK map)
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

  const map = new mapboxgl.Map({
    container: mapEl.value,
    style: mapStyle,
    center: [lng, lat],
    zoom: 15,
    interactive: true,
  })

  mapInstance = map

  // Property marker (teal house pin)
  const el = document.createElement('div')
  el.style.cssText =
    'width:42px;height:42px;border-radius:50%;background:#00a19a;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,161,154,0.6);border:3px solid white;cursor:pointer;'
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" stroke-width="2" fill="rgba(255,255,255,0.25)"/><path d="M9 22V12h6v10" stroke="white" stroke-width="2"/></svg>`
  new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)

  // Add INSPIRE title boundary (registered land parcel) once enrichment loads
  const addTitleBoundary = (loadedMap: any) => {
    const boundary = enrichment.value?.titleBoundary
    if (!boundary?.geometry) return
    try {
      if (loadedMap.getSource('title-boundary')) return // already added
      loadedMap.addSource('title-boundary', {
        type: 'geojson',
        data: boundary.geoJson,
      })
      loadedMap.addLayer({
        id: 'title-boundary-fill',
        type: 'fill',
        source: 'title-boundary',
        paint: { 'fill-color': '#00a19a', 'fill-opacity': 0.12 },
      })
      loadedMap.addLayer({
        id: 'title-boundary-line',
        type: 'line',
        source: 'title-boundary',
        paint: {
          'line-color': '#00a19a',
          'line-width': 2,
          'line-dasharray': [3, 2],
        },
      })
    } catch {
      /* non-critical */
    }
  }

  // Add nearby POI markers once enrichment loads
  const addPoiMarkers = () => {
    if (!enrichment.value?.nearby) return
    const nearby = enrichment.value.nearby

    function makeMarker(color: string, emoji: string) {
      const d = document.createElement('div')
      d.style.cssText = `width:30px;height:30px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.3);font-size:13px;`
      d.textContent = emoji
      return d
    }

    // Schools
    for (const s of nearby.schools ?? []) {
      if (!s.lat || !s.lon) continue
      new mapboxgl.Marker({ element: makeMarker('#3b82f6', '🎓') })
        .setLngLat([s.lon, s.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setText(
            `${s.name} · ${s.distanceKm}km`,
          ),
        )
        .addTo(map)
    }
    // Train stations
    for (const t of nearby.trains ?? []) {
      if (!t.lat || !t.lon) continue
      new mapboxgl.Marker({ element: makeMarker('#8b5cf6', '🚆') })
        .setLngLat([t.lon, t.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setText(
            `${t.name} · ${t.distanceKm}km`,
          ),
        )
        .addTo(map)
    }
    // Bus stops
    for (const b of nearby.busStops ?? []) {
      if (!b.lat || !b.lon) continue
      new mapboxgl.Marker({ element: makeMarker('#f59e0b', '🚌') })
        .setLngLat([b.lon, b.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setText(
            `${b.name} · ${b.distanceKm}km`,
          ),
        )
        .addTo(map)
    }
    // Parks
    for (const p of nearby.parks ?? []) {
      if (!p.lat || !p.lon) continue
      new mapboxgl.Marker({ element: makeMarker('#10b981', '🌳') })
        .setLngLat([p.lon, p.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setText(
            `${p.name} · ${p.distanceKm}km`,
          ),
        )
        .addTo(map)
    }
    // Airports
    for (const a of nearby.airports ?? []) {
      if (!a.lat || !a.lon) continue
      new mapboxgl.Marker({ element: makeMarker('#ec4899', '✈️') })
        .setLngLat([a.lon, a.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setText(
            `${a.name} · ${a.distanceKm}km`,
          ),
        )
        .addTo(map)
    }
  }

  const applyEnrichmentToMap = () => {
    addPoiMarkers()
    if (map.loaded()) addTitleBoundary(map)
    else map.on('load', () => addTitleBoundary(map))
  }

  // If enrichment already loaded, apply immediately; otherwise watch
  if (enrichment.value?.nearby || enrichment.value?.titleBoundary) {
    map.on('load', applyEnrichmentToMap)
  } else {
    const stop = watch(enrichment, (v) => {
      if (v) {
        if (map.loaded()) applyEnrichmentToMap()
        else map.on('load', applyEnrichmentToMap)
        stop()
      }
    })
  }
}

const initFloodMap = async () => {
  const zones = enrichment.value?.floodZones ?? []
  const hasPolygons = zones.some((z: any) => z.polygon)

  // Wait for enrichment if not yet loaded
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

  const mapboxgl = (await import('mapbox-gl')).default
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

  // Property pin
  const pin = document.createElement('div')
  pin.style.cssText =
    'width:14px;height:14px;border-radius:50%;background:#00a19a;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);'
  new mapboxgl.Marker({ element: pin }).setLngLat([lng, lat]).addTo(fmap)

  // Zone colours: high risk = red, medium = orange, low = yellow, default = blue
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
      // No polygon data — show a soft radius circle to indicate general area
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
    // Init map immediately since location section is open by default
    if (!mapInitialised) {
      mapInitialised = true
      initMap()
    }
  }

  // Fetch enrichment data in background (non-blocking)
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${apiBase}/property/${propertyId}/enrichment`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) enrichment.value = await res.json()
  } catch {
    /* non-critical */
  }

  // Load HomeScore — try backend first (if logged in), then fall back to localStorage
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const hsRes = await fetch(`${apiBase}/property/${propertyId}/homescore`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (hsRes.ok) {
        const hs = await hsRes.json()
        if (hs?.total) homeScore.value = hs
      }
    }
    if (!homeScore.value) {
      const saved = localStorage.getItem(`homescore_answers_${propertyId}`)
      if (saved) {
        const { answers } = JSON.parse(saved)
        if (answers && Object.keys(answers).length === 11) {
          const { calculateScore } = await import('~/utils/homescoreScoring')
          const base = calculateScore(answers)
          homeScore.value = {
            ...base.breakdown,
            total: base.total,
            rating: base.rating,
          }
        }
      }
    }
  } catch {
    /* non-critical */
  }

  // Always auto-generate from public EPC data if still no score — runs regardless of above errors
  if (!homeScore.value) {
    try {
      const { getPrefillFromProperty, getUnsureDefaults, calculateScore } =
        await import('~/utils/homescoreScoring')
      const unsure = getUnsureDefaults()
      const epcPrefill = property.value
        ? getPrefillFromProperty(property.value)
        : {}
      const merged = { ...unsure, ...epcPrefill }
      const base = calculateScore(merged)
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

function handleAction(label: string) {
  if (label === 'Claim Passport') {
    // Owner verification flow
    router.push(`/verify-ownership/${propertyId}`)
  } else if (label === 'Access Passport') {
    const status = passportStatus.value
    if (status?.isOwner || status?.isCollaborator) {
      // Owner / collaborator → full passport edit view
      router.push(`/passportview/${status.passportId}`)
    } else if (status?.isBuyer && status?.passportId) {
      // Already unlocked buyer → buyer read-only view
      router.push(`/buyer-passport/${status.passportId}`)
    } else {
      // Non-owner, not yet unlocked → show unlock drawer
      showClaimDrawer.value = true
    }
  } else if (label === 'Save Property' || label === 'Saved Property') {
    handleSaveProperty()
  } else if (label === 'Register Interest') {
    showRegisterInterest.value = true
  } else if (label === 'Tap Owner') {
    router.push(`/owner/${propertyId}`)
  }
}

function goBack() {
  router.back()
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

async function handleSaveProperty() {
  const result = await toggleSave(propertyId)
  let message = ''
  if (result === 'unauthenticated') message = 'Please log in to save properties'
  else if (result === 'error')
    message = 'Something went wrong, please try again'
  else
    message = result.saved
      ? 'Property saved to your collections'
      : 'Removed from saved properties'
  showToast({ message, icon: propertyImages.value[0], duration: 2000 })
}

function onInterestRegistered() {
  showRegisterInterest.value = false
  showToast({ message: 'Interest registered!', duration: 2000 })
}

function handleShare() {
  console.log('Share triggered')
}

// Pass existing passportId to drawer when property already has a passport but user can't access it
const buyerModePassportId = computed(() => {
  const status = passportStatus.value
  if (status?.hasPassport && !status?.canAccess && status?.passportId) {
    return status.passportId
  }
  return undefined
})

const planningCategories = [
  {
    id: 'heritage',
    label: 'Heritage',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
  },
  {
    id: 'environment',
    label: 'Environment',
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.1)',
  },
  {
    id: 'development',
    label: 'Development',
    color: '#ea580c',
    bg: 'rgba(234,88,12,0.1)',
  },
]

function planningByCategory(category: string) {
  return (enrichment.value?.planningHistory?.constraints ?? []).filter(
    (c: any) => c.category === category,
  )
}

// ── Coverage helpers ────────────────────────────────────────────────────────
const mobileOperators = [
  { key: 'EE', label: 'EE' },
  { key: 'O2', label: 'O2' },
  { key: 'Three', label: 'Three' },
  { key: 'Vodafone', label: 'Vodafone' },
]

function signalClass(val: any) {
  if (val === null || val === undefined) return 'prop-mobile-dot--none'
  const n = typeof val === 'boolean' ? (val ? 4 : 0) : Number(val)
  if (n >= 3) return 'prop-mobile-dot--good'
  if (n >= 1) return 'prop-mobile-dot--limited'
  return 'prop-mobile-dot--none'
}

// ── SDLT calculator ─────────────────────────────────────────────────────────

// Pre-fill from property estimated price once loaded
watch(
  () => property.value?.estimatedPrice,
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

const sdltBreakdown = computed((): { bands: SdltBand[]; total: number } => {
  const price = sdltPriceInput.value
  const type = sdltBuyerType.value

  // England & Northern Ireland SDLT rates (from Oct 2024)
  let rawBands: { from: number; to: number; rate: number }[]

  if (type === 'firsttime') {
    if (price > 625000) {
      // Above £625k: standard rates apply (no FTB relief)
      rawBands = standardBands()
    } else {
      rawBands = [
        { from: 0, to: 425000, rate: 0 },
        { from: 425000, to: 625000, rate: 5 },
      ]
    }
  } else if (type === 'additional') {
    // Standard + 5% surcharge on every band
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

function standardBands() {
  return [
    { from: 0, to: 250000, rate: 0 },
    { from: 250000, to: 925000, rate: 5 },
    { from: 925000, to: 1500000, rate: 10 },
    { from: 1500000, to: Infinity, rate: 12 },
  ]
}

function planningDecisionClass(decision: string) {
  const d = (decision ?? '').toLowerCase()
  if (d.includes('grant') || d.includes('approv') || d.includes('permit'))
    return 'prop-planning-decision--approved'
  if (d.includes('refus') || d.includes('reject'))
    return 'prop-planning-decision--refused'
  return 'prop-planning-decision--pending'
}

function formatSaleDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function handleClaimed(passportId: string) {
  // If buyer mode (unlocking existing passport) → buyer passport view
  // If owner mode (creating new passport) → owner passport view
  if (buyerModePassportId.value) {
    router.push(`/buyer-passport/${passportId}`)
  } else {
    router.push(`/passportview/${passportId}`)
  }
}
</script>

<style scoped>
.prop-page {
  min-height: 100vh;
  /* background: #f2f6f6; */
  padding-bottom: 90px;
}

/* ── Loading ─────────────────────────────────────────────────────────────── */
.prop-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: #666;
  font-size: 15px;
}

.prop-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-back {
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 10px 24px;
  font-size: 14px;
  cursor: pointer;
}

/* ── Hero ────────────────────────────────────────────────────────────────── */
.prop-hero {
  position: relative;
  width: 100%;
  height: 280px;
}

.hero-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  z-index: 2;
}

.hero-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: background 0.2s;
}
.hero-btn--wishlisted {
  background: rgba(231, 76, 60, 0.75);
}

/* ── Card ────────────────────────────────────────────────────────────────── */
.prop-card {
  background: white;
  position: relative;
  padding: 24px 16px 0;
  border-radius: 20px 20px 0 0;
  margin-top: -10px;
  z-index: 1;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
}

/* ── Title ───────────────────────────────────────────────────────────────── */
.prop-title-block {
  margin-bottom: 14px;
}

.prop-address {
  color: #000000;
  font-weight: 590;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  vertical-align: middle;
}

.prop-city {
  color: #3c3c4399;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  vertical-align: middle;
}

.prop-price {
  color: #00a19a;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  vertical-align: middle;
}

.prop-estimated {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin-left: 6px;
}

/* ── Badges ──────────────────────────────────────────────────────────────── */
.prop-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.prop-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #00a19a;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
}

/* ── Section ─────────────────────────────────────────────────────────────── */
.prop-section {
  margin-bottom: 28px;
}

.prop-section-title {
  font-size: 17px;
  font-weight: 400;
  color: #000000;
  margin: 0 0 14px;
  line-height: 22px;
  letter-spacing: -0.43px;
  vertical-align: middle;
}

/* ── Score tabs ──────────────────────────────────────────────────────────── */
.score-tabs {
  display: flex;
  gap: 8px;
  background-color: #7878801f;
  border-radius: 100px;
  padding: 2px;
}

.score-tab {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  color: #000;
  transition: all 0.2s;
}

.score-tab.active {
  background: white;
  border: 0.5px solid #0000000a;
  box-shadow: 0px 3px 8px 0px #0000001f;
}

/* ── Score gauge ─────────────────────────────────────────────────────────── */
.prop-score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
  position: relative;
}

.prop-gauge-svg {
  display: block;
}

.prop-score-ticks {
  position: relative;
  width: 180px;
  margin-top: -16px;
}

.prop-tick-label {
  position: absolute;
  font-size: 11px;
  color: #aaa;
}

.prop-score-avg-pill {
  background: white;
  border-radius: 100px;
  padding: 8px 18px;
  font-size: 12px;
  color: #00a19a;
  font-weight: 500;
  text-align: center;
  margin: 10px 0 8px;
  border: 1px solid #e8f7f6;
}

.prop-score-auto-pill {
  background: #f5f5f8;
  border-radius: 100px;
  padding: 6px 14px;
  font-size: 11px;
  color: #8e8e93;
  font-weight: 500;
  text-align: center;
  margin: 10px 0 8px;
  border: 1px solid #e8e8ee;
}

.prop-score-note {
  font-size: 11px;
  color: #aaa;
  text-align: center;
  line-height: 1.4;
  max-width: 280px;
}

.prop-score-cta {
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

/* ── Details card ────────────────────────────────────────────────────────── */
.prop-details-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 8px 16px;
}

.prop-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.prop-detail-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.prop-detail-icon-wrap {
  width: 36px;
  height: 36px;
  /* border-radius: 10px; */
  /* background: rgba(0, 161, 154, 0.1); */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prop-detail-label {
  font-weight: 400;
  font-style: Regular;
  font-size: 11px;
  line-height: 13px;
  letter-spacing: 0.06px;
  color: #3c3c4399;
}

.prop-detail-value {
  color: #00a19a;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;
  letter-spacing: -0.23px;
}
.prop-detail-mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  letter-spacing: 0;
}

/* Quick action strip */
.prop-quick-actions {
  display: flex;
  gap: 8px;
  padding: 16px 0 4px;
  border-top: 1px solid #eeeeee;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.prop-quick-actions::-webkit-scrollbar {
  display: none;
}

.prop-quick-btn {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 12px 8px;
  border-radius: 14px;
  background: #f7f7f9;
  border: 1.5px solid #eeeeee;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  min-width: 64px;
}
.prop-quick-btn.active {
  background: #e8f8f7;
  border-color: #00a19a;
}
.prop-quick-label {
  font-size: 10px;
  font-weight: 500;
  color: #636366;
  white-space: nowrap;
  line-height: 1;
}
.prop-quick-btn.active .prop-quick-label {
  color: #00a19a;
}

/* ── Floor plan ──────────────────────────────────────────────────────────── */
.prop-floor-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
  padding: 12px 16px;
}

.prop-floor-img {
  width: 100%;
  /* height: 220px; */
  object-fit: cover;
  display: block;
}

.prop-floor-expand {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* ── Map ─────────────────────────────────────────────────────────────────── */
.prop-map-label {
  font-size: 12px;
  font-weight: 600;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 6px;
}
.prop-map-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}
.prop-map {
  height: 220px;
  width: 100%;
}
.prop-sv-wrap {
  display: block;
  position: relative;
  cursor: pointer;
  text-decoration: none;
}
.prop-sv-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  border-radius: 16px;
}
.prop-sv-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.55);
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 7px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(4px);
}
.prop-sv-unavailable {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8fa;
  border-radius: 16px;
  color: #aaa;
  font-size: 13px;
}

/* ── Nearby tabs ─────────────────────────────────────────────────────────── */
.prop-nearby-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 14px;
  width: 100%;
  padding: 2px 4px;
  border: 0.33px solid #3c3c432e;
  border-radius: 100px;
}

.prop-nearby-tabs > :first-child {
  border-radius: 24px 4px 4px 24px;
}

.prop-nearby-tabs > :last-child {
  border-radius: 4px 24px 24px 4px;
}

.prop-nearby-full {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  flex: 1;
  border: none;
  background: #e8f7f6;
  color: #00a19a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.prop-nearby-full.active {
  background: #00a19a;
  color: white;
}

.prop-nearby-icon {
  width: 48px;
  height: 36px;
  /* border: 1.5px solid #e0e0e0; */
  background: #00a19a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: -1.5px;
  border-radius: 4px;
}

.prop-nearby-icon.active {
  background: #00a19a;
  border-color: #00a19a;
}

/* ── Station list ────────────────────────────────────────────────────────── */
.prop-station-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 16px;
  background: white;
  padding: 12px 16px;
}

.prop-station-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  /* border-bottom: 1px solid #f0f0f5; */
}

.prop-station-row:last-child {
  border-bottom: none;
}

.prop-station-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 161, 154, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.prop-station-name {
  font-size: 14px;
  font-weight: 500;
  color: #00a19a;
  margin: 0 0 3px;
}

.prop-station-dist {
  font-size: 11px;
  color: #00a19a;
  margin: 0;
  width: fit-content;
  background: #00a19a1a;
  border-radius: 4px;
}

.prop-nearby-empty {
  font-size: 13px;
  color: #aeaeb2;
  text-align: center;
  padding: 20px 0;
}

.prop-nearby-source {
  font-size: 10px;
  color: #b0b0b8;
  margin: -6px 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.prop-school-cat-badge {
  font-size: 10px;
  font-weight: 600;
  color: #3b82f6;
  background: #eff6ff;
  border-radius: 4px;
  padding: 1px 6px;
  white-space: nowrap;
}

.prop-dist-pill {
  font-size: 11px;
  font-weight: 600;
  color: #00a19a;
  background: #00a19a1a;
  border-radius: 10px;
  padding: 2px 8px;
  white-space: nowrap;
  flex-shrink: 0;

  &--airport {
    color: #ec4899;
    background: #fdf2f8;
  }
}

.prop-station-op {
  color: #b0b0b8;
}

.prop-map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 10px;
  padding: 8px 0 4px;
}

.prop-map-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #555;
}

.prop-map-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: inline-block;
  flex-shrink: 0;
}

.prop-footprint-row {
  margin-top: 10px;
  font-size: 12px;
  color: #555;
  background: rgba(0, 161, 154, 0.06);
  border-radius: 8px;
  padding: 7px 10px;
}

.prop-footprint-src {
  color: #b0b0b8;
  font-size: 11px;
}

/* ── EPC ─────────────────────────────────────────────────────────────────── */
.prop-epc-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 14px;
}

.prop-epc-header {
  display: grid;
  grid-template-columns: 52px 1fr 40px 40px;
  gap: 4px;
  font-size: 10px;
  color: #8e8e93;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
}

.prop-epc-row {
  display: grid;
  grid-template-columns: 52px 1fr 40px 40px;
  gap: 4px;
  margin-bottom: 4px;
  align-items: center;
}

.prop-epc-range {
  font-size: 11px;
  color: #8e8e93;
}

.prop-epc-bar-wrap {
  display: flex;
  align-items: center;
}

.prop-epc-bar {
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  min-width: 32px;
}

.prop-epc-dot-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.prop-epc-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e0e0e0;
}

.prop-epc-dot.current {
  background: #00a19a;
}
.prop-epc-dot.potential {
  background: #4db848;
}

.epc-current .prop-epc-range {
  font-weight: 700;
  color: #1a1a1a;
}

.prop-bottom-pad {
  height: 20px;
}

/* ── Detail sub-label (m² under sqft) ───────────────────────────────────── */
.prop-detail-sub {
  font-size: 11px;
  color: #8e8e93;
  margin-top: 1px;
}

/* ── EPC cert link ───────────────────────────────────────────────────────── */
.prop-section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.prop-section-title-row .prop-section-title {
  margin-bottom: 0;
}
.prop-epc-cert-link {
  font-size: 12px;
  color: #00a19a;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid #00a19a;
  border-radius: 20px;
  padding: 4px 12px;
}

/* ── Sales History ───────────────────────────────────────────────────────── */
.prop-section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.prop-section-header-row .prop-section-title {
  margin-bottom: 0;
}
.prop-sales-badge {
  font-size: 11px;
  font-weight: 600;
  color: #00a19a;
  background: #e8f8f7;
  border-radius: 20px;
  padding: 3px 10px;
}
.prop-sales-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  padding-left: 20px;
}
.prop-sales-timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: #e5e5ea;
}
.prop-sale-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  padding: 12px 0 12px 4px;
  border-bottom: 1px solid #f0f0f0;
}
.prop-sale-card:last-child {
  border-bottom: none;
}
.prop-sale-card-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #c7c7cc;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #e5e5ea;
  flex-shrink: 0;
  margin-top: 3px;
  position: relative;
  z-index: 1;
  margin-left: -22px;
}
.prop-sale-card-dot--primary {
  background: #00a19a;
  box-shadow: 0 0 0 2px #b2e5e3;
}
.prop-sale-card-body {
  flex: 1;
  min-width: 0;
}
.prop-sale-card-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
}
.prop-sale-card-price {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}
.prop-sale-card-date {
  font-size: 12px;
  color: #8e8e93;
  font-weight: 500;
  white-space: nowrap;
}
.prop-sale-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.prop-sale-tag {
  font-size: 11px;
  color: #636366;
  background: #f2f2f7;
  border-radius: 6px;
  padding: 2px 7px;
}
.prop-sale-tag--new {
  color: #34c759;
  background: #edfaf1;
}
.prop-sale-tag--addr {
  color: #8e8e93;
}
.prop-sales-source {
  font-size: 11px;
  color: #aeaeb2;
  margin-top: 10px;
  text-align: right;
}
.prop-sales-empty {
  text-align: center;
  padding: 24px 0 8px;
  color: #636366;
  font-size: 14px;
}
.prop-sales-empty-sub {
  font-size: 11px;
  color: #aeaeb2;
  margin-top: 4px;
}
.prop-sales-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #00a19a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  min-width: 18px;
  height: 16px;
  padding: 0 4px;
  margin-left: 4px;
  line-height: 1;
}
.prop-cov-tab.active .prop-sales-tab-count {
  background: #fff;
  color: #00a19a;
}
.prop-sale-card-addr {
  font-size: 12px;
  color: #636366;
  margin: 2px 0 4px;
}
.prop-sales-nearby-note {
  font-size: 11px;
  color: #aeaeb2;
  margin-top: 10px;
}

/* ── Coverage tabs ───────────────────────────────────────────────────────── */
.prop-cov-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}
.prop-cov-tab {
  flex: 1;
  padding: 8px 4px;
  border-radius: 10px;
  border: 1.5px solid #e0e0e0;
  background: white;
  font-size: 12px;
  font-weight: 500;
  color: #8e8e93;
  cursor: pointer;
  transition: all 0.15s;
}
.prop-cov-tab.active {
  border-color: #00a19a;
  color: #00a19a;
  background: rgba(0, 161, 154, 0.06);
}
.prop-cov-source {
  font-size: 10px;
  color: #b0b0b8;
  margin-top: 10px;
  text-align: right;
}
.prop-cov-unavailable {
  background: #f8f8fa;
  border-radius: 14px;
  padding: 20px 16px;
  font-size: 13px;
  color: #8e8e93;
  text-align: center;
}
.prop-cov-link {
  color: #00a19a;
  font-weight: 500;
  text-decoration: none;
  font-size: 12px;
}

/* ── Mobile signal ───────────────────────────────────────────────────────── */
.prop-mobile-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 14px 16px;
}
.prop-mobile-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eeeeee;
}
.prop-mobile-row:last-of-type {
  border-bottom: none;
}
.prop-mobile-op {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  width: 80px;
}
.prop-mobile-signals {
  display: flex;
  gap: 20px;
}
.prop-mobile-signal-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.prop-mobile-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}
.prop-mobile-dot--good {
  background: #16a34a;
}
.prop-mobile-dot--limited {
  background: #f59e0b;
}
.prop-mobile-dot--none {
  background: #d1d1d6;
}
.prop-mobile-sig-label {
  font-size: 10px;
  color: #8e8e93;
}
.prop-mobile-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #8e8e93;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #eeeeee;
}

/* ── TV / Cable ──────────────────────────────────────────────────────────── */
.prop-tv-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 14px 16px;
}
.prop-tv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eeeeee;
}
.prop-tv-row:last-of-type {
  border-bottom: none;
}
.prop-tv-label {
  font-size: 13px;
  color: #1a1a1a;
}
.prop-tv-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}
.prop-tv-badge--yes {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}
.prop-tv-badge--check {
  background: rgba(234, 88, 12, 0.1);
  color: #ea580c;
}

/* ── Stamp Duty Calculator ───────────────────────────────────────────────── */
.prop-sdlt-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 16px;
}
.prop-sdlt-input-row {
  display: flex;
  align-items: center;
  background: white;
  border: 1.5px solid #e0e0e0;
  border-radius: 12px;
  padding: 0 14px;
  margin-bottom: 14px;
  transition: border-color 0.15s;
}
.prop-sdlt-input-row:focus-within {
  border-color: #00a19a;
}
.prop-sdlt-currency {
  font-size: 18px;
  font-weight: 600;
  color: #00a19a;
  margin-right: 6px;
  flex-shrink: 0;
}
.prop-sdlt-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  padding: 13px 0;
  background: transparent;
  min-width: 0;
}
.prop-sdlt-input::placeholder {
  color: #c7c7cc;
  font-weight: 400;
  font-size: 15px;
}
.prop-sdlt-options {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.prop-sdlt-opt {
  flex: 1;
  min-width: 80px;
  padding: 7px 6px;
  border-radius: 10px;
  border: 1.5px solid #e0e0e0;
  background: white;
  font-size: 11px;
  font-weight: 500;
  color: #8e8e93;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.prop-sdlt-opt.active {
  border-color: #00a19a;
  color: #00a19a;
  background: rgba(0, 161, 154, 0.06);
}
.prop-sdlt-breakdown {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}
.prop-sdlt-band-row {
  display: grid;
  grid-template-columns: 1fr 40px 80px;
  align-items: center;
  padding: 9px 12px;
  border-bottom: 1px solid #f0f0f5;
  font-size: 12px;
  gap: 4px;
}
.prop-sdlt-band-row:last-child {
  border-bottom: none;
}
.prop-sdlt-band-range {
  color: #555;
}
.prop-sdlt-band-rate {
  color: #8e8e93;
  text-align: center;
}
.prop-sdlt-band-tax {
  color: #1a1a1a;
  font-weight: 600;
  text-align: right;
}
.prop-sdlt-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 4px;
  border-top: 2px solid #e8f7f6;
  margin-top: 4px;
}
.prop-sdlt-total-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}
.prop-sdlt-total-val {
  font-size: 20px;
  font-weight: 800;
  color: #00a19a;
}
.prop-sdlt-note {
  font-size: 11px;
  color: #b0b0b8;
  margin-top: 10px;
  line-height: 1.5;
}

/* ── Broadband ───────────────────────────────────────────────────────────── */
.prop-broadband-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 16px;
}
.prop-bb-speeds {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}
.prop-bb-speed-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.prop-bb-speed-val {
  font-size: 28px;
  font-weight: 700;
  color: #00a19a;
  line-height: 1;
}
.prop-bb-speed-unit {
  font-size: 11px;
  color: #00a19a;
  font-weight: 500;
}
.prop-bb-speed-label {
  font-size: 11px;
  color: #8e8e93;
  margin-top: 2px;
}
.prop-bb-divider {
  width: 1px;
  height: 40px;
  background: #e0e0e0;
}
.prop-bb-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.prop-bb-type {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: #e8e8ed;
  color: #8e8e93;
}
.prop-bb-type--on {
  background: rgba(0, 161, 154, 0.1);
  color: #00a19a;
}

/* ── Flood Risk ──────────────────────────────────────────────────────────── */
.prop-flood-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 16px;
}
.prop-flood-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.prop-flood-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}
.prop-flood-badge--very-low,
.prop-flood-badge--low {
  background: #d4edda;
  color: #155724;
}
.prop-flood-badge--medium {
  background: #fff3cd;
  color: #856404;
}
.prop-flood-badge--high {
  background: #f8d7da;
  color: #721c24;
}
.prop-flood-badge--severe {
  background: #c82333;
  color: white;
}
.prop-flood-desc {
  font-size: 12px;
  color: #8e8e93;
  line-height: 1.4;
}
.prop-flood-zones {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #eeeeee;
  padding-top: 12px;
}
.prop-flood-zone-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.prop-flood-zone-name {
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
}
.prop-flood-zone-sev {
  font-size: 11px;
  color: #8e8e93;
  margin-top: 2px;
}
.prop-flood-map-wrap {
  margin-top: 16px;
}
.prop-flood-map {
  width: 100%;
  height: 240px;
  border-radius: 14px;
  overflow: hidden;
  background: #e8f4f8;
}
.prop-flood-map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.prop-flood-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #555;
}
.prop-flood-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.prop-flood-map-src {
  font-size: 10px;
  color: #aaa;
  margin-top: 6px;
}

/* ── Listed Buildings ────────────────────────────────────────────────────── */
.prop-listed-list {
  background: #f8f8fa;
  border-radius: 16px;
  overflow: hidden;
}
.prop-listed-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #eeeeee;
}
.prop-listed-row:last-child {
  border-bottom: none;
}
.prop-listed-grade {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(0, 161, 154, 0.1);
  color: #00a19a;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.prop-listed-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}
.prop-listed-loc {
  font-size: 11px;
  color: #8e8e93;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prop-listed-link {
  font-size: 12px;
  color: #00a19a;
  font-weight: 500;
  text-decoration: none;
  flex-shrink: 0;
  align-self: center;
}

/* ── Council Tax ─────────────────────────────────────────────────────────── */
.prop-ct-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 16px;
}
.prop-ct-main {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}
.prop-ct-band {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #00a19a, #007a74);
  color: white;
  font-size: 28px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.prop-ct-label {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}
.prop-ct-amount {
  font-size: 13px;
  color: #00a19a;
  margin-top: 2px;
  font-weight: 500;
}
.prop-ct-council {
  font-size: 11px;
  color: #8e8e93;
  margin-top: 3px;
}
.prop-ct-unknown {
  margin-bottom: 14px;
}
.prop-ct-explainer {
  font-size: 12px;
  color: #8e8e93;
  line-height: 1.5;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eeeeee;
}
.prop-ct-unknown-label {
  font-size: 13px;
  color: #8e8e93;
}
.prop-ct-approx-note {
  font-size: 10px;
  color: #b0b0b8;
  margin-top: 4px;
  line-height: 1.4;
}
.prop-ct-link {
  font-size: 12px;
  color: #00a19a;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid #00a19a;
  border-radius: 20px;
  padding: 6px 16px;
  display: inline-block;
}

/* ── Council Tax bands reference ─────────────────────────────────────────── */
.prop-ct-bands-table {
  background: #f8f8fa;
  border-radius: 16px;
  overflow: hidden;
}
.prop-ct-bands-row {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid #eeeeee;
}
.prop-ct-bands-row:last-of-type {
  border-bottom: none;
}
.prop-ct-bands-row--active {
  background: rgba(0, 161, 154, 0.06);
}
.prop-ct-bands-letter {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #e8e8ed;
  color: #8e8e93;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.prop-ct-bands-letter.active {
  background: linear-gradient(135deg, #00a19a, #007a74);
  color: white;
}
.prop-ct-bands-range {
  font-size: 12px;
  color: #3c3c43;
}
.prop-ct-bands-est {
  font-size: 12px;
  font-weight: 600;
  color: #00a19a;
  white-space: nowrap;
}

/* ── Council Tax nearby ──────────────────────────────────────────────────── */
.prop-ct-nearby-list {
  background: #f8f8fa;
  border-radius: 16px;
  overflow: hidden;
}
.prop-ct-nearby-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 14px;
  border-bottom: 1px solid #eeeeee;
}
.prop-ct-nearby-row:last-child {
  border-bottom: none;
}
.prop-ct-nearby-addr {
  font-size: 12px;
  color: #1a1a1a;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.prop-ct-nearby-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  gap: 2px;
}
.prop-ct-nearby-band {
  font-size: 12px;
  font-weight: 700;
  color: #00a19a;
}
.prop-ct-nearby-est {
  font-size: 10px;
  color: #8e8e93;
}

/* ── Planning ────────────────────────────────────────────────────────────── */
.prop-planning-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 16px;
}
.prop-planning-label {
  font-size: 12px;
  font-weight: 600;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}
.prop-planning-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 4px;
}
.prop-planning-row {
  background: white;
  border-radius: 10px;
  padding: 10px 12px;
}
.prop-planning-type-badge {
  display: inline-block;
  background: rgba(0, 161, 154, 0.1);
  color: #00a19a;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 3px 8px;
  border-radius: 20px;
  margin-bottom: 4px;
}
.prop-planning-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a1a;
}
.prop-planning-ref {
  font-size: 11px;
  color: #8e8e93;
  margin-top: 2px;
}
.prop-planning-none {
  font-size: 13px;
  color: #8e8e93;
  margin-bottom: 4px;
}

/* Category grouping */
.prop-planning-category {
  margin-bottom: 10px;
}
.prop-planning-cat-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #3c3c43;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.prop-planning-cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Planning applications */
.prop-planning-apps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.prop-planning-app-row {
  background: white;
  border-radius: 10px;
  padding: 10px 12px;
}
.prop-planning-app-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.prop-planning-app-desc {
  font-size: 12px;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.prop-planning-app-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.prop-planning-app-type {
  font-size: 10px;
  color: #8e8e93;
  background: #f0f0f5;
  padding: 2px 8px;
  border-radius: 10px;
}
.prop-planning-app-date {
  font-size: 10px;
  color: #8e8e93;
}
.prop-planning-app-link {
  font-size: 11px;
  color: #00a19a;
  text-decoration: none;
  font-weight: 500;
}
.prop-planning-decision {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
  flex-shrink: 0;
  text-transform: capitalize;
}
.prop-planning-decision--approved {
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
}
.prop-planning-decision--refused {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}
.prop-planning-decision--pending {
  background: rgba(234, 88, 12, 0.1);
  color: #ea580c;
}
</style>
