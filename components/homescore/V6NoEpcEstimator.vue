<template>
  <!-- Self-contained no-EPC estimator flow. Ports
       prisma/homescore-no-epc-prototype.html 1:1 for texts, question
       set, scoring math, band bands, boost recommendations. Only the
       font-family is intentionally NOT copied over — the wrapper
       inherits the app's SF Pro Display so the estimator visually
       belongs to the app.

       Three internal screens ("quiz" and "results") — the landing is
       upstream in V6ScoreView.vue; this component takes over the
       moment the user taps "Estimate my score →". -->
  <div class="v6-noepc-est">
    <!-- ══════════ QUIZ ══════════ -->
    <template v-if="screen === 'quiz'">
      <div class="topbar">
        <button
          class="circle-btn"
          type="button"
          aria-label="Back"
          @click="prevQ"
        >‹</button>
        <div class="topbar-title-block">
          <h1 class="topbar-title">Estimate quiz</h1>
          <div class="topbar-sub">{{ property?.addressLine1 ?? 'Your property' }}</div>
        </div>
        <button
          class="circle-btn"
          type="button"
          aria-label="Close"
          @click="$emit('close')"
        >×</button>
      </div>

      <div class="progress-wrap">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPct + '%' }" />
        </div>
        <div class="progress-meta">
          <span>Question {{ idx + 1 }} of {{ QS.length }}</span>
          <span>{{ QS[idx].s }}</span>
        </div>
      </div>

      <div class="live-pill">
        <span>{{ livePillText }}</span>
      </div>

      <div class="qbox">
        <div class="section-chip">{{ QS[idx].s }}</div>
        <div class="q-title">{{ QS[idx].t }}</div>
        <div v-if="QS[idx].sub" class="q-sub">{{ QS[idx].sub }}</div>
        <div v-else style="height:12px" />

        <button
          v-for="(o, i) in QS[idx].opts"
          :key="i"
          type="button"
          class="opt"
          :class="{ sel: answers[idx] === i, unsure: !!o[3] }"
          @click="pick(i)"
        >
          <span v-if="o[1]" class="em">{{ o[1] }}</span>
          <span>{{ o[0] }}</span>
        </button>
      </div>

      <div class="quiz-nav">
        <button class="btn back" type="button" @click="prevQ">Back</button>
        <button
          class="btn teal"
          type="button"
          :class="{ disabled: answers[idx] === null }"
          @click="nextQ"
        >{{ idx === QS.length - 1 ? 'See my estimate ✦' : 'Next' }}</button>
      </div>
    </template>

    <!-- ══════════ RESULTS ══════════ -->
    <template v-else-if="screen === 'results'">
      <div class="topbar">
        <button
          class="circle-btn"
          type="button"
          aria-label="Back"
          @click="screen = 'quiz'"
        >‹</button>
        <div class="topbar-title-block">
          <h1 class="topbar-title">Your HomeScore</h1>
          <div class="topbar-sub">Estimated · no EPC required</div>
        </div>
        <button
          class="circle-btn"
          type="button"
          aria-label="Close"
          @click="$emit('close')"
        >?</button>
      </div>

      <div class="result-card">
        <div class="result-brandrow">
          <div class="brandline">HOMESCORE<sup>™</sup></div>
          <span class="estchip">✦ Estimated</span>
        </div>
        <div class="result-top">
          <div class="ring">
            <svg width="118" height="118" viewBox="0 0 118 118">
              <circle cx="59" cy="59" r="50" fill="none" stroke="#e3e6ee" stroke-width="11" />
              <circle
                cx="59"
                cy="59"
                r="50"
                fill="none"
                stroke-width="11"
                stroke-linecap="round"
                :stroke="ringColor"
                stroke-dasharray="314"
                :stroke-dashoffset="ringOffset"
                transform="rotate(-90 59 59)"
                style="transition: stroke-dashoffset 1s ease, stroke 0.5s ease"
              />
            </svg>
            <div class="ring-val">
              <b>{{ result.mid }}</b>
              <span>est. {{ result.lo }}–{{ result.hi }}</span>
            </div>
          </div>
          <div class="result-side">
            <div class="result-title">{{ resultTitle }}</div>
            <div class="result-body" v-html="resultBody" />
          </div>
        </div>

        <div class="range-bar">
          <div class="range-track">
            <div
              class="range-window"
              :style="{ left: result.lo + '%', width: Math.max(4, result.hi - result.lo) + '%' }"
            />
          </div>
          <div class="range-labels">
            <span>G</span><span>F</span><span>E</span><span>D</span>
            <span>C</span><span>B</span><span>A</span>
          </div>
        </div>

        <div class="conf-row">
          <span class="conf-lbl">Confidence</span>
          <div class="conf-track">
            <div class="conf-fill" :style="{ width: result.conf + '%' }" />
          </div>
          <span class="conf-pct">{{ result.conf }}%</span>
        </div>

        <hr class="divider" />
        <div class="info-row">
          <div class="i">i</div>
          <div v-html="resultNote" />
        </div>
      </div>

      <div class="tiles">
        <div class="tile">
          <div class="lbl">Est. bills</div>
          <div class="big">£{{ estBills.toLocaleString() }}<small>/yr</small></div>
          <div class="cap">{{ estSaveText }}</div>
        </div>
        <div class="tile">
          <div class="lbl">CO₂</div>
          <div class="big">{{ estCo2 }}<small>t/yr</small></div>
          <div class="cap red">UK avg 6.0t</div>
        </div>
      </div>

      <div class="sect-head">
        <div class="t">How your ~{{ result.mid }} splits</div>
        <div class="a">Points breakdown</div>
      </div>
      <div class="card">
        <div v-for="row in splitRows" :key="row.key" class="split-row">
          <span class="em">{{ row.em }}</span>
          <span class="name">{{ row.name }}</span>
          <div class="split-track">
            <div
              class="split-fill"
              :style="{ width: row.pct + '%', background: row.pct < 60 ? '#E8A33D' : 'var(--accent, #1FA295)' }"
            />
          </div>
          <span class="split-pts">
            {{ row.pts }}/{{ row.max }}
            <span class="split-est">est.</span>
          </span>
        </div>
      </div>

      <div class="sect-head">
        <div class="t">Biggest score boosters</div>
        <div class="a" v-if="boosts.length">+{{ boostSum }} pts available</div>
      </div>
      <div class="card">
        <template v-if="boosts.length">
          <div v-for="(b, i) in boosts" :key="i" class="step">
            <span class="em">{{ b.em }}</span>
            <div class="txt">
              <b>{{ b.title }}</b>
              <span>{{ b.sub }}</span>
            </div>
            <span class="pts">+{{ b.pts }}</span>
          </div>
        </template>
        <template v-else>
          <div class="step">
            <span class="em">🏆</span>
            <div class="txt">
              <b>No obvious quick wins</b>
              <span>Your answers already score near the top of each category.</span>
            </div>
          </div>
        </template>
      </div>

      <button class="btn teal wide" type="button" @click="$emit('book-assessment')">
        Book a real EPC assessment
      </button>
      <button class="btn ghost wide" type="button" @click="retake">
        Retake the quiz
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineProps<{
  property: {
    addressLine1?: string | null
    postcode?: string | null
    propertyType?: string | null
  } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'book-assessment'): void
}>()

// ── Question model — 1:1 port of prisma/homescore-no-epc-prototype
// (§QS in the prototype). Categories map to the same maxima used by
// the app's real HomeScore engine so the estimate feels consistent
// with the certified score: heating 20, structure 25, efficiency 15,
// electrics 20, plumbing 20.
type Opt = [label: string, emoji: string, quality: number, unsure?: 1]
interface Question {
  s: string           // section heading (with emoji)
  t: string           // question title
  sub?: string        // optional sub-line
  cat: 'structure' | 'heating' | 'plumbing' | 'electrics' | 'efficiency'
  w: number           // weight
  opts: Opt[]
}
const U = "Not sure — use typical for this home's age"
const QS: Question[] = [
  { s: '🏠 Property basics', t: 'What type of property is it?', cat: 'structure', w: 1, opts: [
    ['Detached house', '🏡', 0.5],
    ['Semi-detached', '🏘️', 0.6],
    ['Mid-terrace', '🏚️', 0.75],
    ['Bungalow', '🛖', 0.45],
    ['Flat / maisonette', '🏢', 0.85],
  ] },
  { s: '🏠 Property basics', t: 'Roughly when was it built?', sub: "The age band sets the assumptions for anything you're unsure about.", cat: 'structure', w: 3, opts: [
    ['Before 1900', '🕰️', 0.15],
    ['1900–1929', '', 0.2],
    ['1930–1949', '', 0.3],
    ['1950–1966', '', 0.4],
    ['1967–1982', '', 0.5],
    ['1983–1995', '', 0.65],
    ['1996–2011', '', 0.8],
    ['2012 or later', '✨', 0.95],
  ] },
  { s: '🏠 Property basics', t: 'How big is it, roughly?', cat: 'efficiency', w: 3, opts: [
    ['Under 70m² · 1–2 bed', '', 0.8],
    ['70–100m² · 2–3 bed', '', 0.65],
    ['100–150m² · 3–4 bed', '', 0.5],
    ['Over 150m² · 4+ bed', '', 0.35],
    [U, '🤷', 0.55, 1],
  ] },
  { s: '🏠 Property basics', t: 'Any extensions?', cat: 'structure', w: 1, opts: [
    ['No extensions', '', 0.7],
    ['Yes — built after 2000', '', 0.8],
    ['Yes — older extension', '', 0.5],
    [U, '🤷', 0.6, 1],
  ] },
  { s: '🧱 Walls, roof & floor', t: 'What are the external walls?', sub: 'Tip: bricks in an alternating long/short pattern usually means solid walls.', cat: 'structure', w: 5, opts: [
    ['Cavity (two layers with a gap)', '🧱', 0.7],
    ['Solid brick', '🧱', 0.25],
    ['Stone', '🪨', 0.2],
    ['Timber frame', '🪵', 0.65],
    [U, '🤷', 0.45, 1],
  ] },
  { s: '🧱 Walls, roof & floor', t: 'Have the walls been insulated?', cat: 'structure', w: 4, opts: [
    ['Yes — cavity or solid-wall insulation', '✅', 0.9],
    ['No', '❌', 0.3],
    ['No cavity to fill (solid walls)', '', 0.2],
    [U, '🤷', 0.5, 1],
  ] },
  { s: '🧱 Walls, roof & floor', t: 'How much loft insulation is there?', cat: 'structure', w: 5, opts: [
    ['270mm+ (over ankle deep)', '🧤', 0.95],
    ['100–250mm', '', 0.65],
    ['A thin layer (under 100mm)', '', 0.35],
    ['None', '❌', 0.1],
    ['No loft (flat roof / top-floor flat)', '', 0.5],
    [U, '🤷', 0.5, 1],
  ] },
  { s: '🧱 Walls, roof & floor', t: 'Is there a loft conversion?', cat: 'structure', w: 1, opts: [
    ['No conversion', '', 0.7],
    ['Yes — insulated when converted', '✅', 0.8],
    ['Yes — not insulated', '❌', 0.3],
    [U, '🤷', 0.55, 1],
  ] },
  { s: '🧱 Walls, roof & floor', t: "What's under the ground floor?", cat: 'structure', w: 2, opts: [
    ['Solid concrete, insulated', '', 0.9],
    ['Solid concrete, uninsulated', '', 0.55],
    ['Suspended timber, insulated', '', 0.8],
    ['Suspended timber, uninsulated', '', 0.35],
    [U, '🤷', 0.5, 1],
  ] },
  { s: '🪟 Windows', t: 'What glazing does it have?', cat: 'structure', w: 2, opts: [
    ['Triple glazing', '❄️', 0.95],
    ['Double glazing throughout', '', 0.8],
    ['Mostly double, some single', '', 0.6],
    ['Mostly single glazed', '🥶', 0.2],
    [U, '🤷', 0.6, 1],
  ] },
  { s: '🪟 Windows', t: 'How old are the windows?', cat: 'structure', w: 1, opts: [
    ['Fitted 2002 or later', '', 0.85],
    ['Before 2002', '', 0.5],
    ['A mix', '', 0.65],
    [U, '🤷', 0.6, 1],
  ] },
  { s: '🔥 Heating & hot water', t: "What's the main heating system?", cat: 'heating', w: 7, opts: [
    ['Gas boiler + radiators', '🔥', 0.75],
    ['Heat pump', '💚', 0.95],
    ['Oil boiler', '🛢️', 0.5],
    ['Electric storage heaters', '', 0.35],
    ['Plug-in electric heaters', '⚡', 0.15],
    [U, '🤷', 0.5, 1],
  ] },
  { s: '🔥 Heating & hot water', t: 'How old is the boiler?', cat: 'heating', w: 6, opts: [
    ['Under 5 years', '✨', 0.95],
    ['5–15 years', '', 0.7],
    ['Over 15 years', '', 0.35],
    ['Back boiler (behind a fire)', '🕰️', 0.15],
    ['No boiler', '', 0.5],
    [U, '🤷', 0.5, 1],
  ] },
  { s: '🔥 Heating & hot water', t: 'What heating controls are there?', cat: 'heating', w: 3, opts: [
    ['Smart thermostat + radiator valves', '📱', 0.95],
    ['Programmer + thermostat + TRVs', '', 0.8],
    ['Programmer + thermostat', '', 0.6],
    ['Programmer only', '', 0.35],
    ['None', '❌', 0.1],
    [U, '🤷', 0.5, 1],
  ] },
  { s: '🔥 Heating & hot water', t: 'How is hot water heated?', cat: 'plumbing', w: 20, opts: [
    ['Combi boiler — no cylinder', '🚿', 0.85],
    ['Cylinder with factory foam insulation', '', 0.7],
    ['Cylinder with a loose jacket', '', 0.55],
    ['Cylinder, uninsulated', '❌', 0.25],
    ['Electric immersion only', '⚡', 0.35],
    [U, '🤷', 0.55, 1],
  ] },
  { s: '🔥 Heating & hot water', t: 'Any secondary heating?', cat: 'heating', w: 2, opts: [
    ['None', '', 0.8],
    ['Wood-burning stove', '🪵', 0.6],
    ['Open fireplace in use', '🔥', 0.3],
    ['Portable electric heaters', '', 0.4],
    [U, '🤷', 0.6, 1],
  ] },
  { s: '🔥 Heating & hot water', t: 'Is the property on mains gas?', cat: 'heating', w: 2, opts: [
    ['Yes', '', 0.85],
    ['No', '', 0.35],
    [U, '🤷', 0.6, 1],
  ] },
  { s: '⚡ Energy & extras', t: 'How much lighting is LED?', cat: 'efficiency', w: 6, opts: [
    ['All of it', '💡', 0.95],
    ['Most of it', '', 0.75],
    ['Some', '', 0.5],
    ['Hardly any', '', 0.2],
    [U, '🤷', 0.5, 1],
  ] },
  { s: '⚡ Energy & extras', t: 'Any renewables?', cat: 'electrics', w: 20, opts: [
    ['Solar panels + battery', '🔋', 0.95],
    ['Solar panels (PV)', '☀️', 0.85],
    ['Solar hot water', '', 0.7],
    ['None', '', 0.5],
    [U, '🤷', 0.5, 1],
  ] },
  { s: '⚡ Energy & extras', t: 'Smart meter & draught-proofing?', cat: 'efficiency', w: 6, opts: [
    ['Both', '✅', 0.9],
    ['Smart meter only', '', 0.7],
    ['Draught-proofed only', '', 0.65],
    ['Neither', '', 0.4],
    [U, '🤷', 0.5, 1],
  ] },
]
const CATMAX: Record<Question['cat'], number> = {
  heating: 20, structure: 25, efficiency: 15, electrics: 20, plumbing: 20,
}
const CATMETA: Array<[Question['cat'], string, string]> = [
  ['heating',   '🔥', 'Heating'],
  ['structure', '🧱', 'Structure'],
  ['efficiency','💡', 'Efficiency'],
  ['electrics', '⚡', 'Electrics'],
  ['plumbing',  '💧', 'Plumbing'],
]
// Boost table — question index → recommendation. Direct port from the
// prototype so the wording and prioritisation match exactly.
const BOOSTS: Record<number, [string, string, string]> = {
  5:  ['🧱', 'Insulate the walls', 'Cavity fill or solid-wall insulation'],
  6:  ['🏔️', 'Top up loft insulation to 270mm', 'One-day job, big fabric win'],
  9:  ['🪟', 'Upgrade the glazing', 'Move to full double glazing'],
  11: ['💚', 'Upgrade the main heating system', 'e.g. modern boiler or heat pump'],
  12: ['🔥', 'Replace the ageing boiler', 'New condensing boilers are ~90%+ efficient'],
  13: ['📱', 'Fit smart heating controls', 'Thermostat + radiator valves'],
  14: ['🚿', 'Insulate the hot water cylinder', 'A fitted jacket costs under £30'],
  17: ['💡', 'Switch remaining bulbs to LED', 'Cheapest fix on the list'],
  18: ['☀️', 'Add solar panels', 'Generates and offsets electricity'],
  19: ['🌬️', 'Draught-proof doors and windows', 'Strips and seals, under £50'],
}

const screen = ref<'quiz' | 'results'>('quiz')
const idx = ref(0)
const answers = ref<Array<number | null>>(new Array(QS.length).fill(null))

// ── Scoring math — direct port of the prototype's `calc()`. Quality
// scores per option, weighted by question weight, summed per category.
// Confidence = share of confidently-answered questions (unsure counts
// as 0.4 for confidence purposes so the estimate range still tightens).
interface Calc {
  cats: Record<Question['cat'], number>
  mid: number
  lo: number
  hi: number
  conf: number
}
function calc(): Calc {
  const cats: Record<Question['cat'], number> = {
    heating: 0, structure: 0, efficiency: 0, electrics: 0, plumbing: 0,
  }
  let certain = 0
  QS.forEach((q, i) => {
    const a = answers.value[i]
    let quality = 0.55           // unanswered baseline
    if (a !== null) {
      quality = q.opts[a][2]
      if (!q.opts[a][3]) certain += 1
      else certain += 0.4
    }
    cats[q.cat] += quality * q.w
  })
  const mid = Math.round(Object.values(cats).reduce((a, b) => a + b, 0))
  const half = Math.max(3, Math.round(16 - 13 * (certain / QS.length)))
  return {
    cats,
    mid,
    lo: Math.max(1, mid - half),
    hi: Math.min(100, mid + half),
    conf: Math.round(100 * certain / QS.length),
  }
}

function band(s: number): string {
  if (s >= 92) return 'A'
  if (s >= 81) return 'B'
  if (s >= 69) return 'C'
  if (s >= 55) return 'D'
  if (s >= 39) return 'E'
  if (s >= 21) return 'F'
  return 'G'
}
function bandCol(s: number): string {
  if (s >= 81) return '#3FAE6A'
  if (s >= 69) return '#8dc63f'
  if (s >= 55) return '#E8A33D'
  if (s >= 39) return '#e07b39'
  return '#E4574F'
}

const progressPct = computed(() => (100 * idx.value) / QS.length)

const livePillText = computed(() => {
  const est = calc()
  const lo = band(est.hi)
  const hi = band(est.lo)
  const rangeTxt = lo === hi ? `likely ${lo}` : `${lo}–${hi}`
  const anyAnswered = answers.value.some((a) => a !== null)
  if (!anyAnswered) return 'Current estimate: —'
  return `Current estimate: ${est.lo}–${est.hi} · ${rangeTxt}`
})

function pick(i: number) {
  answers.value[idx.value] = i
  // Auto-advance like the prototype: give the user 280ms to notice
  // their selection, then move to next question unless they just
  // corrected the last question.
  if (idx.value < QS.length - 1) {
    setTimeout(() => {
      if (answers.value[idx.value] === i && idx.value < QS.length - 1) {
        idx.value += 1
      }
    }, 280)
  }
}
function prevQ() {
  if (idx.value === 0) {
    emit('close')
    return
  }
  idx.value -= 1
}
function nextQ() {
  if (answers.value[idx.value] === null) return
  if (idx.value === QS.length - 1) {
    screen.value = 'results'
    return
  }
  idx.value += 1
}
function retake() {
  answers.value = new Array(QS.length).fill(null)
  idx.value = 0
  screen.value = 'quiz'
}
// ── Results computed pieces ──────────────────────────────────────
const result = computed<Calc>(() => calc())

const ringColor = computed(() => bandCol(result.value.mid))
const ringOffset = computed(() => 314 * (1 - result.value.mid / 100))

const resultTitle = computed(() => {
  const r = result.value
  const sameBand = band(r.lo) === band(r.hi)
  return sameBand ? `Likely band ${band(r.mid)}` : `Likely ${band(r.hi)}–${band(r.lo)}`
})

const boosts = computed(() => {
  const out: Array<{ em: string; title: string; sub: string; pts: number }> = []
  QS.forEach((q, i) => {
    if (!(i in BOOSTS)) return
    const a = answers.value[i]
    const quality = a === null ? 0.55 : q.opts[a][2]
    const gain = Math.round(q.w * (0.9 - quality))
    if (gain >= 1) {
      const b = BOOSTS[i]
      out.push({ em: b[0], title: b[1], sub: b[2], pts: gain })
    }
  })
  return out.sort((a, b) => b.pts - a.pts).slice(0, 4)
})
const boostSum = computed(() => boosts.value.reduce((s, b) => s + b.pts, 0))

const resultBody = computed(() => {
  const r = result.value
  const nB = boosts.value.length
  const boostFragment = nB
    ? ` <b>${nB} step${nB > 1 ? 's' : ''}</b> below could lift it further.`
    : ' This home is already performing strongly.'
  return `We estimate <b>${r.lo}–${r.hi} out of 100</b>.${boostFragment}`
})

const resultNote = computed(() => {
  const unsure = answers.value.filter(
    (a, i) => a !== null && QS[i].opts[a as number][3],
  ).length
  const unsurePart = unsure
    ? `${unsure} answer${unsure > 1 ? 's' : ''} used age-typical defaults; confirming them tightens the range. `
    : ''
  return `Estimated from <b>your answers today</b> — no EPC exists for this property. ${unsurePart}Book an accredited assessment to make it official.`
})

const estBills = computed(() =>
  Math.max(400, Math.round((2400 - result.value.mid * 18) / 10) * 10),
)
const estSaveText = computed(() => {
  const saveAmt = boostSum.value * 12
  return saveAmt ? `Save up to £${saveAmt}/yr` : 'Hard to beat'
})
const estCo2 = computed(() =>
  Math.max(0.8, 8 - result.value.mid * 0.06).toFixed(1),
)

const splitRows = computed(() =>
  CATMETA.map(([k, em, name]) => {
    const pts = Math.round(result.value.cats[k])
    const max = CATMAX[k]
    return { key: k, em, name, pts, max, pct: Math.round((pts / max) * 100) }
  }),
)
</script>

<style scoped>
/* Prototype-parity styles. Colour tokens are ported 1:1 (teal /
   navy / amber / red / green) but font-family is intentionally
   unset so the wrapper inherits SF Pro Display + system fallback. */
.v6-noepc-est {
  --teal: #1fa295;
  --teal-dark: #15837a;
  --teal-light: #e2f4f2;
  --navy: #2e2a50;
  --amber: #e8a33d;
  --red: #e4574f;
  --green: #3fae6a;
  --grey: #8b8fa3;
  --ink: #2e2a50;
  color: var(--ink);
  padding: 6px 4px 40px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px 14px;
}
.circle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: none;
  font-size: 18px;
  color: var(--ink);
  box-shadow: 0 2px 8px rgba(46, 42, 80, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex: none;
}
.topbar-title-block {
  text-align: center;
  flex: 1;
}
.topbar-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}
.topbar-sub {
  font-size: 12.5px;
  color: var(--grey);
  font-weight: 500;
  margin-top: 2px;
}

.progress-wrap {
  margin: 4px 20px 14px;
}
.progress-track {
  height: 8px;
  background: #dde0e8;
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--teal);
  border-radius: 99px;
  transition: width 0.3s ease;
}
.progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--grey);
  margin-top: 7px;
  font-weight: 600;
}
.live-pill {
  display: flex;
  justify-content: center;
  margin: 0 20px 14px;
}
.live-pill span {
  background: var(--teal-light);
  color: var(--teal-dark);
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 99px;
}

.qbox {
  padding: 0 20px;
}
.section-chip {
  font-size: 12px;
  letter-spacing: 0.12em;
  font-weight: 700;
  color: var(--grey);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.q-title {
  font-size: 21px;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 4px;
  color: var(--ink);
}
.q-sub {
  font-size: 14px;
  color: var(--grey);
  margin-bottom: 16px;
}
.opt {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: #fff;
  border: 2px solid transparent;
  border-radius: 18px;
  padding: 15px 16px;
  margin-bottom: 10px;
  font-size: 15.5px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  text-align: left;
  box-shadow: 0 2px 8px rgba(46, 42, 80, 0.05);
  transition: border-color 0.15s, transform 0.1s;
  font-family: inherit;
}
.opt:active { transform: scale(0.985); }
.opt.sel {
  border-color: var(--teal);
  background: var(--teal-light);
}
.opt .em {
  font-size: 20px;
  flex: none;
}
.opt.unsure {
  background: #f2f3f7;
  box-shadow: none;
  color: #6a6e83;
}
.quiz-nav {
  display: flex;
  gap: 10px;
  margin: 6px 20px 0;
}
.quiz-nav .btn { flex: 1; }
.btn {
  display: block;
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
  font-family: inherit;
}
.btn.wide { margin: 12px 20px 0; width: calc(100% - 40px); }
.btn.teal { background: var(--teal); color: #fff; }
.btn.back {
  background: #fff;
  color: var(--ink);
  box-shadow: 0 2px 8px rgba(46, 42, 80, 0.06);
}
.btn.ghost {
  background: transparent;
  color: var(--teal-dark);
  font-weight: 700;
}
.btn.disabled {
  opacity: 0.4;
  pointer-events: none;
}

/* Results */
.result-card {
  border: 2px solid var(--teal);
  background: #f6fbfa;
  border-radius: 26px;
  padding: 22px 20px;
  margin: 0 20px 14px;
}
.result-brandrow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.brandline {
  font-size: 12px;
  letter-spacing: 0.18em;
  font-weight: 800;
  color: var(--teal-dark);
}
.brandline sup { font-size: 8px; }
.estchip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--navy);
  color: #fff;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 5px 11px;
  border-radius: 99px;
  text-transform: uppercase;
}
.result-top {
  display: flex;
  gap: 18px;
  align-items: center;
}
.ring {
  position: relative;
  width: 118px;
  height: 118px;
  flex: none;
}
.ring-val {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ring-val b {
  font-size: 33px;
  font-weight: 800;
  line-height: 1;
}
.ring-val span {
  font-size: 12px;
  color: var(--grey);
  font-weight: 600;
  margin-top: 2px;
}
.result-side { flex: 1; }
.result-title {
  font-size: 21px;
  font-weight: 800;
  margin-bottom: 6px;
  line-height: 1.2;
}
.result-body {
  font-size: 14px;
  color: #5b5f75;
  line-height: 1.5;
}
.result-body :deep(b) {
  color: var(--teal-dark);
}

.range-bar { margin-top: 18px; }
.range-track {
  position: relative;
  height: 10px;
  border-radius: 99px;
  background: linear-gradient(90deg, #e4574f, #e8a33d, #f4d03f, #8dc63f, #3fae6a);
  opacity: 0.95;
}
.range-window {
  position: absolute;
  top: -4px;
  height: 18px;
  border-radius: 99px;
  border: 3px solid var(--navy);
  background: rgba(255, 255, 255, 0.35);
}
.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--grey);
  font-weight: 700;
  margin-top: 6px;
}

.conf-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}
.conf-lbl { font-size: 13px; font-weight: 700; }
.conf-track {
  flex: 1;
  height: 8px;
  background: #dde0e8;
  border-radius: 99px;
  overflow: hidden;
}
.conf-fill {
  height: 100%;
  background: var(--navy);
  border-radius: 99px;
  transition: width 0.5s ease;
}
.conf-pct {
  font-size: 13px;
  font-weight: 800;
  color: var(--navy);
}

.divider {
  border: none;
  border-top: 1px solid #e3e6ee;
  margin: 16px 0;
}
.info-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 13px;
  color: var(--grey);
  line-height: 1.45;
}
.info-row .i {
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--grey);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  font-weight: 700;
}
.info-row :deep(b) { color: var(--ink); }

.tiles {
  display: flex;
  gap: 12px;
  margin: 0 20px 14px;
}
.tile {
  flex: 1;
  background: #fff;
  border: 1.5px solid #dfe8e7;
  border-radius: 20px;
  padding: 16px;
  text-align: center;
}
.tile .lbl {
  font-size: 11.5px;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: var(--grey);
  text-transform: uppercase;
  margin-bottom: 6px;
}
.tile .big {
  font-size: 22px;
  font-weight: 800;
}
.tile .big small {
  font-size: 13px;
  font-weight: 600;
  color: var(--grey);
}
.tile .cap {
  font-size: 12px;
  color: var(--teal-dark);
  font-weight: 600;
  margin-top: 5px;
}
.tile .cap.red { color: var(--red); }

.sect-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 24px 12px;
}
.sect-head .t {
  font-size: 13.5px;
  letter-spacing: 0.14em;
  font-weight: 700;
  color: #5b5f75;
  text-transform: uppercase;
}
.sect-head .a {
  font-size: 14px;
  font-weight: 700;
  color: var(--teal-dark);
}

.card {
  background: #fff;
  border-radius: 22px;
  padding: 8px 12px;
  box-shadow: 0 2px 10px rgba(46, 42, 80, 0.06);
  margin: 0 20px 14px;
}
.split-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 4px;
}
.split-row + .split-row {
  border-top: 1px solid #f0f1f6;
}
.split-row .em {
  font-size: 19px;
  width: 26px;
  text-align: center;
}
.split-row .name {
  width: 86px;
  font-size: 15px;
  font-weight: 700;
}
.split-track {
  flex: 1;
  height: 9px;
  background: #e8eaf0;
  border-radius: 99px;
  overflow: hidden;
}
.split-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.7s ease;
}
.split-pts {
  width: 52px;
  text-align: right;
  font-size: 14.5px;
  font-weight: 800;
}
.split-est {
  font-size: 10.5px;
  color: var(--grey);
  font-weight: 600;
  display: block;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 4px;
}
.step + .step {
  border-top: 1px solid #f0f1f6;
}
.step .em {
  font-size: 19px;
  width: 26px;
  text-align: center;
}
.step .txt { flex: 1; }
.step .txt b {
  font-size: 14.5px;
  display: block;
}
.step .txt span {
  font-size: 12.5px;
  color: var(--grey);
}
.step .pts {
  font-size: 14px;
  font-weight: 800;
  color: var(--teal-dark);
  background: var(--teal-light);
  padding: 5px 10px;
  border-radius: 99px;
}
</style>
