# Verify saved reading settings by website — independent QA 7

**Verdict: PASS**

- Work order: `eye-comfort-profiles-verify-7`
- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Verification date: 2026-09-06 UTC
- Implementation reviewed: `ce566af87d67f272d6eda924e3cbc98a5198661c`
- Documentation reviewed: `9903d32bd4e2d77f5b0facea1b324e31874899df`
- Findings: **0**
- Untested public claims: **0**

The deployed site, public MV3 archive, and clean local build match. Only
`.factory/handoff.md` changed between the implementation and documentation
commits. No product code was changed during this verification.

## First screen before scrolling

Fresh 1440×900 desktop and 390×844 phone contexts gave a complete first action
without scrolling:

- **Job:** save reading settings for each website.
- **Audience:** readers with eye strain or low vision who want their chosen
  text size, spacing, contrast, and focus aid restored.
- **First action:** **Try it with sample data**.
- **Next result:** the adjacent text says the demo opens a live reading preview
  and saves nothing.

The headline, audience, action, next result, and three facts were fully inside
both first viewports. The page had no horizontal overflow.

## Demo sandbox

The one-click action and direct `/?demo=1#controls` entry passed in fresh phone
and desktop contexts.

- The first populated view showed a real reading sample at 24px, 1.80× line
  spacing, 52ch width, and the Slate surface.
- I changed it to 28px, 2.10×, 72ch, and High contrast. The sample updated.
- **Demo — sample data, nothing is saved.** stayed visible after scrolling to
  the end. **Reset demo** and **Leave demo** remained available.
- Reset restored 24px, 1.80×, 52ch, and Slate.
- A seeded local-storage marker, session-storage marker, and cookie remained
  unchanged through entry, editing, reset, and exit. IndexedDB stayed empty.
- Demo traffic stayed on the product origin. There were no console errors,
  page errors, or failed requests.

Evidence: `/work/.evidence/eye-comfort-profiles-v7/live-browser.json` and the
desktop and phone screenshots beside it.

## Declared claims

All 20 commands in `.factory/claims.json` were invoked separately and exactly
as declared from the clean checkout. Every command exited 0. Source, live
copy, README, legal pages, popup copy, and demo documentation were also checked
for unlisted or broader promises. No public claim is missing or untested.

| Claim | Exact command | Result |
| --- | --- | --- |
| `chromium-download` | `npm run test:release` | Pass; 2/2 archive tests and expected MV3 manifest. |
| `sample-demo` | `npm run test:a11y -- --grep @claim:sample-demo` | Pass; desktop and phone sample, reset, and isolation. |
| `first-party-site` | `npm run test:a11y -- --grep @claim:first-party-site` | Pass; only the product origin was requested. |
| `free-reading-controls` | `npm run test:extension -- --claim=@claim:free-reading-controls` | Pass; four fonts, four surfaces, and every numeric endpoint without a license. |
| `live-page-preview` | `npm run test:extension -- --claim=@claim:live-page-preview` | Pass; 32px before first save and 14px after profile switching remained visible before assignment. |
| `four-font-styles` | `npm run test:extension -- --claim=@claim:four-font-styles` | Pass; all four local choices reached the article. |
| `local-profile-privacy` | `npm run test:extension -- --claim=@claim:local-profile-privacy` | Pass; state stayed in extension storage and external requests were empty. |
| `offline-profile` | `npm run test:extension -- --claim=@claim:offline-profile` | Pass; a keyboard change reached 31px while offline. |
| `site-profile-reload` | `npm run test:extension -- --claim=@claim:site-profile-reload` | Pass; 32px returned after reload. |
| `protected-pages-unchanged` | `npm run test:extension -- --claim=@claim:protected-pages-unchanged` | Pass on `chrome://settings`. |
| `focus-band-behavior` | `npm run test:extension -- --claim=@claim:focus-band-behavior` | Pass; pointer, keyboard focus, and click-through worked. |
| `unassigned-pages-unchanged` | `npm run test:extension -- --claim=@claim:unassigned-pages-unchanged` | Pass; the styled article was untouched before assignment. |
| `backup-roundtrip` | `npx vitest run tests/model.test.ts -t @claim:backup-roundtrip` | Pass; 1/1 exact normalized round trip. |
| `supporter-price` | `npm run test:live` | Pass; Sociobot returned 303 to Eye Comfort Profiles at $19.00. |
| `unlicensed-profile-tools` | `npm run test:extension -- --claim=@claim:unlicensed-profile-tools` | Pass; save, match, apply, export, and import worked without a license. |
| `comfort-not-medical-advice` | `npm run test:a11y -- --grep @claim:comfort-not-medical-advice` | Pass on desktop and phone. |
| `supporter-faceplates` | `npm run test:extension -- --claim=@claim:supporter-faceplates` | Pass; a verified returned token exposed exactly brass, coral, and petrol. |
| `license-daily-check` | `npx vitest run tests/license.test.ts -t @claim:license-daily-check` | Pass; 1/1. |
| `refund-revocation` | `npx vitest run tests/license.test.ts -t @claim:refund-revocation` | Pass; 1/1. |
| `license-restore` | `npm run test:extension -- --claim=@claim:license-restore` | Pass; a pasted valid fixture restored all three faceplates. |

## Clean build and installed artifact

`npm ci` installed 176 packages and reported zero vulnerabilities.

| Check | Fresh result |
| --- | --- |
| `npm test` | Pass; 15/15 tests in four files. |
| `npm run typecheck` | Pass. |
| `npm run build` | Pass; `dist/site`, unpacked MV3, and staged ZIP produced. |
| `npm run test:release` | Pass; 2/2. |
| `npm run test:extension` | Pass; full clean-profile production artifact smoke. |
| `npm run test:a11y` | Pass; 30/30 desktop and 390px Playwright/Axe tests. |
| `npm run test:live` | Pass. |
| `npm audit --omit=dev` | Pass; zero vulnerabilities. |

The unpacked production artifact was loaded into a new Chromium profile. Normal,
invalid, boundary, and recovery paths passed: empty profile name, malformed and
wrong-shape backup files, empty license input, new profile, cancel and confirm
delete, assignment removal, styled-page restoration, protected page, offline
change, reload, and backup restore. The delete dialog initially focused
**Keep profile**. The focus switch label and input both measured 48×44px. Popup
Axe found no serious or critical issue, and the popup and article logged no
console error.

The build produced 2.90kB site JavaScript, 15.47kB CSS, 18.19/37.82kB responsive
hero images, a 50.23kB unpacked extension, and a 28,208-byte ZIP. These are
within the supplied budgets.

## Live routes, accessibility, privacy, and release identity

- `/`, `/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` worked on desktop
  and phone. An unknown route returned the same designed page with HTTP 404 and
  a working home action. The expected 404 resource message is not a defect.
- Every route had `lang=en`, one `h1`, one `main`, its own title, no horizontal
  overflow, no normal-page console error, and zero serious or critical Axe
  violations.
- Keyboard Tab exposed the skip link with a 3px visible focus ring. Same-site
  navigation focused and announced **Privacy — Eye Comfort Profiles**; Back
  restored and announced the home heading.
- Reduced-motion animation and transition durations were 0.01ms. All inspected
  download, route, asset, source, and checkout links returned their intended
  2xx or 303 response.
- The live page and hashed JavaScript byte-match `dist/site`. The public ZIP
  byte-matches the build at SHA-256
  `468f7b7da765c1e677b13307a87ed8580fafb7f2df7cb0ecb579b5247b7a09fb`.
- The HTML response sends CSP with header-only `frame-ancestors 'none'`, HSTS,
  COOP, Permissions Policy, `nosniff`, strict referrer policy, and
  `X-Frame-Options: DENY`. Hashed assets have immutable caching; the ZIP has a
  one-hour cache policy.
- Runtime and source checks found no analytics, tracking, CDN script, or web
  font. The approved Sociobot billing/license API is the only external product
  service.
- `/opt/fleet/lib/verify-url.sh` passed in 815ms with the correct title,
  language, one h1, main landmark, complete alt text, and no errors.
- Fresh mobile Lighthouse scored Performance 100, Accessibility 100, Best
  Practices 100, and SEO 100. FCP was 1.0s, LCP 1.1s, TBT 20ms, CLS 0, and the
  transferred total was 66KiB.

This is a static site and browser extension. Product-backend tenant isolation,
server restart persistence, health, and product-server 429 checks do not apply.

## Earlier finding disposition

| Earlier finding | Current proof |
| --- | --- |
| Verification 1 P0; Verification 2 P0; Verification 3 P0 — missing or invalid public ZIP | Fixed. The public 200 `application/zip` archive byte-matches the build, passes `unzip -t`, and contains the expected MV3 manifest. |
| Verification 1 P1 — typecheck failed | Fixed. `npm run typecheck` passes. |
| Verification 1 P2 — supporter checkout failed | Fixed. The live endpoint returns 303 to the correct $19.00 Dodo checkout. |
| Verification 1 P2 — immutable caching absent | Fixed. The current hashed asset has one-year immutable caching. |
| Verification 1 P3 — hardening headers incomplete | Fixed. The required CSP, framing, COOP, permissions, referrer, HSTS, and content-type headers are present. |
| Verification 4 P0 — intermittent focus-height claim failure | Fixed. The isolated claim and full smoke both reached 56px and 180px deterministically. |
| Verification 4 P1 — styled article text ignored text size | Fixed. The CSS-styled 15px paragraph reached the tested 14px and 32px settings. |
| Verification 4 P1 — paid claims absent | Fixed. Price, exact faceplates, daily check, revocation, restore, and free tools are registered and pass. |
| Verification 4 P2 — demo notice not persistent | Fixed. The banner and both actions stayed inside the phone viewport at end-scroll. |
| Verification 4 P2 — metadata, footer, and 404 incomplete | Fixed. Route metadata, identity assets, footer identity, and designed HTTP 404 pass. |
| Review 1 F-1-1a–h — missing claim coverage and unsupported promises | Fixed. Protected pages, focus behavior, medical boundary, unassigned pages, and current storage claims pass; unsupported schedule, removal, recovery-list, and host-access wording remains absent. |
| Review 1 F-1-2 — preview metaphor | Fixed: **Preview saved reading settings.** |
| Review 1 F-1-3 — empty boundary label | Fixed: **What this extension does not do.** |
| Review 1 F-1-4 — adjective and font jargon | Fixed. Four plain font names are visible and tested. |
| Review 1 F-1-5 — ambiguous surface name | Fixed: **High contrast.** |
| Review 1 F-1-6 — unclear demo exit | Fixed: **Leave demo.** |
| Review 1 F-1-7 | Fixed. The README opening remains split and within the copy limit. |
| Review 1 F-1-8 | Fixed. The README manual-test instruction remains split. |
| Review 1 F-1-9 | Fixed. The extension-test description remains split. |
| Review 1 F-1-10 | Fixed. The live-test description remains split. |
| Review 1 F-1-11 | Fixed. The deployment description remains split. |
| Review 1 F-1-12 | Fixed. The build/privacy description remains split. |
| Review 2 F-2-1 — route focus and announcement | Fixed and rechecked live in both directions. |
| Review 2 F-2-2 — inconsistent headers | Fixed. All documents use Demo, How it works, Controls, and Privacy. |
| Review 2 F-2-3a–d — unsupported checkout, refund, art, and font assurances | Fixed. Unsupported copy remains absent; retained price, revocation, and font outcomes are claim-tested. |
| Review 2 F-2-4 — unclear local-storage heading | Fixed: **Store profiles on your device.** |
| Review 2 F-2-5 — README font jargon | Fixed. README uses **four font styles**. |
| Review 2 F-2-6 — README focus-band compounds | Fixed. The sentence names pointer and keyboard focus plainly. |
| Review 2 F-2-7 — internal assignment wording | Fixed. README says **Save a profile for a website.** |
| Review 2 F-2-8 — file-format jargon | Fixed. README says **Export and restore a backup file.** |
| Review 2 F-2-9 — four names for website scope | Fixed. Public task copy consistently uses **website**. |
| Review 3 F-3-1 — checkout HTTP 500 | Fixed by the live 303 and hosted product/price check. |
| Review 3 F-3-2 — unlisted art claim | Fixed. The public caption remains absent; provenance stays in the design record. |
| Review 3 F-3-3 — “free forever” | Fixed. Present-tense free-tool wording is covered by two extension claims. |
| Review 3 F-3-4 — controls heading jargon | Fixed: **Change text, spacing, contrast, and focus.** |
| Review 3 F-3-5 — demo omitted from sitemap | Fixed. The direct demo URL is listed. |
| Review 3 F-3-6 — conflicting versions | Fixed. Public labels say Extension v1.0.0 and Site build repair-6. |
| Verification 6 F-6-1 — no preview before save | Fixed. The new claim proves first-assignment and switched-profile preview persistence. |
| Verification 6 F-6-2 — incomplete free-control proof | Fixed. The claim now tests four fonts, four surfaces, and both endpoints of every numeric control. |
| Verification 6 F-6-3 — 48×28px focus switch | Fixed. Both measured targets are 48×44px. |
| Verification 6 F-6-4 — popup metaphor and jargon | Fixed. The rendered labels are **Reading profiles** and **Reading controls**. |
| Verification 6 F-6-5 — copy audit mismatch | Fixed. The audit and source both say **Select the extension on a regular website.** |

The passing Verification 5 baseline and both polish reports were also checked
for regression. No earlier issue reopened. No additional AI, sync, or import
feature is an obvious missing step for this manual, local reading-settings job.

## Final decision

**PASS — zero findings and zero untested public claims.** Candidate
`ce566af87d67f272d6eda924e3cbc98a5198661c` meets this work order.
