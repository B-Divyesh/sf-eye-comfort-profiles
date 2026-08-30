# Adversarial first-read review 1 — Eye Comfort Profiles

**URL checked:** https://eye-comfort-profiles.sociobot.in  
**Date:** 2026-08-30 UTC  
**Verdict: FAIL**

## Cold first read

Fresh 390×844 and 1440×900 Chromium contexts showed the job, audience, and first
action before scrolling. In my words: this is a Chromium extension that saves
text size, spacing, contrast, and focus settings for each website. It is for
readers with eye strain or low vision. I should click **Try it with sample
data** to open a live preview without saving. The first-screen gate passes.

## Findings

### F-1-1 — BLOCKING — factual promises are absent from claims.json

The claims contract requires an entry and observable sandbox test for every
visitor-relevant factual promise. These landing/README promises have no matching
entry in `.factory/claims.json`:

| Location | Exact unlisted claim | Required fix |
| --- | --- | --- |
| Landing, How it works step 1 | “Protected browser pages remain untouched.” | Add `protected-pages-unchanged`, tested on a fresh extension against a protected URL, or delete it. |
| Landing, focus-band feature | “A translucent guide follows your pointer or keyboard focus without capturing clicks.” | Add pointer, keyboard-focus, and click-through assertions under a registered claim, or reduce the copy to tested behaviour. |
| Landing, install section | “Chrome Web Store review comes later.” | Delete this unsupported schedule/status claim. |
| Landing, install section | “This factory build installs in developer mode and can be removed at any time.” | Add an observable install/uninstall claim test, or retain only the direct instruction. |
| Landing, medical boundary | “It does not test, diagnose, prevent, or treat any eye condition.” | Add a scope/safety copy assertion to a claim, or retain a shorter reviewed disclaimer. |
| README, What is included | “Explicit per-hostname assignment; regular pages are never changed until a reader chooses a profile.” | Add an unassigned-page assertion and use “website address” in the public wording. |
| README, What is included | “Restricted-page, empty, storage-error, and offline-license states” | Add a recovery test for each advertised state, or list only tested states. |
| README, Privacy and permissions | “Host access is required for the content script that applies CSS on HTTP and HTTPS pages.” | Add a manifest/installed-extension claim test or remove this implementation assertion. |

Passing broader tests does not make these claims listed. The repair must add
individual `@claim:<id>` evidence from a clean state, not just a JSON identifier.

### F-1-2 — minor — preview heading is a metaphor

**Quote/location:** “A layout that returns with you”, reading preview heading.

**Fix:** “Preview saved reading settings.”

### F-1-3 — minor — section label carries no information

**Quote/location:** “A clear boundary”, medical-note label.

**Fix:** “What this extension does not do.”

### F-1-4 — minor — adjective and typography jargon obscure a feature

**Quote/location:** “Four honest font stacks” and “System, humanist, serif, or
mono fallbacks…”. “Honest” is a marketing adjective; “humanist”, “mono”, and
“fallbacks” are unexplained reader jargon.

**Fix:** Heading: “Choose from four font styles.” Sentence: “Choose system
sans, rounded sans, serif, or monospaced text.”

### F-1-5 — minor — reading-surface option is ambiguous

**Quote/location:** “High”, in the Reading surface radio group. The same page
says “contrast”, but this option does not say what is high.

**Fix:** “High contrast.”

### F-1-6 — minor — demo-exit action does not name its result

**Quote/location:** “Start for real”, persistent demo banner.

A visitor cannot tell whether this installs, signs up, or only closes the demo.

**Fix:** “Leave demo” (or “Leave demo and download” if it goes to installation).

### F-1-7 — minor — README opening sentence exceeds the 22-word cap

**Quote (25 words):** “Eye Comfort Profiles is a Chromium browser extension for
people who repeatedly adjust text size, line length, spacing, contrast, or
focus aids on different sites.”

**Fix:** “Eye Comfort Profiles is a Chromium extension for people who adjust
reading settings on different websites. It saves text size, spacing, contrast,
and focus settings for each one.”

### F-1-8 — minor — README testing instruction bundles too many actions

**Quote (27 words):** “Then inspect the site, `/privacy/`, and `/terms/`; load
the unpacked extension; and test assignment, removal, focus band, backup
import/export, keyboard focus, and a restricted browser page.”

**Fix:** “Inspect the site, Privacy, and Terms pages. Then test assignment,
removal, the focus band, backup, keyboard focus, and a restricted page.”

### F-1-9 — minor — README extension-test description exceeds the cap

**Quote (35 words):** “`npm run test:extension` loads the production unpacked
MV3 artifact in Chromium, exercises the popup using only keyboard controls,
verifies its injected reading profile, and confirms a local profile update while
the browser is offline.”

**Fix:** “`npm run test:extension` tests the unpacked Chromium extension with
keyboard controls. It also checks profile application and an offline local
update.”

### F-1-10 — minor — README live-test description bundles too many ideas

**Quote (34 words):** “It checks the public ZIP at the advertised path with
`unzip -t`, the designed 404 route, social/identity assets, immutable asset
caching, response-hardening headers, and the production Sociobot checkout
redirect.”

**Fix:** “It checks the public extension ZIP and the 404 page. It also checks
identity assets, caching, security headers, and the Sociobot checkout redirect.”

### F-1-11 — minor — README deployment sentence is too long and opaque

**Quote (28 words):** “That command deploys the complete `dist/site` directory
(including the advertised `/downloads/` archive) and fails unless the public ZIP
is a valid Eye Comfort Profiles Manifest V3 package.”

**Fix:** “The command deploys `dist/site`, including the extension ZIP. It then
checks that the public ZIP is a valid Chromium Manifest V3 package.”

### F-1-12 — minor — README build/privacy sentence exceeds the cap

**Quote (25 words):** “The build uses no third-party runtime scripts, web fonts,
analytics, or paid service other than the optional Sociobot-hosted checkout and
license verify request.”

**Fix:** “The build has no third-party scripts, web fonts, or analytics. An
optional Sociobot checkout and license check are the only paid-service calls.”

## Copy audit

Counts treat hyphenated terms, URLs, version numbers, and numeric readouts as
one word. The complete landing-page inventory is in `.factory/copy-audit.md`;
I rechecked its 97 visible labels/sentences against the live DOM. Every landing
string is at or below 22 words. The full inventory is referenced here rather
than duplicated verbatim; its previously unflagged items are:

| Exact landing string [words] | Flag and rewrite |
| --- | --- |
| “Stop repeating the same adjustments.” [5] | Low-information slogan. Use “Save one reading profile for each website.” |
| “Reading geometry” [2] | Jargon. Use “Text size, spacing, and line length.” |
| “This factory build” [3] | Internal jargon. Use “This download.” |
| “A layout that returns with you” [6] | F-1-2. |
| “A clear boundary” [3] | F-1-3. |
| “Four honest font stacks” [4]; “System, humanist, serif, or mono fallbacks…” [15] | F-1-4. |
| “High” [1] | F-1-5. |
| “Start for real” [3] | F-1-6. |

### README sentence/bullet inventory

Commands, paths, headings, and the license label are identifiers rather than
sentences. All remaining README prose and bullets are listed below.

| Exact sentence or bullet [words] |
| --- |
| Eye Comfort Profiles is a Chromium browser extension for people who repeatedly adjust text size, line length, spacing, contrast, or focus aids on different sites. [25]* |
| It saves named reading profiles locally and reapplies the selected profile when the reader returns to a hostname. [16] |
| It is a comfort utility, not a vision test or medical treatment. [12] |
| The product does not prescribe one “accessible” font and does not send browsing history or page content anywhere. [16] |
| Live site: https://eye-comfort-profiles.sociobot.in [4] |
| Try the isolated sample preview at https://eye-comfort-profiles.sociobot.in/?demo=1#controls. [6] |
| It starts with a realistic reading setup, saves nothing, and resets in one click. [13] |
| Named profiles with font fallback, 14–32px text, line height, letter spacing, 36–96 character line width, and four reading surfaces [19] |
| Optional pointer- and keyboard-focus-following reading band [6] |
| Explicit per-hostname assignment; regular pages are never changed until a reader chooses a profile [14] |
| Local JSON backup and restore [5] |
| Restricted-page, empty, storage-error, and offline-license states [6] |
| Optional $19 one-time supporter purchase for decorative faceplates; every reading and backup feature remains free [15] |
| Static product site, privacy policy, and terms [7] |
| Node.js 22 or newer; npm 10 or newer; A Chromium-family browser for loading the built extension [5; 4; 8] |
| npm run build is the release command. [7] |
| dist/site/index.html — static deployment root [7] |
| dist/site/privacy/index.html, dist/site/terms/index.html, and a designed dist/site/404.html [17] |
| dist/site/downloads/eye-comfort-profiles-chrome.zip; dist/extension/chrome-mv3/ — unpacked extension [5; 5] |
| npm run build:site is also self-contained. [6] It produces the static site and stages the packaged extension under dist/site/downloads/, matching the factory static deployment entry point. [17] |
| To test the extension, open chrome://extensions, enable Developer mode, choose “Load unpacked”, and select dist/extension/chrome-mv3. [18] |
| Then inspect the site, /privacy/, and /terms/; load the unpacked extension; and test assignment, removal, focus band, backup import/export, keyboard focus, and a restricted browser page. [27]* |
| npm run test:extension loads the production unpacked MV3 artifact in Chromium, exercises the popup using only keyboard controls, verifies its injected reading profile, and confirms a local profile update while the browser is offline. [35]* |
| After deploying dist/site, run npm run test:live. [6] |
| It checks the public ZIP at the advertised path with unzip -t, the designed 404 route, social/identity assets, immutable asset caching, response-hardening headers, and the production Sociobot checkout redirect. [34]* |
| Set SITE_URL to verify another static deployment target. [8] |
| For production releases, use npm run build && npm run deploy:production. [8] |
| That command deploys the complete dist/site directory (including the advertised /downloads/ archive) and fails unless the public ZIP is a valid Eye Comfort Profiles Manifest V3 package. [28]* |
| The build uses no third-party runtime scripts, web fonts, analytics, or paid service other than the optional Sociobot-hosted checkout and license verify request. [25]* |
| Production builds use api.sociobot.in. [4] |
| storage holds the local profile document. [6] |
| activeTab identifies the page the reader is actively configuring. [9] |
| Host access is required for the content script that applies CSS on HTTP and HTTPS pages. [14] |
| Matching uses hostname only and no browser history is collected. [9] |
| See the privacy policy and terms. [6] |
| The product-specific mid-century instrument system and generated-art provenance are recorded in .factory/design.md. [14] |
| The source hero image and prompt sidecars live in assets/src/; optimized WebP variants ship locally. [15] |
| MIT. See LICENSE. [3] |

## Demo, claims, sandbox, structure, and history

- **Demo: passed.** A fresh-context click opened `/?demo=1#controls` with 24 px
  text, 1.80× spacing, 52 ch width, Slate surface, a realistic reading sample,
  and the persistent “Demo — sample data, nothing is saved” banner. Reset
  restored those values. localStorage was empty before, during, and after.
  Requests were same-origin only.
- **Claims: passed where registered.** In a clean clone at `138ac29`, `npm ci`
  had 0 vulnerabilities; `npm test` passed 15/15. Every command in
  `.factory/claims.json` passed: MV3 download, demo, first-party requests, free
  controls, local privacy, offline/reload, backup, supporter price/faceplates,
  daily license check, and revocation.
- **Structure: passed.** `npm run build` produced `dist/`; full
  `npm run test:a11y` passed 22/22 at desktop and 390px; `npm run test:live`
  verified the live 28,158-byte MV3 ZIP matches the build, checkout redirect,
  headers, assets, and designed HTTP 404. Home, Privacy, Terms, and 404 have
  route-specific titles, descriptions, canonicals, social metadata, favicons,
  one h1/main, and live links. The warm mid-century instrument identity is
  product-specific rather than a generic SaaS template.
- **History: passed.** The earlier `verification.md` P0 ZIP, P1 typecheck, P2
  billing/caching, and P3 headers; `verification-2.md`/`verification-3.md` P0
  archive; and `verification-4.md` P0 async profile, P1 styled typography/paid
  claims, and P2 banner/metadata findings are fixed in code and live checks.
  No earlier finding is re-opened.
- **Missed leverage: none.** The brief implies import/export and offline local
  profiles; both exist. AI would not improve this core job and should not be
  added.

## What would make this perfect

Add tested claims for every factual promise, remove the six plain-language
flags, and split the six long README sentences. Then the clear first screen,
real demo, local-first behaviour, archive, accessibility baseline, and
distinctive visual system would have no remaining first-read work.

