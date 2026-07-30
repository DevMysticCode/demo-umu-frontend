<template>
  <div class="hs-v6-pathway">
    <!-- App header -->
    <div class="app-header">
      <button class="back-btn" type="button" @click="onBack" aria-label="Back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div class="app-header-info">
        <div class="app-header-title">Your pathway</div>
        <div class="app-header-sub">Level {{ fromLevel }} → Level {{ toLevel }} · {{ addressLine }}</div>
      </div>
      <div class="app-header-spacer" />
    </div>

    <!-- Pathway hero -->
    <div class="pathway-hero anim-1">
      <div class="pathway-eyebrow">✦ EPC-recommended route</div>
      <div class="pathway-route">
        <div class="pathway-level-from">
          <div class="pathway-level-letter from">{{ fromLevel }}</div>
          <div class="pathway-level-sub">Now · {{ fromScore }}</div>
        </div>
        <div class="pathway-arrow" />
        <div class="pathway-level-to">
          <div class="pathway-level-letter to">{{ toLevel }}</div>
          <div class="pathway-level-sub">Potential · {{ toScore }}</div>
        </div>
      </div>
      <div class="pathway-stats-row">
        <div class="pathway-stat">
          <div class="pathway-stat-num">+{{ toScore - fromScore }}</div>
          <div class="pathway-stat-label">Points to gain</div>
        </div>
        <div class="pathway-stat">
          <div class="pathway-stat-num">£{{ totalSavings }}</div>
          <div class="pathway-stat-label">/yr saved</div>
        </div>
        <div class="pathway-stat">
          <div class="pathway-stat-num">{{ co2Cut }}t</div>
          <div class="pathway-stat-label">CO₂ cut /yr</div>
        </div>
      </div>
    </div>

    <!-- Grant banner -->
    <div class="grant-banner anim-2">
      <div class="grant-banner-title">
        <img src="/op-icons/congratulations/gift.png" alt="" class="grant-banner-ic" loading="lazy" />
        Grants listed on your EPC
      </div>
      <div class="grant-banner-sub">
        The EPC lists <b>Warm Homes Local Grant</b>, <b>Boiler Upgrade Scheme</b>, and
        <b>Energy Company Obligation (ECO)</b>. Eligibility depends on income and area — your
        installer will check.
      </div>
    </div>

    <!-- Section heading -->
    <div class="section-h-row">
      <div class="section-h">
        EPC's {{ missions.length }} step{{ missions.length === 1 ? '' : 's' }} · in published order
      </div>
      <div v-if="fromScore && toScore" class="section-h-sub">
        {{ fromScore }} → {{ toScore }} points
      </div>
    </div>

    <!-- Empty state when the EPC has no improvement steps -->
    <div v-if="missions.length === 0" class="pathway-empty">
      <div class="pathway-empty-icon">✓</div>
      <div class="pathway-empty-title">No improvements on this EPC</div>
      <div class="pathway-empty-sub">
        The certificate for this property doesn't list any energy-saving
        steps — usually means it's already in good shape.
      </div>
    </div>

    <!-- Mission list -->
    <div v-else class="mission-list anim-3">
      <div
        v-for="(m, i) in missions"
        :key="m.id"
        class="mission-card"
        :class="{ priority: i === 0 && !m.done, 'mission-card--done': m.done }"
      >
        <div class="mission-top">
          <div class="mission-icon">
            <span v-if="m.done" class="mission-done-tick">✓</span>
            <template v-else>
              <img v-if="m.icon && m.icon.startsWith('/')" :src="m.icon" alt="" loading="lazy" class="mission-icon-img" />
              <template v-else>{{ m.icon }}</template>
            </template>
          </div>
          <div class="mission-info">
            <div class="mission-title">
              Step {{ i + 1 }} · {{ m.title }}
              <span v-if="m.done" class="mission-done-pill">Already done</span>
            </div>
            <div class="mission-meta">
              <template v-if="m.done">
                You said this is in place — upload {{ m.docLabel }} to verify it on your Passport.
              </template>
              <template v-else>{{ m.meta }}</template>
            </div>
          </div>
        </div>
        <div v-if="!m.done" class="mission-rewards">
          <span class="quest-reward stat">{{ m.pts }}</span>
          <span class="quest-reward money">{{ m.save }}</span>
          <span class="quest-reward grant">{{ m.cost }}</span>
        </div>
        <div class="mission-actions">
          <template v-if="m.done">
            <button class="mission-btn-verify" type="button" @click="verifyDocsOpen = true">
              <img src="/op-icons/misc/paperClip.png" alt="" class="inline-ic" loading="lazy" /> Verify with a document
            </button>
          </template>
          <template v-else>
            <!-- Phase 1: no live marketplace, but the drawer captures
                 real demand (match request + grant check + early
                 access) so the pathway CTA does something useful.
                 Backed by CaptureEvent rows on the backend — see
                 useCaptureEvent / InstallerFlowSheet. -->
            <button
              class="mission-btn-supplier"
              type="button"
              @click="openInstallerSheet(m)"
            >
              <svg class="mission-btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              {{ m.supplierLabel }}
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Path summary -->
    <div class="path-summary anim-4">
      <div class="path-summary-icon">
        <img src="/op-icons/verify-identity/shield.png" alt="" loading="lazy" />
      </div>
      <div class="path-summary-body">
        <div class="path-summary-title">All suppliers are UMU-verified</div>
        <div class="path-summary-sub">
          Payments held in escrow via UProtect. ECO4-registered installers only.
        </div>
      </div>
    </div>

    <!-- Beyond the pathway teaser — twin progress rings (v6-2) -->
    <div class="moveready-teaser anim-4" @click="goToBoost">
      <div class="moveready-teaser-head">
        <div class="moveready-teaser-eyebrow">✨ Beyond the pathway</div>
        <div class="moveready-teaser-title">See your MoveReady &amp; Passport scores</div>
      </div>
      <div class="moveready-teaser-row">
        <div class="moveready-mini">
          <div class="moveready-mini-ring">
            <svg viewBox="0 0 60 60" aria-hidden="true">
              <circle cx="30" cy="30" r="24" stroke="#E4E5ED" stroke-width="6" fill="none" />
              <circle
                cx="30" cy="30" r="24"
                stroke="url(#mrGrad)" stroke-width="6" fill="none"
                stroke-dasharray="150.8"
                :stroke-dashoffset="150.8 - (mrPct / 100) * 150.8"
                stroke-linecap="round"
                transform="rotate(-90 30 30)"
              />
              <defs>
                <linearGradient id="mrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#7C6FB0" />
                  <stop offset="100%" stop-color="#5B3795" />
                </linearGradient>
              </defs>
            </svg>
            <div class="moveready-mini-num">{{ mrPct }}</div>
          </div>
          <div class="moveready-mini-label">MoveReady</div>
        </div>
        <div class="moveready-mini">
          <div class="moveready-mini-ring">
            <svg viewBox="0 0 60 60" aria-hidden="true">
              <circle cx="30" cy="30" r="24" stroke="#E4E5ED" stroke-width="6" fill="none" />
              <circle
                cx="30" cy="30" r="24"
                stroke="url(#ppGrad)" stroke-width="6" fill="none"
                stroke-dasharray="150.8"
                :stroke-dashoffset="150.8 - (ppPct / 100) * 150.8"
                stroke-linecap="round"
                transform="rotate(-90 30 30)"
              />
              <defs>
                <linearGradient id="ppGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#00B8B0" />
                  <stop offset="100%" stop-color="#008A84" />
                </linearGradient>
              </defs>
            </svg>
            <div class="moveready-mini-num accent">{{ ppPct }}%</div>
          </div>
          <div class="moveready-mini-label">Passport</div>
        </div>
        <div class="moveready-teaser-body">
          <div class="moveready-teaser-line">
            <b>{{ passportDone }} of {{ passportTotal }}</b> Passport sections complete
          </div>
          <div class="moveready-teaser-line2">{{ passportSummary }}</div>
        </div>
        <div class="moveready-teaser-arrow">›</div>
      </div>
    </div>

    <!-- Bottom CTAs
         Phase 1: no live marketplace. Both buttons open the demand-
         capture drawer instead — one collects early-access sign-ups
         for the marketplace, the other lets the user see the
         match requests they've already fired. All demand lands in
         the CaptureEvent table on the backend. -->
    <div class="bottom-cta">
      <button
        class="bottom-cta-btn"
        type="button"
        @click="openMarketplaceSheet"
      >
        🛒 Join the marketplace early access
      </button>
      <button
        class="bottom-cta-secondary"
        type="button"
        @click="openTrackerSheet"
      >
        See your requests
      </button>
    </div>

    <!-- Demand-capture drawer — replaces the coming-soon badge with
         a real flow that records grant checks, match requests and
         early-access sign-ups against the current property. -->
    <InstallerFlowSheet
      v-model:open="installerSheetOpen"
      :kind="installerKind"
      :measure-title="installerMeasureTitle"
      :property-id="propertyId"
      :postcode="propertyPostcode"
      :address="addressLine"
      :initial-state="installerInitialState"
    />

    <!-- Floating "Verify your answers" pill — re-opens the modal if the
         user dismissed it. Only shown when they've claimed at least one
         improvement as done. -->
    <button
      v-if="doneMissionDocs.length > 0 && !verifyDocsOpen"
      class="verify-pill"
      type="button"
      @click="verifyDocsOpen = true"
    >
      <img src="/op-icons/misc/paperClip.png" alt="" class="inline-ic" loading="lazy" /> Verify {{ doneMissionDocs.length }} answer{{ doneMissionDocs.length === 1 ? '' : 's' }}
    </button>

    <!-- Verify-documents modal — pops on first arrival when the user has
         answered the quiz with at least one "already done" answer. Asks
         for the supporting docs so the claimed work can be verified on
         their Property Passport. -->
    <Teleport to="body">
      <div v-if="verifyDocsOpen" class="vd-overlay" @click.self="closeVerifyDocs">
        <div class="vd-sheet">
          <div class="vd-grip" />
          <div class="vd-header">
            <div class="vd-eyebrow">✓ You've already done some of these</div>
            <div class="vd-title">Verify your answers with documents</div>
            <div class="vd-sub">
              You told us {{ doneMissionDocs.length }} improvement{{ doneMissionDocs.length === 1 ? ' is' : 's are' }}
              already in place. Upload a document for each so buyers and lenders
              see a verified record on your Property Passport.
            </div>
          </div>
          <div class="vd-list">
            <label
              v-for="m in doneMissionDocs"
              :key="m.id"
              class="vd-row"
              :class="{ 'vd-row--filled': !!verifyDocsUploaded[m.docKey ?? ''] }"
            >
              <div class="vd-row-ic">{{ m.icon }}</div>
              <div class="vd-row-body">
                <div class="vd-row-title">{{ m.title }}</div>
                <div class="vd-row-sub">{{ m.docLabel }}</div>
                <div v-if="verifyDocsUploaded[m.docKey ?? '']" class="vd-row-file">
                  ✓ {{ verifyDocsUploaded[m.docKey ?? ''] }}
                </div>
              </div>
              <div class="vd-row-cta">
                <span v-if="verifyDocsUploaded[m.docKey ?? '']">Replace</span>
                <span v-else>+ Add</span>
              </div>
              <input
                type="file"
                class="vd-row-file-input"
                accept=".pdf,.jpg,.jpeg,.png,.heic"
                @change="onVerifyDocPicked($event, m.docKey ?? '')"
              />
            </label>
          </div>
          <div class="vd-footer">
            <button class="vd-btn ghost" type="button" @click="closeVerifyDocs">
              Maybe later
            </button>
            <button class="vd-btn primary" type="button" @click="closeVerifyDocs">
              Done
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <div style="height: 32px" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import InstallerFlowSheet from '~/components/homescore/InstallerFlowSheet.vue'

const router = useRouter()
const route = useRoute()
const propertyId = computed(() => String(route.params.id))
const config = useRuntimeConfig()

// Real property data fetched on mount so the pathway page shows the
// actual EPC recommendations for THIS property (not the prototype's
// hard-coded 6 steps).
const property = ref<any>(null)
// Homescore quiz answers — used to mark missions the user has already
// reported as done, and to surface a "verify with documents" prompt.
const quizAnswers = ref<Record<string, string>>({})

onMounted(async () => {
  try {
    const res = await fetch(
      `${config.public.apiBase}/property/${propertyId.value}`,
    )
    if (res.ok) property.value = await res.json()
    // The "Now → Potential" rating and mission list below are both driven
    // by epcRecommendations — if a previous enrichment pass came back
    // empty, "potential" defaults to garbage (can render worse than
    // "now") and the mission list looks like "no improvements" even
    // though the register likely has real recommended steps. Self-heal
    // the same way the main HomeScore page does before rendering either.
    const recs = (property.value as any)?.epcRecommendations
    if (!Array.isArray(recs) || recs.length === 0) {
      try {
        const refreshRes = await fetch(
          `${config.public.apiBase}/property/${propertyId.value}/epc-refresh`,
          { method: 'POST' },
        )
        if (refreshRes.ok) {
          const refreshed = await refreshRes.json()
          const newRecs = (refreshed as any)?.epcRecommendations ?? []
          if (Array.isArray(newRecs) && newRecs.length > 0) {
            property.value = refreshed
          }
        }
      } catch {}
    }
  } catch {
    /* keep null — page falls back to a friendly empty state */
  }
  // Load the user's quiz answers — try the backend first (authed users),
  // then localStorage (guests / unsaved answers). Either source is fine
  // because the doneness heuristic only needs the answer values.
  try {
    const token =
      typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      const r = await fetch(
        `${config.public.apiBase}/property/${propertyId.value}/homescore`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (r.ok) {
        const j = await r.json()
        if (j?.answers && typeof j.answers === 'object') {
          quizAnswers.value = j.answers as Record<string, string>
        }
      }
    }
    if (
      Object.keys(quizAnswers.value).length === 0 &&
      typeof localStorage !== 'undefined'
    ) {
      const raw = localStorage.getItem(`hs_answers_${propertyId.value}`)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          if (parsed && typeof parsed === 'object') quizAnswers.value = parsed
        } catch {}
      }
    }
  } catch {
    /* non-critical — pathway still renders, just without done-state */
  }
  // Pop the verify-documents modal on first visit when the user has at
  // least one "already done" mission. We only auto-open once per visit;
  // they can re-open it from the "Verify your answers" link.
  if (doneMissionDocs.value.length > 0) {
    verifyDocsOpen.value = true
  }
})

const addressLine = computed(() => {
  const p = property.value
  return p?.addressLine1 || 'Your property'
})

const propertyPostcode = computed<string>(() => {
  const p = property.value
  return (p?.postcode || p?.epcCert?.postcode || '') as string
})

// Demand-capture drawer state. `kind` picks the correct trade card
// inside the sheet (TrustMark vs MCS self-search link, grant flow
// on/off, accreditation string logged with the match request).
type InstallerKind = 'insulation' | 'solarpv' | 'other'
type SheetState =
  | 'routes' | 'elig' | 'result' | 'form' | 'confirm'
  | 'tracker' | 'market' | 'ea-form' | 'ea-confirm'
const installerSheetOpen = ref(false)
const installerKind = ref<InstallerKind>('other')
const installerMeasureTitle = ref('')
const installerInitialState = ref<SheetState>('routes')

// Rough mapping mission title → trade kind. Only used to pick which
// accreditation copy (TrustMark vs MCS) the drawer shows; everything
// downstream (capture events) records the exact measure title too.
function kindForMissionTitle(title: string): InstallerKind {
  const t = (title ?? '').toLowerCase()
  if (/solar pv|photovoltaic/.test(t)) return 'solarpv'
  if (/(cavity|wall|loft|roof|floor|insulat)/.test(t)) return 'insulation'
  return 'other'
}

function openInstallerSheet(m: { title: string }) {
  installerKind.value = kindForMissionTitle(m.title)
  installerMeasureTitle.value = m.title
  installerInitialState.value = 'routes'
  installerSheetOpen.value = true
}

function openTrackerSheet() {
  installerInitialState.value = 'tracker'
  installerSheetOpen.value = true
}

function openMarketplaceSheet() {
  installerInitialState.value = 'market'
  installerSheetOpen.value = true
}

const fromScore = computed(() => {
  const p: any = property.value
  return Number(p?.epcScore ?? p?.epcCert?.epcScore ?? 0) || 0
})
const toScore = computed(() => {
  const p: any = property.value
  const raw = Number(p?.epcScorePotential ?? p?.epcCert?.potentialScore ?? 0) || 0
  // A missing/unrefreshed potential score defaults to 0 ("Grade G") — never
  // show a "potential" worse than "now" (e.g. "Now B → Potential G",
  // "+-81 points to gain"). Floor it at the current score instead.
  return Math.max(raw, fromScore.value)
})

// Pick an icon for each EPC recommendation type based on title keywords.
// Returns a path into /op-icons/homescore/. The template branches on
// startsWith('/') to render as <img>, else fall back to emoji.
function iconForRec(title: string): string {
  const t = (title ?? '').toLowerCase()
  if (/solar pv|photovoltaic/.test(t))       return '/op-icons/homescore/lightning.png'
  if (/solar (?:water|thermal)/.test(t))     return '/op-icons/misc/sun.png'
  if (/(loft|roof)/.test(t))                 return '/op-icons/homescore/roof.png'
  if (/(cavity|wall)/.test(t))               return '/op-icons/homescore/walls.png'
  if (/floor/.test(t))                       return '/op-icons/homescore/floor.png'
  if (/(led|light)/.test(t))                 return '/op-icons/homescore/bulb.png'
  if (/(boiler|heat pump|heating)/.test(t))  return '/op-icons/homescore/flame.png'
  if (/thermostat|controls/.test(t))         return '/op-icons/homescore/heatingControls.png'
  if (/hot water|cylinder/.test(t))          return '/op-icons/homescore/tap.png'
  return '✦'
}

function supplierLabelForRec(title: string): string {
  const t = (title ?? '').toLowerCase()
  if (/solar pv|photovoltaic/.test(t)) return 'Find solar PV installers'
  if (/solar (?:water|thermal)/.test(t)) return 'Find solar thermal installers'
  if (/(led|light)/.test(t)) return 'LED suppliers'
  if (/(boiler)/.test(t)) return 'Find Gas Safe engineers'
  if (/heat pump/.test(t)) return 'Find heat-pump installers'
  if (/(thermostat|controls)/.test(t)) return 'Find heating-controls fitters'
  if (/(cavity|wall|loft|roof|floor|insulat)/.test(t))
    return 'Find insulation installers'
  return 'Find a verified pro'
}

function gradeFor(score: number): string {
  if (score >= 92) return 'A'
  if (score >= 81) return 'B'
  if (score >= 69) return 'C'
  if (score >= 55) return 'D'
  if (score >= 39) return 'E'
  if (score >= 21) return 'F'
  return 'G'
}
const fromLevel = computed(() => gradeFor(fromScore.value))
const toLevel = computed(() => gradeFor(toScore.value))

interface Mission {
  id: string
  icon: string
  title: string
  meta: string
  pts: string
  save: string
  cost: string
  supplierLabel: string
  // True when the user's quiz answers say this improvement is already in
  // place — flips the card to a "done · upload to verify" state.
  done: boolean
  // The document the user should upload to verify this completed step,
  // when they've claimed it as done. Null when no upload makes sense.
  docKey: string | null
  docLabel: string | null
}

// Heuristic: given the EPC mission title and the user's quiz answers,
// decide whether the user has already reported this improvement as done.
// Conservative — only flips true when the answer clearly indicates the
// upgrade is in place, not for "partial" or ambiguous responses.
function isMissionDone(
  title: string,
  answers: Record<string, string>,
): { done: boolean; docKey: string | null; docLabel: string | null } {
  const t = (title ?? '').toLowerCase()
  if (/(loft|roof.*insulat)/.test(t) && answers.loftInsulation === 'well') {
    return { done: true, docKey: 'loft-insulation', docLabel: 'Loft insulation photos or installer invoice' }
  }
  if (
    /(cavity|wall.*insulat|external wall|internal wall)/.test(t) &&
    ['cavity_ins', 'solid_ins', 'timber'].includes(answers.wallType)
  ) {
    return { done: true, docKey: 'wall-insulation', docLabel: 'Wall insulation guarantee or CIGA certificate' }
  }
  if (
    /(floor.*insulat)/.test(t) &&
    ['floor_ins', 'concrete'].includes(answers.floorInsulation)
  ) {
    return { done: true, docKey: 'floor-insulation', docLabel: 'Floor insulation invoice or photos' }
  }
  if (
    /(window|glaz)/.test(t) &&
    ['triple', 'new_double'].includes(answers.windows)
  ) {
    return { done: true, docKey: 'glazing', docLabel: 'FENSA / CERTASS certificate' }
  }
  if (/solar pv|photovoltaic/.test(t) && /solar_pv/.test(answers.renewables ?? '')) {
    return { done: true, docKey: 'solar-pv', docLabel: 'MCS certificate for solar PV' }
  }
  if (/solar (?:water|thermal)/.test(t) && /solar_thermal/.test(answers.renewables ?? '')) {
    return { done: true, docKey: 'solar-thermal', docLabel: 'MCS certificate for solar thermal' }
  }
  if (
    /(boiler|heating system|heat pump)/.test(t) &&
    ['heat_pump', 'gas_modern', 'electric_modern'].includes(answers.heatingType)
  ) {
    return { done: true, docKey: 'heating-cert', docLabel: 'Heating system certificate or installer invoice' }
  }
  if (
    /(led|low.energy.light|lighting)/.test(t) &&
    /(led|low)/.test(answers.energyTariff ?? '')
  ) {
    return { done: true, docKey: 'led-lighting', docLabel: 'Photos of LED fittings (optional)' }
  }
  return { done: false, docKey: null, docLabel: null }
}

// Build the mission list from the property's real epcRecommendations.
// Falls back to an empty list (page shows a friendly note) when the
// property has no EPC steps on file.
const missions = computed<Mission[]>(() => {
  const p: any = property.value
  const recs: any[] = p?.epcRecommendations || p?.epcCert?.epcRecommendations
  if (!Array.isArray(recs) || recs.length === 0) return []
  // Preserve the EPC's published order.
  const sorted = [...recs].sort((a, b) => {
    const an = Number(a?.id)
    const bn = Number(b?.id)
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn
    return 0
  })
  return sorted.map((r: any, idx: number) => {
    const title = r?.title || r?.improvementDescr || 'EPC recommendation'
    const sap = Number(r?.resultingSap ?? 0)
    const grade = sap > 0 ? gradeFor(sap) : ''
    const doneInfo = isMissionDone(title, quizAnswers.value)
    return {
      id: String(r?.id ?? idx),
      icon: iconForRec(title),
      title,
      meta:
        r?.description ||
        `Step ${idx + 1} on this property's EPC pathway.`,
      pts: sap > 0 ? `→ ${sap} ${grade}` : `Step ${idx + 1}`,
      save: r?.typicalSaving ? `£${r.typicalSaving}/yr` : '',
      cost: r?.costRange || '',
      supplierLabel: supplierLabelForRec(title),
      done: doneInfo.done,
      docKey: doneInfo.docKey,
      docLabel: doneInfo.docLabel,
    }
  })
})

// Missions the user has reported as done — drives the verify-documents
// modal and the inline "Verify with a document" CTA on the done cards.
const doneMissionDocs = computed(() =>
  missions.value.filter((m) => m.done && m.docKey && m.docLabel),
)

// ── Verify-documents modal state ─────────────────────────────────
const verifyDocsOpen = ref(false)
// Files the user has picked, keyed by docKey. We're not actually wiring
// uploads to the backend yet — this state lets the modal show a "ready
// to upload" indicator so the user knows what they've staged. A backend
// endpoint would replace the in-memory map.
const verifyDocsUploaded = reactive<Record<string, string>>({})

function onVerifyDocPicked(e: Event, docKey: string) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  verifyDocsUploaded[docKey] = file.name
  if (input) input.value = ''
}

function closeVerifyDocs() {
  verifyDocsOpen.value = false
}

const totalSavings = computed(() => {
  const p: any = property.value
  const recs: any[] = p?.epcRecommendations || p?.epcCert?.epcRecommendations
  if (!Array.isArray(recs)) return 0
  return recs.reduce(
    (acc, r) => acc + (Number(r?.typicalSaving) || 0),
    0,
  )
})
const co2Cut = computed(() => {
  const p: any = property.value
  const now = Number(p?.co2Emissions ?? p?.epcCert?.co2Emissions ?? 0)
  const pot = Number(
    p?.co2EmissionsPotential ?? p?.epcCert?.co2EmissionsPotential ?? 0,
  )
  if (!now || !pot || pot >= now) return '0'
  return (now - pot).toFixed(1)
})

function goToMarketplace(missionId: string) {
  router.push(`/homescore/marketplace/${propertyId.value}?focus=${missionId}`)
}
function goToMarketplaceHub() {
  router.push(`/homescore/marketplace`)
}
function goToMatched() {
  router.push(`/homescore/marketplace/${propertyId.value}`)
}
function markDone(_id: string) {
  // Placeholder — backend wiring later
}
function goToBoost() {
  // Pathway is a standalone route; redirect back into the homescore flow
  // and let it switch to the boost screen.
  router.push(`/homescore/${propertyId.value}?screen=boost`)
}

// Back button — restore the homescore screen the user was on before they
// opened the pathway page (passed via `?from=level-up` etc.). Falls back
// to `level-up` because that's the only place the pathway button lives
// today. Bypassing `router.back()` ensures the in-page screen state is
// recreated even if the browser history was nuked.
function onBack() {
  // `replace` rather than `push` so the pathway URL gets removed from
  // browser history. Otherwise back-navigating from the resulting
  // homescore page would bounce the user right back into the pathway
  // they just left, breaking the in-page screen-history retracing
  // (level-up → questions → landing → exit).
  const from = (route.query.from as string) || 'level-up'
  router.replace(`/homescore/${propertyId.value}?screen=${encodeURIComponent(from)}`)
}

// ── "Beyond the pathway" teaser values ─────────────────────────
// MoveReady % and Passport % aren't backed by a live endpoint yet, so we
// derive defensible placeholders from the property's passport state.
// Once the boost flow has counted uploaded docs server-side, swap these
// for real `/property/:id/move-ready` and `/property/:id/passport/summary`
// reads.
const mrPct = computed(() => {
  const p: any = property.value
  if (!p) return 0
  // Seed from whether a passport exists + has been published.
  if (p.passportPublished) return 65
  if (p.hasPassport) return 35
  return 12
})
const ppPct = computed(() => {
  const p: any = property.value
  if (!p) return 0
  if (p.passportPublished) return 70
  if (p.hasPassport) return 40
  return 30
})
const passportTotal = 19 // total passport section templates
const passportDone = computed(() => {
  // Rough estimate from Passport %: 19 sections × (ppPct / 100)
  return Math.round((passportTotal * ppPct.value) / 100)
})
const passportSummary = computed(() => {
  const remaining = passportTotal - passportDone.value
  if (remaining <= 0) return 'All sections complete'
  return `${remaining} section${remaining === 1 ? '' : 's'} to go · tap to boost`
})
</script>

<style scoped>
.hs-v6-pathway {
  --primary: #231d45;
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-light: #00b8b0;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --page: #f0f2f8;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --warning-pale: #fff5e0;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  /* Match the rest of the app: mobile-container width, SF Pro inherited */
  max-width: 28rem;
  width: 100%;
  margin: 0 auto;
  min-height: 100dvh;
  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}

/* Soften prototype's 800-weights to match the SF Pro app scale */
.hs-v6-pathway :is(.app-header-title, .pathway-eyebrow, .pathway-stat-num,
  .grant-banner-title, .mission-title, .path-summary-title,
  .bottom-cta-btn, .moveready-teaser-title, .quest-reward) {
  font-weight: 700;
}
.hs-v6-pathway :is(.app-header-sub, .pathway-stat-label, .grant-banner-sub,
  .mission-meta, .path-summary-sub, .moveready-teaser-sub) {
  font-weight: 500;
}
.hs-v6-pathway .ignored-placeholder {
  /* anchor to keep the soften block scoped */
}

@keyframes hs-v6-fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.anim-1 { animation: hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-2 { animation: hs-v6-fadeUp 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-3 { animation: hs-v6-fadeUp 0.35s 0.28s cubic-bezier(0.22, 1, 0.36, 1) both; }
.anim-4 { animation: hs-v6-fadeUp 0.35s 0.38s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* App header */
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px 10px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: transparent;
}
.back-btn,
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  transition: all 0.15s;
  flex-shrink: 0;
}
.back-btn:hover,
.app-icon-btn:hover {
  background: var(--accent-paler);
  border-color: var(--accent-pale);
  color: var(--accent-dark);
}
.back-btn svg,
.app-icon-btn svg {
  width: 16px;
  height: 16px;
}
.app-header-info {
  flex: 1;
  min-width: 0;
  text-align: center;
}
.app-header-spacer {
  width: 36px;
  flex-shrink: 0;
}
.app-header-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.15;
}
.app-header-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 1px;
}

/* Pathway hero */
.pathway-hero {
  margin: 14px 20px 0;
  padding: 20px 18px 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border-radius: 14px;
  color: white;
  box-shadow: 0 8px 24px rgba(0, 161, 154, 0.25);
  position: relative;
  overflow: hidden;
}
.pathway-hero::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -15%;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16) 0%, transparent 65%);
  pointer-events: none;
}
.pathway-hero > * {
  position: relative;
  z-index: 1;
}
.pathway-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.pathway-route {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}
.pathway-level-from,
.pathway-level-to {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.pathway-level-letter {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
}
.pathway-level-letter.from {
  background: rgba(255, 255, 255, 0.18);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}
.pathway-level-letter.to {
  background: white;
  color: var(--accent-dark);
  border: 2px solid white;
  box-shadow: 0 4px 14px rgba(255, 255, 255, 0.25);
}
.pathway-level-sub {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
}
.pathway-arrow {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.3), white);
  position: relative;
  border-radius: 100px;
}
.pathway-arrow::after {
  content: '→';
  position: absolute;
  top: 50%;
  right: -2px;
  transform: translateY(-50%);
  color: white;
  font-size: 18px;
  font-weight: 800;
}
.pathway-stats-row {
  display: flex;
  gap: 8px;
}
.pathway-stat {
  flex: 1;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  text-align: center;
}
.pathway-stat-num {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.4px;
}
.pathway-stat-label {
  font-size: 9px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-top: 2px;
}

/* Grant banner */
.grant-banner {
  margin: 12px 20px 0;
  padding: 14px 16px;
  background: #f2ebfd;
  border: 1px solid #c9b0f0;
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.grant-banner-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
  letter-spacing: -0.1px;
}
.grant-banner-ic {
  width: 22px;
  height: 22px;
  object-fit: contain;
  flex-shrink: 0;
}
.grant-banner-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
}
.grant-banner-sub :deep(b) {
  color: #5b3795;
  font-weight: 800;
}

/* Section heading */
.section-h-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 18px 20px 10px;
}
.section-h {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.section-h-sub {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-dark);
}

/* Mission list */
.pathway-empty {
  margin: 14px 20px 0;
  padding: 22px 18px;
  background: var(--card);
  border: 1.5px dashed var(--border);
  border-radius: 14px;
  text-align: center;
  box-shadow: var(--shadow-card);
}
.pathway-empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin: 0 auto 10px;
  background: var(--accent-paler);
  color: var(--accent-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
}
.pathway-empty-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}
.pathway-empty-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}

.mission-list {
  padding: 10px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mission-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: var(--shadow-card);
  transition: all 0.18s;
}
.mission-card:hover {
  border-color: var(--accent-pale);
  transform: translateY(-1px);
}
.mission-card.priority {
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
  position: relative;
}
.mission-card.priority::before {
  content: 'PRIORITY';
  position: absolute;
  top: -9px;
  left: 14px;
  padding: 2px 8px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  background: var(--accent);
  color: white;
  border-radius: 100px;
}
.mission-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}
.mission-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.mission-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.mission-card.priority .mission-icon {
  background: transparent;
}
.mission-info {
  flex: 1;
  min-width: 0;
}
.mission-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-bottom: 3px;
  line-height: 1.25;
}
.mission-meta {
  font-size: 11.5px;
  color: var(--text-secondary);
  font-weight: 500;
  line-height: 1.4;
}
.mission-rewards {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.quest-reward {
  padding: 4px 9px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.quest-reward.stat {
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
}
.quest-reward.money {
  background: var(--warning-pale);
  color: #7a5500;
  border: 1px solid rgba(245, 166, 35, 0.3);
}
.quest-reward.grant {
  background: #f2ebfd;
  color: #5b3795;
  border: 1px solid #c9b0f0;
}
.mission-actions {
  display: flex;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border-soft);
}
.mission-btn-supplier {
  flex: 1;
  padding: 11px 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: filter 0.15s;
  box-shadow: 0 3px 10px rgba(0, 161, 154, 0.25);
}
.mission-btn-svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.mission-btn-supplier:hover {
  filter: brightness(1.06);
}

/* Phase-1 'Coming soon' state — dialled-back grey badge so the mission
   card still says "this is where you'll book work" without the loud
   teal CTA that would imply the flow is live. Removed when the
   marketplace launches (see the <template v-else> in mission-actions). */
.mission-btn-supplier--soon {
  background: #f2f3f7;
  color: #6a6e83;
  cursor: not-allowed;
  box-shadow: none;
  border: 1px solid #e5e7eb;
}
.mission-btn-supplier--soon:hover {
  filter: none;
}

/* "Already done" mission state — derived from quiz answers. Dialled
   back colours + a tick icon instead of the loud priority gradient. */
.mission-card--done {
  background: linear-gradient(135deg, #f2faf8, #fff);
  border-color: #cfe9df;
}
.mission-card--done .mission-icon {
  background: #00a19a;
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  display: grid;
  place-items: center;
}
.mission-done-tick {
  display: inline-block;
  line-height: 1;
}
.mission-done-pill {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 161, 154, 0.14);
  color: #007e78;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  vertical-align: middle;
}
.inline-ic {
  width: 14px;
  height: 14px;
  object-fit: contain;
  vertical-align: -2px;
  display: inline-block;
  margin-right: 2px;
}
.mission-btn-verify {
  flex: 1;
  padding: 11px 12px;
  background: #fff;
  color: #007e78;
  border: 1.5px solid #00a19a;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.15s;
}
.mission-btn-verify:hover {
  background: #e2f1ea;
}

/* Floating "Verify N answers" pill — appears at the bottom of the
   pathway when at least one mission is marked done. */
.verify-pill {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  padding: 11px 18px;
  background: #231d45;
  color: #fff;
  border: none;
  border-radius: 999px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(35, 29, 69, 0.32);
  letter-spacing: -0.1px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.verify-pill:hover {
  filter: brightness(1.1);
}

/* ── Verify-documents bottom sheet ──────────────────────────── */
.vd-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: inherit;
}
.vd-sheet {
  width: 100%;
  max-width: 28rem;
  background: #fff;
  border-radius: 22px 22px 0 0;
  max-height: 92dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
.vd-grip {
  width: 42px;
  height: 4px;
  background: #e4e5ed;
  border-radius: 100px;
  margin: 10px auto 0;
}
.vd-header {
  padding: 14px 22px 8px;
  text-align: center;
}
.vd-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: #007e78;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.vd-title {
  font-size: 18px;
  font-weight: 800;
  color: #231d45;
  letter-spacing: -0.3px;
  margin-bottom: 6px;
}
.vd-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.55;
}
.vd-list {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.vd-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f6fa;
  border: 1.5px solid transparent;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.vd-row:hover { background: #eef0f6; }
.vd-row--filled {
  background: rgba(0, 161, 154, 0.08);
  border-color: rgba(0, 161, 154, 0.32);
}
.vd-row-ic {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff;
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
}
.vd-row-body { flex: 1; min-width: 0; }
.vd-row-title {
  font-size: 13px;
  font-weight: 800;
  color: #231d45;
  margin-bottom: 2px;
}
.vd-row-sub {
  font-size: 11px;
  font-weight: 500;
  color: #6b7089;
  line-height: 1.4;
}
.vd-row-file {
  font-size: 11px;
  font-weight: 700;
  color: #007e78;
  margin-top: 4px;
}
.vd-row-cta {
  font-size: 12px;
  font-weight: 800;
  color: #007e78;
  flex-shrink: 0;
}
.vd-row-file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.vd-footer {
  display: flex;
  gap: 8px;
  padding: 12px 16px 18px;
}
.vd-btn {
  flex: 1;
  padding: 13px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  border-radius: 12px;
  cursor: pointer;
  border: none;
}
.vd-btn.primary {
  background: linear-gradient(135deg, #00a19a, #008a84);
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.3);
}
.vd-btn.primary:hover { filter: brightness(1.06); }
.vd-btn.ghost {
  background: #fff;
  border: 1.5px solid #e4e5ed;
  color: #6b7089;
}
.vd-btn.ghost:hover { background: #f5f6fa; }
.mission-btn-done {
  padding: 11px 16px;
  background: var(--card);
  color: var(--text-secondary);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.mission-btn-done:hover {
  border-color: var(--accent-pale);
  background: var(--accent-paler);
  color: var(--accent-dark);
}

/* Path summary */
.path-summary {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 12px;
}
.path-summary-icon {
  font-size: 22px;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}
.path-summary-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.path-summary-body {
  flex: 1;
}
.path-summary-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
}
.path-summary-sub {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Bottom CTA */
.bottom-cta {
  padding: 16px 20px 24px;
}
.bottom-cta-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border: none;
  border-radius: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: filter 0.15s;
}
.bottom-cta-btn:hover {
  filter: brightness(1.06);
}
.bottom-cta-secondary {
  width: 100%;
  padding: 14px;
  background: var(--card);
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.15s;
}
.bottom-cta-secondary:hover {
  border-color: var(--accent-pale);
  background: var(--accent-paler);
}

/* Beyond the pathway teaser — two-section layout (v6-2) */
.moveready-teaser {
  margin: 12px 20px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f2ebfd 0%, var(--card) 100%);
  border: 1.5px solid #c9b0f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.18s;
}
.moveready-teaser:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(91, 55, 149, 0.15);
}
.moveready-teaser-head {
  margin-bottom: 10px;
}
.moveready-teaser-eyebrow {
  font-size: 9.5px;
  font-weight: 700;
  color: #5b3795;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}
.moveready-teaser-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-top: 3px;
}
.moveready-teaser-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.moveready-mini {
  text-align: center;
  flex-shrink: 0;
}
.moveready-mini-ring {
  position: relative;
  width: 54px;
  height: 54px;
}
.moveready-mini-ring svg {
  width: 100%;
  height: 100%;
}
.moveready-mini-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #5b3795;
  letter-spacing: -0.3px;
}
.moveready-mini-num.accent {
  color: var(--accent-dark);
}
.moveready-mini-label {
  font-size: 9px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-top: 4px;
}
.moveready-teaser-body {
  flex: 1;
  min-width: 0;
}
.moveready-teaser-line {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}
.moveready-teaser-line :deep(b) {
  color: #5b3795;
  font-weight: 700;
}
.moveready-teaser-line2 {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: 3px;
}
.moveready-teaser-arrow {
  font-size: 20px;
  color: #5b3795;
  flex-shrink: 0;
}
</style>
