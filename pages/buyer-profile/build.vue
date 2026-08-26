<template>
  <div class="bp-page">
    <!-- Sticky header (hidden on the celebration screen) -->
    <div v-if="step <= 7" class="bp-header">
      <button class="bp-back" @click="goBack" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
          <polyline
            points="15 18 9 12 15 6"
            stroke="#231d45"
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <div class="bp-header-body">
        <template v-if="step <= 4">
          <div class="bp-header-title-row">
            <span class="bp-header-title3">{{ coreSteps[step - 1].headerTitle }}</span>
            <button
              class="bp-header-info"
              type="button"
              aria-label="What happens in this step?"
              @click="showStepInfoToast"
            >
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8" />
                <path d="M12 11v5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <circle cx="12" cy="7.6" r="1" fill="currentColor" />
              </svg>
            </button>
          </div>
        </template>
        <template v-else>
          <div class="bp-header-title">Build your Buyer Passport</div>
          <div class="bp-header-sub">Bonus step {{ step - 4 }} of 3</div>
        </template>
      </div>
      <div style="width: 36px" />
    </div>

    <!-- 4-step labeled stepper for the core Passport steps (matches the
         "Identity / Buying position / Finance / Chain position" prototype). -->
    <div v-if="step <= 4" class="bp-stepper">
      <div
        v-for="(s, i) in coreSteps"
        :key="s.key"
        class="bp-stepper-dot"
        :class="{ done: step > i + 1, active: step === i + 1 }"
      >
        <span class="bp-stepper-num">
          <template v-if="step > i + 1">✓</template>
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="bp-stepper-label">{{ s.label }}</span>
      </div>
    </div>

    <!-- Plain progress bar for the 3 bonus steps beyond the core 4 (tier /
         solicitor / story) — these aren't part of the prototype's numbered
         flow, so they keep the simpler existing indicator rather than
         inventing new labeled-dot artwork for them. -->
    <div v-else class="bp-progress">
      <div
        v-for="n in 3"
        :key="n"
        class="bp-progress-seg"
        :class="{ 'bp-progress-seg-filled': n <= step - 4 }"
      />
    </div>

    <div class="bp-scroll">
      <!-- ── STEP 1: KYC — Photo ID / Selfie / AML ── -->
      <div v-if="step === 1" class="bp-step">
        <!-- Identity intro + document picker card (prototype-exact) -->
        <div class="bp-id-panel">
          <div class="bp-id-panel-head">
            <img
              src="/op-icons/passportview/umu-passport.png"
              alt=""
              class="bp-id-panel-icon"
              loading="lazy"
            />
            <div>
              <div class="bp-id-panel-title">Let's verify who you are</div>
              <div class="bp-id-panel-body">
                This helps build trust with sellers when you choose to show
                them you're a verified buyer.
              </div>
            </div>
          </div>

          <div class="bp-id-panel-label">Choose a document to verify</div>
          <div class="bp-doctype-list">
            <div
              v-for="opt in idTypeOptions"
              :key="opt.value"
              class="bp-doctype-row"
              :class="{ selected: idDocumentType === opt.value }"
              @click="idDocumentType = opt.value"
            >
              <div class="bp-doctype-ic">
                <img v-if="opt.icon" :src="opt.icon" alt="" loading="lazy" />
                <span v-else>{{ opt.emoji }}</span>
              </div>
              <div class="bp-doctype-body">
                <div class="bp-doctype-title">{{ opt.title }}</div>
                <div v-if="opt.sub" class="bp-doctype-sub">{{ opt.sub }}</div>
              </div>
              <span v-if="opt.recommended" class="bp-doctype-rec">RECOMMENDED</span>
              <span class="bp-doctype-chev">
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <!-- Trust strip (DVS-styled, matches prototype dvs-strip) -->
        <div class="bp-trust">
          <img src="/op-icons/verify-identity/dvsBank.png" alt="" class="bp-trust-illus" loading="lazy" />
          <div>
            Powered by <strong>Onfido</strong> · Certified under the UK Digital
            Verification Services Trust Framework · Bank-grade · Data deleted
            after 90 days.
          </div>
        </div>

        <!-- Task 1: Photo ID -->
        <div
          class="bp-task"
          :class="{ active: kycActive === 'id' && !kycIdDone, done: kycIdDone }"
        >
          <div class="bp-task-row" @click="setKycActive('id')">
            <div class="bp-task-ic bp-task-ic--illus">
              <img src="/op-icons/verify-identity/idCard.png" alt="" loading="lazy" />
            </div>
            <div class="bp-task-body">
              <div class="bp-task-title">Photo ID</div>
              <div class="bp-task-meta">
                {{ kycIdDone ? 'ID matched · ready' : 'Passport or driving licence — front & back' }}
              </div>
            </div>
            <span class="bp-task-status" :class="kycIdStatusClass">{{ kycIdStatus }}</span>
          </div>
          <div v-if="kycActive === 'id' && !kycIdDone" class="bp-task-extras">
            <div class="bp-id-grid">
              <div
                class="bp-id-tile"
                :class="{ captured: kycIdFront }"
                @click.stop="openKycSheet('id-front')"
              >
                <template v-if="!kycIdFront">
                  <div class="bp-id-side">Front</div>
                  <div class="bp-id-iconbig bp-id-iconbig--illus">
                    <img src="/op-icons/verify-identity/cameraFront.png" alt="" loading="lazy" />
                  </div>
                  <div class="bp-id-prompt">Tap to capture front</div>
                </template>
                <template v-else>
                  <div class="bp-id-iconbig bp-id-iconbig--small">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div class="bp-id-text">
                    <div class="bp-id-name">Front captured</div>
                    <div class="bp-id-status">✓ Clear &amp; readable</div>
                  </div>
                </template>
              </div>
              <div
                class="bp-id-tile"
                :class="{ captured: kycIdBack }"
                @click.stop="openKycSheet('id-back')"
              >
                <template v-if="!kycIdBack">
                  <div class="bp-id-side">Back</div>
                  <div class="bp-id-iconbig bp-id-iconbig--illus">
                    <img src="/op-icons/verify-identity/cameraBack.png" alt="" loading="lazy" />
                  </div>
                  <div class="bp-id-prompt">Tap to capture back</div>
                </template>
                <template v-else>
                  <div class="bp-id-iconbig bp-id-iconbig--small">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div class="bp-id-text">
                    <div class="bp-id-name">Back captured</div>
                    <div class="bp-id-status">✓ Clear &amp; readable</div>
                  </div>
                </template>
              </div>
            </div>
            <div class="bp-id-pills">
              <span class="bp-id-pill">🇬🇧 UK Passport</span>
              <span class="bp-id-pill">🪪 Driving Licence</span>
              <span class="bp-id-pill">🌍 EU Passport</span>
            </div>
          </div>
        </div>

        <!-- Task 2: Selfie -->
        <div
          class="bp-task"
          :class="{ active: kycActive === 'selfie' && !kycSelfieDone, done: kycSelfieDone }"
        >
          <div class="bp-task-row" @click="setKycActive('selfie')">
            <div class="bp-task-ic bp-task-ic--illus">
              <img src="/op-icons/verify-identity/people.png" alt="" loading="lazy" />
            </div>
            <div class="bp-task-body">
              <div class="bp-task-title">Selfie · liveness check</div>
              <div class="bp-task-meta">
                {{ kycSelfieDone ? 'Liveness confirmed' : '20-second face scan to confirm it\'s you' }}
              </div>
            </div>
            <span class="bp-task-status" :class="kycSelfieStatusClass">{{ kycSelfieStatus }}</span>
          </div>
          <div
            v-if="kycActive === 'selfie' && !kycSelfieDone"
            class="bp-task-extras"
          >
            <div class="bp-selfie-box" @click.stop="runLiveness">
              <div class="bp-selfie-iconbig"><img src="/op-icons/misc/phoneSelfie.png" alt="" loading="lazy" /></div>
              <div class="bp-selfie-prompt">Tap to start face scan</div>
              <div class="bp-selfie-meta">
                Look at the camera and follow the on-screen prompts
              </div>
            </div>
          </div>
        </div>

        <!-- Task 3: AML screening -->
        <div
          class="bp-task"
          :class="{ active: kycActive === 'aml' && !kycAmlDone, done: kycAmlDone }"
        >
          <div class="bp-task-row" @click="setKycActive('aml')">
            <div class="bp-task-ic bp-task-ic--illus">
              <img src="/op-icons/verify-identity/shield.png" alt="" loading="lazy" />
            </div>
            <div class="bp-task-body">
              <div class="bp-task-title">AML screening</div>
              <div class="bp-task-meta">
                {{ kycAmlDone ? 'Sanctions · PEP · adverse media — all clear' : 'Sanctions, PEP & adverse media — runs automatically' }}
              </div>
            </div>
            <span class="bp-task-status" :class="kycAmlStatusClass">{{ kycAmlStatus }}</span>
          </div>
          <div
            v-if="kycActive === 'aml' && !kycAmlDone"
            class="bp-task-extras"
          >
            <div class="bp-aml-list">
              <div
                v-for="(row, i) in amlRows"
                :key="row.label"
                class="bp-aml-row"
                :class="{ checking: amlStep === i, clear: amlStep > i }"
              >
                <div class="bp-aml-dot">
                  <template v-if="amlStep > i">✓</template>
                  <template v-else>{{ i + 1 }}</template>
                </div>
                <strong>{{ row.label }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Persona-in-progress banner: shown while the user is in the
             other tab. Reassures them not to close this tab and offers a
             manual recheck if polling times out. -->
        <div v-if="kycPolling && !kycAllDone" class="bp-kyc-pending">
          <span class="bp-kyc-pending-spinner" />
          <div class="bp-kyc-pending-body">
            <div class="bp-kyc-pending-title">
              Verifying with Persona…
            </div>
            <div class="bp-kyc-pending-sub">
              Finish the steps in the new tab. We'll pick up the result
              automatically — keep this tab open.
            </div>
          </div>
          <button
            class="bp-kyc-pending-btn"
            type="button"
            :disabled="kycCheckingNow"
            @click="recheckKycNow"
          >
            <span v-if="kycCheckingNow" class="bp-kyc-mini-spinner" />
            {{ kycCheckingNow ? 'Checking…' : "I've finished" }}
          </button>
        </div>

        <!-- Error / decline / needs-review message -->
        <div v-if="kycError && !kycAllDone" class="bp-kyc-err">
          <div class="bp-kyc-err-ic">!</div>
          <div class="bp-kyc-err-body">{{ kycError }}</div>
          <button
            v-if="!kycPolling"
            class="bp-kyc-err-retry"
            type="button"
            @click="startBuyerKyc"
          >
            Retry
          </button>
        </div>

        <!-- KYC verified panel — appears once all 3 tasks pass -->
        <div v-if="kycAllDone" class="bp-kyc-success">
          <div class="bp-kyc-success-ic">✓</div>
          <div class="bp-kyc-success-title">Identity verified</div>
          <div class="bp-kyc-success-sub">
            All three checks passed. Auto-continuing in {{ kycCountdown }}s…
          </div>
        </div>

        <button
          class="bp-next"
          :class="{ disabled: !kycAllDone, ready: kycAllDone }"
          :disabled="!kycAllDone"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Continue →' }}
        </button>

        <!-- Capture method bottom sheet (ID front/back) -->
        <Teleport to="body">
          <div v-if="kycSheetOpen" class="bp-sheet-overlay" @click="closeKycSheet" />
          <div v-if="kycSheetOpen" class="bp-sheet">
            <div class="bp-sheet-handle" />
            <h3 class="bp-sheet-title">Capture your ID</h3>
            <div class="bp-sheet-sub">
              Capture the {{ kycSheetSide }} of your ID — make sure all four corners are visible.
            </div>
            <button class="bp-method" @click="simulateIdCapture">
              <div class="bp-method-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <div class="bp-method-body">
                <div class="bp-method-title">Take a photo</div>
                <div class="bp-method-sub">Use your camera now</div>
              </div>
              <div class="bp-method-chev">›</div>
            </button>
            <button class="bp-method" @click="simulateIdCapture">
              <div class="bp-method-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div class="bp-method-body">
                <div class="bp-method-title">Choose from photos</div>
                <div class="bp-method-sub">Pick an existing image</div>
              </div>
              <div class="bp-method-chev">›</div>
            </button>
            <button class="bp-method" @click="simulateIdCapture">
              <div class="bp-method-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div class="bp-method-body">
                <div class="bp-method-title">Choose a file</div>
                <div class="bp-method-sub">PDF, JPG or PNG · max 10MB</div>
              </div>
              <div class="bp-method-chev">›</div>
            </button>
            <button class="bp-cancel" @click="closeKycSheet">Cancel</button>
          </div>

          <!-- Liveness overlay -->
          <div v-if="livenessRunning" class="bp-liveness">
            <div class="bp-liveness-circle">
              <div class="bp-liveness-ring" />
              <div class="bp-liveness-face"><img src="/op-icons/misc/phoneSelfie.png" alt="" loading="lazy" /></div>
            </div>
            <div class="bp-liveness-h1">{{ livenessTitle }}</div>
            <div class="bp-liveness-sub">Hold still — we'll capture automatically.</div>
            <div class="bp-liveness-step">{{ livenessStep }}</div>
          </div>
        </Teleport>
      </div>

      <!-- ── STEP 2: Buying position ── -->
      <div v-if="step === 2" class="bp-step">
        <div class="bp-step-hero bp-step-hero--narrow">
          <div class="bp-step-ic"><img src="/op-icons/buyer-profile-build/target.png" alt="" loading="lazy" /></div>
          <div class="bp-step-title">Your buying position</div>
          <div class="bp-step-body">Tell us about your buying plans</div>
        </div>

        <!-- Timeline -->
        <div class="bp-sec-label">TIMELINE</div>
        <div class="bp-chip-row">
          <button
            v-for="opt in timelineOptions"
            :key="opt.value"
            class="bp-chip"
            :class="{ active: timeline === opt.value }"
            @click="timeline = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Property type -->
        <div class="bp-sec-label">PROPERTY TYPE</div>
        <div class="bp-chip-row">
          <button
            v-for="opt in propertyTypeOptions"
            :key="opt.value"
            class="bp-chip"
            :class="{ active: propertyType === opt.value }"
            @click="propertyType = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <button
          class="bp-next"
          :class="{ disabled: !canContinue }"
          :disabled="!canContinue"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Next step →' }}
        </button>
      </div>

      <!-- ── STEP 3: Finance ── -->
      <div v-if="step === 3" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic"><img src="/op-icons/buyer-profile-build/bank.png" alt="" loading="lazy" /></div>
          <div class="bp-step-title">Add proof of funds</div>
          <div class="bp-step-body">
            Add proof of funds or your mortgage position — this helps sellers
            confirm your maximum budget.
          </div>
        </div>

          <div class="bp-funds-intro">
            Pick the source that matches your situation. We use this to confirm
            your maximum budget with the seller.
          </div>
          <div class="bp-option-list">
            <div
              v-for="opt in fundsOptions"
              :key="opt.value"
              class="bp-funds-card"
              :class="{ selected: fundsType === opt.value }"
              @click="selectFunds(opt.value)"
            >
            <div class="bp-funds-row">
              <div class="bp-funds-ic">
                <img :src="opt.emoji" alt="" loading="lazy" />
              </div>
              <div class="bp-funds-body">
                <div class="bp-funds-title">{{ opt.title }}</div>
                <div class="bp-funds-meta">{{ opt.sub }}</div>
              </div>
              <div class="bp-funds-radio" :class="{ filled: fundsType === opt.value }" />
            </div>
            <div v-if="fundsType === opt.value" class="bp-funds-extras">
              <!-- Uploaded chip -->
              <div v-if="fundsUpload" class="bp-uploaded-chip">
                <div class="bp-uploaded-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div class="bp-uploaded-body">
                  <div class="bp-uploaded-name">{{ fundsUpload.name }}</div>
                  <div class="bp-uploaded-meta">
                    <span class="bp-uploaded-check">✓</span> Uploaded · {{ fundsUpload.size }}
                  </div>
                </div>
                <div class="bp-uploaded-actions">
                  <button class="bp-uploaded-btn" title="Replace" @click.stop="openFundsSheet">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                  </button>
                  <button class="bp-uploaded-btn remove" title="Remove" @click.stop="removeFundsUpload">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
              <!-- Uploading progress -->
              <div v-else-if="fundsUploading" class="bp-up-progress">
                <div class="bp-up-row">
                  <div class="bp-up-ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <path d="M21 12a9 9 0 1 1-6.2-8.55" />
                    </svg>
                  </div>
                  <div class="bp-up-body">
                    <div class="bp-up-name">{{ currentFundsLabel }}</div>
                    <div class="bp-up-meta">Uploading…</div>
                  </div>
                </div>
                <div class="bp-up-bar"><div class="bp-up-bar-fill" :style="{ width: fundsUploadPct + '%' }" /></div>
              </div>
              <!-- Upload zone -->
              <div v-else class="bp-upload-zone" @click.stop="openFundsSheet">
                <div class="bp-upload-ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div class="bp-upload-title">Tap to upload your document</div>
                <div class="bp-upload-meta">PDF, JPG or PNG · max 10MB · encrypted</div>
              </div>
            </div>
          </div>
          </div>

          <div class="bp-field-label">Maximum budget</div>
          <div class="bp-budget-wrap">
            <span class="bp-budget-sign">£</span>
            <input
              type="number"
              v-model.number="fundsAmount"
              placeholder="350,000"
              class="bp-budget-input"
              inputmode="numeric"
            />
          </div>

        <button
          class="bp-next"
          :class="{ disabled: !canContinue }"
          :disabled="!canContinue"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Next step →' }}
        </button>

        <!-- Funds upload bottom sheet -->
        <Teleport to="body">
          <div v-if="fundsSheetOpen" class="bp-sheet-overlay" @click="closeFundsSheet" />
          <div v-if="fundsSheetOpen" class="bp-sheet">
            <div class="bp-sheet-handle" />
            <h3 class="bp-sheet-title">Upload your document</h3>
            <div class="bp-sheet-sub">
              For {{ currentFundsLabel.toLowerCase() }} — choose how you'd like to share your document.
            </div>
            <button class="bp-method" @click="simulateFundsUpload('camera')">
              <div class="bp-method-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <div class="bp-method-body">
                <div class="bp-method-title">Take a photo</div>
                <div class="bp-method-sub">Use your camera now</div>
              </div>
              <div class="bp-method-chev">›</div>
            </button>
            <button class="bp-method" @click="simulateFundsUpload('photos')">
              <div class="bp-method-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div class="bp-method-body">
                <div class="bp-method-title">Choose from photos</div>
                <div class="bp-method-sub">Pick an existing image</div>
              </div>
              <div class="bp-method-chev">›</div>
            </button>
            <button class="bp-method" @click="simulateFundsUpload('files')">
              <div class="bp-method-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div class="bp-method-body">
                <div class="bp-method-title">Choose a file</div>
                <div class="bp-method-sub">PDF, JPG or PNG · max 10MB</div>
              </div>
              <div class="bp-method-chev">›</div>
            </button>
            <button class="bp-method" @click="simulateFundsUpload('cloud')">
              <div class="bp-method-ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
                </svg>
              </div>
              <div class="bp-method-body">
                <div class="bp-method-title">Import from cloud</div>
                <div class="bp-method-sub">Drive, Dropbox or iCloud</div>
              </div>
              <div class="bp-method-chev">›</div>
            </button>
            <button class="bp-cancel" @click="closeFundsSheet">Cancel</button>
          </div>
        </Teleport>
      </div>

      <!-- ── STEP 4: Chain position ── -->
      <div v-if="step === 4" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic"><img src="/op-icons/investment/chainLink.png" alt="" loading="lazy" /></div>
          <div class="bp-step-title">Your chain position</div>
          <div class="bp-step-body">
            Chain-free buyers are preferred by 78% of sellers.
          </div>
        </div>
        <div class="bp-option-list">
          <button
            v-for="opt in chainOptions"
            :key="opt.value"
            class="bp-option-card"
            :class="{ selected: chainPosition === opt.value }"
            @click="chainPosition = opt.value"
          >
            <div class="bp-option-body">
              <div class="bp-option-title-row">
                <span class="bp-option-title">{{ opt.title }}</span>
                <span v-if="opt.badge" class="bp-best-pill">{{ opt.badge }}</span>
              </div>
              <div class="bp-option-sub">{{ opt.sub }}</div>
            </div>
            <div class="bp-option-check" :class="{ filled: chainPosition === opt.value }" />
          </button>
        </div>

        <!-- Amber context card -->
        <div class="bp-amber-card">
          <div class="bp-amber-ic">💡</div>
          <div>
            <div class="bp-amber-title">Chain-free buyers</div>
            <div class="bp-amber-body">
              Sellers receive 78% fewer complications from chain-free buyers
              and often prefer them even at a lower offer price.
            </div>
          </div>
        </div>

        <button
          class="bp-next"
          :class="{ disabled: !canContinue }"
          :disabled="!canContinue"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Confirm my position →' }}
        </button>
      </div>

      <!-- ── STEP 5: Identity Verified (bonus step, beyond the core 4) ── -->
      <div v-if="step === 5" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-purple"><img src="/op-icons/misc/star.png" alt="" loading="lazy" /></div>
          <div class="bp-step-title">Identity Verified</div>
          <div class="bp-step-body">
            One-off payment — proves your identity, funds and buying position
            to sellers and agents. No subscription.
          </div>
        </div>

        <!-- Tier card -->
        <div class="bp-tier-list">
          <button
            v-for="t in tierOptions"
            :key="t.id"
            type="button"
            class="bp-tier-card"
            :class="[
              t.id.toLowerCase(),
              {
                selected: selectedTier === t.id,
                paid: tierPaidFor === t.id,
              },
            ]"
            @click="selectedTier = t.id"
          >
            <span class="bp-tier-corner">{{ t.corner }}</span>
            <div class="bp-tier-badge" :class="`bp-tier-badge--${t.id.toLowerCase()}`">
              {{ t.badge }}
            </div>
            <div class="bp-tier-title">{{ t.title }}</div>
            <div class="bp-tier-sub">{{ t.sub }}</div>
            <div class="bp-tier-price-row">
              <span class="bp-tier-price">{{ t.priceLabel }}</span>
              <span v-if="tierPaidFor === t.id" class="bp-tier-paid-pill">✓ Paid</span>
            </div>
            <ul class="bp-tier-features">
              <li v-for="f in t.features" :key="f.text">
                <span :class="f.included ? 'bp-tier-tick' : 'bp-tier-dash'">
                  {{ f.included ? '✓' : '○' }}
                </span>
                {{ f.text }}
              </li>
            </ul>
          </button>
        </div>

        <button
          class="bp-next"
          :class="{ disabled: saving }"
          :disabled="saving"
          @click="onTierStepContinue"
        >
          {{ tierCtaLabel }}
        </button>
      </div>

      <!-- ── STEP 6: Solicitor status (bonus step, beyond the core 4) ── -->
      <div v-if="step === 6" class="bp-step">
        <div class="bp-step-hero bp-step-hero--narrow">
          <div class="bp-step-title">Your solicitor</div>
          <div class="bp-step-body">Helps sellers understand your situation</div>
        </div>

        <!-- Solicitor -->
        <div class="bp-sec-label">SOLICITOR</div>
        <div
          v-if="solicitorStatus === 'yes'"
          class="bp-sol-card"
          @click="solicitorStatus = null"
        >
          <div class="bp-sol-ic">🏛️</div>
          <div class="bp-sol-body">
            <div class="bp-sol-name">Solicitor instructed</div>
            <div class="bp-sol-sub">Ready to proceed — tap to change</div>
          </div>
          <span class="bp-sol-pill">✓ INSTRUCTED</span>
        </div>
        <div v-else class="bp-sol-options">
          <button
            v-for="opt in solicitorOptions"
            :key="opt.value"
            class="bp-chip"
            :class="{ active: solicitorStatus === opt.value }"
            @click="solicitorStatus = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Tip -->
        <div class="bp-tip">
          💡 Having a solicitor instructed tells sellers you're serious and
          legally ready to proceed.
        </div>

        <button
          class="bp-next"
          :class="{ disabled: !canContinue }"
          :disabled="!canContinue"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Next step →' }}
        </button>
      </div>

      <!-- ── STEP 7: Your story ── -->
      <div v-if="step === 7" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-step-ic--amber"><img src="/op-icons/misc/signature.png" alt="" loading="lazy" /></div>
          <div class="bp-step-title">
            Tell your story
            <span class="bp-optional">(optional)</span>
          </div>
          <div class="bp-step-body">
            A short personal note makes a real difference — sellers often
            choose buyers they connect with.
          </div>
        </div>

        <!-- Prompt chips -->
        <div class="bp-prompt-row">
          <button
            v-for="p in prompts"
            :key="p"
            type="button"
            class="bp-prompt-chip"
            @click="appendPrompt(p)"
          >
            + {{ p }}
          </button>
        </div>

        <!-- Textarea -->
        <textarea
          v-model="statement"
          class="bp-story-ta"
          rows="6"
          placeholder="Write something that shows sellers who you are and why you'd be the perfect owner of their home…"
        />

        <!-- AI draft card -->
        <button
          type="button"
          class="bp-ai-card"
          :disabled="aiDrafting"
          @click="onAiDraft"
        >
          <span class="bp-ai-pill">✨ AI</span>
          <span class="bp-ai-text">
            {{
              aiDrafting
                ? 'Drafting…'
                : statement.trim()
                  ? 'Rewrite my story to be warmer and clearer'
                  : 'Let AI write a compelling story based on your profile'
            }}
          </span>
          <span class="bp-ai-try">Try it ›</span>
        </button>
        <div v-if="aiError" class="bp-ai-err">{{ aiError }}</div>

        <button class="bp-generate" :disabled="publishing" @click="submit">
          {{ publishing ? 'Generating…' : '✓ Generate my Passport' }}
        </button>
        <button class="bp-skip-ghost" @click="submit">Skip this step →</button>
      </div>

      <!-- ── DONE: Celebration screen (prototype `complete`) ── -->
      <div v-if="step === 8" class="bp-step bp-complete">
        <!-- Celebration hero -->
        <div class="bp-complete-hero">
          <div class="bp-complete-emoji"><img src="/op-icons/misc/confetti.png" alt="" loading="lazy" /></div>
          <h2 class="bp-complete-title">You're a Trusted Buyer!</h2>
          <p class="bp-complete-sub">Your passport is live.</p>
        </div>

        <!-- XP row -->
        <div class="bp-xp-row">
          <div class="bp-xp-icon">⭐</div>
          <div class="bp-xp-body">
            <div class="bp-xp-title">Passport badge earned</div>
            <div class="bp-xp-sub">
              {{ Math.round(completeStrength) }}% strength ·
              {{ completeTierLabel }} tier
            </div>
          </div>
          <div class="bp-xp-points">+100 XP</div>
        </div>

        <!-- Teal hero card -->
        <div class="bp-complete-card-wrap">
          <div class="bp-complete-card">
            <div class="bp-complete-card-top">
              <span class="bp-complete-card-eyebrow">UMU BUYER PASSPORT</span>
              <span class="bp-complete-card-strength">
                {{ Math.round(completeStrength) }}% STRENGTH
              </span>
            </div>
            <div class="bp-complete-tagline">"Trusted, ready,<br />chain-free."</div>
            <div v-if="completeDisplayName" class="bp-complete-name">
              {{ completeDisplayName }}
            </div>
            <div class="bp-complete-pills">
              <span class="bp-complete-pill">🪪 ID Verified</span>
              <span v-if="completeFundsLabel" class="bp-complete-pill">
                {{ completeFundsLabel }}
              </span>
              <span class="bp-complete-pill">Chain free</span>
              <span v-if="solicitorStatus === 'yes'" class="bp-complete-pill">
                Solicitor instructed
              </span>
            </div>
            <div class="bp-complete-foot">
              <span class="bp-complete-foot-text">Tap to share with sellers</span>
              <button class="bp-complete-share" aria-label="Share" @click="goToView">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="bp-complete-actions">
          <button class="bp-next" @click="goToView">⤴ Share with agent now</button>
          <button class="bp-cta-outline" @click="goToView">📄 Download as PDF</button>
          <button class="bp-skip-ghost" @click="goToView">View my full Passport →</button>
        </div>
      </div>
    </div>

    <!-- Tier upgrade drawer (Stripe checkout) -->
    <TierUpgradeDrawer
      :open="tierDrawerOpen"
      :current-tier="tierPaidFor"
      @close="tierDrawerOpen = false"
      @tier-changed="onTierPaid"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBuyerProfile } from '~/composables/useBuyerProfile'
import { useProfile } from '~/composables/useProfile'
import { useKyc } from '~/composables/useKyc'
import { useAppToast } from '~/composables/useCustomToast'
import TierUpgradeDrawer from '~/components/buyer-profile/TierUpgradeDrawer.vue'

// No free tier — VERIFIED ("Identity Verified", £19.99) is the only
// purchasable tier. UNVERIFIED is the pre-payment default, not a real tier.
// PREMIUM is legacy/unreachable, kept only so old profile rows still typecheck.
type Tier = 'UNVERIFIED' | 'VERIFIED' | 'PREMIUM'

const router = useRouter()
const { getBuyerProfile, updateBuyerProfile, publishBuyerProfile } =
  useBuyerProfile()
const { showToast } = useAppToast()

// step=8 is the post-publish celebration screen (matches prototype `complete`).
// Steps 1-4 are the core Buyer Passport flow (Identity / Buying position /
// Finance / Chain position — matches the prototype's numbered stepper).
// Steps 5-7 (tier, solicitor, story) are additional, not part of that core
// numbered flow — see the header/stepper markup above.
const step = ref<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8>(1)
const saving = ref(false)
const publishing = ref(false)

const coreSteps = [
  {
    key: 'identity',
    label: 'Identity',
    headerTitle: 'Your identity',
    info: "We verify your ID to build trust with sellers — takes about 2 minutes, done once only.",
  },
  {
    key: 'buying',
    label: 'Buying position',
    headerTitle: 'Your buying position',
    info: 'This helps sellers understand your timeline and what you\'re looking for.',
  },
  {
    key: 'finance',
    label: 'Finance',
    headerTitle: 'Add proof of funds',
    info: 'Proof of funds confirms your maximum budget to sellers and agents.',
  },
  {
    key: 'chain',
    label: 'Chain position',
    headerTitle: 'Your chain position',
    info: 'Chain-free buyers are preferred by most sellers — this tells them where you stand.',
  },
] as const

function showStepInfoToast() {
  const s = coreSteps[step.value - 1]
  if (s) showToast({ message: s.info, iconEmoji: 'ℹ️' })
}

// Form state
const idDocumentType = ref<string | null>(null)
const fundsType = ref<string | null>(null)
const fundsAmount = ref<number | null>(null)
const chainPosition = ref<string | null>(null)
const solicitorStatus = ref<string | null>(null)
const timeline = ref<string | null>(null)
const propertyType = ref<string | null>(null)
const statement = ref('')

// ── Identity Verified payment (step 5) ────────────────────────────
// `selectedTier` is always 'VERIFIED' now — there's nothing left to pick.
// `tierPaidFor` is the tier that's been confirmed and paid for (server
// truth); starts 'UNVERIFIED' until the Stripe payment on this step
// completes. Funds verification (step 3) is a separate, free, required
// core step for every buyer — it used to be gated behind this payment,
// but that coupling was removed; paying here is now a standalone,
// mandatory step, not a gate on Finance.
const selectedTier = ref<Tier>('VERIFIED')
const tierPaidFor = ref<Tier>('UNVERIFIED')
const tierDrawerOpen = ref(false)

// Hydrated alongside the rest of the profile below — used so backing out
// of step 1 can go straight to /buyer-profile/view for a published
// profile instead of via /buyer-profile, which redirects there itself
// and turns a back-tap into a bounce loop between build and view.
const isPublished = ref(false)

const tierCanContinue = computed(() => tierPaidFor.value === 'VERIFIED')

const tierCtaLabel = computed(() => {
  if (tierPaidFor.value !== 'VERIFIED') return `Pay £19.99 & continue →`
  return saving.value ? 'Saving…' : 'Continue →'
})

async function onTierStepContinue() {
  if (tierPaidFor.value !== 'VERIFIED') {
    // Open Stripe checkout via the upgrade drawer (it handles payment intent +
    // confirmation; we get a callback through `onTierPaid`).
    tierDrawerOpen.value = true
    return
  }
  try {
    saving.value = true
    await updateBuyerProfile({ tier: tierPaidFor.value as any, completedSteps: 5 })
    step.value = 6
  } catch (e: any) {
    showToast({ message: e?.data?.message ?? 'Could not save', iconEmoji: '⚠️' })
  } finally {
    saving.value = false
  }
}

function onTierPaid(t: Tier) {
  tierPaidFor.value = t
  tierDrawerOpen.value = false
  showToast({ message: 'Verified unlocked', iconEmoji: '✨' })
}

// ── Complete screen helpers ────────────────────────────────────
const completeStrength = ref(0)
const completeTierLabel = computed(() => {
  if (tierPaidFor.value === 'PREMIUM') return 'Platinum'
  if (tierPaidFor.value === 'VERIFIED') return 'Verified'
  return 'Trusted'
})
const { profile: userProfile, fetchProfile } = useProfile()
const completeDisplayName = computed(() => {
  const first = userProfile.value?.firstName?.trim()
  const last = userProfile.value?.lastName?.trim()
  if (first || last) return [first, last].filter(Boolean).join(' ')
  return ''
})
const completeFundsLabel = computed(() => {
  const amt = fundsAmount.value
  if (!amt) return ''
  if (amt >= 1_000_000) return `£${(amt / 1_000_000).toFixed(1)}M Funds`
  if (amt >= 1000) return `£${Math.round(amt / 1000)}K Funds`
  return `£${amt} Funds`
})
function goToView() {
  router.replace('/buyer-profile/view')
}

// ── KYC (step 1) state ───────────────────────────────────────────
const kycActive = ref<'id' | 'selfie' | 'aml'>('id')
const kycIdFront = ref(false)
const kycIdBack = ref(false)
const kycSelfieDone = ref(false)
const kycAmlDone = ref(false)
const kycSheetOpen = ref(false)
const kycSheetSide = ref<'front' | 'back'>('front')
const livenessRunning = ref(false)
const livenessTitle = ref('Look at the camera')
const livenessStep = ref('Step 1 of 3')
const amlStep = ref(-1) // -1 = not started, 0/1/2 = currently checking that row, 3 = done
const amlRows = [
  { label: 'Sanctions list' },
  { label: 'PEP register' },
  { label: 'Adverse media' },
]
const kycCountdown = ref(10)
let kycCountdownTimer: ReturnType<typeof setInterval> | null = null

const kycIdDone = computed(() => kycIdFront.value && kycIdBack.value)
const kycAllDone = computed(
  () => kycIdDone.value && kycSelfieDone.value && kycAmlDone.value,
)
const kycIdStatus = computed(() => {
  if (kycIdDone.value) return '✓ Verified'
  if (kycIdFront.value || kycIdBack.value) return '1/2'
  return 'Required'
})
const kycIdStatusClass = computed(() => {
  if (kycIdDone.value) return 'bp-status-done'
  if (kycIdFront.value || kycIdBack.value) return 'bp-status-progress'
  return 'bp-status-required'
})
const kycSelfieStatus = computed(() =>
  kycSelfieDone.value ? '✓ Passed' : 'Required',
)
const kycSelfieStatusClass = computed(() =>
  kycSelfieDone.value ? 'bp-status-done' : 'bp-status-required',
)
const kycAmlStatus = computed(() => {
  if (kycAmlDone.value) return '✓ Clear'
  if (amlStep.value >= 0) return 'Running…'
  return 'Auto'
})
const kycAmlStatusClass = computed(() => {
  if (kycAmlDone.value) return 'bp-status-done'
  if (amlStep.value >= 0) return 'bp-status-running'
  return 'bp-status-required'
})

function setKycActive(t: 'id' | 'selfie' | 'aml') {
  if (t === 'id' && kycIdDone.value) return
  if (t === 'selfie' && kycSelfieDone.value) return
  if (t === 'aml' && kycAmlDone.value) return
  kycActive.value = t
  if (t === 'aml' && amlStep.value < 0) startAML()
}

function openKycSheet(target: 'id-front' | 'id-back') {
  // Persona's hosted page runs its own capture UX (camera / upload / file)
  // so the in-app method picker is redundant. Tapping either side just
  // opens the single Persona session — Persona handles "which side" itself.
  kycSheetSide.value = target === 'id-front' ? 'front' : 'back'
  startBuyerKyc()
}
function closeKycSheet() { kycSheetOpen.value = false }

// ── Real Persona KYC integration ───────────────────────────────
// Persona's hosted page runs all three checks (ID front + back, selfie /
// liveness, AML / sanctions) inside their UI. We open it in a new tab,
// poll /kyc/status until it settles, then mark all three visual rows
// done in one shot. No client-side simulation of capture or AML.
const kycPolling = ref(false)
const kycCheckingNow = ref(false)
const kycError = ref('')
const kycInquiryId = ref<string | null>(null)
let kycAbort: AbortController | null = null

function markKycComplete() {
  kycIdFront.value = true
  kycIdBack.value = true
  kycSelfieDone.value = true
  kycAmlDone.value = true
  amlStep.value = 3
  // Persona doesn't tell us *which* document the user uploaded — default to
  // passport so the backend's `idDocumentType` column has a value.
  if (!idDocumentType.value) idDocumentType.value = 'passport'
}

function resetKycVisualState() {
  kycIdFront.value = false
  kycIdBack.value = false
  kycSelfieDone.value = false
  kycAmlDone.value = false
  amlStep.value = -1
  kycActive.value = 'id'
  livenessRunning.value = false
}

async function startBuyerKyc() {
  if (kycPolling.value) return
  kycError.value = ''
  kycPolling.value = true
  // Close any leftover sheet/overlay so the new state is visible.
  kycSheetOpen.value = false
  try {
    const { startKyc } = useKyc()
    const start = await startKyc()
    if (start.alreadyVerified || start.status === 'approved') {
      markKycComplete()
      return
    }
    if (!start.hostedUrl) {
      kycError.value = 'Could not open the verification page — please retry.'
      return
    }
    kycInquiryId.value = start.inquiryId
    // Same-tab redirect — see comment in pages/claim/[id].vue for why.
    // TL;DR: window.open('_blank') is blocked by iOS Safari + native
    // WebView after any await, no matter whether the user has the popup
    // blocker off. Same-tab navigation is never blocked.
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'umu_buyer_persona_return',
          JSON.stringify({ inquiryId: start.inquiryId, startedAt: Date.now() }),
        )
      } catch { /* full localStorage — polling still works on return */ }
    }
    const returnUrl = `${window.location.origin}/buyer-profile/build?kycreturn=1`
    const separator = start.hostedUrl.includes('?') ? '&' : '?'
    window.location.href = `${start.hostedUrl}${separator}redirect-uri=${encodeURIComponent(returnUrl)}`
    return
  } catch (e: any) {
    kycError.value =
      e?.data?.message || e?.message || 'Verification could not start.'
  } finally {
    kycPolling.value = false
  }
}

async function runKycPolling() {
  const { pollUntilSettled } = useKyc()
  kycAbort?.abort()
  kycAbort = new AbortController()
  try {
    const finalStatus = await pollUntilSettled({
      intervalMs: 3000,
      maxAttempts: 100, // ~5 minutes at 3s each
      signal: kycAbort.signal,
    })
    if (finalStatus === 'approved') {
      markKycComplete()
      kycError.value = ''
    } else if (finalStatus === 'declined' || finalStatus === 'failed') {
      resetKycVisualState()
      kycError.value =
        'Identity check failed. Please retry or contact support.'
    } else if (finalStatus === 'needs_review') {
      kycError.value =
        "Your details need a manual review — we'll email you when it's done."
    }
  } catch (e: any) {
    if (e?.message === 'timeout') {
      kycError.value =
        "We're still waiting for the result. If you've finished, tap \"I've finished — check now\"."
    } else if (e?.message !== 'Polling aborted') {
      kycError.value =
        e?.data?.message || e?.message || 'Could not check status.'
    }
  }
}

async function recheckKycNow() {
  if (kycCheckingNow.value) return
  kycCheckingNow.value = true
  kycError.value = ''
  try {
    const { getKycStatus } = useKyc()
    const r = await getKycStatus()
    if (r.status === 'approved') {
      kycAbort?.abort()
      markKycComplete()
    } else if (r.status === 'declined' || r.status === 'failed') {
      resetKycVisualState()
      kycError.value = 'Identity check failed. Please retry.'
    } else if (r.status === 'needs_review') {
      kycError.value =
        "Your details need a manual review — we'll email you when it's done."
    } else {
      kycError.value =
        'Still waiting — finish the check in the other tab, then tap again.'
    }
  } catch (e: any) {
    kycError.value =
      e?.data?.message || e?.message || 'Could not check status.'
  } finally {
    kycCheckingNow.value = false
  }
}

// Compatibility wrappers — the template still references the original
// handler names. Each now triggers the single Persona session; Persona's
// hosted page covers ID + selfie + AML in one flow.
function simulateIdCapture() {
  kycSheetOpen.value = false
  startBuyerKyc()
}
function runLiveness() {
  if (kycSelfieDone.value) return
  startBuyerKyc()
}
function startAML() {
  if (kycAmlDone.value) return
  startBuyerKyc()
}

watch(kycAllDone, (done) => {
  if (!done) return
  // Auto-advance after 10s; user can also click "Continue"
  kycCountdown.value = 10
  if (kycCountdownTimer) clearInterval(kycCountdownTimer)
  kycCountdownTimer = setInterval(() => {
    kycCountdown.value--
    if (kycCountdown.value <= 0) {
      if (kycCountdownTimer) clearInterval(kycCountdownTimer)
      goNext()
    }
  }, 1000)
})

// ── Funds (step 2) state ─────────────────────────────────────────
const fundsUploads = ref<Record<string, { name: string; size: string }>>({})
const fundsUploadingType = ref<string | null>(null)
const fundsUploadPct = ref(0)
const fundsSheetOpen = ref(false)
const fundsLabels: Record<string, { title: string; file: string }> = {
  mortgage: { title: 'Mortgage in principle', file: 'DIP_Document.pdf' },
  cash: { title: 'Cash buyer', file: 'Bank_Statement.pdf' },
  help: { title: 'Help to Buy', file: 'HTB_Confirmation.pdf' },
}
const fundsUpload = computed(() =>
  fundsType.value ? fundsUploads.value[fundsType.value] ?? null : null,
)
const fundsUploading = computed(
  () => !!fundsType.value && fundsUploadingType.value === fundsType.value,
)
const currentFundsLabel = computed(() => {
  const t = fundsType.value
  return t && fundsLabels[t] ? fundsLabels[t].title : ''
})

function selectFunds(value: string) {
  fundsType.value = value
}
function openFundsSheet() {
  if (!fundsType.value) return
  fundsSheetOpen.value = true
}
function closeFundsSheet() {
  fundsSheetOpen.value = false
}
function simulateFundsUpload(_method: string) {
  const id = fundsType.value
  if (!id) return
  closeFundsSheet()
  fundsUploadingType.value = id
  fundsUploadPct.value = 0
  setTimeout(() => { fundsUploadPct.value = 35 }, 100)
  setTimeout(() => { fundsUploadPct.value = 70 }, 600)
  setTimeout(() => { fundsUploadPct.value = 100 }, 1100)
  setTimeout(() => {
    fundsUploads.value[id] = {
      name: fundsLabels[id]?.file ?? 'document.pdf',
      size: '1.2 MB · file',
    }
    fundsUploadingType.value = null
  }, 1500)
}
function removeFundsUpload() {
  if (!fundsType.value) return
  delete fundsUploads.value[fundsType.value]
}

// Option lists
const idTypeOptions = [
  { value: 'passport',       icon: '/op-icons/verify-identity/passport.png',       title: 'UK / EU Passport',    sub: 'Fastest match',           recommended: true },
  { value: 'drivingLicence', icon: '/op-icons/verify-identity/drivingLicence.png', title: 'UK Driving Licence',  sub: 'Photocard, front + back' },
  { value: 'nationalId',     icon: '/op-icons/verify-identity/idBadge.png',        title: 'Biometric Residence Permit',    sub: 'If you\'re not a UK/EU passport holder' },
]
const fundsOptions = [
  { value: 'mortgage', emoji: '/op-icons/misc/creditCard.png', title: 'Mortgage in principle', sub: 'Upload your DIP document' },
  { value: 'cash', emoji: '/op-icons/investment/moneyBagPound.png', title: 'Cash buyer', sub: 'Bank statement showing available funds' },
  { value: 'help', emoji: '/op-icons/investment/landmarks.png', title: 'Help to Buy / Shared ownership', sub: 'Government scheme with mortgage' },
]
const chainOptions = [
  {
    value: 'sold',
    title: 'Chain free',
    badge: '✅ BEST',
    sub: 'No property to sell. Move on completion day.',
  },
  {
    value: 'selling',
    title: 'Property to sell',
    badge: null as string | null,
    sub: 'You have an existing property in the chain.',
  },
  {
    value: 'ftb',
    title: 'First-time buyer',
    badge: null as string | null,
    sub: 'No chain, no complications. Fastest route.',
  },
]
const solicitorOptions = [
  { value: 'yes', label: 'Instructed' },
  { value: 'looking', label: 'Looking' },
  { value: 'notsure', label: 'Not yet' },
]
const timelineOptions = [
  { value: 'asap', label: 'Ready now' },
  { value: '3m', label: '1–3 months' },
  { value: '6m', label: '3–6 months' },
  { value: 'flex', label: 'Flexible' },
]
// Order + labels match prototype: House / Flat / Any / New build
const propertyTypeOptions = [
  { value: 'house', label: 'House' },
  { value: 'flat', label: 'Flat' },
  { value: 'any', label: 'Any' },
  { value: 'newBuild', label: 'New build' },
]
// No free tier — a single mandatory, purchasable tier. Kept as a
// one-element array (rather than a plain object) so the existing v-for in
// the template doesn't need restructuring.
const tierOptions: Array<{
  id: Tier; corner: string; badge: string; title: string; sub: string;
  priceLabel: string;
  features: Array<{ text: string; included: boolean }>;
}> = [
  {
    id: 'VERIFIED',
    corner: '✓',
    badge: 'IDENTITY VERIFIED',
    title: 'Identity Verified',
    sub: 'The level most sellers and agents expect. Proves who you are and that you can buy.',
    priceLabel: '£19.99',
    features: [
      { text: 'DVS-certified identity check', included: true },
      { text: 'Chain position & timeline', included: true },
      { text: 'Solicitor instructed status', included: true },
      { text: 'Proof of deposit (open banking)', included: true },
      { text: 'Source of funds + AML clear', included: true },
      { text: 'Affordability score', included: true },
    ],
  },
]
// Exact prototype copy:
//   + Why I love this type of home
//   + My timeline & flexibility
//   + What matters most to me
const prompts = [
  'Why I love this type of home',
  'My timeline & flexibility',
  'What matters most to me',
]

const canContinue = computed(() => {
  switch (step.value) {
    case 1:
      return kycAllDone.value && !!idDocumentType.value
    case 2:
      // Buying position — property type optional but encouraged, timeline required.
      return !!timeline.value
    case 3:
      // Finance — free, required core step for every buyer (see tier picker
      // comment above for why this is no longer gated behind a paid tier).
      return !!fundsType.value && !!fundsAmount.value && fundsAmount.value > 0
    case 4:
      return !!chainPosition.value
    case 5:
      // Step 5 (tier) has its own gate (`tierCanContinue`) wired directly to
      // the tier picker / Stripe CTA — surfaced here too so nothing else
      // relying on `canContinue` breaks.
      return tierCanContinue.value
    case 6:
      return !!solicitorStatus.value
    case 7:
      return true
    default:
      return false
  }
})

function appendPrompt(text: string) {
  const sep = statement.value.trim() ? '\n\n' : ''
  statement.value = `${statement.value}${sep}${text}: `
}

function goBack() {
  // Don't allow stepping out of the celebration screen — the profile is
  // already published. Send the user to /view instead.
  if (step.value === 8) {
    router.replace('/buyer-profile/view')
    return
  }
  if (step.value > 1) {
    step.value = (step.value - 1) as any
    return
  }
  if (isPublished.value) {
    // /buyer-profile would just redirect straight back here anyway —
    // skip it. replace (not push) so this doesn't leave a fresh /build
    // history entry for /view's own back button to bounce off of.
    router.replace('/buyer-profile/view')
    return
  }
  router.push('/buyer-profile')
}

async function saveCurrentStep(): Promise<boolean> {
  saving.value = true
  try {
    const patch: any = { completedSteps: Math.max(step.value, 1) }
    if (step.value === 1) patch.idDocumentType = idDocumentType.value
    if (step.value === 2) {
      patch.timeline = timeline.value
      patch.propertyType = propertyType.value
    }
    if (step.value === 3) {
      patch.fundsType = fundsType.value
      patch.fundsAmount = fundsAmount.value
    }
    if (step.value === 4) patch.chainPosition = chainPosition.value
    if (step.value === 6) patch.solicitorStatus = solicitorStatus.value
    if (step.value === 7) patch.statement = statement.value
    await updateBuyerProfile(patch)
    return true
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Could not save — check your connection'
    showToast({ message: msg, iconEmoji: '⚠️' })
    return false
  } finally {
    saving.value = false
  }
}

async function goNext() {
  if (!canContinue.value) return
  const ok = await saveCurrentStep()
  if (!ok) return // stay on this step so the user can retry
  if (step.value < 7) {
    step.value = (step.value + 1) as any
  }
}

// ── AI draft of the "Your story" field ─────────────────────────────────────
// Calls the existing /chat endpoint (Groq Llama 3.3 70B) with a buyer-profile
// system prompt. Replaces (or seeds) the textarea value. Empty user input
// just generates a draft from the profile signals; non-empty input is rewritten.
const aiDrafting = ref(false)
const aiError = ref('')
async function onAiDraft() {
  aiError.value = ''
  aiDrafting.value = true
  try {
    const config = useRuntimeConfig()
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    // Dedicated endpoint, not the general /chat assistant — that endpoint
    // requires a single `message` string (this used to send an OpenAI-style
    // `messages` array, which failed its validation with a 400 before ever
    // reaching the model) and runs a property-assistant persona with
    // tool-calling that isn't suited to a short first-person writing task.
    // Profile signals are read server-side from the saved profile rather
    // than sent from here.
    const res = await fetch(`${config.public.apiBase}/buyer-profile/ai-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ existingDraft: statement.value }),
    })
    if (!res.ok) throw new Error(`AI request failed (${res.status})`)
    const data = await res.json()
    const text = typeof data?.text === 'string' ? data.text : ''
    if (text.trim()) {
      statement.value = text.trim()
    } else {
      aiError.value = 'Got an empty response — try again.'
    }
  } catch (e: any) {
    aiError.value = e?.message || 'AI draft failed — try again.'
  } finally {
    aiDrafting.value = false
  }
}

async function submit() {
  publishing.value = true
  try {
    // Single self-healing call — the publish endpoint upserts everything we
    // send, then publishes. So even if earlier per-step PATCHes failed
    // silently, this one request makes the wizard correct.
    const published = await publishBuyerProfile({
      tier: tierPaidFor.value as any,
      idDocumentType: idDocumentType.value,
      fundsType: fundsType.value,
      fundsAmount: fundsAmount.value,
      chainPosition: chainPosition.value,
      solicitorStatus: solicitorStatus.value,
      timeline: timeline.value,
      propertyType: propertyType.value,
      statement: statement.value,
      completedSteps: 7,
    })
    // Land on the celebration screen first; "View my full Passport" routes to /view.
    if (published?.strengthScore != null) {
      completeStrength.value = published.strengthScore
    }
    step.value = 8
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Could not publish profile'
    showToast({ message: msg, iconEmoji: '⚠️' })
  } finally {
    publishing.value = false
  }
}

onMounted(async () => {
  // Persona return path — same flow as pages/claim/[id].vue. If the
  // user came back from the hosted flow, restore the stored inquiry
  // id and poll immediately.
  const url = new URL(window.location.href)
  if (url.searchParams.get('kycreturn') === '1') {
    try {
      const raw = localStorage.getItem('umu_buyer_persona_return')
      if (raw) {
        const saved = JSON.parse(raw)
        const fresh = Date.now() - Number(saved?.startedAt ?? 0) < 30 * 60_000
        if (fresh && saved?.inquiryId) {
          kycInquiryId.value = saved.inquiryId
          url.searchParams.delete('kycreturn')
          window.history.replaceState({}, '', url.toString())
          runKycPolling()
        }
      }
    } catch { /* fall through */ }
  }
  // Hydrate the logged-in user for the "complete" screen name line.
  fetchProfile?.().catch(() => {})
  try {
    const data = await getBuyerProfile()
    if (data) {
      idDocumentType.value = data.idDocumentType ?? null
      // Optimistic: if a previous session got far enough to persist
      // idDocumentType, show KYC as done while we confirm with Persona
      // below. Stops the UI flickering back to "ID required" for
      // returning users on slow networks.
      if (data.idDocumentType) markKycComplete()
      fundsType.value = data.fundsType ?? null
      fundsAmount.value = data.fundsAmount ?? null
      chainPosition.value = data.chainPosition ?? null
      solicitorStatus.value = data.solicitorStatus ?? null
      timeline.value = data.timeline ?? null
      propertyType.value = (data as any).propertyType ?? null
      statement.value = data.statement ?? ''

      // Tier hydration — keep paid state in sync with server truth.
      // selectedTier stays 'VERIFIED' (the only tier) regardless.
      tierPaidFor.value = ((data as any).tier as Tier) || 'UNVERIFIED'
      isPublished.value = !!(data as any).published
    }
  } catch {}

  // Authoritative Persona check — trumps the optimistic flag-flip above.
  // If Persona reports approved, we stay marked complete. If declined /
  // failed, reset the visual state and surface a retry message. For
  // pending / not_started, leave the optimistic state as it was so the
  // user can pick up where they left off.
  try {
    const { getKycStatus } = useKyc()
    const r = await getKycStatus()
    if (r.status === 'approved') {
      markKycComplete()
    } else if (r.status === 'declined' || r.status === 'failed') {
      resetKycVisualState()
      kycError.value =
        'Your previous identity check did not pass. Please retry.'
    } else if (r.status === 'needs_review') {
      kycError.value =
        "Your previous identity check is under manual review — we'll email you when it's done."
    }
  } catch {
    /* status endpoint failed — fall back to optimistic flags */
  }
})

onBeforeUnmount(() => {
  kycAbort?.abort()
})
</script>

<style scoped>
.bp-page {
  min-height: 100dvh;
  background: #fff;
  color: #1f2024;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
}

/* ── Header ────────────────────────────────────────────── */
.bp-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 12px;
  padding-top: calc(16px + env(safe-area-inset-top));
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.bp-back {
  border: none;
  background: none;
  padding: 4px;
  cursor: pointer;
}
.bp-header-body {
  flex: 1;
}
.bp-header-title {
  font-size: 15px;
  font-weight: 800;
  color: #231d45;
}
.bp-header-sub {
  font-size: 11px;
  color: #94a3b8;
}

/* ── Progress ──────────────────────────────────────────── */
.bp-progress {
  position: sticky;
  top: 57px;
  z-index: 19;
  display: flex;
  gap: 3px;
  padding: 12px 20px 12px;
  background: #fff;
}
.bp-progress-seg {
  flex: 1;
  height: 3px;
  background: #e5e7eb;
  border-radius: 999px;
  transition: background 0.3s;
}
.bp-progress-seg-filled {
  background: #00a19a;
}

/* ── 4-step labeled stepper (Identity / Buying position / Finance /
     Chain position) ──────────────────────────────────────── */
.bp-stepper {
  position: sticky;
  top: 57px;
  z-index: 19;
  display: flex;
  gap: 4px;
  padding: 12px 16px 14px;
  background: #fff;
}
.bp-stepper-dot {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}
.bp-stepper-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  background: #eef0f4;
  color: #94a3b8;
  transition: background 0.25s, color 0.25s;
}
.bp-stepper-dot.active .bp-stepper-num {
  background: #00a19a;
  color: #fff;
}
.bp-stepper-dot.done .bp-stepper-num {
  background: #d8f3ef;
  color: #00a19a;
}
.bp-stepper-label {
  font-size: 9.5px;
  font-weight: 700;
  color: #94a3b8;
  line-height: 1.25;
}
.bp-stepper-dot.active .bp-stepper-label {
  color: #231d45;
}
.bp-stepper-dot.done .bp-stepper-label {
  color: #00a19a;
}

/* ── Scroll ────────────────────────────────────────────── */
.bp-scroll {
  flex: 1;
  padding: 0 20px 40px;
  overflow-y: auto;
}

/* ── Step hero ─────────────────────────────────────────── */
.bp-step-hero {
  text-align: center;
  margin-bottom: 24px;
}
.bp-step-ic {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  font-size: 30px;
  border: 2px solid transparent;
  overflow: hidden;
}
.bp-step-ic img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.bp-ic-teal {
  background: #f0fdfa;
  border-color: #99f6e4;
}
/* Illustrated variant of the big step icon (hero circle). Drops the
   emoji font-size sizing and drops in a 44px 3D illustration inside
   the same rounded slot. */
.bp-ic-illus { padding: 8px; }
.bp-ic-illus img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.bp-ic-green {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.bp-ic-amber {
  background: #fef9f0;
  border-color: #fef3c7;
}
.bp-ic-purple {
  background: #f5f3ff;
  border-color: #ddd6fe;
}
.bp-step-title {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}
.bp-optional {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
}
.bp-step-body {
  font-size: 12.5px;
  color: #334155;
  line-height: 1.6;
}

/* ── Option cards (radio list) ─────────────────────────── */
.bp-option-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.bp-option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 16px;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: inherit;
  width: 100%;
}
.bp-option-card.selected {
  border-color: #00a19a;
  background: #f0fdfa;
}
.bp-option-emoji {
  font-size: 26px;
  flex-shrink: 0;
}
/* Illustrated variant used inside .bp-option-card in place of the emoji
   (id-type picker on the identity step). */
.bp-option-illus {
  width: 44px;
  height: 44px;
  object-fit: contain;
  flex-shrink: 0;
}
.bp-option-boxic {
  width: 40px;
  height: 40px;
  background: #f0fdf4;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.bp-option-body {
  flex: 1;
  min-width: 0;
}
.bp-option-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1f2024;
}
.bp-option-sub {
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 2px;
}
.bp-option-check {
  width: 22px;
  height: 22px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  transition: all 0.15s;
  flex-shrink: 0;
  position: relative;
}
.bp-option-check.filled {
  border-color: #00a19a;
  background: #00a19a;
}
.bp-option-check.filled::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  transform: translate(-50%, -50%);
}

/* ── Field label ───────────────────────────────────────── */
.bp-field-label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ── Budget input ──────────────────────────────────────── */
.bp-budget-wrap {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 16px;
  gap: 8px;
  margin-bottom: 20px;
}
.bp-budget-sign {
  font-size: 18px;
  font-weight: 800;
  color: #334155;
}
.bp-budget-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 700;
  color: #1f2024;
  font-family: inherit;
  background: transparent;
}

/* ── Tile row (solicitor / timeline) ───────────────────── */
.bp-tile-row {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.bp-tile {
  flex: 1;
  min-width: 80px;
  padding: 14px 8px;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  color: #1f2024;
}
.bp-tile-small {
  padding: 12px 8px;
  font-size: 12px;
}
.bp-tile.selected {
  border-color: #00a19a;
  background: #f0fdfa;
}
.bp-tile-emoji {
  font-size: 20px;
  margin-bottom: 4px;
}
.bp-tile-label {
  font-size: 12.5px;
}

/* ── Prompts & textarea ────────────────────────────────── */
.bp-prompts {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.bp-prompt {
  background: #f0fdfa;
  border: 1px solid #99f6e4;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #00a19a;
  cursor: pointer;
}
.bp-textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  color: #1f2024;
  background: #fff;
  line-height: 1.65;
  box-sizing: border-box;
  margin-bottom: 16px;
}
.bp-textarea:focus {
  border-color: #00a19a;
}

/* ── Buttons ───────────────────────────────────────────── */
.bp-next {
  width: 100%;
  border: none;
  padding: 15px;
  border-radius: 14px;
  background: #00a19a;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.bp-next:active {
  background: #00a19a;
}
.bp-next.disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}
.bp-generate {
  width: 100%;
  border: none;
  padding: 15px;
  border-radius: 14px;
  background: #00a19a;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}
.bp-ai-draft {
  width: 100%;
  border: 1.5px dashed #b2e4e1;
  padding: 12px;
  border-radius: 14px;
  background: #f2faf8;
  color: #00857f;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.01em;
  margin: 8px 0 10px;
  transition: all 0.15s;
}
.bp-ai-draft:hover:not(:disabled) {
  background: #e6f7f6;
  border-color: #00a19a;
}
.bp-ai-draft:disabled { opacity: 0.6; cursor: progress; }
.bp-ai-err {
  font-size: 11.5px; font-weight: 600;
  color: #c73e36; margin: -4px 0 8px;
}
.bp-skip {
  width: 100%;
  border: none;
  padding: 12px;
  border-radius: 14px;
  background: transparent;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

/* ── KYC (step 1) ───────────────────────────────────────── */
.bp-trust {
  display: flex;
  align-items: center;
  gap: 9px;
  background: linear-gradient(135deg, #f4fbfa, #fff);
  border: 1px solid #e2f1ea;
  border-radius: 11px;
  padding: 9px 12px;
  margin-bottom: 18px;
  font-size: 11.5px;
  color: #4a5568;
  line-height: 1.4;
}
.bp-trust strong { color: #231d45; font-weight: 700; }
.bp-trust-illus {
  width: 46px;
  height: 46px;
  object-fit: contain;
  flex-shrink: 0;
}
.bp-trust-ic {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: #00a19a;
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.bp-trust-ic svg { width: 12px; height: 12px; }

.bp-task {
  background: #fff;
  border: 1.5px solid #eef0f6;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
}
.bp-task.active {
  border-color: #00a19a;
  background: #f1f9f4;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.12);
}
.bp-task.done {
  background: #fff;
  border-color: #e2f1ea;
}
.bp-task-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.bp-task-ic {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #00a19a;
  transition: all 0.18s;
}
.bp-task.done .bp-task-ic {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
}
.bp-task-ic svg { width: 20px; height: 20px; }
/* Illustrated variant for task icons — drops the tinted card
   background and lets the 3D illustration fill the slot. */
.bp-task-ic--illus {
  background: transparent;
  border: 0;
  padding: 0;
}
.bp-task-ic--illus img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.bp-task.done .bp-task-ic--illus { background: transparent; }
.bp-task-body { flex: 1; min-width: 0; }
.bp-task-title {
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
  letter-spacing: -0.01em;
}
.bp-task-meta {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
.bp-task-status {
  font-size: 10.5px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 999px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.bp-status-required { background: #f1f5f9; color: #4a5568; }
.bp-status-progress { background: #fef3c7; color: #92400e; }
.bp-status-done { background: #d1fae5; color: #008a84; }
.bp-status-running { background: #f1f9f4; color: #00a19a; border: 1px solid #e2f1ea; }
.bp-task-extras { margin-top: 12px; }

/* ID capture tiles */
.bp-id-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.bp-id-tile {
  background: rgba(255, 255, 255, 0.7);
  border: 2px dashed #e2f1ea;
  border-radius: 11px;
  padding: 14px 8px;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.bp-id-tile:hover { background: #fff; border-color: #00a19a; }
.bp-id-tile.captured {
  border-style: solid;
  border-color: #e2f1ea;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  padding: 10px 11px;
}
.bp-id-side {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #00a19a;
  margin-bottom: 6px;
}
.bp-id-iconbig {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #00a19a;
  color: #fff;
  display: grid;
  place-items: center;
  margin: 0 auto 6px;
}
.bp-id-iconbig svg { width: 14px; height: 14px; }
.bp-id-iconbig--small { margin: 0; width: 28px; height: 28px; }
/* Illustrated variant used inside FRONT/BACK capture tiles — the 3D
   camera illustration replaces the teal-filled SVG square. */
.bp-id-iconbig--illus {
  width: 56px;
  height: 56px;
  background: transparent;
  color: inherit;
  margin: 0 auto 8px;
}
.bp-id-iconbig--illus img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.bp-id-prompt {
  font-size: 11px;
  font-weight: 700;
  color: #231d45;
}
.bp-id-text { flex: 1; min-width: 0; }
.bp-id-name {
  font-size: 11.5px;
  font-weight: 700;
  color: #231d45;
}
.bp-id-status {
  font-size: 10px;
  color: #008a84;
  font-weight: 700;
  margin-top: 1px;
}
.bp-id-pills {
  margin-top: 10px;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
}
.bp-id-pill {
  font-size: 10px;
  font-weight: 700;
  background: #fff;
  color: #4a5568;
  border: 1px solid #eef0f6;
  padding: 3px 8px;
  border-radius: 999px;
}

/* Selfie box */
.bp-selfie-box {
  background: rgba(255, 255, 255, 0.7);
  border: 2px dashed #e2f1ea;
  border-radius: 12px;
  padding: 18px 14px;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.bp-selfie-box:hover { background: #fff; border-color: #00a19a; }
.bp-selfie-iconbig {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #f1f9f4;
  border: 2px solid #00a19a;
  display: grid;
  place-items: center;
  margin: 0 auto 10px;
  font-size: 26px;
}
.bp-selfie-iconbig img {
  width: 34px;
  height: 34px;
  object-fit: contain;
  display: block;
}
.bp-selfie-prompt {
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
}
.bp-selfie-meta {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 3px;
}

/* AML list */
.bp-aml-list {
  background: rgba(255, 255, 255, 0.7);
  border: 1.5px solid #e2f1ea;
  border-radius: 12px;
  padding: 12px 14px;
}
.bp-aml-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 6px 0;
  font-size: 12px;
  color: #4a5568;
  border-bottom: 1px solid #eef0f6;
}
.bp-aml-row:last-child { border-bottom: none; }
.bp-aml-row strong { font-weight: 600; }
.bp-aml-row.clear { color: #231d45; }
.bp-aml-row.clear strong { font-weight: 700; }
.bp-aml-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: #eef0f6;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  transition: all 0.4s;
}
.bp-aml-row.checking .bp-aml-dot {
  border: 2px solid #00a19a;
  background: rgba(0, 161, 154, 0.1);
  animation: bp-aml-pulse 1.2s ease-in-out infinite;
}
@keyframes bp-aml-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 161, 154, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(0, 161, 154, 0); }
}
.bp-aml-row.clear .bp-aml-dot { background: #008a84; color: #fff; }

/* Persona in-progress banner — shown while user is in the other tab */
.bp-kyc-pending {
  margin-top: 14px;
  background: #f2faf8;
  border: 1px solid #c8eae6;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.bp-kyc-pending-spinner {
  width: 22px;
  height: 22px;
  border: 2.5px solid rgba(0, 161, 154, 0.18);
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: bp-kyc-spin 0.8s linear infinite;
  flex-shrink: 0;
}
.bp-kyc-pending-body {
  flex: 1;
  min-width: 0;
}
.bp-kyc-pending-title {
  font-size: 13px;
  font-weight: 800;
  color: #00514d;
  letter-spacing: -0.02em;
}
.bp-kyc-pending-sub {
  font-size: 11.5px;
  color: #4a4566;
  margin-top: 2px;
  line-height: 1.4;
}
.bp-kyc-pending-btn {
  flex-shrink: 0;
  border: 1.5px solid #00a19a;
  background: #fff;
  color: #00514d;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 11.5px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.bp-kyc-pending-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}
.bp-kyc-mini-spinner {
  width: 10px;
  height: 10px;
  border: 2px solid rgba(0, 161, 154, 0.3);
  border-top-color: #00a19a;
  border-radius: 50%;
  animation: bp-kyc-spin 0.7s linear infinite;
}
@keyframes bp-kyc-spin {
  to { transform: rotate(360deg); }
}

/* KYC error / decline / needs-review */
.bp-kyc-err {
  margin-top: 12px;
  background: #fef2f1;
  border: 1px solid #fbcec9;
  border-radius: 14px;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.bp-kyc-err-ic {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #c73e36;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}
.bp-kyc-err-body {
  flex: 1;
  font-size: 12px;
  color: #882019;
  line-height: 1.4;
}
.bp-kyc-err-retry {
  flex-shrink: 0;
  border: 1.5px solid #c73e36;
  background: #fff;
  color: #c73e36;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11.5px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}

/* KYC success panel */
.bp-kyc-success {
  margin-top: 16px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border: 1px solid #e5f4f2;
  border-radius: 14px;
  padding: 14px 16px;
  text-align: center;
}
.bp-kyc-success-ic {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #008a84;
  color: #fff;
  display: grid;
  place-items: center;
  margin: 0 auto 8px;
  font-size: 18px;
  font-weight: 800;
}
.bp-kyc-success-title {
  font-size: 14px;
  font-weight: 800;
  color: #008a84;
  letter-spacing: -0.01em;
}
.bp-kyc-success-sub {
  font-size: 11.5px;
  color: #008a84;
  margin-top: 3px;
}

/* Liveness overlay */
.bp-liveness {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: linear-gradient(135deg, #0d0b1e, #1a1640, #231d45);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
  color: #fff;
}
.bp-liveness-circle {
  position: relative;
  width: 160px;
  height: 160px;
  margin-bottom: 20px;
}
.bp-liveness-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid rgba(94, 234, 212, 0.2);
}
.bp-liveness-face {
  position: absolute;
  inset: 14px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  display: grid;
  place-items: center;
  font-size: 54px;
}
.bp-liveness-face img {
  width: 70px;
  height: 70px;
  object-fit: contain;
  display: block;
}
.bp-liveness-h1 {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}
.bp-liveness-sub {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.65);
  max-width: 240px;
  line-height: 1.5;
}
.bp-liveness-step {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #00a19a;
  margin-top: 18px;
}

/* ── Funds (step 2) ─────────────────────────────────────── */
.bp-funds-card {
  background: #fff;
  border: 1.5px solid #eef0f6;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
}
.bp-funds-card.selected {
  border-color: #00a19a;
  background: #f1f9f4;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.12);
}
.bp-funds-row { display: flex; align-items: center; gap: 12px; }
.bp-funds-ic {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #00a19a;
}
.bp-funds-ic img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.bp-funds-body { flex: 1; min-width: 0; }
.bp-funds-title {
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
  letter-spacing: -0.01em;
}
.bp-funds-meta {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
.bp-funds-card.selected .bp-funds-meta { color: #00a19a; }
.bp-funds-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid #eef0f6;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.bp-funds-radio.filled {
  background: #00a19a;
  border-color: #00a19a;
  position: relative;
}
.bp-funds-radio.filled::after {
  content: '';
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
}
.bp-funds-extras { margin-top: 14px; }

.bp-upload-zone {
  border: 2px dashed #e2f1ea;
  border-radius: 12px;
  padding: 18px 16px;
  text-align: center;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.bp-upload-zone:hover { background: #fff; border-color: #00a19a; }
.bp-upload-ic {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #00a19a;
  color: #fff;
  display: grid;
  place-items: center;
  margin: 0 auto 10px;
}
.bp-upload-ic svg { width: 18px; height: 18px; }
.bp-upload-title {
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
}
.bp-upload-meta {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 3px;
}

.bp-uploaded-chip {
  background: #fff;
  border: 1.5px solid #e2f1ea;
  border-radius: 12px;
  padding: 11px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
}
.bp-uploaded-ic {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #00a19a;
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.bp-uploaded-ic svg { width: 16px; height: 16px; }
.bp-uploaded-body { flex: 1; min-width: 0; }
.bp-uploaded-name {
  font-size: 12.5px;
  font-weight: 700;
  color: #231d45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bp-uploaded-meta {
  font-size: 10.5px;
  color: #94a3b8;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.bp-uploaded-check { color: #008a84; font-weight: 800; }
.bp-uploaded-actions { display: flex; gap: 6px; flex-shrink: 0; }
.bp-uploaded-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  border: 1px solid #eef0f6;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #4a5568;
  transition: border-color 0.15s, color 0.15s;
}
.bp-uploaded-btn:hover { border-color: #e2f1ea; color: #00a19a; }
.bp-uploaded-btn.remove:hover { border-color: #fecaca; color: #dc2626; }
.bp-uploaded-btn svg { width: 13px; height: 13px; }

.bp-up-progress {
  background: #fff;
  border: 1.5px solid #e2f1ea;
  border-radius: 12px;
  padding: 13px 14px;
}
.bp-up-row { display: flex; align-items: center; gap: 11px; margin-bottom: 8px; }
.bp-up-ic {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f1f9f4;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #00a19a;
}
.bp-up-ic svg {
  width: 14px;
  height: 14px;
  animation: bp-spin 1.4s linear infinite;
}
@keyframes bp-spin { to { transform: rotate(360deg); } }
.bp-up-body { flex: 1; min-width: 0; }
.bp-up-name { font-size: 12px; font-weight: 700; color: #231d45; }
.bp-up-meta { font-size: 10.5px; color: #94a3b8; margin-top: 1px; }
.bp-up-bar {
  height: 4px;
  background: #eef0f6;
  border-radius: 999px;
  overflow: hidden;
}
.bp-up-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #00b5ad);
  border-radius: 999px;
  width: 0%;
  transition: width 0.4s ease;
}

/* ── Bottom sheet (shared by KYC + Funds) ───────────────── */
.bp-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.5);
  z-index: 90;
}
.bp-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 95;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 14px 20px 20px;
  max-width: 28rem;
  margin: 0 auto;
  max-height: 75%;
  overflow-y: auto;
  box-shadow: 0 -8px 32px rgba(35, 29, 69, 0.2);
}
.bp-sheet-handle {
  width: 36px;
  height: 4px;
  background: #eef0f6;
  border-radius: 999px;
  margin: 0 auto 14px;
}
.bp-sheet-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
  color: #231d45;
}
.bp-sheet-sub {
  font-size: 12.5px;
  color: #4a5568;
  margin-bottom: 16px;
  line-height: 1.45;
}
.bp-method {
  display: flex;
  align-items: center;
  gap: 13px;
  background: #fff;
  border: 1.5px solid #eef0f6;
  border-radius: 12px;
  padding: 13px 14px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  font-family: inherit;
  width: 100%;
  text-align: left;
}
.bp-method:hover { border-color: #e2f1ea; background: #f1f9f4; }
.bp-method-ic {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f1f9f4;
  border: 1px solid #e2f1ea;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #00a19a;
}
.bp-method-ic svg { width: 18px; height: 18px; }
.bp-method-body { flex: 1; min-width: 0; }
.bp-method-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  letter-spacing: -0.01em;
}
.bp-method-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }
.bp-method-chev { color: #94a3b8; font-size: 14px; font-weight: 600; }
.bp-cancel {
  width: 100%;
  background: transparent;
  border: none;
  padding: 14px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  color: #4a5568;
  cursor: pointer;
  margin-top: 6px;
}

/* ════════════════════════════════════════════════════════════════════════
 *  PROTOTYPE-ALIGNED VISUAL LAYER  (overrides earlier `.bp-*` defaults)
 *  Keeps existing templates/logic intact — only restyles classes so the
 *  journey matches umu-buyer-passport-v6.html.
 * ════════════════════════════════════════════════════════════════════════ */

.bp-page {
  background: #fafafa;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Inter, system-ui, sans-serif;
  color: #231d45;
}

/* ── Top header → prototype top-nav + eyebrow pill ── */
.bp-header {
  background: transparent;
  border-bottom: none;
  padding: 14px 18px 6px;
  padding-top: calc(14px + env(safe-area-inset-top));
  align-items: center;
}
.bp-header-body {
  flex: 1; display: flex; flex-direction: column; align-items: center;
}
.bp-header-title {
  display: none;
}
.bp-header-sub {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 10px; font-weight: 800; letter-spacing: 1.4px;
  color: #007e78; background: #f2faf8; border: 1px solid #e5f4f2;
  padding: 6px 12px; border-radius: 100px;
  text-transform: uppercase;
}
.bp-header-sub::before {
  content: ''; width: 5px; height: 5px; border-radius: 50%; background: #00a19a;
}
.bp-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 1px solid #ececef;
}

/* ── Steps 1-4 header title (mockup: bold title + info icon, no eyebrow pill) ── */
.bp-header-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bp-header-title3 {
  font-size: 17px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.2px;
}
.bp-header-info {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
}

/* ── 4-step stepper (mockup: numbered circles joined by a line) ── */
.bp-stepper-dot {
  position: relative;
}
.bp-stepper-dot:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 12px;
  left: calc(50% + 12px);
  right: calc(-50% + 12px);
  height: 2px;
  background: #eef0f4;
  z-index: 0;
}
.bp-stepper-dot.done:not(:last-child)::after {
  background: #00a19a;
}
.bp-stepper-num {
  position: relative;
  z-index: 1;
}

/* ── Step 1 identity panel (mockup-exact card) ── */
.bp-id-panel {
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(35, 29, 69, 0.06), 0 2px 8px rgba(35, 29, 69, 0.04);
}
.bp-id-panel-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}
.bp-id-panel-icon {
  width: 52px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
}
.bp-id-panel-title {
  font-size: 15.5px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  margin-bottom: 4px;
}
.bp-id-panel-body {
  font-size: 12.5px;
  color: #6b6783;
  line-height: 1.5;
}
.bp-id-panel-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #6b6783;
  margin-bottom: 10px;
}
.bp-doctype-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bp-doctype-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1.5px solid #ececef;
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.bp-doctype-row.selected {
  border-color: #00a19a;
  background: #f2faf8;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.1);
}
.bp-doctype-ic {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}
.bp-doctype-ic img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.bp-doctype-body {
  flex: 1;
  min-width: 0;
}
.bp-doctype-title {
  font-size: 13.5px;
  font-weight: 800;
  color: #231d45;
}
.bp-doctype-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 1px;
}
.bp-doctype-rec {
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: #007e78;
  background: #f2faf8;
  border: 1px solid #e5f4f2;
  padding: 3px 7px;
  border-radius: 100px;
  flex-shrink: 0;
  white-space: nowrap;
}
.bp-doctype-chev {
  color: #c3c5cf;
  flex-shrink: 0;
  display: flex;
}

/* ── 5-segment progress bar → prototype step-bar ── */
.bp-progress {
  background: transparent;
  padding: 10px 22px 4px;
  gap: 4px;
}
.bp-progress-seg {
  height: 4px; border-radius: 100px; background: #ececef; flex: 1;
}
.bp-progress-seg-filled {
  background: #00a19a;
}
.bp-progress-seg-filled:last-of-type {
  /* Mark the *latest* filled segment in amber per prototype */
  background: linear-gradient(90deg, #00a19a 0%, #E6A23C 100%);
}

/* ── Step hero → centered, step-icon-box + h2 + p ── */
.bp-step {
  padding: 22px 22px 32px;
  animation: bp-fadeSlideUp 0.4s 0.05s both;
}
@keyframes bp-fadeSlideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.bp-step-hero {
  text-align: center;
  display: flex; flex-direction: column; align-items: center;
  margin-bottom: 18px;
}
.bp-step-ic {
  width: 58px; height: 58px; border-radius: 18px;
  background: #f2faf8;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
  margin: 0 0 12px;
  border: none;
  box-shadow: none;
}
.bp-step-ic.bp-ic-amber {
  background: #fffaf0; border: 1px solid #fbefd9;
}
.bp-step-ic.bp-ic-purple {
  background: #f6f5fb; border: 1px solid #eeedf5;
}
.bp-step-ic.bp-ic-green {
  background: #f2faf8; border: 1px solid #e5f4f2;
}
.bp-step-title {
  font-size: 22px; font-weight: 800; color: #231d45;
  letter-spacing: -0.5px; line-height: 1.2;
  margin-bottom: 6px;
}
.bp-step-body {
  font-size: 13px; color: #6b6783; line-height: 1.5;
}
.bp-optional {
  font-size: 11px; font-weight: 700; color: #9c98ad;
  letter-spacing: 0.3px; margin-left: 4px;
}

/* ── Step 1 KYC trust strip → prototype DVS strip ── */
.bp-trust {
  display: flex; align-items: flex-start; gap: 12px;
  background: linear-gradient(90deg, #f6f5fb, #f2faf8);
  border: 1px solid #e5f4f2;
  border-radius: 10px;
  padding: 10px 14px;
  margin: 0 0 16px;
  font-size: 11px; font-weight: 700;
  color: #4a4566; line-height: 1.4;
}
.bp-trust strong { color: #231d45; }
.bp-trust-ic {
  flex-shrink: 0;
  width: 24px; height: 24px;
  background: #231d45; color: white;
  border-radius: 6px;
  font-size: 8px; font-weight: 800; letter-spacing: 0.5px;
  display: flex; align-items: center; justify-content: center;
}
.bp-trust-ic svg {
  width: 14px; height: 14px;
}

/* ── Option cards → prototype opt-card pattern ── */
.bp-option-list,
.bp-tile-row {
  padding: 0;
}
.bp-option-card,
.bp-funds-card {
  background: #fafafa; border: 1.5px solid #ececef;
  border-radius: 14px; padding: 14px 16px;
  transition: all 0.15s;
  box-shadow: none;
}
.bp-option-card.selected,
.bp-funds-card.selected {
  background: #f2faf8; border-color: #00a19a;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.10);
}
.bp-option-emoji {
  font-size: 20px; width: 36px; text-align: center;
}
.bp-option-title {
  font-size: 13.5px; font-weight: 800; color: #231d45;
}
.bp-option-sub {
  font-size: 11px; color: #6b6783;
}
.bp-option-check {
  width: 18px; height: 18px; border-radius: 50%;
  border: 1.5px solid #ececef;
  display: flex; align-items: center; justify-content: center;
  margin-left: auto; flex-shrink: 0;
}
.bp-option-card.selected .bp-option-check {
  background: #00a19a; border-color: #00a19a;
}
.bp-option-card.selected .bp-option-check::after,
.bp-option-check.filled::after {
  content: ''; width: 6px; height: 6px; border-radius: 50%; background: #fff;
}
.bp-option-check.filled {
  background: #00a19a; border-color: #00a19a;
}

/* Funds card radio pill → match opt-radio */
.bp-funds-radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 1.5px solid #ececef;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: transparent;
}
.bp-funds-radio.filled {
  background: #00a19a; border-color: #00a19a;
}
.bp-funds-radio.filled::after {
  content: ''; width: 6px; height: 6px; border-radius: 50%; background: #fff;
}

/* ── Tile row (step 4 solicitor/timeline) → prototype tile-grid ── */
.bp-tile-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
  margin-bottom: 18px;
}
.bp-tile {
  background: #fff;
  border-radius: 14px; padding: 12px 10px;
  border: 1.5px solid #ececef;
  box-shadow: none;
  text-align: center;
}
.bp-tile.selected {
  border-color: #00a19a; background: #f2faf8;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.10);
}
.bp-tile-emoji { font-size: 22px; margin-bottom: 4px; }
.bp-tile-label {
  font-size: 12px; font-weight: 800; color: #231d45;
}

/* Sub-heading "Have you instructed…", "When are you looking…" */
.bp-field-label {
  font-size: 11px; font-weight: 800; letter-spacing: 1px;
  color: #6b6783; text-transform: uppercase;
  margin: 18px 0 10px;
}

/* ── Continue / Generate CTA → prototype cta-btn ── */
.bp-next,
.bp-generate {
  background: #00a19a;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 14px; font-weight: 800;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.35);
  position: relative; overflow: hidden;
  margin-top: 18px;
  transition: all 0.15s;
}
.bp-next::after,
.bp-generate::after {
  content: ''; position: absolute; top: 0; left: 0;
  width: 50px; height: 100%;
  background: linear-gradient(
    90deg, transparent, rgba(255, 255, 255, 0.2), transparent
  );
  transform: translateX(-100%) skewX(-15deg);
  animation: bp-shimmer 2.5s ease-in-out 1s infinite;
}
.bp-next:hover:not(.disabled):not(:disabled),
.bp-generate:hover:not(:disabled) {
  background: #00b6ae; transform: translateY(-1px);
}
.bp-next.disabled,
.bp-next:disabled {
  background: #ececef; color: #9c98ad;
  box-shadow: none;
}
.bp-next.disabled::after,
.bp-next:disabled::after { display: none; }
@keyframes bp-shimmer {
  0% { transform: translateX(-100%) skewX(-15deg); }
  100% { transform: translateX(600%) skewX(-15deg); }
}

/* Skip / ghost link variants */
.bp-skip {
  color: #6b6783; font-weight: 700;
}

/* Statement textarea — prototype-style softer */
.bp-textarea {
  border: 1.5px solid #ececef; border-radius: 14px;
  background: #fafafa;
  padding: 14px;
  font-family: inherit; font-size: 14px;
  color: #231d45; line-height: 1.55;
  width: 100%;
}
.bp-textarea:focus { outline: none; border-color: #00a19a; background: #fff; }

.bp-prompts { gap: 6px; }
.bp-prompt {
  font-size: 11.5px; font-weight: 700;
  background: #f2faf8; color: #007e78;
  border: 1px solid #e5f4f2;
  padding: 6px 12px; border-radius: 100px;
}

/* ── Tier cards (step 2) ──────────────────────────────────── */
.bp-tier-list {
  display: flex; flex-direction: column; gap: 10px;
  margin-bottom: 18px;
}
.bp-tier-card {
  position: relative;
  border-radius: 18px; padding: 14px 16px;
  border: 1.5px solid transparent;
  cursor: pointer; text-align: left;
  font-family: inherit;
  transition: all 0.15s;
  width: 100%;
}
.bp-tier-card.verified {
  background: linear-gradient(135deg, #f2faf8, #d0f0ee);
  border-color: #e5f4f2;
}
.bp-tier-card.premium {
  background: linear-gradient(135deg, #fbefd9, #fff8ec);
  border-color: #fbefd9;
}
.bp-tier-card.selected.verified {
  border-color: #00a19a; box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.18);
}
.bp-tier-card.selected.premium {
  border-color: #d4822a; box-shadow: 0 0 0 3px rgba(212, 130, 42, 0.18);
}
.bp-tier-corner {
  position: absolute; top: 12px; right: 14px;
  font-size: 18px; font-weight: 900;
  opacity: 0.5;
}
.bp-tier-card.selected.verified .bp-tier-corner { color: #00a19a; opacity: 1; }
.bp-tier-card.selected.premium .bp-tier-corner { color: #d4822a; opacity: 1; }
.bp-tier-badge {
  display: inline-block;
  font-size: 9px; font-weight: 900; letter-spacing: 1.4px;
  padding: 3px 8px; border-radius: 6px; margin-bottom: 8px;
}
.bp-tier-badge--verified { background: #00a19a; color: #fff; }
.bp-tier-badge--premium { background: #d4822a; color: #fff; }
.bp-tier-title {
  font-size: 14px; font-weight: 800; color: #231d45;
  margin-bottom: 2px;
}
.bp-tier-sub {
  font-size: 11.5px; font-weight: 500; color: #6b6783;
  line-height: 1.45;
  margin-bottom: 10px;
}
.bp-tier-price-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
}
.bp-tier-price {
  font-size: 22px; font-weight: 900; color: #231d45;
  letter-spacing: -0.5px;
}
.bp-tier-card.premium .bp-tier-price { color: #d4822a; }
.bp-tier-paid-pill {
  font-size: 10px; font-weight: 800; letter-spacing: 0.5px;
  background: #00a19a; color: #fff;
  padding: 3px 9px; border-radius: 100px;
}
.bp-tier-features {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 4px;
}
.bp-tier-features li {
  font-size: 11.5px; color: #4a4566;
  display: flex; gap: 6px; align-items: flex-start;
  line-height: 1.4;
}
.bp-tier-tick { color: #00a19a; font-weight: 900; flex-shrink: 0; }
.bp-tier-dash { color: #c0bdcc; font-weight: 900; flex-shrink: 0; }
.bp-tier-card.premium .bp-tier-tick { color: #d4822a; }

/* Funds section header inside step 2 */
.bp-funds-step-pill {
  display: inline-block;
  background: #00a19a; color: #fff;
  font-size: 8.5px; font-weight: 900; letter-spacing: 1px;
  padding: 3px 7px; border-radius: 4px;
  margin-right: 8px; vertical-align: middle;
}
.bp-funds-intro {
  font-size: 12px; color: #6b6783; line-height: 1.5;
  margin: -4px 0 12px;
}

/* 4-up chip row for property type */
.bp-tile-row-4 {
  grid-template-columns: 1fr 1fr 1fr 1fr;
}

/* Recommended pill (used in ID type picker) */
.bp-rec-pill {
  font-size: 8.5px; font-weight: 800; letter-spacing: 1px;
  background: #fef3c7; color: #d4822a;
  padding: 3px 7px; border-radius: 100px;
  margin-right: 6px;
  flex-shrink: 0;
}

/* ID type list — tighter spacing than the funds cards */
.bp-idtype-list {
  display: flex; flex-direction: column; gap: 8px;
  margin-bottom: 16px;
}
.bp-option-list,
.bp-idtype-list {
  display: flex; flex-direction: column; gap: 8px;
}
.bp-option-body {
  flex: 1; min-width: 0;
}

/* ── Step 3: BEST pill + option title row + amber context card ── */
.bp-option-title-row {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 4px;
}
.bp-best-pill {
  font-size: 9.5px; font-weight: 800; letter-spacing: 0.4px;
  background: #f2faf8; color: #007e78;
  border: 1px solid #e5f4f2;
  border-radius: 100px; padding: 2px 8px;
}
.bp-amber-card {
  margin-top: 16px;
  background: linear-gradient(135deg, #fbefd9, #fffaf0);
  border: 1px solid #fbefd9; border-radius: 14px;
  padding: 14px 16px;
  display: flex; gap: 12px; align-items: flex-start;
}
.bp-amber-ic {
  width: 30px; height: 30px; border-radius: 8px;
  background: #fbefd9;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0;
}
.bp-amber-title {
  font-size: 13px; font-weight: 800; color: #231d45; margin-bottom: 4px;
}
.bp-amber-body {
  font-size: 12px; color: #6b6783; line-height: 1.4;
}

/* ── Step 4: sec-label + chip rows + sol-card + tip ── */
.bp-step-hero--narrow .bp-step-ic { display: none; }
.bp-sec-label {
  font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
  color: #6b6783; text-transform: uppercase;
  padding: 0;
  margin: 18px 0 10px;
}
.bp-step .bp-sec-label:first-of-type { margin-top: 12px; }
.bp-chip-row {
  display: flex; flex-wrap: wrap; gap: 6px;
  margin-bottom: 4px;
}
.bp-chip {
  background: #fff; border: 1.5px solid #ececef;
  border-radius: 100px;
  padding: 9px 14px;
  font-family: inherit; font-size: 12.5px; font-weight: 700;
  color: #231d45; cursor: pointer;
  transition: all 0.15s;
}
.bp-chip:hover { border-color: #c0bdcc; }
.bp-chip.active {
  background: #00a19a; border-color: #00a19a; color: #fff;
  box-shadow: 0 4px 12px rgba(0, 161, 154, 0.2);
}
.bp-sol-options { display: flex; flex-wrap: wrap; gap: 6px; }
.bp-sol-card {
  display: flex; align-items: center; gap: 12px;
  background: #fff; border: 1.5px solid #ececef;
  border-radius: 14px; padding: 14px;
  cursor: pointer;
  transition: all 0.15s;
}
.bp-sol-card:hover { border-color: #00a19a; }
.bp-sol-ic {
  width: 36px; height: 36px; border-radius: 10px;
  background: #f2faf8;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.bp-sol-body { flex: 1; min-width: 0; }
.bp-sol-name { font-size: 13.5px; font-weight: 800; color: #231d45; }
.bp-sol-sub { font-size: 11px; color: #6b6783; margin-top: 2px; }
.bp-sol-pill {
  font-size: 10px; font-weight: 800; letter-spacing: 0.5px;
  background: #e8f5ee; color: #2eab55;
  border: 1px solid #b8e8c8;
  border-radius: 100px; padding: 4px 8px;
  flex-shrink: 0;
}
.bp-tip {
  margin: 10px 0 0;
  padding: 12px 14px;
  background: #fafafa; border: 1px solid #ececef;
  border-radius: 10px;
  font-size: 11.5px; color: #6b6783; line-height: 1.45;
}

/* ── Step 5: story textarea + prompt chips + AI card ── */
.bp-step-ic--amber {
  background: #fffaf0 !important;
  border: 1px solid #fbefd9 !important;
}
.bp-optional {
  font-size: 14px; font-weight: 700;
  color: #c4821a; letter-spacing: -0.1px;
}
.bp-prompt-row {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 12px;
}
.bp-prompt-chip {
  background: #f2faf8; color: #007e78;
  border: 1px solid #e5f4f2;
  border-radius: 100px;
  padding: 7px 12px;
  font-family: inherit; font-size: 11.5px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
}
.bp-prompt-chip:hover {
  background: #e5f4f2; border-color: #00a19a;
}
.bp-story-ta {
  width: 100%;
  background: #fafafa; border: 1.5px solid #ececef;
  border-radius: 14px;
  padding: 14px;
  font-family: inherit; font-size: 14px;
  color: #231d45; line-height: 1.55;
  resize: vertical; min-height: 130px;
}
.bp-story-ta:focus {
  outline: none; border-color: #00a19a; background: #fff;
}
.bp-ai-card {
  margin-top: 12px;
  width: 100%;
  background: linear-gradient(135deg, #f2faf8, #f6f5fb);
  border: 1px solid #e5f4f2; border-radius: 12px;
  padding: 12px 14px;
  display: flex; align-items: center; gap: 12px;
  cursor: pointer;
  font-family: inherit; text-align: left;
  transition: all 0.15s;
}
.bp-ai-card:hover {
  border-color: #00a19a;
}
.bp-ai-card:disabled { opacity: 0.6; cursor: progress; }
.bp-ai-pill {
  background: #00a19a; color: #fff;
  font-size: 9px; font-weight: 800;
  padding: 4px 8px; border-radius: 100px;
  white-space: nowrap; letter-spacing: 0.5px;
}
.bp-ai-text {
  flex: 1; min-width: 0;
  font-size: 13px; font-weight: 600; color: #231d45;
  line-height: 1.4;
}
.bp-ai-try {
  font-size: 12px; font-weight: 800; color: #007e78;
  white-space: nowrap;
}
.bp-ai-err {
  font-size: 11.5px; font-weight: 600;
  color: #c73e36; margin: 8px 0 0;
}
.bp-skip-ghost {
  display: block; width: 100%;
  background: none; border: none;
  font-family: inherit;
  font-size: 12px; font-weight: 700; color: #6b6783;
  padding: 12px;
  cursor: pointer; text-align: center;
}
.bp-generate {
  margin-top: 16px;
}

/* ── DONE screen (prototype `complete`) ──────────────────────── */
.bp-complete {
  padding: 16px 22px 32px;
}
.bp-complete-hero {
  text-align: center; padding: 12px 0 16px;
}
.bp-complete-emoji {
  font-size: 52px; line-height: 1; margin-bottom: 12px;
  display: inline-block;
  animation: bp-pop 0.5s ease-out 0.1s both;
}
.bp-complete-emoji img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  display: inline-block;
}
@keyframes bp-pop {
  0% { transform: scale(0.5); opacity: 0; }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
.bp-complete-title {
  font-size: 24px; font-weight: 800; color: #231d45;
  letter-spacing: -0.5px; margin-bottom: 6px;
  animation: bp-fadeSlideUp 0.4s 0.2s both;
}
.bp-complete-sub {
  font-size: 13px; color: #6b6783;
  animation: bp-fadeSlideUp 0.4s 0.25s both;
}

.bp-xp-row {
  display: flex; align-items: center; gap: 12px;
  background: linear-gradient(135deg, #fbefd9, #fff8ec);
  border: 1px solid #fbefd9;
  border-radius: 14px;
  padding: 12px 16px;
  animation: bp-fadeSlideUp 0.4s 0.4s both;
}
.bp-xp-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.bp-xp-body { flex: 1; min-width: 0; }
.bp-xp-title { font-size: 14px; font-weight: 800; color: #231d45; }
.bp-xp-sub { font-size: 11px; color: #6b6783; margin-top: 1px; }
.bp-xp-points {
  font-size: 15px; font-weight: 800; color: #c4821a;
  flex-shrink: 0;
}

.bp-complete-card-wrap {
  margin-top: 16px;
  animation: bp-fadeSlideUp 0.45s 0.5s both;
}
.bp-complete-card {
  background: linear-gradient(140deg, #00b6ae 0%, #00a19a 50%, #00514d 100%);
  box-shadow: 0 12px 32px -10px rgba(0, 161, 154, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 18px 20px 20px;
  color: white;
  position: relative; overflow: hidden;
}
.bp-complete-card::after {
  content: ''; position: absolute; top: -40%; right: -20%;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%);
  pointer-events: none;
}
.bp-complete-card > * { position: relative; z-index: 1; }
.bp-complete-card-top {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.bp-complete-card-eyebrow {
  font-size: 9px; font-weight: 800; letter-spacing: 1.8px;
  text-transform: uppercase; opacity: 0.7;
}
.bp-complete-card-strength {
  font-size: 9px; font-weight: 800;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 100px;
  padding: 4px 10px;
  letter-spacing: 0.4px;
}
.bp-complete-tagline {
  font-size: 20px; font-weight: 800; font-style: italic;
  line-height: 1.25; margin-bottom: 12px;
}
.bp-complete-name {
  font-size: 13px; font-weight: 700; margin-bottom: 12px;
}
.bp-complete-pills {
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;
}
.bp-complete-pill {
  font-size: 10px; font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 100px;
  padding: 5px 10px;
  color: white; white-space: nowrap;
}
.bp-complete-foot {
  display: flex; align-items: center; justify-content: space-between;
}
.bp-complete-foot-text {
  font-size: 11px; font-weight: 600; opacity: 0.75;
}
.bp-complete-share {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none; color: white;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; font-family: inherit;
}

.bp-complete-actions {
  margin-top: 16px;
  display: flex; flex-direction: column; gap: 10px;
  animation: bp-fadeSlideUp 0.4s 0.75s both;
}
.bp-cta-outline {
  width: 100%;
  background: #fff; color: #231d45;
  border: 1.5px solid #231d45;
  border-radius: 14px;
  padding: 16px;
  font-family: inherit; font-size: 14px; font-weight: 800;
  cursor: pointer;
}

/* Budget field */
.bp-budget-wrap {
  display: flex; align-items: center;
  background: #fafafa; border: 1.5px solid #ececef;
  border-radius: 14px; padding: 0 14px;
  margin-top: 4px;
}
.bp-budget-wrap:focus-within {
  border-color: #00a19a; background: #fff;
}
.bp-budget-sign {
  font-size: 18px; font-weight: 800; color: #231d45; margin-right: 4px;
}
.bp-budget-input {
  flex: 1; border: none; outline: none; background: transparent;
  padding: 14px 0;
  font-family: inherit; font-size: 16px; font-weight: 700; color: #231d45;
}
</style>
