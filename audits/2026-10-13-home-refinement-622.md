# Issue #622 Home refinement — candidate assurance record

Status: implementation proposal; visual-baseline acceptance and merge approval pending. This is evidence, not normative authority or a production release record.

## Approved scope and runtime

Founder-approved design/work handoff: [Issue #622](https://github.com/lhanson-dev/revision/issues/622), 13 October 2026. Current approved main verified through GitHub and Git: `501388ee77484ffd896a7dad876a657d822b6ccb`. No conflicting active learner Home PR was found in the initial open-PR inspection. Branch `refine/home-622` targets `/revision/app/#/home`: `app/index.html → src/main.tsx → AuthGate → FirstUseBoundary → PlannerRuntime → PlannerHomeScreen`. Existing `src/app/App.tsx` is compatibility. Mandatory authority, design, evidence, engineering and workflow documents were inspected before implementation.

Known Home/REV/lifecycle conflicts are explicitly amended in the same PR. Those proposed amendments do not become integrated product truth until approved merge. Existing planner, commitments, evidence, routes, first-use boundaries and global navigation retain ownership. Plan's empty-card copy uses an honest choose-your-own-work sentence rather than promising automatic sessions from progress alone.

## Design reference

The frozen `design_system_v3/Home Mockup.dc.html` is absent from approved main; so is `Home Mockup-selection9.png`. Issue #622 contains no comments or image attachments. No Claude pixel comparison or mockup fidelity is claimed. Written Founder contract and canonical design authority govern the candidate. Real before/after captures against approved main are required for returning, all done, exhausted and zero courses on phone/tablet/desktop Light/Dark. Approval must review those actual differences; it is not implied by the issue's work authorisation.

## Implementation and assurance ownership

- One Home secondary alternative, no dismissal/book/reschedule API; bounded shared local-day exclusions retain compatibility with Plan/REV. Exhaustion is distinct from completion/rest/error.
- Three supported outstanding rows in genuine order, full-day summary preserved, no fabricated later-row pick highlight. Unsupported commitments remain stored and inspectable in Plan.
- Combined chronological later assessments, same-day Today, explicit kind/date and Plan-owned Edit dates; independent Exam Prep through Courses.
- Shared flat progress, inverse halo and extracted checklist; default component consumers preserved. No new semantic tokens, colours, radius or type families. No live Home v2 layout consumer remains; two shared RevSuggestionCard head glyph rules were moved unchanged into its canonical shared stylesheet before retiring the import. Historical stylesheet retained.
- Tests assert exact Start across Home/Plan/REV, persistence, once-only Ask REV, optional setup, unavailable/unsupported states, actual evidence and readiness semantics, accessible responsive controls. Old mode/dismiss/book assertions are replaced with the approved contract's nonmutation and independent-navigation assertions, not removed for a green result.

## Executed evidence and current limits

Initial sandboxed full test run failed because the sandbox blocked child processes and loopback fixture servers. Rerun with required execution access passed **239 files / 1,342 tests**, with **13 files / 35 tests skipped** under existing skip rules. No assurance or timeout was weakened. Production build and typecheck passed. Lint passed with two existing hook warnings. Focused Home model/setup/exact-target tests passed 19 tests; identity/control/shared UI checks passed 14 tests. Later corrections and final exact-head assurance are still being recorded below.

Initial browser runs caught and corrected shared checklist Light contrast, exhaustion on an accepted zero-capacity day, attribution phone layout and obsolete completed-row expectations. Concurrent browser runners shared a fixture server that one runner tore down; final validation runs use a single runner. Initial failing runs are not completion evidence.

New screenshot baselines are deliberately unchanged pending Founder review. Expected changed Home visual hashes must not be bypassed or pinned from an unapproved local run. Exact-head CI, final current-main integration and independent final diff review remain required before requesting merge approval. No merge or production deployment is authorised by this task.

## Corrected Home browser evidence

One consolidated production-build browser runner passed **79 tests / 2 existing viewport skips** across phone/tablet/desktop (`work/home-final.log`). This includes all four review states Light/Dark, 320px text enlargement, reduced motion/listening text, forced-colours operability, Axe, full-day counts with three rows, no fabricated fourth-row pick, exact Home/Plan/REV Start, accepted work nonmutation, unsupported Starts, Plan date editor and single-submit Ask REV. Final additional midnight/error/navigation checks and shared consistency run follow separately.

Final focused unit selection passed **66 tests / 16 files** after checklist contrast and glyph ownership corrections. The 24 approved-main before captures were completed using the same synthetic fixtures and pinned clock. New review images are evidence only, not accepted baselines.

Shared regression review found two ordinary-component assurances requiring explicit contract alignment: flat progress has no nested 20px cards (zero inner radius, one outer card), and the regular Home inverse alternative is now Suggest something else rather than Open Plan. The radius/contrast/hover/focus assertions remain active for the correct owners. The legacy Home v2 import had also carried two live shared-card glyph rules; those were relocated unchanged to shared `rev-suggestion-card.css` to preserve other consumers before removing the import.

## Final boundary and external-dependency checks

The strict follow-up passed the evidence-error/independent Exam Prep journey and width sweep on all three browser projects: **6 passed**, including widths 320, 390, 620, 621, 820, 960, 961, 1100, 1101 and 1440; canonical Living E 88/150/188/248 and large CTA ≥52px are asserted. The evidence error fixture uses a terminal 400 response: a transient 503 under the deliberately paused test clock left Supabase's retry timer pending, which tested loading rather than the intended settled error state. The production error handling was not weakened or changed for this correction.

The two unrelated C3 onboarding hash mismatches reproduce byte-for-byte on untouched approved main in this executor (Light `d49bd228aab68a157895781840bedacf2818dcb0b93ad0f4fc236603725eb723`, Dark `b1c5fb82b3d8458d44cdf19eab3bfea945cee4f8dc37714e0f4af33566cb9553` actual PNG hashes). They do not authorise new onboarding baselines.

Later external font fetches intermittently failed; strict loaded-font assertions correctly remained red. All 24 Home review metadata files verify real Manrope and Bricolage Grotesque loaded. Additional offline shared assurance uses the exact Google Fonts CSS/WOFF2 200-response bytes from the retained production-browser trace, leaving all original font, geometry, focus, hover and journey assertions intact. This is a local external-asset fixture, not a production font-loading change or a substitute for exact-head online CI.

GitHub API intermittently returned HTTP 503/ReadTimeout during CI inspection. Code-head CI `38465031057` is pending, not reported green. Independent verification compared the pushed PR patch against the local tree (`git apply --reverse --check`) and matched remote/local tree `17b3d1b72db17aca378e21bd5de2fbb9a3ce446c` for code commit `114f3cf9cb208d4ad5db8eb3fbf487fb70ddeb1f`. Current main remains `501388ee77484ffd896a7dad876a657d822b6ccb`. Final merge assurance remains incomplete until visual acceptance and exact-head CI are established.
