# Polish 2 — cumulative adversarial remediation

**Base candidate:** `f8dca5a6e7ed9430857cd6bd90ffec159f7e69a8`  
**Review:** `9768590566d26ea3d48ac4d365439745ac4ac87f`  
**Repair commit:** `498dd0f`  
**Live URL:** <https://eye-comfort-profiles.sociobot.in>

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1.a | Kept the registered protected-page claim and real `chrome://settings` smoke assertion. | `@claim:protected-pages-unchanged` passed; live extension archive verified. |
| F-1-1.b | Kept the registered pointer, keyboard-focus, and click-through focus-band assertion. | `@claim:focus-band-behavior` passed. |
| F-1-1.c | The unsupported Chrome Web Store timing statement remains absent. | Cold live copy check and `/tmp/ecp-polish-2-live-desktop.png`. |
| F-1-1.d | The unsupported developer-install/removability promise remains absent; direct install steps remain. | Cold live copy check and `npm run test:release`. |
| F-1-1.e | Kept the medical boundary claim and exact visible statement. | `@claim:comfort-not-medical-advice` passed on desktop and 390px. |
| F-1-1.f | Public copy now consistently says **website**; unassigned websites remain unchanged. | `@claim:unassigned-pages-unchanged` passed. |
| F-1-1.g | The unproved recovery-state inventory remains removed from README. | README and `.factory/claims.json` audit. |
| F-1-1.h | The unproved host-permission implementation promise remains removed from README. | README and `.factory/claims.json` audit. |
| F-1-2 | “A layout that returns with you” remains “Preview saved reading settings.” | Live demo screenshots. |
| F-1-3 | “A clear boundary” remains “What this extension does not do.” | Live home check and medical claim test. |
| F-1-4 | Reader copy and popup labels now use four plain font styles; added an observable four-style claim. | `@claim:four-font-styles` passed. |
| F-1-5 | The surface choice remains “High contrast.” | `npm run test:a11y` passed. |
| F-1-6 | The demo exit remains “Leave demo.” | `@claim:sample-demo` passed. |
| F-1-7 | README opening stays split into short sentences. | `.factory/copy-audit.md`. |
| F-1-8 | README manual-test instruction remains split. | `.factory/copy-audit.md`. |
| F-1-9 | README extension-test description remains split. | `.factory/copy-audit.md`. |
| F-1-10 | README live-test description remains split. | `.factory/copy-audit.md`. |
| F-1-11 | README deployment description remains split. | `.factory/copy-audit.md`. |
| F-1-12 | README privacy/build description remains split. | `.factory/copy-audit.md`. |
| F-2-1 | Added shared same-origin/history route handoff: each heading is focusable, receives focus after navigation, and its document title is announced politely. | Browser test `same-site legal navigation focuses and announces each destination heading`; live mobile recheck focused Privacy after 200ms and announced its title. |
| F-2-2 | Home, Privacy, Terms, and 404 now share Demo, How it works, Controls, and Privacy in the same order. | Browser test `every route uses the same primary destinations`, desktop and 390px. |
| F-2-3.a | Replaced “Secure hosted checkout” with the registered revoked-license outcome. | `@claim:refund-revocation` passed; live supporter copy checked. |
| F-2-3.b | Removed merchant/refund-processing assertions from landing and terms; retained the fixture-proved revoked-license outcome. | `@claim:refund-revocation` passed. |
| F-2-3.c | Removed public generated-art provenance assurance; provenance remains in `.factory/design.md`. | Live footer check; design record retained. |
| F-2-3.d | Replaced the unlisted font-boundary statement with the tested four-font-styles feature. | `@claim:four-font-styles` passed. |
| F-2-4 | Replaced “Local by design” with “Store profiles on your device.” | Live home screenshot. |
| F-2-5 | README now says “four font styles,” “line spacing,” and “36–96-character lines.” | README audit. |
| F-2-6 | README now says “An optional focus band follows the pointer or keyboard focus.” | README audit. |
| F-2-7 | README now says “Save a profile for a website. Other websites stay unchanged.” | README audit and unassigned-page claim. |
| F-2-8 | README now says “Export and restore a backup file.” | README audit and `@claim:backup-roundtrip`. |
| F-2-9 | Replaced the profile scope’s public “site” variants with **website**, including popup labels, metadata, policies, and first screen. | Live home/Privacy/Terms review and `rg` copy audit. |

## Earlier verification findings

The archive, type, caching/security-header, mobile-demo, styled-article,
paid-claim, 404, metadata, footer, and privacy regressions recorded in
`verification*.md` remain covered by the final full suite. `npm run test:live`
confirmed a byte-matching archive, managed 404, immutable asset cache, headers,
and checkout redirect after deployment.

## Final live evidence

- Cold demo screenshots: `/tmp/ecp-polish-2-live-desktop.png` and
  `/tmp/ecp-polish-2-live-mobile.png`.
- `/opt/fleet/lib/verify-url.sh` passed; it recorded title, `lang=en`, one h1,
  main landmark, image alt coverage, and zero console errors under
  `/tmp/ecp-polish-2-verify/`.
- Playwright Axe checks on live home, Privacy, Terms, and 404 found zero serious
  or critical violations. The standalone Axe CLI could not find a system Chrome
  binary in this worker, so the project’s pinned Playwright Chromium was used.
