# Independent verification 2 — FAIL

- **Work order:** `eye-comfort-profiles-verify-2`
- **Candidate commit:** `0495b3e11c46ac57381b7e8248accfdd88f08997`
- **URL tested:** <https://eye-comfort-profiles.sociobot.in>
- **Verification date:** 2026-08-28 UTC
- **Result:** **FAIL — do not release.** The live page matches the candidate,
  but its only installation artifact is unavailable in production.

## Release blocker

### P0 — advertised Chromium extension ZIP returns 404

Fresh `GET` requests to
`https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip`
returned **HTTP 404** with `content-type: text/html` on 2026-08-28. The home
page's header, hero, and install-section download links all point to that exact
path. A visitor therefore cannot download, unzip, and install the extension;
the real job-to-be-done cannot be completed from the public product URL.

This is a deployment artifact omission, not a candidate-build defect:

- Fresh local `npm run build` produced
  `dist/site/downloads/eye-comfort-profiles-chrome.zip` (28.3 kB) and
  `npm run test:release` verified its ZIP signature, extraction, and MV3
  manifest.
- The candidate static configuration excludes `/downloads/*` from the HTML
  fallback and defines the expected cache policy, so production must publish
  the built `dist/site/downloads/` directory and then be rechecked.

## Candidate and deployment identity

The failure is limited to the missing archive. The deployed page assets match
the freshly built candidate byte-for-byte:

| Asset | SHA-256, live and local |
| --- | --- |
| `assets/main-aysXxDiX.js` | `2451cc5f4202a87e368dba95a7e6ed28593f329da7cf63139f26893551934594` |
| `assets/style-DIG3Gcq2.css` | `825737aa7304d3b0b6f0f53a219219c576dab92aa573817271ebbe074ee60d33` |

The live checkout mapping is healthy: `GET
https://api.sociobot.in/api/v1/products/eye-comfort-profiles/checkout` returned
`303` to `https://checkout.dodopayments.com/session/...`. The $19 unlock is
optional and all reading controls remain free.

## Local clean-checkout results

`git status --short --branch` was clean at the requested candidate before
installation. `npm ci` completed successfully (401 packages); npm reports 10
development-tooling audit findings, while `npm audit --omit=dev` reports **0
production vulnerabilities**.

| Command | Fresh result |
| --- | --- |
| `npm test` | Pass — 9/9 model and release-configuration tests |
| `npm run typecheck` | Pass — `tsc --noEmit` |
| `npm run build` | Pass — MV3 extension, static site, and staged ZIP |
| `npm run test:release` | Pass — 2/2 artifact consumer checks |
| `npm run test:a11y` | Pass — 10/10 Playwright + axe checks at desktop and 390×844 |
| `npm run test:extension` | Pass — unpacked MV3 Chromium end-to-end smoke |
| `npm run test:live` | **Fail**, correctly detecting the live ZIP 404 |

There is no configured lint script; strict TypeScript is the repository's
available source-quality check.

### Extension end-to-end coverage

The built unpacked MV3 artifact was loaded in a fresh Chromium profile against
a real local HTTP article. Keyboard-only interaction set the 32 px upper text
size, Slate surface, enabled the focus band, and used `End` to reach its 180 px
upper bound before saving to the hostname. The page received `32px` type,
`rgb(28, 37, 38)` background, and a 180 px band. While the browser was
offline, a keyboard decrement immediately applied and persisted the local
31 px setting. There were no page console errors.

Model tests independently exercised the boundary clamps (including invalid
numeric input), removed dangling hostname assignments, portable backup
round-trip, rejection of unrelated JSON, and refusal to operate on protected
or non-HTTP(S) URLs. The popup provides the corresponding named empty-name,
invalid-import, protected-page, deletion-confirmation, and storage-error
recovery states; its build is included in the MV3 artifact test.

## Live website QA

Fresh Playwright + axe browser runs covered `/`, `/privacy/`, and `/terms/` at
1440px desktop and 390×844 mobile:

- 1 `<h1>` and 1 `<main>` per page; no serious or critical axe findings.
- No console errors, page errors, failed requests, or horizontal overflow.
- The keyboard-operated preview reached 28 px, switched to Slate, and exposed
  a visible 3 px focus outline. Reduced-motion transition duration was
  effectively disabled (`0.00001s`).
- Requests during each page load were first-party only
  (`eye-comfort-profiles.sociobot.in`); no runtime analytics, tracking pixel,
  CDN font, or third-party script was observed.
- `/privacy/` and `/terms/` both returned 200.

Mobile Lighthouse against production: Performance **100**, Accessibility
**100**, Best Practices **100**, SEO **100**; FCP/LCP **1.2 s**, CLS **0**,
TBT **90 ms**.

## Privacy, headers, caching, and budgets

- Source/runtime review found profile storage only in extension local storage;
  no history API use, browsing-content collection, analytics, or remote font.
  The only product network path is the optional Sociobot license verification
  endpoint, and the checkout is Sociobot/Dodo as required.
- The MV3 permissions are `storage`, `activeTab`, and `<all_urls>` host
  access; content scripts match only HTTP(S) URLs, and hostname matching is
  explicit/local.
- Live HTML sends CSP (`frame-ancestors 'none'` and only self plus the
  Sociobot API for connections), COOP `same-origin`, Permissions-Policy,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer
  policy, and HSTS. Hashed JavaScript sends `Cache-Control: public,
  max-age=31536000, immutable`.
- Build output is within budget: site JS 3.13 kB (1.44 kB gzip), CSS 14.25 kB
  (3.98 kB gzip), no webfonts, hero WebP 18.19/37.82 kB, and all extension
  code below 20 kB combined.

## Required remediation and re-verification

1. Deploy the exact `dist/site/downloads/eye-comfort-profiles-chrome.zip`
   alongside the candidate site; do not route it to HTML or omit it.
2. Verify `200`, `application/zip`, `PK\x03\x04`, successful `unzip -t`, and
   the MV3 manifest at the public URL.
3. Rerun `npm run test:live` and this verification before changing the result
   to PASS.
