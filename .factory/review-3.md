# Adversarial first-read review 3 — Eye Comfort Profiles

**URL checked:** <https://eye-comfort-profiles.sociobot.in>

**Date:** 2026-08-30 UTC

**Candidate:** `c30e28d34ee2263901fa7c4a59f24cbe9ff5caca`

**Verdict: FAIL**

The first screen and demo are clear, but the advertised supporter purchase is
broken in production. One earlier unlisted provenance claim also remains on
the live page. There are six findings, including two blocking findings.

## Cold first read

Fresh Chromium contexts at 390×844 and 1440×900 were opened at `/` with empty
storage and no prior cookies. Before scrolling, I could answer all three
questions in both contexts:

- **What it does:** it saves chosen reading settings for each website.
- **For whom:** readers with eye strain or low vision.
- **What to click first:** **Try it with sample data**, which says it opens a
  live reading preview and saves nothing.

The exact first-screen copy that supplied those answers was **“Save reading
settings for each website.”**, **“For readers with eye strain or low vision,
it restores the text size, spacing, contrast, and focus aid they choose.”**, and
**“Try it with sample data.”** The first-screen gate passes. Both contexts had
zero console/page errors, only the product origin in their request logs, and no
horizontal overflow.

## Findings

### F-3-1 — BLOCKING — “Buy supporter unlock” opens an HTTP 500 error

**Quote/location:** **“Buy supporter unlock”**, landing page supporter section.

**Evidence:** An actual fresh 390px browser click navigated to
`https://api.sociobot.in/api/v1/products/eye-comfort-profiles/checkout` and
received HTTP 500 with `{"error":"Internal server error","status":500}`.
Direct `curl` and the link crawl produced the same result. The clean-clone
`npm run test:live` check failed with:

```text
Production checkout mapping is not a Sociobot/Dodo redirect (got 500).
```

This regresses the supporter-endpoint defect recorded as `verification.md` P2.
It is blocking again because the page offers a paid result that cannot be
completed.

**Concrete fix:** Repair the Sociobot product mapping so the endpoint returns a
303 to the hosted Dodo checkout. Then add the observable redirect and hosted
$19 product result to the registered `supporter-price` claim test. The current
claim test checks only the local link URL and copy, so it passes while the real
purchase is broken.

### F-3-2 — BLOCKING — F-2-3c remains as an unlisted provenance claim

**Quote/location:** **“Generated product artwork”**, hero image caption.

`review-2.md` F-2-3c required the public generated-art assurance to be removed
or registered with independently verifiable evidence. `polish-2.md` says it
was removed, but this shorter public assertion remains live and in
`site/index.html`. `.factory/claims.json` still has no provenance entry or
test. Changing “Hero artwork generated for this product with Azure AI Foundry”
to “Generated product artwork” narrows the assertion but does not remove it.

**Concrete fix:** Remove the caption, or add a provenance claim whose test
verifies the retained source asset, prompt sidecar, recorded generator/date,
and deterministic shipped derivatives. Re-run the public claims inventory.

### F-3-3 — minor — “free forever” is broader than the registered tests

**Quotes/locations:**

- Landing supporter section: **“Profiles, website matching, every comfort
  control, and backup/restore remain free forever.”**
- README, What is included: **“Optional $19 one-time supporter purchase for
  decorative faceplates; every reading and backup feature remains free.”**

`free-reading-controls` tests unlicensed reading controls.
`backup-roundtrip` tests file fidelity, not whether backup is license-gated.
No claim test covers unlicensed profile matching plus backup, and no sandbox
can establish “forever.” A visitor could rely on a larger pricing promise than
the tests prove.

**Concrete fix:** Use **“A supporter license adds three faceplates. Profiles,
website matching, reading controls, and backups work without one.”** Add a
fresh-unlicensed-extension claim test that exercises each named feature. Drop
“forever.”

### F-3-4 — minor — the controls heading uses producer jargon

**Quote/location:** **“Reading controls without diagnosis claims.”**, Free
controls section heading.

“Diagnosis claims” describes the maker's compliance posture rather than the
section's contents. Heard alone in a heading list, it does not tell a reader
which controls follow.

**Concrete rewrite:** **“Change text, spacing, contrast, and focus.”** Keep the
medical boundary in the later **“Comfort settings, not medical advice.”**
section.

### F-3-5 — minor — the sitemap omits the demo route

**Location:** `/sitemap.xml` lists `/`, `/privacy/`, and `/terms/`, but not the
real demo entry `/?demo=1`.

The demo has its own state and title (**“Demo — Eye Comfort Profiles”**) and is
a required product route. Omitting it fails the supplied requirement that the
sitemap list every non-error route.

**Concrete fix:** Add
`https://eye-comfort-profiles.sociobot.in/?demo=1` to `sitemap.xml`, or move the
demo to `/demo/` and list that canonical URL.

### F-3-6 — minor — the public version labels conflict

**Quotes/locations:** **“Download v1.0”** in the header and **“Built by Param
Factory · v1.0.2 · polish-2”** in the footer. The packaged manifest is version
`1.0.0`.

A visitor cannot tell whether the download is 1.0, 1.0.0, or 1.0.2. The footer
does not say that its number is a site build rather than the extension version.

**Concrete fix:** Use one exact public product version, such as **“Download
v1.0.0”**, and label a separate deployment identifier explicitly as **“Site
build polish-2.”**

## Copy audit

Counts treat hyphenated forms, version strings, URLs, and slash compounds as
one word. Interface labels and headings are included because a visitor or
screen-reader user encounters them as copy. No item exceeds 22 words and no
banned marketing word appears. The flagged items are F-3-2, F-3-3, F-3-4, and
F-3-6; F-3-1 is the failed result behind a correctly formed action label.

### Landing page

| Exact copy | Words | Flag |
| --- | ---: | --- |
| Skip to main content | 4 | — |
| Eye Comfort Profiles | 3 | — |
| Demo | 1 | — |
| How it works | 3 | — |
| Controls | 1 | — |
| Privacy | 1 | — |
| Download v1.0 | 2 | F-3-6 |
| Demo — sample data, nothing is saved. | 6 | — |
| Reset demo | 2 | — |
| Leave demo | 2 | — |
| Reading profiles for Chromium | 4 | — |
| Save reading settings for each website. | 6 | — |
| For readers with eye strain or low vision, it restores the text size, spacing, contrast, and focus aid they choose. | 20 | — |
| Try it with sample data | 5 | — |
| Download for Chromium | 3 | — |
| The demo opens a live reading preview and saves nothing. | 10 | — |
| Free reading controls. | 3 | — |
| Installed profiles work offline. | 4 | — |
| Settings stay in browser storage. | 5 | — |
| An illustrated cream reading calibration machine guiding abstract lines through a warm horizontal focus band | 15 | — |
| Reading profile preview | 3 | — |
| Generated product artwork | 3 | F-3-2 |
| Save one reading profile for each website. | 7 | — |
| Zoom changed again | 3 | — |
| Lines run too wide | 4 | — |
| Theme lost on return | 4 | — |
| Live preview | 2 | — |
| Adjust a reading sample. | 4 | — |
| There is no “correct” font for every reader. | 8 | — |
| Start with what feels easy, then save the combination—not a prescription. | 12 | — |
| Text size | 2 | — |
| 19 px | 2 | — |
| Line spacing | 2 | — |
| 1.65× | 1 | — |
| Line width | 2 | — |
| 58 ch | 2 | — |
| Reading surface | 2 | — |
| Paper | 1 | — |
| Slate | 1 | — |
| High contrast | 2 | — |
| Live reading sample | 3 | — |
| Preview saved reading settings. | 4 | — |
| Comfort can depend on the page, the hour, and the kind of reading. | 13 | — |
| A narrow article may need generous spacing; a reference page may work better with compact lines. | 16 | — |
| Move these controls to test the geometry. | 7 | — |
| The extension remembers the full combination for each website. | 9 | — |
| How it works | 3 | — |
| Save a profile in three steps. | 6 | — |
| Open a page | 3 | — |
| Select the extension on a regular website. | 7 | — |
| Browser-protected pages stay unchanged. | 4 | — |
| Tune with live feedback | 4 | — |
| Adjust type, size, spacing, line length, surface, and the optional moving focus band. | 13 | — |
| Save to this website | 4 | — |
| Name the profile and assign it. | 6 | — |
| Settings return locally for that website, with no account. | 9 | — |
| Free controls | 2 | — |
| Reading controls without diagnosis claims. | 5 | F-3-4 |
| Choose from four font styles. | 5 | — |
| Choose system sans, rounded sans, serif, or monospaced text. | 9 | — |
| Text size, spacing, and line length. | 7 | — |
| Set 36–96 character lines, line spacing, letter spacing, and text size independently. | 13 | — |
| Optional focus band | 3 | — |
| A translucent guide follows your pointer or keyboard focus without capturing clicks. | 12 | — |
| Store profiles on your device. | 5 | — |
| Only your profile settings and website selections are stored. | 9 | — |
| Export or import them anytime. | 5 | — |
| Manual install for Chromium | 4 | — |
| Install this Chromium build. | 4 | — |
| Use the steps here to load this download in Chromium. | 10 | — |
| Download and unzip | 3 | — |
| Save the package somewhere permanent. | 5 | — |
| Open Extensions | 2 | — |
| Visit chrome://extensions and enable Developer mode. | 7 | — |
| Load unpacked | 2 | — |
| Select the unzipped folder, then pin the instrument icon. | 9 | — |
| Download extension zip | 3 | — |
| One-time supporter unlock | 3 | — |
| $19 | 1 | — |
| No subscription | 2 | — |
| Reading controls stay free. | 4 | — |
| Support the product once and unlock three decorative instrument faceplates. | 10 | — |
| Profiles, website matching, every comfort control, and backup/restore remain free forever. | 11 | F-3-3 |
| Buy supporter unlock | 3 | F-3-1 result |
| A refunded supporter license no longer unlocks faceplates. | 9 | — |
| What this extension does not do | 6 | — |
| Comfort settings, not medical advice. | 5 | — |
| Eye Comfort Profiles changes presentation only. | 6 | — |
| It does not test, diagnose, prevent, or treat any eye condition. | 11 | — |
| Persistent pain or vision changes deserve advice from a qualified eye-care professional. | 12 | — |
| Save the reading settings that work for you. | 8 | — |
| Terms | 1 | — |
| Source | 1 | — |
| Built by Param Factory · v1.0.2 · polish-2 | 6 | F-3-6 |
| No analytics or third-party scripts. | 5 | — |
| You’re offline. | 2 | — |
| The download may be unavailable, but installed profiles keep working. | 10 | — |

### README

| Exact copy | Words | Flag |
| --- | ---: | --- |
| Eye Comfort Profiles | 3 | — |
| Eye Comfort Profiles is a Chromium extension for people who adjust reading settings on different websites. | 16 | — |
| It saves text size, spacing, contrast, and focus settings for each one. | 12 | — |
| It is a comfort utility, not a vision test or medical treatment. | 12 | — |
| Choose from four font styles. | 5 | — |
| It does not send browsing history or page content anywhere. | 10 | — |
| Live site: https://eye-comfort-profiles.sociobot.in | 3 | — |
| Try the isolated sample preview at https://eye-comfort-profiles.sociobot.in/?demo=1#controls. | 7 | — |
| It starts with a realistic reading setup, saves nothing, and resets in one click. | 14 | — |
| What is included | 3 | — |
| Named profiles with four font styles, 14–32px text, line spacing, letter spacing, 36–96-character lines, and four reading surfaces | 18 | — |
| An optional focus band follows the pointer or keyboard focus | 10 | — |
| Save a profile for a website. | 6 | — |
| Other websites stay unchanged. | 4 | — |
| Export and restore a backup file | 6 | — |
| Optional $19 one-time supporter purchase for decorative faceplates; every reading and backup feature remains free | 15 | F-3-3 |
| Static product site, privacy policy, and terms | 7 | — |
| Requirements | 1 | — |
| Node.js 22 or newer | 4 | — |
| npm 10 or newer | 4 | — |
| A Chromium-family browser for loading the built extension | 8 | — |
| Develop | 1 | — |
| npm run build is the release command. | 7 | — |
| It produces: | 2 | — |
| dist/site/index.html — static deployment root | 4 | — |
| dist/site/privacy/index.html, dist/site/terms/index.html, and a designed dist/site/404.html | 6 | — |
| dist/site/downloads/eye-comfort-profiles-chrome.zip | 1 | — |
| dist/extension/chrome-mv3/ — unpacked extension | 3 | — |
| npm run build:site is also self-contained. | 6 | — |
| It produces the static site and stages the packaged extension under dist/site/downloads/, matching the factory static deployment entry point. | 19 | — |
| To test the extension, open chrome://extensions, enable Developer mode, choose “Load unpacked”, and select dist/extension/chrome-mv3. | 15 | — |
| Test and verify | 3 | — |
| Inspect the site, Privacy, and Terms pages. | 7 | — |
| Then test assignment, removal, the focus band, backup, keyboard focus, and a restricted page. | 14 | — |
| npm run test:extension tests the unpacked Chromium extension with keyboard controls. | 11 | — |
| It also checks profile application and an offline local update. | 10 | — |
| After deploying dist/site, run npm run test:live. | 7 | — |
| It checks the public extension ZIP and the 404 page. | 10 | — |
| It also checks identity assets, caching, security headers, and the Sociobot checkout redirect. | 13 | — |
| Set SITE_URL to verify another static deployment target. | 8 | — |
| For production releases, use npm run build && npm run deploy:production. | 10 | — |
| The command deploys dist/site, including the extension ZIP. | 8 | — |
| It then checks that the public ZIP is a valid Chromium Manifest V3 package. | 14 | — |
| The build has no third-party scripts, web fonts, or analytics. | 10 | — |
| An optional Sociobot checkout and license check are the only paid-service calls. | 12 | — |
| Production builds use api.sociobot.in. | 4 | — |
| Privacy and permissions | 3 | — |
| storage holds the local profile document. | 6 | — |
| activeTab identifies the page the reader is actively configuring. | 9 | — |
| Matching uses the website only. | 5 | — |
| The extension does not collect browser history. | 7 | — |
| See the privacy policy and terms. | 6 | — |
| Design and provenance | 3 | — |
| The product-specific mid-century instrument system and generated-art provenance are recorded in .factory/design.md. | 12 | — |
| The source hero image and prompt sidecars live in assets/src/; optimized WebP variants ship locally. | 15 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

## Demo and sandbox

**Pass.** A fresh click on **Try it with sample data** opened
`/?demo=1#controls` at both viewports. The first resulting screen already
showed the working controls and a realistic reading sample: 24px text, 1.80×
line spacing, 52ch lines, and Slate surface. The persistent banner read
**“Demo — sample data, nothing is saved.”** and exposed **Reset demo** and
**Leave demo**.

After changing the size to 28px, Reset restored 24px, 1.80×, 52ch, and Slate.
Fresh contexts retained no localStorage, sessionStorage, IndexedDB, Cache
Storage, cookies, or service-created data. A separate context seeded with the
real license and verdict keys retained both values unchanged after demo edits
and reset. The demo showed no real license status and made only same-origin
requests. This confirms the DOM-only sandbox does not persist into real
storage.

## Claims

The repository was cloned without local build artifacts into
`/tmp/ecp-review3-claims-bMNREO`, then installed with `npm ci`. Every command in
`.factory/claims.json` was run separately and passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| `chromium-download` | `npm run test:release` | PASS — valid ZIP and expected MV3 manifest |
| `sample-demo` | `npm run test:a11y -- --grep @claim:sample-demo` | PASS — desktop and 390px |
| `first-party-site` | `npm run test:a11y -- --grep @claim:first-party-site` | PASS — same-origin request log |
| `free-reading-controls` | `npm run test:extension -- --claim=@claim:free-reading-controls` | PASS — unlicensed controls changed the article |
| `four-font-styles` | `npm run test:extension -- --claim=@claim:four-font-styles` | PASS — four choices and applied style |
| `local-profile-privacy` | `npm run test:extension -- --claim=@claim:local-profile-privacy` | PASS — no external profile-flow requests |
| `offline-profile` | `npm run test:extension -- --claim=@claim:offline-profile` | PASS — 31px update offline |
| `site-profile-reload` | `npm run test:extension -- --claim=@claim:site-profile-reload` | PASS — 32px reapplied after reload |
| `protected-pages-unchanged` | `npm run test:extension -- --claim=@claim:protected-pages-unchanged` | PASS |
| `focus-band-behavior` | `npm run test:extension -- --claim=@claim:focus-band-behavior` | PASS — pointer, focus, and click-through |
| `unassigned-pages-unchanged` | `npm run test:extension -- --claim=@claim:unassigned-pages-unchanged` | PASS |
| `backup-roundtrip` | `npx vitest run tests/model.test.ts -t @claim:backup-roundtrip` | PASS |
| `supporter-price` | `npm run test:a11y -- --grep @claim:supporter-price` | PASS locally, but does not follow the broken live checkout |
| `comfort-not-medical-advice` | `npm run test:a11y -- --grep @claim:comfort-not-medical-advice` | PASS — desktop and 390px |
| `supporter-faceplates` | `npm run test:extension -- --claim=@claim:supporter-faceplates` | PASS — fixture unlocked exactly three faceplates |
| `license-daily-check` | `npx vitest run tests/license.test.ts -t @claim:license-daily-check` | PASS |
| `refund-revocation` | `npx vitest run tests/license.test.ts -t @claim:refund-revocation` | PASS |
| `license-restore` | `npm run test:extension -- --claim=@claim:license-restore` | PASS — fixture token restored three faceplates |

Additional clean-clone gates passed: `npm test` (15/15), `npm run typecheck`,
`npm run build`, and `npm run test:a11y` (28/28). The build produced the static
site, a 28.16kB extension ZIP, and a 50.09kB unpacked MV3 extension.

The registered tests therefore have no failing command. F-3-1 identifies a
missing observable live outcome in `supporter-price`; F-3-2 and F-3-3 identify
public assertions not fully represented by the claims inventory.

## History recheck

Every earlier review, polish report, verification report, and handoff was read.
Each earlier review finding was checked in both current source and live
behavior:

| Earlier finding | Current result |
| --- | --- |
| F-1-1a protected pages | Fixed; registered claim passed against `chrome://settings`. |
| F-1-1b focus band | Fixed; pointer, keyboard focus, and click-through claim passed. |
| F-1-1c store-review timing | Fixed; unsupported timing text remains absent. |
| F-1-1d developer-install/removal promise | Fixed; the unsupported promise remains absent. |
| F-1-1e medical boundary | Fixed; registered exact-copy claim passed. |
| F-1-1f unassigned website | Fixed; unassigned-page claim passed. |
| F-1-1g recovery-state inventory | Fixed; the unproved list remains absent. |
| F-1-1h host-access assertion | Fixed; the unproved README assertion remains absent. |
| F-1-2 preview metaphor | Fixed; replaced with “Preview saved reading settings.” |
| F-1-3 boundary label | Fixed; now “What this extension does not do.” |
| F-1-4 font jargon | Fixed; four plain style names are live and claim-tested. |
| F-1-5 ambiguous “High” | Fixed; now “High contrast.” |
| F-1-6 “Start for real” | Fixed; now “Leave demo.” |
| F-1-7 through F-1-12 README length | Fixed; all cited sentences are split and no README item exceeds 22 words. |
| F-2-1 route focus/announcement | Fixed; live Privacy and back navigation focused the h1 and updated the polite announcer. |
| F-2-2 inconsistent header | Fixed; all four documents use Demo, How it works, Controls, Privacy in the same order. |
| F-2-3a “Secure hosted checkout” | Fixed in copy; “Secure” remains absent. The checkout itself now fails under F-3-1. |
| F-2-3b merchant/refund processing | Fixed; the unproved processing assertion remains absent and revocation is fixture-tested. |
| F-2-3c generated-art provenance | **Half-fixed and reopened as F-3-2; “Generated product artwork” remains public without a claim.** |
| F-2-3d font-boundary statement | Fixed; replaced by the four-style claim. |
| F-2-4 “Local by design” | Fixed; now “Store profiles on your device.” |
| F-2-5 font-fallback jargon | Fixed in README. |
| F-2-6 focus-band compounds | Fixed in README. |
| F-2-7 assignment jargon | Fixed in README. |
| F-2-8 JSON jargon | Fixed in README. |
| F-2-9 website terminology | Fixed; public profile scope consistently uses “website.” |

Earlier verification defects were also rerun. The public ZIP is 200
`application/zip`, has a ZIP signature, passes archive/manifest checks, and
matches the clean build. Typecheck, immutable caching, headers, deterministic
extension claims, styled article text, mobile demo persistence, metadata, and
the designed 404 remain fixed. The original supporter-endpoint defect from
`verification.md` P2 has regressed as F-3-1. The previous handoff's “Known
gaps: None” is therefore no longer accurate for the live service.

## Structure, accessibility, links, and identity

- Home, demo, Privacy, Terms, `/404.html`, and an unknown 404 were checked at
  1440×900 and 390×844. Each has `lang=en`, one `main`, one h1, a route title
  under 60 characters, description, canonical, OG/Twitter metadata, SVG
  favicon, Apple touch icon, consistent header, and required footer content.
- A real unknown URL returns the designed HTTP 404 with a path home. The
  browser's expected document-404 resource message was the only diagnostic on
  that error route; normal routes had no console or page errors.
- Direct home anchors, demo, Privacy, Terms, Source, and the extension ZIP all
  resolved. The ZIP returned 200 `application/zip`; GitHub returned 200. The
  supporter checkout was the only dead link and is F-3-1.
- Live same-site navigation focused and announced the destination h1; back
  navigation restored the home h1 and title announcement. Deep links opened
  the intended demo or section. The sitemap exception is F-3-5.
- `/opt/fleet/lib/verify-url.sh` passed with one h1, `lang=en`, `main`, complete
  image alt coverage, and zero normal-page console errors. Live Playwright/Axe
  checks found zero serious or critical violations at both viewports. The full
  local Playwright/Axe suite passed 28/28, including keyboard focus, reduced
  motion, mobile overflow, route focus, and banner persistence.
- The warm enamel, compact instrument controls, engraved labels, and original
  calibration-machine illustration make the site visually specific to this
  product. It is not a centered generic SaaS hero or three-card template.

## Missed leverage

No additional product feature is an obvious omission from the brief. The
extension already provides per-website profiles, a live preview, offline local
operation, a focus band, and backup import/export. Sync would conflict with the
current local-first promise unless it were explicitly optional and encrypted.
An AI step would add cost and data handling without improving the core manual
reading-calibration job, so none should be added.

## What would make this perfect

Restore the live Sociobot checkout and make its real redirect/product result a
registered claim outcome. Remove or prove the remaining public generated-art
caption. Replace the untestable “free forever” promise with a present-tense,
fully exercised license-boundary claim. Rename the controls heading, list the
demo route in the sitemap, and make the extension/site version labels explicit
and consistent. Then rerun every claim and the live release check from a clean
clone; only a zero-finding result should pass.
