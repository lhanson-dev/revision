# AI Coding & Repository Rules

## Workflow
For material product features:

Read authority → confirm governed feature state → complete analysis/Definition of Ready → explicit human `Ready` approval → resolve canonical route/runtime → branch from current `main` → implement → test/assure → document → PR → refresh onto latest `main` at final integration gate → exact-head assurance → explicit Founder merge approval → persist and verify the required GitHub approval evidence → confirm `main` has not advanced → merge the same exact head → verify production → mark `Live` only from production evidence.

For defects, maintenance and other non-feature implementation, apply the relevant authority and Governed Implementation Workflow without inventing a feature lifecycle record unnecessarily.

## Autonomous execution and status rule

Once the Founder has authorised a piece of work, the executing AI agent should continue autonomously through the routine investigation, remediation, validation, documentation and PR-assurance steps that are within the approved scope. It should not return control merely because an intermediate test, CI check or implementation attempt failed when it can safely investigate and remediate that failure itself.

The agent should return control only when one of the following is true:

1. **Founder action required** — a specific approval, governance decision, scope decision or other Founder-only action is genuinely required;
2. **Waiting on an external system** — an external process such as GitHub Actions is the only remaining blocker and no useful authorised work can continue until it finishes; or
3. **Complete** — the authorised work is complete and no further action is required.

An AI response must never state or imply that the agent itself will continue working after that response has ended unless an actual automation or supported external trigger has been created to do so.

Every final work update must end with an explicit status statement so the Founder does not have to infer whether work is still happening. Use one of these forms, adapted with the specific next action where useful:

- **STATUS: FOUNDER ACTION REQUIRED — <exact action required>.**
- **STATUS: WAITING ON EXTERNAL SYSTEM — <what is running>. Estimated check-back: <evidence-based time window>. Check back after that and I will immediately continue from the result.**
- **STATUS: COMPLETE — no further action required.**

When the status is `WAITING ON EXTERNAL SYSTEM`, include a practical **estimated check-back** window whenever the available evidence supports one. Base the estimate on observable information such as the current external stage, remaining jobs and recent comparable run durations. Use a range rather than false precision, make clear that it is an estimate rather than a guarantee, and do not invent a duration when there is insufficient evidence. If no defensible estimate is available, say that the check-back time is unknown and explain what completion signal is being awaited.

Do not use a final status such as `working`, `continuing`, `in progress` or equivalent after returning control unless a real asynchronous mechanism exists and has been explicitly disclosed. Intermediate progress updates within an active turn may state that work is continuing because the agent has not yet returned control.

For efficiency, a short Founder follow-up such as `continue`, `status`, `done?` or equivalent after a `WAITING ON EXTERNAL SYSTEM` state is sufficient instruction to resume. The agent must re-read the current external evidence and continue the authorised workflow without asking the Founder to restate the task.

## Canonical `main` integration baseline

`main` is Revision's single canonical integration baseline. Parallel feature, defect, governance and maintenance branches are permitted, but no PR may enter the Founder merge-approval gate from a stale integration baseline.

Apply the following operating model:

1. **Branch from current `main`.** Create governed branches from the latest approved `main` known at branch creation.
2. **Allow parallel work without continuous rebasing.** Ordinary development, analysis documentation and review may continue while other branches merge. Do not repeatedly refresh every active branch merely because `main` advances; that creates unnecessary churn and invalidates assurance evidence without increasing useful confidence.
3. **Use a final integration gate.** When a PR is otherwise complete and ready for merge-readiness assurance, re-read current `main`. If the PR head does not contain that current `main` as an ancestor, integrate the latest `main` into the PR branch before exact-head assurance or Founder merge approval.
4. **Resolve conflicts deliberately.** A clean automatic integration is acceptable where it preserves both current `main` and the approved PR change. Any content, code, schema, route, authority or lifecycle conflict must be reviewed and resolved deliberately; do not choose one side mechanically merely to obtain a green merge.
5. **Preserve current-main knowledge.** For shared files such as `INDEX.md`, registers, package manifests, routes or common configuration, the refreshed branch must retain all relevant current-`main` changes plus the PR's intended delta. A branch copy must never overwrite newer canonical content with an older version.
6. **Rerun assurance after refresh.** Any refresh that changes the PR head invalidates previous exact-head assurance. Run the required Revision CI and other applicable checks against the new exact head.
7. **Serialize the final merge gate.** Multiple PRs may be developed and reviewed concurrently, but only one PR should be treated as occupying the final integration/merge gate at a time. Other ready PRs wait outside the gate until the preceding merge updates `main`, then refresh once onto that new baseline. This is the default manual merge-queue behaviour until a governed automated merge queue is adopted.
8. **Recheck immediately before merge.** After Founder approval and approval-marker persistence, re-read current `main`. If `main` advanced after the approved head was refreshed, do not merge the stale head. Refresh again, rerun exact-head assurance and obtain renewed explicit Founder approval for the new head.

A PR being technically mergeable is not sufficient evidence that it is based on the canonical integration baseline. Conversely, branches outside the final merge gate do not need to be continuously zero-behind `main`.

## Feature-readiness rule

- Do not begin material production feature implementation while a feature is `New`, `To Do` or `Analyse`.
- AI may recommend `Ready`; it may not self-approve `Ready`.
- A technical spike during `Analyse` must be explicitly bounded to feasibility/evidence gathering and must not silently become production implementation.
- If implementation reveals a material change to the approved MVP, Free/Paid/Premium behaviour, evidence semantics, critical UX or trust/safety position, return to proportionate analysis and renew readiness approval where the prior Definition of Ready is no longer valid.

## Migration safety
- Do not restructure working implementation solely to match governance folders.
- Do not delete or overwrite legacy material until its migration disposition is known.
- Do not convert current code behaviour into normative authority without review.
- Keep product authority and technical implementation documentation separate.

## Merge rule
Every merge requires explicit Founder approval unless active Founder-approved governance explicitly delegates otherwise.

For any PR whose production path is enforced by the Revision release-lineage verifier, explicit Founder approval in the operating conversation is necessary but not by itself sufficient release evidence. After the Founder explicitly approves the **specific PR merge**, the agent responsible for carrying out that approved merge must complete the following sequence before merging:

1. re-read the PR and capture its exact current head SHA;
2. verify the latest required Revision CI for that exact head is completed successfully;
3. confirm the Founder's approval applies to that same PR and has not been invalidated by a later head change;
4. persist the machine-readable approval evidence required by the current release verifier to the GitHub PR conversation;
5. re-read the PR conversation and verify that exact-head approval evidence is present and readable;
6. re-read current `main` and confirm the approved PR head still contains that current `main` as an ancestor; and
7. merge only if the PR head still equals the approved/evidenced SHA and the canonical-main check still passes.

The current release-verifier marker is exactly:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

For this release gate, **equivalent prose is not equivalent evidence**. A comment such as `Founder approval recorded for PR #X at head ...`, a quoted chat instruction, a summary of the approval, or any other alternative wording does not satisfy the machine-readable marker contract. The executing agent must write the exact marker above as a top-level PR conversation comment and then re-read that exact comment before calling merge.

The marker is a durable record of an approval that has already been explicitly given; it is not permission for an AI agent to invent, infer, broaden or self-grant approval. A merged PR, passing CI, prior approval of a different head, approval of a related PR, or a malformed/prose approval-record comment must never be converted into a compliant marker retrospectively.

If the PR head changes after Founder approval or after the marker is written, stop and obtain renewed explicit Founder approval for the new exact head before merge.

If `main` advances after Founder approval, the approved head is no longer on the required canonical integration baseline. Refresh from the new `main`; because that refresh changes the PR head, rerun the required exact-head assurance and obtain renewed Founder approval before merge.

After merge, the agent must inspect the resulting production path-to-live evidence. A merge is not operationally complete until the required release stages have succeeded or a failure has been surfaced and tracked. `Live` remains a production-evidence state, never a synonym for merged.
