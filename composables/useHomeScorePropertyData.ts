// Property fetch + EPC self-heal, shared by every HomeScore-flow page.
//
// Three pages (homescore/[id].vue, homescore/pathway/[id].vue,
// homescore/costs/[id].vue) each independently re-implemented the same
// sequence: fetch the property, and if `epcRecommendations` came back empty
// (a previous enrichment pass partially failed), hit `/epc-refresh` to
// unconditionally re-pull the certificate from the EPC Register before
// rendering anything that depends on recommendations.
export function useHomeScorePropertyData() {
  const config = useRuntimeConfig()
  const property = ref<any>(null)
  const propertyLoading = ref(false)

  async function loadProperty(propertyId: string): Promise<any | null> {
    propertyLoading.value = true
    try {
      const res = await fetch(`${config.public.apiBase}/property/${propertyId}`)
      if (!res.ok) return null
      property.value = await res.json()

      const recs = (property.value as any)?.epcRecommendations
      if (!Array.isArray(recs) || recs.length === 0) {
        try {
          const refreshRes = await fetch(
            `${config.public.apiBase}/property/${propertyId}/epc-refresh`,
            { method: 'POST' },
          )
          if (refreshRes.ok) {
            const refreshed = await refreshRes.json()
            const newRecs = (refreshed as any)?.epcRecommendations ?? []
            if (Array.isArray(newRecs) && newRecs.length > 0) {
              property.value = refreshed
            }
          }
        } catch {
          /* self-heal is best-effort — keep the un-refreshed property */
        }
      }
      return property.value
    } catch {
      return null
    } finally {
      propertyLoading.value = false
    }
  }

  // EPC fields can live either on the top-level Property row OR on the
  // nested `epcCert` sub-object (legacy + new shape) — read both so we
  // don't lose data when only one side is populated.
  function epcField(name: string): any {
    const p: any = property.value
    if (!p) return null
    const top = p[name]
    if (top != null && top !== '') return top
    const cert = p.epcCert
    if (cert && cert[name] != null && cert[name] !== '') return cert[name]
    return null
  }

  const resolvedAnnualCost = computed<number>(() => {
    const summed =
      Number(epcField('energyCostCurrent') ?? 0) ||
      (Number(epcField('heatingCostCurrent') ?? 0) +
        Number(epcField('hotWaterCostCurrent') ?? 0) +
        Number(epcField('lightingCostCurrent') ?? 0))
    if (summed > 0) return Math.round(summed)
    const map: Record<string, number> = {
      A: 980, B: 1100, C: 1300, D: 1592, E: 1823, F: 2200, G: 2600,
    }
    const r = (property.value?.epcRating || '').toUpperCase()
    if (map[r]) return map[r]
    return 1592
  })

  return { property, propertyLoading, loadProperty, epcField, resolvedAnnualCost }
}
