# Eye Comfort Profiles — polish 1 handoff

## Released repair

- Work order: `eye-comfort-profiles-polish-1`
- Base reviewed: `138ac29b57776fd06d6bda5c78b2bb4e8c87812a`
- Review repaired: `e19e08322db188e3b3eead74b976f3221c1fd6fc`
- Product repair commit: `82f4910310871333efb2a11ef4b6d228d6a5f0d7`
- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Deployment: `npm run deploy:production` to the static work-order target.

The landing copy now uses direct reader language, the demo safely skips all
real license storage and verification, and every factual promise raised by the
review has a registered observable claim test. The product remains a WXT
Manifest V3 Chromium extension with a static landing site and downloadable ZIP.

## Verification

A fresh clone at `/tmp/eye-comfort-profiles-clean-lBoRSG` completed `npm ci`,
`npm test` (15/15), `npm run typecheck`, `npm run build`, `npm run test:a11y`
(24/24 across desktop and 390px), `npm run test:extension`, and
`npm run test:release` (2/2). It then ran every command listed in
`.factory/claims.json`; all 16 passed.

The production build is 3.61 kB gzip JavaScript, 4.17 kB gzip CSS, and ships
18.19/37.82 kB responsive hero WebPs. The MV3 archive is 28,158 bytes.

Live evidence after deployment:

- `npm run test:live` passed: public archive SHA-256
  `e6c50b3d8843eb7cf69f5b8998a317e39307ddc5993817a56419fb46c42fc7ad`
  matches the build; security headers, billing redirect, immutable asset cache,
  and HTTP 404 passed.
- `/opt/fleet/lib/verify-url.sh https://eye-comfort-profiles.sociobot.in /tmp/ecp-polish-1-live-verify`
  passed with 200, `lang=en`, one `h1`, one `main`, alt coverage, and no errors.
- Cold live Playwright desktop and 390px demo checks found the new copy, seeded
  24px/1.80×/52ch/Slate sample, persistent mobile banner, no console errors,
  only same-origin requests, unchanged seeded real license storage, and zero
  axe serious/critical findings. Screenshots:
  `/tmp/ecp-polish-1-live-desktop-demo.png` and
  `/tmp/ecp-polish-1-live-mobile-demo.png`.

See `.factory/polish-1.md` for the finding-by-finding mapping.

## Known gaps

None. The manual Chromium ZIP installation remains the documented distribution
method; no Chrome Web Store timing promise is made.
