<template>
  <Teleport to="body">
    <div v-if="open" class="ifs-overlay" @click.self="close">
      <div class="ifs-sheet" role="dialog" aria-modal="true">
        <div class="ifs-handle" />
        <div class="ifs-scroll">
          <!-- STATE: routes (per-measure entry) -->
          <div v-if="state === 'routes'" class="ifs-state">
            <div class="ifs-eyebrow">{{ trade.eyebrow }}</div>
            <h3 class="ifs-title">{{ trade.title }}</h3>
            <p class="ifs-lede">
              We're building our vetted network in your area. Here's what you
              can do right now for this measure.
            </p>
            <div class="ifs-acc">
              <span class="ifs-acc-ic">
                <img
                  src="/op-icons/explore/safetyCheck.png"
                  alt=""
                  class="ifs-acc-img"
                  loading="lazy"
                />
              </span>
              <p v-html="trade.acc" />
            </div>

            <div class="ifs-routes">
              <button
                v-if="trade.grant"
                class="ifs-route ifs-route--grant"
                type="button"
                @click="startElig"
              >
                <span class="ifs-r-ic">🎁</span>
                <span class="ifs-r-body">
                  <span class="ifs-r-title">
                    Check if grants could cover this
                    <span class="ifs-badge ifs-badge--money">Free</span>
                  </span>
                  <span class="ifs-r-sub"
                    >3 quick questions. See which schemes you may qualify for
                    before you get quotes.</span
                  >
                </span>
                <span class="ifs-r-arrow">›</span>
              </button>

              <button
                class="ifs-route ifs-route--match"
                type="button"
                @click="goForm"
              >
                <span class="ifs-r-ic">
                  <img
                    src="/op-icons/explore/getMatched.png"
                    alt=""
                    class="ifs-r-img"
                    loading="lazy"
                  />
                </span>
                <span class="ifs-r-body">
                  <span class="ifs-r-title">
                    Get matched
                    <span class="ifs-badge ifs-badge--free">Free</span>
                  </span>
                  <span class="ifs-r-sub"
                    >Leave your details and we'll line up vetted installers for
                    this measure.</span
                  >
                </span>
                <span class="ifs-r-arrow">›</span>
              </button>

              <a
                :href="trade.self.href"
                target="_blank"
                rel="noopener"
                class="ifs-route ifs-route--self"
              >
                <span class="ifs-r-ic">
                  <img
                    src="/op-icons/explore/searchYourself.png"
                    alt=""
                    class="ifs-r-img"
                    loading="lazy"
                  />
                </span>
                <span class="ifs-r-body">
                  <span class="ifs-r-title">{{ trade.self.t }}</span>
                  <span class="ifs-r-sub">{{ trade.self.s }}</span>
                </span>
                <span class="ifs-r-arrow">›</span>
              </a>
            </div>
            <p class="ifs-foot">
              Every request helps us bring installers to your postcode faster.
            </p>
          </div>

          <!-- STATE: eligibility Qs -->
          <div v-else-if="state === 'elig'" class="ifs-state">
            <div class="ifs-eyebrow">Grant check</div>
            <div class="ifs-progress">
              <span :class="{ on: eligStep >= 1 }" />
              <span :class="{ on: eligStep >= 2 }" />
              <span :class="{ on: eligStep >= 3 }" />
            </div>

            <div v-if="eligStep === 1" class="ifs-q">
              <h4>Do you own or rent this home?</h4>
              <p class="ifs-qhint">
                Different schemes apply to owners, private and social tenants.
              </p>
              <div class="ifs-opts">
                <button class="ifs-opt" @click="answer('tenure', 'own')">
                  Own it
                </button>
                <button class="ifs-opt" @click="answer('tenure', 'private')">
                  Private rental
                </button>
                <button class="ifs-opt" @click="answer('tenure', 'social')">
                  Social / council rental
                </button>
              </div>
            </div>

            <div v-else-if="eligStep === 2" class="ifs-q">
              <h4>Does anyone in the home get means-tested benefits?</h4>
              <p class="ifs-qhint">
                e.g. Universal Credit, Pension Credit, income-based JSA/ESA.
              </p>
              <div class="ifs-opts">
                <button class="ifs-opt" @click="answer('benefits', 'yes')">
                  Yes
                </button>
                <button class="ifs-opt" @click="answer('benefits', 'no')">
                  No
                </button>
                <button class="ifs-opt" @click="answer('benefits', 'unsure')">
                  Not sure
                </button>
              </div>
            </div>

            <div v-else class="ifs-q">
              <h4>Roughly, what's the household income?</h4>
              <p class="ifs-qhint">
                Before tax. Helps flag income-capped schemes.
              </p>
              <div class="ifs-opts">
                <button class="ifs-opt" @click="answer('income', 'low')">
                  Under £31,000
                </button>
                <button class="ifs-opt" @click="answer('income', 'high')">
                  £31,000 or more
                </button>
                <button class="ifs-opt" @click="answer('income', 'skip')">
                  Prefer not to say
                </button>
              </div>
            </div>

            <span class="ifs-indicative"
              >⚠️ Indicative only — your installer confirms at survey</span
            >
            <button class="ifs-back-link" @click="state = 'routes'">
              ‹ Back
            </button>
          </div>

          <!-- STATE: eligibility result -->
          <div v-else-if="state === 'result'" class="ifs-state">
            <div v-if="grants.length" class="ifs-result-hero">
              <div class="ifs-rh-ic">🎉</div>
              <h3>You may qualify for funding</h3>
              <p>
                Based on your answers, these schemes could cover part or all of
                this measure. Your installer confirms eligibility at survey.
              </p>
            </div>
            <div v-else class="ifs-result-hero ifs-result-hero--none">
              <div class="ifs-rh-ic">🔍</div>
              <h3>No means-tested grants flagged</h3>
              <p>
                You may not qualify for the income-based schemes, but installers
                can still check local offers — and paying direct is always an
                option. We'll match either way.
              </p>
            </div>

            <div v-if="grants.length" class="ifs-grant-list">
              <div v-for="g in grants" :key="g.name" class="ifs-grant-item">
                <div class="ifs-gi-ic">{{ g.ic }}</div>
                <div class="ifs-gi-body">
                  <div class="ifs-gi-name">{{ g.name }}</div>
                  <div class="ifs-gi-desc">{{ g.desc }}</div>
                </div>
                <span class="ifs-gi-tag">{{ g.tag }}</span>
              </div>
            </div>

            <div class="ifs-prop-lock">
              <span class="ifs-pl-ic">🏠</span>
              <div>
                <div class="ifs-pl-label">Measure · Property</div>
                <div class="ifs-pl-val">
                  {{ trade.measure }} · {{ address }}
                </div>
              </div>
            </div>

            <button class="ifs-submit" @click="goForm">
              Get matched with eligible installers
            </button>
            <button class="ifs-back-link" @click="state = 'routes'">
              ‹ Start over
            </button>
          </div>

          <!-- STATE: capture form -->
          <div v-else-if="state === 'form'" class="ifs-state">
            <div class="ifs-eyebrow">Get matched</div>
            <h3 class="ifs-title">Line up installers</h3>
            <p class="ifs-lede">
              Just the basics — we'll come back with vetted installers. No
              obligation.
            </p>

            <div class="ifs-prop-lock">
              <span class="ifs-pl-ic">🏠</span>
              <div>
                <div class="ifs-pl-label">Measure · Property</div>
                <div class="ifs-pl-val">
                  {{ trade.measure }} · {{ address }}
                </div>
              </div>
            </div>

            <div class="ifs-field">
              <label>Your name</label>
              <input
                v-model="formName"
                type="text"
                placeholder="e.g. Maxine Wilson"
              />
            </div>
            <div class="ifs-field">
              <label>Email or mobile</label>
              <input
                v-model="formContact"
                type="text"
                placeholder="So installers can reach you"
              />
            </div>

            <button class="ifs-submit" @click="goConfirm">
              Request matches
            </button>
            <button class="ifs-back-link" @click="state = 'routes'">
              ‹ Back
            </button>
          </div>

          <!-- STATE: match confirm -->
          <div v-else-if="state === 'confirm'" class="ifs-state">
            <div class="ifs-confirm">
              <div class="ifs-tick">
                <span class="ifs-ring" />
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3>You're on the list</h3>
              <p>
                We'll be in touch with vetted installers for
                <b>{{ trade.measure.toLowerCase() }}</b> at <b>{{ address }}</b
                >{{ grantLine }}.
              </p>
              <div class="ifs-passport">
                <span class="ifs-passport-ic">📗</span>
                <p>
                  Every match request helps us bring installers to
                  <b>{{ postcode || 'your area' }}</b> faster.
                </p>
              </div>
              <button class="ifs-primary" @click="afterConfirm">
                See your requests
              </button>
            </div>
          </div>

          <!-- STATE: requests tracker -->
          <div v-else-if="state === 'tracker'" class="ifs-state">
            <div class="ifs-eyebrow">Your requests</div>
            <h3 class="ifs-title">Match requests</h3>
            <p class="ifs-lede">
              Where each of your match requests has got to. We're sourcing
              vetted installers for these measures.
            </p>

            <div v-if="requests.length === 0" class="ifs-empty">
              <div class="ifs-empty-ic">🧰</div>
              <h4>No requests yet</h4>
              <p>
                Tap <b>Find installers</b> on any measure and we'll start
                sourcing vetted trades for you.
              </p>
            </div>
            <div v-else class="ifs-track">
              <div v-for="(r, i) in requests" :key="i" class="ifs-track-item">
                <div class="ifs-track-top">
                  <div class="ifs-t-ic">🔧</div>
                  <div>
                    <div class="ifs-t-name">{{ r.measure }}</div>
                    <div class="ifs-t-date">{{ r.date }}</div>
                  </div>
                </div>
                <div>
                  <span class="ifs-pill ifs-pill--sourcing">
                    <span class="ifs-dot" />Sourcing installers
                  </span>
                  <span v-if="r.grant" class="ifs-pill ifs-pill--grant"
                    >🎁 {{ r.grant }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- STATE: marketplace early access -->
          <div v-else-if="state === 'market'" class="ifs-state">
            <div class="ifs-ea-hero">
              <div class="ifs-ea-ic">🛒</div>
              <h3>Marketplace — early access</h3>
              <p>
                We're onboarding vetted local trades right now. Join early
                access and we'll open your marketplace the moment installers
                cover {{ postcode || 'your area' }}.
              </p>
            </div>
            <div class="ifs-promise">
              <div class="ifs-promise-row">
                <div class="ifs-p-ic">✅</div>
                <div>
                  <div class="ifs-p-title">UMU-verified suppliers</div>
                  <div class="ifs-p-sub">
                    ID, insurance and accreditation checked before they list.
                  </div>
                </div>
              </div>
              <div class="ifs-promise-row">
                <div class="ifs-p-ic">🔒</div>
                <div>
                  <div class="ifs-p-title">Payments in escrow</div>
                  <div class="ifs-p-sub">
                    Held via UProtect, released when work's signed off.
                  </div>
                </div>
              </div>
              <div class="ifs-promise-row">
                <div class="ifs-p-ic">🎁</div>
                <div>
                  <div class="ifs-p-title">Grant-ready</div>
                  <div class="ifs-p-sub">
                    TrustMark & ECO4-registered trades for funded work.
                  </div>
                </div>
              </div>
            </div>
            <button class="ifs-submit" @click="state = 'ea-form'">
              Join early access
            </button>
            <button class="ifs-back-link" @click="close">‹ Not now</button>
          </div>

          <!-- STATE: early-access form -->
          <div v-else-if="state === 'ea-form'" class="ifs-state">
            <div class="ifs-eyebrow">Early access</div>
            <h3 class="ifs-title">
              Get in the queue for {{ postcode || 'your area' }}
            </h3>
            <p class="ifs-lede">
              We'll open your marketplace the moment vetted trades cover your
              postcode. Tell us what to prioritise.
            </p>

            <div class="ifs-prop-lock">
              <span class="ifs-pl-ic">📍</span>
              <div>
                <div class="ifs-pl-label">Postcode area</div>
                <div class="ifs-pl-val">{{ postcode || '—' }}</div>
              </div>
            </div>

            <div class="ifs-ea-q">Which trades matter most to you?</div>
            <div class="ifs-ea-chips">
              <button
                v-for="c in interestChoices"
                :key="c.value"
                class="ifs-ea-chip"
                :class="{ on: interests.includes(c.value) }"
                type="button"
                @click="toggleInterest(c.value)"
              >
                {{ c.label }}
              </button>
            </div>

            <div class="ifs-field">
              <label>Your name</label>
              <input
                v-model="eaName"
                type="text"
                placeholder="e.g. Maxine Wilson"
              />
            </div>
            <div class="ifs-field">
              <label>Email or mobile</label>
              <input
                v-model="eaContact"
                type="text"
                placeholder="We'll tell you when it opens"
              />
            </div>

            <button class="ifs-submit" @click="submitEarly">
              Join early access
            </button>
            <button class="ifs-back-link" @click="state = 'market'">
              ‹ Back
            </button>
          </div>

          <!-- STATE: early-access confirm -->
          <div v-else-if="state === 'ea-confirm'" class="ifs-state">
            <div class="ifs-confirm">
              <div class="ifs-tick">
                <span class="ifs-ring" />
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3>You're on the early list</h3>
              <p>
                We'll email you the moment vetted trades cover
                <b>{{ postcode || 'your area' }}</b
                >.
                <span v-if="interests.length"
                  >We'll prioritise
                  <b>{{ interests.join(', ').toLowerCase() }}</b> for your
                  area.</span
                >
              </p>
              <div class="ifs-passport">
                <span class="ifs-passport-ic">📈</span>
                <p>
                  Your interest helps us decide
                  <b>which trades to onboard first</b> — the more demand in
                  {{ postcode || 'your area' }}, the sooner it opens.
                </p>
              </div>
              <button class="ifs-primary" @click="close">
                Back to pathway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

type Kind = 'insulation' | 'solarpv' | 'gas' | 'other'
type StateName =
  | 'routes'
  | 'elig'
  | 'result'
  | 'form'
  | 'confirm'
  | 'tracker'
  | 'market'
  | 'ea-form'
  | 'ea-confirm'

const props = withDefaults(
  defineProps<{
    open: boolean
    kind?: Kind
    measureTitle?: string
    propertyId?: string | null
    postcode?: string | null
    address?: string
    initialState?: StateName
  }>(),
  {
    kind: 'other',
    measureTitle: '',
    propertyId: null,
    postcode: '',
    address: '',
    initialState: 'routes',
  },
)

const emit = defineEmits<{
  (e: 'update:open', v: boolean): void
  (e: 'close'): void
}>()

const state = ref<StateName>('routes')
const eligStep = ref(1)
const answers = reactive<{
  tenure?: string
  benefits?: string
  income?: string
}>({})
const formName = ref('')
const formContact = ref('')
const eaName = ref('')
const eaContact = ref('')
const interests = ref<string[]>([])

// Match requests survive: (a) sheet close/reopen — the outer `v-if`
// unmounts everything inside, so a local ref would reset every time,
// (b) navigation elsewhere in the app — a Nuxt `useState` singleton
// backed by localStorage restores the list on any page. Server side
// still has the authoritative record in CaptureEvent rows.
interface TrackedRequest {
  measure: string
  date: string
  status: 'sourcing'
  grant: string | null
}
const REQUESTS_LS_KEY = 'umu.installer.requests'
const requests = useState<TrackedRequest[]>('installer-requests', () => [])
onMounted(() => {
  if (requests.value.length > 0) return
  try {
    const raw = localStorage.getItem(REQUESTS_LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) requests.value = parsed as TrackedRequest[]
    }
  } catch {
    /* corrupt LS is fine — leave empty */
  }
})
function persistRequests() {
  try {
    localStorage.setItem(REQUESTS_LS_KEY, JSON.stringify(requests.value))
  } catch {}
}

const { send: sendCapture } = useCaptureEvent()

const TRADES = {
  insulation: {
    eyebrow: 'Insulation',
    title: 'Find insulation installers',
    measure: 'Insulation',
    code: 'insulation',
    accreditation: 'TrustMark',
    grant: true,
    acc: '<b>Grant-funded work must use a TrustMark-registered installer.</b> Checking funding first keeps you eligible.',
    self: {
      t: 'Search TrustMark yourself',
      s: 'Government-endorsed scheme. Opens TrustMark, filtered near you.',
      href: 'https://www.trustmark.org.uk/homeowners/find-a-tradesperson',
    },
  },
  solarpv: {
    eyebrow: 'Renewables · solar PV',
    title: 'Find solar PV installers',
    measure: 'Solar PV panels',
    code: 'solar_pv',
    accreditation: 'MCS',
    grant: false,
    acc: "<b>Solar PV isn't means-tested for the main grants</b>, but MCS certification matters for export payments (SEG). We'll match MCS installers.",
    self: {
      t: 'Search MCS yourself',
      s: 'The standard for solar & heat pumps. Opens MCS, filtered near you.',
      href: 'https://mcscertified.com/find-an-installer/',
    },
  },
  gas: {
    eyebrow: 'Safety certificates',
    title: 'Book a gas safety check',
    measure: 'Gas safety check (CP12)',
    code: 'gas_safety_check',
    accreditation: 'Gas Safe',
    grant: false,
    acc: "<b>Gas safety checks should be carried out by a Gas Safe registered engineer.</b> We'll match you with appropriately registered engineers for this work.",
    self: {
      t: 'Search Gas Safe yourself',
      s: 'Official register for gas engineers. Opens Gas Safe search.',
      href: 'https://www.gassaferegister.co.uk/find-an-engineer-or-check-the-register/',
    },
  },
  other: {
    eyebrow: 'Verified pro',
    title: 'Find a verified pro',
    measure: 'Home improvement',
    code: 'other',
    accreditation: 'UMU-verified',
    grant: true,
    acc: '<b>Grant-funded work must use a TrustMark-registered installer.</b> Checking funding first keeps you eligible.',
    self: {
      t: 'Search TrustMark yourself',
      s: 'Government-endorsed scheme. Opens TrustMark, filtered near you.',
      href: 'https://www.trustmark.org.uk/homeowners/find-a-tradesperson',
    },
  },
} as const

const trade = computed(() => {
  const base = TRADES[props.kind] ?? TRADES.other
  if (props.measureTitle) {
    return { ...base, measure: props.measureTitle }
  }
  return base
})

const interestChoices = [
  { value: 'Insulation', label: '🧱 Insulation' },
  { value: 'Solar & battery', label: '⚡ Solar & battery' },
  { value: 'Heat pumps', label: '♨️ Heat pumps' },
  { value: 'Windows & doors', label: '🪟 Windows & doors' },
  { value: 'General trades', label: '🔧 General trades' },
]

// --- eligibility engine (illustrative) ---
const grants = ref<
  Array<{ ic: string; name: string; desc: string; tag: string }>
>([])
let lastGrantContext: string | null = null

function computeGrants() {
  const { tenure, benefits, income } = answers
  const lowNeed = benefits === 'yes' || income === 'low'
  const eligibleTenure = tenure === 'own' || tenure === 'private'
  const g: typeof grants.value = []
  if (eligibleTenure && lowNeed) {
    g.push({
      ic: '🏠',
      name: 'Warm Homes: Local Grant',
      desc: 'Up to £15k for insulation & heating in low-EPC homes.',
      tag: 'Likely',
    })
    g.push({
      ic: '⚡',
      name: 'ECO4',
      desc: 'Supplier-funded upgrades for eligible households.',
      tag: 'Likely',
    })
  } else if (eligibleTenure && income === 'high' && benefits === 'no') {
    g.push({
      ic: '🏠',
      name: 'Great British Insulation Scheme',
      desc: 'Not fully means-tested — Council Tax band & EPC based.',
      tag: 'Possible',
    })
  }
  grants.value = g
  lastGrantContext = g.length ? g.map((x) => x.name).join(', ') : null
}

const grantLine = computed(() =>
  answers.tenure && (answers.benefits === 'yes' || answers.income === 'low')
    ? " — and we'll factor in the grants you may qualify for"
    : '',
)

// --- navigation ---
function startElig() {
  answers.tenure = undefined
  answers.benefits = undefined
  answers.income = undefined
  eligStep.value = 1
  state.value = 'elig'
}

function answer(key: 'tenure' | 'benefits' | 'income', value: string) {
  answers[key] = value
  if (key === 'tenure') eligStep.value = 2
  else if (key === 'benefits') eligStep.value = 3
  else if (key === 'income') showResult()
}

function showResult() {
  computeGrants()
  const flagged = grants.value.map((g) => ({
    scheme: g.name,
    likelihood: g.tag.toLowerCase(),
  }))
  sendCapture({
    type: 'grant_check',
    source: 'pathway.grant_check',
    propertyId: props.propertyId ?? null,
    postcode: props.postcode || null,
    contact: null,
    data: {
      answers: { ...answers },
      flagged,
      indicative: true,
      measure: trade.value.measure,
      measureCode: trade.value.code,
    },
  })
  state.value = 'result'
}

function goForm() {
  state.value = 'form'
}

function goConfirm() {
  sendCapture({
    type: 'match_request',
    source: 'pathway.find_installers',
    propertyId: props.propertyId ?? null,
    postcode: props.postcode || null,
    contact: {
      name: formName.value || undefined,
      contact: formContact.value || undefined,
      consentToContact: true,
    },
    data: {
      measure: trade.value.measure,
      measureCode: trade.value.code,
      accreditation: trade.value.accreditation,
      grantContext: lastGrantContext,
    },
  })
  requests.value = [
    {
      measure: trade.value.measure,
      date: 'Requested just now',
      status: 'sourcing',
      grant:
        answers.benefits === 'yes' || answers.income === 'low'
          ? 'Grant check · likely'
          : null,
    },
    ...requests.value,
  ]
  persistRequests()
  lastGrantContext = null
  state.value = 'confirm'
}

function afterConfirm() {
  state.value = 'tracker'
}

function toggleInterest(v: string) {
  const i = interests.value.indexOf(v)
  if (i > -1) interests.value.splice(i, 1)
  else interests.value.push(v)
}

function submitEarly() {
  sendCapture({
    type: 'early_access',
    source: 'marketplace.early_access',
    propertyId: null,
    postcode: props.postcode || null,
    contact: {
      name: eaName.value || undefined,
      contact: eaContact.value || undefined,
      consentToContact: true,
    },
    data: { interests: [...interests.value] },
  })
  state.value = 'ea-confirm'
}

function close() {
  emit('update:open', false)
  emit('close')
}

// Reset to the caller's chosen initial state each time the sheet opens.
// Without this the sheet would re-open on whichever state it last held,
// which surprises the user (e.g. they closed on ea-confirm, tap "Find
// installers" and land back on the confirm page).
watch(
  () => props.open,
  (o) => {
    if (o) {
      state.value = props.initialState
      // Only wipe form fields on a fresh routes open — reopening the
      // tracker or market state shouldn't lose in-progress form input.
      if (props.initialState === 'routes') {
        formName.value = ''
        formContact.value = ''
      }
    }
  },
)
</script>

<style scoped>
/* Reset any inherited box-sizing surprises on the shell. Everything
   below intentionally uses local class names prefixed `ifs-` so the
   pathway page's CSS (which owns `.mission-…`, `.pathway-…`) can't
   collide with the sheet. */
.ifs-overlay {
  /* `fixed` so the scrim + sheet track the visible viewport, not the
     scrolled page. Width is unconstrained on purpose; the sheet
     itself is `max-width:448px` (Tailwind's max-w-md) so it lines
     up with the `.mobile-container` column on desktop preview and
     still fills the screen edge-to-edge on a real mobile viewport. */
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(35, 29, 69, 0.42);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: ifs-fade 0.24s ease;
}
@keyframes ifs-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.ifs-sheet {
  width: 100%;
  max-width: 448px; /* matches Tailwind max-w-md so it lines up with .mobile-container */
  background: #fff;
  border-radius: 26px 26px 0 0;
  box-shadow: 0 -12px 40px rgba(35, 29, 69, 0.2);
  /* dvh = dynamic viewport height, respects mobile browser chrome —
     avoids the drawer being clipped below the address bar which is
     what vh reports on iOS Safari. */
  max-height: 85dvh;
  display: flex;
  flex-direction: column;
  animation: ifs-slide 0.34s cubic-bezier(0.22, 1, 0.36, 1);
  font-family: inherit;
  color: #231d45;
  /* Leave room for the iOS home indicator inside the scrollable
     content area — the sheet itself sits flush at the bottom. */
  padding-bottom: env(safe-area-inset-bottom, 0);
}
@keyframes ifs-slide {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.ifs-handle {
  width: 40px;
  height: 5px;
  border-radius: 3px;
  background: #dbd8e6;
  margin: 12px auto 4px;
  flex-shrink: 0;
}
.ifs-scroll {
  overflow-y: auto;
  padding: 6px 22px 30px;
  flex: 1;
}
.ifs-scroll::-webkit-scrollbar {
  display: none;
}

.ifs-eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #00857f;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.ifs-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: #231d45;
}
.ifs-lede {
  font-size: 13.5px;
  color: #6b6880;
  font-weight: 500;
  line-height: 1.55;
  margin-top: 8px;
}

.ifs-acc {
  display: flex;
  gap: 11px;
  background: #f3effb;
  border: 1px solid #e2d9f5;
  border-radius: 14px;
  padding: 13px 14px;
  margin-top: 16px;
}
.ifs-acc-ic {
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
/* Illustration inside the accreditation-notice icon slot. Slightly
   larger than the emoji it replaces so the shield artwork reads
   without being cramped. */
.ifs-acc-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  display: block;
}
.ifs-acc p {
  font-size: 12.5px;
  color: #4a3f6b;
  font-weight: 500;
  line-height: 1.5;
}
.ifs-acc :deep(b) {
  color: #231d45;
}

.ifs-routes {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
}
.ifs-route {
  border: 1.5px solid #e9e7f0;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: center;
  cursor: pointer;
  background: #fff;
  text-align: left;
  width: 100%;
  font-family: inherit;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.14s, box-shadow 0.14s, transform 0.12s;
}
.ifs-route:hover {
  border-color: #00a19a;
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.12);
}
.ifs-route:active {
  transform: scale(0.99);
}
.ifs-r-ic {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.ifs-route--grant .ifs-r-ic {
  background: #e4f4ec;
}
.ifs-route--match .ifs-r-ic {
  background: #e6f5f4;
}
.ifs-route--self .ifs-r-ic {
  background: #fbf1e1;
}
/* When the icon slot holds a real illustration (not an emoji) drop
   the pastel background — the artwork carries its own tile look. */
.ifs-r-ic:has(.ifs-r-img) {
  background: transparent;
}
.ifs-r-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.ifs-r-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.ifs-r-title {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #231d45;
}
.ifs-badge {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 3px 7px;
  border-radius: 10px;
  text-transform: uppercase;
}
.ifs-badge--free {
  background: #00a19a;
  color: #fff;
}
.ifs-badge--money {
  background: #2e9e6b;
  color: #fff;
}
.ifs-r-sub {
  font-size: 12.5px;
  color: #6b6880;
  font-weight: 500;
  margin-top: 3px;
  line-height: 1.45;
}
.ifs-r-arrow {
  color: #bdb8cc;
  font-size: 20px;
  flex-shrink: 0;
}
.ifs-route:hover .ifs-r-arrow {
  color: #00a19a;
}
.ifs-foot {
  font-size: 11.5px;
  color: #9994ab;
  text-align: center;
  margin-top: 18px;
  font-weight: 500;
  line-height: 1.5;
}

/* eligibility */
.ifs-progress {
  display: flex;
  gap: 6px;
  margin: 16px 0 4px;
}
.ifs-progress span {
  flex: 1;
  height: 5px;
  border-radius: 3px;
  background: #e9e7f0;
}
.ifs-progress span.on {
  background: #00a19a;
}
.ifs-q h4 {
  font-size: 17px;
  font-weight: 800;
  margin-top: 18px;
  letter-spacing: -0.01em;
}
.ifs-qhint {
  font-size: 12.5px;
  color: #6b6880;
  font-weight: 500;
  margin-top: 5px;
}
.ifs-opts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}
.ifs-opt {
  border: 1.5px solid #e9e7f0;
  border-radius: 14px;
  padding: 15px 16px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  color: #231d45;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.14s, background 0.14s;
}
.ifs-opt:hover {
  border-color: #00a19a;
  background: #fbfefe;
}
.ifs-opt:active {
  transform: scale(0.99);
}
.ifs-indicative {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff7e8;
  color: #c18a38;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 10px;
  border-radius: 20px;
  margin-top: 16px;
}
.ifs-back-link {
  background: none;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  color: #6b6880;
  cursor: pointer;
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
}
.ifs-back-link:hover {
  color: #231d45;
}

/* result */
.ifs-result-hero {
  background: linear-gradient(135deg, #00a19a, #00857f);
  border-radius: 20px;
  padding: 22px;
  color: #fff;
  margin-top: 6px;
}
.ifs-result-hero--none {
  background: linear-gradient(135deg, #6b6880, #4a4760);
}
.ifs-rh-ic {
  font-size: 30px;
}
.ifs-result-hero h3 {
  color: #fff;
  font-size: 20px;
  margin-top: 10px;
  font-weight: 800;
}
.ifs-result-hero p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  line-height: 1.5;
  margin-top: 6px;
}
.ifs-grant-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}
.ifs-grant-item {
  display: flex;
  gap: 12px;
  align-items: center;
  border: 1.5px solid #e4f4ec;
  background: #fbfefb;
  border-radius: 14px;
  padding: 13px 14px;
}
.ifs-gi-ic {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: #e4f4ec;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.ifs-gi-body {
  flex: 1;
  min-width: 0;
}
.ifs-gi-name {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.ifs-gi-desc {
  font-size: 11.5px;
  color: #6b6880;
  font-weight: 500;
  margin-top: 2px;
}
.ifs-gi-tag {
  font-size: 10.5px;
  font-weight: 800;
  color: #2e9e6b;
  background: #e4f4ec;
  padding: 4px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

/* property lock strip */
.ifs-prop-lock {
  display: flex;
  gap: 11px;
  align-items: center;
  background: #e6f5f4;
  border-radius: 13px;
  padding: 13px 14px;
  margin-top: 16px;
}
.ifs-pl-ic {
  font-size: 18px;
}
.ifs-pl-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #00857f;
  text-transform: uppercase;
}
.ifs-pl-val {
  font-size: 13.5px;
  font-weight: 700;
  color: #231d45;
  margin-top: 1px;
}

/* form fields */
.ifs-field {
  margin-top: 14px;
}
.ifs-field label {
  font-size: 12.5px;
  font-weight: 700;
  color: #231d45;
  display: block;
  margin-bottom: 6px;
}
.ifs-field input {
  width: 100%;
  border: 1.5px solid #e9e7f0;
  border-radius: 13px;
  padding: 14px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #231d45;
  background: #fbfafe;
}
.ifs-field input:focus {
  outline: none;
  border-color: #00a19a;
  background: #fff;
}
.ifs-field input::placeholder {
  color: #b4afc4;
  font-weight: 500;
}

/* primary CTAs */
.ifs-submit,
.ifs-primary {
  width: 100%;
  color: #fff;
  border: none;
  border-radius: 15px;
  padding: 16px;
  font-family: inherit;
  font-size: 15.5px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 20px;
}
.ifs-submit {
  background: #00a19a;
}
.ifs-submit:hover {
  background: #00857f;
}
.ifs-primary {
  background: #231d45;
  margin-top: 22px;
}
.ifs-submit:active,
.ifs-primary:active {
  transform: scale(0.99);
}

/* confirm state */
.ifs-confirm {
  text-align: center;
  padding: 16px 4px 8px;
}
.ifs-tick {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #e6f5f4;
  margin: 6px auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.ifs-tick svg {
  width: 34px;
  height: 34px;
  stroke: #00a19a;
  stroke-width: 3;
  fill: none;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: ifs-draw 0.5s ease 0.15s forwards;
}
@keyframes ifs-draw {
  to {
    stroke-dashoffset: 0;
  }
}
.ifs-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid #00a19a;
  opacity: 0;
  animation: ifs-pulse 0.6s ease 0.1s;
}
@keyframes ifs-pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.25);
    opacity: 0;
  }
}
.ifs-confirm h3 {
  font-size: 21px;
  font-weight: 800;
}
.ifs-confirm p {
  font-size: 13.5px;
  color: #6b6880;
  font-weight: 500;
  line-height: 1.6;
  margin-top: 10px;
  padding: 0 6px;
}
.ifs-confirm p b {
  color: #231d45;
}
.ifs-passport {
  display: flex;
  gap: 11px;
  align-items: flex-start;
  text-align: left;
  background: #f3effb;
  border: 1px solid #e2d9f5;
  border-radius: 14px;
  padding: 14px;
  margin-top: 20px;
}
.ifs-passport-ic {
  font-size: 17px;
}
.ifs-passport p {
  margin: 0;
  font-size: 12.5px;
  color: #4a3f6b;
  line-height: 1.5;
  font-weight: 500;
}
.ifs-passport p b {
  color: #231d45;
}

/* tracker */
.ifs-track {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}
.ifs-track-item {
  border: 1.5px solid #e9e7f0;
  border-radius: 16px;
  padding: 15px;
}
.ifs-track-top {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.ifs-t-ic {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #e6f5f4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.ifs-t-name {
  font-size: 14.5px;
  font-weight: 800;
  color: #231d45;
}
.ifs-t-date {
  font-size: 11.5px;
  color: #6b6880;
  font-weight: 600;
  margin-top: 2px;
}
.ifs-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 800;
  padding: 5px 10px;
  border-radius: 20px;
  margin-top: 12px;
}
.ifs-pill--sourcing {
  background: #fff7e8;
  color: #c18a38;
}
.ifs-pill--grant {
  background: #f3effb;
  color: #6a4fb5;
  margin-left: 8px;
}
.ifs-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.ifs-empty {
  text-align: center;
  padding: 30px 10px;
}
.ifs-empty-ic {
  font-size: 40px;
}
.ifs-empty h4 {
  font-size: 16px;
  font-weight: 800;
  margin-top: 12px;
}
.ifs-empty p {
  font-size: 13px;
  color: #6b6880;
  font-weight: 500;
  margin-top: 6px;
  line-height: 1.5;
}
.ifs-empty p b {
  color: #231d45;
}

/* early access */
.ifs-ea-hero {
  background: linear-gradient(135deg, #231d45, #3a3168);
  border-radius: 20px;
  padding: 24px;
  color: #fff;
  text-align: center;
  margin-top: 4px;
}
.ifs-ea-ic {
  font-size: 36px;
}
.ifs-ea-hero h3 {
  color: #fff;
  font-size: 21px;
  margin-top: 12px;
  font-weight: 800;
}
.ifs-ea-hero p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  line-height: 1.55;
  margin-top: 8px;
}
.ifs-promise {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}
.ifs-promise-row {
  display: flex;
  gap: 13px;
  align-items: center;
}
.ifs-p-ic {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #e4f4ec;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.ifs-p-title {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
}
.ifs-p-sub {
  font-size: 12px;
  color: #6b6880;
  font-weight: 500;
  margin-top: 2px;
}
.ifs-ea-q {
  font-size: 14px;
  font-weight: 800;
  color: #231d45;
  margin-top: 20px;
}
.ifs-ea-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 12px;
}
.ifs-ea-chip {
  border: 1.5px solid #e9e7f0;
  background: #fff;
  border-radius: 22px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #231d45;
  cursor: pointer;
  transition: all 0.14s;
}
.ifs-ea-chip:hover {
  border-color: #00a19a;
}
.ifs-ea-chip.on {
  background: #00a19a;
  border-color: #00a19a;
  color: #fff;
}
.ifs-ea-chip:active {
  transform: scale(0.97);
}
</style>
