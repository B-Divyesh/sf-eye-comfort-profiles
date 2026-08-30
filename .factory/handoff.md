# Eye Comfort Profiles — review 3 handoff

## Delivered

- Work order: `eye-comfort-profiles-review-3`
- Reviewed candidate: `c30e28d34ee2263901fa7c4a59f24cbe9ff5caca`
- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Review: `.factory/review-3.md`
- Verdict: **FAIL** — six findings, including two blocking findings

No product code was modified. The review and this handoff are the only intended
repository changes.

## Main results

- Cold 390×844 and 1440×900 first screens clearly state the job, audience, and
  first action.
- The one-click demo is seeded, immediately useful, resettable, same-origin,
  and does not touch real browser storage.
- Every command in `.factory/claims.json` passed from a separate clean clone.
  `npm test` (15/15), typecheck, build, and `npm run test:a11y` (28/28) also
  passed.
- The live **Buy supporter unlock** flow returns HTTP 500. A browser click,
  `curl`, link crawl, and `npm run test:live` reproduced it.
- The live **Generated product artwork** caption leaves `review-2.md` F-2-3c
  only half-fixed because it still has no claims entry or test.
- Four minor findings cover the untestable “free forever” scope, a jargon
  heading, the missing demo sitemap entry, and conflicting public versions.

## Verification

Run from a clean checkout:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:a11y
npm run test:live
```

The first five commands pass. `npm run test:live` currently fails because the
Sociobot checkout endpoint returns 500 instead of the required Dodo 303.

Every individual claim command and its observed result are recorded in
`.factory/review-3.md`. `/opt/fleet/lib/verify-url.sh` passed against the live
home page. Live Playwright/Axe checks at desktop and 390px found no serious or
critical accessibility violations.

## Next steps

Repair the Sociobot checkout mapping first. Then remove or register the public
generated-art claim, resolve the four minor findings, and rerun the complete
claim list plus `npm run test:live` before another review.
