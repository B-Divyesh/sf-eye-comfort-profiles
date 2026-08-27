# Eye Comfort Profiles — repair handoff

**Status: repaired and ready for Standard static deployment.**

This repair resolves every finding in the independent verifier report for
candidate `1bef92bf2309c26ad5baac672c67b4b15b1ddc94`.

## What changed

- The release build now stages the generated Chromium MV3 archive at the exact
  public path: `dist/site/downloads/eye-comfort-profiles-chrome.zip`.
  `staticwebapp.config.json` explicitly excludes `/downloads/*` from the SPA
  fallback, so a missing or valid archive can never be rewritten to HTML.
- The content-script entrypoint now imports `defineContentScript` directly,
  making standalone `tsc --noEmit` succeed instead of depending on WXT's build
  transform.
- The paid supporter unlock is now consistently **$19 one-time** and uses the
  live production mapping:
  `https://api.sociobot.in/api/v1/products/eye-comfort-profiles/checkout`.
  A live check returned a `303` redirect to Sociobot/Dodo hosted checkout.
- Hashed Vite JavaScript, CSS, and responsive hero assets are emitted beneath
  `/assets/` and receive `Cache-Control: public, max-age=31536000, immutable`.
  HTML and other mutable responses revalidate, while downloads use a one-hour
  cache policy.
- The static deployment config sends CSP, `frame-ancestors 'none'`,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer,
  Permissions Policy, and `Cross-Origin-Opener-Policy: same-origin` policies.
- Added regressions for the exact production checkout URL and price, download
  fallback exclusion, immutable cache policy, required response headers, valid
  ZIP signature/extraction, and Manifest V3 metadata.

## Verify locally

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:release
npx playwright install chromium   # first browser run only
npm run test:a11y
```

The commands above passed in this repair environment:

| Check | Result |
| --- | --- |
| `npm test` | Pass — 8 unit/release-config assertions |
| `npm run typecheck` | Pass |
| `npm run build` | Pass — extension, static site, and ZIP generated |
| `npm run test:release` | Pass — valid ZIP at the advertised path and MV3 manifest |
| `npm run test:a11y` | Pass — 10/10 desktop and 390px mobile Playwright + axe checks |
| unpacked MV3 smoke | Pass — persisted 32px Slate profile and 180px focus band applied with no page/console errors |

The built site remains within the stated static budget: initial JS is 3.13 kB
(1.44 kB gzip), CSS is 14.25 kB (3.98 kB gzip), no webfont payload is shipped,
and the responsive WebP hero candidates are 18.2 kB and 37.8 kB.

## Deployment and post-deploy checks

Deploy `dist/site` as a Standard Azure Static Web App. Confirm:

```bash
curl -sSI https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip
curl -fsSLo /tmp/eye-comfort-profiles.zip https://eye-comfort-profiles.sociobot.in/downloads/eye-comfort-profiles-chrome.zip
unzip -t /tmp/eye-comfort-profiles.zip
curl -sSI https://eye-comfort-profiles.sociobot.in/assets/<hashed-asset>.js
```

The archive response must be a ZIP (not `text/html`), `unzip -t` must pass,
and a hashed `/assets/` response must include the immutable one-year policy.
Run `/opt/fleet/lib/verify-url.sh https://eye-comfort-profiles.sociobot.in
<evidence-dir>` after the edge has updated to record title, language,
landmark, alt-text, console, desktop, and mobile evidence.

## Known gaps

None in the repaired product. Browser binaries are installed separately by
Playwright on a fresh developer machine; they are not runtime dependencies or
part of the published product.
