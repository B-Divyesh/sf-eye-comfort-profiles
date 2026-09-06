# Review 4 — Save reading settings for each website

**Verdict: FAIL**

- Work order: `eye-comfort-profiles-review-4`
- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Review date: 2026-09-06 UTC
- Implementation reviewed: `ce566af87d67f272d6eda924e3cbc98a5198661c`
- Documentation baseline: `13f05d883854609ece48f4baab22d3c3ec07b992`
- Findings: **5**
- Untested public claims: **3**

The previous independent verification passed, and every declared command still
exits successfully. This stricter review found incomplete claim tests and four
product defects outside those passing assertions. Product code was not changed.

The referenced `factory-evidence/eye-comfort-profiles-verify-7/qa-report.md`
was not present in this checkout or elsewhere under `/work`. I read the full
repository report `.factory/verification-7.md` and did not classify the missing
duplicate evidence path as a product defect.

## First screen before scrolling

Fresh 1440×900 desktop and 390×844 phone contexts showed the required content
without scrolling and without horizontal overflow.

- **Job:** save reading settings for each website.
- **Audience:** readers with eye strain or low vision who want their chosen
  text size, spacing, contrast, and focus aid restored.
- **First action:** **Try it with sample data**.
- **Next result:** the nearby sentence says the demo opens a live reading
  preview and saves nothing.
- **Facts:** browser storage, installed offline use, and the $19 supporter
  option were all visible.

Evidence: `/work/.evidence/eye-comfort-profiles-review-4/desktop-first-screen.png`,
`phone-first-screen.png`, and `live-browser.json`.

## Findings

### F-4-1 — High — three public claims lack complete declared tests

All 20 claim commands exit 0, but three public assurances are still untested
under the supplied claims contract.

1. `sample-demo` says the demo “saves nothing.” Its tagged test checks empty
   `localStorage` and preserves two license keys, but it does not seed and
   compare session storage, IndexedDB, or cookies. A regression writing any of
   those stores would pass the declared command.
2. `first-party-site` says there is no analytics. Its tagged test checks only
   request origins. A same-origin analytics endpoint would pass. The Privacy
   page also says there are no analytics cookies or tracking pixels, neither of
   which the test inspects.
3. Privacy says, “Uninstalling removes its local data.” There is no matching
   claim entry or clean-consumer uninstall test.

The independent live audit did confirm that the current demo left seeded local
storage, session storage, IndexedDB, and a cookie unchanged. That one-time
observation does not replace the required regression test.

Required repair: extend the two tagged browser tests to assert every promised
store and observable analytics channel. Register and exercise an uninstall
claim in a disposable Chromium profile, or remove that sentence.

Evidence: `tests/browser/site.spec.ts` lines 44–80 and 97–104;
`site/privacy/index.html` lines 35, 43, and 45; and
`/work/.evidence/eye-comfort-profiles-review-4/live-browser.json`.

### F-4-2 — Medium — deleting an assigned profile leaves its deleted styling active

In a fresh installed MV3 profile, I created **Night reference**, set it to
32 px and Slate, saved it to the open article, and confirmed the presentation.
I then deleted that assigned profile.

The popup correctly reported **Not assigned** and selected the remaining
18 px Paper profile. The article still showed the deleted 32 px Slate settings,
including after closing and reopening the popup. Reloading the article finally
restored its original 15 px styling.

This leaves the current page and popup in contradictory states after a normal,
confirmed destructive action. The dialog also promises that the profile’s
website selections will be removed.

Required repair: after deletion, clear the current website’s injected style or
preview the newly selected profile. Add an installed-artifact regression test
that compares the popup state with the open page before and after deletion.

Evidence: `/work/.evidence/eye-comfort-profiles-review-4/extension-delete-confirmation.json`.
The deletion handler at `entrypoints/popup/main.ts` lines 239–246 updates
storage and form state but sends neither `ECP_CLEAR` nor a replacement preview.

### F-4-3 — Medium — key website copy is smaller than the accessibility baseline

The supplied baseline requires web body text of at least 16 px. The product’s
own design thesis says website body copy never drops below 17 px. A fresh 390 px
live measurement found 21 paragraph or list elements below 16 px.

Important examples include the 14 px first-action result, the 13 px three
first-screen facts, 15 px feature explanations, 14 px problem statements, and
12 px footer privacy text. This is especially relevant for the stated low-vision
audience. Browser zoom remains available, but the default violates the agreed
product baseline.

Required repair: keep decorative labels distinct, but render informational
website prose at 17 px or larger and recheck 390 px reflow.

Evidence: `/work/.evidence/eye-comfort-profiles-review-4/site-small-text.json`;
`site/style.css` lines 42, 53–54, 62, 71–79, and 132–149.

### F-4-4 — Low — malformed backup errors expose parser text without a next step

Importing `{broken` in the installed extension reports:

> Expected property name or '}' in JSON at position 1 (line 1 column 2)

That is JavaScript parser language. It does not say that the backup is invalid
or what the reader should do. Wrong-shape JSON, empty profile names, empty
licenses, and invalid licenses all produced clear product-specific messages.

Required repair: catch malformed JSON and say, for example, “That backup file
could not be read. Choose an Eye Comfort Profiles backup and try again.” Add
the malformed file to the installed-artifact recovery test.

Evidence: `/work/.evidence/eye-comfort-profiles-review-4/extension-delete-confirmation.json`;
`entrypoints/popup/main.ts` lines 274–286.

### F-4-5 — Low — the desktop Demo navigation target is narrower than 44 px

On every desktop route, the header’s **Demo** link measures 38.9×44 CSS px.
The supplied accessibility and design contracts require every touch/click
target to be at least 44×44 px. Other visible non-inline route targets met the
size baseline; the visually hidden radio inputs are backed by larger labels.

Required repair: add enough inline padding or a 44 px minimum width to the
header navigation links, then assert both dimensions in the browser test.

Evidence: `/work/.evidence/eye-comfort-profiles-review-4/route-audit.json`;
`site/style.css` lines 34–35.

## Demo sandbox

The one-click sample itself works on fresh desktop and phone contexts.

- It opens `/?demo=1#controls` with a persistent **Demo — sample data, nothing
  is saved.** notice.
- The populated preview starts at 24 px, 1.80× line spacing, 52-character
  lines, and Slate.
- Changes to 28 px, 2.10×, 72 characters, and High contrast reached the visible
  sample. After the transition, text was 28 px, `#111` on `#fff`.
- **Reset demo** restored all four sample values.
- The banner, reset, and leave actions remained visible at end-scroll.
- Seeded local storage, session storage, IndexedDB, and cookie markers were
  unchanged after entry, editing, reset, and exit.
- Demo traffic remained on the product origin. There were no page errors,
  console errors, failed requests, or serious/critical Axe findings.

## Declared claim commands

Every command was invoked separately and exactly as declared from the clean
checkout after `npm ci`. All exited 0. F-4-1 explains why three public claims
remain untested despite those successful exits.

| Claim | Command | Result |
| --- | --- | --- |
| `chromium-download` | `npm run test:release` | Pass |
| `sample-demo` | `npm run test:a11y -- --grep @claim:sample-demo` | Pass; incomplete coverage in F-4-1 |
| `first-party-site` | `npm run test:a11y -- --grep @claim:first-party-site` | Pass; incomplete coverage in F-4-1 |
| `free-reading-controls` | `npm run test:extension -- --claim=@claim:free-reading-controls` | Pass |
| `live-page-preview` | `npm run test:extension -- --claim=@claim:live-page-preview` | Pass |
| `four-font-styles` | `npm run test:extension -- --claim=@claim:four-font-styles` | Pass |
| `local-profile-privacy` | `npm run test:extension -- --claim=@claim:local-profile-privacy` | Pass |
| `offline-profile` | `npm run test:extension -- --claim=@claim:offline-profile` | Pass |
| `site-profile-reload` | `npm run test:extension -- --claim=@claim:site-profile-reload` | Pass |
| `protected-pages-unchanged` | `npm run test:extension -- --claim=@claim:protected-pages-unchanged` | Pass |
| `focus-band-behavior` | `npm run test:extension -- --claim=@claim:focus-band-behavior` | Pass |
| `unassigned-pages-unchanged` | `npm run test:extension -- --claim=@claim:unassigned-pages-unchanged` | Pass |
| `backup-roundtrip` | `npx vitest run tests/model.test.ts -t @claim:backup-roundtrip` | Pass |
| `supporter-price` | `npm run test:live` | Pass; live checkout shows $19.00 |
| `unlicensed-profile-tools` | `npm run test:extension -- --claim=@claim:unlicensed-profile-tools` | Pass |
| `comfort-not-medical-advice` | `npm run test:a11y -- --grep @claim:comfort-not-medical-advice` | Pass |
| `supporter-faceplates` | `npm run test:extension -- --claim=@claim:supporter-faceplates` | Pass |
| `license-daily-check` | `npx vitest run tests/license.test.ts -t @claim:license-daily-check` | Pass |
| `refund-revocation` | `npx vitest run tests/license.test.ts -t @claim:refund-revocation` | Pass |
| `license-restore` | `npm run test:extension -- --claim=@claim:license-restore` | Pass |

Evidence: `/work/.evidence/eye-comfort-profiles-review-4/claim-results.json`
and the 20 individual logs under its `claims/` directory.

## Build, installed extension, and quality gates

- `npm ci`: 176 packages; zero vulnerabilities.
- `npm test`: 15/15 passed.
- `npm run typecheck`: passed.
- `npm run build`: passed and produced `dist/site`, unpacked MV3 output, and ZIP.
- `npm run test:release`: 2/2 passed.
- `npm run test:extension`: passed against a fresh installed production artifact.
- `npm run test:a11y`: 30/30 passed on desktop and 390 px projects.
- `npm run test:live`: passed.
- `npm audit --omit=dev`: zero vulnerabilities.
- `/opt/fleet/lib/verify-url.sh`: passed in 794 ms with no console errors.

The full extension smoke proved four fonts, four surfaces, every numeric
boundary, preview before save, assignment, offline change, reload persistence,
focus-band pointer/keyboard/click-through behavior, backup export/import,
protected pages, and no external requests. Separate recovery checks covered
empty names, new profiles, delete cancel/confirm, malformed and wrong-shape
backups, empty and invalid licenses, and assignment removal. F-4-2 and F-4-4
record the failures in that separate check.

The site build contains 2.90 kB JavaScript, 15.47 kB CSS, and 18.19/37.82 kB
responsive hero images. The public ZIP is 28,208 bytes and byte-matches the
build at SHA-256
`468f7b7da765c1e677b13307a87ed8580fafb7f2df7cb0ecb579b5247b7a09fb`.

Fresh mobile Lighthouse scored 100 Performance, 100 Accessibility, 100 Best
Practices, and 100 SEO. FCP and LCP were 1.0 s, TBT was 0 ms, CLS was 0, and
transfer size was 66 KiB. The first Lighthouse launch crashed before measuring;
the container-safe retry with disabled shared-memory use completed normally.

## Routes, keyboard, privacy, and release identity

- `/`, `/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` worked on both
  viewports. A deliberate unknown route returned the designed page with HTTP
  404; its browser resource message is expected and is not a defect.
- Each route had its own title, `lang=en`, one h1, one main, ordered headings,
  no horizontal overflow, and no serious/critical Axe finding.
- The skip link received visible 3 px focus. Privacy navigation focused and
  announced its h1; Back restored and announced the home h1.
- Reduced-motion transition and animation durations were 0.01 ms.
- Every discovered link returned 200 or the intended checkout 303.
- CSP and hardening headers, immutable asset caching, the designed 404, and
  the hosted checkout were rechecked by `npm run test:live`.
- Live HTML, hashed JavaScript, and the public ZIP match the local build.

Only `.factory/handoff.md` and `.factory/verification-7.md` differ between the
implementation candidate and the documentation baseline. There is no product
backend, tenant store, health route, or product-server 429 behavior to test.
The approved Sociobot billing/license service is the only external dependency.

## Earlier finding disposition

| Earlier finding group | Current disposition |
| --- | --- |
| Verification 1–3: missing/invalid public archive | Remains fixed. The 200 ZIP byte-matches the clean build, passes archive tests, and contains the expected MV3 manifest. |
| Verification 1: typecheck, checkout, caching, and security headers | Remain fixed. Typecheck and live checks pass; checkout reaches the $19.00 hosted item; cache and hardening headers pass. |
| Verification 4: intermittent focus height and styled-page text | Remain fixed in the full and isolated extension runs. Every endpoint applied to the styled article. |
| Verification 4: missing paid claims | Remains fixed. Price, faceplates, daily check, revocation, restore, and free-tool commands pass. |
| Verification 4: demo notice, metadata, footer, and 404 | Remain fixed on desktop and phone. The deliberate HTTP 404 is designed and expected. |
| Review 1 F-1-1a–h | Earlier missing protected-page, focus-band, medical, and unassigned-page claims pass. Removed schedule, recovery-list, and host-access wording remains absent. F-4-1 concerns different incomplete privacy/demo coverage and uninstall wording. |
| Review 1 F-1-2–F-1-12 | Remain fixed. Current landing and README wording keeps the established plain terms and sentence limits. |
| Review 2 F-2-1–F-2-9 | Remain fixed. Route focus, shared navigation, purchase wording, and consistent website terminology pass. |
| Review 3 F-3-1–F-3-6 | Remain fixed. Checkout, provenance removal, free-tool wording, controls heading, demo sitemap entry, and version labels pass. |
| Verification 6 F-6-1–F-6-5 | Remain fixed. Preview-before-save, complete control boundaries, 48×44 popup switch, plain popup labels, and exact copy audit all pass. |

The passing Verification 5 baseline and both polish reports were also checked
for regression. No earlier defect reopened. F-4-1 through F-4-5 are new.
No extra AI or sync step is necessary for this local manual reading-settings job.

## Final decision

**FAIL — 5 findings remain, including 3 untested public claims.** Candidate
`ce566af87d67f272d6eda924e3cbc98a5198661c` must not be accepted until these
findings are repaired and independently verified.
