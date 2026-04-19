/**
 * useFixturesFittingsPdf
 * Generates a print-ready HTML TA10 Fittings & Contents Form,
 * pre-filled from the fixturesAndFittings section of passport data.
 */
export function useFixturesFittingsPdf() {

  function esc(v: any): string {
    if (v == null) return ''
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function tryParseJson(val: any): any {
    if (typeof val !== 'string') return val
    const t = val.trim()
    if (t.startsWith('{') || t.startsWith('[')) { try { return JSON.parse(t) } catch {} }
    return val
  }

  function extractAnswer(answer: any): string {
    if (!answer) return ''
    if (answer.answerText) return answer.answerText
    const json = tryParseJson(answer.answerJson)
    if (!json) return ''
    if (typeof json === 'string') return json
    if (typeof json === 'object' && !Array.isArray(json)) {
      return json.mainAnswer || json.radioAnswer || json.text || ''
    }
    return ''
  }

  function getStatus(val: string): 'included' | 'excluded' | 'negotiation' | 'none' | '' {
    const v = (val || '').toLowerCase()
    if (v.includes('includ') || v === 'yes') return 'included'
    if (v.includes('exclud') || v === 'no') return 'excluded'
    if (v.includes('negot') || v.includes('offer')) return 'negotiation'
    if (v.includes('none') || v.includes('n/a') || v.includes('not at')) return 'none'
    return ''
  }

  function statusCells(val: string, note = ''): string {
    const s = getStatus(val)
    const cell = (_label: string, key: typeof s) =>
      `<td style="text-align:center">${s === key ? '<span class="tick">&#10003;</span>' : ''}</td>`
    return `
      ${cell('Included', 'included')}
      ${cell('Excluded', 'excluded')}
      ${cell('Negotiation', 'negotiation')}
      ${cell('None', 'none')}
      <td>${esc(note)}</td>`
  }

  function itemRow(label: string, val: string, note = ''): string {
    return `<tr><td class="item-label">${esc(label)}</td>${statusCells(val, note)}</tr>`
  }

  function sectionHeader(title: string): string {
    return `<tr class="section-header"><td colspan="6"><strong>${esc(title)}</strong></td></tr>`
  }

  function tableHeader(): string {
    return `<tr class="col-header">
      <th style="width:32%">Item</th>
      <th style="width:11%">Included</th>
      <th style="width:11%">Excluded</th>
      <th style="width:13%">Negotiation</th>
      <th style="width:10%">None</th>
      <th>Notes</th>
    </tr>`
  }

  // Pull all questions from fixturesAndFittings, build a map of item title → answer
  function buildFixturesMap(sections: any[]): Map<string, { answer: string; note: string }> {
    const map = new Map<string, { answer: string; note: string }>()
    const sec = sections.find((s: any) => s.key === 'fixturesAndFittings')
    if (!sec) return map

    for (const task of sec.tasks ?? []) {
      for (const q of task.questions ?? []) {
        const parts: any[] = q.parts ?? []
        const json = tryParseJson(q.answer?.answerJson)

        if (parts.length && typeof json === 'object' && json !== null) {
          // MULTIPART: each RADIO part is one item. Index by its title.
          const comment = typeof json['photos'] === 'string' ? json['photos'] : ''
          for (const part of parts) {
            if (
              part.type === 'RADIO' &&
              part.partKey &&
              part.title?.trim()
            ) {
              const rawVal = String(json[part.partKey] ?? '').trim()
              if (rawVal) {
                map.set(part.title.trim().toLowerCase(), { answer: rawVal, note: comment })
              }
            }
          }
        }

        // Also index by top-level question title for simple (non-MULTIPART) questions
        const title = (q.question || '').trim()
        if (title && q.answer) {
          const raw = extractAnswer(q.answer)
          const parsed = tryParseJson(q.answer?.answerJson)
          const note = (typeof parsed === 'object' && parsed?.note) || ''
          map.set(title.toLowerCase(), { answer: raw, note })
        }
      }
    }
    return map
  }

  function get(map: Map<string, any>, ...keywords: string[]): { answer: string; note: string } {
    for (const [key, val] of map) {
      if (keywords.every(kw => key.includes(kw.toLowerCase()))) return val
    }
    return { answer: '', note: '' }
  }

  function css(): string {
    return `
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; color: #000; margin: 0; }
      .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 16mm 18mm; }
      @media print { .page { padding: 12mm 14mm 16mm; } }
      h1 { font-size: 13pt; font-weight: 700; margin: 0 0 3px; }
      h2 { font-size: 10.5pt; font-weight: 700; background: #2c5282; color: #fff; padding: 5px 8px; margin: 16px 0 6px; }
      .subtitle { font-size: 8.5pt; color: #555; margin-bottom: 12px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9pt; }
      td, th { border: 1px solid #ccc; padding: 3px 6px; vertical-align: middle; }
      th { background: #dce6f0; font-weight: 700; font-size: 8.5pt; text-align: left; }
      .item-label { background: #f9f9f9; }
      .col-header th { background: #2c5282; color: #fff; font-size: 8.5pt; }
      .section-header td { background: #e8f0fa; font-size: 9pt; padding: 4px 6px; }
      .tick { color: #1a3a5c; font-weight: 700; font-size: 11pt; }
      .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2c5282; padding-bottom: 8px; margin-bottom: 12px; }
      .info-table td { border: 1px solid #ccc; padding: 4px 8px; }
      .info-label { font-weight: 600; background: #f5f5f5; width: 36%; }
      .blank { display: inline-block; border-bottom: 1px solid #555; min-width: 180px; }
      .footer { font-size: 7.5pt; color: #777; border-top: 1px solid #ccc; margin-top: 16px; padding-top: 5px; display: flex; justify-content: space-between; }
      .note-box { background: #fffde7; border: 1px solid #f5c842; padding: 6px 10px; font-size: 8.5pt; margin: 8px 0; border-radius: 3px; }
    `
  }

  function generateFixturesFittings(data: any): void {
    const sections: any[] = data?.sections ?? []
    const prop = data?.property ?? {}
    const passport = data?.passport ?? {}
    const map = buildFixturesMap(sections)

    const g = (...kw: string[]) => get(map, ...kw)

    const address = prop.addressLine1 || passport.addressLine1 || ''
    const postcode = prop.postcode || passport.postcode || ''
    const sellerName = passport.ownerName || ''

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>TA10 Fittings and Contents Form</title>
<style>${css()}</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header-bar">
    <div>
      <h1>TA10 Fittings and Contents Form</h1>
      <div class="subtitle">Law Society &mdash; Pre-filled from Property Passport &mdash; For discussion between parties</div>
    </div>
    <div style="font-size:8pt;color:#666">www.lawsociety.org.uk</div>
  </div>

  <!-- Property info -->
  <table class="info-table" style="margin-bottom:14px">
    <tr>
      <td class="info-label">Property address</td>
      <td>${esc(address)}</td>
      <td class="info-label">Postcode</td>
      <td>${esc(postcode)}</td>
    </tr>
    <tr>
      <td class="info-label">Seller name(s)</td>
      <td colspan="3">${sellerName ? `<span class="filled">${esc(sellerName)}</span>` : '<span class="blank"></span>'}</td>
    </tr>
    <tr>
      <td class="info-label">Date</td>
      <td>${esc(new Date().toLocaleDateString('en-GB'))}</td>
      <td class="info-label">Solicitor reference</td>
      <td><span class="blank"></span></td>
    </tr>
  </table>

  <div class="note-box">
    <strong>How to read this form:</strong> Each item is marked as <strong>Included</strong> (passes with the sale),
    <strong>Excluded</strong> (seller is taking it), <strong>Negotiation</strong> (available by separate negotiation),
    or <strong>None</strong> (not at the property). Items with no tick are pre-filled from the Property Passport where data was available.
  </div>

  <!-- Kitchen -->
  <h2>1. Kitchen</h2>
  <table>
    ${tableHeader()}
    ${sectionHeader('Built-in appliances')}
    ${itemRow('Fitted/integrated oven', g('oven').answer)}
    ${itemRow('Fitted/integrated hob', g('hob').answer)}
    ${itemRow('Extractor hood/fan', g('extractor').answer)}
    ${itemRow('Integrated dishwasher', g('dishwasher').answer)}
    ${itemRow('Integrated fridge', g('fridge').answer)}
    ${itemRow('Integrated freezer', g('freezer').answer)}
    ${itemRow('Integrated washing machine', g('washing').answer || g('washing machine').answer)}
    ${itemRow('Integrated tumble dryer', g('tumble dryer').answer || g('dryer').answer)}
    ${sectionHeader('Freestanding appliances')}
    ${itemRow('Freestanding fridge/freezer', g('freestanding').answer)}
    ${itemRow('Microwave', g('microwave').answer)}
    ${sectionHeader('Fixtures')}
    ${itemRow('Kitchen units (fitted)', g('kitchen unit').answer || g('kitchen').answer)}
    ${itemRow('Worktops', g('worktop').answer)}
    ${itemRow('Sink and taps', g('sink').answer)}
  </table>

  <!-- Bathrooms -->
  <h2>2. Bathrooms</h2>
  <table>
    ${tableHeader()}
    ${itemRow('Bath(s)', g('bath').answer)}
    ${itemRow('Shower unit(s)', g('shower').answer)}
    ${itemRow('Shower screen(s)', g('shower screen').answer)}
    ${itemRow('Toilet(s)', g('toilet').answer || g('wc').answer)}
    ${itemRow('Basin(s)/sink(s)', g('basin').answer)}
    ${itemRow('Bathroom cabinet(s)', g('bathroom cabinet').answer || g('cabinet').answer)}
    ${itemRow('Heated towel rail(s)', g('towel rail').answer || g('towel').answer)}
    ${itemRow('Mirror(s)', g('mirror').answer)}
  </table>

  <!-- Heating & Hot Water -->
  <h2>3. Heating and Hot Water</h2>
  <table>
    ${tableHeader()}
    ${itemRow('Boiler / Immersion Heater', g('boiler').answer || g('immersion').answer)}
    ${itemRow('Radiators / Wall Heaters', g('radiator').answer || g('wall heater').answer)}
    ${itemRow('Night-Storage Heaters', g('night-storage').answer || g('storage heater').answer)}
    ${itemRow('Free-Standing Heaters', g('free-standing').answer || g('standing heater').answer)}
    ${itemRow('Underfloor heating', g('underfloor').answer)}
    ${itemRow('Solar thermal panels', g('solar thermal').answer)}
    ${itemRow('Thermostats / smart controls', g('thermostat').answer)}
  </table>

  <!-- Fireplaces & Flues -->
  <h2>4. Fireplaces and Flues</h2>
  <table>
    ${tableHeader()}
    ${itemRow('Gas fire(s) with surround', g('gasfire').answer || g('gas fire').answer || g('gas fires').answer)}
    ${itemRow('Electric fire(s) with surround', g('electric fire').answer || g('electric fires').answer)}
    ${itemRow('Wood-burning / multi-fuel stove', g('stove').answer || g('wood burning').answer)}
    ${itemRow('Open fireplace', g('open fireplace').answer || g('fireplace').answer)}
  </table>

  <!-- Fitted carpets & flooring -->
  <h2>5. Fitted Carpets and Flooring</h2>
  <table>
    ${tableHeader()}
    ${itemRow('Fitted carpets', g('carpet').answer)}
    ${itemRow('Fitted flooring / laminate', g('laminate').answer || g('vinyl').answer || g('floor').answer)}
  </table>

  <!-- Window fittings -->
  <h2>6. Window Fittings</h2>
  <table>
    ${tableHeader()}
    ${itemRow('Curtains', g('curtain').answer)}
    ${itemRow('Curtain rails / poles', g('curtain rail').answer || g('curtain pole').answer)}
    ${itemRow('Blinds', g('blind').answer)}
    ${itemRow('Shutters', g('shutter').answer)}
    ${itemRow('Window Fittings (other)', g('window fitting').answer)}
  </table>

  <!-- Light fittings -->
  <h2>7. Light Fittings</h2>
  <table>
    ${tableHeader()}
    ${itemRow('Light fittings / ceiling roses', g('light fitting').answer || g('ceiling').answer)}
    ${itemRow('Light switches', g('light switch').answer || g('switch').answer)}
    ${itemRow('Wall lights', g('wall light').answer)}
  </table>

  <!-- Fitted furniture -->
  <h2>8. Fitted Furniture</h2>
  <table>
    ${tableHeader()}
    ${itemRow('Fitted wardrobes', g('wardrobe').answer)}
    ${itemRow('Fitted shelving / bookcase', g('shelving').answer || g('bookcase').answer)}
    ${itemRow('Other fitted furniture', g('fitted furniture').answer || g('other basic fittings').answer)}
  </table>

  <!-- TV/Aerial/Other -->
  <h2>9. TV, Aerial, Satellite and Other</h2>
  <table>
    ${tableHeader()}
    ${itemRow('TV aerial(s)', g('aerial').answer || g('tv aerial').answer)}
    ${itemRow('Satellite dish', g('satellite').answer)}
    ${itemRow('Broadband router / equipment', g('broadband').answer)}
    ${itemRow('Doorbell / video doorbell', g('doorbell').answer)}
    ${itemRow('Security alarm system', g('alarm').answer || g('security').answer)}
    ${itemRow('CCTV system', g('cctv').answer)}
    ${itemRow('Garden shed(s)', g('shed').answer)}
    ${itemRow('Greenhouse', g('greenhouse').answer)}
    ${itemRow('Garden / outdoor furniture', g('garden furniture').answer || g('outdoor').answer)}
    ${itemRow('Solar panels (PV)', g('solar panel').answer || g('solar pv').answer)}
    ${itemRow('EV charging point', g('ev').answer || g('charging point').answer)}
    ${itemRow('Swimming pool / hot tub', g('swimming pool').answer || g('hot tub').answer)}
  </table>

  <!-- Seller signature -->
  <h2>10. Seller confirmation</h2>
  <table>
    <tr>
      <td style="width:38%;font-weight:600;background:#f5f5f5">Seller signature(s)</td>
      <td><span class="blank" style="min-width:280px"></span></td>
    </tr>
    <tr>
      <td style="font-weight:600;background:#f5f5f5">Date</td>
      <td><span class="blank" style="min-width:140px"></span></td>
    </tr>
  </table>

  <div class="footer">
    <span>TA10 Pre-filled from Property Passport &mdash; ${esc(new Date().toLocaleDateString('en-GB'))}</span>
    <span>For solicitor review. Not a substitute for professional legal advice.</span>
  </div>

</div>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      setTimeout(() => win.print(), 600)
    }
  }

  return { generateFixturesFittings }
}
