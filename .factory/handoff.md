# Eye Comfort Profiles — independent verification handoff

**Status: FAIL — do not release candidate
`7cec9703abdbb0b8a5da6d26c2653686750232fb`.**

- Work order: `eye-comfort-profiles-verify-4`
- Tested URL: <https://eye-comfort-profiles.sociobot.in>
- Verification date: 2026-08-30 UTC
- Full report: [`.factory/verification-4.md`](verification-4.md)

## Release blockers

1. A required first-pass claim command failed. `npm run test:extension --
   --claim=@claim:local-profile-privacy` applied the default 96px focus band
   after keyboard selection of 180px and exited 1. Ten later reruns passed, so
   the claim proof is intermittent rather than fixed. The work order defines
   any failing claim command as release-blocking.
2. The core text-size control does not override common article CSS. In a
   production-extension test, a paragraph explicitly styled at 15px remained
   15px after selecting 32px. Line spacing and 36ch width changed, confirming
   the profile applied but text size did not.
3. Paid-product statements ($19 one-time/no subscription, three faceplates,
   verification cadence, and refund revocation) are visitor-reliance claims
   absent from `.factory/claims.json` and lack complete sandbox proof.

## Additional defects

- At 390px the demo banner is `position: relative` and scrolls off screen,
  contrary to the persistent sandbox-notice requirement.
- Unknown live routes return the home page with 200 instead of a designed 404.
- Required Open Graph/Twitter metadata, social image, SVG/touch icons, “Built
  by Param Factory,” and footer build identity are missing.

## What passed

- The cold first screen plainly says what the extension does, who it is for,
  and exposes a one-click populated sample demo.
- `npm ci`, `npm audit`, `npm test` (13/13), `npm run typecheck`, `npm run
  build`, `npm run test:release` (2/2), `npm run test:a11y` (18/18), the later
  full `npm run test:extension`, local/live `verify-url.sh`, and `npm run
  test:live` passed. No lint script is configured.
- The live home, legal pages, assets, and ZIP byte-match the candidate build.
  The public MV3 ZIP is 27,855 bytes with SHA-256
  `5d4e4e255c10c8e2fbe4b1e5089944f105ec34d695c7ffad0f5b833530eacaea`.
- Desktop and 390px live checks found no serious/critical axe findings,
  console/page errors, failed requests, overflow, or third-party demo
  requests. Keyboard focus, reduced motion, invalid-input recovery, backup,
  delete/cancel, restricted-page, offline, and reload paths otherwise worked.
- Security headers and immutable asset caching pass. The Sociobot checkout
  reaches Dodo and shows $19. The verify endpoint allowed 30 requests in the
  observed window; request 31 returned 429 with `Retry-After: 4`.
- Mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; FCP/LCP 1.4s, CLS 0, TBT 0ms, 69KiB total transfer.

## Reproduce

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

Also test the unpacked production extension against an article whose paragraph
sets its own `font-size`; selecting 32px currently leaves that paragraph
unchanged. Product code was not modified during verification.
