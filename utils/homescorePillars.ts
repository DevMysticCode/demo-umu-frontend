// Shared "5 pillar" HomeScore breakdown maths — used by both the score
// result screen (V6ScoreView) and the quiz level-up screen (V6LevelUpView)
// so the "before" values shown after a quiz always agree with the ones
// shown on the result screen the user just came from.

export type PillarId = 'heating' | 'structure' | 'efficiency' | 'electrics' | 'plumbing'
export type PillarTone = 'high' | 'mid' | 'low'

export interface PillarBase {
  id: PillarId
  icon: string
  label: string
  value: number
  max: number
  pct: number
  tone: PillarTone
}

// Convert an EPC efficiency string ("Very Good" / "Good" / "Average" /
// "Poor" / "Very Poor" / "N/A") to a 0–1 normalised score.
export function effToScore(eff: string | null | undefined): number {
  const e = (eff || '').toLowerCase().trim()
  if (!e || e === 'n/a' || e === 'na') return 0.5
  if (e === 'very good') return 1.0
  if (e === 'good') return 0.8
  if (e === 'average') return 0.6
  if (e === 'poor') return 0.4
  if (e === 'very poor') return 0.2
  return 0.5
}

export function effRating(eff: string | null | undefined): 'Good' | 'Average' | 'Poor' | 'N/A' {
  const e = (eff || '').toLowerCase().trim()
  if (!e || e === 'n/a' || e === 'na') return 'N/A'
  if (e.includes('very good') || e === 'good') return 'Good'
  if (e === 'average') return 'Average'
  if (e.includes('poor')) return 'Poor'
  return 'N/A'
}

export function effTone(eff: string | null | undefined): PillarTone {
  const s = effToScore(eff)
  if (s >= 0.7) return 'high'
  if (s >= 0.5) return 'mid'
  return 'low'
}

// Pull EPC fields from BOTH the top-level Property row and the nested
// `epcCert` sub-object (the backend exposes both shapes). Prefers the
// top-level value if present, otherwise the cert's value.
function epcProxy(property: any): any {
  const p = property || {}
  const cert = p.epcCert || {}
  return new Proxy({}, {
    get(_t, key: string) {
      const top = p[key]
      if (top != null && top !== '') return top
      return cert[key]
    },
  })
}

/** The 5-pillar "before" breakdown (icon/label/value/max/pct/tone only —
 *  no per-row expand content, callers that need the richer expand data
 *  layer it on top of this using the same `id`). */
export function computeHomeScorePillars(property: any): PillarBase[] {
  const e = epcProxy(property)

  const heatEff = e.mainheatEnergyEff
  const heatcEff = e.mainheatcEnergyEff
  const heatScore = (effToScore(heatEff) + effToScore(heatcEff)) / 2

  const structScore =
    (effToScore(e.wallsEnergyEff) +
      effToScore(e.roofEnergyEff) +
      effToScore(e.floorEnergyEff) +
      effToScore(e.windowsEnergyEff)) /
    4

  const ledPct = Number(e.lowEnergyLighting ?? 0)
  const effLightScore = effToScore(e.lightingEnergyEff)
  const effScore = effLightScore * 0.6 + (ledPct / 100) * 0.4

  const recs: any[] = property?.epcRecommendations ?? []
  const elecRecs = recs.filter((r) =>
    /(solar pv|photovoltaic|electric)/i.test(`${r?.title ?? ''} ${r?.improvementType ?? ''}`),
  )
  const elecScore = elecRecs.length > 0 ? 0.5 : 0.8

  const plumbScore = effToScore(e.hotWaterEnergyEff)

  return [
    {
      id: 'heating',
      icon: '/op-icons/homescore/house.png',
      label: 'Heating & insulation',
      value: Math.round(heatScore * 20),
      max: 20,
      pct: Math.round(heatScore * 100),
      tone: effTone(heatEff),
    },
    {
      id: 'structure',
      icon: '/op-icons/homescore/bricks.png',
      label: 'Building fabric',
      value: Math.round(structScore * 25),
      max: 25,
      pct: Math.round(structScore * 100),
      tone: structScore >= 0.7 ? 'high' : structScore >= 0.5 ? 'mid' : 'low',
    },
    {
      id: 'efficiency',
      icon: '/op-icons/homescore/lightbulb.png',
      label: 'Energy efficiency',
      value: Math.round(effScore * 15),
      max: 15,
      pct: Math.round(effScore * 100),
      tone: effScore >= 0.7 ? 'high' : effScore >= 0.5 ? 'mid' : 'low',
    },
    {
      id: 'electrics',
      icon: '/op-icons/homescore/lightning.png',
      label: 'Electrical systems',
      value: Math.round(elecScore * 20),
      max: 20,
      pct: Math.round(elecScore * 100),
      tone: elecScore >= 0.7 ? 'high' : elecScore >= 0.5 ? 'mid' : 'low',
    },
    {
      id: 'plumbing',
      icon: '/op-icons/homescore/tap.png',
      label: 'Water & plumbing',
      value: Math.round(plumbScore * 20),
      max: 20,
      pct: Math.round(plumbScore * 100),
      tone: effTone(e.hotWaterEnergyEff),
    },
  ]
}
