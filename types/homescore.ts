export type Pillar = 'heating' | 'structure' | 'efficiency' | 'electrics' | 'plumbing'
export type Severity = 'low' | 'medium' | 'high'

export interface QuestionOption {
  label: string
  value: string
  points: number
}

export interface Question {
  id: string
  pillar: Pillar
  category: string
  question: string
  hint?: string
  options: QuestionOption[]
}

export interface Answers {
  heatingType: string
  lastServiced: string
  roofCondition: string
  wallType: string
  windows: string
  loftInsulation: string
  renewables: string
  consumerUnit: string
  smartFeatures: string
  pipes: string
  waterPressure: string
  [key: string]: string
}

export interface RiskFlag {
  title: string
  detail: string
  severity: Severity
}

export interface Action {
  text: string
  points: number
}

export interface Rule {
  id: string
  condition: (answers: Answers) => boolean
  flag: RiskFlag
  action: Action
  priority: number
}

export interface PillarBreakdown {
  heating: number
  structure: number
  efficiency: number
  electrics: number
  plumbing: number
}

export interface ScoreResult {
  total: number
  rating: string
  ratingColor: string
  breakdown: PillarBreakdown
  flags: RiskFlag[]
  actions: Action[]
  confidenceScore: number
}
