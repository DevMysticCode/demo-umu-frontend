<template>
  <div class="mobile-container">
    <div class="ob-page">
      <!-- ── HEADER (light, no purple block — prototype `.ob-header`) ── -->
      <div class="ob-header">
        <button
          v-if="phase === 'detail'"
          class="ob-back"
          aria-label="Back"
          @click="phase = 'role'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          v-else
          class="ob-back"
          aria-label="Back"
          @click="$router.back()"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div class="ob-step">{{ stepIndicator }}</div>
        <button class="ob-skip" @click="navigateTo('/dashboard')">Skip</button>
      </div>
      <div class="ob-progress">
        <div
          class="ob-progress-bar"
          :style="{ width: phase === 'detail' ? '100%' : '50%' }"
        />
      </div>

      <!-- ── INTRO BLOCK (eyebrow pill + title + sub) ── -->
      <div class="ob-intro">
        <div class="ob-eyebrow">
          <span class="pulse" />{{ eyebrowLabel }}
        </div>
        <div class="ob-title">{{ headerTitle }}</div>
        <div class="ob-sub">{{ headerSub }}</div>
      </div>

      <!-- ── ROLE SELECTION (journey cards) ── -->
      <template v-if="phase === 'role'">
        <div class="journey-list">
          <div
            v-for="r in roles"
            :key="r.key"
            class="journey-card"
            :class="{ selected: selectedRole === r.key }"
            @click="selectRole(r.key)"
          >
            <div class="j-icon">
              <img :src="r.icon" alt="" loading="lazy" />
            </div>
            <div class="j-body">
              <div class="j-title">{{ r.label }}</div>
              <div class="j-sub">{{ r.desc }}</div>
            </div>
            <div class="j-radio"><div class="j-radio-dot" /></div>
          </div>
        </div>

        <!-- Info stripe replaces the £900m green block -->
        <div class="info-stripe">
          <div class="info-stripe-icon">
            <img src="/op-icons/onboarding/trustShield.png" alt="" loading="lazy" />
          </div>
          <div class="info-stripe-text">
            UK consumers lose <strong>£900m a year</strong> on aborted property
            transactions. A Passport-verified sale is <strong>12× faster</strong>
            and far less likely to fall through.
          </div>
        </div>

        <!-- Trust tiles -->
        <div class="trust-row">
          <div
            v-for="t in trust"
            :key="t.title"
            class="trust-tile"
          >
            <div class="trust-icon">
              <img :src="t.icon" alt="" loading="lazy" />
            </div>
            <div class="trust-title">{{ t.title }}</div>
            <div class="trust-sub">{{ t.sub }}</div>
          </div>
        </div>
      </template>

      <!-- ── DETAIL SCREEN ── -->
      <template v-else>
        <div ref="scrollRef">
          <template v-for="q in activeQuestions" :key="q.id">
            <!-- Section group heading (used in landlord / selling+buying) -->
            <div v-if="q.type === 'heading'" class="section-group">
              <span class="section-group-emoji">{{ headingEmoji(q.label || '') }}</span>
              <span class="section-group-h">{{ headingText(q.label || '') }}</span>
            </div>

            <!-- Text input -->
            <div v-else-if="q.type === 'text'" class="pref-section">
              <div class="pref-label">{{ q.label }}</div>
              <div class="pref-input">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  :value="(a as any)[q.id] || ''"
                  type="text"
                  :placeholder="q.placeholder"
                  @input="(e: any) => ((a as any)[q.id] = e.target.value)"
                />
              </div>
            </div>

            <!-- Locations: chip-autocomplete -->
            <div v-else-if="q.type === 'locations'" class="pref-section">
              <div class="pref-label">{{ q.label }}</div>
              <div v-if="q.hint" class="pref-help">{{ q.hint }}</div>
              <div class="pref-input">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  :value="locInputs[q.id] || ''"
                  type="text"
                  :placeholder="q.placeholder"
                  autocomplete="off"
                  @input="(e: any) => onLocInput(q.id, e.target.value)"
                  @keydown.enter.prevent="commitLocFreeText(q.id)"
                  @keydown.backspace="onLocBackspace(q.id, $event)"
                />
              </div>
              <div
                v-if="locOpen[q.id] && locSuggestions[q.id]?.length"
                class="loc-drop"
              >
                <div
                  v-for="(s, idx) in locSuggestions[q.id]"
                  :key="`${s.kind}-${s.value}-${idx}`"
                  class="loc-drop-item"
                  @mousedown.prevent="addLocation(q.id, s.value)"
                >
                  <span class="loc-drop-ic">{{
                    s.kind === 'postcode' ? '📮' : '🏙️'
                  }}</span>
                  <span class="loc-drop-text">
                    <strong>{{ s.value }}</strong>
                    <span v-if="s.sub" class="loc-drop-sub">{{ s.sub }}</span>
                  </span>
                </div>
              </div>
              <div
                v-if="((a as any)[q.id] as string[]).length"
                class="chip-row"
                style="margin-top: 10px"
              >
                <button
                  v-for="(loc, i) in (a as any)[q.id] as string[]"
                  :key="`${q.id}-${loc}-${i}`"
                  type="button"
                  class="chip selected"
                  @click="removeLocation(q.id, i)"
                >
                  {{ loc }}<span style="margin-left: 4px; opacity: 0.8">×</span>
                </button>
              </div>
            </div>

            <!-- Chips -->
            <div v-else-if="q.type === 'chips'" class="pref-section">
              <div class="pref-label">
                {{ q.label
                }}<span v-if="q.multiSelect" class="multi-hint">
                  · pick all that apply</span
                >
              </div>
              <div v-if="q.hint" class="pref-help">{{ q.hint }}</div>
              <div class="chip-row">
                <button
                  v-for="opt in q.opts"
                  :key="opt.v"
                  type="button"
                  class="chip"
                  :class="{
                    selected: isSelected(q.id, opt.v, !!q.multiSelect),
                    dashed: !!opt.isExpand,
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
                  <span v-if="opt.icon && opt.icon.startsWith('/')" class="chip-emoji chip-emoji-img"
                    ><img :src="opt.icon" alt="" loading="lazy" /></span
                  ><span v-else-if="opt.icon" class="chip-emoji">{{ opt.icon }}</span
                  >{{ opt.v }}
                </button>
                <template v-if="expanded[q.id] && q.expandOpts">
                  <button
                    v-for="opt in q.expandOpts"
                    :key="opt.v"
                    type="button"
                    class="chip"
                    :class="{ selected: isSelected(q.id, opt.v, !!q.multiSelect) }"
                    @click="pick(q.id, opt.v, !!q.multiSelect)"
                  >
                    <span v-if="opt.icon && opt.icon.startsWith('/')" class="chip-emoji chip-emoji-img"
                      ><img :src="opt.icon" alt="" loading="lazy" /></span
                    ><span v-else-if="opt.icon" class="chip-emoji">{{ opt.icon }}</span
                    >{{ opt.v }}
                  </button>
                </template>
              </div>
            </div>
          </template>
          <div style="height: 14px" />
        </div>
      </template>

      <!-- ── STICKY FOOTER ── -->
      <div class="ob-footer">
        <div class="ob-footer-meta">
          <span v-if="phase === 'role'">
            <strong>{{ selectedRole ? '1' : '0' }} of 4</strong> options chosen
          </span>
          <span v-else>
            <strong>{{ answeredCount }} of {{ totalQuestions }}</strong>
            answered · all optional
          </span>
          <span>{{ phase === 'role' ? 'Step 1 / 2' : 'Step 2 / 2' }}</span>
        </div>
        <button
          v-if="phase === 'role'"
          class="cta-primary"
          :class="{ disabled: !selectedRole }"
          :disabled="!selectedRole"
          @click="advanceToDetail"
        >
          Continue
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
        <button
          v-else
          class="cta-primary"
          :disabled="isLoading"
          @click="save"
        >
          <span v-if="isLoading" class="spinner" />
          {{ detailCtaLabel }}
          <svg v-if="!isLoading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
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

// ── Location chip autocomplete ───────────────────────────────────────────
type LocSuggestion = { kind: 'postcode' | 'place'; value: string; sub?: string }
const locInputs = reactive<Record<string, string>>({})
const locSuggestions = reactive<Record<string, LocSuggestion[]>>({})
const locOpen = reactive<Record<string, boolean>>({})
const locTimers: Record<string, ReturnType<typeof setTimeout> | null> = {}

function onLocInput(qid: string, val: string) {
  locInputs[qid] = val
  if (locTimers[qid]) clearTimeout(locTimers[qid] as ReturnType<typeof setTimeout>)
  const trimmed = val.trim()
  if (trimmed.length < 2) {
    locSuggestions[qid] = []
    locOpen[qid] = false
    return
  }
  locTimers[qid] = setTimeout(() => fetchLocSuggestions(qid, trimmed), 250)
}

async function fetchLocSuggestions(qid: string, q: string) {
  // Hit postcodes.io for postcode prefix completions and place lookups.
  // Postcodes.io is free, no auth, supports CORS.
  const looksLikePostcode = /^[A-Za-z]{1,2}\d/.test(q)
  const out: LocSuggestion[] = []
  try {
    if (looksLikePostcode) {
      const r: any = await $fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(q)}/autocomplete`,
      )
      const list: string[] = r?.result ?? []
      for (const pc of list.slice(0, 6)) {
        out.push({ kind: 'postcode', value: pc.toUpperCase() })
      }
    }
    // Always also try place suggestions (cities / towns / areas)
    const places: any = await $fetch(
      `https://api.postcodes.io/places?q=${encodeURIComponent(q)}&limit=6`,
    )
    const placeList: any[] = places?.result ?? []
    for (const p of placeList) {
      const name = p?.name_1 || p?.name
      if (!name) continue
      const sub = p?.county_unitary || p?.region || p?.country || ''
      out.push({ kind: 'place', value: name, sub: sub || undefined })
    }
  } catch {
    // Network errors → just leave whatever we collected.
  }
  // Dedup by value
  const seen = new Set<string>()
  locSuggestions[qid] = out.filter((s) => {
    const k = s.value.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  }).slice(0, 8)
  locOpen[qid] = (locSuggestions[qid]?.length ?? 0) > 0
}

function addLocation(qid: string, value: string) {
  const arr = (a as any)[qid] as string[]
  const v = value.trim()
  if (!v) return
  if (!arr.some((x) => x.toLowerCase() === v.toLowerCase())) arr.push(v)
  locInputs[qid] = ''
  locSuggestions[qid] = []
  locOpen[qid] = false
}

function removeLocation(qid: string, idx: number) {
  const arr = (a as any)[qid] as string[]
  arr.splice(idx, 1)
}

function commitLocFreeText(qid: string) {
  const v = (locInputs[qid] || '').trim()
  if (!v) return
  // Prefer the first suggestion if the user pressed Enter while the dropdown
  // is open — feels more responsive than committing the raw text.
  const first = locSuggestions[qid]?.[0]?.value
  addLocation(qid, first || v)
}

function onLocBackspace(qid: string, e: KeyboardEvent) {
  // If the input is empty and the user backspaces, drop the last chip.
  if ((locInputs[qid] || '').length > 0) return
  const arr = (a as any)[qid] as string[]
  if (arr.length === 0) return
  e.preventDefault()
  arr.pop()
}

// ── Answers ───────────────────────────────────────────────────────────────

const a = reactive<Record<string, any>>({
  // Buy
  buyLocation: [] as string[],
  buyBudget: '',
  buyBedrooms: '',
  buyPropertyType: '',
  buyTenure: '',
  buyMustHaves: [],
  buyerType: '',
  energyImportance: '',
  passportRequired: '',
  // Sell
  sellLocation: [] as string[],
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

// Inline SVGs render through v-html. Stored as one-liners so the template
// stays readable.
const roles = [
  {
    key: 'buy',
    icon: '/op-icons/onboarding/lookingToBuy.png',
    label: "I'm looking to buy",
    desc: 'Search properties, check risks, find your home',
  },
  {
    key: 'sell',
    icon: '/op-icons/onboarding/sellingHome.png',
    label: "I'm selling my home",
    desc: 'Build your Passport, get verified, move faster',
  },
  {
    key: 'landlord',
    icon: '/op-icons/onboarding/landlord.png',
    label: "I'm a landlord",
    desc: 'Manage compliance, certs & tenant safety in one place',
  },
  {
    key: 'both',
    icon: '/op-icons/onboarding/sellingAndBuying.png',
    label: 'Selling and buying',
    desc: "We'll set up both sides of your move",
  },
]
const trust = [
  {
    title: 'Your data is yours',
    sub: 'Never sold or shared',
    icon: '/op-icons/onboarding/trustPadlock.png',
  },
  {
    title: 'Takes 2 mins',
    sub: 'Save & continue any time',
    icon: '/op-icons/onboarding/trustLightning.png',
  },
  {
    title: '12× faster',
    sub: 'to exchange than average',
    icon: '/op-icons/onboarding/trustTrophy.png',
  },
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
  type: 'heading' | 'text' | 'chips' | 'locations'
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
    type: 'locations',
    label: 'WHERE ARE YOU LOOKING?',
    placeholder: 'Add a city, area or postcode…',
    hint: 'Add as many as you like — we\'ll search all of them.',
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
      { v: 'Studio', icon: '/op-icons/misc/bed.png' },
      { v: '1 bed', icon: '/op-icons/misc/bed.png' },
      { v: '2 bed', icon: '/op-icons/misc/bed.png' },
      { v: '3 bed', icon: '/op-icons/misc/bed.png' },
      { v: '4 bed', icon: '/op-icons/misc/bed.png' },
      { v: '5 bed+', icon: '/op-icons/misc/bed.png', expandKey: 'buyBedrooms' },
    ],
    expandOpts: [
      { v: '5 bed', icon: '/op-icons/misc/bed.png' },
      { v: '6 bed', icon: '/op-icons/misc/bed.png' },
      { v: '7 bed', icon: '/op-icons/misc/bed.png' },
      { v: '8 bed', icon: '/op-icons/misc/bed.png' },
      { v: '9 bed', icon: '/op-icons/misc/bed.png' },
      { v: '10 bed+', icon: '/op-icons/misc/bed.png' },
    ],
  },
  {
    id: 'buyPropertyType',
    type: 'chips',
    label: 'PROPERTY TYPE',
    opts: [
      { v: 'House', icon: '/op-icons/homescore/house.png' },
      { v: 'Flat', icon: '/op-icons/investment/officeBuilding.png' },
      { v: 'Bungalow', icon: '/op-icons/homescore/house.png' },
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
    hint: 'Affects HomeScore weighting and running cost estimates',
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
    type: 'locations',
    label: 'WHERE IS IT?',
    placeholder: 'Add the town, city or postcode…',
    hint: 'You can add a postcode and the town it sits in.',
  },
  {
    id: 'sellPropertyType',
    type: 'chips',
    label: 'PROPERTY TYPE',
    opts: [
      { v: 'Detached', icon: '/op-icons/investment/houseDetached.png' },
      { v: 'Semi-detached', icon: '/op-icons/investment/houseSemi.png' },
      { v: 'Terraced', icon: '/op-icons/investment/housesTerrace.png' },
      { v: 'Flat', icon: '/op-icons/investment/officeBuilding.png' },
      { v: 'Bungalow', icon: '/op-icons/homescore/house.png' },
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
      { v: '1', icon: '/op-icons/misc/bed.png' },
      { v: '2', icon: '/op-icons/misc/bed.png' },
      { v: '3', icon: '/op-icons/misc/bed.png' },
      { v: '4', icon: '/op-icons/misc/bed.png' },
      { v: '5+', icon: '/op-icons/misc/bed.png', expandKey: 'sellBedrooms' },
    ],
    expandOpts: [
      { v: '5', icon: '/op-icons/misc/bed.png' },
      { v: '6', icon: '/op-icons/misc/bed.png' },
      { v: '7', icon: '/op-icons/misc/bed.png' },
      { v: '8+', icon: '/op-icons/misc/bed.png' },
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
      { v: 'Chain-free', icon: '/op-icons/investment/chainLink.png' },
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
      { v: 'None — first purchase', icon: '/op-icons/investment/house.png' },
      { v: '1–2', icon: '/op-icons/investment/housesCluster.png' },
      { v: '3–5', icon: '/op-icons/investment/apartmentBlock.png' },
      { v: '6–10', icon: '/op-icons/investment/crane.png' },
      { v: '10+', icon: '/op-icons/investment/citySkyline.png', expandKey: 'portfolio' },
    ],
    expandOpts: [
      { v: '11–25', icon: '/op-icons/investment/housesCluster.png' },
      { v: '26–50', icon: '/op-icons/investment/apartmentBlock.png' },
      { v: '51–100', icon: '/op-icons/investment/crane.png' },
      { v: '100+', icon: '/op-icons/investment/citySkyline.png' },
    ],
  },
  {
    id: 'management',
    type: 'chips',
    label: 'HOW DO YOU CURRENTLY MANAGE?',
    opts: [
      { v: 'Self-managed', icon: '/op-icons/investment/key.png' },
      { v: 'Letting agent', icon: '/op-icons/investment/officeBuilding.png' },
      { v: 'Mix of both', icon: '/op-icons/investment/handshake.png' },
      { v: 'First purchase', icon: '/op-icons/investment/trolleyWithHouse.png' },
    ],
  },
  H("🎯 What you're looking to buy"),
  {
    id: 'strategy',
    type: 'chips',
    label: 'INVESTMENT STRATEGY',
    multiSelect: true,
    opts: [
      { v: 'Buy-to-let yield', icon: '/op-icons/investment/moneyBagPound.png' },
      { v: 'Capital growth', icon: '/op-icons/investment/growthChart.png' },
      { v: 'Yield + growth', icon: '/op-icons/investment/target.png' },
      { v: 'Below market value', icon: '/op-icons/investment/priceTagPound.png' },
      { v: 'Refurb & hold', icon: '/op-icons/investment/hammer.png' },
      { v: 'Refurb & flip', icon: '/op-icons/investment/refreshArrows.png' },
      { v: 'HMO conversion', icon: '/op-icons/investment/houseDetached.png' },
      { v: 'Short-term / Airbnb', icon: '/op-icons/investment/parasol.png' },
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
      { v: 'Cash buyer', icon: '/op-icons/investment/cashAndCoins.png' },
      { v: 'BTL mortgage', icon: '/op-icons/investment/bank.png' },
      { v: 'Bridging finance', icon: '/op-icons/investment/lightningBolt.png' },
      { v: 'Limited company', icon: '/op-icons/investment/officeBuildings.png' },
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
      { v: 'Turnkey — ready to let', icon: '/op-icons/investment/paintPalette.png' },
      { v: 'Light cosmetic work', icon: '/op-icons/investment/paintRoller.png' },
      { v: 'Full refurb', icon: '/op-icons/investment/hammerClaw.png' },
      { v: 'Structural / development', icon: '/op-icons/investment/craneTower.png' },
    ],
  },
  {
    id: 'letType',
    type: 'chips',
    label: 'PREFERRED LET TYPE',
    opts: [
      { v: 'Single let', icon: '/op-icons/investment/houseSemi.png' },
      { v: 'HMO / multi-room', icon: '/op-icons/investment/housesTerrace.png' },
      { v: 'Student let', icon: '/op-icons/investment/graduationCap.png' },
      { v: 'Short-term / holiday', icon: '/op-icons/investment/parasolLounger.png' },
      { v: 'Commercial', icon: '/op-icons/investment/officeBlock.png' },
    ],
  },
  {
    id: 'llocation',
    type: 'chips',
    label: 'LOCATION STRATEGY',
    opts: [
      { v: 'Local to me', icon: '/op-icons/investment/locationPinMap.png' },
      { v: 'High-yield North', icon: '/op-icons/investment/cityTowers.png' },
      { v: 'London & SE', icon: '/op-icons/investment/landmarks.png' },
      { v: 'University towns', icon: '/op-icons/investment/graduationCapDark.png' },
      { v: 'Coastal', icon: '/op-icons/investment/lighthouse.png' },
      { v: 'Flexible', icon: '/op-icons/investment/signpost.png' },
    ],
  },
  {
    id: 'landlordMustHaves',
    type: 'chips',
    label: 'MUST-HAVES',
    multiSelect: true,
    opts: [
      { v: 'Vacant possession', icon: '/op-icons/investment/padlock.png' },
      { v: 'Sitting tenant', icon: '/op-icons/investment/armchair.png' },
      { v: 'No chain', icon: '/op-icons/investment/chainLink.png' },
      { v: 'EPC D or above', icon: '/op-icons/investment/plantSprout.png' },
      { v: 'Planning potential', icon: '/op-icons/investment/clipboardChecklist.png' },
      { v: 'BMV — below market value', icon: '/op-icons/investment/priceTagPound2.png' },
      { v: 'Off-market deals', icon: '/op-icons/investment/smileyFace.png' },
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

// Compact "Step X of Y · subtitle" used in the new light header.
const stepIndicator = computed(() => {
  if (phase.value === 'role') return 'Step 1 of 2'
  const subtitleMap: Record<string, string> = {
    buy: '',
    sell: '· Your property',
    landlord: '· Investment criteria',
    both: '· Your move',
  }
  const sub = subtitleMap[selectedRole.value] ?? ''
  return `Step 2 of 2${sub ? ' ' + sub : ''}`
})

// Eyebrow pill text in the intro block.
const eyebrowLabel = computed(() => {
  if (phase.value === 'role') return 'Welcome to umovingu'
  const map: Record<string, string> = {
    buy: 'Your preferences',
    sell: 'Build your Passport',
    landlord: 'Tailored deal flow',
    both: 'Coordinated move',
  }
  return map[selectedRole.value] ?? 'Your preferences'
})

// Footer CTA label varies by flow (matches prototype copy).
const detailCtaLabel = computed(() => {
  const map: Record<string, string> = {
    buy: "I'm ready to explore",
    sell: 'Build my Passport',
    landlord: 'Show me deals',
    both: 'Coordinate my move',
  }
  return map[selectedRole.value] ?? "I'm ready to explore"
})

// "N of M answered" — counts only real question rows, not section headings.
const totalQuestions = computed(
  () => activeQuestions.value.filter((q) => q.type !== 'heading').length,
)

// Section-group headings in the question data are stored as
// "🏠 The property you're selling" — the prototype splits emoji + text into
// two spans for layout. These helpers do the same split.
function headingEmoji(label: string): string {
  // Take everything up to the first space (works for single emoji headers).
  const idx = label.indexOf(' ')
  return idx === -1 ? label : label.slice(0, idx)
}
function headingText(label: string): string {
  const idx = label.indexOf(' ')
  return idx === -1 ? '' : label.slice(idx + 1)
}

function advanceToDetail() {
  if (!selectedRole.value) return
  phase.value = 'detail'
  scrollRef.value?.scrollTo({ top: 0 })
}
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
  // Just toggle the selection — the user explicitly taps "Continue" in the
  // footer to advance (matches prototype's two-step click pattern).
  selectedRole.value = selectedRole.value === key ? '' : key
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
              targetAreas: a.buyLocation?.length ? a.buyLocation : undefined,
            }
          : {}),
        ...(isSeller
          ? {
              sellingTimeline: a.sellTimeline || undefined,
              propertyValue: propValue,
              propertyStyles: a.sellPropertyType
                ? [a.sellPropertyType]
                : undefined,
              targetAreas: a.sellLocation?.length ? a.sellLocation : undefined,
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
    // Honor a pending redirect (e.g. user was sent to signup from a
    // HomeScore property page via "I'm interested" / "I'm the owner")
    // Welcome screen consumes any pending redirectAfterLogin when the user
    // taps "Let's start exploring", so leave it in storage here.
    await navigateTo('/onboarding/welcome')
  }
}

// ── Confetti ──────────────────────────────────────────────────────────────

const { runConfetti } = useConfetti()

onMounted(() => {
  if (route.query.new === 'true') {
    setTimeout(() => runConfetti(), 350)
  }
})
</script>

<style scoped>
/* Prototype palette (one-to-one with onboarding-rebuilt.html `:root`). */
.ob-page {
  --navy: #231d45;
  --navy-soft: #4a4566;
  --navy-faint: #6e6985;
  --teal: #00a19a;
  --teal-bright: #00b6ae;
  --teal-dark: #007e78;
  --teal-deep: #00514d;
  --teal-pale: #e5f4f2;
  --teal-paler: #f2faf8;
  --text: #231d45;
  --text-soft: #6b6783;
  --text-faint: #9c98ad;
  --line: #e6edec;
  --line-soft: #f1f6f5;
  --bg: #f9fbfa;
  --gold-deep: #8a5f1f;
  --gold-paler: #fcf6e9;

  min-height: 100dvh;
  background: #fff;
  color: var(--text);
  font-family:
    'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Inter, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding-bottom: 0;
  display: flex;
  flex-direction: column;
}

/* ── Light header (replaces the old purple block) ────────────────── */
.ob-header {
  padding: 14px 22px 4px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.ob-back {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg);
  border: 1px solid var(--line);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-soft);
  transition: all 0.15s;
  flex-shrink: 0;
}
.ob-back:hover {
  color: var(--navy);
  border-color: var(--text-faint);
}
.ob-back svg {
  width: 14px;
  height: 14px;
}
.ob-step {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-top: 8px;
  text-align: center;
  flex: 1;
}
.ob-skip {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-soft);
  background: none;
  border: none;
  cursor: pointer;
  letter-spacing: -0.05px;
  padding: 10px 4px;
  font-family: inherit;
}
.ob-skip:hover {
  color: var(--navy);
}

.ob-progress {
  height: 3px;
  background: var(--line-soft);
  margin: 8px 22px 0;
  border-radius: 100px;
  overflow: hidden;
}
.ob-progress-bar {
  height: 100%;
  background: var(--teal);
  border-radius: 100px;
  transition: width 0.3s;
}

/* ── Intro block (eyebrow + title + sub) ─────────────────────────── */
.ob-intro {
  padding: 26px 22px 6px;
}
.ob-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  color: var(--teal-dark);
  background: var(--teal-paler);
  border: 1px solid var(--teal-pale);
  padding: 5px 11px;
  border-radius: 100px;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.ob-eyebrow .pulse {
  width: 6px;
  height: 6px;
  background: var(--teal);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.18);
}
.ob-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.9px;
  line-height: 1.05;
  margin-bottom: 8px;
}
.ob-sub {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text-soft);
  letter-spacing: -0.1px;
  line-height: 1.5;
}

/* ── Journey cards (role picker, screen 1) ───────────────────────── */
.journey-list {
  padding: 22px 22px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.journey-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.18s;
  position: relative;
}
.journey-card:hover {
  border-color: var(--teal);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.1);
}
.journey-card.selected {
  border-color: var(--teal);
  background: var(--teal-paler);
  box-shadow: 0 6px 18px rgba(0, 161, 154, 0.14);
}
.j-icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.j-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.j-body {
  flex: 1;
  min-width: 0;
}
.j-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.3px;
  line-height: 1.2;
  margin-bottom: 3px;
}
.j-sub {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  line-height: 1.4;
}
.j-radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid var(--line);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.15s;
}
.journey-card.selected .j-radio {
  border-color: var(--teal);
  background: var(--teal);
}
.j-radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
  transition: opacity 0.15s;
}
.journey-card.selected .j-radio-dot {
  opacity: 1;
}

/* ── Info stripe (replaces the £900m green block) ───────────────── */
.info-stripe {
  margin: 8px 22px 16px;
  padding: 14px 16px;
  background: var(--teal-paler);
  border: 1px solid var(--teal-pale);
  border-radius: 14px;
  display: flex;
  align-items: flex-start;
  gap: 11px;
}
.info-stripe-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-stripe-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.info-stripe-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--navy-soft);
  letter-spacing: -0.05px;
  line-height: 1.5;
}
.info-stripe-text strong {
  color: var(--navy);
  font-weight: 800;
}

/* ── Trust tiles (3-up grid) ─────────────────────────────────────── */
.trust-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  padding: 0 22px 26px;
}
.trust-tile {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 14px 10px;
  text-align: center;
}
.trust-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.trust-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.trust-title {
  font-size: 11.5px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.15px;
  line-height: 1.2;
  margin-bottom: 3px;
}
.trust-sub {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  line-height: 1.35;
}

/* ── Section group header (landlord & combined flows) ────────────── */
.section-group {
  margin: 18px 22px 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-group-emoji {
  font-size: 17px;
  line-height: 1;
}
.section-group-h {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.3px;
}
.section-group + .pref-section {
  padding-top: 12px;
}

/* ── Pref section ───────────────────────────────────────────────── */
.pref-section {
  padding: 16px 22px 4px;
}
.pref-label {
  font-size: 10.5px;
  font-weight: 800;
  color: var(--text-faint);
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.pref-label .multi-hint {
  font-weight: 600;
  color: var(--text-faint);
  text-transform: none;
  letter-spacing: -0.05px;
  font-size: 11px;
  margin-left: 4px;
}
.pref-help {
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  line-height: 1.4;
  margin-bottom: 10px;
}

/* Pill-shaped input (used by location + text questions) */
.pref-input {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 100px;
  padding: 4px 6px 4px 14px;
  gap: 8px;
  transition: all 0.15s;
}
.pref-input:focus-within {
  border-color: var(--teal);
  box-shadow: 0 0 0 4px rgba(0, 161, 154, 0.1);
}
.pref-input svg {
  width: 16px;
  height: 16px;
  color: var(--text-faint);
  flex-shrink: 0;
}
.pref-input input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 4px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--navy);
  letter-spacing: -0.1px;
  min-width: 0;
}
.pref-input input:focus {
  outline: none;
}
.pref-input input::placeholder {
  color: var(--text-faint);
  font-weight: 500;
}

/* Location autocomplete dropdown — sits below the input. Anchored to
   .pref-section so we don't need a wrapper. */
.pref-section {
  position: relative;
}
.loc-drop {
  position: absolute;
  top: calc(100% - 4px);
  left: 22px;
  right: 22px;
  background: #fff;
  border: 1.5px solid var(--teal-pale);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(35, 29, 69, 0.12);
  z-index: 30;
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
}
.loc-drop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--line-soft);
  transition: background 0.12s;
}
.loc-drop-item:last-child {
  border-bottom: none;
}
.loc-drop-item:hover {
  background: var(--teal-paler);
}
.loc-drop-ic {
  font-size: 14px;
  flex-shrink: 0;
}
.loc-drop-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.loc-drop-text strong {
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
}
.loc-drop-sub {
  font-size: 11px;
  color: var(--text-faint);
  margin-top: 1px;
}

/* ── Chips ───────────────────────────────────────────────────────── */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.chip {
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: var(--navy);
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: 100px;
  padding: 8px 13px;
  cursor: pointer;
  letter-spacing: -0.1px;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.chip:hover {
  border-color: var(--teal-pale);
  background: var(--teal-paler);
}
.chip.selected {
  background: var(--teal);
  color: #fff;
  border-color: var(--teal);
  box-shadow: 0 4px 10px rgba(0, 161, 154, 0.25);
}
.chip.dashed {
  border-style: dashed;
  color: var(--text-faint);
}
.chip-emoji {
  font-size: 13px;
  line-height: 1;
}
.chip-emoji-img {
  width: 18px;
  height: 18px;
  display: inline-flex;
}
.chip-emoji-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* ── Sticky footer ───────────────────────────────────────────────── */
.ob-footer {
  position: sticky;
  bottom: 0;
  background: linear-gradient(to top, #fff 75%, rgba(255, 255, 255, 0));
  padding: 14px 22px calc(22px + env(safe-area-inset-bottom));
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}
.ob-footer-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-soft);
  letter-spacing: -0.05px;
  padding: 0 4px 2px;
}
.ob-footer-meta strong {
  color: var(--navy);
  font-weight: 800;
}

.cta-primary {
  width: 100%;
  background: var(--teal);
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 14.5px;
  font-weight: 800;
  padding: 16px 18px;
  border-radius: 100px;
  cursor: pointer;
  letter-spacing: -0.15px;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(0, 161, 154, 0.28);
}
.cta-primary:hover {
  background: var(--teal-bright);
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 161, 154, 0.34);
}
.cta-primary svg {
  width: 14px;
  height: 14px;
}
.cta-primary.disabled,
.cta-primary:disabled {
  background: var(--line);
  color: var(--text-faint);
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
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
