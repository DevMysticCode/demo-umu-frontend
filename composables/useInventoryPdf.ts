/**
 * useInventoryPdf
 * Generates a print-ready HTML "Inventory & Schedule of Condition" report -
 * the room-by-room record, evidence photos and (once collected) both
 * signatures - so a landlord has a real downloadable PDF to send a tenant
 * for signature outside the app, alongside the in-app magic-link e-sign
 * flow. Same print-to-PDF pattern as useTA6Pdf/useTA7Pdf/useFixturesFittingsPdf.
 */
export function useInventoryPdf() {
  const { printHtmlDocument } = usePrintDocument()

  function esc(v: any): string {
    if (v == null) return ''
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  const TYPE_LABELS: Record<string, string> = {
    checkin: 'Check-in',
    interim: 'Interim inspection',
    checkout: 'Check-out',
  }
  const FURNISHING_LABELS: Record<string, string> = {
    furnished: 'Furnished',
    part: 'Part-furnished',
    unfurnished: 'Unfurnished',
  }

  function css(): string {
    return `
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; color: #000; margin: 0; }
      .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 16mm 18mm; }
      @media print { .page { padding: 12mm 14mm 16mm; } }
      h1 { font-size: 15pt; font-weight: 700; margin: 0 0 3px; }
      h2 { font-size: 10.5pt; font-weight: 700; background: #00a19a; color: #fff; padding: 5px 8px; margin: 16px 0 6px; }
      .subtitle { font-size: 8.5pt; color: #555; margin-bottom: 12px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 9pt; }
      td, th { border: 1px solid #ccc; padding: 3px 6px; vertical-align: middle; }
      th { background: #dcefee; font-weight: 700; font-size: 8.5pt; text-align: left; }
      .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #00a19a; padding-bottom: 8px; margin-bottom: 12px; }
      .info-table td { border: 1px solid #ccc; padding: 4px 8px; }
      .info-label { font-weight: 600; background: #f5f5f5; width: 30%; }
      .room-item { border: 1px solid #e2e2e2; border-radius: 4px; padding: 6px 9px; margin-bottom: 5px; }
      .room-item-n { font-weight: 700; font-size: 9pt; }
      .room-item-tags { margin-top: 2px; }
      .tag { display: inline-block; font-size: 7.5pt; font-weight: 700; text-transform: capitalize; background: #eef7f6; color: #00726c; padding: 2px 7px; border-radius: 20px; margin-right: 5px; }
      .room-item-note { font-size: 8.3pt; color: #555; margin-top: 3px; font-style: italic; }
      .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 4px; }
      .photo-grid img { width: 100%; height: 32mm; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; }
      .sign-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 10px; }
      .sign-box { border: 1px solid #ccc; border-radius: 4px; padding: 8px 10px; min-height: 32mm; }
      .sign-box-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: #888; }
      .sign-box img { max-width: 100%; max-height: 20mm; margin-top: 6px; display: block; }
      .sign-box .name { font-weight: 700; font-size: 9pt; margin-top: 6px; }
      .sign-box .date { font-size: 8pt; color: #666; }
      .sign-box .pending { color: #999; font-size: 8.5pt; margin-top: 10px; }
      .footer { font-size: 7.5pt; color: #777; border-top: 1px solid #ccc; margin-top: 16px; padding-top: 5px; display: flex; justify-content: space-between; }
    `
  }

  function signBlock(label: string, entry?: { name?: string; signatureDataUrl?: string; signedAt?: string }): string {
    if (!entry) {
      return `<div class="sign-box"><div class="sign-box-label">${esc(label)}</div><div class="pending">Not yet signed</div></div>`
    }
    return `<div class="sign-box">
      <div class="sign-box-label">${esc(label)}</div>
      ${entry.signatureDataUrl ? `<img src="${entry.signatureDataUrl}" alt="signature" />` : ''}
      <div class="name">${esc(entry.name)}</div>
      <div class="date">${entry.signedAt ? esc(new Date(entry.signedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })) : ''}</div>
    </div>`
  }

  function generateInventoryPdf(data: {
    propertyAddress: string
    record: {
      type?: string
      completedAt?: string
      furnishing?: string
      tenantName?: string
      rooms: { name: string; items: { name: string; condition: string; cleanliness: string; note?: string }[] }[]
      audit?: { landlord?: any; tenant?: any }
    }
    photos?: { name: string; fileUrl: string }[]
  }): void {
    const { propertyAddress, record, photos = [] } = data
    const typeLabel = TYPE_LABELS[record.type ?? ''] ?? record.type ?? 'Check-in'
    const furnishingLabel = FURNISHING_LABELS[record.furnishing ?? ''] ?? record.furnishing ?? '-'

    const roomsHtml = (record.rooms ?? [])
      .map((room) => {
        const items = (room.items ?? [])
          .filter((i) => i.condition || i.cleanliness || i.note)
          .map(
            (item) => `
          <div class="room-item">
            <div class="room-item-n">${esc(item.name)}</div>
            <div class="room-item-tags">
              ${item.condition ? `<span class="tag">${esc(item.condition)}</span>` : ''}
              ${item.cleanliness ? `<span class="tag">${esc(item.cleanliness)}</span>` : ''}
            </div>
            ${item.note ? `<div class="room-item-note">"${esc(item.note)}"</div>` : ''}
          </div>`,
          )
          .join('')
        if (!items) return ''
        return `<h2>${esc(room.name)}</h2>${items}`
      })
      .join('')

    const photosHtml = photos.length
      ? `<h2>Evidence photos</h2><div class="photo-grid">${photos
          .map((p) => `<img src="${esc(p.fileUrl)}" alt="${esc(p.name)}" />`)
          .join('')}</div>`
      : ''

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Inventory &amp; Schedule of Condition</title>
<style>${css()}</style>
</head>
<body>
<div class="page">

  <div class="header-bar">
    <div>
      <h1>Inventory &amp; Schedule of Condition</h1>
      <div class="subtitle">Generated by umovingu &mdash; a room-by-room record for deposit-dispute evidence</div>
    </div>
  </div>

  <table class="info-table" style="margin-bottom:14px">
    <tr>
      <td class="info-label">Property address</td>
      <td colspan="3">${esc(propertyAddress)}</td>
    </tr>
    <tr>
      <td class="info-label">Report type</td>
      <td>${esc(typeLabel)}</td>
      <td class="info-label">Furnishing</td>
      <td>${esc(furnishingLabel)}</td>
    </tr>
    <tr>
      <td class="info-label">Tenant</td>
      <td>${esc(record.tenantName) || '-'}</td>
      <td class="info-label">Completed</td>
      <td>${record.completedAt ? esc(new Date(record.completedAt).toLocaleDateString('en-GB')) : '-'}</td>
    </tr>
  </table>

  ${roomsHtml || '<p style="color:#888;font-size:9pt">No condition issues recorded - every item was in good, clean condition.</p>'}

  ${photosHtml}

  <h2>Signatures</h2>
  <div class="sign-grid">
    ${signBlock('Landlord', record.audit?.landlord)}
    ${signBlock('Tenant', record.audit?.tenant)}
  </div>

  <div class="footer">
    <span>Inventory &amp; Schedule of Condition &mdash; ${esc(new Date().toLocaleDateString('en-GB'))}</span>
    <span>umovingu</span>
  </div>

</div>
</body>
</html>`

    printHtmlDocument(html, 'Pop-ups are blocked. Please allow pop-ups for this site to download the inventory PDF.')
  }

  return { generateInventoryPdf }
}
