<template>
  <div class="claim-root  mobile-container min-h-screen">
    <!-- ── Sticky topbar + progress (not shown on fullscreen steps) ── -->
    <div
      v-if="!isFullscreenStep"
      class="cl-topbar"
    >
      <button class="cl-back" @click="onBack" aria-label="Back">‹</button>
      <div class="cl-top-text">
        <div class="cl-top-title">{{ topbarTitle }}</div>
        <div v-if="topbarSub" class="cl-top-sub">{{ topbarSub }}</div>
      </div>
      <div class="cl-spacer" />
    </div>
    <div v-if="!isFullscreenStep" class="cl-prog-strip">
      <span :style="{ width: `${progressPct}%` }" />
    </div>

    <!-- ════════════════════════════ SEARCH ════════════════════════════ -->
    <div v-if="step === 'search'" class="cl-screen">
      <div class="cl-icon-square"><img src="/op-icons/investment/house.png" alt="" loading="lazy" /></div>
      <h1 class="cl-h2 cl-center">Which property are you claiming?</h1>
      <p class="cl-body cl-center cl-mb-lg">
        Enter your postcode and select your address. We'll verify ownership via
        HM Land Registry.
      </p>

      <div class="cl-field-wrap">
        <div class="cl-field-label">Postcode or address</div>
        <PropertySearchInput
          placeholder="e.g. SK7 4BL"
          variant="light"
          @select="onPropertySelect"
        />
      </div>

      <div v-if="selectedProperty" class="cl-sel-card">
        <div class="cl-sel-eyebrow">Selected address</div>
        <div class="cl-sel-line1">{{ selectedProperty.addressLine1 || '—' }}</div>
        <div class="cl-sel-line2">
          {{ [selectedProperty.city, selectedProperty.postcode].filter(Boolean).join(', ') }}
        </div>
        <div class="cl-sel-change" @click="clearSelection">Change address</div>
      </div>

      <div class="cl-lock-note">
        <div class="cl-lock-ic"><img src="/op-icons/investment/padlock.png" alt="" loading="lazy" /></div>
        <div class="cl-lock-body">
          We verify ownership via
          <strong>HM Land Registry</strong> — encrypted and never sold.
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ CONFIRM ════════════════════════════ -->
    <div v-else-if="step === 'confirm'" class="cl-screen">
      <h1 class="cl-h2">Is this your property?</h1>
      <p class="cl-body cl-mb-md">
        Check these details match the property you own.
      </p>

      <!-- Big teal-wash card: eyebrow + address on left, 3D house on right -->
      <div class="cl-lr-card">
        <div class="cl-lr-card-text">
          <div class="cl-lr-eyebrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            FOUND ON LAND REGISTRY
          </div>
          <div class="cl-lr-addr1">{{ selectedProperty?.addressLine1 || '—' }}</div>
          <div class="cl-lr-addr2">
            {{ [selectedProperty?.city, selectedProperty?.postcode].filter(Boolean).join(', ') || '—' }}
          </div>
        </div>
        <img
          src="/op-icons/claim/houseWithPin.png"
          alt=""
          class="cl-lr-card-illus"
          loading="lazy"
        />
        <div class="cl-lr-tile-grid">
          <div class="cl-lr-tile">
            <span class="cl-lr-tile-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
            </span>
            <div>
              <div class="cl-lr-tile-l">Tenure</div>
              <div class="cl-lr-tile-v">{{ tenureDisplay }}</div>
            </div>
          </div>
          <div class="cl-lr-tile">
            <span class="cl-lr-tile-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
                <line x1="10" y1="3" x2="8" y2="21" />
                <line x1="16" y1="3" x2="14" y2="21" />
              </svg>
            </span>
            <div>
              <div class="cl-lr-tile-l">Title number</div>
              <div class="cl-lr-tile-v">{{ titleDisplay }}</div>
            </div>
          </div>
          <div class="cl-lr-tile">
            <span class="cl-lr-tile-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <div>
              <div class="cl-lr-tile-l">Type</div>
              <div class="cl-lr-tile-v">{{ typeDisplay }}</div>
            </div>
          </div>
          <div class="cl-lr-tile">
            <span class="cl-lr-tile-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <div>
              <div class="cl-lr-tile-l">Registered</div>
              <div class="cl-lr-tile-v">{{ registeredDisplay }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lock note -->
      <div class="cl-lock-note">
        <div class="cl-lock-note-ic">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        </div>
        <div class="cl-lock-note-body">
          Next we'll verify <strong>your identity</strong> to confirm you're
          the registered owner. Takes about 2 minutes.
        </div>
      </div>

      <div class="cl-link-center" @click="step = 'search'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 4px">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Not the right property? Search again
      </div>

      <div v-if="verificationError" class="cl-err-banner">
        {{ verificationError }}
        <button class="cl-err-retry" @click="confirmProperty">Retry</button>
      </div>
    </div>

    <!-- ════════════════════════════ KYC EXPLAINER ════════════════════════════ -->
    <div v-else-if="step === 'kyc-explainer'" class="cl-screen cl-center-col">
      <div class="cl-icon-square cl-icon-lg"><img src="/op-icons/buyer-profile-build/idCard.png" alt="" loading="lazy" /></div>
      <h1 class="cl-h1">Before we build your Passport</h1>
      <p class="cl-body cl-mb-lg">
        We need to confirm who you are and that you own the property. Takes
        around 2 minutes — done once only.
      </p>

      <div class="cl-card cl-text-l cl-mb-sm">
        <div class="cl-eyebrow">What's involved</div>
        <div class="cl-row-list">
          <div class="cl-step-row">
            <div class="cl-step-ic"><img src="/op-icons/buyer-profile-build/idCard.png" alt="" loading="lazy" /></div>
            <div>
              <div class="cl-step-t">Photo ID</div>
              <div class="cl-step-s">Passport or driving licence</div>
            </div>
          </div>
          <div class="cl-step-row">
            <div class="cl-step-ic"><img src="/op-icons/misc/phoneSelfie.png" alt="" loading="lazy" /></div>
            <div>
              <div class="cl-step-t">Liveness check</div>
              <div class="cl-step-s">Quick selfie to confirm it's you</div>
            </div>
          </div>
          <div class="cl-step-row">
            <div class="cl-step-ic"><img src="/op-icons/calendar/shield.png" alt="" loading="lazy" /></div>
            <div>
              <div class="cl-step-t">AML screening</div>
              <div class="cl-step-s">Automatic check — takes seconds</div>
            </div>
          </div>
        </div>
      </div>

      <div class="cl-card-pale cl-text-l">
        <div class="cl-pale-row">
          <div class="cl-pale-ic"><img src="/op-icons/buyer-profile-build/stopwatch.png" alt="" loading="lazy" /></div>
          <div>
            <div class="cl-pale-t">Usually under 2 minutes</div>
            <div class="cl-pale-s">
              Powered by Persona — used by major UK fintechs.
            </div>
          </div>
        </div>
      </div>

      <!-- Polling state — shown after the user opens the Persona hosted flow -->
      <div v-if="personaPolling || personaInquiryId" class="cl-info-pale" style="margin-top: 14px;">
        <div class="cl-info-ic">{{ personaPolling ? '⏳' : '👋' }}</div>
        <div class="cl-info-body">
          <template v-if="personaPolling">
            Verification is open in a new tab. We'll continue automatically as
            soon as Persona finishes.
          </template>
          <template v-else>
            Finished in the verification tab? Tap <strong>Check now</strong>.
          </template>
          <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              type="button"
              class="cl-err-retry"
              :disabled="personaCheckingNow"
              @click="checkPersonaNow"
            >
              {{ personaCheckingNow ? 'Checking…' : 'Check now' }}
            </button>
            <button
              v-if="!personaPolling"
              type="button"
              class="cl-err-retry"
              style="background: transparent; color: #008a84;"
              @click="runPolling"
            >
              Resume auto-check
            </button>
          </div>
        </div>
      </div>

      <!-- Persona error banner -->
      <div v-if="personaError" class="cl-err-banner" style="margin-top: 12px;">
        {{ personaError }}
        <button class="cl-err-retry" @click="startPersonaKyc">Retry</button>
      </div>
    </div>

    <!-- ════════════════════════════ KYC ID UPLOAD ════════════════════════════ -->
    <div v-else-if="step === 'kyc-id'" class="cl-screen">
      <h1 class="cl-h2">Upload your photo ID</h1>
      <p class="cl-body cl-mb-lg">
        Passport or UK driving licence. All four corners visible, image clear.
      </p>

      <div class="cl-slot-label">Front</div>
      <div
        class="cl-slot cl-slot-front"
        :class="{ 'cl-slot-filled': idFrontUrl }"
        @click="triggerUpload('front')"
      >
        <img v-if="idFrontUrl" :src="idFrontUrl" class="cl-slot-thumb" />
        <template v-else>
          <div class="cl-slot-ic">📷</div>
          <div class="cl-slot-text">Tap to photograph front</div>
        </template>
        <div v-if="idFrontUrl" class="cl-slot-check">✓</div>
      </div>

      <div class="cl-slot-label">Back</div>
      <div
        class="cl-slot cl-slot-back"
        :class="{ 'cl-slot-filled': idBackUrl }"
        @click="triggerUpload('back')"
      >
        <img v-if="idBackUrl" :src="idBackUrl" class="cl-slot-thumb" />
        <template v-else>
          <div class="cl-slot-ic cl-slot-ic-muted">📷</div>
          <div class="cl-slot-text cl-slot-text-muted">
            Tap to photograph back
          </div>
        </template>
        <div v-if="idBackUrl" class="cl-slot-check">✓</div>
      </div>

      <input
        ref="idInputEl"
        type="file"
        accept="image/*"
        capture="environment"
        style="display: none"
        @change="onIdFile"
      />

      <div class="cl-card">
        <div class="cl-eyebrow cl-mb-xs">Accepted documents</div>
        <div class="cl-pills">
          <span class="cl-pill">🇬🇧 UK Passport</span>
          <span class="cl-pill">🪪 Driving Licence</span>
          <span class="cl-pill">🌍 EU Passport</span>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ KYC LIVENESS ════════════════════════════ -->
    <div v-else-if="step === 'kyc-liveness'" class="cl-screen cl-center-col">
      <div class="cl-live-wrap">
        <svg width="160" height="160" viewBox="0 0 160 160" class="cl-live-svg">
          <circle cx="80" cy="80" r="74" fill="none" stroke="#cff4f2" stroke-width="4" />
          <circle
            cx="80"
            cy="80"
            r="74"
            fill="none"
            stroke="#00a19a"
            stroke-width="4"
            stroke-dasharray="464"
            stroke-dashoffset="116"
            class="cl-live-ring"
          />
        </svg>
        <div class="cl-live-inner"><img src="/op-icons/misc/phoneSelfie.png" alt="" loading="lazy" /></div>
      </div>

      <h1 class="cl-h1">Quick selfie check</h1>
      <p class="cl-body cl-mb-lg">
        Look at the camera and follow the prompts. Takes about 20 seconds.
      </p>

      <div class="cl-card cl-text-l">
        <div class="cl-row-list cl-gap-sm">
          <div class="cl-num-row">
            <div class="cl-num">1</div>
            Face the camera straight on, in good light
          </div>
          <div class="cl-num-row">
            <div class="cl-num">2</div>
            Slowly turn your head left, then right
          </div>
          <div class="cl-num-row">
            <div class="cl-num">3</div>
            Hold still — we'll capture automatically
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ KYC AML ════════════════════════════ -->
    <div v-else-if="step === 'kyc-aml'" class="cl-screen cl-center-col">
      <div class="cl-icon-square cl-icon-lg"><img src="/op-icons/calendar/shield.png" alt="" loading="lazy" /></div>
      <h1 class="cl-h1">Almost there</h1>
      <p class="cl-body cl-mb-lg">
        Automatic check against sanctions lists and PEP registers. Happens
        instantly.
      </p>

      <div class="cl-card cl-text-l cl-mb-sm">
        <div class="cl-row-list cl-gap-sm">
          <div class="cl-aml-row">
            <div class="cl-aml-label">Sanctions list check</div>
            <span class="cl-pill-good">✓ Clear</span>
          </div>
          <div class="cl-aml-row">
            <div class="cl-aml-label">PEP screening</div>
            <span class="cl-pill-good">✓ Clear</span>
          </div>
          <div class="cl-aml-row">
            <div class="cl-aml-label">Adverse media</div>
            <span class="cl-pill-good">✓ Clear</span>
          </div>
        </div>
      </div>

      <div class="cl-card-pale cl-text-l">
        <div class="cl-pale-row">
          <div class="cl-pale-ic-sm"><img src="/op-icons/investment/padlock.png" alt="" loading="lazy" /></div>
          <div class="cl-pale-s">
            AML checks are required by UK regulations. Data processed securely.
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ KYC VERIFIED (fullscreen) ════════════════════════════ -->
    <div v-else-if="step === 'kyc-verified'" class="cl-screen cl-center-full">
      <img
        src="/op-icons/claim/bigCheckHero.png"
        alt=""
        class="cl-big-check-illus"
        loading="lazy"
      />
      <h1 class="cl-h1 cl-center">Identity verified!</h1>
      <p class="cl-body cl-center cl-mb-lg">
        You've passed AML and identity checks. Now let's confirm your property
        ownership via Land Registry.
      </p>
      <div class="cl-pill-row">
        <span class="cl-pill-good">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          ID validated
        </span>
        <span class="cl-pill-good">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Liveness passed
        </span>
        <span class="cl-pill-good">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          AML clear
        </span>
      </div>

      <div class="cl-next-card cl-w-full">
        <img
          src="/op-icons/claim/lrTitleBank.png"
          alt=""
          class="cl-next-card-illus"
          loading="lazy"
        />
        <div>
          <div class="cl-next-card-t">Next: Land Registry check</div>
          <div class="cl-next-card-s">
            We confirm ownership matches your verified identity.
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ LR SEARCHING (fullscreen) ════════════════════════════ -->
    <div v-else-if="step === 'lr-searching'" class="cl-screen cl-center-full">
      <div class="cl-lr-pulse-wrap">
        <div class="cl-lr-pulse" />
        <img
          src="/op-icons/claim/bankHero.png"
          alt=""
          class="cl-lr-bank"
          loading="lazy"
        />
      </div>
      <h1 class="cl-h1 cl-center">Searching Land Registry</h1>
      <p class="cl-body cl-center cl-mb-lg">
        Checking HM Land Registry for<br />
        <strong>{{ lrAddressDisplay }}</strong>
      </p>

      <div class="cl-lr-timeline cl-w-full">
        <div
          class="cl-lr-tstep"
          :class="{
            'cl-lr-tstep--done': lrStep >= 1,
            'cl-lr-tstep--active': lrStep === 0,
          }"
        >
          <div class="cl-lr-tdot">
            <svg v-if="lrStep >= 1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-else class="cl-lr-tdot-inner" />
          </div>
          <div class="cl-lr-tbody">
            <div class="cl-lr-tt">Address matched to title number</div>
            <div class="cl-lr-ts">{{ lrStep >= 1 ? lrStamp(1) : 'Pending' }}</div>
          </div>
        </div>
        <div
          class="cl-lr-tstep"
          :class="{
            'cl-lr-tstep--done': lrStep >= 2,
            'cl-lr-tstep--active': lrStep === 1,
          }"
        >
          <div class="cl-lr-tdot">
            <svg v-if="lrStep >= 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-else-if="lrStep === 1" class="cl-lr-tdot-inner" />
          </div>
          <div class="cl-lr-tbody">
            <div class="cl-lr-tt">Title register retrieved</div>
            <div class="cl-lr-ts">
              {{ lrStep >= 2 ? lrStamp(2) : lrStep === 1 ? 'In progress…' : 'Pending' }}
            </div>
          </div>
        </div>
        <div
          class="cl-lr-tstep cl-lr-tstep--last"
          :class="{
            'cl-lr-tstep--done': lrStep >= 3,
            'cl-lr-tstep--active': lrStep === 2,
          }"
        >
          <div class="cl-lr-tdot">
            <svg v-if="lrStep >= 3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-else-if="lrStep === 2" class="cl-lr-tdot-inner" />
          </div>
          <div class="cl-lr-tbody">
            <div class="cl-lr-tt">Matching proprietor to identity</div>
            <div class="cl-lr-ts">
              {{ lrStep >= 3 ? lrStamp(3) : lrStep === 2 ? 'In progress…' : 'Pending' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Your data is secure card -->
      <div class="cl-secure cl-w-full">
        <div class="cl-secure-lock">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        </div>
        <div class="cl-secure-body">
          <div class="cl-secure-t">Your data is secure</div>
          <div class="cl-secure-s">
            We use encrypted connections to the HM Land Registry. Your
            information is never stored.
          </div>
        </div>
        <div class="cl-secure-shield">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ LR FOUND ════════════════════════════ -->
    <div v-else-if="step === 'lr-found'" class="cl-screen">
      <!-- Top banner: 3D teal square check + verified message -->
      <div class="cl-owned">
        <img
          src="/op-icons/claim/ownershipCheck.png"
          alt=""
          class="cl-owned-illus"
          loading="lazy"
        />
        <div>
          <div class="cl-owned-t">Ownership verified</div>
          <div class="cl-owned-s">Name matches Land Registry record</div>
        </div>
      </div>

      <!-- Section header with 3D bank icon -->
      <div class="cl-owned-header">
        <img
          src="/op-icons/claim/lrTitleBank.png"
          alt=""
          class="cl-owned-header-illus"
          loading="lazy"
        />
        <div class="cl-owned-header-t">Land Registry title data</div>
      </div>

      <!-- Data rows with SVG icons on the left -->
      <div class="cl-data-rows">
        <div class="cl-data-row">
          <span class="cl-data-ic cl-data-ic--img">
            <img src="/op-icons/buyer-passport/titleNumber.png" alt="" loading="lazy" />
          </span>
          <span class="cl-data-l">Title number</span>
          <span class="cl-data-v">{{ titleDisplay }}</span>
        </div>
        <div class="cl-data-row">
          <span class="cl-data-ic cl-data-ic--img">
            <img src="/op-icons/buyer-passport/tenure.png" alt="" loading="lazy" />
          </span>
          <span class="cl-data-l">Tenure</span>
          <span class="cl-data-v">{{ tenureDisplay }}</span>
        </div>
        <div class="cl-data-row">
          <span class="cl-data-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </span>
          <span class="cl-data-l">Proprietor</span>
          <span class="cl-data-v cl-data-v--good">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ proprietorDisplay }}
          </span>
        </div>
        <div class="cl-data-row">
          <span class="cl-data-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <span class="cl-data-l">Registered</span>
          <span class="cl-data-v">{{ registeredDisplay }}</span>
        </div>
        <div class="cl-data-row cl-data-row--last">
          <span class="cl-data-ic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
          </span>
          <span class="cl-data-l">Charges</span>
          <span class="cl-data-v">Not available</span>
        </div>
      </div>

      <!-- Maxine confirmed card -->
      <div class="cl-name-card cl-mb-sm">
        <img
          src="/op-icons/claim/maxineShield.png"
          alt=""
          class="cl-name-card-illus"
          loading="lazy"
        />
        <div>
          <div class="cl-name-card-t">{{ proprietorDisplay }} — confirmed</div>
          <div class="cl-name-card-s">
            Your KYC-verified name matches the registered proprietor.<br />
            Your Passport is ready.
          </div>
        </div>
      </div>

      <div v-if="issueError" class="cl-err-banner">
        <span>{{ issueError }}</span>
        <NuxtLink
          v-if="issueError.toLowerCase().includes('phone')"
          to="/profile/personal-information"
          class="cl-err-link"
        >
          Add phone number →
        </NuxtLink>
        <button v-else class="cl-err-retry" @click="issuePassport">Retry</button>
      </div>
    </div>

    <!-- ════════════════════════════ LR FAILED ════════════════════════════ -->
    <div v-else-if="step === 'lr-failed'" class="cl-screen cl-center-full">
      <div class="cl-lr-pulse-wrap">
        <div class="cl-lr-inner" style="background: #fef2f2; color: #b91c1c">⚠️</div>
      </div>
      <h1 class="cl-h1 cl-center">Ownership not confirmed</h1>
      <p class="cl-body cl-center cl-mb-lg" style="max-width: 320px">
        {{ lrErrorMessage || 'HM Land Registry could not confirm you own this property.' }}
      </p>

      <div
        v-if="lrResult?.status === 'ADDITIONAL_INFO_NEEDED' || lrResult?.matchResult === 'NO_MATCHES'"
        class="cl-card cl-mb-sm cl-w-full"
        style="max-width: 360px"
      >
        <div class="cl-eyebrow cl-mb-sm">What HM Land Registry returned</div>
        <div class="cl-lrf-rows">
          <div v-if="lrResult?.titleNumber" class="cl-lrf-row">
            <span class="cl-lrf-l">Title number</span>
            <span class="cl-lrf-v">{{ lrResult.titleNumber }}</span>
          </div>
          <div v-if="lrResult?.matchResult" class="cl-lrf-row">
            <span class="cl-lrf-l">Match result</span>
            <span class="cl-lrf-v">{{ lrResult.matchResult }}</span>
          </div>
          <div v-if="lrResult?.historical" class="cl-lrf-row">
            <span class="cl-lrf-l">Status</span>
            <span class="cl-lrf-v">Historical proprietor</span>
          </div>
        </div>
      </div>

      <div class="cl-w-full" style="max-width: 360px; display: flex; gap: 8px">
        <button
          class="cl-btn-ghost"
          style="flex: 1"
          @click="step = 'search'"
        >
          Try another property
        </button>
        <button
          class="cl-btn-brand"
          style="flex: 1"
          @click="runLrSearch()"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- ════════════════════════════ OWNER-CLAIM PAYMENT ════════════════════════════ -->
    <div v-else-if="step === 'payment'" class="cl-screen">
      <div class="cl-owned">
        <img
          src="/op-icons/claim/lrTitleBank.png"
          alt=""
          class="cl-owned-illus"
          loading="lazy"
        />
        <div>
          <div class="cl-owned-t">One more step</div>
          <div class="cl-owned-s">{{ claimPriceReason }}</div>
        </div>
      </div>

      <div class="cl-card cl-mb-sm">
        <div class="cl-eyebrow cl-mb-sm">Why there's a fee</div>
        <p class="cl-body" style="margin: 0">
          Identity checks and HM Land Registry ownership lookups cost us
          real money per property. This one-off fee covers exactly what
          this claim used — {{ claimPriceReason.toLowerCase() }}.
        </p>
      </div>

      <div class="cl-card cl-mb-sm">
        <div class="cl-lrf-rows">
          <div class="cl-lrf-row">
            <span class="cl-lrf-l">Verification fee</span>
            <span class="cl-lrf-v">{{ claimPriceDisplay }}</span>
          </div>
        </div>
      </div>

      <div class="cl-card cl-mb-sm">
        <div class="cl-eyebrow cl-mb-sm">Card details</div>
        <div id="claim-stripe-card-element" class="cl-stripe-box" />
      </div>

      <div v-if="paymentError" class="cl-err-banner">
        <span>{{ paymentError }}</span>
      </div>

      <button
        class="cl-btn-brand cl-w-full"
        :disabled="paymentLoading || !cardReady"
        @click="payClaimFee"
      >
        <span v-if="paymentLoading" class="cl-btn-spinner" />
        <template v-else>Pay {{ claimPriceDisplay }} securely →</template>
      </button>
    </div>

    <!-- ════════════════════════════ BOTTOM CTA BAR ════════════════════════════ -->
    <div v-if="showCta" class="cl-cta-bar">
      <button
        class="cl-btn-brand"
        :disabled="ctaDisabled"
        @click="onPrimary"
      >
        <span v-if="ctaLoading" class="cl-btn-spinner" />
        {{ ctaLabel }}
      </button>
    </div>

    <ClaimPassportTypeDrawer
      v-model="showTypeDrawer"
      @confirm="onPassportTypeConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Stripe, StripeCardElement } from '@stripe/stripe-js'
import PropertySearchInput from '~/components/property/PropertySearchInput.vue'

definePageMeta({ middleware: 'auth' })

type ClaimStep =
  | 'search'
  | 'confirm'
  | 'kyc-explainer'
  | 'kyc-id'
  | 'kyc-liveness'
  | 'kyc-aml'
  | 'kyc-verified'
  | 'lr-searching'
  | 'lr-found'
  | 'lr-failed'
  | 'payment'

import ClaimPassportTypeDrawer from '~/components/property/ClaimPassportTypeDrawer.vue'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// Passport-type gate. Always shown before the actual claim happens, even if
// the user's role preference suggests one or the other.
const showTypeDrawer = ref(false)
const chosenPassportType = ref<'seller' | 'landlord' | null>(null)
const chosenIsHmo = ref(false)
function onPassportTypeConfirmed(payload: { type: 'seller' | 'landlord'; isHmo: boolean }) {
  chosenPassportType.value = payload.type
  chosenIsHmo.value = payload.isHmo
  showTypeDrawer.value = false
  // Resume the claim only if the user is already at the final step. When the
  // drawer is shown at mount-time (the common case), the user still needs to
  // walk through search → confirm → KYC; their choice is just persisted.
  if (step.value === 'lr-found') {
    issuePassport()
  }
}
const base = config.public.apiBase as string

const propertyId = route.params.id as string
const step = ref<ClaimStep>('search')
const selectedProperty = ref<any>(null)

// KYC state
const idInputEl = ref<HTMLInputElement | null>(null)
const idUploadSide = ref<'front' | 'back'>('front')
const idFrontFile = ref<File | null>(null)
const idBackFile = ref<File | null>(null)
const idFrontUrl = ref<string>('')
const idBackUrl = ref<string>('')

// Liveness state
const livenessAnalysing = ref(false)

// LR state
const lrStep = ref(0)
const lrStepStamps = ref<Record<number, string>>({})
function lrStamp(step: number): string {
  if (lrStepStamps.value[step]) return lrStepStamps.value[step]
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const s = `${hh}:${mm}`
  lrStepStamps.value[step] = s
  return s
}

// Verification / issue errors
const verificationError = ref('')
const verifyLoading = ref(false)
const issueError = ref('')
const issueLoading = ref(false)

// Profile (for proprietor name)
const userFullName = ref<string>('')

// ── Helpers ──────────────────────────────────────────────────
function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}
function authHeaders() {
  return {
    Authorization: `Bearer ${token()}`,
    'Content-Type': 'application/json',
  }
}

async function loadProperty() {
  if (!propertyId || propertyId === 'new') return
  try {
    const data = await $fetch<any>(`${base}/property/${propertyId}`)
    if (data && data.id) {
      selectedProperty.value = data
      step.value = 'confirm'
    }
  } catch {
    // Property not found — remain on search step
  }
}

async function loadProfile() {
  try {
    const p = await $fetch<any>(`${base}/profile/me`, {
      headers: { Authorization: `Bearer ${token()}` },
    })
    const n = [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim()
    userFullName.value = n || p?.email || 'Property owner'
  } catch {
    userFullName.value = 'Property owner'
  }
}

onMounted(async () => {
  // Persona return path — user just finished (or cancelled) the hosted
  // KYC flow and Persona redirected them back to this page with
  // `?kycreturn=1`. Restore the stored inquiry id and jump straight to
  // polling so we settle without them having to tap anything. If the
  // marker is stale (different property, or older than 30 min) we
  // ignore it and fall through to the normal claim flow.
  const url = new URL(window.location.href)
  if (url.searchParams.get('kycreturn') === '1') {
    try {
      const raw = localStorage.getItem('umu_persona_return')
      if (raw) {
        const saved = JSON.parse(raw)
        const fresh = Date.now() - Number(saved?.startedAt ?? 0) < 30 * 60_000
        if (fresh && saved?.propertyId === propertyId && saved?.inquiryId) {
          personaInquiryId.value = saved.inquiryId
          step.value = 'kyc-explainer'
          // Strip the query param so a refresh doesn't re-enter this path.
          url.searchParams.delete('kycreturn')
          window.history.replaceState({}, '', url.toString())
          // Fire polling without awaiting so the type drawer + property
          // load below still happen in parallel.
          runPolling()
        }
      }
    } catch { /* corrupt localStorage — fall through to normal flow */ }
  }

  // First thing: ask the user which type of passport they're claiming.
  // Always shown — even if their profile role suggests one — so they can
  // override per-property (a landlord might still claim a seller passport).
  showTypeDrawer.value = true
  await Promise.all([loadProperty(), loadProfile()])
})

// ── Topbar logic ──────────────────────────────────────────────
const isFullscreenStep = computed(() =>
  ['lr-searching'].includes(step.value),
)
const showCta = computed(
  () => !['lr-searching', 'lr-failed', 'payment'].includes(step.value),
)

const stepMeta: Record<
  ClaimStep,
  { title: string; sub?: string; pct: number }
> = {
  search: { title: 'Find your property', sub: 'Step 1 of 2', pct: 50 },
  confirm: { title: 'Confirm property', sub: 'Step 2 of 2', pct: 100 },
  'kyc-explainer': { title: 'Verify identity', sub: 'Step 1 of 4', pct: 25 },
  'kyc-id': { title: 'Photo ID', sub: 'Step 2 of 4', pct: 50 },
  'kyc-liveness': { title: 'Liveness check', sub: 'Step 3 of 4', pct: 75 },
  'kyc-aml': { title: 'AML screening', sub: 'Step 4 of 4', pct: 95 },
  'kyc-verified': { title: 'Identity verified', pct: 100 },
  'lr-searching': { title: 'Searching Land Registry', pct: 100 },
  'lr-found': { title: 'Ownership confirmed', pct: 100 },
  'lr-failed': { title: 'Ownership not confirmed', pct: 100 },
  payment: { title: 'Verification fee', pct: 100 },
}
const topbarTitle = computed(() => stepMeta[step.value].title)
const topbarSub = computed(() => stepMeta[step.value].sub)
const progressPct = computed(() => stepMeta[step.value].pct)

// HM Land Registry verification result — set by runLrSearch() after the
// real /land-registry-check call returns. Fields below prefer this over
// fallbacks from selectedProperty when the live check has data.
interface LrCheckResult {
  status: 'VERIFIED' | 'ADDITIONAL_INFO_NEEDED' | 'FAILED' | 'IN_PROGRESS'
  typeCode?: number
  matchResult?: string
  titleNumber?: string
  ownership?: string
  historical?: boolean
  rejection?: { reason?: string; code?: string }
  acknowledgement?: { expectedResponseDateTime?: string }
  messageId?: string
}
const lrResult = ref<LrCheckResult | null>(null)
const lrErrorMessage = ref('')

// ── Display fields (prefer live HMLR result, fall back to selectedProperty) ──
const tenureDisplay = computed(
  () => selectedProperty.value?.tenure || '—',
)
const titleDisplay = computed(
  () =>
    lrResult.value?.titleNumber ||
    selectedProperty.value?.titleNumber ||
    '—',
)
const typeDisplay = computed(
  () => selectedProperty.value?.propertyType || '—',
)
const registeredDisplay = computed(() => {
  const d = selectedProperty.value?.createdAt
  if (!d) return '—'
  try {
    const date = new Date(d)
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  } catch {
    return '—'
  }
})
const proprietorDisplay = computed(
  () => userFullName.value || 'Property owner',
)
const ownershipDisplay = computed(
  () => lrResult.value?.ownership || '—',
)
const lrAddressDisplay = computed(() => {
  const a1 = selectedProperty.value?.addressLine1 || 'your property'
  const pc = selectedProperty.value?.postcode || ''
  return pc ? `${a1}, ${pc}` : a1
})

// ── Search step ───────────────────────────────────────────────
function onPropertySelect(p: any) {
  selectedProperty.value = p
}
function clearSelection() {
  selectedProperty.value = null
}

// ── Back button ───────────────────────────────────────────────
function onBack() {
  switch (step.value) {
    case 'search':
      router.back()
      return
    case 'confirm':
      step.value = 'search'
      return
    case 'kyc-explainer':
      step.value = 'confirm'
      return
    case 'kyc-id':
      step.value = 'kyc-explainer'
      return
    case 'kyc-liveness':
      step.value = 'kyc-id'
      return
    case 'kyc-aml':
      step.value = 'kyc-liveness'
      return
    case 'kyc-verified':
      // Not 'kyc-aml' — that's a legacy simulated screen unreachable with
      // the real Persona flow wired in, and this step can also be reached
      // directly from 'confirm' when KYC was already approved (no
      // kyc-explainer/kyc-aml ever visited this attempt). 'confirm' is
      // always a valid prior step regardless of which path got here.
      step.value = 'confirm'
      return
    case 'lr-found':
      step.value = 'kyc-verified'
      return
    case 'payment':
      step.value = 'lr-found'
      return
    default:
      router.back()
  }
}

// ── KYC: ID upload ────────────────────────────────────────────
function triggerUpload(side: 'front' | 'back') {
  idUploadSide.value = side
  idInputEl.value?.click()
}
function onIdFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const f = input.files?.[0]
  if (!f) return
  const url = URL.createObjectURL(f)
  if (idUploadSide.value === 'front') {
    idFrontFile.value = f
    idFrontUrl.value = url
  } else {
    idBackFile.value = f
    idBackUrl.value = url
  }
  // Allow re-selecting the same file later
  input.value = ''
}

// ── CTA label / action per step ───────────────────────────────
const ctaLabel = computed(() => {
  switch (step.value) {
    case 'search':
      return 'Confirm address →'
    case 'confirm':
      return verifyLoading.value ? 'Starting…' : 'Yes, this is my property →'
    case 'kyc-explainer':
      return personaPolling.value ? 'Verifying…' : 'Start identity check →'
    case 'kyc-id':
      return 'Continue →'
    case 'kyc-liveness':
      return livenessAnalysing.value ? 'Analysing…' : 'Open camera →'
    case 'kyc-aml':
      return 'Complete verification →'
    case 'kyc-verified':
      return 'Verify property ownership →'
    case 'lr-found':
      return issueLoading.value ? 'Issuing…' : 'Issue my Passport →'
    default:
      return 'Continue →'
  }
})
const ctaDisabled = computed(() => {
  if (
    verifyLoading.value ||
    livenessAnalysing.value ||
    issueLoading.value ||
    personaPolling.value
  )
    return true
  switch (step.value) {
    case 'search':
      return !selectedProperty.value
    case 'kyc-id':
      return !idFrontFile.value
    default:
      return false
  }
})
const ctaLoading = computed(
  () =>
    verifyLoading.value ||
    livenessAnalysing.value ||
    issueLoading.value ||
    personaPolling.value,
)

function onPrimary() {
  switch (step.value) {
    case 'search':
      step.value = 'confirm'
      return
    case 'confirm':
      confirmProperty()
      return
    case 'kyc-explainer':
      // Real Persona flow — opens hosted page in a new tab and polls for completion.
      startPersonaKyc()
      return
    case 'kyc-id':       // Legacy simulated screens — unreachable when Persona is wired.
    case 'kyc-liveness':
    case 'kyc-aml':
      step.value = 'kyc-verified'
      return
    case 'kyc-verified':
      step.value = 'lr-searching'
      return
    case 'lr-found':
      issuePassport()
      return
  }
}

// ── confirm → start-verification → kyc-explainer (or skip if already verified) ─────────────
async function confirmProperty() {
  verificationError.value = ''
  if (!selectedProperty.value?.id) {
    step.value = 'kyc-explainer'
    return
  }
  verifyLoading.value = true
  try {
    await $fetch(
      `${base}/property/${selectedProperty.value.id}/start-verification`,
      { method: 'POST', headers: authHeaders() },
    )

    // Per-user KYC: if the user has already passed Persona on a previous
    // claim, jump straight past identity verification.
    try {
      const { getKycStatus } = useKyc()
      const r = await getKycStatus()
      if (r.status === 'approved') {
        step.value = 'kyc-verified'
        return
      }
    } catch {
      // If status lookup fails, fall through to the explainer screen.
    }

    step.value = 'kyc-explainer'
  } catch (e: any) {
    verificationError.value =
      e?.data?.message || 'Could not start verification. Please try again.'
  } finally {
    verifyLoading.value = false
  }
}

// ── Persona KYC: open hosted flow + poll until settled ──────────
const personaError = ref('')
const personaPolling = ref(false)
const personaInquiryId = ref<string | null>(null)
const personaCheckingNow = ref(false)
let personaAbort: AbortController | null = null

async function startPersonaKyc() {
  personaError.value = ''
  personaPolling.value = true
  const { startKyc } = useKyc()
  try {
    const start = await startKyc()
    if (start.alreadyVerified || start.status === 'approved') {
      step.value = 'kyc-verified'
      return
    }
    if (!start.hostedUrl) {
      personaError.value = 'Could not open the verification page.'
      personaPolling.value = false
      return
    }
    personaInquiryId.value = start.inquiryId

    // Same-tab navigation to Persona's hosted flow. The previous
    // implementation used `window.open(url, '_blank')`, which iOS
    // Safari + TestFlight's WKWebView block as a popup even with
    // the popup blocker turned off — the browser only lets popups
    // through if they're opened SYNCHRONOUSLY inside a user gesture,
    // and our `await startKyc()` breaks that gesture chain. Same-tab
    // navigation is never blocked and works identically across
    // desktop Safari, iOS Safari, Android Chrome, and native WebView.
    //
    // `redirect-uri` tells Persona where to send the user when they
    // finish. We come back to the same claim page with a marker
    // query so onMounted knows to jump straight to polling. Inquiry
    // id is persisted so we can pick it up on the return trip.
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'umu_persona_return',
          JSON.stringify({
            propertyId,
            inquiryId: start.inquiryId,
            startedAt: Date.now(),
          }),
        )
      } catch { /* localStorage may be full; polling will still work */ }
    }
    const returnUrl = `${window.location.origin}/claim/${propertyId}?kycreturn=1`
    const separator = start.hostedUrl.includes('?') ? '&' : '?'
    const hostedWithReturn = `${start.hostedUrl}${separator}redirect-uri=${encodeURIComponent(returnUrl)}`
    window.location.href = hostedWithReturn
  } catch (e: any) {
    personaError.value =
      e?.data?.message || e?.message || 'Verification could not start.'
    personaPolling.value = false
  }
}

async function runPolling() {
  const { pollUntilSettled } = useKyc()
  personaError.value = ''
  personaPolling.value = true
  personaAbort?.abort()
  personaAbort = new AbortController()
  try {
    const finalStatus = await pollUntilSettled({
      intervalMs: 3000,
      maxAttempts: 100, // ≈ 5 minutes at 3s each
      signal: personaAbort.signal,
    })
    if (finalStatus === 'approved') {
      step.value = 'kyc-verified'
      personaError.value = ''
    } else if (finalStatus === 'declined' || finalStatus === 'failed') {
      personaError.value =
        'Identity verification failed. Please retry or contact support.'
    } else if (finalStatus === 'needs_review') {
      personaError.value =
        "Your details need a manual review — we'll email you when it's done."
    }
  } catch (e: any) {
    if (e?.message === 'timeout') {
      personaError.value =
        "We're still waiting for the verification result. If you've finished, tap \"Check now\"."
    } else if (e?.message !== 'Polling aborted') {
      personaError.value =
        e?.data?.message || e?.message || 'Could not check status.'
    }
  } finally {
    personaPolling.value = false
  }
}

// Manual "I'm done — check now" button. Hits /kyc/status once and acts on it.
async function checkPersonaNow() {
  if (personaCheckingNow.value) return
  personaCheckingNow.value = true
  personaError.value = ''
  try {
    const { getKycStatus } = useKyc()
    const r = await getKycStatus()
    if (r.status === 'approved') {
      personaAbort?.abort()
      step.value = 'kyc-verified'
    } else if (r.status === 'declined' || r.status === 'failed') {
      personaError.value =
        'Identity verification failed. Please retry or contact support.'
    } else if (r.status === 'needs_review') {
      personaError.value =
        "Your details need a manual review — we'll email you when it's done."
    } else if (r.status === 'pending') {
      personaError.value =
        "We can't see your result yet — Persona usually takes a few seconds. Try again in a moment."
    } else {
      personaError.value = "We haven't received a verification result yet."
    }
  } catch (e: any) {
    personaError.value = e?.data?.message || e?.message || 'Could not check status.'
  } finally {
    personaCheckingNow.value = false
  }
}

onBeforeUnmount(() => {
  personaAbort?.abort()
  if (typeof window !== 'undefined') {
    document.removeEventListener('visibilitychange', onTabVisible)
    window.removeEventListener('focus', onTabVisible)
  }
})

// Safety net for the "returned to our tab but the poll loop had died"
// case. pollUntilSettled inside useKyc already resumes on visibility,
// but if the loop terminated (transient network error before this fix,
// or a WebView that swallowed all wake events), this restarts it
// automatically. Only fires while the user is still on a KYC step
// with a live inquiry — otherwise it's a no-op.
function onTabVisible() {
  if (typeof document === 'undefined') return
  if (document.visibilityState !== 'visible') return
  const onKycStep =
    step.value === 'kyc-explainer' ||
    step.value === 'kyc-id' ||
    step.value === 'kyc-liveness' ||
    step.value === 'kyc-aml'
  if (!onKycStep) return
  if (!personaInquiryId.value) return
  if (personaPolling.value) return
  runPolling()
}

onMounted(() => {
  if (typeof window === 'undefined') return
  document.addEventListener('visibilitychange', onTabVisible)
  window.addEventListener('focus', onTabVisible)
})

// ── Liveness simulated delay ──────────────────────────────────
async function doLiveness() {
  livenessAnalysing.value = true
  await new Promise((r) => setTimeout(r, 1500))
  livenessAnalysing.value = false
  step.value = 'kyc-aml'
}

// Whenever we land on kyc-verified, force every "loading" flag off.
// runPolling's finally block resets personaPolling on its own path,
// but there are still failure modes that can leave it stuck
// (browser BFCache restore mid-await, watchers firing before the
// finally resolves, native WebView pausing the JS event loop while
// Persona's redirect is in flight) — the symptom is a permanent
// spinner on the "Verify property ownership →" button that stops
// the user tapping through to LR. Belt-and-braces: kyc-verified is
// a terminal state for anything KYC-related, so no loading flag
// should survive past it.
watch(
  () => step.value,
  (s) => {
    if (s === 'kyc-verified') {
      personaPolling.value = false
      personaCheckingNow.value = false
      verifyLoading.value = false
      personaAbort?.abort()
    }
    if (s === 'lr-searching') runLrSearch()
  },
)
async function runLrSearch() {
  lrStep.value = 0
  lrResult.value = null
  lrErrorMessage.value = ''
  const pId = selectedProperty.value?.id
  if (!pId) {
    lrErrorMessage.value = 'No property selected.'
    step.value = 'lr-failed'
    return
  }

  // Animate the first two pacing steps while the real call is in flight
  // so the user never sees an idle spinner. The animation is deliberately
  // slower than the real call most of the time — if HMLR is faster, we
  // still let the user see the address-matched / register-retrieved beats.
  const animation = (async () => {
    await new Promise((r) => setTimeout(r, 600))
    if (step.value === 'lr-searching') lrStep.value = 1
    await new Promise((r) => setTimeout(r, 700))
    if (step.value === 'lr-searching') lrStep.value = 2
  })()

  // Real Business Gateway Online Owner Verification call.
  //   Dev/sandbox: append `?lr=eoov-fm-1` to the URL to pin a stub scenario.
  const lrScenario = (route.query?.lr as string | undefined)?.trim()
  let result: LrCheckResult
  try {
    result = await $fetch<LrCheckResult>(
      `${base}/property/${pId}/land-registry-check`,
      {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: lrScenario ? { messageId: lrScenario } : {},
      },
    )
  } catch (e: any) {
    lrErrorMessage.value =
      e?.data?.message ||
      e?.message ||
      "We couldn't reach HM Land Registry. Please try again."
    step.value = 'lr-failed'
    return
  }

  // Make sure the animation has at least played the first two beats so the
  // UI doesn't snap straight to the result.
  await animation
  lrResult.value = result

  if (result.status === 'VERIFIED') {
    lrStep.value = 3
    await new Promise((r) => setTimeout(r, 500))
    if (step.value === 'lr-searching') step.value = 'lr-found'
    return
  }

  // Anything else — render the actionable failure screen.
  lrErrorMessage.value = describeLrFailure(result)
  step.value = 'lr-failed'
}

// Map an HMLR land-registry-check verdict into a user-facing message.
// We surface enough detail that the user (or our support team) can act on
// it — the full match record is in the backend audit log if they need more.
function describeLrFailure(lr: {
  status: string
  matchResult?: string
  rejection?: { reason?: string; code?: string }
  acknowledgement?: { expectedResponseDateTime?: string }
  historical?: boolean
  titleNumber?: string
}): string {
  if (lr.status === 'IN_PROGRESS') {
    const eta = lr.acknowledgement?.expectedResponseDateTime
    return (
      'HM Land Registry is currently out of service hours — we\'ve queued ' +
      'your ownership check' +
      (eta ? ` (expected back by ${eta})` : '') +
      '. Please try again shortly.'
    )
  }
  if (lr.status === 'ADDITIONAL_INFO_NEEDED') {
    if (lr.matchResult === 'MULTIPLE_MATCHES') {
      return (
        "HM Land Registry returned multiple possible titles for this " +
        "address. Please contact support so we can confirm the right one."
      )
    }
    if (lr.historical) {
      return (
        'HM Land Registry shows your name on this title historically, but ' +
        "you're no longer listed as the current owner. If you've recently " +
        'sold or transferred this property, that\'s expected.'
      )
    }
    return (
      "We found a partial match against HM Land Registry but couldn't " +
      'fully confirm ownership. Double-check the name on your profile ' +
      'matches the name on the title deeds, then try again.'
    )
  }
  if (lr.status === 'FAILED') {
    if (lr.rejection?.code === 'bg.postcode.invalid') {
      return 'HM Land Registry didn\'t accept the property postcode. Please correct it on the property and try again.'
    }
    if (lr.rejection?.code === 'bg.properties.nopropertyfound') {
      return 'HM Land Registry couldn\'t find a title at this address. Double-check the address details.'
    }
    if (lr.rejection?.reason) {
      return `HM Land Registry rejected the check: ${lr.rejection.reason}`
    }
    if (lr.matchResult === 'NO_MATCHES') {
      return (
        "Your name doesn't match the registered owner of this property on " +
        "HM Land Registry. If this is wrong (e.g. you bought it recently " +
        "and the register hasn't updated), please contact support."
      )
    }
    return 'HM Land Registry could not confirm your ownership of this property. Please contact support.'
  }
  return 'Ownership check did not succeed. Please try again.'
}

// ── Issue passport (HM Land Registry verification + claim) ────────
async function issuePassport() {
  issueError.value = ''
  const pId = selectedProperty.value?.id
  if (!pId) {
    issueError.value = 'No property selected.'
    return
  }
  issueLoading.value = true
  try {
    // HM Land Registry verification has already run during the lr-searching
    // step — runLrSearch() blocks the user from reaching here unless the
    // verdict was VERIFIED. Belt-and-braces guard in case state got out of
    // sync (e.g. via deep-link / back-nav).
    if (lrResult.value?.status !== 'VERIFIED') {
      issueError.value =
        'Ownership has not been verified against HM Land Registry yet.'
      issueLoading.value = false
      return
    }

    // Gate the claim on the user's passport-type pick.
    // We deliberately do NOT short-circuit on getPassportStatus() here:
    // that endpoint only returns SELLER passports (it's buyer-facing), so
    // reusing its id would land a landlord claim on a seller passport.
    // The backend's createPassport dedupes per (owner, property, type)
    // and returns the existing same-type passport if one already exists.
    if (!chosenPassportType.value) {
      issueLoading.value = false
      showTypeDrawer.value = true
      return
    }
    const { claimPassport } = usePassportClaim()
    const res = await claimPassport(
      pId,
      selectedProperty.value?.addressLine1 ?? '',
      selectedProperty.value?.postcode ?? '',
      { type: chosenPassportType.value, isHmo: chosenIsHmo.value },
    )
    const passportId = res.passportId
    if (!passportId) throw new Error('Passport could not be created')

    // KYC + HM Land Registry checks both cost us real money — a fresh
    // property claim comes back PENDING_PAYMENT and needs the owner-claim
    // fee paid before its sections are seeded. An already-active passport
    // (resumed draft, or the free manual/convert path) skips straight to
    // navigation.
    if (res.status === 'PENDING_PAYMENT') {
      claimPassportId.value = passportId
      await openPaymentStep(passportId)
      return
    }

    finishAndNavigate(passportId)
  } catch (e: any) {
    issueError.value =
      e?.data?.message ||
      e?.message ||
      'Could not issue your Passport. Please try again.'
  } finally {
    issueLoading.value = false
  }
}

// 3) Where to send the user next, once the passport is actually active?
//
//   - If a `?next=…` was passed (e.g. they entered the claim chain from
//     "Publish to your street" or "Boost your score" on /homescore), honour
//     it so the user lands back on that screen, now as a verified owner.
//   - Otherwise fall through to the canonical passport view for the type
//     of passport that was issued.
//
// Use replace() either way so the back button doesn't drop the user mid-KYC.
function finishAndNavigate(passportId: string) {
  const nextParam = (route.query?.next as string | undefined)?.trim()
  if (nextParam && nextParam.startsWith('/')) {
    router.replace(nextParam)
    return
  }
  if (chosenPassportType.value === 'landlord') {
    router.replace(`/passportview/landlord/${passportId}`)
  } else {
    router.replace(`/passportview/${passportId}`)
  }
}

// ── Owner-claim payment (KYC+HMLR £35.99, or HMLR-only £15.99) ──
const claimPassportId = ref<string | null>(null)
const claimClientSecret = ref<string | null>(null)
const claimAmountPence = ref<number | null>(null)
const paymentError = ref('')
const paymentLoading = ref(false)
const cardReady = ref(false)
let stripeInstance: Stripe | null = null
let cardElement: StripeCardElement | null = null

const claimPriceDisplay = computed(() =>
  claimAmountPence.value != null ? `£${(claimAmountPence.value / 100).toFixed(2)}` : '',
)
// The backend picks the tier — infer which one just from the amount so the
// copy explains what's being charged without duplicating the pricing logic.
const claimPriceReason = computed(() => {
  if (claimAmountPence.value == null) return ''
  return claimAmountPence.value >= 3599
    ? 'Identity verification (KYC) and HM Land Registry ownership check'
    : 'HM Land Registry ownership check'
})

async function openPaymentStep(passportId: string) {
  paymentError.value = ''
  step.value = 'payment'
  try {
    const { createClaimPaymentIntent } = usePassportClaim()
    const { clientSecret, amount } = await createClaimPaymentIntent(passportId)
    claimClientSecret.value = clientSecret
    claimAmountPence.value = amount
    await nextTick()
    await mountClaimStripe()
  } catch (e: any) {
    paymentError.value =
      e?.data?.message || e?.message || 'Could not start payment. Please try again.'
  }
}

async function mountClaimStripe() {
  if (stripeInstance) return
  const { loadStripe } = await import('@stripe/stripe-js')
  stripeInstance = await loadStripe(config.public.stripeKey as string)
  if (!stripeInstance) return

  const elements = stripeInstance.elements()
  cardElement = elements.create('card', {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: '#1a1a1a',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#e53e3e' },
    },
  })
  const mountEl = document.getElementById('claim-stripe-card-element')
  if (mountEl) {
    cardElement.mount(mountEl)
    cardElement.on('change', (e) => {
      paymentError.value = e.error?.message ?? ''
      cardReady.value = e.complete
    })
  }
}

async function payClaimFee() {
  if (!stripeInstance || !cardElement || !claimClientSecret.value || !claimPassportId.value) {
    paymentError.value = 'Card form not ready. Please try again.'
    return
  }
  paymentLoading.value = true
  paymentError.value = ''
  try {
    const { error, paymentIntent } = await stripeInstance.confirmCardPayment(
      claimClientSecret.value,
      { payment_method: { card: cardElement } },
    )
    if (error) {
      paymentError.value = error.message ?? 'Payment failed. Please try again.'
      return
    }
    if (paymentIntent?.status !== 'succeeded') {
      paymentError.value = 'Payment not completed. Please try again.'
      return
    }

    // The webhook may not have fired yet; activatePassport re-checks
    // Stripe directly via hasSuccessfulPayment so this is safe either way.
    const { activatePassport } = usePassportClaim()
    await activatePassport(claimPassportId.value)
    finishAndNavigate(claimPassportId.value)
  } catch (e: any) {
    paymentError.value =
      e?.data?.message || e?.message || 'Could not confirm payment. Please try again.'
  } finally {
    paymentLoading.value = false
  }
}

onBeforeUnmount(() => {
  cardElement?.destroy()
})
</script>

<style scoped>
.claim-root {
  min-height: 100vh;
  background: #faf9fd;
  display: flex;
  flex-direction: column;
  padding-bottom: 96px;
}

/* ── Topbar ─────────────────────────────────────────── */
.cl-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 12px 14px 10px;
  background: #fff;
  border-bottom: 1px solid #eee;
  gap: 8px;
}
.cl-back {
  font-size: 26px;
  line-height: 1;
  color: #231d45;
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.cl-top-text { flex: 1; text-align: center; }
.cl-top-title {
  font-size: 14px;
  font-weight: 700;
  color: #231d45;
}
.cl-top-sub {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}
.cl-spacer { width: 32px; }

.cl-prog-strip {
  height: 3px;
  background: #eef2f7;
  position: sticky;
  top: 55px;
  z-index: 20;
  overflow: hidden;
}
.cl-prog-strip span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #00a19a);
  transition: width 0.35s ease;
}

/* ── Screen ─────────────────────────────────────────── */
.cl-screen {
  padding: 20px 18px 24px;
  flex: 1;
}
.cl-center-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.cl-center-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 24px;
  text-align: center;
  min-height: 100vh;
}

.cl-icon-square {
  width: 64px;
  height: 64px;
  background: #f1f9f4;
  border: 2px solid #cff4f2;
  border-radius: 20px;
  display: grid;
  place-items: center;
  margin: 0 auto 18px;
  font-size: 30px;
}
.cl-icon-square.cl-icon-lg {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  font-size: 34px;
  margin-bottom: 20px;
}

.cl-h1 {
  font-size: 22px;
  font-weight: 800;
  color: #231d45;
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}
.cl-h2 {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}
.cl-body {
  font-size: 13.5px;
  color: #475569;
  line-height: 1.55;
  margin: 0 0 14px;
}
.cl-center { text-align: center; }
.cl-mb-xs { margin-bottom: 8px; }
.cl-mb-sm { margin-bottom: 14px; }
.cl-mb-md { margin-bottom: 18px; }
.cl-mb-lg { margin-bottom: 24px; }
.cl-w-full { width: 100%; }
.cl-text-l { text-align: left; }

/* ── Field ─────────────────────────────────────────── */
.cl-field-wrap { margin-bottom: 14px; }
.cl-field-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

/* ── Selected address card ─────────────────────────── */
.cl-sel-card {
  background: #f1f9f4;
  border: 1.5px solid #cff4f2;
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 14px;
}
.cl-sel-eyebrow {
  font-size: 10px;
  font-weight: 700;
  color: #008a84;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.cl-sel-line1 {
  font-size: 15px;
  font-weight: 700;
  color: #231d45;
}
.cl-sel-line2 {
  font-size: 13px;
  color: #475569;
}
.cl-sel-change {
  font-size: 12px;
  color: #00a19a;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

/* ── Lock note ─────────────────────────────────────── */
.cl-lock-note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #f1f9f4;
  border: 1px solid #cff4f2;
  border-radius: 12px;
}
.cl-lock-ic { font-size: 18px; }
.cl-lock-body {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}
.cl-lock-body strong { color: #231d45; }

/* ── Confirm navy card ─────────────────────────────── */
.cl-navy-card {
  background: linear-gradient(135deg, #231d45, #2d2560);
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}
.cl-navy-glow {
  position: absolute;
  right: -20px;
  top: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.25), transparent 70%);
  border-radius: 50%;
}
.cl-navy-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
  position: relative;
}
.cl-navy-addr1 {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
  position: relative;
}
.cl-navy-addr2 {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 16px;
  position: relative;
}
.cl-tile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  position: relative;
}
.cl-tile {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px 12px;
}
.cl-tile-l {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 3px;
}
.cl-tile-v {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

/* ── Info pale ─────────────────────────────────────── */
.cl-info-pale {
  background: #f1f9f4;
  border: 1.5px solid #cff4f2;
  border-radius: 14px;
  padding: 13px 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.cl-info-ic { font-size: 20px; flex-shrink: 0; }
.cl-info-body {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.5;
}
.cl-info-body strong { color: #231d45; }

.cl-link-center {
  text-align: center;
  font-size: 12px;
  color: #00a19a;
  font-weight: 700;
  cursor: pointer;
  padding: 10px;
}

/* ── Card ──────────────────────────────────────────── */
.cl-card {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.cl-card-pale {
  background: #f1f9f4;
  border: 1.5px solid #cff4f2;
  border-radius: 14px;
  padding: 14px;
}
.cl-eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

.cl-row-list {
  display: flex;
  flex-direction: column;
  gap: 13px;
}
.cl-gap-sm { gap: 11px; }

.cl-step-row {
  display: flex;
  align-items: center;
  gap: 13px;
}
.cl-step-ic {
  width: 40px;
  height: 40px;
  background: #f1f9f4;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 19px;
  flex-shrink: 0;
}
.cl-step-t {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
}
.cl-step-s {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 1px;
}

.cl-pale-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cl-pale-ic {
  font-size: 28px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
/* Land Registry illustration in the "Next: Land Registry check" tile.
   Sized bigger than the emoji it replaces so the 3D artwork reads
   properly against the aqua card. */
.cl-pale-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  display: block;
}
.cl-pale-ic-sm { font-size: 18px; flex-shrink: 0; }
.cl-pale-t {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  margin-bottom: 3px;
}
.cl-pale-s {
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}

/* ── KYC ID upload slots ───────────────────────────── */
.cl-slot-label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
}
.cl-slot {
  height: 120px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}
.cl-slot-front {
  border: 2px dashed #cff4f2;
  background: #f1f9f4;
}
.cl-slot-back {
  border: 2px dashed #e5e7eb;
  background: #f8fafc;
}
.cl-slot-filled {
  border: 2px solid #00a19a !important;
  background: #fff !important;
}
.cl-slot-ic { font-size: 32px; }
.cl-slot-ic-muted { opacity: 0.4; }
.cl-slot-text {
  font-size: 13px;
  font-weight: 600;
  color: #008a84;
}
.cl-slot-text-muted { color: #94a3b8; }
.cl-slot-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cl-slot-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  background: #00a19a;
  color: #fff;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

.cl-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cl-pill {
  background: #f1f5f9;
  color: #475569;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
}
.cl-pill-good {
  background: #dcfce7;
  color: #008a84;
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

/* ── Liveness ─────────────────────────────────────── */
.cl-live-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto 24px;
}
.cl-live-svg {
  position: absolute;
  inset: 0;
}
.cl-live-ring {
  transform: rotate(-90deg);
  transform-origin: 80px 80px;
  animation: clLiveRing 2s ease-in-out infinite alternate;
}
@keyframes clLiveRing {
  from { stroke-dashoffset: 464; }
  to { stroke-dashoffset: 116; }
}
.cl-live-inner {
  position: absolute;
  inset: 12px;
  background: #f1f9f4;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 60px;
}
.cl-live-inner img {
  width: 78px;
  height: 78px;
  object-fit: contain;
  display: block;
}

.cl-num-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #231d45;
}
.cl-num {
  width: 26px;
  height: 26px;
  background: #00a19a;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── AML ─────────────────────────────────────────── */
.cl-aml-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cl-aml-label {
  font-size: 13px;
  color: #231d45;
  font-weight: 600;
}

/* ── KYC Verified ─────────────────────────────────── */
.cl-big-check {
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #008a84, #00a19a);
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 24px;
  box-shadow: 0 12px 36px rgba(0, 161, 154, 0.35);
}
.cl-pill-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 28px;
}

/* ── LR searching ─────────────────────────────────── */
.cl-lr-pulse-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 28px;
}
.cl-lr-pulse {
  position: absolute;
  inset: 0;
  background: #f1f9f4;
  border-radius: 50%;
  animation: clLrPulse 1.5s ease-out infinite;
}
@keyframes clLrPulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}
.cl-lr-inner {
  position: absolute;
  inset: 16px;
  background: #fff;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 28px;
  padding: 8px;
}
/* Land Registry illustration inside the pulsing loader — larger than
   the emoji so the 3D building fills the pulse circle cleanly. */
.cl-lr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.cl-lr-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
}
.cl-lr-step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: #94a3b8;
  transition: color 0.3s;
}
.cl-lr-step-done {
  color: #231d45;
  font-weight: 600;
}
.cl-lr-dot {
  width: 22px;
  height: 22px;
  background: #e5e7eb;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: background 0.3s;
}
.cl-lr-step-done .cl-lr-dot {
  background: #00a19a;
}

/* ── LR Found ─────────────────────────────────────── */
.cl-lrf-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, #008a84, #00a19a);
  border-radius: 16px;
  margin-bottom: 18px;
  color: #fff;
}
.cl-lrf-banner-ic {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
  flex-shrink: 0;
}
.cl-lrf-banner-t {
  font-size: 14px;
  font-weight: 700;
}
.cl-lrf-banner-s {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 2px;
}
.cl-lrf-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cl-lrf-row {
  display: flex;
  justify-content: space-between;
  font-size: 13.5px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eef2f7;
}
.cl-lrf-row-last { border-bottom: none; padding-bottom: 0; }
.cl-lrf-l { color: #94a3b8; }
.cl-lrf-v { font-weight: 700; color: #231d45; }
.cl-lrf-v-good { color: #008a84; }
.cl-big-tick {
  width: 44px;
  height: 44px;
  background: #00a19a;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  flex-shrink: 0;
}

/* ── Errors ──────────────────────────────────────── */
.cl-err-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13px;
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.cl-err-retry {
  background: #b91c1c;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.cl-err-link {
  background: #00a19a;
  color: #fff;
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}
.cl-err-link:hover {
  background: #00a19a;
}

/* ── Bottom CTA bar ──────────────────────────────── */
.cl-cta-bar {
  position: fixed;
  bottom: 0;
  /* `left: 0; right: 0` + `margin: 0 auto` centres the fixed bar within
     the viewport and caps it at the app's max width. More robust on
     Safari than `left: 50%; transform: translateX(-50%)` which can
     mis-render with width:100% on a fixed element. */
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 28rem;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #eef2f7;
  z-index: 30;
}
.cl-btn-brand {
  width: 100%;
  padding: 14px 18px;
  background: #00a19a;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.15s, filter 0.15s;
}
.cl-btn-brand:hover:not(:disabled) { filter: brightness(1.05); }
.cl-btn-brand:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cl-btn-ghost {
  width: 100%;
  padding: 14px 18px;
  background: #fff;
  color: #0e2840;
  border: 1px solid #e2e8e8;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}
.cl-btn-ghost:hover { background: #f7fafa; }
.cl-btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cl-spin 0.7s linear infinite;
}
@keyframes cl-spin { to { transform: rotate(360deg); } }
.cl-stripe-box {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.2s;
}
.cl-stripe-box:focus-within { border-color: #00a19a; }

/* ─────────────────────────────────────────────────────────────────
   KYC screens redesign (Confirm / Identity verified / Searching LR /
   Ownership confirmed). Uses class prefix `cl-lr-`, `cl-owned-`, etc.
   ───────────────────────────────────────────────────────────────── */

/* ── Screen 1: Confirm property ─────────────────────────────────── */
.cl-lr-card {
  position: relative;
  background: linear-gradient(160deg, #E9F6F5 0%, #F3FAF9 100%);
  border-radius: 20px;
  padding: 20px 20px 22px;
  margin: 4px 0 16px;
  overflow: hidden;
}
.cl-lr-card-text { position: relative; z-index: 1; max-width: 62%; }
.cl-lr-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  color: #00817C;
  margin-bottom: 12px;
}
.cl-lr-eyebrow svg { width: 16px; height: 16px; }
.cl-lr-addr1 {
  font-size: 22px;
  font-weight: 800;
  color: #231D45;
  letter-spacing: -0.5px;
  line-height: 1.15;
}
.cl-lr-addr2 {
  font-size: 15px;
  font-weight: 500;
  color: #4A5876;
  margin-top: 4px;
}
.cl-lr-card-illus {
  position: absolute;
  right: 6px;
  top: 12px;
  width: 45%;
  max-width: 180px;
  height: auto;
  object-fit: contain;
  pointer-events: none;
}
.cl-lr-tile-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
}
.cl-lr-tile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #FFFFFF;
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(31, 44, 76, 0.04);
}
.cl-lr-tile-ic {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #E9F6F5;
  color: #00817C;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cl-lr-tile-ic svg { width: 18px; height: 18px; }
.cl-lr-tile-l {
  font-size: 12px;
  font-weight: 600;
  color: #75757C;
}
.cl-lr-tile-v {
  font-size: 14.5px;
  font-weight: 800;
  color: #231D45;
  margin-top: 1px;
  word-break: break-all;
}

.cl-lock-note {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  background: #F0F9F8;
  border: 1px solid #DCF0EE;
  border-radius: 14px;
  margin-bottom: 22px;
}
.cl-lock-note-ic {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #E9F6F5;
  color: #00817C;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cl-lock-note-ic svg { width: 20px; height: 20px; }
.cl-lock-note-body {
  font-size: 13px;
  color: #4A5876;
  line-height: 1.45;
  font-weight: 500;
}
.cl-lock-note-body strong { color: #00817C; font-weight: 800; }

.cl-link-center {
  display: block;
  text-align: center;
  color: #00817C;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 0;
  cursor: pointer;
}

/* ── Screen 2: Identity verified ────────────────────────────────── */
.cl-big-check-illus {
  width: 160px;
  height: 160px;
  object-fit: contain;
  margin: 12px auto 8px;
  display: block;
  filter: drop-shadow(0 8px 22px rgba(0, 161, 154, 0.28));
}
.cl-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 26px;
}
.cl-pill-good {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #E9F6F5;
  color: #00817C;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
}
.cl-pill-good svg { width: 14px; height: 14px; }
.cl-next-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
  background: #F0F9F8;
  border: 1px solid #DCF0EE;
  border-radius: 18px;
}
.cl-next-card-illus {
  width: 70px;
  height: 70px;
  object-fit: contain;
  flex-shrink: 0;
}
.cl-next-card-t {
  font-size: 16px;
  font-weight: 800;
  color: #231D45;
  letter-spacing: -0.2px;
}
.cl-next-card-s {
  font-size: 13px;
  color: #4A5876;
  font-weight: 500;
  line-height: 1.45;
  margin-top: 3px;
}

/* ── Screen 3: Searching Land Registry ──────────────────────────── */
.cl-lr-bank {
  position: relative;
  z-index: 1;
  width: 140px;
  height: 140px;
  object-fit: contain;
  object-position: center 30%;
  clip-path: inset(0 0 20% 0 round 8px);
  filter: drop-shadow(0 6px 14px rgba(0, 161, 154, 0.15));
}
.cl-lr-timeline {
  background: #FFFFFF;
  border-radius: 20px;
  padding: 20px 22px;
  box-shadow: 0 3px 10px rgba(31, 44, 76, 0.05);
  margin-bottom: 16px;
}
.cl-lr-tstep {
  position: relative;
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 14px;
  padding-bottom: 22px;
}
.cl-lr-tstep::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 40px;
  bottom: 0;
  width: 2px;
  background: #E7EAEE;
}
.cl-lr-tstep--last { padding-bottom: 0; }
.cl-lr-tstep--last::before { display: none; }
.cl-lr-tstep--done::before { background: #00A19A; }
.cl-lr-tdot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #D4D9E3;
  background: #FFFFFF;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  z-index: 1;
}
.cl-lr-tstep--active .cl-lr-tdot {
  border-color: #00A19A;
}
.cl-lr-tstep--done .cl-lr-tdot {
  background: #00A19A;
  border-color: #00A19A;
}
.cl-lr-tdot svg { width: 18px; height: 18px; }
.cl-lr-tdot-inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00A19A;
}
.cl-lr-tt {
  font-size: 15px;
  font-weight: 800;
  color: #231D45;
  letter-spacing: -0.2px;
  margin-top: 8px;
}
.cl-lr-ts {
  font-size: 13px;
  color: #A8B0C2;
  font-weight: 500;
  margin-top: 2px;
}
.cl-secure {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #E9F6F5;
  border-radius: 16px;
}
.cl-secure-lock {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(0, 161, 154, 0.14);
  color: #00817C;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cl-secure-lock svg { width: 24px; height: 24px; }
.cl-secure-body { flex: 1; min-width: 0; }
.cl-secure-t {
  font-size: 14px;
  font-weight: 800;
  color: #231D45;
  letter-spacing: -0.2px;
}
.cl-secure-s {
  font-size: 12.5px;
  color: #4A5876;
  font-weight: 500;
  line-height: 1.4;
  margin-top: 3px;
}
.cl-secure-shield {
  width: 40px;
  height: 40px;
  color: #00A19A;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cl-secure-shield svg { width: 30px; height: 30px; }

/* ── Screen 4: Ownership confirmed ──────────────────────────────── */
.cl-owned {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 4px 0 24px;
}
.cl-owned-illus {
  width: 66px;
  height: 66px;
  object-fit: contain;
  flex-shrink: 0;
}
.cl-owned-t {
  font-size: 20px;
  font-weight: 800;
  color: #231D45;
  letter-spacing: -0.3px;
}
.cl-owned-s {
  font-size: 14px;
  color: #75757C;
  font-weight: 500;
  margin-top: 3px;
}
.cl-owned-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}
.cl-owned-header-illus {
  width: 60px;
  height: 60px;
  object-fit: contain;
  flex-shrink: 0;
}
.cl-owned-header-t {
  font-size: 19px;
  font-weight: 800;
  color: #231D45;
  letter-spacing: -0.3px;
}
.cl-data-rows { margin: 4px 0 24px; }
.cl-data-row {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px solid #E7EAEE;
}
.cl-data-row--last { border-bottom: 0; }
.cl-data-ic {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #E9F6F5;
  color: #00817C;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.cl-data-ic svg { width: 20px; height: 20px; }
.cl-data-ic--img {
  background: #fff;
  border: 1px solid #e2f1ea;
}
.cl-data-ic--img img { width: 30px; height: 30px; object-fit: contain; }
.cl-data-l {
  font-size: 15px;
  font-weight: 600;
  color: #75757C;
}
.cl-data-v {
  font-size: 15px;
  font-weight: 800;
  color: #231D45;
  justify-self: end;
  text-align: right;
  word-break: break-all;
}
.cl-data-v--good {
  color: #00A19A;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.cl-data-v--good svg { width: 14px; height: 14px; }

.cl-name-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 0;
  margin-top: 4px;
}
.cl-name-card-illus {
  width: 68px;
  height: 68px;
  object-fit: contain;
  flex-shrink: 0;
}
.cl-name-card-t {
  font-size: 17px;
  font-weight: 800;
  color: #231D45;
  letter-spacing: -0.3px;
}
.cl-name-card-s {
  font-size: 14px;
  color: #75757C;
  font-weight: 500;
  line-height: 1.5;
  margin-top: 4px;
}

/* 3D icon images that replaced flat emoji inside icon wrappers */
.cl-icon-square img {
  width: 38px;
  height: 38px;
  object-fit: contain;
  display: block;
}
.cl-icon-square.cl-icon-lg img {
  width: 46px;
  height: 46px;
}
.cl-lock-ic {
  width: 24px;
  height: 24px;
  display: inline-flex;
  flex-shrink: 0;
}
.cl-lock-ic img,
.cl-pale-ic img,
.cl-pale-ic-sm img,
.cl-step-ic img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.cl-step-ic img {
  width: 26px;
  height: 26px;
}
.cl-pale-ic {
  width: 34px;
  height: 34px;
}
.cl-pale-ic-sm {
  width: 22px;
  height: 22px;
  display: inline-flex;
}
</style>
