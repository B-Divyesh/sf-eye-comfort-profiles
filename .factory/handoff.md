# Eye Comfort Profiles — verification 6 handoff

## Result

**FAIL.** Independent QA found five issues: the installed extension does not
preview new settings on the active page before the first save; the broad
free-controls claim omits controls and quantitative boundaries from its test;
the focus-band switch is only 48×28px; two popup labels use metaphor/jargon;
and one required copy-audit quote does not match the source.

Full report: `.factory/verification-6.md`.

## Release identity

- Live URL: <https://eye-comfort-profiles.sociobot.in>
- Implementation reviewed: `52a41500a8fb35f978f45ba4841729ca6bd504a8`
- Test-only follow-up: `8771e62f3ede5c4b8ace7a56da058b450d7b3624`
- Documentation baseline: `580c4bd6c077e2f7f241de1a23ce85efb7f291b3`
- This verification changes reports only. Product code was not modified.

The live site and ZIP byte-match the clean build from the documentation
baseline. The only post-implementation source change is the declared test-only
offline smoke adjustment, so `52a4150` remains the deployed implementation
candidate.

## What passed

- Fresh desktop and phone first screens state the job, audience, first action,
  outcome, and three facts before scrolling.
- The one-click demo loads realistic 24px/1.80×/52ch/Slate sample output, keeps
  its sample-data label visible, resets, and does not change seeded real
  browser storage.
- All 19 declared claim commands exit 0. One is incomplete as evidence, as
  detailed in F-6-2.
- `npm test` passed 15/15; typecheck, build, release artifact, full extension
  smoke, 30 browser/Axe tests, live release verification, and production audit
  passed.
- The public 28,179-byte MV3 ZIP byte-matches the clean build. Checkout returns
  303 to Dodo and shows Eye Comfort Profiles at $19.00.
- Live routes, route focus, links, legal pages, the designed HTTP 404, privacy
  request boundaries, keyboard operation, reduced motion, 200% reflow, and
  extension recovery paths passed.
- Mobile Lighthouse scored 100 in Performance, Accessibility, Best Practices,
  and SEO. FCP was 1.0s, LCP 1.1s, CLS 0, and TBT 20ms.

## Reproduce

From a clean checkout at `580c4bd6`:

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run test:release
npm run test:extension
npm run test:a11y
npm run test:live
```

Run each command in `.factory/claims.json` separately. For F-6-1, load the
unpacked build against an unassigned regular article, change Font style, and
observe the article before selecting **Save to this website**. For F-6-3,
inspect the bounding box of `label.switch` in the popup.

## Next steps

1. Preserve unsaved live preview while profile storage writes occur, and test
   the pre-assignment result.
2. Make `free-reading-controls` assert letter spacing, all four surfaces, and
   every advertised numeric boundary.
3. Enlarge the focus-band switch target to at least 44×44px.
4. Replace **Reading instrument** and **Reading geometry** with existing plain
   product terms.
5. Correct the one mismatched line in `.factory/copy-audit.md`.

Evidence is under `/work/.evidence/eye-comfort-profiles-v6/`.
