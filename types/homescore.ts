export type Pillar = 'heating' | 'structure' | 'efficiency' | 'electrics' | 'plumbing'

export interface QuestionOption {
  label: string
  value: string
  delta: number
  carbonDelta: number
  category: Pillar
  narr?: string
}

export interface Question {
  id: string
  cat: string
  title: string
  options: QuestionOption[]
}

export type Answers = Record<string, string>

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
  confidenceScore: number
  carbonKg: number
}

export interface TopWin {
  title: string
  sub: string
  savingPerYear: number
  points: number
}

export interface Opportunity {
  icon: string
  title: string
  sub: string
}
