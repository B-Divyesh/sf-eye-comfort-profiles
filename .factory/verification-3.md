# Independent verification 3 — FAIL

- **Work order:** `eye-comfort-profiles-verify-3`
- **Candidate commit:** `e2926e4e43fe1fe3f884e22645097863413df805`
- **URL tested:** <https://eye-comfort-profiles.sociobot.in>
- **Date:** 2026-08-28 UTC
- **Result:** **FAIL — do not release.** The candidate builds and the unpacked
  extension works end to end, but the live product again lacks its sole
  installation artifact.

## Release blocker

### P0 / Critical — advertised extension ZIP is absent in production

At fresh verification time, `npm run test:live` failed on:

```text
https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip
returned 404 Not Found
```

An independent `curl -I` confirmed `HTTP/2 404` and `content-type: text/html`.
The header, hero, and install-section links all target that exact URL. This
prevents a visitor from downloading, unzipping, loading, and using the browser
extension, so the researched job-to-be-done cannot be completed from the live
product.

This is a deployment-artifact failure, not a source-build failure. The exact
candidate's fresh `npm run build` produced
`dist/site/downloads/eye-comfort-profiles-chrome.zip` (28,295 bytes); `unzip
-t` passed and its `manifest.json` is the expected Eye Comfort Profiles MV3
manifest. Publish that file with the complete `dist/site` deployment, then run
`npm run test:live` against production before declaring a repair.

## Candidate/deployment identity

The failed route is the only observed mismatch. The fresh local and live
`index.html` files have the identical SHA-256:

```text
0261e10e5f363cb48649596d21b580fec55dbf1bc4e4abe7b73502634c8eed4c
```

The live page references the same current candidate hashes
`main-aysXxDiX.js`, `style-DIG3Gcq2.css`,
`panel-reader-hero-640-DalvCz-E.webp`, and
`panel-reader-hero-960-DeHdSrhX.webp`. Thus the public page accurately
advertises the candidate but its required downloadable extension is missing.

## Fresh clean-checkout evidence

I cloned the specified commit into a new temporary checkout, ran `npm ci`, and
used that checkout for all build and test commands. The project locks
Playwright 1.62 while the environment initially provided a different browser
revision, so I ran the documented `npx playwright install chromium` before the
browser suites. This is an environment setup requirement, not an application
failure.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 401 packages installed. |
| `npm test` | Pass; 10/10 Vitest model/release tests. |
| `npm run typecheck` | Pass (`tsc --noEmit`). No separate lint script exists. |
| `npm run build` | Pass; production MV3 artifact, static site, and staged ZIP produced. |
| `npm run test:release` | Pass; 2/2 release-artifact tests. |
| `npm run test:extension` | Pass after browser installation; production unpacked MV3 smoke passed with no console errors. |
| `npm run test:a11y` | Pass; 10/10 Playwright + axe checks over `/`, `/privacy/`, and `/terms/` at desktop and 390x844 mobile. |
| `npm audit --omit=dev` | Pass; 0 production dependency vulnerabilities. |
| `npm run test:live` | **Fail** on the production ZIP 404. |

### Independent extension exercise

I loaded `dist/extension/chrome-mv3` into a new Chromium profile against a
real local HTTP article. Keyboard-only operation created a profile, set the
minimum boundaries (14 px type, 1.2 line height, 36ch width, 0em tracking,
high-contrast surface, 56 px focus band), assigned it to the hostname, and
confirmed the computed page results. Settings reapplied after reload.

I also verified an empty profile-name recovery message, rejection/recovery for
unrelated JSON import, cancel-delete behavior, explicit removal from the site,
and that removal survived reload. A focused range control reported a solid
visible outline; no page or console errors occurred. The repository smoke test
separately verified the normal upper boundaries (32 px, Slate,
180 px focus band) and a local update while offline (31 px persisted).

## Browser, accessibility, privacy, performance, and policy evidence

- Fresh Playwright runs found one `h1`, one `main`, `lang=en`, no console or
  page errors, no horizontal overflow, and a visible keyboard focus outline at
  desktop and 390px mobile. Axe reported zero serious or critical findings for
  the home, privacy, and terms pages.
- With reduced motion emulated, the live focused control had transition and
  animation duration `0.00001s`; focus remained visible.
- Fresh live page loads requested only
  `https://eye-comfort-profiles.sociobot.in`. There were no observed analytics,
  tracking, CDN-font, or third-party runtime requests. Source/build review
  confirms local extension storage and hostname matching; the only product
  network call is the optional Sociobot license verification. The checkout
  endpoint returned the required `303` to a Dodo hosted checkout.
- Live HTML, privacy, terms, hashed JS, CSS, and images return the configured
  CSP, COOP `same-origin`, `X-Frame-Options: DENY`, `nosniff`, strict referrer
  policy, and HSTS. Hashed JS/CSS/images return
  `Cache-Control: public, max-age=31536000, immutable`.
- Build budgets pass: initial site JS 3,134 bytes (1.44 kB gzip), CSS 14,254
  bytes (3.98 kB gzip), no webfont payload, and responsive hero WebPs of
  18,192/37,818 bytes. Mobile Lighthouse against the live home scored
  Performance **100** and Accessibility **100** (FCP/LCP 1.0 s, CLS 0, TBT 0
  ms).

## Required remediation

1. Deploy the exact generated
   `dist/site/downloads/eye-comfort-profiles-chrome.zip` alongside the existing
   live candidate assets.
2. Verify the public URL returns `200`, `application/zip`, a `PK` ZIP
   signature, passes `unzip -t`, and contains the expected MV3 manifest.
3. Rerun `npm run test:live` from a fresh environment. Do not convert this
   verification to PASS based only on a deployment log.
