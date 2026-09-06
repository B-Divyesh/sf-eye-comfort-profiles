# Eye Comfort Profiles — review 4 handoff

## Result

**FAIL.** Strict review found 5 findings and 3 untested public claims. Product
code was not changed, as required by the review work order.

## Release identity

- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Implementation reviewed: `ce566af87d67f272d6eda924e3cbc98a5198661c`
- Documentation baseline: `13f05d883854609ece48f4baab22d3c3ec07b992`
- Only documentation files differ from the implementation candidate.
- Public MV3 ZIP: 28,208 bytes; SHA-256
  `468f7b7da765c1e677b13307a87ed8580fafb7f2df7cb0ecb579b5247b7a09fb`.

## Findings to repair

1. Complete the declared demo and no-analytics tests, and register or remove
   the Privacy page’s uninstall-data claim.
2. Clear or replace the live page preview after deleting its assigned profile.
3. Raise informative website copy to the 16 px supplied minimum and the 17 px
   design-thesis target.
4. Replace native malformed-JSON parser text with a plain recovery message.
5. Make the desktop header Demo link at least 44×44 CSS px.

Full reproduction details are in `.factory/review-4.md`.

## Verification completed

- Fresh `npm ci`: 176 packages; zero vulnerabilities.
- All 20 declared claim commands exited 0 when invoked separately.
- `npm test`: 15/15 passed.
- `npm run typecheck`: passed.
- `npm run build` and `npm run test:release`: passed.
- `npm run test:extension`: passed against the installed production artifact.
- `npm run test:a11y`: 30/30 passed.
- `npm run test:live`: passed.
- `npm audit --omit=dev`: zero vulnerabilities.
- Fresh desktop and phone live checks covered first screen, one-click sample,
  populated output, reset, storage isolation, routes, links, keyboard focus,
  reduced motion, legal pages, and the designed HTTP 404.
- `/opt/fleet/lib/verify-url.sh` passed in 794 ms.
- Mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices,
  and 100 SEO; FCP 1.0 s, LCP 1.0 s, TBT 0 ms, CLS 0, transfer 66 KiB.

Evidence is under `/work/.evidence/eye-comfort-profiles-review-4/`.
The work order's referenced `factory-evidence/.../qa-report.md` was absent from
this checkout and `/work`; `.factory/verification-7.md` was read in full.

## Known limits

This is a static site and Chromium extension. Backend tenant isolation, server
restart persistence, a product health route, and product-server 429 behavior do
not apply. No product code was repaired during this reviewer-only assignment.

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
npm audit --omit=dev
```

Run every command in `.factory/claims.json` separately after repairs.
