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
// Known-good dynamic-route ids (test user 9f124d6c-...), so these load
// real data instead of a 404/empty state that would mask real bugs.
const PROPERTY_ID = '6d531c65-96fa-4882-b7dc-d1b4cc30fb01' // 3 Woodfield Road
const SELLER_PASSPORT_ID = 'f44b0b80-bf4d-4c37-8355-fd21dee4726d' // 11 Woodfield Road, in progress
const LANDLORD_PASSPORT_ID = '683933bc-acea-45ba-8c11-eb68c89d690f' // 77 Waveley Road

const PAGES = [
  // ── Core / highest-traffic ──────────────────────────────────────
  { path: '/dashboard', label: 'dashboard', auth: true },
  { path: '/discover', label: 'discover', auth: true },
  { path: '/explore', label: 'explore', auth: true },
  { path: `/property/${PROPERTY_ID}`, label: 'property-detail', auth: true },
  { path: `/property-full/${PROPERTY_ID}`, label: 'property-full', auth: true },
  { path: `/owner/${PROPERTY_ID}`, label: 'owner', auth: true },
  { path: `/contact/${PROPERTY_ID}`, label: 'contact', auth: true },
  { path: '/claim/index', label: 'claim-index', auth: true },
  { path: `/claim/${PROPERTY_ID}`, label: 'claim-property', auth: true },

  // ── HomeScore ────────────────────────────────────────────────────
  { path: '/homescore', label: 'homescore-search', auth: false },
  { path: `/homescore/${PROPERTY_ID}`, label: 'homescore-result', auth: true },
  { path: `/homescore/costs/${PROPERTY_ID}`, label: 'homescore-costs', auth: true },
  { path: `/homescore/street/${PROPERTY_ID}`, label: 'homescore-street', auth: true },
  { path: `/homescore/pathway/${PROPERTY_ID}`, label: 'homescore-pathway', auth: true },
  { path: `/homescore/passport/${PROPERTY_ID}`, label: 'homescore-passport', auth: true },

  // ── Passports ────────────────────────────────────────────────────
  { path: '/passport/collections', label: 'passport-collections', auth: true },
  { path: `/passport/${SELLER_PASSPORT_ID}`, label: 'passport-detail', auth: true },
  { path: `/passportview/${SELLER_PASSPORT_ID}`, label: 'passportview', auth: true },
  { path: `/passportview/steps/${SELLER_PASSPORT_ID}`, label: 'passportview-steps', auth: true },
  { path: `/passportview/landlord/${LANDLORD_PASSPORT_ID}`, label: 'passportview-landlord', auth: true },

  // ── Buyer side ───────────────────────────────────────────────────
  { path: '/buyer-profile', label: 'buyer-profile', auth: true },
  { path: '/buyer-profile/view', label: 'buyer-profile-view', auth: true },
  { path: '/buyer-profile/build', label: 'buyer-profile-build', auth: true },
  { path: '/buyer-passport/get-started', label: 'buyer-passport-get-started', auth: false },

  // ── Profile ──────────────────────────────────────────────────────
  { path: '/profile', label: 'profile', auth: true },
  { path: '/profile/saved-properties', label: 'saved-properties', auth: true },
  { path: '/profile/watched-properties', label: 'watched-properties', auth: true },
  { path: '/profile/personal-information', label: 'profile-personal-info', auth: true },
  { path: '/profile/document', label: 'profile-documents', auth: true },
  { path: '/profile/rewards', label: 'profile-rewards', auth: true },
  { path: '/profile/calendar', label: 'profile-calendar', auth: true },
  { path: '/profile/settings', label: 'profile-settings', auth: true },
  { path: '/profile/collaborator-information', label: 'profile-collaborators', auth: true },

  // ── Onboarding ───────────────────────────────────────────────────
  { path: '/onboarding', label: 'onboarding-index', auth: false },
  { path: '/onboarding/signin', label: 'onboarding-signin', auth: false },
  { path: '/onboarding/signup', label: 'onboarding-signup', auth: false },
  { path: '/onboarding/create-account', label: 'onboarding-create-account', auth: false },
  { path: '/onboarding/welcome', label: 'onboarding-welcome', auth: true },
  { path: '/onboarding/preferences', label: 'onboarding-preferences', auth: false },

  // ── Misc ─────────────────────────────────────────────────────────
  { path: '/inbox', label: 'inbox', auth: true },
  { path: '/legal/terms', label: 'legal-terms', auth: false },
  { path: '/legal/privacy', label: 'legal-privacy', auth: false },
  { path: '/legal/cookies', label: 'legal-cookies', auth: false },
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

  // Warm-up pass — in Nuxt dev mode each ROUTE lazily compiles on its own
  // first hit (not just the server as a whole), and a cold compile can
  // easily exceed the per-check timeout below. Hit every unique page once
  // here, generously, so the real (scored) loop only ever sees routes
  // that are already compiled. Harmless (just a bit slower) against a
  // production build, where every route is already built.
  console.log('Warming up routes...')
  const warmup = await browser.newPage()
  for (const def of PAGES) {
    try {
      await warmup.goto(BASE_URL + def.path, { waitUntil: 'domcontentloaded', timeout: 60000 })
    } catch {
      /* best-effort — a route that fails to warm up will surface its own error in the real loop */
    }
  }
  await warmup.close()

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
