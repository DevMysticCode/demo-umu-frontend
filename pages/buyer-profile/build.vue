<template>
  <div class="bp-page">
    <!-- Sticky header -->
    <div class="bp-header">
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
        <div class="bp-header-title">Build your Profile</div>
        <div class="bp-header-sub">Step {{ step }} of 5</div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="bp-progress">
      <div
        v-for="n in 5"
        :key="n"
        class="bp-progress-seg"
        :class="{ 'bp-progress-seg-filled': n <= step }"
      />
    </div>

    <div class="bp-scroll">
      <!-- ── STEP 1: KYC — Photo ID / Selfie / AML ── -->
      <div v-if="step === 1" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-teal">🪪</div>
          <div class="bp-step-title">Verify your identity</div>
          <div class="bp-step-body">
            Show sellers we've checked who you are. Takes about 2 minutes — done once only.
          </div>
        </div>

        <!-- Trust strip -->
        <div class="bp-trust">
          <div class="bp-trust-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>Encrypted &amp; secure · powered by <strong>Onfido</strong> · used by major UK banks</div>
        </div>

        <!-- Task 1: Photo ID -->
        <div
          class="bp-task"
          :class="{ active: kycActive === 'id' && !kycIdDone, done: kycIdDone }"
        >
          <div class="bp-task-row" @click="setKycActive('id')">
            <div class="bp-task-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2.5" y="5" width="19" height="14" rx="2" />
                <circle cx="8" cy="11" r="2.5" />
                <line x1="13" y1="9" x2="18" y2="9" />
                <line x1="13" y1="13" x2="18" y2="13" />
              </svg>
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
                  <div class="bp-id-iconbig">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
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
                  <div class="bp-id-iconbig">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
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
            <div class="bp-task-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="9" r="4" />
                <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
              </svg>
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
              <div class="bp-selfie-iconbig">🤳</div>
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
            <div class="bp-task-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
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
              <div class="bp-liveness-face">🤳</div>
            </div>
            <div class="bp-liveness-h1">{{ livenessTitle }}</div>
            <div class="bp-liveness-sub">Hold still — we'll capture automatically.</div>
            <div class="bp-liveness-step">{{ livenessStep }}</div>
          </div>
        </Teleport>
      </div>

      <!-- ── STEP 2: Funds ── -->
      <div v-if="step === 2" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-green">🏛️</div>
          <div class="bp-step-title">Proof of funds</div>
          <div class="bp-step-body">
            Show sellers you're financially ready. Choose what applies to you.
          </div>
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
                <span style="font-size: 20px">{{ opt.emoji }}</span>
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
          {{ saving ? 'Saving…' : 'Continue →' }}
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

      <!-- ── STEP 3: Chain ── -->
      <div v-if="step === 3" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-amber">🔗</div>
          <div class="bp-step-title">Your chain position</div>
          <div class="bp-step-body">
            This tells sellers how straightforward a sale with you would be.
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
            <span class="bp-option-emoji">{{ opt.emoji }}</span>
            <div class="bp-option-body">
              <div class="bp-option-title">{{ opt.title }}</div>
              <div class="bp-option-sub">{{ opt.sub }}</div>
            </div>
            <div class="bp-option-check" :class="{ filled: chainPosition === opt.value }" />
          </button>
        </div>
        <button
          class="bp-next"
          :class="{ disabled: !canContinue }"
          :disabled="!canContinue"
          @click="goNext"
        >
          {{ saving ? 'Saving…' : 'Continue →' }}
        </button>
      </div>

      <!-- ── STEP 4: Solicitor + timeline ── -->
      <div v-if="step === 4" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-purple">⚖️</div>
          <div class="bp-step-title">A few quick questions</div>
          <div class="bp-step-body">
            This helps sellers and agents understand how ready you are to move.
          </div>
        </div>
        <div class="bp-field-label">Have you instructed a solicitor?</div>
        <div class="bp-tile-row">
          <button
            v-for="opt in solicitorOptions"
            :key="opt.value"
            class="bp-tile"
            :class="{ selected: solicitorStatus === opt.value }"
            @click="solicitorStatus = opt.value"
          >
            <div class="bp-tile-emoji">{{ opt.emoji }}</div>
            <div class="bp-tile-label">{{ opt.label }}</div>
          </button>
        </div>
        <div class="bp-field-label">When are you looking to move?</div>
        <div class="bp-tile-row">
          <button
            v-for="opt in timelineOptions"
            :key="opt.value"
            class="bp-tile bp-tile-small"
            :class="{ selected: timeline === opt.value }"
            @click="timeline = opt.value"
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
          {{ saving ? 'Saving…' : 'Continue →' }}
        </button>
      </div>

      <!-- ── STEP 5: Statement ── -->
      <div v-if="step === 5" class="bp-step">
        <div class="bp-step-hero">
          <div class="bp-step-ic bp-ic-amber">✍️</div>
          <div class="bp-step-title">
            Tell your story
            <span class="bp-optional">(optional)</span>
          </div>
          <div class="bp-step-body">
            A short personal note can make a real difference — sellers often choose buyers they connect with.
          </div>
        </div>
        <div class="bp-prompts">
          <div
            v-for="p in prompts"
            :key="p"
            class="bp-prompt"
            @click="appendPrompt(p)"
          >
            + {{ p }}
          </div>
        </div>
        <textarea
          v-model="statement"
          class="bp-textarea"
          rows="6"
          placeholder="e.g. We're a young family looking to put down roots in a community we love. We're chain-free, financially ready, and flexible on completion..."
        />
        <button class="bp-generate" @click="submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {{ publishing ? 'Generating…' : 'Generate my Profile' }}
        </button>
        <button class="bp-skip" @click="submit">Skip this step</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBuyerProfile } from '~/composables/useBuyerProfile'
import { useAppToast } from '~/composables/useCustomToast'

const router = useRouter()
const { getBuyerProfile, updateBuyerProfile, publishBuyerProfile } =
  useBuyerProfile()
const { showToast } = useAppToast()

const step = ref<1 | 2 | 3 | 4 | 5>(1)
const saving = ref(false)
const publishing = ref(false)

// Form state
const idDocumentType = ref<string | null>(null)
const fundsType = ref<string | null>(null)
const fundsAmount = ref<number | null>(null)
const chainPosition = ref<string | null>(null)
const solicitorStatus = ref<string | null>(null)
const timeline = ref<string | null>(null)
const statement = ref('')

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
  kycSheetSide.value = target === 'id-front' ? 'front' : 'back'
  kycSheetOpen.value = true
}
function closeKycSheet() { kycSheetOpen.value = false }

function simulateIdCapture() {
  const side = kycSheetSide.value
  closeKycSheet()
  setTimeout(() => {
    if (side === 'front') kycIdFront.value = true
    else kycIdBack.value = true
    if (kycIdDone.value) {
      // Backend stores idDocumentType — KYC defaults it to passport when both
      // sides are captured (the prototype doesn't ask the user to pick).
      if (!idDocumentType.value) idDocumentType.value = 'passport'
      setTimeout(() => {
        kycActive.value = 'selfie'
      }, 500)
    }
  }, 350)
}

function runLiveness() {
  if (livenessRunning.value || kycSelfieDone.value) return
  livenessRunning.value = true
  livenessTitle.value = 'Look at the camera'
  livenessStep.value = 'Step 1 of 3'
  setTimeout(() => {
    livenessTitle.value = 'Turn slightly left'
    livenessStep.value = 'Step 2 of 3'
  }, 1000)
  setTimeout(() => {
    livenessTitle.value = 'Turn slightly right'
    livenessStep.value = 'Step 3 of 3'
  }, 2000)
  setTimeout(() => {
    livenessTitle.value = 'Liveness confirmed'
    livenessStep.value = '✓ Passed'
  }, 3000)
  setTimeout(() => {
    livenessRunning.value = false
    kycSelfieDone.value = true
    setTimeout(() => {
      kycActive.value = 'aml'
      startAML()
    }, 400)
  }, 3800)
}

function startAML() {
  if (amlStep.value >= 0) return
  amlStep.value = 0
  setTimeout(() => { amlStep.value = 1 }, 900)
  setTimeout(() => { amlStep.value = 2 }, 1800)
  setTimeout(() => {
    amlStep.value = 3
    kycAmlDone.value = true
  }, 2700)
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
const fundsOptions = [
  { value: 'mortgage', emoji: '💳', title: 'Mortgage in principle', sub: 'Upload your DIP document' },
  { value: 'cash', emoji: '💷', title: 'Cash buyer', sub: 'Bank statement showing available funds' },
  { value: 'help', emoji: '🏛️', title: 'Help to Buy / Shared ownership', sub: 'Government scheme with mortgage' },
]
const chainOptions = [
  { value: 'ftb', emoji: '🌟', title: 'First time buyer', sub: 'No property to sell — chain-free' },
  { value: 'selling', emoji: '🏠', title: 'Have a property to sell', sub: 'Currently on the market' },
  { value: 'sold', emoji: '✅', title: 'Property sold / chain-free', sub: 'Sale agreed or renting while I buy' },
  { value: 'renting', emoji: '🏢', title: 'Currently renting', sub: 'Flexible on completion date' },
]
const solicitorOptions = [
  { value: 'yes', emoji: '✅', label: 'Yes' },
  { value: 'looking', emoji: '🔍', label: 'Looking' },
  { value: 'notsure', emoji: '❓', label: 'Not yet' },
]
const timelineOptions = [
  { value: 'asap', label: 'ASAP' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
  { value: 'flex', label: 'Flexible' },
]
const prompts = [
  'Why I want this type of home',
  'My timeline and flexibility',
  'What matters most to me',
]

const canContinue = computed(() => {
  switch (step.value) {
    case 1:
      return kycAllDone.value
    case 2:
      return (
        !!fundsType.value &&
        !!fundsUpload.value &&
        !!fundsAmount.value &&
        fundsAmount.value > 0
      )
    case 3:
      return !!chainPosition.value
    case 4:
      return !!solicitorStatus.value && !!timeline.value
    case 5:
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
  if (step.value > 1) {
    step.value = (step.value - 1) as any
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
      patch.fundsType = fundsType.value
      patch.fundsAmount = fundsAmount.value
    }
    if (step.value === 3) patch.chainPosition = chainPosition.value
    if (step.value === 4) {
      patch.solicitorStatus = solicitorStatus.value
      patch.timeline = timeline.value
    }
    if (step.value === 5) patch.statement = statement.value
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
  if (step.value < 5) {
    step.value = (step.value + 1) as any
  }
}

async function submit() {
  publishing.value = true
  try {
    // Single self-healing call — the publish endpoint upserts everything we
    // send, then publishes. So even if earlier per-step PATCHes failed
    // silently, this one request makes the wizard correct.
    await publishBuyerProfile({
      idDocumentType: idDocumentType.value,
      fundsType: fundsType.value,
      fundsAmount: fundsAmount.value,
      chainPosition: chainPosition.value,
      solicitorStatus: solicitorStatus.value,
      timeline: timeline.value,
      statement: statement.value,
      completedSteps: 5,
    })
    showToast({ message: 'Profile published', iconEmoji: '✅' })
    router.replace('/buyer-profile/view')
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Could not publish profile'
    showToast({ message: msg, iconEmoji: '⚠️' })
  } finally {
    publishing.value = false
  }
}

onMounted(async () => {
  try {
    const data = await getBuyerProfile()
    if (data) {
      idDocumentType.value = data.idDocumentType ?? null
      // If KYC was already completed in a previous session, mark all three
      // checks as done so the user doesn't have to re-do them.
      if (data.idDocumentType) {
        kycIdFront.value = true
        kycIdBack.value = true
        kycSelfieDone.value = true
        kycAmlDone.value = true
        amlStep.value = 3
      }
      fundsType.value = data.fundsType ?? null
      fundsAmount.value = data.fundsAmount ?? null
      chainPosition.value = data.chainPosition ?? null
      solicitorStatus.value = data.solicitorStatus ?? null
      timeline.value = data.timeline ?? null
      statement.value = data.statement ?? ''
    }
  } catch {}
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, system-ui, sans-serif;
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
}
.bp-ic-teal {
  background: #f0fdfa;
  border-color: #99f6e4;
}
.bp-ic-green {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.bp-ic-amber {
  background: #fef9f0;
  border-color: #fde68a;
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
  background: #008c86;
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
  border: 1px solid #b2e8e6;
  border-radius: 11px;
  padding: 9px 12px;
  margin-bottom: 18px;
  font-size: 11.5px;
  color: #4a5568;
  line-height: 1.4;
}
.bp-trust strong { color: #231d45; font-weight: 700; }
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
  background: #eafaf9;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.12);
}
.bp-task.done {
  background: #fff;
  border-color: #b2e8e6;
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
  background: #eafaf9;
  border: 1px solid #b2e8e6;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #008c86;
  transition: all 0.18s;
}
.bp-task.done .bp-task-ic {
  background: #00a19a;
  border-color: #008c86;
  color: #fff;
}
.bp-task-ic svg { width: 20px; height: 20px; }
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
.bp-status-done { background: #d1fae5; color: #065f46; }
.bp-status-running { background: #eafaf9; color: #008c86; border: 1px solid #b2e8e6; }
.bp-task-extras { margin-top: 12px; }

/* ID capture tiles */
.bp-id-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.bp-id-tile {
  background: rgba(255, 255, 255, 0.7);
  border: 2px dashed #b2e8e6;
  border-radius: 11px;
  padding: 14px 8px;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.bp-id-tile:hover { background: #fff; border-color: #00a19a; }
.bp-id-tile.captured {
  border-style: solid;
  border-color: #b2e8e6;
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
  color: #008c86;
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
  color: #059669;
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
  border: 2px dashed #b2e8e6;
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
  background: #eafaf9;
  border: 2px solid #00a19a;
  display: grid;
  place-items: center;
  margin: 0 auto 10px;
  font-size: 26px;
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
  border: 1.5px solid #b2e8e6;
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
.bp-aml-row.clear .bp-aml-dot { background: #059669; color: #fff; }

/* KYC success panel */
.bp-kyc-success {
  margin-top: 16px;
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border: 1px solid #6ee7b7;
  border-radius: 14px;
  padding: 14px 16px;
  text-align: center;
}
.bp-kyc-success-ic {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #059669;
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
  color: #065f46;
  letter-spacing: -0.01em;
}
.bp-kyc-success-sub {
  font-size: 11.5px;
  color: #047857;
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
  color: #5eead4;
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
  background: #eafaf9;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.12);
}
.bp-funds-row { display: flex; align-items: center; gap: 12px; }
.bp-funds-ic {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #eafaf9;
  border: 1px solid #b2e8e6;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #008c86;
}
.bp-funds-card.selected .bp-funds-ic {
  background: #fff;
  border-color: #b2e8e6;
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
.bp-funds-card.selected .bp-funds-meta { color: #008c86; }
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
  border: 2px dashed #b2e8e6;
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
  border: 1.5px solid #b2e8e6;
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
.bp-uploaded-check { color: #059669; font-weight: 800; }
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
.bp-uploaded-btn:hover { border-color: #b2e8e6; color: #008c86; }
.bp-uploaded-btn.remove:hover { border-color: #fecaca; color: #dc2626; }
.bp-uploaded-btn svg { width: 13px; height: 13px; }

.bp-up-progress {
  background: #fff;
  border: 1.5px solid #b2e8e6;
  border-radius: 12px;
  padding: 13px 14px;
}
.bp-up-row { display: flex; align-items: center; gap: 11px; margin-bottom: 8px; }
.bp-up-ic {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #eafaf9;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #008c86;
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
  background: linear-gradient(90deg, #008c86, #00b5ad);
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
.bp-method:hover { border-color: #b2e8e6; background: #eafaf9; }
.bp-method-ic {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #eafaf9;
  border: 1px solid #b2e8e6;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #008c86;
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
</style>
