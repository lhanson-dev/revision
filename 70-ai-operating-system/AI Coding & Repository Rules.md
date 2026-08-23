# AI Coding & Repository Rules

## Workflow
For material product features:

Read authority → confirm governed feature state → complete analysis/Definition of Ready → explicit human `Ready` approval → resolve canonical route/runtime → short-lived branch from current `main` → implement → test/assure → document → PR → validate/integrate against current `main` → final assurance → Founder merge approval → persist and verify required GitHub approval evidence → verify Founder approval status → verify required repository merge enforcement → merge → verify production → mark `Live` only from production evidence.

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

## Operating principle — enterprise-standard startup

Revision should operate with startup speed and enterprise-grade production discipline.

- **Work fast, but do not buy speed by weakening production controls.** Required authority checks, assurance, security, data protection, release gates, Founder approval and production verification must not be skipped merely to move faster.
- **Use proportionate assurance rather than maximum ceremony.** Low-risk work should move quickly; higher-risk work should receive deeper assurance according to blast radius and coupling.
- **Fail closed when production safety is uncertain.** If a required production condition, approval, integration state or assurance result is unknown, do not infer success in order to release.
- **Keep the Founder focused on decisions, not mechanics.** Branch management, integration, CI sequencing, conflict handling and evidence bookkeeping are engineering responsibilities unless they expose a substantive product/governance decision.
- **Continuously improve the delivery system.** Repeated friction, near misses, defects, avoidable manual work, stale-state problems or assurance gaps should trigger a proportionate process/tooling improvement proposal. Improvements may reduce unnecessary ceremony, but must preserve or strengthen production safety.
- **Govern material process changes.** An agent may identify and propose improvements autonomously, but material changes to the operating model, approval boundaries or production controls must be documented and approved through the governed repository workflow.

The objective is not zero change risk; it is rapid delivery with explicit, evidence-backed control of production risk.

## Canonical `main` and parallel delivery

Revision uses a trunk-based development model:

- `main` is the only canonical integrated product state;
- governed work uses short-lived branches created from the then-current `main`;
- multiple feature, defect, governance and maintenance branches/PRs may be active and ready concurrently;
- branches are working copies, never alternative canonical versions of Revision; and
- direct production changes must flow through governed PRs rather than bypassing `main` controls.

Branches do not need to be continuously refreshed during ordinary work. Instead, integration freshness is an engineering responsibility applied before merge.

## Final integration rule

Before a PR may merge to `main`:

1. **Re-read current `main`.** Establish the current canonical target branch state.
2. **Validate the PR with current `main`.** Use the strongest repository-supported mechanism available. A native merge queue is preferred where supported; otherwise update/rebase/merge current `main` into the PR branch before final merge assurance.
3. **Resolve overlaps deliberately.** A clean mechanical integration is acceptable. Any code, schema, product, authority, route, lifecycle or shared-file conflict must be reviewed rather than mechanically choosing a side.
4. **Preserve cumulative files.** `INDEX.md`, registers, manifests, routes, configuration, migrations and similar shared files must preserve all relevant newer `main` state plus the PR's intended delta.
5. **Run required assurance on the integration candidate.** Required checks must prove the proposed change still works with current `main`.
6. **Present the Founder with the actual proposed production change.** The merge-readiness summary must explain what changed, impact, assurance, documentation impact, material risks and any conflict resolution.
7. **Obtain explicit Founder approval for the specific PR merge.** The Founder is approving the proposed product/company/technical change, not Git mechanics.
8. **Verify the hard merge barrier where required.** After Recovery 4, an ordinary release-governed PR must not merge until actual repository state proves that Revision CI and `revision/founder-approval` are enforced as required checks, or an explicitly governed alternative hard enforcement mechanism is active.

Multiple PRs may be simultaneously ready for review/approval. Git integration is necessarily ordered because `main` changes one merge at a time, but governance must not create an artificial rule that only one PR may be review-ready.

### Mechanical baseline refresh after Founder approval

If `main` advances after Founder approval but before merge, the executing agent must revalidate the PR against the new `main`.

A refresh may retain the existing Founder approval only when all of the following are proven:

- the refresh consists solely of integrating newer `main`;
- no conflict required a substantive resolution choice;
- the PR's intended changed files/content/behaviour remain materially unchanged relative to the new base; and
- fresh required assurance passes for the refreshed integration candidate.

In that case the agent may regenerate the exact-head approval evidence for the refreshed head without asking the Founder to repeat the same approval. This is bookkeeping for the already-approved change.

Renewed explicit Founder approval is mandatory if the refresh changes the proposed PR delta materially, including conflict resolution that alters code/content, scope, product behaviour, authority, schema, routes, security, release behaviour or other material effects.

## Repository enforcement target

After Recovery 4, `main` must enforce through verified GitHub repository settings or a separately Founder-approved hard technical equivalent:

- pull-request-based changes;
- required Revision CI/status checks before merge;
- the trusted `revision/founder-approval` status as a required check;
- no force-push/delete of `main`;
- protection against bypassing the governed merge path; and
- integration with current `main` before merge, preferably through a native merge queue when the repository ownership/plan supports it.

At the time this rule was first adopted, Revision was hosted in an individual-owned GitHub repository, for which GitHub's native merge queue was not available. The current operating fallback therefore continues to use explicit current-`main` integration and final assurance, but **advisory-only approval status is no longer an acceptable merge barrier after Recovery 4**.

The Recovery 4 investigation verified that PR #139 merged while `revision/founder-approval` was `pending`, and current branch metadata reported required-status enforcement as `off`. That state must be treated as a blocking control gap for ordinary merges after Recovery 4.

Repository settings must not be represented as enforcing a check unless the setting has been independently verified from actual GitHub state. If the platform cannot provide the required hard barrier, stop ordinary merges and surface the need for an explicitly governed alternative rather than silently weakening the control.

## Founder approval status rule

Once `.github/workflows/founder-approval-status.yml` is live on the default branch, the current PR head must have:

`revision/founder-approval = success`

before an executing agent calls merge for a release-governed PR.

The status is a machine-readable verification of evidence already required by governance. It is **not** Founder approval itself and must never be used to infer or manufacture approval.

For the current exact PR head, success means the trusted gate has verified:

- the latest exact-head Revision CI completed successfully;
- the exact two-line Founder approval marker exists for that head;
- the marker was authored by the configured Founder GitHub login; and
- the marker was created at or after completion of the latest exact-head CI.

The executing agent must re-read the current head and current `revision/founder-approval` status immediately before merge. A status attached to an older head is irrelevant. If a head change occurs, the gate must be re-established for the new head.

Recovery 3 introduced this status. PR #139 later proved that the evaluator could correctly remain `pending` and still be bypassed when GitHub did not enforce that status as a required merge check. Recovery 4 therefore adds a separate hard-enforcement requirement: for ordinary PRs after Recovery 4, a green status is necessary but merge is still prohibited until repository-level enforcement is verified active.

The Recovery 4 PR is a narrow recovery exception to the new repository-enforcement hold because it is the PR that restores the broken prospective lineage and records the hold. It is not exempt from exact-head CI, exact Founder marker, `revision/founder-approval = success`, exact-head merge or post-merge Production verification.

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
2. verify the required Revision assurance for the current integration candidate is successful;
3. confirm the Founder's approval still applies to the PR change set under the final integration rule above;
4. persist the machine-readable approval evidence required by the current release verifier to the GitHub PR conversation;
5. re-read the PR conversation and verify that exact-head approval evidence is present and readable;
6. verify `revision/founder-approval = success` on the same exact head;
7. for ordinary PRs after Recovery 4, verify actual repository state enforces the required Revision CI and `revision/founder-approval` checks before merge; and
8. merge only if the PR head still equals the evidenced SHA and the canonical-main integration check still passes.

The current release-verifier marker is exactly:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

For this release gate, **equivalent prose is not equivalent evidence**. A comment such as `Founder approval recorded for PR #X at head ...`, a quoted chat instruction, a summary of the approval, or any other alternative wording does not satisfy the machine-readable marker contract. The executing agent must write the exact marker above as a top-level PR conversation comment and then re-read that exact comment before calling merge.

The marker is a durable record of an approval that has already been explicitly given; it is not permission for an AI agent to invent, infer, broaden or self-grant approval. A merged PR, passing CI, prior approval of a different substantive change, approval of a related PR, or a malformed/prose approval-record comment must never be converted into a compliant marker retrospectively.

If the PR head changes because of new PR-authored work or substantive conflict resolution after Founder approval, stop and obtain renewed explicit Founder approval. If the head changes only through a proven mechanical baseline refresh with unchanged PR delta, the existing approval may be carried forward as defined above and the marker regenerated for the refreshed head after fresh assurance. In either case, any head-specific `revision/founder-approval` status must be re-established for the final head before merge.

After merge, the agent must inspect the resulting production path-to-live evidence. A merge is not operationally complete until the required release stages have succeeded or a failure has been surfaced and tracked. `Live` remains a production-evidence state, never a synonym for merged.
