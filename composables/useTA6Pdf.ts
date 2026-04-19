/**
 * useTA6Pdf
 * Generates a print-ready HTML representation of the TA6 Law Society
 * Property Information Form (6th edition, 2025), pre-filled from passport data.
 *
 * Fields that cannot be derived from the passport are rendered as blank lines
 * for manual completion before printing.
 */
export function useTA6Pdf() {

  // ─── Utilities ─────────────────────────────────────────────────────────────

  function esc(v: any): string {
    if (v == null) return ''
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  function blank(width = '180px'): string {
    return `<span class="blank" style="min-width:${width}"></span>`
  }

  function filled(v: any, fallback = ''): string {
    const s = v != null ? String(v).trim() : ''
    return s ? `<span class="filled">${esc(s)}</span>` : (fallback ? `<span class="filled">${esc(fallback)}</span>` : blank())
  }

  function checkbox(checked: boolean, label: string): string {
    return `<span class="cb-wrap"><span class="cb${checked ? ' cb--checked' : ''}">${checked ? '&#10003;' : ''}</span> ${esc(label)}</span>`
  }

  function yesNo(value: string | null | undefined): string {
    const v = (value || '').toLowerCase()
    const yes = v.includes('yes') || v.includes('includ') || v === 'true'
    const no = v.includes('no') || v.includes('exclud') || v === 'false'
    return checkbox(yes, 'Yes') + '&nbsp;&nbsp;' + checkbox(no, 'No') + '&nbsp;&nbsp;' + checkbox(!yes && !no, 'Not known')
  }

  // ─── Answer extractors ──────────────────────────────────────────────────────

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
      if (typeof json.mainAnswer === 'string') return json.mainAnswer
      if (typeof json.radioAnswer === 'string') return json.radioAnswer
    }
    return ''
  }

  // Find a question answer across all tasks in a section by matching title keywords
  function findAnswer(sections: any[], sectionKey: string, ...titleKeywords: string[]): string {
    const section = sections.find((s: any) => s.key === sectionKey)
    if (!section) return ''
    for (const task of section.tasks ?? []) {
      for (const q of task.questions ?? []) {
        const title = (q.question || '').toLowerCase()
        if (titleKeywords.every(kw => title.includes(kw.toLowerCase()))) {
          return extractAnswer(q.answer)
        }
      }
    }
    return ''
  }

  // Get all answers for a section as a flat labelled list
  function getSectionAnswers(sections: any[], sectionKey: string): Array<{ q: string; a: string }> {
    const section = sections.find((s: any) => s.key === sectionKey)
    if (!section) return []
    const out: Array<{ q: string; a: string }> = []
    for (const task of section.tasks ?? []) {
      for (const q of task.questions ?? []) {
        if (q.type === 'NOTE') continue
        const a = extractAnswer(q.answer)
        const title = q.question || (Array.isArray(q.parts) && q.parts[0]?.title) || ''
        if (title) out.push({ q: title, a })
      }
    }
    return out
  }

  // ─── CSS ───────────────────────────────────────────────────────────────────

  function buildCss(): string {
    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      @page { size: A4; margin: 15mm 14mm 20mm; }
      body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #1a1a1a; line-height: 1.5; background: white; }

      /* ── Header ── */
      .doc-header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 10px; margin-bottom: 14px; border-bottom: 2px solid #1a1a1a; }
      .law-title { font-size: 13pt; font-weight: 700; color: #1a1a1a; }
      .law-subtitle { font-size: 8pt; color: #444; margin-top: 3px; }
      .doc-meta { text-align: right; font-size: 7.5pt; color: #666; line-height: 1.7; }
      .doc-meta strong { color: #1a1a1a; }

      /* ── Property box ── */
      .property-box { border: 1.5px solid #1a1a1a; padding: 8px 12px; margin-bottom: 14px; }
      .property-box-title { font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #555; margin-bottom: 4px; }
      .property-address { font-size: 11pt; font-weight: 700; color: #1a1a1a; }
      .property-sub { font-size: 8.5pt; color: #555; margin-top: 2px; }

      /* ── Important notice ── */
      .notice-box { background: #fffbeb; border: 1px solid #f59e0b; padding: 8px 12px; margin-bottom: 14px; font-size: 7.5pt; color: #555; line-height: 1.6; border-radius: 4px; }
      .notice-box strong { color: #92400e; }

      /* ── Section ── */
      .section { margin-bottom: 16px; page-break-inside: avoid; }
      .section-header { background: #1a1a1a; color: white; padding: 5px 10px; display: flex; align-items: center; gap: 8px; }
      .section-num { font-size: 11pt; font-weight: 700; min-width: 24px; }
      .section-title { font-size: 10pt; font-weight: 700; }
      .section-body { border: 1px solid #ccc; border-top: none; }

      /* ── Row ── */
      .row { display: flex; border-bottom: 0.5px solid #e0e0e0; min-height: 26px; page-break-inside: avoid; }
      .row:last-child { border-bottom: none; }
      .row-num { width: 32px; flex-shrink: 0; background: #f5f5f5; border-right: 0.5px solid #ccc; display: flex; align-items: flex-start; justify-content: center; padding: 6px 4px; font-size: 7.5pt; font-weight: 700; color: #555; }
      .row-q { flex: 1; padding: 5px 8px; font-size: 8.5pt; color: #1a1a1a; min-width: 0; }
      .row-a { min-width: 160px; max-width: 200px; padding: 5px 8px; border-left: 0.5px solid #ccc; font-size: 8.5pt; display: flex; align-items: flex-start; }
      .row-a--wide { min-width: 280px; }
      .row-full { flex: 1; padding: 5px 8px; font-size: 8.5pt; }

      /* ── Blank / Filled ── */
      .blank { display: inline-block; border-bottom: 1px solid #555; vertical-align: bottom; }
      .filled { font-weight: 600; color: #00534f; }

      /* ── Checkbox ── */
      .cb-wrap { display: inline-flex; align-items: center; gap: 4px; margin-right: 8px; font-size: 8.5pt; }
      .cb { width: 13px; height: 13px; border: 1.5px solid #1a1a1a; display: inline-flex; align-items: center; justify-content: center; font-size: 9pt; flex-shrink: 0; }
      .cb--checked { background: #1a1a1a; color: white; }

      /* ── Sub-question ── */
      .sub-q { padding: 4px 8px 4px 24px; font-size: 8pt; color: #555; border-bottom: 0.5px solid #f0f0f0; }
      .sub-q:last-child { border-bottom: none; }

      /* ── Passport note ── */
      .passport-data { padding: 6px 8px; background: #f0fffe; border-top: 0.5px solid #b2e4e1; font-size: 7.5pt; color: #00534f; }

      /* ── Signature block ── */
      .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 4px; }
      .sig-field { border-bottom: 1px solid #555; padding-bottom: 20px; margin-bottom: 4px; min-height: 24px; }
      .sig-label { font-size: 7.5pt; color: #888; }

      /* ── Footer ── */
      .doc-footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #ccc; font-size: 7pt; color: #aaa; display: flex; justify-content: space-between; }

      /* ── Page break ── */
      .page-break { page-break-before: always; }
    `
  }

  // ─── Document builder ───────────────────────────────────────────────────────

  function buildHtml(passport: any, property: any, sections: any[]): string {
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    const addr = passport.addressLine1 || ''
    const sellerName = passport.ownerName || ''
    const cityLine = [property?.city || property?.county, property?.postcode || passport.postcode].filter(Boolean).join(', ')
    const tenure = property?.tenure || findAnswer(sections, 'ownershipProfile', 'tenure') || ''
    const titleNum = property?.titleNumber || ''

    // Pull answers from passport sections (keys match seed.ts)
    const boundaries = getSectionAnswers(sections, 'boundaries')
    const disputes = getSectionAnswers(sections, 'disputesAndComplaints')
    const notices = getSectionAnswers(sections, 'noticesAndProposals')
    const guarantees = getSectionAnswers(sections, 'guaranteesAndWarranties')
    const environmental = getSectionAnswers(sections, 'environmental')
    const planning = getSectionAnswers(sections, 'alterationsAndPlanning')
    const services = getSectionAnswers(sections, 'services')
    const rights = getSectionAnswers(sections, 'rightsAndInformalArrangements')
    const transaction = getSectionAnswers(sections, 'transactionInformation')

    // Helper: Render passport answers as a teal data block
    function passportBlock(items: Array<{ q: string; a: string }>, maxRows = 99): string {
      if (!items.length) return ''
      const rows = items.slice(0, maxRows)
        .map(i => `<tr>
          <td style="padding:3px 8px;font-size:7.5pt;color:#555;width:45%">${esc(i.q)}</td>
          <td style="padding:3px 8px;font-size:7.5pt">${i.a ? `<span class="filled">${esc(i.a)}</span>` : '<em style="color:#bbb">not answered</em>'}</td>
        </tr>`).join('')
      return `<div class="passport-data">
        <table style="width:100%;border-collapse:collapse">${rows}</table>
      </div>`
    }

    // Helper: checkbox row (question takes full width, answer below)
    function envRow(num: string, label: string, answerVal = ''): string {
      return `<div class="row">
        <div class="row-num">${esc(num)}</div>
        <div class="row-q">${esc(label)}</div>
        <div class="row-a">${yesNo(answerVal)}</div>
      </div>`
    }

    const tenureDisplay = tenure
      ? `<span class="filled">${esc(tenure)}</span>`
      : `${checkbox(false,'Freehold')}&nbsp;&nbsp;${checkbox(false,'Leasehold')}&nbsp;&nbsp;${checkbox(false,'Commonhold')}`

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TA6 Property Information Form &mdash; ${esc(addr)}</title>
  <style>${buildCss()}</style>
</head>
<body>

<!-- ══ HEADER ══════════════════════════════════════════════════════════════ -->
<div class="doc-header">
  <div>
    <div class="law-title">TA6 &mdash; Property Information Form</div>
    <div class="law-subtitle">6th edition (2025) &bull; Law Society of England and Wales</div>
  </div>
  <div class="doc-meta">
    <div><strong>Generated:</strong> ${esc(date)}</div>
    ${passport.id ? `<div><strong>Passport ref:</strong> ${esc(passport.id.slice(0, 8).toUpperCase())}</div>` : ''}
    <div style="margin-top:3px;font-size:6pt;color:#ccc">Pre-filled from umu Property Passport</div>
  </div>
</div>

<!-- ══ PROPERTY ════════════════════════════════════════════════════════════ -->
<div class="property-box">
  <div class="property-box-title">Property address</div>
  <div class="property-address">${esc(addr)}</div>
  ${cityLine ? `<div class="property-sub">${esc(cityLine)}${titleNum ? `&nbsp;&nbsp;|&nbsp;&nbsp;Title No:&nbsp;<strong>${esc(titleNum)}</strong>` : ''}</div>` : ''}
</div>

<!-- ══ IMPORTANT NOTICE ════════════════════════════════════════════════════ -->
<div class="notice-box">
  <strong>Important:</strong> This form must be completed by the seller to the best of their knowledge. Where a question is not applicable, write N/A. The seller must promptly notify their solicitor of any change. <span style="color:#00534f;font-weight:700">Green text</span> indicates data pre-filled from the umu Property Passport — verify before signing. Blank lines require manual completion.
</div>

<!-- ══ SECTION 1: SELLER DETAILS ══════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">1</span><span class="section-title">Seller Details</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">1.1</div>
      <div class="row-q">Full name(s) of seller(s)</div>
      <div class="row-a row-a--wide">${sellerName ? `<span class="filled">${esc(sellerName)}</span>` : blank('240px')}</div>
    </div>
    <div class="row">
      <div class="row-num">1.2</div>
      <div class="row-q">Correspondence address (if different from property address)</div>
      <div class="row-a row-a--wide">${blank('240px')}</div>
    </div>
    <div class="row">
      <div class="row-num">1.3</div>
      <div class="row-q">Tenure of the property</div>
      <div class="row-a row-a--wide">${tenureDisplay}</div>
    </div>
    <div class="row">
      <div class="row-num">1.4</div>
      <div class="row-q">Council tax band</div>
      <div class="row-a">${blank('100px')}</div>
    </div>
    <div class="row">
      <div class="row-num">1.5</div>
      <div class="row-q">Property type</div>
      <div class="row-a">${property?.propertyType ? `<span class="filled">${esc(property.propertyType)}</span>` : blank('120px')}</div>
    </div>
    <div class="row">
      <div class="row-num">1.6</div>
      <div class="row-q">Number of bedrooms &nbsp;/&nbsp; bathrooms</div>
      <div class="row-a">${(property?.bedrooms || property?.bathrooms) ? `<span class="filled">${property?.bedrooms ?? '—'} bed / ${property?.bathrooms ?? '—'} bath</span>` : blank('140px')}</div>
    </div>
    <div class="row">
      <div class="row-num">1.7</div>
      <div class="row-q">Approximate year built</div>
      <div class="row-a">${property?.yearBuilt ? `<span class="filled">${esc(property.yearBuilt)}</span>` : blank('100px')}</div>
    </div>
    <div class="row">
      <div class="row-num">1.8</div>
      <div class="row-q">Floor area (if known)</div>
      <div class="row-a">${property?.sqft ? `<span class="filled">${property.sqft.toLocaleString()} sqft</span>` : blank('120px')}</div>
    </div>
  </div>
</div>

<!-- ══ SECTION 2: BOUNDARIES ══════════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">2</span><span class="section-title">Boundaries</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">2.1</div>
      <div class="row-q">
        Looking at the property from the road, who is responsible for maintaining the following boundaries?
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;margin-top:8px;font-size:8pt">
          <div><strong>Left:</strong>&nbsp;${blank('90px')}</div>
          <div><strong>Right:</strong>&nbsp;${blank('90px')}</div>
          <div><strong>Front:</strong>&nbsp;${blank('90px')}</div>
          <div><strong>Rear:</strong>&nbsp;${blank('90px')}</div>
        </div>
      </div>
      <div class="row-a" style="min-width:0;padding:5px 8px;font-size:7.5pt;color:#999;align-items:flex-start">
        S&nbsp;=&nbsp;Seller<br>N&nbsp;=&nbsp;Neighbour<br>S+N&nbsp;=&nbsp;Shared<br>?&nbsp;=&nbsp;Not known
      </div>
    </div>
    <div class="row">
      <div class="row-num">2.2</div>
      <div class="row-q">Have any of the boundaries been moved in the last ten years?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">2.3</div>
      <div class="row-q">Has the seller been involved in any disputes or complaints with a neighbour about the boundary, or about anything overhanging or encroaching on the property?</div>
      <div class="row-a">${yesNo(boundaries[0]?.a || '')}</div>
    </div>
    ${boundaries.length ? passportBlock(boundaries) : ''}
  </div>
</div>

<!-- ══ SECTION 3: DISPUTES, COMPLAINTS AND CORRESPONDENCE ═════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">3</span><span class="section-title">Disputes, Complaints and Correspondence</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">3.1</div>
      <div class="row-q">Is the seller aware of any disputes or anything likely to lead to a dispute about the property or a neighbour's property?</div>
      <div class="row-a">${yesNo(disputes[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">3.2</div>
      <div class="row-q">Has the seller, or to their knowledge anyone else, ever complained to the local authority about the condition of any neighbouring property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">3.3</div>
      <div class="row-q">Has the seller received any complaints about anything they have, or have not, done as owner of the property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${disputes.length ? passportBlock(disputes) : ''}
  </div>
</div>

<!-- ══ SECTION 4: NOTICES, NOTIFICATIONS AND ORDERS ══════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">4</span><span class="section-title">Notices, Notifications and Orders</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">4.1</div>
      <div class="row-q">Has the seller received any formal or informal notices or correspondence that may affect the property, or which require, or have required, action by the seller (other than in relation to planning)?</div>
      <div class="row-a">${yesNo(notices[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">4.2</div>
      <div class="row-q">Has the seller been notified of any proposals by any local or other authority that could affect the property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${notices.length ? passportBlock(notices) : ''}
  </div>
</div>

<!-- ══ SECTION 5: GUARANTEES, WARRANTIES AND INDEMNITIES ══════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">5</span><span class="section-title">Guarantees, Warranties and Indemnities</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">5.1</div>
      <div class="row-q">Is the seller aware of any guarantees, warranties or indemnity policies (other than for the National House Building Council or similar new build warranty)?</div>
      <div class="row-a">${yesNo(guarantees[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">5.2</div>
      <div class="row-q">Has the property been treated for damp, rot or infestation, or has any structural work been done?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">5.3</div>
      <div class="row-q">Are there any guarantees or warranties relating to double glazing or other home improvements?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${guarantees.length ? passportBlock(guarantees) : ''}
  </div>
</div>

<!-- ══ SECTION 6: INSURANCE ═══════════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">6</span><span class="section-title">Insurance</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">6.1</div>
      <div class="row-q">Buildings insurer name</div>
      <div class="row-a row-a--wide">${blank('220px')}</div>
    </div>
    <div class="row">
      <div class="row-num">6.2</div>
      <div class="row-q">Has any buildings insurer ever cancelled or refused to renew a policy on the property, or imposed special conditions?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">6.3</div>
      <div class="row-q">Have there been any buildings insurance claims in the last five years?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
  </div>
</div>

<!-- ══ SECTION 7: ENVIRONMENTAL MATTERS ══════════════════════════════════ -->
<div class="section page-break">
  <div class="section-header"><span class="section-num">7</span><span class="section-title">Environmental Matters</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">7.1</div>
      <div class="row-q">Has the property been flooded in the past?</div>
      <div class="row-a">${yesNo(findAnswer(sections, 'environmental', 'flood'))}</div>
    </div>
    <div class="row">
      <div class="row-num">7.2</div>
      <div class="row-q">Is the property at risk of flooding?<br><span style="font-size:7.5pt;color:#777">Tick all that apply:</span><br>
        <div style="display:flex;flex-wrap:wrap;gap:6px 12px;margin-top:4px;font-size:8pt">
          ${checkbox(false,'River/sea flood')}
          ${checkbox(false,'Surface water')}
          ${checkbox(false,'Groundwater')}
          ${checkbox(false,'Sewer')}
          ${checkbox(false,'Not known')}
        </div>
      </div>
      <div class="row-a" style="min-width:0"></div>
    </div>
    <div class="row">
      <div class="row-num">7.3</div>
      <div class="row-q">Is the property in a radon-affected area?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">7.4</div>
      <div class="row-q">Is the seller aware of any presence (past or present) of Japanese knotweed at or near the property?</div>
      <div class="row-a">${yesNo(findAnswer(sections, 'environmental', 'knotweed'))}</div>
    </div>
    <div class="row">
      <div class="row-num">7.5</div>
      <div class="row-q">Is the seller aware of any ground subsidence, heave, landslip or other settlement at the property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">7.6</div>
      <div class="row-q">Is the seller aware of any contaminated land notice or environmental designation affecting the property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">7.7</div>
      <div class="row-q">Is the property in a coal mining area or otherwise affected by mining?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${environmental.length ? passportBlock(environmental) : ''}
  </div>
</div>

<!-- ══ SECTION 8: RIGHTS AND INFORMAL ARRANGEMENTS ═══════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">8</span><span class="section-title">Rights and Informal Arrangements</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">8.1</div>
      <div class="row-q">Does anyone other than the seller have any right over the property? (e.g. right of way, right to use a path or driveway, right to light, or a restrictive covenant)</div>
      <div class="row-a">${yesNo(rights[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">8.2</div>
      <div class="row-q">Does the seller have any right over a neighbouring property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">8.3</div>
      <div class="row-q">Are there any informal arrangements which allow someone to use part of the property (e.g. access across it)?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">8.4</div>
      <div class="row-q">Is there a public right of way, footpath or bridleway over or adjacent to the property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${rights.length ? passportBlock(rights) : ''}
  </div>
</div>

<!-- ══ SECTION 9: SERVICES ════════════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">9</span><span class="section-title">Services</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">9.1</div>
      <div class="row-q">
        Which services are connected to the property? <em style="font-size:7.5pt;color:#777">(tick all that apply)</em>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 16px;margin-top:7px;font-size:8pt">
          <div>${checkbox(false,'Mains gas')}</div>
          <div>${checkbox(false,'Mains electricity')}</div>
          <div>${checkbox(false,'Mains water')}</div>
          <div>${checkbox(false,'Mains drainage / sewerage')}</div>
          <div>${checkbox(false,'Oil')}</div>
          <div>${checkbox(false,'LPG / bottled gas')}</div>
          <div>${checkbox(false,'Solar panels (PV)')}</div>
          <div>${checkbox(false,'Solar thermal')}</div>
          <div>${checkbox(false,'Heat pump (air / ground)')}</div>
          <div>${checkbox(false,'Septic tank')}</div>
        </div>
      </div>
      <div class="row-a" style="min-width:0"></div>
    </div>
    <div class="row">
      <div class="row-num">9.2</div>
      <div class="row-q">Is the seller aware of any problems with any of these services?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">9.3</div>
      <div class="row-q">Does any service pipe, cable or drain serving the property pass through a neighbour's land, or vice versa?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">9.4</div>
      <div class="row-q">Has the boiler been serviced in the last 12 months?</div>
      <div class="row-a">${yesNo(findAnswer(sections, 'services', 'boiler'))}</div>
    </div>
    ${services.length ? passportBlock(services) : ''}
  </div>
</div>

<!-- ══ SECTION 10: PLANNING AND BUILDING CONTROL ═════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">10</span><span class="section-title">Planning and Building Control</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">10.1</div>
      <div class="row-q">Has any building work (extensions, conversions, alterations, or additions) been carried out at the property since it was built?</div>
      <div class="row-a">${yesNo(planning[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">10.2</div>
      <div class="row-q">Where required, was planning permission obtained?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">10.3</div>
      <div class="row-q">Were building regulations approval and a completion certificate obtained?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">10.4</div>
      <div class="row-q">Is the property or any part of it listed or in a conservation area?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">10.5</div>
      <div class="row-q">Are there any outstanding planning applications or unimplemented planning permissions affecting the property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${property?.epcRating ? `<div class="row">
      <div class="row-num">10.6</div>
      <div class="row-q">Energy Performance Certificate (EPC) rating</div>
      <div class="row-a"><span class="filled">${esc(property.epcRating)}</span></div>
    </div>` : ''}
    ${planning.length ? passportBlock(planning) : ''}
  </div>
</div>

<!-- ══ SECTION 11: COMPLETION INFORMATION AND OTHER MATTERS ═══════════════ -->
<div class="section page-break">
  <div class="section-header"><span class="section-num">11</span><span class="section-title">Completion Information and Other Matters</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">11.1</div>
      <div class="row-q">Does anyone aged 17 or over live at the property (other than the seller)?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">11.2</div>
      <div class="row-q">If yes, please give their name(s) and date(s) of birth</div>
      <div class="row-a row-a--wide">${blank('220px')}</div>
    </div>
    <div class="row">
      <div class="row-num">11.3</div>
      <div class="row-q">Will any occupier(s) be required to sign a release of any interest they may have?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">11.4</div>
      <div class="row-q">How many sets of keys will be available on completion?</div>
      <div class="row-a">${blank('80px')}</div>
    </div>
    <div class="row">
      <div class="row-num">11.5</div>
      <div class="row-q">Will the gas, electricity and water meters be read on completion?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">11.6</div>
      <div class="row-q">Is there a parking space, garage or outbuilding included?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">11.7</div>
      <div class="row-q">Are there any shared facilities with other properties? (e.g. communal areas, shared access road, bin store)</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
  </div>
</div>

<!-- ══ SECTION 12: TRANSACTION INFORMATION ════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">12</span><span class="section-title">Transaction Information</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">12.1</div>
      <div class="row-q">Asking / agreed price</div>
      <div class="row-a">${property?.estimatedPrice ? `<span class="filled">£${Number(property.estimatedPrice).toLocaleString('en-GB')}</span>` : blank()}</div>
    </div>
    <div class="row">
      <div class="row-num">12.2</div>
      <div class="row-q">Is the property currently vacant or occupied?</div>
      <div class="row-a">${checkbox(false,'Vacant')}&nbsp;&nbsp;${checkbox(false,'Occupied')}</div>
    </div>
    <div class="row">
      <div class="row-num">12.3</div>
      <div class="row-q">Is a mortgage to be redeemed on completion?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">12.4</div>
      <div class="row-q">If yes, name of mortgage lender</div>
      <div class="row-a row-a--wide">${blank('220px')}</div>
    </div>
    <div class="row">
      <div class="row-num">12.5</div>
      <div class="row-q">Is there a related purchase?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">12.6</div>
      <div class="row-q">Target / required completion date (if known)</div>
      <div class="row-a">${blank('140px')}</div>
    </div>
    ${transaction.length ? passportBlock(transaction) : ''}
  </div>
</div>

<!-- ══ SECTION 13: SELLER'S DECLARATION ══════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">13</span><span class="section-title">Seller's Declaration</span></div>
  <div class="section-body" style="padding:12px 14px">
    <p style="font-size:8.5pt;color:#333;line-height:1.65;margin-bottom:14px">
      I/We confirm that the information provided in this form is true and accurate to the best of my/our knowledge and belief as at the date signed below. I/We understand that the buyer and the buyer's solicitors will rely on this information and that it is my/our duty to inform my/our solicitor of any change to the information given.
    </p>
    <div class="sig-grid">
      <div>
        <div class="sig-field"></div>
        <div class="sig-label">Seller 1 — full name (print)</div>
        <div style="margin-top:10px">
          <div class="sig-field" style="padding-bottom:32px"></div>
          <div class="sig-label">Seller 1 signature</div>
        </div>
        <div style="margin-top:10px;font-size:8pt">Date: ${blank('90px')}</div>
      </div>
      <div>
        <div class="sig-field"></div>
        <div class="sig-label">Seller 2 — full name (print) &nbsp;<em style="color:#aaa">(if applicable)</em></div>
        <div style="margin-top:10px">
          <div class="sig-field" style="padding-bottom:32px"></div>
          <div class="sig-label">Seller 2 signature &nbsp;<em style="color:#aaa">(if applicable)</em></div>
        </div>
        <div style="margin-top:10px;font-size:8pt">Date: ${blank('90px')}</div>
      </div>
    </div>
  </div>
</div>

<!-- ══ FOOTER ════════════════════════════════════════════════════════════ -->
<div class="doc-footer">
  <span>TA6 &mdash; Law Society Property Information Form &bull; 6th Edition 2025</span>
  <span>Pre-filled via umu Property Passport &middot; ${esc(date)}</span>
</div>

<script>
  window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 400); });
</script>
</body>
</html>`
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  function generateTA6(data: any) {
    if (!data) return
    const { passport, property, sections } = data
    const html = buildHtml(passport, property, sections ?? [])
    const win = window.open('', '_blank', 'width=960,height=800,scrollbars=yes,resizable=yes')
    if (!win) {
      alert('Pop-ups are blocked. Please allow pop-ups for this site to generate the TA6 form.')
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
  }

  return { generateTA6 }
}
