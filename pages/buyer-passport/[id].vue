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
        </div>

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
        <div v-if="redFlags.length" class="buyer-redflags-card">
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

          <!-- Records List -->
          <div class="buyer-records-list">
            <div
              v-for="section in filteredSections"
              :key="section.id"
              class="buyer-record-row"
              @click="goToSection(section.id)"
            >
              <div class="buyer-record-icon">
                <OPIcon
                  :name="section.imageKey || 'fittingsContents'"
                  class="w-[52px] h-[52px]"
                />
              </div>
              <div class="buyer-record-info">
                <h3 class="buyer-record-title">{{ section.title }}</h3>
                <p class="buyer-record-sub">
                  {{
                    section.subtitle || section.description || 'View details'
                  }}
                </p>
              </div>
              <div class="buyer-record-right">
                <span
                  class="buyer-completion-dot"
                  :class="'dot--' + sectionCompletion(section)"
                  :title="
                    sectionCompletion(section) === 'complete'
                      ? 'Fully answered'
                      : sectionCompletion(section) === 'partial'
                        ? 'Partially answered'
                        : 'Not started'
                  "
                />
                <button class="buyer-record-arrow">
                  <OPIcon name="caretRight" class="w-[13px] h-[13px]" />
                </button>
              </div>
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

// Guided tour for buyers — surfaces the things they care about most.
const buyerTourRef = ref<any>(null)
const buyerTourSteps = [
  {
    selector: '.buyer-title-block',
    title: 'Verified property record',
    body: 'Address, estimated value and key facts — all confirmed against HM Land Registry.',
  },
  {
    selector: '.buyer-card',
    title: 'Everything in one place',
    body: 'Documents, surveys, the seller\'s answers and the property history — no more chasing for paperwork.',
  },
  {
    selector: '.hero-btn',
    title: 'Save & share',
    body: 'Heart it to save to your Buyer Profile, or share the verified link with your solicitor.',
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

/* Card */
.buyer-card {
  position: relative;
  padding: 24px 16px 0;
  background: white;
}

/* Title */
.buyer-title-block {
  margin-bottom: 14px;
}

.buyer-address {
  color: #000;
  font-weight: 590;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  margin: 0 0 2px;
}

.buyer-city {
  color: #3c3c4399;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  margin: 0 0 2px;
}

.buyer-price {
  color: #00a19a;
  font-weight: 400;
  font-size: 17px;
  line-height: 22px;
  letter-spacing: -0.43px;
  margin: 0;
}

.buyer-estimated {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin-left: 6px;
}

/* Badges */
.buyer-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.buyer-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #00a19a;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
}

/* Section */
.buyer-section {
  margin-bottom: 28px;
}

.buyer-section-title {
  font-size: 17px;
  font-weight: 590;
  color: #000;
  margin: 0 0 4px;
  line-height: 22px;
}

.buyer-section-sub {
  font-size: 13px;
  color: #3c3c4399;
  margin: 0 0 14px;
}

/* Details card */
.buyer-details-card {
  background: #f8f8fa;
  border-radius: 16px;
  padding: 8px 16px;
}

.buyer-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 12px 0;
}

.buyer-detail-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.buyer-detail-icon-wrap {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.buyer-detail-label {
  font-size: 11px;
  color: #3c3c4399;
  margin: 0 0 2px;
  line-height: 1.3;
}

.buyer-detail-value {
  font-size: 14px;
  font-weight: 590;
  color: #00a19a;
  margin: 0;
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

/* Records list */
.buyer-records-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  background: white;
}

.buyer-record-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
}

.buyer-record-row:last-child {
  border-bottom: none;
}

.buyer-record-row:active {
  background: #f8f8f8;
}

.buyer-record-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.buyer-record-info {
  flex: 1;
  min-width: 0;
}

.buyer-record-title {
  font-size: 15px;
  font-weight: 590;
  color: #000;
  margin: 0 0 2px;
  line-height: 20px;
}

.buyer-record-sub {
  font-size: 12px;
  color: #3c3c4399;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.buyer-record-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f9f9fd;
  border: 0.5px solid #d2d1e4;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
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
  background: #d97706;
}

.buyer-ta7-btn:active:not(:disabled) {
  background: #b45309;
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
  background: #f8fffe;
  border: 1.5px solid #b2e4e1;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.buyer-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.buyer-progress-label {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
}

.buyer-progress-pct {
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
}

.buyer-progress-track {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.buyer-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #34d399);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.buyer-progress-hint {
  font-size: 11px;
  color: #666;
  margin: 0;
}

/* ── Red Flags ────────────────────────────────────────────────────────── */
.buyer-redflags-card {
  background: #fff5f5;
  border: 1.5px solid #fca5a5;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.buyer-redflags-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #dc2626;
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
  color: #7f1d1d;
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

/* ── Comparables ──────────────────────────────────────────────────────── */
.buyer-comparables-list {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  background: white;
}

.buyer-comp-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f0f0;
}

.buyer-comp-row:last-child {
  border-bottom: none;
}

.buyer-comp-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #e6f9f7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.buyer-comp-info {
  flex: 1;
  min-width: 0;
}

.buyer-comp-address {
  font-size: 13px;
  font-weight: 590;
  color: #1a1a1a;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.buyer-comp-meta {
  font-size: 11px;
  color: #999;
  margin: 0;
}

.buyer-comp-price {
  font-size: 14px;
  font-weight: 700;
  color: #00a19a;
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
</style>
