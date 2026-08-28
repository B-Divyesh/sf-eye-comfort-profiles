# Eye Comfort Profiles

Eye Comfort Profiles is a Chromium browser extension for people who repeatedly
adjust text size, line length, spacing, contrast, or focus aids on different
sites. It saves named reading profiles locally and reapplies the selected
profile when the reader returns to a hostname.

It is a comfort utility, not a vision test or medical treatment. The product
does not prescribe one “accessible” font and does not send browsing history or
page content anywhere.

Live site: <https://eye-comfort-profiles.sociobot.in>

## What is included

- Named profiles with font fallback, 14–32px text, line height, letter spacing,
  36–96 character line width, and four reading surfaces
- Optional pointer- and keyboard-focus-following reading band
- Explicit per-hostname assignment; regular pages are never changed until a
  reader chooses a profile
- Local JSON backup and restore
- Restricted-page, empty, storage-error, and offline-license states
- Optional $19 one-time supporter purchase for decorative faceplates; every
  reading and backup feature remains free
- Static product site, privacy policy, and terms

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A Chromium-family browser for loading the built extension

## Develop

```bash
npm install
npm run dev          # WXT extension development
npm run dev:site     # landing site on a local Vite server
npm test
npm run build
npx playwright install chromium   # first browser-audit run only
npm run test:a11y
```

`npm run build` is the release command. It produces:

- `dist/site/index.html` — static deployment root
- `dist/site/privacy/index.html` and `dist/site/terms/index.html`
- `dist/site/downloads/eye-comfort-profiles-chrome.zip`
- `dist/extension/chrome-mv3/` — unpacked extension

To test the extension, open `chrome://extensions`, enable Developer mode, choose
“Load unpacked”, and select `dist/extension/chrome-mv3`.

## Test and verify

```bash
npm test
npm run build
npm run test:extension
npx vite --config vite.site.config.ts --host 127.0.0.1
```

Then inspect the site, `/privacy/`, and `/terms/`; load the unpacked extension;
and test assignment, removal, focus band, backup import/export, keyboard focus,
and a restricted browser page.

`npm run test:extension` loads the production unpacked MV3 artifact in Chromium,
exercises the popup using only keyboard controls, verifies its injected reading
profile, and confirms a local profile update while the browser is offline.

After deploying `dist/site`, run `npm run test:live`. It checks the public ZIP
at the advertised path with `unzip -t`, immutable asset caching, response
hardening headers, and the production Sociobot checkout redirect. Set
`SITE_URL` to verify another static deployment target.

The build uses no third-party runtime scripts, web fonts, analytics, or paid
service other than the optional Sociobot-hosted checkout and license verify
request. Production builds use `api.sociobot.in`.

## Privacy and permissions

`storage` holds the local profile document. `activeTab` identifies the page the
reader is actively configuring. Host access is required for the content script
that applies CSS on HTTP and HTTPS pages. Matching uses hostname only and no
browser history is collected.

See [the privacy policy](site/privacy/index.html) and
[terms](site/terms/index.html).

## Design and provenance

The product-specific mid-century instrument system and generated-art provenance
are recorded in [`.factory/design.md`](.factory/design.md). The source hero image
and prompt sidecars live in `assets/src/`; optimized WebP variants ship locally.

## License

MIT. See [LICENSE](LICENSE).
