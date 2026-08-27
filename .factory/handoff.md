# Eye Comfort Profiles — build handoff

Work order: `eye-comfort-profiles-build-1`  
Completed: 2026-08-27

## What shipped

- WXT + TypeScript Chromium MV3 extension with named local profiles.
- Per-hostname assignment and automatic reapplication on HTTP/HTTPS pages.
- Immediate on-page preview for font stack, 14–32px text size, line height,
  letter spacing, 36–96ch line width, and original/paper/slate/high-contrast
  surfaces.
- Optional pointer-, touch-, and keyboard-focus-following reading band that does
  not intercept page interaction.
- Profile create, rename, confirmed delete, assign, unassign, JSON export, and
  validated JSON import paths.
- First-class restricted-page, storage-error, import-error, and offline-license
  messages.
- Local-first storage only. Hostnames are recorded only when the user explicitly
  assigns a profile; no browsing history, page content, analytics, or remote
  fonts/scripts are collected.
- $12 one-time supporter unlock through the staging Sociobot billing API,
  including checkout, URL token capture, paste-to-restore, cached daily verify,
  offline optimistic state, invalid-license relock, and three decorative panel
  accents. All reading, profile, and backup capabilities remain free.
- Responsive static product site at `dist/site`, including a working live
  readability preview, install instructions, privacy policy, terms, offline
  notice, sitemap, and the packaged extension download.
- Original generated hero illustration and hand-authored icons. Prompt,
  generator, review, and licensing provenance are in `.factory/design.md` and
  `assets/src/`.

## Build and verification

Release command (from a clean checkout after `npm install`):

```bash
npm run build
```

Outputs:

- `dist/site/index.html` (static deploy root)
- `dist/site/downloads/eye-comfort-profiles-chrome.zip` (28.3 KB)
- `dist/extension/chrome-mv3/` (unpacked extension, 49.2 KB total)

Checks completed:

- `npx tsc --noEmit` — pass
- `npm test` — 5/5 unit tests pass
- `npm run build` — pass from a cleaned output tree
- `npm run test:a11y` — 8/8 Playwright + axe checks pass on desktop and
  390×844 mobile across `/`, `/privacy/`, and `/terms/`; no serious/critical
  findings, no console errors, and no horizontal overflow
- `npm audit --omit=dev` — 0 production vulnerabilities
- Headless Chromium MV3 smoke test — extension loaded, protected-page empty
  state rendered with 0 serious/critical axe findings and no console errors;
  a stored hostname profile injected its style, 23px text, and focus band
- Manifest icon paths were checked against the staged files

Lighthouse mobile, production preview:

| Category / metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| FCP | 0.9 s |
| LCP | 1.1 s |
| CLS | 0 |
| Total blocking time | 0 ms |

Static budgets: 3.14 KB site JavaScript, 14.25 KB site CSS, 18/37 KB responsive
hero WebPs, no font payload. Extension JavaScript is under 20 KB combined.

## Known gaps / release steps

- This is a Chromium MV3 package distributed for developer-mode installation;
  Chrome Web Store signing/review is outside this repository.
- Billing intentionally points to `pilot-api.sociobot.in` for staging. The
  factory must register the test product and switch the API base to production
  at release; no product ID is hardcoded.
- Page CSS can be limited by closed shadow roots, canvases, and highly defensive
  author styles. The extension deliberately avoids DOM rewriting so semantics
  and keyboard behavior remain intact.
- Automated browser coverage exercises the static site and an installed
  extension/profile application path. Final store packaging should also receive
  a manual smoke pass in current Chrome before submission.
