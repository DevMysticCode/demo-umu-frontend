<template>
  <div class="pv-page">
    <!-- Top nav -->
    <div class="pv-top-nav">
      <button class="pv-back" @click="goBack" aria-label="Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div class="pv-nav-centre">Profile PDF</div>
      <span class="pv-nav-right" @click="goSign">
        {{ passport?.signedAt ? '✓ Signed' : '✍️ Sign' }}
      </span>
    </div>

    <!-- PDF document render -->
    <div class="pv-doc-wrap">
      <div class="pdf-doc">
        <!-- Diagonal repeating watermark (positioned behind everything) -->
        <div class="pdf-watermark-layer" aria-hidden="true" />

        <!-- Header (navy) -->
        <div class="pdf-header">
          <div class="pdf-header-title">UMU BUYER PROFILE · VERIFIED DOCUMENT</div>
          <div class="pdf-header-name">{{ displayName }}</div>
          <div class="pdf-header-ref">Ref: {{ publicRef }}</div>
          <div class="pdf-header-pills">
            <span class="pdf-h-pill">🪪 ID Verified</span>
            <span v-if="fundsShort" class="pdf-h-pill">{{ fundsShort }} Funds</span>
            <span class="pdf-h-pill">{{ chainShort }}</span>
            <span v-if="tier === 'PREMIUM'" class="pdf-h-pill">★ Platinum</span>
          </div>
        </div>

        <!-- Validity period -->
        <div class="pdf-validity" :class="{ expired: isExpired }">
          <div class="pdf-validity-col">
            <div class="pdf-validity-lbl">Issued</div>
            <div class="pdf-validity-val">{{ issuedDate }}</div>
          </div>
          <div class="pdf-validity-divider" />
          <div class="pdf-validity-col">
            <div class="pdf-validity-lbl">Expires</div>
            <div class="pdf-validity-val">{{ expiresDate }}</div>
          </div>
          <div class="pdf-validity-divider" />
          <div class="pdf-validity-status">
            <span class="pdf-validity-dot" />
            <span class="pdf-validity-status-text">
              {{
                isExpired
                  ? 'Expired'
                  : daysRemaining <= 1
                    ? 'Active · expires today'
                    : `Active · ${daysRemaining} days left`
              }}
            </span>
          </div>
        </div>

        <!-- Identity -->
        <div class="pdf-section">
          <div class="pdf-section-title">IDENTITY</div>
          <div class="pdf-cred-row">
            <span class="pdf-cred-label">Full name</span>
            <span class="pdf-cred-value">{{ displayName }}</span>
          </div>
          <div class="pdf-cred-row">
            <span class="pdf-cred-label">ID document</span>
            <span class="pdf-cred-value">{{ idTypeLabel }}</span>
          </div>
          <div class="pdf-cred-row">
            <span class="pdf-cred-label">Verified by</span>
            <span class="pdf-pill">Onfido · DVS ✓</span>
          </div>
          <div class="pdf-cred-row">
            <span class="pdf-cred-label">AML status</span>
            <span class="pdf-pill">Clear ✓</span>
          </div>
        </div>

        <!-- Financial -->
        <div class="pdf-section">
          <div class="pdf-section-title">FINANCIAL CREDENTIALS</div>
          <div v-if="fundsShort" class="pdf-cred-row">
            <span class="pdf-cred-label">Proof of deposit</span>
            <span class="pdf-cred-value">{{ fundsShort }}</span>
          </div>
          <div class="pdf-cred-row">
            <span class="pdf-cred-label">Source of funds</span>
            <span class="pdf-pill">AML clear ✓</span>
          </div>
          <div v-if="passport?.fundsAmount" class="pdf-cred-row">
            <span class="pdf-cred-label">Max purchase</span>
            <span class="pdf-cred-value">£{{ passport.fundsAmount.toLocaleString() }}</span>
          </div>
          <!-- Affordability row removed — was hard-coded "82/100 · Low risk"
               for every user regardless of their profile. It will return
               once the Armalytix / open-banking partner integration lands
               and we can show a real score per buyer. -->
        </div>

        <!-- Credit File section removed — was showing the same hard-coded
             Experian (821) and Equifax (794) numbers for every Premium
             user. It will return once the Experian + Equifax partner
             integrations ship and the backend persists real scores per
             buyer. Keeping the dummy section in the PDF risks a lender or
             solicitor relying on bogus numbers. -->


        <!-- Purchase profile -->
        <div class="pdf-section">
          <div class="pdf-section-title">PURCHASE PROFILE</div>
          <div class="pdf-cred-row">
            <span class="pdf-cred-label">Chain position</span>
            <span class="pdf-cred-value">{{ chainShort }}</span>
          </div>
          <div v-if="timelineLabel" class="pdf-cred-row">
            <span class="pdf-cred-label">Timeline</span>
            <span class="pdf-cred-value">{{ timelineLabel }}</span>
          </div>
          <div v-if="propertyTypeLabel" class="pdf-cred-row">
            <span class="pdf-cred-label">Property type</span>
            <span class="pdf-cred-value">{{ propertyTypeLabel }}</span>
          </div>
          <div v-if="passport?.solicitorStatus === 'yes'" class="pdf-cred-row">
            <span class="pdf-cred-label">Solicitor status</span>
            <span class="pdf-pill">Instructed · Law Society ✓</span>
          </div>
        </div>

        <!-- Signature -->
        <div class="pdf-section">
          <div class="pdf-section-title">DIGITAL SIGNATURE</div>
          <!-- Not signed -->
          <div
            v-if="!passport?.signedAt"
            class="pdf-sig-placeholder"
            @click="goSign"
          >
            ✍️ Tap to add your digital signature
          </div>
          <!-- Signed -->
          <div v-else class="pdf-sig-done">
            <div class="pdf-sig-done-label">✅ Digitally signed</div>
            <div v-if="passport.signatureData" class="pdf-sig-img-wrap">
              <img :src="passport.signatureData" alt="Signature" class="pdf-sig-img" />
            </div>
            <div v-else class="pdf-sig-typed">
              {{ passport.signedName }}
            </div>
            <div class="pdf-sig-meta">
              Signed {{ formatSignedAt(passport.signedAt) }} · UMU verified
            </div>
          </div>
        </div>

        <div class="pdf-watermark">
          Issued by UMU · {{ canonicalShareUrl }} · PDTF conformant · Verify at umu.co/verify
        </div>
      </div>
    </div>

    <!-- Download / sign actions -->
    <div class="pv-actions">
      <button class="cta-btn" :disabled="downloading" @click="downloadPdf">
        📄 {{ downloading ? 'Preparing…' : 'Download PDF' }}
      </button>
      <button
        v-if="!passport?.signedAt"
        class="cta-btn outline"
        @click="goSign"
      >
        ✍️ Add digital signature first
      </button>
      <button
        v-else
        class="cta-btn outline"
        @click="goSign"
      >
        ✍️ Update signature
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  useBuyerProfile,
  type BuyerProfile,
} from '~/composables/useBuyerProfile'
import { useProfile } from '~/composables/useProfile'
import { useAppToast } from '~/composables/useCustomToast'

definePageMeta({ title: 'Profile PDF — UmovingU', middleware: 'auth' })

const router = useRouter()
const { getBuyerProfile } = useBuyerProfile()
const { fetchProfile, profile } = useProfile()
const { showToast } = useAppToast()

const passport = ref<BuyerProfile | null>(null)
const downloading = ref(false)

onMounted(async () => {
  fetchProfile?.().catch(() => {})
  try {
    const p = await getBuyerProfile()
    passport.value = p
    if (!p) router.replace('/buyer-profile')
  } catch {
    router.replace('/buyer-profile')
  }
})

// ── Display ───────────────────────────────────────────────
const tier = computed<'BASIC' | 'VERIFIED' | 'PREMIUM'>(
  () => ((passport.value as any)?.tier as any) || 'BASIC',
)
const displayName = computed(() => {
  const first = profile.value?.firstName?.trim()
  const last = profile.value?.lastName?.trim()
  if (first || last) return [first, last].filter(Boolean).join(' ')
  return profile.value?.email?.split('@')[0] || 'Buyer'
})
const publicRef = computed(
  () => (passport.value as any)?.publicRef || '—',
)
const canonicalShareUrl = computed(() => `umu.co/profile/${publicRef.value}`)
// ── Validity period ──────────────────────────────────────
// A buyer profile is treated as fresh for 30 days from issuance. After
// that the doc is shown as expired (still verifiable via QR — the buyer
// just needs to re-share to refresh the dates).
const VALIDITY_DAYS = 30
const issuedAtMs = computed<number | null>(() => {
  const d = passport.value?.publishedAt || passport.value?.createdAt
  if (!d) return null
  const t = new Date(d).getTime()
  return Number.isFinite(t) ? t : null
})
const expiresAtMs = computed<number | null>(() =>
  issuedAtMs.value ? issuedAtMs.value + VALIDITY_DAYS * 86_400_000 : null,
)
function fmtDate(ms: number | null): string {
  if (ms == null) return '—'
  return new Date(ms).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
const issuedDate = computed(() => fmtDate(issuedAtMs.value))
const expiresDate = computed(() => fmtDate(expiresAtMs.value))
const isExpired = computed(
  () => !!expiresAtMs.value && expiresAtMs.value < Date.now(),
)
const daysRemaining = computed(() => {
  if (!expiresAtMs.value) return 0
  return Math.max(
    0,
    Math.ceil((expiresAtMs.value - Date.now()) / 86_400_000),
  )
})
const fundsShort = computed(() => {
  const amt = passport.value?.fundsAmount
  if (!amt) return ''
  if (amt >= 1_000_000) return `£${(amt / 1_000_000).toFixed(1)}M`
  if (amt >= 1000) return `£${Math.round(amt / 1000)}K`
  return `£${amt}`
})
const chainShort = computed(() => {
  const c = passport.value?.chainPosition
  if (c === 'sold') return 'Chain free'
  if (c === 'selling') return 'Property to sell'
  if (c === 'ftb') return 'First-time buyer'
  return '—'
})
const idTypeLabel = computed(() => {
  const t = passport.value?.idDocumentType
  if (t === 'passport') return 'UK / EU Passport'
  if (t === 'drivingLicence') return 'UK Driving Licence'
  if (t === 'nationalId') return 'National ID Card'
  return 'Photo ID'
})
const timelineLabel = computed(() => {
  const t = passport.value?.timeline
  return ({ asap: 'Ready now', '3m': '1–3 months', '6m': '3–6 months', flex: 'Flexible' } as any)[t || ''] || ''
})
const propertyTypeLabel = computed(() => {
  const t = (passport.value as any)?.propertyType
  return ({ house: 'House', flat: 'Flat', newBuild: 'New build', any: 'Any' } as any)[t || ''] || ''
})

function formatSignedAt(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Actions ───────────────────────────────────────────────
const goBack = useGoBack('/buyer-profile/view')
function goSign() { router.push('/buyer-profile/sign') }

function downloadPdf() {
  // Server-side PDF generation is Phase 4 work — for now we let the browser
  // print the rendered preview to PDF, which is the same approach the legacy
  // download used. The prototype's "Download PDF" is also a simulation.
  downloading.value = true
  setTimeout(() => {
    window.print()
    downloading.value = false
    showToast({ message: 'PDF prepared', iconEmoji: '✓' })
  }, 200)
}
</script>

<style scoped>
.pv-page {
  min-height: 100dvh;
  background: #fafafa;
  color: #231d45;
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Inter, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-bottom: 16px;
}

.pv-top-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px 6px;
  padding-top: calc(14px + env(safe-area-inset-top));
}
.pv-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fff; border: 1px solid #ececef;
  display: flex; align-items: center; justify-content: center;
  color: #231d45; cursor: pointer; flex-shrink: 0;
}
.pv-nav-centre {
  flex: 1; text-align: center;
  font-size: 14px; font-weight: 800; color: #231d45;
}
.pv-nav-right {
  font-size: 13px; font-weight: 700; color: #00a19a;
  cursor: pointer; padding: 8px 4px; white-space: nowrap;
}

/* PDF doc */
.pv-doc-wrap {
  padding: 10px 0 0;
  animation: pv-fadeUp 0.4s 0.05s both;
}
@keyframes pv-fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.pdf-doc {
  position: relative;
  background: white;
  margin: 0 14px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  isolation: isolate;
}

/* Diagonal repeating watermark — drawn behind every page region except
   the navy header (which sits above via z-index). Uses an inline SVG so
   it survives "print to PDF" cleanly without external assets. */
.pdf-watermark-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='160'><text x='160' y='95' text-anchor='middle' transform='rotate(-24 160 95)' fill='rgba(35,29,69,0.055)' font-family='-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif' font-size='22' font-weight='800' letter-spacing='3'>UMU · VERIFIED</text></svg>");
  background-repeat: repeat;
}
/* Sections / header / validity sit above the watermark. */
.pdf-doc > *:not(.pdf-watermark-layer) {
  position: relative;
  z-index: 1;
}

.pdf-header {
  background: #231d45;
  padding: 18px 20px;
}
.pdf-header-title {
  font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.pdf-header-name {
  font-size: 20px; font-weight: 800; color: white;
  margin-bottom: 4px;
}
.pdf-header-ref {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}
.pdf-header-pills {
  display: flex; flex-wrap: wrap; gap: 5px;
  margin-top: 10px;
}
.pdf-h-pill {
  font-size: 9px; font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 100px;
  padding: 3px 9px;
  color: white;
}

/* Validity period band — sits directly under the navy header */
.pdf-validity {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 12px 18px;
  background: #f2faf8;
  border-bottom: 1px solid #e5f4f2;
}
.pdf-validity.expired {
  background: #fef2f1;
  border-bottom-color: #fbcec9;
}
.pdf-validity-col {
  flex: 1;
  min-width: 0;
}
.pdf-validity-divider {
  width: 1px;
  align-self: stretch;
  margin: 0 12px;
  background: rgba(0, 161, 154, 0.18);
}
.pdf-validity.expired .pdf-validity-divider {
  background: rgba(199, 62, 54, 0.2);
}
.pdf-validity-lbl {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: #6b6783;
  margin-bottom: 2px;
}
.pdf-validity-val {
  font-size: 12px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.1px;
  white-space: nowrap;
}
.pdf-validity-status {
  flex: 1.1;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}
.pdf-validity-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00a19a;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.18);
  flex-shrink: 0;
}
.pdf-validity.expired .pdf-validity-dot {
  background: #c73e36;
  box-shadow: 0 0 0 3px rgba(199, 62, 54, 0.18);
}
.pdf-validity-status-text {
  font-size: 10.5px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: -0.05px;
  text-align: right;
}
.pdf-validity.expired .pdf-validity-status-text {
  color: #882019;
}

.pdf-section {
  padding: 14px 18px;
  border-bottom: 1px solid #f5f5f7;
}
.pdf-section:last-child { border-bottom: none; }
.pdf-section-title {
  font-size: 9px; font-weight: 800; letter-spacing: 1px;
  color: #6b6783;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.pdf-cred-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
}
.pdf-cred-row:last-child { margin-bottom: 0; }
.pdf-cred-label {
  font-size: 12px; font-weight: 700; color: #6b6783;
}
.pdf-cred-value {
  font-size: 12px; font-weight: 800; color: #231d45;
  text-align: right;
}
.pdf-pill {
  font-size: 9px; font-weight: 800;
  background: #f2faf8; color: #007e78;
  border: 1px solid #e5f4f2;
  border-radius: 100px;
  padding: 3px 8px;
  white-space: nowrap;
}

.pdf-sig-placeholder {
  background: #fafafa;
  border: 1.5px dashed #ececef;
  border-radius: 10px;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  font-size: 12px; font-weight: 700;
  color: #9c98ad;
  transition: all 0.15s;
}
.pdf-sig-placeholder:hover {
  border-color: #00a19a;
  color: #007e78;
}
.pdf-sig-done {
  background: #f2faf8;
  border: 1.5px solid #00a19a;
  border-radius: 10px;
  padding: 12px;
}
.pdf-sig-done-label {
  font-size: 13px; font-weight: 800; color: #007e78;
  margin-bottom: 4px;
}
.pdf-sig-img-wrap {
  background: white;
  border-radius: 8px;
  padding: 6px;
  display: inline-block;
}
.pdf-sig-img {
  max-width: 200px;
  max-height: 60px;
  display: block;
}
.pdf-sig-typed {
  font-family: Georgia, serif;
  font-size: 18px; font-style: italic;
  color: #231d45;
  margin-bottom: 6px;
}
.pdf-sig-meta {
  font-size: 10px;
  color: #9c98ad;
  margin-top: 6px;
}

.pdf-watermark {
  font-size: 9px;
  color: #9c98ad;
  font-weight: 600;
  padding: 12px 18px;
  text-align: center;
  background: #fafafa;
}

/* Action buttons */
.pv-actions {
  padding: 14px 22px;
  display: flex; flex-direction: column;
  gap: 8px;
  animation: pv-fadeUp 0.4s 0.15s both;
}
.cta-btn {
  width: 100%;
  background: #00a19a; color: white; border: none;
  border-radius: 14px; padding: 16px;
  font-family: inherit; font-size: 14px; font-weight: 800;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.35);
  cursor: pointer; transition: all 0.15s;
}
.cta-btn:hover { background: #00b6ae; }
.cta-btn:disabled { opacity: 0.6; cursor: progress; }
.cta-btn.outline {
  background: white; color: #231d45;
  border: 1.5px solid #231d45;
  box-shadow: none;
  font-size: 13px; padding: 13px;
}

/* Print styles — when user prints to PDF, hide the chrome and keep the
   navy header / teal validity band / diagonal watermark visible.
   `print-color-adjust: exact` is required for Chromium-based browsers. */
@media print {
  .pv-top-nav, .pv-actions { display: none !important; }
  .pv-page { background: white; padding-bottom: 0; }
  .pdf-doc {
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .pdf-doc,
  .pdf-header,
  .pdf-validity,
  .pdf-watermark-layer,
  .pdf-h-pill,
  .pdf-pill,
  .pdf-validity-dot,
  .pdf-sig-done {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
