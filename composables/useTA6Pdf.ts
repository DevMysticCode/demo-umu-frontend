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
      .sig-block { border: 1px solid #ccc; padding: 12px; margin-top: 8px; }
      .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 8px; }
      .sig-field { border-bottom: 1px solid #555; padding-bottom: 24px; margin-bottom: 4px; }
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
    const cityLine = [property?.city || property?.county, property?.postcode || passport.postcode].filter(Boolean).join(', ')
    const fullAddress = [addr, cityLine].filter(Boolean).join(', ')
    const tenure = property?.tenure || findAnswer(sections, 'propertyOwnership', 'tenure') || ''
    const titleNum = property?.titleNumber || ''

    // Pull answers from passport sections
    const boundaries = getSectionAnswers(sections, 'boundaries')
    const disputes = getSectionAnswers(sections, 'disputesComplaints')
    const notices = getSectionAnswers(sections, 'noticesProposals')
    const guarantees = getSectionAnswers(sections, 'guaranteesWarranties')
    const environmental = getSectionAnswers(sections, 'environmentalMatters')
    const planning = getSectionAnswers(sections, 'planningBuildingControl')
    const services = getSectionAnswers(sections, 'services')
    const rights = getSectionAnswers(sections, 'rightsInformal')
    const transaction = getSectionAnswers(sections, 'transactionInfo')

    function passportRow(items: Array<{ q: string; a: string }>, maxRows = 99): string {
      if (!items.length) return ''
      return `<div class="passport-data">
        <strong>From Property Passport:</strong><br>
        ${items.slice(0, maxRows).map(i => `<span style="display:inline-block;margin-right:16px;margin-top:2px">
          <strong>${esc(i.q)}:</strong> ${i.a ? `<span class="filled">${esc(i.a)}</span>` : '<em style="color:#aaa">not answered</em>'}
        </span>`).join('')}
      </div>`
    }

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
    <div class="law-subtitle">6th edition (2025) &mdash; Law Society of England and Wales</div>
  </div>
  <div class="doc-meta">
    <div><strong>Generated:</strong> ${esc(date)}</div>
    <div><strong>Passport ID:</strong> ${esc(passport.id)}</div>
    <div style="margin-top:4px;font-size:6.5pt;color:#bbb">Pre-filled from umu Property Passport</div>
  </div>
</div>

<!-- ══ PROPERTY ════════════════════════════════════════════════════════════ -->
<div class="property-box">
  <div class="property-box-title">Property address</div>
  <div class="property-address">${esc(addr)}</div>
  <div class="property-sub">${esc(cityLine)}${titleNum ? ' &nbsp;|&nbsp; Title No: <strong>' + esc(titleNum) + '</strong>' : ''}</div>
</div>

<!-- ══ IMPORTANT NOTICE ════════════════════════════════════════════════════ -->
<div class="notice-box">
  <strong>Important:</strong> This form is completed by the seller. The seller should complete it carefully and accurately to the best of their knowledge. Where a question is not applicable, state N/A. The seller must promptly inform their solicitor of any change to the information given. Fields highlighted in <span style="color:#00534f;font-weight:700">green</span> have been pre-filled from the umu Property Passport. Blank lines require manual completion.
</div>

<!-- ══ SECTION 1: SELLER DETAILS ══════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">1</span><span class="section-title">Seller Details</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">1.1</div>
      <div class="row-q">Full name(s) of seller(s)</div>
      <div class="row-a row-a--wide">${blank('240px')}</div>
    </div>
    <div class="row">
      <div class="row-num">1.2</div>
      <div class="row-q">Correspondence address (if different from property)</div>
      <div class="row-a row-a--wide">${blank('240px')}</div>
    </div>
    <div class="row">
      <div class="row-num">1.3</div>
      <div class="row-q">Tenure</div>
      <div class="row-a row-a--wide">${filled(tenure, '')}&nbsp;${!tenure ? checkbox(false,'Freehold')+'&nbsp;'+checkbox(false,'Leasehold')+'&nbsp;'+checkbox(false,'Commonhold') : ''}</div>
    </div>
    <div class="row">
      <div class="row-num">1.4</div>
      <div class="row-q">What is the council tax band?</div>
      <div class="row-a">${blank()}</div>
    </div>
  </div>
</div>

<!-- ══ SECTION 2: BOUNDARIES ══════════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">2</span><span class="section-title">Boundaries</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">2.1</div>
      <div class="row-q">Looking towards the property from the road, who is responsible for maintaining the boundary on the:<br>
        <div style="margin-top:6px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:8pt">
          <div><strong>Left:</strong> ${blank('80px')}</div>
          <div><strong>Right:</strong> ${blank('80px')}</div>
          <div><strong>Front:</strong> ${blank('80px')}</div>
          <div><strong>Rear:</strong> ${blank('80px')}</div>
        </div>
      </div>
      <div class="row-a" style="flex-direction:column;gap:4px"></div>
    </div>
    <div class="row">
      <div class="row-num">2.2</div>
      <div class="row-q">Have any of the boundaries been moved in the last ten years?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">2.3</div>
      <div class="row-q">Is the seller aware of any current or recent disputes regarding the boundaries, shared drives, rights of way or other arrangements with neighbouring properties?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${boundaries.length ? passportRow(boundaries) : ''}
  </div>
</div>

<!-- ══ SECTION 3: DISPUTES, COMPLAINTS AND CORRESPONDENCE ═════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">3</span><span class="section-title">Disputes, Complaints and Correspondence</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">3.1</div>
      <div class="row-q">Is the seller aware of any disputes, complaints or correspondence with any neighbour or local authority which affects the property?</div>
      <div class="row-a">${yesNo(disputes[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">3.2</div>
      <div class="row-q">Has the seller received any complaints about anything they have done or not done as owner of the property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${disputes.length ? passportRow(disputes) : ''}
  </div>
</div>

<!-- ══ SECTION 4: NOTICES, NOTIFICATIONS AND ORDERS ══════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">4</span><span class="section-title">Notices, Notifications and Orders</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">4.1</div>
      <div class="row-q">Has the seller received any formal or informal notices or correspondence that may affect the property (other than in relation to planning)?</div>
      <div class="row-a">${yesNo(notices[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">4.2</div>
      <div class="row-q">Has the seller been given notice of any proposed local development, compulsory purchase or similar?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${notices.length ? passportRow(notices) : ''}
  </div>
</div>

<!-- ══ SECTION 5: GUARANTEES, WARRANTIES AND INDEMNITIES ══════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">5</span><span class="section-title">Guarantees, Warranties and Indemnities</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">5.1</div>
      <div class="row-q">Are there any guarantees, warranties or indemnity policies relating to the property or its contents that will be passed on to the buyer?</div>
      <div class="row-a">${yesNo(guarantees[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">5.2</div>
      <div class="row-q">Has the property been treated for damp, timber infestation or any structural issue?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${guarantees.length ? passportRow(guarantees) : ''}
  </div>
</div>

<!-- ══ SECTION 6: INSURANCE ═══════════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">6</span><span class="section-title">Insurance</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">6.1</div>
      <div class="row-q">Buildings insurer</div>
      <div class="row-a row-a--wide">${blank('220px')}</div>
    </div>
    <div class="row">
      <div class="row-num">6.2</div>
      <div class="row-q">Has any insurer ever refused to insure the property or imposed special conditions?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">6.3</div>
      <div class="row-q">Have any claims been made on the buildings insurance?</div>
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
      <div class="row-q">Is the seller aware of any of the following affecting the property?</div>
      <div class="row-a" style="flex-direction:column;font-size:8pt;gap:4px;padding:6px 8px">
        <div>${checkbox(false,'Flooding')}</div>
        <div>${checkbox(false,'Subsidence or settlement')}</div>
        <div>${checkbox(false,'Contamination')}</div>
        <div>${checkbox(false,'Japanese knotweed')}</div>
        <div>${checkbox(false,'Mining activities')}</div>
        <div>${checkbox(false,'Radon gas')}</div>
      </div>
    </div>
    <div class="row">
      <div class="row-num">7.2</div>
      <div class="row-q">Has the property been flooded in the last five years?</div>
      <div class="row-a">${yesNo(findAnswer(sections, 'environmentalMatters', 'flood'))}</div>
    </div>
    <div class="row">
      <div class="row-num">7.3</div>
      <div class="row-q">Is Japanese knotweed present or has it been present in the last 10 years?</div>
      <div class="row-a">${yesNo(findAnswer(sections, 'environmentalMatters', 'knotweed'))}</div>
    </div>
    ${environmental.length ? passportRow(environmental) : ''}
  </div>
</div>

<!-- ══ SECTION 8: RIGHTS AND INFORMAL ARRANGEMENTS ═══════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">8</span><span class="section-title">Rights and Informal Arrangements</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">8.1</div>
      <div class="row-q">Does anyone other than the seller have a right to use any part of the property (e.g. right of way, shared access)?</div>
      <div class="row-a">${yesNo(rights[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">8.2</div>
      <div class="row-q">Does the seller need to use any part of a neighbouring property (e.g. access across it)?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">8.3</div>
      <div class="row-q">Are there any formal or informal arrangements in place between neighbours that affect the property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${rights.length ? passportRow(rights) : ''}
  </div>
</div>

<!-- ══ SECTION 9: SERVICES ════════════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">9</span><span class="section-title">Services</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">9.1</div>
      <div class="row-q">Which services are connected to the property?</div>
      <div class="row-a" style="flex-direction:column;font-size:8pt;gap:3px;padding:6px 8px">
        <div>${checkbox(false,'Mains gas')} ${checkbox(false,'Mains electricity')}</div>
        <div>${checkbox(false,'Mains water')} ${checkbox(false,'Mains drainage')}</div>
        <div>${checkbox(false,'Oil')} ${checkbox(false,'LPG')} ${checkbox(false,'Solar panels')}</div>
      </div>
    </div>
    <div class="row">
      <div class="row-num">9.2</div>
      <div class="row-q">Is the seller aware of any problems with any of these services?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">9.3</div>
      <div class="row-q">Does any service pipe or cable serving the property cross a neighbour's land, or vice versa?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${services.length ? passportRow(services) : ''}
  </div>
</div>

<!-- ══ SECTION 10: PLANNING AND BUILDING CONTROL ═════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">10</span><span class="section-title">Planning and Building Control</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">10.1</div>
      <div class="row-q">Has any work been done to the property (including extensions, conversions, alterations, additions) since it was built?</div>
      <div class="row-a">${yesNo(planning[0]?.a || '')}</div>
    </div>
    <div class="row">
      <div class="row-num">10.2</div>
      <div class="row-q">If yes, was planning permission obtained for all such work?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">10.3</div>
      <div class="row-q">Was building regulations approval obtained and a completion certificate issued?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">10.4</div>
      <div class="row-q">Are there any outstanding planning applications or planning conditions affecting the property?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    ${property?.epcRating ? `<div class="row">
      <div class="row-num"></div>
      <div class="row-q">EPC Rating (from property records)</div>
      <div class="row-a"><span class="filled">${esc(property.epcRating)}</span></div>
    </div>` : ''}
    ${planning.length ? passportRow(planning) : ''}
  </div>
</div>

<!-- ══ SECTION 11: TRANSACTION INFORMATION ════════════════════════════════ -->
<div class="section page-break">
  <div class="section-header"><span class="section-num">11</span><span class="section-title">Transaction Information</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">11.1</div>
      <div class="row-q">What is the asking price (if known)?</div>
      <div class="row-a">${property?.estimatedPrice ? filled('£' + Number(property.estimatedPrice).toLocaleString('en-GB')) : blank()}</div>
    </div>
    <div class="row">
      <div class="row-num">11.2</div>
      <div class="row-q">Is the property vacant or occupied?</div>
      <div class="row-a">${checkbox(false,'Vacant')} ${checkbox(false,'Occupied')}</div>
    </div>
    <div class="row">
      <div class="row-num">11.3</div>
      <div class="row-q">Is a mortgage required to be redeemed on completion?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">11.4</div>
      <div class="row-q">If there is a mortgage, name of lender</div>
      <div class="row-a row-a--wide">${blank('220px')}</div>
    </div>
    <div class="row">
      <div class="row-num">11.5</div>
      <div class="row-q">Target completion date (if known)</div>
      <div class="row-a">${blank()}</div>
    </div>
    ${transaction.length ? passportRow(transaction) : ''}
  </div>
</div>

<!-- ══ SECTION 12: OCCUPIERS ══════════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">12</span><span class="section-title">Occupiers</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">12.1</div>
      <div class="row-q">Does anyone aged 17 or over currently live at the property (other than the seller)?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">12.2</div>
      <div class="row-q">If yes, please give their name(s)</div>
      <div class="row-a row-a--wide">${blank('220px')}</div>
    </div>
    <div class="row">
      <div class="row-num">12.3</div>
      <div class="row-q">Will any occupier(s) be required to sign a release of any rights they may have?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
  </div>
</div>

<!-- ══ SECTION 13: MATERIAL INFORMATION ══════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">13</span><span class="section-title">Material Information (Consumer Protection)</span></div>
  <div class="section-body">
    <div class="row">
      <div class="row-num">13.1</div>
      <div class="row-q">Property type</div>
      <div class="row-a">${filled(property?.propertyType)}</div>
    </div>
    <div class="row">
      <div class="row-num">13.2</div>
      <div class="row-q">Number of bedrooms / bathrooms</div>
      <div class="row-a">${property?.bedrooms || property?.bathrooms ? filled(`${property?.bedrooms ?? '—'} bed / ${property?.bathrooms ?? '—'} bath`) : blank()}</div>
    </div>
    <div class="row">
      <div class="row-num">13.3</div>
      <div class="row-q">Floor area</div>
      <div class="row-a">${property?.sqft ? filled(property.sqft.toLocaleString() + ' sqft') : blank()}</div>
    </div>
    <div class="row">
      <div class="row-num">13.4</div>
      <div class="row-q">Year built (approximate)</div>
      <div class="row-a">${filled(property?.yearBuilt)}</div>
    </div>
    <div class="row">
      <div class="row-num">13.5</div>
      <div class="row-q">Is the property in a flood risk zone?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
    <div class="row">
      <div class="row-num">13.6</div>
      <div class="row-q">Is the property in a coalfield area?</div>
      <div class="row-a">${yesNo('')}</div>
    </div>
  </div>
</div>

<!-- ══ SIGNATURE BLOCK ════════════════════════════════════════════════════ -->
<div class="section">
  <div class="section-header"><span class="section-num">14</span><span class="section-title">Seller's Declaration</span></div>
  <div class="section-body" style="padding:12px">
    <p style="font-size:8.5pt;color:#333;line-height:1.6;margin-bottom:12px">
      I/We confirm that the information provided in this form is true, to the best of my/our knowledge and belief. I/We understand that the buyer may rely on this information when deciding to buy the property and that providing false information could result in legal action.
    </p>
    <div class="sig-grid">
      <div>
        <div class="sig-field"></div>
        <div class="sig-label">Seller 1 signature</div>
        <div style="margin-top:8px;font-size:8pt">Date: ${blank('80px')}</div>
      </div>
      <div>
        <div class="sig-field"></div>
        <div class="sig-label">Seller 2 signature (if applicable)</div>
        <div style="margin-top:8px;font-size:8pt">Date: ${blank('80px')}</div>
      </div>
    </div>
  </div>
</div>

<!-- ══ FOOTER ════════════════════════════════════════════════════════════ -->
<div class="doc-footer">
  <span>TA6 &mdash; Law Society Property Information Form 6th Edition (2025)</span>
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
