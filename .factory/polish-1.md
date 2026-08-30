# Polish 1 — adversarial review remediation

**Base candidate:** `138ac29b57776fd06d6bda5c78b2bb4e8c87812a`  
**Review:** `e19e08322db188e3b3eead74b976f3221c1fd6fc`  
**Repair commit:** `82f4910310871333efb2a11ef4b6d228d6a5f0d7`  
**Live check:** <https://eye-comfort-profiles.sociobot.in>

## Finding map

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1.a protected pages | Added `protected-pages-unchanged`; the real unpacked MV3 test opens `chrome://settings` and requires no injected style or band. | `npm run test:extension -- --claim=@claim:protected-pages-unchanged` passed from the clean clone. |
| F-1-1.b focus band | Added `focus-band-behavior`; it proves pointer movement, keyboard focus movement, `pointer-events: none`, and a successful click through the band. | `npm run test:extension -- --claim=@claim:focus-band-behavior` passed from the clean clone. |
| F-1-1.c install schedule | Removed “Chrome Web Store review comes later.” | Cold live page checked; screenshot `/tmp/ecp-polish-1-live-desktop-demo.png`. |
| F-1-1.d developer install promise | Removed the unsupported factory/developer-mode/removability promise and retained direct install steps. | Cold live page checked; screenshot `/tmp/ecp-polish-1-live-desktop-demo.png`. |
| F-1-1.e medical boundary | Added `comfort-not-medical-advice` and a visible exact scope assertion. | `npm run test:a11y -- --grep @claim:comfort-not-medical-advice` passed from the clean clone. |
| F-1-1.f unassigned website | Rewrote public wording to “website address” and added `unassigned-pages-unchanged`, which checks a styled local article before assignment. | `npm run test:extension -- --claim=@claim:unassigned-pages-unchanged` passed from the clean clone. |
| F-1-1.g untested recovery-state list | Removed the broad unproved recovery-state list from README. Existing recovery UI remains, but it is no longer advertised as an untested promise. | README copy audit and `npm test` claim inventory passed from the clean clone. |
| F-1-1.h manifest assertion | Removed the unproved host-access implementation statement from README and used plain behavior wording in Privacy. | README copy audit and `npm test` claim inventory passed from the clean clone. |
| F-1-2 | Replaced “A layout that returns with you” with “Preview saved reading settings.” | Cold live desktop/mobile checks; `/tmp/ecp-polish-1-live-desktop-demo.png`. |
| F-1-3 | Replaced “A clear boundary” with “What this extension does not do.” | Cold live desktop/mobile checks; `/tmp/ecp-polish-1-live-desktop-demo.png`. |
| F-1-4 | Replaced jargon and “honest” with “Choose from four font styles.” and four plain font names. | Cold live desktop/mobile checks; `/tmp/ecp-polish-1-live-desktop-demo.png`. |
| F-1-5 | Renamed the radio option “High contrast.” | `npm run test:a11y` passed 24/24; cold live desktop/mobile checks. |
| F-1-6 | Renamed demo exit action “Leave demo.” | `@claim:sample-demo` verifies the exit URL; `/tmp/ecp-polish-1-live-mobile-demo.png`. |
| F-1-7 | Split the README opening into two short sentences. | `.factory/copy-audit.md`; clean-clone `npm test` passed. |
| F-1-8 | Split README manual-test instruction. | `.factory/copy-audit.md`; clean-clone `npm test` passed. |
| F-1-9 | Split README extension-test description. | `.factory/copy-audit.md`; clean-clone `npm test` passed. |
| F-1-10 | Split README live-test description. | `.factory/copy-audit.md`; clean-clone `npm test` passed. |
| F-1-11 | Split README deployment description. | `.factory/copy-audit.md`; clean-clone `npm test` passed. |
| F-1-12 | Split README privacy/build description. | `.factory/copy-audit.md`; clean-clone `npm test` passed. |

## Demo and structure recheck

`?demo=1#controls` remains the direct isolated path. Demo mode now bypasses
license capture, cache reads, and verification, so it cannot read or write a
visitor’s real license state. The claim test seeds real supporter storage,
opens the direct demo URL, confirms storage is unchanged, and rejects any
non-site request. Reset restores all documented sample values and Leave demo
returns to `/`.

The deployed home, Privacy, Terms, demo, archive, and designed HTTP 404 were
checked again. Route-specific titles, canonical/social metadata, footer legal
links, keyboard focus, 390px layout, and the distinct reading-instrument visual
system remain intact. `npm run test:live` passed against the production URL.
