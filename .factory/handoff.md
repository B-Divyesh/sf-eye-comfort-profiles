# Eye Comfort Profiles — review 2 handoff

## Completed review

- Work order: `eye-comfort-profiles-review-2`
- Reviewed commit: `f8dca5a6e7ed9430857cd6bd90ffec159f7e69a8`
- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Product code: unchanged. This commit contains only this handoff and
  `.factory/review-2.md`.

## Verification performed

- Fresh live Chromium checks at 390×844 and 1440×900.
- Demo click/direct URL, reset, storage isolation, request logging, and
  real-license-storage preservation checks.
- Fresh GitHub clone with `npm ci`, `npm test` (15/15), `npm run typecheck`,
  `npm run build`, `npm run test:release`, full `npm run test:a11y` (24/24),
  every command in `.factory/claims.json`, and `npm run test:live`.
- Live link crawl, response/metadata/404 inspection, history recheck, and
  `/opt/fleet/lib/verify-url.sh`.

## Result and next steps

**FAIL.** The review records nine findings. Blocking work is needed for
route-change focus/announcement and four unsupported public factual claims.
The remaining work is a consistent header plus six plain-language and
terminology revisions. See `.factory/review-2.md` for exact locations,
rewrites, and required regression tests.
