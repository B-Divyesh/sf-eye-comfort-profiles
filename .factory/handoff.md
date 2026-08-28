# Eye Comfort Profiles — repair handoff

**Status: repaired, verified, pushed, and deployed.**

Work order: `eye-comfort-profiles-repair-2`
Verifier candidate: `1bef92bf2309c26ad5baac672c67b4b15b1ddc94`
Repair commits: `cacfcfc`, `275964d`, and `ba1c7b4`
Deployment: Azure Static Web App `sf-eye-comfort-profiles`, deployment
`40c5f77e-4d71-4dbb-981b-8c9e9ab5bb69`, 2026-08-28.

## Repair summary

- The Chromium MV3 ZIP is built and staged at the exact public site path:
  `dist/site/downloads/eye-comfort-profiles-chrome.zip`. The static fallback
  excludes `/downloads/*`, so an archive route cannot be rewritten to HTML.
  The actual deploy was repeated from that built directory; this is the root
  cause of the verifier's P0 being fixed in production rather than merely in
  source.
- `defineContentScript` is now explicitly imported, so `npm run typecheck`
  passes without depending on WXT's transform.
- The optional $19 one-time supporter link uses the live Sociobot mapping,
  `https://api.sociobot.in/api/v1/products/eye-comfort-profiles/checkout`.
  The deployed endpoint returns a `303` to hosted Dodo checkout. Reading and
  backup controls remain free and local-first.
- Static configuration serves hashed `/assets/*` with `public,
  max-age=31536000, immutable`, keeps downloads separately cacheable, and sends
  CSP with `frame-ancestors 'none'`, COOP, Permissions Policy, nosniff, strict
  referrer policy, and `X-Frame-Options: DENY`.
- A keyboard boundary issue found during final extension QA was repaired: the
  56–180px focus-band range now uses a 4px step, so keyboard `End` reaches the
  advertised 180px maximum (the previous 8px step stopped at 176px).

## Regression coverage

- `tests/release-config.test.ts` asserts the live billing URL, archive fallback
  exclusion, immutable cache policy, hardening headers, and a focus-height step
  lattice that reaches 180px.
- `tests/release-artifact.test.ts` checks the staged archive at its advertised
  path, ZIP signature/extraction, and MV3 manifest metadata.
- `scripts/verify-live-release.mjs` (`npm run test:live`) checks the deployed
  ZIP response type/signature/extraction, immutable hashed JavaScript policy,
  response hardening, and live Sociobot/Dodo checkout identity.
- `scripts/extension-smoke.mjs` (`npm run test:extension`) loads the production
  unpacked MV3 artifact in Chromium, uses keyboard-only range/switch/save
  controls, verifies the 32px Slate 180px-focus profile on a real HTTP page,
  then confirms a local 31px update while the browser is offline.

## Verification evidence

All commands below passed after a clean `npm ci` (Playwright Chromium was
installed with `npx playwright install chromium` for the repository's
Playwright 1.62.1 dependency):

| Check | Result |
| --- | --- |
| `npm test` | 9/9 unit and release-configuration assertions passed |
| `npm run typecheck` | Passed (`tsc --noEmit`) |
| `npm run build` | Passed; generated `dist/site`, MV3 unpacked artifact, and ZIP |
| `npm run test:release` | 2/2 packaging/consumer assertions passed |
| `npm run test:a11y` | 10/10 Playwright + axe checks on desktop and 390×844 mobile for `/`, `/privacy/`, and `/terms/`; no serious/critical findings or console errors |
| `npm run test:extension` | Passed; keyboard profile application, focus band, offline local update, no console errors |
| `npm run test:live` | Passed against production after deploy |
| `/opt/fleet/lib/verify-url.sh` | Passed against production: HTTP 200, title, `lang`, one `<h1>`, `<main>`, complete image alt text, and zero console errors |
| `npm audit --omit=dev` | 0 production vulnerabilities |

`npm ci` reported 10 audit findings in development tooling (1 low, 2 moderate,
4 high, 3 critical); production dependency audit is clean. The project has no
separate lint configuration; strict TypeScript type checking is the configured
source-quality gate.

Production archive evidence after deployment:

- `GET /downloads/eye-comfort-profiles-chrome.zip` → `200`,
  `application/zip`, `content-length: 28295`, `Cache-Control: public,
  max-age=3600`.
- Download SHA-256: `235fb1eb3d112354a810780604bf352ddac957a651ef86f07d08a9cff5200add`.
  It exactly matched the local staged ZIP, and `unzip -t` passed all entries.
- `GET /assets/main-aysXxDiX.js` → `Cache-Control: public,
  max-age=31536000, immutable`.
- Production HTML sent CSP, COOP `same-origin`, Permissions Policy,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and strict
  referrer policy.
- The production checkout returned `303` to `checkout.dodopayments.com`.

Lighthouse mobile, run on the deployed URL with Chromium 150:

| Performance | Accessibility | Best Practices | SEO | FCP | LCP | CLS | TBT |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 100 | 100 | 100 | 100 | 1.1 s | 1.1 s | 0 | 70 ms |

Static budgets remain well within limits: initial site JavaScript is 3.13 kB
(1.44 kB gzip), CSS is 14.25 kB (3.98 kB gzip), there is no webfont payload,
responsive hero WebPs are 18.2/37.8 kB, and extension JavaScript is below
20 kB combined. Source and runtime inspection found no analytics, tracking,
remote fonts, CDNs, page-content collection, or browsing-history collection.

## How to repeat

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:release
npx playwright install chromium
npm run test:a11y
npm run test:extension
npm run test:live
```

`npm run build` is the deployment input. For the factory static deployment:

```bash
/opt/fleet/lib/deploy-static.sh eye-comfort-profiles dist/site
```

## Known gap

The ZIP is a Chromium MV3 developer-mode installation artifact. Chrome Web
Store signing/review is intentionally outside this repository and deployment
workflow; all shipped reading-profile functionality is usable from the current
download.
