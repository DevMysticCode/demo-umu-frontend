/**
 * usePassportPdf
 * Generates a professional, print-ready HTML document from buyer-view passport data
 * and opens it in a new window for preview / save-as-PDF.
 */
export function usePassportPdf() {
  // ─── Utilities ─────────────────────────────────────────────────────────────

  function esc(str: any): string {
    if (str == null) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function tryParseJson(val: any): any {
    if (typeof val !== 'string') return val
    const t = val.trim()
    if (t.startsWith('{') || t.startsWith('[')) {
      try { return JSON.parse(t) } catch {}
    }
    return val
  }

  function extractFilename(url: string): string {
    try { return decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'document') } catch { return 'document' }
  }

  function normaliseFileEntry(f: any): { url: string; name: string } | null {
    if (!f) return null
    if (typeof f === 'string' && f.trim()) return { url: f, name: extractFilename(f) }
    if (typeof f === 'object') {
      const url = f.url || f.fileUrl || ''
      const name = f.name || f.filename || (url ? extractFilename(url) : 'document')
      if (name) return { url, name }
    }
    return null
  }

  // ─── Answer extraction ──────────────────────────────────────────────────────

  function getSimpleAnswer(answer: any): string | null {
    if (!answer) return null
    if (answer.answerText) return answer.answerText
    const json = tryParseJson(answer.answerJson)
    if (!json) return null
    if (typeof json === 'string') return json
    if (typeof json === 'object' && !Array.isArray(json)) {
      if (typeof json.mainAnswer === 'string') return json.mainAnswer
      if (typeof json.radioAnswer === 'string') return json.radioAnswer
    }
    return null
  }

  function getCheckedValues(answer: any): string[] {
    if (!answer) return []
    const json = tryParseJson(answer.answerJson)
    if (Array.isArray(json)) return json
    if (json && typeof json === 'object') {
      const a = json.answers ?? json.mainAnswer
      if (Array.isArray(a)) return a
    }
    return []
  }

  function getPartValue(answer: any, partKey: string): any {
    if (!answer?.answerJson || typeof answer.answerJson !== 'object') return null
    const json = answer.answerJson as Record<string, any>
    if (partKey in json) return json[partKey]
    const main = json.mainAnswer
    if (main && typeof main === 'object' && partKey in main) return main[partKey]
    return null
  }

  function getOptionLabel(options: any[], value: string): string {
    if (!Array.isArray(options)) return value
    const opt = options.find((o: any) => o.value === value || o.label === value)
    return opt?.label ?? value
  }

  function extractNote(answer: any): string | null {
    if (!answer?.answerJson || typeof answer.answerJson !== 'object') return null
    const ai = (answer.answerJson as any).additionalInfo
    if (!ai) return null
    if (typeof ai === 'string' && ai.trim()) return ai.trim()
    if (typeof ai === 'object') {
      if (typeof ai.text === 'string' && ai.text.trim()) return ai.text.trim()
      const vals = Object.values(ai).filter((v): v is string => typeof v === 'string' && !!v.trim())
      if (vals.length) return vals[0]
    }
    return null
  }

  function getFiles(answer: any): Array<{ name: string; url: string }> {
    if (!answer) return []
    const files: Array<{ name: string; url: string }> = []
    if (answer.fileUrl) { const n = normaliseFileEntry(answer.fileUrl); if (n) files.push(n) }
    const json = tryParseJson(answer.answerJson)
    if (json && typeof json === 'object') {
      if (Array.isArray(json)) {
        for (const f of json) { const n = normaliseFileEntry(f); if (n) files.push(n) }
      } else {
        const uploaded = json.uploadedFiles
        if (Array.isArray(uploaded)) { for (const f of uploaded) { const n = normaliseFileEntry(f); if (n) files.push(n) } }
        const ai = json.additionalInfo
        if (ai?.files && Array.isArray(ai.files)) { for (const f of ai.files) { const n = normaliseFileEntry(f); if (n) files.push(n) } }
      }
    }
    return files
  }

  // ─── HTML renderers ─────────────────────────────────────────────────────────

  function renderOptionsList(options: any[], selectedValue: string | null, isCheckbox = false): string {
    if (!Array.isArray(options) || !options.length) return ''
    return '<div class="options-list">' +
      options.map(opt => {
        const isSelected = selectedValue === opt.value || selectedValue === opt.label
        const mark = isCheckbox
          ? (isSelected ? '&#9745;' : '&#9744;')
          : (isSelected ? '&#10003;' : '&#9675;')
        return `<div class="option${isSelected ? ' option--selected' : ''}">
          <span class="option-check">${mark}</span>
          <span class="option-label">${esc(opt.label)}</span>
        </div>`
      }).join('') +
      '</div>'
  }

  function renderFilesBlock(files: Array<{ name: string; url: string }>): string {
    if (!files.length) return ''
    return '<div class="files-list">' +
      files.map(f => `<div class="file-item">&#128196; ${esc(f.name)}</div>`).join('') +
      '</div>'
  }

  function renderPartTextUpload(rawVal: any): string {
    const parsed = tryParseJson(rawVal)
    let html = ''
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if (typeof parsed.text === 'string' && parsed.text.trim())
        html += `<div class="text-answer">${esc(parsed.text.trim())}</div>`
      const candidates = parsed.files ?? parsed.uploadedFiles ?? []
      if (Array.isArray(candidates)) {
        const files = candidates.map(normaliseFileEntry).filter(Boolean) as Array<{ name: string; url: string }>
        html += renderFilesBlock(files)
      }
    } else if (typeof parsed === 'string' && parsed.trim()) {
      html += `<div class="text-answer">${esc(parsed.trim())}</div>`
    }
    return html || '<p class="not-answered">No content provided</p>'
  }

  function renderQuestion(q: any, index: number, sectionKey: string): string {
    const isAnswered = !!q.answer
    const isFixtures = sectionKey === 'fixturesAndFittings'
    const title = q.question || (Array.isArray(q.parts) && q.parts[0]?.title) || `Question ${index}`
    const type = (q.type || '').toUpperCase()
    let answerHtml = ''

    if (!isAnswered) {
      answerHtml = '<p class="not-answered">Not yet answered by seller</p>'
    } else if (type === 'RADIO' || type === 'SELECT') {
      const selected = getSimpleAnswer(q.answer)
      if (Array.isArray(q.options) && q.options.length) {
        answerHtml = renderOptionsList(q.options, selected)
        const note = extractNote(q.answer)
        if (note) answerHtml += `<div class="answer-note"><strong>Seller's note:</strong> ${esc(note)}</div>`
      } else {
        answerHtml = selected ? `<div class="text-answer">${esc(selected)}</div>` : '<p class="not-answered">No answer recorded</p>'
      }

    } else if (type === 'CHECKBOX') {
      const checked = getCheckedValues(q.answer)
      if (Array.isArray(q.options) && q.options.length) {
        answerHtml = renderOptionsList(q.options, null, true).replace(
          /class="option"/g, (_, offset, str) => {
            // Not ideal but we'll re-implement inline for checkbox
            return 'class="option"'
          }
        )
        // Re-render properly for checkbox
        answerHtml = '<div class="options-list">' +
          q.options.map((opt: any) => {
            const isChecked = checked.includes(opt.value) || checked.includes(opt.label)
            return `<div class="option${isChecked ? ' option--selected' : ''}">
              <span class="option-check">${isChecked ? '&#9745;' : '&#9744;'}</span>
              <span class="option-label">${esc(opt.label)}</span>
            </div>`
          }).join('') +
          '</div>'
      } else if (checked.length) {
        answerHtml = checked.map(v => `<span class="chip">${esc(v)}</span>`).join(' ')
      }

    } else if (type === 'MULTIPART' && Array.isArray(q.parts)) {
      answerHtml = '<div class="multipart-list">'
      for (const part of q.parts) {
        const partType = (part.type || '').toLowerCase()
        // Skip currency companion parts — displayed inline under their radio parent
        if (Array.isArray(part.options) && part.options.every((o: any) => o.inputType === 'currency')) continue
        // Skip selling-date companion parts
        if (partType === 'date' && (part.partKey || '').includes('selling')) continue

        const rawVal = getPartValue(q.answer, part.partKey)
        let partBody = ''

        if (partType === 'radio' && Array.isArray(part.options)) {
          const parsed = tryParseJson(rawVal)
          const sel = typeof parsed === 'string' ? parsed : null
          partBody = renderOptionsList(part.options, sel)
          // Currency sub-value (fixtures asking price)
          if (isFixtures && Array.isArray(q.parts)) {
            for (const p of q.parts) {
              if (p.partKey === part.partKey) continue
              if (Array.isArray(p.options) && p.options.some((o: any) => o.inputType === 'currency')) {
                const currVal = getPartValue(q.answer, p.partKey)
                if (currVal != null && currVal !== '') {
                  partBody += `<div class="currency-badge">Asking price: &pound;${Number(currVal).toLocaleString('en-GB')}</div>`
                }
              }
            }
          }
        } else if (partType === 'text-upload' || partType === 'textupload' || partType === 'upload') {
          partBody = renderPartTextUpload(rawVal)
        } else if (partType === 'text' || partType === 'address') {
          const parsed = tryParseJson(rawVal)
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && ('text' in parsed || 'files' in parsed)) {
            partBody = renderPartTextUpload(rawVal)
          } else if (typeof parsed === 'string' && parsed.trim()) {
            partBody = `<div class="text-answer">${esc(parsed.trim())}</div>`
          } else if (parsed && typeof parsed === 'object') {
            // address-style object { line1, line2, city, postcode }
            const parts = Object.values(parsed).filter((v): v is string => typeof v === 'string' && !!v.trim())
            partBody = parts.length
              ? `<div class="text-answer">${parts.map(esc).join('<br>')}</div>`
              : '<p class="not-answered">No address provided</p>'
          }
        } else if (partType === 'date') {
          if (rawVal) {
            const d = new Date(rawVal)
            partBody = `<div class="text-answer">${isNaN(d.getTime()) ? esc(rawVal) : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>`
          }
        } else {
          if (rawVal != null && rawVal !== '') {
            partBody = `<div class="text-answer">${esc(String(rawVal))}</div>`
          }
        }

        if (!partBody) partBody = '<p class="not-answered">Not yet answered</p>'

        answerHtml += `<div class="part-row">
          ${part.title ? `<div class="part-title">${esc(part.title)}</div>` : ''}
          ${partBody}
        </div>`
      }
      answerHtml += '</div>'

    } else if (type === 'UPLOAD') {
      const files = getFiles(q.answer)
      answerHtml = files.length
        ? renderFilesBlock(files)
        : '<p class="not-answered">No document uploaded</p>'

    } else if (type === 'ADDRESS') {
      const json = q.answer.answerJson
      if (json && typeof json === 'object' && !Array.isArray(json)) {
        const parts = [json.line1, json.line2, json.town ?? json.city, json.county, json.postcode ?? json.postalCode].filter(Boolean)
        answerHtml = parts.length
          ? `<div class="text-answer">${parts.map(esc).join('<br>')}</div>`
          : '<p class="not-answered">No address provided</p>'
      } else {
        const val = getSimpleAnswer(q.answer)
        answerHtml = val ? `<div class="text-answer">${esc(val)}</div>` : '<p class="not-answered">No address provided</p>'
      }

    } else if (type === 'LIST') {
      const json = q.answer.answerJson
      let items: string[] = []
      if (Array.isArray(json)) items = json
      else if (json && typeof json === 'object') items = (json as any).items ?? (json as any).mainAnswer ?? []
      answerHtml = items.length
        ? '<ul class="answer-list">' + items.map((i: any) => `<li>${esc(String(i))}</li>`).join('') + '</ul>'
        : (getSimpleAnswer(q.answer) ? `<div class="text-answer">${esc(getSimpleAnswer(q.answer))}</div>` : '<p class="not-answered">No items listed</p>')

    } else if (type === 'BOUNDARIES') {
      const json = q.answer.answerJson
      if (json && typeof json === 'object') {
        const sides = [
          { key: 'front', label: 'Front' },
          { key: 'back', label: 'Back' },
          { key: 'left', label: 'Left' },
          { key: 'right', label: 'Right' },
        ]
        answerHtml = '<div class="boundary-grid">' +
          sides.map(s => `<div class="boundary-row">
            <span class="boundary-label">${s.label}</span>
            <span class="boundary-value">${(json as any)[s.key] ? esc((json as any)[s.key]) : '&mdash;'}</span>
          </div>`).join('') +
          '</div>'
      }

    } else if (type === 'FIELD_FORM' && Array.isArray(q.fields)) {
      const json = q.answer.answerJson
      const records: any[] = Array.isArray(json) ? json : (json ? [json] : [])
      answerHtml = records.filter(Boolean).map((record, ri) => {
        if (typeof record !== 'object') return `<div class="text-answer">${esc(String(record))}</div>`
        const rows = Object.entries(record)
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => {
            const field = (q.fields as any[]).find((f: any) => f.key === k)
            const label = field?.label || field?.placeholder || k
            return `<div class="field-row"><span class="field-key">${esc(label)}:</span> <span class="field-val">${esc(String(v))}</span></div>`
          })
        return `<div class="field-form${records.length > 1 ? ' field-form--multi' : ''}">
          ${records.length > 1 ? `<div class="field-record-num">Entry ${ri + 1}</div>` : ''}
          ${rows.join('')}
        </div>`
      }).join('')
      if (!answerHtml) answerHtml = '<p class="not-answered">No entries recorded</p>'

    } else {
      // Fallback: plain text + files
      const val = getSimpleAnswer(q.answer)
      const files = getFiles(q.answer)
      const note = extractNote(q.answer)
      answerHtml = val ? `<div class="text-answer">${esc(val)}</div>` : ''
      if (files.length) answerHtml += renderFilesBlock(files)
      if (note) answerHtml += `<div class="answer-note"><strong>Seller's note:</strong> ${esc(note)}</div>`
      if (!answerHtml) answerHtml = '<p class="not-answered">Answered</p>'
    }

    // Append files + note for non-MULTIPART types (if not already handled)
    if (!['MULTIPART', 'UPLOAD'].includes(type) && isAnswered) {
      const files = getFiles(q.answer)
      if (files.length && !answerHtml.includes('files-list')) answerHtml += renderFilesBlock(files)
    }

    return `
      <div class="question${!isAnswered ? ' question--unanswered' : ''}">
        <div class="question-header">
          <span class="question-num">Q${index}</span>
          <span class="question-title">${esc(title)}</span>
          <span class="question-badge ${isAnswered ? 'question-badge--answered' : 'question-badge--pending'}">
            ${isAnswered ? 'Answered' : 'Pending'}
          </span>
        </div>
        <div class="question-body">${answerHtml}</div>
      </div>`
  }

  // ─── CSS ────────────────────────────────────────────────────────────────────

  function buildCss(): string {
    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }

      @page { size: A4; margin: 18mm 14mm 24mm; }

      body {
        font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
        font-size: 10pt; color: #1a1a1a; line-height: 1.5; background: white;
      }

      /* ── Header ──────────────────────────────────────────────── */
      .doc-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        padding-bottom: 16px; margin-bottom: 20px;
        border-bottom: 2.5px solid #00a19a;
      }
      .doc-brand { font-size: 18pt; font-weight: 800; color: #00a19a; letter-spacing: -0.5px; }
      .doc-brand span { color: #1a1a1a; }
      .doc-tagline { font-size: 8pt; color: #888; margin-top: 3px; }
      .doc-meta { text-align: right; font-size: 7.5pt; color: #777; line-height: 1.7; }
      .doc-meta strong { color: #333; font-size: 8.5pt; }

      /* ── Property summary ─────────────────────────────────────── */
      .property-summary {
        background: #f0fffe; border: 1px solid #b2e4e1; border-radius: 8px;
        padding: 14px 18px; margin-bottom: 20px;
        display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;
      }
      .property-address { font-size: 13pt; font-weight: 700; color: #1a1a1a; margin-bottom: 3px; }
      .property-city { font-size: 9pt; color: #555; margin-bottom: 10px; }
      .property-details { display: flex; flex-wrap: wrap; gap: 8px; }
      .detail-chip {
        background: white; border: 1px solid #c8e6e4; border-radius: 5px;
        padding: 5px 10px; min-width: 80px;
      }
      .detail-chip-label { font-size: 6.5pt; color: #888; text-transform: uppercase; letter-spacing: 0.4px; }
      .detail-chip-value { font-size: 8.5pt; font-weight: 600; color: #1a1a1a; margin-top: 1px; }
      .summary-stats { text-align: right; white-space: nowrap; }
      .stat-number { font-size: 20pt; font-weight: 700; color: #00a19a; line-height: 1; }
      .stat-label { font-size: 7.5pt; color: #666; margin-top: 2px; }

      /* ── Progress bar ─────────────────────────────────────────── */
      .progress-wrap { margin-bottom: 24px; }
      .progress-label { font-size: 7.5pt; color: #666; margin-bottom: 5px; }
      .progress-bg { background: #e8e8e8; border-radius: 4px; height: 5px; }
      .progress-fill { background: linear-gradient(90deg, #00a19a, #00d4c8); border-radius: 4px; height: 5px; }
      .progress-text { font-size: 7.5pt; color: #666; margin-top: 4px; }

      /* ── Section ──────────────────────────────────────────────── */
      .section { margin-bottom: 28px; page-break-inside: avoid; }
      .section-header {
        background: #00a19a; color: white;
        padding: 9px 14px; border-radius: 6px 6px 0 0;
        page-break-after: avoid;
      }
      .section-title { font-size: 11pt; font-weight: 700; }
      .section-subtitle { font-size: 7.5pt; color: rgba(255,255,255,0.82); margin-top: 2px; }
      .section-body {
        border: 1px solid #c8e6e4; border-top: none;
        border-radius: 0 0 6px 6px; overflow: hidden;
      }

      /* ── Task ────────────────────────────────────────────────── */
      .task { padding: 12px 14px; border-bottom: 1px solid #eee; }
      .task:last-child { border-bottom: none; }
      .task-title { font-size: 9.5pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
      .task-desc { font-size: 7.5pt; color: #888; margin-bottom: 10px; }
      .questions-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }

      /* ── Question ────────────────────────────────────────────── */
      .question { border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; page-break-inside: avoid; }
      .question--unanswered { opacity: 0.7; }
      .question-header {
        display: flex; align-items: center; gap: 8px;
        padding: 7px 10px; background: #f7f9f9; border-bottom: 1px solid #e8e8e8;
      }
      .question-num { font-size: 7.5pt; font-weight: 700; color: #00a19a; min-width: 18px; }
      .question-title { font-size: 8.5pt; font-weight: 600; color: #1a1a1a; flex: 1; }
      .question-badge {
        font-size: 6.5pt; font-weight: 700; padding: 2px 7px; border-radius: 4px; white-space: nowrap;
      }
      .question-badge--answered { background: #e0f5f4; color: #00877f; }
      .question-badge--pending { background: #f3f3f3; color: #aaa; }
      .question-body { padding: 9px 10px; }

      /* ── Options ─────────────────────────────────────────────── */
      .options-list { display: flex; flex-direction: column; gap: 4px; }
      .option { display: flex; align-items: center; gap: 8px; padding: 4px 7px; border-radius: 4px; font-size: 8.5pt; }
      .option--selected { background: #e6f7f6; }
      .option-check { width: 14px; flex-shrink: 0; font-size: 10pt; }
      .option--selected .option-check { color: #00a19a; }
      .option--selected .option-label { color: #1a1a1a; font-weight: 600; }
      .option:not(.option--selected) .option-check { color: #ccc; }
      .option:not(.option--selected) .option-label { color: #999; }

      /* ── Text / list answers ─────────────────────────────────── */
      .text-answer { font-size: 8.5pt; color: #1a1a1a; padding: 4px 0; }
      .not-answered { font-size: 8pt; color: #bbb; font-style: italic; }
      .answer-list { padding-left: 16px; font-size: 8.5pt; color: #1a1a1a; }
      .answer-list li { padding: 2px 0; }
      .chip { display: inline-block; background: #e6f7f6; color: #00a19a; font-size: 7.5pt; font-weight: 600; padding: 2px 7px; border-radius: 4px; margin: 2px 2px 0 0; }

      /* ── Seller note ─────────────────────────────────────────── */
      .answer-note {
        background: #fffbeb; border-left: 3px solid #f59e0b;
        padding: 5px 9px; margin-top: 7px; font-size: 8pt; color: #555;
        border-radius: 0 4px 4px 0;
      }

      /* ── Files ───────────────────────────────────────────────── */
      .files-list { display: flex; flex-direction: column; gap: 3px; margin-top: 5px; }
      .file-item {
        font-size: 8pt; color: #555; padding: 4px 8px;
        background: #f9fafb; border: 1px solid #e8e8e8; border-radius: 4px;
      }

      /* ── Currency badge ──────────────────────────────────────── */
      .currency-badge {
        display: inline-block; font-size: 8pt; font-weight: 700;
        color: #00a19a; background: #e6f7f6; border-radius: 4px;
        padding: 2px 8px; margin-top: 5px;
      }

      /* ── Multipart ───────────────────────────────────────────── */
      .multipart-list { display: flex; flex-direction: column; gap: 6px; }
      .part-row { padding: 7px 9px; background: #f9fafb; border-radius: 5px; border: 1px solid #eee; }
      .part-title { font-size: 7pt; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 5px; }

      /* ── Boundary ────────────────────────────────────────────── */
      .boundary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .boundary-row { background: #f9fafb; border: 1px solid #e8e8e8; border-radius: 4px; padding: 6px 10px; }
      .boundary-label { font-size: 7.5pt; font-weight: 700; color: #555; display: block; margin-bottom: 2px; }
      .boundary-value { font-size: 8.5pt; color: #1a1a1a; }

      /* ── Field form ──────────────────────────────────────────── */
      .field-form { display: flex; flex-direction: column; gap: 3px; }
      .field-form--multi { border: 1px solid #e8e8e8; border-radius: 4px; padding: 8px; margin-bottom: 4px; }
      .field-record-num { font-size: 7.5pt; font-weight: 700; color: #888; margin-bottom: 4px; }
      .field-row { font-size: 8.5pt; padding: 2px 0; }
      .field-key { font-weight: 600; color: #555; margin-right: 4px; }
      .field-val { color: #1a1a1a; }

      /* ── Disclaimer ──────────────────────────────────────────── */
      .disclaimer {
        margin-top: 36px; padding: 12px 14px;
        background: #f9fafb; border: 1px solid #e4e4e4; border-radius: 6px;
        font-size: 7pt; color: #999; line-height: 1.7;
      }
      .disclaimer strong { color: #666; }

      /* ── Print footer ────────────────────────────────────────── */
      @media print {
        .no-print { display: none !important; }
      }
    `
  }

  // ─── Document builder ───────────────────────────────────────────────────────

  function buildHtml(passport: any, property: any, sections: any[]): string {
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

    // Count totals
    let totalQ = 0; let answeredQ = 0
    for (const s of sections) {
      for (const t of s.tasks ?? []) {
        for (const q of (t.questions ?? []).filter((q: any) => q.type !== 'NOTE')) {
          totalQ++
          if (q.answer) answeredQ++
        }
      }
    }
    const pct = totalQ > 0 ? Math.round(answeredQ / totalQ * 100) : 0

    // Property chips
    const prop = property
    const propChips = [
      prop?.propertyType ? { l: 'Type', v: prop.propertyType } : null,
      prop?.bedrooms ? { l: 'Bedrooms', v: String(prop.bedrooms) } : null,
      prop?.bathrooms ? { l: 'Bathrooms', v: String(prop.bathrooms) } : null,
      prop?.sqft ? { l: 'Floor area', v: `${prop.sqft.toLocaleString()} sqft` } : null,
      prop?.tenure ? { l: 'Tenure', v: prop.tenure } : null,
      prop?.epcRating ? { l: 'EPC Rating', v: prop.epcRating } : null,
      prop?.yearBuilt ? { l: 'Year built', v: String(prop.yearBuilt) } : null,
    ].filter(Boolean)

    // Sections
    const sectionsHtml = sections.map((section: any) => {
      const tasksHtml = (section.tasks ?? []).map((task: any) => {
        const visible = (task.questions ?? []).filter((q: any) => q.type !== 'NOTE')
        if (!visible.length) return ''
        let qIdx = 1
        const qs = visible.map((q: any) => renderQuestion(q, qIdx++, section.key)).join('')
        return `<div class="task">
          ${task.title ? `<div class="task-title">${esc(task.title)}</div>` : ''}
          ${task.description ? `<div class="task-desc">${esc(task.description)}</div>` : ''}
          <div class="questions-list">${qs}</div>
        </div>`
      }).join('')
      if (!tasksHtml.trim()) return ''
      return `<div class="section">
        <div class="section-header">
          <div class="section-title">${esc(section.title)}</div>
          ${section.subtitle ? `<div class="section-subtitle">${esc(section.subtitle)}</div>` : ''}
        </div>
        <div class="section-body">${tasksHtml}</div>
      </div>`
    }).join('')

    const cityLine = [prop?.city ?? prop?.county, prop?.postcode ?? passport.postcode].filter(Boolean).join(', ')

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Property Passport &mdash; ${esc(passport.addressLine1 || 'Property')}</title>
  <style>${buildCss()}</style>
</head>
<body>

  <!-- Header -->
  <div class="doc-header">
    <div>
      <div class="doc-brand">umu <span>Property Passport</span></div>
      <div class="doc-tagline">Official Property Information Document &mdash; Confidential</div>
    </div>
    <div class="doc-meta">
      <div><strong>Generated:</strong> ${esc(date)}</div>
      <div><strong>Passport ID:</strong> ${esc(passport.id)}</div>
      <div style="margin-top:5px; font-size:7pt; color:#bbb; line-height:1.6">
        Auto-generated by umu Property Passport.<br>
        For professional use only.
      </div>
    </div>
  </div>

  <!-- Property summary -->
  <div class="property-summary">
    <div style="flex:1">
      <div class="property-address">${esc(passport.addressLine1 || 'Property Address')}</div>
      ${cityLine ? `<div class="property-city">${esc(cityLine)}</div>` : ''}
      ${propChips.length ? `<div class="property-details">
        ${propChips.map((c: any) => `<div class="detail-chip">
          <div class="detail-chip-label">${esc(c.l)}</div>
          <div class="detail-chip-value">${esc(c.v)}</div>
        </div>`).join('')}
      </div>` : ''}
    </div>
    <div class="summary-stats">
      <div class="stat-number">${answeredQ}/${totalQ}</div>
      <div class="stat-label">Questions answered</div>
    </div>
  </div>

  <!-- Progress bar -->
  <div class="progress-wrap">
    <div class="progress-label">Passport Completion</div>
    <div class="progress-bg"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="progress-text">${answeredQ} of ${totalQ} questions answered &mdash; ${pct}% complete</div>
  </div>

  <!-- Sections -->
  ${sectionsHtml}

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>Important Notice:</strong> This Property Passport has been generated from information provided by the property seller and is intended as a summary for informational purposes only. The contents have not been independently verified. This document does not constitute legal, structural, or financial advice. Prospective buyers, solicitors, and other parties should conduct their own due diligence before relying on or acting upon any information contained herein. umu Property Passport and its affiliates accept no liability for any decisions made in reliance on this document.
  </div>

  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 400);
    });
  </script>
</body>
</html>`
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  function generatePdf(data: any) {
    if (!data) return
    const { passport, property, sections } = data
    const html = buildHtml(passport, property, sections ?? [])

    const win = window.open('', '_blank', 'width=960,height=800,scrollbars=yes,resizable=yes')
    if (!win) {
      alert('Pop-ups are blocked. Please allow pop-ups for this site to preview and download the PDF.')
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
  }

  return { generatePdf }
}
