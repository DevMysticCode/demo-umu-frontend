/**
 * useInventoryPdf
 * Generates a professional "Inventory & Schedule of Condition" report as
 * a REAL downloadable PDF - modelled on the industry-standard NRLA /
 * Inventory Hive check-in report layout the client shared: a cover sheet,
 * a glossary of the condition/cleanliness scale, a room-by-room general
 * overview, a detailed numbered item table per room, and per-room photo
 * pages where every photo sits under the item it belongs to with a
 * reference number (1.2.1, 1.2.2, ...). Branded to UMovingU.
 */
export function useInventoryPdf() {
  const { downloadPdf } = useDownloadablePdf()

  function esc(v: any): string {
    if (v == null) return ''
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
  const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
  const slug = (s: string) =>
    (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'

  const TYPE_LABELS: Record<string, string> = {
    checkin: 'Check-in Inventory',
    interim: 'Interim Inspection',
    checkout: 'Check-out Inventory',
  }
  const FURNISHING_LABELS: Record<string, string> = {
    furnished: 'Furnished',
    part: 'Part-furnished',
    unfurnished: 'Unfurnished',
  }

  // Plain-language expansion of the Good / Fair / Poor + Clean / Marked /
  // Dirty pickers used in the capture flow, so a tenant reading the PDF
  // knows exactly what each rating means (matches the sample's glossary).
  const COND_DESC: Record<string, string> = {
    good: 'Signs of slight wear only; generally lightly worn.',
    fair: 'Signs of age - frayed, small marks, minor discolouration.',
    poor: 'Extensive signs of wear and tear - stains, marks, tears or chips.',
  }
  const CLEAN_DESC: Record<string, string> = {
    clean: 'Cleaned and free of loose dirt.',
    marked: 'Some cleaning evident, but signs of dust or marks remain.',
    dirty: 'Not cleaned to standard - requires cleaning.',
  }

  function css(): string {
    return `
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; color: #14213d; margin: 0; }
      .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 15mm 15mm 16mm; }
      .break { page-break-before: always; }
      h1 { font-size: 17pt; font-weight: 800; margin: 0 0 4px; color: #0e2840; letter-spacing: -0.3px; }
      h2 { font-size: 10.5pt; font-weight: 800; background: #008a84; color: #fff; padding: 6px 10px; margin: 18px 0 8px; border-radius: 4px; letter-spacing: 0.02em; }
      h3 { font-size: 10pt; font-weight: 800; color: #0e2840; margin: 14px 0 6px; }
      p { margin: 0 0 7px; line-height: 1.5; }
      .muted { color: #6b7089; }
      .brand-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #008a84; padding-bottom: 10px; margin-bottom: 16px; }
      .brand-name { font-size: 13pt; font-weight: 900; color: #008a84; letter-spacing: 0.5px; }
      .brand-tag { font-size: 7.5pt; color: #6b7089; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 8.8pt; }
      td, th { border: 1px solid #cfd8dc; padding: 4px 7px; vertical-align: top; text-align: left; }
      th { background: #e4f3f2; font-weight: 800; font-size: 8pt; }
      .info-table td { border: 1px solid #cfd8dc; padding: 5px 9px; }
      .info-label { font-weight: 700; background: #f6f8f8; width: 26%; }
      .cover-summary { border: 1px solid #cfd8dc; border-radius: 6px; padding: 10px 14px; margin: 12px 0; background: #f9fbfb; }
      .cover-summary li { margin-bottom: 3px; font-size: 8.6pt; }
      .rating { display: inline-block; font-size: 7.6pt; font-weight: 800; text-transform: capitalize; padding: 2px 8px; border-radius: 20px; }
      .rating.good, .rating.clean { background: #e2f4ec; color: #12704f; }
      .rating.fair, .rating.marked { background: #fdf1dd; color: #9a6a12; }
      .rating.poor, .rating.dirty { background: #fbe6e2; color: #a5382a; }
      .rating.na { background: #eef0f3; color: #7b8794; }
      .item-desc { font-size: 8.4pt; line-height: 1.45; }
      .item-desc b { color: #0e2840; }
      .item-note { color: #6b7089; font-style: italic; margin-top: 3px; }
      .glossary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .glossary-grid dt { font-weight: 800; font-size: 8.6pt; margin-top: 6px; color: #0e2840; }
      .glossary-grid dd { margin: 0 0 2px; font-size: 8.3pt; color: #4a5568; }
      .photo-block { margin: 8px 0 14px; break-inside: avoid; }
      .photo-block-lbl { font-size: 8.6pt; font-weight: 800; color: #0e2840; margin-bottom: 5px; padding-bottom: 3px; border-bottom: 1px solid #e4f3f2; }
      .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .photo-cell { break-inside: avoid; }
      .photo-cell img { width: 100%; height: 40mm; object-fit: cover; border-radius: 4px; border: 1px solid #d7dde0; display: block; }
      .photo-ref { font-size: 7pt; color: #6b7089; margin-top: 2px; }
      .sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
      .sign-box { border: 1px solid #cfd8dc; border-radius: 6px; padding: 10px 12px; min-height: 34mm; }
      .sign-box-label { font-size: 7.5pt; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #7b8794; }
      .sign-box img { max-width: 100%; max-height: 20mm; margin-top: 8px; display: block; }
      .sign-box .name { font-weight: 800; font-size: 9pt; margin-top: 8px; }
      .sign-box .date { font-size: 8pt; color: #6b7089; }
      .sign-box .pending { color: #9aa5b1; font-size: 8.5pt; margin-top: 12px; }
      .footer { font-size: 7.3pt; color: #8b97a3; border-top: 1px solid #cfd8dc; margin-top: 18px; padding-top: 5px; display: flex; justify-content: space-between; }
      .disclaimer { font-size: 8pt; color: #4a5568; line-height: 1.5; }
      .disclaimer h3 { margin-top: 12px; }
    `
  }

  function ratingSpan(kind: 'condition' | 'cleanliness', val?: string): string {
    if (!val) return '<span class="rating na">Not recorded</span>'
    return `<span class="rating ${esc(val)}">${esc(cap(val))}</span>`
  }

  function signBlock(
    label: string,
    entry?: { name?: string; signatureDataUrl?: string; signedAt?: string },
  ): string {
    if (!entry) {
      return `<div class="sign-box"><div class="sign-box-label">${esc(label)}</div><div class="pending">Not yet signed</div></div>`
    }
    return `<div class="sign-box">
      <div class="sign-box-label">${esc(label)}</div>
      ${entry.signatureDataUrl ? `<img src="${entry.signatureDataUrl}" alt="signature" />` : ''}
      <div class="name">${esc(entry.name)}</div>
      <div class="date">${
        entry.signedAt
          ? esc(new Date(entry.signedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }))
          : ''
      }</div>
    </div>`
  }

  async function generateInventoryPdf(data: {
    propertyAddress: string
    record: {
      type?: string
      completedAt?: string
      furnishing?: string
      tenantName?: string
      moveInDate?: string
      preparedBy?: string
      rooms: {
        id?: string
        name: string
        items: { name: string; condition: string; cleanliness: string; note?: string }[]
      }[]
      audit?: { landlord?: any; tenant?: any }
    }
    photos?: { name: string; fileUrl: string }[]
    /** Per-room "general" photos, keyed by room id. */
    photosByRoom?: Record<string, { name: string; fileUrl: string }[]>
    /** Per-item photos, keyed `<roomId>::<item-slug>`. */
    photosByItem?: Record<string, { name: string; fileUrl: string }[]>
  }): Promise<void> {
    const {
      propertyAddress,
      record,
      photos = [],
      photosByRoom = {},
      photosByItem = {},
    } = data
    const typeLabel = TYPE_LABELS[record.type ?? ''] ?? record.type ?? 'Check-in Inventory'
    const furnishingLabel =
      FURNISHING_LABELS[record.furnishing ?? ''] ?? record.furnishing ?? '-'
    const preparedByLabel = record.preparedBy
      ? cap(record.preparedBy)
      : 'Landlord'
    const completedStr = record.completedAt
      ? new Date(record.completedAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-'
    const rooms = record.rooms ?? []

    // ── Cover ────────────────────────────────────────────────────────
    const coverHtml = `
      <div class="brand-bar">
        <div>
          <div class="brand-name">UMovingU</div>
          <div class="brand-tag">Property Passport &mdash; ${esc(typeLabel)} Report</div>
        </div>
        <div style="text-align:right;font-size:8pt;color:#6b7089">
          Prepared ${esc(completedStr)}
        </div>
      </div>
      <h1>${esc(typeLabel)} Report</h1>
      <p class="muted">${esc(propertyAddress)}</p>

      <table class="info-table" style="margin-top:14px">
        <tr>
          <td class="info-label">Property address</td>
          <td colspan="3">${esc(propertyAddress)}</td>
        </tr>
        <tr>
          <td class="info-label">Report type</td><td>${esc(typeLabel)}</td>
          <td class="info-label">Furnishing</td><td>${esc(furnishingLabel)}</td>
        </tr>
        <tr>
          <td class="info-label">Tenant name</td><td>${esc(record.tenantName) || '-'}</td>
          <td class="info-label">Tenancy start</td>
          <td>${record.moveInDate ? esc(new Date(record.moveInDate).toLocaleDateString('en-GB')) : '-'}</td>
        </tr>
        <tr>
          <td class="info-label">Prepared on behalf of</td><td>${esc(preparedByLabel)}</td>
          <td class="info-label">Property visit date</td><td>${esc(completedStr)}</td>
        </tr>
      </table>

      <div class="cover-summary">
        <b style="font-size:9pt">This report contains</b>
        <ul style="margin:6px 0 0;padding-left:18px">
          <li>A schedule of condition &amp; cleanliness for every room and its fixtures &amp; contents.</li>
          <li>Dated photographs, filed under the specific item each one shows.</li>
          <li>A glossary explaining every condition and cleanliness rating used.</li>
          <li>Declaration and check-out guidance for the tenant.</li>
        </ul>
      </div>
      <p class="muted" style="font-size:8pt">
        This is the agreed record of the property's condition at the start of the tenancy.
        At check-out the property will be compared against it. Note any discrepancies you
        do not agree with before signing &mdash; once signed, the report is taken as accepted.
      </p>
    `

    // ── Glossary ─────────────────────────────────────────────────────
    const glossaryHtml = `
      <div class="break"></div>
      <h2>Glossary of Terms</h2>
      <p class="muted" style="font-size:8.4pt">Every rating in this report means the following:</p>
      <div class="glossary-grid">
        <div>
          <div style="font-weight:800;color:#008a84;font-size:9pt">Condition</div>
          <dl>
            <dt>Good</dt><dd>${esc(COND_DESC.good)}</dd>
            <dt>Fair</dt><dd>${esc(COND_DESC.fair)}</dd>
            <dt>Poor</dt><dd>${esc(COND_DESC.poor)}</dd>
          </dl>
        </div>
        <div>
          <div style="font-weight:800;color:#008a84;font-size:9pt">Cleanliness</div>
          <dl>
            <dt>Clean</dt><dd>${esc(CLEAN_DESC.clean)}</dd>
            <dt>Marked</dt><dd>${esc(CLEAN_DESC.marked)}</dd>
            <dt>Dirty</dt><dd>${esc(CLEAN_DESC.dirty)}</dd>
          </dl>
        </div>
      </div>
      <p class="muted" style="font-size:8pt;margin-top:10px">
        "Fair wear and tear" is the reasonable use of the property over the passage of time.
        Soiling and damage are not fair wear and tear and may be chargeable at check-out.
      </p>
    `

    // ── General overview ─────────────────────────────────────────────
    const overviewRows = rooms
      .map((room) => {
        const items = (room.items ?? []).filter((i) => i.condition || i.cleanliness)
        const worstCond = ['poor', 'fair', 'good'].find((c) =>
          items.some((i) => i.condition === c),
        )
        const worstClean = ['dirty', 'marked', 'clean'].find((c) =>
          items.some((i) => i.cleanliness === c),
        )
        const photoCount =
          (photosByRoom[room.id ?? ''] ?? []).length +
          (room.items ?? []).reduce(
            (n, it) => n + (photosByItem[`${room.id}::${slug(it.name)}`] ?? []).length,
            0,
          )
        return `<tr>
          <td><b>${esc(room.name)}</b></td>
          <td>${items.length} item${items.length === 1 ? '' : 's'} recorded</td>
          <td>${ratingSpan('condition', worstCond)}</td>
          <td>${ratingSpan('cleanliness', worstClean)}</td>
          <td>${photoCount} photo${photoCount === 1 ? '' : 's'}</td>
        </tr>`
      })
      .join('')
    const overviewHtml = `
      <div class="break"></div>
      <h2>Schedule of Cleanliness &amp; Condition &mdash; General Overview</h2>
      <table>
        <tr><th>Room / space</th><th>Recorded</th><th>Condition</th><th>Cleanliness</th><th>Photos</th></tr>
        ${overviewRows || '<tr><td colspan="5" class="muted">No rooms recorded.</td></tr>'}
      </table>
    `

    // ── Per-room detail tables ───────────────────────────────────────
    const roomDetailHtml = rooms
      .map((room, ri) => {
        const num = ri + 1
        const rows = (room.items ?? [])
          .map((item, ii) => {
            const ic = ii + 1
            const nPhotos = (photosByItem[`${room.id}::${slug(item.name)}`] ?? []).length
            const desc = [
              item.condition
                ? `<b>Condition:</b> ${esc(COND_DESC[item.condition] ?? cap(item.condition))}`
                : '',
              item.cleanliness
                ? `<b>Cleanliness:</b> ${esc(CLEAN_DESC[item.cleanliness] ?? cap(item.cleanliness))}`
                : '',
            ]
              .filter(Boolean)
              .join('<br>')
            return `<tr>
              <td style="width:6%">${num}.${ic}</td>
              <td style="width:22%"><b>${esc(item.name)}</b></td>
              <td class="item-desc">${desc || '<span class="muted">Not recorded</span>'}${
                item.note ? `<div class="item-note">Note: ${esc(item.note)}</div>` : ''
              }</td>
              <td style="width:12%">${ratingSpan('condition', item.condition)}</td>
              <td style="width:12%">${ratingSpan('cleanliness', item.cleanliness)}</td>
              <td style="width:8%">${nPhotos}</td>
            </tr>`
          })
          .join('')
        return `
          <div class="break"></div>
          <h2>${num}. ${esc(room.name)} &mdash; Room Details</h2>
          <table>
            <tr><th>Ref</th><th>Item</th><th>Description</th><th>Condition</th><th>Cleanliness</th><th>Photos</th></tr>
            ${rows || '<tr><td colspan="6" class="muted">No items recorded.</td></tr>'}
          </table>
        `
      })
      .join('')

    // ── Per-room photo pages (grouped by item, with reference nos.) ──
    const photoPagesHtml = rooms
      .map((room, ri) => {
        const num = ri + 1
        const blocks: string[] = []

        const general = photosByRoom[room.id ?? ''] ?? []
        if (general.length) {
          blocks.push(`
            <div class="photo-block">
              <div class="photo-block-lbl">General / room</div>
              <div class="photo-grid">
                ${general
                  .map(
                    (p, pi) => `<div class="photo-cell">
                      <img src="${esc(p.fileUrl)}" alt="${esc(p.name)}" />
                      <div class="photo-ref">Ref ${num}.0.${pi + 1}</div>
                    </div>`,
                  )
                  .join('')}
              </div>
            </div>`)
        }

        ;(room.items ?? []).forEach((item, ii) => {
          const list = photosByItem[`${room.id}::${slug(item.name)}`] ?? []
          if (!list.length) return
          blocks.push(`
            <div class="photo-block">
              <div class="photo-block-lbl">${esc(item.name)}</div>
              <div class="photo-grid">
                ${list
                  .map(
                    (p, pi) => `<div class="photo-cell">
                      <img src="${esc(p.fileUrl)}" alt="${esc(p.name)}" />
                      <div class="photo-ref">Ref ${num}.${ii + 1}.${pi + 1}</div>
                    </div>`,
                  )
                  .join('')}
              </div>
            </div>`)
        })

        if (!blocks.length) return ''
        return `<div class="break"></div><h2>${num}. ${esc(room.name)} &mdash; Photos</h2>${blocks.join('')}`
      })
      .join('')

    // ── Loose evidence photos (not tied to a room/item) ──────────────
    const loosePhotosHtml = photos.length
      ? `<div class="break"></div><h2>Additional Evidence Photos</h2>
         <div class="photo-grid">
           ${photos
             .map(
               (p, pi) => `<div class="photo-cell">
                 <img src="${esc(p.fileUrl)}" alt="${esc(p.name)}" />
                 <div class="photo-ref">Ref E.${pi + 1}</div>
               </div>`,
             )
             .join('')}
         </div>`
      : ''

    // ── Declaration + disclaimer + guidance ─────────────────────────
    const declarationHtml = `
      <div class="break"></div>
      <h2>Declaration</h2>
      <p class="disclaimer">
        I confirm approval of the accuracy and contents of the information contained within this
        report and my responses where provided. I have read, understood and agree to the guidance
        below. Where smoke and carbon monoxide alarms are present, I confirm their test buttons
        were in working order at the start of the tenancy, and I understand it is my responsibility
        to test them and replace batteries during the tenancy, and to report any faulty alarm to
        the landlord or managing agent immediately.
      </p>
      <h2>Signatures</h2>
      <div class="sign-grid">
        ${signBlock('Landlord', record.audit?.landlord)}
        ${signBlock('Tenant', record.audit?.tenant)}
      </div>

      <h2>Guidance Notes to Tenants</h2>
      <div class="disclaimer">
        <h3>The check-out process</h3>
        <p>At the start of the tenancy, note any discrepancies you do not agree with (marks on
        walls, carpets, etc.). If no such notes are made, the report is taken as accepted. At the
        end of the tenancy the property is compared against this report, with reasonable
        allowance for fair wear and tear.</p>
        <h3>Cleaning</h3>
        <p>Tenants are generally liable for the property to be returned cleaned to the same
        standard as recorded here. Soiling is not fair wear and tear.</p>
        <h3>Soft furnishings &amp; flooring</h3>
        <p>Excessive discolouration, soiling, burns or tears to curtains, upholstery, carpets or
        hard floors may result in repair, cleaning or replacement costs.</p>
        <h3>Decoration</h3>
        <p>Get written permission before putting nails, pins or fixings into walls or ceilings, and
        avoid tape or tac. Additional marks are noted at check-out and repair costs may apply.</p>
        <h3>Gardens &amp; exterior</h3>
        <p>Unless agreed otherwise, the tenant is responsible for maintaining gardens, paths and
        driveways to the standard recorded here, allowing for the change in season.</p>
      </div>
    `

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(typeLabel)} Report</title>
<style>${css()}</style>
</head>
<body>
<div class="page">
  ${coverHtml}
  ${glossaryHtml}
  ${overviewHtml}
  ${roomDetailHtml}
  ${photoPagesHtml}
  ${loosePhotosHtml}
  ${declarationHtml}
  <div class="footer">
    <span>${esc(typeLabel)} Report &mdash; ${esc(propertyAddress)}</span>
    <span>Generated by UMovingU &middot; ${esc(new Date().toLocaleDateString('en-GB'))}</span>
  </div>
</div>
</body>
</html>`

    const addrSlug = (propertyAddress || 'Inventory')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
    await downloadPdf(html, `Inventory-${addrSlug}.pdf`)
  }

  return { generateInventoryPdf }
}
