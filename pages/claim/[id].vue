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
      <div class="cl-icon-square">🏠</div>
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
        <div class="cl-lock-ic">🔒</div>
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

      <div class="cl-navy-card">
        <div class="cl-navy-glow" />
        <div class="cl-navy-eyebrow">Found on Land Registry</div>
        <div class="cl-navy-addr1">{{ selectedProperty?.addressLine1 || '—' }}</div>
        <div class="cl-navy-addr2">
          {{ [selectedProperty?.city, selectedProperty?.postcode].filter(Boolean).join(', ') || '—' }}
        </div>
        <div class="cl-tile-grid">
          <div class="cl-tile">
            <div class="cl-tile-l">Tenure</div>
            <div class="cl-tile-v">{{ tenureDisplay }}</div>
          </div>
          <div class="cl-tile">
            <div class="cl-tile-l">Title number</div>
            <div class="cl-tile-v">{{ titleDisplay }}</div>
          </div>
          <div class="cl-tile">
            <div class="cl-tile-l">Type</div>
            <div class="cl-tile-v">{{ typeDisplay }}</div>
          </div>
          <div class="cl-tile">
            <div class="cl-tile-l">Registered</div>
            <div class="cl-tile-v">{{ registeredDisplay }}</div>
          </div>
        </div>
      </div>

      <div class="cl-info-pale">
        <div class="cl-info-ic">✅</div>
        <div class="cl-info-body">
          Next we'll verify <strong>your identity</strong> to confirm you're
          the registered owner. Takes about 2 minutes.
        </div>
      </div>

      <div class="cl-link-center" @click="step = 'search'">
        Not the right property? Search again
      </div>

      <div v-if="verificationError" class="cl-err-banner">
        {{ verificationError }}
        <button class="cl-err-retry" @click="confirmProperty">Retry</button>
      </div>
    </div>

    <!-- ════════════════════════════ KYC EXPLAINER ════════════════════════════ -->
    <div v-else-if="step === 'kyc-explainer'" class="cl-screen cl-center-col">
      <div class="cl-icon-square cl-icon-lg">🪪</div>
      <h1 class="cl-h1">Before we build your Passport</h1>
      <p class="cl-body cl-mb-lg">
        We need to confirm who you are and that you own the property. Takes
        around 2 minutes — done once only.
      </p>

      <div class="cl-card cl-text-l cl-mb-sm">
        <div class="cl-eyebrow">What's involved</div>
        <div class="cl-row-list">
          <div class="cl-step-row">
            <div class="cl-step-ic">🪪</div>
            <div>
              <div class="cl-step-t">Photo ID</div>
              <div class="cl-step-s">Passport or driving licence</div>
            </div>
          </div>
          <div class="cl-step-row">
            <div class="cl-step-ic">🤳</div>
            <div>
              <div class="cl-step-t">Liveness check</div>
              <div class="cl-step-s">Quick selfie to confirm it's you</div>
            </div>
          </div>
          <div class="cl-step-row">
            <div class="cl-step-ic">🛡️</div>
            <div>
              <div class="cl-step-t">AML screening</div>
              <div class="cl-step-s">Automatic check — takes seconds</div>
            </div>
          </div>
        </div>
      </div>

      <div class="cl-card-pale cl-text-l">
        <div class="cl-pale-row">
          <div class="cl-pale-ic">⏱️</div>
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
              style="background: transparent; color: #1f7a66;"
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
        <div class="cl-live-inner">🤳</div>
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
      <div class="cl-icon-square cl-icon-lg">🛡️</div>
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
          <div class="cl-pale-ic-sm">🔒</div>
          <div class="cl-pale-s">
            AML checks are required by UK regulations. Data processed securely.
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ KYC VERIFIED (fullscreen) ════════════════════════════ -->
    <div v-else-if="step === 'kyc-verified'" class="cl-screen cl-center-full">
      <div class="cl-big-check">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h1 class="cl-h1 cl-center">Identity verified!</h1>
      <p class="cl-body cl-center cl-mb-lg">
        You've passed AML and identity checks. Now let's confirm your property
        ownership via Land Registry.
      </p>
      <div class="cl-pill-row">
        <span class="cl-pill-good">✓ ID validated</span>
        <span class="cl-pill-good">✓ Liveness passed</span>
        <span class="cl-pill-good">✓ AML clear</span>
      </div>

      <div class="cl-card-pale cl-text-l cl-w-full">
        <div class="cl-pale-row">
          <div class="cl-pale-ic">🏛️</div>
          <div>
            <div class="cl-pale-t">Next: Land Registry check</div>
            <div class="cl-pale-s">
              We confirm ownership matches your verified identity.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ LR SEARCHING (fullscreen) ════════════════════════════ -->
    <div v-else-if="step === 'lr-searching'" class="cl-screen cl-center-full">
      <div class="cl-lr-pulse-wrap">
        <div class="cl-lr-pulse" />
        <div class="cl-lr-inner">🏛️</div>
      </div>
      <h1 class="cl-h1 cl-center">Searching Land Registry</h1>
      <p class="cl-body cl-center cl-mb-lg">
        Checking HM Land Registry for<br />
        <strong>{{ lrAddressDisplay }}</strong>
      </p>

      <div class="cl-lr-steps cl-w-full">
        <div
          class="cl-lr-step"
          :class="{ 'cl-lr-step-done': lrStep >= 1 }"
        >
          <div class="cl-lr-dot">
            <svg v-if="lrStep >= 1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          Address matched to title number
        </div>
        <div
          class="cl-lr-step"
          :class="{ 'cl-lr-step-done': lrStep >= 2 }"
        >
          <div class="cl-lr-dot">
            <svg v-if="lrStep >= 2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          Title register retrieved
        </div>
        <div
          class="cl-lr-step"
          :class="{ 'cl-lr-step-done': lrStep >= 3 }"
        >
          <div class="cl-lr-dot">
            <svg v-if="lrStep >= 3" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          Matching proprietor to identity…
        </div>
      </div>
    </div>

    <!-- ════════════════════════════ LR FOUND ════════════════════════════ -->
    <div v-else-if="step === 'lr-found'" class="cl-screen">
      <div class="cl-lrf-banner">
        <div class="cl-lrf-banner-ic">✅</div>
        <div>
          <div class="cl-lrf-banner-t">Ownership verified</div>
          <div class="cl-lrf-banner-s">Name matches Land Registry record</div>
        </div>
      </div>

      <div class="cl-card cl-mb-sm">
        <div class="cl-eyebrow cl-mb-sm">Land Registry title data</div>
        <div class="cl-lrf-rows">
          <div class="cl-lrf-row">
            <span class="cl-lrf-l">Title number</span>
            <span class="cl-lrf-v">{{ titleDisplay }}</span>
          </div>
          <div class="cl-lrf-row">
            <span class="cl-lrf-l">Tenure</span>
            <span class="cl-lrf-v">{{ tenureDisplay }}</span>
          </div>
          <div class="cl-lrf-row">
            <span class="cl-lrf-l">Proprietor</span>
            <span class="cl-lrf-v cl-lrf-v-good">✓ {{ proprietorDisplay }}</span>
          </div>
          <div class="cl-lrf-row">
            <span class="cl-lrf-l">Registered</span>
            <span class="cl-lrf-v">{{ registeredDisplay }}</span>
          </div>
          <div class="cl-lrf-row cl-lrf-row-last">
            <span class="cl-lrf-l">Charges</span>
            <span class="cl-lrf-v">Not available</span>
          </div>
        </div>
      </div>

      <div class="cl-card-pale cl-text-l cl-mb-sm">
        <div class="cl-pale-row">
          <div class="cl-big-tick">✓</div>
          <div>
            <div class="cl-pale-t">{{ proprietorDisplay }} — confirmed</div>
            <div class="cl-pale-s">
              Your KYC-verified name matches the registered proprietor. Your
              Passport is ready.
            </div>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  // First thing: ask the user which type of passport they're claiming.
  // Always shown — even if their profile role suggests one — so they can
  // override per-property (a landlord might still claim a seller passport).
  showTypeDrawer.value = true
  await Promise.all([loadProperty(), loadProfile()])
})

// ── Topbar logic ──────────────────────────────────────────────
const isFullscreenStep = computed(() =>
  ['kyc-verified', 'lr-searching'].includes(step.value),
)
const showCta = computed(() => step.value !== 'lr-searching')

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
}
const topbarTitle = computed(() => stepMeta[step.value].title)
const topbarSub = computed(() => stepMeta[step.value].sub)
const progressPct = computed(() => stepMeta[step.value].pct)

// ── Display fields (from selectedProperty) ─────────────────────
const tenureDisplay = computed(
  () => selectedProperty.value?.tenure || '—',
)
const titleDisplay = computed(
  () => selectedProperty.value?.titleNumber || '—',
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
      step.value = 'kyc-aml'
      return
    case 'lr-found':
      step.value = 'kyc-verified'
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
    // Open the hosted flow in a new tab. Persona handles ID upload,
    // liveness + AML inside their UI; we just wait for the result.
    const w = window.open(start.hostedUrl, '_blank', 'noopener')
    if (!w) {
      personaError.value =
        'Pop-ups blocked — allow pop-ups for this site and try again.'
      personaPolling.value = false
      return
    }
    runPolling()
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

onBeforeUnmount(() => personaAbort?.abort())

// ── Liveness simulated delay ──────────────────────────────────
async function doLiveness() {
  livenessAnalysing.value = true
  await new Promise((r) => setTimeout(r, 1500))
  livenessAnalysing.value = false
  step.value = 'kyc-aml'
}

// ── LR searching animation → lr-found ─────────────────────────
watch(
  () => step.value,
  (s) => {
    if (s === 'lr-searching') runLrSearch()
  },
)
async function runLrSearch() {
  lrStep.value = 0
  await new Promise((r) => setTimeout(r, 700))
  lrStep.value = 1
  await new Promise((r) => setTimeout(r, 800))
  lrStep.value = 2
  await new Promise((r) => setTimeout(r, 900))
  lrStep.value = 3
  await new Promise((r) => setTimeout(r, 600))
  if (step.value === 'lr-searching') step.value = 'lr-found'
}

// ── Issue passport (complete-verification + claim) ────────────
async function issuePassport() {
  issueError.value = ''
  const pId = selectedProperty.value?.id
  if (!pId) {
    issueError.value = 'No property selected.'
    return
  }
  issueLoading.value = true
  try {
    // 1) complete-verification
    try {
      await $fetch(`${base}/property/${pId}/complete-verification`, {
        method: 'POST',
        headers: authHeaders(),
      })
    } catch {
      // Non-fatal: still try to claim; backend may tolerate without
    }

    // 2) Gate the claim on the user's passport-type pick.
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

    // 3) Where to send the user next?
    //
    //   - If a `?next=…` was passed (e.g. they entered the claim chain from
    //     "Publish to your street" or "Boost your score" on /homescore), honour
    //     it so the user lands back on that screen, now as a verified owner.
    //   - Otherwise fall through to the canonical passport view for the type
    //     of passport that was issued.
    //
    // Use replace() either way so the back button doesn't drop the user mid-KYC.
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
  } catch (e: any) {
    issueError.value =
      e?.data?.message ||
      e?.message ||
      'Could not issue your Passport. Please try again.'
  } finally {
    issueLoading.value = false
  }
}
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
  background: linear-gradient(90deg, #00a19a, #3dbda3);
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
  color: #1f7a66;
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
.cl-pale-ic { font-size: 28px; flex-shrink: 0; }
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
  color: #1f7a66;
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
  color: #15803d;
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
  background: linear-gradient(135deg, #1f7a66, #00a19a);
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
  background: #00a19a;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 28px;
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
  background: linear-gradient(135deg, #1f7a66, #00a19a);
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
.cl-lrf-v-good { color: #15803d; }
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
  left: 0;
  right: 0;
  bottom: 0;
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
.cl-btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cl-spin 0.7s linear infinite;
}
@keyframes cl-spin { to { transform: rotate(360deg); } }
</style>
