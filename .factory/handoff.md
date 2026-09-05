# Eye Comfort Profiles — repair 6 handoff

## Release identity

- Work order: `eye-comfort-profiles-repair-6`
- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Deployed implementation SHA: `52a41500a8fb35f978f45ba4841729ca6bd504a8`
- Follow-up test-only SHA: `8771e62f3ede5c4b8ace7a56da058b450d7b3624`
- This handoff is a later documentation commit. The test-only follow-up does
  not change the built extension or static site runtime.
- Deployment: the existing one-replica static product configuration was used.
  It published the complete `dist/site`, including the MV3 ZIP. No backend,
  volume, environment, or infrastructure configuration was changed.

## What changed

- The live Sociobot checkout is healthy again. `npm run test:live` now requires
  the advertised endpoint to return a Dodo 303 and its hosted page to show
  **Eye Comfort Profiles** at **$19.00**. This is an outcome check, not a link
  string check.
- Removed the public **Generated product artwork** caption and the README
  provenance assertion. Asset provenance remains in `.factory/design.md`, as
  required, without becoming a public untested claim.
- Replaced the untestable “free forever” wording with: “A supporter license
  adds three faceplates. Profiles, website matching, reading controls, and
  backups work without one.” Added `unlicensed-profile-tools`, which starts a
  fresh unlicensed MV3 extension, saves a keyboard-tuned profile to a local
  website, checks the visible reading result, then exports and imports the
  backup.
- Changed the Free controls heading to “Change text, spacing, contrast, and
  focus.”
- Added the direct demo URL to `sitemap.xml` and a browser regression check.
- Made public release labels consistent: **Download v1.0.0**, **Extension
  v1.0.0**, and **Site build repair-6**.
- Updated the landing copy audit and copied the unchanged verb-first catalog
  description to `/work/.evidence/catalog-description.txt`.

## Review finding disposition

| Finding | Current disposition and evidence |
| --- | --- |
| F-3-1 checkout 500 | Fixed externally before this repair; live endpoint returns 303 to Dodo, and hosted checkout visibly lists the product at $19.00. `npm run test:live` passed from a clean checkout. |
| F-3-2 generated-art claim | Fixed. The public caption and README provenance claim were removed. The retained internal provenance record is `.factory/design.md`. |
| F-3-3 free-forever scope | Fixed. The present-tense named-feature statement is covered by the fresh unlicensed extension export/import claim. |
| F-3-4 producer-jargon heading | Fixed with the plain feature heading. |
| F-3-5 demo missing from sitemap | Fixed and browser-tested against the built sitemap. |
| F-3-6 conflicting versions | Fixed across home, legal pages, 404, browser tests, and live verification. |
| F-1-1a–h | Still covered: protected page, focus-band, medical-boundary, unassigned-website, privacy, and font-style claims run against fresh extension/browser contexts; unsupported schedule, recovery-inventory, and host-access wording remains absent. |
| F-1-2–F-1-12 | The plain headings, terminology, demo exit label, and short README wording remain in place. `.factory/copy-audit.md` has no sentence over 22 words or banned wording. |
| F-2-1–F-2-9 | Route heading focus/announcement, shared navigation, proven supporter wording, plain profile terminology, and README wording remain covered by the 30-test browser suite and live route check. |
| Earlier `verification*.md` findings | The ZIP is live and byte-matches the clean build; typecheck passes; styled article text, offline persistence, mobile demo notice, metadata, security headers, immutable assets, designed 404, and footer identity all remain verified. |

## Verification

From a fresh clone at `8771e62` after `npm ci`:

```bash
npm test
npm run typecheck
npm run build
npm run test:release
npm run test:extension
npm run test:a11y
npm run test:live
```

All passed: 15 Vitest tests, 2 release-artifact tests, the full production
extension smoke flow, 30 Playwright/Axe tests at desktop and 390px, and the
live archive/headers/404/checkout check.

Each of the 19 commands declared in `.factory/claims.json` was also run
individually from that clean checkout. All passed. This includes the new
unlicensed profile-tools claim, the live $19 checkout outcome, offline
adjustment, website reload, protected-page boundary, focus-band click-through,
backup round-trip, restored license, and revoked-license behaviors.

Live evidence:

- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, 842ms browser load,
  title, `lang=en`, one h1, main landmark, image alt coverage, and zero console
  errors. Evidence: `/tmp/eye-comfort-profiles-repair-6-verify/verify.json`.
- Fresh 1440×900 desktop and 390×844 phone contexts both showed the job
  (“Save reading settings for each website”), audience (readers with eye strain
  or low vision), and first action before scrolling. One click opened the
  populated 24px / 1.80× / 52ch / Slate demo; Reset restored it; a seeded real
  browser-storage marker survived demo edits and reset. Screenshots:
  `/tmp/eye-comfort-profiles-repair-6-desktop.png` and
  `/tmp/eye-comfort-profiles-repair-6-phone.png`.
- Live Playwright/Axe checks found zero serious or critical violations on home,
  Privacy, Terms, the designed 404, and an unknown route. The deliberate
  unknown-route HTTP 404 produced only the browser’s expected 404 diagnostic.
  Thirteen destination links were checked successfully.
- Mobile Lighthouse: Performance **99**, Accessibility **100**, Best
  Practices **100**, SEO **100**; FCP/LCP **1.7s**, CLS **0**, TBT **0ms**.
  Evidence: `/tmp/eye-comfort-profiles-repair-6-lighthouse.json`.

## Known gaps and next steps

No known product defects remain. The optional paid purchase still depends on
the Sociobot/Dodo hosted checkout; it is currently healthy and is checked in
the live release command. All meaningful reading controls, matching, and
backup remain usable without it.
