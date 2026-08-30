# Adversarial first-read review 2 — Eye Comfort Profiles

**URL checked:** <https://eye-comfort-profiles.sociobot.in>
**Date:** 2026-08-30 UTC
**Verdict: FAIL**

## Cold first read

Fresh Chromium contexts at 390×844 and 1440×900 were opened without prior
storage. Before scrolling, the product was understandable on both:

- **Does:** saves reading settings for each website.
- **For whom:** readers with eye strain or low vision who want the settings
  they chose to return.
- **First action:** click **Try it with sample data**; it opens a live reading
  preview and saves nothing.

The first-screen gate passes. The mobile first screen also showed the audience,
primary action, outcome note, and three plain facts. There were no console
errors and the first load made only same-origin requests.

## Findings

### F-2-1 — BLOCKING — route changes do not move focus or announce the new page

**Location/evidence:** After activating the live **Privacy** link at 390px,
`/privacy/` loaded with `document.activeElement === document.body`; its `h1`
was not focused and the page has no `aria-live` region. The same is true on
back navigation. The legal and 404 documents contain no route-focus script.

**Why this fails:** A keyboard or screen-reader visitor is left at the top of a
new document without being placed at, or told, the new page heading. This fails
the required route-change focus and announcement behavior.

**Concrete fix:** Put the shared navigation behavior on every document: make
the destination `h1` programmatically focusable, focus it after a navigation,
and update a polite live region with the page title. Add a Playwright test that
activates Privacy and Back and asserts both the focused `h1` and announcement.

### F-2-2 — minor — the header changes between the landing and legal routes

**Location/evidence:** The landing header offers **Demo**, **How it works**,
**Controls**, and **Privacy**. `/privacy/`, `/terms/`, and `/404.html` instead
offer **How it works**, **Controls**, and **Supporter**. The latter header has
no Demo or Privacy link.

**Why this fails:** A visitor cannot rely on the navigation staying in the
same place. In particular, a reader on Terms has no header path to the demo or
Privacy even though both are required site destinations.

**Concrete fix:** Use one shared header on every route: wordmark, Demo, How it
works, Controls, and Privacy, with `aria-current` where applicable. Keep the
existing footer legal links as a second path.

### F-2-3 — BLOCKING — several public factual assurances have no registered claim

| Location and exact quote | Why it is unsupported | Concrete fix |
| --- | --- | --- |
| Landing supporter note: “Secure hosted checkout.” | No claim or sandbox test establishes a security property. The registered price test checks link text and destination only. | Delete “Secure”, or register a narrowly observable checkout-host claim and test the resulting HTTPS Sociobot redirect. |
| Landing supporter note: “Sociobot/Dodo is the merchant of record; refunds are handled there and revoke the license.” | `refund-revocation` tests a mocked revoked response; it does not prove who handles refunds or that a refund produces that response. | Keep only the tested outcome: “A refunded supporter license no longer unlocks faceplates.” Register it against the existing fixture test. Remove the merchant/refund-processing assertion unless an observable integration test can prove it. |
| Landing footer: “Hero artwork generated for this product with Azure AI Foundry.” | This is a provenance claim, but no claim entry or observable test covers it. | Keep provenance in `.factory/design.md` as required, and remove this public assurance; alternatively add a provenance record that can be independently verified. |
| README opening: “The product does not prescribe one ‘accessible’ font …” | This product-boundary claim is not listed. | Replace it with the tested feature statement “Choose from four font styles,” or add an observable four-style/no-forced-font claim test. |

The existing `first-party-site`, `supporter-price`, `supporter-faceplates`, and
`refund-revocation` tests pass, but they do not prove the distinct assertions
above. Per the claims contract, each is an unlisted-claim failure.

### F-2-4 — minor — a landing heading carries no useful section name

**Quote/location:** “Local by design”, fourth card under **Free controls**.

**Why this fails:** This is a slogan-like design label, not a heading a
screen-reader user can use to identify the card’s content.

**Concrete fix:** “Store profiles on your device.”

### F-2-5 — minor — README uses unexplained typography jargon

**Quote/location:** “Named profiles with font fallback, 14–32px text, line
height, letter spacing, 36–96 character line width, and four reading surfaces.”

**Why this fails:** “Font fallback” is implementation language. The product
uses the clearer “font styles” wording on the landing page.

**Concrete fix:** “Named profiles with four font styles, 14–32px text, line
spacing, letter spacing, 36–96-character lines, and four reading surfaces.”

### F-2-6 — minor — README compresses the focus-band feature into engineering compounds

**Quote/location:** “Optional pointer- and keyboard-focus-following reading
band.”

**Why this fails:** The chained modifiers are harder to parse than the landing
copy, despite naming the same feature.

**Concrete fix:** “An optional focus band follows the pointer or keyboard
focus.”

### F-2-7 — minor — README describes saving a profile with internal terminology

**Quote/location:** “Explicit website-address assignment; pages stay unchanged
until a reader saves a profile.”

**Why this fails:** “Explicit … assignment” is a developer phrase and the
same concept appears elsewhere as “site”, “website”, and “website address.”

**Concrete fix:** “Save a profile for a website. Other websites stay
unchanged.”

### F-2-8 — minor — README exposes file-format jargon instead of the user result

**Quote/location:** “Local JSON backup and restore.”

**Why this fails:** A reader needs to know that a backup can be exported and
restored; “JSON” names the implementation rather than the result.

**Concrete fix:** “Export and restore a backup file.”

### F-2-9 — minor — the same matching scope has four names

**Location/evidence:** The landing says “each site”, “each website”, “website
address”, and “site matching” for the same saved-profile target. The README
adds “website-address assignment.”

**Why this fails:** The product is specifically about the scope to which a
profile applies. Switching terms makes that core boundary needlessly fuzzy.

**Concrete fix:** Use **website** everywhere in public copy: “Save a profile
for each website”, “Save to this website”, and “website matching.”

## Copy audit

Counts treat hyphenated forms, numbers, URLs, and command/path identifiers as
one word. Labels are included because they are read as text by a first-time
visitor. No audited landing string exceeds 22 words. The flags above are the
only plain-language, term-consistency, heading, or unlisted-claim flags.

### Landing page

| Copy [words] | Copy [words] |
| --- | --- |
| Skip to main content [4] | Eye Comfort Profiles [3] |
| Demo [1] | How it works [3] |
| Controls [1] | Privacy [1] |
| Download v1.0 [2] | Demo — sample data, nothing is saved. [6] |
| Reset demo [2] | Leave demo [2] |
| Reading profiles for Chromium [4] | Save reading settings for each site. [6] |
| For readers with eye strain or low vision, it restores the text size, spacing, contrast, and focus aid they choose. [20] | Try it with sample data [5] |
| Download for Chromium [3] | The demo opens a live reading preview and saves nothing. [10] |
| Free reading controls [3] | Installed profiles work offline [4] |
| Settings stay in browser storage [5] | Reading profile preview [3] |
| Generated product artwork [3] | Save one reading profile for each website. [7] |
| Zoom changed again [3] | Lines run too wide [4] |
| Theme lost on return [4] | Live preview [2] |
| Adjust a reading sample. [4] | There is no “correct” font for every reader. [8] |
| Start with what feels easy, then save the combination—not a prescription. [12] | Text size [2] |
| 19 px [2] | Line spacing [2] |
| 1.65× [1] | Line width [2] |
| 58 ch [2] | Reading surface [2] |
| Paper [1] | Slate [1] |
| High contrast [2] | Live reading sample [3] |
| Preview saved reading settings. [4] | Comfort can depend on the page, the hour, and the kind of reading. [13] |
| A narrow article may need generous spacing; a reference page may work better with compact lines. [16] | Move these controls to test the geometry. [7] |
| The extension remembers the full combination for each website address. [10] | How it works [3] |
| Save a profile in three steps. [6] | Open a page [3] |
| Select the extension on a regular website. [7] | Browser-protected pages stay unchanged. [4] |
| Tune with live feedback [4] | Adjust type, size, spacing, line length, surface, and the optional moving focus band. [13] |
| Save to the site [4] | Name the profile and assign it. [6] |
| Settings return locally for that website address, with no account. [10] | Free controls [2] |
| Reading controls without diagnosis claims. [5] | Choose from four font styles. [5] |
| Choose system sans, rounded sans, serif, or monospaced text. [9] | Text size, spacing, and line length. [7] |
| Set 36–96 character lines, line spacing, letter spacing, and text size independently. [13] | Optional focus band [3] |
| A translucent guide follows your pointer or keyboard focus without capturing clicks. [12] | Local by design [3] |
| Only your profile settings and website address assignments are stored. [10] | Export or import them anytime. [5] |
| Manual install for Chromium [4] | Install this Chromium build. [4] |
| Use the steps here to load this download in Chromium. [10] | Download and unzip [3] |
| Save the package somewhere permanent. [5] | Open Extensions [2] |
| Visit chrome://extensions and enable Developer mode. [7] | Load unpacked [2] |
| Select the unzipped folder, then pin the instrument icon. [9] | Download extension zip [3] |
| One-time supporter unlock [3] | $19 [1] |
| No subscription [2] | Reading controls stay free. [4] |
| Support the product once and unlock three decorative instrument faceplates. [10] | Profiles, site matching, every comfort control, and backup/restore remain free forever. [12] |
| Buy supporter unlock [3] | Secure hosted checkout. [3] |
| Sociobot/Dodo is the merchant of record; refunds are handled there and revoke the license. [15] | What this extension does not do [6] |
| Comfort settings, not medical advice. [5] | Eye Comfort Profiles changes presentation only. [6] |
| It does not test, diagnose, prevent, or treat any eye condition. [11] | Persistent pain or vision changes deserve advice from a qualified eye-care professional. [12] |
| Save the reading settings that work for you. [8] | Terms [1] |
| Source [1] | Built by Param Factory · v1.0.1 · polish-1 [6] |
| Hero artwork generated for this product with Azure AI Foundry. [10] | No analytics or third-party scripts. [5] |
| You’re offline. [2] | The download may be unavailable, but installed profiles keep working. [10] |

### README

| Copy [words] | Copy [words] |
| --- | --- |
| Eye Comfort Profiles [3] | Eye Comfort Profiles is a Chromium extension for people who adjust reading settings on different websites. [16] |
| It saves text size, spacing, contrast, and focus settings for each one. [12] | It is a comfort utility, not a vision test or medical treatment. [12] |
| The product does not prescribe one “accessible” font and does not send browsing history or page content anywhere. [16] | Live site: https://eye-comfort-profiles.sociobot.in [4] |
| Try the isolated sample preview at https://eye-comfort-profiles.sociobot.in/?demo=1#controls. [6] | It starts with a realistic reading setup, saves nothing, and resets in one click. [13] |
| Named profiles with font fallback, 14–32px text, line height, letter spacing, 36–96 character line width, and four reading surfaces [19] | Optional pointer- and keyboard-focus-following reading band [6] |
| Explicit website-address assignment; pages stay unchanged until a reader saves a profile [10] | Local JSON backup and restore [5] |
| Optional $19 one-time supporter purchase for decorative faceplates; every reading and backup feature remains free [15] | Static product site, privacy policy, and terms [7] |
| Node.js 22 or newer [4] | npm 10 or newer [4] |
| A Chromium-family browser for loading the built extension [8] | `npm install` [2] |
| `npm run dev` — WXT extension development [5] | `npm run dev:site` — landing site on a local Vite server [9] |
| `npm test` [2] | `npm run build` [3] |
| `npx playwright install chromium` — first browser-audit run outside the worker image [10] | `npm run test:a11y` [2] |
| `npm run build` is the release command. [7] | `dist/site/index.html` — static deployment root [5] |
| `dist/site/privacy/index.html`, `dist/site/terms/index.html`, and a designed `dist/site/404.html` [9] | `dist/site/downloads/eye-comfort-profiles-chrome.zip` [1] |
| `dist/extension/chrome-mv3/` — unpacked extension [3] | `npm run build:site` is also self-contained. [6] |
| It produces the static site and stages the packaged extension under `dist/site/downloads/`, matching the factory static deployment entry point. [17] | To test the extension, open `chrome://extensions`, enable Developer mode, choose “Load unpacked”, and select `dist/extension/chrome-mv3`. [18] |
| `npm test` [2] | `npm run typecheck` [3] |
| `npm run build` [3] | `npm run test:release` [3] |
| `npm run test:extension` [3] | `npm run test:a11y` [2] |
| `npx vite --config vite.site.config.ts --host 127.0.0.1` [7] | Inspect the site, Privacy, and Terms pages. [7] |
| Then test assignment, removal, the focus band, backup, keyboard focus, and a restricted page. [14] | `npm run test:extension` tests the unpacked Chromium extension with keyboard controls. [10] |
| It also checks profile application and an offline local update. [10] | After deploying `dist/site`, run `npm run test:live`. [6] |
| It checks the public extension ZIP and the 404 page. [10] | It also checks identity assets, caching, security headers, and the Sociobot checkout redirect. [11] |
| Set `SITE_URL` to verify another static deployment target. [8] | For production releases, use `npm run build && npm run deploy:production`. [8] |
| The command deploys `dist/site`, including the extension ZIP. [8] | It then checks that the public ZIP is a valid Chromium Manifest V3 package. [14] |
| The build has no third-party scripts, web fonts, or analytics. [10] | An optional Sociobot checkout and license check are the only paid-service calls. [12] |
| Production builds use `api.sociobot.in`. [4] | `storage` holds the local profile document. [6] |
| `activeTab` identifies the page the reader is actively configuring. [9] | Matching uses the website address only. [6] |
| The extension does not collect browser history. [7] | See the privacy policy and terms. [6] |
| The product-specific mid-century instrument system and generated-art provenance are recorded in `.factory/design.md`. [14] | The source hero image and prompt sidecars live in `assets/src/`; optimized WebP variants ship locally. [15] |
| MIT. See LICENSE. [3] |  |

## Demo and sandbox

**Pass.** A cold click on **Try it with sample data** opened
`/?demo=1#controls` and immediately displayed the real interactive reading
preview with 24 px text, 1.80× line spacing, 52 ch line width, and Slate
surface. The persistent banner read **“Demo — sample data, nothing is saved”**
and exposed **Reset demo** and **Leave demo**.

Reset restored 24 px after changing it to 28 px. A fresh live context had
empty localStorage before, during, and after the demo. A second context seeded
with real license keys retained those exact keys while the demo made only
product-origin requests and did not show a license state. The local registered
sample test also passed at desktop and 390px. The DOM-only demo has no storage
namespace because it does not write any storage.

## Claims

All commands in `.factory/claims.json` were run from fresh GitHub clone
`f8dca5a6e7ed9430857cd6bd90ffec159f7e69a8` after `npm ci`. All registered
claims passed; none is an untested or failing registered claim.

| Claim | Command | Result |
| --- | --- | --- |
| chromium-download | `npm run test:release` | Pass, ZIP signature, `unzip -t`, MV3 manifest. |
| sample-demo | `npm run test:a11y -- --grep @claim:sample-demo` | Pass at desktop and 390px. |
| first-party-site | `npm run test:a11y -- --grep @claim:first-party-site` | Pass; only product origin requested. |
| free-reading-controls | `npm run test:extension -- --claim=@claim:free-reading-controls` | Pass; keyboard profile changed styled article. |
| local-profile-privacy | `npm run test:extension -- --claim=@claim:local-profile-privacy` | Pass; no external HTTP(S) request. |
| offline-profile | `npm run test:extension -- --claim=@claim:offline-profile` | Pass; 31 px update while offline. |
| site-profile-reload | `npm run test:extension -- --claim=@claim:site-profile-reload` | Pass; saved style reapplied after reload. |
| protected-pages-unchanged | `npm run test:extension -- --claim=@claim:protected-pages-unchanged` | Pass. |
| focus-band-behavior | `npm run test:extension -- --claim=@claim:focus-band-behavior` | Pass; pointer, keyboard, and click-through observed. |
| unassigned-pages-unchanged | `npm run test:extension -- --claim=@claim:unassigned-pages-unchanged` | Pass. |
| backup-roundtrip | `npx vitest run tests/model.test.ts -t @claim:backup-roundtrip` | Pass. |
| supporter-price | `npm run test:a11y -- --grep @claim:supporter-price` | Pass at desktop and 390px. |
| comfort-not-medical-advice | `npm run test:a11y -- --grep @claim:comfort-not-medical-advice` | Pass at desktop and 390px. |
| supporter-faceplates | `npm run test:extension -- --claim=@claim:supporter-faceplates` | Pass; exactly three faceplates after fixture verification. |
| license-daily-check | `npx vitest run tests/license.test.ts -t @claim:license-daily-check` | Pass. |
| refund-revocation | `npx vitest run tests/license.test.ts -t @claim:refund-revocation` | Pass. |

Additional clean-clone gates passed: `npm test` (15/15), `npm run typecheck`,
`npm run build`, and the full `npm run test:a11y` (24/24). `npm run test:live`
passed against production: the 28,158-byte public ZIP byte-matched the build,
checkout returned the expected Dodo redirect, and the unknown route returned
the designed HTTP 404.

## History recheck

Every earlier review, polish report, handoff, and verification report was read.
The following earlier findings were rechecked against live behavior and the
current code; none is reopened.

| Earlier finding(s) | Current verification |
| --- | --- |
| `verification.md` P0, `verification-2.md` P0, `verification-3.md` P0 | Live archive is `200 application/zip`, starts with `PK`, passes `unzip -t`, contains MV3 manifest, and hash-matches the clean build. |
| `verification.md` P1 | `npm run typecheck` passes. |
| `verification.md` P2/P3 | Live checkout is a 303 to Dodo; hashed JS has one-year immutable caching; CSP, COOP, permissions, referrer, nosniff, XFO, and HSTS checks pass. |
| `verification-4.md` P0 | The exact `local-profile-privacy` command passed in this clean run; current smoke waits for the selected profile effects. |
| `verification-4.md` P1 (styled article text) | The current smoke fixture gives an `article p` its own 15 px rule and verifies it becomes 32 px. |
| `verification-4.md` P1 (paid claims) | $19, faceplates, daily check, and revocation claims now have registered tests, all passing. This does not cover the new F-2-3 wording. |
| `verification-4.md` P2 (mobile demo) | At 390px after full-page scroll, banner, Reset, and Leave demo controls remained within the viewport; the local test passes. |
| `verification-4.md` P2 (404, metadata, footer) | Live unknown route is the designed 404. Each route has route-specific metadata, OG/Twitter image, SVG/favicon/touch assets, and footer build identity. |
| `review-1.md` F-1-1.a–h | Protected pages, focus-band behavior, medical boundary, unassigned pages, and the associated claim coverage pass; unsupported install/recovery wording is absent. |
| `review-1.md` F-1-2–F-1-6 | The old metaphor headings, “honest” font wording, ambiguous “High”, and “Start for real” label are absent; replacement live copy is present. |
| `review-1.md` F-1-7–F-1-12 | The six cited README sentences were split and are at or below 22 words. |
| `polish-1.md` and prior handoff | Demo leaves real license storage untouched, direct demo bypasses verification, and all named repaired artifacts/tests are still present. |

## Structure, accessibility, and visual check

- Home, Privacy, Terms, and 404 each have `lang=en`, one `main`, one `h1`,
  route-specific title/description/canonical/OG/Twitter metadata, favicon and
  Apple touch icon. The title patterns are correct.
- `/privacy/`, `/terms/`, `/404.html`, robots, sitemap, social image, all
  local anchors, the ZIP download, and the Source link were crawled successfully.
  The checkout link returned its intended 303 to a Dodo session.
- The responsive 390px layout has no horizontal overflow. The full local axe
  suite reports no serious or critical violations. `verify-url.sh` reported
  HTTP 200, one h1, main, alt coverage, and no console errors.
- The warm enamel, engraved control, and reading-instrument artwork are a
  distinct product-specific visual system, not a generic SaaS template.
- F-2-1 and F-2-2 remain the route-structure exceptions.

## Missed leverage

No additional feature is required by the brief. Per-site profiles, live
preview, local operation, offline behavior, the optional focus band, and
portable backup/restore are present. An AI step would not improve this
calibration task and should not be added.

## What would make this perfect

Implement focus/announcement behavior and a consistent header on every route.
Remove or prove the four unsupported assurances in F-2-3. Apply the five
plain-language rewrites plus the terminology rewrite, then add regression tests for route focus
and the revised claims. With those changes, the product would have no remaining
first-read, sandbox, claims, or structure finding.
