# Recovery R2 — durable scored Practice checkpoint and safe answer replay

**Status:** Engineering candidate, production backend enabled ahead on 22 October 2026; frontend not merged or deployed and not approved for merge. Prepared against approved `main` `5bc0d03bbf10ef65c38c50f73c4417d2fba6deb6` (PR #656 verified production).  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `PlannerRuntime` → `CourseExperienceScreen` → `FocusedLearningWorkspace`. The legacy `src/app/App.tsx` is not edited.

## Learner problem

Before this package, an in-page Practice session survived closing its activity but not reloading the signed-in course page. Individual answers could be durably recorded, while the session question order, adaptive level and spaced retry queue lived only in React. A reload could therefore lose an unfinished session or invite another scored answer; no claim that a saved answer itself proves session completion is acceptable.

## Implemented candidate contract

- New `learner_practice_checkpoints` keyed by exact authenticated owner, course, module and topic; a versioned bounded JSON snapshot with stable question pool, adaptive state, due retry queue, confirmed answers, content fingerprint and 14-day expiry. This is an **unscored activity checkpoint**, not evidence, learning exposure, readiness, grade or planner completion. The active course is verified by the existing course runtime.
- Owner-only SELECT/INSERT/UPDATE/DELETE RLS; anonymous and standing service-role access removed; explicit grants and database tests. Neither another user nor a different course/module/topic may read the checkpoint through an authenticated client.
- The snapshot has optimistic `revision` compare-and-swap and stable `session_id`. Another tab changing the same session cannot silently overwrite a newer version. Only structurally identical, owner-readable post-commit acknowledgements may be accepted as a retry.
- The scored objective answer is first recorded in the checkpoint as one immutable pending fact with its *exact evidence ID*, before calling the existing learner evidence writer. On an interrupted/ambiguous save, Continue must replay the exact fact and verify duplicates through the existing owner-scoped full-payload equality guard. Only then is the session answer and retry queue checkpoint advanced. UI no longer progresses before persistence is confirmed.
- The current question position is checkpointed before Next. Finishing removes only the checkpoint, not scored evidence. Content fingerprint mismatch and expiry block replay; the student may deliberately discard the stale session.
- The browser keeps only a learner/course/module-scoped last-open Practice topic identifier (not scores or answers) to return to the correct existing checkpoint when REV's recommendation changes after an answer. The server-side row and content fingerprint remain authoritative. The hint is removed after confirmed completion or discard; a missing browser hint never grants access to another learner's checkpoint.
- Authored objective questions (multiple choice/calculation) are the safe recovery scope of this package; raw written responses, REV challenge drafts, freeform activity warm-ups and whole exam attempts are **not** stored. A changed answer key or available asset set fails closed. Selected but not yet submitted answers are not preserved; the latest safely confirmed session position is preserved.
- Corresponding unit, browser refresh/ambiguous-save and pgTAP owner boundary tests are included. The final supported learner journey must be validated in the isolated backend-backed browser harness before merge.

## Security and release dependencies

The migrations are `20261022131141_add_learner_practice_checkpoints.sql` and `20261022131156_add_r2_practice_checkpoint_readiness.sql`. The read-only `revision_release_readiness()` becomes `r2-practice-checkpoint-v1`, including the new table, RLS and grant checks while preserving existing capabilities. Both candidate CI and deployment expect the new version. **Both migrations were applied in the controlled production backend-ahead window on 22 October 2026. No frontend change is live.**

Both migrations were first validated in an isolated Supabase database and checked with pgTAP, authenticated owner-vs-other-learner tests, and the anonymous non-sensitive release-readiness RPC. On 22 October 2026, the controlled backend-ahead production migration was applied and read back independently on canonical Revision Supabase project `xwwhshpmeogswxfjtpvq`, with ledger IDs `20261022131141` and `20261022131156`. The resulting RPC reports `{ contract: 'r2-practice-checkpoint-v1', ready: true }` with `checks.practiceCheckpoints: true` and all prior checks true. Catalog verification shows table RLS enabled, four owner policies, authenticated SELECT/INSERT/UPDATE/DELETE granted, anonymous and service-role SELECT denied, and zero checkpoint rows immediately after application. Post-change Security Advisor reported only two pre-existing findings; Performance Advisor reported only prior warnings and an expected unused-index informational notice for the just-created table. Exact-head candidate CI must be repeated after ledger reconciliation and the application must still obtain specific Founder PR merge approval before frontend deployment.

Release validation must include refresh/re-entry, stable evidence IDs, retry after successful evidence but failed checkpoint update, multi-tab conflict, changed content, expired checkpoint, course ownership, failed backend reads, and current mobile/desktop UX. An unsubmitted checkpoint must never advance learner progress, exam readiness or a planned activity.

## Deliberately outstanding

- Durable written drafts and challenge workflows require a separately governed privacy decision.
- Flashcard deck, calculation partial text entry and warm-up progress are not in this saved session contract.
- Full timed mock answers and pauses remain in component memory; durable exam attempts and atomic finalisation are separate R2 follow-ups.
- Multi-tab conflict detection blocks stale writes rather than providing collaborative merging or real-time takeover UX.
- The intelligent planner still requires independent educational and student comprehension acceptance; passing technical persistence checks is not educational sign-off.

## Documentation-impact check

This implements the previously governed Recovery Control Plan and existing Claims/Evidence/Privacy obligations; no new product authority is claimed. Code, schema, tests, release contract, technical documentation and INDEX are updated together. Dated historical audits remain unchanged. No release claim or Founder approval is asserted.
