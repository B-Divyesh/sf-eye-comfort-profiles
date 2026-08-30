# Independent verification 5 — Eye Comfort Profiles

**Result: PASS**

- Verified candidate: `12c339049657e561e2705656a4be4ae826c970d9`
- Candidate subject: `docs: record repaired release verification`
- Verified URL: <https://eye-comfort-profiles.sociobot.in>
- Date: 2026-08-30 UTC
- Scope: fresh dependency install, every declared claim test, source quality and
  production artifact checks, a fresh live-browser audit, an unpacked MV3
  extension exercise, and live billing-endpoint allowance verification.

No product files were changed during this verification. The only repository
changes are this evidence report and the verification handoff update.

## Release gates

| Check | Fresh result |
| --- | --- |
| `npm ci` | Pass; 176 packages installed; npm reported 0 vulnerabilities. |
| `npm test` | Pass; 15 tests in 4 Vitest files. |
| `npm run typecheck` | Pass. There is no configured lint script. |
| `npm run build` | Pass; production static site, MV3 directory, and staged ZIP built. |
| `npm run test:release` | Pass; 2/2 archive/manifest tests. |
| `npm run test:a11y` | Pass; 22/22 local Playwright + axe tests across desktop and 390px. |
| `npm run test:extension` | Pass; production unpacked extension smoke flow. |
| `npm run test:live` | Pass; live site and public archive match this production build. |
| `/opt/fleet/lib/verify-url.sh` | Pass against live URL: 200, 871ms browser load, `lang=en`, one `h1`, `main`, image alt coverage, no console errors. Evidence: `/tmp/ecp-verify-5/verify.json`. |

The generated production budgets are within contract: initial site JS is
3.60kB (1.63kB gzip), CSS 15.35kB (4.17kB gzip), no webfont payload, and the
responsive hero images are 18.19kB and 37.82kB. The built MV3 payload totals
50.08kB; the public ZIP is 28,158 bytes.

## Required claims gate

All commands listed in `.factory/claims.json` were run exactly from this clean
checkout and passed.

| Claim | Exact command | Result / observable evidence |
| --- | --- | --- |
| `chromium-download` | `npm run test:release` | Pass, 2/2; built advertised ZIP has a ZIP signature, passes `unzip -t`, and contains the expected MV3 manifest. |
| `sample-demo` | `npm run test:a11y -- --grep @claim:sample-demo` | Pass at desktop and 390px; one click loads 24px, 1.80×, 52ch, Slate sample and no localStorage. |
| `first-party-site` | `npm run test:a11y -- --grep @claim:first-party-site` | Pass at desktop and 390px; sample-preview request log contained only the local product origin. |
| `free-reading-controls` | `npm run test:extension -- --claim=@claim:free-reading-controls` | Pass; keyboard settings applied 32px Humanist text, 2.2 leading, 36ch width, Slate surface, and 180px band without a license. |
| `local-profile-privacy` | `npm run test:extension -- --claim=@claim:local-profile-privacy` | Pass; the full local article profile flow recorded zero external HTTP(S) requests. |
| `offline-profile` | `npm run test:extension -- --claim=@claim:offline-profile` | Pass; keyboard change applied 31px to the article while Chromium was offline. |
| `site-profile-reload` | `npm run test:extension -- --claim=@claim:site-profile-reload` | Pass; 32px saved profile reapplied after article reload. |
| `backup-roundtrip` | `npx vitest run tests/model.test.ts -t @claim:backup-roundtrip` | Pass, 1/1; export/import preserves normalized state. |
| `supporter-price` | `npm run test:a11y -- --grep @claim:supporter-price` | Pass at desktop and 390px; exact $19/no-subscription copy, approved checkout mapping, and free controls. |
| `supporter-faceplates` | `npm run test:extension -- --claim=@claim:supporter-faceplates` | Pass; intercepted valid returned token unlocked exactly brass, coral, and petrol; the only external request was the expected Sociobot verify endpoint. |
| `license-daily-check` | `npx vitest run tests/license.test.ts -t @claim:license-daily-check` | Pass, 1/1. |
| `refund-revocation` | `npx vitest run tests/license.test.ts -t @claim:refund-revocation` | Pass, 1/1. |

## Cold live first-read and demo gate

**Pass.** A cold 390px view plainly answers all required questions in its
first screen:

- Does: “Save reading settings for each site.”
- For whom: “For readers with eye strain or low vision…”
- First action: visible “Try it with sample data”, with adjacent plain outcome
  text saying it opens a live reading preview and saves nothing.

The direct demo URL (`/?demo=1#controls`) opens a seeded reading sample in one
step. Its persistent banner says “Demo — sample data, nothing is saved” and
provides both **Reset demo** and **Start for real**. Fresh desktop and 390px
contexts found `localStorage.length === 0`, `sessionStorage.length === 0`, and
no cookies after the demo flow. Reset restored the documented sample values.
The inspected live mobile screenshot is `/tmp/ecp-live-cold-mobile-demo.png`.

## Independent browser, accessibility, privacy, and mobile results

Fresh live Playwright sessions at 1440×900 and 390×844 found:

- HTTP 200, `lang=en`, exactly one `h1`, one `main`, no horizontal overflow,
  and title `Eye Comfort Profiles — Save reading settings by site`.
- No console errors, page errors, or failed requests. Demo request origins
  contained only `https://eye-comfort-profiles.sociobot.in`; no analytics,
  CDN scripts, webfonts, trackers, or data egress appeared.
- Zero axe **serious** or **critical** violations on the live home page at both
  viewports. The local full suite also covers home, privacy, terms, and 404 at
  both viewports (22/22).
- Keyboard `End` changed the demo size control; focus was visibly designed as
  `rgb(155, 61, 39) solid 3px`. The skip link is first in the tab order.
- At the end of a mobile page scroll, the demo banner remained fully inside
  the viewport (`y=68`, height `96.34px`) with reset and exit actions visible.
- `prefers-reduced-motion: reduce` reduced both animation and transition
  duration to `1e-05s`.

The home response includes header-delivered CSP with `frame-ancestors 'none'`
and only the required Sociobot `connect-src` exception, HSTS, COOP,
`X-Frame-Options: DENY`, `nosniff`, strict-origin referrer policy, and a
restrictive permissions policy. HTML revalidates; the hashed JS asset has
`public, max-age=31536000, immutable`; the archive has `public, max-age=3600`.

## Extension end-to-end and recovery checks

The fresh production unpacked MV3 extension was loaded in Chromium against a
local article whose paragraph declares its own 15px typography. Its normal
keyboard flow applied the profile (including 32px text on that styled
paragraph), Slate surface, focus band, offline adjustment, and hostname reload
persistence. Before assignment, it did not alter the article.

An additional independent popup exercise verified the expected user recovery
paths and bounds:

- Home/End on Text size produced `14 px` and `32 px`.
- Assigning the profile modified the article; **Stop using on this site**
  restored its original 15px paragraph and removed the injected style.
- An empty profile name announced `Profile name cannot be empty.`
- An unrelated JSON file announced `That file is not an Eye Comfort Profiles
  backup.`

No sign-in is required, so the Microsoft Entra External ID tenant requirement
is not applicable.

## Deployment identity, archive, checkout, and allowance

`npm run test:live` byte-compared the public home page and advertised archive
with this build. The live public archive SHA-256 is
`e6c50b3d8843eb7cf69f5b8998a317e39307ddc5993817a56419fb46c42fc7ad`; it
matches `dist/site/downloads/eye-comfort-profiles-chrome.zip`, is served as
`application/zip`, passes `unzip -t`, and contains the expected Manifest V3
Eye Comfort Profiles manifest. The live checkout endpoint returned the
approved 303 redirect to `checkout.dodopayments.com`; no payment provider is
embedded in the product. The live unknown route returned the designed HTTP
404 page.

The only server-side product call is the approved Sociobot license/checkout
service. Using a single fresh invalid-license client probe against the product
verification endpoint, requests 1–30 returned 200 (invalid-license response)
and request **31** returned **429** with `Retry-After: 4` and body “Too Many
Requests! Wait for 4s”. Observed allowance: **30 requests per rate window**.

## Defects

No release-blocking, high, medium, or low product defects found in this
verification. The initial URL-checker attempt was retried with its required
evidence directory pre-created; its first failure was the checker’s documented
shell-output assumption, not a live product response. The completed check
passed as recorded above.

## Verdict

**PASS — candidate `12c339049657e561e2705656a4be4ae826c970d9` meets the
researched brief and supplied verification contract at the verified live URL.**
