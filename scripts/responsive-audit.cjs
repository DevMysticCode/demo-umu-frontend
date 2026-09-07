#!/usr/bin/env node
/**
 * Responsive overflow audit.
 *
 * Loads a curated list of high-traffic pages at several narrow phone
 * widths and flags any DOM element whose box extends past the viewport
 * edge — the exact failure mode behind reports like "icon overlapping
 * text" or "screen cut off on small phones" (see the fixes this caught:
 * V6ScoreView.vue's score-strip cards, and the html/body overflow guard
 * in assets/css/main.css that this script exists to keep honest).
 *
 * Run it whenever a new screen ships, and periodically against the full
 * list — it's cheap (a few seconds per page/width) and it's the fastest
 * way to catch the next one of these before a screenshot does.
 *
 * Usage:
 *   node scripts/responsive-audit.cjs
 *   BASE_URL=http://localhost:3001 TOKEN=<jwt> node scripts/responsive-audit.cjs --widths=320,360,375,390 --screenshot
 *
 * TOKEN is only needed for pages behind auth middleware (most of them) —
 * without it those pages are skipped rather than false-failed. Mint one
 * from the backend directory:
 *   node -e "require('dotenv').config(); const jwt=require('jsonwebtoken'); \
 *     console.log(jwt.sign({sub:'<a real user id>', email:'x@x.com'}, process.env.JWT_SECRET, {expiresIn:'4h'}))"
 *
 * Requires `npx playwright install chromium` once (playwright itself is
 * a devDependency already).
 */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const TOKEN = process.env.TOKEN || ''
const args = process.argv.slice(2)
const widths = (args.find((a) => a.startsWith('--widths='))?.split('=')[1] || '320,360,375')
  .split(',')
  .map(Number)
const doScreenshot = args.includes('--screenshot')
const outDir = path.join(__dirname, '..', '.responsive-audit')
if (doScreenshot && !fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

// Highest-traffic screens first — extend this list as new hot paths ship.
// `auth: true` pages are skipped when no TOKEN is supplied rather than
// reported as failures (an auth-redirect isn't an overflow bug).
const PAGES = [
  { path: '/dashboard', label: 'dashboard', auth: true },
  { path: '/discover', label: 'discover', auth: true },
  { path: '/explore', label: 'explore', auth: true },
  { path: '/property/6d531c65-96fa-4882-b7dc-d1b4cc30fb01', label: 'property-detail', auth: true },
  { path: '/homescore', label: 'homescore-search', auth: false },
  { path: '/homescore/6d531c65-96fa-4882-b7dc-d1b4cc30fb01', label: 'homescore-result', auth: true },
  { path: '/homescore/costs/6d531c65-96fa-4882-b7dc-d1b4cc30fb01', label: 'homescore-costs', auth: true },
  { path: '/passport/collections', label: 'passport-collections', auth: true },
  { path: '/profile', label: 'profile', auth: true },
  { path: '/profile/saved-properties', label: 'saved-properties', auth: true },
  { path: '/profile/watched-properties', label: 'watched-properties', auth: true },
  { path: '/onboarding/welcome', label: 'onboarding-welcome', auth: true },
  { path: '/onboarding/preferences', label: 'onboarding-preferences', auth: false },
  { path: '/buyer-profile', label: 'buyer-profile', auth: true },
  { path: '/buyer-profile/build', label: 'buyer-profile-build', auth: true },
]

async function checkPage(browser, def, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  try {
    if (def.auth && TOKEN) {
      await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.evaluate((tok) => localStorage.setItem('token', tok), TOKEN)
    }
    await page.goto(BASE_URL + def.path, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(2500)

    const result = await page.evaluate(() => {
      const winWidth = window.innerWidth
      const offenders = []
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.width <= 2) return
        // Nuxt's own page-transition loading bar animates in via a large
        // negative offset by design (it slides across from off-screen) -
        // not a layout bug, just how CSS progress-bar animations work.
        const cls = (el.className || '').toString()
        if (/nuxt-loader-bar|loading-indicator/.test(cls)) return
        // 12px tolerance — filters out harmless decorative bleed (a glow
        // ring, a drop-shadow's blur radius, a spotlight halo a few px
        // past its target) without hiding a real overflow, which in
        // practice runs from dozens to hundreds of px.
        const TOLERANCE = 12
        if (r.right > winWidth + TOLERANCE || r.left < -TOLERANCE) {
          // Not a bug: a horizontally-scrollable strip (tab bar, filter
          // chips, a carousel) is SUPPOSED to have content extending past
          // its own box — that's what makes it scrollable, and a peeking
          // next item is a deliberate "there's more" affordance. Walk up
          // for an ancestor with overflow-x auto/scroll and skip if found.
          let node = el.parentElement
          let insideScroller = false
          while (node) {
            const ov = getComputedStyle(node).overflowX
            if (ov === 'auto' || ov === 'scroll') {
              insideScroller = true
              break
            }
            node = node.parentElement
          }
          if (insideScroller) return
          offenders.push({
            tag: el.tagName,
            cls: (el.className || '').toString().slice(0, 80),
            left: Math.round(r.left),
            right: Math.round(r.right),
          })
        }
      })
      return {
        scrollWidth: document.documentElement.scrollWidth,
        winWidth,
        offenders: offenders.slice(0, 6),
      }
    })

    if (doScreenshot && (result.offenders.length || errors.length)) {
      await page.screenshot({ path: path.join(outDir, `${def.label}-${width}.png`), fullPage: false })
    }

    return { ...result, errors }
  } catch (e) {
    return { error: e.message, offenders: [], errors }
  } finally {
    await page.close()
  }
}

;(async () => {
  const browser = await chromium.launch()
  let failCount = 0
  for (const width of widths) {
    console.log(`\n=== width ${width}px ===`)
    for (const def of PAGES) {
      if (def.auth && !TOKEN) {
        console.log(`  [skip] ${def.label} (needs TOKEN)`)
        continue
      }
      const r = await checkPage(browser, def, width)
      if (r.error) {
        console.log(`  [ERROR] ${def.label}: ${r.error}`)
        failCount++
        continue
      }
      const bad = r.offenders.length > 0
      const tag = bad ? 'FAIL' : 'ok'
      console.log(
        `  [${tag}] ${def.label} - scrollWidth=${r.scrollWidth} winWidth=${r.winWidth}${bad ? ` offenders=${r.offenders.length}` : ''}`,
      )
      if (bad) {
        failCount++
        for (const o of r.offenders) {
          console.log(`      <${o.tag.toLowerCase()} class="${o.cls}"> left=${o.left} right=${o.right}`)
        }
      }
      if (r.errors.length) {
        failCount++
        for (const e of r.errors) console.log(`      JS error: ${e.slice(0, 140)}`)
      }
    }
  }
  await browser.close()
  console.log(`\n${failCount === 0 ? 'All clean.' : failCount + ' issue(s) found.'}`)
  process.exit(failCount === 0 ? 0 : 1)
})()
