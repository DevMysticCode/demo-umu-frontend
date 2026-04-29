import type {
  Question,
  Answers,
  PillarBreakdown,
  ScoreResult,
  TopWin,
  Opportunity,
} from '~/types/homescore'

export const BASE_SCORE = 37
export const CARBON_BASELINE = 2900

export const QUESTIONS: Question[] = [
  // ── YOUR HOME ──────────────────────────────────────────────────────
  {
    id: 'propertyType',
    cat: 'YOUR HOME',
    title: 'What type of property is it?',
    options: [
      {
        label: 'Detached house',
        value: 'detached',
        delta: 0,
        carbonDelta: 0,
        category: 'structure',
        narr: 'Detached homes have the most exposed wall area.',
      },
      {
        label: 'Semi-detached house',
        value: 'semi',
        delta: +2,
        carbonDelta: -200,
        category: 'structure',
        narr: 'One shared wall reduces heat loss.',
      },
      {
        label: 'Mid-terrace house',
        value: 'terrace',
        delta: +4,
        carbonDelta: -400,
        category: 'structure',
        narr: 'Two shared walls — naturally more efficient.',
      },
      {
        label: 'Flat / apartment',
        value: 'flat',
        delta: +5,
        carbonDelta: -500,
        category: 'structure',
        narr: 'Shared floors and ceilings help efficiency.',
      },
      {
        label: 'Bungalow',
        value: 'bungalow',
        delta: -1,
        carbonDelta: +100,
        category: 'structure',
        narr: 'Large roof area relative to floor space.',
      },
    ],
  },
  {
    id: 'yearBuilt',
    cat: 'YOUR HOME',
    title: 'Roughly when was the property built?',
    options: [
      {
        label: 'Before 1930',
        value: 'pre1930',
        delta: -6,
        carbonDelta: +800,
        category: 'structure',
        narr: 'Pre-1930 homes typically have solid walls and no cavity — hardest to insulate.',
      },
      {
        label: '1930–1966',
        value: 'y1930',
        delta: -3,
        carbonDelta: +500,
        category: 'structure',
        narr: 'Cavity walls present but often unfilled.',
      },
      {
        label: '1967–1990',
        value: 'y1967',
        delta: +1,
        carbonDelta: +200,
        category: 'structure',
        narr: 'Basic insulation standards introduced.',
      },
      {
        label: '1991–2006',
        value: 'y1991',
        delta: +3,
        carbonDelta: 0,
        category: 'structure',
        narr: 'Improved building regs — better baseline.',
      },
      {
        label: '2007–2015',
        value: 'y2007',
        delta: +5,
        carbonDelta: -300,
        category: 'structure',
        narr: 'Modern standards — well insulated by design.',
      },
      {
        label: '2016 or newer',
        value: 'y2016',
        delta: +8,
        carbonDelta: -600,
        category: 'structure',
        narr: 'Built to current Part L standards — high efficiency.',
      },
    ],
  },

  // ── HEATING ────────────────────────────────────────────────────────
  {
    id: 'heatingType',
    cat: 'HEATING',
    title: 'What is the main heating system?',
    options: [
      {
        label: 'Air source heat pump',
        value: 'ashp',
        delta: +12,
        carbonDelta: -2200,
        category: 'heating',
        narr: 'Heat pumps run on electricity and produce ~3× the heat per unit of energy.',
      },
      {
        label: 'Ground source heat pump',
        value: 'gshp',
        delta: +14,
        carbonDelta: -2600,
        category: 'heating',
        narr: 'The most efficient heating system available.',
      },
      {
        label: 'Modern gas boiler (< 10 yrs)',
        value: 'modern_gas',
        delta: +6,
        carbonDelta: -200,
        category: 'heating',
        narr: 'Modern boilers are ~94% efficient.',
      },
      {
        label: 'Gas boiler (10–20 yrs)',
        value: 'mid_gas',
        delta: +2,
        carbonDelta: +300,
        category: 'heating',
        narr: 'Efficiency falling — nearing end of life.',
      },
      {
        label: 'Old gas boiler (> 20 yrs)',
        value: 'old_gas',
        delta: -4,
        carbonDelta: +900,
        category: 'heating',
        narr: 'Older boilers can drop to 60% efficiency — a major carbon emitter.',
      },
      {
        label: 'Oil boiler',
        value: 'oil',
        delta: -3,
        carbonDelta: +1400,
        category: 'heating',
        narr: 'Oil has a higher carbon intensity than gas.',
      },
      {
        label: 'Electric storage heaters',
        value: 'electric',
        delta: -2,
        carbonDelta: +200,
        category: 'heating',
        narr: 'Carbon depends on the grid — improving as renewables grow.',
      },
      {
        label: 'No central heating',
        value: 'none_heat',
        delta: -8,
        carbonDelta: +600,
        category: 'heating',
        narr: 'Biggest single score impact.',
      },
    ],
  },
  {
    id: 'hotWater',
    cat: 'HEATING',
    title: 'How is hot water heated?',
    options: [
      {
        label: 'Combi boiler (same as heating)',
        value: 'combi',
        delta: +3,
        carbonDelta: -100,
        category: 'heating',
        narr: 'Efficient — heats on demand, no cylinder losses.',
      },
      {
        label: 'Solar thermal + cylinder',
        value: 'solar_hw',
        delta: +8,
        carbonDelta: -700,
        category: 'heating',
        narr: 'Solar thermal covers 50–70% of hot water needs.',
      },
      {
        label: 'Heat pump hot water cylinder',
        value: 'hp_hw',
        delta: +7,
        carbonDelta: -600,
        category: 'heating',
        narr: 'Highly efficient — extracts heat from air.',
      },
      {
        label: 'Gas cylinder (separate)',
        value: 'gas_cyl',
        delta: +1,
        carbonDelta: 0,
        category: 'heating',
        narr: 'Less efficient than combi due to standing losses.',
      },
      {
        label: 'Immersion heater (electric)',
        value: 'immersion',
        delta: -2,
        carbonDelta: +400,
        category: 'heating',
        narr: 'Direct electric heating is expensive and carbon-heavy.',
      },
    ],
  },
  {
    id: 'lastServiced',
    cat: 'HEATING',
    title: 'When was the boiler or heating last serviced?',
    options: [
      {
        label: 'Within the last year',
        value: 'recent',
        delta: +4,
        carbonDelta: -150,
        category: 'heating',
        narr: 'A serviced boiler runs at peak efficiency.',
      },
      {
        label: '1–3 years ago',
        value: 'moderate',
        delta: +1,
        carbonDelta: 0,
        category: 'heating',
        narr: 'Annual servicing is recommended — overdue but not critical.',
      },
      {
        label: 'Over 3 years ago',
        value: 'old',
        delta: -2,
        carbonDelta: +200,
        category: 'heating',
        narr: 'Long overdue — efficiency drops and warranty may be void.',
      },
      {
        label: 'Never / not sure',
        value: 'never',
        delta: -4,
        carbonDelta: +400,
        category: 'heating',
        narr: 'An unserviced boiler can waste 15%+ of energy.',
      },
    ],
  },
  {
    id: 'secondaryHeating',
    cat: 'HEATING',
    title: 'Is there a secondary heating source?',
    options: [
      {
        label: 'Wood-burning stove (certified)',
        value: 'stove',
        delta: +2,
        carbonDelta: -100,
        category: 'heating',
        narr: 'DEFRA-approved stoves are relatively clean.',
      },
      {
        label: 'Open fireplace',
        value: 'fireplace',
        delta: -2,
        carbonDelta: +500,
        category: 'heating',
        narr: 'Open fires are very inefficient — most heat goes up the chimney.',
      },
      {
        label: 'Electric panel heaters',
        value: 'elec_pan',
        delta: -1,
        carbonDelta: +200,
        category: 'heating',
        narr: 'Cheap to install but expensive to run — high carbon per kWh.',
      },
      {
        label: 'No secondary heating',
        value: 'none_sec',
        delta: 0,
        carbonDelta: 0,
        category: 'heating',
        narr: 'Primary heating does all the work — no penalty.',
      },
    ],
  },

  // ── INSULATION ─────────────────────────────────────────────────────
  {
    id: 'wallType',
    cat: 'INSULATION',
    title: 'What are the external walls made of?',
    options: [
      {
        label: 'Cavity wall — insulated',
        value: 'cavity_ins',
        delta: +7,
        carbonDelta: -500,
        category: 'structure',
        narr: 'Insulated cavity walls are one of the best upgrades.',
      },
      {
        label: 'Solid wall — insulated (internal or external)',
        value: 'solid_ins',
        delta: +5,
        carbonDelta: -400,
        category: 'structure',
        narr: 'Insulated solid walls perform close to modern cavity standards.',
      },
      {
        label: 'Cavity wall — uninsulated',
        value: 'cavity_unins',
        delta: -3,
        carbonDelta: +500,
        category: 'structure',
        narr: 'Cavity fill is cheap and quick — biggest bang for buck.',
      },
      {
        label: 'Solid wall — uninsulated',
        value: 'solid_unins',
        delta: -6,
        carbonDelta: +900,
        category: 'structure',
        narr: 'Biggest source of heat loss in older homes.',
      },
      {
        label: 'Timber frame / modern panel',
        value: 'timber',
        delta: +6,
        carbonDelta: -400,
        category: 'structure',
        narr: 'Modern timber frames are built with insulation baked in.',
      },
    ],
  },
  {
    id: 'loftInsulation',
    cat: 'INSULATION',
    title: 'How well insulated is the loft or roof?',
    options: [
      {
        label: 'Well insulated (270mm+)',
        value: 'well',
        delta: +6,
        carbonDelta: -500,
        category: 'efficiency',
        narr: 'Meets current building regs — roof heat loss is minimal.',
      },
      {
        label: 'Partial (100–270mm)',
        value: 'partial',
        delta: +2,
        carbonDelta: -100,
        category: 'efficiency',
        narr: 'Decent cover but topping up to 270mm is a quick win.',
      },
      {
        label: 'Minimal (under 100mm)',
        value: 'minimal',
        delta: -4,
        carbonDelta: +500,
        category: 'efficiency',
        narr: '25% of heat escapes through the roof. Topping up to 270mm costs ~£300 and saves ~£320/yr.',
      },
      {
        label: 'No loft (flat/room-in-roof)',
        value: 'no_loft',
        delta: 0,
        carbonDelta: 0,
        category: 'efficiency',
        narr: 'Flat or warm roofs need specialist insulation from above or below.',
      },
    ],
  },
  {
    id: 'floorInsulation',
    cat: 'INSULATION',
    title: 'Is the ground floor insulated?',
    options: [
      {
        label: 'Yes — suspended floor insulated',
        value: 'floor_ins',
        delta: +4,
        carbonDelta: -300,
        category: 'efficiency',
        narr: 'Insulation between joists stops draughts and heat loss.',
      },
      {
        label: 'Solid concrete floor',
        value: 'concrete',
        delta: +1,
        carbonDelta: 0,
        category: 'efficiency',
        narr: 'Solid floors lose less heat than uninsulated suspended floors.',
      },
      {
        label: 'Suspended floor — not insulated',
        value: 'floor_unins',
        delta: -3,
        carbonDelta: +400,
        category: 'efficiency',
        narr: 'Up to 15% of heat lost through the floor.',
      },
      {
        label: 'Not sure',
        value: 'unsure',
        delta: 0,
        carbonDelta: +100,
        category: 'efficiency',
        narr: 'A quick survey will confirm floor type and insulation level.',
      },
    ],
  },
  {
    id: 'windows',
    cat: 'INSULATION',
    title: 'What glazing do the windows have?',
    options: [
      {
        label: 'Triple glazed',
        value: 'triple',
        delta: +7,
        carbonDelta: -400,
        category: 'structure',
        narr: 'Triple glazing cuts heat loss by ~50% vs modern double.',
      },
      {
        label: 'Double glazed (< 10 yrs)',
        value: 'new_double',
        delta: +5,
        carbonDelta: -200,
        category: 'structure',
        narr: 'Modern A-rated double glazing — performs well year-round.',
      },
      {
        label: 'Double glazed (10+ yrs)',
        value: 'old_double',
        delta: +2,
        carbonDelta: 0,
        category: 'structure',
        narr: 'Seals degrade over time — check for misting or draughts.',
      },
      {
        label: 'Mix of single and double',
        value: 'mix',
        delta: -2,
        carbonDelta: +300,
        category: 'structure',
        narr: 'Any remaining single panes are weak spots for heat loss.',
      },
      {
        label: 'Single glazed throughout',
        value: 'single',
        delta: -5,
        carbonDelta: +600,
        category: 'structure',
        narr: 'Single glazing is the biggest quick win for many homes.',
      },
    ],
  },

  // ── GREEN ENERGY ───────────────────────────────────────────────────
  {
    id: 'renewables',
    cat: 'GREEN ENERGY',
    title: 'Any renewable energy sources installed?',
    options: [
      {
        label: 'Solar PV + battery storage',
        value: 'solar_battery',
        delta: +12,
        carbonDelta: -1800,
        category: 'efficiency',
        narr: 'Generates and stores your own clean electricity.',
      },
      {
        label: 'Solar PV panels only',
        value: 'solar',
        delta: +7,
        carbonDelta: -1200,
        category: 'efficiency',
        narr: 'Generates ~3,500 kWh/yr on a typical roof.',
      },
      {
        label: 'Solar thermal (hot water)',
        value: 'solar_thermal',
        delta: +4,
        carbonDelta: -500,
        category: 'efficiency',
        narr: 'Covers 50–70% of hot water needs through the year.',
      },
      {
        label: 'None',
        value: 'none',
        delta: 0,
        carbonDelta: 0,
        category: 'efficiency',
        narr: 'No renewables yet — biggest improvement opportunity.',
      },
    ],
  },
  {
    id: 'energyTariff',
    cat: 'GREEN ENERGY',
    title: 'What energy tariff are you on?',
    options: [
      {
        label: '100% renewable / green tariff',
        value: 'green',
        delta: +5,
        carbonDelta: -1500,
        category: 'efficiency',
        narr: 'Your grid electricity is matched with renewable generation.',
      },
      {
        label: 'Standard tariff',
        value: 'standard',
        delta: 0,
        carbonDelta: 0,
        category: 'efficiency',
        narr: 'Default grid mix — switching to a green tariff is free in minutes.',
      },
      {
        label: 'Economy 7 (off-peak electric)',
        value: 'economy7',
        delta: +1,
        carbonDelta: -200,
        category: 'efficiency',
        narr: 'Cheaper overnight rates — ideal with storage heaters or EV charging.',
      },
      {
        label: 'Not sure',
        value: 'unsure',
        delta: 0,
        carbonDelta: +100,
        category: 'efficiency',
        narr: 'Check a recent bill — the tariff name is printed near the top.',
      },
    ],
  },
  {
    id: 'ev',
    cat: 'GREEN ENERGY',
    title: 'Do you have an EV or plan to?',
    options: [
      {
        label: 'EV + home charger installed',
        value: 'ev_charger',
        delta: +4,
        carbonDelta: -600,
        category: 'electrics',
        narr: 'Home charging on renewable electricity is near-zero carbon transport.',
      },
      {
        label: 'EV but no home charger',
        value: 'ev_no_ch',
        delta: +1,
        carbonDelta: -300,
        category: 'electrics',
        narr: 'Public charging works but a home 7kW charger pays back in 2–3 years.',
      },
      {
        label: 'Planning to get an EV',
        value: 'planning',
        delta: +1,
        carbonDelta: -100,
        category: 'electrics',
        narr: 'Worth installing a charger now — OZEV grant can cover part of the cost.',
      },
      {
        label: 'No / not applicable',
        value: 'none',
        delta: 0,
        carbonDelta: 0,
        category: 'electrics',
        narr: 'No transport-related carbon tracked in this score.',
      },
    ],
  },

  // ── LIGHTING & CONTROLS ────────────────────────────────────────────
  {
    id: 'lighting',
    cat: 'LIGHTING',
    title: 'What type of lighting is fitted?',
    options: [
      {
        label: 'All LED throughout',
        value: 'all_led',
        delta: +4,
        carbonDelta: -300,
        category: 'efficiency',
        narr: 'LEDs use 90% less energy than incandescent bulbs.',
      },
      {
        label: 'Mostly LED, some older bulbs',
        value: 'most_led',
        delta: +2,
        carbonDelta: -150,
        category: 'efficiency',
        narr: 'Swapping the last few halogens out is cheap and fast.',
      },
      {
        label: 'Mix of LED and halogen',
        value: 'mix',
        delta: 0,
        carbonDelta: 0,
        category: 'efficiency',
        narr: 'Around half your bulbs are still energy-hungry — room to improve.',
      },
      {
        label: 'Mostly halogen or older',
        value: 'halogen',
        delta: -2,
        carbonDelta: +300,
        category: 'efficiency',
        narr: 'Lighting accounts for ~15% of a typical energy bill.',
      },
    ],
  },
  {
    id: 'controls',
    cat: 'LIGHTING',
    title: 'What heating controls does the property have?',
    options: [
      {
        label: 'Smart thermostat (Hive, Nest etc.)',
        value: 'smart',
        delta: +4,
        carbonDelta: -300,
        category: 'efficiency',
        narr: 'Smart thermostats save ~£130/yr on average.',
      },
      {
        label: 'Programmable thermostat + TRVs',
        value: 'prog_trvs',
        delta: +2,
        carbonDelta: -150,
        category: 'efficiency',
        narr: 'Room-by-room control (TRVs) stops unused rooms being heated.',
      },
      {
        label: 'Basic thermostat only',
        value: 'basic',
        delta: 0,
        carbonDelta: 0,
        category: 'efficiency',
        narr: 'One central thermostat — adding TRVs is a cheap next step.',
      },
      {
        label: 'No thermostat / manual',
        value: 'none',
        delta: -3,
        carbonDelta: +300,
        category: 'efficiency',
        narr: "No control means heating runs when it doesn't need to.",
      },
    ],
  },
  {
    id: 'ventilation',
    cat: 'LIGHTING',
    title: 'How is the property ventilated?',
    options: [
      {
        label: 'MVHR (mechanical ventilation with heat recovery)',
        value: 'mvhr',
        delta: +6,
        carbonDelta: -400,
        category: 'efficiency',
        narr: 'MVHR recovers 90% of heat from outgoing air.',
      },
      {
        label: 'Positive input ventilation (PIV)',
        value: 'piv',
        delta: +2,
        carbonDelta: -100,
        category: 'efficiency',
        narr: 'Continuous fresh air keeps damp and condensation down.',
      },
      {
        label: 'Extractor fans + natural ventilation',
        value: 'extract',
        delta: 0,
        carbonDelta: 0,
        category: 'efficiency',
        narr: 'Standard setup — effective when fans are used in bathrooms and kitchens.',
      },
      {
        label: 'Natural only (windows / vents)',
        value: 'natural',
        delta: -1,
        carbonDelta: +100,
        category: 'efficiency',
        narr: 'Draughty homes lose significant heat.',
      },
    ],
  },

  // ── ELECTRICS ──────────────────────────────────────────────────────
  {
    id: 'consumerUnit',
    cat: 'ELECTRICS',
    title: 'How old is the consumer unit (fuse box)?',
    options: [
      {
        label: 'Modern RCBO board (< 10 yrs)',
        value: 'modern',
        delta: +4,
        carbonDelta: 0,
        category: 'electrics',
        narr: 'Individual RCBO protection per circuit — safest current standard.',
      },
      {
        label: 'Standard modern (10–20 yrs)',
        value: 'standard',
        delta: +1,
        carbonDelta: 0,
        category: 'electrics',
        narr: 'Compliant with 17th edition regs — typically fine for now.',
      },
      {
        label: 'Old fuse box (> 20 yrs)',
        value: 'old',
        delta: -3,
        carbonDelta: 0,
        category: 'electrics',
        narr: 'Older boards may fail EICR — a requirement for lettings.',
      },
      {
        label: 'Very old / needs rewire',
        value: 'very_old',
        delta: -6,
        carbonDelta: 0,
        category: 'electrics',
        narr: 'Rewire likely needed — can flag on surveys and affect mortgage offers.',
      },
    ],
  },

  // ── PLUMBING ───────────────────────────────────────────────────────
  {
    id: 'pipes',
    cat: 'PLUMBING',
    title: 'What condition are the water pipes in?',
    options: [
      {
        label: 'Modern copper or plastic',
        value: 'modern',
        delta: +4,
        carbonDelta: 0,
        category: 'plumbing',
        narr: 'Safe, long-lasting and easy for plumbers to work on.',
      },
      {
        label: 'Older but serviceable',
        value: 'serviceable',
        delta: 0,
        carbonDelta: 0,
        category: 'plumbing',
        narr: 'Copper still in use — keep an eye on joints and pressure.',
      },
      {
        label: 'Old lead or galvanised pipes',
        value: 'old',
        delta: -5,
        carbonDelta: 0,
        category: 'plumbing',
        narr: 'Lead pipes are a health and legal concern for buyers.',
      },
    ],
  },
  {
    id: 'waterPressure',
    cat: 'PLUMBING',
    title: 'How would you rate the water pressure?',
    options: [
      {
        label: 'Excellent',
        value: 'excellent',
        delta: +3,
        carbonDelta: 0,
        category: 'plumbing',
        narr: 'Strong mains pressure — great for combi boilers and multiple outlets.',
      },
      {
        label: 'Good',
        value: 'good',
        delta: +1,
        carbonDelta: 0,
        category: 'plumbing',
        narr: 'Comfortable flow with no noticeable issues.',
      },
      {
        label: 'Low',
        value: 'low',
        delta: -2,
        carbonDelta: 0,
        category: 'plumbing',
        narr: 'Weak showers and slow taps may indicate pipe corrosion or a partial blockage.',
      },
      {
        label: 'Very low or problematic',
        value: 'very_low',
        delta: -4,
        carbonDelta: 0,
        category: 'plumbing',
        narr: 'Often signals old pipework or mains supply issues — worth a plumber check.',
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────────────────────────────────────

const PILLAR_BASE: Record<string, number> = {
  heating: 6,
  structure: 10,
  efficiency: 6,
  electrics: 8,
  plumbing: 9,
}
const PILLAR_MAX: Record<string, number> = {
  heating: 20,
  structure: 25,
  efficiency: 20,
  electrics: 15,
  plumbing: 20,
}

function getRating(total: number): { rating: string; ratingColor: string } {
  if (total >= 80) return { rating: 'Excellent', ratingColor: '#16a34a' }
  if (total >= 65) return { rating: 'Good', ratingColor: '#0d9488' }
  if (total >= 45) return { rating: 'Room to improve', ratingColor: '#f59e0b' }
  return { rating: 'Plenty of opportunities', ratingColor: '#dc2626' }
}

export function calculateScore(answers: Partial<Answers>): ScoreResult {
  let totalDelta = 0
  const pillarDeltas: Record<string, number> = {
    heating: 0,
    structure: 0,
    efficiency: 0,
    electrics: 0,
    plumbing: 0,
  }
  let carbonDelta = 0
  let answeredCount = 0

  for (const q of QUESTIONS) {
    const val = answers[q.id]
    if (!val) continue
    const opt = q.options.find((o) => o.value === val)
    if (!opt) continue
    totalDelta += opt.delta
    pillarDeltas[opt.category] += opt.delta
    carbonDelta += opt.carbonDelta
    answeredCount++
  }

  const total = Math.max(0, Math.min(100, Math.round(BASE_SCORE + totalDelta)))
  const carbonKg = Math.max(400, Math.min(6000, CARBON_BASELINE + carbonDelta))

  const breakdown: PillarBreakdown = {
    heating: Math.max(
      0,
      Math.min(PILLAR_MAX.heating, PILLAR_BASE.heating + pillarDeltas.heating),
    ),
    structure: Math.max(
      0,
      Math.min(
        PILLAR_MAX.structure,
        PILLAR_BASE.structure + pillarDeltas.structure,
      ),
    ),
    efficiency: Math.max(
      0,
      Math.min(
        PILLAR_MAX.efficiency,
        PILLAR_BASE.efficiency + pillarDeltas.efficiency,
      ),
    ),
    electrics: Math.max(
      0,
      Math.min(
        PILLAR_MAX.electrics,
        PILLAR_BASE.electrics + pillarDeltas.electrics,
      ),
    ),
    plumbing: Math.max(
      0,
      Math.min(
        PILLAR_MAX.plumbing,
        PILLAR_BASE.plumbing + pillarDeltas.plumbing,
      ),
    ),
  }

  const confidenceScore = Math.round(
    20 + (answeredCount / QUESTIONS.length) * 35,
  )

  return { total, carbonKg, breakdown, confidenceScore, ...getRating(total) }
}

export function getPillarMax(pillar: string): number {
  return PILLAR_MAX[pillar] ?? 20
}

// ─────────────────────────────────────────────────────────────────────────────
// EPC Prefill
// ─────────────────────────────────────────────────────────────────────────────

export function getPrefillFromProperty(property: {
  epcRating?: string | null
  yearBuilt?: number | null
  heatingType?: string | null
}): Partial<Answers> {
  const p: Partial<Answers> = {}

  if (property.epcRating) {
    const r = property.epcRating.toUpperCase()
    if (['A', 'B'].includes(r)) {
      p.loftInsulation = 'well'
      p.wallType = 'cavity_ins'
    } else if (r === 'C') {
      p.loftInsulation = 'partial'
      p.wallType = 'cavity_unins'
    } else if (['D', 'E'].includes(r)) {
      p.loftInsulation = 'minimal'
      p.wallType = 'solid_unins'
    } else {
      p.loftInsulation = 'minimal'
      p.wallType = 'solid_unins'
    }
  }

  if (property.yearBuilt) {
    const age = new Date().getFullYear() - property.yearBuilt
    if (age < 10) {
      p.windows = 'new_double'
      p.consumerUnit = 'modern'
      p.yearBuilt = 'y2016'
    } else if (age < 20) {
      p.windows = 'old_double'
      p.consumerUnit = 'standard'
      p.yearBuilt = 'y2007'
    } else if (age < 40) {
      p.windows = 'old_double'
      p.consumerUnit = 'old'
      p.yearBuilt = 'y1991'
    } else if (age < 60) {
      p.windows = 'mix'
      p.consumerUnit = 'old'
      p.yearBuilt = 'y1967'
    } else {
      p.windows = 'single'
      p.consumerUnit = 'old'
      p.yearBuilt = 'pre1930'
    }
  }

  if (property.heatingType) {
    const h = property.heatingType.toLowerCase()
    if (
      h.includes('heat pump') ||
      h.includes('air source') ||
      h.includes('ground source')
    ) {
      p.heatingType = h.includes('ground') ? 'gshp' : 'ashp'
    } else if (h.includes('gas') || h.includes('boiler')) {
      const age = property.yearBuilt
        ? new Date().getFullYear() - property.yearBuilt
        : 15
      p.heatingType = age < 10 ? 'modern_gas' : age < 20 ? 'mid_gas' : 'old_gas'
    } else if (h.includes('electric') || h.includes('storage')) {
      p.heatingType = 'electric'
    } else if (h.includes('oil')) {
      p.heatingType = 'oil'
    }
  }

  return p
}

// ─────────────────────────────────────────────────────────────────────────────
// Top wins — improvements ranked by potential saving
// ─────────────────────────────────────────────────────────────────────────────

interface WinCandidate {
  title: string
  sub: string
  savingPerYear: number
  points: number
}

const WIN_MAP: Record<string, (optValue: string) => WinCandidate | null> = {
  loftInsulation: (v) => {
    if (v === 'minimal')
      return {
        title: 'Top up loft insulation to 270mm',
        sub: 'Up to 25% of heat escapes through the roof',
        savingPerYear: 320,
        points: 5,
      }
    if (v === 'partial')
      return {
        title: 'Increase loft insulation to 270mm+',
        sub: 'Completing to full depth saves up to £200/yr',
        savingPerYear: 200,
        points: 3,
      }
    return null
  },
  wallType: (v) => {
    if (v === 'solid_unins')
      return {
        title: 'Solid wall insulation',
        sub: 'The biggest source of heat loss in older homes',
        savingPerYear: 280,
        points: 6,
      }
    if (v === 'cavity_unins')
      return {
        title: 'Cavity wall insulation',
        sub: 'Cheap and quick — biggest bang for buck',
        savingPerYear: 220,
        points: 5,
      }
    return null
  },
  windows: (v) => {
    if (v === 'single')
      return {
        title: 'Upgrade to double glazing',
        sub: 'Single glazing causes significant heat loss',
        savingPerYear: 180,
        points: 7,
      }
    if (v === 'mix')
      return {
        title: 'Replace remaining single-glazed windows',
        sub: 'Completing to full double glazing saves heating costs',
        savingPerYear: 100,
        points: 4,
      }
    return null
  },
  heatingType: (v) => {
    if (v === 'old_gas')
      return {
        title: 'Replace old gas boiler',
        sub: 'Older boilers run at ~60% efficiency vs 94% modern',
        savingPerYear: 210,
        points: 8,
      }
    if (v === 'oil')
      return {
        title: 'Switch from oil to gas or heat pump',
        sub: 'Oil has a higher carbon intensity and running cost',
        savingPerYear: 350,
        points: 9,
      }
    return null
  },
  lastServiced: (v) => {
    if (v === 'never' || v === 'old')
      return {
        title: 'Book a boiler service',
        sub: 'An unserviced boiler can waste 15%+ of energy',
        savingPerYear: 90,
        points: 4,
      }
    return null
  },
  renewables: (v) => {
    if (v === 'none')
      return {
        title: 'Install solar PV panels',
        sub: 'Generates ~3,500 kWh/yr and earns export payments',
        savingPerYear: 450,
        points: 7,
      }
    return null
  },
  controls: (v) => {
    if (v === 'none' || v === 'basic')
      return {
        title: 'Fit a smart thermostat',
        sub: 'Smart controls save ~£130/yr on average',
        savingPerYear: 130,
        points: 4,
      }
    return null
  },
  lighting: (v) => {
    if (v === 'halogen')
      return {
        title: 'Switch all bulbs to LED',
        sub: 'LEDs use 90% less energy — quick payback',
        savingPerYear: 70,
        points: 3,
      }
    return null
  },
  floorInsulation: (v) => {
    if (v === 'floor_unins')
      return {
        title: 'Insulate suspended ground floor',
        sub: 'Up to 15% of heat lost through the floor',
        savingPerYear: 120,
        points: 3,
      }
    return null
  },
}

export function getTopWins(answers: Partial<Answers>): TopWin[] {
  const wins: WinCandidate[] = []
  for (const [qId, fn] of Object.entries(WIN_MAP)) {
    const val = answers[qId]
    if (!val) continue
    const w = fn(val)
    if (w) wins.push(w)
  }
  wins.sort((a, b) => b.savingPerYear - a.savingPerYear)
  return wins.slice(0, 3)
}

// ─────────────────────────────────────────────────────────────────────────────
// Opportunities (risk flags as "spotted" items)
// ─────────────────────────────────────────────────────────────────────────────

export function getOpportunities(answers: Partial<Answers>): Opportunity[] {
  const opps: Opportunity[] = []
  if (answers.windows === 'single')
    opps.push({
      icon: '🪟',
      title: 'Single glazed windows',
      sub: 'Replacing would lift your score and cut winter bills.',
    })
  if (answers.loftInsulation === 'minimal')
    opps.push({
      icon: '🏠',
      title: 'Poor loft insulation',
      sub: 'One of the most cost-effective fixes available.',
    })
  if (answers.lastServiced === 'never')
    opps.push({
      icon: '🔥',
      title: 'Boiler never serviced',
      sub: 'A service certificate can instantly verify efficiency.',
    })
  if (answers.heatingType === 'old_gas')
    opps.push({
      icon: '⚙️',
      title: 'Ageing gas boiler (> 20 yrs)',
      sub: 'Running at reduced efficiency — consider replacement.',
    })
  if (answers.wallType === 'solid_unins')
    opps.push({
      icon: '🧱',
      title: 'Uninsulated solid walls',
      sub: 'Major heat loss — insulation would significantly cut bills.',
    })
  if (answers.controls === 'none')
    opps.push({
      icon: '🌡️',
      title: 'No heating controls',
      sub: 'A thermostat is a low-cost, high-impact upgrade.',
    })
  if (answers.pipes === 'old')
    opps.push({
      icon: '🚰',
      title: 'Old lead / galvanised pipes',
      sub: 'Health concern and mortgage risk — survey recommended.',
    })
  return opps.slice(0, 4)
}
