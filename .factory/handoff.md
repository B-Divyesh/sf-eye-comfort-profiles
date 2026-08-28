# Eye Comfort Profiles — repair handoff

**Status: repaired, verified, pushed, and deployed.**

- Work order: `eye-comfort-profiles-repair-3`
- Verifier report: `.factory/verification-2.md` at `90e073d`
- Repair commit: `c2a910de64f07dfe661eb4f203114116d04099b8`
- Deployment: Azure Static Web App `sf-eye-comfort-profiles`, deployment
  `629bffdd-772e-4caf-9d9a-92ab002251a6`, 2026-08-28 UTC.

## Repair

The independent verifier's sole release blocker was real and reproduced before
the repair: `npm run test:live` received `404 Not Found` for the advertised
`/downloads/eye-comfort-profiles-chrome.zip` archive.

The cause was an incomplete static deployment, not a broken build. The release
workflow now has `npm run deploy:production`, which refuses to run unless
`dist/site/downloads/eye-comfort-profiles-chrome.zip` exists, deploys the
complete `dist/site` root with the factory static deployment configuration, and
runs the public-release verifier afterwards. `scripts/verify-live-release.mjs`
now additionally reads and validates the downloaded `manifest.json`, so a ZIP
that is not this MV3 extension cannot pass. `tests/release-config.test.ts`
locks this deployment and post-deploy-verification contract in place.

No product behavior, researched scope, permissions, or visual system changed.

## Verification evidence

All checks below were run from a fresh `npm ci` after the repair. Playwright's
project Chromium (`v1234`) was installed with `npx playwright install
chromium` because the preinstalled browser revision did not match the pinned
project dependency.

| Check | Result |
| --- | --- |
| `npm ci` | Passed; 401 packages installed. npm reports 10 development-tooling audit advisories (1 low, 2 moderate, 4 high, 3 critical). |
| `npm test` | Passed: 10/10 model and release-configuration assertions, including the deployment regression. |
| `npm run typecheck` | Passed (`tsc --noEmit`). This project has no separate lint configuration. |
| `npm run build` | Passed; generated static site, unpacked MV3 artifact, and staged 28.3 kB Chromium ZIP. |
| `npm run test:release` | Passed: 2/2 package/consumer assertions; ZIP signature, extraction, and MV3 metadata verified at its public-site path. |
| `npm run test:a11y` | Passed: 10/10 Playwright + axe tests across `/`, `/privacy/`, and `/terms/` at desktop and 390×844 mobile. |
| `npm run test:extension` | Passed: unpacked production MV3 artifact, keyboard profile controls, 180px focus boundary, application to a real HTTP page, and offline local 31px update/persistence; no console errors. |
| `npm audit --omit=dev` | Passed: 0 production vulnerabilities. |
| `npm run test:live` before deployment | Reproduced verifier finding: ZIP endpoint returned 404. |
| `npm run deploy:production` | Uploaded the complete `dist/site` directory via the factory Azure static deployment configuration. |
| `npm run test:live` after deployment | Passed: public ZIP `200`, `application/zip`, ZIP signature and extraction, expected MV3 manifest, immutable hashed JavaScript policy, CSP/COOP/XFO, and live Sociobot/Dodo `303` checkout identity. |
| `/opt/fleet/lib/verify-url.sh` after deployment | Passed: live desktop browser load in 814 ms; zero console errors; title, `lang=en`, one `<h1>`, `<main>`, and complete image alt text. |

Public artifact after deployment:

- URL: `https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip`
- Response: `200`, `application/zip`, `Cache-Control: public, max-age=3600`
- Length: `28295` bytes
- SHA-256: `e8f37700b88255ff6b6f829a81bf691fd6eb2a2e0c60000bb43551748e93e52e`
- `unzip -t`: passed all entries. `manifest.json`: `manifest_version: 3`,
  `name: Eye Comfort Profiles`.

The local browser suite covers desktop and 390px mobile, keyboard behavior,
axe accessibility, privacy-safe first-party UI behavior, and reduced motion.
The extension smoke additionally covers the offline/update path. The live
release verifier covers static response policy, archive delivery, and the
Sociobot/Dodo identity redirect. The source and shipped runtime remain
local-first with no analytics, remote fonts, or third-party runtime scripts.

## Release procedure

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
```

`npm run deploy:production` must be used for the factory static release; it
deploys `dist/site` rather than an asset-only directory and verifies the live
download immediately afterwards. Set `SITE_URL` when validating another target.

## Known gap

The ZIP is a Chromium MV3 developer-mode installation artifact. Chrome Web
Store signing/review is intentionally outside this repository and deployment
workflow. All shipped reading-profile functionality is usable from this
download.
