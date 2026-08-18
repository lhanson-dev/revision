# AQA A-level Business 7132 — Publication Assurance Closure

**Closure date:** 2026-08-18  
**PR:** #44  
**Branch:** `content/aqa-a-level-business-7132`  
**Independent educational review target:** `bc757ccaf41477645d86d2f68cb99fcd84282eb2`  
**Independent revalidation record:** `ASSURANCE_REVALIDATION_2026-08-18.md`  
**Publication-status code head validated before this closure record:** `1271416d8934f4ec6581ff670553a9ac2c5b599f`  
**Governing control:** `80-company-workflows/Content Accuracy Assurance Gate.md`

## Decision

**PASS — restricted-pilot publication gate.**

The independent A1/A2/A3 review and deterministic recomputation found no unresolved blocking or material educational-content finding. All three AQA 7132 paper manifests are now `available`.

The remaining recorded limitations are non-blocking for the restricted pilot:

- exact AQA terminology prefers `physical environment` rather than the two learner records that say `Physical environment/evidence`;
- Paper 2's current single-stimulus schema represents the three compulsory data-response contexts as clearly separated blocks rather than an exact physical-paper layout replica;
- qualified human Business subject-specialist review remains a later maturity/commercial-benchmark gate and is not represented as complete.

This PASS does not authorise merge. Founder approval for PR #44 remains required.

## CI closure and dependency-install diagnosis

### AIR-014 — npm dependency-install crash: CLOSED

Runs #124 and #125 failed before any project quality check at:

`npm install --ignore-scripts --no-audit --no-fund`

with npm 10.9.2 / Node 22.14.0 reporting:

`Cannot read properties of null (reading 'edgesOut')`

The failure was independently diagnosed as an npm/Arborist peer-set resolver crash, with a near-exact upstream reproduction involving the repository's pinned `vitest@4.1.10` after the Vitest peer family moved to 4.1.11. The branch was corrected narrowly by aligning Vitest to 4.1.11 in commit `eed61fed57dcc8b17f696b7adbcdbefb04bd878e`; peer-dependency validation was not disabled.

Run #127 then passed dependency installation, typecheck, lint, unit tests, production build, Chromium installation and responsive browser assurance.

### AIR-015 — catalogue integration assertion: CLOSED

After the three manifests were promoted to `available`, run #128 exposed a pre-existing unit-test assumption that the catalogue contained only the AQA AS pack. Catalogue discovery correctly returned the three new A-level packs as well.

The test was updated in commit `4ae4df2eaddf7cdc4cff99874ffad5f10819ac9b` to assert the four available catalogue entries and the A-level adapter statuses. This was a structural integration correction; no learner content changed.

### AIR-016 — responsive E2E Paper 2 ambiguity: CLOSED

Run #129 passed install, typecheck, lint, all 59 unit tests and production build, but browser assurance exposed another pre-existing assumption: the AS learner-journey test selected the first generic `Open Paper 2` control. Once A-level Paper 2 was legitimately available, that selector was ambiguous and could enter the A-level pack before asserting AS-only content.

Commit `1271416d8934f4ec6581ff670553a9ac2c5b599f` scopes that journey explicitly to the `AQA AS Business` course card. No learner content changed.

### Current publication-head CI

GitHub Actions run **#130** (`32177542096`) on `1271416d8934f4ec6581ff670553a9ac2c5b599f` completed successfully:

- dependency installation — PASS;
- TypeScript typecheck — PASS;
- lint — PASS;
- unit tests — PASS;
- production build — PASS;
- Chromium installation — PASS;
- responsive Playwright/browser assurance — PASS.

There is therefore no unresolved CI publication blocker at the validated publication head.

## Final issue-register status

| ID | Severity | Type | Finding | Required correction | Final status |
|---|---|---|---|---|---|
| AIR-001 | no issue | A1 curriculum coverage | All ten 7132 areas represented and current AQA scope matched. | None. | Closed — pass. |
| AIR-002 | minor | A1 terminology precision | Two records use `Physical environment/evidence` rather than AQA's exact `physical environment`. | Prefer exact AQA wording in routine tidy-up. | Open — accepted non-blocking limitation. |
| AIR-003 | no issue | A1/A2 specification fidelity | PED/YED correctly taught as interpretation rather than coefficient calculation. | None. | Closed — pass. |
| AIR-004 | no issue | A1/A2 formula and interpretation | Required strategic ratios are present, coherent and contextually interpreted. | None. | Closed — pass. |
| AIR-005 | no issue | A1/A2 quantitative reasoning | Payback, ARR and NPV examples and treatment recompute correctly. | None. | Closed — pass. |
| AIR-006 | no issue | A1/A2 curriculum coverage | Network amendment practice covers AQA's explicit amendment requirement. | None. | Closed — prior omission verified resolved. |
| AIR-007 | no issue | A2/A3 educational reasoning | Six guided cases contain no material factual contradiction or deterministic misuse of models. | None. | Closed — pass. |
| AIR-008 | no issue | A3 assessment authenticity | Paper 1 structure, marks, choice and AO profile are plausible and internally correct. | None. | Closed — pass. |
| AIR-009 | minor | A3 implementation limitation | Paper 2 uses one schema stimulus field containing three separated data-response contexts. | Retain explicit non-replica disclosure until schema evolution. | Open — accepted non-blocking limitation. |
| AIR-010 | no issue | A3 assessment integrity | Paper 2 mark groups, AO totals and numerical content recompute correctly. | None. | Closed — pass. |
| AIR-011 | no issue | A3 assessment integrity | Paper 3 marks, AO profile and numerical content recompute correctly. | None. | Closed — pass. |
| AIR-012 | no issue | deterministic assurance | All reviewed stored learner-facing numerical results independently recompute. | None. | Closed — pass. |
| AIR-013 | minor | assurance maturity | Qualified human subject-specialist review remains pending. | Complete before mature commercial benchmark claims. | Open — later-stage gate. |
| AIR-014 | blocking | CI / publication control | npm 10.9.2 `edgesOut` crash prevented dependency installation. | Align Vitest peer family and rerun full CI. | Closed — fixed by `eed61fed...`; run #127 green. |
| AIR-015 | blocking | structural integration | Catalogue unit test assumed one available pack and failed after correct A-level publication. | Assert expanded four-pack catalogue. | Closed — fixed by `4ae4df2e...`; run #130 unit suite green. |
| AIR-016 | blocking | browser assurance | AS E2E journey used an ambiguous generic Paper 2 selector after A-level publication. | Scope journey to AQA AS course card. | Closed — fixed by `1271416d...`; run #130 browser suite green. |

## Documentation-impact check

No normative governance, product or curriculum policy changed. This closure record applies the existing Content Accuracy Assurance Gate and preserves both the original HOLD record and the independent revalidation record as historical evidence.

Implementation/status documentation now reflects the actual state:

- all three AQA 7132 manifests are `available`;
- the coordinated content test asserts `available`;
- catalogue integration tests cover all four available Business packs;
- the responsive AS learner-journey test is explicitly scoped;
- CI dependency resolution is corrected by the narrow Vitest version alignment.

## Merge control

PR #44 remains subject to the repository's Founder approval gate. This assurance closure neither merges the PR nor grants merge approval.
