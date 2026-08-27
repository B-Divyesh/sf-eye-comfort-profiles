# Independent verification — FAIL

- **Work order:** `eye-comfort-profiles-verify-1`
- **Verified candidate:** `1bef92bf2309c26ad5baac672c67b4b15b1ddc94`
- **Live URL:** <https://eye-comfort-profiles.sociobot.in>
- **Date:** 2026-08-27
- **Result:** **FAIL — do not release this deployment.** The locally built
  extension works, but the live product's only install link serves the home
  HTML instead of the Chrome extension ZIP.

## Release-blocking defect

### P0 — public download is not an extension archive

`GET https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip`
returned `200 text/html`, `content-length: 10468`, and SHA-256
`c05d1a99c6312d719c217331dc332cb8ecd7961aa713fb33ee9dd6cab9d850c8`.
That hash is the live home page. `unzip -t` reported no end-of-central-directory
signature. The freshly built candidate ZIP is 28,301 bytes with SHA-256
`ba3aa3f1fa96b7212aad5f220820b53d1eb996e9c4dc8179c43cd989d9dcd88d`.

Impact: a visitor can neither download nor install the product, so the real
job-to-be-done cannot be completed on the deployed URL. Fix the static-host
rewrite/fallback rule or publish `dist/site/downloads/eye-comfort-profiles-chrome.zip`,
then re-verify the response as a valid ZIP.

## Other defects

### P1 — available TypeScript check fails

From the clean candidate checkout, `npx tsc --noEmit` fails:

```
entrypoints/content.ts(118,16): error TS2304: Cannot find name 'defineContentScript'.
```

The production build happens to pass because WXT transforms that global, but
the repository's available type check does not pass, which fails the stated
quality gate.

### P2 — supporter purchase endpoint is unusable in production

The live site's purchase link and `shared/license.ts` use
`https://pilot-api.sociobot.in/api/v1/products/eye-comfort-profiles/checkout`.
On 2026-08-27 it returned `404` with
`{"error":"enabled factory product","status":404}`. The production API
endpoint returned the same 404. This does not block free reading controls, but
the advertised optional $12 supporter purchase cannot be completed.

### P2 — immutable assets are not cached as immutable

The live hashed JS and CSS assets return
`cache-control: public, must-revalidate, max-age=30`, not a long-lived
immutable policy. This misses the supplied static-product caching requirement
and makes repeat visits revalidate assets.

### P3 — response hardening policies are incomplete

The live HTML response has HSTS, `nosniff`, and a strict referrer policy, but
does not send Content-Security-Policy, frame-ancestors/X-Frame-Options,
Permissions-Policy, or COOP. This is not the reason for the release failure,
but should be addressed in the static host configuration.

## What passed

### Clean checkout and build

| Check | Fresh result |
| --- | --- |
| `npm ci` | Pass; npm reported 10 development dependency audit findings (1 low, 2 moderate, 4 high, 3 critical) |
| `npm audit --omit=dev` | Pass, 0 production vulnerabilities |
| `npm test` | Pass, 5/5 Vitest tests |
| `npx tsc --noEmit` | **Fail** (P1 above) |
| lint/typecheck npm scripts | No `lint` or `typecheck` script is defined |
| `npm run build` | Pass; generated extension, site, and ZIP |
| `npm run test:a11y` | Pass, 8/8 Playwright + axe tests across desktop and 390px mobile |

The exact production build was successful. Built assets: site JS 3,140 B
(1,450 B gzip), site CSS 14,254 B (3,980 B gzip), responsive hero WebPs
18,192/37,818 B, no font payload; extension JS is 19,397 B combined. These
are within the supplied budgets.

### Installed-extension end-to-end smoke test

Loaded `dist/extension/chrome-mv3/` into fresh Chromium profile and exercised
a regular local HTTP article. Before explicit assignment, no extension style
was present. Keyboard-only interaction then set text size to the upper boundary
of 32 px, enabled the focus band, and saved the profile. The article received
32 px type and the focus band; the profile persisted after reload with no page
or console errors. A separately seeded max-value profile verified font,
2.2 line height, 0.12em letter spacing, 36ch width, slate surface, 180px band,
keyboard-focus tracking, and reload persistence.

Recovery/boundary paths exercised in the popup:

- empty profile name: `Profile name cannot be empty.` and previous name kept;
- a new profile, 36ch minimum line width, cancel-delete, and confirmed delete;
- unrelated JSON import: `That file is not an Eye Comfort Profiles backup.`;
- protected/non-HTTP URL behavior is covered by the unit test and popup's
  restricted-page state.

### Live page QA

On `/`, `/privacy/`, and `/terms/`, at desktop (1440px) and mobile (390px):

- one `<main>` and one `<h1>` on every page;
- zero axe serious/critical violations, zero console errors, page errors, or
  failed requests;
- home preview slider changed to `28 px`, Slate surface applied, and horizontal
  overflow was 0px;
- keyboard focus was visibly 3px; reduced-motion transition duration was
  effectively disabled (`0.00001s`);
- observed page requests were first-party site documents/assets only—no fonts,
  analytics, tracking pixels, or third-party runtime scripts.

The live home HTML, `main-Ccpag63M.js`, and `style-DIG3Gcq2.css` hash-match
the candidate build. The ZIP route does not, as described in P0.

Lighthouse mobile JSON recorded Performance 99, Accessibility 100, Best
Practices 100, SEO 100; FCP/LCP 1.7 s, CLS 0, TBT 0 ms. Lighthouse emitted a
terminal Chromium target-crash message while taking a post-audit screenshot,
after producing the report; the browser/axe checks above completed cleanly.

## Privacy and policy observations

Manifest permissions are `storage`, `activeTab`, and `<all_urls>` host access;
content matching is limited to HTTP(S). Source/build inspection found no
history API, analytics, remote font, CDN, or runtime telemetry use. Storage is
local extension storage and hostname matching is explicit. The only product
network endpoint in source is the optional Sociobot license checkout/verify
path, currently misconfigured/unregistered as noted in P2.

## Required next steps

1. Publish/serve the generated ZIP at the exact download URL and re-run an
   archive integrity check.
2. Make `npx tsc --noEmit` pass (or define the intended checked type command).
3. Register/configure the supporter product and switch the production build to
   the production Sociobot API.
4. Set long immutable caching for hashed assets and add the missing response
   hardening policies.
