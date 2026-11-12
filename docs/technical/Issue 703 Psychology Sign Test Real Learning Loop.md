# WS4 / #703 — First AQA Psychology independently assessed skill repair and retest

**Governed status:** implementation + synthetic real-Auth acceptance **candidate only**. No exact-head CI, independent educational A2 review, Founder merge approval, production release or firsthand learner observation is claimed by this document at creation.

## Requirement and provenance

- **Source:** Founder-supplied official AQA A-level Psychology **7182 v1.4, 1 September 2025**, §4.2.3.3 (printed page 21); mathematical annex §7.2. Upload SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. REFERENCE_ONLY; no protected AQA prose or past-paper question has been copied.
- **Chosen observed ability:** calculate the smaller number of non-tied directions **S** from related before/after scores. Provisional single-target source atom `PSY-SRC-4233-IT03`, mapped to existing Research Methods Foundation Learn page `research-methods-psy0732` (parent `PSY-07-32`). It does **not** assess when to choose the sign test, critical-value significance, the full statistical method, interpretation, other Psychology topics, or examination readiness.
- **Already published source-controlled assessments:** `rev7182-4.2.3-sign-test-01` and `rev7182-4.2.3-sign-test-02`, with distinct original tables, expected discrete S values 2/1, one marked final number each, exact-integer scoring and single source item. Published through all three existing AQA 7182 paper packs and standard content adapter. The original #746 educational A3 receipts include first PASS, subsequent material FAIL/HOLD for partial parsing, and subsequent remediation; those historic findings stay immutable.

## Canonical integrated route

`/revision/app/` → enrolled AQA Psychology → **Practice** → Research Methods → **Calculations** → actual incorrect one-number S → saved owner-scoped response and single-target objective mapping → inline **unscored** guided repair → existing FI-001 Day/Week Plan recommends exact source-linked Learn page and a different original scored calculation → student starts the real Plan item and sees the unscored worked method → new independent Plan calculation (different original table/context) → saved owner-scoped correct final-number outcome → reload Home, Ask REV, Plan and both course/global Progress.

The selected repair is activated only by a validated authenticated FI-001 `HomeTask` Start with matching source item/page; a forged direct URL or reload cannot select the method. Exposure/reading never awards marks. No second recommendation engine, no new database table or marking provider.

## New authored unscored treatment

Original paired observations: 3→5, 7→8, 4→4, 9→6, 2→5, 6→4, 8→9, 10→7. Four positive signs, three negative, one tie. Exclude tie, effective n=7, **S=3**. The example is deliberately different from **both** scored published items (S=2/S=1). This is a worked refresher, not a measured step-specific diagnosis. It may be shown after the wrong answer but does not assert that the learner misunderstood ties specifically. Significance cannot be deduced from S alone without the relevant critical-value convention.

## Data integrity issue corrected

The already published sign-test calculator uses `exactInteger=true`, rejecting partial/malformed numeric expressions. `src/app/skill-recheck.ts` previously revalidated persisted calculation facts without the published `exactInteger` flag. The candidate now reuses that exact published rule so a tampered saved expression such as `2+1` cannot be treated as verified correct S evidence or alter skill-retest decisions. Other numerical content retains existing rounding rules and all prior evidence IDs remain.

## Acceptance contracts / evidence gates

1. **Deterministic:** actual three published Psychology packs contain both original final-number questions, distinct contexts/tables, one mapped source atom, exact integer scoring; check wrong/foreign/tampered source, no fabricated retest. New source-specific teaching is attached only to the matching official Learn page and active FI-001 action; after a different correct scored response the immediate retest candidate clears without claiming broader mastery. Check 14-day repair precedes retest for a feasible Research Methods exam with real capacity.
2. **Auth + browser (required, not yet claimed):** `tests/e2e/learner-value-journey.spec.ts` signs into disposable local GoTrue/PostgREST and enters an **actual wrong S through the Practice UI**. It must save a single-target software-scored final-number error; find exact FI-001 Plan method, reveal example, reload and lose transient method, record page reading unscored, discard only an unfinished checkpoint, then start and answer the **different** published original via Plan. Check old error and new correct response coexist after reload, no same question reuse, and consistent Home/REV/course/global Progress. No production accounts or child data.
3. **Educational:** fresh independent A2 check of this newly authored Psychology worked treatment against the exact supplied source, including arithmetic, tie convention, source identity, exercise non-reuse and no significance/skill overclaim. Existing independent #746 A3 covers **published question versions**, not this new instructional text. Do not claim a new independent educational PASS merely because unit/CI passes.
4. **Release/observed:** current-main exact-head nine-job CI, RLS/signup/responsive and actual Auth browser, specific Founder merge permission, governed production build/Pages/smoke/path-to-live; WS5 separately observes hosted and firsthand learner behaviour. These gates must be logged independently.

## Deliberate limits / follow-up

This is **one precise, bounded Psychology calculation atom**, not complete Psychology parity, inferential test choice, question/discursive validity across AQA, full-method scoring, educator sign-off or multiweek planner acceptance. Retesting a final number once removes the immediate retest need; it does **not** prove durable mastery. Keep source content audit #698/#787, wider IA-03/#704, #705 treatment breadth, #694 sustained 14-day feasibility, LF-05/#706 written confidence and WS5 hosted O observations open. Preserve all original paper-pack questions and historic learner evidence.

**Governance/documentation impact:** Existing approved Course Learning Blueprint, Adaptive Revision Planning and Claims and Progress Governance already authorise this bounded evidence-led route (FI-001 Gate B Ready previously approved); no new normative behaviour, policy, ADR or migration. Implementation, tests, technical note and INDEX pointer must remain in the same governed PR. No PR merge without explicit approval for that specific PR.