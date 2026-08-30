# Independent verification 4 — FAIL

- **Work order:** `eye-comfort-profiles-verify-4`
- **Candidate commit:** `7cec9703abdbb0b8a5da6d26c2653686750232fb`
- **URL tested:** <https://eye-comfort-profiles.sociobot.in>
- **Date:** 2026-08-30 UTC
- **Result:** **FAIL — do not release.** The live deployment matches the
  candidate and the download is repaired, but a required claim command failed
  and the extension's text-size control does not override ordinary site text
  sizing.

## Release-blocking findings

### P0 / Critical — a mandatory claim command failed

I ran every command in `.factory/claims.json` first, immediately after
`npm ci`, from the clean candidate checkout. The
`local-profile-privacy` command exited 1:

```text
$ npm run test:extension -- --claim=@claim:local-profile-privacy
Error: Profile did not apply its keyboard-selected bounds:
{"fontSize":"32px","background":"rgb(28, 37, 38)",
 "bandHeight":"96px","bandTop":312}
```

The flow selected the 180px focus-band maximum, but the page received the
96px default. The same command subsequently passed ten consecutive stress
runs, and the full extension suite also passed. That makes this intermittent,
not resolved. The acceptance contract explicitly makes any failing listed
claim command release-blocking. The failure is likely exposed by the async
focus-band reveal/persistence sequence: the test can focus the still-hidden
height control before the prior storage write finishes.

The failure does not show a privacy leak. Successful reruns observed no
external profile-flow requests. It shows that the declared proof is not
deterministic.

### P1 / High — text size does not change normally styled article text

I loaded the production unpacked MV3 build against a local article with a
representative rule, `article p { font-size: 15px; line-height: 1.35;
max-width: 90ch }`. Using the popup, I selected 32px text, 2.2 line spacing,
and 36ch width and saved the profile.

| Computed paragraph property | Before | Selected | After |
| --- | ---: | ---: | ---: |
| Text size | 15px | 32px | **15px** |
| Line spacing | 20.25px | 2.2 | 33px (2.2 at 15px) |
| Line width | 675px | 36ch | 343.564px |

The injected stylesheet sets `font-size` only on `body`. A site's direct
paragraph declaration wins over an inherited body value even though the body
declaration is `!important`. Most production sites set text sizes on article
elements, so a core advertised control fails on a normal case. The shipped
smoke fixture has no CSS and therefore misses this defect.

### P1 / High — paid-product claims are absent from the claims inventory

The landing page, terms, privacy policy, popup, and README claim a **$19
one-time** purchase with **no subscription**, three supporter faceplates,
once-daily license verification, and refund revocation. None is listed in
`.factory/claims.json`. The untagged site test checks only link text and URL;
the live verifier checks only the checkout redirect. No claim test proves a
valid token return and actual faceplate unlock, once-daily request behavior,
or refund revocation. The claims contract says an unlisted visitor-reliance
claim fails review.

## Other findings

### P2 / Medium — the demo notice is not persistent on mobile

At 390px, `.demo-banner` computes to `position: relative`, overriding its
desktop sticky position. On `?demo=1`, after scrolling, its measured bounds
were `top: -946px`, `bottom: -849.65625`; the required “Demo — sample data,
nothing is saved” notice and its reset/exit actions are no longer visible.

### P2 / Medium — required site structure and metadata are incomplete

- A cold request to `/this-route-does-not-exist` returns `200` and the home
  page, rather than a designed 404 response with a route back.
- The pages have no Open Graph metadata, Twitter card metadata, 1200x630
  social image, SVG favicon, or 180px Apple touch icon.
- Footers omit “Built by Param Factory” and a version/build identity.

These are explicit requirements in the supplied site-structure contract.

## First-read and demo gate

The cold first screen **passes**. It states what the product does (“Save
reading settings for each site”), who it is for (“readers with eye strain or
low vision”), and what to do first (“Try it with sample data”). The action is
visible in the first 390px screen and opens the populated preview in one click.
The banner says sample data is not saved and provides Reset and Start for real.

In fresh desktop and mobile contexts, the demo used no localStorage,
sessionStorage, or cookies; Reset restored 24px, 1.80x, 52ch, and Slate; and
all runtime requests stayed on the product origin. The mobile persistence gap
is reported above.

## Claim-by-claim results

| Claim | Exact command | First required run |
| --- | --- | --- |
| `chromium-download` | `npm run test:release` | Pass, 2/2 |
| `sample-demo` | `npm run test:a11y -- --grep @claim:sample-demo` | Pass, desktop + mobile |
| `first-party-site` | `npm run test:a11y -- --grep @claim:first-party-site` | Pass, desktop + mobile |
| `free-reading-controls` | `npm run test:extension -- --claim=@claim:free-reading-controls` | Pass |
| `local-profile-privacy` | `npm run test:extension -- --claim=@claim:local-profile-privacy` | **FAIL** (P0) |
| `offline-profile` | `npm run test:extension -- --claim=@claim:offline-profile` | Pass |
| `site-profile-reload` | `npm run test:extension -- --claim=@claim:site-profile-reload` | Pass |
| `backup-roundtrip` | `npx vitest run tests/model.test.ts -t @claim:backup-roundtrip` | Pass, 1/1 |

The four extension claim commands all invoke the same combined smoke script;
the `--claim` value validates a tag but does not select an isolated test.

## Clean checkout and production build

| Check | Fresh result |
| --- | --- |
| `npm ci` | Pass; 176 packages installed, 0 audit findings |
| `npm audit` | Pass; 0 vulnerabilities |
| `npm test` | Pass; 13/13 |
| `npm run typecheck` | Pass; no separate lint script exists |
| `npm run build` | Pass; exact production site, MV3 build, and ZIP |
| `npm run test:release` | Pass; 2/2 ZIP/manifest tests |
| `npm run test:a11y` | Pass; 18/18 desktop and 390px tests |
| `npm run test:extension` | Pass on later full rerun |
| `npm run test:live` | Pass; live identity, headers, archive, and checkout |
| `verify-url.sh` local/live | Pass; title/lang/main/alt and no console errors |

Build budgets pass: initial JS is 3,601 bytes (1.63kB gzip), CSS is 15,182
bytes (4.14kB gzip), there is no webfont payload, and the hero WebPs are
18,192 and 37,818 bytes. Combined extension JS is under 20kB.

## End-to-end extension evidence

Aside from the core styled-text defect, the production unpacked extension
passed these fresh flows:

- no page changes before explicit assignment;
- keyboard assignment, Slate surface, 180px focus band, pointer/keyboard
  focus following, offline 31px update, and reload persistence;
- empty profile name recovered with `Profile name cannot be empty.`;
- unrelated JSON recovered with `That file is not an Eye Comfort Profiles
  backup.`;
- empty license input explained what to paste;
- backup downloaded as valid version-1 JSON;
- create, cancel-delete, confirm-delete, assign, and stop-using flows;
- native delete dialog opened and initially focused `Keep profile`;
- `chrome://extensions` showed the protected-page state;
- zero serious/critical axe findings in the popup and no observed console
  errors or external profile-flow requests.

The model unit test also passed its out-of-range normalization checks: 32px
text maximum, 1.2 line-height minimum, 36ch width minimum, invalid-spacing
fallback, and 180px band-height maximum.

## Live deployment, privacy, security, and billing

The live deployment **does match this candidate**. Home, privacy, terms,
robots, sitemap, JS, CSS, both images, and the ZIP byte-match `dist/site`.
The public archive is `200 application/zip`, 27,855 bytes, SHA-256
`5d4e4e255c10c8e2fbe4b1e5089944f105ec34d695c7ffad0f5b833530eacaea`,
passes `unzip -t`, and contains the expected Manifest V3 package.

Live demo request logs contain only
`https://eye-comfort-profiles.sociobot.in`; there are no analytics, CDN fonts,
tracking pixels, third-party scripts, failed requests, console errors, or page
errors. An explicit invalid-license return strips the token from the URL,
stores it locally, calls only `api.sociobot.in`, and shows the inactive-license
recovery message.

HTML sends CSP with header-only `frame-ancestors 'none'`, COOP, HSTS,
Permissions-Policy, `X-Frame-Options: DENY`, `nosniff`, and a strict referrer
policy. Hashed assets use one-year immutable caching; HTML revalidates; the ZIP
uses one-hour caching.

The product's verification endpoint enforced **30 successful requests in the
observed window**; request 31 returned **429** with `Retry-After: 4`. The
checkout endpoint returned 303 to Dodo, and the hosted checkout showed Eye
Comfort Profiles at **$19.00**. No sign-in is required, so the Entra-tenant
check is not applicable.

## Accessibility and performance

Fresh live checks at 1440px and 390x844 found one `h1`, one `main`, `lang=en`,
no horizontal overflow, designed 3px keyboard focus, reduced-motion durations
of 0.01ms, and zero serious/critical axe findings. The preview's Slate surface
was included in the live axe pass. Visible controls meet the 44px target; the
13px native radio inputs are visually replaced by 44px labelled surfaces.

Live mobile Lighthouse evidence (`/tmp/ecp-lighthouse-live.json`) scored
Performance 100, Accessibility 100, Best Practices 100, and SEO 100. FCP and
LCP were 1.4s, CLS 0, TBT 0ms, and total transfer 69KiB. `verify-url.sh`
evidence is under `/tmp/ecp-verify-live/`.

## Required remediation

1. Make every listed claim command deterministic, including immediate
   keyboard adjustment of the newly enabled focus-band height.
2. Apply text size (and audit the selected font) to reading content that has
   ordinary site-level typography; add a styled-article regression fixture.
3. Inventory and test or remove the paid-product claims.
4. Keep the demo notice/actions persistent at 390px.
5. Add the required 404, social metadata/assets, and footer provenance/build
   identity, then rerun the complete independent verification.
