# Eye Comfort Profiles — visual thesis

## Direction: a quiet mid-century reading instrument

Eye Comfort Profiles should feel like a well-kept optical instrument panel from
the 1960s: deliberate knobs, warm enamel, crisp engraved labels, and a single
illuminated status window. This is not nostalgia as decoration. The product's
job is repeatability, so the panel makes every value inspectable and every
change feel calibrated. Content remains the dominant layer; the surrounding
instrument recedes.

## Palette

The primary treatment is intentionally single-mode: warm bench enamel avoids a
second, visually unstable chrome theme while the preview demonstrates reading
surface choices.

| Token | Value | Use |
| --- | --- | --- |
| `--bench` | `#E8E1D2` | page background, warm anti-glare enamel |
| `--panel` | `#F7F2E8` | raised control panels |
| `--panel-deep` | `#D8CFBD` | wells, rails, inactive tracks |
| `--ink` | `#202825` | primary text (12.6:1 on panel) |
| `--ink-muted` | `#59625D` | secondary text (5.7:1 on panel) |
| `--petrol` | `#174F52` | active controls and focus (7.7:1 on panel) |
| `--petrol-dark` | `#103A3C` | pressed state |
| `--signal` | `#D85F3E` | one purposeful action or indicator |
| `--signal-dark` | `#9B3D27` | text-safe signal on light surfaces |
| `--success` | `#296643` | applied/saved state |
| `--warning` | `#8A5412` | degraded/offline notice |
| `--danger` | `#9A302A` | destructive/error state |

All text and interactive outlines meet WCAG AA. Status uses text and shape in
addition to color. Reading-preview themes use their own checked contrast pairs.

## Type

- **Panel and body:** `Avenir Next`, `Segoe UI`, `Helvetica Neue`, Arial,
  sans-serif. These system faces are clean at small sizes and avoid a font
  download in a browser utility.
- **Readouts and numbers:** `ui-monospace`, `SFMono-Regular`, Consolas,
  monospace, with tabular figures. Monospace is reserved for values, hostnames,
  and engraved micro-labels.
- Scale: 13, 15, 17, 21, 28, 48px. Website body never drops below 17px; compact
  extension labels use 13–15px while value controls remain at least 16px.
- Long-form copy stays between 52 and 70 characters with 1.55 leading.

## Geometry and spacing

- An 8px base rhythm, with 4px used only inside compact readouts.
- Corners are small and manufactured: 4px for controls, 10–18px for housings.
- 44px minimum interaction targets, 8px between adjacent targets.
- Thin dark keylines, inset wells, and short cast shadows establish physical
  hierarchy without card grids.
- The popup is a 360px instrument; at 390px mobile the marketing site becomes a
  single vertical calibration path and drops only ornamental tick labels.

## Interaction grammar

- Sliders behave like calibration rails and always show their numeric value.
- A two-lamp header reports site support and whether a profile is applied.
- Changes preview immediately; persistence is explicit through “Save to this
  site”. No silent assignment.
- Profile deletion names the target and offers a short undo window.
- Empty, restricted-page, storage-error, and offline-license states always
  explain the next useful action.

## Motion

- Control feedback: 160ms; panel/state transitions: 220ms.
- Only `transform` and `opacity` animate. Switch toggles travel along their rail;
  save confirmation rises from the save control.
- Nothing loops or flashes. Under `prefers-reduced-motion: reduce`, transitions
  are removed and state changes are immediate.

## Asset plan and provenance

### `panel-reader-hero`

- Use case: stylized-concept; landing-page hero illustration.
- Subject: a tabletop reading calibration instrument aligning a column of
  abstract paper lines inside a warm focus band.
- World/materials: cream powder-coated metal, petrol-green bakelite knobs,
  coral indicator lamp, lightly speckled recycled paper, precise engraved tick
  marks without readable words.
- Light/lens: soft north-window light, slight overhead three-quarter view,
  editorial product still life.
- Palette words: warm ivory, deep petrol, charcoal, muted coral, honey brass.
- Negative list: no people, eyes, medical equipment, screens with legible text,
  logos, brands, watermarks, generic neon gradients, chrome futurism, clutter.
- Prompt: “A refined editorial still-life illustration of a fictional
  mid-century tabletop reading calibration instrument. Cream powder-coated
  metal housing, deep petrol-green bakelite knobs, one small muted-coral status
  lamp, and a sheet of lightly speckled paper passing through the device. A
  translucent warm horizontal focus band aligns several abstract charcoal text
  lines; all marks are non-legible. Soft north-window light, gentle cast shadow,
  three-quarter overhead view, screen-printed gouache texture with precise
  industrial-design geometry, warm ivory/deep petrol/charcoal/muted coral/honey
  brass palette. Ample calm negative space. No people, no eyes, no medical
  device cues, no logos, no readable text, no watermark, no brand symbols, no
  neon gradient, no chrome futurism.”
- Generator: Azure AI Foundry factory image deployment via
  `/opt/fleet/lib/gen-image.sh`, 2026-08-27. Original generated asset for this
  product. Source PNG and prompt sidecar retained under `assets/src/`; optimized
  WebP shipped locally. The footer discloses generated imagery.

All interface icons are original inline SVG line drawings using the same
keyline language. No third-party artwork or runtime asset service is used.
