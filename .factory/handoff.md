# Eye Comfort Profiles — verification handoff

**Status: FAIL — do not release candidate `1bef92bf2309c26ad5baac672c67b4b15b1ddc94`.**

Independent verification on 2026-08-27 found that the live deployment at
<https://eye-comfort-profiles.sociobot.in> serves the home page as
`/downloads/eye-comfort-profiles-chrome.zip`. It is `text/html`, not a valid
ZIP, so a real user cannot install the browser extension. This is a release
blocker even though the locally built MV3 artifact and core reading-profile
flow work.

The candidate's home HTML, JS, and CSS match the deployed assets, but the ZIP
route does not. Fresh checks: `npm test` (5/5), `npm run build`, and
`npm run test:a11y` (8/8) passed; `npx tsc --noEmit` failed on an unresolved
`defineContentScript` global. Live desktop and 390px browser checks had no
console/page errors or axe serious/critical findings.

Required before release:

1. Publish the actual generated ZIP at the live download path and verify it
   extracts.
2. Fix the standalone TypeScript check.
3. Register/configure the optional supporter checkout; the live pilot endpoint
   currently returns 404.
4. Set immutable caching for hashed assets and add missing response hardening
   policies.

Full commands, evidence, passed coverage, privacy/outbound-request review,
bundle sizes, and severity-ranked defects are in
[`verification.md`](verification.md).
