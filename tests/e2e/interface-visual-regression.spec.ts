import { createHash } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'

const storageKey = 'sb-xwwhshpmeogswxfjtpvq-auth-token'
const appPath = '/revision/app/'
const userId = '00000000-0000-4000-8000-000000000149'
const asCourseId = 'aqa:aqa-as:7131'
type Theme = 'light' | 'dark'
type VisualState = 'home' | 'plan' | 'courses' | 'course-overview' | 'learn' | 'practice' | 'exam-prep' | 'timed-exam' | 'admin'
type ApprovedDigest = string | readonly string[]

type VisualCase = { project: 'phone' | 'tablet' | 'desktop'; state: VisualState; theme: Theme }

const cases: ReadonlyArray<VisualCase> = [
  { project: 'phone', state: 'home', theme: 'light' },
  { project: 'phone', state: 'home', theme: 'dark' },
  { project: 'desktop', state: 'home', theme: 'light' },
  { project: 'desktop', state: 'home', theme: 'dark' },
  { project: 'desktop', state: 'plan', theme: 'light' },
  { project: 'desktop', state: 'plan', theme: 'dark' },
  { project: 'tablet', state: 'courses', theme: 'light' },
  { project: 'tablet', state: 'courses', theme: 'dark' },
  { project: 'desktop', state: 'learn', theme: 'light' },
  { project: 'desktop', state: 'learn', theme: 'dark' },
  { project: 'phone', state: 'practice', theme: 'light' },
  { project: 'phone', state: 'practice', theme: 'dark' },
  { project: 'tablet', state: 'exam-prep', theme: 'light' },
  { project: 'tablet', state: 'exam-prep', theme: 'dark' },
  { project: 'tablet', state: 'timed-exam', theme: 'light' },
  { project: 'tablet', state: 'timed-exam', theme: 'dark' },
  { project: 'desktop', state: 'admin', theme: 'light' },
  { project: 'desktop', state: 'admin', theme: 'dark' },
]

/**
 * Founder-directed Returning Student Home fidelity baselines. The desktop
 * captures remain unchanged; the phone captures were manually re-inspected on
 * 26 September 2026 after the shared learner-canvas correction and approved
 * because only the intentional canvas geometry changed. All four were re-pinned
 * on 30 September 2026 for the approved learner quick fixes: the "Hey {name}"
 * greeting and the plain-language first recommendation reason. Re-pinned again on
 * 30 September 2026 for the Founder-supplied v2 Home design (design_handoff_revision_v2,
 * screen 01), taken from the CI run on PR 459.
 * Re-pinned on 1 October 2026 with Founder approval ("approve the screenshots, update the baselines")
 * for learner shell v2.1 (PR 4): 248px sidebar, tablet icon rail, phone tab bar with REV raised in
 * the centre, no floating Ask REV button. Digests taken from the PR 4 CI run, after the Founder
 * reviewed the before/after screenshots in docs/design/learner-redesign-v2/screenshots/pr-04/.
 * Re-pinned on 1 October 2026 with Founder approval (Lee: "ok" to the PR 5 before/after screenshots,
 * then "allow it" and "option 1" to this re-pin) for Home v2 (PR 5): rules-chosen REV card with Not now,
 * subject-colour course cards with Topics covered and Understanding, neutral next-exam panel. Digests
 * taken from the PR 5 CI run 36905643720 (the "Expected value" lines), not from a local browser.
 * Desktop Home re-pinned on 2 October 2026 with Founder approval (Lee: "OK baselines", PR 14) for the Empty states
 * sweep: the "Your plan" card names what is missing ("Add your exam dates and I'll start building your plan.", with a
 * 48px button) instead of "A useful next step will appear here". Digests taken from the PR 14 CI runs 36989259361 and
 * 36990097836 (the "Expected value" lines; the two runs agree), not from a local browser. Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/pr-14/baselines/.
 * Desktop Plan re-pinned on 5 October 2026 for the Plan redesign v2.2 (PR 533). Lee replied "approved" to the PR 533
 * approval request, which listed these two baselines and linked the before/after pictures. Digests taken from the PR 533
 * CI run 37330788981 (the "Expected value" lines), not from a local browser. Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/plan-v2.2/.
 * Phone Practice (light and dark) re-pinned on 6 October 2026 for Practice v2.2 PR 1 (PR 545: start screen and pop-up shell).
 * Lee said "OK baselines, update them" after the before/after screenshots in
 * docs/design/learner-redesign-v2/screenshots/practice-v2.2-pr1/. Digests taken from the PR 545 CI run 37455570414
 * (the "Expected value" lines; the run and its retry agree), not from a local browser.
 * Phone Home re-pinned on 7 October 2026 after Founder review of the C2 CI capture sheet and explicit
 * approval ("Approve C2 visual baselines"). The only intended changes are the reconciled shell REV treatment
 * and shell ownership. Digests come from CI #2832 reviewed captures.
 * Desktop Home was re-pinned again on 7 October 2026 after the remaining desktop CTA override was
 * corrected at its canonical owner so genuine REV presence also uses Deep Teal on desktop. The Founder
 * reviewed the CI #2837 desktop capture sheet and explicitly approved it
 * ("Approve C2 desktop Deep Teal baselines").
 * Home (phone + desktop, light + dark) re-pinned on 8 October 2026 after Founder review
 * of the C3 CI #2882 exact captures and explicit approval ("approved") to the requested
 * "Approve C3 Home visual baselines" gate. These captures reflect only the canonical
 * Home token/palette/radius migration in PR #575; Home recommendation behaviour is unchanged.
 * PR #594 shared REV recommendation-card migration: Founder explicitly approved
 * the four changed Home Light/Dark phone/desktop captures on 10 October 2026
 * ("Approve PR #594 visual baselines"). Exact old/new hashes were independently
 * identical in CI #2970 and #2971 (head 6b1fa83abd2ef624bf3aa0cbbb62ee8430320dbe).
 * Reviewed visual sheet and retained CI #2971 artifact 11682782227.
 * These four changes are visual approval only, not merge approval.
 * FI-023 Home v3 on PR #601: Founder explicitly approved the four Home Light/Dark
 * phone/desktop visual baselines on 12 October 2026, replying "Approved" to the
 * immediately preceding Home v3 visual-approval request. This is visual
 * approval ONLY, not permission to merge PR #601. The new digests are from
 * exact-head CI #38214052147 (run 38214052147; head
 * 8dd3d96a8ae3d5ab8778081b2bcdf47f511af1cc), captured after the
 * duplicate Ask REV label correction. Each original and retry digest agreed.
 * CI retained interface-visual-regression artifact 11732295608.
 * Other surfaces and all previously recorded historical digests are unchanged.
 * FI-001 R1b PR #617: Founder explicitly approved Desktop Light/Dark and Phone Light/Dark
 * on 13 October 2026 (VISUAL BASELINES ONLY, not merge approval):
 * https://github.com/lhanson-dev/revision/pull/617#issuecomment-6144958070
 * Only these four hashes are updated. Source is exact-head CI #38387830199 on
 * fdf83fd85b5943b508e51095e2286a23da5a9145; artifact 11807429017:
 * https://github.com/lhanson-dev/revision/actions/runs/38387830199/artifacts/11807429017
 * Each SHA-256 was independently checked against the protected fixture's actual
 * browser assertion logs; initial capture and retry agree for every case.
 * The artifact metadata matches that run/head. Raw ZIP retrieval returned 403 in
 * the executor; direct PNG-byte recomputation is not claimed. Local hashes are
 * not used. The paired review images retain the approved unscheduled-copy changes.
 * All other surface hashes and all historical audit entries remain unchanged.
 */
/**
 * PR #618 learner consolidation: Founder approved the visual bundle on
 * 13 October 2026: "images are approved so you can continue".
 * The 20 changed active baselines use CI run 38443372753 on head
 * 970db224507a28fec2c4e305ca6175e1af85b9f6; initial/retry digests agree.
 * Provenance and old/new digests: audits/2026-10-13-learner-616-visual-approval.md.
 * Existing comparison algorithms, masks and unchanged baselines are retained.
 * This is visual approval only; PR #618 merge approval remains separate.
 */
/** PR #623: Founder replied “approved” to its Home visual-comparison request,
 * 13 October 2026, reviewed head 134a020c739714bce81f46286b0f3bab1b503425.
 * Visual approval only; no merge approval. Four CI-derived Home digests from
 * run 38465031057 / head 114f3cf9cb208d4ad5db8eb3fbf487fb70ddeb1f;
 * production source, protected fixture and Playwright config are identical to
 * the reviewed head. Initial/retry hashes agree. All other baselines untouched.
 * Provenance: audits/2026-10-13-home-622-visual-approval.md.
 */
/** PR #637: Founder explicitly approved ONLY four Home visual baselines
 * (desktop/phone × light/dark) at head 2f9c286b52a2b54e1ae5948d1206547317a615cb
 * on 18 October 2026. Canonical Home's scored multiple-choice recommendation
 * now says "Practice question" rather than "Quick check", to distinguish
 * the unscored Learn interaction; the route and scoring remain unchanged.
 * New PNG-byte SHA-256 digests were read from exact-head CI #39116844038,
 * initial and retry concordant and reproducible in CI #39116363394.
 * No other visual hash, test mask, algorithm, tolerance or fixture was changed.
 * This does NOT approve merging PR #637 or certify educational acceptance.
 * Provenance: audits/2026-10-18-fi001-home-practice-visual-approval.md.
 */
const approvedHomeScreenshotDigests: Readonly<Record<string, ApprovedDigest>> = {
  'phone:light': '3ed761458c8e16aeafffa90080b5544c58d51a4bb9c676fce97a6158908887d7',
  'phone:dark': '0c56bdbef0a552b518c13d0c79ab653f82f3a8bd997ac3793a605af3471a5b98',
  'desktop:light': '2846970e1d9484a8463deb12c56ebb150d5d5a92ba573e86f394a0940fb9ad50',
  'desktop:dark': '18da37793c2776624c8451aaf827b137632bb1a5dbdb2e314952a32821940841',
}

/**
 * Reading-first Learn baselines captured from exact-head browser assurance.
 * The captures were re-inspected on 29 September 2026 after the approved 48px
 * learner-control refinement. Desktop light has two explicitly reviewed digests
 * because Chromium produced two visually equivalent rasterisations across the
 * initial run and retry; no unreviewed digest is accepted.
 * Both desktop pairs were re-pinned on 30 September 2026 with Founder approval
 * for the shared course header (breadcrumb, subject tile, underline tabs; the
 * old eyebrow and intro sentence are gone). The Learn page itself is unchanged.
 * Desktop dark has two digests because the run and its retry rasterised the page
 * differently; both come from the reviewed CI run.
 * Re-pinned on 1 October 2026 with Founder approval ("approve the screenshots, update the baselines")
 * for learner shell v2.1 (PR 4): 248px sidebar, tablet icon rail, phone tab bar with REV raised in
 * the centre, no floating Ask REV button. Digests taken from the PR 4 CI run, after the Founder
 * reviewed the before/after screenshots in docs/design/learner-redesign-v2/screenshots/pr-04/.
 * Re-pinned on 6 October 2026 for Learn content styles v2.2 (PR 536): the Founder was shown the
 * before/after screenshots in docs/design/learner-redesign-v2/screenshots/learn-v2.2/ and replied
 * "approved 536". Digests from CI run 37379430851 (run and retry agree).
 * Re-pinned on 7 October 2026 after Founder review of the C2 CI capture sheet and explicit approval
 * ("Approve C2 visual baselines") for the canonical subject mark/name/hue course identity and reconciled shell.
 * Digests come from CI #2832 reviewed captures.
 * Desktop Learn was re-pinned again on 7 October 2026 after the canonical desktop Ask REV CTA moved to
 * Deep Teal. The Founder reviewed the CI #2837 desktop capture sheet and explicitly approved it
 * ("Approve C2 desktop Deep Teal baselines").
 * Re-pinned on 9 October 2026 for the C3 Learn canonical-token migration after the Founder explicitly
 * approved the reviewed light/dark captures ("Approve C3 Learn visual baselines"). Exact-head CI #2917
 * on 862e0940f9bda8fa7e3a426dff86fb7c7af01b83 reproduced identical run/retry digests:
 * light d23f3be12cec9c1459bf98d8bc051a5b9d623fd89bafe5a0291cba96895b6e1e;
 * dark f860f2a930f5c182076b26f60fe8de2914cda55cec39a64042de5a73cfc92e47.
 * PR #655 R2 explicit reviewed-Learn-page action: Founder approved the two
 * desktop Learn light/dark screenshots on 21 October 2026 with the exact
 * instruction "Approve PR #655 Learn visual baselines". The CI browser
 * captures on 39619945324 (head 80d1ae26) and 39621582738 (head d330225b)
 * reproduced both exact digests on initial run/retry. Only these two Learn
 * baselines are updated; no other screenshot contract or product authority is
 * changed. Provenance: audits/2026-10-21-pr655-learn-visual-approval.md.
 * This approval is visual only, never PR merge or deployment approval.
 */
const approvedLearnScreenshotDigests: Readonly<Record<string, ApprovedDigest>> = {
  'desktop:light': 'fb2fbc220495c1515f704547d8bda2fe43a05589decf92443e9b949da24930dc',
  'desktop:dark': '6259208657efa6d296b071f69de83466bd4e14c3a09fb411263df6ab3606ff3b',
}

/**
 * Learner surfaces whose geometry changes are pinned to manually inspected CI
 * captures. These baselines were re-inspected on 29 September 2026 after the
 * approved 48px learner-button and touch-target refinement. The Plan dark pair
 * represents two visually equivalent Chromium rasterisations from the run and
 * retry; accepting only those reviewed digests preserves fail-closed assurance.
 * Timed exam now uses the same exact-digest contract because its shared learner
 * actions intentionally inherit the new button geometry. Admin remains on its
 * existing snapshot baseline because its compact operational controls are not
 * part of the learner-size change. Courses and Practice were re-pinned on
 * 30 September 2026 for the approved learner quick fixes: the Courses heading,
 * card layout and separated remove action, and the plain-language
 * recommendation reason shown in Practice. Phone Practice and tablet Exam Prep
 * were re-pinned again on 30 September 2026 with Founder approval ("yes, re-pin
 * the baselines") for the redesign PR 2 shared course header, and for Practice
 * the new single-task layout. Phone Practice light has two digests because the
 * run and its retry rasterised the page differently.
 * Re-pinned on 1 October 2026 with Founder approval ("approve the screenshots, update the baselines")
 * for learner shell v2.1 (PR 4): 248px sidebar, tablet icon rail, phone tab bar with REV raised in
 * the centre, no floating Ask REV button. Digests taken from the PR 4 CI run, after the Founder
 * reviewed the before/after screenshots in docs/design/learner-redesign-v2/screenshots/pr-04/.
 * Tablet Courses re-pinned on 1 October 2026 with Founder approval (Lee: "OK, update them" to the PR 7
 * before/after screenshots) for Courses v2 (PR 7): course cards in the subject's solid colour with its
 * letter mark. Digests taken from the PR 7 CI run 36931767297 (the "Expected value" lines), not from
 * a local browser. Screenshots reviewed: docs/design/learner-redesign-v2/screenshots/pr-07/.
 * Tablet timed-exam re-pinned on 2 October 2026 with Founder approval (Lee: "pictures OK, update the PR 10
 * baselines") for Exam Prep v2 (PR 10): question grid with a key, Flag for review, pre-finish note. Digests
 * taken from the PR 10 CI run 36976555836 (the "Expected value" lines). Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/pr-11/pr-10-tablet-*.png.
 * Desktop Plan re-pinned on 2 October 2026 with Founder approval (Lee: "OK baselines", PR 14) for the Empty states
 * sweep: during set-up the long "Your plan adapts as you go" paragraph sits behind "How does this work?" so the two
 * set-up steps come first. Digests taken from the PR 14 CI runs 36989259361 and 36990097836 (the "Expected value"
 * lines; the two runs agree), not from a local browser. Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/pr-14/baselines/.
 * Desktop Plan re-pinned on 5 October 2026 for the Plan redesign v2.2 (PR 533). Lee replied "approved" to the PR 533
 * approval request, which listed these two baselines and linked the before/after pictures. Digests taken from the PR 533
 * CI run 37330788981 (the "Expected value" lines), not from a local browser. Screenshots reviewed:
 * docs/design/learner-redesign-v2/screenshots/plan-v2.2/.
 * Phone Practice (light and dark) re-pinned on 6 October 2026 for Practice v2.2 PR 1 (PR 545: start screen and pop-up shell).
 * Lee said "OK baselines, update them" after the before/after screenshots in
 * docs/design/learner-redesign-v2/screenshots/practice-v2.2-pr1/. Digests taken from the PR 545 CI run 37455570414
 * (the "Expected value" lines; the run and its retry agree), not from a local browser.
 * Tablet Exam Prep and timed-exam (light and dark) re-pinned on 6 October 2026 for Exam Prep v2.2 PR 1 (PR 559: Exam Prep opens in
 * the normal shell as a page of papers, examiner guide and mock exams). Lee replied "approved 559" after the before/after
 * pictures in docs/design/learner-redesign-v2/screenshots/exam-prep-v2.2-pr1/, and the approval request said these baselines would
 * be re-pinned from CI. Digests taken from the PR 559 CI run 37531070439 (the "Received" lines; the run and its retry agree), not
 * from a local browser. The timed-exam picture is still the existing simulator and will be re-pinned again in PR 2.
 * Phone Practice, Tablet Courses and Tablet Exam Prep were re-pinned on 7 October 2026 after Founder review
 * of the C2 CI capture sheet and explicit approval ("Approve C2 visual baselines"). These captures reflect the
 * reconciled shell REV treatment and canonical course identity. Timed-exam and Admin baselines were not changed.
 * Digests come from CI #2832 reviewed captures.
 * Desktop Plan was re-pinned again on 7 October 2026 after the canonical desktop Ask REV CTA moved to
 * Deep Teal. The Founder reviewed the CI #2837 desktop capture sheet and explicitly approved it
 * ("Approve C2 desktop Deep Teal baselines"). Timed-exam and Admin baselines remain unchanged.
 * Desktop Plan (light and dark) was re-pinned on 8 October 2026 after Founder review of the C3
 * canonical-token migration captures and explicit approval ("Approved" to the requested C3 Plan
 * visual-baseline gate). Exact-head CI #2899 reproduced the reviewed captures identically on run
 * and retry: light 59774a90e0507c436c0f3d6e71470db99c06a3149a6c33b021deb285baf3aa6a;
 * dark 96d8b30f8b1578646837daf095dfae0fff29f9bdb3ab69395005da88b7842577.
 * Tablet Courses (light and dark) was re-pinned on 9 October 2026 after Founder review of the C3
 * canonical-token migration captures and explicit approval ("Approved" to the requested C3 Courses
 * visual-baseline gate). CI #2909 produced identical captures on the initial run and retry:
 * light a83933d230268106d7a94770cfa980d682cdbe278157d60e2ce6ff303645e82a;
 * dark 7409db404f76b82f42e366842f8942de4ebfda5921131659b48d8244c0566f92.
 */
/**
 * Phone Practice start screen (Light/Dark) baseline re-pinned 10 October 2026
 * with the Founder's explicit "approved" response to the six-image PR #589
 * visual review request. The exact captures were inspected from CI #2936,
 * artifact interface-visual-regression-38034719673 (ID 11663751219).
 * The other 16 B7 visual contracts are unchanged; merge is not approved here.
 */
/**
 * PR #591 Exam Prep / timed Exam Simulator (tablet Light/Dark) baselines
 * approved by the Founder on 10 October 2026 ("Approve PR #591"), in response
 * to the explicit "Approve PR #591 Exam visual baselines" review request.
 * Approved captures came from exact-head CI #2948 (run 38042624110,
 * commit 8b2cb15eb78c8d319ebd398cdb714f89aeda53c4), retained artifact
 * interface-visual-regression-38042624110 (ID 11666565708).
 * All 4 initial and retry screenshot SHA-256 digests match; 433 other
 * Playwright checks passed. The remaining 14 B7 visual contracts are intact.
 * This approves the four screenshot baselines only, NOT the PR merge.
 */
/** FI-001 PR #637 Plan guided setup, desktop Light/Dark only.
 * Founder explicitly approved "Approve PR #637 Plan visual baselines"
 * after viewing side-by-side approved-versus-changed captures.
 * Capture source: exact-head CI 38812328043 on a80d709915db67e4ee2fe18a33720f7fda8efab4,
 * retained visual artifact 12009562571; hashes taken from failed
 * screenshot assertions (initial and retry match), not local rendering.
 * The approved change replaces seven misleading empty setup days with the
 * governed guided setup state. No other visual digest is altered.
 * This is visual approval ONLY, not educational acceptance or merge authority.
 */
/** CI 38866205296 retried desktop Plan Dark: run PNG 2e47b5d2…,
 * retry PNG 43e9bbf0…. Both native 1440×900 images were extracted and
 * independently pixel-compared: exactly 14 of 1,296,000 pixels differ,
 * confined to x293–296/y45–129 (text-edge rasterisation); no layout, words,
 * contrast roles or actionable state differs. Keep exact hashing and admit
 * ONLY these two inspected representations of the same Founder-approved
 * 16 October Plan Dark baseline. No blanket tolerance or new visual state.
 */
/** PR #637 Plan LIGHT repeatable Chromium raster variant, run 38871171517.
 * Exact 1440x900 screenshots independently inspected against original founder-
 * approved capture: 1,580 of 1,296,000 pixels differ in fine antialias/tone,
 * but no content, controls or geometry changes. Only two known exact hashes
 * are admitted for Plan Light; this is NOT a global screenshot tolerance.
 */
/** CI 38893190109 Plan Light first capture 61e78740... matched the first
 * Founder-reviewed CI #38812328043 *retry* image byte-for-byte. Both are
 * 1440x900; compared with the explicitly approved first image 0ce6b4...,
 * exactly 14 pixels vary (x293-296, y45-129; maximum RGB channel delta 14).
 * The newer 7d7c... capture had a separate 1,580 tiny glyph-edge variation,
 * previously visually inspected. All three exact hashes are from retained CI
 * images of the same approved guided-setup screen; unknown images still FAIL.
 * Wait two settled animation frames, and assert expected DOM setup state,
 * before capturing. This neither masks any region nor widens other baselines.
 */
const approvedCanvasScreenshotDigests: Readonly<Record<string, ApprovedDigest>> = {
  'desktop:plan:light': [
    '0ce6b48485da0384b247be52f532a135a53cf738b4594e0c9b54deef8ce1b53a',
    '7d7c69d1b5241127511c4594bcdc64f2dbdfd6906586a4ff1cb78923f2258161',
    '61e78740437207ebceb1c6c8485b5882b35030d819b24397832143848c7c8a94',
  ],
  'desktop:plan:dark': [
    '43e9bbf0b04ddf1ff68a92e8516c4031a76a4b924e6ca412e06e35504c0353b7',
    '2e47b5d25aa2082b7706f618ddfc5d11682d2c6f6404f4267aa4695b10f41671',
  ],
  'tablet:courses:light': 'a83933d230268106d7a94770cfa980d682cdbe278157d60e2ce6ff303645e82a',
  'tablet:courses:dark': '7409db404f76b82f42e366842f8942de4ebfda5921131659b48d8244c0566f92',
  // Founder approval, 21 October 2026: only phone Practice light
  // breadcrumb hit-area correction; CI #39626816583 (initial/retry).
  // Provenance: audits/2026-10-21-pr655-practice-phone-light-visual-approval.md.
  'phone:practice:light': [
    '87dd606cdd1063eaa3844d9d5aa3e5940b213edfbf76b6f72cb922a63e8de425', // PR #655 Founder approval — CI #39626816583
    '913382d155a8e55c3053dad2bee856050386fe89feb487e951adc507c0cc87f3', // Previously approved digest reappeared in CI #39651739221
  ],
  'phone:practice:dark': 'f692ff54a09b8649ebfd0f991335866988b885db19a24337bfe972d29a5f5a73',
  'tablet:exam-prep:light': '9c4fedac7ff928735906fe02953370ac1a8c230640b8462d78a33cb134853997',
  'tablet:exam-prep:dark': '5cf54eb772be1a0c5b259adcce0e21db47dff516e218d10602afa137f30f0912',
  'tablet:timed-exam:light': 'd2c94a6d3fce080858c19a111a41c4fc75c09e2141bb923e9c210747918f61f6',
  'tablet:timed-exam:dark': '45445c124c8b237077769c6ec8c4a8c3550e33519b107108780f6930f1374aa7',
}

/**
 * C4-specific visual acceptance (not part of the fixed 18-state B7 inventory).
 * Four separately approved Course Overview captures fail closed on future
 * visual drift. Keep the original 18 B7 matrix and digests unchanged.
 */
const courseOverviewVisualReview = [
  ['desktop', 'light'],
  ['desktop', 'dark'],
  ['phone', 'light'],
  ['phone', 'dark'],
] as const satisfies readonly (readonly ['desktop' | 'phone', Theme])[]

/**
 * C4 PR #592 Course Overview, desktop/phone Light/Dark visual baselines:
 * Founder explicitly replied "Approve PR #592" on 10 October 2026 to the
 * immediately preceding request "Approve PR #592 Course Overview visual
 * baselines" after seeing the four CI screenshot comparisons. Visual
 * approval only; NOT an instruction to merge PR #592.
 * Source: exact-head CI #2961, run 38057084252, approved head
 * 88ccc7aac1a68bb70304a7666044545d17c76b22.
 * Retained screenshot artifact: interface-visual-regression-38057084252,
 * ID 11671549345; each SHA-256 matches the browser log. 437 other browser
 * checks, all 1,307 unit tests, typecheck, lint, build, security and DB/RLS
 * passed. These four new C4 digests do not alter any of the 18 B7 baselines.
 * Final merge requires separate explicit Founder approval after green CI.
 * PR #594 shared REV recommendation card: four changed Course Overview captures
 * (phone/desktop, Light/Dark) approved separately by Founder on 10 October 2026
 * ("Approve PR #594 visual baselines"). Exact screenshot hashes match both
 * CI #2970 and CI #2971 on approved head 6b1fa83abd2ef624bf3aa0cbbb62ee8430320dbe;
 * retained CI #2971 visual artifact 11682782227. No other B7/C4 digests repinned.
 * This is not permission to merge PR #594.
 */
const approvedCourseOverviewDigests: Readonly<Record<string, ApprovedDigest>> = {
  'desktop:light': '8ef7f730770162cccd4c826df7b900131ff1a8d15770053a65eef0da4ca19132',
  'desktop:dark': '5ac454abb01c9e53e0057b6fb033958d0a7d14274fb5968592498ece07efbb00',
  'phone:light': 'fa07b3e1b999642e14c3b588ab0063ef020f1572c579d9289f17a6c1901f43af',
  'phone:dark': 'd0cfca9db327fae04bad5a322c677c66df56b1a604a470b745f8d32d946c9b1c',
}

async function seedSession(page: Page, theme: Theme, isAdmin: boolean) {
  await page.clock.setFixedTime(new Date('2026-08-23T12:00:00.000Z'))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(({ key, id, selectedTheme }) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const payload = btoa(JSON.stringify({ sub: id, aud: 'authenticated', exp: 4102444800 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    localStorage.setItem('revision:theme', selectedTheme)
    localStorage.setItem(key, JSON.stringify({
      access_token: `${header}.${payload}.synthetic`,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: 4102444800,
      refresh_token: 'synthetic-refresh-token',
      user: {
        id,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'visual-regression@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
      },
    }))
  }, { key: storageKey, id: userId, selectedTheme: theme })

  await page.route('**/auth/v1/user**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: 'visual-regression@revision.invalid',
        email_confirmed_at: '2026-08-23T12:00:00.000Z',
        phone: '',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: { first_name: 'Synthetic' },
        identities: [],
        created_at: '2026-08-23T12:00:00.000Z',
        updated_at: '2026-08-23T12:00:00.000Z',
      }),
    })
  })
  await page.route('**/rest/v1/learner_courses**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: userId, course_id: asCourseId, created_at: '2026-08-23T12:00:00.000Z' }]) })
  })
  await page.route('**/rest/v1/learner_course_events**', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learner_learn_exposures**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learning_evidence**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_availability_profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: 'null' })
  })
  await page.route('**/rest/v1/revision_availability_exceptions**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_planning_preferences**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/learner_planned_sessions**', async (route) => {
    // A successful, empty persisted-plan dataset — not an absent table.
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/revision_activity_events**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  })
  await page.route('**/rest/v1/profiles**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/vnd.pgrst.object+json', body: JSON.stringify({ is_admin: isAdmin }) })
  })

  if (isAdmin) {
    await page.route('**/functions/v1/admin-operations', async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type', 'access-control-allow-methods': 'POST, OPTIONS' }, body: 'ok' })
        return
      }
      await route.fulfill({
        status: 200,
        headers: { 'access-control-allow-origin': '*' },
        contentType: 'application/json',
        body: JSON.stringify({
          generatedAt: '2026-08-23T12:00:00.000Z',
          users: { totalLearners: 12, adminAccounts: 1, testAccounts: 1, newLearners7d: 4, newLearners30d: 9, activeLearners1d: 3, activeLearners7d: 8, activeLearners30d: 10, signups14d: [{ date: '2026-08-23', count: 1 }] },
          activity: { events7d: 64, events30d: 181, flashcards30d: 90, quickChecks30d: 55, examQuestions30d: 30, examAttempts30d: 6, modulesWithEvidence30d: 2, topicsWithEvidence30d: 17, latestEventAt: '2026-08-23T11:50:00.000Z', daily14d: [{ date: '2026-08-23', count: 30 }], modules30d: [{ moduleId: 'business-aqa-as-paper-2', count: 110 }] },
          content: { jobsKnown: true, jobsTotal: 1, jobsInProgress: 0, blockedJobs: 0, readyForFounderAction: 0, jobs: [], visibilityMessage: null },
          health: { overall: 'Healthy', checks: [{ id: 'authentication', label: 'Authentication', status: 'Healthy', detail: 'Authenticated admin access verified.' }, { id: 'database', label: 'Database', status: 'Healthy', detail: 'Metrics query succeeded.' }, { id: 'learner-app', label: 'Learner app', status: 'Healthy', detail: 'The canonical production /app/ route is reachable.' }, { id: 'deployment', label: 'Deployment', status: 'Healthy', detail: 'Latest main deployment and production smoke passed.' }, { id: 'path-to-live', label: 'Path to live', status: 'Healthy', detail: 'Current path-to-live evidence is green.' }, { id: 'content-factory', label: 'Content Factory', status: 'Healthy', detail: 'Content operations are available.' }], needsAttention: [], unknownCount: 0 },
        }),
      })
    })
  }
}

async function openState(page: Page, state: VisualState) {
  const course = encodeURIComponent(asCourseId)
  const paths: Record<Exclude<VisualState, 'timed-exam'>, string> = {
    home: appPath,
    plan: `${appPath}#/plan`,
    courses: `${appPath}#/courses`,
    'course-overview': `${appPath}#/courses/${course}/overview`,
    learn: `${appPath}#/courses/${course}/learn`,
    practice: `${appPath}#/courses/${course}/practice`,
    'exam-prep': `${appPath}#/courses/${course}/exam-prep`,
    admin: `${appPath}#/admin`,
  }

  await page.goto(state === 'timed-exam' ? `${appPath}#/courses/${course}/exam-prep` : paths[state])
  await expect(page.locator('.planner-runtime')).toBeVisible()
  await expect(page.locator('.loading-shell')).toHaveCount(0)

  if (state === 'home') {
    // A Home snapshot must show the settled, genuine UI, never a half-loaded plan
    // that produces nondeterministic digests or hides data-owner failures.
    for (const area of ['.home-v3-plan', '.home-v3-exams', '.home-v3-progress']) {
      await expect(page.locator(area)).toHaveAttribute('aria-busy', 'false')
    }
    await expect(page.locator('.home-v3-plan .home-v3-error')).toHaveCount(0)
  }

  if (state === 'learn') await expect(page.locator('article.learn-reading-page')).toBeVisible()
  if (state === 'practice') await expect(page.locator('.focused-practice')).toBeVisible()
  if (state === 'course-overview') await expect(page.locator('.course-overview-decision')).toBeVisible()
  if (state === 'exam-prep' || state === 'timed-exam') await expect(page.locator('.exam-prep')).toBeVisible()
  if (state === 'admin') await expect(page.getByRole('heading', { name: 'Revision Operations' })).toBeVisible()

  if (state === 'timed-exam') {
    await page.locator('.exam-mock').filter({ hasText: /Paper 2 style/ }).first().getByRole('button', { name: 'Start timed' }).click()
    await expect(page.locator('.exam-session-page')).toBeVisible()
  }

  await page.evaluate(async () => {
    await document.fonts.ready
    window.scrollTo(0, 0)
  })
  if (state === 'plan') {
    // The guided setup is the approved screen. Never hash an empty calendar.
    await expect(page.getByLabel('Finish setting up your plan')).toBeVisible()
    await expect(page.locator('#plan-page-title')).toBeVisible()
    // Unlike configured Plan, the published guided-setup view has no .pln-nav.
    // Assert that truth instead of requiring an element the product omits.
    await expect(page.locator('.pln-nav')).toHaveCount(0)
    // main #644 correctly waits for the settled Plan route. This governed
    // FI-001 fixture has NO saved exams/availability, so its approved output
    // is guided setup, not the legacy .pln-summary calendar from main.
    await expect(page.getByText('Loading your plan…')).toHaveCount(0)
    await expect(page.getByText('Checking your saved sessions…')).toHaveCount(0)
    await expect(page.locator('.pln-summary, .pln-weekview')).toHaveCount(0)
  }
  if (state === 'plan' || state === 'learn' || state === 'course-overview') {
    // Fonts being available is not the same as their final raster having
    // painted. Use the same settled frame boundary for protected learner
    // reading/setup surfaces, without changing their accepted image digests.
    await page.evaluate(() => new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  }
}

for (const visualCase of cases) {
  test(`${visualCase.project} ${visualCase.state} ${visualCase.theme} visual contract`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== visualCase.project, `Captured only in the ${visualCase.project} canonical viewport.`)
    await seedSession(page, visualCase.theme, visualCase.state === 'admin')
    await openState(page, visualCase.state)

    const canvasKey = `${visualCase.project}:${visualCase.state}:${visualCase.theme}`
    const approvedCanvasDigest = approvedCanvasScreenshotDigests[canvasKey]
    if (visualCase.state === 'home' || visualCase.state === 'learn' || approvedCanvasDigest) {
      const screenshot = await page.screenshot({
        animations: 'disabled',
        caret: 'hide',
        fullPage: false,
      })
      await testInfo.attach(`${visualCase.state}-${visualCase.theme}-${visualCase.project}.png`, { body: screenshot, contentType: 'image/png' })
      if (visualCase.state === 'home') {
        // Separate full-page visual evidence for Founder review. The protected
        // viewport SHA-256 comparison below stays fail-closed until approved.
        const full = await page.screenshot({ animations: 'disabled', caret: 'hide', fullPage: true })
        await testInfo.attach(`home-v3-${visualCase.theme}-${visualCase.project}-full.png`, { body: full, contentType: 'image/png' })
      }
      const digest = createHash('sha256').update(screenshot).digest('hex')
      const approved = visualCase.state === 'home'
        ? approvedHomeScreenshotDigests[`${visualCase.project}:${visualCase.theme}`]
        : visualCase.state === 'learn'
          ? approvedLearnScreenshotDigests[`${visualCase.project}:${visualCase.theme}`]
          : approvedCanvasDigest
      const approvedDigests = typeof approved === 'string' ? [approved] : approved
      expect(approvedDigests).toContain(digest)
      return
    }

    await expect(page).toHaveScreenshot(`${visualCase.state}-${visualCase.theme}.png`, {
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    })
  })
}

/**
 * C4's additive visual checks are separate from the 18 B7 acceptance slots.
 * Screenshot mismatch is an intentional visual-approval hold, not permission
 * to silently pin a new rendering or expand B7's baseline matrix.
 */
for (const [project, theme] of courseOverviewVisualReview) {
  test(`${project} course overview ${theme} C4 visual review`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== project, `Captured only in the ${project} canonical viewport.`)
    await seedSession(page, theme, false)
    await openState(page, 'course-overview')
    const screenshot = await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      fullPage: false,
    })
    await testInfo.attach(`course-overview-${theme}-${project}.png`, { body: screenshot, contentType: 'image/png' })
    const digest = createHash('sha256').update(screenshot).digest('hex')
    const approved = approvedCourseOverviewDigests[`${project}:${theme}`]
    const approvedDigests = typeof approved === 'string' ? [approved] : approved
    expect(approvedDigests).toContain(digest)
  })
}


// FI-023 Founder review evidence, NOT an approved screenshot baseline.
// The normal four Home digest checks above remain fail-closed. This fixture
// gives the review a real Plan/Exams composition without inserting sample
// records or measurements into production.
async function seedConfiguredHomeVisual(page: Page) {
  const today = '2026-08-23' // pinned by seedSession's fixed-time clock
  const base = {
    user_id: userId, course_id: asCourseId,
    created_at: '2026-08-23T09:00:00.000Z', updated_at: '2026-08-23T09:00:00.000Z',
  }
  await page.route('**/rest/v1/learner_planned_sessions**', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([
        { ...base, session_id: 'home-review-done', planned_date: today, topic_id: 'finance', activity_type: 'learn', minutes: 15,
          added_by: 'student', recommendation_id: null, status: 'done' },
        { ...base, session_id: 'home-review-next', planned_date: today, topic_id: 'marketing', activity_type: 'practice', minutes: 20,
          added_by: 'student', recommendation_id: null, status: 'planned' },
      ]),
    })
  })
  await page.route('**/rest/v1/revision_assessments**', async (route) => {
    await route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([
        { assessment_id: 'home-review-mock', user_id: userId, course_id: asCourseId, subject_id: 'business',
          module_id: null, assessment_type: 'mock', title: 'Business Paper 1 mock', assessment_date: '2026-09-12',
          relative_importance: 'high', scope: {}, is_active: true },
        { assessment_id: 'home-review-exam', user_id: userId, course_id: asCourseId, subject_id: 'business',
          module_id: null, assessment_type: 'public_exam', title: 'Business Paper 1', assessment_date: '2027-05-10',
          relative_importance: 'high', scope: {}, is_active: true },
      ]),
    })
  })
}

for (const device of ['phone', 'desktop'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`FI-023 configured Home ${device} ${theme} full-page Founder review evidence`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== device, `Only ${device} configured review capture.`)
      await seedSession(page, theme, false)
      await seedConfiguredHomeVisual(page)
      await openState(page, 'home')

      const day = page.locator('.home-v3-plan')
      await expect(day).toContainText('35 min planned')
      await expect(day).toContainText('1 of 2 done')
      // Completed work remains in the full-day summary, not among outstanding Start rows.
      await expect(day.locator('.home-v3-done')).toHaveCount(0)
      await expect(day.locator('.home-v3-plan-row')).toHaveCount(1)
      await expect(day.locator('.home-v3-plan-row')).toContainText('Marketing')
      await expect(day.locator('.home-v3-plan-row').getByRole('button', { name: /^Start/ })).toHaveCount(1)
      await expect(day.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '15 of 35 minutes done')
      const exams = page.locator('.home-v3-exams')
      await expect(exams).toContainText('Business Paper 1 mock')
      await expect(exams.locator('.home-v3-next-exam')).toContainText('Mock exam')
      await expect(exams.locator('.home-v3-exam-group li')).toHaveCount(1)
      await expect(exams.locator('.home-v3-exam-group li')).toContainText('Official exam')
      await expect(exams.locator('.home-v3-exam-group li')).toContainText('10 May')
      await expect(exams).toContainText('Business Paper 1')

      const full = await page.screenshot({ animations: 'disabled', caret: 'hide', fullPage: true })
      await testInfo.attach(`home-v3-configured-${device}-${theme}.png`, { body: full, contentType: 'image/png' })
    })
  }
}
