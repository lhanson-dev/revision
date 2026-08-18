# AQA A-level Business 7132 — Independent Assurance Revalidation

**Review date:** 2026-08-18  
**PR:** #44  
**Reviewed branch:** `content/aqa-a-level-business-7132`  
**Reviewed learner-content head:** `bc757ccaf41477645d86d2f68cb99fcd84282eb2`  
**Packs:** `business-aqa-a-level-7132-paper-1`, `business-aqa-a-level-7132-paper-2`, `business-aqa-a-level-7132-paper-3`  
**Governing control:** `80-company-workflows/Content Accuracy Assurance Gate.md`  
**Review contract:** `content/business/aqa-a-level/INDEPENDENT_REVIEW_BRIEF.md`

## Independent reviewer decision

**CONDITIONAL PASS**

The complete learner-facing AQA 7132 pack was independently re-reviewed against current official AQA authority rather than accepting the generation-time assurance record as evidence. No unresolved **blocking** or **material** educational-content finding was identified.

The remaining limitations are non-critical for the restricted pilot:

1. the current exam schema has one stimulus field, so the Paper 2 simulation presents the three compulsory data-response contexts as clearly separated blocks inside that field rather than reproducing the physical paper layout exactly;
2. qualified human Business subject-specialist review remains pending and is still required before Revision treats this pack as a mature commercial benchmark;
3. at the reviewed head, CI had not completed because npm crashed internally during dependency installation before any project check ran. This is a publication-control blocker, not an educational-content finding, and is tracked separately below.

Subject to green CI on the publication-status commit, the independent educational review supports moving the three packs from `preview` to `available` for the restricted pilot. This decision does **not** approve merge and does **not** claim human benchmark approval.

## Reviewer method and independence

The review was performed from the PR branch as a fresh adversarial pass. The earlier `ASSURANCE_2026-08-18.md` was treated as historical working evidence, not as proof of correctness.

The reviewer independently:

- read the current approved repository authority and the Content Accuracy Assurance Gate;
- read the independent-review brief and source/coverage blueprint;
- checked all ten AQA subject-content areas against current official AQA 7132 pages;
- checked the current paper structures, assessment objectives and quantitative-skills requirements;
- reviewed the complete learner-facing topic, formula, topic-link, flashcard, MCQ, quantitative drill, network-practice, case-study, exam-technique and simulator surfaces;
- reviewed all three manifests, pack indexes and structural tests;
- recomputed every stored learner-facing numerical result in the shared questions/drills and all three simulators;
- recomputed each simulator mark total and stored AO total;
- challenged high-risk content including ratio interpretation, investment appraisal, PED/YED, Porter, Ansoff, economies/synergy/overtrading, internationalisation, Kotter and Schlesinger, Handy, network analysis and planned/emergent strategy;
- checked the PR's CI run and install failure independently from GitHub Actions metadata/logs.

No learner content was replaced merely to produce different wording. Corrections are only authorised where a verified finding requires one.

## Current official sources checked

Primary current authority:

- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/specification-at-a-glance
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/what-is-business
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/managers-leadership-and-decision-making
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/marketing-management
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/operational-management
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/financial-management
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/human-resource-management
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/analysing-the-strategic-position-of-a-business
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/choosing-strategic-direction
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/strategic-methods-how-to-pursue-strategies
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/subject-content/managing-strategic-change
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/scheme-of-assessment
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/specification/annex-quantitative-skills-in-business
- https://www.aqa.org.uk/resources/business/as-and-a-level/business-7131-7132/teach/command-words
- https://www.aqa.org.uk/resources/business/as-and-a-level/business-7131-7132/teach/teaching-guide-7ps-of-the-marketing-mix
- https://www.aqa.org.uk/resources/business/as-and-a-level/business-7131-7132/teach/teaching-guide-analysing-the-strategic-position-of-a-business-a-level-only-podcast
- https://www.aqa.org.uk/subjects/business/a-level/business-7132/assessment-resources

Official historical assessment material was used only to triangulate assessment/formula convention where the current HTML specification names the required ratio but does not print a formula definition. The current specification and teaching resources remain the controlling curriculum authority.

**Source check date:** 2026-08-18.

## A1 — source-factual verification

### Result: PASS

The current AQA site still identifies 7132 as the outgoing A-level Business specification to be used for cohorts taking exams in 2027. The pack models all ten required areas, 3.1 through 3.10, and all three papers can assess the full course.

The paper metadata is correct:

- Paper 1: 2 hours, 100 marks, 33.3%; 15-mark MCQ section, 35 marks of short answer, then two 25-mark essay-choice sections;
- Paper 2: 2 hours, 100 marks, 33.3%; three compulsory data-response questions of approximately 33 marks each, with three or four parts;
- Paper 3: 2 hours, 100 marks, 33.3%; one compulsory case study followed by approximately six questions.

The shared course content was checked topic-by-topic against AQA. No material omission, specification drift or use of a superseded strategic model was found. The previously-added network-amendment practice now covers AQA's explicit requirement to understand, interpret and amend network diagrams and to identify the critical path and total float.

A minor terminology deviation remains in two learner records: `Physical environment/evidence` is used where AQA 7132 names the seventh marketing-mix element `physical environment`. The underlying concept is not wrong and AQA's own teaching resource describes the same physical customer environment, so this is classified minor rather than material. Exact AQA terminology is preferred in the next routine content tidy-up.

## A2 — derived educational explanation

### Result: PASS for restricted-pilot publication

The full shared learner surface was reviewed, not sampled:

- 10 topic areas;
- 31 formula records;
- 22 cross-topic reasoning links;
- 100 flashcards;
- 50 MCQs;
- 25 quantitative/network drills;
- six guided cases;
- nine exam-technique guides.

No explanation was found that would materially teach a student the wrong Business rule. In particular:

- PED and YED are correctly presented as interpretation requirements for 7132, not coefficient-calculation requirements;
- ratios are consistently framed as contextual evidence rather than automatic good/bad thresholds;
- investment appraisal correctly distinguishes payback, ARR and NPV and repeatedly retains forecast/risk/context limitations;
- SWOT, Porter, Ansoff, force-field analysis and decision trees are treated as analytical frameworks rather than deterministic decision rules;
- the strategic-methods content covers the specified growth, scale/scope, synergy, overtrading, integration, innovation, internationalisation and digital-technology requirements;
- the strategic-change content covers Lewin, Kotter and Schlesinger, Handy, network analysis, planned/emergent strategy, drift, planning, contingency and crisis management;
- the six guided cases use varied large/small, UK/international, manufacturing/service and technology contexts and do not present fictional case facts as real-world evidence.

### Financial-ratio assurance

AQA's current 3.7 page requires ROCE, current ratio, gearing, payables days, receivables days and inventory turnover. AQA's current strategic-position teaching guide explicitly states that students must be able to calculate and interpret profitability, liquidity, gearing and efficiency ratios and stresses contextual interpretation.

The formula conventions used by Revision are internally coherent with that AQA course convention:

- ROCE = operating profit ÷ capital employed × 100;
- current ratio = current assets ÷ current liabilities;
- gearing = non-current liabilities ÷ capital employed × 100;
- receivables days = trade receivables ÷ revenue × 365;
- payables days = trade payables ÷ cost of sales × 365;
- inventory turnover = cost of sales ÷ average inventory.

No contradictory formula or calculation was found in the learner-facing pack.

## A3 — original exam practice

### Result: PASS for restricted-pilot publication

All six guided cases and all three original 100-mark simulations were reviewed in full.

### Paper 1

- structure: 15 + 35 + 25 + 25 = 100 marks;
- the two 25-mark sections each provide a genuine one-from-two essay choice;
- short-answer and essay command demand is plausible for AQA 7132;
- stored AO total: AO1 30 / AO2 30 / AO3 21 / AO4 19;
- this sits within the component-level AO ranges published by AQA when translated to a 100-mark paper;
- the simulator clearly states that it is Revision-authored and that its marking guidance is not an official AQA mark scheme.

### Paper 2

- three independent data-response blocks total 33 + 33 + 34 = 100 marks;
- each block has four parts and uses its own stimulus;
- quantitative, explanation, analysis and evaluation demands are credible;
- stored AO total: AO1 21 / AO2 30 / AO3 29 / AO4 20, within AQA's component-level ranges;
- the one-`caseHtml` UI limitation is disclosed and does not misrepresent the simulation as an exact physical-paper replica.

### Paper 3

- six integrated questions total 12 + 12 + 16 + 16 + 20 + 24 = 100 marks;
- the case supports cross-functional and strategic reasoning rather than six isolated topic prompts;
- stored AO total: AO1 20 / AO2 18 / AO3 31 / AO4 31, consistent with AQA's stronger AO3/AO4 Paper 3 weighting;
- the marking guidance repeatedly requires case evidence, competing arguments and supported judgement rather than generic model recital.

No material mark-total, AO-total, case-data or marking-guidance contradiction was found.

## Independent deterministic recomputation

All stored numerical answers were recomputed from the learner-facing inputs.

### Shared MCQs

- £680,000 − £612,000 = £68,000 profit;
- 8,000,000 × £2.75 = £22,000,000 market capitalisation;
- 0.7 × £140,000 + 0.3 × £20,000 = £104,000 expected value;
- £104,000 − £65,000 = £39,000 net gain;
- £9m ÷ £60m × 100 = 15% market share;
- 42,000 ÷ 50,000 × 100 = 84% capacity utilisation;
- £360,000 ÷ 90,000 = £4 unit cost;
- £48 − £30 = £18 contribution per unit;
- £270,000 ÷ £18 = 15,000-unit break-even output;
- 19,500 − 15,000 = 4,500-unit margin of safety;
- £22,000 + £74,000 − £81,000 = £15,000 closing cash balance;
- 30 ÷ 200 × 100 = 15% labour turnover;
- £2.4m ÷ £12m × 100 = 20% employee costs as a percentage of turnover;
- £3m ÷ £20m × 100 = 15% ROCE;
- £4.8m ÷ £3.2m = 1.5:1 current ratio;
- £9m ÷ £30m × 100 = 30% gearing.

### Shared quantitative/network drills

- £7.2m ÷ £48m × 100 = 15% market share;
- (£58m − £50m) ÷ £50m × 100 = 16% market growth;
- index 100→124 versus 100→116 supports the stated relative-share interpretation when the market definition is common;
- 0.55 × £240,000 + 0.45 × £80,000 = £168,000 expected value;
- £168,000 − £110,000 = £58,000 net gain;
- 2,160 ÷ 2,400 × 100 = 90% capacity utilisation;
- £525,000 ÷ 75,000 = £7 unit cost;
- £27 − £12 = £15 contribution per unit;
- £180,000 ÷ £15 = 12,000-unit break-even output;
- 15,500 − 12,000 = 3,500-unit margin of safety;
- £18,000 + £62,000 − £75,000 = £5,000 closing cash balance;
- £840,000 ÷ £12m × 100 = 7% operating profit margin;
- 42 ÷ 280 × 100 = 15% labour turnover;
- £2.1m ÷ £8.4m × 100 = 25% employee costs as a percentage of turnover;
- £2.4m ÷ £16m × 100 = 15% ROCE;
- £5.4m ÷ £3.6m = 1.5:1 current ratio;
- £7.5m ÷ £25m × 100 = 30% gearing;
- £2.4m ÷ £18m × 365 = 48.67 days, approximately 49 receivables days;
- £1.6m ÷ £9.6m × 365 = 60.83 days, approximately 61 payables days;
- £9.6m ÷ £1.2m = 8 inventory turns per year;
- payback: after two years £300,000 is recovered; £100,000 ÷ £180,000 = 0.556 years = 6.67 months, giving approximately 2 years 7 months;
- ARR: (£600,000 − £400,000) ÷ 4 = £50,000 average annual profit; £50,000 ÷ £400,000 × 100 = 12.5%;
- NPV: £91,000 + £166,000 + £225,000 + £272,000 − £600,000 = +£154,000;
- network amendment: 18 + 7 = 25 days, which becomes longer than the unchanged 23-day path;
- productivity: 18,000 ÷ 90 = 200 units/employee; 21,000 ÷ 84 = 250 units/employee; 250 is 25% higher than 200.

### Simulator calculations

**Paper 1**

- contribution = £40 − £24 = £16; £192,000 ÷ £16 = 12,000 units break-even;
- £3.6m ÷ £24m × 100 = 15% ROCE;
- 0.6 × £200,000 + 0.4 × £50,000 = £140,000 expected value; minus £90,000 cost = £50,000 net gain;
- marks = 15 + 35 + 25 + 25 = 100;
- AO total = 30 + 30 + 21 + 19 = 100.

**Paper 2**

- £480,000 ÷ £6m × 100 = 8% operating profit margin;
- £9m ÷ £30m × 100 = 30% gearing;
- 0.55 × £2.4m + 0.45 × £0.8m = £1.68m expected value; minus £1.1m = £0.58m net gain;
- group marks = 33 + 33 + 34 = 100;
- AO total = 21 + 30 + 29 + 20 = 100.

**Paper 3**

- £4.8m ÷ £48m × 100 = 10% operating profit margin;
- £4.8m ÷ £32m × 100 = 15% ROCE;
- £9m ÷ £6m = 1.5:1 current ratio;
- £12m ÷ £32m × 100 = 37.5% gearing;
- question marks = 12 + 12 + 16 + 16 + 20 + 24 = 100;
- AO total = 20 + 18 + 31 + 31 = 100.

**Deterministic result:** PASS. No arithmetic contradiction was found.

## Required issue register

| ID | Content/file/item | Severity | Type | Finding | Verification source/calculation | Required correction | Status |
|---|---|---|---|---|---|---|---|
| AIR-001 | Full course coverage / `shared/topics.ts` | no issue | A1 curriculum coverage | All ten 7132 areas are represented and the high-risk named models/topics match current AQA scope. | Current AQA 3.1–3.10 pages and subject-content overview. | None. | Closed — pass. |
| AIR-002 | Marketing mix wording / `shared/topics.ts`, `shared/flashcards.ts` | minor | A1 terminology precision | Two records say `Physical environment/evidence`; AQA 7132 names this element `physical environment`. The learner concept is still materially correct. | Current AQA 3.3 page and AQA 7Ps teaching guide. | Prefer exact AQA term `Physical environment` at next content tidy-up; not a pilot blocker. | Open — accepted minor limitation. |
| AIR-003 | PED/YED | no issue | A1/A2 specification fidelity | Pack correctly teaches interpretation, not coefficient calculation. | Current AQA 3.3 page explicitly says students do not need to calculate these. | None. | Closed — pass. |
| AIR-004 | Strategic financial ratios / `shared/learning.ts`, flashcards, drills, simulations | no issue | A1/A2 formula and interpretation | Required ratios are present; formula use is internally consistent; learner explanations correctly avoid automatic good/bad thresholds. | Current AQA 3.7 page, AQA strategic-position teaching guide, independent recomputation. | None. | Closed — pass. |
| AIR-005 | Investment appraisal / shared drills and Paper 3 | no issue | A1/A2 quantitative reasoning | Payback, ARR and NPV treatment is consistent and calculation examples recompute correctly. | Current AQA 3.7 and quantitative-skills requirements; independent arithmetic above. | None. | Closed — pass. |
| AIR-006 | Network analysis / `shared/network-practice.ts` | no issue | A1/A2 curriculum coverage | The current pack now includes explicit amendment of path timings as well as critical-path interpretation. | Current AQA 3.10 requirement; 18 + 7 = 25 > 23. | None. | Closed — prior material omission remains resolved. |
| AIR-007 | Six guided cases / `shared/cases.ts` | no issue | A2/A3 educational reasoning | No material factual contradiction, false certainty or inappropriate automatic decision rule found across the six cases. | Full case review against AQA subject-content expectations. | None. | Closed — pass. |
| AIR-008 | Paper 1 simulator | no issue | A3 assessment authenticity | 100-mark headline structure, essay choice, command demand and overall AO profile are plausible and correctly labelled as Revision-authored. | Current AQA specification-at-a-glance and scheme of assessment; mark/AO recomputation. | None. | Closed — pass. |
| AIR-009 | Paper 2 simulator stimulus layout | minor | A3 implementation limitation | AQA uses three compulsory data-response questions; Revision's current schema stores one stimulus field. Three distinct stimuli are separated inside that field and the limitation is disclosed. | AQA specification-at-a-glance; `paper-2/exam.ts`. | No content correction required. Preserve explicit non-replica disclosure until the exam schema can model separate stimuli. | Open — accepted pilot limitation. |
| AIR-010 | Paper 2 simulator marks/AOs/numerics | no issue | A3 assessment integrity | Three blocks total 33/33/34; all stored calculations and AO totals recompute. | Independent arithmetic and `content.test.ts`; AQA scheme of assessment. | None. | Closed — pass. |
| AIR-011 | Paper 3 simulator | no issue | A3 assessment integrity | Six integrated questions total 100; financial calculations and AO totals recompute; high AO3/AO4 demand is consistent with AQA component weighting. | Independent arithmetic; current AQA scheme of assessment. | None. | Closed — pass. |
| AIR-012 | Shared numerical content | no issue | deterministic assurance | Every stored learner-facing numerical answer reviewed recomputes to the stored result. | Full recomputation recorded above. | None. | Closed — pass. |
| AIR-013 | Human subject-specialist review | minor | assurance maturity | Qualified human review remains pending. This prevents mature benchmark claims but is not a restricted-pilot publication blocker under the approved workflow. | Content Pack Production and Assurance Workflow; `HUMAN_REVIEW_PACK.md`. | Complete human review before benchmark promotion. | Open — later-stage gate. |
| AIR-014 | CI run #124 at reviewed head | blocking | publication control / CI | Dependency installation crashed before typecheck, lint, tests, build or browser assurance ran. The run therefore provides no structural pass. | GitHub Actions run 32170867348, job 95821425520: Node 22.14.0, npm 10.9.2, `npm install --ignore-scripts --no-audit --no-fund`, internal error `Cannot read properties of null (reading 'edgesOut')`. | Trigger a clean run from a new branch commit. If reproducible, remediate the npm dependency-install path before publication. | Open at time of this record; must be resolved before `available`. |

## CI diagnosis at reviewed head

GitHub Actions run **#124** (`32170867348`) did not fail a project test. It failed inside npm's dependency graph construction during `npm install` on Node 22.14.0 / npm 10.9.2 with:

`Cannot read properties of null (reading 'edgesOut')`

The repository has no committed `package-lock.json`, and the workflow uses `npm install`, so CI resolves a fresh dependency graph on each run. The exact `edgesOut` failure is an npm/Arborist internal crash pattern rather than a normal dependency-resolution error with an actionable package conflict. Because all subsequent quality steps were skipped, this run must be treated as **no CI result**.

The first remediation is a clean rerun from the new assurance commit. If the same crash repeats, the engineering fix should make dependency installation reproducible rather than repeatedly trusting a floating install graph: create and commit a lockfile under a controlled npm version and use `npm ci` in CI, or otherwise pin a verified npm version/workflow that installs the committed dependency set reliably. Any CI workflow change must be separately validated across the full suite.

## Documentation-impact check

This revalidation does not change normative product, curriculum or engineering policy. It applies existing authority and records evidence alongside the content. The historical `ASSURANCE_2026-08-18.md` is deliberately left intact rather than rewritten to make its earlier HOLD decision appear to have been made later.

If the CI blocker is cleared and the manifests are promoted to `available`, update only the implementation/status records and structural status assertion needed to reflect that current state. Human-review history remains separate.

## Publication recommendation

**Educational gate:** CONDITIONAL PASS for restricted pilot.  
**Blocking/material educational findings:** none unresolved.  
**Pilot limitations:** AIR-002, AIR-009 and AIR-013 are non-critical and explicit.  
**Publication control:** do not promote to `available` until AIR-014 is closed by a green full CI run.  
**Merge:** not approved or performed by this record.
