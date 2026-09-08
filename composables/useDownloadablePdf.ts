/**
 * useDownloadablePdf
 *
 * Turns a generated HTML document (the same full "<!DOCTYPE html>..."
 * string useInventoryPdf/useTA6Pdf/etc. already build) into a REAL binary
 * PDF file the user actually gets to keep - client feedback: the existing
 * "download" button just opened a browser print dialog, which (a) isn't a
 * download at all, and (b) doesn't work inside the Capacitor native app,
 * where window.open()/print() can't produce a saved file.
 *
 * - Web: a real `<a download>` click on an in-memory Blob URL - an actual
 *   browser download, not a print dialog.
 * - Native (iOS/Android via Capacitor): `<a download>` isn't reliably
 *   supported inside a WKWebView/Android WebView, so the file is written
 *   to app storage via @capacitor/filesystem and handed to the OS share
 *   sheet via @capacitor/share, where "Save to Files"/"Save to Drive"
 *   etc. is one of the standard options - the documented Capacitor
 *   pattern for "let the user keep a generated file".
 */
export function useDownloadablePdf() {
  function isNative(): boolean {
    return typeof window !== 'undefined' && !!(window as any).Capacitor?.isNativePlatform?.()
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        // FileReader.readAsDataURL yields "data:<mime>;base64,<data>" -
        // Filesystem.writeFile wants just the base64 payload.
        resolve(result.slice(result.indexOf(',') + 1))
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  }

  async function saveNative(blob: Blob, filename: string): Promise<void> {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import('@capacitor/filesystem'),
      import('@capacitor/share'),
    ])
    const base64 = await blobToBase64(blob)
    const written = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
    })
    await Share.share({ title: filename, url: written.uri })
  }

  function saveWeb(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    // Give the browser a moment to actually start the download before
    // the blob URL is revoked.
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  function waitForImages(root: HTMLElement): Promise<void> {
    const imgs = Array.from(root.querySelectorAll('img'))
    return Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener('load', () => res(), { once: true })
              img.addEventListener('error', () => res(), { once: true })
            }),
      ),
    ).then(() => undefined)
  }

  /**
   * @param html a full HTML document string (as returned by the
   *   usePrintDocument-style generators - `<!DOCTYPE html>...`)
   * @param filename e.g. "Inventory-11-Woodfield-Road.pdf"
   */
  async function downloadPdf(html: string, filename: string): Promise<void> {
    if (typeof window === 'undefined') return

    // Render into a real element IN THIS document (not an iframe's) so
    // html2canvas can resolve the <style> block's rules against the same
    // document it's cloning from - cross-document capture is where an
    // earlier version of this lost all CSS. Positioned at (0,0) rather
    // than a large negative offset, which is what made an even earlier
    // version capture nothing at all; opacity keeps it invisible instead.
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;top:0;left:0;opacity:0.01;pointer-events:none;z-index:-1;'
    const style = document.createElement('style')
    style.textContent = parsed.querySelector('style')?.textContent ?? ''
    container.appendChild(style)
    const inner = document.createElement('div')
    inner.innerHTML = parsed.body.innerHTML
    container.appendChild(inner)
    document.body.appendChild(container)
    // The generators set min-height:297mm on .page so a printed/on-screen
    // preview always looks like a full sheet - for html2pdf's own
    // content-height-driven pagination that just adds a trailing blank
    // page whenever the real content is shorter than one A4 page.
    const pageEl = inner.querySelector('.page') as HTMLElement | null
    if (pageEl) pageEl.style.minHeight = 'auto'

    try {
      await waitForImages(container)
      const html2pdf = (await import('html2pdf.js')).default
      const blob: Blob = await html2pdf()
        .from(inner)
        .set({
          margin: 0,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .outputPdf('blob')

      if (isNative()) {
        await saveNative(blob, filename)
      } else {
        saveWeb(blob, filename)
      }
    } finally {
      container.remove()
    }
  }

  return { downloadPdf }
}
