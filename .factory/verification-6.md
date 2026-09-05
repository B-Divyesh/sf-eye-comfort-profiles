# Verify Eye Comfort Profiles end to end — independent QA 6

**Verdict: FAIL**

- Work order: `eye-comfort-profiles-verify-6`
- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Verification date: 2026-09-05 UTC
- Implementation reviewed: `52a41500a8fb35f978f45ba4841729ca6bd504a8`
- Test-only follow-up: `8771e62f3ede5c4b8ace7a56da058b450d7b3624`
- Documentation baseline: `580c4bd6c077e2f7f241de1a23ce85efb7f291b3`
- Findings: **5** (1 high, 2 medium, 2 low)
- Untested public claims: **2**

The live deployment and install artifact are healthy, and every declared claim
command exits successfully. The product does not pass this work order because
the installed extension does not give the promised live page feedback before
save, one broad claim test does not cover every control it claims to prove, and
three smaller accessibility/copy-documentation defects remain.

## First screen, before scrolling

Fresh 1440×900 desktop and 390×844 phone contexts gave the same plain answer:

- **Job:** save reading settings for each website.
- **Audience:** readers with eye strain or low vision.
- **First action:** select **Try it with sample data**. The adjacent text says
  that it opens a live reading preview and saves nothing.

The headline, audience sentence, action, outcome, and three short facts were
visible before scrolling at both sizes. The first-screen gate passes.

## Findings

### F-6-1 — High — extension controls do not preview on the page before save

The landing page's three-step workflow says **Tune with live feedback**, then
**Save to this website**. The brief also requires a live readability preview,
and `.factory/design.md` says changes preview immediately while persistence is
explicit.

In a fresh installed MV3 profile against a local article with normal 15px
paragraph styling, I changed **Font style** from Rounded sans to System sans
before assigning the profile. After 500ms the article remained
`Georgia, serif` at 15px and had no injected reading style. Selecting **Save to
this website** made the setting apply. All later control changes then previewed
normally.

This leaves the user unable to judge a new profile on the real page before
saving it, contrary to the stated step order. The declared extension smoke
clicks Save immediately after changing controls, so it does not expose the
failure. Evidence: `/work/.evidence/eye-comfort-profiles-v6/extension-independent.json`.

Required repair: keep unsaved preview styles applied while local profile state
is written, and add a claim test that changes the active page before any
website assignment exists.

### F-6-2 — Medium — `free-reading-controls` does not prove every advertised control

The registered claim says **Every reading control works without a supporter
license**. Its exact command passes, but its assertions do not change or inspect
letter spacing. It selects only Night slate and does not enumerate or apply the
four reading surfaces advertised in README. It also exercises only one end of
the advertised 14–32px and 36–96-character ranges.

Independent QA confirmed that the omitted controls currently work after a
profile is assigned: all four font styles and all four surfaces applied, text
size reached 14/32px, line spacing 1.2/2.2, line width 36/96ch, letter spacing
0/0.12em, and focus height 56/180px. That manual result does not make the
declared claim command complete under the claims contract.

Required repair: expand the one `@claim:free-reading-controls` implementation
to assert every named control and each quantitative boundary, or narrow the
public claim and README inventory. Evidence:
`/work/.evidence/eye-comfort-profiles-v6/extension-independent.json` and the
claim command output.

### F-6-3 — Medium — the focus-band switch has a 28px touch target

The visible **Use reading focus band** switch in the installed popup measures
48×28 CSS px. The supplied accessibility and design contracts require a
minimum 44×44px touch target. This matters especially for the product's
low-vision audience. All other normally visible popup controls measured at
least 44px in both dimensions; Axe reported no WCAG A/AA violations.

Required repair: enlarge the switch label's interactive box to at least 44px
high without reducing its focus indication. Evidence:
`/work/.evidence/eye-comfort-profiles-v6/popup-a11y-targets.json`.

### F-6-4 — Low — popup labels retain metaphor and jargon

The installed popup visibly labels itself **Reading instrument**, and its main
control group is announced as **Reading geometry**. Those phrases do not name
the task in the reader's words and conflict with the supplied no-metaphor,
plain-words contract. The landing page already uses the clearer terms
**reading profiles** and **reading controls**.

Required repair: use those established terms in the popup as well.

### F-6-5 — Low — the required copy audit does not exactly match its source

`.factory/copy-audit.md` says the landing sentence is **Select the extension on
any regular website.** The source and live page say **Select the extension on a
regular website.** The word count is unchanged and the live wording is plain,
but the required exact copy inventory is inaccurate.

Required repair: update the audit line to match the shipped sentence.

## Demo sandbox

The direct demo and one-click entry pass on desktop and phone.

- Seeded output: 24px text, 1.80× spacing, 52ch width, Night slate surface, and
  a realistic two-paragraph reading sample.
- Persistent label: **Demo — sample data, nothing is saved.** remained fully
  visible after scrolling to the end at both sizes.
- Boundary interaction: keyboard input changed the preview to 16px, 2.1×,
  72ch, and High contrast.
- Reset restored 24px, 1.80×, 52ch, and Slate.
- A seeded `qa:real-marker` local-storage value was identical before demo,
  after edits/reset, and after leaving. Session storage and IndexedDB stayed
  empty.
- The demo requested only the product origin. It produced no console errors,
  page errors, failed requests, or WCAG A/AA Axe violations.

Evidence: `/work/.evidence/eye-comfort-profiles-v6/live-browser.json` and the
four viewport screenshots in the same directory.

## Declared claims

All 19 declared commands were run exactly and independently from the clean
checkout. All exited 0. F-6-2 records why one passing command is still
incomplete evidence; F-6-1 is an additional unlisted public behavior claim.

| Claim | Exact command | Result |
| --- | --- | --- |
| `chromium-download` | `npm run test:release` | Pass, 2/2 artifact tests |
| `sample-demo` | `npm run test:a11y -- --grep @claim:sample-demo` | Pass, desktop and phone |
| `first-party-site` | `npm run test:a11y -- --grep @claim:first-party-site` | Pass, desktop and phone |
| `free-reading-controls` | `npm run test:extension -- --claim=@claim:free-reading-controls` | Exit 0; evidence incomplete (F-6-2) |
| `four-font-styles` | `npm run test:extension -- --claim=@claim:four-font-styles` | Pass |
| `local-profile-privacy` | `npm run test:extension -- --claim=@claim:local-profile-privacy` | Pass; zero external requests |
| `offline-profile` | `npm run test:extension -- --claim=@claim:offline-profile` | Pass; 31px applied offline |
| `site-profile-reload` | `npm run test:extension -- --claim=@claim:site-profile-reload` | Pass; 32px returned on reload |
| `protected-pages-unchanged` | `npm run test:extension -- --claim=@claim:protected-pages-unchanged` | Pass on `chrome://settings` |
| `focus-band-behavior` | `npm run test:extension -- --claim=@claim:focus-band-behavior` | Pass; pointer, focus, and click-through |
| `unassigned-pages-unchanged` | `npm run test:extension -- --claim=@claim:unassigned-pages-unchanged` | Pass |
| `backup-roundtrip` | `npx vitest run tests/model.test.ts -t @claim:backup-roundtrip` | Pass, 1/1 |
| `supporter-price` | `npm run test:live` | Pass; Dodo 303 and hosted $19.00 product |
| `unlicensed-profile-tools` | `npm run test:extension -- --claim=@claim:unlicensed-profile-tools` | Pass; save, match, apply, export, import |
| `comfort-not-medical-advice` | `npm run test:a11y -- --grep @claim:comfort-not-medical-advice` | Pass, desktop and phone |
| `supporter-faceplates` | `npm run test:extension -- --claim=@claim:supporter-faceplates` | Pass; exactly three faceplates |
| `license-daily-check` | `npx vitest run tests/license.test.ts -t @claim:license-daily-check` | Pass, 1/1 |
| `refund-revocation` | `npx vitest run tests/license.test.ts -t @claim:refund-revocation` | Pass, 1/1 |
| `license-restore` | `npm run test:extension -- --claim=@claim:license-restore` | Pass; valid pasted token restored three faceplates |

## Clean checkout and installed artifact

The clean checkout was detached at documentation SHA `580c4bd6`. `npm ci`
installed 176 packages with zero audit findings. It remained clean after the
run.

| Check | Result |
| --- | --- |
| `npm test` | Pass, 15/15 |
| `npm run typecheck` | Pass |
| `npm run build` | Pass; `dist/site`, unpacked MV3, and ZIP produced |
| `npm run test:release` | Pass, 2/2 |
| `npm run test:extension` | Pass; full production artifact smoke |
| `npm run test:a11y` | Pass, 30/30 desktop/390px tests |
| `npm run test:live` | Pass |
| `npm audit --omit=dev` | Pass, zero vulnerabilities |

The live ZIP is 28,179 bytes with SHA-256
`d18408207a73632b61fd276fe98fd40111cb00390990300378dcc588c60f516f`.
It byte-matches the clean build, passes archive validation, and contains the
expected Eye Comfort Profiles Manifest V3 manifest. This is a clean consumer
install, not a source-only check.

Independent installed-artifact recovery checks also passed: empty profile
name, invalid backup, empty license, cancel/confirm deletion, removal from a
website, styled-page restoration, all value boundaries, all fonts, and all
surfaces. The delete dialog initially focused **Keep profile**. No popup or
article console errors occurred.

## Live routes, accessibility, privacy, and performance

- `/`, `/privacy/`, and `/terms/` returned 200. `/404.html` is a direct static
  document and returned 200. A deliberately unknown route returned the same
  designed page with HTTP 404; that expected 404 is not a defect.
- Every inspected route had `lang=en`, one `h1`, one `main`, route-specific
  title, no missing image alt, no horizontal overflow, and zero WCAG A/AA Axe
  violations.
- Same-site navigation focused the destination `h1` and announced
  **Privacy — Eye Comfort Profiles**. The skip link was first with a 3px visible
  outline. Reduced-motion durations were 0.01ms.
- All discovered links and identity assets returned 2xx, except the expected
  checkout 303. The hosted checkout showed Eye Comfort Profiles at $19.00.
- `/opt/fleet/lib/verify-url.sh` passed: 863ms load, correct title/lang/main,
  one h1, complete alt text, and no console errors.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.0s, LCP 1.1s, CLS 0, TBT 20ms, total 66KiB.
- HTML revalidates. Hashed JavaScript has one-year immutable caching. The ZIP
  has one-hour caching. CSP is delivered as a header with `frame-ancestors
  'none'`; HSTS, COOP, Permissions Policy, `nosniff`, strict referrer policy,
  and `X-Frame-Options: DENY` are present.
- No product backend or tenant data store exists, so tenant isolation, restart
  persistence, health, and product-server 429 checks are not applicable. The
  only server-side dependency is the approved hosted billing/license API.

Evidence is under `/work/.evidence/eye-comfort-profiles-v6/`.

## Earlier finding disposition

| Earlier finding | Current evidence |
| --- | --- |
| Verification 1–3 archive failures | Fixed. Public ZIP is 200 `application/zip`, byte-matches the build, and installs as MV3. |
| Verification 1 typecheck, checkout, caching, headers | Fixed. Typecheck passes; checkout is 303 to the correct hosted $19 page; cache and hardening headers pass. |
| Verification 4 intermittent focus height | Fixed. Every isolated extension claim run passed; 56px and 180px boundaries applied. |
| Verification 4 styled article text | Fixed. A CSS-styled 15px paragraph received the selected 14/32px values after assignment. |
| Verification 4 paid claims inventory | Fixed. Price, faceplates, daily check, revocation, restore, and unlicensed tools are registered and their commands pass. |
| Verification 4 mobile demo banner | Fixed. It stayed in the phone viewport after end-scroll. |
| Verification 4 metadata/404/footer | Fixed. Metadata and identity assets are present; the unknown route is a designed HTTP 404. |
| Review 1 F-1-1a–h | Fixed at the cited locations. Protected pages, focus band, medical boundary, and unassigned pages have passing claims; unsupported schedule/recovery/host-access copy is absent. |
| Review 1 F-1-2–F-1-12 | Fixed at the cited landing/README locations. The new popup wording issue is separate F-6-4. |
| Review 2 F-2-1–F-2-9 | Fixed. Route focus, shared navigation, supported purchase wording, and website terminology pass. |
| Review 3 F-3-1 | Fixed. Live checkout reaches Dodo and identifies Eye Comfort Profiles at $19.00. |
| Review 3 F-3-2 | Fixed. The untested generated-art public caption remains absent. |
| Review 3 F-3-3–F-3-6 | Fixed. Current free wording, controls heading, demo sitemap entry, and version labels are correct. |

## Final decision

**FAIL — 5 findings remain, including 2 untested or incompletely tested public
claims. Do not declare this candidate accepted until all findings are repaired
and independently re-verified.**
