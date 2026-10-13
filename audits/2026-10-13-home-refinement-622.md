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
- Shared flat progress, inverse halo and extracted checklist; default component consumers preserved. No new semantic tokens, colours, radius or type families. No live Home v2 consumer remains; historical stylesheet retained without import.
- Tests assert exact Start across Home/Plan/REV, persistence, once-only Ask REV, optional setup, unavailable/unsupported states, actual evidence and readiness semantics, accessible responsive controls. Old mode/dismiss/book assertions are replaced with the approved contract's nonmutation and independent-navigation assertions, not removed for a green result.

## Executed evidence and current limits

Initial sandboxed full test run failed because the sandbox blocked child processes and loopback fixture servers. Rerun with required execution access passed **239 files / 1,342 tests**, with **13 files / 35 tests skipped** under existing skip rules. No assurance or timeout was weakened. Production build and typecheck passed. Lint passed with two existing hook warnings. Focused Home model/setup/exact-target tests passed 19 tests; identity/control/shared UI checks passed 14 tests. Later corrections and final exact-head assurance are still being recorded below.

Initial browser runs caught and corrected shared checklist Light contrast, exhaustion on an accepted zero-capacity day, attribution phone layout and obsolete completed-row expectations. Concurrent browser runners shared a fixture server that one runner tore down; final validation runs use a single runner. Initial failing runs are not completion evidence.

New screenshot baselines are deliberately unchanged pending Founder review. Expected changed Home visual hashes must not be bypassed or pinned from an unapproved local run. Exact-head CI, final current-main integration and independent final diff review remain required before requesting merge approval. No merge or production deployment is authorised by this task.
