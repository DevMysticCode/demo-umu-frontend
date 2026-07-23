// Crops the big hero illustrations + small row icons for the 4 KYC
// screens in pages/claim/[id].vue. Sources are the mockup screenshots
// 7/8/9/10.jpeg placed under public/op-icons/claim/source/.
import sharp from 'sharp'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const OUT = './public/op-icons/claim'
const SRC = `${OUT}/source`
mkdirSync(OUT, { recursive: true })

const THRESHOLD = 240
const SOFT = 18

async function stripWhite(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const out = Buffer.from(data)
  for (let i = 0; i < out.length; i += channels) {
    const min = Math.min(out[i], out[i + 1], out[i + 2])
    if (min >= THRESHOLD) out[i + 3] = 0
    else if (min >= THRESHOLD - SOFT) {
      const t = (min - (THRESHOLD - SOFT)) / SOFT
      out[i + 3] = Math.round(out[i + 3] * (1 - t))
    }
  }
  return sharp(out, { raw: { width, height, channels } }).png().toBuffer()
}

async function crop(srcName, outName, fx, fy, fw, fh) {
  const buf = readFileSync(`${SRC}/${srcName}`)
  const meta = await sharp(buf).metadata()
  const left = Math.round(fx * meta.width)
  const top = Math.round(fy * meta.height)
  const width = Math.min(meta.width - left, Math.round(fw * meta.width))
  const height = Math.min(meta.height - top, Math.round(fh * meta.height))
  const cropped = await sharp(buf).extract({ left, top, width, height }).png().toBuffer()
  const stripped = await stripWhite(cropped)
  writeFileSync(`${OUT}/${outName}.png`, stripped)
  console.log(`  ${srcName} @ (${left},${top}) ${width}×${height} → ${outName}.png`)
}

// ── Screen 8 (Confirm property) ────────────────────────────────────
// Big 3D house-with-location-pin illustration on the right side of
// the "FOUND ON LAND REGISTRY" card.
await crop('8.jpeg', 'houseWithPin', 0.52, 0.24, 0.44, 0.20)

// ── Screen 7 (Identity verified!) ──────────────────────────────────
// Big teal circle-check with sparks. Vertically-centered at top.
await crop('7.jpeg', 'bigCheckHero', 0.30, 0.11, 0.40, 0.24)
// 3D bank icon inside the "Next: Land Registry check" card.
await crop('7.jpeg', 'bankCard',      0.05, 0.51, 0.24, 0.15)

// ── Screen 9 (Searching Land Registry) ─────────────────────────────
// Big 3D bank/registry building in teal-wash circle at top.
await crop('9.jpeg', 'bankHero', 0.28, 0.11, 0.42, 0.20)
// Lock icon in "Your data is secure" card.
await crop('9.jpeg', 'securityLock', 0.06, 0.66, 0.16, 0.09)
// Shield-check on right of same card.
await crop('9.jpeg', 'securityShield', 0.76, 0.67, 0.18, 0.08)

// ── Screen 10 (Ownership confirmed) ────────────────────────────────
// Big teal square with white check (Ownership verified banner).
await crop('10.jpeg', 'ownershipCheck', 0.06, 0.155, 0.20, 0.095)
// 3D bank/registry building (Land Registry title data header icon).
await crop('10.jpeg', 'lrTitleBank',    0.05, 0.265, 0.20, 0.09)
// Row icons (small 3D icons on white pedestal) — hash, doc, person,
// calendar, lock. All left-aligned on the same x column.
await crop('10.jpeg', 'rowHash',        0.07, 0.352, 0.11, 0.055)
await crop('10.jpeg', 'rowDoc',         0.07, 0.412, 0.11, 0.058)
await crop('10.jpeg', 'rowPerson',      0.07, 0.470, 0.11, 0.060)
await crop('10.jpeg', 'rowCalendar',    0.07, 0.528, 0.11, 0.060)
await crop('10.jpeg', 'rowLock',        0.07, 0.588, 0.11, 0.060)
// 3D shield-with-check for "Maxine Wilson — confirmed" card.
await crop('10.jpeg', 'maxineShield',   0.06, 0.658, 0.18, 0.105)
