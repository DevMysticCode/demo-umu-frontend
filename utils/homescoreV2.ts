/**
 * HomeScore V2 — EPC-data-driven scoring formula.
 * 6 weighted components derived from EPC certificate fields.
 * V1 question-based scoring (homescoreScoring.ts) remains for Tier 2 enhancement.
 */

export interface EpcV2Property {
  // Cost fields (Tier 1 primary inputs)
  heatingCostCurrent?: number | null
  hotWaterCostCurrent?: number | null
  lightingCostCurrent?: number | null
  floorAreaSqm?: number | null
  // EPC rating/score (fallback when cost fields absent)
  epcRating?: string | null
  epcScore?: number | null
  // Insulation
  wallsEnergyEff?: string | null
  roofEnergyEff?: string | null
  floorEnergyEff?: string | null
  windowsEnergyEff?: string | null
  multiGlazeProportion?: number | null
  glazedArea?: string | null
  // Heating + Hot Water
  mainheatEnergyEff?: string | null
  mainheatcEnergyEff?: string | null
  hotWaterEnergyEff?: string | null
  // Controls
  mainheatcontDescription?: string | null
  // Ventilation
  mechanicalVentilation?: string | null
  // Lighting
  lightingEnergyEff?: string | null
  lowEnergyLighting?: number | null
  // Renewables
  photoSupply?: number | null
  solarWaterHeatingFlag?: string | null
  windTurbineCount?: number | null
}

export interface V2ComponentScores {
  costEfficiency: number  // 0–100
  insulation: number      // 0–100
  heatingHW: number       // 0–100
  controls: number        // 0–100
  ventilation: number     // 0–100
  lighting: number        // 0–100
}

export interface V2ScoreResult {
  total: number              // 0–100 capped (includes renewable bonus)
  rawTotal: number           // 0–100 weighted average before bonus
  rating: string
  ratingColor: string
  tier: 'tier1'              // EPC-data-driven (Tier 2 = questions enhance V1 result)
  components: V2ComponentScores
  renewableBonus: number     // points added for solar/wind
  baseBill: number | null    // heating + HW + lighting (£/yr)
  costPerSqm: number | null  // baseBill / floorAreaSqm
  dataPoints: number         // how many EPC fields contributed
  hasV2Data: boolean         // true if cost fields present (full V2); false = EPC-rating fallback
}

// ── EPC efficiency label → 0–100 score ──────────────────────────────────────

function effLabelToScore(label: string | null | undefined): number | null {
  if (!label) return null
  const l = label.toLowerCase()
  if (l.includes('very good')) return 100
  if (l.includes('good')) return 75
  if (l.includes('average')) return 50
  if (l.includes('very poor')) return 0   // check 'very poor' before 'poor'
  if (l.includes('poor')) return 25
  return null
}

// Weighted average of scores, ignoring nulls
function weightedAvg(pairs: [number | null, number][]): number | null {
  let sumW = 0
  let sumWS = 0
  for (const [score, weight] of pairs) {
    if (score === null) continue
    sumWS += score * weight
    sumW += weight
  }
  return sumW === 0 ? null : sumWS / sumW
}

// ── Component scorers ────────────────────────────────────────────────────────

function scoreCostEfficiency(p: EpcV2Property): { score: number; used: boolean } {
  const h = p.heatingCostCurrent
  const hw = p.hotWaterCostCurrent
  const l = p.lightingCostCurrent
  const sqm = p.floorAreaSqm

  if (h != null && hw != null && l != null && sqm && sqm > 0) {
    const costPerSqm = (h + hw + l) / sqm
    // Benchmarks: A/B ≈ ≤7, C ≈ 7–12, D ≈ 12–18, E ≈ 18–24, F ≈ 24–32, G ≈ 32+
    if (costPerSqm <= 4)  return { score: 100, used: true }
    if (costPerSqm <= 7)  return { score: 88,  used: true }
    if (costPerSqm <= 10) return { score: 75,  used: true }
    if (costPerSqm <= 14) return { score: 60,  used: true }
    if (costPerSqm <= 18) return { score: 45,  used: true }
    if (costPerSqm <= 24) return { score: 28,  used: true }
    if (costPerSqm <= 32) return { score: 14,  used: true }
    return { score: Math.max(0, 14 - (costPerSqm - 32)), used: true }
  }

  // Fallback: use EPC score directly (0–100 from SAP)
  if (p.epcScore != null) return { score: p.epcScore, used: false }

  // Fallback: use EPC rating letter
  const ratingMap: Record<string, number> = { A: 95, B: 82, C: 72, D: 58, E: 44, F: 28, G: 12 }
  if (p.epcRating) return { score: ratingMap[p.epcRating.toUpperCase()] ?? 50, used: false }

  return { score: 50, used: false }
}

function scoreInsulation(p: EpcV2Property): number | null {
  const walls  = effLabelToScore(p.wallsEnergyEff)
  const roof   = effLabelToScore(p.roofEnergyEff)
  const floor  = effLabelToScore(p.floorEnergyEff)
  let windows  = effLabelToScore(p.windowsEnergyEff)

  // Adjust windows score by multi-glaze proportion if available
  if (windows !== null && p.multiGlazeProportion != null) {
    windows = Math.min(windows * (p.multiGlazeProportion / 100), 100)
  }

  return weightedAvg([
    [walls,   0.40],
    [roof,    0.35],
    [windows, 0.15],
    [floor,   0.10],
  ])
}

function scoreHeatingHW(p: EpcV2Property): number | null {
  const main   = effLabelToScore(p.mainheatEnergyEff)
  const ctrl   = effLabelToScore(p.mainheatcEnergyEff)
  const hw     = effLabelToScore(p.hotWaterEnergyEff)
  return weightedAvg([[main, 0.50], [ctrl, 0.30], [hw, 0.20]])
}

function scoreControls(p: EpcV2Property): number | null {
  const desc = (p.mainheatcontDescription ?? '').toLowerCase()
  if (!desc) return null
  if (desc.includes('programmer') && desc.includes('room thermostat') && desc.includes('trv')) return 100
  if (desc.includes('programmer') && desc.includes('room thermostat')) return 85
  if (desc.includes('time clock') && desc.includes('room thermostat')) return 75
  if (desc.includes('programmer') || desc.includes('room thermostat')) return 60
  if (desc.includes('time clock') || desc.includes('trv')) return 45
  if (desc.includes('manual')) return 25
  if (desc.includes('no controls') || desc.includes('none')) return 0
  return 50  // unknown label → average
}

function scoreVentilation(p: EpcV2Property): number | null {
  const desc = (p.mechanicalVentilation ?? '').toLowerCase()
  if (!desc) return null
  if (desc.includes('heat recovery') || desc.includes('mvhr')) return 100
  if (desc.includes('mechanical') || desc.includes('extract')) return 70
  if (desc.includes('natural') || desc.includes('passive')) return 55
  return 50
}

function scoreLighting(p: EpcV2Property): number | null {
  const effScore = effLabelToScore(p.lightingEnergyEff)
  const pct = p.lowEnergyLighting  // 0–100 percentage

  if (effScore !== null && pct != null) {
    // Blend label score with actual low-energy percentage
    return effScore * 0.5 + pct * 0.5
  }
  if (pct != null) return pct
  return effScore
}

function renewableBonus(p: EpcV2Property): number {
  let bonus = 0
  if (p.photoSupply != null && p.photoSupply > 0) bonus += 8           // Solar PV
  if (p.solarWaterHeatingFlag === 'Y' || p.solarWaterHeatingFlag === 'true') bonus += 4   // Solar water
  const windCount = p.windTurbineCount ?? 0
  bonus += Math.min(windCount * 2, 4)                                    // Wind turbines, max +4
  return bonus
}

// ── Rating label ─────────────────────────────────────────────────────────────

function getRating(total: number): { rating: string; ratingColor: string } {
  if (total >= 85) return { rating: 'Excellent', ratingColor: '#00c896' }
  if (total >= 70) return { rating: 'Good', ratingColor: '#00a19a' }
  if (total >= 50) return { rating: 'Room to improve', ratingColor: '#f59e0b' }
  return { rating: 'Plenty of opportunities', ratingColor: '#ef4444' }
}

// ── Main V2 scorer ────────────────────────────────────────────────────────────

/**
 * Compute V2 HomeScore from EPC property data.
 * Component weights: cost 40%, insulation 25%, heating+HW 20%, controls 9%, ventilation 4%, lighting 2%.
 */
export function calculateV2Score(p: EpcV2Property): V2ScoreResult {
  const { score: costEff, used: hasCostData } = scoreCostEfficiency(p)
  const insulationScore = scoreInsulation(p)
  const heatHWScore     = scoreHeatingHW(p)
  const controlsScore   = scoreControls(p)
  const ventScore       = scoreVentilation(p)
  const lightScore      = scoreLighting(p)

  // Weighted sum — use 50 (average) as default for missing components
  const components: V2ComponentScores = {
    costEfficiency: Math.round(costEff),
    insulation:     Math.round(insulationScore ?? 50),
    heatingHW:      Math.round(heatHWScore ?? 50),
    controls:       Math.round(controlsScore ?? 50),
    ventilation:    Math.round(ventScore ?? 50),
    lighting:       Math.round(lightScore ?? 50),
  }

  const rawTotal =
    components.costEfficiency * 0.40 +
    components.insulation     * 0.25 +
    components.heatingHW      * 0.20 +
    components.controls       * 0.09 +
    components.ventilation    * 0.04 +
    components.lighting       * 0.02

  const bonus = renewableBonus(p)
  const total = Math.min(100, Math.round(rawTotal + bonus))

  // Count how many fields contributed real data
  const dataPoints = [
    hasCostData,
    insulationScore !== null,
    heatHWScore !== null,
    controlsScore !== null,
    ventScore !== null,
    lightScore !== null,
  ].filter(Boolean).length

  // Bill estimates
  const hasAllCosts = p.heatingCostCurrent != null && p.hotWaterCostCurrent != null && p.lightingCostCurrent != null
  const baseBill = hasAllCosts
    ? (p.heatingCostCurrent! + p.hotWaterCostCurrent! + p.lightingCostCurrent!)
    : null
  const costPerSqm = baseBill != null && p.floorAreaSqm && p.floorAreaSqm > 0
    ? Math.round((baseBill / p.floorAreaSqm) * 100) / 100
    : null

  return {
    total,
    rawTotal: Math.round(rawTotal),
    ...getRating(total),
    tier: 'tier1',
    components,
    renewableBonus: bonus,
    baseBill,
    costPerSqm,
    dataPoints,
    hasV2Data: hasCostData,
  }
}

/**
 * Returns true if the property has enough V2 EPC fields for a meaningful score.
 * At minimum, we need EPC rating or cost fields.
 */
export function hasV2EpcData(p: EpcV2Property): boolean {
  return !!(
    p.epcRating ||
    p.epcScore ||
    (p.heatingCostCurrent != null && p.hotWaterCostCurrent != null)
  )
}

/**
 * Compute bill difference vs neighbourhood median.
 * Negative = property is cheaper, positive = property costs more.
 */
export function computeBillDifference(
  baseBill: number | null,
  neighbourMedianCostPerSqm: number | null,
  floorAreaSqm: number | null | undefined,
): number | null {
  if (baseBill == null || neighbourMedianCostPerSqm == null || !floorAreaSqm) return null
  const medianBill = neighbourMedianCostPerSqm * floorAreaSqm
  return Math.round(baseBill - medianBill)
}
