# Eye Comfort Profiles — repair 7 handoff

## Result

**PASS.** The five independent-verification findings are repaired and the live
static product now matches the release build at
<https://eye-comfort-profiles.sociobot.in>.

## Release identity

- Deployed implementation: `023fa64e7ef7bc4a079c7ed9e6c22409495f0757`
  (`7f6e186e113397d220ad93c4406509680a2fc9fe` contains the functional repair;
  `023fa64` adds a space in the visible/accessibility headline text).
- Documentation handoff: recorded in the commit that updates this file.
- Public MV3 ZIP: 28,210 bytes, SHA-256
  `0858641aa9c8e196c129c3980163b8d7a60c2f52463ba4032927fa2912961a93`.
  `npm run test:live` byte-matched it with `dist/site` after deployment.
- Catalog description is verb-first, 64 bytes, and is copied unchanged to
  `/work/.evidence/catalog-description.txt`.

## Repairs

| Verification 6 finding | Repair and regression evidence |
| --- | --- |
| F-6-1: settings did not preview before save | The content script now keeps a temporary preview separate from saved website assignments. `@claim:live-page-preview` changes an unassigned article to 32px, waits through the storage event, and proves the visible preview remains while no assignment exists. |
| F-6-2: free-controls evidence was incomplete | `@claim:free-reading-controls` now proves all four font styles and four surfaces, plus both endpoints of 14–32px text, 1.2–2.2 line spacing, 0–0.12em letter spacing, 36–96ch line width, and 56–180px focus height. Every result is read from the rendered article or focus band with no supporter license. |
| F-6-3: focus switch was 48×28px | The labelled switch and invisible checkbox input are both 48×44px. The extension browser smoke measures both rendered target boxes and fails below 44px. |
| F-6-4: popup jargon/metaphor | The visible popup now says **Reading profiles** and exposes **Reading controls** to assistive technology. The browser smoke reads those rendered labels. |
| F-6-5: copy audit mismatch | `.factory/copy-audit.md` now exactly records “Select the extension on a regular website.”, matching the shipped landing text. |

The small h1 spacing follow-up also makes the cold page’s programmatic text
read “Save reading settings for each website.” rather than concatenating two
words around the visual line break.

## Verification

From the documented clean setup, `npm ci` completed with 0 vulnerabilities.

- `npm test` — 15/15 Vitest tests passed.
- `npm run typecheck` — passed.
- `npm run build` and `npm run test:release` — passed; release-artifact tests
  2/2, `dist/site` and the MV3 package produced.
- `npm run test:extension` — passed against the fresh production unpacked MV3
  artifact. It covers pre-save preview, every free control boundary, styled
  article typography, touch target, keyboard/focus band, unassigned/protected
  pages, offline update, reload persistence, backup/recovery, and local-only
  profile traffic.
- `npm run test:a11y` — 30/30 Playwright and Axe checks passed across desktop
  and 390px mobile for home, legal pages, and 404.
- Every one of the 20 commands in `.factory/claims.json` was invoked exactly
  (including the newly added `live-page-preview` command) and passed. The
  supporter-price command passed live: the Sociobot checkout returned 303 to
  the hosted Eye Comfort Profiles $19.00 checkout.
- `npm run test:live` — passed after deployment: archive, checksum, headers,
  cache policy, checkout, legal/identity routes, and designed HTTP 404.
- `/opt/fleet/lib/verify-url.sh` — live 200, 966ms, correct title/lang, one
  h1/main, no missing alt text or console errors. Evidence:
  `/work/.evidence/eye-comfort-profiles-repair-7-verify-url/`.
- Fresh HTTPS Playwright desktop (1440×900) and phone (390×844) contexts both
  showed the job, audience, and **Try it with sample data** before scrolling.
  The one-click demo showed 24px / 1.80× / 52ch / Slate, kept its sample-data
  label visible, reset to 24px, and left browser localStorage empty.
- A fresh live Axe run found zero serious/critical violations at both sizes;
  requests were first-party only and there were no console errors.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.1s, LCP 1.2s, CLS 0, TBT 60ms. JSON evidence:
  `/work/.evidence/eye-comfort-profiles-repair-7-lighthouse.json`.

## Earlier-history disposition

The ZIP publishing failures from verification 1–3, typecheck, billing,
immutable-cache, header, and archive regressions remain covered by the live
release verifier. Verification 4's styled-content, focus-height, demo-banner,
metadata, 404, and paid-claim repairs remain covered by the current browser,
artifact, and claim suites. Review 1–3 and polish findings remain covered by
the route-focus, shared-navigation, sample-isolation, terminology, and claim
tests. No earlier issue reopened.

## Known gaps and next steps

None for the researched browser-extension scope. This is a static product with
no product backend or tenant database, so persistence-restart, tenant-isolation,
health, and product-server rate-limit checks are not applicable. The approved
hosted billing/license service remains the only external product dependency.

## Runbook

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:release
npm run test:extension
npm run test:a11y
npm run test:live
```

Run each command listed in `.factory/claims.json` separately for the full
claim gate. Deploy the static release with `npm run deploy:production`.
