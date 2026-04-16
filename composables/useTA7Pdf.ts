/**
 * useTA7Pdf
 * Generates a print-ready HTML TA7 Law Society Leasehold Information Form
 * (5th edition, 2025), pre-filled from passport leasehold section data.
 * Only relevant for leasehold properties.
 */
export function useTA7Pdf() {

  function esc(v: any): string {
    if (v == null) return ''
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }

  function blank(w = '200px'): string {
    return `<span class="blank" style="min-width:${w}"></span>`
  }

  function filled(v: any, fb = ''): string {
    const s = v != null ? String(v).trim() : ''
    return s ? `<span class="filled">${esc(s)}</span>` : (fb ? `<span class="filled">${esc(fb)}</span>` : blank())
  }

  function cb(checked: boolean, label: string): string {
    return `<span class="cb-wrap"><span class="cb${checked ? ' cb--checked' : ''}">${checked ? '&#10003;' : ''}</span>&nbsp;${esc(label)}</span>`
  }

  function yesNo(val: string | null | undefined, notApplicable = false): string {
    const v = (val || '').toLowerCase()
    const yes = v.includes('yes') || v === 'true'
    const no = v.includes('no') || v === 'false'
    const na = !yes && !no
    let out = cb(yes, 'Yes') + '&nbsp;&nbsp;' + cb(no, 'No')
    if (notApplicable) out += '&nbsp;&nbsp;' + cb(na, 'Not applicable')
    else out += '&nbsp;&nbsp;' + cb(na, 'Not known')
    return out
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

  function findAnswer(sections: any[], sectionKey: string, ...keywords: string[]): string {
    const sec = sections.find((s: any) => s.key === sectionKey)
    if (!sec) return ''
    for (const task of sec.tasks ?? []) {
      for (const q of task.questions ?? []) {
        const title = (q.question || '').toLowerCase()
        if (keywords.every(k => title.includes(k.toLowerCase()))) {
          return extractAnswer(q.answer)
        }
      }
    }
    return ''
  }

  function css(): string {
    return `
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #000; margin: 0; padding: 0; }
      .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm 18mm 20mm; }
      @media print { .page { padding: 14mm 16mm 18mm; } }
      h1 { font-size: 13pt; font-weight: 700; margin: 0 0 4px; }
      h2 { font-size: 11pt; font-weight: 700; background: #1a3a5c; color: #fff; padding: 5px 8px; margin: 18px 0 8px; }
      h3 { font-size: 10pt; font-weight: 700; margin: 14px 0 5px; border-bottom: 1px solid #999; padding-bottom: 3px; }
      .subtitle { font-size: 9pt; color: #444; margin: 0 0 14px; }
      table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; }
      td, th { border: 1px solid #ccc; padding: 4px 7px; vertical-align: top; font-size: 9.5pt; }
      th { background: #eaf0f7; font-weight: 600; }
      .label { font-weight: 600; width: 38%; background: #f9f9f9; }
      .blank { display: inline-block; border-bottom: 1px solid #555; min-width: 180px; height: 14px; vertical-align: bottom; }
      .filled { color: #1a3a5c; font-weight: 600; }
      .cb-wrap { display: inline-flex; align-items: center; gap: 3px; margin-right: 8px; }
      .cb { display: inline-flex; align-items: center; justify-content: center; width: 13px; height: 13px; border: 1.5px solid #333; font-size: 9pt; flex-shrink: 0; }
      .cb--checked { background: #1a3a5c; color: #fff; border-color: #1a3a5c; }
      .note { font-size: 8.5pt; color: #555; font-style: italic; margin: 4px 0; }
      .footer { font-size: 8pt; color: #666; border-top: 1px solid #ccc; margin-top: 18px; padding-top: 6px; display: flex; justify-content: space-between; }
      .header-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #1a3a5c; padding-bottom: 8px; }
      .logo-area { font-size: 8pt; color: #666; }
      .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 6px 0; }
      .contact-box { border: 1px solid #ccc; padding: 6px; }
      .contact-box h4 { margin: 0 0 4px; font-size: 9pt; }
      .row { display: flex; align-items: baseline; gap: 8px; margin: 4px 0; }
      .row-label { font-size: 9pt; font-weight: 600; min-width: 140px; flex-shrink: 0; }
      .section-num { display: inline-block; background: #1a3a5c; color: #fff; padding: 1px 6px; border-radius: 2px; font-weight: 700; font-size: 9.5pt; margin-right: 6px; }
    `
  }

  function contactBlock(label: string, name = '', address = '', email = ''): string {
    return `
      <div class="contact-box">
        <h4>${esc(label)}</h4>
        <div class="row"><span class="row-label">Name:</span>${filled(name)}</div>
        <div class="row"><span class="row-label">Address:</span>${filled(address)}</div>
        <div class="row"><span class="row-label">Email:</span>${filled(email)}</div>
      </div>`
  }

  function generateTA7(data: any): void {
    const sections: any[] = data?.sections ?? []
    const prop = data?.property ?? {}
    const passport = data?.passport ?? {}

    const leasehold = sections.find((s: any) => s.key === 'leasehold')
    const fa = (keyword: string, ...more: string[]) =>
      findAnswer(sections, 'leasehold', keyword, ...more)

    const sellerName = passport.addressLine1
      ? ''
      : (fa('seller') || fa('owner') || fa('name'))
    const address = prop.addressLine1 || passport.addressLine1 || ''
    const postcode = prop.postcode || passport.postcode || ''
    const uprn = prop.uprn || ''

    // Leasehold-specific answers
    const landlordName    = fa('landlord', 'name') || fa('landlord')
    const landlordAddress = fa('landlord', 'address')
    const landlordEmail   = fa('landlord', 'email')
    const mgmtAgentName   = fa('managing agent', 'name') || fa('managing agent')
    const mgmtAgentAddr   = fa('managing agent', 'address')
    const mgmtAgentEmail  = fa('managing agent', 'email')
    const groundRent      = fa('ground rent')
    const serviceCharge   = fa('service charge')
    const leaseYears      = fa('lease', 'years') || fa('remaining', 'lease') || fa('lease term')
    const leaseStart      = fa('lease', 'start') || fa('lease', 'granted')
    const buildingInsure  = fa('building insurance') || fa('buildings insurance')
    const lastDecorated   = fa('decorated') || fa('decoration')
    const managingAgentInsure = fa('managing agent', 'insurance')
    const groundRentCollected = fa('ground rent', 'collected')
    const ownsFrehold     = fa('freehold', 'own') || fa('own', 'freehold')
    const companyDissolved = fa('dissolved') || fa('struck off')
    const serviceChallenge = fa('challenged', 'service charge') || fa('challenge')
    const serviceIssues   = fa('issues', 'service charge')
    const noticeFromLandlord = fa('notice', 'landlord', 'sell') || fa('notice from landlord')
    const otherNotice     = fa('notice', 'building') || fa('notice')
    const enfranchise1    = fa('enfranchisement') || fa('buy the freehold') || fa('extended lease')
    const alterations     = fa('alteration') || fa('altered')
    const alterationConsent = fa('consent', 'alteration') || fa('landlord', 'consent')
    const complaints      = fa('complaint') || fa('complaints')

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>TA7 Leasehold Information Form</title>
<style>${css()}</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header-bar">
    <div>
      <h1>TA7 Law Society Leasehold Information Form</h1>
      <div class="subtitle">(5th edition) (2025) &mdash; Pre-filled from Property Passport</div>
    </div>
    <div class="logo-area">www.lawsociety.org.uk</div>
  </div>

  <!-- S1: Property & Seller -->
  <h2><span class="section-num">1</span> Property and seller details</h2>
  <table>
    <tr><td class="label">Address of the property</td><td>${filled(address)}</td></tr>
    <tr><td class="label">Postcode</td><td>${filled(postcode)}</td></tr>
    <tr><td class="label">UPRN (if known)</td><td>${filled(uprn)}</td></tr>
    <tr><td class="label">Full name(s) of the seller(s)</td><td>${filled(sellerName) || blank()}</td></tr>
  </table>

  <!-- S2: Lease details -->
  <h2><span class="section-num">2</span> Lease details</h2>
  <table>
    <tr><td class="label">Original lease term</td><td>${filled(leaseStart)}</td></tr>
    <tr><td class="label">Approximate years remaining on lease</td><td>${filled(leaseYears)}</td></tr>
    <tr><td class="label">Ground rent (annual)</td><td>${filled(groundRent)}</td></tr>
    <tr><td class="label">Service charge (annual)</td><td>${filled(serviceCharge)}</td></tr>
    <tr><td class="label">Buildings insurance arranged by</td><td>${filled(buildingInsure)}</td></tr>
  </table>

  <!-- S3: Contact details -->
  <h2><span class="section-num">3</span> Contact details</h2>
  <p class="note">3.1 Please supply contact details, where known, for the following:</p>
  <div class="contact-grid">
    ${contactBlock('Landlord', landlordName, landlordAddress, landlordEmail)}
    ${contactBlock('Management company', mgmtAgentName, mgmtAgentAddr, mgmtAgentEmail)}
    ${contactBlock('Right to manage company')}
    ${contactBlock('Freeholder (if different from landlord)')}
    ${contactBlock('Head leaseholder (if applicable)')}
    ${contactBlock('Managing agent')}
  </div>

  <!-- S4: Management -->
  <h2><span class="section-num">4</span> Management</h2>
  <table>
    <tr>
      <td class="label">4.1 Is a managing agent appointed?</td>
      <td>${yesNo(mgmtAgentName, true)}<br><span class="note">If yes, details above in Section 3</span></td>
    </tr>
    <tr>
      <td class="label">4.2 Does managing agent arrange building insurance?</td>
      <td>${yesNo(managingAgentInsure, true)}</td>
    </tr>
    <tr>
      <td class="label">4.3 Is ground rent collected by the managing agent?</td>
      <td>${yesNo(groundRentCollected, true)}</td>
    </tr>
    <tr>
      <td class="label">4.4 Does the seller own the freehold / headlease / management company?</td>
      <td>${yesNo(ownsFrehold)}</td>
    </tr>
    <tr>
      <td class="label">4.5 Is any management company dissolved or struck off?</td>
      <td>${yesNo(companyDissolved, true)}</td>
    </tr>
  </table>

  <!-- S5: Maintenance & service charges -->
  <h2><span class="section-num">5</span> Maintenance and service charges</h2>
  <table>
    <tr>
      <td class="label">5.1 Year outside of building last decorated</td>
      <td>${filled(lastDecorated) || blank('80px')}</td>
    </tr>
    <tr>
      <td class="label">5.2 Year communal parts last decorated</td>
      <td>${blank('80px')}</td>
    </tr>
    <tr>
      <td class="label">5.3 Do you contribute to building maintenance costs?</td>
      <td>${yesNo(serviceCharge)}</td>
    </tr>
    <tr>
      <td class="label">5.4 Any anticipated major expense in next 3 years?</td>
      <td>${yesNo(null)}&nbsp;&nbsp;&nbsp;${blank()}</td>
    </tr>
    <tr>
      <td class="label">5.5 Have you challenged the service charge in last 3 years?</td>
      <td>${yesNo(serviceChallenge)}<br>${serviceChallenge ? `<span class="filled">${esc(serviceChallenge)}</span>` : ''}</td>
    </tr>
    <tr>
      <td class="label">5.6 Any issues with service charges / management in last 3 years?</td>
      <td>${yesNo(serviceIssues)}<br>${serviceIssues ? `<span class="filled">${esc(serviceIssues)}</span>` : ''}</td>
    </tr>
  </table>

  <!-- S6: Notices -->
  <h2><span class="section-num">6</span> Notices</h2>
  <table>
    <tr>
      <td class="label">6.1 Notice that landlord wants to sell the building?</td>
      <td>${yesNo(noticeFromLandlord)}</td>
    </tr>
    <tr>
      <td class="label">6.2 Any other notices about the building?</td>
      <td>${yesNo(otherNotice)}<br>${otherNotice ? `<span class="filled">${esc(otherNotice)}</span>` : ''}</td>
    </tr>
  </table>

  <!-- S7: Enfranchisement -->
  <h2><span class="section-num">7</span> Enfranchisement</h2>
  <table>
    <tr>
      <td class="label">7.1 Notice served to buy freehold or extend lease?</td>
      <td>${yesNo(enfranchise1)}</td>
    </tr>
    <tr>
      <td class="label">7.2 Collective freehold purchase notice?</td>
      <td>${cb(false, 'Yes')}&nbsp;&nbsp;${cb(true, 'No')}&nbsp;&nbsp;${cb(false, 'Not known')}</td>
    </tr>
    <tr>
      <td class="label">7.3 Any response to notices in 7.1 / 7.2?</td>
      <td>${cb(false, 'Yes')}&nbsp;&nbsp;${cb(true, 'No')}&nbsp;&nbsp;${cb(false, 'Not known')}</td>
    </tr>
  </table>

  <!-- S8: Consents -->
  <h2><span class="section-num">8</span> Consents</h2>
  <table>
    <tr>
      <td class="label">8.1 Any changes to the terms of the lease?</td>
      <td>${yesNo(null)}</td>
    </tr>
    <tr>
      <td class="label">8.2 Any formal or informal consents given by landlord?</td>
      <td>${yesNo(alterationConsent)}</td>
    </tr>
  </table>

  <!-- S9: Alterations -->
  <h2><span class="section-num">9</span> Alterations</h2>
  <table>
    <tr>
      <td class="label">9.1 Any alterations since lease originally granted?</td>
      <td>${yesNo(alterations)}</td>
    </tr>
    <tr>
      <td class="label">9.2 Details of alterations</td>
      <td>${filled(alterations) || blank()}</td>
    </tr>
    <tr>
      <td class="label">9.3 Landlord's consent obtained for alterations?</td>
      <td>${yesNo(alterationConsent)}</td>
    </tr>
  </table>

  <!-- S10: Complaints -->
  <h2><span class="section-num">10</span> Complaints</h2>
  <table>
    <tr>
      <td class="label">10.1 Complaint received from landlord / management / neighbour?</td>
      <td>${yesNo(complaints)}<br>${complaints ? `<span class="filled">${esc(complaints)}</span>` : ''}</td>
    </tr>
    <tr>
      <td class="label">10.2 Complaint made to / about landlord / management / neighbour?</td>
      <td>${yesNo(null)}</td>
    </tr>
  </table>

  <!-- S11: Building Safety -->
  <h2><span class="section-num">11</span> Building safety for blocks of flats</h2>
  <p class="note">Complete only if the property is a flat in a block. For houses, continue to section 12.</p>
  <table>
    <tr><td class="label">11.1 Has the landlord issued a landlord's certificate?</td><td>${yesNo(null)}</td></tr>
    <tr><td class="label">11.2 Have you completed a leaseholder deed of certificate?</td><td>${yesNo(null)}</td></tr>
    <tr><td class="label">11.3 Are you a qualifying leaseholder?</td><td>${yesNo(null)}</td></tr>
    <tr><td class="label">11.4 Is the building a higher-risk building (over 18m / 7 storeys)?</td><td>${yesNo(null)}</td></tr>
    <tr><td class="label">11.5 Building safety remediation fund contribution?</td><td>${yesNo(null)}</td></tr>
    <tr><td class="label">11.6 Any service charge items relating to Building Safety Act?</td><td>${yesNo(null)}</td></tr>
  </table>

  <!-- S12: Seller certification -->
  <h2><span class="section-num">12</span> Seller's certification</h2>
  <p class="note">The seller must sign below to confirm the accuracy of this form.</p>
  <table>
    <tr>
      <td class="label">Signature of seller(s)</td>
      <td>${blank('300px')}</td>
    </tr>
    <tr>
      <td class="label">Date</td>
      <td>${blank('160px')}</td>
    </tr>
  </table>

  <div class="footer">
    <span>TA7 Law Society (5th edition) &mdash; Pre-filled from Property Passport &mdash; ${esc(new Date().toLocaleDateString('en-GB'))}</span>
    <span>Not legal advice. For solicitor use only.</span>
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

  return { generateTA7 }
}
