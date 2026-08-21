# AI Coding & Repository Rules

## Workflow
For material product features:

Read authority → confirm governed feature state → complete analysis/Definition of Ready → explicit human `Ready` approval → resolve canonical route/runtime → branch → implement → test/assure → document → PR → exact-head assurance → explicit Founder merge approval → persist and verify the required GitHub approval evidence → merge the same exact head → verify production → mark `Live` only from production evidence.

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
5. re-read the PR conversation and verify that exact-head approval evidence is present and readable; and
6. merge only if the PR head still equals the approved/evidenced SHA.

The current release-verifier marker is:

```text
revision-founder-approval:v1
head_sha: <40-character exact PR head SHA>
```

The marker is a durable record of an approval that has already been explicitly given; it is not permission for an AI agent to invent, infer, broaden or self-grant approval. A merged PR, passing CI, prior approval of a different head, or approval of a related PR must never be converted into a marker by inference.

If the PR head changes after Founder approval or after the marker is written, stop and obtain renewed explicit Founder approval for the new exact head before merge.

After merge, the agent must inspect the resulting production path-to-live evidence. A merge is not operationally complete until the required release stages have succeeded or a failure has been surfaced and tracked. `Live` remains a production-evidence state, never a synonym for merged.
