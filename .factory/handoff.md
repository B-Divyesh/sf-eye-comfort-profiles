# Eye Comfort Profiles — repair handoff

**Status: repaired, verified, pushed, and deployed.**

- Work order: `eye-comfort-profiles-repair-4`
- Report commit: `5d24723cdec27edd38db6f3bb312461a71a2dea7`
- Repaired candidate: `e2926e4e43fe1fe3f884e22645097863413df805`
- Repair commits: `871819f` and `e1dd18b` on `main`, pushed to `origin/main`
- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Azure Static Web Apps resource: `sf-eye-comfort-profiles`
- Final deployment: `ef7c8815-cad5-4cb0-841e-80e341926e97`, 2026-08-30 UTC

## Finding reproduced first

Before changing source, `npm run test:live` failed exactly as reported:

```text
https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip returned 404 Not Found
```

A separate request returned `HTTP/2 404`, `content-type: text/html`, and 2,400
bytes. `unzip -t` failed because the response was not an archive.

The deeper controller path also reproduced after `npm ci`: a clean
`npm run build:site` built the public HTML, JS, CSS, and images but left
`dist/site/downloads/eye-comfort-profiles-chrome.zip` absent.

## Root cause and repair

The earlier repair protected only `npm run deploy:production`. The factory
work order deploys the output of `npm run build:site`, and that entry point ran
Vite without building or staging the extension. A later factory rebuild could
therefore replace a complete deployment with the same website minus its only
install artifact.

The repair makes `build:site` self-contained: Vite builds the site, WXT builds
and zips the MV3 extension, and the staging script copies the archive to the
advertised `dist/site/downloads/` path. `test:release` now starts from empty
outputs and invokes that exact factory entry point before checking the ZIP
signature, `unzip -t`, and MV3 manifest. The manual production deploy still
refuses missing artifacts, but now also retries public verification during CDN
convergence.

The live verifier now proves all of these against production:

- public HTML and ZIP hashes match the local production build;
- the download is `200 application/zip`, begins with `PK\x03\x04`, extracts,
  and contains the expected Eye Comfort Profiles Manifest V3 manifest;
- hashed JS has the immutable one-year cache policy;
- the ZIP has the configured one-hour policy;
- CSP, frame protection, COOP, Permissions-Policy, HSTS, `nosniff`, and the
  referrer policy are present;
- privacy, terms, robots, and sitemap routes respond;
- production checkout is a Sociobot endpoint that redirects to Dodo.

Playwright and Playwright Core are both pinned to `1.58.2`, matching the
worker's preinstalled Chromium. WXT was updated to `0.21.4`; this removed all
ten old development-toolchain advisories without changing extension behavior.

## Regression and product coverage added

- Exact clean `build:site` archive regression and release-configuration lock.
- Public/local HTML and ZIP identity checks after every deployment.
- Extension smoke assertions for no change before assignment, license-free
  controls, no external profile-flow requests, offline keyboard update, and
  local-storage reapplication after reload.
- One-click `?demo=1` sample preview with a persistent sandbox notice, reset,
  and exit. It writes no browser storage; see `.factory/demo.md`.
- Eight explicit claims in `.factory/claims.json`; a unit contract requires
  exactly one tagged implementation for every claim.
- Desktop and 390px checks for keyboard operation, 3px focus, reduced motion,
  overflow, console/page/request errors, demo reset, and first-party requests.
- Plain first-screen copy and the complete word-count/terminology review in
  `.factory/copy-audit.md`. The existing visual thesis and generated artwork
  remain unchanged.

## Clean verification evidence

All final commands ran from the committed tree with Playwright browsers at
`$PLAYWRIGHT_BROWSERS_PATH`.

| Check | Final result |
| --- | --- |
| `npm ci` | Passed; 176 packages installed from lockfile. |
| `npm audit` | Passed; 0 production or development vulnerabilities. |
| `npm test` | Passed; 13/13 model, release-config, and claims-contract tests. |
| `npm run typecheck` | Passed; `tsc --noEmit`. No separate stylistic linter is configured. |
| `npm run build` | Passed; clean static site, unpacked MV3 extension, and staged ZIP. |
| `npm run test:release` | Passed; 2/2 exact package/consumer checks after a clean `build:site`. |
| `npm run test:a11y` | Passed; 18/18 Playwright + axe tests at desktop and 390×844. |
| `npm run test:extension` | Passed; unpacked production MV3 keyboard, privacy, offline, and reload flow; zero console errors. |
| `/opt/fleet/lib/verify-url.sh` (local) | Passed in 524 ms; title/lang/main/h1/alt and zero console errors. |
| `/opt/fleet/lib/verify-url.sh` (live) | Passed in 779 ms; title/lang/main/h1/alt and zero console errors. |
| `npm run test:live` | Passed after final deployment with exact local/live identities. |

The unpacked-extension flow observed an untouched 16px local article before
assignment. Keyboard controls then applied 32px text, Night slate, and a 180px
focus band. While offline, ArrowLeft applied 31px immediately. After reload,
31px and the focus band returned from local extension storage. The flow made
no external HTTP(S) request and produced no console error.

Fresh live Chromium checks at 1440×1000 and 390×844 found one `h1`, one
`main`, `lang=en`, no horizontal overflow, a visible 3px keyboard focus ring,
zero serious/critical axe findings, zero console/page/request failures, and
only the `eye-comfort-profiles.sociobot.in` request origin.

## Performance and artifact evidence

Final local Lighthouse with the container-safe Chromium flag:

- Performance 100, Accessibility 100, Best Practices 100, SEO 100
- FCP 0.9 s, LCP 1.2 s, CLS 0, TBT 0 ms

Final live mobile Lighthouse:

- Performance 99, Accessibility 100, Best Practices 100, SEO 100
- FCP 0.8 s, LCP 1.1 s, CLS 0, TBT 120 ms

Production budgets remain well below limits: initial JS 3,601 bytes (1,648
bytes gzip), CSS 15,182 bytes (4,145 bytes gzip), no webfont payload, and hero
WebPs of 18,192 and 37,818 bytes. Combined extension JS is under 20 kB.

Final public package:

- URL: <https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip>
- Response: `200 application/zip`
- Cache: `public, max-age=3600`
- Length: `27,855` bytes
- SHA-256: `5d4e4e255c10c8e2fbe4b1e5089944f105ec34d695c7ffad0f5b833530eacaea`
- Signature: `50 4b 03 04`
- `unzip -t`: no errors
- Manifest: version 3, name `Eye Comfort Profiles`

## Known gap and next step

The download is intentionally a Chromium developer-mode MV3 package. Chrome
Web Store signing and review are outside this repository and the factory's
static deployment class. There are no known release-blocking product gaps.
The next action is independent verification of the live release.
