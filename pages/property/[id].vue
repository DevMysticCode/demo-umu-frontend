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
            <button class="hero-btn" :class="{ 'hero-btn--wishlisted': wishlisted }" @click="handleWishlist">
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
          <span v-if="property.bedrooms" class="prop-badge">
            <OPIcon name="bedroomWhite" class="w-[13px] h-[13px]" />
            {{ property.bedrooms }}
          </span>
          <span v-if="property.bathrooms" class="prop-badge">
            <OPIcon name="bathroomWhite" class="w-[13px] h-[13px]" />
            {{ property.bathrooms }}
          </span>
          <span v-if="property.propertyType" class="prop-badge">{{
            property.propertyType
          }}</span>
          <span v-if="property.sqft" class="prop-badge">
            <OPIcon name="sqftWhite" class="w-[13px] h-[13px]" />
            {{ property.sqft.toLocaleString() }} sqft
          </span>
        </div>

        <!-- Score toggle -->
        <div class="prop-section">
          <div class="score-tabs">
            <button
              :class="['score-tab', { active: scoreTab === 'home' }]"
              @click="scoreTab = 'home'"
            >
              Home Score
            </button>
            <button
              :class="['score-tab', { active: scoreTab === 'move' }]"
              @click="scoreTab = 'move'"
            >
              Move Ready Score
            </button>
          </div>
        </div>

        <!-- Score gauge -->
        <div class="prop-score-block">
          <svg
            viewBox="0 0 200 200"
            width="180"
            height="180"
            class="prop-gauge-svg"
          >
            <!-- Track -->
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#d6f5f3"
              stroke-width="16"
              stroke-dasharray="502.65"
              stroke-dashoffset="125.66"
              stroke-linecap="round"
              transform="rotate(135 100 100)"
            />
            <!-- Progress (74%) -->
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#00a19a"
              stroke-width="16"
              :stroke-dasharray="`${502.65 * 0.74 * 0.75} ${502.65}`"
              stroke-linecap="round"
              transform="rotate(135 100 100)"
            />
            <!-- Score text -->
            <text
              x="100"
              y="94"
              text-anchor="middle"
              font-size="42"
              font-weight="700"
              fill="#00a19a"
              font-family="sans-serif"
            >
              74
            </text>
            <text
              x="100"
              y="116"
              text-anchor="middle"
              font-size="14"
              fill="#999"
              font-family="sans-serif"
            >
              Good
            </text>
          </svg>
          <!-- <div class="prop-score-ticks">
            <span class="prop-tick-label" style="left: 0">0</span>
            <span class="prop-tick-label" style="right: 0">100</span>
          </div> -->
          <div class="prop-score-avg-pill">
            Street Average: 82 &nbsp;|&nbsp; Postcode Average: 72
          </div>
          <p class="prop-score-note">
            <OPIcon
              name="infoCircle"
              class="w-[13px] h-[13px]"
              style="display: inline; vertical-align: -2px; margin-right: 4px"
            />
            Based on verified property data and partial Passport completion.
          </p>
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
                  <OPIcon name="sqft" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Floor Area</p>
                  <p class="prop-detail-value">
                    {{ property.sqft ? `${property.sqft.toLocaleString()} sqft` : '—' }}
                  </p>
                  <p v-if="property.floorAreaSqm" class="prop-detail-sub">
                    {{ Math.round(property.floorAreaSqm) }} m²
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
                    {{ property.epcRating ?? '—' }}
                  </p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="tenure" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Tenure</p>
                  <p class="prop-detail-value">{{ property.tenure ?? '—' }}</p>
                </div>
              </div>
              <div class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="yearBuilt" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Year Built</p>
                  <p class="prop-detail-value">
                    {{ property.yearBuilt ?? '—' }}
                  </p>
                </div>
              </div>
              <div v-if="enrichment?.floodRisk" class="prop-detail-item">
                <div class="prop-detail-icon-wrap">
                  <OPIcon name="goodEnergy" class="w-[15px] h-[15px]" />
                </div>
                <div>
                  <p class="prop-detail-label">Flood Risk</p>
                  <p class="prop-detail-value">{{ enrichment.floodRisk }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick action icons -->
          <div class="prop-quick-actions">
            <button class="prop-quick-btn">
              <OPIcon name="exploreExternalLink" class="w-[15px] h-[15px]" />
            </button>
            <button class="prop-quick-btn">
              <OPIcon name="locationFilled" class="w-[15px] h-[15px]" />
            </button>
            <button class="prop-quick-btn">
              <OPIcon name="goodEnergy" class="w-[15px] h-[15px]" />
            </button>
            <button class="prop-quick-btn">
              <OPIcon name="train" class="w-[15px] h-[15px]" />
            </button>
            <button class="prop-quick-btn">
              <OPIcon name="closeToSchool" class="w-[15px] h-[15px]" />
            </button>
          </div>
        </div>

        <!-- Floor Plan -->
        <div class="prop-section">
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
        <div class="prop-section">
          <h2 class="prop-section-title">Location and Nearby</h2>
          <div class="prop-map-wrap">
            <div ref="mapEl" class="prop-map" />
            <a
              v-if="streetViewUrl"
              :href="`https://www.google.com/maps?q=${property?.latitude},${property?.longitude}&layer=c&cbll=${property?.latitude},${property?.longitude}`"
              target="_blank"
              rel="noopener"
              class="prop-street-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14" style="display:inline;margin-right:6px;vertical-align:-2px">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.9"/>
              </svg>
              Open Street View
            </a>
            <button v-else class="prop-street-btn" disabled style="opacity:0.5">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14" style="display:inline;margin-right:6px;vertical-align:-2px">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" opacity="0.9"/>
              </svg>
              Street View
            </button>
          </div>

          <!-- Nearby tabs (active tab = full button, others = icon circles) -->
          <div class="prop-nearby-tabs">
            <template v-for="tab in nearbyTabOptions" :key="tab.value">
              <button
                v-if="nearbyTab === tab.value"
                class="prop-nearby-full active"
                @click="nearbyTab = tab.value"
              >
                <OPIcon :name="tab.icon" class="w-[15px] h-[15px]" />
                {{ tab.label }}
              </button>
              <button
                v-else
                class="prop-nearby-icon"
                @click="nearbyTab = tab.value"
              >
                <OPIcon :name="tab.icon" class="w-[18px] h-[18px]" />
              </button>
            </template>
          </div>

          <!-- Content for active nearby tab -->
          <div class="prop-station-list">
            <div
              v-for="s in nearbyTabOptions.find((t) => t.value === nearbyTab)
                ?.items ?? []"
              :key="s.name"
              class="prop-station-row"
            >
              <div class="prop-station-icon">
                <OPIcon
                  :name="s.icon ?? 'publicTransport'"
                  class="w-[18px] h-[18px]"
                />
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
                  {{ s.distance }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- EPC Rating -->
        <div v-if="property.epcRating" class="prop-section">
          <div class="prop-section-title-row">
            <h2 class="prop-section-title">EPC Rating</h2>
            <a
              v-if="enrichment?.epcCert?.certUrl"
              :href="enrichment.epcCert.certUrl"
              target="_blank"
              rel="noopener"
              class="prop-epc-cert-link"
            >View Certificate</a>
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
              :class="{ 'epc-current': band.label === property.epcRating }"
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
                  v-if="band.label === property.epcRating"
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
        <div v-if="enrichment?.salesHistory?.length" class="prop-section">
          <h2 class="prop-section-title">Sales History</h2>
          <div class="prop-price-history">
            <div
              v-for="(sale, i) in enrichment.salesHistory"
              :key="i"
              class="prop-sale-row"
            >
              <div class="prop-sale-left">
                <p class="prop-sale-price">{{ formatPrice(sale.price) }}</p>
                <p class="prop-sale-meta">
                  {{ [sale.propertyType, sale.tenure, sale.newBuild ? 'New Build' : null].filter(Boolean).join(' · ') || '—' }}
                </p>
              </div>
              <div class="prop-sale-right">
                <p class="prop-sale-address">{{ sale.address ?? 'Nearby property' }}</p>
                <p class="prop-sale-date">{{ formatSaleDate(sale.date) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Broadband Connectivity -->
        <div v-if="enrichment?.broadband" class="prop-section">
          <h2 class="prop-section-title">Broadband Connectivity</h2>
          <div class="prop-broadband-card">
            <div class="prop-bb-speeds">
              <div class="prop-bb-speed-item">
                <span class="prop-bb-speed-val">{{ enrichment.broadband.maxDownload ?? '—' }}</span>
                <span class="prop-bb-speed-unit">Mbps</span>
                <span class="prop-bb-speed-label">Max Download</span>
              </div>
              <div class="prop-bb-divider" />
              <div class="prop-bb-speed-item">
                <span class="prop-bb-speed-val">{{ enrichment.broadband.maxUpload ?? '—' }}</span>
                <span class="prop-bb-speed-unit">Mbps</span>
                <span class="prop-bb-speed-label">Max Upload</span>
              </div>
            </div>
            <div class="prop-bb-types">
              <span class="prop-bb-type" :class="{ 'prop-bb-type--on': enrichment.broadband.ultrafast }">Ultrafast</span>
              <span class="prop-bb-type" :class="{ 'prop-bb-type--on': enrichment.broadband.superfast }">Superfast</span>
              <span class="prop-bb-type" :class="{ 'prop-bb-type--on': enrichment.broadband.fttp }">FTTP</span>
              <span class="prop-bb-type" :class="{ 'prop-bb-type--on': enrichment.broadband.fttc }">FTTC</span>
              <span class="prop-bb-type" :class="{ 'prop-bb-type--on': enrichment.broadband.cable }">Cable</span>
            </div>
          </div>
        </div>

        <!-- Flood Risk Detail -->
        <div v-if="enrichment?.floodRisk" class="prop-section">
          <h2 class="prop-section-title">Flood Risk</h2>
          <div class="prop-flood-card">
            <div class="prop-flood-header">
              <div
                class="prop-flood-badge"
                :class="`prop-flood-badge--${(enrichment.floodRisk ?? 'very-low').toLowerCase().replace(/\s/g, '-')}`"
              >
                {{ enrichment.floodRisk }}
              </div>
              <p class="prop-flood-desc">
                Risk level based on Environment Agency flood monitoring data.
              </p>
            </div>
            <div v-if="enrichment.floodZones?.length" class="prop-flood-zones">
              <div
                v-for="(zone, i) in enrichment.floodZones"
                :key="i"
                class="prop-flood-zone-row"
              >
                <OPIcon name="goodEnergy" class="w-[14px] h-[14px] shrink-0 mt-0.5 text-teal-600" />
                <div class="flex-1 min-w-0">
                  <p class="prop-flood-zone-name">{{ zone.name }}</p>
                  <p class="prop-flood-zone-sev">
                    {{ zone.severity }}
                    <span v-if="zone.riverSea"> · {{ zone.riverSea }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Listed Buildings Nearby -->
        <div v-if="enrichment?.listedBuildings?.length" class="prop-section">
          <h2 class="prop-section-title">Listed Buildings Nearby</h2>
          <div class="prop-listed-list">
            <div
              v-for="(b, i) in enrichment.listedBuildings"
              :key="i"
              class="prop-listed-row"
            >
              <div class="prop-listed-grade">{{ b.grade ?? 'LB' }}</div>
              <div class="flex-1 min-w-0">
                <p class="prop-listed-name">{{ b.name }}</p>
                <p v-if="b.location" class="prop-listed-loc">{{ b.location }}</p>
              </div>
              <a
                v-if="b.link"
                :href="b.link"
                target="_blank"
                rel="noopener"
                class="prop-listed-link"
              >View</a>
            </div>
          </div>
        </div>

        <!-- Council Tax -->
        <div class="prop-section">
          <h2 class="prop-section-title">Council Tax</h2>
          <div class="prop-ct-card">
            <div v-if="enrichment?.councilTax?.band" class="prop-ct-main">
              <div class="prop-ct-band">{{ enrichment.councilTax.band }}</div>
              <div class="prop-ct-info">
                <p class="prop-ct-label">Band {{ enrichment.councilTax.band }}</p>
                <p v-if="enrichment.councilTax.annualEstimate" class="prop-ct-amount">
                  ~£{{ enrichment.councilTax.annualEstimate.toLocaleString() }} / year
                </p>
                <p v-if="enrichment.councilTax.councilName" class="prop-ct-council">
                  {{ enrichment.councilTax.councilName }}
                </p>
              </div>
            </div>
            <div v-else class="prop-ct-unknown">
              <p class="prop-ct-unknown-label">Band not available</p>
            </div>
            <a
              :href="enrichment?.councilTax?.checkUrl ?? 'https://www.gov.uk/council-tax-bands'"
              target="_blank"
              rel="noopener"
              class="prop-ct-link"
            >Check on GOV.UK</a>
          </div>
        </div>

        <!-- Planning -->
        <div class="prop-section">
          <h2 class="prop-section-title">Planning</h2>
          <div class="prop-planning-card">

            <!-- Constraints by category -->
            <template v-if="enrichment?.planningHistory?.constraints?.length">
              <div class="prop-planning-label">Constraints</div>
              <template v-for="cat in planningCategories" :key="cat.id">
                <div v-if="planningByCategory(cat.id).length" class="prop-planning-category">
                  <div class="prop-planning-cat-header">
                    <span class="prop-planning-cat-dot" :style="{ background: cat.color }" />
                    {{ cat.label }}
                  </div>
                  <div class="prop-planning-list">
                    <div
                      v-for="(c, i) in planningByCategory(cat.id)"
                      :key="i"
                      class="prop-planning-row"
                    >
                      <div class="prop-planning-type-badge" :style="{ background: cat.bg, color: cat.color }">
                        {{ c.type }}
                      </div>
                      <p class="prop-planning-name">{{ c.name }}</p>
                      <p v-if="c.reference" class="prop-planning-ref">Ref: {{ c.reference }}</p>
                    </div>
                  </div>
                </div>
              </template>
            </template>
            <p v-else-if="enrichment && !enrichment.planningHistory?.constraints?.length" class="prop-planning-none">
              No planning constraints recorded for this location.
            </p>

            <!-- Planning Applications -->
            <template v-if="enrichment?.planningHistory?.applications?.length">
              <div class="prop-planning-label" :style="{ marginTop: enrichment?.planningHistory?.constraints?.length ? '16px' : '0' }">
                Planning Applications
              </div>
              <div class="prop-planning-apps">
                <div
                  v-for="(app, i) in enrichment.planningHistory.applications"
                  :key="i"
                  class="prop-planning-app-row"
                >
                  <div class="prop-planning-app-top">
                    <span class="prop-planning-ref">{{ app.reference ?? 'No ref' }}</span>
                    <span
                      v-if="app.decision"
                      class="prop-planning-decision"
                      :class="planningDecisionClass(app.decision)"
                    >{{ app.decision }}</span>
                    <span v-else-if="app.status" class="prop-planning-decision prop-planning-decision--pending">
                      {{ app.status }}
                    </span>
                  </div>
                  <p v-if="app.description" class="prop-planning-app-desc">{{ app.description }}</p>
                  <div class="prop-planning-app-meta">
                    <span v-if="app.applicationType" class="prop-planning-app-type">{{ app.applicationType }}</span>
                    <span v-if="app.decisionDate" class="prop-planning-app-date">{{ formatSaleDate(app.decisionDate) }}</span>
                  </div>
                  <a v-if="app.docUrl" :href="app.docUrl" target="_blank" rel="noopener" class="prop-planning-app-link">
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
              style="margin-top: 14px; display: inline-block;"
            >planning.data.gov.uk</a>
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
      :property="property ? {
        id: property.id,
        addressLine1: property.addressLine1,
        area: property.area,
        postcode: property.postcode,
        priceDisplay: property.priceDisplay,
        image: property.image,
      } : null"
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
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
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
const { wishlisted, saved, toggleWishlist, toggleSave, fetchActions } = usePropertyActions()

const config = useRuntimeConfig()
const property = ref<any>(null)
const passportStatus = ref<any>(null)
const enrichment = ref<any>(null)
const pageLoading = ref(true)
const loadError = ref('')
const showRegisterInterest = ref(false)
const showShare = ref(false)
const showClaimDrawer = ref(false)
const scoreTab = ref('home')
const nearbyTab = ref('train')
const mapEl = ref<HTMLElement | null>(null)
let mapInstance: any = null

const nearbyTabOptions = computed(() => {
  const nearby = enrichment.value?.nearby ?? {}

  const mapPlace = (p: any, icon: string) => ({
    name: p.name,
    distance: p.vicinity ?? '',
    icon,
  })

  return [
    {
      value: 'train',
      label: 'Train Stations',
      icon: 'trainWhite',
      items: (nearby.trains ?? []).map((p: any) => mapPlace(p, 'nationalRailLogo')),
    },
    {
      value: 'school',
      label: 'Schools',
      icon: 'closeToSchool',
      items: (nearby.schools ?? []).map((p: any) => mapPlace(p, 'closeToSchool')),
    },
    {
      value: 'park',
      label: 'Parks',
      icon: 'closeToPublicPark',
      items: (nearby.parks ?? []).map((p: any) => mapPlace(p, 'closeToPublicPark')),
    },
  ]
})

const streetViewUrl = computed(() => enrichment.value?.streetViewUrl ?? null)

const FALLBACK_IMAGES = [
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2249531/pexels-photo-2249531.jpeg?auto=compress&cs=tinysrgb&w=800',
]

const propertyImages = computed(() => {
  const images: string[] = []

  // 1. Google Street View as the first image (real photo of the property exterior)
  const lat = property.value?.latitude
  const lon = property.value?.longitude
  const googleKey = config.public.googleApiKey as string
  if (lat && lon && googleKey) {
    images.push(
      `https://maps.googleapis.com/maps/api/streetview?size=800x500&location=${lat},${lon}&key=${googleKey}&fov=90&pitch=10&return_error_codes=true`,
    )
  }

  // 2. Property image from EPC/pexels
  const main =
    property.value?.imageUrl ||
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
  images.push(main)

  // 3. Fallback variety images
  images.push(...FALLBACK_IMAGES)

  return images
})

const potentialEpc = computed(() => {
  // Use real potential rating from EPC API if available
  if (enrichment.value?.epcPotentialRating) return enrichment.value.epcPotentialRating
  // Fallback: one band better than current (rough estimate before enrichment loads)
  const bands = ['G', 'F', 'E', 'D', 'C', 'B', 'A']
  const idx = bands.indexOf(property.value?.epcRating ?? 'D')
  return bands[Math.min(idx + 1, bands.length - 1)]
})

const actionBarItems = computed(() => {
  const hasPassport = passportStatus.value?.hasPassport
  return [
    {
      icon: 'accessPassport',
      label: hasPassport ? 'Access Passport' : 'Claim Passport',
    },
    { icon: 'saveProperty', label: saved.value ? 'Saved Property' : 'Save Property' },
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

// Mapbox GL map
const initMap = async () => {
  if (!mapEl.value || !property.value) return
  const lat = property.value.latitude
  const lng = property.value.longitude
  if (!lat || !lng) return

  const token = config.public.mapboxToken as string
  if (!token) return

  const mapboxgl = (await import('mapbox-gl')).default
  // inject CSS once
  if (!document.querySelector('link[href*="mapbox-gl"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css'
    document.head.appendChild(link)
  }

  mapboxgl.accessToken = token
  const map = new mapboxgl.Map({
    container: mapEl.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [lng, lat],
    zoom: 15,
    interactive: true,
  })

  mapInstance = map

  // Custom marker
  const el = document.createElement('div')
  el.style.cssText = 'width:40px;height:40px;border-radius:50%;background:#00a19a;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,161,154,0.5);border:3px solid white;'
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" stroke-width="2" fill="rgba(255,255,255,0.2)"/><path d="M9 22V12h6v10" stroke="white" stroke-width="2"/></svg>`

  new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)
}

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
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
    initMap()
  }

  // Fetch enrichment data in background (non-blocking)
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${apiBase}/property/${propertyId}/enrichment`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) enrichment.value = await res.json()
  } catch { /* non-critical */ }
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
  if (result === 'unauthenticated') message = 'Please log in to wishlist properties'
  else if (result === 'error') message = 'Something went wrong, please try again'
  else message = result.wishlisted ? 'Added to your wishlist' : 'Removed from wishlist'
  showToast({ message, icon: propertyImages.value[0], duration: 2000 })
}

async function handleSaveProperty() {
  const result = await toggleSave(propertyId)
  let message = ''
  if (result === 'unauthenticated') message = 'Please log in to save properties'
  else if (result === 'error') message = 'Something went wrong, please try again'
  else message = result.saved ? 'Property saved to your collections' : 'Removed from saved properties'
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
  { id: 'heritage',     label: 'Heritage',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  { id: 'environment',  label: 'Environment',  color: '#16a34a', bg: 'rgba(22,163,74,0.1)'  },
  { id: 'development',  label: 'Development',  color: '#ea580c', bg: 'rgba(234,88,12,0.1)'  },
]

function planningByCategory(category: string) {
  return (enrichment.value?.planningHistory?.constraints ?? []).filter((c: any) => c.category === category)
}

function planningDecisionClass(decision: string) {
  const d = (decision ?? '').toLowerCase()
  if (d.includes('grant') || d.includes('approv') || d.includes('permit')) return 'prop-planning-decision--approved'
  if (d.includes('refus') || d.includes('reject')) return 'prop-planning-decision--refused'
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
  /* background: white; */
  position: relative;
  padding: 30px 16px 0;
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

.prop-score-note {
  font-size: 11px;
  color: #aaa;
  text-align: center;
  line-height: 1.4;
  max-width: 280px;
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

/* Quick action icons */
.prop-quick-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #eeeeee;
}

.prop-quick-btn {
  width: 50px;
  height: 32px;
  border-radius: 100px;
  background: white;
  border: 0.33px solid #e8e8ee;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 6px 16px;
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
.prop-map-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 14px;
}

.prop-map {
  height: 200px;
  width: 100%;
}

.prop-street-btn {
  position: absolute;
  bottom: 14px;
  right: 14px;
  background: #00a19a;
  color: white;
  border: none;
  padding: 9px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.35);
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

/* ── Price History ───────────────────────────────────────────────────────── */
.prop-price-history {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 16px;
  overflow: hidden;
  background: #f8f8fa;
}
.prop-sale-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #eeeeee;
  gap: 12px;
}
.prop-sale-row:last-child {
  border-bottom: none;
}
.prop-sale-left {
  flex: 0 0 auto;
}
.prop-sale-right {
  flex: 1;
  min-width: 0;
  text-align: right;
}
.prop-sale-price {
  font-size: 15px;
  font-weight: 700;
  color: #00a19a;
}
.prop-sale-meta {
  font-size: 11px;
  color: #8e8e93;
  margin-top: 2px;
}
.prop-sale-address {
  font-size: 12px;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
  margin-left: auto;
}
.prop-sale-date {
  font-size: 11px;
  color: #8e8e93;
  margin-top: 2px;
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
.prop-flood-badge--low { background: #d4edda; color: #155724; }
.prop-flood-badge--medium { background: #fff3cd; color: #856404; }
.prop-flood-badge--high { background: #f8d7da; color: #721c24; }
.prop-flood-badge--severe { background: #c82333; color: white; }
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
.prop-ct-unknown-label {
  font-size: 13px;
  color: #8e8e93;
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
