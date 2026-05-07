<template>
  <div class="lp-page mobile-container">
    <!-- Nav bar -->
    <div class="lp-nav-bar">
      <button class="lp-nav-icon-btn" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="lp-nav-title">Landlord Passport</div>
      <button class="lp-nav-action" @click="openTenantShare" :disabled="!passport">Share</button>
    </div>

    <main class="lp-body">
      <div class="atm-bg teal" />

      <div v-if="loading" class="lp-loading">Loading…</div>

      <template v-else-if="passport">
        <!-- Premium hero — book on left, dashboard on right (mirrors seller passport) -->
        <div class="pp-hero">
          <div class="pp-hero-glow" />
          <div class="pp-hero-book">
            <PassportCard
              :line1="passport.addressLine1"
              :line2="passport.postcode"
            />
          </div>
          <div class="pp-hero-info">
            <div class="pp-hero-eyebrow">Landlord Passport</div>
            <div class="pp-hero-addr-row">
              <div class="pp-hero-addr-text">
                <div class="pp-hero-addr-l1">{{ passport.addressLine1 }}</div>
                <div class="pp-hero-addr-l2">{{ passport.postcode }}</div>
              </div>
            </div>
            <div class="pp-hero-stats">
              <div class="pp-hero-stat">
                <div class="pp-hero-stat-val">{{ progressPct }}<small>%</small></div>
                <div class="pp-hero-stat-lbl">Compliant</div>
              </div>
              <div class="pp-hero-stat">
                <div class="pp-hero-stat-val">{{ docCount }}</div>
                <div class="pp-hero-stat-lbl">Docs</div>
              </div>
              <div class="pp-hero-stat">
                <div class="pp-hero-stat-val">
                  {{ stats.complete }}<span class="pp-hero-stat-of">/{{ stats.total }}</span>
                </div>
                <div class="pp-hero-stat-lbl">Sections</div>
              </div>
            </div>
            <div class="pp-hero-dash">
              <div class="pp-hero-dash-row">
                <span class="pp-hero-dash-label">Compliance progress</span>
                <span class="pp-hero-dash-pct">{{ progressPct }}%</span>
              </div>
              <div class="pp-hero-dash-bar">
                <div class="pp-hero-dash-fill" :style="{ width: progressPct + '%' }">
                  <span class="pp-hero-dash-man">🚶</span>
                </div>
              </div>
              <div v-if="firstExpiring" class="pp-hero-dash-warn">
                <span class="pp-hero-dash-warn-dot" />
                {{ firstExpiring }}
              </div>
              <div v-else class="pp-hero-dash-issued">
                <span class="pp-hero-dash-dot" />
                Letting passport active
              </div>
            </div>
          </div>
        </div>

        <!-- Convert / linked CTA -->
        <button v-if="!hasSellerSibling" class="lp-convert-card" @click="showConvertModal = true">
          <div class="lp-convert-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <div class="lp-convert-body">
            <div class="lp-convert-title">Convert to selling passport</div>
            <div class="lp-convert-sub">Transfer 6 docs · keep tenant or serve notice</div>
          </div>
          <span class="lp-convert-chev">›</span>
        </button>

        <button v-else class="lp-convert-card lp-convert-card--linked" @click="navigateTo(`/passportview/${siblingSellerId}`)">
          <div class="lp-convert-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div class="lp-convert-body">
            <div class="lp-convert-title">Selling passport linked</div>
            <div class="lp-convert-sub">Open the seller passport for this property</div>
          </div>
          <span class="lp-convert-chev">›</span>
        </button>

        <!-- Tabs -->
        <div class="lp-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            class="lp-tab"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="lp-tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <!-- COMPLIANCE -->
        <div v-show="activeTab === 'compliance'">
          <template v-for="group in complianceGroups" :key="group.label">
            <div v-if="group.sections.length > 0" class="section-heading">{{ group.label }}</div>
            <button
              v-for="section in group.sections"
              :key="section.id"
              type="button"
              class="lp-sec"
              :class="`lp-sec--${cardData(section).tone}`"
              @click="openSection(section)"
            >
              <div class="lp-sec-icon" :class="`lp-sec-icon--${cardData(section).tone}`">
                {{ iconForSection(section.key) }}
              </div>
              <div class="lp-sec-content">
                <div class="lp-sec-row-top">
                  <div class="lp-sec-text">
                    <div class="lp-sec-name">{{ section.title }}</div>
                    <div class="lp-sec-sub">{{ cardData(section).subtitleLine }}</div>
                    <div class="lp-sec-pills">
                      <span class="lp-sec-pill lp-sec-pill--doc">
                        <span class="lp-sec-pill-ic">📄</span>
                        {{ cardData(section).docCount }}/{{ cardData(section).docTotal }} doc
                      </span>
                      <span class="lp-sec-pill" :class="`lp-sec-pill--${cardData(section).tone}`">
                        {{ cardData(section).statusLabel }}
                      </span>
                    </div>
                  </div>
                  <span class="lp-sec-chev">›</span>
                </div>
                <div class="lp-sec-bar">
                  <div
                    class="lp-sec-bar-fill"
                    :class="`lp-sec-bar-fill--${cardData(section).tone}`"
                    :style="{ width: cardData(section).pct + '%' }"
                  />
                </div>
                <div v-if="cardData(section).actionByLabel" class="lp-sec-actionby">
                  {{ cardData(section).actionByLabel }}
                </div>
                <div
                  v-else-if="cardData(section).tone === 'good'"
                  class="lp-sec-pct lp-sec-pct--good"
                >
                  100%
                </div>
                <div v-else-if="cardData(section).docCount > 0" class="lp-sec-pct">
                  {{ cardData(section).pct }}%
                </div>
              </div>
            </button>
          </template>

          <!-- Fallback: any sections that didn't match a group bucket -->
          <template v-if="ungroupedSections.length > 0">
            <div class="section-heading">Other</div>
            <button
              v-for="section in ungroupedSections"
              :key="section.id"
              type="button"
              class="lp-sec"
              :class="`lp-sec--${cardData(section).tone}`"
              @click="openSection(section)"
            >
              <div class="lp-sec-icon" :class="`lp-sec-icon--${cardData(section).tone}`">
                {{ iconForSection(section.key) }}
              </div>
              <div class="lp-sec-content">
                <div class="lp-sec-row-top">
                  <div class="lp-sec-text">
                    <div class="lp-sec-name">{{ section.title }}</div>
                    <div class="lp-sec-sub">{{ cardData(section).subtitleLine }}</div>
                    <div class="lp-sec-pills">
                      <span class="lp-sec-pill lp-sec-pill--doc">
                        <span class="lp-sec-pill-ic">📄</span>
                        {{ cardData(section).docCount }}/{{ cardData(section).docTotal }} doc
                      </span>
                      <span class="lp-sec-pill" :class="`lp-sec-pill--${cardData(section).tone}`">
                        {{ cardData(section).statusLabel }}
                      </span>
                    </div>
                  </div>
                  <span class="lp-sec-chev">›</span>
                </div>
                <div class="lp-sec-bar">
                  <div
                    class="lp-sec-bar-fill"
                    :class="`lp-sec-bar-fill--${cardData(section).tone}`"
                    :style="{ width: cardData(section).pct + '%' }"
                  />
                </div>
              </div>
            </button>
          </template>
        </div>

        <!-- VAULT -->
        <div v-show="activeTab === 'vault'">
          <div class="section-heading">All uploaded documents</div>
          <div v-if="uploadedDocs.length === 0" class="lp-empty">
            No documents uploaded yet. Tap a section in the Compliance tab to upload one.
          </div>
          <div v-for="doc in uploadedDocs" :key="doc.id" class="lp-doc">
            <div class="lp-doc-icon">📄</div>
            <div class="lp-doc-info">
              <div class="lp-doc-name">{{ doc.title }}</div>
              <div class="lp-doc-meta">{{ doc.section }} · {{ doc.dateLabel }}</div>
            </div>
            <a :href="doc.url" target="_blank" rel="noopener" class="lp-doc-action">›</a>
          </div>
        </div>

        <!-- TENANCY -->
        <div v-show="activeTab === 'tenancy'">
          <div class="section-heading">Current tenancy</div>
          <div class="lp-tenancy-card">
            <div class="lp-tenancy-row">
              <span class="lp-tenancy-lbl">Tenant</span>
              <span class="lp-tenancy-val">{{ tenancySummary.tenant || 'Add tenant from AST' }}</span>
            </div>
            <div class="lp-tenancy-row">
              <span class="lp-tenancy-lbl">Deposit</span>
              <span class="lp-tenancy-val" :class="{ ok: tenancySummary.depositOk }">{{ tenancySummary.depositLabel }}</span>
            </div>
            <div class="lp-tenancy-row">
              <span class="lp-tenancy-lbl">Right to Rent</span>
              <span class="lp-tenancy-val" :class="{ ok: tenancySummary.rtrOk }">{{ tenancySummary.rtrLabel }}</span>
            </div>
            <div class="lp-tenancy-row">
              <span class="lp-tenancy-lbl">AST</span>
              <span class="lp-tenancy-val" :class="{ ok: tenancySummary.astOk }">{{ tenancySummary.astLabel }}</span>
            </div>
          </div>

          <div v-if="tenancySections.length > 0" class="section-heading">Documents to keep current</div>
          <button
            v-for="section in tenancySections"
            :key="section.id"
            type="button"
            class="lp-sec"
            :class="`lp-sec--${cardData(section).tone}`"
            @click="openSection(section)"
          >
            <div class="lp-sec-icon" :class="`lp-sec-icon--${cardData(section).tone}`">
              {{ iconForSection(section.key) }}
            </div>
            <div class="lp-sec-content">
              <div class="lp-sec-row-top">
                <div class="lp-sec-text">
                  <div class="lp-sec-name">{{ section.title }}</div>
                  <div class="lp-sec-sub">{{ cardData(section).subtitleLine }}</div>
                  <div class="lp-sec-pills">
                    <span class="lp-sec-pill lp-sec-pill--doc">
                      <span class="lp-sec-pill-ic">📄</span>
                      {{ cardData(section).docCount }}/{{ cardData(section).docTotal }} doc
                    </span>
                    <span class="lp-sec-pill" :class="`lp-sec-pill--${cardData(section).tone}`">
                      {{ cardData(section).statusLabel }}
                    </span>
                  </div>
                </div>
                <span class="lp-sec-chev">›</span>
              </div>
              <div class="lp-sec-bar">
                <div
                  class="lp-sec-bar-fill"
                  :class="`lp-sec-bar-fill--${cardData(section).tone}`"
                  :style="{ width: cardData(section).pct + '%' }"
                />
              </div>
            </div>
          </button>
        </div>
      </template>
    </main>

    <!-- Convert modal -->
    <Teleport to="body">
      <div v-if="showConvertModal" class="lp-overlay" @click.self="showConvertModal = false">
        <div class="lp-modal">
          <div class="lp-modal-handle" />
          <div class="lp-modal-header">
            <div class="lp-modal-title">Convert to seller passport</div>
            <button class="lp-modal-close" type="button" aria-label="Close" @click="showConvertModal = false">×</button>
          </div>
          <div class="lp-modal-body">
            <p class="lp-modal-intro">
              We'll create a separate seller passport on the same property and transfer the docs you already
              hold for letting. Both passports stay live — you can keep letting in parallel.
            </p>
            <div class="lp-modal-section">
              <div class="lp-modal-label">Will transfer</div>
              <div v-for="d in transferDocs" :key="d.label" class="lp-modal-doc">
                <div class="lp-modal-doc-tick">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div class="lp-modal-doc-name">{{ d.label }}</div>
                <div class="lp-modal-doc-meta">{{ d.meta }}</div>
              </div>
            </div>
            <div class="lp-modal-section">
              <div class="lp-modal-legal">
                Tenanted sales must disclose the tenancy to buyers under the Consumer Protection from Unfair Trading
                Regulations 2008. The AST transfers to the new owner unless vacant possession is obtained via
                Section 21 / Section 8.
              </div>
            </div>
            <p v-if="convertError" class="lp-modal-error">{{ convertError }}</p>
          </div>
          <div class="lp-modal-footer">
            <button class="btn-secondary" type="button" @click="showConvertModal = false">Cancel</button>
            <button class="btn-primary" type="button" :disabled="converting" @click="onConvertConfirm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              {{ converting ? 'Converting…' : 'Create seller passport' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Section certificate drawer -->
    <Teleport to="body">
      <div v-if="showSectionDrawer && drawerSection" class="lp-overlay" @click.self="showSectionDrawer = false">
        <div class="lp-modal">
          <div class="lp-modal-handle" />
          <div class="lp-modal-header">
            <div class="lp-modal-title">{{ drawerSection.title }}</div>
            <button class="lp-modal-close" type="button" aria-label="Close" @click="showSectionDrawer = false">×</button>
          </div>
          <div class="lp-modal-body">
            <p v-if="drawerSection.subtitle" class="lp-modal-intro">{{ drawerSection.subtitle }}</p>

            <!-- Existing document preview -->
            <div v-if="drawerFileUrl" class="lp-doc-preview">
              <div class="lp-doc-preview-icon">📄</div>
              <div class="lp-doc-preview-info">
                <div class="lp-doc-preview-name">{{ drawerDocName || 'Certificate on file' }}</div>
                <div class="lp-doc-preview-meta">
                  {{ drawerExpiryLabel ? 'Expires ' + drawerExpiryLabel : 'No expiry set' }}
                </div>
              </div>
              <button type="button" class="btn-secondary lp-doc-preview-btn" @click="downloadDrawerFile">
                View
              </button>
            </div>

            <!-- Expiring-soon banner -->
            <div v-if="drawerExpiringSoon" class="lp-warn-banner">
              <div class="lp-warn-icon">⚠</div>
              <div>
                <div class="lp-warn-title">Renewal due in {{ drawerDaysLeft }} day{{ drawerDaysLeft === 1 ? '' : 's' }}</div>
                <div class="lp-warn-meta">
                  Replace the certificate before {{ drawerExpiryLabel }} to stay compliant.
                </div>
              </div>
            </div>

            <!-- Pending file -->
            <div v-if="pendingFile" class="lp-doc-preview lp-doc-preview--pending">
              <div class="lp-doc-preview-icon">📄</div>
              <div class="lp-doc-preview-info">
                <div class="lp-doc-preview-name">{{ pendingFile.name }}</div>
                <div class="lp-doc-preview-meta">{{ pendingFileSizeLabel }} · ready to save</div>
              </div>
              <button type="button" class="btn-secondary lp-doc-preview-btn" @click="pendingFile = null">
                Change
              </button>
            </div>

            <!-- File picker -->
            <label v-else class="lp-upload-row">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                class="lp-upload-input"
                :disabled="drawerUploading"
                @change="onDrawerFilePicked"
              />
              <span class="lp-upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </span>
              <span class="lp-upload-text">
                {{ drawerFileUrl ? 'Replace certificate' : 'Upload certificate' }}
                <small>PDF, JPG, PNG, DOCX up to 20MB</small>
              </span>
            </label>

            <!-- Document name -->
            <div v-if="pendingFile" class="mform-section">
              <div class="mform-label">Document name</div>
              <input
                v-model="drawerDocName"
                type="text"
                class="mform-input"
                placeholder="e.g. Gas Safety 2026"
              />
            </div>

            <!-- Expiry -->
            <div v-if="drawerDateQuestion || pendingFile" class="mform-section">
              <div class="mform-label">Expiry / next renewal date</div>
              <input
                v-model="drawerExpiryDraft"
                type="date"
                class="mform-input"
                :min="todayDateStr"
              />
              <p class="lp-modal-hint">
                We'll remind you 30 days before this date so you can stay compliant.
              </p>
            </div>

            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>
          </div>
          <div class="lp-modal-footer">
            <button
              v-if="pendingFile"
              class="btn-secondary"
              type="button"
              :disabled="drawerUploading"
              @click="pendingFile = null"
            >
              Cancel
            </button>
            <button
              v-if="pendingFile"
              class="btn-primary"
              type="button"
              :disabled="drawerUploading"
              @click="saveDrawerForm"
            >
              {{ drawerUploading ? 'Saving…' : 'Save certificate' }}
            </button>
            <button v-else class="btn-primary" type="button" style="flex: 1;" @click="showSectionDrawer = false">
              Done
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tenant share modal -->
    <Teleport to="body">
      <div v-if="showTenantShare" class="lp-overlay" @click.self="showTenantShare = false">
        <div class="lp-modal">
          <div class="lp-modal-handle" />
          <div class="lp-modal-header">
            <div class="lp-modal-title">Share with your tenant</div>
            <button class="lp-modal-close" type="button" aria-label="Close" @click="showTenantShare = false">×</button>
          </div>
          <div class="lp-modal-body">
            <p class="lp-modal-intro">
              A 3-hour read-only link. The tenant sees only the documents they're entitled to —
              AST, deposit certificate, How-to-Rent, Right-to-Rent confirmation, gas / EICR / EPC.
            </p>
            <div v-if="!tenantShareUrl" class="lp-share-empty">Tap "Generate link" to create one.</div>
            <div v-else class="lp-share-link">
              <input :value="tenantShareUrl" readonly class="lp-share-input" />
              <button class="btn-secondary lp-share-copy" type="button" @click="copyTenantShare">
                {{ tenantShareCopied ? 'Copied' : 'Copy' }}
              </button>
            </div>
            <p v-if="tenantShareError" class="lp-modal-error">{{ tenantShareError }}</p>
          </div>
          <div class="lp-modal-footer">
            <button class="btn-secondary" type="button" @click="showTenantShare = false">Close</button>
            <button
              class="btn-primary"
              type="button"
              :disabled="generatingTenantShare"
              @click="generateTenantShare"
            >
              {{ generatingTenantShare ? 'Generating…' : (tenantShareUrl ? 'Refresh link' : 'Generate link') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePassportClaim } from '~/composables/usePassportClaim'
import PassportCard from '~/components/passport-view/PassportCard.vue'

definePageMeta({ title: 'Landlord Passport — UmovingU', middleware: 'auth' })

const route = useRoute()
const config = useRuntimeConfig()
const { convertLandlordToSeller } = usePassportClaim()

const passportId = computed(() => String(route.params.id))

const loading = ref(true)
const passport = ref<any>(null)
const sections = ref<any[]>([])
const siblingSellerId = ref<string | null>(null)

const activeTab = ref<'compliance' | 'vault' | 'tenancy'>('compliance')

const showConvertModal = ref(false)
const converting = ref(false)
const convertError = ref('')

const showTenantShare = ref(false)
const tenantShareUrl = ref('')
const tenantShareError = ref('')
const tenantShareCopied = ref(false)
const generatingTenantShare = ref(false)

async function loadPassport() {
  loading.value = true
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const data = await $fetch<any>(
      `${config.public.apiBase}/passport/${passportId.value}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    passport.value = data
    // Defensive filter — only render landlord-prefixed sections regardless
    // of what the backend sent. Older landlord passports created before the
    // server-side prefix filter was added still carry seller sections in
    // the DB; dropping them here keeps the UI clean for those legacy
    // passports without needing a destructive cleanup.
    const allSections = (data?.sections ?? [])
      .slice()
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    sections.value = allSections.filter((s: any) =>
      typeof s.key === 'string' && s.key.startsWith('landlord_'),
    )
    siblingSellerId.value = (data?.convertedTo?.[0]?.id as string) ?? null

    console.log('[landlord] all keys:', allSections.map((s: any) => s.key))
    console.log('[landlord] kept (landlord_*):', sections.value.map((s) => s.key))
    if (sections.value.length === 0 && allSections.length > 0) {
      console.warn(
        '[landlord] This passport has no landlord_* sections — it was likely created before the seed/service fix. Delete it and claim a fresh landlord passport.',
      )
    }
  } catch (err: any) {
    convertError.value = err?.data?.message ?? 'Could not load passport'
  } finally {
    loading.value = false
  }
}

// ── Section grouping (key-substring based, falls back gracefully) ────────
const SAFETY_HINTS = ['gas', 'eicr', 'electric', 'epc', 'energy', 'alarm', 'smoke', 'co_', 'legionella']
const TENANCY_HINTS = ['ast', 'tenancy', 'deposit', 'rent', 'right_to_rent', 'rtr', 'how_to_rent', 'inventory', 'occup']
const INSURANCE_HINTS = ['insurance', 'pat', 'hmo']

function isSafety(k: string)    { return SAFETY_HINTS.some((h) => k.toLowerCase().includes(h)) }
function isTenancy(k: string)   { return TENANCY_HINTS.some((h) => k.toLowerCase().includes(h)) }
function isInsurance(k: string) { return INSURANCE_HINTS.some((h) => k.toLowerCase().includes(h)) }

const safetySections    = computed(() => sections.value.filter((s) => isSafety(s.key)))
const tenancySections   = computed(() => sections.value.filter((s) => isTenancy(s.key)))
const insuranceSections = computed(() => sections.value.filter((s) => isInsurance(s.key) && !isTenancy(s.key) && !isSafety(s.key)))
const ungroupedSections = computed(() =>
  sections.value.filter((s) => !isSafety(s.key) && !isTenancy(s.key) && !isInsurance(s.key)),
)

const complianceGroups = computed(() => [
  { label: 'Statutory — annual / 5-yearly', sections: safetySections.value },
  { label: 'Tenancy & deposit', sections: tenancySections.value },
  { label: 'Insurance & HMO', sections: insuranceSections.value },
])

// ── Stats ─────────────────────────────────────────────────────────
const docCount = computed(() => uploadedDocs.value.length)

const stats = computed(() => {
  const total = sections.value.length
  let complete = 0
  let valid = 0
  let expiringSoon = 0
  const now = Date.now()
  const SOON = 30 * 24 * 60 * 60 * 1000
  for (const s of sections.value) {
    const cd = cardData(s)
    if (cd.tone === 'good') complete++
    if (cd.tone === 'good') valid++
    const tasks = (s.tasks ?? []) as any[]
    for (const t of tasks) {
      for (const q of t.passportQuestions ?? []) {
        const v = q.answer?.answerText ?? q.answer?.value
        if (typeof v === 'string' && /\d{4}-\d{2}-\d{2}/.test(v)) {
          const ts = new Date(v).getTime()
          if (ts > now && ts - now < SOON) expiringSoon++
        }
      }
    }
  }
  return { total, complete, valid, expiringSoon }
})

const progressPct = computed(() =>
  stats.value.total === 0 ? 0 : Math.round((stats.value.complete / stats.value.total) * 100),
)

const firstExpiring = computed(() => {
  if (stats.value.expiringSoon === 0) return ''
  return `${stats.value.expiringSoon} doc${stats.value.expiringSoon === 1 ? '' : 's'} expiring in the next 30 days`
})

const tabs = computed(() => [
  { label: 'Compliance', value: 'compliance', count: stats.value.total },
  { label: 'Vault', value: 'vault', count: docCount.value },
  { label: 'Tenancy', value: 'tenancy', count: undefined },
])

const uploadedDocs = computed(() => {
  const out: any[] = []
  for (const s of sections.value) {
    for (const t of s.tasks ?? []) {
      for (const q of t.passportQuestions ?? []) {
        const a = q.answer
        if (!a) continue
        const file = a.fileUrl ?? a.answerJson?.fileUrl ?? a.url ?? null
        if (!file) continue
        const fileName = a.answerJson?.fileName ?? q.questionTemplate?.title ?? 'Document'
        out.push({
          id: q.id,
          title: fileName,
          section: s.title ?? s.key,
          url: file.startsWith('/') ? `${config.public.apiBase}${file}` : file,
          dateLabel: a.updatedAt
            ? new Date(a.updatedAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
            : '',
        })
      }
    }
  }
  return out.sort((a, b) => (a.dateLabel < b.dateLabel ? 1 : -1))
})

const tenancySummary = computed(() => {
  const findByHint = (hints: string[]) =>
    sections.value.find((s) => hints.some((h) => s.key.toLowerCase().includes(h)))
  const ast = findByHint(['ast', 'tenancy_agreement'])
  const deposit = findByHint(['deposit'])
  const rtr = findByHint(['right_to_rent', 'rtr'])

  return {
    tenant: '',
    depositOk: deposit?.status === 'COMPLETED',
    depositLabel: deposit?.status === 'COMPLETED' ? '✓ Protected' : 'Add certificate',
    rtrOk: rtr?.status === 'COMPLETED',
    rtrLabel: rtr?.status === 'COMPLETED' ? '✓ Verified' : 'Add evidence',
    astOk: ast?.status === 'COMPLETED',
    astLabel: ast?.status === 'COMPLETED' ? 'Signed' : 'Upload AST',
  }
})

const hasSellerSibling = computed(() => !!siblingSellerId.value)

const transferDocs = [
  { label: 'Gas Safety Certificate (CP12)', meta: 'transferring' },
  { label: 'EICR Report', meta: 'transferring' },
  { label: 'EPC Certificate', meta: 'transferring' },
  { label: 'Smoke & CO Alarm record', meta: 'transferring' },
  { label: 'Buildings insurance schedule', meta: 'transferring' },
  { label: 'Tenant disclosure data', meta: 'from AST' },
]

function iconForSection(key: string): string {
  const k = key.toLowerCase()
  if (k.includes('gas')) return '🔥'
  if (k.includes('eicr') || k.includes('electric')) return '⚡'
  if (k.includes('epc') || k.includes('energy')) return '🌿'
  if (k.includes('alarm') || k.includes('smoke')) return '🔔'
  if (k.includes('legionella')) return '💧'
  if (k.includes('insurance')) return '🛡️'
  if (k.includes('ast') || k.includes('tenancy')) return '📜'
  if (k.includes('deposit')) return '£'
  if (k.includes('right_to_rent') || k.includes('rtr')) return '🪪'
  if (k.includes('how_to_rent')) return '📘'
  if (k.includes('inventory')) return '📋'
  if (k.includes('pat')) return '🔌'
  if (k.includes('hmo')) return '🏠'
  return '📄'
}

// ── Section drawer (upload / view / replace certificate) ───────
const drawerSection = ref<any>(null)
const showSectionDrawer = ref(false)
const drawerError = ref('')
const drawerUploading = ref(false)
const drawerSavingDate = ref(false)
const pendingFile = ref<File | null>(null)
const drawerDocName = ref('')
const drawerExpiryDraft = ref('')

const todayDateStr = computed(() => new Date().toISOString().slice(0, 10))

const pendingFileSizeLabel = computed(() => {
  const f = pendingFile.value
  if (!f) return ''
  if (f.size >= 1024 * 1024) return `${(f.size / 1024 / 1024).toFixed(1)}MB`
  if (f.size >= 1024) return `${Math.round(f.size / 1024)}KB`
  return `${f.size}B`
})

const drawerExpiringSoon = computed(() => {
  if (!drawerExpiry.value) return false
  const ts = new Date(drawerExpiry.value).getTime()
  const now = Date.now()
  return ts > now && ts - now < 30 * 24 * 60 * 60 * 1000
})

const drawerDaysLeft = computed(() => {
  if (!drawerExpiry.value) return 0
  const ts = new Date(drawerExpiry.value).getTime()
  return Math.max(0, Math.round((ts - Date.now()) / (24 * 60 * 60 * 1000)))
})

const drawerUploadQuestion = computed(() => {
  if (!drawerSection.value) return null
  for (const t of drawerSection.value.tasks ?? []) {
    for (const q of t.passportQuestions ?? []) {
      if (q.questionTemplate?.type === 'UPLOAD') return q
    }
  }
  return null
})
const drawerDateQuestion = computed(() => {
  if (!drawerSection.value) return null
  for (const t of drawerSection.value.tasks ?? []) {
    for (const q of t.passportQuestions ?? []) {
      if (q.questionTemplate?.type === 'DATE') return q
    }
  }
  return null
})
const drawerFileUrl = computed(() => {
  const q: any = drawerUploadQuestion.value
  const a = q?.answer
  const f = a?.fileUrl ?? a?.answerJson?.fileUrl ?? a?.url ?? null
  if (!f) return null
  return f.startsWith('/') ? `${config.public.apiBase}${f}` : f
})
const drawerExpiry = computed(() => {
  const q: any = drawerDateQuestion.value
  // Date answers are stored in answerText (the answerQuestion service
  // routes plain string values that aren't URLs into answerText).
  const v = q?.answer?.answerText ?? q?.answer?.value
  return typeof v === 'string' ? v.slice(0, 10) : ''
})
const drawerExpiryLabel = computed(() => {
  if (!drawerExpiry.value) return ''
  const d = new Date(drawerExpiry.value)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
})

function openSection(s: any) {
  if (!s) return
  drawerSection.value = s
  drawerError.value = ''
  pendingFile.value = null
  drawerDocName.value = ''
  drawerExpiryDraft.value = drawerExpiry.value || ''
  showSectionDrawer.value = true
}

function onDrawerFilePicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  pendingFile.value = file
  if (!drawerDocName.value) {
    drawerDocName.value = file.name.replace(/\.[^.]+$/, '')
  }
  ;(e.target as HTMLInputElement).value = ''
}

async function saveDrawerForm() {
  if (!pendingFile.value) return
  const q = drawerUploadQuestion.value
  if (!q) {
    drawerError.value =
      'No upload slot found for this section — this passport was created before the latest fix. Re-claim a fresh landlord passport.'
    return
  }
  drawerUploading.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const fd = new FormData()
    fd.append('file', pendingFile.value)
    if (drawerDocName.value) fd.append('name', drawerDocName.value)
    await $fetch(`${config.public.apiBase}/questions/${q.id}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })

    // Save expiry date (if provided and a DATE question exists on this section)
    if (drawerExpiryDraft.value && drawerDateQuestion.value) {
      await $fetch(`${config.public.apiBase}/questions/${drawerDateQuestion.value.id}/answer`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { value: drawerExpiryDraft.value },
      })
    }

    pendingFile.value = null
    await loadPassport()
    if (drawerSection.value) {
      drawerSection.value =
        sections.value.find((s) => s.id === drawerSection.value.id) ?? drawerSection.value
    }
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Save failed'
  } finally {
    drawerUploading.value = false
  }
}

function downloadDrawerFile() {
  if (!drawerFileUrl.value) return
  window.open(drawerFileUrl.value, '_blank', 'noopener')
}

async function onConvertConfirm() {
  converting.value = true
  convertError.value = ''
  try {
    const result = await convertLandlordToSeller(passportId.value)
    showConvertModal.value = false
    siblingSellerId.value = result.passportId
    navigateTo(`/passportview/${result.passportId}`)
  } catch (err: any) {
    convertError.value = err?.data?.message ?? err?.message ?? 'Conversion failed'
  } finally {
    converting.value = false
  }
}

function openTenantShare() {
  showTenantShare.value = true
  tenantShareCopied.value = false
}

async function generateTenantShare() {
  generatingTenantShare.value = true
  tenantShareError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const result = await $fetch<{ url: string }>(
      `${config.public.apiBase}/passport/${passportId.value}/share`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { scope: 'tenant' },
      },
    )
    tenantShareUrl.value = result.url
  } catch (err: any) {
    tenantShareError.value = err?.data?.message ?? 'Could not generate link'
  } finally {
    generatingTenantShare.value = false
  }
}

async function copyTenantShare() {
  try {
    await navigator.clipboard.writeText(tenantShareUrl.value)
    tenantShareCopied.value = true
    setTimeout(() => (tenantShareCopied.value = false), 1800)
  } catch {
    /* ignore */
  }
}

const goBack = useGoBack('/profile')

onMounted(loadPassport)

// Per-section view-model used by the inline template card.
function cardData(section: any) {
  const tasks: any[] = section?.tasks ?? []
  let docCount = 0
  let docTotal = 0
  let earliestExpiry: Date | null = null
  const now = Date.now()

  for (const t of tasks) {
    const qs = (t.passportQuestions ?? []) as any[]
    for (const q of qs) {
      const isUpload =
        q.questionTemplate?.type === 'UPLOAD' ||
        !!(q.answer?.fileUrl ?? q.answer?.answerJson?.fileUrl ?? q.answer?.url)
      if (isUpload) {
        docTotal++
        const file = q.answer?.fileUrl ?? q.answer?.answerJson?.fileUrl ?? q.answer?.url
        if (file) docCount++
      }
      const v = q.answer?.answerText ?? q.answer?.value
      if (typeof v === 'string' && /\d{4}-\d{2}-\d{2}/.test(v)) {
        const ts = new Date(v)
        if (ts.getTime() > now && (!earliestExpiry || ts < earliestExpiry)) {
          earliestExpiry = ts
        }
      }
    }
  }
  if (docTotal === 0) docTotal = 1

  const SOON = 30 * 24 * 60 * 60 * 1000
  const isExpiringSoon =
    earliestExpiry !== null && earliestExpiry.getTime() - now < SOON

  let tone: 'good' | 'warn' | 'pending' = 'pending'
  let statusLabel = 'Pending'
  let actionByLabel = ''
  let subtitleLine = section?.subtitle ?? ''

  const allDocsUploaded = docTotal > 0 && docCount === docTotal
  if ((section?.status === 'COMPLETED' || allDocsUploaded) && !isExpiringSoon) {
    tone = 'good'
    statusLabel = '✓ Satisfactory'
    if (earliestExpiry) {
      subtitleLine = `Valid to ${earliestExpiry.toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric',
      })}`
    }
  } else if (isExpiringSoon) {
    tone = 'warn'
    const daysLeft = Math.max(
      0,
      Math.round((earliestExpiry!.getTime() - now) / (24 * 60 * 60 * 1000)),
    )
    statusLabel = '⚠ Renew soon'
    actionByLabel = `Action by ${earliestExpiry!.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })}`
    subtitleLine = `Renewal due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
  } else if (docCount > 0) {
    tone = 'warn'
    statusLabel = 'In progress'
  }

  const pct = docTotal === 0 ? 0 : Math.round((docCount / docTotal) * 100)

  return { tone, statusLabel, actionByLabel, subtitleLine, docCount, docTotal, pct }
}

// Stub kept for backward compatibility with old refs to <SectionCard />.
const SectionCard = defineComponent({
  props: {
    section: { type: Object, required: true },
    icon: { type: String, default: '📄' },
  },
  emits: ['click'],
  setup(props: any, { emit }: any) {
    const data = computed(() => {
      const s = props.section
      const tasks: any[] = s?.tasks ?? []
      let docCount = 0
      let docTotal = 0
      let earliestExpiry: Date | null = null
      const now = Date.now()

      for (const t of tasks) {
        const qs = (t.passportQuestions ?? []) as any[]
        for (const q of qs) {
          const isUpload =
            q.questionTemplate?.type === 'UPLOAD' ||
            !!(q.answer?.fileUrl ?? q.answer?.value?.fileUrl ?? q.answer?.url)
          if (isUpload) {
            docTotal++
            const file = q.answer?.fileUrl ?? q.answer?.value?.fileUrl ?? q.answer?.url
            if (file) docCount++
          }
          // Date answers act as expiry signals for compliance sections.
          const v = q.answer?.value
          if (typeof v === 'string' && /\d{4}-\d{2}-\d{2}/.test(v)) {
            const ts = new Date(v)
            if (ts.getTime() > now && (!earliestExpiry || ts < earliestExpiry)) {
              earliestExpiry = ts
            }
          }
        }
      }
      // Always show at least 1 doc target so the "1/1 doc" pill renders even
      // before any UPLOAD answers exist on the section.
      if (docTotal === 0) docTotal = 1

      const SOON = 30 * 24 * 60 * 60 * 1000
      const isExpiringSoon =
        earliestExpiry !== null && earliestExpiry.getTime() - now < SOON

      let tone: 'good' | 'warn' | 'pending' = 'pending'
      let statusLabel = 'Pending'
      let actionByLabel = ''
      if (s?.status === 'COMPLETED' && !isExpiringSoon) {
        tone = 'good'
        statusLabel = '✓ Satisfactory'
      } else if (isExpiringSoon) {
        tone = 'warn'
        statusLabel = '⚠ Renew soon'
        actionByLabel = `Action by ${earliestExpiry!.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        })}`
      } else if (docCount > 0) {
        tone = 'warn'
        statusLabel = 'In progress'
      }

      const pct = docTotal === 0 ? 0 : Math.round((docCount / docTotal) * 100)

      return {
        tone,
        statusLabel,
        actionByLabel,
        docCount,
        docTotal,
        pct,
      }
    })

    return () =>
      h(
        'button',
        {
          class: ['lp-sec', `lp-sec--${data.value.tone}`],
          type: 'button',
          onClick: () => emit('click'),
        },
        [
          h('div', { class: ['lp-sec-icon', `lp-sec-icon--${data.value.tone}`] }, props.icon),
          h('div', { class: 'lp-sec-content' }, [
            h('div', { class: 'lp-sec-row-top' }, [
              h('div', [
                h('div', { class: 'lp-sec-name' }, props.section.title),
                h('div', { class: 'lp-sec-sub' }, props.section.subtitle ?? ''),
                h('div', { class: 'lp-sec-pills' }, [
                  h('span', { class: 'lp-sec-pill lp-sec-pill--doc' }, [
                    h('span', { class: 'lp-sec-pill-ic' }, '📄'),
                    `${data.value.docCount}/${data.value.docTotal} doc`,
                  ]),
                  h(
                    'span',
                    { class: ['lp-sec-pill', `lp-sec-pill--${data.value.tone}`] },
                    data.value.statusLabel,
                  ),
                ]),
              ]),
              h('span', { class: 'lp-sec-chev' }, '›'),
            ]),
            h('div', { class: 'lp-sec-bar' }, [
              h('div', {
                class: ['lp-sec-bar-fill', `lp-sec-bar-fill--${data.value.tone}`],
                style: { width: data.value.pct + '%' },
              }),
            ]),
            data.value.actionByLabel
              ? h('div', { class: 'lp-sec-actionby' }, data.value.actionByLabel)
              : data.value.tone === 'good'
                ? h('div', { class: 'lp-sec-pct lp-sec-pct--good' }, '100%')
                : data.value.docCount > 0
                  ? h('div', { class: 'lp-sec-pct' }, `${data.value.pct}%`)
                  : null,
          ]),
        ],
      )
  },
})
</script>

<style scoped>
.lp-page {
  min-height: 100dvh;
  background: #fafaf8;
  color: #0e2840;
  position: relative;
  padding-bottom: 32px;
}

.lp-nav-bar {
  display: flex;
  align-items: center;
  padding: 10px 22px 8px;
  padding-top: calc(10px + env(safe-area-inset-top));
  gap: 8px;
  position: relative;
  z-index: 2;
}
.lp-nav-icon-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #0e2840;
  flex-shrink: 0;
}
.lp-nav-icon-btn svg { width: 18px; height: 18px; }
.lp-nav-title { flex: 1; text-align: center; font-size: 16px; font-weight: 800; color: #0e2840; letter-spacing: -0.4px; }
.lp-nav-action {
  font-size: 13px;
  font-weight: 800;
  padding: 8px 14px;
  border-radius: 100px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  color: #1f7a66;
  flex-shrink: 0;
}
.lp-nav-action:disabled { opacity: 0.5; cursor: not-allowed; }

.lp-body { position: relative; }
.atm-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 320px;
  pointer-events: none;
  z-index: 0;
}
.atm-bg.teal {
  background: radial-gradient(ellipse 60% 80% at 50% 0%, rgba(31, 122, 102, 0.18), transparent 65%);
}

.lp-loading { padding: 60px 22px; text-align: center; color: #8a95a0; font-weight: 600; position: relative; z-index: 1; }

/* ── Premium hero (mirrors seller passport) ──────────────── */
.pp-hero {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 16px;
  padding: 10px 22px 22px;
  position: relative;
  z-index: 1;
  align-items: stretch;
  background:
    radial-gradient(ellipse 70% 100% at 50% 0%, rgba(61, 189, 163, 0.14), transparent 60%);
  border-radius: 22px;
  margin: 4px 14px 14px;
}
.pp-hero-glow {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  background: radial-gradient(ellipse 60% 80% at 30% 0%, rgba(61, 189, 163, 0.15), transparent 70%);
  pointer-events: none;
}
.pp-hero-book {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pp-hero-book :deep(.passport-card) { margin: 0; padding: 0; }
.pp-hero-book :deep(.passport-container) {
  max-width: 110px;
  width: 110px;
}
.pp-hero-book :deep(.passport-image) {
  width: 110px;
  height: auto;
  filter: drop-shadow(0 10px 24px rgba(14, 40, 64, 0.3));
}

.pp-hero-info {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.pp-hero-eyebrow {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #1f7a66;
  margin-bottom: 4px;
}
.pp-hero-addr-row { display: flex; align-items: center; gap: 6px; }
.pp-hero-addr-text { flex: 1; min-width: 0; }
.pp-hero-addr-l1 {
  font-size: 18px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.5px;
  line-height: 1.1;
}
.pp-hero-addr-l2 {
  font-size: 11px;
  font-weight: 700;
  color: #4a5868;
  margin-top: 2px;
}
.pp-hero-stats {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.pp-hero-stat { flex: 1; min-width: 0; }
.pp-hero-stat-val {
  font-size: 19px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.5px;
  font-feature-settings: 'tnum';
  line-height: 1;
}
.pp-hero-stat-val small { font-size: 11px; color: #4a5868; font-weight: 700; }
.pp-hero-stat-of { font-size: 12px; color: #8a95a0; font-weight: 700; }
.pp-hero-stat-lbl {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-top: 4px;
}

.pp-hero-dash { margin-top: 12px; }
.pp-hero-dash-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #4a5868;
  margin-bottom: 5px;
}
.pp-hero-dash-pct { color: #1f7a66; font-feature-settings: 'tnum'; }
.pp-hero-dash-bar {
  height: 8px;
  background: rgba(31, 122, 102, 0.12);
  border-radius: 100px;
  overflow: visible;
  position: relative;
}
.pp-hero-dash-fill {
  height: 100%;
  background: linear-gradient(90deg, #3dbda3, #1f7a66);
  border-radius: 100px;
  transition: width 0.3s ease;
  position: relative;
}
.pp-hero-dash-man {
  position: absolute;
  right: -10px;
  top: -12px;
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
}
.pp-hero-dash-issued,
.pp-hero-dash-warn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: -0.1px;
}
.pp-hero-dash-issued { color: #1f7a66; }
.pp-hero-dash-warn { color: #b85b36; }
.pp-hero-dash-dot { width: 7px; height: 7px; background: #3dbda3; border-radius: 50%; }
.pp-hero-dash-warn-dot { width: 7px; height: 7px; background: #ff8b5a; border-radius: 50%; }

/* Convert card */
.lp-convert-card {
  width: calc(100% - 44px);
  margin: 4px 22px 16px;
  background:
    radial-gradient(ellipse 70% 70% at 30% 30%, rgba(255, 255, 255, 0.18), transparent 60%),
    linear-gradient(135deg, #00a19a, #1f7a66);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  position: relative;
  z-index: 1;
  color: #fff;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.32);
}
.lp-convert-card--linked {
  background: linear-gradient(135deg, #f1f9f4, #e2f1ea);
  border: 1px solid rgba(31, 122, 102, 0.3);
  color: #0e2840;
  box-shadow: none;
}
.lp-convert-icon {
  width: 38px; height: 38px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lp-convert-card--linked .lp-convert-icon {
  background: #1f7a66;
  color: #fff;
}
.lp-convert-icon svg { width: 18px; height: 18px; }
.lp-convert-body { flex: 1; min-width: 0; }
.lp-convert-title { font-size: 14px; font-weight: 800; letter-spacing: -0.3px; }
.lp-convert-sub { font-size: 11px; font-weight: 700; opacity: 0.85; margin-top: 2px; }
.lp-convert-card--linked .lp-convert-sub { color: #4a5868; opacity: 1; }
.lp-convert-chev { font-size: 20px; flex-shrink: 0; }

/* Tabs */
.lp-tabs {
  display: flex;
  gap: 6px;
  padding: 0 22px 12px;
  position: relative;
  z-index: 1;
}
.lp-tab {
  flex: 1;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 100px;
  padding: 9px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  color: #4a5868;
  letter-spacing: -0.2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.lp-tab.active {
  background: #0e2840;
  color: #fff;
  border-color: #0e2840;
}
.lp-tab-count {
  font-size: 10px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.18);
  padding: 1px 6px;
  border-radius: 100px;
  font-feature-settings: 'tnum';
}
.lp-tab:not(.active) .lp-tab-count { background: #f0f2f1; color: #4a5868; }

/* Section heading */
.section-heading {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  padding: 8px 22px 8px;
  position: relative;
  z-index: 1;
}

/* Section card — prototype look (icon tile + double pills + progress bar) */
.lp-sec {
  width: calc(100% - 44px);
  margin: 0 22px 10px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 16px;
  padding: 14px 14px 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  position: relative;
  z-index: 1;
  transition: all 0.15s;
  box-shadow: 0 1px 2px rgba(14, 40, 64, 0.04);
}
.lp-sec:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(14, 40, 64, 0.08); }
.lp-sec-icon {
  width: 56px; height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f1f9f4, #e2f1ea);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 26px;
  box-shadow: inset 0 0 0 1px rgba(31, 122, 102, 0.1);
}
.lp-sec-icon--good { background: linear-gradient(135deg, #f1f9f4, #d6efe2); box-shadow: inset 0 0 0 1px rgba(61, 189, 163, 0.25); }
.lp-sec-icon--warn { background: linear-gradient(135deg, #fef3c7, #fde9a4); box-shadow: inset 0 0 0 1px rgba(245, 196, 76, 0.4); }

.lp-sec-content { flex: 1; min-width: 0; }
.lp-sec-row-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.lp-sec-row-top > div:first-child { flex: 1; min-width: 0; }
.lp-sec-name {
  font-size: 14.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.3px;
  line-height: 1.2;
}
.lp-sec-sub {
  font-size: 11.5px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 2px;
  line-height: 1.35;
}

.lp-sec-pills {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.lp-sec-pill {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: -0.1px;
  padding: 4px 9px;
  border-radius: 100px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.lp-sec-pill--doc { background: #f0f2f1; color: #4a5868; }
.lp-sec-pill-ic { font-size: 10px; }
.lp-sec-pill--good { background: #d6efe2; color: #1f7a66; }
.lp-sec-pill--warn { background: #fef3c7; color: #92400e; }
.lp-sec-pill--pending { background: #f5f4f0; color: #8a95a0; }

.lp-sec-bar {
  height: 4px;
  background: #f0f2f1;
  border-radius: 100px;
  margin-top: 12px;
  overflow: hidden;
}
.lp-sec-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 0.3s ease;
}
.lp-sec-bar-fill--good { background: linear-gradient(90deg, #3dbda3, #1f7a66); }
.lp-sec-bar-fill--warn { background: linear-gradient(90deg, #f5c44c, #d4a659); }
.lp-sec-bar-fill--pending { background: #d9dee2; }

.lp-sec-pct {
  text-align: right;
  font-size: 10.5px;
  font-weight: 800;
  color: #4a5868;
  margin-top: 4px;
  letter-spacing: -0.1px;
  font-feature-settings: 'tnum';
}
.lp-sec-pct--good { color: #1f7a66; }

.lp-sec-actionby {
  text-align: right;
  font-size: 11px;
  font-weight: 800;
  color: #b85b36;
  margin-top: 4px;
  letter-spacing: -0.1px;
}

.lp-sec-chev { color: #8a95a0; font-size: 22px; flex-shrink: 0; line-height: 1; padding-top: 2px; }

/* Vault */
.lp-doc {
  margin: 0 22px 6px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}
.lp-doc-icon {
  width: 34px; height: 38px;
  border-radius: 6px;
  background: linear-gradient(135deg, #fdf4dc, #f8e6c2);
  color: #6f4d14;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lp-doc-info { flex: 1; min-width: 0; }
.lp-doc-name {
  font-size: 12.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lp-doc-meta { font-size: 10px; font-weight: 600; color: #8a95a0; margin-top: 1px; }
.lp-doc-action { color: #8a95a0; font-size: 16px; flex-shrink: 0; text-decoration: none; }

.lp-empty {
  margin: 0 22px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #4a5868;
  text-align: center;
  position: relative;
  z-index: 1;
}

/* Tenancy */
.lp-tenancy-card {
  margin: 0 22px 8px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 12px 14px;
  position: relative;
  z-index: 1;
}
.lp-tenancy-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 12.5px;
}
.lp-tenancy-row:not(:last-child) { border-bottom: 1px solid #f0f2f1; }
.lp-tenancy-lbl { color: #4a5868; font-weight: 600; }
.lp-tenancy-val { color: #0e2840; font-weight: 800; }
.lp-tenancy-val.ok { color: #1f7a66; }

/* Modal pattern */
.lp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 40, 64, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 70;
}
.lp-modal {
  width: 100%;
  max-width: 28rem;
  background: #fafaf8;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  max-height: 92vh;
  overflow: hidden;
  animation: lp-up 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes lp-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
.lp-modal-handle { width: 36px; height: 4px; background: #d9dae0; border-radius: 100px; margin: 8px auto 0; }
.lp-modal-header { display: flex; align-items: center; padding: 12px 18px 10px; }
.lp-modal-title { flex: 1; font-size: 16px; font-weight: 800; color: #0e2840; letter-spacing: -0.4px; }
.lp-modal-close {
  width: 30px; height: 30px;
  border-radius: 50%;
  border: none;
  background: #f0f2f1;
  color: #4a5868;
  font-size: 20px;
  cursor: pointer;
  font-family: inherit;
  display: flex; align-items: center; justify-content: center;
}
.lp-modal-body { flex: 1; overflow-y: auto; padding: 6px 18px 14px; }
.lp-modal-footer {
  padding: 12px 18px calc(14px + env(safe-area-inset-bottom));
  border-top: 1px solid #e8eceb;
  background: #fafaf8;
  display: flex;
  gap: 8px;
}
.lp-modal-intro { font-size: 12.5px; font-weight: 600; color: #4a5868; line-height: 1.5; margin-bottom: 14px; }
.lp-modal-section { margin-bottom: 14px; }
.lp-modal-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 8px;
}
.lp-modal-doc {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  margin-bottom: 5px;
}
.lp-modal-doc-tick {
  width: 22px; height: 22px;
  background: #1f7a66;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lp-modal-doc-tick svg { width: 12px; height: 12px; }
.lp-modal-doc-name { flex: 1; font-size: 12.5px; font-weight: 800; color: #0e2840; }
.lp-modal-doc-meta { font-size: 10.5px; font-weight: 700; color: #8a95a0; }
.lp-modal-legal {
  font-size: 11px;
  font-weight: 600;
  color: #4a5868;
  line-height: 1.55;
  background: #f1f9f4;
  border: 1px solid rgba(61, 189, 163, 0.25);
  border-radius: 10px;
  padding: 10px 12px;
}
.lp-modal-error { color: #b85b36; font-size: 12px; font-weight: 700; text-align: center; }

/* Tenant share */
.lp-share-link { display: flex; gap: 6px; align-items: center; }
.lp-share-input {
  flex: 1;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #0e2840;
  outline: none;
}
.lp-share-copy { flex: 0 0 auto; }
.lp-share-empty {
  font-size: 12px;
  color: #4a5868;
  font-weight: 600;
  text-align: center;
  padding: 12px 0;
}

/* Buttons */
.btn-secondary {
  flex: 1;
  background: #f0f2f1;
  color: #0e2840;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
}
.btn-primary {
  flex: 2;
  background: #3dbda3;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.2px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(61, 189, 163, 0.32);
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.btn-primary svg { width: 14px; height: 14px; }

/* ── Section drawer (certificate view / upload) ─────────── */
.lp-doc-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f1f9f4, #ffffff);
  border: 1px solid rgba(31, 122, 102, 0.25);
  border-radius: 14px;
  margin-bottom: 14px;
}
.lp-doc-preview-icon {
  width: 44px; height: 50px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fdf4dc, #f8e6c2);
  color: #6f4d14;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.lp-doc-preview-info { flex: 1; min-width: 0; }
.lp-doc-preview-name {
  font-size: 13px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
}
.lp-doc-preview-meta {
  font-size: 11px;
  font-weight: 700;
  color: #1f7a66;
  margin-top: 2px;
}
.lp-doc-preview-btn {
  flex: 0 0 auto;
  padding: 8px 14px;
  font-size: 12px;
}
.lp-doc-empty {
  margin-bottom: 14px;
  padding: 14px;
  background: #f5f4f0;
  border: 1px dashed #d9dee2;
  border-radius: 14px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #4a5868;
}

.lp-upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1.5px dashed #3dbda3;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 14px;
  cursor: pointer;
  position: relative;
  transition: all 0.18s;
}
.lp-upload-row:hover { background: #f1f9f4; }
.lp-upload-input { position: absolute; opacity: 0; inset: 0; cursor: pointer; }
.lp-upload-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  background: #3dbda3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(31, 122, 102, 0.32);
}
.lp-upload-icon svg { width: 18px; height: 18px; }
.lp-upload-text {
  font-size: 13.5px;
  font-weight: 800;
  color: #0e2840;
  letter-spacing: -0.2px;
}
.lp-upload-text small {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 2px;
}

.mform-section { margin-bottom: 14px; }
.mform-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #8a95a0;
  margin-bottom: 8px;
}
.mform-input {
  width: 100%;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #0e2840;
  outline: none;
  transition: all 0.18s;
}
.mform-input:focus { border-color: #3dbda3; box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.18); }
.lp-modal-hint {
  font-size: 11px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 6px;
  line-height: 1.4;
}

.lp-doc-preview--pending {
  background: linear-gradient(135deg, #fdf4dc, #ffffff);
  border-color: rgba(212, 166, 89, 0.4);
}

.lp-warn-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fef3c7, #fde9a4);
  border: 1px solid rgba(212, 166, 89, 0.5);
  border-radius: 12px;
  margin-bottom: 14px;
}
.lp-warn-icon {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: #d4a659;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lp-warn-title {
  font-size: 13px;
  font-weight: 800;
  color: #6f4d14;
  letter-spacing: -0.2px;
}
.lp-warn-meta {
  font-size: 11.5px;
  font-weight: 700;
  color: #92400e;
  margin-top: 2px;
  line-height: 1.4;
}
</style>
