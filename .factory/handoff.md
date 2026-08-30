# Review-1 note (2026-08-30)

The adversarial first-read review is **FAIL**. See `.factory/review-1.md`.

No product code changed. A fresh clone was used for `npm ci`, `npm test`,
`npm run build`, the full a11y suite, the live release check, and every
registered claim command. They passed; the review fails only on F-1-1 through
F-1-12 (unlisted factual promises and plain-language/README copy issues).

Next: implement the exact claim tests and rewrites, then re-run the complete
first-read checklist from a fresh browser context and clean clone.

---

# Eye Comfort Profiles — repair and independent-verification handoff

## Independent verification 5 — PASS

Candidate `12c339049657e561e2705656a4be4ae826c970d9` was independently
verified on 2026-08-30 UTC at <https://eye-comfort-profiles.sociobot.in>.
**PASS.** Every `.factory/claims.json` command passed from a clean `npm ci`;
the complete local gates passed (`npm test` 15/15, typecheck, production build,
release ZIP 2/2, a11y 22/22, extension smoke, and live artifact verification).

Fresh live desktop and 390px browser checks found a plain-words cold first
screen and one-click seeded demo, only same-origin demo requests, no storage
writes/cookies, no console or page errors, zero axe serious/critical issues,
visible 3px focus, no overflow, and reduced-motion compliance. The unpacked
MV3 flow applied and cleared a styled article, persisted/reloaded a hostname
profile, worked offline, honored the 14–32px boundary, and gave clear empty
name/invalid-import recovery messages. The public home and ZIP byte-match the
candidate build; the public archive SHA-256 is
`e6c50b3d8843eb7cf69f5b8998a317e39307ddc5993817a56419fb46c42fc7ad`.

The Sociobot verification API allowed 30 invalid-license requests from one
client; request 31 returned 429 with `Retry-After: 4`. No sign-in is required.
There are no known verification defects. Full evidence, exact claim commands,
headers, budgets, and observed outcomes are in
`.factory/verification-5.md`.

**Status: PASS — repaired and deployed.**

- Work order: \`eye-comfort-profiles-repair-5\`
- Failed verifier base: \`1201bd00223ef0cb1ab8ba3aba66a6135accc2b8\`
  (candidate \`7cec9703abdbb0b8a5da6d26c2653686750232fb\`)
- Repair implementation commit: \`68c6dd4addb8a2b15a27906f6426ff44d5a2029e\`
- Deployment date: 2026-08-30 UTC
- Public URL: <https://eye-comfort-profiles.sociobot.in>
- Deployment: static site root \`dist/site\` via \`npm run deploy:production\`
  (Azure Static Web Apps deployment \`af298a04-a6da-4363-b6a2-5c0de7c5a200\`)

## Repaired verifier findings

1. **Deterministic focus-band keyboard update.** Popup settings now update the
   visible controls synchronously, queue preview messages in event order, and
   serialise immutable extension-storage snapshots. This removes the race in
   which an immediate \`End\` on the newly enabled band-height rail could leave
   the page at the 96px default. The packaged-extension regression sends the
   same keyboard sequence and requires a 180px applied band; the former
   \`local-profile-privacy\` command passed 10 consecutive fresh-profile runs.
2. **Text size and selected font now reach ordinary article typography.** The
   content stylesheet applies the chosen reading geometry to prose elements
   inside \`article\`, \`main\`, or \`[role=main]\`, not only to \`body\`. The
   production MV3 smoke fixture deliberately sets \`article p\` to 15px Georgia;
   it now proves the resulting paragraph is 32px, Humanist font-stack, 2.2
   leading, and constrained to the selected 36ch width.
3. **Supporter statements are inventoried and proven.** Added four claims for
   exact $19/no-subscription offer copy, a returned valid license unlocking the
   three faceplates, at-most-daily verification, and a recorded revoked-license
   response becoming inactive. The faceplate test uses a fresh unpacked MV3
   profile, a mocked Sociobot verification response, and the real popup token
   handoff; it verifies brass, coral, and petrol.
4. **Persistent 390px demo notice.** The mobile breakpoint no longer replaces
   the banner's sticky positioning. A 390×844 scroll regression confirms the
   demo notice, reset button, and exit action remain within the viewport.
5. **Complete static-site identity and routing.** Added a designed \`404.html\`,
   Static Web Apps 404 response override, social metadata, Twitter metadata,
   SVG favicon, 180px touch icon, 1200×630 social image, and Param Factory
   build identity in every footer. The live release test requires an unknown
   route to return HTTP 404 and the designed recovery page.

The product remains a WXT TypeScript Manifest V3 Chromium extension with a
static landing site and downloadable unpacked archive. No reading control,
local-first behavior, or existing passing flow was removed.

## Verification evidence

Clean install and source checks:

\`\`\`bash
npm ci                              # pass; 176 packages, 0 vulnerabilities
npm audit                            # pass; 0 vulnerabilities
npm test                             # pass; 15/15 Vitest tests
npm run typecheck                    # pass; tsc --noEmit
npm run build                        # pass; MV3, static site, ZIP
npm run test:release                 # pass; 2/2 archive-consumer tests
npm run test:extension               # pass; keyboard, offline update, reload,
                                      # styled article, no external profile requests
npm run test:a11y                    # pass; 22/22 desktop + 390px Playwright/axe tests
\`\`\`

There is no separate lint script in this intentionally small TypeScript stack;
the strict \`typecheck\` script is the configured source-quality gate.

Every command listed in \`.factory/claims.json\` was run directly. All passed,
including the four original extension claim commands, the 10-run
\`local-profile-privacy\` stress check, \`@claim:supporter-price\`,
\`@claim:supporter-faceplates\`, \`@claim:license-daily-check\`, and
\`@claim:refund-revocation\`.

Accessibility, browser, privacy, and performance checks:

- Local \`verify-url.sh\` passed with title, \`lang=en\`, one \`h1\`, \`main\`, image
  alt text, and zero console errors.
- Local Playwright axe coverage checked \`/\`, \`/privacy/\`, \`/terms/\`, and
  \`/404.html\` on desktop and 390px. It found zero serious/critical issues,
  zero horizontal overflow, visible 3px focus, and reduced-motion behavior.
- Live Playwright axe coverage repeated those four routes at 1440px and 390px:
  zero serious/critical issues, console errors, or overflow. Runtime requests
  stayed on \`https://eye-comfort-profiles.sociobot.in\`.
- The live 390px demo test confirmed a sticky banner at \`y=0\`, working keyboard
  range control, 3px focus outline, reduced-motion transition \`0.00001s\`, and
  no localStorage writes or third-party requests.
- Live mobile Lighthouse: Performance **100**, Accessibility **100**, Best
  Practices **100**, SEO **100**; FCP **1.0s**, LCP **1.1s**, CLS **0**, TBT
  **20ms**, total transfer **66KiB**. Evidence:
  \`/tmp/ecp-lighthouse-live-repair.json\`.

Production identity, response-policy, and archive checks:

\`\`\`bash
npm run test:live                   # pass
/opt/fleet/lib/verify-url.sh https://eye-comfort-profiles.sociobot.in /tmp/ecp-verify-live-repair
\`\`\`

- Public ZIP: \`200 application/zip\`, 28,158 bytes, SHA-256
  \`e6c50b3d8843eb7cf69f5b8998a317e39307ddc5993817a56419fb46c42fc7ad\`;
  it byte-matches \`dist/site\`, passes \`unzip -t\`, and contains the expected
  Eye Comfort Profiles Manifest V3 manifest.
- Live home byte-matches the local build. The public archive, immutable hashed
  JavaScript, CSP including header-delivered \`frame-ancestors 'none'\`, COOP,
  X-Frame-Options, nosniff, referrer policy, Permissions-Policy, HSTS, social
  assets, checkout redirect, and designed unknown-route HTTP 404 all passed.
- Production checkout redirects to Dodo through the approved Sociobot billing
  endpoint. No credentials or third-party runtime trackers are embedded.

## Asset provenance

The added \`social-preview.jpg\` and \`apple-touch-icon.png\` are deterministic
crops of the existing reviewed Azure-generated hero art. Their provenance and
creation details are recorded in \`.factory/design.md\`; no external runtime
asset request was added.

## Known gaps / next steps

No known release-blocking gaps. The manual Chromium ZIP install remains the
intended distribution path until Chrome Web Store review, as documented on the
landing page and README.
