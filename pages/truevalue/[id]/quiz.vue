<template>
  <div class="tv-page">
    <div class="tv-topbar">
      <button class="tv-back" aria-label="Back" @click="onBack">‹</button>
      <div class="tv-progress"><b :style="{ width: progressPct + '%' }" /></div>
    </div>

    <div v-if="loading" class="tv-loading"><div class="tv-spinner" /></div>

    <template v-else>
      <!-- Step: homeowner -->
      <div v-if="step === 'homeowner'" class="tv-step">
        <h3 class="tv-q">Are you the homeowner?</h3>
        <p class="tv-qsub">This tells us whether to ask about work you've done, or just show you the current estimate.</p>
        <div class="tv-optcard" :class="{ on: answers.isHomeowner === true }" @click="setHomeowner(true)" role="button" tabindex="0" @keydown.enter="setHomeowner(true)" @keydown.space.prevent="setHomeowner(true)">
          <div class="tv-rad" /><div><div class="tv-ot">Yes, I own this property</div></div>
        </div>
        <div class="tv-optcard" :class="{ on: answers.isHomeowner === false }" @click="setHomeowner(false)" role="button" tabindex="0" @keydown.enter="setHomeowner(false)" @keydown.space.prevent="setHomeowner(false)">
          <div class="tv-rad" /><div><div class="tv-ot">No - I'm just exploring</div><div class="tv-od">Researching, buying, or curious about this address.</div></div>
        </div>
      </div>

      <!-- Step: not-owner short-circuit result -->
      <div v-else-if="step === 'not-owner-result'" class="tv-step">
        <div class="tv-hero">
          <div class="tv-hero-lab">Current estimate</div>
          <div class="tv-hero-big">{{ baseline ? formatPrice(baseline) : '-' }}</div>
          <div class="tv-hero-base">HPI-adjusted, from public sold-price data</div>
        </div>
        <p class="tv-fineprint">This is the postcode-level estimate. Only the owner can add improvements and evidence to sharpen it into a TrueValue range.</p>
        <button class="tv-btn tv-btn--primary" @click="finishExit">Done</button>
      </div>

      <!-- Step: landlord -->
      <div v-else-if="step === 'landlord'" class="tv-step">
        <h3 class="tv-q">Have you ever let this property out?</h3>
        <p class="tv-qsub">Just for context - doesn't change your estimate.</p>
        <div class="tv-optcard" :class="{ on: answers.isLandlord === true }" @click="setLandlord(true)" role="button" tabindex="0" @keydown.enter="setLandlord(true)" @keydown.space.prevent="setLandlord(true)">
          <div class="tv-rad" /><div><div class="tv-ot">Yes</div></div>
        </div>
        <div class="tv-optcard" :class="{ on: answers.isLandlord === false }" @click="setLandlord(false)" role="button" tabindex="0" @keydown.enter="setLandlord(false)" @keydown.space.prevent="setLandlord(false)">
          <div class="tv-rad" /><div><div class="tv-ot">No</div></div>
        </div>
      </div>

      <!-- Step: purpose -->
      <div v-else-if="step === 'purpose'" class="tv-step">
        <h3 class="tv-q">What's this valuation for?</h3>
        <p class="tv-qsub">Helps us show you the right next step at the end.</p>
        <div v-for="o in purposeOptions" :key="o.value" class="tv-optcard" :class="{ on: answers.purpose === o.value }" @click="setPurpose(o.value)" role="button" tabindex="0" @keydown.enter="setPurpose(o.value)" @keydown.space.prevent="setPurpose(o.value)">
          <div class="tv-rad" /><div><div class="tv-ot">{{ o.label }}</div><div v-if="o.desc" class="tv-od">{{ o.desc }}</div></div>
        </div>
      </div>

      <!-- Step: next-home (selling only) -->
      <div v-else-if="step === 'next-home'" class="tv-step">
        <h3 class="tv-q">Have you found your next home yet?</h3>
        <div class="tv-optcard" :class="{ on: answers.foundNextHome === 'yes' }" @click="setNextHome('yes')" role="button" tabindex="0" @keydown.enter="setNextHome('yes')" @keydown.space.prevent="setNextHome('yes')">
          <div class="tv-rad" /><div><div class="tv-ot">Yes</div></div>
        </div>
        <div class="tv-optcard" :class="{ on: answers.foundNextHome === 'no' }" @click="setNextHome('no')" role="button" tabindex="0" @keydown.enter="setNextHome('no')" @keydown.space.prevent="setNextHome('no')">
          <div class="tv-rad" /><div><div class="tv-ot">Not yet</div></div>
        </div>
        <div class="tv-optcard" :class="{ on: answers.foundNextHome === 'not-looking' }" @click="setNextHome('not-looking')" role="button" tabindex="0" @keydown.enter="setNextHome('not-looking')" @keydown.space.prevent="setNextHome('not-looking')">
          <div class="tv-rad" /><div><div class="tv-ot">Not actively looking</div></div>
        </div>
      </div>

      <!-- Step: select works -->
      <div v-else-if="step === 'select'" class="tv-step">
        <h3 class="tv-q">What have you done to the place?</h3>
        <p class="tv-qsub">Pick everything that applies - even the things that won't add value. We'll tell you which is which.</p>
        <input v-model="search" class="tv-search" type="text" :placeholder="`Search all ${workTypes.length} improvements…`"  aria-label="`Search all ${workTypes.length} improvements…`" />

        <template v-if="search.trim()">
          <div class="tv-grouplabel">{{ searchHits.length }} match{{ searchHits.length === 1 ? '' : 'es' }}</div>
          <div class="tv-chips">
            <div v-for="w in searchHits" :key="w.code" class="tv-chip" :class="{ on: isSelected(w.code) }" @click="toggleWork(w.code)" role="button" tabindex="0" @keydown.enter="toggleWork(w.code)" @keydown.space.prevent="toggleWork(w.code)">
              {{ w.label }}<span class="tv-tmark" :class="'tv-t' + w.tier">{{ tierMark(w.tier) }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="!showAll">
          <div class="tv-grouplabel">Most common</div>
          <div class="tv-chips">
            <div v-for="w in commonWorks" :key="w.code" class="tv-chip" :class="{ on: isSelected(w.code) }" @click="toggleWork(w.code)" role="button" tabindex="0" @keydown.enter="toggleWork(w.code)" @keydown.space.prevent="toggleWork(w.code)">{{ w.label }}</div>
          </div>
          <div v-if="selectedNonCommon.length" class="tv-grouplabel">Also selected</div>
          <div v-if="selectedNonCommon.length" class="tv-chips">
            <div v-for="w in selectedNonCommon" :key="w.code" class="tv-chip on" @click="toggleWork(w.code)" role="button" tabindex="0" @keydown.enter="toggleWork(w.code)" @keydown.space.prevent="toggleWork(w.code)">{{ w.label }}</div>
          </div>
          <button class="tv-btn-ghost" @click="showAll = true">Show all {{ workTypes.length }} improvements</button>
        </template>
        <template v-else>
          <div v-for="cat in categories" :key="cat.key">
            <div class="tv-grouplabel">{{ cat.label }}</div>
            <p class="tv-grouphint">{{ cat.hint }}</p>
            <div class="tv-chips">
              <div v-for="w in worksByCategory[cat.key]" :key="w.code" class="tv-chip" :class="{ on: isSelected(w.code) }" @click="toggleWork(w.code)" role="button" tabindex="0" @keydown.enter="toggleWork(w.code)" @keydown.space.prevent="toggleWork(w.code)">
                {{ w.label }}<span class="tv-tmark" :class="'tv-t' + w.tier">{{ tierMark(w.tier) }}</span>
              </div>
            </div>
          </div>
          <button class="tv-btn-ghost" @click="showAll = false">Show common only</button>
        </template>

        <div class="tv-legend"><b>de-risk</b> removes a buyer deduction · <b>rec</b> recorded only, no effect on the estimate · <b>flag</b> disclosure item</div>

        <TrueValueLiveBar :live="liveEstimate" :baseline="baseline" />
        <button class="tv-btn tv-btn--primary" :disabled="!Object.keys(selectedWorks).length" @click="goToStep('proof')">Add proof &nbsp;→</button>
      </div>

      <!-- Step: proof -->
      <div v-else-if="step === 'proof'" class="tv-step">
        <h3 class="tv-q">Add your proof</h3>
        <p class="tv-qsub">Upload a certificate or invoice and we'll match it to your title. Verified evidence counts in full - self-reported counts at a haircut.</p>

        <div v-if="!isSignedIn" class="tv-caveat tv-caveat--info">
          <span class="tv-caveat-ic">🔒</span>
          <div class="tv-caveat-ct"><b>Sign in to upload proof.</b> Your selections are saved - you'll land right back here after.</div>
        </div>
        <button v-if="!isSignedIn" class="tv-btn tv-btn--primary" @click="goToSignIn">Sign in / create account &nbsp;→</button>

        <template v-else>
          <div v-for="w in selectedWorkRows" :key="w.code" class="tv-panel">
            <div class="tv-panel-top">
              <div>
                <div class="tv-nm">{{ w.label }}</div>
                <div class="tv-doc">Proof: {{ w.docRequired || 'Invoice' }}</div>
              </div>
              <span class="tv-state" :class="w.uploaded ? 'tv-state--ver' : 'tv-state--self'">{{ w.uploaded ? '✓ Uploaded' : 'Self-reported' }}</span>
            </div>
            <div v-if="w.warningText" class="tv-warnline">⚠ {{ w.warningText }}</div>
            <label v-if="!w.uploaded" class="tv-verifybtn" for="a11y-field-quiz-59">
              ⬆ &nbsp;Upload {{ w.docRequired || 'proof' }}
              <input type="file" class="tv-file-input" @change="onFileSelected(w, $event)"  id="a11y-field-quiz-59"/>
            </label>
            <div v-else class="tv-verified-line">✓ Uploaded - pending review</div>
          </div>
        </template>

        <TrueValueLiveBar :live="liveEstimate" :baseline="baseline" />
        <button class="tv-btn tv-btn--primary" @click="afterProof">Continue &nbsp;→</button>
        <button class="tv-btn-ghost" @click="afterProof">Skip - leave as self-reported</button>
      </div>

      <!-- Step: epc -->
      <div v-else-if="step === 'epc'" class="tv-step">
        <h3 class="tv-q">Is your EPC up to date?</h3>
        <p class="tv-qsub">A certificate from before your energy work will understate a renovated home - so we ask rather than assume.</p>
        <div class="tv-optcard" :class="{ on: epcStatus === 'current' }" @click="setEpc('current')" role="button" tabindex="0" @keydown.enter="setEpc('current')" @keydown.space.prevent="setEpc('current')">
          <div class="tv-rad" /><div><div class="tv-ot">Yes - my EPC reflects this work</div><div class="tv-od">We'll use its energy rating in the estimate as normal.</div></div>
        </div>
        <div class="tv-optcard" :class="{ on: epcStatus === 'stale' }" @click="setEpc('stale')" role="button" tabindex="0" @keydown.enter="setEpc('stale')" @keydown.space.prevent="setEpc('stale')">
          <div class="tv-rad" /><div><div class="tv-ot">No - I've done work since my EPC</div><div class="tv-od">Common after a renovation.</div></div>
        </div>
        <div class="tv-optcard" :class="{ on: epcStatus === 'none' }" @click="setEpc('none')" role="button" tabindex="0" @keydown.enter="setEpc('none')" @keydown.space.prevent="setEpc('none')">
          <div class="tv-rad" /><div><div class="tv-ot">Not sure / no EPC</div><div class="tv-od">We'll leave energy out and flag it.</div></div>
        </div>
        <div v-if="epcStatus === 'stale'" class="tv-caveat">
          <span class="tv-caveat-ic">⚠️</span>
          <div class="tv-caveat-ct"><b>Your EPC is out of date, so we're not scoring energy from it.</b> A fresh EPC would release the full value.</div>
        </div>
        <TrueValueLiveBar :live="liveEstimate" :baseline="baseline" />
        <button class="tv-btn tv-btn--primary" :disabled="!epcStatus" @click="finish">See my estimate &nbsp;→</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
type Step = 'homeowner' | 'not-owner-result' | 'landlord' | 'purpose' | 'next-home' | 'select' | 'proof' | 'epc'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const propertyId = route.params.id as string
const STORAGE_KEY = `truevalue_quiz_${propertyId}`

const goBackToProperty = useGoBack(`/property/${propertyId}`)

const loading = ref(true)
const baseline = ref<number | null>(null)
const workTypes = ref<any[]>([])
const step = ref<Step>('homeowner')
const stepHistory = ref<Step[]>([])
const search = ref('')
const showAll = ref(false)

const answers = reactive<{ isHomeowner: boolean | null; isLandlord: boolean | null; purpose: string | null; foundNextHome: string | null }>({
  isHomeowner: null,
  isLandlord: null,
  purpose: null,
  foundNextHome: null,
})
// code -> { state: 'self'|'verified'|'pending', workId?: string, uploaded?: boolean }
const selectedWorks = reactive<Record<string, { state: string; workId?: string; uploaded?: boolean }>>({})
const epcStatus = ref<'current' | 'stale' | 'none' | null>(null)
const liveEstimate = ref<any>(null)

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}
const isSignedIn = computed(() => !!token())

function formatPrice(price: number) {
  return '£' + Math.round(price).toLocaleString('en-GB')
}

const purposeOptions = [
  { value: 'selling', label: 'Selling', desc: "I'm putting it on the market soon." },
  { value: 'remortgage', label: 'Remortgaging or releasing equity', desc: undefined },
  { value: 'curious', label: 'Just curious', desc: undefined },
  { value: 'probate', label: 'Probate or legal', desc: undefined },
]

const categories = [
  { key: 'capital', label: 'Space & rooms', hint: 'Adds floor area or amenity - counted against local sold prices.' },
  { key: 'condition', label: 'Condition & modernisation', hint: 'Core systems, fabric and presentation.' },
  { key: 'energy', label: 'Energy', hint: 'Valued through your EPC - so we check the EPC is current.' },
  { key: 'consent', label: 'Consents & permissions', hint: 'A granted consent carries value even before work starts.' },
  { key: 'risk', label: 'Risk & disclosure', hint: 'Not improvements. Recorded so there are no surprises at survey.' },
]

const commonWorks = computed(() => workTypes.value.filter((w) => w.isCommon))
const worksByCategory = computed(() => {
  const out: Record<string, any[]> = {}
  for (const c of categories) out[c.key] = workTypes.value.filter((w) => w.category === c.key)
  return out
})
const selectedNonCommon = computed(() =>
  workTypes.value.filter((w) => selectedWorks[w.code] && !w.isCommon),
)
const searchHits = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return []
  return workTypes.value.filter((w) => w.label.toLowerCase().includes(q))
})
const selectedWorkRows = computed(() =>
  Object.keys(selectedWorks).map((code) => {
    const wt = workTypes.value.find((w) => w.code === code) || {}
    return { code, label: wt.label, docRequired: wt.docRequired, warningText: wt.warningText, uploaded: !!selectedWorks[code].uploaded }
  }),
)
function isSelected(code: string) {
  return !!selectedWorks[code]
}
function tierMark(tier: number) {
  return tier === 3 ? 'rec' : tier === 2 ? 'de-risk' : tier === 0 ? 'flag' : ''
}

const progressPct = computed(() => {
  const order: Step[] = ['homeowner', 'landlord', 'purpose', 'next-home', 'select', 'proof', 'epc']
  const i = order.indexOf(step.value)
  return Math.max(8, Math.round(((i + 1) / order.length) * 100))
})

function persistLocal() {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ answers, selectedWorks, epcStatus: epcStatus.value, step: step.value }),
  )
}
function restoreLocal() {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    Object.assign(answers, parsed.answers || {})
    Object.assign(selectedWorks, parsed.selectedWorks || {})
    epcStatus.value = parsed.epcStatus ?? null
    // Only resume mid-flow at 'proof' (the sign-in round trip) — any
    // other stored step just re-derives naturally from the answers above.
    if (parsed.step === 'proof' && Object.keys(selectedWorks).length) {
      step.value = 'proof'
    }
    return true
  } catch {
    return false
  }
}

function goToStep(next: Step) {
  stepHistory.value.push(step.value)
  step.value = next
  persistLocal()
}
function onBack() {
  const prev = stepHistory.value.pop()
  if (!prev) {
    goBackToProperty()
    return
  }
  step.value = prev
}

function setHomeowner(val: boolean) {
  answers.isHomeowner = val
  if (!val) {
    goToStep('not-owner-result')
  } else {
    goToStep('landlord')
  }
}
function setLandlord(val: boolean) {
  answers.isLandlord = val
  goToStep('purpose')
}
function setPurpose(val: string) {
  answers.purpose = val
  goToStep(val === 'selling' ? 'next-home' : 'select')
}
function setNextHome(val: string) {
  answers.foundNextHome = val
  goToStep('select')
}

function toggleWork(code: string) {
  if (selectedWorks[code]) {
    delete selectedWorks[code]
  } else {
    selectedWorks[code] = { state: 'self' }
  }
  persistLocal()
  refreshLiveEstimate()
}

function hasEnergyWorkSelected() {
  return Object.keys(selectedWorks).some((code) => workTypes.value.find((w) => w.code === code)?.category === 'energy')
}

async function afterProof() {
  if (hasEnergyWorkSelected()) {
    goToStep('epc')
  } else {
    epcStatus.value = 'current' // nothing energy-related selected - nothing to ask about
    finish()
  }
}

function setEpc(v: 'current' | 'stale' | 'none') {
  epcStatus.value = v
  persistLocal()
  refreshLiveEstimate()
}

let previewDebounce: ReturnType<typeof setTimeout> | null = null
function refreshLiveEstimate() {
  if (previewDebounce) clearTimeout(previewDebounce)
  previewDebounce = setTimeout(async () => {
    try {
      const works = Object.entries(selectedWorks).map(([workTypeCode, v]) => ({
        workTypeCode,
        verificationState: v.uploaded ? 'verified' : 'self',
      }))
      liveEstimate.value = await $fetch(`${config.public.apiBase}/property/${propertyId}/truevalue/preview`, {
        method: 'POST',
        body: { works, epcStatus: epcStatus.value || 'current' },
      })
    } catch {
      /* live bar just keeps its last good value */
    }
  }, 200)
}

async function onFileSelected(work: { code: string }, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !token()) return
  try {
    // Lazily declare the work server-side the first time it needs a
    // workId to attach evidence to — steps 1-5 never persist anything.
    let workId = selectedWorks[work.code].workId
    if (!workId) {
      const declared: any = await $fetch(`${config.public.apiBase}/property/${propertyId}/truevalue/works`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: { workTypeCode: work.code },
      })
      workId = declared.works.find((w: any) => w.workTypeCode === work.code)?.id
      selectedWorks[work.code].workId = workId
    }
    const form = new FormData()
    form.append('file', file)
    await $fetch(`${config.public.apiBase}/truevalue/works/${workId}/evidence`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: form,
    })
    selectedWorks[work.code].uploaded = true
    persistLocal()
    refreshLiveEstimate()
  } catch {
    /* leave as self-reported - non-fatal */
  }
}

function goToSignIn() {
  persistLocal()
  if (typeof window !== 'undefined') {
    localStorage.setItem('redirectAfterLogin', `/truevalue/${propertyId}/quiz`)
  }
  router.push('/onboarding/signin')
}

async function finish() {
  if (!token()) {
    // Guest reached the end without ever uploading anything — fine, the
    // valuation just can't be saved server-side until they sign in.
    goToSignIn()
    return
  }
  try {
    await $fetch(`${config.public.apiBase}/property/${propertyId}/truevalue`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: {
        epcStatus: epcStatus.value || 'current',
        isHomeowner: answers.isHomeowner,
        isLandlord: answers.isLandlord,
        purpose: answers.purpose,
        foundNextHome: answers.foundNextHome,
      },
    })
  } finally {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
    router.push(`/truevalue/${propertyId}`)
  }
}

function finishExit() {
  router.push(`/property/${propertyId}`)
}

onMounted(async () => {
  try {
    const propRes: any = await $fetch(`${config.public.apiBase}/property/${propertyId}`)
    baseline.value = Number(propRes?.estimatedPrice ?? propRes?.lastSoldPrice ?? 0) || null
  } catch { /* baseline stays null */ }

  try {
    workTypes.value = await $fetch(`${config.public.apiBase}/property/${propertyId}/truevalue/work-types`)
  } catch { /* chip picker just shows empty - non-fatal */ }

  restoreLocal()
  loading.value = false
  refreshLiveEstimate()
})
</script>

<style scoped>
.tv-page { --navy: #231d45; --teal: #00a19a; --teal-d: #00817b; --muted: #6e6879; --line: #e7e4ec; --ok: #1f8f62; max-width: 480px; margin: 0 auto; padding: 0 20px 100px; color: var(--navy); }
.tv-topbar { display: flex; align-items: center; gap: 13px; padding: 18px 0 14px; }
.tv-back { width: 42px; height: 42px; border-radius: 50%; border: 1.7px solid var(--line); background: #fff; display: grid; place-items: center; cursor: pointer; font-size: 1.25rem; color: var(--navy); flex: 0 0 auto; line-height: 1; }
.tv-progress { flex: 1; height: 8px; border-radius: 6px; background: #e3e0e9; overflow: hidden; }
.tv-progress b { display: block; height: 100%; background: var(--teal); border-radius: 6px; transition: width 0.3s ease; }
.tv-loading { display: flex; justify-content: center; padding: 60px 0; }
.tv-spinner { width: 32px; height: 32px; border: 3px solid var(--line); border-top-color: var(--teal); border-radius: 50%; animation: tv-spin 0.8s linear infinite; }
@keyframes tv-spin { to { transform: rotate(360deg); } }

.tv-q { font-size: 1.625rem; letter-spacing: -1px; margin: 8px 0 8px; font-weight: 700; line-height: 1.1; color: var(--navy); }
.tv-qsub { color: var(--muted); font-size: 0.9375rem; margin: 0 0 18px; line-height: 1.45; }

.tv-optcard { background: #fff; border: 1.7px solid var(--line); border-radius: 22px; padding: 18px; margin-bottom: 12px; cursor: pointer; display: flex; gap: 14px; align-items: flex-start; }
.tv-optcard.on { border-color: var(--teal); background: #f1fbfa; box-shadow: 0 0 0 3px rgba(0, 161, 154, 0.13); }
.tv-rad { width: 23px; height: 23px; border-radius: 50%; border: 2.2px solid #cdc9d6; flex: 0 0 auto; margin-top: 1px; }
.tv-optcard.on .tv-rad { border-color: var(--teal); background: radial-gradient(circle, var(--teal) 0 40%, transparent 42%); }
.tv-ot { font-weight: 700; font-size: 1rem; color: var(--navy); line-height: 1.25; }
.tv-od { font-size: 0.8438rem; color: var(--muted); margin-top: 4px; line-height: 1.4; }

.tv-search { width: 100%; border: 1.7px solid var(--line); background: #fff; border-radius: 16px; padding: 14px 16px; font-family: inherit; font-size: 0.9375rem; color: var(--navy); margin-bottom: 14px; }
.tv-grouplabel { font-size: 0.7188rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--navy); margin: 18px 0 6px; }
.tv-grouphint { font-size: 0.8125rem; color: var(--muted); margin: 0 0 10px; line-height: 1.35; }
.tv-chips { display: flex; flex-wrap: wrap; gap: 9px; }
.tv-chip { border: 1.7px solid var(--line); background: #fff; border-radius: 16px; padding: 11px 14px; font-size: 0.875rem; font-weight: 600; cursor: pointer; color: var(--navy); display: flex; align-items: center; gap: 6px; }
.tv-chip.on { background: var(--navy); color: #fff; border-color: var(--navy); }
.tv-tmark { font-size: 0.5625rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; padding: 2px 5px; border-radius: 6px; }
.tv-tmark.tv-t2 { background: #dff2e9; color: #186b48; }
.tv-tmark.tv-t3 { background: #eceaf1; color: var(--muted); }
.tv-tmark.tv-t0 { background: #f4e6e6; color: #8a3a3a; }
.tv-chip.on .tv-tmark { background: rgba(255, 255, 255, 0.22); color: #fff; }
.tv-legend { font-size: 0.75rem; color: var(--muted); line-height: 1.6; margin-top: 16px; background: #efedf2; border-radius: 14px; padding: 12px 14px; }

.tv-btn-ghost { width: 100%; background: #fff; color: var(--navy); border: 1.7px solid var(--line); font-weight: 700; font-size: 0.9375rem; padding: 15px; border-radius: 20px; cursor: pointer; margin-top: 14px; }
.tv-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; border: none; cursor: pointer; font-weight: 700; font-size: 1rem; padding: 17px; border-radius: 20px; }
.tv-btn--primary { background: var(--teal); color: #fff; margin-top: 16px; }
.tv-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.tv-panel { background: #fff; border: 1.5px solid var(--line); border-radius: 22px; padding: 18px; margin-bottom: 12px; }
.tv-panel-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.tv-nm { font-weight: 700; font-size: 1rem; color: var(--navy); }
.tv-doc { font-size: 0.8125rem; color: var(--muted); margin-top: 3px; }
.tv-state { font-size: 0.7188rem; font-weight: 700; padding: 6px 12px; border-radius: 22px; white-space: nowrap; }
.tv-state--self { background: #f4efe2; color: #7d6428; }
.tv-state--ver { background: #dff2e9; color: #186b48; }
.tv-warnline { margin-top: 12px; background: #f7eaea; border-radius: 13px; padding: 11px 13px; font-size: 0.8125rem; line-height: 1.45; color: #7d3535; font-weight: 600; }
.tv-verifybtn { margin-top: 14px; width: 100%; border: 1.8px dashed var(--teal); background: #effbfa; color: var(--teal-d); border-radius: 16px; padding: 13px; font-weight: 700; font-size: 0.875rem; cursor: pointer; display: flex; gap: 9px; align-items: center; justify-content: center; position: relative; }
.tv-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.tv-verified-line { margin-top: 14px; display: flex; align-items: center; gap: 9px; color: var(--ok); font-weight: 700; font-size: 0.8438rem; background: #f1faf5; border-radius: 14px; padding: 12px 14px; }

.tv-caveat { background: #f6f0e4; border: 1.5px solid #e6d6b6; border-radius: 20px; padding: 17px; margin-top: 8px; display: flex; gap: 12px; }
.tv-caveat--info { background: #eef4fb; border-color: #c6dbf0; }
.tv-caveat-ic { flex: 0 0 auto; font-size: 1.0625rem; }
.tv-caveat-ct { font-size: 0.875rem; line-height: 1.5; color: #6b5320; }
.tv-caveat--info .tv-caveat-ct { color: #2c4d6e; }
.tv-caveat-ct b { color: #54400f; }
.tv-caveat--info .tv-caveat-ct b { color: #1c3a56; }

.tv-hero { background: var(--navy); border-radius: 28px; padding: 26px 24px; color: #fff; text-align: center; margin-top: 8px; }
.tv-hero-lab { font-size: 0.7188rem; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; opacity: 0.85; }
.tv-hero-big { font-size: 1.875rem; font-weight: 700; letter-spacing: -1.2px; margin: 12px 0 4px; }
.tv-hero-base { font-size: 0.875rem; opacity: 0.85; }
.tv-fineprint { font-size: 0.7813rem; color: var(--muted); line-height: 1.5; margin-top: 16px; text-align: center; }
</style>
