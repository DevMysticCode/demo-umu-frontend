# Mobile app assets (icon + splash)

Drop two PNGs in this folder, then run:

```bash
npx @capacitor/assets generate --ios
npx cap sync ios
```

That writes every required size into `ios/App/App/Assets.xcassets/`.

## Files to provide

### `icon.png`

- **Size:** 1024 × 1024
- **Format:** PNG, **opaque** (no alpha channel — App Store rejects transparent marketing icons)
- **Content:** umu mark centred with ~10% safe padding around all sides (iOS applies a rounded-square mask; content near the edges gets clipped)
- **Background:** solid colour — recommended `#231d45` (UMU navy) with white logo

> **No rounded corners.** iOS rounds the icon automatically. If you bake in rounded corners you'll see a double-radius effect.

### `splash.png`

- **Size:** 2732 × 2732
- **Format:** PNG (alpha OK — the background colour from `capacitor.config.ts` shows through any transparency)
- **Content:** logo / wordmark centred inside the **inner ~1000 × 1000 square**. Anything outside the inner third gets clipped on:
  - iPhone notch / Dynamic Island (top centre, ~30 px)
  - Curved corners (all four corners on iPhone X+)
  - Landscape orientation (sides clipped)
- **Background:** solid `#231d45` (matches `capacitor.config.ts → SplashScreen.backgroundColor` so the launch storyboard + Capacitor splash blend seamlessly)

## Optional (recommended for Android adaptive icons later)

- `icon-foreground.png` — 1024 × 1024 — the umu mark only, transparent background, content centred within inner 660 × 660 (Android safe zone)
- `icon-background.png` — 1024 × 1024 — solid `#231d45` only

## Regenerate after editing

```bash
npm run mobile:assets   # alias for `@capacitor/assets generate`
npx cap sync ios
npx cap open ios        # then archive & upload to TestFlight (Xcode)
```

## Brand reference

| Token   | Hex       | Use            |
|---------|-----------|----------------|
| Navy    | `#231D45` | Icon + splash background |
| Teal    | `#00A19A` | Accent          |
| White   | `#FFFFFF` | Logo on navy    |

Files in this folder are the **source of truth** — the generated PNGs in
`ios/App/App/Assets.xcassets/` are derived and shouldn't be hand-edited.
