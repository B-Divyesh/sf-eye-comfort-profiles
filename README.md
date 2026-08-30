# Eye Comfort Profiles

Eye Comfort Profiles is a Chromium extension for people who adjust reading
settings on different websites. It saves text size, spacing, contrast, and
focus settings for each one.

It is a comfort utility, not a vision test or medical treatment. Choose from
four font styles. It does not send browsing history or page content anywhere.

Live site: <https://eye-comfort-profiles.sociobot.in>

Try the isolated sample preview at
<https://eye-comfort-profiles.sociobot.in/?demo=1#controls>. It starts with a
realistic reading setup, saves nothing, and resets in one click.

## What is included

- Named profiles with four font styles, 14–32px text, line spacing, letter
  spacing, 36–96-character lines, and four reading surfaces
- An optional focus band follows the pointer or keyboard focus
- Save a profile for a website. Other websites stay unchanged.
- Export and restore a backup file
- Optional $19 one-time supporter purchase for decorative faceplates; every
  reading and backup feature remains free
- Static product site, privacy policy, and terms

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- A Chromium-family browser for loading the built extension

## Develop

```bash
npm install
npm run dev          # WXT extension development
npm run dev:site     # landing site on a local Vite server
npm test
npm run build
npx playwright install chromium   # first browser-audit run outside the worker image
npm run test:a11y
```

`npm run build` is the release command. It produces:

- `dist/site/index.html` — static deployment root
- `dist/site/privacy/index.html`, `dist/site/terms/index.html`, and a designed
  `dist/site/404.html`
- `dist/site/downloads/eye-comfort-profiles-chrome.zip`
- `dist/extension/chrome-mv3/` — unpacked extension

`npm run build:site` is also self-contained. It produces the static site and
stages the packaged extension under `dist/site/downloads/`, matching the
factory static deployment entry point.

To test the extension, open `chrome://extensions`, enable Developer mode, choose
“Load unpacked”, and select `dist/extension/chrome-mv3`.

## Test and verify

```bash
npm test
npm run typecheck
npm run build
npm run test:release
npm run test:extension
npm run test:a11y
npx vite --config vite.site.config.ts --host 127.0.0.1
```

Inspect the site, Privacy, and Terms pages. Then test assignment, removal, the
focus band, backup, keyboard focus, and a restricted page.

`npm run test:extension` tests the unpacked Chromium extension with keyboard
controls. It also checks profile application and an offline local update.

After deploying `dist/site`, run `npm run test:live`. It checks the public
extension ZIP and the 404 page. It also checks identity assets, caching,
security headers, and the Sociobot checkout redirect. Set `SITE_URL` to verify
another static deployment target.

For production releases, use `npm run build && npm run deploy:production`.
The command deploys `dist/site`, including the extension ZIP. It then checks
that the public ZIP is a valid Chromium Manifest V3 package.

The build has no third-party scripts, web fonts, or analytics. An optional
Sociobot checkout and license check are the only paid-service calls.
Production builds use `api.sociobot.in`.

## Privacy and permissions

`storage` holds the local profile document. `activeTab` identifies the page the
reader is actively configuring. Matching uses the website only. The
extension does not collect browser history.

See [the privacy policy](site/privacy/index.html) and
[terms](site/terms/index.html).

## Design and provenance

The product-specific mid-century instrument system and generated-art provenance
are recorded in [`.factory/design.md`](.factory/design.md). The source hero image
and prompt sidecars live in `assets/src/`; optimized WebP variants ship locally.

## License

MIT. See [LICENSE](LICENSE).
