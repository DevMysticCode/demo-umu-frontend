import type { Answers, PillarBreakdown, ScoreResult, Question } from '~/types/homescore'

export const QUESTIONS: Question[] = [
  {
    id: 'heatingType',
    pillar: 'heating',
    category: 'Heating',
    question: 'What type of heating system does the property have?',
    options: [
      { label: 'Heat Pump', value: 'heat_pump', points: 15 },
      { label: 'Modern Gas Boiler (< 10 yrs)', value: 'modern_gas', points: 12 },
      { label: 'Gas Boiler (10–20 yrs)', value: 'mid_gas', points: 8 },
      { label: 'Old Gas Boiler (> 20 yrs)', value: 'old_gas', points: 4 },
      { label: 'Electric Heating', value: 'electric', points: 6 },
      { label: 'No Central Heating', value: 'none', points: 0 },
      { label: 'Not Sure', value: 'unsure', points: 6 },
    ],
  },
  {
    id: 'lastServiced',
    pillar: 'heating',
    category: 'Heating',
    question: 'When was the boiler or heating last serviced?',
    options: [
      { label: 'Within the last year', value: 'recent', points: 5 },
      { label: '1–3 years ago', value: 'moderate', points: 3 },
      { label: 'Over 3 years ago', value: 'old', points: 1 },
      { label: 'Never / Not Sure', value: 'never', points: 0 },
    ],
  },
  {
    id: 'roofCondition',
    pillar: 'structure',
    category: 'Structure',
    question: 'What is the condition of the roof?',
    options: [
      { label: 'Good (less than 10 years old)', value: 'good', points: 8 },
      { label: 'Ageing (10–30 years)', value: 'ageing', points: 5 },
      { label: 'Poor / Needs repair', value: 'poor', points: 2 },
      { label: 'Not Sure', value: 'unsure', points: 5 },
    ],
  },
  {
    id: 'wallType',
    pillar: 'structure',
    category: 'Structure',
    question: 'What type are the external walls?',
    options: [
      { label: 'Cavity wall (insulated)', value: 'cavity_insulated', points: 10 },
      { label: 'Solid wall (insulated)', value: 'solid_insulated', points: 8 },
      { label: 'Cavity wall (uninsulated)', value: 'cavity_uninsulated', points: 5 },
      { label: 'Solid wall (uninsulated)', value: 'solid_uninsulated', points: 3 },
      { label: 'Not Sure', value: 'unsure', points: 6 },
    ],
  },
  {
    id: 'windows',
    pillar: 'structure',
    category: 'Structure',
    question: 'What type of glazing do the windows have?',
    options: [
      { label: 'Double glazed (less than 10 yrs)', value: 'new_double', points: 7 },
      { label: 'Double glazed (over 10 yrs)', value: 'old_double', points: 5 },
      { label: 'Triple glazed', value: 'triple', points: 7 },
      { label: 'Single glazed', value: 'single', points: 2 },
      { label: 'Not Sure', value: 'unsure', points: 4 },
    ],
  },
  {
    id: 'loftInsulation',
    pillar: 'efficiency',
    category: 'Efficiency',
    question: 'How well insulated is the loft?',
    options: [
      { label: 'Well insulated (270mm+)', value: 'well', points: 12 },
      { label: 'Some insulation (100–270mm)', value: 'some', points: 8 },
      { label: 'Minimal (less than 100mm)', value: 'minimal', points: 3 },
      { label: 'No loft / top floor flat', value: 'no_loft', points: 8 },
      { label: 'Not Sure', value: 'unsure', points: 6 },
    ],
  },
  {
    id: 'renewables',
    pillar: 'efficiency',
    category: 'Efficiency',
    question: 'What green or renewable features are installed?',
    options: [
      { label: 'Solar panels', value: 'solar', points: 8 },
      { label: 'Heat pump (as renewable)', value: 'heat_pump', points: 6 },
      { label: 'Both solar + heat pump', value: 'both', points: 8 },
      { label: 'None', value: 'none', points: 0 },
      { label: 'Not Sure', value: 'unsure', points: 3 },
    ],
  },
  {
    id: 'consumerUnit',
    pillar: 'electrics',
    category: 'Electrics',
    question: 'How old is the consumer unit (fuse box)?',
    options: [
      { label: 'Modern RCBO board (less than 10 yrs)', value: 'modern', points: 14 },
      { label: 'Standard modern (10–20 yrs)', value: 'standard', points: 10 },
      { label: 'Old fusebox (over 20 yrs)', value: 'old', points: 5 },
      { label: 'Very old / needs rewire', value: 'very_old', points: 2 },
      { label: 'Not Sure', value: 'unsure', points: 8 },
    ],
  },
  {
    id: 'smartFeatures',
    pillar: 'electrics',
    category: 'Electrics',
    question: 'What smart or modern electrical features are installed?',
    options: [
      { label: 'Smart meter + EV charger', value: 'both', points: 6 },
      { label: 'Smart meter only', value: 'smart_meter', points: 4 },
      { label: 'EV charger only', value: 'ev_charger', points: 3 },
      { label: 'None', value: 'none', points: 0 },
      { label: 'Not Sure', value: 'unsure', points: 2 },
    ],
  },
  {
    id: 'pipes',
    pillar: 'plumbing',
    category: 'Plumbing',
    question: 'What is the condition of the water pipes?',
    options: [
      { label: 'Modern copper or plastic', value: 'modern', points: 10 },
      { label: 'Older but serviceable', value: 'serviceable', points: 7 },
      { label: 'Old (lead or galvanised)', value: 'old', points: 2 },
      { label: 'Not Sure', value: 'unsure', points: 6 },
    ],
  },
  {
    id: 'waterPressure',
    pillar: 'plumbing',
    category: 'Plumbing',
    question: 'How would you rate the water pressure?',
    options: [
      { label: 'Excellent', value: 'excellent', points: 5 },
      { label: 'Good', value: 'good', points: 4 },
      { label: 'Low', value: 'low', points: 2 },
      { label: 'Very low or problematic', value: 'very_low', points: 0 },
      { label: 'Not Sure', value: 'unsure', points: 3 },
    ],
  },
]

const PILLAR_MAX: PillarBreakdown = {
  heating: 20,
  structure: 25,
  efficiency: 20,
  electrics: 20,
  plumbing: 15,
}

function getRating(total: number): { rating: string; ratingColor: string } {
  if (total >= 85) return { rating: 'Excellent', ratingColor: '#00c896' }
  if (total >= 70) return { rating: 'Good', ratingColor: '#00a19a' }
  if (total >= 50) return { rating: 'Needs Attention', ratingColor: '#f59e0b' }
  return { rating: 'Significant Issues', ratingColor: '#ef4444' }
}

/**
 * Returns a map of question_id → the "unsure/unknown" option value for each question.
 * Used to generate a baseline score when no user answers or EPC data are available.
 */
export function getUnsureDefaults(): Partial<Answers> {
  const defaults: Partial<Answers> = {}
  for (const q of QUESTIONS) {
    const unsureOpt = q.options.find(o => o.value === 'unsure') ?? q.options.find(o => o.value === 'never')
    if (unsureOpt) defaults[q.id] = unsureOpt.value
  }
  return defaults
}

export function calculateScore(answers: Partial<Answers>): Omit<ScoreResult, 'flags' | 'actions'> {
  const raw: PillarBreakdown = { heating: 0, structure: 0, efficiency: 0, electrics: 0, plumbing: 0 }

  for (const q of QUESTIONS) {
    const value = answers[q.id]
    if (!value) continue
    const opt = q.options.find(o => o.value === value)
    if (opt) raw[q.pillar] = Math.min(raw[q.pillar] + opt.points, PILLAR_MAX[q.pillar])
  }

  const total = Math.min(
    raw.heating + raw.structure + raw.efficiency + raw.electrics + raw.plumbing,
    100
  )

  // Confidence: percentage of answered questions that are NOT 'unsure'
  const answered = QUESTIONS.filter(q => answers[q.id])
  const confident = answered.filter(q => answers[q.id] !== 'unsure')
  const confidenceScore = answered.length === 0 ? 0 : Math.round((confident.length / QUESTIONS.length) * 100)

  return { total, breakdown: raw, confidenceScore, ...getRating(total) }
}

export function getPrefillFromProperty(property: {
  epcRating?: string | null
  yearBuilt?: number | null
  heatingType?: string | null
}): Partial<Answers> {
  const prefill: Partial<Answers> = {}

  // Infer insulation quality from EPC rating
  if (property.epcRating) {
    const r = property.epcRating.toUpperCase()
    if (['A', 'B'].includes(r)) {
      prefill.loftInsulation = 'well'
      prefill.wallType = 'cavity_insulated'
    } else if (r === 'C') {
      prefill.loftInsulation = 'some'
      prefill.wallType = 'cavity_uninsulated'
    } else if (['D', 'E'].includes(r)) {
      prefill.loftInsulation = 'minimal'
      prefill.wallType = 'solid_uninsulated'
    } else {
      // F or G
      prefill.loftInsulation = 'minimal'
      prefill.wallType = 'solid_uninsulated'
    }
  }

  // Infer glazing + consumer unit age from year built
  if (property.yearBuilt) {
    const age = new Date().getFullYear() - property.yearBuilt
    if (age < 10) {
      prefill.windows = 'new_double'
      prefill.consumerUnit = 'modern'
    } else if (age < 20) {
      prefill.windows = 'old_double'
      prefill.consumerUnit = 'standard'
    } else if (age < 40) {
      prefill.windows = 'old_double'
      prefill.consumerUnit = 'old'
    } else {
      prefill.windows = 'single'
      prefill.consumerUnit = 'old'
    }
  }

  // Map EPC/DB heatingType string to scoring option
  if (property.heatingType) {
    const h = property.heatingType.toLowerCase()
    if (h.includes('heat pump') || h.includes('heatpump') || h.includes('ground source') || h.includes('air source')) {
      prefill.heatingType = 'heat_pump'
    } else if (h.includes('electric storage') || h.includes('electric panel') || h.includes('electric') && !h.includes('gas')) {
      prefill.heatingType = 'electric'
    } else if (h.includes('gas') || h.includes('boiler')) {
      // Try to determine age from yearBuilt if available
      if (property.yearBuilt) {
        const age = new Date().getFullYear() - property.yearBuilt
        if (age < 10) prefill.heatingType = 'modern_gas'
        else if (age < 20) prefill.heatingType = 'mid_gas'
        else prefill.heatingType = 'old_gas'
      } else {
        prefill.heatingType = 'mid_gas' // reasonable default
      }
    } else if (h.includes('none') || h.includes('no central')) {
      prefill.heatingType = 'none'
    }
  }

  return prefill
}
