# Existing Repository Adoption Workflow

## Trigger
A product repository already exists but has not yet adopted the Product Operating System.

## Inputs
Existing repository; Product Setup Template; Founder instructions; current code/docs/config/history.

## Workflow
1. Protect current implementation.
2. Classify Light Adoption vs Controlled Migration.
3. Inventory the knowledge estate.
4. Establish constitutional kernel and merge governance.
5. Identify candidate authority, duplicates and conflicts.
6. Promote authority one responsibility at a time through governed PRs.
7. Separate current implementation documentation.
8. Reconcile implementation against approved authority.
9. Archive/redirect superseded sources after replacement authority is active.
10. Record migration completion.

## Required checks
- No working behaviour changed merely for structural tidiness.
- Existing material was not silently promoted to authority.
- Genuine conflicts remain visible until deliberately resolved.
- Historical evidence was preserved.
- Founder explicitly approved every merge.

## Stop conditions
Stop and surface to Founder if a proposed migration would change product behaviour, delete evidence, resolve a genuine authority conflict, or make an unsupported factual/legal/privacy assertion.