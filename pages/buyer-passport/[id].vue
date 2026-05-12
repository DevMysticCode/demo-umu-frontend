<template>
  <div class="mobile-container buyer-page min-h-screen">
    <!-- Loading -->
    <div v-if="loading" class="buyer-loading">
      <div class="buyer-spinner" />
      <p>Loading passport...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="buyer-loading">
      <p>{{ error }}</p>
    </div>

    <!-- Content -->
    <template v-else-if="data">
      <!-- Hero Image -->
      <!-- Hero Image — full slider with nav overlay -->
      <div class="buyer-hero">
        <ImageSlider :images="propertyImagesArr">
          <template #overlay>
            <!-- Passport badge -->
            <!-- <div class="buyer-hero__badge">
              <img
                src="/op-icons/passportview/umu-passport.png"
                alt="Property Passport"
                class="buyer-hero__badge-passport"
              />
            </div> -->
            <!-- Nav buttons -->
            <div class="buyer-hero__nav">
              <button class="hero-btn" @click="goBack">
                <OPIcon name="leftChevronWhite" class="w-[16px] h-[16px]" />
              </button>
              <div class="flex gap-3">
                <button
                  class="hero-btn"
                  aria-label="Take a quick tour"
                  @click="buyerTourRef?.start?.()"
                >
                  <span style="font-weight:800;font-size:13px">?</span>
                </button>
                <button class="hero-btn">
                  <OPIcon name="wishlist" class="w-[18px] h-[18px]" />
                </button>
                <button class="hero-btn" @click="openShareSheet">
                  <OPIcon name="share" class="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </template>
        </ImageSlider>
      </div>

      <!-- White content card -->
      <div class="buyer-card">
        <!-- Premium hero — passport book + identity + 3-cell stat strip -->
        <div class="buyer-hero-card" data-tour="hero">
          <div class="buyer-hero-glow" />
          <div class="buyer-hero-book">
            <PassportCard
              :line1="data.passport.addressLine1"
              :line2="data.passport.postcode"
            />
          </div>
          <div class="buyer-hero-info">
            <div class="buyer-hero-eyebrow">Verified Property Passport</div>
            <div class="buyer-hero-addr">{{ data.passport.addressLine1 }}</div>
            <div class="buyer-hero-sub">{{ cityLine }}</div>
            <div class="buyer-hero-stats">
              <div class="buyer-hero-stat">
                <div
                  class="buyer-hero-stat-val"
                  :class="{
                    'buyer-hero-stat-val--brand':
                      typeof heroHsScore === 'number',
                  }"
                >
                  {{ heroHsScore }}
                </div>
                <div class="buyer-hero-stat-lbl">HS</div>
              </div>
              <div class="buyer-hero-stat">
                <div class="buyer-hero-stat-val">{{ heroDocsCount }}</div>
                <div class="buyer-hero-stat-lbl">Docs</div>
              </div>
              <div class="buyer-hero-stat">
                <div
                  class="buyer-hero-stat-val buyer-hero-stat-val--ready"
                >
                  {{ overallProgressPct }}%
                </div>
                <div class="buyer-hero-stat-lbl">Answered</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Address / Price -->
        <div class="buyer-title-block">
          <h1 class="buyer-address">{{ data.passport.addressLine1 }}</h1>
          <p class="buyer-city">
            {{ cityLine }}
          </p>
          <p class="buyer-price" v-if="data.property?.estimatedPrice">
            {{ formatPrice(data.property.estimatedPrice) }}
            <span class="buyer-estimated">Estimated Value</span>
          </p>

          <!-- Confidence / red-flag inline pill — anchors to the red-flags
               card lower down on tap -->
          <button
            class="buyer-risk-pill"
            :class="riskPillClass"
            @click="scrollToRedFlags"
          >
            <template v-if="redFlags.length === 0">
              ✓ {{ overallProgressPct }}% complete · 0 red flags
            </template>
            <template v-else>
              ⚠ {{ redFlags.length }} attention
              {{ redFlags.length === 1 ? 'item' : 'items' }} ·
              {{ overallProgressPct }}% complete
            </template>
          </button>
        </div>

        <!-- Resume — last viewed buyer section, persisted per-passport -->
        <button
          v-if="resumeSection"
          class="buyer-resume"
          @click="goToResumeSection"
        >
          <div class="buyer-resume-ic">↪</div>
          <div class="buyer-resume-body">
            <div class="buyer-resume-eyebrow">Pick up where you left off</div>
            <div class="buyer-resume-title">{{ resumeSection.title }}</div>
          </div>
          <div class="buyer-resume-chev">›</div>
        </button>

        <!-- Badges -->
        <div class="buyer-badges" v-if="data.property">
          <span v-if="data.property.bedrooms" class="buyer-badge">
            <OPIcon name="bedroomWhite" class="w-[13px] h-[13px]" />
            {{ data.property.bedrooms }}
          </span>
          <span v-if="data.property.bathrooms" class="buyer-badge">
            <OPIcon name="bathroomWhite" class="w-[13px] h-[13px]" />
            {{ data.property.bathrooms }}
          </span>
          <span v-if="data.property.propertyType" class="buyer-badge">
            {{ data.property.propertyType }}
          </span>
          <span v-if="data.property.sqft" class="buyer-badge">
            <OPIcon name="sqftWhite" class="w-[13px] h-[13px]" />
            {{ data.property.sqft.toLocaleString() }} sqft
          </span>
        </div>

        <!-- Property Details -->
        <div class="buyer-section">
          <h2 class="buyer-section-title">Property Details</h2>
          <p class="buyer-section-sub">
            Key characteristics that define this property.
          </p>
          <div class="buyer-details-card" v-if="data.property">
            <div class="buyer-details-grid">
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="buyerPropertyType" class="w-[20px] h-[20px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Property type</p>
                  <p class="buyer-detail-value">
                    {{ data.property.propertyType || '—' }}
                  </p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="buyerTitleNumber" class="w-[20px] h-[20px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Title number</p>
                  <p class="buyer-detail-value">
                    {{ data.property.titleNumber || '—' }}
                  </p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="buyerAreaSqft" class="w-[20px] h-[20px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Area sqft</p>
                  <p class="buyer-detail-value">
                    {{
                      data.property.sqft
                        ? data.property.sqft.toLocaleString() + ' sqft'
                        : '—'
                    }}
                  </p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="buyerEpcRating" class="w-[20px] h-[20px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">EPC Rating</p>
                  <p class="buyer-detail-value">
                    {{ data.property.epcRating || '—' }}
                  </p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="buyerTenure" class="w-[20px] h-[20px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Tenure</p>
                  <p class="buyer-detail-value">
                    {{ displayTenure }}
                  </p>
                </div>
              </div>
              <div class="buyer-detail-item">
                <div class="buyer-detail-icon-wrap">
                  <OPIcon name="buyerYearBuilt" class="w-[20px] h-[20px]" />
                </div>
                <div>
                  <p class="buyer-detail-label">Year Built</p>
                  <p class="buyer-detail-value">
                    {{ data.property.yearBuilt || '—' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Expert Guidance -->
        <div class="buyer-section">
          <!-- <h2 class="buyer-section-title">Need Expert Guidance?</h2>
          <p class="buyer-section-sub">
            Get professional advice from a qualified property expert.
          </p> -->
          <UnderReview
            title="Connect with a Property Expert"
            description="Our verified solicitors and surveyors are ready to review this passport with you."
            minimumTime="1 Day"
            @viewProfile="router.push('/experts')"
          />
        </div>

        <!-- PDF Download -->
        <div class="buyer-pdf-row">
          <div class="buyer-pdf-info">
            <p class="buyer-pdf-title">Full Property Report</p>
            <p class="buyer-pdf-sub">
              All questions &amp; answers — share with solicitors
            </p>
          </div>
          <button
            class="buyer-pdf-btn"
            :disabled="generatingPdf"
            @click="downloadPdf"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="7,10 12,15 17,10"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="15"
                x2="12"
                y2="3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            {{ generatingPdf ? 'Opening…' : 'Download PDF' }}
          </button>
        </div>

        <!-- TA6 Form Download -->
        <div class="buyer-pdf-row buyer-ta6-row">
          <div class="buyer-pdf-info">
            <p class="buyer-pdf-title">TA6 Property Information Form</p>
            <p class="buyer-pdf-sub">
              Law Society 6th edition — pre-filled with passport data
            </p>
          </div>
          <button
            class="buyer-pdf-btn buyer-ta6-btn"
            :disabled="generatingTA6"
            @click="downloadTA6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <polyline
                points="9,15 12,18 15,15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ generatingTA6 ? 'Opening…' : 'Download TA6' }}
          </button>
        </div>

        <!-- TA7 Form — leasehold only -->
        <div
          v-if="data?.property?.isLeasehold"
          class="buyer-pdf-row buyer-ta7-row"
        >
          <div class="buyer-pdf-info">
            <p class="buyer-pdf-title">TA7 Leasehold Information Form</p>
            <p class="buyer-pdf-sub">
              Law Society 5th edition — lease, ground rent &amp; service charge
              details
            </p>
          </div>
          <button
            class="buyer-pdf-btn buyer-ta7-btn"
            :disabled="generatingTA7"
            @click="downloadTA7"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <polyline
                points="9,15 12,18 15,15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ generatingTA7 ? 'Opening…' : 'Download TA7' }}
          </button>
        </div>

        <!-- TA10 Fixtures & Fittings Form -->
        <div class="buyer-pdf-row buyer-ta10-row">
          <div class="buyer-pdf-info">
            <p class="buyer-pdf-title">TA10 Fixtures &amp; Fittings Form</p>
            <p class="buyer-pdf-sub">
              What stays, what goes — pre-filled from seller's passport
            </p>
          </div>
          <button
            class="buyer-pdf-btn buyer-ta10-btn"
            :disabled="generatingTA10"
            @click="downloadTA10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="14,2 14,8 20,8"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="18"
                x2="12"
                y2="12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <polyline
                points="9,15 12,18 15,15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ generatingTA10 ? 'Opening…' : 'Download TA10' }}
          </button>
        </div>

        <!-- Seller Progress -->
        <div class="buyer-progress-card">
          <div class="buyer-progress-header">
            <span class="buyer-progress-label">Seller Completion</span>
            <span class="buyer-progress-pct">{{ passportProgress }}%</span>
          </div>
          <div class="buyer-progress-track">
            <div
              class="buyer-progress-fill"
              :style="{ width: passportProgress + '%' }"
            />
          </div>
          <p class="buyer-progress-hint">
            {{
              passportProgress === 100
                ? 'All sections completed by the seller.'
                : 'The seller is still completing some sections.'
            }}
          </p>
        </div>

        <!-- Red Flags -->
        <div
          v-if="redFlags.length"
          class="buyer-redflags-card"
          data-tour="redflags"
        >
          <div class="buyer-redflags-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#dc2626"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
                stroke="#dc2626"
                stroke-width="2"
                stroke-linecap="round"
              />
              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
                stroke="#dc2626"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span
              >{{ redFlags.length }} potential issue{{
                redFlags.length > 1 ? 's' : ''
              }}
              flagged</span
            >
          </div>
          <ul class="buyer-redflags-list">
            <li v-for="flag in redFlags" :key="flag">{{ flag }}</li>
          </ul>
        </div>

        <!-- Official Records -->
        <div class="buyer-section">
          <h2 class="buyer-section-title">Official Records</h2>
          <p class="buyer-section-sub">
            Verified documents that define the legal and structural status of
            the property.
          </p>

          <!-- Search -->
          <div class="buyer-search-row">
            <div class="buyer-search-input">
              <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                class="buyer-search-icon"
              >
                <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2" />
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="#999"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search Records..."
              />
            </div>
            <button class="buyer-sort-btn">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M3 6h18M6 12h12M9 18h6"
                  stroke="#00a19a"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Section completion summary — sets expectation for the list below -->
          <div
            v-if="data.sections?.length"
            class="buyer-summary-card"
            data-tour="records"
          >
            <div class="buyer-summary-row">
              <div class="buyer-summary-stat">
                <div class="buyer-summary-num buyer-summary-num--done">
                  {{ summaryStats.done }}
                </div>
                <div class="buyer-summary-lbl">Fully answered</div>
              </div>
              <div class="buyer-summary-stat">
                <div class="buyer-summary-num buyer-summary-num--partial">
                  {{ summaryStats.partial }}
                </div>
                <div class="buyer-summary-lbl">Partially</div>
              </div>
              <div class="buyer-summary-stat">
                <div class="buyer-summary-num buyer-summary-num--empty">
                  {{ summaryStats.empty }}
                </div>
                <div class="buyer-summary-lbl">Not yet shared</div>
              </div>
            </div>
            <p class="buyer-summary-hint">
              Sellers earn the most from completing every section. Tap any
              below to see what's been shared so far.
            </p>
          </div>

          <!-- Records List — passportview-style section cards -->
          <div class="buyer-records-list">
            <div
              v-for="section in filteredSections"
              :key="section.id"
              class="buyer-record-row"
              :class="'state-' + sectionCompletion(section)"
              @click="goToSection(section.id)"
            >
              <div class="buyer-record-icon">
                <OPIcon
                  :name="section.imageKey || 'fittingsContents'"
                  class="w-[60px] h-[60px]"
                />
              </div>
              <div class="buyer-record-info">
                <h3 class="buyer-record-title">{{ section.title }}</h3>
                <p
                  v-if="section.subtitle || section.description"
                  class="buyer-record-sub"
                >
                  {{ section.subtitle || section.description }}
                </p>
                <div class="buyer-record-meta">
                  <span
                    class="buyer-record-pill"
                    :class="'pill--' + sectionCompletion(section)"
                  >
                    <template v-if="sectionCompletion(section) === 'complete'">
                      ✓ Fully answered
                    </template>
                    <template
                      v-else-if="sectionCompletion(section) === 'partial'"
                    >
                      ⏳ Partially answered
                    </template>
                    <template v-else>○ Not started</template>
                  </span>
                </div>
                <div class="buyer-record-progress">
                  <div class="buyer-record-track">
                    <div
                      class="buyer-record-fill"
                      :class="'fill--' + sectionCompletion(section)"
                      :style="{ width: sectionPct(section) + '%' }"
                    />
                  </div>
                  <span class="buyer-record-pct">
                    {{ sectionPct(section) }}%
                  </span>
                </div>
              </div>
              <button class="buyer-record-arrow">
                <OPIcon name="caretRight" class="w-[13px] h-[13px]" />
              </button>
            </div>
          </div>
        </div>

        <!-- Comparable Sales -->
        <div v-if="comparables.length" class="buyer-section">
          <h2 class="buyer-section-title">Nearby Sold Prices</h2>
          <p class="buyer-section-sub">
            Recent Land Registry sales in the same postcode area.
          </p>
          <div class="buyer-comparables-list">
            <div
              v-for="(comp, i) in comparables"
              :key="i"
              class="buyer-comp-row"
            >
              <div class="buyer-comp-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    stroke="#00a19a"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <polyline
                    points="9,22 9,12 15,12 15,22"
                    stroke="#00a19a"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="buyer-comp-info">
                <p class="buyer-comp-address">{{ comp.address }}</p>
                <p class="buyer-comp-meta">
                  {{ comp.propertyType
                  }}<template v-if="comp.tenure"> · {{ comp.tenure }}</template>
                  · {{ formatSaleDate(comp.date) }}
                </p>
              </div>
              <span class="buyer-comp-price">{{
                formatSalePrice(comp.price)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Notes FAB -->
    <Teleport to="body">
      <button
        v-if="data"
        class="notes-fab"
        @click="showNotesSheet = true"
        :title="
          notes.length
            ? `${notes.length} note${notes.length > 1 ? 's' : ''}`
            : 'Add note'
        "
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span v-if="notes.length" class="notes-fab-badge">{{
          notes.length
        }}</span>
      </button>

      <!-- Notes Sheet -->
      <div
        v-if="showNotesSheet"
        class="sheet-backdrop"
        @click.self="showNotesSheet = false"
      >
        <div class="sheet-panel">
          <div class="sheet-handle" />
          <div class="sheet-header">
            <h3 class="sheet-title">My Notes</h3>
            <button class="sheet-close" @click="showNotesSheet = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#333"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Add note -->
          <div class="notes-compose">
            <textarea
              v-model="newNoteText"
              placeholder="Type a note about this property..."
              class="notes-textarea"
              rows="3"
            />
            <button
              class="notes-save-btn"
              :disabled="!newNoteText.trim() || savingNote"
              @click="saveNote"
            >
              {{ savingNote ? 'Saving…' : 'Save Note' }}
            </button>
          </div>

          <!-- Notes list -->
          <div class="notes-list">
            <div v-if="notes.length === 0" class="notes-empty">
              No notes yet. Add your first note above.
            </div>
            <div v-for="note in notes" :key="note.id" class="note-item">
              <p class="note-text">{{ note.text }}</p>
              <div class="note-footer">
                <span class="note-date">{{
                  new Date(note.createdAt).toLocaleDateString('en-GB')
                }}</span>
                <button class="note-delete" @click="deleteNote(note.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <polyline
                      points="3,6 5,6 21,6"
                      stroke="#dc2626"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                      stroke="#dc2626"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M10 11v6M14 11v6M9 6V4h6v2"
                      stroke="#dc2626"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Share Sheet -->
      <div
        v-if="showShareSheet"
        class="sheet-backdrop"
        @click.self="showShareSheet = false"
      >
        <div class="sheet-panel">
          <div class="sheet-handle" />
          <div class="sheet-header">
            <h3 class="sheet-title">Share Passport</h3>
            <button class="sheet-close" @click="showShareSheet = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#333"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <div v-if="!shareUrl" class="share-intro">
            <p class="share-hint">
              Generate a link that lets anyone view this passport for 3 hours —
              no login required.
            </p>
            <button
              class="share-generate-btn"
              :disabled="sharing"
              @click="createShareLink"
            >
              {{ sharing ? 'Generating…' : 'Generate Share Link' }}
            </button>
          </div>

          <div v-else class="share-result">
            <p class="share-expires">Expires at {{ shareExpiry }}</p>
            <div class="share-url-row">
              <span class="share-url-text">{{ shareUrl }}</span>
              <button class="share-copy-btn" @click="copyShareLink">
                {{ shareCopied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <button
              class="share-generate-btn share-regenerate"
              @click="createShareLink"
              :disabled="sharing"
            >
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Sticky bottom action bar — Save / Ask seller — shown only when
         data is loaded so it doesn't blink during the spinner state. -->
    <Transition name="buyer-toast">
      <div v-if="saveToast" class="buyer-save-toast">{{ saveToast }}</div>
    </Transition>
    <div v-if="data" class="buyer-action-bar">
      <button
        class="buyer-action-save"
        :class="{ 'is-saved': isSavedToProfile }"
        @click="toggleSaveToProfile"
      >
        <span class="buyer-action-heart">
          {{ isSavedToProfile ? '♥' : '♡' }}
        </span>
        {{ isSavedToProfile ? 'Saved' : 'Save to Profile' }}
      </button>
      <button class="buyer-action-ask" data-tour="ask" @click="askSeller">
        💬 Ask the seller
      </button>
    </div>

    <!-- Guided tour — auto-runs once per browser, replays from "?" in hero -->
    <OnboardingTour
      ref="buyerTourRef"
      :steps="buyerTourSteps"
      storage-key="umu_tour_buyer_passport_v1"
    />
  </div>
</template>

<script setup lang="ts">
import OPIcon from '~/components/ui/OPIcon.vue'
import ImageSlider from '~/components/ui/ImageSlider.vue'
import OnboardingTour from '~/components/ui/OnboardingTour.vue'
import PassportCard from '~/components/passport-view/PassportCard.vue'

// Guided tour for buyers — surfaces the things they care about most.
const buyerTourRef = ref<any>(null)
const buyerTourSteps = [
  {
    selector: '[data-tour="hero"]',
    title: 'Verified property record',
    body: 'Address, HomeScore, document count and how much of the seller\'s record has been completed.',
  },
  {
    selector: '.buyer-card',
    title: 'Everything in one place',
    body: 'Documents, surveys, the seller\'s answers and the property history — no more chasing for paperwork.',
  },
  {
    selector: '[data-tour="records"]',
    title: 'Tap any section',
    body: 'See exactly what the seller has shared. Green means fully answered, amber is partial.',
  },
  {
    selector: '[data-tour="redflags"]',
    title: 'Red flags surface here',
    body: 'If anything needs attention you\'ll see it called out in amber so it doesn\'t catch you off guard.',
  },
  {
    selector: '[data-tour="ask"]',
    title: 'Ask the seller',
    body: 'Open a pre-filled chat with anything you want to clarify before you offer.',
  },
]
import UnderReview from '~/components/passport-view/UnderReview.vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const passportId = route.params.id as string

const { generatePdf } = usePassportPdf()
const { generateTA6 } = useTA6Pdf()
const { generateTA7 } = useTA7Pdf()
const { generateFixturesFittings } = useFixturesFittingsPdf()

const data = ref<any>(null)
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')
const generatingPdf = ref(false)
const generatingTA6 = ref(false)
const generatingTA7 = ref(false)
const generatingTA10 = ref(false)

// Share sheet
const showShareSheet = ref(false)
const shareUrl = ref('')
const shareExpiry = ref('')
const sharing = ref(false)
const shareCopied = ref(false)

// Comparables
const comparables = ref<any[]>([])

// Notes
const showNotesSheet = ref(false)
const notes = ref<any[]>([])
const newNoteText = ref('')
const savingNote = ref(false)

onMounted(async () => {
  try {
    const tok =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    data.value = await $fetch(
      `${config.public.apiBase}/passport/${passportId}/buyer-view`,
      { headers: { Authorization: `Bearer ${tok}` } },
    )
    await Promise.all([loadComparables(), loadNotes()])
    loadResumeSection()
  } catch (e: any) {
    error.value = e?.data?.message || 'Failed to load passport.'
  } finally {
    loading.value = false
  }
})

const propertyImagesArr = computed<string[]>(() => {
  const uploaded = data.value?.property?.images as string[] | null
  if (uploaded?.length) return uploaded
  const imageUrl = data.value?.property?.imageUrl
  if (imageUrl) return [imageUrl]
  return []
})

const propertyImage = computed(() => {
  const uploaded = data.value?.property?.images as string[] | null
  if (uploaded?.length) return uploaded[0]
  return (
    data.value?.property?.imageUrl ||
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'
  )
})

const cityLine = computed(() => {
  const p = data.value?.property
  if (!p) return data.value?.passport?.postcode || ''
  return [p.city || p.county, p.postcode].filter(Boolean).join(', ')
})

// Normalize tenure — EPC returns occupancy type, not legal tenure (freehold/leasehold)
const displayTenure = computed(() => {
  const raw = (data.value?.property?.tenure || '').trim()
  if (!raw) return '—'
  const lower = raw.toLowerCase()
  if (lower === 'f' || lower === 'freehold') return 'Freehold'
  if (lower === 'l' || lower === 'leasehold') return 'Leasehold'
  // EPC occupancy values are not legal tenure — suppress them
  if (
    lower.includes('owner-occupied') ||
    lower.includes('rented') ||
    lower.includes('unknown')
  )
    return '—'
  return raw
})

// Overall seller completion percentage
const passportProgress = computed(() => {
  if (!data.value?.sections) return 0
  let total = 0
  let answered = 0
  for (const section of data.value.sections) {
    for (const task of section.tasks || []) {
      for (const q of task.questions || []) {
        total++
        if (q.answer) answered++
      }
    }
  }
  return total === 0 ? 0 : Math.round((answered / total) * 100)
})

// ── Premium hero stat strip ──────────────────────────────────────
const overallProgressPct = computed(() => passportProgress.value)
const heroHsScore = computed(() => {
  const score =
    data.value?.property?.homeScore ?? data.value?.property?.epcScore
  return typeof score === 'number' ? score : '—'
})
const heroDocsCount = computed(() => {
  if (!data.value?.sections) return 0
  let n = 0
  for (const s of data.value.sections) {
    for (const t of s.tasks || []) {
      for (const q of t.questions || []) {
        if (q.answer?.fileUrl) n++
      }
    }
  }
  return n
})

// ── Risk pill (next to price) — anchors to red-flags card ────────
const riskPillClass = computed(() =>
  // declared lazily — `redFlags` is defined further down in the script
  // but Vue's reactivity resolves at render time, so this is fine.
  // eslint-disable-next-line
  (typeof redFlags !== 'undefined' && redFlags.value?.length)
    ? 'risk-pill--warn'
    : 'risk-pill--ok',
)
function scrollToRedFlags() {
  if (typeof document === 'undefined') return
  const el = document.querySelector('.buyer-redflags-card')
  if (el && 'scrollIntoView' in el) {
    ;(el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// ── Section completion summary stats ─────────────────────────────
const summaryStats = computed(() => {
  const stats = { done: 0, partial: 0, empty: 0 }
  for (const s of data.value?.sections ?? []) {
    let total = 0
    let answered = 0
    for (const t of s.tasks || []) {
      for (const q of t.questions || []) {
        if (q.type === 'NOTE') continue
        total++
        if (q.answer && (q.answer.answerText || q.answer.answerJson || q.answer.fileUrl)) {
          answered++
        }
      }
    }
    if (total === 0 || answered === 0) stats.empty++
    else if (answered === total) stats.done++
    else stats.partial++
  }
  return stats
})

// ── Resume section — last viewed by this buyer (per-passport key) ──
const resumeSectionId = ref<string | null>(null)
const resumeSection = computed(() => {
  if (!resumeSectionId.value) return null
  return (
    data.value?.sections?.find((s: any) => s.id === resumeSectionId.value) ?? null
  )
})
function rememberSectionVisit(sectionId: string) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(`umu_buyer_resume_${passportId}`, sectionId)
  } catch {
    /* no-op */
  }
}
function loadResumeSection() {
  if (typeof localStorage === 'undefined') return
  try {
    resumeSectionId.value = localStorage.getItem(
      `umu_buyer_resume_${passportId}`,
    )
  } catch {
    resumeSectionId.value = null
  }
}
function goToResumeSection() {
  if (resumeSection.value?.id) {
    router.push(
      `/buyer-passport/section/${resumeSection.value.id}?passportId=${passportId}`,
    )
  }
}

// ── Sticky bottom action bar ─────────────────────────────────────
const isSavedToProfile = ref(false)
const saveToast = ref('')
function toggleSaveToProfile() {
  // Optimistic UX — flips the heart and shows a quick toast.
  isSavedToProfile.value = !isSavedToProfile.value
  saveToast.value = isSavedToProfile.value
    ? 'Saved to your Buyer Profile'
    : 'Removed from your Buyer Profile'
  setTimeout(() => (saveToast.value = ''), 2200)
  // The real save endpoint can hook in here later.
}
function askSeller() {
  const url = `/contact/${data.value?.passport?.id ?? passportId}?prefill=I've reviewed the Passport — I'd like to ask about…`
  router.push(url)
}

// Red flag patterns scanned from all answer text
const RED_FLAG_PATTERNS = [
  {
    regex: /planning.*(notice|enforcement|objection)/i,
    label: 'Planning enforcement notice',
  },
  { regex: /asbestos/i, label: 'Asbestos reported' },
  { regex: /japanese knotweed/i, label: 'Japanese Knotweed present' },
  { regex: /subsidence/i, label: 'Subsidence mentioned' },
  { regex: /flood(ing)?/i, label: 'Flooding risk flagged' },
  { regex: /restrictive covenant/i, label: 'Restrictive covenant present' },
  { regex: /boundary dispute/i, label: 'Boundary dispute noted' },
]

const redFlags = computed(() => {
  if (!data.value?.sections) return []
  const flags: string[] = []
  for (const section of data.value.sections) {
    for (const task of section.tasks || []) {
      for (const q of task.questions || []) {
        const text = [
          q.answer?.answerText ?? '',
          JSON.stringify(q.answer?.answerJson ?? ''),
        ].join(' ')
        for (const pattern of RED_FLAG_PATTERNS) {
          if (pattern.regex.test(text) && !flags.includes(pattern.label)) {
            flags.push(pattern.label)
          }
        }
      }
    }
  }
  return flags
})

// Returns completion status for a section
function sectionCompletion(section: any): 'complete' | 'partial' | 'empty' {
  let total = 0
  let answered = 0
  for (const task of section.tasks || []) {
    for (const q of task.questions || []) {
      total++
      if (q.answer) answered++
    }
  }
  if (total === 0 || answered === 0) return 'empty'
  if (answered === total) return 'complete'
  return 'partial'
}

// Percentage answered, used by the section card's progress bar.
function sectionPct(section: any): number {
  let total = 0
  let answered = 0
  for (const task of section.tasks || []) {
    for (const q of task.questions || []) {
      total++
      if (q.answer) answered++
    }
  }
  if (!total) return 0
  return Math.round((answered / total) * 100)
}

const filteredSections = computed(() => {
  if (!data.value?.sections) return []
  const q = searchQuery.value.toLowerCase()
  if (!q) return data.value.sections
  return data.value.sections.filter(
    (s: any) =>
      s.title.toLowerCase().includes(q) ||
      (s.subtitle || '').toLowerCase().includes(q),
  )
})

function formatPrice(price: number) {
  return '£' + price.toLocaleString('en-GB')
}

function formatSalePrice(price: number) {
  return '£' + Math.round(price).toLocaleString('en-GB')
}

function formatSaleDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function downloadPdf() {
  if (!data.value) return
  generatingPdf.value = true
  try {
    generatePdf(data.value)
  } finally {
    setTimeout(() => {
      generatingPdf.value = false
    }, 800)
  }
}

function downloadTA6() {
  if (!data.value) return
  generatingTA6.value = true
  try {
    generateTA6(data.value)
  } finally {
    setTimeout(() => {
      generatingTA6.value = false
    }, 800)
  }
}

function downloadTA7() {
  if (!data.value) return
  generatingTA7.value = true
  try {
    generateTA7(data.value)
  } finally {
    setTimeout(() => {
      generatingTA7.value = false
    }, 800)
  }
}

function downloadTA10() {
  if (!data.value) return
  generatingTA10.value = true
  try {
    generateFixturesFittings(data.value)
  } finally {
    setTimeout(() => {
      generatingTA10.value = false
    }, 800)
  }
}

function goBack() {
  router.back()
}

function goToSection(sectionId: string) {
  rememberSectionVisit(sectionId)
  router.push(`/buyer-passport/section/${sectionId}?passportId=${passportId}`)
}

// ── Share ─────────────────────────────────────────────────────────────────
function openShareSheet() {
  shareUrl.value = ''
  shareExpiry.value = ''
  showShareSheet.value = true
}

async function createShareLink() {
  sharing.value = true
  try {
    const tok =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res = await $fetch<{ url: string; expiresAt: string }>(
      `${config.public.apiBase}/passport/${passportId}/share`,
      { method: 'POST', headers: { Authorization: `Bearer ${tok}` } },
    )
    shareUrl.value = res.url
    shareExpiry.value = new Date(res.expiresAt).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } finally {
    sharing.value = false
  }
}

async function copyShareLink() {
  if (!shareUrl.value) return
  await navigator.clipboard.writeText(shareUrl.value)
  shareCopied.value = true
  setTimeout(() => {
    shareCopied.value = false
  }, 2000)
}

// ── Comparables ───────────────────────────────────────────────────────────
async function loadComparables() {
  try {
    const tok =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res = await $fetch<any[]>(
      `${config.public.apiBase}/passport/${passportId}/comparables`,
      { headers: { Authorization: `Bearer ${tok}` } },
    )
    comparables.value = res
  } catch {
    // non-critical
  }
}

// ── Notes ─────────────────────────────────────────────────────────────────
async function loadNotes() {
  try {
    const tok =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res = await $fetch<any[]>(
      `${config.public.apiBase}/passport/${passportId}/notes`,
      { headers: { Authorization: `Bearer ${tok}` } },
    )
    notes.value = res
  } catch {
    // non-critical
  }
}

async function saveNote() {
  if (!newNoteText.value.trim() || savingNote.value) return
  savingNote.value = true
  try {
    const tok =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const note = await $fetch<any>(
      `${config.public.apiBase}/passport/${passportId}/notes`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tok}`,
          'Content-Type': 'application/json',
        },
        body: { text: newNoteText.value.trim() },
      },
    )
    notes.value.unshift(note)
    newNoteText.value = ''
  } finally {
    savingNote.value = false
  }
}

async function deleteNote(noteId: string) {
  try {
    const tok =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await $fetch(`${config.public.apiBase}/passport/notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tok}` },
    })
    notes.value = notes.value.filter((n) => n.id !== noteId)
  } catch {
    // non-critical
  }
}
</script>

<style scoped>
.buyer-page {
  background: #f2f6f6;
  padding-bottom: 40px;
}

.buyer-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: #666;
  font-size: 15px;
}

.buyer-spinner {
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

/* Hero */
.buyer-hero {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.buyer-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.buyer-hero__placeholder {
  width: 100%;
  height: 100%;
  background: #e6e8e7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.buyer-hero__placeholder-text {
  text-align: center;
  color: #3a4a48;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.2px;
  padding: 0 24px;
}

.buyer-hero__badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  border-radius: 8px;
  overflow: hidden;
  width: 52px;
  height: 72px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.buyer-hero__badge-passport {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.buyer-hero__count {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: white;
  font-size: 11px;
}

.buyer-hero__nav {
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
}

/* ── Card / page surface — matches passportview theme ─────── */
.buyer-card {
  position: relative;
  padding: 22px 20px 0;
  background: #fff;
  color: #231d45;
}

/* Title block */
.buyer-title-block {
  margin-bottom: 14px;
}
.buyer-address {
  color: #231d45;
  font-weight: 800;
  font-size: 22px;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}
.buyer-city {
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.01em;
  margin: 0 0 8px;
}
.buyer-price {
  color: #00a19a;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.01em;
  margin: 0;
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.buyer-estimated {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Badges — pale brand pills (matches passportview's section-pct pill) */
.buyer-badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.buyer-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f1f9f4;
  color: #00a19a;
  border: 1px solid #e2f1ea;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

/* Section heading — passportview typography */
.buyer-section {
  margin-bottom: 24px;
}
.buyer-section-title {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  margin: 0 0 4px;
  line-height: 1.3;
}
.buyer-section-sub {
  font-size: 12.5px;
  color: #94a3b8;
  margin: 0 0 12px;
  line-height: 1.45;
}

/* Details card — brand-pale gradient with brand-soft border */
.buyer-details-card {
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow:
    0 1px 3px rgba(35, 29, 69, 0.06),
    0 2px 8px rgba(35, 29, 69, 0.04);
}
.buyer-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 14px;
  padding: 4px 0;
}
.buyer-detail-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.buyer-detail-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: #fff;
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.buyer-detail-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0 0 2px;
  line-height: 1.3;
}
.buyer-detail-value {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  margin: 0;
  letter-spacing: -0.01em;
}

/* Search */
.buyer-search-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.buyer-search-input {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 10px 14px;
}

.buyer-search-input input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
}

.buyer-search-input input::placeholder {
  color: #999;
}

.buyer-search-icon {
  flex-shrink: 0;
}

.buyer-sort-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Records list — passportview-style cards with description + progress */
.buyer-records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: transparent;
  border: none;
}

.buyer-record-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 14px 12px;
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  cursor: pointer;
  transition:
    border-color 0.18s,
    background 0.18s,
    transform 0.1s;
  box-shadow:
    0 1px 3px rgba(35, 29, 69, 0.06),
    0 2px 8px rgba(35, 29, 69, 0.04);
}
.buyer-record-row:hover {
  border-color: #e2f1ea;
}
.buyer-record-row:active {
  transform: scale(0.99);
}
.buyer-record-row.state-complete {
  border-color: #e2f1ea;
}

.buyer-record-icon {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.buyer-record-info {
  flex: 1;
  min-width: 0;
}

.buyer-record-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  line-height: 1.25;
  margin: 0 0 3px;
}

.buyer-record-sub {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 8px;
  line-height: 1.45;
}

/* Status pill — sits above the progress bar */
.buyer-record-meta {
  margin-bottom: 6px;
}
.buyer-record-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 999px;
  letter-spacing: 0.01em;
  white-space: nowrap;
  line-height: 1.4;
}
.pill--complete {
  background: #d1fae5;
  color: #1f7a66;
  border: 1px solid #a7f3d0;
}
.pill--partial {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fef3c7;
}
.pill--empty {
  background: #f1f5f9;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

/* Thin progress bar matching passportview's section-progress */
.buyer-record-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
.buyer-record-track {
  flex: 1;
  height: 5px;
  background: #eef0f6;
  border-radius: 999px;
  overflow: hidden;
}
.buyer-record-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
}
.fill--complete {
  background: linear-gradient(90deg, #16a34a, #34d399);
}
.fill--partial {
  background: linear-gradient(90deg, #f59e0b, #f5c44c);
}
.fill--empty {
  background: #e2e8f0;
}
.buyer-record-pct {
  font-size: 11px;
  font-weight: 800;
  color: #4a5568;
  min-width: 32px;
  text-align: right;
  letter-spacing: -0.01em;
}

.buyer-record-arrow {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f8f7fc;
  border: 1px solid #eef0f6;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  color: #94a3b8;
  margin-top: 18px;
}
.buyer-record-row:hover .buyer-record-arrow {
  background: #f1f9f4;
  border-color: #e2f1ea;
  color: #00a19a;
}

/* PDF download row */
.buyer-pdf-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #f0fffe;
  border: 1.5px solid #b2e4e1;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 24px;
}

.buyer-pdf-info {
  flex: 1;
  min-width: 0;
}

.buyer-pdf-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 2px;
}

.buyer-pdf-sub {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.buyer-pdf-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition:
    background 0.15s,
    opacity 0.15s;
}

.buyer-pdf-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.buyer-pdf-btn:active:not(:disabled) {
  background: #00877f;
}

.buyer-ta6-row {
  background: #f4f0ff;
  border-color: #c4b5e8;
  margin-top: -12px;
}

.buyer-ta6-btn {
  background: #5a54d6;
}

.buyer-ta6-btn:active:not(:disabled) {
  background: #4740c0;
}

.buyer-ta7-row {
  background: #fff8ed;
  border-color: #f5c96a;
  margin-top: -12px;
}

.buyer-ta7-btn {
  background: #92400e;
}

.buyer-ta7-btn:active:not(:disabled) {
  background: #92400e;
}

.buyer-ta10-row {
  background: #eef4ff;
  border-color: #b8cfee;
  margin-top: -12px;
}

.buyer-ta10-btn {
  background: #2563eb;
}

.buyer-ta10-btn:active:not(:disabled) {
  background: #1d4ed8;
}

/* ── Progress ─────────────────────────────────────────────────────────── */
.buyer-progress-card {
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
  box-shadow:
    0 1px 3px rgba(35, 29, 69, 0.06),
    0 2px 8px rgba(35, 29, 69, 0.04);
}

.buyer-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.buyer-progress-label {
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
}

.buyer-progress-pct {
  font-size: 14px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: -0.01em;
}

.buyer-progress-track {
  height: 6px;
  background: #d5ece8;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 6px;
}

.buyer-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #00b5ad);
  border-radius: 999px;
  transition: width 0.6s ease;
}

.buyer-progress-hint {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.45;
}

/* ── Red Flags ────────────────────────────────────────────────────────── */
.buyer-redflags-card {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
  box-shadow:
    0 1px 3px rgba(35, 29, 69, 0.06),
    0 2px 8px rgba(35, 29, 69, 0.04);
}

.buyer-redflags-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #92400e;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}

.buyer-redflags-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.buyer-redflags-list li {
  font-size: 12px;
  color: #78350f;
  line-height: 1.5;
}

/* ── Completion dots ──────────────────────────────────────────────────── */
.buyer-record-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.buyer-completion-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--complete {
  background: #22c55e;
}

.dot--partial {
  background: #f59e0b;
}

.dot--empty {
  background: #d1d5db;
  border: 1.5px solid #9ca3af;
}

/* ── Comparables — passportview-themed list ──────────────────────────── */
.buyer-comparables-list {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #eef0f6;
  background: #fff;
  box-shadow:
    0 1px 3px rgba(35, 29, 69, 0.06),
    0 2px 8px rgba(35, 29, 69, 0.04);
}

.buyer-comp-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s;
}
.buyer-comp-row:hover {
  background: #f0fdfa;
}
.buyer-comp-row:last-child {
  border-bottom: none;
}

.buyer-comp-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  color: #00a19a;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.buyer-comp-info {
  flex: 1;
  min-width: 0;
}

.buyer-comp-address {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.buyer-comp-meta {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 0;
}

.buyer-comp-price {
  font-size: 14px;
  font-weight: 800;
  color: #00a19a;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}

/* ── Notes FAB ────────────────────────────────────────────────────────── */
.notes-fab {
  position: fixed;
  bottom: 96px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #00a19a;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.4);
  z-index: 50;
  transition: transform 0.15s;
}

.notes-fab:active {
  transform: scale(0.94);
}

.notes-fab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Bottom Sheets ────────────────────────────────────────────────────── */
.sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sheet-panel {
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  background: white;
  border-radius: 20px 20px 0 0;
  overflow-y: auto;
  padding: 12px 20px 40px;
  animation: slide-up 0.25s ease;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
  margin: 0 auto 16px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sheet-title {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.sheet-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Notes compose */
.notes-compose {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.notes-textarea {
  width: 100%;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  resize: none;
  outline: none;
  font-family: inherit;
  box-sizing: border-box;
}

.notes-textarea:focus {
  border-color: #00a19a;
}

.notes-save-btn {
  align-self: flex-end;
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.notes-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Notes list */
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notes-empty {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 24px 0;
}

.note-item {
  background: #f8fffe;
  border: 1px solid #e0f5f4;
  border-radius: 10px;
  padding: 12px 14px;
}

.note-text {
  font-size: 14px;
  color: #1a1a1a;
  margin: 0 0 8px;
  line-height: 1.5;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-date {
  font-size: 11px;
  color: #999;
}

.note-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

/* Share sheet */
.share-intro,
.share-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.share-hint {
  font-size: 14px;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

.share-generate-btn {
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.share-generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.share-regenerate {
  background: #e6f9f7;
  color: #00a19a;
  border: 1.5px solid #b2e4e1;
}

.share-expires {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.share-url-row {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 10px 12px;
}

.share-url-text {
  flex: 1;
  font-size: 12px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-copy-btn {
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.share-copy-btn:active {
  background: #00877f;
}

/* ── Premium hero card — passport book + identity + stats strip ── */
.buyer-hero-card {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 14px;
  padding: 14px;
  margin: 4px 0 18px;
  background: linear-gradient(135deg, #f4fbfa, #f1f9f4);
  border: 1px solid #e2f1ea;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 140, 134, 0.1);
}
.buyer-hero-glow {
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 140px;
  height: 140px;
  background: radial-gradient(
    circle,
    rgba(0, 161, 154, 0.18),
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
}
.buyer-hero-book {
  width: 84px;
  flex-shrink: 0;
  filter: drop-shadow(0 6px 14px rgba(0, 140, 134, 0.28));
  position: relative;
  z-index: 1;
}
.buyer-hero-book :deep(.passport-card) {
  margin: 0;
  padding: 0;
}
.buyer-hero-book :deep(.passport-container) {
  width: 100%;
  height: 110px;
}
.buyer-hero-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}
.buyer-hero-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 4px;
}
.buyer-hero-addr {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.buyer-hero-sub {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 2px 0 10px;
}
.buyer-hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 140, 134, 0.1);
}
.buyer-hero-stat {
  text-align: center;
  padding: 0 4px;
}
.buyer-hero-stat + .buyer-hero-stat {
  border-left: 1px solid rgba(0, 140, 134, 0.08);
}
.buyer-hero-stat-val {
  font-size: 16px;
  font-weight: 800;
  color: #231d45;
  line-height: 1;
  letter-spacing: -0.01em;
}
.buyer-hero-stat-val--brand {
  color: #00a19a;
}
.buyer-hero-stat-val--ready {
  color: #00a19a;
}
.buyer-hero-stat-lbl {
  font-size: 8.5px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 3px;
  font-weight: 700;
}

/* ── Risk pill in title block ──────────────────────────────────── */
.buyer-risk-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  padding: 5px 11px;
  font-size: 11px;
  font-weight: 800;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid transparent;
  letter-spacing: -0.01em;
  font-family: inherit;
}
.risk-pill--ok {
  background: #d1fae5;
  color: #1f7a66;
  border-color: #a7f3d0;
}
.risk-pill--ok:hover {
  background: #a7f3d0;
}
.risk-pill--warn {
  background: #fef3c7;
  color: #92400e;
  border-color: #fef3c7;
}
.risk-pill--warn:hover {
  background: #fef3c7;
}

/* ── Resume card ───────────────────────────────────────────────── */
.buyer-resume {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 12px 0 18px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #00a19a, #00a19a);
  color: #fff;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.28);
  transition: transform 0.15s ease;
  font-family: inherit;
}
.buyer-resume:hover {
  transform: translateY(-1px);
}
.buyer-resume-ic {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
}
.buyer-resume-body {
  flex: 1;
  min-width: 0;
}
.buyer-resume-eyebrow {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
}
.buyer-resume-title {
  font-size: 13.5px;
  font-weight: 800;
  margin-top: 2px;
  letter-spacing: -0.01em;
}
.buyer-resume-chev {
  font-size: 22px;
  opacity: 0.7;
  flex-shrink: 0;
}

/* ── Section completion summary ───────────────────────────────── */
.buyer-summary-card {
  background: linear-gradient(140deg, #f3fbfa 0%, #f1f9f4 100%);
  border: 1px solid #e2f1ea;
  border-radius: 14px;
  padding: 14px 14px 12px;
  margin-bottom: 12px;
  box-shadow:
    0 1px 3px rgba(35, 29, 69, 0.06),
    0 2px 8px rgba(35, 29, 69, 0.04);
}
.buyer-summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}
.buyer-summary-stat {
  text-align: center;
  padding: 0 4px;
}
.buyer-summary-stat + .buyer-summary-stat {
  border-left: 1px solid rgba(0, 140, 134, 0.12);
}
.buyer-summary-num {
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
}
.buyer-summary-num--done {
  color: #16a34a;
}
.buyer-summary-num--partial {
  color: #92400e;
}
.buyer-summary-num--empty {
  color: #94a3b8;
}
.buyer-summary-lbl {
  font-size: 9.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
}
.buyer-summary-hint {
  font-size: 11.5px;
  color: #4a5568;
  line-height: 1.5;
  margin: 0;
}

/* ── Sticky bottom action bar ─────────────────────────────────── */
.buyer-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  max-width: 28rem;
  margin: 0 auto;
  padding: 10px 16px calc(12px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
  border-top: 1px solid #eef0f6;
  box-shadow: 0 -4px 20px rgba(35, 29, 69, 0.08);
}
.buyer-action-save {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1.5px solid #eef0f6;
  color: #4a5568;
  font-weight: 700;
  font-size: 12.5px;
  padding: 11px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.buyer-action-save:hover {
  border-color: #e2f1ea;
}
.buyer-action-save.is-saved {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #be123c;
}
.buyer-action-heart {
  font-size: 14px;
  line-height: 1;
}
.buyer-action-ask {
  background: linear-gradient(135deg, #00a19a, #00a19a);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 11px 16px;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.28);
  font-family: inherit;
  transition: transform 0.12s, box-shadow 0.15s;
}
.buyer-action-ask:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(0, 161, 154, 0.34);
}

/* Pad the bottom of the scrollable card so content isn't hidden under
   the sticky bar. */
.buyer-card {
  padding-bottom: 88px;
}

/* Save toast — slides down from the top */
.buyer-save-toast {
  position: fixed;
  left: 50%;
  top: 90px;
  transform: translateX(-50%);
  z-index: 40;
  background: #231d45;
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
  padding: 10px 16px;
  border-radius: 999px;
  box-shadow: 0 8px 22px rgba(35, 29, 69, 0.32);
  letter-spacing: -0.01em;
}
.buyer-toast-enter-active,
.buyer-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.buyer-toast-enter-from,
.buyer-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}
</style>
