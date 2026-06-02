<template>
  <div class="hs-v6-quiz">
    <!-- ── Address card (amber, compact) ───────────────────────────── -->
    <div class="hs-addr-card anim-1">
      <div class="hs-addr-top">
        <div class="hs-addr-pin" />
        <div class="hs-addr-block">
          <div class="hs-addr-line">{{ addressLine }}</div>
          <div class="hs-addr-meta">{{ addressMeta }}</div>
        </div>
      </div>
      <div class="hs-addr-pills">
        <span class="hs-addr-pill">
          <span class="epc-letter" :style="{ background: epcColor }">{{ epcRating || '—' }}</span>
          EPC rating
        </span>
        <span class="hs-addr-pill">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 4 14 11 14 11 22 20 10 13 10" /></svg>
          HomeScore <b style="color: white">{{ initialScore }}</b
          ><span style="opacity: 0.75; font-weight: 600">/100</span>
        </span>
      </div>
      <div class="hs-addr-stat-row">
        <span class="hs-live-pill">
          <span class="hs-live-dot" aria-hidden="true" />
          <span class="hs-live-text">
            <b>{{ searchesTodayDisplay }}</b> checked this HomeScore today
          </span>
        </span>
      </div>
      <!-- Published passports get a "Live interest" signal-bars pill —
           it reads as live activity ("people are tracking THIS verified
           record") rather than the more passive "watching" stat we show
           for unclaimed / in-progress homes. -->
      <div v-if="passportState === 'published'" class="hs-addr-stat-row">
        <span class="hs-live-pill">
          <span class="hs-live-bars" aria-hidden="true">
            <span class="hs-live-bar" />
            <span class="hs-live-bar" />
            <span class="hs-live-bar" />
          </span>
          <span class="hs-live-text">
            <b>Live interest.</b> People are tracking this passport.
          </span>
        </span>
      </div>
      <div v-else class="hs-addr-stat-row">
        <span class="hs-live-pill">
          <svg
            class="hs-addr-stat-eye"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span class="hs-live-text">
            <b>{{ watchersDisplay }}</b>
            {{ watchersCount === 1 ? 'is' : 'are' }} watching this property
          </span>
        </span>
      </div>
    </div>

    <!-- Claim / Passport-state box + explainer drawers (matches HomeScore) -->
    <PassportClaimBox
      :state="passportState"
      :progress-pct="passportProgressPct"
      :sections-done="passportSectionsDone"
      :sections-total="passportSectionsTotal"
      @claim-passport="$emit('claim-passport')"
      @watch="$emit('watch-property')"
      @buy="$emit('buy-passport')"
    />

    <!-- ── Live HomeScore card (animates as user answers) ──────────── -->
    <div class="score-card anim-2" style="margin-top: 12px">
      <div class="score-eyebrow-row">
        <div class="score-eyebrow-mark">HomeScore<sup>™</sup> · Live</div>
        <span class="quiz-live-delta-pill" :class="{ flash: deltaFlash }">{{ deltaText }}</span>
      </div>
      <div class="score-top">
        <div class="score-gauge">
          <svg viewBox="0 0 120 120">
            <defs>
              <linearGradient id="quizGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#00a19a" />
                <stop offset="100%" stop-color="#00b8b0" />
              </linearGradient>
            </defs>
            <circle class="g-bg" cx="60" cy="60" r="50" stroke-width="9" />
            <circle
              class="g-fill"
              cx="60"
              cy="60"
              r="50"
              stroke-width="9"
              stroke-dasharray="314.16"
              :stroke-dashoffset="ringOffset"
              stroke="url(#quizGrad)"
              fill="none"
              stroke-linecap="round"
              style="transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)"
            />
          </svg>
          <div class="g-num">
            <div class="gn-big">{{ liveScore }}</div>
            <div class="gn-small">/ 100</div>
          </div>
        </div>
        <div class="score-summary">
          <div class="score-band">Climbing as you answer</div>
          <div class="score-explainer">
            Each question updates your live score in real time.
            <b>Aim for Level C (55+)</b> to unlock the upgrade marketplace.
          </div>
        </div>
      </div>
      <div class="score-footer" style="padding-top: 12px; margin-top: 12px">
        <div style="flex: 1">
          <div class="quiz-progress-bar-bg">
            <div class="quiz-progress-bar-fill" :style="{ width: progressPct + '%' }" />
          </div>
          <div class="quiz-progress-label">
            {{ answeredCount }} of {{ QUESTS.length }} answered · earn XP for every question
          </div>
        </div>
      </div>
    </div>

    <!-- ── Two ways to update your score ───────────────────────────── -->
    <!-- Bill upload is hidden for now (re-enable via SHOW_BILL_UPLOAD). -->
    <div v-if="SHOW_BILL_UPLOAD" class="two-ways anim-1">
      <div class="two-ways-title">Two ways to update your score</div>
      <div class="two-ways-grid">
        <button
          class="two-ways-opt"
          :class="{ active: mode === 'quiz' }"
          type="button"
          @click="mode = 'quiz'"
        >
          <div class="two-ways-opt-icon">📋</div>
          <div class="two-ways-opt-title">Answer questions</div>
          <div class="two-ways-opt-sub">Work through the list below</div>
        </button>
        <div class="two-ways-or">or</div>
        <button
          class="two-ways-opt"
          :class="{ active: mode === 'bill' }"
          type="button"
          @click="onUploadBill"
        >
          <div class="two-ways-opt-icon">💡</div>
          <div class="two-ways-opt-title">Upload a bill</div>
          <div class="two-ways-opt-sub">Skip the questions</div>
        </button>
      </div>
    </div>

    <!-- ── Section header ─────────────────────────────────────────── -->
    <div class="section-h-row" style="padding-top: 18px; padding-bottom: 6px">
      <div class="section-h">Has your home had these improvements?</div>
      <div class="section-h-sub">{{ answeredCount }} of {{ QUESTS.length }} answered</div>
    </div>

    <!-- ── Quest list (collapsible · 4 options each) ──────────────── -->
    <div class="quest-list">
      <div
        v-for="q in QUESTS"
        :key="q.id"
        class="quest-card v2"
        :class="{
          open: openQuest === q.id,
          answered: !!questState[q.id],
        }"
      >
        <div class="quest-summary" @click="toggleQuest(q.id)">
          <div class="quest-num-circle">{{ q.n }}</div>
          <div class="quest-summary-info">
            <div class="quest-summary-title">{{ q.title }}</div>
            <div class="quest-summary-sub">{{ q.summary }}</div>
          </div>
          <div class="quest-summary-chev">›</div>
        </div>
        <div v-if="openQuest === q.id" class="quest-detail">
          <div class="quest-desc">{{ q.desc }}</div>
          <div class="quest-impact">
            ✦ Score +{{ q.pts }} pts · saves ~£{{ q.save }}/yr · cost {{ q.cost
            }}<template v-if="q.grant"> · 🎁 {{ q.grant }}</template>
          </div>
          <div v-if="q.resultingSap != null" class="quest-resulting">
            Potential rating after step {{ q.n }}:
            <span class="quest-resulting-pill" :class="'grade-' + (q.resultingGrade ?? '').toLowerCase()">
              {{ q.resultingSap }} {{ q.resultingGrade }}
            </span>
          </div>
          <div class="quest-question">Has this been done since the last EPC?</div>
          <div class="quest-options-4">
            <button
              v-for="(o, key) in OPT"
              :key="key"
              type="button"
              class="quest-opt-btn"
              :class="[o.cls, { selected: questState[q.id] === key }]"
              @click.stop="answerQuest(q.id, key)"
            >
              <span class="opt-icon-tile">{{ o.icon }}</span>
              <span>{{ o.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Finish CTA ─────────────────────────────────────────────── -->
    <div class="quiz-finish">
      <button
        class="quiz-finish-btn"
        type="button"
        @click="onFinish"
      >
        🏆 Get my real HomeScore →
      </button>
      <div v-if="answeredCount < QUESTS.length" class="quiz-finish-hint">
        Skipped questions count as "not done". Answer what you know and tap
        above to see your score.
      </div>
    </div>
    <div class="quiz-reset" @click="resetQuests">↺ Start again</div>

    <div style="height: 32px" />

    <!-- ── "Answer at least one question" prompt ───────────────────── -->
    <Teleport to="body">
    <Transition name="bill-modal">
      <div v-if="needAnswerModalOpen" class="modal-overlay hs-v6-quiz-modal" @click.self="needAnswerModalOpen = false">
        <div class="need-answer-sheet" @click.stop>
          <div class="need-answer-icon">📋</div>
          <div class="need-answer-title">Answer at least one question</div>
          <div class="need-answer-sub">
            To work out your updated EPC and real HomeScore, we need to know
            what's changed since the certificate. Answer <b>at least one</b>
            question below and we'll recalculate your score.
          </div>
          <button class="need-answer-btn" type="button" @click="needAnswerModalOpen = false">
            Got it — let's answer
          </button>
        </div>
      </div>
    </Transition>
    </Teleport>

    <!-- ── Bill upload bottom-sheet drawer (Teleported so it lives at
         document.body level and can't be clipped by any parent's
         overflow/transform stacking context) ──────────────────────── -->
    <Teleport to="body">
    <Transition name="bill-modal">
      <div v-if="billModalOpen" class="modal-overlay hs-v6-quiz-modal" @click.self="closeBillModal">
        <div class="modal-sheet" @click.stop>
          <div class="modal-grip" />
          <div class="modal-head">
            <div class="modal-eyebrow">⚡ Shortcut</div>
            <div class="modal-title">Upload a bill — skip the quiz</div>
            <div class="modal-sub">
              Your last gas or electricity bill tells us your real running cost in
              seconds. More accurate than the EPC estimate.
            </div>
          </div>

          <label class="drop-zone" :class="{ 'has-file': !!selectedFile }">
            <input
              ref="fileInputRef"
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              class="drop-zone-input"
              @change="onFileSelected"
            />
            <div class="drop-zone-icon">{{ selectedFile ? '✓' : '📄' }}</div>
            <div class="drop-zone-title">
              {{ selectedFile ? selectedFile.name : 'Drop your bill here' }}
            </div>
            <div class="drop-zone-sub">
              <template v-if="!selectedFile">
                or <span class="drop-zone-tap">tap to browse</span>
              </template>
              <template v-else>
                {{ formatFileSize(selectedFile.size) }} · tap to change
              </template>
            </div>
            <div v-if="!selectedFile" class="drop-zone-formats">
              PDF · JPG · PNG · screenshots
            </div>
          </label>

          <div class="modal-read-row">
            <div class="modal-read-icon">🔎</div>
            <div class="modal-read-text">
              We'll read your <b>kWh</b>, <b>tariff</b> and <b>supplier</b> — that's
              all. The bill itself isn't stored after extraction.
            </div>
          </div>

          <div class="modal-suppliers">
            <div class="modal-suppliers-label">Works with</div>
            <div class="modal-supplier-grid">
              <div class="modal-supplier-tile">Octopus</div>
              <div class="modal-supplier-tile">British Gas</div>
              <div class="modal-supplier-tile">EDF</div>
              <div class="modal-supplier-tile">OVO</div>
              <div class="modal-supplier-tile">E.ON Next</div>
              <div class="modal-supplier-tile">+ 12 more</div>
            </div>
          </div>

          <div class="modal-cta-row">
            <button type="button" class="modal-btn secondary" @click="closeBillModal">
              Maybe later
            </button>
            <button
              type="button"
              class="modal-btn primary"
              :disabled="!selectedFile"
              @click="confirmBillUpload"
            >
              {{ selectedFile ? 'Use this bill' : 'Choose a file' }}
            </button>
          </div>

          <div class="modal-privacy">
            <span class="modal-privacy-icon">🔒</span>
            <span>
              Powered by Ofgem tariff data. We never sell your data and bills are
              deleted after extraction.
            </span>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PassportClaimBox from '~/components/property/PassportClaimBox.vue'

interface Props {
  property: any | null
  initialScore: number
  epcRating: string | null
  epcYear?: number | null
  /** Real searches today from PropertySearchLog (for the views row). */
  searchesToday?: number
  /** Number of users watching this property (wishlist + saved). */
  watchersCount?: number
  /** Passport status — drives the claim box, same as the score screen. */
  passportState?: 'unclaimed' | 'inProgress' | 'published'
  passportProgressPct?: number
  passportSectionsDone?: number
  passportSectionsTotal?: number
}

const props = withDefaults(defineProps<Props>(), {
  epcYear: null,
  searchesToday: 0,
  watchersCount: 0,
  passportState: 'unclaimed',
  passportProgressPct: 0,
  passportSectionsDone: 0,
  passportSectionsTotal: 0,
})

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'finish', payload: { finalScore: number; delta: number; answers: Record<string, string> }): void
  (e: 'upload-bill', file: File): void
  (e: 'claim-passport'): void
  (e: 'watch-property'): void
  (e: 'buy-passport'): void
}>()

// Bill-upload shortcut is parked for now; flip to re-enable the whole
// "Two ways to update your score" block + its drawer.
const SHOW_BILL_UPLOAD = false

const searchesTodayDisplay = computed(() => {
  const n = props.searchesToday ?? 0
  return `${n} ${n === 1 ? 'person' : 'people'}`
})
const watchersDisplay = computed(() => {
  const n = props.watchersCount ?? 0
  return `${n} ${n === 1 ? 'person' : 'people'}`
})

interface Quest {
  id: string
  n: number
  title: string
  summary: string
  desc: string
  stat: string
  pts: number
  save: number
  cost: string
  grant: string | null
  /** Cumulative SAP rating after this step, mirrors the EPC website's
   *  "Potential rating after completing step N" line. */
  resultingSap?: number | null
  resultingGrade?: string | null
}

// Fallback when the property has no EPC recommendations on file.
// (Generic prototype quests, only used if the backend hasn't enriched
// epcRecommendations yet.)
const FALLBACK_QUESTS: Quest[] = [
  { id: 'loft', n: 1, title: 'Increase loft insulation to 270mm', summary: 'Recommended on EPC', desc: "Top up loft insulation to the recommended 270 mm depth.", stat: 'structure', pts: 1, save: 40, cost: '£100–£350', grant: null },
  { id: 'cavity', n: 2, title: 'Cavity wall insulation', summary: 'Recommended on EPC', desc: 'Fill cavity walls to cut heat loss — usually the biggest single annual saving.', stat: 'structure', pts: 8, save: 224, cost: '£500–£1,500', grant: null },
  { id: 'floor', n: 3, title: 'Floor insulation', summary: 'Recommended on EPC', desc: 'Insulate uninsulated suspended or solid floors to stop heat escaping.', stat: 'structure', pts: 3, save: 97, cost: '£800–£1,200', grant: null },
  { id: 'lights', n: 4, title: 'Low energy lighting', summary: 'Recommended on EPC', desc: 'Swap remaining fittings to LED — the cheapest single EPC step.', stat: 'efficiency', pts: 1, save: 45, cost: '£110', grant: null },
  { id: 'solarh', n: 5, title: 'Solar water heating', summary: 'Recommended on EPC', desc: 'Solar thermal collector pre-heats hot water from sunlight.', stat: 'plumbing', pts: 1, save: 40, cost: '£4,000–£6,000', grant: null },
  { id: 'solarp', n: 6, title: 'Solar photovoltaic panels', summary: 'Recommended on EPC', desc: 'Solar PV generates electricity; SEG income for surplus exported to grid.', stat: 'electrics', pts: 9, save: 248, cost: '£9,000–£14,000', grant: 'SEG' },
]

// Heuristic: classify a recommendation into one of the 5 stat pillars
// using its title/improvementType text. Matches the prototype's stat keys.
function classifyStat(title: string, improvementType: string | null): string {
  const t = `${title} ${improvementType ?? ''}`.toLowerCase()
  if (/(solar pv|photovoltaic|electric)/.test(t)) return 'electrics'
  if (/(solar (?:water|thermal)|hot water|cylinder|hot-water)/.test(t)) return 'plumbing'
  if (/(boiler|heating|heat pump|radiator|thermostat|controls|trv)/.test(t)) return 'heating'
  if (/(led|lighting|light)/.test(t)) return 'efficiency'
  return 'structure' // walls, roof, floor, windows, draught — default catch-all
}

// SAP score (0-100) → EPC grade letter (A–G)
function sapToGrade(sap: number): string {
  if (sap >= 92) return 'A'
  if (sap >= 81) return 'B'
  if (sap >= 69) return 'C'
  if (sap >= 55) return 'D'
  if (sap >= 39) return 'E'
  if (sap >= 21) return 'F'
  return 'G'
}

const QUESTS = computed<Quest[]>(() => {
  // Backend may surface recommendations either at the top of the
  // Property row OR nested inside `epcCert`. Try both before falling back.
  const p: any = props.property
  const recs: any[] = p?.epcRecommendations || p?.epcCert?.epcRecommendations
  if (!Array.isArray(recs) || recs.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      '[V6QuizView] No epcRecommendations on property — using fallback quests.',
      'Property id:', (props.property as any)?.id,
      'Postcode:', (props.property as any)?.postcode,
    )
    return FALLBACK_QUESTS
  }

  // The EPC API returns steps in execution order. Preserve that order by
  // sorting on the numeric `id` (improvement-id) when it parses cleanly,
  // falling back to the array index. This matches the "Step 1, 2, 3 …"
  // numbering on find-energy-certificate.service.gov.uk.
  const sorted = [...recs].sort((a, b) => {
    const aNum = Number(a?.id)
    const bNum = Number(b?.id)
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum
    return 0
  })

  let prevSap: number | null = props.initialScore || null

  return sorted.map((r: any, idx: number): Quest => {
    const title = r?.title || r?.improvementDescr || 'EPC recommendation'
    const stat = classifyStat(title, r?.improvementType ?? null)
    const resultingSap: number | null =
      typeof r?.resultingSap === 'number' && Number.isFinite(r.resultingSap)
        ? r.resultingSap
        : null

    // Real points gained on THIS step = resultingSap - prevSap (cumulative
    // EPC ratings). Falls back to a saving-based estimate when SAP isn't
    // provided.
    let pts = 2
    if (resultingSap != null && prevSap != null) {
      pts = Math.max(1, Math.round(resultingSap - prevSap))
    } else {
      const saving = Number(r?.typicalSaving ?? 0)
      if (saving > 0) pts = Math.max(1, Math.round(saving / 28))
    }
    if (resultingSap != null) prevSap = resultingSap

    const grant =
      /eco|warm homes/i.test(`${title} ${r?.improvementType ?? ''}`)
        ? 'ECO'
        : /solar pv|photovoltaic/i.test(title)
          ? 'SEG'
          : /boiler upgrade/i.test(title)
            ? 'BUS'
            : null

    return {
      id: String(r?.id ?? `rec-${idx}`),
      n: idx + 1,
      title,
      summary: r?.improvementType
        ? `EPC: ${r.improvementType}`
        : 'Recommended on EPC',
      desc: r?.description || `An EPC-recommended improvement for this property.`,
      stat,
      pts,
      save: Number(r?.typicalSaving ?? 0) || 0,
      cost: r?.costRange || '—',
      grant,
      resultingSap,
      resultingGrade: resultingSap != null ? sapToGrade(resultingSap) : null,
    }
  })
})

const OPT = {
  yes: { label: 'Yes — done', icon: '✓', cls: 'opt-yes', mult: 1.0 },
  different: { label: 'Done something different', icon: '↻', cls: 'opt-different', mult: 0.5 },
  notyet: { label: 'Not yet', icon: '•', cls: 'opt-not-yet', mult: 0 },
  na: { label: 'Not applicable', icon: '⊘', cls: 'opt-na', mult: 0 },
} as const

type OptKey = keyof typeof OPT

const questState = ref<Record<string, OptKey>>({})
const openQuest = ref<string | null>(null)
const mode = ref<'quiz' | 'bill'>('quiz')
const liveScore = ref(props.initialScore)
const deltaText = ref('+0 pts')
const deltaFlash = ref(false)

const answeredCount = computed(() => Object.keys(questState.value).length)
const progressPct = computed(() => (answeredCount.value / QUESTS.value.length) * 100)
const ringOffset = computed(() => {
  const circumference = 2 * Math.PI * 50 // 314.16
  return circumference - (liveScore.value / 100) * circumference
})

const epcColor = computed(() => {
  const map: Record<string, string> = {
    A: '#008a84',
    B: '#00a19a',
    C: '#7ab040',
    D: '#e6a23c',
    E: '#d86f4a',
    F: '#c04a1a',
    G: '#a52a2a',
  }
  return map[props.epcRating || ''] || '#a8a9ad'
})

const addressLine = computed(() => {
  const p = props.property
  if (!p) return 'Your property'
  return p.addressLine1 || p.fullAddress || 'Your property'
})

const addressMeta = computed(() => {
  const p = props.property
  if (!p) return ''
  const parts: string[] = []
  if (p.postcode) parts.push(p.postcode)
  if (p.propertyType) parts.push(p.propertyType)
  if (p.floorArea) parts.push(`${p.floorArea}m²`)
  return parts.join(' · ')
})

function toggleQuest(id: string) {
  openQuest.value = openQuest.value === id ? null : id
}

function answerQuest(id: string, ans: OptKey) {
  const prev = questState.value[id]
  questState.value = { ...questState.value, [id]: ans }
  const q = QUESTS.value.find((x) => x.id === id)
  if (!q) return
  const prevPts = prev ? Math.round(q.pts * OPT[prev].mult) : 0
  const newPts = Math.round(q.pts * OPT[ans].mult)
  const diff = newPts - prevPts
  const next = Math.max(0, Math.min(100, liveScore.value + diff))
  animateScore(liveScore.value, next, diff)
  // Auto-collapse after short delay
  setTimeout(() => {
    if (openQuest.value === id) openQuest.value = null
  }, 450)
}

function animateScore(from: number, to: number, diff: number) {
  liveScore.value = to
  if (diff !== 0) {
    const sign = diff > 0 ? '+' : ''
    deltaText.value = `${sign}${diff} pts`
    deltaFlash.value = true
    setTimeout(() => {
      deltaFlash.value = false
    }, 600)
  }
}

function resetQuests() {
  questState.value = {}
  openQuest.value = null
  liveScore.value = props.initialScore
  deltaText.value = '+0 pts'
}

// Require at least one answer before we can compute an updated EPC/HomeScore.
const needAnswerModalOpen = ref(false)
function onFinish() {
  if (answeredCount.value === 0) {
    needAnswerModalOpen.value = true
    return
  }
  const delta = liveScore.value - props.initialScore
  emit('finish', {
    finalScore: liveScore.value,
    delta,
    answers: { ...questState.value },
  })
}

// ── Bill upload drawer ────────────────────────────────────────
const billModalOpen = ref(false)
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

function onUploadBill() {
  mode.value = 'bill'
  billModalOpen.value = true
}

function closeBillModal() {
  billModalOpen.value = false
  selectedFile.value = null
  mode.value = 'quiz'
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0] ?? null
  selectedFile.value = f
}

function confirmBillUpload() {
  if (!selectedFile.value) {
    fileInputRef.value?.click()
    return
  }
  // Parsing happens on the backend later. For now, surface the file to the
  // parent so it can POST to the upload endpoint when wired up.
  emit('upload-bill', selectedFile.value)
  billModalOpen.value = false
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

watch(() => props.initialScore, (v) => {
  liveScore.value = v
})
</script>

<style scoped>
/* Inherit the same design tokens as V6ScoreView */
.hs-v6-quiz {
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
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  background: var(--page);
  color: var(--text);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}

/* Soften prototype's 800-weights to match SF Pro app scale */
.hs-v6-quiz :is(.hs-addr-line, .score-band, .gn-big, .quest-summary-title,
  .quest-question, .quest-impact, .two-ways-opt-title) {
  font-weight: 700;
}
.hs-v6-quiz :is(.hs-addr-meta, .score-explainer, .quiz-progress-label,
  .quest-summary-sub, .quest-desc, .two-ways-opt-sub) {
  font-weight: 500;
}

/* App header */
.app-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: var(--card);
  border-bottom: 1px solid var(--border);
}
.back-btn,
.app-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--bg);
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

/* Animation utility */
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
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.anim-1 {
  animation: hs-v6-fadeUp 0.35s 0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.anim-2 {
  animation: hs-v6-fadeUp 0.35s 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Amber address card */
.hs-addr-card {
  margin: 14px 20px 0;
  padding: 22px 22px 18px;
  background: linear-gradient(135deg, #f0a030 0%, #c67c18 50%, #8b4e0a 100%);
  border: none;
  border-radius: 14px;
  box-shadow: 0 12px 32px -8px rgba(180, 100, 20, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  color: white;
  position: relative;
  overflow: hidden;
}
.hs-addr-card::after {
  content: '';
  position: absolute;
  top: -45%;
  right: -15%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 65%);
  pointer-events: none;
}
.hs-addr-card > * {
  position: relative;
  z-index: 1;
}
.hs-addr-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}
.hs-addr-pin {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  margin-top: 8px;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}
.hs-addr-block {
  flex: 1;
  min-width: 0;
}
.hs-addr-line {
  font-size: 20px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 2px;
}
.hs-addr-meta {
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}
.hs-addr-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
.hs-addr-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  font-weight: 800;
  padding: 5px 10px 5px 7px;
  border-radius: 100px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
}
.hs-addr-pill svg {
  width: 10px;
  height: 10px;
}
.hs-addr-pill .epc-letter {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
}
/* Claim CTA + views row — consistent with the Score screen */
.claim-cta-btn {
  display: flex;
  width: 100%;
  margin-top: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  border: none;
  color: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.1px;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.35);
  transition: filter 0.15s;
}
.claim-cta-btn:hover {
  filter: brightness(1.06);
}
.claim-cta-btn svg {
  width: 14px;
  height: 14px;
}
.claim-cta-btn.published {
  background: white;
  color: #8b4e0a;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}
.claim-cta-btn.progress {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  box-shadow: none;
}
.hs-addr-stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 14px;
  flex-wrap: wrap;
}
.hs-addr-stat-row + .hs-addr-stat-row { margin-top: 6px; }
.hs-addr-stat-row .pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-light);
  flex-shrink: 0;
}
.hs-addr-stat-count {
  font-weight: 800;
  color: white;
}

/* Pill background — matches V6ScoreView so both surfaces (results + quiz)
   share the exact same social-proof treatment. */
.hs-addr-stat-row .hs-live-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
}
.hs-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5eead4;
  box-shadow: 0 0 8px rgba(94, 234, 212, 0.7);
  flex-shrink: 0;
}
.hs-live-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.hs-live-bar {
  width: 3px;
  background: #fff;
  border-radius: 1.5px;
  animation: hsLiveBars 1.2s ease-in-out infinite;
  transform-origin: bottom;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.55);
}
.hs-live-bar:nth-child(1) { height: 5px;  animation-delay: 0s; }
.hs-live-bar:nth-child(2) { height: 9px;  animation-delay: 0.15s; }
.hs-live-bar:nth-child(3) { height: 13px; animation-delay: 0.3s; }
@keyframes hsLiveBars {
  0%, 100% { transform: scaleY(0.55); opacity: 0.55; }
  50%      { transform: scaleY(1);    opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .hs-live-bar { animation: none; transform: scaleY(1); opacity: 0.9; }
}
.hs-live-text {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: -0.05px;
  line-height: 1.25;
}
.hs-live-text b { font-weight: 800; }
.hs-addr-stat-row .hs-addr-stat-eye {
  width: 15px;
  height: 15px;
  color: #ffffff;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.28));
}

/* Score card */
.score-card {
  margin: 14px 20px 0;
  padding: 20px 20px 18px;
  background: linear-gradient(180deg, var(--accent-paler) 0%, var(--card) 60%);
  border: 2px solid var(--accent);
  border-radius: 14px;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 161, 154, 0.12);
}
.score-eyebrow-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.score-eyebrow-mark {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.score-eyebrow-mark sup {
  color: var(--accent);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0;
}
.quiz-live-delta-pill {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 100px;
  background: var(--accent-paler);
  color: var(--accent-dark);
  border: 1px solid var(--accent-pale);
  transition: all 0.25s;
}
.quiz-live-delta-pill.flash {
  background: var(--accent);
  color: white;
  border-color: var(--accent-dark);
  transform: scale(1.08);
}
.score-top {
  display: flex;
  align-items: center;
  gap: 18px;
}
.score-gauge {
  position: relative;
  width: 104px;
  height: 104px;
  flex-shrink: 0;
}
.score-gauge svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.g-bg {
  stroke: var(--border-soft);
  fill: none;
}
.g-num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.gn-big {
  font-size: 34px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -1.2px;
  line-height: 1;
}
.gn-small {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-faint);
  margin-top: 2px;
}
.score-summary {
  flex: 1;
  min-width: 0;
}
.score-band {
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.4px;
  margin-bottom: 6px;
  line-height: 1.1;
}
.score-explainer {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.score-explainer b {
  color: var(--accent-dark);
  font-weight: 800;
}
.score-footer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--border-soft);
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
}
.quiz-progress-bar-bg {
  height: 5px;
  background: var(--bg);
  border-radius: 100px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.quiz-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 100px;
  transition: width 0.4s ease;
}
.quiz-progress-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-top: 6px;
}

/* Two ways card */
.two-ways {
  margin: 14px 20px 0;
  padding: 14px 16px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.two-ways-title {
  font-size: 10px;
  font-weight: 800;
  color: var(--accent-dark);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
  text-align: center;
}
.two-ways-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
}
.two-ways-or {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}
.two-ways-opt {
  padding: 14px 8px;
  background: var(--card);
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s;
  font-family: inherit;
}
.two-ways-opt:hover {
  border-color: var(--accent-pale);
}
.two-ways-opt.active {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(0, 161, 154, 0.15);
}
.two-ways-opt-icon {
  font-size: 22px;
  margin-bottom: 5px;
}
.two-ways-opt-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
  letter-spacing: -0.1px;
}
.two-ways-opt.active .two-ways-opt-title {
  color: var(--accent-dark);
}
.two-ways-opt-sub {
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.3;
}

/* Section heading row */
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

/* Quest list */
.quest-list {
  margin: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.quest-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: var(--shadow-card);
  transition: all 0.18s;
  position: relative;
}
.quest-card.answered {
  border-color: var(--accent);
  background: linear-gradient(135deg, var(--accent-paler), var(--card));
}
.quest-card.answered::after {
  content: '✓';
  position: absolute;
  top: 14px;
  right: 14px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.quest-card.v2 .quest-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.quest-num-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
}
.quest-card.v2.answered .quest-num-circle {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  border-color: transparent;
}
.quest-summary-info {
  flex: 1;
  min-width: 0;
}
.quest-summary-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
  line-height: 1.25;
  margin-bottom: 2px;
}
.quest-summary-sub {
  font-size: 11.5px;
  color: var(--text-secondary);
  font-weight: 500;
  line-height: 1.35;
}
.quest-summary-chev {
  font-size: 18px;
  color: var(--text-faint);
  transition: transform 0.2s;
  line-height: 1;
  flex-shrink: 0;
}
.quest-card.v2.open .quest-summary-chev {
  transform: rotate(90deg);
  color: var(--accent-dark);
}
.quest-detail {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid var(--border-soft);
  animation: fadeSlideUp 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.quest-desc {
  font-size: 12.5px;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-bottom: 10px;
}
.quest-impact {
  padding: 9px 12px;
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  color: var(--accent-dark);
  margin-bottom: 14px;
}
.quest-resulting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 14px;
}
.quest-resulting-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.2px;
}
.quest-resulting-pill.grade-a { background: #008a84; }
.quest-resulting-pill.grade-b { background: #00a19a; }
.quest-resulting-pill.grade-c { background: #7ab040; }
.quest-resulting-pill.grade-d { background: #e6a23c; }
.quest-resulting-pill.grade-e { background: #d86f4a; }
.quest-resulting-pill.grade-f { background: #c04a1a; }
.quest-resulting-pill.grade-g { background: #a52a2a; }

.quest-question {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 8px;
  letter-spacing: -0.2px;
}
.quest-options-4 {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.quest-opt-btn {
  padding: 11px 14px;
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 10px;
}
.quest-opt-btn:hover {
  border-color: var(--accent-pale);
  background: var(--bg);
}
.quest-opt-btn .opt-icon-tile {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: white;
  flex-shrink: 0;
}
.quest-opt-btn.opt-yes .opt-icon-tile {
  background: var(--accent);
}
.quest-opt-btn.opt-yes.selected {
  border-color: var(--accent);
  background: var(--accent-paler);
  color: var(--accent-dark);
}
.quest-opt-btn.opt-different .opt-icon-tile {
  background: #7c6fb0;
}
.quest-opt-btn.opt-different.selected {
  border-color: #7c6fb0;
  background: #f2ebfd;
  color: #5b3795;
}
.quest-opt-btn.opt-not-yet .opt-icon-tile {
  background: #a8a9ad;
}
.quest-opt-btn.opt-not-yet.selected {
  border-color: #7c6fb0;
  background: #f7f2fb;
  color: #5b3795;
}
.quest-opt-btn.opt-na {
  color: var(--text-faint);
}
.quest-opt-btn.opt-na .opt-icon-tile {
  background: var(--text-faint);
}
.quest-opt-btn.opt-na.selected {
  border-color: var(--text-faint);
  background: var(--bg);
}

/* Finish */
.quiz-finish {
  margin: 14px 20px 0;
}
.quiz-finish-btn {
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
.quiz-finish-btn:hover:not(:disabled) {
  filter: brightness(1.06);
}
.quiz-finish-hint {
  margin-top: 8px;
  padding: 0 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.4;
}
.quiz-finish-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.quiz-reset {
  padding: 10px 20px 0;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
}

/* ── Bill upload drawer ─────────────────────────────────────── */
.modal-overlay {
  /* Re-declare design tokens locally — the modal is teleported to
     <body> so it loses access to the CSS custom properties defined on
     `.hs-v6-quiz`. Without these, the white sheet renders transparent
     and the supplier tiles / buttons lose their tinted backgrounds. */
  --accent: #00a19a;
  --accent-dark: #008a84;
  --accent-light: #00b8b0;
  --accent-pale: #e5f4f2;
  --accent-paler: #f2faf8;
  --bg: #f5f6fa;
  --card: #ffffff;
  --text: #231d45;
  --text-secondary: #6b7089;
  --text-faint: #a8a9ad;
  --border: #e4e5ed;
  --border-soft: #f0f1f5;
  --shadow-card: 0 2px 8px rgba(35, 29, 69, 0.05);

  position: fixed;
  inset: 0;
  background: rgba(35, 29, 69, 0.55);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  /* Inherit the app's SF Pro Display rather than the default browser
     font (teleport breaks the font-family inherit chain too). */
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: var(--text);
}
.modal-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 22px 22px 0 0;
  padding: 10px 20px calc(22px + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 32px rgba(35, 29, 69, 0.25);
  max-height: 90dvh;
  overflow-y: auto;
}
/* "Answer at least one question" prompt */
.need-answer-sheet {
  width: 100%;
  max-width: 28rem;
  background: var(--card);
  border-radius: 22px 22px 0 0;
  padding: 26px 24px calc(24px + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 32px rgba(35, 29, 69, 0.25);
  text-align: center;
}
.need-answer-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent-paler), var(--accent-pale));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
}
.need-answer-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}
.need-answer-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.55;
  margin-bottom: 20px;
}
.need-answer-sub b {
  color: var(--text);
  font-weight: 800;
}
.need-answer-btn {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 161, 154, 0.35);
  transition: filter 0.15s;
}
.need-answer-btn:hover {
  filter: brightness(1.06);
}
.modal-grip {
  width: 40px;
  height: 4px;
  border-radius: 100px;
  background: var(--border);
  margin: 0 auto 14px;
}
.modal-head {
  text-align: center;
  margin-bottom: 16px;
}
.modal-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--accent-dark);
  background: var(--accent-paler);
  border: 1px solid var(--accent-pale);
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.4px;
  margin-bottom: 6px;
}
.modal-sub {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.drop-zone {
  display: block;
  text-align: center;
  padding: 22px 16px;
  background: var(--accent-paler);
  border: 1.5px dashed var(--accent-pale);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 14px;
}
.drop-zone:hover {
  background: var(--accent-pale);
  border-color: var(--accent);
}
.drop-zone.has-file {
  background: var(--accent-paler);
  border-style: solid;
  border-color: var(--accent);
}
.drop-zone-input {
  display: none;
}
.drop-zone-icon {
  font-size: 32px;
  line-height: 1;
  margin-bottom: 8px;
  color: var(--accent-dark);
}
.drop-zone-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.2px;
  margin-bottom: 4px;
  word-break: break-word;
}
.drop-zone-sub {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}
.drop-zone-tap {
  color: var(--accent-dark);
  font-weight: 700;
}
.drop-zone-formats {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-faint);
  letter-spacing: 0.4px;
  margin-top: 8px;
  text-transform: uppercase;
}
.modal-read-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  background: var(--bg);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  margin-bottom: 14px;
}
.modal-read-icon {
  font-size: 16px;
  flex-shrink: 0;
}
.modal-read-text {
  flex: 1;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1.5;
}
.modal-read-text :deep(b) {
  color: var(--text);
  font-weight: 700;
}
.modal-suppliers {
  margin-bottom: 14px;
}
.modal-suppliers-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.modal-supplier-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.modal-supplier-tile {
  padding: 8px 6px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-align: center;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--text-secondary);
}
.modal-cta-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.modal-btn {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.modal-btn.secondary {
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}
.modal-btn.secondary:hover {
  background: var(--card);
  color: var(--text);
}
.modal-btn.primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
  box-shadow: 0 3px 12px rgba(0, 161, 154, 0.25);
}
.modal-btn.primary:hover:not(:disabled) {
  filter: brightness(1.05);
}
.modal-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.modal-privacy {
  display: flex;
  gap: 6px;
  align-items: flex-start;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-faint);
  line-height: 1.5;
  text-align: left;
}
.modal-privacy-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

/* Transition for the bottom-sheet drawer */
.bill-modal-enter-active,
.bill-modal-leave-active {
  transition: opacity 0.2s ease;
}
.bill-modal-enter-active .modal-sheet,
.bill-modal-leave-active .modal-sheet {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.bill-modal-enter-from,
.bill-modal-leave-to {
  opacity: 0;
}
.bill-modal-enter-from .modal-sheet,
.bill-modal-leave-to .modal-sheet {
  transform: translateY(100%);
}
</style>
