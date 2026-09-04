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
        <!-- Premium hero - book on left, dashboard on right (mirrors seller passport) -->
        <div class="pp-hero">
          <div class="pp-hero-glow" />
          <div class="pp-hero-book">
            <PassportCard
              :line1="passport.addressLine1"
              :line2="passport.postcode"
              type="LANDLORD"
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
                  <img src="/op-icons/passportview/progressMan.svg" alt="" class="pp-hero-dash-man" loading="lazy" />
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
          <!-- List / Map view toggle - uses the same SegmentedSwitch the
               seller passport uses, so both passport types feel like the
               same product. -->
          <div class="lp-view-toggle">
            <SegmentedSwitch v-model="complianceView" :options="viewOptions" />
          </div>

          <!-- Legislation & news rail - moved to the landlord dashboard
               (pages/dashboard.vue), which now owns this section since
               it's account-wide, not tied to one property's passport.
               Still driven by the same shared dataset (see
               utils/landlordNews.ts) so it can't drift between the two. -->

          <!-- LIST VIEW (existing grouped sections) -->
          <template v-if="complianceView === 'list'">
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
                <img
                  :src="iconUrlForSection(section.key)"
                  :alt="section.title"
                  class="lp-sec-icon-img"
                />
              </div>
              <div class="lp-sec-content">
                <div class="lp-sec-row-top">
                  <div class="lp-sec-text">
                    <div class="lp-sec-name">{{ section.title }}</div>
                    <div class="lp-sec-sub">{{ cardData(section).subtitleLine }}</div>
                    <div class="lp-sec-pills">
                      <span class="lp-sec-pill lp-sec-pill--doc">
                        <img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-sec-pill-ic" loading="lazy" />
                        {{ cardData(section).rowLabel ?? (cardData(section).docCount + '/' + cardData(section).docTotal + ' doc') }}
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
                <img
                  :src="iconUrlForSection(section.key)"
                  :alt="section.title"
                  class="lp-sec-icon-img"
                />
              </div>
              <div class="lp-sec-content">
                <div class="lp-sec-row-top">
                  <div class="lp-sec-text">
                    <div class="lp-sec-name">{{ section.title }}</div>
                    <div class="lp-sec-sub">{{ cardData(section).subtitleLine }}</div>
                    <div class="lp-sec-pills">
                      <span class="lp-sec-pill lp-sec-pill--doc">
                        <img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-sec-pill-ic" loading="lazy" />
                        {{ cardData(section).rowLabel ?? (cardData(section).docCount + '/' + cardData(section).docTotal + ' doc') }}
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
          </template>

          <!-- MAP VIEW - landlord-specific clone of PassportMapView.
               Same isometric path, roads, decorations and walking-lady
               as the seller's map; only the section icons are swapped
               for the rental-passport SVG set. -->
          <LandlordPassportMapView
            v-else
            :sections="allComplianceSections"
            @open-section="openSection"
          />
        </div>

        <!-- VAULT -->
        <div v-show="activeTab === 'vault'">
          <div class="section-heading">All uploaded documents</div>
          <div v-if="uploadedDocs.length === 0" class="lp-empty">
            No documents uploaded yet. Tap a section in the Compliance tab to upload one.
          </div>
          <div v-for="doc in uploadedDocs" :key="doc.id" class="lp-doc">
            <div class="lp-doc-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-icon-img" loading="lazy" /></div>
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
              <img
                :src="iconUrlForSection(section.key)"
                :alt="section.title"
                class="lp-sec-icon-img"
              />
            </div>
            <div class="lp-sec-content">
              <div class="lp-sec-row-top">
                <div class="lp-sec-text">
                  <div class="lp-sec-name">{{ section.title }}</div>
                  <div class="lp-sec-sub">{{ cardData(section).subtitleLine }}</div>
                  <div class="lp-sec-pills">
                    <span class="lp-sec-pill lp-sec-pill--doc">
                      <img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-sec-pill-ic" loading="lazy" />
                      {{ cardData(section).rowLabel ?? (cardData(section).docCount + '/' + cardData(section).docTotal + ' doc') }}
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
              hold for letting. Both passports stay live - you can keep letting in parallel.
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

            <!-- Renters' Rights Act Information Sheet - legislation links
                 (client feedback item #9, prototype's leg-note + legLink
                 list). Shown above the upload flow, which stays as the
                 landlord's record of proof-of-service. -->
            <div v-if="isInfoSheetSection" class="lp-leg-note">
              <div class="lp-leg-note-t">⚖️ The law changed on 1 May 2026</div>
              <div class="lp-leg-note-s">
                The <b>How to Rent guide was withdrawn</b> under the Renters' Rights Act 2025. Landlords now serve <b>The Renters' Rights Act Information Sheet 2026</b>. You must give the <b>official GOV.UK PDF</b> (a link on its own is not valid) - as a printed copy or attached to an email/text. Fines reach £7,000 for non-compliance.
              </div>
            </div>
            <template v-if="isInfoSheetSection">
              <a
                v-for="link in INFO_SHEET_LINKS"
                :key="link.url"
                class="lp-leg-link"
                :href="link.url"
                target="_blank"
                rel="noopener"
              >
                <div class="lp-leg-link-ic"><img src="/op-icons/matched-buyers/link.png" alt="" class="lp-leg-link-ic-img" loading="lazy" /></div>
                <div class="lp-leg-link-bd">
                  <div class="lp-leg-link-t">{{ link.title }}</div>
                  <div class="lp-leg-link-s">{{ link.sub }}</div>
                </div>
                <div class="lp-leg-link-go">↗</div>
              </a>
              <div class="lp-modal-hint" style="margin-bottom:12px">Once you've served the Information Sheet, record it below - proof of service matters if a tenancy is ever challenged.</div>
            </template>

            <!-- EPC auto-pull banner - client feedback #3: "pulled straight
                 through from land registry too". Shown alongside the normal
                 upload flow below, not instead of it - a landlord can still
                 attach the certificate PDF itself. -->
            <div v-if="isEpcSection && propertyEpc?.epcRating" class="lp-doc-preview" style="margin-bottom:12px">
              <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/environmental.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
              <div class="lp-doc-preview-info">
                <div class="lp-doc-preview-name">EPC rating {{ propertyEpc.epcRating }}{{ propertyEpc.epcScore ? ` (${propertyEpc.epcScore}/100)` : '' }}</div>
                <div class="lp-doc-preview-meta">
                  Pulled automatically{{ epcValidUntilLabel ? ' · valid until ' + epcValidUntilLabel : '' }}
                </div>
              </div>
            </div>

            <!-- Smoke & CO Alarms - no certificate; a repeatable row per
                 physical alarm (client feedback #4, prototype's datesBody). -->
            <template v-if="isAlarmsSection">
              <p class="lp-modal-hint" style="margin-top:0;margin-bottom:14px">
                <b>No certificate required.</b> Record each alarm separately - where it is, when it was tested, and when the unit expires. Alarms must be tested on the first day of every new tenancy.
              </p>
              <div v-for="(row, i) in alarmRows" :key="i" class="lp-repeat-block">
                <div class="lp-repeat-head">
                  <span>{{ row.type === 'co' ? 'CO alarm' : 'Smoke alarm' }} {{ i + 1 }}</span>
                  <button type="button" class="lp-repeat-rm" aria-label="Remove" @click="removeAlarmRow(i)">✕</button>
                </div>
                <div class="mform-section">
                  <div class="mform-label">Location</div>
                  <input v-model="row.location" type="text" class="mform-input" placeholder="e.g. Hallway, ground floor" />
                </div>
                <div class="lp-two-col">
                  <div class="mform-section">
                    <div class="mform-label">Date tested</div>
                    <input v-model="row.tested" type="date" class="mform-input" />
                  </div>
                  <div class="mform-section">
                    <div class="mform-label">Expiry / replace by</div>
                    <input v-model="row.expiry" type="date" class="mform-input" />
                  </div>
                </div>
                <div class="lp-two-col">
                  <button type="button" class="lp-toggle-chip" :class="{ on: row.present }" @click="row.present = !row.present">Present</button>
                  <button type="button" class="lp-toggle-chip" :class="{ on: row.ok }" @click="row.ok = !row.ok">Tested ✓</button>
                </div>
              </div>
              <button type="button" class="lp-add-row" @click="addAlarmRow('smoke')">＋ Add a smoke alarm</button>
              <button type="button" class="lp-add-row" @click="addAlarmRow('co')">＋ Add a CO alarm</button>
              <p class="lp-modal-hint" style="margin-bottom:10px">We'll remind you 30 days before any alarm expires. Optional: attach a photo or test log.</p>

              <!-- Evidence photo / test log - prototype's "Attach photo /
                   test log (optional)" (client feedback: we had the alarm
                   rows but not this). Kind-scoped multi-copy off the same
                   alarms_check UPLOAD question, same pattern as the other
                   per-purpose photo lists this session. -->
              <div v-for="doc in alarmEvidenceDocs" :key="doc.id" class="lp-doc-preview" style="margin-bottom:10px">
                <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
                <div class="lp-doc-preview-info">
                  <div class="lp-doc-preview-name">{{ doc.name }}</div>
                  <div class="lp-doc-preview-meta">Uploaded {{ doc.uploadedAt }}</div>
                </div>
                <button type="button" class="btn-secondary lp-doc-preview-btn" @click="viewCopyDoc(doc.fileUrl)">View</button>
                <button type="button" class="lp-repeat-rm" style="margin-left:8px" aria-label="Remove" @click="removeAlarmEvidenceDoc(doc.id)">✕</button>
              </div>
              <label class="lp-upload-row">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="lp-upload-input" :disabled="alarmEvidenceUploading" @change="onAlarmEvidenceFilePicked" />
                <span class="lp-upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </span>
                <span class="lp-upload-text">{{ alarmEvidenceUploading ? 'Uploading…' : 'Attach photo / test log (optional)' }}</span>
              </label>
            </template>

            <!-- Right to Rent - per-occupier ID checks, not a flat upload
                 (client feedback #8, prototype's occupier list). -->
            <template v-else-if="isRtrSection">
              <div v-for="(occ, i) in occupierRows" :key="i" class="lp-repeat-block">
                <div class="lp-repeat-head">
                  <span>Occupier {{ i + 1 }}</span>
                  <button type="button" class="lp-repeat-rm" aria-label="Remove" @click="removeOccupierRow(i)">✕</button>
                </div>
                <div class="mform-section">
                  <div class="mform-label">Name</div>
                  <input v-model="occ.name" type="text" class="mform-input" placeholder="Full name" />
                </div>
                <div class="mform-section">
                  <div class="mform-label">ID status</div>
                  <input v-model="occ.status" type="text" class="mform-input" placeholder="e.g. British citizen, BRP, Settled status" />
                </div>
                <div class="mform-section">
                  <div class="mform-label">Recheck by (leave blank if unlimited)</div>
                  <input v-model="occ.recheckBy" type="date" class="mform-input" />
                </div>
                <!-- Per-occupier ID-check evidence - client feedback: need
                     proof the check was actually carried out, not just a
                     status/date record. -->
                <div v-for="doc in (rtrOccDocs[i] || [])" :key="doc.id" class="lp-doc-preview" style="margin-bottom:10px">
                  <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
                  <div class="lp-doc-preview-info">
                    <div class="lp-doc-preview-name">{{ doc.name }}</div>
                    <div class="lp-doc-preview-meta">Uploaded {{ doc.uploadedAt }}{{ doc.size ? ' · ' + doc.size : '' }}</div>
                  </div>
                  <button type="button" class="btn-secondary lp-doc-preview-btn" @click="viewCopyDoc(doc.fileUrl)">View</button>
                  <button type="button" class="lp-repeat-rm" style="margin-left:8px" aria-label="Remove" @click="removeRtrOccDoc(i, doc.id)">✕</button>
                </div>
                <label class="lp-upload-row">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    class="lp-upload-input"
                    :disabled="rtrOccUploading === i"
                    @change="onRtrOccFilePicked(i, $event)"
                  />
                  <span class="lp-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </span>
                  <span class="lp-upload-text">
                    {{ rtrOccUploading === i ? 'Uploading…' : ((rtrOccDocs[i]?.length ?? 0) ? 'Add another copy' : 'Upload ID check') }}
                    <small>Share code result or ID copy · PDF/JPG/PNG up to 20MB</small>
                  </span>
                </label>
              </div>
              <button type="button" class="lp-add-row" @click="addOccupierRow()">＋ Add another occupier</button>
              <p class="lp-modal-hint">If status is unlimited (British/Irish citizen or settled status), leave "Recheck by" blank - no follow-up needed. We'll remind you 30 days before any recheck date.</p>
            </template>

            <!-- Multi-copy certificate retention (client feedback 1a/3) -
                 every uploaded copy stays on file instead of being
                 overwritten, since a landlord may need to keep previous
                 certificates for compliance history. -->
            <template v-else-if="isMultiCopySection">
              <!-- Legionella: guided assessment OR upload your own (client
                   feedback item #5 - "start guided assesment and upload as
                   assesement - so they can either do it inside the
                   application or add thier own"). -->
              <template v-if="isLegionellaSection">
                <div v-if="!legSavedResult" class="lp-leg-cta" @click="openLegAssess">
                  <img src="/op-icons/misc/waterDroplet.png" alt="" class="lp-leg-cta-ic-img" loading="lazy" />
                  <div class="lp-leg-cta-bd">
                    <div class="lp-leg-cta-t">Start guided assessment</div>
                    <div class="lp-leg-cta-s">Six quick questions - no professional needed for a standard home</div>
                  </div>
                  <div class="lp-leg-cta-go">›</div>
                </div>
                <div v-else class="lp-leg-result" :class="`lp-leg-result--${legSavedResult.level.toLowerCase()}`">
                  <div class="lp-leg-result-eyebrow">Assessed risk level</div>
                  <div class="lp-leg-result-level">{{ legSavedResult.level }} risk</div>
                  <div class="lp-leg-result-meta">Assessed {{ new Date(legSavedResult.assessedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }} · next review {{ new Date(legSavedResult.nextReview).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) }}</div>
                  <button type="button" class="lp-leg-retake" @click="openLegAssess">Retake assessment</button>
                </div>
                <div class="mlabel" style="margin-top:16px">Or add your own</div>
                <p class="lp-modal-hint" style="margin-top:0;margin-bottom:10px">Already had a professional assessment done? Upload it here instead.</p>
              </template>

              <!-- Inventory & Schedule of Condition - build in umovingu, or
                   upload an existing one (client feedback item #10). -->
              <template v-if="isInventorySection">
                <div v-if="!invSavedRecord" class="lp-leg-cta" @click="openInvWizard">
                  <img src="/op-icons/investment/clipboardChecklist.png" alt="" class="lp-leg-cta-ic-img" loading="lazy" />
                  <div class="lp-leg-cta-bd">
                    <div class="lp-leg-cta-t">Build inventory in umovingu</div>
                    <div class="lp-leg-cta-s">Room-by-room · condition + cleanliness · notes</div>
                  </div>
                  <div class="lp-leg-cta-go">›</div>
                </div>
                <div v-else class="lp-leg-result lp-leg-result--medium" style="background: linear-gradient(140deg,#2d2466,#231d45 60%,#15102e)">
                  <div class="lp-leg-result-eyebrow">Inventory complete</div>
                  <div class="lp-leg-result-level">{{ invSavedRecord.rooms.length }} rooms recorded</div>
                  <div class="lp-leg-result-meta">Completed {{ new Date(invSavedRecord.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}</div>
                  <div class="lp-two-col" style="margin-top:10px">
                    <button type="button" class="lp-leg-retake" style="flex:1" @click="openInvSigningStatus">Signing status</button>
                    <button type="button" class="lp-leg-retake" style="flex:1" @click="openInvWizard">New inventory</button>
                  </div>
                </div>
                <div class="mlabel" style="margin-top:16px">Or add your own</div>
                <p class="lp-modal-hint" style="margin-top:0;margin-bottom:10px">Already have an inventory report? Upload it here instead - or attach photos alongside the one you build above.</p>
              </template>

              <!-- Tenancy Agreement - generate in umovingu, or upload an
                   existing signed agreement (client feedback item #6). -->
              <template v-if="isTenancySection">
                <div v-if="!tnSavedRecord" class="lp-leg-cta" @click="openTnWizard">
                  <img src="/op-icons/misc/signature.png" alt="" class="lp-leg-cta-ic-img" loading="lazy" />
                  <div class="lp-leg-cta-bd">
                    <div class="lp-leg-cta-t">Create a tenancy agreement</div>
                    <div class="lp-leg-cta-s">Assured periodic tenancy - the written statement built in</div>
                  </div>
                  <div class="lp-leg-cta-go">›</div>
                </div>
                <div v-else class="lp-leg-result lp-leg-result--medium" style="background: linear-gradient(140deg,#2d2466,#231d45 60%,#15102e)">
                  <div class="lp-leg-result-eyebrow">Tenancy agreement ready</div>
                  <div class="lp-leg-result-level">{{ tnSavedRecord.tenantName || 'Agreement generated' }}</div>
                  <div class="lp-leg-result-meta">Created {{ new Date(tnSavedRecord.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}</div>
                  <div class="lp-two-col" style="margin-top:10px">
                    <button type="button" class="lp-leg-retake" style="flex:1" @click="openTnSigningStatus">Signing status</button>
                    <button type="button" class="lp-leg-retake" style="flex:1" @click="openTnWizard">New agreement</button>
                  </div>
                </div>
                <div class="mlabel" style="margin-top:16px">Or add your own</div>
                <p class="lp-modal-hint" style="margin-top:0;margin-bottom:10px">Already have a signed tenancy agreement? Upload it here instead.</p>
              </template>

              <!-- White Goods has its own two dedicated doc lists (Manuals/
                   Warranties, below) instead of one generic "certificate"
                   slot - this shared multi-copy upload row doesn't apply
                   to it the way it does to Gas Safety/EICR/EPC/Insurance/
                   Deposit/Legionella/Inventory/Tenancy's own-copy uploads. -->
              <template v-if="!isWhiteGoodsSection">
                <div v-for="doc in mergedCopyDocs" :key="doc.id" class="lp-doc-preview" style="margin-bottom:10px">
                  <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
                  <div class="lp-doc-preview-info">
                    <div class="lp-doc-preview-name">{{ doc.name }}</div>
                    <div class="lp-doc-preview-meta">Uploaded {{ doc.uploadedAt }}{{ doc.size ? ' · ' + doc.size : '' }}</div>
                  </div>
                  <button type="button" class="btn-secondary lp-doc-preview-btn" @click="viewCopyDoc(doc.fileUrl)">
                    View
                  </button>
                  <button v-if="doc.id !== '__legacy__'" type="button" class="lp-repeat-rm" style="margin-left:8px" aria-label="Remove" @click="removeCopyDoc(doc.id)">✕</button>
                </div>

                <label class="lp-upload-row">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    class="lp-upload-input"
                    :disabled="copyUploading"
                    @change="onCopyFilePicked"
                  />
                  <span class="lp-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </span>
                  <span class="lp-upload-text">
                    {{ copyUploading ? 'Uploading…' : (mergedCopyDocs.length ? ('Add another ' + drawerUploadNoun) : ('Upload ' + drawerUploadNoun)) }}
                    <small>PDF, JPG, PNG, DOCX up to 20MB</small>
                  </span>
                </label>
              </template>

              <!-- Deposit Protection: a second, legally distinct document -
                   the signed prescribed information actually SERVED to the
                   tenant, tracked separately from the scheme certificate
                   above (client feedback item #7). -->
              <template v-if="isDepositSection">
                <div class="mlabel" style="margin-top:16px">Served prescribed information</div>
                <p class="lp-modal-hint" style="margin-top:0;margin-bottom:10px">Upload the signed copy of the prescribed information you actually <b>served to the tenant</b> - your proof it was given within 30 days.</p>
                <div v-for="doc in piCopyDocs" :key="doc.id" class="lp-doc-preview" style="margin-bottom:10px">
                  <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
                  <div class="lp-doc-preview-info">
                    <div class="lp-doc-preview-name">{{ doc.name }}</div>
                    <div class="lp-doc-preview-meta">Uploaded {{ doc.uploadedAt }}{{ doc.size ? ' · ' + doc.size : '' }}</div>
                  </div>
                  <button type="button" class="btn-secondary lp-doc-preview-btn" @click="viewCopyDoc(doc.fileUrl)">View</button>
                  <button type="button" class="lp-repeat-rm" style="margin-left:8px" aria-label="Remove" @click="removePiCopyDoc(doc.id)">✕</button>
                </div>
                <label class="lp-upload-row">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    class="lp-upload-input"
                    :disabled="piCopyUploading"
                    @change="onPiCopyFilePicked"
                  />
                  <span class="lp-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </span>
                  <span class="lp-upload-text">
                    {{ piCopyUploading ? 'Uploading…' : (piCopyDocs.length ? 'Add another copy' : 'Upload served prescribed information') }}
                    <small>Signed copy given to the tenant · PDF up to 20MB</small>
                  </span>
                </label>

                <div class="mform-section" style="margin-top:16px">
                  <div class="mform-label">Scheme</div>
                  <input v-model="depositScheme" type="text" class="mform-input" placeholder="e.g. mydeposits" />
                </div>
                <div class="lp-two-col">
                  <div class="mform-section">
                    <div class="mform-label">Date PI served</div>
                    <input v-model="depositPiDate" type="date" class="mform-input" />
                  </div>
                  <div class="mform-section">
                    <div class="mform-label">Method</div>
                    <input v-model="depositMethod" type="text" class="mform-input" placeholder="e.g. Email + hard copy" />
                  </div>
                </div>

                <div class="mlabel" style="margin-top:16px">What the prescribed information must contain</div>
                <p class="lp-modal-hint" style="margin-top:0;margin-bottom:6px">The law requires you give the tenant this within 30 days of receiving the deposit - check, serve, then upload the signed copy above.</p>
                <div v-for="item in PI_CHECKLIST" :key="item.t" class="lp-pi-item">
                  <div class="lp-pi-check">✓</div>
                  <div class="lp-pi-tx">
                    <div class="lp-pi-t">{{ item.t }}</div>
                    <div class="lp-pi-s">{{ item.s }}</div>
                  </div>
                </div>
                <p class="lp-modal-hint" style="margin-top:12px"><b>Why it matters:</b> if the prescribed information isn't served correctly, the tenant can claim up to 3× the deposit and possession can be affected.</p>
              </template>

              <!-- White Goods & Appliances - new section (client feedback:
                   not in the original 11 items, but fully specified in the
                   prototype's whitegoodsBody). Appliances list, manuals +
                   warranties (two kind-scoped doc lists off the same
                   upload question), tenant-facing notes, and appliance
                   cover/breakdown insurance details. -->
              <template v-if="isWhiteGoodsSection">
                <p class="lp-modal-hint" style="margin-top:0;margin-bottom:14px">Keep everything for the white goods you provide - so the tenant can use them, and you're covered if one fails.</p>

                <div class="mlabel">Appliances provided</div>
                <div v-for="(a, i) in wgAppliances" :key="i" class="lp-repeat-block">
                  <div class="lp-repeat-head">
                    <span>Appliance {{ i + 1 }}</span>
                    <button v-if="wgAppliances.length > 1" type="button" class="lp-repeat-rm" aria-label="Remove" @click="removeWgAppliance(i)">✕</button>
                  </div>
                  <div class="mform-section">
                    <div class="mform-label">Appliance</div>
                    <input v-model="a.name" type="text" class="mform-input" placeholder="e.g. Fridge / freezer" />
                  </div>
                  <div class="lp-two-col">
                    <div class="mform-section">
                      <div class="mform-label">Model</div>
                      <input v-model="a.model" type="text" class="mform-input" placeholder="Model" />
                    </div>
                    <div class="mform-section">
                      <div class="mform-label">Serial no.</div>
                      <input v-model="a.serial" type="text" class="mform-input" placeholder="Serial" />
                    </div>
                  </div>
                </div>
                <button type="button" class="lp-add-row" @click="addWgAppliance">＋ Add another appliance</button>

                <div class="mlabel" style="margin-top:18px">Manuals</div>
                <div v-for="doc in copyDocs" :key="doc.id" class="lp-doc-preview" style="margin-bottom:10px">
                  <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
                  <div class="lp-doc-preview-info">
                    <div class="lp-doc-preview-name">{{ doc.name }}</div>
                    <div class="lp-doc-preview-meta">Uploaded {{ doc.uploadedAt }}</div>
                  </div>
                  <button type="button" class="btn-secondary lp-doc-preview-btn" @click="viewCopyDoc(doc.fileUrl)">View</button>
                  <button type="button" class="lp-repeat-rm" style="margin-left:8px" aria-label="Remove" @click="removeCopyDoc(doc.id)">✕</button>
                </div>
                <label class="lp-upload-row">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="lp-upload-input" :disabled="copyUploading" @change="onCopyFilePicked" />
                  <span class="lp-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  </span>
                  <span class="lp-upload-text">{{ copyUploading ? 'Uploading…' : (copyDocs.length ? 'Add another manual' : 'Upload a manual') }}<small>User / instruction manual · PDF up to 20MB</small></span>
                </label>

                <div class="mlabel" style="margin-top:18px">Warranties</div>
                <div v-for="doc in warrantyDocs" :key="doc.id" class="lp-doc-preview" style="margin-bottom:10px">
                  <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
                  <div class="lp-doc-preview-info">
                    <div class="lp-doc-preview-name">{{ doc.name }}</div>
                    <div class="lp-doc-preview-meta">Uploaded {{ doc.uploadedAt }}</div>
                  </div>
                  <button type="button" class="btn-secondary lp-doc-preview-btn" @click="viewCopyDoc(doc.fileUrl)">View</button>
                  <button type="button" class="lp-repeat-rm" style="margin-left:8px" aria-label="Remove" @click="removeWarrantyDoc(doc.id)">✕</button>
                </div>
                <label class="lp-upload-row">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="lp-upload-input" :disabled="warrantyUploading" @change="onWarrantyFilePicked" />
                  <span class="lp-upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                  </span>
                  <span class="lp-upload-text">{{ warrantyUploading ? 'Uploading…' : (warrantyDocs.length ? 'Add another warranty' : 'Upload a warranty') }}<small>Warranty / guarantee · PDF up to 20MB</small></span>
                </label>

                <div class="mform-section" style="margin-top:18px">
                  <div class="mform-label">How things work (optional)</div>
                  <textarea v-model="wgHowItWorks" class="lp-inv-note" style="min-height:80px" placeholder="Instructions for the tenant - e.g. 'The washing machine door needs a firm push to lock. Dishwasher salt is under the sink.'" />
                </div>

                <div class="mlabel" style="margin-top:18px">Appliance cover / breakdown insurance</div>
                <div class="mform-section">
                  <input v-model="wgCoverProvider" type="text" class="mform-input" placeholder="Provider - e.g. Domestic &amp; General" />
                </div>
                <div class="lp-two-col">
                  <input v-model="wgCoverPolicyNumber" type="text" class="mform-input" placeholder="Policy number" />
                  <input v-model="wgCoverRenewalDate" type="date" class="mform-input" />
                </div>
                <div class="mform-section" style="margin-top:10px">
                  <input v-model="wgCoverContact" type="text" class="mform-input" placeholder="Contact for claims / repairs" />
                </div>
                <p class="lp-modal-hint" style="margin-top:8px">If an appliance breaks mid-tenancy, these details get a repair booked fast.</p>
                <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>
              </template>
            </template>

            <!-- Existing document preview -->
            <div v-else-if="drawerFileUrl" class="lp-doc-preview">
              <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
              <div class="lp-doc-preview-info">
                <div class="lp-doc-preview-name">{{ drawerDocName || (drawerUploadNounCap + ' on file') }}</div>
                <div class="lp-doc-preview-meta">
                  {{ drawerExpiryLabel ? 'Expires ' + drawerExpiryLabel : 'No expiry set' }}
                </div>
              </div>
              <button type="button" class="btn-secondary lp-doc-preview-btn" @click="downloadDrawerFile">
                View
              </button>
            </div>

            <template v-if="!isAlarmsSection && !isRtrSection && !isMultiCopySection">
              <!-- Expiring-soon banner -->
              <div v-if="drawerExpiringSoon" class="lp-warn-banner">
                <img src="/op-icons/legionella/renewalWarning.png" alt="" class="lp-warn-icon-img" loading="lazy" />
                <div>
                  <div class="lp-warn-title">Renewal due in {{ drawerDaysLeft }} day{{ drawerDaysLeft === 1 ? '' : 's' }}</div>
                  <div class="lp-warn-meta">
                    Replace the {{ drawerUploadNoun }} before {{ drawerExpiryLabel }} to stay compliant.
                  </div>
                </div>
              </div>

              <!-- Pending file -->
              <div v-if="pendingFile" class="lp-doc-preview lp-doc-preview--pending">
                <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
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
                  {{ drawerFileUrl ? ('Replace ' + drawerUploadNoun) : ('Upload ' + drawerUploadNoun) }}
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
            </template>

            <!-- Expiry - shown for the generic single-slot flow (pendingFile
                 or an existing DATE question) AND for multi-copy sections,
                 which still track one expiry per section independent of
                 how many certificate copies are on file. Every landlord
                 section is seeded with a DATE question by design (see
                 seed.ts), including Alarms/RTR/Legionella - excluded here
                 since each of those has its own dedicated UI that already
                 covers dates in a way that makes sense for it. -->
            <div v-if="(drawerDateQuestion || pendingFile) && !isAlarmsSection && !isRtrSection && !isLegionellaSection && !isWhiteGoodsSection" class="mform-section">
                <div class="mform-label">{{ isDepositSection ? 'Date protected' : 'Expiry / next renewal date' }}</div>
                <input
                  v-model="drawerExpiryDraft"
                  type="date"
                  class="mform-input"
                  :max="isDepositSection ? todayDateStr : undefined"
                  :min="isDepositSection ? undefined : todayDateStr"
                />
                <p v-if="isDepositSection" class="lp-modal-hint">The date the deposit was registered with the scheme - must be within 30 days of receiving it.</p>
                <p v-else class="lp-modal-hint">
                  <template v-if="drawerCadenceLabel"><b>{{ drawerCadenceLabel }}</b> - </template>we'll remind you 30 days before this date so you can stay compliant.
                </p>
              </div>

            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>
          </div>
          <div class="lp-modal-footer">
            <button
              v-if="pendingFile && !isAlarmsSection && !isRtrSection && !isMultiCopySection"
              class="btn-secondary"
              type="button"
              :disabled="drawerUploading"
              @click="pendingFile = null"
            >
              Cancel
            </button>
            <button
              v-if="isAlarmsSection || isRtrSection"
              class="btn-primary"
              type="button"
              style="flex: 1;"
              :disabled="drawerListSaving"
              @click="saveDrawerList"
            >
              {{ drawerListSaving ? 'Saving…' : 'Save' }}
            </button>
            <button
              v-else-if="isWhiteGoodsSection"
              class="btn-primary"
              type="button"
              style="flex: 1;"
              :disabled="wgSaving"
              @click="saveWhiteGoods"
            >
              {{ wgSaving ? 'Saving…' : 'Done' }}
            </button>
            <button
              v-else-if="isMultiCopySection"
              class="btn-primary"
              type="button"
              style="flex: 1;"
              :disabled="drawerListSaving"
              @click="saveMultiCopyExpiry"
            >
              {{ drawerListSaving ? 'Saving…' : 'Done' }}
            </button>
            <button
              v-else-if="pendingFile"
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

    <!-- Legionella guided risk assessment (client feedback item #5) - a
         full-screen wizard, not the compact section drawer, matching the
         prototype: intro -> 6 questions -> scored result -> saved. -->
    <Teleport to="body">
      <div v-if="legAssessOpen" class="lp-assess">
        <!-- Intro -->
        <div v-if="legScreen === 'intro'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Close" @click="closeLegAssess">‹</button>
            <div class="lp-assess-title">Risk assessment</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="lp-assess-intro-ic"><img src="/op-icons/misc/waterDroplet.png" alt="" class="lp-assess-intro-ic-img" loading="lazy" /></div>
            <div class="lp-assess-intro-h">You can usually do this yourself</div>
            <div class="lp-assess-intro-s">For a standard home, the law lets a competent landlord carry out their own Legionella risk assessment - there's no such thing as a required "Legionella certificate". We'll guide you through it.</div>
            <div class="lp-assess-info">
              <div class="lp-assess-info-t">What you'll get</div>
              <div class="lp-assess-info-s">Six short questions on your water system → a scored risk level → tailored control actions → a dated record on the Passport with a 2-year review reminder.</div>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="legStartQuestions">Start the assessment →</button>
          </div>
        </div>

        <!-- Questions -->
        <div v-else-if="legScreen === 'q'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="legBack">‹</button>
            <div class="lp-assess-title">Assessment</div>
            <div class="lp-assess-count">{{ legStep + 1 }} / {{ LEG_QUESTIONS.length }}</div>
          </div>
          <div class="lp-assess-steps">
            <div v-for="(q, i) in LEG_QUESTIONS" :key="q.key" class="lp-assess-step" :class="{ on: i <= legStep }" />
          </div>
          <div class="lp-assess-scroll">
            <div class="lp-assess-qnum">{{ LEG_QUESTIONS[legStep].num }}</div>
            <div class="lp-assess-qh">{{ LEG_QUESTIONS[legStep].h }}</div>
            <div class="lp-assess-qs">{{ LEG_QUESTIONS[legStep].s }}</div>
            <div
              v-for="(o, i) in LEG_QUESTIONS[legStep].opts"
              :key="i"
              class="lp-assess-opt"
              :class="{ on: legAnswers[LEG_QUESTIONS[legStep].key] === i }"
              @click="legPick(i)"
            >
              <div class="lp-assess-opt-ic">
                <img v-if="o.ic.startsWith('/')" :src="o.ic" alt="" class="lp-assess-opt-ic-img" loading="lazy" />
                <template v-else>{{ o.ic }}</template>
              </div>
              <div class="lp-assess-opt-bd">
                <div class="lp-assess-opt-t">{{ o.t }}</div>
                <div class="lp-assess-opt-d">{{ o.d }}</div>
              </div>
              <div class="lp-assess-opt-r" />
            </div>
          </div>
          <div class="lp-assess-foot">
            <button
              class="btn-primary"
              type="button"
              style="width:100%"
              :disabled="legAnswers[LEG_QUESTIONS[legStep].key] == null"
              @click="legNext"
            >
              {{ legStep === LEG_QUESTIONS.length - 1 ? 'See my result →' : 'Continue' }}
            </button>
          </div>
        </div>

        <!-- Result -->
        <div v-else-if="legScreen === 'result'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="legScreen = 'q'">‹</button>
            <div class="lp-assess-title">Your assessment</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="lp-assess-resband" :class="`lp-assess-resband--${legLevel.toLowerCase()}`">
              <div class="lp-assess-res-eyebrow">Assessed risk level</div>
              <div class="lp-assess-res-level">{{ legLevel }} risk</div>
              <div class="lp-assess-res-desc">{{ legLevelDesc }}</div>
            </div>
            <div v-for="(f, i) in legFlags" :key="i" class="lp-assess-flag" :class="`lp-assess-flag--${f.type}`">
              <div class="lp-assess-flag-ic">
                <img v-if="f.ic.startsWith('/')" :src="f.ic" alt="" class="lp-assess-flag-ic-img" loading="lazy" />
                <template v-else>{{ f.ic }}</template>
              </div>
              <div class="lp-assess-flag-t">{{ f.t }}</div>
            </div>
            <div class="lp-assess-sech">Your control actions</div>
            <div v-for="(a, i) in legActions" :key="i" class="lp-assess-action">
              <div class="lp-assess-action-ic">
                <img v-if="a.ic.startsWith('/')" :src="a.ic" alt="" class="lp-assess-action-ic-img" loading="lazy" />
                <template v-else>{{ a.ic }}</template>
              </div>
              <div class="lp-assess-action-bd">
                <div class="lp-assess-action-t">{{ a.t }}</div>
                <div class="lp-assess-action-s">{{ a.s }}</div>
                <span class="lp-assess-action-freq">{{ a.f }}</span>
              </div>
            </div>
            <div class="lp-assess-sech">Assessment record</div>
            <div class="lp-assess-sum">
              <div class="lp-assess-sum-row"><span>Property</span><span>{{ passport?.addressLine1 || passport?.property?.addressLine1 }}</span></div>
              <div class="lp-assess-sum-row"><span>Water system</span><span>{{ LEG_QUESTIONS[0].opts[legAnswers.system]?.t }}</span></div>
              <div class="lp-assess-sum-row"><span>Assessed risk</span><span>{{ legLevel }}</span></div>
              <div class="lp-assess-sum-row"><span>Assessed by</span><span>You (landlord)</span></div>
            </div>
            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" :disabled="legSaving" @click="saveLegAssessment">
              {{ legSaving ? 'Saving…' : 'Save to Passport' }}
            </button>
          </div>
        </div>

        <!-- Done -->
        <div v-else-if="legScreen === 'done'" class="lp-assess-screen">
          <div class="lp-assess-scroll">
            <div class="lp-assess-ok">✓</div>
            <div class="lp-assess-intro-h">Assessment complete</div>
            <div class="lp-assess-intro-s">Dated, recorded and stored on the Property Passport. Your Legionella card is now marked complete.</div>
            <div class="lp-assess-sum" style="margin-top:20px">
              <div class="lp-assess-sum-row"><span>Assessed by</span><span>You (landlord)</span></div>
              <div class="lp-assess-sum-row"><span>Date</span><span>{{ new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span></div>
              <div class="lp-assess-sum-row"><span>Next review</span><span>reminder set</span></div>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="legAssessOpen = false; showSectionDrawer = false">Back to compliance</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Inventory & Schedule of Condition (client feedback item #10) -
         setup wizard -> room list -> per-room condition record -> review
         -> saved. -->
    <Teleport to="body">
      <div v-if="invOpen" class="lp-assess">
        <!-- Setup, step 1: furnishing / type / prepared by -->
        <div v-if="invScreen === 'setup' && invWizStep === 1" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Close" @click="closeInvWizard">‹</button>
            <div class="lp-assess-title">New inventory</div>
            <div class="lp-assess-count">1 / 2</div>
          </div>
          <div class="lp-assess-steps"><div class="lp-assess-step on" /><div class="lp-assess-step" /></div>
          <div class="lp-assess-scroll">
            <div class="lp-assess-qh" style="font-size:19px">Type &amp; furnishing</div>
            <div class="lp-assess-qs">The property is already on your Passport - we just need how it's let.</div>
            <div class="mlabel">Furnishing</div>
            <div class="lp-inv-chiprow">
              <button type="button" class="lp-inv-chip" :class="{ on: invFurnishing === 'furnished' }" @click="invFurnishing = 'furnished'"><img src="/op-icons/investment/armchair.png" alt="" class="lp-inv-chip-ic" loading="lazy" /><span>Furnished</span></button>
              <button type="button" class="lp-inv-chip" :class="{ on: invFurnishing === 'part' }" @click="invFurnishing = 'part'"><img src="/op-icons/legionella/partFurnished.png" alt="" class="lp-inv-chip-ic" loading="lazy" /><span>Part-furn.</span></button>
              <button type="button" class="lp-inv-chip" :class="{ on: invFurnishing === 'unfurnished' }" @click="invFurnishing = 'unfurnished'"><img src="/op-icons/legionella/unfurnished.png" alt="" class="lp-inv-chip-ic" loading="lazy" /><span>Unfurnished</span></button>
            </div>
            <div class="mlabel" style="margin-top:16px">Inventory type</div>
            <div class="lp-inv-chiprow">
              <button type="button" class="lp-inv-chip" :class="{ on: invType === 'checkin' }" @click="invType = 'checkin'"><img src="/op-icons/legionella/checkIn.png" alt="" class="lp-inv-chip-ic" loading="lazy" /><span>Check-in</span></button>
              <button type="button" class="lp-inv-chip" :class="{ on: invType === 'interim' }" @click="invType = 'interim'"><img src="/op-icons/homescore/magnifier.png" alt="" class="lp-inv-chip-ic" loading="lazy" /><span>Interim</span></button>
              <button type="button" class="lp-inv-chip" :class="{ on: invType === 'checkout' }" @click="invType = 'checkout'"><img src="/op-icons/legionella/checkOut.png" alt="" class="lp-inv-chip-ic" loading="lazy" /><span>Check-out</span></button>
            </div>
            <div class="mlabel" style="margin-top:16px">Prepared by</div>
            <div class="lp-inv-chiprow">
              <button type="button" class="lp-inv-chip" :class="{ on: invPreparedBy === 'landlord' }" @click="invPreparedBy = 'landlord'"><img src="/op-icons/investment/key.png" alt="" class="lp-inv-chip-ic" loading="lazy" /><span>Landlord</span></button>
              <button type="button" class="lp-inv-chip" :class="{ on: invPreparedBy === 'agent' }" @click="invPreparedBy = 'agent'"><img src="/op-icons/investment/officeBuilding.png" alt="" class="lp-inv-chip-ic" loading="lazy" /><span>Agent</span></button>
              <button type="button" class="lp-inv-chip" :class="{ on: invPreparedBy === 'clerk' }" @click="invPreparedBy = 'clerk'"><img src="/op-icons/investment/clipboardChecklist.png" alt="" class="lp-inv-chip-ic" loading="lazy" /><span>Ind. clerk</span></button>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="invWizNext">Continue</button>
          </div>
        </div>

        <!-- Setup, step 2: tenancy & handover -->
        <div v-else-if="invScreen === 'setup' && invWizStep === 2" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="invWizBack">‹</button>
            <div class="lp-assess-title">New inventory</div>
            <div class="lp-assess-count">2 / 2</div>
          </div>
          <div class="lp-assess-steps"><div class="lp-assess-step on" /><div class="lp-assess-step on" /></div>
          <div class="lp-assess-scroll">
            <div class="lp-assess-qh" style="font-size:19px">Tenancy &amp; handover</div>
            <div class="lp-assess-qs">Ties the report to the tenant, deposit and keys.</div>
            <div class="mform-section">
              <div class="mform-label">Tenant name(s)</div>
              <input v-model="invTenantName" type="text" class="mform-input" placeholder="e.g. Jordan Reeves" />
            </div>
            <div class="lp-two-col">
              <div class="mform-section">
                <div class="mform-label">Move-in date</div>
                <input v-model="invMoveInDate" type="date" class="mform-input" />
              </div>
              <div class="mform-section">
                <div class="mform-label">Deposit held</div>
                <input v-model="invDeposit" type="text" class="mform-input" placeholder="£1,325" />
              </div>
            </div>
            <div class="mform-section">
              <div class="mform-label">Keys / fobs handed over</div>
              <input v-model="invKeys" type="text" class="mform-input" placeholder="e.g. 2 door keys · 1 fob" />
            </div>
            <div class="mlabel" style="margin-top:12px">Meter readings at start</div>
            <div class="lp-two-col">
              <input v-model="invMeterGas" type="text" class="mform-input" placeholder="Gas" />
              <input v-model="invMeterElectric" type="text" class="mform-input" placeholder="Electric" />
            </div>
            <div style="height:8px" />
            <input v-model="invMeterWater" type="text" class="mform-input" placeholder="Water" />
            <div class="mlabel" style="margin-top:12px">Smart meter serial numbers</div>
            <input v-model="invSmartMeterGas" type="text" class="mform-input" placeholder="Gas smart meter serial" />
            <div style="height:8px" />
            <input v-model="invSmartMeterElectric" type="text" class="mform-input" placeholder="Electricity smart meter serial" />
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="invWizNext">Start capturing →</button>
          </div>
        </div>

        <!-- Room list overview -->
        <div v-else-if="invScreen === 'rooms'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Close" @click="closeInvWizard">‹</button>
            <div class="lp-assess-title">New inventory</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="lp-inv-prog">
              <div class="lp-inv-pbar"><div class="lp-inv-pfill" :style="{ width: (invDoneCount / invRooms.length * 100) + '%' }" /></div>
              <div class="lp-inv-ptext"><span><b>{{ invDoneCount }}</b> of {{ invRooms.length }} rooms done</span><span>{{ Math.round(invDoneCount / invRooms.length * 100) }}%</span></div>
            </div>
            <div v-for="r in invRooms" :key="r.id" class="lp-inv-room" @click="invOpenRoom(r.id)">
              <div class="lp-inv-room-ic">
                <img v-if="r.icon.startsWith('/')" :src="r.icon" alt="" class="lp-inv-room-ic-img" loading="lazy" />
                <template v-else>{{ r.icon }}</template>
              </div>
              <div class="lp-inv-room-bd">
                <div class="lp-inv-room-n">{{ r.name }}</div>
                <div class="lp-inv-room-m">{{ roomIsDone(r) ? r.items.length + ' items rated' : r.items.length + ' items to check' }}</div>
              </div>
              <span class="lp-inv-badge" :class="roomIsDone(r) ? 'done' : 'todo'">{{ roomIsDone(r) ? 'Done' : 'To do' }}</span>
              <button
                v-if="r.custom"
                type="button"
                class="lp-inv-room-remove"
                aria-label="Remove room"
                @click.stop="removeCustomRoom(r.id)"
              >×</button>
              <span v-else class="lp-assess-back" style="font-size:20px">›</span>
            </div>

            <div class="lp-inv-pw-heading">Property-wide</div>
            <div class="lp-inv-room" @click="invScreen = 'safety'">
              <div class="lp-inv-room-ic">
                <img src="/op-icons/landlordPassport/smokeCOAlarms.png" alt="" class="lp-inv-room-ic-img" loading="lazy" />
              </div>
              <div class="lp-inv-room-bd">
                <div class="lp-inv-room-n">Safety &amp; compliance</div>
                <div class="lp-inv-room-m">Alarms, meters &amp; key locations</div>
              </div>
              <span class="lp-assess-back" style="font-size:20px">›</span>
            </div>
            <div class="lp-inv-room" @click="openInvBins">
              <div class="lp-inv-room-ic">🗑️</div>
              <div class="lp-inv-room-bd">
                <div class="lp-inv-room-n">Bins &amp; refuse</div>
                <div class="lp-inv-room-m">Photograph bins, colours, collection day</div>
              </div>
              <span class="lp-assess-back" style="font-size:20px">›</span>
            </div>

            <!-- Add a room the 6 defaults don't cover (study, garage,
                 conservatory, etc.) - client feedback: no way to add
                 extra rooms. Gets the same generic fixture checklist
                 every custom room needs (CUSTOM_ROOM_FIXTURES). -->
            <div class="lp-inv-addroom">
              <input
                v-model="invNewRoomName"
                type="text"
                class="lp-inv-addroom-input"
                placeholder="e.g. Study, Garage, Conservatory"
                @keyup.enter="addCustomRoom"
              />
              <button type="button" class="lp-inv-addroom-btn" :disabled="!invNewRoomName.trim()" @click="addCustomRoom">
                + Add room
              </button>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" :disabled="!invAllDone" @click="invScreen = 'review'">
              {{ invAllDone ? 'Review report →' : `Finish all rooms (${invDoneCount}/${invRooms.length})` }}
            </button>
          </div>
        </div>

        <!-- Single room: fixtures + contents condition record -->
        <div v-else-if="invScreen === 'room' && invCurRoom" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="invScreen = 'rooms'">‹</button>
            <div class="lp-assess-title lp-assess-title--iconrow">
              <img v-if="invCurRoom.icon.startsWith('/')" :src="invCurRoom.icon" alt="" class="lp-assess-title-ic-img" loading="lazy" />
              <template v-else>{{ invCurRoom.icon }}</template>
              {{ invCurRoom.name }}
            </div>
          </div>
          <div class="lp-assess-scroll">
            <div class="section-heading">Fixtures - condition &amp; cleanliness</div>
            <div v-for="item in invCurRoom.items.filter((i) => i.type === 'fixture')" :key="item.name" class="lp-inv-item">
              <div class="lp-inv-item-n">{{ item.name }}</div>
              <div class="lp-inv-rl">Condition</div>
              <div class="lp-inv-crow">
                <button type="button" class="lp-inv-cd g" :class="{ on: item.condition === 'good' }" @click="invSetCondition(item, 'good')">Good</button>
                <button type="button" class="lp-inv-cd f" :class="{ on: item.condition === 'fair' }" @click="invSetCondition(item, 'fair')">Fair</button>
                <button type="button" class="lp-inv-cd p" :class="{ on: item.condition === 'poor' }" @click="invSetCondition(item, 'poor')">Poor</button>
              </div>
              <div class="lp-inv-rl">Cleanliness</div>
              <div class="lp-inv-crow">
                <button type="button" class="lp-inv-cd cl" :class="{ on: item.cleanliness === 'clean' }" @click="invSetCleanliness(item, 'clean')">Clean</button>
                <button type="button" class="lp-inv-cd mk" :class="{ on: item.cleanliness === 'marked' }" @click="invSetCleanliness(item, 'marked')">Marked</button>
                <button type="button" class="lp-inv-cd dt" :class="{ on: item.cleanliness === 'dirty' }" @click="invSetCleanliness(item, 'dirty')">Dirty</button>
              </div>
              <textarea v-model="item.note" class="lp-inv-note" placeholder="Note any existing defect (protects the tenant)" />
            </div>

            <!-- Hidden entirely for an unfurnished let - client feedback:
                 selecting Unfurnished still asked furniture questions. -->
            <template v-if="invFurnishing !== 'unfurnished' && invCurRoom.items.some((i) => i.type === 'content')">
              <div class="section-heading">Furnishings &amp; contents</div>
              <div v-for="item in invCurRoom.items.filter((i) => i.type === 'content')" :key="item.name" class="lp-inv-item">
                <div class="lp-inv-item-n">{{ item.name }}</div>
                <div class="lp-inv-rl">Condition</div>
                <div class="lp-inv-crow">
                  <button type="button" class="lp-inv-cd g" :class="{ on: item.condition === 'good' }" @click="invSetCondition(item, 'good')">Good</button>
                  <button type="button" class="lp-inv-cd f" :class="{ on: item.condition === 'fair' }" @click="invSetCondition(item, 'fair')">Fair</button>
                  <button type="button" class="lp-inv-cd p" :class="{ on: item.condition === 'poor' }" @click="invSetCondition(item, 'poor')">Poor</button>
                </div>
                <div class="lp-inv-rl">Cleanliness</div>
                <div class="lp-inv-crow">
                  <button type="button" class="lp-inv-cd cl" :class="{ on: item.cleanliness === 'clean' }" @click="invSetCleanliness(item, 'clean')">Clean</button>
                  <button type="button" class="lp-inv-cd mk" :class="{ on: item.cleanliness === 'marked' }" @click="invSetCleanliness(item, 'marked')">Marked</button>
                  <button type="button" class="lp-inv-cd dt" :class="{ on: item.cleanliness === 'dirty' }" @click="invSetCleanliness(item, 'dirty')">Dirty</button>
                </div>
                <textarea v-model="item.note" class="lp-inv-note" placeholder="Note any existing defect (protects the tenant)" />
              </div>
            </template>

            <div class="section-heading" style="margin-top:20px">Photos <span class="lp-modal-hint" style="display:inline;margin:0">· dated &amp; timestamped</span></div>
            <div class="pgrid">
              <div v-for="doc in (roomPhotoDocs[invCurRoom.id] || [])" :key="doc.id" class="pgrid-item">
                <img :src="doc.fileUrl" alt="" class="pgrid-img" loading="lazy" @click="viewCopyDoc(doc.fileUrl)" />
                <button type="button" class="pgrid-rm" aria-label="Remove photo" @click="removeRoomPhotoDoc(invCurRoom.id, doc.id)">✕</button>
              </div>
              <label class="pgrid-add">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  class="lp-upload-input"
                  :disabled="roomPhotoUploading === invCurRoom.id"
                  @change="onRoomPhotoPicked(invCurRoom.id, $event)"
                />
                <span v-if="roomPhotoUploading === invCurRoom.id">…</span>
                <span v-else>📷<br />Add photo</span>
              </label>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="invScreen = 'rooms'">Save room</button>
          </div>
        </div>

        <!-- Property-wide: Safety & compliance -->
        <div v-else-if="invScreen === 'safety'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="invScreen = 'rooms'">‹</button>
            <div class="lp-assess-title">Safety &amp; compliance</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="section-heading">Alarms - present &amp; tested</div>
            <div v-for="(row, i) in invAlarmRows" :key="i" class="lp-repeat-block">
              <div class="lp-repeat-head">
                <span>{{ row.type === 'co' ? 'CO alarm' : 'Smoke alarm' }} {{ i + 1 }}</span>
                <button type="button" class="lp-repeat-rm" aria-label="Remove" @click="removeInvAlarmRow(i)">✕</button>
              </div>
              <div class="mform-section">
                <div class="mform-label">Location</div>
                <input v-model="row.location" type="text" class="mform-input" placeholder="e.g. Hallway, ground floor" />
              </div>
            </div>
            <button type="button" class="lp-add-row" @click="addInvAlarmRow('smoke')">＋ Add a smoke alarm</button>
            <button type="button" class="lp-add-row" @click="addInvAlarmRow('co')">＋ Add a CO alarm</button>

            <div class="section-heading" style="margin-top:20px">Key locations</div>
            <div class="mform-section">
              <div class="mform-label">🚰 Stopcock</div>
              <input v-model="invKeyStopcock" type="text" class="mform-input" placeholder="e.g. Under kitchen sink" />
            </div>
            <div class="mform-section">
              <div class="mform-label">💧 Water meter</div>
              <input v-model="invKeyWaterMeter" type="text" class="mform-input" placeholder="e.g. External chamber, front path" />
            </div>
            <div class="mform-section">
              <div class="mform-label">⚡ Fuse box / consumer unit</div>
              <input v-model="invKeyFuseBox" type="text" class="mform-input" placeholder="e.g. Hallway cupboard" />
            </div>
            <div class="mform-section">
              <div class="mform-label">🔥 Gas meter</div>
              <input v-model="invKeyGasMeter" type="text" class="mform-input" placeholder="e.g. External box, front" />
            </div>
            <div class="mform-section">
              <div class="mform-label">💡 Electricity meter</div>
              <input v-model="invKeyElectricityMeter" type="text" class="mform-input" placeholder="e.g. Hallway cupboard" />
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="invScreen = 'rooms'">Save safety &amp; compliance</button>
          </div>
        </div>

        <!-- Property-wide: Bins & refuse -->
        <div v-else-if="invScreen === 'bins'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="invScreen = 'rooms'">‹</button>
            <div class="lp-assess-title">Bins &amp; refuse</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="section-heading">Photos of bins <span class="lp-modal-hint" style="display:inline;margin:0">· dated</span></div>
            <div v-for="doc in binDocs" :key="doc.id" class="lp-doc-preview" style="margin-bottom:10px">
              <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
              <div class="lp-doc-preview-info">
                <div class="lp-doc-preview-name">{{ doc.name }}</div>
                <div class="lp-doc-preview-meta">Uploaded {{ doc.uploadedAt }}</div>
              </div>
              <button type="button" class="btn-secondary lp-doc-preview-btn" @click="viewCopyDoc(doc.fileUrl)">View</button>
              <button type="button" class="lp-repeat-rm" style="margin-left:8px" aria-label="Remove" @click="removeBinDoc(doc.id)">✕</button>
            </div>
            <label class="lp-upload-row">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="lp-upload-input" :disabled="binUploading" @change="onBinFilePicked" />
              <span class="lp-upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </span>
              <span class="lp-upload-text">{{ binUploading ? 'Uploading…' : 'Add a photo' }}<small>JPG, PNG, PDF up to 20MB</small></span>
            </label>

            <div class="section-heading" style="margin-top:20px">Refuse details</div>
            <div class="mform-section">
              <div class="mform-label">🗑️ General waste</div>
              <input v-model="invBinGeneral" type="text" class="mform-input" placeholder="Colour / location" />
            </div>
            <div class="mform-section">
              <div class="mform-label">♻️ Recycling</div>
              <input v-model="invBinRecycling" type="text" class="mform-input" placeholder="Colour / location" />
            </div>
            <div class="mform-section">
              <div class="mform-label">🍃 Food / garden waste</div>
              <input v-model="invBinFoodGarden" type="text" class="mform-input" placeholder="Colour / location (if provided)" />
            </div>
            <div class="mform-section">
              <div class="mform-label">📅 Collection day</div>
              <input v-model="invBinCollectionDay" type="text" class="mform-input" placeholder="e.g. General Tue · Recycling alt Wed" />
            </div>
            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="invScreen = 'rooms'">Save bins &amp; refuse</button>
          </div>
        </div>

        <!-- Review + evidence photos + save -->
        <div v-else-if="invScreen === 'review'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="invScreen = 'rooms'">‹</button>
            <div class="lp-assess-title">Review report</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="lp-assess-sum">
              <div v-for="r in invRooms" :key="r.id" class="lp-assess-sum-row">
                <span>
                  <img v-if="r.icon.startsWith('/')" :src="r.icon" alt="" class="lp-assess-sum-ic-img" loading="lazy" />
                  <template v-else>{{ r.icon }}</template>
                  {{ r.name }}
                </span>
                <span>✓ {{ roomItemsThatApply(r).length }} items</span>
              </div>
            </div>
            <div class="mlabel" style="margin-top:16px">Evidence photos (optional)</div>
            <p class="lp-modal-hint" style="margin-top:0;margin-bottom:10px">Attach photos to back up the condition record above.</p>
            <div v-for="doc in copyDocs" :key="doc.id" class="lp-doc-preview" style="margin-bottom:10px">
              <div class="lp-doc-preview-icon"><img src="/op-icons/passportview/titleDeedsAndPlan.png" alt="" class="lp-doc-preview-icon-img" loading="lazy" /></div>
              <div class="lp-doc-preview-info">
                <div class="lp-doc-preview-name">{{ doc.name }}</div>
                <div class="lp-doc-preview-meta">Uploaded {{ doc.uploadedAt }}</div>
              </div>
              <button type="button" class="btn-secondary lp-doc-preview-btn" @click="viewCopyDoc(doc.fileUrl)">View</button>
              <button type="button" class="lp-repeat-rm" style="margin-left:8px" aria-label="Remove" @click="removeCopyDoc(doc.id)">✕</button>
            </div>
            <label class="lp-upload-row">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" class="lp-upload-input" :disabled="copyUploading" @change="onCopyFilePicked" />
              <span class="lp-upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </span>
              <span class="lp-upload-text">{{ copyUploading ? 'Uploading…' : 'Add a photo' }}<small>JPG, PNG, PDF up to 20MB</small></span>
            </label>
            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" :disabled="invSaving" @click="saveInventory">
              {{ invSaving ? 'Saving…' : 'Sign & save to Passport' }}
            </button>
          </div>
        </div>

        <!-- Done -->
        <div v-else-if="invScreen === 'done'" class="lp-assess-screen">
          <div class="lp-assess-scroll">
            <div class="lp-tn-readydoc">
              <div class="lp-tn-readydoc-ic">📋</div>
              <div class="lp-tn-readydoc-bd">
                <div class="lp-tn-readydoc-t">Inventory &amp; Schedule of Condition</div>
                <div class="lp-tn-readydoc-s">{{ passport?.addressLine1 }}{{ invSavedRecord?.rooms ? ' · ' + invSavedRecord.rooms.length + ' rooms' : '' }}</div>
              </div>
            </div>

            <div class="mform-label" style="margin-top:20px">Next steps</div>

            <div class="lp-tn-step" @click="openInvNextStep">
              <div class="lp-tn-step-ic">✍️</div>
              <div class="lp-tn-step-bd">
                <div class="lp-tn-step-t">{{ invTenantSigned ? 'Signed by both parties' : invLandlordSigned ? 'Send to tenant to e-sign' : 'Sign the inventory' }}</div>
                <div class="lp-tn-step-s">Both parties sign in-app, with a full audit trail</div>
                <span class="lp-tn-step-pill" :class="{ done: invTenantSigned }">{{ invTenantSigned ? 'Complete' : 'Action needed' }}</span>
              </div>
              <div class="lp-tn-step-go">›</div>
            </div>

            <div class="lp-tn-step lp-tn-step--plain">
              <div class="lp-tn-step-ic">🏠</div>
              <div class="lp-tn-step-bd">
                <div class="lp-tn-step-t">Stored on the Property Passport</div>
                <div class="lp-tn-step-s">Real evidence if a deposit dispute ever comes up</div>
                <span class="lp-tn-step-pill done">Saved ✓</span>
              </div>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="invOpen = false; showSectionDrawer = false">Back to compliance</button>
          </div>
        </div>

        <!-- Landlord signs first (in-app - they're already authenticated) -->
        <div v-else-if="invScreen === 'landlord-sign'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="invScreen = 'done'">‹</button>
            <div class="lp-assess-title">Your signature</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="mform-section">
              <div class="mform-label">Your full name</div>
              <input v-model="invLandlordName" type="text" class="mform-input" placeholder="e.g. Alex Morgan" />
            </div>
            <div class="mform-label" style="margin-top:16px">Draw your signature</div>
            <SignaturePad ref="invLandlordPadRef" />
            <label class="lp-tn-consent">
              <input v-model="invLandlordConsent" type="checkbox" />
              <span>I, {{ invLandlordName || 'the landlord' }}, agree this is my signature and confirm this inventory record is accurate.</span>
            </label>
            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" :disabled="invLandlordSigning" @click="submitInvLandlordSignature">
              {{ invLandlordSigning ? 'Signing…' : 'Sign & continue' }}
            </button>
          </div>
        </div>

        <!-- Share the tenant's magic link -->
        <div v-else-if="invScreen === 'send-tenant'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="invScreen = 'done'">‹</button>
            <div class="lp-assess-title">Send to tenant</div>
          </div>
          <div class="lp-assess-scroll">
            <template v-if="invTenantSigned">
              <div class="lp-assess-ok">✓</div>
              <div class="lp-assess-intro-h">Signed by {{ invSavedRecord?.audit?.tenant?.name }}</div>
              <div class="lp-assess-intro-s">{{ new Date(invSavedRecord?.audit?.tenant?.signedAt ?? '').toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) }}</div>
            </template>
            <template v-else>
              <p class="lp-modal-hint" style="margin-top:0;margin-bottom:14px">Share this link with your tenant. No account needed - they'll review the inventory and sign with a drawn signature.</p>
              <div v-if="invGeneratingLink" class="lp-modal-hint">Generating link…</div>
              <template v-else-if="invTenantLinkUrl">
                <div class="lp-tn-linkbox">{{ invTenantLinkUrl }}</div>
                <button type="button" class="btn-primary" style="width:100%;margin-top:12px" @click="copyInvTenantSignLink">Copy link</button>
              </template>
            </template>
            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>

            <div class="mform-label" style="margin-top:20px">Audit trail</div>
            <div class="lp-tn-audit-row">
              <span class="lp-tn-audit-dot done" />
              <span>Landlord signed{{ invSavedRecord?.audit?.landlord ? ' · ' + new Date(invSavedRecord.audit.landlord.signedAt).toLocaleDateString('en-GB') : '' }}</span>
            </div>
            <div class="lp-tn-audit-row">
              <span class="lp-tn-audit-dot" :class="{ done: invTenantSigned }" />
              <span>Tenant signed{{ invSavedRecord?.audit?.tenant ? ' · ' + new Date(invSavedRecord.audit.tenant.signedAt).toLocaleDateString('en-GB') : ' - pending' }}</span>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="invOpen = false; showSectionDrawer = false">Back to compliance</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tenancy Agreement generator (client feedback item #6) - intro
         (mandatory terms explainer) -> details -> document preview ->
         saved. Clause text is a TEMPLATE pending legal review - see the
         comment on TN_CLAUSES/tnDocText in the script. -->
    <Teleport to="body">
      <div v-if="tnOpen" class="lp-assess">
        <!-- Intro -->
        <div v-if="tnScreen === 'intro'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Close" @click="closeTnWizard">‹</button>
            <div class="lp-assess-title">Tenancy agreement</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="lp-assess-intro-ic"><img src="/op-icons/misc/signature.png" alt="" class="lp-assess-intro-ic-img" loading="lazy" /></div>
            <div class="lp-assess-intro-h">Build your tenancy agreement</div>
            <div class="lp-assess-intro-s">Since 1 May 2026 every new tenancy is an assured periodic tenancy, and you must give the tenant a written statement of the key terms before they sign. umovingu builds it and folds the written statement in.</div>
            <div class="lp-tn-verbadge">🛡️ <b>Template v3.1</b> - reviewed for the Renters' Rights Act. <span class="lp-tn-pending">Placeholder pending legal review.</span></div>
            <div class="mlabel" style="margin-top:20px">What we fill in for you</div>
            <div class="lp-tn-mand">
              <div class="lp-tn-mand-t">📋 Mandatory written-statement terms</div>
              <div class="lp-tn-mand-item">✓ Names of landlord and tenant(s)</div>
              <div class="lp-tn-mand-item">✓ The property address</div>
              <div class="lp-tn-mand-item">✓ Rent amount, frequency and how it's paid</div>
              <div class="lp-tn-mand-item">✓ That it's an assured periodic tenancy (no fixed term)</div>
              <div class="lp-tn-mand-item">✓ How rent can be increased (once a year, s13 notice)</div>
              <div class="lp-tn-mand-item">✓ Notice periods to end the tenancy</div>
              <div class="lp-tn-mand-item">✓ Deposit amount and the scheme protecting it</div>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="startTnWizard">Start - takes 3 minutes →</button>
          </div>
        </div>

        <!-- Details - 3-step wizard (prototype's TNQ): The tenancy →
             Rent & deposit → Anything specific?, each pre-filled from
             data already on the Passport where we have it (client
             feedback: "We've pre-filled what's already on your
             Passport" was missing text/structure in our build). -->
        <div v-else-if="tnScreen === 'wiz'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="tnBack">‹</button>
            <div class="lp-assess-title">Tenancy details</div>
            <div class="lp-assess-count">{{ tnStep + 1 }} / {{ TN_STEP_TITLES.length }}</div>
          </div>
          <div class="lp-assess-steps">
            <div v-for="i in TN_STEP_TITLES.length" :key="i" class="lp-assess-step" :class="{ on: i - 1 <= tnStep }" />
          </div>
          <div class="lp-assess-scroll">
            <div class="lp-assess-qh">{{ TN_STEP_TITLES[tnStep] }}</div>
            <div class="lp-assess-qs">{{ TN_STEP_SUBS[tnStep] }}</div>

            <template v-if="tnStep === 0">
              <div class="mform-section">
                <div class="mform-label">Tenant name(s)</div>
                <input v-model="tnTenantName" type="text" class="mform-input" placeholder="e.g. Jordan Reeves" />
                <div v-if="tnTenantName" class="lp-tn-pulled">✓ pulled from your Passport</div>
              </div>
              <div class="mform-section">
                <div class="mform-label">Tenancy start date</div>
                <input v-model="tnStartDate" type="date" class="mform-input" />
                <div v-if="tnStartDate" class="lp-tn-pulled">✓ pulled from your Passport</div>
              </div>
            </template>

            <template v-else-if="tnStep === 1">
              <div class="lp-tn-mand" style="margin-left:0;margin-right:0">
                <div class="lp-tn-mand-t">📋 Added automatically</div>
                <div class="lp-tn-mand-s">Because it's an assured periodic tenancy we fold in the required terms - rolling tenancy, rent increase once a year by s13 notice, notice periods, no Section 21, pet requests.</div>
              </div>
              <div class="lp-two-col">
                <div class="mform-section">
                  <div class="mform-label">Rent amount</div>
                  <input v-model="tnRentAmount" type="text" class="mform-input" placeholder="1,150" />
                  <div v-if="tnRentAmount" class="lp-tn-pulled">✓ pulled from your Passport</div>
                </div>
                <div class="mform-section">
                  <div class="mform-label">Frequency</div>
                  <div class="lp-two-col">
                    <button type="button" class="lp-toggle-chip" :class="{ on: tnRentFrequency === 'month' }" @click="tnRentFrequency = 'month'">Monthly</button>
                    <button type="button" class="lp-toggle-chip" :class="{ on: tnRentFrequency === 'week' }" @click="tnRentFrequency = 'week'">Weekly</button>
                  </div>
                </div>
              </div>
              <div class="lp-two-col">
                <div class="mform-section">
                  <div class="mform-label">Deposit amount</div>
                  <input v-model="tnDepositAmount" type="text" class="mform-input" placeholder="1,325" />
                  <div v-if="tnDepositAmount" class="lp-tn-pulled">✓ pulled from your Passport</div>
                </div>
                <div class="mform-section">
                  <div class="mform-label">Deposit scheme</div>
                  <input v-model="tnDepositScheme" type="text" class="mform-input" placeholder="mydeposits" />
                </div>
              </div>
            </template>

            <template v-else-if="tnStep === 2">
              <div class="mform-section">
                <div class="mform-label">Notes / house rules (optional)</div>
                <textarea v-model="tnNotes" class="lp-inv-note" placeholder="e.g. No smoking indoors. Tenant maintains the garden." />
              </div>
            </template>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="tnNext">
              {{ tnStep === TN_STEP_TITLES.length - 1 ? 'Generate document →' : 'Continue' }}
            </button>
          </div>
        </div>

        <!-- Document preview -->
        <div v-else-if="tnScreen === 'preview'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="tnScreen = 'wiz'">‹</button>
            <div class="lp-assess-title">Preview</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="lp-tn-doc">
              <h1>Assured Periodic Tenancy Agreement</h1>
              <div class="lp-tn-docsub">incorporating the Written Statement of Terms · Housing Act 1988 (as amended by the Renters' Rights Act 2025)</div>
              <template v-for="(line, i) in tnDocText" :key="i">
                <h2 v-if="line.h">{{ line.h }}</h2>
                <div v-else-if="line.k" class="lp-tn-kvr"><span class="k">{{ line.k }}</span><span class="v">{{ line.v }}</span></div>
                <p v-else-if="line.clause" class="lp-tn-clause">{{ line.clause }}</p>
              </template>
              <div class="lp-tn-docver">Generated by umovingu · Template v3.1 (placeholder, pending legal review)<br />Based on a template. Not legal advice.</div>
            </div>
            <div class="lp-tn-legalnote"><b>Before you use this:</b> check the details suit your situation. The template reflects current law but doesn't replace legal advice on anything unusual (company lets, high rent, HMOs, lodgers) - and hasn't yet had its clause wording reviewed by a solicitor.</div>
            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" :disabled="tnSaving" @click="saveTenancyAgreement">
              {{ tnSaving ? 'Saving…' : 'Looks good - save to Passport' }}
            </button>
          </div>
        </div>

        <!-- Done / Next steps (prototype's tn-ready screen: e-sign, saved,
             kept up to date) - client feedback: build this and make
             "Send to tenant to e-sign" functional. -->
        <div v-else-if="tnScreen === 'done'" class="lp-assess-screen">
          <div class="lp-assess-scroll">
            <div class="lp-tn-readydoc">
              <div class="lp-tn-readydoc-ic">📄</div>
              <div class="lp-tn-readydoc-bd">
                <div class="lp-tn-readydoc-t">Assured Periodic Tenancy</div>
                <div class="lp-tn-readydoc-s">{{ passport?.addressLine1 }}{{ tnSavedRecord?.tenantName ? ' · ' + tnSavedRecord.tenantName : '' }}</div>
              </div>
              <span class="lp-tn-readydoc-v">v3.1</span>
            </div>

            <div class="mform-label" style="margin-top:20px">Next steps</div>

            <div class="lp-tn-step" @click="openTnNextStep">
              <div class="lp-tn-step-ic">✍️</div>
              <div class="lp-tn-step-bd">
                <div class="lp-tn-step-t">{{ tnTenantSigned ? 'Signed by both parties' : tnLandlordSigned ? 'Send to tenant to e-sign' : 'Sign the agreement' }}</div>
                <div class="lp-tn-step-s">Both parties sign in-app, with a full audit trail</div>
                <span class="lp-tn-step-pill" :class="{ done: tnTenantSigned }">{{ tnTenantSigned ? 'Complete' : 'Action needed' }}</span>
              </div>
              <div class="lp-tn-step-go">›</div>
            </div>

            <div class="lp-tn-step lp-tn-step--plain">
              <div class="lp-tn-step-ic">🏠</div>
              <div class="lp-tn-step-bd">
                <div class="lp-tn-step-t">Stored on the Property Passport</div>
                <div class="lp-tn-step-s">Versioned, linked to your compliance docs</div>
                <span class="lp-tn-step-pill done">Saved ✓</span>
              </div>
            </div>

            <div class="lp-tn-step lp-tn-step--plain">
              <div class="lp-tn-step-ic">🔄</div>
              <div class="lp-tn-step-bd">
                <div class="lp-tn-step-t">Kept up to date</div>
                <div class="lp-tn-step-s">Create a new agreement here any time rent or terms change</div>
              </div>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="tnOpen = false; showSectionDrawer = false">Back to compliance</button>
          </div>
        </div>

        <!-- Landlord signs first (in-app - they're already authenticated) -->
        <div v-else-if="tnScreen === 'landlord-sign'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="tnScreen = 'done'">‹</button>
            <div class="lp-assess-title">Your signature</div>
          </div>
          <div class="lp-assess-scroll">
            <div class="mform-section">
              <div class="mform-label">Your full name</div>
              <input v-model="tnLandlordName" type="text" class="mform-input" placeholder="e.g. Alex Morgan" />
            </div>
            <div class="mform-label" style="margin-top:16px">Draw your signature</div>
            <SignaturePad ref="tnLandlordPadRef" />
            <label class="lp-tn-consent">
              <input v-model="tnLandlordConsent" type="checkbox" />
              <span>I, {{ tnLandlordName || 'the landlord' }}, agree this is my signature and I accept the terms of this tenancy agreement.</span>
            </label>
            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" :disabled="tnLandlordSigning" @click="submitLandlordSignature">
              {{ tnLandlordSigning ? 'Signing…' : 'Sign & continue' }}
            </button>
          </div>
        </div>

        <!-- Share the tenant's magic link -->
        <div v-else-if="tnScreen === 'send-tenant'" class="lp-assess-screen">
          <div class="lp-assess-hdr">
            <button class="lp-assess-back" type="button" aria-label="Back" @click="tnScreen = 'done'">‹</button>
            <div class="lp-assess-title">Send to tenant</div>
          </div>
          <div class="lp-assess-scroll">
            <template v-if="tnTenantSigned">
              <div class="lp-assess-ok">✓</div>
              <div class="lp-assess-intro-h">Signed by {{ tnSavedRecord?.audit?.tenant?.name }}</div>
              <div class="lp-assess-intro-s">{{ new Date(tnSavedRecord?.audit?.tenant?.signedAt ?? '').toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) }}</div>
            </template>
            <template v-else>
              <p class="lp-modal-hint" style="margin-top:0;margin-bottom:14px">Share this link with your tenant. No account needed - they'll review the agreement and sign with a drawn signature.</p>
              <div v-if="tnGeneratingLink" class="lp-modal-hint">Generating link…</div>
              <template v-else-if="tnTenantLinkUrl">
                <div class="lp-tn-linkbox">{{ tnTenantLinkUrl }}</div>
                <button type="button" class="btn-primary" style="width:100%;margin-top:12px" @click="copyTenantSignLink">Copy link</button>
              </template>
            </template>
            <p v-if="drawerError" class="lp-modal-error">{{ drawerError }}</p>

            <div class="mform-label" style="margin-top:20px">Audit trail</div>
            <div class="lp-tn-audit-row">
              <span class="lp-tn-audit-dot done" />
              <span>Landlord signed{{ tnSavedRecord?.audit?.landlord ? ' · ' + new Date(tnSavedRecord.audit.landlord.signedAt).toLocaleDateString('en-GB') : '' }}</span>
            </div>
            <div class="lp-tn-audit-row">
              <span class="lp-tn-audit-dot" :class="{ done: tnTenantSigned }" />
              <span>Tenant signed{{ tnSavedRecord?.audit?.tenant ? ' · ' + new Date(tnSavedRecord.audit.tenant.signedAt).toLocaleDateString('en-GB') : ' - pending'}}</span>
            </div>
          </div>
          <div class="lp-assess-foot">
            <button class="btn-primary" type="button" style="width:100%" @click="tnOpen = false; showSectionDrawer = false">Back to compliance</button>
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
              A 3-hour read-only link. The tenant sees only the documents they're entitled to -
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

    <!-- Bottom navigation - same component the rest of the authed app
         uses, so the landlord passport stays consistent. -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { usePassportClaim } from '~/composables/usePassportClaim'
import PassportCard from '~/components/passport-view/PassportCard.vue'
import LandlordPassportMapView from '~/components/passport-view/LandlordPassportMapView.vue'
import SegmentedSwitch from '~/components/core/SegmentedSwitch.vue'
import BottomNav from '~/components/core/BottomNav.vue'
import SignaturePad from '~/components/ui/SignaturePad.vue'

definePageMeta({ title: 'Landlord Passport - UmovingU', middleware: 'auth' })

const route = useRoute()
const config = useRuntimeConfig()
const { convertLandlordToSeller } = usePassportClaim()

const passportId = computed(() => String(route.params.id))

const loading = ref(true)
const passport = ref<any>(null)
const sections = ref<any[]>([])
const siblingSellerId = ref<string | null>(null)

const activeTab = ref<'compliance' | 'vault' | 'tenancy'>('compliance')
// List vs map view for the Compliance tab - mirrors the seller passport
// pattern, including the same SegmentedSwitch options shape.
const complianceView = ref<'list' | 'map'>('list')
const viewOptions = [
  { label: 'List', value: 'list', icon: 'list' },
  { label: 'Map', value: 'map', icon: 'map' },
]

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
    // cache: 'no-store' - the response carries an ETag with no
    // Cache-Control, so the browser was silently serving a stale cached
    // copy on every re-call (upload/save a certificate, refresh the
    // passport, still see the old status/doc count until a full page
    // reload). Found live-testing the multi-copy completion fix.
    const data = await $fetch<any>(
      `${config.public.apiBase}/passport/${passportId.value}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' },
    )
    passport.value = data
    // Defensive filter - only render landlord-prefixed sections regardless
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
        '[landlord] This passport has no landlord_* sections - it was likely created before the seed/service fix. Delete it and claim a fresh landlord passport.',
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
const INSURANCE_HINTS = ['insurance', 'pat', 'hmo', 'white_goods']

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
  { label: 'Statutory - annual / 5-yearly', sections: safetySections.value },
  { label: 'Tenancy & deposit', sections: tenancySections.value },
  { label: 'Insurance & HMO', sections: insuranceSections.value },
])

// Flat list across all groups (in group order) for the map view, plus
// the ungrouped fallback so nothing is hidden when the map is the
// active view.
const allComplianceSections = computed(() => [
  ...safetySections.value,
  ...tenancySections.value,
  ...insuranceSections.value,
  ...ungroupedSections.value,
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

// Map a section key to one of the rental-passport icon slugs. Falls back
// to `tenancy-agreement` (a generic document) when nothing matches - the
// only sections without a dedicated icon are uncommon edge cases.
function iconSlugForSection(key: string): string {
  const k = key.toLowerCase()
  if (k.includes('gas')) return 'gas-safety'
  if (k.includes('eicr') || k.includes('electric') || k.includes('pat')) return 'electrical-safety'
  if (k.includes('epc') || k.includes('energy')) return 'energy-performance'
  if (k.includes('alarm') || k.includes('smoke') || k.includes('co_')) return 'smoke-co-alarms'
  if (k.includes('legionella')) return 'legionella'
  // No dedicated 3D icon generated yet for White Goods - reuses the
  // Landlord Insurance asset as a placeholder (same group, same
  // 🧊-vs-🛡️ visual weight) rather than showing a broken image.
  if (k.includes('white_goods')) return 'landlord-insurance'
  if (k.includes('insurance')) return 'landlord-insurance'
  if (k.includes('deposit')) return 'deposit-protection'
  if (k.includes('right_to_rent') || k.includes('rtr')) return 'right-to-rent'
  if (k.includes('how_to_rent')) return 'how-to-rent'
  if (k.includes('inventory')) return 'inventory'
  if (k.includes('ast') || k.includes('tenancy')) return 'tenancy-agreement'
  return 'tenancy-agreement'
}
// Reuse existing 3D isometric icons from elsewhere in the app (plus a
// purpose-generated one for smoke-co-alarms) so these match the look of
// the buyer/seller passport section icons. Any slug without an entry
// here falls back to the old flat SVG set.
const SECTION_ICON_URLS: Record<string, string> = {
  'gas-safety': '/op-icons/landlordPassport/gasSafetyCertificate.png',
  'electrical-safety': '/op-icons/landlordPassport/electricalSafety.png',
  'energy-performance': '/op-icons/landlordPassport/epc.png',
  'smoke-co-alarms': '/op-icons/landlordPassport/smokeCOAlarms.png',
  legionella: '/op-icons/landlordPassport/legionellaRiskAssessment.png',
  'landlord-insurance': '/op-icons/landlordPassport/landlordInsurance.png',
  'deposit-protection': '/op-icons/landlordPassport/depositProtection.png',
  'right-to-rent': '/op-icons/landlordPassport/rightToRent.png',
  'how-to-rent': '/op-icons/misc/book.png',
  inventory: '/op-icons/landlordPassport/inventory.png',
  'tenancy-agreement': '/op-icons/landlordPassport/tenancyAgreement.png',
}
function iconUrlForSection(key: string, variant: 'freestanding' | 'map' = 'freestanding'): string {
  const slug = iconSlugForSection(key)
  return SECTION_ICON_URLS[slug] ?? `/op-icons/rental-passport/${variant}/${slug}.svg`
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

// Alarms and Right to Rent aren't certificate uploads - the prototype
// (client feedback items #4 and #8) models them as repeatable structured
// entries instead: one row per physical alarm, one row per occupier. No
// schema change needed - the existing generic answer endpoint already
// routes an array `value` into answerJson (question.service.ts), so both
// reuse the section's existing UPLOAD-type question slot as their
// storage, just holding a JSON array instead of a file.
const isAlarmsSection = computed(() => drawerSection.value?.key === 'landlord_alarms')
const isRtrSection = computed(() => drawerSection.value?.key === 'landlord_right_to_rent')
const isMultiCopySection = computed(() => MULTI_COPY_SECTIONS.has(drawerSection.value?.key))

// A passport that already had a certificate uploaded via the old
// single-slot flow (before multi-copy existed) still has it sitting on
// QuestionAnswer.fileUrl - the new copies list (UserDocument-backed)
// knows nothing about it. Without this, switching a section to
// multi-copy mode would make that existing file silently disappear from
// the drawer, even though it's still there and still valid. Shown
// first, view-only (no remove - clearing the legacy single-file slot is
// a different, not-yet-built code path; re-uploading via "Upload
// certificate" below adds a new copy alongside it rather than touching
// it).
const mergedCopyDocs = computed(() => {
  if (!drawerFileUrl.value) return copyDocs.value
  const legacy = {
    id: '__legacy__',
    name: drawerDocName.value || (drawerUploadNounCap.value + ' on file'),
    fileUrl: drawerFileUrl.value,
    size: '',
    uploadedAt: 'previously',
  }
  return [legacy, ...copyDocs.value]
})
const alarmRows = ref<
  { type: 'smoke' | 'co'; location: string; tested: string; expiry: string; present: boolean; ok: boolean }[]
>([])
const occupierRows = ref<{ name: string; status: string; recheckBy: string }[]>([])
const drawerListSaving = ref(false)

// Multi-copy certificate retention (client feedback 1a/3) - Gas Safety
// and EPC specifically for now; extend this set as the same fix is
// wanted for EICR/Insurance. Reuses UserDocument (the same signed-URL
// upload/delete machinery as the general /documents vault) via new
// question-scoped endpoints, rather than the single QuestionAnswer
// .fileUrl slot the generic drawer flow overwrites on every upload.
const MULTI_COPY_SECTIONS = new Set([
  'landlord_gas_safety',
  'landlord_epc',
  'landlord_eicr',
  'landlord_insurance',
  'landlord_deposit',
  'landlord_legionella',
  'landlord_inventory',
  'landlord_ast',
  'landlord_white_goods',
])
const isDepositSection = computed(() => drawerSection.value?.key === 'landlord_deposit')
// Scheme / Date PI served / Method - three fields the prototype has
// (depositBody's Scheme+Date-protected row, Date-PI-served+Method row)
// that were missing from our build. Attached to the same deposit_upload
// task as everything else in this section (see
// add-deposit-protection-fields.ts), so found the same way the generic
// upload/date questions are - by scanning the section's questions.
const depositScheme = ref('')
const depositPiDate = ref('')
const depositMethod = ref('')
function findDepositQuestion(title: string) {
  if (!drawerSection.value) return null
  for (const t of drawerSection.value.tasks ?? []) {
    for (const q of t.passportQuestions ?? []) {
      if (q.questionTemplate?.title === title) return q
    }
  }
  return null
}
const depositSchemeQuestion = computed(() => findDepositQuestion('Scheme'))
const depositPiDateQuestion = computed(() => findDepositQuestion('Date PI served'))
const depositMethodQuestion = computed(() => findDepositQuestion('Method'))
const isLegionellaSection = computed(() => drawerSection.value?.key === 'landlord_legionella')
const isInventorySection = computed(() => drawerSection.value?.key === 'landlord_inventory')
const isWhiteGoodsSection = computed(() => drawerSection.value?.key === 'landlord_white_goods')
// White Goods & Appliances - appliances/notes/cover details stored as one
// JSON blob on the section's DATE question (same convention Inventory/
// Tenancy Agreement use for their own record slot), manuals + warranties
// as two kind-scoped multi-copy doc lists off the UPLOAD question.
interface WgAppliance { name: string; model: string; serial: string }
const WG_DEFAULT_APPLIANCES: WgAppliance[] = [
  { name: 'Fridge / freezer', model: '', serial: '' },
  { name: 'Washing machine', model: '', serial: '' },
  { name: 'Oven & hob', model: '', serial: '' },
]
const wgAppliances = ref<WgAppliance[]>([])
const wgHowItWorks = ref('')
const wgCoverProvider = ref('')
const wgCoverPolicyNumber = ref('')
const wgCoverRenewalDate = ref('')
const wgCoverContact = ref('')
const wgSaving = ref(false)
const wgSavedRecord = computed<{ appliances: WgAppliance[]; howItWorks: string; cover: { provider: string; policyNumber: string; renewalDate: string; contact: string } } | null>(() => {
  const section = sections.value.find((s) => s.key === 'landlord_white_goods')
  for (const t of section?.tasks ?? []) {
    for (const q of t.passportQuestions ?? []) {
      if (q.questionTemplate?.type === 'DATE' && q.answer?.answerJson?.appliances) {
        return q.answer.answerJson
      }
    }
  }
  return null
})
function addWgAppliance() {
  wgAppliances.value.push({ name: '', model: '', serial: '' })
}
function removeWgAppliance(i: number) {
  if (wgAppliances.value.length <= 1) return
  wgAppliances.value.splice(i, 1)
}
const warrantyDocs = ref<{ id: string; name: string; fileUrl: string; size: string; uploadedAt: string }[]>([])
const warrantyUploading = ref(false)
async function loadWarrantyDocs() {
  const q = drawerUploadQuestion.value
  if (!q) return
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    warrantyDocs.value = await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      query: { kind: 'warranties' },
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    warrantyDocs.value = []
  }
}
async function onWarrantyFilePicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  const q = drawerUploadQuestion.value
  if (!q) return
  warrantyUploading.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/, ''))
    fd.append('kind', 'warranties')
    await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    await loadWarrantyDocs()
    await refreshSectionData()
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Upload failed'
  } finally {
    warrantyUploading.value = false
  }
}
async function removeWarrantyDoc(docId: string) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await $fetch(`${config.public.apiBase}/questions/copies/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    /* non-critical */
  }
  await loadWarrantyDocs()
  await refreshSectionData()
}
async function saveWhiteGoods() {
  const section = sections.value.find((s) => s.key === 'landlord_white_goods')
  const dateQ = section?.tasks?.flatMap((t: any) => t.passportQuestions ?? []).find((q: any) => q.questionTemplate?.type === 'DATE')
  if (!dateQ) {
    drawerError.value = 'No record slot found for this section - this passport was created before the latest fix.'
    return
  }
  wgSaving.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const record = {
      appliances: wgAppliances.value,
      howItWorks: wgHowItWorks.value,
      cover: {
        provider: wgCoverProvider.value,
        policyNumber: wgCoverPolicyNumber.value,
        renewalDate: wgCoverRenewalDate.value,
        contact: wgCoverContact.value,
      },
    }
    await $fetch(`${config.public.apiBase}/questions/${dateQ.id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { value: record },
    })
    await loadPassport()
    showSectionDrawer.value = false
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Save failed'
  } finally {
    wgSaving.value = false
  }
}
const invSavedRecord = computed<{ rooms: InvRoom[]; completedAt: string; type: string; audit?: { landlord?: TnAuditEntry; tenant?: TnAuditEntry } } | null>(() => {
  const section = sections.value.find((s) => s.key === 'landlord_inventory')
  for (const t of section?.tasks ?? []) {
    for (const q of t.passportQuestions ?? []) {
      if (q.questionTemplate?.type === 'DATE' && q.answer?.answerJson?.rooms) {
        return q.answer.answerJson
      }
    }
  }
  return null
})
function invDateQuestion() {
  const section = sections.value.find((s) => s.key === 'landlord_inventory')
  return section?.tasks?.flatMap((t: any) => t.passportQuestions ?? []).find((q: any) => q.questionTemplate?.type === 'DATE')
}
const copyDocs = ref<{ id: string; name: string; fileUrl: string; size: string; uploadedAt: string }[]>([])
const copyUploading = ref(false)

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

// Renewal cadence per section - client feedback: the reminder hint said
// only "we'll remind you before this date", with no sense of how often
// that actually recurs. Sections without a fixed cycle (tenancy, deposit,
// right to rent, etc.) intentionally have no entry here and fall back to
// the plain hint.
const CADENCE_LABEL: Record<string, string> = {
  landlord_gas_safety: 'Annual renewal',
  landlord_eicr: 'Renew every 5 years',
  landlord_epc: 'Valid for up to 10 years',
  landlord_insurance: 'Annual renewal',
}
const drawerCadenceLabel = computed(() => CADENCE_LABEL[drawerSection.value?.key] ?? '')

// The generic drawer's upload button hardcoded "certificate", which is
// only accurate for the true certificate sections. Sections whose real
// document type isn't a certificate (a guide, an agreement, a report) get
// their own bespoke screen once built (Legionella/Tenancy/Deposit/
// Inventory - see the passport-view report); until each of those lands,
// this drawer is still what they fall through to, so it needs to at
// least name the document correctly rather than call everything a
// "certificate". No entry here = falls back to "certificate", correct
// for gas safety / EICR / EPC / insurance / deposit-protection cert.
const UPLOAD_NOUN: Record<string, string> = {
  landlord_how_to_rent: 'document',
  landlord_ast: 'signed agreement',
  landlord_inventory: 'document',
  landlord_legionella: 'assessment',
  landlord_deposit: 'protection certificate',
}
// Deposit Protection's 7-item legal checklist (client feedback item #7,
// prototype's piItem list) - what the prescribed information MUST
// contain by law. Static/informational rather than auto-filled from
// tenancy data: there's no structured tenancy record to pull from yet
// (the Tenancy Agreement is still upload-only, not generated - see the
// passport-view report's item #6). Revisit once that exists.
const PI_CHECKLIST = [
  { t: 'Amount of the deposit & the property address', s: 'Confirm it matches what you actually collected' },
  { t: "The scheme's name & contact details", s: 'mydeposits / DPS / TDS - whichever you used' },
  { t: 'Landlord (or agent) name & contact details', s: 'So the tenant can reach you in writing' },
  { t: 'Tenant name(s) & anyone who paid the deposit', s: 'Everyone with an interest in the deposit' },
  { t: 'When all/part of the deposit may be retained', s: 'The deductions clause from the tenancy' },
  { t: "What to do if there's a dispute", s: "The scheme's free dispute (ADR) process" },
  { t: 'Confirmation the information is accurate', s: 'Signed by you and the tenant' },
]
const drawerUploadNoun = computed(() => UPLOAD_NOUN[drawerSection.value?.key] ?? 'certificate')
const drawerUploadNounCap = computed(
  () => drawerUploadNoun.value.charAt(0).toUpperCase() + drawerUploadNoun.value.slice(1),
)

// ── Legionella guided risk assessment (client feedback item #5) ──────
// The law lets a competent landlord do this themselves - there's no
// such thing as a required "Legionella certificate" (HSE ACOP L8). Six
// weighted questions -> a scored risk band -> tailored control actions,
// matching the prototype exactly (question text, weights, scoring
// thresholds, and the conditional-action rules all ported 1:1).
interface LegOption { t: string; d: string; ic: string; w: number; flagPro?: boolean; flagWarn?: boolean }
interface LegQuestion { num: string; key: string; h: string; s: string; opts: LegOption[] }

const LEG_QUESTIONS: LegQuestion[] = [
  {
    num: 'Water system', key: 'system',
    h: 'What kind of hot water system does the property have?',
    s: 'Stored and recirculated water is the biggest Legionella factor. Mains-fed combi systems with no storage are lowest risk.',
    opts: [
      { t: 'Combi boiler - no stored water', d: 'Heated on demand, cold straight off the mains', ic: '/op-icons/homescore/boiler.png', w: 0 },
      { t: 'Hot water cylinder / tank', d: 'Stored hot water in a cylinder', ic: '/op-icons/legionella/hotWaterCylinder.png', w: 2 },
      { t: 'Cold water storage / header tank', d: 'A tank in the loft feeds the system', ic: '/op-icons/misc/waterDroplet.png', w: 3 },
      { t: 'Not sure', d: "We'll treat it as higher risk to be safe", ic: '/op-icons/misc/question.png', w: 2, flagPro: true },
    ],
  },
  {
    num: 'Stagnation', key: 'stag',
    h: 'Are there taps, showers or outlets that are rarely used?',
    s: 'Water sitting still in pipes lets bacteria grow - especially in spare rooms, outbuildings, or between tenancies.',
    opts: [
      { t: 'No - everything is used regularly', d: 'Water turns over across the system', ic: '/op-icons/rewards/pointsCheck.png', w: 0 },
      { t: 'One or two rarely-used outlets', d: 'e.g. a spare bathroom or outside tap', ic: '/op-icons/homescore/tap.png', w: 1 },
      { t: 'Yes - or empty between lets', d: 'Void periods let water stagnate', ic: '/op-icons/legionella/voidPeriod.png', w: 2 },
    ],
  },
  {
    num: 'Showers', key: 'shower',
    h: 'Are there showers, and what condition are the heads in?',
    s: 'Showers create fine droplets (aerosols) that can be inhaled - the main route of exposure. Scaled heads harbour bacteria.',
    opts: [
      { t: 'No showers, or descaled recently', d: 'Low aerosol risk', ic: '/op-icons/rewards/pointsCheck.png', w: 0 },
      { t: 'Showers present, condition unknown', d: 'Not descaled recently', ic: '/op-icons/homescore/tap.png', w: 1 },
      { t: 'Visibly scaled or grimy heads', d: 'Needs descaling & disinfecting', ic: '/op-icons/legionella/scaledShowerhead.png', w: 2 },
    ],
  },
  {
    num: 'Temperatures', key: 'temp',
    h: 'Do you know the water temperatures?',
    s: 'Bacteria thrive between 20–45°C. Cold should stay below 20°C; hot should reach 50°C+ within a minute.',
    opts: [
      { t: 'Yes - hot ≥50°C, cold <20°C', d: 'Outside the danger range', ic: '/op-icons/legionella/waterThermometer.png', w: 0 },
      { t: 'Not measured yet', d: 'We\'ll add "check temperatures" to your actions', ic: '/op-icons/misc/question.png', w: 1 },
      { t: 'Hot lukewarm / cold runs warm', d: 'In the range bacteria grow', ic: '/op-icons/legionella/tempWarning.png', w: 2 },
    ],
  },
  {
    num: 'Occupants', key: 'occ',
    h: 'Is anyone in the property in a higher-risk group?',
    s: 'People over 65, or with weakened immunity or respiratory conditions, are more susceptible. This raises priority, not necessarily system risk.',
    opts: [
      { t: 'No / not to my knowledge', d: 'Standard occupancy', ic: '/op-icons/verify-identity/people.png', w: 0 },
      { t: 'Yes - older or vulnerable occupant', d: 'Take extra care with controls', ic: '/op-icons/legionella/vulnerableOccupant.png', w: 1, flagWarn: true },
    ],
  },
  {
    num: 'Condition', key: 'cond',
    h: 'Any rust, sludge, scale or debris in tanks?',
    s: 'Rust, scale and sediment feed the bacteria. If you have a cold tank, is it covered and clean?',
    opts: [
      { t: 'No - clean, clear, tanks covered', d: 'No obvious nutrient sources', ic: '/op-icons/rewards/pointsCheck.png', w: 0 },
      { t: "Some scale / can't inspect tank", d: 'Worth a closer look', ic: '/op-icons/homescore/magnifier.png', w: 1 },
      { t: 'Visible rust, sludge or debris', d: 'Nutrient source present', ic: '/op-icons/legionella/rustSludge.png', w: 2 },
    ],
  },
]

const legAssessOpen = ref(false)
const legScreen = ref<'intro' | 'q' | 'result' | 'done'>('intro')
const legStep = ref(0)
const legAnswers = ref<Record<string, number>>({})
const legSaving = ref(false)
// A previously-saved assessment, read back from the DATE question's
// answerJson (see saveLegAssessment) - shown as a summary on the
// section card and in the drawer instead of the generic doc pill,
// which doesn't apply here any more than it does to Alarms/RTR.
const legSavedResult = computed<{ level: string; assessedAt: string; nextReview: string } | null>(() => {
  const section = sections.value.find((s) => s.key === 'landlord_legionella')
  for (const t of section?.tasks ?? []) {
    for (const q of t.passportQuestions ?? []) {
      if (q.questionTemplate?.type === 'DATE' && q.answer?.answerJson?.level) {
        return q.answer.answerJson
      }
    }
  }
  return null
})

const legScore = computed(() =>
  LEG_QUESTIONS.reduce((sum, q) => {
    const idx = legAnswers.value[q.key]
    return sum + (idx != null ? q.opts[idx].w : 0)
  }, 0),
)
const legLevel = computed<'Low' | 'Medium' | 'Higher'>(() => {
  if (legScore.value <= 2) return 'Low'
  if (legScore.value <= 6) return 'Medium'
  return 'Higher'
})
const legLevelDesc = computed(() => {
  if (legLevel.value === 'Low') return 'A typical, well-run domestic system. Keep up simple controls and review in 2 years - no professional needed.'
  if (legLevel.value === 'Medium') return 'Some factors need managing. Do the actions below, keep the record, and review sooner if anything changes.'
  return 'Several risk factors are present. Do the actions below now, and consider a one-off professional assessment.'
})
const legFlags = computed(() => {
  const flags: { type: 'pro' | 'warn'; ic: string; t: string }[] = []
  const seen = new Set<string>()
  for (const q of LEG_QUESTIONS) {
    const idx = legAnswers.value[q.key]
    if (idx == null) continue
    const o = q.opts[idx]
    if (o.flagPro) {
      const t = "Consider a professional: you weren't sure about the water system. If it turns out to be stored/tanked or complex, a one-off professional assessment may be worth it."
      if (!seen.has(t)) { seen.add(t); flags.push({ type: 'pro', ic: '/op-icons/legionella/legProfessional.png', t }) }
    }
    if (o.flagWarn) {
      const t = "Higher-risk occupant: take extra care - keep temperatures right, descale shower heads, and flush after any void. Tell the tenant what you've done."
      if (!seen.has(t)) { seen.add(t); flags.push({ type: 'warn', ic: '/op-icons/legionella/vulnerableOccupant.png', t }) }
    }
  }
  return flags
})
const legActions = computed(() => {
  const A: { ic: string; t: string; s: string; f: string }[] = []
  A.push({ ic: '/op-icons/homescore/tap.png', t: 'Flush unused outlets weekly', s: 'Run rarely-used taps and showers for a couple of minutes to stop water stagnating - and always before a new tenant moves in.', f: 'Weekly + before every let' })
  A.push({ ic: '/op-icons/legionella/waterThermometer.png', t: 'Keep hot hot, cold cold', s: 'Hot water should reach 50°C within a minute; cold should stay below 20°C.', f: 'Ongoing' })
  if ((legAnswers.value.shower ?? 0) > 0) A.push({ ic: '/op-icons/legionella/descaleClean.png', t: 'Descale & disinfect shower heads', s: 'Remove, soak and clean shower heads and hoses to clear scale and biofilm.', f: 'Every 3 months' })
  if ((legAnswers.value.temp ?? 0) > 0) A.push({ ic: '/op-icons/legionella/waterThermometer.png', t: 'Measure your water temperatures', s: 'Run the taps and check hot and cold, so your next assessment records real figures.', f: 'Do this now' })
  if ((legAnswers.value.system ?? 0) >= 2 || (legAnswers.value.cond ?? 0) > 0) A.push({ ic: '/op-icons/homescore/magnifier.png', t: 'Inspect & keep the tank clean', s: 'Check any storage/header tank has a close-fitting lid and no rust, sludge or debris.', f: 'At each review' })
  A.push({ ic: '/op-icons/legionella/tellTenant.png', t: 'Tell your tenant', s: "Ask them to flush taps and showers if the home's been empty for a week or more.", f: 'At move-in' })
  return A
})

function openLegAssess() {
  legAnswers.value = {}
  legStep.value = 0
  legScreen.value = 'intro'
  legAssessOpen.value = true
}
function closeLegAssess() {
  legAssessOpen.value = false
}
function legStartQuestions() {
  legStep.value = 0
  legScreen.value = 'q'
}
function legPick(idx: number) {
  legAnswers.value[LEG_QUESTIONS[legStep.value].key] = idx
}
function legNext() {
  if (legAnswers.value[LEG_QUESTIONS[legStep.value].key] == null) return
  if (legStep.value < LEG_QUESTIONS.length - 1) {
    legStep.value++
  } else {
    legScreen.value = 'result'
  }
}
function legBack() {
  if (legStep.value > 0) {
    legStep.value--
  } else {
    legScreen.value = 'intro'
  }
}

async function saveLegAssessment() {
  const section = sections.value.find((s) => s.key === 'landlord_legionella')
  const dateQ = section?.tasks?.flatMap((t: any) => t.passportQuestions ?? []).find((q: any) => q.questionTemplate?.type === 'DATE')
  if (!dateQ) {
    drawerError.value = 'No record slot found for this section - this passport was created before the latest fix.'
    return
  }
  legSaving.value = true
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const today = new Date()
    const assessedAt = today.toISOString().slice(0, 10)
    const nextReview = new Date(today)
    nextReview.setFullYear(nextReview.getFullYear() + 2)
    const nextReviewStr = nextReview.toISOString().slice(0, 10)
    const record = {
      answers: legAnswers.value,
      score: legScore.value,
      level: legLevel.value,
      assessedAt,
      nextReview: nextReviewStr,
    }
    await $fetch(`${config.public.apiBase}/questions/${dateQ.id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { value: record },
    })
    const addr = passport.value?.addressLine1
    await $fetch(`${config.public.apiBase}/calendar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        title: `Legionella risk assessment review due${addr ? ` - ${addr}` : ''}`,
        date: nextReviewStr,
        type: 'compliance-renewal',
        notes: 'Auto-added from your Landlord Passport compliance section.',
        sourceRef: `landlord-compliance:${section?.id}`,
      },
    }).catch(() => {})
    await loadPassport()
    legScreen.value = 'done'
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Save failed'
    legScreen.value = 'result'
  } finally {
    legSaving.value = false
  }
}

// ── Inventory & Schedule of Condition (client feedback item #10) ─────
// Scoped to the part that actually matters for a deposit dispute: a
// structured, room-by-room condition + cleanliness record with notes
// per fixture/content, not a flat single-file upload. Deliberately NOT
// full parity with the prototype's per-item photo capture - that's a
// materially bigger and separately-justifiable build (a real camera/
// gallery flow per fixture); evidence photos are instead attached once
// per inventory via the existing multi-copy upload pattern, alongside
// the structured record. Extend to per-item photos later if the
// structured record alone doesn't prove enough in practice.
interface InvItem { name: string; condition: string; cleanliness: string; note: string; type: 'fixture' | 'content' }
interface InvRoom { id: string; name: string; icon: string; fixtures: string[]; contents: string[]; items: InvItem[]; custom?: boolean }
// Generic fixture checklist for a room the landlord adds themselves
// (study, garage, conservatory, etc.) - the 6 default rooms above have
// their own tailored lists, but any extra room still needs something
// sensible to check rather than an empty list.
const CUSTOM_ROOM_FIXTURES = ['Walls & ceiling', 'Flooring', 'Windows & coverings', 'Doors & handles', 'Light fittings & switches']
const INVENTORY_ROOM_TEMPLATE: Omit<InvRoom, 'items'>[] = [
  { id: 'living', name: 'Living Room', icon: '/op-icons/investment/armchair.png', fixtures: ['Walls & ceiling', 'Flooring / carpet', 'Windows & coverings', 'Doors & handles', 'Skirting boards', 'Light fittings & switches', 'Radiator'], contents: ['Sofa', 'Coffee table', 'TV unit', 'Curtains'] },
  { id: 'kitchen', name: 'Kitchen', icon: '/op-icons/legionella/kitchenRoom.png', fixtures: ['Worktops & units', 'Sink & taps', 'Oven & hob', 'Extractor fan', 'Tiling / splashback', 'Flooring', 'Walls & ceiling'], contents: ['Fridge / freezer', 'Washing machine', 'Microwave'] },
  { id: 'bed1', name: 'Bedroom 1', icon: '/op-icons/misc/bed.png', fixtures: ['Walls & ceiling', 'Flooring / carpet', 'Windows & coverings', 'Built-in wardrobe', 'Radiator'], contents: ['Double bed & mattress', 'Bedside tables', 'Chest of drawers'] },
  { id: 'bed2', name: 'Bedroom 2', icon: '/op-icons/misc/bed.png', fixtures: ['Walls & ceiling', 'Flooring / carpet', 'Windows & coverings', 'Radiator'], contents: ['Single bed & mattress', 'Wardrobe'] },
  { id: 'bath', name: 'Bathroom', icon: '/op-icons/legionella/bathroomRoom.png', fixtures: ['Bath / shower', 'Toilet', 'Basin & taps', 'Tiling, grout & sealant', 'Extractor fan', 'Flooring'], contents: ['Mirror cabinet'] },
  { id: 'hall', name: 'Hallway & entrance', icon: '/op-icons/legionella/hallwayDoor.png', fixtures: ['Front door, frame & locks', 'Walls & ceiling', 'Flooring', 'Light fittings'], contents: [] },
]
function freshInventoryRooms(): InvRoom[] {
  return INVENTORY_ROOM_TEMPLATE.map((r) => ({
    ...r,
    items: [
      ...r.fixtures.map((name) => ({ name, condition: '', cleanliness: '', note: '', type: 'fixture' as const })),
      ...r.contents.map((name) => ({ name, condition: '', cleanliness: '', note: '', type: 'content' as const })),
    ],
  }))
}

const invOpen = ref(false)
const invScreen = ref<'setup' | 'rooms' | 'room' | 'safety' | 'bins' | 'review' | 'done' | 'landlord-sign' | 'send-tenant'>('setup')
const invWizStep = ref(1)
const invFurnishing = ref<'furnished' | 'part' | 'unfurnished'>('furnished')
const invType = ref<'checkin' | 'interim' | 'checkout'>('checkin')
const invPreparedBy = ref<'landlord' | 'agent' | 'clerk'>('landlord')
const invTenantName = ref('')
const invMoveInDate = ref('')
const invDeposit = ref('')
const invKeys = ref('')
const invMeterGas = ref('')
const invMeterElectric = ref('')
const invMeterWater = ref('')
const invSmartMeterGas = ref('')
const invSmartMeterElectric = ref('')
const invRooms = ref<InvRoom[]>(freshInventoryRooms())
const invCurRoomId = ref<string | null>(null)
const invSaving = ref(false)
const invNewRoomName = ref('')

// Property-wide - Safety & compliance (prototype iv-safety): alarms
// present/tested + fixed key-location fields. Separate from the
// landlord_alarms compliance section - this is a per-inventory record
// of what's physically in the property, not the certificate tracker.
const invAlarmRows = ref<{ type: 'smoke' | 'co'; location: string }[]>([])
const invKeyStopcock = ref('')
const invKeyWaterMeter = ref('')
const invKeyFuseBox = ref('')
const invKeyGasMeter = ref('')
const invKeyElectricityMeter = ref('')
function addInvAlarmRow(type: 'smoke' | 'co') {
  invAlarmRows.value.push({ type, location: '' })
}
function removeInvAlarmRow(i: number) {
  invAlarmRows.value.splice(i, 1)
}

// Property-wide - Bins & refuse (prototype iv-bins): dated photos of
// the bins + fixed refuse-detail fields. Photos reuse the same
// kind-scoped multi-copy endpoint as RTR's per-occupier docs, off the
// same landlord_inventory `inventory_upload` question, kind: 'bins'.
const invBinGeneral = ref('')
const invBinRecycling = ref('')
const invBinFoodGarden = ref('')
const invBinCollectionDay = ref('')
const BIN_PHOTO_KIND = 'bins'
const binDocs = ref<{ id: string; name: string; fileUrl: string; size: string; uploadedAt: string }[]>([])
const binUploading = ref(false)
async function loadBinDocs() {
  const q = drawerUploadQuestion.value
  if (!q) return
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    binDocs.value = await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      query: { kind: BIN_PHOTO_KIND },
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    binDocs.value = []
  }
}
async function onBinFilePicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  const q = drawerUploadQuestion.value
  if (!q) return
  binUploading.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/, ''))
    fd.append('kind', BIN_PHOTO_KIND)
    await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    await loadBinDocs()
    await refreshSectionData()
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Upload failed'
  } finally {
    binUploading.value = false
  }
}
async function removeBinDoc(docId: string) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await $fetch(`${config.public.apiBase}/questions/copies/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    /* non-critical */
  }
  await loadBinDocs()
  await refreshSectionData()
}
function openInvBins() {
  invScreen.value = 'bins'
  loadBinDocs()
}

// Per-room photo grid (prototype iv-room's "Photos · dated &
// timestamped" grid) - same kind-scoped copies pattern, keyed by room
// id rather than array index (room ids are stable strings, not
// reshuffled the way occupier rows are).
const roomPhotoDocs = ref<Record<string, { id: string; name: string; fileUrl: string; size: string; uploadedAt: string }[]>>({})
const roomPhotoUploading = ref<string | null>(null)
function roomPhotoKind(roomId: string) {
  return `room-${roomId}`
}
async function loadRoomPhotoDocs(roomId: string) {
  const q = drawerUploadQuestion.value
  if (!q) return
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    roomPhotoDocs.value[roomId] = await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      query: { kind: roomPhotoKind(roomId) },
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    roomPhotoDocs.value[roomId] = []
  }
}
async function onRoomPhotoPicked(roomId: string, e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  const q = drawerUploadQuestion.value
  if (!q) return
  roomPhotoUploading.value = roomId
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/, ''))
    fd.append('kind', roomPhotoKind(roomId))
    await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    await loadRoomPhotoDocs(roomId)
    await refreshSectionData()
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Upload failed'
  } finally {
    roomPhotoUploading.value = null
  }
}
async function removeRoomPhotoDoc(roomId: string, docId: string) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await $fetch(`${config.public.apiBase}/questions/copies/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    /* non-critical */
  }
  await loadRoomPhotoDocs(roomId)
  await refreshSectionData()
}

function addCustomRoom() {
  const name = invNewRoomName.value.trim()
  if (!name) return
  invRooms.value.push({
    id: `custom-${Date.now()}`,
    name,
    icon: '/op-icons/investment/house.png',
    fixtures: CUSTOM_ROOM_FIXTURES,
    contents: [],
    items: CUSTOM_ROOM_FIXTURES.map((n) => ({ name: n, condition: '', cleanliness: '', note: '', type: 'fixture' as const })),
    custom: true,
  })
  invNewRoomName.value = ''
}
function removeCustomRoom(id: string) {
  invRooms.value = invRooms.value.filter((r) => r.id !== id)
}

const invCurRoom = computed(() => invRooms.value.find((r) => r.id === invCurRoomId.value) ?? null)
// Content/furnishing items don't apply to an unfurnished let - client
// feedback: selecting "Unfurnished" still asked furniture questions.
// Fixtures (walls, flooring, doors...) always apply regardless of
// furnishing status; only content items are skipped.
function roomItemsThatApply(r: InvRoom) {
  return invFurnishing.value === 'unfurnished' ? r.items.filter((i) => i.type === 'fixture') : r.items
}
function roomIsDone(r: InvRoom) {
  const items = roomItemsThatApply(r)
  return items.length > 0 && items.every((i) => i.condition && i.cleanliness)
}
const invDoneCount = computed(() => invRooms.value.filter(roomIsDone).length)
const invAllDone = computed(() => invDoneCount.value === invRooms.value.length)

function openInvWizard() {
  invRooms.value = freshInventoryRooms()
  invWizStep.value = 1
  invScreen.value = 'setup'
  invOpen.value = true
  invAlarmRows.value = []
  invKeyStopcock.value = ''
  invKeyWaterMeter.value = ''
  invKeyFuseBox.value = ''
  invKeyGasMeter.value = ''
  invKeyElectricityMeter.value = ''
  invBinGeneral.value = ''
  invBinRecycling.value = ''
  invBinFoodGarden.value = ''
  invBinCollectionDay.value = ''
  binDocs.value = []
  roomPhotoDocs.value = {}
  invLandlordName.value = ''
  invLandlordConsent.value = false
  invTenantLinkUrl.value = ''
}
function closeInvWizard() {
  invOpen.value = false
}
function invWizNext() {
  if (invWizStep.value < 2) {
    invWizStep.value++
  } else {
    invScreen.value = 'rooms'
  }
}
function invWizBack() {
  if (invWizStep.value > 1) invWizStep.value--
}
function invOpenRoom(id: string) {
  invCurRoomId.value = id
  invScreen.value = 'room'
  loadRoomPhotoDocs(id)
}
function invSetCondition(item: InvItem, val: string) {
  item.condition = val
}
function invSetCleanliness(item: InvItem, val: string) {
  item.cleanliness = val
}

async function saveInventory() {
  const section = sections.value.find((s) => s.key === 'landlord_inventory')
  const dateQ = section?.tasks?.flatMap((t: any) => t.passportQuestions ?? []).find((q: any) => q.questionTemplate?.type === 'DATE')
  if (!dateQ) {
    drawerError.value = 'No record slot found for this section - this passport was created before the latest fix.'
    return
  }
  invSaving.value = true
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const record = {
      furnishing: invFurnishing.value,
      type: invType.value,
      preparedBy: invPreparedBy.value,
      tenantName: invTenantName.value,
      moveInDate: invMoveInDate.value,
      deposit: invDeposit.value,
      keys: invKeys.value,
      meters: {
        gas: invMeterGas.value,
        electric: invMeterElectric.value,
        water: invMeterWater.value,
        smartMeterGasSerial: invSmartMeterGas.value,
        smartMeterElectricSerial: invSmartMeterElectric.value,
      },
      safety: {
        alarms: invAlarmRows.value,
        keyLocations: {
          stopcock: invKeyStopcock.value,
          waterMeter: invKeyWaterMeter.value,
          fuseBox: invKeyFuseBox.value,
          gasMeter: invKeyGasMeter.value,
          electricityMeter: invKeyElectricityMeter.value,
        },
      },
      bins: {
        generalWaste: invBinGeneral.value,
        recycling: invBinRecycling.value,
        foodGardenWaste: invBinFoodGarden.value,
        collectionDay: invBinCollectionDay.value,
      },
      rooms: invRooms.value,
      completedAt: new Date().toISOString().slice(0, 10),
    }
    await $fetch(`${config.public.apiBase}/questions/${dateQ.id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { value: record },
    })
    await loadPassport()
    invScreen.value = 'done'
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Save failed'
    invScreen.value = 'review'
  } finally {
    invSaving.value = false
  }
}

// ── Inventory e-signature (client feedback: extend the Tenancy
// Agreement e-sign pattern to Inventory's move-in sign-off too — same
// magic link + drawn signature, same shared TenancySignLink model with
// kind: 'inventory'). Mirrors the tn* functions above exactly.
const invLandlordName = ref('')
const invLandlordPadRef = ref<any>(null)
const invLandlordConsent = ref(false)
const invLandlordSigning = ref(false)
const invTenantLinkUrl = ref('')
const invGeneratingLink = ref(false)

const invLandlordSigned = computed(() => !!invSavedRecord.value?.audit?.landlord)
const invTenantSigned = computed(() => !!invSavedRecord.value?.audit?.tenant)

function openInvNextStep() {
  if (!invLandlordSigned.value) {
    invLandlordConsent.value = false
    invScreen.value = 'landlord-sign'
  } else {
    invScreen.value = 'send-tenant'
    if (!invTenantSigned.value && !invTenantLinkUrl.value) generateInvTenantSignLink()
  }
}

async function submitInvLandlordSignature() {
  const signatureDataUrl = invLandlordPadRef.value?.getDataUrl()
  if (!invLandlordName.value.trim() || !invLandlordConsent.value || !signatureDataUrl) {
    drawerError.value = 'Please enter your name, draw your signature, and tick the consent box.'
    return
  }
  const dateQ = invDateQuestion()
  if (!dateQ || !invSavedRecord.value) {
    drawerError.value = 'No record slot found for this section - this passport was created before the latest fix.'
    return
  }
  invLandlordSigning.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const record = { ...invSavedRecord.value }
    record.audit = {
      ...record.audit,
      landlord: {
        name: invLandlordName.value.trim(),
        signatureDataUrl,
        signedAt: new Date().toISOString(),
      },
    }
    await $fetch(`${config.public.apiBase}/questions/${dateQ.id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { value: record },
    })
    await loadPassport()
    invScreen.value = 'send-tenant'
    await generateInvTenantSignLink()
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Save failed'
  } finally {
    invLandlordSigning.value = false
  }
}

async function generateInvTenantSignLink() {
  const dateQ = invDateQuestion()
  if (!dateQ) return
  invGeneratingLink.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res: any = await $fetch(`${config.public.apiBase}/questions/${dateQ.id}/tenancy-sign-link`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { kind: 'inventory' },
    })
    invTenantLinkUrl.value = res.url
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Could not generate a link - please try again.'
  } finally {
    invGeneratingLink.value = false
  }
}

async function copyInvTenantSignLink() {
  if (!invTenantLinkUrl.value) return
  try {
    await navigator.clipboard.writeText(invTenantLinkUrl.value)
    showToast({ message: 'Link copied', duration: 1500 })
  } catch {
    /* clipboard API unavailable - link is still visible to copy manually */
  }
}

function openInvSigningStatus() {
  invScreen.value = 'done'
  invOpen.value = true
}

// ── Tenancy Agreement generator (client feedback item #6) ────────────
// "Current passport limits to only being able to upload a current
// tenancy not create one." Assembles a real Assured Periodic Tenancy
// Agreement + written statement of terms from a short wizard, matching
// the prototype's document structure and clause wording.
//
// IMPORTANT - clause text is a TEMPLATE, ported from the client's own
// prototype, explicitly agreed as a placeholder pending legal review
// before this goes live (referencing live law - Housing Act 1988 as
// amended by the Renters' Rights Act 2025 - is a legal-accuracy
// question, not an engineering one). The disclaimer on the generated
// document and the "not legal advice" note below are NOT decorative -
// leave them in place until that review happens.
//
// Deliberately NOT full parity with the prototype's e-signature/audit-
// trail flow, template-version-history dashboard, or cross-linked-
// documents screen - each is a real, separately-justifiable feature in
// its own right (a genuine e-sign flow needs its own audit/legal
// design), not something to bolt on inside this generator's scope.
// This delivers the actual document; those are natural next builds.
const isTenancySection = computed(() => drawerSection.value?.key === 'landlord_ast')
const tnOpen = ref(false)
const tnScreen = ref<'intro' | 'wiz' | 'preview' | 'done' | 'landlord-sign' | 'send-tenant'>('intro')
const tnTenantName = ref('')
const tnStartDate = ref('')
const tnRentAmount = ref('')
const tnRentFrequency = ref<'month' | 'week'>('month')
const tnDepositAmount = ref('')
const tnDepositScheme = ref('')
const tnNotes = ref('')
const tnSaving = ref(false)
const tnStep = ref(0)
const TN_STEP_TITLES = ['The tenancy', 'Rent & deposit', 'Anything specific?']
const TN_STEP_SUBS = [
  "The basics of the let. We've pre-filled what's already on your Passport.",
  "How much, how often, and the deposit you're protecting.",
  'Optional house rules. The mandatory legal terms are added automatically.',
]
function tnNext() {
  if (tnStep.value < TN_STEP_TITLES.length - 1) {
    tnStep.value++
  } else {
    tnScreen.value = 'preview'
  }
}
function tnBack() {
  if (tnStep.value > 0) {
    tnStep.value--
  } else {
    tnScreen.value = 'intro'
  }
}
function startTnWizard() {
  tnStep.value = 0
  tnScreen.value = 'wiz'
}

interface TnAuditEntry { name: string; signatureDataUrl: string; signedAt: string; ip?: string | null }
interface TnRecord {
  tenantName: string
  completedAt: string
  audit?: { landlord?: TnAuditEntry; tenant?: TnAuditEntry }
}
const tnSavedRecord = computed<TnRecord | null>(() => {
  const section = sections.value.find((s) => s.key === 'landlord_ast')
  for (const t of section?.tasks ?? []) {
    for (const q of t.passportQuestions ?? []) {
      if (q.questionTemplate?.type === 'DATE' && q.answer?.answerJson?.docText) {
        return q.answer.answerJson
      }
    }
  }
  return null
})
function tnAstQuestion() {
  const section = sections.value.find((s) => s.key === 'landlord_ast')
  return section?.tasks?.flatMap((t: any) => t.passportQuestions ?? []).find((q: any) => q.questionTemplate?.type === 'DATE')
}

const TN_CLAUSES = [
  'This is a periodic tenancy with no fixed end date. It continues until ended in line with the law.',
  "The rent may be increased no more than once a year, by serving a Section 13 notice giving at least two months' notice.",
  "The tenant may end the tenancy by giving two months' notice in writing.",
  'The landlord may only seek possession on a valid Section 8 ground. Section 21 notices cannot be used.',
  'The tenant has the right to request a pet; the landlord will not unreasonably refuse.',
]

function tnFormatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const tnDocText = computed(() => {
  const addr = passport.value?.addressLine1 ?? passport.value?.property?.addressLine1 ?? ''
  const lines: { h?: string; k?: string; v?: string; clause?: string }[] = [
    { h: 'The parties' },
    { k: 'Landlord', v: 'You (landlord)' },
    { k: 'Tenant', v: tnTenantName.value || '-' },
    { k: 'Property', v: addr },
    { h: 'The tenancy' },
    { k: 'Type', v: 'Assured periodic tenancy' },
    { k: 'Starts', v: tnFormatDate(tnStartDate.value) || '-' },
    { k: 'Rent', v: tnRentAmount.value ? `£${tnRentAmount.value} / ${tnRentFrequency.value}` : '-' },
    { k: 'Deposit', v: tnDepositAmount.value ? `£${tnDepositAmount.value}${tnDepositScheme.value ? ' · ' + tnDepositScheme.value : ''}` : '-' },
    { h: 'Key terms (written statement)' },
    ...TN_CLAUSES.map((clause) => ({ clause })),
    { h: 'Deposit & compliance' },
    { clause: 'The deposit is protected in an approved scheme and the prescribed information has been given.' },
  ]
  if (tnNotes.value.trim()) {
    lines.push({ h: 'House rules' }, { clause: tnNotes.value.trim() })
  }
  return lines
})

// Pre-fills whatever the wizard's step 1/2 fields already have a real
// source for elsewhere on the Passport (client feedback: the prototype
// pre-fills these and shows a "pulled from your Passport" tag - ours
// didn't pull anything). Only the Inventory record currently holds
// structured tenant-name/move-in-date/deposit data; rent amount and
// deposit scheme have no other seller-question source yet, so they
// stay blank (and simply show no badge, same as the prototype's own
// v ? badge : '' logic for an unfilled field).
// Reopen the Next steps / e-signature screen for an already-generated
// agreement, without restarting the wizard (client feedback fix: there
// was no way back into the signing status once the drawer was closed
// and reopened - only "Create a new agreement", which starts over).
function openTnSigningStatus() {
  tnScreen.value = 'done'
  tnOpen.value = true
}

function openTnWizard() {
  const inv = invSavedRecord.value as any
  tnTenantName.value = inv?.tenantName ?? ''
  tnStartDate.value = inv?.moveInDate ?? ''
  tnRentAmount.value = ''
  tnDepositAmount.value = inv?.deposit ? String(inv.deposit).replace(/[^0-9.]/g, '') : ''
  tnDepositScheme.value = ''
  tnNotes.value = ''
  tnStep.value = 0
  tnLandlordName.value = ''
  tnLandlordConsent.value = false
  tnTenantLinkUrl.value = ''
  tnScreen.value = 'intro'
  tnOpen.value = true
}
function closeTnWizard() {
  tnOpen.value = false
}
async function saveTenancyAgreement() {
  const section = sections.value.find((s) => s.key === 'landlord_ast')
  const dateQ = section?.tasks?.flatMap((t: any) => t.passportQuestions ?? []).find((q: any) => q.questionTemplate?.type === 'DATE')
  if (!dateQ) {
    drawerError.value = 'No record slot found for this section - this passport was created before the latest fix.'
    return
  }
  tnSaving.value = true
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const record = {
      tenantName: tnTenantName.value,
      startDate: tnStartDate.value,
      rentAmount: tnRentAmount.value,
      rentFrequency: tnRentFrequency.value,
      depositAmount: tnDepositAmount.value,
      depositScheme: tnDepositScheme.value,
      notes: tnNotes.value,
      docText: tnDocText.value,
      templateVersion: 'v3.1 (placeholder - pending legal review)',
      completedAt: new Date().toISOString().slice(0, 10),
    }
    await $fetch(`${config.public.apiBase}/questions/${dateQ.id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { value: record },
    })
    await loadPassport()
    tnScreen.value = 'done'
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Save failed'
    tnScreen.value = 'preview'
  } finally {
    tnSaving.value = false
  }
}

// ── Tenancy Agreement e-signature (client feedback: build the prototype's
// "Next steps" screen and make "Send to tenant to e-sign" functional —
// magic link + drawn signature, approved after an earlier hold). Landlord
// signs first (in-app, they're already authenticated); once signed, a
// magic link is generated for the tenant to sign at /sign/tenancy/:token
// with no account needed. Both signatures land in the same record's
// `audit` object via the existing generic answer endpoint.
const tnLandlordName = ref('')
const tnLandlordPadRef = ref<any>(null)
const tnLandlordConsent = ref(false)
const tnLandlordSigning = ref(false)
const tnTenantLinkUrl = ref('')
const tnGeneratingLink = ref(false)

const tnLandlordSigned = computed(() => !!tnSavedRecord.value?.audit?.landlord)
const tnTenantSigned = computed(() => !!tnSavedRecord.value?.audit?.tenant)

function openTnNextStep() {
  if (!tnLandlordSigned.value) {
    tnLandlordName.value = tnSavedRecord.value?.tenantName ? '' : ''
    tnLandlordConsent.value = false
    tnScreen.value = 'landlord-sign'
  } else {
    tnScreen.value = 'send-tenant'
    if (!tnTenantSigned.value && !tnTenantLinkUrl.value) generateTenantSignLink()
  }
}

async function submitLandlordSignature() {
  const signatureDataUrl = tnLandlordPadRef.value?.getDataUrl()
  if (!tnLandlordName.value.trim() || !tnLandlordConsent.value || !signatureDataUrl) {
    drawerError.value = 'Please enter your name, draw your signature, and tick the consent box.'
    return
  }
  const dateQ = tnAstQuestion()
  if (!dateQ || !tnSavedRecord.value) {
    drawerError.value = 'No record slot found for this section - this passport was created before the latest fix.'
    return
  }
  tnLandlordSigning.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const record = { ...tnSavedRecord.value }
    record.audit = {
      ...record.audit,
      landlord: {
        name: tnLandlordName.value.trim(),
        signatureDataUrl,
        signedAt: new Date().toISOString(),
      },
    }
    await $fetch(`${config.public.apiBase}/questions/${dateQ.id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { value: record },
    })
    await loadPassport()
    tnScreen.value = 'send-tenant'
    await generateTenantSignLink()
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Save failed'
  } finally {
    tnLandlordSigning.value = false
  }
}

async function generateTenantSignLink() {
  const dateQ = tnAstQuestion()
  if (!dateQ) return
  tnGeneratingLink.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res: any = await $fetch(`${config.public.apiBase}/questions/${dateQ.id}/tenancy-sign-link`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    tnTenantLinkUrl.value = res.url
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Could not generate a link - please try again.'
  } finally {
    tnGeneratingLink.value = false
  }
}

async function copyTenantSignLink() {
  if (!tnTenantLinkUrl.value) return
  try {
    await navigator.clipboard.writeText(tnTenantLinkUrl.value)
    showToast({ message: 'Link copied', duration: 1500 })
  } catch {
    /* clipboard API unavailable - link is still visible to copy manually */
  }
}

// EPC auto-pull (client feedback item #3) - the property's own EPC data
// (same enrichment pipeline used everywhere else in the app) rather than
// asking the landlord to upload a certificate we may already have.
const isEpcSection = computed(() => drawerSection.value?.key === 'landlord_epc')

// Renters' Rights Act Information Sheet legislation links (client
// feedback item #9, prototype's legLink list).
const isInfoSheetSection = computed(() => drawerSection.value?.key === 'landlord_how_to_rent')
const INFO_SHEET_LINKS = [
  {
    title: "The Renters' Rights Act Information Sheet 2026",
    sub: 'Official GOV.UK PDF - serve this to tenants',
    url: 'https://www.gov.uk/guidance/the-renters-rights-act-information-sheet-2026-alternative-formats',
  },
  {
    title: "Renters' Rights Act 2025",
    sub: 'The Act itself on legislation.gov.uk',
    url: 'https://www.legislation.gov.uk/ukpga/2025/renters-rights',
  },
  {
    title: 'Renting out your property: landlord guidance',
    sub: 'GOV.UK - what you must do from 1 May 2026',
    url: 'https://www.gov.uk/renting-out-a-property',
  },
]
const propertyEpc = computed(() => passport.value?.property ?? null)
const epcValidUntilLabel = computed(() => {
  const lodged = propertyEpc.value?.lodgementDate
  if (!lodged) return ''
  const d = new Date(lodged)
  d.setFullYear(d.getFullYear() + 10)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
})

function openSection(s: any) {
  if (!s) return
  drawerSection.value = s
  drawerError.value = ''
  pendingFile.value = null
  drawerDocName.value = ''
  drawerExpiryDraft.value = drawerExpiry.value || ''
  const storedList = drawerUploadQuestion.value?.answer?.answerJson
  if (s.key === 'landlord_alarms') {
    // Prototype opens with a smoke + CO alarm row already in place, ready
    // to fill in, rather than a blank list the landlord has to click
    // "+ Add" twice just to get started (client feedback).
    alarmRows.value = Array.isArray(storedList) && storedList.length
      ? storedList
      : [
          { type: 'smoke', location: '', tested: '', expiry: '', present: false, ok: false },
          { type: 'co', location: '', tested: '', expiry: '', present: false, ok: false },
        ]
    loadAlarmEvidenceDocs()
  } else {
    alarmRows.value = []
  }
  occupierRows.value = s.key === 'landlord_right_to_rent' && Array.isArray(storedList) ? storedList : []
  copyDocs.value = []
  piCopyDocs.value = []
  rtrOccDocs.value = {}
  if (MULTI_COPY_SECTIONS.has(s.key)) loadCopyDocs()
  if (s.key === 'landlord_deposit') {
    loadPiCopyDocs()
    depositScheme.value = depositSchemeQuestion.value?.answer?.answerText ?? ''
    depositPiDate.value = (depositPiDateQuestion.value?.answer?.answerText ?? '').slice(0, 10)
    depositMethod.value = depositMethodQuestion.value?.answer?.answerText ?? ''
  }
  if (s.key === 'landlord_right_to_rent') loadAllRtrOccDocs()
  if (s.key === 'landlord_white_goods') {
    loadWarrantyDocs()
    const saved = wgSavedRecord.value
    wgAppliances.value = saved?.appliances?.length ? saved.appliances : WG_DEFAULT_APPLIANCES.map((a) => ({ ...a }))
    wgHowItWorks.value = saved?.howItWorks ?? ''
    wgCoverProvider.value = saved?.cover?.provider ?? ''
    wgCoverPolicyNumber.value = saved?.cover?.policyNumber ?? ''
    wgCoverRenewalDate.value = saved?.cover?.renewalDate ?? ''
    wgCoverContact.value = saved?.cover?.contact ?? ''
  }
  showSectionDrawer.value = true
}

async function loadCopyDocs() {
  const q = drawerUploadQuestion.value
  if (!q) return
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    copyDocs.value = await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    copyDocs.value = []
  }
}

async function onCopyFilePicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  const q = drawerUploadQuestion.value
  if (!q) {
    drawerError.value =
      'No upload slot found for this section - this passport was created before the latest fix. Re-claim a fresh landlord passport.'
    return
  }
  copyUploading.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/, ''))
    await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    await loadCopyDocs()
    // The backend marks the question COMPLETED on the first copy - the
    // compliance card list (sections.value) needs a refresh too, or it
    // keeps showing "Pending"/0 doc until a full page reload even though
    // the certificate genuinely saved.
    await refreshSectionData()
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Upload failed'
  } finally {
    copyUploading.value = false
  }
}

// Re-fetches the passport and re-points drawerSection/drawerUploadQuestion
// at the freshly-loaded copy, so the section card grid behind the open
// drawer reflects a completion-status change without needing a full page
// reload. Used by both the multi-copy upload/remove flow above and the
// list-based (alarms/RTR) save flow already using the same pattern inline.
async function refreshSectionData() {
  await loadPassport()
  if (drawerSection.value) {
    drawerSection.value = sections.value.find((s) => s.id === drawerSection.value.id) ?? drawerSection.value
  }
}

async function removeCopyDoc(docId: string) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await $fetch(`${config.public.apiBase}/questions/copies/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    /* non-critical - refresh below shows current server state either way */
  }
  await loadCopyDocs()
  // Removing a landlord's last copy can revert the question to PENDING
  // server-side (see deleteQuestionCopy) - refresh so the card grid
  // reflects that immediately too.
  await refreshSectionData()
}

// Deposit Protection (client feedback item #7) tracks two legally
// distinct documents under the same question - the scheme's protection
// certificate (copyDocs/copyUploading above) and the served
// prescribed-information copy (this second, independently-tracked list,
// using the backend's `kind` parameter so both stay separate under one
// question rather than needing a second QuestionTemplate).
const piCopyDocs = ref<{ id: string; name: string; fileUrl: string; size: string; uploadedAt: string }[]>([])
const piCopyUploading = ref(false)

async function loadPiCopyDocs() {
  const q = drawerUploadQuestion.value
  if (!q) return
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    piCopyDocs.value = await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      query: { kind: 'pi' },
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    piCopyDocs.value = []
  }
}

async function onPiCopyFilePicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  const q = drawerUploadQuestion.value
  if (!q) return
  piCopyUploading.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/, ''))
    fd.append('kind', 'pi')
    await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    await loadPiCopyDocs()
    await refreshSectionData()
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Upload failed'
  } finally {
    piCopyUploading.value = false
  }
}

async function removePiCopyDoc(docId: string) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await $fetch(`${config.public.apiBase}/questions/copies/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    /* non-critical */
  }
  await loadPiCopyDocs()
  await refreshSectionData()
}

// Right to Rent - per-occupier ID-check evidence (client feedback: "need
// to be able to upload proof we have carried the check out"). Reuses the
// same kind-scoped multi-copy endpoint Deposit Protection's PI docs use
// (questions/:id/copies?kind=X), keyed per occupier by array index, so
// this needed no backend/schema change - landlord_right_to_rent already
// seeds an UPLOAD question (rtr_upload) that drawerUploadQuestion
// resolves to; the custom occupier-list UI below just never used it
// until now.
const rtrOccDocs = ref<Record<number, { id: string; name: string; fileUrl: string; size: string; uploadedAt: string }[]>>({})
const rtrOccUploading = ref<number | null>(null)

function rtrOccKind(i: number) {
  return `occ-${i}`
}
async function loadRtrOccDocs(i: number) {
  const q = drawerUploadQuestion.value
  if (!q) return
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    rtrOccDocs.value[i] = await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      query: { kind: rtrOccKind(i) },
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    rtrOccDocs.value[i] = []
  }
}
async function loadAllRtrOccDocs() {
  await Promise.all(occupierRows.value.map((_, i) => loadRtrOccDocs(i)))
}
async function onRtrOccFilePicked(i: number, e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  const q = drawerUploadQuestion.value
  if (!q) return
  rtrOccUploading.value = i
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/, ''))
    fd.append('kind', rtrOccKind(i))
    await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    await loadRtrOccDocs(i)
    await refreshSectionData()
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Upload failed'
  } finally {
    rtrOccUploading.value = null
  }
}
async function removeRtrOccDoc(i: number, docId: string) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await $fetch(`${config.public.apiBase}/questions/copies/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    /* non-critical */
  }
  await loadRtrOccDocs(i)
  await refreshSectionData()
}

// Multi-copy sections still track one expiry per section, independent of
// how many certificate copies are on file - same DATE-question slot and
// Calendar-mirroring the generic single-slot flow already uses.
async function saveMultiCopyExpiry() {
  // Deposit Protection has three extra fields (Scheme/Date PI served/
  // Method) that must save even when "Date protected" itself is blank -
  // the old early-return here skipped the whole function (and so those
  // three fields too) whenever drawerExpiryDraft was empty.
  const hasDepositExtras =
    isDepositSection.value && (depositScheme.value || depositPiDate.value || depositMethod.value)
  if (!drawerExpiryDraft.value && !hasDepositExtras) {
    showSectionDrawer.value = false
    return
  }
  drawerListSaving.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const authHeaders = { Authorization: `Bearer ${token}` }
    if (drawerExpiryDraft.value && drawerDateQuestion.value) {
      await $fetch(`${config.public.apiBase}/questions/${drawerDateQuestion.value.id}/answer`, {
        method: 'POST',
        headers: authHeaders,
        body: { value: drawerExpiryDraft.value },
      })
    }
    if (isDepositSection.value) {
      if (depositSchemeQuestion.value) {
        await $fetch(`${config.public.apiBase}/questions/${depositSchemeQuestion.value.id}/answer`, {
          method: 'POST',
          headers: authHeaders,
          body: { value: depositScheme.value },
        })
      }
      if (depositPiDateQuestion.value) {
        await $fetch(`${config.public.apiBase}/questions/${depositPiDateQuestion.value.id}/answer`, {
          method: 'POST',
          headers: authHeaders,
          body: { value: depositPiDate.value },
        })
      }
      if (depositMethodQuestion.value) {
        await $fetch(`${config.public.apiBase}/questions/${depositMethodQuestion.value.id}/answer`, {
          method: 'POST',
          headers: authHeaders,
          body: { value: depositMethod.value },
        })
      }
    }
    // Deposit Protection's date is a record of a past event ("date
    // protected"), not a future deadline - no renewal reminder makes
    // sense for it, unlike every other multi-copy section's expiry date.
    if (drawerExpiryDraft.value && drawerDateQuestion.value && !isDepositSection.value) {
      const addr = passport.value?.addressLine1
      await $fetch(`${config.public.apiBase}/calendar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          title: `${drawerSection.value?.title ?? 'Compliance'} renewal due${addr ? ` - ${addr}` : ''}`,
          date: drawerExpiryDraft.value,
          type: 'compliance-renewal',
          notes: 'Auto-added from your Landlord Passport compliance section.',
          sourceRef: `landlord-compliance:${drawerSection.value?.id}`,
        },
      }).catch(() => {})
    }
    await loadPassport()
    if (drawerSection.value) {
      drawerSection.value = sections.value.find((s) => s.id === drawerSection.value.id) ?? drawerSection.value
    }
    showSectionDrawer.value = false
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Save failed'
  } finally {
    drawerListSaving.value = false
  }
}

function addAlarmRow(type: 'smoke' | 'co') {
  alarmRows.value.push({ type, location: '', tested: '', expiry: '', present: false, ok: false })
}
function removeAlarmRow(i: number) {
  alarmRows.value.splice(i, 1)
}

const alarmEvidenceDocs = ref<{ id: string; name: string; fileUrl: string; size: string; uploadedAt: string }[]>([])
const alarmEvidenceUploading = ref(false)
async function loadAlarmEvidenceDocs() {
  const q = drawerUploadQuestion.value
  if (!q) return
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    alarmEvidenceDocs.value = await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      query: { kind: 'alarm-evidence' },
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    alarmEvidenceDocs.value = []
  }
}
async function onAlarmEvidenceFilePicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  const q = drawerUploadQuestion.value
  if (!q) return
  alarmEvidenceUploading.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name.replace(/\.[^.]+$/, ''))
    fd.append('kind', 'alarm-evidence')
    await $fetch(`${config.public.apiBase}/questions/${q.id}/copies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    await loadAlarmEvidenceDocs()
    await refreshSectionData()
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Upload failed'
  } finally {
    alarmEvidenceUploading.value = false
  }
}
async function removeAlarmEvidenceDoc(docId: string) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await $fetch(`${config.public.apiBase}/questions/copies/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    /* non-critical */
  }
  await loadAlarmEvidenceDocs()
  await refreshSectionData()
}
function addOccupierRow() {
  occupierRows.value.push({ name: '', status: '', recheckBy: '' })
}
function removeOccupierRow(i: number) {
  occupierRows.value.splice(i, 1)
  // Doc lists are keyed by array index (rtrOccKind) - removing a row
  // shifts every later occupier's index, so re-fetch the whole set
  // against the reshuffled positions rather than leaving stale entries.
  loadAllRtrOccDocs()
}

async function saveDrawerList() {
  const q = drawerUploadQuestion.value
  if (!q) {
    drawerError.value =
      'No slot found for this section - this passport was created before the latest fix. Re-claim a fresh landlord passport.'
    return
  }
  drawerListSaving.value = true
  drawerError.value = ''
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const value = isAlarmsSection.value ? alarmRows.value : occupierRows.value
    await $fetch(`${config.public.apiBase}/questions/${q.id}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { value },
    })

    // Right to Rent recheck dates work the same way certificate expiries
    // do - mirror any set recheck date onto the Calendar so the "we'll
    // remind you 30 days before" promise in the hint actually fires.
    if (isRtrSection.value) {
      const addr = passport.value?.addressLine1
      for (const occ of occupierRows.value) {
        if (!occ.recheckBy) continue
        await $fetch(`${config.public.apiBase}/calendar`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: {
            title: `Right to Rent recheck due - ${occ.name || 'occupier'}${addr ? ` · ${addr}` : ''}`,
            date: occ.recheckBy,
            type: 'compliance-renewal',
            notes: 'Auto-added from your Landlord Passport Right to Rent section.',
            sourceRef: `landlord-rtr:${q.id}:${occ.name || occupierRows.value.indexOf(occ)}`,
          },
        }).catch(() => {})
      }
    }

    await loadPassport()
    if (drawerSection.value) {
      drawerSection.value = sections.value.find((s) => s.id === drawerSection.value.id) ?? drawerSection.value
    }
    showSectionDrawer.value = false
  } catch (err: any) {
    drawerError.value = err?.data?.message ?? 'Save failed'
  } finally {
    drawerListSaving.value = false
  }
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
      'No upload slot found for this section - this passport was created before the latest fix. Re-claim a fresh landlord passport.'
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

      // Mirror the renewal date onto the Calendar tab - the drawer promises
      // "we'll remind you before this date" but nothing ever created the
      // reminder. sourceRef keys it to this section so re-saving a later
      // date moves the same entry instead of leaving a stale duplicate.
      const addr = passport.value?.addressLine1
      await $fetch(`${config.public.apiBase}/calendar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          title: `${drawerSection.value?.title ?? 'Compliance'} renewal due${addr ? ` - ${addr}` : ''}`,
          date: drawerExpiryDraft.value,
          type: 'compliance-renewal',
          notes: 'Auto-added from your Landlord Passport compliance section.',
          sourceRef: `landlord-compliance:${drawerSection.value?.id}`,
        },
      }).catch(() => {
        /* non-critical - certificate is already saved either way */
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

// `window` isn't in scope inside a template expression the way it is in
// plain script - an inline `@click="window.open(...)"` throws "Cannot
// read properties of undefined (reading 'open')". Found live-testing the
// multi-copy list's View button.
function viewCopyDoc(url: string) {
  if (!url) return
  window.open(url, '_blank', 'noopener')
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

  // Alarms and Right to Rent don't produce a document at all - they're
  // repeatable structured rows (client feedback #4/#8), not uploads.
  // Treating them through the doc-count pill below is what produced
  // "100% · 0/1 doc" on the card: technically consistent with the old
  // per-question logic, but confusing since there was never a document
  // to find. Count rows instead.
  const rowCountKeys: Record<string, string> = {
    landlord_alarms: 'alarm',
    landlord_right_to_rent: 'occupier',
  }
  const rowNoun = rowCountKeys[section?.key]
  if (rowNoun) {
    let rowCount = 0
    for (const t of tasks) {
      for (const q of (t.passportQuestions ?? []) as any[]) {
        if (Array.isArray(q.answer?.answerJson)) rowCount = q.answer.answerJson.length
      }
    }
    const tone: 'good' | 'pending' = rowCount > 0 ? 'good' : 'pending'
    return {
      tone,
      statusLabel: rowCount > 0 ? '✓ Recorded' : 'Pending',
      actionByLabel: '',
      subtitleLine: section?.subtitle ?? '',
      docCount: rowCount,
      docTotal: rowCount,
      pct: rowCount > 0 ? 100 : 0,
      rowLabel: `${rowCount} ${rowNoun}${rowCount === 1 ? '' : 's'}`,
    }
  }

  // Legionella (client feedback #5) - a guided assessment writes its
  // result to the DATE question's answerJson, not a file, so the same
  // doc-count logic below would never see it as "done". Recognise the
  // saved-assessment shape and show the risk level instead - but only
  // when the assessment is the real reason it's complete: someone could
  // have used the "add your own" upload path instead, which the
  // multi-copy logic further down already handles correctly.
  if (section?.key === 'landlord_legionella') {
    for (const t of tasks) {
      for (const q of (t.passportQuestions ?? []) as any[]) {
        const rec = q.answer?.answerJson
        if (q.questionTemplate?.type === 'DATE' && rec?.level) {
          return {
            tone: 'good' as const,
            statusLabel: '✓ Assessed',
            actionByLabel: '',
            subtitleLine: section?.subtitle ?? '',
            docCount: 1,
            docTotal: 1,
            pct: 100,
            rowLabel: `${rec.level} risk`,
          }
        }
      }
    }
  }

  // Inventory - same reasoning as Legionella above: a saved inventory
  // record lives in the DATE question's answerJson, not a file.
  if (section?.key === 'landlord_inventory') {
    for (const t of tasks) {
      for (const q of (t.passportQuestions ?? []) as any[]) {
        const rec = q.answer?.answerJson
        if (q.questionTemplate?.type === 'DATE' && Array.isArray(rec?.rooms)) {
          return {
            tone: 'good' as const,
            statusLabel: '✓ Recorded',
            actionByLabel: '',
            subtitleLine: section?.subtitle ?? '',
            docCount: 1,
            docTotal: 1,
            pct: 100,
            rowLabel: `${rec.rooms.length} rooms`,
          }
        }
      }
    }
  }

  // Tenancy Agreement - a generated agreement lives in the DATE
  // question's answerJson too, same reasoning as Legionella/Inventory.
  if (section?.key === 'landlord_ast') {
    for (const t of tasks) {
      for (const q of (t.passportQuestions ?? []) as any[]) {
        const rec = q.answer?.answerJson
        if (q.questionTemplate?.type === 'DATE' && rec?.docText) {
          return {
            tone: 'good' as const,
            statusLabel: '✓ Generated',
            actionByLabel: '',
            subtitleLine: section?.subtitle ?? '',
            docCount: 1,
            docTotal: 1,
            pct: 100,
            rowLabel: 'Agreement ready',
          }
        }
      }
    }
  }

  for (const t of tasks) {
    const qs = (t.passportQuestions ?? []) as any[]
    for (const q of qs) {
      const isUpload =
        q.questionTemplate?.type === 'UPLOAD' ||
        !!(q.answer?.fileUrl ?? q.answer?.answerJson?.fileUrl ?? q.answer?.url)
      if (isUpload) {
        docTotal++
        // Multi-copy sections (client feedback 1a/3) never touch
        // QuestionAnswer.fileUrl at all - their certificates live on
        // UserDocument instead (see the /copies endpoints). The backend
        // marks the question COMPLETED once at least one copy exists
        // (uploadQuestionCopy), so treat that as equivalent to "has a
        // file" here - otherwise a passport whose certificates were
        // ALL uploaded via multi-copy (no legacy single-slot file ever
        // set) would show 0/1 doc forever despite having real
        // certificates on file.
        const file =
          q.answer?.fileUrl ?? q.answer?.answerJson?.fileUrl ?? q.answer?.url ?? (q.status === 'COMPLETED' ? true : null)
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

  return { tone, statusLabel, actionByLabel, subtitleLine, docCount, docTotal, pct, rowLabel: undefined as string | undefined }
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
  /* BottomNav is position:fixed and doesn't push content - needs enough
     clearance below the last card to not sit under it. Matches the
     seller passport's .passport-content padding-bottom (same fixed nav,
     same problem, same fix) rather than the old 32px which wasn't
     enough to clear the nav's actual height + safe-area-inset-bottom. */
  padding-bottom: 80px;
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
  color: #008a84;
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
  color: #008a84;
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
.pp-hero-dash-pct { color: #008a84; font-feature-settings: 'tnum'; }
.pp-hero-dash-bar {
  height: 8px;
  background: rgba(31, 122, 102, 0.12);
  border-radius: 100px;
  overflow: visible;
  position: relative;
}
.pp-hero-dash-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #008a84);
  border-radius: 100px;
  transition: width 0.3s ease;
  position: relative;
}
.pp-hero-dash-man {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15));
  pointer-events: none;
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
.pp-hero-dash-issued { color: #008a84; }
.pp-hero-dash-warn { color: #b85b36; }
.pp-hero-dash-dot { width: 7px; height: 7px; background: #00a19a; border-radius: 50%; }
.pp-hero-dash-warn-dot { width: 7px; height: 7px; background: #ff8b5a; border-radius: 50%; }

/* Convert card */
.lp-convert-card {
  width: calc(100% - 44px);
  margin: 4px 22px 16px;
  background:
    radial-gradient(ellipse 70% 70% at 30% 30%, rgba(255, 255, 255, 0.18), transparent 60%),
    linear-gradient(135deg, #00a19a, #008a84);
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
  background: #008a84;
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

/* List / Map view toggle wrapper - matches `.view-toggle` on the
   seller passport page so the SegmentedSwitch lays out identically. */
.lp-view-toggle {
  display: flex;
  gap: 16px;
  margin: 12px auto 16px;
  padding: 0 22px;
  position: relative;
  z-index: 1;
}

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

/* Section card - prototype look (icon tile + double pills + progress bar) */
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
  width: 64px; height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lp-sec-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

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
.lp-sec-pill-ic { width: 10px; height: 10px; object-fit: contain; }
.lp-sec-pill--good { background: #d6efe2; color: #008a84; }
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
.lp-sec-bar-fill--good { background: linear-gradient(90deg, #00a19a, #008a84); }
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
.lp-sec-pct--good { color: #008a84; }

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
.lp-doc-icon-img { width: 18px; height: 18px; object-fit: contain; }
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
.lp-tenancy-val.ok { color: #008a84; }

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
  background: #008a84;
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
  background: #00a19a;
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
.lp-doc-preview-icon-img { width: 24px; height: 24px; object-fit: contain; }
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
  color: #008a84;
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
  border: 1.5px dashed #00a19a;
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
  background: #00a19a;
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
.mform-input:focus { border-color: #00a19a; box-shadow: 0 0 0 3px rgba(61, 189, 163, 0.18); }
.lp-modal-hint {
  font-size: 11px;
  font-weight: 600;
  color: #4a5868;
  margin-top: 6px;
  line-height: 1.4;
}

/* Repeatable rows - Smoke & CO Alarms, Right to Rent occupiers */
.lp-repeat-block {
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
}
.lp-repeat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 700;
  color: #0e2840;
  margin-bottom: 10px;
}
.lp-repeat-rm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f1f4f3;
  color: #6b7089;
  border: none;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lp-repeat-rm:active { background: #fbeae5; color: #c0492f; }
.lp-two-col { display: flex; gap: 10px; }
.lp-two-col > .mform-section { flex: 1; }
.lp-two-col > .lp-toggle-chip { flex: 1; }
.lp-toggle-chip {
  padding: 9px;
  border-radius: 9px;
  border: 1.5px solid #e8eceb;
  background: #fff;
  font-size: 12px;
  font-weight: 700;
  color: #6b7089;
  cursor: pointer;
  text-align: center;
}
.lp-toggle-chip.on {
  background: #e7f6ef;
  border-color: #0f8a6e;
  color: #0f8a6e;
}
.lp-add-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 13px;
  border: 1.5px dashed #00a19a;
  background: #f2faf8;
  border-radius: 12px;
  color: #008a84;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 10px;
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

/* Renters' Rights Act Information Sheet legislation links */
.lp-leg-note {
  padding: 14px;
  background: #fbf1df;
  border: 1px solid #f0d9a8;
  border-radius: 13px;
  margin-bottom: 14px;
}
.lp-leg-note-t { font-size: 13px; font-weight: 800; color: #7a5500; }
.lp-leg-note-s { font-size: 12px; font-weight: 500; color: #8a6420; line-height: 1.5; margin-top: 6px; }
.lp-leg-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  margin-bottom: 9px;
  text-decoration: none;
}
.lp-leg-link:active { background: #f6f8f7; }
.lp-leg-link-ic {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: #e8edfb;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.lp-leg-link-ic-img { width: 22px; height: 22px; object-fit: contain; }
.lp-leg-link-bd { flex: 1; min-width: 0; }
.lp-leg-link-t { font-size: 13.5px; font-weight: 700; color: #0e2840; }
.lp-leg-link-s { font-size: 11px; font-weight: 500; color: #6b7089; margin-top: 1px; }
.lp-leg-link-go { font-size: 15px; color: #a8a9ad; flex-shrink: 0; }

/* Deposit Protection's prescribed-information checklist */
.lp-pi-item {
  display: flex;
  gap: 11px;
  padding: 11px 0;
  border-bottom: 1px solid #f0f0f4;
}
.lp-pi-item:last-child { border-bottom: none; }
.lp-pi-check {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: #e7f6ef;
  color: #0f8a6e;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800;
  flex-shrink: 0;
}
.lp-pi-tx { flex: 1; }
.lp-pi-t { font-size: 13.5px; font-weight: 700; color: #0e2840; }
.lp-pi-s { font-size: 11.5px; font-weight: 500; color: #6b7089; margin-top: 1px; line-height: 1.4; }

/* Legionella - drawer entry point (CTA card / saved-result summary) */
.lp-leg-cta {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: #f2faf8;
  border: 1.5px dashed #00a19a;
  border-radius: 14px;
  margin-bottom: 12px;
  cursor: pointer;
}
.lp-leg-cta-ic { font-size: 26px; flex-shrink: 0; }
.lp-leg-cta-ic-img { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; }
.lp-leg-cta-bd { flex: 1; }
.lp-leg-cta-t { font-size: 14.5px; font-weight: 700; color: #0e2840; }
.lp-leg-cta-s { font-size: 11.5px; font-weight: 500; color: #6b7089; margin-top: 2px; line-height: 1.4; }
.lp-leg-cta-go { font-size: 18px; color: #00a19a; flex-shrink: 0; }
.lp-leg-result {
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  color: #fff;
  background: linear-gradient(140deg, #0f8a6e, #0c6e58);
}
.lp-leg-result--medium { background: linear-gradient(140deg, #c98a2c, #a9761c); }
.lp-leg-result--higher { background: linear-gradient(140deg, #c0492f, #992e1a); }
.lp-leg-result-eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; opacity: 0.85; }
.lp-leg-result-level { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-top: 4px; }
.lp-leg-result-meta { font-size: 11.5px; font-weight: 500; opacity: 0.9; margin-top: 4px; }
.lp-leg-retake {
  margin-top: 12px;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Legionella - full-screen guided assessment wizard */
.lp-assess {
  /* Constrained to the app's .mobile-container width (max-w-md, 28rem)
     - client feedback: this full-screen wizard (Legionella/Inventory/
     Tenancy Agreement) was spilling to the full browser width on wider
     viewports instead of staying "inside the app size". `inset:0` alone
     stretches edge-to-edge regardless of max-width since it pins both
     left and right; centering via left:50%+translateX instead. */
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 100%;
  max-width: 28rem;
  transform: translateX(-50%);
  z-index: 100;
  background: #f4f4f8;
  display: flex;
  flex-direction: column;
}
.lp-assess-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f4f4f8;
}
.lp-assess-hdr {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 10px;
  flex-shrink: 0;
}
.lp-assess-back {
  background: none;
  border: none;
  color: #008a84;
  font-size: 24px;
  font-weight: 500;
  cursor: pointer;
  line-height: 1;
  padding: 0 2px;
}
.lp-assess-title { flex: 1; font-size: 17px; font-weight: 700; color: #0e2840; letter-spacing: -0.3px; }
.lp-assess-count { font-size: 14px; font-weight: 600; color: #a8a9ad; }
.lp-assess-scroll { flex: 1; overflow-y: auto; padding: 6px 20px 20px; }
.lp-assess-foot { padding: 12px 16px calc(14px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid #e8eceb; flex-shrink: 0; }
.lp-assess-steps { display: flex; gap: 5px; padding: 6px 20px 12px; }
.lp-assess-step { flex: 1; height: 4px; border-radius: 100px; background: #e7e7ee; }
.lp-assess-step.on { background: #00a19a; }
.lp-assess-qnum { font-size: 11px; font-weight: 800; color: #008a84; letter-spacing: 1px; text-transform: uppercase; }
.lp-assess-qh { font-size: 21px; font-weight: 700; letter-spacing: -0.5px; color: #0e2840; margin-top: 8px; line-height: 1.2; }
.lp-assess-qs { font-size: 13.5px; font-weight: 500; color: #6b7089; line-height: 1.5; margin-top: 8px; margin-bottom: 20px; }
.lp-assess-opt {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 15px;
  border: 1.5px solid #e8eceb;
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  margin-bottom: 11px;
  transition: all 0.12s;
}
.lp-assess-opt.on { border-color: #00a19a; background: #f2faf8; }
.lp-assess-opt-ic { width: 42px; height: 42px; border-radius: 11px; background: #f1f4f3; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.lp-assess-opt.on .lp-assess-opt-ic { background: #fff; }
.lp-assess-opt-ic-img { width: 30px; height: 30px; object-fit: contain; }
.lp-assess-opt-bd { flex: 1; }
.lp-assess-opt-t { font-size: 14.5px; font-weight: 700; color: #0e2840; letter-spacing: -0.2px; }
.lp-assess-opt-d { font-size: 12px; font-weight: 500; color: #6b7089; margin-top: 2px; line-height: 1.4; }
.lp-assess-opt-r { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #e8eceb; flex-shrink: 0; align-self: center; position: relative; }
.lp-assess-opt.on .lp-assess-opt-r { border-color: #00a19a; }
.lp-assess-opt.on .lp-assess-opt-r::after { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: #00a19a; }
.lp-assess-resband { padding: 20px; border-radius: 18px; color: #fff; margin-bottom: 10px; background: linear-gradient(140deg, #0f8a6e, #0c6e58); }
.lp-assess-resband--medium { background: linear-gradient(140deg, #c98a2c, #a9761c); }
.lp-assess-resband--higher { background: linear-gradient(140deg, #c0492f, #992e1a); }
.lp-assess-res-eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; opacity: 0.8; }
.lp-assess-res-level { font-size: 30px; font-weight: 800; letter-spacing: -0.8px; margin-top: 6px; }
.lp-assess-res-desc { font-size: 13px; font-weight: 500; opacity: 0.9; margin-top: 6px; line-height: 1.5; }
.lp-assess-flag { display: flex; gap: 11px; margin-top: 10px; padding: 14px; border-radius: 13px; }
.lp-assess-flag--warn { background: #fbf1df; border: 1px solid #f0d9a8; }
.lp-assess-flag--pro { background: #fbeae5; border: 1px solid #f0c3b8; }
.lp-assess-flag-ic { font-size: 17px; flex-shrink: 0; }
.lp-assess-flag-ic-img { width: 24px; height: 24px; object-fit: contain; }
.lp-assess-flag-t { font-size: 12.5px; font-weight: 600; line-height: 1.5; color: #4a5868; }
.lp-assess-sech { font-size: 11px; font-weight: 800; color: #6b7089; letter-spacing: 1.4px; text-transform: uppercase; padding: 20px 0 10px; }
.lp-assess-action { display: flex; gap: 12px; margin-bottom: 10px; padding: 15px; background: #fff; border: 1px solid #e8eceb; border-radius: 14px; }
.lp-assess-action-ic { width: 38px; height: 38px; border-radius: 10px; background: #f2faf8; display: flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
.lp-assess-action-ic-img { width: 26px; height: 26px; object-fit: contain; }
.lp-assess-action-bd { flex: 1; }
.lp-assess-action-t { font-size: 14px; font-weight: 700; color: #0e2840; }
.lp-assess-action-s { font-size: 12px; font-weight: 500; color: #6b7089; margin-top: 2px; line-height: 1.45; }
.lp-assess-action-freq { font-size: 10.5px; font-weight: 800; color: #008a84; background: #f2faf8; padding: 3px 8px; border-radius: 100px; margin-top: 7px; display: inline-block; }
.lp-assess-sum { background: #fff; border: 1px solid #e8eceb; border-radius: 14px; overflow: hidden; }
.lp-assess-sum-row { display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid #f0f0f4; font-size: 13px; }
.lp-assess-sum-row:last-child { border-bottom: none; }
.lp-assess-sum-row span:first-child { color: #6b7089; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; }
.lp-assess-sum-ic-img { width: 16px; height: 16px; object-fit: contain; }
.lp-assess-sum-row span:last-child { color: #0e2840; font-weight: 700; text-align: right; max-width: 60%; }
.lp-assess-intro-ic { width: 70px; height: 70px; border-radius: 20px; background: #f2faf8; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 8px auto 0; }
.lp-assess-intro-ic-img { width: 42px; height: 42px; object-fit: contain; }
.lp-assess-intro-h { font-size: 23px; font-weight: 700; letter-spacing: -0.5px; color: #0e2840; text-align: center; margin-top: 16px; padding: 0 22px; }
.lp-assess-intro-s { font-size: 14px; font-weight: 500; color: #6b7089; line-height: 1.55; text-align: center; margin: 10px 0 0; }
.lp-assess-info { margin: 20px 0 0; padding: 16px; background: #e7f6ef; border: 1px solid #bfe6d5; border-radius: 14px; }
.lp-assess-info-t { font-size: 13.5px; font-weight: 800; color: #0c6e58; }
.lp-assess-info-s { font-size: 12.5px; font-weight: 500; color: #0c6e58; line-height: 1.5; margin-top: 6px; }
.lp-assess-ok { width: 80px; height: 80px; border-radius: 50%; background: #e7f6ef; display: flex; align-items: center; justify-content: center; margin: 20px auto 0; font-size: 38px; color: #0f8a6e; }

/* Inventory & Schedule of Condition */
.lp-inv-chiprow { display: flex; gap: 9px; }
.lp-inv-chip {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 1.5px solid #e8eceb;
  border-radius: 14px;
  background: #fff;
  font-size: 12.5px;
  font-weight: 700;
  color: #6b7089;
  cursor: pointer;
}
.lp-inv-chip-ic { width: 22px; height: 22px; object-fit: contain; }
.lp-inv-chip.on { border-color: #00a19a; background: #f2faf8; color: #0e2840; }
.lp-inv-pw-heading { font-size: 11.5px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; color: #6b7089; margin: 18px 0 8px; }
.pgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 4px; }
.pgrid-item { position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: #f2faf8; }
.pgrid-img { width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
.pgrid-rm { position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border-radius: 50%; background: rgba(14,40,64,0.65); color: #fff; border: none; font-size: 11px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.pgrid-add { aspect-ratio: 1; border-radius: 12px; border: 1.5px dashed #b9c3c1; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 10.5px; font-weight: 700; color: #6b7089; position: relative; cursor: pointer; }
.pgrid-add span { pointer-events: none; }
.lp-inv-prog { margin-bottom: 14px; }
.lp-inv-pbar { height: 8px; background: #e7e7ee; border-radius: 100px; overflow: hidden; }
.lp-inv-pfill { height: 100%; background: linear-gradient(90deg, #00a19a, #00c4bc); border-radius: 100px; transition: width 0.5s cubic-bezier(.22,1,.36,1); }
.lp-inv-ptext { display: flex; justify-content: space-between; margin-top: 7px; font-size: 12px; font-weight: 600; color: #6b7089; }
.lp-inv-ptext b { color: #0e2840; }
.lp-inv-room {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 10px;
  padding: 14px;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 15px;
  cursor: pointer;
}
.lp-inv-room-ic { width: 44px; height: 44px; border-radius: 12px; background: #f2faf8; display: flex; align-items: center; justify-content: center; font-size: 21px; flex-shrink: 0; }
.lp-inv-room-ic-img { width: 30px; height: 30px; object-fit: contain; }
.lp-assess-title--iconrow { display: flex; align-items: center; gap: 7px; }
.lp-assess-title-ic-img { width: 22px; height: 22px; object-fit: contain; }
.lp-inv-room-bd { flex: 1; min-width: 0; }
.lp-inv-room-n { font-size: 15px; font-weight: 700; color: #0e2840; letter-spacing: -0.2px; }
.lp-inv-room-m { font-size: 11.5px; font-weight: 500; color: #6b7089; margin-top: 2px; }
.lp-inv-badge { font-size: 10.5px; font-weight: 800; padding: 5px 10px; border-radius: 100px; }
.lp-inv-badge.done { background: #e7f6ef; color: #0f8a6e; }
.lp-inv-badge.todo { background: #f1f4f3; color: #a8a9ad; }
.lp-inv-room-remove {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #fbeae5;
  color: #c2410c;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}
.lp-inv-addroom {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.lp-inv-addroom-input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: 1.5px dashed #d4d8d7;
  border-radius: 13px;
  background: #fafaf8;
  font-size: 13px;
  font-family: inherit;
  color: #0e2840;
}
.lp-inv-addroom-input:focus {
  outline: none;
  border-color: #00a19a;
  border-style: solid;
  background: #fff;
}
.lp-inv-addroom-btn {
  flex-shrink: 0;
  padding: 0 16px;
  border: none;
  border-radius: 13px;
  background: #0e2840;
  color: #fff;
  font-size: 12.5px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}
.lp-inv-addroom-btn:disabled {
  background: #d4d8d7;
  cursor: not-allowed;
}
.lp-inv-item { background: #fff; border: 1px solid #e8eceb; border-radius: 14px; padding: 14px; margin-bottom: 10px; }
.lp-inv-item-n { font-size: 14.5px; font-weight: 700; color: #0e2840; }
.lp-inv-rl { font-size: 10px; font-weight: 800; color: #a8a9ad; letter-spacing: 0.5px; text-transform: uppercase; margin: 11px 0 6px; }
.lp-inv-crow { display: flex; gap: 6px; }
.lp-inv-cd {
  flex: 1;
  padding: 8px 4px;
  border-radius: 9px;
  border: 1.5px solid #e8eceb;
  background: #fff;
  font-size: 11px;
  font-weight: 700;
  color: #6b7089;
  cursor: pointer;
  text-align: center;
  transition: all 0.12s;
}
.lp-inv-cd.g.on, .lp-inv-cd.cl.on { background: #e7f6ef; border-color: #0f8a6e; color: #0f8a6e; }
.lp-inv-cd.f.on, .lp-inv-cd.mk.on { background: #fbf1df; border-color: #c98a2c; color: #c98a2c; }
.lp-inv-cd.p.on, .lp-inv-cd.dt.on { background: #fbeae5; border-color: #c0492f; color: #c0492f; }
.lp-inv-note {
  margin-top: 11px;
  width: 100%;
  border: 1px solid #e8eceb;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 13px;
  color: #0e2840;
  outline: none;
  resize: none;
  height: 38px;
}
.lp-inv-note:focus { border-color: #00a19a; height: 56px; }

/* Tenancy Agreement generator */
.lp-tn-verbadge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 13px 15px;
  background: #e7f6ef;
  border: 1px solid #bfe6d5;
  border-radius: 13px;
  font-size: 12.5px;
  font-weight: 600;
  color: #0c6e58;
  line-height: 1.4;
}
.lp-tn-pending { display: block; color: #8a6420; font-weight: 700; margin-top: 4px; }
.lp-tn-mand { padding: 14px; background: #e8edfb; border: 1px solid #c7d3f0; border-radius: 13px; }
.lp-tn-mand-t { font-size: 12.5px; font-weight: 800; color: #3d63c9; }
.lp-tn-mand-item { display: flex; gap: 9px; padding: 5px 0; font-size: 12px; font-weight: 600; color: #2c4aa0; }
.lp-tn-mand-s { font-size: 11.5px; font-weight: 500; color: #2c4aa0; margin-top: 5px; line-height: 1.5; }
.lp-tn-pulled { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; color: #008a84; margin-top: 6px; }

/* Tenancy Agreement — Next steps / e-signature */
.lp-tn-readydoc {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border-radius: 14px; padding: 14px;
  box-shadow: 0 4px 18px rgba(35, 29, 69, 0.06);
}
.lp-tn-readydoc-ic { width: 40px; height: 40px; border-radius: 10px; background: #f1f9f4; display: flex; align-items: center; justify-content: center; font-size: 19px; flex-shrink: 0; }
.lp-tn-readydoc-bd { flex: 1; min-width: 0; }
.lp-tn-readydoc-t { font-size: 14px; font-weight: 800; color: #0e2840; }
.lp-tn-readydoc-s { font-size: 11.5px; font-weight: 600; color: #6b7089; margin-top: 2px; }
.lp-tn-readydoc-v { font-size: 10px; font-weight: 800; color: #008a84; background: #e6f7f6; padding: 4px 8px; border-radius: 100px; flex-shrink: 0; }

.lp-tn-step {
  display: flex; align-items: flex-start; gap: 12px;
  background: #fff; border-radius: 14px; padding: 14px; margin-top: 10px;
  box-shadow: 0 4px 18px rgba(35, 29, 69, 0.06);
  cursor: pointer;
}
.lp-tn-step--plain { cursor: default; }
.lp-tn-step-ic { width: 36px; height: 36px; border-radius: 10px; background: #f4f4f8; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.lp-tn-step-bd { flex: 1; min-width: 0; }
.lp-tn-step-t { font-size: 13.5px; font-weight: 800; color: #0e2840; }
.lp-tn-step-s { font-size: 11.5px; font-weight: 600; color: #6b7089; margin-top: 2px; }
.lp-tn-step-pill { display: inline-block; margin-top: 8px; font-size: 10px; font-weight: 800; padding: 4px 9px; border-radius: 100px; background: #fdf1dc; color: #a06b1a; }
.lp-tn-step-pill.done { background: #e7f6ef; color: #0f8a6e; }
.lp-tn-step-go { color: #b9b9c4; font-size: 18px; align-self: center; flex-shrink: 0; }

.lp-tn-consent {
  display: flex; align-items: flex-start; gap: 10px; margin: 16px 0;
  font-size: 12px; font-weight: 500; color: #3a3f52; line-height: 1.5; cursor: pointer;
}
.lp-tn-consent input { margin-top: 2px; flex-shrink: 0; }

.lp-tn-linkbox {
  background: #f4f4f8; border: 1px solid #e8eceb; border-radius: 10px;
  padding: 10px 12px; font-size: 12px; font-weight: 600; color: #0e2840;
  word-break: break-all;
}
.lp-tn-audit-row { display: flex; align-items: center; gap: 9px; padding: 6px 0; font-size: 12.5px; font-weight: 600; color: #3a3f52; }
.lp-tn-audit-dot { width: 8px; height: 8px; border-radius: 50%; background: #e8eceb; flex-shrink: 0; }
.lp-tn-audit-dot.done { background: #0f8a6e; }
.lp-tn-doc {
  margin: 8px 0 0;
  background: #fff;
  border: 1px solid #e8eceb;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(35, 29, 65, 0.07);
  padding: 22px 20px;
  font-size: 12px;
  line-height: 1.6;
  color: #2a2a38;
}
.lp-tn-doc h1 { font-size: 16px; font-weight: 800; color: #0e2840; text-align: center; letter-spacing: -0.2px; }
.lp-tn-docsub { text-align: center; font-size: 10.5px; color: #6b7089; font-weight: 600; margin-top: 3px; margin-bottom: 16px; }
.lp-tn-doc h2 { font-size: 11px; font-weight: 800; color: #008a84; letter-spacing: 0.6px; text-transform: uppercase; margin: 16px 0 6px; border-bottom: 1px solid #f0f0f4; padding-bottom: 4px; }
.lp-tn-kvr { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; }
.lp-tn-kvr .k { color: #6b7089; font-weight: 600; }
.lp-tn-kvr .v { color: #0e2840; font-weight: 700; text-align: right; }
.lp-tn-clause { font-size: 11.5px; color: #3a3a48; margin-bottom: 7px; }
.lp-tn-docver { text-align: center; font-size: 10px; color: #a8a9ad; font-weight: 600; margin-top: 16px; border-top: 1px solid #f0f0f4; padding-top: 10px; }
.lp-tn-legalnote { margin: 14px 0 0; padding: 13px 15px; background: #fbf1df; border: 1px solid #f0d9a8; border-radius: 12px; font-size: 11.5px; font-weight: 600; color: #7a5500; line-height: 1.5; }

/* Legislation & news rail moved to pages/dashboard.vue (.dash-news-*) */
.lp-warn-icon-img { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; }
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
