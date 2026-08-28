# Eye Comfort Profiles — verification handoff

**Status: FAIL — do not release.**

- Work order: `eye-comfort-profiles-verify-3`
- Verified candidate: `e2926e4e43fe1fe3f884e22645097863413df805`
- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Full evidence: `.factory/verification-3.md`

## Release-blocking defect

Fresh evidence contradicts the prior repaired/deployed status: the advertised
production download URL currently returns **404 Not Found**:

`https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip`

All public installation CTAs point to that URL, so users cannot install the
browser extension. The live `index.html` hash exactly matches the requested
candidate; this is an incomplete deployment of an otherwise valid build.

## Verification evidence

All checks below were run from a fresh `npm ci` checkout of the requested
candidate. Playwright Chromium was installed with
`npx playwright install chromium` to match the repository's dependency.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 401 packages installed. |
| `npm test` | Passed: 10/10 model and release-configuration assertions, including the deployment regression. |
| `npm run typecheck` | Passed (`tsc --noEmit`). This project has no separate lint configuration. |
| `npm run build` | Passed; generated static site, unpacked MV3 artifact, and staged 28.3 kB Chromium ZIP. |
| `npm run test:release` | Passed: 2/2 package/consumer assertions; ZIP signature, extraction, and MV3 metadata verified at its public-site path. |
| `npm run test:a11y` | Passed: 10/10 Playwright + axe tests across `/`, `/privacy/`, and `/terms/` at desktop and 390×844 mobile. |
| `npm run test:extension` | Passed: unpacked production MV3 artifact, keyboard profile controls, 180px focus boundary, application to a real HTTP page, and offline local 31px update/persistence; no console errors. |
| `npm audit --omit=dev` | Passed: 0 production vulnerabilities. |
| `npm run test:live` | **Failed:** the advertised public ZIP returned 404. |
| Live browser and headers | Passed for the rendered site: exact candidate HTML, no console errors, first-party-only runtime requests, hardened headers, and immutable hashed assets. |
| Lighthouse mobile | Passed: Performance 100, Accessibility 100; FCP/LCP 1.0 s, CLS 0, TBT 0 ms. |

The local candidate artifact is valid: it is 28,295 bytes, passes `unzip -t`,
and contains the expected MV3 manifest. It is simply not served by production.

The local browser suite covers desktop and 390px mobile, keyboard behavior,
axe accessibility, privacy-safe first-party UI behavior, and reduced motion.
The extension smoke additionally covers the offline/update path. The live
release verifier covers static response policy, archive delivery, and the
Sociobot/Dodo identity redirect. The source and shipped runtime remain
local-first with no analytics, remote fonts, or third-party runtime scripts.

## Required next step

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:release
npx playwright install chromium
npm run test:a11y
npm run test:extension
npm audit --omit=dev
npm run deploy:production
npm run test:live
```

Do not report deployment complete until the fresh public verifier passes and
the ZIP is a `200 application/zip` response with valid archive contents.
