# LF-03 / #787 — trusted Forensic Psychology blind A3 reviewer (candidate PR #840)

**Status (8 November 2026): DRAFT reviewer infrastructure; not installed in main, no Forensic Psychology educational A3 review has yet run.** Separate Founder approval is required for this trusted workflow before it can assess content PR #840.

## Purpose, exact source and learner boundary

- Founder-provided official AQA Psychology 7182 v1.4 (1 September 2025), printed pp23–24, §4.3.9, PDF SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`, rights **REFERENCE_ONLY**. Only high-level approved structured source facts are supplied to independent model, never protected AQA source paragraphs, sample questions or marks.
- Target **distinct learner-content draft PR #840**, exactly four immutable original one-mark Forensic Psychology V2 questions (`PSY-16-01`–`04`) in `content/psychology/aqa-a-level/shared/forensic-psychology-mcq-v2.ts`. They are Paper 3 **Option 3**, not compulsory for every Psychology learner. Content PR remains unmerged while independent educational assurance is pending.
- Canonical learner runtime when approved: `/revision/app/` → saved 7182 course → Practice → Forensic Psychology. This reviewer is **not** a new learner feature and changes no student scores, questions, exams, database, schema or security policy.

## Trusted exact-head scope and trigger

This is a narrow copy of the existing Founder-approved PR #825 trusted A3 pattern, with only the targeted Forensic source, qualification facts, PR identity and file paths changed. The workflow runs from **approved main** with separate read-only GitHub and isolated provider credentials. It never executes candidate PR code, writes results to the repo or reads learner data. It parses exactly four literal TS question objects and fail-closes dynamic code, unknown IDs/topic, duplicate options, invalid keys, changed source blob or mismatched head/PR/owner.

After **separate Founder approval, merge and verified deployment of this reviewer infrastructure**, repository owner `lhanson-dev` can trigger one independent A3 review by writing the exact two-line comment to open PR #840:

```text
revision-run-lf03-pr840-forensic-independent-a3:v1
head_sha: <exact current 40-character content PR #840 SHA>
```

- First reviewer: blinded to authored answer keys and explanations. Must independently choose all four answers and challenge factual validity, alternative keys, distractor clues, source fit and causal overclaims. A matched key alone is not approval.
- Second review: **separate fresh provider context** checks the explanations after blind answers are locked; material incorrect feedback, invalid argument, omitted plausible alternative or answer-key mismatch fails the gate.
- The trusted contract runs without secrets before any provider call. Untrusted candidate code remains inert data.
- Provider pattern: `gpt-5.6-terra`, `store:false`, high reasoning, a **US$0.95 conservative reserve cap** per owner-triggered run. No automatic repeated review or spending. Preserve raw provider outputs, exact head, blob SHA, reviewed source, failed and successful severity dispositions in a 30-day GitHub Actions artifact.
- An independent AI pass is **not** qualified examiner approval, empirical response discrimination, complete source bullet coverage, validated 16-mark Psychology essays, original learner acceptance or production release.

## Separate gates

The workflow PR must pass its own no-secret exact-head reviewer contract and risk-selected CI, be integrated with current approved main, receive its own **specific Founder merge approval** and production path-to-live verification.

Only then may the owner trigger independent A3 for #840, inspect the *actual complete receipt*, resolve material findings and rerun changed content review. Content PR #840 then requires its **separate** current-head software/browser CI, Founder merge approval and production verification. Existing #698/#787/#765 and extended-writing #706 remain open.

## Documentation impact

Scoped review infrastructure only: new trusted workflow, reviewed script, node contract tests, this technical note and INDEX pointer on a separate governed branch/PR. No learner-facing change, normative feature promotion, historical audit rewrite or database migration. Retain all previous educational uncertainty as explicitly unresolved.
