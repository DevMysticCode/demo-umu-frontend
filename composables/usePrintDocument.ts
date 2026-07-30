// Shared "print a generated document" helper for the TA6/TA7/TA10
// composables. All three used to open a blank popup window, write the
// generated HTML into it, and call print() there — either directly or via
// a short setTimeout.
//
// Two problems on Capacitor's native iOS/Android WebView:
//   1. window.open() has no real "new tab" to open into inside an embedded
//      WKWebView/WebView — it can silently no-op, or (depending on the
//      app's link-handling config) kick the user out to the system
//      browser instead of showing the print preview in-app.
//   2. Any print()/print()-adjacent call made from inside a setTimeout is
//      outside the synchronous user-gesture call stack WebKit requires —
//      same class of bug already documented for the Persona popup in
//      claim/[id].vue and fixed for the buyer-profile PDF download.
//
// On native, this skips window.open() entirely: the generated document is
// injected into a hidden container on the CURRENT page, a @media print
// rule hides everything else, and window.print() is called synchronously
// inside the click handler. Web/desktop keeps the original popup — that
// path is confirmed working (the user's own report: "works when opened
// through the demo link").
export function usePrintDocument() {
  function printHtmlDocument(html: string, blockedMessage = 'Pop-ups are blocked. Please allow pop-ups for this site.') {
    const isNative =
      typeof window !== 'undefined' &&
      // Lazy, dependency-free native check — avoids importing
      // @capacitor/core into composables that otherwise don't need it.
      !!(window as any).Capacitor?.isNativePlatform?.()

    if (isNative) {
      let container = document.getElementById('__umu_print_target')
      if (!container) {
        container = document.createElement('div')
        container.id = '__umu_print_target'
        container.style.display = 'none'
        document.body.appendChild(container)
      }
      container.innerHTML = html
      if (!document.getElementById('__umu_print_style')) {
        const style = document.createElement('style')
        style.id = '__umu_print_style'
        style.textContent = `
          @media print {
            body > *:not(#__umu_print_target) { display: none !important; }
            #__umu_print_target { display: block !important; }
          }
        `
        document.head.appendChild(style)
      }
      window.print()
      return
    }

    const win = window.open('', '_blank', 'width=960,height=800,scrollbars=yes,resizable=yes')
    if (!win) {
      alert(blockedMessage)
      return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
  }

  return { printHtmlDocument }
}
