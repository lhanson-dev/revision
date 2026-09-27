# Content Factory Business Existing Artifact Inventory — 2026-09-27

**Status:** T1 working audit — point-in-time evidence, not normative authority  
**Course in scope:** AQA A-level Business 7132 / 2027 cohort evidence currently retained by Revision  
**Trial authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`  
**Trial contract:** `docs/technical/Content Factory Subject Foundation Trial.md`

## Purpose

Record and classify the existing Business educational estate before any material is promoted into the new reusable Subject Knowledge Foundation.

This inventory deliberately distinguishes:

1. exact-course Foundation evidence;
2. existing runtime/static learner content;
3. retained Content Factory learner-asset candidates;
4. exact AQA Exam Truth / assessment material;
5. assurance/remediation evidence; and
6. historical pipeline evidence.

An artifact being present, previously generated, previously reviewed or currently visible in the learner runtime does **not** automatically make it reusable Subject Knowledge Foundation truth.

## T1 classification statuses

- `PROVENANCE_EVIDENCE` — retained evidence about sources/rights/identity.
- `AQA_MAPPING_CANDIDATE` — useful for exact AQA specification mapping, not generic subject truth.
- `SUBJECT_RECONCILIATION_CANDIDATE` — potentially reusable Business knowledge, but must be reconciled against the independent subject-research baseline before promotion.
- `AQA_EXAM_TRUTH_CANDIDATE` — exact-course assessment evidence to preserve/reconcile.
- `LEARN_ASSET_CANDIDATE` — learner-facing teaching content requiring later dependency/assurance reconciliation.
- `PRACTICE_ASSET_CANDIDATE` — learner-facing practice content requiring later dependency/assurance reconciliation.
- `EXAM_PREP_CANDIDATE` — AQA-specific assessment/preparation content requiring later Exam Truth reconciliation.
- `ASSURANCE_EVIDENCE` — evidence of checks/findings/remediation; does not itself define educational truth.
- `HISTORICAL_ONLY` — useful historical pipeline/proof evidence not current educational authority.
- `BLOCKED_FROM_PROMOTION` — cannot presently be promoted to reusable/shared truth without additional evidence or assurance.

## Executive T1 position

The Business estate is substantial. Revision does **not** need to start from zero.

However, the estate is currently organised primarily around AQA 7132 rather than around a board-independent Business subject model. The strongest existing Course Truth contains 49 AQA-shaped knowledge nodes. Those nodes are a high-value reconciliation candidate, but they must not become the Subject Knowledge Foundation merely by being relabelled.

The current exact AQA Foundation has strong retained AI/deterministic assurance evidence, but qualified-human Foundation approval remains separate. The retained Content Factory Learn/Practice bundle has undergone multiple remediation cycles and the most recent corrected bundle still requires a fresh live re-assurance pass before it can be treated as clean asset evidence.

The learner runtime also contains an older/static Business pack and a small richer reading-first Learn treatment set. Those materials are separate from the retained Content Factory bundle and must not be mistaken for proof that the Content Factory assets are publication-ready.

## Inventory

### A. Source/provenance evidence

| Artifact/evidence | Identifier | Current classification | T1 treatment |
|---|---|---|---|
| AQA Business 7132 source seed | `src/content-factory/source-seeds/aqa-a-level-business-7132-2027.ts` | `PROVENANCE_EVIDENCE` + `SUBJECT_RECONCILIATION_CANDIDATE` | Preserve. Its educational content is independently authored/Revision-owned, but its taxonomy and mappings are AQA-first. Reconcile node-by-node against the independent Business baseline before any subject-level promotion. |
| Course source/coverage record | `content/business/aqa-a-level/SOURCE_AND_COVERAGE.md` | `AQA_MAPPING_CANDIDATE` + historical provenance | Preserve for exact AQA mapping/Exam Truth evidence. Do not use as the generic Business subject denominator. |
| Current Foundation Source Licence Register | Foundation fingerprint `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee` | `PROVENANCE_EVIDENCE` | Preserve exact rights/source classifications. Reuse only for the artifacts/sources it actually governs. |

Current Foundation evidence records one Revision-owned Business course-truth seed plus structured AQA identity/assessment facts and AQA specification/paper sources under restricted/reference-only treatment. This is useful exact-course provenance but is not, by itself, an independent cross-board subject research base.

### B. Exact AQA Board Alignment / specification coverage

| Artifact/evidence | Identifier | Current classification | T1 treatment |
|---|---|---|---|
| Coverage model / 49 governed obligations | current Foundation `1508ce...` | `AQA_MAPPING_CANDIDATE` | Preserve as exact-course requirement evidence. Later map each requirement to independent subject nodes/facets. |
| Board Alignment | current Foundation `1508ce...` | `AQA_MAPPING_CANDIDATE` | Preserve. Keep board identity/component facts out of generic subject truth. |
| Legacy static source/coverage blueprint | `content/business/aqa-a-level/SOURCE_AND_COVERAGE.md` | `AQA_MAPPING_CANDIDATE` | Retain as historical/current implementation evidence; reconcile against the newer structured Foundation rather than treating as the new denominator. |

### C. Course Truth / CKM educational content

| Artifact/evidence | Identifier | Current classification | T1 treatment |
|---|---|---|---|
| Current AQA Course Knowledge Model | Foundation `1508ce...`; 49 nodes | `SUBJECT_RECONCILIATION_CANDIDATE` | High-value reuse candidate. Do **not** promote wholesale. Reconcile each node/facet against the sealed independent Business baseline; classify `REUSE`, `EXPAND`, `SPLIT`, `MERGE`, `CORRECT`, `COURSE_SPECIFIC` or `REJECT`. |
| AQA Course Truth source seed | source ID `revision-owned-business-7132-course-truth-seed-v1` | `SUBJECT_RECONCILIATION_CANDIDATE` | Preserve prose/facts/provenance as candidate evidence. Stable future subject IDs should not automatically inherit the current `BUS-7132-*` course-centric structure. |
| Earlier Foundation live proof | run `34164079299`; artifact `10033605264`; Foundation fingerprint `0d908685...` | `HISTORICAL_ONLY` / possible provenance comparison | Preserve as historical Foundation evolution evidence. It is superseded by the later current AQA Foundation evidence for forward reconciliation. |

Known current CKM profile from retained Foundation evidence:

- 49 Course Truth nodes;
- 8 calculation-classified nodes and 41 knowledge-classified nodes;
- 21 retained formulas across formula-bearing nodes;
- 65 misconception entries; and
- 114 application-context entries.

These counts demonstrate substantial existing educational work. They do **not** prove that the AQA-shaped set is a comprehensive board-independent Business subject universe.

### D. Exact AQA Exam Truth / assessment evidence

| Artifact/evidence | Identifier | Current classification | T1 treatment |
|---|---|---|---|
| Assessment Blueprint | Foundation `1508ce...` | `AQA_EXAM_TRUTH_CANDIDATE` | Preserve and reconcile against current AQA identity/specification before reuse. Do not move into Subject Knowledge Foundation. |
| Question Families | Foundation `1508ce...` | `AQA_EXAM_TRUTH_CANDIDATE` | Preserve for exact AQA Exam Truth. |
| Board Alignment assessment facts | Foundation `1508ce...` | `AQA_EXAM_TRUTH_CANDIDATE` | Preserve as structured exact-course assessment input. |
| Runtime Paper 1 / 2 / 3 simulations | `content/business/aqa-a-level/paper-{1,2,3}/exam.ts` | `EXAM_PREP_CANDIDATE` | Preserve separately from Exam Truth. Later validate against reconciled Exam Truth and applicable asset assurance. |
| Shared runtime exam technique | `content/business/aqa-a-level/shared/exam-technique.ts` | `EXAM_PREP_CANDIDATE` | Preserve; AQA-specific by default. |

### E. Current runtime/static learner content

The current product pack imports shared course content into all three AQA papers, consistent with the course-level content architecture. Current shared files include:

- `topics.ts`;
- `learn.ts`;
- `learning.ts`;
- `flashcards.ts`;
- `questions.ts`;
- `quantitative.ts`;
- `network-practice.ts`;
- `cases.ts`; and
- `exam-technique.ts`.

Each paper directory adds its own manifest and exam simulation.

| Runtime material | Current classification | T1 treatment |
|---|---|---|
| Topic/section content in `topics.ts` | `SUBJECT_RECONCILIATION_CANDIDATE` and/or `LEARN_ASSET_CANDIDATE` depending field | Preserve, but separate underlying educational truth from learner presentation. Reconcile truth against independent baseline before reuse. |
| Rich reading-first pages in `shared/learn.ts` | `LEARN_ASSET_CANDIDATE` | Preserve as authored learner assets. They currently cover a limited representative subset rather than the full comprehensive final Learn estate. Later bind them to subject nodes/facets and Course Learning Blueprint obligations. |
| Formulas/topic links in `learning.ts` | `SUBJECT_RECONCILIATION_CANDIDATE` + learner support candidate | Preserve and reconcile formula/method truth against independent quantitative register. |
| Flashcards | `PRACTICE_ASSET_CANDIDATE` | Preserve; later bind to subject nodes and evidence types. |
| Questions | `PRACTICE_ASSET_CANDIDATE` | Preserve; later check subject capability/depth and any assessment-shaped dependencies. |
| Quantitative/data drills | `PRACTICE_ASSET_CANDIDATE` | Preserve; later recompute/validate methods and bind to quantitative nodes. |
| Network practice | `PRACTICE_ASSET_CANDIDATE` | Preserve; later validate subject method and AQA relevance separately. |
| Case studies | `PRACTICE_ASSET_CANDIDATE` and potentially `EXAM_PREP_CANDIDATE` | Preserve; classification depends on whether each item tests generic subject application or AQA-shaped exam demand. |
| Exam technique | `EXAM_PREP_CANDIDATE` | Preserve as exact-course material. |
| Paper simulations | `EXAM_PREP_CANDIDATE` | Preserve as exact-course assets; do not use them to define Subject Truth. |

PR #383 deliberately introduced richer reading-first teaching pages while retaining whole-course fallback content. Its governing implementation statement explicitly says that fallback coverage is a migration bridge, not proof that old section bullets meet the final comprehensive teaching standard. It also explicitly did not publish the retained Content Factory Business bundle.

### F. Retained Content Factory Learn / Practice asset estate

#### Initial Foundation-native bundle

- Foundation fingerprint: `1508ce1cefdfad1082f1a388fb1ca6722499429026f705c0d6a2ace023e556ee`
- 49 work units;
- 49 Learn outputs;
- 49 Practice outputs;
- historical planner: `foundation-work-unit-planner-v1`.

Classification: `HISTORICAL_ONLY` as the current learning-design reference because it predates the approved Course Learning Blueprint treatment model. Individual content may still be useful as comparison evidence, but the bundle should not be promoted wholesale.

#### Blueprint-v2 generated bundle

- run `35789048198`;
- artifact `10723573827`;
- 49 work units;
- Blueprint-v2 generation/evidence-binding path;
- exact Foundation fingerprint `1508ce...`.

Classification: `LEARN_ASSET_CANDIDATE` + `PRACTICE_ASSET_CANDIDATE`.

Treatment: preserve the bundle and exact dependencies. It remains AQA-foundation-bound and must later be reconciled to the new subject-node/course-projection dependencies.

#### Independent asset assurance

- run `35836291040`;
- artifact `10739757463`;
- deterministic checks passed;
- fresh independent semantic review produced 20 unresolved blocking/material findings across 17 remediation targets;
- state `fail_hold`.

Classification: `ASSURANCE_EVIDENCE`.

#### Remediation chain

Retained targeted-remediation evidence includes multiple cycles rather than one clean pass:

1. first targeted remediation: run `35996162981`, artifact `10806996448`;
2. subsequent fresh re-assurance exposed remaining regression findings;
3. second remediation produced a further corrected bundle;
4. a later re-assurance still exposed a remaining material Practice defect; and
5. cycle-3 remediation run `36190542172`, artifact `10887772691`, produced corrected bundle fingerprint `93ff40d4343ef46527a33e2f360f3651e1eb0952c5a04545b6ef605942d69e57`.

PR #393 records the governed next step after that cycle: run fresh deterministic and independent re-assurance against `93ff40d...`.

**Current T1 conclusion:** the latest corrected Content Factory learner bundle is an important asset candidate, but T1 must not mark it `REUSE_UNCHANGED` or `ASSURED`. Final fresh live re-assurance against the cycle-3 result is not evidenced as complete in the retained current-main chain inspected for this audit.

### G. Assurance / review records

| Evidence | Current classification | T1 treatment |
|---|---|---|
| Current exact-AQA Foundation deterministic assurance | `ASSURANCE_EVIDENCE` | Preserve against exact Foundation fingerprint. |
| Current independent Foundation review | `ASSURANCE_EVIDENCE` | Preserve. It supports exact AQA Foundation quality; it does not prove generic cross-board Subject Foundation completeness. |
| Current external-source Foundation challenge | `ASSURANCE_EVIDENCE` | Preserve. Same scope limitation as above. |
| `ai_assured` AQA Foundation evidence | `ASSURANCE_EVIDENCE` | Preserve exact lifecycle state. Do not reinterpret as qualified-human approval. |
| Learn/Practice independent assurance + remediation cycle outputs | `ASSURANCE_EVIDENCE` | Preserve complete history. Use to avoid reintroducing known defects and to determine whether prior assurance remains applicable after rebinding. |
| Older August static-pack assurance docs | `HISTORICAL_ONLY` / current-runtime evidence subject to reconciliation | Preserve as dated evidence. Do not let older pack assurance override current Foundation/Subject Foundation gates. |

## T1 promotion rules established by this inventory

1. **No AQA-shaped knowledge object is promoted directly into the Subject Knowledge Foundation before comparison with the independent Business research baseline.**
2. Existing exact-course assurance remains valid evidence for the exact artifacts/fingerprints it reviewed, but does not automatically transfer to a new subject-level representation.
3. Board Alignment, specification coverage and Exam Truth remain exact-course evidence.
4. Existing learner assets are preserved as candidates; they are not used as the truth denominator.
5. Existing site visibility is not publication/assurance evidence for retained Content Factory assets.
6. A valid existing explanation/practice item should be reused where later dependency reconciliation and assurance permit it; no regeneration merely for orchestration conformity.
7. The full remediation history remains evidence and must not be collapsed into a statement that the latest bundle is clean until a final applicable re-assurance pass proves that state.

## Material T1 gaps still open

T1 is **not yet complete**. The following remain before its exit condition is satisfied:

- item-level ledger tying each existing CKM node to its exact source/provenance and previous assurance evidence;
- item-level ledger for current runtime Learn/Practice/Exam Prep assets;
- item-level ledger for the retained Blueprint-v2 Learn/Practice bundle and latest cycle-3 corrected bundle;
- exact reconciliation between static/runtime learner assets and retained Content Factory learner assets, which are separate estates;
- explicit identification of any material artifact currently stored outside repository files and the retained workflow artifacts already identified;
- verification that no later live re-assurance run against `93ff40d...` exists beyond the current-main evidence inspected here; and
- machine-readable completion of the inventory classifications once those item-level links are assembled.

## T1 next action

Continue inventory extraction without modifying educational content, while the independent research baseline is run in a fresh context.

The next T1 increment should produce the machine-readable item ledger. When the independent baseline returns, the controlled process moves to **reconciliation**, not blind generation.
