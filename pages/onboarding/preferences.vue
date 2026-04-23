<template>
  <div class="mobile-container">
    <div class="pref-root">
      <!-- ── HEADER ──────────────────────────────────────────────────── -->
      <div class="pref-header">
        <div class="header-glow" />
        <div v-if="phase === 'detail'"></div>
        <div v-else class="welcome_text">🎉 Welcome to umovingu</div>
        <div class="header-nav">
          <button
            v-if="phase === 'detail'"
            class="back-btn"
            @click="phase = 'role'"
          >
            ‹
          </button>
          <!-- <div v-else style="width:34px" /> -->
          <div class="step-label">{{ headerLabel }}</div>
          <!-- <button class="skip-btn" @click="navigateTo('/explore')">Skip</button> -->
        </div>
        <div class="header-body">
          <h1 class="header-title">{{ headerTitle }}</h1>
          <p class="header-sub">{{ headerSub }}</p>
        </div>
      </div>

      <!-- ── PROGRESS BAR ────────────────────────────────────────────── -->
      <div class="prog-strip">
        <span
          class="prog-fill"
          :style="{ width: phase === 'detail' ? '100%' : '0%' }"
        />
      </div>

      <!-- ── ROLE SELECTION ──────────────────────────────────────────── -->
      <div v-if="phase === 'role'" class="pref-scroll">
        <div
          v-for="r in roles"
          :key="r.key"
          class="radio-opt"
          :class="{ sel: selectedRole === r.key }"
          @click="selectRole(r.key)"
          style="margin-bottom: 10px; padding: 16px"
        >
          <div class="role-icon-box" :style="{ background: r.iconBg }">
            {{ r.icon }}
          </div>
          <div style="flex: 1; margin-left: 4px">
            <div class="radio-title">{{ r.label }}</div>
            <div class="radio-desc">{{ r.desc }}</div>
          </div>
          <div class="radio-dot" />
        </div>

        <div class="info-card">
          <strong style="color: #231d45"
            >£900m lost by UK consumers every year</strong
          >
          on aborted transactions. A Passport-verified sale is 12× faster and
          far less likely to fall through.
        </div>

        <div class="trust-grid">
          <div v-for="t in trust" :key="t.icon" class="trust-card">
            <div class="trust-icon">{{ t.icon }}</div>
            <div class="trust-title">{{ t.title }}</div>
            <div class="trust-sub">{{ t.sub }}</div>
          </div>
        </div>
      </div>

      <!-- ── DETAIL SCREEN (single scrollable) ──────────────────────── -->
      <div v-else class="pref-scroll" ref="scrollRef">
        <template v-for="q in activeQuestions" :key="q.id">
          <!-- Section heading -->
          <div v-if="q.type === 'heading'" class="section-heading-row">
            {{ q.label }}
          </div>

          <!-- Text input -->
          <div v-else-if="q.type === 'text'" class="q-section">
            <div class="q-label">{{ q.label }}</div>
            <input
              :value="(a as any)[q.id] || ''"
              @input="(e: any) => ((a as any)[q.id] = e.target.value)"
              type="text"
              :placeholder="q.placeholder"
              class="text-input"
            />
          </div>

          <!-- Chips -->
          <div v-else-if="q.type === 'chips'" class="q-section">
            <div class="q-label">
              {{ q.label }}
              <span v-if="q.multiSelect" class="q-multi">
                · pick all that apply</span
              >
            </div>
            <div v-if="q.hint" class="q-hint">{{ q.hint }}</div>
            <div class="chip-wrap">
              <div
                v-for="opt in q.opts"
                :key="opt.v"
                class="chip"
                :class="{
                  sel: isSelected(q.id, opt.v, !!q.multiSelect),
                  'chip-expander': !!opt.isExpand,
                }"
                @click="
                  pick(
                    q.id,
                    opt.v,
                    !!q.multiSelect,
                    opt.expandKey,
                    !!opt.isExpand,
                  )
                "
              >
                <span v-if="opt.icon" style="font-size: 13px">{{
                  opt.icon
                }}</span
                >{{ opt.v }}
              </div>
              <template v-if="expanded[q.id] && q.expandOpts">
                <div
                  v-for="opt in q.expandOpts"
                  :key="opt.v"
                  class="chip chip-expanded"
                  :class="{ sel: isSelected(q.id, opt.v, !!q.multiSelect) }"
                  @click="pick(q.id, opt.v, !!q.multiSelect)"
                >
                  <span v-if="opt.icon" style="font-size: 13px">{{
                    opt.icon
                  }}</span
                  >{{ opt.v }}
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>

      <!-- ── CTA BAR ─────────────────────────────────────────────────── -->
      <div v-if="phase === 'detail'" class="cta-bar">
        <div class="cta-meta">
          <span class="cta-hint-text">All answers optional</span>
          <span class="cta-count" :class="{ active: answeredCount > 0 }">
            {{
              answeredCount > 0 ? `${answeredCount} answered ✓` : '0 answered'
            }}
          </span>
        </div>
        <button class="btn-brand" :disabled="isLoading" @click="save">
          <span v-if="isLoading" class="spinner" />
          I'm ready to explore →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({ title: 'Preferences - UmovingU', middleware: 'auth' })

const config = useRuntimeConfig()
const route = useRoute()
const scrollRef = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const phase = ref<'role' | 'detail'>('role')
const selectedRole = ref('')

// ── Answers ───────────────────────────────────────────────────────────────

const a = reactive<Record<string, any>>({
  // Buy
  buyLocation: '',
  buyBudget: '',
  buyBedrooms: '',
  buyPropertyType: '',
  buyTenure: '',
  buyMustHaves: [],
  buyerType: '',
  energyImportance: '',
  passportRequired: '',
  // Sell
  sellLocation: '',
  sellPropertyType: '',
  sellBedrooms: '',
  sellTenure: '',
  sellChain: '',
  sellValue: '',
  sellTimeline: '',
  // Landlord
  portfolio: '',
  management: '',
  strategy: [],
  landlordBudget: '',
  financing: '',
  targetYield: '',
  workAppetite: '',
  letType: '',
  llocation: '',
  landlordMustHaves: [],
})

const expanded = reactive<Record<string, boolean>>({})

// ── Static data ───────────────────────────────────────────────────────────

const roles = [
  {
    key: 'buy',
    icon: '🔍',
    iconBg: '#eafaf9',
    label: "I'm looking to buy",
    desc: 'Search properties, check risks, find your home',
  },
  {
    key: 'sell',
    icon: '🏠',
    iconBg: '#eafaf9',
    label: "I'm selling my home",
    desc: 'Build your Passport, get verified, move faster',
  },
  {
    key: 'landlord',
    icon: '🔑',
    iconBg: '#fef3c7',
    label: "I'm a landlord",
    desc: 'Manage compliance, certs & tenant safety in one place',
  },
  {
    key: 'both',
    icon: '🔄',
    iconBg: '#eafaf9',
    label: 'Selling and buying',
    desc: "We'll set up both sides of your move",
  },
]
const trust = [
  { icon: '🔒', title: 'Your data is yours', sub: 'Never sold or shared' },
  { icon: '⚡', title: 'Takes 2 mins', sub: 'Save & continue any time' },
  { icon: '🏆', title: '12× faster', sub: 'to exchange than average' },
]

// ── Question definitions ──────────────────────────────────────────────────

interface Opt {
  v: string
  icon?: string
  expandKey?: string
  isExpand?: boolean
}
interface Question {
  id: string
  type: 'heading' | 'text' | 'chips'
  label?: string
  hint?: string
  multiSelect?: boolean
  opts?: Opt[]
  expandOpts?: Opt[]
  placeholder?: string
}

const H = (label: string): Question => ({
  id: `_h_${label}`,
  type: 'heading',
  label,
})

const buyQuestions: Question[] = [
  {
    id: 'buyLocation',
    type: 'text',
    label: 'WHERE ARE YOU LOOKING?',
    placeholder: 'City, area or postcode',
  },
  {
    id: 'buyBudget',
    type: 'chips',
    label: 'BUDGET',
    opts: [
      { v: 'Under £200k' },
      { v: '£200k–£350k' },
      { v: '£350k–£500k' },
      { v: '£500k–£750k' },
      { v: '£750k–£1m' },
      { v: '£1m+', expandKey: 'buyBudget' },
    ],
    expandOpts: [
      { v: '£1m–£2m' },
      { v: '£2m–£5m' },
      { v: '£5m–£10m' },
      { v: '£10m–£20m' },
      { v: '£20m–£30m' },
      { v: '£30m+' },
    ],
  },
  {
    id: 'buyBedrooms',
    type: 'chips',
    label: 'MINIMUM BEDROOMS',
    opts: [
      { v: 'Studio', icon: '🛏' },
      { v: '1 bed', icon: '🛏' },
      { v: '2 bed', icon: '🛏' },
      { v: '3 bed', icon: '🛏' },
      { v: '4 bed', icon: '🛏' },
      { v: '5 bed+', icon: '🛏', expandKey: 'buyBedrooms' },
    ],
    expandOpts: [
      { v: '5 bed', icon: '🛏' },
      { v: '6 bed', icon: '🛏' },
      { v: '7 bed', icon: '🛏' },
      { v: '8 bed', icon: '🛏' },
      { v: '9 bed', icon: '🛏' },
      { v: '10 bed+', icon: '🛏' },
    ],
  },
  {
    id: 'buyPropertyType',
    type: 'chips',
    label: 'PROPERTY TYPE',
    opts: [
      { v: 'House', icon: '🏠' },
      { v: 'Flat', icon: '🏢' },
      { v: 'Bungalow', icon: '🏡' },
      { v: 'Any' },
      { v: 'Other…', isExpand: true, expandKey: 'buyPropertyType' },
    ],
    expandOpts: [
      { v: 'Land/plot', icon: '🌳' },
      { v: 'Commercial', icon: '🏪' },
      { v: 'Mixed use', icon: '🏬' },
      { v: 'Park home', icon: '🚐' },
    ],
  },
  {
    id: 'buyTenure',
    type: 'chips',
    label: 'TENURE PREFERENCE',
    hint: 'Leasehold properties carry extra risk — we surface this in every listing',
    opts: [{ v: 'Freehold' }, { v: 'Leasehold' }, { v: 'Either' }],
  },
  {
    id: 'buyMustHaves',
    type: 'chips',
    label: 'MUST-HAVES',
    multiSelect: true,
    opts: [
      { v: 'Garden', icon: '🌿' },
      { v: 'Parking', icon: '🚗' },
      { v: 'Chain-free', icon: '⛓️' },
      { v: 'New build', icon: '🏗️' },
      { v: 'EPC A–C', icon: '⚡' },
      { v: 'More…', isExpand: true, expandKey: 'buyMustHaves' },
    ],
    expandOpts: [
      { v: 'Annexe', icon: '🏡' },
      { v: 'Rural/countryside', icon: '🌾' },
      { v: 'Sea view', icon: '🌊' },
      { v: 'Listed building', icon: '🏛' },
      { v: 'Swimming pool', icon: '🏊' },
    ],
  },
  {
    id: 'buyerType',
    type: 'chips',
    label: 'YOU ARE A…',
    opts: [
      { v: 'First-time buyer' },
      { v: 'Moving up' },
      { v: 'Cash buyer' },
      { v: 'Investor' },
    ],
  },
  {
    id: 'energyImportance',
    type: 'chips',
    label: 'HOW IMPORTANT IS ENERGY EFFICIENCY?',
    hint: 'Affects HomeScore™ weighting and running cost estimates',
    opts: [
      { v: 'Very — low bills matter' },
      { v: 'Somewhat' },
      { v: 'Not a priority' },
    ],
  },
]

const passportQuestion: Question = {
  id: 'passportRequired',
  type: 'chips',
  label: 'WOULD YOU BUY WITHOUT A PROPERTY PASSPORT?',
  hint: 'Helps us calibrate how much we flag unverified listings',
  opts: [
    { v: 'No — I need one' },
    { v: 'Depends on price' },
    { v: 'Yes, if the deal is right' },
  ],
}

const sellQuestions: Question[] = [
  {
    id: 'sellLocation',
    type: 'text',
    label: 'WHERE IS IT?',
    placeholder: 'Town, city or postcode',
  },
  {
    id: 'sellPropertyType',
    type: 'chips',
    label: 'PROPERTY TYPE',
    opts: [
      { v: 'Detached', icon: '🏠' },
      { v: 'Semi-detached', icon: '🏘' },
      { v: 'Terraced', icon: '🏚' },
      { v: 'Flat', icon: '🏢' },
      { v: 'Bungalow', icon: '🏡' },
      { v: 'Other…', isExpand: true, expandKey: 'sellPropertyType' },
    ],
    expandOpts: [
      { v: 'Land/plot', icon: '🌳' },
      { v: 'Commercial', icon: '🏪' },
      { v: 'Mixed use', icon: '🏬' },
      { v: 'Park home', icon: '🚐' },
    ],
  },
  {
    id: 'sellBedrooms',
    type: 'chips',
    label: 'BEDROOMS',
    opts: [
      { v: '1', icon: '🛏' },
      { v: '2', icon: '🛏' },
      { v: '3', icon: '🛏' },
      { v: '4', icon: '🛏' },
      { v: '5+', icon: '🛏', expandKey: 'sellBedrooms' },
    ],
    expandOpts: [
      { v: '5', icon: '🛏' },
      { v: '6', icon: '🛏' },
      { v: '7', icon: '🛏' },
      { v: '8+', icon: '🛏' },
    ],
  },
  {
    id: 'sellTenure',
    type: 'chips',
    label: 'TENURE',
    opts: [{ v: 'Freehold' }, { v: 'Leasehold' }],
  },
  {
    id: 'sellChain',
    type: 'chips',
    label: 'CHAIN POSITION',
    hint: 'Buyers pay more for chain-free — this appears on your Passport',
    opts: [
      { v: 'Chain-free', icon: '⛓️' },
      { v: 'Buying onward' },
      { v: 'Part-exchange' },
      { v: 'Not sure yet' },
    ],
  },
  {
    id: 'sellValue',
    type: 'chips',
    label: 'ESTIMATED VALUE',
    opts: [
      { v: 'Under £200k' },
      { v: '£200k–£350k' },
      { v: '£350k–£500k' },
      { v: '£500k–£750k' },
      { v: '£750k–£1m' },
      { v: '£1m+', expandKey: 'sellValue' },
    ],
    expandOpts: [
      { v: '£1m–£2m' },
      { v: '£2m–£5m' },
      { v: '£5m–£10m' },
      { v: '£10m+' },
    ],
  },
  {
    id: 'sellTimeline',
    type: 'chips',
    label: 'HOW SOON DO YOU WANT TO SELL?',
    opts: [
      { v: 'ASAP' },
      { v: '1–3 months' },
      { v: '3–6 months' },
      { v: '6–12 months' },
      { v: 'Just preparing' },
    ],
  },
]

const landlordQuestions: Question[] = [
  H('💼 Your existing portfolio'),
  {
    id: 'portfolio',
    type: 'chips',
    label: 'HOW MANY PROPERTIES DO YOU CURRENTLY OWN?',
    opts: [
      { v: 'None — first purchase', icon: '🏠' },
      { v: '1–2', icon: '🏘' },
      { v: '3–5', icon: '🏢' },
      { v: '6–10', icon: '🏗' },
      { v: '10+', icon: '🏙', expandKey: 'portfolio' },
    ],
    expandOpts: [
      { v: '11–25', icon: '🏘' },
      { v: '26–50', icon: '🏢' },
      { v: '51–100', icon: '🏗' },
      { v: '100+', icon: '🏙' },
    ],
  },
  {
    id: 'management',
    type: 'chips',
    label: 'HOW DO YOU CURRENTLY MANAGE?',
    opts: [
      { v: 'Self-managed', icon: '🔑' },
      { v: 'Letting agent', icon: '🏢' },
      { v: 'Mix of both' },
      { v: 'First purchase' },
    ],
  },
  H("🎯 What you're looking to buy"),
  {
    id: 'strategy',
    type: 'chips',
    label: 'INVESTMENT STRATEGY',
    multiSelect: true,
    opts: [
      { v: 'Buy-to-let yield', icon: '💰' },
      { v: 'Capital growth', icon: '📈' },
      { v: 'Yield + growth', icon: '🎯' },
      { v: 'Below market value', icon: '🏷' },
      { v: 'Refurb & hold', icon: '🔨' },
      { v: 'Refurb & flip', icon: '🔄' },
      { v: 'HMO conversion', icon: '🏘' },
      { v: 'Short-term / Airbnb', icon: '🏖' },
    ],
  },
  {
    id: 'landlordBudget',
    type: 'chips',
    label: 'PURCHASE BUDGET',
    opts: [
      { v: 'Under £100k' },
      { v: '£100k–£200k' },
      { v: '£200k–£350k' },
      { v: '£350k–£500k' },
      { v: '£500k–£1m' },
      { v: '£1m+', expandKey: 'landlordBudget' },
    ],
    expandOpts: [
      { v: '£1m–£2m' },
      { v: '£2m–£5m' },
      { v: '£5m–£10m' },
      { v: '£10m–£20m' },
      { v: '£20m–£30m' },
      { v: '£30m+' },
    ],
  },
  {
    id: 'financing',
    type: 'chips',
    label: 'HOW ARE YOU BUYING?',
    opts: [
      { v: 'Cash buyer', icon: '💵' },
      { v: 'BTL mortgage', icon: '🏦' },
      { v: 'Bridging finance', icon: '⚡' },
      { v: 'Limited company', icon: '🏢' },
      { v: 'Not sure yet' },
    ],
  },
  {
    id: 'targetYield',
    type: 'chips',
    label: 'TARGET GROSS YIELD',
    opts: [
      { v: '4–5%' },
      { v: '6–7%' },
      { v: '8–10%' },
      { v: '10%+' },
      { v: 'Capital growth over yield' },
      { v: 'Not sure yet' },
    ],
  },
  {
    id: 'workAppetite',
    type: 'chips',
    label: 'WORK APPETITE',
    opts: [
      { v: 'Turnkey — ready to let', icon: '✅' },
      { v: 'Light cosmetic work', icon: '🎨' },
      { v: 'Full refurb', icon: '🔨' },
      { v: 'Structural / development', icon: '🏗' },
    ],
  },
  {
    id: 'letType',
    type: 'chips',
    label: 'PREFERRED LET TYPE',
    opts: [
      { v: 'Single let', icon: '🏠' },
      { v: 'HMO / multi-room', icon: '🏘' },
      { v: 'Student let', icon: '🎓' },
      { v: 'Short-term / holiday', icon: '🏖' },
      { v: 'Commercial', icon: '🏪' },
    ],
  },
  {
    id: 'llocation',
    type: 'chips',
    label: 'LOCATION STRATEGY',
    opts: [
      { v: 'Local to me', icon: '📍' },
      { v: 'High-yield North', icon: '🏙' },
      { v: 'London & SE', icon: '🌆' },
      { v: 'University towns', icon: '🎓' },
      { v: 'Coastal', icon: '🌊' },
      { v: 'Flexible', icon: '🗺' },
    ],
  },
  {
    id: 'landlordMustHaves',
    type: 'chips',
    label: 'MUST-HAVES',
    multiSelect: true,
    opts: [
      { v: 'Vacant possession', icon: '🔓' },
      { v: 'Sitting tenant', icon: '🤝' },
      { v: 'No chain', icon: '⛓️' },
      { v: 'EPC D or above', icon: '🌿' },
      { v: 'Planning potential', icon: '📋' },
      { v: 'BMV — below market value', icon: '🏷' },
      { v: 'Off-market deals', icon: '🤫' },
    ],
  },
]

// ── Active question list ──────────────────────────────────────────────────

const activeQuestions = computed((): Question[] => {
  const r = selectedRole.value
  if (r === 'buy') return [...buyQuestions, passportQuestion]
  if (r === 'sell') return sellQuestions
  if (r === 'landlord') return landlordQuestions
  if (r === 'both') {
    return [
      H("🏠 The property you're selling"),
      ...sellQuestions,
      H("🔍 What you're buying next"),
      ...buyQuestions,
      H('📋 A couple more things'),
      passportQuestion,
    ]
  }
  return []
})

// ── Header ────────────────────────────────────────────────────────────────

const headerLabel = computed(() => {
  if (phase.value === 'role') return 'One quick question'
  const map: Record<string, string> = {
    buy: 'Step 2 of 2 — Your preferences',
    sell: 'Step 2 of 2 — Your property',
    landlord: 'Step 2 of 2 — Investment criteria',
    both: 'Step 2 of 2 — Your move',
  }
  return map[selectedRole.value] ?? ''
})
const headerTitle = computed(() => {
  if (phase.value === 'role') return 'What do you want to do?'
  const map: Record<string, string> = {
    buy: 'Tell us about your search',
    sell: 'About your property',
    landlord: 'Your investment profile',
    both: 'Your move — buying & selling',
  }
  return map[selectedRole.value] ?? ''
})
const headerSub = computed(() => {
  if (phase.value === 'role')
    return "We'll set up the right journey for you — takes 30 seconds."
  const map: Record<string, string> = {
    buy: "We'll match you with properties and flag risk before you offer.",
    sell: "We'll get your Passport started and connect you with the right people.",
    landlord:
      "Tell us what you're after — we'll surface the right deals and data.",
    both: 'Tell us about both sides so we can coordinate everything.',
  }
  return map[selectedRole.value] ?? ''
})

// ── Selection helpers ─────────────────────────────────────────────────────

function isSelected(id: string, val: string, multi: boolean): boolean {
  if (multi) return Array.isArray(a[id]) && a[id].includes(val)
  return a[id] === val
}

function pick(
  id: string,
  val: string,
  multi: boolean,
  expandKey?: string,
  isExpander?: boolean,
) {
  if (expandKey) expanded[id] = true
  if (isExpander) return // pure expand trigger, don't select
  if (multi) {
    if (!Array.isArray(a[id])) a[id] = []
    const idx = a[id].indexOf(val)
    if (idx >= 0) a[id].splice(idx, 1)
    else a[id].push(val)
  } else {
    a[id] = val
  }
}

// ── Role selection ────────────────────────────────────────────────────────

function selectRole(key: string) {
  selectedRole.value = key
  setTimeout(() => {
    phase.value = 'detail'
    scrollRef.value?.scrollTo({ top: 0 })
  }, 260)
}

// ── Answered count ────────────────────────────────────────────────────────

const answeredCount = computed(() => {
  let n = 0
  for (const key of Object.keys(a)) {
    const v = a[key]
    if (Array.isArray(v) ? v.length > 0 : v && v.toString().trim() !== '') n++
  }
  return n
})

// ── Save ──────────────────────────────────────────────────────────────────

const budgetToRange: Record<string, [number, number]> = {
  'Under £200k': [0, 200000],
  '£200k–£350k': [200000, 350000],
  '£350k–£500k': [350000, 500000],
  '£500k–£750k': [500000, 750000],
  '£750k–£1m': [750000, 1000000],
  '£1m+': [1000000, 2000000],
  '£1m–£2m': [1000000, 2000000],
  '£2m–£5m': [2000000, 5000000],
  '£5m–£10m': [5000000, 10000000],
}
const valueToNum: Record<string, number> = {
  'Under £200k': 150000,
  '£200k–£350k': 275000,
  '£350k–£500k': 425000,
  '£500k–£750k': 625000,
  '£750k–£1m': 875000,
  '£1m+': 1250000,
  '£1m–£2m': 1500000,
  '£2m–£5m': 3500000,
  '£5m–£10m': 7500000,
  '£10m+': 12000000,
}

async function save() {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const isBuyer =
      selectedRole.value === 'buy' || selectedRole.value === 'both'
    const isSeller =
      selectedRole.value === 'sell' || selectedRole.value === 'both'
    const isLandlord = selectedRole.value === 'landlord'

    const budgetRange =
      isBuyer && a.buyBudget ? budgetToRange[a.buyBudget] : null
    const propValue =
      isSeller && a.sellValue ? valueToNum[a.sellValue] : undefined

    await $fetch(`${config.public.apiBase}/profile/preferences`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        purpose: [selectedRole.value],
        ...(isBuyer
          ? {
              budgetMin: budgetRange?.[0],
              budgetMax: budgetRange?.[1],
              propertyTypes: a.buyPropertyType
                ? [a.buyPropertyType]
                : undefined,
              importantFeatures: a.buyMustHaves.length
                ? a.buyMustHaves
                : undefined,
              buyingTimeline: a.buyBedrooms || undefined,
            }
          : {}),
        ...(isSeller
          ? {
              sellingTimeline: a.sellTimeline || undefined,
              propertyValue: propValue,
              propertyStyles: a.sellPropertyType
                ? [a.sellPropertyType]
                : undefined,
            }
          : {}),
        ...(isLandlord
          ? {
              importantFeatures: [
                ...(a.strategy ?? []),
                ...(a.landlordMustHaves ?? []),
              ].filter(Boolean),
            }
          : {}),
      },
    })
  } catch {
    /* proceed regardless */
  } finally {
    isLoading.value = false
    const isBuyerRole =
      selectedRole.value === 'buy' || selectedRole.value === 'both'
    await navigateTo('/explore')
  }
}

// ── Confetti ──────────────────────────────────────────────────────────────

function runConfetti() {
  if (typeof window === 'undefined') return
  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const colors = [
    '#00A19A',
    '#231d45',
    '#00b5ad',
    '#ffffff',
    '#b2e8e6',
    '#008c86',
  ]
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 120,
    w: 6 + Math.random() * 9,
    h: 5 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.18,
    vx: (Math.random() - 0.5) * 3,
    vy: 2.5 + Math.random() * 3,
    isCircle: Math.random() > 0.45,
    opacity: 1,
  }))

  let frame = 0
  const FRAMES = 160

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of pieces) {
      p.x += p.vx
      p.y += p.vy
      p.angle += p.spin
      if (frame > 90) p.opacity = Math.max(0, p.opacity - 0.015)
      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillStyle = p.color
      if (p.isCircle) {
        ctx.beginPath()
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    }
    frame++
    if (frame < FRAMES) {
      requestAnimationFrame(draw)
    } else {
      document.body.removeChild(canvas)
    }
  }
  requestAnimationFrame(draw)
}

onMounted(() => {
  if (route.query.new === 'true') {
    setTimeout(runConfetti, 350)
  }
})
</script>

<style scoped>
.welcome_text {
  color: #ffffff;
  font-size: 20px;
}

.pref-root {
  min-height: 100dvh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

/* ── Header ──────────────────────────────────────────────────────────── */
.pref-header {
  background: linear-gradient(135deg, #231d45, #2d2560);
  padding: 20px 20px 26px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.header-glow {
  position: absolute;
  right: -20px;
  bottom: -40px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(0, 161, 154, 0.25), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}
.header-nav {
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
  gap: 16px;
}
.back-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  display: grid;
  place-items: center;
  cursor: pointer;
  line-height: 1;
}
.skip-btn {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
}
.step-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  text-align: start;
}
.header-body {
  position: relative;
  z-index: 1;
}
.header-title {
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
  margin: 0 0 4px;
}
.header-sub {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0;
}

/* ── Progress bar ─────────────────────────────────────────────────────── */
.prog-strip {
  height: 3px;
  background: #eef0f6;
  flex-shrink: 0;
  overflow: hidden;
}
.prog-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #00a19a, #008c86);
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* ── Scroll ───────────────────────────────────────────────────────────── */
.pref-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px 20px 220px;
}

/* ── Radio option (role cards) ────────────────────────────────────────── */
.radio-opt {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #eef0f6;
  margin-bottom: 9px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
  font-size: 14px;
  color: #1f2024;
}
.radio-opt:hover {
  border-color: #b2e8e6;
}
.radio-opt.sel {
  border-color: #00a19a;
  background: #eafaf9;
  font-weight: 600;
  color: #008c86;
}
.radio-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #eef0f6;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.radio-opt.sel .radio-dot {
  border-color: #00a19a;
  background: #00a19a;
}
.radio-opt.sel .radio-dot::after {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
}
.role-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  font-size: 22px;
  flex-shrink: 0;
}
.radio-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2024;
}
.radio-desc {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 2px;
}

/* ── Info card ────────────────────────────────────────────────────────── */
.info-card {
  padding: 12px 14px;
  background: #eafaf9;
  border: 1px solid #b2e8e6;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #4a5568;
  line-height: 1.55;
}

/* ── Trust strip ──────────────────────────────────────────────────────── */
.trust-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.trust-card {
  background: #fff;
  border: 1px solid #eef0f6;
  border-radius: 14px;
  padding: 14px 10px;
  text-align: center;
}
.trust-icon {
  font-size: 22px;
  margin-bottom: 6px;
}
.trust-title {
  font-size: 12px;
  font-weight: 700;
  color: #1f2024;
  line-height: 1.3;
  margin-bottom: 3px;
}
.trust-sub {
  font-size: 11.5px;
  color: #94a3b8;
  line-height: 1.4;
}

/* ── Section heading row ──────────────────────────────────────────────── */
.section-heading-row {
  font-size: 14px;
  font-weight: 700;
  color: #1f2024;
  margin: 20px 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eef0f6;
}
.section-heading-row:first-child {
  margin-top: 0;
}

/* ── Question section ─────────────────────────────────────────────────── */
.q-section {
  margin-bottom: 20px;
}
.q-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 8px;
}
.q-multi {
  font-size: 10px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
}
.q-hint {
  font-size: 11px;
  color: #94a3b8;
  font-style: italic;
  margin-bottom: 8px;
  line-height: 1.4;
}

/* ── Text input ───────────────────────────────────────────────────────── */
.text-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  border: 1.5px solid #eef0f6;
  border-radius: 12px;
  background: #fff;
  color: #1f2024;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  font-family: inherit;
  box-sizing: border-box;
}
.text-input:focus {
  border-color: #00a19a;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.1);
}
.text-input::placeholder {
  color: #94a3b8;
}

/* ── Chips ────────────────────────────────────────────────────────────── */
.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1.5px solid #eef0f6;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #1f2024;
  transition:
    border-color 0.12s,
    background 0.12s,
    color 0.12s;
  white-space: nowrap;
}
.chip:hover {
  border-color: #b2e8e6;
}
.chip.sel {
  border-color: #00a19a;
  background: #eafaf9;
  color: #008c86;
}
.chip-expander {
  border-style: dashed;
  color: #94a3b8;
}
.chip-expanded {
  border-color: #b2e8e6;
  background: #eafaf9;
  animation: fadeIn 0.25s ease;
}
.chip-expanded.sel {
  border-color: #00a19a;
  color: #008c86;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ── CTA bar ──────────────────────────────────────────────────────────── */
.cta-bar {
  position: fixed;
  bottom: 0;
  padding: 10px 20px 28px;
  background: #fff;
  border-top: 1px solid #eef0f6;
  z-index: 10;
  min-width: 28rem;
}
.cta-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 2px;
}
.cta-hint-text {
  font-size: 11px;
  color: #94a3b8;
}
.cta-count {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  transition: color 0.2s;
}
.cta-count.active {
  color: #00a19a;
}
.btn-brand {
  width: 100%;
  border: none;
  padding: 15px 18px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: #00a19a;
  color: #fff;
  box-shadow: 0 4px 18px rgba(0, 161, 154, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  transition:
    transform 0.1s,
    opacity 0.15s;
}
.btn-brand:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}
.btn-brand:active:not(:disabled) {
  transform: scale(0.98);
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
