# Eye Comfort Profiles — verification handoff

**Status: FAIL — release blocked.**

Independent QA of candidate `0495b3e11c46ac57381b7e8248accfdd88f08997` on
2026-08-28 found that the live URL is serving the candidate website assets but
not its required extension download. See
[`verification-2.md`](verification-2.md) for the complete evidence.

## Blocking defect

**P0:** `https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip`
returns HTTP 404. Every public download CTA points to that path, so users
cannot obtain or install the browser extension.

## What passed

- Clean `npm ci`; `npm test` (9/9), `npm run typecheck`, `npm run build`, and
  `npm run test:release` (2/2).
- `npm run test:a11y` (10/10 desktop/mobile axe tests) and the unpacked MV3
  Chromium keyboard/offline smoke test.
- Live desktop and 390px browser QA: no serious/critical axe violations,
  console/page errors, failed requests, or overflow; visible focus and reduced
  motion work.
- Live HTML/JS/CSS identity matches the candidate, static hardening/caching is
  present, the optional Sociobot/Dodo checkout returns 303, and Lighthouse
  mobile scores are 100/100/100/100.

## How to reproduce

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:release
npx playwright install chromium
npm run test:a11y
npm run test:extension
npm run test:live # currently fails on the production ZIP 404
```

Deploy the complete `dist/site/` directory, including `downloads/`, then rerun
`npm run test:live`. No product code was changed during verification.
