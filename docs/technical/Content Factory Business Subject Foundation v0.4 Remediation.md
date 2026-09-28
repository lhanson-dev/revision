# Content Factory Business Subject Foundation v0.4 Remediation

**Status:** Technical implementation record  
**Date:** 28 September 2026  
**Normative authority:** `80-company-workflows/Content Factory Subject Knowledge Foundation and Course Projection Amendment.md`, `80-company-workflows/Content Accuracy Assurance Gate.md`, `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`

## Purpose

Record the smallest-safe remediation after Business Subject Foundation fresh reassurance run `36422620778` against `main` `fc70945bb2282fe62f158b3966034235300fe980` and v0.3 candidate fingerprint `3d8f7e09e196858b9323f880c595b963d26cc9abc1d249a5aaf6028997df4a0f`.

The retained run artifact is `10971300946`, digest `sha256:e504b28cea1054632a7bc9ac4a5c2d92fa8658aad4830ee734a43c845b3ea09b`.

The run did not reach a whole-subject decision. Business Foundations, Marketing and Finance passed. Operations completed `fail_hold`. People and Organisation returned a substantive review but deterministic URL validation rejected it before the domain could be accepted.

## Genuine findings carried into v0.4

Three material source-support findings require remediation. The teaching itself is retained.

1. `BUS-OPS-003` — direct promotion support was insufficient for operational capacity, bottlenecks and the capacity-utilisation calculation.
2. `BUS-EVI-008` — direct promotion support was insufficient for the definition/calculation of project total float.
3. `BUS-PEO-003` — direct promotion support was insufficient for selection validity/reliability plus fairness, bias and accessibility.

v0.4 adds narrowly mapped promotion-safe evidence for those claims only. It does not rewrite unrelated nodes, alter domain membership, lower finding severity, or convert the incomplete v0.3 run into a PASS.

## Added promotion evidence

The v0.4 overlay records six new sources checked on 28 September 2026:

- Dengjun Zhang / Wiley, `Capacity utilization under credit constraints`, open-access CC BY 4.0 — capacity utilisation as actual/current output relative to maximum/potential output;
- Butrat & Supsomboon / Advances in Production Engineering & Management, `A Plant Simulation approach for optimal resource utilization`, CC BY 4.0 — bottleneck as a capacity-constraining resource;
- Wang, Chen & Lin / MDPI Healthcare, `A Collaborative and Ubiquitous System for Fabricating Dental Parts Using 3D Printing Technologies`, CC BY 4.0 — project float/slack definition and latest-minus-earliest calculation relationship;
- Kelechi Ekuma / Canadian Center of Science and Education, `The Importance of Predictive and Face Validity in Employee Selection...`, CC BY 4.0 — validity/reliability and predictive relevance in employee selection;
- UK Office for Equality and Opportunity, `Use fair and structured interview techniques`, OGL v3 — job-relevant structured selection, standardised scoring, fairness and bias reduction;
- GOV.UK, `Recruitment and disabled people: Reasonable adjustments`, OGL v3 — accessibility and reasonable adjustment in recruitment.

The source records retain the exact URLs, educational role, licence profile, restrictions, checked date and checker method required by the source-rights standard.

## Candidate composition

`v0.4-reassurance-remediation` composes over the exact v0.3 fingerprint rather than rewriting v0.3 history.

The v0.4 overlay is source-only:

- no node teaching patches;
- no node/domain moves;
- no removal of prior promotion sources;
- new sources are added only to `BUS-OPS-003`, `BUS-EVI-008` and `BUS-PEO-003`;
- promotion remains `NOT_YET_MADE`;
- fresh independent reassurance remains mandatory.

The deterministic provenance validator compares v0.3 and v0.4 and fails if teaching content or domain membership changes, if an untargeted node gains a source, if any prior source is removed, if a new source is not rights-safe/promotion-eligible, or if board/reference-only evidence enters subject truth.

## URL-equivalence control correction

Run `36422620778` also exposed a runner defect unrelated to Business content. The registered LibreTexts communication URL contained percent-encoded path characters (`%28`, `%29`, `%3A`) while the reviewer returned the semantically equivalent decoded path. The old check compared raw pathname strings and rejected the evidence after both permitted fresh attempts.

The v0.4 runner now compares canonical decoded path **segments** while retaining the original source boundary:

- host must still match exactly after the existing `www` normalisation;
- the evidence path must equal the registered path or be a true child path by segment;
- encoded and decoded forms of safe characters compare equivalently;
- decoded slash/backslash, dot-segment and malformed path tricks fail closed;
- sibling paths and different hosts remain rejected.

The no-spend self-test includes the exact LibreTexts encoded/decoded regression plus sibling-path, encoded-slash and different-host rejection cases.

## Assurance and next gate

Normal CI must pass deterministic v0.4 provenance validation and the no-spend reassurance self-test before merge approval is requested.

After Founder-approved merge, the next action is a completely fresh independent Business Subject Foundation reassurance against the exact new `main` SHA and v0.4 fingerprint. The prior domain passes are evidence only; the fresh run must still complete all nine domains and the whole-subject integration review with no blocking/material finding to produce a genuine automated PASS.

A PASS does not itself promote the reusable Subject Knowledge Foundation. Promotion remains a separate governed decision, followed by exact AQA 7132 specification mapping, Course Truth and Exam Truth.

## Documentation impact

This change implements existing Content Factory and source-provenance authority. No normative authority changes. v0.2/v0.3 research and assurance evidence remain historically unchanged.
