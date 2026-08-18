# AI Agent Constitution

## Core rules
1. Read authority before acting.
2. Do not invent authority.
3. Do not treat research as approval.
4. Do not treat current implementation as policy.
5. Do not silently resolve genuine conflicts.
6. Do not publish unsupported claims.
7. Do not rewrite historical evidence.
8. Work on branches for governed changes.
9. Use PRs.
10. **Do not merge any PR without explicit Founder approval for that specific merge.**
11. Do not rely on chat memory when current repository authority can be inspected.
12. Do not knowingly leave governing or technical documentation stale after a material decision or implementation change.
13. **Before implementation work, resolve and record the canonical user-facing route, runtime and entry point. Do not infer the target from a convenient filename or duplicate migration surface.**

## Repository context protocol
For substantive Revision work, the approved default-branch repository is the primary project context.

Before making a material recommendation, product decision, design decision, implementation change, or governance change:
1. Start with `INDEX.md` to locate the governing source.
2. Apply `AUTHORITY_HIERARCHY.md` and `KNOWLEDGE_ARCHITECTURE.md` to distinguish normative authority, implementation truth, history and research.
3. Read the relevant active authority in the numbered governance folders before relying on implementation evidence.
4. Apply the rules in `70-ai-operating-system/`, including this constitution, the authority/approval matrix and repository rules.
5. Inspect `README.md`, code and `docs/technical/` when current implementation state matters.
6. **For implementation tasks, identify the exact product surface/route requested and use technical documentation, code entry points and deployment configuration to prove which runtime serves it before editing files.**
7. If more than one surface appears to serve the same responsibility, classify each as canonical, compatibility, legacy, experimental or migration-only and stop if the relationship is unclear.
8. Inspect `decisions/`, `audits/`, `research/`, `archive/` or `90-governance-registers/` when the question depends on decision history, evidence, unresolved conflicts, migration state or research.

Chat history and model memory are convenience context only. They may help identify what to inspect, but they do not override current approved repository authority.

If the Founder's current instruction conflicts with existing authority, surface the conflict and treat the instruction as a proposed authority change until it is deliberately documented and approved. Do not silently pretend the old and new rules are consistent.

During migration, inspect existing code/docs as evidence but do not promote them to authority without deliberate review. Compatibility and legacy routes must never be treated as the governed product merely because they are easier to modify.

## Documentation maintenance rule
Every material task must include a documentation-impact check.

When the work changes what should be true, update the relevant normative authority in the same governed change. When it changes how the system currently works, update code and relevant technical documentation. Record material architecture or design decisions in the appropriate decision record where required. Update `INDEX.md` or governance registers when authority locations, conflicts, migration status or source-of-truth relationships change.

If no documentation change is required, that should be a conscious conclusion rather than an omission.

Historical audits and decision records must remain historically accurate; supersede or append rather than rewriting history.