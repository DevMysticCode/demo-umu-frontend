<template>
  <div class="pp-page">
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
          <svg viewBox="0 0 390 200" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;">
            <defs>
              <linearGradient id="ppSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#c8ede9"/>
                <stop offset="100%" stop-color="#e8f8f6"/>
              </linearGradient>
            </defs>
            <rect width="390" height="200" fill="url(#ppSky)"/>
            <rect x="0" y="166" width="390" height="34" fill="#00A19A" opacity="0.15"/>
            <rect x="18" y="108" width="52" height="58" rx="3" fill="#eaf6f4" opacity="0.7"/>
            <polygon points="12,108 44,82 76,108" fill="#2a5f5a" opacity="0.4"/>
            <rect x="28" y="120" width="12" height="11" rx="1.5" fill="rgba(255,255,255,0.6)"/>
            <line x1="34" y1="120" x2="34" y2="131" stroke="#2a5f5a" stroke-width="1" opacity="0.4"/>
            <line x1="28" y1="125" x2="40" y2="125" stroke="#2a5f5a" stroke-width="1" opacity="0.4"/>
            <rect x="316" y="100" width="60" height="66" rx="3" fill="#eaf6f4" opacity="0.65"/>
            <polygon points="308,100 346,70 384,100" fill="#2a5f5a" opacity="0.35"/>
            <rect x="326" y="114" width="13" height="12" rx="1.5" fill="rgba(255,255,255,0.6)"/>
            <line x1="332" y1="114" x2="332" y2="126" stroke="#2a5f5a" stroke-width="1" opacity="0.4"/>
            <line x1="326" y1="120" x2="339" y2="120" stroke="#2a5f5a" stroke-width="1" opacity="0.4"/>
            <rect x="92" y="138" width="5" height="30" rx="2.5" fill="#00A19A" opacity="0.5"/>
            <ellipse cx="94" cy="128" rx="16" ry="14" fill="#00A19A" opacity="0.28"/>
            <rect x="292" y="148" width="4" height="20" rx="2" fill="#00A19A" opacity="0.4"/>
            <ellipse cx="294" cy="140" rx="12" ry="10" fill="#00A19A" opacity="0.22"/>
            <rect x="128" y="98" width="136" height="70" rx="4" fill="#f5fffe"/>
            <polygon points="118,98 196,52 274,98" fill="#2a5f5a"/>
            <polygon points="118,98 196,52 274,98" fill="none" stroke="#1a4040" stroke-width="1.5"/>
            <rect x="236" y="48" width="11" height="22" rx="2" fill="#2a5f5a"/>
            <rect x="233" y="45" width="17" height="5" rx="1.5" fill="#1e4a44"/>
            <rect x="140" y="108" width="24" height="20" rx="2.5" fill="rgba(200,240,236,0.9)"/>
            <line x1="152" y1="108" x2="152" y2="128" stroke="#2a5f5a" stroke-width="1.5" opacity="0.5"/>
            <line x1="140" y1="118" x2="164" y2="118" stroke="#2a5f5a" stroke-width="1.5" opacity="0.5"/>
            <rect x="174" y="108" width="24" height="20" rx="2.5" fill="rgba(200,240,236,0.9)"/>
            <line x1="186" y1="108" x2="186" y2="128" stroke="#2a5f5a" stroke-width="1.5" opacity="0.5"/>
            <line x1="174" y1="118" x2="198" y2="118" stroke="#2a5f5a" stroke-width="1.5" opacity="0.5"/>
            <rect x="222" y="108" width="24" height="20" rx="2.5" fill="rgba(200,240,236,0.9)"/>
            <line x1="234" y1="108" x2="234" y2="128" stroke="#2a5f5a" stroke-width="1.5" opacity="0.5"/>
            <line x1="222" y1="118" x2="246" y2="118" stroke="#2a5f5a" stroke-width="1.5" opacity="0.5"/>
            <rect x="180" y="138" width="24" height="30" rx="3" fill="#00A19A"/>
            <rect x="184" y="142" width="7" height="9" rx="1" fill="rgba(255,255,255,0.3)"/>
            <rect x="193" y="142" width="7" height="9" rx="1" fill="rgba(255,255,255,0.3)"/>
            <circle cx="202" cy="154" r="2.5" fill="rgba(255,255,255,0.8)"/>
            <rect x="176" y="167" width="32" height="4" rx="2" fill="#e0f7f4"/>
            <polygon points="180,171 204,171 208,200 176,200" fill="#00A19A" opacity="0.12"/>
            <rect x="158" y="155" width="4" height="16" rx="2" fill="#2a5f5a" opacity="0.5"/>
            <rect x="222" y="155" width="4" height="16" rx="2" fill="#2a5f5a" opacity="0.5"/>
            <line x1="162" y1="158" x2="222" y2="158" stroke="#2a5f5a" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.3"/>
          </svg>
        </div>
        <!-- Real images -->
        <div v-else class="pp-hero-inner">
          <ImageSlider :images="propertyImages" />
        </div>

        <!-- Top overlay: back / heart / share -->
        <div class="pp-hero-top">
          <button class="pp-icon-btn" @click="goBack">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style="display:flex;gap:8px;">
            <button class="pp-icon-btn" :class="{ 'pp-icon-btn--active': wishlisted }" @click="handleWishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" :fill="wishlisted ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button class="pp-icon-btn" @click="showShare = true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </button>
          </div>
        </div>

        <!-- Bottom badges -->
        <div class="pp-hero-badges">
          <span v-if="passportStatus?.hasPassport" class="pp-badge-passport">📘 Passport available</span>
          <span class="pp-badge-flood" :class="floodRiskClass">{{ floodRiskLabel }} risk</span>
        </div>
      </div>

      <!-- ── Scrollable content ── -->
      <div class="pp-scroll">

        <!-- Address + price block -->
        <div class="pp-info-block">
          <h1 class="pp-address">{{ displayAddress }}</h1>
          <p class="pp-city">{{ [displayArea, displayCity, property.postcode].filter(Boolean).join(', ') }}</p>
          <div class="pp-price-row">
            <span class="pp-price">{{ formatPrice(displayEstimatedPrice) }}</span>
            <span class="pp-price-src">{{ estimatedPriceSource }}</span>
          </div>
          <div class="pp-pills">
            <span v-if="prop?.bedrooms" class="pp-pill">🛏 {{ prop.bedrooms }} bed</span>
            <span v-if="property.propertyType" class="pp-pill">{{ property.propertyType }}</span>
            <span v-if="prop?.sqft" class="pp-pill">📐 {{ prop.sqft.toLocaleString() }} sqft</span>
            <span v-if="prop?.yearBuilt" class="pp-pill">{{ prop.yearBuilt }}</span>
          </div>
        </div>

        <!-- Quick action strip -->
        <div class="pp-actions-wrap">
          <div class="pp-action-strip">
            <button class="pp-action-btn" @click="openRegisterInterest">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.56 6.56l.91-.85a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2z"/></svg>
              Register
            </button>
            <button class="pp-action-btn" @click="tapOwner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              Tap Owner
            </button>
            <button class="pp-action-btn" @click="handlePassportAction">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>
              {{ passportBtnLabel }}
            </button>
          </div>
        </div>

        <div class="pp-content-pad">

          <!-- ── HealthScore ── -->
          <div class="pp-section-hdr">
            <span>HealthScore™</span>
            <span class="pp-section-sub">{{ homeScoreIsAuto ? 'Public EPC · estimated' : 'Calculated score' }}</span>
          </div>

          <div class="pp-hs-card">
            <div class="pp-hs-top">
              <!-- Semi-circle gauge -->
              <div class="pp-gauge-wrap">
                <svg viewBox="0 0 110 62" width="110" height="62" style="overflow:visible;">
                  <path d="M 10 55 A 45 45 0 0 1 100 55" fill="none" stroke="#eef0f6" stroke-width="10" stroke-linecap="round"/>
                  <path d="M 10 55 A 45 45 0 0 1 100 55" fill="none" :stroke="gaugeColor" stroke-width="10" stroke-linecap="round" stroke-dasharray="141.4" :stroke-dashoffset="gaugeDashoffset"/>
                </svg>
                <div class="pp-gauge-num" :style="{ color: gaugeColor }">{{ gaugeScore ?? '?' }}</div>
              </div>
              <div class="pp-hs-summary">
                <div class="pp-hs-title">{{ gaugeRatingText }}</div>
                <div class="pp-hs-desc">{{ gaugeDesc }}</div>
                <div class="pp-hs-badge-pill" :style="gaugeBadgeStyle">
                  <span class="pp-hs-badge-dot" :style="{ background: gaugeColor }"></span>
                  {{ epcBadgeText }}
                </div>
              </div>
            </div>

            <!-- EPC component bars -->
            <div v-if="epcComponents.length" class="pp-epc-section">
              <div class="pp-epc-label">From the public EPC certificate</div>
              <div class="pp-epc-bars">
                <div v-for="c in epcComponents" :key="c.label" class="pp-epc-row">
                  <span class="pp-epc-name">{{ c.label }}</span>
                  <div class="pp-epc-track">
                    <div class="pp-epc-fill" :style="{ width: c.pct + '%', background: c.color }"></div>
                  </div>
                  <span class="pp-epc-desc">{{ c.desc }}</span>
                </div>
              </div>

              <!-- Running costs -->
              <div v-if="hasRunningCosts" class="pp-costs">
                <div class="pp-costs-title">Estimated running costs · current rating</div>
                <div class="pp-costs-grid">
                  <div class="pp-cost-box">
                    <div class="pp-cost-val">{{ formatCost(runningCosts.heating) }}</div>
                    <div class="pp-cost-lbl">Heating</div>
                  </div>
                  <div class="pp-cost-box">
                    <div class="pp-cost-val">{{ formatCost(runningCosts.hotWater) }}</div>
                    <div class="pp-cost-lbl">Hot water</div>
                  </div>
                  <div class="pp-cost-box">
                    <div class="pp-cost-val">{{ formatCost(runningCosts.lighting) }}</div>
                    <div class="pp-cost-lbl">Lighting</div>
                  </div>
                  <div class="pp-cost-box pp-cost-box--total">
                    <div class="pp-cost-val pp-cost-val--total">{{ formatCost(runningCosts.total) }}</div>
                    <div class="pp-cost-lbl pp-cost-lbl--total">Total / yr</div>
                  </div>
                </div>
                <p class="pp-costs-note">Based on EPC assumptions. Actual costs vary by usage and tariff.</p>
              </div>
            </div>

            <!-- Homescore CTA -->
            <div class="pp-hs-cta-row" @click="navigateTo('/homescore/' + property.id)">
              <div>
                <div class="pp-hs-cta-title">Want the full picture?</div>
                <div class="pp-hs-cta-sub">Run a free HealthScore on this address</div>
              </div>
              <button class="pp-hs-cta-btn">Free →</button>
            </div>
          </div>

          <!-- ── Property Details ── -->
          <div class="pp-section-hdr" style="margin-top:4px;">Property Details</div>
          <div class="pp-details-card">
            <div class="pp-detail-row">
              <div class="pp-detail-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>
              </div>
              <div class="pp-detail-lbl">Property type</div>
              <div class="pp-detail-v">{{ property.propertyType ?? '—' }}</div>
            </div>
            <div class="pp-detail-row">
              <div class="pp-detail-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div class="pp-detail-lbl">Tenure</div>
              <div class="pp-detail-v">{{ prop?.tenure ?? '—' }}</div>
            </div>
            <div class="pp-detail-row">
              <div class="pp-detail-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"><path d="M21 10H3M16 2v4M8 2v4M3 6h18v16H3z"/></svg>
              </div>
              <div class="pp-detail-lbl">Year built</div>
              <div class="pp-detail-v">{{ prop?.yearBuilt ?? '—' }}</div>
            </div>
            <div class="pp-detail-row">
              <div class="pp-detail-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><rect x="9" y="1" width="6" height="4" rx="1"/></svg>
              </div>
              <div class="pp-detail-lbl">Floor area</div>
              <div class="pp-detail-v">
                {{ prop?.sqft ? prop.sqft.toLocaleString() + ' sqft' : '—' }}
                <span v-if="prop?.floorAreaSqm" class="pp-detail-sub">({{ Math.round(prop.floorAreaSqm) }} m²)</span>
              </div>
            </div>
            <div v-if="prop?.epcRating" class="pp-detail-row">
              <div class="pp-detail-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div class="pp-detail-lbl">EPC rating</div>
              <div class="pp-detail-v" :style="{ color: epcRatingColor }">
                {{ prop.epcRating }}
                <span v-if="prop?.epcScore" class="pp-epc-score-pill">{{ prop.epcScore }} / 100</span>
              </div>
            </div>
            <div class="pp-detail-row">
              <div class="pp-detail-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div class="pp-detail-lbl">Flood risk</div>
              <div class="pp-detail-v" :style="{ color: floodRiskColor }">
                {{ floodRiskLabel }}
                <span class="pp-flood-pill" :style="floodPillStyle">{{ floodZoneLabel }}</span>
              </div>
            </div>
            <div v-if="property.titleNumber" class="pp-detail-row">
              <div class="pp-detail-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <div class="pp-detail-lbl">Title number</div>
              <div class="pp-detail-v pp-detail-mono">{{ property.titleNumber }}</div>
            </div>
            <div v-if="property.uprn" class="pp-detail-row pp-detail-row--last">
              <div class="pp-detail-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2" stroke-linecap="round"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="pp-detail-lbl">UPRN</div>
              <div class="pp-detail-v pp-detail-mono">{{ property.uprn }}</div>
            </div>
          </div>

          <!-- ── Price History ── -->
          <template v-if="thisSales.length || displayEstimatedPrice">
            <div class="pp-section-hdr" style="margin-top:4px;">
              <span>Price History</span>
              <span class="pp-section-link">Land Registry</span>
            </div>
            <div class="pp-price-history">
              <div v-if="displayEstimatedPrice" class="pp-sold-row">
                <div>
                  <div class="pp-sold-price">{{ formatPrice(displayEstimatedPrice) }}</div>
                  <div class="pp-sold-meta">HPI adjusted estimate</div>
                </div>
                <span class="pp-sold-badge pp-sold-badge--current">Current estimate</span>
              </div>
              <div v-for="s in thisSales" :key="s.date ?? s.transferDate" class="pp-sold-row">
                <div>
                  <div class="pp-sold-price">{{ formatPrice(s.price ?? s.amount) }}</div>
                  <div class="pp-sold-meta">{{ formatSaleDate(s.date ?? s.transferDate) }}{{ s.tenure ? ' · ' + s.tenure : '' }}</div>
                </div>
                <span class="pp-sold-badge">Sold</span>
              </div>
            </div>
          </template>

          <!-- ── Location & Map ── -->
          <div class="pp-section-hdr" style="margin-top:4px;">Location &amp; Map</div>

          <!-- Tab selector -->
          <div class="pp-loc-tabs">
            <button class="pp-loc-tab" :class="{ 'pp-loc-tab--on': locTab === 'map' }" @click="switchLocTab('map')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:block;margin:0 auto 3px;"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Map
            </button>
            <button class="pp-loc-tab" :class="{ 'pp-loc-tab--on': locTab === 'street' }" @click="switchLocTab('street')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:block;margin:0 auto 3px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Street
            </button>
            <button class="pp-loc-tab" :class="{ 'pp-loc-tab--on': locTab === 'schools' }" @click="switchLocTab('schools')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:block;margin:0 auto 3px;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
              Schools
            </button>
            <button class="pp-loc-tab" :class="{ 'pp-loc-tab--on': locTab === 'transport' }" @click="switchLocTab('transport')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:block;margin:0 auto 3px;"><rect x="1" y="6" width="22" height="13" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/><path d="M1 10h22"/></svg>
              Transit
            </button>
          </div>

          <!-- Map tab -->
          <div v-show="locTab === 'map'">
            <div ref="mapEl" class="pp-map"></div>
            <div class="pp-map-legend">
              <div class="pp-legend-item"><span class="pp-legend-dot" style="background:#231d45;"></span>Property</div>
              <div class="pp-legend-item"><span class="pp-legend-dot" style="background:#3b82f6;"></span>Schools</div>
              <div class="pp-legend-item"><span class="pp-legend-dot" style="background:#8b5cf6;"></span>Trains</div>
              <div class="pp-legend-item"><span class="pp-legend-dot" style="background:#f59e0b;"></span>Bus</div>
              <div class="pp-legend-item"><span class="pp-legend-dot" style="background:#10b981;"></span>Parks</div>
            </div>
          </div>

          <!-- Street tab -->
          <div v-if="locTab === 'street'">
            <div class="pp-street-scene">
              <svg viewBox="0 0 350 180" width="100%" height="180" style="position:absolute;inset:0;" preserveAspectRatio="xMidYMid slice">
                <defs><linearGradient id="stSky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b8d4e8"/><stop offset="100%" stop-color="#d4e8f0"/></linearGradient></defs>
                <rect width="350" height="180" fill="url(#stSky2)"/>
                <rect x="0" y="130" width="350" height="50" fill="#8a9ba8"/>
                <line x1="0" y1="155" x2="350" y2="155" stroke="#fff" stroke-width="2" stroke-dasharray="20,15" opacity="0.4"/>
                <rect x="0" y="120" width="350" height="12" fill="#b0bec8"/>
                <rect x="10" y="60" width="55" height="62" rx="2" fill="#c8d8d0"/>
                <polygon points="4,60 37,32 70,60" fill="#6a8070"/>
                <rect x="72" y="50" width="65" height="72" rx="2" fill="#dce8e0"/>
                <polygon points="65,50 104,18 143,50" fill="#5a7268"/>
                <rect x="144" y="44" width="72" height="78" rx="2" fill="#e8f4f0" stroke="#00A19A" stroke-width="2"/>
                <polygon points="136,44 180,8 224,44" fill="#2a5f5a"/>
                <rect x="161" y="88" width="18" height="34" rx="2" fill="#00A19A"/>
                <circle cx="180" cy="38" r="8" fill="#00A19A" stroke="#fff" stroke-width="1.5"/>
                <text x="180" y="42" text-anchor="middle" font-size="9" fill="#fff" font-family="sans-serif">★</text>
                <rect x="224" y="56" width="60" height="66" rx="2" fill="#d0e0d8"/>
                <polygon points="218,56 254,26 290,56" fill="#607870"/>
                <rect x="292" y="64" width="50" height="58" rx="2" fill="#c8d4cc"/>
                <polygon points="286,64 317,38 348,64" fill="#5a6e64"/>
              </svg>
              <div class="pp-street-label">STREET VIEW</div>
              <div class="pp-street-pin">{{ displayAddress }} ★</div>
            </div>
            <div v-if="nearbySales.length" class="pp-nearby-sold-card">
              <div class="pp-nearby-sold-title">Nearby sold prices</div>
              <div v-for="s in nearbySales.slice(0,4)" :key="(s.address ?? s.addressLine1) + s.date" class="pp-sold-row">
                <div>
                  <div class="pp-sold-price">{{ formatPrice(s.price ?? s.amount) }}</div>
                  <div class="pp-sold-meta">{{ s.address ?? s.addressLine1 }} · {{ formatSaleDate(s.date ?? s.transferDate) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Schools tab -->
          <div v-if="locTab === 'schools'" class="pp-nearby-card">
            <div v-if="!nearbySchools.length" class="pp-nearby-empty">No school data available for this area.</div>
            <div v-else class="pp-nearby-list">
              <div v-for="s in nearbySchools" :key="s.name" class="pp-nearby-item">
                <div class="pp-nearby-icon pp-nearby-icon--blue">🏫</div>
                <div class="pp-nearby-info">
                  <div class="pp-nearby-name">{{ s.name }}</div>
                  <div class="pp-nearby-meta">{{ s.distanceKm ? s.distanceKm + ' km' : '' }}{{ s.type ? ' · ' + s.type : '' }}{{ s.ofsted ? ' · Ofsted: ' + s.ofsted : '' }}</div>
                </div>
                <span v-if="s.ofsted" class="pp-ofsted-badge" :class="ofstedClass(s.ofsted)">{{ s.ofsted }}</span>
              </div>
            </div>
          </div>

          <!-- Transport tab -->
          <div v-if="locTab === 'transport'" class="pp-nearby-card">
            <div v-if="!nearbyTransport.length" class="pp-nearby-empty">No transport data available for this area.</div>
            <div v-else class="pp-nearby-list">
              <div v-for="t in nearbyTransport" :key="t.name" class="pp-nearby-item">
                <div class="pp-nearby-icon" :class="t.iconClass">{{ t.emoji }}</div>
                <div class="pp-nearby-info">
                  <div class="pp-nearby-name">{{ t.name }}</div>
                  <div class="pp-nearby-meta">{{ t.meta }}</div>
                </div>
                <span class="pp-transport-badge" :class="t.badgeClass">{{ t.type }}</span>
              </div>
            </div>
          </div>

          <!-- ── Full details link ── -->
          <div class="pp-full-details-card" @click="navigateTo('/property/' + property.id + '/full')">
            <div class="pp-full-details-ic">📊</div>
            <div class="pp-full-details-body">
              <div class="pp-full-details-title">See the full report</div>
              <div class="pp-full-details-sub">SDLT, council tax bands, planning history, mobile coverage & more</div>
            </div>
            <svg class="pp-full-details-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <!-- ── Passport unlock CTA ── -->
          <div v-if="showPassportCta" class="pp-unlock-card" @click="showClaimDrawer = true">
            <div class="pp-unlock-eyebrow">Property Passport</div>
            <div class="pp-unlock-price-row">
              <span class="pp-unlock-price">£99</span>
              <span class="pp-unlock-price-note">one-time access</span>
            </div>
            <p class="pp-unlock-desc">Get the complete verified seller Property Passport — every document, every risk, every certificate. The same data your solicitor needs, in one place.</p>
            <div class="pp-unlock-features">
              <div class="pp-unlock-feat">
                <div class="pp-unlock-feat-ic">📋</div>
                <div class="pp-unlock-feat-body">
                  <div class="pp-unlock-feat-title">Verified seller documents</div>
                  <div class="pp-unlock-feat-sub">Title deeds, EPC, gas &amp; electrical certs</div>
                </div>
                <span class="pp-unlock-check">✓</span>
              </div>
              <div class="pp-unlock-feat">
                <div class="pp-unlock-feat-ic">🔍</div>
                <div class="pp-unlock-feat-body">
                  <div class="pp-unlock-feat-title">Full HealthScore™ breakdown</div>
                  <div class="pp-unlock-feat-sub">Risk categories, planning history, legal</div>
                </div>
                <span class="pp-unlock-check">✓</span>
              </div>
              <div class="pp-unlock-feat">
                <div class="pp-unlock-feat-ic">⚡</div>
                <div class="pp-unlock-feat-body">
                  <div class="pp-unlock-feat-title">Instant download pack</div>
                  <div class="pp-unlock-feat-sub">Share directly with your solicitor</div>
                </div>
                <span class="pp-unlock-check">✓</span>
              </div>
              <div class="pp-unlock-feat pp-unlock-feat--last">
                <div class="pp-unlock-feat-ic">🔒</div>
                <div class="pp-unlock-feat-body">
                  <div class="pp-unlock-feat-title">Transaction history &amp; LR data</div>
                  <div class="pp-unlock-feat-sub">Full ownership chain and previous sales</div>
                </div>
                <span class="pp-unlock-check">✓</span>
              </div>
            </div>
            <button class="pp-unlock-btn">📘 Open the Passport — £99 →</button>
            <p class="pp-unlock-note">Secure payment · Instant access · No subscription</p>
          </div>

        </div><!-- /pp-content-pad -->
      </div><!-- /pp-scroll -->

      <!-- ── Drawers & Overlays ── -->
      <BaseDrawer v-model="showRegisterInterest" title="Register Interest" :showBackButton="true" @close="showRegisterInterest = false">
        <RegisterInterestContent :property-id="propertyId" :property-address="displayAddress" @submit="onInterestRegistered" />
      </BaseDrawer>

      <BaseDrawer v-model="showShare" title="Share Property" :showBackButton="true" @close="showShare = false">
        <ShareContent
          :property-title="property?.addressLine1 ?? ''"
          :property-address="`${property?.city ?? ''}, ${property?.postcode ?? ''}`"
          :property-price="formatPrice(displayEstimatedPrice)"
          :property-image="propertyImages[0]"
          @share="handleShare"
        />
      </BaseDrawer>

      <ClaimPassportDrawer
        v-model="showClaimDrawer"
        :property="property ? { id: property.id, addressLine1: property.addressLine1, area: property.area, postcode: property.postcode, priceDisplay: property.priceDisplay, image: property.image } : null"
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

      <!-- Unpublished passport modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="showUnpublishedModal" class="unpub-overlay" @click.self="showUnpublishedModal = false">
            <div class="unpub-modal">
              <div class="unpub-icon">
                <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#00a19a" stroke-width="2" stroke-linejoin="round"/>
                  <path d="M12 8v4m0 4h.01" stroke="#00a19a" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <h3 class="unpub-title">Passport Not Yet Available</h3>
              <p class="unpub-body">The owner has not yet made their Property Passport publicly available. Register your interest to be notified, or tap the owner to request access.</p>
              <div class="unpub-actions">
                <button class="unpub-btn-secondary" @click="openRegisterInterest">Register Interest</button>
                <button class="unpub-btn-primary" @click="tapOwner">Tap Owner</button>
              </div>
              <button class="unpub-close" @click="showUnpublishedModal = false">
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M18 6L6 18M6 6l12 12" stroke="#8e8e93" stroke-width="2" stroke-linecap="round"/></svg>
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
import BaseDrawer from '~/components/ui/BaseDrawer.vue'
import ImageSlider from '~/components/ui/ImageSlider.vue'
import Toast from '~/components/ui/Toast.vue'
import ShareContent from '~/components/property/ShareContent.vue'
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
const showUnpublishedModal = ref(false)
const locTab = ref<'map' | 'street' | 'schools' | 'transport'>('map')

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
const displayAddress = computed(() => toTitleCase(property.value?.addressLine1) || property.value?.addressLine1 || '')
const displayArea = computed(() => toTitleCase(property.value?.addressLine2) || '')
const displayCity = computed(() => toTitleCase(property.value?.city) || toTitleCase(property.value?.county) || '')

const displayEstimatedPrice = computed(() =>
  enrichment.value?.landRegistryEstimate ?? property.value?.estimatedPrice ?? null,
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
  }
})

// ── HealthScore gauge ──────────────────────────────────────────────────────────
const gaugeScore = computed(() => homeScore.value?.total ?? prop.value?.epcScore ?? null)

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
  if (s >= 40) return 'Room to grow'
  return 'Needs attention'
})

const gaugeDesc = computed(() => {
  const s = gaugeScore.value ?? 0
  if (s >= 80) return 'This property scores well across all key areas. A strong performer.'
  if (s >= 60) return 'Solid overall, with some areas where improvements could add value.'
  if (s >= 40) return 'Many homes at this rating have been improved to a B or C — see what\'s possible.'
  return 'Significant improvements could transform this property\'s efficiency and value.'
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
    'Very Good': 90, 'Good': 72, 'Average': 50, 'Poor': 28, 'Very Poor': 15,
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
    { label: 'Heating', effKey: 'mainheatEnergyEff', descKey: 'mainheatDescription' },
    { label: 'Hot water', effKey: 'hotWaterEnergyEff', descKey: 'hotWaterDescription' },
    { label: 'Windows', effKey: 'windowsEnergyEff', descKey: 'windowsDescription' },
    { label: 'Lighting', effKey: 'lightingEnergyEff', descKey: 'lightingDescription' },
  ]
  return fields
    .filter(f => epc[f.effKey])
    .map(f => {
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
  const validCosts = [heating, hotWater, lighting].filter((v): v is number => v !== null)
  const total = validCosts.length ? validCosts.reduce((a, b) => a + b, 0) : null
  return { heating, hotWater, lighting, total }
})
const hasRunningCosts = computed(() => runningCosts.value.total !== null)

function formatCost(val: number | null): string {
  if (val === null) return '—'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(val)
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
  if (!zones.length) return { label: 'Low', color: '#059669', class: 'pp-badge-flood--low', zone: 'Zone 1', pill: 'background:#d1fae5;color:#065f46;', badgeClass: 'pp-badge-flood--low' }
  const sevs = zones.map((z: any) => (z.severity ?? '').toLowerCase())
  if (sevs.some((s: string) => s.includes('severe') || s.includes('warning')))
    return { label: 'High', color: '#dc2626', class: 'pp-badge-flood--high', zone: 'Zone 3', pill: 'background:#fee2e2;color:#991b1b;', badgeClass: 'pp-badge-flood--high' }
  if (sevs.some((s: string) => s.includes('alert') || s.includes('high')))
    return { label: 'Medium', color: '#ea580c', class: 'pp-badge-flood--med', zone: 'Zone 2', pill: 'background:#ffedd5;color:#9a3412;', badgeClass: 'pp-badge-flood--med' }
  return { label: 'Low', color: '#059669', class: 'pp-badge-flood--low', zone: 'Zone 1', pill: 'background:#d1fae5;color:#065f46;', badgeClass: 'pp-badge-flood--low' }
})
const floodRiskLabel = computed(() => floodRiskData.value.label)
const floodRiskColor = computed(() => floodRiskData.value.color)
const floodRiskClass = computed(() => floodRiskData.value.class)
const floodZoneLabel = computed(() => floodRiskData.value.zone)
const floodPillStyle = computed(() => floodRiskData.value.pill)

// ── Passport button ────────────────────────────────────────────────────────────
const passportBtnLabel = computed(() => {
  const s = passportStatus.value
  if (!s?.hasPassport) return 'Claim'
  if (s.isOwner || s.isCollaborator) return 'Open'
  if (s.isBuyer) return 'View'
  if (s.isPublished) return 'Unlock'
  return 'Info'
})

const showPassportCta = computed(() => {
  const s = passportStatus.value
  return s?.hasPassport && s?.isPublished && !s?.isOwner && !s?.isCollaborator && !s?.isBuyer
})

const buyerModePassportId = computed(() => {
  const s = passportStatus.value
  if (s?.hasPassport && s?.passportId && !s?.isOwner && !s?.isCollaborator && !s?.isBuyer)
    return s.passportId
  return undefined
})

// ── Sales history ──────────────────────────────────────────────────────────────
const thisSales = computed(() => enrichment.value?.salesHistory?.thisProperty ?? [])
const nearbySales = computed(() => enrichment.value?.salesHistory?.nearbySales ?? [])

// ── Nearby places ──────────────────────────────────────────────────────────────
const nearbySchools = computed(() => enrichment.value?.nearby?.schools ?? [])
const nearbyTransport = computed(() => {
  const n = enrichment.value?.nearby ?? {}
  const items: any[] = []
  for (const t of n.trains ?? []) items.push({ name: t.name, meta: t.distanceKm ? t.distanceKm + ' km' : '', emoji: '🚂', type: 'Rail', iconClass: 'pp-nearby-icon--purple', badgeClass: 'pp-transport-badge--purple' })
  for (const b of n.busStops ?? []) items.push({ name: b.name, meta: b.distanceKm ? b.distanceKm + ' km' : '', emoji: '🚌', type: 'Bus', iconClass: 'pp-nearby-icon--amber', badgeClass: 'pp-transport-badge--amber' })
  for (const a of n.airports ?? []) items.push({ name: a.name, meta: a.distanceKm ? a.distanceKm + ' km drive' : '', emoji: '✈️', type: 'Airport', iconClass: 'pp-nearby-icon--sky', badgeClass: 'pp-transport-badge--sky' })
  return items
})

function ofstedClass(ofsted: string) {
  if (ofsted === 'Outstanding') return 'pp-ofsted--outstanding'
  if (ofsted === 'Good') return 'pp-ofsted--good'
  return 'pp-ofsted--other'
}

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
      images.push(`https://maps.googleapis.com/maps/api/streetview?size=800x500&location=${lat},${lon}&key=${googleKey}&fov=90&pitch=10&radius=200&source=outdoor&return_error_codes=true`)
    }
  }
  const imgUrl = property.value?.imageUrl
  const isStreetView = (url: string) => url.includes('maps.googleapis.com/maps/api/streetview')
  if (imgUrl && !isStreetView(imgUrl) && !images.includes(imgUrl)) images.push(imgUrl)
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
  if (mapInstance) { mapInstance.remove(); mapInstance = null }

  const map = L.map(mapEl.value, { zoomControl: false }).setView([lat, lng], 15)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
    iconSize: [42, 42], iconAnchor: [21, 21],
  })
  L.marker([lat, lng], { icon: markerIcon }).addTo(map)

  function makeDivIcon(color: string, emoji: string) {
    return L.divIcon({
      className: '',
      html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.3);font-size:13px;">${emoji}</div>`,
      iconSize: [30, 30], iconAnchor: [15, 15],
    })
  }

  const addPois = () => {
    const n = enrichment.value?.nearby ?? {}
    for (const s of n.schools ?? []) { if (s.lat && s.lon) L.marker([s.lat, s.lon], { icon: makeDivIcon('#3b82f6', '🎓') }).bindPopup(s.name).addTo(map) }
    for (const t of n.trains ?? []) { if (t.lat && t.lon) L.marker([t.lat, t.lon], { icon: makeDivIcon('#8b5cf6', '🚆') }).bindPopup(t.name).addTo(map) }
    for (const b of n.busStops ?? []) { if (b.lat && b.lon) L.marker([b.lat, b.lon], { icon: makeDivIcon('#f59e0b', '🚌') }).bindPopup(b.name).addTo(map) }
    for (const p of n.parks ?? []) { if (p.lat && p.lon) L.marker([p.lat, p.lon], { icon: makeDivIcon('#10b981', '🌳') }).bindPopup(p.name).addTo(map) }
    for (const a of n.airports ?? []) { if (a.lat && a.lon) L.marker([a.lat, a.lon], { icon: makeDivIcon('#ec4899', '✈️') }).bindPopup(a.name).addTo(map) }
  }

  if (enrichment.value?.nearby) {
    addPois()
  } else {
    const stop = watch(enrichment, (v) => { if (v) { addPois(); stop() } })
  }
}

function switchLocTab(tab: 'map' | 'street' | 'schools' | 'transport') {
  locTab.value = tab
  if (tab === 'map') {
    nextTick(() => {
      if (!mapInitialised) { mapInitialised = true; initMap() }
      else if (mapInstance) mapInstance.invalidateSize()
    })
  }
}

onBeforeUnmount(() => {
  if (mapInstance) { mapInstance.remove(); mapInstance = null }
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
    if (!mapInitialised) { mapInitialised = true; initMap() }
  }

  // Enrichment (non-blocking)
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${apiBase}/property/${propertyId}/enrichment`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.ok) enrichment.value = await res.json()
  } catch { /* non-critical */ }

  // HomeScore
  try {
    const pubRes = await fetch(`${apiBase}/property/${propertyId}/homescore/public`)
    if (pubRes.ok) {
      const hs = await pubRes.json()
      if (hs?.total) { homeScore.value = hs; homeScoreIsAuto.value = false }
    }

    const token = localStorage.getItem('token')
    if (token && !homeScore.value) {
      const hsRes = await fetch(`${apiBase}/property/${propertyId}/homescore`, { headers: { Authorization: `Bearer ${token}` } })
      if (hsRes.ok) {
        const hs = await hsRes.json()
        if (hs?.total) { homeScore.value = hs; homeScoreIsAuto.value = false }
      }
    }

    if (!homeScore.value) {
      const saved = localStorage.getItem(`homescore_answers_${propertyId}`)
      if (saved) {
        const { answers } = JSON.parse(saved)
        if (answers && Object.keys(answers).length > 0) {
          const { calculateScore } = await import('~/utils/homescoreScoring')
          const base = calculateScore(answers)
          homeScore.value = { ...base.breakdown, total: base.total, rating: base.rating }
          homeScoreIsAuto.value = Object.keys(answers).length < 11
        }
      }
    }
  } catch { /* non-critical */ }

  // EPC auto-score fallback
  if (!homeScore.value) {
    try {
      const { getPrefillFromProperty, calculateScore } = await import('~/utils/homescoreScoring')
      const epcPrefill = property.value ? getPrefillFromProperty(property.value) : {}
      const base = calculateScore(epcPrefill)
      homeScore.value = { ...base.breakdown, total: base.total, rating: base.rating }
      homeScoreIsAuto.value = true
    } catch { /* non-critical */ }
  }
})

// ── Actions ────────────────────────────────────────────────────────────────────
function handlePassportAction() {
  const s = passportStatus.value
  if (!s?.hasPassport) {
    router.push(`/verify-ownership/${propertyId}`)
  } else if (s.isOwner || s.isCollaborator) {
    router.push(`/passportview/${s.passportId}`)
  } else if (s.isBuyer && s.passportId) {
    router.push(`/buyer-passport/${s.passportId}`)
  } else if (!s.isPublished) {
    showUnpublishedModal.value = true
  } else {
    showClaimDrawer.value = true
  }
}

function goBack() { router.back() }

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

function handleShare() { /* share logic */ }

async function handleWishlist() {
  const result = await toggleWishlist(propertyId)
  let message = ''
  if (result === 'unauthenticated') message = 'Please log in to wishlist properties'
  else if (result === 'error') message = 'Something went wrong, please try again'
  else message = result.wishlisted ? 'Added to your wishlist' : 'Removed from wishlist'
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
  width: 36px; height: 36px;
  border: 3px solid #e0e0e0;
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.pp-back-txt { background: var(--brand); color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }

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
  top: 0; left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  z-index: 10;
}
.pp-icon-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  backdrop-filter: blur(6px);
}
.pp-icon-btn--active { color: #ef4444; }
.pp-hero-badges {
  position: absolute;
  bottom: 12px; left: 16px;
  display: flex;
  gap: 6px;
  z-index: 10;
}
.pp-badge-passport {
  background: #231d45;
  color: #fff;
  font-size: 10px; font-weight: 700;
  padding: 4px 11px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.pp-badge-flood {
  background: rgba(255,255,255,0.95);
  font-size: 10px; font-weight: 700;
  padding: 4px 11px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
.pp-badge-flood--low { color: #059669; border: 1px solid #d1fae5; }
.pp-badge-flood--med { color: #ea580c; border: 1px solid #fed7aa; }
.pp-badge-flood--high { color: #dc2626; border: 1px solid #fecaca; }

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
  font-size: 22px; font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 2px;
}
.pp-city {
  font-size: 14px; color: var(--ink-faint);
  margin: 0 0 10px;
}
.pp-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}
.pp-price {
  font-size: 28px; font-weight: 800;
  color: var(--brand);
  letter-spacing: -0.03em;
}
.pp-price-src {
  font-size: 11px; color: var(--ink-faint); line-height: 1.4;
}
.pp-pills {
  display: flex; gap: 7px; flex-wrap: wrap;
}
.pp-pill {
  background: #f1f5f9; color: var(--ink-soft);
  font-size: 12px; font-weight: 600;
  padding: 5px 11px; border-radius: 999px;
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
.pp-action-btn:last-child { border-right: none; }
.pp-action-btn:active { background: #f0fdf9; }

/* ── Content padding ── */
.pp-content-pad {
  padding: 16px 20px 0;
}

/* ── Section headers ── */
.pp-section-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px; font-weight: 800;
  color: var(--navy);
  margin-bottom: 10px;
  margin-top: 16px;
  letter-spacing: -0.01em;
}
.pp-section-sub {
  font-size: 11px; font-weight: 600; color: var(--ink-faint);
}
.pp-section-link {
  font-size: 11px; font-weight: 600; color: var(--brand); cursor: pointer;
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
  width: 110px; height: 62px;
  flex-shrink: 0;
}
.pp-gauge-num {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  text-align: center;
  font-size: 28px; font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
}
.pp-hs-summary { flex: 1; }
.pp-hs-title {
  font-size: 15px; font-weight: 800; color: var(--navy); margin-bottom: 4px;
}
.pp-hs-desc {
  font-size: 12px; color: var(--ink-soft); line-height: 1.55; margin-bottom: 8px;
}
.pp-hs-badge-pill {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid; border-radius: 999px;
  padding: 4px 10px; font-size: 10.5px; font-weight: 700; color: #92400e;
}
.pp-hs-badge-dot {
  width: 7px; height: 7px; border-radius: 50%;
}

/* EPC bars */
.pp-epc-section {
  border-top: 1px solid var(--line);
  padding-top: 14px;
}
.pp-epc-label {
  font-size: 11px; font-weight: 700; color: var(--ink-faint);
  text-transform: uppercase; letter-spacing: 0.06em;
  margin-bottom: 10px;
}
.pp-epc-bars {
  display: flex; flex-direction: column; gap: 9px; margin-bottom: 14px;
}
.pp-epc-row {
  display: flex; align-items: center; gap: 10px;
}
.pp-epc-name {
  font-size: 11px; color: var(--ink-soft); font-weight: 600;
  width: 70px; flex-shrink: 0;
}
.pp-epc-track {
  flex: 1; height: 6px; background: #f0eef8; border-radius: 999px; overflow: hidden;
}
.pp-epc-fill {
  height: 100%; border-radius: 999px; transition: width 0.6s ease;
}
.pp-epc-desc {
  font-size: 10.5px; font-weight: 600; color: var(--ink-soft);
  width: 100px; text-align: right; flex-shrink: 0;
}

/* Running costs */
.pp-costs {
  background: #f8f7fc; border: 1px solid var(--line);
  border-radius: 12px; padding: 12px 14px; margin-bottom: 14px;
}
.pp-costs-title {
  font-size: 10.5px; font-weight: 700; color: var(--ink-faint);
  text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;
}
.pp-costs-grid {
  display: flex; gap: 6px;
}
.pp-cost-box {
  flex: 1; text-align: center;
  background: #fff; border-radius: 8px; padding: 8px 4px;
  border: 1px solid var(--line);
}
.pp-cost-box--total { background: var(--navy); border-color: transparent; }
.pp-cost-val { font-size: 14px; font-weight: 800; color: var(--navy); }
.pp-cost-val--total { color: #fff; }
.pp-cost-lbl { font-size: 9.5px; color: var(--ink-faint); font-weight: 600; margin-top: 2px; }
.pp-cost-lbl--total { color: rgba(255,255,255,0.6); }
.pp-costs-note { font-size: 10.5px; color: var(--ink-faint); margin-top: 8px; line-height: 1.5; }

/* Homescore CTA */
.pp-hs-cta-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--brand-pale); border: 1px solid var(--brand-soft);
  border-radius: 12px; padding: 12px 14px; cursor: pointer;
}
.pp-hs-cta-title { font-size: 12.5px; font-weight: 700; color: var(--navy); margin-bottom: 2px; }
.pp-hs-cta-sub { font-size: 11px; color: var(--ink-soft); }
.pp-hs-cta-btn {
  border: none; padding: 9px 14px; border-radius: 10px;
  background: var(--brand); color: #fff;
  font-size: 12px; font-weight: 700; cursor: pointer;
  white-space: nowrap; flex-shrink: 0; font-family: inherit;
}

/* ── Property details ── */
.pp-details-card {
  background: #fff; border: 1.5px solid var(--line);
  border-radius: 16px; overflow: hidden; margin-bottom: 16px;
}
.pp-detail-row {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--line);
}
.pp-detail-row--last { border-bottom: none; }
.pp-detail-ic {
  width: 28px; height: 28px; border-radius: 8px;
  background: #f0fdf9; display: grid; place-items: center; flex-shrink: 0;
}
.pp-detail-lbl {
  font-size: 12px; color: var(--ink-soft); font-weight: 600;
  width: 90px; flex-shrink: 0;
}
.pp-detail-v {
  flex: 1; font-size: 13px; font-weight: 700; color: var(--ink);
}
.pp-detail-mono { font-family: monospace; font-size: 12px; }
.pp-detail-sub { color: var(--ink-faint); font-size: 11px; font-weight: 500; }
.pp-epc-score-pill {
  background: #fef3c7; color: #92400e; font-size: 10px; font-weight: 700;
  padding: 2px 7px; border-radius: 999px; margin-left: 4px;
}
.pp-flood-pill {
  font-size: 10px; font-weight: 700; padding: 2px 7px;
  border-radius: 999px; margin-left: 4px;
}

/* ── Price history ── */
.pp-price-history {
  background: #fff; border: 1.5px solid var(--line);
  border-radius: 16px; padding: 4px 16px; margin-bottom: 16px;
}
.pp-sold-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 0; border-bottom: 1px solid var(--line);
}
.pp-sold-row:last-child { border-bottom: none; }
.pp-sold-price { font-size: 13.5px; font-weight: 700; color: var(--ink); }
.pp-sold-meta { font-size: 11.5px; color: var(--ink-faint); margin-top: 1px; }
.pp-sold-badge {
  background: #f1f5f9; color: var(--ink-soft);
  font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
}
.pp-sold-badge--current {
  background: var(--brand-pale); color: #065f46;
  border: 1px solid var(--brand-soft);
}

/* ── Location tabs ── */
.pp-loc-tabs {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 4px;
  background: var(--line); border-radius: 14px; padding: 3px; margin-bottom: 10px;
}
.pp-loc-tab {
  border-radius: 10px; padding: 8px 4px;
  font-size: 11px; font-weight: 600;
  background: transparent; border: none; color: var(--ink-soft);
  cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.pp-loc-tab--on { background: #fff; color: var(--navy); font-weight: 700; }

/* Map */
.pp-map {
  height: 220px; border-radius: 16px;
  overflow: hidden; margin-bottom: 10px; z-index: 1;
}
.pp-map-legend {
  display: flex; flex-wrap: wrap; gap: 10px;
  padding: 4px 0 12px;
}
.pp-legend-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--ink-soft); font-weight: 600;
}
.pp-legend-dot {
  width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
}

/* Street view */
.pp-street-scene {
  position: relative; height: 180px; border-radius: 16px;
  overflow: hidden; margin-bottom: 10px;
  background: linear-gradient(160deg, #2a3f4a, #1a2d38);
}
.pp-street-label {
  position: absolute; top: 10px; left: 10px;
  background: rgba(0,0,0,0.5); color: #fff;
  font-size: 10px; font-weight: 700; padding: 3px 8px;
  border-radius: 6px; letter-spacing: 0.04em;
}
.pp-street-pin {
  position: absolute; bottom: 10px; left: 10px;
  background: rgba(0,161,154,0.9); color: #fff;
  font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 999px;
}
.pp-nearby-sold-card {
  background: #fff; border: 1.5px solid var(--line);
  border-radius: 14px; padding: 4px 16px; margin-bottom: 12px;
}
.pp-nearby-sold-title {
  font-size: 12px; font-weight: 700; color: var(--ink-faint);
  text-transform: uppercase; letter-spacing: 0.06em; padding: 10px 0 4px;
}

/* Nearby lists */
.pp-nearby-card {
  background: #fff; border: 1.5px solid var(--line);
  border-radius: 14px; overflow: hidden; margin-bottom: 12px;
}
.pp-nearby-empty { padding: 20px; text-align: center; font-size: 13px; color: var(--ink-faint); }
.pp-nearby-list { padding: 0 16px; }
.pp-nearby-item {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 0; border-bottom: 1px solid var(--line);
}
.pp-nearby-item:last-child { border-bottom: none; }
.pp-nearby-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: grid; place-items: center; font-size: 14px; flex-shrink: 0;
}
.pp-nearby-icon--blue { background: #dbeafe; }
.pp-nearby-icon--purple { background: #ede9fe; }
.pp-nearby-icon--amber { background: #fef3c7; }
.pp-nearby-icon--sky { background: #e0f2fe; }
.pp-nearby-info { flex: 1; min-width: 0; }
.pp-nearby-name { font-size: 13px; font-weight: 700; color: var(--ink); }
.pp-nearby-meta { font-size: 11px; color: var(--ink-faint); margin-top: 1px; }
.pp-ofsted-badge {
  font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
}
.pp-ofsted--outstanding { background: #d1fae5; color: #065f46; }
.pp-ofsted--good { background: #fef3c7; color: #92400e; }
.pp-ofsted--other { background: #f1f5f9; color: var(--ink-soft); }
.pp-transport-badge {
  font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 999px;
}
.pp-transport-badge--purple { background: #ede9fe; color: #5b21b6; }
.pp-transport-badge--amber { background: #fef3c7; color: #92400e; }
.pp-transport-badge--sky { background: #e0f2fe; color: #0369a1; }

/* ── Full details card ── */
.pp-full-details-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.pp-full-details-card:active { border-color: var(--brand-soft); background: var(--brand-pale); }
.pp-full-details-ic {
  width: 40px;
  height: 40px;
  background: var(--brand-pale);
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
}
.pp-full-details-body { flex: 1; min-width: 0; }
.pp-full-details-title {
  font-size: 13.5px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 2px;
}
.pp-full-details-sub {
  font-size: 11.5px;
  color: var(--ink-soft);
  line-height: 1.4;
}
.pp-full-details-chev { color: var(--ink-faint); flex-shrink: 0; }

/* ── Passport unlock card ── */
.pp-unlock-card {
  background: linear-gradient(150deg, #231d45 0%, #1a3a4a 100%);
  border-radius: 20px; padding: 22px 20px;
  margin-bottom: 20px; cursor: pointer;
  position: relative; overflow: hidden;
}
.pp-unlock-eyebrow {
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 8px;
}
.pp-unlock-price-row {
  display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px;
}
.pp-unlock-price { font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -1px; }
.pp-unlock-price-note { font-size: 13px; color: rgba(255,255,255,0.6); }
.pp-unlock-desc {
  font-size: 12.5px; color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 16px;
}
.pp-unlock-features { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
.pp-unlock-feat {
  display: flex; align-items: center; gap: 10px;
  padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);
}
.pp-unlock-feat--last { border-bottom: none; padding-bottom: 0; }
.pp-unlock-feat-ic {
  width: 28px; height: 28px; background: rgba(0,161,154,0.2);
  border-radius: 8px; display: grid; place-items: center;
  flex-shrink: 0; font-size: 14px;
}
.pp-unlock-feat-body { flex: 1; }
.pp-unlock-feat-title { font-size: 12.5px; font-weight: 700; color: #fff; }
.pp-unlock-feat-sub { font-size: 11px; color: rgba(255,255,255,0.5); }
.pp-unlock-check { color: #5eead4; font-size: 11px; font-weight: 700; }
.pp-unlock-btn {
  width: 100%; border: none; padding: 15px;
  border-radius: 13px; font-size: 15px; font-weight: 800;
  cursor: pointer; background: #5eead4; color: #231d45;
  letter-spacing: -0.01em; font-family: inherit;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.pp-unlock-note { text-align: center; font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 8px; }

/* ── Unpublished modal ── */
.unpub-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 1000; padding: 20px;
}
.unpub-modal {
  background: #fff; border-radius: 20px; padding: 28px 24px;
  width: 100%; max-width: 480px; position: relative;
}
.unpub-icon {
  width: 52px; height: 52px; background: #f0fdf9;
  border-radius: 16px; display: grid; place-items: center; margin-bottom: 16px;
}
.unpub-title { font-size: 18px; font-weight: 800; color: var(--navy); margin: 0 0 10px; }
.unpub-body { font-size: 14px; color: var(--ink-soft); line-height: 1.6; margin: 0 0 20px; }
.unpub-actions { display: flex; gap: 10px; margin-bottom: 4px; }
.unpub-btn-secondary {
  flex: 1; padding: 13px; border-radius: 12px;
  border: 1.5px solid var(--line); background: #fff;
  font-size: 14px; font-weight: 700; color: var(--ink); cursor: pointer; font-family: inherit;
}
.unpub-btn-primary {
  flex: 1; padding: 13px; border-radius: 12px;
  border: none; background: var(--brand);
  font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; font-family: inherit;
}
.unpub-close {
  position: absolute; top: 16px; right: 16px;
  background: #f4f4f8; border: none; border-radius: 50%;
  width: 32px; height: 32px; display: grid; place-items: center; cursor: pointer;
}

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
